import * as He from "./001-three-a973dc20bf0957e55145ef9e6b9c97d50275b224b1d81a57603249dd6750ab96.js";
function fc(e) {
  let t = e.schedule ?? ((b, R) => void setTimeout(b, R)),
    r = e.warn ?? (b => console.warn(b)),
    n = [],
    o = new Set(),
    a = new Set(),
    s = new Set(),
    i = !1,
    l = !1,
    p = b => {
      try {
        return e.sdk()?.isUnlocked(b) === !0;
      } catch {
        return !1;
      }
    },
    m = b => {
      for (let R of [...s]) try {
        R(b);
      } catch (v) {
        r(`[achievements] an onUnlocked listener threw: ${String(v)}`);
      }
    },
    E = () => {
      l || (l = !0, t(() => {
        l = !1, y();
      }, 15e3));
    },
    y = async () => {
      if (i) return;
      let b = e.sdk();
      if (!(!b || !e.active())) {
        i = !0;
        try {
          for (; n.length > 0 && e.active();) {
            let R = n[0],
              v = await b.unlock(R).catch(() => null);
            if (v?.ok) {
              n.shift(), o.add(R), v.unlocked && m(R);
              continue;
            }
            if (v?.code === "not_found" || v?.code === "incorrect") {
              n.shift(), a.add(R), r(v.code === "not_found" ? `[achievements] "${R}" is not declared in remix.json achievements; nothing was unlocked.` : `[achievements] "${R}" asks for an answer; world.achievements never sends one.`);
              continue;
            }
            v && E();
            break;
          }
        } finally {
          i = !1;
        }
      }
    };
  return {
    unlock(b) {
      typeof b != "string" || !b || o.has(b) || a.has(b) || n.includes(b) || p(b) || (n.push(b), y());
    },
    has(b) {
      return o.has(b) || n.includes(b) || p(b);
    },
    onUnlocked(b) {
      return s.add(b), () => {
        s.delete(b);
      };
    },
    arrived() {
      y();
    }
  };
}
function mc(e, t) {
  return e.mode !== "active" || !e.arrival || t.has(e.arrival.id) ? null : e.arrival;
}
function hc(e, t) {
  let r = e.find(o => o.destinationGameId === t.gameId);
  return r ? r.id : e.find(o => o.destinationGameId === null && o.target !== null && (o.target === t.gameId || o.target === t.slug))?.id ?? null;
}
function gc(e, t) {
  if (e.kind === "follow") return e.near ? {
    type: "follow",
    near: e.near
  } : {
    type: "spawn"
  };
  if (e.kind === "entry" || !e.from) return {
    type: "spawn"
  };
  let r = hc(t, e.from);
  return r ? {
    type: "portal",
    portalId: r
  } : {
    type: "return",
    card: e.from
  };
}
function Ri(e, t) {
  return [...t.trail].reverse().find(r => r.gameId === e) ?? (t.previousWorld?.gameId === e ? t.previousWorld : null);
}
function bc(e, t, r) {
  let n = Ri(e, t) ?? {
      gameId: e,
      slug: null,
      name: "Previous world",
      creator: null,
      coverUrl: null
    },
    o = hc(r, n);
  return o ? {
    type: "portal",
    portalId: o
  } : {
    type: "return",
    card: n
  };
}
var ki = (e, t, r) => Math.min(r, Math.max(t, e));
function yc(e, t, r = {}) {
  let n = r.offset ?? 1.2,
    o = r.maxSpeed ?? 16,
    [a, s] = r.pitchRange ?? [-.35, 1.2],
    i = Math.sin(e.yaw),
    l = Math.cos(e.yaw),
    p = ki(t?.speed ?? 0, 0, o),
    m = ki(t?.vy ?? 0, -8, 16);
  return {
    feet: [e.base[0] + i * n, e.base[1] + .05, e.base[2] + l * n],
    velocity: [i * p, m, l * p],
    yaw: e.yaw,
    camera: {
      eye: [...e.center],
      yaw: e.yaw,
      pitch: ki(t?.pitch ?? r.defaultPitch ?? .12, a, s)
    }
  };
}
var e0 = new Set(["KeyS", "ArrowDown"]);
function Si(e, t = !1) {
  return t ? [...e] : e.filter(r => !e0.has(r));
}
var Ec = 1e3,
  vc = 2;
var Bi = {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0
  },
  xc = {
    id: "local",
    name: "Player",
    purchasedItems: []
  },
  Tc = {
    player: xc,
    players: [xc],
    viewContext: "full_screen",
    contentSafeAreaInset: Bi,
    initialGameState: null
  },
  t0 = 5e3,
  r0 = ["pointerdown", "keydown", "touchend"],
  pn = null,
  Mi = null,
  Ci = null,
  Hi = !1,
  Gn = !1,
  Gr = {
    master: 1,
    music: 1,
    sfx: 1
  },
  un = null,
  Wn = null,
  Li = new Set(),
  Lo = null,
  Ii = new Set(),
  Oi = new Set();
function o0() {
  if (!un) return;
  let e = un.context.currentTime;
  for (let [t, r] of [[un.output, Gn ? 0 : Gr.master], [un.music, Gr.music], [un.sfx, Gr.sfx]]) t.gain.cancelScheduledValues(e), t.gain.setValueAtTime(t.gain.value, e), t.gain.linearRampToValueAtTime(r, e + .05);
}
function Ac(e) {
  let t = e !== Gn;
  if (Gn = e, o0(), t) for (let r of [...Oi]) r(e);
}
var Ai = !1,
  wc = null;
var Pc = Number.NEGATIVE_INFINITY,
  Wr = null,
  Pi = null,
  Vi = !1,
  Br = !1,
  Rc = !1,
  Di = "",
  Sc = !1,
  Wi = new Set(),
  Gi = new Set(),
  Oo = () => document.pointerLockElement != null,
  No = () => Oo() || Br,
  a0 = () => navigator.userActivation?.isActive === !0;
function zi() {
  let e = No();
  if (e !== Rc) {
    Rc = e;
    for (let t of [...Wi]) t(e);
  }
}
function Cc() {
  Br && (Br = !1, Wr && (Wr.style.cursor = Di), zi());
}
function Hc(e) {
  return document.pointerLockElement === e ? Promise.resolve(!0) : new Promise(t => {
    let r = a => {
        document.removeEventListener("pointerlockchange", n), document.removeEventListener("pointerlockerror", o), t(a);
      },
      n = () => r(document.pointerLockElement === e),
      o = () => r(!1);
    document.addEventListener("pointerlockchange", n), document.addEventListener("pointerlockerror", o);
    try {
      e.requestPointerLock()?.catch?.(() => r(!1));
    } catch {
      r(!1);
    }
  });
}
async function i0(e) {
  return Wr = e, (await Hc(e)) ? !0 : Vi ? (Br = !0, Di = e.style.cursor, e.style.cursor = "none", zi(), !0) : !1;
}
function Io() {
  Sc || (Sc = !0, document.addEventListener("pointerdown", () => {
    Pc = performance.now(), Br && Wr && !Oo() && Hc(Wr);
  }, !0), document.addEventListener("pointermove", e => {
    if (!(!No() || e.movementX === 0 && e.movementY === 0)) for (let t of [...Gi]) t(e.movementX, e.movementY);
  }), document.addEventListener("pointerlockchange", () => {
    Oo() && Br && Wr && (Br = !1, Wr.style.cursor = Di), zi();
  }), document.addEventListener("keydown", e => {
    e.key === "Escape" && Cc();
  }));
}
var dr = {
  ready() {
    Io();
    return Promise.resolve();
  },
  get safeArea() {
    return Bi;
  },
  get muted() {
    return Gn;
  },
  onMute(e) {
    return Oi.add(e), () => Oi.delete(e);
  },
  audio() {
    if (Wn) return Wn;
    let e = new AudioContext(),
      t = e.createGain(),
      r = e.createGain(),
      n = e.createGain();
    t.gain.value = Gn ? 0 : Gr.master, r.gain.value = Gr.music, n.gain.value = Gr.sfx, r.connect(t), n.connect(t), t.connect(e.destination), un = {
      context: e,
      output: t,
      music: r,
      sfx: n
    };
    let o = (l, p) => () => (Li.has(l) || (Li.add(l), void 0), p),
      a = o("music", r),
      s = o("sfx", n);
    Wn = {
      context: e,
      output: t,
      get music() {
        return a();
      },
      get sfx() {
        return s();
      }
    };
    let i = () => {
      e.state === "suspended" && !document.hidden && e.resume();
    };
    for (let l of r0) window.addEventListener(l, i, !0);
    return document.addEventListener("visibilitychange", () => {
      document.hidden ? e.suspend() : i();
    }), void 0, Wn;
  },
  async lockPointer(e) {
    return Io(), No() ? !0 : (Vi ||= performance.now() - Pc <= t0 || a0(), Pi ??= i0(e).finally(() => {
      Pi = null, Vi = !1;
    }), Pi);
  },
  unlockPointer() {
    Oo() ? document.exitPointerLock?.() : Cc();
  },
  get pointerLocked() {
    return No();
  },
  onPointerLock(e) {
    return Io(), Wi.add(e), () => Wi.delete(e);
  },
  onLook(e) {
    return Io(), Gi.add(e), () => Gi.delete(e);
  }
};
var Lc = 46,
  s0 = 190,
  l0 = e => Lc + (s0 - Lc) * Math.min(1, Math.max(0, e));
function Ic() {
  let e = null,
    t = [],
    r = !1,
    n = !1,
    o = !1,
    a = null,
    s = new Map(),
    i = null,
    l = () => n && !o ? 1 : 0,
    p = () => {
      if (e || r) return e;
      if (typeof AudioContext > "u") return r = !0, null;
      try {
        let h = dr.audio(),
          P = W => {
            let L = h.context.createGain();
            return L.gain.value = l(), L.connect(W), t.push(L), L;
          },
          A = null,
          w = null,
          C = P(h.output);
        e = {
          handle: {
            context: h.context,
            output: P(h.output),
            get music() {
              return A ??= P(h.music), A;
            },
            get sfx() {
              return w || (w = P(h.sfx), C.disconnect(), C.connect(h.sfx)), w;
            }
          },
          voices: C
        };
      } catch {
        r = !0;
      }
      return e;
    },
    m = () => {
      if (!e) return;
      let {
        context: h
      } = e.handle;
      for (let P of t) P.gain.cancelScheduledValues(h.currentTime), P.gain.setTargetAtTime(l(), h.currentTime, .04);
    },
    E = h => {
      if (a) return a;
      let P = h.createBuffer(1, h.sampleRate, h.sampleRate),
        A = P.getChannelData(0);
      for (let w = 0; w < A.length; w++) A[w] = Math.random() * 2 - 1;
      return a = P, P;
    },
    y = (h, P, A, w, C) => {
      let k = h.createGain();
      return k.gain.setValueAtTime(1e-4, C), k.gain.exponentialRampToValueAtTime(Math.max(2e-4, P), C + A), k.gain.exponentialRampToValueAtTime(1e-4, C + A + w), k;
    },
    b = (h, P, A, w, C, k, W, L) => {
      let K = h.createOscillator();
      K.type = A, K.frequency.setValueAtTime(w, k), K.frequency.exponentialRampToValueAtTime(C, k + W);
      let D = y(h, L, .008, W, k);
      K.connect(D).connect(P), K.start(k), K.stop(k + W + .05);
    },
    R = (h, P, A, w, C, k, W) => {
      let L = h.currentTime;
      w.forEach((K, D) => {
        b(h, P, A, K, K * 1.002, L + D * C, k, W);
      });
    },
    v = (h, P, A, w, C, k) => {
      let W = h.currentTime,
        L = h.createBufferSource();
      L.buffer = E(h);
      let K = h.createBiquadFilter();
      K.type = A, K.frequency.value = w, L.connect(K).connect(y(h, C, .003, k, W)).connect(P), L.start(W), L.stop(W + k + .05);
    },
    T = () => {
      let h = i;
      if (h) {
        i = null;
        try {
          let P = h.gain.context.currentTime;
          h.gain.gain.cancelScheduledValues(P), h.gain.gain.setTargetAtTime(1e-4, P, .05);
          for (let A of h.oscillators) A.stop(P + .3);
        } catch {}
      }
    },
    M = h => {
      if (h === null || !Number.isFinite(h)) {
        T();
        return;
      }
      if (!n) return;
      let P = p();
      if (!P || P.handle.context.state !== "running") return;
      let {
          context: A
        } = P.handle,
        w = P.voices,
        C = Math.min(1, Math.max(0, h)),
        k = l0(C);
      try {
        if (!i) {
          let N = A.createBiquadFilter();
          N.type = "lowpass", N.Q.value = 3;
          let g = A.createGain();
          g.gain.value = 1e-4, N.connect(g).connect(w), i = {
            oscillators: ["sawtooth", "sawtooth", "square"].map(I => {
              let F = A.createOscillator();
              return F.type = I, F.connect(N), F.start(), F;
            }),
            filter: N,
            gain: g
          };
        }
        let W = A.currentTime,
          [L, K, D] = i.oscillators;
        L?.frequency.setTargetAtTime(k, W, .06), K?.frequency.setTargetAtTime(k * 1.012, W, .06), D?.frequency.setTargetAtTime(k * .5, W, .06), i.filter.frequency.setTargetAtTime(380 + 1900 * C, W, .08), i.gain.gain.setTargetAtTime(.045 + .05 * C, W, .08);
      } catch {
        T();
      }
    },
    H = {
      jump(h, P, A) {
        b(h, P, "sine", 330, 660, h.currentTime, .14, .16 * A);
      },
      land(h, P, A) {
        let w = h.currentTime;
        b(h, P, "sine", 150, 55, w, .12, .22 * A);
        let C = h.createBufferSource();
        C.buffer = E(h);
        let k = h.createBiquadFilter();
        k.type = "lowpass", k.frequency.value = 700, C.connect(k).connect(y(h, .05 * A, .004, .08, w)).connect(P), C.start(w), C.stop(w + .12);
      },
      bounce(h, P, A) {
        let w = h.currentTime,
          C = h.createOscillator();
        C.type = "triangle", C.frequency.setValueAtTime(180, w), C.frequency.exponentialRampToValueAtTime(820, w + .22);
        let k = h.createOscillator();
        k.frequency.value = 18;
        let W = h.createGain();
        W.gain.value = 40, k.connect(W).connect(C.frequency), C.connect(y(h, .18 * A, .01, .32, w)).connect(P), C.start(w), k.start(w), C.stop(w + .4), k.stop(w + .4);
      },
      pickup(h, P, A) {
        let w = h.currentTime;
        b(h, P, "triangle", 880, 900, w, .09, .12 * A), b(h, P, "triangle", 1320, 1340, w + .08, .14, .12 * A);
      },
      portal(h, P, A) {
        let w = h.currentTime,
          C = h.createBiquadFilter();
        C.type = "lowpass", C.frequency.setValueAtTime(180, w), C.frequency.exponentialRampToValueAtTime(520, w + .7);
        let k = h.createGain();
        k.gain.setValueAtTime(1e-4, w), k.gain.exponentialRampToValueAtTime(.14 * A, w + .6), k.gain.exponentialRampToValueAtTime(1e-4, w + 1.6), C.connect(k).connect(P);
        for (let W of [55, 55.7, 110.4]) {
          let L = h.createOscillator();
          L.type = "sawtooth", L.frequency.value = W, L.connect(C), L.start(w), L.stop(w + 1.7);
        }
      },
      whoosh(h, P, A) {
        let w = h.currentTime,
          C = h.createBufferSource();
        C.buffer = E(h);
        let k = h.createBiquadFilter();
        k.type = "bandpass", k.Q.value = 1.2, k.frequency.setValueAtTime(260, w), k.frequency.exponentialRampToValueAtTime(3200, w + .55), C.connect(k).connect(y(h, .3 * A, .12, .55, w)).connect(P), C.start(w), C.stop(w + .75);
      },
      coin(h, P, A) {
        let w = h.currentTime;
        b(h, P, "square", 988, 990, w, .07, .07 * A), b(h, P, "square", 1319, 1320, w + .065, .26, .07 * A);
      },
      hit(h, P, A) {
        v(h, P, "bandpass", 1800, .22 * A, .07), b(h, P, "triangle", 260, 90, h.currentTime, .1, .2 * A);
      },
      hurt(h, P, A) {
        let w = h.currentTime,
          C = h.createOscillator();
        C.type = "square", C.frequency.setValueAtTime(420, w), C.frequency.exponentialRampToValueAtTime(110, w + .32);
        let k = h.createOscillator();
        k.frequency.value = 24;
        let W = h.createGain();
        W.gain.value = 30, k.connect(W).connect(C.frequency);
        let L = h.createBiquadFilter();
        L.type = "lowpass", L.frequency.value = 1400, C.connect(L).connect(y(h, .12 * A, .005, .34, w)).connect(P), C.start(w), k.start(w), C.stop(w + .4), k.stop(w + .4);
      },
      win(h, P, A) {
        R(h, P, "triangle", [523.25, 659.25, 783.99, 1046.5], .09, .22, .13 * A), b(h, P, "sine", 1046.5, 1047, h.currentTime + .36, .5, .08 * A);
      },
      lose(h, P, A) {
        let w = h.createBiquadFilter();
        w.type = "lowpass", w.frequency.value = 1100, w.connect(P), R(h, w, "sawtooth", [392, 311.13, 261.63], .2, .32, .09 * A);
      },
      countdown(h, P, A) {
        b(h, P, "square", 660, 662, h.currentTime, .13, .08 * A);
      },
      go(h, P, A) {
        let w = h.currentTime;
        b(h, P, "square", 1320, 1322, w, .42, .07 * A), b(h, P, "triangle", 1980, 1982, w, .42, .05 * A);
      },
      shoot(h, P, A) {
        let w = h.currentTime,
          C = h.createOscillator();
        C.type = "square", C.frequency.setValueAtTime(1500, w), C.frequency.exponentialRampToValueAtTime(180, w + .13);
        let k = h.createBiquadFilter();
        k.type = "lowpass", k.frequency.setValueAtTime(5e3, w), k.frequency.exponentialRampToValueAtTime(900, w + .13), C.connect(k).connect(y(h, .1 * A, .002, .14, w)).connect(P), C.start(w), C.stop(w + .2), v(h, P, "highpass", 3e3, .05 * A, .03);
      },
      engine() {
        M(0);
      }
    };
  return {
    get handle() {
      return p()?.handle ?? null;
    },
    play(h, P = 1) {
      if (h === "engine") {
        i || M(0);
        return;
      }
      if (!n || o) return;
      let A = p();
      if (!A || A.handle.context.state !== "running") return;
      let w = A.handle.context.currentTime;
      if (!(w - (s.get(h) ?? Number.NEGATIVE_INFINITY) < .05)) {
        s.set(h, w);
        try {
          H[h](A.handle.context, A.voices, Math.min(1.5, Math.max(.1, P)));
        } catch {}
      }
    },
    engine(h) {
      M(h);
    },
    setActive(h) {
      n = h, h || T(), h && p(), m();
    },
    get muted() {
      return o;
    },
    setMuted(h) {
      o = h, m();
    }
  };
}
var Ue = .004644289634789952,
  te = {
    height: 1.1,
    body: {
      width: 149.15 * Ue,
      height: 190.74 * Ue,
      bottom: 46.11 * Ue,
      ear: 35.86 * Ue,
      notch: 43.83 * Ue,
      chin: 21.58 * Ue,
      depth: .3
    },
    eye: {
      width: 18.17 * Ue,
      height: 35.23 * Ue,
      x: 27.15 * Ue,
      y: 164.3 * Ue
    },
    mouth: {
      width: 35.23 * Ue,
      height: 2.82 * Ue,
      y: 121.36 * Ue
    },
    leg: {
      width: 37.29 * Ue,
      height: 63.62 * Ue,
      radius: 9.58 * Ue,
      x: 27.5 * Ue,
      depth: .16,
      pivot: .27
    },
    arm: {
      width: 26.42 * Ue,
      height: 56.33 * Ue,
      radius: 7.08 * Ue,
      x: 94.7 * Ue,
      top: 119.95 * Ue,
      depth: .12
    }
  },
  Et = te.arm.top - .03,
  Lt = te.leg.height / 2 - te.leg.pivot,
  It = te.arm.top - te.arm.height / 2 - Et,
  Bn = .55;
function Dr(e, t, r, n, o, a, s) {
  if (n <= 1e-6) {
    e.push([t, r]);
    return;
  }
  for (let i = 0; i <= s; i++) {
    let l = o + (a - o) * i / s;
    e.push([t + Math.cos(l) * n, r + Math.sin(l) * n]);
  }
}
function fr(e = 0, t = 8) {
  let {
      width: r,
      height: n,
      ear: o,
      notch: a,
      chin: s
    } = te.body,
    i = e,
    l = r / 2,
    p = Math.PI / 2,
    m = Math.max(2, t >> 1),
    E = [],
    y = (b, R, v, T, M) => {
      i > 0 ? Dr(E, b, R, i, M, M + p, m) : E.push([b + v * i, R + T * i]);
    };
  return Dr(E, l - s, s, s + i, -p, 0, t), y(l, n, 1, 1, 0), y(l - o, n, -1, 1, p), E.push([l - o - i, n - a + i]), E.push([-l + o + i, n - a + i]), y(-l + o, n, 1, 1, 0), y(-l, n, -1, 1, p), Dr(E, -l + s, s, s + i, 2 * p, 3 * p, t), E;
}
function vt(e, t, r, n = 6) {
  let o = Math.max(0, Math.min(r, e / 2, t / 2)),
    a = e / 2 - o,
    s = t / 2 - o,
    i = Math.PI / 2,
    l = [];
  return Dr(l, a, -s, o, -i, 0, n), Dr(l, a, s, o, 0, i, n), Dr(l, -a, s, o, i, 2 * i, n), Dr(l, -a, -s, o, 2 * i, 3 * i, n), l;
}
function Ui(e, t, r) {
  let n = !1;
  for (let o = 0, a = r.length - 1; o < r.length; a = o++) {
    let [s, i] = r[o],
      [l, p] = r[a];
    i > t != p > t && e < (l - s) * (t - i) / (p - i) + s && (n = !n);
  }
  return n;
}
function Oc(e, t) {
  let {
      width: r,
      height: n
    } = te.body,
    o = fr(0, 12),
    a = [];
  for (let s = 0; s < t; s++) {
    let i = [],
      l = (s + .5) / t * n;
    for (let p = 0; p < e; p++) {
      let m = (p + .5) / e * r - r / 2;
      i.push(Ui(m, l, o));
    }
    a.push(i);
  }
  return a;
}
function Fo(e, t, r) {
  let n = te.body.width / t,
    o = te.body.height / r,
    a = Math.max(1, Math.round(e.width / n)),
    s = Math.max(1, Math.round(e.height / o)),
    i = (e.cx + te.body.width / 2) / n,
    l = e.cy / o;
  return {
    col: Math.round(i - a / 2),
    row: Math.round(l - s / 2),
    cols: a,
    rows: s
  };
}
import * as dt from "./001-three-a973dc20bf0957e55145ef9e6b9c97d50275b224b1d81a57603249dd6750ab96.js";
function ft(e) {
  let t = new dt.Shape();
  return e.forEach(([r, n], o) => {
    o === 0 ? t.moveTo(r, n) : t.lineTo(r, n);
  }), t.closePath(), t;
}
var Dn = (e = 0, t = 10) => ft(fr(e, t)),
  Vo = (e, t, r, n = 6) => ft(vt(e, t, r, n));
function qt(e, t) {
  let r = t.bevel ?? 0,
    n = Math.min(r, t.depth * .4),
    o = new dt.ExtrudeGeometry(e, {
      depth: Math.max(1e-4, t.depth - n * 2),
      bevelEnabled: r > 0,
      bevelThickness: n,
      bevelSize: r,
      bevelOffset: -r,
      bevelSegments: t.bevelSegments ?? 3,
      curveSegments: t.curveSegments ?? 12
    });
  return o.translate(0, 0, -(t.depth - n * 2) / 2), o;
}
function Nc(e) {
  let t = e.getAttribute("position");
  e.getAttribute("normal") || e.computeVertexNormals();
  let r = e.getAttribute("normal"),
    n = new Map(),
    o = [],
    a = i => Math.round(i * 1e4);
  for (let i = 0; i < t.count; i++) {
    let l = `${a(t.getX(i))},${a(t.getY(i))},${a(t.getZ(i))}`;
    o.push(l);
    let p = n.get(l);
    p || (p = new dt.Vector3(), n.set(l, p)), p.x += r.getX(i), p.y += r.getY(i), p.z += r.getZ(i);
  }
  let s = new Float32Array(t.count * 3);
  for (let i = 0; i < t.count; i++) {
    let l = n.get(o[i]),
      p = l.length() || 1;
    s[i * 3] = l.x / p, s[i * 3 + 1] = l.y / p, s[i * 3 + 2] = l.z / p;
  }
  return e.setAttribute("outlineNormal", new dt.BufferAttribute(s, 3)), e;
}
function Qe(e, t, r) {
  let n = new dt.Color(e),
    o = new dt.Color(t);
  return n.lerp(o, r);
}
var ct = "#060b0f";
function tt(e) {
  let t = Math.sin(e * 127.1 + 311.7) * 43758.5453;
  return t - Math.floor(t);
}
function Ki(e) {
  let t = new Set();
  e.traverse(r => {
    let n = r;
    n.geometry && !t.has(n.geometry) && (t.add(n.geometry), n.geometry.dispose());
    let o = n.material,
      a = Array.isArray(o) ? o : o ? [o] : [];
    for (let s of a) {
      if (t.has(s)) continue;
      t.add(s);
      for (let l of Object.values(s)) l instanceof dt.Texture && !t.has(l) && (t.add(l), l.dispose());
      let i = s.uniforms;
      if (i) for (let l of Object.values(i)) l.value instanceof dt.Texture && !t.has(l.value) && (t.add(l.value), l.value.dispose());
      s.dispose();
    }
    r.isInstancedMesh && r.dispose();
  });
}
function Fc(e, t) {
  if (typeof document > "u" || typeof document.createElement != "function") return null;
  let r = document.createElement("canvas");
  return r.width = e, r.height = t, r;
}
var Vc = .2,
  c0 = .45,
  Ot = ct;
function u0(e) {
  return e === "world" ? {
    colors: !1,
    face: !1,
    outfit: !1
  } : e === void 0 || e === "player" || typeof e != "object" || !e ? {
    colors: !0,
    face: !0,
    outfit: !0
  } : {
    colors: e.colors !== !1,
    face: e.face !== !1,
    outfit: e.outfit !== !1
  };
}
var p0 = new Set(["suit", "smith", "john-wick-suit"]);
function Wc(e, t, r) {
  let n = r ? u0(t) : {
      colors: !1,
      face: !1,
      outfit: !1
    },
    o = {
      skin: {
        bottom: e,
        top: e
      },
      shade: {
        bottom: ct,
        top: ct,
        amount: Vc
      },
      eyes: "vertical",
      eyeColor: ct,
      mouth: !0,
      mouthColor: ct,
      mustache: !1,
      teeth: "none",
      hair: "none",
      outfit: "none",
      clothingColor: e
    };
  if (!r) return o;
  if (n.colors) {
    o.skin = {
      ...r.skin
    };
    let a = r.outline.bottom === r.skin.bottom && r.outline.top === r.skin.top;
    o.shade = a ? {
      bottom: ct,
      top: ct,
      amount: Vc
    } : {
      ...r.outline,
      amount: c0
    };
  }
  return n.face && (o.eyes = r.eyeStyle, o.eyeColor = r.eyeColor, o.mustache = r.hasMustache, o.mouth = r.mouthStyle !== "none" && !r.hasMustache, o.mouthColor = r.mouthColor, o.teeth = r.teeth, o.hair = r.hair), n.outfit && r.clothing !== "none" && (o.outfit = p0.has(r.clothing) ? "suit" : "shirt", o.clothingColor = r.clothingColor), o;
}
function Gc(e, t) {
  return JSON.stringify(e) === JSON.stringify(t);
}
var Bc = e => Math.min(1, Math.max(0, e));
function tr(e, t) {
  return Qe(e.skin.bottom, e.skin.top, Bc(t / te.height));
}
function qi(e, t) {
  let r = Bc(t / te.height),
    n = Qe(e.shade.bottom, e.shade.top, r);
  return tr(e, t).lerp(n, e.shade.amount);
}
function zn(e, t, r, n = 0, o = 0, a = .01) {
  let s = Math.cos(r),
    i = Math.sin(r);
  return vt(e, t, a, 3).map(([l, p]) => [n + l * s - p * i, o + l * i + p * s]);
}
function mr(e, t = .012, r = 3) {
  let {
      width: n,
      height: o
    } = te.eye,
    a = n * .95;
  switch (e) {
    case "none":
      return [];
    case "horizontal":
      return [zn(o * .92, n * .92, 0, 0, 0, .012)];
    case "x":
      return [zn(a, o * 1.05, .7), zn(a, o * 1.05, -.7)];
    case "plus":
      return [zn(a, o * 1.05, 0), zn(o * 1.05, a, 0)];
    default:
      return [vt(n, o, t, r)];
  }
}
function dn() {
  return vt(te.mouth.width, Math.max(.016, te.mouth.height), .008, 3);
}
function ji(e, t) {
  let r = 1 - t,
    [n, o, a, s] = e,
    i = [r * r * r, 3 * r * r * t, 3 * r * t * t, t * t * t];
  return [n[0] * i[0] + o[0] * i[1] + a[0] * i[2] + s[0] * i[3], n[1] * i[0] + o[1] * i[1] + a[1] * i[2] + s[1] * i[3]];
}
function Yi(e, t, r, n = 14) {
  let o = [],
    a = [];
  for (let s = 0; s <= n; s++) {
    let i = s / n,
      [l, p] = ji(e, i),
      [m, E] = ji(e, Math.max(0, i - .01)),
      [y, b] = ji(e, Math.min(1, i + .01)),
      R = Math.hypot(y - m, b - E) || 1,
      v = -(b - E) / R,
      T = (y - m) / R,
      M = t + (r - t) * i;
    o.push([l + v * M, p + T * M]), a.push([l - v * M, p - T * M]);
  }
  return [...o, ...a.reverse()];
}
function d0(e, t, r, n = 12) {
  let o = [];
  for (let a = 0; a < n; a++) {
    let s = a / n * Math.PI * 2;
    o.push([e + Math.cos(s) * r, t + Math.sin(s) * r]);
  }
  return o;
}
function hr() {
  let r = [];
  for (let n of [-1, 1]) r.push(Yi([[n * .041, 0], [n * .096, -.084], [n * .227, -.081], [n * .263, -.036]], .05, .004), d0(n * .041, 0, .05));
  return r;
}
function gr(e) {
  return e === "buck" ? [-1, 1].map(t => vt(.058, .08, .006, 2).map(([r, n]) => [r + t * .032, n - .036])) : e === "fangs" ? [-1, 1].map(t => [[t * .051 - .034, .006], [t * .051 + .034, .006], [t * .051, -.092]]) : [];
}
var f0 = te.body.bottom + te.body.height - te.body.notch;
function br(e) {
  if (e !== "bangs") return [];
  let t = f0 - .003,
    r = n => Yi([[n * .01, t], [n * .025, t - .02], [n * .05, t - .04], [n * .072, t - .058]], .017, .002);
  return [r(-1), Yi([[0, t], [.003, t - .022], [.006, t - .044], [.01, t - .068]], .018, .002), r(1)];
}
var Qi = .25;
function m0(e, t) {
  let r = [];
  for (let n = 0; n < e.length; n++) {
    let o = e[n],
      a = e[(n + 1) % e.length],
      s = o[1] <= t,
      i = a[1] <= t;
    if (s && r.push(o), s !== i) {
      let l = (t - o[1]) / (a[1] - o[1]);
      r.push([o[0] + (a[0] - o[0]) * l, t]);
    }
  }
  return r;
}
function yr(e, t = 0) {
  if (e === "none") return null;
  let r = Qi,
    n = m0(fr(t, 10), r);
  if (e === "shirt") return {
    band: n,
    skin: [[[-.042, r], [0, r - .042], [.042, r]]],
    tie: []
  };
  let o = .084,
    a = .054;
  return {
    band: n,
    skin: [vt(o, r, 0, 1).map(([i, l]) => [i, l + r / 2])],
    tie: [[[-o / 2, r], [o / 2, r], [0, r - a]], vt(.042, r - a * .6, .004, 2).map(([i, l]) => [i, l + (r - a * .6) / 2])]
  };
}
var Wo = Math.PI * 2,
  h0 = {
    swing: {
      duration: .46,
      impact: .42,
      tracks: {
        mainWeight: [[0, 0], [.1, 1], [.7, 1], [1, 0]],
        mainRaise: [[0, .2], [.28, 1.6], [.42, .55], [.56, -.35], [1, .2]],
        mainSwing: [[0, .3], [.28, .15], [.42, 1.5], [.56, 1.45], [1, .35]],
        wrist: [[0, 0], [.28, 1.8], [.42, 1.75], [.56, 1.6], [1, 0]],
        twist: [[0, 0], [.28, -.8], [.42, .1], [.58, .9], [1, 0]],
        lean: [[0, 0], [.28, -.06], [.46, .16], [1, 0]],
        bank: [[0, 0], [.28, .06], [.55, -.08], [1, 0]],
        squash: [[0, 0], [.28, -.04], [.44, .04], [.62, -.03], [1, 0]]
      }
    },
    cast: {
      duration: .62,
      impact: .45,
      tracks: {
        mainWeight: [[0, 0], [.12, 1], [.7, 1], [1, 0]],
        offWeight: [[0, 0], [.12, 1], [.7, 1], [1, 0]],
        mainSwing: [[0, 0], [.3, -.45], [.45, 1.55], [.7, 1.45], [1, .2]],
        offSwing: [[0, 0], [.3, -.45], [.45, 1.55], [.7, 1.45], [1, .2]],
        mainRaise: [[0, .1], [.3, .55], [.45, .28], [1, .1]],
        offRaise: [[0, .1], [.3, .55], [.45, .28], [1, .1]],
        wrist: [[0, 0], [.45, .6], [1, 0]],
        lean: [[0, 0], [.3, -.07], [.46, .18], [.7, .12], [1, 0]],
        squash: [[0, 0], [.3, -.07], [.46, .08], [.7, .02], [1, 0]]
      }
    },
    spin: {
      duration: .6,
      impact: .5,
      tracks: {
        mainWeight: [[0, 0], [.12, 1], [.85, 1], [1, 0]],
        offWeight: [[0, 0], [.12, 1], [.85, 1], [1, 0]],
        mainSwing: [[0, .2], [.15, .35], [.85, .35], [1, .2]],
        mainRaise: [[0, .2], [.15, 1.45], [.85, 1.45], [1, .2]],
        offSwing: [[0, 0], [.15, .1], [1, 0]],
        offRaise: [[0, .1], [.15, 1.2], [.85, 1.2], [1, .1]],
        wrist: [[0, 0], [.15, 1.8], [.85, 1.8], [1, 0]],
        twist: [[0, 0], [.08, -.25], [.9, Wo], [1, Wo]],
        squash: [[0, 0], [.12, -.08], [.85, -.06], [1, 0]],
        lean: [[0, 0], [.2, .06], [.85, .06], [1, 0]]
      }
    },
    hit: {
      duration: .34,
      impact: 0,
      tracks: {
        mainWeight: [[0, 0], [.12, .8], [.5, .6], [1, 0]],
        offWeight: [[0, 0], [.12, .8], [.5, .6], [1, 0]],
        mainSwing: [[0, 0], [.15, -.3], [1, 0]],
        offSwing: [[0, 0], [.15, -.3], [1, 0]],
        mainRaise: [[0, .1], [.15, .85], [1, .1]],
        offRaise: [[0, .1], [.15, .85], [1, .1]],
        lean: [[0, 0], [.15, -.3], [.55, .05], [1, 0]],
        twist: [[0, 0], [.15, -.14], [.55, .04], [1, 0]],
        squash: [[0, 0], [.12, -.15], [.4, .06], [.7, -.02], [1, 0]],
        blink: [[0, 0], [.08, 1], [.55, 1], [.75, 0], [1, 0]]
      }
    },
    celebrate: {
      duration: .95,
      impact: .42,
      tracks: {
        mainWeight: [[0, 0], [.1, 1], [.8, 1], [1, 0]],
        offWeight: [[0, 0], [.1, 1], [.8, 1], [1, 0]],
        mainSwing: [[0, 0], [.18, -.3], [.4, .4], [1, .2]],
        offSwing: [[0, 0], [.18, -.3], [.4, .4], [1, .2]],
        mainRaise: [[0, .1], [.18, .3], [.4, 2.55], [.8, 2.35], [1, .2]],
        offRaise: [[0, .1], [.18, .3], [.4, 2.55], [.8, 2.35], [1, .2]],
        bob: [[0, 0], [.2, -.03], [.42, .28], [.64, 0], [1, 0]],
        squash: [[0, 0], [.18, -.13], [.3, .1], [.5, .02], [.66, -.11], [.8, .02], [1, 0]],
        twist: [[0, 0], [.22, 0], [.62, Wo], [1, Wo]],
        wrist: [[0, 0], [.4, 1.8], [.8, 1.7], [1, 0]]
      }
    }
  };
function g0(e, t) {
  if (!e || e.length === 0) return 0;
  let r = e[0];
  if (t <= r[0]) return r[1];
  for (let n = 1; n < e.length; n++) {
    let o = e[n];
    if (t <= o[0]) {
      let a = e[n - 1],
        s = o[0] - a[0],
        i = s > 0 ? Uc(0, 1, (t - a[0]) / s) : 1;
      return a[1] + (o[1] - a[1]) * i;
    }
  }
  return e[e.length - 1][1];
}
var Go = ["mainSwing", "mainRaise", "mainWeight", "offSwing", "offRaise", "offWeight", "twist", "lean", "bank", "bob", "squash", "blink", "wrist"],
  b0 = 38,
  Xi = {
    swing: .32,
    gaitKeep: .3,
    raise: .14
  },
  Dc = [.25, 4],
  fn = Math.PI * 2,
  rr = (e, t, r) => e < t ? t : e > r ? r : e,
  De = e => rr(e, 0, 1),
  Ne = (e, t, r) => e + (t - e) * r;
function Uc(e, t, r) {
  let n = De((r - e) / (t - e));
  return n * n * (3 - 2 * n);
}
function Qt(e) {
  return e - fn * Math.floor((e + Math.PI) / fn);
}
var Er = e => 1 - (1 - De(e)) ** 3,
  Kc = e => {
    let t = De(e);
    return t < .5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
  };
function Xt(e, t = 1.70158) {
  let r = De(e) - 1;
  return 1 + (t + 1) * r * r * r + t * r * r;
}
var Bo = .06,
  zc = .1,
  y0 = .16,
  E0 = .52,
  v0 = 3.4,
  Un = {
    legSwing: 1.4,
    legRaise: .1,
    armSwing: .85,
    armRaise: .22,
    lean: -.08
  },
  x0 = 14;
function Do() {
  return {
    swing: 0,
    raise: 0,
    lift: 0
  };
}
var zo = class {
  constructor(t = Math.random) {
    this.random = t;
    this.nextBlink = 1.2 + t() * 2;
  }
  pose = {
    facing: 0,
    turnRate: 0,
    bobY: 0,
    scaleX: 1,
    scaleY: 1,
    scaleZ: 1,
    spin: 0,
    lean: 0,
    bank: 0,
    breathe: 1,
    blink: 1,
    gazeX: 0,
    legL: Do(),
    legR: Do(),
    armL: Do(),
    armR: Do(),
    gait: 0,
    air: 0,
    speedRatio: 0,
    seated: 0,
    twist: 0,
    wristL: 0,
    wristR: 0
  };
  started = !1;
  time = 0;
  facing = 0;
  turnRate = 0;
  gaze = 0;
  phase = 0;
  gait = 0;
  air = 0;
  airTime = 0;
  jumps = 0;
  squash = 0;
  squashVel = 0;
  prevVy = 0;
  flip = -1;
  flipHurry = !1;
  seat = 0;
  gestureSpec = null;
  gestureTime = 0;
  gestureSpeed = 1;
  gestureSide = 1;
  overlay = Object.fromEntries(Go.map(t => [t, 0]));
  holdL = 0;
  holdR = 0;
  holdingL = !1;
  holdingR = !1;
  blinkAge = Number.POSITIVE_INFINITY;
  blinkClock = 0;
  nextBlink;
  snapFacing(t) {
    this.facing = Qt(t), this.turnRate = 0, this.gaze = 0, this.started = !0;
  }
  get flipping() {
    return this.flip >= 0;
  }
  get gesturing() {
    return this.gestureSpec !== null;
  }
  setHolding(t, r) {
    this.holdingL = t, this.holdingR = r;
  }
  gesture(t, r = 1, n = 1) {
    let o = h0[t];
    if (!o) return {
      duration: 0,
      impact: 0
    };
    let a = rr(Number.isFinite(n) ? n : 1, Dc[0], Dc[1]);
    return this.gestureSpec = o, this.gestureTime = 0, this.gestureSpeed = a, this.gestureSide = r < 0 ? -1 : 1, {
      duration: o.duration / a,
      impact: o.duration * o.impact / a
    };
  }
  step(t, r) {
    let n = rr(Number.isFinite(t) ? t : 0, 0, .1);
    this.time += n;
    let o = this.pose;
    this.started || (this.facing = r.yaw, this.started = !0);
    let s = Qt(r.yaw - this.facing) * (1 - Math.exp(-n * 12));
    this.facing = Qt(this.facing + s);
    let i = n > 0 ? s / n : 0;
    this.turnRate += (i - this.turnRate) * (1 - Math.exp(-n * 8));
    let l = Math.max(0, r.speed) / Math.max(r.runSpeed, .1),
      p = (r.forward ?? r.speed) / Math.max(r.runSpeed, .1);
    if (this.airTime = r.grounded ? 0 : this.airTime + n, r.jumped) {
      let Z = r.grounded || r.landed || this.jumps === 0 && this.airTime < y0;
      this.jumps = Z ? 1 : this.jumps + 1, Z || (this.flip = 0, this.flipHurry = !1), this.squash = -.1, this.squashVel = Z ? 6 : 3.5;
    } else r.grounded && (this.jumps = 0);
    if (r.landed) {
      let Z = rr(-Math.min(this.prevVy, r.vy) / 14, .25, 1);
      this.squash = Math.min(this.squash, -.24 * Z), this.squashVel = 0, this.flip >= 0 && (this.flipHurry = !0);
    }
    this.prevVy = r.vy;
    let m = !r.grounded && this.airTime > .05 ? 1 : 0;
    this.air += (m - this.air) * (1 - Math.exp(-n * (m > this.air ? 14 : 24))), r.landed && (this.air = Math.min(this.air, .35));
    let E = Uc(.04, .22, l) * (1 - m);
    this.gait += (E - this.gait) * (1 - Math.exp(-n * 10)), r.grounded && (this.phase = (this.phase + n * fn * (1.3 + 1.7 * Math.min(l, 1.7))) % fn);
    let y = Math.max(1, Math.ceil(n / (1 / 120))),
      b = n / y;
    for (let Z = 0; Z < y; Z++) this.squashVel += (-240 * this.squash - 13 * this.squashVel) * b, this.squash += this.squashVel * b;
    this.flip >= 0 && (this.flip += n / (this.flipHurry ? .1 : E0), this.flip >= 1 && (this.flip = -1, this.flipHurry = !1)), this.blinkClock += n, this.blinkAge += n, this.blinkClock >= this.nextBlink && (this.blinkClock = 0, this.blinkAge = 0, this.nextBlink = this.random() < .2 ? .22 : 2.2 + this.random() * 3.6);
    let R = this.blinkAge,
      v = R < Bo ? R / Bo : R < Bo + zc ? 1 - (R - Bo) / zc : 0,
      T = this.gait,
      M = this.air,
      H = (1 - T) * (1 - M),
      h = Math.min(l, 1.4),
      P = Math.sin(this.phase),
      A = Math.cos(this.phase),
      w = .35 + .25 * h,
      C = .3 + .5 * h,
      k = De(r.vy / 6),
      W = De(-r.vy / 8),
      L = Math.sin(this.time * 22) * .18 * W,
      K = P * w * T,
      D = -P * C * T,
      N = .07 + .03 * Math.sin(this.time * 1.7),
      g = .07 + .03 * Math.sin(this.time * 1.7 + 1.3),
      S = T * .12,
      I = .5 + 1.9 * k + .8 * W;
    o.legL.swing = Ne(K, k * .55 - W * .05, M), o.legR.swing = Ne(-K, -k * .22, M), o.legL.raise = M * W * .16, o.legR.raise = M * W * .16, o.legL.lift = M * k * .045, o.legR.lift = M * k * .02, o.armL.swing = Ne(D, .15, M), o.armR.swing = Ne(-D, .15, M), o.armL.raise = Ne(H * N + S, I + L, M), o.armR.raise = Ne(H * g + S, I - L, M), this.holdL += ((this.holdingL ? 1 : 0) - this.holdL) * (1 - Math.exp(-n * 10)), this.holdR += ((this.holdingR ? 1 : 0) - this.holdR) * (1 - Math.exp(-n * 10));
    for (let [Z, X] of [[o.armL, this.holdL], [o.armR, this.holdR]]) {
      if (X <= .001) continue;
      let B = Xi.swing + Z.swing * Xi.gaitKeep;
      Z.swing = Ne(Z.swing, Ne(B, Z.swing, M), X), Z.raise = Ne(Z.raise, Ne(Xi.raise, Z.raise, M), X);
    }
    let F = 0;
    if (this.flip >= 0) {
      let Z = Math.sin(Math.PI * this.flip);
      F = fn * Er(this.flip);
      for (let X of [o.legL, o.legR]) X.swing += 1 * Z, X.lift += .07 * Z;
      for (let X of [o.armL, o.armR]) X.swing = Ne(X.swing, .9, Z), X.raise = Ne(X.raise, .35, Z);
    }
    let z = .27 * (1 - Math.cos(w * Math.abs(P)));
    o.bobY = T * (.035 * Math.min(l, 1.3) * Math.abs(A) - z);
    let U = T * .03 * (2 * Math.abs(A) - 1),
      Q = M * Math.min(Math.abs(r.vy) / 12, 1) * .1,
      $ = rr(this.squash + U + Q, -.32, .3);
    o.scaleY = 1 + $, o.scaleX = 1 - $ * .55, o.scaleZ = o.scaleX;
    let ie = rr(this.turnRate * .045, -.22, .22);
    this.gaze += (rr(this.turnRate * .01, -.016, .016) - this.gaze) * (1 - Math.exp(-n * 10)), o.facing = this.facing, o.turnRate = this.turnRate, o.spin = F;
    let _ = p < 0 ? Math.max(p, -1) * .5 : Math.min(p, 1.5);
    o.lean = T * .14 * _ + M * (k * .06 - W * .04), o.bank = -ie * (.3 + .7 * T), o.breathe = 1 + H * .012 * (1 - Math.cos(fn * this.time / v0)), o.blink = 1 - .92 * v, o.gazeX = this.gaze, o.gait = T, o.air = M, o.speedRatio = l, this.seat += ((r.seated ? 1 : 0) - this.seat) * (1 - Math.exp(-n * x0)), r.seated && this.seat > .999 && (this.seat = 1), !r.seated && this.seat < .001 && (this.seat = 0);
    let J = this.seat;
    if (o.seated = J, J > 0) {
      for (let Z of [o.legL, o.legR]) Z.swing = Ne(Z.swing, Un.legSwing, J), Z.raise = Ne(Z.raise, Un.legRaise, J), Z.lift = Ne(Z.lift, 0, J);
      for (let Z of [o.armL, o.armR]) Z.swing = Ne(Z.swing, Un.armSwing, J), Z.raise = Ne(Z.raise, Un.armRaise, J), Z.lift = Ne(Z.lift, 0, J);
      o.bobY = Ne(o.bobY, 0, J), o.lean = Ne(o.lean, Un.lean, J), o.spin = Ne(o.spin, 0, J), o.gait = T * (1 - J), o.air = M * (1 - J);
    }
    return this.applyGesture(n, o), o;
  }
  applyGesture(t, r) {
    let n = this.gestureSpec,
      o = 0;
    n && (this.gestureTime += t * this.gestureSpeed, o = n.duration > 0 ? this.gestureTime / n.duration : 1, o >= 1 && (this.gestureSpec = null, o = 1));
    let a = this.overlay,
      s = 1 - Math.exp(-t * b0);
    for (let y of Go) {
      let b = n ? g0(n.tracks[y], o) : 0;
      y === "twist" && (a.twist = b + Qt(a.twist - b)), a[y] += (b - a[y]) * s;
    }
    if (!n && Go.every(y => Math.abs(a[y]) < 1e-4)) for (let y of Go) a[y] = 0;
    let i = this.gestureSide,
      l = i > 0 ? r.armR : r.armL,
      p = i > 0 ? r.armL : r.armR,
      m = De(a.mainWeight),
      E = De(a.offWeight);
    l.swing = Ne(l.swing, a.mainSwing, m), l.raise = Ne(l.raise, a.mainRaise, m), l.lift = Ne(l.lift, 0, m), p.swing = Ne(p.swing, a.offSwing, E), p.raise = Ne(p.raise, a.offRaise, E), p.lift = Ne(p.lift, 0, E), r.twist = a.twist * i, r.lean += a.lean, r.bank += a.bank * i, r.bobY += a.bob, r.scaleY += a.squash, r.scaleX -= a.squash * .55, r.scaleZ = r.scaleX, r.blink = Math.min(r.blink, 1 - .92 * De(a.blink)), r.wristR = i > 0 ? a.wrist : 0, r.wristL = i > 0 ? 0 : a.wrist;
  }
};
import * as Yc from "./001-three-a973dc20bf0957e55145ef9e6b9c97d50275b224b1d81a57603249dd6750ab96.js";
var T0 = te.arm.top - te.arm.height - Et + .05,
  Uo = 1.3,
  Ko = {
    x: .07,
    y: te.body.bottom + te.body.height * .34,
    z: -(te.body.depth / 2 + .05),
    roll: .62
  };
function mt(e, t) {
  let r = new Yc.Group();
  return r.name = e, t?.add(r), r;
}
function zr(e, t, r, n) {
  let o = mt(e, t);
  o.position.set(r, n, 0);
  let a = mt(`${e}.content`, o);
  return {
    pivot: o,
    content: a
  };
}
function qc() {
  let e = mt("craig"),
    t = mt("craig.turn", e),
    r = mt("craig.fx", t),
    n = mt("craig.flip", r),
    o = mt("craig.body", n),
    a = mt("craig.spinPivot", o);
  a.position.y = Bn;
  let s = mt("craig.spin", a);
  s.position.y = -Bn;
  let i = mt("craig.torso", s),
    l = zr("craig.bodyPart", i, 0, 0),
    p = mt("craig.face", i),
    m = zr("craig.eyes", p, 0, te.eye.y),
    E = zr("craig.mouth", p, 0, te.mouth.y),
    y = zr("craig.legL", i, te.leg.x, te.leg.pivot),
    b = zr("craig.legR", i, -te.leg.x, te.leg.pivot),
    R = zr("craig.armL", i, te.arm.x, Et),
    v = zr("craig.armR", i, -te.arm.x, Et),
    T = mt("craig.handL", R.pivot),
    M = mt("craig.handR", v.pivot);
  for (let h of [T, M]) h.position.set(0, T0, .02);
  let H = mt("craig.back", i);
  return H.position.set(Ko.x, Ko.y, Ko.z), H.rotation.set(0, Math.PI, -Ko.roll), {
    root: e,
    turn: t,
    fx: r,
    flip: n,
    body: o,
    spinPivot: a,
    spin: s,
    torso: i,
    bodyPart: l,
    face: p,
    eyes: m,
    mouth: E,
    legL: y,
    legR: b,
    armL: R,
    armR: v,
    handL: T,
    handR: M,
    back: H
  };
}
var jc = new WeakMap();
function jo(e, t, r, n, o, a) {
  let s = jc.get(e.pivot);
  s === void 0 && (s = e.pivot.position.y, jc.set(e.pivot, s)), e.pivot.position.y = s + n, a.swing === "x" ? (e.pivot.rotation.x = -t, e.pivot.rotation.z = o * r) : (e.pivot.rotation.x = 0, e.pivot.rotation.z = t * .8 + o * r);
}
function Ji(e, t, r) {
  e.root.rotation.y = t.facing, e.body.position.y = t.bobY, e.body.scale.set(t.scaleX, t.scaleY, t.scaleZ), r.spin === "x" ? e.spin.rotation.set(t.spin, 0, 0) : e.spin.rotation.set(0, 0, t.spin * (r.spinSign ?? 1)), e.torso.scale.y = t.breathe, e.torso.rotation.x = t.lean, e.torso.rotation.y = t.twist, e.torso.rotation.z = t.bank, e.eyes.pivot.scale.y = t.blink, e.eyes.pivot.position.x = t.gazeX;
  let n = r.swing === "z" ? 1 - .85 * t.seated : 1;
  jo(e.legL, t.legL.swing * n, t.legL.raise, t.legL.lift, 1, r), jo(e.legR, t.legR.swing * n, t.legR.raise, t.legR.lift, -1, r), jo(e.armL, t.armL.swing, t.armL.raise, t.armL.lift, 1, r), jo(e.armR, t.armR.swing, t.armR.raise, t.armR.lift, -1, r), r.swing === "x" ? (e.handL.rotation.set(Uo + t.wristL, 0, 0), e.handR.rotation.set(Uo + t.wristR, 0, 0)) : (e.handL.rotation.set(0, 0, -(Uo + t.wristL)), e.handR.rotation.set(0, 0, Uo + t.wristR));
}
import * as Ve from "./001-three-a973dc20bf0957e55145ef9e6b9c97d50275b224b1d81a57603249dd6750ab96.js";
var w0 = 32,
  Qc = new Map();
function k0(e) {
  let t = Qc.get(e);
  if (t) return t;
  let r = w0,
    n = new Uint8Array(r * r * 4);
  for (let a = 0; a < r; a++) for (let s = 0; s < r; s++) {
    let i = (s + .5) / r * 2 - 1,
      l = (a + .5) / r * 2 - 1,
      p = Math.hypot(i, l),
      m;
    if (e === "square") {
      let y = Math.max(Math.abs(i), Math.abs(l));
      m = y < .55 ? 1 : Math.max(0, 1 - (y - .55) / .3) * .5;
    } else if (e === "dot") m = Math.max(0, 1 - p) ** 2.2;else {
      let y = Math.max(0, 1 - p * 2.2) ** 1.5,
        b = Math.max(0, 1 - Math.abs(i) * 9) * Math.max(0, 1 - Math.abs(l)) + Math.max(0, 1 - Math.abs(l) * 9) * Math.max(0, 1 - Math.abs(i));
      m = Math.min(1, y + b * .85);
    }
    let E = (a * r + s) * 4;
    n[E] = 255, n[E + 1] = 255, n[E + 2] = 255, n[E + 3] = Math.round(Math.min(1, m) * 255);
  }
  let o = new Ve.DataTexture(n, r, r, Ve.RGBAFormat);
  return o.magFilter = e === "square" ? Ve.NearestFilter : Ve.LinearFilter, o.minFilter = Ve.LinearFilter, o.needsUpdate = !0, Qc.set(e, o), o;
}
var Kn = class {
  points;
  particles = [];
  geometry = new Ve.BufferGeometry();
  material;
  positions;
  colors;
  color;
  age = 0;
  constructor(t, r, n, o = 42, a = Math.random() * 1e3) {
    this.color = t.clone(), this.positions = new Float32Array(o * 3), this.colors = new Float32Array(o * 4);
    for (let s = 0; s < o; s++) {
      let i = E => tt(a + s * 13.37 + E * 7.1),
        l = i(1) * Math.PI * 2,
        p = .12 + i(2) * .3,
        m = .5 + i(3) * 1.3;
      this.particles.push({
        delay: i(4) * .35,
        life: .45 + i(5) * .6,
        px: Math.sin(l) * p,
        py: .1 + i(6) * .95,
        pz: Math.cos(l) * p,
        vx: Math.sin(l) * m,
        vy: .4 + i(7) * 1.6,
        vz: Math.cos(l) * m,
        twinkle: i(8) * Math.PI * 2
      });
    }
    this.geometry.setAttribute("position", new Ve.BufferAttribute(this.positions, 3)), this.geometry.setAttribute("color", new Ve.BufferAttribute(this.colors, 4)), this.geometry.boundingSphere = new Ve.Sphere(new Ve.Vector3(0, Bn, 0), 3), this.material = new Ve.PointsMaterial({
      size: r === "square" ? .08 : .14,
      map: k0(r),
      vertexColors: !0,
      transparent: !0,
      depthWrite: !1,
      blending: n ? Ve.AdditiveBlending : Ve.NormalBlending,
      toneMapped: !1
    }), this.points = new Ve.Points(this.geometry, this.material), this.points.name = "craig.sparkles", this.points.frustumCulled = !1, this.points.renderOrder = 10, this.update(0);
  }
  restart() {
    this.age = 0, this.update(0);
  }
  update(t) {
    this.age += t;
    let r = !1;
    for (let n = 0; n < this.particles.length; n++) {
      let o = this.particles[n],
        a = this.age - o.delay,
        s = a < 0 ? 0 : a / o.life;
      s < 1 && (r = !0);
      let i = Math.max(0, a),
        l = (1 - Math.exp(-i * 3)) / 3;
      this.positions[n * 3] = o.px + o.vx * l, this.positions[n * 3 + 1] = o.py + o.vy * l, this.positions[n * 3 + 2] = o.pz + o.vz * l;
      let p = a < 0 || s >= 1 ? 0 : Math.sin(Math.PI * Math.min(1, s * 1.4)) ** .8,
        m = .75 + .25 * Math.sin(i * 30 + o.twinkle);
      this.colors[n * 4] = this.color.r * (1 + m), this.colors[n * 4 + 1] = this.color.g * (1 + m), this.colors[n * 4 + 2] = this.color.b * (1 + m), this.colors[n * 4 + 3] = p * m;
    }
    return this.geometry.getAttribute("position").needsUpdate = !0, this.geometry.getAttribute("color").needsUpdate = !0, r;
  }
  dispose() {
    this.points.removeFromParent(), this.geometry.dispose(), this.material.dispose();
  }
};
import * as Fe from "./001-three-a973dc20bf0957e55145ef9e6b9c97d50275b224b1d81a57603249dd6750ab96.js";
var Zi = `
varying vec3 vWorld;
varying vec3 vNormalW;
void main() {
  vec4 world = modelMatrix * vec4(position, 1.0);
  vWorld = world.xyz;
  vNormalW = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * viewMatrix * world;
}
`,
  R0 = `
varying vec3 vWorld;
void main() {
  vec4 world = modelMatrix * vec4(position, 1.0);
  vWorld = world.xyz;
  gl_Position = projectionMatrix * viewMatrix * world;
}
`,
  _i = `
uniform float uTime;
uniform float uReveal;
uniform float uFlicker;
uniform vec3 uScan;
varying vec3 vWorld;
float revealEdge() {
  float d = uReveal - vWorld.y;
  if (d < 0.0) discard;
  return 1.0 - smoothstep(0.0, 0.06, d);
}
`,
  Xc = `
${_i}
uniform vec3 uTint;
uniform vec3 uRim;
varying vec3 vNormalW;
void main() {
  float edge = revealEdge();
  vec3 n = normalize(vNormalW);
  vec3 v = normalize(cameraPosition - vWorld);
  float fres = pow(1.0 - abs(dot(n, v)), 2.4);
  float scan = step(0.5, fract(vWorld.y * 70.0 - uTime * 1.5));
  float band = smoothstep(0.92, 1.0, fract(vWorld.y * 0.9 - uTime * 0.45));
  vec3 col = uTint * (1.0 + scan * 0.35) + uRim * (fres * 0.9 + band * 0.18) + uScan * edge * 3.0;
  float alpha = (0.55 + fres * 0.4 + band * 0.1) * uFlicker + edge;
  gl_FragColor = vec4(col, clamp(alpha, 0.0, 1.0));
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`,
  S0 = `
${_i}
uniform vec3 uColor;
uniform vec3 uRimColor;
varying vec3 vNormalW;
void main() {
  float edge = revealEdge();
  vec3 n = normalize(vNormalW);
  vec3 v = normalize(cameraPosition - vWorld);
  float fres = pow(1.0 - abs(dot(n, v)), 2.0);
  float scan = step(0.5, fract(vWorld.y * 70.0 - uTime * 1.5));
  vec3 col = (uColor * (0.7 - scan * 0.12) + uRimColor * fres * 1.6) * uFlicker + uScan * edge * 3.0;
  gl_FragColor = vec4(col, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`,
  M0 = `
${_i}
uniform vec3 uColor;
void main() {
  float edge = revealEdge();
  gl_FragColor = vec4(uColor * uFlicker + uScan * edge * 2.0, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;
function wt(e, t) {
  return new Fe.Color(e).multiplyScalar(t);
}
function Jc(e, t) {
  let {
    r,
    g: n,
    b: o
  } = new Fe.Color(e);
  return .2126 * r + .7152 * n + .0722 * o < .02 ? t : e;
}
var Zc = (e, t) => {
  let r = {
      uTime: {
        value: 0
      },
      uReveal: {
        value: 1e6
      },
      uFlicker: {
        value: 1
      },
      uScan: {
        value: wt(Qe(t.accent, "#ffffff", .5), 1)
      }
    },
    n = new Fe.ShaderMaterial({
      uniforms: {
        ...r,
        uTint: {
          value: wt(Qe(t.color, "#03060b", .9), 1)
        },
        uRim: {
          value: wt(t.accent, 1)
        }
      },
      vertexShader: Zi,
      fragmentShader: Xc,
      transparent: !0,
      depthWrite: !1
    }),
    o = (L, K) => new Fe.ShaderMaterial({
      uniforms: {
        ...r,
        uColor: {
          value: L
        },
        uRimColor: {
          value: K
        }
      },
      vertexShader: Zi,
      fragmentShader: S0
    }),
    a = o(wt(t.color, .9), wt(t.color, 2.2)),
    s = new Map(),
    i = L => {
      let K = Jc(L, t.accent),
        D = s.get(K);
      return D || (D = o(wt(Qe(K, "#ffffff", .6), 2.4), wt(K, 2)), s.set(K, D)), D;
    },
    l = L => new Fe.ShaderMaterial({
      uniforms: {
        ...r,
        uColor: {
          value: L
        }
      },
      vertexShader: R0,
      fragmentShader: M0,
      transparent: !0,
      depthWrite: !1
    }),
    p = l(wt(t.accent, 1.9)),
    m = [n, a, p],
    {
      depth: E
    } = te.body,
    y = qt(Dn(0, 12), {
      depth: E,
      curveSegments: 12
    }),
    b = new Fe.Mesh(y, n);
  b.position.y = te.body.bottom, b.renderOrder = 2;
  let R = new Fe.LineSegments(new Fe.EdgesGeometry(y, 25), p);
  R.position.y = te.body.bottom, R.renderOrder = 3;
  let v = new Fe.EdgesGeometry(qt(Dn(-.035, 12), {
      depth: .001,
      curveSegments: 12
    }), 25),
    T = new Fe.LineSegments(v, p);
  T.position.set(0, te.body.bottom, E / 2 + .001), T.scale.set(1, 1, 1), T.renderOrder = 3, e.bodyPart.content.add(b, R, T);
  let M = (L, K, D, N, g, S) => {
      let I = qt(Vo(K, D, N, 6), {
          depth: g,
          bevel: .018,
          bevelSegments: 2,
          curveSegments: 8
        }),
        F = new Fe.Mesh(I, a);
      F.position.y = S, L.content.add(F);
    },
    {
      leg: H,
      arm: h
    } = te;
  M(e.legL, H.width, H.height, H.radius, H.depth, Lt), M(e.legR, H.width, H.height, H.radius, H.depth, Lt), M(e.armL, h.width, h.height, h.radius, h.depth, It), M(e.armR, h.width, h.height, h.radius, h.depth, It);
  let P = yr(t.look.outfit);
  if (P) {
    let L = t.look.clothingColor,
      K = new Fe.ShaderMaterial({
        uniforms: {
          ...r,
          uTint: {
            value: wt(Qe(L, "#03060b", .55), 1)
          },
          uRim: {
            value: wt(L, 1.2)
          }
        },
        vertexShader: Zi,
        fragmentShader: Xc,
        transparent: !0,
        depthWrite: !1
      }),
      D = l(wt(Jc(L, t.accent), 1.6));
    m.push(K, D);
    let N = qt(ft(P.band), {
        depth: E + .006,
        curveSegments: 12
      }),
      g = new Fe.Mesh(N, K);
    g.position.y = te.body.bottom, g.renderOrder = 3;
    let S = new Fe.LineSegments(new Fe.EdgesGeometry(N, 25), D);
    S.position.y = te.body.bottom, S.renderOrder = 4, e.bodyPart.content.add(g, S);
    let I = (F, z) => {
      let U = new Fe.Mesh(new Fe.ShapeGeometry(ft(F)), z);
      U.position.set(0, te.body.bottom, E / 2 + .0045), U.renderOrder = 4, e.bodyPart.content.add(U);
    };
    for (let F of P.skin) I(F, n);
    for (let F of P.tie) I(F, i(L));
  }
  e.face.position.z = E / 2 + .006;
  let A = (L, K, D, N = 0) => {
      for (let g of L) {
        let S = new Fe.Mesh(new Fe.ShapeGeometry(ft(g)), i(K));
        S.position.x = N, D.add(S);
      }
    },
    {
      look: w
    } = t;
  for (let L of [-te.eye.x, te.eye.x]) A(mr(w.eyes, .02, 4), w.eyeColor, e.eyes.content, L);
  w.mouth && A([dn()], w.mouthColor, e.mouth.content), w.mustache && A(hr(), w.mouthColor, e.mouth.content), A(gr(w.teeth), w.mouthColor, e.mouth.content), A(br(w.hair), w.eyeColor, e.face);
  let C = new Fe.Vector3(),
    k = 2 + Math.random() * 4,
    W = 0;
  return {
    axes: {
      swing: "x",
      spin: "x"
    },
    sparkle: {
      color: wt(t.accent, 1),
      shape: "dot",
      additive: !0
    },
    update({
      dt: L,
      time: K
    }) {
      r.uTime.value = K, k -= L, k <= 0 && (W = .12, k = 2.5 + Math.random() * 4.5), W > 0 ? (W -= L, r.uFlicker.value = .55 + Math.random() * .45, e.flip.position.x = (Math.random() - .5) * .02) : (r.uFlicker.value = .94 + Math.sin(K * 13) * .03 + Math.sin(K * 31) * .03, e.flip.position.x = 0);
    },
    materialize(L) {
      if (L >= 1) {
        r.uReveal.value = 1e6, r.uFlicker.value = 1;
        return;
      }
      e.root.updateWorldMatrix(!0, !1), e.root.getWorldPosition(C);
      let K = e.turn.scale.y * e.root.scale.y,
        D = Kc(De(L / .85));
      r.uReveal.value = C.y - .05 + D * (te.height + .12) * K, L > .7 && (r.uFlicker.value = Math.random() < .25 ? .4 : 1);
    },
    dispose() {
      for (let L of m) L.dispose();
      for (let L of s.values()) L.dispose();
    }
  };
};
import * as Ae from "./001-three-a973dc20bf0957e55145ef9e6b9c97d50275b224b1d81a57603249dd6750ab96.js";
var jn = .005,
  Yo = .022,
  $i = 720,
  A0 = .22,
  _c = "#fffdf7",
  $c = new Ae.Quaternion(),
  es = new Ae.Vector3();
function P0(e) {
  let t = e.parent;
  return !t || t.isScene ? 0 : (t.getWorldQuaternion($c), es.set(0, 0, 1).applyQuaternion($c), Math.atan2(es.x, es.z));
}
function ru(e) {
  let t = Number.POSITIVE_INFINITY,
    r = Number.POSITIVE_INFINITY,
    n = Number.NEGATIVE_INFINITY,
    o = Number.NEGATIVE_INFINITY;
  for (let [a, s] of e) t = Math.min(t, a), r = Math.min(r, s), n = Math.max(n, a), o = Math.max(o, s);
  return {
    minX: t,
    minY: r,
    w: n - t,
    h: o - r
  };
}
function C0(e) {
  let t = e >>> 0 || 1;
  return () => (t ^= t << 13, t ^= t >>> 17, t ^= t << 5, (t >>> 0) / 4294967296);
}
function eu(e, t, r, n, o) {
  e.beginPath();
  let a = t.map(r);
  a.forEach((s, i) => {
    let l = a[(i + 1) % a.length],
      p = Math.max(1, Math.round(Math.hypot(l[0] - s[0], l[1] - s[1]) / 7));
    for (let m = 0; m < p; m++) {
      let E = m / p,
        y = s[0] + (l[0] - s[0]) * E + (o() - .5) * n,
        b = s[1] + (l[1] - s[1]) * E + (o() - .5) * n;
      i === 0 && m === 0 ? e.moveTo(y, b) : e.lineTo(y, b);
    }
  }), e.closePath();
}
function Ur(e, t, r) {
  e.beginPath(), t.forEach((n, o) => {
    let [a, s] = r(n);
    o === 0 ? e.moveTo(a, s) : e.lineTo(a, s);
  }), e.closePath();
}
function tu(e) {
  let t = ru(e.cut),
    r = Fc(Math.ceil(t.w * $i), Math.ceil(t.h * $i)),
    n = r?.getContext("2d");
  if (!r || !n) return null;
  let o = C0(e.seed),
    a = $i,
    s = ([M, H]) => [(M - t.minX) * a, (t.minY + t.h - H) * a],
    i = M => H => {
      let [h, P] = s(H);
      return [h + M, P - M];
    },
    l = M => {
      let H = new Ae.Color(M);
      return `#${(e.back ? H.multiplyScalar(.9) : H).getHexString()}`;
    },
    [, p] = s([0, e.skin.from]),
    [, m] = s([0, e.skin.to]),
    E = n.createLinearGradient(0, p, 0, m);
  E.addColorStop(0, l(e.skin.bottom)), E.addColorStop(1, l(e.skin.top));
  let y = e.shade;
  Ur(n, e.cut, s), n.fillStyle = e.border, n.fill(), n.lineWidth = 3, n.strokeStyle = "rgba(40, 36, 28, 0.2)", n.stroke(), n.save(), Ur(n, e.inner, s), n.clip(), n.fillStyle = y, n.fillRect(0, 0, r.width, r.height), n.strokeStyle = "rgba(6, 11, 15, 0.3)", n.lineWidth = 2.6;
  for (let M = -r.height; M < r.width; M += 12) n.beginPath(), n.moveTo(M + (o() - .5) * 2, r.height), n.lineTo(M + r.height + (o() - .5) * 2, 0), n.stroke();
  Ur(n, e.inner, i(.03 * a)), n.fillStyle = E, n.fill();
  let b = e.outfit;
  if (b) {
    if (Ur(n, b.band, i(.03 * a)), n.fillStyle = l(b.color), n.fill(), !e.back) {
      for (let M of b.skin) Ur(n, M, i(.03 * a)), n.fillStyle = E, n.fill();
      for (let M of b.tie) Ur(n, M, i(.03 * a)), n.fillStyle = l(b.color), n.fill();
    }
    eu(n, b.band, i(.03 * a), 2, o), n.lineWidth = 2.2, n.strokeStyle = "rgba(18, 26, 8, 0.4)", n.stroke();
  }
  let R = n.createRadialGradient(r.width * .72, r.height * .2, 4, r.width * .6, r.height * .3, r.width * .8);
  R.addColorStop(0, "rgba(255, 255, 255, 0.22)"), R.addColorStop(1, "rgba(255, 255, 255, 0)"), n.fillStyle = R, n.fillRect(0, 0, r.width, r.height), n.restore(), n.save(), Ur(n, e.cut, s), n.clip();
  let v = Math.round(r.width * r.height / 90);
  for (let M = 0; M < v; M++) {
    let H = o() < .5;
    n.fillStyle = H ? `rgba(40, 30, 20, ${.04 + o() * .07})` : `rgba(255, 255, 255, ${.08 + o() * .12})`, n.fillRect(o() * r.width, o() * r.height, 1.5 + o() * 2, 1.5 + o() * 2);
  }
  n.lineWidth = 1.4;
  for (let M = 0; M < 60; M++) {
    let H = o() * r.width,
      h = o() * r.height;
    n.strokeStyle = `rgba(60, 50, 40, ${.07 + o() * .07})`, n.beginPath(), n.moveTo(H, h), n.quadraticCurveTo(H + (o() - .5) * 18, h + (o() - .5) * 18, H + (o() - .5) * 26, h + (o() - .5) * 26), n.stroke();
  }
  n.restore(), n.lineJoin = "round";
  for (let M = 0; M < 2; M++) eu(n, e.inner, s, 2.4, o), n.lineWidth = M === 0 ? 5 : 2.2, n.strokeStyle = M === 0 ? "rgba(18, 26, 8, 0.72)" : "rgba(18, 26, 8, 0.38)", n.stroke();
  let T = new Ae.CanvasTexture(r);
  return T.colorSpace = Ae.SRGBColorSpace, T.anisotropy = 4, T;
}
function H0(e) {
  let t = new Ae.ShapeGeometry(ft(e), 1),
    r = ru(e),
    n = t.getAttribute("position"),
    o = t.getAttribute("uv");
  for (let a = 0; a < n.count; a++) o.setXY(a, (n.getX(a) - r.minX) / r.w, (n.getY(a) - r.minY) / r.h);
  return o.needsUpdate = !0, t;
}
var nu = (e, t) => {
  let r = `#${Qe(_c, t.accent, .12).getHexString()}`,
    n = new Ae.MeshLambertMaterial({
      color: Qe(_c, "#d8d2c4", .4)
    }),
    o = new Ae.MeshBasicMaterial({
      visible: !1
    }),
    a = [n, o],
    s = [],
    i = (F, z) => {
      let U = F ? new Ae.MeshLambertMaterial({
        map: F,
        emissive: 16777215,
        emissiveMap: F,
        emissiveIntensity: .28
      }) : new Ae.MeshLambertMaterial({
        color: z
      });
      return F && s.push(F), a.push(U), U;
    },
    {
      look: l
    } = t,
    p = `#${Qe(t.color, l.shade.top, l.shade.amount).getHexString()}`,
    m = (F, z, U) => ({
      bottom: `#${tr(l, F + U).getHexString()}`,
      top: `#${tr(l, z + U).getHexString()}`,
      from: F,
      to: z
    }),
    E = (F, z, U, Q, $, ie) => {
      let _ = {
          cut: F,
          inner: z,
          skin: $,
          shade: p,
          border: r,
          ...(ie ? {
            outfit: ie
          } : {})
        },
        J = i(tu({
          ..._,
          seed: U,
          back: !1
        }), t.color),
        Z = i(tu({
          ..._,
          seed: U + 1,
          back: !0
        }), t.color),
        X = H0(F),
        B = new Ae.Mesh(X, J);
      B.position.z = jn / 2;
      let d = new Ae.Mesh(X.clone(), Z);
      d.rotation.y = Math.PI, d.position.z = -jn / 2;
      let c = new Ae.Mesh(new Ae.ExtrudeGeometry(ft(F), {
        depth: jn,
        bevelEnabled: !1
      }), [o, n]);
      c.position.z = -jn / 2;
      for (let u of [B, d, c]) u.castShadow = !0, u.receiveShadow = !0, Q.add(u);
      return B;
    },
    y = [],
    b = (F, z, U) => {
      let Q = new Ae.Group();
      return Q.position.set(0, z, U), F.add(Q), y.push({
        group: Q,
        z: U
      }), Q;
    },
    R = yr(l.outfit),
    v = E(fr(Yo, 10), fr(0, 10), 11, b(e.bodyPart.content, te.body.bottom, 0), m(0, te.body.height, te.body.bottom), R ? {
      ...R,
      color: l.clothingColor
    } : void 0),
    T = (F, z, U, Q, $, ie, _, J) => {
      let Z = vt(z + Yo * 2, U + Yo * 2, Q + Yo, 6),
        X = m(-U / 2, U / 2, J);
      E(Z, vt(z, U, Q, 6), _, b(F.content, $, ie), X);
    },
    {
      leg: M,
      arm: H
    } = te,
    h = te.leg.pivot + Lt,
    P = Et + It;
  T(e.legL, M.width, M.height, M.radius, Lt, -.009, 21, h), T(e.legR, M.width, M.height, M.radius, Lt, -.009, 23, h), T(e.armL, H.width, H.height, H.radius, It, .009, 25, P), T(e.armR, H.width, H.height, H.radius, It, -.009, 27, P), e.face.position.z = jn / 2 + .0015;
  let A = new Map(),
    w = F => {
      let z = A.get(F);
      return z || (z = new Ae.MeshBasicMaterial({
        color: F
      }), A.set(F, z), a.push(z)), z;
    },
    C = (F, z, U) => F.map(([Q, $], ie) => [Q + (tt(U + ie) - .5) * z, $ + (tt(U + ie + 50) - .5) * z]),
    k = (F, z, U, Q, $, ie = 0, _ = 0) => {
      F.forEach((J, Z) => {
        let X = new Ae.Mesh(new Ae.ShapeGeometry(ft(C(J, $, Q + Z * 31))), w(z));
        X.position.x = ie, X.rotation.z = _, U.add(X);
      });
    };
  if ([-te.eye.x, te.eye.x].forEach((F, z) => {
    let U = mr(l.eyes, .018, 4);
    k(U, l.eyeColor, e.eyes.content, 5 + z * 9, .004, F, (z === 0 ? 1 : -1) * .03);
  }), l.mouth) {
    let F = vt(te.mouth.width, .017, .0085, 4);
    k([F], l.mouthColor, e.mouth.content, 77, .002, 0, .02);
  }
  l.mustache && k(hr(), Ot, e.mouth.content, 91, .003), k(gr(l.teeth), Ot, e.mouth.content, 103, .002), k(br(l.hair), Ot, e.face, 117, .002);
  let W = new Ae.Vector3(),
    L = new Ae.Vector3(),
    K = !1;
  v.onBeforeRender = (F, z, U) => {
    U.getWorldPosition(W), K = !0;
  };
  let D = !0,
    N = -1,
    g = !0,
    S = 0,
    I = {
      swing: "z",
      spin: "z",
      spinSign: 1
    };
  return {
    axes: I,
    sparkle: {
      color: Qe(t.accent, t.color, .5),
      shape: "star"
    },
    update({
      dt: F,
      time: z,
      pose: U
    }) {
      let Q = U.facing + P0(e.root),
        $ = 0,
        ie = Q;
      K && (e.root.getWorldPosition(L), ie = Math.atan2(W.x - L.x, W.z - L.z), $ = Qt(Q - ie));
      let _ = Math.abs($) < Math.PI / 2;
      N < 0 && _ !== D && Math.abs(Math.abs($) - Math.PI / 2) > .2 && (N = 0, g = _);
      let J = 1;
      if (N >= 0) {
        if (N += F / A0, N >= .5 && D !== g) {
          D = g;
          for (let u of y) u.group.position.z = D ? u.z : -u.z;
        }
        N >= 1 ? N = -1 : J = Math.max(.001, Math.abs(Math.cos(Math.PI * N)));
      }
      let Z = Qt($ - (D ? 0 : Math.PI)),
        X = rr(Z, -.6, .6) * .5,
        B = ie + (D ? 0 : Math.PI) + X;
      e.turn.rotation.y = K ? Qt(B - Q) : 0, S += (Math.sin($) - S) * (1 - Math.exp(-F * 8));
      let d = D ? 1 : -1;
      I.spinSign = (S >= 0 ? -1 : 1) * d;
      let c = U.gait;
      e.flip.scale.x = J, e.flip.rotation.x = Math.sin(z * 8.3) * .03 * (.4 + c) + U.air * .06 * Math.sin(z * 14), e.flip.rotation.y = Math.sin(z * 5.1) * .05 * c, e.flip.rotation.z = -S * d * c * .1;
    },
    materialize(F) {
      let z = Xt(De(F / .55), 1.8);
      e.fx.rotation.x = -Math.PI / 2 * (1 - z), e.fx.scale.setScalar(Math.max(1e-4, .55 + .45 * Er(De(F / .5)))), [e.armL, e.armR, e.legL, e.legR].forEach(($, ie) => {
        let _ = Xt(De((F - .3 - ie * .07) / .4), 2),
          J = (1 - _) * (Math.PI / 2) * (ie < 2 ? 1 : 0);
        $.content.rotation.y = ie === 0 ? J : -J, $.content.rotation.x = ie >= 2 ? (1 - _) * (Math.PI / 2) : 0, $.content.scale.setScalar(Math.max(1e-4, De(_ * 3)));
      });
      let Q = Math.max(1e-4, Xt(De((F - .6) / .3), 2.4));
      e.eyes.content.scale.setScalar(Q), e.mouth.content.scale.setScalar(Q);
    },
    dispose() {
      for (let F of a) F.dispose();
      for (let F of s) F.dispose();
    }
  };
};
import * as Ge from "./001-three-a973dc20bf0957e55145ef9e6b9c97d50275b224b1d81a57603249dd6750ab96.js";
var L0 = .016;
function I0() {
  let e = new Uint8Array([96, 96, 96, 255, 182, 182, 182, 255, 255, 255, 255, 255]),
    t = new Ge.DataTexture(e, 3, 1, Ge.RGBAFormat);
  return t.minFilter = Ge.NearestFilter, t.magFilter = Ge.NearestFilter, t.generateMipmaps = !1, t.needsUpdate = !0, t;
}
function O0(e) {
  let t = new Ge.MeshBasicMaterial({
    color: ct,
    side: Ge.BackSide
  });
  return t.onBeforeCompile = r => {
    r.uniforms.uOutline = {
      value: e
    }, r.vertexShader = r.vertexShader.replace("#include <common>", `#include <common>
attribute vec3 outlineNormal;
uniform float uOutline;`).replace("#include <begin_vertex>", `#include <begin_vertex>
transformed += normalize(outlineNormal) * uOutline;`);
  }, t.customProgramCacheKey = () => "craig-toon-ink", t;
}
function ou(e, t, r) {
  let n = e.getAttribute("position"),
    o = new Float32Array(n.count * 3),
    a = e.groups.filter(i => i.materialIndex === 1),
    s = i => a.some(l => i >= l.start && i < l.start + l.count);
  for (let i = 0; i < n.count; i++) {
    let l = r(n.getY(i) + t, s(i));
    o[i * 3] = l.r, o[i * 3 + 1] = l.g, o[i * 3 + 2] = l.b;
  }
  e.setAttribute("color", new Ge.BufferAttribute(o, 3));
}
var au = e => (t, r) => r ? qi(e, t) : tr(e, t),
  iu = (e, t) => {
    let r = {
      ...e,
      skin: {
        bottom: t,
        top: t
      }
    };
    return (n, o) => o ? qi(r, n) : tr(r, n);
  },
  su = (e, t) => {
    let {
        look: r
      } = t,
      n = I0(),
      o = new Ge.MeshToonMaterial({
        color: "#ffffff",
        vertexColors: !0,
        gradientMap: n
      }),
      a = O0(L0),
      s = new Map(),
      i = h => {
        let P = s.get(h);
        return P || (P = new Ge.MeshBasicMaterial({
          color: h
        }), s.set(h, P)), P;
      },
      l = (h, P, A, w = A, C = au(r)) => {
        Nc(h), ou(h, w, C);
        let k = new Ge.Group();
        k.position.y = A;
        let W = new Ge.Mesh(h, o);
        W.castShadow = !0, W.receiveShadow = !0;
        let L = new Ge.Mesh(h, a);
        return L.name = "craig.ink", k.add(W, L), P.add(k), k;
      },
      {
        depth: p
      } = te.body,
      m = qt(Dn(0, 12), {
        depth: p,
        bevel: .03,
        bevelSegments: 3,
        curveSegments: 14
      });
    l(m, e.bodyPart.content, te.body.bottom);
    let E = yr(r.outfit, .003);
    if (E) {
      let h = qt(ft(E.band), {
        depth: p + .002,
        bevel: .03,
        bevelSegments: 3,
        curveSegments: 14
      });
      l(h, e.bodyPart.content, te.body.bottom, te.body.bottom, iu(r, r.clothingColor));
      let P = p / 2 + .0025,
        A = (w, C, k) => {
          let W = new Ge.ShapeGeometry(ft(w), 4);
          ou(W, te.body.bottom, C);
          let L = new Ge.Mesh(W, o);
          L.position.set(0, te.body.bottom, k), e.bodyPart.content.add(L);
        };
      for (let w of E.skin) A(w, au(r), P);
      for (let w of E.tie) A(w, iu(r, r.clothingColor), P + .001);
    }
    let y = (h, P, A, w, C, k, W) => {
        let L = qt(Vo(P, A, w, 6), {
          depth: C,
          bevel: .022,
          bevelSegments: 2,
          curveSegments: 8
        });
        l(L, h.content, k, W);
      },
      {
        leg: b,
        arm: R
      } = te,
      v = te.leg.pivot + Lt,
      T = Et + It;
    y(e.legL, b.width, b.height, b.radius, b.depth, Lt, v), y(e.legR, b.width, b.height, b.radius, b.depth, Lt, v), y(e.armL, R.width, R.height, R.radius, R.depth, It, T), y(e.armR, R.width, R.height, R.radius, R.depth, It, T), e.face.position.z = p / 2 + .003;
    let M = (h, P, A, w = 0) => {
      for (let C of h) {
        let k = new Ge.Mesh(qt(ft(C), {
          depth: .008
        }), i(P));
        k.position.x = w, A.add(k);
      }
    };
    for (let h of [-te.eye.x, te.eye.x]) M(mr(r.eyes), r.eyeColor, e.eyes.content, h);
    r.mouth && M([dn()], r.mouthColor, e.mouth.content), r.mustache && M(hr(), Ot, e.mouth.content), M(gr(r.teeth), Ot, e.mouth.content), M(br(r.hair), Ot, e.face);
    let H = [e.legL, e.legR, e.armL, e.armR];
    return {
      axes: {
        swing: "x",
        spin: "x"
      },
      sparkle: {
        color: Qe(t.accent, "#ffffff", .15),
        shape: "star"
      },
      materialize(h) {
        let P = Xt(De(h / .62), 2.6);
        e.fx.scale.setScalar(Math.max(1e-4, P)), e.fx.rotation.y = (1 - Er(De(h / .7))) * -1.4, H.forEach((w, C) => {
          let k = De((h - .32 - C * .05) / .45);
          w.content.scale.setScalar(Math.max(1e-4, Xt(k, 3)));
        });
        let A = Math.max(1e-4, Xt(De((h - .5) / .35), 2));
        e.eyes.content.scale.setScalar(A), e.mouth.content.scale.setScalar(A);
      },
      dispose() {
        n.dispose(), o.dispose(), a.dispose();
        for (let h of s.values()) h.dispose();
      }
    };
  };
import * as We from "./001-three-a973dc20bf0957e55145ef9e6b9c97d50275b224b1d81a57603249dd6750ab96.js";
var xr = 16,
  nr = 20,
  Yn = 6,
  Kr = te.body.width / xr,
  Nt = te.body.height / nr,
  mn = Kr;
function lu(e, t, r, n) {
  let o = [];
  for (let a = 0; a < n; a++) for (let s = 0; s < r; s++) for (let i = 0; i < t; i++) {
    if (!e(i, s, a)) continue;
    e(i - 1, s, a) && e(i + 1, s, a) && e(i, s - 1, a) && e(i, s + 1, a) && e(i, s, a - 1) && e(i, s, a + 1) || o.push([i, s, a]);
  }
  return o;
}
function vr(e, t, r) {
  let n = [];
  for (let o of e) {
    let a = o.map(([i, l]) => [i + t, l + r]),
      s = [];
    for (let i = 0; i < nr; i++) for (let l = 0; l < xr; l++) {
      let p = -te.body.width / 2 + (l + .5) * Kr;
      Ui(p, (i + .5) * Nt, a) && s.push([l, i]);
    }
    if (s.length === 0) {
      let i = a.map(R => R[0]),
        l = a.map(R => R[1]),
        p = Math.min(...i),
        m = Math.min(...l),
        E = Math.max(...i) - p,
        y = Math.max(...l) - m,
        b = Fo({
          cx: p + E / 2,
          cy: m + y / 2,
          width: E,
          height: y
        }, xr, nr);
      for (let R = b.row; R < b.row + b.rows; R++) for (let v = b.col; v < b.col + b.cols; v++) s.push([v, R]);
    }
    n.push(...s);
  }
  return n;
}
var cu = (e, t) => {
  let {
      look: r
    } = t,
    n = new We.BoxGeometry(Kr, Nt, mn),
    o = new We.MeshStandardMaterial({
      roughness: .82,
      metalness: 0
    }),
    a = new We.Color(t.accent),
    s = new We.Color(r.clothingColor),
    i = [],
    l = (c, u, x, O) => {
      let j = (O ?? tr(r, x)).clone(),
        Y = tt(c);
      return O ? j.multiplyScalar(.92 + Y * .16) : (j.offsetHSL(0, (tt(c + 3.3) - .5) * .06, (Y - .5) * .07), tt(c + 9.1) > .86 && j.lerp(a, .18)), j.lerp(new We.Color(ct), u);
    },
    p = (c, u, x = n, O = o) => {
      let j = new We.InstancedMesh(x, O, u.length);
      j.castShadow = !0, j.receiveShadow = !0;
      let Y = new We.Matrix4();
      return u.forEach((re, se) => {
        j.setMatrixAt(se, Y.makeTranslation(re.x, re.y, re.z)), j.setColorAt(se, re.color);
      }), j.instanceMatrix.needsUpdate = !0, j.instanceColor && (j.instanceColor.needsUpdate = !0), j.computeBoundingSphere(), c.add(j), i.push({
        mesh: j,
        cubes: u,
        seed: i.length * 101
      }), j;
    },
    m = Oc(xr, nr),
    E = (c, u, x) => x >= 0 && x < Yn && (m[u]?.[c] ?? !1),
    y = Yn * mn,
    b = yr(r.outfit),
    R = (c, u) => u * xr + c,
    v = new Set((b ? vr(b.skin, 0, 0) : []).map(([c, u]) => R(c, u))),
    T = new Set((b ? vr(b.tie, 0, 0) : []).map(([c, u]) => R(c, u))),
    M = (c, u, x, O) => {
      if (!b || (u + .5) * Nt > Qi) return;
      let j = x === Yn - 1;
      if (j && T.has(R(c, u))) return s;
      if (!(j && v.has(R(c, u)))) return s;
    },
    H = lu(E, xr, nr, Yn).map(([c, u, x]) => {
      let O = te.body.bottom + (u + .5) * Nt;
      return {
        x: -te.body.width / 2 + (c + .5) * Kr,
        y: O,
        z: -y / 2 + (x + .5) * mn,
        color: l(c * 31 + u * 57 + x * 13, x === Yn - 1 ? 0 : .04, O, M(c, u, x, O)),
        h: u / nr
      };
    });
  p(e.bodyPart.content, H);
  let h = (c, u, x, O, j, Y) => {
    let se = lu((ee, me, de) => {
      if (ee < 0 || me < 0 || de < 0 || ee >= u || me >= x || de >= O) return !1;
      let ne = ee === 0 || ee === u - 1,
        ce = me === 0 || me === x - 1;
      return !(ne && ce);
    }, u, x, O).map(([ee, me, de]) => ({
      x: (ee - (u - 1) / 2) * Kr,
      y: j + (me + .5) * Nt,
      z: (de - (O - 1) / 2) * mn,
      color: l(ee * 17 + me * 23 + de * 5 + u * 97, .03, Y + j + (me + .5) * Nt),
      h: (j + te.leg.pivot + me * Nt) / te.height
    }));
    p(c.content, se);
  };
  h(e.legL, 4, 7, 4, -te.leg.pivot, te.leg.pivot), h(e.legR, 4, 7, 4, -te.leg.pivot, te.leg.pivot);
  let P = te.arm.top - te.arm.height - Et;
  h(e.armL, 3, 6, 3, P, Et), h(e.armR, 3, 6, 3, P, Et);
  let A = new We.BoxGeometry(Kr, Nt, mn * .5),
    w = new We.MeshStandardMaterial({
      color: "#ffffff",
      roughness: .6
    });
  e.face.position.z = y / 2 + mn * .2;
  let C = c => Fo({
      cx: c,
      cy: te.eye.y - te.body.bottom,
      width: te.eye.width,
      height: te.eye.height
    }, xr, nr),
    k = C(-te.eye.x),
    W = te.body.bottom + (k.row + k.rows / 2) * Nt;
  e.eyes.pivot.position.y = W;
  let L = (c, u, x) => {
      let O = c === ct ? "#1c2630" : Qe(c, "#ffffff", .25);
      return new We.Color(c).lerp(new We.Color(O), tt(u * 7 + x * 3) * .5);
    },
    K = (c, u, x) => {
      let O = new Set(),
        j = [];
      for (let [Y, re] of c) O.has(R(Y, re)) || (O.add(R(Y, re)), j.push({
        x: -te.body.width / 2 + (Y + .5) * Kr,
        y: te.body.bottom + (re + .5) * Nt - u,
        z: 0,
        color: L(x, Y, re),
        h: re / nr
      }));
      return j;
    },
    D = (c, u) => {
      u.length > 0 && p(c, u, A, w);
    },
    N = te.eye.y - te.body.bottom,
    g = mr(r.eyes),
    S = c => {
      let u = [];
      for (let x = c.row; x < c.row + c.rows; x++) for (let O = c.col; O < c.col + c.cols; O++) u.push([O, x]);
      return u;
    },
    I = r.eyes === "vertical" ? [...S(k), ...S(C(te.eye.x))] : [...vr(g, -te.eye.x, N), ...vr(g, te.eye.x, N)];
  D(e.eyes.content, K(I, W, r.eyeColor));
  let F = te.mouth.y - te.body.bottom,
    z = Fo({
      cx: 0,
      cy: F,
      width: te.mouth.width,
      height: te.mouth.height
    }, xr, nr),
    U = te.body.bottom + (z.row + .5) * Nt;
  e.mouth.pivot.position.y = U, r.mouth && D(e.mouth.content, K(vr([dn()], 0, F), U, r.mouthColor));
  let Q = [...(r.mustache ? vr(hr(), 0, F) : []), ...vr(gr(r.teeth), 0, F)];
  D(e.mouth.content, K(Q, U, Ot)), D(e.face, K(vr(br(r.hair), 0, -te.body.bottom), 0, Ot));
  let $ = new We.Matrix4(),
    ie = new We.Quaternion(),
    _ = new We.Quaternion(),
    J = new We.Vector3(),
    Z = new We.Vector3(),
    X = new We.Euler(),
    B = new We.Quaternion(),
    d = !0;
  return {
    axes: {
      swing: "x",
      spin: "x"
    },
    sparkle: {
      color: Qe(t.color, "#ffffff", .35),
      shape: "square"
    },
    materialize(c) {
      if (!(c >= 1 && d)) {
        d = c >= 1;
        for (let u of i) u.cubes.forEach((x, O) => {
          let j = u.seed + O * 1.618,
            Y = x.h * .42 + tt(j) * .12,
            re = De((c - Y) / .4);
          if (re >= 1) $.makeTranslation(x.x, x.y, x.z);else {
            let se = Xt(re, 1.4),
              ee = tt(j + 1) * Math.PI * 2,
              me = .7 + tt(j + 2) * .9,
              de = x.x + Math.sin(ee) * me,
              ne = x.y + .4 + tt(j + 3) * 1.1,
              ce = x.z + Math.cos(ee) * me;
            J.set(de + (x.x - de) * se, ne + (x.y - ne) * se, ce + (x.z - ce) * se), X.set(tt(j + 4) * 6, tt(j + 5) * 6, tt(j + 6) * 6), _.setFromEuler(X), ie.slerpQuaternions(_, B, Er(re)), Z.setScalar(Math.max(1e-4, .25 + .75 * Er(re)) * (re <= 0 ? 0 : 1) + 1e-4), $.compose(J, ie, Z);
          }
          u.mesh.setMatrixAt(O, $);
        }), u.mesh.instanceMatrix.needsUpdate = !0;
      }
    },
    dispose() {
      n.dispose(), A.dispose(), o.dispose(), w.dispose();
    }
  };
};
var ts = {
    toon: su,
    neon: Zc,
    voxel: cu,
    paper: nu
  },
  uu = /^#[0-9a-f]{6}$/i;
function pu(e, t, r) {
  let n = e.style in ts ? e.style : "toon",
    o = Wc(uu.test(e.color) ? e.color : "#b6ff00", r, t),
    a = o.skin.top,
    s = {
      toon: a,
      neon: a,
      voxel: `#${Qe(a, ct, .3).getHexString()}`,
      paper: "#ffffff"
    },
    i = e.accent && uu.test(e.accent) ? e.accent : s[n],
    l = e.scale && Number.isFinite(e.scale) && e.scale > 0 ? e.scale : 1;
  return {
    style: n,
    color: a,
    accent: i,
    scale: l,
    look: o
  };
}
var N0 = {
  speed: 0,
  runSpeed: 6.5,
  grounded: !0,
  vy: 0,
  jumped: !1,
  landed: !1,
  yaw: 0
};
function F0(e) {
  let t = new Set([e.eyes.pivot, e.mouth.pivot]);
  return [e.bodyPart.content, e.face, e.eyes.content, e.mouth.content, e.legL.content, e.legR.content, e.armL.content, e.armR.content].flatMap(n => n.children.filter(o => !t.has(o)));
}
var qo = e => {
  let t = e.look,
    r = null,
    n = pu(e, r, t),
    o = qc();
  o.turn.scale.setScalar(n.scale);
  let a = ts[n.style](o, n),
    s = new Kn(a.sparkle.color, a.sparkle.shape, a.sparkle.additive ?? !1, 1);
  s.points.visible = !1;
  let i = null,
    l = () => {
      if (i) {
        i.style.dispose();
        for (let h of i.built) Ki(h);
        i = null;
      }
    },
    p = new zo(),
    m = 0,
    E = 0,
    y = !1,
    b = null,
    R = null,
    v = {
      "hand-right": o.handR,
      "hand-left": o.handL,
      back: o.back
    },
    T = {},
    M = () => p.setHolding(!!T["hand-left"], !!T["hand-right"]),
    H = () => {
      if (!b) return;
      let h = b;
      b = null, h.timer && clearTimeout(h.timer), a.materialize(1), h.resolve();
    };
  return Ji(o, p.step(0, N0), a.axes), m = o.root.rotation.y, a.materialize(1), {
    root: o.root,
    height: te.height * n.scale,
    update(h, P) {
      if (y) return;
      let A = Number.isFinite(h) ? Math.max(0, h) : 0;
      E += A, Math.abs(Qt(o.root.rotation.y - m)) > 1e-4 && p.snapFacing(o.root.rotation.y);
      let w = p.step(A, P);
      if (Ji(o, w, a.axes), m = o.root.rotation.y, a.update?.({
        dt: A,
        time: E,
        pose: w,
        motion: P
      }), b) {
        b.elapsed += A * 1e3;
        let C = Math.min(1, b.elapsed / b.duration);
        C >= 1 ? H() : a.materialize(C);
      }
      R?.burst.points.visible && !R.burst.update(A) && (R.burst.points.visible = !1);
    },
    sparklePrototype: s.points,
    materialize(h = 700) {
      if (y) return Promise.resolve();
      H();
      let P = Math.max(1, h);
      if (R?.style !== a) {
        R?.burst.dispose();
        let A = new Kn(a.sparkle.color, a.sparkle.shape, a.sparkle.additive ?? !1);
        o.root.add(A.points), R = {
          burst: A,
          style: a
        };
      } else R.burst.restart();
      return R.burst.points.visible = !0, new Promise(A => {
        b = {
          elapsed: 0,
          duration: P,
          resolve: A,
          timer: setTimeout(H, P + 400)
        }, a.materialize(0);
      });
    },
    setVisible(h) {
      o.root.visible = h;
    },
    attach(h, P) {
      let A = v[P],
        w = {
          slot: P,
          detach() {}
        };
      if (!A || !h || y) return w;
      let C = T[P];
      C && C !== h && C.removeFromParent();
      for (let k of Object.keys(T)) k !== P && T[k] === h && delete T[k];
      return T[P] = h, A.add(h), M(), w.detach = () => {
        T[P] === h && (delete T[P], h.parent === A && h.removeFromParent(), M());
      }, w;
    },
    gesture(h, P) {
      if (y) return {
        duration: 0,
        impact: 0
      };
      let A = P?.hand ?? (T["hand-right"] ? "right" : T["hand-left"] ? "left" : "right");
      return p.gesture(h, A === "left" ? -1 : 1, P?.speed ?? 1);
    },
    get gesturing() {
      return p.gesturing;
    },
    setLook(h, P) {
      if (y) return;
      r = h, P !== void 0 && (t = P);
      let A = pu(e, r, t);
      if (Gc(A.look, n.look) && A.accent === n.accent) return;
      n = A, l();
      let w = F0(o);
      for (let C of w) C.removeFromParent();
      i = {
        style: a,
        built: w
      }, a = ts[n.style](o, n), a.materialize(b ? Math.min(1, b.elapsed / b.duration) : 1);
    },
    setScale(h, P, A) {
      y || o.turn.scale.set(n.scale * h, n.scale * P, n.scale * A);
    },
    dispose() {
      y || (y = !0, H(), R?.burst.dispose(), R = null, o.root.removeFromParent(), Ki(o.root), a.dispose(), l(), s.dispose());
    }
  };
};
import * as rt from "./001-three-a973dc20bf0957e55145ef9e6b9c97d50275b224b1d81a57603249dd6750ab96.js";
var Ye = e => e < 0 ? 0 : e > 1 ? 1 : e,
  ut = (e, t, r) => {
    let n = Ye((r - e) / (t - e));
    return n * n * (3 - 2 * n);
  },
  jr = e => 1 - (1 - Ye(e)) ** 3,
  Qo = e => Ye(e) ** 3,
  rs = e => {
    let t = Ye(e);
    return t < .5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
  },
  du = e => {
    let t = Ye(e);
    return t === 0 || t === 1 ? t : 2 ** (-9 * t) * Math.sin((t * 9 - .75) * (2 * Math.PI / 3.2)) + 1;
  },
  fu = e => {
    let t = Ye(e),
      r = 1.9;
    return (r + 1) * t * t * t - r * t * t;
  },
  mu = (e, t, r, n) => e + (t - e) * (1 - Math.exp(-r * n));
var or = 58,
  ns = .12,
  ar = .65,
  os = 4,
  bu = .85,
  V0 = .35;
var Xo = 64,
  hu = 160,
  gu = [40, 92],
  W0 = .3,
  as = "#dfe8ff",
  Jo = .28;
function yu(e) {
  let t = Ye(e);
  return {
    level: t,
    tint: W0 * t,
    streaks: t,
    streakWidth: .35 + .65 * t
  };
}
var is = e => jr(e / ns),
  ss = (e, t = ar) => 1 - ut(0, 1, e / t);
function Zo(e, t = ar) {
  let r = Ye(e / t);
  return t * (r - r ** 3 + r ** 4 / 2);
}
var Eu = (e, t, r = ar) => e + (or - e) * ss(t, r),
  vu = e => (e % Xo + Xo) % Xo,
  ls = e => vu(e / 1e3),
  xu = (e, t) => vu(e + t),
  Qn = e => Math.min(6, Math.max(1.5, (Number.isFinite(e) ? e : 0) * .75));
function Tu(e, t, r = V0) {
  let n = t - r;
  return e <= n ? e : t - r * Math.exp(-(e - n) / r);
}
var wu = () => performance.timeOrigin + performance.now(),
  ku = (e, t) => {
    let r = Ye(e);
    return (t - 2) * r ** 3 + (3 - t) * r ** 2;
  },
  Ru = (e, t, r) => Math.min(3, Math.max(0, e * t / Math.max(r, 1e-6)));
var qn = e => Number.isInteger(e) ? e.toFixed(1) : String(e),
  Su = `
float cruiseStreaks( vec2 q, float clock, float width ) {
  float r = length( q );
  float lanePos = ( atan( q.y, q.x ) / 6.28318530718 + 0.5 ) * ${qn(hu)};
  float cell = floor( lanePos );
  float rnd = pwHash( vec2( cell, 7.13 ) );
  float rnd2 = pwHash( vec2( cell, 1.71 ) );
  float across = abs( fract( lanePos ) - 0.5 ) * 6.28318530718 * r / ${qn(hu)};
  float line = exp( -pow( across / ( ( 0.0016 + rnd2 * 0.0022 ) * width ), 2.0 ) );
  float turns = floor( mix( ${qn(gu[0])}, ${qn(gu[1] + 1)}, rnd ) );
  float travel = fract( rnd * 7.0 - clock * turns / ${qn(Xo)} + log( r + 0.04 ) * 0.55 );
  float dash = smoothstep( 0.0, 0.04, travel ) * pow( 1.0 - travel, 2.5 );
  return line * dash * step( 0.3, rnd2 ) * smoothstep( 0.06, 0.45, r ) * ( 0.55 + 0.45 * rnd );
}
`;
var wr = [-.35, 1.2],
  ds = .0055,
  fs = .004,
  Mu = 12,
  G0 = .0012,
  cs = 5,
  B0 = 4,
  D0 = 6,
  z0 = 1.6,
  us = .3,
  ps = .6,
  U0 = .15,
  K0 = .25,
  Au = .2,
  j0 = [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]],
  Ft = (e, t, r) => Math.min(r, Math.max(t, e)),
  _o = e => Math.atan2(Math.sin(e), Math.cos(e)),
  Tr = (e, t) => 1 - Math.exp(-e * t),
  Y0 = e => e * e * (3 - 2 * e),
  hn = new rt.Vector3(),
  Pu = new rt.Vector3(),
  Cu = new rt.Vector3();
function q0(e, t, r, n) {
  hn.set(r.z, 0, -r.x), hn.lengthSq() < 1e-8 && hn.set(1, 0, 0), hn.normalize(), Pu.crossVectors(hn, r).normalize();
  let o = Number.POSITIVE_INFINITY;
  for (let [a, s] of j0) {
    Cu.copy(t).addScaledVector(hn, a * Au).addScaledVector(Pu, s * Au);
    let i = e(Cu, r, Math.min(n, o));
    i && i.distance < o && (o = i.distance);
  }
  return o;
}
function Hu(e) {
  let t = new rt.PerspectiveCamera(e.fov, 1, .05, 900),
    [r, n] = e.zoom,
    o = 0,
    a = Ft(e.pitch, ...wr),
    s = Ft(e.distance, r, n),
    i = s,
    l = e.height,
    p = e.fov,
    m = cs,
    E = n,
    y = null,
    b = null,
    R = !1,
    v = new rt.Vector3(),
    T = new rt.Vector3(),
    M = new rt.Vector3(),
    H = new rt.Vector3(),
    h = new rt.Vector3(),
    P = new rt.Vector3(),
    A = new rt.Vector3(),
    w = null,
    C = new rt.Vector3(),
    k = null,
    W = null,
    L = N => N.set(-Math.sin(o) * Math.cos(a), Math.sin(a), -Math.cos(o) * Math.cos(a)),
    K = () => {
      L(H), M.copy(v).addScaledVector(H, i);
    },
    D = () => {
      t.fov !== p && (t.fov = p, t.updateProjectionMatrix());
    };
  return {
    camera: t,
    captureRig() {
      return {
        pivot: v.toArray(),
        distance: i,
        zoom: s
      };
    },
    restore(N, g, S, I, F, z) {
      w = null, k = null, y = null, W = z ? {
        point: z.point.clone(),
        normal: z.normal.clone().setY(0).normalize()
      } : null, t.position.fromArray(g), t.quaternion.fromArray(S);
      let U = t.getWorldDirection(new rt.Vector3());
      o = Math.atan2(U.x, U.z), a = Ft(Math.asin(-U.y), ...wr), F ? v.fromArray(F.pivot) : v.set(N.x, N.y + l, N.z), i = F?.distance ?? t.position.distanceTo(v), s = F?.zoom ?? Ft(i, r, n), M.copy(t.position), t.fov = I, t.updateProjectionMatrix(), t.updateMatrixWorld(!0);
    },
    get yaw() {
      return o;
    },
    get pitch() {
      return a;
    },
    snapBehind(N, g, S = e.pitch) {
      D(), W = null, o = g, a = Ft(S, ...wr), i = s, w = null, y = null, v.set(N.x, N.y + l, N.z), K(), t.position.copy(M), t.lookAt(v);
    },
    startArrival(N, g, S, I, F) {
      D(), W = null, o = g, a = Ft(S, ...wr), i = ps * 2;
      let z = new rt.Vector3(Math.sin(o) * Math.cos(a), -Math.sin(a), Math.cos(o) * Math.cos(a));
      w = {
        eye: N.clone(),
        dir: z,
        out: new rt.Vector3(Math.sin(o), 0, Math.cos(o)),
        elapsed: 0,
        duration: Math.max(.001, (I ?? 900) / 1e3),
        glide: F ? {
          speed: Math.max(0, F.speed),
          fov: F.fov,
          settle: Math.max(.001, F.settleMs / 1e3)
        } : null
      }, F && t.fov !== F.fov && (t.fov = F.fov, t.updateProjectionMatrix()), t.position.copy(N), t.lookAt(A.copy(N).add(z)), v.set(Number.NaN, 0, 0);
    },
    keepInFront(N) {
      k = N ? {
        point: N.point.clone(),
        normal: N.normal.clone().setY(0).normalize(),
        radius: N.radius ?? 7
      } : null;
    },
    orbit(N, g) {
      (N !== 0 || g !== 0) && (R = !1), o = _o(o - N * ds), a = Ft(a + g * fs, ...wr), g !== 0 && (y = null);
    },
    setRig(N) {
      if (N) {
        b === null && (b = s), l = N.height ?? e.height, p = N.fov ?? e.fov, m = N.followRate ?? cs, N.distance !== void 0 && Number.isFinite(N.distance) && (E = Math.max(n, N.distance * z0), s = Ft(N.distance, r, E)), y = N.pitch !== void 0 && Number.isFinite(N.pitch) ? Ft(N.pitch, ...wr) : null;
        return;
      }
      l = e.height, p = e.fov, m = cs, E = n, y = null, b !== null && (s = Ft(b, r, n)), b = null;
    },
    update(N, g, S, I) {
      if (g.zoom !== 0 && (s = Ft(s * Math.exp(g.zoom * G0), r, E)), o += g.turn, R) {
        let $ = _o(S.heading - o);
        o += $ * Tr(Mu, N), a += (e.pitch - a) * Tr(Mu, N), Math.abs($) < .01 && Math.abs(e.pitch - a) < .01 && (R = !1);
      } else g.follow && (o += _o(S.heading - o) * Tr(m, N));
      if (o = _o(o), y !== null && (a += (y - a) * Tr(B0, N), Math.abs(y - a) < .001 && (a = y, y = null)), !w && t.fov !== p) {
        let $ = t.fov + (p - t.fov) * Tr(D0, N);
        t.fov = Math.abs(p - $) < .01 ? p : $, t.updateProjectionMatrix();
      }
      T.set(S.feet.x, S.feet.y + l, S.feet.z), Number.isNaN(v.x) && v.copy(T);
      let F = Tr(16, N);
      v.x += (T.x - v.x) * F, v.z += (T.z - v.z) * F, v.y += (T.y - v.y) * Tr(7, N), L(H);
      let z = s,
        U = ps,
        Q = s + us;
      if (W) if (A.copy(t.position).sub(W.point).dot(W.normal) >= 0) W = null;else {
        let $ = A.copy(v).sub(W.point).dot(W.normal),
          ie = H.dot(W.normal);
        $ > 0 && ie < -.001 && (Q = Math.min(Q, $ / -ie));
      }
      if (I) {
        let $ = q0(I, v, H, Q);
        $ < Number.POSITIVE_INFINITY && (z = Math.min(z, $ - us), U = Math.max(U0, Math.min(ps, $ - us * .5)));
      }
      if (k) if (A.copy(S.feet).sub(k.point).setY(0), A.length() > k.radius) k = null;else {
        let $ = A.copy(v).sub(k.point).dot(k.normal) - K0,
          ie = H.dot(k.normal);
        ie < -.001 && (z = Math.min(z, Math.max(0, $) / -ie));
      }
      if (z = Math.max(U, z), i = z < i ? z : i + (z - i) * Tr(3, N), K(), w) {
        let $ = w.elapsed;
        w.elapsed += N;
        let ie = Y0(Math.min(1, $ / w.duration)),
          _ = w.glide;
        if (C.copy(w.eye), _) {
          let J = A.copy(S.feet).sub(w.eye).dot(w.out),
            Z = Tu(_.speed * Zo($, _.settle), Math.max(0, J - bu));
          C.addScaledVector(w.out, Math.max(0, Z));
          let X = Eu(e.fov, $, _.settle);
          t.fov !== X && (t.fov = X, t.updateProjectionMatrix());
        }
        h.copy(v).sub(M).normalize(), h.lerp(w.dir, 1 - ie).normalize(), t.position.lerpVectors(C, M, ie), t.lookAt(P.copy(t.position).add(h)), ie >= 1 && (!_ || $ >= _.settle) && (w = null);
        return;
      }
      t.position.copy(M), t.lookAt(v);
    },
    setAspect(N) {
      t.aspect = N, t.updateProjectionMatrix();
    },
    recenter() {
      R = !0, y = null;
    }
  };
}
import * as ht from "./001-three-a973dc20bf0957e55145ef9e6b9c97d50275b224b1d81a57603249dd6750ab96.js";
import { Vector3 as Lu } from "./001-three-a973dc20bf0957e55145ef9e6b9c97d50275b224b1d81a57603249dd6750ab96.js";
var kt = class {
  constructor(t = new Lu(0, 0, 0), r = new Lu(0, 1, 0), n = 1) {
    this.start = t, this.end = r, this.radius = n;
  }
  clone() {
    return new this.constructor().copy(this);
  }
  set(t, r, n) {
    return this.start.copy(t), this.end.copy(r), this.radius = n, this;
  }
  copy(t) {
    return this.start.copy(t.start), this.end.copy(t.end), this.radius = t.radius, this;
  }
  getCenter(t) {
    return t.copy(this.end).add(this.start).multiplyScalar(.5);
  }
  translate(t) {
    return this.start.add(t), this.end.add(t), this;
  }
  intersectsBox(t) {
    return ms(this.start.x, this.start.y, this.end.x, this.end.y, t.min.x, t.max.x, t.min.y, t.max.y, this.radius) && ms(this.start.x, this.start.z, this.end.x, this.end.z, t.min.x, t.max.x, t.min.z, t.max.z, this.radius) && ms(this.start.y, this.start.z, this.end.y, this.end.z, t.min.y, t.max.y, t.min.z, t.max.z, this.radius);
  }
};
function ms(e, t, r, n, o, a, s, i, l) {
  return (o - e < l || o - r < l) && (e - a < l || r - a < l) && (s - t < l || s - n < l) && (t - i < l || n - i < l);
}
import * as Ee from "./001-three-a973dc20bf0957e55145ef9e6b9c97d50275b224b1d81a57603249dd6750ab96.js";
import { Box3 as gs, Line3 as Ou, Plane as Q0, Sphere as X0, Triangle as J0, Vector3 as Wt, Layers as Z0 } from "./001-three-a973dc20bf0957e55145ef9e6b9c97d50275b224b1d81a57603249dd6750ab96.js";
var Vt = new Wt(),
  Xn = new Wt(),
  $o = new Wt(),
  Jn = new Wt(),
  at = new Q0(),
  hs = new Ou(),
  _0 = new Ou(),
  ea = new gs(),
  ta = new X0(),
  Zn = new kt(),
  Iu = new Wt(),
  $0 = new Wt(),
  eg = new Wt(),
  tg = new Wt(),
  rg = 1e-10;
function ng(e, t, r = null, n = null) {
  let o = $0.copy(e.end).sub(e.start),
    a = eg.copy(t.end).sub(t.start),
    s = tg.copy(t.start).sub(e.start),
    i = o.dot(a),
    l = o.dot(o),
    p = a.dot(a),
    m = a.dot(s),
    E = o.dot(s),
    y,
    b,
    R = l * p - i * i;
  if (Math.abs(R) < rg) {
    let v = -m / p,
      T = (i - m) / p;
    Math.abs(v - .5) < Math.abs(T - .5) ? (y = 0, b = v) : (y = 1, b = T);
  } else y = (m * i + E * p) / R, b = (y * i - m) / p;
  b = Math.max(0, Math.min(1, b)), y = Math.max(0, Math.min(1, y)), r && r.copy(o).multiplyScalar(y).add(e.start), n && n.copy(a).multiplyScalar(b).add(t.start);
}
var ra = class e {
  constructor(t) {
    this.box = t, this.bounds = new gs(), this.layers = new Z0(), this.trianglesPerLeaf = 8, this.maxLevel = 16, this.subTrees = [], this.triangles = [];
  }
  addTriangle(t) {
    return this.bounds.min.x = Math.min(this.bounds.min.x, t.a.x, t.b.x, t.c.x), this.bounds.min.y = Math.min(this.bounds.min.y, t.a.y, t.b.y, t.c.y), this.bounds.min.z = Math.min(this.bounds.min.z, t.a.z, t.b.z, t.c.z), this.bounds.max.x = Math.max(this.bounds.max.x, t.a.x, t.b.x, t.c.x), this.bounds.max.y = Math.max(this.bounds.max.y, t.a.y, t.b.y, t.c.y), this.bounds.max.z = Math.max(this.bounds.max.z, t.a.z, t.b.z, t.c.z), this.triangles.push(t), this;
  }
  calcBox() {
    return this.box = this.bounds.clone(), this.box.min.x -= .01, this.box.min.y -= .01, this.box.min.z -= .01, this;
  }
  split(t) {
    if (!this.box) return;
    let r = [],
      n = Xn.copy(this.box.max).sub(this.box.min).multiplyScalar(.5);
    for (let a = 0; a < 2; a++) for (let s = 0; s < 2; s++) for (let i = 0; i < 2; i++) {
      let l = new gs(),
        p = Vt.set(a, s, i);
      l.min.copy(this.box.min).add(p.multiply(n)), l.max.copy(l.min).add(n), r.push(new e(l));
    }
    let o;
    for (; o = this.triangles.pop();) for (let a = 0; a < r.length; a++) r[a].box.intersectsTriangle(o) && r[a].triangles.push(o);
    for (let a = 0; a < r.length; a++) {
      let s = r[a].triangles.length;
      s > this.trianglesPerLeaf && t < this.maxLevel && r[a].split(t + 1), s !== 0 && this.subTrees.push(r[a]);
    }
    return this;
  }
  build() {
    return this.calcBox(), this.split(0), this;
  }
  getRayTriangles(t, r) {
    for (let n = 0; n < this.subTrees.length; n++) {
      let o = this.subTrees[n];
      if (t.intersectsBox(o.box)) if (o.triangles.length > 0) for (let a = 0; a < o.triangles.length; a++) r.indexOf(o.triangles[a]) === -1 && r.push(o.triangles[a]);else o.getRayTriangles(t, r);
    }
  }
  triangleCapsuleIntersect(t, r) {
    r.getPlane(at);
    let n = at.distanceToPoint(t.start) - t.radius,
      o = at.distanceToPoint(t.end) - t.radius;
    if (n > 0 && o > 0 || n < -t.radius && o < -t.radius) return !1;
    let a = Math.abs(n / (Math.abs(n) + Math.abs(o))),
      s = Vt.copy(t.start).lerp(t.end, a);
    if (r.containsPoint(s)) return {
      normal: at.normal.clone(),
      point: s.clone(),
      depth: Math.abs(Math.min(n, o))
    };
    let i = t.radius * t.radius,
      l = hs.set(t.start, t.end),
      p = [[r.a, r.b], [r.b, r.c], [r.c, r.a]];
    for (let m = 0; m < p.length; m++) {
      let E = _0.set(p[m][0], p[m][1]);
      if (ng(l, E, $o, Jn), $o.distanceToSquared(Jn) < i) return {
        normal: $o.clone().sub(Jn).normalize(),
        point: Jn.clone(),
        depth: t.radius - $o.distanceTo(Jn)
      };
    }
    return !1;
  }
  triangleBoxIntersect(t, r) {
    if (Math.max(r.a.x, r.b.x, r.c.x) < t.min.x || Math.min(r.a.x, r.b.x, r.c.x) > t.max.x || Math.max(r.a.y, r.b.y, r.c.y) < t.min.y || Math.min(r.a.y, r.b.y, r.c.y) > t.max.y || Math.max(r.a.z, r.b.z, r.c.z) < t.min.z || Math.min(r.a.z, r.b.z, r.c.z) > t.max.z || !t.intersectsTriangle(r)) return !1;
    r.getPlane(at), Vt.x = at.normal.x > 0 ? t.min.x : t.max.x, Vt.y = at.normal.y > 0 ? t.min.y : t.max.y, Vt.z = at.normal.z > 0 ? t.min.z : t.max.z;
    let n = at.distanceToPoint(Vt),
      o = {
        depth: -n,
        normal: at.normal.clone(),
        point: Vt.clone()
      };
    return o.point.addScaledVector(o.normal, n), o;
  }
  triangleSphereIntersect(t, r) {
    if (r.getPlane(at), !t.intersectsPlane(at)) return !1;
    let n = Math.abs(at.distanceToSphere(t)),
      o = t.radius * t.radius - n * n,
      a = at.projectPoint(t.center, Vt);
    if (r.containsPoint(t.center)) return {
      normal: at.normal.clone(),
      point: a.clone(),
      depth: Math.abs(at.distanceToSphere(t))
    };
    let s = [[r.a, r.b], [r.b, r.c], [r.c, r.a]];
    for (let i = 0; i < s.length; i++) {
      hs.set(s[i][0], s[i][1]), hs.closestPointToPoint(a, !0, Xn);
      let l = Xn.distanceToSquared(t.center);
      if (l < o) return {
        normal: t.center.clone().sub(Xn).normalize(),
        point: Xn.clone(),
        depth: t.radius - Math.sqrt(l)
      };
    }
    return !1;
  }
  getSphereTriangles(t, r) {
    for (let n = 0; n < this.subTrees.length; n++) {
      let o = this.subTrees[n];
      if (t.intersectsBox(o.box)) if (o.triangles.length > 0) for (let a = 0; a < o.triangles.length; a++) r.indexOf(o.triangles[a]) === -1 && r.push(o.triangles[a]);else o.getSphereTriangles(t, r);
    }
  }
  getBoxTriangles(t, r) {
    for (let n = 0; n < this.subTrees.length; n++) {
      let o = this.subTrees[n];
      if (t.intersectsBox(o.box)) if (o.triangles.length > 0) for (let a = 0; a < o.triangles.length; a++) r.indexOf(o.triangles[a]) === -1 && r.push(o.triangles[a]);else o.getBoxTriangles(t, r);
    }
  }
  getCapsuleTriangles(t, r) {
    for (let n = 0; n < this.subTrees.length; n++) {
      let o = this.subTrees[n];
      if (t.intersectsBox(o.box)) if (o.triangles.length > 0) for (let a = 0; a < o.triangles.length; a++) r.indexOf(o.triangles[a]) === -1 && r.push(o.triangles[a]);else o.getCapsuleTriangles(t, r);
    }
  }
  boxIntersect(t) {
    ea.copy(t);
    let r = [],
      n,
      o = !1;
    this.getBoxTriangles(t, r);
    for (let a = 0; a < r.length; a++) (n = this.triangleBoxIntersect(ea, r[a])) && (o = !0, ea.translate(n.normal.multiplyScalar(n.depth)));
    if (o) {
      let a = ea.getCenter(Iu).sub(t.getCenter(Vt)),
        s = a.length();
      return {
        normal: a.normalize(),
        depth: s
      };
    }
    return !1;
  }
  sphereIntersect(t) {
    ta.copy(t);
    let r = [],
      n,
      o = !1;
    this.getSphereTriangles(t, r);
    for (let a = 0; a < r.length; a++) (n = this.triangleSphereIntersect(ta, r[a])) && (o = !0, ta.center.add(n.normal.multiplyScalar(n.depth)));
    if (o) {
      let a = ta.center.clone().sub(t.center),
        s = a.length();
      return {
        normal: a.normalize(),
        depth: s
      };
    }
    return !1;
  }
  capsuleIntersect(t) {
    Zn.copy(t);
    let r = [],
      n,
      o = !1;
    this.getCapsuleTriangles(Zn, r);
    for (let a = 0; a < r.length; a++) (n = this.triangleCapsuleIntersect(Zn, r[a])) && (o = !0, Zn.translate(n.normal.multiplyScalar(n.depth)));
    if (o) {
      let a = Zn.getCenter(Iu).sub(t.getCenter(Vt)),
        s = a.length();
      return {
        normal: a.normalize(),
        depth: s
      };
    }
    return !1;
  }
  rayIntersect(t) {
    let r = [],
      n,
      o,
      a = 1e100;
    this.getRayTriangles(t, r);
    for (let s = 0; s < r.length; s++) {
      let i = t.intersectTriangle(r[s].a, r[s].b, r[s].c, !0, Vt);
      if (i) {
        let l = i.sub(t.origin).length();
        a > l && (o = i.clone().add(t.origin), a = l, n = r[s]);
      }
    }
    return a < 1e100 ? {
      distance: a,
      triangle: n,
      position: o
    } : !1;
  }
  fromGraphNode(t) {
    return t.updateWorldMatrix(!0, !0), t.traverse(r => {
      if (r.isMesh === !0 && this.layers.test(r.layers)) {
        let n,
          o = !1;
        r.geometry.index !== null ? (o = !0, n = r.geometry.toNonIndexed()) : n = r.geometry;
        let a = n.getAttribute("position");
        for (let s = 0; s < a.count; s += 3) {
          let i = new Wt().fromBufferAttribute(a, s),
            l = new Wt().fromBufferAttribute(a, s + 1),
            p = new Wt().fromBufferAttribute(a, s + 2);
          i.applyMatrix4(r.matrixWorld), l.applyMatrix4(r.matrixWorld), p.applyMatrix4(r.matrixWorld), this.addTriangle(new J0(i, l, p));
        }
        o && n.dispose();
      }
    }), this.build(), this;
  }
  clear() {
    return this.box = null, this.bounds.makeEmpty(), this.subTrees.length = 0, this.triangles.length = 0, this;
  }
};
function ju(e) {
  let t = new Ss(),
    r = [],
    n = [],
    o = [],
    a = [],
    s = !1,
    i = v => {
      let T = 0;
      for (let M of v) T += pg(t, M);
      T !== 0 && (t.bounds.max.addScalar(ug), t.build());
    },
    l = new Ee.Ray(),
    p = new Ee.Vector3(),
    m = new Ee.Vector3(),
    E = new Ee.Vector3(),
    y = new Set(),
    b = new Ee.Vector3(),
    R = new Ee.Line3();
  return {
    octree: t,
    movers: n,
    pads: o,
    triggers: a,
    addStatic(v) {
      e.add(v), s ? i([v]) : r.push(v);
    },
    addDecor(v) {
      e.add(v);
    },
    addMover(v, T) {
      e.add(v), v.updateWorldMatrix(!0, !0), n.push({
        object: v,
        update: T,
        box: new Ee.Box3().setFromObject(v),
        delta: new Ee.Matrix4(),
        before: v.matrixWorld.clone()
      });
    },
    addBouncePad(v) {
      o.push({
        position: new Ee.Vector3(...v.position),
        radius: v.radius,
        power: v.power
      });
    },
    addTrigger(v) {
      a.push({
        position: new Ee.Vector3(...v.position),
        radius: v.radius,
        onEnter: v.onEnter,
        inside: !1
      });
    },
    build() {
      s || (s = !0, i(r.splice(0)));
    },
    updateMovers(v) {
      for (let T of n) T.update(v, T.object), T.object.updateWorldMatrix(!0, !0), T.delta.copy(T.before).invert().premultiply(T.object.matrixWorld), T.before.copy(T.object.matrixWorld), T.box.setFromObject(T.object);
    },
    updateTriggers(v, T) {
      R.set(v, T);
      for (let M of a) {
        R.closestPointToPoint(M.position, !0, b);
        let H = b.distanceTo(M.position) <= M.radius;
        H && !M.inside && M.onEnter(), M.inside = H;
      }
    },
    raycast(v, T, M, H = !1) {
      if (!(M > 0) || T.lengthSq() < 1e-12) return null;
      l.set(v, p.copy(T).normalize()), y.clear(), qu(t, l, M, y, E);
      let h = null,
        P = M;
      for (let w of y) {
        let C = l.intersectTriangle(w.a, w.b, w.c, !H, m);
        if (!C) continue;
        let k = C.distanceTo(v);
        k > P || h && k === P || (h = w, P = k);
      }
      if (!h) return null;
      let A = h.getNormal(new Ee.Vector3());
      return A.dot(l.direction) > 0 && A.negate(), {
        distance: P,
        point: l.at(P, new Ee.Vector3()),
        normal: A
      };
    },
    collideSphere(v, T) {
      return !s || !(T > 0) ? null : ag(t, v, T);
    }
  };
}
var og = 4,
  Nu = new Ee.Sphere(),
  Yr = new Ee.Vector3(),
  bs = new Ee.Vector3(),
  ys = new Ee.Vector3(),
  Es = [];
function ag(e, t, r) {
  Yr.copy(t);
  for (let a = 0; a < og; a++) {
    Nu.set(Yr, r), Es.length = 0, e.getSphereTriangles(Nu, Es);
    let s = !1;
    for (let i of Es) {
      i.closestPointToPoint(Yr, bs);
      let l = bs.distanceToSquared(Yr);
      if (l >= r * r - 1e-10) continue;
      let p = Math.sqrt(l);
      p > 1e-6 ? ys.subVectors(Yr, bs).divideScalar(p) : i.getNormal(ys), Yr.addScaledVector(ys, r - p), s = !0;
    }
    if (!s) break;
  }
  let n = Yr.clone().sub(t),
    o = n.length();
  return o < 1e-6 ? null : {
    normal: n.divideScalar(o),
    depth: o
  };
}
var ig = new Ee.Vector3(),
  sg = new Ee.Vector3(),
  kr = new Ee.Vector3(),
  gn = new Ee.Vector3(),
  bn = new Ee.Vector3(),
  na = new Ee.Vector3(),
  oa = new Ee.Vector3();
function la(e, t, r) {
  let n = e.radius,
    {
      start: o,
      end: a
    } = e,
    {
      a: s,
      b: i,
      c: l
    } = t,
    p = ig.subVectors(l, i).cross(sg.subVectors(s, i)),
    m = p.length();
  if (m < 1e-12) return !1;
  p.divideScalar(m);
  let E = kr.subVectors(o, s).dot(p),
    y = kr.subVectors(a, s).dot(p);
  if (E > n && y > n || E < 0 && y < 0) return !1;
  if (E < 0 || y < 0) {
    if (kr.lerpVectors(o, a, E / (E - y)), Ee.Triangle.containsPoint(kr, s, i, l)) return r.normal.copy(p), r.depth = n - Math.min(E, y), r.face = !0, !0;
    let T = E < 0 ? o : a;
    if (kr.copy(T).addScaledVector(p, -Math.min(E, y)), Ee.Triangle.containsPoint(kr, s, i, l)) return r.normal.copy(p), r.depth = n - Math.min(E, y), r.face = !0, !0;
  }
  let b = Number.POSITIVE_INFINITY,
    R = !1;
  E >= 0 && Ee.Triangle.containsPoint(kr.copy(o).addScaledVector(p, -E), s, i, l) && (b = E, R = !0), y >= 0 && y < b && Ee.Triangle.containsPoint(kr.copy(a).addScaledVector(p, -y), s, i, l) && (b = y, R = !0);
  let v = Math.sqrt(vs(o, a, s, i, gn, bn));
  if (v < b - 1e-9 && (b = v, R = !1, na.copy(gn), oa.copy(bn)), v = Math.sqrt(vs(o, a, i, l, gn, bn)), v < b - 1e-9 && (b = v, R = !1, na.copy(gn), oa.copy(bn)), v = Math.sqrt(vs(o, a, l, s, gn, bn)), v < b - 1e-9 && (b = v, R = !1, na.copy(gn), oa.copy(bn)), b > n) return !1;
  if (R) r.normal.copy(p);else if (b < 1e-9) r.normal.copy(p);else if (r.normal.subVectors(na, oa).divideScalar(b), r.normal.dot(p) < -1e-6) return !1;
  return r.depth = n - b, r.face = R, !0;
}
function vs(e, t, r, n, o, a) {
  let s = t.x - e.x,
    i = t.y - e.y,
    l = t.z - e.z,
    p = n.x - r.x,
    m = n.y - r.y,
    E = n.z - r.z,
    y = e.x - r.x,
    b = e.y - r.y,
    R = e.z - r.z,
    v = s * s + i * i + l * l,
    T = p * p + m * m + E * E,
    M = p * y + m * b + E * R,
    H = A => A < 0 ? 0 : A > 1 ? 1 : A,
    h = 0,
    P = 0;
  if (v <= 1e-12 && T <= 1e-12) h = 0, P = 0;else if (v <= 1e-12) P = H(M / T);else {
    let A = s * y + i * b + l * R;
    if (T <= 1e-12) h = H(-A / v);else {
      let w = s * p + i * m + l * E,
        C = v * T - w * w;
      h = C > 1e-12 ? H((w * M - A * T) / C) : 0, P = (w * h + M) / T, P < 0 ? (P = 0, h = H(-A / v)) : P > 1 && (P = 1, h = H((w - A) / v));
    }
  }
  return o.set(e.x + s * h, e.y + i * h, e.z + l * h), a.set(r.x + p * P, r.y + m * P, r.z + E * P), o.distanceToSquared(a);
}
var aa = new kt(),
  xs = [],
  lg = new Ee.Vector3(),
  Rr = new Ee.Vector3(),
  Rt = new Ee.Vector3(),
  ia = new Ee.Vector3(),
  Ts = new Ee.Vector3(),
  ws = new Ee.Vector3(),
  St = new Ee.Vector3(),
  Fu = new Ee.Vector3(0, -1, 0),
  Vu = .02;
function Yu(e, t, r, n, o, a) {
  aa.start.set(t.x, t.y - n, t.z), aa.end.copy(t), aa.radius = r, xs.length = 0, e.getCapsuleTriangles(aa, xs);
  let s = Number.POSITIVE_INFINITY,
    i = r * r,
    l = (p, m) => {
      let E = p < 0 ? 0 : p;
      E >= s || E > n || St.y <= Vu || o(St, m) && (s = E, a.normal.copy(St));
    };
  for (let p of xs) {
    let {
        a: m,
        b: E,
        c: y
      } = p,
      b = lg.subVectors(y, E).cross(Rt.subVectors(m, E)),
      R = b.length();
    if (R < 1e-12) continue;
    b.divideScalar(R);
    let v = Rr.subVectors(t, m).dot(b);
    if (!(v < 0)) {
      if (b.y > Vu) {
        let T = (v - r) / b.y;
        Rr.set(t.x, t.y - (T > 0 ? T : 0), t.z), T <= n && Ee.Triangle.containsPoint(Rr, m, E, y) && (St.copy(b), l(T, !0));
      }
      for (let T = 0; T < 3; T++) {
        let M = T === 0 ? m : T === 1 ? E : y,
          H = T === 0 ? E : T === 1 ? y : m;
        Rt.subVectors(H, M);
        let h = Rt.length();
        if (h < 1e-9) continue;
        if (Rt.divideScalar(h), 1 - Rt.y * Rt.y > 1e-9) {
          ia.subVectors(t, M), Ts.copy(ia).addScaledVector(Rt, -ia.dot(Rt)), ws.copy(Fu).addScaledVector(Rt, -Fu.dot(Rt));
          let k = ws.lengthSq(),
            W = Ts.dot(ws),
            L = Ts.lengthSq() - i,
            K = W * W - k * L;
          if (K >= 0) {
            let D = (-W - Math.sqrt(K)) / k;
            if (D <= n && D + 2 * Math.sqrt(K) / k >= 0) {
              let N = D < 0 ? 0 : D;
              Rr.set(t.x, t.y - N, t.z);
              let g = ia.set(Rr.x - M.x, Rr.y - M.y, Rr.z - M.z).dot(Rt);
              if (g >= 0 && g <= h) {
                St.copy(Rr).sub(M).addScaledVector(Rt, -g);
                let S = St.length();
                S > 1e-9 && St.dot(b) > -1e-6 && (St.divideScalar(S), l(D, !1));
              }
            }
          }
        }
        let A = t.x - M.x,
          w = t.z - M.z,
          C = A * A + w * w;
        if (C < i) {
          let k = Math.sqrt(i - C),
            W = t.y - M.y - k;
          if (W <= n && t.y - M.y + k >= 0) {
            let L = W < 0 ? 0 : W;
            St.set(A, t.y - L - M.y, w);
            let K = St.length();
            K > 1e-9 && St.dot(b) > -1e-6 && (St.divideScalar(K), l(W, !1));
          }
        }
      }
    }
  }
  return Number.isFinite(s) ? (a.distance = s, !0) : !1;
}
function qu(e, t, r, n, o) {
  for (let a of e.subTrees) if (a.box && !(!a.box.containsPoint(t.origin) && (!t.intersectBox(a.box, o) || o.distanceTo(t.origin) > r))) if (sa(a), a.triangles.length > 0) for (let s of a.triangles) n.add(s);else qu(a, t, r, n, o);
}
var Wu = 1e-4,
  Ss = class e extends ra {
    pendingLevel = null;
    getCapsuleTriangles(t, r) {
      Bu(this, t, r);
    }
    getSphereTriangles(t, r) {
      Bu(this, t, r);
    }
    getRayTriangles(t, r) {
      for (let n of this.subTrees) if (t.intersectsBox(n.box)) if (sa(n), n.triangles.length > 0) for (let o of n.triangles) r.indexOf(o) === -1 && r.push(o);else n.getRayTriangles(t, r);
      return r;
    }
    expandAll() {
      sa(this);
      for (let t of this.subTrees) t.expandAll();
    }
    split(t) {
      let r = this.box;
      if (!r) return this;
      let n = cg.copy(r.max).sub(r.min).multiplyScalar(.5);
      for (let i = 0; i < 3; i++) {
        let l = i === 0 ? r.min.x : i === 1 ? r.min.y : r.min.z,
          p = i === 0 ? n.x : i === 1 ? n.y : n.z;
        for (let m = 0; m < 2; m++) {
          let E = l + m * p,
            y = i * 4 + m * 2;
          Sr[y] = E, Sr[y + 1] = E + p, Mr[y] = E - Wu, Mr[y + 1] = E + p + Wu;
        }
      }
      let o = [null, null, null, null, null, null, null, null],
        a = this.triangles;
      for (let i = a.length - 1; i >= 0; i--) {
        let l = a[i],
          {
            a: p,
            b: m,
            c: E
          } = l,
          y = Math.min(p.x, m.x, E.x),
          b = Math.max(p.x, m.x, E.x),
          R = Math.min(p.y, m.y, E.y),
          v = Math.max(p.y, m.y, E.y),
          T = Math.min(p.z, m.z, E.z),
          M = Math.max(p.z, m.z, E.z);
        for (let H = 0; H < 2; H++) {
          let h = Mr[H * 2],
            P = Mr[H * 2 + 1];
          if (b < h || y > P) continue;
          let A = y >= h && b <= P;
          for (let w = 0; w < 2; w++) {
            let C = Mr[4 + w * 2],
              k = Mr[4 + w * 2 + 1];
            if (v < C || R > k) continue;
            let W = R >= C && v <= k;
            for (let L = 0; L < 2; L++) {
              let K = Mr[8 + L * 2],
                D = Mr[8 + L * 2 + 1];
              if (M < K || T > D || !(A && W && T >= K && M <= D) && !Rs(p, h, P, C, k, K, D) && !Rs(m, h, P, C, k, K, D) && !Rs(E, h, P, C, k, K, D) && (ks.min.set(h, C, K), ks.max.set(P, k, D), !ks.intersectsTriangle(l))) continue;
              let N = H * 4 + w * 2 + L,
                g = o[N];
              g ? g.push(l) : o[N] = [l];
            }
          }
        }
      }
      a.length = 0;
      let s = [];
      for (let i = 0; i < 8; i++) {
        let l = o[i];
        if (!l) continue;
        let p = i >> 2,
          m = i >> 1 & 1,
          E = i & 1,
          y = new Ee.Box3();
        y.min.set(Sr[p * 2], Sr[4 + m * 2], Sr[8 + E * 2]), y.max.set(Sr[p * 2 + 1], Sr[4 + m * 2 + 1], Sr[8 + E * 2 + 1]);
        let b = new e(y);
        b.trianglesPerLeaf = this.trianglesPerLeaf, b.maxLevel = this.maxLevel, b.triangles = l, s.push(b);
      }
      for (let i of s) i.triangles.length > this.trianglesPerLeaf && t < this.maxLevel && (i.pendingLevel = t + 1), this.subTrees.push(i);
      return this;
    }
  };
function sa(e) {
  let t = e,
    r = t.pendingLevel;
  r != null && (t.pendingLevel = null, t.split(r));
}
var Gu = [];
function Bu(e, t, r) {
  let n = Gu.pop() ?? new Set();
  for (let o of r) n.add(o);
  try {
    Qu(e, t, r, n);
  } finally {
    n.clear(), Gu.push(n);
  }
}
function Qu(e, t, r, n) {
  for (let o of e.subTrees) if (t.intersectsBox(o.box)) if (sa(o), o.triangles.length > 0) for (let a of o.triangles) n.has(a) || (n.add(a), r.push(a));else Qu(o, t, r, n);
}
var cg = new Ee.Vector3(),
  Sr = new Float64Array(12),
  Mr = new Float64Array(12),
  ks = new Ee.Box3(),
  Rs = (e, t, r, n, o, a, s) => e.x >= t && e.x <= r && e.y >= n && e.y <= o && e.z >= a && e.z <= s,
  ug = .01,
  Du = new Ee.Vector3(),
  zu = new Ee.Vector3(),
  Uu = new Ee.Vector3(),
  Ku = new Ee.Matrix4(),
  _n = new Ee.Matrix4();
function pg(e, t) {
  t.updateWorldMatrix(!0, !0);
  let r = 0;
  return t.traverse(n => {
    let o = n;
    if (!o.isMesh || !e.layers.test(o.layers)) return;
    let a = o.geometry,
      s = a.getAttribute("position");
    if (!s) return;
    let i = a.getIndex(),
      l = i ? i.count : s.count,
      p = o.isInstancedMesh ? o : null,
      m = p ? p.count : 1;
    for (let E = 0; E < m; E++) {
      p ? (p.getMatrixAt(E, Ku), _n.multiplyMatrices(o.matrixWorld, Ku)) : _n.copy(o.matrixWorld);
      for (let y = 0; y + 2 < l; y += 3) {
        let b = i ? i.getX(y) : y,
          R = i ? i.getX(y + 1) : y + 1,
          v = i ? i.getX(y + 2) : y + 2;
        Du.fromBufferAttribute(s, b).applyMatrix4(_n), zu.fromBufferAttribute(s, R).applyMatrix4(_n), Uu.fromBufferAttribute(s, v).applyMatrix4(_n), e.addTriangle(new Ee.Triangle(Du.clone(), zu.clone(), Uu.clone())), r++;
      }
    }
  }), r;
}
var Xu = 5,
  dg = 1.6,
  fg = .12,
  mg = .12,
  $n = .6,
  hg = .32,
  gg = .6,
  bg = 1,
  Ms = .004,
  yg = .02,
  Eg = .07,
  vg = .3,
  xg = .002,
  Tg = .08,
  wg = 1.4,
  kg = .45,
  Rg = .9,
  Sg = 1.25,
  Ju = 45,
  Zu = 14,
  Mg = 18,
  Ag = .4,
  Pg = .25,
  Cg = () => ({
    jumped: !1,
    doubleJumped: !1,
    landed: !1,
    landSpeed: 0,
    bounced: !1,
    respawned: !1
  });
function $u(e) {
  let {
      radius: t,
      height: r
    } = e,
    n = Math.min(r * .5, Math.max(0, e.stepHeight ?? hg * r)),
    o = new kt(new ht.Vector3(), new ht.Vector3(0, 1, 0), t),
    a = new ht.Vector3(),
    s = !1,
    i = null,
    l = 0,
    p = 0,
    m = !1,
    E = !1,
    y = 0,
    b = !1,
    R = [],
    v = new kt(),
    T = new kt(),
    M = new kt(),
    H = new ht.Vector3(),
    h = new ht.Vector3(),
    P = new ht.Vector3(),
    A = new kt(),
    w = new ht.Vector3(),
    C = new ht.Vector3(),
    k = new ht.Vector3(),
    W = {
      grounded: !1,
      wall: !1,
      riding: null,
      support: 0
    },
    L = {
      grounded: !1,
      wall: !1,
      riding: null,
      support: 0
    },
    K = {
      normal: new ht.Vector3(),
      depth: 0,
      face: !1
    },
    D = {
      distance: 0,
      normal: new ht.Vector3()
    },
    N = Math.max(vg, n + Ms),
    g = 0,
    S = 0,
    I = !1,
    F = !1,
    z = (d, c) => {
      let u = !c && d.x * g + d.z * S > 1e-6;
      return u && (I || d.y < $n) ? !1 : (F = u, !0);
    },
    U = (d, c, u) => {
      o.start.set(d, c + t, u), o.end.set(d, c + r - t, u);
    },
    Q = (d, c, u, x, O) => {
      if (u.y >= $n) {
        O.grounded = !0, x > 0 && d.translate(C.set(0, Math.min(x / u.y, x * 2), 0)), c.y < 0 && (c.y = 0), O.support = Math.max(O.support, d.start.y - u.y * t);
        return;
      }
      if (x <= 0) return;
      if (d.translate(C.copy(u).multiplyScalar(x)), u.y <= -$n) {
        c.y > 0 && (c.y = 0);
        return;
      }
      O.wall = !0;
      let j = Math.hypot(u.x, u.z);
      if (b && u.y > 0 && j > 1e-6) {
        let re = (c.x * u.x + c.z * u.z) / j;
        re < 0 && (c.x -= u.x / j * re, c.z -= u.z / j * re);
        return;
      }
      let Y = c.dot(u);
      Y < 0 && c.addScaledVector(u, -Y);
    },
    $ = (d, c, u, x) => {
      x.grounded = !1, x.wall = !1, x.riding = null, x.support = Number.NEGATIVE_INFINITY, R.length = 0, u.octree.getCapsuleTriangles(d, R);
      for (let O of R) la(d, O, K) && K.face && Q(d, c, K.normal, K.depth, x);
      for (let O of R) la(d, O, K) && Q(d, c, K.normal, K.depth, x);
      for (let O of u.movers) _u(d, O.box, w, ca) && (w.y >= $n && (x.riding = O), Q(d, c, w, ca.value, x));
    },
    ie = (d, c) => {
      R.length = 0, c.octree.getCapsuleTriangles(d, R);
      for (let u of R) if (la(d, u, K) && K.depth > 1e-4) return !0;
      for (let u of c.movers) if (_u(d, u.box, w, ca) && ca.value > 1e-4) return !0;
      return !1;
    },
    _ = (d, c, u) => J(d, c, gg, u) || J(d, c, bg, u),
    J = (d, c, u, x) => {
      let O = Math.hypot(d, c);
      if (n <= 0 || O < 1e-6) return !1;
      let j = Math.max(O, t * u) / O;
      if (T.copy(v), T.translate(C.set(0, n, 0)), ie(T, x) || (T.translate(C.set(d * j, 0, c * j)), ie(T, x))) return !1;
      let Y = 0,
        re = n;
      if (M.copy(T), M.translate(C.set(0, -re, 0)), !ie(M, x)) return !1;
      for (; re - Y > Ms;) {
        let ee = (Y + re) * .5;
        M.copy(T), M.translate(C.set(0, -ee, 0)), ie(M, x) ? re = ee : Y = ee;
      }
      T.translate(C.set(0, -re, 0)), h.copy(a), $(T, h, x, L);
      let se = L.support - (v.start.y - t);
      return !L.grounded || L.wall || se < yg || se > n + Ms ? !1 : (H.x += v.start.x + d - T.start.x, H.y += v.start.y - T.start.y, H.z += v.start.z + c - T.start.z, o.copy(T), a.y = Math.min(h.y, 0), i = L.riding, !0);
    },
    Z = (d, c) => (g = a.x, S = a.z, X(d, c, !1) || F && X(d, c, !0)),
    X = (d, c, u) => {
      I = u, F = !1;
      let x = Yu(d.octree, o.start, t, N, z, D),
        {
          start: O
        } = o;
      for (let Y of d.movers) {
        let re = Y.box;
        if (re.isEmpty() || O.y < re.max.y) continue;
        let se = O.x - Math.min(re.max.x, Math.max(re.min.x, O.x)),
          ee = O.z - Math.min(re.max.z, Math.max(re.min.z, O.z)),
          me = se * se + ee * ee;
        if (me >= t * t) continue;
        let de = Math.sqrt(t * t - me),
          ne = Math.max(0, O.y - re.max.y - de);
        ne > N || x && ne >= D.distance || (w.set(se, de, ee).divideScalar(t), z(w, me < 1e-12) && (x = !0, D.distance = ne, D.normal.copy(w)));
      }
      if (!x || D.normal.y < $n) return !1;
      let j = D.distance + xg;
      return T.copy(o), T.translate(C.set(0, -j, 0)), h.copy(a), $(T, h, d, L), L.grounded ? (j > Tg && j > c * wg && (H.y += o.start.y - T.start.y), o.copy(T), a.y = Math.min(h.y, 0), i = L.riding, !0) : !1;
    },
    B = {
      capsule: o,
      velocity: a,
      get grounded() {
        return s;
      },
      get riding() {
        return i;
      },
      yaw: e.spawn.yaw,
      frozen: !1,
      smoothing: H,
      feet(d = new ht.Vector3()) {
        return d.set(o.start.x, o.start.y - t, o.start.z);
      },
      center(d = new ht.Vector3()) {
        return o.getCenter(d);
      },
      step(d, c, u) {
        let x = Cg();
        if (B.frozen || d <= 0) return x;
        H.multiplyScalar(Math.exp(-d / Eg)), H.lengthSq() < 1e-8 && H.set(0, 0, 0), i && u.movers.includes(i) && (B.feet(k), w.copy(k).applyMatrix4(i.delta).sub(k), o.translate(w)), c.jumpPressed && (p = mg), m && !c.jumpHeld && (a.y = Math.min(a.y, e.jumpSpeed * kg), m = !1);
        let O = c.moveX,
          j = c.moveZ,
          Y = Math.hypot(O, j);
        Y > 1 && (O /= Y, j /= Y);
        let re = Y > .01,
          se = e.runSpeed * (c.sprint ? dg : 1),
          ee = d / Xu;
        for (let me = 0; me < Xu; me++) {
          s && (l = fg, E = !1);
          let de = s ? re ? Zu : Mg : re ? Zu * e.airControl : Ag,
            ne = 1 - Math.exp(-de * ee);
          a.x += (O * se - a.x) * ne, a.z += (j * se - a.z) * ne;
          let ce = !1;
          p > 0 && (s || l > 0 ? (a.y = e.jumpSpeed, ce = !0) : e.doubleJump && !E && (a.y = e.jumpSpeed * Rg, E = !0, ce = !0, x.doubleJumped = !0), ce && (x.jumped = !0, p = 0, l = 0, s = !1, i = null, m = !0)), a.y -= e.gravity * (a.y < 0 ? Sg : 1) * ee, a.y < -Ju && (a.y = -Ju);
          let Ie = -a.y,
            Me = s;
          b = !ce && (Me || l > 0 && a.y <= 0);
          let oe = a.x * ee,
            V = a.z * ee;
          v.copy(o), o.translate(C.set(oe, a.y * ee, V)), h.copy(a), $(o, a, u, W), s = W.grounded, i = W.riding;
          let ae = Math.abs(h.x - a.x) + Math.abs(h.z - a.z) > 1e-4;
          b && W.wall && ae && (oe !== 0 || V !== 0) && (P.copy(a), A.copy(o), a.copy(h), _(oe, V, u) ? s = !0 : (o.copy(A), a.copy(P))), Me && !s && !ce && a.y <= 0 && (s = Z(u, Math.hypot(oe, V))), !Me && s && Ie > .5 && (x.landed = !0, x.landSpeed = Math.max(x.landSpeed, Ie), m = !1), s || (l -= ee), p -= ee;
        }
        if (a.y <= 0 && (m = !1), y -= d, s && y <= 0) {
          B.feet(k);
          for (let me of u.pads) {
            let de = k.x - me.position.x,
              ne = k.z - me.position.z,
              ce = k.y - me.position.y;
            if (!(de * de + ne * ne > me.radius * me.radius || ce < -.5 || ce > .9)) {
              a.y = me.power, s = !1, i = null, E = !1, m = !1, l = 0, y = Pg, x.bounced = !0;
              break;
            }
          }
        }
        return o.start.y - t < e.killY && (B.respawn(), x.respawned = !0), x;
      },
      teleport(d, c, u) {
        let [x, O, j] = Array.isArray(d) ? d : [d.x, d.y, d.z];
        U(x, O, j), u ? a.set(...u) : a.set(0, 0, 0), c !== void 0 && (B.yaw = c), H.set(0, 0, 0), s = !1, i = null, l = 0, p = 0, m = !1, E = !1;
      },
      respawn() {
        B.teleport(e.spawn.position, e.spawn.yaw);
      },
      fits(d, c) {
        return M.start.set(d.x, d.y + t, d.z), M.end.set(d.x, d.y + r - t, d.z), M.radius = t, !ie(M, c);
      },
      motion(d) {
        return {
          speed: Math.hypot(a.x, a.z),
          forward: a.x * Math.sin(B.yaw) + a.z * Math.cos(B.yaw),
          runSpeed: e.runSpeed,
          grounded: s,
          vy: a.y,
          jumped: d.jumped,
          landed: d.landed,
          yaw: B.yaw
        };
      }
    };
  return B.respawn(), B;
}
var ca = {
  value: 0
};
function _u(e, t, r, n) {
  if (t.isEmpty()) return !1;
  let o = e.radius,
    {
      start: a,
      end: s
    } = e,
    i = a.x,
    l = a.z;
  if (i < t.min.x - o || i > t.max.x + o || l < t.min.z - o || l > t.max.z + o || s.y < t.min.y - o || a.y > t.max.y + o) return !1;
  let p = Math.min(t.max.x, Math.max(t.min.x, i)),
    m = Math.min(t.max.z, Math.max(t.min.z, l)),
    E = i - p,
    y = l - m,
    b = Math.hypot(E, y);
  if (a.y > t.max.y || s.y < t.min.y) {
    let M = a.y > t.max.y,
      H = M ? a.y : s.y,
      h = M ? t.max.y : t.min.y,
      P = H - h,
      A = Math.hypot(E, P, y);
    return A >= o ? !1 : (A < 1e-9 ? r.set(0, M ? 1 : -1, 0) : r.set(E / A, P / A, y / A), n.value = o - A, !0);
  }
  let R = t.max.y - a.y;
  if (b > 1e-9) {
    if (b >= o) return !1;
    let M = o - b,
      H = R + Math.sqrt(o * o - b * b);
    return H < M ? (r.set(0, 1, 0), n.value = H) : (r.set(E / b, 0, y / b), n.value = M), !0;
  }
  let v = [[R + o, 0, 1, 0], [s.y + o - t.min.y, 0, -1, 0], [i - t.min.x + o, -1, 0, 0], [t.max.x - i + o, 1, 0, 0], [l - t.min.z + o, 0, 0, -1], [t.max.z - l + o, 0, 0, 1]],
    T = v[0];
  for (let M of v) M[0] < T[0] && (T = M);
  return r.set(T[1], T[2], T[3]), n.value = T[0], !0;
}
import * as Cr from "./001-three-a973dc20bf0957e55145ef9e6b9c97d50275b224b1d81a57603249dd6750ab96.js";
import * as Xe from "./001-three-a973dc20bf0957e55145ef9e6b9c97d50275b224b1d81a57603249dd6750ab96.js";
import { HalfFloatType as Vg, NoBlending as Wg, Timer as Gg, Vector2 as rp, WebGLRenderTarget as Bg } from "./001-three-a973dc20bf0957e55145ef9e6b9c97d50275b224b1d81a57603249dd6750ab96.js";
var yn = {
  name: "CopyShader",
  uniforms: {
    tDiffuse: {
      value: null
    },
    opacity: {
      value: 1
    }
  },
  vertexShader: `

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,
  fragmentShader: `

		uniform float opacity;

		uniform sampler2D tDiffuse;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );
			gl_FragColor = opacity * texel;


		}`
};
import { ShaderMaterial as tp, UniformsUtils as Fg } from "./001-three-a973dc20bf0957e55145ef9e6b9c97d50275b224b1d81a57603249dd6750ab96.js";
import { BufferGeometry as Hg, Float32BufferAttribute as ep, OrthographicCamera as Lg, Mesh as Ig } from "./001-three-a973dc20bf0957e55145ef9e6b9c97d50275b224b1d81a57603249dd6750ab96.js";
var it = class {
    constructor() {
      this.isPass = !0, this.enabled = !0, this.needsSwap = !0, this.clear = !1, this.renderToScreen = !1;
    }
    setSize() {}
    render() {
      console.error("THREE.Pass: .render() must be implemented in derived pass.");
    }
    dispose() {}
  },
  Og = new Lg(-1, 1, 1, -1, 0, 1),
  As = class extends Hg {
    constructor() {
      super(), this.setAttribute("position", new ep([-1, 3, 0, -1, -1, 0, 3, -1, 0], 3)), this.setAttribute("uv", new ep([0, 2, 0, 0, 2, 0], 2));
    }
  },
  Ng = new As(),
  Gt = class {
    constructor(t) {
      this._mesh = new Ig(Ng, t);
    }
    dispose() {
      this._mesh.geometry.dispose();
    }
    render(t) {
      t.render(this._mesh, Og);
    }
    get material() {
      return this._mesh.material;
    }
    set material(t) {
      this._mesh.material = t;
    }
  };
var En = class extends it {
  constructor(t, r = "tDiffuse") {
    super(), this.textureID = r, this.uniforms = null, this.material = null, t instanceof tp ? (this.uniforms = t.uniforms, this.material = t) : t && (this.uniforms = Fg.clone(t.uniforms), this.material = new tp({
      name: t.name !== void 0 ? t.name : "unspecified",
      defines: Object.assign({}, t.defines),
      uniforms: this.uniforms,
      vertexShader: t.vertexShader,
      fragmentShader: t.fragmentShader
    })), this._fsQuad = new Gt(this.material);
  }
  render(t, r, n) {
    this.uniforms[this.textureID] && (this.uniforms[this.textureID].value = n.texture), this._fsQuad.material = this.material, this.renderToScreen ? (t.setRenderTarget(null), this._fsQuad.render(t)) : (t.setRenderTarget(r), this.clear && t.clear(t.autoClearColor, t.autoClearDepth, t.autoClearStencil), this._fsQuad.render(t));
  }
  dispose() {
    this.material.dispose(), this._fsQuad.dispose();
  }
};
var eo = class extends it {
    constructor(t, r) {
      super(), this.scene = t, this.camera = r, this.clear = !0, this.needsSwap = !1, this.inverse = !1;
    }
    render(t, r, n) {
      let o = t.getContext(),
        a = t.state;
      a.buffers.color.setMask(!1), a.buffers.depth.setMask(!1), a.buffers.color.setLocked(!0), a.buffers.depth.setLocked(!0);
      let s, i;
      this.inverse ? (s = 0, i = 1) : (s = 1, i = 0), a.buffers.stencil.setTest(!0), a.buffers.stencil.setOp(o.REPLACE, o.REPLACE, o.REPLACE), a.buffers.stencil.setFunc(o.ALWAYS, s, 4294967295), a.buffers.stencil.setClear(i), a.buffers.stencil.setLocked(!0), t.setRenderTarget(n), this.clear && t.clear(), t.render(this.scene, this.camera), t.setRenderTarget(r), this.clear && t.clear(), t.render(this.scene, this.camera), a.buffers.color.setLocked(!1), a.buffers.depth.setLocked(!1), a.buffers.color.setMask(!0), a.buffers.depth.setMask(!0), a.buffers.stencil.setLocked(!1), a.buffers.stencil.setFunc(o.EQUAL, 1, 4294967295), a.buffers.stencil.setOp(o.KEEP, o.KEEP, o.KEEP), a.buffers.stencil.setLocked(!0);
    }
  },
  ua = class extends it {
    constructor() {
      super(), this.needsSwap = !1;
    }
    render(t) {
      t.state.buffers.stencil.setLocked(!1), t.state.buffers.stencil.setTest(!1);
    }
  };
var pa = class {
  constructor(t, r) {
    if (this.renderer = t, this._pixelRatio = t.getPixelRatio(), r === void 0) {
      let n = t.getSize(new rp());
      this._width = n.width, this._height = n.height, r = new Bg(this._width * this._pixelRatio, this._height * this._pixelRatio, {
        type: Vg
      }), r.texture.name = "EffectComposer.rt1";
    } else this._width = r.width, this._height = r.height;
    this.renderTarget1 = r, this.renderTarget2 = r.clone(), this.renderTarget2.texture.name = "EffectComposer.rt2", this.writeBuffer = this.renderTarget1, this.readBuffer = this.renderTarget2, this.renderToScreen = !0, this.passes = [], this.copyPass = new En(yn), this.copyPass.material.blending = Wg, this.timer = new Gg();
  }
  swapBuffers() {
    let t = this.readBuffer;
    this.readBuffer = this.writeBuffer, this.writeBuffer = t;
  }
  addPass(t) {
    this.passes.push(t), t.setSize(this._width * this._pixelRatio, this._height * this._pixelRatio);
  }
  insertPass(t, r) {
    this.passes.splice(r, 0, t), t.setSize(this._width * this._pixelRatio, this._height * this._pixelRatio);
  }
  removePass(t) {
    let r = this.passes.indexOf(t);
    r !== -1 && this.passes.splice(r, 1);
  }
  isLastEnabledPass(t) {
    for (let r = t + 1; r < this.passes.length; r++) if (this.passes[r].enabled) return !1;
    return !0;
  }
  render(t) {
    this.timer.update(), t === void 0 && (t = this.timer.getDelta());
    let r = this.renderer.getRenderTarget(),
      n = !1;
    for (let o = 0, a = this.passes.length; o < a; o++) {
      let s = this.passes[o];
      if (s.enabled !== !1) {
        if (s.renderToScreen = this.renderToScreen && this.isLastEnabledPass(o), s.render(this.renderer, this.writeBuffer, this.readBuffer, t, n), s.needsSwap) {
          if (n) {
            let i = this.renderer.getContext(),
              l = this.renderer.state.buffers.stencil;
            l.setFunc(i.NOTEQUAL, 1, 4294967295), this.copyPass.render(this.renderer, this.writeBuffer, this.readBuffer, t), l.setFunc(i.EQUAL, 1, 4294967295);
          }
          this.swapBuffers();
        }
        eo !== void 0 && (s instanceof eo ? n = !0 : s instanceof ua && (n = !1));
      }
    }
    this.renderer.setRenderTarget(r);
  }
  reset(t) {
    if (t === void 0) {
      let r = this.renderer.getSize(new rp());
      this._pixelRatio = this.renderer.getPixelRatio(), this._width = r.width, this._height = r.height, t = this.renderTarget1.clone(), t.setSize(this._width * this._pixelRatio, this._height * this._pixelRatio);
    }
    this.renderTarget1.dispose(), this.renderTarget2.dispose(), this.renderTarget1 = t, this.renderTarget2 = t.clone(), this.writeBuffer = this.renderTarget1, this.readBuffer = this.renderTarget2;
  }
  setSize(t, r) {
    this._width = t, this._height = r;
    let n = this._width * this._pixelRatio,
      o = this._height * this._pixelRatio;
    this.renderTarget1.setSize(n, o), this.renderTarget2.setSize(n, o);
    for (let a = 0; a < this.passes.length; a++) this.passes[a].setSize(n, o);
  }
  setPixelRatio(t) {
    this._pixelRatio = t, this.setSize(this._width, this._height);
  }
  dispose() {
    this.renderTarget1.dispose(), this.renderTarget2.dispose(), this.copyPass.dispose();
  }
};
import { ColorManagement as Dg, RawShaderMaterial as zg, UniformsUtils as Ug, LinearToneMapping as Kg, ReinhardToneMapping as jg, CineonToneMapping as Yg, AgXToneMapping as qg, ACESFilmicToneMapping as Qg, NeutralToneMapping as Xg, CustomToneMapping as Jg, SRGBTransfer as Zg } from "./001-three-a973dc20bf0957e55145ef9e6b9c97d50275b224b1d81a57603249dd6750ab96.js";
var Ar = {
  name: "OutputShader",
  uniforms: {
    tDiffuse: {
      value: null
    },
    toneMappingExposure: {
      value: 1
    }
  },
  vertexShader: `
		precision highp float;

		uniform mat4 modelViewMatrix;
		uniform mat4 projectionMatrix;

		attribute vec3 position;
		attribute vec2 uv;

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,
  fragmentShader: `

		precision highp float;

		uniform sampler2D tDiffuse;

		#include <tonemapping_pars_fragment>
		#include <colorspace_pars_fragment>

		varying vec2 vUv;

		void main() {

			gl_FragColor = texture2D( tDiffuse, vUv );

			// tone mapping

			#ifdef LINEAR_TONE_MAPPING

				gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );

			#elif defined( REINHARD_TONE_MAPPING )

				gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );

			#elif defined( CINEON_TONE_MAPPING )

				gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );

			#elif defined( ACES_FILMIC_TONE_MAPPING )

				gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );

			#elif defined( AGX_TONE_MAPPING )

				gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );

			#elif defined( NEUTRAL_TONE_MAPPING )

				gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );

			#elif defined( CUSTOM_TONE_MAPPING )

				gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );

			#endif

			// color space

			#ifdef SRGB_TRANSFER

				gl_FragColor = sRGBTransferOETF( gl_FragColor );

			#endif

		}`
};
var da = class extends it {
  constructor() {
    super(), this.isOutputPass = !0, this.uniforms = Ug.clone(Ar.uniforms), this.material = new zg({
      name: Ar.name,
      uniforms: this.uniforms,
      vertexShader: Ar.vertexShader,
      fragmentShader: Ar.fragmentShader
    }), this._fsQuad = new Gt(this.material), this._outputColorSpace = null, this._toneMapping = null;
  }
  render(t, r, n) {
    this.uniforms.tDiffuse.value = n.texture, this.uniforms.toneMappingExposure.value = t.toneMappingExposure, (this._outputColorSpace !== t.outputColorSpace || this._toneMapping !== t.toneMapping) && (this._outputColorSpace = t.outputColorSpace, this._toneMapping = t.toneMapping, this.material.defines = {}, Dg.getTransfer(this._outputColorSpace) === Zg && (this.material.defines.SRGB_TRANSFER = ""), this._toneMapping === Kg ? this.material.defines.LINEAR_TONE_MAPPING = "" : this._toneMapping === jg ? this.material.defines.REINHARD_TONE_MAPPING = "" : this._toneMapping === Yg ? this.material.defines.CINEON_TONE_MAPPING = "" : this._toneMapping === Qg ? this.material.defines.ACES_FILMIC_TONE_MAPPING = "" : this._toneMapping === qg ? this.material.defines.AGX_TONE_MAPPING = "" : this._toneMapping === Xg ? this.material.defines.NEUTRAL_TONE_MAPPING = "" : this._toneMapping === Jg && (this.material.defines.CUSTOM_TONE_MAPPING = ""), this.material.needsUpdate = !0), this.renderToScreen === !0 ? (t.setRenderTarget(null), this._fsQuad.render(t)) : (t.setRenderTarget(r), this.clear && t.clear(t.autoClearColor, t.autoClearDepth, t.autoClearStencil), this._fsQuad.render(t));
  }
  dispose() {
    this.material.dispose(), this._fsQuad.dispose();
  }
};
import { Color as _g } from "./001-three-a973dc20bf0957e55145ef9e6b9c97d50275b224b1d81a57603249dd6750ab96.js";
var fa = class extends it {
  constructor(t, r, n = null, o = null, a = null) {
    super(), this.scene = t, this.camera = r, this.overrideMaterial = n, this.clearColor = o, this.clearAlpha = a, this.clear = !0, this.clearDepth = !1, this.needsSwap = !1, this.isRenderPass = !0, this._oldClearColor = new _g();
  }
  render(t, r, n) {
    let o = t.autoClear;
    t.autoClear = !1;
    let a, s;
    this.overrideMaterial !== null && (s = this.scene.overrideMaterial, this.scene.overrideMaterial = this.overrideMaterial), this.clearColor !== null && (t.getClearColor(this._oldClearColor), t.setClearColor(this.clearColor, t.getClearAlpha())), this.clearAlpha !== null && (a = t.getClearAlpha(), t.setClearAlpha(this.clearAlpha)), this.clearDepth == !0 && t.clearDepth(), t.setRenderTarget(this.renderToScreen ? null : n), this.clear === !0 && t.clear(t.autoClearColor, t.autoClearDepth, t.autoClearStencil), t.render(this.scene, this.camera), this.clearColor !== null && t.setClearColor(this._oldClearColor), this.clearAlpha !== null && t.setClearAlpha(a), this.overrideMaterial !== null && (this.scene.overrideMaterial = s), t.autoClear = o;
  }
};
import { AdditiveBlending as eb, Color as op, HalfFloatType as Ps, MeshBasicMaterial as tb, ShaderMaterial as ma, UniformsUtils as ap, Vector2 as Pr, Vector3 as to, WebGLRenderTarget as Cs } from "./001-three-a973dc20bf0957e55145ef9e6b9c97d50275b224b1d81a57603249dd6750ab96.js";
import { Color as $g } from "./001-three-a973dc20bf0957e55145ef9e6b9c97d50275b224b1d81a57603249dd6750ab96.js";
var np = {
  name: "LuminosityHighPassShader",
  uniforms: {
    tDiffuse: {
      value: null
    },
    luminosityThreshold: {
      value: 1
    },
    smoothWidth: {
      value: 1
    },
    defaultColor: {
      value: new $g(0)
    },
    defaultOpacity: {
      value: 0
    }
  },
  vertexShader: `

		varying vec2 vUv;

		void main() {

			vUv = uv;

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,
  fragmentShader: `

		uniform sampler2D tDiffuse;
		uniform vec3 defaultColor;
		uniform float defaultOpacity;
		uniform float luminosityThreshold;
		uniform float smoothWidth;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );

			float v = luminance( texel.xyz );

			vec4 outputColor = vec4( defaultColor.rgb, defaultOpacity );

			float alpha = smoothstep( luminosityThreshold, luminosityThreshold + smoothWidth, v );

			gl_FragColor = mix( outputColor, texel, alpha );

		}`
};
var vn = class e extends it {
  constructor(t, r = 1, n, o) {
    super(), this.strength = r, this.radius = n, this.threshold = o, this.resolution = t !== void 0 ? new Pr(t.x, t.y) : new Pr(256, 256), this.clearColor = new op(0, 0, 0), this.needsSwap = !1, this.renderTargetsHorizontal = [], this.renderTargetsVertical = [], this.nMips = 5;
    let a = Math.round(this.resolution.x / 2),
      s = Math.round(this.resolution.y / 2);
    this.renderTargetBright = new Cs(a, s, {
      type: Ps
    }), this.renderTargetBright.texture.name = "UnrealBloomPass.bright", this.renderTargetBright.texture.generateMipmaps = !1;
    for (let m = 0; m < this.nMips; m++) {
      let E = new Cs(a, s, {
        type: Ps
      });
      E.texture.name = "UnrealBloomPass.h" + m, E.texture.generateMipmaps = !1, this.renderTargetsHorizontal.push(E);
      let y = new Cs(a, s, {
        type: Ps
      });
      y.texture.name = "UnrealBloomPass.v" + m, y.texture.generateMipmaps = !1, this.renderTargetsVertical.push(y), a = Math.round(a / 2), s = Math.round(s / 2);
    }
    let i = np;
    this.highPassUniforms = ap.clone(i.uniforms), this.highPassUniforms.luminosityThreshold.value = o, this.highPassUniforms.smoothWidth.value = .01, this.materialHighPassFilter = new ma({
      uniforms: this.highPassUniforms,
      vertexShader: i.vertexShader,
      fragmentShader: i.fragmentShader
    }), this.separableBlurMaterials = [];
    let l = [6, 10, 14, 18, 22];
    a = Math.round(this.resolution.x / 2), s = Math.round(this.resolution.y / 2);
    for (let m = 0; m < this.nMips; m++) this.separableBlurMaterials.push(this._getSeparableBlurMaterial(l[m])), this.separableBlurMaterials[m].uniforms.invSize.value = new Pr(1 / a, 1 / s), a = Math.round(a / 2), s = Math.round(s / 2);
    this.compositeMaterial = this._getCompositeMaterial(this.nMips), this.compositeMaterial.uniforms.blurTexture1.value = this.renderTargetsVertical[0].texture, this.compositeMaterial.uniforms.blurTexture2.value = this.renderTargetsVertical[1].texture, this.compositeMaterial.uniforms.blurTexture3.value = this.renderTargetsVertical[2].texture, this.compositeMaterial.uniforms.blurTexture4.value = this.renderTargetsVertical[3].texture, this.compositeMaterial.uniforms.blurTexture5.value = this.renderTargetsVertical[4].texture, this.compositeMaterial.uniforms.bloomStrength.value = r, this.compositeMaterial.uniforms.bloomRadius.value = .1;
    let p = [1, .8, .6, .4, .2];
    this.compositeMaterial.uniforms.bloomFactors.value = p, this.bloomTintColors = [new to(1, 1, 1), new to(1, 1, 1), new to(1, 1, 1), new to(1, 1, 1), new to(1, 1, 1)], this.compositeMaterial.uniforms.bloomTintColors.value = this.bloomTintColors, this.copyUniforms = ap.clone(yn.uniforms), this.blendMaterial = new ma({
      uniforms: this.copyUniforms,
      vertexShader: yn.vertexShader,
      fragmentShader: yn.fragmentShader,
      premultipliedAlpha: !0,
      blending: eb,
      depthTest: !1,
      depthWrite: !1,
      transparent: !0
    }), this._oldClearColor = new op(), this._oldClearAlpha = 1, this._basic = new tb(), this._fsQuad = new Gt(null);
  }
  dispose() {
    for (let t = 0; t < this.renderTargetsHorizontal.length; t++) this.renderTargetsHorizontal[t].dispose();
    for (let t = 0; t < this.renderTargetsVertical.length; t++) this.renderTargetsVertical[t].dispose();
    this.renderTargetBright.dispose();
    for (let t = 0; t < this.separableBlurMaterials.length; t++) this.separableBlurMaterials[t].dispose();
    this.compositeMaterial.dispose(), this.blendMaterial.dispose(), this._basic.dispose(), this._fsQuad.dispose();
  }
  setSize(t, r) {
    let n = Math.round(t / 2),
      o = Math.round(r / 2);
    this.renderTargetBright.setSize(n, o);
    for (let a = 0; a < this.nMips; a++) this.renderTargetsHorizontal[a].setSize(n, o), this.renderTargetsVertical[a].setSize(n, o), this.separableBlurMaterials[a].uniforms.invSize.value = new Pr(1 / n, 1 / o), n = Math.round(n / 2), o = Math.round(o / 2);
  }
  render(t, r, n, o, a) {
    t.getClearColor(this._oldClearColor), this._oldClearAlpha = t.getClearAlpha();
    let s = t.autoClear;
    t.autoClear = !1, t.setClearColor(this.clearColor, 0), a && t.state.buffers.stencil.setTest(!1), this.renderToScreen && (this._fsQuad.material = this._basic, this._basic.map = n.texture, t.setRenderTarget(null), t.clear(), this._fsQuad.render(t)), this.highPassUniforms.tDiffuse.value = n.texture, this.highPassUniforms.luminosityThreshold.value = this.threshold, this._fsQuad.material = this.materialHighPassFilter, t.setRenderTarget(this.renderTargetBright), t.clear(), this._fsQuad.render(t);
    let i = this.renderTargetBright;
    for (let l = 0; l < this.nMips; l++) this._fsQuad.material = this.separableBlurMaterials[l], this.separableBlurMaterials[l].uniforms.colorTexture.value = i.texture, this.separableBlurMaterials[l].uniforms.direction.value = e.BlurDirectionX, t.setRenderTarget(this.renderTargetsHorizontal[l]), t.clear(), this._fsQuad.render(t), this.separableBlurMaterials[l].uniforms.colorTexture.value = this.renderTargetsHorizontal[l].texture, this.separableBlurMaterials[l].uniforms.direction.value = e.BlurDirectionY, t.setRenderTarget(this.renderTargetsVertical[l]), t.clear(), this._fsQuad.render(t), i = this.renderTargetsVertical[l];
    this._fsQuad.material = this.compositeMaterial, this.compositeMaterial.uniforms.bloomStrength.value = this.strength, this.compositeMaterial.uniforms.bloomRadius.value = this.radius, this.compositeMaterial.uniforms.bloomTintColors.value = this.bloomTintColors, t.setRenderTarget(this.renderTargetsHorizontal[0]), t.clear(), this._fsQuad.render(t), this._fsQuad.material = this.blendMaterial, this.copyUniforms.tDiffuse.value = this.renderTargetsHorizontal[0].texture, a && t.state.buffers.stencil.setTest(!0), this.renderToScreen ? (t.setRenderTarget(null), this._fsQuad.render(t)) : (t.setRenderTarget(n), this._fsQuad.render(t)), t.setClearColor(this._oldClearColor, this._oldClearAlpha), t.autoClear = s;
  }
  _getSeparableBlurMaterial(t) {
    let r = [],
      n = t / 3;
    for (let o = 0; o < t; o++) r.push(.39894 * Math.exp(-.5 * o * o / (n * n)) / n);
    return new ma({
      defines: {
        KERNEL_RADIUS: t
      },
      uniforms: {
        colorTexture: {
          value: null
        },
        invSize: {
          value: new Pr(.5, .5)
        },
        direction: {
          value: new Pr(.5, .5)
        },
        gaussianCoefficients: {
          value: r
        }
      },
      vertexShader: `

				varying vec2 vUv;

				void main() {

					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

				}`,
      fragmentShader: `

				#include <common>

				varying vec2 vUv;

				uniform sampler2D colorTexture;
				uniform vec2 invSize;
				uniform vec2 direction;
				uniform float gaussianCoefficients[KERNEL_RADIUS];

				void main() {

					float weightSum = gaussianCoefficients[0];
					vec3 diffuseSum = texture2D( colorTexture, vUv ).rgb * weightSum;

					for ( int i = 1; i < KERNEL_RADIUS; i ++ ) {

						float x = float( i );
						float w = gaussianCoefficients[i];
						vec2 uvOffset = direction * invSize * x;
						vec3 sample1 = texture2D( colorTexture, vUv + uvOffset ).rgb;
						vec3 sample2 = texture2D( colorTexture, vUv - uvOffset ).rgb;
						diffuseSum += ( sample1 + sample2 ) * w;

					}

					gl_FragColor = vec4( diffuseSum, 1.0 );

				}`
    });
  }
  _getCompositeMaterial(t) {
    return new ma({
      defines: {
        NUM_MIPS: t
      },
      uniforms: {
        blurTexture1: {
          value: null
        },
        blurTexture2: {
          value: null
        },
        blurTexture3: {
          value: null
        },
        blurTexture4: {
          value: null
        },
        blurTexture5: {
          value: null
        },
        bloomStrength: {
          value: 1
        },
        bloomFactors: {
          value: null
        },
        bloomTintColors: {
          value: null
        },
        bloomRadius: {
          value: 0
        }
      },
      vertexShader: `

				varying vec2 vUv;

				void main() {

					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

				}`,
      fragmentShader: `

				varying vec2 vUv;

				uniform sampler2D blurTexture1;
				uniform sampler2D blurTexture2;
				uniform sampler2D blurTexture3;
				uniform sampler2D blurTexture4;
				uniform sampler2D blurTexture5;
				uniform float bloomStrength;
				uniform float bloomRadius;
				uniform float bloomFactors[NUM_MIPS];
				uniform vec3 bloomTintColors[NUM_MIPS];

				float lerpBloomFactor( const in float factor ) {

					float mirrorFactor = 1.2 - factor;
					return mix( factor, mirrorFactor, bloomRadius );

				}

				void main() {

					// 3.0 for backwards compatibility with previous alpha-based intensity
					vec3 bloom = 3.0 * bloomStrength * (
						lerpBloomFactor( bloomFactors[ 0 ] ) * bloomTintColors[ 0 ] * texture2D( blurTexture1, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 1 ] ) * bloomTintColors[ 1 ] * texture2D( blurTexture2, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 2 ] ) * bloomTintColors[ 2 ] * texture2D( blurTexture3, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 3 ] ) * bloomTintColors[ 3 ] * texture2D( blurTexture4, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 4 ] ) * bloomTintColors[ 4 ] * texture2D( blurTexture5, vUv ).rgb
					);

					float bloomAlpha = max( bloom.r, max( bloom.g, bloom.b ) );
					gl_FragColor = vec4( bloom, bloomAlpha );

				}`
    });
  }
};
vn.BlurDirectionX = new Pr(1, 0);
vn.BlurDirectionY = new Pr(0, 1);
import * as ro from "./001-three-a973dc20bf0957e55145ef9e6b9c97d50275b224b1d81a57603249dd6750ab96.js";
var ha = "RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );",
  ip = "// Remix: zero direct light contributes no diffuse or specular term.";
function sp() {
  if (ro.REVISION !== "185") return;
  let e = ro.ShaderChunk.lights_fragment_begin;
  e.includes(ip) || e.split(ha).length === 4 && (ro.ShaderChunk.lights_fragment_begin = `${ip}
${e.replaceAll(ha, `
#if ( NUM_POINT_LIGHTS + NUM_SPOT_LIGHTS >= 4 ) && ( defined( STANDARD ) || defined( PHONG ) || defined( LAMBERT ) || defined( TOON ) )
  if ( directLight.visible ) { ${ha} }
#else
  ${ha}
#endif
`)}`);
}
import * as ke from "./001-three-a973dc20bf0957e55145ef9e6b9c97d50275b224b1d81a57603249dd6750ab96.js";
var lp = "1024.0",
  no = 5,
  Hs = [6, 10, 14, 18, 22],
  up = 22,
  rb = [1, .8, .6, .4, .2],
  pp = `
  float portalFiniteComponent( float v ) {
    return abs( v ) < ${lp} ? v : ( v > 0.0 ? ${lp} : 0.0 );
  }
  vec4 portalFinite( vec4 c ) {
    c = vec4( portalFiniteComponent( c.r ), portalFiniteComponent( c.g ), portalFiniteComponent( c.b ), portalFiniteComponent( c.a ) );
    return vec4( max( c.rgb, vec3( 0.0 ) ), clamp( c.a, 0.0, 1.0 ) );
  }
`,
  Ls = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
  }
`;
function nb(e) {
  let t = e / 3,
    r = new Array(up).fill(0);
  for (let n = 0; n < e; n++) r[n] = .39894 * Math.exp(-.5 * n * n / (t * t)) / t;
  return r;
}
var ga = e => {
    let t = new ke.WebGLRenderTarget(1, 1, {
      type: ke.HalfFloatType
    });
    return t.texture.name = e, t.texture.generateMipmaps = !1, t;
  },
  ba = class extends it {
    strength;
    radius;
    threshold;
    resolution;
    bloom;
    brightMaterial;
    blurMaterial;
    compositeMaterial;
    bright = ga("PhoneBloom.bright");
    horizontal = Array.from({
      length: no
    }, (t, r) => ga(`PhoneBloom.h${r}`));
    vertical = Array.from({
      length: no
    }, (t, r) => ga(`PhoneBloom.v${r}`));
    kernels = Hs.map(nb);
    sizes = Array.from({
      length: no
    }, () => new ke.Vector2(1, 1));
    quad = new Gt();
    oldClear = new ke.Color();
    brightUniforms = {
      tDiffuse: {
        value: null
      },
      luminosityThreshold: {
        value: 0
      },
      smoothWidth: {
        value: .01
      }
    };
    blurUniforms = {
      colorTexture: {
        value: null
      },
      invSize: {
        value: new ke.Vector2(1, 1)
      },
      direction: {
        value: new ke.Vector2(1, 0)
      },
      kernelRadius: {
        value: Hs[0]
      },
      gaussianCoefficients: {
        value: []
      }
    };
    compositeUniforms = {
      blurTexture1: {
        value: null
      },
      blurTexture2: {
        value: null
      },
      blurTexture3: {
        value: null
      },
      blurTexture4: {
        value: null
      },
      blurTexture5: {
        value: null
      },
      bloomStrength: {
        value: 1
      },
      bloomRadius: {
        value: 0
      },
      bloomFactors: {
        value: rb
      }
    };
    constructor(t, r, n, o) {
      super(), this.strength = r, this.radius = n, this.threshold = o, this.resolution = t.clone(), this.needsSwap = !1, this.bloom = ga("PhoneBloom.composite"), this.brightUniforms.luminosityThreshold.value = o, this.blurUniforms.gaussianCoefficients.value = this.kernels[0] ?? [];
      let a = this.compositeUniforms;
      a.blurTexture1.value = this.vertical[0]?.texture ?? null, a.blurTexture2.value = this.vertical[1]?.texture ?? null, a.blurTexture3.value = this.vertical[2]?.texture ?? null, a.blurTexture4.value = this.vertical[3]?.texture ?? null, a.blurTexture5.value = this.vertical[4]?.texture ?? null, a.bloomStrength.value = r, a.bloomRadius.value = n, this.brightMaterial = new ke.ShaderMaterial({
        name: "PortalPhoneBloomBright",
        uniforms: this.brightUniforms,
        vertexShader: Ls,
        fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform float luminosityThreshold;
        uniform float smoothWidth;
        varying vec2 vUv;
        ${pp}
        void main() {
          vec4 texel = portalFinite( texture2D( tDiffuse, vUv ) );
          float v = luminance( texel.xyz );
          float alpha = smoothstep( luminosityThreshold, luminosityThreshold + smoothWidth, v );
          gl_FragColor = mix( vec4( 0.0 ), texel, alpha );
        }
      `
      }), this.blurMaterial = new ke.ShaderMaterial({
        name: "PortalPhoneBloomBlur",
        uniforms: this.blurUniforms,
        defines: {
          MAX_RADIUS: up
        },
        vertexShader: Ls,
        fragmentShader: `
        uniform sampler2D colorTexture;
        uniform vec2 invSize;
        uniform vec2 direction;
        uniform int kernelRadius;
        uniform float gaussianCoefficients[ MAX_RADIUS ];
        varying vec2 vUv;
        void main() {
          float weightSum = gaussianCoefficients[ 0 ];
          vec3 diffuseSum = texture2D( colorTexture, vUv ).rgb * weightSum;
          for ( int i = 1; i < MAX_RADIUS; i ++ ) {
            if ( i >= kernelRadius ) break;
            float w = gaussianCoefficients[ i ];
            vec2 uvOffset = direction * invSize * float( i );
            diffuseSum += ( texture2D( colorTexture, vUv + uvOffset ).rgb + texture2D( colorTexture, vUv - uvOffset ).rgb ) * w;
          }
          gl_FragColor = vec4( diffuseSum, 1.0 );
        }
      `
      }), this.compositeMaterial = new ke.ShaderMaterial({
        name: "PortalPhoneBloomComposite",
        uniforms: this.compositeUniforms,
        vertexShader: Ls,
        fragmentShader: `
        uniform sampler2D blurTexture1;
        uniform sampler2D blurTexture2;
        uniform sampler2D blurTexture3;
        uniform sampler2D blurTexture4;
        uniform sampler2D blurTexture5;
        uniform float bloomStrength;
        uniform float bloomRadius;
        uniform float bloomFactors[ 5 ];
        varying vec2 vUv;
        float lerpBloomFactor( const in float factor ) {
          return mix( factor, 1.2 - factor, bloomRadius );
        }
        void main() {
          vec3 bloom = 3.0 * bloomStrength * (
            lerpBloomFactor( bloomFactors[ 0 ] ) * texture2D( blurTexture1, vUv ).rgb +
            lerpBloomFactor( bloomFactors[ 1 ] ) * texture2D( blurTexture2, vUv ).rgb +
            lerpBloomFactor( bloomFactors[ 2 ] ) * texture2D( blurTexture3, vUv ).rgb +
            lerpBloomFactor( bloomFactors[ 3 ] ) * texture2D( blurTexture4, vUv ).rgb +
            lerpBloomFactor( bloomFactors[ 4 ] ) * texture2D( blurTexture5, vUv ).rgb
          );
          gl_FragColor = vec4( bloom, max( bloom.r, max( bloom.g, bloom.b ) ) );
        }
      `
      }), this.setSize(this.resolution.x, this.resolution.y);
    }
    setSize(t, r) {
      let n = Math.round(t / 2),
        o = Math.round(r / 2);
      this.bright.setSize(n, o), this.bloom.setSize(n, o);
      for (let a = 0; a < no; a++) this.horizontal[a]?.setSize(n, o), this.vertical[a]?.setSize(n, o), this.sizes[a]?.set(1 / n, 1 / o), n = Math.round(n / 2), o = Math.round(o / 2);
    }
    render(t, r, n) {
      t.getClearColor(this.oldClear);
      let o = t.getClearAlpha(),
        a = t.autoClear;
      t.autoClear = !1, t.setClearColor(0, 0);
      let s = (p, m) => {
        this.quad.material = p, t.setRenderTarget(m), t.clear(), this.quad.render(t);
      };
      this.brightUniforms.tDiffuse.value = n.texture, this.brightUniforms.luminosityThreshold.value = this.threshold, s(this.brightMaterial, this.bright);
      let i = this.blurUniforms,
        l = this.bright;
      for (let p = 0; p < no; p++) {
        let m = this.horizontal[p],
          E = this.vertical[p];
        i.invSize.value = this.sizes[p], i.kernelRadius.value = Hs[p], i.gaussianCoefficients.value = this.kernels[p], i.colorTexture.value = l.texture, i.direction.value = ob, s(this.blurMaterial, m), i.colorTexture.value = m.texture, i.direction.value = ab, s(this.blurMaterial, E), l = E;
      }
      this.compositeUniforms.bloomStrength.value = this.strength, this.compositeUniforms.bloomRadius.value = this.radius, s(this.compositeMaterial, this.bloom), t.setClearColor(this.oldClear, o), t.autoClear = a;
    }
    dispose() {
      for (let t of [this.bright, this.bloom, ...this.horizontal, ...this.vertical]) t.dispose();
      this.brightMaterial.dispose(), this.blurMaterial.dispose(), this.compositeMaterial.dispose(), this.quad.dispose();
    }
  },
  ob = new ke.Vector2(1, 0),
  ab = new ke.Vector2(0, 1),
  ya = class extends it {
    constructor(r, n) {
      super();
      this.bloomPass = r;
      this.colorSpace = n.outputColorSpace, this.toneMapping = n.toneMapping, this.material = new ke.RawShaderMaterial({
        defines: cp(n.outputColorSpace, n.toneMapping),
        name: "PortalPhoneOutput",
        uniforms: this.uniforms,
        vertexShader: Ar.vertexShader,
        fragmentShader: Ar.fragmentShader.replace("uniform sampler2D tDiffuse;", `uniform sampler2D tDiffuse;
		uniform sampler2D tBloom;
${pp}`).replace("gl_FragColor = texture2D( tDiffuse, vUv );", `gl_FragColor = portalFinite( texture2D( tDiffuse, vUv ) );
			vec4 bloom = texture2D( tBloom, vUv );
			gl_FragColor += bloom;`)
      }), this.quad = new Gt(this.material);
    }
    material;
    quad;
    colorSpace = null;
    toneMapping = null;
    uniforms = {
      tDiffuse: {
        value: null
      },
      tBloom: {
        value: null
      },
      toneMappingExposure: {
        value: 1
      }
    };
    render(r, n, o) {
      this.uniforms.tDiffuse.value = o.texture, this.uniforms.tBloom.value = this.bloomPass.bloom.texture, this.uniforms.toneMappingExposure.value = r.toneMappingExposure, (this.colorSpace !== r.outputColorSpace || this.toneMapping !== r.toneMapping) && (this.colorSpace = r.outputColorSpace, this.toneMapping = r.toneMapping, this.material.defines = cp(r.outputColorSpace, r.toneMapping), this.material.needsUpdate = !0), r.setRenderTarget(this.renderToScreen ? null : n), this.quad.render(r);
    }
    dispose() {
      this.material.dispose(), this.quad.dispose();
    }
  };
function cp(e, t) {
  let r = {};
  ke.ColorManagement.getTransfer(e) === ke.SRGBTransfer && (r.SRGB_TRANSFER = "");
  let o = {
    [ke.LinearToneMapping]: "LINEAR_TONE_MAPPING",
    [ke.ReinhardToneMapping]: "REINHARD_TONE_MAPPING",
    [ke.CineonToneMapping]: "CINEON_TONE_MAPPING",
    [ke.ACESFilmicToneMapping]: "ACES_FILMIC_TONE_MAPPING",
    [ke.AgXToneMapping]: "AGX_TONE_MAPPING",
    [ke.NeutralToneMapping]: "NEUTRAL_TONE_MAPPING",
    [ke.CustomToneMapping]: "CUSTOM_TONE_MAPPING"
  }[t];
  return o && (r[o] = ""), r;
}
import * as xn from "./001-three-a973dc20bf0957e55145ef9e6b9c97d50275b224b1d81a57603249dd6750ab96.js";
function dp(e, t) {
  e.updateMatrixWorld(!0), t.updateMatrixWorld(!0);
  let r = new xn.Frustum().setFromProjectionMatrix(new xn.Matrix4().multiplyMatrices(t.projectionMatrix, t.matrixWorldInverse), t.coordinateSystem),
    n = [];
  return e.traverseVisible(o => {
    let a = o;
    (a.isMesh || o.isPoints || o.isLine || a.isSprite) && t.layers.test(o.layers) && (o.frustumCulled && !(a.isSprite ? r.intersectsSprite(a) : r.intersectsObject(o)) || n.push(o));
  }), Is(n);
}
function fp(e) {
  let t = [];
  for (let r of e) r.traverse(n => {
    (n.isMesh || n.isPoints || n.isLine || n.isSprite) && t.push(n);
  });
  return Is(t);
}
function mp(e, t, r) {
  let n = [],
    o = [];
  for (let a of t) a.parent || (e.add(a), n.push(a)), a.traverse(s => {
    o.push([s, s.visible, s.frustumCulled]), s.visible = !0, s.frustumCulled = !1;
  });
  try {
    return r();
  } finally {
    for (let [a, s, i] of o) a.visible = s, a.frustumCulled = i;
    for (let a of n) a.removeFromParent();
  }
}
function Is(e) {
  let t = new xn.Scene();
  return t.traverse = r => {
    r(t), e.forEach(r);
  }, t.traverseVisible = t.traverse, t;
}
function Ea(e, t) {
  let r = e.filter(n => !n.visible);
  for (let n of r) n.visible = !0;
  try {
    return t();
  } finally {
    for (let n of r) n.visible = !1;
  }
}
function hp(e) {
  let t = [];
  e.traverse(n => {
    (n.isMesh || n.isPoints || n.isLine || n.isSprite) && t.push(n);
  });
  let r = [];
  for (let n = 0; n < t.length; n += 4) r.push(Is(t.slice(n, n + 4)));
  return r;
}
var va = 16,
  gp = 1024,
  ib = {
    name: "PortalFiniteShader",
    uniforms: {
      tDiffuse: {
        value: null
      }
    },
    vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    }
  `,
    fragmentShader: `
    uniform sampler2D tDiffuse;
    varying vec2 vUv;
    void main() {
      vec4 c = texture2D( tDiffuse, vUv );
      // Boolean mix() is a select, never arithmetic, so a NaN cannot leak
      // through it. NaN fails both comparisons (black); +Inf takes the ceiling.
      bvec4 finite = lessThan( abs( c ), vec4( ${gp.toFixed(1)} ) );
      bvec4 bright = greaterThan( c, vec4( 0.0 ) );
      c = mix( mix( vec4( 0.0 ), vec4( ${gp.toFixed(1)} ), bright ), c, finite );
      gl_FragColor = vec4( max( c.rgb, vec3( 0.0 ) ), clamp( c.a, 0.0, 1.0 ) );
    }
  `
  },
  bp = 1024;
function yp(e, t) {
  let r = 0;
  return e.traverse(n => {
    let o = n;
    if (!o.isLight || !o.castShadow || !o.shadow) return;
    let a = o.shadow.mapSize;
    a.x <= t && a.y <= t || (a.set(Math.min(a.x, t), Math.min(a.y, t)), o.shadow.map?.dispose(), o.shadow.map = null, r += 1);
  }), r;
}
var Os = "(any-pointer: fine) and (any-hover: hover)";
function Ep() {
  try {
    return globalThis.matchMedia?.("(pointer: coarse)").matches === !0 && globalThis.matchMedia?.(Os).matches === !1;
  } catch {
    return !1;
  }
}
function sb(e) {
  e.extensions.has("EXT_texture_filter_anisotropic"), e.capabilities.getMaxAnisotropy();
}
function lb(e) {
  let t = new Set();
  for (let r of e.passes) for (let n of Object.values(r)) {
    let o = Array.isArray(n) ? n : [n];
    for (let a of o) a?.isMaterial && t.add(a);
  }
  return [...t];
}
function vp(e, t, r = n => new Xe.WebGLRenderer(n)) {
  sp();
  let n = cb(e.pixelate, .1, 1),
    o = e.phone === !0 && e.bloom !== null,
    a = r({
      antialias: n >= 1 && !o,
      powerPreference: "high-performance"
    });
  sb(a), a.outputColorSpace = Xe.SRGBColorSpace, a.toneMapping = e.toneMapping, a.toneMappingExposure = e.exposure, e.shadows && (a.shadowMap.enabled = !0, a.shadowMap.type = Xe.PCFShadowMap);
  let s = a.domElement;
  Object.assign(s.style, {
    position: "fixed",
    inset: "0",
    width: "100%",
    height: "100%",
    display: "block",
    touchAction: "none",
    imageRendering: n < 1 ? "pixelated" : "auto"
  }), t.prepend(s);
  let i = 1,
    l = 1,
    p = null,
    m = null,
    E = !1,
    y = !1,
    b = new Set(),
    R = () => {
      s.width = 1, s.height = 1, p?.composer.setSize(1, 1);
    },
    v = () => {
      i = Math.max(1, window.innerWidth), l = Math.max(1, window.innerHeight);
      let H = Math.min(window.devicePixelRatio || 1, e.maxPixelRatio) * n;
      a.setPixelRatio(H), a.setSize(i, l, !1), p && (p.composer.setPixelRatio(H), p.composer.setSize(i, l)), m?.resolution.set(i * H, l * H), (E || y) && R();
      for (let h of [...b]) h(i, l);
    };
  window.addEventListener("resize", v), v();
  let T = (H, h) => {
      if (!e.bloom) return null;
      if (p && p.scene === H && p.camera === h) return p.composer;
      p?.composer.dispose();
      let P = new pa(a);
      P.setPixelRatio(a.getPixelRatio()), P.setSize(i, l), P.addPass(new fa(H, h));
      let {
          strength: A,
          radius: w,
          threshold: C
        } = e.bloom,
        k = a.getPixelRatio(),
        W = new Xe.Vector2(i * k, l * k);
      if (o) {
        let L = new ba(W, A, w, C);
        m = L, P.addPass(L), P.addPass(new ya(L, a));
      } else P.addPass(new En(ib)), m = new vn(W, A, w, C), P.addPass(m), P.addPass(new da());
      return p = {
        composer: P,
        scene: H,
        camera: h
      }, E && P.setSize(1, 1), P;
    },
    M = (H, h) => {
      let P = a.getRenderTarget(),
        A = new Xe.WebGLRenderTarget(va, va, {
          colorSpace: Xe.SRGBColorSpace,
          depthBuffer: !0
        });
      A.isXRRenderTarget = !0;
      try {
        let w = T(H, h);
        if (w || (a.setRenderTarget(A), a.render(H, h)), w) {
          let C = a.getPixelRatio();
          w.setSize(va / C, va / C), w.renderToScreen = !1;
          try {
            w.render(0);
          } finally {
            w.renderToScreen = !0, E || y ? R() : w.setSize(i, l);
          }
        }
      } finally {
        a.setRenderTarget(P), A.dispose();
      }
    };
  return {
    get shared() {
      return y;
    },
    setShared(H) {
      y = H, s.style.opacity = H ? "0" : "1";
      for (let h of [document.documentElement, document.body]) h.style.background = H ? "transparent" : "";
      H ? R() : v();
    },
    renderer: a,
    canvas: s,
    get width() {
      return i;
    },
    get height() {
      return l;
    },
    render(H, h, P) {
      if (y) return;
      a.setRenderTarget(null);
      let A = T(H, h);
      A ? A.render(P) : a.render(H, h);
    },
    async compileAsync(H, h, P, A = [], w = []) {
      let C = e.shaderWarmup === "visible" && P === "complete",
        k = C ? hp(H) : [e.shaderWarmup === "visible" && P !== "complete" ? dp(H, h) : H, ...(w.length > 0 ? [fp(w)] : [])],
        W = a.getRenderTarget();
      try {
        let L = T(H, h);
        for (let g = 0; g < k.length; g++) {
          let S = k[g];
          if (!S) continue;
          a.setRenderTarget(L?.readBuffer ?? null);
          let I = Ea(A, () => a.compileAsync(S, h, H));
          a.setRenderTarget(W), await I, C && g + 1 < k.length && (await new Promise(F => setTimeout(F, 0)));
        }
        if (!L) return;
        let K = new Xe.BufferGeometry();
        K.setAttribute("position", new Xe.Float32BufferAttribute([-1, 3, 0, -1, -1, 0, 3, -1, 0], 3)), K.setAttribute("uv", new Xe.Float32BufferAttribute([0, 2, 0, 0, 2, 0], 2));
        let D = new Xe.Scene();
        for (let g of lb(L)) D.add(new Xe.Mesh(K, g));
        a.setRenderTarget(L.readBuffer);
        let N = a.compileAsync(D, h);
        a.setRenderTarget(W), await N, K.dispose();
      } finally {
        a.setRenderTarget(W);
      }
    },
    warm(H, h, P = []) {
      mp(H, P, () => M(H, h));
    },
    get parked() {
      return E;
    },
    park(H) {
      H !== E && (E = H, H ? R() : v());
    },
    onResize(H) {
      return b.add(H), () => b.delete(H);
    },
    dispose() {
      window.removeEventListener("resize", v), b.clear(), p?.composer.dispose(), a.setAnimationLoop(null), a.dispose(), s.remove();
    }
  };
}
var cb = (e, t, r) => Math.min(r, Math.max(t, e));
var ub = "#b6ff00";
function qr(e) {
  let t = typeof e == "string" && /^#[0-9a-f]{6}$/i.test(e) ? e.toLowerCase() : ub,
    r = [Number.parseInt(t.slice(1, 3), 16), Number.parseInt(t.slice(3, 5), 16), Number.parseInt(t.slice(5, 7), 16)],
    n = r.map(i => {
      let l = i / 255;
      return l <= .04045 ? l / 12.92 : ((l + .055) / 1.055) ** 2.4;
    }),
    o = .2126 * n[0] + .7152 * n[1] + .0722 * n[2],
    a = Math.min(.5, Math.max(0, (.4 - o) * 1.2)),
    s = `#${r.map(i => Math.round(i + (255 - i) * a).toString(16).padStart(2, "0")).join("")}`;
  return {
    hex: t,
    rgb: r,
    onAccent: o > .3 ? "#060b0f" : "#fafafa",
    text: s
  };
}
function xp(e) {
  let t = (e ?? "").trim().replace(/^@/, ""),
    r = Array.from(t)[0];
  return r ? r.toUpperCase() : "?";
}
function Ns(e) {
  if (typeof e != "string" || e.length === 0 || e.length > 2e6) return null;
  let t = e.trim();
  if (/^data:image\/(png|jpe?g|gif|webp|avif|svg\+xml)[;,]/i.test(t)) return t;
  try {
    let r = new URL(t);
    return r.protocol === "https:" || r.protocol === "http:" || r.protocol === "blob:" ? r.href : null;
  } catch {
    return null;
  }
}
function Tp(e) {
  let t = [],
    r = /\[([^\[\]]{1,12})\]/g,
    n = 0;
  for (let o = r.exec(e); o; o = r.exec(e)) o.index > n && t.push({
    kind: "text",
    value: e.slice(n, o.index)
  }), t.push({
    kind: "key",
    value: o[1]
  }), n = o.index + o[0].length;
  return n < e.length && t.push({
    kind: "text",
    value: e.slice(n)
  }), t;
}
function Fs(e) {
  let t = (e ?? "").trim().replace(/^@+/, "");
  return t ? `@${t}` : null;
}
function wp(e) {
  return e === "back" ? "Welcome back to" : e === "entry" ? "You are in" : e === "follow" ? "Joining a friend in" : "Entering";
}
function kp(e) {
  let t = e.trim().toLowerCase().replace(/\s+/g, " ");
  if (t === "both buttons" || t === "both mouse buttons") return {
    part: "both",
    word: ""
  };
  if (["scroll", "wheel", "mouse wheel", "scroll wheel"].includes(t)) return {
    part: "wheel",
    word: "scroll"
  };
  let r = /^(left|right)(?: mouse)? (drag|click|button)$/.exec(t);
  return r ? {
    part: r[1],
    word: r[2] === "button" ? "" : String(r[2])
  } : null;
}
function xa(e) {
  let t = [];
  for (let r of e) {
    let n = t[t.length - 1];
    n && n.key === r ? n.count += 1 : t.push({
      key: r,
      count: 1
    });
  }
  return t;
}
function pb(e, t = 1) {
  if (!Number.isFinite(e)) return "-:--";
  let r = Math.min(3, Math.max(0, Math.floor(t))),
    n = 10 ** r,
    o = Math.floor(Math.max(0, e) * n + 1e-6),
    a = Math.floor(o / n),
    s = r > 0 ? `.${String(o % n).padStart(r, "0")}` : "",
    i = String(a % 60).padStart(2, "0"),
    l = Math.floor(a / 60);
  return l < 60 ? `${l}:${i}${s}` : `${Math.floor(l / 60)}:${String(l % 60).padStart(2, "0")}:${i}${s}`;
}
var ka = ["default", "interact", "steer", "attack", "ui"],
  Ta = 24,
  Pp = [1, 2, 3],
  db = {
    default: [4, 3],
    interact: [4, 3],
    ui: [4, 3],
    steer: [12, 12],
    attack: [12, 12]
  },
  fb = {
    default: "default",
    interact: "pointer",
    ui: "pointer",
    steer: "move",
    attack: "crosshair"
  },
  Qr = "#07090d",
  mb = "#262e3b",
  hb = "rgba(255, 255, 255, 0.96)",
  gb = "#ff3b4f",
  bb = "#ff6b7a",
  Rp = "rgba(255, 255, 255, 0.9)",
  Je = e => Number(e.toFixed(2));
function xt(e, t, r) {
  return `M${Je(e - r)} ${Je(t)}a${Je(r)} ${Je(r)} 0 1 0 ${Je(2 * r)} 0a${Je(r)} ${Je(r)} 0 1 0 ${Je(-2 * r)} 0Z`;
}
var wa = "M4.5 3.5L4.5 19.2L8.7 15.2L15.3 14.9Z";
function Sp(e, t, r, n, o) {
  let a = E => {
      let y = E * Math.PI / 180;
      return [e + r * Math.cos(y), t + r * Math.sin(y)];
    },
    [s, i] = a(n),
    [l, p] = a(o),
    m = o - n > 180 ? 1 : 0;
  return `M${Je(s)} ${Je(i)}A${Je(r)} ${Je(r)} 0 ${m} 1 ${Je(l)} ${Je(p)}`;
}
function Mp(e, t, r, n, o) {
  let a = n * Math.PI / 180,
    s = e + r * Math.cos(a),
    i = t + r * Math.sin(a),
    l = -Math.sin(a),
    p = Math.cos(a),
    m = Math.cos(a),
    E = Math.sin(a),
    y = [s + l * o, i + p * o],
    b = [s + m * o * .75 - l * o * .2, i + E * o * .75 - p * o * .2],
    R = [s - m * o * .75 - l * o * .2, i - E * o * .75 - p * o * .2];
  return `M${Je(b[0])} ${Je(b[1])}L${Je(y[0])} ${Je(y[1])}L${Je(R[0])} ${Je(R[1])}`;
}
function yb(e, t, r, n) {
  return [`M${e} ${t - n}V${t - r}`, `M${e} ${t + r}V${t + n}`, `M${e - n} ${t}H${e - r}`, `M${e + r} ${t}H${e + n}`].join("");
}
function Ap(e) {
  return [{
    d: wa,
    fill: [mb, Qr],
    shadow: !0
  }, {
    d: wa,
    stroke: hb,
    width: 1.25
  }, {
    d: xt(7.5, 12.3, 1.85),
    fill: e,
    glow: {
      color: e,
      blur: 2.6
    }
  }];
}
function Vs(e, t) {
  let r = qr(t);
  switch (e) {
    case "default":
      return Ap(r.text);
    case "interact":
      {
        let n = xt(17.4, 18.2, 3.5);
        return [...Ap(r.text), {
          d: n,
          stroke: Qr,
          width: 3.8,
          shadow: !0
        }, {
          d: n,
          stroke: r.text,
          width: 1.8,
          glow: {
            color: r.text,
            blur: 2.4
          }
        }, {
          d: xt(17.4, 18.2, 1.05),
          fill: "#ffffff"
        }];
      }
    case "ui":
      return [{
        d: wa,
        fill: [r.text, r.hex],
        shadow: !0
      }, {
        d: wa,
        stroke: Qr,
        width: 1.5
      }, {
        d: xt(7.5, 12.3, 1.5),
        fill: r.onAccent
      }];
    case "steer":
      {
        let o = `${Sp(12, 12, 6.6, 200, 322)}${Sp(12, 12, 6.6, 20, 142)}`,
          a = `${Mp(12, 12, 6.6, 322, 2.3)}${Mp(12, 12, 6.6, 142, 2.3)}`,
          s = xt(12, 12, 1.6);
        return [{
          d: o + a,
          stroke: Qr,
          width: 4,
          shadow: !0
        }, {
          d: o + a,
          stroke: r.text,
          width: 1.9,
          glow: {
            color: r.text,
            blur: 2.4
          }
        }, {
          d: s,
          stroke: Qr,
          width: 2.6
        }, {
          d: s,
          fill: "#ffffff"
        }];
      }
    case "attack":
      {
        let n = xt(12, 12, 6.2),
          o = yb(12, 12, 3.4, 9.2),
          a = xt(12, 12, 1.25);
        return [{
          d: n + o,
          stroke: Rp,
          width: 5.6,
          shadow: !0
        }, {
          d: n + o,
          stroke: Qr,
          width: 3.8
        }, {
          d: n + o,
          stroke: gb,
          width: 1.8,
          glow: {
            color: bb,
            blur: 2.2
          }
        }, {
          d: a,
          stroke: Rp,
          width: 4.2
        }, {
          d: a,
          stroke: Qr,
          width: 2.4
        }, {
          d: a,
          fill: "#ffffff"
        }];
      }
  }
}
function Eb(e, t, r) {
  e.save(), e.clearRect(0, 0, Ta * r, Ta * r), e.scale(r, r), e.lineCap = "round", e.lineJoin = "round";
  for (let n of t) {
    let o = new Path2D(n.d);
    if (e.save(), n.shadow ? (e.shadowColor = "rgba(0, 0, 0, 0.5)", e.shadowBlur = 1.8 * r, e.shadowOffsetY = .7 * r) : n.glow && (e.shadowColor = n.glow.color, e.shadowBlur = n.glow.blur * r), n.fill) {
      if (typeof n.fill == "string") e.fillStyle = n.fill;else {
        let a = e.createLinearGradient(0, 3, 0, 20);
        a.addColorStop(0, n.fill[0]), a.addColorStop(1, n.fill[1]), e.fillStyle = a;
      }
      e.fill(o);
    }
    n.stroke && (e.strokeStyle = n.stroke, e.lineWidth = n.width ?? 1, e.stroke(o)), e.restore();
  }
  e.restore();
}
function Cp(e, t, r) {
  let n = Vs(t, r),
    o = [];
  for (let a of Pp) {
    let s = e.createElement("canvas");
    s.width = Ta * a, s.height = Ta * a;
    let i = s.getContext("2d", {
      willReadFrequently: !0
    });
    if (!i || typeof Path2D != "function") return null;
    Eb(i, n, a), o.push(s.toDataURL("image/png"));
  }
  return o;
}
function Hp(e, t, r) {
  let [n, o] = db[e],
    a = fb[e];
  if (r === "url" || t.length === 1) return `url("${t[0]}") ${n} ${o}, ${a}`;
  let s = t.map((i, l) => `url("${i}") ${Pp[l]}x`).join(", ");
  return `${r}(${s}) ${n} ${o}, ${a}`;
}
var Xr = "data-rpk-cursor",
  Lp = "rpk-cursor-style",
  Tn = "data-rpk-capture",
  Ra = `html[${Tn}], html[${Tn}] * { cursor: none !important; }`;
function Ip(e) {
  let t = ka.map(r => `html[${Xr}="${r}"], html[${Xr}="${r}"] body { cursor: ${e[r]}; }`);
  return t.push(`html[${Xr}] .rpk-root :is(button, .rpk-plate) { cursor: ${e.ui}; }`, `html[${Xr}] .rpk-root button:disabled { cursor: ${e.default}; }`, Ra), t.join(`
`);
}
function Op() {
  let e = r => {
      try {
        return typeof CSS < "u" && CSS.supports("cursor", r);
      } catch {
        return !1;
      }
    },
    t = 'url("data:,x") 1x';
  return e(`image-set(${t}) 1 1, auto`) ? "image-set" : e(`-webkit-image-set(${t}) 1 1, auto`) ? "-webkit-image-set" : "url";
}
var Gs = 60,
  Wp = 2,
  Gp = 12,
  vb = .35,
  xb = 1;
function Bp(e, t, r) {
  return e ? "steer" : t ?? r ?? "default";
}
var Tb = new Set(ka),
  Ma = e => typeof e == "string" && Tb.has(e) ? e : null,
  wb = 1.35;
function kb(e, t) {
  let r = e;
  for (; r;) {
    if (!r.visible) return !1;
    if (r === t) return !0;
    r = r.parent;
  }
  return !0;
}
function Rb(e) {
  let t = e;
  for (; t;) {
    if (!t.visible) return !1;
    t = t.parent;
  }
  return !0;
}
var Jr = new Cr.Sphere(),
  Np = new Cr.Plane(),
  Ws = new Cr.Vector3(),
  Sa = new Cr.Vector3(),
  Fp = new Cr.Vector3();
function Dp(e, t, r, n) {
  let o = Math.min(Gs, t.occluder),
    a = o,
    s = null;
  if (t.targets.length > 0) {
    r.ray.copy(e), r.near = 0, r.far = o;
    for (let i of t.targets) if (!(i.disposed || !Rb(i.object))) {
      n.length = 0, i.object.updateWorldMatrix(!0, !0), r.intersectObject(i.object, !0, n);
      for (let l of n) {
        if (l.distance >= a) break;
        if (!kb(l.object, i.object)) continue;
        let p = typeof i.state == "function" ? i.state(l) : i.state,
          m = Ma(p);
        if (m) {
          a = l.distance, s = m;
          break;
        }
      }
    }
    n.length = 0;
  }
  for (let i of t.portals) {
    let {
      yaw: l,
      radius: p = wb
    } = i.spec;
    Ws.set(Math.sin(l), 0, Math.cos(l)), Np.setFromNormalAndCoplanarPoint(Ws, i.center);
    let m = Ws.dot(e.direction);
    if (Math.abs(m) < 1e-4) continue;
    let E = -Np.distanceToPoint(e.origin) / m;
    E > 0 && E < a && (e.at(E, Sa), !(Sa.distanceTo(i.center) > p) && (a = E, s = "interact"));
  }
  for (let {
    options: i
  } of t.interactables) {
    if (i.enabled && !i.enabled()) continue;
    let l = i.position;
    Array.isArray(l) ? Jr.center.set(l[0], l[1], l[2]) : Jr.center.copy(l), Jr.radius = Math.min(xb, Math.max(vb, i.radius * .5)), Fp.subVectors(Jr.center, e.origin);
    let m = Fp.lengthSq() <= Jr.radius * Jr.radius ? 0 : e.intersectSphere(Jr, Sa) ? e.origin.distanceTo(Sa) : null;
    m === null || m >= a || (a = m, s = "interact");
  }
  return s;
}
function zp() {
  let e = [],
    t = null,
    r = null,
    n = "default",
    o = !1,
    a = () => {},
    s = () => {
      t?.documentElement.setAttribute(Xr, n), o ? t?.documentElement.setAttribute(Tn, "") : t?.documentElement.removeAttribute(Tn);
    };
  return {
    override: null,
    targets: e,
    addHoverTarget(i, l) {
      let p = {
        object: i,
        state: l,
        disposed: !1
      };
      return i && (typeof l == "function" || Ma(l)) ? e.push(p) : p.disposed = !0, {
        dispose() {
          if (p.disposed) return;
          p.disposed = !0;
          let m = e.indexOf(p);
          m >= 0 && e.splice(m, 1);
        }
      };
    },
    apply(i) {
      i !== n && (n = i, s());
    },
    get state() {
      return n;
    },
    install(i, l) {
      if (t) return;
      t = i, r = i.createElement("style"), r.id = Lp;
      let p = Sb(i);
      if (p && !p.matches) {
        r.textContent = Ra;
        let m = () => {
          !p.matches || !r || (a(), r.textContent = Vp(i, l));
        };
        p.addEventListener("change", m), a = () => {
          p.removeEventListener("change", m), a = () => {};
        };
      } else r.textContent = Vp(i, l);
      (i.head ?? i.documentElement).append(r), s();
    },
    setCapture(i) {
      i !== o && (o = i, s());
    },
    dispose() {
      a(), r?.remove(), r = null, t?.documentElement.removeAttribute(Xr), t?.documentElement.removeAttribute(Tn), t = null, e.length = 0;
    }
  };
}
function Vp(e, t) {
  let r = Op(),
    n = {};
  for (let o of ka) {
    let a = Cp(e, o, t);
    if (!a) return Ra;
    n[o] = Hp(o, a, r);
  }
  return Ip(n);
}
function Sb(e) {
  try {
    return e.defaultView?.matchMedia?.(Os) ?? null;
  } catch {
    return null;
  }
}
var Up = "portal_hud",
  Kp = "portal_hud_action";
var jp = ["none", "neo", "smith", "shirt", "suit", "john-wick-suit"],
  Yp = ["none", "vertical", "horizontal", "x", "plus"];
var qp = ["none", "buck", "fangs"];
var Qp = "portal_menu";
var Xp = "portal_controls",
  Jp = ["swing", "cast", "spin", "hit", "celebrate"],
  Zp = ["social", "hud", "loading-v1", "menu"],
  oo = {
    position: 1024,
    speed: 40,
    forward: 40,
    vy: 60
  },
  wn = 7,
  _p = 10,
  $p = 1,
  ed = 20,
  Lw = wn + 1,
  td = 2e3,
  Aa = 120,
  rd = /^h[0-9a-f]{8}$/;
var Ca = "portal_scene",
  od = "portal_scene_command";
var Ha = {
  nodes: 12e3,
  bytes: 67108864,
  depth: 40,
  textures: 256,
  textureEdge: 2048,
  imageBytes: 134217728
};
var io = {
    partial: "partial-snapshot",
    images: "image-delta",
    pipeline: "pipelined-frames"
  },
  ad = 2,
  Pa = e => !!e && typeof e == "object" && !Array.isArray(e);
var ao = e => typeof e == "number" && Number.isFinite(e),
  kn = (e, t) => Array.isArray(e) && e.length === t && e.every(ao),
  nd = (e, t, r) => ao(e) && e >= t && e <= r;
function Bs(e) {
  if (!Pa(e) || !Pa(e.entry) || !Pa(e.pose)) return;
  let {
    entry: t,
    pose: r
  } = e;
  if (!(!kn(t.center, 3) || !ao(t.yaw) || !kn(r.feet, 3) || !kn(r.eye, 3) || !kn(r.velocity, 3) || !kn(r.quaternion, 4) || !ao(r.yaw) || !ao(r.fov) || r.fov <= 1 || r.fov >= 179) && !([...t.center, ...r.feet, ...r.eye].some(n => Math.abs(n) > 1e6) || r.velocity.some(n => Math.abs(n) > 100) || Math.abs(Math.hypot(...r.quaternion) - 1) > .01)) return {
    entry: {
      center: [...t.center],
      yaw: t.yaw
    },
    pose: {
      feet: [...r.feet],
      eye: [...r.eye],
      velocity: [...r.velocity],
      quaternion: [...r.quaternion],
      yaw: r.yaw,
      fov: r.fov,
      ...(Pa(r.rig) && kn(r.rig.pivot, 3) && r.rig.pivot.every(n => Math.abs(n) <= 1e6) && nd(r.rig.distance, .05, 1e3) && nd(r.rig.zoom, .05, 1e3) ? {
        rig: {
          pivot: [...r.rig.pivot],
          distance: r.rig.distance,
          zoom: r.rig.zoom
        }
      } : {})
    }
  };
}
var Ab = 1500,
  ld = 2e4;
function cd(e) {
  try {
    return new URLSearchParams(e).get("portalHost") === "late";
  } catch {
    return !1;
  }
}
var Pb = 6e3;
var Se = e => typeof e == "object" && e !== null && !Array.isArray(e),
  Ce = e => typeof e == "string";
function La(e) {
  if (!Se(e) || !Ce(e.gameId) || !Ce(e.name)) return null;
  let t = Se(e.creator) && Ce(e.creator.username) ? e.creator : null;
  return {
    gameId: e.gameId,
    slug: Ce(e.slug) ? e.slug : null,
    name: e.name,
    creator: t ? {
      username: t.username,
      pfp: Ce(t.pfp) ? t.pfp : null
    } : null,
    coverUrl: Ce(e.coverUrl) ? e.coverUrl : null
  };
}
var Ks = e => Array.isArray(e) ? e.map(La).filter(t => t !== null) : [];
function Cb(e) {
  if (!Se(e) || !Ce(e.name) || e.name.length > 40) return null;
  let {
    found: t,
    required: r
  } = e;
  return Number.isSafeInteger(t) && Number.isSafeInteger(r) && t >= 0 && r > 0 ? {
    found: t,
    required: r,
    name: e.name
  } : null;
}
var Hb = e => Array.isArray(e) ? e.flatMap(t => {
    if (!Se(t) || !Ce(t.target) || !Ce(t.gameId) || !Ce(t.name)) return [];
    let r = Cb(t.coins),
      n = t.bypass === "admin" || t.bypass === "collaborator" ? t.bypass : null;
    return [{
      target: t.target,
      gameId: t.gameId,
      name: t.name,
      coverUrl: Ce(t.coverUrl) ? t.coverUrl : null,
      opensAt: Ce(t.opensAt) && Number.isFinite(Date.parse(t.opensAt)) ? t.opensAt : null,
      ...(r ? {
        coins: r
      } : {}),
      ...(n ? {
        bypass: n
      } : {})
    }];
  }) : [],
  Lb = new Set(Object.keys({
    entry: !0,
    portal: !0,
    back: !0,
    follow: !0
  })),
  Tt = e => typeof e == "number" && Number.isFinite(e);
function Ib(e) {
  if (!Se(e) || !js(e.peer)) return null;
  let t = e.at,
    r = oo.position,
    n = Se(t) && Tt(t.x) && Tt(t.y) && Tt(t.z) && Tt(t.yaw) ? {
      x: Hr(t.x, r),
      y: Hr(t.y, r),
      z: Hr(t.z, r),
      yaw: gd(t.yaw)
    } : null;
  return {
    peer: e.peer,
    at: n
  };
}
function Ob(e) {
  if (!Se(e) || !Array.isArray(e.features)) return;
  let t = Zp,
    r = e.features.filter(n => Ce(n) && t.includes(n));
  return {
    features: [...new Set(r)]
  };
}
function Nb(e) {
  if (!(!Se(e) || typeof e.invertY != "boolean")) return {
    invertY: e.invertY
  };
}
var Fb = /^#[0-9a-f]{6}$/i,
  so = (e, t) => Ce(e) && Fb.test(e) ? e.toLowerCase() : t;
function id(e) {
  if (!Se(e)) return null;
  let t = so(e.top, ""),
    r = so(e.bottom, t);
  return t && r ? {
    bottom: r,
    top: t
  } : null;
}
function Ds(e, t, r, n) {
  return Ce(t) ? e.includes(t) ? t : n : r;
}
function Vb(e) {
  if (!Se(e)) return;
  let t = id(e.skin);
  if (t) return {
    skin: t,
    outline: id(e.outline) ?? {
      bottom: "#000000",
      top: "#000000"
    },
    clothing: Ds(jp, e.clothing, "none", "shirt"),
    clothingColor: so(e.clothingColor, t.top),
    eyeStyle: Ds(Yp, e.eyeStyle, "vertical", "vertical"),
    eyeColor: so(e.eyeColor, "#000000"),
    mouthStyle: e.mouthStyle === "none" ? "none" : "default",
    mouthColor: so(e.mouthColor, "#000000"),
    hair: Ce(e.hair) && e.hair !== "none" ? "bangs" : "none",
    teeth: Ds(qp, e.teeth, "none", "none"),
    hasMustache: e.hasMustache === !0
  };
}
function Wb(e) {
  if (!Se(e)) return null;
  let {
    mode: t
  } = e;
  if (t !== "active" && t !== "standby") return null;
  let r = La(e.self);
  if (!r) return null;
  let n = null;
  if (Se(e.arrival)) {
    let {
      id: i,
      kind: l,
      carry: p
    } = e.arrival;
    typeof i == "number" && Ce(l) && Lb.has(l) && (n = {
      id: i,
      kind: l,
      from: La(e.arrival.from),
      carry: Se(p) ? {
        ...(Bs(p.seamless) ? {
          seamless: Bs(p.seamless)
        } : {}),
        speed: zs(p.speed),
        vy: zs(p.vy),
        pitch: zs(p.pitch),
        heldKeys: Array.isArray(p.heldKeys) ? p.heldKeys.filter(Ce) : []
      } : null
    }, l === "follow" && (n.near = Ib(e.arrival.near)));
  }
  let o = Ob(e.host),
    a = Nb(e.prefs),
    s = Vb(e.look);
  return {
    mode: t,
    ...(e.renderer === "shared-v1" ? {
      renderer: "shared-v1"
    } : {}),
    self: r,
    arrival: n,
    previousWorld: La(e.previousWorld),
    trail: Ks(e.trail),
    previewFor: Ce(e.previewFor) ? e.previewFor : null,
    ...(o ? {
      host: o
    } : {}),
    ...(a ? {
      prefs: a
    } : {}),
    ...(s ? {
      look: s
    } : {})
  };
}
var zs = e => typeof e == "number" && Number.isFinite(e) ? e : 0,
  Gb = new Set(Object.keys({
    loading: !0,
    ready: !0,
    failed: !0,
    evicted: !0
  }));
function Bb(e) {
  if (!Se(e) || e.type !== "game_event" || !Se(e.event)) return null;
  let {
      type: t
    } = e.event,
    r = Se(e.event.data) ? e.event.data : null;
  if (!r) return null;
  switch (t) {
    case "portal_context":
      {
        let n = Wb(r);
        return n ? {
          type: t,
          data: n
        } : null;
      }
    case "portal_worlds":
      {
        if (!Ce(r.requestId)) return null;
        let n = Hb(r.locked);
        return {
          type: t,
          data: {
            requestId: r.requestId,
            worlds: Ks(r.worlds),
            ...(n.length > 0 ? {
              locked: n
            } : {})
          }
        };
      }
    case "portal_preload_state":
      return Ce(r.gameId) && Ce(r.state) && Gb.has(r.state) ? {
        type: t,
        data: {
          gameId: r.gameId,
          state: r.state
        }
      } : null;
    case "portal_spawn":
      {
        let n = Ks([r.world])[0];
        return n && Ce(r.requestId) && r.requestId.length <= 128 ? {
          type: t,
          data: {
            world: n,
            requestId: r.requestId
          }
        } : null;
      }
    case "portal_enter_failed":
      return Ce(r.gameId) ? {
        type: t,
        data: {
          gameId: r.gameId,
          reason: Ce(r.reason) ? r.reason : "failed"
        }
      } : null;
    default:
      return null;
  }
}
var Us = Math.PI * 2,
  Hr = (e, t) => Math.max(-t, Math.min(t, e));
function gd(e) {
  let t = e % Us,
    r = t < 0 ? t + Us : t;
  return r >= Us ? 0 : r;
}
var js = e => typeof e == "string" && rd.test(e),
  Db = e => typeof e == "string" && Jp.includes(e);
function zb(e) {
  if (!Se(e)) return null;
  let {
    x: t,
    y: r,
    z: n,
    yaw: o,
    speed: a,
    forward: s,
    vy: i,
    grounded: l,
    seated: p,
    riding: m
  } = e;
  if (!Tt(t) || !Tt(r) || !Tt(n) || !Tt(o) || !Tt(a) || !Tt(s) || !Tt(i) || typeof l != "boolean" || typeof p != "boolean" || typeof m != "boolean") return null;
  let E = oo;
  return {
    x: Hr(t, E.position),
    y: Hr(r, E.position),
    z: Hr(n, E.position),
    yaw: gd(o),
    speed: Math.max(0, Math.min(E.speed, a)),
    forward: Hr(s, E.forward),
    vy: Hr(i, E.vy),
    grounded: l,
    seated: p,
    riding: p && m
  };
}
function Ub(e) {
  if (!Se(e) || !js(e.peer)) return null;
  let {
    tint: t
  } = e;
  return !Ce(t) || !/^#[0-9a-fA-F]{6}$/.test(t) ? null : {
    peer: e.peer,
    tint: t.toLowerCase()
  };
}
function Kb(e) {
  if (!Se(e) || !js(e.peer)) return null;
  let t = zb(e);
  return t ? e.gesture === void 0 ? {
    ...t,
    peer: e.peer
  } : Db(e.gesture) ? {
    ...t,
    peer: e.peer,
    gesture: e.gesture
  } : null : null;
}
function sd(e, t) {
  if (!Array.isArray(e) || e.length > wn) return null;
  let r = [],
    n = new Set();
  for (let o of e) {
    let a = t(o);
    if (!a || n.has(a.peer)) return null;
    n.add(a.peer), r.push(a);
  }
  return r;
}
function jb(e) {
  if (!Se(e) || e.type !== "game_event" || !Se(e.event)) return null;
  let {
      type: t
    } = e.event,
    r = Se(e.event.data) ? e.event.data : null;
  if (!r) return null;
  if (t === "portal_peers") {
    let n = sd(r.peers, Ub);
    return n ? {
      type: t,
      data: {
        peers: n
      }
    } : null;
  }
  if (t === "portal_presence") {
    let {
      t: n
    } = r;
    if (!Tt(n) || n < 0) return null;
    let o = sd(r.states, Kb);
    return o ? {
      type: t,
      data: {
        t: n,
        states: o
      }
    } : null;
  }
  return t === "portal_input" && typeof r.suspended == "boolean" ? {
    type: t,
    data: {
      suspended: r.suspended
    }
  } : null;
}
function lo(e) {
  let t = e.target;
  return e.pointerType === "touch" && typeof t?.getAttribute == "function" && t.getAttribute("data-rpk-pointer") === "direct";
}
var Yb = ["Enter", "NumpadEnter", "KeyT"],
  vd = 250,
  Ys = 5,
  qb = (e, t) => e <= vd && t <= Ys,
  co = "MouseLeft",
  Ia = "MouseRight",
  bd = "Gamepad",
  yd = {
    forward: ["KeyW", "ArrowUp"],
    back: ["KeyS", "ArrowDown"],
    turnLeft: ["KeyA", "ArrowLeft"],
    turnRight: ["KeyD", "ArrowRight"],
    strafeLeft: ["KeyQ"],
    strafeRight: ["KeyE"]
  },
  Jt = 1,
  Lr = 2,
  uo = Jt | Lr,
  Qb = e => e === 0 ? Jt : e === 2 ? Lr : 0,
  Xb = e => {
    let t = e;
    return typeof t?.closest == "function" && t.closest("button") !== null;
  },
  Ed = e => {
    let t = e;
    return !t || typeof t.tagName != "string" ? !1 : t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT" || t.isContentEditable === !0;
  };
function xd(e, t = window) {
  let r = new Set(),
    n = new Set(),
    o = new Set(),
    a = new Set(),
    s = !1,
    i = !1,
    l = !1,
    p = 0,
    m = 0,
    E = 0,
    y = null,
    b = null,
    R = 0,
    v = 0,
    T = 0,
    M = 0,
    H = !1,
    h = new Set(),
    P = new Set(),
    A = new Set(),
    w = new Set(),
    C = [],
    k = [],
    W = null,
    L = null,
    K = Number.NaN,
    D = Number.NaN,
    N = !1,
    g = new Set(),
    S = new Set(),
    I = "keyboard",
    F = null,
    z = !1,
    U = V => {
      let ae = !1;
      for (let ve of [...a]) ve(V) === !0 && (ae = !0);
      return ae;
    },
    Q = V => r.has(V) || n.has(V),
    $ = V => g.has(V) && !S.has(V),
    ie = V => V.some(ae => Q(ae)),
    _ = () => s && !i,
    J = () => R | v,
    Z = V => V === Jt ? co : Ia,
    X = (V, ae) => {
      if (_()) for (let ve of [Jt, Lr]) (ae & ve) !== 0 && (V & ve) === 0 && h.add(Z(ve)), (ae & ve) === 0 && (V & ve) !== 0 && P.add(Z(ve));
    },
    B = (V, ae) => {
      let ve = e.getBoundingClientRect?.();
      return {
        x: V - (ve?.left ?? 0),
        y: ae - (ve?.top ?? 0)
      };
    },
    d = V => {
      b !== null && V.pointerId !== b || (K = V.clientX, D = V.clientY, N = V.target === e);
    },
    c = V => {
      if (!s || Ed(V.target)) return;
      let {
        code: ae
      } = V;
      if (ae === "Tab" || ae === "KeyP") {
        ae === "Tab" && V.preventDefault(), V.repeat || U("menu");
        return;
      }
      if (ae === "KeyH" || ae === "Slash") {
        V.repeat || U("help");
        return;
      }
      if (ae === "Escape") {
        if (V.repeat || V.defaultPrevented) return;
        if (U("close")) {
          V.preventDefault();
          return;
        }
        setTimeout(() => {
          s && !V.defaultPrevented && U("menu");
        }, 0);
        return;
      }
      if ((ae === "Space" || ae.startsWith("Arrow")) && V.preventDefault(), !i) {
        if (!V.repeat && Yb.includes(ae) && !Xb(V.target) && U("chat"), o.has(ae)) {
          if (V.repeat) return;
          o.delete(ae);
        }
        if (n.delete(ae) && V.repeat) {
          r.add(ae);
          return;
        }
        ae === "Space" && !V.repeat && !r.has(ae) && (l = !0), !V.repeat && !r.has(ae) && h.add(ae), r.add(ae);
      }
    },
    u = V => {
      (r.delete(V.code) || n.delete(V.code)) && _() && P.add(V.code), n.delete(V.code), o.delete(V.code);
    },
    x = (V, ae, ve) => {
      H = ve || y === V && H, y = V, R = ae;
      try {
        e.setPointerCapture?.(V);
      } catch {}
    },
    O = () => {
      let V = y;
      y = null, b = null, R = 0, W = null, L = null, H = !1, V !== null && e.hasPointerCapture?.(V) && e.releasePointerCapture(V);
    },
    j = () => {
      for (let V of r) o.add(V);
      for (let V of g) S.add(V);
      r.clear(), n.clear(), v = 0, l = !1, O();
    },
    Y = V => {
      V.pointerId !== b && (p += V.clientX - T, m += V.clientY - M), T = V.clientX, M = V.clientY;
    },
    re = V => {
      if (v === 0) return;
      let ae = V.buttons & uo;
      v &= ae, !(v === 0 || y !== null || !_()) && (v = 0, x(V.pointerId, ae, !0), p += V.movementX || 0, m += V.movementY || 0, T = V.clientX, M = V.clientY);
    },
    se = V => {
      if (!_() || y !== null && y !== V.pointerId) return;
      let ae = Qb(V.button);
      if (ae === 0) return;
      b = lo(V) ? V.pointerId : null;
      let ve = y === null ? 0 : R,
        ze = V.buttons & uo | ae;
      x(V.pointerId, ze, !1), X(ve, ze);
      let je = B(V.clientX, V.clientY);
      W = ve === 0 && ze === ae ? {
        button: ae === Jt ? 0 : 2,
        pointerId: V.pointerId,
        x: je.x,
        y: je.y,
        at: performance.now(),
        moved: 0
      } : null, L = {
        x: V.clientX,
        y: V.clientY
      }, T = V.clientX, M = V.clientY, e.focus?.({
        preventScroll: !0
      });
    },
    ee = V => {
      d(V), re(V);
    },
    me = V => {
      let ae = R,
        ve = V.buttons & uo;
      if (ve === ae) return;
      X(ae, ve), R = ve;
      let ze = W;
      if (!ze) return;
      let je = ze.button === 0 ? Jt : Lr;
      (ve & ~je) !== 0 ? W = null : (ve & je) === 0 && (W = null, _() && qb(performance.now() - ze.at, ze.moved) && C.push({
        button: ze.button,
        x: ze.x,
        y: ze.y
      }));
    },
    de = V => {
      if (d(V), y !== null && V.pointerId === y) {
        if (Y(V), L) {
          let ae = Math.hypot(V.clientX - L.x, V.clientY - L.y);
          W && (W.moved = Math.max(W.moved, ae)), ae > Ys && (L = null, H = !0);
        }
        me(V), R === 0 && O();
        return;
      }
      re(V);
    },
    ne = V => {
      let ae = V.type === "lostpointercapture";
      ae || d(V), re(V), !(y === null || V.pointerId !== y) && (ae && (W = null), me(V), R === 0 && O());
    },
    ce = V => {
      V.pointerId === y && O();
    },
    Ie = V => {
      if (!_()) return;
      V.preventDefault();
      let ae = V.deltaMode === 1 ? 16 : V.deltaMode === 2 ? 400 : 1;
      E += V.deltaY * ae;
    },
    Me = V => {
      Ed(V.target) || V.preventDefault();
    },
    oe = () => j();
  return t.addEventListener("keydown", c), t.addEventListener("keyup", u), t.addEventListener("blur", oe), t.addEventListener("pointerdown", ee, !0), t.addEventListener("pointermove", de), t.addEventListener("pointerup", ne), t.addEventListener("pointercancel", ce), t.addEventListener("contextmenu", Me, !0), e.addEventListener("pointerdown", se), e.addEventListener("lostpointercapture", ne), e.addEventListener("wheel", Ie, {
    passive: !1
  }), e.tabIndex < 0 && (e.tabIndex = 0), e.style.outline = "none", {
    moveKeys() {
      let V = {};
      for (let ae of Object.keys(yd)) V[ae] = _() && ie(yd[ae]);
      return V;
    },
    mouse() {
      let V = _() && b === null ? J() : 0;
      return {
        left: (V & Jt) !== 0,
        right: (V & Lr) !== 0
      };
    },
    get sprint() {
      return _() && (Q("ShiftLeft") || Q("ShiftRight") || $("ShiftLeft"));
    },
    get jumpHeld() {
      return _() && (Q("Space") || $("Space"));
    },
    consumeJump() {
      let V = l;
      return l = !1, V && _();
    },
    consumeLook() {
      let V = {
        dx: p,
        dy: m,
        zoom: E
      };
      return p = 0, m = 0, E = 0, _() ? V : {
        dx: 0,
        dy: 0,
        zoom: 0
      };
    },
    heldKeys() {
      let V = [],
        ae = J();
      ae & Jt && V.push(co), ae & Lr && V.push(Ia);
      for (let ve of r) V.push(ve);
      for (let ve of n) r.has(ve) || V.push(ve);
      return I === "gamepad" && V.push(bd), V.slice(0, 16);
    },
    injectHeld(V) {
      for (let ae of V) if (!(typeof ae != "string" || ae.length === 0 || ae.length > 32)) {
        if (ae === bd) {
          z = !0;
          continue;
        }
        if (ae === co || ae === Ia) {
          let ve = ae === co ? Jt : Lr;
          (R & ve) === 0 && (v |= ve);
          continue;
        }
        o.delete(ae), r.has(ae) || n.add(ae);
      }
    },
    clearHeld: j,
    beginFrame() {
      let V = _();
      A = V ? h : new Set(), w = V ? P : new Set(), k = V ? C : [], h = new Set(), P = new Set(), C = [];
    },
    held(V) {
      return _() ? V === co ? (J() & Jt) !== 0 || $(V) : V === Ia ? (J() & Lr) !== 0 || $(V) : Q(V) || $(V) : !1;
    },
    pressed: V => _() && A.has(V),
    released: V => _() && w.has(V),
    consumePress(V) {
      A.delete(V);
    },
    get clicks() {
      return _() ? k : [];
    },
    pointer() {
      if (F && b === null) return {
        x: F.x,
        y: F.y
      };
      if (Number.isNaN(K)) {
        let V = e.getBoundingClientRect?.();
        return {
          x: (V?.width ?? 0) / 2,
          y: (V?.height ?? 0) / 2
        };
      }
      return B(K, D);
    },
    get pointerOnCanvas() {
      return F !== null || N;
    },
    get steering() {
      return !_() || b !== null ? !1 : v !== 0 ? !0 : y !== null && (H || (R & uo) === uo);
    },
    setEnabled(V) {
      s !== V && (s = V, V || j());
    },
    setBlocked(V) {
      i !== V && (i = V, V && j());
    },
    onCommand(V) {
      return a.add(V), () => a.delete(V);
    },
    setVirtual(V, ae, ve = !1) {
      if (I = ae, ve) {
        g = new Set(V), S.clear();
        return;
      }
      let ze = _();
      for (let je of V) g.has(je) || !ze || Q(je) || (h.add(je), je === "Space" && (l = !0));
      for (let je of g) V.has(je) || !S.delete(je) && ze && !Q(je) && P.add(je);
      g = new Set(V);
    },
    setPointer(V) {
      F = V ? {
        x: V.x,
        y: V.y
      } : null;
    },
    pushClick(V) {
      _() && C.push({
        button: V.button,
        x: V.x,
        y: V.y
      });
    },
    takeCarriedPad() {
      let V = z;
      return z = !1, V;
    },
    dispose() {
      j(), a.clear(), t.removeEventListener("keydown", c), t.removeEventListener("keyup", u), t.removeEventListener("blur", oe), t.removeEventListener("pointerdown", ee, !0), t.removeEventListener("pointermove", de), t.removeEventListener("pointerup", ne), t.removeEventListener("pointercancel", ce), t.removeEventListener("contextmenu", Me, !0), e.removeEventListener("pointerdown", se), e.removeEventListener("lostpointercapture", ne), e.removeEventListener("wheel", Ie);
    }
  };
}
import * as po from "./001-three-a973dc20bf0957e55145ef9e6b9c97d50275b224b1d81a57603249dd6750ab96.js";
var Ir = "KeyF",
  fo = 4;
function kd(e, t) {
  let r = null;
  for (let o of t) (!r || o.distance < r.distance) && (r = o);
  let n = e && e.distance < (e.reach ?? fo) ? e : null;
  return n && (!r || n.distance < r.distance) ? {
    kind: "portal",
    candidate: n
  } : r ? {
    kind: "interact",
    candidate: r
  } : null;
}
var Jb = e => `[F] ${e}`,
  Td = new po.Line3(),
  wd = new po.Vector3(),
  Oa = new po.Vector3();
function Zb(e, t, r) {
  return Array.isArray(r) ? Oa.set(r[0], r[1], r[2]) : Oa.copy(r), Td.set(e, t), Td.closestPointToPoint(Oa, !0, wd), wd.distanceTo(Oa);
}
function Rd() {
  let e = [];
  return {
    add(t) {
      let r = {
        options: t,
        disposed: !1
      };
      return e.push(r), {
        dispose() {
          if (r.disposed) return;
          r.disposed = !0;
          let n = e.indexOf(r);
          n >= 0 && e.splice(n, 1);
        }
      };
    },
    all: () => e,
    inReach(t, r) {
      let n = [];
      for (let o of e) {
        let {
          options: a
        } = o;
        if (a.enabled && !a.enabled()) continue;
        let s = Zb(t, r, a.position);
        if (!(s <= a.radius)) continue;
        let i = typeof a.label == "function" ? a.label() : a.label;
        i?.trim() && n.push({
          distance: s,
          text: Jb(i),
          target: o
        });
      }
      return n;
    }
  };
}
function Rn(e, t = Date.now()) {
  let r = e === null ? Number.NaN : Date.parse(e);
  if (!Number.isFinite(r) || r <= t) return "Locked";
  let n = new Date(r);
  return r - t < 1440 * 60 * 1e3 ? `Opens ${n.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit"
  })}` : `Opens ${n.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric"
  })}`;
}
var Sd = 5e3,
  Md = (e, t) => t === 1 || /s$/i.test(e) ? e : `${e}s`;
function Ad(e, t) {
  return e !== null && t !== null && e.distance < fo;
}
var _b = 2;
function Pd(e, t) {
  return e !== null && !!t?.bypass && e.distance < _b;
}
function Cd(e) {
  return `${e.found} of ${e.required} ${Md(e.name, e.required)}`;
}
function Hd(e, t = Date.now()) {
  let r = Rn(e.opensAt, t);
  if (!e.coins) return r;
  let {
    found: n,
    required: o,
    name: a
  } = e.coins;
  return `${r} \xB7 ${n}/${o} ${Md(a, o)}`;
}
function Ld(e, t = Date.now()) {
  let r = Rn(e.opensAt, t);
  return r === "Locked" ? `${e.name} is locked` : `${e.name} ${r.replace(/^Opens/, "opens")}`;
}
function Id(e, t = Date.now()) {
  let r = Ld(e, t);
  return e.coins ? `${r}. You have ${Cd(e.coins)}` : r;
}
var $b = e => e === "admin" ? "Admin" : "Collaborator";
function Od(e, t = Date.now()) {
  let r = [Ld(e, t)];
  return e.coins && r.push(Cd(e.coins)), e.bypass && r.push(`[F] Unlock (${$b(e.bypass)})`), r.join(" \xB7 ");
}
function Nd(e) {
  return `${e} unlocked for you. Walk in to enter`;
}
function Fd(e) {
  return `${e} is open`;
}
var st = {
    south: 0,
    east: 1,
    west: 2,
    north: 3,
    lb: 4,
    rb: 5,
    lt: 6,
    rt: 7,
    select: 8,
    start: 9,
    l3: 10,
    r3: 11,
    up: 12,
    down: 13,
    left: 14,
    right: 15
  },
  ey = Object.keys(st),
  ty = .15,
  ry = .12,
  ny = .06,
  oy = .9,
  ay = 1.6,
  Na = .35,
  qs = .5,
  iy = .3,
  sy = .5,
  ly = .35,
  cy = 1e3,
  uy = 12,
  py = 300,
  dy = 400,
  fy = 900,
  Gd = 2500;
function Qs(e) {
  let t = String(e ?? "").toLowerCase();
  return /vendor:\s*045e|\b045e-|xbox|xinput|x-box|microsoft/.test(t) ? "xbox" : /vendor:\s*054c|\b054c-|playstation|dualshock|dualsense|sony|wireless controller/.test(t) ? "playstation" : /vendor:\s*057e|\b057e-|nintendo|switch|pro controller|joy-con/.test(t) ? "nintendo" : "generic";
}
var Bt = e => typeof e == "number" && Number.isFinite(e) ? e : 0;
function Bd(e, t, r, n = 1) {
  let o = Bt(e),
    a = Bt(t),
    s = Math.hypot(o, a);
  if (!(s > r)) return {
    x: 0,
    y: 0,
    magnitude: 0
  };
  let l = Math.min(1, (s - r) / Math.max(1e-6, 1 - r)) ** n;
  return {
    x: o / s * l,
    y: a / s * l,
    magnitude: l
  };
}
function my(e, t) {
  let r = Bd(e, t, ty);
  if (r.magnitude < oy || r.magnitude === 0) return r;
  let n = 1 / r.magnitude;
  return {
    x: r.x * n,
    y: r.y * n,
    magnitude: 1
  };
}
function Vd(e, t = ny) {
  let r = Math.min(1, Math.max(0, Bt(e)));
  return r <= t ? 0 : (r - t) / (1 - t);
}
function Wd(e, t) {
  let r = l => e.buttons[l],
    n = Vd(r(st.lt)?.value ?? 0),
    o = Vd(r(st.rt)?.value ?? 0),
    a = [];
  for (let l = 0; l < ey.length; l++) if (l === st.lt || l === st.rt) {
    let p = l === st.lt ? n : o;
    a.push(p >= (t?.[l] ? iy : qs));
  } else a.push(r(l)?.pressed === !0);
  let s = Bt(e.axes[0]),
    i = Bt(e.axes[1]);
  return {
    family: Qs(e.id),
    held: a,
    move: my(s, i),
    look: Bd(Bt(e.axes[2]), Bt(e.axes[3]), ry, ay),
    lt: n,
    rt: o,
    rawX: s,
    rawY: i
  };
}
function hy(e) {
  return e.held.some(Boolean) ? !0 : Math.hypot(e.rawX, e.rawY) >= Na || e.look.magnitude >= Na;
}
function Dd(e, t, r) {
  let n = new Set(),
    o = e.held;
  o[st.south] && n.add("Space"), o[st.east] && n.add("KeyF"), o[st.west] && n.add("ShiftLeft"), o[st.left] && n.add("Digit1"), o[st.up] && n.add("Digit2"), o[st.right] && n.add("Digit3"), o[st.down] && n.add("Digit4"), o[st.rb] && n.add("Digit5"), !r && o[st.rt] && n.add("MouseLeft");
  let {
      x: a,
      y: s
    } = e.move,
    i = (l, p) => {
      p >= (t.has(l) ? ly : sy) && n.add(l);
    };
  return i("KeyW", -s), i("KeyS", s), i("KeyA", -a), i("KeyD", a), n;
}
function gy(e) {
  switch (e.trim().toLowerCase()) {
    case "f":
      return "east";
    case "space":
      return "south";
    case "esc":
    case "escape":
      return "east";
    case "tab":
    case "p":
      return "start";
    case "h":
    case "?":
      return "select";
    case "1":
      return "left";
    case "2":
      return "up";
    case "3":
      return "right";
    case "4":
      return "down";
    case "5":
      return "rb";
    case "shift":
      return "west";
    case "left click":
    case "click":
      return "rt";
    case "right click":
      return "lt";
    default:
      return null;
  }
}
var by = /^(?:[wasdqe]|arrows?|arrow ?(?:up|down|left|right)|up|down|left|right|[↑↓←→])$/;
function Sn(e) {
  let t = gy(e);
  if (t) return t;
  let r = e.trim().toLowerCase();
  return by.test(r) ? "ls" : r === "left drag" ? "rs" : null;
}
function zd(e, t, r, n) {
  let o = -1,
    a = r;
  for (let l = 0; l < t.length; l++) {
    let p = t[l],
      m = Math.hypot(p.x - e.x, p.y - e.y);
    m <= a && (o < 0 || m < a) && (a = m, o = l);
  }
  if (o < 0) return {
    x: e.x,
    y: e.y,
    index: o
  };
  let s = t[o],
    i = Math.min(1, Math.max(0, n));
  return {
    x: e.x + (s.x - e.x) * i,
    y: e.y + (s.y - e.y) * i,
    index: o
  };
}
function Ud(e, t) {
  return t.map((r, n) => ({
    index: n,
    distance: Math.hypot(r.x - e.x, r.y - e.y)
  })).sort((r, n) => r.distance - n.distance).map(r => r.index);
}
function yy(e, t, r, n) {
  let o = Math.min(1, Math.max(0, Bt(e))),
    a = Math.min(dy, Math.max(0, Bt(t)));
  if (o <= 0 || a <= 0) return null;
  let s = 0;
  for (let [i, l] of n) r - i < Gd && (s += l);
  return a = Math.min(a, fy - s), a >= 16 ? {
    strength: o,
    ms: a
  } : null;
}
function Kd(e = {}) {
  let t = e.getGamepads ?? null,
    r = e.now ?? (() => typeof performance > "u" ? Date.now() : performance.now()),
    n = "keyboard",
    o = "generic",
    a = -1,
    s = null,
    i = !1,
    l = Number.NEGATIVE_INFINITY,
    p = new Map(),
    m = 0,
    E = 0,
    y = null,
    b = [],
    R = new Set(),
    v = new Set(),
    T = w => {
      if (w !== n) {
        n = w;
        for (let C of [...R]) C(n, o);
      }
    },
    M = () => {
      if (!t) return [];
      let w;
      try {
        w = t() ?? [];
      } catch {
        return [];
      }
      let C = [];
      for (let k of Array.from(w)) k?.connected && k.mapping === "standard" && C.push(k);
      return C;
    },
    H = w => {
      lo(w) || T("keyboard");
    },
    h = w => {
      if (lo(w)) return;
      let C = w,
        k = r();
      k - E > py && (m = 0, E = k);
      let W = Bt(C.clientX),
        L = Bt(C.clientY);
      y && (m += Math.hypot(W - y.x, L - y.y)), y = {
        x: W,
        y: L
      }, m >= uy && T("keyboard");
    },
    P = e.target ?? null;
  P?.addEventListener("keydown", H, !0), P?.addEventListener("pointerdown", H, !0), P?.addEventListener("wheel", H, {
    capture: !0,
    passive: !0
  }), P?.addEventListener("pointermove", h, !0);
  let A = () => M().find(C => C.index === a) ?? null;
  return {
    get device() {
      return n;
    },
    get family() {
      return o;
    },
    get connected() {
      return p.size > 0;
    },
    poll(w) {
      let C = M(),
        k = new Map(C.map(U => [U.index, U.id]));
      for (let [U, Q] of k) if (p.get(U) !== Q) for (let $ of [...v]) $(!0, Qs(Q));
      for (let [U, Q] of p) if (!k.has(U)) for (let $ of [...v]) $(!1, Qs(Q));
      p = k;
      let W = w - l > cy;
      l = w;
      let L = C.find(U => U.index === a) ?? null,
        K = C.find(U => U !== L && hy(Wd(U)));
      if (K ? L = K : L || (L = C[0] ?? null), !L) return a = -1, s = null, T("keyboard"), null;
      let D = L.index !== a;
      a = L.index;
      let N = Wd(L, D ? void 0 : s ?? void 0),
        g = W || D || !s ? N.held : s;
      if (s = N.held, N.family !== o && (o = N.family, n === "gamepad")) for (let U of [...R]) U(n, o);
      let S = N.held.some((U, Q) => U && !g[Q]),
        I = Ey(N),
        F = I && !D && !i;
      i = I, (S || F || K && !W) && T("gamepad");
      let z = U => st[U];
      return {
        sample: N,
        fresh: W || D,
        held: U => N.held[z(U)] === !0,
        pressed: U => N.held[z(U)] === !0 && g[z(U)] !== !0,
        released: U => N.held[z(U)] !== !0 && g[z(U)] === !0
      };
    },
    setDevice: T,
    onDevice(w) {
      return R.add(w), () => R.delete(w);
    },
    onConnection(w) {
      return v.add(w), () => v.delete(w);
    },
    rumble(w, C, k = r()) {
      if (n !== "gamepad") return !1;
      let L = A()?.vibrationActuator;
      if (!L || typeof L.playEffect != "function") return !1;
      for (; b.length > 0 && k - b[0][0] >= Gd;) b.shift();
      let K = yy(w, C, k, b);
      if (!K) return !1;
      b.push([k, K.ms]);
      try {
        let D = L.playEffect("dual-rumble", {
          startDelay: 0,
          duration: K.ms,
          weakMagnitude: K.strength,
          strongMagnitude: K.strength * .6
        });
        D && typeof D.catch == "function" && D.catch(() => {});
      } catch {
        return !1;
      }
      return !0;
    },
    dispose() {
      R.clear(), v.clear(), P?.removeEventListener("keydown", H, !0), P?.removeEventListener("pointerdown", H, !0), P?.removeEventListener("wheel", H, {
        capture: !0
      }), P?.removeEventListener("pointermove", h, !0);
    }
  };
}
function Ey(e) {
  return Math.hypot(e.rawX, e.rawY) >= Na || e.look.magnitude >= Na || e.lt >= qs || e.rt >= qs;
}
var Zr = "#0b0f16",
  _r = "rgba(255,255,255,0.86)",
  Mt = "#f6f7f9",
  Fa = "rgba(255,255,255,0.34)",
  vy = {
    A: [7, "M0 10L3.5 0L7 10M1.3 6.6H5.7"],
    B: [6, "M0 5H3.4a2.5 2.5 0 0 1 0 5H0V0H3a2.5 2.5 0 0 1 0 5"],
    X: [7, "M0 0L7 10M7 0L0 10"],
    Y: [7, "M0 0L3.5 5L7 0M3.5 5V10"],
    L: [5.2, "M0 0V10H5.2"],
    R: [6, "M0 10V0H3.3a2.5 2.5 0 0 1 0 5H0M3.2 5L6 10"],
    T: [6, "M0 0H6M3 0V10"],
    Z: [6, "M0 0H6L0 10H6"],
    S: [6, "M5.8 1.3C5.1 0.4 4.1 0 3 0C1.4 0 0.3 0.9 0.3 2.5C0.3 5.8 6 4.3 6 7.5C6 9.1 4.8 10 3 10C1.6 10 0.5 9.4 0 8.5"],
    1: [3.4, "M0 2.1L3 0V10"],
    2: [6, "M0.2 2.6C0.6 1 1.7 0 3.1 0C4.8 0 6 1.1 6 2.8C6 4.3 5 5.3 3.7 6.4L0 10H6"],
    "+": [7, "M3.5 1.5V8.5M0 5H7"],
    "-": [7, "M0 5H7"]
  };
function Va(e, t, r, n) {
  let o = n / 10,
    a = 1.6,
    s = [...e].map(E => vy[E]).filter(Boolean),
    i = s.reduce((E, [y]) => E + y, 0) + a * Math.max(0, s.length - 1),
    l = t - i * o / 2,
    p = r - n / 2,
    m = [];
  for (let [E, y] of s) m.push(`<path transform="translate(${l.toFixed(2)} ${p.toFixed(2)}) scale(${o.toFixed(3)})" d="${y}"/>`), l += (E + a) * o;
  return m.join("");
}
var xy = (e, t) => `<svg class="rpk-glyph-svg" viewBox="0 0 24 24" width="24" height="24" role="img" aria-label="${t}" focusable="false">${e}</svg>`,
  Zt = (e, t, r) => `<g fill="none" stroke="${e}" stroke-width="${t}" stroke-linecap="round" stroke-linejoin="round">${r}</g>`,
  An = (e = _r) => `<circle cx="12" cy="12" r="10.4" fill="${Zr}" stroke="${e}" stroke-width="1.2"/>`,
  jd = {
    xbox: {
      south: "#7ed957",
      east: "#ff5c5c",
      west: "#4da3ff",
      north: "#ffd23f"
    },
    playstation: {
      south: "#8fb4ff",
      east: "#ff6b7a",
      west: "#ff8fd8",
      north: "#43e0b0"
    }
  },
  Qd = {
    south: "A",
    east: "B",
    west: "X",
    north: "Y"
  },
  Xd = {
    south: "B",
    east: "A",
    west: "Y",
    north: "X"
  };
function Ty(e, t) {
  if (e === "playstation") {
    let o = jd.playstation[t],
      a = {
        south: "M8.2 8.2L15.8 15.8M15.8 8.2L8.2 15.8",
        east: "M12 7.6a4.4 4.4 0 1 1 0 8.8a4.4 4.4 0 1 1 0-8.8Z",
        west: "M8 8H16V16H8Z",
        north: "M12 7.1L16.9 15.6H7.1Z"
      }[t];
    return An() + Zt(o, 2, `<path d="${a}"/>`);
  }
  if (e === "generic") {
    let o = {
        north: [12, 6.6],
        east: [17.4, 12],
        south: [12, 17.4],
        west: [6.6, 12]
      },
      a = Object.keys(o).map(s => {
        let [i, l] = o[s];
        return s === t ? `<circle cx="${i}" cy="${l}" r="2.6" fill="${Mt}"/>` : `<circle cx="${i}" cy="${l}" r="1.9" fill="none" stroke="${Fa}" stroke-width="1.1"/>`;
      }).join("");
    return An() + a;
  }
  let r = e === "nintendo" ? Xd[t] : Qd[t],
    n = e === "xbox" ? jd.xbox[t] : Mt;
  return An() + Zt(n, 2, Va(r, 12, 12, 9));
}
var Jd = {
  xbox: {
    lb: "LB",
    rb: "RB",
    lt: "LT",
    rt: "RT"
  },
  playstation: {
    lb: "L1",
    rb: "R1",
    lt: "L2",
    rt: "R2"
  },
  nintendo: {
    lb: "L",
    rb: "R",
    lt: "ZL",
    rt: "ZR"
  },
  generic: {
    lb: "LB",
    rb: "RB",
    lt: "LT",
    rt: "RT"
  }
};
function wy(e, t) {
  let r = Jd[e][t],
    n = t === "lt" || t === "rt",
    o = n ? `<path d="M3.6 19.4V11.2C3.6 7.3 7.2 4.4 12 4.4C16.8 4.4 20.4 7.3 20.4 11.2V19.4Z" fill="${Zr}" stroke="${_r}" stroke-width="1.2" stroke-linejoin="round"/>` : `<rect x="2.2" y="6.4" width="19.6" height="11.2" rx="4" fill="${Zr}" stroke="${_r}" stroke-width="1.2"/>`,
    a = r.length > 1 ? 6.6 : 7.6;
  return o + Zt(Mt, 1.7, Va(r, 12, n ? 13.4 : 12, a));
}
function Yd(e, t) {
  let r = e === "l" ? "L" : "R",
    n = t ? "" : Zt(Fa, 1.2, '<path d="M12 1.9L10.6 3.3M12 1.9L13.4 3.3M12 22.1L10.6 20.7M12 22.1L13.4 20.7M1.9 12L3.3 10.6M1.9 12L3.3 13.4M22.1 12L20.7 10.6M22.1 12L20.7 13.4"/>'),
    o = t ? `<circle cx="12" cy="12" r="10.4" fill="${Zr}" stroke="${Mt}" stroke-width="1.6"/><circle cx="12" cy="12" r="7" fill="none" stroke="${_r}" stroke-width="1.1"/>` : `<circle cx="12" cy="12" r="8.4" fill="${Zr}" stroke="${_r}" stroke-width="1.2"/><circle cx="12" cy="12" r="5.8" fill="none" stroke="${Fa}" stroke-width="1"/>`,
    a = t ? Zt(Mt, 1.3, '<path d="M9.8 16.4L12 18.2L14.2 16.4"/>') : "";
  return n + o + Zt(Mt, 1.7, Va(r, 12, t ? 10.8 : 12, 6.4)) + a;
}
function qd(e) {
  let t = {
      up: "M9 2.4H15V9H9Z",
      down: "M9 15H15V21.6H9Z",
      left: "M2.4 9H9V15H2.4Z",
      right: "M15 9H21.6V15H15Z"
    },
    r = "M9 2.4H15V9H21.6V15H15V21.6H9V15H2.4V9H9Z",
    n = e ? Fa : _r,
    o = e ? `<path d="${t[e]}" fill="${Mt}" stroke="${Mt}" stroke-width="1.2" stroke-linejoin="round"/>` : "";
  return `<path d="${r}" fill="${Zr}" stroke="${n}" stroke-width="1.2" stroke-linejoin="round"/>${o}`;
}
function ky(e, t) {
  return e === "nintendo" ? An() + Zt(Mt, 1.8, Va(t === "select" ? "-" : "+", 12, 12, 9)) : e === "playstation" ? `<rect x="7.4" y="3.4" width="9.2" height="17.2" rx="4.6" fill="${Zr}" stroke="${_r}" stroke-width="1.2"/>` + Zt(Mt, 1.3, t === "start" ? '<path d="M10 9.4H14M10 12H14M10 14.6H14"/>' : '<path d="M12 8.6V15.4M9.8 10.6V13.4M14.2 10.6V13.4"/>') : t === "start" ? An() + Zt(Mt, 1.6, '<path d="M7.8 8.8H16.2M7.8 12H16.2M7.8 15.2H16.2"/>') : An() + Zt(Mt, 1.3, '<rect x="6.6" y="7.4" width="7" height="6.2" rx="1.2"/><path d="M10.4 16.6H16.2a1.2 1.2 0 0 0 1.2-1.2V11.6"/>');
}
var Ry = {
    xbox: Qd,
    playstation: {
      south: "Cross",
      east: "Circle",
      west: "Square",
      north: "Triangle"
    },
    nintendo: Xd,
    generic: {
      south: "Bottom button",
      east: "Right button",
      west: "Left button",
      north: "Top button"
    }
  },
  Sy = {
    xbox: {
      select: "View",
      start: "Menu"
    },
    playstation: {
      select: "Create",
      start: "Options"
    },
    nintendo: {
      select: "Minus",
      start: "Plus"
    },
    generic: {
      select: "Select",
      start: "Start"
    }
  };
function ir(e, t) {
  switch (t) {
    case "south":
    case "east":
    case "west":
    case "north":
      return Ry[e][t];
    case "lb":
    case "rb":
    case "lt":
    case "rt":
      return Jd[e][t];
    case "select":
    case "start":
      return Sy[e][t];
    case "l3":
      return e === "playstation" ? "L3" : "Left stick press";
    case "r3":
      return e === "playstation" ? "R3" : "Right stick press";
    case "ls":
      return "Left stick";
    case "rs":
      return "Right stick";
    case "dpad":
      return "D-pad";
    default:
      return `D-pad ${t}`;
  }
}
function Xs(e, t) {
  let r;
  switch (t) {
    case "south":
    case "east":
    case "west":
    case "north":
      r = Ty(e, t);
      break;
    case "lb":
    case "rb":
    case "lt":
    case "rt":
      r = wy(e, t);
      break;
    case "select":
    case "start":
      r = ky(e, t);
      break;
    case "l3":
    case "r3":
      r = Yd(t === "l3" ? "l" : "r", !0);
      break;
    case "ls":
    case "rs":
      r = Yd(t === "ls" ? "l" : "r", !1);
      break;
    case "dpad":
      r = qd(null);
      break;
    default:
      r = qd(t);
  }
  return xy(r, ir(e, t));
}
var Mn = {
  gamepad: !1,
  family: "generic"
};
function Zd(e) {
  let t = e.dataset.rpkKey ?? "",
    r = Mn.gamepad ? Sn(t) : null,
    n = r ? `${Mn.family}:${r}` : "";
  (e.dataset.rpkGlyph ?? "") !== n && (r ? (e.dataset.rpkGlyph = n, e.innerHTML = Xs(Mn.family, r), e.setAttribute("aria-label", ir(Mn.family, r))) : (delete e.dataset.rpkGlyph, e.textContent = t, e.removeAttribute("aria-label")));
}
function Wa(e, t) {
  return e.dataset.rpkKey = t, e.textContent || (e.textContent = t), Zd(e), e;
}
function _d(e, t, r) {
  Mn.gamepad = t, Mn.family = r;
  for (let n of e.querySelectorAll("[data-rpk-key]")) Zd(n);
}
var rf = e => e === "attack" ? "attack" : e === "interact" ? "interact" : "dot";
function My(e) {
  return e.map(t => {
    let r = typeof t.fill == "string" ? t.fill : t.fill ? t.fill[1] : "none",
      n = t.stroke ? ` stroke="${t.stroke}" stroke-width="${t.width ?? 1}" stroke-linecap="round" stroke-linejoin="round"` : "";
    return `<path d="${t.d}" fill="${r}"${n}/>`;
  }).join("");
}
var $d = "#07090d";
function ef(e, t) {
  let r = qr(t),
    n;
  if (e === "attack") n = Vs("attack", t);else if (e === "interact") {
    let o = xt(12, 12, 5.6);
    n = [{
      d: o,
      stroke: $d,
      width: 3.8
    }, {
      d: o,
      stroke: r.text,
      width: 1.9
    }, {
      d: xt(12, 12, 1.3),
      fill: "#ffffff"
    }];
  } else n = [{
    d: xt(12, 12, 2.6),
    stroke: $d,
    width: 2.6
  }, {
    d: xt(12, 12, 2.6),
    stroke: r.text,
    width: 1.2
  }, {
    d: xt(12, 12, .9),
    fill: "#ffffff"
  }];
  return `<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false">${My(n)}</svg>`;
}
function nf(e, t) {
  let r = e.createElement("div");
  r.className = "rpk-reticle", r.setAttribute("aria-hidden", "true");
  let n = t,
    o = null,
    a = Number.NaN,
    s = Number.NaN;
  return {
    el: r,
    set(i) {
      if (!i) {
        o !== null && (r.classList.remove("rpk-show"), o = null);
        return;
      }
      i.state !== o && (r.innerHTML = ef(i.state, n), r.dataset.state = i.state, r.classList.remove("rpk-pop"), r.offsetWidth, i.state !== "dot" && r.classList.add("rpk-pop"), r.classList.add("rpk-show"), o = i.state);
      let l = Math.round(i.x * 2) / 2,
        p = Math.round(i.y * 2) / 2;
      (l !== a || p !== s) && (r.style.transform = `translate(${l}px, ${p}px)`, a = l, s = p);
    },
    setAccent(i) {
      i !== n && (n = i, o && (r.innerHTML = ef(o, n)));
    }
  };
}
function tf(e, t, r) {
  let n = e.createElement("kbd");
  return n.className = "rpk-kbd", n.dataset.rpkGlyph = `${t}:${r}`, n.setAttribute("aria-label", ir(t, r)), n.innerHTML = Xs(t, r), n;
}
var of = {
    xbox: "Xbox Controller",
    playstation: "PlayStation Controller",
    nintendo: "Switch Pro Controller",
    generic: "Controller"
  },
  Js = [{
    id: "move",
    title: "Movement",
    lines: [{
      buttons: ["ls"],
      label: "Move"
    }, {
      buttons: ["south"],
      label: "Jump"
    }, {
      buttons: ["west"],
      label: "Sprint (Hold)"
    }, {
      buttons: ["l3"],
      label: "Sprint (Toggle)"
    }]
  }, {
    id: "camera",
    title: "Camera & Aim",
    lines: [{
      buttons: ["rs"],
      label: "Camera"
    }, {
      buttons: ["r3"],
      label: "Recentre Camera"
    }, {
      buttons: ["lt"],
      label: "Aim \xB7 Target"
    }, {
      buttons: ["lb"],
      label: "Next Target"
    }]
  }, {
    id: "actions",
    title: "Actions & Menus",
    lines: [{
      buttons: ["east"],
      label: "Interact"
    }, {
      buttons: ["rt"],
      label: "Primary Action"
    }, {
      buttons: ["dpad"],
      label: "Abilities 1\u20134"
    }, {
      buttons: ["rb"],
      label: "Ability 5"
    }, {
      buttons: ["start"],
      label: "Portals"
    }, {
      buttons: ["select"],
      label: "Controls"
    }]
  }],
  $w = Js.flatMap(e => e.lines),
  mo = (e, t, r, n) => {
    let o = e.createElement(t);
    return o.className = r, n && (o.textContent = n), o;
  };
function af(e, t, r) {
  let n = mo(e, "li", "rpk-control"),
    o = mo(e, "span", "rpk-keys");
  return o.append(...r), n.append(mo(e, "span", "rpk-control-label", t), o), n;
}
function Ay(e, t) {
  let r = [];
  for (let n of t.extras) {
    if (n.pad === null) continue;
    let o = [];
    if (n.pad?.length) for (let a of n.pad) o.push(tf(e, t.family, a));else {
      let a = null;
      for (let s of n.keys) {
        let i = Sn(s);
        if (a && i && i === a.glyph) {
          s === a.key && (a.count += 1, a.times || (a.times = mo(e, "span", "rpk-times"), o.push(a.times)), a.times.textContent = `\xD7${a.count}`);
          continue;
        }
        o.push(i ? tf(e, t.family, i) : t.keyCap(s)), a = {
          glyph: i,
          key: s,
          count: 1
        };
      }
    }
    r.push(af(e, n.label, o));
  }
  return r;
}
function sf(e, t, r) {
  return r.pad ? Ay(e, {
    family: r.family,
    extras: t,
    keyCap: r.keyCap
  }) : t.map(n => {
    let o = [];
    for (let {
      key: a,
      count: s
    } of xa(n.keys)) if (o.push(r.keyCap(a)), s > 1) {
      let i = mo(e, "span", "rpk-times", `\xD7${s}`);
      i.setAttribute("aria-label", `${s} times`), o.push(i);
    }
    return af(e, n.label, o);
  });
}
var lf = `
/* \u2500\u2500 Gamepad mode (./pad-ui.ts) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
/* Glyph chips: the pad's art in place of a keycap. */
.rpk-root .rpk-kbd[data-rpk-glyph] {
  min-width: 0;
  height: auto;
  padding: 0;
  border: 0;
  background: none;
  box-shadow: none;
  line-height: 0;
}
.rpk-root .rpk-kbd[data-rpk-glyph] svg {
  display: block;
  width: 22px;
  height: 22px;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.55));
}
.rpk-root .rpk-prompt .rpk-kbd[data-rpk-glyph] { background: none; box-shadow: none; }
.rpk-root .rpk-prompt .rpk-kbd[data-rpk-glyph] svg {
  width: 26px;
  height: 26px;
  filter: drop-shadow(0 0 8px rgba(var(--rpk-a), 0.55)) drop-shadow(0 1px 2px rgba(0, 0, 0, 0.6));
}
.rpk-root .rpk-control .rpk-kbd[data-rpk-glyph] svg { width: 20px; height: 20px; }
.rpk-root .rpk-plate-key .rpk-kbd[data-rpk-glyph] svg { width: 18px; height: 18px; }
.rpk-root .rpk-slot-key[data-rpk-glyph] {
  top: 2px;
  left: 2px;
  padding: 0;
  border: 0;
  background: none;
}
.rpk-root .rpk-slot-key[data-rpk-glyph] svg { width: 17px; height: 17px; }


/* The reticle: the cursor family's art at the aim point. */
.rpk-reticle {
  position: absolute;
  left: 0;
  top: 0;
  width: 36px;
  height: 36px;
  margin: -18px 0 0 -18px;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.14s ease;
  will-change: transform;
  filter: drop-shadow(0 0 3px rgba(var(--rpk-a), 0.6)) drop-shadow(0 1px 1.5px rgba(0, 0, 0, 0.6));
}
.rpk-reticle svg { display: block; width: 100%; height: 100%; }
.rpk-reticle.rpk-show { opacity: 1; }
.rpk-reticle.rpk-show[data-state='dot'] { opacity: 0.72; }
.rpk-reticle[data-state='attack'] { filter: drop-shadow(0 0 4px rgba(255, 70, 90, 0.75)) drop-shadow(0 1px 1.5px rgba(0, 0, 0, 0.6)); }
.rpk-reticle.rpk-pop svg { animation: rpk-reticle-pop 0.22s var(--rpk-ease); }
@keyframes rpk-reticle-pop { from { transform: scale(1.45); opacity: 0.4; } to { transform: none; opacity: 1; } }
@media (prefers-reduced-motion: reduce) {
  .rpk-reticle.rpk-pop svg { animation: none; }
}
`;
var cf = [{
    title: "Movement",
    lines: [{
      keys: ["W", "S"],
      label: "Move"
    }, {
      keys: ["A", "D"],
      label: "Turn"
    }, {
      keys: ["Q", "E"],
      label: "Strafe"
    }, {
      keys: ["Space"],
      label: "Jump"
    }, {
      keys: ["Shift"],
      label: "Sprint"
    }]
  }, {
    title: "Camera & Mouse",
    lines: [{
      keys: ["Left drag"],
      label: "Look Around"
    }, {
      keys: ["Right drag"],
      label: "Steer"
    }, {
      keys: ["Both buttons"],
      label: "Run"
    }, {
      keys: ["Scroll"],
      label: "Zoom"
    }]
  }, {
    title: "Actions & Menus",
    lines: [{
      keys: ["F"],
      label: "Interact"
    }, {
      keys: ["Tab"],
      label: "Portals"
    }, {
      keys: ["H"],
      label: "Controls"
    }, {
      keys: ["Esc"],
      label: "Close"
    }]
  }],
  ak = cf.flatMap(e => e.lines),
  Py = "In This World",
  Cy = e => ({
    keys: xa(e.keys).map(({
      key: t,
      count: r
    }) => r > 1 ? `${t} \xD7${r}` : t),
    label: e.label
  });
function Hy(e, t) {
  if (e.pad === null) return null;
  if (e.pad?.length) return {
    keys: e.pad.map(o => ir(t, o)),
    label: e.label
  };
  let r = [],
    n = null;
  for (let o of e.keys) {
    let a = Sn(o);
    if (n && a && a === n.glyph) {
      o === n.key && (n.count += 1, r[r.length - 1] = `${ir(t, a)} \xD7${n.count}`);
      continue;
    }
    r.push(a ? ir(t, a) : o), n = {
      glyph: a,
      key: o,
      count: 1
    };
  }
  return {
    keys: r,
    label: e.label
  };
}
function uf(e) {
  let {
      extras: t,
      family: r
    } = e,
    n = e.device === "gamepad",
    o = n ? t.flatMap(s => Hy(s, r) ?? []) : t.map(Cy),
    a = n ? Js.map(s => ({
      title: s.title,
      lines: s.lines.map(i => ({
        keys: i.buttons.map(l => ir(r, l)),
        label: i.label
      }))
    })) : cf.map(s => ({
      title: s.title,
      lines: s.lines.map(i => ({
        keys: [...i.keys],
        label: i.label
      }))
    }));
  return {
    device: n ? "gamepad" : "keyboard",
    pad: e.connected || n ? of[r] : null,
    groups: [...(o.length ? [{
      title: Py,
      lines: o
    }] : []), ...a]
  };
}
import * as Dt from "./001-three-a973dc20bf0957e55145ef9e6b9c97d50275b224b1d81a57603249dd6750ab96.js";
var Ly = Math.PI,
  Iy = .65,
  Ga = e => Math.atan2(Math.sin(e), Math.cos(e));
function pf(e, t, r, n, o) {
  let a = t.right,
    s = t.left && t.right,
    i = 0,
    l = r;
  a ? l = Ga(n) : (i = ((e.turnLeft ? 1 : 0) - (e.turnRight ? 1 : 0)) * Ly * Math.max(0, o), l = Ga(r + i));
  let p = (e.forward || s ? 1 : 0) - (e.back ? 1 : 0),
    m = e.strafeLeft || a && e.turnLeft,
    y = (e.strafeRight || a && e.turnRight ? 1 : 0) - (m ? 1 : 0),
    b = 0,
    R = 0;
  if (p !== 0 || y !== 0) {
    let M = (p < 0 ? Iy : 1) / Math.hypot(p, y),
      H = p * M,
      h = y * M,
      P = Math.sin(l),
      A = Math.cos(l);
    b = P * H - A * h, R = A * H + P * h;
  }
  let v = t.left || t.right;
  return {
    facing: l,
    moveX: b,
    moveZ: R,
    cameraTurn: v ? 0 : i,
    cameraFollow: !v && (p !== 0 || y !== 0 || i !== 0)
  };
}
function df(e, t) {
  let r = t.right,
    n = (e.forward || t.left && t.right ? 1 : 0) - (e.back ? 1 : 0),
    o = e.strafeLeft || r && e.turnLeft,
    a = e.strafeRight || r && e.turnRight,
    s = r ? 0 : (e.turnLeft ? 1 : 0) - (e.turnRight ? 1 : 0);
  return {
    forward: n,
    strafe: (a ? 1 : 0) - (o ? 1 : 0),
    turn: s
  };
}
var Oy = 14;
function ff(e, t, r, n) {
  let o = Math.hypot(e.x, e.y);
  if (!(o > .001)) return {
    facing: t,
    moveX: 0,
    moveZ: 0,
    cameraTurn: 0,
    cameraFollow: !1
  };
  let a = o > 1 ? 1 / o : 1,
    s = e.y * a,
    i = e.x * a,
    l = Math.sin(r),
    p = Math.cos(r),
    m = l * s - p * i,
    E = p * s + l * i,
    y = Math.atan2(m, E),
    b = Ga(y - t) * (1 - Math.exp(-Oy * Math.max(0, n)));
  return {
    facing: Ga(t + b),
    moveX: m,
    moveZ: E,
    cameraTurn: 0,
    cameraFollow: !1
  };
}
function mf(e, t) {
  let r = n => Math.min(1, Math.max(-1, n));
  return t ? {
    forward: r(e.moveY + e.rt - e.lt),
    strafe: 0,
    turn: r(-e.moveX)
  } : {
    forward: r(e.moveY),
    strafe: r(e.moveX),
    turn: 0
  };
}
var Ny = 2.9,
  Fy = 1.7,
  Vy = 16,
  Wy = .55,
  Gy = 56,
  By = 150,
  Dy = 22,
  zy = 4e3,
  Uy = 2e3,
  Ky = 60,
  jy = .35,
  Ef = "rpk.pad.invertY",
  ho = new Set(),
  Ba = {
    dx: 0,
    dy: 0
  },
  Yy = "__remixTouchLook",
  hf = 4e3;
function vf(e) {
  try {
    let t = e?.[Yy];
    if (typeof t != "function") return null;
    let r = t();
    if (!r || typeof r != "object") return null;
    let n = o => typeof o == "number" && Number.isFinite(o) ? Math.max(-hf, Math.min(hf, o)) : 0;
    return {
      dx: n(r.dx),
      dy: n(r.dy),
      held: r.held === !0
    };
  } catch {
    return null;
  }
}
var qy = (e, t) => e.entry === t.entry && e.instance === t.instance,
  Qy = {
    xbox: "Xbox controller",
    playstation: "PlayStation controller",
    nintendo: "Switch Pro controller",
    generic: "Controller"
  },
  gf = (e, t) => 1 - Math.exp(-e * Math.max(0, t)),
  Xy = e => {
    if (!e) return !1;
    let t = e.tagName;
    return t === "INPUT" || t === "TEXTAREA" || t === "SELECT" || e.isContentEditable === !0;
  };
function bf(e) {
  let t = e;
  for (; t;) {
    if (!t.visible) return !1;
    t = t.parent;
  }
  return !0;
}
function yf(e) {
  try {
    return e?.getItem(Ef) === "1";
  } catch {
    return !1;
  }
}
function xf(e) {
  let t = Kd({
      getGamepads: e.getGamepads ?? null,
      target: e.target ?? null
    }),
    r = yf(e.storage),
    n = null,
    o = () => n ?? r,
    a = !1,
    s = null,
    i = !1,
    l = ho,
    p = !1,
    m = !1,
    E = 0,
    y = 0,
    b = 0,
    R = !1,
    v = null,
    T = 0,
    M = 0,
    H = 0,
    h = 0,
    P = Number.NaN,
    A = Number.NaN,
    w = !1,
    C = null,
    k = null,
    W = new Dt.Box3(),
    L = new Dt.Vector3(),
    K = new Dt.Matrix4(),
    D = new Dt.Vector3(),
    N = new Dt.Vector3(),
    g = new Dt.Vector3(),
    S = new Dt.Raycaster(),
    I = [],
    F = (X = e.ui()) => {
      a = t.connected, X?.setInputDevice(t.device, t.family), e.onChange?.();
    },
    z = X => {
      try {
        e.storage?.setItem(Ef, X ? "1" : "0");
      } catch {}
    },
    U = () => {
      n === null || !r || (r = !1, z(!1), !n && (n = !0, e.sendPrefs?.({
        invertY: !0
      })));
    },
    Q = t.onDevice(X => {
      let B = e.ui();
      F(B), X === "keyboard" && (e.input()?.setPointer(null), B?.setReticle(null), v = null, R = !1, m = !1, P = Number.NaN);
    }),
    $ = t.onConnection((X, B) => {
      !i || !e.active() || e.toast(X ? `${Qy[B]} connected` : "Controller disconnected");
    }),
    ie = () => {
      try {
        return typeof document < "u" && Xy(document.activeElement);
      } catch {
        return !1;
      }
    },
    _ = (X, B) => {
      let d = [],
        c = e.camera;
      c.updateMatrixWorld(), N.setFromMatrixPosition(c.matrixWorld);
      let u = (x, O, j, Y) => {
        let re = Y.distanceTo(N);
        re > Ky || (D.copy(Y).project(c), !(D.z < -1 || D.z > 1 || Math.abs(D.x) > 1 || Math.abs(D.y) > 1) && d.push({
          entry: x,
          mesh: O,
          instance: j,
          at: Y.clone(),
          distance: re,
          x: (D.x + 1) / 2 * X,
          y: (1 - D.y) / 2 * B
        }));
      };
      for (let x of e.targets()) {
        if (x.disposed || !bf(x.object)) continue;
        let O = !1;
        x.object.traverseVisible(j => {
          let Y = j;
          if (!Y.isInstancedMesh) return;
          O = !0, Y.updateWorldMatrix(!0, !1), Y.geometry.boundingSphere || Y.geometry.computeBoundingSphere();
          let re = Y.geometry.boundingSphere?.center ?? L.set(0, 0, 0);
          for (let se = 0; se < Y.count; se++) Y.getMatrixAt(se, K), L.copy(re).applyMatrix4(K).applyMatrix4(Y.matrixWorld), u(x, Y, se, L);
        }), !O && (W.setFromObject(x.object), !W.isEmpty() && u(x, null, -1, W.getCenter(L)));
      }
      return d;
    },
    J = X => {
      if (X.state !== void 0) return X.state;
      let {
        entry: B
      } = X;
      g.copy(X.at).sub(N);
      let d = g.length();
      if (X.state = null, d < 1e-4) return null;
      g.divideScalar(d);
      let c = e.raycast(N, g, d);
      if (c && c.distance < d - .35) return null;
      if (typeof B.state != "function") return X.state = B.state, B.state;
      S.ray.origin.copy(N), S.ray.direction.copy(g), S.near = 0, S.far = d + 2, I.length = 0, S.intersectObject(X.mesh ?? B.object, !0, I);
      let u = I.find(x => bf(x.object) && (X.mesh === null || x.instanceId === X.instance));
      return I.length = 0, u ? (X.state = B.state(u) ?? null, X.state) : null;
    },
    Z = (X, B) => {
      X?.setPointer(null), B?.setReticle(null), P = Number.NaN, w = !1;
    };
  return {
    get device() {
      return t.device;
    },
    get family() {
      return t.family;
    },
    get connected() {
      return t.connected;
    },
    get move() {
      return v;
    },
    get sprint() {
      return m && v !== null;
    },
    get looking() {
      return R;
    },
    frame(X, B) {
      let d = e.touchLook?.() ?? null,
        c = e.input(),
        u = e.ui();
      if (!c) return Ba;
      u !== s && (s = u, F(u));
      let x = typeof performance > "u" ? Date.now() : performance.now(),
        O = ie() ? null : t.poll(x),
        j = c.takeCarriedPad();
      if (i = !0, t.connected !== a && F(u), !O) return c.setVirtual(ho, "keyboard"), l = ho, v = null, R = !1, T = 0, M = 0, H = 0, h = 0, Z(c, u), Ba;
      j && t.setDevice("gamepad");
      let Y = O.sample,
        re = t.device === "gamepad";
      if (T = Y.lt, M = Y.rt, H = Y.look.x, h = Y.look.y, e.hostHasInput?.()) return p = !0, l = ho, c.setVirtual(ho, t.device, !0), v = null, R = !1, y = 0, b = 0, u?.setReticle(null), Ba;
      let se = p;
      p = !1, O.pressed("start") ? e.command("menu") : O.pressed("select") && e.command("help"), O.pressed("north") && e.command("chat"), O.pressed("r3") && e.recenter();
      let ee = Dd(Y, l, B.possessed);
      l = ee;
      let me = !B.possessed && O.pressed("lt") ? new Set([...ee, "MouseRight"]) : ee;
      c.setVirtual(me, t.device, O.fresh || se);
      let de = d?.dx ?? 0,
        ne = (d?.dy ?? 0) * (o() ? -1 : 1);
      if (!re) return Z(c, u), v = null, R = d?.held === !0, d ? {
        dx: de,
        dy: ne
      } : Ba;
      v = {
        x: Y.move.x,
        y: -Y.move.y
      }, O.pressed("l3") && (m = !m), Y.move.magnitude > .1 ? E = 0 : (E += X, E >= jy && (m = !1));
      let {
          width: ce,
          height: Ie
        } = e.size(),
        Me = ce / 2,
        oe = Ie / 2,
        V = Me,
        ae = oe;
      if (w = !1, !B.possessed && !B.crossing) {
        let jt = Y.lt >= .3;
        Y.look.magnitude > .5 && (C = null), C && (x > C.until || C.entry.disposed) && (C = null);
        let Or = e.targets().length > 0 ? _(ce, Ie) : [],
          _t = C,
          ot = _t ? Or.find(we => qy(we, _t)) : void 0;
        if (ot && J(ot)) V = ot.x, ae = ot.y, w = !0;else {
          C = null;
          let we = jt ? By : Gy,
            $t = Or.filter(Ht => Math.hypot(Ht.x - Me, Ht.y - oe) <= we).filter(Ht => J(Ht) !== null),
            he = zd({
              x: Me,
              y: oe
            }, $t, we, 1);
          he.index >= 0 && (V = he.x, ae = he.y, w = !0);
        }
        if (O.pressed("lb")) {
          let we = Or.filter(Ht => J(Ht) === "attack"),
            ur = Ud({
              x: Me,
              y: oe
            }, we).map(Ht => we[Ht]),
            $t = ot && k && x - k.at < Uy ? ur.indexOf(ot) : -1,
            he = ur[$t < 0 ? 0 : ($t + 1) % ur.length];
          k = {
            at: x
          }, he && (C = {
            entry: he.entry,
            instance: he.instance,
            until: x + zy
          }, V = he.x, ae = he.y, w = !0, c.pushClick({
            button: 0,
            x: he.x,
            y: he.y
          }));
        }
      }
      if (Number.isNaN(P)) P = V, A = ae;else {
        let jt = gf(Dy, X);
        P += (V - P) * jt, A += (ae - A) * jt;
      }
      c.setPointer({
        x: V,
        y: ae
      }), !B.possessed && !B.crossing && (O.pressed("rt") && c.pushClick({
        button: 0,
        x: V,
        y: ae
      }), O.pressed("lt") && c.pushClick({
        button: 2,
        x: V,
        y: ae
      }));
      let ve = rf(e.cursorState()),
        ze = !B.possessed && !B.crossing && (ve !== "dot" || w || Y.lt >= .3 || e.wantsReticle());
      u?.setReticle(ze ? {
        state: ve,
        x: P,
        y: A
      } : null);
      let je = w ? Wy : 1,
        rn = Y.look.x * Ny * je,
        Fn = Y.look.y * Fy * je * (o() ? -1 : 1),
        nn = gf(Vy, X);
      return y += (rn - y) * nn, b += (Fn - b) * nn, Math.abs(y) < 1e-4 && (y = 0), Math.abs(b) < 1e-4 && (b = 0), R = Y.look.magnitude > 0 || y !== 0 || b !== 0 || d?.held === !0, {
        dx: y * X / ds + de,
        dy: b * X / fs + ne
      };
    },
    axes(X) {
      let B = v ?? {
        x: 0,
        y: 0
      };
      return mf({
        moveX: B.x,
        moveY: B.y,
        lt: T,
        rt: M
      }, X);
    },
    analog() {
      if (t.device === "gamepad" && v) return {
        moveX: v.x,
        moveY: v.y,
        lookX: H,
        lookY: o() ? h : -h,
        lt: T,
        rt: M
      };
      let X = e.input(),
        B = (...d) => d.some(c => X?.held(c) === !0);
      return {
        moveX: (B("KeyD", "ArrowRight") ? 1 : 0) - (B("KeyA", "ArrowLeft") ? 1 : 0),
        moveY: (B("KeyW", "ArrowUp") ? 1 : 0) - (B("KeyS", "ArrowDown") ? 1 : 0),
        lookX: 0,
        lookY: 0,
        lt: B("MouseRight") ? 1 : 0,
        rt: B("MouseLeft") ? 1 : 0
      };
    },
    rumble(X, B) {
      e.active() && t.rumble(X, B);
    },
    feedback(X, B = 0) {
      e.active() && (X === "land" ? t.rumble(Math.min(.7, B / 28), 110) : X === "portal" ? t.rumble(.3, 260) : X === "hit" ? t.rumble(.35, 110) : t.rumble(.55, 180));
    },
    reloadSettings() {
      let X = o();
      r = yf(e.storage), U(), o() !== X && F();
    },
    setHostPrefs(X) {
      let B = o();
      n = X.invertY === !0, U(), o() !== B && F();
    },
    get invertY() {
      return o();
    },
    dispose() {
      Q(), $(), t.dispose();
    }
  };
}
import * as le from "./001-three-a973dc20bf0957e55145ef9e6b9c97d50275b224b1d81a57603249dd6750ab96.js";
function Jy(e, t, r, n) {
  if (e === "circle") return Math.hypot(r, n) - t;
  let o = t * .74,
    a = t - o,
    s = Math.hypot(r, n - a) - o,
    i = (a - t) / 2,
    l = (a + t) / 2,
    p = Math.abs(r) - o,
    m = Math.abs(n - i) - l,
    E = Math.hypot(Math.max(p, 0), Math.max(m, 0)) + Math.min(Math.max(p, m), 0);
  return Math.min(s, E);
}
function Tf(e, t, r) {
  return (r.x - e.x) * Math.sin(t) + (r.z - e.z) * Math.cos(t);
}
function Zs(e, t, r, n, o, a) {
  let s = Tf(e, t, o),
    i = Tf(e, t, a);
  if (!(s >= 0 && i < 0)) return !1;
  let l = s / (s - i),
    p = o.x + (a.x - o.x) * l - e.x,
    m = o.y + (a.y - o.y) * l - e.y,
    E = o.z + (a.z - o.z) * l - e.z,
    y = p * Math.cos(t) - E * Math.sin(t);
  return Jy(r, n, y, m) <= n * .05;
}
function _s(e, t) {
  return Math.hypot(t.x - e.x, t.z - e.z);
}
import * as Re from "./001-three-a973dc20bf0957e55145ef9e6b9c97d50275b224b1d81a57603249dd6750ab96.js";
import * as nt from "./001-three-a973dc20bf0957e55145ef9e6b9c97d50275b224b1d81a57603249dd6750ab96.js";
var gt = {
  none: 0,
  linear: 1,
  reinhard: 2,
  cineon: 3,
  aces: 4,
  neutral: 5,
  agx: 6
};
function Zy(e) {
  switch (e) {
    case nt.LinearToneMapping:
      return gt.linear;
    case nt.ReinhardToneMapping:
      return gt.reinhard;
    case nt.CineonToneMapping:
      return gt.cineon;
    case nt.ACESFilmicToneMapping:
      return gt.aces;
    case nt.AgXToneMapping:
      return gt.agx;
    case nt.NeutralToneMapping:
      return gt.neutral;
    default:
      return gt.none;
  }
}
function bt() {
  return {
    uToneOp: {
      value: gt.aces
    },
    uToneExposure: {
      value: 1
    }
  };
}
var wf = .995,
  pt = 1e6;
function et(e, t) {
  e.uToneOp.value = Zy(t.toneMapping), e.uToneExposure.value = t.toneMappingExposure;
}
var _y = [.59719, .076, .0284, .35458, .90834, .13383, .04823, .01566, .83777],
  $y = [1.60475, -.10208, -.00327, -.53108, 1.10813, -.07276, -.07367, -.00605, 1.07602],
  eE = [1.6605, -.1246, -.0182, -.5876, 1.1329, -.1006, -.0728, -.0083, 1.1187],
  tE = [.6274, .0691, .0164, .3293, .9195, .088, .0433, .0113, .8956],
  rE = [.856627153315983, .137318972929847, .11189821299995, .0951212405381588, .761241990602591, .0767994186031903, .0482516061458583, .101439036467562, .811302368396859],
  nE = [1.1271005818144368, -.1413297634984383, -.14132976349843826, -.11060664309660323, 1.157823702216272, -.11060664309660294, -.016493938717834573, -.016493938717834257, 1.2519364065950405];
function Pn(e) {
  return `mat3( ${new nt.Matrix3().fromArray(e).invert().elements.map(r => r.toFixed(7)).join(", ")} )`;
}
var oE = `
uniform int uToneOp;
uniform float uToneExposure;

vec3 portalInverseAces( vec3 y ) {
  const mat3 invOutput = ${Pn($y)};
  const mat3 invInput = ${Pn(_y)};
  vec3 w = clamp( invOutput * y, 0.0, 0.9995 );
  // RRTAndODTFit is a ratio of quadratics per channel; solve for its positive root.
  vec3 a = 1.0 - 0.983729 * w;
  vec3 b = 0.0245786 - 0.4329510 * w;
  vec3 c = -( 0.000090537 + 0.238081 * w );
  vec3 v = ( -b + sqrt( max( b * b - 4.0 * a * c, 0.0 ) ) ) / ( 2.0 * a );
  return max( invInput * v, 0.0 ) * ( 0.6 / uToneExposure );
}

float portalAgxSigmoid( float x ) {
  float x2 = x * x;
  float x4 = x2 * x2;
  return 15.5 * x4 * x2 - 40.14 * x4 * x + 31.96 * x4 - 6.868 * x2 * x + 0.4298 * x2 + 0.1191 * x - 0.00232;
}

float portalInverseAgxSigmoid( float y ) {
  // Monotonic on [0, 1]: bisect to ~1e-4 of the log range.
  float lo = 0.0;
  float hi = 1.0;
  for ( int i = 0; i < 13; i++ ) {
    float mid = 0.5 * ( lo + hi );
    if ( portalAgxSigmoid( mid ) < y ) lo = mid; else hi = mid;
  }
  return 0.5 * ( lo + hi );
}

vec3 portalInverseAgx( vec3 y ) {
  const mat3 invRec2020ToSrgb = ${Pn(eE)};
  const mat3 invOutset = ${Pn(nE)};
  const mat3 invInset = ${Pn(rE)};
  const mat3 invSrgbToRec2020 = ${Pn(tE)};
  const float minEv = -12.47393;
  const float maxEv = 4.026069;
  vec3 c = pow( max( invRec2020ToSrgb * y, 0.0 ), vec3( 1.0 / 2.2 ) );
  c = invOutset * c;
  vec3 x = vec3(
    portalInverseAgxSigmoid( c.r ),
    portalInverseAgxSigmoid( c.g ),
    portalInverseAgxSigmoid( c.b )
  );
  vec3 linear = exp2( x * ( maxEv - minEv ) + minEv );
  linear = invSrgbToRec2020 * ( invInset * linear );
  return max( linear, 0.0 ) / uToneExposure;
}

vec3 portalInverseNeutral( vec3 y ) {
  const float startCompression = 0.8 - 0.04;
  const float desaturation = 0.15;
  const float d = 1.0 - startCompression;
  vec3 color = y;
  float newPeak = max( color.r, max( color.g, color.b ) );
  if ( newPeak >= startCompression ) {
    // THE NEUTRAL GAMUT (neutralReach): dim a colour purer than the map can
    // show at this peak along its own ray, and never past INVERSE_PEAK.
    float purity = min( color.r, min( color.g, color.b ) ) / newPeak;
    float room = purity / ( desaturation * max( 1.0 - purity, 1e-4 ) );
    float b = 2.0 * d + room;
    float reach = 1.0 - 2.0 * d * d / ( b + sqrt( max( b * b - 4.0 * d * d, 0.0 ) ) );
    float capped = min( reach, ${wf.toFixed(4)} );
    if ( newPeak > capped ) {
      color *= capped / newPeak;
      newPeak = capped;
    }
    float peak = d * d / ( 1.0 - newPeak ) - d + startCompression;
    float g = 1.0 - 1.0 / ( desaturation * ( peak - newPeak ) + 1.0 );
    color = ( color - g * newPeak ) / max( 1.0 - g, 1e-4 );
    color *= peak / newPeak;
  }
  float low = min( color.r, min( color.g, color.b ) );
  float offset = low >= 0.04 ? 0.04 : sqrt( max( low, 0.0 ) / 6.25 ) - max( low, 0.0 );
  return max( color + offset, 0.0 ) / uToneExposure;
}

vec3 portalInverseTone( vec3 display ) {
  vec3 y = max( display, 0.0 );
  if ( uToneOp == ${gt.linear} ) return y / uToneExposure;
  if ( uToneOp == ${gt.reinhard} ) {
    y = min( y, ${wf.toFixed(4)} );
    return y / ( ( 1.0 - y ) * uToneExposure );
  }
  if ( uToneOp == ${gt.cineon} ) {
    vec3 g = min( pow( y, vec3( 1.0 / 2.2 ) ), 0.995 );
    vec3 a = 6.2 * ( 1.0 - g );
    vec3 b = 0.5 - 1.7 * g;
    vec3 c = -0.06 * g;
    vec3 x = ( -b + sqrt( max( b * b - 4.0 * a * c, 0.0 ) ) ) / ( 2.0 * a );
    return ( x + 0.004 ) / uToneExposure;
  }
  if ( uToneOp == ${gt.aces} ) return portalInverseAces( y );
  if ( uToneOp == ${gt.neutral} ) return portalInverseNeutral( y );
  if ( uToneOp == ${gt.agx} ) return portalInverseAgx( y );
  return y;
}
`,
  aE = `
vec3 portalOutput( vec3 display, float ceiling ) {
#ifdef TONE_MAPPING
  // This draw tone maps in the material: present the colour as is. A bloom
  // world's preview capture shows what its composer would (the ceiling).
  if ( ceiling < ${(pt / 10).toFixed(1)} ) {
    return toneMapping( portalCeiling( portalInverseTone( display ), ceiling ) );
  }
  return display;
#else
  // A post chain tone maps later: hand it what it turns back into the display colour.
  return portalCeiling( portalInverseTone( display ), ceiling );
#endif
}
`,
  iE = [.299, .587, .114],
  sE = .6,
  lE = `
vec3 portalCeiling( vec3 color, float ceiling ) {
  float luma = dot( color, vec3( ${iE.join(", ")} ) );
  float knee = ceiling * ${sE.toFixed(2)};
  if ( luma <= knee ) return color;
  float room = ceiling - knee;
  float soft = knee + room * ( 1.0 - exp( -( luma - knee ) / room ) );
  return color * ( soft / luma );
}
`,
  mk = .8 - .04;
var yt = `${oE}
${lE}
${aE}`;
function $s(e, t = "#b6ff00") {
  let r = new nt.Color();
  try {
    r.set(e && e.length > 0 ? e : t);
  } catch {
    r.set(t);
  }
  return r;
}
function el(e, t = new nt.Color()) {
  let r = {
    h: 0,
    s: 0,
    l: 0
  };
  return e.getHSL(r), t.setHSL((r.h + .91) % 1, Math.min(1, r.s * 1.05 + .1), r.l * .75);
}
import * as zt from "./001-three-a973dc20bf0957e55145ef9e6b9c97d50275b224b1d81a57603249dd6750ab96.js";
var tl = 1.27,
  rl = .055,
  cE = `
varying vec2 vLocal;
void main() {
  vLocal = position.xy;
  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}
`,
  uE = `
uniform float uLeft;
uniform float uSeconds;
uniform float uUrgent;
uniform float uOpacity;
uniform float uRadius;
uniform float uHalf;
uniform float uTime;
uniform vec3 uAccent;
uniform float uCeiling;
varying vec2 vLocal;
${yt}
void main() {
  float r = length( vLocal );
  float across = abs( r - uRadius );
  float aa = max( fwidth( r ), 1e-4 );
  // The track: a soft dark band a little wider than the arc.
  float band = 1.0 - smoothstep( uHalf - aa, uHalf + aa, across );
  // The arc: clockwise from twelve o'clock (seen from the front, +Z) to what is left.
  float turn = fract( atan( vLocal.x, vLocal.y ) / 6.28318530718 + 1.0 );
  float along = aa / ( 6.28318530718 * uRadius );
  float arc = 1.0 - smoothstep( uLeft - along, uLeft + along, turn );
  arc *= 1.0 - smoothstep( uHalf * 0.72 - aa, uHalf * 0.72 + aa, across );
  // A glowing head where it drains, and a flash on each whole second at the end.
  float head = exp( -pow( ( uLeft - turn ) * uRadius * 9.0, 2.0 ) ) * step( turn, uLeft + along );
  float tick = uUrgent * smoothstep( 0.72, 1.0, fract( uSeconds ) );
  vec3 lit = mix( uAccent, vec3( 1.0 ), clamp( 0.18 + 0.45 * head + 0.3 * uUrgent + 0.35 * tick, 0.0, 1.0 ) );
  float shimmer = 0.9 + 0.1 * sin( turn * 60.0 - uTime * 5.0 );
  vec3 color = mix( vec3( 0.02, 0.03, 0.05 ), lit * shimmer, arc );
  float alpha = max( band * 0.26, arc * ( 0.92 + 0.08 * tick ) ) * uOpacity;
  if ( alpha < 0.003 ) discard;
  gl_FragColor = vec4( portalOutput( min( color, vec3( 1.0 ) ), uCeiling ), alpha );
  #include <colorspace_fragment>
}
`;
function kf(e, t, r) {
  let n = e * tl,
    o = e * rl / 2,
    a = new zt.RingGeometry(n - o * 1.6, n + o * 1.6, 192, 1),
    s = bt(),
    i = {
      uLeft: {
        value: 1
      },
      uSeconds: {
        value: 0
      },
      uUrgent: {
        value: 0
      },
      uOpacity: {
        value: 0
      },
      uRadius: {
        value: n
      },
      uHalf: {
        value: o
      },
      uTime: {
        value: 0
      },
      uAccent: {
        value: t.clone()
      },
      uCeiling: {
        value: r ?? pt
      },
      ...s
    },
    l = new zt.ShaderMaterial({
      uniforms: i,
      vertexShader: cE,
      fragmentShader: uE,
      side: zt.DoubleSide,
      transparent: !0,
      depthWrite: !1
    }),
    p = new zt.Mesh(a, l);
  p.name = "portal-countdown", p.renderOrder = 3;
  let m = 0,
    E = 0;
  return {
    object: p,
    set(y, b, R) {
      i.uLeft.value = zt.MathUtils.clamp(y, 0, 1), i.uSeconds.value = Math.max(0, b), E = R ? 1 : 0;
    },
    setAccent(y) {
      i.uAccent.value.copy(y);
    },
    update(y, b, R) {
      let v = Math.max(0, y - i.uTime.value);
      i.uTime.value = y, m += (E - m) * Math.min(1, v * 4), i.uUrgent.value = m, i.uOpacity.value = zt.MathUtils.clamp(b, 0, 1), p.visible = b > .01, et(s, R);
    },
    dispose() {
      a.dispose(), l.dispose();
    }
  };
}
import * as ue from "./001-three-a973dc20bf0957e55145ef9e6b9c97d50275b224b1d81a57603249dd6750ab96.js";
import { BackSide as pE, BoxGeometry as dE, InstancedMesh as fE, Mesh as $r, MeshLambertMaterial as mE, MeshStandardMaterial as Rf, PointLight as hE, Scene as gE, Object3D as bE } from "./001-three-a973dc20bf0957e55145ef9e6b9c97d50275b224b1d81a57603249dd6750ab96.js";
var Da = class extends gE {
  constructor() {
    super(), this.name = "RoomEnvironment", this.position.y = -3.5;
    let t = new dE();
    t.deleteAttribute("uv");
    let r = new Rf({
        side: pE
      }),
      n = new Rf(),
      o = new hE(16777215, 900, 28, 2);
    o.position.set(.418, 16.199, .3), this.add(o);
    let a = new $r(t, r);
    a.position.set(-.757, 13.219, .717), a.scale.set(31.713, 28.305, 28.591), this.add(a);
    let s = new fE(t, n, 6),
      i = new bE();
    i.position.set(-10.906, 2.009, 1.846), i.rotation.set(0, -.195, 0), i.scale.set(2.328, 7.905, 4.651), i.updateMatrix(), s.setMatrixAt(0, i.matrix), i.position.set(-5.607, -.754, -.758), i.rotation.set(0, .994, 0), i.scale.set(1.97, 1.534, 3.955), i.updateMatrix(), s.setMatrixAt(1, i.matrix), i.position.set(6.167, .857, 7.803), i.rotation.set(0, .561, 0), i.scale.set(3.927, 6.285, 3.687), i.updateMatrix(), s.setMatrixAt(2, i.matrix), i.position.set(-2.017, .018, 6.124), i.rotation.set(0, .333, 0), i.scale.set(2.002, 4.566, 2.064), i.updateMatrix(), s.setMatrixAt(3, i.matrix), i.position.set(2.291, -.756, -2.621), i.rotation.set(0, -.286, 0), i.scale.set(1.546, 1.552, 1.496), i.updateMatrix(), s.setMatrixAt(4, i.matrix), i.position.set(-2.193, -.369, -5.547), i.rotation.set(0, .516, 0), i.scale.set(3.875, 3.487, 2.986), i.updateMatrix(), s.setMatrixAt(5, i.matrix), this.add(s);
    let l = new $r(t, Cn(50));
    l.position.set(-16.116, 14.37, 8.208), l.scale.set(.1, 2.428, 2.739), this.add(l);
    let p = new $r(t, Cn(50));
    p.position.set(-16.109, 18.021, -8.207), p.scale.set(.1, 2.425, 2.751), this.add(p);
    let m = new $r(t, Cn(17));
    m.position.set(14.904, 12.198, -1.832), m.scale.set(.15, 4.265, 6.331), this.add(m);
    let E = new $r(t, Cn(43));
    E.position.set(-.462, 8.89, 14.52), E.scale.set(4.38, 5.441, .088), this.add(E);
    let y = new $r(t, Cn(20));
    y.position.set(3.235, 11.486, -12.541), y.scale.set(2.5, 2, .1), this.add(y);
    let b = new $r(t, Cn(100));
    b.position.set(0, 20, 0), b.scale.set(1, .1, 1), this.add(b);
  }
  dispose() {
    let t = new Set();
    this.traverse(r => {
      r.isMesh && (t.add(r.geometry), t.add(r.material));
    });
    for (let r of t) r.dispose();
  }
};
function Cn(e) {
  return new mE({
    color: 0,
    emissive: 16777215,
    emissiveIntensity: e
  });
}
import * as qe from "./001-three-a973dc20bf0957e55145ef9e6b9c97d50275b224b1d81a57603249dd6750ab96.js";
var yE = `
attribute vec4 seed;
uniform float uTime;
uniform float uRadius;
uniform float uIntensity;
uniform float uBurst;
uniform float uOpen;
uniform float uViewportHeight;
varying float vAlpha;
varying float vHot;

void main() {
  float speed = 0.16 + seed.y * 0.22;
#ifdef ORBIT
  float ang = seed.z * 6.28318 + uTime * ( 0.35 + seed.y * 0.35 ) * ( seed.w > 0.5 ? 1.0 : -0.8 );
  float r = uRadius * ( 1.16 + 0.05 * sin( uTime * 1.7 + seed.x * 12.0 ) );
  vec3 pos = vec3( cos( ang ) * r, sin( ang ) * r, sin( uTime * 1.3 + seed.x * 9.0 ) * uRadius * 0.12 );
  float size = uRadius * ( 0.07 + seed.y * 0.05 );
  float twinkle = 0.65 + 0.35 * sin( uTime * ( 3.0 + seed.y * 4.0 ) + seed.x * 20.0 );
  float alpha = twinkle * ( 0.55 + 0.45 * uIntensity );
  vHot = 0.6;
#else
  float life = fract( seed.x + uTime * speed );
  float inward = pow( life, 1.4 );
  float r = mix( 1.22 + seed.y * 0.4, 0.03, inward ) * uRadius;
  float ang = seed.z * 6.28318 + inward * ( 3.2 + seed.y * 2.4 ) + uTime * 0.2;
  vec3 pos = vec3( cos( ang ) * r, sin( ang ) * r, mix( 0.25 + seed.w * 0.55, 0.01, inward ) * uRadius );
  float size = uRadius * ( 0.034 + seed.y * 0.04 ) * mix( 1.0, 0.45, inward );
  float fade = smoothstep( 0.0, 0.18, life ) * smoothstep( 1.0, 0.82, life );
  float gate = step( seed.w, 0.3 + 0.7 * uIntensity );
  float alpha = fade * gate * ( 0.3 + 0.7 * uIntensity );
  vHot = inward;
  if ( uBurst > 0.0 ) {
    float b = 1.0 - pow( 1.0 - uBurst, 2.4 );
    float a0 = seed.z * 6.28318;
    vec3 outward = vec3( cos( a0 ), sin( a0 ), ( seed.w - 0.4 ) * 0.9 );
    pos = outward * uRadius * ( 0.9 + b * ( 1.2 + seed.y * 1.8 ) );
    size = uRadius * ( 0.06 + seed.y * 0.06 ) * ( 1.0 - b * 0.5 );
    alpha = ( 1.0 - uBurst ) * 1.4;
    vHot = 0.25;
  }
#endif
  vec4 mv = modelViewMatrix * vec4( pos, 1.0 );
  gl_Position = projectionMatrix * mv;
  gl_PointSize = size * projectionMatrix[ 1 ][ 1 ] * uViewportHeight * 0.5 / max( -mv.z, 0.01 );
  // Never a blob in the camera's face (the warp flies straight through them).
  float nearFade = smoothstep( 0.3, 1.0, -mv.z );
  vAlpha = alpha * nearFade * uOpen;
}
`,
  EE = `
uniform vec3 uColor;
uniform vec3 uHotColor;
uniform float uCeiling;
varying float vAlpha;
varying float vHot;
${yt}

void main() {
  vec2 c = gl_PointCoord - 0.5;
  float d = length( c );
  float core = smoothstep( 0.5, 0.0, d );
  core *= core;
  float a = core * vAlpha;
  if ( a < 0.004 ) discard;
  vec3 color = mix( uColor, uHotColor, vHot ) + vec3( 1.0 ) * pow( core, 6.0 ) * 0.6;
  gl_FragColor = vec4( portalOutput( color, uCeiling ), a );
  #include <colorspace_fragment>
}
`;
function Sf(e, t, r, n = pt) {
  let o = new qe.BufferGeometry(),
    a = new Float32Array(t * 4),
    s = r ? 2654435769 : 2246822507,
    i = () => (s ^= s << 13, s ^= s >>> 17, s ^= s << 5, (s >>> 0) % 1e5 / 1e5);
  for (let R = 0; R < t; R++) a[R * 4] = i(), a[R * 4 + 1] = i(), a[R * 4 + 2] = r ? R / t + i() * .05 : i(), a[R * 4 + 3] = i();
  o.setAttribute("seed", new qe.BufferAttribute(a, 4)), o.setAttribute("position", new qe.BufferAttribute(new Float32Array(t * 3), 3)), o.boundingSphere = new qe.Sphere(new qe.Vector3(), e * 3.5);
  let l = bt(),
    p = {
      uTime: {
        value: 0
      },
      uRadius: {
        value: e
      },
      uIntensity: {
        value: 0
      },
      uBurst: {
        value: 0
      },
      uOpen: {
        value: 1
      },
      uViewportHeight: {
        value: 1080
      },
      uColor: {
        value: new qe.Color()
      },
      uHotColor: {
        value: new qe.Color()
      },
      uCeiling: {
        value: n
      },
      ...l
    },
    m = new qe.ShaderMaterial({
      uniforms: p,
      vertexShader: yE,
      fragmentShader: EE,
      defines: r ? {
        ORBIT: ""
      } : {},
      transparent: !0,
      depthWrite: !1,
      blending: qe.AdditiveBlending
    }),
    E = new qe.Points(o, m);
  E.renderOrder = 3;
  let y = new qe.Vector2(),
    b = !1;
  return {
    object: E,
    setAccent(R) {
      p.uColor.value.copy(R), p.uHotColor.value.copy(R).lerp(new qe.Color(1, 1, 1), r ? .7 : .55);
    },
    update(R, v, T, M, H) {
      p.uTime.value = R, p.uIntensity.value = v, p.uBurst.value = T, p.uOpen.value = M, p.uViewportHeight.value = H.getDrawingBufferSize(y).y, et(l, H), E.visible = !b && M > .001;
    },
    setHidden(R) {
      b = R, E.visible = !b && p.uOpen.value > .001;
    },
    dispose() {
      o.dispose(), m.dispose();
    }
  };
}
var Mf = (e, t = 150, r) => Sf(e, t, !1, r),
  Af = (e, t = 12) => Sf(e, t, !0);
var Pf = new WeakMap();
function vE(e) {
  let t = Pf.get(e);
  if (t) return t;
  try {
    let r = new ue.PMREMGenerator(e),
      n = new Da(),
      o = r.fromScene(n, .04).texture;
    return o.userData.portalRoomEnvironment = !0, n.dispose(), r.dispose(), Pf.set(e, o), o;
  } catch {
    return null;
  }
}
function Hn(e, t, r, n, o = .55) {
  return new ue.MeshStandardMaterial({
    color: t,
    roughness: r,
    metalness: n,
    envMap: vE(e),
    envMapIntensity: o
  });
}
function Hf() {
  return new ue.ShaderMaterial({
    uniforms: {
      uTime: {
        value: 0
      },
      uAccent: {
        value: new ue.Color()
      },
      uGlow: {
        value: 0
      },
      uRepeat: {
        value: 6
      },
      ...bt()
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform vec3 uAccent;
      uniform float uGlow;
      uniform float uRepeat;
      varying vec2 vUv;
      ${yt}
      void main() {
        float run = fract( vUv.x * uRepeat - uTime * 0.35 );
        float pulse = smoothstep( 0.0, 0.08, run ) * smoothstep( 0.35, 0.08, run );
        float fine = 0.5 + 0.5 * sin( vUv.x * uRepeat * 40.0 - uTime * 6.0 );
        float level = 0.55 + 0.25 * fine + pulse * ( 1.1 + uGlow );
        vec3 color = mix( uAccent, vec3( 1.0 ), clamp( pulse * 0.55 + uGlow * 0.1, 0.0, 1.0 ) ) * level;
        gl_FragColor = vec4( portalOutput( min( color, vec3( 1.0 ) ), ${pt.toFixed(1)} ), 1.0 );
        #include <colorspace_fragment>
      }
    `
  });
}
function Lf() {
  return new ue.ShaderMaterial({
    uniforms: {
      uColor: {
        value: new ue.Color()
      },
      ...bt()
    },
    vertexShader: `
      void main() {
        vec4 local = vec4( position, 1.0 );
        #ifdef USE_INSTANCING
          local = instanceMatrix * local;
        #endif
        gl_Position = projectionMatrix * modelViewMatrix * local;
      }
    `,
    fragmentShader: `
      uniform vec3 uColor;
      ${yt}
      void main() {
        gl_FragColor = vec4( portalOutput( min( uColor * 1.15, vec3( 1.0 ) ), ${pt.toFixed(1)} ), 1.0 );
        #include <colorspace_fragment>
      }
    `
  });
}
function If(e, t) {
  let r = new ue.PlaneGeometry(t * 2.3, e * 4.4);
  r.rotateX(-Math.PI / 2);
  let n = new ue.ShaderMaterial({
      uniforms: {
        uTime: {
          value: 0
        },
        uAccent: {
          value: new ue.Color()
        },
        uGlow: {
          value: 0
        },
        uOpen: {
          value: 1
        },
        uHalf: {
          value: new ue.Vector2(t * 1.15, e * 2.2)
        },
        ...bt()
      },
      vertexShader: `
      varying vec2 vPos;
      void main() {
        vPos = position.xz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
      }
    `,
      fragmentShader: `
      uniform float uTime;
      uniform vec3 uAccent;
      uniform float uGlow;
      uniform float uOpen;
      uniform vec2 uHalf;
      varying vec2 vPos;
      ${yt}
      void main() {
        vec2 q = vPos / uHalf;
        // Stronger in front of the portal (+z) than behind it.
        q.y *= q.y > 0.0 ? 0.8 : 1.35;
        float r = length( q );
        float pool = exp( -r * r * 5.0 ) * ( 0.35 + 0.45 * uGlow );
        float ring = exp( -pow( ( r - 0.62 ) / 0.012, 2.0 ) ) * 0.5;
        float a = atan( q.y, q.x );
        float ticks = step( 0.82, fract( a * 8.0 / 3.14159 - uTime * 0.05 ) ) * exp( -pow( ( r - 0.7 ) / 0.02, 2.0 ) ) * 0.45;
        float sweep = pow( 0.5 + 0.5 * cos( a - uTime * 0.9 ), 12.0 ) * exp( -pow( ( r - 0.62 ) / 0.05, 2.0 ) ) * 0.6;
        float intensity = ( pool + ( ring + ticks + sweep ) * ( 0.4 + 0.6 * uGlow ) ) * uOpen;
        if ( intensity < 0.002 ) discard;
        gl_FragColor = vec4( portalOutput( min( uAccent * 1.2, vec3( 1.0 ) ), ${pt.toFixed(1)} ), min( intensity, 1.0 ) );
        #include <colorspace_fragment>
      }
    `,
      transparent: !0,
      depthWrite: !1,
      blending: ue.AdditiveBlending,
      polygonOffset: !0,
      polygonOffsetFactor: -2,
      polygonOffsetUnits: -2
    }),
    o = new ue.Mesh(r, n);
  return o.position.y = .012, o.renderOrder = 1, o;
}
function xE({
  radius: e,
  accent: t,
  renderer: r
}) {
  let n = new ue.Group();
  n.name = "portal-frame-ring";
  let o = .16 + e,
    a = new ue.Group();
  a.position.y = o, n.add(a);
  let s = e * 1.075,
    i = e * .085,
    l = Hn(r, "#9aa3b8", .24, .85, .9);
  l.emissive = t.clone(), l.emissiveIntensity = .04;
  let p = new ue.Mesh(new ue.TorusGeometry(s, i, 28, 128), l);
  p.scale.z = .72, a.add(p);
  let m = Hf();
  m.uniforms.uRepeat.value = 5;
  let E = new ue.TorusGeometry(e * 1.004, e * .019, 10, 160),
    y = new ue.Mesh(E, m);
  a.add(y);
  let b = new ue.Mesh(new ue.TorusGeometry(s + i * .95, e * .008, 6, 160), m);
  a.add(b);
  let R = 8,
    v = new ue.CylinderGeometry(i * 1.3, i * 1.3, e * .16, 6, 1),
    T = Hn(r, "#3a4152", .35, .7, .7),
    M = new ue.InstancedMesh(v, T, R),
    H = new ue.BoxGeometry(e * .035, e * .1, i * 2.62),
    h = Lf(),
    P = new ue.InstancedMesh(H, h, R),
    A = new ue.Matrix4(),
    w = new ue.Quaternion(),
    C = new ue.Vector3(1, 1, 1);
  for (let S = 0; S < R; S++) {
    let I = S / R * Math.PI * 2 + Math.PI / R;
    w.setFromAxisAngle(new ue.Vector3(0, 0, 1), I);
    let F = new ue.Vector3(Math.cos(I) * s, Math.sin(I) * s, 0);
    A.compose(F, w, C), M.setMatrixAt(S, A), P.setMatrixAt(S, A);
  }
  a.add(M, P);
  let k = Hn(r, "#2a2f3c", .45, .6),
    W = new ue.Mesh(new ue.CylinderGeometry(e * .46, e * .56, .16, 6, 1), k);
  W.scale.z = .55, W.position.y = .08, n.add(W);
  let L = new ue.Mesh(new ue.BoxGeometry(e * .62, .018, e * .02), m);
  L.position.set(0, .1, e * .26), n.add(L);
  let K = If(e, e);
  n.add(K);
  let D = K.material,
    N = Af(e, 14);
  a.add(N.object);
  let g = S => {
    l.emissive.copy(S), m.uniforms.uAccent.value.copy(S), h.uniforms.uColor.value.copy(S), D.uniforms.uAccent.value.copy(S), N.setAccent(S);
  };
  return g(t), {
    object: n,
    shape: "circle",
    top: o + s + i,
    setAccent: g,
    update(S, I, F, z) {
      m.uniforms.uTime.value = S, m.uniforms.uGlow.value = I, et(m.uniforms, z), et(h.uniforms, z), D.uniforms.uTime.value = S, D.uniforms.uGlow.value = I, D.uniforms.uOpen.value = F, et(D.uniforms, z), l.emissiveIntensity = .03 + I * .08, N.update(S, I, 0, F, z), a.rotation.z = Math.sin(S * .15) * .02;
    },
    dispose() {
      n.traverse(S => {
        (S instanceof ue.Mesh || S instanceof ue.InstancedMesh) && S.geometry.dispose();
      });
      for (let S of [l, T, h, k]) S.dispose();
      m.dispose(), D.dispose(), N.dispose();
    }
  };
}
function TE(e, t, r, n) {
  e.moveTo(-t, r), e.lineTo(-t, n), e.absarc(0, n, t, Math.PI, 0, !0), e.lineTo(t, r), e.lineTo(-t, r);
}
function wE({
  radius: e,
  accent: t,
  renderer: r
}) {
  let n = new ue.Group();
  n.name = "portal-frame-arch";
  let o = e * .74,
    a = .16 + 2 * e - o,
    s = e * .26,
    i = o + s,
    l = e * .34,
    p = new ue.Shape();
  TE(p, i, 0, a);
  let m = new ue.Path();
  m.moveTo(-o, .16), m.lineTo(o, .16), m.lineTo(o, a), m.absarc(0, a, o, 0, Math.PI, !1), m.lineTo(-o, .16), p.holes.push(m);
  let E = new ue.ExtrudeGeometry(p, {
    depth: l,
    bevelEnabled: !0,
    bevelThickness: e * .03,
    bevelSize: e * .03,
    bevelSegments: 2,
    curveSegments: 40
  });
  E.translate(0, 0, -l / 2);
  let y = Hn(r, "#8a8f9e", .58, .35, .6),
    b = new ue.Mesh(E, y);
  n.add(b);
  let R = e * .05,
    v = [],
    T = 48;
  v.push(new ue.Vector3(-(o + R), .16 + .02, 0));
  for (let N = 0; N <= T; N++) {
    let g = Math.PI - N / T * Math.PI;
    v.push(new ue.Vector3(Math.cos(g) * (o + R), a + Math.sin(g) * (o + R), 0));
  }
  v.push(new ue.Vector3(o + R, .16 + .02, 0));
  let M = new ue.CatmullRomCurve3(v, !1, "centripetal"),
    H = Hf();
  H.uniforms.uRepeat.value = 3;
  let h = new ue.TubeGeometry(M, 160, e * .018, 8, !1),
    P = l / 2 + e * .03 + .004;
  for (let N of [P, -P]) {
    let g = new ue.Mesh(h, H);
    g.position.z = N, n.add(g);
  }
  let A = new ue.Mesh(new ue.BoxGeometry(e * .3, e * .36, l * 1.2), Hn(r, "#5a6070", .35, .7, .8));
  A.position.y = a + i - e * .14, n.add(A);
  let w = Lf(),
    C = new ue.OctahedronGeometry(e * .07);
  for (let N of [l * .6 + .01, -(l * .6 + .01)]) {
    let g = new ue.Mesh(C, w);
    g.position.set(0, A.position.y, N), g.scale.set(1, 1.35, .5), n.add(g);
  }
  let k = new ue.BoxGeometry(s + e * .14, e * .3, l * 1.25),
    W = Hn(r, "#5a6070", .45, .6, .7);
  for (let N of [-1, 1]) {
    let g = new ue.Mesh(k, W);
    g.position.set(N * (o + s / 2), e * .15, 0), n.add(g);
  }
  let L = If(e, i);
  n.add(L);
  let K = L.material,
    D = N => {
      H.uniforms.uAccent.value.copy(N), w.uniforms.uColor.value.copy(N), K.uniforms.uAccent.value.copy(N);
    };
  return D(t), {
    object: n,
    shape: "arch",
    top: a + i + e * .03,
    setAccent: D,
    update(N, g, S, I) {
      H.uniforms.uTime.value = N, H.uniforms.uGlow.value = g, et(H.uniforms, I), et(w.uniforms, I), K.uniforms.uTime.value = N, K.uniforms.uGlow.value = g, K.uniforms.uOpen.value = S, et(K.uniforms, I);
    },
    dispose() {
      n.traverse(N => {
        N instanceof ue.Mesh && N.geometry.dispose();
      });
      for (let N of [y, A.material, w, W]) N.dispose();
      H.dispose(), K.dispose();
    }
  };
}
function Cf(e, t) {
  let r = new ue.Group();
  return r.name = t ? "portal-frame-custom" : "portal-frame-none", t && r.add(t), {
    object: r,
    shape: "circle",
    top: .16 + e * 2,
    setAccent() {},
    update() {},
    dispose() {
      t && r.remove(t);
    }
  };
}
function Of(e, t) {
  return typeof e == "object" && e !== null && e.isObject3D ? Cf(t.radius, e) : e === "none" ? Cf(t.radius, null) : e === "arch" ? wE(t) : xE(t);
}
import * as Le from "./001-three-a973dc20bf0957e55145ef9e6b9c97d50275b224b1d81a57603249dd6750ab96.js";
var At = 1024,
  ol = 300,
  Nf = 2.9,
  Pt = 'system-ui, -apple-system, "Segoe UI", Inter, Roboto, "Helvetica Neue", sans-serif';
function In(e, t, r, n, o, a) {
  let s = Math.min(a, o / 2, n / 2);
  e.beginPath(), e.moveTo(t + s, r), e.arcTo(t + n, r, t + n, r + o, s), e.arcTo(t + n, r + o, t, r + o, s), e.arcTo(t, r + o, t, r, s), e.arcTo(t, r, t + n, r, s), e.closePath();
}
function Ff(e, t, r, n, o, a = 28) {
  let s = n;
  for (e.font = `${r} ${s}px ${Pt}`; s > a && e.measureText(t).width > o;) s -= 2, e.font = `${r} ${s}px ${Pt}`;
  return s;
}
function sr(e, t) {
  let r = new Le.Color(e),
    n = Math.round(Le.MathUtils.clamp(r.r, 0, 1) ** (1 / 2.2) * 255),
    o = Math.round(Le.MathUtils.clamp(r.g, 0, 1) ** (1 / 2.2) * 255),
    a = Math.round(Le.MathUtils.clamp(r.b, 0, 1) ** (1 / 2.2) * 255);
  return `rgba(${n}, ${o}, ${a}, ${t})`;
}
function kE(e, t) {
  let {
      title: r,
      creator: n,
      status: o,
      dim: a
    } = t,
    s = a ? "#8a8f9c" : t.accent;
  e.clearRect(0, 0, At, ol), e.textAlign = "center", e.textBaseline = "alphabetic";
  let i = Ff(e, r, 750, 74, At - 200),
    l = e.measureText(r).width,
    p = n ? `by @${n}` : null;
  e.font = `500 36px ${Pt}`;
  let m = p ? e.measureText(p).width : 0;
  e.font = `650 30px ${Pt}`;
  let E = e.measureText(o).width + 34,
    y = Math.min(At - 40, Math.max(440, l, m, E) + 120),
    b = p ? 232 : 186,
    R = (At - y) / 2,
    v = 22;
  e.save(), e.shadowColor = sr(s, a ? .2 : .6), e.shadowBlur = 30, In(e, R, v, y, b, 40);
  let T = e.createLinearGradient(0, v, 0, v + b);
  T.addColorStop(0, "rgba(22, 25, 38, 0.86)"), T.addColorStop(1, "rgba(8, 9, 16, 0.92)"), e.fillStyle = T, e.fill(), e.restore(), In(e, R + 1.5, v + 1.5, y - 3, b - 3, 38.5);
  let M = e.createLinearGradient(0, v, 0, v + b);
  M.addColorStop(0, sr(s, a ? .5 : 1)), M.addColorStop(1, sr(s, a ? .25 : .45)), e.strokeStyle = M, e.lineWidth = 3, e.stroke(), e.save(), In(e, R + 8, v + 8, y - 16, b * .42, 32);
  let H = e.createLinearGradient(0, v + 8, 0, v + b * .5);
  H.addColorStop(0, "rgba(255, 255, 255, 0.10)"), H.addColorStop(1, "rgba(255, 255, 255, 0)"), e.fillStyle = H, e.fill(), e.restore(), e.beginPath(), e.moveTo(At / 2 - 16, v + b + 1), e.lineTo(At / 2, v + b + 22), e.lineTo(At / 2 + 16, v + b + 1), e.closePath(), e.fillStyle = sr(s, a ? .4 : .9), e.fill();
  let h = v + 36 + i * .78;
  e.font = `750 ${i}px ${Pt}`, e.fillStyle = a ? "rgba(200, 204, 214, 0.7)" : "#ffffff", e.fillText(r, At / 2, h), p && (h += 50, e.font = `500 36px ${Pt}`, e.fillStyle = a ? "rgba(200, 204, 214, 0.5)" : "rgba(255, 255, 255, 0.72)", e.fillText(p, At / 2, h)), h += 52, e.font = `650 30px ${Pt}`;
  let P = e.measureText(o).width,
    A = At / 2 - P / 2 - 6;
  e.textAlign = "left", e.fillStyle = sr(s, 1), e.fillText(o, A + 18, h), e.beginPath(), e.arc(A, h - 10, 7, 0, Math.PI * 2), e.fill();
}
function Vf(e) {
  let t = new Le.CanvasTexture(e);
  return t.colorSpace = Le.SRGBColorSpace, t.anisotropy = 4, t.minFilter = Le.LinearMipmapLinearFilter, t.generateMipmaps = !0, t;
}
function Wf(e, t) {
  let r = bt(),
    n = {
      ...r,
      uCeiling: {
        value: t ?? pt
      }
    };
  return e.onBeforeCompile = o => {
    Object.assign(o.uniforms, n), o.fragmentShader = o.fragmentShader.replace("void main() {", `${yt}
uniform float uCeiling;
void main() {`).replace("#include <tonemapping_fragment>", "gl_FragColor.rgb = portalOutput( gl_FragColor.rgb, uCeiling );");
  }, r;
}
function Gf(e) {
  let t = Math.min(2, Math.max(1, globalThis.devicePixelRatio || 1)),
    r = document.createElement("canvas");
  r.width = At * t, r.height = ol * t;
  let n = r.getContext("2d");
  n.scale(t, t);
  let o = Vf(r),
    a = new Le.SpriteMaterial({
      map: o,
      transparent: !0,
      depthWrite: !1,
      sizeAttenuation: !0,
      fog: !1
    }),
    s = Wf(a, e),
    i = new Le.Sprite(a),
    l = m => i.scale.set(Nf * m, Nf * ol / At * m, 1);
  l(1), i.center.set(.5, .05), i.renderOrder = 10;
  let p = "";
  return {
    object: i,
    set(m) {
      let E = JSON.stringify(m);
      E !== p && (p = E, kE(n, m), o.needsUpdate = !0);
    },
    setScale: l,
    syncTone(m) {
      et(s, m);
    },
    setOpacity(m) {
      a.opacity = m, i.visible = m > .01;
    },
    dispose() {
      o.dispose(), a.dispose();
    }
  };
}
var al = 2048,
  il = 256,
  nl = 8,
  za = 50;
function RE(e, t) {
  let {
      creator: r,
      status: n,
      dim: o
    } = t,
    a = o ? "#8a8f9c" : t.accent,
    s = al,
    i = il;
  e.clearRect(0, 0, s, i), e.textAlign = "center", e.textBaseline = "alphabetic";
  let l = t.title.toUpperCase(),
    p = s - 420;
  e.letterSpacing = `${nl}px`;
  let m = Ff(e, l, 800, 112, p, 64),
    E = Math.min(p, e.measureText(l).width);
  e.letterSpacing = "0px";
  let y = r ? `by @${r}` : null;
  e.font = `500 ${za}px ${Pt}`;
  let b = y ? e.measureText(y).width + 48 : 0;
  e.font = `650 ${za}px ${Pt}`;
  let R = e.measureText(n).width + 30,
    v = Le.MathUtils.clamp(Math.max(E, b + R) + 260, s * .4, s - 48),
    T = i - 24,
    M = (s - v) / 2,
    H = 12,
    h = T / 2;
  In(e, M, H, v, T, h);
  let P = e.createLinearGradient(0, H, 0, H + T);
  P.addColorStop(0, "rgba(52, 58, 74, 0.97)"), P.addColorStop(1, "rgba(16, 18, 26, 0.97)"), e.fillStyle = P, e.fill(), In(e, M + 3, H + 3, v - 6, T - 6, h - 3);
  let A = e.createLinearGradient(0, H, 0, H + T);
  A.addColorStop(0, "rgba(226, 231, 242, 0.95)"), A.addColorStop(1, "rgba(112, 120, 138, 0.9)"), e.strokeStyle = A, e.lineWidth = 6, e.stroke(), e.save(), e.shadowColor = sr(a, o ? .2 : .9), e.shadowBlur = 10, In(e, M + 14, H + 14, v - 28, T - 28, h - 14), e.strokeStyle = sr(a, o ? .45 : .95), e.lineWidth = 3, e.stroke(), e.restore(), e.save(), e.shadowColor = sr(a, o ? 0 : .85), e.shadowBlur = 18, e.letterSpacing = `${nl}px`, e.font = `800 ${m}px ${Pt}`, e.fillStyle = o ? "rgba(200, 204, 214, 0.7)" : "#ffffff", e.fillText(l, s / 2 + nl / 2, H + 34 + m * .72, p), e.restore();
  let w = H + T - 40,
    C = (s - b - R) / 2;
  e.textAlign = "left", y && (e.font = `500 ${za}px ${Pt}`, e.fillStyle = o ? "rgba(200, 204, 214, 0.5)" : "rgba(255, 255, 255, 0.78)", e.fillText(y, C, w), C += b), e.font = `650 ${za}px ${Pt}`, e.fillStyle = sr(a, 1), e.beginPath(), e.arc(C + 8, w - 17, 9, 0, Math.PI * 2), e.fill(), e.fillText(n, C + 30, w);
}
function SE(e, t, r, n = 96) {
  let o = [],
    a = [],
    s = [];
  for (let l = 0; l <= n; l++) {
    let p = l / n,
      m = Math.PI / 2 + r * (.5 - p),
      E = Math.cos(m),
      y = Math.sin(m);
    o.push(E * e, y * e, 0, E * t, y * t, 0), a.push(p, 0, p, 1);
    let b = l * 2;
    l < n && s.push(b, b + 2, b + 1, b + 1, b + 2, b + 3);
  }
  let i = new Le.BufferGeometry();
  return i.setAttribute("position", new Le.Float32BufferAttribute(o, 3)), i.setAttribute("uv", new Le.Float32BufferAttribute(a, 2)), i.setIndex(s), i;
}
function Bf(e, t) {
  let r = document.createElement("canvas");
  r.width = al, r.height = il;
  let n = r.getContext("2d"),
    o = Vf(r),
    a = new Le.MeshBasicMaterial({
      map: o,
      transparent: !0,
      depthWrite: !1,
      fog: !1
    }),
    s = Wf(a, t),
    i = e.inner + e.thickness / 2,
    l = al / il * e.thickness / i,
    p = SE(e.inner, e.inner + e.thickness, l),
    m = new Le.Group();
  m.name = "portal-sign";
  for (let y of [0, Math.PI]) {
    let b = new Le.Mesh(p, a);
    b.rotation.y = y, b.renderOrder = 10, m.add(b);
  }
  let E = "";
  return {
    object: m,
    set(y) {
      let b = JSON.stringify(y);
      b !== E && (E = b, RE(n, y), o.needsUpdate = !0);
    },
    syncTone(y) {
      et(s, y);
    },
    setOpacity(y) {
      a.opacity = y, m.visible = y > .01;
    },
    dispose() {
      p.dispose(), o.dispose(), a.dispose();
    }
  };
}
var Ua = `
float pwHash( vec2 p ) {
  p = fract( p * vec2( 123.34, 456.21 ) );
  p += dot( p, p + 45.32 );
  return fract( p.x * p.y );
}

float pwNoise( vec2 p ) {
  vec2 i = floor( p );
  vec2 f = fract( p );
  vec2 u = f * f * ( 3.0 - 2.0 * f );
  return mix(
    mix( pwHash( i ), pwHash( i + vec2( 1.0, 0.0 ) ), u.x ),
    mix( pwHash( i + vec2( 0.0, 1.0 ) ), pwHash( i + vec2( 1.0, 1.0 ) ), u.x ),
    u.y
  );
}

float pwFbm( vec2 p ) {
  float v = 0.0;
  float a = 0.5;
  const mat2 m = mat2( 1.6, 1.2, -1.2, 1.6 );
  for ( int i = 0; i < 4; i++ ) {
    v += a * pwNoise( p );
    p = m * p;
    a *= 0.5;
  }
  return v;
}
`,
  Ka = `
float portalOpeningSdf( vec2 p, float radius, float shape ) {
  if ( shape < 0.5 ) return length( p ) - radius;
  float w = radius * ${.74.toFixed(4)};
  float topY = radius - w;
  float circle = length( p - vec2( 0.0, topY ) ) - w;
  float boxCenterY = ( topY - radius ) * 0.5;
  float boxHalfHeight = ( topY + radius ) * 0.5;
  vec2 q = vec2( abs( p.x ) - w, abs( p.y - boxCenterY ) - boxHalfHeight );
  float box = length( max( q, 0.0 ) ) + min( max( q.x, q.y ), 0.0 );
  return min( circle, box );
}
`,
  ja = `
vec3 portalSwirl( vec2 p, float t, vec3 accent, vec3 accent2 ) {
  float r = length( p );
  float a = atan( p.y, p.x );
  // Log-polar twist: the field rotates faster toward the eye.
  float twist = a + 1.35 * log( r + 0.06 ) * -1.0 + t * 0.55;
  vec2 q = vec2( cos( twist ), sin( twist ) ) * ( 0.35 + r * 1.4 );
  vec2 warp = vec2( pwFbm( q * 1.7 + vec2( t * 0.11, 0.0 ) ), pwFbm( q * 1.7 + vec2( 5.2, -t * 0.09 ) ) );
  float n = pwFbm( q * 2.6 + warp * 2.4 + vec2( 0.0, -t * 0.35 ) );
  float arms = 0.5 + 0.5 * sin( a * 3.0 - 7.0 * log( r + 0.05 ) - t * 2.1 + n * 4.0 );
  float energy = smoothstep( 0.42, 0.95, n * 0.75 + arms * 0.5 );
  vec3 deep = accent * 0.05 + vec3( 0.008, 0.01, 0.025 );
  vec3 col = mix( deep, accent2 * 0.55, smoothstep( 0.25, 0.75, n ) );
  col = mix( col, accent * 1.1, energy * 0.85 );
  col += mix( accent, vec3( 1.0 ), 0.65 ) * pow( energy, 5.0 ) * 0.9;
  // The bright eye the arms pour into.
  float eye = exp( -r * r * 10.0 );
  col = mix( col, mix( accent, vec3( 1.0 ), 0.75 ), eye * 0.85 );
  // Darken toward the rim so the frame's glow reads against it.
  col *= mix( 1.0, 0.55, smoothstep( 0.55, 1.0, r ) );
  return col;
}
`;
var On = 1.35,
  ME = 14,
  AE = 3,
  Df = [2.1, 3.4],
  zf = [26, 36],
  PE = 9,
  CE = .05,
  HE = .46,
  qa = "Mystery World",
  sl = 2.5,
  LE = 1.15,
  IE = .75,
  OE = .3,
  Uf = {
    circle: 0,
    arch: 1
  },
  NE = new Re.Color("#5d6270"),
  FE = new Re.Quaternion(),
  VE = new Re.Matrix4(),
  WE = new Re.Vector3(),
  GE = new Re.Vector3(),
  BE = `
varying vec3 vWorldPos;
varying vec2 vLocal;
void main() {
  vLocal = position.xy;
  vec4 world = modelMatrix * vec4( position, 1.0 );
  vWorldPos = world.xyz;
  gl_Position = projectionMatrix * viewMatrix * world;
}
`,
  DE = `
uniform float uTime;
uniform float uRadius;
uniform float uShape;
uniform vec3 uAccent;
uniform vec3 uAccent2;
uniform float uSwirl;
uniform float uCover;
uniform float uDim;
uniform float uLoading;
uniform float uIris;
uniform float uGlow;
uniform sampler2D uCoverMap;
uniform vec2 uCoverScale;
uniform mat3 uWorldToPortal;
uniform float uCeiling;
varying vec3 vWorldPos;
varying vec2 vLocal;
${Ua}
${Ka}
${ja}
${yt}

void main() {
  float sd = portalOpeningSdf( vLocal, uRadius, uShape );
  float aa = max( fwidth( sd ), 1e-4 );
  float inside = 1.0 - smoothstep( -aa, aa, sd );
  float ang = atan( vLocal.y, vLocal.x );
  float irisRadius = uIris * uRadius * 1.65;
  // Sampled on a circle, so the wobble has no seam where atan wraps.
  vec2 around = vec2( cos( ang ), sin( ang ) ) * 1.7;
  float wobble = ( pwNoise( around + uTime * 1.3 ) - 0.5 ) * 0.3 * irisRadius * ( 1.0 - uIris );
  float irisD = length( vLocal ) - irisRadius - wobble;
  float iris = 1.0 - smoothstep( -aa * 1.5, aa * 1.5, irisD );
  float alpha = inside * iris;
  if ( alpha < 0.002 ) discard;

  vec2 p = vLocal / uRadius;
  float depthIn = max( -sd, 0.0 ) / uRadius;
  float rimBand = exp( -depthIn * 18.0 );
  vec3 glowColor = mix( uAccent, vec3( 1.0 ), 0.3 );
  vec3 color;

  if ( !gl_FrontFacing ) {
    // From behind the portal is a closed membrane: no view, a slow dim swirl.
    color = portalSwirl( vec2( -p.x, p.y ), uTime * 0.6, uAccent * 0.45, uAccent2 * 0.35 ) * 0.6;
    color += glowColor * rimBand * 0.5;
    float luma = dot( color, vec3( 0.2126, 0.7152, 0.0722 ) );
    color = mix( color, vec3( luma * 0.05 ), uDim );
  } else {
    vec3 view = normalize( vWorldPos - cameraPosition );
    vec3 local = uWorldToPortal * view;
    float facing = abs( local.z );
    float lens = exp( -depthIn * 6.0 );
    color = vec3( 0.0 );

    // Each look is only evaluated while it has weight (uniform branches).
    if ( uCover > 0.001 ) {
      // Set back behind the surface, so it slides against the rim.
      vec2 parallax = local.xy / max( facing, 0.35 ) * 0.07;
      vec2 coverUv = clamp( p * 0.5 * uCoverScale + 0.5 + parallax, 0.0, 1.0 );
      vec3 cover = texture2D( uCoverMap, coverUv ).rgb;
      cover *= mix( 1.0, 0.35, smoothstep( 0.35, 1.05, length( p ) ) );
      color += cover * uCover;
    }
    if ( uSwirl > 0.001 ) color += portalSwirl( p, uTime, uAccent, uAccent2 ) * uSwirl;
    color /= max( uSwirl + uCover, 1e-3 );

    // Loading: a bright arc chasing the rim, and a pulse riding outward.
    if ( uLoading > 0.001 ) {
      float a01 = fract( ang / 6.28318 - uTime * 0.6 );
      float arc = smoothstep( 0.0, 0.5, a01 ) * smoothstep( 0.62, 0.5, a01 );
      float band = exp( -pow( ( depthIn - 0.08 ) / 0.035, 2.0 ) );
      float pulseR = fract( uTime * 0.7 );
      float pulse = exp( -pow( ( length( p ) - pulseR ) / 0.05, 2.0 ) ) * ( 1.0 - pulseR );
      color += mix( uAccent, vec3( 1.0 ), 0.55 ) * ( arc * band * 1.6 + pulse * 0.4 ) * uLoading;
    }

    // Rim light: fresnel-weighted and brighter as the traveller approaches.
    float fresnel = pow( 1.0 - facing, 3.0 );
    float rimLine = exp( -depthIn * 60.0 );
    color += glowColor * ( rimLine * 0.9 + rimBand * ( 0.25 + 0.45 * uGlow ) + fresnel * 0.25 * lens );

    // The iris edge while opening or closing.
    float irisEdge = exp( -pow( irisD / ( 0.05 * uRadius ), 2.0 ) ) * ( 1.0 - smoothstep( 0.85, 1.0, uIris ) );
    color += mix( uAccent, vec3( 1.0 ), 0.6 ) * irisEdge * 1.6;

    // Unavailable: drained and dark.
    float luma = dot( color, vec3( 0.2126, 0.7152, 0.0722 ) );
    color = mix( color, vec3( luma * 0.07 ) + vec3( 0.006, 0.007, 0.012 ), uDim );
  }

  gl_FragColor = vec4( portalOutput( color, uCeiling ), alpha );
  #include <colorspace_fragment>
}
`,
  Ya = null;
function ll() {
  return Ya || (Ya = new Re.DataTexture(new Uint8Array([0, 0, 0, 255]), 1, 1), Ya.needsUpdate = !0), Ya;
}
var go = class {
  spec;
  object = new Re.Group();
  center = new Re.Vector3();
  destination = null;
  state = "unresolved";
  lock = null;
  context;
  radius;
  frame;
  frameHolder = new Re.Group();
  customFrame;
  surface;
  uniforms;
  tone = bt();
  particles;
  label;
  accentTarget;
  accent;
  accent2 = new Re.Color();
  worldToPortal = new Re.Matrix3();
  facing = new Re.Vector3();
  cover = null;
  connected = null;
  unresolvedFor = 0;
  time = 0;
  glow = 0;
  openness = 1;
  openScale = 1;
  openIris = 1;
  burst = 0;
  anim = null;
  mix = {
    swirl: 1,
    cover: 0,
    dim: 0,
    loading: 0
  };
  disposed = !1;
  countdown = null;
  closingIn = null;
  constructor(t, r) {
    this.spec = t, this.context = r, this.radius = t.radius ?? On, this.accentTarget = $s(t.accent ?? r.accent), this.accent = this.accentTarget.clone(), el(this.accent, this.accent2), this.object.name = `portal:${t.id}`, this.object.position.set(...t.position), this.object.rotation.y = t.yaw, this.object.updateMatrixWorld(), this.center.set(0, .16 + this.radius, 0).applyMatrix4(this.object.matrixWorld), this.facing.set(Math.sin(t.yaw), 0, Math.cos(t.yaw));
    let n = .16 + this.radius;
    this.customFrame = typeof t.frame == "object" && t.frame !== null, this.frame = Of(t.frame, {
      radius: this.radius,
      accent: this.accent,
      renderer: r.renderer
    }), this.frameHolder.position.y = n, this.frame.object.position.y = -n, this.frameHolder.add(this.frame.object), this.object.add(this.frameHolder);
    let o = this.frame.shape,
      a = o === "arch" ? this.radius * .74 : this.radius,
      s = new Re.PlaneGeometry(a * 2.1, this.radius * 2.1);
    this.uniforms = {
      uTime: {
        value: 0
      },
      uRadius: {
        value: this.radius
      },
      uShape: {
        value: Uf[o]
      },
      uAccent: {
        value: this.accent
      },
      uAccent2: {
        value: this.accent2
      },
      uSwirl: {
        value: 1
      },
      uCover: {
        value: 0
      },
      uDim: {
        value: 0
      },
      uLoading: {
        value: 0
      },
      uIris: {
        value: 1
      },
      uGlow: {
        value: 0
      },
      uCoverMap: {
        value: ll()
      },
      uCoverScale: {
        value: new Re.Vector2(1, 1)
      },
      uWorldToPortal: {
        value: this.worldToPortal
      },
      uCeiling: {
        value: r.contentCeiling ?? pt
      },
      ...this.tone
    };
    let i = new Re.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: BE,
      fragmentShader: DE,
      side: Re.DoubleSide,
      transparent: !0,
      depthWrite: !0
    });
    if (this.surface = new Re.Mesh(s, i), this.surface.name = "portal-surface", this.surface.position.y = n, this.surface.renderOrder = 2, this.object.add(this.surface), this.particles = Mf(this.radius, void 0, r.contentCeiling), this.particles.object.position.y = n, this.particles.setAccent(this.accent), this.object.add(this.particles.object), this.customFrame) this.label = Gf(r.contentCeiling), this.label.object.position.y = t.labelHeight ?? this.frame.top + .12, this.object.add(this.label.object);else {
      let l = .16 + 2 * this.radius - a,
        p = n + (tl + rl / 2) * this.radius,
        m = t.kind === "spawned" ? Math.max(this.frame.top, p) : this.frame.top;
      this.label = Bf({
        inner: m - l + CE * this.radius,
        thickness: HE * this.radius
      }, r.contentCeiling), this.label.object.position.y = l - n, this.frameHolder.add(this.label.object);
    }
    this.refreshLabel();
  }
  setDestination(t) {
    let r = this.destination?.gameId ?? null;
    this.destination = t, r !== null && r !== (t?.gameId ?? null) && this.forgetView(), this.refreshLabel();
  }
  setLock(t) {
    this.lock = t, this.refreshLabel();
  }
  setState(t) {
    let r = this.state;
    t === "unresolved" && r !== "unresolved" && (this.unresolvedFor = 0), this.state = t, this.refreshLabel(), this.syncPresence(), r === "missing" && t !== "missing" && !this.customFrame && this.open();
  }
  setConnected(t) {
    this.connected = t, this.refreshLabel();
  }
  setCover(t) {
    this.cover = t, t && t.colorSpace !== Re.SRGBColorSpace && (t.colorSpace = Re.SRGBColorSpace, t.needsUpdate = !0), this.uniforms.uCoverMap.value = t ?? ll();
    let r = t?.image,
      n = r?.width && r?.height ? r.width / r.height : 1,
      o = this.frame.shape === "arch" ? .74 : 1,
      a = 1 / n,
      s = 1,
      i = o * a;
    i > 1 && (a /= i, s /= i), this.uniforms.uCoverScale.value.set(a * .86, s * .86);
  }
  setCountdown(t) {
    this.disposed || (this.countdown || (this.countdown = kf(this.radius, this.accent, this.context.contentCeiling), this.frameHolder.add(this.countdown.object)), this.countdown.set(t.fraction, t.seconds, t.closingIn !== null), t.closingIn !== this.closingIn && (this.closingIn = t.closingIn, this.refreshLabel()));
  }
  update(t, r, n, o = 1) {
    if (this.disposed) return;
    let a = Math.min(Math.max(t, 0), .1);
    this.time += a, this.state === "unresolved" && (this.unresolvedFor += a), this.object.updateWorldMatrix(!0, !1), this.center.set(0, .16 + this.radius, 0).applyMatrix4(this.object.matrixWorld);
    let s = this.object.getWorldQuaternion(FE);
    this.facing.set(0, 0, 1).applyQuaternion(s), this.worldToPortal.setFromMatrix4(VE.makeRotationFromQuaternion(s.invert()));
    let i = 1 - ut(AE, ME, this.distanceTo(n));
    this.glow = mu(this.glow, i, 4, a);
    let l = this.targetMix(),
      p = a / OE;
    for (let A of Object.keys(this.mix)) {
      let w = this.mix[A],
        C = l[A];
      this.mix[A] = w < C ? Math.min(C, w + p) : Math.max(C, w - p);
    }
    let m = 1 - Math.exp(-3 * a),
      E = this.state === "unavailable" || this.state === "locked" ? NE : this.accentTarget;
    this.accent.lerp(E, m), el(this.accent, this.accent2), this.stepAnimation(a);
    let y = this.uniforms;
    y.uTime.value = this.time;
    let b = A => A * A * (3 - 2 * A);
    y.uSwirl.value = b(this.mix.swirl), y.uCover.value = b(this.mix.cover), y.uDim.value = b(this.mix.dim), y.uLoading.value = b(this.mix.loading), y.uGlow.value = this.glow, et(this.tone, this.context.renderer);
    let R = this.context.renderer;
    this.frame.setAccent(this.accent), this.frame.update(this.time, this.glow, this.openness, R), this.particles.setAccent(this.accent);
    let v = this.burst > 0 ? 1 : this.openness;
    this.particles.update(this.time, this.glow, this.burst, v, R), this.countdown && (this.countdown.setAccent(this.accent), this.countdown.update(this.time, Ye(this.openness) * Ye(o), R));
    let T = r.getWorldPosition(WE),
      M = this.label.object.getWorldPosition(GE),
      H = T.distanceTo(M),
      h = ut(Df[0], Df[1], H) * (1 - ut(zf[0], zf[1], H)) * Ye(this.openness) * Ye(o) * (this.state === "missing" ? 0 : 1);
    this.label.setOpacity(h), this.label.setScale?.(Re.MathUtils.clamp(H / PE, 1, 1.8)), this.label.syncTone(R);
    let P = this.unresolvedFor - a < sl;
    this.state === "unresolved" && P && this.unresolvedFor >= sl && this.refreshLabel();
  }
  crossed(t, r) {
    if (this.state === "missing" || this.openness < .5) return !1;
    let n = Math.atan2(this.facing.x, this.facing.z);
    return Zs(this.center, n, this.frame.shape, this.radius, t, r);
  }
  distanceTo(t) {
    return _s(this.center, t);
  }
  open() {
    return this.animate("open", LE);
  }
  close() {
    return this.animate("close", IE);
  }
  warpSource() {
    return {
      center: this.center,
      facing: this.facing,
      radius: this.radius,
      shape: Uf[this.frame.shape],
      worldToPortal: this.worldToPortal,
      accent: this.accent,
      accent2: this.accent2
    };
  }
  dispose() {
    this.disposed || (this.disposed = !0, this.finishAnimation(), this.object.removeFromParent(), this.surface.geometry.dispose(), this.surface.material.dispose(), this.frame.dispose(), this.particles.dispose(), this.label.dispose(), this.countdown?.dispose());
  }
  targetMix() {
    let t = this.cover !== null,
      r = {
        swirl: 0,
        cover: 0,
        dim: 0,
        loading: 0
      },
      n = () => t ? {
        ...r,
        cover: 1
      } : {
        ...r,
        swirl: 1
      };
    switch (this.state) {
      case "unresolved":
      case "missing":
        return {
          ...r,
          swirl: 1
        };
      case "resolved":
      case "ready":
        return n();
      case "loading":
        return {
          ...n(),
          loading: 1
        };
      case "unavailable":
      case "locked":
        return {
          ...n(),
          dim: 1
        };
    }
  }
  forgetView() {
    this.cover = null, this.uniforms.uCoverMap.value = ll();
  }
  statusLine() {
    return this.state === "unavailable" ? "Unavailable" : this.state === "locked" ? this.lock ? Hd(this.lock) : Rn(null) : this.connected === !1 || this.connected === null && this.state === "unresolved" && this.unresolvedFor >= sl ? "Connect to travel" : this.closingIn !== null ? `Closing in ${this.closingIn}` : this.state === "unresolved" || this.state === "loading" ? "Opening\u2026" : "Walk in to travel";
  }
  refreshLabel() {
    let t = this.spec.accent ?? this.context.accent,
      r = this.spec.mystery === !0;
    this.label.set({
      title: r ? qa : this.destination?.name ?? this.lock?.name ?? "Portal",
      creator: r ? null : this.destination?.creator?.username ?? null,
      status: this.statusLine(),
      accent: `#${$s(t).getHexString()}`,
      dim: this.state === "unavailable" || this.state === "locked"
    });
  }
  animate(t, r) {
    return this.finishAnimation(), new Promise(n => {
      let o = {
        kind: t,
        t: 0,
        duration: r,
        resolve: n,
        timer: null
      };
      o.timer = setTimeout(() => {
        this.anim === o && (o.t = o.duration, this.applyAnimation(o), this.finishAnimation());
      }, (r + 1.5) * 1e3), this.anim = o, this.applyAnimation(o);
    });
  }
  stepAnimation(t) {
    let r = this.anim;
    r && (r.t = Math.min(r.duration, r.t + t), this.applyAnimation(r), r.t >= r.duration && this.finishAnimation());
  }
  applyAnimation(t) {
    let r = t.t / t.duration,
      n,
      o;
    t.kind === "open" ? (n = du(Ye(r / .82)), o = jr(Ye((r - .1) / .62)), this.burst = r < .7 ? Math.max(1e-4, r / .7) : 0, this.openness = r >= 1 ? 1 : Math.max(o, ut(.55, 1, r))) : (o = 1 - Qo(Ye(r / .55)), n = 1 - fu(Ye((r - .12) / .88)), this.burst = 0, this.openness = r >= 1 ? 0 : o);
    let a = Math.max(.001, n);
    this.frameHolder.scale.setScalar(a), this.openScale = a, this.openIris = o, this.uniforms.uIris.value = o, this.syncPresence();
  }
  syncPresence() {
    let t = this.state !== "missing";
    this.frameHolder.visible = this.openScale > .002 && (t || this.customFrame), this.surface.visible = t && this.openIris > .001, this.particles.setHidden(!t), t || this.label.setOpacity(0);
  }
  finishAnimation() {
    let t = this.anim;
    t && (this.anim = null, t.timer && clearTimeout(t.timer), this.burst = 0, t.resolve());
  }
};
function cl(e) {
  return e instanceof go ? e.warpSource() : null;
}
function Kf(e, t) {
  return new go(e, t);
}
var jf = "Under Construction",
  zE = "Explore Remix while this world is built";
function UE(e = On, t = e * 1.2) {
  let r = Math.max(t, e) + .35,
    n = .16 + 2 * e + .45,
    o = le.MathUtils.clamp(e * 2.2, 2.2, 3),
    a = o / 2 + .3,
    s = -1,
    i = p => s * (r + p),
    l = p => -s * (r + p);
  return {
    clear: r,
    side: s,
    post: {
      x: i(.5),
      z: .35,
      height: n,
      yaw: -s * .3
    },
    arm: {
      length: a + o / 2 + .12,
      signAt: a,
      chain: .3
    },
    sign: {
      width: o,
      height: o / 2
    },
    barricade: {
      x: l(1),
      z: .75,
      yaw: s * .25,
      width: 1.9
    },
    cones: [{
      x: l(.05),
      z: 1.35,
      yaw: .3,
      tipped: !1
    }, {
      x: l(2.05),
      z: 1.5,
      yaw: 1.1,
      tipped: !1
    }, {
      x: l(1.15),
      z: 2.05,
      yaw: 2.4,
      tipped: !0
    }, {
      x: i(.05),
      z: 1.4,
      yaw: .7,
      tipped: !1
    }, {
      x: i(1.95),
      z: 1.75,
      yaw: 2,
      tipped: !1
    }]
  };
}
function KE(e) {
  let r = (e.radius ?? On) * 1.2,
    n = e.frame;
  if (typeof n != "object" || n === null) return r;
  let o = new le.Box3(),
    a = new le.Box3();
  n.updateWorldMatrix(!0, !0);
  let s = n.matrixWorld.clone().invert(),
    i = new le.Matrix4();
  return n.traverse(l => {
    let p = l.geometry;
    p?.attributes?.position && (p.boundingBox || p.computeBoundingBox(), p.boundingBox && (a.copy(p.boundingBox).applyMatrix4(i.multiplyMatrices(s, l.matrixWorld)), o.union(a)));
  }), o.isEmpty() ? r : Math.max(r, Math.abs(o.min.x), Math.abs(o.max.x));
}
var Ke = {
    yellow: "#ffc93c",
    ink: "#16181f",
    orange: "#ff6b1a",
    white: "#f5f3ee",
    steel: "#3b404d",
    lamp: "#ffab24"
  },
  Qa = 'system-ui, -apple-system, "Segoe UI", Inter, Roboto, "Helvetica Neue", sans-serif';
function qf(e, t) {
  let r = UE(e.radius ?? On, KE(e)),
    n = new le.Group();
  n.name = "construction-site";
  let o = [],
    a = [],
    s = [],
    i = J => (J instanceof le.BufferGeometry ? o.push(J) : J instanceof le.Material ? a.push(J) : s.push(J), J),
    l = (J, Z = {}) => i(new le.MeshStandardMaterial({
      color: J,
      roughness: .62,
      metalness: .05,
      ...Z
    })),
    p = new le.Quaternion(),
    m = new le.Euler(),
    E = (J, Z, X = [0, 0, 0]) => new le.Matrix4().compose(new le.Vector3(...J), p.setFromEuler(m.set(...X)).clone(), new le.Vector3(...Z)),
    {
      side: y,
      post: b,
      arm: R,
      sign: v,
      barricade: T
    } = r,
    M = new le.Matrix4().compose(new le.Vector3(b.x, 0, b.z), new le.Quaternion().setFromAxisAngle(new le.Vector3(0, 1, 0), b.yaw), new le.Vector3(1, 1, 1)),
    H = J => new le.Matrix4().multiplyMatrices(M, J),
    h = b.height - .06,
    P = [{
      matrix: H(E([0, b.height / 2, 0], [.12, b.height, .12])),
      color: Ke.steel
    }, {
      matrix: H(E([0, .04, 0], [.5, .08, .5])),
      color: Ke.steel
    }, {
      matrix: H(E([y * R.length / 2, h, 0], [R.length, .1, .1])),
      color: Ke.steel
    }, {
      matrix: H(E([y * .32, h - .32, 0], [.9, .06, .06], [0, 0, y * Math.PI / 4])),
      color: Ke.steel
    }],
    A = new le.Matrix4().compose(new le.Vector3(T.x, 0, T.z), new le.Quaternion().setFromAxisAngle(new le.Vector3(0, 1, 0), T.yaw), new le.Vector3(1, 1, 1)),
    w = J => new le.Matrix4().multiplyMatrices(A, J),
    C = T.width / 2 - .16;
  for (let J of [-1, 1]) P.push({
    matrix: w(E([J * C, .6, 0], [.09, 1.2, .09])),
    color: Ke.white
  }, {
    matrix: w(E([J * C, .03, 0], [.14, .06, .62])),
    color: Ke.steel
  });
  let k = i(new le.BoxGeometry(1, 1, 1)),
    W = new le.InstancedMesh(k, l("#ffffff"), P.length),
    L = new le.Color();
  P.forEach((J, Z) => {
    W.setMatrixAt(Z, J.matrix), W.setColorAt(Z, L.set(J.color));
  }), W.castShadow = !0, W.receiveShadow = !0, n.add(W);
  let K = i(jE());
  K.repeat.set(6, 1);
  let D = new le.InstancedMesh(k, l("#ffffff", {
    map: K,
    roughness: .5
  }), 2);
  [.52, .94].forEach((J, Z) => {
    D.setMatrixAt(Z, w(E([0, J, .06], [T.width, .22, .05])));
  }), D.castShadow = !0, n.add(D);
  let N = l(Ke.lamp, {
      emissive: Ke.lamp,
      emissiveIntensity: 1
    }),
    g = new le.InstancedMesh(i(new le.SphereGeometry(.075, 14, 10)), N, 2);
  g.setMatrixAt(0, w(E([-y * C, 1.27, 0], [1, 1, 1]))), g.setMatrixAt(1, H(E([0, b.height + .07, 0], [1, 1, 1]))), n.add(g);
  let S = i(ZE()),
    I = new le.InstancedMesh(S, l("#ffffff", {
      vertexColors: !0,
      roughness: .5
    }), r.cones.length);
  r.cones.forEach((J, Z) => {
    let X = J.tipped ? E([J.x, .185, J.z], [1, 1, 1], [0, J.yaw, Math.PI / 2 + .22]) : E([J.x, 0, J.z], [1, 1, 1], [0, J.yaw, 0]);
    I.setMatrixAt(Z, X);
  }), I.castShadow = !0, I.receiveShadow = !0, n.add(I);
  let F = new le.Group();
  F.applyMatrix4(H(new le.Matrix4().makeTranslation(y * R.signAt, h - .05, 0))), n.add(F);
  let z = new le.Group();
  F.add(z);
  let U = -(R.chain + v.height / 2),
    Q = new le.Mesh(i(new le.BoxGeometry(v.width + .08, v.height + .08, .05)), l(Ke.ink, {
      roughness: .45
    }));
  Q.position.y = U, Q.castShadow = !0, z.add(Q);
  let $ = i(YE(t.accent, y));
  t.renderer && ($.anisotropy = t.renderer.capabilities.getMaxAnisotropy());
  let ie = new le.Mesh(i(JE(v.width, v.height, .032)), l("#ffffff", {
    map: $,
    emissive: "#ffffff",
    emissiveMap: $,
    emissiveIntensity: .28,
    roughness: .55
  }));
  ie.position.y = U, z.add(ie);
  let _ = new le.InstancedMesh(k, W.material, 2);
  for (let [J, Z] of [-1, 1].entries()) _.setMatrixAt(J, E([Z * v.width / 2.6, -R.chain / 2, 0], [.03, R.chain + .04, .03])), _.setColorAt(J, L.set(Ke.steel));
  z.add(_);
  for (let J of [W, D, g, I, _]) J.instanceMatrix.needsUpdate = !0, J.computeBoundingSphere();
  return {
    root: n,
    update(J) {
      z.rotation.x = Math.sin(J * 1.3) * .035 + Math.sin(J * .53) * .02, z.rotation.z = Math.sin(J * .8 + 1.1) * .012, N.emissiveIntensity = J % 1.1 < .55 ? 2.4 : .12;
    },
    dispose() {
      n.removeFromParent();
      for (let J of o) J.dispose();
      for (let J of a) J.dispose();
      for (let J of s) J.dispose();
    }
  };
}
function jE() {
  let e = document.createElement("canvas");
  e.width = 128, e.height = 64;
  let t = e.getContext("2d");
  t.fillStyle = Ke.white, t.fillRect(0, 0, 128, 64), t.fillStyle = Ke.orange;
  for (let n of [-64, 0, 64, 128]) t.beginPath(), t.moveTo(n, 64), t.lineTo(n + 32, 64), t.lineTo(n + 96, 0), t.lineTo(n + 64, 0), t.closePath(), t.fill();
  let r = new le.CanvasTexture(e);
  return r.colorSpace = le.SRGBColorSpace, r.wrapS = le.RepeatWrapping, r;
}
function YE(e, t) {
  let o = document.createElement("canvas");
  o.width = 1024, o.height = 512 * 2;
  let a = o.getContext("2d");
  Yf(a, 0, 1024, 512, t < 0 ? "right" : "left", e), Yf(a, 512, 1024, 512, t < 0 ? "left" : "right", e);
  let s = new le.CanvasTexture(o);
  return s.colorSpace = le.SRGBColorSpace, s;
}
function Yf(e, t, r, n, o, a) {
  e.save(), e.translate(0, t), e.fillStyle = Ke.ink, e.fillRect(0, 0, r, n);
  let s = 10;
  XE(e, s, s, r - s * 2, n - s * 2, 34), e.save(), e.clip(), e.fillStyle = Ke.yellow, e.fillRect(0, 0, r, n);
  let i = 46;
  for (let k of [s, n - s - i]) {
    e.fillStyle = Ke.ink, e.fillRect(0, k, r, i), e.fillStyle = Ke.yellow;
    for (let W = -i * 2; W < r + i; W += i * 1.6) e.beginPath(), e.moveTo(W, k + i), e.lineTo(W + i * .8, k + i), e.lineTo(W + i * 1.6, k), e.lineTo(W + i * .8, k), e.closePath(), e.fill();
  }
  e.restore();
  let l = 56;
  e.fillStyle = Ke.ink, e.textAlign = "center", e.textBaseline = "alphabetic";
  let p = qE(e, jf, 800, 132, r - l * 2);
  e.fillText(jf, r / 2, s + i + 26 + p * .8);
  let m = 44,
    E = 26,
    y = 66;
  e.font = `650 ${y}px ${Qa}`;
  let b = QE(e, zE),
    R = Math.max(...b.map(k => e.measureText(k).width)),
    v = m * 2 + E + R,
    T = Math.min(1, (r - l * 2) / v),
    M = y * 1.12 * T,
    H = 306,
    h = (r - v * T) / 2,
    P = h + m * T,
    A = H - y * .35 * T + (b.length - 1) * M / 2;
  e.beginPath(), e.arc(P, A, m * T, 0, Math.PI * 2), e.fillStyle = Ke.ink, e.fill(), e.lineWidth = 6 * T, e.strokeStyle = a, e.stroke();
  let w = o === "left" ? -1 : 1,
    C = m * T;
  e.beginPath(), e.moveTo(P - w * C * .4, A), e.lineTo(P + w * C * .42, A), e.moveTo(P + w * C * .06, A - C * .36), e.lineTo(P + w * C * .42, A), e.lineTo(P + w * C * .06, A + C * .36), e.lineWidth = 8 * T, e.lineCap = "round", e.lineJoin = "round", e.strokeStyle = Ke.yellow, e.stroke(), e.fillStyle = Ke.ink, e.textAlign = "left", e.font = `650 ${y * T}px ${Qa}`, b.forEach((k, W) => {
    e.fillText(k, h + (m * 2 + E) * T, H + W * M);
  }), e.restore();
}
function qE(e, t, r, n, o) {
  let a = n;
  for (e.font = `${r} ${a}px ${Qa}`; a > 40 && e.measureText(t).width > o;) a -= 2, e.font = `${r} ${a}px ${Qa}`;
  return a;
}
function QE(e, t) {
  let r = t.split(" "),
    n = [t],
    o = Number.POSITIVE_INFINITY;
  for (let a = 1; a < r.length; a++) {
    let s = [r.slice(0, a).join(" "), r.slice(a).join(" ")],
      i = Math.max(...s.map(l => e.measureText(l).width));
    i < o && (n = s, o = i);
  }
  return n;
}
function XE(e, t, r, n, o, a) {
  e.beginPath(), e.moveTo(t + a, r), e.arcTo(t + n, r, t + n, r + o, a), e.arcTo(t + n, r + o, t, r + o, a), e.arcTo(t, r + o, t, r, a), e.arcTo(t, r, t + n, r, a), e.closePath();
}
function JE(e, t, r) {
  let n = e / 2,
    o = t / 2,
    a = [-n, -o, r, n, -o, r, n, o, r, -n, o, r, n, -o, -r, -n, -o, -r, -n, o, -r, n, o, -r],
    s = [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1],
    i = [0, .5, 1, .5, 1, 1, 0, 1, 0, 0, 1, 0, 1, .5, 0, .5],
    l = new le.BufferGeometry();
  return l.setAttribute("position", new le.Float32BufferAttribute(a, 3)), l.setAttribute("normal", new le.Float32BufferAttribute(s, 3)), l.setAttribute("uv", new le.Float32BufferAttribute(i, 2)), l.setIndex([0, 1, 2, 0, 2, 3, 4, 5, 6, 4, 6, 7]), l;
}
function ZE() {
  let e = new le.Color(Ke.orange),
    t = new le.Color(Ke.white),
    r = [[.001, .05, e], [.155, .05, e], [.118, .26, e], [.118, .26, t], [.086, .4, t], [.086, .4, e], [.028, .62, e], [.001, .625, e]],
    n = 16,
    o = new le.LatheGeometry(r.map(([m, E]) => new le.Vector2(m, E)), n),
    a = [];
  for (let m = 0; m <= n; m++) for (let [,, E] of r) a.push(E.r, E.g, E.b);
  o.setAttribute("color", new le.Float32BufferAttribute(a, 3));
  let s = new le.BoxGeometry(.38, .05, .38).translate(0, .025, 0).toNonIndexed(),
    i = [];
  for (let m = 0; m < s.attributes.position.count; m++) i.push(e.r * .8, e.g * .8, e.b * .8);
  s.setAttribute("color", new le.Float32BufferAttribute(i, 3));
  let l = o.toNonIndexed(),
    p = new le.BufferGeometry();
  for (let m of ["position", "normal", "color"]) {
    let E = l.attributes[m],
      y = s.attributes[m],
      b = new Float32Array(E.array.length + y.array.length);
    b.set(E.array, 0), b.set(y.array, E.array.length), p.setAttribute(m, new le.BufferAttribute(b, E.itemSize));
  }
  return o.dispose(), s.dispose(), l.dispose(), p;
}
import * as Te from "./001-three-a973dc20bf0957e55145ef9e6b9c97d50275b224b1d81a57603249dd6750ab96.js";
var Qf = .45,
  _E = .4,
  $E = 16,
  Xf = 14;
function bo() {
  try {
    return globalThis.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? !1;
  } catch {
    return !1;
  }
}
var ev = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4( position.xy, 0.0, 1.0 );
}
`,
  tv = `
uniform int uMode;
uniform float uFullScreen;
uniform float uTime;
uniform float uAspect;
uniform vec2 uTanHalf;
uniform mat3 uCamRot;
uniform mat3 uWorldToPortal;
uniform vec3 uCamPos;
uniform vec3 uPortalCenter;
uniform vec3 uPortalFacing;
uniform float uRadius;
uniform float uShape;
uniform float uGrow;
uniform float uReveal;
uniform float uCover;
uniform float uTint;
uniform float uStreaks;
uniform float uStreakWidth;
uniform float uClock;
uniform vec3 uAccent;
uniform vec3 uAccent2;
uniform vec3 uTintColor;
varying vec2 vUv;
${Ua}
${Ka}
${ja}
${Su}
${yt}

/** three's sRGB transfer pair (colorspace_fragment), so encoded-space maths round-trips exactly. */
vec3 pwEncode( vec3 c ) {
  c = max( c, 0.0 );
  return mix( pow( c, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), c * 12.92, vec3( lessThanEqual( c, vec3( 0.0031308 ) ) ) );
}
vec3 pwDecode( vec3 e ) {
  e = max( e, 0.0 );
  return mix( pow( e * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), e * 0.0773993808, vec3( lessThanEqual( e, vec3( 0.04045 ) ) ) );
}

/** The eye's world-space ray through a screen point. */
vec3 rayAt( vec2 ndc ) {
  return normalize( uCamRot * vec3( ndc * uTanHalf, -1.0 ) );
}

void main() {
  vec2 ndc = vUv * 2.0 - 1.0;
  vec2 q = ndc * vec2( uAspect, 1.0 );
  // The cruise, shared by both modes, in encoded space: edges lean toward the
  // cruise tint (the same at both ends) and streaks add light.
  float tint = uTint * smoothstep( 0.45, 1.7, length( q ) );
  vec3 tintE = pwEncode( uTintColor * 0.6 );
  vec3 streakE = uStreaks > 0.001
    ? pwEncode( mix( uTintColor, vec3( 1.0 ), 0.55 ) ) * cruiseStreaks( q, uClock, uStreakWidth ) * uStreaks * 1.1
    : vec3( 0.0 );
  vec3 E;
  float alpha;

  if ( uMode == 2 ) {
    // \u2500\u2500 Arrival: the cruise over this world's live render, settling \u2500\u2500
    E = tintE * tint + streakE;
    alpha = tint;
  } else {
    // \u2500\u2500 Warp: the camera's own ray, through the growing opening \u2500\u2500
    vec3 worldDir = rayAt( ndc );
    float denom = dot( worldDir, uPortalFacing );
    float along = dot( uPortalCenter - uCamPos, uPortalFacing );
    float t = along / ( abs( denom ) < 1e-5 ? -1e-5 : denom );
    bool hits = denom < 0.0 && t > 0.0;
    vec3 hit = uCamPos + worldDir * t;
    vec2 local = ( uWorldToPortal * ( hit - uPortalCenter ) ).xy;
    float grown = uRadius * uGrow;
    float sd = hits ? portalOpeningSdf( local, grown, uShape ) : grown;
    float feather = grown * 0.08 + 0.01;
    float inside = uFullScreen > 0.5 ? 1.0 : 1.0 - smoothstep( -feather, 0.0, sd );

    vec2 p = mix( hits ? local / uRadius : q, q * 0.9, uCover );
    vec3 dest = portalSwirl( p, uTime, uAccent, uAccent2 );

    float edge = hits && uFullScreen < 0.5 ? exp( -pow( sd / ( feather * 1.6 ), 2.0 ) ) * ( 1.0 - uCover ) * uReveal : 0.0;
    float baseAlpha = max( inside * uReveal, uCover );
    float glowAlpha = edge * 0.9;
    vec3 destE = mix( pwEncode( dest ), tintE, tint ) + streakE;
    E = destE * baseAlpha + pwEncode( mix( uAccent, vec3( 1.0 ), 0.45 ) ) * glowAlpha * ( 1.0 - baseAlpha * 0.5 );
    alpha = clamp( baseAlpha + glowAlpha * ( 1.0 - baseAlpha ), 0.0, 1.0 );
  }

  if ( alpha < 0.002 && max( E.r, max( E.g, E.b ) ) < 0.002 ) discard;
  gl_FragColor = vec4( portalOutput( pwDecode( E ), ${pt.toFixed(1)} ), alpha );
  #include <colorspace_fragment>
}
`,
  Jf = new Te.Matrix4(),
  rv = new Te.Vector3(0, 1, 0);
function nv(e, t, r) {
  let n = new Te.Vector3(Math.sin(e) * Math.cos(t), -Math.sin(t), Math.cos(e) * Math.cos(t));
  return r.setFromRotationMatrix(Jf.lookAt(new Te.Vector3(), n, rv));
}
var ul = class {
  renderer;
  scene = new Te.Scene();
  camera = new Te.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  material;
  quad;
  tone = bt();
  uniforms;
  size = new Te.Vector2(1, 1);
  virtual = new Te.PerspectiveCamera(or, 1, .05, 100);
  clock;
  phase = "idle";
  flight = null;
  reverse = null;
  arrival = null;
  time = 0;
  constructor(t, r = wu) {
    this.renderer = t, this.clock = r, this.uniforms = {
      uMode: {
        value: 0
      },
      uFullScreen: {
        value: 0
      },
      uTime: {
        value: 0
      },
      uAspect: {
        value: 1
      },
      uTanHalf: {
        value: new Te.Vector2(1, 1)
      },
      uCamRot: {
        value: new Te.Matrix3()
      },
      uCamPos: {
        value: new Te.Vector3()
      },
      uPortalCenter: {
        value: new Te.Vector3()
      },
      uPortalFacing: {
        value: new Te.Vector3(0, 0, 1)
      },
      uWorldToPortal: {
        value: new Te.Matrix3()
      },
      uRadius: {
        value: 1.35
      },
      uShape: {
        value: 0
      },
      uGrow: {
        value: 1
      },
      uReveal: {
        value: 0
      },
      uCover: {
        value: 0
      },
      uTint: {
        value: 0
      },
      uStreaks: {
        value: 0
      },
      uStreakWidth: {
        value: 1
      },
      uClock: {
        value: 0
      },
      uAccent: {
        value: new Te.Color("#b6ff00")
      },
      uAccent2: {
        value: new Te.Color()
      },
      uTintColor: {
        value: new Te.Color("#b6ff00")
      },
      ...this.tone
    }, this.material = new Te.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: ev,
      fragmentShader: tv,
      transparent: !0,
      premultipliedAlpha: !0,
      depthTest: !1,
      depthWrite: !1
    }), this.quad = new Te.Mesh(new Te.PlaneGeometry(2, 2), this.material), this.quad.frustumCulled = !1, this.scene.add(this.quad), globalThis.matchMedia?.("(pointer: coarse)").matches && Math.min(globalThis.screen?.width ?? Number.POSITIVE_INFINITY, globalThis.screen?.height ?? Number.POSITIVE_INFINITY) < 600 || t.compile(this.scene, this.camera);
  }
  get active() {
    return this.phase !== "idle";
  }
  get drivingCamera() {
    return this.phase === "warp" || this.phase === "cruise" || this.phase === "cancel";
  }
  get cruising() {
    return this.phase === "cruise";
  }
  warpIn(t) {
    this.settlePending();
    let {
        camera: r,
        portal: n
      } = t,
      o = cl(n),
      a = o ? o.facing.clone() : new Te.Vector3(Math.sin(n.spec.yaw), 0, Math.cos(n.spec.yaw)),
      s = n.center.clone(),
      i = r.position.clone(),
      l = new Te.Vector3(0, 0, -1).applyQuaternion(r.quaternion),
      p = Math.asin(Te.MathUtils.clamp(-l.y, -.99, .99)),
      m = nv(Math.atan2(-a.x, -a.z), p, new Te.Quaternion()),
      E = Math.max(.8, i.clone().sub(s).dot(a) * .55),
      y = s.clone().addScaledVector(a, E);
    y.y = Te.MathUtils.lerp(i.y, s.y, .7);
    let b = t.speed === void 0 ? os : Qn(t.speed),
      R = Ru(b, Qf, 2 * s.distanceTo(y)),
      v = bo(),
      T = l.dot(a) > .1;
    this.flight = {
      request: t,
      camera: r,
      from: i,
      fromQuaternion: r.quaternion.clone(),
      fromFov: r.fov,
      control: y,
      to: s,
      toQuaternion: m,
      facing: a,
      slope: R,
      reduced: v,
      fade: v || T,
      t: 0,
      cruise: 0,
      entered: !1
    }, this.setWarpUniforms(1, 0, 0, 0), this.phase = "warp";
  }
  settle() {
    this.settlePending(), this.flight = null, this.phase = "idle";
  }
  cancel() {
    let t = this.flight;
    if (!t || this.phase !== "warp" && this.phase !== "cruise") return this.reverse ? new Promise(o => this.chainReverse(o)) : Promise.resolve();
    let r = this.uniforms,
      n = this.phase === "cruise" && !t.reduced ? is(t.cruise) : 0;
    return new Promise(o => {
      let a = t.fade ? Jo : _E;
      this.reverse = {
        t: 0,
        duration: a,
        position: t.camera.position.clone(),
        quaternion: t.camera.quaternion.clone(),
        fov: t.camera.fov,
        grow: r.uGrow.value,
        cover: r.uCover.value,
        reveal: r.uReveal.value,
        level: n,
        resolve: o,
        timer: setTimeout(() => this.finishReverse(), (a + 1.5) * 1e3)
      }, this.phase = "cancel";
    });
  }
  arrive(t = ar * 1e3) {
    return this.arriveCruise({
      durationMs: t
    });
  }
  arriveCruise(t) {
    this.settlePending(), this.flight = null;
    let r = t.reduced ?? bo(),
      n = r ? Jo : Math.max(.05, (t.durationMs ?? ar * 1e3) / 1e3);
    return this.phase = "arrive", new Promise(o => {
      this.arrival = {
        t: 0,
        duration: n,
        reduced: r,
        clock0: null,
        resolve: o,
        timer: setTimeout(() => this.finishArrival(), (n + 1.5) * 1e3)
      };
    });
  }
  render(t) {
    if (this.phase === "idle") return;
    let r = Math.min(Math.max(t, 0), .1);
    this.time += r, this.draw(), this.advance(r);
  }
  step(t) {
    if (this.phase === "idle") return;
    let r = Math.min(Math.max(t, 0), .1);
    this.time += r, this.advance(r);
  }
  resize(t, r) {
    this.size.set(Math.max(1, t), Math.max(1, r));
  }
  dispose() {
    this.settle(), this.quad.geometry.dispose(), this.material.dispose();
  }
  setEye(t) {
    let r = this.uniforms;
    t.updateMatrixWorld();
    let n = Math.tan(Te.MathUtils.degToRad(t.fov) / 2) / (t.zoom || 1);
    r.uTanHalf.value.set(n * t.aspect, n), r.uCamRot.value.setFromMatrix4(t.matrixWorld), t.getWorldPosition(r.uCamPos.value);
  }
  virtualEye(t) {
    let r = this.virtual;
    return (r.aspect !== t || r.fov !== or) && (r.aspect = t, r.fov = or, r.updateProjectionMatrix()), r;
  }
  setLook(t) {
    let r = this.uniforms,
      n = yu(t);
    r.uTint.value = n.tint, r.uStreaks.value = n.streaks, r.uStreakWidth.value = n.streakWidth;
  }
  draw() {
    let t = this.uniforms,
      r = this.renderer;
    r.getDrawingBufferSize(this.size);
    let n = this.size.x / Math.max(1, this.size.y);
    t.uAspect.value = n, t.uTime.value = this.time, et(this.tone, r);
    let o = this.flight,
      a = this.arrival;
    if (this.phase === "arrive" && a) {
      t.uMode.value = 2, t.uFullScreen.value = 0, t.uTintColor.value.set(as), a.clock0 === null && (a.clock0 = ls(this.clock()));
      let i = a.t;
      this.setLook(a.reduced ? 0 : ss(i, a.duration)), t.uClock.value = xu(a.clock0, Zo(i, a.duration));
    } else if (o) {
      t.uMode.value = 1, t.uFullScreen.value = o.fade ? 1 : 0;
      let i = o.camera,
        l = cl(o.request.portal);
      if (t.uPortalCenter.value.copy(o.request.portal.center), t.uPortalFacing.value.copy(o.facing), l) t.uWorldToPortal.value.copy(l.worldToPortal), t.uRadius.value = l.radius, t.uShape.value = l.shape, t.uAccent.value.copy(l.accent), t.uAccent2.value.copy(l.accent2), t.uTintColor.value.set(as);else {
        let p = Jf.makeRotationY(-Math.atan2(o.facing.x, o.facing.z));
        t.uWorldToPortal.value.setFromMatrix4(p), t.uRadius.value = o.request.portal.spec.radius ?? 1.35, t.uShape.value = 0;
      }
      if (o.fade) {
        let p = this.virtualEye(i.aspect);
        p.position.copy(o.to), p.quaternion.copy(o.toQuaternion), this.setEye(p);
      } else this.setEye(i);
      t.uClock.value = ls(this.clock());
    } else return;
    let s = r.autoClear;
    r.autoClear = !1, r.render(this.scene, this.camera), r.autoClear = s;
  }
  advance(t) {
    this.phase === "warp" || this.phase === "cruise" ? this.advanceWarp(t) : this.phase === "cancel" ? this.advanceReverse(t) : this.phase === "arrive" && this.advanceArrival(t);
  }
  advanceWarp(t) {
    let r = this.flight;
    if (r) {
      if (this.phase === "cruise") {
        r.cruise += t;
        let n = r.reduced ? 0 : ns;
        this.setWarpUniforms(Xf, 1, 1, r.reduced ? 0 : is(r.cruise)), !r.entered && r.cruise >= n && (r.entered = !0, r.request.onCovered());
        return;
      }
      if (r.fade) r.t = Math.min(1, r.t + t / Jo), this.setWarpUniforms(1, 0, ut(0, 1, r.t), 0);else {
        r.t = Math.min(1, r.t + t / Qf);
        let n = r.t;
        this.poseCamera(r, n);
        let o = 1 + (Xf - 1) * Qo(ut(.22, 1, n));
        this.setWarpUniforms(o, ut(0, .28, n), ut(.78, 1, n), 0);
      }
      r.t >= 1 && (this.phase = "cruise", r.cruise = 0, r.reduced && (r.entered = !0, r.request.onCovered()));
    }
  }
  poseCamera(t, r) {
    let n = ku(r, t.slope),
      o = t.from,
      a = t.control,
      s = t.to,
      i = 1 - n;
    t.camera.position.set(i * i * o.x + 2 * i * n * a.x + n * n * s.x, i * i * o.y + 2 * i * n * a.y + n * n * s.y, i * i * o.z + 2 * i * n * a.z + n * n * s.z), t.camera.quaternion.copy(t.fromQuaternion).slerp(t.toQuaternion, jr(Ye(r / .8))), t.camera.fov = Te.MathUtils.lerp(t.fromFov, or, rs(r)) + $E * Math.sin(Math.PI * r) ** 1.5, t.camera.updateProjectionMatrix(), t.camera.updateMatrixWorld();
  }
  advanceReverse(t) {
    let r = this.reverse,
      n = this.flight;
    if (!r || !n) {
      this.finishReverse();
      return;
    }
    r.t = Math.min(1, r.t + t / r.duration);
    let o = r.t;
    if (!n.fade) {
      let a = rs(o),
        s = 1 - a,
        i = r.position,
        l = n.control,
        p = n.from,
        m = n.camera;
      m.position.set(s * s * i.x + 2 * s * a * l.x + a * a * p.x, s * s * i.y + 2 * s * a * l.y + a * a * p.y, s * s * i.z + 2 * s * a * l.z + a * a * p.z), m.quaternion.copy(r.quaternion).slerp(n.fromQuaternion, a), m.fov = Te.MathUtils.lerp(r.fov, n.fromFov, a), m.updateProjectionMatrix(), m.updateMatrixWorld();
    }
    this.setWarpUniforms(Te.MathUtils.lerp(r.grow, 1, jr(o)), r.reveal * (1 - ut(.45, 1, o)), r.cover * (1 - ut(0, n.fade ? 1 : .4, o)), r.level * (1 - ut(0, .5, o))), o >= 1 && this.finishReverse();
  }
  advanceArrival(t) {
    let r = this.arrival;
    r && (r.t = Math.min(r.duration, r.t + t), r.t >= r.duration && this.finishArrival());
  }
  setWarpUniforms(t, r, n, o) {
    let a = this.uniforms;
    a.uGrow.value = t, a.uReveal.value = r, a.uCover.value = n, this.setLook(o);
  }
  finishReverse() {
    let t = this.reverse,
      r = this.flight;
    r && (r.camera.position.copy(r.from), r.camera.quaternion.copy(r.fromQuaternion), r.camera.fov = r.fromFov, r.camera.updateProjectionMatrix(), r.camera.updateMatrixWorld()), this.reverse = null, this.flight = null, this.phase === "cancel" && (this.phase = "idle"), t && (clearTimeout(t.timer), t.resolve());
  }
  chainReverse(t) {
    let r = this.reverse;
    if (!r) {
      t();
      return;
    }
    let n = r.resolve;
    r.resolve = () => {
      n(), t();
    };
  }
  finishArrival() {
    let t = this.arrival;
    this.arrival = null, this.phase === "arrive" && (this.phase = "idle"), t && (clearTimeout(t.timer), t.resolve());
  }
  settlePending() {
    this.reverse && this.finishReverse(), this.arrival && this.finishArrival();
  }
};
function Zf(e, t) {
  return new ul(e, t);
}
var _f = Kf;
var $f = Zf;
import * as Ze from "./001-three-a973dc20bf0957e55145ef9e6b9c97d50275b224b1d81a57603249dd6750ab96.js";
var ov = 14,
  av = 22,
  iv = 2,
  sv = 3.5,
  yo = 10,
  lv = 5,
  Ja = 7,
  cv = 3,
  uv = 1.3,
  hl = 3,
  em = 16,
  pv = [0, -1e4, 0],
  dv = 3,
  fv = 10,
  tm = "random",
  rm = 1e3,
  nm = 75e3;
function sm(e, t) {
  let r = e === null ? Number.NaN : Date.parse(e);
  return Number.isFinite(r) ? t < r + rm ? r + rm : t < r + nm ? r + nm : null : null;
}
var mv = 1e4,
  hv = 10 * 6e4;
function gv(e, t) {
  let r = sm(e, t),
    n = e === null ? Number.NaN : Date.parse(e);
  return Number.isFinite(n) && t >= n && t < n + hv ? Math.min(r ?? Number.POSITIVE_INFINITY, t + mv) : r;
}
var ml = (e, t) => e === t.gameId || t.slug !== null && e === t.slug;
function bv(e, t, r, n = Math.random) {
  let o = e.filter(i => ![...t].some(l => ml(l, i))),
    a = o.filter(i => !r.has(i.gameId)),
    s = a.length > 0 ? a : o;
  return s.length === 0 ? null : s[Math.min(s.length - 1, Math.floor(n() * s.length))] ?? null;
}
function yv(e, t) {
  return e < ov ? t.preloading || t.failed || t.held ? "keep" : "preload" : e > av && (t.preloading || t.failed || t.held) ? "release" : "keep";
}
function Ev(e, t, r = dv) {
  let n = [...t].sort((s, i) => i.distance - s.distance),
    o = [],
    a = n.length;
  for (let s of n) {
    if (a < r) break;
    if (s.distance <= e) return null;
    o.push(s.gameId), a -= 1;
  }
  return a < r ? o : null;
}
var vv = .35,
  xv = .12;
function cr(e, t = new Ze.Vector3()) {
  return t.set(Math.sin(e), 0, Math.cos(e));
}
function Tv(e) {
  let t = Math.max(0, e);
  return {
    fraction: Math.min(1, t / yo),
    seconds: t,
    closingIn: t <= lv ? Math.max(1, Math.ceil(t - 1e-6)) : null
  };
}
var lm = 1.35,
  om = new Ze.Plane(),
  pl = new Ze.Vector3(),
  am = new Ze.Vector3();
function wv(e, t, r = t.spec.radius ?? lm) {
  cr(t.spec.yaw, pl), om.setFromNormalAndCoplanarPoint(pl, t.center);
  let n = pl.dot(e.direction);
  if (Math.abs(n) < 1e-4) return null;
  let o = -om.distanceToPoint(e.origin) / n;
  return o > 0 ? (e.at(o, am), am.distanceTo(t.center) <= r * uv ? o : null) : null;
}
var lr = new Ze.Vector3();
function kv(e, t) {
  if (t.updateMatrixWorld(), lr.copy(e).applyMatrix4(t.matrixWorldInverse), !(lr.z < -.001)) return !1;
  let r = t,
    o = Math.tan(Ze.MathUtils.degToRad((r.fov ?? 60) / 2)) * (r.aspect ?? 1);
  return Math.abs(lr.x) <= -lr.z * o;
}
var dl = new Ze.Vector3(),
  Xa = new Ze.Vector3(),
  im = new Ze.Vector3(),
  fl = new Ze.Vector3(),
  Rv = [[0, 0], [0, .6], [0, -.6], [-.6, 0], [.6, 0]];
function cm(e, t, r) {
  let n = e.spec.radius ?? lm;
  t.updateMatrixWorld(), t.getWorldPosition(dl);
  let o = e.spec.yaw;
  im.set(Math.cos(o), 0, -Math.sin(o));
  for (let [a, s] of Rv) {
    if (Xa.copy(e.center).addScaledVector(im, a * n).setY(e.center.y + s * n), lr.copy(Xa).applyMatrix4(t.matrixWorldInverse), !(lr.z < -.001) || (lr.copy(Xa).project(t), Math.abs(lr.x) > 1 || Math.abs(lr.y) > 1)) continue;
    fl.copy(Xa).sub(dl);
    let i = fl.length();
    if (!(i < .001) && !r(dl, fl.divideScalar(i), Math.max(0, i - .05))) return !0;
  }
  return !1;
}
function um(e, t, r) {
  let n = cr(e.spec.yaw),
    o = new Ze.Vector3(...e.spec.position),
    a = t.clone().sub(o).dot(n);
  return t.clone().addScaledVector(n, r - a);
}
function pm(e) {
  let t = [],
    r = new Map(),
    n = new Set(),
    o = new Map(),
    a = 0,
    s = null,
    i = null,
    l = 1,
    p = 1,
    m = null,
    E = null,
    y = !1,
    b = e.now ?? Date.now,
    R = e.loadCover ?? (d => {
      let c = new Ze.TextureLoader();
      return c.setCrossOrigin("anonymous"), c.loadAsync(d).then(u => (u.colorSpace = Ze.SRGBColorSpace, u));
    }),
    v = d => {
      let c = r.get(d);
      return c || (c = {
        preloading: !1,
        failed: !1,
        ready: !1,
        held: !1
      }, r.set(d, c)), c;
    },
    T = d => !d.closing,
    M = d => d.missing && d.fallback === "none",
    H = d => {
      if (M(d)) return "missing";
      if (d.lock) return "locked";
      let c = d.portal.destination;
      if (!c) return "unresolved";
      let u = r.get(c.gameId);
      return u?.failed ? "unavailable" : u?.ready || n.has(c.gameId) ? "ready" : u?.preloading ? "loading" : "resolved";
    },
    h = d => {
      let c = H(d);
      d.portal.state !== c && d.portal.setState(c);
    },
    P = d => T(d) && !M(d),
    A = d => {
      let c = !M(d);
      d.available !== c && (d.available = c, e.onAvailability?.(d.portal.spec.id, c));
    },
    w = d => {
      d.missing || (d.missing = !0, d.fallback = "seeking", d.stale = !1, h(d), console.warn(`[Portal Kit] portal "${d.portal.spec.id}": "${d.target}" is not a live portal world, so the portal leads to a random live world instead`));
    },
    C = d => {
      d.missing && (d.missing = !1, d.fallback = null, d.stale = !1, A(d));
    },
    k = d => {
      let c = o.get(d);
      return c || (c = R(d).catch(() => null), o.set(d, c)), c;
    },
    W = (d, c) => d === c || d !== null && c !== null && d.gameId === c.gameId && d.name === c.name && d.coverUrl === c.coverUrl && d.opensAt === c.opensAt && (d.bypass ?? null) === (c.bypass ?? null) && d.coins?.found === c.coins?.found && d.coins?.required === c.coins?.required && d.coins?.name === c.coins?.name,
    L = d => ({
      name: d.name,
      opensAt: d.opensAt,
      ...(d.coins ? {
        coins: d.coins
      } : {}),
      ...(d.bypass ? {
        bypass: d.bypass
      } : {})
    }),
    K = new Set(),
    D = (d, c) => {
      let u = d.lock;
      d.lock = c, d.lockCheckAt = c ? sm(c.opensAt, b()) : null;
      let {
        portal: x
      } = d;
      x.setLock?.(c ? L(c) : null), c || (d.bypassCard = null), !W(u, c) && (!c && !x.destination && x.setCover(null), c?.coverUrl && c.coverUrl !== u?.coverUrl && e.showsCovers?.() && k(c.coverUrl).then(O => {
        O && T(d) && d.lock?.coverUrl === c.coverUrl && !x.destination && x.setCover(O);
      }), h(d), d.lockHeard = !0, e.onLock?.(x.spec.id, c ? L(c) : null));
    },
    N = (d, c) => {
      let {
        portal: u
      } = d;
      u.setDestination(c), c && c.coverUrl && e.showsCovers?.() && k(c.coverUrl).then(x => {
        x && T(d) && u.destination?.gameId === c.gameId && u.setCover(x);
      }), h(d);
    },
    g = d => (t.push(d), e.scene.add(d.portal.object), h(d), d),
    S = (d, c, u) => {
      if (d.closing) return;
      d.closing = !0;
      let x = () => {
        e.scene.remove(d.portal.object), d.portal.dispose();
        let O = t.indexOf(d);
        O >= 0 && t.splice(O, 1), u?.();
      };
      c ? d.portal.close().then(x, x) : x();
    },
    I = d => S(d, !0),
    F = d => {
      d.left !== null && d.portal.setCountdown?.(Tv(d.left));
    },
    z = d => {
      let c = new Map();
      for (let u of t) {
        let x = u.portal.destination?.gameId ?? u.bypassCard?.gameId;
        if (!x || !T(u)) continue;
        let O = u.portal.distanceTo(d);
        c.set(x, Math.min(O, c.get(x) ?? Number.POSITIVE_INFINITY));
      }
      return c;
    },
    U = d => {
      let c = r.get(d);
      c && (c.preloading && e.link()?.release(d), c.preloading = !1, c.ready = !1, c.failed = !1, c.held = !1);
    },
    Q = d => e.inTrail?.(d) ?? !1,
    $ = (d, c) => {
      let u = e.link();
      if (!u || !e.connected() || d === e.selfGameId()) return;
      let x = v(d);
      if (!(x.preloading || x.failed)) {
        if (c && !Q(d)) {
          let O = z(c.feet),
            j = [];
          for (let [re, se] of r) re === d || !se.preloading || Q(re) || j.push({
            gameId: re,
            distance: O.get(re) ?? Number.POSITIVE_INFINITY
          });
          let Y = Ev(c.distance, j);
          if (!Y) return;
          for (let re of Y) U(re);
        }
        x.preloading = !0, u.preload(d);
      }
    },
    ie = (d, c, u, x, O = {}) => e.createPortal({
      id: d,
      kind: c,
      position: u,
      yaw: x,
      radius: O.radius,
      frame: O.frame,
      labelHeight: O.labelHeight,
      accent: e.renderContext.accent,
      ...(O.mystery ? {
        mystery: !0
      } : {})
    }, e.renderContext),
    _ = d => d.kind === "fixed" && T(d) && d.missing && (d.fallback !== "picked" || d.stale),
    J = async () => {
      if (!e.connected() || !t.some(_)) return;
      let d = [];
      try {
        d = (await (e.liveWorlds?.() ?? e.link()?.directory())) ?? [];
      } catch {}
      if (d.length === 0) {
        for (let u of t) u.fallback === "picked" && (u.stale = !1);
        return;
      }
      let c = e.selfGameId();
      for (let u of t.filter(_)) {
        if (!_(u)) continue;
        let x = new Set(c ? [c] : []),
          O = new Set();
        for (let Y of t) {
          if (Y === u || Y.kind !== "fixed" || !T(Y)) continue;
          let re = Y.portal.destination?.gameId;
          Y.missing ? Y.fallback === "picked" && !_(Y) && re && O.add(re) : (Y.target && x.add(Y.target), re && x.add(re), Y.lock && x.add(Y.lock.gameId));
        }
        let j = bv(d, x, O, e.random);
        u.stale = !1, j ? (u.fallback = "picked", u.portal.destination?.gameId !== j.gameId && N(u, j)) : (u.fallback !== "none" && console.warn(`[Portal Kit] portal "${u.portal.spec.id}": no other live portal world to lead to, so the portal is hidden`), u.fallback = "none", u.portal.destination && N(u, null)), h(u), A(u);
      }
    },
    Z = new Ze.Vector3(),
    X = new Ze.Vector3(0, -1, 0),
    B = {
      place(d) {
        let c = t.find(O => O.portal.spec.id === d.id);
        c && S(c, !1);
        let u = d.to === tm,
          x = g({
            portal: ie(d.id, "fixed", d.position, d.yaw, {
              ...d,
              mystery: u
            }),
            kind: "fixed",
            target: d.to,
            asked: u,
            missing: u,
            fallback: u ? "seeking" : null,
            stale: !1,
            available: !0,
            lock: null,
            lockCheckAt: null,
            bypassCard: null,
            lockHeard: !1,
            closing: !1,
            left: null
          });
        return c && !c.available && e.onAvailability?.(d.id, !0), e.connected() && B.resolveFixed(), x.portal;
      },
      spawn(d, c) {
        for (let se of t) se.kind === "spawned" && se.portal.destination?.gameId === d.gameId && S(se, !0);
        let u = t.filter(se => se.kind === "spawned" && T(se));
        for (; u.length >= iv;) {
          let se = u.shift();
          se && S(se, !0);
        }
        let x = cr(c.yaw).multiplyScalar(sv).add(c.feet);
        Z.set(x.x, c.feet.y + 2.5, x.z);
        let O = e.raycast(Z, X, 8),
          j = O ? O.point.y : c.feet.y;
        a += 1;
        let Y = g({
          portal: ie(`spawned-${a}`, "spawned", [x.x, j, x.z], c.yaw + Math.PI),
          kind: "spawned",
          target: null,
          asked: !0,
          missing: !1,
          fallback: null,
          stale: !1,
          available: !0,
          lock: null,
          lockCheckAt: null,
          bypassCard: null,
          lockHeard: !1,
          closing: !1,
          left: yo
        });
        N(Y, d), Y.portal.open(), F(Y);
        let re = v(d.gameId);
        return re.preloading || (re.held = !1), $(d.gameId, {
          distance: Y.portal.distanceTo(c.feet),
          feet: c.feet
        }), h(Y), Y.portal;
      },
      ensureReturn(d, c) {
        return s && T(s) ? (s.portal.destination !== d && N(s, d), s.portal) : (s = g({
          portal: ie(`return-${d.gameId}`, "return", c.position, c.yaw),
          kind: "return",
          target: null,
          asked: !0,
          missing: !1,
          fallback: null,
          stale: !1,
          available: !0,
          lock: null,
          lockCheckAt: null,
          bypassCard: null,
          lockHeard: !1,
          closing: !1,
          left: null
        }), N(s, d), s.portal);
      },
      get returnPortal() {
        return s && T(s) ? s.portal : null;
      },
      setDestination(d, c) {
        let u = t.find(x => x.portal === d);
        if (!(!u || !T(u))) {
          if (u.missing && !(u.target !== null && ml(u.target, c))) {
            u.fallback = "picked", u.stale = !1, d.destination !== c && N(u, c), A(u);
            return;
          }
          C(u), u.lock && D(u, null), K.add(c.gameId), d.destination !== c && N(u, c);
        }
      },
      openWayBack(d, c) {
        let u = t.find(x => T(x) && x.portal.spec.id === d);
        u?.lock && B.setDestination(u.portal, c);
      },
      byId(d) {
        return t.find(c => T(c) && c.portal.spec.id === d)?.portal;
      },
      all() {
        return t.filter(P).map(d => d.portal);
      },
      candidates() {
        let d = t.filter(u => T(u) && u !== s);
        return (s && T(s) ? [...d, s] : d).map(u => ({
          id: u.portal.spec.id,
          destinationGameId: u.portal.destination?.gameId ?? null,
          target: u.target
        }));
      },
      resolveFixed() {
        if (i) return i.then(() => B.resolveFixed());
        let d = e.link();
        if (!d || !e.connected()) return Promise.resolve();
        let c = t.filter(O => O.kind === "fixed" && !O.asked && T(O));
        if (c.length === 0) return J();
        for (let O of c) O.asked = !0;
        let u = [...new Set(c.map(O => O.target))],
          x = [];
        for (let O = 0; O < u.length; O += em) x.push(u.slice(O, O + em));
        return i = Promise.all(x.map(O => d.resolve(O).then(j => ({
          batch: O,
          cards: j.worlds,
          locked: j.locked
        }), () => ({
          batch: null,
          cards: [],
          locked: []
        })))).then(O => {
          let j = O.flatMap(ee => ee.cards),
            Y = O.flatMap(ee => ee.locked),
            re = new Set(O.flatMap(ee => ee.batch ?? [])),
            se = !1;
          for (let ee of c) {
            if (!T(ee)) continue;
            let me = j.find(ce => ce.slug === ee.target || ce.gameId === ee.target),
              de = Y.find(ce => ce.target === ee.target || ce.gameId === ee.target),
              ne = de?.bypass && me && K.has(de.gameId);
            if (de && !ne) C(ee), ee.portal.destination && N(ee, null), D(ee, de), ee.bypassCard = de.bypass && me ? me : null;else if (me) {
              !ee.lock && !ee.lockHeard && ee.kind === "fixed" && (ee.lockHeard = !0, e.onLock?.(ee.portal.spec.id, null));
              let ce = ee.missing;
              C(ee), ee.lock && D(ee, null), (ce || ee.portal.destination?.gameId !== me.gameId) && N(ee, me);
            } else ee.portal.destination && !ee.missing || (ee.lock ? (ee.asked = !1, ee.lockCheckAt = gv(ee.lock.opensAt, b())) : re.has(ee.target) ? (w(ee), se = !0) : ee.asked = !1);
          }
          return se && !y && E === null && (E = fv), J();
        }).finally(() => {
          i = null;
        }), i;
      },
      setLabels(d, c = !1) {
        p = d ? 1 : 0, c && (l = p);
      },
      update(d, c, u, x) {
        let O = Math.max(0, d);
        l = l < p ? Math.min(p, l + O / vv) : Math.max(p, l - O / xv);
        for (let de of t) de.portal.update(d, c, u, l), T(de) && h(de);
        let j = s && T(s) ? s : null,
          Y = j?.portal.destination?.gameId;
        if (j && Y && j.portal.distanceTo(u) >= cv && t.some(de => de.kind === "fixed" && T(de) && de.portal.destination?.gameId === Y) && S(j, !0), !x) return;
        let re = b(),
          se = !1;
        for (let de of t) de.lockCheckAt === null || re < de.lockCheckAt || !T(de) || (de.lockCheckAt = null, de.asked = !1, se = !0);
        se && B.resolveFixed(), E !== null && (E -= O, E <= 0 && (E = null, y = !0, B.recheck()));
        let ee = z(u);
        for (let [de, ne] of r) (ne.preloading || ne.held) && !ee.has(de) && U(de);
        let me = [...ee].sort((de, ne) => de[1] - ne[1]);
        for (let [de, ne] of me) {
          let ce = r.get(de),
            Ie = yv(ne, {
              preloading: ce?.preloading ?? !1,
              failed: ce?.failed ?? !1,
              held: ce?.held ?? !1
            });
          Ie === "preload" ? $(de, {
            distance: ne,
            feet: u
          }) : Ie === "release" && U(de);
        }
      },
      warmUp() {
        y = !1;
      },
      recheck() {
        for (let d of t) (d.missing && d.target !== tm || d.lock !== null) && T(d) && (d.asked = !1);
        return B.resolveFixed();
      },
      rerollFallbacks() {
        return J();
      },
      unavailableIds() {
        return t.filter(d => M(d) && T(d)).map(d => d.portal.spec.id);
      },
      bypass(d) {
        let u = t.find(O => O.portal === d && T(O))?.lock;
        if (!u?.bypass) return;
        K.add(u.gameId);
        let x = !1;
        for (let O of t) {
          if (!T(O) || O.lock?.gameId !== u.gameId) continue;
          let j = O.bypassCard;
          D(O, null), j ? N(O, j) : (O.asked = !1, x = !0);
        }
        x && B.resolveFixed();
      },
      lockOf(d) {
        let c = t.find(u => u.portal === d && T(u));
        return c?.lock ? L(c.lock) : null;
      },
      recheckLocks() {
        let d = !1;
        for (let c of t) c.kind !== "fixed" || !T(c) || !c.lock || (c.asked = !1, d = !0);
        return d ? B.resolveFixed() : Promise.resolve();
      },
      locks() {
        return t.flatMap(d => d.lock && T(d) ? [[d.portal.spec.id, L(d.lock)]] : []);
      },
      isMissing(d) {
        return t.some(c => c.missing && T(c) && c.target !== null && ml(c.target, d));
      },
      crossed(d, c) {
        for (let u of t) if (P(u) && u.portal.crossed(d, c)) return u.portal;
        return null;
      },
      nearest(d) {
        let c = null;
        for (let u of t) {
          if (!P(u)) continue;
          let x = u.portal.distanceTo(d);
          (!c || x < c.distance) && (c = {
            portal: u.portal,
            distance: x
          });
        }
        return c;
      },
      age(d) {
        let c = Math.max(0, d);
        for (let u of [...t]) u.left === null || !T(u) || (u.left = Math.max(0, u.left - c), F(u), u.left <= 0 && I(u));
      },
      timeLeft(d) {
        let c = t.find(u => u.portal === d);
        return c && T(c) ? c.left : null;
      },
      keepOpen(d, c) {
        let u = t.find(x => x.portal === d);
        !u || !T(u) || u.left === null || (u.left = Math.min(yo, Math.max(u.left, c)), F(u));
      },
      enterable(d, c) {
        let u = null;
        for (let x of t) {
          if (x.left === null || !P(x)) continue;
          let O = x.portal.distanceTo(d);
          O > Ja || u && O >= u.distance || kv(x.portal.center, c) && (u = {
            portal: x.portal,
            distance: O
          });
        }
        return u;
      },
      pick(d, c, u) {
        let x = null,
          O = u;
        for (let j of t) {
          if (j.left === null || !P(j) || j.portal.distanceTo(c) > Ja) continue;
          let Y = wv(d, j.portal);
          Y === null || Y >= O || (O = Y, x = j.portal);
        }
        return x;
      },
      onPreloadState(d, c) {
        let u = v(d);
        u.ready = c === "ready", c === "ready" ? u.failed = !1 : c === "failed" ? (u.failed = !0, u.preloading = !1) : c === "evicted" ? (u.preloading = !1, u.held = !0) : c === "loading" && !u.failed && !u.held && (u.preloading = !0);
        for (let x of t) x.portal.destination?.gameId === d && h(x);
      },
      onResident(d) {
        n.add(d);
        let c = v(d);
        c.failed = !1;
        for (let u of t) u.portal.destination?.gameId === d && h(u);
      },
      onNonResident(d) {
        if (n.delete(d)) for (let c of t) c.portal.destination?.gameId === d && h(c);
      },
      isResident: d => n.has(d),
      prepareCrossing(d, c) {
        let u = v(d);
        if (!u.preloading) {
          u.held = !1, $(d, {
            distance: 0,
            feet: c
          });
          for (let x of t) x.portal.destination?.gameId === d && h(x);
        }
      },
      forgetPreloads() {
        E = null;
        for (let c of t) c.fallback === "picked" && (c.stale = !0);
        for (let c of r.values()) c.preloading = !1, c.failed = !1, c.held = !1, c.ready = !1;
        let d = new Set(n);
        n.clear();
        for (let c of t) d.has(c.portal.destination?.gameId ?? "") && h(c);
      },
      prewarm() {
        return m || (m = ie("prototype", "spawned", pv, 0), m.object.visible = !1, e.scene.add(m.object)), m.object;
      },
      dispose() {
        for (let d of [...t]) S(d, !1);
        r.clear(), m && (e.scene.remove(m.object), m.dispose(), m = null);
      }
    };
  return B;
}
import * as Za from "./001-three-a973dc20bf0957e55145ef9e6b9c97d50275b224b1d81a57603249dd6750ab96.js";
var gl = 1.5,
  bl = 6,
  Sv = .02,
  dm = .6;
function Mv(e, t) {
  let [r, n, o] = e,
    a = Math.sin(t),
    s = Math.cos(t),
    i = -Math.cos(t),
    l = Math.sin(t),
    p = (E, y) => [r + i * E + a * y, n, o + l * E + s * y],
    m = [p(1.3, 0), p(-1.3, 0), p(0, -1.8), p(0, 1.8)];
  for (let E = 0; E < 8; E++) {
    let y = E / 8 * Math.PI * 2 + Math.PI / 8;
    m.push(p(Math.cos(y) * 2.6, Math.sin(y) * 2.6));
  }
  return m;
}
function yl(e, t, r, n) {
  let o = [e[0], e[1] + dm, e[2]],
    a = (s, i) => {
      let l = Math.max(s[1], e[1]) + gl,
        p = r.ground(s[0], l, s[2]);
      if (p === null || p < e[1] - bl) return null;
      let m = [s[0], p + Sv, s[2]];
      return !r.fits(m[0], m[1], m[2]) || i && !r.clear(o, [m[0], m[1] + dm, m[2]]) ? null : m;
    };
  if (n) {
    let s = a(n, !0);
    if (s) return s;
  }
  for (let s of Mv(e, t)) {
    let i = a(s, !0);
    if (i) return i;
  }
  return a(e, !1);
}
var en = new Za.Vector3(),
  fm = new Za.Quaternion();
function _a(e) {
  return e.getWorldQuaternion(fm), en.set(0, 0, 1).applyQuaternion(fm), en.x * en.x + en.z * en.z < 1e-10 ? 0 : Math.atan2(en.x, en.z);
}
function El(e) {
  if (/^Key[A-Z]$/.test(e)) return e.slice(3);
  if (/^Digit[0-9]$/.test(e)) return e.slice(5);
  let t = /^(Shift|Control|Alt|Meta)(Left|Right)$/.exec(e);
  return t ? t[1] === "Control" ? "Ctrl" : String(t[1]) : e.startsWith("Arrow") ? {
    ArrowUp: "\u2191",
    ArrowDown: "\u2193",
    ArrowLeft: "\u2190",
    ArrowRight: "\u2192"
  }[e] ?? e : e;
}
var vl = e => Array.isArray(e) ? [e[0], e[1], e[2]] : [e.x, e.y, e.z];
function mm(e, t) {
  return e ? {
    value: e.order === 1 ? Math.max(e.value, t.value) : e.order === -1 ? Math.min(e.value, t.value) : e.fresh ? e.value : t.value,
    order: e.order,
    fresh: e.fresh
  } : {
    value: t.value,
    order: t.order,
    fresh: !1
  };
}
function hm(e) {
  return {
    get(t) {
      return e.read(String(t))?.value ?? null;
    },
    set(t, r) {
      Number.isFinite(r) && e.write(String(t), r, 0);
    },
    best(t, r, n = !1) {
      if (!Number.isFinite(r)) return !1;
      let o = String(t),
        a = n ? -1 : 1,
        s = e.read(o),
        i = s === void 0 || (n ? r < s.value : r > s.value);
      return i ? e.write(o, r, a) : s && s.order !== a && e.write(o, s.value, a), i;
    },
    onChange: t => e.onChange(t)
  };
}
function gm(e) {
  return e.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 48) || "world";
}
function bm() {
  try {
    return typeof localStorage > "u" ? null : localStorage;
  } catch {
    return null;
  }
}
var Em = 1,
  Av = 32 * 1024,
  $a = 24 * 1024,
  Pv = 1e3,
  Sl = 64,
  vm = 64,
  Rl = 16,
  ei = 64,
  Cv = "remix-portal-save",
  Hv = new TextEncoder();
function Ml(e) {
  return Hv.encode(e).length;
}
function xl(e) {
  return typeof e == "object" && e !== null && !Array.isArray(e);
}
function xm(e) {
  try {
    let t = JSON.stringify(e);
    return typeof t == "string" ? t : void 0;
  } catch {
    return;
  }
}
var Lv = e => e === 1 || e === -1 ? e : 0;
function ym(e) {
  let t = {
    records: new Map(),
    world: null,
    settings: new Map()
  };
  if (!xl(e) || e.portalKit !== Em) return t;
  if (xl(e.records)) for (let [r, n] of Object.entries(e.records)) {
    if (t.records.size >= Sl) break;
    if (r.length > vm || !Array.isArray(n)) continue;
    let o = n[0];
    typeof o != "number" || !Number.isFinite(o) || t.records.set(r, {
      value: o,
      order: Lv(n[1])
    });
  }
  if (e.world !== null && e.world !== void 0) {
    let r = xm(e.world);
    r !== void 0 && Ml(r) <= $a && (t.world = r);
  }
  if (xl(e.settings)) for (let [r, n] of Object.entries(e.settings)) {
    if (t.settings.size >= Rl) break;
    r.length > ei || typeof n != "string" || n.length > ei || t.settings.set(r, n);
  }
  return t;
}
function Tl(e) {
  let t = [...e.records.keys()].filter(a => a.length <= vm).sort().slice(0, Sl),
    r = Object.fromEntries([...e.settings].sort(([a], [s]) => a < s ? -1 : a > s ? 1 : 0)),
    n = () => {
      let a = Object.fromEntries(t.map(s => {
        let i = e.records.get(s);
        return [s, [i.value, i.order]];
      }));
      return `{"portalKit":${Em},"records":${JSON.stringify(a)},"world":${e.world ?? "null"},"settings":${JSON.stringify(r)}}`;
    },
    o = n();
  for (; t.length > 0 && Ml(o) > Av;) t.pop(), o = n();
  return o;
}
var wl = (e, ...t) => {
    for (let r of [...e]) try {
      r(...t);
    } catch (n) {
      console.error(n);
    }
  },
  kl = (e, t) => (e.add(t), () => {
    e.delete(t);
  });
function Tm(e) {
  let t = e.now ?? (() => Date.now()),
    r = e.setTimer ?? ((L, K) => setTimeout(L, K)),
    n = e.clearTimer ?? (L => clearTimeout(L)),
    o = e.warn ?? (L => console.warn(L)),
    a = `${Cv}:${e.namespace}`,
    s = new Map(),
    i = {
      json: null,
      fresh: !1
    },
    l = new Map(),
    p = "waiting",
    m = !1,
    E = !1,
    y = !1,
    b = null,
    R = Number.NEGATIVE_INFINITY,
    v = new Set(),
    T = new Set(),
    M = new Set(),
    H = () => ({
      records: s,
      world: i.json,
      settings: new Map([...l].map(([L, K]) => [L, K.value]))
    }),
    h = () => {
      if (b = null, !m || !y) return;
      y = !1, R = t();
      let L = Tl(H());
      if (p === "local") {
        try {
          e.storage()?.setItem(a, L);
        } catch {}
        return;
      }
      void 0;
    },
    P = () => {
      !m || b !== null || (b = r(h, Math.max(0, R + Pv - t())));
    },
    A = () => {
      y = !0, P();
    },
    w = L => {
      let K = !1;
      for (let [g, S] of L.records) {
        let I = s.get(g);
        if (!I && s.size >= Sl) continue;
        let F = mm(I, S);
        F.value !== I?.value && (K = !0), s.set(g, F);
      }
      let D = !1;
      !i.fresh && L.world !== null && L.world !== i.json && (i = {
        json: L.world,
        fresh: !1
      }, D = !0);
      let N = !1;
      for (let [g, S] of L.settings) {
        let I = l.get(g);
        I?.fresh || I?.value === S || !I && l.size >= Rl || (l.set(g, {
          value: S,
          fresh: !1
        }), N = !0);
      }
      m = !0, E = !0, y = Tl(H()) !== Tl(L), P(), K && wl(v), D && wl(T, k.get()), N && wl(M);
    },
    C = hm({
      read: L => s.get(L),
      write(L, K, D) {
        let N = s.get(L);
        if (N && N.value === K && N.order === D) {
          E && (N.fresh = !0);
          return;
        }
        s.set(L, {
          value: K,
          order: D,
          fresh: E
        }), A();
      },
      onChange: L => kl(v, L)
    }),
    k = {
      get() {
        return i.json === null ? null : JSON.parse(i.json);
      },
      set(L) {
        let K = L == null ? null : xm(L);
        if (K === void 0) return o("world.saved.set: the value has no JSON form; nothing was saved."), !1;
        if (K !== null) {
          let N = Ml(K);
          if (N > $a) return o(`world.saved.set: ${N} bytes of JSON is over the ${$a}-byte limit; nothing was saved.`), !1;
        }
        let D = K !== i.json;
        return i = {
          json: K,
          fresh: E
        }, D && A(), !0;
      },
      onChange: L => kl(T, L)
    };
  return {
    records: C,
    saved: k,
    settings: {
      getItem: L => l.get(L)?.value ?? null,
      setItem(L, K) {
        let D = String(K);
        if (L.length > ei || D.length > ei) return;
        let N = l.get(L);
        if (N?.value === D) {
          E && (N.fresh = !0);
          return;
        }
        !N && l.size >= Rl || (l.set(L, {
          value: D,
          fresh: E
        }), A());
      }
    },
    onSettingsChange: L => kl(M, L),
    get loaded() {
      return m;
    },
    load(L) {
      p !== "local" && (p = "host", w(ym(L)));
    },
    standalone() {
      if (p !== "waiting") return;
      p = "local";
      let L = null;
      try {
        let K = e.storage()?.getItem(a);
        K && (L = JSON.parse(K));
      } catch {}
      w(ym(L));
    },
    hold() {
      p !== "local" && (m = !1, b !== null && (n(b), b = null));
    },
    flush() {
      b !== null && (n(b), b = null), h();
    }
  };
}
function wm(e, t, r) {
  return e && t && r ? "seamless" : "warp";
}
import * as Eo from "./001-three-a973dc20bf0957e55145ef9e6b9c97d50275b224b1d81a57603249dd6750ab96.js";
var Al = new WeakMap(),
  km = !1,
  Pl = e => Al.has(e);
function Rm() {
  if (km) return;
  km = !0;
  let e = Eo.PMREMGenerator.prototype.fromScene;
  Eo.PMREMGenerator.prototype.fromScene = function (t, r, n, o, a) {
    let s = e.call(this, t, r ?? 0, n ?? .1, o ?? 100, a);
    return Al.set(s.texture, {
      scene: t.clone(!0),
      sigma: r ?? 0
    }), s;
  };
}
function Cl(e) {
  let t = Al.get(e);
  if (!t) return null;
  let r = [],
    n = new Set();
  t.scene.traverse(o => {
    let a = o.geometry;
    if (!a || n.has(a.uuid)) return;
    n.add(a.uuid);
    let s = a;
    r.push({
      geometry: a,
      parameters: s.parameters,
      toJSON: a.toJSON
    }), s.parameters = void 0, a.toJSON = Eo.BufferGeometry.prototype.toJSON;
  });
  try {
    let o = t.scene.toJSON();
    for (let a of o.geometries ?? []) a.type = "BufferGeometry";
    if (o.images) throw new Error("A generated environment must use CPU geometry and materials");
    return o.animations = void 0, {
      json: o,
      sigma: t.sigma
    };
  } finally {
    for (let o of r) o.geometry.parameters = o.parameters, o.geometry.toJSON = o.toJSON;
  }
}
import * as pe from "./001-three-a973dc20bf0957e55145ef9e6b9c97d50275b224b1d81a57603249dd6750ab96.js";
import * as Mm from "./001-three-a973dc20bf0957e55145ef9e6b9c97d50275b224b1d81a57603249dd6750ab96.js";
function Iv(e) {
  return e instanceof Mm.Light ? e.shadow : void 0;
}
var Sm = new WeakMap();
function Ov(e) {
  let t = Sm.get(e);
  if (t) return t.count;
  let r = {
      count: 0
    },
    n = e.needsUpdate;
  return Object.defineProperty(e, "needsUpdate", {
    configurable: !0,
    enumerable: !0,
    get: () => n,
    set: o => {
      o && r.count++, n = o;
    }
  }), Sm.set(e, r), r.count;
}
function Am(e) {
  let t = [];
  return e.forEach((r, n) => {
    let o = Iv(r);
    o?.autoUpdate === !1 && t.push({
      node: n,
      requests: Ov(o)
    });
  }), t;
}
var Pm = e => {
  if (e == null) throw new Error("Missing scene resource");
  return e;
};
function Vv() {
  let e = {
    itemSize: this.itemSize,
    type: this.array.constructor.name,
    array: this.array.slice(),
    normalized: this.normalized
  };
  return this.name !== "" && (e.name = this.name), this.usage !== pe.StaticDrawUsage && (e.usage = this.usage), e;
}
function Wv(e) {
  let t = [],
    r = {
      Float32Array,
      Uint8Array,
      Uint8ClampedArray,
      Uint16Array,
      Uint32Array,
      Int8Array,
      Int16Array,
      Int32Array
    },
    n = [e];
  for (; n.length;) {
    let o = n.pop();
    if (!o || typeof o != "object" || ArrayBuffer.isView(o)) continue;
    if (Array.isArray(o)) {
      n.push(...o);
      continue;
    }
    let a = o,
      s = typeof a.type == "string" ? r[a.type] : void 0;
    if (s && Array.isArray(a.array)) {
      let i = new s(a.array);
      a.array = i, t.push(i.buffer);
    } else s && ArrayBuffer.isView(a.array) && !(a.array instanceof DataView) && t.push(a.array.buffer);
    for (let i of Object.values(a)) typeof i == "object" && n.push(i);
  }
  return t;
}
function Ll(e) {
  if (typeof e == "number" && Number.isFinite(e)) return {
    type: "n",
    value: e
  };
  if (typeof e == "boolean") return {
    type: "b",
    value: e
  };
  if (e === null) return {
    type: "t",
    value: null
  };
  if (e instanceof pe.Texture) return {
    type: "t",
    value: e.uuid
  };
  if (e instanceof pe.Color) return {
    type: "c",
    value: e.toArray()
  };
  if (e instanceof pe.Vector2) return {
    type: "v2",
    value: e.toArray()
  };
  if (e instanceof pe.Vector3) return {
    type: "v3",
    value: e.toArray()
  };
  if (e instanceof pe.Vector4) return {
    type: "v4",
    value: e.toArray()
  };
  if (e instanceof pe.Matrix3) return {
    type: "m3",
    value: Array.from(e.toArray())
  };
  if (e instanceof pe.Matrix4) return {
    type: "m4",
    value: Array.from(e.toArray())
  };
  if (ArrayBuffer.isView(e) && !(e instanceof DataView)) {
    let t = Array.from(e);
    return t.every(Number.isFinite) ? {
      type: "a",
      value: t
    } : null;
  }
  if (!Array.isArray(e) || e.length === 0) return null;
  if (e.every(t => typeof t == "number" && Number.isFinite(t))) return {
    type: "a",
    value: e
  };
  for (let [t, r] of Gv) if (e.every(n => n instanceof r)) {
    let n = e.flatMap(o => Array.from(o.toArray()));
    return n.every(Number.isFinite) ? {
      type: t,
      value: n
    } : null;
  }
  return null;
}
var Gv = [["ac", pe.Color], ["av2", pe.Vector2], ["av3", pe.Vector3], ["av4", pe.Vector4], ["am3", pe.Matrix3], ["am4", pe.Matrix4]];
function Bv(e) {
  for (let [t, r] of Object.entries(e)) {
    let n = r?.value;
    if (Array.isArray(n) && n.length > 0 && Ll(n) === null) return t;
  }
  return null;
}
function Il(e) {
  let t = 3735928559 ^ e.length,
    r = 1103547991 ^ e.length;
  for (let n = 0; n < e.length; n++) {
    let o = e.charCodeAt(n);
    t = Math.imul(t ^ o, 2654435761), r = Math.imul(r ^ o, 1597334677);
  }
  return t = Math.imul(t ^ t >>> 16, 2246822507) ^ Math.imul(r ^ r >>> 13, 3266489909), r = Math.imul(r ^ r >>> 16, 2246822507) ^ Math.imul(t ^ t >>> 13, 3266489909), (4294967296 * (2097151 & r) + (t >>> 0)).toString(36);
}
var Cm = (e, t) => t instanceof pe.InterleavedBufferAttribute ? `${e}:i${t.data.uuid}:${t.data.version}:${t.offset}:${t.itemSize}:${t.normalized}` : `${e}:${t.id}:${t.version}:${t.count}:${t.itemSize}:${t.normalized}:${t.array.constructor.name}`;
function Dv(e) {
  let t = [];
  for (let [n, o] of Object.entries(e.attributes)) t.push(Cm(n, o));
  for (let [n, o] of Object.entries(e.morphAttributes)) o.forEach((a, s) => t.push(Cm(`morph.${n}.${s}`, a)));
  let r = e.index;
  return t.push(e instanceof pe.InstancedBufferGeometry ? `instances:${e.instanceCount}` : "", r ? `index:${r.id}:${r.version}:${r.count}:${r.array.constructor.name}` : "", `${e.morphTargetsRelative}`, JSON.stringify(e.groups), `${e.drawRange.start}:${e.drawRange.count}`), Il(t.join("|"));
}
var zv = e => [e.mapping, e.wrapS, e.wrapT, e.magFilter, e.minFilter, e.anisotropy, e.format, e.type, e.colorSpace, e.flipY, e.premultiplyAlpha, e.generateMipmaps, e.unpackAlignment, e.internalFormat].join(","),
  ti = e => {
    let t = new Map();
    for (let r of e) t.has(r.source.uuid) || t.set(r.source.uuid, r);
    return [...t.values()];
  },
  Uv = {
    MeshBasicMaterial: "basic",
    MeshLambertMaterial: "lambert",
    MeshPhongMaterial: "phong",
    MeshStandardMaterial: "standard",
    MeshPhysicalMaterial: "physical",
    MeshToonMaterial: "toon",
    MeshMatcapMaterial: "matcap",
    MeshNormalMaterial: "normal",
    MeshDepthMaterial: "depth",
    PointsMaterial: "points",
    LineBasicMaterial: "basic",
    LineDashedMaterial: "dashed",
    SpriteMaterial: "sprite",
    ShadowMaterial: "shadow"
  },
  Lm = ["opacity", "transparent", "visible", "side", "depthWrite", "depthTest", "alphaTest", "roughness", "metalness", "emissiveIntensity", "envMapIntensity", "wireframe", "size", "linewidth", "color", "emissive", "map", "normalMap", "gradientMap", "alphaMap"];
function Kv(e, t) {
  let r = {
    ...e
  };
  for (let o of Lm) delete r[o];
  let n = t instanceof pe.ShaderMaterial ? t.uniforms : null;
  if (n && r.uniforms && typeof r.uniforms == "object") {
    let o = {
      ...r.uniforms
    };
    for (let [a, s] of Object.entries(n)) {
      let i = Ll(s?.value);
      i && a in o && (o[a] = i.type);
    }
    r.uniforms = o;
  }
  return Il(JSON.stringify(r));
}
function Hl(e) {
  let t = {};
  for (let [r, n] of Object.entries(e)) {
    let o = Ll(n.value);
    o && (t[r] = o);
  }
  return t;
}
function Im(e) {
  let t = e.image;
  if (!t || Array.isArray(t)) throw new Error("A shared portal texture must have a CPU-backed image");
  if (t.data instanceof Uint16Array) throw new Error("Half-float CPU textures need an explicit decoder");
  if (t.data && ArrayBuffer.isView(t.data) && Math.max(t.width, t.height) > 2048) throw new Error("A portal data texture exceeds the texture edge");
  return t;
}
var Om = e => typeof HTMLVideoElement < "u" && e instanceof HTMLVideoElement;
function Nm(e) {
  return Om(e) ? e.readyState >= 2 ? {
    width: e.videoWidth,
    height: e.videoHeight
  } : {
    width: 0,
    height: 0
  } : typeof HTMLImageElement < "u" && e instanceof HTMLImageElement ? e.complete ? {
    width: e.naturalWidth,
    height: e.naturalHeight
  } : {
    width: 0,
    height: 0
  } : {
    width: e.width > 0 ? e.width : 0,
    height: e.height > 0 ? e.height : 0
  };
}
var jv = (e, t, r) => e * t * (r ? 16 : 4) * 4 / 3;
function Yv(e, t, r = 1, n = Ha.textureEdge) {
  let o = new Map(),
    a = 0,
    s = 0;
  for (let E of e) {
    let y = E.fixed ? 1 : Math.min(1, n / Math.max(E.width, E.height, 1)),
      b = {
        width: Math.max(1, Math.floor(E.width * y)),
        height: Math.max(1, Math.floor(E.height * y))
      };
    o.set(E.uuid, b);
    let R = jv(b.width, b.height, !!E.float);
    E.fixed ? a += R : s += R;
  }
  let i = Math.max(0, t - a),
    l = E => s * E * E,
    p = Math.min(1, r);
  (l(p) > i || p < 1 && l(p) < i * .8) && (p = s > 0 ? Math.min(1, Math.sqrt(i * qv / s)) : 1);
  let m = new Map();
  for (let E of e) {
    let y = o.get(E.uuid);
    y && m.set(E.uuid, E.fixed || p === 1 ? y : {
      width: Math.max(1, Math.floor(y.width * p)),
      height: Math.max(1, Math.floor(y.height * p))
    });
  }
  return {
    scale: p,
    sizes: m
  };
}
var qv = .92;
async function Hm(e, t) {
  let r = Cl(e);
  if (r && !e.userData.portalRoomEnvironment) return {
    uuid: e.source.uuid,
    width: 1,
    height: 1,
    data: new Uint8Array(4),
    environment: r
  };
  if (e.userData.portalRoomEnvironment) return {
    uuid: e.source.uuid,
    width: 1,
    height: 1,
    data: new Uint8Array(4),
    room: !0
  };
  let n = Im(e),
    o = Nm(n);
  if (!o.width || !o.height) return {
    uuid: e.source.uuid,
    width: 1,
    height: 1,
    data: new Uint8Array(4)
  };
  let {
    width: a,
    height: s
  } = o;
  if (n.data && ArrayBuffer.isView(n.data)) {
    let m = n.data.length / (a * s),
      E = n.data instanceof Float32Array ? new Float32Array(a * s * 4) : new Uint8Array(a * s * 4);
    for (let y = 0; y < a * s; y++) for (let b = 0; b < 4; b++) E[y * 4 + b] = b < m ? n.data[y * m + b] : E instanceof Float32Array ? 1 : 255;
    return {
      uuid: e.source.uuid,
      width: a,
      height: s,
      data: E
    };
  }
  let i = t.width !== a || t.height !== s;
  if (typeof createImageBitmap == "function") {
    let m = await createImageBitmap(n, {
      imageOrientation: e.flipY ? "flipY" : "none",
      premultiplyAlpha: e.premultiplyAlpha ? "premultiply" : "none",
      colorSpaceConversion: "none",
      ...(i ? {
        resizeWidth: t.width,
        resizeHeight: t.height,
        resizeQuality: "high"
      } : {})
    });
    return {
      uuid: e.source.uuid,
      width: t.width,
      height: t.height,
      bitmap: m,
      data: new Uint8Array(0)
    };
  }
  let l = document.createElement("canvas");
  l.width = t.width, l.height = t.height;
  let p = l.getContext("2d", {
    willReadFrequently: !0
  });
  if (!p) throw new Error("A portal image could not be decoded");
  return p.drawImage(n, 0, 0, t.width, t.height), {
    uuid: e.source.uuid,
    width: t.width,
    height: t.height,
    data: new Uint8Array(p.getImageData(0, 0, t.width, t.height).data)
  };
}
function Qv(e, t, r) {
  if (!e || r.size === 0) return !1;
  let n = a => a instanceof pe.Texture && r.has(a.uuid);
  if (Object.values(e).some(n)) return !0;
  let o = e instanceof pe.ShaderMaterial ? e.uniforms : t.get(e.uuid)?.live;
  return Object.values(o ?? {}).some(a => n(a?.value));
}
var Xv = pe.BufferAttribute.prototype.toJSON;
function Jv(e) {
  let t = [e];
  for (; t.length;) {
    let r = t.pop();
    if (!r || typeof r != "object") continue;
    let n = r.shadow?.mapSize;
    Array.isArray(n) && r.shadow && (r.shadow.mapSize = n.map(o => typeof o == "number" ? Math.min(o, Ha.textureEdge) : o)), Array.isArray(r.children) && t.push(...r.children);
  }
}
function Zv(e, t, r) {
  let n = r * 8388608,
    o = new Set(),
    a = s => {
      let i = s instanceof pe.InterleavedBufferAttribute ? s.data.array : s.array;
      o.has(i) || (o.add(i), n += i.byteLength);
    };
  for (let s of e) {
    for (let i of Object.values(s.attributes)) a(i);
    for (let i of Object.values(s.morphAttributes)) for (let l of i) a(l);
    s.index && (n += s.index.array.byteLength);
  }
  for (let s of t) s instanceof pe.InstancedMesh && (n += s.instanceMatrix.array.byteLength + (s.instanceColor?.array.byteLength ?? 0));
  return Math.min(Ha.imageBytes, 201326592 - n - 4 * 1024 * 1024);
}
function Fm(e, t, r) {
  let n = 0,
    o = 0,
    a = "",
    s = "",
    i = [],
    l = new Map(),
    p = new Map(),
    m = new Map(),
    E = new Map(),
    y = new Map(),
    b = new Set(),
    R = new Map(),
    v = new Map(),
    T = new Map(),
    M = new Map(),
    H = 1;
  return {
    setFeatures(h) {
      b = new Set(h);
    },
    async frame(h, P, A, w = !1) {
      e.updateMatrixWorld(!0), h.updateMatrixWorld(!0);
      let C = [],
        k = new Map(),
        W = new Map(),
        L = new Map(),
        K = c => {
          c instanceof pe.Texture && L.set(c.uuid, c);
        };
      e.traverse(c => {
        C.push(c);
        let u = c,
          x = c instanceof pe.Mesh || c instanceof pe.Line || c instanceof pe.Points;
        if (u.geometry && x && W.set(u.geometry.uuid, u.geometry), u.material) for (let O of Array.isArray(u.material) ? u.material : [u.material]) k.set(O.uuid, O);
        u.geometry && u.material && c.onBeforeRender !== pe.Object3D.prototype.onBeforeRender && c.onBeforeRender(t, e, h, u.geometry, Array.isArray(u.material) ? Pm(u.material[0]) : u.material, new pe.Group());
      }), K(e.background), K(e.environment);
      for (let c of k.values()) {
        for (let j of Object.values(c)) K(j);
        if (c instanceof pe.ShaderMaterial) for (let j of Object.values(c.uniforms)) K(j.value);
        if (y.has(c.uuid) || c.onBeforeCompile === pe.Material.prototype.onBeforeCompile) continue;
        let u = pe.ShaderLib[Uv[c.type] ?? ""];
        if (!u) throw new Error(`Unsupported portal material callback: ${c.type}`);
        let x = {
          vertexShader: u.vertexShader,
          fragmentShader: u.fragmentShader,
          uniforms: pe.UniformsUtils.clone(u.uniforms)
        };
        c.onBeforeCompile(x, t);
        let O = {};
        for (let [j, Y] of Object.entries(x.uniforms)) j in u.uniforms || (O[j] = Y, K(Y.value));
        y.set(c.uuid, {
          patch: {
            vertex: x.vertexShader,
            fragment: x.fragmentShader,
            uniforms: Hl(O)
          },
          live: O
        });
      }
      for (let c of y.keys()) k.has(c) || y.delete(c);
      let D = new Set();
      for (let c of W.values()) {
        for (let u of Object.keys(c.attributes)) D.add(`${c.uuid}:${u}`);
        c.index && D.add(`${c.uuid}:index`);
      }
      for (let c of m.keys()) D.has(c) || m.delete(c);
      let N = new Set(C.filter(c => c instanceof pe.InstancedMesh).map(c => c.uuid));
      for (let c of E.keys()) N.has(c) || E.delete(c);
      for (let c of y.values()) for (let u of Object.values(c.live)) K(u.value);
      let g = b.has(io.images),
        S = ti(L.values()).filter(c => !c.userData.portalRoomEnvironment && !Pl(c)),
        I = Yv(S.map(c => {
          let u = Im(c);
          g && Om(u) && u.readyState >= 2 && (M.get(c.source.uuid) !== u.currentTime && (c.source.needsUpdate = !0), M.set(c.source.uuid, u.currentTime));
          let {
            width: x,
            height: O
          } = Nm(u);
          return {
            uuid: c.source.uuid,
            width: x || 1,
            height: O || 1,
            float: u.data instanceof Float32Array,
            fixed: !x || !!(u.data && ArrayBuffer.isView(u.data))
          };
        }), Zv(W.values(), C, ti(L.values()).filter(c => Pl(c) && !c.userData.portalRoomEnvironment).length), H);
      H = I.scale;
      let F = c => I.sizes.get(c.source.uuid) ?? {
        width: 1,
        height: 1
      };
      for (let c of S) {
        let u = F(c),
          x = `${u.width}x${u.height}`,
          O = T.get(c.source.uuid);
        O !== void 0 && O !== x && (c.needsUpdate = !0), T.set(c.source.uuid, x);
      }
      let z = C.map(c => `${c.uuid}:${c.parent?.uuid ?? ""}`).join("|"),
        U = [...W.values()].map(c => `${c.uuid}:${Object.entries(c.attributes).map(([u, x]) => `${u}:${x.count}:${x.itemSize}`).join(",")}:${c.index?.count ?? 0}:${c instanceof pe.InstancedBufferGeometry ? c.instanceCount : ""}`).concat([...L.values()].map(c => g ? `${c.uuid}:${c.source.uuid}:${zv(c)}` : `${c.uuid}:${c.version}`), [...k.values()].map(c => `${c.uuid}:${c.version}`)).join("|"),
        Q,
        $ = [],
        ie = [];
      if (w || z !== a || U !== s) {
        for (let ne of k.values()) {
          let ce = ne instanceof pe.ShaderMaterial ? ne.uniforms : y.get(ne.uuid)?.live,
            Ie = ce ? Bv(ce) : null;
          if (Ie !== null) throw new Error(`Unsupported portal uniform "${Ie}" on ${ne.type}`);
        }
        let c = !w && b.has(io.partial) && R.size > 0;
        c || (R.clear(), v.clear()), a = z, s = U, o++, i = C, l.clear(), p.clear();
        let u = new Map([...W.values()].map(ne => [ne.uuid, Dv(ne)])),
          x = new Set([...u].filter(([ne, ce]) => R.get(ne) === ce).map(([ne]) => ne)),
          O = new Map([...L.values()].map(ne => [ne.source.uuid, ne.source.version])),
          j = [...L.values()].map(ne => [ne.source, ne.source.data]),
          Y = [...W.values()].map(ne => [ne, ne.parameters, ne.toJSON]),
          re = C.map(ne => [ne, ne.userData]),
          se,
          ee,
          me = new Set();
        try {
          for (let [oe] of j) oe.data = {
            width: 1,
            height: 1,
            data: new Uint8Array(4)
          };
          for (let [oe] of Y) oe.parameters = void 0, oe.toJSON = x.has(oe.uuid) ? () => ({
            uuid: oe.uuid,
            portalKept: !0
          }) : oe instanceof pe.InstancedBufferGeometry ? pe.InstancedBufferGeometry.prototype.toJSON : pe.BufferGeometry.prototype.toJSON;
          for (let [oe] of re) oe.userData = {};
          pe.BufferAttribute.prototype.toJSON = Vv, se = e.toJSON(), se.images = void 0, se.animations = void 0, Jv(se.object);
          let ne = se.object;
          e.environment instanceof pe.Texture && ne.environment === void 0 && (ne.environment = e.environment.uuid), se.geometries = (se.geometries ?? []).filter(oe => !oe.portalKept);
          for (let oe of se.geometries) oe.type = oe.isInstancedBufferGeometry ? "InstancedBufferGeometry" : "BufferGeometry", Number.isFinite(oe.instanceCount) || (oe.instanceCount = void 0);
          let ce = se.textures ?? [];
          for (let oe of L.values()) ce.some(V => V.uuid === oe.uuid) || ce.push(oe.toJSON());
          ee = {};
          for (let [oe, V] of u) ee[oe] = V;
          let Ie = se.materials ?? [];
          for (let oe of Ie) typeof oe.uuid == "string" && (ee[oe.uuid] = Kv(oe, k.get(oe.uuid)));
          for (let oe of ce) typeof oe.uuid == "string" && (ee[oe.uuid] = Il(JSON.stringify(oe)));
          for (let [oe, V] of O) ee[`image:${oe}`] = `${V}`;
          let Me = oe => c && typeof oe.uuid == "string" && R.get(oe.uuid) === ee[oe.uuid];
          se.textures = ce.filter(oe => !Me(oe));
          for (let oe of se.textures) typeof oe.uuid == "string" && me.add(oe.uuid);
          se.materials = Ie.filter(oe => !Me(oe) || Qv(k.get(oe.uuid), y, me));
        } finally {
          pe.BufferAttribute.prototype.toJSON = Xv;
          for (let [ne, ce] of j) ne.data = ce;
          for (let [ne, ce, Ie] of Y) ce !== void 0 && (ne.parameters = ce), ne.toJSON = Ie;
          for (let [ne, ce] of re) ne.userData = ce;
        }
        let de = await Promise.all(ti(L.values()).filter(ne => v.get(ne.source.uuid) !== ne.source.version || [...L.values()].some(ce => ce.source === ne.source && me.has(ce.uuid))).map(ne => {
          let ce = ne.source.version;
          return Hm(ne, F(ne)).then(Ie => ({
            ...Ie,
            version: ce
          }));
        }));
        R.clear();
        for (let [ne, ce] of Object.entries(ee)) ne.startsWith("image:") || R.set(ne, ce);
        v.clear();
        for (let [ne, ce] of O) v.set(ne, ce);
        $ = Wv(se), Q = {
          json: se,
          order: i.map(ne => ne.uuid),
          images: de,
          options: r,
          patches: Object.fromEntries([...y].map(([ne, ce]) => [ne, {
            ...ce.patch,
            uniforms: Hl(ce.live)
          }])),
          versions: ee,
          ...(c ? {
            partial: !0
          } : {})
        };
      } else if (g) {
        let c = ti(L.values()).filter(u => v.has(u.source.uuid) && v.get(u.source.uuid) !== u.source.version && !Cl(u) && !u.userData.portalRoomEnvironment);
        for (let u of c) {
          let x = u.source.version;
          ie.push({
            ...(await Hm(u, F(u))),
            version: x
          }), v.set(u.source.uuid, x);
        }
      }
      let _ = [],
        J = [],
        Z = [];
      for (let c of W.values()) {
        let u = {};
        for (let [j, Y] of Object.entries(c.attributes)) {
          let re = Y instanceof pe.InterleavedBufferAttribute ? Y.data.version : Y.version,
            se = `${c.uuid}:${j}`;
          if (!Q && m.get(se) !== re) {
            let ee;
            if (Y instanceof pe.InterleavedBufferAttribute) {
              ee = new Float32Array(Y.count * Y.itemSize);
              for (let me = 0; me < Y.count; me++) for (let de = 0; de < Y.itemSize; de++) ee[me * Y.itemSize + de] = Y.data.array[me * Y.data.stride + Y.offset + de] ?? 0;
            } else ee = Y.array.slice();
            u[j] = {
              array: ee,
              itemSize: Y.itemSize,
              normalized: Y.normalized
            };
          }
          m.set(se, re);
        }
        let x = `${c.uuid}:index`,
          O = !Q && c.index && m.get(x) !== c.index.version ? c.index.array.slice() : void 0;
        c.index && m.set(x, c.index.version), (Object.keys(u).length || O) && Z.push({
          uuid: c.uuid,
          attributes: u,
          ...(O ? {
            index: O
          } : {})
        });
      }
      for (let c = 0; c < i.length; c++) {
        let u = Pm(i[c]),
          x = u.matrix.elements,
          O = u.visible ? 1 : 0,
          j = p.get(u.uuid);
        (!j || j[16] !== O || x.some((re, se) => re !== j[se])) && (_.push(c, ...x, O), p.set(u.uuid, [...x, O]));
        let Y = u instanceof pe.InstancedMesh ? `${u.instanceMatrix.version}:${u.instanceColor?.version ?? 0}:${u.count}` : "";
        u instanceof pe.InstancedMesh && (Q || E.get(u.uuid) !== Y) && (J.push({
          uuid: u.uuid,
          matrix: new Float32Array(u.instanceMatrix.array),
          color: u.instanceColor ? new Float32Array(u.instanceColor.array) : null,
          count: u.count
        }), E.set(u.uuid, Y));
      }
      let X = [];
      for (let c of k.values()) {
        let u = {};
        for (let Y of Lm) {
          let re = c[Y];
          re instanceof pe.Color ? u[Y] = re.toArray() : re instanceof pe.Texture ? u[Y] = re.uuid : (typeof re == "number" || typeof re == "boolean" || re === null) && (u[Y] = re);
        }
        let x = c instanceof pe.ShaderMaterial ? c.uniforms : y.get(c.uuid)?.live,
          O = {
            uuid: c.uuid,
            values: u,
            ...(x ? {
              uniforms: Hl(x)
            } : {})
          },
          j = JSON.stringify(O);
        l.get(c.uuid) !== j && (X.push(O), l.set(c.uuid, j));
      }
      let B = {
          version: 1,
          seq: ++n,
          graph: o,
          avatar: A.uuid,
          camera: {
            matrix: h.matrixWorld.toArray(),
            projection: h.projectionMatrix.toArray(),
            fov: h.fov,
            near: h.near,
            far: h.far,
            aspect: h.aspect
          },
          portals: P.filter(c => c.state !== "missing").map(c => ({
            id: c.spec.id,
            surface: c.object.getObjectByName("portal-surface")?.uuid ?? c.object.uuid,
            destination: c.destination?.gameId ?? null,
            center: c.center.toArray(),
            yaw: c.spec.yaw,
            radius: c.spec.radius ?? 1.35,
            shape: c.spec.frame === "arch" ? "arch" : "circle"
          })),
          transforms: new Float32Array(_),
          shadows: Am(i),
          instances: J,
          geometries: Z,
          materials: X,
          ...(ie.length ? {
            images: ie
          } : {}),
          ...(Q ? {
            snapshot: Q
          } : {})
        },
        d = [B.transforms.buffer, ...$];
      for (let c of Z) {
        for (let u of Object.values(c.attributes)) d.push(u.array.buffer);
        c.index && d.push(c.index.buffer);
      }
      for (let c of J) d.push(c.matrix.buffer), c.color && d.push(c.color.buffer);
      for (let c of [...(Q?.images ?? []), ...ie]) d.push(c.data.buffer), c.bitmap && d.push(c.bitmap);
      return {
        data: B,
        transfer: d
      };
    }
  };
}
function Vm() {
  let e = [],
    t = !1;
  return {
    setPipelined(r) {
      t = r;
    },
    mayGo(r) {
      return e.length ? t && r && e.length < ad && !e.some(n => n.snapshot) : !0;
    },
    sent(r, n) {
      e.push({
        seq: r,
        snapshot: n
      });
    },
    acked(r) {
      let n = e.findIndex(o => o.seq === r);
      return n < 0 ? !1 : (e.splice(0, n + 1), !0);
    },
    reset() {
      e = [];
    }
  };
}
import * as Ut from "./001-three-a973dc20bf0957e55145ef9e6b9c97d50275b224b1d81a57603249dd6750ab96.js";
function Wm(e) {
  return new Ut.Matrix4().makeRotationY(e.yaw).setPosition(...e.center);
}
function _v(e, t) {
  return Wm(t).multiply(new Ut.Matrix4().makeRotationY(Math.PI)).multiply(Wm(e).invert());
}
function Gm(e, t, r) {
  let n = _v(e, t),
    o = new Ut.Quaternion().setFromRotationMatrix(n),
    a = s => new Ut.Vector3(...s).applyMatrix4(n).toArray();
  return {
    ...(r.rig ? {
      rig: {
        ...r.rig,
        pivot: a(r.rig.pivot)
      }
    } : {}),
    feet: a(r.feet),
    eye: a(r.eye),
    velocity: new Ut.Vector3(...r.velocity).applyQuaternion(o).toArray(),
    quaternion: o.multiply(new Ut.Quaternion(...r.quaternion)).toArray(),
    yaw: r.yaw + t.yaw - e.yaw + Math.PI,
    fov: r.fov
  };
}
import * as Ol from "./001-three-a973dc20bf0957e55145ef9e6b9c97d50275b224b1d81a57603249dd6750ab96.js";
function $v(e) {
  e.renderTarget ? e.renderTarget.dispose() : e.dispose();
}
function Bm(e) {
  let t = r => {
    r.isRenderTargetTexture || $v(r);
  };
  e.traverse(r => {
    let n = r;
    n.geometry?.dispose();
    let o = n.material ? Array.isArray(n.material) ? n.material : [n.material] : [];
    for (let s of o) {
      for (let i of Object.values(s)) i instanceof Ol.Texture && t(i);
      s.dispose();
    }
    let a = r;
    a.shadow?.map?.dispose(), a.shadow?.mapPass?.dispose();
  }), e.environment && t(e.environment), e.background instanceof Ol.Texture && t(e.background);
}
import * as Ct from "./001-three-a973dc20bf0957e55145ef9e6b9c97d50275b224b1d81a57603249dd6750ab96.js";
var ex = 250,
  tx = 4,
  rx = .1,
  nx = 400;
function Dm() {
  let e = Number.NaN,
    t = 0,
    r = Aa;
  return {
    arrived(n) {
      if (!(n > nx)) {
        if (Number.isNaN(e)) {
          e = n;
          return;
        }
        t += (Math.abs(n - e) - t) / 4, e += (n - e) / 8;
      }
    },
    delay(n) {
      let o = Number.isNaN(e) ? Aa : Math.min(ex, Math.max(Aa, e + tx * t)),
        a = Math.max(0, n) * 1e3 * rx;
      return r += Math.max(-a, Math.min(a, o - r)), r;
    },
    reset() {
      e = Number.NaN, t = 0;
    }
  };
}
var vo = 8,
  ox = 150,
  ax = 400,
  ix = .08,
  ri = 6,
  sx = 5e3,
  lx = 250,
  cx = .02,
  ux = 1.9,
  px = .7,
  dx = .12,
  fx = wn,
  mx = .5,
  xo = e => e < 0 ? 0 : e > 1 ? 1 : e;
function hx(e, t, r) {
  let n = xo((r - e) / (t - e));
  return n * n * (3 - 2 * n);
}
function gx(e) {
  return Math.atan2(Math.sin(e), Math.cos(e));
}
var Nl = () => ({
  t: 0,
  x: 0,
  y: 0,
  z: 0,
  yaw: 0,
  speed: 0,
  forward: 0,
  vy: 0,
  grounded: !0,
  seated: !1,
  riding: !1,
  gesture: null
});
function bx(e) {
  let t = new Set(),
    r = [],
    n = !1;
  return e.traverse(o => {
    let a = o;
    if (!a.isMesh) return;
    a.castShadow = !1;
    let s = Array.isArray(a.material) ? a.material : [a.material];
    for (let i of s) !i || t.has(i) || (t.add(i), i.isShaderMaterial ? n = !0 : r.push({
      material: i,
      opacity: i.opacity,
      transparent: i.transparent
    }));
  }), {
    materials: r,
    hideBelow: n ? .5 : .02
  };
}
var zm = null;
function yx(e, t) {
  zm ??= new Ct.CylinderGeometry(.46, .54, .16, 20);
  let r = new Ct.Color(e).lerp(new Ct.Color("#141821"), .45),
    n = new Ct.Mesh(zm, new Ct.MeshStandardMaterial({
      color: r,
      roughness: .55,
      metalness: .2
    }));
  return n.name = "peer.ride", n.position.y = te.body.bottom * t - .08 * t, n.scale.setScalar(t), n;
}
function Um(e) {
  let {
      scene: t,
      runSpeed: r
    } = e,
    n = e.createAvatar ?? qo,
    o = e.avatar.scale && e.avatar.scale > 0 ? e.avatar.scale : 1,
    a = [],
    s = new Map(),
    i = [],
    l = 0,
    p = !1,
    m = 0,
    E = !1,
    y = new Ct.Vector3(),
    b = new Ct.Vector3(),
    R = Nl(),
    v = Nl(),
    T = g => {
      for (let S = 0; S < i.length; S++) if (i[S].tint === g) return i.splice(S, 1)[0];
      return null;
    },
    M = g => {
      let S = n({
        style: e.avatar.style,
        color: g,
        scale: o,
        look: "world"
      });
      return {
        tint: g,
        avatar: S,
        ...bx(S.root),
        ride: null
      };
    },
    H = (g, S) => {
      for (let I of g.materials) S >= 1 ? (I.material.opacity = I.opacity, I.material.transparent = I.transparent) : (I.material.opacity = I.opacity * S, I.material.transparent = !0);
    },
    h = (g, S, I) => {
      let F = I > S.hideBelow;
      if (S.avatar.setVisible(F && g.placed), !F) {
        g.fade = I;
        return;
      }
      Math.abs(I - g.fade) < .02 && !(I === 1 && g.fade !== 1) || (g.fade = I, H(S, I));
    },
    P = g => {
      s.delete(g.handle);
      let S = a.indexOf(g);
      S >= 0 && a.splice(S, 1);
      let I = g.body;
      if (I) for (g.body = null, I.avatar.setVisible(!1), I.ride && (I.ride.visible = !1), H(I, 1), i.push(I); i.length > fx;) A(i.shift());
    },
    A = g => {
      if (g.ride) {
        g.ride.removeFromParent();
        let S = g.ride.material;
        for (let I of Array.isArray(S) ? S : [S]) I.dispose();
        g.ride = null;
      }
      g.avatar.root.removeFromParent(), g.avatar.dispose();
    },
    w = g => {
      let S = {
        handle: g.peer,
        tint: g.tint,
        body: null,
        ring: Array.from({
          length: vo
        }, Nl),
        count: 0,
        head: -1,
        placed: !1,
        playedT: Number.NEGATIVE_INFINITY,
        x: 0,
        y: 0,
        z: 0,
        yaw: 0,
        grounded: !0,
        riding: !1,
        motion: {
          speed: 0,
          forward: 0,
          runSpeed: r,
          grounded: !0,
          vy: 0,
          jumped: !1,
          landed: !1,
          yaw: 0,
          seated: !1
        },
        fade: 1,
        sampledAt: Number.NaN,
        teleportAt: Number.NEGATIVE_INFINITY,
        rawX: 0,
        rawY: 0,
        rawZ: 0,
        correctionX: 0,
        correctionY: 0,
        correctionZ: 0,
        changed: !1,
        jitter: Dm()
      };
      a.push(S), s.set(g.peer, S);
    },
    C = (g, S, I) => {
      let F = g.count > 0 ? g.ring[g.head] : null;
      if (F && S <= F.t) {
        if (S < F.t) return;
        I.gesture && (F.gesture = I.gesture);
        return;
      }
      F && g.jitter.arrived(S - F.t), g.changed = !0, g.head = (g.head + 1) % vo, g.count = Math.min(vo, g.count + 1);
      let z = g.ring[g.head];
      z.t = S, z.x = I.x, z.y = I.y, z.z = I.z, z.yaw = I.yaw, z.speed = I.speed, z.forward = I.forward, z.vy = I.vy, z.grounded = I.grounded, z.seated = I.seated, z.riding = I.seated && I.riding, z.gesture = I.gesture ?? null;
    },
    k = (g, S) => g.ring[(g.head - S + vo * 2) % vo],
    W = (g, S, I) => {
      I === g.riding && (!I || S.ride?.visible) || (g.riding = I, I && !S.ride && (S.ride = yx(S.tint, o), S.avatar.root.add(S.ride)), S.ride && (S.ride.visible = I));
    },
    L = (g, S, I) => {
      let F = k(g, 0),
        z = F,
        U = F,
        Q = 0,
        $ = 0;
      if (S >= F.t) $ = Math.min(S - F.t, ox);else {
        let O = !1;
        for (let j = 1; j < g.count; j++) {
          let Y = k(g, j);
          if (Y.t <= S) {
            z = Y, U = k(g, j - 1), Q = (S - z.t) / Math.max(1e-6, U.t - z.t), O = !0;
            break;
          }
        }
        O || (z = k(g, g.count - 1), U = z);
      }
      let ie = U.x - z.x,
        _ = U.y - z.y,
        J = U.z - z.z,
        Z = ie * ie + _ * _ + J * J > ri * ri,
        X = Z ? U.t : Number.NEGATIVE_INFINITY;
      Z && (Q = 1);
      let B = z.x + ie * Q,
        d = z.y + _ * Q,
        c = z.z + J * Q;
      if (S >= F.t && g.count >= 2) {
        let O = k(g, 1),
          j = F.t - O.t,
          Y = F.x - O.x,
          re = F.z - O.z,
          se = F.y - O.y,
          ee = Y * Y + se * se + re * re > ri ** 2;
        ee && (X = F.t), $ > 0 && !ee && j > 0 && j <= ax && (B += Y / j * $, c += re / j * $, F.grounded || (d += (F.y - O.y) / j * $));
      }
      let u = Q >= .5 ? U : z,
        x = z.yaw + gx(U.yaw - z.yaw) * Q;
      return I.x = B, I.y = d, I.z = c, I.yaw = x, I.speed = z.speed + (U.speed - z.speed) * Q, I.forward = z.forward + (U.forward - z.forward) * Q, I.vy = z.vy + (U.vy - z.vy) * Q, I.grounded = u.grounded, I.seated = u.seated, I.riding = u.riding, X;
    },
    K = (g, S, I, F) => {
      let z = S.avatar,
        U = !g.placed,
        Q = L(g, I, R),
        $ = !U && (Q > g.teleportAt || (R.x - g.rawX) ** 2 + (R.y - g.rawY) ** 2 + (R.z - g.rawZ) ** 2 > ri ** 2);
      U || $ || !Number.isFinite(g.sampledAt) || g.sampledAt < k(g, g.count - 1).t ? g.correctionX = g.correctionY = g.correctionZ = 0 : g.changed && (L(g, g.sampledAt, v), g.correctionX += g.rawX - v.x, g.correctionY += g.rawY - v.y, g.correctionZ += g.rawZ - v.z), g.teleportAt = Math.max(g.teleportAt, Q), g.changed = !1, g.sampledAt = I, g.rawX = R.x, g.rawY = R.y, g.rawZ = R.z;
      let ie = Math.exp(-Math.max(0, F) / ix);
      g.correctionX *= ie, g.correctionY *= ie, g.correctionZ *= ie, g.x = R.x + g.correctionX, g.y = R.y + g.correctionY, g.z = R.z + g.correctionZ;
      let _ = R.yaw;
      g.yaw = _;
      let J = z.root;
      J.position.set(g.x, g.y, g.z), (U || $) && (J.rotation.y = _, g.placed = !0, z.setVisible(g.fade > S.hideBelow), z.materialize(U ? 700 : 420));
      let Z = g.motion,
        X = R.grounded;
      if (Z.speed = R.speed, Z.forward = R.forward, Z.vy = R.vy, Z.grounded = X, Z.jumped = !U && g.grounded && !X && Z.vy > mx, Z.landed = !U && !g.grounded && X, Z.yaw = _, Z.seated = R.seated, g.grounded = X, W(g, S, R.seated && R.riding), U) g.playedT = I;else for (let B = g.count - 1; B >= 0; B--) {
        let d = k(g, B);
        d.t <= g.playedT || d.t > I || (g.playedT = d.t, d.gesture && z.gesture(d.gesture));
      }
      z.update(F, Z);
    };
  return {
    get count() {
      return a.length;
    },
    get placed() {
      let g = 0;
      for (let S of a) S.placed && (g += 1);
      return g;
    },
    set(g) {
      if (E) return;
      let S = new Map();
      for (let I of g.slice(0, wn)) S.set(I.peer, I.tint);
      for (let I of [...a]) S.get(I.handle) !== I.tint && P(I);
      for (let [I, F] of S) s.has(I) || w({
        peer: I,
        tint: F
      });
    },
    presence(g, S, I) {
      if (E || a.length === 0) return;
      let F = I - g,
        z = p && (Math.abs(F - l) > sx || g < m - lx);
      if (!p || z) {
        if (p) for (let U of a) U.count = 0, U.head = -1, U.sampledAt = Number.NaN, U.teleportAt = Number.NEGATIVE_INFINITY, U.playedT = Number.NEGATIVE_INFINITY, U.jitter.reset();
        l = F, p = !0;
      } else F < l ? l = F : l += (F - l) * cx;
      m = z ? g : Math.max(m, g);
      for (let U of S) {
        let Q = s.get(U.peer);
        Q && C(Q, g, U);
      }
    },
    update(g, S, I, F = !0) {
      if (a.length === 0) return;
      y.setFromMatrixPosition(I.matrixWorld);
      let z = .55 * o,
        U = !1;
      for (let Q of a) {
        let $ = Q.body;
        if (Q.count > 0 && !$ && ($ = T(Q.tint), !$ && !U && F && ($ = M(Q.tint), U = !0), $ && (Q.body = $, $.avatar.setVisible(!1), $.avatar.root.parent !== t && t.add($.avatar.root))), Q.count === 0 || !$) continue;
        K(Q, $, S - l - Q.jitter.delay(g), g);
        let ie = Math.hypot(Q.x - y.x, Q.y + z - y.y, Q.z - y.z);
        h(Q, $, hx(px * o, ux * o, ie));
      }
    },
    anchors(g, S, I) {
      let F = 0,
        z = te.height * o + dx;
      S && N(g, S.x, S.y + z, S.z, "self", D(I, F++));
      for (let U of a) U.placed && N(g, U.x, U.y + z, U.z, U.handle, D(I, F++));
      return F;
    },
    latest(g) {
      let S = s.get(g);
      if (!S || S.count === 0) return null;
      let I = k(S, 0);
      return {
        x: I.x,
        y: I.y,
        z: I.z,
        yaw: I.yaw
      };
    },
    clear() {
      for (let g of [...a]) P(g);
    },
    dispose() {
      if (!E) {
        for (let g of [...a]) P(g);
        for (let g of i.splice(0)) A(g);
        E = !0;
      }
    }
  };
  function D(g, S) {
    let I = g[S];
    return I || (I = {
      peer: "",
      x: 0,
      y: 0,
      onScreen: !1
    }, g[S] = I), I;
  }
  function N(g, S, I, F, z, U) {
    U.peer = z, b.set(S, I, F).applyMatrix4(g.matrixWorldInverse);
    let Q = g.near ?? .1;
    if (b.z < -Q) {
      b.applyMatrix4(g.projectionMatrix), U.onScreen = Math.abs(b.x) <= 1 && Math.abs(b.y) <= 1, U.x = xo((b.x + 1) / 2), U.y = xo((1 - b.y) / 2);
      return;
    }
    let $ = b.x,
      ie = b.y;
    Math.abs($) < 1e-6 && Math.abs(ie) < 1e-6 && (ie = -1);
    let _ = Math.max(Math.abs($), Math.abs(ie));
    $ /= _, ie /= _, U.onScreen = !1, U.x = xo(($ + 1) / 2), U.y = xo((1 - ie) / 2);
  }
}
var Vl = .5,
  Ex = 1e3 / _p - Vl,
  vx = 1e3 / $p - Vl,
  xx = 1e3 / ed - Vl,
  Tx = 1e3,
  Km = .002,
  jm = .05,
  wx = .01,
  Ym = .02,
  Fl = Math.PI * 2,
  To = (e, t) => Math.max(-t, Math.min(t, e)),
  qm = e => {
    let t = e % Fl,
      r = t < 0 ? t + Fl : t;
    return r >= Fl ? 0 : r;
  };
function Qm(e) {
  let t = e.createPeers ?? Um,
    r = null,
    n = !1,
    o = !1,
    a = 0,
    s = !1,
    i = Number.NEGATIVE_INFINITY,
    l = null,
    p = Number.NaN,
    m = 0,
    E = 0,
    y = 0,
    b = -1,
    R = Number.NEGATIVE_INFINITY,
    v = Number.NEGATIVE_INFINITY,
    T = [],
    M = [],
    H = -1,
    h = Number.NEGATIVE_INFINITY,
    P = () => n && o,
    A = () => {
      r?.clear(), a = 0, l = null, i = Number.NEGATIVE_INFINITY, R = Number.NEGATIVE_INFINITY, v = Number.NEGATIVE_INFINITY, H = -1, p = Number.NaN, s = !1;
    },
    w = () => (r ??= t({
      scene: e.scene,
      avatar: e.avatar,
      runSpeed: e.runSpeed
    }), r),
    C = (D, N) => {
      let g = e.link();
      if (!g) return;
      let {
          feet: S,
          velocity: I
        } = D,
        F = qm(D.yaw),
        z = Math.hypot(I.x, I.z),
        U = oo,
        Q = {
          x: To(S.x, U.position),
          y: To(S.y, U.position),
          z: To(S.z, U.position),
          yaw: F,
          speed: Math.min(U.speed, z),
          forward: To(I.x * Math.sin(F) + I.z * Math.cos(F), U.forward),
          vy: To(I.y, U.vy),
          grounded: D.grounded,
          seated: D.seated,
          riding: D.seated && D.riding
        };
      l && (Q.gesture = l), l = null, g.social({
        type: "portal_self",
        data: Q
      }), i = N, p = S.x, m = S.y, E = S.z, y = F, b = k(D);
    },
    k = D => (D.grounded ? 1 : 0) | (D.seated ? 2 : 0) | (D.seated && D.riding ? 4 : 0),
    W = (D, N) => {
      let g = N - i;
      if (g >= vx) return !0;
      if (g < Ex) return !1;
      if (l) return !0;
      let {
        velocity: S,
        feet: I
      } = D;
      if (Math.hypot(S.x, S.z) > jm || Math.abs(S.y) > jm || Math.abs(qm(D.yaw) - y) > wx || k(D) !== b) return !0;
      let F = I.x - p,
        z = I.y - m,
        U = I.z - E;
      return F * F + z * z + U * U > Ym * Ym;
    },
    L = D => {
      if (D !== H) return !0;
      for (let N = 0; N < D; N++) {
        let g = T[N],
          S = M[N];
        if (g.peer !== S.peer || g.onScreen !== S.onScreen || Math.abs(g.x - S.x) > Km || Math.abs(g.y - S.y) > Km) return !0;
      }
      return !1;
    },
    K = (D, N) => {
      let g = e.link();
      if (!g) return;
      let S = [];
      for (let I = 0; I < D; I++) {
        let F = T[I];
        S.push({
          peer: F.peer,
          x: F.x,
          y: F.y,
          onScreen: F.onScreen
        });
        let z = M[I];
        z ? (z.peer = F.peer, z.x = F.x, z.y = F.y, z.onScreen = F.onScreen) : M[I] = {
          ...F
        };
      }
      H = D, R = N, g.social({
        type: "portal_anchors",
        data: {
          t: N,
          points: S
        }
      });
    };
  return {
    get enabled() {
      return P();
    },
    get peerCount() {
      return a;
    },
    context(D) {
      let N = P();
      n = D.mode === "active", o = !!D.host?.features.includes("social"), N && !P() && A();
    },
    arrived() {
      A();
    },
    standby() {
      n = !1, A();
    },
    onPeers(D) {
      if (!P() || D.length === 0 && !r) return;
      let N = w();
      N.set(D), a = N.count, a === 0 && (l = null, H = -1);
    },
    onPresence(D, N, g) {
      !P() || !r || a === 0 || r.presence(D, N, g);
    },
    frame(D, N, g, S, I) {
      if (!(a === 0 || !r || !P())) {
        if (r.update(D, N, g, !I), I) {
          s || (s = !0, K(0, N));
          return;
        }
        if (s = !1, W(S, N) && C(S, N), N - v >= xx) {
          v = N, g.updateMatrixWorld();
          let F = r.anchors(g, S.drawn, T);
          (L(F) || N - R >= Tx) && K(F, N);
        }
      }
    },
    gesture(D) {
      P() && a > 0 && (l = D);
    },
    chat(D) {
      if (!P() || D - h < td) return !1;
      let N = e.link();
      return N ? (h = D, N.social({
        type: "portal_chat_open",
        data: {}
      }), !0) : !1;
    },
    latest(D) {
      return r?.latest(D) ?? null;
    },
    dispose() {
      r?.dispose(), r = null, a = 0;
    }
  };
}
import * as zl from "./001-three-a973dc20bf0957e55145ef9e6b9c97d50275b224b1d81a57603249dd6750ab96.js";
var Be = (e, t = "") => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"${t}>${e}</svg>`,
  Jm = Be('<circle cx="12" cy="12" r="9.3" stroke-width="1.6"/><g class="rpk-swirl"><path d="M12 12c0-2.9 2.2-5 5.3-4.6"/><path d="M12 12c0-2.9 2.2-5 5.3-4.6" transform="rotate(120 12 12)"/><path d="M12 12c0-2.9 2.2-5 5.3-4.6" transform="rotate(240 12 12)"/></g><circle cx="12" cy="12" r="1.25" fill="currentColor" stroke="none"/>'),
  LR = Be('<path d="M6 6l12 12M18 6L6 18"/>'),
  IR = Be('<circle cx="12" cy="12" r="9.2"/><path d="M9.6 9.4a2.5 2.5 0 0 1 4.8.9c0 1.7-2.4 2.2-2.4 3.7"/><circle cx="12" cy="17.2" r=".6" fill="currentColor"/>'),
  OR = Be('<path d="M9.5 6l6 6-6 6"/>'),
  NR = Be('<path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5z"/><path d="M15.5 9a4 4 0 0 1 0 6"/><path d="M18 6.5a7.5 7.5 0 0 1 0 11"/>'),
  FR = Be('<path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5z"/><path d="M16 9.5l5 5M21 9.5l-5 5"/>'),
  VR = Be('<path d="M14.5 6l-6 6 6 6"/>'),
  WR = Be('<path d="M12 21s-6.4-5.5-6.4-10.8a6.4 6.4 0 0 1 12.8 0C18.4 15.5 12 21 12 21z"/><circle cx="12" cy="10.2" r="2.3"/>'),
  GR = Be('<path d="M7.5 7.5h9a4.5 4.5 0 0 1 4.3 3.2l1 3.6a2.8 2.8 0 0 1-4.7 2.7L15.5 15.5h-7l-1.6 1.5a2.8 2.8 0 0 1-4.7-2.7l1-3.6a4.5 4.5 0 0 1 4.3-3.2z"/><path d="M8 10v3M6.5 11.5h3"/><path d="M15.5 11h.01M17.5 12.5h.01" stroke-width="2.4"/>'),
  Xm = e => {
    let t = 1.6 * Math.PI,
      r = Math.log(12.5 / .8) / t,
      n = [];
    for (let o = 0; o <= 28; o++) {
      let a = o / 28 * t,
        s = .8 * Math.exp(r * a),
        i = a + e * Math.PI / 180;
      n.push(`${(12 + s * Math.cos(i)).toFixed(2)} ${(12 + s * Math.sin(i)).toFixed(2)}`);
    }
    return `M${n.join("L")}`;
  },
  kx = [...[0, 120, 240].map(e => `<path d="${Xm(e)}" stroke-width="1.1"/>`), ...[60, 180, 300].map(e => `<path d="${Xm(e)}" stroke-width="0.6" opacity="0.5"/>`)].join(""),
  Zm = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${kx}</svg>`;
function _m(e) {
  let t = e === "left" || e === "both",
    r = e === "right" || e === "both",
    n = o => `<path d="${o}" class="rpk-lit" fill="currentColor" stroke="none"/>`;
  return Be(`${t ? n("M12 2.9v8.3H6.4V8.5A5.6 5.6 0 0 1 12 2.9z") : ""}${r ? n("M12 2.9v8.3h5.6V8.5A5.6 5.6 0 0 0 12 2.9z") : ""}${e === "wheel" ? '<rect x="10.9" y="4.6" width="2.2" height="4.4" rx="1.1" class="rpk-lit" fill="currentColor" stroke="none"/>' : ""}<rect x="6" y="2.5" width="12" height="19" rx="6"/><path d="M6 11.2h12${e === "wheel" ? "" : "M12 2.5v8.7"}"/>`);
}
var $m = Be('<circle cx="12" cy="13.5" r="7.2"/><path d="M12 13.5V9.6M9.8 2.8h4.4M12 2.8v3.5M18.4 7.1l1.3-1.3"/>'),
  eh = Be('<path d="M5.5 21V3.6"/><path d="M5.5 4.2h12.8l-2.4 4.1 2.4 4.1H5.5"/><path d="M9.8 4.2v8.2M14.1 4.2v8.2M5.5 8.3h10.4" stroke-width="1.2" opacity=".7"/>'),
  Wl = Be('<path d="M12 2.8l2.3 6.9 6.9 2.3-6.9 2.3-2.3 6.9-2.3-6.9L2.8 12l6.9-2.3z" fill="currentColor" fill-opacity=".25"/>'),
  ni = Be('<path d="M12 20.2S3.6 15 3.6 9.1A4.3 4.3 0 0 1 12 7.4a4.3 4.3 0 0 1 8.4 1.7c0 5.9-8.4 11.1-8.4 11.1z" fill="currentColor" fill-opacity=".25"/>'),
  th = Be('<circle cx="9.5" cy="12" r="5.2" fill="currentColor" fill-opacity=".3"/><circle cx="18.6" cy="12" r="1.7" fill="currentColor" stroke="none"/>'),
  Rx = Be('<path d="M20 4L9.2 14.8"/><path d="M20 4h-3.6M20 4v3.6"/><path d="M6.4 12.2l5.4 5.4"/><path d="M8.6 15.4L4 20"/>'),
  Sx = Be('<path d="M4.2 17.8C6.8 9.6 12.8 5.4 20 5"/><path d="M8 19.6c2.6-5.6 6.6-8.6 12-9.6" opacity=".6"/><path d="M4 12.4c1.6-3 3.6-5.2 6-6.6" opacity=".4"/>'),
  Mx = Be('<path d="M12 21c-3.9 0-6.5-2.6-6.5-6.1 0-3.4 2.6-5.3 3.6-8.4.4 1.8 1.5 3 2.6 3.4.1-2.9 1.5-5.6 3.9-7.4-.3 3.1 1.1 5 2.4 6.8 1 1.4 1.5 3 1.5 4.9C19.5 18 16.3 21 12 21z"/><path d="M12 21c-1.7 0-2.9-1.2-2.9-2.8 0-1.8 1.6-2.7 2.3-4.3.9 1.2 3.5 2.2 3.5 4.4 0 1.5-1.2 2.7-2.9 2.7z" fill="currentColor" fill-opacity=".35" stroke-width="1.4"/>'),
  Ax = Be('<path d="M12 3.8a8.2 8.2 0 0 1 7.6 5.1"/><path d="M19.9 14.6a8.2 8.2 0 0 1-9.6 5.6"/><path d="M5.3 16.7A8.2 8.2 0 0 1 7.2 5.4"/><path d="M19.6 8.9l1-3M19.6 8.9l-3.1-.6"/><path d="M10.3 20.2l-2.8 1.5M10.3 20.2l-1.3-2.9"/><path d="M7.2 5.4l.2-3.2M7.2 5.4L4.1 4.6"/><circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none"/>'),
  Px = Be('<path d="M12.5 5l7 7-7 7"/><path d="M7 7.5L11.5 12 7 16.5" opacity=".6"/><path d="M3 10l2 2-2 2" opacity=".35"/>'),
  Cx = Be('<path d="M9.4 3.8h5.2v5.6h5.6v5.2h-5.6v5.6H9.4v-5.6H3.8V9.4h5.6z" fill="currentColor" fill-opacity=".22"/>'),
  Hx = Be('<path d="M12 3l7.5 3v5.5c0 4.6-3.2 8.2-7.5 9.5-4.3-1.3-7.5-4.9-7.5-9.5V6z" fill="currentColor" fill-opacity=".2"/><path d="M12 7.2v9.6"/>'),
  Lx = Be('<path d="M13.6 2.6L5 13.6h6.2l-1 7.8 8.6-11.2h-6.2z" fill="currentColor" fill-opacity=".22"/>'),
  Gl = Be('<path d="M12 2.8v4.4M12 16.8v4.4M2.8 12h4.4M16.8 12h4.4M5.5 5.5l3.1 3.1M15.4 15.4l3.1 3.1M5.5 18.5l3.1-3.1M15.4 8.6l3.1-3.1"/><circle cx="12" cy="12" r="2.4" fill="currentColor" stroke="none"/>'),
  rh = Be('<circle cx="12" cy="12" r="6.4"/><path d="M12 2.8v5M12 16.2v5M2.8 12h5M16.2 12h5"/><circle cx="12" cy="12" r="1.3" fill="currentColor" stroke="none"/>'),
  nh = {
    sword: Rx,
    cleave: Sx,
    fire: Mx,
    whirl: Ax,
    dash: Px,
    heal: Cx,
    shield: Hx,
    bolt: Lx,
    burst: Gl,
    star: Wl
  };
var Ul = ["1", "2", "3", "4", "5"],
  Ix = 24,
  Ox = 360,
  oh = 220,
  Nx = 520,
  Fx = new Set(Ul);
function Vx(e) {
  if (!Array.isArray(e)) return [];
  let t = new Set(),
    r = [];
  for (let n of e) {
    let o = typeof n?.key == "string" ? n.key : String(n?.key ?? "");
    if (!Fx.has(o) || t.has(o)) continue;
    t.add(o);
    let a = Number(n.cooldown),
      s = Number(n.cost);
    r.push({
      key: o,
      name: typeof n.name == "string" ? n.name : "",
      icon: typeof n.icon == "string" ? n.icon : "",
      cooldown: Number.isFinite(a) && a > 0 ? a : 0,
      cost: n.cost === void 0 || !Number.isFinite(s) ? null : s
    });
  }
  return r.sort((n, o) => n.key.localeCompare(o.key));
}
function Wx(e) {
  return e > 0 ? e < 1 ? (Math.ceil(e * 10) / 10).toFixed(1) : e < 60 ? String(Math.ceil(e)) : `${Math.ceil(e / 60)}m` : "";
}
function Gx(e, t) {
  return !(t > 0) || !Number.isFinite(e) ? 0 : Math.min(1, Math.max(0, e / t));
}
function Dl(e, t) {
  let r = Math.max(0, Math.round(Number.isFinite(e) ? e : 0)),
    n = Math.max(0, Math.round(Number.isFinite(t) ? t : 0));
  return `${r.toLocaleString("en-US")} / ${n.toLocaleString("en-US")}`;
}
function Bx() {
  let e = [],
    t = n => e.find(o => o.key === n),
    r = (n, o) => n.endsAt > 0 ? Math.max(0, n.endsAt - o) : 0;
  return {
    set(n) {
      e = n.map(o => ({
        ...o,
        ready: !0,
        disabled: !1,
        active: !1,
        endsAt: 0,
        length: 0
      }));
    },
    get: t,
    get slots() {
      return e;
    },
    trigger(n, o, a) {
      let s = t(n);
      if (!s) return !1;
      let i = o === void 0 ? s.cooldown : Number(o);
      return !(i > 0) || !Number.isFinite(i) ? (s.endsAt = 0, s.length = 0) : (s.endsAt = a + i, s.length = i), !0;
    },
    state(n, o) {
      let a = t(n);
      return !a || !o ? !1 : (typeof o.ready == "boolean" && (a.ready = o.ready), typeof o.disabled == "boolean" && (a.disabled = o.disabled), typeof o.active == "boolean" && (a.active = o.active), !0);
    },
    press(n, o) {
      let a = t(n);
      return a ? a.disabled ? "disabled" : r(a, o) > 0 ? "cooling" : a.ready ? "fire" : "notready" : "missing";
    },
    remaining(n, o) {
      let a = t(n);
      return a ? r(a, o) : 0;
    },
    fraction(n, o) {
      let a = t(n);
      return !a || a.length <= 0 ? 0 : Math.min(1, r(a, o) / a.length);
    }
  };
}
var wo = {
  damage: {
    life: .9,
    rise: 46,
    pop: 1.45
  },
  crit: {
    life: 1.15,
    rise: 58,
    pop: 2.1
  },
  heal: {
    life: 1,
    rise: 40,
    pop: 1.3
  },
  xp: {
    life: 1.4,
    rise: 56,
    pop: 1.2
  }
};
function Dx(e, t) {
  let r = wo[e] ?? wo.damage,
    n = Math.min(1, Math.max(0, t / r.life)),
    o = 1 - (1 - n) ** 3,
    a = Math.min(1, t / .14),
    s = r.pop + (1 - r.pop) * (1 - (1 - a) ** 2),
    i = n < .08 ? n / .08 : n > .65 ? Math.max(0, 1 - (n - .65) / .35) : 1;
  return {
    rise: o,
    scale: s,
    opacity: i
  };
}
var zx = /^[MmLlHhVvCcSsQqTtAaZz0-9eE.,+\-\s]+$/;
function Ux(e) {
  let t = e.trim();
  return t.length > 0 && t.length < 4e3 && /^[Mm]/.test(t) && zx.test(t);
}
var Kl = "http://www.w3.org/2000/svg",
  Kx = new Set(["g", "path", "circle", "ellipse", "rect", "line", "polyline", "polygon"]),
  jx = new Set(["d", "cx", "cy", "r", "rx", "ry", "x", "y", "x1", "y1", "x2", "y2", "width", "height", "points", "transform", "fill", "fill-opacity", "fill-rule", "stroke", "stroke-width", "stroke-opacity", "stroke-linecap", "stroke-linejoin", "opacity"]),
  Yx = /^(none|currentColor|#[0-9a-f]{3,8}|[a-z]+|rgba?\([\d\s.,%]+\))$/i;
function ah(e, t, r, n) {
  if (!(n > 6)) for (let o of Array.from(e.children)) {
    let a = o.tagName.toLowerCase();
    if (!Kx.has(a)) continue;
    let s = r.createElementNS(Kl, a);
    for (let i of Array.from(o.attributes)) {
      let l = i.name.toLowerCase();
      jx.has(l) && ((l === "fill" || l === "stroke") && !Yx.test(i.value.trim()) || s.setAttribute(l, i.value));
    }
    ah(o, s, r, n + 1), t.append(s);
  }
}
function qx(e) {
  let t = e.createElementNS(Kl, "svg");
  return t.setAttribute("viewBox", "0 0 24 24"), t.setAttribute("fill", "none"), t.setAttribute("stroke", "currentColor"), t.setAttribute("stroke-width", "1.8"), t.setAttribute("stroke-linecap", "round"), t.setAttribute("stroke-linejoin", "round"), t.setAttribute("aria-hidden", "true"), t.setAttribute("focusable", "false"), t;
}
function Qx(e, t) {
  let r = nh[t],
    n = e.createElement("span");
  if (n.className = "rpk-slot-glyph", r) return n.innerHTML = r, n;
  let o = qx(e);
  if (Ux(t)) {
    let a = e.createElementNS(Kl, "path");
    a.setAttribute("d", t.trim()), o.append(a);
  } else if (/^\s*<svg[\s>]/i.test(t) && typeof DOMParser == "function") {
    let a = new DOMParser().parseFromString(t, "image/svg+xml").documentElement;
    if (a && a.tagName.toLowerCase() === "svg") {
      let s = a.getAttribute("viewBox");
      s && /^[\d\s.,\-]+$/.test(s) && o.setAttribute("viewBox", s), ah(a, o, e, 0);
    }
  }
  return o.childElementCount === 0 ? (n.innerHTML = Gl, n) : (n.append(o), n);
}
function ih(e) {
  let {
      layer: t,
      root: r
    } = e,
    n = t.ownerDocument ?? document,
    o = (B, d) => {
      let c = n.createElement(B);
      return c.className = d, c;
    },
    a = B => {
      let d = o("span", `rpk-vital ${B}`),
        c = o("i", "rpk-vital-trail"),
        u = o("i", "rpk-vital-fill"),
        x = o("span", "rpk-vital-text");
      return d.append(c, u, x), {
        el: d,
        fill: u,
        trail: c,
        text: x,
        ratio: -1
      };
    },
    s = (B, d, c, u) => {
      let x = Gx(d, c);
      x !== B.ratio && (B.fill.style.transform = `scaleX(${x})`, B.trail.style.transform = `scaleX(${x})`, B.el.classList.toggle("rpk-low", x > 0 && x <= .3), B.el.classList.toggle("rpk-empty", x <= 0), B.ratio = x);
      let O = u ? Dl(d, c) : "";
      B.text.textContent !== O && (B.text.textContent = O);
    },
    i = o("div", "rpk-dock"),
    l = o("div", "rpk-unit rpk-glass"),
    p = o("span", "rpk-unit-disc");
  p.setAttribute("aria-hidden", "true"), p.innerHTML = `<span class="rpk-unit-glyph">${ni}</span>`;
  let m = o("span", "rpk-unit-bars"),
    E = a("rpk-hp"),
    y = a("rpk-en");
  m.append(E.el, y.el), l.append(p, m), l.setAttribute("role", "status"), l.setAttribute("aria-label", "Health");
  let b = o("div", "rpk-bar rpk-glass");
  b.setAttribute("role", "toolbar"), b.setAttribute("aria-label", "Abilities"), i.append(l, b);
  let R = o("div", "rpk-target rpk-glass");
  R.setAttribute("role", "status");
  let v = o("span", "rpk-target-disc");
  v.setAttribute("aria-hidden", "true");
  let T = o("span", "rpk-target-main"),
    M = o("span", "rpk-target-top"),
    H = o("span", "rpk-micro rpk-target-label");
  H.textContent = "Target";
  let h = o("span", "rpk-target-name rpk-ellipsis");
  M.append(H, h);
  let P = a("rpk-hp rpk-hostile");
  T.append(M, P.el), R.append(v, T);
  let A = o("div", "rpk-floaters");
  A.setAttribute("aria-hidden", "true"), t.prepend(A), t.append(R, i);
  let w = Bx(),
    C = new Set(),
    k = [],
    W = new Map(),
    L = new Set(),
    K = (B, d) => {
      let c = setTimeout(() => {
        L.delete(c), B();
      }, d);
      L.add(c);
    },
    D = 0,
    N = !1,
    g = !1,
    S = !1,
    I = null,
    F = [],
    z = 0,
    U = new zl.Vector3(),
    Q = () => {
      r.classList.toggle("rpk-dock-bar", N), r.classList.toggle("rpk-dock-unit", g);
    },
    $ = (B, d, c) => {
      B.classList.remove(d), B.offsetWidth, B.classList.add(d), K(() => B.classList.remove(d), c);
    },
    ie = B => {
      let d = w.get(B),
        c = W.get(B);
      !d || !c || (c.button.classList.toggle("rpk-disabled", d.disabled), c.button.classList.toggle("rpk-notready", !d.ready && !d.disabled), c.button.classList.toggle("rpk-active", d.active), c.button.setAttribute("aria-disabled", String(d.disabled || !d.ready || w.remaining(B, D) > 0)));
    },
    _ = B => {
      let d = W.get(B);
      if (!d) return;
      let c = w.remaining(B, D),
        u = w.fraction(B, D),
        x = c > 0;
      x !== d.cooling && (d.cooling = x, d.button.classList.toggle("rpk-cooling", x), ie(B), !x && N && $(d.button, "rpk-ready", Nx));
      let O = Math.round(u * 400) / 400;
      O !== d.shownFraction && (d.shownFraction = O, d.sweep.style.setProperty("--rpk-cd", String(O)));
      let j = Wx(c);
      j !== d.shownTime && (d.shownTime = j, d.time.textContent = j);
    },
    J = B => {
      W.clear();
      let d = B.map(c => {
        let u = o("button", "rpk-slot");
        u.type = "button", u.dataset.key = c.key, u.title = c.name, u.setAttribute("aria-label", c.name ? `${c.name} (${c.key})` : c.key), u.setAttribute("aria-keyshortcuts", c.key);
        let x = Qx(n, c.icon),
          O = o("span", "rpk-slot-sweep"),
          j = o("span", "rpk-slot-time"),
          Y = o("kbd", "rpk-slot-key");
        if (Wa(Y, c.key), u.append(x, O, j, Y), c.cost !== null) {
          let re = o("span", "rpk-slot-cost");
          re.textContent = String(c.cost), u.append(re);
        }
        return u.addEventListener("click", () => X.press(c.key, "click")), W.set(c.key, {
          button: u,
          sweep: O,
          time: j,
          shownTime: "",
          shownFraction: -1,
          cooling: !1
        }), u;
      });
      b.replaceChildren(...d);
      for (let c of B) ie(c.key), _(c.key);
    },
    Z = B => {
      B.live = !1, B.el.style.opacity = "0", B.opacity = 0, B.shown = "";
    },
    X = {
      abilities(B) {
        let d = Vx(B);
        w.set(d), k.length = 0, J(d), N = d.length > 0, b.classList.toggle("rpk-show", N), Q();
      },
      onAbility(B) {
        return typeof B != "function" ? () => {} : (C.add(B), () => {
          C.delete(B);
        });
      },
      trigger(B, d) {
        if (!w.trigger(B, d, D)) return;
        let c = W.get(B);
        c && $(c.button, "rpk-fired", oh), _(B), ie(B);
      },
      abilityState(B, d) {
        w.state(B, d) && ie(B);
      },
      cooldown: B => w.remaining(B, D),
      health(B, d) {
        if (B == null) {
          g = !1, l.classList.remove("rpk-show", "rpk-has-energy"), Q();
          return;
        }
        s(E, B, d ?? B, !0), l.setAttribute("aria-label", `Health ${Dl(B, d ?? B)}`), g || (g = !0, l.classList.add("rpk-show"), Q());
      },
      energy(B, d) {
        if (B == null) {
          l.classList.remove("rpk-has-energy");
          return;
        }
        s(y, B, d ?? B, !1), l.classList.add("rpk-has-energy");
      },
      target(B) {
        if (!B || typeof B != "object") {
          S = !1, R.classList.remove("rpk-show");
          return;
        }
        h.textContent = typeof B.name == "string" ? B.name : "";
        let d = Number.isFinite(B.level) ? String(Math.round(B.level)) : null,
          c = d ?? "\xD7";
        if (c !== I) if (I = c, d) {
          v.replaceChildren();
          let u = o("span", "rpk-target-level");
          u.textContent = d, v.append(u);
        } else v.innerHTML = `<span class="rpk-target-glyph">${rh}</span>`;
        s(P, B.hp, B.max, !0), R.setAttribute("aria-label", `Target ${h.textContent}${d ? `, level ${d}` : ""}, ${Dl(B.hp, B.max)}`), S || (S = !0, R.classList.add("rpk-show"));
      },
      floater(B, d, c = "damage") {
        if (typeof d != "string" || d === "") return;
        let u = wo[c] ? c : "damage",
          x = F.find(O => !O.live);
        if (!x) if (F.length < Ix) {
          let O = o("span", "rpk-float");
          O.style.opacity = "0", A.append(O), x = {
            el: O,
            kind: "damage",
            position: new zl.Vector3(),
            age: 0,
            life: 1,
            drift: 0,
            lift: 0,
            live: !1,
            shown: "",
            opacity: 0
          }, F.push(x);
        } else x = F.reduce((O, j) => j.age / j.life > O.age / O.life ? j : O);
        if (Array.isArray(B)) x.position.set(B[0], B[1], B[2]);else if (B && typeof B.x == "number") x.position.copy(B);else return;
        z += 1, x.kind = u, x.life = wo[u].life, x.age = 0, x.drift = (z * .618034 % 1 - .5) * 40, x.lift = z % 3 * 16, x.live = !0, x.shown = "", x.el.className = `rpk-float rpk-float-${u}`, x.el.textContent = d;
      },
      get barShown() {
        return N;
      },
      press(B, d) {
        if (!N) return;
        let c = w.press(B, D),
          u = W.get(B);
        if (c !== "missing") {
          if (c !== "fire") {
            u && $(u.button, "rpk-deny", Ox);
            return;
          }
          u && $(u.button, "rpk-pressed", oh), k.push({
            key: B,
            source: d
          });
        }
      },
      flush() {
        if (k.length === 0) return;
        let B = k.splice(0);
        for (let {
          key: d,
          source: c
        } of B) for (let u of [...C]) u(d, c);
      },
      tick(B, d, c, u) {
        if (D += Number.isFinite(B) ? Math.max(0, B) : 0, N) for (let x of W.keys()) _(x);
        for (let x of F) {
          if (!x.live) continue;
          if (x.age += B, x.age >= x.life) {
            Z(x);
            continue;
          }
          let O = wo[x.kind],
            j = Dx(x.kind, x.age);
          U.copy(x.position).project(d);
          let Y = U.z > 1 || U.z < -1,
            re = (U.x + 1) / 2 * c + x.drift * (.4 + .6 * j.rise),
            se = (1 - U.y) / 2 * u - x.lift - O.rise * j.rise,
            ee = Y ? 0 : Math.round(j.opacity * 100) / 100;
          if (ee !== x.opacity && (x.opacity = ee, x.el.style.opacity = String(ee)), Y) continue;
          let me = `translate3d(${re.toFixed(1)}px, ${se.toFixed(1)}px, 0) translate(-50%, -50%) scale(${j.scale.toFixed(3)})`;
          me !== x.shown && (x.shown = me, x.el.style.transform = me);
        }
      },
      reset() {
        w.set([]), k.length = 0, W.clear(), b.replaceChildren(), N = !1, b.classList.remove("rpk-show"), g = !1, l.classList.remove("rpk-show", "rpk-has-energy"), S = !1, R.classList.remove("rpk-show");
        for (let B of F) B.live && Z(B);
        for (let B of L) clearTimeout(B);
        L.clear(), Q();
      },
      dispose() {
        X.reset(), C.clear(), A.remove(), R.remove(), i.remove();
      }
    };
  return X;
}
var tn = {
    white: "#fafafa",
    black: "#060b0f",
    primary: "#b6ff00",
    neonGreen: "#70f906",
    green: "#39b54a"
  },
  jl = {
    gold: "#ffd74c"
  },
  Yl = {
    display: "data:font/woff2;base64,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",
    body: "data:font/woff2;base64,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"
  };
var ql = `<svg viewBox="0 0 48 48" fill="none" aria-hidden="true"><circle cx="24" cy="24" r="21" fill="${jl.gold}"/><circle cx="24" cy="24" r="16.5" stroke="${tn.black}" stroke-width="1.5"/><path d="M15 32V15h6v5h6v-5h6v17H15Z" fill="${tn.black}"/><path d="M21 25v3m6-3v3" stroke="${jl.gold}" stroke-width="2"/><path d="M8 17a18 18 0 0 1 10-10" stroke="${tn.white}" stroke-width="2" stroke-linecap="round"/></svg>`;
function sh(e, {
  autoRetreat: t = !1
} = {}) {
  let r = e.ownerDocument,
    n = (g, S, I = "") => {
      let F = r.createElement(g);
      return F.className = S, F.textContent = I, F;
    },
    o = n("div", "rpk-coins");
  o.hidden = !0;
  let a = n("button", "rpk-coin-badge rpk-glass");
  a.type = "button";
  let s = n("span", "rpk-coin-icon");
  s.innerHTML = ql;
  let i = n("span", "rpk-coin-count");
  a.append(s, i), a.setAttribute("aria-controls", "rpk-coin-card");
  let l = n("section", "rpk-coin-card rpk-glass");
  l.id = "rpk-coin-card";
  let p = n("div", "rpk-coin-head"),
    m = n("div", "rpk-coin-label"),
    E = n("button", "rpk-coin-close");
  E.type = "button", E.setAttribute("aria-label", "Close hunt progress"), E.innerHTML = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m7 7 10 10M17 7 7 17" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>', p.append(m, E);
  let y = n("div", "rpk-coin-total"),
    b = n("div", "rpk-coin-progress"),
    R = n("i", "");
  b.append(R);
  let v = n("div", "rpk-coin-pips"),
    T = n("div", "rpk-coin-missing"),
    M = n("div", "rpk-coin-hint"),
    H = n("div", "rpk-coin-touch-hint", "Tap the counter or \xD7 to close");
  l.append(p, y, n("div", "rpk-coin-sub", "found in this world"), b, v, T, M, H);
  let h = n("div", "rpk-coin-burst");
  h.innerHTML = ql;
  let P = n("div", "rpk-coin-earned", "+1 coin");
  P.setAttribute("role", "status"), P.setAttribute("aria-live", "polite"), o.append(a, l, h, P), e.prepend(o);
  let A = null,
    w = "",
    C = 0,
    k = !1,
    W = null,
    L = () => {
      W !== null && clearTimeout(W), W = null;
    },
    K = () => {
      L(), o.classList.remove("rpk-coins-stowed"), a.inert = !1, a.removeAttribute("aria-hidden"), !(!t || A?.open) && (W = setTimeout(() => {
        W = null, o.classList.add("rpk-coins-stowed"), a.inert = !0, a.setAttribute("aria-hidden", "true");
      }, 4e3));
    },
    D = () => {
      !A?.open || k || (k = !0, A.onToggle());
    },
    N = g => {
      let S = r.defaultView?.Node;
      A?.open && S && g.target instanceof S && !o.contains(g.target) && D();
    };
  return r.addEventListener("pointerdown", N, !0), E.addEventListener("click", D), a.addEventListener("pointerdown", g => {
    g.stopPropagation(), g.preventDefault();
  }), a.addEventListener("click", g => {
    g.stopPropagation(), !k && (A?.open ? D() : A?.onToggle());
  }), l.addEventListener("pointerdown", g => g.stopPropagation()), l.addEventListener("click", g => g.stopPropagation()), {
    set(g) {
      let S = g && g.here > 0 ? g : null,
        I = A;
      if (A = S, S?.open || (k = !1), o.hidden = !S, !S) {
        L(), o.classList.remove("rpk-collected", "rpk-card-open", "rpk-coins-stowed"), w = "";
        return;
      }
      (!I || I.count !== S.count || I.collection !== S.collection || I.open !== S.open) && K(), o.classList.toggle("rpk-card-open", S.open), a.setAttribute("aria-expanded", String(S.open)), l.inert = !S.open, l.setAttribute("aria-hidden", String(!S.open)), S.collection !== C && (C = S.collection, o.classList.remove("rpk-collected"), C > 0 && (o.offsetWidth, o.classList.add("rpk-collected")));
      let F = [S.count, S.total, S.foundHere, S.here, S.coinName, S.pad].join("|"),
        z = S.coinName.endsWith("s") ? S.coinName : `${S.coinName}s`;
      a.setAttribute("aria-label", `${S.foundHere} of ${S.here} ${z} in this world. ${S.open ? "Close" : "Open"} hunt progress`), F !== w && (w = F, i.replaceChildren(n("strong", "", String(S.foundHere)), n("span", "", `/${S.here}`)), m.textContent = z, y.replaceChildren(n("strong", "", String(S.foundHere)), n("span", "", `/ ${S.here}`)), R.style.transform = `scaleX(${Math.min(1, Math.max(0, S.foundHere / S.here))})`, v.replaceChildren(...Array.from({
        length: Math.min(12, S.here)
      }, (U, Q) => {
        let $ = n("i", Q < S.foundHere ? "rpk-found" : "");
        return $.innerHTML = ql, $;
      })), T.textContent = S.foundHere >= S.here ? "Every coin here is found" : `${S.here - S.foundHere} still hidden here`, M.textContent = S.pad ? "Use the coin counter to close" : "Click the badge or press C to close", P.textContent = `+1 ${S.coinName}`);
    },
    dispose() {
      L(), r.removeEventListener("pointerdown", N, !0), o.remove();
    }
  };
}
var lh = `
.rpk-coins { --rpk-coin-right:calc(var(--rpk-right) + var(--rpk-orb) + 10px); position:absolute; inset:0; pointer-events:none; color:var(--rpk-text); font-family:var(--rpk-font); }
.rpk-coins[hidden] { display:none; }
.rpk-coins .rpk-coin-badge { position:absolute; right:var(--rpk-coin-right); top:calc(var(--rpk-top) + (var(--rpk-orb) - 44px) / 2); min-width:88px; height:44px; padding:4px 14px 4px 5px; display:flex; align-items:center; gap:10px; border-radius:999px; color:inherit; cursor:pointer; pointer-events:auto; transition:transform .5s var(--rpk-ease),opacity .45s,border-color .2s; touch-action:manipulation; }
.rpk-coins-stowed .rpk-coin-badge { opacity:0; transform:translateX(calc(50% + 10px + var(--rpk-orb) / 2)) scale(.35); pointer-events:none; }
.rpk-coin-badge:hover, .rpk-card-open .rpk-coin-badge { border-color:rgba(var(--rpk-a),.65); }
.rpk-coin-badge:active { transform:scale(.96); }
.rpk-coin-badge:focus-visible { outline:2px solid var(--rpk-accent); outline-offset:4px; }
.rpk-coin-icon { position:relative; display:grid; place-items:center; width:34px; height:34px; flex:none; border-radius:50%; background:radial-gradient(circle at 35% 25%,rgba(var(--rpk-a),.18),${tn.black}); border:1px solid rgba(var(--rpk-a),.35); box-shadow:0 0 14px rgba(var(--rpk-a),.2),inset 0 1px 0 rgba(255,255,255,.12); }
.rpk-coin-icon svg { width:26px; height:26px; }
.rpk-coins svg { display:block; }
.rpk-coin-count { display:flex; flex:1; justify-content:center; align-items:center; font-variant-numeric:tabular-nums; }
.rpk-coin-count strong { font-size:21px; font-weight:750; line-height:1; }
.rpk-coin-count span { color:var(--rpk-dim); font-size:15px; font-weight:650; line-height:1; margin-left:2px; }
.rpk-coins .rpk-coin-card { position:absolute; right:var(--rpk-coin-right); top:calc(var(--rpk-top) + var(--rpk-orb) + 10px); width:min(288px,calc(100vw - var(--rpk-coin-right) - max(16px,var(--remix-safe-left,0px)))); box-sizing:border-box; max-height:calc(100vh - var(--rpk-top) - var(--rpk-orb) - 26px - var(--remix-safe-bottom,0px)); max-height:calc(100dvh - var(--rpk-top) - var(--rpk-orb) - 26px - var(--remix-safe-bottom,0px)); overflow-y:auto; overscroll-behavior:contain; padding:14px 18px 18px; border-radius:28px; opacity:0; visibility:hidden; transform:translateY(-8px) scale(.96); transform-origin:top right; transition:opacity .2s,transform .28s var(--rpk-ease),visibility .2s; }
.rpk-card-open .rpk-coin-card { opacity:1; visibility:visible; transform:none; pointer-events:auto; }
.rpk-coin-head { display:flex; justify-content:space-between; align-items:center; gap:8px; }
.rpk-coin-label { color:var(--rpk-accent-text); font-size:11px; font-weight:700; letter-spacing:.12em; text-transform:uppercase; }
.rpk-coin-close { display:grid; place-items:center; width:44px; height:44px; flex:none; margin-right:-10px; border:0; border-radius:50%; background:transparent; color:var(--rpk-dim); cursor:pointer; }
.rpk-coin-close svg { width:22px; height:22px; }
.rpk-coin-close:hover { background:rgba(var(--rpk-a),.1); color:var(--rpk-text); }
.rpk-coin-total { display:flex; align-items:baseline; gap:8px; margin-top:2px; font-variant-numeric:tabular-nums; }
.rpk-coin-total strong { font-size:40px; font-weight:750; line-height:1.1; letter-spacing:-.04em; }
.rpk-coin-total span { color:var(--rpk-dim); font-size:18px; }
.rpk-coin-sub { font-size:12px; color:var(--rpk-dim); margin-top:4px; }
.rpk-coin-progress { height:4px; background:rgba(255,255,255,.08); border-radius:4px; margin:18px 0; overflow:hidden; }
.rpk-coin-progress i { display:block; height:100%; background:var(--rpk-accent); box-shadow:0 0 8px rgba(var(--rpk-a),.6); transform-origin:left; transition:transform .5s; }
.rpk-coin-pips { display:flex; flex-wrap:wrap; gap:7px; margin-bottom:12px; }
.rpk-coin-pips i { width:20px; height:20px; opacity:.25; filter:grayscale(1); }
.rpk-coin-pips svg { width:100%; height:100%; }
.rpk-coin-pips i.rpk-found { opacity:1; filter:none; }
.rpk-coin-missing { font-size:12px; color:var(--rpk-dim); margin-top:4px; }
.rpk-coin-hint, .rpk-coin-touch-hint { font-size:10px; color:var(--rpk-faint); margin-top:16px; }
.rpk-coin-touch-hint { display:none; }
.rpk-coin-burst { position:absolute; top:calc(var(--rpk-top) + 99px); right:calc(var(--rpk-coin-right) + 86px); width:44px; height:44px; opacity:0; }
.rpk-coin-burst svg { width:100%; height:100%; }
.rpk-coin-earned { position:absolute; top:calc(var(--rpk-top) + 60px); right:calc(var(--rpk-coin-right) + 12px); font-size:12px; font-weight:700; color:var(--rpk-accent-text); opacity:0; }
.rpk-collected .rpk-coin-burst { animation:rpk-coin-flight 1s cubic-bezier(.2,.7,.2,1) both; }
.rpk-collected .rpk-coin-badge { animation:rpk-coin-land .45s .75s ease both; }
.rpk-collected .rpk-coin-earned { animation:rpk-coin-earned 1.8s .7s ease both; }
@keyframes rpk-coin-flight { 0% {opacity:0;transform:translate(-20px,30px) scale(.5) rotate(-35deg)} 20% {opacity:1;transform:translate(-10px,-20px) scale(1.2) rotate(0deg)} 65% {opacity:1} 100% {opacity:0;transform:translate(78px,-86px) scale(.5) rotate(330deg)} }
@keyframes rpk-coin-earned-still { 0%,100% {opacity:0} 18%,70% {opacity:1} }
@keyframes rpk-coin-land { 40% {border-color:var(--rpk-accent);box-shadow:0 0 24px rgba(var(--rpk-a),.65);transform:scale(1.08)} }
@keyframes rpk-coin-earned { 0% {opacity:0;transform:translateY(8px)} 18%,70% {opacity:1;transform:none} 100% {opacity:0;transform:translateY(-8px)} }
@media (pointer:coarse), (max-width:600px) { .rpk-coin-hint {display:none} .rpk-coin-touch-hint {display:block} }
@media (prefers-reduced-motion:reduce) { .rpk-coins *, .rpk-coins *::before { animation:none!important;transition:none!important; } .rpk-collected .rpk-coin-earned {animation:rpk-coin-earned-still 1.8s ease both!important;} }
`;
var Xx = 800,
  Jx = 750,
  ch = 2400,
  Zx = 450,
  _x = 650,
  $x = {
    timer: $m,
    lap: eh,
    score: Wl,
    heart: ni,
    pellet: th
  };
function e1(e = 3) {
  let t = Math.min(9, Math.max(1, Math.floor(Number.isFinite(e) ? e : 3))),
    r = [];
  for (let n = t; n >= 1; n--) r.push(String(n));
  return r.push("GO"), r;
}
function uh(e, t) {
  let r = {
    ...e
  };
  for (let n of Object.keys(t)) {
    let o = t[n];
    o !== void 0 && (r[n] = o);
  }
  return typeof r.progress == "number" && (r.progress = Number.isFinite(r.progress) ? Math.min(1, Math.max(0, r.progress)) : null), typeof r.title != "string" && (r.title = ""), r;
}
function ph(e) {
  let t = e.root.ownerDocument ?? document,
    r = (g, S) => {
      let I = t.createElement(g);
      return I.className = S, I;
    },
    n = r("div", "rpk-game"),
    o = r("div", "rpk-strip rpk-glass");
  o.setAttribute("role", "status"), o.setAttribute("aria-live", "off");
  let a = r("span", "rpk-strip-icon");
  a.setAttribute("aria-hidden", "true");
  let s = r("span", "rpk-strip-main"),
    i = r("span", "rpk-micro rpk-micro-accent rpk-strip-title rpk-ellipsis"),
    l = r("span", "rpk-strip-primary rpk-ellipsis");
  s.append(i, l);
  let p = r("span", "rpk-strip-rule"),
    m = r("span", "rpk-strip-secondary rpk-ellipsis"),
    E = r("span", "rpk-strip-bar"),
    y = r("i", "");
  E.append(y), o.append(a, s, p, m, E);
  let b = r("div", "rpk-cd");
  b.setAttribute("aria-live", "assertive");
  let R = r("div", "rpk-gb");
  R.setAttribute("role", "status"), R.setAttribute("aria-live", "polite"), n.append(o, b, R), e.root.prepend(n);
  let v = sh(e.root),
    T = ih({
      layer: n,
      root: e.root
    }),
    M = {
      title: ""
    },
    H = !1,
    h,
    P = null,
    A = null,
    w = null,
    C = [],
    k = g => {
      i.textContent = M.title, i.hidden = !M.title;
      let S = typeof M.primary == "string" && M.primary !== "";
      l.textContent = S ? M.primary : "", l.hidden = !S;
      let I = typeof M.secondary == "string" && M.secondary !== "";
      m.textContent = I ? M.secondary : "", m.hidden = !I, p.hidden = !I;
      let F = typeof M.progress == "number" ? M.progress : null;
      E.hidden = F === null, F !== null && (y.style.transform = `scaleX(${F})`);
      let z = M.icon ?? null;
      z !== h && (h = z, a.innerHTML = z ? `<span class="rpk-strip-glyph">${$x[z]}</span>` : ""), o.classList.toggle("rpk-strip-noicon", !z), H && g !== null && g !== M.title && (o.classList.remove("rpk-flash"), o.offsetWidth, o.classList.add("rpk-flash"), P && clearTimeout(P), P = setTimeout(() => {
        P = null, o.classList.remove("rpk-flash");
      }, _x));
    },
    W = g => {
      let S = A;
      if (S) {
        A = null;
        for (let I of S.timers) clearTimeout(I);
        g || b.replaceChildren(), S.settled || (S.settled = !0, S.resolve(g));
      }
    },
    L = () => {
      w && clearTimeout(w), w = null;
    },
    K = g => {
      let S = g === "GO",
        I = r("div", `rpk-cd-step${S ? " rpk-cd-go" : ""}`),
        F = r("span", "rpk-cd-ring"),
        z = r("span", "rpk-cd-wave"),
        U = r("span", "rpk-cd-num");
      U.textContent = S ? "GO!" : g, I.append(F, z, U), b.replaceChildren(I);
    },
    D = () => {
      for (let g of C) clearTimeout(g);
      C = [], R.classList.remove("rpk-show", "rpk-out"), R.replaceChildren();
    },
    N = {
      collectibles: g => v.set(g),
      get visible() {
        return H;
      },
      show(g) {
        M = uh({
          title: ""
        }, g ?? {
          title: ""
        }), k(null), H || (H = !0, o.classList.add("rpk-show"));
      },
      update(g) {
        if (!g) return;
        let S = M.title;
        M = uh(M, g), k(S);
      },
      hide() {
        v.set(null), W(!1), T.reset(), e.hints?.(null), H && (H = !1, o.classList.remove("rpk-show", "rpk-flash"));
      },
      countdown(g = 3) {
        W(!1), L();
        let S = e1(g);
        return new Promise(I => {
          let F = {
            timers: [],
            resolve: I,
            settled: !1
          };
          A = F, S.forEach((z, U) => {
            let Q = () => {
              A === F && (K(z), z === "GO" ? (e.sound("go"), W(!0), w = setTimeout(() => {
                w = null, A || b.replaceChildren();
              }, Jx)) : e.sound("countdown"));
            };
            U === 0 ? Q() : F.timers.push(setTimeout(Q, U * Xx));
          });
        });
      },
      banner(g, S, I = ch) {
        if (D(), !g) return;
        let F = r("div", "rpk-gb-title");
        F.textContent = g;
        let z = r("div", "rpk-gb-line");
        if (R.append(F, z), S) {
          let Q = r("div", "rpk-gb-sub");
          Q.textContent = S, R.append(Q);
        }
        R.offsetWidth, R.classList.add("rpk-show");
        let U = Math.max(400, Number.isFinite(I) ? I : ch);
        C.push(setTimeout(() => R.classList.add("rpk-out"), U), setTimeout(D, U + Zx));
      },
      abilities: g => T.abilities(g),
      onAbility: g => T.onAbility(g),
      trigger: (g, S) => T.trigger(g, S),
      abilityState: (g, S) => T.abilityState(g, S),
      cooldown: g => T.cooldown(g),
      health: (g, S) => T.health(g, S),
      energy: (g, S) => T.energy(g, S),
      target: g => T.target(g),
      floater: (g, S, I) => T.floater(g, S, I),
      hints: g => e.hints?.(g?.length ? g : null),
      get abilitiesShown() {
        return T.barShown;
      },
      pressAbility: (g, S) => T.press(g, S),
      flushAbilities: () => T.flush(),
      tick: (g, S, I, F) => T.tick(g, S, I, F),
      reset() {
        v.set(null), W(!1), T.reset(), e.hints?.(null), L(), b.replaceChildren(), D(), P && clearTimeout(P), P = null, H = !1, o.classList.remove("rpk-show", "rpk-flash");
      },
      dispose() {
        N.reset(), T.dispose(), v.dispose(), n.remove();
      }
    };
  return k(null), N;
}
var ko = {
    size: 60,
    top: 16,
    right: 16,
    gap: 10,
    safeTop: "--remix-safe-top",
    safeRight: "--remix-safe-right"
  },
  Ql = 8,
  QR = ko.size + 2 * Ql,
  dh = 52,
  fh = (e = ko) => `calc(${e.top}px + var(${e.safeTop}, 0px))`,
  mh = (e = ko) => `calc(${e.right}px + var(${e.safeRight}, 0px))`;
var oi = "rpk-style",
  hh = ko,
  gh = `
${lh}
.rpk-root[data-host-hud="true"] .rpk-hud { display:none; }
.rpk-root[hidden] { display:none; }
.rpk-root {
  --rpk-accent: #b6ff00;
  --rpk-a: 182, 255, 0;
  --rpk-on-accent: #060b0f;
  --rpk-accent-text: #b6ff00;
  --rpk-text: #fafafa;
  --rpk-dim: rgba(250, 250, 250, 0.64);
  --rpk-faint: rgba(250, 250, 250, 0.6);
  --rpk-line: rgba(255, 255, 255, 0.1);
  --rpk-glass: linear-gradient(180deg, rgba(14, 19, 27, 0.84), rgba(6, 10, 15, 0.8));
  --rpk-font: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  --rpk-mono: ui-monospace, 'SF Mono', SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace;
  --rpk-ease: cubic-bezier(0.32, 0.72, 0, 1);
  /* The orb's size and place are PORTAL_ORB_GEOMETRY (./geometry.ts): the
     host's overlay lines up under it; its plate's corner is concentric with it. */
  --rpk-orb: ${hh.size}px;
  --rpk-inset: ${Ql}px;
  --rpk-top: ${fh()};
  --rpk-right: ${mh()};
  /* Ability slots keep their own size (the dock's offsets are built for it). */
  --rpk-slot: ${dh}px;
  --rpk-corner: calc(var(--rpk-orb) / 2 + var(--rpk-inset));
  position: fixed;
  inset: 0;
  z-index: 50;
  pointer-events: none;
  color: var(--rpk-text);
  font: 500 14px/1.4 var(--rpk-font);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  user-select: none;
  -webkit-user-select: none;
  text-rendering: optimizeLegibility;
}
.rpk-root[hidden], .rpk-root[data-rpk-capture] { display: none !important; }
.rpk-root *, .rpk-root *::before, .rpk-root *::after { box-sizing: border-box; }
:where(.rpk-root) :where(button) {
  font: inherit; color: inherit; background: none; border: 0; margin: 0; padding: 0;
  cursor: pointer; text-align: inherit; -webkit-tap-highlight-color: transparent;
}
:where(.rpk-root) :where(button):focus { outline: none; }
:where(.rpk-root) :where(button):focus-visible {
  outline: 2px solid var(--rpk-accent);
  outline-offset: 3px;
}
.rpk-root img { display: block; }
.rpk-root [hidden] { display: none !important; }

/* \u2500\u2500 Glass, ticks, scanlines \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
.rpk-glass {
  position: relative;
  background: var(--rpk-glass);
  -webkit-backdrop-filter: blur(16px) saturate(125%);
  backdrop-filter: blur(16px) saturate(125%);
  border: 1px solid rgba(var(--rpk-a), 0.26);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.07),
    0 0 0 1px rgba(0, 0, 0, 0.28),
    0 14px 40px -12px rgba(0, 0, 0, 0.6),
    0 0 26px -10px rgba(var(--rpk-a), 0.5);
}
.rpk-glass::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  background: repeating-linear-gradient(180deg, rgba(255, 255, 255, 0.022) 0 1px, transparent 1px 3px);
}
.rpk-ticks::before {
  content: '';
  position: absolute;
  inset: -5px;
  pointer-events: none;
  --t: rgba(var(--rpk-a), 0.85);
  background:
    linear-gradient(var(--t), var(--t)) left top / 10px 1.5px no-repeat,
    linear-gradient(var(--t), var(--t)) left top / 1.5px 10px no-repeat,
    linear-gradient(var(--t), var(--t)) right top / 10px 1.5px no-repeat,
    linear-gradient(var(--t), var(--t)) right top / 1.5px 10px no-repeat,
    linear-gradient(var(--t), var(--t)) left bottom / 10px 1.5px no-repeat,
    linear-gradient(var(--t), var(--t)) left bottom / 1.5px 10px no-repeat,
    linear-gradient(var(--t), var(--t)) right bottom / 10px 1.5px no-repeat,
    linear-gradient(var(--t), var(--t)) right bottom / 1.5px 10px no-repeat;
  opacity: 0.9;
}
.rpk-micro {
  font: 600 10px/1 var(--rpk-mono);
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--rpk-faint);
}
.rpk-micro-accent { color: var(--rpk-accent-text); }
.rpk-kbd {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 22px;
  height: 22px;
  padding: 0 6px;
  border-radius: 6px;
  font: 600 11px/1 var(--rpk-mono);
  letter-spacing: 0.02em;
  color: rgba(250, 250, 250, 0.9);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.05));
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-bottom-width: 2px;
  white-space: nowrap;
}
.rpk-icon { display: inline-grid; place-items: center; flex: none; }
@keyframes rpk-spin { to { transform: rotate(360deg); } }
@keyframes rpk-spin-back { to { transform: rotate(-360deg); } }

/* \u2500\u2500 Avatars (creator pfp or initial) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
.rpk-pfp {
  flex: none;
  display: inline-grid;
  place-items: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  overflow: hidden;
  background: linear-gradient(135deg, rgba(var(--rpk-a), 0.9), rgba(var(--rpk-a), 0.45));
  color: var(--rpk-on-accent);
  font: 700 10px/1 var(--rpk-font);
  box-shadow: 0 0 0 1.5px rgba(255, 255, 255, 0.22);
}
.rpk-pfp img { width: 100%; height: 100%; object-fit: cover; }
.rpk-by { display: inline-flex; align-items: center; gap: 6px; min-width: 0; color: var(--rpk-dim); }
.rpk-by b { font-weight: 600; color: var(--rpk-text); }
.rpk-ellipsis { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0; }

/* \u2500\u2500 The portal orb \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
.rpk-hud {
  position: absolute;
  top: var(--rpk-top);
  right: var(--rpk-right);
  width: var(--rpk-orb);
  height: var(--rpk-orb);
}
.rpk-orb {
  position: relative;
  display: block;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  pointer-events: auto;
}
.rpk-orb:focus-visible { outline-offset: 4px; }
.rpk-orb-core {
  position: absolute;
  inset: 0;
  z-index: 3;
  border-radius: 50%;
  transition: transform 0.35s var(--rpk-ease);
}
.rpk-orb:focus-visible .rpk-orb-core { transform: scale(1.05); }
.rpk-orb:active .rpk-orb-core { transform: scale(0.97); transition-duration: 0.1s; }
.rpk-orb-core > span { position: absolute; border-radius: 50%; pointer-events: none; }
/* A soft accent bloom that breathes. */
.rpk-orb-halo {
  inset: -16px;
  background: radial-gradient(closest-side, rgba(var(--rpk-a), 0.5), rgba(var(--rpk-a), 0.16) 58%, transparent);
  animation: rpk-breathe 3.8s ease-in-out infinite;
}
@keyframes rpk-breathe {
  0%, 100% { opacity: 0.5; transform: scale(0.92); }
  50% { opacity: 1; transform: scale(1.04); }
}
/* The housing: a dark disc behind the ring, with only a hairline of it
   showing outside, so the ring reads on pale worlds without a black band. */
.rpk-orb-base {
  inset: 0;
  background: radial-gradient(circle at 50% 38%, rgba(26, 34, 48, 0.97), rgba(4, 7, 11, 0.97) 70%);
  box-shadow:
    0 0 0 0.75px rgba(0, 0, 0, 0.34),
    0 6px 18px -4px rgba(0, 0, 0, 0.75),
    0 0 22px -2px rgba(var(--rpk-a), 0.7),
    inset 0 1px 0 rgba(255, 255, 255, 0.14);
}
/* HUD reticle: four arcs just outside the rim, turning the other way. */
.rpk-orb-reticle {
  inset: -6px;
  background: repeating-conic-gradient(from 20deg, rgba(var(--rpk-a), 0.95) 0 16deg, transparent 16deg 90deg);
  -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 1.7px), #000 calc(100% - 1.2px));
  mask: radial-gradient(farthest-side, transparent calc(100% - 1.7px), #000 calc(100% - 1.2px));
  opacity: 0.5;
  animation: rpk-spin-back 22s linear infinite;
  transition: opacity 0.3s ease, inset 0.35s var(--rpk-ease);
}
/* The energy ring: a dim steady track with two plasma arcs chasing round
   it, white-hot at their heads. It lies over the window's edge, so its glow
   spills into the picture like the rim light of the worlds' own portals. */
.rpk-orb-ring {
  inset: 0.5px;
  background: conic-gradient(
    rgba(var(--rpk-a), 0.45) 0deg,
    rgba(var(--rpk-a), 1) 72deg,
    #fff 90deg,
    rgba(var(--rpk-a), 1) 98deg,
    rgba(var(--rpk-a), 0.45) 150deg,
    rgba(var(--rpk-a), 0.45) 180deg,
    rgba(var(--rpk-a), 1) 252deg,
    #fff 270deg,
    rgba(var(--rpk-a), 1) 278deg,
    rgba(var(--rpk-a), 0.45) 330deg
  );
  -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 4.6px), #000 calc(100% - 4px), #000 calc(100% - 0.5px), transparent);
  mask: radial-gradient(farthest-side, transparent calc(100% - 4.6px), #000 calc(100% - 4px), #000 calc(100% - 0.5px), transparent);
  filter: drop-shadow(0 0 2px rgba(var(--rpk-a), 1)) drop-shadow(0 0 1px rgba(255, 255, 255, 0.7));
  animation: rpk-spin 5s linear infinite;
}
/* The window into the world. WebKit (every iPhone browser and the app) does not
   round off an animated, composited child with overflow and border-radius alone:
   the drifting cover's square corners showed round the orb. The clip path cuts
   every layer inside to the circle. */
.rpk-orb-well {
  inset: 4.5px;
  overflow: hidden;
  isolation: isolate;
  background: #070b11;
  transform: translateZ(0);
  -webkit-clip-path: circle(50%);
  clip-path: circle(50%);
}
.rpk-orb-well > * { position: absolute; inset: 0; border-radius: 50%; }
.rpk-orb-cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: scale(1.3);
  animation: rpk-drift 16s ease-in-out infinite alternate;
}
@keyframes rpk-drift {
  from { transform: scale(1.28) rotate(-7deg); }
  to { transform: scale(1.48) rotate(7deg); }
}
/* No cover: looking down a tunnel at a light, rings falling toward it and
   thin arms turning round it. Light and accent only, so it never goes muddy. */
.rpk-orb-tunnel {
  overflow: hidden;
  background:
    radial-gradient(circle, #fff 0 4%, rgba(255, 255, 255, 0.85) 9%, rgba(var(--rpk-a), 1) 26%, rgba(var(--rpk-a), 0.78) 50%, rgba(var(--rpk-a), 0.46) 76%, rgba(var(--rpk-a), 0.7) 100%),
    #0d141d;
}
.rpk-orb-tunnel > * { position: absolute; border-radius: 50%; }
.rpk-orb-arms {
  inset: -4%;
  display: grid;
  color: rgba(255, 255, 255, 0.34);
  mix-blend-mode: screen;
  /* Turning with the curl, so the arms read as flowing in. */
  animation: rpk-spin 7s linear infinite;
}
.rpk-orb-arms svg { width: 100%; height: 100%; }
.rpk-orb-wave {
  inset: 0;
  box-shadow: inset 0 0 0 1.3px rgba(255, 255, 255, 0.75), inset 0 0 5px rgba(var(--rpk-a), 0.9);
  opacity: 0;
  animation: rpk-fall 2.7s cubic-bezier(0.45, 0, 1, 1) infinite;
}
.rpk-orb-wave:nth-child(3) { animation-delay: -0.9s; }
.rpk-orb-wave:nth-child(4) { animation-delay: -1.8s; }
@keyframes rpk-fall {
  0% { transform: scale(1.02); opacity: 0; }
  16% { opacity: 0.8; }
  100% { transform: scale(0.1); opacity: 0; }
}
.rpk-orb-light {
  inset: 26%;
  background: radial-gradient(closest-side, #fff, rgba(255, 255, 255, 0.7) 32%, rgba(255, 255, 255, 0) 100%);
  animation: rpk-core 3.2s ease-in-out infinite;
}
@keyframes rpk-core {
  0%, 100% { transform: scale(0.82); opacity: 0.8; }
  50% { transform: scale(1.08); opacity: 1; }
}
/* A faint vortex turning over the picture, so it reads as a portal. */
.rpk-orb-vortex {
  background: conic-gradient(
    transparent 0deg,
    rgba(255, 255, 255, 0.34) 26deg,
    transparent 70deg,
    rgba(var(--rpk-a), 0.5) 140deg,
    transparent 190deg,
    rgba(255, 255, 255, 0.28) 250deg,
    transparent 300deg,
    rgba(var(--rpk-a), 0.4) 340deg,
    transparent 360deg
  );
  -webkit-mask: radial-gradient(closest-side, transparent 30%, #000 82%);
  mask: radial-gradient(closest-side, transparent 30%, #000 82%);
  mix-blend-mode: screen;
  opacity: 0.3;
  animation: rpk-spin 9s linear infinite;
}
/* Fresnel: the window's edge glows in the accent, brightest at the rim,
   instead of falling into shadow \u2014 a lit bubble, not a lens barrel. */
.rpk-orb-fresnel {
  background: radial-gradient(closest-side, transparent 64%, rgba(var(--rpk-a), 0.2) 80%, rgba(var(--rpk-a), 0.62) 94%, rgba(255, 255, 255, 0.7) 100%);
  box-shadow: inset 0 0 5px 1px rgba(var(--rpk-a), 0.75);
  mix-blend-mode: screen;
}
/* Specular: a faint glass sheen from the top left. */
.rpk-orb-glint {
  inset: 4.5px;
  background: radial-gradient(52% 34% at 34% 17%, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.04) 62%, transparent 74%);
  mix-blend-mode: screen;
}
.rpk-orb:focus-visible .rpk-orb-reticle { opacity: 1; inset: -5px; }
/* Arrival: the banner lands in the orb \u2014 a shockwave and a flare. */
.rpk-orb-ripple { inset: 0; box-shadow: 0 0 0 2px rgba(var(--rpk-a), 0.95), 0 0 18px rgba(var(--rpk-a), 0.9); opacity: 0; }
.rpk-orb.rpk-pulse .rpk-orb-ripple { animation: rpk-ripple 1s cubic-bezier(0.2, 0.7, 0.2, 1) forwards; }
.rpk-orb.rpk-pulse .rpk-orb-well { animation: rpk-flare 1s ease-out; }
@keyframes rpk-ripple {
  0% { opacity: 1; transform: scale(0.9); }
  100% { opacity: 0; transform: scale(2.3); }
}
@keyframes rpk-flare {
  0% { filter: brightness(1); }
  18% { filter: brightness(2.1) saturate(1.3); }
  100% { filter: brightness(1); }
}

/* Hover plate: glass that unfurls out of the orb, toward the left. The clip
   starts as the orb's circle (the plate's right end) and opens to the whole
   plate plus room for its shadow. It is exactly the orb's row, a pill
   concentric with the orb (PORTAL_ORB_PLATE_HEIGHT), so it never reaches
   under the host's Friends button one gap below the orb. Three lines: the
   world's name, its creator, and the Portals and Controls keys. */
.rpk-plate {
  position: absolute;
  top: calc(-1 * var(--rpk-inset));
  right: calc(-1 * var(--rpk-inset));
  z-index: 1;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  align-content: center;
  gap: 3px;
  width: max-content;
  min-width: 244px;
  max-width: min(360px, calc(100vw - 16px));
  height: calc(var(--rpk-orb) + 2 * var(--rpk-inset));
  padding: 0 calc(var(--rpk-orb) + var(--rpk-inset) + 14px) 0 22px;
  overflow: hidden;
  border-radius: var(--rpk-corner);
  text-align: left;
  cursor: pointer;
  opacity: 0;
  visibility: hidden;
  clip-path: inset(0 0 calc(100% - 2 * var(--rpk-corner)) calc(100% - 2 * var(--rpk-corner)) round var(--rpk-corner));
  transition:
    clip-path 0.34s var(--rpk-ease),
    opacity 0.2s ease 0.06s,
    visibility 0s linear 0.34s;
}
.rpk-orb:focus-visible .rpk-plate {
  opacity: 1;
  visibility: visible;
  clip-path: inset(-2px round calc(var(--rpk-corner) + 2px));
  transition: clip-path 0.42s var(--rpk-ease), opacity 0.14s ease, visibility 0s;
}
/* Flat: the hairline edge only, no drop shadow or glow, so nothing of the
   plate falls across the host's Friends button two pixels below it. */
.rpk-plate.rpk-glass { box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.07), 0 0 0 1px rgba(0, 0, 0, 0.28); }
/* Hidden while the panel is open, and after a close under the pointer until it leaves. */
.rpk-plate-name { font-weight: 750; font-size: 15px; letter-spacing: -0.01em; line-height: 1.15; }
.rpk-plate-by { display: flex; min-width: 0; font-size: 12px; line-height: 16px; }
.rpk-plate-by:empty { display: none; }
.rpk-plate-by .rpk-pfp { width: 16px; height: 16px; font-size: 9px; }
.rpk-plate > * {
  opacity: 0;
  transform: translateX(10px);
  transition: opacity 0.18s ease, transform 0.3s var(--rpk-ease);
}
.rpk-orb:focus-visible .rpk-plate > * {
  opacity: 1;
  transform: none;
  transition: opacity 0.24s ease 0.08s, transform 0.4s var(--rpk-ease) 0.06s;
}
.rpk-orb:focus-visible .rpk-plate-keys { transition-delay: 0.14s, 0.12s; }
.rpk-plate-keys { display: flex; align-items: center; gap: 6px; min-width: 0; }
.rpk-plate-key { display: inline-flex; align-items: center; gap: 6px; }
.rpk-plate-key .rpk-micro { letter-spacing: 0.14em; }
.rpk-plate-key .rpk-kbd { height: 18px; min-width: 18px; padding: 0 5px; font-size: 10px; border-radius: 5px; }
.rpk-plate-dot { width: 3px; height: 3px; border-radius: 50%; background: rgba(var(--rpk-a), 0.6); }

/* The same reveal on hover, only where a pointer can hover: a tap on a touch
   screen leaves a sticky :hover that would hold the plate open. */
@media (hover: hover) {
  .rpk-orb:hover .rpk-orb-core { transform: scale(1.05); }
  .rpk-orb:hover .rpk-orb-reticle { opacity: 1; inset: -5px; }
  .rpk-orb:hover .rpk-plate {
    opacity: 1;
    visibility: visible;
    clip-path: inset(-2px round calc(var(--rpk-corner) + 2px));
    transition: clip-path 0.42s var(--rpk-ease), opacity 0.14s ease, visibility 0s;
  }
  .rpk-orb:hover .rpk-plate > * {
    opacity: 1;
    transform: none;
    transition: opacity 0.24s ease 0.08s, transform 0.4s var(--rpk-ease) 0.06s;
  }
  .rpk-orb:hover .rpk-plate-keys { transition-delay: 0.14s, 0.12s; }
}

/* \u2500\u2500 Arrival banner \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
.rpk-banner {
  position: absolute;
  top: max(11vh, calc(var(--rpk-top) + var(--rpk-orb) + 18px));
  left: 50%;
  transform: translateX(-50%);
  display: grid;
  justify-items: center;
  gap: 10px;
  width: max-content;
  max-width: min(820px, calc(100vw - 48px));
  padding: 22px 44px 22px;
  text-align: center;
  opacity: 0;
  visibility: hidden;
}
.rpk-banner::after {
  content: '';
  position: absolute;
  inset: -40px -140px;
  z-index: -1;
  background: radial-gradient(closest-side, rgba(4, 7, 11, 0.62), rgba(4, 7, 11, 0.32) 55%, transparent);
  pointer-events: none;
}
.rpk-banner.rpk-show { visibility: visible; }
.rpk-banner.rpk-ticks::before { inset: 0; --t: rgba(var(--rpk-a), 0.75); }
.rpk-banner-eyebrow { display: flex; align-items: center; gap: 14px; }
.rpk-banner-eyebrow .rpk-micro {
  padding: 6px 8px 6px calc(10px + 0.34em);
  border-radius: 999px;
  font-size: 11px;
  letter-spacing: 0.34em;
  color: var(--rpk-accent-text);
  background: rgba(4, 7, 11, 0.58);
  border: 1px solid rgba(var(--rpk-a), 0.38);
  box-shadow: 0 0 18px -4px rgba(var(--rpk-a), 0.55);
  text-shadow: 0 0 10px rgba(var(--rpk-a), 0.55);
}
.rpk-rule { width: 56px; height: 1px; background: linear-gradient(90deg, transparent, rgba(var(--rpk-a), 0.9)); }
.rpk-rule:last-child { transform: scaleX(-1); }
.rpk-banner-name {
  max-width: 100%;
  font-size: clamp(32px, 5.6vw, 64px);
  line-height: 1.02;
  font-weight: 800;
  letter-spacing: -0.025em;
  text-wrap: balance;
  text-shadow: 0 2px 18px rgba(0, 0, 0, 0.55), 0 0 42px rgba(var(--rpk-a), 0.4);
}
.rpk-banner-line {
  width: 160px;
  height: 2px;
  border-radius: 2px;
  background: linear-gradient(90deg, transparent, var(--rpk-accent), transparent);
  box-shadow: 0 0 14px rgba(var(--rpk-a), 0.9);
}
.rpk-banner-by { font-size: 15px; }
.rpk-banner-by .rpk-pfp { width: 24px; height: 24px; font-size: 12px; }
.rpk-banner-from { display: inline-flex; align-items: center; gap: 8px; margin-top: 2px; }
.rpk-banner-from svg { width: 14px; height: 14px; color: var(--rpk-accent-text); }
.rpk-banner-from .rpk-micro { letter-spacing: 0.16em; color: var(--rpk-dim); }

/* \u2500\u2500 Prompt and toasts \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
.rpk-prompt {
  position: absolute;
  left: 50%;
  bottom: calc(34px + var(--remix-safe-bottom, 0px));
  display: inline-flex;
  align-items: center;
  gap: 8px;
  max-width: calc(100vw - 48px);
  padding: 10px 18px;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
  opacity: 0;
  transform: translate(-50%, 10px);
  transition: opacity 0.2s ease, transform 0.28s var(--rpk-ease);
}
.rpk-prompt.rpk-show { opacity: 1; transform: translate(-50%, 0); }
.rpk-prompt .rpk-kbd { height: 24px; min-width: 24px; color: var(--rpk-on-accent); background: var(--rpk-accent); border-color: rgba(0, 0, 0, 0.25); box-shadow: 0 0 14px rgba(var(--rpk-a), 0.55); }
.rpk-toasts {
  position: absolute;
  left: 50%;
  bottom: calc(96px + var(--remix-safe-bottom, 0px));
  transform: translateX(-50%);
  display: flex;
  flex-direction: column-reverse;
  align-items: center;
  gap: 8px;
  width: min(520px, calc(100vw - 48px));
}
.rpk-toast {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  max-width: 100%;
  padding: 10px 16px 10px 12px;
  border-radius: 12px;
  font-size: 13.5px;
  font-weight: 550;
  opacity: 0;
  transform: translateY(8px) scale(0.98);
  transition: opacity 0.22s ease, transform 0.3s var(--rpk-ease);
}
.rpk-toast.rpk-show { opacity: 1; transform: none; }
.rpk-toast-dot { flex: none; width: 7px; height: 7px; border-radius: 50%; background: var(--rpk-accent); box-shadow: 0 0 10px rgba(var(--rpk-a), 0.9); }

/* A hint's row: its label, then its keys (or a pad's glyphs). */
.rpk-control { display: flex; align-items: center; gap: 12px; min-width: 0; padding: 5px 0; }
.rpk-control-label { flex: 1 1 auto; min-width: 0; font-size: 13px; line-height: 1.35; color: var(--rpk-text); }
.rpk-keys { flex: none; display: inline-flex; flex-wrap: wrap; align-items: center; justify-content: flex-end; gap: 4px; max-width: 60%; }
.rpk-times { font: 600 10.5px/1 var(--rpk-mono); color: var(--rpk-dim); }
.rpk-kbd.rpk-mouse { gap: 3px; padding: 0 6px 0 2px; font: 650 10.5px/1 var(--rpk-font); letter-spacing: 0; }
.rpk-mouse .rpk-icon svg { width: 18px; height: 18px; }
.rpk-mouse .rpk-lit { fill: var(--rpk-accent-text); }

/* \u2500\u2500 Control hints (world.hud.hints) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
/* Bottom left and quiet: one small pill per line, keys first. Clear of the
   prompt, toasts and dock (bottom centre) and of Remix Desktop's unlock
   popup (bottom right). */
.rpk-hints {
  position: absolute;
  left: calc(20px + var(--remix-safe-left, 0px));
  bottom: calc(20px + var(--remix-safe-bottom, 0px));
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
  max-width: min(320px, calc(50vw - 40px));
  margin: 0;
  padding: 0;
  list-style: none;
  opacity: 0;
  transform: translateY(6px);
  transition: opacity 0.2s ease, transform 0.28s var(--rpk-ease);
}
.rpk-hints.rpk-show { opacity: 1; transform: none; }
.rpk-hints .rpk-control {
  flex-direction: row-reverse;
  justify-content: flex-end;
  gap: 8px;
  max-width: 100%;
  padding: 4px 12px 4px 4px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 999px;
  background: rgba(6, 10, 15, 0.5);
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
}
.rpk-hints .rpk-control-label {
  flex: 0 1 auto;
  overflow: hidden;
  font-size: 12.5px;
  font-weight: 600;
  color: rgba(250, 250, 250, 0.86);
  white-space: nowrap;
  text-overflow: ellipsis;
  text-shadow: 0 1px 6px rgba(0, 0, 0, 0.5);
}
.rpk-hints .rpk-keys { flex-wrap: nowrap; max-width: none; }

/* \u2500\u2500 Mini-game HUD (world.hud, ./hud.ts) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
/* Only while a mini-game runs. The strip sits level with the portal orb and
   is the same height, a glass pill whose left end is a small ringed disc,
   so the two read as one HUD line. It unfurls from its centre. */
.rpk-game { position: absolute; inset: 0; pointer-events: none; }
.rpk-strip {
  position: absolute;
  top: var(--rpk-top);
  left: 50%;
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 190px;
  max-width: min(560px, calc(100vw - 2 * (var(--rpk-right) + var(--rpk-orb) + 20px)));
  height: var(--rpk-orb);
  padding: 0 22px 0 var(--rpk-inset);
  border-radius: calc(var(--rpk-orb) / 2);
  transform: translateX(-50%) translateY(-6px);
  opacity: 0;
  visibility: hidden;
  clip-path: inset(0 calc(50% - var(--rpk-orb) / 2) round calc(var(--rpk-orb) / 2));
  transition:
    clip-path 0.34s var(--rpk-ease),
    transform 0.34s var(--rpk-ease),
    opacity 0.2s ease 0.06s,
    visibility 0s linear 0.34s;
}
.rpk-strip.rpk-show {
  opacity: 1;
  visibility: visible;
  transform: translateX(-50%);
  /* Open wide enough for the glass's drop shadow (40px blur, 14px down). */
  clip-path: inset(-60px round calc(var(--rpk-orb) / 2 + 60px));
  transition: clip-path 0.46s var(--rpk-ease), transform 0.46s var(--rpk-ease), opacity 0.14s ease, visibility 0s;
}
.rpk-strip.rpk-strip-noicon { padding-left: 22px; }
.rpk-strip.rpk-strip-noicon .rpk-strip-icon { display: none; }
/* A phone's orb and hunt counter occupy the top row. Keep the world's
   title and puzzle progress on the next row, at their authored size. */
@media (max-width: 700px), (max-height: 500px) {
  .rpk-strip {
    top: calc(var(--rpk-top) + var(--rpk-orb) + 18px);
    min-width: 0;
    max-width: calc(100vw - 32px);
    height: auto;
    min-height: var(--rpk-orb);
    flex-wrap: wrap;
    padding-top: 10px;
    padding-bottom: 12px;
    gap: 6px 10px;
  }
  .rpk-strip-main { flex: 1; }
  .rpk-strip-rule { display: none; }
  .rpk-strip-secondary { flex: none; width: 100%; font-size: 11px; }
}
.rpk-strip-icon {
  position: relative;
  flex: none;
  display: grid;
  place-items: center;
  width: calc(var(--rpk-orb) - 2 * var(--rpk-inset));
  height: calc(var(--rpk-orb) - 2 * var(--rpk-inset));
  border-radius: 50%;
  background: radial-gradient(circle at 50% 38%, rgba(26, 34, 48, 0.97), rgba(4, 7, 11, 0.97) 70%);
  box-shadow: 0 0 14px -2px rgba(var(--rpk-a), 0.7), inset 0 1px 0 rgba(255, 255, 255, 0.12);
}
/* The orb's energy ring, small: a dim track with a plasma arc chasing round it. */
.rpk-strip-icon::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: conic-gradient(rgba(var(--rpk-a), 0.4) 0deg, rgba(var(--rpk-a), 1) 80deg, #fff 96deg, rgba(var(--rpk-a), 1) 104deg, rgba(var(--rpk-a), 0.4) 170deg, rgba(var(--rpk-a), 0.4) 360deg);
  -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 2.6px), #000 calc(100% - 2.2px));
  mask: radial-gradient(farthest-side, transparent calc(100% - 2.6px), #000 calc(100% - 2.2px));
  filter: drop-shadow(0 0 2px rgba(var(--rpk-a), 1));
  animation: rpk-spin 5s linear infinite;
}
.rpk-strip-glyph { display: grid; place-items: center; color: var(--rpk-accent-text); filter: drop-shadow(0 0 5px rgba(var(--rpk-a), 0.8)); }
.rpk-strip-glyph svg { width: 18px; height: 18px; }
.rpk-strip-main { display: grid; gap: 4px; min-width: 0; }
.rpk-strip-title { font-size: 9.5px; letter-spacing: 0.22em; line-height: 1; }
.rpk-strip-primary {
  font-size: 20px;
  font-weight: 780;
  line-height: 1;
  letter-spacing: -0.01em;
  font-variant-numeric: tabular-nums;
  text-shadow: 0 0 16px rgba(var(--rpk-a), 0.35);
}
.rpk-strip-rule { flex: none; width: 1px; height: 26px; margin-left: 2px; background: linear-gradient(180deg, transparent, rgba(var(--rpk-a), 0.5), transparent); }
.rpk-strip-secondary { font-size: 13px; font-weight: 600; color: var(--rpk-dim); font-variant-numeric: tabular-nums; }
.rpk-strip-bar {
  position: absolute;
  left: calc(var(--rpk-orb) / 2);
  right: calc(var(--rpk-orb) / 2);
  bottom: 5px;
  height: 2px;
  border-radius: 2px;
  background: rgba(255, 255, 255, 0.09);
  overflow: hidden;
}
.rpk-strip-bar i {
  position: absolute;
  inset: 0;
  transform-origin: left center;
  transform: scaleX(0);
  background: linear-gradient(90deg, rgba(var(--rpk-a), 0.7), var(--rpk-accent));
  box-shadow: 0 0 10px rgba(var(--rpk-a), 0.9);
  transition: transform 0.18s linear;
}
/* A new title (next lap, next wave) flares once. */
.rpk-strip.rpk-flash { animation: rpk-strip-flash 0.65s ease-out; }
@keyframes rpk-strip-flash {
  0% { box-shadow: 0 0 0 1px rgba(var(--rpk-a), 0.9), 0 0 38px rgba(var(--rpk-a), 0.85); }
  100% { box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.07), 0 0 0 1px rgba(0, 0, 0, 0.28), 0 14px 40px -12px rgba(0, 0, 0, 0.6), 0 0 26px -10px rgba(var(--rpk-a), 0.5); }
}

/* Countdown: 3 \xB7 2 \xB7 1 \xB7 GO, a ringed numeral a third of the way down. */
.rpk-cd {
  position: absolute;
  left: 50%;
  top: 36%;
  width: 150px;
  height: 150px;
  transform: translate(-50%, -50%);
}
.rpk-cd-step { position: absolute; inset: 0; display: grid; place-items: center; animation: rpk-cd-pop 0.8s var(--rpk-ease) forwards; }
.rpk-cd-step > span { position: absolute; }
.rpk-cd-ring {
  inset: 0;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(4, 7, 11, 0.72) 0 58%, rgba(4, 7, 11, 0.35) 70%, transparent 71%);
}
.rpk-cd-ring::before {
  content: '';
  position: absolute;
  inset: 8px;
  border-radius: 50%;
  background: conic-gradient(rgba(var(--rpk-a), 0.35) 0deg, rgba(var(--rpk-a), 1) 80deg, #fff 96deg, rgba(var(--rpk-a), 1) 104deg, rgba(var(--rpk-a), 0.35) 180deg, rgba(var(--rpk-a), 1) 260deg, #fff 276deg, rgba(var(--rpk-a), 1) 284deg, rgba(var(--rpk-a), 0.35) 360deg);
  -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 5px), #000 calc(100% - 4.4px));
  mask: radial-gradient(farthest-side, transparent calc(100% - 5px), #000 calc(100% - 4.4px));
  filter: drop-shadow(0 0 4px rgba(var(--rpk-a), 1)) drop-shadow(0 0 14px rgba(var(--rpk-a), 0.7));
  animation: rpk-spin 1.6s linear infinite;
}
.rpk-cd-wave { inset: 8px; border-radius: 50%; box-shadow: 0 0 0 2px rgba(var(--rpk-a), 0.9), 0 0 22px rgba(var(--rpk-a), 0.8); animation: rpk-ripple 0.8s cubic-bezier(0.2, 0.7, 0.2, 1) forwards; }
.rpk-cd-num {
  font: 800 78px/1 var(--rpk-font);
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.02em;
  color: #fff;
  text-shadow: 0 2px 16px rgba(0, 0, 0, 0.6), 0 0 34px rgba(var(--rpk-a), 0.8);
}
.rpk-cd-go { animation: rpk-cd-go 0.75s var(--rpk-ease) forwards; }
.rpk-cd-go .rpk-cd-num { font-size: 50px; letter-spacing: 0.04em; color: var(--rpk-accent-text); }
.rpk-cd-go .rpk-cd-ring { background: radial-gradient(circle, rgba(var(--rpk-a), 0.28) 0 58%, rgba(var(--rpk-a), 0.1) 70%, transparent 71%); }
@keyframes rpk-cd-pop {
  0% { opacity: 0; transform: scale(1.45); filter: blur(6px); }
  18% { opacity: 1; transform: scale(1); filter: blur(0); }
  72% { opacity: 1; transform: scale(0.97); }
  100% { opacity: 0; transform: scale(0.82); }
}
@keyframes rpk-cd-go {
  0% { opacity: 0; transform: scale(0.7); }
  22% { opacity: 1; transform: scale(1.08); }
  60% { opacity: 1; transform: scale(1.12); }
  100% { opacity: 0; transform: scale(1.5); filter: blur(4px); }
}

/* Game banner: a title card that fades out in place. */
.rpk-gb {
  position: absolute;
  top: 22vh;
  left: 50%;
  display: grid;
  justify-items: center;
  gap: 12px;
  width: max-content;
  max-width: min(760px, calc(100vw - 48px));
  padding: 18px 44px;
  text-align: center;
  transform: translateX(-50%);
  visibility: hidden;
  opacity: 0;
}
.rpk-gb::after {
  content: '';
  position: absolute;
  inset: -40px -140px;
  z-index: -1;
  background: radial-gradient(closest-side, rgba(4, 7, 11, 0.6), rgba(4, 7, 11, 0.3) 55%, transparent);
  pointer-events: none;
}
.rpk-gb.rpk-show { visibility: visible; animation: rpk-gb-in 0.5s ease-out forwards; }
.rpk-gb.rpk-show.rpk-out { animation: rpk-gb-out 0.45s ease-in forwards; }
.rpk-gb-title {
  max-width: 100%;
  font-size: clamp(30px, 5vw, 58px);
  line-height: 1.02;
  font-weight: 800;
  letter-spacing: -0.025em;
  text-wrap: balance;
  text-shadow: 0 2px 18px rgba(0, 0, 0, 0.55), 0 0 42px rgba(var(--rpk-a), 0.45);
}
.rpk-gb.rpk-show .rpk-gb-title { animation: rpk-gb-title 0.6s var(--rpk-ease) backwards; }
.rpk-gb-line {
  width: 160px;
  height: 2px;
  border-radius: 2px;
  background: linear-gradient(90deg, transparent, var(--rpk-accent), transparent);
  box-shadow: 0 0 14px rgba(var(--rpk-a), 0.9);
}
.rpk-gb.rpk-show .rpk-gb-line { animation: rpk-gb-line 0.6s var(--rpk-ease) 0.15s backwards; }
.rpk-gb-sub {
  padding: 7px 12px 7px calc(12px + 0.2em);
  border-radius: 999px;
  font: 650 12px/1 var(--rpk-mono);
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--rpk-accent-text);
  background: rgba(4, 7, 11, 0.58);
  border: 1px solid rgba(var(--rpk-a), 0.38);
  box-shadow: 0 0 18px -4px rgba(var(--rpk-a), 0.55);
  text-shadow: 0 0 10px rgba(var(--rpk-a), 0.55);
}
@keyframes rpk-gb-in { from { opacity: 0; } to { opacity: 1; } }
@keyframes rpk-gb-out { from { opacity: 1; } to { opacity: 0; transform: translateX(-50%) translateY(-10px); } }
@keyframes rpk-gb-title { from { opacity: 0; transform: translateY(14px) scale(0.98); filter: blur(8px); } to { opacity: 1; transform: none; filter: blur(0); } }
@keyframes rpk-gb-line { from { opacity: 0; transform: scaleX(0); } to { opacity: 1; transform: scaleX(1); } }

/* \u2500\u2500 RPG and combat HUD (world.hud, ./combat.ts) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
/* The dock: the player frame over the ability bar, bottom centre. Slots are
   orb-sized glass wells with an accent rim; a cooldown is a dark wedge that
   sweeps away clockwise from twelve o'clock with the seconds over it. */
.rpk-dock {
  position: absolute;
  left: 50%;
  bottom: calc(18px + var(--remix-safe-bottom, 0px));
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  transform: translateX(-50%);
  pointer-events: none;
}
.rpk-bar {
  display: none;
  gap: 8px;
  padding: 8px;
  border-radius: 22px;
}
.rpk-bar.rpk-show { display: flex; transition: opacity 0.16s ease, transform 0.44s var(--rpk-ease); }
@starting-style { .rpk-bar.rpk-show { opacity: 0; transform: translateY(14px); } }
.rpk-slot {
  position: relative;
  flex: none;
  display: grid;
  place-items: center;
  width: var(--rpk-slot);
  height: var(--rpk-slot);
  border-radius: 14px;
  overflow: hidden;
  pointer-events: auto;
  color: var(--rpk-accent-text);
  background: radial-gradient(circle at 50% 28%, rgba(32, 42, 58, 0.96), rgba(5, 8, 12, 0.97) 76%);
  box-shadow:
    inset 0 0 0 1px rgba(var(--rpk-a), 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.12),
    0 0 14px -6px rgba(var(--rpk-a), 0.8);
  transition: transform 0.14s var(--rpk-ease), box-shadow 0.2s ease, filter 0.2s ease;
}
.rpk-slot:hover {
  box-shadow:
    inset 0 0 0 1.5px rgba(var(--rpk-a), 0.85),
    inset 0 1px 0 rgba(255, 255, 255, 0.14),
    0 0 20px -4px rgba(var(--rpk-a), 0.95);
}
.rpk-slot::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.1), transparent 42%);
}
.rpk-slot-glyph { position: relative; display: grid; place-items: center; filter: drop-shadow(0 0 5px rgba(var(--rpk-a), 0.75)); transition: filter 0.2s ease, color 0.2s ease, opacity 0.2s ease; }
.rpk-slot-glyph svg { width: 28px; height: 28px; }
.rpk-slot-sweep {
  --rpk-cd: 0;
  --rpk-edge: calc((1 - var(--rpk-cd)) * 360deg);
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  opacity: 0;
  background: conic-gradient(
    transparent 0deg calc(var(--rpk-edge) - 2deg),
    rgba(var(--rpk-a), 0.95) calc(var(--rpk-edge) - 2deg) var(--rpk-edge),
    rgba(3, 5, 9, 0.76) var(--rpk-edge) 360deg
  );
}
.rpk-cooling .rpk-slot-sweep { opacity: 1; }
.rpk-cooling .rpk-slot-glyph { filter: saturate(0.35) brightness(0.75); }
.rpk-slot-time {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  font: 800 17px/1 var(--rpk-font);
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.02em;
  color: #fff;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.95), 0 0 10px rgba(0, 0, 0, 0.8);
  pointer-events: none;
}
.rpk-slot-key {
  position: absolute;
  top: 3px;
  left: 3px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  border-radius: 5px;
  font: 700 10px/1 var(--rpk-mono);
  color: rgba(250, 250, 250, 0.94);
  background: rgba(4, 7, 11, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.18);
  pointer-events: none;
}
.rpk-slot-cost {
  position: absolute;
  right: 5px;
  bottom: 4px;
  font: 700 9.5px/1 var(--rpk-mono);
  color: var(--rpk-accent-text);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.95);
  pointer-events: none;
}
/* Not usable now (out of range, no energy): the icon burns red and dims. */
.rpk-notready .rpk-slot-glyph { color: #ff6b7a; opacity: 0.72; filter: drop-shadow(0 0 5px rgba(255, 80, 100, 0.55)); }
.rpk-disabled { filter: grayscale(1) brightness(0.55); }
.rpk-disabled .rpk-slot-glyph { filter: none; }
.rpk-active {
  box-shadow: inset 0 0 0 2px var(--rpk-accent), inset 0 1px 0 rgba(255, 255, 255, 0.14), 0 0 22px -2px rgba(var(--rpk-a), 0.95);
  animation: rpk-slot-active 1.2s ease-in-out infinite;
}
@keyframes rpk-slot-active { 50% { box-shadow: inset 0 0 0 2px #fff, inset 0 1px 0 rgba(255, 255, 255, 0.14), 0 0 30px 0 rgba(var(--rpk-a), 1); } }
.rpk-pressed { transform: scale(0.9); transition-duration: 0.06s; }
/* Fired: a white rim flash; ready again: an accent glint. */
.rpk-slot::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  opacity: 0;
}
.rpk-fired::after { animation: rpk-slot-fire 0.22s ease-out; }
.rpk-ready::after { animation: rpk-slot-ready 0.52s ease-out; }
@keyframes rpk-slot-fire {
  0% { opacity: 1; box-shadow: inset 0 0 0 2px #fff, inset 0 0 18px rgba(var(--rpk-a), 0.9); background: rgba(var(--rpk-a), 0.35); }
  100% { opacity: 0; box-shadow: inset 0 0 0 2px #fff, inset 0 0 18px rgba(var(--rpk-a), 0.9); background: rgba(var(--rpk-a), 0); }
}
@keyframes rpk-slot-ready {
  0% { opacity: 1; box-shadow: inset 0 0 0 2px var(--rpk-accent), inset 0 0 22px rgba(var(--rpk-a), 0.95); }
  100% { opacity: 0; box-shadow: inset 0 0 0 1px var(--rpk-accent), inset 0 0 4px rgba(var(--rpk-a), 0); }
}
/* Refused (cooling down, not ready, disabled): a short shake with a red rim. */
.rpk-deny { animation: rpk-slot-deny 0.36s cubic-bezier(0.36, 0.07, 0.19, 0.97); box-shadow: inset 0 0 0 1.5px rgba(255, 77, 94, 0.9), 0 0 16px -4px rgba(255, 77, 94, 0.9); }
@keyframes rpk-slot-deny {
  15%, 55% { transform: translateX(-3px); }
  35%, 75% { transform: translateX(3px); }
  90% { transform: translateX(-1px); }
}

/* Health and energy bars: a fill over a lighter trail that lags a hit. */
.rpk-vital {
  position: relative;
  display: block;
  height: 12px;
  border-radius: 6px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.08);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.08), inset 0 1px 2px rgba(0, 0, 0, 0.5);
}
.rpk-vital > i {
  position: absolute;
  inset: 0;
  transform-origin: left center;
  transform: scaleX(0);
}
.rpk-vital-trail { background: rgba(255, 255, 255, 0.6); transition: transform 0.5s ease-in 0.28s; }
.rpk-vital-fill { transition: transform 0.14s ease-out; }
.rpk-vital-fill::after {
  content: '';
  position: absolute;
  inset: 0 0 50% 0;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.32), transparent);
}
.rpk-hp .rpk-vital-fill { background: linear-gradient(180deg, #92ff72, #2dcf58); box-shadow: 0 0 10px rgba(80, 255, 120, 0.45); }
.rpk-hp.rpk-low .rpk-vital-fill { background: linear-gradient(180deg, #ff9272, #e8323f); animation: rpk-low 0.9s ease-in-out infinite; }
@keyframes rpk-low { 50% { filter: brightness(1.45); } }
.rpk-hp.rpk-hostile .rpk-vital-fill { background: linear-gradient(180deg, #ff7f8a, #d42a3c); box-shadow: 0 0 10px rgba(255, 70, 90, 0.45); animation: none; }
.rpk-vital-text {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  font: 700 9.5px/1 var(--rpk-mono);
  letter-spacing: 0.06em;
  font-variant-numeric: tabular-nums;
  color: #fff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.95), 0 0 6px rgba(0, 0, 0, 0.6);
}
.rpk-en { height: 6px; border-radius: 3px; display: none; }
.rpk-has-energy .rpk-en { display: block; }
.rpk-en .rpk-vital-fill { background: linear-gradient(90deg, rgba(var(--rpk-a), 0.7), var(--rpk-accent)); box-shadow: 0 0 8px rgba(var(--rpk-a), 0.8); }
.rpk-en .rpk-vital-fill::after { display: none; }

/* A ringed disc, the orb's energy ring in small (player and target frames). */
.rpk-unit-disc, .rpk-target-disc {
  position: relative;
  flex: none;
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: radial-gradient(circle at 50% 38%, rgba(26, 34, 48, 0.97), rgba(4, 7, 11, 0.97) 70%);
  --rpk-ring: var(--rpk-a);
  box-shadow: 0 0 12px -2px rgba(var(--rpk-ring), 0.7), inset 0 1px 0 rgba(255, 255, 255, 0.12);
}
.rpk-unit-disc::before, .rpk-target-disc::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: conic-gradient(rgba(var(--rpk-ring), 0.4) 0deg, rgba(var(--rpk-ring), 1) 80deg, #fff 96deg, rgba(var(--rpk-ring), 1) 104deg, rgba(var(--rpk-ring), 0.4) 170deg, rgba(var(--rpk-ring), 0.4) 360deg);
  -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 2.4px), #000 calc(100% - 2px));
  mask: radial-gradient(farthest-side, transparent calc(100% - 2.4px), #000 calc(100% - 2px));
  filter: drop-shadow(0 0 2px rgba(var(--rpk-ring), 1));
  animation: rpk-spin 5s linear infinite;
}
.rpk-unit-disc { --rpk-ring: 96, 255, 130; }
.rpk-target-disc { --rpk-ring: 255, 77, 94; }
.rpk-unit-glyph, .rpk-target-glyph { display: grid; place-items: center; }
.rpk-unit-glyph { color: #86ff8f; filter: drop-shadow(0 0 4px rgba(96, 255, 130, 0.8)); }
.rpk-target-glyph { color: #ff7a86; filter: drop-shadow(0 0 4px rgba(255, 77, 94, 0.8)); }
.rpk-unit-glyph svg, .rpk-target-glyph svg { width: 16px; height: 16px; }
.rpk-target-level { font: 800 14px/1 var(--rpk-font); font-variant-numeric: tabular-nums; color: #fff; text-shadow: 0 0 8px rgba(255, 77, 94, 0.8); }

/* The player frame, as wide as the bar, over it. */
.rpk-unit {
  display: flex;
  align-items: center;
  gap: 10px;
  width: calc(5 * var(--rpk-slot) + 4 * 8px + 16px);
  max-width: calc(100vw - 32px);
  height: 46px;
  padding: 0 16px 0 6px;
  border-radius: 23px;
}
.rpk-unit:not(.rpk-show) { display: none; }
.rpk-unit.rpk-show { transition: opacity 0.16s ease, transform 0.44s var(--rpk-ease); }
@starting-style { .rpk-unit.rpk-show { opacity: 0; transform: translateY(10px); } }
.rpk-unit-bars { flex: 1; min-width: 0; display: grid; gap: 4px; }

/* The target frame, top centre, under the strip (level with the orb without one). */
.rpk-target {
  position: absolute;
  left: 50%;
  top: calc(var(--rpk-top) + var(--rpk-orb) + ${hh.gap}px);
  display: flex;
  align-items: center;
  gap: 10px;
  width: min(300px, calc(100vw - 2 * (var(--rpk-right) + var(--rpk-orb) + 20px)));
  height: 48px;
  padding: 0 16px 0 7px;
  border-radius: 24px;
  border-color: rgba(255, 77, 94, 0.42);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.07),
    0 0 0 1px rgba(0, 0, 0, 0.28),
    0 14px 40px -12px rgba(0, 0, 0, 0.6),
    0 0 26px -10px rgba(255, 77, 94, 0.55);
  opacity: 0;
  visibility: hidden;
  transform: translateX(-50%) translateY(-8px);
  transition: opacity 0.18s ease, transform 0.3s var(--rpk-ease), visibility 0s linear 0.3s, top 0.3s var(--rpk-ease);
}
.rpk-game:not(:has(.rpk-strip.rpk-show)) .rpk-target { top: var(--rpk-top); }
.rpk-target.rpk-show { opacity: 1; visibility: visible; transform: translateX(-50%); transition: opacity 0.14s ease, transform 0.36s var(--rpk-ease), visibility 0s, top 0.3s var(--rpk-ease); }
.rpk-target-main { flex: 1; min-width: 0; display: grid; gap: 5px; }
.rpk-target-top { display: flex; align-items: baseline; gap: 8px; min-width: 0; }
.rpk-target-label { flex: none; font-size: 9px; letter-spacing: 0.22em; color: #ff7a86; }
.rpk-target-name { font-size: 14px; font-weight: 750; line-height: 1.1; letter-spacing: -0.01em; }

/* Floating combat text: pooled spans the kit moves every frame. First in the
   game layer and its own stacking context (a crit's z-index stays inside), so
   banners, the countdown and the frames always draw over it. */
.rpk-floaters { position: absolute; inset: 0; z-index: 0; overflow: hidden; pointer-events: none; }
.rpk-float {
  position: absolute;
  left: 0;
  top: 0;
  white-space: nowrap;
  will-change: transform, opacity;
  font: 850 22px/1 var(--rpk-font);
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.01em;
  color: #fff;
  text-shadow:
    0 2px 0 rgba(3, 5, 9, 0.9),
    1.5px 0 0 rgba(3, 5, 9, 0.9),
    -1.5px 0 0 rgba(3, 5, 9, 0.9),
    0 -1.5px 0 rgba(3, 5, 9, 0.9),
    0 0 12px rgba(0, 0, 0, 0.55);
}
.rpk-float-crit {
  z-index: 1;
  font-size: 32px;
  font-weight: 900;
  color: #ffd84a;
  text-shadow:
    0 2px 0 rgba(40, 8, 0, 0.95),
    2px 0 0 rgba(40, 8, 0, 0.95),
    -2px 0 0 rgba(40, 8, 0, 0.95),
    0 -2px 0 rgba(40, 8, 0, 0.95),
    0 0 20px rgba(255, 110, 30, 0.95);
}
.rpk-float-heal { font-size: 20px; color: #7dff8e; }
.rpk-float-xp { font: 800 15px/1 var(--rpk-mono); letter-spacing: 0.08em; text-transform: uppercase; color: var(--rpk-accent-text); }

/* The prompt and toasts rise above the dock while it shows. */
.rpk-root.rpk-dock-unit .rpk-prompt { bottom: calc(80px + var(--remix-safe-bottom, 0px)); }
.rpk-root.rpk-dock-bar .rpk-prompt { bottom: calc(100px + var(--remix-safe-bottom, 0px)); }
.rpk-root.rpk-dock-bar.rpk-dock-unit .rpk-prompt { bottom: calc(154px + var(--remix-safe-bottom, 0px)); }
.rpk-root.rpk-dock-unit .rpk-toasts { bottom: calc(142px + var(--remix-safe-bottom, 0px)); }
.rpk-root.rpk-dock-bar .rpk-toasts { bottom: calc(162px + var(--remix-safe-bottom, 0px)); }
.rpk-root.rpk-dock-bar.rpk-dock-unit .rpk-toasts { bottom: calc(216px + var(--remix-safe-bottom, 0px)); }

@media (prefers-reduced-motion: reduce) {
  .rpk-root *, .rpk-root *::before, .rpk-root *::after {
    animation: none !important;
    transition-duration: 0.01ms !important;
    transition-delay: 0s !important;
  }
  /* Without their keyframes the banner and a fading step would never show or go. */
  .rpk-gb.rpk-show { opacity: 1; }
  .rpk-gb.rpk-show.rpk-out { opacity: 0; }
  .rpk-cd-wave { display: none; }
}
`;
var bh = 2600,
  yh = 3400,
  t1 = 3,
  Xl = {
    portals: "Portals",
    controls: "Controls",
    hints: "Controls right now"
  };
function ye(e, t = {}, ...r) {
  let n = document.createElement(e);
  for (let [o, a] of Object.entries(t)) a === void 0 || a === !1 || (o === "class" ? n.className = String(a) : n.setAttribute(o, a === !0 ? "" : String(a)));
  for (let o of r) o == null || o === !1 || n.append(typeof o == "string" ? document.createTextNode(o) : o);
  return n;
}
function Jl(e, t) {
  let r = ye("span", {
    class: t ?? "rpk-icon",
    "aria-hidden": "true"
  });
  return r.innerHTML = e, r;
}
function ai(e) {
  return Wa(ye("kbd", {
    class: "rpk-kbd"
  }, e), e);
}
function r1(e) {
  let t = kp(e);
  return t ? ye("kbd", {
    class: "rpk-kbd rpk-mouse",
    title: e,
    "aria-label": e
  }, Jl(_m(t.part)), t.word ? ye("span", {
    "aria-hidden": "true"
  }, t.word) : null) : ai(e);
}
function n1(e) {
  let t = ye("span", {
      class: "rpk-pfp",
      "aria-hidden": "true"
    }),
    r = xp(e?.username),
    n = Ns(e?.pfp);
  if (n) {
    let o = ye("img", {
      alt: "",
      decoding: "async",
      referrerpolicy: "no-referrer"
    });
    o.addEventListener("error", () => t.replaceChildren(r), {
      once: !0
    }), o.src = n, t.append(o);
  } else t.append(r);
  return t;
}
function Eh(e, t = "") {
  let r = Fs(e?.username);
  return r ? ye("span", {
    class: `rpk-by ${t}`.trim()
  }, n1(e), ye("span", {
    class: "rpk-ellipsis"
  }, "by ", ye("b", {}, r))) : null;
}
var ii = 0;
function o1(e) {
  if (ii += 1, e.getElementById(oi)) return;
  let t = e.createElement("style");
  t.id = oi, t.textContent = gh + lf, (e.head ?? e.documentElement).append(t);
}
function a1(e) {
  ii = Math.max(0, ii - 1), ii === 0 && e.getElementById(oi)?.remove();
}
var i1 = () => typeof matchMedia == "function" && matchMedia("(prefers-reduced-motion: reduce)").matches,
  vh = e => {
    let t = e.root.ownerDocument ?? document;
    o1(t);
    let r = new Set(),
      n = u => {
        for (let x of [...r]) x(u);
      },
      o = e.world,
      a = qr(o.accent),
      s = !0,
      i = !1,
      l = null,
      p = "keyboard",
      m = "generic",
      E = new Set(),
      y = (u, x) => {
        let O = setTimeout(() => {
          E.delete(O), u();
        }, x);
        return E.add(O), O;
      },
      b = u => {
        u !== null && (clearTimeout(u), E.delete(u));
      },
      R = ye("div", {
        class: "rpk-root",
        "data-portal-ui": "",
        "data-portal-spawn": "true",
        "data-portal-menu": "host"
      });
    R.dataset.hostHud = String(o.hostUi ?? !1);
    let v = ye("span", {
        class: "rpk-plate-name rpk-ellipsis"
      }),
      T = ye("span", {
        class: "rpk-plate-by"
      }),
      M = ye("span", {
        class: "rpk-plate-keys"
      }, ye("span", {
        class: "rpk-plate-key"
      }, ye("span", {
        class: "rpk-micro"
      }, Xl.portals), ai("Tab")), ye("span", {
        class: "rpk-plate-dot"
      }), ye("span", {
        class: "rpk-plate-key"
      }, ye("span", {
        class: "rpk-micro"
      }, Xl.controls), ai("H"))),
      H = ye("span", {
        class: "rpk-plate rpk-glass",
        "aria-hidden": "true"
      }, v, T, M),
      h = ye("span", {
        class: "rpk-orb-well"
      }),
      P = ye("span", {
        class: "rpk-orb-core",
        "aria-hidden": "true"
      }, ye("span", {
        class: "rpk-orb-halo"
      }), ye("span", {
        class: "rpk-orb-base"
      }), ye("span", {
        class: "rpk-orb-reticle"
      }), h, ye("span", {
        class: "rpk-orb-ring"
      }), ye("span", {
        class: "rpk-orb-glint"
      }), ye("span", {
        class: "rpk-orb-ripple"
      })),
      A = ye("button", {
        type: "button",
        class: "rpk-orb"
      }, H, P),
      w = ye("div", {
        class: "rpk-hud"
      }, A),
      C = ye("div", {
        class: "rpk-banner rpk-ticks",
        role: "status",
        "aria-live": "polite"
      }),
      k = ye("div", {
        class: "rpk-prompt rpk-glass",
        "aria-live": "polite"
      }),
      W = ye("div", {
        class: "rpk-toasts",
        "aria-live": "polite"
      }),
      L = ye("ul", {
        class: "rpk-hints",
        "aria-label": Xl.hints
      }),
      K = nf(t, o.accent);
    R.append(K.el, C, W, k, L, w), e.root.append(R);
    let D = [],
      N = () => {
        let u = sf(t, D, {
          pad: p === "gamepad",
          family: m,
          keyCap: r1
        });
        u.length && L.replaceChildren(...u), L.classList.toggle("rpk-show", u.length > 0);
      },
      g = ph({
        root: R,
        sound: u => e.sound?.(u),
        hints(u) {
          D = (u ?? []).map(x => ({
            ...x,
            keys: [...x.keys]
          })), N();
        }
      }),
      S = () => {
        R.style.setProperty("--rpk-accent", a.hex), R.style.setProperty("--rpk-a", a.rgb.join(", ")), R.style.setProperty("--rpk-on-accent", a.onAccent), R.style.setProperty("--rpk-accent-text", a.text);
      },
      I = null,
      F = () => {
        let u = Fs(o.creator?.username),
          x = o.hostMenu === !0;
        A.setAttribute("aria-label", `${o.name}${u ? `, by ${u}` : ""}${x ? ". Open the portal menu" : ""}`), M.hidden = !x, v.textContent = o.name, T.replaceChildren();
        let O = Eh(o.creator);
        O && T.append(O);
        let j = Ns(o.coverUrl),
          Y = j ?? "";
        if (Y === I) return;
        I = Y;
        let re = () => ye("span", {
            class: "rpk-orb-tunnel"
          }, Jl(Zm, "rpk-orb-arms"), ye("span", {
            class: "rpk-orb-wave"
          }), ye("span", {
            class: "rpk-orb-wave"
          }), ye("span", {
            class: "rpk-orb-wave"
          }), ye("span", {
            class: "rpk-orb-light"
          })),
          se = ye("span", {
            class: "rpk-orb-fresnel"
          });
        if (!j) {
          h.replaceChildren(re(), se);
          return;
        }
        let ee = ye("img", {
            alt: "",
            class: "rpk-orb-cover",
            decoding: "async",
            referrerpolicy: "no-referrer"
          }),
          me = ye("span", {
            class: "rpk-orb-vortex"
          });
        ee.addEventListener("error", () => {
          ee.replaceWith(re()), me.remove();
        }, {
          once: !0
        }), ee.src = j, h.replaceChildren(ee, me, se);
      },
      z = () => {
        let u = t.activeElement;
        u && R.contains(u) && u.blur();
      },
      U = [],
      Q = new Set(),
      $ = (u, x) => {
        let O = y(() => {
          Q.delete(O), u();
        }, x);
        Q.add(O);
      },
      ie = () => {
        for (let u of U) u.cancel();
        U = [];
        for (let u of Q) b(u);
        Q.clear(), C.classList.remove("rpk-show"), C.style.opacity = "";
      },
      _ = () => {
        A.classList.remove("rpk-pulse"), A.offsetWidth, A.classList.add("rpk-pulse"), y(() => A.classList.remove("rpk-pulse"), 1100);
      },
      J = (u, x, O) => {
        Z(u), ie();
        let j = O ?? (x ? "portal" : "entry"),
          Y = ye("div", {
            class: "rpk-banner-name"
          }, u.name),
          re = ye("div", {
            class: "rpk-banner-eyebrow"
          }, ye("span", {
            class: "rpk-rule"
          }), ye("span", {
            class: "rpk-micro"
          }, wp(j)), ye("span", {
            class: "rpk-rule"
          })),
          se = Eh(u.creator, "rpk-banner-by"),
          ee = x && j !== "entry" ? ye("div", {
            class: "rpk-banner-from"
          }, Jl(Jm), ye("span", {
            class: "rpk-micro"
          }, `from ${x.name}`)) : null,
          me = ye("div", {
            class: "rpk-banner-line"
          });
        C.replaceChildren(re, Y, me, ...(se ? [se] : []), ...(ee ? [ee] : [])), C.classList.add("rpk-show");
        let de = (Me, oe, V) => {
            if (typeof Me.animate != "function") return null;
            let ae = Me.animate(oe, V);
            return U.push(ae), ae;
          },
          ne = i1(),
          ce = ne ? 200 : 700,
          Ie = de(C, [{
            opacity: 0
          }, {
            opacity: 1
          }], {
            duration: ce * .6,
            easing: "ease-out",
            fill: "forwards"
          });
        if (!ne) {
          let Me = "cubic-bezier(0.32, 0.72, 0, 1)";
          de(re, [{
            opacity: 0,
            letterSpacing: "0.6em",
            transform: "translateY(-6px)"
          }, {
            opacity: 1,
            letterSpacing: "normal",
            transform: "none"
          }], {
            duration: 600,
            easing: Me,
            fill: "backwards"
          }), de(Y, [{
            opacity: 0,
            transform: "translateY(16px) scale(0.98)",
            filter: "blur(10px)"
          }, {
            opacity: 1,
            transform: "none",
            filter: "blur(0)"
          }], {
            duration: 700,
            delay: 90,
            easing: Me,
            fill: "backwards"
          }), de(me, [{
            transform: "scaleX(0)",
            opacity: 0
          }, {
            transform: "scaleX(1)",
            opacity: 1
          }], {
            duration: 700,
            delay: 260,
            easing: Me,
            fill: "backwards"
          });
          for (let oe of [se, ee]) oe && de(oe, [{
            opacity: 0,
            transform: "translateY(6px)"
          }, {
            opacity: 1,
            transform: "none"
          }], {
            duration: 500,
            delay: 380,
            easing: Me,
            fill: "backwards"
          });
        }
        if (!Ie) {
          C.style.opacity = "1", $(() => {
            ie(), _();
          }, ce + bh);
          return;
        }
        $(() => {
          let Me = C.getBoundingClientRect(),
            oe = P.getBoundingClientRect(),
            V = oe.left + oe.width / 2 - (Me.left + Me.width / 2),
            ae = oe.top + oe.height / 2 - (Me.top + Me.height / 2),
            ve = ne ? de(C, [{
              opacity: 1
            }, {
              opacity: 0
            }], {
              duration: 300,
              easing: "ease-in",
              fill: "forwards"
            }) : de(C, [{
              opacity: 1,
              transform: "translateX(-50%)",
              filter: "blur(0)"
            }, {
              opacity: .9,
              offset: .55
            }, {
              opacity: 0,
              transform: `translate(calc(-50% + ${V}px), ${ae}px) scale(0.06)`,
              filter: "blur(3px)"
            }], {
              duration: 620,
              easing: "cubic-bezier(0.55, 0, 0.75, 0.2)",
              fill: "forwards"
            });
          $(_, ne ? 150 : 480), ve && (ve.onfinish = () => {
            U.includes(ve) && ie();
          });
        }, ce + bh);
      },
      Z = u => {
        o = u, R.dataset.hostHud = String(o.hostUi ?? !1), a = qr(u.accent), K.setAccent(a.hex), S(), F();
      },
      X = u => {
        let x = u?.trim() ? u : null;
        if (x !== l) {
          if (l = x, !x) {
            k.classList.remove("rpk-show");
            return;
          }
          k.replaceChildren(...Tp(x).map(O => O.kind === "key" ? ai(O.value) : ye("span", {}, O.value))), k.classList.add("rpk-show");
        }
      },
      B = [],
      d = u => {
        let x = B.indexOf(u);
        x < 0 || (B.splice(x, 1), b(u.timer), u.el.classList.remove("rpk-show"), y(() => u.el.remove(), 260));
      },
      c = u => {
        if (i || !u) return;
        let x = B.find(Y => Y.text === u);
        if (x) {
          b(x.timer), x.timer = y(() => d(x), yh);
          return;
        }
        let O = ye("div", {
          class: "rpk-toast rpk-glass",
          role: "status"
        }, ye("span", {
          class: "rpk-toast-dot"
        }), ye("span", {}, u));
        W.append(O);
        let j = {
          el: O,
          text: u,
          timer: y(() => d(j), yh)
        };
        for (B.push(j); B.length > t1;) d(B[0]);
        O.offsetWidth, O.classList.add("rpk-show");
      };
    A.remove(), R.addEventListener("mousedown", u => {
      u.target.closest?.("button") && u.preventDefault();
    });
    for (let u of ["pointerdown", "wheel", "contextmenu"]) R.addEventListener(u, x => x.stopPropagation(), {
      passive: u === "wheel"
    });
    return R.addEventListener("keydown", u => {
      let x = u.target;
      (u.key === " " || u.key === "Enter") && x.closest?.("button") && u.stopPropagation();
    }), S(), F(), {
      hud: g,
      setWorld: Z,
      showArrival: J,
      setPrompt: X,
      toast: c,
      setInputDevice(u, x) {
        u === p && x === m || (p = u, m = x, R.dataset.rpkDevice = u, _d(R, u === "gamepad", x), N(), u === "keyboard" && K.set(null));
      },
      setReticle(u) {
        K.set(s ? u : null);
      },
      setCapture(u) {
        u ? R.dataset.rpkCapture = "" : delete R.dataset.rpkCapture;
      },
      get arrivalShowing() {
        return C.classList.contains("rpk-show");
      },
      setVisible(u) {
        u !== s && (s = u, u || (ie(), X(null), g.reset(), z()), R.hidden = !u);
      },
      onAction(u) {
        return r.add(u), () => r.delete(u);
      },
      dispose() {
        if (!i) {
          i = !0;
          for (let u of E) clearTimeout(u);
          E.clear(), ie(), g.dispose(), z(), r.clear(), R.remove(), a1(t);
        }
      }
    };
  };
import * as _e from "./001-three-a973dc20bf0957e55145ef9e6b9c97d50275b224b1d81a57603249dd6750ab96.js";
function s1() {
  let e = new _e.Group();
  e.name = "playground-guide";
  let {
      black: t,
      white: r,
      primary: n
    } = tn,
    o = document.createElement("canvas");
  o.width = 1024, o.height = 832;
  let a = o.getContext("2d"),
    s = new _e.CanvasTexture(o);
  s.colorSpace = _e.SRGBColorSpace;
  let i = new _e.Mesh(new _e.BoxGeometry(3.4, 2.76, .12), new _e.MeshStandardMaterial({
    color: t,
    roughness: .8
  }));
  i.position.y = 2.15, i.castShadow = !0, e.add(i);
  let l = new _e.Mesh(new _e.PlaneGeometry(3.34, 2.71), new _e.MeshBasicMaterial({
    map: s
  }));
  l.position.set(0, 2.15, .065), e.add(l);
  let p = new _e.MeshStandardMaterial({
    color: t,
    roughness: .7
  });
  for (let R of [-1.2, 1.2]) {
    let v = new _e.Mesh(new _e.BoxGeometry(.1, 1.5, .1), p);
    v.position.set(R, .75, 0), v.castShadow = !0, e.add(v);
  }
  let m = '"Playground Outfit", system-ui, sans-serif',
    E = "",
    y = (R, v, T, M) => {
      a.fillStyle = n, a.beginPath(), a.roundRect(v, T, M, 64, 12), a.fill(), a.fillStyle = t, a.font = `600 32px ${m}`, a.textAlign = "center", a.fillText(R, v + M / 2, T + 44), a.textAlign = "left";
    },
    b = (R, v) => {
      let T = `${R}:${v}`;
      if (T === E) return;
      E = T, a.fillStyle = t, a.fillRect(0, 0, 1024, 832), a.fillStyle = n, a.fillRect(0, 0, 1024, 12), a.font = `600 28px ${m}`, a.fillText("REMIX PLAYGROUND", 60, 76), a.fillStyle = r, a.font = '400 66px "Playground Cal", system-ui, sans-serif', a.fillText("Take a Little Wander", 60, 168), a.font = `400 30px ${m}`, a.fillText("Your game is building. Adventure in the meantime.", 60, 224);
      let M = R === "gamepad";
      if (M) y("L", 60, 292, 68), a.fillStyle = r, a.font = `600 34px ${m}`, a.fillText("Left stick to roam", 160, 338);else {
        for (let [H, h] of ["W", "A", "S", "D"].entries()) y(h, 60 + H * 76, 292, 64);
        a.fillStyle = r, a.font = `600 34px ${m}`, a.fillText("or arrow keys to roam", 386, 338);
      }
      y(M ? v === "playstation" ? "\xD7" : v === "nintendo" ? "B" : "A" : "SPACE", 60, 400, 150), a.fillStyle = r, a.font = `600 34px ${m}`, a.fillText("Jump \xB7 press again for extra air", 244, 446), y(M ? "R" : "DRAG", 60, 508, 150), a.fillStyle = r, a.font = `600 34px ${m}`, a.fillText(M ? "Right stick to look around" : "Mouse to look around", 244, 554), a.fillStyle = n, a.font = `600 34px ${m}`, a.fillText("Follow the stones. Step into another world \u2192", 60, 660), a.fillStyle = r, a.font = `400 28px ${m}`, a.fillText("Or head Home for more games. Your build keeps going.", 60, 724), a.fillText(M ? "Keyboard + mouse work too." : "Got a controller? Connect it and press any button.", 60, 775), s.needsUpdate = !0;
    };
  return b("keyboard", "generic"), Promise.all([new FontFace("Playground Cal", `url(${Yl.display})`).load(), new FontFace("Playground Outfit", `url(${Yl.body})`, {
    weight: "100 900"
  }).load()]).then(R => {
    for (let M of R) document.fonts.add(M);
    let [v, T] = E.split(":");
    E = "", b(v, T);
  }).catch(() => {}), {
    root: e,
    update: b
  };
}
var l1 = 1.5,
  c1 = 2,
  u1 = .1,
  p1 = 1 / 30,
  d1 = 1.5,
  f1 = 3e4,
  m1 = .05,
  xh = 400,
  h1 = 1500,
  g1 = 4e3,
  b1 = 250,
  Th = 1,
  y1 = .05,
  E1 = 4,
  v1 = "capture",
  x1 = "__rpkCapture",
  Kt = {
    solo: "Portals open in Remix Desktop",
    unlinked: "This portal isn't connected yet",
    unavailable: "That world isn't available right now",
    failed: "That world didn't open. Try another portal.",
    walkIn: e => `Walk in to travel to ${e}`,
    enter: (e, t) => t ? `[F] Enter ${e} \xB7 or right-click the portal` : `[F] Enter ${e}`,
    opening: e => `Opening ${e}\u2026`,
    closed: e => `${e} isn't available right now`,
    getOut: e => `${e.map(t => `[${t}]`).join(" ")} Get out`
  };
function D2(e) {
  dr.ready();
  let t = e.avatar.scale ?? 1,
    r = {
      gravity: e.physics?.gravity ?? 26,
      jumpSpeed: e.physics?.jumpSpeed ?? 9.5,
      runSpeed: e.physics?.runSpeed ?? 6.5,
      airControl: e.physics?.airControl ?? .55,
      doubleJump: e.physics?.doubleJump ?? !0,
      radius: e.physics?.radius ?? .32 * t,
      height: e.physics?.height ?? 1.1 * t,
      stepHeight: e.physics?.stepHeight
    },
    n = {
      distance: e.camera?.distance ?? 5.5,
      height: e.camera?.height ?? 1.2 * t,
      pitch: e.camera?.pitch ?? .28,
      fov: e.camera?.fov ?? 60,
      zoom: e.camera?.zoom ?? [2.5, 10]
    },
    o = {
      toneMapping: e.render?.toneMapping ?? He.ACESFilmicToneMapping,
      exposure: e.render?.exposure ?? 1,
      shadows: e.render?.shadows ?? !1,
      maxPixelRatio: e.render?.maxPixelRatio ?? 2,
      pixelate: e.render?.pixelate ?? 1,
      bloom: e.render?.bloom ?? null,
      shaderWarmup: e.render?.shaderWarmup,
      phone: Ep()
    },
    a = e.spawn,
    s = e.killY ?? -40;
  T1(e.render?.background);
  let i = vp(o, document.body);
  Rm();
  let {
      renderer: l,
      canvas: p
    } = i,
    m = !1,
    E = Vm(),
    y = !1,
    b = 0,
    R = !0,
    v = !1,
    T = !1,
    M = null,
    H = new He.Scene(),
    h = e.render?.background;
  H.background = h === void 0 ? new He.Color("#10131c") : h, e.render?.fog && (H.fog = e.render.fog);
  let P = Fm(H, l, o),
    A = Hu(n),
    w = A.camera;
  A.setAspect(i.width / i.height);
  let C = ju(H),
    k = $u({
      ...r,
      killY: s,
      spawn: a
    }),
    W = qo(e.avatar),
    L = null,
    K = e.avatar.look;
  H.add(W.root), W.setVisible(!1);
  let D = Ic(),
    N = [],
    g = Rd(),
    S = new Set(),
    I = Tm({
      namespace: gm(e.name),
      storage: bm
    });
  I.standalone();
  window.addEventListener("pagehide", () => I.flush());
  let F = I.records,
    z = zp(),
    U = !1,
    Q = xf({
      hostHasInput: () => U,
      onChange: () => ac(),
      input: () => Z,
      ui: () => X,
      camera: w,
      size: () => ({
        width: i.width,
        height: i.height
      }),
      command: f => ic(f),
      recenter: () => A.recenter(),
      targets: () => z.targets,
      cursorState: () => z.state,
      wantsReticle: () => S.size > 0 || z.override !== null,
      raycast: (f, G, q) => C.raycast(f, G, q),
      toast: f => pr(f),
      active: () => _ === "active",
      getGamepads: typeof navigator < "u" && typeof navigator.getGamepads == "function" ? () => navigator.getGamepads() : null,
      target: window,
      storage: I.settings,
      sendPrefs: f => J?.prefs(f),
      touchLook: () => vf(window)
    });
  I.onSettingsChange(() => Q.reloadSettings());
  let $ = te.body.bottom * t,
    ie = {
      speed: 0,
      runSpeed: r.runSpeed,
      grounded: !0,
      vy: 0,
      jumped: !1,
      landed: !1,
      yaw: 0,
      seated: !0
    },
    _ = "building",
    J = null,
    Z = null,
    X = null,
    B = null,
    d = null,
    c = !1,
    u = new Set(),
    x = null,
    O = null,
    j = -1,
    Y = null,
    re = !1,
    se = 0,
    ee = 0,
    me = -1,
    de = 0,
    ne = null,
    ce = null,
    Ie = new Map(),
    Me = !1,
    oe = null,
    V = 0,
    ae = Number.POSITIVE_INFINITY,
    ve = null,
    ze = null,
    je = [],
    rn = !0,
    Fn = new Set(),
    nn = new Set(),
    jt = new Set(),
    Or = new Set(),
    _t = !1,
    ot = [1, 1, 1],
    we = new He.Vector3(),
    ur = new He.Vector3(),
    $t = new He.Vector3(),
    he = pm({
      scene: H,
      createPortal: _f,
      renderContext: {
        renderer: l,
        accent: e.accent,
        exposure: o.exposure,
        ...(o.bloom ? {
          contentCeiling: o.bloom.threshold * .9
        } : {})
      },
      link: () => J,
      connected: () => c,
      selfGameId: () => d?.self.gameId ?? null,
      raycast: (f, G, q) => C.raycast(f, G, q),
      inTrail: f => d?.trail.some(G => G.gameId === f) ?? !1,
      showsCovers: () => d?.host?.features.includes("loading-v1") ?? !1,
      onAvailability: (f, G) => {
        for (let q of [...jt]) q(f, G);
      },
      onLock: (f, G) => {
        let q = Ie.get(f);
        !G && q && _ === "active" && !Me && (pr(Fd(q)), D.play("portal", .8)), G ? Ie.set(f, G.name) : Ie.delete(f);
        for (let fe of [...Or]) fe(f, G);
      },
      liveWorlds: async () => {
        if (await Fh(), !ve || ve.at === 0) throw new Error("The portal directory did not answer.");
        return Nh(ve.cards);
      }
    }),
    Ht = null,
    Rh = () => {
      if (Ht) return;
      let f = null?.achievements;
      f?.onUnlocked && (Ht = f.onUnlocked(() => {
        he.recheckLocks(), setTimeout(() => void he.recheckLocks(), Sd);
      }));
    };
  i.onResize((f, G) => {
    A.setAspect(f / G), B?.resize(f, G);
  });
  let Yt = Qm({
      scene: H,
      avatar: e.avatar,
      runSpeed: r.runSpeed,
      link: () => J
    }),
    Nr = {
      feet: new He.Vector3(),
      velocity: k.velocity,
      yaw: 0,
      grounded: !0,
      seated: !1,
      riding: !1,
      drawn: new He.Vector3()
    },
    Fr = null,
    Zl = () => c && (d?.host?.features.includes("menu") ?? !1),
    Ro = () => ({
      name: d?.self.name || e.name,
      creator: d?.self.creator ?? null,
      accent: e.accent,
      coverUrl: d?.self.coverUrl ?? null,
      hostUi: d?.host?.features.includes("hud") ?? !1,
      hostMenu: Zl()
    }),
    pr = f => {
      X ? X.toast(f) : je.push(f);
    },
    si = () => {
      let f = _ !== "active" || U;
      if (f !== rn) {
        rn = f;
        for (let G of [...Fn]) G(f);
      }
    },
    _l = () => {
      let f = kh();
      f !== _t && (_t = f, X?.setCapture(f), z.setCapture(f), So = "", pi.collectibles(ui), he.setLabels(!f && !X?.arrivalShowing, !0));
    },
    li = (f, G = f, q = f) => {
      let fe = xe => Number.isFinite(xe) ? Math.min(E1, Math.max(y1, xe)) : 1;
      ot[0] = fe(f), ot[1] = fe(G), ot[2] = fe(q), W.setScale(ot[0], ot[1], ot[2]);
    },
    ci = new Set(),
    ui = null,
    So = "",
    pi = {
      collectibles: f => {
        if (ui = f, d?.host?.features.includes("hud")) {
          X?.hud.collectibles(null);
          let G = f ? {
              count: f.count,
              total: f.total,
              coinName: f.coinName,
              foundHere: f.foundHere,
              here: f.here,
              open: f.open,
              pad: f.pad,
              collection: f.collection
            } : null,
            q = JSON.stringify([G, !_t]);
          q !== So && (So = q, J?.collectibles?.(G, !_t, e.accent));
        } else X?.hud.collectibles(f);
      },
      show: f => X?.hud.show(f),
      update: f => X?.hud.update(f),
      hide: () => {
        pi.collectibles(null), X?.hud.hide();
      },
      countdown: f => X?.hud.countdown(f) ?? Promise.resolve(!1),
      banner: (f, G, q) => X?.hud.banner(f, G, q),
      get visible() {
        return X?.hud.visible ?? !1;
      },
      abilities: f => X?.hud.abilities(f),
      onAbility(f) {
        return ci.add(f), () => {
          ci.delete(f);
        };
      },
      trigger: (f, G) => X?.hud.trigger(f, G),
      abilityState: (f, G) => X?.hud.abilityState(f, G),
      cooldown: f => X?.hud.cooldown(f) ?? 0,
      health: (f, G) => X?.hud.health(f, G),
      energy: (f, G) => X?.hud.energy(f, G),
      target: f => X?.hud.target(f),
      floater: (f, G, q) => X?.hud.floater(f, G, q),
      hints: f => X?.hud.hints(f)
    },
    Mo = fc({
      sdk: () => null?.achievements ?? null,
      active: () => _ === "active"
    }),
    er = () => {
      k.center(ur);
    },
    Sh = () => p.focus({
      preventScroll: !0
    }),
    di = (f, G) => {
      let q = Z?.pointer() ?? {
          x: i.width / 2,
          y: i.height / 2
        },
        fe = f ?? q.x,
        xe = G ?? q.y;
      w.updateMatrixWorld();
      let ge = new He.Ray();
      return ge.origin.setFromMatrixPosition(w.matrixWorld), ge.direction.set(fe / i.width * 2 - 1, -(xe / i.height) * 2 + 1, .5).unproject(w).sub(ge.origin).normalize(), ge;
    },
    $l = {
      held: f => Z?.held(f) ?? !1,
      pressed: f => Z?.pressed(f) ?? !1,
      released: f => Z?.released(f) ?? !1,
      get mouse() {
        let f = Z?.pointer() ?? {
            x: i.width / 2,
            y: i.height / 2
          },
          G = Z?.held("MouseLeft") ?? !1,
          q = Z?.held("MouseRight") ?? !1;
        return {
          left: G,
          right: q,
          x: f.x,
          y: f.y
        };
      },
      axes: () => Z ? Q.device === "gamepad" && Q.move ? Q.axes(oe !== null) : df(Z.moveKeys(), Z.mouse()) : {
        forward: 0,
        strafe: 0,
        turn: 0
      },
      rayAt: di,
      analog: () => !Z || _ !== "active" || U ? {
        moveX: 0,
        moveY: 0,
        lookX: 0,
        lookY: 0,
        lt: 0,
        rt: 0
      } : Q.analog(),
      get device() {
        return Q.device;
      },
      get padFamily() {
        return Q.family;
      }
    },
    fi = null,
    Mh = f => {
      for (let G of f) {
        if (G.button !== 2) continue;
        let q = di(G.x, G.y),
          fe = C.raycast(q.origin, q.direction, xh),
          xe = he.pick(q, k.feet(we), fe ? fe.distance : Number.POSITIVE_INFINITY);
        if (xe) return {
          portal: xe,
          click: G
        };
      }
      return null;
    },
    Ah = () => {
      let f = Z?.clicks ?? [];
      if (!(f.length === 0 || S.size === 0)) for (let G of f) {
        if (G === fi) continue;
        let q = di(G.x, G.y),
          fe = C.raycast(q.origin, q.direction, xh),
          xe = {
            ray: q,
            point: fe ? fe.point : null,
            button: G.button,
            x: G.x,
            y: G.y
          };
        for (let ge of [...S]) ge(xe);
      }
    },
    ec = new He.Raycaster();
  ec.camera = w;
  let Ph = [],
    on = new He.Ray(),
    tc = new He.Matrix4(),
    mi = Number.NaN,
    rc = Number.NaN,
    Ao = 0,
    hi = null,
    Ch = f => {
      let G = Z;
      if (f || x || !G.pointerOnCanvas) hi = null, mi = Number.NaN;else {
        w.updateMatrixWorld();
        let q = G.pointer();
        if (Ao += 1, q.x !== mi || q.y !== rc || !w.matrixWorld.equals(tc) ? Ao >= Wp : z.targets.length > 0 && Ao >= Gp) {
          Ao = 0, mi = q.x, rc = q.y, tc.copy(w.matrixWorld), on.origin.setFromMatrixPosition(w.matrixWorld), on.direction.set(q.x / i.width * 2 - 1, -(q.y / i.height) * 2 + 1, .5).unproject(w).sub(on.origin).normalize();
          let ge = C.raycast(on.origin, on.direction, Gs);
          hi = Dp(on, {
            targets: z.targets,
            portals: he.all(),
            interactables: g.all(),
            occluder: ge ? ge.distance : Number.POSITIVE_INFINITY
          }, ec, Ph);
        }
      }
      z.apply(Bp(!f && G.steering, f ? null : z.override, hi));
    },
    Hh = f => {
      let G = X?.hud;
      if (G) {
        if (G.abilitiesShown) for (let q of Ul) (f.pressed(`Digit${q}`) || f.pressed(`Numpad${q}`)) && G.pressAbility(q, "key");
        G.flushAbilities();
      }
    },
    an = new He.Vector3(),
    gi = new He.Vector3(),
    Lh = new He.Vector3(0, -1, 0),
    nc = {
      ground(f, G, q) {
        let fe = C.raycast(an.set(f, G, q), Lh, gl + bl + 1);
        return fe ? fe.point.y : null;
      },
      fits: (f, G, q) => k.fits(an.set(f, G, q), C),
      clear(f, G) {
        an.set(...f), gi.set(...G).sub(an);
        let q = gi.length();
        return q < 1e-6 || C.raycast(an, gi, q, !0) === null;
      }
    },
    Vn = new He.Vector3(),
    Po = new He.Vector3(),
    sn = (f, G) => {
      if (oe !== f || !f.handle.active) return;
      f.handle.active = !1, oe = null, f.options.pointer === "direct" && (p.removeAttribute("data-rpk-pointer"), Z?.clearHeld()), f.options.hideAvatar && W.setVisible(_ === "active"), f.seat.updateWorldMatrix(!0, !1), f.seat.getWorldPosition(Vn);
      let q = _a(f.seat);
      H.add(W.root), W.root.scale.setScalar(1), W.root.rotation.set(0, q, 0);
      let fe = G ?? f.options.exitPoint?.() ?? null,
        xe = yl(vl(Vn), q, nc, fe ? vl(fe) : null) ?? [Vn.x, Vn.y + .5, Vn.z];
      k.teleport(xe, q), k.frozen = _ !== "active" || x !== null, er(), W.root.position.copy(k.feet(we)), A.setRig(null), ce = null, ne = null, X?.setPrompt(null), f.options.onExit?.();
    },
    Ih = f => {
      let G = {
        active: !1,
        release() {}
      };
      if (_ !== "active" || x || !f?.seat) return queueMicrotask(() => f?.onExit?.()), G;
      oe && sn(oe);
      let q = f.seat,
        fe = {
          active: !0
        },
        xe = {
          options: f,
          seat: q,
          target: f.cameraTarget ?? q,
          exitKeys: f.exitKeys ?? [Ir],
          handle: fe,
          lastFeet: null,
          travelled: 0
        };
      oe = xe, f.hideAvatar && W.setVisible(!1), f.pointer === "direct" && p.setAttribute("data-rpk-pointer", "direct"), k.frozen = !0, q.updateWorldMatrix(!0, !1), q.getWorldScale(Po);
      let ge = Math.max(1e-6, (Math.abs(Po.x) + Math.abs(Po.y) + Math.abs(Po.z)) / 3);
      q.add(W.root), W.root.position.set(0, -$ / ge, 0), W.root.rotation.set(0, 0, 0), W.root.scale.setScalar(1 / ge);
      let be = f.camera ?? {};
      return A.setRig({
        distance: be.distance,
        height: be.height,
        pitch: be.pitch,
        fov: be.fov,
        followRate: be.followSpeed
      }), ce = null, {
        get active() {
          return fe.active;
        },
        release(Oe) {
          sn(xe, Oe ?? null);
        }
      };
    },
    Vr = new He.Vector3(),
    oc = new He.Vector3(),
    Oh = (f, G, q) => {
      if (q.options.update(f, $l), oe !== q) return;
      W.root.updateWorldMatrix(!0, !1), W.root.getWorldPosition(Vr);
      let fe = q.lastFeet,
        xe = fe && f > 0 ? [(Vr.x - fe.x) / f, (Vr.y - fe.y) / f, (Vr.z - fe.z) / f] : [0, 0, 0];
      fe && q.travelled < Th && (q.travelled += fe.distanceTo(Vr)), q.lastFeet = (fe ?? new He.Vector3()).copy(Vr), k.teleport(Vr, _a(q.seat), xe), er(), C.updateTriggers(k.capsule.start, k.capsule.end), q.target.getWorldPosition(oc);
      let ge = Z.mouse();
      A.update(f, {
        zoom: G,
        turn: 0,
        follow: !(ge.left && !ge.right) && !Q.looking
      }, {
        feet: oc,
        heading: _a(q.target)
      }, C.raycast), W.update(f, ie);
    },
    Nh = f => f.filter(G => !he.isMissing(G)),
    Fh = () => !c || !J || ve !== null && ve.at > 0 && ve.cards.length > 0 && performance.now() - ve.at < f1 ? Promise.resolve() : ze || (ze = J.directory().then(q => {
      let fe = d?.self.gameId;
      ve = {
        cards: q.filter(xe => xe.gameId !== fe),
        at: performance.now()
      };
    }).catch(() => {
      ve ??= {
        cards: [],
        at: 0
      };
    }).finally(() => {
      ze = null;
    }), ze),
    bi = f => !X || !c || !J?.menu ? !1 : (Z?.clearHeld(), J.menu(f), !0),
    yi = "",
    ac = () => {
      if (_ !== "active" || !Zl() || !J?.controls) return;
      let f = uf({
          extras: e.controls ?? [],
          device: Q.device,
          family: Q.family,
          connected: Q.connected
        }),
        G = JSON.stringify(f);
      G !== yi && (yi = G, J.controls(f));
    },
    Vh = f => {
      if (!c) {
        pr(Kt.solo);
        return;
      }
      he.spawn(f, {
        feet: k.feet(we),
        yaw: k.yaw
      }), D.play("portal");
    },
    Wh = f => {
      f.type === "portals" && bi();
    },
    ic = f => {
      if (!X || _ !== "active") return !1;
      if (f === "chat") return x || Yt.chat(performance.now()), !1;
      if (f === "menu") bi();else if (f === "help") bi("controls");else {
        let G = oe;
        if (G && G.exitKeys.length > 0) return sn(G), !0;
      }
      return !1;
    },
    Ei = f => {
      let G = um(f, k.feet(we), l1);
      G.y = Math.max(G.y, f.spec.position[1] + .05), k.teleport(G, k.yaw), Z?.clearHeld(), er();
    },
    Gh = f => {
      let G = cr(f.spec.yaw),
        q = f.spec.position,
        fe = new He.Vector3(q[0], q[1] + .05, q[2]).addScaledVector(G, c1);
      k.teleport(fe, f.spec.yaw), k.frozen = !1, Z?.clearHeld(), A.snapBehind(fe, f.spec.yaw + Math.PI), A.keepInFront({
        point: f.center,
        normal: G
      }), W.setVisible(!0), er();
    },
    sc = (f, G = !1) => {
      let q = f.destination,
        fe = he.lockOf(f);
      if (fe) {
        pr(Id(fe)), D.play("bounce", .6), G || Ei(f);
        return;
      }
      if (!c || !q || f.state === "unavailable" || q.gameId === d?.self.gameId) {
        pr(c ? q ? Kt.unavailable : Kt.unlinked : Kt.solo), he.keepOpen(f, hl), G || Ei(f);
        return;
      }
      let xe = cr(f.spec.yaw).negate(),
        ge = Math.max(0, k.velocity.x * xe.x + k.velocity.z * xe.z),
        be = k.velocity.y,
        Oe = A.pitch;
      if (wm(i.shared, !G, he.isResident(q.gameId)) === "seamless") {
        w.updateMatrixWorld(!0);
        let $e = {
          speed: ge,
          vy: be,
          pitch: Oe,
          heldKeys: Z?.heldKeys() ?? [],
          seamless: {
            entry: {
              center: f.center.toArray(),
              yaw: f.spec.yaw
            },
            pose: {
              rig: A.captureRig(),
              feet: k.feet(we).toArray(),
              velocity: k.velocity.toArray(),
              yaw: k.yaw,
              eye: w.position.toArray(),
              quaternion: w.quaternion.toArray(),
              fov: w.fov
            }
          }
        };
        k.frozen = !0, x = f, I.flush(), O = {
          portal: f,
          gameId: q.gameId,
          carry: $e,
          keys: $e.heldKeys.join()
        }, J?.enter(q.gameId, $e);
        return;
      }
      k.frozen = !0, x = f, O = null, I.flush(), he.prepareCrossing(q.gameId, k.feet(we)), X?.setPrompt(null), ne = null, D.play("whoosh"), Q.feedback("portal");
      let Pe = () => {
        if (x !== f || !J) return;
        let $e = {
          speed: ge,
          vy: be,
          pitch: Oe,
          heldKeys: Z?.heldKeys() ?? []
        };
        O = {
          portal: f,
          gameId: q.gameId,
          carry: $e,
          keys: $e.heldKeys.join()
        }, J.enter(q.gameId, $e);
      };
      d?.host?.features.includes("loading-v1") ? Pe() : B?.warpIn({
        portal: f,
        camera: w,
        speed: ge,
        onCovered: Pe
      });
    },
    Bh = () => {
      let f = O;
      if (!f || f.portal !== x || !J || !Z) return;
      let G = Z.heldKeys(),
        q = G.join();
      q !== f.keys && (f.keys = q, f.carry = {
        ...f.carry,
        heldKeys: G
      }, J.enter(f.gameId, f.carry));
    },
    Dh = async f => {
      let G = x;
      !G || _ !== "active" || G.destination?.gameId !== f || (await B?.cancel(), x === G && (x = null, Gh(G), he.keepOpen(G, hl), pr(Kt.failed)));
    },
    zh = () => {
      _ !== "standby" && (oe && sn(oe), _ = "standby", I.hold(), Yt.standby(), Fr = null, Z?.setEnabled(!1), D.setActive(!1), X?.setPrompt(null), X?.setVisible(!1), ne = null, ce = null, B?.settle(), i.park(!0), x = null, k.frozen = !0, W.setVisible(!1), li(1), he.forgetPreloads(), j = -1, se = 0, si());
    },
    lc = f => {
      if (!(f.y > s)) return !1;
      let G = [f.x, f.y, f.z],
        q = yl(G, f.yaw, nc) ?? (k.fits(an.set(f.x, f.y + .05, f.z), C) ? [f.x, f.y + .05, f.z] : null);
      return q ? (k.teleport(q, f.yaw), er(), A.snapBehind(k.feet(we), f.yaw), A.keepInFront(null), W.root.position.copy(k.feet(we)), W.root.rotation.y = k.yaw, !0) : !1;
    },
    Uh = f => {
      let G = Fr;
      if (!G || _ !== "active") return;
      if (f > G.until) {
        Fr = null;
        return;
      }
      let q = Yt.latest(G.peer);
      if (!q) return;
      Fr = null;
      let fe = k.feet(we);
      Math.hypot(fe.x - G.x, fe.z - G.z) > vc || oe || x || lc(q) && W.materialize(420);
    },
    cc = f => {
      u.add(f.id), Yt.arrived(), U = !1, Fr = null;
      let G = _ === "active" && !x;
      if (_ = "active", i.park(!1), x && B?.settle(), x = null, he.warmUp(), Rh(), he.recheck(), Z?.setEnabled(!0), D.setActive(!0), X?.setWorld(Ro()), X?.setVisible(!0), si(), Mo.arrived(), G && f.kind === "entry") {
        j = c ? 1 : -1;
        return;
      }
      li(1), he.setLabels(!1, !0), oe && sn(oe), Z?.clearHeld(), k.frozen = !1, V = i.shared && f.carry?.seamless ? 0 : d1;
      let q = d?.host?.features.includes("loading-v1") === !0,
        fe = q || bo(),
        xe = gc(f, he.candidates());
      if (xe.type === "follow") {
        k.respawn();
        let ge = xe.near.at;
        if ((!ge || !lc(ge)) && (A.snapBehind(k.feet(we), a.yaw), A.keepInFront(null), !ge)) {
          let be = k.feet(we);
          Fr = {
            peer: xe.near.peer,
            until: performance.now() + Ec,
            x: be.x,
            z: be.z
          };
        }
        q || B?.arriveCruise({
          reduced: fe
        });
      } else if (xe.type === "spawn") k.respawn(), A.snapBehind(k.feet(we), a.yaw), A.keepInFront(null), q || B?.arriveCruise({
        reduced: fe
      });else {
        let ge = xe.type === "portal" ? he.byId(xe.portalId) ?? he.ensureReturn(f.from, a) : he.ensureReturn(xe.card, a);
        f.from && he.setDestination(ge, f.from), he.keepOpen(ge, yo);
        let be = yc({
            base: ge.spec.position,
            center: ge.center.toArray(),
            yaw: ge.spec.yaw
          }, f.carry, {
            pitchRange: wr,
            defaultPitch: n.pitch
          }),
          Oe = i.shared ? f.carry?.seamless : void 0;
        if (Oe) {
          let Pe = Gm(Oe.entry, {
            center: ge.center.toArray(),
            yaw: ge.spec.yaw
          }, Oe.pose);
          k.teleport(Pe.feet, Pe.yaw, Pe.velocity), A.restore(k.feet(we), Pe.eye, Pe.quaternion, Pe.fov, Pe.rig, {
            point: ge.center,
            normal: cr(ge.spec.yaw)
          }), A.keepInFront(null), Z?.injectHeld(Si(f.carry?.heldKeys ?? [], !0));
        } else k.teleport(be.feet, be.yaw, be.velocity), fe ? A.snapBehind(k.feet(we), be.yaw, be.camera.pitch) : A.startArrival(ge.center, be.camera.yaw, be.camera.pitch, void 0, {
          speed: Qn(f.carry?.speed ?? 0),
          fov: or,
          settleMs: ar * 1e3
        }), A.keepInFront({
          point: ge.center,
          normal: cr(ge.spec.yaw)
        }), Z?.injectHeld(Si(f.carry?.heldKeys ?? [])), D.play("whoosh", .7), q || B?.arriveCruise({
          reduced: fe
        });
      }
      he.rerollFallbacks(), er(), W.root.position.copy(k.feet(we)), W.root.rotation.y = k.yaw, W.setVisible(!0), f.carry?.seamless || (W.materialize(), X?.showArrival(Ro(), f.from, f.kind)), j = c ? 1 : -1;
    },
    Kh = f => {
      let G = !T && f.renderer === "shared-v1";
      v && !G && wi(!1), v = G;
      let q = d === null;
      if (d = f, So = "", f.mode === "active" && f.host?.features.includes("hud") && J?.collectibles?.(null, !_t, e.accent), c = !0, Yt.context(f), q && Promise.race([he.resolveFixed(), wh(h1)]).finally(() => {
        re = !0;
      }), X?.setWorld(Ro()), f.mode === "standby") {
        zh(), Y = f.previewFor, yi = "";
        return;
      }
      Y = null, f.prefs && Q.setHostPrefs(f.prefs), L = f.look ?? null, W.setLook(L, K);
      let fe = mc(f, u) ?? (_ !== "active" ? {
        id: -1,
        kind: "entry",
        from: null,
        carry: null
      } : null);
      fe && cc(fe), ac();
    },
    vi = f => {
      for (let G of N) G(f, ee);
    },
    jh = (f, G, q) => C.raycast(f, G, q),
    Yh = f => {
      let G = null,
        q = null,
        fe = null;
      if (oe) {
        let xe = oe.exitKeys[0];
        xe && (G = Kt.getOut(Q.device === "gamepad" ? [El(xe)] : [El(xe), "Esc"]));
      } else if (!x) {
        let xe = k.feet(we),
          ge = V > 0 ? null : he.nearest(xe),
          be = V > 0 ? null : he.enterable(xe, w),
          Oe = be?.portal.destination,
          Pe = null,
          $e = null,
          ln = ge?.portal.destination,
          Co = ge ? he.lockOf(ge.portal) : null;
        if (ge && Ad(ge, Co)) Co.bypass && (fe = ge.portal), Pe = {
          distance: ge.distance,
          target: ge.portal,
          text: Od(Co)
        };else if (be && Oe && (!ge || ge.portal === be.portal || ge.distance >= fo)) {
          let cn = be.portal.state !== "unavailable";
          $e = cn ? be.portal : null, Pe = {
            distance: be.distance,
            reach: Ja,
            target: be.portal,
            text: cn ? Kt.enter(Oe.name, Q.device !== "gamepad" && cm(be.portal, w, jh)) : Kt.closed(Oe.name)
          };
        } else if (ge && ln) {
          let cn = ge.portal.spec.mystery ? qa : ln.name;
          Pe = {
            distance: ge.distance,
            target: ge.portal,
            text: ge.portal.state === "loading" ? Kt.opening(cn) : ge.portal.state === "unavailable" ? Kt.closed(cn) : Kt.walkIn(cn)
          };
        }
        let Ho = kd(Pe, Pd(ge, Co) ? [] : g.inReach(k.capsule.start, k.capsule.end));
        Ho && (G = Ho.candidate.text, q = Ho.kind === "interact" ? {
          kind: "interact",
          entry: Ho.candidate.target
        } : fe ? {
          kind: "bypass",
          portal: fe
        } : $e ? {
          kind: "enter",
          portal: $e
        } : {
          kind: "portal"
        });
      }
      ce = q, G !== ne && (ne = G, X?.setPrompt(G));
    },
    qh = f => {
      j === 0 && (j = -1, J?.live());
      let G = Z,
        q = Q.frame(f, {
          possessed: oe !== null,
          crossing: x !== null
        }),
        fe = U;
      si(), he.setLabels(!_t && !X?.arrivalShowing), G.setBlocked(fe), G.beginFrame(), C.updateMovers(ee);
      let xe = G.consumeLook();
      if (x ? Bh() : A.orbit(xe.dx + q.dx, xe.dy + q.dy), oe) {
        let be = oe.exitKeys.find(Oe => G.pressed(Oe));
        be && (G.consumePress(be), sn(oe));
      }
      if (!oe && !x && ce?.kind === "interact" && G.pressed(Ir)) {
        G.consumePress(Ir);
        let be = ce.entry;
        ce = null, be.disposed || be.options.onInteract();
      }
      if (!oe && !x && ce?.kind === "bypass" && G.pressed(Ir)) {
        G.consumePress(Ir);
        let be = ce.portal;
        ce = null;
        let Oe = he.lockOf(be)?.name;
        Me = !0;
        try {
          he.bypass(be);
        } finally {
          Me = !1;
        }
        Oe && pr(Nd(Oe)), D.play("portal", .8), ne = null;
      }
      if (!rn && !x && he.age(f), fi = null, !oe && !x && V <= 0) {
        let be = null;
        if (ce?.kind === "enter" && G.pressed(Ir)) G.consumePress(Ir), be = ce.portal;else {
          let Oe = Mh(G.clicks);
          Oe && (fi = Oe.click, be = Oe.portal);
        }
        be && he.timeLeft(be) !== null && (ce = null, sc(be, !0));
      }
      let ge = !1;
      if (oe) G.consumeJump(), Oh(f, xe.zoom, oe), he.update(f, w, k.feet(we), !0), V > 0 && (V = Math.max(0, V - f));else {
        let be = Q.move && !G.steering ? ff(Q.move, k.yaw, A.yaw, f) : pf(G.moveKeys(), G.mouse(), k.yaw, A.yaw, f);
        k.frozen || (k.yaw = be.facing);
        let Oe = {
            moveX: be.moveX,
            moveZ: be.moveZ,
            sprint: G.sprint || Q.sprint,
            jumpPressed: G.consumeJump(),
            jumpHeld: G.jumpHeld
          },
          Pe = k.step(f, Oe, C);
        if (ge = Pe.respawned, Pe.respawned) {
          let $e = he.returnPortal;
          if ($e) {
            let ln = cr($e.spec.yaw).multiplyScalar(1.2).add(k.feet(we));
            k.teleport(ln, a.yaw);
          }
          A.snapBehind(k.feet(we), a.yaw), A.keepInFront(null), W.materialize(420), er();
          for (let ln of [...nn]) ln("fall");
        }
        if (Pe.jumped && D.play("jump", Pe.doubleJumped ? 1.2 : 1), Pe.landed && Pe.landSpeed > 4 && D.play("land", Pe.landSpeed / 14), Pe.landed && Pe.landSpeed > 12 && Q.feedback("land", Pe.landSpeed), Pe.bounced && D.play("bounce"), k.feet(we), k.center($t), k.frozen || C.updateTriggers(k.capsule.start, k.capsule.end), he.update(f, w, we, !0), V > 0 && (V = Math.max(0, V - f)), !x && !k.frozen && !Pe.respawned) {
          let $e = he.crossed(ur, $t);
          $e && V > 0 ? (Ei($e), k.feet(we), k.center($t)) : $e && sc($e);
        }
        ur.copy($t), W.root.position.copy(we).add(k.smoothing), W.update(f, k.motion(Pe)), x || A.update(f, {
          zoom: xe.zoom,
          turn: ge ? 0 : be.cameraTurn,
          follow: be.cameraFollow
        }, {
          feet: we,
          heading: k.yaw
        }, C.raycast);
      }
      Ah(), Hh(G), vi(f), Yh(f), Ch(fe), X?.hud.tick(f, w, i.width, i.height), Yt.peerCount > 0 && Qh(f), B?.cruising || i.render(H, w, f), i.shared ? B?.step(f) : B?.render(f), j > 0 && (j -= 1);
    },
    Qh = f => {
      k.feet(Nr.feet), Nr.yaw = k.yaw, Nr.grounded = oe ? !0 : k.grounded, Nr.seated = oe !== null, Nr.riding = oe !== null && oe.travelled >= Th, W.root.getWorldPosition(Nr.drawn), Yt.frame(f, de, w, Nr, x !== null);
    },
    Xh = f => {
      C.updateMovers(ee), vi(f), he.update(f, w, k.feet(we), !1), performance.now() >= ae && i.render(H, w, f);
    },
    Jh = () => {
      let f = se;
      se = 0, C.updateMovers(ee), vi(f), he.update(f, w, k.feet(we), !1);
    },
    Zh = f => {
      if (se += f, se >= (v ? p1 : u1) && Jh(), Y && re && d) {
        let G = bc(Y, d, he.candidates());
        if (G.type === "return") he.ensureReturn(G.card, a);else {
          let q = Ri(Y, d);
          q && he.openWayBack(G.portalId, q);
        }
      }
    },
    xi = f => {
      let G = me < 0 ? 0 : Math.min(m1, Math.max(0, (f - me) / 1e3));
      me = f, de = f, ee += G, _l(), _ === "active" ? qh(G) : _ === "standby" ? Zh(G) : _ === "pending" && Xh(G), Ti();
    },
    uc = () => !m && E.mayGo(_ === "active"),
    Ti = () => {
      if (!v || !J) return;
      if (!uc()) {
        y = !0;
        return;
      }
      y = !1, m = !0;
      let f = b,
        G = R;
      R = !1, P.frame(w, he.all(), W.root, G).then(q => {
        !v || f !== b || (E.sent(q.data.seq, q.data.snapshot !== void 0), J?.scene?.(q.data, q.transfer));
      }).catch(q => {
        J?.sceneFailed?.(String(q)), wi(!0);
      }).finally(() => {
        m = !1, y && f === b && uc() && Ti();
      });
    },
    wi = f => {
      v = !1, f && (T = !0), b += 1, E.reset(), y = !1, R = !0, i.shared && i.setShared(!1);
    },
    _h = async f => {
      await Nn(), o.phone && yp(H, bp);
      let G = [he.prewarm(), W.sparklePrototype].filter(fe => fe !== null);
      await Nn();
      let q = pc(f, () => i.compileAsync(H, w, void 0, [], G));
      l.getContext().flush(), await Nn(), C.build(), await Nn(), await Promise.race([q.catch(() => {}), wh(g1)]), await Nn(), pc(f, () => i.warm(H, w, G)), await Nn(), $h(), e.render?.shaderWarmup === "visible" && setTimeout(() => void i.compileAsync(H, w, "complete", [...f, W.root]).catch(() => {}), 1500);
    },
    pc = (f, G) => Ea([...f, W.root], G),
    $h = () => {
      ae = performance.now() + b1;
      cc({
        id: 0,
        kind: "entry",
        from: null,
        carry: null
      });
      l.setAnimationLoop(f => {
        if (!v) try {
          xi(f);
        } catch (error) {
          console.error(error);
          l.setAnimationLoop(null);
        }
      });
    },
    dc = () => {
      _ !== "building" && C.build();
    };
  return {
    scene: H,
    renderer: l,
    camera: w,
    player: {
      get position() {
        return k.feet(we);
      },
      get velocity() {
        return k.velocity;
      },
      get grounded() {
        return k.grounded;
      },
      get yaw() {
        return k.yaw;
      },
      teleport(f, G) {
        k.teleport(f, G), er(), _ === "active" && !x && A.snapBehind(k.feet(we), G ?? k.yaw);
      }
    },
    get audio() {
      return D.handle;
    },
    addStatic: f => C.addStatic(f),
    addDecor: f => C.addDecor(f),
    addMover: (f, G) => C.addMover(f, G),
    addBouncePad: f => C.addBouncePad(f),
    addTrigger: f => C.addTrigger(f),
    raycast: (f, G, q) => (dc(), C.raycast(f, G, q)),
    collideSphere: (f, G) => (dc(), C.collideSphere(f, G)),
    placePortal: f => {
      he.place(f);
    },
    onPortalAvailability(f) {
      jt.add(f);
      for (let G of he.unavailableIds()) f(G, !1);
      return () => {
        jt.delete(f);
      };
    },
    onPortalLock(f) {
      Or.add(f);
      for (let [G, q] of he.locks()) f(G, q);
      return () => {
        Or.delete(f);
      };
    },
    constructionSite(f) {
      let G = he.byId(f);
      if (!G) return console.warn(`[Portal Kit] constructionSite: no portal "${f}"; place it first`), {
        dispose() {}
      };
      let q = qf(G.spec, {
        accent: e.accent,
        renderer: l
      });
      q.root.position.set(...G.spec.position), q.root.rotation.y = G.spec.yaw, q.root.visible = !he.unavailableIds().includes(f), H.add(q.root);
      let fe = (be, Oe) => q.update(Oe);
      N.push(fe);
      let xe = (be, Oe) => {
        be === f && (q.root.visible = Oe);
      };
      jt.add(xe);
      let ge = !1;
      return {
        dispose() {
          if (ge) return;
          ge = !0, jt.delete(xe);
          let be = N.indexOf(fe);
          be >= 0 && N.splice(be, 1), q.dispose();
        }
      };
    },
    onUpdate(f) {
      N.push(f);
    },
    sfx: (f, G) => {
      D.play(f, G), (f === "hit" || f === "hurt") && Q.feedback(f);
    },
    sfxEngine: f => D.engine(f),
    rumble: (f, G) => Q.rumble(f, G),
    toast: pr,
    get active() {
      return _ === "active";
    },
    get paused() {
      return rn;
    },
    onPause(f) {
      return Fn.add(f), () => {
        Fn.delete(f);
      };
    },
    onRespawn(f) {
      return nn.add(f), () => {
        nn.delete(f);
      };
    },
    get capture() {
      return kh();
    },
    input: $l,
    onClick(f) {
      return S.add(f), () => {
        S.delete(f);
      };
    },
    addInteractable: f => g.add(f),
    possess: Ih,
    hud: pi,
    records: F,
    saved: I.saved,
    achievements: {
      unlock: f => Mo.unlock(f),
      has: f => Mo.has(f),
      onUnlocked: f => Mo.onUnlocked(f)
    },
    avatar: {
      attach: (f, G) => W.attach(f, G),
      gesture: (f, G) => (Yt.gesture(f), W.gesture(f, G)),
      get gesturing() {
        return W.gesturing;
      },
      setScale: li,
      get scale() {
        return [ot[0], ot[1], ot[2]];
      },
      get playerLook() {
        return L ? structuredClone(L) : null;
      },
      setLook(f) {
        K = f, W.setLook(L, f);
      }
    },
    setCursor(f) {
      z.override = f === null ? null : Ma(f);
    },
    addHoverTarget: (f, G) => z.addHoverTarget(f, G),
    start() {
      if (_ !== "building") return;
      _ = "pending", Z = xd(p), Z.onCommand(ic);
      let f = $f(l);
      f.resize(i.width, i.height), B = f;
      let G = vh({
        root: document.body,
        world: Ro(),
        sound: q => D.play(q)
      });
      G.setVisible(!1), G.onAction(Wh), G.hud.onAbility((q, fe) => {
        for (let xe of [...ci]) xe(q, fe);
      }), X = G, z.install(document, e.accent), _l();
      for (let q of je.splice(0)) G.toast(q);
      k.respawn(), A.snapBehind(k.feet(we), a.yaw), er(), _h(w1(H));
    }
  };
}
function T1(e) {
  let t = e instanceof He.Color ? `#${e.getHexString()}` : e ? "" : "#10131c";
  for (let r of [document.documentElement, document.body]) r.style.margin = "0", r.style.height = "100%", r.style.overflow = "hidden", t && (r.style.background = t);
}
var wh = e => new Promise(t => setTimeout(t, e)),
  Nn = () => new Promise(e => setTimeout(e, 0));
function w1(e) {
  let t = [];
  return e.traverse(r => {
    r.visible && t.push(r);
  }), t;
}
var k1 = (() => {
    try {
      let e = new URLSearchParams(globalThis.location?.search ?? "").get(v1);
      return e !== null && e !== "0" && e !== "false";
    } catch {
      return !1;
    }
  })(),
  kh = () => k1 || globalThis[x1] === !0;
export { vd as CLICK_MS, Ys as CLICK_SLOP_PX, $a as WORLD_SAVED_MAX_BYTES, s1 as createPlaygroundGuide, D2 as createPortalWorld, pb as formatTime };