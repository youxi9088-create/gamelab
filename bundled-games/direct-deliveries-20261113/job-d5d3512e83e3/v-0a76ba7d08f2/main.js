import { createGame as Hn, landscapeRig as In } from "./vendor/003-three-0.21.js";
import * as ce from "./vendor/007-three.js";
function Eo(e) {
  let t = [],
    o = "";
  for (let r of e.matchAll(/([a-z])([A-Z]*)/g)) o = o.slice(0, r[1].charCodeAt(0) - 97) + r[2], t.push(o);
  return t.join(`
`);
}
function Cr(e) {
  let t = new Set(),
    o = new Set();
  for (let r of e.split(`
`)) {
    let n = r.trim().toUpperCase();
    if (!(n.length < 3 || !/^[A-Z]+$/.test(n))) {
      t.add(n);
      for (let a = 1; a <= n.length; a++) o.add(n.slice(0, a));
    }
  }
  return {
    size: t.size,
    has: r => t.has(r.toUpperCase()),
    hasPrefix: r => o.has(r.toUpperCase())
  };
}
var jo = ["./_runtime_resources/0a0dc449de170e805bd54fcd.json", "./_runtime_resources/2c1dc774afe61c979c7cabf8.json", "./_runtime_resources/6361e36b732e021ebe636796.json", "./_runtime_resources/64120127cb35264f2250119b.json"];
async function To(e) {
  let t = 0,
    o = await Promise.all(jo.map(async r => {
      let n = await fetch(r);
      if (!n.ok) throw new Error(`dictionary failed: ${n.status}`);
      let a = Eo(await n.json());
      return e?.(++t / jo.length), a;
    }));
  return Cr(o.join(`
`));
}
var de = class {
  map = new Map();
  on(t, o) {
    let r = this.map.get(t);
    return r || (r = new Set(), this.map.set(t, r)), r.add(o), () => {
      r.delete(o);
    };
  }
  emit(t, o) {
    let r = this.map.get(t);
    if (r) for (let n of [...r]) n(o);
  }
  clear() {
    this.map.clear();
  }
};
var so = ["AAEEGN", "ABBJOO", "ACHOPS", "AFFKPS", "AOTTOW", "CIMOTU", "DEILRX", "DELRVY", "DISTTY", "EEGHNW", "EEINSU", "EHRTVW", "EIOSST", "ELRTTY", "HIMNQU", "HLNNRZ"];
function Ar(e) {
  let t = e >>> 0;
  return () => {
    t = t + 1831565813 >>> 0;
    let o = t;
    return o = Math.imul(o ^ o >>> 15, o | 1), o ^= o + Math.imul(o ^ o >>> 7, o | 61), ((o ^ o >>> 14) >>> 0) / 4294967296;
  };
}
function io(e) {
  return e === "Q" ? "Qu" : e;
}
function Ro(e) {
  let t = Ar(e),
    o = Array.from({
      length: 16
    }, (d, c) => c);
  for (let d = o.length - 1; d > 0; d--) {
    let c = Math.floor(t() * (d + 1)),
      l = o[d];
    o[d] = o[c], o[c] = l;
  }
  let r = o.map(() => Math.floor(t() * 6)),
    n = o.map(() => Math.floor(t() * 4));
  return {
    grid: o.map((d, c) => io(so[d][r[c]])),
    dieAt: o,
    faceIndexAt: r,
    spinAt: n
  };
}
function Mo(e) {
  let t = Math.floor(e / 4),
    o = e % 4,
    r = [];
  for (let n = -1; n <= 1; n++) for (let a = -1; a <= 1; a++) {
    if (n === 0 && a === 0) continue;
    let d = t + n,
      c = o + a;
    d < 0 || c < 0 || d >= 4 || c >= 4 || r.push(d * 4 + c);
  }
  return r;
}
function ko(e, t) {
  if (e === t) return !1;
  let o = Math.abs(Math.floor(e / 4) - Math.floor(t / 4)),
    r = Math.abs(e % 4 - t % 4);
  return o <= 1 && r <= 1;
}
var So = Array.from({
  length: 16
}, (e, t) => Mo(t));
function Be(e, t) {
  let o = t.toUpperCase();
  if (o.length === 0) return null;
  let r = new Array(16).fill(!1),
    n = [],
    a = e.map(c => c.toUpperCase());
  function d(c, l) {
    let E = a[c];
    if (!o.startsWith(E, l)) return !1;
    let x = l + E.length;
    if (r[c] = !0, n.push(c), x === o.length) return !0;
    for (let m of So[c]) if (!r[m] && d(m, x)) return !0;
    return r[c] = !1, n.pop(), !1;
  }
  for (let c = 0; c < 16; c++) if (d(c, 0)) return n.slice();
  return null;
}
function ue(e, t) {
  return t.map(o => e[o].toUpperCase()).join("");
}
function Ho(e) {
  let t = new Set();
  for (let o = 0; o < e.length; o++) {
    let r = e[o];
    if (r < 0 || r >= 16 || t.has(r)) return !1;
    if (t.add(r), o > 0) {
      let n = e[o - 1],
        a = Math.abs(Math.floor(n / 4) - Math.floor(r / 4)),
        d = Math.abs(n % 4 - r % 4);
      if (a > 1 || d > 1) return !1;
    }
  }
  return e.length > 0;
}
function Io(e, t, o = 3) {
  let r = e.map(c => c.toUpperCase()),
    n = new Array(16).fill(!1),
    a = new Set();
  function d(c, l) {
    let E = l + r[c];
    if (t.hasPrefix(E)) {
      n[c] = !0, E.length >= o && t.has(E) && a.add(E);
      for (let x of So[c]) n[x] || d(x, E);
      n[c] = !1;
    }
  }
  for (let c = 0; c < 16; c++) d(c, "");
  return [...a].sort((c, l) => l.length - c.length || c.localeCompare(l));
}
function lo(e) {
  let t = e.length;
  return t < 3 ? 0 : t <= 4 ? 1 : t === 5 ? 2 : t === 6 ? 3 : t === 7 ? 5 : 11;
}
function Co(e) {
  let t = new Map(),
    o = e.map(c => ({
      ...c,
      words: [...new Set(c.words.map(l => l.toUpperCase()))]
    }));
  for (let c of o) for (let l of c.words) t.set(l, (t.get(l) ?? 0) + 1);
  let n = [...o.map(c => {
      let l = c.words.map(x => ({
          word: x,
          points: lo(x),
          cancelled: (t.get(x) ?? 0) > 1
        })).sort((x, m) => m.word.length - x.word.length || x.word.localeCompare(m.word)),
        E = l.reduce((x, m) => x + (m.cancelled ? 0 : m.points), 0);
      return {
        id: c.id,
        name: c.name,
        avatar: c.avatar,
        words: l,
        score: E,
        rank: 0
      };
    })].sort((c, l) => l.score - c.score || _e(l) - _e(c)),
    a = 0;
  n.forEach((c, l) => {
    (l === 0 || c.score !== n[l - 1].score || _e(c) !== _e(n[l - 1])) && (a = l + 1), c.rank = a;
  });
  let d = n.filter(c => c.rank === 1 && (c.score > 0 || n.length === 1)).map(c => c.id);
  return {
    players: n,
    winnerIds: d
  };
}
function _e(e) {
  return e.words.filter(t => !t.cancelled).length;
}
var Gr = 8e3,
  Dr = 7e3,
  Br = 1500,
  _r = 3,
  Or = 5e3,
  zr = 1e4,
  ze = class {
    constructor(t) {
      this.opts = t;
    }
    events = new de();
    phase = "title";
    grid = [];
    shake = null;
    roundId = 0;
    found = [];
    session = null;
    results = null;
    starting = !1;
    foundSet = new Set();
    seed = 0;
    startAt = 0;
    endAt = 0;
    tallied = !1;
    serverResults = !1;
    parts = [];
    lastTimerSecond = -1;
    startingSince = 0;
    lastSyncAt = -1 / 0;
    syncSamples = 0;
    clockRtt = 1 / 0;
    unsubs = [];
    now() {
      return performance.now();
    }
    get isHost() {
      return this.session?.isHost ?? !0;
    }
    get players() {
      return this.session?.players ?? [];
    }
    get selfId() {
      return this.session?.selfId ?? "self";
    }
    get remainingSeconds() {
      return this.phase !== "playing" ? this.phase === "shaking" || this.phase === "countdown" ? 180 : 0 : Math.max(0, (this.endAt - this.now()) / 1e3);
    }
    get playStartAt() {
      return this.startAt + 2600;
    }
    get roundLive() {
      return this.phase === "countdown" || this.phase === "shaking" || this.phase === "playing" || this.phase === "tally" && !this.tallied;
    }
    attach(t) {
      this.detach();
      this.session = t;
      this.unsubs = [t.events.on("roster", o => this.events.emit("roster", o))];
      this.events.emit("session", {
        kind: t.kind,
        code: t.code,
        isHost: t.isHost
      });
      this.events.emit("roster", t.players);
      this.setPhase("lobby");
    }
    detach() {
      for (let t of this.unsubs) t();
      this.unsubs = [], this.setStarting(!1), this.session && (this.session.dispose(), this.session = null), this.events.emit("session", {
        kind: "none",
        code: null,
        isHost: !1
      });
    }
    startRound() {
      let t = this.session;
      if (!t || !t.isHost || this.roundLive || this.starting) return;
      this.beginSoloRound();
    }
    reset() {
      this.found = [];
      this.foundSet.clear();
      this.results = null;
      this.events.emit("words", this.found);
      if (!this.session) {
        this.setPhase("title");
        return;
      }
      this.startRound();
    }
    submit(t, o) {
      let r = t.trim().toUpperCase();
      if (this.phase !== "playing") return "not-on-board";
      let n = "ok",
        a = null;
      r.length < 3 ? n = "too-short" : (o && Ho(o) && ue(this.grid, o) === r ? a = o.slice() : a = Be(this.grid, r), a ? this.opts.dictionary.has(r) ? this.foundSet.has(r) && (n = "already-found") : n = "not-a-word" : n = "not-on-board");
      let d = n === "ok" ? lo(r) : 0;
      if (n === "ok" && a) {
        this.foundSet.add(r), this.found.push({
          word: r,
          path: a,
          points: d
        }), this.events.emit("words", this.found);
        let c = this.session;
        c?.setWordCounts({
          [this.selfId]: this.found.length
        });
      }
      return this.events.emit("word", {
        verdict: n,
        word: r,
        path: a,
        points: d
      }), n;
    }
    update(t) {
      let o = this.session;
      if (!o) return;
      let r = this.phase;
      if (r === "countdown" || r === "shaking" || r === "playing") {
        let a = this.phaseForNow();
        a !== r && this.setPhase(a);
      }
      if (this.phase === "playing" || this.phase === "shaking" || this.phase === "countdown") {
        let a = this.remainingSeconds,
          d = Math.ceil(a);
        (d !== this.lastTimerSecond || this.phase === "playing") && (this.lastTimerSecond = d, this.events.emit("timer", {
          remaining: a,
          total: 180,
          running: this.phase === "playing"
        }));
      }
      let n = this.now();
      if (this.phase === "tally" && !this.tallied) {
        n >= this.endAt + 900 && this.finishSoloRound();
      }
      this.starting && n - this.startingSince > Dr && (this.setStarting(!1), this.events.emit("notice", {
        text: "The round did not start. Try again.",
        kind: "warn"
      }));
    }
    dispose() {
      this.detach(), this.events.clear();
    }
    setPhase(t) {
      if (t === this.phase) return;
      let o = this.phase;
      this.phase = t, t === "playing" && (this.lastTimerSecond = -1), this.events.emit("phase", {
        phase: t,
        previous: o
      }), (t === "playing" || t === "shaking" || t === "countdown") && this.events.emit("timer", {
        remaining: this.remainingSeconds,
        total: 180,
        running: t === "playing"
      });
    }
    setStarting(t) {
      t !== this.starting && (this.starting = t, t && (this.startingSince = this.now()), this.events.emit("starting", t));
    }
    phaseForNow() {
      let t = this.now();
      return t < this.startAt ? "countdown" : t < this.startAt + 2600 ? "shaking" : t < this.endAt ? "playing" : "tally";
    }
    beginSoloRound() {
      if (this.roundLive) return;
      let t = this.opts.random ?? Math.random,
        o = this.now() + 1500;
      this.applyRoundStart(this.roundId + 1, Math.floor(t() * 2147483647), o, o + 2600 + 180 * 1e3);
    }
    applyRoundStart(t, o, r, n) {
      this.roundId = t, this.seed = o, this.startAt = r, this.endAt = n, this.shake = Ro(o), this.grid = this.shake.grid, this.found = [], this.foundSet.clear(), this.tallied = !1, this.serverResults = !1, this.syncSamples = 0, this.clockRtt = 1 / 0, this.parts = [], this.results = null, this.setStarting(!1), this.session?.resetCounts(), this.events.emit("words", this.found), this.setPhase(this.phaseForNow()), this.emitShake();
    }
    emitShake() {
      if (!this.shake) return;
      let t = Math.max(0.4, (this.startAt + 2600 - this.now()) / 1e3);
      this.events.emit("shake", {
        shake: this.shake,
        roundId: this.roundId,
        duration: t
      });
    }
    finishSoloRound() {
      let t = this.players.find(n => n.isSelf),
        o = this.found.map(n => n.word),
        r = Io(this.grid, this.opts.dictionary).filter(n => !this.foundSet.has(n)).slice(0, 60);
      this.applyResults(this.roundId, this.grid, [{
        id: this.selfId,
        name: t?.name ?? "You",
        avatar: t?.avatar ?? null,
        words: o
      }], r, !0);
    }
    applyResults(t, o, r, n, a) {
      let d = Co(r),
        c = d.players;
      this.tallied = !0, this.serverResults = a, this.results = {
        roundId: t,
        grid: o,
        players: c,
        winnerIds: d.winnerIds,
        selfId: this.selfId,
        missed: n
      }, this.setPhase("results"), this.events.emit("results", this.results);
    }
  };
var Ne = class {
  constructor(t, o, r, n, a, d, c) {
    this.input = t;
    this.match = o;
    this.board = r;
    this.orbit = n;
    this.ui = a;
    this.sfx = d;
    this.isAboveBoardCentre = c;
    this.unsubs.push(t.on("press", () => this.onPress()), t.on("drag", l => this.onDrag(l.x, l.y, l.dx)), t.on("release", () => this.onRelease())), window.addEventListener("keydown", this.onKeyDown), window.addEventListener("keyup", this.onKeyUp);
  }
  typed = "";
  trace = [];
  tracing = !1;
  rotating = !1;
  unsubs = [];
  lastHint = null;
  dispose() {
    for (let t of this.unsubs) t();
    window.removeEventListener("keydown", this.onKeyDown), window.removeEventListener("keyup", this.onKeyUp);
  }
  clear() {
    this.typed = "", this.trace = [], this.tracing = !1, this.board.setTrace([]), this.ui.setEntry("", null);
  }
  get playing() {
    return this.match.phase === "playing";
  }
  pickCell(t = !1) {
    let o = this.input.pick(this.board.pickables);
    if (t) return o.length > 0 ? this.board.letterCellAt(o[0]) : null;
    for (let r of o) {
      let n = r.object;
      for (; n;) {
        if (typeof n.userData.cell == "number") return n.userData.cell;
        n = n.parent;
      }
    }
    return null;
  }
  onPress() {
    let t = this.playing ? this.pickCell() : null;
    if (t !== null) {
      this.tracing = !0, this.typed = "", this.trace = [t], this.board.setTrace(this.trace), this.ui.setEntry(ue(this.match.grid, this.trace), null), this.sfx.play("trace-tick", {
        rate: 1
      });
      return;
    }
    this.match.phase === "title" || this.match.phase === "boot" || (this.rotating = !0, this.orbit.beginDrag());
  }
  onDrag(t, o, r) {
    if (this.tracing) {
      let n = this.pickCell(!0);
      if (n === null) return;
      let a = this.trace[this.trace.length - 1];
      if (n === a) return;
      let d = this.trace.indexOf(n);
      if (d >= 0) {
        d === this.trace.length - 2 && (this.trace.pop(), this.sfx.play("trace-cancel", {
          volume: 0.6
        }), this.board.setTrace(this.trace), this.ui.setEntry(ue(this.match.grid, this.trace), null));
        return;
      }
      if (!ko(a, n)) return;
      this.trace.push(n), this.board.setTrace(this.trace), this.ui.setEntry(ue(this.match.grid, this.trace), null), this.sfx.play("trace-tick", {
        rate: 1 + Math.min(0.6, this.trace.length * 0.06)
      });
      return;
    }
    this.rotating && this.orbit.drag(this.isAboveBoardCentre(t, o) ? r : -r);
  }
  onRelease() {
    if (this.tracing) {
      this.tracing = !1;
      let t = this.trace;
      this.trace = [], t.length >= 3 ? this.submit(ue(this.match.grid, t), t) : (this.board.setTrace([]), this.ui.setEntry("", null));
      return;
    }
    this.rotating && (this.rotating = !1, this.orbit.endDrag());
  }
  submit(t, o) {
    let r = this.match.submit(t, o),
      n = o ?? this.match.found.find(a => a.word === t)?.path ?? [];
    this.board.flash(n, r === "ok" ? "ok" : r === "already-found" ? "dup" : "bad"), this.ui.setEntry(t, r), this.lastHint = r, this.typed = "", this.board.setTrace([]), window.setTimeout(() => {
      this.typed === "" && this.lastHint === r && !this.tracing && this.ui.setEntry("", null);
    }, 650);
  }
  onKeyDown = t => {
    if (this.ui.capturesKeyboard) return;
    let o = t.code === "ArrowLeft" || t.code === "BracketLeft" || t.code === "KeyQ" && !this.playing,
      r = t.code === "ArrowRight" || t.code === "BracketRight" || t.code === "KeyE" && !this.playing;
    if (o) {
      this.orbit.setKeyTurn(-1), t.preventDefault();
      return;
    }
    if (r) {
      this.orbit.setKeyTurn(1), t.preventDefault();
      return;
    }
    if (this.playing && !(t.metaKey || t.ctrlKey || t.altKey)) {
      if (t.key === "Enter") {
        this.typed.length > 0 && this.submit(this.typed), t.preventDefault();
        return;
      }
      if (t.key === "Backspace") {
        this.typed = this.typed.slice(0, -1), this.showTyped(), t.preventDefault();
        return;
      }
      if (t.key === "Escape") {
        this.typed = "", this.showTyped();
        return;
      }
      if (/^[a-zA-Z]$/.test(t.key) && this.typed.length < 17) {
        if (this.tracing) return;
        this.typed += t.key.toUpperCase(), this.sfx.play("type", {
          rate: 0.95 + Math.random() * 0.1,
          volume: 0.5
        }), this.showTyped(), t.preventDefault();
      }
    }
  };
  onKeyUp = t => {
    ["KeyQ", "ArrowLeft", "KeyE", "ArrowRight", "BracketLeft", "BracketRight"].includes(t.code) && this.orbit.setKeyTurn(0);
  };
  showTyped() {
    if (this.lastHint = null, this.ui.setEntry(this.typed, null), this.typed.length === 0) {
      this.board.setTrace([]);
      return;
    }
    let t = this.previewPath(this.typed);
    this.board.setTrace(t ?? []);
  }
  previewPath(t) {
    let o = this.match.grid;
    return o.length !== 16 ? null : Nr(o, t);
  }
};
function Nr(e, t) {
  return Be(e, t);
}
var Yt = e => typeof e == "number" && Number.isFinite(e),
  ne = (e, t = 64) => typeof e == "string" && e.length <= t,
  Ao = e => ne(e, 20) && /^[A-Za-z]{3,20}$/.test(e),
  co = e => Yt(e) && Math.abs(e) < 18e5,
  Po = e => ne(e, 2048) && e ? e : null;
var Fe = class {
  kind = "solo";
  events = new de();
  code = null;
  isPublic = !1;
  autoStartAt = null;
  players;
  constructor(t) {
    this.players = [{
      id: t.id,
      name: t.name,
      avatar: t.avatar,
      seat: 0,
      isHost: !0,
      isSelf: !0,
      wordCount: 0,
      connected: !0,
      ready: !0
    }];
  }
  get selfId() {
    return this.players[0].id;
  }
  get hostId() {
    return this.players[0].id;
  }
  get isHost() {
    return !0;
  }
  send() {}
  oneWayMs() {
    return 0;
  }
  invite() {}
  leave() {}
  setReady() {}
  setWordCounts(t) {
    this.players[0].wordCount = t[this.selfId] ?? 0, this.events.emit("roster", this.players);
  }
  resetCounts() {
    this.setWordCounts({});
  }
  dispose() {
    this.events.clear();
  }
};
import * as g from "./vendor/007-three.js";
import * as et from "./vendor/007-three.js";
var Fr = 1929128,
  Wr = 3842268,
  Te = new et.Color(4182271),
  uo = new et.Color(10483455),
  Do = new et.Color(16757575),
  Bo = new et.Color(16726831),
  _o = new et.Color(3524863),
  Oo = new et.Color(1, 1, 1),
  zo = new et.Color(1, 0.78, 0.42),
  No = new et.Color(1, 0.32, 0.28),
  Fo = "'Outfit', 'Avenir Next', 'Helvetica Neue', Arial, sans-serif",
  Ur = new Set(["M", "W", "N", "Z"]);
function Jt(e, t) {
  let o = document.createElement("canvas");
  o.width = e, o.height = t;
  let r = o.getContext("2d");
  if (!r) throw new Error("2d canvas unavailable");
  return [o, r];
}
function mo(e) {
  let t = e >>> 0;
  return () => {
    t = t + 1831565813 >>> 0;
    let o = t;
    return o = Math.imul(o ^ o >>> 15, o | 1), o ^= o + Math.imul(o ^ o >>> 7, o | 61), ((o ^ o >>> 14) >>> 0) / 4294967296;
  };
}
function $r(e, t) {
  let [o, r] = Jt(e, e),
    n = r.createImageData(e, e),
    a = mo(t),
    d = n.data;
  for (let c = 0; c < d.length; c += 4) {
    let l = Math.floor(a() * 256);
    d[c] = l, d[c + 1] = l, d[c + 2] = l, d[c + 3] = 255;
  }
  return r.putImageData(n, 0, 0), o;
}
var Vo = (() => {
  let e = null;
  return () => e ??= $r(256, 1234);
})();
function Re(e, t) {
  return e.colorSpace = t ? et.SRGBColorSpace : et.NoColorSpace, e.anisotropy = 4, e.generateMipmaps = !0, e.minFilter = et.LinearMipmapLinearFilter, e.magFilter = et.LinearFilter, e.needsUpdate = !0, e;
}
var Go = new Map();
function Kr(e) {
  let t = Go.get(e);
  if (t) return t;
  let o = 512,
    [r, n] = Jt(o, o);
  n.fillStyle = "#efe6cf", n.fillRect(0, 0, o, o);
  let a = mo(77 + e.charCodeAt(0) * 31);
  for (let O = 0; O < 14; O++) {
    let k = a() * o,
      H = a() * o,
      Q = 80 + a() * 160,
      N = n.createRadialGradient(k, H, 0, k, H, Q),
      h = a() > 0.5;
    N.addColorStop(0, h ? "rgba(120,96,60,0.045)" : "rgba(255,255,240,0.06)"), N.addColorStop(1, "rgba(0,0,0,0)"), n.fillStyle = N, n.fillRect(0, 0, o, o);
  }
  n.globalAlpha = 0.045, n.drawImage(Vo(), 0, 0, o, o), n.globalAlpha = 1;
  let d = n.createRadialGradient(o / 2, o / 2, o * 0.36, o / 2, o / 2, o * 0.74);
  d.addColorStop(0, "rgba(0,0,0,0)"), d.addColorStop(1, "rgba(60,40,10,0.10)"), n.fillStyle = d, n.fillRect(0, 0, o, o);
  let [c, l] = Jt(o, o),
    x = e === "Qu" ? 236 : 318;
  l.font = `800 ${x}px ${Fo}`, l.textAlign = "center", l.textBaseline = "alphabetic", l.fillStyle = "#1c5d8a";
  let m = l.measureText(e),
    R = m.actualBoundingBoxAscent,
    T = m.actualBoundingBoxDescent,
    F = Ur.has(e),
    j = R + T,
    S = 26,
    w = 24,
    _ = F ? j + S + w : j,
    V = o / 2 - _ / 2 + R;
  if (l.fillText(e, o / 2, V), F) {
    let O = (m.actualBoundingBoxRight + m.actualBoundingBoxLeft) * 0.94,
      k = V + T + S;
    l.beginPath();
    let H = w / 2;
    l.moveTo(o / 2 - O / 2 + H, k), l.lineTo(o / 2 + O / 2 - H, k), l.arc(o / 2 + O / 2 - H, k + H, H, -Math.PI / 2, Math.PI / 2), l.lineTo(o / 2 - O / 2 + H, k + w), l.arc(o / 2 - O / 2 + H, k + H, H, Math.PI / 2, 3 * Math.PI / 2), l.closePath(), l.fill();
  }
  l.globalCompositeOperation = "source-atop", l.globalAlpha = 0.16, l.drawImage(Vo(), 0, 0, o, o), l.globalAlpha = 0.1, l.fillStyle = "#0b3b62", l.fillRect(0, 0, o, o), l.globalCompositeOperation = "source-over", l.globalAlpha = 1, n.drawImage(c, 0, 0);
  let W = Re(new et.CanvasTexture(r), !0);
  return Go.set(e, W), W;
}
function Wo() {
  let [t, o] = Jt(256, 256),
    r = o.createImageData(256, 256),
    n = mo(4242),
    a = r.data,
    d = new Float32Array(256 / 4 * (256 / 4));
  for (let l = 0; l < d.length; l++) d[l] = n();
  for (let l = 0; l < 256; l++) for (let E = 0; E < 256; E++) {
    let x = (E >> 2) % 64,
      m = (l >> 2) % (256 / 4),
      R = 128 + (n() - 0.5) * 70 + (d[m * (256 / 4) + x] - 0.5) * 50,
      T = (l * 256 + E) * 4;
    a[T] = a[T + 1] = a[T + 2] = Math.max(0, Math.min(255, R)), a[T + 3] = 255;
  }
  o.putImageData(r, 0, 0);
  let c = Re(new et.CanvasTexture(t), !1);
  return c.wrapS = c.wrapT = et.RepeatWrapping, c.repeat.set(2, 2), c;
}
function Uo() {
  let [o, r] = Jt(1024, 160);
  r.fillStyle = "#000", r.fillRect(0, 0, 1024, 160), r.fillStyle = "#fff", r.font = `800 96px ${Fo}`, r.textAlign = "center", r.textBaseline = "middle";
  let n = "JAMBLE",
    a = 22,
    d = 0,
    c = [...n].map(S => {
      let w = r.measureText(S).width;
      return d += w, w;
    });
  d += a * (n.length - 1);
  let l = 1024 / 2 - d / 2;
  for (let S = 0; S < n.length; S++) r.fillText(n[S], l + c[S] / 2, 160 / 2 + 6), l += c[S] + a;
  let [E, x] = Jt(1024, 160);
  x.filter = "blur(2px)", x.drawImage(o, 0, 0), x.filter = "none";
  let m = x.getImageData(0, 0, 1024, 160).data,
    R = r.createImageData(1024, 160),
    T = R.data,
    F = (S, w) => m[(Math.max(0, Math.min(159, w)) * 1024 + Math.max(0, Math.min(1023, S))) * 4] / 255,
    j = 2.4;
  for (let S = 0; S < 160; S++) for (let w = 0; w < 1024; w++) {
    let _ = (F(w + 1, S) - F(w - 1, S)) * j,
      V = (F(w, S + 1) - F(w, S - 1)) * j,
      W = -_,
      O = V,
      k = 1,
      H = Math.hypot(W, O, k);
    W /= H, O /= H, k /= H;
    let Q = (S * 1024 + w) * 4;
    T[Q] = Math.round((W * 0.5 + 0.5) * 255), T[Q + 1] = Math.round((O * 0.5 + 0.5) * 255), T[Q + 2] = Math.round((k * 0.5 + 0.5) * 255), T[Q + 3] = 255;
  }
  return r.putImageData(R, 0, 0), Re(new et.CanvasTexture(o), !1);
}
function $o() {
  let [t, o] = Jt(128, 128),
    r = o.createRadialGradient(128 / 2, 128 / 2, 0, 128 / 2, 128 / 2, 128 / 2);
  return r.addColorStop(0, "rgba(255,255,255,1)"), r.addColorStop(0.35, "rgba(255,255,255,0.55)"), r.addColorStop(0.7, "rgba(255,255,255,0.12)"), r.addColorStop(1, "rgba(255,255,255,0)"), o.fillStyle = r, o.fillRect(0, 0, 128, 128), Re(new et.CanvasTexture(t), !0);
}
function Ko() {
  let [t, o] = Jt(128, 128),
    r = o.createRadialGradient(128 / 2, 128 / 2, 0, 128 / 2, 128 / 2, 128 / 2);
  return r.addColorStop(0, "rgba(255,255,255,0)"), r.addColorStop(0.72, "rgba(255,255,255,0)"), r.addColorStop(0.82, "rgba(255,255,255,1)"), r.addColorStop(0.9, "rgba(255,255,255,0.7)"), r.addColorStop(1, "rgba(255,255,255,0)"), o.fillStyle = r, o.fillRect(0, 0, 128, 128), Re(new et.CanvasTexture(t), !0);
}
function Yo() {
  let [o, r] = Jt(64, 4),
    n = r.createLinearGradient(0, 0, 64, 0);
  n.addColorStop(0, "rgba(255,255,255,0)"), n.addColorStop(0.3, "rgba(255,255,255,0.75)"), n.addColorStop(0.5, "rgba(255,255,255,1)"), n.addColorStop(0.7, "rgba(255,255,255,0.75)"), n.addColorStop(1, "rgba(255,255,255,0)"), r.fillStyle = n, r.fillRect(0, 0, 64, 4);
  let a = Re(new et.CanvasTexture(o), !0);
  return a.wrapS = a.wrapT = et.ClampToEdgeWrapping, a;
}
function Qo() {
  return new et.MeshPhysicalMaterial({
    color: Fr,
    roughness: 0.34,
    metalness: 0,
    clearcoat: 1,
    clearcoatRoughness: 0.14,
    sheen: 0.15,
    sheenColor: new et.Color(Wr),
    sheenRoughness: 0.6,
    specularIntensity: 0.8
  });
}
function qo(e, t) {
  return new et.MeshPhysicalMaterial({
    map: Kr(e),
    bumpMap: t,
    bumpScale: 0.0035,
    roughness: 0.42,
    metalness: 0,
    clearcoat: 0.45,
    clearcoatRoughness: 0.32,
    specularIntensity: 0.65,
    emissive: new et.Color(0),
    emissiveIntensity: 1
  });
}
var Pe = 1,
  se = 1.22,
  ee = Pe / 2,
  Yr = 0.18,
  Qr = 0.1,
  qr = 0.34,
  ae = 0.085,
  Xo = 2.72,
  Zo = 0.3,
  Ue = 2.42,
  Jo = 0.24,
  tr = 0.6,
  er = 0.07,
  $e = 0.42,
  or = 0.06,
  Xr = 26;
function rr(e, t, o) {
  let r = e - t,
    n = [];
  for (let a = o; a >= 0; a--) n.push(-r - t * Math.tan(a / o * Math.PI * 0.25));
  for (let a = 0; a <= o; a++) n.push(r + t * Math.tan(a / o * Math.PI * 0.25));
  return n;
}
function Ke(e, t, o, r, n) {
  let a = Math.min(r, e / 2, t / 2, o / 2),
    d = new g.Vector3(e / 2 - a, t / 2 - a, o / 2 - a),
    c = [],
    l = [],
    E = [],
    x = [],
    m = new g.BufferGeometry(),
    R = 0,
    T = 0,
    F = new g.Vector3(),
    j = new g.Vector3(),
    S = new g.Vector3(),
    w = (_, V, W, O, k, H, Q, N, h) => {
      let G = rr(H / 2, a, n),
        z = rr(Q / 2, a, n),
        K = G.length - 1,
        lt = z.length - 1;
      for (let X = 0; X <= lt; X++) for (let A = 0; A <= K; A++) F[_] = G[A] * O, F[V] = z[X] * k, F[W] = N / 2, j.set(g.MathUtils.clamp(F.x, -d.x, d.x), g.MathUtils.clamp(F.y, -d.y, d.y), g.MathUtils.clamp(F.z, -d.z, d.z)), S.subVectors(F, j).normalize(), c.push(j.x + S.x * a, j.y + S.y * a, j.z + S.z * a), l.push(S.x, S.y, S.z), E.push((G[A] + H / 2) / H, 1 - (z[X] + Q / 2) / Q);
      for (let X = 0; X < lt; X++) for (let A = 0; A < K; A++) {
        let nt = R + A + (K + 1) * X,
          tt = R + A + (K + 1) * (X + 1),
          ht = R + (A + 1) + (K + 1) * (X + 1),
          B = R + (A + 1) + (K + 1) * X;
        x.push(nt, tt, B, tt, ht, B);
      }
      let pt = K * lt * 6;
      m.addGroup(T, pt, h), T += pt, R += (K + 1) * (lt + 1);
    };
  return w("z", "y", "x", -1, -1, o, t, e, 0), w("z", "y", "x", 1, -1, o, t, -e, 1), w("x", "z", "y", 1, 1, e, o, t, 2), w("x", "z", "y", 1, -1, e, o, -t, 3), w("x", "y", "z", 1, -1, e, t, o, 4), w("x", "y", "z", -1, -1, e, t, -o, 5), m.setIndex(x), m.setAttribute("position", new g.Float32BufferAttribute(c, 3)), m.setAttribute("normal", new g.Float32BufferAttribute(l, 3)), m.setAttribute("uv", new g.Float32BufferAttribute(E, 2)), m;
}
function Zr(e, t, o, r, n) {
  let a = [];
  a.push([0, -0.08, -1, 0], [0, o - r, -1, 0]);
  for (let w = 1; w <= 6; w++) {
    let _ = w / 6 * Math.PI * 0.5;
    a.push([r - r * Math.cos(_), o - r + r * Math.sin(_), -Math.cos(_), Math.sin(_)]);
  }
  for (let w = 0; w <= 6; w++) {
    let _ = w / 6 * Math.PI * 0.5;
    a.push([t - r + r * Math.sin(_), o - r + r * Math.cos(_), Math.sin(_), Math.cos(_)]);
  }
  a.push([t, -0.08, 1, 0]);
  let c = [],
    l = e,
    E = n,
    x = 8,
    m = (w, _, V) => {
      for (let W = 0; W <= x; W++) {
        let O = V + W / x * Math.PI * 0.5;
        c.push([w + E * Math.cos(O), _ + E * Math.sin(O), Math.cos(O), Math.sin(O)]);
      }
    };
  m(l - E, -(l - E), -Math.PI * 0.5), m(l - E, l - E, 0), m(-(l - E), l - E, Math.PI * 0.5), m(-(l - E), -(l - E), Math.PI), c.push(c[0]);
  let R = [],
    T = [],
    F = [],
    j = a.length;
  for (let w = 0; w < c.length; w++) {
    let [_, V, W, O] = c[w];
    for (let k = 0; k < j; k++) {
      let [H, Q, N, h] = a[k];
      R.push(_ + W * H, Q, V + O * H);
      let G = Math.hypot(W * N, h, O * N) || 1;
      T.push(W * N / G, h / G, O * N / G);
    }
  }
  for (let w = 0; w < c.length - 1; w++) for (let _ = 0; _ < j - 1; _++) {
    let V = w * j + _,
      W = (w + 1) * j + _,
      O = (w + 1) * j + _ + 1,
      k = w * j + _ + 1;
    F.push(V, W, O, V, O, k);
  }
  let S = new g.BufferGeometry();
  return S.setIndex(F), S.setAttribute("position", new g.Float32BufferAttribute(R, 3)), S.setAttribute("normal", new g.Float32BufferAttribute(T, 3)), S;
}
var nr = e => 1 - (1 - e) * (1 - e),
  Jr = e => e * e,
  tn = e => e * e * (3 - 2 * e),
  po = e => e < 0 ? 0 : e > 1 ? 1 : e;
function ar(e, t) {
  let o = Math.floor(e / 4),
    r = e % 4;
  return t.set((r - 1.5) * se, ee, (o - 1.5) * se);
}
function en() {
  let e = new g.Vector3(1, 0, 0),
    t = new g.Vector3(0, 1, 0),
    o = new g.Vector3(0, 0, 1),
    r = [[e.clone(), t.clone()], [e.clone().negate(), t.clone()], [t.clone(), o.clone().negate()], [t.clone().negate(), o.clone()], [o.clone(), t.clone()], [o.clone().negate(), t.clone()]],
    n = new g.Matrix4().makeBasis(e, o.clone().negate(), t);
  return r.map(([a, d]) => {
    let c = new g.Vector3().crossVectors(d, a),
      l = new g.Matrix4().makeBasis(c, d, a),
      E = new g.Matrix4().multiplyMatrices(n, l.clone().transpose());
    return new g.Quaternion().setFromRotationMatrix(E).normalize();
  });
}
var pe = 128,
  te = 160;
function sr() {
  let e = new g.Group();
  e.name = "board";
  let t = new g.Group();
  t.name = "board-rig", e.add(t);
  let o = Qo(),
    r = new g.Mesh(Ke(Xo * 2, Zo, Xo * 2, 0.06, 3), o);
  r.position.y = -Zo / 2, r.castShadow = !0, r.receiveShadow = !0, t.add(r);
  let n = new g.Mesh(Zr(Ue, Jo, tr, er, 0.14), o);
  n.castShadow = !0, n.receiveShadow = !0, t.add(n);
  let a = Ke(Ue * 2, $e, or, 0.02, 2),
    d = Ke(Ue * 2, $e - 0.004, or, 0.02, 2);
  for (let u = -1; u <= 1; u++) {
    let M = new g.Mesh(a, o);
    M.position.set(0, $e / 2, u * se), M.castShadow = !0, M.receiveShadow = !0, t.add(M);
    let i = new g.Mesh(d, o);
    i.rotation.y = Math.PI / 2, i.position.set(u * se, ($e - 0.004) / 2, 0), i.castShadow = !0, i.receiveShadow = !0, t.add(i);
  }
  let c = o.clone();
  c.normalMap = Uo(), c.normalScale.set(1.6, 1.6), c.polygonOffset = !0, c.polygonOffsetFactor = -1, c.polygonOffsetUnits = -1;
  let l = new g.Mesh(new g.PlaneGeometry(2.56, 0.4), c);
  l.position.set(0, (tr - er) / 2, Ue + Jo + 0.003), t.add(l);
  let E = Ke(Pe, Pe, Pe, Qr, 3),
    x = Wo(),
    m = en(),
    R = [],
    T = [],
    F = [];
  for (let u = 0; u < 16; u++) {
    let M = [...so[u]].map(s => qo(io(s), x)),
      i = new g.Mesh(E, M);
    i.castShadow = !0, i.receiveShadow = !0, i.userData.cell = u, t.add(i);
    let f = new g.Quaternion().setFromAxisAngle(new g.Vector3(0, 1, 0), u * 7 % 4 * Math.PI / 2).multiply(m[(u * 5 + 2) % 6]),
      P = {
        die: u,
        mesh: i,
        mats: M,
        cell: u,
        pos: ar(u, new g.Vector3()),
        quat: f,
        vel: new g.Vector3(),
        angVel: new g.Vector3(),
        p0: new g.Vector3(),
        q0: new g.Quaternion(),
        p1: new g.Vector3(),
        q1: new g.Quaternion(),
        delay: 0,
        toss: 0.6,
        lift: 0,
        liftTarget: 0,
        glow: 0,
        glowTarget: 0,
        fxKind: null,
        fxT: 0,
        fxDur: 0.6,
        er: 0,
        eg: 0,
        eb: 0,
        tr: 1,
        tg: 1,
        tb: 1
      };
    i.position.copy(P.pos), i.quaternion.copy(P.quat), R.push(P), T[u] = P, F.push(i);
  }
  let j = $o(),
    S = new g.MeshBasicMaterial({
      map: j,
      color: Te,
      transparent: !0,
      opacity: 0,
      blending: g.AdditiveBlending,
      depthWrite: !1
    }),
    w = new g.PlaneGeometry(1.25, 1.25),
    _ = [];
  for (let u = 0; u < 16; u++) {
    let M = new g.Mesh(w, S.clone());
    M.rotation.x = -Math.PI / 2, M.visible = !1, M.renderOrder = 10, t.add(M), _.push(M);
  }
  let V = new g.MeshBasicMaterial({
      map: Ko(),
      color: uo,
      transparent: !0,
      opacity: 0,
      blending: g.AdditiveBlending,
      depthWrite: !1
    }),
    W = new g.PlaneGeometry(1, 1),
    O = [];
  for (let u = 0; u < 16; u++) {
    let M = V.clone(),
      i = new g.Mesh(W, M);
    i.rotation.x = -Math.PI / 2, i.visible = !1, i.renderOrder = 11, t.add(i), O.push({
      mesh: i,
      mat: M,
      t: 1,
      cube: null
    });
  }
  let k = new g.BufferGeometry(),
    H = new Float32Array(pe * 2 * 3),
    Q = new Float32Array(pe * 2 * 2),
    N = [];
  for (let u = 0; u < pe - 1; u++) {
    let M = u * 2,
      i = u * 2 + 1,
      f = u * 2 + 2,
      P = u * 2 + 3;
    N.push(M, i, f, i, P, f);
  }
  for (let u = 0; u < pe; u++) Q[u * 4] = 0, Q[u * 4 + 1] = u / pe, Q[u * 4 + 2] = 1, Q[u * 4 + 3] = u / pe;
  let h = new g.BufferAttribute(H, 3);
  h.setUsage(g.DynamicDrawUsage), k.setAttribute("position", h), k.setAttribute("uv", new g.BufferAttribute(Q, 2)), k.setIndex(N), k.setDrawRange(0, 0);
  let G = new g.MeshBasicMaterial({
      map: Yo(),
      color: _o,
      transparent: !0,
      opacity: 0,
      depthWrite: !1,
      side: g.DoubleSide
    }),
    z = new g.Mesh(k, G);
  z.frustumCulled = !1, z.renderOrder = 12, t.add(z);
  let K = Array.from({
      length: 16
    }, () => new g.Vector3()),
    lt = [],
    pt = new g.CatmullRomCurve3(lt, !1, "centripetal", 0.5),
    X = new g.BufferGeometry(),
    A = new Float32Array(te * 3),
    nt = new Float32Array(te * 3),
    tt = new Float32Array(te * 3),
    ht = new Float32Array(te),
    B = new Float32Array(te);
  for (let u = 0; u < te; u++) A[u * 3 + 1] = -50, ht[u] = 0;
  let at = new g.BufferAttribute(A, 3),
    mt = new g.BufferAttribute(nt, 3);
  at.setUsage(g.DynamicDrawUsage), mt.setUsage(g.DynamicDrawUsage), X.setAttribute("position", at), X.setAttribute("color", mt);
  let ft = new g.PointsMaterial({
      map: j,
      size: 0.16,
      sizeAttenuation: !0,
      transparent: !0,
      vertexColors: !0,
      blending: g.AdditiveBlending,
      depthWrite: !1
    }),
    vt = new g.Points(X, ft);
  vt.frustumCulled = !1, vt.renderOrder = 13, t.add(vt);
  let kt = 0,
    xt = 0,
    dt = [],
    Pt = 0,
    wt = 0,
    Kt = 0,
    Vt = 0,
    Gt = 0,
    Et = 0,
    ot = {
      active: !1,
      t: 0,
      dur: 0,
      settleAt: 0,
      settleStarted: !1,
      maxDelay: 0.18
    },
    yt = new g.Vector3(),
    Lt = new g.Vector3(),
    L = new g.Vector3(),
    U = new g.Quaternion(),
    Z = new g.Quaternion(),
    it = new g.Color(0.9, 0.93, 0.97),
    gt = new g.Vector3(0, 1, 0),
    Bt = u => (u.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5), u.lengthSq() < 1e-6 && u.set(1, 0, 0), u.normalize()),
    jt = (u, M) => {
      u.vel.y = 3.4 + Math.random() * 3.4 * M, u.vel.x = (Math.random() - 0.5) * 2.2, u.vel.z = (Math.random() - 0.5) * 2.2, Bt(u.angVel).multiplyScalar(6 + Math.random() * 12 * M);
    };
  function Nt(u, M, i, f) {
    let P = it.r * M,
      s = it.g * i,
      p = it.b * f;
    if (!(Math.abs(u.tr - P) < 0.001 && Math.abs(u.tg - s) < 0.001 && Math.abs(u.tb - p) < 0.001)) {
      u.tr = P, u.tg = s, u.tb = p;
      for (let b of u.mats) b.color.setRGB(P, s, p);
    }
  }
  function Ft(u, M, i, f) {
    if (!(Math.abs(u.er - M) < 0.001 && Math.abs(u.eg - i) < 0.001 && Math.abs(u.eb - f) < 0.001)) {
      u.er = M, u.eg = i, u.eb = f;
      for (let P of u.mats) P.emissive.setRGB(M, i, f);
    }
  }
  function Wt(u, M) {
    for (let i = 0; i < M; i++) {
      let f = kt;
      kt = (kt + 1) % te;
      let P = Math.random() * Math.PI * 2,
        s = 0.12 + Math.random() * 0.3;
      A[f * 3] = u.pos.x + Math.cos(P) * s, A[f * 3 + 1] = u.pos.y + ee + u.lift + 0.05, A[f * 3 + 2] = u.pos.z + Math.sin(P) * s, tt[f * 3] = Math.cos(P) * (0.4 + Math.random() * 0.9), tt[f * 3 + 1] = 1.4 + Math.random() * 1.8, tt[f * 3 + 2] = Math.sin(P) * (0.4 + Math.random() * 0.9), B[f] = 0.5 + Math.random() * 0.45, ht[f] = B[f];
    }
    xt = te;
  }
  function rt(u, M) {
    let i = Math.max(0.35, M);
    ot.active = !0, ot.t = 0, ot.dur = i, ot.settleAt = Math.max(0, i - 1.15), ot.settleStarted = !1, ot.maxDelay = Math.min(0.18, (i - ot.settleAt) * 0.25);
    for (let f = 0; f < 16; f++) {
      let P = R[u.dieAt[f]];
      P.cell = f, P.mesh.userData.cell = f, T[f] = P, ar(f, P.p1), U.setFromAxisAngle(gt, u.spinAt[f] * Math.PI / 2), P.q1.copy(U).multiply(m[u.faceIndexAt[f]]), P.delay = Math.random() * ot.maxDelay, P.toss = 0.55 + Math.random() * 0.4, ot.settleAt > 0 && jt(P, 1);
    }
    ot.settleAt === 0 && Tt();
  }
  function Tt() {
    ot.settleStarted = !0;
    for (let u of R) u.p0.copy(u.pos), u.q0.copy(u.quat);
  }
  function Rt(u, M) {
    let i = M < ot.settleAt - 0.3;
    for (let f of R) {
      f.vel.y -= Xr * u, f.pos.addScaledVector(f.vel, u);
      let P = f.angVel.length();
      P > 1e-4 && (yt.copy(f.angVel).divideScalar(P), U.setFromAxisAngle(yt, P * u), f.quat.premultiply(U).normalize());
      let s = Math.round(f.pos.x / se + 1.5),
        p = Math.round(f.pos.z / se + 1.5),
        b = (g.MathUtils.clamp(s, 0, 3) - 1.5) * se,
        $ = (g.MathUtils.clamp(p, 0, 3) - 1.5) * se;
      f.pos.x > b + ae && (f.pos.x = b + ae, f.vel.x = -Math.abs(f.vel.x) * 0.5), f.pos.x < b - ae && (f.pos.x = b - ae, f.vel.x = Math.abs(f.vel.x) * 0.5), f.pos.z > $ + ae && (f.pos.z = $ + ae, f.vel.z = -Math.abs(f.vel.z) * 0.5), f.pos.z < $ - ae && (f.pos.z = $ - ae, f.vel.z = Math.abs(f.vel.z) * 0.5), f.pos.y < ee && (f.pos.y = ee, i ? jt(f, 0.8) : (f.vel.y = -f.vel.y * 0.32, f.vel.x *= 0.6, f.vel.z *= 0.6, f.angVel.multiplyScalar(0.45), Math.abs(f.vel.y) < 0.6 && (f.vel.y = 0))), f.angVel.multiplyScalar(Math.exp(-0.9 * u));
    }
  }
  function ye(u) {
    let M = Math.max(0.05, ot.dur - ot.settleAt - ot.maxDelay);
    for (let i of R) {
      let f = po((u - ot.settleAt - i.delay) / M),
        P = Math.min(1, f / 0.62),
        s = nr(P);
      i.pos.x = i.p0.x + (i.p1.x - i.p0.x) * s, i.pos.z = i.p0.z + (i.p1.z - i.p0.z) * s;
      let p = i.p0.y + (ee - i.p0.y) * Jr(P) + i.toss * Math.sin(Math.PI * P);
      if (f > 0.62) {
        let $ = (f - 0.62) / 0.38;
        p = ee + 0.085 * Math.sin(Math.PI * $) * (1 - $);
      }
      i.pos.y = p;
      let b = tn(Math.min(1, P / 0.92));
      i.quat.slerpQuaternions(i.q0, i.q1, b);
    }
  }
  function we() {
    ot.active = !1;
    for (let u of R) u.pos.copy(u.p1), u.quat.copy(u.q1), u.vel.set(0, 0, 0), u.angVel.set(0, 0, 0);
    Et = 0, t.position.set(0, 0, 0), t.rotation.set(0, 0, 0);
  }
  function to(u) {
    if (!ot.active) return;
    ot.t += u;
    let M = ot.t;
    if (M < ot.settleAt) {
      Rt(u, M), Et = 1 - po((M - (ot.settleAt - 0.45)) / 0.45);
      return;
    }
    ot.settleStarted || Tt(), Et = 0, ye(M), M >= ot.dur && we();
  }
  function eo(u) {
    dt.length = 0;
    for (let M of u) dt.push(M);
    for (let M of R) M.liftTarget = 0, M.glowTarget = 0;
    for (let M = 0; M < u.length; M++) {
      let i = T[u[M]];
      i && (i.liftTarget = Yr, i.glowTarget = M === u.length - 1 ? 1 : 0.55);
    }
    wt = u.length >= 2 ? 1 : 0;
  }
  function ve(u, M) {
    let i = M === "ok" ? 0.75 : M === "dup" ? 0.6 : 0.5,
      f = 0;
    for (let P = 0; P < u.length; P++) {
      let s = T[u[P]];
      if (s && (s.fxKind = M, s.fxDur = i, s.fxT = M === "bad" ? 0 : -P * 0.055, M === "ok")) {
        let p = O[f++ % O.length];
        p.cube = s, p.t = -P * 0.055, Wt(s, 7);
      }
    }
  }
  function De(u) {
    Kt = u ? 1 : 0;
  }
  let xe = new g.Vector3(),
    re = new g.Vector3(),
    oo = new g.Quaternion();
  function Ee(u) {
    let M = u.object.userData.cell;
    if (typeof M != "number") return null;
    u.object.worldToLocal(xe.copy(u.point)), re.set(0, 1, 0).applyQuaternion(u.object.getWorldQuaternion(oo).invert());
    let i = xe.dot(re);
    return i < Pe / 2 - 0.06 ? null : (xe.addScaledVector(re, -i), xe.length() <= qr ? M : null);
  }
  function ro(u) {
    if (Pt += (wt - Pt) * Math.min(1, u * (wt > Pt ? 18 : 9)), Pt < 0.01 && wt === 0) {
      z.visible = !1;
      return;
    }
    z.visible = !0, G.opacity = Pt * 0.95;
    let M = dt.length;
    if (M < 2) return;
    lt.length = 0;
    for (let P = 0; P < M; P++) {
      let s = T[dt[P]],
        p = K[P].copy(s.pos);
      p.y += ee + s.lift + 0.07, lt.push(p);
    }
    let i = Math.min(pe, (M - 1) * 9 + 1),
      f = 0.11;
    for (let P = 0; P < i; P++) {
      let s = P / (i - 1);
      pt.getPoint(s, yt), pt.getPoint(Math.max(0, s - 0.004), Lt), pt.getPoint(Math.min(1, s + 0.004), L), Lt.subVectors(L, Lt), Lt.y = 0, Lt.lengthSq() < 1e-8 && Lt.set(1, 0, 0), Lt.normalize(), L.crossVectors(Lt, gt);
      let p = Math.min(1, Math.min(s, 1 - s) * 6),
        b = f * (0.35 + 0.65 * p);
      H[P * 6] = yt.x - L.x * b, H[P * 6 + 1] = yt.y, H[P * 6 + 2] = yt.z - L.z * b, H[P * 6 + 3] = yt.x + L.x * b, H[P * 6 + 4] = yt.y, H[P * 6 + 5] = yt.z + L.z * b;
    }
    h.needsUpdate = !0, k.setDrawRange(0, (i - 1) * 6);
  }
  function no(u) {
    if (xt === 0) {
      vt.visible = !1;
      return;
    }
    vt.visible = !0;
    let M = 0;
    for (let i = 0; i < te; i++) {
      if (ht[i] <= 0) {
        nt[i * 3] = nt[i * 3 + 1] = nt[i * 3 + 2] = 0;
        continue;
      }
      ht[i] -= u, tt[i * 3 + 1] -= 3.2 * u, A[i * 3] += tt[i * 3] * u, A[i * 3 + 1] += tt[i * 3 + 1] * u, A[i * 3 + 2] += tt[i * 3 + 2] * u;
      let f = po(ht[i] / B[i]),
        P = f * f;
      nt[i * 3] = 0.65 * P, nt[i * 3 + 1] = 0.95 * P, nt[i * 3 + 2] = 1 * P, ht[i] > 0 ? M++ : A[i * 3 + 1] = -50;
    }
    xt = M, at.needsUpdate = !0, mt.needsUpdate = !0;
  }
  function ao(u) {
    Gt += u;
    let M = Math.min(u, 0.05);
    if (Et > 0) {
      let i = Et * 0.03;
      t.position.x = Math.sin(Gt * 43) * i, t.position.z = Math.cos(Gt * 37) * i, t.rotation.z = Math.sin(Gt * 31) * i * 0.5, t.rotation.x = Math.cos(Gt * 29) * i * 0.4;
    } else t.position.x !== 0 && (t.position.set(0, 0, 0), t.rotation.set(0, 0, 0));
    Vt += (Kt - Vt) * Math.min(1, M * 5), Math.abs(Vt - Kt) < 0.001 && (Vt = Kt), it.setRGB(0.9 + 0.1 * Vt, 0.93 + 0.07 * Vt, 0.97 + 0.03 * Vt);
    for (let i of R) {
      i.lift += (i.liftTarget - i.lift) * Math.min(1, M * (i.liftTarget > i.lift ? 16 : 9)), i.glow += (i.glowTarget - i.glow) * Math.min(1, M * (i.glowTarget > i.glow ? 18 : 8)), Math.abs(i.lift - i.liftTarget) < 1e-4 && (i.lift = i.liftTarget), Math.abs(i.glow - i.glowTarget) < 1e-4 && (i.glow = i.glowTarget);
      let f = 0,
        P = 0,
        s = 0,
        p = 0,
        b = 0,
        $ = 0,
        y = 1,
        C = 1,
        J = 1;
      if (i.fxKind && (i.fxT += M, i.fxT >= 0)) {
        let ut = i.fxT / i.fxDur;
        if (ut >= 1) i.fxKind = null;else {
          let _t = Math.min(1, ut / 0.1),
            It = 1 - Math.max(0, (ut - 0.1) / 0.9);
          f = _t * It * It;
          let Zt = i.fxKind === "ok" ? uo : i.fxKind === "dup" ? Do : Bo;
          p = Zt.r, b = Zt.g, $ = Zt.b;
          let je = i.fxKind === "ok" ? Oo : i.fxKind === "dup" ? zo : No;
          y = 1 + (je.r - 1) * f, C = 1 + (je.g - 1) * f, J = 1 + (je.b - 1) * f, i.fxKind === "ok" ? P = 0.11 * Math.sin(Math.PI * Math.min(1, ut / 0.7)) : i.fxKind === "bad" ? s = Math.sin(ut * Math.PI * 7) * 0.11 * (1 - ut) : P = 0.05 * Math.sin(Math.PI * ut);
        }
      }
      let bt = i.glow,
        st = i.fxKind === "ok" ? 0.36 : 0.22;
      Ft(i, Te.r * 0.26 * bt + p * st * f, Te.g * 0.26 * bt + b * st * f, Te.b * 0.26 * bt + $ * st * f), Nt(i, y, C, J);
      let q = i.mesh;
      q.position.set(i.pos.x, i.pos.y + i.lift + P, i.pos.z), s !== 0 ? (yt.set(0.7, 0, 0.7).normalize(), Z.setFromAxisAngle(yt, s), q.quaternion.copy(Z).multiply(i.quat)) : q.quaternion.copy(i.quat);
      let ct = _[i.die],
        St = bt * 0.3 + f * (i.fxKind === "bad" ? 0.12 : 0.3);
      if (St > 0.01) {
        ct.visible = !0;
        let ut = ct.material;
        ut.opacity = St, f > 0.02 ? ut.color.setRGB(p, b, $) : ut.color.copy(Te), ct.position.set(q.position.x, q.position.y + ee + 0.02, q.position.z);
        let _t = 0.95 + 0.25 * bt + 0.3 * f;
        ct.scale.set(_t, _t, 1);
      } else ct.visible = !1;
    }
    for (let i of O) {
      if (!i.cube || i.t >= 0.6) {
        i.mesh.visible = !1;
        continue;
      }
      if (i.t += M, i.t < 0) {
        i.mesh.visible = !1;
        continue;
      }
      let f = i.t / 0.6;
      i.mesh.visible = !0, i.mat.opacity = (1 - f) * 1;
      let P = 0.6 + nr(f) * 1.9;
      i.mesh.scale.set(P, P, 1);
      let s = i.cube;
      i.mesh.position.set(s.mesh.position.x, s.mesh.position.y + ee + 0.03, s.mesh.position.z), f >= 1 && (i.cube = null, i.mesh.visible = !1);
    }
    ro(M), no(M);
  }
  return {
    root: e,
    pickables: F,
    shake: rt,
    setTrace: eo,
    flash: ve,
    setActive: De,
    letterCellAt: Ee,
    update: to,
    render: ao
  };
}
import * as D from "./vendor/007-three.js";
import * as Ct from "./vendor/007-three.js";
function on(e, t) {
  let o = new Float32Array(e * e),
    r = t >>> 0;
  for (let n = 0; n < o.length; n++) r ^= r << 13, r >>>= 0, r ^= r >>> 17, r ^= r << 5, r >>>= 0, o[n] = r % 1e5 / 1e5;
  return o;
}
function ir(e) {
  return e * e * (3 - 2 * e);
}
function rn(e, t, o, r) {
  let n = (o - Math.floor(o)) * t,
    a = (r - Math.floor(r)) * t,
    d = Math.floor(n),
    c = Math.floor(a),
    l = ir(n - d),
    E = ir(a - c),
    x = (d + 1) % t,
    m = (c + 1) % t,
    R = e[c * t + d],
    T = e[c * t + x],
    F = e[m * t + d],
    j = e[m * t + x];
  return R + (T - R) * l + (F + (j - F) * l - (R + (T - R) * l)) * E;
}
function Me(e, t, o) {
  let r = [],
    n = t,
    a = 1;
  for (let d = 0; d < o; d++) r.push({
    table: on(n, e + d * 7919),
    size: n,
    amp: a
  }), n *= 2, a *= 0.5;
  return r;
}
function he(e, t, o) {
  let r = 0,
    n = 0;
  for (let a = 0; a < e.length; a++) {
    let d = e[a];
    r += rn(d.table, d.size, t, o) * d.amp, n += d.amp;
  }
  return r / n;
}
function fe(e, t) {
  let o = document.createElement("canvas");
  return o.width = e, o.height = t, [o, o.getContext("2d")];
}
function ke(e, t, o = !1) {
  let r = new Ct.CanvasTexture(e);
  return r.colorSpace = t, o && (r.wrapS = r.wrapT = Ct.RepeatWrapping), r.anisotropy = 8, r;
}
function lr(e = 1024, t = 512) {
  let [o, r] = fe(e, t),
    [n, a] = fe(e, t),
    [d, c] = fe(e, t),
    l = r.createImageData(e, t),
    E = a.createImageData(e, t),
    x = c.createImageData(e, t),
    m = new Float32Array(e * t),
    R = Me(11, 4, 3),
    T = Me(29, 16, 3),
    F = Me(47, 128, 2),
    j = Me(73, 2, 3),
    S = [79 / 255, 50 / 255, 31 / 255],
    w = [37 / 255, 19 / 255, 10 / 255],
    _ = [108 / 255, 68 / 255, 39 / 255],
    V = 2,
    W = 0.006;
  for (let k = 0; k < t; k++) {
    let H = k / t,
      Q = H * V - Math.floor(H * V),
      N = Math.floor(H * V);
    for (let h = 0; h < e; h++) {
      let G = h / e,
        z = he(R, G * 0.5 + N * 0.37, H * 0.5 + N * 0.61),
        K = Q * 14 + (z - 0.5) * 3.2 + (he(T, G * 0.5, H * 3) - 0.5) * 0.5,
        lt = K - Math.floor(K),
        pt = Math.pow(Math.max(0, 1 - Math.abs(lt - 0.62) / 0.16), 1.4) * 0.8 + Math.pow(Math.max(0, 1 - Math.abs(lt - 0.62) / 0.34), 3) * 0.3,
        X = he(T, G * 0.75, H * 14 + N * 0.5),
        A = he(F, G * 2, H * 2),
        nt = he(j, G, H * 0.5),
        tt = pt * 0.6 + (X - 0.5) * 0.42;
      tt = Math.min(1, Math.max(0, tt));
      let ht = Math.min(Q, 1 - Q),
        B = ht < W ? 1 - ht / W : 0,
        at = S[0] + (w[0] - S[0]) * tt,
        mt = S[1] + (w[1] - S[1]) * tt,
        ft = S[2] + (w[2] - S[2]) * tt,
        vt = (nt - 0.5) * 0.5;
      at += (_[0] - S[0]) * vt, mt += (_[1] - S[1]) * vt, ft += (_[2] - S[2]) * vt;
      let kt = (A - 0.5) * 0.1;
      at += kt, mt += kt * 0.9, ft += kt * 0.7;
      let xt = 1 - B * 0.7;
      at *= xt, mt *= xt, ft *= xt;
      let dt = (k * e + h) * 4;
      l.data[dt] = Math.max(0, Math.min(255, at * 255)), l.data[dt + 1] = Math.max(0, Math.min(255, mt * 255)), l.data[dt + 2] = Math.max(0, Math.min(255, ft * 255)), l.data[dt + 3] = 255;
      let Pt = 0.5 - pt * 0.12 + (A - 0.5) * 0.18 + (X - 0.5) * 0.08 + B * 0.15,
        wt = Math.max(0, Math.min(255, Pt * 255));
      E.data[dt] = wt, E.data[dt + 1] = wt, E.data[dt + 2] = wt, E.data[dt + 3] = 255, m[k * e + h] = pt * 0.35 + (X - 0.5) * 0.6 + (A - 0.5) * 0.25 - B * 2.5;
    }
  }
  let O = 1.6;
  for (let k = 0; k < t; k++) {
    let H = (k - 1 + t) % t,
      Q = (k + 1) % t;
    for (let N = 0; N < e; N++) {
      let h = (N - 1 + e) % e,
        G = (N + 1) % e,
        z = m[H * e + h],
        K = m[H * e + N],
        lt = m[H * e + G],
        pt = m[k * e + h],
        X = m[k * e + G],
        A = m[Q * e + h],
        nt = m[Q * e + N],
        tt = m[Q * e + G],
        ht = lt + 2 * X + tt - (z + 2 * pt + A),
        B = A + 2 * nt + tt - (z + 2 * K + lt),
        at = -ht * O,
        mt = B * O,
        ft = 1,
        vt = Math.hypot(at, mt, ft);
      at /= vt, mt /= vt, ft /= vt;
      let kt = (k * e + N) * 4;
      x.data[kt] = (at * 0.5 + 0.5) * 255, x.data[kt + 1] = (mt * 0.5 + 0.5) * 255, x.data[kt + 2] = (ft * 0.5 + 0.5) * 255, x.data[kt + 3] = 255;
    }
  }
  return r.putImageData(l, 0, 0), a.putImageData(E, 0, 0), c.putImageData(x, 0, 0), {
    map: ke(o, Ct.SRGBColorSpace, !0),
    roughnessMap: ke(n, Ct.NoColorSpace, !0),
    normalMap: ke(d, Ct.NoColorSpace, !0)
  };
}
function fo(e, t) {
  let [o, r] = fe(e, e),
    n = e / 2,
    a = r.createRadialGradient(n, n, 0, n, n, n * Math.SQRT2);
  for (let [d, c] of t) a.addColorStop(d, c);
  return r.fillStyle = a, r.fillRect(0, 0, e, e), ke(o, Ct.SRGBColorSpace);
}
function cr(e = 256) {
  let [t, o] = fe(e, e),
    [r, n] = fe(e, e),
    a = o.createImageData(e, e),
    d = n.createImageData(e, e),
    c = Me(101, 64, 2),
    l = Me(131, 8, 2),
    E = [232 / 255, 220 / 255, 192 / 255];
  for (let R = 0; R < e; R++) for (let T = 0; T < e; T++) {
    let F = T / e,
      j = R / e,
      S = he(c, F, j),
      w = he(l, F, j),
      _ = 0.9 + (S - 0.5) * 0.22 + (w - 0.5) * 0.1,
      V = (R * e + T) * 4;
    a.data[V] = Math.min(255, E[0] * _ * 255), a.data[V + 1] = Math.min(255, E[1] * _ * 255 * (0.995 + (w - 0.5) * 0.03)), a.data[V + 2] = Math.min(255, E[2] * _ * 255 * (0.98 + (S - 0.5) * 0.06)), a.data[V + 3] = 255;
    let W = S * 255;
    d.data[V] = W, d.data[V + 1] = W, d.data[V + 2] = W, d.data[V + 3] = 255;
  }
  o.putImageData(a, 0, 0), n.putImageData(d, 0, 0);
  let x = ke(t, Ct.SRGBColorSpace, !0),
    m = ke(r, Ct.NoColorSpace, !0);
  return x.repeat.set(3, 3), m.repeat.set(3, 3), {
    map: x,
    bumpMap: m
  };
}
var ho = null;
function Ye() {
  if (ho) return ho;
  let e = 512,
    t = 256,
    [o, r] = fe(e, t),
    n = r.createLinearGradient(0, 0, 0, t);
  n.addColorStop(0, "#0a0e1a"), n.addColorStop(0.42, "#1b1a22"), n.addColorStop(0.5, "#3a2a1c"), n.addColorStop(0.62, "#2a1c12"), n.addColorStop(1, "#0e0906"), r.fillStyle = n, r.fillRect(0, 0, e, t);
  let a = r.createRadialGradient(e * 0.3, t * 0.24, 4, e * 0.3, t * 0.24, e * 0.22);
  a.addColorStop(0, "rgba(255,236,205,1)"), a.addColorStop(0.18, "rgba(255,214,160,0.95)"), a.addColorStop(0.5, "rgba(255,170,100,0.30)"), a.addColorStop(1, "rgba(255,150,80,0)"), r.fillStyle = a, r.fillRect(0, 0, e, t);
  let d = r.createRadialGradient(e * 0.3, t * 0.24, 0, e * 0.3, t * 0.24, e * 0.05);
  d.addColorStop(0, "rgba(255,255,245,1)"), d.addColorStop(1, "rgba(255,240,220,0)"), r.fillStyle = d, r.fillRect(0, 0, e, t);
  let c = r.createRadialGradient(e * 0.78, t * 0.34, 4, e * 0.78, t * 0.34, e * 0.18);
  c.addColorStop(0, "rgba(170,205,255,0.9)"), c.addColorStop(0.4, "rgba(110,160,240,0.35)"), c.addColorStop(1, "rgba(60,110,200,0)"), r.fillStyle = c, r.fillRect(0, 0, e, t);
  let l = r.createLinearGradient(0, t * 0.5, 0, t * 0.7);
  l.addColorStop(0, "rgba(120,80,50,0.35)"), l.addColorStop(1, "rgba(60,35,20,0)"), r.fillStyle = l, r.fillRect(0, t * 0.5, e, t * 0.2);
  let E = new Ct.CanvasTexture(o);
  return E.mapping = Ct.EquirectangularReflectionMapping, E.colorSpace = Ct.SRGBColorSpace, ho = E, E;
}
var $t = 2.4,
  go = -0.3,
  Qe = 0.6,
  oe = 0.13,
  dr = 0.032,
  ur = 0.5,
  le = oe,
  yo = $t - oe,
  Ut = $t / 2,
  nn = 0.072,
  an = 0.03,
  mr = Math.tan(32 * Math.PI / 180),
  Ie = 48,
  He = 256,
  ie = 26,
  Se = 12,
  bo = 0.014,
  Le = 56,
  sn = 0.9,
  ln = 1595302,
  pr = 15260864;
function cn() {
  let e = [[0.3, le], [0.3, le + 0.02], [0.395, le + 0.12], [0.43, 0.46], [0.405, 0.68], [0.31, 0.9], [0.165, 1.06], [0.088, 1.15], [nn, Ut]],
    t = [];
  for (let [l, E] of e) t.push(new D.Vector3(l, E, 0));
  for (let l = e.length - 2; l >= 0; l--) t.push(new D.Vector3(e[l][0], $t - e[l][1], 0));
  let n = new D.CatmullRomCurve3(t, !1, "centripetal", 0.5).getSpacedPoints(140).map(l => new D.Vector2(Math.max(0.02, l.x), l.y)),
    a = new Float32Array(He + 1),
    d = 0;
  for (let l = 0; l <= He; l++) {
    let E = le + (yo - le) * (l / He);
    for (; d < n.length - 2 && n[d + 1].y < E;) d++;
    let x = n[d],
      m = n[d + 1],
      R = m.y === x.y ? 0 : Math.min(1, Math.max(0, (E - x.y) / (m.y - x.y)));
    a[l] = x.x + (m.x - x.x) * R;
  }
  return {
    radius: l => {
      let E = (l - le) / (yo - le) * He,
        x = Math.min(He - 1, Math.max(0, Math.floor(E))),
        m = Math.min(1, Math.max(0, E - x));
      return a[x] + (a[x + 1] - a[x]) * m;
    },
    points: n
  };
}
function hr(e, t) {
  let o = Ie + 1,
    r = e * o,
    n = new Float32Array(r * 3),
    a = new Float32Array(r * 3),
    d = new Float32Array(r * 2),
    c = [];
  for (let j = 0; j < e - 1; j++) for (let S = 0; S < Ie; S++) {
    let w = j * o + S,
      _ = w + 1,
      V = w + o,
      W = V + 1;
    c.push(w, V, _, _, V, W);
  }
  let l = new D.BufferGeometry();
  l.setAttribute("position", new D.BufferAttribute(n, 3)), l.setAttribute("normal", new D.BufferAttribute(a, 3)), l.setAttribute("uv", new D.BufferAttribute(d, 2)), l.setIndex(c);
  let E = new Float32Array(o),
    x = new Float32Array(o);
  for (let j = 0; j < o; j++) {
    let S = j / Ie * Math.PI * 2;
    E[j] = Math.cos(S), x[j] = Math.sin(S);
    for (let w = 0; w < e; w++) d[(w * o + j) * 2] = j / Ie * 4;
  }
  let m = new Float32Array(e),
    R = new Float32Array(e),
    T = new D.Mesh(l, t);
  return T.frustumCulled = !1, {
    mesh: T,
    ringR: m,
    ringY: R,
    rings: e,
    commit: () => {
      for (let j = 0; j < e; j++) {
        let S = Math.max(0, j - 1),
          w = Math.min(e - 1, j + 1),
          _ = m[w] - m[S],
          V = R[w] - R[S],
          W = Math.hypot(_, V);
        W < 1e-6 && (_ = 0, V = 1, W = 1);
        let O = V / W,
          k = -_ / W,
          H = m[j],
          Q = R[j];
        for (let N = 0; N < o; N++) {
          let h = j * o + N;
          n[h * 3] = H * E[N], n[h * 3 + 1] = Q, n[h * 3 + 2] = H * x[N], a[h * 3] = O * E[N], a[h * 3 + 1] = k, a[h * 3 + 2] = O * x[N], d[h * 2 + 1] = Q * 2.2;
        }
      }
      l.attributes.position.needsUpdate = !0, l.attributes.normal.needsUpdate = !0, l.attributes.uv.needsUpdate = !0;
    }
  };
}
function dn(e) {
  let r = Math.pow(e, 1.45) - 1;
  return r * r * (2 * r + 1) + 1;
}
function fr() {
  let e = new D.Group();
  e.name = "hourglass";
  let t = Ye(),
    {
      radius: o,
      points: r
    } = cn(),
    n = L => Math.max(0.03, o(L) - an),
    a = new D.MeshPhysicalMaterial({
      color: 16777215,
      transmission: 0.95,
      thickness: 0.38,
      ior: 1.5,
      roughness: 0.045,
      metalness: 0,
      clearcoat: 1,
      clearcoatRoughness: 0.04,
      specularIntensity: 1,
      attenuationColor: new D.Color(14479871),
      attenuationDistance: 2.5,
      envMap: t,
      envMapIntensity: 1.4
    }),
    d = new D.MeshPhysicalMaterial({
      color: ln,
      roughness: 0.3,
      metalness: 0,
      clearcoat: 0.85,
      clearcoatRoughness: 0.12,
      envMap: t,
      envMapIntensity: 0.9
    }),
    c = cr(256),
    l = new D.MeshStandardMaterial({
      color: 16777215,
      map: c.map,
      bumpMap: c.bumpMap,
      bumpScale: 0.35,
      roughness: 0.96,
      metalness: 0,
      emissive: new D.Color(pr),
      emissiveIntensity: 0.26,
      envMap: t,
      envMapIntensity: 0.7
    }),
    E = new D.MeshStandardMaterial({
      color: new D.Color(pr).multiplyScalar(0.9),
      roughness: 0.9,
      metalness: 0
    }),
    x = new D.Group();
  x.position.y = go + $t / 2, e.add(x);
  let m = new D.Group();
  m.position.y = -$t / 2, x.add(m);
  let R = new D.Group();
  x.add(R);
  let T = new D.Group();
  T.position.y = -$t / 2, R.add(T);
  let F = [new D.Vector2(0, 0), new D.Vector2(Qe - 0.035, 0), new D.Vector2(Qe, 0.035), new D.Vector2(Qe, oe - 0.03), new D.Vector2(Qe - 0.03, oe), new D.Vector2(0.345, oe), new D.Vector2(0.325, oe + 0.028), new D.Vector2(0.28, oe + 0.028), new D.Vector2(0, oe + 0.028)],
    j = new D.LatheGeometry(F, Ie),
    S = new D.Mesh(j, d);
  S.castShadow = !0, S.receiveShadow = !0, m.add(S);
  let w = new D.Mesh(j, d);
  w.rotation.x = Math.PI, w.position.y = $t, w.castShadow = !0, w.receiveShadow = !0, m.add(w);
  let _ = new D.CylinderGeometry(dr, dr, $t - 2 * oe, 16),
    V = new D.InstancedMesh(_, d, 3);
  V.castShadow = !0, V.receiveShadow = !0;
  let W = new D.Matrix4();
  for (let L = 0; L < 3; L++) {
    let U = Math.PI / 2 + L * Math.PI * 2 / 3 + Math.PI / 6;
    W.makeTranslation(Math.cos(U) * ur, $t / 2, Math.sin(U) * ur), V.setMatrixAt(L, W);
  }
  V.instanceMatrix.needsUpdate = !0, m.add(V);
  let O = new D.Mesh(new D.LatheGeometry(r, Ie * 2), a);
  O.castShadow = !1, O.receiveShadow = !1, O.renderOrder = 10, m.add(O);
  let k = He,
    H = le + 0.02,
    Q = yo - 0.02,
    N = Ut - 0.11,
    h = new Float32Array(k + 1),
    G = new Float32Array(k + 1);
  for (let L = 0; L <= k; L++) {
    let U = Ut + (Q - Ut) * (L / k);
    if (G[L] = U, L > 0) {
      let Z = G[L - 1],
        it = n(Z),
        gt = n(U);
      h[L] = h[L - 1] + Math.PI * (it * it + it * gt + gt * gt) / 3 * (U - Z);
    }
  }
  let z = new Float32Array(k + 1),
    K = new Float32Array(k + 1),
    lt = 0;
  for (let L = 0; L <= k; L++) {
    let U = H + (N - H) * (L / k);
    if (K[L] = U, L > 0) {
      let Bt = K[L - 1],
        jt = n(Bt),
        Nt = n(U);
      lt += Math.PI * (jt * jt + jt * Nt + Nt * Nt) / 3 * (U - Bt);
    }
    let Z = n(U),
      it = Math.min(Z * mr, N - U),
      gt = Math.PI * Z * Z * it / 3;
    z[L] = Math.max(L > 0 ? z[L - 1] : 0, lt + gt);
  }
  let pt = Math.min(h[k] * 0.82, z[k]),
    X = (L, U, Z) => {
      if (Z <= 0) return U[0];
      if (Z >= L[k]) return U[k];
      let it = 0,
        gt = k;
      for (; gt - it > 1;) {
        let jt = it + gt >> 1;
        L[jt] < Z ? it = jt : gt = jt;
      }
      let Bt = (Z - L[it]) / Math.max(1e-9, L[gt] - L[it]);
      return U[it] + (U[gt] - U[it]) * Bt;
    },
    A = hr(ie + Se, l);
  A.mesh.castShadow = !0, T.add(A.mesh);
  let nt = hr(2 + ie + Se, l);
  nt.mesh.castShadow = !0, T.add(nt.mesh);
  let tt = new D.Mesh(new D.CylinderGeometry(bo, bo * 0.8, 1, 8, 1, !0), E);
  tt.geometry.translate(0, -0.5, 0), tt.position.y = Ut - 0.01, tt.visible = !1, T.add(tt);
  let ht = new D.BufferGeometry(),
    B = new Float32Array(Le * 3),
    at = new Float32Array(Le),
    mt = new Float32Array(Le * 2),
    ft = 19088743,
    vt = () => (ft ^= ft << 13, ft >>>= 0, ft ^= ft >>> 17, ft ^= ft << 5, ft >>>= 0, ft % 1e5 / 1e5);
  for (let L = 0; L < Le; L++) {
    at[L] = vt();
    let U = vt() * Math.PI * 2,
      Z = vt() * bo * 1.6;
    mt[L * 2] = Math.cos(U) * Z, mt[L * 2 + 1] = Math.sin(U) * Z;
  }
  ht.setAttribute("position", new D.BufferAttribute(B, 3)), ht.boundingSphere = new D.Sphere(new D.Vector3(0, Ut - 0.5, 0), 1.2);
  let kt = new D.PointsMaterial({
      color: 15985106,
      size: 0.022,
      sizeAttenuation: !0,
      transparent: !0,
      opacity: 0.9,
      depthWrite: !1
    }),
    xt = new D.Points(ht, kt);
  xt.visible = !1, xt.frustumCulled = !1, T.add(xt);
  let dt = 1,
    Pt = !1,
    wt = 0,
    Kt = !0,
    Vt = 0,
    Gt = 0,
    Et = 1,
    ot = 0,
    yt = () => {
      Kt = !1;
      let L = pt * (1 - dt),
        U = pt * dt,
        Z = X(h, G, L),
        it = L > pt * 0.004;
      if (A.mesh.visible = it, it) {
        let Ft = n(Z),
          Wt = Math.min(0.16, (Z - Ut) * 0.45);
        for (let rt = 0; rt < ie; rt++) {
          let Tt = rt / (ie - 1),
            Rt = Ut + (Z - Ut) * Tt;
          A.ringY[rt] = Rt, A.ringR[rt] = n(Rt) - (rt === 0 ? 0 : 0.004);
        }
        for (let rt = 0; rt < Se; rt++) {
          let Tt = rt / (Se - 1),
            Rt = ie + rt,
            ye = Ft * (1 - Tt);
          A.ringR[Rt] = Math.max(5e-4, ye), A.ringY[Rt] = Z - Wt * Math.pow(Tt, 1.6);
        }
        A.commit();
      }
      let gt = X(z, K, U),
        Bt = U > pt * 0.003;
      nt.mesh.visible = Bt;
      let jt = H;
      if (Bt) {
        let Ft = n(gt),
          Wt = Math.min(Ft * mr, N - gt);
        jt = gt + Wt, nt.ringR[0] = 5e-4, nt.ringY[0] = H, nt.ringR[1] = n(H), nt.ringY[1] = H;
        for (let rt = 0; rt < ie; rt++) {
          let Tt = rt / (ie - 1),
            Rt = H + (gt - H) * Tt;
          nt.ringY[2 + rt] = Rt, nt.ringR[2 + rt] = n(Rt) - 0.004;
        }
        for (let rt = 0; rt < Se; rt++) {
          let Tt = rt / (Se - 1),
            Rt = 2 + ie + rt;
          nt.ringR[Rt] = Math.max(5e-4, Ft * (1 - Tt)), nt.ringY[Rt] = gt + Wt * (1 - Math.pow(1 - Tt, 1.25));
        }
        nt.commit();
      }
      let Nt = Pt && dt > 0.001 && dt < 0.999;
      wt = Math.max(0, Ut - 0.01 - jt), tt.visible = Nt && wt > 0.03, tt.scale.set(1, wt, 1), xt.visible = tt.visible;
    },
    Lt = () => {
      for (let U = 0; U < Le; U++) {
        let Z = (ot * 2.2 / Math.max(0.2, wt) + at[U]) % 1,
          it = Z * Z * 0.4 + Z * 0.6;
        B[U * 3] = mt[U * 2] * (0.4 + it), B[U * 3 + 1] = Ut - 0.01 - it * wt, B[U * 3 + 2] = mt[U * 2 + 1] * (0.4 + it);
      }
      ht.attributes.position.needsUpdate = !0;
    };
  return yt(), {
    root: e,
    setProgress(L, U) {
      let Z = Math.min(1, Math.max(0, L));
      (Z !== dt || U !== Pt) && (dt = Z, Pt = U, Kt = !0);
    },
    flip() {
      let L = Et < 1 ? Gt : Math.round(x.rotation.z / Math.PI) * Math.PI;
      Vt = x.rotation.z, Gt = L + Math.PI, Et = 0, R.rotation.z = -Gt;
    },
    update(L) {
      if (Et < 1) {
        Et = Math.min(1, Et + L / sn);
        let U = dn(Et);
        x.rotation.z = Vt + (Gt - Vt) * U, x.position.y = go + $t / 2 + Math.sin(Et * Math.PI) * 0.38, Et >= 1 && (x.rotation.z = Gt, x.position.y = go + $t / 2);
      }
    },
    render(L) {
      ot += L, Kt && yt(), xt.visible && Lt();
    }
  };
}
import * as I from "./vendor/007-three.js";
var qe = -0.3,
  Ce = 70,
  un = 12,
  mn = 6,
  Ve = {
    calm: {
      keyColor: new I.Color(16770764),
      keyIntensity: 2.6,
      keyPos: new I.Vector3(-7.5, 12, 5.5),
      fillSky: new I.Color(10467036),
      fillGround: new I.Color(3022098),
      fillIntensity: 0.55,
      rimColor: new I.Color(8828159),
      rimIntensity: 1.3,
      lampColor: new I.Color(16761994),
      lampIntensity: 18,
      ambientIntensity: 0.1,
      envIntensity: 0.55
    },
    live: {
      keyColor: new I.Color(16768176),
      keyIntensity: 3.1,
      keyPos: new I.Vector3(-7, 12.5, 6),
      fillSky: new I.Color(11059168),
      fillGround: new I.Color(3810325),
      fillIntensity: 0.65,
      rimColor: new I.Color(9091327),
      rimIntensity: 1.5,
      lampColor: new I.Color(16761988),
      lampIntensity: 20,
      ambientIntensity: 0.12,
      envIntensity: 0.65
    },
    results: {
      keyColor: new I.Color(16763280),
      keyIntensity: 3,
      keyPos: new I.Vector3(-4.5, 11.5, 8),
      fillSky: new I.Color(12167624),
      fillGround: new I.Color(4204058),
      fillIntensity: 0.6,
      rimColor: new I.Color(16752234),
      rimIntensity: 1.7,
      lampColor: new I.Color(16754524),
      lampIntensity: 30,
      ambientIntensity: 0.14,
      envIntensity: 0.6
    }
  };
function pn(e) {
  switch (e) {
    case "countdown":
    case "shaking":
    case "playing":
      return Ve.live;
    case "tally":
    case "results":
      return Ve.results;
    default:
      return Ve.calm;
  }
}
var wo = 260,
  hn = `
  uniform float uTime;
  uniform float uScale;
  attribute vec3 aSeed; // phase, speed, size
  varying float vFade;
  void main() {
    float ph = aSeed.x * 6.2831853;
    float sp = aSeed.y;
    vec3 p = position;
    // Slow drift: a lazy loop in XZ and a gentle rise/fall in Y.
    p.x += sin(uTime * 0.11 * sp + ph) * 0.45 + sin(uTime * 0.037 * sp + ph * 1.7) * 0.3;
    p.z += cos(uTime * 0.09 * sp + ph * 1.3) * 0.45;
    p.y += sin(uTime * 0.07 * sp + ph * 2.1) * 0.35;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    float twinkle = 0.55 + 0.45 * sin(uTime * (0.6 + sp * 0.8) + ph * 3.0);
    vFade = twinkle;
    gl_PointSize = aSeed.z * uScale / -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`,
  fn = `
  uniform vec3 uColor;
  uniform float uOpacity;
  varying float vFade;
  void main() {
    vec2 d = gl_PointCoord - 0.5;
    float r2 = dot(d, d) * 4.0;
    float a = (1.0 - smoothstep(0.2, 1.0, r2)) * vFade * uOpacity;
    gl_FragColor = vec4(uColor * a, a);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;
function gr() {
  let e = new I.Group();
  e.name = "environment";
  let t = Ye(),
    o = lr(1024, 512),
    r = Ce / un,
    n = Ce / mn;
  o.map.repeat.set(r, n), o.roughnessMap.repeat.set(r, n), o.normalMap.repeat.set(r, n);
  let a = new I.MeshPhysicalMaterial({
      map: o.map,
      roughnessMap: o.roughnessMap,
      normalMap: o.normalMap,
      normalScale: new I.Vector2(0.55, 0.55),
      roughness: 1,
      metalness: 0,
      clearcoat: 0.35,
      clearcoatRoughness: 0.5,
      envMap: t,
      envMapIntensity: 0.55
    }),
    d = new I.Mesh(new I.PlaneGeometry(Ce, Ce), a);
  d.rotation.x = -Math.PI / 2, d.position.y = qe, d.receiveShadow = !0, d.name = "table", e.add(d);
  let c = fo(512, [[0, "rgba(255,196,140,0.10)"], [0.12, "rgba(255,196,140,0.05)"], [0.24, "rgba(6,9,18,0)"], [0.42, "rgba(6,9,18,0.55)"], [0.62, "rgba(6,9,18,0.92)"], [1, "rgba(6,9,18,1)"]]),
    l = new I.Mesh(new I.PlaneGeometry(Ce, Ce), new I.MeshBasicMaterial({
      map: c,
      transparent: !0,
      depthWrite: !1,
      toneMapped: !1
    }));
  l.rotation.x = -Math.PI / 2, l.position.y = qe + 0.004, l.renderOrder = -5, e.add(l);
  let E = fo(256, [[0, "rgba(8,6,4,0.62)"], [0.3, "rgba(8,6,4,0.50)"], [0.46, "rgba(8,6,4,0.16)"], [0.62, "rgba(8,6,4,0)"]]),
    x = new I.Mesh(new I.PlaneGeometry(10.5, 10.5), new I.MeshBasicMaterial({
      map: E,
      transparent: !0,
      depthWrite: !1,
      toneMapped: !1
    }));
  x.rotation.x = -Math.PI / 2, x.position.y = qe + 0.008, x.renderOrder = -4, e.add(x);
  let m = new I.SphereGeometry(48, 40, 24),
    R = m.getAttribute("position"),
    T = new Float32Array(R.count * 3),
    F = new I.Color(329486),
    j = new I.Color(1708557),
    S = new I.Color(460042),
    w = new I.Color();
  for (let B = 0; B < R.count; B++) {
    let at = R.getY(B) / 48;
    at >= 0 ? w.copy(j).lerp(F, Math.pow(at, 0.6)) : w.copy(j).lerp(S, Math.min(1, -at * 3)), T[B * 3] = w.r, T[B * 3 + 1] = w.g, T[B * 3 + 2] = w.b;
  }
  m.setAttribute("color", new I.BufferAttribute(T, 3));
  let _ = new I.Mesh(m, new I.MeshBasicMaterial({
    vertexColors: !0,
    side: I.BackSide,
    fog: !1
  }));
  _.position.y = qe, _.name = "backdrop", e.add(_);
  let V = new I.DirectionalLight(16769216, 2.6);
  V.position.copy(Ve.calm.keyPos), V.target.position.set(0.6, 0, -0.2), V.castShadow = !0, V.shadow.mapSize.set(2048, 2048);
  let W = V.shadow.camera;
  W.left = -7.6, W.right = 7.6, W.top = 7.6, W.bottom = -7.6, W.near = 4, W.far = 30, V.shadow.bias = -35e-5, V.shadow.normalBias = 0.025, V.shadow.radius = 3, e.add(V, V.target);
  let O = new I.HemisphereLight(10467036, 3022098, 0.55);
  O.position.set(0, 10, 0), e.add(O);
  let k = new I.DirectionalLight(8828159, 1.3);
  k.position.set(7, 6, -9), k.target.position.set(0, 0.4, 0), e.add(k, k.target);
  let H = new I.PointLight(16761994, 18, 22, 2);
  H.position.set(-2.4, 5.2, 2.2), e.add(H);
  let Q = new I.AmbientLight(16777215, 0.1);
  e.add(Q);
  let N = new I.BufferGeometry(),
    h = new Float32Array(wo * 3),
    G = new Float32Array(wo * 3),
    z = 2654435769,
    K = () => (z ^= z << 13, z >>>= 0, z ^= z >>> 17, z ^= z << 5, z >>>= 0, z % 1e5 / 1e5);
  for (let B = 0; B < wo; B++) h[B * 3] = (K() - 0.5) * 16, h[B * 3 + 1] = 0.2 + K() * 6, h[B * 3 + 2] = (K() - 0.5) * 12, G[B * 3] = K(), G[B * 3 + 1] = 0.6 + K() * 0.9, G[B * 3 + 2] = 0.5 + K() * 1.4;
  N.setAttribute("position", new I.BufferAttribute(h, 3)), N.setAttribute("aSeed", new I.BufferAttribute(G, 3)), N.boundingSphere = new I.Sphere(new I.Vector3(0, 3, 0), 14);
  let lt = new I.ShaderMaterial({
      vertexShader: hn,
      fragmentShader: fn,
      uniforms: {
        uTime: {
          value: 0
        },
        uScale: {
          value: 26
        },
        uColor: {
          value: new I.Color(16767408)
        },
        uOpacity: {
          value: 0.22
        }
      },
      transparent: !0,
      depthWrite: !1,
      blending: I.AdditiveBlending
    }),
    pt = new I.Points(N, lt);
  pt.frustumCulled = !1, pt.name = "dust", e.add(pt);
  let X = Ve.calm,
    A = {
      keyColor: V.color.clone(),
      keyIntensity: V.intensity,
      keyPos: V.position.clone(),
      fillSky: O.color.clone(),
      fillGround: O.groundColor.clone(),
      fillIntensity: O.intensity,
      rimColor: k.color.clone(),
      rimIntensity: k.intensity,
      lampColor: H.color.clone(),
      lampIntensity: H.intensity,
      ambientIntensity: Q.intensity,
      envIntensity: a.envMapIntensity
    },
    nt = 0,
    tt = !1,
    ht = B => {
      A.keyColor.lerp(X.keyColor, B), V.color.copy(A.keyColor), A.keyIntensity += (X.keyIntensity - A.keyIntensity) * B, V.intensity = A.keyIntensity, A.keyPos.lerp(X.keyPos, B), V.position.copy(A.keyPos), A.fillSky.lerp(X.fillSky, B), O.color.copy(A.fillSky), A.fillGround.lerp(X.fillGround, B), O.groundColor.copy(A.fillGround), A.fillIntensity += (X.fillIntensity - A.fillIntensity) * B, O.intensity = A.fillIntensity, A.rimColor.lerp(X.rimColor, B), k.color.copy(A.rimColor), A.rimIntensity += (X.rimIntensity - A.rimIntensity) * B, k.intensity = A.rimIntensity, A.lampColor.lerp(X.lampColor, B), H.color.copy(A.lampColor), A.lampIntensity += (X.lampIntensity - A.lampIntensity) * B, H.intensity = A.lampIntensity, A.ambientIntensity += (X.ambientIntensity - A.ambientIntensity) * B, Q.intensity = A.ambientIntensity, A.envIntensity += (X.envIntensity - A.envIntensity) * B, a.envMapIntensity = A.envIntensity;
    };
  return {
    root: e,
    setMood(B) {
      X = pn(B);
    },
    update() {
      if (!tt) {
        let B = e.parent;
        if (B && B.isScene) {
          let at = B;
          at.environment || (at.environment = t, at.environmentIntensity = 0.45), tt = !0;
        }
      }
    },
    render(B) {
      nt += B, lt.uniforms.uTime.value = nt;
      let at = 1 - Math.exp(-B * 4);
      ht(at);
    }
  };
}
import "./vendor/007-three.js";
var Xe = class {
  constructor(t) {
    this.target = t;
  }
  yaw = 0;
  velocity = 0;
  dragging = !1;
  snapping = !0;
  held = 0;
  beginDrag() {
    this.dragging = !0, this.snapping = !1, this.velocity = 0;
  }
  drag(t) {
    if (!this.dragging) return;
    let o = -t * 0.0085;
    this.yaw += o, this.velocity = o * 60;
  }
  endDrag() {
    this.dragging = !1, this.snapping = !0;
  }
  setKeyTurn(t) {
    this.held = t;
  }
  turn(t) {
    let o = Math.round(this.yaw / (Math.PI / 2)) * (Math.PI / 2) + t * (Math.PI / 2);
    this.yaw = this.yaw, this.velocity = 0, this.snapping = !0, this.snapTarget = o;
  }
  snapTarget = null;
  update(t) {
    if (this.held !== 0 && !this.dragging) {
      this.velocity = -this.held * 2.4, this.yaw += this.velocity * t, this.snapTarget = null, this.snapping = !0;
      return;
    }
    if (!this.dragging) {
      if (Math.abs(this.velocity) > 0.05) {
        this.yaw += this.velocity * t, this.velocity *= Math.exp(-4.5 * t);
        return;
      }
      if (this.snapping) {
        let o = this.snapTarget ?? Math.round(this.yaw / (Math.PI / 2)) * (Math.PI / 2),
          r = o - this.yaw;
        Math.abs(r) < 5e-4 ? (this.yaw = o, this.snapping = !1, this.snapTarget = null) : this.yaw += r * Math.min(1, 9 * t);
      }
    }
  }
  render() {
    this.target.rotation.y = this.yaw;
  }
};
import * as Mt from "./vendor/007-three.js";
var br = 60,
  gn = 12.44,
  yr = new Mt.Vector3(0, 0.2, 0),
  ge = {
    fov: 34,
    position: new Mt.Vector3(0, Math.sin(Mt.MathUtils.degToRad(br)), Math.cos(Mt.MathUtils.degToRad(br))).multiplyScalar(gn).add(yr),
    lookAt: yr
  },
  vo = new Mt.Vector3(4.9, 0, -1.2),
  bn = new Mt.Vector3(0, 0, -4.7),
  Ze = 13.5,
  yn = 60,
  wn = 7,
  vn = 14.5,
  xn = 75,
  En = new Mt.Vector3(0, 0.7, -0.8),
  jn = 0.465,
  Je = class {
    constructor(t, o) {
      this.camera = t;
      this.hourglass = o;
      let r = Mt.MathUtils.degToRad(yn);
      this.back.set(0, Math.sin(r), Math.cos(r));
      let n = this.back.clone().negate();
      this.up.crossVectors(new Mt.Vector3(1, 0, 0), n).normalize();
    }
    portrait = !1;
    back = new Mt.Vector3();
    up = new Mt.Vector3();
    look = new Mt.Vector3();
    get isPortrait() {
      return this.portrait;
    }
    apply(t) {
      let o = t.aspect < 1,
        r = o !== this.portrait;
      if (this.portrait = o, o) {
        let n = Math.max(0.2, t.aspect),
          a = 2 * Math.atan(wn / (2 * Ze * n)),
          d = 2 * Math.atan(vn / (2 * Ze)),
          c = Math.min(xn, Mt.MathUtils.radToDeg(Math.max(a, d)));
        Math.abs(this.camera.fov - c) > 0.001 && (this.camera.fov = c, this.camera.updateProjectionMatrix());
        let l = 2 * Ze * Math.tan(Mt.MathUtils.degToRad(c / 2));
        this.look.copy(En).addScaledVector(this.up, -(0.5 - jn) * l), this.camera.position.copy(this.look).addScaledVector(this.back, Ze), this.camera.lookAt(this.look), this.hourglass.position.copy(bn);
      } else if (r) {
        let n = Mt.MathUtils.radToDeg(2 * Math.atan(Math.tan(Mt.MathUtils.degToRad(ge.fov / 2)) * t.scale.y));
        this.camera.fov = n, this.camera.updateProjectionMatrix(), this.camera.position.copy(ge.position), this.camera.lookAt(ge.lookAt), this.hourglass.position.copy(vo);
      }
      return {
        portrait: o,
        width: t.width,
        height: t.height
      };
    }
  };
var wr = "jamble-ui-styles",
  Tn = `
.jm {
  --u: calc(var(--rx-hud-scale, 1) * 0.54583px);
  --ivory: #efe6cf;
  --ivory-70: rgba(239, 230, 207, 0.7);
  --ivory-45: rgba(239, 230, 207, 0.45);
  --ivory-12: rgba(239, 230, 207, 0.12);
  --ink: #1c5d8a;
  --ink-2: #1857a6;
  --lagoon: #1d6fa8;
  --lagoon-hi: #3aa0dc;
  --panel: rgba(9, 13, 19, 0.66);
  --panel-2: rgba(9, 13, 19, 0.82);
  --good: #7ed491;
  --amber: #f2b845;
  --red: #ef6b6b;
  --sand: #e8d9b0;
  --font: 'Outfit', 'Avenir Next', 'Helvetica Neue', Arial, sans-serif;
  --ease-out: cubic-bezier(0.22, 1, 0.36, 1);
  --back-out: cubic-bezier(0.34, 1.56, 0.64, 1);

  position: absolute;
  top: max(var(--rx-safe-top, 0px), env(safe-area-inset-top, 0px));
  right: max(var(--rx-safe-right, 0px), env(safe-area-inset-right, 0px));
  bottom: max(var(--rx-safe-bottom, 0px), env(safe-area-inset-bottom, 0px));
  left: max(var(--rx-safe-left, 0px), env(safe-area-inset-left, 0px));
  overflow: hidden;
  pointer-events: none;
  font-family: var(--font);
  color: var(--ivory);
  font-size: 16u;
  line-height: 1.25;
  -webkit-font-smoothing: antialiased;
  user-select: none;
  -webkit-user-select: none;
}
.jm, .jm * { box-sizing: border-box; margin: 0; padding: 0; }
:where(.jm) button, :where(.jm) input {
  appearance: none; -webkit-appearance: none;
  border: 0; background: none; font: inherit; color: inherit; outline: none;
  letter-spacing: inherit;
}
.jm [hidden] { display: none !important; }
.jm .num { font-variant-numeric: tabular-nums; }
.jm svg { display: block; }

/* ---------- shared ---------- */
.jm-label {
  font-size: 11u; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase;
  color: var(--ivory-45);
}
.jm-panel {
  pointer-events: auto;
  background: var(--panel);
  border: 1px solid var(--ivory-12);
  border-radius: 18u;
  box-shadow: 0 18u 50u rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(16px) saturate(1.2);
  -webkit-backdrop-filter: blur(16px) saturate(1.2);
}

.jm-btn {
  pointer-events: auto;
  position: relative;
  display: inline-flex; align-items: center; justify-content: center; gap: 8u;
  min-height: 46u; padding: 0 24u;
  border-radius: 999u;
  font-size: 16u; font-weight: 700; letter-spacing: 0.01em; white-space: nowrap;
  cursor: pointer;
  color: #0e1a26; background: var(--ivory);
  box-shadow: 0 6u 18u rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.55);
  transition: transform 160ms var(--ease-out), box-shadow 160ms var(--ease-out),
              background 160ms var(--ease-out), color 160ms, opacity 160ms;
  transform: translateY(0);
}
.jm-btn:hover { transform: translateY(-2u); box-shadow: 0 10u 24u rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.6); background: #fff7e6; }
.jm-btn:active { transform: translateY(0) scale(0.97); box-shadow: 0 3u 10u rgba(0, 0, 0, 0.35); transition-duration: 70ms; }
.jm-btn:focus-visible { box-shadow: 0 0 0 3u rgba(58, 160, 220, 0.6), 0 6u 18u rgba(0, 0, 0, 0.35); }
.jm-btn:disabled { opacity: 0.42; cursor: not-allowed; transform: none; box-shadow: none; }
.jm-btn.cta {
  color: #f6f1e4;
  background: linear-gradient(180deg, var(--lagoon-hi) 0%, var(--lagoon) 55%, #165d92 100%);
  box-shadow: 0 8u 22u rgba(29, 111, 168, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.35);
}
.jm-btn.cta:hover { background: linear-gradient(180deg, #4cb0ea 0%, #2280bf 55%, #1a6aa6 100%); box-shadow: 0 12u 28u rgba(29, 111, 168, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.4); }
.jm-btn.cta:disabled { opacity: 0.42; }
.jm-btn.ghost {
  color: var(--ivory); background: rgba(239, 230, 207, 0.06);
  border: 1px solid rgba(239, 230, 207, 0.22); box-shadow: none;
}
.jm-btn.ghost:hover { background: rgba(239, 230, 207, 0.12); border-color: rgba(239, 230, 207, 0.4); box-shadow: 0 8u 20u rgba(0, 0, 0, 0.3); }
.jm-btn.big { min-height: 54u; padding: 0 34u; font-size: 18u; }
.jm-btn.small { min-height: 36u; padding: 0 16u; font-size: 13u; }
.jm-btn svg { width: 18u; height: 18u; }

.jm-input {
  pointer-events: auto;
  height: 46u; width: 168u; padding: 0 16u;
  border-radius: 999u;
  background: rgba(6, 10, 15, 0.55);
  border: 1px solid rgba(239, 230, 207, 0.22);
  color: var(--ivory);
  font-size: 18u; font-weight: 700; letter-spacing: 0.22em; text-transform: uppercase;
  text-align: center;
  user-select: text; -webkit-user-select: text;
  transition: border-color 160ms, box-shadow 160ms, background 160ms;
}
.jm-input::placeholder { color: var(--ivory-45); letter-spacing: 0.16em; font-weight: 600; }
.jm-input:focus { border-color: var(--lagoon-hi); box-shadow: 0 0 0 3u rgba(58, 160, 220, 0.35); background: rgba(6, 10, 15, 0.7); }
.jm-input:disabled { opacity: 0.42; }

.jm-avatar {
  flex: none; width: 40u; height: 40u; border-radius: 50%;
  display: flex; align-items: center; justify-content: center; overflow: hidden;
  background: linear-gradient(160deg, #2b7fb6, #16466d);
  color: #f6f1e4; font-weight: 800; font-size: 17u; letter-spacing: 0;
  box-shadow: inset 0 0 0 1.5u rgba(255, 255, 255, 0.18), 0 4u 12u rgba(0, 0, 0, 0.35);
}
.jm-avatar img { width: 100%; height: 100%; object-fit: cover; display: block; }
.jm-avatar.empty { background: rgba(239, 230, 207, 0.08); box-shadow: inset 0 0 0 1.5u rgba(239, 230, 207, 0.18); }
.jm-badge {
  display: inline-block; flex: none; max-width: 100%;
  padding: 3u 7u; border-radius: 6u;
  font-size: 10u; font-weight: 800; letter-spacing: 0.14em; text-transform: uppercase; line-height: 1;
  white-space: nowrap; overflow: hidden;
}
.jm-badge.host { background: rgba(242, 184, 69, 0.18); color: var(--amber); border: 1px solid rgba(242, 184, 69, 0.35); }
.jm-badge.you { background: rgba(58, 160, 220, 0.16); color: #8ccdf2; border: 1px solid rgba(58, 160, 220, 0.35); }
.jm-badge.ready { background: rgba(126, 212, 145, 0.18); color: var(--good); border: 1px solid rgba(126, 212, 145, 0.4); }
.jm-badge.waiting { background: rgba(239, 230, 207, 0.06); color: var(--ivory-45); border: 1px solid rgba(239, 230, 207, 0.16); }

/* ---------- screens ---------- */
.jm-screen {
  position: absolute; inset: 0;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  opacity: 0; visibility: hidden;
  transition: opacity 260ms var(--ease-out), visibility 0s linear 260ms;
}
.jm-screen.on { opacity: 1; visibility: visible; transition: opacity 320ms var(--ease-out), visibility 0s; }
.jm-scrim { position: absolute; inset: 0; pointer-events: none; }
.jm-title .jm-scrim { background: radial-gradient(ellipse 70% 60% at 50% 45%, rgba(4, 8, 14, 0.22), rgba(4, 8, 14, 0.58)); }
.jm-lobby .jm-scrim, .jm-results .jm-scrim { background: radial-gradient(ellipse 80% 70% at 50% 50%, rgba(4, 8, 14, 0.42), rgba(4, 8, 14, 0.7)); }

/* Title */
.jm-title-inner { position: relative; display: flex; flex-direction: column; align-items: center; gap: 0; }
.jm-wordmark { position: relative; display: flex; gap: 12u; margin-bottom: 26u; }
.jm-wordmark::before { content: ''; position: absolute; left: -40u; right: -40u; top: -30u; bottom: -30u; background: radial-gradient(ellipse at 50% 50%, rgba(58, 160, 220, 0.22), rgba(58, 160, 220, 0) 70%); pointer-events: none; }
.jm-tile {
  position: relative;
  width: 96u; height: 96u; border-radius: 18u;
  display: flex; align-items: center; justify-content: center;
  font-size: 60u; font-weight: 800; letter-spacing: 0; color: var(--ink);
  background: linear-gradient(165deg, #fbf5e6 0%, var(--ivory) 60%, #d9cfb2 100%);
  box-shadow: 0 14u 26u rgba(0, 0, 0, 0.45), 0 2u 0 #cbbf9e, inset 0 1px 0 rgba(255, 255, 255, 0.8), inset 0 -3u 6u rgba(120, 100, 60, 0.18);
  transform: rotate(var(--tilt, 0deg));
  animation: jm-tile-in 640ms var(--back-out) both;
  animation-delay: calc(var(--i) * 70ms);
}
.jm-tile.accent { color: #f6f1e4; background: linear-gradient(165deg, #3aa0dc 0%, var(--lagoon) 55%, #145a8c 100%); box-shadow: 0 14u 26u rgba(0, 0, 0, 0.45), 0 2u 0 #0f4470, inset 0 1px 0 rgba(255, 255, 255, 0.4), inset 0 -3u 6u rgba(0, 20, 40, 0.3); }
.jm-tile .ul { position: relative; }
.jm-tile .ul::after { content: ''; position: absolute; left: 6%; right: 6%; bottom: -5u; height: 4u; border-radius: 2u; background: currentColor; opacity: 0.85; }
@keyframes jm-tile-in {
  0% { opacity: 0; transform: translateY(-40u) rotate(calc(var(--tilt, 0deg) - 14deg)) scale(0.6); }
  100% { opacity: 1; transform: translateY(0) rotate(var(--tilt, 0deg)) scale(1); }
}
.jm-tagline {
  font-size: 22u; font-weight: 600; letter-spacing: 0.36em; text-transform: uppercase;
  color: var(--ivory-70); margin-bottom: 38u; text-shadow: 0 2u 12u rgba(0, 0, 0, 0.6);
  animation: jm-fade-up 600ms var(--ease-out) 420ms both;
}
.jm-tagline b { color: var(--lagoon-hi); font-weight: 700; }
.jm-title-actions { display: flex; flex-direction: column; align-items: center; gap: 16u; animation: jm-fade-up 600ms var(--ease-out) 520ms both; }
.jm-title-row { display: flex; gap: 12u; align-items: center; }
.jm-join { display: flex; gap: 8u; align-items: center; }
.jm-host-choice { display: flex; flex-direction: column; align-items: center; gap: 12u; animation: jm-fade-up 360ms var(--ease-out) both; }
.jm-choice-row { display: flex; gap: 12u; }
.jm-choice {
  pointer-events: auto; cursor: pointer; position: relative;
  display: flex; align-items: center; gap: 14u; text-align: left;
  width: 290u; padding: 16u 18u; border-radius: 18u;
  background: rgba(10, 15, 22, 0.9); border: 1px solid rgba(239, 230, 207, 0.22);
  backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
  box-shadow: 0 12u 30u rgba(0, 0, 0, 0.5);
  transition: transform 160ms var(--ease-out), border-color 160ms, background 160ms, box-shadow 160ms, opacity 160ms;
}
.jm-choice:hover { transform: translateY(-2u); border-color: rgba(58, 160, 220, 0.6); background: rgba(16, 30, 44, 0.94); box-shadow: 0 16u 36u rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(58, 160, 220, 0.25); }
.jm-choice:active { transform: scale(0.98); }
.jm-choice:focus-visible { box-shadow: 0 0 0 3u rgba(58, 160, 220, 0.6); }
.jm-choice:disabled { cursor: default; opacity: 0.5; transform: none; }
.jm-choice.busy { opacity: 1; border-color: var(--lagoon-hi); animation: jm-busy 1.2s ease-in-out infinite; }
@keyframes jm-busy { 0%, 100% { box-shadow: 0 0 0 0 rgba(58, 160, 220, 0.5); } 50% { box-shadow: 0 0 0 6u rgba(58, 160, 220, 0); } }
.jm-choice-icon { flex: none; width: 46u; height: 46u; border-radius: 14u; display: flex; align-items: center; justify-content: center; }
.jm-choice-icon svg { width: 24u; height: 24u; }
.jm-choice.private .jm-choice-icon { background: rgba(242, 184, 69, 0.16); color: var(--amber); }
.jm-choice.public .jm-choice-icon { background: rgba(58, 160, 220, 0.2); color: #8ccdf2; }
.jm-choice-body { display: flex; flex-direction: column; gap: 4u; min-width: 0; }
.jm-choice-label { font-size: 18u; font-weight: 800; }
.jm-choice-detail { font-size: 13u; color: var(--ivory-70); line-height: 1.35; }
.jm-mp-note { font-size: 13u; color: var(--amber); opacity: 0.9; display: flex; align-items: center; gap: 6u; }
.jm-mp-note svg { width: 14u; height: 14u; }
.jm-howto {
  position: absolute; left: 0; right: 0; bottom: 26u; text-align: center;
  font-size: 13u; color: var(--ivory-45); letter-spacing: 0.02em;
  animation: jm-fade-up 600ms var(--ease-out) 700ms both;
}
.jm-howto kbd {
  font: inherit; font-weight: 700; color: var(--ivory-70);
  padding: 1u 6u; border-radius: 5u; border: 1px solid rgba(239, 230, 207, 0.2); background: rgba(239, 230, 207, 0.06);
}
@keyframes jm-fade-up { 0% { opacity: 0; transform: translateY(14u); } 100% { opacity: 1; transform: translateY(0); } }

/* Lobby */
.jm-lobby-panel {
  position: relative; width: 640u; max-width: calc(100% - 40u); max-height: calc(100% - 40u);
  padding: 22u 30u 24u; display: flex; flex-direction: column; align-items: center; gap: 14u;
  overflow: hidden; scrollbar-width: thin; scrollbar-color: rgba(239, 230, 207, 0.25) transparent;
  animation: jm-panel-in 420ms var(--back-out) both;
  transition: width 320ms var(--ease-out);
}
.jm-lobby-panel.wide { width: 880u; }
.jm-lobby-head { display: flex; align-items: flex-start; justify-content: space-between; width: 100%; gap: 12u; flex: none; }
.jm-lobby-titles { display: flex; flex-direction: column; gap: 6u; min-width: 0; }
.jm-lobby-titlerow { display: flex; align-items: center; gap: 10u; }
.jm-lobby-sub { font-size: 13u; color: var(--ivory-45); }
.jm-vis {
  display: inline-flex; align-items: center; gap: 5u; padding: 4u 9u 4u 7u; border-radius: 999u;
  font-size: 11u; font-weight: 800; letter-spacing: 0.14em; text-transform: uppercase; line-height: 1;
}
.jm-vis svg { width: 13u; height: 13u; }
.jm-vis.public { background: rgba(58, 160, 220, 0.18); color: #8ccdf2; border: 1px solid rgba(58, 160, 220, 0.4); }
.jm-vis.private { background: rgba(242, 184, 69, 0.14); color: var(--amber); border: 1px solid rgba(242, 184, 69, 0.35); }
.jm-lobby-title { font-size: 26u; font-weight: 800; letter-spacing: -0.01em; line-height: 1; }
.jm-lobby-count { flex: none; padding-top: 6u; font-size: 12u; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: var(--ivory-45); font-variant-numeric: tabular-nums; }
@keyframes jm-panel-in { 0% { opacity: 0; transform: translateY(18u) scale(0.96); } 100% { opacity: 1; transform: none; } }
.jm-code-wrap { display: flex; flex-direction: column; align-items: center; gap: 6u; }
.jm-code {
  pointer-events: auto; cursor: pointer;
  display: inline-flex; align-items: center; gap: 14u;
  padding: 8u 18u 8u 26u; border-radius: 16u;
  background: rgba(239, 230, 207, 0.05); border: 1px dashed rgba(239, 230, 207, 0.28);
  font-size: 54u; font-weight: 800; letter-spacing: 0.22em; line-height: 1; color: var(--ivory);
  text-shadow: 0 2u 12u rgba(58, 160, 220, 0.35);
  transition: background 160ms, border-color 160ms, transform 160ms var(--ease-out);
}
.jm-code:hover { background: rgba(239, 230, 207, 0.1); border-color: rgba(239, 230, 207, 0.5); transform: translateY(-1u); }
.jm-code:active { transform: scale(0.98); }
.jm-code svg { width: 22u; height: 22u; opacity: 0.55; margin-left: -8u; }
.jm-code:hover svg { opacity: 1; }
.jm-code-hint { font-size: 13u; color: var(--ivory-45); }
.jm-seats {
  display: flex; flex-wrap: wrap; justify-content: center; align-content: flex-start; gap: 10u; width: 100%;
  flex: 0 1 auto; min-height: 0; overflow-y: auto; overscroll-behavior: contain; padding: 2u;
  scrollbar-width: thin; scrollbar-color: rgba(239, 230, 207, 0.25) transparent;
}
.jm-seat {
  display: flex; flex-direction: column; align-items: center; gap: 8u; text-align: center;
  width: 132u; padding: 14u 10u 12u; border-radius: 14u; min-height: 124u;
  background: rgba(29, 111, 168, 0.14); border: 1px solid rgba(58, 160, 220, 0.28);
  transition: background 220ms, border-color 220ms, box-shadow 220ms;
  animation: jm-seat-in 420ms var(--back-out) both;
}
.jm-seat.self { box-shadow: inset 0 0 0 1.5u rgba(58, 160, 220, 0.55); }
.jm-seat.ready { background: rgba(126, 212, 145, 0.12); border-color: rgba(126, 212, 145, 0.42); }
.jm-seat.ready .jm-avatar { box-shadow: 0 0 0 2u rgba(126, 212, 145, 0.7), 0 0 16u rgba(126, 212, 145, 0.35); }
.jm-seat .jm-avatar { width: 48u; height: 48u; font-size: 20u; transition: box-shadow 220ms; }
.jm-seat-name { font-size: 15u; font-weight: 700; max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.jm-seat-badges { display: flex; flex-wrap: wrap; justify-content: center; gap: 4u; min-height: 16u; }
/* Nine or more: tighter cards so two rows still fit above the actions. */
.jm-seats.many .jm-seat { width: 124u; min-height: 108u; padding: 10u 8u 10u; gap: 6u; }
.jm-seats.many .jm-seat .jm-avatar { width: 40u; height: 40u; font-size: 17u; }
.jm-seats.many .jm-seat-name { font-size: 13u; }
/* Seventeen to 32: compact name chips, four to a row. */
.jm-seats.crowd { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 6u; }
.jm-seats.crowd .jm-seat { flex-direction: row; width: auto; min-height: 0; padding: 6u 8u 6u 6u; gap: 8u; border-radius: 10u; text-align: left; }
.jm-seats.crowd .jm-seat .jm-avatar { width: 28u; height: 28u; font-size: 12u; }
.jm-seats.crowd .jm-seat-name { flex: 1 1 auto; min-width: 0; font-size: 13u; }
.jm-seats.crowd .jm-seat-badges { flex: none; flex-wrap: nowrap; min-height: 0; }
.jm-seats.crowd .jm-badge { padding: 2u 5u; font-size: 9u; }
.jm-seats.crowd .jm-badge.ready, .jm-seats.crowd .jm-badge.waiting { display: none; }
@keyframes jm-seat-in { 0% { opacity: 0; transform: scale(0.9); } 100% { opacity: 1; transform: none; } }
.jm-lobby-cta { flex: none; display: flex; flex-direction: column; align-items: center; gap: 10u; margin-top: 4u; }
.jm-waiting { display: flex; align-items: center; gap: 10u; font-size: 15u; color: var(--ivory-70); min-height: 24u; }
.jm-waiting.good { color: var(--good); }
.jm-waiting.good .jm-dot { background: var(--good); animation: none; box-shadow: 0 0 10u rgba(126, 212, 145, 0.6); }
.jm-btn.ready { color: #0f2416; background: linear-gradient(180deg, #9fe3ad 0%, #6fc985 60%, #5cb673 100%); box-shadow: 0 8u 22u rgba(126, 212, 145, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.5); }
.jm-btn.ready:hover { background: linear-gradient(180deg, #ade9b9 0%, #7bd191 60%, #66bf7d 100%); }
.jm-dot { width: 10u; height: 10u; border-radius: 50%; background: var(--lagoon-hi); box-shadow: 0 0 0 0 rgba(58, 160, 220, 0.6); animation: jm-pulse 1.6s ease-out infinite; }
@keyframes jm-pulse { 0% { box-shadow: 0 0 0 0 rgba(58, 160, 220, 0.6); } 100% { box-shadow: 0 0 0 12u rgba(58, 160, 220, 0); } }
.jm-lobby-foot { flex: none; display: flex; gap: 10u; margin-top: 4u; }

/* ---------- burst ---------- */
.jm-burst {
  position: absolute; left: 0; right: 0; top: 50%; margin-top: -60u; text-align: center; pointer-events: none;
  font-size: 108u; font-weight: 800; letter-spacing: 0.02em; line-height: 1.1;
  color: var(--ivory);
  text-shadow: 0 3u 0 rgba(20, 60, 100, 0.55), 0 10u 26u rgba(0, 0, 0, 0.75), 0 0 70u rgba(0, 0, 0, 0.6);
  opacity: 0;
}
.jm-burst::before { content: ''; position: absolute; left: 50%; top: 50%; width: 720u; height: 260u; transform: translate(-50%, -50%); background: radial-gradient(ellipse at 50% 50%, rgba(4, 8, 14, 0.55), rgba(4, 8, 14, 0) 68%); z-index: -1; }
.jm-burst.small { font-size: 40u; font-weight: 700; letter-spacing: 0.3em; text-transform: uppercase; color: var(--ivory); margin-top: -24u; }
.jm-burst.small::before { height: 140u; width: 560u; }
.jm-burst.go { animation: jm-burst 1100ms var(--back-out) both; }
.jm-burst.go.long { animation-duration: 2200ms; }
@keyframes jm-burst {
  0% { opacity: 0; transform: scale(0.4) translateY(10u); }
  18% { opacity: 1; transform: scale(1.06) translateY(0); }
  28% { transform: scale(1); }
  70% { opacity: 1; transform: scale(1); }
  100% { opacity: 0; transform: scale(1.12) translateY(-10u); }
}

/* ---------- in-round HUD ---------- */
.jm-hud { position: absolute; inset: 0; opacity: 0; visibility: hidden; transition: opacity 260ms var(--ease-out), visibility 0s linear 260ms; }
.jm-hud.on { opacity: 1; visibility: visible; transition: opacity 320ms var(--ease-out), visibility 0s; }

.jm-timer {
  position: absolute; top: 14u; left: 50%; transform: translateX(-50%);
  display: flex; align-items: center; gap: 12u;
  padding: 6u 22u 6u 14u; border-radius: 999u;
  background: rgba(9, 13, 19, 0.5); border: 1px solid var(--ivory-12);
  backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
  box-shadow: 0 10u 30u rgba(0, 0, 0, 0.35);
  transition: border-color 300ms, background 300ms, box-shadow 300ms;
}
.jm-timer svg { width: 40u; height: 54u; overflow: visible; }
.jm-timer.flip svg { animation: jm-flip 800ms var(--back-out) both; }
@keyframes jm-flip { 0% { transform: rotate(180deg); } 100% { transform: rotate(360deg); } }
.jm-hg-stream { stroke-dasharray: 2 2; opacity: 0; transition: opacity 200ms; }
.jm-timer.running .jm-hg-stream { opacity: 1; animation: jm-stream 400ms linear infinite; }
@keyframes jm-stream { 0% { stroke-dashoffset: 0; } 100% { stroke-dashoffset: -4; } }
.jm-digits { font-size: 52u; font-weight: 700; letter-spacing: -0.01em; line-height: 1; font-variant-numeric: tabular-nums; color: var(--ivory); text-shadow: 0 2u 10u rgba(0, 0, 0, 0.5); transition: color 300ms; }
.jm-timer.warn .jm-digits { color: var(--amber); }
.jm-timer.warn { border-color: rgba(242, 184, 69, 0.35); }
.jm-timer.urgent .jm-digits { color: var(--red); }
.jm-timer.urgent { border-color: rgba(239, 107, 107, 0.5); background: rgba(40, 12, 12, 0.55); box-shadow: 0 10u 30u rgba(0, 0, 0, 0.35), 0 0 30u rgba(239, 107, 107, 0.25); }
.jm-timer.urgent .jm-digits.tick { animation: jm-tick 600ms var(--ease-out); }
@keyframes jm-tick { 0% { transform: scale(1.18); text-shadow: 0 0 22u rgba(239, 107, 107, 0.8); } 100% { transform: scale(1); } }
.jm-timer.done .jm-digits { color: var(--ivory-70); }

/* Entry line */
.jm-entry {
  position: absolute; bottom: 22u; left: 50%; transform: translateX(-50%);
  display: flex; align-items: center; gap: 8u;
  min-width: 300u; min-height: 66u; padding: 8u 18u;
  border-radius: 20u;
  background: rgba(9, 13, 19, 0.6); border: 1px solid var(--ivory-12);
  backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px);
  box-shadow: 0 12u 36u rgba(0, 0, 0, 0.4);
  transition: border-color 200ms, box-shadow 200ms, background 200ms;
}
.jm-entry-tiles { display: flex; gap: 5u; min-height: 46u; align-items: center; }
.jm-etile {
  width: 42u; height: 46u; border-radius: 9u;
  display: flex; align-items: center; justify-content: center;
  font-size: 28u; font-weight: 800; color: var(--ink);
  background: linear-gradient(165deg, #fbf5e6, var(--ivory) 60%, #dcd2b6);
  box-shadow: 0 4u 10u rgba(0, 0, 0, 0.35), 0 1.5u 0 #cbbf9e, inset 0 1px 0 rgba(255, 255, 255, 0.8);
  animation: jm-etile-in 220ms var(--back-out) both;
  transition: background 200ms, color 200ms, box-shadow 200ms;
}
@keyframes jm-etile-in { 0% { transform: translateY(8u) scale(0.7); opacity: 0; } 100% { transform: none; opacity: 1; } }
.jm-entry-placeholder { font-size: 15u; color: var(--ivory-45); letter-spacing: 0.02em; padding: 0 6u; }
.jm-caret { width: 3u; height: 34u; border-radius: 2u; background: var(--ivory); opacity: 0.9; animation: jm-blink 1s steps(2, start) infinite; margin-left: 2u; }
@keyframes jm-blink { 0% { opacity: 0.9; } 100% { opacity: 0; } }
.jm-verdict {
  display: none; align-items: center; gap: 6u;
  font-size: 14u; font-weight: 700; letter-spacing: 0.04em; white-space: nowrap;
  padding: 6u 12u; border-radius: 999u; margin-left: 6u;
  animation: jm-chip-in 320ms var(--back-out) both;
}
.jm-entry.ok .jm-verdict, .jm-entry.bad .jm-verdict, .jm-entry.dup .jm-verdict { display: inline-flex; }
@keyframes jm-chip-in { 0% { transform: scale(0.5) translateX(-6u); opacity: 0; } 100% { transform: none; opacity: 1; } }
.jm-entry.ok { border-color: rgba(126, 212, 145, 0.55); box-shadow: 0 12u 36u rgba(0, 0, 0, 0.4), 0 0 34u rgba(126, 212, 145, 0.3); animation: jm-entry-ok 500ms var(--ease-out); }
.jm-entry.ok .jm-etile { background: linear-gradient(165deg, #d6f5dc, #a9e6b5 60%, #86d197); color: #145a2c; box-shadow: 0 4u 12u rgba(0, 0, 0, 0.3), 0 1.5u 0 #6fb981, inset 0 1px 0 rgba(255, 255, 255, 0.8); }
.jm-entry.ok .jm-verdict { background: var(--good); color: #0c2a15; font-size: 18u; font-weight: 800; padding: 6u 14u; }
@keyframes jm-entry-ok { 0% { background: rgba(126, 212, 145, 0.35); } 100% { background: rgba(9, 13, 19, 0.6); } }
.jm-entry.dup { border-color: rgba(242, 184, 69, 0.5); box-shadow: 0 12u 36u rgba(0, 0, 0, 0.4), 0 0 30u rgba(242, 184, 69, 0.22); }
.jm-entry.dup .jm-etile { background: linear-gradient(165deg, #fdebc4, #f6d58f 60%, #e2b95e); color: #5a3c05; box-shadow: 0 4u 12u rgba(0, 0, 0, 0.3), 0 1.5u 0 #c79c3e, inset 0 1px 0 rgba(255, 255, 255, 0.8); }
.jm-entry.dup .jm-verdict { background: rgba(242, 184, 69, 0.2); color: var(--amber); border: 1px solid rgba(242, 184, 69, 0.4); }
.jm-entry.bad { border-color: rgba(239, 107, 107, 0.55); box-shadow: 0 12u 36u rgba(0, 0, 0, 0.4), 0 0 30u rgba(239, 107, 107, 0.25); animation: jm-shake 420ms var(--ease-out); }
.jm-entry.bad .jm-etile { background: linear-gradient(165deg, #f9d2d2, #f0a8a8 60%, #de8484); color: #6b1414; box-shadow: 0 4u 12u rgba(0, 0, 0, 0.3), 0 1.5u 0 #b96060, inset 0 1px 0 rgba(255, 255, 255, 0.8); }
.jm-entry.bad .jm-verdict { background: rgba(239, 107, 107, 0.18); color: #ff9a9a; border: 1px solid rgba(239, 107, 107, 0.4); }
@keyframes jm-shake {
  0% { transform: translateX(-50%); } 15% { transform: translateX(calc(-50% - 7u)); } 30% { transform: translateX(calc(-50% + 6u)); }
  45% { transform: translateX(calc(-50% - 4u)); } 60% { transform: translateX(calc(-50% + 3u)); } 75% { transform: translateX(calc(-50% - 1u)); } 100% { transform: translateX(-50%); }
}

/* Your words */
.jm-words {
  position: absolute; right: 16u; bottom: 22u; width: 250u;
  max-height: 52%;
  display: flex; flex-direction: column;
  pointer-events: auto;
  background: var(--panel); border: 1px solid var(--ivory-12); border-radius: 16u;
  backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px);
  box-shadow: 0 12u 36u rgba(0, 0, 0, 0.4);
  overflow: hidden;
}
.jm-words-head { display: flex; align-items: baseline; justify-content: space-between; padding: 12u 14u 10u; border-bottom: 1px solid var(--ivory-12); flex: none; }
.jm-words-stats { font-size: 13u; font-weight: 600; color: var(--ivory-70); font-variant-numeric: tabular-nums; }
.jm-words-stats b { color: var(--ivory); font-size: 15u; }
.jm-words-list { flex: 1 1 auto; overflow-y: auto; overscroll-behavior: contain; padding: 6u 8u 8u; scrollbar-width: thin; scrollbar-color: rgba(239, 230, 207, 0.25) transparent; }
.jm-words-list::-webkit-scrollbar { width: 6u; }
.jm-words-list::-webkit-scrollbar-thumb { background: rgba(239, 230, 207, 0.25); border-radius: 3u; }
.jm-words-empty { padding: 14u 8u 10u; font-size: 13u; color: var(--ivory-45); text-align: center; }
.jm-word {
  display: flex; align-items: center; justify-content: space-between; gap: 8u;
  padding: 7u 8u 7u 10u; border-radius: 9u;
  font-size: 17u; font-weight: 700; letter-spacing: 0.06em;
  animation: jm-word-in 380ms var(--back-out) both;
}
.jm-word.new { background: rgba(126, 212, 145, 0.12); animation: jm-word-in 380ms var(--back-out) both, jm-word-glow 1.4s ease-out both; }
@keyframes jm-word-in { 0% { opacity: 0; transform: translateX(28u) scale(0.9); } 100% { opacity: 1; transform: none; } }
@keyframes jm-word-glow { 0% { background: rgba(126, 212, 145, 0.35); } 100% { background: transparent; } }
.jm-pts {
  flex: none; min-width: 30u; padding: 3u 7u; border-radius: 7u; text-align: center;
  font-size: 12u; font-weight: 800; letter-spacing: 0.04em; font-variant-numeric: tabular-nums;
  background: rgba(239, 230, 207, 0.1); color: var(--ivory-70);
}
.jm-pts.p2 { background: rgba(58, 160, 220, 0.22); color: #9dd6f7; }
.jm-pts.p3 { background: rgba(126, 212, 145, 0.22); color: var(--good); }
.jm-pts.p5, .jm-pts.p11 { background: rgba(242, 184, 69, 0.24); color: var(--amber); }

/* Players */
.jm-players {
  position: absolute; left: 16u; top: 16u; width: 220u;
  display: flex; flex-direction: column; gap: 6u;
  padding: 12u 10u 10u;
  background: var(--panel); border: 1px solid var(--ivory-12); border-radius: 16u;
  backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px);
  box-shadow: 0 12u 36u rgba(0, 0, 0, 0.4);
}
.jm-players .jm-label { padding: 0 4u 4u; }
.jm-players { max-height: calc(100% - 120u); overflow-y: auto; scrollbar-width: thin; scrollbar-color: rgba(239, 230, 207, 0.25) transparent; }
.jm-players.dense { gap: 3u; }
.jm-players.dense .jm-pcard { padding: 3u 6u 3u 4u; gap: 8u; }
.jm-players.dense .jm-pcard .jm-avatar { width: 28u; height: 28u; font-size: 12u; }
.jm-players.dense .jm-pcard-name { font-size: 13u; }
.jm-players.dense .jm-pcard-sub { display: none; }
.jm-players.dense .jm-pcount { font-size: 18u; }
/* Thirteen to 32: slim rows, ranked by words found, scrolling inside the panel. */
.jm-players.crowd { gap: 2u; width: 210u; padding: 10u 8u 8u; }
.jm-players.crowd .jm-pcard { padding: 2u 6u 2u 3u; gap: 7u; border-radius: 8u; }
.jm-players.crowd .jm-pcard .jm-avatar { width: 22u; height: 22u; font-size: 10u; box-shadow: none; }
.jm-players.crowd .jm-pcard-name { font-size: 12u; }
.jm-players.crowd .jm-pcard-name .jm-badge { display: none; }
.jm-players.crowd .jm-pcard-sub { display: none; }
.jm-players.crowd .jm-pcount { font-size: 15u; min-width: 24u; }
.jm-pcard {
  display: flex; align-items: center; gap: 10u;
  padding: 6u 8u 6u 6u; border-radius: 12u;
  background: rgba(239, 230, 207, 0.04); border: 1px solid transparent;
  transition: background 200ms, border-color 200ms, opacity 200ms;
}
.jm-pcard .jm-avatar { width: 36u; height: 36u; font-size: 15u; }
.jm-pcard.self { background: rgba(29, 111, 168, 0.18); border-color: rgba(58, 160, 220, 0.35); }
.jm-pcard.offline { opacity: 0.45; }
.jm-pcard-body { flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; gap: 3u; }
.jm-pcard-name { font-size: 14u; font-weight: 700; min-width: 0; display: flex; align-items: center; gap: 6u; }
.jm-pcard-label { flex: 0 1 auto; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.jm-pcard-sub { font-size: 11u; color: var(--ivory-45); letter-spacing: 0.06em; text-transform: uppercase; }
.jm-pcount { flex: none; font-size: 24u; font-weight: 800; font-variant-numeric: tabular-nums; color: var(--ivory); min-width: 30u; text-align: right; }
.jm-pcount.pop { animation: jm-pop 420ms var(--back-out); color: var(--good); }
@keyframes jm-pop { 0% { transform: scale(1.5); } 100% { transform: scale(1); } }

/* Controls hint */
.jm-hint {
  position: absolute; left: 16u; bottom: 22u;
  display: flex; flex-wrap: wrap; align-items: center; gap: 6u 10u; max-width: 330u;
  padding: 10u 12u; border-radius: 12u;
  background: rgba(9, 13, 19, 0.5); border: 1px solid var(--ivory-12);
  font-size: 12u; color: var(--ivory-70); line-height: 1.4;
  transition: opacity 400ms, transform 400ms var(--ease-out);
}
.jm-hint.off { opacity: 0; transform: translateY(10u); }
.jm-hint kbd { font: inherit; font-weight: 700; color: var(--ivory); padding: 1u 6u; border-radius: 5u; border: 1px solid rgba(239, 230, 207, 0.22); background: rgba(239, 230, 207, 0.08); }
.jm-hint .sep { opacity: 0.35; }

/* ---------- results ---------- */
.jm-res {
  position: relative; width: 1040u; max-width: calc(100% - 32u); max-height: calc(100% - 32u);
  display: flex; flex-direction: column; gap: 16u;
  padding: 22u 28u 22u; overflow: auto;
  animation: jm-panel-in 520ms var(--back-out) both;
  scrollbar-width: thin; scrollbar-color: rgba(239, 230, 207, 0.25) transparent;
}
.jm-res-head { display: flex; align-items: baseline; justify-content: space-between; gap: 16u; flex: none; }
.jm-res-title { font-size: 40u; font-weight: 800; letter-spacing: -0.01em; line-height: 1; animation: jm-fade-up 500ms var(--ease-out) both; }
.jm-res-sub { font-size: 14u; color: var(--ivory-45); animation: jm-fade-up 500ms var(--ease-out) 80ms both; }
.jm-res-cols { display: grid; gap: 12u; justify-content: center; flex: none; }
.jm-res-cols.many .jm-res-words { max-height: 132u; }
.jm-res-cols.many .jm-res-top .jm-avatar { width: 36u; height: 36u; font-size: 15u; }
.jm-res-cols.many .jm-res-score b { font-size: 26u; }
.jm-res-col {
  display: flex; flex-direction: column; align-items: stretch; gap: 10u;
  padding: 14u 12u 12u; border-radius: 16u; min-width: 0;
  background: rgba(239, 230, 207, 0.045); border: 1px solid rgba(239, 230, 207, 0.1);
  animation: jm-res-col 520ms var(--back-out) both;
  position: relative;
}
.jm-res-col.winner { background: linear-gradient(180deg, rgba(242, 184, 69, 0.14), rgba(242, 184, 69, 0.04)); border-color: rgba(242, 184, 69, 0.45); box-shadow: 0 0 40u rgba(242, 184, 69, 0.18), inset 0 0 0 1px rgba(242, 184, 69, 0.15); }
.jm-res-col.self { box-shadow: inset 0 0 0 1.5u rgba(58, 160, 220, 0.5); }
.jm-res-col.winner.self { box-shadow: 0 0 40u rgba(242, 184, 69, 0.18), inset 0 0 0 1.5u rgba(58, 160, 220, 0.5); }
@keyframes jm-res-col { 0% { opacity: 0; transform: translateY(24u) scale(0.96); } 100% { opacity: 1; transform: none; } }
.jm-res-top { display: flex; align-items: center; gap: 10u; }
.jm-res-top .jm-avatar { width: 44u; height: 44u; font-size: 18u; position: relative; overflow: visible; }
.jm-res-top .jm-avatar img { border-radius: 50%; }
.jm-crown { position: absolute; top: -18u; left: 50%; transform: translateX(-50%) rotate(-8deg); width: 30u; height: 22u; filter: drop-shadow(0 2u 6u rgba(0, 0, 0, 0.5)); animation: jm-crown 700ms var(--back-out) both; }
@keyframes jm-crown { 0% { opacity: 0; transform: translateX(-50%) translateY(-14u) rotate(-30deg) scale(0.4); } 100% { opacity: 1; transform: translateX(-50%) rotate(-8deg) scale(1); } }
.jm-res-who { flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; gap: 3u; }
.jm-res-name { font-size: 16u; font-weight: 700; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; display: flex; gap: 6u; align-items: center; }
.jm-res-rank { display: flex; align-items: center; gap: 6u; font-size: 11u; letter-spacing: 0.12em; text-transform: uppercase; color: var(--ivory-45); font-weight: 700; }
.jm-medal { width: 18u; height: 18u; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 10u; font-weight: 800; color: #1a1408; }
.jm-medal.r1 { background: linear-gradient(160deg, #ffe38a, #e0a92e); box-shadow: 0 0 10u rgba(242, 184, 69, 0.5); }
.jm-medal.r2 { background: linear-gradient(160deg, #f1f1f1, #a9adb6); }
.jm-medal.r3 { background: linear-gradient(160deg, #e6a877, #a86a3a); }
.jm-medal.r4 { background: rgba(239, 230, 207, 0.2); color: var(--ivory); }
.jm-res-score { display: flex; flex-direction: column; align-items: flex-end; line-height: 1; flex: none; }
.jm-res-score b { font-size: 34u; font-weight: 800; font-variant-numeric: tabular-nums; letter-spacing: -0.02em; }
.jm-res-score span { font-size: 10u; letter-spacing: 0.14em; text-transform: uppercase; color: var(--ivory-45); font-weight: 700; margin-top: 3u; }
.jm-res-col.winner .jm-res-score b { color: #ffd97a; text-shadow: 0 0 18u rgba(242, 184, 69, 0.5); }
.jm-res-words { display: flex; flex-direction: column; gap: 2u; max-height: 224u; overflow-y: auto; padding-right: 4u; scrollbar-width: thin; scrollbar-color: rgba(239, 230, 207, 0.25) transparent; }
.jm-res-words.scroll { mask-image: linear-gradient(to bottom, #000 calc(100% - 28u), transparent); -webkit-mask-image: linear-gradient(to bottom, #000 calc(100% - 28u), transparent); padding-bottom: 20u; }
.jm-res-words::-webkit-scrollbar { width: 5u; }
.jm-res-words::-webkit-scrollbar-thumb { background: rgba(239, 230, 207, 0.25); border-radius: 3u; }
.jm-rw {
  display: flex; align-items: center; justify-content: space-between; gap: 8u;
  padding: 5u 8u; border-radius: 7u; font-size: 14u; font-weight: 700; letter-spacing: 0.05em;
  animation: jm-rw-in 360ms var(--ease-out) both;
}
@keyframes jm-rw-in { 0% { opacity: 0; transform: translateX(-10u); } 100% { opacity: 1; transform: none; } }
.jm-rw.x { color: var(--ivory-45); font-weight: 500; }
.jm-rw.x .w { text-decoration: line-through; text-decoration-color: rgba(239, 107, 107, 0.7); text-decoration-thickness: 1.5u; }
.jm-rw .x-mark { color: rgba(239, 107, 107, 0.75); font-size: 13u; font-weight: 700; }
.jm-rw .jm-pts { font-size: 11u; }
.jm-res-none { font-size: 13u; color: var(--ivory-45); padding: 6u 8u; font-style: italic; animation: jm-rw-in 360ms var(--ease-out) both; }
/* Five or more players: ranked leaderboard beside one player's words */
.jm-res-board { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 360u); gap: 14u; flex: none; align-items: start; }
.jm-res-list {
  display: flex; flex-direction: column; gap: 3u; max-height: 372u; overflow-y: auto; overscroll-behavior: contain; padding: 2u 6u 2u 2u;
  scrollbar-width: thin; scrollbar-color: rgba(239, 230, 207, 0.25) transparent;
}
.jm-res-list.scroll { mask-image: linear-gradient(to bottom, #000 calc(100% - 28u), transparent); -webkit-mask-image: linear-gradient(to bottom, #000 calc(100% - 28u), transparent); padding-bottom: 22u; }
.jm-lb-row {
  pointer-events: auto; cursor: pointer; text-align: left; flex: none;
  display: grid; grid-template-columns: 22u 30u minmax(0, 1fr) auto 46u; align-items: center; gap: 10u;
  padding: 5u 12u 5u 8u; border-radius: 10u;
  background: rgba(239, 230, 207, 0.04); border: 1px solid transparent;
  transition: background 160ms, border-color 160ms;
  animation: jm-rw-in 360ms var(--ease-out) both;
}
.jm-lb-row:hover { background: rgba(239, 230, 207, 0.09); }
.jm-lb-row.sel { background: rgba(239, 230, 207, 0.1); border-color: rgba(239, 230, 207, 0.3); }
.jm-lb-row.self { box-shadow: inset 0 0 0 1.5u rgba(58, 160, 220, 0.5); }
.jm-lb-row.winner { background: linear-gradient(90deg, rgba(242, 184, 69, 0.16), rgba(242, 184, 69, 0.03)); }
.jm-lb-row .jm-medal { width: 22u; height: 22u; font-size: 11u; }
.jm-lb-row .jm-avatar { width: 30u; height: 30u; font-size: 13u; box-shadow: none; }
.jm-lb-name { display: flex; align-items: center; gap: 6u; min-width: 0; font-size: 15u; font-weight: 700; }
.jm-lb-label { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.jm-lb-words { font-size: 12u; color: var(--ivory-45); font-weight: 600; white-space: nowrap; }
.jm-lb-score { font-size: 20u; font-weight: 800; text-align: right; }
.jm-lb-row.winner .jm-lb-score { color: #ffd97a; }
.jm-res-detail .jm-res-words { max-height: 268u; }
.jm-missed { display: flex; flex-direction: column; gap: 8u; flex: none; animation: jm-fade-up 500ms var(--ease-out) both; }
.jm-chips { display: flex; flex-wrap: wrap; gap: 6u; }
.jm-chip {
  padding: 5u 10u; border-radius: 999u; font-size: 13u; font-weight: 600; letter-spacing: 0.06em;
  color: var(--ivory-70); background: rgba(239, 230, 207, 0.06); border: 1px solid rgba(239, 230, 207, 0.12);
  animation: jm-chip-in 300ms var(--back-out) both;
}
.jm-res-actions { display: flex; justify-content: center; gap: 12u; flex: none; padding-top: 4u; animation: jm-fade-up 500ms var(--ease-out) both; }

/* ---------- toast ---------- */
.jm-toast {
  position: absolute; top: 84u; left: 50%;
  transform: translate(-50%, -20u); opacity: 0;
  display: flex; align-items: center; gap: 10u;
  padding: 10u 18u; border-radius: 12u; max-width: 70%;
  background: var(--panel-2); border: 1px solid var(--ivory-45); border-left-width: 4u;
  font-size: 15u; font-weight: 600; color: var(--ivory);
  box-shadow: 0 12u 36u rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px);
  transition: opacity 220ms var(--ease-out), transform 320ms var(--back-out);
  pointer-events: none;
}
.jm-toast.on { opacity: 1; transform: translate(-50%, 0); }
.jm-toast.warn { border-color: var(--amber); }
.jm-toast.good { border-color: var(--good); }
.jm-toast.info { border-color: var(--ivory-70); }

/* ---------- portrait ----------
   Toggled by the game from the viewport (aspect < 1). One u grows to a 480-wide
   reference so type and targets read on a phone; the width-based --rx-hud-scale
   would leave everything at a third of its desktop size. The 3D camera re-frames the
   tray to the width and the hourglass sits behind it, so the HUD stacks vertically:
   timer (and players) on top, entry line and word list below the tray. */
.jm.portrait {
  --u: min(calc(var(--jm-vw, 100vw) / 480), calc(var(--jm-vh, 100vh) / 960));
}

/* Title */
.jm.portrait .jm-title-inner { width: 100%; padding: 0 16u; }
.jm.portrait .jm-wordmark { gap: 7u; margin-bottom: 20u; }
.jm.portrait .jm-tile { width: 52u; height: 52u; border-radius: 11u; font-size: 33u; }
.jm.portrait .jm-tile .ul::after { bottom: -3u; height: 3u; }
.jm.portrait .jm-tagline { font-size: 15u; letter-spacing: 0.3em; margin-bottom: 30u; }
.jm.portrait .jm-title-row { flex-direction: column; gap: 10u; }
.jm.portrait .jm-title-row .jm-btn { width: 250u; }
.jm.portrait .jm-mp-note { text-align: center; padding: 0 12u; }
.jm.portrait .jm-howto { font-size: 14u; line-height: 1.6; padding: 0 22u; bottom: 22u; }

/* Lobby */
.jm.portrait .jm-lobby-panel, .jm.portrait .jm-lobby-panel.wide { width: calc(100% - 24u); max-height: calc(100% - 24u); padding: 18u 16u 20u; }
.jm.portrait .jm-seats { gap: 8u; }
.jm.portrait .jm-seat, .jm.portrait .jm-seats.many .jm-seat { width: calc(33.333% - 6u); min-height: 112u; padding: 12u 6u 10u; }
.jm.portrait .jm-seat-name { font-size: 14u; }
.jm.portrait .jm-lobby-foot { flex-wrap: wrap; justify-content: center; }

/* Burst */
.jm.portrait .jm-burst { font-size: 80u; margin-top: -44u; }
.jm.portrait .jm-burst.small { font-size: 30u; margin-top: -18u; }

/* Timer */
.jm.portrait .jm-timer { top: 12u; gap: 10u; padding: 5u 18u 5u 12u; }
.jm.portrait .jm-timer svg { width: 34u; height: 46u; }
.jm.portrait .jm-digits { font-size: 44u; }

/* Players: a grid strip under the timer, kept above the 3D hourglass.
   Up to six players show name + count in three columns; a crowded room drops
   the names and shows avatar + count in six columns, so two rows always fit. */
.jm.portrait .jm-players {
  left: 12u; right: 12u; top: 82u; width: auto; max-height: 118u;
  padding: 8u; gap: 0;
}
.jm.portrait .jm-players .jm-label { display: none; }
.jm.portrait .jm-players-list { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 5u; }
.jm.portrait .jm-pcard, .jm.portrait .jm-players.dense .jm-pcard { padding: 4u 7u 4u 4u; gap: 6u; border-radius: 10u; }
.jm.portrait .jm-pcard .jm-avatar, .jm.portrait .jm-players.dense .jm-pcard .jm-avatar { width: 30u; height: 30u; font-size: 13u; }
.jm.portrait .jm-pcard-name, .jm.portrait .jm-players.dense .jm-pcard-name { font-size: 13u; }
.jm.portrait .jm-pcard-name .jm-badge { display: none; }
.jm.portrait .jm-pcard-sub { display: none; }
.jm.portrait .jm-pcount, .jm.portrait .jm-players.dense .jm-pcount { font-size: 20u; min-width: 22u; }
.jm.portrait .jm-players.dense .jm-players-list { grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 4u; }
.jm.portrait .jm-players.dense .jm-pcard { padding: 4u 5u 4u 4u; justify-content: space-between; }
.jm.portrait .jm-players.dense .jm-pcard-body { display: none; }
.jm.portrait .jm-players.dense .jm-pcount { font-size: 17u; min-width: 0; }

/* Entry line: full width along the bottom */
.jm.portrait .jm-entry {
  left: 12u; right: 12u; bottom: 14u; transform: none;
  min-width: 0; min-height: 60u; padding: 7u 12u; justify-content: center; flex-wrap: wrap;
}
.jm.portrait .jm-entry-tiles { flex-wrap: wrap; justify-content: center; min-height: 40u; }
.jm.portrait .jm-etile { width: 34u; height: 40u; border-radius: 8u; font-size: 23u; }
.jm.portrait .jm-caret { height: 28u; }
.jm.portrait .jm-entry-placeholder { font-size: 14u; }
.jm.portrait .jm-entry.bad { animation-name: jm-shake-p; }
@keyframes jm-shake-p {
  0% { transform: none; } 15% { transform: translateX(-7u); } 30% { transform: translateX(6u); }
  45% { transform: translateX(-4u); } 60% { transform: translateX(3u); } 75% { transform: translateX(-1u); } 100% { transform: none; }
}

/* Your words: a two-column panel between the tray and the entry line */
.jm.portrait .jm-words { left: 12u; right: 12u; width: auto; bottom: 88u; max-height: 20%; }
.jm.portrait .jm-words-head { padding: 9u 12u 8u; }
.jm.portrait .jm-words-list { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 2u 6u; align-content: start; padding: 5u 6u 6u; }
.jm.portrait .jm-words-empty { grid-column: 1 / -1; padding: 10u 8u 8u; }
.jm.portrait .jm-word { font-size: 15u; padding: 5u 6u 5u 8u; min-width: 0; }
.jm.portrait .jm-word > span:first-child { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

/* Keyboard hints are a desktop affordance */
.jm.portrait .jm-hint { display: none; }

/* Results: one column of players (two when crowded) */
.jm.portrait .jm-res { width: calc(100% - 24u); max-height: calc(100% - 24u); padding: 18u 14u 18u; gap: 12u; }
.jm.portrait .jm-res-head { flex-direction: column; align-items: flex-start; gap: 4u; }
.jm.portrait .jm-res-title { font-size: 32u; }
.jm.portrait .jm-res-cols { grid-template-columns: minmax(0, 1fr) !important; gap: 10u; }
.jm.portrait .jm-res-cols.many { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
.jm.portrait .jm-res-words { max-height: 130u; }
.jm.portrait .jm-res-cols.many .jm-res-words { max-height: 96u; }
.jm.portrait .jm-res-actions { flex-wrap: wrap; }

/* Leaderboard stacks over the selected player's words */
.jm.portrait .jm-res-board { grid-template-columns: minmax(0, 1fr); }
.jm.portrait .jm-res-list { max-height: 240u; }
.jm.portrait .jm-lb-row { grid-template-columns: 22u 28u minmax(0, 1fr) 40u; }
.jm.portrait .jm-lb-words { display: none; }
.jm.portrait .jm-choice-row { flex-direction: column; }
.jm.portrait .jm-choice { width: 300u; }
.jm.portrait .jm-seats.crowd { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.jm.portrait .jm-seats.crowd .jm-seat { width: auto; min-height: 0; padding: 6u 8u 6u 6u; }

/* Toast */
.jm.portrait .jm-toast { top: 84u; max-width: calc(100% - 32u); }

@media (prefers-reduced-motion: reduce) {
  .jm *, .jm *::before, .jm *::after { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; }
}
`;
function Rn(e) {
  return e.replace(/(?<![\w.#-])(-?\d*\.?\d+)u\b/g, "calc($1 * var(--u))");
}
function vr(e = document) {
  if (e.getElementById(wr)) return;
  let t = e.createElement("style");
  t.id = wr, t.textContent = Rn(Tn), e.head.appendChild(t);
}
function zt(e) {
  let t = document.createElement("template");
  return t.innerHTML = e.trim(), t.content.firstElementChild;
}
var Qt = (e, t = "") => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${t}>${e}</svg>`,
  Ht = {
    copy: () => zt(Qt('<rect x="9" y="9" width="11" height="11" rx="2.5"/><path d="M5 15V6a2 2 0 0 1 2-2h9"/>')),
    invite: () => zt(Qt('<circle cx="10" cy="8" r="3.5"/><path d="M3.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6"/><path d="M19 8v6M16 11h6"/>')),
    leave: () => zt(Qt('<path d="M10 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4"/><path d="M15 16l4-4-4-4M19 12H9"/>')),
    play: () => zt(Qt('<path d="M7 5.5v13l11-6.5z" fill="currentColor" stroke="none"/>')),
    again: () => zt(Qt('<path d="M4 12a8 8 0 0 1 13.7-5.7L20 8.5"/><path d="M20 4v4.5h-4.5"/><path d="M20 12a8 8 0 0 1-13.7 5.7L4 15.5"/><path d="M4 20v-4.5h4.5"/>')),
    back: () => zt(Qt('<path d="M11 6l-6 6 6 6M5 12h14"/>')),
    check: () => zt(Qt('<path d="M5 12.5l4.5 4.5L19 7"/>')),
    info: () => zt(Qt('<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>')),
    lock: () => zt(Qt('<rect x="5" y="10.5" width="14" height="10" rx="2.5"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/>')),
    globe: () => zt(Qt('<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.6 2.8 3.8 5.8 3.8 9s-1.2 6.2-3.8 9c-2.6-2.8-3.8-5.8-3.8-9s1.2-6.2 3.8-9z"/>')),
    crown: () => zt(`<svg viewBox="0 0 30 22" aria-hidden="true">
      <path d="M3 18 L2 6 L9 11 L15 3 L21 11 L28 6 L27 18 Z" fill="#f2c14e" stroke="#c88b12" stroke-width="1.2" stroke-linejoin="round"/>
      <rect x="3" y="17" width="24" height="3.5" rx="1" fill="#e0a92e" stroke="#c88b12" stroke-width="0.8"/>
      <circle cx="15" cy="3" r="1.7" fill="#fff0c2"/><circle cx="2.3" cy="6" r="1.4" fill="#fff0c2"/><circle cx="27.7" cy="6" r="1.4" fill="#fff0c2"/>
      <circle cx="10" cy="14" r="1.3" fill="#3aa0dc"/><circle cx="15" cy="13" r="1.3" fill="#ef6b6b"/><circle cx="20" cy="14" r="1.3" fill="#3aa0dc"/>
    </svg>`)
  };
function xr() {
  let e = "jmhg" + Math.random().toString(36).slice(2, 8),
    t = 8,
    o = 30,
    r = 52,
    n = o - t,
    a = zt(`
    <svg viewBox="0 0 44 60" aria-hidden="true">
      <defs>
        <clipPath id="${e}-top"><path d="M9 ${t} H35 V15 Q35 24 24 ${o} H20 Q9 24 9 15 Z"/></clipPath>
        <clipPath id="${e}-bot"><path d="M20 ${o} H24 Q35 36 35 45 V${r} H9 V45 Q9 36 20 ${o} Z"/></clipPath>
        <linearGradient id="${e}-cap" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#3f8fd0"/><stop offset="0.5" stop-color="#1857a6"/><stop offset="1" stop-color="#103d78"/>
        </linearGradient>
        <linearGradient id="${e}-glass" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stop-color="rgba(255,255,255,0.05)"/><stop offset="0.35" stop-color="rgba(255,255,255,0.16)"/><stop offset="1" stop-color="rgba(255,255,255,0.03)"/>
        </linearGradient>
      </defs>
      <line x1="7" y1="${t}" x2="7" y2="${r}" stroke="#1857a6" stroke-width="1.6" opacity="0.8"/>
      <line x1="37" y1="${t}" x2="37" y2="${r}" stroke="#1857a6" stroke-width="1.6" opacity="0.8"/>
      <path d="M9 ${t} H35 V15 Q35 24 24 ${o} Q35 36 35 45 V${r} H9 V45 Q9 36 20 ${o} Q9 24 9 15 Z" fill="url(#${e}-glass)"/>
      <rect class="hg-top" x="9" y="${t}" width="26" height="${n}" fill="#e8d9b0" clip-path="url(#${e}-top)"/>
      <path class="hg-bot" d="M9 ${r} V${r} Q22 ${r} 35 ${r} V${r} Z" fill="#e8d9b0" clip-path="url(#${e}-bot)"/>
      <line class="jm-hg-stream" x1="22" y1="${o}" x2="22" y2="${r - 1}" stroke="#e8d9b0" stroke-width="1.4" stroke-linecap="round"/>
      <path d="M9 ${t} H35 V15 Q35 24 24 ${o} Q35 36 35 45 V${r} H9 V45 Q9 36 20 ${o} Q9 24 9 15 Z" fill="none" stroke="rgba(239,230,207,0.6)" stroke-width="1.4" stroke-linejoin="round"/>
      <rect x="3" y="2" width="38" height="7" rx="2.5" fill="url(#${e}-cap)"/>
      <rect x="3" y="51" width="38" height="7" rx="2.5" fill="url(#${e}-cap)"/>
      <rect x="5" y="3" width="34" height="1.5" rx="0.75" fill="rgba(255,255,255,0.35)"/>
    </svg>`),
    d = a.querySelector(".hg-top"),
    c = a.querySelector(".hg-bot"),
    l = a.querySelector(".jm-hg-stream"),
    E = -1,
    x = m => {
      let R = Math.min(1, Math.max(0, m)),
        T = Math.round(R * 200) / 200;
      if (T === E) return;
      E = T;
      let F = t + n * T;
      d.setAttribute("y", F.toFixed(2)), d.setAttribute("height", Math.max(0, o - F).toFixed(2));
      let j = n * T,
        S = r - j * 0.85,
        w = r - j - 3 * Math.sin(T * Math.PI);
      c.setAttribute("d", `M9 ${r} V${S.toFixed(2)} Q22 ${w.toFixed(2)} 35 ${S.toFixed(2)} V${r} Z`), l.setAttribute("y2", Math.max(o + 1, w - 0.5).toFixed(2)), l.style.visibility = T >= 1 ? "hidden" : "";
    };
  return x(0), {
    el: a,
    set: x
  };
}
function v(e, t, ...o) {
  let r = document.createElement(e);
  t && (r.className = t);
  for (let n of o) n && r.append(n);
  return r;
}
function Y(e, t) {
  let o = v("span", e);
  return o.textContent = t, o;
}
function qt(e, t, o, r) {
  let n = v("button", "jm-btn " + t);
  return n.type = "button", r && n.append(r), n.append(e), n.addEventListener("click", a => {
    a.preventDefault(), o();
  }), n;
}
function Xt(e) {
  for (; e.firstChild;) e.removeChild(e.firstChild);
}
function jr(e) {
  return (e.trim()[0] ?? "?").toUpperCase();
}
function Ae(e) {
  let t = v("div", "jm-avatar" + (e ? "" : " empty"));
  if (!e) return t;
  if (e.avatar) {
    let o = new Image();
    o.alt = "", o.src = e.avatar, o.onerror = () => {
      o.remove(), t.textContent = jr(e.name);
    }, t.append(o);
  } else t.textContent = jr(e.name);
  return t;
}
function Tr(e) {
  return Y("jm-pts p" + e, `+${e}`);
}
var Rr = {
    ok: "",
    "too-short": "too short",
    "not-on-board": "not on the board",
    "not-a-word": "not a word",
    "already-found": "already found"
  },
  Mn = new Set(["countdown", "shaking", "playing", "tally"]);
function kn(e) {
  let t = e % 100;
  if (t >= 11 && t <= 13) return `${e}th`;
  let o = e % 10 === 1 ? "st" : e % 10 === 2 ? "nd" : e % 10 === 3 ? "rd" : "th";
  return `${e}${o}`;
}
function Mr(e, t) {
  vr(), e.style.display = "none";
  let o = e.parentElement ?? document.body,
    r = v("div", "jm");
  o.appendChild(r);
  let n = v("div", "jm-screen jm-title", v("div", "jm-scrim")),
    a = v("div", "jm-wordmark"),
    d = [-4, 3, -2, 4, -3, 2];
  [..."JAMBLE"].forEach((s, p) => {
    let b = v("div", "jm-tile" + (s === "J" ? " accent" : ""), Y(s === "M" ? "ul" : "", s));
    b.style.setProperty("--i", String(p)), b.style.setProperty("--tilt", `${d[p]}deg`), a.append(b);
  });
  let c = v("div", "jm-tagline");
  c.append("Shake. ", v("b", "", "Spot."), " Spell.");
  let l = qt("Play Solo", "cta big", () => t.onSolo(), Ht.play()),
    S = v("div", "jm-title-row", l);
  let V = v("div", "jm-howto");
  V.append("Find words of 3+ letters from touching cubes  \xB7  type or drag  \xB7  ", v("kbd", "", "\u2190"), " / ", v("kbd", "", "\u2192"), " or drag the table to rotate the tray"), n.append(v("div", "jm-title-inner", a, c, v("div", "jm-title-actions", S)), V);
  let ht = v("div", "jm-hud"),
    B = xr(),
    at = v("div", "jm-digits num", "3:00"),
    mt = v("div", "jm-timer", B.el, at),
    ft = v("div", "jm-entry-tiles"),
    vt = Y("jm-entry-placeholder", "Type or drag across the cubes"),
    kt = v("span", "jm-caret"),
    xt = v("span", "jm-verdict"),
    dt = v("div", "jm-entry", ft, vt, kt, xt),
    Pt = v("div", "jm-words-stats"),
    wt = v("div", "jm-words-list"),
    Kt = v("div", "jm-words", v("div", "jm-words-head", Y("jm-label", "Your words"), Pt), wt),
    Vt = v("div", "jm-players-list"),
    Gt = Y("jm-label", "Players"),
    Et = v("div", "jm-players", Gt, Vt),
    ot = v("div", "jm-hint");
  ot.append(Y("", "Type a word"), Y("sep", "\xB7"), v("kbd", "", "Enter"), Y("", "to submit"), Y("sep", "\xB7"), Y("", "Drag across cubes"), Y("sep", "\xB7"), v("kbd", "", "\u2190"), v("kbd", "", "\u2192"), Y("", "rotate"));
  let yt = v("div", "jm-burst");
  ht.append(mt, dt, Kt, Et, ot);
  let Lt = v("div", "jm-screen jm-results", v("div", "jm-scrim")),
    L = v("div", "jm-panel jm-res");
  Lt.append(L);
  let U = v("div", "jm-toast");
  r.append(n, ht, yt, Lt, U);
  let Z = null,
    it = 0,
    gt = !1,
    Bt = -1,
    jt = "",
    Nt = !1,
    Ft = new Set(),
    Wt = new Map(),
    rt = null,
    Tt = (s, p) => s.classList.toggle("on", p);
  function Rt(s, p, b = !1) {
    yt.className = "jm-burst" + (p ? " small" : ""), yt.textContent = s, yt.offsetWidth, yt.classList.add("go"), b && yt.classList.add("long");
  }
  function xe(s) {
    let p = new Set(),
      b = s.length > 12,
      $ = b ? [...s].sort((y, C) => Number(C.isSelf) - Number(y.isSelf) || C.wordCount - y.wordCount || y.seat - C.seat) : [...s].sort((y, C) => y.seat - C.seat);
    Et.classList.toggle("crowd", b), Gt.textContent = s.length > 4 ? `Players \xB7 ${s.length}` : "Players";
    for (let y of $) {
      p.add(y.id);
      let C = Wt.get(y.id);
      if (!C) {
        let bt = Ae(y),
          st = v("div", "jm-pcard-name"),
          q = v("div", "jm-pcard-sub"),
          ct = v("div", "jm-pcount num");
        C = {
          card: v("div", "jm-pcard", bt, v("div", "jm-pcard-body", st, q), ct),
          count: ct,
          last: -1,
          name: st,
          avatarEl: bt,
          sub: q,
          look: `${y.name}
${y.avatar ?? ""}`
        }, Wt.set(y.id, C);
      }
      let J = `${y.name}
${y.avatar ?? ""}`;
      if (C.look !== J) {
        C.look = J;
        let bt = Ae(y);
        C.avatarEl.replaceWith(bt), C.avatarEl = bt;
      }
      C.card.className = "jm-pcard" + (y.isSelf ? " self" : "") + (y.connected ? "" : " offline"), Xt(C.name), C.name.append(Y("jm-pcard-label", y.name)), y.isHost && C.name.append(Y("jm-badge host", "Host")), C.sub.textContent = y.connected ? y.isSelf ? "you" : y.wordCount === 1 ? "1 word" : `${y.wordCount} words` : "reconnecting\u2026", y.wordCount !== C.last && (C.count.textContent = String(y.wordCount), C.last >= 0 && y.wordCount > C.last && (C.count.classList.remove("pop"), C.count.offsetWidth, C.count.classList.add("pop")), C.last = y.wordCount), Vt.append(C.card);
    }
    for (let [y, C] of Wt) p.has(y) || (C.card.remove(), Wt.delete(y));
  }
  function re(s, p, b) {
    dt.classList.remove("ok", "bad", "dup"), Xt(ft);
    let $ = [...s.toUpperCase()];
    for (let y of $) ft.append(v("div", "jm-etile", y));
    vt.hidden = $.length > 0, kt.hidden = p != null && $.length > 0, Xt(xt), p && (dt.offsetWidth, p === "ok" ? (dt.classList.add("ok"), xt.textContent = b > 0 ? `+${b}` : "nice") : p === "already-found" ? (dt.classList.add("dup"), xt.textContent = Rr[p]) : (dt.classList.add("bad"), xt.textContent = Rr[p]));
  }
  function oo(s, p) {
    if (p && rt && rt.word === s.toUpperCase() && rt.verdict === p && performance.now() - rt.at < 250) return;
    let b = p === "ok" ? ro(s) : 0;
    re(s, p, b), p && (rt = {
      word: s.toUpperCase(),
      verdict: p,
      at: performance.now()
    });
  }
  let Ee = [];
  function ro(s) {
    let p = s.toUpperCase();
    for (let b = Ee.length - 1; b >= 0; b--) if (Ee[b].word === p) return Ee[b].points;
    return 0;
  }
  function no(s) {
    Ee = s;
    let p = s.reduce((C, J) => C + J.points, 0);
    Xt(Pt), Pt.append(v("b", "num", String(s.length)), ` ${s.length === 1 ? "word" : "words"} \xB7 `, v("b", "num", String(p)), ` ${p === 1 ? "pt" : "pts"}`);
    let b = new Set(s.map(C => C.word));
    if ((s.length === 0 || [...Ft].some(C => !b.has(C))) && (Xt(wt), Ft.clear()), s.length === 0) {
      wt.append(Y("jm-words-empty", "Your found words will appear here"));
      return;
    }
    let $ = wt.querySelector(".jm-words-empty");
    $ && $.remove();
    let y = s.filter(C => !Ft.has(C.word));
    for (let C of y) {
      Ft.add(C.word);
      let J = v("div", "jm-word new", Y("", C.word), Tr(C.points));
      wt.prepend(J), window.setTimeout(() => J.classList.remove("new"), 1500);
    }
    y.length && (wt.scrollTop = 0, Nt || (Nt = !0, ot.classList.add("off")));
  }
  function ao(s) {
    let p = Math.max(0, Math.ceil(s - 1e-6)),
      b = Math.floor(p / 60),
      $ = p % 60;
    return `${b}:${String($).padStart(2, "0")}`;
  }
  function u(s, p, b) {
    let $ = p > 0 ? 1 - s / p : 1;
    B.set($), at.textContent = ao(s), mt.classList.toggle("running", b && s > 0), mt.classList.toggle("warn", b && s <= 30 && s > 10), mt.classList.toggle("urgent", b && s <= 10 && s > 0), mt.classList.toggle("done", s <= 0), b && !gt && (mt.classList.remove("flip"), mt.offsetWidth, mt.classList.add("flip")), gt = b;
    let y = Math.ceil(s - 1e-6);
    y !== Bt && (Bt = y, b && y <= 10 && y > 0 && (at.classList.remove("tick"), at.offsetWidth, at.classList.add("tick")));
  }
  function M(s) {
    Xt(L);
    let p = (q, ct) => (q.style.animationDelay = `${Math.round(ct)}ms`, q),
      b = s.players.find(q => q.id === s.selfId),
      $ = s.winnerIds.includes(s.selfId),
      y = s.players.length > 1 ? $ ? s.winnerIds.length > 1 ? "You tied for the win" : "You win!" : `${b ? `You scored ${b.score} ${b.score === 1 ? "point" : "points"}` : "Round over"}` : `${b?.score ?? 0} ${b?.score === 1 ? "point" : "points"} from ${b?.words.length ?? 0} ${b?.words.length === 1 ? "word" : "words"}`;
    L.append(v("div", "jm-res-head", v("div", "jm-res-title", "Time's up!"), Y("jm-res-sub", y)));
    let C = [...s.players].sort((q, ct) => q.rank - ct.rank || ct.score - q.score).slice(0, 32);
    if (C.length <= 4) {
      let q = v("div", "jm-res-cols"),
        ct = Math.max(1, C.length);
      ct === 1 ? q.style.gridTemplateColumns = "minmax(0, calc(420 * var(--u)))" : ct === 2 ? q.style.gridTemplateColumns = "repeat(2, minmax(0, calc(360 * var(--u))))" : q.style.gridTemplateColumns = `repeat(${ct}, minmax(0, 1fr))`, C.forEach((St, ut) => q.append(f(St, s, ut, p))), L.append(q);
    } else L.append(i(C, s, p));
    let J = [...new Set(s.missed)].sort((q, ct) => ct.length - q.length || q.localeCompare(ct)).slice(0, 24);
    if (J.length) {
      let q = v("div", "jm-chips");
      J.forEach((St, ut) => q.append(p(Y("jm-chip", St), 760 + ut * 25)));
      let ct = v("div", "jm-missed", Y("jm-label", s.players.length > 1 ? "Words everyone missed" : "Words you missed"), q);
      L.append(p(ct, 700));
    }
    let bt = v("div", "jm-res-actions");
    bt.append(qt("Play again", "cta big", () => t.onPlayAgain(), Ht.again())), L.append(p(bt, 1e3));
  }
  function i(s, p, b) {
    let $ = v("div", "jm-res-list"),
      y = v("div", "jm-res-detail"),
      C = new Map(),
      J = (st, q) => {
        for (let [St, ut] of C) ut.classList.toggle("sel", St === st.id);
        Xt(y);
        let ct = f(st, p, 0, q ? b : St => (St.style.animation = "none", St));
        y.append(ct);
      };
    s.forEach((st, q) => {
      let ct = p.winnerIds.includes(st.id),
        St = st.words.filter(It => !It.cancelled).length,
        ut = v("span", "jm-lb-name", Y("jm-lb-label", st.name));
      st.id === p.selfId && ut.append(Y("jm-badge you", "You"));
      let _t = v("button", "jm-lb-row" + (ct ? " winner" : "") + (st.id === p.selfId ? " self" : ""), Y("jm-medal r" + Math.min(4, Math.max(1, st.rank)), String(st.rank)), Ae(st), ut, Y("jm-lb-words num", `${St} ${St === 1 ? "word" : "words"}`), v("b", "jm-lb-score num", String(st.score)));
      _t.type = "button", _t.addEventListener("click", It => {
        It.preventDefault(), J(st, !1);
      }), C.set(st.id, _t), $.append(b(_t, 120 + Math.min(q, 12) * 35));
    });
    let bt = v("div", "jm-res-board", $, y);
    return J(s.find(st => st.id === p.selfId) ?? s[0], !0), window.requestAnimationFrame(() => $.classList.toggle("scroll", $.scrollHeight > $.clientHeight + 1)), bt;
  }
  function f(s, p, b, $) {
    let y = p.winnerIds.includes(s.id),
      C = v("div", "jm-res-col" + (y ? " winner" : "") + (s.id === p.selfId ? " self" : ""));
    $(C, 120 + b * 90);
    let J = y ? Ht.crown() : null;
    J && (J.classList.add("jm-crown"), J.style.animationDelay = `${360 + b * 90}ms`);
    let bt = Ae(s);
    J && bt.append(J);
    let st = Math.max(1, s.rank),
      q = v("div", "jm-res-name", Y("", s.name));
    s.id === p.selfId && q.append(Y("jm-badge you", "You"));
    let ct = v("div", "jm-res-who", q, v("div", "jm-res-rank", Y("jm-medal r" + Math.min(4, st), String(st)), Y("", kn(st) + (y && p.winnerIds.length > 1 ? " \xB7 tie" : "")))),
      St = v("div", "jm-res-score", v("b", "num", String(s.score)), Y("", s.score === 1 ? "point" : "points"));
    C.append(v("div", "jm-res-top", bt, ct, St));
    let ut = v("div", "jm-res-words"),
      _t = [...s.words].sort((It, Zt) => Number(It.cancelled) - Number(Zt.cancelled) || Zt.points - It.points || It.word.localeCompare(Zt.word));
    return _t.length || ut.append($(Y("jm-res-none", "No words"), 300 + b * 90)), _t.forEach((It, Zt) => {
      let je = v("div", "jm-rw" + (It.cancelled ? " x" : ""), Y("w", It.word), It.cancelled ? Y("x-mark", "\xD7") : Tr(It.points));
      je.title = It.cancelled ? "Cancelled \u2014 another player found it too" : "", ut.append($(je, 280 + b * 90 + Math.min(Zt, 14) * 40));
    }), C.append(ut), window.requestAnimationFrame(() => ut.classList.toggle("scroll", ut.scrollHeight > ut.clientHeight + 1)), C;
  }
  return {
    get capturesKeyboard() {
      return !1;
    },
    setState(s) {
      let p = Z;
      Z = s;
      let b = s.phase;
      Tt(n, b === "title"), Tt(ht, Mn.has(b)), Tt(Lt, b === "results"), b !== "results" && Xt(L), Et.hidden = s.sessionKind !== "room", Et.classList.toggle("dense", s.players.length > 6), xe(s.players), b !== jt && (b === "countdown" ? Rt("Get ready", !0) : b === "shaking" ? Rt("Shake!", !1, !0) : b === "playing" && (jt === "shaking" || jt === "countdown") ? Rt("Go!", !1) : b === "tally" && Rt("Time's up", !0, !0), (b === "title" || b === "lobby") && (yt.className = "jm-burst", ot.classList.remove("off"), Nt = !1, gt = !1, re("", null, 0)), (b === "countdown" || b === "shaking") && (re("", null, 0), rt = null), jt = b), p?.phase !== b && b === "results" && (yt.className = "jm-burst");
    },
    setTimer: u,
    setEntry(s, p) {
      oo(s, p);
    },
    setWords(s) {
      no(s);
    },
    wordFeedback(s, p, b) {
      re(p, s, b), rt = {
        word: p.toUpperCase(),
        verdict: s,
        at: performance.now()
      };
    },
    showResults(s) {
      Tt(Lt, !0), M(s);
    },
    notice(s, p) {
      U.textContent = s, U.className = "jm-toast " + p, U.offsetWidth, U.classList.add("on"), it = 3.2;
    },
    setLayout({
      portrait: s,
      width: p,
      height: b
    }) {
      r.classList.toggle("portrait", s), r.style.setProperty("--jm-vw", `${p}px`), r.style.setProperty("--jm-vh", `${b}px`);
    },
    update(s) {
      it > 0 && (it -= s, it <= 0 && U.classList.remove("on"));
    }
  };
}
var kr = {
    "ui-hover": "./assets/029-sfxui-hover.wav",
    "ui-click": "./assets/028-sfxui-click.wav",
    "ui-back": "./assets/027-sfxui-back.wav",
    join: "./assets/014-sfxjoin.wav",
    leave: "./assets/015-sfxleave.wav",
    countdown: "./assets/009-sfxcountdown.wav",
    go: "./assets/012-sfxgo.wav",
    "shake-rattle": "./assets/018-sfxshake-rattle.wav",
    "cube-land": "./assets/010-sfxcube-land.wav",
    "cube-settle": "./assets/011-sfxcube-settle.wav",
    "trace-tick": "./assets/025-sfxtrace-tick.wav",
    "trace-cancel": "./assets/024-sfxtrace-cancel.wav",
    type: "./assets/026-sfxtype.wav",
    "word-ok": "./assets/034-sfxword-ok.wav",
    "word-big": "./assets/032-sfxword-big.wav",
    "word-dup": "./assets/033-sfxword-dup.wav",
    "word-bad": "./assets/031-sfxword-bad.wav",
    tick: "./assets/021-sfxtick.wav",
    "tick-urgent": "./assets/022-sfxtick-urgent.wav",
    timeup: "./assets/023-sfxtimeup.wav",
    "hourglass-flip": "./assets/013-sfxhourglass-flip.wav",
    "tally-line": "./assets/020-sfxtally-line.wav",
    "tally-cancel": "./assets/019-sfxtally-cancel.wav",
    "results-in": "./assets/017-sfxresults-in.wav",
    win: "./assets/030-sfxwin.wav",
    lose: "./assets/016-sfxlose.wav"
  },
  Sn = 30;
function Sr(e) {
  let t = new Map();
  return {
    play(o, r) {
      let n = performance.now(),
        a = t.get(o);
      if (!(a !== void 0 && n - a < Sn)) {
        t.set(o, n);
        try {
          e.playSfx(o, r);
        } catch {}
      }
    }
  };
}
var Hr = () => document.getElementById("jm-loading"),
  xo = 0.04;
function Ge(e, t) {
  let o = Hr();
  if (!o) return;
  xo = Math.max(xo, Math.min(1, e));
  let r = o.querySelector(".fill");
  r && (r.style.width = `${(xo * 100).toFixed(1)}%`);
  let n = o.querySelector(".label");
  t && n && (n.textContent = t);
}
function Ir() {
  let e = Hr();
  e && (Ge(1), e.classList.add("done"), window.setTimeout(() => e.remove(), 500));
}
Ge(0.12);
var Cn = To(e => Ge(0.12 + e * 0.68, e < 1 ? "Loading words\u2026" : "Setting the table\u2026")),
  At = null,
  be = null;
await Hn({
  design: {
    width: 1280,
    height: 720
  },
  camera: In({
    fov: ge.fov,
    position: ge.position.clone(),
    lookAt: ge.lookAt.clone()
  }),
  background: 1053720,
  maxPixelRatio: 2,
  assets: {
    audio: kr
  },
  async setup(e) {
    e.renderer.shadowMap.enabled = !0, e.renderer.shadowMap.type = ce.PCFShadowMap, Ge(0.3);
    let t = await Cn,
      o = e.platform,
      n = {
        id: "local",
        name: "You",
        avatar: null
      },
      a = gr();
    e.scene.add(a.root);
    let d = new ce.Group();
    e.scene.add(d);
    let c = sr();
    d.add(c.root);
    let l = new Xe(d),
      E = fr();
    E.root.position.copy(vo), e.scene.add(E.root);
    let x = new Je(e.camera, E.root),
      m = new ze({
        dictionary: t
      }),
      R = {
        phase: "title",
        sessionKind: "none",
        code: null,
        isHost: !1,
        isPublic: !1,
        autoStartAt: null,
        players: [],
        starting: !1,
        creating: !1
      },
      T,
      F = () => {
        let h = m.session;
        T.setState({
          ...R,
          phase: m.phase,
          players: m.players,
          isHost: h ? m.isHost : R.isHost,
          isPublic: h?.isPublic ?? !1,
          autoStartAt: h?.autoStartAt ?? null,
          starting: m.starting
        });
      },
      j = Sr(e.audio),
      S = () => {
        m.attach(new Fe(n)), R.sessionKind = "solo", R.code = null, R.isHost = !0, F(), m.startRound();
      };
    T = Mr(e.hud.layer("center", {
      interactive: !0
    }), {
      onSolo: S,
      onStartRound: () => m.startRound(),
      onPlayAgain: () => {
        j.play("ui-click");
        e.restart();
      }
    });
    let V = new ce.Vector3(),
      W = new ce.Vector2(),
      O = (h, G) => (d.getWorldPosition(V).project(e.camera), e.viewport.toNdc(h, G, W).y > V.y),
      k = new Ne(e.input, m, c, l, T, j, O);
    m.events.on("phase", ({
      phase: h,
      previous: G
    }) => {
      R.phase = h, F(), a.setMood(h), c.setActive(h === "playing"), h !== "playing" && k.clear(), h === "countdown" && j.play("countdown"), h === "playing" && (E.flip(), j.play("hourglass-flip"), j.play("go")), h === "tally" && j.play("timeup"), h === "lobby" && G === "title" && j.play("ui-click");
    }), m.events.on("starting", () => F()), m.events.on("session", ({
      kind: h,
      code: G,
      isHost: z
    }) => {
      R.sessionKind = h, R.code = G, R.isHost = z, F();
    });
    let H = [];
    m.events.on("shake", ({
      shake: h,
      duration: G
    }) => {
      c.shake(h, G);
      for (let K of H) window.clearTimeout(K);
      H = [];
      let z = Math.max(0, G - 2.4);
      H.push(window.setTimeout(() => j.play("shake-rattle"), z * 1e3));
      for (let K = 0; K < 6; K++) {
        let lt = Math.max(0, G - 0.95 + K * 0.09 + Math.random() * 0.05);
        H.push(window.setTimeout(() => j.play("cube-land", {
          volume: 0.45 + Math.random() * 0.25,
          rate: 0.9 + Math.random() * 0.2,
          pan: -0.6 + Math.random() * 1.2
        }), lt * 1e3));
      }
      H.push(window.setTimeout(() => j.play("cube-settle", {
        volume: 0.8
      }), Math.max(0, G - 0.25) * 1e3));
    });
    let Q = -1;
    m.events.on("timer", ({
      remaining: h,
      total: G,
      running: z
    }) => {
      T.setTimer(h, G, z), E.setProgress(1 - h / G, z);
      let K = Math.ceil(h);
      z && K !== Q && (Q = K, K > 0 && K <= 10 ? j.play(K <= 5 ? "tick-urgent" : "tick", {
        volume: K <= 5 ? 0.9 : 0.7
      }) : (K === 30 || K === 60) && j.play("tick", {
        volume: 0.5,
        rate: 0.9
      })), z || (Q = -1);
    });
    let N = 0;
    m.events.on("roster", h => {
      R.sessionKind === "room" && N > 0 && (h.length > N ? j.play("join") : h.length < N && j.play("leave")), N = h.length, F();
    }), m.events.on("words", h => T.setWords(h)), m.events.on("word", ({
      verdict: h,
      word: G,
      points: z
    }) => {
      T.wordFeedback(h, G, z), j.play(h === "ok" ? z >= 3 ? "word-big" : "word-ok" : h === "already-found" ? "word-dup" : "word-bad");
    }), m.events.on("results", h => {
      T.showResults(h), j.play("results-in");
      let G = h.winnerIds.includes(h.selfId);
      window.setTimeout(() => j.play(G ? "win" : h.players.length > 1 ? "lose" : "tally-line"), 900);
    }), m.events.on("notice", ({
      text: h,
      kind: G
    }) => T.notice(h, G)), void 0, T.setTimer(180, 180, !1), be = x.apply(e.viewport), T.setLayout(be);
    F(), window.__jamble = {
      match: m,
      orbit: l,
      board: c,
      ui: T,
      input: k,
      game: e
    }, At = {
      match: m,
      board: c,
      hourglass: E,
      environment: a,
      orbit: l,
      ui: T,
      input: k,
      framing: x
    }, requestAnimationFrame(() => requestAnimationFrame(Ir));
  },
  restart() {
    At?.match.reset();
  },
  update(e, t) {
    if (!At) return;
    let o = At.framing.apply(e.viewport);
    (!be || o.portrait !== be.portrait || o.width !== be.width || o.height !== be.height) && (be = o, At.ui.setLayout(o)), At.match.update(t), At.board.update(t), At.hourglass.update(t), At.environment.update(t), At.orbit.update(t);
  },
  render(e, t) {
    At && (At.orbit.render(), At.board.render(t, e.camera), At.hourglass.render(t), At.environment.render(t), At.ui.update(t));
  }
});