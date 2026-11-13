function mp(i, e) {
  for (var t = 0; t < e.length; t++) {
    let r = e[t];
    if (typeof r != "string" && !Array.isArray(r)) {
      for (let n in r) if (n !== "default" && !(n in i)) {
        let s = Object.getOwnPropertyDescriptor(r, n);
        s && Object.defineProperty(i, n, s.get ? s : {
          enumerable: !0,
          get: () => r[n]
        });
      }
    }
  }
  return Object.freeze(Object.defineProperty(i, Symbol.toStringTag, {
    value: "Module"
  }));
}
(function () {
  let i = document.createElement("link").relList;
  if (i && i.supports && i.supports("modulepreload")) return;
  for (let r of document.querySelectorAll('link[rel="modulepreload"]')) t(r);
  new MutationObserver(r => {
    for (let n of r) if (n.type === "childList") for (let s of n.addedNodes) s.tagName === "LINK" && s.rel === "modulepreload" && t(s);
  }).observe(document, {
    childList: !0,
    subtree: !0
  });
  function e(r) {
    let n = {};
    return r.integrity && (n.integrity = r.integrity), r.referrerPolicy && (n.referrerPolicy = r.referrerPolicy), r.crossOrigin === "use-credentials" ? n.credentials = "include" : r.crossOrigin === "anonymous" ? n.credentials = "omit" : n.credentials = "same-origin", n;
  }
  function t(r) {
    if (r.ep) return;
    r.ep = !0;
    let n = e(r);
    fetch(r.href, n);
  }
})();
var ml = "150",
  gp = 0,
  Nl = 1,
  vp = 2,
  Au = 1,
  Cu = 2,
  cs = 3,
  wi = 0,
  or = 1,
  Gr = 2,
  bi = 0,
  Wi = 1,
  wa = 2,
  kl = 3,
  Ul = 4,
  xp = 5,
  bn = 100,
  yp = 101,
  bp = 102,
  Fl = 103,
  Bl = 104,
  Mp = 200,
  Sp = 201,
  wp = 202,
  _p = 203,
  Ru = 204,
  Pu = 205,
  Tp = 206,
  Ep = 207,
  Ap = 208,
  Cp = 209,
  Rp = 210,
  Pp = 0,
  Lp = 1,
  Dp = 2,
  uc = 3,
  zp = 4,
  Ip = 5,
  Op = 6,
  Np = 7,
  Lu = 0,
  kp = 1,
  Up = 2,
  ri = 0,
  Fp = 1,
  Bp = 2,
  Gp = 3,
  gl = 4,
  Vp = 5,
  Du = 300,
  Rn = 301,
  Pn = 302,
  dc = 303,
  pc = 304,
  to = 306,
  Ln = 1e3,
  _r = 1001,
  fc = 1002,
  Zt = 1003,
  Gl = 1004,
  go = 1005,
  It = 1006,
  Wp = 1007,
  qr = 1008,
  Xi = 1009,
  Hp = 1010,
  jp = 1011,
  zu = 1012,
  qp = 1013,
  Gi = 1014,
  Vi = 1015,
  ys = 1016,
  Xp = 1017,
  Yp = 1018,
  wn = 1020,
  Zp = 1021,
  Tr = 1023,
  Jp = 1024,
  Kp = 1025,
  Hi = 1026,
  Dn = 1027,
  Qp = 1028,
  $p = 1029,
  ef = 1030,
  tf = 1031,
  rf = 1033,
  vo = 33776,
  xo = 33777,
  yo = 33778,
  bo = 33779,
  Vl = 35840,
  Wl = 35841,
  Hl = 35842,
  jl = 35843,
  nf = 36196,
  ql = 37492,
  Xl = 37496,
  Yl = 37808,
  Zl = 37809,
  Jl = 37810,
  Kl = 37811,
  Ql = 37812,
  $l = 37813,
  eh = 37814,
  th = 37815,
  rh = 37816,
  ih = 37817,
  nh = 37818,
  sh = 37819,
  ah = 37820,
  oh = 37821,
  Mo = 36492,
  sf = 36283,
  ch = 36284,
  lh = 36285,
  hh = 36286,
  Yi = 3e3,
  Ke = 3001,
  af = 3200,
  of = 3201,
  Iu = 0,
  cf = 1,
  Nr = "srgb",
  ro = "srgb-linear",
  Ou = "display-p3",
  So = 7680,
  lf = 519,
  mc = 35044,
  uh = "300 es",
  gc = 1035,
  _i = class {
    addEventListener(e, t) {
      this._listeners === void 0 && (this._listeners = {});
      let r = this._listeners;
      r[e] === void 0 && (r[e] = []), r[e].indexOf(t) === -1 && r[e].push(t);
    }
    hasEventListener(e, t) {
      if (this._listeners === void 0) return !1;
      let r = this._listeners;
      return r[e] !== void 0 && r[e].indexOf(t) !== -1;
    }
    removeEventListener(e, t) {
      if (this._listeners === void 0) return;
      let r = this._listeners[e];
      if (r !== void 0) {
        let n = r.indexOf(t);
        n !== -1 && r.splice(n, 1);
      }
    }
    dispatchEvent(e) {
      if (this._listeners === void 0) return;
      let t = this._listeners[e.type];
      if (t !== void 0) {
        e.target = this;
        let r = t.slice(0);
        for (let n = 0, s = r.length; n < s; n++) r[n].call(this, e);
        e.target = null;
      }
    }
  },
  Ft = ["00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "0a", "0b", "0c", "0d", "0e", "0f", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "1a", "1b", "1c", "1d", "1e", "1f", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "2a", "2b", "2c", "2d", "2e", "2f", "30", "31", "32", "33", "34", "35", "36", "37", "38", "39", "3a", "3b", "3c", "3d", "3e", "3f", "40", "41", "42", "43", "44", "45", "46", "47", "48", "49", "4a", "4b", "4c", "4d", "4e", "4f", "50", "51", "52", "53", "54", "55", "56", "57", "58", "59", "5a", "5b", "5c", "5d", "5e", "5f", "60", "61", "62", "63", "64", "65", "66", "67", "68", "69", "6a", "6b", "6c", "6d", "6e", "6f", "70", "71", "72", "73", "74", "75", "76", "77", "78", "79", "7a", "7b", "7c", "7d", "7e", "7f", "80", "81", "82", "83", "84", "85", "86", "87", "88", "89", "8a", "8b", "8c", "8d", "8e", "8f", "90", "91", "92", "93", "94", "95", "96", "97", "98", "99", "9a", "9b", "9c", "9d", "9e", "9f", "a0", "a1", "a2", "a3", "a4", "a5", "a6", "a7", "a8", "a9", "aa", "ab", "ac", "ad", "ae", "af", "b0", "b1", "b2", "b3", "b4", "b5", "b6", "b7", "b8", "b9", "ba", "bb", "bc", "bd", "be", "bf", "c0", "c1", "c2", "c3", "c4", "c5", "c6", "c7", "c8", "c9", "ca", "cb", "cc", "cd", "ce", "cf", "d0", "d1", "d2", "d3", "d4", "d5", "d6", "d7", "d8", "d9", "da", "db", "dc", "dd", "de", "df", "e0", "e1", "e2", "e3", "e4", "e5", "e6", "e7", "e8", "e9", "ea", "eb", "ec", "ed", "ee", "ef", "f0", "f1", "f2", "f3", "f4", "f5", "f6", "f7", "f8", "f9", "fa", "fb", "fc", "fd", "fe", "ff"],
  wo = Math.PI / 180,
  dh = 180 / Math.PI;
function ii() {
  let i = Math.random() * 4294967295 | 0,
    e = Math.random() * 4294967295 | 0,
    t = Math.random() * 4294967295 | 0,
    r = Math.random() * 4294967295 | 0;
  return (Ft[i & 255] + Ft[i >> 8 & 255] + Ft[i >> 16 & 255] + Ft[i >> 24 & 255] + "-" + Ft[e & 255] + Ft[e >> 8 & 255] + "-" + Ft[e >> 16 & 15 | 64] + Ft[e >> 24 & 255] + "-" + Ft[t & 63 | 128] + Ft[t >> 8 & 255] + "-" + Ft[t >> 16 & 255] + Ft[t >> 24 & 255] + Ft[r & 255] + Ft[r >> 8 & 255] + Ft[r >> 16 & 255] + Ft[r >> 24 & 255]).toLowerCase();
}
function Vt(i, e, t) {
  return Math.max(e, Math.min(t, i));
}
function hf(i, e) {
  return (i % e + e) % e;
}
function _o(i, e, t) {
  return (1 - t) * i + t * e;
}
function ph(i) {
  return (i & i - 1) === 0 && i !== 0;
}
function uf(i) {
  return Math.pow(2, Math.floor(Math.log(i) / Math.LN2));
}
function vi(i, e) {
  switch (e.constructor) {
    case Float32Array:
      return i;
    case Uint16Array:
      return i / 65535;
    case Uint8Array:
      return i / 255;
    case Int16Array:
      return Math.max(i / 32767, -1);
    case Int8Array:
      return Math.max(i / 127, -1);
    default:
      throw new Error("Invalid component type.");
  }
}
function ot(i, e) {
  switch (e.constructor) {
    case Float32Array:
      return i;
    case Uint16Array:
      return Math.round(i * 65535);
    case Uint8Array:
      return Math.round(i * 255);
    case Int16Array:
      return Math.round(i * 32767);
    case Int8Array:
      return Math.round(i * 127);
    default:
      throw new Error("Invalid component type.");
  }
}
var se = class i {
    constructor(e = 0, t = 0) {
      i.prototype.isVector2 = !0, this.x = e, this.y = t;
    }
    get width() {
      return this.x;
    }
    set width(e) {
      this.x = e;
    }
    get height() {
      return this.y;
    }
    set height(e) {
      this.y = e;
    }
    set(e, t) {
      return this.x = e, this.y = t, this;
    }
    setScalar(e) {
      return this.x = e, this.y = e, this;
    }
    setX(e) {
      return this.x = e, this;
    }
    setY(e) {
      return this.y = e, this;
    }
    setComponent(e, t) {
      switch (e) {
        case 0:
          this.x = t;
          break;
        case 1:
          this.y = t;
          break;
        default:
          throw new Error("index is out of range: " + e);
      }
      return this;
    }
    getComponent(e) {
      switch (e) {
        case 0:
          return this.x;
        case 1:
          return this.y;
        default:
          throw new Error("index is out of range: " + e);
      }
    }
    clone() {
      return new this.constructor(this.x, this.y);
    }
    copy(e) {
      return this.x = e.x, this.y = e.y, this;
    }
    add(e) {
      return this.x += e.x, this.y += e.y, this;
    }
    addScalar(e) {
      return this.x += e, this.y += e, this;
    }
    addVectors(e, t) {
      return this.x = e.x + t.x, this.y = e.y + t.y, this;
    }
    addScaledVector(e, t) {
      return this.x += e.x * t, this.y += e.y * t, this;
    }
    sub(e) {
      return this.x -= e.x, this.y -= e.y, this;
    }
    subScalar(e) {
      return this.x -= e, this.y -= e, this;
    }
    subVectors(e, t) {
      return this.x = e.x - t.x, this.y = e.y - t.y, this;
    }
    multiply(e) {
      return this.x *= e.x, this.y *= e.y, this;
    }
    multiplyScalar(e) {
      return this.x *= e, this.y *= e, this;
    }
    divide(e) {
      return this.x /= e.x, this.y /= e.y, this;
    }
    divideScalar(e) {
      return this.multiplyScalar(1 / e);
    }
    applyMatrix3(e) {
      let t = this.x,
        r = this.y,
        n = e.elements;
      return this.x = n[0] * t + n[3] * r + n[6], this.y = n[1] * t + n[4] * r + n[7], this;
    }
    min(e) {
      return this.x = Math.min(this.x, e.x), this.y = Math.min(this.y, e.y), this;
    }
    max(e) {
      return this.x = Math.max(this.x, e.x), this.y = Math.max(this.y, e.y), this;
    }
    clamp(e, t) {
      return this.x = Math.max(e.x, Math.min(t.x, this.x)), this.y = Math.max(e.y, Math.min(t.y, this.y)), this;
    }
    clampScalar(e, t) {
      return this.x = Math.max(e, Math.min(t, this.x)), this.y = Math.max(e, Math.min(t, this.y)), this;
    }
    clampLength(e, t) {
      let r = this.length();
      return this.divideScalar(r || 1).multiplyScalar(Math.max(e, Math.min(t, r)));
    }
    floor() {
      return this.x = Math.floor(this.x), this.y = Math.floor(this.y), this;
    }
    ceil() {
      return this.x = Math.ceil(this.x), this.y = Math.ceil(this.y), this;
    }
    round() {
      return this.x = Math.round(this.x), this.y = Math.round(this.y), this;
    }
    roundToZero() {
      return this.x = this.x < 0 ? Math.ceil(this.x) : Math.floor(this.x), this.y = this.y < 0 ? Math.ceil(this.y) : Math.floor(this.y), this;
    }
    negate() {
      return this.x = -this.x, this.y = -this.y, this;
    }
    dot(e) {
      return this.x * e.x + this.y * e.y;
    }
    cross(e) {
      return this.x * e.y - this.y * e.x;
    }
    lengthSq() {
      return this.x * this.x + this.y * this.y;
    }
    length() {
      return Math.sqrt(this.x * this.x + this.y * this.y);
    }
    manhattanLength() {
      return Math.abs(this.x) + Math.abs(this.y);
    }
    normalize() {
      return this.divideScalar(this.length() || 1);
    }
    angle() {
      return Math.atan2(-this.y, -this.x) + Math.PI;
    }
    distanceTo(e) {
      return Math.sqrt(this.distanceToSquared(e));
    }
    distanceToSquared(e) {
      let t = this.x - e.x,
        r = this.y - e.y;
      return t * t + r * r;
    }
    manhattanDistanceTo(e) {
      return Math.abs(this.x - e.x) + Math.abs(this.y - e.y);
    }
    setLength(e) {
      return this.normalize().multiplyScalar(e);
    }
    lerp(e, t) {
      return this.x += (e.x - this.x) * t, this.y += (e.y - this.y) * t, this;
    }
    lerpVectors(e, t, r) {
      return this.x = e.x + (t.x - e.x) * r, this.y = e.y + (t.y - e.y) * r, this;
    }
    equals(e) {
      return e.x === this.x && e.y === this.y;
    }
    fromArray(e, t = 0) {
      return this.x = e[t], this.y = e[t + 1], this;
    }
    toArray(e = [], t = 0) {
      return e[t] = this.x, e[t + 1] = this.y, e;
    }
    fromBufferAttribute(e, t) {
      return this.x = e.getX(t), this.y = e.getY(t), this;
    }
    rotateAround(e, t) {
      let r = Math.cos(t),
        n = Math.sin(t),
        s = this.x - e.x,
        o = this.y - e.y;
      return this.x = s * r - o * n + e.x, this.y = s * n + o * r + e.y, this;
    }
    random() {
      return this.x = Math.random(), this.y = Math.random(), this;
    }
    *[Symbol.iterator]() {
      yield this.x, yield this.y;
    }
  },
  Kt = class i {
    constructor() {
      i.prototype.isMatrix3 = !0, this.elements = [1, 0, 0, 0, 1, 0, 0, 0, 1];
    }
    set(e, t, r, n, s, o, a, l, c) {
      let h = this.elements;
      return h[0] = e, h[1] = n, h[2] = a, h[3] = t, h[4] = s, h[5] = l, h[6] = r, h[7] = o, h[8] = c, this;
    }
    identity() {
      return this.set(1, 0, 0, 0, 1, 0, 0, 0, 1), this;
    }
    copy(e) {
      let t = this.elements,
        r = e.elements;
      return t[0] = r[0], t[1] = r[1], t[2] = r[2], t[3] = r[3], t[4] = r[4], t[5] = r[5], t[6] = r[6], t[7] = r[7], t[8] = r[8], this;
    }
    extractBasis(e, t, r) {
      return e.setFromMatrix3Column(this, 0), t.setFromMatrix3Column(this, 1), r.setFromMatrix3Column(this, 2), this;
    }
    setFromMatrix4(e) {
      let t = e.elements;
      return this.set(t[0], t[4], t[8], t[1], t[5], t[9], t[2], t[6], t[10]), this;
    }
    multiply(e) {
      return this.multiplyMatrices(this, e);
    }
    premultiply(e) {
      return this.multiplyMatrices(e, this);
    }
    multiplyMatrices(e, t) {
      let r = e.elements,
        n = t.elements,
        s = this.elements,
        o = r[0],
        a = r[3],
        l = r[6],
        c = r[1],
        h = r[4],
        d = r[7],
        u = r[2],
        p = r[5],
        g = r[8],
        f = n[0],
        m = n[3],
        v = n[6],
        y = n[1],
        x = n[4],
        b = n[7],
        w = n[2],
        A = n[5],
        L = n[8];
      return s[0] = o * f + a * y + l * w, s[3] = o * m + a * x + l * A, s[6] = o * v + a * b + l * L, s[1] = c * f + h * y + d * w, s[4] = c * m + h * x + d * A, s[7] = c * v + h * b + d * L, s[2] = u * f + p * y + g * w, s[5] = u * m + p * x + g * A, s[8] = u * v + p * b + g * L, this;
    }
    multiplyScalar(e) {
      let t = this.elements;
      return t[0] *= e, t[3] *= e, t[6] *= e, t[1] *= e, t[4] *= e, t[7] *= e, t[2] *= e, t[5] *= e, t[8] *= e, this;
    }
    determinant() {
      let e = this.elements,
        t = e[0],
        r = e[1],
        n = e[2],
        s = e[3],
        o = e[4],
        a = e[5],
        l = e[6],
        c = e[7],
        h = e[8];
      return t * o * h - t * a * c - r * s * h + r * a * l + n * s * c - n * o * l;
    }
    invert() {
      let e = this.elements,
        t = e[0],
        r = e[1],
        n = e[2],
        s = e[3],
        o = e[4],
        a = e[5],
        l = e[6],
        c = e[7],
        h = e[8],
        d = h * o - a * c,
        u = a * l - h * s,
        p = c * s - o * l,
        g = t * d + r * u + n * p;
      if (g === 0) return this.set(0, 0, 0, 0, 0, 0, 0, 0, 0);
      let f = 1 / g;
      return e[0] = d * f, e[1] = (n * c - h * r) * f, e[2] = (a * r - n * o) * f, e[3] = u * f, e[4] = (h * t - n * l) * f, e[5] = (n * s - a * t) * f, e[6] = p * f, e[7] = (r * l - c * t) * f, e[8] = (o * t - r * s) * f, this;
    }
    transpose() {
      let e,
        t = this.elements;
      return e = t[1], t[1] = t[3], t[3] = e, e = t[2], t[2] = t[6], t[6] = e, e = t[5], t[5] = t[7], t[7] = e, this;
    }
    getNormalMatrix(e) {
      return this.setFromMatrix4(e).invert().transpose();
    }
    transposeIntoArray(e) {
      let t = this.elements;
      return e[0] = t[0], e[1] = t[3], e[2] = t[6], e[3] = t[1], e[4] = t[4], e[5] = t[7], e[6] = t[2], e[7] = t[5], e[8] = t[8], this;
    }
    setUvTransform(e, t, r, n, s, o, a) {
      let l = Math.cos(s),
        c = Math.sin(s);
      return this.set(r * l, r * c, -r * (l * o + c * a) + o + e, -n * c, n * l, -n * (-c * o + l * a) + a + t, 0, 0, 1), this;
    }
    scale(e, t) {
      return this.premultiply(To.makeScale(e, t)), this;
    }
    rotate(e) {
      return this.premultiply(To.makeRotation(-e)), this;
    }
    translate(e, t) {
      return this.premultiply(To.makeTranslation(e, t)), this;
    }
    makeTranslation(e, t) {
      return this.set(1, 0, e, 0, 1, t, 0, 0, 1), this;
    }
    makeRotation(e) {
      let t = Math.cos(e),
        r = Math.sin(e);
      return this.set(t, -r, 0, r, t, 0, 0, 0, 1), this;
    }
    makeScale(e, t) {
      return this.set(e, 0, 0, 0, t, 0, 0, 0, 1), this;
    }
    equals(e) {
      let t = this.elements,
        r = e.elements;
      for (let n = 0; n < 9; n++) if (t[n] !== r[n]) return !1;
      return !0;
    }
    fromArray(e, t = 0) {
      for (let r = 0; r < 9; r++) this.elements[r] = e[r + t];
      return this;
    }
    toArray(e = [], t = 0) {
      let r = this.elements;
      return e[t] = r[0], e[t + 1] = r[1], e[t + 2] = r[2], e[t + 3] = r[3], e[t + 4] = r[4], e[t + 5] = r[5], e[t + 6] = r[6], e[t + 7] = r[7], e[t + 8] = r[8], e;
    }
    clone() {
      return new this.constructor().fromArray(this.elements);
    }
  },
  To = new Kt();
function Nu(i) {
  for (let e = i.length - 1; e >= 0; --e) if (i[e] >= 65535) return !0;
  return !1;
}
function _a(i) {
  return document.createElementNS("http://www.w3.org/1999/xhtml", i);
}
var Ti = class {
    constructor(e = 0, t = 0, r = 0, n = 1) {
      this.isQuaternion = !0, this._x = e, this._y = t, this._z = r, this._w = n;
    }
    static slerpFlat(e, t, r, n, s, o, a) {
      let l = r[n + 0],
        c = r[n + 1],
        h = r[n + 2],
        d = r[n + 3],
        u = s[o + 0],
        p = s[o + 1],
        g = s[o + 2],
        f = s[o + 3];
      if (a === 0) {
        e[t + 0] = l, e[t + 1] = c, e[t + 2] = h, e[t + 3] = d;
        return;
      }
      if (a === 1) {
        e[t + 0] = u, e[t + 1] = p, e[t + 2] = g, e[t + 3] = f;
        return;
      }
      if (d !== f || l !== u || c !== p || h !== g) {
        let m = 1 - a,
          v = l * u + c * p + h * g + d * f,
          y = v >= 0 ? 1 : -1,
          x = 1 - v * v;
        if (x > Number.EPSILON) {
          let w = Math.sqrt(x),
            A = Math.atan2(w, v * y);
          m = Math.sin(m * A) / w, a = Math.sin(a * A) / w;
        }
        let b = a * y;
        if (l = l * m + u * b, c = c * m + p * b, h = h * m + g * b, d = d * m + f * b, m === 1 - a) {
          let w = 1 / Math.sqrt(l * l + c * c + h * h + d * d);
          l *= w, c *= w, h *= w, d *= w;
        }
      }
      e[t] = l, e[t + 1] = c, e[t + 2] = h, e[t + 3] = d;
    }
    static multiplyQuaternionsFlat(e, t, r, n, s, o) {
      let a = r[n],
        l = r[n + 1],
        c = r[n + 2],
        h = r[n + 3],
        d = s[o],
        u = s[o + 1],
        p = s[o + 2],
        g = s[o + 3];
      return e[t] = a * g + h * d + l * p - c * u, e[t + 1] = l * g + h * u + c * d - a * p, e[t + 2] = c * g + h * p + a * u - l * d, e[t + 3] = h * g - a * d - l * u - c * p, e;
    }
    get x() {
      return this._x;
    }
    set x(e) {
      this._x = e, this._onChangeCallback();
    }
    get y() {
      return this._y;
    }
    set y(e) {
      this._y = e, this._onChangeCallback();
    }
    get z() {
      return this._z;
    }
    set z(e) {
      this._z = e, this._onChangeCallback();
    }
    get w() {
      return this._w;
    }
    set w(e) {
      this._w = e, this._onChangeCallback();
    }
    set(e, t, r, n) {
      return this._x = e, this._y = t, this._z = r, this._w = n, this._onChangeCallback(), this;
    }
    clone() {
      return new this.constructor(this._x, this._y, this._z, this._w);
    }
    copy(e) {
      return this._x = e.x, this._y = e.y, this._z = e.z, this._w = e.w, this._onChangeCallback(), this;
    }
    setFromEuler(e, t) {
      let r = e._x,
        n = e._y,
        s = e._z,
        o = e._order,
        a = Math.cos,
        l = Math.sin,
        c = a(r / 2),
        h = a(n / 2),
        d = a(s / 2),
        u = l(r / 2),
        p = l(n / 2),
        g = l(s / 2);
      switch (o) {
        case "XYZ":
          this._x = u * h * d + c * p * g, this._y = c * p * d - u * h * g, this._z = c * h * g + u * p * d, this._w = c * h * d - u * p * g;
          break;
        case "YXZ":
          this._x = u * h * d + c * p * g, this._y = c * p * d - u * h * g, this._z = c * h * g - u * p * d, this._w = c * h * d + u * p * g;
          break;
        case "ZXY":
          this._x = u * h * d - c * p * g, this._y = c * p * d + u * h * g, this._z = c * h * g + u * p * d, this._w = c * h * d - u * p * g;
          break;
        case "ZYX":
          this._x = u * h * d - c * p * g, this._y = c * p * d + u * h * g, this._z = c * h * g - u * p * d, this._w = c * h * d + u * p * g;
          break;
        case "YZX":
          this._x = u * h * d + c * p * g, this._y = c * p * d + u * h * g, this._z = c * h * g - u * p * d, this._w = c * h * d - u * p * g;
          break;
        case "XZY":
          this._x = u * h * d - c * p * g, this._y = c * p * d - u * h * g, this._z = c * h * g + u * p * d, this._w = c * h * d + u * p * g;
          break;
        default:
          console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: " + o);
      }
      return t !== !1 && this._onChangeCallback(), this;
    }
    setFromAxisAngle(e, t) {
      let r = t / 2,
        n = Math.sin(r);
      return this._x = e.x * n, this._y = e.y * n, this._z = e.z * n, this._w = Math.cos(r), this._onChangeCallback(), this;
    }
    setFromRotationMatrix(e) {
      let t = e.elements,
        r = t[0],
        n = t[4],
        s = t[8],
        o = t[1],
        a = t[5],
        l = t[9],
        c = t[2],
        h = t[6],
        d = t[10],
        u = r + a + d;
      if (u > 0) {
        let p = 0.5 / Math.sqrt(u + 1);
        this._w = 0.25 / p, this._x = (h - l) * p, this._y = (s - c) * p, this._z = (o - n) * p;
      } else if (r > a && r > d) {
        let p = 2 * Math.sqrt(1 + r - a - d);
        this._w = (h - l) / p, this._x = 0.25 * p, this._y = (n + o) / p, this._z = (s + c) / p;
      } else if (a > d) {
        let p = 2 * Math.sqrt(1 + a - r - d);
        this._w = (s - c) / p, this._x = (n + o) / p, this._y = 0.25 * p, this._z = (l + h) / p;
      } else {
        let p = 2 * Math.sqrt(1 + d - r - a);
        this._w = (o - n) / p, this._x = (s + c) / p, this._y = (l + h) / p, this._z = 0.25 * p;
      }
      return this._onChangeCallback(), this;
    }
    setFromUnitVectors(e, t) {
      let r = e.dot(t) + 1;
      return r < Number.EPSILON ? (r = 0, Math.abs(e.x) > Math.abs(e.z) ? (this._x = -e.y, this._y = e.x, this._z = 0, this._w = r) : (this._x = 0, this._y = -e.z, this._z = e.y, this._w = r)) : (this._x = e.y * t.z - e.z * t.y, this._y = e.z * t.x - e.x * t.z, this._z = e.x * t.y - e.y * t.x, this._w = r), this.normalize();
    }
    angleTo(e) {
      return 2 * Math.acos(Math.abs(Vt(this.dot(e), -1, 1)));
    }
    rotateTowards(e, t) {
      let r = this.angleTo(e);
      if (r === 0) return this;
      let n = Math.min(1, t / r);
      return this.slerp(e, n), this;
    }
    identity() {
      return this.set(0, 0, 0, 1);
    }
    invert() {
      return this.conjugate();
    }
    conjugate() {
      return this._x *= -1, this._y *= -1, this._z *= -1, this._onChangeCallback(), this;
    }
    dot(e) {
      return this._x * e._x + this._y * e._y + this._z * e._z + this._w * e._w;
    }
    lengthSq() {
      return this._x * this._x + this._y * this._y + this._z * this._z + this._w * this._w;
    }
    length() {
      return Math.sqrt(this._x * this._x + this._y * this._y + this._z * this._z + this._w * this._w);
    }
    normalize() {
      let e = this.length();
      return e === 0 ? (this._x = 0, this._y = 0, this._z = 0, this._w = 1) : (e = 1 / e, this._x = this._x * e, this._y = this._y * e, this._z = this._z * e, this._w = this._w * e), this._onChangeCallback(), this;
    }
    multiply(e) {
      return this.multiplyQuaternions(this, e);
    }
    premultiply(e) {
      return this.multiplyQuaternions(e, this);
    }
    multiplyQuaternions(e, t) {
      let r = e._x,
        n = e._y,
        s = e._z,
        o = e._w,
        a = t._x,
        l = t._y,
        c = t._z,
        h = t._w;
      return this._x = r * h + o * a + n * c - s * l, this._y = n * h + o * l + s * a - r * c, this._z = s * h + o * c + r * l - n * a, this._w = o * h - r * a - n * l - s * c, this._onChangeCallback(), this;
    }
    slerp(e, t) {
      if (t === 0) return this;
      if (t === 1) return this.copy(e);
      let r = this._x,
        n = this._y,
        s = this._z,
        o = this._w,
        a = o * e._w + r * e._x + n * e._y + s * e._z;
      if (a < 0 ? (this._w = -e._w, this._x = -e._x, this._y = -e._y, this._z = -e._z, a = -a) : this.copy(e), a >= 1) return this._w = o, this._x = r, this._y = n, this._z = s, this;
      let l = 1 - a * a;
      if (l <= Number.EPSILON) {
        let p = 1 - t;
        return this._w = p * o + t * this._w, this._x = p * r + t * this._x, this._y = p * n + t * this._y, this._z = p * s + t * this._z, this.normalize(), this._onChangeCallback(), this;
      }
      let c = Math.sqrt(l),
        h = Math.atan2(c, a),
        d = Math.sin((1 - t) * h) / c,
        u = Math.sin(t * h) / c;
      return this._w = o * d + this._w * u, this._x = r * d + this._x * u, this._y = n * d + this._y * u, this._z = s * d + this._z * u, this._onChangeCallback(), this;
    }
    slerpQuaternions(e, t, r) {
      return this.copy(e).slerp(t, r);
    }
    random() {
      let e = Math.random(),
        t = Math.sqrt(1 - e),
        r = Math.sqrt(e),
        n = 2 * Math.PI * Math.random(),
        s = 2 * Math.PI * Math.random();
      return this.set(t * Math.cos(n), r * Math.sin(s), r * Math.cos(s), t * Math.sin(n));
    }
    equals(e) {
      return e._x === this._x && e._y === this._y && e._z === this._z && e._w === this._w;
    }
    fromArray(e, t = 0) {
      return this._x = e[t], this._y = e[t + 1], this._z = e[t + 2], this._w = e[t + 3], this._onChangeCallback(), this;
    }
    toArray(e = [], t = 0) {
      return e[t] = this._x, e[t + 1] = this._y, e[t + 2] = this._z, e[t + 3] = this._w, e;
    }
    fromBufferAttribute(e, t) {
      return this._x = e.getX(t), this._y = e.getY(t), this._z = e.getZ(t), this._w = e.getW(t), this;
    }
    _onChange(e) {
      return this._onChangeCallback = e, this;
    }
    _onChangeCallback() {}
    *[Symbol.iterator]() {
      yield this._x, yield this._y, yield this._z, yield this._w;
    }
  },
  C = class i {
    constructor(e = 0, t = 0, r = 0) {
      i.prototype.isVector3 = !0, this.x = e, this.y = t, this.z = r;
    }
    set(e, t, r) {
      return r === void 0 && (r = this.z), this.x = e, this.y = t, this.z = r, this;
    }
    setScalar(e) {
      return this.x = e, this.y = e, this.z = e, this;
    }
    setX(e) {
      return this.x = e, this;
    }
    setY(e) {
      return this.y = e, this;
    }
    setZ(e) {
      return this.z = e, this;
    }
    setComponent(e, t) {
      switch (e) {
        case 0:
          this.x = t;
          break;
        case 1:
          this.y = t;
          break;
        case 2:
          this.z = t;
          break;
        default:
          throw new Error("index is out of range: " + e);
      }
      return this;
    }
    getComponent(e) {
      switch (e) {
        case 0:
          return this.x;
        case 1:
          return this.y;
        case 2:
          return this.z;
        default:
          throw new Error("index is out of range: " + e);
      }
    }
    clone() {
      return new this.constructor(this.x, this.y, this.z);
    }
    copy(e) {
      return this.x = e.x, this.y = e.y, this.z = e.z, this;
    }
    add(e) {
      return this.x += e.x, this.y += e.y, this.z += e.z, this;
    }
    addScalar(e) {
      return this.x += e, this.y += e, this.z += e, this;
    }
    addVectors(e, t) {
      return this.x = e.x + t.x, this.y = e.y + t.y, this.z = e.z + t.z, this;
    }
    addScaledVector(e, t) {
      return this.x += e.x * t, this.y += e.y * t, this.z += e.z * t, this;
    }
    sub(e) {
      return this.x -= e.x, this.y -= e.y, this.z -= e.z, this;
    }
    subScalar(e) {
      return this.x -= e, this.y -= e, this.z -= e, this;
    }
    subVectors(e, t) {
      return this.x = e.x - t.x, this.y = e.y - t.y, this.z = e.z - t.z, this;
    }
    multiply(e) {
      return this.x *= e.x, this.y *= e.y, this.z *= e.z, this;
    }
    multiplyScalar(e) {
      return this.x *= e, this.y *= e, this.z *= e, this;
    }
    multiplyVectors(e, t) {
      return this.x = e.x * t.x, this.y = e.y * t.y, this.z = e.z * t.z, this;
    }
    applyEuler(e) {
      return this.applyQuaternion(fh.setFromEuler(e));
    }
    applyAxisAngle(e, t) {
      return this.applyQuaternion(fh.setFromAxisAngle(e, t));
    }
    applyMatrix3(e) {
      let t = this.x,
        r = this.y,
        n = this.z,
        s = e.elements;
      return this.x = s[0] * t + s[3] * r + s[6] * n, this.y = s[1] * t + s[4] * r + s[7] * n, this.z = s[2] * t + s[5] * r + s[8] * n, this;
    }
    applyNormalMatrix(e) {
      return this.applyMatrix3(e).normalize();
    }
    applyMatrix4(e) {
      let t = this.x,
        r = this.y,
        n = this.z,
        s = e.elements,
        o = 1 / (s[3] * t + s[7] * r + s[11] * n + s[15]);
      return this.x = (s[0] * t + s[4] * r + s[8] * n + s[12]) * o, this.y = (s[1] * t + s[5] * r + s[9] * n + s[13]) * o, this.z = (s[2] * t + s[6] * r + s[10] * n + s[14]) * o, this;
    }
    applyQuaternion(e) {
      let t = this.x,
        r = this.y,
        n = this.z,
        s = e.x,
        o = e.y,
        a = e.z,
        l = e.w,
        c = l * t + o * n - a * r,
        h = l * r + a * t - s * n,
        d = l * n + s * r - o * t,
        u = -s * t - o * r - a * n;
      return this.x = c * l + u * -s + h * -a - d * -o, this.y = h * l + u * -o + d * -s - c * -a, this.z = d * l + u * -a + c * -o - h * -s, this;
    }
    project(e) {
      return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix);
    }
    unproject(e) {
      return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld);
    }
    transformDirection(e) {
      let t = this.x,
        r = this.y,
        n = this.z,
        s = e.elements;
      return this.x = s[0] * t + s[4] * r + s[8] * n, this.y = s[1] * t + s[5] * r + s[9] * n, this.z = s[2] * t + s[6] * r + s[10] * n, this.normalize();
    }
    divide(e) {
      return this.x /= e.x, this.y /= e.y, this.z /= e.z, this;
    }
    divideScalar(e) {
      return this.multiplyScalar(1 / e);
    }
    min(e) {
      return this.x = Math.min(this.x, e.x), this.y = Math.min(this.y, e.y), this.z = Math.min(this.z, e.z), this;
    }
    max(e) {
      return this.x = Math.max(this.x, e.x), this.y = Math.max(this.y, e.y), this.z = Math.max(this.z, e.z), this;
    }
    clamp(e, t) {
      return this.x = Math.max(e.x, Math.min(t.x, this.x)), this.y = Math.max(e.y, Math.min(t.y, this.y)), this.z = Math.max(e.z, Math.min(t.z, this.z)), this;
    }
    clampScalar(e, t) {
      return this.x = Math.max(e, Math.min(t, this.x)), this.y = Math.max(e, Math.min(t, this.y)), this.z = Math.max(e, Math.min(t, this.z)), this;
    }
    clampLength(e, t) {
      let r = this.length();
      return this.divideScalar(r || 1).multiplyScalar(Math.max(e, Math.min(t, r)));
    }
    floor() {
      return this.x = Math.floor(this.x), this.y = Math.floor(this.y), this.z = Math.floor(this.z), this;
    }
    ceil() {
      return this.x = Math.ceil(this.x), this.y = Math.ceil(this.y), this.z = Math.ceil(this.z), this;
    }
    round() {
      return this.x = Math.round(this.x), this.y = Math.round(this.y), this.z = Math.round(this.z), this;
    }
    roundToZero() {
      return this.x = this.x < 0 ? Math.ceil(this.x) : Math.floor(this.x), this.y = this.y < 0 ? Math.ceil(this.y) : Math.floor(this.y), this.z = this.z < 0 ? Math.ceil(this.z) : Math.floor(this.z), this;
    }
    negate() {
      return this.x = -this.x, this.y = -this.y, this.z = -this.z, this;
    }
    dot(e) {
      return this.x * e.x + this.y * e.y + this.z * e.z;
    }
    lengthSq() {
      return this.x * this.x + this.y * this.y + this.z * this.z;
    }
    length() {
      return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }
    manhattanLength() {
      return Math.abs(this.x) + Math.abs(this.y) + Math.abs(this.z);
    }
    normalize() {
      return this.divideScalar(this.length() || 1);
    }
    setLength(e) {
      return this.normalize().multiplyScalar(e);
    }
    lerp(e, t) {
      return this.x += (e.x - this.x) * t, this.y += (e.y - this.y) * t, this.z += (e.z - this.z) * t, this;
    }
    lerpVectors(e, t, r) {
      return this.x = e.x + (t.x - e.x) * r, this.y = e.y + (t.y - e.y) * r, this.z = e.z + (t.z - e.z) * r, this;
    }
    cross(e) {
      return this.crossVectors(this, e);
    }
    crossVectors(e, t) {
      let r = e.x,
        n = e.y,
        s = e.z,
        o = t.x,
        a = t.y,
        l = t.z;
      return this.x = n * l - s * a, this.y = s * o - r * l, this.z = r * a - n * o, this;
    }
    projectOnVector(e) {
      let t = e.lengthSq();
      if (t === 0) return this.set(0, 0, 0);
      let r = e.dot(this) / t;
      return this.copy(e).multiplyScalar(r);
    }
    projectOnPlane(e) {
      return Eo.copy(this).projectOnVector(e), this.sub(Eo);
    }
    reflect(e) {
      return this.sub(Eo.copy(e).multiplyScalar(2 * this.dot(e)));
    }
    angleTo(e) {
      let t = Math.sqrt(this.lengthSq() * e.lengthSq());
      if (t === 0) return Math.PI / 2;
      let r = this.dot(e) / t;
      return Math.acos(Vt(r, -1, 1));
    }
    distanceTo(e) {
      return Math.sqrt(this.distanceToSquared(e));
    }
    distanceToSquared(e) {
      let t = this.x - e.x,
        r = this.y - e.y,
        n = this.z - e.z;
      return t * t + r * r + n * n;
    }
    manhattanDistanceTo(e) {
      return Math.abs(this.x - e.x) + Math.abs(this.y - e.y) + Math.abs(this.z - e.z);
    }
    setFromSpherical(e) {
      return this.setFromSphericalCoords(e.radius, e.phi, e.theta);
    }
    setFromSphericalCoords(e, t, r) {
      let n = Math.sin(t) * e;
      return this.x = n * Math.sin(r), this.y = Math.cos(t) * e, this.z = n * Math.cos(r), this;
    }
    setFromCylindrical(e) {
      return this.setFromCylindricalCoords(e.radius, e.theta, e.y);
    }
    setFromCylindricalCoords(e, t, r) {
      return this.x = e * Math.sin(t), this.y = r, this.z = e * Math.cos(t), this;
    }
    setFromMatrixPosition(e) {
      let t = e.elements;
      return this.x = t[12], this.y = t[13], this.z = t[14], this;
    }
    setFromMatrixScale(e) {
      let t = this.setFromMatrixColumn(e, 0).length(),
        r = this.setFromMatrixColumn(e, 1).length(),
        n = this.setFromMatrixColumn(e, 2).length();
      return this.x = t, this.y = r, this.z = n, this;
    }
    setFromMatrixColumn(e, t) {
      return this.fromArray(e.elements, t * 4);
    }
    setFromMatrix3Column(e, t) {
      return this.fromArray(e.elements, t * 3);
    }
    setFromEuler(e) {
      return this.x = e._x, this.y = e._y, this.z = e._z, this;
    }
    equals(e) {
      return e.x === this.x && e.y === this.y && e.z === this.z;
    }
    fromArray(e, t = 0) {
      return this.x = e[t], this.y = e[t + 1], this.z = e[t + 2], this;
    }
    toArray(e = [], t = 0) {
      return e[t] = this.x, e[t + 1] = this.y, e[t + 2] = this.z, e;
    }
    fromBufferAttribute(e, t) {
      return this.x = e.getX(t), this.y = e.getY(t), this.z = e.getZ(t), this;
    }
    random() {
      return this.x = Math.random(), this.y = Math.random(), this.z = Math.random(), this;
    }
    randomDirection() {
      let e = (Math.random() - 0.5) * 2,
        t = Math.random() * Math.PI * 2,
        r = Math.sqrt(1 - e ** 2);
      return this.x = r * Math.cos(t), this.y = r * Math.sin(t), this.z = e, this;
    }
    *[Symbol.iterator]() {
      yield this.x, yield this.y, yield this.z;
    }
  },
  Eo = new C(),
  fh = new Ti();
function _n(i) {
  return i < 0.04045 ? i * 0.0773993808 : Math.pow(i * 0.9478672986 + 0.0521327014, 2.4);
}
function Ao(i) {
  return i < 0.0031308 ? i * 12.92 : 1.055 * Math.pow(i, 0.41666) - 0.055;
}
var df = new Kt().fromArray([0.8224621, 0.0331941, 0.0170827, 0.177538, 0.9668058, 0.0723974, -1e-7, 1e-7, 0.9105199]),
  pf = new Kt().fromArray([1.2249401, -0.0420569, -0.0196376, -0.2249404, 1.0420571, -0.0786361, 1e-7, 0, 1.0982735]),
  xi = new C();
function ff(i) {
  return i.convertSRGBToLinear(), xi.set(i.r, i.g, i.b).applyMatrix3(pf), i.setRGB(xi.x, xi.y, xi.z);
}
function mf(i) {
  return xi.set(i.r, i.g, i.b).applyMatrix3(df), i.setRGB(xi.x, xi.y, xi.z).convertLinearToSRGB();
}
var gf = {
    [ro]: i => i,
    [Nr]: i => i.convertSRGBToLinear(),
    [Ou]: ff
  },
  vf = {
    [ro]: i => i,
    [Nr]: i => i.convertLinearToSRGB(),
    [Ou]: mf
  },
  qt = {
    enabled: !1,
    get legacyMode() {
      return console.warn("THREE.ColorManagement: .legacyMode=false renamed to .enabled=true in r150."), !this.enabled;
    },
    set legacyMode(i) {
      console.warn("THREE.ColorManagement: .legacyMode=false renamed to .enabled=true in r150."), this.enabled = !i;
    },
    get workingColorSpace() {
      return ro;
    },
    set workingColorSpace(i) {
      console.warn("THREE.ColorManagement: .workingColorSpace is readonly.");
    },
    convert: function (i, e, t) {
      if (this.enabled === !1 || e === t || !e || !t) return i;
      let r = gf[e],
        n = vf[t];
      if (r === void 0 || n === void 0) throw new Error(`Unsupported color space conversion, "${e}" to "${t}".`);
      return n(r(i));
    },
    fromWorkingColorSpace: function (i, e) {
      return this.convert(i, this.workingColorSpace, e);
    },
    toWorkingColorSpace: function (i, e) {
      return this.convert(i, e, this.workingColorSpace);
    }
  },
  rn,
  Ta = class {
    static getDataURL(e) {
      if (/^data:/i.test(e.src) || typeof HTMLCanvasElement > "u") return e.src;
      let t;
      if (e instanceof HTMLCanvasElement) t = e;else {
        rn === void 0 && (rn = _a("canvas")), rn.width = e.width, rn.height = e.height;
        let r = rn.getContext("2d");
        e instanceof ImageData ? r.putImageData(e, 0, 0) : r.drawImage(e, 0, 0, e.width, e.height), t = rn;
      }
      return t.width > 2048 || t.height > 2048 ? (console.warn("THREE.ImageUtils.getDataURL: Image converted to jpg for performance reasons", e), t.toDataURL("image/jpeg", 0.6)) : t.toDataURL("image/png");
    }
    static sRGBToLinear(e) {
      if (typeof HTMLImageElement < "u" && e instanceof HTMLImageElement || typeof HTMLCanvasElement < "u" && e instanceof HTMLCanvasElement || typeof ImageBitmap < "u" && e instanceof ImageBitmap) {
        let t = _a("canvas");
        t.width = e.width, t.height = e.height;
        let r = t.getContext("2d");
        r.drawImage(e, 0, 0, e.width, e.height);
        let n = r.getImageData(0, 0, e.width, e.height),
          s = n.data;
        for (let o = 0; o < s.length; o++) s[o] = _n(s[o] / 255) * 255;
        return r.putImageData(n, 0, 0), t;
      } else if (e.data) {
        let t = e.data.slice(0);
        for (let r = 0; r < t.length; r++) t instanceof Uint8Array || t instanceof Uint8ClampedArray ? t[r] = Math.floor(_n(t[r] / 255) * 255) : t[r] = _n(t[r]);
        return {
          data: t,
          width: e.width,
          height: e.height
        };
      } else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."), e;
    }
  },
  Ea = class {
    constructor(e = null) {
      this.isSource = !0, this.uuid = ii(), this.data = e, this.version = 0;
    }
    set needsUpdate(e) {
      e === !0 && this.version++;
    }
    toJSON(e) {
      let t = e === void 0 || typeof e == "string";
      if (!t && e.images[this.uuid] !== void 0) return e.images[this.uuid];
      let r = {
          uuid: this.uuid,
          url: ""
        },
        n = this.data;
      if (n !== null) {
        let s;
        if (Array.isArray(n)) {
          s = [];
          for (let o = 0, a = n.length; o < a; o++) n[o].isDataTexture ? s.push(Co(n[o].image)) : s.push(Co(n[o]));
        } else s = Co(n);
        r.url = s;
      }
      return t || (e.images[this.uuid] = r), r;
    }
  };
function Co(i) {
  return typeof HTMLImageElement < "u" && i instanceof HTMLImageElement || typeof HTMLCanvasElement < "u" && i instanceof HTMLCanvasElement || typeof ImageBitmap < "u" && i instanceof ImageBitmap ? Ta.getDataURL(i) : i.data ? {
    data: Array.from(i.data),
    width: i.width,
    height: i.height,
    type: i.data.constructor.name
  } : (console.warn("THREE.Texture: Unable to serialize Texture."), {});
}
var xf = 0,
  vr = class i extends _i {
    constructor(e = i.DEFAULT_IMAGE, t = i.DEFAULT_MAPPING, r = _r, n = _r, s = It, o = qr, a = Tr, l = Xi, c = i.DEFAULT_ANISOTROPY, h = Yi) {
      super(), this.isTexture = !0, Object.defineProperty(this, "id", {
        value: xf++
      }), this.uuid = ii(), this.name = "", this.source = new Ea(e), this.mipmaps = [], this.mapping = t, this.wrapS = r, this.wrapT = n, this.magFilter = s, this.minFilter = o, this.anisotropy = c, this.format = a, this.internalFormat = null, this.type = l, this.offset = new se(0, 0), this.repeat = new se(1, 1), this.center = new se(0, 0), this.rotation = 0, this.matrixAutoUpdate = !0, this.matrix = new Kt(), this.generateMipmaps = !0, this.premultiplyAlpha = !1, this.flipY = !0, this.unpackAlignment = 4, this.encoding = h, this.userData = {}, this.version = 0, this.onUpdate = null, this.isRenderTargetTexture = !1, this.needsPMREMUpdate = !1;
    }
    get image() {
      return this.source.data;
    }
    set image(e = null) {
      this.source.data = e;
    }
    updateMatrix() {
      this.matrix.setUvTransform(this.offset.x, this.offset.y, this.repeat.x, this.repeat.y, this.rotation, this.center.x, this.center.y);
    }
    clone() {
      return new this.constructor().copy(this);
    }
    copy(e) {
      return this.name = e.name, this.source = e.source, this.mipmaps = e.mipmaps.slice(0), this.mapping = e.mapping, this.wrapS = e.wrapS, this.wrapT = e.wrapT, this.magFilter = e.magFilter, this.minFilter = e.minFilter, this.anisotropy = e.anisotropy, this.format = e.format, this.internalFormat = e.internalFormat, this.type = e.type, this.offset.copy(e.offset), this.repeat.copy(e.repeat), this.center.copy(e.center), this.rotation = e.rotation, this.matrixAutoUpdate = e.matrixAutoUpdate, this.matrix.copy(e.matrix), this.generateMipmaps = e.generateMipmaps, this.premultiplyAlpha = e.premultiplyAlpha, this.flipY = e.flipY, this.unpackAlignment = e.unpackAlignment, this.encoding = e.encoding, this.userData = JSON.parse(JSON.stringify(e.userData)), this.needsUpdate = !0, this;
    }
    toJSON(e) {
      let t = e === void 0 || typeof e == "string";
      if (!t && e.textures[this.uuid] !== void 0) return e.textures[this.uuid];
      let r = {
        metadata: {
          version: 4.5,
          type: "Texture",
          generator: "Texture.toJSON"
        },
        uuid: this.uuid,
        name: this.name,
        image: this.source.toJSON(e).uuid,
        mapping: this.mapping,
        repeat: [this.repeat.x, this.repeat.y],
        offset: [this.offset.x, this.offset.y],
        center: [this.center.x, this.center.y],
        rotation: this.rotation,
        wrap: [this.wrapS, this.wrapT],
        format: this.format,
        internalFormat: this.internalFormat,
        type: this.type,
        encoding: this.encoding,
        minFilter: this.minFilter,
        magFilter: this.magFilter,
        anisotropy: this.anisotropy,
        flipY: this.flipY,
        generateMipmaps: this.generateMipmaps,
        premultiplyAlpha: this.premultiplyAlpha,
        unpackAlignment: this.unpackAlignment
      };
      return Object.keys(this.userData).length > 0 && (r.userData = this.userData), t || (e.textures[this.uuid] = r), r;
    }
    dispose() {
      this.dispatchEvent({
        type: "dispose"
      });
    }
    transformUv(e) {
      if (this.mapping !== Du) return e;
      if (e.applyMatrix3(this.matrix), e.x < 0 || e.x > 1) switch (this.wrapS) {
        case Ln:
          e.x = e.x - Math.floor(e.x);
          break;
        case _r:
          e.x = e.x < 0 ? 0 : 1;
          break;
        case fc:
          Math.abs(Math.floor(e.x) % 2) === 1 ? e.x = Math.ceil(e.x) - e.x : e.x = e.x - Math.floor(e.x);
          break;
      }
      if (e.y < 0 || e.y > 1) switch (this.wrapT) {
        case Ln:
          e.y = e.y - Math.floor(e.y);
          break;
        case _r:
          e.y = e.y < 0 ? 0 : 1;
          break;
        case fc:
          Math.abs(Math.floor(e.y) % 2) === 1 ? e.y = Math.ceil(e.y) - e.y : e.y = e.y - Math.floor(e.y);
          break;
      }
      return this.flipY && (e.y = 1 - e.y), e;
    }
    set needsUpdate(e) {
      e === !0 && (this.version++, this.source.needsUpdate = !0);
    }
  };
vr.DEFAULT_IMAGE = null;
vr.DEFAULT_MAPPING = Du;
vr.DEFAULT_ANISOTROPY = 1;
var dt = class i {
    constructor(e = 0, t = 0, r = 0, n = 1) {
      i.prototype.isVector4 = !0, this.x = e, this.y = t, this.z = r, this.w = n;
    }
    get width() {
      return this.z;
    }
    set width(e) {
      this.z = e;
    }
    get height() {
      return this.w;
    }
    set height(e) {
      this.w = e;
    }
    set(e, t, r, n) {
      return this.x = e, this.y = t, this.z = r, this.w = n, this;
    }
    setScalar(e) {
      return this.x = e, this.y = e, this.z = e, this.w = e, this;
    }
    setX(e) {
      return this.x = e, this;
    }
    setY(e) {
      return this.y = e, this;
    }
    setZ(e) {
      return this.z = e, this;
    }
    setW(e) {
      return this.w = e, this;
    }
    setComponent(e, t) {
      switch (e) {
        case 0:
          this.x = t;
          break;
        case 1:
          this.y = t;
          break;
        case 2:
          this.z = t;
          break;
        case 3:
          this.w = t;
          break;
        default:
          throw new Error("index is out of range: " + e);
      }
      return this;
    }
    getComponent(e) {
      switch (e) {
        case 0:
          return this.x;
        case 1:
          return this.y;
        case 2:
          return this.z;
        case 3:
          return this.w;
        default:
          throw new Error("index is out of range: " + e);
      }
    }
    clone() {
      return new this.constructor(this.x, this.y, this.z, this.w);
    }
    copy(e) {
      return this.x = e.x, this.y = e.y, this.z = e.z, this.w = e.w !== void 0 ? e.w : 1, this;
    }
    add(e) {
      return this.x += e.x, this.y += e.y, this.z += e.z, this.w += e.w, this;
    }
    addScalar(e) {
      return this.x += e, this.y += e, this.z += e, this.w += e, this;
    }
    addVectors(e, t) {
      return this.x = e.x + t.x, this.y = e.y + t.y, this.z = e.z + t.z, this.w = e.w + t.w, this;
    }
    addScaledVector(e, t) {
      return this.x += e.x * t, this.y += e.y * t, this.z += e.z * t, this.w += e.w * t, this;
    }
    sub(e) {
      return this.x -= e.x, this.y -= e.y, this.z -= e.z, this.w -= e.w, this;
    }
    subScalar(e) {
      return this.x -= e, this.y -= e, this.z -= e, this.w -= e, this;
    }
    subVectors(e, t) {
      return this.x = e.x - t.x, this.y = e.y - t.y, this.z = e.z - t.z, this.w = e.w - t.w, this;
    }
    multiply(e) {
      return this.x *= e.x, this.y *= e.y, this.z *= e.z, this.w *= e.w, this;
    }
    multiplyScalar(e) {
      return this.x *= e, this.y *= e, this.z *= e, this.w *= e, this;
    }
    applyMatrix4(e) {
      let t = this.x,
        r = this.y,
        n = this.z,
        s = this.w,
        o = e.elements;
      return this.x = o[0] * t + o[4] * r + o[8] * n + o[12] * s, this.y = o[1] * t + o[5] * r + o[9] * n + o[13] * s, this.z = o[2] * t + o[6] * r + o[10] * n + o[14] * s, this.w = o[3] * t + o[7] * r + o[11] * n + o[15] * s, this;
    }
    divideScalar(e) {
      return this.multiplyScalar(1 / e);
    }
    setAxisAngleFromQuaternion(e) {
      this.w = 2 * Math.acos(e.w);
      let t = Math.sqrt(1 - e.w * e.w);
      return t < 1e-4 ? (this.x = 1, this.y = 0, this.z = 0) : (this.x = e.x / t, this.y = e.y / t, this.z = e.z / t), this;
    }
    setAxisAngleFromRotationMatrix(e) {
      let t,
        r,
        n,
        s,
        o = e.elements,
        a = o[0],
        l = o[4],
        c = o[8],
        h = o[1],
        d = o[5],
        u = o[9],
        p = o[2],
        g = o[6],
        f = o[10];
      if (Math.abs(l - h) < 0.01 && Math.abs(c - p) < 0.01 && Math.abs(u - g) < 0.01) {
        if (Math.abs(l + h) < 0.1 && Math.abs(c + p) < 0.1 && Math.abs(u + g) < 0.1 && Math.abs(a + d + f - 3) < 0.1) return this.set(1, 0, 0, 0), this;
        t = Math.PI;
        let v = (a + 1) / 2,
          y = (d + 1) / 2,
          x = (f + 1) / 2,
          b = (l + h) / 4,
          w = (c + p) / 4,
          A = (u + g) / 4;
        return v > y && v > x ? v < 0.01 ? (r = 0, n = 0.707106781, s = 0.707106781) : (r = Math.sqrt(v), n = b / r, s = w / r) : y > x ? y < 0.01 ? (r = 0.707106781, n = 0, s = 0.707106781) : (n = Math.sqrt(y), r = b / n, s = A / n) : x < 0.01 ? (r = 0.707106781, n = 0.707106781, s = 0) : (s = Math.sqrt(x), r = w / s, n = A / s), this.set(r, n, s, t), this;
      }
      let m = Math.sqrt((g - u) * (g - u) + (c - p) * (c - p) + (h - l) * (h - l));
      return Math.abs(m) < 0.001 && (m = 1), this.x = (g - u) / m, this.y = (c - p) / m, this.z = (h - l) / m, this.w = Math.acos((a + d + f - 1) / 2), this;
    }
    min(e) {
      return this.x = Math.min(this.x, e.x), this.y = Math.min(this.y, e.y), this.z = Math.min(this.z, e.z), this.w = Math.min(this.w, e.w), this;
    }
    max(e) {
      return this.x = Math.max(this.x, e.x), this.y = Math.max(this.y, e.y), this.z = Math.max(this.z, e.z), this.w = Math.max(this.w, e.w), this;
    }
    clamp(e, t) {
      return this.x = Math.max(e.x, Math.min(t.x, this.x)), this.y = Math.max(e.y, Math.min(t.y, this.y)), this.z = Math.max(e.z, Math.min(t.z, this.z)), this.w = Math.max(e.w, Math.min(t.w, this.w)), this;
    }
    clampScalar(e, t) {
      return this.x = Math.max(e, Math.min(t, this.x)), this.y = Math.max(e, Math.min(t, this.y)), this.z = Math.max(e, Math.min(t, this.z)), this.w = Math.max(e, Math.min(t, this.w)), this;
    }
    clampLength(e, t) {
      let r = this.length();
      return this.divideScalar(r || 1).multiplyScalar(Math.max(e, Math.min(t, r)));
    }
    floor() {
      return this.x = Math.floor(this.x), this.y = Math.floor(this.y), this.z = Math.floor(this.z), this.w = Math.floor(this.w), this;
    }
    ceil() {
      return this.x = Math.ceil(this.x), this.y = Math.ceil(this.y), this.z = Math.ceil(this.z), this.w = Math.ceil(this.w), this;
    }
    round() {
      return this.x = Math.round(this.x), this.y = Math.round(this.y), this.z = Math.round(this.z), this.w = Math.round(this.w), this;
    }
    roundToZero() {
      return this.x = this.x < 0 ? Math.ceil(this.x) : Math.floor(this.x), this.y = this.y < 0 ? Math.ceil(this.y) : Math.floor(this.y), this.z = this.z < 0 ? Math.ceil(this.z) : Math.floor(this.z), this.w = this.w < 0 ? Math.ceil(this.w) : Math.floor(this.w), this;
    }
    negate() {
      return this.x = -this.x, this.y = -this.y, this.z = -this.z, this.w = -this.w, this;
    }
    dot(e) {
      return this.x * e.x + this.y * e.y + this.z * e.z + this.w * e.w;
    }
    lengthSq() {
      return this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w;
    }
    length() {
      return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w);
    }
    manhattanLength() {
      return Math.abs(this.x) + Math.abs(this.y) + Math.abs(this.z) + Math.abs(this.w);
    }
    normalize() {
      return this.divideScalar(this.length() || 1);
    }
    setLength(e) {
      return this.normalize().multiplyScalar(e);
    }
    lerp(e, t) {
      return this.x += (e.x - this.x) * t, this.y += (e.y - this.y) * t, this.z += (e.z - this.z) * t, this.w += (e.w - this.w) * t, this;
    }
    lerpVectors(e, t, r) {
      return this.x = e.x + (t.x - e.x) * r, this.y = e.y + (t.y - e.y) * r, this.z = e.z + (t.z - e.z) * r, this.w = e.w + (t.w - e.w) * r, this;
    }
    equals(e) {
      return e.x === this.x && e.y === this.y && e.z === this.z && e.w === this.w;
    }
    fromArray(e, t = 0) {
      return this.x = e[t], this.y = e[t + 1], this.z = e[t + 2], this.w = e[t + 3], this;
    }
    toArray(e = [], t = 0) {
      return e[t] = this.x, e[t + 1] = this.y, e[t + 2] = this.z, e[t + 3] = this.w, e;
    }
    fromBufferAttribute(e, t) {
      return this.x = e.getX(t), this.y = e.getY(t), this.z = e.getZ(t), this.w = e.getW(t), this;
    }
    random() {
      return this.x = Math.random(), this.y = Math.random(), this.z = Math.random(), this.w = Math.random(), this;
    }
    *[Symbol.iterator]() {
      yield this.x, yield this.y, yield this.z, yield this.w;
    }
  },
  si = class extends _i {
    constructor(e = 1, t = 1, r = {}) {
      super(), this.isWebGLRenderTarget = !0, this.width = e, this.height = t, this.depth = 1, this.scissor = new dt(0, 0, e, t), this.scissorTest = !1, this.viewport = new dt(0, 0, e, t);
      let n = {
        width: e,
        height: t,
        depth: 1
      };
      this.texture = new vr(n, r.mapping, r.wrapS, r.wrapT, r.magFilter, r.minFilter, r.format, r.type, r.anisotropy, r.encoding), this.texture.isRenderTargetTexture = !0, this.texture.flipY = !1, this.texture.generateMipmaps = r.generateMipmaps !== void 0 ? r.generateMipmaps : !1, this.texture.internalFormat = r.internalFormat !== void 0 ? r.internalFormat : null, this.texture.minFilter = r.minFilter !== void 0 ? r.minFilter : It, this.depthBuffer = r.depthBuffer !== void 0 ? r.depthBuffer : !0, this.stencilBuffer = r.stencilBuffer !== void 0 ? r.stencilBuffer : !1, this.depthTexture = r.depthTexture !== void 0 ? r.depthTexture : null, this.samples = r.samples !== void 0 ? r.samples : 0;
    }
    setSize(e, t, r = 1) {
      (this.width !== e || this.height !== t || this.depth !== r) && (this.width = e, this.height = t, this.depth = r, this.texture.image.width = e, this.texture.image.height = t, this.texture.image.depth = r, this.dispose()), this.viewport.set(0, 0, e, t), this.scissor.set(0, 0, e, t);
    }
    clone() {
      return new this.constructor().copy(this);
    }
    copy(e) {
      this.width = e.width, this.height = e.height, this.depth = e.depth, this.viewport.copy(e.viewport), this.texture = e.texture.clone(), this.texture.isRenderTargetTexture = !0;
      let t = Object.assign({}, e.texture.image);
      return this.texture.source = new Ea(t), this.depthBuffer = e.depthBuffer, this.stencilBuffer = e.stencilBuffer, e.depthTexture !== null && (this.depthTexture = e.depthTexture.clone()), this.samples = e.samples, this;
    }
    dispose() {
      this.dispatchEvent({
        type: "dispose"
      });
    }
  },
  Aa = class extends vr {
    constructor(e = null, t = 1, r = 1, n = 1) {
      super(null), this.isDataArrayTexture = !0, this.image = {
        data: e,
        width: t,
        height: r,
        depth: n
      }, this.magFilter = Zt, this.minFilter = Zt, this.wrapR = _r, this.generateMipmaps = !1, this.flipY = !1, this.unpackAlignment = 1;
    }
  },
  vc = class extends vr {
    constructor(e = null, t = 1, r = 1, n = 1) {
      super(null), this.isData3DTexture = !0, this.image = {
        data: e,
        width: t,
        height: r,
        depth: n
      }, this.magFilter = Zt, this.minFilter = Zt, this.wrapR = _r, this.generateMipmaps = !1, this.flipY = !1, this.unpackAlignment = 1;
    }
  },
  Zi = class {
    constructor(e = new C(1 / 0, 1 / 0, 1 / 0), t = new C(-1 / 0, -1 / 0, -1 / 0)) {
      this.isBox3 = !0, this.min = e, this.max = t;
    }
    set(e, t) {
      return this.min.copy(e), this.max.copy(t), this;
    }
    setFromArray(e) {
      let t = 1 / 0,
        r = 1 / 0,
        n = 1 / 0,
        s = -1 / 0,
        o = -1 / 0,
        a = -1 / 0;
      for (let l = 0, c = e.length; l < c; l += 3) {
        let h = e[l],
          d = e[l + 1],
          u = e[l + 2];
        h < t && (t = h), d < r && (r = d), u < n && (n = u), h > s && (s = h), d > o && (o = d), u > a && (a = u);
      }
      return this.min.set(t, r, n), this.max.set(s, o, a), this;
    }
    setFromBufferAttribute(e) {
      let t = 1 / 0,
        r = 1 / 0,
        n = 1 / 0,
        s = -1 / 0,
        o = -1 / 0,
        a = -1 / 0;
      for (let l = 0, c = e.count; l < c; l++) {
        let h = e.getX(l),
          d = e.getY(l),
          u = e.getZ(l);
        h < t && (t = h), d < r && (r = d), u < n && (n = u), h > s && (s = h), d > o && (o = d), u > a && (a = u);
      }
      return this.min.set(t, r, n), this.max.set(s, o, a), this;
    }
    setFromPoints(e) {
      this.makeEmpty();
      for (let t = 0, r = e.length; t < r; t++) this.expandByPoint(e[t]);
      return this;
    }
    setFromCenterAndSize(e, t) {
      let r = Di.copy(t).multiplyScalar(0.5);
      return this.min.copy(e).sub(r), this.max.copy(e).add(r), this;
    }
    setFromObject(e, t = !1) {
      return this.makeEmpty(), this.expandByObject(e, t);
    }
    clone() {
      return new this.constructor().copy(this);
    }
    copy(e) {
      return this.min.copy(e.min), this.max.copy(e.max), this;
    }
    makeEmpty() {
      return this.min.x = this.min.y = this.min.z = 1 / 0, this.max.x = this.max.y = this.max.z = -1 / 0, this;
    }
    isEmpty() {
      return this.max.x < this.min.x || this.max.y < this.min.y || this.max.z < this.min.z;
    }
    getCenter(e) {
      return this.isEmpty() ? e.set(0, 0, 0) : e.addVectors(this.min, this.max).multiplyScalar(0.5);
    }
    getSize(e) {
      return this.isEmpty() ? e.set(0, 0, 0) : e.subVectors(this.max, this.min);
    }
    expandByPoint(e) {
      return this.min.min(e), this.max.max(e), this;
    }
    expandByVector(e) {
      return this.min.sub(e), this.max.add(e), this;
    }
    expandByScalar(e) {
      return this.min.addScalar(-e), this.max.addScalar(e), this;
    }
    expandByObject(e, t = !1) {
      e.updateWorldMatrix(!1, !1);
      let r = e.geometry;
      if (r !== void 0) if (t && r.attributes != null && r.attributes.position !== void 0) {
        let s = r.attributes.position;
        for (let o = 0, a = s.count; o < a; o++) Di.fromBufferAttribute(s, o).applyMatrix4(e.matrixWorld), this.expandByPoint(Di);
      } else r.boundingBox === null && r.computeBoundingBox(), Ro.copy(r.boundingBox), Ro.applyMatrix4(e.matrixWorld), this.union(Ro);
      let n = e.children;
      for (let s = 0, o = n.length; s < o; s++) this.expandByObject(n[s], t);
      return this;
    }
    containsPoint(e) {
      return !(e.x < this.min.x || e.x > this.max.x || e.y < this.min.y || e.y > this.max.y || e.z < this.min.z || e.z > this.max.z);
    }
    containsBox(e) {
      return this.min.x <= e.min.x && e.max.x <= this.max.x && this.min.y <= e.min.y && e.max.y <= this.max.y && this.min.z <= e.min.z && e.max.z <= this.max.z;
    }
    getParameter(e, t) {
      return t.set((e.x - this.min.x) / (this.max.x - this.min.x), (e.y - this.min.y) / (this.max.y - this.min.y), (e.z - this.min.z) / (this.max.z - this.min.z));
    }
    intersectsBox(e) {
      return !(e.max.x < this.min.x || e.min.x > this.max.x || e.max.y < this.min.y || e.min.y > this.max.y || e.max.z < this.min.z || e.min.z > this.max.z);
    }
    intersectsSphere(e) {
      return this.clampPoint(e.center, Di), Di.distanceToSquared(e.center) <= e.radius * e.radius;
    }
    intersectsPlane(e) {
      let t, r;
      return e.normal.x > 0 ? (t = e.normal.x * this.min.x, r = e.normal.x * this.max.x) : (t = e.normal.x * this.max.x, r = e.normal.x * this.min.x), e.normal.y > 0 ? (t += e.normal.y * this.min.y, r += e.normal.y * this.max.y) : (t += e.normal.y * this.max.y, r += e.normal.y * this.min.y), e.normal.z > 0 ? (t += e.normal.z * this.min.z, r += e.normal.z * this.max.z) : (t += e.normal.z * this.max.z, r += e.normal.z * this.min.z), t <= -e.constant && r >= -e.constant;
    }
    intersectsTriangle(e) {
      if (this.isEmpty()) return !1;
      this.getCenter(qn), Us.subVectors(this.max, qn), nn.subVectors(e.a, qn), sn.subVectors(e.b, qn), an.subVectors(e.c, qn), hi.subVectors(sn, nn), ui.subVectors(an, sn), zi.subVectors(nn, an);
      let t = [0, -hi.z, hi.y, 0, -ui.z, ui.y, 0, -zi.z, zi.y, hi.z, 0, -hi.x, ui.z, 0, -ui.x, zi.z, 0, -zi.x, -hi.y, hi.x, 0, -ui.y, ui.x, 0, -zi.y, zi.x, 0];
      return !Po(t, nn, sn, an, Us) || (t = [1, 0, 0, 0, 1, 0, 0, 0, 1], !Po(t, nn, sn, an, Us)) ? !1 : (Fs.crossVectors(hi, ui), t = [Fs.x, Fs.y, Fs.z], Po(t, nn, sn, an, Us));
    }
    clampPoint(e, t) {
      return t.copy(e).clamp(this.min, this.max);
    }
    distanceToPoint(e) {
      return this.clampPoint(e, Di).distanceTo(e);
    }
    getBoundingSphere(e) {
      return this.isEmpty() ? e.makeEmpty() : (this.getCenter(e.center), e.radius = this.getSize(Di).length() * 0.5), e;
    }
    intersect(e) {
      return this.min.max(e.min), this.max.min(e.max), this.isEmpty() && this.makeEmpty(), this;
    }
    union(e) {
      return this.min.min(e.min), this.max.max(e.max), this;
    }
    applyMatrix4(e) {
      return this.isEmpty() ? this : (Yr[0].set(this.min.x, this.min.y, this.min.z).applyMatrix4(e), Yr[1].set(this.min.x, this.min.y, this.max.z).applyMatrix4(e), Yr[2].set(this.min.x, this.max.y, this.min.z).applyMatrix4(e), Yr[3].set(this.min.x, this.max.y, this.max.z).applyMatrix4(e), Yr[4].set(this.max.x, this.min.y, this.min.z).applyMatrix4(e), Yr[5].set(this.max.x, this.min.y, this.max.z).applyMatrix4(e), Yr[6].set(this.max.x, this.max.y, this.min.z).applyMatrix4(e), Yr[7].set(this.max.x, this.max.y, this.max.z).applyMatrix4(e), this.setFromPoints(Yr), this);
    }
    translate(e) {
      return this.min.add(e), this.max.add(e), this;
    }
    equals(e) {
      return e.min.equals(this.min) && e.max.equals(this.max);
    }
  },
  Yr = [new C(), new C(), new C(), new C(), new C(), new C(), new C(), new C()],
  Di = new C(),
  Ro = new Zi(),
  nn = new C(),
  sn = new C(),
  an = new C(),
  hi = new C(),
  ui = new C(),
  zi = new C(),
  qn = new C(),
  Us = new C(),
  Fs = new C(),
  Ii = new C();
function Po(i, e, t, r, n) {
  for (let s = 0, o = i.length - 3; s <= o; s += 3) {
    Ii.fromArray(i, s);
    let a = n.x * Math.abs(Ii.x) + n.y * Math.abs(Ii.y) + n.z * Math.abs(Ii.z),
      l = e.dot(Ii),
      c = t.dot(Ii),
      h = r.dot(Ii);
    if (Math.max(-Math.max(l, c, h), Math.min(l, c, h)) > a) return !1;
  }
  return !0;
}
var yf = new Zi(),
  Xn = new C(),
  Lo = new C(),
  zn = class {
    constructor(e = new C(), t = -1) {
      this.center = e, this.radius = t;
    }
    set(e, t) {
      return this.center.copy(e), this.radius = t, this;
    }
    setFromPoints(e, t) {
      let r = this.center;
      t !== void 0 ? r.copy(t) : yf.setFromPoints(e).getCenter(r);
      let n = 0;
      for (let s = 0, o = e.length; s < o; s++) n = Math.max(n, r.distanceToSquared(e[s]));
      return this.radius = Math.sqrt(n), this;
    }
    copy(e) {
      return this.center.copy(e.center), this.radius = e.radius, this;
    }
    isEmpty() {
      return this.radius < 0;
    }
    makeEmpty() {
      return this.center.set(0, 0, 0), this.radius = -1, this;
    }
    containsPoint(e) {
      return e.distanceToSquared(this.center) <= this.radius * this.radius;
    }
    distanceToPoint(e) {
      return e.distanceTo(this.center) - this.radius;
    }
    intersectsSphere(e) {
      let t = this.radius + e.radius;
      return e.center.distanceToSquared(this.center) <= t * t;
    }
    intersectsBox(e) {
      return e.intersectsSphere(this);
    }
    intersectsPlane(e) {
      return Math.abs(e.distanceToPoint(this.center)) <= this.radius;
    }
    clampPoint(e, t) {
      let r = this.center.distanceToSquared(e);
      return t.copy(e), r > this.radius * this.radius && (t.sub(this.center).normalize(), t.multiplyScalar(this.radius).add(this.center)), t;
    }
    getBoundingBox(e) {
      return this.isEmpty() ? (e.makeEmpty(), e) : (e.set(this.center, this.center), e.expandByScalar(this.radius), e);
    }
    applyMatrix4(e) {
      return this.center.applyMatrix4(e), this.radius = this.radius * e.getMaxScaleOnAxis(), this;
    }
    translate(e) {
      return this.center.add(e), this;
    }
    expandByPoint(e) {
      if (this.isEmpty()) return this.center.copy(e), this.radius = 0, this;
      Xn.subVectors(e, this.center);
      let t = Xn.lengthSq();
      if (t > this.radius * this.radius) {
        let r = Math.sqrt(t),
          n = (r - this.radius) * 0.5;
        this.center.addScaledVector(Xn, n / r), this.radius += n;
      }
      return this;
    }
    union(e) {
      return e.isEmpty() ? this : this.isEmpty() ? (this.copy(e), this) : (this.center.equals(e.center) === !0 ? this.radius = Math.max(this.radius, e.radius) : (Lo.subVectors(e.center, this.center).setLength(e.radius), this.expandByPoint(Xn.copy(e.center).add(Lo)), this.expandByPoint(Xn.copy(e.center).sub(Lo))), this);
    }
    equals(e) {
      return e.center.equals(this.center) && e.radius === this.radius;
    }
    clone() {
      return new this.constructor().copy(this);
    }
  },
  Zr = new C(),
  Do = new C(),
  Bs = new C(),
  di = new C(),
  zo = new C(),
  Gs = new C(),
  Io = new C(),
  Ca = class {
    constructor(e = new C(), t = new C(0, 0, -1)) {
      this.origin = e, this.direction = t;
    }
    set(e, t) {
      return this.origin.copy(e), this.direction.copy(t), this;
    }
    copy(e) {
      return this.origin.copy(e.origin), this.direction.copy(e.direction), this;
    }
    at(e, t) {
      return t.copy(this.origin).addScaledVector(this.direction, e);
    }
    lookAt(e) {
      return this.direction.copy(e).sub(this.origin).normalize(), this;
    }
    recast(e) {
      return this.origin.copy(this.at(e, Zr)), this;
    }
    closestPointToPoint(e, t) {
      t.subVectors(e, this.origin);
      let r = t.dot(this.direction);
      return r < 0 ? t.copy(this.origin) : t.copy(this.origin).addScaledVector(this.direction, r);
    }
    distanceToPoint(e) {
      return Math.sqrt(this.distanceSqToPoint(e));
    }
    distanceSqToPoint(e) {
      let t = Zr.subVectors(e, this.origin).dot(this.direction);
      return t < 0 ? this.origin.distanceToSquared(e) : (Zr.copy(this.origin).addScaledVector(this.direction, t), Zr.distanceToSquared(e));
    }
    distanceSqToSegment(e, t, r, n) {
      Do.copy(e).add(t).multiplyScalar(0.5), Bs.copy(t).sub(e).normalize(), di.copy(this.origin).sub(Do);
      let s = e.distanceTo(t) * 0.5,
        o = -this.direction.dot(Bs),
        a = di.dot(this.direction),
        l = -di.dot(Bs),
        c = di.lengthSq(),
        h = Math.abs(1 - o * o),
        d,
        u,
        p,
        g;
      if (h > 0) {
        if (d = o * l - a, u = o * a - l, g = s * h, d >= 0) {
          if (u >= -g) {
            if (u <= g) {
              let f = 1 / h;
              d *= f, u *= f, p = d * (d + o * u + 2 * a) + u * (o * d + u + 2 * l) + c;
            } else u = s, d = Math.max(0, -(o * u + a)), p = -d * d + u * (u + 2 * l) + c;
          } else u = -s, d = Math.max(0, -(o * u + a)), p = -d * d + u * (u + 2 * l) + c;
        } else u <= -g ? (d = Math.max(0, -(-o * s + a)), u = d > 0 ? -s : Math.min(Math.max(-s, -l), s), p = -d * d + u * (u + 2 * l) + c) : u <= g ? (d = 0, u = Math.min(Math.max(-s, -l), s), p = u * (u + 2 * l) + c) : (d = Math.max(0, -(o * s + a)), u = d > 0 ? s : Math.min(Math.max(-s, -l), s), p = -d * d + u * (u + 2 * l) + c);
      } else u = o > 0 ? -s : s, d = Math.max(0, -(o * u + a)), p = -d * d + u * (u + 2 * l) + c;
      return r && r.copy(this.origin).addScaledVector(this.direction, d), n && n.copy(Do).addScaledVector(Bs, u), p;
    }
    intersectSphere(e, t) {
      Zr.subVectors(e.center, this.origin);
      let r = Zr.dot(this.direction),
        n = Zr.dot(Zr) - r * r,
        s = e.radius * e.radius;
      if (n > s) return null;
      let o = Math.sqrt(s - n),
        a = r - o,
        l = r + o;
      return l < 0 ? null : a < 0 ? this.at(l, t) : this.at(a, t);
    }
    intersectsSphere(e) {
      return this.distanceSqToPoint(e.center) <= e.radius * e.radius;
    }
    distanceToPlane(e) {
      let t = e.normal.dot(this.direction);
      if (t === 0) return e.distanceToPoint(this.origin) === 0 ? 0 : null;
      let r = -(this.origin.dot(e.normal) + e.constant) / t;
      return r >= 0 ? r : null;
    }
    intersectPlane(e, t) {
      let r = this.distanceToPlane(e);
      return r === null ? null : this.at(r, t);
    }
    intersectsPlane(e) {
      let t = e.distanceToPoint(this.origin);
      return t === 0 || e.normal.dot(this.direction) * t < 0;
    }
    intersectBox(e, t) {
      let r,
        n,
        s,
        o,
        a,
        l,
        c = 1 / this.direction.x,
        h = 1 / this.direction.y,
        d = 1 / this.direction.z,
        u = this.origin;
      return c >= 0 ? (r = (e.min.x - u.x) * c, n = (e.max.x - u.x) * c) : (r = (e.max.x - u.x) * c, n = (e.min.x - u.x) * c), h >= 0 ? (s = (e.min.y - u.y) * h, o = (e.max.y - u.y) * h) : (s = (e.max.y - u.y) * h, o = (e.min.y - u.y) * h), r > o || s > n || ((s > r || isNaN(r)) && (r = s), (o < n || isNaN(n)) && (n = o), d >= 0 ? (a = (e.min.z - u.z) * d, l = (e.max.z - u.z) * d) : (a = (e.max.z - u.z) * d, l = (e.min.z - u.z) * d), r > l || a > n) || ((a > r || r !== r) && (r = a), (l < n || n !== n) && (n = l), n < 0) ? null : this.at(r >= 0 ? r : n, t);
    }
    intersectsBox(e) {
      return this.intersectBox(e, Zr) !== null;
    }
    intersectTriangle(e, t, r, n, s) {
      zo.subVectors(t, e), Gs.subVectors(r, e), Io.crossVectors(zo, Gs);
      let o = this.direction.dot(Io),
        a;
      if (o > 0) {
        if (n) return null;
        a = 1;
      } else if (o < 0) a = -1, o = -o;else return null;
      di.subVectors(this.origin, e);
      let l = a * this.direction.dot(Gs.crossVectors(di, Gs));
      if (l < 0) return null;
      let c = a * this.direction.dot(zo.cross(di));
      if (c < 0 || l + c > o) return null;
      let h = -a * di.dot(Io);
      return h < 0 ? null : this.at(h / o, s);
    }
    applyMatrix4(e) {
      return this.origin.applyMatrix4(e), this.direction.transformDirection(e), this;
    }
    equals(e) {
      return e.origin.equals(this.origin) && e.direction.equals(this.direction);
    }
    clone() {
      return new this.constructor().copy(this);
    }
  },
  at = class i {
    constructor() {
      i.prototype.isMatrix4 = !0, this.elements = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
    }
    set(e, t, r, n, s, o, a, l, c, h, d, u, p, g, f, m) {
      let v = this.elements;
      return v[0] = e, v[4] = t, v[8] = r, v[12] = n, v[1] = s, v[5] = o, v[9] = a, v[13] = l, v[2] = c, v[6] = h, v[10] = d, v[14] = u, v[3] = p, v[7] = g, v[11] = f, v[15] = m, this;
    }
    identity() {
      return this.set(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1), this;
    }
    clone() {
      return new i().fromArray(this.elements);
    }
    copy(e) {
      let t = this.elements,
        r = e.elements;
      return t[0] = r[0], t[1] = r[1], t[2] = r[2], t[3] = r[3], t[4] = r[4], t[5] = r[5], t[6] = r[6], t[7] = r[7], t[8] = r[8], t[9] = r[9], t[10] = r[10], t[11] = r[11], t[12] = r[12], t[13] = r[13], t[14] = r[14], t[15] = r[15], this;
    }
    copyPosition(e) {
      let t = this.elements,
        r = e.elements;
      return t[12] = r[12], t[13] = r[13], t[14] = r[14], this;
    }
    setFromMatrix3(e) {
      let t = e.elements;
      return this.set(t[0], t[3], t[6], 0, t[1], t[4], t[7], 0, t[2], t[5], t[8], 0, 0, 0, 0, 1), this;
    }
    extractBasis(e, t, r) {
      return e.setFromMatrixColumn(this, 0), t.setFromMatrixColumn(this, 1), r.setFromMatrixColumn(this, 2), this;
    }
    makeBasis(e, t, r) {
      return this.set(e.x, t.x, r.x, 0, e.y, t.y, r.y, 0, e.z, t.z, r.z, 0, 0, 0, 0, 1), this;
    }
    extractRotation(e) {
      let t = this.elements,
        r = e.elements,
        n = 1 / on.setFromMatrixColumn(e, 0).length(),
        s = 1 / on.setFromMatrixColumn(e, 1).length(),
        o = 1 / on.setFromMatrixColumn(e, 2).length();
      return t[0] = r[0] * n, t[1] = r[1] * n, t[2] = r[2] * n, t[3] = 0, t[4] = r[4] * s, t[5] = r[5] * s, t[6] = r[6] * s, t[7] = 0, t[8] = r[8] * o, t[9] = r[9] * o, t[10] = r[10] * o, t[11] = 0, t[12] = 0, t[13] = 0, t[14] = 0, t[15] = 1, this;
    }
    makeRotationFromEuler(e) {
      let t = this.elements,
        r = e.x,
        n = e.y,
        s = e.z,
        o = Math.cos(r),
        a = Math.sin(r),
        l = Math.cos(n),
        c = Math.sin(n),
        h = Math.cos(s),
        d = Math.sin(s);
      if (e.order === "XYZ") {
        let u = o * h,
          p = o * d,
          g = a * h,
          f = a * d;
        t[0] = l * h, t[4] = -l * d, t[8] = c, t[1] = p + g * c, t[5] = u - f * c, t[9] = -a * l, t[2] = f - u * c, t[6] = g + p * c, t[10] = o * l;
      } else if (e.order === "YXZ") {
        let u = l * h,
          p = l * d,
          g = c * h,
          f = c * d;
        t[0] = u + f * a, t[4] = g * a - p, t[8] = o * c, t[1] = o * d, t[5] = o * h, t[9] = -a, t[2] = p * a - g, t[6] = f + u * a, t[10] = o * l;
      } else if (e.order === "ZXY") {
        let u = l * h,
          p = l * d,
          g = c * h,
          f = c * d;
        t[0] = u - f * a, t[4] = -o * d, t[8] = g + p * a, t[1] = p + g * a, t[5] = o * h, t[9] = f - u * a, t[2] = -o * c, t[6] = a, t[10] = o * l;
      } else if (e.order === "ZYX") {
        let u = o * h,
          p = o * d,
          g = a * h,
          f = a * d;
        t[0] = l * h, t[4] = g * c - p, t[8] = u * c + f, t[1] = l * d, t[5] = f * c + u, t[9] = p * c - g, t[2] = -c, t[6] = a * l, t[10] = o * l;
      } else if (e.order === "YZX") {
        let u = o * l,
          p = o * c,
          g = a * l,
          f = a * c;
        t[0] = l * h, t[4] = f - u * d, t[8] = g * d + p, t[1] = d, t[5] = o * h, t[9] = -a * h, t[2] = -c * h, t[6] = p * d + g, t[10] = u - f * d;
      } else if (e.order === "XZY") {
        let u = o * l,
          p = o * c,
          g = a * l,
          f = a * c;
        t[0] = l * h, t[4] = -d, t[8] = c * h, t[1] = u * d + f, t[5] = o * h, t[9] = p * d - g, t[2] = g * d - p, t[6] = a * h, t[10] = f * d + u;
      }
      return t[3] = 0, t[7] = 0, t[11] = 0, t[12] = 0, t[13] = 0, t[14] = 0, t[15] = 1, this;
    }
    makeRotationFromQuaternion(e) {
      return this.compose(bf, e, Mf);
    }
    lookAt(e, t, r) {
      let n = this.elements;
      return nr.subVectors(e, t), nr.lengthSq() === 0 && (nr.z = 1), nr.normalize(), pi.crossVectors(r, nr), pi.lengthSq() === 0 && (Math.abs(r.z) === 1 ? nr.x += 1e-4 : nr.z += 1e-4, nr.normalize(), pi.crossVectors(r, nr)), pi.normalize(), Vs.crossVectors(nr, pi), n[0] = pi.x, n[4] = Vs.x, n[8] = nr.x, n[1] = pi.y, n[5] = Vs.y, n[9] = nr.y, n[2] = pi.z, n[6] = Vs.z, n[10] = nr.z, this;
    }
    multiply(e) {
      return this.multiplyMatrices(this, e);
    }
    premultiply(e) {
      return this.multiplyMatrices(e, this);
    }
    multiplyMatrices(e, t) {
      let r = e.elements,
        n = t.elements,
        s = this.elements,
        o = r[0],
        a = r[4],
        l = r[8],
        c = r[12],
        h = r[1],
        d = r[5],
        u = r[9],
        p = r[13],
        g = r[2],
        f = r[6],
        m = r[10],
        v = r[14],
        y = r[3],
        x = r[7],
        b = r[11],
        w = r[15],
        A = n[0],
        L = n[4],
        M = n[8],
        T = n[12],
        R = n[1],
        H = n[5],
        Z = n[9],
        O = n[13],
        z = n[2],
        j = n[6],
        ie = n[10],
        oe = n[14],
        $ = n[3],
        ae = n[7],
        te = n[11],
        be = n[15];
      return s[0] = o * A + a * R + l * z + c * $, s[4] = o * L + a * H + l * j + c * ae, s[8] = o * M + a * Z + l * ie + c * te, s[12] = o * T + a * O + l * oe + c * be, s[1] = h * A + d * R + u * z + p * $, s[5] = h * L + d * H + u * j + p * ae, s[9] = h * M + d * Z + u * ie + p * te, s[13] = h * T + d * O + u * oe + p * be, s[2] = g * A + f * R + m * z + v * $, s[6] = g * L + f * H + m * j + v * ae, s[10] = g * M + f * Z + m * ie + v * te, s[14] = g * T + f * O + m * oe + v * be, s[3] = y * A + x * R + b * z + w * $, s[7] = y * L + x * H + b * j + w * ae, s[11] = y * M + x * Z + b * ie + w * te, s[15] = y * T + x * O + b * oe + w * be, this;
    }
    multiplyScalar(e) {
      let t = this.elements;
      return t[0] *= e, t[4] *= e, t[8] *= e, t[12] *= e, t[1] *= e, t[5] *= e, t[9] *= e, t[13] *= e, t[2] *= e, t[6] *= e, t[10] *= e, t[14] *= e, t[3] *= e, t[7] *= e, t[11] *= e, t[15] *= e, this;
    }
    determinant() {
      let e = this.elements,
        t = e[0],
        r = e[4],
        n = e[8],
        s = e[12],
        o = e[1],
        a = e[5],
        l = e[9],
        c = e[13],
        h = e[2],
        d = e[6],
        u = e[10],
        p = e[14],
        g = e[3],
        f = e[7],
        m = e[11],
        v = e[15];
      return g * (+s * l * d - n * c * d - s * a * u + r * c * u + n * a * p - r * l * p) + f * (+t * l * p - t * c * u + s * o * u - n * o * p + n * c * h - s * l * h) + m * (+t * c * d - t * a * p - s * o * d + r * o * p + s * a * h - r * c * h) + v * (-n * a * h - t * l * d + t * a * u + n * o * d - r * o * u + r * l * h);
    }
    transpose() {
      let e = this.elements,
        t;
      return t = e[1], e[1] = e[4], e[4] = t, t = e[2], e[2] = e[8], e[8] = t, t = e[6], e[6] = e[9], e[9] = t, t = e[3], e[3] = e[12], e[12] = t, t = e[7], e[7] = e[13], e[13] = t, t = e[11], e[11] = e[14], e[14] = t, this;
    }
    setPosition(e, t, r) {
      let n = this.elements;
      return e.isVector3 ? (n[12] = e.x, n[13] = e.y, n[14] = e.z) : (n[12] = e, n[13] = t, n[14] = r), this;
    }
    invert() {
      let e = this.elements,
        t = e[0],
        r = e[1],
        n = e[2],
        s = e[3],
        o = e[4],
        a = e[5],
        l = e[6],
        c = e[7],
        h = e[8],
        d = e[9],
        u = e[10],
        p = e[11],
        g = e[12],
        f = e[13],
        m = e[14],
        v = e[15],
        y = d * m * c - f * u * c + f * l * p - a * m * p - d * l * v + a * u * v,
        x = g * u * c - h * m * c - g * l * p + o * m * p + h * l * v - o * u * v,
        b = h * f * c - g * d * c + g * a * p - o * f * p - h * a * v + o * d * v,
        w = g * d * l - h * f * l - g * a * u + o * f * u + h * a * m - o * d * m,
        A = t * y + r * x + n * b + s * w;
      if (A === 0) return this.set(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
      let L = 1 / A;
      return e[0] = y * L, e[1] = (f * u * s - d * m * s - f * n * p + r * m * p + d * n * v - r * u * v) * L, e[2] = (a * m * s - f * l * s + f * n * c - r * m * c - a * n * v + r * l * v) * L, e[3] = (d * l * s - a * u * s - d * n * c + r * u * c + a * n * p - r * l * p) * L, e[4] = x * L, e[5] = (h * m * s - g * u * s + g * n * p - t * m * p - h * n * v + t * u * v) * L, e[6] = (g * l * s - o * m * s - g * n * c + t * m * c + o * n * v - t * l * v) * L, e[7] = (o * u * s - h * l * s + h * n * c - t * u * c - o * n * p + t * l * p) * L, e[8] = b * L, e[9] = (g * d * s - h * f * s - g * r * p + t * f * p + h * r * v - t * d * v) * L, e[10] = (o * f * s - g * a * s + g * r * c - t * f * c - o * r * v + t * a * v) * L, e[11] = (h * a * s - o * d * s - h * r * c + t * d * c + o * r * p - t * a * p) * L, e[12] = w * L, e[13] = (h * f * n - g * d * n + g * r * u - t * f * u - h * r * m + t * d * m) * L, e[14] = (g * a * n - o * f * n - g * r * l + t * f * l + o * r * m - t * a * m) * L, e[15] = (o * d * n - h * a * n + h * r * l - t * d * l - o * r * u + t * a * u) * L, this;
    }
    scale(e) {
      let t = this.elements,
        r = e.x,
        n = e.y,
        s = e.z;
      return t[0] *= r, t[4] *= n, t[8] *= s, t[1] *= r, t[5] *= n, t[9] *= s, t[2] *= r, t[6] *= n, t[10] *= s, t[3] *= r, t[7] *= n, t[11] *= s, this;
    }
    getMaxScaleOnAxis() {
      let e = this.elements,
        t = e[0] * e[0] + e[1] * e[1] + e[2] * e[2],
        r = e[4] * e[4] + e[5] * e[5] + e[6] * e[6],
        n = e[8] * e[8] + e[9] * e[9] + e[10] * e[10];
      return Math.sqrt(Math.max(t, r, n));
    }
    makeTranslation(e, t, r) {
      return this.set(1, 0, 0, e, 0, 1, 0, t, 0, 0, 1, r, 0, 0, 0, 1), this;
    }
    makeRotationX(e) {
      let t = Math.cos(e),
        r = Math.sin(e);
      return this.set(1, 0, 0, 0, 0, t, -r, 0, 0, r, t, 0, 0, 0, 0, 1), this;
    }
    makeRotationY(e) {
      let t = Math.cos(e),
        r = Math.sin(e);
      return this.set(t, 0, r, 0, 0, 1, 0, 0, -r, 0, t, 0, 0, 0, 0, 1), this;
    }
    makeRotationZ(e) {
      let t = Math.cos(e),
        r = Math.sin(e);
      return this.set(t, -r, 0, 0, r, t, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1), this;
    }
    makeRotationAxis(e, t) {
      let r = Math.cos(t),
        n = Math.sin(t),
        s = 1 - r,
        o = e.x,
        a = e.y,
        l = e.z,
        c = s * o,
        h = s * a;
      return this.set(c * o + r, c * a - n * l, c * l + n * a, 0, c * a + n * l, h * a + r, h * l - n * o, 0, c * l - n * a, h * l + n * o, s * l * l + r, 0, 0, 0, 0, 1), this;
    }
    makeScale(e, t, r) {
      return this.set(e, 0, 0, 0, 0, t, 0, 0, 0, 0, r, 0, 0, 0, 0, 1), this;
    }
    makeShear(e, t, r, n, s, o) {
      return this.set(1, r, s, 0, e, 1, o, 0, t, n, 1, 0, 0, 0, 0, 1), this;
    }
    compose(e, t, r) {
      let n = this.elements,
        s = t._x,
        o = t._y,
        a = t._z,
        l = t._w,
        c = s + s,
        h = o + o,
        d = a + a,
        u = s * c,
        p = s * h,
        g = s * d,
        f = o * h,
        m = o * d,
        v = a * d,
        y = l * c,
        x = l * h,
        b = l * d,
        w = r.x,
        A = r.y,
        L = r.z;
      return n[0] = (1 - (f + v)) * w, n[1] = (p + b) * w, n[2] = (g - x) * w, n[3] = 0, n[4] = (p - b) * A, n[5] = (1 - (u + v)) * A, n[6] = (m + y) * A, n[7] = 0, n[8] = (g + x) * L, n[9] = (m - y) * L, n[10] = (1 - (u + f)) * L, n[11] = 0, n[12] = e.x, n[13] = e.y, n[14] = e.z, n[15] = 1, this;
    }
    decompose(e, t, r) {
      let n = this.elements,
        s = on.set(n[0], n[1], n[2]).length(),
        o = on.set(n[4], n[5], n[6]).length(),
        a = on.set(n[8], n[9], n[10]).length();
      this.determinant() < 0 && (s = -s), e.x = n[12], e.y = n[13], e.z = n[14], br.copy(this);
      let l = 1 / s,
        c = 1 / o,
        h = 1 / a;
      return br.elements[0] *= l, br.elements[1] *= l, br.elements[2] *= l, br.elements[4] *= c, br.elements[5] *= c, br.elements[6] *= c, br.elements[8] *= h, br.elements[9] *= h, br.elements[10] *= h, t.setFromRotationMatrix(br), r.x = s, r.y = o, r.z = a, this;
    }
    makePerspective(e, t, r, n, s, o) {
      let a = this.elements,
        l = 2 * s / (t - e),
        c = 2 * s / (r - n),
        h = (t + e) / (t - e),
        d = (r + n) / (r - n),
        u = -(o + s) / (o - s),
        p = -2 * o * s / (o - s);
      return a[0] = l, a[4] = 0, a[8] = h, a[12] = 0, a[1] = 0, a[5] = c, a[9] = d, a[13] = 0, a[2] = 0, a[6] = 0, a[10] = u, a[14] = p, a[3] = 0, a[7] = 0, a[11] = -1, a[15] = 0, this;
    }
    makeOrthographic(e, t, r, n, s, o) {
      let a = this.elements,
        l = 1 / (t - e),
        c = 1 / (r - n),
        h = 1 / (o - s),
        d = (t + e) * l,
        u = (r + n) * c,
        p = (o + s) * h;
      return a[0] = 2 * l, a[4] = 0, a[8] = 0, a[12] = -d, a[1] = 0, a[5] = 2 * c, a[9] = 0, a[13] = -u, a[2] = 0, a[6] = 0, a[10] = -2 * h, a[14] = -p, a[3] = 0, a[7] = 0, a[11] = 0, a[15] = 1, this;
    }
    equals(e) {
      let t = this.elements,
        r = e.elements;
      for (let n = 0; n < 16; n++) if (t[n] !== r[n]) return !1;
      return !0;
    }
    fromArray(e, t = 0) {
      for (let r = 0; r < 16; r++) this.elements[r] = e[r + t];
      return this;
    }
    toArray(e = [], t = 0) {
      let r = this.elements;
      return e[t] = r[0], e[t + 1] = r[1], e[t + 2] = r[2], e[t + 3] = r[3], e[t + 4] = r[4], e[t + 5] = r[5], e[t + 6] = r[6], e[t + 7] = r[7], e[t + 8] = r[8], e[t + 9] = r[9], e[t + 10] = r[10], e[t + 11] = r[11], e[t + 12] = r[12], e[t + 13] = r[13], e[t + 14] = r[14], e[t + 15] = r[15], e;
    }
  },
  on = new C(),
  br = new at(),
  bf = new C(0, 0, 0),
  Mf = new C(1, 1, 1),
  pi = new C(),
  Vs = new C(),
  nr = new C(),
  mh = new at(),
  gh = new Ti(),
  Ra = class i {
    constructor(e = 0, t = 0, r = 0, n = i.DEFAULT_ORDER) {
      this.isEuler = !0, this._x = e, this._y = t, this._z = r, this._order = n;
    }
    get x() {
      return this._x;
    }
    set x(e) {
      this._x = e, this._onChangeCallback();
    }
    get y() {
      return this._y;
    }
    set y(e) {
      this._y = e, this._onChangeCallback();
    }
    get z() {
      return this._z;
    }
    set z(e) {
      this._z = e, this._onChangeCallback();
    }
    get order() {
      return this._order;
    }
    set order(e) {
      this._order = e, this._onChangeCallback();
    }
    set(e, t, r, n = this._order) {
      return this._x = e, this._y = t, this._z = r, this._order = n, this._onChangeCallback(), this;
    }
    clone() {
      return new this.constructor(this._x, this._y, this._z, this._order);
    }
    copy(e) {
      return this._x = e._x, this._y = e._y, this._z = e._z, this._order = e._order, this._onChangeCallback(), this;
    }
    setFromRotationMatrix(e, t = this._order, r = !0) {
      let n = e.elements,
        s = n[0],
        o = n[4],
        a = n[8],
        l = n[1],
        c = n[5],
        h = n[9],
        d = n[2],
        u = n[6],
        p = n[10];
      switch (t) {
        case "XYZ":
          this._y = Math.asin(Vt(a, -1, 1)), Math.abs(a) < 0.9999999 ? (this._x = Math.atan2(-h, p), this._z = Math.atan2(-o, s)) : (this._x = Math.atan2(u, c), this._z = 0);
          break;
        case "YXZ":
          this._x = Math.asin(-Vt(h, -1, 1)), Math.abs(h) < 0.9999999 ? (this._y = Math.atan2(a, p), this._z = Math.atan2(l, c)) : (this._y = Math.atan2(-d, s), this._z = 0);
          break;
        case "ZXY":
          this._x = Math.asin(Vt(u, -1, 1)), Math.abs(u) < 0.9999999 ? (this._y = Math.atan2(-d, p), this._z = Math.atan2(-o, c)) : (this._y = 0, this._z = Math.atan2(l, s));
          break;
        case "ZYX":
          this._y = Math.asin(-Vt(d, -1, 1)), Math.abs(d) < 0.9999999 ? (this._x = Math.atan2(u, p), this._z = Math.atan2(l, s)) : (this._x = 0, this._z = Math.atan2(-o, c));
          break;
        case "YZX":
          this._z = Math.asin(Vt(l, -1, 1)), Math.abs(l) < 0.9999999 ? (this._x = Math.atan2(-h, c), this._y = Math.atan2(-d, s)) : (this._x = 0, this._y = Math.atan2(a, p));
          break;
        case "XZY":
          this._z = Math.asin(-Vt(o, -1, 1)), Math.abs(o) < 0.9999999 ? (this._x = Math.atan2(u, c), this._y = Math.atan2(a, s)) : (this._x = Math.atan2(-h, p), this._y = 0);
          break;
        default:
          console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: " + t);
      }
      return this._order = t, r === !0 && this._onChangeCallback(), this;
    }
    setFromQuaternion(e, t, r) {
      return mh.makeRotationFromQuaternion(e), this.setFromRotationMatrix(mh, t, r);
    }
    setFromVector3(e, t = this._order) {
      return this.set(e.x, e.y, e.z, t);
    }
    reorder(e) {
      return gh.setFromEuler(this), this.setFromQuaternion(gh, e);
    }
    equals(e) {
      return e._x === this._x && e._y === this._y && e._z === this._z && e._order === this._order;
    }
    fromArray(e) {
      return this._x = e[0], this._y = e[1], this._z = e[2], e[3] !== void 0 && (this._order = e[3]), this._onChangeCallback(), this;
    }
    toArray(e = [], t = 0) {
      return e[t] = this._x, e[t + 1] = this._y, e[t + 2] = this._z, e[t + 3] = this._order, e;
    }
    _onChange(e) {
      return this._onChangeCallback = e, this;
    }
    _onChangeCallback() {}
    *[Symbol.iterator]() {
      yield this._x, yield this._y, yield this._z, yield this._order;
    }
  };
Ra.DEFAULT_ORDER = "XYZ";
var Pa = class {
    constructor() {
      this.mask = 1;
    }
    set(e) {
      this.mask = (1 << e | 0) >>> 0;
    }
    enable(e) {
      this.mask |= 1 << e | 0;
    }
    enableAll() {
      this.mask = -1;
    }
    toggle(e) {
      this.mask ^= 1 << e | 0;
    }
    disable(e) {
      this.mask &= ~(1 << e | 0);
    }
    disableAll() {
      this.mask = 0;
    }
    test(e) {
      return (this.mask & e.mask) !== 0;
    }
    isEnabled(e) {
      return (this.mask & (1 << e | 0)) !== 0;
    }
  },
  Sf = 0,
  vh = new C(),
  cn = new Ti(),
  Jr = new at(),
  Ws = new C(),
  Yn = new C(),
  wf = new C(),
  _f = new Ti(),
  xh = new C(1, 0, 0),
  yh = new C(0, 1, 0),
  bh = new C(0, 0, 1),
  Tf = {
    type: "added"
  },
  Mh = {
    type: "removed"
  },
  kt = class i extends _i {
    constructor() {
      super(), this.isObject3D = !0, Object.defineProperty(this, "id", {
        value: Sf++
      }), this.uuid = ii(), this.name = "", this.type = "Object3D", this.parent = null, this.children = [], this.up = i.DEFAULT_UP.clone();
      let e = new C(),
        t = new Ra(),
        r = new Ti(),
        n = new C(1, 1, 1);
      function s() {
        r.setFromEuler(t, !1);
      }
      function o() {
        t.setFromQuaternion(r, void 0, !1);
      }
      t._onChange(s), r._onChange(o), Object.defineProperties(this, {
        position: {
          configurable: !0,
          enumerable: !0,
          value: e
        },
        rotation: {
          configurable: !0,
          enumerable: !0,
          value: t
        },
        quaternion: {
          configurable: !0,
          enumerable: !0,
          value: r
        },
        scale: {
          configurable: !0,
          enumerable: !0,
          value: n
        },
        modelViewMatrix: {
          value: new at()
        },
        normalMatrix: {
          value: new Kt()
        }
      }), this.matrix = new at(), this.matrixWorld = new at(), this.matrixAutoUpdate = i.DEFAULT_MATRIX_AUTO_UPDATE, this.matrixWorldNeedsUpdate = !1, this.matrixWorldAutoUpdate = i.DEFAULT_MATRIX_WORLD_AUTO_UPDATE, this.layers = new Pa(), this.visible = !0, this.castShadow = !1, this.receiveShadow = !1, this.frustumCulled = !0, this.renderOrder = 0, this.animations = [], this.userData = {};
    }
    onBeforeRender() {}
    onAfterRender() {}
    applyMatrix4(e) {
      this.matrixAutoUpdate && this.updateMatrix(), this.matrix.premultiply(e), this.matrix.decompose(this.position, this.quaternion, this.scale);
    }
    applyQuaternion(e) {
      return this.quaternion.premultiply(e), this;
    }
    setRotationFromAxisAngle(e, t) {
      this.quaternion.setFromAxisAngle(e, t);
    }
    setRotationFromEuler(e) {
      this.quaternion.setFromEuler(e, !0);
    }
    setRotationFromMatrix(e) {
      this.quaternion.setFromRotationMatrix(e);
    }
    setRotationFromQuaternion(e) {
      this.quaternion.copy(e);
    }
    rotateOnAxis(e, t) {
      return cn.setFromAxisAngle(e, t), this.quaternion.multiply(cn), this;
    }
    rotateOnWorldAxis(e, t) {
      return cn.setFromAxisAngle(e, t), this.quaternion.premultiply(cn), this;
    }
    rotateX(e) {
      return this.rotateOnAxis(xh, e);
    }
    rotateY(e) {
      return this.rotateOnAxis(yh, e);
    }
    rotateZ(e) {
      return this.rotateOnAxis(bh, e);
    }
    translateOnAxis(e, t) {
      return vh.copy(e).applyQuaternion(this.quaternion), this.position.add(vh.multiplyScalar(t)), this;
    }
    translateX(e) {
      return this.translateOnAxis(xh, e);
    }
    translateY(e) {
      return this.translateOnAxis(yh, e);
    }
    translateZ(e) {
      return this.translateOnAxis(bh, e);
    }
    localToWorld(e) {
      return this.updateWorldMatrix(!0, !1), e.applyMatrix4(this.matrixWorld);
    }
    worldToLocal(e) {
      return this.updateWorldMatrix(!0, !1), e.applyMatrix4(Jr.copy(this.matrixWorld).invert());
    }
    lookAt(e, t, r) {
      e.isVector3 ? Ws.copy(e) : Ws.set(e, t, r);
      let n = this.parent;
      this.updateWorldMatrix(!0, !1), Yn.setFromMatrixPosition(this.matrixWorld), this.isCamera || this.isLight ? Jr.lookAt(Yn, Ws, this.up) : Jr.lookAt(Ws, Yn, this.up), this.quaternion.setFromRotationMatrix(Jr), n && (Jr.extractRotation(n.matrixWorld), cn.setFromRotationMatrix(Jr), this.quaternion.premultiply(cn.invert()));
    }
    add(e) {
      if (arguments.length > 1) {
        for (let t = 0; t < arguments.length; t++) this.add(arguments[t]);
        return this;
      }
      return e === this ? (console.error("THREE.Object3D.add: object can't be added as a child of itself.", e), this) : (e && e.isObject3D ? (e.parent !== null && e.parent.remove(e), e.parent = this, this.children.push(e), e.dispatchEvent(Tf)) : console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.", e), this);
    }
    remove(e) {
      if (arguments.length > 1) {
        for (let r = 0; r < arguments.length; r++) this.remove(arguments[r]);
        return this;
      }
      let t = this.children.indexOf(e);
      return t !== -1 && (e.parent = null, this.children.splice(t, 1), e.dispatchEvent(Mh)), this;
    }
    removeFromParent() {
      let e = this.parent;
      return e !== null && e.remove(this), this;
    }
    clear() {
      for (let e = 0; e < this.children.length; e++) {
        let t = this.children[e];
        t.parent = null, t.dispatchEvent(Mh);
      }
      return this.children.length = 0, this;
    }
    attach(e) {
      return this.updateWorldMatrix(!0, !1), Jr.copy(this.matrixWorld).invert(), e.parent !== null && (e.parent.updateWorldMatrix(!0, !1), Jr.multiply(e.parent.matrixWorld)), e.applyMatrix4(Jr), this.add(e), e.updateWorldMatrix(!1, !0), this;
    }
    getObjectById(e) {
      return this.getObjectByProperty("id", e);
    }
    getObjectByName(e) {
      return this.getObjectByProperty("name", e);
    }
    getObjectByProperty(e, t) {
      if (this[e] === t) return this;
      for (let r = 0, n = this.children.length; r < n; r++) {
        let s = this.children[r].getObjectByProperty(e, t);
        if (s !== void 0) return s;
      }
    }
    getObjectsByProperty(e, t) {
      let r = [];
      this[e] === t && r.push(this);
      for (let n = 0, s = this.children.length; n < s; n++) {
        let o = this.children[n].getObjectsByProperty(e, t);
        o.length > 0 && (r = r.concat(o));
      }
      return r;
    }
    getWorldPosition(e) {
      return this.updateWorldMatrix(!0, !1), e.setFromMatrixPosition(this.matrixWorld);
    }
    getWorldQuaternion(e) {
      return this.updateWorldMatrix(!0, !1), this.matrixWorld.decompose(Yn, e, wf), e;
    }
    getWorldScale(e) {
      return this.updateWorldMatrix(!0, !1), this.matrixWorld.decompose(Yn, _f, e), e;
    }
    getWorldDirection(e) {
      this.updateWorldMatrix(!0, !1);
      let t = this.matrixWorld.elements;
      return e.set(t[8], t[9], t[10]).normalize();
    }
    raycast() {}
    traverse(e) {
      e(this);
      let t = this.children;
      for (let r = 0, n = t.length; r < n; r++) t[r].traverse(e);
    }
    traverseVisible(e) {
      if (this.visible === !1) return;
      e(this);
      let t = this.children;
      for (let r = 0, n = t.length; r < n; r++) t[r].traverseVisible(e);
    }
    traverseAncestors(e) {
      let t = this.parent;
      t !== null && (e(t), t.traverseAncestors(e));
    }
    updateMatrix() {
      this.matrix.compose(this.position, this.quaternion, this.scale), this.matrixWorldNeedsUpdate = !0;
    }
    updateMatrixWorld(e) {
      this.matrixAutoUpdate && this.updateMatrix(), (this.matrixWorldNeedsUpdate || e) && (this.parent === null ? this.matrixWorld.copy(this.matrix) : this.matrixWorld.multiplyMatrices(this.parent.matrixWorld, this.matrix), this.matrixWorldNeedsUpdate = !1, e = !0);
      let t = this.children;
      for (let r = 0, n = t.length; r < n; r++) {
        let s = t[r];
        (s.matrixWorldAutoUpdate === !0 || e === !0) && s.updateMatrixWorld(e);
      }
    }
    updateWorldMatrix(e, t) {
      let r = this.parent;
      if (e === !0 && r !== null && r.matrixWorldAutoUpdate === !0 && r.updateWorldMatrix(!0, !1), this.matrixAutoUpdate && this.updateMatrix(), this.parent === null ? this.matrixWorld.copy(this.matrix) : this.matrixWorld.multiplyMatrices(this.parent.matrixWorld, this.matrix), t === !0) {
        let n = this.children;
        for (let s = 0, o = n.length; s < o; s++) {
          let a = n[s];
          a.matrixWorldAutoUpdate === !0 && a.updateWorldMatrix(!1, !0);
        }
      }
    }
    toJSON(e) {
      let t = e === void 0 || typeof e == "string",
        r = {};
      t && (e = {
        geometries: {},
        materials: {},
        textures: {},
        images: {},
        shapes: {},
        skeletons: {},
        animations: {},
        nodes: {}
      }, r.metadata = {
        version: 4.5,
        type: "Object",
        generator: "Object3D.toJSON"
      });
      let n = {};
      n.uuid = this.uuid, n.type = this.type, this.name !== "" && (n.name = this.name), this.castShadow === !0 && (n.castShadow = !0), this.receiveShadow === !0 && (n.receiveShadow = !0), this.visible === !1 && (n.visible = !1), this.frustumCulled === !1 && (n.frustumCulled = !1), this.renderOrder !== 0 && (n.renderOrder = this.renderOrder), Object.keys(this.userData).length > 0 && (n.userData = this.userData), n.layers = this.layers.mask, n.matrix = this.matrix.toArray(), this.matrixAutoUpdate === !1 && (n.matrixAutoUpdate = !1), this.isInstancedMesh && (n.type = "InstancedMesh", n.count = this.count, n.instanceMatrix = this.instanceMatrix.toJSON(), this.instanceColor !== null && (n.instanceColor = this.instanceColor.toJSON()));
      function s(a, l) {
        return a[l.uuid] === void 0 && (a[l.uuid] = l.toJSON(e)), l.uuid;
      }
      if (this.isScene) this.background && (this.background.isColor ? n.background = this.background.toJSON() : this.background.isTexture && (n.background = this.background.toJSON(e).uuid)), this.environment && this.environment.isTexture && this.environment.isRenderTargetTexture !== !0 && (n.environment = this.environment.toJSON(e).uuid);else if (this.isMesh || this.isLine || this.isPoints) {
        n.geometry = s(e.geometries, this.geometry);
        let a = this.geometry.parameters;
        if (a !== void 0 && a.shapes !== void 0) {
          let l = a.shapes;
          if (Array.isArray(l)) for (let c = 0, h = l.length; c < h; c++) {
            let d = l[c];
            s(e.shapes, d);
          } else s(e.shapes, l);
        }
      }
      if (this.isSkinnedMesh && (n.bindMode = this.bindMode, n.bindMatrix = this.bindMatrix.toArray(), this.skeleton !== void 0 && (s(e.skeletons, this.skeleton), n.skeleton = this.skeleton.uuid)), this.material !== void 0) if (Array.isArray(this.material)) {
        let a = [];
        for (let l = 0, c = this.material.length; l < c; l++) a.push(s(e.materials, this.material[l]));
        n.material = a;
      } else n.material = s(e.materials, this.material);
      if (this.children.length > 0) {
        n.children = [];
        for (let a = 0; a < this.children.length; a++) n.children.push(this.children[a].toJSON(e).object);
      }
      if (this.animations.length > 0) {
        n.animations = [];
        for (let a = 0; a < this.animations.length; a++) {
          let l = this.animations[a];
          n.animations.push(s(e.animations, l));
        }
      }
      if (t) {
        let a = o(e.geometries),
          l = o(e.materials),
          c = o(e.textures),
          h = o(e.images),
          d = o(e.shapes),
          u = o(e.skeletons),
          p = o(e.animations),
          g = o(e.nodes);
        a.length > 0 && (r.geometries = a), l.length > 0 && (r.materials = l), c.length > 0 && (r.textures = c), h.length > 0 && (r.images = h), d.length > 0 && (r.shapes = d), u.length > 0 && (r.skeletons = u), p.length > 0 && (r.animations = p), g.length > 0 && (r.nodes = g);
      }
      return r.object = n, r;
      function o(a) {
        let l = [];
        for (let c in a) {
          let h = a[c];
          delete h.metadata, l.push(h);
        }
        return l;
      }
    }
    clone(e) {
      return new this.constructor().copy(this, e);
    }
    copy(e, t = !0) {
      if (this.name = e.name, this.up.copy(e.up), this.position.copy(e.position), this.rotation.order = e.rotation.order, this.quaternion.copy(e.quaternion), this.scale.copy(e.scale), this.matrix.copy(e.matrix), this.matrixWorld.copy(e.matrixWorld), this.matrixAutoUpdate = e.matrixAutoUpdate, this.matrixWorldNeedsUpdate = e.matrixWorldNeedsUpdate, this.matrixWorldAutoUpdate = e.matrixWorldAutoUpdate, this.layers.mask = e.layers.mask, this.visible = e.visible, this.castShadow = e.castShadow, this.receiveShadow = e.receiveShadow, this.frustumCulled = e.frustumCulled, this.renderOrder = e.renderOrder, this.userData = JSON.parse(JSON.stringify(e.userData)), t === !0) for (let r = 0; r < e.children.length; r++) {
        let n = e.children[r];
        this.add(n.clone());
      }
      return this;
    }
  };
kt.DEFAULT_UP = new C(0, 1, 0);
kt.DEFAULT_MATRIX_AUTO_UPDATE = !0;
kt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE = !0;
var Mr = new C(),
  Kr = new C(),
  Oo = new C(),
  Qr = new C(),
  ln = new C(),
  hn = new C(),
  Sh = new C(),
  No = new C(),
  ko = new C(),
  Uo = new C(),
  Tn = class i {
    constructor(e = new C(), t = new C(), r = new C()) {
      this.a = e, this.b = t, this.c = r;
    }
    static getNormal(e, t, r, n) {
      n.subVectors(r, t), Mr.subVectors(e, t), n.cross(Mr);
      let s = n.lengthSq();
      return s > 0 ? n.multiplyScalar(1 / Math.sqrt(s)) : n.set(0, 0, 0);
    }
    static getBarycoord(e, t, r, n, s) {
      Mr.subVectors(n, t), Kr.subVectors(r, t), Oo.subVectors(e, t);
      let o = Mr.dot(Mr),
        a = Mr.dot(Kr),
        l = Mr.dot(Oo),
        c = Kr.dot(Kr),
        h = Kr.dot(Oo),
        d = o * c - a * a;
      if (d === 0) return s.set(-2, -1, -1);
      let u = 1 / d,
        p = (c * l - a * h) * u,
        g = (o * h - a * l) * u;
      return s.set(1 - p - g, g, p);
    }
    static containsPoint(e, t, r, n) {
      return this.getBarycoord(e, t, r, n, Qr), Qr.x >= 0 && Qr.y >= 0 && Qr.x + Qr.y <= 1;
    }
    static getUV(e, t, r, n, s, o, a, l) {
      return this.getBarycoord(e, t, r, n, Qr), l.set(0, 0), l.addScaledVector(s, Qr.x), l.addScaledVector(o, Qr.y), l.addScaledVector(a, Qr.z), l;
    }
    static isFrontFacing(e, t, r, n) {
      return Mr.subVectors(r, t), Kr.subVectors(e, t), Mr.cross(Kr).dot(n) < 0;
    }
    set(e, t, r) {
      return this.a.copy(e), this.b.copy(t), this.c.copy(r), this;
    }
    setFromPointsAndIndices(e, t, r, n) {
      return this.a.copy(e[t]), this.b.copy(e[r]), this.c.copy(e[n]), this;
    }
    setFromAttributeAndIndices(e, t, r, n) {
      return this.a.fromBufferAttribute(e, t), this.b.fromBufferAttribute(e, r), this.c.fromBufferAttribute(e, n), this;
    }
    clone() {
      return new this.constructor().copy(this);
    }
    copy(e) {
      return this.a.copy(e.a), this.b.copy(e.b), this.c.copy(e.c), this;
    }
    getArea() {
      return Mr.subVectors(this.c, this.b), Kr.subVectors(this.a, this.b), Mr.cross(Kr).length() * 0.5;
    }
    getMidpoint(e) {
      return e.addVectors(this.a, this.b).add(this.c).multiplyScalar(1 / 3);
    }
    getNormal(e) {
      return i.getNormal(this.a, this.b, this.c, e);
    }
    getPlane(e) {
      return e.setFromCoplanarPoints(this.a, this.b, this.c);
    }
    getBarycoord(e, t) {
      return i.getBarycoord(e, this.a, this.b, this.c, t);
    }
    getUV(e, t, r, n, s) {
      return i.getUV(e, this.a, this.b, this.c, t, r, n, s);
    }
    containsPoint(e) {
      return i.containsPoint(e, this.a, this.b, this.c);
    }
    isFrontFacing(e) {
      return i.isFrontFacing(this.a, this.b, this.c, e);
    }
    intersectsBox(e) {
      return e.intersectsTriangle(this);
    }
    closestPointToPoint(e, t) {
      let r = this.a,
        n = this.b,
        s = this.c,
        o,
        a;
      ln.subVectors(n, r), hn.subVectors(s, r), No.subVectors(e, r);
      let l = ln.dot(No),
        c = hn.dot(No);
      if (l <= 0 && c <= 0) return t.copy(r);
      ko.subVectors(e, n);
      let h = ln.dot(ko),
        d = hn.dot(ko);
      if (h >= 0 && d <= h) return t.copy(n);
      let u = l * d - h * c;
      if (u <= 0 && l >= 0 && h <= 0) return o = l / (l - h), t.copy(r).addScaledVector(ln, o);
      Uo.subVectors(e, s);
      let p = ln.dot(Uo),
        g = hn.dot(Uo);
      if (g >= 0 && p <= g) return t.copy(s);
      let f = p * c - l * g;
      if (f <= 0 && c >= 0 && g <= 0) return a = c / (c - g), t.copy(r).addScaledVector(hn, a);
      let m = h * g - p * d;
      if (m <= 0 && d - h >= 0 && p - g >= 0) return Sh.subVectors(s, n), a = (d - h) / (d - h + (p - g)), t.copy(n).addScaledVector(Sh, a);
      let v = 1 / (m + f + u);
      return o = f * v, a = u * v, t.copy(r).addScaledVector(ln, o).addScaledVector(hn, a);
    }
    equals(e) {
      return e.a.equals(this.a) && e.b.equals(this.b) && e.c.equals(this.c);
    }
  },
  Ef = 0,
  ai = class extends _i {
    constructor() {
      super(), this.isMaterial = !0, Object.defineProperty(this, "id", {
        value: Ef++
      }), this.uuid = ii(), this.name = "", this.type = "Material", this.blending = Wi, this.side = wi, this.vertexColors = !1, this.opacity = 1, this.transparent = !1, this.blendSrc = Ru, this.blendDst = Pu, this.blendEquation = bn, this.blendSrcAlpha = null, this.blendDstAlpha = null, this.blendEquationAlpha = null, this.depthFunc = uc, this.depthTest = !0, this.depthWrite = !0, this.stencilWriteMask = 255, this.stencilFunc = lf, this.stencilRef = 0, this.stencilFuncMask = 255, this.stencilFail = So, this.stencilZFail = So, this.stencilZPass = So, this.stencilWrite = !1, this.clippingPlanes = null, this.clipIntersection = !1, this.clipShadows = !1, this.shadowSide = null, this.colorWrite = !0, this.precision = null, this.polygonOffset = !1, this.polygonOffsetFactor = 0, this.polygonOffsetUnits = 0, this.dithering = !1, this.alphaToCoverage = !1, this.premultipliedAlpha = !1, this.forceSinglePass = !1, this.visible = !0, this.toneMapped = !0, this.userData = {}, this.version = 0, this._alphaTest = 0;
    }
    get alphaTest() {
      return this._alphaTest;
    }
    set alphaTest(e) {
      this._alphaTest > 0 != e > 0 && this.version++, this._alphaTest = e;
    }
    onBuild() {}
    onBeforeRender() {}
    onBeforeCompile() {}
    customProgramCacheKey() {
      return this.onBeforeCompile.toString();
    }
    setValues(e) {
      if (e !== void 0) for (let t in e) {
        let r = e[t];
        if (r === void 0) {
          console.warn("THREE.Material: '" + t + "' parameter is undefined.");
          continue;
        }
        let n = this[t];
        if (n === void 0) {
          console.warn("THREE." + this.type + ": '" + t + "' is not a property of this material.");
          continue;
        }
        n && n.isColor ? n.set(r) : n && n.isVector3 && r && r.isVector3 ? n.copy(r) : this[t] = r;
      }
    }
    toJSON(e) {
      let t = e === void 0 || typeof e == "string";
      t && (e = {
        textures: {},
        images: {}
      });
      let r = {
        metadata: {
          version: 4.5,
          type: "Material",
          generator: "Material.toJSON"
        }
      };
      r.uuid = this.uuid, r.type = this.type, this.name !== "" && (r.name = this.name), this.color && this.color.isColor && (r.color = this.color.getHex()), this.roughness !== void 0 && (r.roughness = this.roughness), this.metalness !== void 0 && (r.metalness = this.metalness), this.sheen !== void 0 && (r.sheen = this.sheen), this.sheenColor && this.sheenColor.isColor && (r.sheenColor = this.sheenColor.getHex()), this.sheenRoughness !== void 0 && (r.sheenRoughness = this.sheenRoughness), this.emissive && this.emissive.isColor && (r.emissive = this.emissive.getHex()), this.emissiveIntensity && this.emissiveIntensity !== 1 && (r.emissiveIntensity = this.emissiveIntensity), this.specular && this.specular.isColor && (r.specular = this.specular.getHex()), this.specularIntensity !== void 0 && (r.specularIntensity = this.specularIntensity), this.specularColor && this.specularColor.isColor && (r.specularColor = this.specularColor.getHex()), this.shininess !== void 0 && (r.shininess = this.shininess), this.clearcoat !== void 0 && (r.clearcoat = this.clearcoat), this.clearcoatRoughness !== void 0 && (r.clearcoatRoughness = this.clearcoatRoughness), this.clearcoatMap && this.clearcoatMap.isTexture && (r.clearcoatMap = this.clearcoatMap.toJSON(e).uuid), this.clearcoatRoughnessMap && this.clearcoatRoughnessMap.isTexture && (r.clearcoatRoughnessMap = this.clearcoatRoughnessMap.toJSON(e).uuid), this.clearcoatNormalMap && this.clearcoatNormalMap.isTexture && (r.clearcoatNormalMap = this.clearcoatNormalMap.toJSON(e).uuid, r.clearcoatNormalScale = this.clearcoatNormalScale.toArray()), this.iridescence !== void 0 && (r.iridescence = this.iridescence), this.iridescenceIOR !== void 0 && (r.iridescenceIOR = this.iridescenceIOR), this.iridescenceThicknessRange !== void 0 && (r.iridescenceThicknessRange = this.iridescenceThicknessRange), this.iridescenceMap && this.iridescenceMap.isTexture && (r.iridescenceMap = this.iridescenceMap.toJSON(e).uuid), this.iridescenceThicknessMap && this.iridescenceThicknessMap.isTexture && (r.iridescenceThicknessMap = this.iridescenceThicknessMap.toJSON(e).uuid), this.map && this.map.isTexture && (r.map = this.map.toJSON(e).uuid), this.matcap && this.matcap.isTexture && (r.matcap = this.matcap.toJSON(e).uuid), this.alphaMap && this.alphaMap.isTexture && (r.alphaMap = this.alphaMap.toJSON(e).uuid), this.lightMap && this.lightMap.isTexture && (r.lightMap = this.lightMap.toJSON(e).uuid, r.lightMapIntensity = this.lightMapIntensity), this.aoMap && this.aoMap.isTexture && (r.aoMap = this.aoMap.toJSON(e).uuid, r.aoMapIntensity = this.aoMapIntensity), this.bumpMap && this.bumpMap.isTexture && (r.bumpMap = this.bumpMap.toJSON(e).uuid, r.bumpScale = this.bumpScale), this.normalMap && this.normalMap.isTexture && (r.normalMap = this.normalMap.toJSON(e).uuid, r.normalMapType = this.normalMapType, r.normalScale = this.normalScale.toArray()), this.displacementMap && this.displacementMap.isTexture && (r.displacementMap = this.displacementMap.toJSON(e).uuid, r.displacementScale = this.displacementScale, r.displacementBias = this.displacementBias), this.roughnessMap && this.roughnessMap.isTexture && (r.roughnessMap = this.roughnessMap.toJSON(e).uuid), this.metalnessMap && this.metalnessMap.isTexture && (r.metalnessMap = this.metalnessMap.toJSON(e).uuid), this.emissiveMap && this.emissiveMap.isTexture && (r.emissiveMap = this.emissiveMap.toJSON(e).uuid), this.specularMap && this.specularMap.isTexture && (r.specularMap = this.specularMap.toJSON(e).uuid), this.specularIntensityMap && this.specularIntensityMap.isTexture && (r.specularIntensityMap = this.specularIntensityMap.toJSON(e).uuid), this.specularColorMap && this.specularColorMap.isTexture && (r.specularColorMap = this.specularColorMap.toJSON(e).uuid), this.envMap && this.envMap.isTexture && (r.envMap = this.envMap.toJSON(e).uuid, this.combine !== void 0 && (r.combine = this.combine)), this.envMapIntensity !== void 0 && (r.envMapIntensity = this.envMapIntensity), this.reflectivity !== void 0 && (r.reflectivity = this.reflectivity), this.refractionRatio !== void 0 && (r.refractionRatio = this.refractionRatio), this.gradientMap && this.gradientMap.isTexture && (r.gradientMap = this.gradientMap.toJSON(e).uuid), this.transmission !== void 0 && (r.transmission = this.transmission), this.transmissionMap && this.transmissionMap.isTexture && (r.transmissionMap = this.transmissionMap.toJSON(e).uuid), this.thickness !== void 0 && (r.thickness = this.thickness), this.thicknessMap && this.thicknessMap.isTexture && (r.thicknessMap = this.thicknessMap.toJSON(e).uuid), this.attenuationDistance !== void 0 && this.attenuationDistance !== 1 / 0 && (r.attenuationDistance = this.attenuationDistance), this.attenuationColor !== void 0 && (r.attenuationColor = this.attenuationColor.getHex()), this.size !== void 0 && (r.size = this.size), this.shadowSide !== null && (r.shadowSide = this.shadowSide), this.sizeAttenuation !== void 0 && (r.sizeAttenuation = this.sizeAttenuation), this.blending !== Wi && (r.blending = this.blending), this.side !== wi && (r.side = this.side), this.vertexColors && (r.vertexColors = !0), this.opacity < 1 && (r.opacity = this.opacity), this.transparent === !0 && (r.transparent = this.transparent), r.depthFunc = this.depthFunc, r.depthTest = this.depthTest, r.depthWrite = this.depthWrite, r.colorWrite = this.colorWrite, r.stencilWrite = this.stencilWrite, r.stencilWriteMask = this.stencilWriteMask, r.stencilFunc = this.stencilFunc, r.stencilRef = this.stencilRef, r.stencilFuncMask = this.stencilFuncMask, r.stencilFail = this.stencilFail, r.stencilZFail = this.stencilZFail, r.stencilZPass = this.stencilZPass, this.rotation !== void 0 && this.rotation !== 0 && (r.rotation = this.rotation), this.polygonOffset === !0 && (r.polygonOffset = !0), this.polygonOffsetFactor !== 0 && (r.polygonOffsetFactor = this.polygonOffsetFactor), this.polygonOffsetUnits !== 0 && (r.polygonOffsetUnits = this.polygonOffsetUnits), this.linewidth !== void 0 && this.linewidth !== 1 && (r.linewidth = this.linewidth), this.dashSize !== void 0 && (r.dashSize = this.dashSize), this.gapSize !== void 0 && (r.gapSize = this.gapSize), this.scale !== void 0 && (r.scale = this.scale), this.dithering === !0 && (r.dithering = !0), this.alphaTest > 0 && (r.alphaTest = this.alphaTest), this.alphaToCoverage === !0 && (r.alphaToCoverage = this.alphaToCoverage), this.premultipliedAlpha === !0 && (r.premultipliedAlpha = this.premultipliedAlpha), this.forceSinglePass === !0 && (r.forceSinglePass = this.forceSinglePass), this.wireframe === !0 && (r.wireframe = this.wireframe), this.wireframeLinewidth > 1 && (r.wireframeLinewidth = this.wireframeLinewidth), this.wireframeLinecap !== "round" && (r.wireframeLinecap = this.wireframeLinecap), this.wireframeLinejoin !== "round" && (r.wireframeLinejoin = this.wireframeLinejoin), this.flatShading === !0 && (r.flatShading = this.flatShading), this.visible === !1 && (r.visible = !1), this.toneMapped === !1 && (r.toneMapped = !1), this.fog === !1 && (r.fog = !1), Object.keys(this.userData).length > 0 && (r.userData = this.userData);
      function n(s) {
        let o = [];
        for (let a in s) {
          let l = s[a];
          delete l.metadata, o.push(l);
        }
        return o;
      }
      if (t) {
        let s = n(e.textures),
          o = n(e.images);
        s.length > 0 && (r.textures = s), o.length > 0 && (r.images = o);
      }
      return r;
    }
    clone() {
      return new this.constructor().copy(this);
    }
    copy(e) {
      this.name = e.name, this.blending = e.blending, this.side = e.side, this.vertexColors = e.vertexColors, this.opacity = e.opacity, this.transparent = e.transparent, this.blendSrc = e.blendSrc, this.blendDst = e.blendDst, this.blendEquation = e.blendEquation, this.blendSrcAlpha = e.blendSrcAlpha, this.blendDstAlpha = e.blendDstAlpha, this.blendEquationAlpha = e.blendEquationAlpha, this.depthFunc = e.depthFunc, this.depthTest = e.depthTest, this.depthWrite = e.depthWrite, this.stencilWriteMask = e.stencilWriteMask, this.stencilFunc = e.stencilFunc, this.stencilRef = e.stencilRef, this.stencilFuncMask = e.stencilFuncMask, this.stencilFail = e.stencilFail, this.stencilZFail = e.stencilZFail, this.stencilZPass = e.stencilZPass, this.stencilWrite = e.stencilWrite;
      let t = e.clippingPlanes,
        r = null;
      if (t !== null) {
        let n = t.length;
        r = new Array(n);
        for (let s = 0; s !== n; ++s) r[s] = t[s].clone();
      }
      return this.clippingPlanes = r, this.clipIntersection = e.clipIntersection, this.clipShadows = e.clipShadows, this.shadowSide = e.shadowSide, this.colorWrite = e.colorWrite, this.precision = e.precision, this.polygonOffset = e.polygonOffset, this.polygonOffsetFactor = e.polygonOffsetFactor, this.polygonOffsetUnits = e.polygonOffsetUnits, this.dithering = e.dithering, this.alphaTest = e.alphaTest, this.alphaToCoverage = e.alphaToCoverage, this.premultipliedAlpha = e.premultipliedAlpha, this.forceSinglePass = e.forceSinglePass, this.visible = e.visible, this.toneMapped = e.toneMapped, this.userData = JSON.parse(JSON.stringify(e.userData)), this;
    }
    dispose() {
      this.dispatchEvent({
        type: "dispose"
      });
    }
    set needsUpdate(e) {
      e === !0 && this.version++;
    }
  },
  ku = {
    aliceblue: 15792383,
    antiquewhite: 16444375,
    aqua: 65535,
    aquamarine: 8388564,
    azure: 15794175,
    beige: 16119260,
    bisque: 16770244,
    black: 0,
    blanchedalmond: 16772045,
    blue: 255,
    blueviolet: 9055202,
    brown: 10824234,
    burlywood: 14596231,
    cadetblue: 6266528,
    chartreuse: 8388352,
    chocolate: 13789470,
    coral: 16744272,
    cornflowerblue: 6591981,
    cornsilk: 16775388,
    crimson: 14423100,
    cyan: 65535,
    darkblue: 139,
    darkcyan: 35723,
    darkgoldenrod: 12092939,
    darkgray: 11119017,
    darkgreen: 25600,
    darkgrey: 11119017,
    darkkhaki: 12433259,
    darkmagenta: 9109643,
    darkolivegreen: 5597999,
    darkorange: 16747520,
    darkorchid: 10040012,
    darkred: 9109504,
    darksalmon: 15308410,
    darkseagreen: 9419919,
    darkslateblue: 4734347,
    darkslategray: 3100495,
    darkslategrey: 3100495,
    darkturquoise: 52945,
    darkviolet: 9699539,
    deeppink: 16716947,
    deepskyblue: 49151,
    dimgray: 6908265,
    dimgrey: 6908265,
    dodgerblue: 2003199,
    firebrick: 11674146,
    floralwhite: 16775920,
    forestgreen: 2263842,
    fuchsia: 16711935,
    gainsboro: 14474460,
    ghostwhite: 16316671,
    gold: 16766720,
    goldenrod: 14329120,
    gray: 8421504,
    green: 32768,
    greenyellow: 11403055,
    grey: 8421504,
    honeydew: 15794160,
    hotpink: 16738740,
    indianred: 13458524,
    indigo: 4915330,
    ivory: 16777200,
    khaki: 15787660,
    lavender: 15132410,
    lavenderblush: 16773365,
    lawngreen: 8190976,
    lemonchiffon: 16775885,
    lightblue: 11393254,
    lightcoral: 15761536,
    lightcyan: 14745599,
    lightgoldenrodyellow: 16448210,
    lightgray: 13882323,
    lightgreen: 9498256,
    lightgrey: 13882323,
    lightpink: 16758465,
    lightsalmon: 16752762,
    lightseagreen: 2142890,
    lightskyblue: 8900346,
    lightslategray: 7833753,
    lightslategrey: 7833753,
    lightsteelblue: 11584734,
    lightyellow: 16777184,
    lime: 65280,
    limegreen: 3329330,
    linen: 16445670,
    magenta: 16711935,
    maroon: 8388608,
    mediumaquamarine: 6737322,
    mediumblue: 205,
    mediumorchid: 12211667,
    mediumpurple: 9662683,
    mediumseagreen: 3978097,
    mediumslateblue: 8087790,
    mediumspringgreen: 64154,
    mediumturquoise: 4772300,
    mediumvioletred: 13047173,
    midnightblue: 1644912,
    mintcream: 16121850,
    mistyrose: 16770273,
    moccasin: 16770229,
    navajowhite: 16768685,
    navy: 128,
    oldlace: 16643558,
    olive: 8421376,
    olivedrab: 7048739,
    orange: 16753920,
    orangered: 16729344,
    orchid: 14315734,
    palegoldenrod: 15657130,
    palegreen: 10025880,
    paleturquoise: 11529966,
    palevioletred: 14381203,
    papayawhip: 16773077,
    peachpuff: 16767673,
    peru: 13468991,
    pink: 16761035,
    plum: 14524637,
    powderblue: 11591910,
    purple: 8388736,
    rebeccapurple: 6697881,
    red: 16711680,
    rosybrown: 12357519,
    royalblue: 4286945,
    saddlebrown: 9127187,
    salmon: 16416882,
    sandybrown: 16032864,
    seagreen: 3050327,
    seashell: 16774638,
    sienna: 10506797,
    silver: 12632256,
    skyblue: 8900331,
    slateblue: 6970061,
    slategray: 7372944,
    slategrey: 7372944,
    snow: 16775930,
    springgreen: 65407,
    steelblue: 4620980,
    tan: 13808780,
    teal: 32896,
    thistle: 14204888,
    tomato: 16737095,
    turquoise: 4251856,
    violet: 15631086,
    wheat: 16113331,
    white: 16777215,
    whitesmoke: 16119285,
    yellow: 16776960,
    yellowgreen: 10145074
  },
  Sr = {
    h: 0,
    s: 0,
    l: 0
  },
  Hs = {
    h: 0,
    s: 0,
    l: 0
  };
function Fo(i, e, t) {
  return t < 0 && (t += 1), t > 1 && (t -= 1), t < 1 / 6 ? i + (e - i) * 6 * t : t < 1 / 2 ? e : t < 2 / 3 ? i + (e - i) * 6 * (2 / 3 - t) : i;
}
var He = class {
    constructor(e, t, r) {
      return this.isColor = !0, this.r = 1, this.g = 1, this.b = 1, t === void 0 && r === void 0 ? this.set(e) : this.setRGB(e, t, r);
    }
    set(e) {
      return e && e.isColor ? this.copy(e) : typeof e == "number" ? this.setHex(e) : typeof e == "string" && this.setStyle(e), this;
    }
    setScalar(e) {
      return this.r = e, this.g = e, this.b = e, this;
    }
    setHex(e, t = Nr) {
      return e = Math.floor(e), this.r = (e >> 16 & 255) / 255, this.g = (e >> 8 & 255) / 255, this.b = (e & 255) / 255, qt.toWorkingColorSpace(this, t), this;
    }
    setRGB(e, t, r, n = qt.workingColorSpace) {
      return this.r = e, this.g = t, this.b = r, qt.toWorkingColorSpace(this, n), this;
    }
    setHSL(e, t, r, n = qt.workingColorSpace) {
      if (e = hf(e, 1), t = Vt(t, 0, 1), r = Vt(r, 0, 1), t === 0) this.r = this.g = this.b = r;else {
        let s = r <= 0.5 ? r * (1 + t) : r + t - r * t,
          o = 2 * r - s;
        this.r = Fo(o, s, e + 1 / 3), this.g = Fo(o, s, e), this.b = Fo(o, s, e - 1 / 3);
      }
      return qt.toWorkingColorSpace(this, n), this;
    }
    setStyle(e, t = Nr) {
      function r(s) {
        s !== void 0 && parseFloat(s) < 1 && console.warn("THREE.Color: Alpha component of " + e + " will be ignored.");
      }
      let n;
      if (n = /^(\w+)\(([^\)]*)\)/.exec(e)) {
        let s,
          o = n[1],
          a = n[2];
        switch (o) {
          case "rgb":
          case "rgba":
            if (s = /^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a)) return this.r = Math.min(255, parseInt(s[1], 10)) / 255, this.g = Math.min(255, parseInt(s[2], 10)) / 255, this.b = Math.min(255, parseInt(s[3], 10)) / 255, qt.toWorkingColorSpace(this, t), r(s[4]), this;
            if (s = /^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a)) return this.r = Math.min(100, parseInt(s[1], 10)) / 100, this.g = Math.min(100, parseInt(s[2], 10)) / 100, this.b = Math.min(100, parseInt(s[3], 10)) / 100, qt.toWorkingColorSpace(this, t), r(s[4]), this;
            break;
          case "hsl":
          case "hsla":
            if (s = /^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a)) {
              let l = parseFloat(s[1]) / 360,
                c = parseFloat(s[2]) / 100,
                h = parseFloat(s[3]) / 100;
              return r(s[4]), this.setHSL(l, c, h, t);
            }
            break;
          default:
            console.warn("THREE.Color: Unknown color model " + e);
        }
      } else if (n = /^\#([A-Fa-f\d]+)$/.exec(e)) {
        let s = n[1],
          o = s.length;
        if (o === 3) return this.r = parseInt(s.charAt(0) + s.charAt(0), 16) / 255, this.g = parseInt(s.charAt(1) + s.charAt(1), 16) / 255, this.b = parseInt(s.charAt(2) + s.charAt(2), 16) / 255, qt.toWorkingColorSpace(this, t), this;
        if (o === 6) return this.r = parseInt(s.charAt(0) + s.charAt(1), 16) / 255, this.g = parseInt(s.charAt(2) + s.charAt(3), 16) / 255, this.b = parseInt(s.charAt(4) + s.charAt(5), 16) / 255, qt.toWorkingColorSpace(this, t), this;
        console.warn("THREE.Color: Invalid hex color " + e);
      } else if (e && e.length > 0) return this.setColorName(e, t);
      return this;
    }
    setColorName(e, t = Nr) {
      let r = ku[e.toLowerCase()];
      return r !== void 0 ? this.setHex(r, t) : console.warn("THREE.Color: Unknown color " + e), this;
    }
    clone() {
      return new this.constructor(this.r, this.g, this.b);
    }
    copy(e) {
      return this.r = e.r, this.g = e.g, this.b = e.b, this;
    }
    copySRGBToLinear(e) {
      return this.r = _n(e.r), this.g = _n(e.g), this.b = _n(e.b), this;
    }
    copyLinearToSRGB(e) {
      return this.r = Ao(e.r), this.g = Ao(e.g), this.b = Ao(e.b), this;
    }
    convertSRGBToLinear() {
      return this.copySRGBToLinear(this), this;
    }
    convertLinearToSRGB() {
      return this.copyLinearToSRGB(this), this;
    }
    getHex(e = Nr) {
      return qt.fromWorkingColorSpace(Bt.copy(this), e), Vt(Bt.r * 255, 0, 255) << 16 ^ Vt(Bt.g * 255, 0, 255) << 8 ^ Vt(Bt.b * 255, 0, 255) << 0;
    }
    getHexString(e = Nr) {
      return ("000000" + this.getHex(e).toString(16)).slice(-6);
    }
    getHSL(e, t = qt.workingColorSpace) {
      qt.fromWorkingColorSpace(Bt.copy(this), t);
      let r = Bt.r,
        n = Bt.g,
        s = Bt.b,
        o = Math.max(r, n, s),
        a = Math.min(r, n, s),
        l,
        c,
        h = (a + o) / 2;
      if (a === o) l = 0, c = 0;else {
        let d = o - a;
        switch (c = h <= 0.5 ? d / (o + a) : d / (2 - o - a), o) {
          case r:
            l = (n - s) / d + (n < s ? 6 : 0);
            break;
          case n:
            l = (s - r) / d + 2;
            break;
          case s:
            l = (r - n) / d + 4;
            break;
        }
        l /= 6;
      }
      return e.h = l, e.s = c, e.l = h, e;
    }
    getRGB(e, t = qt.workingColorSpace) {
      return qt.fromWorkingColorSpace(Bt.copy(this), t), e.r = Bt.r, e.g = Bt.g, e.b = Bt.b, e;
    }
    getStyle(e = Nr) {
      qt.fromWorkingColorSpace(Bt.copy(this), e);
      let t = Bt.r,
        r = Bt.g,
        n = Bt.b;
      return e !== Nr ? `color(${e} ${t.toFixed(3)} ${r.toFixed(3)} ${n.toFixed(3)})` : `rgb(${t * 255 | 0},${r * 255 | 0},${n * 255 | 0})`;
    }
    offsetHSL(e, t, r) {
      return this.getHSL(Sr), Sr.h += e, Sr.s += t, Sr.l += r, this.setHSL(Sr.h, Sr.s, Sr.l), this;
    }
    add(e) {
      return this.r += e.r, this.g += e.g, this.b += e.b, this;
    }
    addColors(e, t) {
      return this.r = e.r + t.r, this.g = e.g + t.g, this.b = e.b + t.b, this;
    }
    addScalar(e) {
      return this.r += e, this.g += e, this.b += e, this;
    }
    sub(e) {
      return this.r = Math.max(0, this.r - e.r), this.g = Math.max(0, this.g - e.g), this.b = Math.max(0, this.b - e.b), this;
    }
    multiply(e) {
      return this.r *= e.r, this.g *= e.g, this.b *= e.b, this;
    }
    multiplyScalar(e) {
      return this.r *= e, this.g *= e, this.b *= e, this;
    }
    lerp(e, t) {
      return this.r += (e.r - this.r) * t, this.g += (e.g - this.g) * t, this.b += (e.b - this.b) * t, this;
    }
    lerpColors(e, t, r) {
      return this.r = e.r + (t.r - e.r) * r, this.g = e.g + (t.g - e.g) * r, this.b = e.b + (t.b - e.b) * r, this;
    }
    lerpHSL(e, t) {
      this.getHSL(Sr), e.getHSL(Hs);
      let r = _o(Sr.h, Hs.h, t),
        n = _o(Sr.s, Hs.s, t),
        s = _o(Sr.l, Hs.l, t);
      return this.setHSL(r, n, s), this;
    }
    equals(e) {
      return e.r === this.r && e.g === this.g && e.b === this.b;
    }
    fromArray(e, t = 0) {
      return this.r = e[t], this.g = e[t + 1], this.b = e[t + 2], this;
    }
    toArray(e = [], t = 0) {
      return e[t] = this.r, e[t + 1] = this.g, e[t + 2] = this.b, e;
    }
    fromBufferAttribute(e, t) {
      return this.r = e.getX(t), this.g = e.getY(t), this.b = e.getZ(t), this;
    }
    toJSON() {
      return this.getHex();
    }
    *[Symbol.iterator]() {
      yield this.r, yield this.g, yield this.b;
    }
  },
  Bt = new He();
He.NAMES = ku;
var Ei = class extends ai {
    constructor(e) {
      super(), this.isMeshBasicMaterial = !0, this.type = "MeshBasicMaterial", this.color = new He(16777215), this.map = null, this.lightMap = null, this.lightMapIntensity = 1, this.aoMap = null, this.aoMapIntensity = 1, this.specularMap = null, this.alphaMap = null, this.envMap = null, this.combine = Lu, this.reflectivity = 1, this.refractionRatio = 0.98, this.wireframe = !1, this.wireframeLinewidth = 1, this.wireframeLinecap = "round", this.wireframeLinejoin = "round", this.fog = !0, this.setValues(e);
    }
    copy(e) {
      return super.copy(e), this.color.copy(e.color), this.map = e.map, this.lightMap = e.lightMap, this.lightMapIntensity = e.lightMapIntensity, this.aoMap = e.aoMap, this.aoMapIntensity = e.aoMapIntensity, this.specularMap = e.specularMap, this.alphaMap = e.alphaMap, this.envMap = e.envMap, this.combine = e.combine, this.reflectivity = e.reflectivity, this.refractionRatio = e.refractionRatio, this.wireframe = e.wireframe, this.wireframeLinewidth = e.wireframeLinewidth, this.wireframeLinecap = e.wireframeLinecap, this.wireframeLinejoin = e.wireframeLinejoin, this.fog = e.fog, this;
    }
  },
  Mt = new C(),
  js = new se(),
  Qt = class {
    constructor(e, t, r = !1) {
      if (Array.isArray(e)) throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");
      this.isBufferAttribute = !0, this.name = "", this.array = e, this.itemSize = t, this.count = e !== void 0 ? e.length / t : 0, this.normalized = r, this.usage = mc, this.updateRange = {
        offset: 0,
        count: -1
      }, this.version = 0;
    }
    onUploadCallback() {}
    set needsUpdate(e) {
      e === !0 && this.version++;
    }
    setUsage(e) {
      return this.usage = e, this;
    }
    copy(e) {
      return this.name = e.name, this.array = new e.array.constructor(e.array), this.itemSize = e.itemSize, this.count = e.count, this.normalized = e.normalized, this.usage = e.usage, this;
    }
    copyAt(e, t, r) {
      e *= this.itemSize, r *= t.itemSize;
      for (let n = 0, s = this.itemSize; n < s; n++) this.array[e + n] = t.array[r + n];
      return this;
    }
    copyArray(e) {
      return this.array.set(e), this;
    }
    applyMatrix3(e) {
      if (this.itemSize === 2) for (let t = 0, r = this.count; t < r; t++) js.fromBufferAttribute(this, t), js.applyMatrix3(e), this.setXY(t, js.x, js.y);else if (this.itemSize === 3) for (let t = 0, r = this.count; t < r; t++) Mt.fromBufferAttribute(this, t), Mt.applyMatrix3(e), this.setXYZ(t, Mt.x, Mt.y, Mt.z);
      return this;
    }
    applyMatrix4(e) {
      for (let t = 0, r = this.count; t < r; t++) Mt.fromBufferAttribute(this, t), Mt.applyMatrix4(e), this.setXYZ(t, Mt.x, Mt.y, Mt.z);
      return this;
    }
    applyNormalMatrix(e) {
      for (let t = 0, r = this.count; t < r; t++) Mt.fromBufferAttribute(this, t), Mt.applyNormalMatrix(e), this.setXYZ(t, Mt.x, Mt.y, Mt.z);
      return this;
    }
    transformDirection(e) {
      for (let t = 0, r = this.count; t < r; t++) Mt.fromBufferAttribute(this, t), Mt.transformDirection(e), this.setXYZ(t, Mt.x, Mt.y, Mt.z);
      return this;
    }
    set(e, t = 0) {
      return this.array.set(e, t), this;
    }
    getX(e) {
      let t = this.array[e * this.itemSize];
      return this.normalized && (t = vi(t, this.array)), t;
    }
    setX(e, t) {
      return this.normalized && (t = ot(t, this.array)), this.array[e * this.itemSize] = t, this;
    }
    getY(e) {
      let t = this.array[e * this.itemSize + 1];
      return this.normalized && (t = vi(t, this.array)), t;
    }
    setY(e, t) {
      return this.normalized && (t = ot(t, this.array)), this.array[e * this.itemSize + 1] = t, this;
    }
    getZ(e) {
      let t = this.array[e * this.itemSize + 2];
      return this.normalized && (t = vi(t, this.array)), t;
    }
    setZ(e, t) {
      return this.normalized && (t = ot(t, this.array)), this.array[e * this.itemSize + 2] = t, this;
    }
    getW(e) {
      let t = this.array[e * this.itemSize + 3];
      return this.normalized && (t = vi(t, this.array)), t;
    }
    setW(e, t) {
      return this.normalized && (t = ot(t, this.array)), this.array[e * this.itemSize + 3] = t, this;
    }
    setXY(e, t, r) {
      return e *= this.itemSize, this.normalized && (t = ot(t, this.array), r = ot(r, this.array)), this.array[e + 0] = t, this.array[e + 1] = r, this;
    }
    setXYZ(e, t, r, n) {
      return e *= this.itemSize, this.normalized && (t = ot(t, this.array), r = ot(r, this.array), n = ot(n, this.array)), this.array[e + 0] = t, this.array[e + 1] = r, this.array[e + 2] = n, this;
    }
    setXYZW(e, t, r, n, s) {
      return e *= this.itemSize, this.normalized && (t = ot(t, this.array), r = ot(r, this.array), n = ot(n, this.array), s = ot(s, this.array)), this.array[e + 0] = t, this.array[e + 1] = r, this.array[e + 2] = n, this.array[e + 3] = s, this;
    }
    onUpload(e) {
      return this.onUploadCallback = e, this;
    }
    clone() {
      return new this.constructor(this.array, this.itemSize).copy(this);
    }
    toJSON() {
      let e = {
        itemSize: this.itemSize,
        type: this.array.constructor.name,
        array: Array.from(this.array),
        normalized: this.normalized
      };
      return this.name !== "" && (e.name = this.name), this.usage !== mc && (e.usage = this.usage), (this.updateRange.offset !== 0 || this.updateRange.count !== -1) && (e.updateRange = this.updateRange), e;
    }
    copyColorsArray() {
      console.error("THREE.BufferAttribute: copyColorsArray() was removed in r144.");
    }
    copyVector2sArray() {
      console.error("THREE.BufferAttribute: copyVector2sArray() was removed in r144.");
    }
    copyVector3sArray() {
      console.error("THREE.BufferAttribute: copyVector3sArray() was removed in r144.");
    }
    copyVector4sArray() {
      console.error("THREE.BufferAttribute: copyVector4sArray() was removed in r144.");
    }
  },
  La = class extends Qt {
    constructor(e, t, r) {
      super(new Uint16Array(e), t, r);
    }
  },
  Da = class extends Qt {
    constructor(e, t, r) {
      super(new Uint32Array(e), t, r);
    }
  },
  Ye = class extends Qt {
    constructor(e, t, r) {
      super(new Float32Array(e), t, r);
    }
  },
  Af = 0,
  dr = new at(),
  Bo = new kt(),
  un = new C(),
  sr = new Zi(),
  Zn = new Zi(),
  Pt = new C(),
  Tt = class i extends _i {
    constructor() {
      super(), this.isBufferGeometry = !0, Object.defineProperty(this, "id", {
        value: Af++
      }), this.uuid = ii(), this.name = "", this.type = "BufferGeometry", this.index = null, this.attributes = {}, this.morphAttributes = {}, this.morphTargetsRelative = !1, this.groups = [], this.boundingBox = null, this.boundingSphere = null, this.drawRange = {
        start: 0,
        count: 1 / 0
      }, this.userData = {};
    }
    getIndex() {
      return this.index;
    }
    setIndex(e) {
      return Array.isArray(e) ? this.index = new (Nu(e) ? Da : La)(e, 1) : this.index = e, this;
    }
    getAttribute(e) {
      return this.attributes[e];
    }
    setAttribute(e, t) {
      return this.attributes[e] = t, this;
    }
    deleteAttribute(e) {
      return delete this.attributes[e], this;
    }
    hasAttribute(e) {
      return this.attributes[e] !== void 0;
    }
    addGroup(e, t, r = 0) {
      this.groups.push({
        start: e,
        count: t,
        materialIndex: r
      });
    }
    clearGroups() {
      this.groups = [];
    }
    setDrawRange(e, t) {
      this.drawRange.start = e, this.drawRange.count = t;
    }
    applyMatrix4(e) {
      let t = this.attributes.position;
      t !== void 0 && (t.applyMatrix4(e), t.needsUpdate = !0);
      let r = this.attributes.normal;
      if (r !== void 0) {
        let s = new Kt().getNormalMatrix(e);
        r.applyNormalMatrix(s), r.needsUpdate = !0;
      }
      let n = this.attributes.tangent;
      return n !== void 0 && (n.transformDirection(e), n.needsUpdate = !0), this.boundingBox !== null && this.computeBoundingBox(), this.boundingSphere !== null && this.computeBoundingSphere(), this;
    }
    applyQuaternion(e) {
      return dr.makeRotationFromQuaternion(e), this.applyMatrix4(dr), this;
    }
    rotateX(e) {
      return dr.makeRotationX(e), this.applyMatrix4(dr), this;
    }
    rotateY(e) {
      return dr.makeRotationY(e), this.applyMatrix4(dr), this;
    }
    rotateZ(e) {
      return dr.makeRotationZ(e), this.applyMatrix4(dr), this;
    }
    translate(e, t, r) {
      return dr.makeTranslation(e, t, r), this.applyMatrix4(dr), this;
    }
    scale(e, t, r) {
      return dr.makeScale(e, t, r), this.applyMatrix4(dr), this;
    }
    lookAt(e) {
      return Bo.lookAt(e), Bo.updateMatrix(), this.applyMatrix4(Bo.matrix), this;
    }
    center() {
      return this.computeBoundingBox(), this.boundingBox.getCenter(un).negate(), this.translate(un.x, un.y, un.z), this;
    }
    setFromPoints(e) {
      let t = [];
      for (let r = 0, n = e.length; r < n; r++) {
        let s = e[r];
        t.push(s.x, s.y, s.z || 0);
      }
      return this.setAttribute("position", new Ye(t, 3)), this;
    }
    computeBoundingBox() {
      this.boundingBox === null && (this.boundingBox = new Zi());
      let e = this.attributes.position,
        t = this.morphAttributes.position;
      if (e && e.isGLBufferAttribute) {
        console.error('THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box. Alternatively set "mesh.frustumCulled" to "false".', this), this.boundingBox.set(new C(-1 / 0, -1 / 0, -1 / 0), new C(1 / 0, 1 / 0, 1 / 0));
        return;
      }
      if (e !== void 0) {
        if (this.boundingBox.setFromBufferAttribute(e), t) for (let r = 0, n = t.length; r < n; r++) {
          let s = t[r];
          sr.setFromBufferAttribute(s), this.morphTargetsRelative ? (Pt.addVectors(this.boundingBox.min, sr.min), this.boundingBox.expandByPoint(Pt), Pt.addVectors(this.boundingBox.max, sr.max), this.boundingBox.expandByPoint(Pt)) : (this.boundingBox.expandByPoint(sr.min), this.boundingBox.expandByPoint(sr.max));
        }
      } else this.boundingBox.makeEmpty();
      (isNaN(this.boundingBox.min.x) || isNaN(this.boundingBox.min.y) || isNaN(this.boundingBox.min.z)) && console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.', this);
    }
    computeBoundingSphere() {
      this.boundingSphere === null && (this.boundingSphere = new zn());
      let e = this.attributes.position,
        t = this.morphAttributes.position;
      if (e && e.isGLBufferAttribute) {
        console.error('THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere. Alternatively set "mesh.frustumCulled" to "false".', this), this.boundingSphere.set(new C(), 1 / 0);
        return;
      }
      if (e) {
        let r = this.boundingSphere.center;
        if (sr.setFromBufferAttribute(e), t) for (let s = 0, o = t.length; s < o; s++) {
          let a = t[s];
          Zn.setFromBufferAttribute(a), this.morphTargetsRelative ? (Pt.addVectors(sr.min, Zn.min), sr.expandByPoint(Pt), Pt.addVectors(sr.max, Zn.max), sr.expandByPoint(Pt)) : (sr.expandByPoint(Zn.min), sr.expandByPoint(Zn.max));
        }
        sr.getCenter(r);
        let n = 0;
        for (let s = 0, o = e.count; s < o; s++) Pt.fromBufferAttribute(e, s), n = Math.max(n, r.distanceToSquared(Pt));
        if (t) for (let s = 0, o = t.length; s < o; s++) {
          let a = t[s],
            l = this.morphTargetsRelative;
          for (let c = 0, h = a.count; c < h; c++) Pt.fromBufferAttribute(a, c), l && (un.fromBufferAttribute(e, c), Pt.add(un)), n = Math.max(n, r.distanceToSquared(Pt));
        }
        this.boundingSphere.radius = Math.sqrt(n), isNaN(this.boundingSphere.radius) && console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.', this);
      }
    }
    computeTangents() {
      let e = this.index,
        t = this.attributes;
      if (e === null || t.position === void 0 || t.normal === void 0 || t.uv === void 0) {
        console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");
        return;
      }
      let r = e.array,
        n = t.position.array,
        s = t.normal.array,
        o = t.uv.array,
        a = n.length / 3;
      this.hasAttribute("tangent") === !1 && this.setAttribute("tangent", new Qt(new Float32Array(4 * a), 4));
      let l = this.getAttribute("tangent").array,
        c = [],
        h = [];
      for (let R = 0; R < a; R++) c[R] = new C(), h[R] = new C();
      let d = new C(),
        u = new C(),
        p = new C(),
        g = new se(),
        f = new se(),
        m = new se(),
        v = new C(),
        y = new C();
      function x(R, H, Z) {
        d.fromArray(n, R * 3), u.fromArray(n, H * 3), p.fromArray(n, Z * 3), g.fromArray(o, R * 2), f.fromArray(o, H * 2), m.fromArray(o, Z * 2), u.sub(d), p.sub(d), f.sub(g), m.sub(g);
        let O = 1 / (f.x * m.y - m.x * f.y);
        isFinite(O) && (v.copy(u).multiplyScalar(m.y).addScaledVector(p, -f.y).multiplyScalar(O), y.copy(p).multiplyScalar(f.x).addScaledVector(u, -m.x).multiplyScalar(O), c[R].add(v), c[H].add(v), c[Z].add(v), h[R].add(y), h[H].add(y), h[Z].add(y));
      }
      let b = this.groups;
      b.length === 0 && (b = [{
        start: 0,
        count: r.length
      }]);
      for (let R = 0, H = b.length; R < H; ++R) {
        let Z = b[R],
          O = Z.start,
          z = Z.count;
        for (let j = O, ie = O + z; j < ie; j += 3) x(r[j + 0], r[j + 1], r[j + 2]);
      }
      let w = new C(),
        A = new C(),
        L = new C(),
        M = new C();
      function T(R) {
        L.fromArray(s, R * 3), M.copy(L);
        let H = c[R];
        w.copy(H), w.sub(L.multiplyScalar(L.dot(H))).normalize(), A.crossVectors(M, H);
        let Z = A.dot(h[R]) < 0 ? -1 : 1;
        l[R * 4] = w.x, l[R * 4 + 1] = w.y, l[R * 4 + 2] = w.z, l[R * 4 + 3] = Z;
      }
      for (let R = 0, H = b.length; R < H; ++R) {
        let Z = b[R],
          O = Z.start,
          z = Z.count;
        for (let j = O, ie = O + z; j < ie; j += 3) T(r[j + 0]), T(r[j + 1]), T(r[j + 2]);
      }
    }
    computeVertexNormals() {
      let e = this.index,
        t = this.getAttribute("position");
      if (t !== void 0) {
        let r = this.getAttribute("normal");
        if (r === void 0) r = new Qt(new Float32Array(t.count * 3), 3), this.setAttribute("normal", r);else for (let u = 0, p = r.count; u < p; u++) r.setXYZ(u, 0, 0, 0);
        let n = new C(),
          s = new C(),
          o = new C(),
          a = new C(),
          l = new C(),
          c = new C(),
          h = new C(),
          d = new C();
        if (e) for (let u = 0, p = e.count; u < p; u += 3) {
          let g = e.getX(u + 0),
            f = e.getX(u + 1),
            m = e.getX(u + 2);
          n.fromBufferAttribute(t, g), s.fromBufferAttribute(t, f), o.fromBufferAttribute(t, m), h.subVectors(o, s), d.subVectors(n, s), h.cross(d), a.fromBufferAttribute(r, g), l.fromBufferAttribute(r, f), c.fromBufferAttribute(r, m), a.add(h), l.add(h), c.add(h), r.setXYZ(g, a.x, a.y, a.z), r.setXYZ(f, l.x, l.y, l.z), r.setXYZ(m, c.x, c.y, c.z);
        } else for (let u = 0, p = t.count; u < p; u += 3) n.fromBufferAttribute(t, u + 0), s.fromBufferAttribute(t, u + 1), o.fromBufferAttribute(t, u + 2), h.subVectors(o, s), d.subVectors(n, s), h.cross(d), r.setXYZ(u + 0, h.x, h.y, h.z), r.setXYZ(u + 1, h.x, h.y, h.z), r.setXYZ(u + 2, h.x, h.y, h.z);
        this.normalizeNormals(), r.needsUpdate = !0;
      }
    }
    merge() {
      return console.error("THREE.BufferGeometry.merge() has been removed. Use THREE.BufferGeometryUtils.mergeBufferGeometries() instead."), this;
    }
    normalizeNormals() {
      let e = this.attributes.normal;
      for (let t = 0, r = e.count; t < r; t++) Pt.fromBufferAttribute(e, t), Pt.normalize(), e.setXYZ(t, Pt.x, Pt.y, Pt.z);
    }
    toNonIndexed() {
      function e(a, l) {
        let c = a.array,
          h = a.itemSize,
          d = a.normalized,
          u = new c.constructor(l.length * h),
          p = 0,
          g = 0;
        for (let f = 0, m = l.length; f < m; f++) {
          a.isInterleavedBufferAttribute ? p = l[f] * a.data.stride + a.offset : p = l[f] * h;
          for (let v = 0; v < h; v++) u[g++] = c[p++];
        }
        return new Qt(u, h, d);
      }
      if (this.index === null) return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."), this;
      let t = new i(),
        r = this.index.array,
        n = this.attributes;
      for (let a in n) {
        let l = n[a],
          c = e(l, r);
        t.setAttribute(a, c);
      }
      let s = this.morphAttributes;
      for (let a in s) {
        let l = [],
          c = s[a];
        for (let h = 0, d = c.length; h < d; h++) {
          let u = c[h],
            p = e(u, r);
          l.push(p);
        }
        t.morphAttributes[a] = l;
      }
      t.morphTargetsRelative = this.morphTargetsRelative;
      let o = this.groups;
      for (let a = 0, l = o.length; a < l; a++) {
        let c = o[a];
        t.addGroup(c.start, c.count, c.materialIndex);
      }
      return t;
    }
    toJSON() {
      let e = {
        metadata: {
          version: 4.5,
          type: "BufferGeometry",
          generator: "BufferGeometry.toJSON"
        }
      };
      if (e.uuid = this.uuid, e.type = this.type, this.name !== "" && (e.name = this.name), Object.keys(this.userData).length > 0 && (e.userData = this.userData), this.parameters !== void 0) {
        let l = this.parameters;
        for (let c in l) l[c] !== void 0 && (e[c] = l[c]);
        return e;
      }
      e.data = {
        attributes: {}
      };
      let t = this.index;
      t !== null && (e.data.index = {
        type: t.array.constructor.name,
        array: Array.prototype.slice.call(t.array)
      });
      let r = this.attributes;
      for (let l in r) {
        let c = r[l];
        e.data.attributes[l] = c.toJSON(e.data);
      }
      let n = {},
        s = !1;
      for (let l in this.morphAttributes) {
        let c = this.morphAttributes[l],
          h = [];
        for (let d = 0, u = c.length; d < u; d++) {
          let p = c[d];
          h.push(p.toJSON(e.data));
        }
        h.length > 0 && (n[l] = h, s = !0);
      }
      s && (e.data.morphAttributes = n, e.data.morphTargetsRelative = this.morphTargetsRelative);
      let o = this.groups;
      o.length > 0 && (e.data.groups = JSON.parse(JSON.stringify(o)));
      let a = this.boundingSphere;
      return a !== null && (e.data.boundingSphere = {
        center: a.center.toArray(),
        radius: a.radius
      }), e;
    }
    clone() {
      return new this.constructor().copy(this);
    }
    copy(e) {
      this.index = null, this.attributes = {}, this.morphAttributes = {}, this.groups = [], this.boundingBox = null, this.boundingSphere = null;
      let t = {};
      this.name = e.name;
      let r = e.index;
      r !== null && this.setIndex(r.clone(t));
      let n = e.attributes;
      for (let c in n) {
        let h = n[c];
        this.setAttribute(c, h.clone(t));
      }
      let s = e.morphAttributes;
      for (let c in s) {
        let h = [],
          d = s[c];
        for (let u = 0, p = d.length; u < p; u++) h.push(d[u].clone(t));
        this.morphAttributes[c] = h;
      }
      this.morphTargetsRelative = e.morphTargetsRelative;
      let o = e.groups;
      for (let c = 0, h = o.length; c < h; c++) {
        let d = o[c];
        this.addGroup(d.start, d.count, d.materialIndex);
      }
      let a = e.boundingBox;
      a !== null && (this.boundingBox = a.clone());
      let l = e.boundingSphere;
      return l !== null && (this.boundingSphere = l.clone()), this.drawRange.start = e.drawRange.start, this.drawRange.count = e.drawRange.count, this.userData = e.userData, this;
    }
    dispose() {
      this.dispatchEvent({
        type: "dispose"
      });
    }
  },
  wh = new at(),
  Or = new Ca(),
  qs = new zn(),
  _h = new C(),
  Jn = new C(),
  Kn = new C(),
  Qn = new C(),
  Go = new C(),
  Xs = new C(),
  Ys = new se(),
  Zs = new se(),
  Js = new se(),
  Vo = new C(),
  Ks = new C(),
  pt = class extends kt {
    constructor(e = new Tt(), t = new Ei()) {
      super(), this.isMesh = !0, this.type = "Mesh", this.geometry = e, this.material = t, this.updateMorphTargets();
    }
    copy(e, t) {
      return super.copy(e, t), e.morphTargetInfluences !== void 0 && (this.morphTargetInfluences = e.morphTargetInfluences.slice()), e.morphTargetDictionary !== void 0 && (this.morphTargetDictionary = Object.assign({}, e.morphTargetDictionary)), this.material = e.material, this.geometry = e.geometry, this;
    }
    updateMorphTargets() {
      let e = this.geometry.morphAttributes,
        t = Object.keys(e);
      if (t.length > 0) {
        let r = e[t[0]];
        if (r !== void 0) {
          this.morphTargetInfluences = [], this.morphTargetDictionary = {};
          for (let n = 0, s = r.length; n < s; n++) {
            let o = r[n].name || String(n);
            this.morphTargetInfluences.push(0), this.morphTargetDictionary[o] = n;
          }
        }
      }
    }
    getVertexPosition(e, t) {
      let r = this.geometry,
        n = r.attributes.position,
        s = r.morphAttributes.position,
        o = r.morphTargetsRelative;
      t.fromBufferAttribute(n, e);
      let a = this.morphTargetInfluences;
      if (s && a) {
        Xs.set(0, 0, 0);
        for (let l = 0, c = s.length; l < c; l++) {
          let h = a[l],
            d = s[l];
          h !== 0 && (Go.fromBufferAttribute(d, e), o ? Xs.addScaledVector(Go, h) : Xs.addScaledVector(Go.sub(t), h));
        }
        t.add(Xs);
      }
      return this.isSkinnedMesh && this.boneTransform(e, t), t;
    }
    raycast(e, t) {
      let r = this.geometry,
        n = this.material,
        s = this.matrixWorld;
      if (n === void 0 || (r.boundingSphere === null && r.computeBoundingSphere(), qs.copy(r.boundingSphere), qs.applyMatrix4(s), Or.copy(e.ray).recast(e.near), qs.containsPoint(Or.origin) === !1 && (Or.intersectSphere(qs, _h) === null || Or.origin.distanceToSquared(_h) > (e.far - e.near) ** 2)) || (wh.copy(s).invert(), Or.copy(e.ray).applyMatrix4(wh), r.boundingBox !== null && Or.intersectsBox(r.boundingBox) === !1)) return;
      let o,
        a = r.index,
        l = r.attributes.position,
        c = r.attributes.uv,
        h = r.attributes.uv2,
        d = r.groups,
        u = r.drawRange;
      if (a !== null) {
        if (Array.isArray(n)) for (let p = 0, g = d.length; p < g; p++) {
          let f = d[p],
            m = n[f.materialIndex],
            v = Math.max(f.start, u.start),
            y = Math.min(a.count, Math.min(f.start + f.count, u.start + u.count));
          for (let x = v, b = y; x < b; x += 3) {
            let w = a.getX(x),
              A = a.getX(x + 1),
              L = a.getX(x + 2);
            o = Qs(this, m, e, Or, c, h, w, A, L), o && (o.faceIndex = Math.floor(x / 3), o.face.materialIndex = f.materialIndex, t.push(o));
          }
        } else {
          let p = Math.max(0, u.start),
            g = Math.min(a.count, u.start + u.count);
          for (let f = p, m = g; f < m; f += 3) {
            let v = a.getX(f),
              y = a.getX(f + 1),
              x = a.getX(f + 2);
            o = Qs(this, n, e, Or, c, h, v, y, x), o && (o.faceIndex = Math.floor(f / 3), t.push(o));
          }
        }
      } else if (l !== void 0) if (Array.isArray(n)) for (let p = 0, g = d.length; p < g; p++) {
        let f = d[p],
          m = n[f.materialIndex],
          v = Math.max(f.start, u.start),
          y = Math.min(l.count, Math.min(f.start + f.count, u.start + u.count));
        for (let x = v, b = y; x < b; x += 3) {
          let w = x,
            A = x + 1,
            L = x + 2;
          o = Qs(this, m, e, Or, c, h, w, A, L), o && (o.faceIndex = Math.floor(x / 3), o.face.materialIndex = f.materialIndex, t.push(o));
        }
      } else {
        let p = Math.max(0, u.start),
          g = Math.min(l.count, u.start + u.count);
        for (let f = p, m = g; f < m; f += 3) {
          let v = f,
            y = f + 1,
            x = f + 2;
          o = Qs(this, n, e, Or, c, h, v, y, x), o && (o.faceIndex = Math.floor(f / 3), t.push(o));
        }
      }
    }
  };
function Cf(i, e, t, r, n, s, o, a) {
  let l;
  if (e.side === or ? l = r.intersectTriangle(o, s, n, !0, a) : l = r.intersectTriangle(n, s, o, e.side === wi, a), l === null) return null;
  Ks.copy(a), Ks.applyMatrix4(i.matrixWorld);
  let c = t.ray.origin.distanceTo(Ks);
  return c < t.near || c > t.far ? null : {
    distance: c,
    point: Ks.clone(),
    object: i
  };
}
function Qs(i, e, t, r, n, s, o, a, l) {
  i.getVertexPosition(o, Jn), i.getVertexPosition(a, Kn), i.getVertexPosition(l, Qn);
  let c = Cf(i, e, t, r, Jn, Kn, Qn, Vo);
  if (c) {
    n && (Ys.fromBufferAttribute(n, o), Zs.fromBufferAttribute(n, a), Js.fromBufferAttribute(n, l), c.uv = Tn.getUV(Vo, Jn, Kn, Qn, Ys, Zs, Js, new se())), s && (Ys.fromBufferAttribute(s, o), Zs.fromBufferAttribute(s, a), Js.fromBufferAttribute(s, l), c.uv2 = Tn.getUV(Vo, Jn, Kn, Qn, Ys, Zs, Js, new se()));
    let h = {
      a: o,
      b: a,
      c: l,
      normal: new C(),
      materialIndex: 0
    };
    Tn.getNormal(Jn, Kn, Qn, h.normal), c.face = h;
  }
  return c;
}
var bs = class i extends Tt {
  constructor(e = 1, t = 1, r = 1, n = 1, s = 1, o = 1) {
    super(), this.type = "BoxGeometry", this.parameters = {
      width: e,
      height: t,
      depth: r,
      widthSegments: n,
      heightSegments: s,
      depthSegments: o
    };
    let a = this;
    n = Math.floor(n), s = Math.floor(s), o = Math.floor(o);
    let l = [],
      c = [],
      h = [],
      d = [],
      u = 0,
      p = 0;
    g("z", "y", "x", -1, -1, r, t, e, o, s, 0), g("z", "y", "x", 1, -1, r, t, -e, o, s, 1), g("x", "z", "y", 1, 1, e, r, t, n, o, 2), g("x", "z", "y", 1, -1, e, r, -t, n, o, 3), g("x", "y", "z", 1, -1, e, t, r, n, s, 4), g("x", "y", "z", -1, -1, e, t, -r, n, s, 5), this.setIndex(l), this.setAttribute("position", new Ye(c, 3)), this.setAttribute("normal", new Ye(h, 3)), this.setAttribute("uv", new Ye(d, 2));
    function g(f, m, v, y, x, b, w, A, L, M, T) {
      let R = b / L,
        H = w / M,
        Z = b / 2,
        O = w / 2,
        z = A / 2,
        j = L + 1,
        ie = M + 1,
        oe = 0,
        $ = 0,
        ae = new C();
      for (let te = 0; te < ie; te++) {
        let be = te * H - O;
        for (let V = 0; V < j; V++) {
          let re = V * R - Z;
          ae[f] = re * y, ae[m] = be * x, ae[v] = z, c.push(ae.x, ae.y, ae.z), ae[f] = 0, ae[m] = 0, ae[v] = A > 0 ? 1 : -1, h.push(ae.x, ae.y, ae.z), d.push(V / L), d.push(1 - te / M), oe += 1;
        }
      }
      for (let te = 0; te < M; te++) for (let be = 0; be < L; be++) {
        let V = u + be + j * te,
          re = u + be + j * (te + 1),
          de = u + (be + 1) + j * (te + 1),
          W = u + (be + 1) + j * te;
        l.push(V, re, W), l.push(re, de, W), $ += 6;
      }
      a.addGroup(p, $, T), p += $, u += oe;
    }
  }
  copy(e) {
    return super.copy(e), this.parameters = Object.assign({}, e.parameters), this;
  }
  static fromJSON(e) {
    return new i(e.width, e.height, e.depth, e.widthSegments, e.heightSegments, e.depthSegments);
  }
};
function In(i) {
  let e = {};
  for (let t in i) {
    e[t] = {};
    for (let r in i[t]) {
      let n = i[t][r];
      n && (n.isColor || n.isMatrix3 || n.isMatrix4 || n.isVector2 || n.isVector3 || n.isVector4 || n.isTexture || n.isQuaternion) ? e[t][r] = n.clone() : Array.isArray(n) ? e[t][r] = n.slice() : e[t][r] = n;
    }
  }
  return e;
}
function Yt(i) {
  let e = {};
  for (let t = 0; t < i.length; t++) {
    let r = In(i[t]);
    for (let n in r) e[n] = r[n];
  }
  return e;
}
function Rf(i) {
  let e = [];
  for (let t = 0; t < i.length; t++) e.push(i[t].clone());
  return e;
}
function Uu(i) {
  return i.getRenderTarget() === null && i.outputEncoding === Ke ? Nr : ro;
}
var Pf = {
    clone: In,
    merge: Yt
  },
  Lf = `void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,
  Df = `void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,
  oi = class extends ai {
    constructor(e) {
      super(), this.isShaderMaterial = !0, this.type = "ShaderMaterial", this.defines = {}, this.uniforms = {}, this.uniformsGroups = [], this.vertexShader = Lf, this.fragmentShader = Df, this.linewidth = 1, this.wireframe = !1, this.wireframeLinewidth = 1, this.fog = !1, this.lights = !1, this.clipping = !1, this.extensions = {
        derivatives: !1,
        fragDepth: !1,
        drawBuffers: !1,
        shaderTextureLOD: !1
      }, this.defaultAttributeValues = {
        color: [1, 1, 1],
        uv: [0, 0],
        uv2: [0, 0]
      }, this.index0AttributeName = void 0, this.uniformsNeedUpdate = !1, this.glslVersion = null, e !== void 0 && this.setValues(e);
    }
    copy(e) {
      return super.copy(e), this.fragmentShader = e.fragmentShader, this.vertexShader = e.vertexShader, this.uniforms = In(e.uniforms), this.uniformsGroups = Rf(e.uniformsGroups), this.defines = Object.assign({}, e.defines), this.wireframe = e.wireframe, this.wireframeLinewidth = e.wireframeLinewidth, this.fog = e.fog, this.lights = e.lights, this.clipping = e.clipping, this.extensions = Object.assign({}, e.extensions), this.glslVersion = e.glslVersion, this;
    }
    toJSON(e) {
      let t = super.toJSON(e);
      t.glslVersion = this.glslVersion, t.uniforms = {};
      for (let n in this.uniforms) {
        let s = this.uniforms[n].value;
        s && s.isTexture ? t.uniforms[n] = {
          type: "t",
          value: s.toJSON(e).uuid
        } : s && s.isColor ? t.uniforms[n] = {
          type: "c",
          value: s.getHex()
        } : s && s.isVector2 ? t.uniforms[n] = {
          type: "v2",
          value: s.toArray()
        } : s && s.isVector3 ? t.uniforms[n] = {
          type: "v3",
          value: s.toArray()
        } : s && s.isVector4 ? t.uniforms[n] = {
          type: "v4",
          value: s.toArray()
        } : s && s.isMatrix3 ? t.uniforms[n] = {
          type: "m3",
          value: s.toArray()
        } : s && s.isMatrix4 ? t.uniforms[n] = {
          type: "m4",
          value: s.toArray()
        } : t.uniforms[n] = {
          value: s
        };
      }
      Object.keys(this.defines).length > 0 && (t.defines = this.defines), t.vertexShader = this.vertexShader, t.fragmentShader = this.fragmentShader;
      let r = {};
      for (let n in this.extensions) this.extensions[n] === !0 && (r[n] = !0);
      return Object.keys(r).length > 0 && (t.extensions = r), t;
    }
  },
  za = class extends kt {
    constructor() {
      super(), this.isCamera = !0, this.type = "Camera", this.matrixWorldInverse = new at(), this.projectionMatrix = new at(), this.projectionMatrixInverse = new at();
    }
    copy(e, t) {
      return super.copy(e, t), this.matrixWorldInverse.copy(e.matrixWorldInverse), this.projectionMatrix.copy(e.projectionMatrix), this.projectionMatrixInverse.copy(e.projectionMatrixInverse), this;
    }
    getWorldDirection(e) {
      this.updateWorldMatrix(!0, !1);
      let t = this.matrixWorld.elements;
      return e.set(-t[8], -t[9], -t[10]).normalize();
    }
    updateMatrixWorld(e) {
      super.updateMatrixWorld(e), this.matrixWorldInverse.copy(this.matrixWorld).invert();
    }
    updateWorldMatrix(e, t) {
      super.updateWorldMatrix(e, t), this.matrixWorldInverse.copy(this.matrixWorld).invert();
    }
    clone() {
      return new this.constructor().copy(this);
    }
  },
  Ot = class extends za {
    constructor(e = 50, t = 1, r = 0.1, n = 2e3) {
      super(), this.isPerspectiveCamera = !0, this.type = "PerspectiveCamera", this.fov = e, this.zoom = 1, this.near = r, this.far = n, this.focus = 10, this.aspect = t, this.view = null, this.filmGauge = 35, this.filmOffset = 0, this.updateProjectionMatrix();
    }
    copy(e, t) {
      return super.copy(e, t), this.fov = e.fov, this.zoom = e.zoom, this.near = e.near, this.far = e.far, this.focus = e.focus, this.aspect = e.aspect, this.view = e.view === null ? null : Object.assign({}, e.view), this.filmGauge = e.filmGauge, this.filmOffset = e.filmOffset, this;
    }
    setFocalLength(e) {
      let t = 0.5 * this.getFilmHeight() / e;
      this.fov = dh * 2 * Math.atan(t), this.updateProjectionMatrix();
    }
    getFocalLength() {
      let e = Math.tan(wo * 0.5 * this.fov);
      return 0.5 * this.getFilmHeight() / e;
    }
    getEffectiveFOV() {
      return dh * 2 * Math.atan(Math.tan(wo * 0.5 * this.fov) / this.zoom);
    }
    getFilmWidth() {
      return this.filmGauge * Math.min(this.aspect, 1);
    }
    getFilmHeight() {
      return this.filmGauge / Math.max(this.aspect, 1);
    }
    setViewOffset(e, t, r, n, s, o) {
      this.aspect = e / t, this.view === null && (this.view = {
        enabled: !0,
        fullWidth: 1,
        fullHeight: 1,
        offsetX: 0,
        offsetY: 0,
        width: 1,
        height: 1
      }), this.view.enabled = !0, this.view.fullWidth = e, this.view.fullHeight = t, this.view.offsetX = r, this.view.offsetY = n, this.view.width = s, this.view.height = o, this.updateProjectionMatrix();
    }
    clearViewOffset() {
      this.view !== null && (this.view.enabled = !1), this.updateProjectionMatrix();
    }
    updateProjectionMatrix() {
      let e = this.near,
        t = e * Math.tan(wo * 0.5 * this.fov) / this.zoom,
        r = 2 * t,
        n = this.aspect * r,
        s = -0.5 * n,
        o = this.view;
      if (this.view !== null && this.view.enabled) {
        let l = o.fullWidth,
          c = o.fullHeight;
        s += o.offsetX * n / l, t -= o.offsetY * r / c, n *= o.width / l, r *= o.height / c;
      }
      let a = this.filmOffset;
      a !== 0 && (s += e * a / this.getFilmWidth()), this.projectionMatrix.makePerspective(s, s + n, t, t - r, e, this.far), this.projectionMatrixInverse.copy(this.projectionMatrix).invert();
    }
    toJSON(e) {
      let t = super.toJSON(e);
      return t.object.fov = this.fov, t.object.zoom = this.zoom, t.object.near = this.near, t.object.far = this.far, t.object.focus = this.focus, t.object.aspect = this.aspect, this.view !== null && (t.object.view = Object.assign({}, this.view)), t.object.filmGauge = this.filmGauge, t.object.filmOffset = this.filmOffset, t;
    }
  },
  dn = -90,
  pn = 1,
  xc = class extends kt {
    constructor(e, t, r) {
      super(), this.type = "CubeCamera", this.renderTarget = r;
      let n = new Ot(dn, pn, e, t);
      n.layers = this.layers, n.up.set(0, 1, 0), n.lookAt(1, 0, 0), this.add(n);
      let s = new Ot(dn, pn, e, t);
      s.layers = this.layers, s.up.set(0, 1, 0), s.lookAt(-1, 0, 0), this.add(s);
      let o = new Ot(dn, pn, e, t);
      o.layers = this.layers, o.up.set(0, 0, -1), o.lookAt(0, 1, 0), this.add(o);
      let a = new Ot(dn, pn, e, t);
      a.layers = this.layers, a.up.set(0, 0, 1), a.lookAt(0, -1, 0), this.add(a);
      let l = new Ot(dn, pn, e, t);
      l.layers = this.layers, l.up.set(0, 1, 0), l.lookAt(0, 0, 1), this.add(l);
      let c = new Ot(dn, pn, e, t);
      c.layers = this.layers, c.up.set(0, 1, 0), c.lookAt(0, 0, -1), this.add(c);
    }
    update(e, t) {
      this.parent === null && this.updateMatrixWorld();
      let r = this.renderTarget,
        [n, s, o, a, l, c] = this.children,
        h = e.getRenderTarget(),
        d = e.toneMapping,
        u = e.xr.enabled;
      e.toneMapping = ri, e.xr.enabled = !1;
      let p = r.texture.generateMipmaps;
      r.texture.generateMipmaps = !1, e.setRenderTarget(r, 0), e.render(t, n), e.setRenderTarget(r, 1), e.render(t, s), e.setRenderTarget(r, 2), e.render(t, o), e.setRenderTarget(r, 3), e.render(t, a), e.setRenderTarget(r, 4), e.render(t, l), r.texture.generateMipmaps = p, e.setRenderTarget(r, 5), e.render(t, c), e.setRenderTarget(h), e.toneMapping = d, e.xr.enabled = u, r.texture.needsPMREMUpdate = !0;
    }
  },
  Ia = class extends vr {
    constructor(e, t, r, n, s, o, a, l, c, h) {
      e = e !== void 0 ? e : [], t = t !== void 0 ? t : Rn, super(e, t, r, n, s, o, a, l, c, h), this.isCubeTexture = !0, this.flipY = !1;
    }
    get images() {
      return this.image;
    }
    set images(e) {
      this.image = e;
    }
  },
  yc = class extends si {
    constructor(e = 1, t = {}) {
      super(e, e, t), this.isWebGLCubeRenderTarget = !0;
      let r = {
          width: e,
          height: e,
          depth: 1
        },
        n = [r, r, r, r, r, r];
      this.texture = new Ia(n, t.mapping, t.wrapS, t.wrapT, t.magFilter, t.minFilter, t.format, t.type, t.anisotropy, t.encoding), this.texture.isRenderTargetTexture = !0, this.texture.generateMipmaps = t.generateMipmaps !== void 0 ? t.generateMipmaps : !1, this.texture.minFilter = t.minFilter !== void 0 ? t.minFilter : It;
    }
    fromEquirectangularTexture(e, t) {
      this.texture.type = t.type, this.texture.encoding = t.encoding, this.texture.generateMipmaps = t.generateMipmaps, this.texture.minFilter = t.minFilter, this.texture.magFilter = t.magFilter;
      let r = {
          uniforms: {
            tEquirect: {
              value: null
            }
          },
          vertexShader: `

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,
          fragmentShader: `

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`
        },
        n = new bs(5, 5, 5),
        s = new oi({
          name: "CubemapFromEquirect",
          uniforms: In(r.uniforms),
          vertexShader: r.vertexShader,
          fragmentShader: r.fragmentShader,
          side: or,
          blending: bi
        });
      s.uniforms.tEquirect.value = t;
      let o = new pt(n, s),
        a = t.minFilter;
      return t.minFilter === qr && (t.minFilter = It), new xc(1, 10, this).update(e, o), t.minFilter = a, o.geometry.dispose(), o.material.dispose(), this;
    }
    clear(e, t, r, n) {
      let s = e.getRenderTarget();
      for (let o = 0; o < 6; o++) e.setRenderTarget(this, o), e.clear(t, r, n);
      e.setRenderTarget(s);
    }
  },
  Wo = new C(),
  zf = new C(),
  If = new Kt(),
  ei = class {
    constructor(e = new C(1, 0, 0), t = 0) {
      this.isPlane = !0, this.normal = e, this.constant = t;
    }
    set(e, t) {
      return this.normal.copy(e), this.constant = t, this;
    }
    setComponents(e, t, r, n) {
      return this.normal.set(e, t, r), this.constant = n, this;
    }
    setFromNormalAndCoplanarPoint(e, t) {
      return this.normal.copy(e), this.constant = -t.dot(this.normal), this;
    }
    setFromCoplanarPoints(e, t, r) {
      let n = Wo.subVectors(r, t).cross(zf.subVectors(e, t)).normalize();
      return this.setFromNormalAndCoplanarPoint(n, e), this;
    }
    copy(e) {
      return this.normal.copy(e.normal), this.constant = e.constant, this;
    }
    normalize() {
      let e = 1 / this.normal.length();
      return this.normal.multiplyScalar(e), this.constant *= e, this;
    }
    negate() {
      return this.constant *= -1, this.normal.negate(), this;
    }
    distanceToPoint(e) {
      return this.normal.dot(e) + this.constant;
    }
    distanceToSphere(e) {
      return this.distanceToPoint(e.center) - e.radius;
    }
    projectPoint(e, t) {
      return t.copy(e).addScaledVector(this.normal, -this.distanceToPoint(e));
    }
    intersectLine(e, t) {
      let r = e.delta(Wo),
        n = this.normal.dot(r);
      if (n === 0) return this.distanceToPoint(e.start) === 0 ? t.copy(e.start) : null;
      let s = -(e.start.dot(this.normal) + this.constant) / n;
      return s < 0 || s > 1 ? null : t.copy(e.start).addScaledVector(r, s);
    }
    intersectsLine(e) {
      let t = this.distanceToPoint(e.start),
        r = this.distanceToPoint(e.end);
      return t < 0 && r > 0 || r < 0 && t > 0;
    }
    intersectsBox(e) {
      return e.intersectsPlane(this);
    }
    intersectsSphere(e) {
      return e.intersectsPlane(this);
    }
    coplanarPoint(e) {
      return e.copy(this.normal).multiplyScalar(-this.constant);
    }
    applyMatrix4(e, t) {
      let r = t || If.getNormalMatrix(e),
        n = this.coplanarPoint(Wo).applyMatrix4(e),
        s = this.normal.applyMatrix3(r).normalize();
      return this.constant = -n.dot(s), this;
    }
    translate(e) {
      return this.constant -= e.dot(this.normal), this;
    }
    equals(e) {
      return e.normal.equals(this.normal) && e.constant === this.constant;
    }
    clone() {
      return new this.constructor().copy(this);
    }
  },
  fn = new zn(),
  $s = new C(),
  Ms = class {
    constructor(e = new ei(), t = new ei(), r = new ei(), n = new ei(), s = new ei(), o = new ei()) {
      this.planes = [e, t, r, n, s, o];
    }
    set(e, t, r, n, s, o) {
      let a = this.planes;
      return a[0].copy(e), a[1].copy(t), a[2].copy(r), a[3].copy(n), a[4].copy(s), a[5].copy(o), this;
    }
    copy(e) {
      let t = this.planes;
      for (let r = 0; r < 6; r++) t[r].copy(e.planes[r]);
      return this;
    }
    setFromProjectionMatrix(e) {
      let t = this.planes,
        r = e.elements,
        n = r[0],
        s = r[1],
        o = r[2],
        a = r[3],
        l = r[4],
        c = r[5],
        h = r[6],
        d = r[7],
        u = r[8],
        p = r[9],
        g = r[10],
        f = r[11],
        m = r[12],
        v = r[13],
        y = r[14],
        x = r[15];
      return t[0].setComponents(a - n, d - l, f - u, x - m).normalize(), t[1].setComponents(a + n, d + l, f + u, x + m).normalize(), t[2].setComponents(a + s, d + c, f + p, x + v).normalize(), t[3].setComponents(a - s, d - c, f - p, x - v).normalize(), t[4].setComponents(a - o, d - h, f - g, x - y).normalize(), t[5].setComponents(a + o, d + h, f + g, x + y).normalize(), this;
    }
    intersectsObject(e) {
      let t = e.geometry;
      return t.boundingSphere === null && t.computeBoundingSphere(), fn.copy(t.boundingSphere).applyMatrix4(e.matrixWorld), this.intersectsSphere(fn);
    }
    intersectsSprite(e) {
      return fn.center.set(0, 0, 0), fn.radius = 0.7071067811865476, fn.applyMatrix4(e.matrixWorld), this.intersectsSphere(fn);
    }
    intersectsSphere(e) {
      let t = this.planes,
        r = e.center,
        n = -e.radius;
      for (let s = 0; s < 6; s++) if (t[s].distanceToPoint(r) < n) return !1;
      return !0;
    }
    intersectsBox(e) {
      let t = this.planes;
      for (let r = 0; r < 6; r++) {
        let n = t[r];
        if ($s.x = n.normal.x > 0 ? e.max.x : e.min.x, $s.y = n.normal.y > 0 ? e.max.y : e.min.y, $s.z = n.normal.z > 0 ? e.max.z : e.min.z, n.distanceToPoint($s) < 0) return !1;
      }
      return !0;
    }
    containsPoint(e) {
      let t = this.planes;
      for (let r = 0; r < 6; r++) if (t[r].distanceToPoint(e) < 0) return !1;
      return !0;
    }
    clone() {
      return new this.constructor().copy(this);
    }
  };
function Fu() {
  let i = null,
    e = !1,
    t = null,
    r = null;
  function n(s, o) {
    t(s, o), r = i.requestAnimationFrame(n);
  }
  return {
    start: function () {
      e !== !0 && t !== null && (r = i.requestAnimationFrame(n), e = !0);
    },
    stop: function () {
      i.cancelAnimationFrame(r), e = !1;
    },
    setAnimationLoop: function (s) {
      t = s;
    },
    setContext: function (s) {
      i = s;
    }
  };
}
function Of(i, e) {
  let t = e.isWebGL2,
    r = new WeakMap();
  function n(c, h) {
    let d = c.array,
      u = c.usage,
      p = i.createBuffer();
    i.bindBuffer(h, p), i.bufferData(h, d, u), c.onUploadCallback();
    let g;
    if (d instanceof Float32Array) g = 5126;else if (d instanceof Uint16Array) {
      if (c.isFloat16BufferAttribute) {
        if (t) g = 5131;else throw new Error("THREE.WebGLAttributes: Usage of Float16BufferAttribute requires WebGL2.");
      } else g = 5123;
    } else if (d instanceof Int16Array) g = 5122;else if (d instanceof Uint32Array) g = 5125;else if (d instanceof Int32Array) g = 5124;else if (d instanceof Int8Array) g = 5120;else if (d instanceof Uint8Array) g = 5121;else if (d instanceof Uint8ClampedArray) g = 5121;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: " + d);
    return {
      buffer: p,
      type: g,
      bytesPerElement: d.BYTES_PER_ELEMENT,
      version: c.version
    };
  }
  function s(c, h, d) {
    let u = h.array,
      p = h.updateRange;
    i.bindBuffer(d, c), p.count === -1 ? i.bufferSubData(d, 0, u) : (t ? i.bufferSubData(d, p.offset * u.BYTES_PER_ELEMENT, u, p.offset, p.count) : i.bufferSubData(d, p.offset * u.BYTES_PER_ELEMENT, u.subarray(p.offset, p.offset + p.count)), p.count = -1), h.onUploadCallback();
  }
  function o(c) {
    return c.isInterleavedBufferAttribute && (c = c.data), r.get(c);
  }
  function a(c) {
    c.isInterleavedBufferAttribute && (c = c.data);
    let h = r.get(c);
    h && (i.deleteBuffer(h.buffer), r.delete(c));
  }
  function l(c, h) {
    if (c.isGLBufferAttribute) {
      let u = r.get(c);
      (!u || u.version < c.version) && r.set(c, {
        buffer: c.buffer,
        type: c.type,
        bytesPerElement: c.elementSize,
        version: c.version
      });
      return;
    }
    c.isInterleavedBufferAttribute && (c = c.data);
    let d = r.get(c);
    d === void 0 ? r.set(c, n(c, h)) : d.version < c.version && (s(d.buffer, c, h), d.version = c.version);
  }
  return {
    get: o,
    remove: a,
    update: l
  };
}
var yi = class i extends Tt {
    constructor(e = 1, t = 1, r = 1, n = 1) {
      super(), this.type = "PlaneGeometry", this.parameters = {
        width: e,
        height: t,
        widthSegments: r,
        heightSegments: n
      };
      let s = e / 2,
        o = t / 2,
        a = Math.floor(r),
        l = Math.floor(n),
        c = a + 1,
        h = l + 1,
        d = e / a,
        u = t / l,
        p = [],
        g = [],
        f = [],
        m = [];
      for (let v = 0; v < h; v++) {
        let y = v * u - o;
        for (let x = 0; x < c; x++) {
          let b = x * d - s;
          g.push(b, -y, 0), f.push(0, 0, 1), m.push(x / a), m.push(1 - v / l);
        }
      }
      for (let v = 0; v < l; v++) for (let y = 0; y < a; y++) {
        let x = y + c * v,
          b = y + c * (v + 1),
          w = y + 1 + c * (v + 1),
          A = y + 1 + c * v;
        p.push(x, b, A), p.push(b, w, A);
      }
      this.setIndex(p), this.setAttribute("position", new Ye(g, 3)), this.setAttribute("normal", new Ye(f, 3)), this.setAttribute("uv", new Ye(m, 2));
    }
    copy(e) {
      return super.copy(e), this.parameters = Object.assign({}, e.parameters), this;
    }
    static fromJSON(e) {
      return new i(e.width, e.height, e.widthSegments, e.heightSegments);
    }
  },
  Nf = `#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vUv ).g;
#endif`,
  kf = `#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,
  Uf = `#ifdef USE_ALPHATEST
	if ( diffuseColor.a < alphaTest ) discard;
#endif`,
  Ff = `#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,
  Bf = `#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vUv2 ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometry.normal, geometry.viewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,
  Gf = `#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,
  Vf = "vec3 transformed = vec3( position );",
  Wf = `vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,
  Hf = `vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 f0, const in float f90, const in float roughness ) {
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
	float D = D_GGX( alpha, dotNH );
	return F * ( V * D );
}
#ifdef USE_IRIDESCENCE
	vec3 BRDF_GGX_Iridescence( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 f0, const in float f90, const in float iridescence, const in vec3 iridescenceFresnel, const in float roughness ) {
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = mix( F_Schlick( f0, f90, dotVH ), iridescenceFresnel, iridescence );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transposeMat3( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif`,
  jf = `#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			 return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float R21 = R12;
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,
  qf = `#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vUv );
		vec2 dSTdy = dFdy( vUv );
		float Hll = bumpScale * texture2D( bumpMap, vUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = dFdx( surf_pos.xyz );
		vec3 vSigmaY = dFdy( surf_pos.xyz );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,
  Xf = `#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#pragma unroll_loop_start
	for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
		plane = clippingPlanes[ i ];
		if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
	}
	#pragma unroll_loop_end
	#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
		bool clipped = true;
		#pragma unroll_loop_start
		for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
		}
		#pragma unroll_loop_end
		if ( clipped ) discard;
	#endif
#endif`,
  Yf = `#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,
  Zf = `#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,
  Jf = `#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,
  Kf = `#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,
  Qf = `#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,
  $f = `#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR )
	varying vec3 vColor;
#endif`,
  em = `#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif`,
  tm = `#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
struct GeometricContext {
	vec3 position;
	vec3 normal;
	vec3 viewDir;
#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal;
#endif
};
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
mat3 transposeMat3( const in mat3 m ) {
	mat3 tmp;
	tmp[ 0 ] = vec3( m[ 0 ].x, m[ 1 ].x, m[ 2 ].x );
	tmp[ 1 ] = vec3( m[ 0 ].y, m[ 1 ].y, m[ 2 ].y );
	tmp[ 2 ] = vec3( m[ 0 ].z, m[ 1 ].z, m[ 2 ].z );
	return tmp;
}
float luminance( const in vec3 rgb ) {
	const vec3 weights = vec3( 0.2126729, 0.7151522, 0.0721750 );
	return dot( weights, rgb );
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}`,
  rm = `#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_v0 0.339
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_v1 0.276
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_v4 0.046
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_v5 0.016
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_v6 0.0038
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,
  im = `vec3 transformedNormal = objectNormal;
#ifdef USE_INSTANCING
	mat3 m = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( m[ 0 ], m[ 0 ] ), dot( m[ 1 ], m[ 1 ] ), dot( m[ 2 ], m[ 2 ] ) );
	transformedNormal = m * transformedNormal;
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	vec3 transformedTangent = ( modelViewMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`,
  nm = `#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,
  sm = `#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vUv ).x * displacementScale + displacementBias );
#endif`,
  am = `#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vUv );
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,
  om = `#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,
  cm = "gl_FragColor = linearToOutputTexel( gl_FragColor );",
  lm = `vec4 LinearToLinear( in vec4 value ) {
	return value;
}
vec4 LinearTosRGB( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,
  hm = `#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
	#else
		vec4 envColor = vec4( 0.0 );
	#endif
	#ifdef ENVMAP_BLENDING_MULTIPLY
		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_MIX )
		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_ADD )
		outgoingLight += envColor.xyz * specularStrength * reflectivity;
	#endif
#endif`,
  um = `#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,
  dm = `#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,
  pm = `#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,
  fm = `#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,
  mm = `#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,
  gm = `#ifdef USE_FOG
	varying float vFogDepth;
#endif`,
  vm = `#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,
  xm = `#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,
  ym = `#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,
  bm = `#ifdef USE_LIGHTMAP
	vec4 lightMapTexel = texture2D( lightMap, vUv2 );
	vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
	reflectedLight.indirectDiffuse += lightMapIrradiance;
#endif`,
  Mm = `#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,
  Sm = `LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,
  wm = `varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in GeometricContext geometry, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometry.normal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in GeometricContext geometry, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,
  _m = `uniform bool receiveShadow;
uniform vec3 ambientLightColor;
uniform vec3 lightProbe[ 9 ];
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	#if defined ( LEGACY_LIGHTS )
		if ( cutoffDistance > 0.0 && decayExponent > 0.0 ) {
			return pow( saturate( - lightDistance / cutoffDistance + 1.0 ), decayExponent );
		}
		return 1.0;
	#else
		float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
		if ( cutoffDistance > 0.0 ) {
			distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
		}
		return distanceFalloff;
	#endif
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, const in GeometricContext geometry, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in GeometricContext geometry, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometry.position;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in GeometricContext geometry, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometry.position;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif`,
  Tm = `#if defined( USE_ENVMAP )
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#if defined( ENVMAP_TYPE_CUBE_UV )
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#if defined( ENVMAP_TYPE_CUBE_UV )
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
#endif`,
  Em = `ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,
  Am = `varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in GeometricContext geometry, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometry.normal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in GeometricContext geometry, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,
  Cm = `BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,
  Rm = `varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in GeometricContext geometry, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometry.normal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometry.viewDir, geometry.normal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in GeometricContext geometry, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,
  Pm = `PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );
vec3 dxy = max( abs( dFdx( geometryNormal ) ), abs( dFdy( geometryNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULARINTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vUv ).a;
		#endif
		#ifdef USE_SPECULARCOLORMAP
			specularColorFactor *= texture2D( specularColorMap, vUv ).rgb;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = mix( min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEENCOLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.07, 1.0 );
	#ifdef USE_SHEENROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vUv ).a;
	#endif
#endif`,
  Lm = `struct PhysicalMaterial {
	vec3 diffuseColor;
	float roughness;
	vec3 specularColor;
	float specularF90;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
};
vec3 clearcoatSpecular = vec3( 0.0 );
vec3 sheenSpecular = vec3( 0.0 );
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float a = roughness < 0.25 ? -339.2 * r2 + 161.4 * roughness - 25.9 : -8.48 * r2 + 14.3 * roughness - 9.95;
	float b = roughness < 0.25 ? 44.0 * r2 - 23.7 * roughness + 3.26 : 1.97 * r2 - 3.27 * roughness + 0.72;
	float DG = exp( a * dotNV + b ) + ( roughness < 0.25 ? 0.0 : 0.1 * ( roughness - 0.25 ) );
	return saturate( DG * RECIPROCAL_PI );
}
vec2 DFGApprox( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );
	const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );
	vec4 r = roughness * c0 + c1;
	float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;
	vec2 fab = vec2( - 1.04, 1.04 ) * a004 + r.zw;
	return fab;
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in GeometricContext geometry, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometry.normal;
		vec3 viewDir = geometry.viewDir;
		vec3 position = geometry.position;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColor * t2.x + ( vec3( 1.0 ) - material.specularColor ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in GeometricContext geometry, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometry.normal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometry.clearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecular += ccIrradiance * BRDF_GGX( directLight.direction, geometry.viewDir, geometry.clearcoatNormal, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecular += irradiance * BRDF_Sheen( directLight.direction, geometry.viewDir, geometry.normal, material.sheenColor, material.sheenRoughness );
	#endif
	#ifdef USE_IRIDESCENCE
		reflectedLight.directSpecular += irradiance * BRDF_GGX_Iridescence( directLight.direction, geometry.viewDir, geometry.normal, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnel, material.roughness );
	#else
		reflectedLight.directSpecular += irradiance * BRDF_GGX( directLight.direction, geometry.viewDir, geometry.normal, material.specularColor, material.specularF90, material.roughness );
	#endif
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in GeometricContext geometry, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in GeometricContext geometry, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecular += clearcoatRadiance * EnvironmentBRDF( geometry.clearcoatNormal, geometry.viewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecular += irradiance * material.sheenColor * IBLSheenBRDF( geometry.normal, geometry.viewDir, material.sheenRoughness );
	#endif
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometry.normal, geometry.viewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnel, material.roughness, singleScattering, multiScattering );
	#else
		computeMultiscattering( geometry.normal, geometry.viewDir, material.specularColor, material.specularF90, material.roughness, singleScattering, multiScattering );
	#endif
	vec3 totalScattering = singleScattering + multiScattering;
	vec3 diffuse = material.diffuseColor * ( 1.0 - max( max( totalScattering.r, totalScattering.g ), totalScattering.b ) );
	reflectedLight.indirectSpecular += radiance * singleScattering;
	reflectedLight.indirectSpecular += multiScattering * cosineWeightedIrradiance;
	reflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,
  Dm = `
GeometricContext geometry;
geometry.position = - vViewPosition;
geometry.normal = normal;
geometry.viewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
#ifdef USE_CLEARCOAT
	geometry.clearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometry.viewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnel = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometry, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometry, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometry, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometry, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, geometry, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometry, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometry, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	irradiance += getLightProbeIrradiance( lightProbe, geometry.normal );
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometry.normal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,
  zm = `#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vUv2 );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )
		iblIrradiance += getIBLIrradiance( geometry.normal );
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	radiance += getIBLRadiance( geometry.viewDir, geometry.normal, material.roughness );
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometry.viewDir, geometry.clearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,
  Im = `#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometry, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometry, material, reflectedLight );
#endif`,
  Om = `#if defined( USE_LOGDEPTHBUF ) && defined( USE_LOGDEPTHBUF_EXT )
	gl_FragDepthEXT = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,
  Nm = `#if defined( USE_LOGDEPTHBUF ) && defined( USE_LOGDEPTHBUF_EXT )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,
  km = `#ifdef USE_LOGDEPTHBUF
	#ifdef USE_LOGDEPTHBUF_EXT
		varying float vFragDepth;
		varying float vIsPerspective;
	#else
		uniform float logDepthBufFC;
	#endif
#endif`,
  Um = `#ifdef USE_LOGDEPTHBUF
	#ifdef USE_LOGDEPTHBUF_EXT
		vFragDepth = 1.0 + gl_Position.w;
		vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
	#else
		if ( isPerspectiveMatrix( projectionMatrix ) ) {
			gl_Position.z = log2( max( EPSILON, gl_Position.w + 1.0 ) ) * logDepthBufFC - 1.0;
			gl_Position.z *= gl_Position.w;
		}
	#endif
#endif`,
  Fm = `#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = vec4( mix( pow( sampledDiffuseColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), sampledDiffuseColor.rgb * 0.0773993808, vec3( lessThanEqual( sampledDiffuseColor.rgb, vec3( 0.04045 ) ) ) ), sampledDiffuseColor.w );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,
  Bm = `#ifdef USE_MAP
	uniform sampler2D map;
#endif`,
  Gm = `#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,
  Vm = `#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	uniform mat3 uvTransform;
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,
  Wm = `float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vUv );
	metalnessFactor *= texelMetalness.b;
#endif`,
  Hm = `#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,
  jm = `#if defined( USE_MORPHCOLORS ) && defined( MORPHTARGETS_TEXTURE )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,
  qm = `#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	#ifdef MORPHTARGETS_TEXTURE
		for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
			if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
		}
	#else
		objectNormal += morphNormal0 * morphTargetInfluences[ 0 ];
		objectNormal += morphNormal1 * morphTargetInfluences[ 1 ];
		objectNormal += morphNormal2 * morphTargetInfluences[ 2 ];
		objectNormal += morphNormal3 * morphTargetInfluences[ 3 ];
	#endif
#endif`,
  Xm = `#ifdef USE_MORPHTARGETS
	uniform float morphTargetBaseInfluence;
	#ifdef MORPHTARGETS_TEXTURE
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
		uniform sampler2DArray morphTargetsTexture;
		uniform ivec2 morphTargetsTextureSize;
		vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
			int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
			int y = texelIndex / morphTargetsTextureSize.x;
			int x = texelIndex - y * morphTargetsTextureSize.x;
			ivec3 morphUV = ivec3( x, y, morphTargetIndex );
			return texelFetch( morphTargetsTexture, morphUV, 0 );
		}
	#else
		#ifndef USE_MORPHNORMALS
			uniform float morphTargetInfluences[ 8 ];
		#else
			uniform float morphTargetInfluences[ 4 ];
		#endif
	#endif
#endif`,
  Ym = `#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	#ifdef MORPHTARGETS_TEXTURE
		for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
			if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
		}
	#else
		transformed += morphTarget0 * morphTargetInfluences[ 0 ];
		transformed += morphTarget1 * morphTargetInfluences[ 1 ];
		transformed += morphTarget2 * morphTargetInfluences[ 2 ];
		transformed += morphTarget3 * morphTargetInfluences[ 3 ];
		#ifndef USE_MORPHNORMALS
			transformed += morphTarget4 * morphTargetInfluences[ 4 ];
			transformed += morphTarget5 * morphTargetInfluences[ 5 ];
			transformed += morphTarget6 * morphTargetInfluences[ 6 ];
			transformed += morphTarget7 * morphTargetInfluences[ 7 ];
		#endif
	#endif
#endif`,
  Zm = `float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	#ifdef USE_TANGENT
		vec3 tangent = normalize( vTangent );
		vec3 bitangent = normalize( vBitangent );
		#ifdef DOUBLE_SIDED
			tangent = tangent * faceDirection;
			bitangent = bitangent * faceDirection;
		#endif
		#if defined( TANGENTSPACE_NORMALMAP ) || defined( USE_CLEARCOAT_NORMALMAP )
			mat3 vTBN = mat3( tangent, bitangent, normal );
		#endif
	#endif
#endif
vec3 geometryNormal = normal;`,
  Jm = `#ifdef OBJECTSPACE_NORMALMAP
	normal = texture2D( normalMap, vUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( TANGENTSPACE_NORMALMAP )
	vec3 mapN = texture2D( normalMap, vUv ).xyz * 2.0 - 1.0;
	mapN.xy *= normalScale;
	#ifdef USE_TANGENT
		normal = normalize( vTBN * mapN );
	#else
		normal = perturbNormal2Arb( - vViewPosition, normal, mapN, faceDirection );
	#endif
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,
  Km = `#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,
  Qm = `#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,
  $m = `#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,
  eg = `#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef OBJECTSPACE_NORMALMAP
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( TANGENTSPACE_NORMALMAP ) || defined ( USE_CLEARCOAT_NORMALMAP ) )
	vec3 perturbNormal2Arb( vec3 eye_pos, vec3 surf_norm, vec3 mapN, float faceDirection ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( vUv.st );
		vec2 st1 = dFdy( vUv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : faceDirection * inversesqrt( det );
		return normalize( T * ( mapN.x * scale ) + B * ( mapN.y * scale ) + N * mapN.z );
	}
#endif`,
  tg = `#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = geometryNormal;
#endif`,
  rg = `#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	#ifdef USE_TANGENT
		clearcoatNormal = normalize( vTBN * clearcoatMapN );
	#else
		clearcoatNormal = perturbNormal2Arb( - vViewPosition, clearcoatNormal, clearcoatMapN, faceDirection );
	#endif
#endif`,
  ig = `#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif`,
  ng = `#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,
  sg = `#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha + 0.1;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,
  ag = `vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;
const vec3 PackFactors = vec3( 256. * 256. * 256., 256. * 256., 256. );
const vec4 UnpackFactors = UnpackDownscale / vec4( PackFactors, 1. );
const float ShiftRight8 = 1. / 256.;
vec4 packDepthToRGBA( const in float v ) {
	vec4 r = vec4( fract( v * PackFactors ), v );
	r.yzw -= r.xyz * ShiftRight8;	return r * PackUpscale;
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors );
}
vec2 packDepthToRG( in highp float v ) {
	return packDepthToRGBA( v ).yx;
}
float unpackRGToDepth( const in highp vec2 v ) {
	return unpackRGBAToDepth( vec4( v.xy, 0.0, 0.0 ) );
}
vec4 pack2HalfToRGBA( vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float linearClipZ, const in float near, const in float far ) {
	return linearClipZ * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float invClipZ, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * invClipZ - far );
}`,
  og = `#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,
  cg = `vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,
  lg = `#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,
  hg = `#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,
  ug = `float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vUv );
	roughnessFactor *= texelRoughness.g;
#endif`,
  dg = `#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,
  pg = `#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		struct SpotLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform sampler2D pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {
		return step( compare, unpackRGBAToDepth( texture2D( depths, uv ) ) );
	}
	vec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {
		return unpackRGBATo2Half( texture2D( shadow, uv ) );
	}
	float VSMShadow (sampler2D shadow, vec2 uv, float compare ){
		float occlusion = 1.0;
		vec2 distribution = texture2DDistribution( shadow, uv );
		float hard_shadow = step( compare , distribution.x );
		if (hard_shadow != 1.0 ) {
			float distance = compare - distribution.x ;
			float variance = max( 0.00000, distribution.y * distribution.y );
			float softness_probability = variance / (variance + distance * distance );			softness_probability = clamp( ( softness_probability - 0.3 ) / ( 0.95 - 0.3 ), 0.0, 1.0 );			occlusion = clamp( max( hard_shadow, softness_probability ), 0.0, 1.0 );
		}
		return occlusion;
	}
	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
		float shadow = 1.0;
		shadowCoord.xyz /= shadowCoord.w;
		shadowCoord.z += shadowBias;
		bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
		bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
		if ( frustumTest ) {
		#if defined( SHADOWMAP_TYPE_PCF )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx0 = - texelSize.x * shadowRadius;
			float dy0 = - texelSize.y * shadowRadius;
			float dx1 = + texelSize.x * shadowRadius;
			float dy1 = + texelSize.y * shadowRadius;
			float dx2 = dx0 / 2.0;
			float dy2 = dy0 / 2.0;
			float dx3 = dx1 / 2.0;
			float dy3 = dy1 / 2.0;
			shadow = (
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )
			) * ( 1.0 / 17.0 );
		#elif defined( SHADOWMAP_TYPE_PCF_SOFT )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx = texelSize.x;
			float dy = texelSize.y;
			vec2 uv = shadowCoord.xy;
			vec2 f = fract( uv * shadowMapSize + 0.5 );
			uv -= f * texelSize;
			shadow = (
				texture2DCompare( shadowMap, uv, shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( dx, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( 0.0, dy ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + texelSize, shadowCoord.z ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, 0.0 ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 0.0 ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, dy ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( 0.0, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 0.0, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( texture2DCompare( shadowMap, uv + vec2( dx, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( dx, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( mix( texture2DCompare( shadowMap, uv + vec2( -dx, -dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, -dy ), shadowCoord.z ),
						  f.x ),
					 mix( texture2DCompare( shadowMap, uv + vec2( -dx, 2.0 * dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 2.0 * dy ), shadowCoord.z ),
						  f.x ),
					 f.y )
			) * ( 1.0 / 9.0 );
		#elif defined( SHADOWMAP_TYPE_VSM )
			shadow = VSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z );
		#else
			shadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );
		#endif
		}
		return shadow;
	}
	vec2 cubeToUV( vec3 v, float texelSizeY ) {
		vec3 absV = abs( v );
		float scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );
		absV *= scaleToCube;
		v *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );
		vec2 planar = v.xy;
		float almostATexel = 1.5 * texelSizeY;
		float almostOne = 1.0 - almostATexel;
		if ( absV.z >= almostOne ) {
			if ( v.z > 0.0 )
				planar.x = 4.0 - v.x;
		} else if ( absV.x >= almostOne ) {
			float signX = sign( v.x );
			planar.x = v.z * signX + 2.0 * signX;
		} else if ( absV.y >= almostOne ) {
			float signY = sign( v.y );
			planar.x = v.x + 2.0 * signY + 2.0;
			planar.y = v.z * signY - 2.0;
		}
		return vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );
	}
	float getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		vec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );
		vec3 lightToPosition = shadowCoord.xyz;
		float dp = ( length( lightToPosition ) - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear );		dp += shadowBias;
		vec3 bd3D = normalize( lightToPosition );
		#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT ) || defined( SHADOWMAP_TYPE_VSM )
			vec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;
			return (
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )
			) * ( 1.0 / 9.0 );
		#else
			return texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );
		#endif
	}
#endif`,
  fg = `#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,
  mg = `#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,
  gg = `float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,
  vg = `#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,
  xg = `#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	uniform int boneTextureSize;
	mat4 getBoneMatrix( const in float i ) {
		float j = i * 4.0;
		float x = mod( j, float( boneTextureSize ) );
		float y = floor( j / float( boneTextureSize ) );
		float dx = 1.0 / float( boneTextureSize );
		float dy = 1.0 / float( boneTextureSize );
		y = dy * ( y + 0.5 );
		vec4 v1 = texture2D( boneTexture, vec2( dx * ( x + 0.5 ), y ) );
		vec4 v2 = texture2D( boneTexture, vec2( dx * ( x + 1.5 ), y ) );
		vec4 v3 = texture2D( boneTexture, vec2( dx * ( x + 2.5 ), y ) );
		vec4 v4 = texture2D( boneTexture, vec2( dx * ( x + 3.5 ), y ) );
		mat4 bone = mat4( v1, v2, v3, v4 );
		return bone;
	}
#endif`,
  yg = `#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,
  bg = `#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,
  Mg = `float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,
  Sg = `#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,
  wg = `#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,
  _g = `#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return toneMappingExposure * color;
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 OptimizedCineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,
  Tg = `#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmission = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmission.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmission.rgb, material.transmission );
#endif`,
  Eg = `#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, vec2 fullSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		
		vec2 lodFudge = pow( 1.95, lod ) / fullSize;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec2 fullSize = vec2( textureSize( sampler, 0 ) );
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), fullSize, floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), fullSize, ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 applyVolumeAttenuation( const in vec3 radiance, const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return radiance;
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance * radiance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
		vec3 refractedRayExit = position + transmissionRay;
		vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
		vec2 refractionCoords = ndcPos.xy / ndcPos.w;
		refractionCoords += 1.0;
		refractionCoords /= 2.0;
		vec4 transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
		vec3 attenuatedColor = applyVolumeAttenuation( transmittedLight.rgb, length( transmissionRay ), attenuationColor, attenuationDistance );
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		return vec4( ( 1.0 - F ) * attenuatedColor * diffuseColor, transmittedLight.a );
	}
#endif`,
  Ag = `#if ( defined( USE_UV ) && ! defined( UVS_VERTEX_ONLY ) )
	varying vec2 vUv;
#endif`,
  Cg = `#ifdef USE_UV
	#ifdef UVS_VERTEX_ONLY
		vec2 vUv;
	#else
		varying vec2 vUv;
	#endif
	uniform mat3 uvTransform;
#endif`,
  Rg = `#ifdef USE_UV
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
#endif`,
  Pg = `#if defined( USE_LIGHTMAP ) || defined( USE_AOMAP )
	varying vec2 vUv2;
#endif`,
  Lg = `#if defined( USE_LIGHTMAP ) || defined( USE_AOMAP )
	attribute vec2 uv2;
	varying vec2 vUv2;
	uniform mat3 uv2Transform;
#endif`,
  Dg = `#if defined( USE_LIGHTMAP ) || defined( USE_AOMAP )
	vUv2 = ( uv2Transform * vec3( uv2, 1 ) ).xy;
#endif`,
  zg = `#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,
  Ig = `varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,
  Og = `uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <encodings_fragment>
}`,
  Ng = `varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,
  kg = `#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <encodings_fragment>
}`,
  Ug = `varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,
  Fg = `uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <encodings_fragment>
}`,
  Bg = `#include <common>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <skinbase_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,
  Gg = `#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( 1.0 );
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <logdepthbuf_fragment>
	float fragCoordZ = 0.5 * vHighPrecisionZW[0] / vHighPrecisionZW[1] + 0.5;
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#endif
}`,
  Vg = `#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <skinbase_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,
  Wg = `#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( 1.0 );
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = packDepthToRGBA( dist );
}`,
  Hg = `varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,
  jg = `uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <encodings_fragment>
}`,
  qg = `uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,
  Xg = `uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <logdepthbuf_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <output_fragment>
	#include <tonemapping_fragment>
	#include <encodings_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,
  Yg = `#include <common>
#include <uv_pars_vertex>
#include <uv2_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <uv2_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,
  Zg = `uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <uv2_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vUv2 );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <output_fragment>
	#include <tonemapping_fragment>
	#include <encodings_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,
  Jg = `#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <uv_pars_vertex>
#include <uv2_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <uv2_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,
  Kg = `#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <uv2_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( diffuse, opacity );
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <output_fragment>
	#include <tonemapping_fragment>
	#include <encodings_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,
  Qg = `#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,
  $g = `#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <output_fragment>
	#include <tonemapping_fragment>
	#include <encodings_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,
  e0 = `#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( TANGENTSPACE_NORMALMAP )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( TANGENTSPACE_NORMALMAP )
	vViewPosition = - mvPosition.xyz;
#endif
}`,
  t0 = `#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( TANGENTSPACE_NORMALMAP )
	varying vec3 vViewPosition;
#endif
#include <packing>
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( packNormalToRGB( normal ), opacity );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,
  r0 = `#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <uv_pars_vertex>
#include <uv2_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <uv2_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,
  i0 = `#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <uv2_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( diffuse, opacity );
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <output_fragment>
	#include <tonemapping_fragment>
	#include <encodings_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,
  n0 = `#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <uv_pars_vertex>
#include <uv2_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <uv2_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,
  s0 = `#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULARINTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
	#ifdef USE_SPECULARCOLORMAP
		uniform sampler2D specularColorMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEENCOLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEENROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <uv2_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <bsdfs>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( diffuse, opacity );
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
		float sheenEnergyComp = 1.0 - 0.157 * max3( material.sheenColor );
		outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecular;
	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometry.clearcoatNormal, geometry.viewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + clearcoatSpecular * material.clearcoat;
	#endif
	#include <output_fragment>
	#include <tonemapping_fragment>
	#include <encodings_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,
  a0 = `#define TOON
varying vec3 vViewPosition;
#include <common>
#include <uv_pars_vertex>
#include <uv2_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <uv2_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,
  o0 = `#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <uv2_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( diffuse, opacity );
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <output_fragment>
	#include <tonemapping_fragment>
	#include <encodings_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,
  c0 = `uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,
  l0 = `uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <output_fragment>
	#include <tonemapping_fragment>
	#include <encodings_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,
  h0 = `#include <common>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,
  u0 = `uniform vec3 color;
uniform float opacity;
#include <common>
#include <packing>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <encodings_fragment>
	#include <fog_fragment>
}`,
  d0 = `uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix * vec4( 0.0, 0.0, 0.0, 1.0 );
	vec2 scale;
	scale.x = length( vec3( modelMatrix[ 0 ].x, modelMatrix[ 0 ].y, modelMatrix[ 0 ].z ) );
	scale.y = length( vec3( modelMatrix[ 1 ].x, modelMatrix[ 1 ].y, modelMatrix[ 1 ].z ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,
  p0 = `uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <output_fragment>
	#include <tonemapping_fragment>
	#include <encodings_fragment>
	#include <fog_fragment>
}`,
  Be = {
    alphamap_fragment: Nf,
    alphamap_pars_fragment: kf,
    alphatest_fragment: Uf,
    alphatest_pars_fragment: Ff,
    aomap_fragment: Bf,
    aomap_pars_fragment: Gf,
    begin_vertex: Vf,
    beginnormal_vertex: Wf,
    bsdfs: Hf,
    iridescence_fragment: jf,
    bumpmap_pars_fragment: qf,
    clipping_planes_fragment: Xf,
    clipping_planes_pars_fragment: Yf,
    clipping_planes_pars_vertex: Zf,
    clipping_planes_vertex: Jf,
    color_fragment: Kf,
    color_pars_fragment: Qf,
    color_pars_vertex: $f,
    color_vertex: em,
    common: tm,
    cube_uv_reflection_fragment: rm,
    defaultnormal_vertex: im,
    displacementmap_pars_vertex: nm,
    displacementmap_vertex: sm,
    emissivemap_fragment: am,
    emissivemap_pars_fragment: om,
    encodings_fragment: cm,
    encodings_pars_fragment: lm,
    envmap_fragment: hm,
    envmap_common_pars_fragment: um,
    envmap_pars_fragment: dm,
    envmap_pars_vertex: pm,
    envmap_physical_pars_fragment: Tm,
    envmap_vertex: fm,
    fog_vertex: mm,
    fog_pars_vertex: gm,
    fog_fragment: vm,
    fog_pars_fragment: xm,
    gradientmap_pars_fragment: ym,
    lightmap_fragment: bm,
    lightmap_pars_fragment: Mm,
    lights_lambert_fragment: Sm,
    lights_lambert_pars_fragment: wm,
    lights_pars_begin: _m,
    lights_toon_fragment: Em,
    lights_toon_pars_fragment: Am,
    lights_phong_fragment: Cm,
    lights_phong_pars_fragment: Rm,
    lights_physical_fragment: Pm,
    lights_physical_pars_fragment: Lm,
    lights_fragment_begin: Dm,
    lights_fragment_maps: zm,
    lights_fragment_end: Im,
    logdepthbuf_fragment: Om,
    logdepthbuf_pars_fragment: Nm,
    logdepthbuf_pars_vertex: km,
    logdepthbuf_vertex: Um,
    map_fragment: Fm,
    map_pars_fragment: Bm,
    map_particle_fragment: Gm,
    map_particle_pars_fragment: Vm,
    metalnessmap_fragment: Wm,
    metalnessmap_pars_fragment: Hm,
    morphcolor_vertex: jm,
    morphnormal_vertex: qm,
    morphtarget_pars_vertex: Xm,
    morphtarget_vertex: Ym,
    normal_fragment_begin: Zm,
    normal_fragment_maps: Jm,
    normal_pars_fragment: Km,
    normal_pars_vertex: Qm,
    normal_vertex: $m,
    normalmap_pars_fragment: eg,
    clearcoat_normal_fragment_begin: tg,
    clearcoat_normal_fragment_maps: rg,
    clearcoat_pars_fragment: ig,
    iridescence_pars_fragment: ng,
    output_fragment: sg,
    packing: ag,
    premultiplied_alpha_fragment: og,
    project_vertex: cg,
    dithering_fragment: lg,
    dithering_pars_fragment: hg,
    roughnessmap_fragment: ug,
    roughnessmap_pars_fragment: dg,
    shadowmap_pars_fragment: pg,
    shadowmap_pars_vertex: fg,
    shadowmap_vertex: mg,
    shadowmask_pars_fragment: gg,
    skinbase_vertex: vg,
    skinning_pars_vertex: xg,
    skinning_vertex: yg,
    skinnormal_vertex: bg,
    specularmap_fragment: Mg,
    specularmap_pars_fragment: Sg,
    tonemapping_fragment: wg,
    tonemapping_pars_fragment: _g,
    transmission_fragment: Tg,
    transmission_pars_fragment: Eg,
    uv_pars_fragment: Ag,
    uv_pars_vertex: Cg,
    uv_vertex: Rg,
    uv2_pars_fragment: Pg,
    uv2_pars_vertex: Lg,
    uv2_vertex: Dg,
    worldpos_vertex: zg,
    background_vert: Ig,
    background_frag: Og,
    backgroundCube_vert: Ng,
    backgroundCube_frag: kg,
    cube_vert: Ug,
    cube_frag: Fg,
    depth_vert: Bg,
    depth_frag: Gg,
    distanceRGBA_vert: Vg,
    distanceRGBA_frag: Wg,
    equirect_vert: Hg,
    equirect_frag: jg,
    linedashed_vert: qg,
    linedashed_frag: Xg,
    meshbasic_vert: Yg,
    meshbasic_frag: Zg,
    meshlambert_vert: Jg,
    meshlambert_frag: Kg,
    meshmatcap_vert: Qg,
    meshmatcap_frag: $g,
    meshnormal_vert: e0,
    meshnormal_frag: t0,
    meshphong_vert: r0,
    meshphong_frag: i0,
    meshphysical_vert: n0,
    meshphysical_frag: s0,
    meshtoon_vert: a0,
    meshtoon_frag: o0,
    points_vert: c0,
    points_frag: l0,
    shadow_vert: h0,
    shadow_frag: u0,
    sprite_vert: d0,
    sprite_frag: p0
  },
  pe = {
    common: {
      diffuse: {
        value: new He(16777215)
      },
      opacity: {
        value: 1
      },
      map: {
        value: null
      },
      uvTransform: {
        value: new Kt()
      },
      uv2Transform: {
        value: new Kt()
      },
      alphaMap: {
        value: null
      },
      alphaTest: {
        value: 0
      }
    },
    specularmap: {
      specularMap: {
        value: null
      }
    },
    envmap: {
      envMap: {
        value: null
      },
      flipEnvMap: {
        value: -1
      },
      reflectivity: {
        value: 1
      },
      ior: {
        value: 1.5
      },
      refractionRatio: {
        value: 0.98
      }
    },
    aomap: {
      aoMap: {
        value: null
      },
      aoMapIntensity: {
        value: 1
      }
    },
    lightmap: {
      lightMap: {
        value: null
      },
      lightMapIntensity: {
        value: 1
      }
    },
    emissivemap: {
      emissiveMap: {
        value: null
      }
    },
    bumpmap: {
      bumpMap: {
        value: null
      },
      bumpScale: {
        value: 1
      }
    },
    normalmap: {
      normalMap: {
        value: null
      },
      normalScale: {
        value: new se(1, 1)
      }
    },
    displacementmap: {
      displacementMap: {
        value: null
      },
      displacementScale: {
        value: 1
      },
      displacementBias: {
        value: 0
      }
    },
    roughnessmap: {
      roughnessMap: {
        value: null
      }
    },
    metalnessmap: {
      metalnessMap: {
        value: null
      }
    },
    gradientmap: {
      gradientMap: {
        value: null
      }
    },
    fog: {
      fogDensity: {
        value: 25e-5
      },
      fogNear: {
        value: 1
      },
      fogFar: {
        value: 2e3
      },
      fogColor: {
        value: new He(16777215)
      }
    },
    lights: {
      ambientLightColor: {
        value: []
      },
      lightProbe: {
        value: []
      },
      directionalLights: {
        value: [],
        properties: {
          direction: {},
          color: {}
        }
      },
      directionalLightShadows: {
        value: [],
        properties: {
          shadowBias: {},
          shadowNormalBias: {},
          shadowRadius: {},
          shadowMapSize: {}
        }
      },
      directionalShadowMap: {
        value: []
      },
      directionalShadowMatrix: {
        value: []
      },
      spotLights: {
        value: [],
        properties: {
          color: {},
          position: {},
          direction: {},
          distance: {},
          coneCos: {},
          penumbraCos: {},
          decay: {}
        }
      },
      spotLightShadows: {
        value: [],
        properties: {
          shadowBias: {},
          shadowNormalBias: {},
          shadowRadius: {},
          shadowMapSize: {}
        }
      },
      spotLightMap: {
        value: []
      },
      spotShadowMap: {
        value: []
      },
      spotLightMatrix: {
        value: []
      },
      pointLights: {
        value: [],
        properties: {
          color: {},
          position: {},
          decay: {},
          distance: {}
        }
      },
      pointLightShadows: {
        value: [],
        properties: {
          shadowBias: {},
          shadowNormalBias: {},
          shadowRadius: {},
          shadowMapSize: {},
          shadowCameraNear: {},
          shadowCameraFar: {}
        }
      },
      pointShadowMap: {
        value: []
      },
      pointShadowMatrix: {
        value: []
      },
      hemisphereLights: {
        value: [],
        properties: {
          direction: {},
          skyColor: {},
          groundColor: {}
        }
      },
      rectAreaLights: {
        value: [],
        properties: {
          color: {},
          position: {},
          width: {},
          height: {}
        }
      },
      ltc_1: {
        value: null
      },
      ltc_2: {
        value: null
      }
    },
    points: {
      diffuse: {
        value: new He(16777215)
      },
      opacity: {
        value: 1
      },
      size: {
        value: 1
      },
      scale: {
        value: 1
      },
      map: {
        value: null
      },
      alphaMap: {
        value: null
      },
      alphaTest: {
        value: 0
      },
      uvTransform: {
        value: new Kt()
      }
    },
    sprite: {
      diffuse: {
        value: new He(16777215)
      },
      opacity: {
        value: 1
      },
      center: {
        value: new se(0.5, 0.5)
      },
      rotation: {
        value: 0
      },
      map: {
        value: null
      },
      alphaMap: {
        value: null
      },
      alphaTest: {
        value: 0
      },
      uvTransform: {
        value: new Kt()
      }
    }
  },
  Ur = {
    basic: {
      uniforms: Yt([pe.common, pe.specularmap, pe.envmap, pe.aomap, pe.lightmap, pe.fog]),
      vertexShader: Be.meshbasic_vert,
      fragmentShader: Be.meshbasic_frag
    },
    lambert: {
      uniforms: Yt([pe.common, pe.specularmap, pe.envmap, pe.aomap, pe.lightmap, pe.emissivemap, pe.bumpmap, pe.normalmap, pe.displacementmap, pe.fog, pe.lights, {
        emissive: {
          value: new He(0)
        }
      }]),
      vertexShader: Be.meshlambert_vert,
      fragmentShader: Be.meshlambert_frag
    },
    phong: {
      uniforms: Yt([pe.common, pe.specularmap, pe.envmap, pe.aomap, pe.lightmap, pe.emissivemap, pe.bumpmap, pe.normalmap, pe.displacementmap, pe.fog, pe.lights, {
        emissive: {
          value: new He(0)
        },
        specular: {
          value: new He(1118481)
        },
        shininess: {
          value: 30
        }
      }]),
      vertexShader: Be.meshphong_vert,
      fragmentShader: Be.meshphong_frag
    },
    standard: {
      uniforms: Yt([pe.common, pe.envmap, pe.aomap, pe.lightmap, pe.emissivemap, pe.bumpmap, pe.normalmap, pe.displacementmap, pe.roughnessmap, pe.metalnessmap, pe.fog, pe.lights, {
        emissive: {
          value: new He(0)
        },
        roughness: {
          value: 1
        },
        metalness: {
          value: 0
        },
        envMapIntensity: {
          value: 1
        }
      }]),
      vertexShader: Be.meshphysical_vert,
      fragmentShader: Be.meshphysical_frag
    },
    toon: {
      uniforms: Yt([pe.common, pe.aomap, pe.lightmap, pe.emissivemap, pe.bumpmap, pe.normalmap, pe.displacementmap, pe.gradientmap, pe.fog, pe.lights, {
        emissive: {
          value: new He(0)
        }
      }]),
      vertexShader: Be.meshtoon_vert,
      fragmentShader: Be.meshtoon_frag
    },
    matcap: {
      uniforms: Yt([pe.common, pe.bumpmap, pe.normalmap, pe.displacementmap, pe.fog, {
        matcap: {
          value: null
        }
      }]),
      vertexShader: Be.meshmatcap_vert,
      fragmentShader: Be.meshmatcap_frag
    },
    points: {
      uniforms: Yt([pe.points, pe.fog]),
      vertexShader: Be.points_vert,
      fragmentShader: Be.points_frag
    },
    dashed: {
      uniforms: Yt([pe.common, pe.fog, {
        scale: {
          value: 1
        },
        dashSize: {
          value: 1
        },
        totalSize: {
          value: 2
        }
      }]),
      vertexShader: Be.linedashed_vert,
      fragmentShader: Be.linedashed_frag
    },
    depth: {
      uniforms: Yt([pe.common, pe.displacementmap]),
      vertexShader: Be.depth_vert,
      fragmentShader: Be.depth_frag
    },
    normal: {
      uniforms: Yt([pe.common, pe.bumpmap, pe.normalmap, pe.displacementmap, {
        opacity: {
          value: 1
        }
      }]),
      vertexShader: Be.meshnormal_vert,
      fragmentShader: Be.meshnormal_frag
    },
    sprite: {
      uniforms: Yt([pe.sprite, pe.fog]),
      vertexShader: Be.sprite_vert,
      fragmentShader: Be.sprite_frag
    },
    background: {
      uniforms: {
        uvTransform: {
          value: new Kt()
        },
        t2D: {
          value: null
        },
        backgroundIntensity: {
          value: 1
        }
      },
      vertexShader: Be.background_vert,
      fragmentShader: Be.background_frag
    },
    backgroundCube: {
      uniforms: {
        envMap: {
          value: null
        },
        flipEnvMap: {
          value: -1
        },
        backgroundBlurriness: {
          value: 0
        },
        backgroundIntensity: {
          value: 1
        }
      },
      vertexShader: Be.backgroundCube_vert,
      fragmentShader: Be.backgroundCube_frag
    },
    cube: {
      uniforms: {
        tCube: {
          value: null
        },
        tFlip: {
          value: -1
        },
        opacity: {
          value: 1
        }
      },
      vertexShader: Be.cube_vert,
      fragmentShader: Be.cube_frag
    },
    equirect: {
      uniforms: {
        tEquirect: {
          value: null
        }
      },
      vertexShader: Be.equirect_vert,
      fragmentShader: Be.equirect_frag
    },
    distanceRGBA: {
      uniforms: Yt([pe.common, pe.displacementmap, {
        referencePosition: {
          value: new C()
        },
        nearDistance: {
          value: 1
        },
        farDistance: {
          value: 1e3
        }
      }]),
      vertexShader: Be.distanceRGBA_vert,
      fragmentShader: Be.distanceRGBA_frag
    },
    shadow: {
      uniforms: Yt([pe.lights, pe.fog, {
        color: {
          value: new He(0)
        },
        opacity: {
          value: 1
        }
      }]),
      vertexShader: Be.shadow_vert,
      fragmentShader: Be.shadow_frag
    }
  };
Ur.physical = {
  uniforms: Yt([Ur.standard.uniforms, {
    clearcoat: {
      value: 0
    },
    clearcoatMap: {
      value: null
    },
    clearcoatRoughness: {
      value: 0
    },
    clearcoatRoughnessMap: {
      value: null
    },
    clearcoatNormalScale: {
      value: new se(1, 1)
    },
    clearcoatNormalMap: {
      value: null
    },
    iridescence: {
      value: 0
    },
    iridescenceMap: {
      value: null
    },
    iridescenceIOR: {
      value: 1.3
    },
    iridescenceThicknessMinimum: {
      value: 100
    },
    iridescenceThicknessMaximum: {
      value: 400
    },
    iridescenceThicknessMap: {
      value: null
    },
    sheen: {
      value: 0
    },
    sheenColor: {
      value: new He(0)
    },
    sheenColorMap: {
      value: null
    },
    sheenRoughness: {
      value: 1
    },
    sheenRoughnessMap: {
      value: null
    },
    transmission: {
      value: 0
    },
    transmissionMap: {
      value: null
    },
    transmissionSamplerSize: {
      value: new se()
    },
    transmissionSamplerMap: {
      value: null
    },
    thickness: {
      value: 0
    },
    thicknessMap: {
      value: null
    },
    attenuationDistance: {
      value: 0
    },
    attenuationColor: {
      value: new He(0)
    },
    specularIntensity: {
      value: 1
    },
    specularIntensityMap: {
      value: null
    },
    specularColor: {
      value: new He(1, 1, 1)
    },
    specularColorMap: {
      value: null
    }
  }]),
  vertexShader: Be.meshphysical_vert,
  fragmentShader: Be.meshphysical_frag
};
var ea = {
  r: 0,
  b: 0,
  g: 0
};
function f0(i, e, t, r, n, s, o) {
  let a = new He(0),
    l = s === !0 ? 0 : 1,
    c,
    h,
    d = null,
    u = 0,
    p = null;
  function g(m, v) {
    let y = !1,
      x = v.isScene === !0 ? v.background : null;
    x && x.isTexture && (x = (v.backgroundBlurriness > 0 ? t : e).get(x));
    let b = i.xr,
      w = b.getSession && b.getSession();
    w && w.environmentBlendMode === "additive" && (x = null), x === null ? f(a, l) : x && x.isColor && (f(x, 1), y = !0), (i.autoClear || y) && i.clear(i.autoClearColor, i.autoClearDepth, i.autoClearStencil), x && (x.isCubeTexture || x.mapping === to) ? (h === void 0 && (h = new pt(new bs(1, 1, 1), new oi({
      name: "BackgroundCubeMaterial",
      uniforms: In(Ur.backgroundCube.uniforms),
      vertexShader: Ur.backgroundCube.vertexShader,
      fragmentShader: Ur.backgroundCube.fragmentShader,
      side: or,
      depthTest: !1,
      depthWrite: !1,
      fog: !1
    })), h.geometry.deleteAttribute("normal"), h.geometry.deleteAttribute("uv"), h.onBeforeRender = function (A, L, M) {
      this.matrixWorld.copyPosition(M.matrixWorld);
    }, Object.defineProperty(h.material, "envMap", {
      get: function () {
        return this.uniforms.envMap.value;
      }
    }), n.update(h)), h.material.uniforms.envMap.value = x, h.material.uniforms.flipEnvMap.value = x.isCubeTexture && x.isRenderTargetTexture === !1 ? -1 : 1, h.material.uniforms.backgroundBlurriness.value = v.backgroundBlurriness, h.material.uniforms.backgroundIntensity.value = v.backgroundIntensity, h.material.toneMapped = x.encoding !== Ke, (d !== x || u !== x.version || p !== i.toneMapping) && (h.material.needsUpdate = !0, d = x, u = x.version, p = i.toneMapping), h.layers.enableAll(), m.unshift(h, h.geometry, h.material, 0, 0, null)) : x && x.isTexture && (c === void 0 && (c = new pt(new yi(2, 2), new oi({
      name: "BackgroundMaterial",
      uniforms: In(Ur.background.uniforms),
      vertexShader: Ur.background.vertexShader,
      fragmentShader: Ur.background.fragmentShader,
      side: wi,
      depthTest: !1,
      depthWrite: !1,
      fog: !1
    })), c.geometry.deleteAttribute("normal"), Object.defineProperty(c.material, "map", {
      get: function () {
        return this.uniforms.t2D.value;
      }
    }), n.update(c)), c.material.uniforms.t2D.value = x, c.material.uniforms.backgroundIntensity.value = v.backgroundIntensity, c.material.toneMapped = x.encoding !== Ke, x.matrixAutoUpdate === !0 && x.updateMatrix(), c.material.uniforms.uvTransform.value.copy(x.matrix), (d !== x || u !== x.version || p !== i.toneMapping) && (c.material.needsUpdate = !0, d = x, u = x.version, p = i.toneMapping), c.layers.enableAll(), m.unshift(c, c.geometry, c.material, 0, 0, null));
  }
  function f(m, v) {
    m.getRGB(ea, Uu(i)), r.buffers.color.setClear(ea.r, ea.g, ea.b, v, o);
  }
  return {
    getClearColor: function () {
      return a;
    },
    setClearColor: function (m, v = 1) {
      a.set(m), l = v, f(a, l);
    },
    getClearAlpha: function () {
      return l;
    },
    setClearAlpha: function (m) {
      l = m, f(a, l);
    },
    render: g
  };
}
function m0(i, e, t, r) {
  let n = i.getParameter(34921),
    s = r.isWebGL2 ? null : e.get("OES_vertex_array_object"),
    o = r.isWebGL2 || s !== null,
    a = {},
    l = m(null),
    c = l,
    h = !1;
  function d(z, j, ie, oe, $) {
    let ae = !1;
    if (o) {
      let te = f(oe, ie, j);
      c !== te && (c = te, p(c.object)), ae = v(z, oe, ie, $), ae && y(z, oe, ie, $);
    } else {
      let te = j.wireframe === !0;
      (c.geometry !== oe.id || c.program !== ie.id || c.wireframe !== te) && (c.geometry = oe.id, c.program = ie.id, c.wireframe = te, ae = !0);
    }
    $ !== null && t.update($, 34963), (ae || h) && (h = !1, M(z, j, ie, oe), $ !== null && i.bindBuffer(34963, t.get($).buffer));
  }
  function u() {
    return r.isWebGL2 ? i.createVertexArray() : s.createVertexArrayOES();
  }
  function p(z) {
    return r.isWebGL2 ? i.bindVertexArray(z) : s.bindVertexArrayOES(z);
  }
  function g(z) {
    return r.isWebGL2 ? i.deleteVertexArray(z) : s.deleteVertexArrayOES(z);
  }
  function f(z, j, ie) {
    let oe = ie.wireframe === !0,
      $ = a[z.id];
    $ === void 0 && ($ = {}, a[z.id] = $);
    let ae = $[j.id];
    ae === void 0 && (ae = {}, $[j.id] = ae);
    let te = ae[oe];
    return te === void 0 && (te = m(u()), ae[oe] = te), te;
  }
  function m(z) {
    let j = [],
      ie = [],
      oe = [];
    for (let $ = 0; $ < n; $++) j[$] = 0, ie[$] = 0, oe[$] = 0;
    return {
      geometry: null,
      program: null,
      wireframe: !1,
      newAttributes: j,
      enabledAttributes: ie,
      attributeDivisors: oe,
      object: z,
      attributes: {},
      index: null
    };
  }
  function v(z, j, ie, oe) {
    let $ = c.attributes,
      ae = j.attributes,
      te = 0,
      be = ie.getAttributes();
    for (let V in be) if (be[V].location >= 0) {
      let re = $[V],
        de = ae[V];
      if (de === void 0 && (V === "instanceMatrix" && z.instanceMatrix && (de = z.instanceMatrix), V === "instanceColor" && z.instanceColor && (de = z.instanceColor)), re === void 0 || re.attribute !== de || de && re.data !== de.data) return !0;
      te++;
    }
    return c.attributesNum !== te || c.index !== oe;
  }
  function y(z, j, ie, oe) {
    let $ = {},
      ae = j.attributes,
      te = 0,
      be = ie.getAttributes();
    for (let V in be) if (be[V].location >= 0) {
      let re = ae[V];
      re === void 0 && (V === "instanceMatrix" && z.instanceMatrix && (re = z.instanceMatrix), V === "instanceColor" && z.instanceColor && (re = z.instanceColor));
      let de = {};
      de.attribute = re, re && re.data && (de.data = re.data), $[V] = de, te++;
    }
    c.attributes = $, c.attributesNum = te, c.index = oe;
  }
  function x() {
    let z = c.newAttributes;
    for (let j = 0, ie = z.length; j < ie; j++) z[j] = 0;
  }
  function b(z) {
    w(z, 0);
  }
  function w(z, j) {
    let ie = c.newAttributes,
      oe = c.enabledAttributes,
      $ = c.attributeDivisors;
    ie[z] = 1, oe[z] === 0 && (i.enableVertexAttribArray(z), oe[z] = 1), $[z] !== j && ((r.isWebGL2 ? i : e.get("ANGLE_instanced_arrays"))[r.isWebGL2 ? "vertexAttribDivisor" : "vertexAttribDivisorANGLE"](z, j), $[z] = j);
  }
  function A() {
    let z = c.newAttributes,
      j = c.enabledAttributes;
    for (let ie = 0, oe = j.length; ie < oe; ie++) j[ie] !== z[ie] && (i.disableVertexAttribArray(ie), j[ie] = 0);
  }
  function L(z, j, ie, oe, $, ae) {
    r.isWebGL2 === !0 && (ie === 5124 || ie === 5125) ? i.vertexAttribIPointer(z, j, ie, $, ae) : i.vertexAttribPointer(z, j, ie, oe, $, ae);
  }
  function M(z, j, ie, oe) {
    if (r.isWebGL2 === !1 && (z.isInstancedMesh || oe.isInstancedBufferGeometry) && e.get("ANGLE_instanced_arrays") === null) return;
    x();
    let $ = oe.attributes,
      ae = ie.getAttributes(),
      te = j.defaultAttributeValues;
    for (let be in ae) {
      let V = ae[be];
      if (V.location >= 0) {
        let re = $[be];
        if (re === void 0 && (be === "instanceMatrix" && z.instanceMatrix && (re = z.instanceMatrix), be === "instanceColor" && z.instanceColor && (re = z.instanceColor)), re !== void 0) {
          let de = re.normalized,
            W = re.itemSize,
            me = t.get(re);
          if (me === void 0) continue;
          let P = me.buffer,
            N = me.type,
            Q = me.bytesPerElement;
          if (re.isInterleavedBufferAttribute) {
            let K = re.data,
              k = K.stride,
              F = re.offset;
            if (K.isInstancedInterleavedBuffer) {
              for (let B = 0; B < V.locationSize; B++) w(V.location + B, K.meshPerAttribute);
              z.isInstancedMesh !== !0 && oe._maxInstanceCount === void 0 && (oe._maxInstanceCount = K.meshPerAttribute * K.count);
            } else for (let B = 0; B < V.locationSize; B++) b(V.location + B);
            i.bindBuffer(34962, P);
            for (let B = 0; B < V.locationSize; B++) L(V.location + B, W / V.locationSize, N, de, k * Q, (F + W / V.locationSize * B) * Q);
          } else {
            if (re.isInstancedBufferAttribute) {
              for (let K = 0; K < V.locationSize; K++) w(V.location + K, re.meshPerAttribute);
              z.isInstancedMesh !== !0 && oe._maxInstanceCount === void 0 && (oe._maxInstanceCount = re.meshPerAttribute * re.count);
            } else for (let K = 0; K < V.locationSize; K++) b(V.location + K);
            i.bindBuffer(34962, P);
            for (let K = 0; K < V.locationSize; K++) L(V.location + K, W / V.locationSize, N, de, W * Q, W / V.locationSize * K * Q);
          }
        } else if (te !== void 0) {
          let de = te[be];
          if (de !== void 0) switch (de.length) {
            case 2:
              i.vertexAttrib2fv(V.location, de);
              break;
            case 3:
              i.vertexAttrib3fv(V.location, de);
              break;
            case 4:
              i.vertexAttrib4fv(V.location, de);
              break;
            default:
              i.vertexAttrib1fv(V.location, de);
          }
        }
      }
    }
    A();
  }
  function T() {
    Z();
    for (let z in a) {
      let j = a[z];
      for (let ie in j) {
        let oe = j[ie];
        for (let $ in oe) g(oe[$].object), delete oe[$];
        delete j[ie];
      }
      delete a[z];
    }
  }
  function R(z) {
    if (a[z.id] === void 0) return;
    let j = a[z.id];
    for (let ie in j) {
      let oe = j[ie];
      for (let $ in oe) g(oe[$].object), delete oe[$];
      delete j[ie];
    }
    delete a[z.id];
  }
  function H(z) {
    for (let j in a) {
      let ie = a[j];
      if (ie[z.id] === void 0) continue;
      let oe = ie[z.id];
      for (let $ in oe) g(oe[$].object), delete oe[$];
      delete ie[z.id];
    }
  }
  function Z() {
    O(), h = !0, c !== l && (c = l, p(c.object));
  }
  function O() {
    l.geometry = null, l.program = null, l.wireframe = !1;
  }
  return {
    setup: d,
    reset: Z,
    resetDefaultState: O,
    dispose: T,
    releaseStatesOfGeometry: R,
    releaseStatesOfProgram: H,
    initAttributes: x,
    enableAttribute: b,
    disableUnusedAttributes: A
  };
}
function g0(i, e, t, r) {
  let n = r.isWebGL2,
    s;
  function o(c) {
    s = c;
  }
  function a(c, h) {
    i.drawArrays(s, c, h), t.update(h, s, 1);
  }
  function l(c, h, d) {
    if (d === 0) return;
    let u, p;
    if (n) u = i, p = "drawArraysInstanced";else if (u = e.get("ANGLE_instanced_arrays"), p = "drawArraysInstancedANGLE", u === null) {
      console.error("THREE.WebGLBufferRenderer: using THREE.InstancedBufferGeometry but hardware does not support extension ANGLE_instanced_arrays.");
      return;
    }
    u[p](s, c, h, d), t.update(h, s, d);
  }
  this.setMode = o, this.render = a, this.renderInstances = l;
}
function v0(i, e, t) {
  let r;
  function n() {
    if (r !== void 0) return r;
    if (e.has("EXT_texture_filter_anisotropic") === !0) {
      let L = e.get("EXT_texture_filter_anisotropic");
      r = i.getParameter(L.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
    } else r = 0;
    return r;
  }
  function s(L) {
    if (L === "highp") {
      if (i.getShaderPrecisionFormat(35633, 36338).precision > 0 && i.getShaderPrecisionFormat(35632, 36338).precision > 0) return "highp";
      L = "mediump";
    }
    return L === "mediump" && i.getShaderPrecisionFormat(35633, 36337).precision > 0 && i.getShaderPrecisionFormat(35632, 36337).precision > 0 ? "mediump" : "lowp";
  }
  let o = typeof WebGL2RenderingContext < "u" && i instanceof WebGL2RenderingContext,
    a = t.precision !== void 0 ? t.precision : "highp",
    l = s(a);
  l !== a && (console.warn("THREE.WebGLRenderer:", a, "not supported, using", l, "instead."), a = l);
  let c = o || e.has("WEBGL_draw_buffers"),
    h = t.logarithmicDepthBuffer === !0,
    d = i.getParameter(34930),
    u = i.getParameter(35660),
    p = i.getParameter(3379),
    g = i.getParameter(34076),
    f = i.getParameter(34921),
    m = i.getParameter(36347),
    v = i.getParameter(36348),
    y = i.getParameter(36349),
    x = u > 0,
    b = o || e.has("OES_texture_float"),
    w = x && b,
    A = o ? i.getParameter(36183) : 0;
  return {
    isWebGL2: o,
    drawBuffers: c,
    getMaxAnisotropy: n,
    getMaxPrecision: s,
    precision: a,
    logarithmicDepthBuffer: h,
    maxTextures: d,
    maxVertexTextures: u,
    maxTextureSize: p,
    maxCubemapSize: g,
    maxAttributes: f,
    maxVertexUniforms: m,
    maxVaryings: v,
    maxFragmentUniforms: y,
    vertexTextures: x,
    floatFragmentTextures: b,
    floatVertexTextures: w,
    maxSamples: A
  };
}
function x0(i) {
  let e = this,
    t = null,
    r = 0,
    n = !1,
    s = !1,
    o = new ei(),
    a = new Kt(),
    l = {
      value: null,
      needsUpdate: !1
    };
  this.uniform = l, this.numPlanes = 0, this.numIntersection = 0, this.init = function (d, u) {
    let p = d.length !== 0 || u || r !== 0 || n;
    return n = u, r = d.length, p;
  }, this.beginShadows = function () {
    s = !0, h(null);
  }, this.endShadows = function () {
    s = !1;
  }, this.setGlobalState = function (d, u) {
    t = h(d, u, 0);
  }, this.setState = function (d, u, p) {
    let g = d.clippingPlanes,
      f = d.clipIntersection,
      m = d.clipShadows,
      v = i.get(d);
    if (!n || g === null || g.length === 0 || s && !m) s ? h(null) : c();else {
      let y = s ? 0 : r,
        x = y * 4,
        b = v.clippingState || null;
      l.value = b, b = h(g, u, x, p);
      for (let w = 0; w !== x; ++w) b[w] = t[w];
      v.clippingState = b, this.numIntersection = f ? this.numPlanes : 0, this.numPlanes += y;
    }
  };
  function c() {
    l.value !== t && (l.value = t, l.needsUpdate = r > 0), e.numPlanes = r, e.numIntersection = 0;
  }
  function h(d, u, p, g) {
    let f = d !== null ? d.length : 0,
      m = null;
    if (f !== 0) {
      if (m = l.value, g !== !0 || m === null) {
        let v = p + f * 4,
          y = u.matrixWorldInverse;
        a.getNormalMatrix(y), (m === null || m.length < v) && (m = new Float32Array(v));
        for (let x = 0, b = p; x !== f; ++x, b += 4) o.copy(d[x]).applyMatrix4(y, a), o.normal.toArray(m, b), m[b + 3] = o.constant;
      }
      l.value = m, l.needsUpdate = !0;
    }
    return e.numPlanes = f, e.numIntersection = 0, m;
  }
}
function y0(i) {
  let e = new WeakMap();
  function t(o, a) {
    return a === dc ? o.mapping = Rn : a === pc && (o.mapping = Pn), o;
  }
  function r(o) {
    if (o && o.isTexture && o.isRenderTargetTexture === !1) {
      let a = o.mapping;
      if (a === dc || a === pc) if (e.has(o)) {
        let l = e.get(o).texture;
        return t(l, o.mapping);
      } else {
        let l = o.image;
        if (l && l.height > 0) {
          let c = new yc(l.height / 2);
          return c.fromEquirectangularTexture(i, o), e.set(o, c), o.addEventListener("dispose", n), t(c.texture, o.mapping);
        } else return null;
      }
    }
    return o;
  }
  function n(o) {
    let a = o.target;
    a.removeEventListener("dispose", n);
    let l = e.get(a);
    l !== void 0 && (e.delete(a), l.dispose());
  }
  function s() {
    e = new WeakMap();
  }
  return {
    get: r,
    dispose: s
  };
}
var Oa = class extends za {
    constructor(e = -1, t = 1, r = 1, n = -1, s = 0.1, o = 2e3) {
      super(), this.isOrthographicCamera = !0, this.type = "OrthographicCamera", this.zoom = 1, this.view = null, this.left = e, this.right = t, this.top = r, this.bottom = n, this.near = s, this.far = o, this.updateProjectionMatrix();
    }
    copy(e, t) {
      return super.copy(e, t), this.left = e.left, this.right = e.right, this.top = e.top, this.bottom = e.bottom, this.near = e.near, this.far = e.far, this.zoom = e.zoom, this.view = e.view === null ? null : Object.assign({}, e.view), this;
    }
    setViewOffset(e, t, r, n, s, o) {
      this.view === null && (this.view = {
        enabled: !0,
        fullWidth: 1,
        fullHeight: 1,
        offsetX: 0,
        offsetY: 0,
        width: 1,
        height: 1
      }), this.view.enabled = !0, this.view.fullWidth = e, this.view.fullHeight = t, this.view.offsetX = r, this.view.offsetY = n, this.view.width = s, this.view.height = o, this.updateProjectionMatrix();
    }
    clearViewOffset() {
      this.view !== null && (this.view.enabled = !1), this.updateProjectionMatrix();
    }
    updateProjectionMatrix() {
      let e = (this.right - this.left) / (2 * this.zoom),
        t = (this.top - this.bottom) / (2 * this.zoom),
        r = (this.right + this.left) / 2,
        n = (this.top + this.bottom) / 2,
        s = r - e,
        o = r + e,
        a = n + t,
        l = n - t;
      if (this.view !== null && this.view.enabled) {
        let c = (this.right - this.left) / this.view.fullWidth / this.zoom,
          h = (this.top - this.bottom) / this.view.fullHeight / this.zoom;
        s += c * this.view.offsetX, o = s + c * this.view.width, a -= h * this.view.offsetY, l = a - h * this.view.height;
      }
      this.projectionMatrix.makeOrthographic(s, o, a, l, this.near, this.far), this.projectionMatrixInverse.copy(this.projectionMatrix).invert();
    }
    toJSON(e) {
      let t = super.toJSON(e);
      return t.object.zoom = this.zoom, t.object.left = this.left, t.object.right = this.right, t.object.top = this.top, t.object.bottom = this.bottom, t.object.near = this.near, t.object.far = this.far, this.view !== null && (t.object.view = Object.assign({}, this.view)), t;
    }
  },
  Mn = 4,
  Th = [0.125, 0.215, 0.35, 0.446, 0.526, 0.582],
  ki = 20,
  Ho = new Oa(),
  Eh = new He(),
  jo = null,
  Oi = (1 + Math.sqrt(5)) / 2,
  mn = 1 / Oi,
  Ah = [new C(1, 1, 1), new C(-1, 1, 1), new C(1, 1, -1), new C(-1, 1, -1), new C(0, Oi, mn), new C(0, Oi, -mn), new C(mn, 0, Oi), new C(-mn, 0, Oi), new C(Oi, mn, 0), new C(-Oi, mn, 0)],
  Na = class {
    constructor(e) {
      this._renderer = e, this._pingPongRenderTarget = null, this._lodMax = 0, this._cubeSize = 0, this._lodPlanes = [], this._sizeLods = [], this._sigmas = [], this._blurMaterial = null, this._cubemapMaterial = null, this._equirectMaterial = null, this._compileMaterial(this._blurMaterial);
    }
    fromScene(e, t = 0, r = 0.1, n = 100) {
      jo = this._renderer.getRenderTarget(), this._setSize(256);
      let s = this._allocateTargets();
      return s.depthBuffer = !0, this._sceneToCubeUV(e, r, n, s), t > 0 && this._blur(s, 0, 0, t), this._applyPMREM(s), this._cleanup(s), s;
    }
    fromEquirectangular(e, t = null) {
      return this._fromTexture(e, t);
    }
    fromCubemap(e, t = null) {
      return this._fromTexture(e, t);
    }
    compileCubemapShader() {
      this._cubemapMaterial === null && (this._cubemapMaterial = Ph(), this._compileMaterial(this._cubemapMaterial));
    }
    compileEquirectangularShader() {
      this._equirectMaterial === null && (this._equirectMaterial = Rh(), this._compileMaterial(this._equirectMaterial));
    }
    dispose() {
      this._dispose(), this._cubemapMaterial !== null && this._cubemapMaterial.dispose(), this._equirectMaterial !== null && this._equirectMaterial.dispose();
    }
    _setSize(e) {
      this._lodMax = Math.floor(Math.log2(e)), this._cubeSize = Math.pow(2, this._lodMax);
    }
    _dispose() {
      this._blurMaterial !== null && this._blurMaterial.dispose(), this._pingPongRenderTarget !== null && this._pingPongRenderTarget.dispose();
      for (let e = 0; e < this._lodPlanes.length; e++) this._lodPlanes[e].dispose();
    }
    _cleanup(e) {
      this._renderer.setRenderTarget(jo), e.scissorTest = !1, ta(e, 0, 0, e.width, e.height);
    }
    _fromTexture(e, t) {
      e.mapping === Rn || e.mapping === Pn ? this._setSize(e.image.length === 0 ? 16 : e.image[0].width || e.image[0].image.width) : this._setSize(e.image.width / 4), jo = this._renderer.getRenderTarget();
      let r = t || this._allocateTargets();
      return this._textureToCubeUV(e, r), this._applyPMREM(r), this._cleanup(r), r;
    }
    _allocateTargets() {
      let e = 3 * Math.max(this._cubeSize, 112),
        t = 4 * this._cubeSize,
        r = {
          magFilter: It,
          minFilter: It,
          generateMipmaps: !1,
          type: ys,
          format: Tr,
          encoding: Yi,
          depthBuffer: !1
        },
        n = Ch(e, t, r);
      if (this._pingPongRenderTarget === null || this._pingPongRenderTarget.width !== e || this._pingPongRenderTarget.height !== t) {
        this._pingPongRenderTarget !== null && this._dispose(), this._pingPongRenderTarget = Ch(e, t, r);
        let {
          _lodMax: s
        } = this;
        ({
          sizeLods: this._sizeLods,
          lodPlanes: this._lodPlanes,
          sigmas: this._sigmas
        } = b0(s)), this._blurMaterial = M0(s, e, t);
      }
      return n;
    }
    _compileMaterial(e) {
      let t = new pt(this._lodPlanes[0], e);
      this._renderer.compile(t, Ho);
    }
    _sceneToCubeUV(e, t, r, n) {
      let s = new Ot(90, 1, t, r),
        o = [1, -1, 1, 1, 1, 1],
        a = [1, 1, 1, -1, -1, -1],
        l = this._renderer,
        c = l.autoClear,
        h = l.toneMapping;
      l.getClearColor(Eh), l.toneMapping = ri, l.autoClear = !1;
      let d = new Ei({
          name: "PMREM.Background",
          side: or,
          depthWrite: !1,
          depthTest: !1
        }),
        u = new pt(new bs(), d),
        p = !1,
        g = e.background;
      g ? g.isColor && (d.color.copy(g), e.background = null, p = !0) : (d.color.copy(Eh), p = !0);
      for (let f = 0; f < 6; f++) {
        let m = f % 3;
        m === 0 ? (s.up.set(0, o[f], 0), s.lookAt(a[f], 0, 0)) : m === 1 ? (s.up.set(0, 0, o[f]), s.lookAt(0, a[f], 0)) : (s.up.set(0, o[f], 0), s.lookAt(0, 0, a[f]));
        let v = this._cubeSize;
        ta(n, m * v, f > 2 ? v : 0, v, v), l.setRenderTarget(n), p && l.render(u, s), l.render(e, s);
      }
      u.geometry.dispose(), u.material.dispose(), l.toneMapping = h, l.autoClear = c, e.background = g;
    }
    _textureToCubeUV(e, t) {
      let r = this._renderer,
        n = e.mapping === Rn || e.mapping === Pn;
      n ? (this._cubemapMaterial === null && (this._cubemapMaterial = Ph()), this._cubemapMaterial.uniforms.flipEnvMap.value = e.isRenderTargetTexture === !1 ? -1 : 1) : this._equirectMaterial === null && (this._equirectMaterial = Rh());
      let s = n ? this._cubemapMaterial : this._equirectMaterial,
        o = new pt(this._lodPlanes[0], s),
        a = s.uniforms;
      a.envMap.value = e;
      let l = this._cubeSize;
      ta(t, 0, 0, 3 * l, 2 * l), r.setRenderTarget(t), r.render(o, Ho);
    }
    _applyPMREM(e) {
      let t = this._renderer,
        r = t.autoClear;
      t.autoClear = !1;
      for (let n = 1; n < this._lodPlanes.length; n++) {
        let s = Math.sqrt(this._sigmas[n] * this._sigmas[n] - this._sigmas[n - 1] * this._sigmas[n - 1]),
          o = Ah[(n - 1) % Ah.length];
        this._blur(e, n - 1, n, s, o);
      }
      t.autoClear = r;
    }
    _blur(e, t, r, n, s) {
      let o = this._pingPongRenderTarget;
      this._halfBlur(e, o, t, r, n, "latitudinal", s), this._halfBlur(o, e, r, r, n, "longitudinal", s);
    }
    _halfBlur(e, t, r, n, s, o, a) {
      let l = this._renderer,
        c = this._blurMaterial;
      o !== "latitudinal" && o !== "longitudinal" && console.error("blur direction must be either latitudinal or longitudinal!");
      let h = 3,
        d = new pt(this._lodPlanes[n], c),
        u = c.uniforms,
        p = this._sizeLods[r] - 1,
        g = isFinite(s) ? Math.PI / (2 * p) : 2 * Math.PI / (2 * ki - 1),
        f = s / g,
        m = isFinite(s) ? 1 + Math.floor(h * f) : ki;
      m > ki && console.warn(`sigmaRadians, ${s}, is too large and will clip, as it requested ${m} samples when the maximum is set to ${ki}`);
      let v = [],
        y = 0;
      for (let L = 0; L < ki; ++L) {
        let M = L / f,
          T = Math.exp(-M * M / 2);
        v.push(T), L === 0 ? y += T : L < m && (y += 2 * T);
      }
      for (let L = 0; L < v.length; L++) v[L] = v[L] / y;
      u.envMap.value = e.texture, u.samples.value = m, u.weights.value = v, u.latitudinal.value = o === "latitudinal", a && (u.poleAxis.value = a);
      let {
        _lodMax: x
      } = this;
      u.dTheta.value = g, u.mipInt.value = x - r;
      let b = this._sizeLods[n],
        w = 3 * b * (n > x - Mn ? n - x + Mn : 0),
        A = 4 * (this._cubeSize - b);
      ta(t, w, A, 3 * b, 2 * b), l.setRenderTarget(t), l.render(d, Ho);
    }
  };
function b0(i) {
  let e = [],
    t = [],
    r = [],
    n = i,
    s = i - Mn + 1 + Th.length;
  for (let o = 0; o < s; o++) {
    let a = Math.pow(2, n);
    t.push(a);
    let l = 1 / a;
    o > i - Mn ? l = Th[o - i + Mn - 1] : o === 0 && (l = 0), r.push(l);
    let c = 1 / (a - 2),
      h = -c,
      d = 1 + c,
      u = [h, h, d, h, d, d, h, h, d, d, h, d],
      p = 6,
      g = 6,
      f = 3,
      m = 2,
      v = 1,
      y = new Float32Array(f * g * p),
      x = new Float32Array(m * g * p),
      b = new Float32Array(v * g * p);
    for (let A = 0; A < p; A++) {
      let L = A % 3 * 2 / 3 - 1,
        M = A > 2 ? 0 : -1,
        T = [L, M, 0, L + 2 / 3, M, 0, L + 2 / 3, M + 1, 0, L, M, 0, L + 2 / 3, M + 1, 0, L, M + 1, 0];
      y.set(T, f * g * A), x.set(u, m * g * A);
      let R = [A, A, A, A, A, A];
      b.set(R, v * g * A);
    }
    let w = new Tt();
    w.setAttribute("position", new Qt(y, f)), w.setAttribute("uv", new Qt(x, m)), w.setAttribute("faceIndex", new Qt(b, v)), e.push(w), n > Mn && n--;
  }
  return {
    lodPlanes: e,
    sizeLods: t,
    sigmas: r
  };
}
function Ch(i, e, t) {
  let r = new si(i, e, t);
  return r.texture.mapping = to, r.texture.name = "PMREM.cubeUv", r.scissorTest = !0, r;
}
function ta(i, e, t, r, n) {
  i.viewport.set(e, t, r, n), i.scissor.set(e, t, r, n);
}
function M0(i, e, t) {
  let r = new Float32Array(ki),
    n = new C(0, 1, 0);
  return new oi({
    name: "SphericalGaussianBlur",
    defines: {
      n: ki,
      CUBEUV_TEXEL_WIDTH: 1 / e,
      CUBEUV_TEXEL_HEIGHT: 1 / t,
      CUBEUV_MAX_MIP: `${i}.0`
    },
    uniforms: {
      envMap: {
        value: null
      },
      samples: {
        value: 1
      },
      weights: {
        value: r
      },
      latitudinal: {
        value: !1
      },
      dTheta: {
        value: 0
      },
      mipInt: {
        value: 0
      },
      poleAxis: {
        value: n
      }
    },
    vertexShader: vl(),
    fragmentShader: `

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,
    blending: bi,
    depthTest: !1,
    depthWrite: !1
  });
}
function Rh() {
  return new oi({
    name: "EquirectangularToCubeUV",
    uniforms: {
      envMap: {
        value: null
      }
    },
    vertexShader: vl(),
    fragmentShader: `

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,
    blending: bi,
    depthTest: !1,
    depthWrite: !1
  });
}
function Ph() {
  return new oi({
    name: "CubemapToCubeUV",
    uniforms: {
      envMap: {
        value: null
      },
      flipEnvMap: {
        value: -1
      }
    },
    vertexShader: vl(),
    fragmentShader: `

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,
    blending: bi,
    depthTest: !1,
    depthWrite: !1
  });
}
function vl() {
  return `

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`;
}
function S0(i) {
  let e = new WeakMap(),
    t = null;
  function r(a) {
    if (a && a.isTexture) {
      let l = a.mapping,
        c = l === dc || l === pc,
        h = l === Rn || l === Pn;
      if (c || h) if (a.isRenderTargetTexture && a.needsPMREMUpdate === !0) {
        a.needsPMREMUpdate = !1;
        let d = e.get(a);
        return t === null && (t = new Na(i)), d = c ? t.fromEquirectangular(a, d) : t.fromCubemap(a, d), e.set(a, d), d.texture;
      } else {
        if (e.has(a)) return e.get(a).texture;
        {
          let d = a.image;
          if (c && d && d.height > 0 || h && d && n(d)) {
            t === null && (t = new Na(i));
            let u = c ? t.fromEquirectangular(a) : t.fromCubemap(a);
            return e.set(a, u), a.addEventListener("dispose", s), u.texture;
          } else return null;
        }
      }
    }
    return a;
  }
  function n(a) {
    let l = 0,
      c = 6;
    for (let h = 0; h < c; h++) a[h] !== void 0 && l++;
    return l === c;
  }
  function s(a) {
    let l = a.target;
    l.removeEventListener("dispose", s);
    let c = e.get(l);
    c !== void 0 && (e.delete(l), c.dispose());
  }
  function o() {
    e = new WeakMap(), t !== null && (t.dispose(), t = null);
  }
  return {
    get: r,
    dispose: o
  };
}
function w0(i) {
  let e = {};
  function t(r) {
    if (e[r] !== void 0) return e[r];
    let n;
    switch (r) {
      case "WEBGL_depth_texture":
        n = i.getExtension("WEBGL_depth_texture") || i.getExtension("MOZ_WEBGL_depth_texture") || i.getExtension("WEBKIT_WEBGL_depth_texture");
        break;
      case "EXT_texture_filter_anisotropic":
        n = i.getExtension("EXT_texture_filter_anisotropic") || i.getExtension("MOZ_EXT_texture_filter_anisotropic") || i.getExtension("WEBKIT_EXT_texture_filter_anisotropic");
        break;
      case "WEBGL_compressed_texture_s3tc":
        n = i.getExtension("WEBGL_compressed_texture_s3tc") || i.getExtension("MOZ_WEBGL_compressed_texture_s3tc") || i.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");
        break;
      case "WEBGL_compressed_texture_pvrtc":
        n = i.getExtension("WEBGL_compressed_texture_pvrtc") || i.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");
        break;
      default:
        n = i.getExtension(r);
    }
    return e[r] = n, n;
  }
  return {
    has: function (r) {
      return t(r) !== null;
    },
    init: function (r) {
      r.isWebGL2 ? t("EXT_color_buffer_float") : (t("WEBGL_depth_texture"), t("OES_texture_float"), t("OES_texture_half_float"), t("OES_texture_half_float_linear"), t("OES_standard_derivatives"), t("OES_element_index_uint"), t("OES_vertex_array_object"), t("ANGLE_instanced_arrays")), t("OES_texture_float_linear"), t("EXT_color_buffer_half_float"), t("WEBGL_multisampled_render_to_texture");
    },
    get: function (r) {
      let n = t(r);
      return n === null && console.warn("THREE.WebGLRenderer: " + r + " extension not supported."), n;
    }
  };
}
function _0(i, e, t, r) {
  let n = {},
    s = new WeakMap();
  function o(d) {
    let u = d.target;
    u.index !== null && e.remove(u.index);
    for (let g in u.attributes) e.remove(u.attributes[g]);
    u.removeEventListener("dispose", o), delete n[u.id];
    let p = s.get(u);
    p && (e.remove(p), s.delete(u)), r.releaseStatesOfGeometry(u), u.isInstancedBufferGeometry === !0 && delete u._maxInstanceCount, t.memory.geometries--;
  }
  function a(d, u) {
    return n[u.id] === !0 || (u.addEventListener("dispose", o), n[u.id] = !0, t.memory.geometries++), u;
  }
  function l(d) {
    let u = d.attributes;
    for (let g in u) e.update(u[g], 34962);
    let p = d.morphAttributes;
    for (let g in p) {
      let f = p[g];
      for (let m = 0, v = f.length; m < v; m++) e.update(f[m], 34962);
    }
  }
  function c(d) {
    let u = [],
      p = d.index,
      g = d.attributes.position,
      f = 0;
    if (p !== null) {
      let y = p.array;
      f = p.version;
      for (let x = 0, b = y.length; x < b; x += 3) {
        let w = y[x + 0],
          A = y[x + 1],
          L = y[x + 2];
        u.push(w, A, A, L, L, w);
      }
    } else {
      let y = g.array;
      f = g.version;
      for (let x = 0, b = y.length / 3 - 1; x < b; x += 3) {
        let w = x + 0,
          A = x + 1,
          L = x + 2;
        u.push(w, A, A, L, L, w);
      }
    }
    let m = new (Nu(u) ? Da : La)(u, 1);
    m.version = f;
    let v = s.get(d);
    v && e.remove(v), s.set(d, m);
  }
  function h(d) {
    let u = s.get(d);
    if (u) {
      let p = d.index;
      p !== null && u.version < p.version && c(d);
    } else c(d);
    return s.get(d);
  }
  return {
    get: a,
    update: l,
    getWireframeAttribute: h
  };
}
function T0(i, e, t, r) {
  let n = r.isWebGL2,
    s;
  function o(u) {
    s = u;
  }
  let a, l;
  function c(u) {
    a = u.type, l = u.bytesPerElement;
  }
  function h(u, p) {
    i.drawElements(s, p, a, u * l), t.update(p, s, 1);
  }
  function d(u, p, g) {
    if (g === 0) return;
    let f, m;
    if (n) f = i, m = "drawElementsInstanced";else if (f = e.get("ANGLE_instanced_arrays"), m = "drawElementsInstancedANGLE", f === null) {
      console.error("THREE.WebGLIndexedBufferRenderer: using THREE.InstancedBufferGeometry but hardware does not support extension ANGLE_instanced_arrays.");
      return;
    }
    f[m](s, p, a, u * l, g), t.update(p, s, g);
  }
  this.setMode = o, this.setIndex = c, this.render = h, this.renderInstances = d;
}
function E0(i) {
  let e = {
      geometries: 0,
      textures: 0
    },
    t = {
      frame: 0,
      calls: 0,
      triangles: 0,
      points: 0,
      lines: 0
    };
  function r(s, o, a) {
    switch (t.calls++, o) {
      case 4:
        t.triangles += a * (s / 3);
        break;
      case 1:
        t.lines += a * (s / 2);
        break;
      case 3:
        t.lines += a * (s - 1);
        break;
      case 2:
        t.lines += a * s;
        break;
      case 0:
        t.points += a * s;
        break;
      default:
        console.error("THREE.WebGLInfo: Unknown draw mode:", o);
        break;
    }
  }
  function n() {
    t.frame++, t.calls = 0, t.triangles = 0, t.points = 0, t.lines = 0;
  }
  return {
    memory: e,
    render: t,
    programs: null,
    autoReset: !0,
    reset: n,
    update: r
  };
}
function A0(i, e) {
  return i[0] - e[0];
}
function C0(i, e) {
  return Math.abs(e[1]) - Math.abs(i[1]);
}
function R0(i, e, t) {
  let r = {},
    n = new Float32Array(8),
    s = new WeakMap(),
    o = new dt(),
    a = [];
  for (let c = 0; c < 8; c++) a[c] = [c, 0];
  function l(c, h, d) {
    let u = c.morphTargetInfluences;
    if (e.isWebGL2 === !0) {
      let g = h.morphAttributes.position || h.morphAttributes.normal || h.morphAttributes.color,
        f = g !== void 0 ? g.length : 0,
        m = s.get(h);
      if (m === void 0 || m.count !== f) {
        let x = function () {
          z.dispose(), s.delete(h), h.removeEventListener("dispose", x);
        };
        var p = x;
        m !== void 0 && m.texture.dispose();
        let b = h.morphAttributes.position !== void 0,
          w = h.morphAttributes.normal !== void 0,
          A = h.morphAttributes.color !== void 0,
          L = h.morphAttributes.position || [],
          M = h.morphAttributes.normal || [],
          T = h.morphAttributes.color || [],
          R = 0;
        b === !0 && (R = 1), w === !0 && (R = 2), A === !0 && (R = 3);
        let H = h.attributes.position.count * R,
          Z = 1;
        H > e.maxTextureSize && (Z = Math.ceil(H / e.maxTextureSize), H = e.maxTextureSize);
        let O = new Float32Array(H * Z * 4 * f),
          z = new Aa(O, H, Z, f);
        z.type = Vi, z.needsUpdate = !0;
        let j = R * 4;
        for (let ie = 0; ie < f; ie++) {
          let oe = L[ie],
            $ = M[ie],
            ae = T[ie],
            te = H * Z * 4 * ie;
          for (let be = 0; be < oe.count; be++) {
            let V = be * j;
            b === !0 && (o.fromBufferAttribute(oe, be), O[te + V + 0] = o.x, O[te + V + 1] = o.y, O[te + V + 2] = o.z, O[te + V + 3] = 0), w === !0 && (o.fromBufferAttribute($, be), O[te + V + 4] = o.x, O[te + V + 5] = o.y, O[te + V + 6] = o.z, O[te + V + 7] = 0), A === !0 && (o.fromBufferAttribute(ae, be), O[te + V + 8] = o.x, O[te + V + 9] = o.y, O[te + V + 10] = o.z, O[te + V + 11] = ae.itemSize === 4 ? o.w : 1);
          }
        }
        m = {
          count: f,
          texture: z,
          size: new se(H, Z)
        }, s.set(h, m), h.addEventListener("dispose", x);
      }
      let v = 0;
      for (let x = 0; x < u.length; x++) v += u[x];
      let y = h.morphTargetsRelative ? 1 : 1 - v;
      d.getUniforms().setValue(i, "morphTargetBaseInfluence", y), d.getUniforms().setValue(i, "morphTargetInfluences", u), d.getUniforms().setValue(i, "morphTargetsTexture", m.texture, t), d.getUniforms().setValue(i, "morphTargetsTextureSize", m.size);
    } else {
      let g = u === void 0 ? 0 : u.length,
        f = r[h.id];
      if (f === void 0 || f.length !== g) {
        f = [];
        for (let b = 0; b < g; b++) f[b] = [b, 0];
        r[h.id] = f;
      }
      for (let b = 0; b < g; b++) {
        let w = f[b];
        w[0] = b, w[1] = u[b];
      }
      f.sort(C0);
      for (let b = 0; b < 8; b++) b < g && f[b][1] ? (a[b][0] = f[b][0], a[b][1] = f[b][1]) : (a[b][0] = Number.MAX_SAFE_INTEGER, a[b][1] = 0);
      a.sort(A0);
      let m = h.morphAttributes.position,
        v = h.morphAttributes.normal,
        y = 0;
      for (let b = 0; b < 8; b++) {
        let w = a[b],
          A = w[0],
          L = w[1];
        A !== Number.MAX_SAFE_INTEGER && L ? (m && h.getAttribute("morphTarget" + b) !== m[A] && h.setAttribute("morphTarget" + b, m[A]), v && h.getAttribute("morphNormal" + b) !== v[A] && h.setAttribute("morphNormal" + b, v[A]), n[b] = L, y += L) : (m && h.hasAttribute("morphTarget" + b) === !0 && h.deleteAttribute("morphTarget" + b), v && h.hasAttribute("morphNormal" + b) === !0 && h.deleteAttribute("morphNormal" + b), n[b] = 0);
      }
      let x = h.morphTargetsRelative ? 1 : 1 - y;
      d.getUniforms().setValue(i, "morphTargetBaseInfluence", x), d.getUniforms().setValue(i, "morphTargetInfluences", n);
    }
  }
  return {
    update: l
  };
}
function P0(i, e, t, r) {
  let n = new WeakMap();
  function s(l) {
    let c = r.render.frame,
      h = l.geometry,
      d = e.get(l, h);
    return n.get(d) !== c && (e.update(d), n.set(d, c)), l.isInstancedMesh && (l.hasEventListener("dispose", a) === !1 && l.addEventListener("dispose", a), t.update(l.instanceMatrix, 34962), l.instanceColor !== null && t.update(l.instanceColor, 34962)), d;
  }
  function o() {
    n = new WeakMap();
  }
  function a(l) {
    let c = l.target;
    c.removeEventListener("dispose", a), t.remove(c.instanceMatrix), c.instanceColor !== null && t.remove(c.instanceColor);
  }
  return {
    update: s,
    dispose: o
  };
}
var Bu = new vr(),
  Gu = new Aa(),
  Vu = new vc(),
  Wu = new Ia(),
  Lh = [],
  Dh = [],
  zh = new Float32Array(16),
  Ih = new Float32Array(9),
  Oh = new Float32Array(4);
function Gn(i, e, t) {
  let r = i[0];
  if (r <= 0 || r > 0) return i;
  let n = e * t,
    s = Lh[n];
  if (s === void 0 && (s = new Float32Array(n), Lh[n] = s), e !== 0) {
    r.toArray(s, 0);
    for (let o = 1, a = 0; o !== e; ++o) a += t, i[o].toArray(s, a);
  }
  return s;
}
function Et(i, e) {
  if (i.length !== e.length) return !1;
  for (let t = 0, r = i.length; t < r; t++) if (i[t] !== e[t]) return !1;
  return !0;
}
function At(i, e) {
  for (let t = 0, r = e.length; t < r; t++) i[t] = e[t];
}
function io(i, e) {
  let t = Dh[e];
  t === void 0 && (t = new Int32Array(e), Dh[e] = t);
  for (let r = 0; r !== e; ++r) t[r] = i.allocateTextureUnit();
  return t;
}
function L0(i, e) {
  let t = this.cache;
  t[0] !== e && (i.uniform1f(this.addr, e), t[0] = e);
}
function D0(i, e) {
  let t = this.cache;
  if (e.x !== void 0) (t[0] !== e.x || t[1] !== e.y) && (i.uniform2f(this.addr, e.x, e.y), t[0] = e.x, t[1] = e.y);else {
    if (Et(t, e)) return;
    i.uniform2fv(this.addr, e), At(t, e);
  }
}
function z0(i, e) {
  let t = this.cache;
  if (e.x !== void 0) (t[0] !== e.x || t[1] !== e.y || t[2] !== e.z) && (i.uniform3f(this.addr, e.x, e.y, e.z), t[0] = e.x, t[1] = e.y, t[2] = e.z);else if (e.r !== void 0) (t[0] !== e.r || t[1] !== e.g || t[2] !== e.b) && (i.uniform3f(this.addr, e.r, e.g, e.b), t[0] = e.r, t[1] = e.g, t[2] = e.b);else {
    if (Et(t, e)) return;
    i.uniform3fv(this.addr, e), At(t, e);
  }
}
function I0(i, e) {
  let t = this.cache;
  if (e.x !== void 0) (t[0] !== e.x || t[1] !== e.y || t[2] !== e.z || t[3] !== e.w) && (i.uniform4f(this.addr, e.x, e.y, e.z, e.w), t[0] = e.x, t[1] = e.y, t[2] = e.z, t[3] = e.w);else {
    if (Et(t, e)) return;
    i.uniform4fv(this.addr, e), At(t, e);
  }
}
function O0(i, e) {
  let t = this.cache,
    r = e.elements;
  if (r === void 0) {
    if (Et(t, e)) return;
    i.uniformMatrix2fv(this.addr, !1, e), At(t, e);
  } else {
    if (Et(t, r)) return;
    Oh.set(r), i.uniformMatrix2fv(this.addr, !1, Oh), At(t, r);
  }
}
function N0(i, e) {
  let t = this.cache,
    r = e.elements;
  if (r === void 0) {
    if (Et(t, e)) return;
    i.uniformMatrix3fv(this.addr, !1, e), At(t, e);
  } else {
    if (Et(t, r)) return;
    Ih.set(r), i.uniformMatrix3fv(this.addr, !1, Ih), At(t, r);
  }
}
function k0(i, e) {
  let t = this.cache,
    r = e.elements;
  if (r === void 0) {
    if (Et(t, e)) return;
    i.uniformMatrix4fv(this.addr, !1, e), At(t, e);
  } else {
    if (Et(t, r)) return;
    zh.set(r), i.uniformMatrix4fv(this.addr, !1, zh), At(t, r);
  }
}
function U0(i, e) {
  let t = this.cache;
  t[0] !== e && (i.uniform1i(this.addr, e), t[0] = e);
}
function F0(i, e) {
  let t = this.cache;
  if (e.x !== void 0) (t[0] !== e.x || t[1] !== e.y) && (i.uniform2i(this.addr, e.x, e.y), t[0] = e.x, t[1] = e.y);else {
    if (Et(t, e)) return;
    i.uniform2iv(this.addr, e), At(t, e);
  }
}
function B0(i, e) {
  let t = this.cache;
  if (e.x !== void 0) (t[0] !== e.x || t[1] !== e.y || t[2] !== e.z) && (i.uniform3i(this.addr, e.x, e.y, e.z), t[0] = e.x, t[1] = e.y, t[2] = e.z);else {
    if (Et(t, e)) return;
    i.uniform3iv(this.addr, e), At(t, e);
  }
}
function G0(i, e) {
  let t = this.cache;
  if (e.x !== void 0) (t[0] !== e.x || t[1] !== e.y || t[2] !== e.z || t[3] !== e.w) && (i.uniform4i(this.addr, e.x, e.y, e.z, e.w), t[0] = e.x, t[1] = e.y, t[2] = e.z, t[3] = e.w);else {
    if (Et(t, e)) return;
    i.uniform4iv(this.addr, e), At(t, e);
  }
}
function V0(i, e) {
  let t = this.cache;
  t[0] !== e && (i.uniform1ui(this.addr, e), t[0] = e);
}
function W0(i, e) {
  let t = this.cache;
  if (e.x !== void 0) (t[0] !== e.x || t[1] !== e.y) && (i.uniform2ui(this.addr, e.x, e.y), t[0] = e.x, t[1] = e.y);else {
    if (Et(t, e)) return;
    i.uniform2uiv(this.addr, e), At(t, e);
  }
}
function H0(i, e) {
  let t = this.cache;
  if (e.x !== void 0) (t[0] !== e.x || t[1] !== e.y || t[2] !== e.z) && (i.uniform3ui(this.addr, e.x, e.y, e.z), t[0] = e.x, t[1] = e.y, t[2] = e.z);else {
    if (Et(t, e)) return;
    i.uniform3uiv(this.addr, e), At(t, e);
  }
}
function j0(i, e) {
  let t = this.cache;
  if (e.x !== void 0) (t[0] !== e.x || t[1] !== e.y || t[2] !== e.z || t[3] !== e.w) && (i.uniform4ui(this.addr, e.x, e.y, e.z, e.w), t[0] = e.x, t[1] = e.y, t[2] = e.z, t[3] = e.w);else {
    if (Et(t, e)) return;
    i.uniform4uiv(this.addr, e), At(t, e);
  }
}
function q0(i, e, t) {
  let r = this.cache,
    n = t.allocateTextureUnit();
  r[0] !== n && (i.uniform1i(this.addr, n), r[0] = n), t.setTexture2D(e || Bu, n);
}
function X0(i, e, t) {
  let r = this.cache,
    n = t.allocateTextureUnit();
  r[0] !== n && (i.uniform1i(this.addr, n), r[0] = n), t.setTexture3D(e || Vu, n);
}
function Y0(i, e, t) {
  let r = this.cache,
    n = t.allocateTextureUnit();
  r[0] !== n && (i.uniform1i(this.addr, n), r[0] = n), t.setTextureCube(e || Wu, n);
}
function Z0(i, e, t) {
  let r = this.cache,
    n = t.allocateTextureUnit();
  r[0] !== n && (i.uniform1i(this.addr, n), r[0] = n), t.setTexture2DArray(e || Gu, n);
}
function J0(i) {
  switch (i) {
    case 5126:
      return L0;
    case 35664:
      return D0;
    case 35665:
      return z0;
    case 35666:
      return I0;
    case 35674:
      return O0;
    case 35675:
      return N0;
    case 35676:
      return k0;
    case 5124:
    case 35670:
      return U0;
    case 35667:
    case 35671:
      return F0;
    case 35668:
    case 35672:
      return B0;
    case 35669:
    case 35673:
      return G0;
    case 5125:
      return V0;
    case 36294:
      return W0;
    case 36295:
      return H0;
    case 36296:
      return j0;
    case 35678:
    case 36198:
    case 36298:
    case 36306:
    case 35682:
      return q0;
    case 35679:
    case 36299:
    case 36307:
      return X0;
    case 35680:
    case 36300:
    case 36308:
    case 36293:
      return Y0;
    case 36289:
    case 36303:
    case 36311:
    case 36292:
      return Z0;
  }
}
function K0(i, e) {
  i.uniform1fv(this.addr, e);
}
function Q0(i, e) {
  let t = Gn(e, this.size, 2);
  i.uniform2fv(this.addr, t);
}
function $0(i, e) {
  let t = Gn(e, this.size, 3);
  i.uniform3fv(this.addr, t);
}
function ev(i, e) {
  let t = Gn(e, this.size, 4);
  i.uniform4fv(this.addr, t);
}
function tv(i, e) {
  let t = Gn(e, this.size, 4);
  i.uniformMatrix2fv(this.addr, !1, t);
}
function rv(i, e) {
  let t = Gn(e, this.size, 9);
  i.uniformMatrix3fv(this.addr, !1, t);
}
function iv(i, e) {
  let t = Gn(e, this.size, 16);
  i.uniformMatrix4fv(this.addr, !1, t);
}
function nv(i, e) {
  i.uniform1iv(this.addr, e);
}
function sv(i, e) {
  i.uniform2iv(this.addr, e);
}
function av(i, e) {
  i.uniform3iv(this.addr, e);
}
function ov(i, e) {
  i.uniform4iv(this.addr, e);
}
function cv(i, e) {
  i.uniform1uiv(this.addr, e);
}
function lv(i, e) {
  i.uniform2uiv(this.addr, e);
}
function hv(i, e) {
  i.uniform3uiv(this.addr, e);
}
function uv(i, e) {
  i.uniform4uiv(this.addr, e);
}
function dv(i, e, t) {
  let r = this.cache,
    n = e.length,
    s = io(t, n);
  Et(r, s) || (i.uniform1iv(this.addr, s), At(r, s));
  for (let o = 0; o !== n; ++o) t.setTexture2D(e[o] || Bu, s[o]);
}
function pv(i, e, t) {
  let r = this.cache,
    n = e.length,
    s = io(t, n);
  Et(r, s) || (i.uniform1iv(this.addr, s), At(r, s));
  for (let o = 0; o !== n; ++o) t.setTexture3D(e[o] || Vu, s[o]);
}
function fv(i, e, t) {
  let r = this.cache,
    n = e.length,
    s = io(t, n);
  Et(r, s) || (i.uniform1iv(this.addr, s), At(r, s));
  for (let o = 0; o !== n; ++o) t.setTextureCube(e[o] || Wu, s[o]);
}
function mv(i, e, t) {
  let r = this.cache,
    n = e.length,
    s = io(t, n);
  Et(r, s) || (i.uniform1iv(this.addr, s), At(r, s));
  for (let o = 0; o !== n; ++o) t.setTexture2DArray(e[o] || Gu, s[o]);
}
function gv(i) {
  switch (i) {
    case 5126:
      return K0;
    case 35664:
      return Q0;
    case 35665:
      return $0;
    case 35666:
      return ev;
    case 35674:
      return tv;
    case 35675:
      return rv;
    case 35676:
      return iv;
    case 5124:
    case 35670:
      return nv;
    case 35667:
    case 35671:
      return sv;
    case 35668:
    case 35672:
      return av;
    case 35669:
    case 35673:
      return ov;
    case 5125:
      return cv;
    case 36294:
      return lv;
    case 36295:
      return hv;
    case 36296:
      return uv;
    case 35678:
    case 36198:
    case 36298:
    case 36306:
    case 35682:
      return dv;
    case 35679:
    case 36299:
    case 36307:
      return pv;
    case 35680:
    case 36300:
    case 36308:
    case 36293:
      return fv;
    case 36289:
    case 36303:
    case 36311:
    case 36292:
      return mv;
  }
}
var bc = class {
    constructor(e, t, r) {
      this.id = e, this.addr = r, this.cache = [], this.setValue = J0(t.type);
    }
  },
  Mc = class {
    constructor(e, t, r) {
      this.id = e, this.addr = r, this.cache = [], this.size = t.size, this.setValue = gv(t.type);
    }
  },
  Sc = class {
    constructor(e) {
      this.id = e, this.seq = [], this.map = {};
    }
    setValue(e, t, r) {
      let n = this.seq;
      for (let s = 0, o = n.length; s !== o; ++s) {
        let a = n[s];
        a.setValue(e, t[a.id], r);
      }
    }
  },
  qo = /(\w+)(\])?(\[|\.)?/g;
function Nh(i, e) {
  i.seq.push(e), i.map[e.id] = e;
}
function vv(i, e, t) {
  let r = i.name,
    n = r.length;
  for (qo.lastIndex = 0;;) {
    let s = qo.exec(r),
      o = qo.lastIndex,
      a = s[1],
      l = s[2] === "]",
      c = s[3];
    if (l && (a = a | 0), c === void 0 || c === "[" && o + 2 === n) {
      Nh(t, c === void 0 ? new bc(a, i, e) : new Mc(a, i, e));
      break;
    } else {
      let h = t.map[a];
      h === void 0 && (h = new Sc(a), Nh(t, h)), t = h;
    }
  }
}
var En = class {
  constructor(e, t) {
    this.seq = [], this.map = {};
    let r = e.getProgramParameter(t, 35718);
    for (let n = 0; n < r; ++n) {
      let s = e.getActiveUniform(t, n),
        o = e.getUniformLocation(t, s.name);
      vv(s, o, this);
    }
  }
  setValue(e, t, r, n) {
    let s = this.map[t];
    s !== void 0 && s.setValue(e, r, n);
  }
  setOptional(e, t, r) {
    let n = t[r];
    n !== void 0 && this.setValue(e, r, n);
  }
  static upload(e, t, r, n) {
    for (let s = 0, o = t.length; s !== o; ++s) {
      let a = t[s],
        l = r[a.id];
      l.needsUpdate !== !1 && a.setValue(e, l.value, n);
    }
  }
  static seqWithValue(e, t) {
    let r = [];
    for (let n = 0, s = e.length; n !== s; ++n) {
      let o = e[n];
      o.id in t && r.push(o);
    }
    return r;
  }
};
function kh(i, e, t) {
  let r = i.createShader(e);
  return i.shaderSource(r, t), i.compileShader(r), r;
}
var xv = 0;
function yv(i, e) {
  let t = i.split(`
`),
    r = [],
    n = Math.max(e - 6, 0),
    s = Math.min(e + 6, t.length);
  for (let o = n; o < s; o++) {
    let a = o + 1;
    r.push(`${a === e ? ">" : " "} ${a}: ${t[o]}`);
  }
  return r.join(`
`);
}
function bv(i) {
  switch (i) {
    case Yi:
      return ["Linear", "( value )"];
    case Ke:
      return ["sRGB", "( value )"];
    default:
      return console.warn("THREE.WebGLProgram: Unsupported encoding:", i), ["Linear", "( value )"];
  }
}
function Uh(i, e, t) {
  let r = i.getShaderParameter(e, 35713),
    n = i.getShaderInfoLog(e).trim();
  if (r && n === "") return "";
  let s = /ERROR: 0:(\d+)/.exec(n);
  if (s) {
    let o = parseInt(s[1]);
    return t.toUpperCase() + `

` + n + `

` + yv(i.getShaderSource(e), o);
  } else return n;
}
function Mv(i, e) {
  let t = bv(e);
  return "vec4 " + i + "( vec4 value ) { return LinearTo" + t[0] + t[1] + "; }";
}
function Sv(i, e) {
  let t;
  switch (e) {
    case Fp:
      t = "Linear";
      break;
    case Bp:
      t = "Reinhard";
      break;
    case Gp:
      t = "OptimizedCineon";
      break;
    case gl:
      t = "ACESFilmic";
      break;
    case Vp:
      t = "Custom";
      break;
    default:
      console.warn("THREE.WebGLProgram: Unsupported toneMapping:", e), t = "Linear";
  }
  return "vec3 " + i + "( vec3 color ) { return " + t + "ToneMapping( color ); }";
}
function wv(i) {
  return [i.extensionDerivatives || i.envMapCubeUVHeight || i.bumpMap || i.tangentSpaceNormalMap || i.clearcoatNormalMap || i.flatShading || i.shaderID === "physical" ? "#extension GL_OES_standard_derivatives : enable" : "", (i.extensionFragDepth || i.logarithmicDepthBuffer) && i.rendererExtensionFragDepth ? "#extension GL_EXT_frag_depth : enable" : "", i.extensionDrawBuffers && i.rendererExtensionDrawBuffers ? "#extension GL_EXT_draw_buffers : require" : "", (i.extensionShaderTextureLOD || i.envMap || i.transmission) && i.rendererExtensionShaderTextureLod ? "#extension GL_EXT_shader_texture_lod : enable" : ""].filter(ls).join(`
`);
}
function _v(i) {
  let e = [];
  for (let t in i) {
    let r = i[t];
    r !== !1 && e.push("#define " + t + " " + r);
  }
  return e.join(`
`);
}
function Tv(i, e) {
  let t = {},
    r = i.getProgramParameter(e, 35721);
  for (let n = 0; n < r; n++) {
    let s = i.getActiveAttrib(e, n),
      o = s.name,
      a = 1;
    s.type === 35674 && (a = 2), s.type === 35675 && (a = 3), s.type === 35676 && (a = 4), t[o] = {
      type: s.type,
      location: i.getAttribLocation(e, o),
      locationSize: a
    };
  }
  return t;
}
function ls(i) {
  return i !== "";
}
function Fh(i, e) {
  let t = e.numSpotLightShadows + e.numSpotLightMaps - e.numSpotLightShadowsWithMaps;
  return i.replace(/NUM_DIR_LIGHTS/g, e.numDirLights).replace(/NUM_SPOT_LIGHTS/g, e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g, e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g, t).replace(/NUM_RECT_AREA_LIGHTS/g, e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g, e.numPointLights).replace(/NUM_HEMI_LIGHTS/g, e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g, e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g, e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g, e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g, e.numPointLightShadows);
}
function Bh(i, e) {
  return i.replace(/NUM_CLIPPING_PLANES/g, e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g, e.numClippingPlanes - e.numClipIntersection);
}
var Ev = /^[ \t]*#include +<([\w\d./]+)>/gm;
function wc(i) {
  return i.replace(Ev, Av);
}
function Av(i, e) {
  let t = Be[e];
  if (t === void 0) throw new Error("Can not resolve #include <" + e + ">");
  return wc(t);
}
var Cv = /#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;
function Gh(i) {
  return i.replace(Cv, Rv);
}
function Rv(i, e, t, r) {
  let n = "";
  for (let s = parseInt(e); s < parseInt(t); s++) n += r.replace(/\[\s*i\s*\]/g, "[ " + s + " ]").replace(/UNROLLED_LOOP_INDEX/g, s);
  return n;
}
function Vh(i) {
  let e = "precision " + i.precision + ` float;
precision ` + i.precision + " int;";
  return i.precision === "highp" ? e += `
#define HIGH_PRECISION` : i.precision === "mediump" ? e += `
#define MEDIUM_PRECISION` : i.precision === "lowp" && (e += `
#define LOW_PRECISION`), e;
}
function Pv(i) {
  let e = "SHADOWMAP_TYPE_BASIC";
  return i.shadowMapType === Au ? e = "SHADOWMAP_TYPE_PCF" : i.shadowMapType === Cu ? e = "SHADOWMAP_TYPE_PCF_SOFT" : i.shadowMapType === cs && (e = "SHADOWMAP_TYPE_VSM"), e;
}
function Lv(i) {
  let e = "ENVMAP_TYPE_CUBE";
  if (i.envMap) switch (i.envMapMode) {
    case Rn:
    case Pn:
      e = "ENVMAP_TYPE_CUBE";
      break;
    case to:
      e = "ENVMAP_TYPE_CUBE_UV";
      break;
  }
  return e;
}
function Dv(i) {
  let e = "ENVMAP_MODE_REFLECTION";
  return i.envMap && i.envMapMode === Pn && (e = "ENVMAP_MODE_REFRACTION"), e;
}
function zv(i) {
  let e = "ENVMAP_BLENDING_NONE";
  if (i.envMap) switch (i.combine) {
    case Lu:
      e = "ENVMAP_BLENDING_MULTIPLY";
      break;
    case kp:
      e = "ENVMAP_BLENDING_MIX";
      break;
    case Up:
      e = "ENVMAP_BLENDING_ADD";
      break;
  }
  return e;
}
function Iv(i) {
  let e = i.envMapCubeUVHeight;
  if (e === null) return null;
  let t = Math.log2(e) - 2,
    r = 1 / e;
  return {
    texelWidth: 1 / (3 * Math.max(Math.pow(2, t), 112)),
    texelHeight: r,
    maxMip: t
  };
}
function Ov(i, e, t, r) {
  let n = i.getContext(),
    s = t.defines,
    o = t.vertexShader,
    a = t.fragmentShader,
    l = Pv(t),
    c = Lv(t),
    h = Dv(t),
    d = zv(t),
    u = Iv(t),
    p = t.isWebGL2 ? "" : wv(t),
    g = _v(s),
    f = n.createProgram(),
    m,
    v,
    y = t.glslVersion ? "#version " + t.glslVersion + `
` : "";
  t.isRawShaderMaterial ? (m = [g].filter(ls).join(`
`), m.length > 0 && (m += `
`), v = [p, g].filter(ls).join(`
`), v.length > 0 && (v += `
`)) : (m = [Vh(t), "#define SHADER_NAME " + t.shaderName, g, t.instancing ? "#define USE_INSTANCING" : "", t.instancingColor ? "#define USE_INSTANCING_COLOR" : "", t.supportsVertexTextures ? "#define VERTEX_TEXTURES" : "", t.useFog && t.fog ? "#define USE_FOG" : "", t.useFog && t.fogExp2 ? "#define FOG_EXP2" : "", t.map ? "#define USE_MAP" : "", t.envMap ? "#define USE_ENVMAP" : "", t.envMap ? "#define " + h : "", t.lightMap ? "#define USE_LIGHTMAP" : "", t.aoMap ? "#define USE_AOMAP" : "", t.emissiveMap ? "#define USE_EMISSIVEMAP" : "", t.bumpMap ? "#define USE_BUMPMAP" : "", t.normalMap ? "#define USE_NORMALMAP" : "", t.normalMap && t.objectSpaceNormalMap ? "#define OBJECTSPACE_NORMALMAP" : "", t.normalMap && t.tangentSpaceNormalMap ? "#define TANGENTSPACE_NORMALMAP" : "", t.clearcoatMap ? "#define USE_CLEARCOATMAP" : "", t.clearcoatRoughnessMap ? "#define USE_CLEARCOAT_ROUGHNESSMAP" : "", t.clearcoatNormalMap ? "#define USE_CLEARCOAT_NORMALMAP" : "", t.iridescenceMap ? "#define USE_IRIDESCENCEMAP" : "", t.iridescenceThicknessMap ? "#define USE_IRIDESCENCE_THICKNESSMAP" : "", t.displacementMap && t.supportsVertexTextures ? "#define USE_DISPLACEMENTMAP" : "", t.specularMap ? "#define USE_SPECULARMAP" : "", t.specularIntensityMap ? "#define USE_SPECULARINTENSITYMAP" : "", t.specularColorMap ? "#define USE_SPECULARCOLORMAP" : "", t.roughnessMap ? "#define USE_ROUGHNESSMAP" : "", t.metalnessMap ? "#define USE_METALNESSMAP" : "", t.alphaMap ? "#define USE_ALPHAMAP" : "", t.transmission ? "#define USE_TRANSMISSION" : "", t.transmissionMap ? "#define USE_TRANSMISSIONMAP" : "", t.thicknessMap ? "#define USE_THICKNESSMAP" : "", t.sheenColorMap ? "#define USE_SHEENCOLORMAP" : "", t.sheenRoughnessMap ? "#define USE_SHEENROUGHNESSMAP" : "", t.vertexTangents ? "#define USE_TANGENT" : "", t.vertexColors ? "#define USE_COLOR" : "", t.vertexAlphas ? "#define USE_COLOR_ALPHA" : "", t.vertexUvs ? "#define USE_UV" : "", t.uvsVertexOnly ? "#define UVS_VERTEX_ONLY" : "", t.flatShading ? "#define FLAT_SHADED" : "", t.skinning ? "#define USE_SKINNING" : "", t.morphTargets ? "#define USE_MORPHTARGETS" : "", t.morphNormals && t.flatShading === !1 ? "#define USE_MORPHNORMALS" : "", t.morphColors && t.isWebGL2 ? "#define USE_MORPHCOLORS" : "", t.morphTargetsCount > 0 && t.isWebGL2 ? "#define MORPHTARGETS_TEXTURE" : "", t.morphTargetsCount > 0 && t.isWebGL2 ? "#define MORPHTARGETS_TEXTURE_STRIDE " + t.morphTextureStride : "", t.morphTargetsCount > 0 && t.isWebGL2 ? "#define MORPHTARGETS_COUNT " + t.morphTargetsCount : "", t.doubleSided ? "#define DOUBLE_SIDED" : "", t.flipSided ? "#define FLIP_SIDED" : "", t.shadowMapEnabled ? "#define USE_SHADOWMAP" : "", t.shadowMapEnabled ? "#define " + l : "", t.sizeAttenuation ? "#define USE_SIZEATTENUATION" : "", t.logarithmicDepthBuffer ? "#define USE_LOGDEPTHBUF" : "", t.logarithmicDepthBuffer && t.rendererExtensionFragDepth ? "#define USE_LOGDEPTHBUF_EXT" : "", "uniform mat4 modelMatrix;", "uniform mat4 modelViewMatrix;", "uniform mat4 projectionMatrix;", "uniform mat4 viewMatrix;", "uniform mat3 normalMatrix;", "uniform vec3 cameraPosition;", "uniform bool isOrthographic;", "#ifdef USE_INSTANCING", "	attribute mat4 instanceMatrix;", "#endif", "#ifdef USE_INSTANCING_COLOR", "	attribute vec3 instanceColor;", "#endif", "attribute vec3 position;", "attribute vec3 normal;", "attribute vec2 uv;", "#ifdef USE_TANGENT", "	attribute vec4 tangent;", "#endif", "#if defined( USE_COLOR_ALPHA )", "	attribute vec4 color;", "#elif defined( USE_COLOR )", "	attribute vec3 color;", "#endif", "#if ( defined( USE_MORPHTARGETS ) && ! defined( MORPHTARGETS_TEXTURE ) )", "	attribute vec3 morphTarget0;", "	attribute vec3 morphTarget1;", "	attribute vec3 morphTarget2;", "	attribute vec3 morphTarget3;", "	#ifdef USE_MORPHNORMALS", "		attribute vec3 morphNormal0;", "		attribute vec3 morphNormal1;", "		attribute vec3 morphNormal2;", "		attribute vec3 morphNormal3;", "	#else", "		attribute vec3 morphTarget4;", "		attribute vec3 morphTarget5;", "		attribute vec3 morphTarget6;", "		attribute vec3 morphTarget7;", "	#endif", "#endif", "#ifdef USE_SKINNING", "	attribute vec4 skinIndex;", "	attribute vec4 skinWeight;", "#endif", `
`].filter(ls).join(`
`), v = [p, Vh(t), "#define SHADER_NAME " + t.shaderName, g, t.useFog && t.fog ? "#define USE_FOG" : "", t.useFog && t.fogExp2 ? "#define FOG_EXP2" : "", t.map ? "#define USE_MAP" : "", t.matcap ? "#define USE_MATCAP" : "", t.envMap ? "#define USE_ENVMAP" : "", t.envMap ? "#define " + c : "", t.envMap ? "#define " + h : "", t.envMap ? "#define " + d : "", u ? "#define CUBEUV_TEXEL_WIDTH " + u.texelWidth : "", u ? "#define CUBEUV_TEXEL_HEIGHT " + u.texelHeight : "", u ? "#define CUBEUV_MAX_MIP " + u.maxMip + ".0" : "", t.lightMap ? "#define USE_LIGHTMAP" : "", t.aoMap ? "#define USE_AOMAP" : "", t.emissiveMap ? "#define USE_EMISSIVEMAP" : "", t.bumpMap ? "#define USE_BUMPMAP" : "", t.normalMap ? "#define USE_NORMALMAP" : "", t.normalMap && t.objectSpaceNormalMap ? "#define OBJECTSPACE_NORMALMAP" : "", t.normalMap && t.tangentSpaceNormalMap ? "#define TANGENTSPACE_NORMALMAP" : "", t.clearcoat ? "#define USE_CLEARCOAT" : "", t.clearcoatMap ? "#define USE_CLEARCOATMAP" : "", t.clearcoatRoughnessMap ? "#define USE_CLEARCOAT_ROUGHNESSMAP" : "", t.clearcoatNormalMap ? "#define USE_CLEARCOAT_NORMALMAP" : "", t.iridescence ? "#define USE_IRIDESCENCE" : "", t.iridescenceMap ? "#define USE_IRIDESCENCEMAP" : "", t.iridescenceThicknessMap ? "#define USE_IRIDESCENCE_THICKNESSMAP" : "", t.specularMap ? "#define USE_SPECULARMAP" : "", t.specularIntensityMap ? "#define USE_SPECULARINTENSITYMAP" : "", t.specularColorMap ? "#define USE_SPECULARCOLORMAP" : "", t.roughnessMap ? "#define USE_ROUGHNESSMAP" : "", t.metalnessMap ? "#define USE_METALNESSMAP" : "", t.alphaMap ? "#define USE_ALPHAMAP" : "", t.alphaTest ? "#define USE_ALPHATEST" : "", t.sheen ? "#define USE_SHEEN" : "", t.sheenColorMap ? "#define USE_SHEENCOLORMAP" : "", t.sheenRoughnessMap ? "#define USE_SHEENROUGHNESSMAP" : "", t.transmission ? "#define USE_TRANSMISSION" : "", t.transmissionMap ? "#define USE_TRANSMISSIONMAP" : "", t.thicknessMap ? "#define USE_THICKNESSMAP" : "", t.decodeVideoTexture ? "#define DECODE_VIDEO_TEXTURE" : "", t.vertexTangents ? "#define USE_TANGENT" : "", t.vertexColors || t.instancingColor ? "#define USE_COLOR" : "", t.vertexAlphas ? "#define USE_COLOR_ALPHA" : "", t.vertexUvs ? "#define USE_UV" : "", t.uvsVertexOnly ? "#define UVS_VERTEX_ONLY" : "", t.gradientMap ? "#define USE_GRADIENTMAP" : "", t.flatShading ? "#define FLAT_SHADED" : "", t.doubleSided ? "#define DOUBLE_SIDED" : "", t.flipSided ? "#define FLIP_SIDED" : "", t.shadowMapEnabled ? "#define USE_SHADOWMAP" : "", t.shadowMapEnabled ? "#define " + l : "", t.premultipliedAlpha ? "#define PREMULTIPLIED_ALPHA" : "", t.useLegacyLights ? "#define LEGACY_LIGHTS" : "", t.logarithmicDepthBuffer ? "#define USE_LOGDEPTHBUF" : "", t.logarithmicDepthBuffer && t.rendererExtensionFragDepth ? "#define USE_LOGDEPTHBUF_EXT" : "", "uniform mat4 viewMatrix;", "uniform vec3 cameraPosition;", "uniform bool isOrthographic;", t.toneMapping !== ri ? "#define TONE_MAPPING" : "", t.toneMapping !== ri ? Be.tonemapping_pars_fragment : "", t.toneMapping !== ri ? Sv("toneMapping", t.toneMapping) : "", t.dithering ? "#define DITHERING" : "", t.opaque ? "#define OPAQUE" : "", Be.encodings_pars_fragment, Mv("linearToOutputTexel", t.outputEncoding), t.useDepthPacking ? "#define DEPTH_PACKING " + t.depthPacking : "", `
`].filter(ls).join(`
`)), o = wc(o), o = Fh(o, t), o = Bh(o, t), a = wc(a), a = Fh(a, t), a = Bh(a, t), o = Gh(o), a = Gh(a), t.isWebGL2 && t.isRawShaderMaterial !== !0 && (y = `#version 300 es
`, m = ["precision mediump sampler2DArray;", "#define attribute in", "#define varying out", "#define texture2D texture"].join(`
`) + `
` + m, v = ["#define varying in", t.glslVersion === uh ? "" : "layout(location = 0) out highp vec4 pc_fragColor;", t.glslVersion === uh ? "" : "#define gl_FragColor pc_fragColor", "#define gl_FragDepthEXT gl_FragDepth", "#define texture2D texture", "#define textureCube texture", "#define texture2DProj textureProj", "#define texture2DLodEXT textureLod", "#define texture2DProjLodEXT textureProjLod", "#define textureCubeLodEXT textureLod", "#define texture2DGradEXT textureGrad", "#define texture2DProjGradEXT textureProjGrad", "#define textureCubeGradEXT textureGrad"].join(`
`) + `
` + v);
  let x = y + m + o,
    b = y + v + a,
    w = kh(n, 35633, x),
    A = kh(n, 35632, b);
  if (n.attachShader(f, w), n.attachShader(f, A), t.index0AttributeName !== void 0 ? n.bindAttribLocation(f, 0, t.index0AttributeName) : t.morphTargets === !0 && n.bindAttribLocation(f, 0, "position"), n.linkProgram(f), i.debug.checkShaderErrors) {
    let T = n.getProgramInfoLog(f).trim(),
      R = n.getShaderInfoLog(w).trim(),
      H = n.getShaderInfoLog(A).trim(),
      Z = !0,
      O = !0;
    if (n.getProgramParameter(f, 35714) === !1) {
      Z = !1;
      let z = Uh(n, w, "vertex"),
        j = Uh(n, A, "fragment");
      console.error("THREE.WebGLProgram: Shader Error " + n.getError() + " - VALIDATE_STATUS " + n.getProgramParameter(f, 35715) + `

Program Info Log: ` + T + `
` + z + `
` + j);
    } else T !== "" ? console.warn("THREE.WebGLProgram: Program Info Log:", T) : (R === "" || H === "") && (O = !1);
    O && (this.diagnostics = {
      runnable: Z,
      programLog: T,
      vertexShader: {
        log: R,
        prefix: m
      },
      fragmentShader: {
        log: H,
        prefix: v
      }
    });
  }
  n.deleteShader(w), n.deleteShader(A);
  let L;
  this.getUniforms = function () {
    return L === void 0 && (L = new En(n, f)), L;
  };
  let M;
  return this.getAttributes = function () {
    return M === void 0 && (M = Tv(n, f)), M;
  }, this.destroy = function () {
    r.releaseStatesOfProgram(this), n.deleteProgram(f), this.program = void 0;
  }, this.name = t.shaderName, this.id = xv++, this.cacheKey = e, this.usedTimes = 1, this.program = f, this.vertexShader = w, this.fragmentShader = A, this;
}
var Nv = 0,
  _c = class {
    constructor() {
      this.shaderCache = new Map(), this.materialCache = new Map();
    }
    update(e) {
      let t = e.vertexShader,
        r = e.fragmentShader,
        n = this._getShaderStage(t),
        s = this._getShaderStage(r),
        o = this._getShaderCacheForMaterial(e);
      return o.has(n) === !1 && (o.add(n), n.usedTimes++), o.has(s) === !1 && (o.add(s), s.usedTimes++), this;
    }
    remove(e) {
      let t = this.materialCache.get(e);
      for (let r of t) r.usedTimes--, r.usedTimes === 0 && this.shaderCache.delete(r.code);
      return this.materialCache.delete(e), this;
    }
    getVertexShaderID(e) {
      return this._getShaderStage(e.vertexShader).id;
    }
    getFragmentShaderID(e) {
      return this._getShaderStage(e.fragmentShader).id;
    }
    dispose() {
      this.shaderCache.clear(), this.materialCache.clear();
    }
    _getShaderCacheForMaterial(e) {
      let t = this.materialCache,
        r = t.get(e);
      return r === void 0 && (r = new Set(), t.set(e, r)), r;
    }
    _getShaderStage(e) {
      let t = this.shaderCache,
        r = t.get(e);
      return r === void 0 && (r = new Tc(e), t.set(e, r)), r;
    }
  },
  Tc = class {
    constructor(e) {
      this.id = Nv++, this.code = e, this.usedTimes = 0;
    }
  };
function kv(i, e, t, r, n, s, o) {
  let a = new Pa(),
    l = new _c(),
    c = [],
    h = n.isWebGL2,
    d = n.logarithmicDepthBuffer,
    u = n.vertexTextures,
    p = n.precision,
    g = {
      MeshDepthMaterial: "depth",
      MeshDistanceMaterial: "distanceRGBA",
      MeshNormalMaterial: "normal",
      MeshBasicMaterial: "basic",
      MeshLambertMaterial: "lambert",
      MeshPhongMaterial: "phong",
      MeshToonMaterial: "toon",
      MeshStandardMaterial: "physical",
      MeshPhysicalMaterial: "physical",
      MeshMatcapMaterial: "matcap",
      LineBasicMaterial: "basic",
      LineDashedMaterial: "dashed",
      PointsMaterial: "points",
      ShadowMaterial: "shadow",
      SpriteMaterial: "sprite"
    };
  function f(M, T, R, H, Z) {
    let O = H.fog,
      z = Z.geometry,
      j = M.isMeshStandardMaterial ? H.environment : null,
      ie = (M.isMeshStandardMaterial ? t : e).get(M.envMap || j),
      oe = ie && ie.mapping === to ? ie.image.height : null,
      $ = g[M.type];
    M.precision !== null && (p = n.getMaxPrecision(M.precision), p !== M.precision && console.warn("THREE.WebGLProgram.getParameters:", M.precision, "not supported, using", p, "instead."));
    let ae = z.morphAttributes.position || z.morphAttributes.normal || z.morphAttributes.color,
      te = ae !== void 0 ? ae.length : 0,
      be = 0;
    z.morphAttributes.position !== void 0 && (be = 1), z.morphAttributes.normal !== void 0 && (be = 2), z.morphAttributes.color !== void 0 && (be = 3);
    let V, re, de, W;
    if ($) {
      let K = Ur[$];
      V = K.vertexShader, re = K.fragmentShader;
    } else V = M.vertexShader, re = M.fragmentShader, l.update(M), de = l.getVertexShaderID(M), W = l.getFragmentShaderID(M);
    let me = i.getRenderTarget(),
      P = M.alphaTest > 0,
      N = M.clearcoat > 0,
      Q = M.iridescence > 0;
    return {
      isWebGL2: h,
      shaderID: $,
      shaderName: M.type,
      vertexShader: V,
      fragmentShader: re,
      defines: M.defines,
      customVertexShaderID: de,
      customFragmentShaderID: W,
      isRawShaderMaterial: M.isRawShaderMaterial === !0,
      glslVersion: M.glslVersion,
      precision: p,
      instancing: Z.isInstancedMesh === !0,
      instancingColor: Z.isInstancedMesh === !0 && Z.instanceColor !== null,
      supportsVertexTextures: u,
      outputEncoding: me === null ? i.outputEncoding : me.isXRRenderTarget === !0 ? me.texture.encoding : Yi,
      map: !!M.map,
      matcap: !!M.matcap,
      envMap: !!ie,
      envMapMode: ie && ie.mapping,
      envMapCubeUVHeight: oe,
      lightMap: !!M.lightMap,
      aoMap: !!M.aoMap,
      emissiveMap: !!M.emissiveMap,
      bumpMap: !!M.bumpMap,
      normalMap: !!M.normalMap,
      objectSpaceNormalMap: M.normalMapType === cf,
      tangentSpaceNormalMap: M.normalMapType === Iu,
      decodeVideoTexture: !!M.map && M.map.isVideoTexture === !0 && M.map.encoding === Ke,
      clearcoat: N,
      clearcoatMap: N && !!M.clearcoatMap,
      clearcoatRoughnessMap: N && !!M.clearcoatRoughnessMap,
      clearcoatNormalMap: N && !!M.clearcoatNormalMap,
      iridescence: Q,
      iridescenceMap: Q && !!M.iridescenceMap,
      iridescenceThicknessMap: Q && !!M.iridescenceThicknessMap,
      displacementMap: !!M.displacementMap,
      roughnessMap: !!M.roughnessMap,
      metalnessMap: !!M.metalnessMap,
      specularMap: !!M.specularMap,
      specularIntensityMap: !!M.specularIntensityMap,
      specularColorMap: !!M.specularColorMap,
      opaque: M.transparent === !1 && M.blending === Wi,
      alphaMap: !!M.alphaMap,
      alphaTest: P,
      gradientMap: !!M.gradientMap,
      sheen: M.sheen > 0,
      sheenColorMap: !!M.sheenColorMap,
      sheenRoughnessMap: !!M.sheenRoughnessMap,
      transmission: M.transmission > 0,
      transmissionMap: !!M.transmissionMap,
      thicknessMap: !!M.thicknessMap,
      combine: M.combine,
      vertexTangents: !!M.normalMap && !!z.attributes.tangent,
      vertexColors: M.vertexColors,
      vertexAlphas: M.vertexColors === !0 && !!z.attributes.color && z.attributes.color.itemSize === 4,
      vertexUvs: !!M.map || !!M.bumpMap || !!M.normalMap || !!M.specularMap || !!M.alphaMap || !!M.emissiveMap || !!M.roughnessMap || !!M.metalnessMap || !!M.clearcoatMap || !!M.clearcoatRoughnessMap || !!M.clearcoatNormalMap || !!M.iridescenceMap || !!M.iridescenceThicknessMap || !!M.displacementMap || !!M.transmissionMap || !!M.thicknessMap || !!M.specularIntensityMap || !!M.specularColorMap || !!M.sheenColorMap || !!M.sheenRoughnessMap,
      uvsVertexOnly: !(M.map || M.bumpMap || M.normalMap || M.specularMap || M.alphaMap || M.emissiveMap || M.roughnessMap || M.metalnessMap || M.clearcoatNormalMap || M.iridescenceMap || M.iridescenceThicknessMap || M.transmission > 0 || M.transmissionMap || M.thicknessMap || M.specularIntensityMap || M.specularColorMap || M.sheen > 0 || M.sheenColorMap || M.sheenRoughnessMap) && !!M.displacementMap,
      fog: !!O,
      useFog: M.fog === !0,
      fogExp2: O && O.isFogExp2,
      flatShading: !!M.flatShading,
      sizeAttenuation: M.sizeAttenuation,
      logarithmicDepthBuffer: d,
      skinning: Z.isSkinnedMesh === !0,
      morphTargets: z.morphAttributes.position !== void 0,
      morphNormals: z.morphAttributes.normal !== void 0,
      morphColors: z.morphAttributes.color !== void 0,
      morphTargetsCount: te,
      morphTextureStride: be,
      numDirLights: T.directional.length,
      numPointLights: T.point.length,
      numSpotLights: T.spot.length,
      numSpotLightMaps: T.spotLightMap.length,
      numRectAreaLights: T.rectArea.length,
      numHemiLights: T.hemi.length,
      numDirLightShadows: T.directionalShadowMap.length,
      numPointLightShadows: T.pointShadowMap.length,
      numSpotLightShadows: T.spotShadowMap.length,
      numSpotLightShadowsWithMaps: T.numSpotLightShadowsWithMaps,
      numClippingPlanes: o.numPlanes,
      numClipIntersection: o.numIntersection,
      dithering: M.dithering,
      shadowMapEnabled: i.shadowMap.enabled && R.length > 0,
      shadowMapType: i.shadowMap.type,
      toneMapping: M.toneMapped ? i.toneMapping : ri,
      useLegacyLights: i.useLegacyLights,
      premultipliedAlpha: M.premultipliedAlpha,
      doubleSided: M.side === Gr,
      flipSided: M.side === or,
      useDepthPacking: !!M.depthPacking,
      depthPacking: M.depthPacking || 0,
      index0AttributeName: M.index0AttributeName,
      extensionDerivatives: M.extensions && M.extensions.derivatives,
      extensionFragDepth: M.extensions && M.extensions.fragDepth,
      extensionDrawBuffers: M.extensions && M.extensions.drawBuffers,
      extensionShaderTextureLOD: M.extensions && M.extensions.shaderTextureLOD,
      rendererExtensionFragDepth: h || r.has("EXT_frag_depth"),
      rendererExtensionDrawBuffers: h || r.has("WEBGL_draw_buffers"),
      rendererExtensionShaderTextureLod: h || r.has("EXT_shader_texture_lod"),
      customProgramCacheKey: M.customProgramCacheKey()
    };
  }
  function m(M) {
    let T = [];
    if (M.shaderID ? T.push(M.shaderID) : (T.push(M.customVertexShaderID), T.push(M.customFragmentShaderID)), M.defines !== void 0) for (let R in M.defines) T.push(R), T.push(M.defines[R]);
    return M.isRawShaderMaterial === !1 && (v(T, M), y(T, M), T.push(i.outputEncoding)), T.push(M.customProgramCacheKey), T.join();
  }
  function v(M, T) {
    M.push(T.precision), M.push(T.outputEncoding), M.push(T.envMapMode), M.push(T.envMapCubeUVHeight), M.push(T.combine), M.push(T.vertexUvs), M.push(T.fogExp2), M.push(T.sizeAttenuation), M.push(T.morphTargetsCount), M.push(T.morphAttributeCount), M.push(T.numDirLights), M.push(T.numPointLights), M.push(T.numSpotLights), M.push(T.numSpotLightMaps), M.push(T.numHemiLights), M.push(T.numRectAreaLights), M.push(T.numDirLightShadows), M.push(T.numPointLightShadows), M.push(T.numSpotLightShadows), M.push(T.numSpotLightShadowsWithMaps), M.push(T.shadowMapType), M.push(T.toneMapping), M.push(T.numClippingPlanes), M.push(T.numClipIntersection), M.push(T.depthPacking);
  }
  function y(M, T) {
    a.disableAll(), T.isWebGL2 && a.enable(0), T.supportsVertexTextures && a.enable(1), T.instancing && a.enable(2), T.instancingColor && a.enable(3), T.map && a.enable(4), T.matcap && a.enable(5), T.envMap && a.enable(6), T.lightMap && a.enable(7), T.aoMap && a.enable(8), T.emissiveMap && a.enable(9), T.bumpMap && a.enable(10), T.normalMap && a.enable(11), T.objectSpaceNormalMap && a.enable(12), T.tangentSpaceNormalMap && a.enable(13), T.clearcoat && a.enable(14), T.clearcoatMap && a.enable(15), T.clearcoatRoughnessMap && a.enable(16), T.clearcoatNormalMap && a.enable(17), T.iridescence && a.enable(18), T.iridescenceMap && a.enable(19), T.iridescenceThicknessMap && a.enable(20), T.displacementMap && a.enable(21), T.specularMap && a.enable(22), T.roughnessMap && a.enable(23), T.metalnessMap && a.enable(24), T.gradientMap && a.enable(25), T.alphaMap && a.enable(26), T.alphaTest && a.enable(27), T.vertexColors && a.enable(28), T.vertexAlphas && a.enable(29), T.vertexUvs && a.enable(30), T.vertexTangents && a.enable(31), T.uvsVertexOnly && a.enable(32), M.push(a.mask), a.disableAll(), T.fog && a.enable(0), T.useFog && a.enable(1), T.flatShading && a.enable(2), T.logarithmicDepthBuffer && a.enable(3), T.skinning && a.enable(4), T.morphTargets && a.enable(5), T.morphNormals && a.enable(6), T.morphColors && a.enable(7), T.premultipliedAlpha && a.enable(8), T.shadowMapEnabled && a.enable(9), T.useLegacyLights && a.enable(10), T.doubleSided && a.enable(11), T.flipSided && a.enable(12), T.useDepthPacking && a.enable(13), T.dithering && a.enable(14), T.specularIntensityMap && a.enable(15), T.specularColorMap && a.enable(16), T.transmission && a.enable(17), T.transmissionMap && a.enable(18), T.thicknessMap && a.enable(19), T.sheen && a.enable(20), T.sheenColorMap && a.enable(21), T.sheenRoughnessMap && a.enable(22), T.decodeVideoTexture && a.enable(23), T.opaque && a.enable(24), M.push(a.mask);
  }
  function x(M) {
    let T = g[M.type],
      R;
    if (T) {
      let H = Ur[T];
      R = Pf.clone(H.uniforms);
    } else R = M.uniforms;
    return R;
  }
  function b(M, T) {
    let R;
    for (let H = 0, Z = c.length; H < Z; H++) {
      let O = c[H];
      if (O.cacheKey === T) {
        R = O, ++R.usedTimes;
        break;
      }
    }
    return R === void 0 && (R = new Ov(i, T, M, s), c.push(R)), R;
  }
  function w(M) {
    if (--M.usedTimes === 0) {
      let T = c.indexOf(M);
      c[T] = c[c.length - 1], c.pop(), M.destroy();
    }
  }
  function A(M) {
    l.remove(M);
  }
  function L() {
    l.dispose();
  }
  return {
    getParameters: f,
    getProgramCacheKey: m,
    getUniforms: x,
    acquireProgram: b,
    releaseProgram: w,
    releaseShaderCache: A,
    programs: c,
    dispose: L
  };
}
function Uv() {
  let i = new WeakMap();
  function e(s) {
    let o = i.get(s);
    return o === void 0 && (o = {}, i.set(s, o)), o;
  }
  function t(s) {
    i.delete(s);
  }
  function r(s, o, a) {
    i.get(s)[o] = a;
  }
  function n() {
    i = new WeakMap();
  }
  return {
    get: e,
    remove: t,
    update: r,
    dispose: n
  };
}
function Fv(i, e) {
  return i.groupOrder !== e.groupOrder ? i.groupOrder - e.groupOrder : i.renderOrder !== e.renderOrder ? i.renderOrder - e.renderOrder : i.material.id !== e.material.id ? i.material.id - e.material.id : i.z !== e.z ? i.z - e.z : i.id - e.id;
}
function Wh(i, e) {
  return i.groupOrder !== e.groupOrder ? i.groupOrder - e.groupOrder : i.renderOrder !== e.renderOrder ? i.renderOrder - e.renderOrder : i.z !== e.z ? e.z - i.z : i.id - e.id;
}
function Hh() {
  let i = [],
    e = 0,
    t = [],
    r = [],
    n = [];
  function s() {
    e = 0, t.length = 0, r.length = 0, n.length = 0;
  }
  function o(d, u, p, g, f, m) {
    let v = i[e];
    return v === void 0 ? (v = {
      id: d.id,
      object: d,
      geometry: u,
      material: p,
      groupOrder: g,
      renderOrder: d.renderOrder,
      z: f,
      group: m
    }, i[e] = v) : (v.id = d.id, v.object = d, v.geometry = u, v.material = p, v.groupOrder = g, v.renderOrder = d.renderOrder, v.z = f, v.group = m), e++, v;
  }
  function a(d, u, p, g, f, m) {
    let v = o(d, u, p, g, f, m);
    p.transmission > 0 ? r.push(v) : p.transparent === !0 ? n.push(v) : t.push(v);
  }
  function l(d, u, p, g, f, m) {
    let v = o(d, u, p, g, f, m);
    p.transmission > 0 ? r.unshift(v) : p.transparent === !0 ? n.unshift(v) : t.unshift(v);
  }
  function c(d, u) {
    t.length > 1 && t.sort(d || Fv), r.length > 1 && r.sort(u || Wh), n.length > 1 && n.sort(u || Wh);
  }
  function h() {
    for (let d = e, u = i.length; d < u; d++) {
      let p = i[d];
      if (p.id === null) break;
      p.id = null, p.object = null, p.geometry = null, p.material = null, p.group = null;
    }
  }
  return {
    opaque: t,
    transmissive: r,
    transparent: n,
    init: s,
    push: a,
    unshift: l,
    finish: h,
    sort: c
  };
}
function Bv() {
  let i = new WeakMap();
  function e(r, n) {
    let s = i.get(r),
      o;
    return s === void 0 ? (o = new Hh(), i.set(r, [o])) : n >= s.length ? (o = new Hh(), s.push(o)) : o = s[n], o;
  }
  function t() {
    i = new WeakMap();
  }
  return {
    get: e,
    dispose: t
  };
}
function Gv() {
  let i = {};
  return {
    get: function (e) {
      if (i[e.id] !== void 0) return i[e.id];
      let t;
      switch (e.type) {
        case "DirectionalLight":
          t = {
            direction: new C(),
            color: new He()
          };
          break;
        case "SpotLight":
          t = {
            position: new C(),
            direction: new C(),
            color: new He(),
            distance: 0,
            coneCos: 0,
            penumbraCos: 0,
            decay: 0
          };
          break;
        case "PointLight":
          t = {
            position: new C(),
            color: new He(),
            distance: 0,
            decay: 0
          };
          break;
        case "HemisphereLight":
          t = {
            direction: new C(),
            skyColor: new He(),
            groundColor: new He()
          };
          break;
        case "RectAreaLight":
          t = {
            color: new He(),
            position: new C(),
            halfWidth: new C(),
            halfHeight: new C()
          };
          break;
      }
      return i[e.id] = t, t;
    }
  };
}
function Vv() {
  let i = {};
  return {
    get: function (e) {
      if (i[e.id] !== void 0) return i[e.id];
      let t;
      switch (e.type) {
        case "DirectionalLight":
          t = {
            shadowBias: 0,
            shadowNormalBias: 0,
            shadowRadius: 1,
            shadowMapSize: new se()
          };
          break;
        case "SpotLight":
          t = {
            shadowBias: 0,
            shadowNormalBias: 0,
            shadowRadius: 1,
            shadowMapSize: new se()
          };
          break;
        case "PointLight":
          t = {
            shadowBias: 0,
            shadowNormalBias: 0,
            shadowRadius: 1,
            shadowMapSize: new se(),
            shadowCameraNear: 1,
            shadowCameraFar: 1e3
          };
          break;
      }
      return i[e.id] = t, t;
    }
  };
}
var Wv = 0;
function Hv(i, e) {
  return (e.castShadow ? 2 : 0) - (i.castShadow ? 2 : 0) + (e.map ? 1 : 0) - (i.map ? 1 : 0);
}
function jv(i, e) {
  let t = new Gv(),
    r = Vv(),
    n = {
      version: 0,
      hash: {
        directionalLength: -1,
        pointLength: -1,
        spotLength: -1,
        rectAreaLength: -1,
        hemiLength: -1,
        numDirectionalShadows: -1,
        numPointShadows: -1,
        numSpotShadows: -1,
        numSpotMaps: -1
      },
      ambient: [0, 0, 0],
      probe: [],
      directional: [],
      directionalShadow: [],
      directionalShadowMap: [],
      directionalShadowMatrix: [],
      spot: [],
      spotLightMap: [],
      spotShadow: [],
      spotShadowMap: [],
      spotLightMatrix: [],
      rectArea: [],
      rectAreaLTC1: null,
      rectAreaLTC2: null,
      point: [],
      pointShadow: [],
      pointShadowMap: [],
      pointShadowMatrix: [],
      hemi: [],
      numSpotLightShadowsWithMaps: 0
    };
  for (let h = 0; h < 9; h++) n.probe.push(new C());
  let s = new C(),
    o = new at(),
    a = new at();
  function l(h, d) {
    let u = 0,
      p = 0,
      g = 0;
    for (let H = 0; H < 9; H++) n.probe[H].set(0, 0, 0);
    let f = 0,
      m = 0,
      v = 0,
      y = 0,
      x = 0,
      b = 0,
      w = 0,
      A = 0,
      L = 0,
      M = 0;
    h.sort(Hv);
    let T = d === !0 ? Math.PI : 1;
    for (let H = 0, Z = h.length; H < Z; H++) {
      let O = h[H],
        z = O.color,
        j = O.intensity,
        ie = O.distance,
        oe = O.shadow && O.shadow.map ? O.shadow.map.texture : null;
      if (O.isAmbientLight) u += z.r * j * T, p += z.g * j * T, g += z.b * j * T;else if (O.isLightProbe) for (let $ = 0; $ < 9; $++) n.probe[$].addScaledVector(O.sh.coefficients[$], j);else if (O.isDirectionalLight) {
        let $ = t.get(O);
        if ($.color.copy(O.color).multiplyScalar(O.intensity * T), O.castShadow) {
          let ae = O.shadow,
            te = r.get(O);
          te.shadowBias = ae.bias, te.shadowNormalBias = ae.normalBias, te.shadowRadius = ae.radius, te.shadowMapSize = ae.mapSize, n.directionalShadow[f] = te, n.directionalShadowMap[f] = oe, n.directionalShadowMatrix[f] = O.shadow.matrix, b++;
        }
        n.directional[f] = $, f++;
      } else if (O.isSpotLight) {
        let $ = t.get(O);
        $.position.setFromMatrixPosition(O.matrixWorld), $.color.copy(z).multiplyScalar(j * T), $.distance = ie, $.coneCos = Math.cos(O.angle), $.penumbraCos = Math.cos(O.angle * (1 - O.penumbra)), $.decay = O.decay, n.spot[v] = $;
        let ae = O.shadow;
        if (O.map && (n.spotLightMap[L] = O.map, L++, ae.updateMatrices(O), O.castShadow && M++), n.spotLightMatrix[v] = ae.matrix, O.castShadow) {
          let te = r.get(O);
          te.shadowBias = ae.bias, te.shadowNormalBias = ae.normalBias, te.shadowRadius = ae.radius, te.shadowMapSize = ae.mapSize, n.spotShadow[v] = te, n.spotShadowMap[v] = oe, A++;
        }
        v++;
      } else if (O.isRectAreaLight) {
        let $ = t.get(O);
        $.color.copy(z).multiplyScalar(j), $.halfWidth.set(O.width * 0.5, 0, 0), $.halfHeight.set(0, O.height * 0.5, 0), n.rectArea[y] = $, y++;
      } else if (O.isPointLight) {
        let $ = t.get(O);
        if ($.color.copy(O.color).multiplyScalar(O.intensity * T), $.distance = O.distance, $.decay = O.decay, O.castShadow) {
          let ae = O.shadow,
            te = r.get(O);
          te.shadowBias = ae.bias, te.shadowNormalBias = ae.normalBias, te.shadowRadius = ae.radius, te.shadowMapSize = ae.mapSize, te.shadowCameraNear = ae.camera.near, te.shadowCameraFar = ae.camera.far, n.pointShadow[m] = te, n.pointShadowMap[m] = oe, n.pointShadowMatrix[m] = O.shadow.matrix, w++;
        }
        n.point[m] = $, m++;
      } else if (O.isHemisphereLight) {
        let $ = t.get(O);
        $.skyColor.copy(O.color).multiplyScalar(j * T), $.groundColor.copy(O.groundColor).multiplyScalar(j * T), n.hemi[x] = $, x++;
      }
    }
    y > 0 && (e.isWebGL2 || i.has("OES_texture_float_linear") === !0 ? (n.rectAreaLTC1 = pe.LTC_FLOAT_1, n.rectAreaLTC2 = pe.LTC_FLOAT_2) : i.has("OES_texture_half_float_linear") === !0 ? (n.rectAreaLTC1 = pe.LTC_HALF_1, n.rectAreaLTC2 = pe.LTC_HALF_2) : console.error("THREE.WebGLRenderer: Unable to use RectAreaLight. Missing WebGL extensions.")), n.ambient[0] = u, n.ambient[1] = p, n.ambient[2] = g;
    let R = n.hash;
    (R.directionalLength !== f || R.pointLength !== m || R.spotLength !== v || R.rectAreaLength !== y || R.hemiLength !== x || R.numDirectionalShadows !== b || R.numPointShadows !== w || R.numSpotShadows !== A || R.numSpotMaps !== L) && (n.directional.length = f, n.spot.length = v, n.rectArea.length = y, n.point.length = m, n.hemi.length = x, n.directionalShadow.length = b, n.directionalShadowMap.length = b, n.pointShadow.length = w, n.pointShadowMap.length = w, n.spotShadow.length = A, n.spotShadowMap.length = A, n.directionalShadowMatrix.length = b, n.pointShadowMatrix.length = w, n.spotLightMatrix.length = A + L - M, n.spotLightMap.length = L, n.numSpotLightShadowsWithMaps = M, R.directionalLength = f, R.pointLength = m, R.spotLength = v, R.rectAreaLength = y, R.hemiLength = x, R.numDirectionalShadows = b, R.numPointShadows = w, R.numSpotShadows = A, R.numSpotMaps = L, n.version = Wv++);
  }
  function c(h, d) {
    let u = 0,
      p = 0,
      g = 0,
      f = 0,
      m = 0,
      v = d.matrixWorldInverse;
    for (let y = 0, x = h.length; y < x; y++) {
      let b = h[y];
      if (b.isDirectionalLight) {
        let w = n.directional[u];
        w.direction.setFromMatrixPosition(b.matrixWorld), s.setFromMatrixPosition(b.target.matrixWorld), w.direction.sub(s), w.direction.transformDirection(v), u++;
      } else if (b.isSpotLight) {
        let w = n.spot[g];
        w.position.setFromMatrixPosition(b.matrixWorld), w.position.applyMatrix4(v), w.direction.setFromMatrixPosition(b.matrixWorld), s.setFromMatrixPosition(b.target.matrixWorld), w.direction.sub(s), w.direction.transformDirection(v), g++;
      } else if (b.isRectAreaLight) {
        let w = n.rectArea[f];
        w.position.setFromMatrixPosition(b.matrixWorld), w.position.applyMatrix4(v), a.identity(), o.copy(b.matrixWorld), o.premultiply(v), a.extractRotation(o), w.halfWidth.set(b.width * 0.5, 0, 0), w.halfHeight.set(0, b.height * 0.5, 0), w.halfWidth.applyMatrix4(a), w.halfHeight.applyMatrix4(a), f++;
      } else if (b.isPointLight) {
        let w = n.point[p];
        w.position.setFromMatrixPosition(b.matrixWorld), w.position.applyMatrix4(v), p++;
      } else if (b.isHemisphereLight) {
        let w = n.hemi[m];
        w.direction.setFromMatrixPosition(b.matrixWorld), w.direction.transformDirection(v), m++;
      }
    }
  }
  return {
    setup: l,
    setupView: c,
    state: n
  };
}
function jh(i, e) {
  let t = new jv(i, e),
    r = [],
    n = [];
  function s() {
    r.length = 0, n.length = 0;
  }
  function o(h) {
    r.push(h);
  }
  function a(h) {
    n.push(h);
  }
  function l(h) {
    t.setup(r, h);
  }
  function c(h) {
    t.setupView(r, h);
  }
  return {
    init: s,
    state: {
      lightsArray: r,
      shadowsArray: n,
      lights: t
    },
    setupLights: l,
    setupLightsView: c,
    pushLight: o,
    pushShadow: a
  };
}
function qv(i, e) {
  let t = new WeakMap();
  function r(s, o = 0) {
    let a = t.get(s),
      l;
    return a === void 0 ? (l = new jh(i, e), t.set(s, [l])) : o >= a.length ? (l = new jh(i, e), a.push(l)) : l = a[o], l;
  }
  function n() {
    t = new WeakMap();
  }
  return {
    get: r,
    dispose: n
  };
}
var Ec = class extends ai {
    constructor(e) {
      super(), this.isMeshDepthMaterial = !0, this.type = "MeshDepthMaterial", this.depthPacking = af, this.map = null, this.alphaMap = null, this.displacementMap = null, this.displacementScale = 1, this.displacementBias = 0, this.wireframe = !1, this.wireframeLinewidth = 1, this.setValues(e);
    }
    copy(e) {
      return super.copy(e), this.depthPacking = e.depthPacking, this.map = e.map, this.alphaMap = e.alphaMap, this.displacementMap = e.displacementMap, this.displacementScale = e.displacementScale, this.displacementBias = e.displacementBias, this.wireframe = e.wireframe, this.wireframeLinewidth = e.wireframeLinewidth, this;
    }
  },
  Ac = class extends ai {
    constructor(e) {
      super(), this.isMeshDistanceMaterial = !0, this.type = "MeshDistanceMaterial", this.referencePosition = new C(), this.nearDistance = 1, this.farDistance = 1e3, this.map = null, this.alphaMap = null, this.displacementMap = null, this.displacementScale = 1, this.displacementBias = 0, this.setValues(e);
    }
    copy(e) {
      return super.copy(e), this.referencePosition.copy(e.referencePosition), this.nearDistance = e.nearDistance, this.farDistance = e.farDistance, this.map = e.map, this.alphaMap = e.alphaMap, this.displacementMap = e.displacementMap, this.displacementScale = e.displacementScale, this.displacementBias = e.displacementBias, this;
    }
  },
  Xv = `void main() {
	gl_Position = vec4( position, 1.0 );
}`,
  Yv = `uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
#include <packing>
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = unpackRGBATo2Half( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ) );
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = unpackRGBAToDepth( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ) );
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( squared_mean - mean * mean );
	gl_FragColor = pack2HalfToRGBA( vec2( mean, std_dev ) );
}`;
function Zv(i, e, t) {
  let r = new Ms(),
    n = new se(),
    s = new se(),
    o = new dt(),
    a = new Ec({
      depthPacking: of
    }),
    l = new Ac(),
    c = {},
    h = t.maxTextureSize,
    d = {
      [wi]: or,
      [or]: wi,
      [Gr]: Gr
    },
    u = new oi({
      defines: {
        VSM_SAMPLES: 8
      },
      uniforms: {
        shadow_pass: {
          value: null
        },
        resolution: {
          value: new se()
        },
        radius: {
          value: 4
        }
      },
      vertexShader: Xv,
      fragmentShader: Yv
    }),
    p = u.clone();
  p.defines.HORIZONTAL_PASS = 1;
  let g = new Tt();
  g.setAttribute("position", new Qt(new Float32Array([-1, -1, 0.5, 3, -1, 0.5, -1, 3, 0.5]), 3));
  let f = new pt(g, u),
    m = this;
  this.enabled = !1, this.autoUpdate = !0, this.needsUpdate = !1, this.type = Au, this.render = function (b, w, A) {
    if (m.enabled === !1 || m.autoUpdate === !1 && m.needsUpdate === !1 || b.length === 0) return;
    let L = i.getRenderTarget(),
      M = i.getActiveCubeFace(),
      T = i.getActiveMipmapLevel(),
      R = i.state;
    R.setBlending(bi), R.buffers.color.setClear(1, 1, 1, 1), R.buffers.depth.setTest(!0), R.setScissorTest(!1);
    for (let H = 0, Z = b.length; H < Z; H++) {
      let O = b[H],
        z = O.shadow;
      if (z === void 0) {
        console.warn("THREE.WebGLShadowMap:", O, "has no shadow.");
        continue;
      }
      if (z.autoUpdate === !1 && z.needsUpdate === !1) continue;
      n.copy(z.mapSize);
      let j = z.getFrameExtents();
      if (n.multiply(j), s.copy(z.mapSize), (n.x > h || n.y > h) && (n.x > h && (s.x = Math.floor(h / j.x), n.x = s.x * j.x, z.mapSize.x = s.x), n.y > h && (s.y = Math.floor(h / j.y), n.y = s.y * j.y, z.mapSize.y = s.y)), z.map === null) {
        let oe = this.type !== cs ? {
          minFilter: Zt,
          magFilter: Zt
        } : {};
        z.map = new si(n.x, n.y, oe), z.map.texture.name = O.name + ".shadowMap", z.camera.updateProjectionMatrix();
      }
      i.setRenderTarget(z.map), i.clear();
      let ie = z.getViewportCount();
      for (let oe = 0; oe < ie; oe++) {
        let $ = z.getViewport(oe);
        o.set(s.x * $.x, s.y * $.y, s.x * $.z, s.y * $.w), R.viewport(o), z.updateMatrices(O, oe), r = z.getFrustum(), x(w, A, z.camera, O, this.type);
      }
      z.isPointLightShadow !== !0 && this.type === cs && v(z, A), z.needsUpdate = !1;
    }
    m.needsUpdate = !1, i.setRenderTarget(L, M, T);
  };
  function v(b, w) {
    let A = e.update(f);
    u.defines.VSM_SAMPLES !== b.blurSamples && (u.defines.VSM_SAMPLES = b.blurSamples, p.defines.VSM_SAMPLES = b.blurSamples, u.needsUpdate = !0, p.needsUpdate = !0), b.mapPass === null && (b.mapPass = new si(n.x, n.y)), u.uniforms.shadow_pass.value = b.map.texture, u.uniforms.resolution.value = b.mapSize, u.uniforms.radius.value = b.radius, i.setRenderTarget(b.mapPass), i.clear(), i.renderBufferDirect(w, null, A, u, f, null), p.uniforms.shadow_pass.value = b.mapPass.texture, p.uniforms.resolution.value = b.mapSize, p.uniforms.radius.value = b.radius, i.setRenderTarget(b.map), i.clear(), i.renderBufferDirect(w, null, A, p, f, null);
  }
  function y(b, w, A, L, M, T) {
    let R = null,
      H = A.isPointLight === !0 ? b.customDistanceMaterial : b.customDepthMaterial;
    if (H !== void 0) R = H;else if (R = A.isPointLight === !0 ? l : a, i.localClippingEnabled && w.clipShadows === !0 && Array.isArray(w.clippingPlanes) && w.clippingPlanes.length !== 0 || w.displacementMap && w.displacementScale !== 0 || w.alphaMap && w.alphaTest > 0 || w.map && w.alphaTest > 0) {
      let Z = R.uuid,
        O = w.uuid,
        z = c[Z];
      z === void 0 && (z = {}, c[Z] = z);
      let j = z[O];
      j === void 0 && (j = R.clone(), z[O] = j), R = j;
    }
    return R.visible = w.visible, R.wireframe = w.wireframe, T === cs ? R.side = w.shadowSide !== null ? w.shadowSide : w.side : R.side = w.shadowSide !== null ? w.shadowSide : d[w.side], R.alphaMap = w.alphaMap, R.alphaTest = w.alphaTest, R.map = w.map, R.clipShadows = w.clipShadows, R.clippingPlanes = w.clippingPlanes, R.clipIntersection = w.clipIntersection, R.displacementMap = w.displacementMap, R.displacementScale = w.displacementScale, R.displacementBias = w.displacementBias, R.wireframeLinewidth = w.wireframeLinewidth, R.linewidth = w.linewidth, A.isPointLight === !0 && R.isMeshDistanceMaterial === !0 && (R.referencePosition.setFromMatrixPosition(A.matrixWorld), R.nearDistance = L, R.farDistance = M), R;
  }
  function x(b, w, A, L, M) {
    if (b.visible === !1) return;
    if (b.layers.test(w.layers) && (b.isMesh || b.isLine || b.isPoints) && (b.castShadow || b.receiveShadow && M === cs) && (!b.frustumCulled || r.intersectsObject(b))) {
      b.modelViewMatrix.multiplyMatrices(A.matrixWorldInverse, b.matrixWorld);
      let R = e.update(b),
        H = b.material;
      if (Array.isArray(H)) {
        let Z = R.groups;
        for (let O = 0, z = Z.length; O < z; O++) {
          let j = Z[O],
            ie = H[j.materialIndex];
          if (ie && ie.visible) {
            let oe = y(b, ie, L, A.near, A.far, M);
            i.renderBufferDirect(A, null, R, oe, b, j);
          }
        }
      } else if (H.visible) {
        let Z = y(b, H, L, A.near, A.far, M);
        i.renderBufferDirect(A, null, R, Z, b, null);
      }
    }
    let T = b.children;
    for (let R = 0, H = T.length; R < H; R++) x(T[R], w, A, L, M);
  }
}
function Jv(i, e, t) {
  let r = t.isWebGL2;
  function n() {
    let D = !1,
      Y = new dt(),
      ne = null,
      ve = new dt(0, 0, 0, 0);
    return {
      setMask: function (Te) {
        ne !== Te && !D && (i.colorMask(Te, Te, Te, Te), ne = Te);
      },
      setLocked: function (Te) {
        D = Te;
      },
      setClear: function (Te, ct, Rt, Ht, zr) {
        zr === !0 && (Te *= Ht, ct *= Ht, Rt *= Ht), Y.set(Te, ct, Rt, Ht), ve.equals(Y) === !1 && (i.clearColor(Te, ct, Rt, Ht), ve.copy(Y));
      },
      reset: function () {
        D = !1, ne = null, ve.set(-1, 0, 0, 0);
      }
    };
  }
  function s() {
    let D = !1,
      Y = null,
      ne = null,
      ve = null;
    return {
      setTest: function (Te) {
        Te ? P(2929) : N(2929);
      },
      setMask: function (Te) {
        Y !== Te && !D && (i.depthMask(Te), Y = Te);
      },
      setFunc: function (Te) {
        if (ne !== Te) {
          switch (Te) {
            case Pp:
              i.depthFunc(512);
              break;
            case Lp:
              i.depthFunc(519);
              break;
            case Dp:
              i.depthFunc(513);
              break;
            case uc:
              i.depthFunc(515);
              break;
            case zp:
              i.depthFunc(514);
              break;
            case Ip:
              i.depthFunc(518);
              break;
            case Op:
              i.depthFunc(516);
              break;
            case Np:
              i.depthFunc(517);
              break;
            default:
              i.depthFunc(515);
          }
          ne = Te;
        }
      },
      setLocked: function (Te) {
        D = Te;
      },
      setClear: function (Te) {
        ve !== Te && (i.clearDepth(Te), ve = Te);
      },
      reset: function () {
        D = !1, Y = null, ne = null, ve = null;
      }
    };
  }
  function o() {
    let D = !1,
      Y = null,
      ne = null,
      ve = null,
      Te = null,
      ct = null,
      Rt = null,
      Ht = null,
      zr = null;
    return {
      setTest: function (yt) {
        D || (yt ? P(2960) : N(2960));
      },
      setMask: function (yt) {
        Y !== yt && !D && (i.stencilMask(yt), Y = yt);
      },
      setFunc: function (yt, ur, Ir) {
        (ne !== yt || ve !== ur || Te !== Ir) && (i.stencilFunc(yt, ur, Ir), ne = yt, ve = ur, Te = Ir);
      },
      setOp: function (yt, ur, Ir) {
        (ct !== yt || Rt !== ur || Ht !== Ir) && (i.stencilOp(yt, ur, Ir), ct = yt, Rt = ur, Ht = Ir);
      },
      setLocked: function (yt) {
        D = yt;
      },
      setClear: function (yt) {
        zr !== yt && (i.clearStencil(yt), zr = yt);
      },
      reset: function () {
        D = !1, Y = null, ne = null, ve = null, Te = null, ct = null, Rt = null, Ht = null, zr = null;
      }
    };
  }
  let a = new n(),
    l = new s(),
    c = new o(),
    h = new WeakMap(),
    d = new WeakMap(),
    u = {},
    p = {},
    g = new WeakMap(),
    f = [],
    m = null,
    v = !1,
    y = null,
    x = null,
    b = null,
    w = null,
    A = null,
    L = null,
    M = null,
    T = !1,
    R = null,
    H = null,
    Z = null,
    O = null,
    z = null,
    j = i.getParameter(35661),
    ie = !1,
    oe = 0,
    $ = i.getParameter(7938);
  $.indexOf("WebGL") !== -1 ? (oe = parseFloat(/^WebGL (\d)/.exec($)[1]), ie = oe >= 1) : $.indexOf("OpenGL ES") !== -1 && (oe = parseFloat(/^OpenGL ES (\d)/.exec($)[1]), ie = oe >= 2);
  let ae = null,
    te = {},
    be = i.getParameter(3088),
    V = i.getParameter(2978),
    re = new dt().fromArray(be),
    de = new dt().fromArray(V);
  function W(D, Y, ne) {
    let ve = new Uint8Array(4),
      Te = i.createTexture();
    i.bindTexture(D, Te), i.texParameteri(D, 10241, 9728), i.texParameteri(D, 10240, 9728);
    for (let ct = 0; ct < ne; ct++) i.texImage2D(Y + ct, 0, 6408, 1, 1, 0, 6408, 5121, ve);
    return Te;
  }
  let me = {};
  me[3553] = W(3553, 3553, 1), me[34067] = W(34067, 34069, 6), a.setClear(0, 0, 0, 1), l.setClear(1), c.setClear(0), P(2929), l.setFunc(uc), Le(!1), Oe(Nl), P(2884), fe(bi);
  function P(D) {
    u[D] !== !0 && (i.enable(D), u[D] = !0);
  }
  function N(D) {
    u[D] !== !1 && (i.disable(D), u[D] = !1);
  }
  function Q(D, Y) {
    return p[D] !== Y ? (i.bindFramebuffer(D, Y), p[D] = Y, r && (D === 36009 && (p[36160] = Y), D === 36160 && (p[36009] = Y)), !0) : !1;
  }
  function K(D, Y) {
    let ne = f,
      ve = !1;
    if (D) {
      if (ne = g.get(Y), ne === void 0 && (ne = [], g.set(Y, ne)), D.isWebGLMultipleRenderTargets) {
        let Te = D.texture;
        if (ne.length !== Te.length || ne[0] !== 36064) {
          for (let ct = 0, Rt = Te.length; ct < Rt; ct++) ne[ct] = 36064 + ct;
          ne.length = Te.length, ve = !0;
        }
      } else ne[0] !== 36064 && (ne[0] = 36064, ve = !0);
    } else ne[0] !== 1029 && (ne[0] = 1029, ve = !0);
    ve && (t.isWebGL2 ? i.drawBuffers(ne) : e.get("WEBGL_draw_buffers").drawBuffersWEBGL(ne));
  }
  function k(D) {
    return m !== D ? (i.useProgram(D), m = D, !0) : !1;
  }
  let F = {
    [bn]: 32774,
    [yp]: 32778,
    [bp]: 32779
  };
  if (r) F[Fl] = 32775, F[Bl] = 32776;else {
    let D = e.get("EXT_blend_minmax");
    D !== null && (F[Fl] = D.MIN_EXT, F[Bl] = D.MAX_EXT);
  }
  let B = {
    [Mp]: 0,
    [Sp]: 1,
    [wp]: 768,
    [Ru]: 770,
    [Rp]: 776,
    [Ap]: 774,
    [Tp]: 772,
    [_p]: 769,
    [Pu]: 771,
    [Cp]: 775,
    [Ep]: 773
  };
  function fe(D, Y, ne, ve, Te, ct, Rt, Ht) {
    if (D === bi) {
      v === !0 && (N(3042), v = !1);
      return;
    }
    if (v === !1 && (P(3042), v = !0), D !== xp) {
      if (D !== y || Ht !== T) {
        if ((x !== bn || A !== bn) && (i.blendEquation(32774), x = bn, A = bn), Ht) switch (D) {
          case Wi:
            i.blendFuncSeparate(1, 771, 1, 771);
            break;
          case wa:
            i.blendFunc(1, 1);
            break;
          case kl:
            i.blendFuncSeparate(0, 769, 0, 1);
            break;
          case Ul:
            i.blendFuncSeparate(0, 768, 0, 770);
            break;
          default:
            console.error("THREE.WebGLState: Invalid blending: ", D);
            break;
        } else switch (D) {
          case Wi:
            i.blendFuncSeparate(770, 771, 1, 771);
            break;
          case wa:
            i.blendFunc(770, 1);
            break;
          case kl:
            i.blendFuncSeparate(0, 769, 0, 1);
            break;
          case Ul:
            i.blendFunc(0, 768);
            break;
          default:
            console.error("THREE.WebGLState: Invalid blending: ", D);
            break;
        }
        b = null, w = null, L = null, M = null, y = D, T = Ht;
      }
      return;
    }
    Te = Te || Y, ct = ct || ne, Rt = Rt || ve, (Y !== x || Te !== A) && (i.blendEquationSeparate(F[Y], F[Te]), x = Y, A = Te), (ne !== b || ve !== w || ct !== L || Rt !== M) && (i.blendFuncSeparate(B[ne], B[ve], B[ct], B[Rt]), b = ne, w = ve, L = ct, M = Rt), y = D, T = !1;
  }
  function ue(D, Y) {
    D.side === Gr ? N(2884) : P(2884);
    let ne = D.side === or;
    Y && (ne = !ne), Le(ne), D.blending === Wi && D.transparent === !1 ? fe(bi) : fe(D.blending, D.blendEquation, D.blendSrc, D.blendDst, D.blendEquationAlpha, D.blendSrcAlpha, D.blendDstAlpha, D.premultipliedAlpha), l.setFunc(D.depthFunc), l.setTest(D.depthTest), l.setMask(D.depthWrite), a.setMask(D.colorWrite);
    let ve = D.stencilWrite;
    c.setTest(ve), ve && (c.setMask(D.stencilWriteMask), c.setFunc(D.stencilFunc, D.stencilRef, D.stencilFuncMask), c.setOp(D.stencilFail, D.stencilZFail, D.stencilZPass)), Fe(D.polygonOffset, D.polygonOffsetFactor, D.polygonOffsetUnits), D.alphaToCoverage === !0 ? P(32926) : N(32926);
  }
  function Le(D) {
    R !== D && (D ? i.frontFace(2304) : i.frontFace(2305), R = D);
  }
  function Oe(D) {
    D !== gp ? (P(2884), D !== H && (D === Nl ? i.cullFace(1029) : D === vp ? i.cullFace(1028) : i.cullFace(1032))) : N(2884), H = D;
  }
  function Ne(D) {
    D !== Z && (ie && i.lineWidth(D), Z = D);
  }
  function Fe(D, Y, ne) {
    D ? (P(32823), (O !== Y || z !== ne) && (i.polygonOffset(Y, ne), O = Y, z = ne)) : N(32823);
  }
  function it(D) {
    D ? P(3089) : N(3089);
  }
  function Dt(D) {
    D === void 0 && (D = 33984 + j - 1), ae !== D && (i.activeTexture(D), ae = D);
  }
  function E(D, Y, ne) {
    ne === void 0 && (ae === null ? ne = 33984 + j - 1 : ne = ae);
    let ve = te[ne];
    ve === void 0 && (ve = {
      type: void 0,
      texture: void 0
    }, te[ne] = ve), (ve.type !== D || ve.texture !== Y) && (ae !== ne && (i.activeTexture(ne), ae = ne), i.bindTexture(D, Y || me[D]), ve.type = D, ve.texture = Y);
  }
  function S() {
    let D = te[ae];
    D !== void 0 && D.type !== void 0 && (i.bindTexture(D.type, null), D.type = void 0, D.texture = void 0);
  }
  function q() {
    try {
      i.compressedTexImage2D.apply(i, arguments);
    } catch (D) {
      console.error("THREE.WebGLState:", D);
    }
  }
  function le() {
    try {
      i.compressedTexImage3D.apply(i, arguments);
    } catch (D) {
      console.error("THREE.WebGLState:", D);
    }
  }
  function he() {
    try {
      i.texSubImage2D.apply(i, arguments);
    } catch (D) {
      console.error("THREE.WebGLState:", D);
    }
  }
  function ge() {
    try {
      i.texSubImage3D.apply(i, arguments);
    } catch (D) {
      console.error("THREE.WebGLState:", D);
    }
  }
  function _e() {
    try {
      i.compressedTexSubImage2D.apply(i, arguments);
    } catch (D) {
      console.error("THREE.WebGLState:", D);
    }
  }
  function ye() {
    try {
      i.compressedTexSubImage3D.apply(i, arguments);
    } catch (D) {
      console.error("THREE.WebGLState:", D);
    }
  }
  function ee() {
    try {
      i.texStorage2D.apply(i, arguments);
    } catch (D) {
      console.error("THREE.WebGLState:", D);
    }
  }
  function ze() {
    try {
      i.texStorage3D.apply(i, arguments);
    } catch (D) {
      console.error("THREE.WebGLState:", D);
    }
  }
  function Me() {
    try {
      i.texImage2D.apply(i, arguments);
    } catch (D) {
      console.error("THREE.WebGLState:", D);
    }
  }
  function Ie() {
    try {
      i.texImage3D.apply(i, arguments);
    } catch (D) {
      console.error("THREE.WebGLState:", D);
    }
  }
  function De(D) {
    re.equals(D) === !1 && (i.scissor(D.x, D.y, D.z, D.w), re.copy(D));
  }
  function Ae(D) {
    de.equals(D) === !1 && (i.viewport(D.x, D.y, D.z, D.w), de.copy(D));
  }
  function Qe(D, Y) {
    let ne = d.get(Y);
    ne === void 0 && (ne = new WeakMap(), d.set(Y, ne));
    let ve = ne.get(D);
    ve === void 0 && (ve = i.getUniformBlockIndex(Y, D.name), ne.set(D, ve));
  }
  function ft(D, Y) {
    let ne = d.get(Y).get(D);
    h.get(Y) !== ne && (i.uniformBlockBinding(Y, ne, D.__bindingPointIndex), h.set(Y, ne));
  }
  function Ct() {
    i.disable(3042), i.disable(2884), i.disable(2929), i.disable(32823), i.disable(3089), i.disable(2960), i.disable(32926), i.blendEquation(32774), i.blendFunc(1, 0), i.blendFuncSeparate(1, 0, 1, 0), i.colorMask(!0, !0, !0, !0), i.clearColor(0, 0, 0, 0), i.depthMask(!0), i.depthFunc(513), i.clearDepth(1), i.stencilMask(4294967295), i.stencilFunc(519, 0, 4294967295), i.stencilOp(7680, 7680, 7680), i.clearStencil(0), i.cullFace(1029), i.frontFace(2305), i.polygonOffset(0, 0), i.activeTexture(33984), i.bindFramebuffer(36160, null), r === !0 && (i.bindFramebuffer(36009, null), i.bindFramebuffer(36008, null)), i.useProgram(null), i.lineWidth(1), i.scissor(0, 0, i.canvas.width, i.canvas.height), i.viewport(0, 0, i.canvas.width, i.canvas.height), u = {}, ae = null, te = {}, p = {}, g = new WeakMap(), f = [], m = null, v = !1, y = null, x = null, b = null, w = null, A = null, L = null, M = null, T = !1, R = null, H = null, Z = null, O = null, z = null, re.set(0, 0, i.canvas.width, i.canvas.height), de.set(0, 0, i.canvas.width, i.canvas.height), a.reset(), l.reset(), c.reset();
  }
  return {
    buffers: {
      color: a,
      depth: l,
      stencil: c
    },
    enable: P,
    disable: N,
    bindFramebuffer: Q,
    drawBuffers: K,
    useProgram: k,
    setBlending: fe,
    setMaterial: ue,
    setFlipSided: Le,
    setCullFace: Oe,
    setLineWidth: Ne,
    setPolygonOffset: Fe,
    setScissorTest: it,
    activeTexture: Dt,
    bindTexture: E,
    unbindTexture: S,
    compressedTexImage2D: q,
    compressedTexImage3D: le,
    texImage2D: Me,
    texImage3D: Ie,
    updateUBOMapping: Qe,
    uniformBlockBinding: ft,
    texStorage2D: ee,
    texStorage3D: ze,
    texSubImage2D: he,
    texSubImage3D: ge,
    compressedTexSubImage2D: _e,
    compressedTexSubImage3D: ye,
    scissor: De,
    viewport: Ae,
    reset: Ct
  };
}
function Kv(i, e, t, r, n, s, o) {
  let a = n.isWebGL2,
    l = n.maxTextures,
    c = n.maxCubemapSize,
    h = n.maxTextureSize,
    d = n.maxSamples,
    u = e.has("WEBGL_multisampled_render_to_texture") ? e.get("WEBGL_multisampled_render_to_texture") : null,
    p = typeof navigator > "u" ? !1 : /OculusBrowser/g.test(navigator.userAgent),
    g = new WeakMap(),
    f,
    m = new WeakMap(),
    v = !1;
  try {
    v = typeof OffscreenCanvas < "u" && new OffscreenCanvas(1, 1).getContext("2d") !== null;
  } catch {}
  function y(E, S) {
    return v ? new OffscreenCanvas(E, S) : _a("canvas");
  }
  function x(E, S, q, le) {
    let he = 1;
    if ((E.width > le || E.height > le) && (he = le / Math.max(E.width, E.height)), he < 1 || S === !0) if (typeof HTMLImageElement < "u" && E instanceof HTMLImageElement || typeof HTMLCanvasElement < "u" && E instanceof HTMLCanvasElement || typeof ImageBitmap < "u" && E instanceof ImageBitmap) {
      let ge = S ? uf : Math.floor,
        _e = ge(he * E.width),
        ye = ge(he * E.height);
      f === void 0 && (f = y(_e, ye));
      let ee = q ? y(_e, ye) : f;
      return ee.width = _e, ee.height = ye, ee.getContext("2d").drawImage(E, 0, 0, _e, ye), console.warn("THREE.WebGLRenderer: Texture has been resized from (" + E.width + "x" + E.height + ") to (" + _e + "x" + ye + ")."), ee;
    } else return "data" in E && console.warn("THREE.WebGLRenderer: Image in DataTexture is too big (" + E.width + "x" + E.height + ")."), E;
    return E;
  }
  function b(E) {
    return ph(E.width) && ph(E.height);
  }
  function w(E) {
    return a ? !1 : E.wrapS !== _r || E.wrapT !== _r || E.minFilter !== Zt && E.minFilter !== It;
  }
  function A(E, S) {
    return E.generateMipmaps && S && E.minFilter !== Zt && E.minFilter !== It;
  }
  function L(E) {
    i.generateMipmap(E);
  }
  function M(E, S, q, le, he = !1) {
    if (a === !1) return S;
    if (E !== null) {
      if (i[E] !== void 0) return i[E];
      console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '" + E + "'");
    }
    let ge = S;
    return S === 6403 && (q === 5126 && (ge = 33326), q === 5131 && (ge = 33325), q === 5121 && (ge = 33321)), S === 33319 && (q === 5126 && (ge = 33328), q === 5131 && (ge = 33327), q === 5121 && (ge = 33323)), S === 6408 && (q === 5126 && (ge = 34836), q === 5131 && (ge = 34842), q === 5121 && (ge = le === Ke && he === !1 ? 35907 : 32856), q === 32819 && (ge = 32854), q === 32820 && (ge = 32855)), (ge === 33325 || ge === 33326 || ge === 33327 || ge === 33328 || ge === 34842 || ge === 34836) && e.get("EXT_color_buffer_float"), ge;
  }
  function T(E, S, q) {
    return A(E, q) === !0 || E.isFramebufferTexture && E.minFilter !== Zt && E.minFilter !== It ? Math.log2(Math.max(S.width, S.height)) + 1 : E.mipmaps !== void 0 && E.mipmaps.length > 0 ? E.mipmaps.length : E.isCompressedTexture && Array.isArray(E.image) ? S.mipmaps.length : 1;
  }
  function R(E) {
    return E === Zt || E === Gl || E === go ? 9728 : 9729;
  }
  function H(E) {
    let S = E.target;
    S.removeEventListener("dispose", H), O(S), S.isVideoTexture && g.delete(S);
  }
  function Z(E) {
    let S = E.target;
    S.removeEventListener("dispose", Z), j(S);
  }
  function O(E) {
    let S = r.get(E);
    if (S.__webglInit === void 0) return;
    let q = E.source,
      le = m.get(q);
    if (le) {
      let he = le[S.__cacheKey];
      he.usedTimes--, he.usedTimes === 0 && z(E), Object.keys(le).length === 0 && m.delete(q);
    }
    r.remove(E);
  }
  function z(E) {
    let S = r.get(E);
    i.deleteTexture(S.__webglTexture);
    let q = E.source,
      le = m.get(q);
    delete le[S.__cacheKey], o.memory.textures--;
  }
  function j(E) {
    let S = E.texture,
      q = r.get(E),
      le = r.get(S);
    if (le.__webglTexture !== void 0 && (i.deleteTexture(le.__webglTexture), o.memory.textures--), E.depthTexture && E.depthTexture.dispose(), E.isWebGLCubeRenderTarget) for (let he = 0; he < 6; he++) i.deleteFramebuffer(q.__webglFramebuffer[he]), q.__webglDepthbuffer && i.deleteRenderbuffer(q.__webglDepthbuffer[he]);else {
      if (i.deleteFramebuffer(q.__webglFramebuffer), q.__webglDepthbuffer && i.deleteRenderbuffer(q.__webglDepthbuffer), q.__webglMultisampledFramebuffer && i.deleteFramebuffer(q.__webglMultisampledFramebuffer), q.__webglColorRenderbuffer) for (let he = 0; he < q.__webglColorRenderbuffer.length; he++) q.__webglColorRenderbuffer[he] && i.deleteRenderbuffer(q.__webglColorRenderbuffer[he]);
      q.__webglDepthRenderbuffer && i.deleteRenderbuffer(q.__webglDepthRenderbuffer);
    }
    if (E.isWebGLMultipleRenderTargets) for (let he = 0, ge = S.length; he < ge; he++) {
      let _e = r.get(S[he]);
      _e.__webglTexture && (i.deleteTexture(_e.__webglTexture), o.memory.textures--), r.remove(S[he]);
    }
    r.remove(S), r.remove(E);
  }
  let ie = 0;
  function oe() {
    ie = 0;
  }
  function $() {
    let E = ie;
    return E >= l && console.warn("THREE.WebGLTextures: Trying to use " + E + " texture units while this GPU supports only " + l), ie += 1, E;
  }
  function ae(E) {
    let S = [];
    return S.push(E.wrapS), S.push(E.wrapT), S.push(E.wrapR || 0), S.push(E.magFilter), S.push(E.minFilter), S.push(E.anisotropy), S.push(E.internalFormat), S.push(E.format), S.push(E.type), S.push(E.generateMipmaps), S.push(E.premultiplyAlpha), S.push(E.flipY), S.push(E.unpackAlignment), S.push(E.encoding), S.join();
  }
  function te(E, S) {
    let q = r.get(E);
    if (E.isVideoTexture && it(E), E.isRenderTargetTexture === !1 && E.version > 0 && q.__version !== E.version) {
      let le = E.image;
      if (le === null) console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if (le.complete === !1) console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else {
        N(q, E, S);
        return;
      }
    }
    t.bindTexture(3553, q.__webglTexture, 33984 + S);
  }
  function be(E, S) {
    let q = r.get(E);
    if (E.version > 0 && q.__version !== E.version) {
      N(q, E, S);
      return;
    }
    t.bindTexture(35866, q.__webglTexture, 33984 + S);
  }
  function V(E, S) {
    let q = r.get(E);
    if (E.version > 0 && q.__version !== E.version) {
      N(q, E, S);
      return;
    }
    t.bindTexture(32879, q.__webglTexture, 33984 + S);
  }
  function re(E, S) {
    let q = r.get(E);
    if (E.version > 0 && q.__version !== E.version) {
      Q(q, E, S);
      return;
    }
    t.bindTexture(34067, q.__webglTexture, 33984 + S);
  }
  let de = {
      [Ln]: 10497,
      [_r]: 33071,
      [fc]: 33648
    },
    W = {
      [Zt]: 9728,
      [Gl]: 9984,
      [go]: 9986,
      [It]: 9729,
      [Wp]: 9985,
      [qr]: 9987
    };
  function me(E, S, q) {
    if (q ? (i.texParameteri(E, 10242, de[S.wrapS]), i.texParameteri(E, 10243, de[S.wrapT]), (E === 32879 || E === 35866) && i.texParameteri(E, 32882, de[S.wrapR]), i.texParameteri(E, 10240, W[S.magFilter]), i.texParameteri(E, 10241, W[S.minFilter])) : (i.texParameteri(E, 10242, 33071), i.texParameteri(E, 10243, 33071), (E === 32879 || E === 35866) && i.texParameteri(E, 32882, 33071), (S.wrapS !== _r || S.wrapT !== _r) && console.warn("THREE.WebGLRenderer: Texture is not power of two. Texture.wrapS and Texture.wrapT should be set to THREE.ClampToEdgeWrapping."), i.texParameteri(E, 10240, R(S.magFilter)), i.texParameteri(E, 10241, R(S.minFilter)), S.minFilter !== Zt && S.minFilter !== It && console.warn("THREE.WebGLRenderer: Texture is not power of two. Texture.minFilter should be set to THREE.NearestFilter or THREE.LinearFilter.")), e.has("EXT_texture_filter_anisotropic") === !0) {
      let le = e.get("EXT_texture_filter_anisotropic");
      if (S.magFilter === Zt || S.minFilter !== go && S.minFilter !== qr || S.type === Vi && e.has("OES_texture_float_linear") === !1 || a === !1 && S.type === ys && e.has("OES_texture_half_float_linear") === !1) return;
      (S.anisotropy > 1 || r.get(S).__currentAnisotropy) && (i.texParameterf(E, le.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(S.anisotropy, n.getMaxAnisotropy())), r.get(S).__currentAnisotropy = S.anisotropy);
    }
  }
  function P(E, S) {
    let q = !1;
    E.__webglInit === void 0 && (E.__webglInit = !0, S.addEventListener("dispose", H));
    let le = S.source,
      he = m.get(le);
    he === void 0 && (he = {}, m.set(le, he));
    let ge = ae(S);
    if (ge !== E.__cacheKey) {
      he[ge] === void 0 && (he[ge] = {
        texture: i.createTexture(),
        usedTimes: 0
      }, o.memory.textures++, q = !0), he[ge].usedTimes++;
      let _e = he[E.__cacheKey];
      _e !== void 0 && (he[E.__cacheKey].usedTimes--, _e.usedTimes === 0 && z(S)), E.__cacheKey = ge, E.__webglTexture = he[ge].texture;
    }
    return q;
  }
  function N(E, S, q) {
    let le = 3553;
    (S.isDataArrayTexture || S.isCompressedArrayTexture) && (le = 35866), S.isData3DTexture && (le = 32879);
    let he = P(E, S),
      ge = S.source;
    t.bindTexture(le, E.__webglTexture, 33984 + q);
    let _e = r.get(ge);
    if (ge.version !== _e.__version || he === !0) {
      t.activeTexture(33984 + q), i.pixelStorei(37440, S.flipY), i.pixelStorei(37441, S.premultiplyAlpha), i.pixelStorei(3317, S.unpackAlignment), i.pixelStorei(37443, 0);
      let ye = w(S) && b(S.image) === !1,
        ee = x(S.image, ye, !1, h);
      ee = Dt(S, ee);
      let ze = b(ee) || a,
        Me = s.convert(S.format, S.encoding),
        Ie = s.convert(S.type),
        De = M(S.internalFormat, Me, Ie, S.encoding, S.isVideoTexture);
      me(le, S, ze);
      let Ae,
        Qe = S.mipmaps,
        ft = a && S.isVideoTexture !== !0,
        Ct = _e.__version === void 0 || he === !0,
        D = T(S, ee, ze);
      if (S.isDepthTexture) De = 6402, a ? S.type === Vi ? De = 36012 : S.type === Gi ? De = 33190 : S.type === wn ? De = 35056 : De = 33189 : S.type === Vi && console.error("WebGLRenderer: Floating point depth texture requires WebGL2."), S.format === Hi && De === 6402 && S.type !== zu && S.type !== Gi && (console.warn("THREE.WebGLRenderer: Use UnsignedShortType or UnsignedIntType for DepthFormat DepthTexture."), S.type = Gi, Ie = s.convert(S.type)), S.format === Dn && De === 6402 && (De = 34041, S.type !== wn && (console.warn("THREE.WebGLRenderer: Use UnsignedInt248Type for DepthStencilFormat DepthTexture."), S.type = wn, Ie = s.convert(S.type))), Ct && (ft ? t.texStorage2D(3553, 1, De, ee.width, ee.height) : t.texImage2D(3553, 0, De, ee.width, ee.height, 0, Me, Ie, null));else if (S.isDataTexture) {
        if (Qe.length > 0 && ze) {
          ft && Ct && t.texStorage2D(3553, D, De, Qe[0].width, Qe[0].height);
          for (let Y = 0, ne = Qe.length; Y < ne; Y++) Ae = Qe[Y], ft ? t.texSubImage2D(3553, Y, 0, 0, Ae.width, Ae.height, Me, Ie, Ae.data) : t.texImage2D(3553, Y, De, Ae.width, Ae.height, 0, Me, Ie, Ae.data);
          S.generateMipmaps = !1;
        } else ft ? (Ct && t.texStorage2D(3553, D, De, ee.width, ee.height), t.texSubImage2D(3553, 0, 0, 0, ee.width, ee.height, Me, Ie, ee.data)) : t.texImage2D(3553, 0, De, ee.width, ee.height, 0, Me, Ie, ee.data);
      } else if (S.isCompressedTexture) {
        if (S.isCompressedArrayTexture) {
          ft && Ct && t.texStorage3D(35866, D, De, Qe[0].width, Qe[0].height, ee.depth);
          for (let Y = 0, ne = Qe.length; Y < ne; Y++) Ae = Qe[Y], S.format !== Tr ? Me !== null ? ft ? t.compressedTexSubImage3D(35866, Y, 0, 0, 0, Ae.width, Ae.height, ee.depth, Me, Ae.data, 0, 0) : t.compressedTexImage3D(35866, Y, De, Ae.width, Ae.height, ee.depth, 0, Ae.data, 0, 0) : console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()") : ft ? t.texSubImage3D(35866, Y, 0, 0, 0, Ae.width, Ae.height, ee.depth, Me, Ie, Ae.data) : t.texImage3D(35866, Y, De, Ae.width, Ae.height, ee.depth, 0, Me, Ie, Ae.data);
        } else {
          ft && Ct && t.texStorage2D(3553, D, De, Qe[0].width, Qe[0].height);
          for (let Y = 0, ne = Qe.length; Y < ne; Y++) Ae = Qe[Y], S.format !== Tr ? Me !== null ? ft ? t.compressedTexSubImage2D(3553, Y, 0, 0, Ae.width, Ae.height, Me, Ae.data) : t.compressedTexImage2D(3553, Y, De, Ae.width, Ae.height, 0, Ae.data) : console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()") : ft ? t.texSubImage2D(3553, Y, 0, 0, Ae.width, Ae.height, Me, Ie, Ae.data) : t.texImage2D(3553, Y, De, Ae.width, Ae.height, 0, Me, Ie, Ae.data);
        }
      } else if (S.isDataArrayTexture) ft ? (Ct && t.texStorage3D(35866, D, De, ee.width, ee.height, ee.depth), t.texSubImage3D(35866, 0, 0, 0, 0, ee.width, ee.height, ee.depth, Me, Ie, ee.data)) : t.texImage3D(35866, 0, De, ee.width, ee.height, ee.depth, 0, Me, Ie, ee.data);else if (S.isData3DTexture) ft ? (Ct && t.texStorage3D(32879, D, De, ee.width, ee.height, ee.depth), t.texSubImage3D(32879, 0, 0, 0, 0, ee.width, ee.height, ee.depth, Me, Ie, ee.data)) : t.texImage3D(32879, 0, De, ee.width, ee.height, ee.depth, 0, Me, Ie, ee.data);else if (S.isFramebufferTexture) {
        if (Ct) if (ft) t.texStorage2D(3553, D, De, ee.width, ee.height);else {
          let Y = ee.width,
            ne = ee.height;
          for (let ve = 0; ve < D; ve++) t.texImage2D(3553, ve, De, Y, ne, 0, Me, Ie, null), Y >>= 1, ne >>= 1;
        }
      } else if (Qe.length > 0 && ze) {
        ft && Ct && t.texStorage2D(3553, D, De, Qe[0].width, Qe[0].height);
        for (let Y = 0, ne = Qe.length; Y < ne; Y++) Ae = Qe[Y], ft ? t.texSubImage2D(3553, Y, 0, 0, Me, Ie, Ae) : t.texImage2D(3553, Y, De, Me, Ie, Ae);
        S.generateMipmaps = !1;
      } else ft ? (Ct && t.texStorage2D(3553, D, De, ee.width, ee.height), t.texSubImage2D(3553, 0, 0, 0, Me, Ie, ee)) : t.texImage2D(3553, 0, De, Me, Ie, ee);
      A(S, ze) && L(le), _e.__version = ge.version, S.onUpdate && S.onUpdate(S);
    }
    E.__version = S.version;
  }
  function Q(E, S, q) {
    if (S.image.length !== 6) return;
    let le = P(E, S),
      he = S.source;
    t.bindTexture(34067, E.__webglTexture, 33984 + q);
    let ge = r.get(he);
    if (he.version !== ge.__version || le === !0) {
      t.activeTexture(33984 + q), i.pixelStorei(37440, S.flipY), i.pixelStorei(37441, S.premultiplyAlpha), i.pixelStorei(3317, S.unpackAlignment), i.pixelStorei(37443, 0);
      let _e = S.isCompressedTexture || S.image[0].isCompressedTexture,
        ye = S.image[0] && S.image[0].isDataTexture,
        ee = [];
      for (let Y = 0; Y < 6; Y++) !_e && !ye ? ee[Y] = x(S.image[Y], !1, !0, c) : ee[Y] = ye ? S.image[Y].image : S.image[Y], ee[Y] = Dt(S, ee[Y]);
      let ze = ee[0],
        Me = b(ze) || a,
        Ie = s.convert(S.format, S.encoding),
        De = s.convert(S.type),
        Ae = M(S.internalFormat, Ie, De, S.encoding),
        Qe = a && S.isVideoTexture !== !0,
        ft = ge.__version === void 0 || le === !0,
        Ct = T(S, ze, Me);
      me(34067, S, Me);
      let D;
      if (_e) {
        Qe && ft && t.texStorage2D(34067, Ct, Ae, ze.width, ze.height);
        for (let Y = 0; Y < 6; Y++) {
          D = ee[Y].mipmaps;
          for (let ne = 0; ne < D.length; ne++) {
            let ve = D[ne];
            S.format !== Tr ? Ie !== null ? Qe ? t.compressedTexSubImage2D(34069 + Y, ne, 0, 0, ve.width, ve.height, Ie, ve.data) : t.compressedTexImage2D(34069 + Y, ne, Ae, ve.width, ve.height, 0, ve.data) : console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()") : Qe ? t.texSubImage2D(34069 + Y, ne, 0, 0, ve.width, ve.height, Ie, De, ve.data) : t.texImage2D(34069 + Y, ne, Ae, ve.width, ve.height, 0, Ie, De, ve.data);
          }
        }
      } else {
        D = S.mipmaps, Qe && ft && (D.length > 0 && Ct++, t.texStorage2D(34067, Ct, Ae, ee[0].width, ee[0].height));
        for (let Y = 0; Y < 6; Y++) if (ye) {
          Qe ? t.texSubImage2D(34069 + Y, 0, 0, 0, ee[Y].width, ee[Y].height, Ie, De, ee[Y].data) : t.texImage2D(34069 + Y, 0, Ae, ee[Y].width, ee[Y].height, 0, Ie, De, ee[Y].data);
          for (let ne = 0; ne < D.length; ne++) {
            let ve = D[ne].image[Y].image;
            Qe ? t.texSubImage2D(34069 + Y, ne + 1, 0, 0, ve.width, ve.height, Ie, De, ve.data) : t.texImage2D(34069 + Y, ne + 1, Ae, ve.width, ve.height, 0, Ie, De, ve.data);
          }
        } else {
          Qe ? t.texSubImage2D(34069 + Y, 0, 0, 0, Ie, De, ee[Y]) : t.texImage2D(34069 + Y, 0, Ae, Ie, De, ee[Y]);
          for (let ne = 0; ne < D.length; ne++) {
            let ve = D[ne];
            Qe ? t.texSubImage2D(34069 + Y, ne + 1, 0, 0, Ie, De, ve.image[Y]) : t.texImage2D(34069 + Y, ne + 1, Ae, Ie, De, ve.image[Y]);
          }
        }
      }
      A(S, Me) && L(34067), ge.__version = he.version, S.onUpdate && S.onUpdate(S);
    }
    E.__version = S.version;
  }
  function K(E, S, q, le, he) {
    let ge = s.convert(q.format, q.encoding),
      _e = s.convert(q.type),
      ye = M(q.internalFormat, ge, _e, q.encoding);
    r.get(S).__hasExternalTextures || (he === 32879 || he === 35866 ? t.texImage3D(he, 0, ye, S.width, S.height, S.depth, 0, ge, _e, null) : t.texImage2D(he, 0, ye, S.width, S.height, 0, ge, _e, null)), t.bindFramebuffer(36160, E), Fe(S) ? u.framebufferTexture2DMultisampleEXT(36160, le, he, r.get(q).__webglTexture, 0, Ne(S)) : (he === 3553 || he >= 34069 && he <= 34074) && i.framebufferTexture2D(36160, le, he, r.get(q).__webglTexture, 0), t.bindFramebuffer(36160, null);
  }
  function k(E, S, q) {
    if (i.bindRenderbuffer(36161, E), S.depthBuffer && !S.stencilBuffer) {
      let le = 33189;
      if (q || Fe(S)) {
        let he = S.depthTexture;
        he && he.isDepthTexture && (he.type === Vi ? le = 36012 : he.type === Gi && (le = 33190));
        let ge = Ne(S);
        Fe(S) ? u.renderbufferStorageMultisampleEXT(36161, ge, le, S.width, S.height) : i.renderbufferStorageMultisample(36161, ge, le, S.width, S.height);
      } else i.renderbufferStorage(36161, le, S.width, S.height);
      i.framebufferRenderbuffer(36160, 36096, 36161, E);
    } else if (S.depthBuffer && S.stencilBuffer) {
      let le = Ne(S);
      q && Fe(S) === !1 ? i.renderbufferStorageMultisample(36161, le, 35056, S.width, S.height) : Fe(S) ? u.renderbufferStorageMultisampleEXT(36161, le, 35056, S.width, S.height) : i.renderbufferStorage(36161, 34041, S.width, S.height), i.framebufferRenderbuffer(36160, 33306, 36161, E);
    } else {
      let le = S.isWebGLMultipleRenderTargets === !0 ? S.texture : [S.texture];
      for (let he = 0; he < le.length; he++) {
        let ge = le[he],
          _e = s.convert(ge.format, ge.encoding),
          ye = s.convert(ge.type),
          ee = M(ge.internalFormat, _e, ye, ge.encoding),
          ze = Ne(S);
        q && Fe(S) === !1 ? i.renderbufferStorageMultisample(36161, ze, ee, S.width, S.height) : Fe(S) ? u.renderbufferStorageMultisampleEXT(36161, ze, ee, S.width, S.height) : i.renderbufferStorage(36161, ee, S.width, S.height);
      }
    }
    i.bindRenderbuffer(36161, null);
  }
  function F(E, S) {
    if (S && S.isWebGLCubeRenderTarget) throw new Error("Depth Texture with cube render targets is not supported");
    if (t.bindFramebuffer(36160, E), !(S.depthTexture && S.depthTexture.isDepthTexture)) throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");
    (!r.get(S.depthTexture).__webglTexture || S.depthTexture.image.width !== S.width || S.depthTexture.image.height !== S.height) && (S.depthTexture.image.width = S.width, S.depthTexture.image.height = S.height, S.depthTexture.needsUpdate = !0), te(S.depthTexture, 0);
    let q = r.get(S.depthTexture).__webglTexture,
      le = Ne(S);
    if (S.depthTexture.format === Hi) Fe(S) ? u.framebufferTexture2DMultisampleEXT(36160, 36096, 3553, q, 0, le) : i.framebufferTexture2D(36160, 36096, 3553, q, 0);else if (S.depthTexture.format === Dn) Fe(S) ? u.framebufferTexture2DMultisampleEXT(36160, 33306, 3553, q, 0, le) : i.framebufferTexture2D(36160, 33306, 3553, q, 0);else throw new Error("Unknown depthTexture format");
  }
  function B(E) {
    let S = r.get(E),
      q = E.isWebGLCubeRenderTarget === !0;
    if (E.depthTexture && !S.__autoAllocateDepthBuffer) {
      if (q) throw new Error("target.depthTexture not supported in Cube render targets");
      F(S.__webglFramebuffer, E);
    } else if (q) {
      S.__webglDepthbuffer = [];
      for (let le = 0; le < 6; le++) t.bindFramebuffer(36160, S.__webglFramebuffer[le]), S.__webglDepthbuffer[le] = i.createRenderbuffer(), k(S.__webglDepthbuffer[le], E, !1);
    } else t.bindFramebuffer(36160, S.__webglFramebuffer), S.__webglDepthbuffer = i.createRenderbuffer(), k(S.__webglDepthbuffer, E, !1);
    t.bindFramebuffer(36160, null);
  }
  function fe(E, S, q) {
    let le = r.get(E);
    S !== void 0 && K(le.__webglFramebuffer, E, E.texture, 36064, 3553), q !== void 0 && B(E);
  }
  function ue(E) {
    let S = E.texture,
      q = r.get(E),
      le = r.get(S);
    E.addEventListener("dispose", Z), E.isWebGLMultipleRenderTargets !== !0 && (le.__webglTexture === void 0 && (le.__webglTexture = i.createTexture()), le.__version = S.version, o.memory.textures++);
    let he = E.isWebGLCubeRenderTarget === !0,
      ge = E.isWebGLMultipleRenderTargets === !0,
      _e = b(E) || a;
    if (he) {
      q.__webglFramebuffer = [];
      for (let ye = 0; ye < 6; ye++) q.__webglFramebuffer[ye] = i.createFramebuffer();
    } else {
      if (q.__webglFramebuffer = i.createFramebuffer(), ge) if (n.drawBuffers) {
        let ye = E.texture;
        for (let ee = 0, ze = ye.length; ee < ze; ee++) {
          let Me = r.get(ye[ee]);
          Me.__webglTexture === void 0 && (Me.__webglTexture = i.createTexture(), o.memory.textures++);
        }
      } else console.warn("THREE.WebGLRenderer: WebGLMultipleRenderTargets can only be used with WebGL2 or WEBGL_draw_buffers extension.");
      if (a && E.samples > 0 && Fe(E) === !1) {
        let ye = ge ? S : [S];
        q.__webglMultisampledFramebuffer = i.createFramebuffer(), q.__webglColorRenderbuffer = [], t.bindFramebuffer(36160, q.__webglMultisampledFramebuffer);
        for (let ee = 0; ee < ye.length; ee++) {
          let ze = ye[ee];
          q.__webglColorRenderbuffer[ee] = i.createRenderbuffer(), i.bindRenderbuffer(36161, q.__webglColorRenderbuffer[ee]);
          let Me = s.convert(ze.format, ze.encoding),
            Ie = s.convert(ze.type),
            De = M(ze.internalFormat, Me, Ie, ze.encoding, E.isXRRenderTarget === !0),
            Ae = Ne(E);
          i.renderbufferStorageMultisample(36161, Ae, De, E.width, E.height), i.framebufferRenderbuffer(36160, 36064 + ee, 36161, q.__webglColorRenderbuffer[ee]);
        }
        i.bindRenderbuffer(36161, null), E.depthBuffer && (q.__webglDepthRenderbuffer = i.createRenderbuffer(), k(q.__webglDepthRenderbuffer, E, !0)), t.bindFramebuffer(36160, null);
      }
    }
    if (he) {
      t.bindTexture(34067, le.__webglTexture), me(34067, S, _e);
      for (let ye = 0; ye < 6; ye++) K(q.__webglFramebuffer[ye], E, S, 36064, 34069 + ye);
      A(S, _e) && L(34067), t.unbindTexture();
    } else if (ge) {
      let ye = E.texture;
      for (let ee = 0, ze = ye.length; ee < ze; ee++) {
        let Me = ye[ee],
          Ie = r.get(Me);
        t.bindTexture(3553, Ie.__webglTexture), me(3553, Me, _e), K(q.__webglFramebuffer, E, Me, 36064 + ee, 3553), A(Me, _e) && L(3553);
      }
      t.unbindTexture();
    } else {
      let ye = 3553;
      (E.isWebGL3DRenderTarget || E.isWebGLArrayRenderTarget) && (a ? ye = E.isWebGL3DRenderTarget ? 32879 : 35866 : console.error("THREE.WebGLTextures: THREE.Data3DTexture and THREE.DataArrayTexture only supported with WebGL2.")), t.bindTexture(ye, le.__webglTexture), me(ye, S, _e), K(q.__webglFramebuffer, E, S, 36064, ye), A(S, _e) && L(ye), t.unbindTexture();
    }
    E.depthBuffer && B(E);
  }
  function Le(E) {
    let S = b(E) || a,
      q = E.isWebGLMultipleRenderTargets === !0 ? E.texture : [E.texture];
    for (let le = 0, he = q.length; le < he; le++) {
      let ge = q[le];
      if (A(ge, S)) {
        let _e = E.isWebGLCubeRenderTarget ? 34067 : 3553,
          ye = r.get(ge).__webglTexture;
        t.bindTexture(_e, ye), L(_e), t.unbindTexture();
      }
    }
  }
  function Oe(E) {
    if (a && E.samples > 0 && Fe(E) === !1) {
      let S = E.isWebGLMultipleRenderTargets ? E.texture : [E.texture],
        q = E.width,
        le = E.height,
        he = 16384,
        ge = [],
        _e = E.stencilBuffer ? 33306 : 36096,
        ye = r.get(E),
        ee = E.isWebGLMultipleRenderTargets === !0;
      if (ee) for (let ze = 0; ze < S.length; ze++) t.bindFramebuffer(36160, ye.__webglMultisampledFramebuffer), i.framebufferRenderbuffer(36160, 36064 + ze, 36161, null), t.bindFramebuffer(36160, ye.__webglFramebuffer), i.framebufferTexture2D(36009, 36064 + ze, 3553, null, 0);
      t.bindFramebuffer(36008, ye.__webglMultisampledFramebuffer), t.bindFramebuffer(36009, ye.__webglFramebuffer);
      for (let ze = 0; ze < S.length; ze++) {
        ge.push(36064 + ze), E.depthBuffer && ge.push(_e);
        let Me = ye.__ignoreDepthValues !== void 0 ? ye.__ignoreDepthValues : !1;
        if (Me === !1 && (E.depthBuffer && (he |= 256), E.stencilBuffer && (he |= 1024)), ee && i.framebufferRenderbuffer(36008, 36064, 36161, ye.__webglColorRenderbuffer[ze]), Me === !0 && (i.invalidateFramebuffer(36008, [_e]), i.invalidateFramebuffer(36009, [_e])), ee) {
          let Ie = r.get(S[ze]).__webglTexture;
          i.framebufferTexture2D(36009, 36064, 3553, Ie, 0);
        }
        i.blitFramebuffer(0, 0, q, le, 0, 0, q, le, he, 9728), p && i.invalidateFramebuffer(36008, ge);
      }
      if (t.bindFramebuffer(36008, null), t.bindFramebuffer(36009, null), ee) for (let ze = 0; ze < S.length; ze++) {
        t.bindFramebuffer(36160, ye.__webglMultisampledFramebuffer), i.framebufferRenderbuffer(36160, 36064 + ze, 36161, ye.__webglColorRenderbuffer[ze]);
        let Me = r.get(S[ze]).__webglTexture;
        t.bindFramebuffer(36160, ye.__webglFramebuffer), i.framebufferTexture2D(36009, 36064 + ze, 3553, Me, 0);
      }
      t.bindFramebuffer(36009, ye.__webglMultisampledFramebuffer);
    }
  }
  function Ne(E) {
    return Math.min(d, E.samples);
  }
  function Fe(E) {
    let S = r.get(E);
    return a && E.samples > 0 && e.has("WEBGL_multisampled_render_to_texture") === !0 && S.__useRenderToTexture !== !1;
  }
  function it(E) {
    let S = o.render.frame;
    g.get(E) !== S && (g.set(E, S), E.update());
  }
  function Dt(E, S) {
    let q = E.encoding,
      le = E.format,
      he = E.type;
    return E.isCompressedTexture === !0 || E.isVideoTexture === !0 || E.format === gc || q !== Yi && (q === Ke ? a === !1 ? e.has("EXT_sRGB") === !0 && le === Tr ? (E.format = gc, E.minFilter = It, E.generateMipmaps = !1) : S = Ta.sRGBToLinear(S) : (le !== Tr || he !== Xi) && console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType.") : console.error("THREE.WebGLTextures: Unsupported texture encoding:", q)), S;
  }
  this.allocateTextureUnit = $, this.resetTextureUnits = oe, this.setTexture2D = te, this.setTexture2DArray = be, this.setTexture3D = V, this.setTextureCube = re, this.rebindTextures = fe, this.setupRenderTarget = ue, this.updateRenderTargetMipmap = Le, this.updateMultisampleRenderTarget = Oe, this.setupDepthRenderbuffer = B, this.setupFrameBufferTexture = K, this.useMultisampledRTT = Fe;
}
function Qv(i, e, t) {
  let r = t.isWebGL2;
  function n(s, o = null) {
    let a;
    if (s === Xi) return 5121;
    if (s === Xp) return 32819;
    if (s === Yp) return 32820;
    if (s === Hp) return 5120;
    if (s === jp) return 5122;
    if (s === zu) return 5123;
    if (s === qp) return 5124;
    if (s === Gi) return 5125;
    if (s === Vi) return 5126;
    if (s === ys) return r ? 5131 : (a = e.get("OES_texture_half_float"), a !== null ? a.HALF_FLOAT_OES : null);
    if (s === Zp) return 6406;
    if (s === Tr) return 6408;
    if (s === Jp) return 6409;
    if (s === Kp) return 6410;
    if (s === Hi) return 6402;
    if (s === Dn) return 34041;
    if (s === gc) return a = e.get("EXT_sRGB"), a !== null ? a.SRGB_ALPHA_EXT : null;
    if (s === Qp) return 6403;
    if (s === $p) return 36244;
    if (s === ef) return 33319;
    if (s === tf) return 33320;
    if (s === rf) return 36249;
    if (s === vo || s === xo || s === yo || s === bo) if (o === Ke) {
      if (a = e.get("WEBGL_compressed_texture_s3tc_srgb"), a !== null) {
        if (s === vo) return a.COMPRESSED_SRGB_S3TC_DXT1_EXT;
        if (s === xo) return a.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;
        if (s === yo) return a.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;
        if (s === bo) return a.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT;
      } else return null;
    } else if (a = e.get("WEBGL_compressed_texture_s3tc"), a !== null) {
      if (s === vo) return a.COMPRESSED_RGB_S3TC_DXT1_EXT;
      if (s === xo) return a.COMPRESSED_RGBA_S3TC_DXT1_EXT;
      if (s === yo) return a.COMPRESSED_RGBA_S3TC_DXT3_EXT;
      if (s === bo) return a.COMPRESSED_RGBA_S3TC_DXT5_EXT;
    } else return null;
    if (s === Vl || s === Wl || s === Hl || s === jl) if (a = e.get("WEBGL_compressed_texture_pvrtc"), a !== null) {
      if (s === Vl) return a.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;
      if (s === Wl) return a.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;
      if (s === Hl) return a.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;
      if (s === jl) return a.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG;
    } else return null;
    if (s === nf) return a = e.get("WEBGL_compressed_texture_etc1"), a !== null ? a.COMPRESSED_RGB_ETC1_WEBGL : null;
    if (s === ql || s === Xl) if (a = e.get("WEBGL_compressed_texture_etc"), a !== null) {
      if (s === ql) return o === Ke ? a.COMPRESSED_SRGB8_ETC2 : a.COMPRESSED_RGB8_ETC2;
      if (s === Xl) return o === Ke ? a.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC : a.COMPRESSED_RGBA8_ETC2_EAC;
    } else return null;
    if (s === Yl || s === Zl || s === Jl || s === Kl || s === Ql || s === $l || s === eh || s === th || s === rh || s === ih || s === nh || s === sh || s === ah || s === oh) if (a = e.get("WEBGL_compressed_texture_astc"), a !== null) {
      if (s === Yl) return o === Ke ? a.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR : a.COMPRESSED_RGBA_ASTC_4x4_KHR;
      if (s === Zl) return o === Ke ? a.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR : a.COMPRESSED_RGBA_ASTC_5x4_KHR;
      if (s === Jl) return o === Ke ? a.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR : a.COMPRESSED_RGBA_ASTC_5x5_KHR;
      if (s === Kl) return o === Ke ? a.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR : a.COMPRESSED_RGBA_ASTC_6x5_KHR;
      if (s === Ql) return o === Ke ? a.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR : a.COMPRESSED_RGBA_ASTC_6x6_KHR;
      if (s === $l) return o === Ke ? a.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR : a.COMPRESSED_RGBA_ASTC_8x5_KHR;
      if (s === eh) return o === Ke ? a.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR : a.COMPRESSED_RGBA_ASTC_8x6_KHR;
      if (s === th) return o === Ke ? a.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR : a.COMPRESSED_RGBA_ASTC_8x8_KHR;
      if (s === rh) return o === Ke ? a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR : a.COMPRESSED_RGBA_ASTC_10x5_KHR;
      if (s === ih) return o === Ke ? a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR : a.COMPRESSED_RGBA_ASTC_10x6_KHR;
      if (s === nh) return o === Ke ? a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR : a.COMPRESSED_RGBA_ASTC_10x8_KHR;
      if (s === sh) return o === Ke ? a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR : a.COMPRESSED_RGBA_ASTC_10x10_KHR;
      if (s === ah) return o === Ke ? a.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR : a.COMPRESSED_RGBA_ASTC_12x10_KHR;
      if (s === oh) return o === Ke ? a.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR : a.COMPRESSED_RGBA_ASTC_12x12_KHR;
    } else return null;
    if (s === Mo) if (a = e.get("EXT_texture_compression_bptc"), a !== null) {
      if (s === Mo) return o === Ke ? a.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT : a.COMPRESSED_RGBA_BPTC_UNORM_EXT;
    } else return null;
    if (s === sf || s === ch || s === lh || s === hh) if (a = e.get("EXT_texture_compression_rgtc"), a !== null) {
      if (s === Mo) return a.COMPRESSED_RED_RGTC1_EXT;
      if (s === ch) return a.COMPRESSED_SIGNED_RED_RGTC1_EXT;
      if (s === lh) return a.COMPRESSED_RED_GREEN_RGTC2_EXT;
      if (s === hh) return a.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT;
    } else return null;
    return s === wn ? r ? 34042 : (a = e.get("WEBGL_depth_texture"), a !== null ? a.UNSIGNED_INT_24_8_WEBGL : null) : i[s] !== void 0 ? i[s] : null;
  }
  return {
    convert: n
  };
}
var Cc = class extends Ot {
    constructor(e = []) {
      super(), this.isArrayCamera = !0, this.cameras = e;
    }
  },
  Er = class extends kt {
    constructor() {
      super(), this.isGroup = !0, this.type = "Group";
    }
  },
  $v = {
    type: "move"
  },
  fs = class {
    constructor() {
      this._targetRay = null, this._grip = null, this._hand = null;
    }
    getHandSpace() {
      return this._hand === null && (this._hand = new Er(), this._hand.matrixAutoUpdate = !1, this._hand.visible = !1, this._hand.joints = {}, this._hand.inputState = {
        pinching: !1
      }), this._hand;
    }
    getTargetRaySpace() {
      return this._targetRay === null && (this._targetRay = new Er(), this._targetRay.matrixAutoUpdate = !1, this._targetRay.visible = !1, this._targetRay.hasLinearVelocity = !1, this._targetRay.linearVelocity = new C(), this._targetRay.hasAngularVelocity = !1, this._targetRay.angularVelocity = new C()), this._targetRay;
    }
    getGripSpace() {
      return this._grip === null && (this._grip = new Er(), this._grip.matrixAutoUpdate = !1, this._grip.visible = !1, this._grip.hasLinearVelocity = !1, this._grip.linearVelocity = new C(), this._grip.hasAngularVelocity = !1, this._grip.angularVelocity = new C()), this._grip;
    }
    dispatchEvent(e) {
      return this._targetRay !== null && this._targetRay.dispatchEvent(e), this._grip !== null && this._grip.dispatchEvent(e), this._hand !== null && this._hand.dispatchEvent(e), this;
    }
    connect(e) {
      if (e && e.hand) {
        let t = this._hand;
        if (t) for (let r of e.hand.values()) this._getHandJoint(t, r);
      }
      return this.dispatchEvent({
        type: "connected",
        data: e
      }), this;
    }
    disconnect(e) {
      return this.dispatchEvent({
        type: "disconnected",
        data: e
      }), this._targetRay !== null && (this._targetRay.visible = !1), this._grip !== null && (this._grip.visible = !1), this._hand !== null && (this._hand.visible = !1), this;
    }
    update(e, t, r) {
      let n = null,
        s = null,
        o = null,
        a = this._targetRay,
        l = this._grip,
        c = this._hand;
      if (e && t.session.visibilityState !== "visible-blurred") {
        if (c && e.hand) {
          o = !0;
          for (let f of e.hand.values()) {
            let m = t.getJointPose(f, r),
              v = this._getHandJoint(c, f);
            m !== null && (v.matrix.fromArray(m.transform.matrix), v.matrix.decompose(v.position, v.rotation, v.scale), v.jointRadius = m.radius), v.visible = m !== null;
          }
          let h = c.joints["index-finger-tip"],
            d = c.joints["thumb-tip"],
            u = h.position.distanceTo(d.position),
            p = 0.02,
            g = 0.005;
          c.inputState.pinching && u > p + g ? (c.inputState.pinching = !1, this.dispatchEvent({
            type: "pinchend",
            handedness: e.handedness,
            target: this
          })) : !c.inputState.pinching && u <= p - g && (c.inputState.pinching = !0, this.dispatchEvent({
            type: "pinchstart",
            handedness: e.handedness,
            target: this
          }));
        } else l !== null && e.gripSpace && (s = t.getPose(e.gripSpace, r), s !== null && (l.matrix.fromArray(s.transform.matrix), l.matrix.decompose(l.position, l.rotation, l.scale), s.linearVelocity ? (l.hasLinearVelocity = !0, l.linearVelocity.copy(s.linearVelocity)) : l.hasLinearVelocity = !1, s.angularVelocity ? (l.hasAngularVelocity = !0, l.angularVelocity.copy(s.angularVelocity)) : l.hasAngularVelocity = !1));
        a !== null && (n = t.getPose(e.targetRaySpace, r), n === null && s !== null && (n = s), n !== null && (a.matrix.fromArray(n.transform.matrix), a.matrix.decompose(a.position, a.rotation, a.scale), n.linearVelocity ? (a.hasLinearVelocity = !0, a.linearVelocity.copy(n.linearVelocity)) : a.hasLinearVelocity = !1, n.angularVelocity ? (a.hasAngularVelocity = !0, a.angularVelocity.copy(n.angularVelocity)) : a.hasAngularVelocity = !1, this.dispatchEvent($v)));
      }
      return a !== null && (a.visible = n !== null), l !== null && (l.visible = s !== null), c !== null && (c.visible = o !== null), this;
    }
    _getHandJoint(e, t) {
      if (e.joints[t.jointName] === void 0) {
        let r = new Er();
        r.matrixAutoUpdate = !1, r.visible = !1, e.joints[t.jointName] = r, e.add(r);
      }
      return e.joints[t.jointName];
    }
  },
  Rc = class extends vr {
    constructor(e, t, r, n, s, o, a, l, c, h) {
      if (h = h !== void 0 ? h : Hi, h !== Hi && h !== Dn) throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");
      r === void 0 && h === Hi && (r = Gi), r === void 0 && h === Dn && (r = wn), super(null, n, s, o, a, l, h, r, c), this.isDepthTexture = !0, this.image = {
        width: e,
        height: t
      }, this.magFilter = a !== void 0 ? a : Zt, this.minFilter = l !== void 0 ? l : Zt, this.flipY = !1, this.generateMipmaps = !1;
    }
  },
  Pc = class extends _i {
    constructor(e, t) {
      super();
      let r = this,
        n = null,
        s = 1,
        o = null,
        a = "local-floor",
        l = 1,
        c = null,
        h = null,
        d = null,
        u = null,
        p = null,
        g = null,
        f = t.getContextAttributes(),
        m = null,
        v = null,
        y = [],
        x = [],
        b = new Set(),
        w = new Map(),
        A = new Ot();
      A.layers.enable(1), A.viewport = new dt();
      let L = new Ot();
      L.layers.enable(2), L.viewport = new dt();
      let M = [A, L],
        T = new Cc();
      T.layers.enable(1), T.layers.enable(2);
      let R = null,
        H = null;
      this.cameraAutoUpdate = !0, this.enabled = !1, this.isPresenting = !1, this.getController = function (V) {
        let re = y[V];
        return re === void 0 && (re = new fs(), y[V] = re), re.getTargetRaySpace();
      }, this.getControllerGrip = function (V) {
        let re = y[V];
        return re === void 0 && (re = new fs(), y[V] = re), re.getGripSpace();
      }, this.getHand = function (V) {
        let re = y[V];
        return re === void 0 && (re = new fs(), y[V] = re), re.getHandSpace();
      };
      function Z(V) {
        let re = x.indexOf(V.inputSource);
        if (re === -1) return;
        let de = y[re];
        de !== void 0 && de.dispatchEvent({
          type: V.type,
          data: V.inputSource
        });
      }
      function O() {
        n.removeEventListener("select", Z), n.removeEventListener("selectstart", Z), n.removeEventListener("selectend", Z), n.removeEventListener("squeeze", Z), n.removeEventListener("squeezestart", Z), n.removeEventListener("squeezeend", Z), n.removeEventListener("end", O), n.removeEventListener("inputsourceschange", z);
        for (let V = 0; V < y.length; V++) {
          let re = x[V];
          re !== null && (x[V] = null, y[V].disconnect(re));
        }
        R = null, H = null, e.setRenderTarget(m), p = null, u = null, d = null, n = null, v = null, be.stop(), r.isPresenting = !1, r.dispatchEvent({
          type: "sessionend"
        });
      }
      this.setFramebufferScaleFactor = function (V) {
        s = V, r.isPresenting === !0 && console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.");
      }, this.setReferenceSpaceType = function (V) {
        a = V, r.isPresenting === !0 && console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.");
      }, this.getReferenceSpace = function () {
        return c || o;
      }, this.setReferenceSpace = function (V) {
        c = V;
      }, this.getBaseLayer = function () {
        return u !== null ? u : p;
      }, this.getBinding = function () {
        return d;
      }, this.getFrame = function () {
        return g;
      }, this.getSession = function () {
        return n;
      }, this.setSession = async function (V) {
        if (n = V, n !== null) {
          if (m = e.getRenderTarget(), n.addEventListener("select", Z), n.addEventListener("selectstart", Z), n.addEventListener("selectend", Z), n.addEventListener("squeeze", Z), n.addEventListener("squeezestart", Z), n.addEventListener("squeezeend", Z), n.addEventListener("end", O), n.addEventListener("inputsourceschange", z), f.xrCompatible !== !0 && (await t.makeXRCompatible()), n.renderState.layers === void 0 || e.capabilities.isWebGL2 === !1) {
            let re = {
              antialias: n.renderState.layers === void 0 ? f.antialias : !0,
              alpha: f.alpha,
              depth: f.depth,
              stencil: f.stencil,
              framebufferScaleFactor: s
            };
            p = new XRWebGLLayer(n, t, re), n.updateRenderState({
              baseLayer: p
            }), v = new si(p.framebufferWidth, p.framebufferHeight, {
              format: Tr,
              type: Xi,
              encoding: e.outputEncoding,
              stencilBuffer: f.stencil
            });
          } else {
            let re = null,
              de = null,
              W = null;
            f.depth && (W = f.stencil ? 35056 : 33190, re = f.stencil ? Dn : Hi, de = f.stencil ? wn : Gi);
            let me = {
              colorFormat: 32856,
              depthFormat: W,
              scaleFactor: s
            };
            d = new XRWebGLBinding(n, t), u = d.createProjectionLayer(me), n.updateRenderState({
              layers: [u]
            }), v = new si(u.textureWidth, u.textureHeight, {
              format: Tr,
              type: Xi,
              depthTexture: new Rc(u.textureWidth, u.textureHeight, de, void 0, void 0, void 0, void 0, void 0, void 0, re),
              stencilBuffer: f.stencil,
              encoding: e.outputEncoding,
              samples: f.antialias ? 4 : 0
            });
            let P = e.properties.get(v);
            P.__ignoreDepthValues = u.ignoreDepthValues;
          }
          v.isXRRenderTarget = !0, this.setFoveation(l), c = null, o = await n.requestReferenceSpace(a), be.setContext(n), be.start(), r.isPresenting = !0, r.dispatchEvent({
            type: "sessionstart"
          });
        }
      };
      function z(V) {
        for (let re = 0; re < V.removed.length; re++) {
          let de = V.removed[re],
            W = x.indexOf(de);
          W >= 0 && (x[W] = null, y[W].disconnect(de));
        }
        for (let re = 0; re < V.added.length; re++) {
          let de = V.added[re],
            W = x.indexOf(de);
          if (W === -1) {
            for (let P = 0; P < y.length; P++) if (P >= x.length) {
              x.push(de), W = P;
              break;
            } else if (x[P] === null) {
              x[P] = de, W = P;
              break;
            }
            if (W === -1) break;
          }
          let me = y[W];
          me && me.connect(de);
        }
      }
      let j = new C(),
        ie = new C();
      function oe(V, re, de) {
        j.setFromMatrixPosition(re.matrixWorld), ie.setFromMatrixPosition(de.matrixWorld);
        let W = j.distanceTo(ie),
          me = re.projectionMatrix.elements,
          P = de.projectionMatrix.elements,
          N = me[14] / (me[10] - 1),
          Q = me[14] / (me[10] + 1),
          K = (me[9] + 1) / me[5],
          k = (me[9] - 1) / me[5],
          F = (me[8] - 1) / me[0],
          B = (P[8] + 1) / P[0],
          fe = N * F,
          ue = N * B,
          Le = W / (-F + B),
          Oe = Le * -F;
        re.matrixWorld.decompose(V.position, V.quaternion, V.scale), V.translateX(Oe), V.translateZ(Le), V.matrixWorld.compose(V.position, V.quaternion, V.scale), V.matrixWorldInverse.copy(V.matrixWorld).invert();
        let Ne = N + Le,
          Fe = Q + Le,
          it = fe - Oe,
          Dt = ue + (W - Oe),
          E = K * Q / Fe * Ne,
          S = k * Q / Fe * Ne;
        V.projectionMatrix.makePerspective(it, Dt, E, S, Ne, Fe);
      }
      function $(V, re) {
        re === null ? V.matrixWorld.copy(V.matrix) : V.matrixWorld.multiplyMatrices(re.matrixWorld, V.matrix), V.matrixWorldInverse.copy(V.matrixWorld).invert();
      }
      this.updateCamera = function (V) {
        if (n === null) return;
        T.near = L.near = A.near = V.near, T.far = L.far = A.far = V.far, (R !== T.near || H !== T.far) && (n.updateRenderState({
          depthNear: T.near,
          depthFar: T.far
        }), R = T.near, H = T.far);
        let re = V.parent,
          de = T.cameras;
        $(T, re);
        for (let me = 0; me < de.length; me++) $(de[me], re);
        T.matrixWorld.decompose(T.position, T.quaternion, T.scale), V.matrix.copy(T.matrix), V.matrix.decompose(V.position, V.quaternion, V.scale);
        let W = V.children;
        for (let me = 0, P = W.length; me < P; me++) W[me].updateMatrixWorld(!0);
        de.length === 2 ? oe(T, A, L) : T.projectionMatrix.copy(A.projectionMatrix);
      }, this.getCamera = function () {
        return T;
      }, this.getFoveation = function () {
        if (!(u === null && p === null)) return l;
      }, this.setFoveation = function (V) {
        l = V, u !== null && (u.fixedFoveation = V), p !== null && p.fixedFoveation !== void 0 && (p.fixedFoveation = V);
      }, this.getPlanes = function () {
        return b;
      };
      let ae = null;
      function te(V, re) {
        if (h = re.getViewerPose(c || o), g = re, h !== null) {
          let de = h.views;
          p !== null && (e.setRenderTargetFramebuffer(v, p.framebuffer), e.setRenderTarget(v));
          let W = !1;
          de.length !== T.cameras.length && (T.cameras.length = 0, W = !0);
          for (let me = 0; me < de.length; me++) {
            let P = de[me],
              N = null;
            if (p !== null) N = p.getViewport(P);else {
              let K = d.getViewSubImage(u, P);
              N = K.viewport, me === 0 && (e.setRenderTargetTextures(v, K.colorTexture, u.ignoreDepthValues ? void 0 : K.depthStencilTexture), e.setRenderTarget(v));
            }
            let Q = M[me];
            Q === void 0 && (Q = new Ot(), Q.layers.enable(me), Q.viewport = new dt(), M[me] = Q), Q.matrix.fromArray(P.transform.matrix), Q.projectionMatrix.fromArray(P.projectionMatrix), Q.viewport.set(N.x, N.y, N.width, N.height), me === 0 && T.matrix.copy(Q.matrix), W === !0 && T.cameras.push(Q);
          }
        }
        for (let de = 0; de < y.length; de++) {
          let W = x[de],
            me = y[de];
          W !== null && me !== void 0 && me.update(W, re, c || o);
        }
        if (ae && ae(V, re), re.detectedPlanes) {
          r.dispatchEvent({
            type: "planesdetected",
            data: re.detectedPlanes
          });
          let de = null;
          for (let W of b) re.detectedPlanes.has(W) || (de === null && (de = []), de.push(W));
          if (de !== null) for (let W of de) b.delete(W), w.delete(W), r.dispatchEvent({
            type: "planeremoved",
            data: W
          });
          for (let W of re.detectedPlanes) if (!b.has(W)) b.add(W), w.set(W, re.lastChangedTime), r.dispatchEvent({
            type: "planeadded",
            data: W
          });else {
            let me = w.get(W);
            W.lastChangedTime > me && (w.set(W, W.lastChangedTime), r.dispatchEvent({
              type: "planechanged",
              data: W
            }));
          }
        }
        g = null;
      }
      let be = new Fu();
      be.setAnimationLoop(te), this.setAnimationLoop = function (V) {
        ae = V;
      }, this.dispose = function () {};
    }
  };
function e1(i, e) {
  function t(f, m) {
    m.color.getRGB(f.fogColor.value, Uu(i)), m.isFog ? (f.fogNear.value = m.near, f.fogFar.value = m.far) : m.isFogExp2 && (f.fogDensity.value = m.density);
  }
  function r(f, m, v, y, x) {
    m.isMeshBasicMaterial || m.isMeshLambertMaterial ? n(f, m) : m.isMeshToonMaterial ? (n(f, m), h(f, m)) : m.isMeshPhongMaterial ? (n(f, m), c(f, m)) : m.isMeshStandardMaterial ? (n(f, m), d(f, m), m.isMeshPhysicalMaterial && u(f, m, x)) : m.isMeshMatcapMaterial ? (n(f, m), p(f, m)) : m.isMeshDepthMaterial ? n(f, m) : m.isMeshDistanceMaterial ? (n(f, m), g(f, m)) : m.isMeshNormalMaterial ? n(f, m) : m.isLineBasicMaterial ? (s(f, m), m.isLineDashedMaterial && o(f, m)) : m.isPointsMaterial ? a(f, m, v, y) : m.isSpriteMaterial ? l(f, m) : m.isShadowMaterial ? (f.color.value.copy(m.color), f.opacity.value = m.opacity) : m.isShaderMaterial && (m.uniformsNeedUpdate = !1);
  }
  function n(f, m) {
    f.opacity.value = m.opacity, m.color && f.diffuse.value.copy(m.color), m.emissive && f.emissive.value.copy(m.emissive).multiplyScalar(m.emissiveIntensity), m.map && (f.map.value = m.map), m.alphaMap && (f.alphaMap.value = m.alphaMap), m.bumpMap && (f.bumpMap.value = m.bumpMap, f.bumpScale.value = m.bumpScale, m.side === or && (f.bumpScale.value *= -1)), m.displacementMap && (f.displacementMap.value = m.displacementMap, f.displacementScale.value = m.displacementScale, f.displacementBias.value = m.displacementBias), m.emissiveMap && (f.emissiveMap.value = m.emissiveMap), m.normalMap && (f.normalMap.value = m.normalMap, f.normalScale.value.copy(m.normalScale), m.side === or && f.normalScale.value.negate()), m.specularMap && (f.specularMap.value = m.specularMap), m.alphaTest > 0 && (f.alphaTest.value = m.alphaTest);
    let v = e.get(m).envMap;
    if (v && (f.envMap.value = v, f.flipEnvMap.value = v.isCubeTexture && v.isRenderTargetTexture === !1 ? -1 : 1, f.reflectivity.value = m.reflectivity, f.ior.value = m.ior, f.refractionRatio.value = m.refractionRatio), m.lightMap) {
      f.lightMap.value = m.lightMap;
      let b = i.useLegacyLights === !0 ? Math.PI : 1;
      f.lightMapIntensity.value = m.lightMapIntensity * b;
    }
    m.aoMap && (f.aoMap.value = m.aoMap, f.aoMapIntensity.value = m.aoMapIntensity);
    let y;
    m.map ? y = m.map : m.specularMap ? y = m.specularMap : m.displacementMap ? y = m.displacementMap : m.normalMap ? y = m.normalMap : m.bumpMap ? y = m.bumpMap : m.roughnessMap ? y = m.roughnessMap : m.metalnessMap ? y = m.metalnessMap : m.alphaMap ? y = m.alphaMap : m.emissiveMap ? y = m.emissiveMap : m.clearcoatMap ? y = m.clearcoatMap : m.clearcoatNormalMap ? y = m.clearcoatNormalMap : m.clearcoatRoughnessMap ? y = m.clearcoatRoughnessMap : m.iridescenceMap ? y = m.iridescenceMap : m.iridescenceThicknessMap ? y = m.iridescenceThicknessMap : m.specularIntensityMap ? y = m.specularIntensityMap : m.specularColorMap ? y = m.specularColorMap : m.transmissionMap ? y = m.transmissionMap : m.thicknessMap ? y = m.thicknessMap : m.sheenColorMap ? y = m.sheenColorMap : m.sheenRoughnessMap && (y = m.sheenRoughnessMap), y !== void 0 && (y.isWebGLRenderTarget && (y = y.texture), y.matrixAutoUpdate === !0 && y.updateMatrix(), f.uvTransform.value.copy(y.matrix));
    let x;
    m.aoMap ? x = m.aoMap : m.lightMap && (x = m.lightMap), x !== void 0 && (x.isWebGLRenderTarget && (x = x.texture), x.matrixAutoUpdate === !0 && x.updateMatrix(), f.uv2Transform.value.copy(x.matrix));
  }
  function s(f, m) {
    f.diffuse.value.copy(m.color), f.opacity.value = m.opacity;
  }
  function o(f, m) {
    f.dashSize.value = m.dashSize, f.totalSize.value = m.dashSize + m.gapSize, f.scale.value = m.scale;
  }
  function a(f, m, v, y) {
    f.diffuse.value.copy(m.color), f.opacity.value = m.opacity, f.size.value = m.size * v, f.scale.value = y * 0.5, m.map && (f.map.value = m.map), m.alphaMap && (f.alphaMap.value = m.alphaMap), m.alphaTest > 0 && (f.alphaTest.value = m.alphaTest);
    let x;
    m.map ? x = m.map : m.alphaMap && (x = m.alphaMap), x !== void 0 && (x.matrixAutoUpdate === !0 && x.updateMatrix(), f.uvTransform.value.copy(x.matrix));
  }
  function l(f, m) {
    f.diffuse.value.copy(m.color), f.opacity.value = m.opacity, f.rotation.value = m.rotation, m.map && (f.map.value = m.map), m.alphaMap && (f.alphaMap.value = m.alphaMap), m.alphaTest > 0 && (f.alphaTest.value = m.alphaTest);
    let v;
    m.map ? v = m.map : m.alphaMap && (v = m.alphaMap), v !== void 0 && (v.matrixAutoUpdate === !0 && v.updateMatrix(), f.uvTransform.value.copy(v.matrix));
  }
  function c(f, m) {
    f.specular.value.copy(m.specular), f.shininess.value = Math.max(m.shininess, 1e-4);
  }
  function h(f, m) {
    m.gradientMap && (f.gradientMap.value = m.gradientMap);
  }
  function d(f, m) {
    f.roughness.value = m.roughness, f.metalness.value = m.metalness, m.roughnessMap && (f.roughnessMap.value = m.roughnessMap), m.metalnessMap && (f.metalnessMap.value = m.metalnessMap), e.get(m).envMap && (f.envMapIntensity.value = m.envMapIntensity);
  }
  function u(f, m, v) {
    f.ior.value = m.ior, m.sheen > 0 && (f.sheenColor.value.copy(m.sheenColor).multiplyScalar(m.sheen), f.sheenRoughness.value = m.sheenRoughness, m.sheenColorMap && (f.sheenColorMap.value = m.sheenColorMap), m.sheenRoughnessMap && (f.sheenRoughnessMap.value = m.sheenRoughnessMap)), m.clearcoat > 0 && (f.clearcoat.value = m.clearcoat, f.clearcoatRoughness.value = m.clearcoatRoughness, m.clearcoatMap && (f.clearcoatMap.value = m.clearcoatMap), m.clearcoatRoughnessMap && (f.clearcoatRoughnessMap.value = m.clearcoatRoughnessMap), m.clearcoatNormalMap && (f.clearcoatNormalScale.value.copy(m.clearcoatNormalScale), f.clearcoatNormalMap.value = m.clearcoatNormalMap, m.side === or && f.clearcoatNormalScale.value.negate())), m.iridescence > 0 && (f.iridescence.value = m.iridescence, f.iridescenceIOR.value = m.iridescenceIOR, f.iridescenceThicknessMinimum.value = m.iridescenceThicknessRange[0], f.iridescenceThicknessMaximum.value = m.iridescenceThicknessRange[1], m.iridescenceMap && (f.iridescenceMap.value = m.iridescenceMap), m.iridescenceThicknessMap && (f.iridescenceThicknessMap.value = m.iridescenceThicknessMap)), m.transmission > 0 && (f.transmission.value = m.transmission, f.transmissionSamplerMap.value = v.texture, f.transmissionSamplerSize.value.set(v.width, v.height), m.transmissionMap && (f.transmissionMap.value = m.transmissionMap), f.thickness.value = m.thickness, m.thicknessMap && (f.thicknessMap.value = m.thicknessMap), f.attenuationDistance.value = m.attenuationDistance, f.attenuationColor.value.copy(m.attenuationColor)), f.specularIntensity.value = m.specularIntensity, f.specularColor.value.copy(m.specularColor), m.specularIntensityMap && (f.specularIntensityMap.value = m.specularIntensityMap), m.specularColorMap && (f.specularColorMap.value = m.specularColorMap);
  }
  function p(f, m) {
    m.matcap && (f.matcap.value = m.matcap);
  }
  function g(f, m) {
    f.referencePosition.value.copy(m.referencePosition), f.nearDistance.value = m.nearDistance, f.farDistance.value = m.farDistance;
  }
  return {
    refreshFogUniforms: t,
    refreshMaterialUniforms: r
  };
}
function t1(i, e, t, r) {
  let n = {},
    s = {},
    o = [],
    a = t.isWebGL2 ? i.getParameter(35375) : 0;
  function l(y, x) {
    let b = x.program;
    r.uniformBlockBinding(y, b);
  }
  function c(y, x) {
    let b = n[y.id];
    b === void 0 && (g(y), b = h(y), n[y.id] = b, y.addEventListener("dispose", m));
    let w = x.program;
    r.updateUBOMapping(y, w);
    let A = e.render.frame;
    s[y.id] !== A && (u(y), s[y.id] = A);
  }
  function h(y) {
    let x = d();
    y.__bindingPointIndex = x;
    let b = i.createBuffer(),
      w = y.__size,
      A = y.usage;
    return i.bindBuffer(35345, b), i.bufferData(35345, w, A), i.bindBuffer(35345, null), i.bindBufferBase(35345, x, b), b;
  }
  function d() {
    for (let y = 0; y < a; y++) if (o.indexOf(y) === -1) return o.push(y), y;
    return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."), 0;
  }
  function u(y) {
    let x = n[y.id],
      b = y.uniforms,
      w = y.__cache;
    i.bindBuffer(35345, x);
    for (let A = 0, L = b.length; A < L; A++) {
      let M = b[A];
      if (p(M, A, w) === !0) {
        let T = M.__offset,
          R = Array.isArray(M.value) ? M.value : [M.value],
          H = 0;
        for (let Z = 0; Z < R.length; Z++) {
          let O = R[Z],
            z = f(O);
          typeof O == "number" ? (M.__data[0] = O, i.bufferSubData(35345, T + H, M.__data)) : O.isMatrix3 ? (M.__data[0] = O.elements[0], M.__data[1] = O.elements[1], M.__data[2] = O.elements[2], M.__data[3] = O.elements[0], M.__data[4] = O.elements[3], M.__data[5] = O.elements[4], M.__data[6] = O.elements[5], M.__data[7] = O.elements[0], M.__data[8] = O.elements[6], M.__data[9] = O.elements[7], M.__data[10] = O.elements[8], M.__data[11] = O.elements[0]) : (O.toArray(M.__data, H), H += z.storage / Float32Array.BYTES_PER_ELEMENT);
        }
        i.bufferSubData(35345, T, M.__data);
      }
    }
    i.bindBuffer(35345, null);
  }
  function p(y, x, b) {
    let w = y.value;
    if (b[x] === void 0) {
      if (typeof w == "number") b[x] = w;else {
        let A = Array.isArray(w) ? w : [w],
          L = [];
        for (let M = 0; M < A.length; M++) L.push(A[M].clone());
        b[x] = L;
      }
      return !0;
    } else if (typeof w == "number") {
      if (b[x] !== w) return b[x] = w, !0;
    } else {
      let A = Array.isArray(b[x]) ? b[x] : [b[x]],
        L = Array.isArray(w) ? w : [w];
      for (let M = 0; M < A.length; M++) {
        let T = A[M];
        if (T.equals(L[M]) === !1) return T.copy(L[M]), !0;
      }
    }
    return !1;
  }
  function g(y) {
    let x = y.uniforms,
      b = 0,
      w = 16,
      A = 0;
    for (let L = 0, M = x.length; L < M; L++) {
      let T = x[L],
        R = {
          boundary: 0,
          storage: 0
        },
        H = Array.isArray(T.value) ? T.value : [T.value];
      for (let Z = 0, O = H.length; Z < O; Z++) {
        let z = H[Z],
          j = f(z);
        R.boundary += j.boundary, R.storage += j.storage;
      }
      if (T.__data = new Float32Array(R.storage / Float32Array.BYTES_PER_ELEMENT), T.__offset = b, L > 0) {
        A = b % w;
        let Z = w - A;
        A !== 0 && Z - R.boundary < 0 && (b += w - A, T.__offset = b);
      }
      b += R.storage;
    }
    return A = b % w, A > 0 && (b += w - A), y.__size = b, y.__cache = {}, this;
  }
  function f(y) {
    let x = {
      boundary: 0,
      storage: 0
    };
    return typeof y == "number" ? (x.boundary = 4, x.storage = 4) : y.isVector2 ? (x.boundary = 8, x.storage = 8) : y.isVector3 || y.isColor ? (x.boundary = 16, x.storage = 12) : y.isVector4 ? (x.boundary = 16, x.storage = 16) : y.isMatrix3 ? (x.boundary = 48, x.storage = 48) : y.isMatrix4 ? (x.boundary = 64, x.storage = 64) : y.isTexture ? console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group.") : console.warn("THREE.WebGLRenderer: Unsupported uniform value type.", y), x;
  }
  function m(y) {
    let x = y.target;
    x.removeEventListener("dispose", m);
    let b = o.indexOf(x.__bindingPointIndex);
    o.splice(b, 1), i.deleteBuffer(n[x.id]), delete n[x.id], delete s[x.id];
  }
  function v() {
    for (let y in n) i.deleteBuffer(n[y]);
    o = [], n = {}, s = {};
  }
  return {
    bind: l,
    update: c,
    dispose: v
  };
}
function r1() {
  let i = _a("canvas");
  return i.style.display = "block", i;
}
function no(i = {}) {
  this.isWebGLRenderer = !0;
  let e = i.canvas !== void 0 ? i.canvas : r1(),
    t = i.context !== void 0 ? i.context : null,
    r = i.depth !== void 0 ? i.depth : !0,
    n = i.stencil !== void 0 ? i.stencil : !0,
    s = i.antialias !== void 0 ? i.antialias : !1,
    o = i.premultipliedAlpha !== void 0 ? i.premultipliedAlpha : !0,
    a = i.preserveDrawingBuffer !== void 0 ? i.preserveDrawingBuffer : !1,
    l = i.powerPreference !== void 0 ? i.powerPreference : "default",
    c = i.failIfMajorPerformanceCaveat !== void 0 ? i.failIfMajorPerformanceCaveat : !1,
    h;
  t !== null ? h = t.getContextAttributes().alpha : h = i.alpha !== void 0 ? i.alpha : !1;
  let d = null,
    u = null,
    p = [],
    g = [];
  this.domElement = e, this.debug = {
    checkShaderErrors: !0
  }, this.autoClear = !0, this.autoClearColor = !0, this.autoClearDepth = !0, this.autoClearStencil = !0, this.sortObjects = !0, this.clippingPlanes = [], this.localClippingEnabled = !1, this.outputEncoding = Yi, this.useLegacyLights = !0, this.toneMapping = ri, this.toneMappingExposure = 1;
  let f = this,
    m = !1,
    v = 0,
    y = 0,
    x = null,
    b = -1,
    w = null,
    A = new dt(),
    L = new dt(),
    M = null,
    T = e.width,
    R = e.height,
    H = 1,
    Z = null,
    O = null,
    z = new dt(0, 0, T, R),
    j = new dt(0, 0, T, R),
    ie = !1,
    oe = new Ms(),
    $ = !1,
    ae = !1,
    te = null,
    be = new at(),
    V = new C(),
    re = {
      background: null,
      fog: null,
      environment: null,
      overrideMaterial: null,
      isScene: !0
    };
  function de() {
    return x === null ? H : 1;
  }
  let W = t;
  function me(_, G) {
    for (let X = 0; X < _.length; X++) {
      let U = _[X],
        J = e.getContext(U, G);
      if (J !== null) return J;
    }
    return null;
  }
  try {
    let _ = {
      alpha: !0,
      depth: r,
      stencil: n,
      antialias: s,
      premultipliedAlpha: o,
      preserveDrawingBuffer: a,
      powerPreference: l,
      failIfMajorPerformanceCaveat: c
    };
    if ("setAttribute" in e && e.setAttribute("data-engine", `three.js r${ml}`), e.addEventListener("webglcontextlost", Ie, !1), e.addEventListener("webglcontextrestored", De, !1), e.addEventListener("webglcontextcreationerror", Ae, !1), W === null) {
      let G = ["webgl2", "webgl", "experimental-webgl"];
      if (f.isWebGL1Renderer === !0 && G.shift(), W = me(G, _), W === null) throw me(G) ? new Error("Error creating WebGL context with your selected attributes.") : new Error("Error creating WebGL context.");
    }
    W.getShaderPrecisionFormat === void 0 && (W.getShaderPrecisionFormat = function () {
      return {
        rangeMin: 1,
        rangeMax: 1,
        precision: 1
      };
    });
  } catch (_) {
    throw console.error("THREE.WebGLRenderer: " + _.message), _;
  }
  let P, N, Q, K, k, F, B, fe, ue, Le, Oe, Ne, Fe, it, Dt, E, S, q, le, he, ge, _e, ye, ee;
  function ze() {
    P = new w0(W), N = new v0(W, P, i), P.init(N), _e = new Qv(W, P, N), Q = new Jv(W, P, N), K = new E0(), k = new Uv(), F = new Kv(W, P, Q, k, N, _e, K), B = new y0(f), fe = new S0(f), ue = new Of(W, N), ye = new m0(W, P, ue, N), Le = new _0(W, ue, K, ye), Oe = new P0(W, Le, ue, K), le = new R0(W, N, F), E = new x0(k), Ne = new kv(f, B, fe, P, N, ye, E), Fe = new e1(f, k), it = new Bv(), Dt = new qv(P, N), q = new f0(f, B, fe, Q, Oe, h, o), S = new Zv(f, Oe, N), ee = new t1(W, K, N, Q), he = new g0(W, P, K, N), ge = new T0(W, P, K, N), K.programs = Ne.programs, f.capabilities = N, f.extensions = P, f.properties = k, f.renderLists = it, f.shadowMap = S, f.state = Q, f.info = K;
  }
  ze();
  let Me = new Pc(f, W);
  this.xr = Me, this.getContext = function () {
    return W;
  }, this.getContextAttributes = function () {
    return W.getContextAttributes();
  }, this.forceContextLoss = function () {
    let _ = P.get("WEBGL_lose_context");
    _ && _.loseContext();
  }, this.forceContextRestore = function () {
    let _ = P.get("WEBGL_lose_context");
    _ && _.restoreContext();
  }, this.getPixelRatio = function () {
    return H;
  }, this.setPixelRatio = function (_) {
    _ !== void 0 && (H = _, this.setSize(T, R, !1));
  }, this.getSize = function (_) {
    return _.set(T, R);
  }, this.setSize = function (_, G, X = !0) {
    if (Me.isPresenting) {
      console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");
      return;
    }
    T = _, R = G, e.width = Math.floor(_ * H), e.height = Math.floor(G * H), X === !0 && (e.style.width = _ + "px", e.style.height = G + "px"), this.setViewport(0, 0, _, G);
  }, this.getDrawingBufferSize = function (_) {
    return _.set(T * H, R * H).floor();
  }, this.setDrawingBufferSize = function (_, G, X) {
    T = _, R = G, H = X, e.width = Math.floor(_ * X), e.height = Math.floor(G * X), this.setViewport(0, 0, _, G);
  }, this.getCurrentViewport = function (_) {
    return _.copy(A);
  }, this.getViewport = function (_) {
    return _.copy(z);
  }, this.setViewport = function (_, G, X, U) {
    _.isVector4 ? z.set(_.x, _.y, _.z, _.w) : z.set(_, G, X, U), Q.viewport(A.copy(z).multiplyScalar(H).floor());
  }, this.getScissor = function (_) {
    return _.copy(j);
  }, this.setScissor = function (_, G, X, U) {
    _.isVector4 ? j.set(_.x, _.y, _.z, _.w) : j.set(_, G, X, U), Q.scissor(L.copy(j).multiplyScalar(H).floor());
  }, this.getScissorTest = function () {
    return ie;
  }, this.setScissorTest = function (_) {
    Q.setScissorTest(ie = _);
  }, this.setOpaqueSort = function (_) {
    Z = _;
  }, this.setTransparentSort = function (_) {
    O = _;
  }, this.getClearColor = function (_) {
    return _.copy(q.getClearColor());
  }, this.setClearColor = function () {
    q.setClearColor.apply(q, arguments);
  }, this.getClearAlpha = function () {
    return q.getClearAlpha();
  }, this.setClearAlpha = function () {
    q.setClearAlpha.apply(q, arguments);
  }, this.clear = function (_ = !0, G = !0, X = !0) {
    let U = 0;
    _ && (U |= 16384), G && (U |= 256), X && (U |= 1024), W.clear(U);
  }, this.clearColor = function () {
    this.clear(!0, !1, !1);
  }, this.clearDepth = function () {
    this.clear(!1, !0, !1);
  }, this.clearStencil = function () {
    this.clear(!1, !1, !0);
  }, this.dispose = function () {
    e.removeEventListener("webglcontextlost", Ie, !1), e.removeEventListener("webglcontextrestored", De, !1), e.removeEventListener("webglcontextcreationerror", Ae, !1), it.dispose(), Dt.dispose(), k.dispose(), B.dispose(), fe.dispose(), Oe.dispose(), ye.dispose(), ee.dispose(), Ne.dispose(), Me.dispose(), Me.removeEventListener("sessionstart", ne), Me.removeEventListener("sessionend", ve), te && (te.dispose(), te = null), Te.stop();
  };
  function Ie(_) {
    _.preventDefault(), console.log("THREE.WebGLRenderer: Context Lost."), m = !0;
  }
  function De() {
    console.log("THREE.WebGLRenderer: Context Restored."), m = !1;
    let _ = K.autoReset,
      G = S.enabled,
      X = S.autoUpdate,
      U = S.needsUpdate,
      J = S.type;
    ze(), K.autoReset = _, S.enabled = G, S.autoUpdate = X, S.needsUpdate = U, S.type = J;
  }
  function Ae(_) {
    console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ", _.statusMessage);
  }
  function Qe(_) {
    let G = _.target;
    G.removeEventListener("dispose", Qe), ft(G);
  }
  function ft(_) {
    Ct(_), k.remove(_);
  }
  function Ct(_) {
    let G = k.get(_).programs;
    G !== void 0 && (G.forEach(function (X) {
      Ne.releaseProgram(X);
    }), _.isShaderMaterial && Ne.releaseShaderCache(_));
  }
  this.renderBufferDirect = function (_, G, X, U, J, Se) {
    G === null && (G = re);
    let ke = J.isMesh && J.matrixWorld.determinant() < 0,
      Ve = up(_, G, X, U, J);
    Q.setMaterial(U, ke);
    let je = X.index,
      nt = 1;
    U.wireframe === !0 && (je = Le.getWireframeAttribute(X), nt = 2);
    let $e = X.drawRange,
      Ze = X.attributes.position,
      Ut = $e.start * nt,
      rr = ($e.start + $e.count) * nt;
    Se !== null && (Ut = Math.max(Ut, Se.start * nt), rr = Math.min(rr, (Se.start + Se.count) * nt)), je !== null ? (Ut = Math.max(Ut, 0), rr = Math.min(rr, je.count)) : Ze != null && (Ut = Math.max(Ut, 0), rr = Math.min(rr, Ze.count));
    let Xr = rr - Ut;
    if (Xr < 0 || Xr === 1 / 0) return;
    ye.setup(J, U, Ve, X, je);
    let Ri,
      bt = he;
    if (je !== null && (Ri = ue.get(je), bt = ge, bt.setIndex(Ri)), J.isMesh) U.wireframe === !0 ? (Q.setLineWidth(U.wireframeLinewidth * de()), bt.setMode(1)) : bt.setMode(4);else if (J.isLine) {
      let Je = U.linewidth;
      Je === void 0 && (Je = 1), Q.setLineWidth(Je * de()), J.isLineSegments ? bt.setMode(1) : J.isLineLoop ? bt.setMode(2) : bt.setMode(3);
    } else J.isPoints ? bt.setMode(0) : J.isSprite && bt.setMode(4);
    if (J.isInstancedMesh) bt.renderInstances(Ut, Xr, J.count);else if (X.isInstancedBufferGeometry) {
      let Je = X._maxInstanceCount !== void 0 ? X._maxInstanceCount : 1 / 0,
        ho = Math.min(X.instanceCount, Je);
      bt.renderInstances(Ut, Xr, ho);
    } else bt.render(Ut, Xr);
  }, this.compile = function (_, G) {
    function X(U, J, Se) {
      U.transparent === !0 && U.side === Gr && U.forceSinglePass === !1 ? (U.side = or, U.needsUpdate = !0, ur(U, J, Se), U.side = wi, U.needsUpdate = !0, ur(U, J, Se), U.side = Gr) : ur(U, J, Se);
    }
    u = Dt.get(_), u.init(), g.push(u), _.traverseVisible(function (U) {
      U.isLight && U.layers.test(G.layers) && (u.pushLight(U), U.castShadow && u.pushShadow(U));
    }), u.setupLights(f.useLegacyLights), _.traverse(function (U) {
      let J = U.material;
      if (J) if (Array.isArray(J)) for (let Se = 0; Se < J.length; Se++) {
        let ke = J[Se];
        X(ke, _, U);
      } else X(J, _, U);
    }), g.pop(), u = null;
  };
  let D = null;
  function Y(_) {
    D && D(_);
  }
  function ne() {
    Te.stop();
  }
  function ve() {
    Te.start();
  }
  let Te = new Fu();
  Te.setAnimationLoop(Y), typeof self < "u" && Te.setContext(self), this.setAnimationLoop = function (_) {
    D = _, Me.setAnimationLoop(_), _ === null ? Te.stop() : Te.start();
  }, Me.addEventListener("sessionstart", ne), Me.addEventListener("sessionend", ve), this.render = function (_, G) {
    if (G !== void 0 && G.isCamera !== !0) {
      console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");
      return;
    }
    if (m === !0) return;
    _.matrixWorldAutoUpdate === !0 && _.updateMatrixWorld(), G.parent === null && G.matrixWorldAutoUpdate === !0 && G.updateMatrixWorld(), Me.enabled === !0 && Me.isPresenting === !0 && (Me.cameraAutoUpdate === !0 && Me.updateCamera(G), G = Me.getCamera()), _.isScene === !0 && _.onBeforeRender(f, _, G, x), u = Dt.get(_, g.length), u.init(), g.push(u), be.multiplyMatrices(G.projectionMatrix, G.matrixWorldInverse), oe.setFromProjectionMatrix(be), ae = this.localClippingEnabled, $ = E.init(this.clippingPlanes, ae), d = it.get(_, p.length), d.init(), p.push(d), ct(_, G, 0, f.sortObjects), d.finish(), f.sortObjects === !0 && d.sort(Z, O), $ === !0 && E.beginShadows();
    let X = u.state.shadowsArray;
    if (S.render(X, _, G), $ === !0 && E.endShadows(), this.info.autoReset === !0 && this.info.reset(), q.render(d, _), u.setupLights(f.useLegacyLights), G.isArrayCamera) {
      let U = G.cameras;
      for (let J = 0, Se = U.length; J < Se; J++) {
        let ke = U[J];
        Rt(d, _, ke, ke.viewport);
      }
    } else Rt(d, _, G);
    x !== null && (F.updateMultisampleRenderTarget(x), F.updateRenderTargetMipmap(x)), _.isScene === !0 && _.onAfterRender(f, _, G), ye.resetDefaultState(), b = -1, w = null, g.pop(), g.length > 0 ? u = g[g.length - 1] : u = null, p.pop(), p.length > 0 ? d = p[p.length - 1] : d = null;
  };
  function ct(_, G, X, U) {
    if (_.visible === !1) return;
    if (_.layers.test(G.layers)) {
      if (_.isGroup) X = _.renderOrder;else if (_.isLOD) _.autoUpdate === !0 && _.update(G);else if (_.isLight) u.pushLight(_), _.castShadow && u.pushShadow(_);else if (_.isSprite) {
        if (!_.frustumCulled || oe.intersectsSprite(_)) {
          U && V.setFromMatrixPosition(_.matrixWorld).applyMatrix4(be);
          let Se = Oe.update(_),
            ke = _.material;
          ke.visible && d.push(_, Se, ke, X, V.z, null);
        }
      } else if ((_.isMesh || _.isLine || _.isPoints) && (_.isSkinnedMesh && _.skeleton.frame !== K.render.frame && (_.skeleton.update(), _.skeleton.frame = K.render.frame), !_.frustumCulled || oe.intersectsObject(_))) {
        U && V.setFromMatrixPosition(_.matrixWorld).applyMatrix4(be);
        let Se = Oe.update(_),
          ke = _.material;
        if (Array.isArray(ke)) {
          let Ve = Se.groups;
          for (let je = 0, nt = Ve.length; je < nt; je++) {
            let $e = Ve[je],
              Ze = ke[$e.materialIndex];
            Ze && Ze.visible && d.push(_, Se, Ze, X, V.z, $e);
          }
        } else ke.visible && d.push(_, Se, ke, X, V.z, null);
      }
    }
    let J = _.children;
    for (let Se = 0, ke = J.length; Se < ke; Se++) ct(J[Se], G, X, U);
  }
  function Rt(_, G, X, U) {
    let J = _.opaque,
      Se = _.transmissive,
      ke = _.transparent;
    u.setupLightsView(X), $ === !0 && E.setGlobalState(f.clippingPlanes, X), Se.length > 0 && Ht(J, G, X), U && Q.viewport(A.copy(U)), J.length > 0 && zr(J, G, X), Se.length > 0 && zr(Se, G, X), ke.length > 0 && zr(ke, G, X), Q.buffers.depth.setTest(!0), Q.buffers.depth.setMask(!0), Q.buffers.color.setMask(!0), Q.setPolygonOffset(!1);
  }
  function Ht(_, G, X) {
    let U = N.isWebGL2;
    te === null && (te = new si(1024, 1024, {
      generateMipmaps: !0,
      type: P.has("EXT_color_buffer_half_float") ? ys : Xi,
      minFilter: qr,
      samples: U && s === !0 ? 4 : 0
    }));
    let J = f.getRenderTarget();
    f.setRenderTarget(te), f.clear();
    let Se = f.toneMapping;
    f.toneMapping = ri, zr(_, G, X), f.toneMapping = Se, F.updateMultisampleRenderTarget(te), F.updateRenderTargetMipmap(te), f.setRenderTarget(J);
  }
  function zr(_, G, X) {
    let U = G.isScene === !0 ? G.overrideMaterial : null;
    for (let J = 0, Se = _.length; J < Se; J++) {
      let ke = _[J],
        Ve = ke.object,
        je = ke.geometry,
        nt = U === null ? ke.material : U,
        $e = ke.group;
      Ve.layers.test(X.layers) && yt(Ve, G, X, je, nt, $e);
    }
  }
  function yt(_, G, X, U, J, Se) {
    _.onBeforeRender(f, G, X, U, J, Se), _.modelViewMatrix.multiplyMatrices(X.matrixWorldInverse, _.matrixWorld), _.normalMatrix.getNormalMatrix(_.modelViewMatrix), J.onBeforeRender(f, G, X, U, _, Se), J.transparent === !0 && J.side === Gr && J.forceSinglePass === !1 ? (J.side = or, J.needsUpdate = !0, f.renderBufferDirect(X, G, U, J, _, Se), J.side = wi, J.needsUpdate = !0, f.renderBufferDirect(X, G, U, J, _, Se), J.side = Gr) : f.renderBufferDirect(X, G, U, J, _, Se), _.onAfterRender(f, G, X, U, J, Se);
  }
  function ur(_, G, X) {
    G.isScene !== !0 && (G = re);
    let U = k.get(_),
      J = u.state.lights,
      Se = u.state.shadowsArray,
      ke = J.state.version,
      Ve = Ne.getParameters(_, J.state, Se, G, X),
      je = Ne.getProgramCacheKey(Ve),
      nt = U.programs;
    U.environment = _.isMeshStandardMaterial ? G.environment : null, U.fog = G.fog, U.envMap = (_.isMeshStandardMaterial ? fe : B).get(_.envMap || U.environment), nt === void 0 && (_.addEventListener("dispose", Qe), nt = new Map(), U.programs = nt);
    let $e = nt.get(je);
    if ($e !== void 0) {
      if (U.currentProgram === $e && U.lightsStateVersion === ke) return Ir(_, Ve), $e;
    } else Ve.uniforms = Ne.getUniforms(_), _.onBuild(X, Ve, f), _.onBeforeCompile(Ve, f), $e = Ne.acquireProgram(Ve, je), nt.set(je, $e), U.uniforms = Ve.uniforms;
    let Ze = U.uniforms;
    (!_.isShaderMaterial && !_.isRawShaderMaterial || _.clipping === !0) && (Ze.clippingPlanes = E.uniform), Ir(_, Ve), U.needsLights = pp(_), U.lightsStateVersion = ke, U.needsLights && (Ze.ambientLightColor.value = J.state.ambient, Ze.lightProbe.value = J.state.probe, Ze.directionalLights.value = J.state.directional, Ze.directionalLightShadows.value = J.state.directionalShadow, Ze.spotLights.value = J.state.spot, Ze.spotLightShadows.value = J.state.spotShadow, Ze.rectAreaLights.value = J.state.rectArea, Ze.ltc_1.value = J.state.rectAreaLTC1, Ze.ltc_2.value = J.state.rectAreaLTC2, Ze.pointLights.value = J.state.point, Ze.pointLightShadows.value = J.state.pointShadow, Ze.hemisphereLights.value = J.state.hemi, Ze.directionalShadowMap.value = J.state.directionalShadowMap, Ze.directionalShadowMatrix.value = J.state.directionalShadowMatrix, Ze.spotShadowMap.value = J.state.spotShadowMap, Ze.spotLightMatrix.value = J.state.spotLightMatrix, Ze.spotLightMap.value = J.state.spotLightMap, Ze.pointShadowMap.value = J.state.pointShadowMap, Ze.pointShadowMatrix.value = J.state.pointShadowMatrix);
    let Ut = $e.getUniforms(),
      rr = En.seqWithValue(Ut.seq, Ze);
    return U.currentProgram = $e, U.uniformsList = rr, $e;
  }
  function Ir(_, G) {
    let X = k.get(_);
    X.outputEncoding = G.outputEncoding, X.instancing = G.instancing, X.skinning = G.skinning, X.morphTargets = G.morphTargets, X.morphNormals = G.morphNormals, X.morphColors = G.morphColors, X.morphTargetsCount = G.morphTargetsCount, X.numClippingPlanes = G.numClippingPlanes, X.numIntersection = G.numClipIntersection, X.vertexAlphas = G.vertexAlphas, X.vertexTangents = G.vertexTangents, X.toneMapping = G.toneMapping;
  }
  function up(_, G, X, U, J) {
    G.isScene !== !0 && (G = re), F.resetTextureUnits();
    let Se = G.fog,
      ke = U.isMeshStandardMaterial ? G.environment : null,
      Ve = x === null ? f.outputEncoding : x.isXRRenderTarget === !0 ? x.texture.encoding : Yi,
      je = (U.isMeshStandardMaterial ? fe : B).get(U.envMap || ke),
      nt = U.vertexColors === !0 && !!X.attributes.color && X.attributes.color.itemSize === 4,
      $e = !!U.normalMap && !!X.attributes.tangent,
      Ze = !!X.morphAttributes.position,
      Ut = !!X.morphAttributes.normal,
      rr = !!X.morphAttributes.color,
      Xr = U.toneMapped ? f.toneMapping : ri,
      Ri = X.morphAttributes.position || X.morphAttributes.normal || X.morphAttributes.color,
      bt = Ri !== void 0 ? Ri.length : 0,
      Je = k.get(U),
      ho = u.state.lights;
    if ($ === !0 && (ae === !0 || _ !== w)) {
      let ir = _ === w && U.id === b;
      E.setState(U, _, ir);
    }
    let uo = !1;
    U.version === Je.__version ? (Je.needsLights && Je.lightsStateVersion !== ho.state.version || Je.outputEncoding !== Ve || J.isInstancedMesh && Je.instancing === !1 || !J.isInstancedMesh && Je.instancing === !0 || J.isSkinnedMesh && Je.skinning === !1 || !J.isSkinnedMesh && Je.skinning === !0 || Je.envMap !== je || U.fog === !0 && Je.fog !== Se || Je.numClippingPlanes !== void 0 && (Je.numClippingPlanes !== E.numPlanes || Je.numIntersection !== E.numIntersection) || Je.vertexAlphas !== nt || Je.vertexTangents !== $e || Je.morphTargets !== Ze || Je.morphNormals !== Ut || Je.morphColors !== rr || Je.toneMapping !== Xr || N.isWebGL2 === !0 && Je.morphTargetsCount !== bt) && (uo = !0) : (uo = !0, Je.__version = U.version);
    let Pi = Je.currentProgram;
    uo === !0 && (Pi = ur(U, G, J));
    let zl = !1,
      jn = !1,
      po = !1,
      jt = Pi.getUniforms(),
      Li = Je.uniforms;
    if (Q.useProgram(Pi.program) && (zl = !0, jn = !0, po = !0), U.id !== b && (b = U.id, jn = !0), zl || w !== _) {
      if (jt.setValue(W, "projectionMatrix", _.projectionMatrix), N.logarithmicDepthBuffer && jt.setValue(W, "logDepthBufFC", 2 / (Math.log(_.far + 1) / Math.LN2)), w !== _ && (w = _, jn = !0, po = !0), U.isShaderMaterial || U.isMeshPhongMaterial || U.isMeshToonMaterial || U.isMeshStandardMaterial || U.envMap) {
        let ir = jt.map.cameraPosition;
        ir !== void 0 && ir.setValue(W, V.setFromMatrixPosition(_.matrixWorld));
      }
      (U.isMeshPhongMaterial || U.isMeshToonMaterial || U.isMeshLambertMaterial || U.isMeshBasicMaterial || U.isMeshStandardMaterial || U.isShaderMaterial) && jt.setValue(W, "isOrthographic", _.isOrthographicCamera === !0), (U.isMeshPhongMaterial || U.isMeshToonMaterial || U.isMeshLambertMaterial || U.isMeshBasicMaterial || U.isMeshStandardMaterial || U.isShaderMaterial || U.isShadowMaterial || J.isSkinnedMesh) && jt.setValue(W, "viewMatrix", _.matrixWorldInverse);
    }
    if (J.isSkinnedMesh) {
      jt.setOptional(W, J, "bindMatrix"), jt.setOptional(W, J, "bindMatrixInverse");
      let ir = J.skeleton;
      ir && (N.floatVertexTextures ? (ir.boneTexture === null && ir.computeBoneTexture(), jt.setValue(W, "boneTexture", ir.boneTexture, F), jt.setValue(W, "boneTextureSize", ir.boneTextureSize)) : console.warn("THREE.WebGLRenderer: SkinnedMesh can only be used with WebGL 2. With WebGL 1 OES_texture_float and vertex textures support is required."));
    }
    let fo = X.morphAttributes;
    if ((fo.position !== void 0 || fo.normal !== void 0 || fo.color !== void 0 && N.isWebGL2 === !0) && le.update(J, X, Pi), (jn || Je.receiveShadow !== J.receiveShadow) && (Je.receiveShadow = J.receiveShadow, jt.setValue(W, "receiveShadow", J.receiveShadow)), U.isMeshGouraudMaterial && U.envMap !== null && (Li.envMap.value = je, Li.flipEnvMap.value = je.isCubeTexture && je.isRenderTargetTexture === !1 ? -1 : 1), jn && (jt.setValue(W, "toneMappingExposure", f.toneMappingExposure), Je.needsLights && dp(Li, po), Se && U.fog === !0 && Fe.refreshFogUniforms(Li, Se), Fe.refreshMaterialUniforms(Li, U, H, R, te), En.upload(W, Je.uniformsList, Li, F)), U.isShaderMaterial && U.uniformsNeedUpdate === !0 && (En.upload(W, Je.uniformsList, Li, F), U.uniformsNeedUpdate = !1), U.isSpriteMaterial && jt.setValue(W, "center", J.center), jt.setValue(W, "modelViewMatrix", J.modelViewMatrix), jt.setValue(W, "normalMatrix", J.normalMatrix), jt.setValue(W, "modelMatrix", J.matrixWorld), U.isShaderMaterial || U.isRawShaderMaterial) {
      let ir = U.uniformsGroups;
      for (let mo = 0, fp = ir.length; mo < fp; mo++) if (N.isWebGL2) {
        let Il = ir[mo];
        ee.update(Il, Pi), ee.bind(Il, Pi);
      } else console.warn("THREE.WebGLRenderer: Uniform Buffer Objects can only be used with WebGL 2.");
    }
    return Pi;
  }
  function dp(_, G) {
    _.ambientLightColor.needsUpdate = G, _.lightProbe.needsUpdate = G, _.directionalLights.needsUpdate = G, _.directionalLightShadows.needsUpdate = G, _.pointLights.needsUpdate = G, _.pointLightShadows.needsUpdate = G, _.spotLights.needsUpdate = G, _.spotLightShadows.needsUpdate = G, _.rectAreaLights.needsUpdate = G, _.hemisphereLights.needsUpdate = G;
  }
  function pp(_) {
    return _.isMeshLambertMaterial || _.isMeshToonMaterial || _.isMeshPhongMaterial || _.isMeshStandardMaterial || _.isShadowMaterial || _.isShaderMaterial && _.lights === !0;
  }
  this.getActiveCubeFace = function () {
    return v;
  }, this.getActiveMipmapLevel = function () {
    return y;
  }, this.getRenderTarget = function () {
    return x;
  }, this.setRenderTargetTextures = function (_, G, X) {
    k.get(_.texture).__webglTexture = G, k.get(_.depthTexture).__webglTexture = X;
    let U = k.get(_);
    U.__hasExternalTextures = !0, U.__hasExternalTextures && (U.__autoAllocateDepthBuffer = X === void 0, U.__autoAllocateDepthBuffer || P.has("WEBGL_multisampled_render_to_texture") === !0 && (console.warn("THREE.WebGLRenderer: Render-to-texture extension was disabled because an external texture was provided"), U.__useRenderToTexture = !1));
  }, this.setRenderTargetFramebuffer = function (_, G) {
    let X = k.get(_);
    X.__webglFramebuffer = G, X.__useDefaultFramebuffer = G === void 0;
  }, this.setRenderTarget = function (_, G = 0, X = 0) {
    x = _, v = G, y = X;
    let U = !0,
      J = null,
      Se = !1,
      ke = !1;
    if (_) {
      let Ve = k.get(_);
      Ve.__useDefaultFramebuffer !== void 0 ? (Q.bindFramebuffer(36160, null), U = !1) : Ve.__webglFramebuffer === void 0 ? F.setupRenderTarget(_) : Ve.__hasExternalTextures && F.rebindTextures(_, k.get(_.texture).__webglTexture, k.get(_.depthTexture).__webglTexture);
      let je = _.texture;
      (je.isData3DTexture || je.isDataArrayTexture || je.isCompressedArrayTexture) && (ke = !0);
      let nt = k.get(_).__webglFramebuffer;
      _.isWebGLCubeRenderTarget ? (J = nt[G], Se = !0) : N.isWebGL2 && _.samples > 0 && F.useMultisampledRTT(_) === !1 ? J = k.get(_).__webglMultisampledFramebuffer : J = nt, A.copy(_.viewport), L.copy(_.scissor), M = _.scissorTest;
    } else A.copy(z).multiplyScalar(H).floor(), L.copy(j).multiplyScalar(H).floor(), M = ie;
    if (Q.bindFramebuffer(36160, J) && N.drawBuffers && U && Q.drawBuffers(_, J), Q.viewport(A), Q.scissor(L), Q.setScissorTest(M), Se) {
      let Ve = k.get(_.texture);
      W.framebufferTexture2D(36160, 36064, 34069 + G, Ve.__webglTexture, X);
    } else if (ke) {
      let Ve = k.get(_.texture),
        je = G || 0;
      W.framebufferTextureLayer(36160, 36064, Ve.__webglTexture, X || 0, je);
    }
    b = -1;
  }, this.readRenderTargetPixels = function (_, G, X, U, J, Se, ke) {
    if (!(_ && _.isWebGLRenderTarget)) {
      console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");
      return;
    }
    let Ve = k.get(_).__webglFramebuffer;
    if (_.isWebGLCubeRenderTarget && ke !== void 0 && (Ve = Ve[ke]), Ve) {
      Q.bindFramebuffer(36160, Ve);
      try {
        let je = _.texture,
          nt = je.format,
          $e = je.type;
        if (nt !== Tr && _e.convert(nt) !== W.getParameter(35739)) {
          console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");
          return;
        }
        let Ze = $e === ys && (P.has("EXT_color_buffer_half_float") || N.isWebGL2 && P.has("EXT_color_buffer_float"));
        if ($e !== Xi && _e.convert($e) !== W.getParameter(35738) && !($e === Vi && (N.isWebGL2 || P.has("OES_texture_float") || P.has("WEBGL_color_buffer_float"))) && !Ze) {
          console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");
          return;
        }
        G >= 0 && G <= _.width - U && X >= 0 && X <= _.height - J && W.readPixels(G, X, U, J, _e.convert(nt), _e.convert($e), Se);
      } finally {
        let je = x !== null ? k.get(x).__webglFramebuffer : null;
        Q.bindFramebuffer(36160, je);
      }
    }
  }, this.copyFramebufferToTexture = function (_, G, X = 0) {
    let U = Math.pow(2, -X),
      J = Math.floor(G.image.width * U),
      Se = Math.floor(G.image.height * U);
    F.setTexture2D(G, 0), W.copyTexSubImage2D(3553, X, 0, 0, _.x, _.y, J, Se), Q.unbindTexture();
  }, this.copyTextureToTexture = function (_, G, X, U = 0) {
    let J = G.image.width,
      Se = G.image.height,
      ke = _e.convert(X.format),
      Ve = _e.convert(X.type);
    F.setTexture2D(X, 0), W.pixelStorei(37440, X.flipY), W.pixelStorei(37441, X.premultiplyAlpha), W.pixelStorei(3317, X.unpackAlignment), G.isDataTexture ? W.texSubImage2D(3553, U, _.x, _.y, J, Se, ke, Ve, G.image.data) : G.isCompressedTexture ? W.compressedTexSubImage2D(3553, U, _.x, _.y, G.mipmaps[0].width, G.mipmaps[0].height, ke, G.mipmaps[0].data) : W.texSubImage2D(3553, U, _.x, _.y, ke, Ve, G.image), U === 0 && X.generateMipmaps && W.generateMipmap(3553), Q.unbindTexture();
  }, this.copyTextureToTexture3D = function (_, G, X, U, J = 0) {
    if (f.isWebGL1Renderer) {
      console.warn("THREE.WebGLRenderer.copyTextureToTexture3D: can only be used with WebGL2.");
      return;
    }
    let Se = _.max.x - _.min.x + 1,
      ke = _.max.y - _.min.y + 1,
      Ve = _.max.z - _.min.z + 1,
      je = _e.convert(U.format),
      nt = _e.convert(U.type),
      $e;
    if (U.isData3DTexture) F.setTexture3D(U, 0), $e = 32879;else if (U.isDataArrayTexture) F.setTexture2DArray(U, 0), $e = 35866;else {
      console.warn("THREE.WebGLRenderer.copyTextureToTexture3D: only supports THREE.DataTexture3D and THREE.DataTexture2DArray.");
      return;
    }
    W.pixelStorei(37440, U.flipY), W.pixelStorei(37441, U.premultiplyAlpha), W.pixelStorei(3317, U.unpackAlignment);
    let Ze = W.getParameter(3314),
      Ut = W.getParameter(32878),
      rr = W.getParameter(3316),
      Xr = W.getParameter(3315),
      Ri = W.getParameter(32877),
      bt = X.isCompressedTexture ? X.mipmaps[0] : X.image;
    W.pixelStorei(3314, bt.width), W.pixelStorei(32878, bt.height), W.pixelStorei(3316, _.min.x), W.pixelStorei(3315, _.min.y), W.pixelStorei(32877, _.min.z), X.isDataTexture || X.isData3DTexture ? W.texSubImage3D($e, J, G.x, G.y, G.z, Se, ke, Ve, je, nt, bt.data) : X.isCompressedArrayTexture ? (console.warn("THREE.WebGLRenderer.copyTextureToTexture3D: untested support for compressed srcTexture."), W.compressedTexSubImage3D($e, J, G.x, G.y, G.z, Se, ke, Ve, je, bt.data)) : W.texSubImage3D($e, J, G.x, G.y, G.z, Se, ke, Ve, je, nt, bt), W.pixelStorei(3314, Ze), W.pixelStorei(32878, Ut), W.pixelStorei(3316, rr), W.pixelStorei(3315, Xr), W.pixelStorei(32877, Ri), J === 0 && U.generateMipmaps && W.generateMipmap($e), Q.unbindTexture();
  }, this.initTexture = function (_) {
    _.isCubeTexture ? F.setTextureCube(_, 0) : _.isData3DTexture ? F.setTexture3D(_, 0) : _.isDataArrayTexture || _.isCompressedArrayTexture ? F.setTexture2DArray(_, 0) : F.setTexture2D(_, 0), Q.unbindTexture();
  }, this.resetState = function () {
    v = 0, y = 0, x = null, Q.reset(), ye.reset();
  }, typeof __THREE_DEVTOOLS__ < "u" && __THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe", {
    detail: this
  }));
}
Object.defineProperties(no.prototype, {
  physicallyCorrectLights: {
    get: function () {
      return console.warn("THREE.WebGLRenderer: the property .physicallyCorrectLights has been removed. Set renderer.useLegacyLights instead."), !this.useLegacyLights;
    },
    set: function (i) {
      console.warn("THREE.WebGLRenderer: the property .physicallyCorrectLights has been removed. Set renderer.useLegacyLights instead."), this.useLegacyLights = !i;
    }
  }
});
var Lc = class extends no {};
Lc.prototype.isWebGL1Renderer = !0;
var ka = class i {
    constructor(e, t = 1, r = 1e3) {
      this.isFog = !0, this.name = "", this.color = new He(e), this.near = t, this.far = r;
    }
    clone() {
      return new i(this.color, this.near, this.far);
    }
    toJSON() {
      return {
        type: "Fog",
        color: this.color.getHex(),
        near: this.near,
        far: this.far
      };
    }
  },
  Ss = class extends kt {
    constructor() {
      super(), this.isScene = !0, this.type = "Scene", this.background = null, this.environment = null, this.fog = null, this.backgroundBlurriness = 0, this.backgroundIntensity = 1, this.overrideMaterial = null, typeof __THREE_DEVTOOLS__ < "u" && __THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe", {
        detail: this
      }));
    }
    copy(e, t) {
      return super.copy(e, t), e.background !== null && (this.background = e.background.clone()), e.environment !== null && (this.environment = e.environment.clone()), e.fog !== null && (this.fog = e.fog.clone()), this.backgroundBlurriness = e.backgroundBlurriness, this.backgroundIntensity = e.backgroundIntensity, e.overrideMaterial !== null && (this.overrideMaterial = e.overrideMaterial.clone()), this.matrixAutoUpdate = e.matrixAutoUpdate, this;
    }
    toJSON(e) {
      let t = super.toJSON(e);
      return this.fog !== null && (t.object.fog = this.fog.toJSON()), this.backgroundBlurriness > 0 && (t.object.backgroundBlurriness = this.backgroundBlurriness), this.backgroundIntensity !== 1 && (t.object.backgroundIntensity = this.backgroundIntensity), t;
    }
    get autoUpdate() {
      return console.warn("THREE.Scene: autoUpdate was renamed to matrixWorldAutoUpdate in r144."), this.matrixWorldAutoUpdate;
    }
    set autoUpdate(e) {
      console.warn("THREE.Scene: autoUpdate was renamed to matrixWorldAutoUpdate in r144."), this.matrixWorldAutoUpdate = e;
    }
  },
  Dc = class {
    constructor(e, t) {
      this.isInterleavedBuffer = !0, this.array = e, this.stride = t, this.count = e !== void 0 ? e.length / t : 0, this.usage = mc, this.updateRange = {
        offset: 0,
        count: -1
      }, this.version = 0, this.uuid = ii();
    }
    onUploadCallback() {}
    set needsUpdate(e) {
      e === !0 && this.version++;
    }
    setUsage(e) {
      return this.usage = e, this;
    }
    copy(e) {
      return this.array = new e.array.constructor(e.array), this.count = e.count, this.stride = e.stride, this.usage = e.usage, this;
    }
    copyAt(e, t, r) {
      e *= this.stride, r *= t.stride;
      for (let n = 0, s = this.stride; n < s; n++) this.array[e + n] = t.array[r + n];
      return this;
    }
    set(e, t = 0) {
      return this.array.set(e, t), this;
    }
    clone(e) {
      e.arrayBuffers === void 0 && (e.arrayBuffers = {}), this.array.buffer._uuid === void 0 && (this.array.buffer._uuid = ii()), e.arrayBuffers[this.array.buffer._uuid] === void 0 && (e.arrayBuffers[this.array.buffer._uuid] = this.array.slice(0).buffer);
      let t = new this.array.constructor(e.arrayBuffers[this.array.buffer._uuid]),
        r = new this.constructor(t, this.stride);
      return r.setUsage(this.usage), r;
    }
    onUpload(e) {
      return this.onUploadCallback = e, this;
    }
    toJSON(e) {
      return e.arrayBuffers === void 0 && (e.arrayBuffers = {}), this.array.buffer._uuid === void 0 && (this.array.buffer._uuid = ii()), e.arrayBuffers[this.array.buffer._uuid] === void 0 && (e.arrayBuffers[this.array.buffer._uuid] = Array.from(new Uint32Array(this.array.buffer))), {
        uuid: this.uuid,
        buffer: this.array.buffer._uuid,
        type: this.array.constructor.name,
        stride: this.stride
      };
    }
  },
  Xt = new C(),
  Ua = class i {
    constructor(e, t, r, n = !1) {
      this.isInterleavedBufferAttribute = !0, this.name = "", this.data = e, this.itemSize = t, this.offset = r, this.normalized = n;
    }
    get count() {
      return this.data.count;
    }
    get array() {
      return this.data.array;
    }
    set needsUpdate(e) {
      this.data.needsUpdate = e;
    }
    applyMatrix4(e) {
      for (let t = 0, r = this.data.count; t < r; t++) Xt.fromBufferAttribute(this, t), Xt.applyMatrix4(e), this.setXYZ(t, Xt.x, Xt.y, Xt.z);
      return this;
    }
    applyNormalMatrix(e) {
      for (let t = 0, r = this.count; t < r; t++) Xt.fromBufferAttribute(this, t), Xt.applyNormalMatrix(e), this.setXYZ(t, Xt.x, Xt.y, Xt.z);
      return this;
    }
    transformDirection(e) {
      for (let t = 0, r = this.count; t < r; t++) Xt.fromBufferAttribute(this, t), Xt.transformDirection(e), this.setXYZ(t, Xt.x, Xt.y, Xt.z);
      return this;
    }
    setX(e, t) {
      return this.normalized && (t = ot(t, this.array)), this.data.array[e * this.data.stride + this.offset] = t, this;
    }
    setY(e, t) {
      return this.normalized && (t = ot(t, this.array)), this.data.array[e * this.data.stride + this.offset + 1] = t, this;
    }
    setZ(e, t) {
      return this.normalized && (t = ot(t, this.array)), this.data.array[e * this.data.stride + this.offset + 2] = t, this;
    }
    setW(e, t) {
      return this.normalized && (t = ot(t, this.array)), this.data.array[e * this.data.stride + this.offset + 3] = t, this;
    }
    getX(e) {
      let t = this.data.array[e * this.data.stride + this.offset];
      return this.normalized && (t = vi(t, this.array)), t;
    }
    getY(e) {
      let t = this.data.array[e * this.data.stride + this.offset + 1];
      return this.normalized && (t = vi(t, this.array)), t;
    }
    getZ(e) {
      let t = this.data.array[e * this.data.stride + this.offset + 2];
      return this.normalized && (t = vi(t, this.array)), t;
    }
    getW(e) {
      let t = this.data.array[e * this.data.stride + this.offset + 3];
      return this.normalized && (t = vi(t, this.array)), t;
    }
    setXY(e, t, r) {
      return e = e * this.data.stride + this.offset, this.normalized && (t = ot(t, this.array), r = ot(r, this.array)), this.data.array[e + 0] = t, this.data.array[e + 1] = r, this;
    }
    setXYZ(e, t, r, n) {
      return e = e * this.data.stride + this.offset, this.normalized && (t = ot(t, this.array), r = ot(r, this.array), n = ot(n, this.array)), this.data.array[e + 0] = t, this.data.array[e + 1] = r, this.data.array[e + 2] = n, this;
    }
    setXYZW(e, t, r, n, s) {
      return e = e * this.data.stride + this.offset, this.normalized && (t = ot(t, this.array), r = ot(r, this.array), n = ot(n, this.array), s = ot(s, this.array)), this.data.array[e + 0] = t, this.data.array[e + 1] = r, this.data.array[e + 2] = n, this.data.array[e + 3] = s, this;
    }
    clone(e) {
      if (e === void 0) {
        console.log("THREE.InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");
        let t = [];
        for (let r = 0; r < this.count; r++) {
          let n = r * this.data.stride + this.offset;
          for (let s = 0; s < this.itemSize; s++) t.push(this.data.array[n + s]);
        }
        return new Qt(new this.array.constructor(t), this.itemSize, this.normalized);
      } else return e.interleavedBuffers === void 0 && (e.interleavedBuffers = {}), e.interleavedBuffers[this.data.uuid] === void 0 && (e.interleavedBuffers[this.data.uuid] = this.data.clone(e)), new i(e.interleavedBuffers[this.data.uuid], this.itemSize, this.offset, this.normalized);
    }
    toJSON(e) {
      if (e === void 0) {
        console.log("THREE.InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");
        let t = [];
        for (let r = 0; r < this.count; r++) {
          let n = r * this.data.stride + this.offset;
          for (let s = 0; s < this.itemSize; s++) t.push(this.data.array[n + s]);
        }
        return {
          itemSize: this.itemSize,
          type: this.array.constructor.name,
          array: t,
          normalized: this.normalized
        };
      } else return e.interleavedBuffers === void 0 && (e.interleavedBuffers = {}), e.interleavedBuffers[this.data.uuid] === void 0 && (e.interleavedBuffers[this.data.uuid] = this.data.toJSON(e)), {
        isInterleavedBufferAttribute: !0,
        itemSize: this.itemSize,
        data: this.data.uuid,
        offset: this.offset,
        normalized: this.normalized
      };
    }
  },
  Fa = class extends ai {
    constructor(e) {
      super(), this.isSpriteMaterial = !0, this.type = "SpriteMaterial", this.color = new He(16777215), this.map = null, this.alphaMap = null, this.rotation = 0, this.sizeAttenuation = !0, this.transparent = !0, this.fog = !0, this.setValues(e);
    }
    copy(e) {
      return super.copy(e), this.color.copy(e.color), this.map = e.map, this.alphaMap = e.alphaMap, this.rotation = e.rotation, this.sizeAttenuation = e.sizeAttenuation, this.fog = e.fog, this;
    }
  },
  gn,
  $n = new C(),
  vn = new C(),
  xn = new C(),
  yn = new se(),
  es = new se(),
  Hu = new at(),
  ra = new C(),
  ts = new C(),
  ia = new C(),
  qh = new se(),
  Xo = new se(),
  Xh = new se(),
  zc = class extends kt {
    constructor(e) {
      if (super(), this.isSprite = !0, this.type = "Sprite", gn === void 0) {
        gn = new Tt();
        let t = new Float32Array([-0.5, -0.5, 0, 0, 0, 0.5, -0.5, 0, 1, 0, 0.5, 0.5, 0, 1, 1, -0.5, 0.5, 0, 0, 1]),
          r = new Dc(t, 5);
        gn.setIndex([0, 1, 2, 0, 2, 3]), gn.setAttribute("position", new Ua(r, 3, 0, !1)), gn.setAttribute("uv", new Ua(r, 2, 3, !1));
      }
      this.geometry = gn, this.material = e !== void 0 ? e : new Fa(), this.center = new se(0.5, 0.5);
    }
    raycast(e, t) {
      e.camera === null && console.error('THREE.Sprite: "Raycaster.camera" needs to be set in order to raycast against sprites.'), vn.setFromMatrixScale(this.matrixWorld), Hu.copy(e.camera.matrixWorld), this.modelViewMatrix.multiplyMatrices(e.camera.matrixWorldInverse, this.matrixWorld), xn.setFromMatrixPosition(this.modelViewMatrix), e.camera.isPerspectiveCamera && this.material.sizeAttenuation === !1 && vn.multiplyScalar(-xn.z);
      let r = this.material.rotation,
        n,
        s;
      r !== 0 && (s = Math.cos(r), n = Math.sin(r));
      let o = this.center;
      na(ra.set(-0.5, -0.5, 0), xn, o, vn, n, s), na(ts.set(0.5, -0.5, 0), xn, o, vn, n, s), na(ia.set(0.5, 0.5, 0), xn, o, vn, n, s), qh.set(0, 0), Xo.set(1, 0), Xh.set(1, 1);
      let a = e.ray.intersectTriangle(ra, ts, ia, !1, $n);
      if (a === null && (na(ts.set(-0.5, 0.5, 0), xn, o, vn, n, s), Xo.set(0, 1), a = e.ray.intersectTriangle(ra, ia, ts, !1, $n), a === null)) return;
      let l = e.ray.origin.distanceTo($n);
      l < e.near || l > e.far || t.push({
        distance: l,
        point: $n.clone(),
        uv: Tn.getUV($n, ra, ts, ia, qh, Xo, Xh, new se()),
        face: null,
        object: this
      });
    }
    copy(e, t) {
      return super.copy(e, t), e.center !== void 0 && this.center.copy(e.center), this.material = e.material, this;
    }
  };
function na(i, e, t, r, n, s) {
  yn.subVectors(i, t).addScalar(0.5).multiply(r), n !== void 0 ? (es.x = s * yn.x - n * yn.y, es.y = n * yn.x + s * yn.y) : es.copy(yn), i.copy(e), i.x += es.x, i.y += es.y, i.applyMatrix4(Hu);
}
var Ba = class extends Qt {
    constructor(e, t, r, n = 1) {
      super(e, t, r), this.isInstancedBufferAttribute = !0, this.meshPerAttribute = n;
    }
    copy(e) {
      return super.copy(e), this.meshPerAttribute = e.meshPerAttribute, this;
    }
    toJSON() {
      let e = super.toJSON();
      return e.meshPerAttribute = this.meshPerAttribute, e.isInstancedBufferAttribute = !0, e;
    }
  },
  Yh = new at(),
  Zh = new at(),
  sa = [],
  i1 = new at(),
  rs = new pt(),
  Ic = class extends pt {
    constructor(e, t, r) {
      super(e, t), this.isInstancedMesh = !0, this.instanceMatrix = new Ba(new Float32Array(r * 16), 16), this.instanceColor = null, this.count = r, this.frustumCulled = !1;
      for (let n = 0; n < r; n++) this.setMatrixAt(n, i1);
    }
    copy(e, t) {
      return super.copy(e, t), this.instanceMatrix.copy(e.instanceMatrix), e.instanceColor !== null && (this.instanceColor = e.instanceColor.clone()), this.count = e.count, this;
    }
    getColorAt(e, t) {
      t.fromArray(this.instanceColor.array, e * 3);
    }
    getMatrixAt(e, t) {
      t.fromArray(this.instanceMatrix.array, e * 16);
    }
    raycast(e, t) {
      let r = this.matrixWorld,
        n = this.count;
      if (rs.geometry = this.geometry, rs.material = this.material, rs.material !== void 0) for (let s = 0; s < n; s++) {
        this.getMatrixAt(s, Yh), Zh.multiplyMatrices(r, Yh), rs.matrixWorld = Zh, rs.raycast(e, sa);
        for (let o = 0, a = sa.length; o < a; o++) {
          let l = sa[o];
          l.instanceId = s, l.object = this, t.push(l);
        }
        sa.length = 0;
      }
    }
    setColorAt(e, t) {
      this.instanceColor === null && (this.instanceColor = new Ba(new Float32Array(this.instanceMatrix.count * 3), 3)), t.toArray(this.instanceColor.array, e * 3);
    }
    setMatrixAt(e, t) {
      t.toArray(this.instanceMatrix.array, e * 16);
    }
    updateMorphTargets() {}
    dispose() {
      this.dispatchEvent({
        type: "dispose"
      });
    }
  },
  Ga = class extends ai {
    constructor(e) {
      super(), this.isPointsMaterial = !0, this.type = "PointsMaterial", this.color = new He(16777215), this.map = null, this.alphaMap = null, this.size = 1, this.sizeAttenuation = !0, this.fog = !0, this.setValues(e);
    }
    copy(e) {
      return super.copy(e), this.color.copy(e.color), this.map = e.map, this.alphaMap = e.alphaMap, this.size = e.size, this.sizeAttenuation = e.sizeAttenuation, this.fog = e.fog, this;
    }
  },
  Jh = new at(),
  Oc = new Ca(),
  aa = new zn(),
  oa = new C(),
  Nc = class extends kt {
    constructor(e = new Tt(), t = new Ga()) {
      super(), this.isPoints = !0, this.type = "Points", this.geometry = e, this.material = t, this.updateMorphTargets();
    }
    copy(e, t) {
      return super.copy(e, t), this.material = e.material, this.geometry = e.geometry, this;
    }
    raycast(e, t) {
      let r = this.geometry,
        n = this.matrixWorld,
        s = e.params.Points.threshold,
        o = r.drawRange;
      if (r.boundingSphere === null && r.computeBoundingSphere(), aa.copy(r.boundingSphere), aa.applyMatrix4(n), aa.radius += s, e.ray.intersectsSphere(aa) === !1) return;
      Jh.copy(n).invert(), Oc.copy(e.ray).applyMatrix4(Jh);
      let a = s / ((this.scale.x + this.scale.y + this.scale.z) / 3),
        l = a * a,
        c = r.index,
        h = r.attributes.position;
      if (c !== null) {
        let d = Math.max(0, o.start),
          u = Math.min(c.count, o.start + o.count);
        for (let p = d, g = u; p < g; p++) {
          let f = c.getX(p);
          oa.fromBufferAttribute(h, f), Kh(oa, f, l, n, e, t, this);
        }
      } else {
        let d = Math.max(0, o.start),
          u = Math.min(h.count, o.start + o.count);
        for (let p = d, g = u; p < g; p++) oa.fromBufferAttribute(h, p), Kh(oa, p, l, n, e, t, this);
      }
    }
    updateMorphTargets() {
      let e = this.geometry.morphAttributes,
        t = Object.keys(e);
      if (t.length > 0) {
        let r = e[t[0]];
        if (r !== void 0) {
          this.morphTargetInfluences = [], this.morphTargetDictionary = {};
          for (let n = 0, s = r.length; n < s; n++) {
            let o = r[n].name || String(n);
            this.morphTargetInfluences.push(0), this.morphTargetDictionary[o] = n;
          }
        }
      }
    }
  };
function Kh(i, e, t, r, n, s, o) {
  let a = Oc.distanceSqToPoint(i);
  if (a < t) {
    let l = new C();
    Oc.closestPointToPoint(i, l), l.applyMatrix4(r);
    let c = n.ray.origin.distanceTo(l);
    if (c < n.near || c > n.far) return;
    s.push({
      distance: c,
      distanceToRay: Math.sqrt(a),
      point: l,
      index: e,
      face: null,
      object: o
    });
  }
}
var lr = class extends vr {
    constructor(e, t, r, n, s, o, a, l, c) {
      super(e, t, r, n, s, o, a, l, c), this.isCanvasTexture = !0, this.needsUpdate = !0;
    }
  },
  xr = class {
    constructor() {
      this.type = "Curve", this.arcLengthDivisions = 200;
    }
    getPoint() {
      return console.warn("THREE.Curve: .getPoint() not implemented."), null;
    }
    getPointAt(e, t) {
      let r = this.getUtoTmapping(e);
      return this.getPoint(r, t);
    }
    getPoints(e = 5) {
      let t = [];
      for (let r = 0; r <= e; r++) t.push(this.getPoint(r / e));
      return t;
    }
    getSpacedPoints(e = 5) {
      let t = [];
      for (let r = 0; r <= e; r++) t.push(this.getPointAt(r / e));
      return t;
    }
    getLength() {
      let e = this.getLengths();
      return e[e.length - 1];
    }
    getLengths(e = this.arcLengthDivisions) {
      if (this.cacheArcLengths && this.cacheArcLengths.length === e + 1 && !this.needsUpdate) return this.cacheArcLengths;
      this.needsUpdate = !1;
      let t = [],
        r,
        n = this.getPoint(0),
        s = 0;
      t.push(0);
      for (let o = 1; o <= e; o++) r = this.getPoint(o / e), s += r.distanceTo(n), t.push(s), n = r;
      return this.cacheArcLengths = t, t;
    }
    updateArcLengths() {
      this.needsUpdate = !0, this.getLengths();
    }
    getUtoTmapping(e, t) {
      let r = this.getLengths(),
        n = 0,
        s = r.length,
        o;
      t ? o = t : o = e * r[s - 1];
      let a = 0,
        l = s - 1,
        c;
      for (; a <= l;) if (n = Math.floor(a + (l - a) / 2), c = r[n] - o, c < 0) a = n + 1;else if (c > 0) l = n - 1;else {
        l = n;
        break;
      }
      if (n = l, r[n] === o) return n / (s - 1);
      let h = r[n],
        d = r[n + 1] - h,
        u = (o - h) / d;
      return (n + u) / (s - 1);
    }
    getTangent(e, t) {
      let r = e - 1e-4,
        n = e + 1e-4;
      r < 0 && (r = 0), n > 1 && (n = 1);
      let s = this.getPoint(r),
        o = this.getPoint(n),
        a = t || (s.isVector2 ? new se() : new C());
      return a.copy(o).sub(s).normalize(), a;
    }
    getTangentAt(e, t) {
      let r = this.getUtoTmapping(e);
      return this.getTangent(r, t);
    }
    computeFrenetFrames(e, t) {
      let r = new C(),
        n = [],
        s = [],
        o = [],
        a = new C(),
        l = new at();
      for (let p = 0; p <= e; p++) {
        let g = p / e;
        n[p] = this.getTangentAt(g, new C());
      }
      s[0] = new C(), o[0] = new C();
      let c = Number.MAX_VALUE,
        h = Math.abs(n[0].x),
        d = Math.abs(n[0].y),
        u = Math.abs(n[0].z);
      h <= c && (c = h, r.set(1, 0, 0)), d <= c && (c = d, r.set(0, 1, 0)), u <= c && r.set(0, 0, 1), a.crossVectors(n[0], r).normalize(), s[0].crossVectors(n[0], a), o[0].crossVectors(n[0], s[0]);
      for (let p = 1; p <= e; p++) {
        if (s[p] = s[p - 1].clone(), o[p] = o[p - 1].clone(), a.crossVectors(n[p - 1], n[p]), a.length() > Number.EPSILON) {
          a.normalize();
          let g = Math.acos(Vt(n[p - 1].dot(n[p]), -1, 1));
          s[p].applyMatrix4(l.makeRotationAxis(a, g));
        }
        o[p].crossVectors(n[p], s[p]);
      }
      if (t === !0) {
        let p = Math.acos(Vt(s[0].dot(s[e]), -1, 1));
        p /= e, n[0].dot(a.crossVectors(s[0], s[e])) > 0 && (p = -p);
        for (let g = 1; g <= e; g++) s[g].applyMatrix4(l.makeRotationAxis(n[g], p * g)), o[g].crossVectors(n[g], s[g]);
      }
      return {
        tangents: n,
        normals: s,
        binormals: o
      };
    }
    clone() {
      return new this.constructor().copy(this);
    }
    copy(e) {
      return this.arcLengthDivisions = e.arcLengthDivisions, this;
    }
    toJSON() {
      let e = {
        metadata: {
          version: 4.5,
          type: "Curve",
          generator: "Curve.toJSON"
        }
      };
      return e.arcLengthDivisions = this.arcLengthDivisions, e.type = this.type, e;
    }
    fromJSON(e) {
      return this.arcLengthDivisions = e.arcLengthDivisions, this;
    }
  },
  ws = class extends xr {
    constructor(e = 0, t = 0, r = 1, n = 1, s = 0, o = Math.PI * 2, a = !1, l = 0) {
      super(), this.isEllipseCurve = !0, this.type = "EllipseCurve", this.aX = e, this.aY = t, this.xRadius = r, this.yRadius = n, this.aStartAngle = s, this.aEndAngle = o, this.aClockwise = a, this.aRotation = l;
    }
    getPoint(e, t) {
      let r = t || new se(),
        n = Math.PI * 2,
        s = this.aEndAngle - this.aStartAngle,
        o = Math.abs(s) < Number.EPSILON;
      for (; s < 0;) s += n;
      for (; s > n;) s -= n;
      s < Number.EPSILON && (o ? s = 0 : s = n), this.aClockwise === !0 && !o && (s === n ? s = -n : s = s - n);
      let a = this.aStartAngle + e * s,
        l = this.aX + this.xRadius * Math.cos(a),
        c = this.aY + this.yRadius * Math.sin(a);
      if (this.aRotation !== 0) {
        let h = Math.cos(this.aRotation),
          d = Math.sin(this.aRotation),
          u = l - this.aX,
          p = c - this.aY;
        l = u * h - p * d + this.aX, c = u * d + p * h + this.aY;
      }
      return r.set(l, c);
    }
    copy(e) {
      return super.copy(e), this.aX = e.aX, this.aY = e.aY, this.xRadius = e.xRadius, this.yRadius = e.yRadius, this.aStartAngle = e.aStartAngle, this.aEndAngle = e.aEndAngle, this.aClockwise = e.aClockwise, this.aRotation = e.aRotation, this;
    }
    toJSON() {
      let e = super.toJSON();
      return e.aX = this.aX, e.aY = this.aY, e.xRadius = this.xRadius, e.yRadius = this.yRadius, e.aStartAngle = this.aStartAngle, e.aEndAngle = this.aEndAngle, e.aClockwise = this.aClockwise, e.aRotation = this.aRotation, e;
    }
    fromJSON(e) {
      return super.fromJSON(e), this.aX = e.aX, this.aY = e.aY, this.xRadius = e.xRadius, this.yRadius = e.yRadius, this.aStartAngle = e.aStartAngle, this.aEndAngle = e.aEndAngle, this.aClockwise = e.aClockwise, this.aRotation = e.aRotation, this;
    }
  },
  kc = class extends ws {
    constructor(e, t, r, n, s, o) {
      super(e, t, r, r, n, s, o), this.isArcCurve = !0, this.type = "ArcCurve";
    }
  };
function xl() {
  let i = 0,
    e = 0,
    t = 0,
    r = 0;
  function n(s, o, a, l) {
    i = s, e = a, t = -3 * s + 3 * o - 2 * a - l, r = 2 * s - 2 * o + a + l;
  }
  return {
    initCatmullRom: function (s, o, a, l, c) {
      n(o, a, c * (a - s), c * (l - o));
    },
    initNonuniformCatmullRom: function (s, o, a, l, c, h, d) {
      let u = (o - s) / c - (a - s) / (c + h) + (a - o) / h,
        p = (a - o) / h - (l - o) / (h + d) + (l - a) / d;
      u *= h, p *= h, n(o, a, u, p);
    },
    calc: function (s) {
      let o = s * s,
        a = o * s;
      return i + e * s + t * o + r * a;
    }
  };
}
var ca = new C(),
  Yo = new xl(),
  Zo = new xl(),
  Jo = new xl(),
  Uc = class extends xr {
    constructor(e = [], t = !1, r = "centripetal", n = 0.5) {
      super(), this.isCatmullRomCurve3 = !0, this.type = "CatmullRomCurve3", this.points = e, this.closed = t, this.curveType = r, this.tension = n;
    }
    getPoint(e, t = new C()) {
      let r = t,
        n = this.points,
        s = n.length,
        o = (s - (this.closed ? 0 : 1)) * e,
        a = Math.floor(o),
        l = o - a;
      this.closed ? a += a > 0 ? 0 : (Math.floor(Math.abs(a) / s) + 1) * s : l === 0 && a === s - 1 && (a = s - 2, l = 1);
      let c, h;
      this.closed || a > 0 ? c = n[(a - 1) % s] : (ca.subVectors(n[0], n[1]).add(n[0]), c = ca);
      let d = n[a % s],
        u = n[(a + 1) % s];
      if (this.closed || a + 2 < s ? h = n[(a + 2) % s] : (ca.subVectors(n[s - 1], n[s - 2]).add(n[s - 1]), h = ca), this.curveType === "centripetal" || this.curveType === "chordal") {
        let p = this.curveType === "chordal" ? 0.5 : 0.25,
          g = Math.pow(c.distanceToSquared(d), p),
          f = Math.pow(d.distanceToSquared(u), p),
          m = Math.pow(u.distanceToSquared(h), p);
        f < 1e-4 && (f = 1), g < 1e-4 && (g = f), m < 1e-4 && (m = f), Yo.initNonuniformCatmullRom(c.x, d.x, u.x, h.x, g, f, m), Zo.initNonuniformCatmullRom(c.y, d.y, u.y, h.y, g, f, m), Jo.initNonuniformCatmullRom(c.z, d.z, u.z, h.z, g, f, m);
      } else this.curveType === "catmullrom" && (Yo.initCatmullRom(c.x, d.x, u.x, h.x, this.tension), Zo.initCatmullRom(c.y, d.y, u.y, h.y, this.tension), Jo.initCatmullRom(c.z, d.z, u.z, h.z, this.tension));
      return r.set(Yo.calc(l), Zo.calc(l), Jo.calc(l)), r;
    }
    copy(e) {
      super.copy(e), this.points = [];
      for (let t = 0, r = e.points.length; t < r; t++) {
        let n = e.points[t];
        this.points.push(n.clone());
      }
      return this.closed = e.closed, this.curveType = e.curveType, this.tension = e.tension, this;
    }
    toJSON() {
      let e = super.toJSON();
      e.points = [];
      for (let t = 0, r = this.points.length; t < r; t++) {
        let n = this.points[t];
        e.points.push(n.toArray());
      }
      return e.closed = this.closed, e.curveType = this.curveType, e.tension = this.tension, e;
    }
    fromJSON(e) {
      super.fromJSON(e), this.points = [];
      for (let t = 0, r = e.points.length; t < r; t++) {
        let n = e.points[t];
        this.points.push(new C().fromArray(n));
      }
      return this.closed = e.closed, this.curveType = e.curveType, this.tension = e.tension, this;
    }
  };
function Qh(i, e, t, r, n) {
  let s = (r - e) * 0.5,
    o = (n - t) * 0.5,
    a = i * i,
    l = i * a;
  return (2 * t - 2 * r + s + o) * l + (-3 * t + 3 * r - 2 * s - o) * a + s * i + t;
}
function n1(i, e) {
  let t = 1 - i;
  return t * t * e;
}
function s1(i, e) {
  return 2 * (1 - i) * i * e;
}
function a1(i, e) {
  return i * i * e;
}
function ms(i, e, t, r) {
  return n1(i, e) + s1(i, t) + a1(i, r);
}
function o1(i, e) {
  let t = 1 - i;
  return t * t * t * e;
}
function c1(i, e) {
  let t = 1 - i;
  return 3 * t * t * i * e;
}
function l1(i, e) {
  return 3 * (1 - i) * i * i * e;
}
function h1(i, e) {
  return i * i * i * e;
}
function gs(i, e, t, r, n) {
  return o1(i, e) + c1(i, t) + l1(i, r) + h1(i, n);
}
var Va = class extends xr {
    constructor(e = new se(), t = new se(), r = new se(), n = new se()) {
      super(), this.isCubicBezierCurve = !0, this.type = "CubicBezierCurve", this.v0 = e, this.v1 = t, this.v2 = r, this.v3 = n;
    }
    getPoint(e, t = new se()) {
      let r = t,
        n = this.v0,
        s = this.v1,
        o = this.v2,
        a = this.v3;
      return r.set(gs(e, n.x, s.x, o.x, a.x), gs(e, n.y, s.y, o.y, a.y)), r;
    }
    copy(e) {
      return super.copy(e), this.v0.copy(e.v0), this.v1.copy(e.v1), this.v2.copy(e.v2), this.v3.copy(e.v3), this;
    }
    toJSON() {
      let e = super.toJSON();
      return e.v0 = this.v0.toArray(), e.v1 = this.v1.toArray(), e.v2 = this.v2.toArray(), e.v3 = this.v3.toArray(), e;
    }
    fromJSON(e) {
      return super.fromJSON(e), this.v0.fromArray(e.v0), this.v1.fromArray(e.v1), this.v2.fromArray(e.v2), this.v3.fromArray(e.v3), this;
    }
  },
  Fc = class extends xr {
    constructor(e = new C(), t = new C(), r = new C(), n = new C()) {
      super(), this.isCubicBezierCurve3 = !0, this.type = "CubicBezierCurve3", this.v0 = e, this.v1 = t, this.v2 = r, this.v3 = n;
    }
    getPoint(e, t = new C()) {
      let r = t,
        n = this.v0,
        s = this.v1,
        o = this.v2,
        a = this.v3;
      return r.set(gs(e, n.x, s.x, o.x, a.x), gs(e, n.y, s.y, o.y, a.y), gs(e, n.z, s.z, o.z, a.z)), r;
    }
    copy(e) {
      return super.copy(e), this.v0.copy(e.v0), this.v1.copy(e.v1), this.v2.copy(e.v2), this.v3.copy(e.v3), this;
    }
    toJSON() {
      let e = super.toJSON();
      return e.v0 = this.v0.toArray(), e.v1 = this.v1.toArray(), e.v2 = this.v2.toArray(), e.v3 = this.v3.toArray(), e;
    }
    fromJSON(e) {
      return super.fromJSON(e), this.v0.fromArray(e.v0), this.v1.fromArray(e.v1), this.v2.fromArray(e.v2), this.v3.fromArray(e.v3), this;
    }
  },
  _s = class extends xr {
    constructor(e = new se(), t = new se()) {
      super(), this.isLineCurve = !0, this.type = "LineCurve", this.v1 = e, this.v2 = t;
    }
    getPoint(e, t = new se()) {
      let r = t;
      return e === 1 ? r.copy(this.v2) : (r.copy(this.v2).sub(this.v1), r.multiplyScalar(e).add(this.v1)), r;
    }
    getPointAt(e, t) {
      return this.getPoint(e, t);
    }
    getTangent(e, t = new se()) {
      return t.subVectors(this.v2, this.v1).normalize();
    }
    getTangentAt(e, t) {
      return this.getTangent(e, t);
    }
    copy(e) {
      return super.copy(e), this.v1.copy(e.v1), this.v2.copy(e.v2), this;
    }
    toJSON() {
      let e = super.toJSON();
      return e.v1 = this.v1.toArray(), e.v2 = this.v2.toArray(), e;
    }
    fromJSON(e) {
      return super.fromJSON(e), this.v1.fromArray(e.v1), this.v2.fromArray(e.v2), this;
    }
  },
  Bc = class extends xr {
    constructor(e = new C(), t = new C()) {
      super(), this.isLineCurve3 = !0, this.type = "LineCurve3", this.v1 = e, this.v2 = t;
    }
    getPoint(e, t = new C()) {
      let r = t;
      return e === 1 ? r.copy(this.v2) : (r.copy(this.v2).sub(this.v1), r.multiplyScalar(e).add(this.v1)), r;
    }
    getPointAt(e, t) {
      return this.getPoint(e, t);
    }
    getTangent(e, t = new C()) {
      return t.subVectors(this.v2, this.v1).normalize();
    }
    getTangentAt(e, t) {
      return this.getTangent(e, t);
    }
    copy(e) {
      return super.copy(e), this.v1.copy(e.v1), this.v2.copy(e.v2), this;
    }
    toJSON() {
      let e = super.toJSON();
      return e.v1 = this.v1.toArray(), e.v2 = this.v2.toArray(), e;
    }
    fromJSON(e) {
      return super.fromJSON(e), this.v1.fromArray(e.v1), this.v2.fromArray(e.v2), this;
    }
  },
  Wa = class extends xr {
    constructor(e = new se(), t = new se(), r = new se()) {
      super(), this.isQuadraticBezierCurve = !0, this.type = "QuadraticBezierCurve", this.v0 = e, this.v1 = t, this.v2 = r;
    }
    getPoint(e, t = new se()) {
      let r = t,
        n = this.v0,
        s = this.v1,
        o = this.v2;
      return r.set(ms(e, n.x, s.x, o.x), ms(e, n.y, s.y, o.y)), r;
    }
    copy(e) {
      return super.copy(e), this.v0.copy(e.v0), this.v1.copy(e.v1), this.v2.copy(e.v2), this;
    }
    toJSON() {
      let e = super.toJSON();
      return e.v0 = this.v0.toArray(), e.v1 = this.v1.toArray(), e.v2 = this.v2.toArray(), e;
    }
    fromJSON(e) {
      return super.fromJSON(e), this.v0.fromArray(e.v0), this.v1.fromArray(e.v1), this.v2.fromArray(e.v2), this;
    }
  },
  Gc = class extends xr {
    constructor(e = new C(), t = new C(), r = new C()) {
      super(), this.isQuadraticBezierCurve3 = !0, this.type = "QuadraticBezierCurve3", this.v0 = e, this.v1 = t, this.v2 = r;
    }
    getPoint(e, t = new C()) {
      let r = t,
        n = this.v0,
        s = this.v1,
        o = this.v2;
      return r.set(ms(e, n.x, s.x, o.x), ms(e, n.y, s.y, o.y), ms(e, n.z, s.z, o.z)), r;
    }
    copy(e) {
      return super.copy(e), this.v0.copy(e.v0), this.v1.copy(e.v1), this.v2.copy(e.v2), this;
    }
    toJSON() {
      let e = super.toJSON();
      return e.v0 = this.v0.toArray(), e.v1 = this.v1.toArray(), e.v2 = this.v2.toArray(), e;
    }
    fromJSON(e) {
      return super.fromJSON(e), this.v0.fromArray(e.v0), this.v1.fromArray(e.v1), this.v2.fromArray(e.v2), this;
    }
  },
  Ha = class extends xr {
    constructor(e = []) {
      super(), this.isSplineCurve = !0, this.type = "SplineCurve", this.points = e;
    }
    getPoint(e, t = new se()) {
      let r = t,
        n = this.points,
        s = (n.length - 1) * e,
        o = Math.floor(s),
        a = s - o,
        l = n[o === 0 ? o : o - 1],
        c = n[o],
        h = n[o > n.length - 2 ? n.length - 1 : o + 1],
        d = n[o > n.length - 3 ? n.length - 1 : o + 2];
      return r.set(Qh(a, l.x, c.x, h.x, d.x), Qh(a, l.y, c.y, h.y, d.y)), r;
    }
    copy(e) {
      super.copy(e), this.points = [];
      for (let t = 0, r = e.points.length; t < r; t++) {
        let n = e.points[t];
        this.points.push(n.clone());
      }
      return this;
    }
    toJSON() {
      let e = super.toJSON();
      e.points = [];
      for (let t = 0, r = this.points.length; t < r; t++) {
        let n = this.points[t];
        e.points.push(n.toArray());
      }
      return e;
    }
    fromJSON(e) {
      super.fromJSON(e), this.points = [];
      for (let t = 0, r = e.points.length; t < r; t++) {
        let n = e.points[t];
        this.points.push(new se().fromArray(n));
      }
      return this;
    }
  },
  ju = Object.freeze({
    __proto__: null,
    ArcCurve: kc,
    CatmullRomCurve3: Uc,
    CubicBezierCurve: Va,
    CubicBezierCurve3: Fc,
    EllipseCurve: ws,
    LineCurve: _s,
    LineCurve3: Bc,
    QuadraticBezierCurve: Wa,
    QuadraticBezierCurve3: Gc,
    SplineCurve: Ha
  }),
  Vc = class extends xr {
    constructor() {
      super(), this.type = "CurvePath", this.curves = [], this.autoClose = !1;
    }
    add(e) {
      this.curves.push(e);
    }
    closePath() {
      let e = this.curves[0].getPoint(0),
        t = this.curves[this.curves.length - 1].getPoint(1);
      e.equals(t) || this.curves.push(new _s(t, e));
    }
    getPoint(e, t) {
      let r = e * this.getLength(),
        n = this.getCurveLengths(),
        s = 0;
      for (; s < n.length;) {
        if (n[s] >= r) {
          let o = n[s] - r,
            a = this.curves[s],
            l = a.getLength(),
            c = l === 0 ? 0 : 1 - o / l;
          return a.getPointAt(c, t);
        }
        s++;
      }
      return null;
    }
    getLength() {
      let e = this.getCurveLengths();
      return e[e.length - 1];
    }
    updateArcLengths() {
      this.needsUpdate = !0, this.cacheLengths = null, this.getCurveLengths();
    }
    getCurveLengths() {
      if (this.cacheLengths && this.cacheLengths.length === this.curves.length) return this.cacheLengths;
      let e = [],
        t = 0;
      for (let r = 0, n = this.curves.length; r < n; r++) t += this.curves[r].getLength(), e.push(t);
      return this.cacheLengths = e, e;
    }
    getSpacedPoints(e = 40) {
      let t = [];
      for (let r = 0; r <= e; r++) t.push(this.getPoint(r / e));
      return this.autoClose && t.push(t[0]), t;
    }
    getPoints(e = 12) {
      let t = [],
        r;
      for (let n = 0, s = this.curves; n < s.length; n++) {
        let o = s[n],
          a = o.isEllipseCurve ? e * 2 : o.isLineCurve || o.isLineCurve3 ? 1 : o.isSplineCurve ? e * o.points.length : e,
          l = o.getPoints(a);
        for (let c = 0; c < l.length; c++) {
          let h = l[c];
          r && r.equals(h) || (t.push(h), r = h);
        }
      }
      return this.autoClose && t.length > 1 && !t[t.length - 1].equals(t[0]) && t.push(t[0]), t;
    }
    copy(e) {
      super.copy(e), this.curves = [];
      for (let t = 0, r = e.curves.length; t < r; t++) {
        let n = e.curves[t];
        this.curves.push(n.clone());
      }
      return this.autoClose = e.autoClose, this;
    }
    toJSON() {
      let e = super.toJSON();
      e.autoClose = this.autoClose, e.curves = [];
      for (let t = 0, r = this.curves.length; t < r; t++) {
        let n = this.curves[t];
        e.curves.push(n.toJSON());
      }
      return e;
    }
    fromJSON(e) {
      super.fromJSON(e), this.autoClose = e.autoClose, this.curves = [];
      for (let t = 0, r = e.curves.length; t < r; t++) {
        let n = e.curves[t];
        this.curves.push(new ju[n.type]().fromJSON(n));
      }
      return this;
    }
  },
  On = class extends Vc {
    constructor(e) {
      super(), this.type = "Path", this.currentPoint = new se(), e && this.setFromPoints(e);
    }
    setFromPoints(e) {
      this.moveTo(e[0].x, e[0].y);
      for (let t = 1, r = e.length; t < r; t++) this.lineTo(e[t].x, e[t].y);
      return this;
    }
    moveTo(e, t) {
      return this.currentPoint.set(e, t), this;
    }
    lineTo(e, t) {
      let r = new _s(this.currentPoint.clone(), new se(e, t));
      return this.curves.push(r), this.currentPoint.set(e, t), this;
    }
    quadraticCurveTo(e, t, r, n) {
      let s = new Wa(this.currentPoint.clone(), new se(e, t), new se(r, n));
      return this.curves.push(s), this.currentPoint.set(r, n), this;
    }
    bezierCurveTo(e, t, r, n, s, o) {
      let a = new Va(this.currentPoint.clone(), new se(e, t), new se(r, n), new se(s, o));
      return this.curves.push(a), this.currentPoint.set(s, o), this;
    }
    splineThru(e) {
      let t = [this.currentPoint.clone()].concat(e),
        r = new Ha(t);
      return this.curves.push(r), this.currentPoint.copy(e[e.length - 1]), this;
    }
    arc(e, t, r, n, s, o) {
      let a = this.currentPoint.x,
        l = this.currentPoint.y;
      return this.absarc(e + a, t + l, r, n, s, o), this;
    }
    absarc(e, t, r, n, s, o) {
      return this.absellipse(e, t, r, r, n, s, o), this;
    }
    ellipse(e, t, r, n, s, o, a, l) {
      let c = this.currentPoint.x,
        h = this.currentPoint.y;
      return this.absellipse(e + c, t + h, r, n, s, o, a, l), this;
    }
    absellipse(e, t, r, n, s, o, a, l) {
      let c = new ws(e, t, r, n, s, o, a, l);
      if (this.curves.length > 0) {
        let d = c.getPoint(0);
        d.equals(this.currentPoint) || this.lineTo(d.x, d.y);
      }
      this.curves.push(c);
      let h = c.getPoint(1);
      return this.currentPoint.copy(h), this;
    }
    copy(e) {
      return super.copy(e), this.currentPoint.copy(e.currentPoint), this;
    }
    toJSON() {
      let e = super.toJSON();
      return e.currentPoint = this.currentPoint.toArray(), e;
    }
    fromJSON(e) {
      return super.fromJSON(e), this.currentPoint.fromArray(e.currentPoint), this;
    }
  },
  Wc = class i extends Tt {
    constructor(e = [new se(0, -0.5), new se(0.5, 0), new se(0, 0.5)], t = 12, r = 0, n = Math.PI * 2) {
      super(), this.type = "LatheGeometry", this.parameters = {
        points: e,
        segments: t,
        phiStart: r,
        phiLength: n
      }, t = Math.floor(t), n = Vt(n, 0, Math.PI * 2);
      let s = [],
        o = [],
        a = [],
        l = [],
        c = [],
        h = 1 / t,
        d = new C(),
        u = new se(),
        p = new C(),
        g = new C(),
        f = new C(),
        m = 0,
        v = 0;
      for (let y = 0; y <= e.length - 1; y++) switch (y) {
        case 0:
          m = e[y + 1].x - e[y].x, v = e[y + 1].y - e[y].y, p.x = v * 1, p.y = -m, p.z = v * 0, f.copy(p), p.normalize(), l.push(p.x, p.y, p.z);
          break;
        case e.length - 1:
          l.push(f.x, f.y, f.z);
          break;
        default:
          m = e[y + 1].x - e[y].x, v = e[y + 1].y - e[y].y, p.x = v * 1, p.y = -m, p.z = v * 0, g.copy(p), p.x += f.x, p.y += f.y, p.z += f.z, p.normalize(), l.push(p.x, p.y, p.z), f.copy(g);
      }
      for (let y = 0; y <= t; y++) {
        let x = r + y * h * n,
          b = Math.sin(x),
          w = Math.cos(x);
        for (let A = 0; A <= e.length - 1; A++) {
          d.x = e[A].x * b, d.y = e[A].y, d.z = e[A].x * w, o.push(d.x, d.y, d.z), u.x = y / t, u.y = A / (e.length - 1), a.push(u.x, u.y);
          let L = l[3 * A + 0] * b,
            M = l[3 * A + 1],
            T = l[3 * A + 0] * w;
          c.push(L, M, T);
        }
      }
      for (let y = 0; y < t; y++) for (let x = 0; x < e.length - 1; x++) {
        let b = x + y * e.length,
          w = b,
          A = b + e.length,
          L = b + e.length + 1,
          M = b + 1;
        s.push(w, A, M), s.push(L, M, A);
      }
      this.setIndex(s), this.setAttribute("position", new Ye(o, 3)), this.setAttribute("uv", new Ye(a, 2)), this.setAttribute("normal", new Ye(c, 3));
    }
    copy(e) {
      return super.copy(e), this.parameters = Object.assign({}, e.parameters), this;
    }
    static fromJSON(e) {
      return new i(e.points, e.segments, e.phiStart, e.phiLength);
    }
  },
  Hc = class i extends Wc {
    constructor(e = 1, t = 1, r = 4, n = 8) {
      let s = new On();
      s.absarc(0, -t / 2, e, Math.PI * 1.5, 0), s.absarc(0, t / 2, e, 0, Math.PI * 0.5), super(s.getPoints(r), n), this.type = "CapsuleGeometry", this.parameters = {
        radius: e,
        height: t,
        capSegments: r,
        radialSegments: n
      };
    }
    static fromJSON(e) {
      return new i(e.radius, e.length, e.capSegments, e.radialSegments);
    }
  },
  Ts = class i extends Tt {
    constructor(e = 1, t = 32, r = 0, n = Math.PI * 2) {
      super(), this.type = "CircleGeometry", this.parameters = {
        radius: e,
        segments: t,
        thetaStart: r,
        thetaLength: n
      }, t = Math.max(3, t);
      let s = [],
        o = [],
        a = [],
        l = [],
        c = new C(),
        h = new se();
      o.push(0, 0, 0), a.push(0, 0, 1), l.push(0.5, 0.5);
      for (let d = 0, u = 3; d <= t; d++, u += 3) {
        let p = r + d / t * n;
        c.x = e * Math.cos(p), c.y = e * Math.sin(p), o.push(c.x, c.y, c.z), a.push(0, 0, 1), h.x = (o[u] / e + 1) / 2, h.y = (o[u + 1] / e + 1) / 2, l.push(h.x, h.y);
      }
      for (let d = 1; d <= t; d++) s.push(d, d + 1, 0);
      this.setIndex(s), this.setAttribute("position", new Ye(o, 3)), this.setAttribute("normal", new Ye(a, 3)), this.setAttribute("uv", new Ye(l, 2));
    }
    copy(e) {
      return super.copy(e), this.parameters = Object.assign({}, e.parameters), this;
    }
    static fromJSON(e) {
      return new i(e.radius, e.segments, e.thetaStart, e.thetaLength);
    }
  },
  ja = class i extends Tt {
    constructor(e = 1, t = 1, r = 1, n = 32, s = 1, o = !1, a = 0, l = Math.PI * 2) {
      super(), this.type = "CylinderGeometry", this.parameters = {
        radiusTop: e,
        radiusBottom: t,
        height: r,
        radialSegments: n,
        heightSegments: s,
        openEnded: o,
        thetaStart: a,
        thetaLength: l
      };
      let c = this;
      n = Math.floor(n), s = Math.floor(s);
      let h = [],
        d = [],
        u = [],
        p = [],
        g = 0,
        f = [],
        m = r / 2,
        v = 0;
      y(), o === !1 && (e > 0 && x(!0), t > 0 && x(!1)), this.setIndex(h), this.setAttribute("position", new Ye(d, 3)), this.setAttribute("normal", new Ye(u, 3)), this.setAttribute("uv", new Ye(p, 2));
      function y() {
        let b = new C(),
          w = new C(),
          A = 0,
          L = (t - e) / r;
        for (let M = 0; M <= s; M++) {
          let T = [],
            R = M / s,
            H = R * (t - e) + e;
          for (let Z = 0; Z <= n; Z++) {
            let O = Z / n,
              z = O * l + a,
              j = Math.sin(z),
              ie = Math.cos(z);
            w.x = H * j, w.y = -R * r + m, w.z = H * ie, d.push(w.x, w.y, w.z), b.set(j, L, ie).normalize(), u.push(b.x, b.y, b.z), p.push(O, 1 - R), T.push(g++);
          }
          f.push(T);
        }
        for (let M = 0; M < n; M++) for (let T = 0; T < s; T++) {
          let R = f[T][M],
            H = f[T + 1][M],
            Z = f[T + 1][M + 1],
            O = f[T][M + 1];
          h.push(R, H, O), h.push(H, Z, O), A += 6;
        }
        c.addGroup(v, A, 0), v += A;
      }
      function x(b) {
        let w = g,
          A = new se(),
          L = new C(),
          M = 0,
          T = b === !0 ? e : t,
          R = b === !0 ? 1 : -1;
        for (let Z = 1; Z <= n; Z++) d.push(0, m * R, 0), u.push(0, R, 0), p.push(0.5, 0.5), g++;
        let H = g;
        for (let Z = 0; Z <= n; Z++) {
          let O = Z / n * l + a,
            z = Math.cos(O),
            j = Math.sin(O);
          L.x = T * j, L.y = m * R, L.z = T * z, d.push(L.x, L.y, L.z), u.push(0, R, 0), A.x = z * 0.5 + 0.5, A.y = j * 0.5 * R + 0.5, p.push(A.x, A.y), g++;
        }
        for (let Z = 0; Z < n; Z++) {
          let O = w + Z,
            z = H + Z;
          b === !0 ? h.push(z, z + 1, O) : h.push(z + 1, z, O), M += 3;
        }
        c.addGroup(v, M, b === !0 ? 1 : 2), v += M;
      }
    }
    copy(e) {
      return super.copy(e), this.parameters = Object.assign({}, e.parameters), this;
    }
    static fromJSON(e) {
      return new i(e.radiusTop, e.radiusBottom, e.height, e.radialSegments, e.heightSegments, e.openEnded, e.thetaStart, e.thetaLength);
    }
  },
  jc = class i extends ja {
    constructor(e = 1, t = 1, r = 32, n = 1, s = !1, o = 0, a = Math.PI * 2) {
      super(0, e, t, r, n, s, o, a), this.type = "ConeGeometry", this.parameters = {
        radius: e,
        height: t,
        radialSegments: r,
        heightSegments: n,
        openEnded: s,
        thetaStart: o,
        thetaLength: a
      };
    }
    static fromJSON(e) {
      return new i(e.radius, e.height, e.radialSegments, e.heightSegments, e.openEnded, e.thetaStart, e.thetaLength);
    }
  },
  Es = class i extends Tt {
    constructor(e = [], t = [], r = 1, n = 0) {
      super(), this.type = "PolyhedronGeometry", this.parameters = {
        vertices: e,
        indices: t,
        radius: r,
        detail: n
      };
      let s = [],
        o = [];
      a(n), c(r), h(), this.setAttribute("position", new Ye(s, 3)), this.setAttribute("normal", new Ye(s.slice(), 3)), this.setAttribute("uv", new Ye(o, 2)), n === 0 ? this.computeVertexNormals() : this.normalizeNormals();
      function a(y) {
        let x = new C(),
          b = new C(),
          w = new C();
        for (let A = 0; A < t.length; A += 3) p(t[A + 0], x), p(t[A + 1], b), p(t[A + 2], w), l(x, b, w, y);
      }
      function l(y, x, b, w) {
        let A = w + 1,
          L = [];
        for (let M = 0; M <= A; M++) {
          L[M] = [];
          let T = y.clone().lerp(b, M / A),
            R = x.clone().lerp(b, M / A),
            H = A - M;
          for (let Z = 0; Z <= H; Z++) Z === 0 && M === A ? L[M][Z] = T : L[M][Z] = T.clone().lerp(R, Z / H);
        }
        for (let M = 0; M < A; M++) for (let T = 0; T < 2 * (A - M) - 1; T++) {
          let R = Math.floor(T / 2);
          T % 2 === 0 ? (u(L[M][R + 1]), u(L[M + 1][R]), u(L[M][R])) : (u(L[M][R + 1]), u(L[M + 1][R + 1]), u(L[M + 1][R]));
        }
      }
      function c(y) {
        let x = new C();
        for (let b = 0; b < s.length; b += 3) x.x = s[b + 0], x.y = s[b + 1], x.z = s[b + 2], x.normalize().multiplyScalar(y), s[b + 0] = x.x, s[b + 1] = x.y, s[b + 2] = x.z;
      }
      function h() {
        let y = new C();
        for (let x = 0; x < s.length; x += 3) {
          y.x = s[x + 0], y.y = s[x + 1], y.z = s[x + 2];
          let b = m(y) / 2 / Math.PI + 0.5,
            w = v(y) / Math.PI + 0.5;
          o.push(b, 1 - w);
        }
        g(), d();
      }
      function d() {
        for (let y = 0; y < o.length; y += 6) {
          let x = o[y + 0],
            b = o[y + 2],
            w = o[y + 4],
            A = Math.max(x, b, w),
            L = Math.min(x, b, w);
          A > 0.9 && L < 0.1 && (x < 0.2 && (o[y + 0] += 1), b < 0.2 && (o[y + 2] += 1), w < 0.2 && (o[y + 4] += 1));
        }
      }
      function u(y) {
        s.push(y.x, y.y, y.z);
      }
      function p(y, x) {
        let b = y * 3;
        x.x = e[b + 0], x.y = e[b + 1], x.z = e[b + 2];
      }
      function g() {
        let y = new C(),
          x = new C(),
          b = new C(),
          w = new C(),
          A = new se(),
          L = new se(),
          M = new se();
        for (let T = 0, R = 0; T < s.length; T += 9, R += 6) {
          y.set(s[T + 0], s[T + 1], s[T + 2]), x.set(s[T + 3], s[T + 4], s[T + 5]), b.set(s[T + 6], s[T + 7], s[T + 8]), A.set(o[R + 0], o[R + 1]), L.set(o[R + 2], o[R + 3]), M.set(o[R + 4], o[R + 5]), w.copy(y).add(x).add(b).divideScalar(3);
          let H = m(w);
          f(A, R + 0, y, H), f(L, R + 2, x, H), f(M, R + 4, b, H);
        }
      }
      function f(y, x, b, w) {
        w < 0 && y.x === 1 && (o[x] = y.x - 1), b.x === 0 && b.z === 0 && (o[x] = w / 2 / Math.PI + 0.5);
      }
      function m(y) {
        return Math.atan2(y.z, -y.x);
      }
      function v(y) {
        return Math.atan2(-y.y, Math.sqrt(y.x * y.x + y.z * y.z));
      }
    }
    copy(e) {
      return super.copy(e), this.parameters = Object.assign({}, e.parameters), this;
    }
    static fromJSON(e) {
      return new i(e.vertices, e.indices, e.radius, e.details);
    }
  },
  qa = class i extends Es {
    constructor(e = 1, t = 0) {
      let r = (1 + Math.sqrt(5)) / 2,
        n = 1 / r,
        s = [-1, -1, -1, -1, -1, 1, -1, 1, -1, -1, 1, 1, 1, -1, -1, 1, -1, 1, 1, 1, -1, 1, 1, 1, 0, -n, -r, 0, -n, r, 0, n, -r, 0, n, r, -n, -r, 0, -n, r, 0, n, -r, 0, n, r, 0, -r, 0, -n, r, 0, -n, -r, 0, n, r, 0, n],
        o = [3, 11, 7, 3, 7, 15, 3, 15, 13, 7, 19, 17, 7, 17, 6, 7, 6, 15, 17, 4, 8, 17, 8, 10, 17, 10, 6, 8, 0, 16, 8, 16, 2, 8, 2, 10, 0, 12, 1, 0, 1, 18, 0, 18, 16, 6, 10, 2, 6, 2, 13, 6, 13, 15, 2, 16, 18, 2, 18, 3, 2, 3, 13, 18, 1, 9, 18, 9, 11, 18, 11, 3, 4, 14, 12, 4, 12, 0, 4, 0, 8, 11, 9, 5, 11, 5, 19, 11, 19, 7, 19, 5, 14, 19, 14, 4, 19, 4, 17, 1, 12, 14, 1, 14, 5, 1, 5, 9];
      super(s, o, e, t), this.type = "DodecahedronGeometry", this.parameters = {
        radius: e,
        detail: t
      };
    }
    static fromJSON(e) {
      return new i(e.radius, e.detail);
    }
  },
  Ji = class extends On {
    constructor(e) {
      super(e), this.uuid = ii(), this.type = "Shape", this.holes = [];
    }
    getPointsHoles(e) {
      let t = [];
      for (let r = 0, n = this.holes.length; r < n; r++) t[r] = this.holes[r].getPoints(e);
      return t;
    }
    extractPoints(e) {
      return {
        shape: this.getPoints(e),
        holes: this.getPointsHoles(e)
      };
    }
    copy(e) {
      super.copy(e), this.holes = [];
      for (let t = 0, r = e.holes.length; t < r; t++) {
        let n = e.holes[t];
        this.holes.push(n.clone());
      }
      return this;
    }
    toJSON() {
      let e = super.toJSON();
      e.uuid = this.uuid, e.holes = [];
      for (let t = 0, r = this.holes.length; t < r; t++) {
        let n = this.holes[t];
        e.holes.push(n.toJSON());
      }
      return e;
    }
    fromJSON(e) {
      super.fromJSON(e), this.uuid = e.uuid, this.holes = [];
      for (let t = 0, r = e.holes.length; t < r; t++) {
        let n = e.holes[t];
        this.holes.push(new On().fromJSON(n));
      }
      return this;
    }
  },
  u1 = {
    triangulate: function (i, e, t = 2) {
      let r = e && e.length,
        n = r ? e[0] * t : i.length,
        s = qu(i, 0, n, t, !0),
        o = [];
      if (!s || s.next === s.prev) return o;
      let a, l, c, h, d, u, p;
      if (r && (s = g1(i, e, s, t)), i.length > 80 * t) {
        a = c = i[0], l = h = i[1];
        for (let g = t; g < n; g += t) d = i[g], u = i[g + 1], d < a && (a = d), u < l && (l = u), d > c && (c = d), u > h && (h = u);
        p = Math.max(c - a, h - l), p = p !== 0 ? 32767 / p : 0;
      }
      return As(s, o, t, a, l, p, 0), o;
    }
  };
function qu(i, e, t, r, n) {
  let s, o;
  if (n === A1(i, e, t, r) > 0) for (s = e; s < t; s += r) o = $h(s, i[s], i[s + 1], o);else for (s = t - r; s >= e; s -= r) o = $h(s, i[s], i[s + 1], o);
  return o && so(o, o.next) && (Rs(o), o = o.next), o;
}
function Ki(i, e) {
  if (!i) return i;
  e || (e = i);
  let t = i,
    r;
  do if (r = !1, !t.steiner && (so(t, t.next) || vt(t.prev, t, t.next) === 0)) {
    if (Rs(t), t = e = t.prev, t === t.next) break;
    r = !0;
  } else t = t.next; while (r || t !== e);
  return e;
}
function As(i, e, t, r, n, s, o) {
  if (!i) return;
  !o && s && M1(i, r, n, s);
  let a = i,
    l,
    c;
  for (; i.prev !== i.next;) {
    if (l = i.prev, c = i.next, s ? p1(i, r, n, s) : d1(i)) {
      e.push(l.i / t | 0), e.push(i.i / t | 0), e.push(c.i / t | 0), Rs(i), i = c.next, a = c.next;
      continue;
    }
    if (i = c, i === a) {
      o ? o === 1 ? (i = f1(Ki(i), e, t), As(i, e, t, r, n, s, 2)) : o === 2 && m1(i, e, t, r, n, s) : As(Ki(i), e, t, r, n, s, 1);
      break;
    }
  }
}
function d1(i) {
  let e = i.prev,
    t = i,
    r = i.next;
  if (vt(e, t, r) >= 0) return !1;
  let n = e.x,
    s = t.x,
    o = r.x,
    a = e.y,
    l = t.y,
    c = r.y,
    h = n < s ? n < o ? n : o : s < o ? s : o,
    d = a < l ? a < c ? a : c : l < c ? l : c,
    u = n > s ? n > o ? n : o : s > o ? s : o,
    p = a > l ? a > c ? a : c : l > c ? l : c,
    g = r.next;
  for (; g !== e;) {
    if (g.x >= h && g.x <= u && g.y >= d && g.y <= p && Sn(n, a, s, l, o, c, g.x, g.y) && vt(g.prev, g, g.next) >= 0) return !1;
    g = g.next;
  }
  return !0;
}
function p1(i, e, t, r) {
  let n = i.prev,
    s = i,
    o = i.next;
  if (vt(n, s, o) >= 0) return !1;
  let a = n.x,
    l = s.x,
    c = o.x,
    h = n.y,
    d = s.y,
    u = o.y,
    p = a < l ? a < c ? a : c : l < c ? l : c,
    g = h < d ? h < u ? h : u : d < u ? d : u,
    f = a > l ? a > c ? a : c : l > c ? l : c,
    m = h > d ? h > u ? h : u : d > u ? d : u,
    v = qc(p, g, e, t, r),
    y = qc(f, m, e, t, r),
    x = i.prevZ,
    b = i.nextZ;
  for (; x && x.z >= v && b && b.z <= y;) {
    if (x.x >= p && x.x <= f && x.y >= g && x.y <= m && x !== n && x !== o && Sn(a, h, l, d, c, u, x.x, x.y) && vt(x.prev, x, x.next) >= 0 || (x = x.prevZ, b.x >= p && b.x <= f && b.y >= g && b.y <= m && b !== n && b !== o && Sn(a, h, l, d, c, u, b.x, b.y) && vt(b.prev, b, b.next) >= 0)) return !1;
    b = b.nextZ;
  }
  for (; x && x.z >= v;) {
    if (x.x >= p && x.x <= f && x.y >= g && x.y <= m && x !== n && x !== o && Sn(a, h, l, d, c, u, x.x, x.y) && vt(x.prev, x, x.next) >= 0) return !1;
    x = x.prevZ;
  }
  for (; b && b.z <= y;) {
    if (b.x >= p && b.x <= f && b.y >= g && b.y <= m && b !== n && b !== o && Sn(a, h, l, d, c, u, b.x, b.y) && vt(b.prev, b, b.next) >= 0) return !1;
    b = b.nextZ;
  }
  return !0;
}
function f1(i, e, t) {
  let r = i;
  do {
    let n = r.prev,
      s = r.next.next;
    !so(n, s) && Xu(n, r, r.next, s) && Cs(n, s) && Cs(s, n) && (e.push(n.i / t | 0), e.push(r.i / t | 0), e.push(s.i / t | 0), Rs(r), Rs(r.next), r = i = s), r = r.next;
  } while (r !== i);
  return Ki(r);
}
function m1(i, e, t, r, n, s) {
  let o = i;
  do {
    let a = o.next.next;
    for (; a !== o.prev;) {
      if (o.i !== a.i && _1(o, a)) {
        let l = Yu(o, a);
        o = Ki(o, o.next), l = Ki(l, l.next), As(o, e, t, r, n, s, 0), As(l, e, t, r, n, s, 0);
        return;
      }
      a = a.next;
    }
    o = o.next;
  } while (o !== i);
}
function g1(i, e, t, r) {
  let n = [],
    s,
    o,
    a,
    l,
    c;
  for (s = 0, o = e.length; s < o; s++) a = e[s] * r, l = s < o - 1 ? e[s + 1] * r : i.length, c = qu(i, a, l, r, !1), c === c.next && (c.steiner = !0), n.push(w1(c));
  for (n.sort(v1), s = 0; s < n.length; s++) t = x1(n[s], t);
  return t;
}
function v1(i, e) {
  return i.x - e.x;
}
function x1(i, e) {
  let t = y1(i, e);
  if (!t) return e;
  let r = Yu(t, i);
  return Ki(r, r.next), Ki(t, t.next);
}
function y1(i, e) {
  let t = e,
    r = -1 / 0,
    n,
    s = i.x,
    o = i.y;
  do {
    if (o <= t.y && o >= t.next.y && t.next.y !== t.y) {
      let u = t.x + (o - t.y) * (t.next.x - t.x) / (t.next.y - t.y);
      if (u <= s && u > r && (r = u, n = t.x < t.next.x ? t : t.next, u === s)) return n;
    }
    t = t.next;
  } while (t !== e);
  if (!n) return null;
  let a = n,
    l = n.x,
    c = n.y,
    h = 1 / 0,
    d;
  t = n;
  do s >= t.x && t.x >= l && s !== t.x && Sn(o < c ? s : r, o, l, c, o < c ? r : s, o, t.x, t.y) && (d = Math.abs(o - t.y) / (s - t.x), Cs(t, i) && (d < h || d === h && (t.x > n.x || t.x === n.x && b1(n, t))) && (n = t, h = d)), t = t.next; while (t !== a);
  return n;
}
function b1(i, e) {
  return vt(i.prev, i, e.prev) < 0 && vt(e.next, i, i.next) < 0;
}
function M1(i, e, t, r) {
  let n = i;
  do n.z === 0 && (n.z = qc(n.x, n.y, e, t, r)), n.prevZ = n.prev, n.nextZ = n.next, n = n.next; while (n !== i);
  n.prevZ.nextZ = null, n.prevZ = null, S1(n);
}
function S1(i) {
  let e,
    t,
    r,
    n,
    s,
    o,
    a,
    l,
    c = 1;
  do {
    for (t = i, i = null, s = null, o = 0; t;) {
      for (o++, r = t, a = 0, e = 0; e < c && (a++, r = r.nextZ, !!r); e++);
      for (l = c; a > 0 || l > 0 && r;) a !== 0 && (l === 0 || !r || t.z <= r.z) ? (n = t, t = t.nextZ, a--) : (n = r, r = r.nextZ, l--), s ? s.nextZ = n : i = n, n.prevZ = s, s = n;
      t = r;
    }
    s.nextZ = null, c *= 2;
  } while (o > 1);
  return i;
}
function qc(i, e, t, r, n) {
  return i = (i - t) * n | 0, e = (e - r) * n | 0, i = (i | i << 8) & 16711935, i = (i | i << 4) & 252645135, i = (i | i << 2) & 858993459, i = (i | i << 1) & 1431655765, e = (e | e << 8) & 16711935, e = (e | e << 4) & 252645135, e = (e | e << 2) & 858993459, e = (e | e << 1) & 1431655765, i | e << 1;
}
function w1(i) {
  let e = i,
    t = i;
  do (e.x < t.x || e.x === t.x && e.y < t.y) && (t = e), e = e.next; while (e !== i);
  return t;
}
function Sn(i, e, t, r, n, s, o, a) {
  return (n - o) * (e - a) >= (i - o) * (s - a) && (i - o) * (r - a) >= (t - o) * (e - a) && (t - o) * (s - a) >= (n - o) * (r - a);
}
function _1(i, e) {
  return i.next.i !== e.i && i.prev.i !== e.i && !T1(i, e) && (Cs(i, e) && Cs(e, i) && E1(i, e) && (vt(i.prev, i, e.prev) || vt(i, e.prev, e)) || so(i, e) && vt(i.prev, i, i.next) > 0 && vt(e.prev, e, e.next) > 0);
}
function vt(i, e, t) {
  return (e.y - i.y) * (t.x - e.x) - (e.x - i.x) * (t.y - e.y);
}
function so(i, e) {
  return i.x === e.x && i.y === e.y;
}
function Xu(i, e, t, r) {
  let n = ha(vt(i, e, t)),
    s = ha(vt(i, e, r)),
    o = ha(vt(t, r, i)),
    a = ha(vt(t, r, e));
  return !!(n !== s && o !== a || n === 0 && la(i, t, e) || s === 0 && la(i, r, e) || o === 0 && la(t, i, r) || a === 0 && la(t, e, r));
}
function la(i, e, t) {
  return e.x <= Math.max(i.x, t.x) && e.x >= Math.min(i.x, t.x) && e.y <= Math.max(i.y, t.y) && e.y >= Math.min(i.y, t.y);
}
function ha(i) {
  return i > 0 ? 1 : i < 0 ? -1 : 0;
}
function T1(i, e) {
  let t = i;
  do {
    if (t.i !== i.i && t.next.i !== i.i && t.i !== e.i && t.next.i !== e.i && Xu(t, t.next, i, e)) return !0;
    t = t.next;
  } while (t !== i);
  return !1;
}
function Cs(i, e) {
  return vt(i.prev, i, i.next) < 0 ? vt(i, e, i.next) >= 0 && vt(i, i.prev, e) >= 0 : vt(i, e, i.prev) < 0 || vt(i, i.next, e) < 0;
}
function E1(i, e) {
  let t = i,
    r = !1,
    n = (i.x + e.x) / 2,
    s = (i.y + e.y) / 2;
  do t.y > s != t.next.y > s && t.next.y !== t.y && n < (t.next.x - t.x) * (s - t.y) / (t.next.y - t.y) + t.x && (r = !r), t = t.next; while (t !== i);
  return r;
}
function Yu(i, e) {
  let t = new Xc(i.i, i.x, i.y),
    r = new Xc(e.i, e.x, e.y),
    n = i.next,
    s = e.prev;
  return i.next = e, e.prev = i, t.next = n, n.prev = t, r.next = t, t.prev = r, s.next = r, r.prev = s, r;
}
function $h(i, e, t, r) {
  let n = new Xc(i, e, t);
  return r ? (n.next = r.next, n.prev = r, r.next.prev = n, r.next = n) : (n.prev = n, n.next = n), n;
}
function Rs(i) {
  i.next.prev = i.prev, i.prev.next = i.next, i.prevZ && (i.prevZ.nextZ = i.nextZ), i.nextZ && (i.nextZ.prevZ = i.prevZ);
}
function Xc(i, e, t) {
  this.i = i, this.x = e, this.y = t, this.prev = null, this.next = null, this.z = 0, this.prevZ = null, this.nextZ = null, this.steiner = !1;
}
function A1(i, e, t, r) {
  let n = 0;
  for (let s = e, o = t - r; s < t; s += r) n += (i[o] - i[s]) * (i[s + 1] + i[o + 1]), o = s;
  return n;
}
var Mi = class i {
  static area(e) {
    let t = e.length,
      r = 0;
    for (let n = t - 1, s = 0; s < t; n = s++) r += e[n].x * e[s].y - e[s].x * e[n].y;
    return r * 0.5;
  }
  static isClockWise(e) {
    return i.area(e) < 0;
  }
  static triangulateShape(e, t) {
    let r = [],
      n = [],
      s = [];
    eu(e), tu(r, e);
    let o = e.length;
    t.forEach(eu);
    for (let l = 0; l < t.length; l++) n.push(o), o += t[l].length, tu(r, t[l]);
    let a = u1.triangulate(r, n);
    for (let l = 0; l < a.length; l += 3) s.push(a.slice(l, l + 3));
    return s;
  }
};
function eu(i) {
  let e = i.length;
  e > 2 && i[e - 1].equals(i[0]) && i.pop();
}
function tu(i, e) {
  for (let t = 0; t < e.length; t++) i.push(e[t].x), i.push(e[t].y);
}
var Xa = class i extends Tt {
    constructor(e = new Ji([new se(0.5, 0.5), new se(-0.5, 0.5), new se(-0.5, -0.5), new se(0.5, -0.5)]), t = {}) {
      super(), this.type = "ExtrudeGeometry", this.parameters = {
        shapes: e,
        options: t
      }, e = Array.isArray(e) ? e : [e];
      let r = this,
        n = [],
        s = [];
      for (let a = 0, l = e.length; a < l; a++) {
        let c = e[a];
        o(c);
      }
      this.setAttribute("position", new Ye(n, 3)), this.setAttribute("uv", new Ye(s, 2)), this.computeVertexNormals();
      function o(a) {
        let l = [],
          c = t.curveSegments !== void 0 ? t.curveSegments : 12,
          h = t.steps !== void 0 ? t.steps : 1,
          d = t.depth !== void 0 ? t.depth : 1,
          u = t.bevelEnabled !== void 0 ? t.bevelEnabled : !0,
          p = t.bevelThickness !== void 0 ? t.bevelThickness : 0.2,
          g = t.bevelSize !== void 0 ? t.bevelSize : p - 0.1,
          f = t.bevelOffset !== void 0 ? t.bevelOffset : 0,
          m = t.bevelSegments !== void 0 ? t.bevelSegments : 3,
          v = t.extrudePath,
          y = t.UVGenerator !== void 0 ? t.UVGenerator : C1,
          x,
          b = !1,
          w,
          A,
          L,
          M;
        v && (x = v.getSpacedPoints(h), b = !0, u = !1, w = v.computeFrenetFrames(h, !1), A = new C(), L = new C(), M = new C()), u || (m = 0, p = 0, g = 0, f = 0);
        let T = a.extractPoints(c),
          R = T.shape,
          H = T.holes;
        if (!Mi.isClockWise(R)) {
          R = R.reverse();
          for (let k = 0, F = H.length; k < F; k++) {
            let B = H[k];
            Mi.isClockWise(B) && (H[k] = B.reverse());
          }
        }
        let Z = Mi.triangulateShape(R, H),
          O = R;
        for (let k = 0, F = H.length; k < F; k++) {
          let B = H[k];
          R = R.concat(B);
        }
        function z(k, F, B) {
          return F || console.error("THREE.ExtrudeGeometry: vec does not exist"), k.clone().addScaledVector(F, B);
        }
        let j = R.length,
          ie = Z.length;
        function oe(k, F, B) {
          let fe,
            ue,
            Le,
            Oe = k.x - F.x,
            Ne = k.y - F.y,
            Fe = B.x - k.x,
            it = B.y - k.y,
            Dt = Oe * Oe + Ne * Ne,
            E = Oe * it - Ne * Fe;
          if (Math.abs(E) > Number.EPSILON) {
            let S = Math.sqrt(Dt),
              q = Math.sqrt(Fe * Fe + it * it),
              le = F.x - Ne / S,
              he = F.y + Oe / S,
              ge = B.x - it / q,
              _e = B.y + Fe / q,
              ye = ((ge - le) * it - (_e - he) * Fe) / (Oe * it - Ne * Fe);
            fe = le + Oe * ye - k.x, ue = he + Ne * ye - k.y;
            let ee = fe * fe + ue * ue;
            if (ee <= 2) return new se(fe, ue);
            Le = Math.sqrt(ee / 2);
          } else {
            let S = !1;
            Oe > Number.EPSILON ? Fe > Number.EPSILON && (S = !0) : Oe < -Number.EPSILON ? Fe < -Number.EPSILON && (S = !0) : Math.sign(Ne) === Math.sign(it) && (S = !0), S ? (fe = -Ne, ue = Oe, Le = Math.sqrt(Dt)) : (fe = Oe, ue = Ne, Le = Math.sqrt(Dt / 2));
          }
          return new se(fe / Le, ue / Le);
        }
        let $ = [];
        for (let k = 0, F = O.length, B = F - 1, fe = k + 1; k < F; k++, B++, fe++) B === F && (B = 0), fe === F && (fe = 0), $[k] = oe(O[k], O[B], O[fe]);
        let ae = [],
          te,
          be = $.concat();
        for (let k = 0, F = H.length; k < F; k++) {
          let B = H[k];
          te = [];
          for (let fe = 0, ue = B.length, Le = ue - 1, Oe = fe + 1; fe < ue; fe++, Le++, Oe++) Le === ue && (Le = 0), Oe === ue && (Oe = 0), te[fe] = oe(B[fe], B[Le], B[Oe]);
          ae.push(te), be = be.concat(te);
        }
        for (let k = 0; k < m; k++) {
          let F = k / m,
            B = p * Math.cos(F * Math.PI / 2),
            fe = g * Math.sin(F * Math.PI / 2) + f;
          for (let ue = 0, Le = O.length; ue < Le; ue++) {
            let Oe = z(O[ue], $[ue], fe);
            me(Oe.x, Oe.y, -B);
          }
          for (let ue = 0, Le = H.length; ue < Le; ue++) {
            let Oe = H[ue];
            te = ae[ue];
            for (let Ne = 0, Fe = Oe.length; Ne < Fe; Ne++) {
              let it = z(Oe[Ne], te[Ne], fe);
              me(it.x, it.y, -B);
            }
          }
        }
        let V = g + f;
        for (let k = 0; k < j; k++) {
          let F = u ? z(R[k], be[k], V) : R[k];
          b ? (L.copy(w.normals[0]).multiplyScalar(F.x), A.copy(w.binormals[0]).multiplyScalar(F.y), M.copy(x[0]).add(L).add(A), me(M.x, M.y, M.z)) : me(F.x, F.y, 0);
        }
        for (let k = 1; k <= h; k++) for (let F = 0; F < j; F++) {
          let B = u ? z(R[F], be[F], V) : R[F];
          b ? (L.copy(w.normals[k]).multiplyScalar(B.x), A.copy(w.binormals[k]).multiplyScalar(B.y), M.copy(x[k]).add(L).add(A), me(M.x, M.y, M.z)) : me(B.x, B.y, d / h * k);
        }
        for (let k = m - 1; k >= 0; k--) {
          let F = k / m,
            B = p * Math.cos(F * Math.PI / 2),
            fe = g * Math.sin(F * Math.PI / 2) + f;
          for (let ue = 0, Le = O.length; ue < Le; ue++) {
            let Oe = z(O[ue], $[ue], fe);
            me(Oe.x, Oe.y, d + B);
          }
          for (let ue = 0, Le = H.length; ue < Le; ue++) {
            let Oe = H[ue];
            te = ae[ue];
            for (let Ne = 0, Fe = Oe.length; Ne < Fe; Ne++) {
              let it = z(Oe[Ne], te[Ne], fe);
              b ? me(it.x, it.y + x[h - 1].y, x[h - 1].x + B) : me(it.x, it.y, d + B);
            }
          }
        }
        re(), de();
        function re() {
          let k = n.length / 3;
          if (u) {
            let F = 0,
              B = j * F;
            for (let fe = 0; fe < ie; fe++) {
              let ue = Z[fe];
              P(ue[2] + B, ue[1] + B, ue[0] + B);
            }
            F = h + m * 2, B = j * F;
            for (let fe = 0; fe < ie; fe++) {
              let ue = Z[fe];
              P(ue[0] + B, ue[1] + B, ue[2] + B);
            }
          } else {
            for (let F = 0; F < ie; F++) {
              let B = Z[F];
              P(B[2], B[1], B[0]);
            }
            for (let F = 0; F < ie; F++) {
              let B = Z[F];
              P(B[0] + j * h, B[1] + j * h, B[2] + j * h);
            }
          }
          r.addGroup(k, n.length / 3 - k, 0);
        }
        function de() {
          let k = n.length / 3,
            F = 0;
          W(O, F), F += O.length;
          for (let B = 0, fe = H.length; B < fe; B++) {
            let ue = H[B];
            W(ue, F), F += ue.length;
          }
          r.addGroup(k, n.length / 3 - k, 1);
        }
        function W(k, F) {
          let B = k.length;
          for (; --B >= 0;) {
            let fe = B,
              ue = B - 1;
            ue < 0 && (ue = k.length - 1);
            for (let Le = 0, Oe = h + m * 2; Le < Oe; Le++) {
              let Ne = j * Le,
                Fe = j * (Le + 1),
                it = F + fe + Ne,
                Dt = F + ue + Ne,
                E = F + ue + Fe,
                S = F + fe + Fe;
              N(it, Dt, E, S);
            }
          }
        }
        function me(k, F, B) {
          l.push(k), l.push(F), l.push(B);
        }
        function P(k, F, B) {
          Q(k), Q(F), Q(B);
          let fe = n.length / 3,
            ue = y.generateTopUV(r, n, fe - 3, fe - 2, fe - 1);
          K(ue[0]), K(ue[1]), K(ue[2]);
        }
        function N(k, F, B, fe) {
          Q(k), Q(F), Q(fe), Q(F), Q(B), Q(fe);
          let ue = n.length / 3,
            Le = y.generateSideWallUV(r, n, ue - 6, ue - 3, ue - 2, ue - 1);
          K(Le[0]), K(Le[1]), K(Le[3]), K(Le[1]), K(Le[2]), K(Le[3]);
        }
        function Q(k) {
          n.push(l[k * 3 + 0]), n.push(l[k * 3 + 1]), n.push(l[k * 3 + 2]);
        }
        function K(k) {
          s.push(k.x), s.push(k.y);
        }
      }
    }
    copy(e) {
      return super.copy(e), this.parameters = Object.assign({}, e.parameters), this;
    }
    toJSON() {
      let e = super.toJSON(),
        t = this.parameters.shapes,
        r = this.parameters.options;
      return R1(t, r, e);
    }
    static fromJSON(e, t) {
      let r = [];
      for (let s = 0, o = e.shapes.length; s < o; s++) {
        let a = t[e.shapes[s]];
        r.push(a);
      }
      let n = e.options.extrudePath;
      return n !== void 0 && (e.options.extrudePath = new ju[n.type]().fromJSON(n)), new i(r, e.options);
    }
  },
  C1 = {
    generateTopUV: function (i, e, t, r, n) {
      let s = e[t * 3],
        o = e[t * 3 + 1],
        a = e[r * 3],
        l = e[r * 3 + 1],
        c = e[n * 3],
        h = e[n * 3 + 1];
      return [new se(s, o), new se(a, l), new se(c, h)];
    },
    generateSideWallUV: function (i, e, t, r, n, s) {
      let o = e[t * 3],
        a = e[t * 3 + 1],
        l = e[t * 3 + 2],
        c = e[r * 3],
        h = e[r * 3 + 1],
        d = e[r * 3 + 2],
        u = e[n * 3],
        p = e[n * 3 + 1],
        g = e[n * 3 + 2],
        f = e[s * 3],
        m = e[s * 3 + 1],
        v = e[s * 3 + 2];
      return Math.abs(a - h) < Math.abs(o - c) ? [new se(o, 1 - l), new se(c, 1 - d), new se(u, 1 - g), new se(f, 1 - v)] : [new se(a, 1 - l), new se(h, 1 - d), new se(p, 1 - g), new se(m, 1 - v)];
    }
  };
function R1(i, e, t) {
  if (t.shapes = [], Array.isArray(i)) for (let r = 0, n = i.length; r < n; r++) {
    let s = i[r];
    t.shapes.push(s.uuid);
  } else t.shapes.push(i.uuid);
  return t.options = Object.assign({}, e), e.extrudePath !== void 0 && (t.options.extrudePath = e.extrudePath.toJSON()), t;
}
var Yc = class i extends Es {
    constructor(e = 1, t = 0) {
      let r = (1 + Math.sqrt(5)) / 2,
        n = [-1, r, 0, 1, r, 0, -1, -r, 0, 1, -r, 0, 0, -1, r, 0, 1, r, 0, -1, -r, 0, 1, -r, r, 0, -1, r, 0, 1, -r, 0, -1, -r, 0, 1],
        s = [0, 11, 5, 0, 5, 1, 0, 1, 7, 0, 7, 10, 0, 10, 11, 1, 5, 9, 5, 11, 4, 11, 10, 2, 10, 7, 6, 7, 1, 8, 3, 9, 4, 3, 4, 2, 3, 2, 6, 3, 6, 8, 3, 8, 9, 4, 9, 5, 2, 4, 11, 6, 2, 10, 8, 6, 7, 9, 8, 1];
      super(n, s, e, t), this.type = "IcosahedronGeometry", this.parameters = {
        radius: e,
        detail: t
      };
    }
    static fromJSON(e) {
      return new i(e.radius, e.detail);
    }
  },
  Zc = class i extends Es {
    constructor(e = 1, t = 0) {
      let r = [1, 0, 0, -1, 0, 0, 0, 1, 0, 0, -1, 0, 0, 0, 1, 0, 0, -1],
        n = [0, 2, 4, 0, 4, 3, 0, 3, 5, 0, 5, 2, 1, 2, 5, 1, 5, 3, 1, 3, 4, 1, 4, 2];
      super(r, n, e, t), this.type = "OctahedronGeometry", this.parameters = {
        radius: e,
        detail: t
      };
    }
    static fromJSON(e) {
      return new i(e.radius, e.detail);
    }
  },
  Jc = class i extends Tt {
    constructor(e = 0.5, t = 1, r = 32, n = 1, s = 0, o = Math.PI * 2) {
      super(), this.type = "RingGeometry", this.parameters = {
        innerRadius: e,
        outerRadius: t,
        thetaSegments: r,
        phiSegments: n,
        thetaStart: s,
        thetaLength: o
      }, r = Math.max(3, r), n = Math.max(1, n);
      let a = [],
        l = [],
        c = [],
        h = [],
        d = e,
        u = (t - e) / n,
        p = new C(),
        g = new se();
      for (let f = 0; f <= n; f++) {
        for (let m = 0; m <= r; m++) {
          let v = s + m / r * o;
          p.x = d * Math.cos(v), p.y = d * Math.sin(v), l.push(p.x, p.y, p.z), c.push(0, 0, 1), g.x = (p.x / t + 1) / 2, g.y = (p.y / t + 1) / 2, h.push(g.x, g.y);
        }
        d += u;
      }
      for (let f = 0; f < n; f++) {
        let m = f * (r + 1);
        for (let v = 0; v < r; v++) {
          let y = v + m,
            x = y,
            b = y + r + 1,
            w = y + r + 2,
            A = y + 1;
          a.push(x, b, A), a.push(b, w, A);
        }
      }
      this.setIndex(a), this.setAttribute("position", new Ye(l, 3)), this.setAttribute("normal", new Ye(c, 3)), this.setAttribute("uv", new Ye(h, 2));
    }
    copy(e) {
      return super.copy(e), this.parameters = Object.assign({}, e.parameters), this;
    }
    static fromJSON(e) {
      return new i(e.innerRadius, e.outerRadius, e.thetaSegments, e.phiSegments, e.thetaStart, e.thetaLength);
    }
  },
  Kc = class i extends Tt {
    constructor(e = new Ji([new se(0, 0.5), new se(-0.5, -0.5), new se(0.5, -0.5)]), t = 12) {
      super(), this.type = "ShapeGeometry", this.parameters = {
        shapes: e,
        curveSegments: t
      };
      let r = [],
        n = [],
        s = [],
        o = [],
        a = 0,
        l = 0;
      if (Array.isArray(e) === !1) c(e);else for (let h = 0; h < e.length; h++) c(e[h]), this.addGroup(a, l, h), a += l, l = 0;
      this.setIndex(r), this.setAttribute("position", new Ye(n, 3)), this.setAttribute("normal", new Ye(s, 3)), this.setAttribute("uv", new Ye(o, 2));
      function c(h) {
        let d = n.length / 3,
          u = h.extractPoints(t),
          p = u.shape,
          g = u.holes;
        Mi.isClockWise(p) === !1 && (p = p.reverse());
        for (let m = 0, v = g.length; m < v; m++) {
          let y = g[m];
          Mi.isClockWise(y) === !0 && (g[m] = y.reverse());
        }
        let f = Mi.triangulateShape(p, g);
        for (let m = 0, v = g.length; m < v; m++) {
          let y = g[m];
          p = p.concat(y);
        }
        for (let m = 0, v = p.length; m < v; m++) {
          let y = p[m];
          n.push(y.x, y.y, 0), s.push(0, 0, 1), o.push(y.x, y.y);
        }
        for (let m = 0, v = f.length; m < v; m++) {
          let y = f[m],
            x = y[0] + d,
            b = y[1] + d,
            w = y[2] + d;
          r.push(x, b, w), l += 3;
        }
      }
    }
    copy(e) {
      return super.copy(e), this.parameters = Object.assign({}, e.parameters), this;
    }
    toJSON() {
      let e = super.toJSON(),
        t = this.parameters.shapes;
      return P1(t, e);
    }
    static fromJSON(e, t) {
      let r = [];
      for (let n = 0, s = e.shapes.length; n < s; n++) {
        let o = t[e.shapes[n]];
        r.push(o);
      }
      return new i(r, e.curveSegments);
    }
  };
function P1(i, e) {
  if (e.shapes = [], Array.isArray(i)) for (let t = 0, r = i.length; t < r; t++) {
    let n = i[t];
    e.shapes.push(n.uuid);
  } else e.shapes.push(i.uuid);
  return e;
}
var Qi = class i extends Tt {
    constructor(e = 1, t = 32, r = 16, n = 0, s = Math.PI * 2, o = 0, a = Math.PI) {
      super(), this.type = "SphereGeometry", this.parameters = {
        radius: e,
        widthSegments: t,
        heightSegments: r,
        phiStart: n,
        phiLength: s,
        thetaStart: o,
        thetaLength: a
      }, t = Math.max(3, Math.floor(t)), r = Math.max(2, Math.floor(r));
      let l = Math.min(o + a, Math.PI),
        c = 0,
        h = [],
        d = new C(),
        u = new C(),
        p = [],
        g = [],
        f = [],
        m = [];
      for (let v = 0; v <= r; v++) {
        let y = [],
          x = v / r,
          b = 0;
        v == 0 && o == 0 ? b = 0.5 / t : v == r && l == Math.PI && (b = -0.5 / t);
        for (let w = 0; w <= t; w++) {
          let A = w / t;
          d.x = -e * Math.cos(n + A * s) * Math.sin(o + x * a), d.y = e * Math.cos(o + x * a), d.z = e * Math.sin(n + A * s) * Math.sin(o + x * a), g.push(d.x, d.y, d.z), u.copy(d).normalize(), f.push(u.x, u.y, u.z), m.push(A + b, 1 - x), y.push(c++);
        }
        h.push(y);
      }
      for (let v = 0; v < r; v++) for (let y = 0; y < t; y++) {
        let x = h[v][y + 1],
          b = h[v][y],
          w = h[v + 1][y],
          A = h[v + 1][y + 1];
        (v !== 0 || o > 0) && p.push(x, b, A), (v !== r - 1 || l < Math.PI) && p.push(b, w, A);
      }
      this.setIndex(p), this.setAttribute("position", new Ye(g, 3)), this.setAttribute("normal", new Ye(f, 3)), this.setAttribute("uv", new Ye(m, 2));
    }
    copy(e) {
      return super.copy(e), this.parameters = Object.assign({}, e.parameters), this;
    }
    static fromJSON(e) {
      return new i(e.radius, e.widthSegments, e.heightSegments, e.phiStart, e.phiLength, e.thetaStart, e.thetaLength);
    }
  },
  Qc = class i extends Tt {
    constructor(e = 1, t = 0.4, r = 12, n = 48, s = Math.PI * 2) {
      super(), this.type = "TorusGeometry", this.parameters = {
        radius: e,
        tube: t,
        radialSegments: r,
        tubularSegments: n,
        arc: s
      }, r = Math.floor(r), n = Math.floor(n);
      let o = [],
        a = [],
        l = [],
        c = [],
        h = new C(),
        d = new C(),
        u = new C();
      for (let p = 0; p <= r; p++) for (let g = 0; g <= n; g++) {
        let f = g / n * s,
          m = p / r * Math.PI * 2;
        d.x = (e + t * Math.cos(m)) * Math.cos(f), d.y = (e + t * Math.cos(m)) * Math.sin(f), d.z = t * Math.sin(m), a.push(d.x, d.y, d.z), h.x = e * Math.cos(f), h.y = e * Math.sin(f), u.subVectors(d, h).normalize(), l.push(u.x, u.y, u.z), c.push(g / n), c.push(p / r);
      }
      for (let p = 1; p <= r; p++) for (let g = 1; g <= n; g++) {
        let f = (n + 1) * p + g - 1,
          m = (n + 1) * (p - 1) + g - 1,
          v = (n + 1) * (p - 1) + g,
          y = (n + 1) * p + g;
        o.push(f, m, y), o.push(m, v, y);
      }
      this.setIndex(o), this.setAttribute("position", new Ye(a, 3)), this.setAttribute("normal", new Ye(l, 3)), this.setAttribute("uv", new Ye(c, 2));
    }
    copy(e) {
      return super.copy(e), this.parameters = Object.assign({}, e.parameters), this;
    }
    static fromJSON(e) {
      return new i(e.radius, e.tube, e.radialSegments, e.tubularSegments, e.arc);
    }
  },
  Wt = class extends ai {
    constructor(e) {
      super(), this.isMeshStandardMaterial = !0, this.defines = {
        STANDARD: ""
      }, this.type = "MeshStandardMaterial", this.color = new He(16777215), this.roughness = 1, this.metalness = 0, this.map = null, this.lightMap = null, this.lightMapIntensity = 1, this.aoMap = null, this.aoMapIntensity = 1, this.emissive = new He(0), this.emissiveIntensity = 1, this.emissiveMap = null, this.bumpMap = null, this.bumpScale = 1, this.normalMap = null, this.normalMapType = Iu, this.normalScale = new se(1, 1), this.displacementMap = null, this.displacementScale = 1, this.displacementBias = 0, this.roughnessMap = null, this.metalnessMap = null, this.alphaMap = null, this.envMap = null, this.envMapIntensity = 1, this.wireframe = !1, this.wireframeLinewidth = 1, this.wireframeLinecap = "round", this.wireframeLinejoin = "round", this.flatShading = !1, this.fog = !0, this.setValues(e);
    }
    copy(e) {
      return super.copy(e), this.defines = {
        STANDARD: ""
      }, this.color.copy(e.color), this.roughness = e.roughness, this.metalness = e.metalness, this.map = e.map, this.lightMap = e.lightMap, this.lightMapIntensity = e.lightMapIntensity, this.aoMap = e.aoMap, this.aoMapIntensity = e.aoMapIntensity, this.emissive.copy(e.emissive), this.emissiveMap = e.emissiveMap, this.emissiveIntensity = e.emissiveIntensity, this.bumpMap = e.bumpMap, this.bumpScale = e.bumpScale, this.normalMap = e.normalMap, this.normalMapType = e.normalMapType, this.normalScale.copy(e.normalScale), this.displacementMap = e.displacementMap, this.displacementScale = e.displacementScale, this.displacementBias = e.displacementBias, this.roughnessMap = e.roughnessMap, this.metalnessMap = e.metalnessMap, this.alphaMap = e.alphaMap, this.envMap = e.envMap, this.envMapIntensity = e.envMapIntensity, this.wireframe = e.wireframe, this.wireframeLinewidth = e.wireframeLinewidth, this.wireframeLinecap = e.wireframeLinecap, this.wireframeLinejoin = e.wireframeLinejoin, this.flatShading = e.flatShading, this.fog = e.fog, this;
    }
  },
  Ps = class extends kt {
    constructor(e, t = 1) {
      super(), this.isLight = !0, this.type = "Light", this.color = new He(e), this.intensity = t;
    }
    dispose() {}
    copy(e, t) {
      return super.copy(e, t), this.color.copy(e.color), this.intensity = e.intensity, this;
    }
    toJSON(e) {
      let t = super.toJSON(e);
      return t.object.color = this.color.getHex(), t.object.intensity = this.intensity, this.groundColor !== void 0 && (t.object.groundColor = this.groundColor.getHex()), this.distance !== void 0 && (t.object.distance = this.distance), this.angle !== void 0 && (t.object.angle = this.angle), this.decay !== void 0 && (t.object.decay = this.decay), this.penumbra !== void 0 && (t.object.penumbra = this.penumbra), this.shadow !== void 0 && (t.object.shadow = this.shadow.toJSON()), t;
    }
  },
  Ls = class extends Ps {
    constructor(e, t, r) {
      super(e, r), this.isHemisphereLight = !0, this.type = "HemisphereLight", this.position.copy(kt.DEFAULT_UP), this.updateMatrix(), this.groundColor = new He(t);
    }
    copy(e, t) {
      return super.copy(e, t), this.groundColor.copy(e.groundColor), this;
    }
  },
  Ko = new at(),
  ru = new C(),
  iu = new C(),
  Ya = class {
    constructor(e) {
      this.camera = e, this.bias = 0, this.normalBias = 0, this.radius = 1, this.blurSamples = 8, this.mapSize = new se(512, 512), this.map = null, this.mapPass = null, this.matrix = new at(), this.autoUpdate = !0, this.needsUpdate = !1, this._frustum = new Ms(), this._frameExtents = new se(1, 1), this._viewportCount = 1, this._viewports = [new dt(0, 0, 1, 1)];
    }
    getViewportCount() {
      return this._viewportCount;
    }
    getFrustum() {
      return this._frustum;
    }
    updateMatrices(e) {
      let t = this.camera,
        r = this.matrix;
      ru.setFromMatrixPosition(e.matrixWorld), t.position.copy(ru), iu.setFromMatrixPosition(e.target.matrixWorld), t.lookAt(iu), t.updateMatrixWorld(), Ko.multiplyMatrices(t.projectionMatrix, t.matrixWorldInverse), this._frustum.setFromProjectionMatrix(Ko), r.set(0.5, 0, 0, 0.5, 0, 0.5, 0, 0.5, 0, 0, 0.5, 0.5, 0, 0, 0, 1), r.multiply(Ko);
    }
    getViewport(e) {
      return this._viewports[e];
    }
    getFrameExtents() {
      return this._frameExtents;
    }
    dispose() {
      this.map && this.map.dispose(), this.mapPass && this.mapPass.dispose();
    }
    copy(e) {
      return this.camera = e.camera.clone(), this.bias = e.bias, this.radius = e.radius, this.mapSize.copy(e.mapSize), this;
    }
    clone() {
      return new this.constructor().copy(this);
    }
    toJSON() {
      let e = {};
      return this.bias !== 0 && (e.bias = this.bias), this.normalBias !== 0 && (e.normalBias = this.normalBias), this.radius !== 1 && (e.radius = this.radius), (this.mapSize.x !== 512 || this.mapSize.y !== 512) && (e.mapSize = this.mapSize.toArray()), e.camera = this.camera.toJSON(!1).object, delete e.camera.matrix, e;
    }
  },
  nu = new at(),
  is = new C(),
  Qo = new C(),
  $c = class extends Ya {
    constructor() {
      super(new Ot(90, 1, 0.5, 500)), this.isPointLightShadow = !0, this._frameExtents = new se(4, 2), this._viewportCount = 6, this._viewports = [new dt(2, 1, 1, 1), new dt(0, 1, 1, 1), new dt(3, 1, 1, 1), new dt(1, 1, 1, 1), new dt(3, 0, 1, 1), new dt(1, 0, 1, 1)], this._cubeDirections = [new C(1, 0, 0), new C(-1, 0, 0), new C(0, 0, 1), new C(0, 0, -1), new C(0, 1, 0), new C(0, -1, 0)], this._cubeUps = [new C(0, 1, 0), new C(0, 1, 0), new C(0, 1, 0), new C(0, 1, 0), new C(0, 0, 1), new C(0, 0, -1)];
    }
    updateMatrices(e, t = 0) {
      let r = this.camera,
        n = this.matrix,
        s = e.distance || r.far;
      s !== r.far && (r.far = s, r.updateProjectionMatrix()), is.setFromMatrixPosition(e.matrixWorld), r.position.copy(is), Qo.copy(r.position), Qo.add(this._cubeDirections[t]), r.up.copy(this._cubeUps[t]), r.lookAt(Qo), r.updateMatrixWorld(), n.makeTranslation(-is.x, -is.y, -is.z), nu.multiplyMatrices(r.projectionMatrix, r.matrixWorldInverse), this._frustum.setFromProjectionMatrix(nu);
    }
  },
  Za = class extends Ps {
    constructor(e, t, r = 0, n = 2) {
      super(e, t), this.isPointLight = !0, this.type = "PointLight", this.distance = r, this.decay = n, this.shadow = new $c();
    }
    get power() {
      return this.intensity * 4 * Math.PI;
    }
    set power(e) {
      this.intensity = e / (4 * Math.PI);
    }
    dispose() {
      this.shadow.dispose();
    }
    copy(e, t) {
      return super.copy(e, t), this.distance = e.distance, this.decay = e.decay, this.shadow = e.shadow.clone(), this;
    }
  },
  el = class extends Ya {
    constructor() {
      super(new Oa(-5, 5, 5, -5, 0.5, 500)), this.isDirectionalLightShadow = !0;
    }
  },
  Ai = class extends Ps {
    constructor(e, t) {
      super(e, t), this.isDirectionalLight = !0, this.type = "DirectionalLight", this.position.copy(kt.DEFAULT_UP), this.updateMatrix(), this.target = new kt(), this.shadow = new el();
    }
    dispose() {
      this.shadow.dispose();
    }
    copy(e) {
      return super.copy(e), this.target = e.target.clone(), this.shadow = e.shadow.clone(), this;
    }
  };
typeof __THREE_DEVTOOLS__ < "u" && __THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register", {
  detail: {
    revision: ml
  }
}));
typeof window < "u" && (window.__THREE__ ? console.warn("WARNING: Multiple instances of Three.js being imported.") : window.__THREE__ = ml);
var Zu = !0,
  Ju = !0;
function hs(i, e, t) {
  let r = i.match(e);
  return r && r.length >= t && parseFloat(r[t], 10);
}
function en(i, e, t) {
  if (!i.RTCPeerConnection) return;
  if (!Object.getOwnPropertyDescriptor(EventTarget.prototype, "addEventListener").writable) {
    yl("Unable to polyfill events");
    return;
  }
  let r = i.RTCPeerConnection.prototype,
    n = r.addEventListener;
  r.addEventListener = function (o, a) {
    if (o !== e) return n.apply(this, arguments);
    let l = c => {
      let h = t(c);
      h && (a.handleEvent ? a.handleEvent(h) : a(h));
    };
    return this._eventMap = this._eventMap || {}, this._eventMap[e] || (this._eventMap[e] = new Map()), this._eventMap[e].set(a, l), n.apply(this, [o, l]);
  };
  let s = r.removeEventListener;
  r.removeEventListener = function (o, a) {
    if (o !== e || !this._eventMap || !this._eventMap[e]) return s.apply(this, arguments);
    if (!this._eventMap[e].has(a)) return s.apply(this, arguments);
    let l = this._eventMap[e].get(a);
    return this._eventMap[e].delete(a), this._eventMap[e].size === 0 && delete this._eventMap[e], Object.keys(this._eventMap).length === 0 && delete this._eventMap, s.apply(this, [o, l]);
  }, Object.defineProperty(r, "on" + e, {
    get() {
      return this["_on" + e];
    },
    set(o) {
      this["_on" + e] && (this.removeEventListener(e, this["_on" + e]), delete this["_on" + e]), o && this.addEventListener(e, this["_on" + e] = o);
    },
    enumerable: !0,
    configurable: !0
  });
}
function L1(i) {
  return typeof i != "boolean" ? new Error("Argument type: " + typeof i + ". Please use a boolean.") : (Zu = i, i ? "adapter.js logging disabled" : "adapter.js logging enabled");
}
function D1(i) {
  return typeof i != "boolean" ? new Error("Argument type: " + typeof i + ". Please use a boolean.") : (Ju = !i, "adapter.js deprecation warnings " + (i ? "disabled" : "enabled"));
}
function yl() {
  if (typeof window == "object") {
    if (Zu) return;
    typeof console < "u" && typeof console.log == "function" && console.log.apply(console, arguments);
  }
}
function bl(i, e) {
  Ju && console.warn(i + " is deprecated, please use " + e + " instead.");
}
function z1(i) {
  let e = {
    browser: null,
    version: null
  };
  if (typeof i > "u" || !i.navigator || !i.navigator.userAgent) return e.browser = "Not a browser.", e;
  let {
    navigator: t
  } = i;
  if (t.userAgentData && t.userAgentData.brands) {
    let r = t.userAgentData.brands.find(n => n.brand === "Chromium");
    if (r) {
      let n = parseInt(r.version, 10);
      if (n >= 90) return {
        browser: "chrome",
        version: n
      };
    }
  }
  if (t.mozGetUserMedia) e.browser = "firefox", e.version = parseInt(hs(t.userAgent, /Firefox\/(\d+)\./, 1));else if (t.webkitGetUserMedia || i.isSecureContext === !1 && i.webkitRTCPeerConnection) e.browser = "chrome", e.version = parseInt(hs(t.userAgent, /Chrom(e|ium)\/(\d+)\./, 2)) || null;else if (i.RTCPeerConnection && t.userAgent.match(/AppleWebKit\/(\d+)\./)) e.browser = "safari", e.version = parseInt(hs(t.userAgent, /AppleWebKit\/(\d+)\./, 1)), e.supportsUnifiedPlan = i.RTCRtpTransceiver && "currentDirection" in i.RTCRtpTransceiver.prototype, e._safariVersion = hs(t.userAgent, /Version\/(\d+(\.?\d+))/, 1);else return e.browser = "Not a supported browser.", e;
  return e;
}
function su(i) {
  return Object.prototype.toString.call(i) === "[object Object]";
}
function Ku(i) {
  return su(i) ? Object.keys(i).reduce(function (e, t) {
    let r = su(i[t]),
      n = r ? Ku(i[t]) : i[t],
      s = r && !Object.keys(n).length;
    return n === void 0 || s ? e : Object.assign(e, {
      [t]: n
    });
  }, {}) : i;
}
function tl(i, e, t) {
  !e || t.has(e.id) || (t.set(e.id, e), Object.keys(e).forEach(r => {
    r.endsWith("Id") ? tl(i, i.get(e[r]), t) : r.endsWith("Ids") && e[r].forEach(n => {
      tl(i, i.get(n), t);
    });
  }));
}
function au(i, e, t) {
  let r = t ? "outbound-rtp" : "inbound-rtp",
    n = new Map();
  if (e === null) return n;
  let s = [];
  return i.forEach(o => {
    o.type === "track" && o.trackIdentifier === e.id && s.push(o);
  }), s.forEach(o => {
    i.forEach(a => {
      a.type === r && a.trackId === o.id && tl(i, a, n);
    });
  }), n;
}
var ou = yl;
function Qu(i, e) {
  if (e.version >= 64) return;
  let t = i && i.navigator;
  if (!t.mediaDevices) return;
  let r = function (a) {
      if (typeof a != "object" || a.mandatory || a.optional) return a;
      let l = {};
      return Object.keys(a).forEach(c => {
        if (c === "require" || c === "advanced" || c === "mediaSource") return;
        let h = typeof a[c] == "object" ? a[c] : {
          ideal: a[c]
        };
        h.exact !== void 0 && typeof h.exact == "number" && (h.min = h.max = h.exact);
        let d = function (u, p) {
          return u ? u + p.charAt(0).toUpperCase() + p.slice(1) : p === "deviceId" ? "sourceId" : p;
        };
        if (h.ideal !== void 0) {
          l.optional = l.optional || [];
          let u = {};
          typeof h.ideal == "number" ? (u[d("min", c)] = h.ideal, l.optional.push(u), u = {}, u[d("max", c)] = h.ideal, l.optional.push(u)) : (u[d("", c)] = h.ideal, l.optional.push(u));
        }
        h.exact !== void 0 && typeof h.exact != "number" ? (l.mandatory = l.mandatory || {}, l.mandatory[d("", c)] = h.exact) : ["min", "max"].forEach(u => {
          h[u] !== void 0 && (l.mandatory = l.mandatory || {}, l.mandatory[d(u, c)] = h[u]);
        });
      }), a.advanced && (l.optional = (l.optional || []).concat(a.advanced)), l;
    },
    n = function (a, l) {
      if (e.version >= 61) return l(a);
      if (a = JSON.parse(JSON.stringify(a)), a && typeof a.audio == "object") {
        let c = function (h, d, u) {
          d in h && !(u in h) && (h[u] = h[d], delete h[d]);
        };
        a = JSON.parse(JSON.stringify(a)), c(a.audio, "autoGainControl", "googAutoGainControl"), c(a.audio, "noiseSuppression", "googNoiseSuppression"), a.audio = r(a.audio);
      }
      if (a && typeof a.video == "object") {
        let c = a.video.facingMode;
        c = c && (typeof c == "object" ? c : {
          ideal: c
        });
        let h = e.version < 66;
        if (c && (c.exact === "user" || c.exact === "environment" || c.ideal === "user" || c.ideal === "environment") && !(t.mediaDevices.getSupportedConstraints && t.mediaDevices.getSupportedConstraints().facingMode && !h)) {
          delete a.video.facingMode;
          let d;
          if (c.exact === "environment" || c.ideal === "environment" ? d = ["back", "rear"] : (c.exact === "user" || c.ideal === "user") && (d = ["front"]), d) return t.mediaDevices.enumerateDevices().then(u => {
            u = u.filter(g => g.kind === "videoinput");
            let p = u.find(g => d.some(f => g.label.toLowerCase().includes(f)));
            return !p && u.length && d.includes("back") && (p = u[u.length - 1]), p && (a.video.deviceId = c.exact ? {
              exact: p.deviceId
            } : {
              ideal: p.deviceId
            }), a.video = r(a.video), ou("chrome: " + JSON.stringify(a)), l(a);
          });
        }
        a.video = r(a.video);
      }
      return ou("chrome: " + JSON.stringify(a)), l(a);
    },
    s = function (a) {
      return e.version >= 64 ? a : {
        name: {
          PermissionDeniedError: "NotAllowedError",
          PermissionDismissedError: "NotAllowedError",
          InvalidStateError: "NotAllowedError",
          DevicesNotFoundError: "NotFoundError",
          ConstraintNotSatisfiedError: "OverconstrainedError",
          TrackStartError: "NotReadableError",
          MediaDeviceFailedDueToShutdown: "NotAllowedError",
          MediaDeviceKillSwitchOn: "NotAllowedError",
          TabCaptureError: "AbortError",
          ScreenCaptureError: "AbortError",
          DeviceCaptureError: "AbortError"
        }[a.name] || a.name,
        message: a.message,
        constraint: a.constraint || a.constraintName,
        toString() {
          return this.name + (this.message && ": ") + this.message;
        }
      };
    },
    o = function (a, l, c) {
      n(a, h => {
        t.webkitGetUserMedia(h, l, d => {
          c && c(s(d));
        });
      });
    };
  if (t.getUserMedia = o.bind(t), t.mediaDevices.getUserMedia) {
    let a = t.mediaDevices.getUserMedia.bind(t.mediaDevices);
    t.mediaDevices.getUserMedia = function (l) {
      return n(l, c => a(c).then(h => {
        if (c.audio && !h.getAudioTracks().length || c.video && !h.getVideoTracks().length) throw h.getTracks().forEach(d => {
          d.stop();
        }), new DOMException("", "NotFoundError");
        return h;
      }, h => Promise.reject(s(h))));
    };
  }
}
function $u(i) {
  i.MediaStream = i.MediaStream || i.webkitMediaStream;
}
function ed(i, e) {
  if (!(e.version > 102)) if (typeof i == "object" && i.RTCPeerConnection && !("ontrack" in i.RTCPeerConnection.prototype)) {
    Object.defineProperty(i.RTCPeerConnection.prototype, "ontrack", {
      get() {
        return this._ontrack;
      },
      set(r) {
        this._ontrack && this.removeEventListener("track", this._ontrack), this.addEventListener("track", this._ontrack = r);
      },
      enumerable: !0,
      configurable: !0
    });
    let t = i.RTCPeerConnection.prototype.setRemoteDescription;
    i.RTCPeerConnection.prototype.setRemoteDescription = function () {
      return this._ontrackpoly || (this._ontrackpoly = r => {
        r.stream.addEventListener("addtrack", n => {
          let s;
          i.RTCPeerConnection.prototype.getReceivers ? s = this.getReceivers().find(a => a.track && a.track.id === n.track.id) : s = {
            track: n.track
          };
          let o = new Event("track");
          o.track = n.track, o.receiver = s, o.transceiver = {
            receiver: s
          }, o.streams = [r.stream], this.dispatchEvent(o);
        }), r.stream.getTracks().forEach(n => {
          let s;
          i.RTCPeerConnection.prototype.getReceivers ? s = this.getReceivers().find(a => a.track && a.track.id === n.id) : s = {
            track: n
          };
          let o = new Event("track");
          o.track = n, o.receiver = s, o.transceiver = {
            receiver: s
          }, o.streams = [r.stream], this.dispatchEvent(o);
        });
      }, this.addEventListener("addstream", this._ontrackpoly)), t.apply(this, arguments);
    };
  } else en(i, "track", t => (t.transceiver || Object.defineProperty(t, "transceiver", {
    value: {
      receiver: t.receiver
    }
  }), t));
}
function td(i) {
  if (typeof i == "object" && i.RTCPeerConnection && !("getSenders" in i.RTCPeerConnection.prototype) && "createDTMFSender" in i.RTCPeerConnection.prototype) {
    let e = function (n, s) {
      return {
        track: s,
        get dtmf() {
          return this._dtmf === void 0 && (s.kind === "audio" ? this._dtmf = n.createDTMFSender(s) : this._dtmf = null), this._dtmf;
        },
        _pc: n
      };
    };
    if (!i.RTCPeerConnection.prototype.getSenders) {
      i.RTCPeerConnection.prototype.getSenders = function () {
        return this._senders = this._senders || [], this._senders.slice();
      };
      let n = i.RTCPeerConnection.prototype.addTrack;
      i.RTCPeerConnection.prototype.addTrack = function (o, a) {
        let l = n.apply(this, arguments);
        return l || (l = e(this, o), this._senders.push(l)), l;
      };
      let s = i.RTCPeerConnection.prototype.removeTrack;
      i.RTCPeerConnection.prototype.removeTrack = function (o) {
        s.apply(this, arguments);
        let a = this._senders.indexOf(o);
        a !== -1 && this._senders.splice(a, 1);
      };
    }
    let t = i.RTCPeerConnection.prototype.addStream;
    i.RTCPeerConnection.prototype.addStream = function (n) {
      this._senders = this._senders || [], t.apply(this, [n]), n.getTracks().forEach(s => {
        this._senders.push(e(this, s));
      });
    };
    let r = i.RTCPeerConnection.prototype.removeStream;
    i.RTCPeerConnection.prototype.removeStream = function (n) {
      this._senders = this._senders || [], r.apply(this, [n]), n.getTracks().forEach(s => {
        let o = this._senders.find(a => a.track === s);
        o && this._senders.splice(this._senders.indexOf(o), 1);
      });
    };
  } else if (typeof i == "object" && i.RTCPeerConnection && "getSenders" in i.RTCPeerConnection.prototype && "createDTMFSender" in i.RTCPeerConnection.prototype && i.RTCRtpSender && !("dtmf" in i.RTCRtpSender.prototype)) {
    let e = i.RTCPeerConnection.prototype.getSenders;
    i.RTCPeerConnection.prototype.getSenders = function () {
      let t = e.apply(this, []);
      return t.forEach(r => r._pc = this), t;
    }, Object.defineProperty(i.RTCRtpSender.prototype, "dtmf", {
      get() {
        return this._dtmf === void 0 && (this.track.kind === "audio" ? this._dtmf = this._pc.createDTMFSender(this.track) : this._dtmf = null), this._dtmf;
      }
    });
  }
}
function rd(i, e) {
  if (e.version >= 67 || !(typeof i == "object" && i.RTCPeerConnection && i.RTCRtpSender && i.RTCRtpReceiver)) return;
  if (!("getStats" in i.RTCRtpSender.prototype)) {
    let r = i.RTCPeerConnection.prototype.getSenders;
    r && (i.RTCPeerConnection.prototype.getSenders = function () {
      let s = r.apply(this, []);
      return s.forEach(o => o._pc = this), s;
    });
    let n = i.RTCPeerConnection.prototype.addTrack;
    n && (i.RTCPeerConnection.prototype.addTrack = function () {
      let s = n.apply(this, arguments);
      return s._pc = this, s;
    }), i.RTCRtpSender.prototype.getStats = function () {
      let s = this;
      return this._pc.getStats().then(o => au(o, s.track, !0));
    };
  }
  if (!("getStats" in i.RTCRtpReceiver.prototype)) {
    let r = i.RTCPeerConnection.prototype.getReceivers;
    r && (i.RTCPeerConnection.prototype.getReceivers = function () {
      let n = r.apply(this, []);
      return n.forEach(s => s._pc = this), n;
    }), en(i, "track", n => (n.receiver._pc = n.srcElement, n)), i.RTCRtpReceiver.prototype.getStats = function () {
      let n = this;
      return this._pc.getStats().then(s => au(s, n.track, !1));
    };
  }
  if (!("getStats" in i.RTCRtpSender.prototype && "getStats" in i.RTCRtpReceiver.prototype)) return;
  let t = i.RTCPeerConnection.prototype.getStats;
  i.RTCPeerConnection.prototype.getStats = function () {
    if (arguments.length > 0 && arguments[0] instanceof i.MediaStreamTrack) {
      let r = arguments[0],
        n,
        s,
        o;
      return this.getSenders().forEach(a => {
        a.track === r && (n ? o = !0 : n = a);
      }), this.getReceivers().forEach(a => (a.track === r && (s ? o = !0 : s = a), a.track === r)), o || n && s ? Promise.reject(new DOMException("There are more than one sender or receiver for the track.", "InvalidAccessError")) : n ? n.getStats() : s ? s.getStats() : Promise.reject(new DOMException("There is no sender or receiver for the track.", "InvalidAccessError"));
    }
    return t.apply(this, arguments);
  };
}
function id(i) {
  i.RTCPeerConnection.prototype.getLocalStreams = function () {
    return this._shimmedLocalStreams = this._shimmedLocalStreams || {}, Object.keys(this._shimmedLocalStreams).map(s => this._shimmedLocalStreams[s][0]);
  };
  let e = i.RTCPeerConnection.prototype.addTrack;
  i.RTCPeerConnection.prototype.addTrack = function (s, o) {
    if (!o) return e.apply(this, arguments);
    this._shimmedLocalStreams = this._shimmedLocalStreams || {};
    let a = e.apply(this, arguments);
    return this._shimmedLocalStreams[o.id] ? this._shimmedLocalStreams[o.id].indexOf(a) === -1 && this._shimmedLocalStreams[o.id].push(a) : this._shimmedLocalStreams[o.id] = [o, a], a;
  };
  let t = i.RTCPeerConnection.prototype.addStream;
  i.RTCPeerConnection.prototype.addStream = function (s) {
    this._shimmedLocalStreams = this._shimmedLocalStreams || {}, s.getTracks().forEach(l => {
      if (this.getSenders().find(c => c.track === l)) throw new DOMException("Track already exists.", "InvalidAccessError");
    });
    let o = this.getSenders();
    t.apply(this, arguments);
    let a = this.getSenders().filter(l => o.indexOf(l) === -1);
    this._shimmedLocalStreams[s.id] = [s].concat(a);
  };
  let r = i.RTCPeerConnection.prototype.removeStream;
  i.RTCPeerConnection.prototype.removeStream = function (s) {
    return this._shimmedLocalStreams = this._shimmedLocalStreams || {}, delete this._shimmedLocalStreams[s.id], r.apply(this, arguments);
  };
  let n = i.RTCPeerConnection.prototype.removeTrack;
  i.RTCPeerConnection.prototype.removeTrack = function (s) {
    return this._shimmedLocalStreams = this._shimmedLocalStreams || {}, s && Object.keys(this._shimmedLocalStreams).forEach(o => {
      let a = this._shimmedLocalStreams[o].indexOf(s);
      a !== -1 && this._shimmedLocalStreams[o].splice(a, 1), this._shimmedLocalStreams[o].length === 1 && delete this._shimmedLocalStreams[o];
    }), n.apply(this, arguments);
  };
}
function nd(i, e) {
  if (!i.RTCPeerConnection) return;
  if (i.RTCPeerConnection.prototype.addTrack && e.version >= 65) return id(i);
  let t = i.RTCPeerConnection.prototype.getLocalStreams;
  i.RTCPeerConnection.prototype.getLocalStreams = function () {
    let c = t.apply(this);
    return this._reverseStreams = this._reverseStreams || {}, c.map(h => this._reverseStreams[h.id]);
  };
  let r = i.RTCPeerConnection.prototype.addStream;
  i.RTCPeerConnection.prototype.addStream = function (c) {
    if (this._streams = this._streams || {}, this._reverseStreams = this._reverseStreams || {}, c.getTracks().forEach(h => {
      if (this.getSenders().find(d => d.track === h)) throw new DOMException("Track already exists.", "InvalidAccessError");
    }), !this._reverseStreams[c.id]) {
      let h = new i.MediaStream(c.getTracks());
      this._streams[c.id] = h, this._reverseStreams[h.id] = c, c = h;
    }
    r.apply(this, [c]);
  };
  let n = i.RTCPeerConnection.prototype.removeStream;
  i.RTCPeerConnection.prototype.removeStream = function (c) {
    this._streams = this._streams || {}, this._reverseStreams = this._reverseStreams || {}, n.apply(this, [this._streams[c.id] || c]), delete this._reverseStreams[this._streams[c.id] ? this._streams[c.id].id : c.id], delete this._streams[c.id];
  }, i.RTCPeerConnection.prototype.addTrack = function (c, h) {
    if (this.signalingState === "closed") throw new DOMException("The RTCPeerConnection's signalingState is 'closed'.", "InvalidStateError");
    let d = [].slice.call(arguments, 1);
    if (d.length !== 1 || !d[0].getTracks().find(p => p === c)) throw new DOMException("The adapter.js addTrack polyfill only supports a single  stream which is associated with the specified track.", "NotSupportedError");
    if (this.getSenders().find(p => p.track === c)) throw new DOMException("Track already exists.", "InvalidAccessError");
    this._streams = this._streams || {}, this._reverseStreams = this._reverseStreams || {};
    let u = this._streams[h.id];
    if (u) u.addTrack(c), Promise.resolve().then(() => {
      this.dispatchEvent(new Event("negotiationneeded"));
    });else {
      let p = new i.MediaStream([c]);
      this._streams[h.id] = p, this._reverseStreams[p.id] = h, this.addStream(p);
    }
    return this.getSenders().find(p => p.track === c);
  };
  function s(c, h) {
    let d = h.sdp;
    return Object.keys(c._reverseStreams || []).forEach(u => {
      let p = c._reverseStreams[u],
        g = c._streams[p.id];
      d = d.replace(new RegExp(g.id, "g"), p.id);
    }), new RTCSessionDescription({
      type: h.type,
      sdp: d
    });
  }
  function o(c, h) {
    let d = h.sdp;
    return Object.keys(c._reverseStreams || []).forEach(u => {
      let p = c._reverseStreams[u],
        g = c._streams[p.id];
      d = d.replace(new RegExp(p.id, "g"), g.id);
    }), new RTCSessionDescription({
      type: h.type,
      sdp: d
    });
  }
  ["createOffer", "createAnswer"].forEach(function (c) {
    let h = i.RTCPeerConnection.prototype[c],
      d = {
        [c]() {
          let u = arguments;
          return arguments.length && typeof arguments[0] == "function" ? h.apply(this, [p => {
            let g = s(this, p);
            u[0].apply(null, [g]);
          }, p => {
            u[1] && u[1].apply(null, p);
          }, arguments[2]]) : h.apply(this, arguments).then(p => s(this, p));
        }
      };
    i.RTCPeerConnection.prototype[c] = d[c];
  });
  let a = i.RTCPeerConnection.prototype.setLocalDescription;
  i.RTCPeerConnection.prototype.setLocalDescription = function () {
    return !arguments.length || !arguments[0].type ? a.apply(this, arguments) : (arguments[0] = o(this, arguments[0]), a.apply(this, arguments));
  };
  let l = Object.getOwnPropertyDescriptor(i.RTCPeerConnection.prototype, "localDescription");
  Object.defineProperty(i.RTCPeerConnection.prototype, "localDescription", {
    get() {
      let c = l.get.apply(this);
      return c.type === "" ? c : s(this, c);
    }
  }), i.RTCPeerConnection.prototype.removeTrack = function (c) {
    if (this.signalingState === "closed") throw new DOMException("The RTCPeerConnection's signalingState is 'closed'.", "InvalidStateError");
    if (!c._pc) throw new DOMException("Argument 1 of RTCPeerConnection.removeTrack does not implement interface RTCRtpSender.", "TypeError");
    if (c._pc !== this) throw new DOMException("Sender was not created by this connection.", "InvalidAccessError");
    this._streams = this._streams || {};
    let h;
    Object.keys(this._streams).forEach(d => {
      this._streams[d].getTracks().find(u => c.track === u) && (h = this._streams[d]);
    }), h && (h.getTracks().length === 1 ? this.removeStream(this._reverseStreams[h.id]) : h.removeTrack(c.track), this.dispatchEvent(new Event("negotiationneeded")));
  };
}
function rl(i, e) {
  !i.RTCPeerConnection && i.webkitRTCPeerConnection && (i.RTCPeerConnection = i.webkitRTCPeerConnection), i.RTCPeerConnection && e.version < 53 && ["setLocalDescription", "setRemoteDescription", "addIceCandidate"].forEach(function (t) {
    let r = i.RTCPeerConnection.prototype[t],
      n = {
        [t]() {
          return arguments[0] = new (t === "addIceCandidate" ? i.RTCIceCandidate : i.RTCSessionDescription)(arguments[0]), r.apply(this, arguments);
        }
      };
    i.RTCPeerConnection.prototype[t] = n[t];
  });
}
function sd(i, e) {
  e.version > 102 || en(i, "negotiationneeded", t => {
    let r = t.target;
    if (!((e.version < 72 || r.getConfiguration && r.getConfiguration().sdpSemantics === "plan-b") && r.signalingState !== "stable")) return t;
  });
}
var cu = Object.freeze(Object.defineProperty({
  __proto__: null,
  fixNegotiationNeeded: sd,
  shimAddTrackRemoveTrack: nd,
  shimAddTrackRemoveTrackWithNative: id,
  shimGetSendersWithDtmf: td,
  shimGetUserMedia: Qu,
  shimMediaStream: $u,
  shimOnTrack: ed,
  shimPeerConnection: rl,
  shimSenderReceiverGetStats: rd
}, Symbol.toStringTag, {
  value: "Module"
}));
function ad(i, e) {
  let t = i && i.navigator;
  if (!t.mediaDevices) return;
  let r = i && i.MediaStreamTrack;
  if (t.getUserMedia = function (n, s, o) {
    bl("navigator.getUserMedia", "navigator.mediaDevices.getUserMedia"), t.mediaDevices.getUserMedia(n).then(s, o);
  }, !(e.version > 55 && "autoGainControl" in t.mediaDevices.getSupportedConstraints())) {
    let n = function (o, a, l) {
        a in o && !(l in o) && (o[l] = o[a], delete o[a]);
      },
      s = t.mediaDevices.getUserMedia.bind(t.mediaDevices);
    if (t.mediaDevices.getUserMedia = function (o) {
      return typeof o == "object" && typeof o.audio == "object" && (o = JSON.parse(JSON.stringify(o)), n(o.audio, "autoGainControl", "mozAutoGainControl"), n(o.audio, "noiseSuppression", "mozNoiseSuppression")), s(o);
    }, r && r.prototype.getSettings) {
      let o = r.prototype.getSettings;
      r.prototype.getSettings = function () {
        let a = o.apply(this, arguments);
        return n(a, "mozAutoGainControl", "autoGainControl"), n(a, "mozNoiseSuppression", "noiseSuppression"), a;
      };
    }
    if (r && r.prototype.applyConstraints) {
      let o = r.prototype.applyConstraints;
      r.prototype.applyConstraints = function (a) {
        return this.kind === "audio" && typeof a == "object" && (a = JSON.parse(JSON.stringify(a)), n(a, "autoGainControl", "mozAutoGainControl"), n(a, "noiseSuppression", "mozNoiseSuppression")), o.apply(this, [a]);
      };
    }
  }
}
function I1(i, e) {
  i.navigator.mediaDevices && (i.navigator.mediaDevices && "getDisplayMedia" in i.navigator.mediaDevices || (i.navigator.mediaDevices.getDisplayMedia = function (t) {
    if (!(t && t.video)) {
      let r = new DOMException("getDisplayMedia without video constraints is undefined");
      return r.name = "NotFoundError", r.code = 8, Promise.reject(r);
    }
    return t.video === !0 ? t.video = {
      mediaSource: e
    } : t.video.mediaSource = e, i.navigator.mediaDevices.getUserMedia(t);
  }));
}
function od(i) {
  typeof i == "object" && i.RTCTrackEvent && "receiver" in i.RTCTrackEvent.prototype && !("transceiver" in i.RTCTrackEvent.prototype) && Object.defineProperty(i.RTCTrackEvent.prototype, "transceiver", {
    get() {
      return {
        receiver: this.receiver
      };
    }
  });
}
function il(i, e) {
  typeof i != "object" || !(i.RTCPeerConnection || i.mozRTCPeerConnection) || (!i.RTCPeerConnection && i.mozRTCPeerConnection && (i.RTCPeerConnection = i.mozRTCPeerConnection), e.version < 53 && ["setLocalDescription", "setRemoteDescription", "addIceCandidate"].forEach(function (t) {
    let r = i.RTCPeerConnection.prototype[t],
      n = {
        [t]() {
          return arguments[0] = new (t === "addIceCandidate" ? i.RTCIceCandidate : i.RTCSessionDescription)(arguments[0]), r.apply(this, arguments);
        }
      };
    i.RTCPeerConnection.prototype[t] = n[t];
  }));
}
function cd(i, e) {
  if (typeof i != "object" || !(i.RTCPeerConnection || i.mozRTCPeerConnection) || e.version >= 151) return;
  let t = {
      inboundrtp: "inbound-rtp",
      outboundrtp: "outbound-rtp",
      candidatepair: "candidate-pair",
      localcandidate: "local-candidate",
      remotecandidate: "remote-candidate"
    },
    r = i.RTCPeerConnection.prototype.getStats;
  i.RTCPeerConnection.prototype.getStats = function () {
    let [n, s, o] = arguments;
    return this.signalingState === "closed" ? Promise.resolve(new Map()) : r.apply(this, [n || null]).then(a => {
      if (e.version < 53 && !s) try {
        a.forEach(l => {
          l.type = t[l.type] || l.type;
        });
      } catch (l) {
        if (l.name !== "TypeError") throw l;
        a.forEach((c, h) => {
          a.set(h, Object.assign({}, c, {
            type: t[c.type] || c.type
          }));
        });
      }
      return a;
    }).then(s, o);
  };
}
function ld(i) {
  if (!(typeof i == "object" && i.RTCPeerConnection && i.RTCRtpSender) || i.RTCRtpSender && "getStats" in i.RTCRtpSender.prototype) return;
  let e = i.RTCPeerConnection.prototype.getSenders;
  e && (i.RTCPeerConnection.prototype.getSenders = function () {
    let r = e.apply(this, []);
    return r.forEach(n => n._pc = this), r;
  });
  let t = i.RTCPeerConnection.prototype.addTrack;
  t && (i.RTCPeerConnection.prototype.addTrack = function () {
    let r = t.apply(this, arguments);
    return r._pc = this, r;
  }), i.RTCRtpSender.prototype.getStats = function () {
    return this.track ? this._pc.getStats(this.track) : Promise.resolve(new Map());
  };
}
function hd(i) {
  if (!(typeof i == "object" && i.RTCPeerConnection && i.RTCRtpSender) || i.RTCRtpSender && "getStats" in i.RTCRtpReceiver.prototype) return;
  let e = i.RTCPeerConnection.prototype.getReceivers;
  e && (i.RTCPeerConnection.prototype.getReceivers = function () {
    let t = e.apply(this, []);
    return t.forEach(r => r._pc = this), t;
  }), en(i, "track", t => (t.receiver._pc = t.srcElement, t)), i.RTCRtpReceiver.prototype.getStats = function () {
    return this._pc.getStats(this.track);
  };
}
function ud(i) {
  !i.RTCPeerConnection || "removeStream" in i.RTCPeerConnection.prototype || (i.RTCPeerConnection.prototype.removeStream = function (e) {
    bl("removeStream", "removeTrack"), this.getSenders().forEach(t => {
      t.track && e.getTracks().includes(t.track) && this.removeTrack(t);
    });
  });
}
function dd(i) {
  i.DataChannel && !i.RTCDataChannel && (i.RTCDataChannel = i.DataChannel);
}
function pd(i, e) {
  if (!(typeof i == "object" && i.RTCPeerConnection) || e.version >= 110) return;
  let t = i.RTCPeerConnection.prototype.addTransceiver;
  t && (i.RTCPeerConnection.prototype.addTransceiver = function () {
    this.setParametersPromises = [];
    let r = arguments[1] && arguments[1].sendEncodings;
    r === void 0 && (r = []), r = [...r];
    let n = r.length > 0;
    n && r.forEach(o => {
      if ("rid" in o && !/^[a-z0-9]{0,16}$/i.test(o.rid)) throw new TypeError("Invalid RID value provided.");
      if ("scaleResolutionDownBy" in o && !(parseFloat(o.scaleResolutionDownBy) >= 1)) throw new RangeError("scale_resolution_down_by must be >= 1.0");
      if ("maxFramerate" in o && !(parseFloat(o.maxFramerate) >= 0)) throw new RangeError("max_framerate must be >= 0.0");
    });
    let s = t.apply(this, arguments);
    if (n) {
      let {
          sender: o
        } = s,
        a = o.getParameters();
      (!("encodings" in a) || a.encodings.length === 1 && Object.keys(a.encodings[0]).length === 0) && (a.encodings = r, o.sendEncodings = r, this.setParametersPromises.push(o.setParameters(a).then(() => {
        delete o.sendEncodings;
      }).catch(() => {
        delete o.sendEncodings;
      })));
    }
    return s;
  });
}
function fd(i, e) {
  if (!(typeof i == "object" && i.RTCRtpSender) || e.version >= 110) return;
  let t = i.RTCRtpSender.prototype.getParameters;
  t && (i.RTCRtpSender.prototype.getParameters = function () {
    let r = t.apply(this, arguments);
    return "encodings" in r || (r.encodings = [].concat(this.sendEncodings || [{}])), r;
  });
}
function md(i, e) {
  if (!(typeof i == "object" && i.RTCPeerConnection) || e.version >= 110) return;
  let t = i.RTCPeerConnection.prototype.createOffer;
  i.RTCPeerConnection.prototype.createOffer = function () {
    return this.setParametersPromises && this.setParametersPromises.length ? Promise.all(this.setParametersPromises).then(() => t.apply(this, arguments)).finally(() => {
      this.setParametersPromises = [];
    }) : t.apply(this, arguments);
  };
}
function gd(i, e) {
  if (!(typeof i == "object" && i.RTCPeerConnection) || e.version >= 110) return;
  let t = i.RTCPeerConnection.prototype.createAnswer;
  i.RTCPeerConnection.prototype.createAnswer = function () {
    return this.setParametersPromises && this.setParametersPromises.length ? Promise.all(this.setParametersPromises).then(() => t.apply(this, arguments)).finally(() => {
      this.setParametersPromises = [];
    }) : t.apply(this, arguments);
  };
}
var lu = Object.freeze(Object.defineProperty({
  __proto__: null,
  shimAddTransceiver: pd,
  shimCreateAnswer: gd,
  shimCreateOffer: md,
  shimGetDisplayMedia: I1,
  shimGetParameters: fd,
  shimGetStats: cd,
  shimGetUserMedia: ad,
  shimOnTrack: od,
  shimPeerConnection: il,
  shimRTCDataChannel: dd,
  shimReceiverGetStats: hd,
  shimRemoveStream: ud,
  shimSenderGetStats: ld
}, Symbol.toStringTag, {
  value: "Module"
}));
function vd(i) {
  if (!(typeof i != "object" || !i.RTCPeerConnection)) {
    if ("getLocalStreams" in i.RTCPeerConnection.prototype || (i.RTCPeerConnection.prototype.getLocalStreams = function () {
      return this._localStreams || (this._localStreams = []), this._localStreams;
    }), !("addStream" in i.RTCPeerConnection.prototype)) {
      let e = i.RTCPeerConnection.prototype.addTrack;
      i.RTCPeerConnection.prototype.addStream = function (t) {
        this._localStreams || (this._localStreams = []), this._localStreams.includes(t) || this._localStreams.push(t), t.getAudioTracks().forEach(r => e.call(this, r, t)), t.getVideoTracks().forEach(r => e.call(this, r, t));
      }, i.RTCPeerConnection.prototype.addTrack = function (t, ...r) {
        return r && r.forEach(n => {
          this._localStreams ? this._localStreams.includes(n) || this._localStreams.push(n) : this._localStreams = [n];
        }), e.apply(this, arguments);
      };
    }
    "removeStream" in i.RTCPeerConnection.prototype || (i.RTCPeerConnection.prototype.removeStream = function (e) {
      this._localStreams || (this._localStreams = []);
      let t = this._localStreams.indexOf(e);
      if (t === -1) return;
      this._localStreams.splice(t, 1);
      let r = e.getTracks();
      this.getSenders().forEach(n => {
        r.includes(n.track) && this.removeTrack(n);
      });
    });
  }
}
function xd(i) {
  if (!(typeof i != "object" || !i.RTCPeerConnection) && ("getRemoteStreams" in i.RTCPeerConnection.prototype || (i.RTCPeerConnection.prototype.getRemoteStreams = function () {
    return this._remoteStreams ? this._remoteStreams : [];
  }), !("onaddstream" in i.RTCPeerConnection.prototype))) {
    Object.defineProperty(i.RTCPeerConnection.prototype, "onaddstream", {
      get() {
        return this._onaddstream;
      },
      set(t) {
        this._onaddstream && (this.removeEventListener("addstream", this._onaddstream), this.removeEventListener("track", this._onaddstreampoly)), this.addEventListener("addstream", this._onaddstream = t), this.addEventListener("track", this._onaddstreampoly = r => {
          r.streams.forEach(n => {
            if (this._remoteStreams || (this._remoteStreams = []), this._remoteStreams.includes(n)) return;
            this._remoteStreams.push(n);
            let s = new Event("addstream");
            s.stream = n, this.dispatchEvent(s);
          });
        });
      }
    });
    let e = i.RTCPeerConnection.prototype.setRemoteDescription;
    i.RTCPeerConnection.prototype.setRemoteDescription = function () {
      let t = this;
      return this._onaddstreampoly || this.addEventListener("track", this._onaddstreampoly = function (r) {
        r.streams.forEach(n => {
          if (t._remoteStreams || (t._remoteStreams = []), t._remoteStreams.indexOf(n) >= 0) return;
          t._remoteStreams.push(n);
          let s = new Event("addstream");
          s.stream = n, t.dispatchEvent(s);
        });
      }), e.apply(t, arguments);
    };
  }
}
function yd(i) {
  if (typeof i != "object" || !i.RTCPeerConnection) return;
  let e = i.RTCPeerConnection.prototype,
    t = e.createOffer,
    r = e.createAnswer,
    n = e.setLocalDescription,
    s = e.setRemoteDescription,
    o = e.addIceCandidate;
  e.createOffer = function (l, c) {
    let h = arguments.length >= 2 ? arguments[2] : arguments[0],
      d = t.apply(this, [h]);
    return c ? (d.then(l, c), Promise.resolve()) : d;
  }, e.createAnswer = function (l, c) {
    let h = arguments.length >= 2 ? arguments[2] : arguments[0],
      d = r.apply(this, [h]);
    return c ? (d.then(l, c), Promise.resolve()) : d;
  };
  let a = function (l, c, h) {
    let d = n.apply(this, [l]);
    return h ? (d.then(c, h), Promise.resolve()) : d;
  };
  e.setLocalDescription = a, a = function (l, c, h) {
    let d = s.apply(this, [l]);
    return h ? (d.then(c, h), Promise.resolve()) : d;
  }, e.setRemoteDescription = a, a = function (l, c, h) {
    let d = o.apply(this, [l]);
    return h ? (d.then(c, h), Promise.resolve()) : d;
  }, e.addIceCandidate = a;
}
function bd(i) {
  let e = i && i.navigator;
  if (e.mediaDevices && e.mediaDevices.getUserMedia) {
    let t = e.mediaDevices,
      r = t.getUserMedia.bind(t);
    e.mediaDevices.getUserMedia = n => r(Md(n));
  }
  !e.getUserMedia && e.mediaDevices && e.mediaDevices.getUserMedia && (e.getUserMedia = function (t, r, n) {
    e.mediaDevices.getUserMedia(t).then(r, n);
  }.bind(e));
}
function Md(i) {
  return i && i.video !== void 0 ? Object.assign({}, i, {
    video: Ku(i.video)
  }) : i;
}
function Sd(i) {
  if (!i.RTCPeerConnection) return;
  let e = i.RTCPeerConnection;
  i.RTCPeerConnection = function (t, r) {
    if (t && t.iceServers) {
      let n = [];
      for (let s = 0; s < t.iceServers.length; s++) {
        let o = t.iceServers[s];
        o.urls === void 0 && o.url ? (bl("RTCIceServer.url", "RTCIceServer.urls"), o = JSON.parse(JSON.stringify(o)), o.urls = o.url, delete o.url, n.push(o)) : n.push(t.iceServers[s]);
      }
      t.iceServers = n;
    }
    return new e(t, r);
  }, i.RTCPeerConnection.prototype = e.prototype, "generateCertificate" in e && Object.defineProperty(i.RTCPeerConnection, "generateCertificate", {
    get() {
      return e.generateCertificate;
    }
  });
}
function wd(i) {
  typeof i == "object" && i.RTCTrackEvent && "receiver" in i.RTCTrackEvent.prototype && !("transceiver" in i.RTCTrackEvent.prototype) && Object.defineProperty(i.RTCTrackEvent.prototype, "transceiver", {
    get() {
      return {
        receiver: this.receiver
      };
    }
  });
}
function _d(i) {
  let e = i.RTCPeerConnection.prototype.createOffer;
  i.RTCPeerConnection.prototype.createOffer = function (t) {
    if (t) {
      typeof t.offerToReceiveAudio < "u" && (t.offerToReceiveAudio = !!t.offerToReceiveAudio);
      let r = this.getTransceivers().find(s => s.receiver.track.kind === "audio");
      t.offerToReceiveAudio === !1 && r ? r.direction === "sendrecv" ? r.setDirection ? r.setDirection("sendonly") : r.direction = "sendonly" : r.direction === "recvonly" && (r.setDirection ? r.setDirection("inactive") : r.direction = "inactive") : t.offerToReceiveAudio === !0 && !r && this.addTransceiver("audio", {
        direction: "recvonly"
      }), typeof t.offerToReceiveVideo < "u" && (t.offerToReceiveVideo = !!t.offerToReceiveVideo);
      let n = this.getTransceivers().find(s => s.receiver.track.kind === "video");
      t.offerToReceiveVideo === !1 && n ? n.direction === "sendrecv" ? n.setDirection ? n.setDirection("sendonly") : n.direction = "sendonly" : n.direction === "recvonly" && (n.setDirection ? n.setDirection("inactive") : n.direction = "inactive") : t.offerToReceiveVideo === !0 && !n && this.addTransceiver("video", {
        direction: "recvonly"
      });
    }
    return e.apply(this, arguments);
  };
}
function Td(i) {
  typeof i != "object" || i.AudioContext || (i.AudioContext = i.webkitAudioContext);
}
var hu = Object.freeze(Object.defineProperty({
  __proto__: null,
  shimAudioContext: Td,
  shimCallbacksAPI: yd,
  shimConstraints: Md,
  shimCreateOfferLegacy: _d,
  shimGetUserMedia: bd,
  shimLocalStreamsAPI: vd,
  shimRTCIceServerUrls: Sd,
  shimRemoteStreamsAPI: xd,
  shimTrackEventTransceiver: wd
}, Symbol.toStringTag, {
  value: "Module"
}));
function O1(i) {
  return i && i.__esModule && Object.prototype.hasOwnProperty.call(i, "default") ? i.default : i;
}
var uu = {
    exports: {}
  },
  du;
function N1() {
  return du || (du = 1, function (i) {
    let e = {};
    e.generateIdentifier = function () {
      return Math.random().toString(36).substring(2, 12);
    }, e.localCName = e.generateIdentifier(), e.splitLines = function (t) {
      return t.trim().split(`
`).map(r => r.trim());
    }, e.splitSections = function (t) {
      return t.split(`
m=`).map((r, n) => (n > 0 ? "m=" + r : r).trim() + `\r
`);
    }, e.getDescription = function (t) {
      let r = e.splitSections(t);
      return r && r[0];
    }, e.getMediaSections = function (t) {
      let r = e.splitSections(t);
      return r.shift(), r;
    }, e.matchPrefix = function (t, r) {
      return e.splitLines(t).filter(n => n.indexOf(r) === 0);
    }, e.parseCandidate = function (t) {
      let r;
      t.indexOf("a=candidate:") === 0 ? r = t.substring(12).split(" ") : r = t.substring(10).split(" ");
      let n = {
        foundation: r[0],
        component: {
          1: "rtp",
          2: "rtcp"
        }[r[1]] || r[1],
        protocol: r[2].toLowerCase(),
        priority: parseInt(r[3], 10),
        ip: r[4],
        address: r[4],
        port: parseInt(r[5], 10),
        type: r[7]
      };
      for (let s = 8; s < r.length; s += 2) switch (r[s]) {
        case "raddr":
          n.relatedAddress = r[s + 1];
          break;
        case "rport":
          n.relatedPort = parseInt(r[s + 1], 10);
          break;
        case "tcptype":
          n.tcpType = r[s + 1];
          break;
        case "ufrag":
          n.ufrag = r[s + 1], n.usernameFragment = r[s + 1];
          break;
        default:
          n[r[s]] === void 0 && (n[r[s]] = r[s + 1]);
          break;
      }
      return n;
    }, e.writeCandidate = function (t) {
      let r = [];
      r.push(t.foundation);
      let n = t.component;
      n === "rtp" ? r.push(1) : n === "rtcp" ? r.push(2) : r.push(n), r.push(t.protocol.toUpperCase()), r.push(t.priority), r.push(t.address || t.ip), r.push(t.port);
      let s = t.type;
      return r.push("typ"), r.push(s), s !== "host" && t.relatedAddress && t.relatedPort !== void 0 && (r.push("raddr"), r.push(t.relatedAddress), r.push("rport"), r.push(t.relatedPort)), t.tcpType && t.protocol.toLowerCase() === "tcp" && (r.push("tcptype"), r.push(t.tcpType)), (t.usernameFragment || t.ufrag) && (r.push("ufrag"), r.push(t.usernameFragment || t.ufrag)), "candidate:" + r.join(" ");
    }, e.parseIceOptions = function (t) {
      return t.substring(14).split(" ");
    }, e.parseRtpMap = function (t) {
      let r = t.substring(9).split(" "),
        n = {
          payloadType: parseInt(r.shift(), 10)
        };
      return r = r[0].split("/"), n.name = r[0], n.clockRate = parseInt(r[1], 10), n.channels = r.length === 3 ? parseInt(r[2], 10) : 1, n.numChannels = n.channels, n;
    }, e.writeRtpMap = function (t) {
      let r = t.payloadType;
      t.preferredPayloadType !== void 0 && (r = t.preferredPayloadType);
      let n = t.channels || t.numChannels || 1;
      return "a=rtpmap:" + r + " " + t.name + "/" + t.clockRate + (n !== 1 ? "/" + n : "") + `\r
`;
    }, e.parseExtmap = function (t) {
      let r = t.substring(9).split(" ");
      return {
        id: parseInt(r[0], 10),
        direction: r[0].indexOf("/") > 0 ? r[0].split("/")[1] : "sendrecv",
        uri: r[1],
        attributes: r.slice(2).join(" ")
      };
    }, e.writeExtmap = function (t) {
      return "a=extmap:" + (t.id || t.preferredId) + (t.direction && t.direction !== "sendrecv" ? "/" + t.direction : "") + " " + t.uri + (t.attributes ? " " + t.attributes : "") + `\r
`;
    }, e.parseFmtp = function (t) {
      let r = {},
        n,
        s = t.substring(t.indexOf(" ") + 1).split(";");
      for (let o = 0; o < s.length; o++) n = s[o].trim().split("="), r[n[0].trim()] = n[1];
      return r;
    }, e.writeFmtp = function (t) {
      let r = "",
        n = t.payloadType;
      if (t.preferredPayloadType !== void 0 && (n = t.preferredPayloadType), t.parameters && Object.keys(t.parameters).length) {
        let s = [];
        Object.keys(t.parameters).forEach(o => {
          t.parameters[o] !== void 0 ? s.push(o + "=" + t.parameters[o]) : s.push(o);
        }), r += "a=fmtp:" + n + " " + s.join(";") + `\r
`;
      }
      return r;
    }, e.parseRtcpFb = function (t) {
      let r = t.substring(t.indexOf(" ") + 1).split(" ");
      return {
        type: r.shift(),
        parameter: r.join(" ")
      };
    }, e.writeRtcpFb = function (t) {
      let r = "",
        n = t.payloadType;
      return t.preferredPayloadType !== void 0 && (n = t.preferredPayloadType), t.rtcpFeedback && t.rtcpFeedback.length && t.rtcpFeedback.forEach(s => {
        r += "a=rtcp-fb:" + n + " " + s.type + (s.parameter && s.parameter.length ? " " + s.parameter : "") + `\r
`;
      }), r;
    }, e.parseSsrcMedia = function (t) {
      let r = t.indexOf(" "),
        n = {
          ssrc: parseInt(t.substring(7, r), 10)
        },
        s = t.indexOf(":", r);
      return s > -1 ? (n.attribute = t.substring(r + 1, s), n.value = t.substring(s + 1)) : n.attribute = t.substring(r + 1), n;
    }, e.parseSsrcGroup = function (t) {
      let r = t.substring(13).split(" ");
      return {
        semantics: r.shift(),
        ssrcs: r.map(n => parseInt(n, 10))
      };
    }, e.getMid = function (t) {
      let r = e.matchPrefix(t, "a=mid:")[0];
      if (r) return r.substring(6);
    }, e.parseFingerprint = function (t) {
      let r = t.substring(14).split(" ");
      return {
        algorithm: r[0].toLowerCase(),
        value: r[1].toUpperCase()
      };
    }, e.getDtlsParameters = function (t, r) {
      return {
        role: "auto",
        fingerprints: e.matchPrefix(t + r, "a=fingerprint:").map(e.parseFingerprint)
      };
    }, e.writeDtlsParameters = function (t, r) {
      let n = "a=setup:" + r + `\r
`;
      return t.fingerprints.forEach(s => {
        n += "a=fingerprint:" + s.algorithm + " " + s.value + `\r
`;
      }), n;
    }, e.parseCryptoLine = function (t) {
      let r = t.substring(9).split(" ");
      return {
        tag: parseInt(r[0], 10),
        cryptoSuite: r[1],
        keyParams: r[2],
        sessionParams: r.slice(3)
      };
    }, e.writeCryptoLine = function (t) {
      return "a=crypto:" + t.tag + " " + t.cryptoSuite + " " + (typeof t.keyParams == "object" ? e.writeCryptoKeyParams(t.keyParams) : t.keyParams) + (t.sessionParams ? " " + t.sessionParams.join(" ") : "") + `\r
`;
    }, e.parseCryptoKeyParams = function (t) {
      if (t.indexOf("inline:") !== 0) return null;
      let r = t.substring(7).split("|");
      return {
        keyMethod: "inline",
        keySalt: r[0],
        lifeTime: r[1],
        mkiValue: r[2] ? r[2].split(":")[0] : void 0,
        mkiLength: r[2] ? r[2].split(":")[1] : void 0
      };
    }, e.writeCryptoKeyParams = function (t) {
      return t.keyMethod + ":" + t.keySalt + (t.lifeTime ? "|" + t.lifeTime : "") + (t.mkiValue && t.mkiLength ? "|" + t.mkiValue + ":" + t.mkiLength : "");
    }, e.getCryptoParameters = function (t, r) {
      return e.matchPrefix(t + r, "a=crypto:").map(e.parseCryptoLine);
    }, e.getIceParameters = function (t, r) {
      let n = e.matchPrefix(t + r, "a=ice-ufrag:")[0],
        s = e.matchPrefix(t + r, "a=ice-pwd:")[0];
      return n && s ? {
        usernameFragment: n.substring(12),
        password: s.substring(10)
      } : null;
    }, e.writeIceParameters = function (t) {
      let r = "a=ice-ufrag:" + t.usernameFragment + `\r
a=ice-pwd:` + t.password + `\r
`;
      return t.iceLite && (r += `a=ice-lite\r
`), r;
    }, e.parseRtpParameters = function (t) {
      let r = {
          codecs: [],
          headerExtensions: [],
          fecMechanisms: [],
          rtcp: []
        },
        n = e.splitLines(t)[0].split(" ");
      r.profile = n[2];
      for (let o = 3; o < n.length; o++) {
        let a = n[o],
          l = e.matchPrefix(t, "a=rtpmap:" + a + " ")[0];
        if (l) {
          let c = e.parseRtpMap(l),
            h = e.matchPrefix(t, "a=fmtp:" + a + " ");
          switch (c.parameters = h.length ? e.parseFmtp(h[0]) : {}, c.rtcpFeedback = e.matchPrefix(t, "a=rtcp-fb:" + a + " ").map(e.parseRtcpFb), r.codecs.push(c), c.name.toUpperCase()) {
            case "RED":
            case "ULPFEC":
              r.fecMechanisms.push(c.name.toUpperCase());
              break;
          }
        }
      }
      e.matchPrefix(t, "a=extmap:").forEach(o => {
        r.headerExtensions.push(e.parseExtmap(o));
      });
      let s = e.matchPrefix(t, "a=rtcp-fb:* ").map(e.parseRtcpFb);
      return r.codecs.forEach(o => {
        s.forEach(a => {
          o.rtcpFeedback.find(l => l.type === a.type && l.parameter === a.parameter) || o.rtcpFeedback.push(a);
        });
      }), r;
    }, e.writeRtpDescription = function (t, r) {
      let n = "";
      n += "m=" + t + " ", n += r.codecs.length > 0 ? "9" : "0", n += " " + (r.profile || "UDP/TLS/RTP/SAVPF") + " ", n += r.codecs.map(o => o.preferredPayloadType !== void 0 ? o.preferredPayloadType : o.payloadType).join(" ") + `\r
`, n += `c=IN IP4 0.0.0.0\r
`, n += `a=rtcp:9 IN IP4 0.0.0.0\r
`, r.codecs.forEach(o => {
        n += e.writeRtpMap(o), n += e.writeFmtp(o), n += e.writeRtcpFb(o);
      });
      let s = 0;
      return r.codecs.forEach(o => {
        o.maxptime > s && (s = o.maxptime);
      }), s > 0 && (n += "a=maxptime:" + s + `\r
`), r.headerExtensions && r.headerExtensions.forEach(o => {
        n += e.writeExtmap(o);
      }), n;
    }, e.parseRtpEncodingParameters = function (t) {
      let r = [],
        n = e.parseRtpParameters(t),
        s = n.fecMechanisms.indexOf("RED") !== -1,
        o = n.fecMechanisms.indexOf("ULPFEC") !== -1,
        a = e.matchPrefix(t, "a=ssrc:").map(u => e.parseSsrcMedia(u)).filter(u => u.attribute === "cname"),
        l = a.length > 0 && a[0].ssrc,
        c,
        h = e.matchPrefix(t, "a=ssrc-group:FID").map(u => u.substring(17).split(" ").map(p => parseInt(p, 10)));
      h.length > 0 && h[0].length > 1 && h[0][0] === l && (c = h[0][1]), n.codecs.forEach(u => {
        if (u.name.toUpperCase() === "RTX" && u.parameters.apt) {
          let p = {
            ssrc: l,
            codecPayloadType: parseInt(u.parameters.apt, 10)
          };
          l && c && (p.rtx = {
            ssrc: c
          }), r.push(p), s && (p = JSON.parse(JSON.stringify(p)), p.fec = {
            ssrc: l,
            mechanism: o ? "red+ulpfec" : "red"
          }, r.push(p));
        }
      }), r.length === 0 && l && r.push({
        ssrc: l
      });
      let d = e.matchPrefix(t, "b=");
      return d.length && (d[0].indexOf("b=TIAS:") === 0 ? d = parseInt(d[0].substring(7), 10) : d[0].indexOf("b=AS:") === 0 ? d = parseInt(d[0].substring(5), 10) * 1e3 * 0.95 - 2e3 * 8 : d = void 0, r.forEach(u => {
        u.maxBitrate = d;
      })), r;
    }, e.parseRtcpParameters = function (t) {
      let r = {},
        n = e.matchPrefix(t, "a=ssrc:").map(a => e.parseSsrcMedia(a)).filter(a => a.attribute === "cname")[0];
      n && (r.cname = n.value, r.ssrc = n.ssrc);
      let s = e.matchPrefix(t, "a=rtcp-rsize");
      r.reducedSize = s.length > 0, r.compound = s.length === 0;
      let o = e.matchPrefix(t, "a=rtcp-mux");
      return r.mux = o.length > 0, r;
    }, e.writeRtcpParameters = function (t) {
      let r = "";
      return t.reducedSize && (r += `a=rtcp-rsize\r
`), t.mux && (r += `a=rtcp-mux\r
`), t.ssrc !== void 0 && t.cname && (r += "a=ssrc:" + t.ssrc + " cname:" + t.cname + `\r
`), r;
    }, e.parseMsid = function (t) {
      let r,
        n = e.matchPrefix(t, "a=msid:");
      if (n.length === 1) return r = n[0].substring(7).split(" "), {
        stream: r[0],
        track: r[1]
      };
      let s = e.matchPrefix(t, "a=ssrc:").map(o => e.parseSsrcMedia(o)).filter(o => o.attribute === "msid");
      if (s.length > 0) return r = s[0].value.split(" "), {
        stream: r[0],
        track: r[1]
      };
    }, e.parseSctpDescription = function (t) {
      let r = e.parseMLine(t),
        n = e.matchPrefix(t, "a=max-message-size:"),
        s;
      n.length > 0 && (s = parseInt(n[0].substring(19), 10)), isNaN(s) && (s = 65536);
      let o = e.matchPrefix(t, "a=sctp-port:");
      if (o.length > 0) return {
        port: parseInt(o[0].substring(12), 10),
        protocol: r.fmt,
        maxMessageSize: s
      };
      let a = e.matchPrefix(t, "a=sctpmap:");
      if (a.length > 0) {
        let l = a[0].substring(10).split(" ");
        return {
          port: parseInt(l[0], 10),
          protocol: l[1],
          maxMessageSize: s
        };
      }
    }, e.writeSctpDescription = function (t, r) {
      let n = [];
      return t.protocol !== "DTLS/SCTP" ? n = ["m=" + t.kind + " 9 " + t.protocol + " " + r.protocol + `\r
`, `c=IN IP4 0.0.0.0\r
`, "a=sctp-port:" + r.port + `\r
`] : n = ["m=" + t.kind + " 9 " + t.protocol + " " + r.port + `\r
`, `c=IN IP4 0.0.0.0\r
`, "a=sctpmap:" + r.port + " " + r.protocol + ` 65535\r
`], r.maxMessageSize !== void 0 && n.push("a=max-message-size:" + r.maxMessageSize + `\r
`), n.join("");
    }, e.generateSessionId = function () {
      return Math.random().toString().substr(2, 22);
    }, e.writeSessionBoilerplate = function (t, r, n) {
      let s,
        o = r !== void 0 ? r : 2;
      return t ? s = t : s = e.generateSessionId(), `v=0\r
o=` + (n || "thisisadapterortc") + " " + s + " " + o + ` IN IP4 127.0.0.1\r
s=-\r
t=0 0\r
`;
    }, e.getDirection = function (t, r) {
      let n = e.splitLines(t);
      for (let s = 0; s < n.length; s++) switch (n[s]) {
        case "a=sendrecv":
        case "a=sendonly":
        case "a=recvonly":
        case "a=inactive":
          return n[s].substring(2);
      }
      return r ? e.getDirection(r) : "sendrecv";
    }, e.getKind = function (t) {
      return e.splitLines(t)[0].split(" ")[0].substring(2);
    }, e.isRejected = function (t) {
      return t.split(" ", 2)[1] === "0";
    }, e.parseMLine = function (t) {
      let r = e.splitLines(t)[0].substring(2).split(" ");
      return {
        kind: r[0],
        port: parseInt(r[1], 10),
        protocol: r[2],
        fmt: r.slice(3).join(" ")
      };
    }, e.parseOLine = function (t) {
      let r = e.matchPrefix(t, "o=")[0].substring(2).split(" ");
      return {
        username: r[0],
        sessionId: r[1],
        sessionVersion: parseInt(r[2], 10),
        netType: r[3],
        addressType: r[4],
        address: r[5]
      };
    }, e.isValidSDP = function (t) {
      if (typeof t != "string" || t.length === 0) return !1;
      let r = e.splitLines(t);
      for (let n = 0; n < r.length; n++) if (r[n].length < 2 || r[n].charAt(1) !== "=") return !1;
      return !0;
    }, i.exports = e;
  }(uu)), uu.exports;
}
var Ed = N1(),
  An = O1(Ed),
  k1 = mp({
    __proto__: null,
    default: An
  }, [Ed]);
function da(i) {
  if (!i.RTCIceCandidate || i.RTCIceCandidate && "foundation" in i.RTCIceCandidate.prototype) return;
  let e = i.RTCIceCandidate;
  i.RTCIceCandidate = function (t) {
    if (typeof t == "object" && t.candidate && t.candidate.indexOf("a=") === 0 && (t = JSON.parse(JSON.stringify(t)), t.candidate = t.candidate.substring(2)), t.candidate && t.candidate.length) {
      let r = new e(t),
        n = An.parseCandidate(t.candidate);
      for (let s in n) s in r || Object.defineProperty(r, s, {
        value: n[s]
      });
      return r.toJSON = function () {
        return {
          candidate: r.candidate,
          sdpMid: r.sdpMid,
          sdpMLineIndex: r.sdpMLineIndex,
          usernameFragment: r.usernameFragment
        };
      }, r;
    }
    return new e(t);
  }, i.RTCIceCandidate.prototype = e.prototype, en(i, "icecandidate", t => (t.candidate && Object.defineProperty(t, "candidate", {
    value: new i.RTCIceCandidate(t.candidate),
    writable: "false"
  }), t));
}
function nl(i) {
  !i.RTCIceCandidate || i.RTCIceCandidate && "relayProtocol" in i.RTCIceCandidate.prototype || en(i, "icecandidate", e => {
    if (e.candidate) {
      let t = An.parseCandidate(e.candidate.candidate);
      t.type === "relay" && (e.candidate.relayProtocol = {
        0: "tls",
        1: "tcp",
        2: "udp"
      }[t.priority >> 24]);
    }
    return e;
  });
}
function pa(i, e) {
  if (!i.RTCPeerConnection || e.browser === "chrome" && e.version > 102 || e.browser === "firefox" && e.version >= 113) return;
  "sctp" in i.RTCPeerConnection.prototype || Object.defineProperty(i.RTCPeerConnection.prototype, "sctp", {
    get() {
      return typeof this._sctp > "u" ? null : this._sctp;
    }
  });
  let t = function (a) {
      if (!a || !a.sdp) return !1;
      let l = An.splitSections(a.sdp);
      return l.shift(), l.some(c => {
        let h = An.parseMLine(c);
        return h && h.kind === "application" && h.protocol.indexOf("SCTP") !== -1;
      });
    },
    r = function (a) {
      let l = a.sdp.match(/mozilla...THIS_IS_SDPARTA-(\d+)/);
      if (l === null || l.length < 2) return -1;
      let c = parseInt(l[1], 10);
      return c !== c ? -1 : c;
    },
    n = function (a) {
      let l = 65536;
      return e.browser === "firefox" && (e.version < 57 ? a === -1 ? l = 16384 : l = 2147483637 : e.version < 60 ? l = e.version === 57 ? 65535 : 65536 : l = 2147483637), l;
    },
    s = function (a, l) {
      let c = 65536;
      e.browser === "firefox" && e.version === 57 && (c = 65535);
      let h = An.matchPrefix(a.sdp, "a=max-message-size:");
      return h.length > 0 ? c = parseInt(h[0].substring(19), 10) : e.browser === "firefox" && l !== -1 && (c = 2147483637), c;
    },
    o = i.RTCPeerConnection.prototype.setRemoteDescription;
  i.RTCPeerConnection.prototype.setRemoteDescription = function () {
    if (this._sctp = null, e.browser === "chrome" && e.version >= 76) {
      let {
        sdpSemantics: a
      } = this.getConfiguration();
      a === "plan-b" && Object.defineProperty(this, "sctp", {
        get() {
          return typeof this._sctp > "u" ? null : this._sctp;
        },
        enumerable: !0,
        configurable: !0
      });
    }
    if (t(arguments[0])) {
      let a = r(arguments[0]),
        l = n(a),
        c = s(arguments[0], a),
        h;
      l === 0 && c === 0 ? h = Number.POSITIVE_INFINITY : l === 0 || c === 0 ? h = Math.max(l, c) : h = Math.min(l, c);
      let d = {};
      Object.defineProperty(d, "maxMessageSize", {
        get() {
          return h;
        }
      }), this._sctp = d;
    }
    return o.apply(this, arguments);
  };
}
function fa(i, e) {
  if (!(i.RTCPeerConnection && "createDataChannel" in i.RTCPeerConnection.prototype) || e.browser === "chrome" && e.version >= 149 || e.browser === "firefox" && e.version > 60) return;
  function t(n, s) {
    let o = n.send;
    n.send = function () {
      let a = arguments[0],
        l = a.length || a.size || a.byteLength;
      if (n.readyState === "open" && s.sctp && l > s.sctp.maxMessageSize) throw new TypeError("Message too large (can send a maximum of " + s.sctp.maxMessageSize + " bytes)");
      return o.apply(n, arguments);
    };
  }
  let r = i.RTCPeerConnection.prototype.createDataChannel;
  i.RTCPeerConnection.prototype.createDataChannel = function () {
    let n = r.apply(this, arguments);
    return t(n, this), n;
  }, en(i, "datachannel", n => (t(n.channel, n.target), n));
}
function sl(i) {
  if (!i.RTCPeerConnection || "connectionState" in i.RTCPeerConnection.prototype) return;
  let e = i.RTCPeerConnection.prototype;
  Object.defineProperty(e, "connectionState", {
    get() {
      return {
        completed: "connected",
        checking: "connecting"
      }[this.iceConnectionState] || this.iceConnectionState;
    },
    enumerable: !0,
    configurable: !0
  }), Object.defineProperty(e, "onconnectionstatechange", {
    get() {
      return this._onconnectionstatechange || null;
    },
    set(t) {
      this._onconnectionstatechange && (this.removeEventListener("connectionstatechange", this._onconnectionstatechange), delete this._onconnectionstatechange), t && this.addEventListener("connectionstatechange", this._onconnectionstatechange = t);
    },
    enumerable: !0,
    configurable: !0
  }), ["setLocalDescription", "setRemoteDescription"].forEach(t => {
    let r = e[t];
    e[t] = function () {
      return this._connectionstatechangepoly || (this._connectionstatechangepoly = n => {
        let s = n.target;
        if (s._lastConnectionState !== s.connectionState) {
          s._lastConnectionState = s.connectionState;
          let o = new Event("connectionstatechange", n);
          s.dispatchEvent(o);
        }
        return n;
      }, this.addEventListener("iceconnectionstatechange", this._connectionstatechangepoly)), r.apply(this, arguments);
    };
  });
}
function al(i, e) {
  if (!i.RTCPeerConnection || e.browser === "chrome" && e.version >= 71 || e.browser === "safari" && e._safariVersion >= 13.1) return;
  let t = i.RTCPeerConnection.prototype.setRemoteDescription;
  i.RTCPeerConnection.prototype.setRemoteDescription = function (r) {
    if (r && r.sdp && r.sdp.indexOf(`
a=extmap-allow-mixed`) !== -1) {
      let n = r.sdp.split(`
`).filter(s => s.trim() !== "a=extmap-allow-mixed").join(`
`);
      i.RTCSessionDescription && r instanceof i.RTCSessionDescription ? arguments[0] = new i.RTCSessionDescription({
        type: r.type,
        sdp: n
      }) : r.sdp = n;
    }
    return t.apply(this, arguments);
  };
}
function ma(i, e) {
  if (!(i.RTCPeerConnection && i.RTCPeerConnection.prototype)) return;
  let t = i.RTCPeerConnection.prototype.addIceCandidate;
  !t || t.length === 0 || (i.RTCPeerConnection.prototype.addIceCandidate = function () {
    return arguments[0] ? (e.browser === "chrome" && e.version < 78 || e.browser === "firefox" && e.version < 68 || e.browser === "safari") && arguments[0] && arguments[0].candidate === "" ? Promise.resolve() : t.apply(this, arguments) : (arguments[1] && arguments[1].apply(null), Promise.resolve());
  });
}
function ga(i, e) {
  if (!(i.RTCPeerConnection && i.RTCPeerConnection.prototype)) return;
  let t = i.RTCPeerConnection.prototype.setLocalDescription;
  !t || t.length === 0 || (i.RTCPeerConnection.prototype.setLocalDescription = function () {
    let r = arguments[0] || {};
    if (typeof r != "object" || r.type && r.sdp) return t.apply(this, arguments);
    if (r = {
      type: r.type,
      sdp: r.sdp
    }, !r.type) switch (this.signalingState) {
      case "stable":
      case "have-local-offer":
      case "have-remote-pranswer":
        r.type = "offer";
        break;
      default:
        r.type = "answer";
        break;
    }
    return r.sdp || r.type !== "offer" && r.type !== "answer" ? t.apply(this, [r]) : (r.type === "offer" ? this.createOffer : this.createAnswer).apply(this).then(n => t.apply(this, [n]));
  });
}
var U1 = Object.freeze(Object.defineProperty({
  __proto__: null,
  removeExtmapAllowMixed: al,
  shimAddIceCandidateNullOrEmpty: ma,
  shimConnectionState: sl,
  shimMaxMessageSize: pa,
  shimParameterlessSetLocalDescription: ga,
  shimRTCIceCandidate: da,
  shimRTCIceCandidateRelayProtocol: nl,
  shimSendThrowTypeError: fa
}, Symbol.toStringTag, {
  value: "Module"
}));
function F1({
  window: i
} = {}, e = {
  shimChrome: !0,
  shimFirefox: !0,
  shimSafari: !0
}) {
  let t = yl,
    r = z1(i),
    n = {
      browserDetails: r,
      commonShim: U1,
      extractVersion: hs,
      disableLog: L1,
      disableWarnings: D1,
      sdp: k1
    };
  switch (r.browser) {
    case "chrome":
      if (!cu || !rl || !e.shimChrome) return t("Chrome shim is not included in this adapter release."), n;
      if (r.version === null) return t("Chrome shim can not determine version, not shimming."), n;
      t("adapter.js shimming chrome."), n.browserShim = cu, ma(i, r), ga(i), Qu(i, r), $u(i), rl(i, r), ed(i, r), nd(i, r), td(i), rd(i, r), sd(i, r), da(i), nl(i), sl(i), pa(i, r), fa(i, r), al(i, r);
      break;
    case "firefox":
      if (!lu || !il || !e.shimFirefox) return t("Firefox shim is not included in this adapter release."), n;
      t("adapter.js shimming firefox."), n.browserShim = lu, ma(i, r), ga(i), ad(i, r), il(i, r), cd(i, r), od(i), ud(i), ld(i), hd(i), dd(i), pd(i, r), fd(i, r), md(i, r), gd(i, r), da(i), sl(i), pa(i, r), fa(i, r);
      break;
    case "safari":
      if (!hu || !e.shimSafari) return t("Safari shim is not included in this adapter release."), n;
      t("adapter.js shimming safari."), n.browserShim = hu, ma(i, r), ga(i), Sd(i), _d(i), yd(i), vd(i), xd(i), wd(i), bd(i), Td(i), da(i), nl(i), pa(i, r), fa(i, r), al(i, r);
      break;
    default:
      t("Unsupported browser!");
      break;
  }
  return n;
}
var Kx = F1({
    window: typeof window > "u" ? void 0 : window
  }),
  B1 = "data:font/woff2;base64,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",
  G1 = "data:font/woff2;base64,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",
  V1 = "data:font/woff2;base64,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",
  W1 = "data:font/woff2;base64,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",
  Ad = document.createElement("style");
Ad.textContent = `@font-face{font-family:'Luckiest Guy';src:url('${B1}') format('woff2');font-weight:400;font-display:swap}
@font-face{font-family:'Fredoka';src:url('${G1}') format('woff2');font-weight:500;font-display:swap}
@font-face{font-family:'Fredoka';src:url('${V1}') format('woff2');font-weight:600;font-display:swap}
@font-face{font-family:'Fredoka';src:url('${W1}') format('woff2');font-weight:700;font-display:swap}`;
document.head.appendChild(Ad);
var ce = i => document.getElementById(i),
  We = Math.PI * 2,
  xe = Math.PI,
  ji = Math.SQRT2,
  Ui = (i, e, t) => i < e ? e : i > t ? t : i,
  Cd = (i, e, t) => i + (e - i) * t,
  st = (i, e) => i + Math.random() * (e - i);
function Os(i) {
  let e = i >>> 0;
  return () => {
    e |= 0, e = e + 1831565813 | 0;
    let t = Math.imul(e ^ e >>> 15, 1 | e);
    return t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t, ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
var Ee = 10,
  xt = 4.2,
  $t = 2.4,
  mt = 0.45,
  H1 = 0.85,
  Rd = Ee - 1.4,
  Fr = 6.9,
  Pd = 12,
  Ld = 0.34,
  j1 = 1.9,
  q1 = 3,
  Dd = 5,
  Nn = 15,
  ao = 30,
  ns = 10,
  pu = 17,
  fu = 34,
  ni = [{
    x: 0,
    z: -1
  }, {
    x: 0,
    z: 1
  }, {
    x: 1,
    z: 0
  }, {
    x: -1,
    z: 0
  }],
  X1 = [0, xe, -xe / 2, xe / 2],
  Y1 = ["\u25BC", "\u25B2", "\u25C0", "\u25B6"],
  Z1 = ce("c"),
  yr = new no({
    canvas: Z1,
    antialias: false,
    powerPreference: "high-performance"
  });
yr.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1));
yr.outputEncoding = Ke;
yr.toneMapping = gl;
yr.toneMappingExposure = 1.15;
yr.shadowMap.enabled = !0;
yr.shadowMap.type = Cu;
var kn = yr.capabilities.getMaxAnisotropy(),
  wt = new Ss();
wt.fog = new ka("#58b2ed", 65, 145);
var pr = new Ot(38, 1, 0.1, 400);
function Pr(i, e) {
  let t = document.createElement("canvas");
  return t.width = i, t.height = e, [t, t.getContext("2d")];
}
function vs(i, e, t, r, n, s) {
  i.beginPath(), i.moveTo(e + s, t), i.arcTo(e + r, t, e + r, t + n, s), i.arcTo(e + r, t + n, e, t + n, s), i.arcTo(e, t + n, e, t, s), i.arcTo(e, t, e + r, t, s), i.closePath();
}
function J1() {
  let [i, e] = Pr(512, 512);
  e.fillStyle = "#808080", e.fillRect(0, 0, 512, 512);
  for (let r = 0; r < 24; r++) {
    let n = Math.random() * 512,
      s = Math.random() * 512,
      o = 20 + Math.random() * 40,
      a = e.createRadialGradient(n, s, 0, n, s, o),
      l = Math.random() < 0.5 ? 0.025 : -0.025;
    a.addColorStop(0, l > 0 ? `rgba(255,255,255,${l})` : `rgba(0,0,0,${-l})`), a.addColorStop(1, "rgba(128,128,128,0)"), e.fillStyle = a, e.beginPath(), e.arc(n, s, o, 0, We), e.fill();
  }
  e.lineWidth = 12, e.lineCap = "round";
  for (let r = 0; r < 10; r++) {
    let n = Math.random() * 512,
      s = Math.random() * 512,
      o = 25 + Math.random() * 35;
    e.strokeStyle = "rgba(0,0,0,0.02)", e.beginPath(), e.arc(n, s, o, Math.random() * We, Math.random() * We + 1.8), e.stroke();
  }
  let t = new lr(i);
  return t.wrapS = t.wrapT = Ln, t.repeat.set(2, 2), t.generateMipmaps = !0, t.minFilter = qr, t.magFilter = It, t.anisotropy = kn, t;
}
var oo = J1();
function K1() {
  let [i, e] = Pr(512, 512);
  e.fillStyle = "#808080", e.fillRect(0, 0, 512, 512);
  for (let r = 0; r < 18; r++) {
    let n = Math.random() * 512,
      s = Math.random() * 512,
      o = 30 + Math.random() * 50,
      a = e.createRadialGradient(n, s, 0, n, s, o);
    a.addColorStop(0, r % 2 === 0 ? "rgba(255,255,255,0.018)" : "rgba(0,0,0,0.018)"), a.addColorStop(1, "rgba(128,128,128,0)"), e.fillStyle = a, e.beginPath(), e.arc(n, s, o, 0, We), e.fill();
  }
  let t = new lr(i);
  return t.wrapS = t.wrapT = Ln, t.repeat.set(1.5, 1.5), t.generateMipmaps = !0, t.minFilter = qr, t.magFilter = It, t.anisotropy = kn, t;
}
var Ml = K1();
function Q1() {
  let [i, e] = Pr(128, 128),
    t = e.createRadialGradient(64, 64, 4, 64, 64, 62);
  return t.addColorStop(0, "rgba(0,0,0,0.75)"), t.addColorStop(0.5, "rgba(0,0,0,0.35)"), t.addColorStop(1, "rgba(0,0,0,0)"), e.fillStyle = t, e.fillRect(0, 0, 128, 128), new lr(i);
}
var $1 = Q1(),
  Sl = new Ei({
    map: $1,
    transparent: !0,
    depthWrite: !1,
    opacity: 0.58
  }),
  wl = new yi(1, 1).rotateX(-xe / 2);
function ex() {
  let [i, e] = Pr(64, 64),
    t = e.createRadialGradient(32, 32, 2, 32, 32, 30);
  return t.addColorStop(0, "rgba(255,255,255,1)"), t.addColorStop(0.4, "rgba(255,255,255,.8)"), t.addColorStop(1, "rgba(255,255,255,0)"), e.fillStyle = t, e.fillRect(0, 0, 64, 64), new lr(i);
}
var tx = ex(),
  Cn = {};
function we(i, e = {}) {
  let t = "c_" + i + JSON.stringify(e);
  if (Cn[t]) return Cn[t];
  let r = new Wt({
    color: i,
    roughness: e.r ?? 0.52,
    metalness: e.m ?? 0,
    bumpMap: e.nb ? null : oo,
    bumpScale: e.b ?? 0.08
  });
  return e.e && (r.emissive = new He(e.e), r.emissiveIntensity = e.ei ?? 1), e.side && (r.side = e.side), e.op && (r.transparent = !0, r.opacity = e.op), Cn[t] = r;
}
function Pe(i, e = {}) {
  let t = "cc_" + i + JSON.stringify(e);
  if (Cn[t]) return Cn[t];
  let r = new Wt({
    color: i,
    roughness: e.r ?? 0.46,
    metalness: e.m ?? 0,
    bumpMap: e.nb ? null : Ml,
    bumpScale: e.b ?? 0.05
  });
  return e.e && (r.emissive = new He(e.e), r.emissiveIntensity = e.ei ?? 1), e.side && (r.side = e.side), e.op && (r.transparent = !0, r.opacity = e.op), Cn[t] = r;
}
function Ds(i, e = {}) {
  let t = new Wt({
    color: i,
    roughness: e.r ?? 0.52,
    metalness: e.m ?? 0,
    bumpMap: oo,
    bumpScale: 0.08
  });
  return t.emissive = new He(e.e || "#000"), t;
}
var rt = {
  white: new Wt({
    color: "#ffffff",
    roughness: 0.16,
    metalness: 0.02
  }),
  pupil: new Wt({
    color: "#0e0812",
    roughness: 0.12,
    metalness: 0.05
  }),
  shine: new Ei({
    color: "#ffffff"
  }),
  tire: Pe("#1c1920", {
    r: 0.85,
    b: 0.05
  }),
  metal: new Wt({
    color: "#cfd3de",
    roughness: 0.22,
    metalness: 0.75,
    bumpMap: Ml,
    bumpScale: 0.015
  }),
  mouth: new Wt({
    color: "#3e0612",
    roughness: 0.26
  }),
  tooth: new Wt({
    color: "#fffef5",
    roughness: 0.18
  })
};
function ci(i, e, t) {
  if (!e) return i;
  let r = i.attributes.position.array;
  for (let n = 0; n < r.length; n += 3) {
    let s = r[n],
      o = r[n + 1],
      a = r[n + 2],
      l = Math.hypot(s, o, a) || 1,
      c = (Math.sin(s * t + 1.3) * Math.sin(o * t * 1.31 + 2.1) * Math.sin(a * t * 0.87 + 0.4) + 0.35 * Math.sin((s * 1.7 - o * 1.3 + a * 2.1) * t * 1.9)) * e;
    r[n] += s / l * c, r[n + 1] += o / l * c, r[n + 2] += a / l * c;
  }
  return i.computeVertexNormals(), i;
}
var mu = {},
  tn = (i, e) => mu[i] || (mu[i] = e()),
  Ce = (i, e = 0.04, t = 28, r = 20) => tn("s" + i + "_" + e + "_" + t, () => ci(new Qi(i, t, r), i * e, 2.2 / Math.max(i, 0.15))),
  Ns = i => tn("h" + i, () => new Qi(i, 24, 12, 0, We, 0, xe / 2)),
  qe = (i, e, t, r = 24, n = 0.02, s = !1, o = 0, a = We) => tn(`c${i}_${e}_${t}_${r}_${n}_${s}_${o}_${a}`, () => ci(new ja(i, e, t, r, 2, s, o, a), Math.max(i, e) * n, 3 / Math.max(i, e, 0.15))),
  qi = (i, e, t = 0.03) => tn(`p${i}_${e}_${t}`, () => ci(new Hc(i, e, 8, 18), i * t, 2.5 / i)),
  ut = (i, e, t = 12, r = 32, n = We, s = 0) => tn(`t${i}_${e}_${t}_${r}_${n}_${s}`, () => ci(new Qc(i, e, t, r, n), e * s, 3 / e)),
  ss = (i, e, t = 16, r = 0.04) => tn(`k${i}_${e}_${t}_${r}`, () => ci(new jc(i, e, t, 3), i * r, 2 / i));
function Xe(i, e, t, r = 0.1, n = 0.012) {
  return tn(`rb${i}_${e}_${t}_${r}_${n}`, () => {
    let s = Math.max(0.005, Math.min(r, e / 2 - 0.005, i / 2 - 0.005, t / 2 - 0.005)),
      o = i - 2 * s,
      a = t - 2 * s,
      l = Math.max(0.002, Math.min(s, o / 2, a / 2) * 0.98),
      c = new Ji(),
      h = -o / 2,
      d = -a / 2;
    c.moveTo(h + l, d), c.lineTo(h + o - l, d), c.quadraticCurveTo(h + o, d, h + o, d + l), c.lineTo(h + o, d + a - l), c.quadraticCurveTo(h + o, d + a, h + o - l, d + a), c.lineTo(h + l, d + a), c.quadraticCurveTo(h, d + a, h, d + a - l), c.lineTo(h, d + l), c.quadraticCurveTo(h, d, h + l, d);
    let u = new Xa(c, {
      depth: Math.max(0.002, e - 2 * s),
      bevelEnabled: !0,
      bevelThickness: s,
      bevelSize: s,
      bevelSegments: 4,
      curveSegments: 6
    });
    return u.center(), u.rotateX(-xe / 2), ci(u, n, 4), rx(u);
  });
}
function rx(i) {
  let e = i.attributes.position.array;
  i.computeVertexNormals();
  let t = i.attributes.normal.array,
    r = new Map(),
    n = new Array(e.length / 3);
  for (let s = 0, o = 0; s < e.length; s += 3, o++) {
    let a = Math.round(e[s] * 500) + "," + Math.round(e[s + 1] * 500) + "," + Math.round(e[s + 2] * 500);
    n[o] = a;
    let l = r.get(a);
    l || (l = [0, 0, 0], r.set(a, l)), l[0] += t[s], l[1] += t[s + 1], l[2] += t[s + 2];
  }
  for (let s = 0, o = 0; s < e.length; s += 3, o++) {
    let a = r.get(n[o]),
      l = Math.hypot(a[0], a[1], a[2]) || 1;
    t[s] = a[0] / l, t[s + 1] = a[1] / l, t[s + 2] = a[2] / l;
  }
  return i.attributes.normal.needsUpdate = !0, i;
}
function I(i, e, t = 0, r = 0, n = 0, s, o = !0) {
  let a = new pt(i, e);
  return a.position.set(t, r, n), a.castShadow = o, a.receiveShadow = !0, s && s.add(a), a;
}
function Ge(i, e = 0, t = 0, r = 0) {
  let n = new Er();
  return n.position.set(e, t, r), i && i.add(n), n;
}
function Vr(i, e, t, r, n, s = {}) {
  let o = Ge(i, e, t, r);
  I(Ce(n * 1.05, 0, 18, 14), rt.pupil, 0, 0, -n * 0.05, o, !1), I(Ce(n, 0, 24, 18), rt.white, 0, 0, 0, o, !1);
  let a = s.py || 0;
  if (I(Ce(n * 0.52, 0, 18, 14), rt.pupil, s.px || 0, a, n * 0.6, o, !1), I(Ce(n * 0.17, 0, 10, 8), rt.shine, n * 0.2 + (s.px || 0), n * 0.22 + a, n * 0.98, o, !1), s.lid) {
    let l = I(Ns(n * 1.08), Pe(s.lid, {
      r: 0.48
    }), 0, 0, 0, o, !1);
    l.rotation.x = s.la ?? 0.2, l.rotation.z = s.lz || 0;
  }
  return o;
}
function er(i, e, t, r, n, s, o, a) {
  let l = Ge(i, e, t, r),
    c = I(ut(n * 0.64, n * 0.36, 12, 32, We, 0.01), rt.tire, 0, 0, 0, l);
  c.rotation.y = xe / 2, c.scale.z = s / (n * 0.72);
  let h = I(qe(n * 0.42, n * 0.42, s * 0.9, 20, 0), Pe(o, {
    r: 0.46
  }), 0, 0, 0, l);
  return h.rotation.z = xe / 2, I(Ce(n * 0.18, 0, 12, 10), rt.metal, s * 0.47 * Math.sign(e || 1), 0, 0, l, !1), a.push(l), l;
}
var et = [{
    id: "ziggy",
    name: "ZIGGY",
    color: "#7b22e2",
    dark: "#480f8f",
    vehicle: "BUZZ BUMPER",
    desc: "Hyper antenna-bug pilot. Goggles on, scarf flapping, claw ready to grab.",
    stats: [5, 3, 4],
    py: 1.45
  }, {
    id: "lumpy",
    name: "LUMPY",
    color: "#eb5b00",
    dark: "#8a2b00",
    vehicle: "SCOOP DOZER",
    desc: "Sleepy hard-hat crew boss. Slow to smile, quick to scoop a ball.",
    stats: [3, 5, 3],
    py: 1.55
  }, {
    id: "bopsy",
    name: "BOPSY",
    color: "#e51a75",
    dark: "#8c0942",
    vehicle: "HULA SAUCER",
    desc: "Winking hoop-spinner riding a wobbly polka-dot saucer.",
    stats: [5, 2, 5],
    py: 1.5
  }, {
    id: "gritty",
    name: "GRITTY",
    color: "#26802b",
    dark: "#124416",
    vehicle: "SHELL CRUSHER",
    desc: "Grumpy goggled turtle in a riveted wrecking-ball tank.",
    stats: [2, 5, 4],
    py: 1.5
  }],
  ix = ["SPEED", "POWER", "STYLE"];
function nx() {
  let i = et[0],
    e = new Er(),
    t = Ge(e),
    r = [],
    n = Pe(i.color, {
      r: 0.46
    }),
    s = Pe(i.dark, {
      r: 0.48
    }),
    o = Pe("#ffb000", {
      r: 0.45
    }),
    a = Pe("#993de8", {
      r: 0.46
    });
  I(Xe(1.25, 0.46, 1.72, 0.22, 0.008), n, 0, 0.5, 0, t), I(Xe(1.02, 0.3, 0.86, 0.14, 0.008), s, 0, 0.76, -0.28, t), I(Xe(1.18, 0.28, 0.34, 0.13, 0.008), s, 0, 0.38, 0.84, t), I(Ce(0.34, 0.01), n, 0, 0.66, 0.42, t).scale.set(1.5, 0.55, 1.1), Vr(t, -0.29, 0.72, 0.72, 0.14), Vr(t, 0.29, 0.72, 0.72, 0.14);
  let l = I(qe(0.055, 0.055, 0.46, 12, 0), rt.metal, 0.36, 0.4, 1.08, t);
  l.rotation.x = xe / 2;
  let c = Ge(t, 0.36, 0.4, 1.33);
  I(ut(0.12, 0.035, 8, 16, xe * 1.1, 0), rt.metal, 0, 0, 0, c).rotation.set(0, xe / 2, -0.3), I(ut(0.12, 0.035, 8, 16, xe * 1.1, 0), rt.metal, 0, 0, 0, c).rotation.set(0, -xe / 2, -0.3);
  let h = I(qe(0.07, 0.1, 0.5, 12, 0), rt.metal, -0.38, 0.82, -0.88, t);
  h.rotation.x = -0.9;
  for (let v = 0; v < 4; v++) {
    let y = I(ut(0.1, 0.025, 8, 18), Pe("#f5a000", {
      m: 0.3,
      r: 0.3
    }), 0.38, 0.6 + v * 0.06, -0.8, t, !1);
    y.rotation.x = xe / 2;
  }
  er(t, -0.66, 0.3, 0.55, 0.3, 0.26, i.dark, r), er(t, 0.66, 0.3, 0.55, 0.3, 0.26, i.dark, r), er(t, -0.66, 0.32, -0.55, 0.32, 0.3, i.dark, r), er(t, 0.66, 0.32, -0.55, 0.32, 0.3, i.dark, r);
  let d = Ge(e, 0, 0.8, -0.25);
  I(Ce(0.48, 0.015), n, 0, 0.42, 0, d).scale.set(1, 1.06, 0.92), I(Ce(0.3, 0.01), a, 0, 0.28, 0.24, d).scale.set(1, 0.9, 0.6), I(Ce(0.2, 0), rt.mouth, 0, 0.3, 0.38, d).scale.set(1.25, 0.62, 0.5), I(Xe(0.09, 0.08, 0.05, 0.02, 0), rt.tooth, -0.07, 0.37, 0.46, d), I(Xe(0.09, 0.08, 0.05, 0.02, 0), rt.tooth, 0.07, 0.37, 0.46, d), Vr(d, -0.17, 0.62, 0.34, 0.15), Vr(d, 0.17, 0.62, 0.34, 0.15);
  for (let v of [-1, 1]) {
    let y = I(ut(0.1, 0.035, 10, 24), Pe("#1252be", {
      r: 0.35,
      m: 0.1
    }), v * 0.16, 0.86, 0.3, d);
    y.rotation.x = -0.55;
    let x = I(Ce(0.085, 0, 16, 12), Pe("#00c8f8", {
      r: 0.1,
      m: 0.25,
      e: "#004880",
      ei: 0.2
    }), v * 0.16, 0.86, 0.3, d, !1);
    x.scale.z = 0.45, x.rotation.x = -0.55;
  }
  let u = I(ut(0.43, 0.03, 8, 36), Pe("#1a2640", {
    r: 0.5
  }), 0, 0.84, -0.02, d, !1);
  u.rotation.x = xe / 2 - 0.4;
  let p = [];
  for (let v of [-1, 1]) {
    let y = Ge(d, v * 0.14, 0.86, -0.06);
    I(qe(0.022, 0.03, 0.42, 10, 0), s, 0, 0.21, 0, y, !1), I(Ce(0.075, 0.01), o, 0, 0.44, 0, y), y.rotation.z = -v * 0.35, p.push(y);
  }
  let g = I(ut(0.36, 0.09, 10, 32, We, 0.05), o, 0, 0.13, 0, d);
  g.rotation.x = xe / 2;
  let f = I(Xe(0.17, 0.42, 0.06, 0.03, 0), o, 0.22, 0, -0.36, d);
  f.rotation.set(0.5, 0, -0.4);
  for (let v of [-1, 1]) I(qi(0.07, 0.32, 0.01), n, v * 0.33, 0.24, 0.28, d).rotation.set(1.15, 0, -v * 0.35);
  let m = I(ut(0.16, 0.03, 8, 22), Pe("#28222e", {
    r: 0.5
  }), 0, 0.2, 0.5, d);
  return m.rotation.x = -0.6, {
    root: e,
    wheels: r,
    ch: d,
    chY: 0.8,
    update(v, y) {
      d.position.y = 0.8 + Math.abs(Math.sin(v * 7)) * 0.035 * (0.4 + y), p[0].rotation.z = 0.35 + Math.sin(v * 9) * 0.18, p[1].rotation.z = -0.35 + Math.sin(v * 9 + 1) * 0.18, f.rotation.x = 0.5 + Math.sin(v * 14) * 0.25 * (0.3 + y);
    }
  };
}
function sx() {
  let i = et[1],
    e = new Er(),
    t = Ge(e),
    r = [],
    n = Pe(i.color, {
      r: 0.48
    }),
    s = Pe(i.dark, {
      r: 0.5
    }),
    o = Pe("#eb680a", {
      r: 0.47
    }),
    a = Pe("#1b55b3", {
      r: 0.52
    }),
    l = Pe("#10377a", {
      r: 0.55
    });
  I(Xe(1.25, 0.36, 1.6, 0.12, 0.008), s, 0, 0.44, 0, t), I(Xe(1.15, 0.22, 1.4, 0.1, 0.008), n, 0, 0.68, 0, t), I(Xe(0.95, 0.5, 0.5, 0.16, 0.008), n, 0, 0.86, -0.62, t), I(Xe(0.7, 0.12, 0.3, 0.05, 0), rt.metal, 0, 1.14, -0.62, t, !1), I(qe(0.07, 0.08, 0.55, 12, 0), rt.metal, 0.32, 1.22, -0.7, t), I(qe(0.1, 0.07, 0.08, 12, 0), Pe("#28242e", {
    r: 0.5
  }), 0.32, 1.52, -0.7, t, !1);
  let c = Ge(t, 0, 0.38, 1),
    h = I(qe(0.42, 0.42, 1.45, 28, 0.005, !0, xe * 1.15, xe * 0.7), Pe(i.color, {
      side: Gr,
      r: 0.45
    }), 0, 0, 0, c);
  h.rotation.z = xe / 2;
  for (let v of [-1, 1]) I(Xe(0.05, 0.5, 0.36, 0.02, 0), s, v * 0.72, 0.05, -0.12, c);
  for (let v of [-1, 1]) {
    let y = I(qe(0.05, 0.05, 0.7, 10, 0), rt.metal, v * 0.45, 0.62, 0.62, t);
    y.rotation.x = 1.05;
  }
  for (let v of [-1, 1]) I(Ce(0.09, 0, 14, 10), Pe("#fff080", {
    e: "#ff9900",
    ei: 0.8,
    r: 0.2
  }), v * 0.45, 0.76, 0.7, t, !1);
  er(t, -0.68, 0.34, 0.5, 0.34, 0.3, i.color, r), er(t, 0.68, 0.34, 0.5, 0.34, 0.3, i.color, r), er(t, -0.68, 0.36, -0.52, 0.36, 0.32, i.color, r), er(t, 0.68, 0.36, -0.52, 0.36, 0.32, i.color, r);
  let d = Ge(e, 0, 0.6, -0.05),
    u = I(qi(0.3, 0.78, 0.015), o, 0, 0.62, 0, d);
  u.scale.set(1, 1, 0.92), I(qe(0.325, 0.33, 0.5, 26, 0.005, !0, 0.55, We - 1.1), a, 0, 0.48, 0, d), I(Xe(0.12, 0.1, 0.04, 0.02, 0), l, -0.2, 0.55, 0.24, d, !1), I(Ce(0.03, 0, 10, 8), rt.metal, 0.17, 0.6, 0.27, d, !1);
  let p = I(Ns(0.33), Pe("#ff8800", {
    r: 0.42
  }), 0, 1.12, 0, d);
  p.scale.y = 0.85, I(qe(0.36, 0.37, 0.05, 26, 0), Pe("#ff8800", {
    r: 0.42
  }), 0, 1.12, 0.04, d), I(Xe(0.08, 0.06, 0.5, 0.03, 0), Pe("#d66b00", {
    r: 0.45
  }), 0, 1.36, 0, d, !1), Vr(d, -0.12, 0.92, 0.25, 0.12, {
    lid: "#d65800",
    la: 0.32
  }), Vr(d, 0.12, 0.92, 0.25, 0.12, {
    lid: "#d65800",
    la: 0.32
  });
  let g = I(Xe(0.15, 0.04, 0.04, 0.02, 0), Pe("#3d1a08", {
    r: 0.6
  }), -0.12, 1.04, 0.3, d, !1);
  g.rotation.z = -0.25;
  let f = I(Xe(0.15, 0.04, 0.04, 0.02, 0), Pe("#3d1a08", {
    r: 0.6
  }), 0.12, 1.04, 0.3, d, !1);
  f.rotation.z = 0.25, I(Ce(0.07, 0.01), o, 0, 0.83, 0.31, d, !1);
  let m = I(Xe(0.18, 0.03, 0.03, 0.012, 0), rt.mouth, 0, 0.72, 0.28, d, !1);
  m.rotation.z = 0.08;
  for (let v of [-1, 1]) I(qi(0.075, 0.45, 0.01), o, v * 0.36, 0.45, 0.18, d).rotation.set(0.9, 0, -v * 0.25);
  return {
    root: e,
    wheels: r,
    ch: d,
    chY: 0.6,
    update(v, y) {
      d.position.y = 0.6 + Math.sin(v * 3) * 0.02, c.position.y = 0.38 + Math.sin(v * 4) * 0.04, u.rotation.z = Math.sin(v * 1.7) * 0.04;
    }
  };
}
function ax() {
  let i = et[2],
    e = new Er(),
    t = Ge(e),
    r = [],
    n = Pe(i.color, {
      r: 0.44
    });
  Pe("#ff167c", {
    r: 0.44
  });
  let s = Pe("#f5458e", {
      r: 0.44
    }),
    o = Pe("#f88fa4", {
      r: 0.46
    }),
    a = Pe("#ffffff", {
      r: 0.35
    }),
    l = Ge(t, 0, 0, 0);
  I(Ce(0.78, 0.01), s, 0, 0.58, 0, l).scale.set(1, 0.3, 1);
  let c = I(ut(0.74, 0.09, 12, 44, We, 0.01), n, 0, 0.58, 0, l);
  c.rotation.x = xe / 2;
  for (let v = 0; v < 8; v++) {
    let y = v / 8 * We;
    I(Ce(0.06, 0, 12, 10), Pe("#ffc400", {
      e: "#ff9d00",
      ei: 0.8,
      r: 0.2
    }), Math.sin(y) * 0.8, 0.6, Math.cos(y) * 0.8, l, !1);
  }
  for (let v = 0; v < 6; v++) {
    let y = v / 6 * We + 0.3,
      x = I(Ce(0.08, 0, 12, 10), a, Math.sin(y) * 0.5, 0.68, Math.cos(y) * 0.5, l, !1);
    x.scale.y = 0.4;
  }
  I(qe(0.06, 0.06, 0.4, 12, 0), rt.metal, 0, 0.32, 0, t), er(t, 0, 0.24, 0, 0.24, 0.18, i.dark, r);
  let h = Ge(e, 0, 1.2, 0),
    d = I(ut(0.95, 0.035, 10, 50, We, 0), Pe("#00c8ea", {
      r: 0.25,
      m: 0.15,
      e: "#006080",
      ei: 0.25
    }), 0, 0, 0, h);
  d.rotation.x = xe / 2;
  let u = Ge(e, 0, 0.7, 0);
  I(Ce(0.34, 0.01), n, 0, 0.28, 0, u).scale.set(1, 0.95, 1);
  for (let v = 0; v < 7; v++) {
    let y = v * 1.3,
      x = 0.12 + v % 3 * 0.12;
    I(Ce(0.045, 0, 10, 8), a, Math.sin(y) * 0.32, x + 0.06, Math.cos(y) * 0.3, u, !1);
  }
  I(Ce(0.31, 0.01), o, 0, 0.8, 0, u);
  let p = Pe("#c70c58", {
      r: 0.46
    }),
    g = Os(9);
  for (let v = 0; v < 16; v++) {
    let y = g() * We,
      x = g() * 1.1 + 0.1,
      b = 0.29;
    I(Ce(0.11 + g() * 0.04, 0.02, 16, 12), p, Math.sin(y) * Math.cos(x) * b, 0.85 + Math.sin(x) * b, Math.cos(y) * Math.cos(x) * b * (Math.cos(y) > 0 ? 0.55 : 1) - 0.04, u, !1);
  }
  for (let v = 0; v < 7; v++) {
    let y = v / 7 * We;
    I(Ce(0.12, 0.02, 16, 12), p, Math.sin(y) * 0.12, 1.24 + v % 2 * 0.05, Math.cos(y) * 0.12 - 0.05, u, !1);
  }
  I(Ce(0.13, 0.02, 16, 12), p, 0, 1.36, -0.04, u, !1), I(ut(0.1, 0.03, 8, 20, We, 0), Pe("#ffb800", {
    r: 0.3
  }), 0, 1.15, 0.05, u, !1).rotation.x = xe / 2, Vr(u, -0.11, 0.84, 0.25, 0.09), I(ut(0.06, 0.018, 8, 16, xe, 0), rt.pupil, 0.12, 0.83, 0.29, u, !1);
  let f = I(ut(0.09, 0.022, 8, 20, xe, 0), Pe("#b50c3d", {
    r: 0.3
  }), 0, 0.7, 0.28, u, !1);
  f.rotation.z = xe;
  for (let v of [-1, 1]) {
    I(Ce(0.05, 0, 10, 8), Pe("#f0446b", {
      r: 0.5
    }), v * 0.19, 0.72, 0.24, u, !1);
    for (let y = 0; y < 3; y++) I(Ce(0.012, 0, 8, 6), Pe("#8f1b3c", {
      r: 0.6
    }), v * (0.16 + y * 0.03), 0.76 + y % 2 * 0.02, 0.27, u, !1);
  }
  let m = [];
  for (let v of [-1, 1]) {
    let y = Ge(u, v * 0.3, 0.45, 0);
    for (let x = 0; x < 4; x++) I(qe(0.055, 0.055, 0.12, 12, 0), x % 2 ? a : Pe("#22b51b", {
      r: 0.45
    }), 0, 0.06 + x * 0.12, 0, y, !1);
    I(Ce(0.07, 0.01), o, 0, 0.54, 0, y, !1), y.rotation.z = -v * 0.9, m.push(y);
  }
  return {
    root: e,
    wheels: r,
    ch: u,
    chY: 0.7,
    update(v, y) {
      l.rotation.z = Math.sin(v * 2.3) * 0.05, l.rotation.x = Math.cos(v * 1.9) * 0.05, h.rotation.y = v * 5, h.rotation.z = Math.sin(v * 5) * 0.18, h.position.y = 1.15 + Math.sin(v * 10) * 0.05, u.position.y = 0.7 + Math.sin(v * 5) * 0.03, m[0].rotation.z = 0.9 + Math.sin(v * 5) * 0.15, m[1].rotation.z = -0.9 - Math.sin(v * 5) * 0.15;
    }
  };
}
function ox() {
  let i = et[3],
    e = new Er(),
    t = Ge(e),
    r = [],
    n = Pe(i.color, {
      r: 0.48
    }),
    s = Pe(i.dark, {
      r: 0.5
    }),
    o = Pe("#36a338", {
      r: 0.46
    }),
    a = Pe("#155018", {
      r: 0.48
    }),
    l = Pe("#3da83f", {
      r: 0.46
    });
  I(Xe(1.32, 0.5, 1.72, 0.18, 0.008), n, 0, 0.52, 0, t), I(Xe(1.1, 0.2, 1.2, 0.08, 0.008), s, 0, 0.82, -0.1, t);
  for (let g = 0; g < 5; g++) for (let f of [-1, 1]) I(Ce(0.04, 0, 10, 8), rt.metal, f * 0.67, 0.6, -0.6 + g * 0.3, t, !1);
  I(Xe(0.8, 0.22, 0.12, 0.05, 0), Pe("#242028", {
    r: 0.5
  }), 0, 0.42, 0.86, t);
  for (let g = 0; g < 4; g++) I(Xe(0.04, 0.16, 0.04, 0.01, 0), rt.metal, -0.24 + g * 0.16, 0.42, 0.92, t, !1);
  Vr(t, -0.3, 0.72, 0.78, 0.13, {
    lid: i.dark,
    la: -0.1,
    lz: 0.45
  }), Vr(t, 0.3, 0.72, 0.78, 0.13, {
    lid: i.dark,
    la: -0.1,
    lz: -0.45
  });
  for (let g of [-1, 1]) {
    let f = I(qe(0.08, 0.08, 0.6, 14, 0), rt.metal, g * 0.42, 0.9, -0.82, t);
    f.rotation.x = -0.7, I(qe(0.1, 0.1, 0.06, 14, 0), Pe("#221e26", {
      r: 0.5
    }), g * 0.42, 1.12, -1.06, t, !1).rotation.x = -0.7;
  }
  er(t, -0.7, 0.32, 0.56, 0.32, 0.32, i.color, r), er(t, 0.7, 0.32, 0.56, 0.32, 0.32, i.color, r), er(t, -0.7, 0.32, -0.56, 0.32, 0.32, i.color, r), er(t, 0.7, 0.32, -0.56, 0.32, 0.32, i.color, r);
  let c = Ge(t, 0.5, 0.5, -0.9);
  for (let g = 0; g < 4; g++) {
    let f = I(ut(0.06, 0.018, 8, 16, We, 0), rt.metal, 0, 0, -g * 0.11, c, !1);
    f.rotation.y = g % 2 ? 0 : xe / 2;
  }
  I(Ce(0.27, 0.01), Pe("#1c1e24", {
    r: 0.35,
    m: 0.45
  }), 0, -0.12, -0.6, c), I(Ce(0.05, 0, 10, 8), rt.shine, -0.1, -0.02, -0.45, c, !1);
  let h = Ge(e, 0, 0.8, -0.15);
  I(Ce(0.38, 0.015), o, 0, 0.35, 0, h).scale.set(1, 1.05, 0.9);
  let d = I(Ns(0.47), a, 0, 0.42, -0.08, h);
  d.rotation.x = -xe / 2, d.scale.set(1, 1, 0.7), I(ut(0.46, 0.05, 10, 36, We, 0), Pe("#cfa117", {
    r: 0.35,
    m: 0.2
  }), 0, 0.42, -0.08, h, !1);
  for (let g = 0; g < 5; g++) {
    let f = g / 5 * We,
      m = I(Ce(0.13, 0, 12, 10), Pe("#227a26", {
        r: 0.46
      }), Math.sin(f) * 0.22, 0.42 + Math.cos(f) * 0.22, -0.36, h, !1);
    m.scale.z = 0.35;
  }
  I(Ce(0.13, 0, 12, 10), Pe("#227a26", {
    r: 0.46
  }), 0, 0.42, -0.42, h, !1).scale.z = 0.35;
  let u = I(Ce(0.3, 0.015), l, 0, 0.88, 0.14, h);
  u.scale.set(1.05, 0.92, 1);
  for (let g of [-1, 1]) I(ut(0.11, 0.04, 10, 24, We, 0), Pe("#30343d", {
    m: 0.4,
    r: 0.35
  }), g * 0.13, 0.95, 0.38, h), Vr(h, g * 0.13, 0.95, 0.36, 0.1, {
    lid: "#1b631e",
    la: 0.35
  });
  let p = I(ut(0.33, 0.03, 8, 34, We, 0), Pe("#38281a", {
    r: 0.5
  }), 0, 0.95, 0.12, h, !1);
  p.rotation.x = xe / 2, I(Xe(0.2, 0.035, 0.03, 0.012, 0), rt.mouth, 0, 0.76, 0.43, h, !1);
  for (let g of [-1, 1]) I(qi(0.08, 0.28, 0.01), l, g * 0.36, 0.3, 0.25, h).rotation.set(1.2, 0, -g * 0.3);
  return {
    root: e,
    wheels: r,
    ch: h,
    chY: 0.8,
    update(g, f) {
      c.rotation.x = Math.sin(g * 3.2) * 0.35 * (0.5 + f), c.rotation.z = Math.sin(g * 2.1) * 0.3, h.position.y = 0.8 + Math.abs(Math.sin(g * 4)) * 0.025, u.rotation.y = Math.sin(g * 1.3) * 0.15;
    }
  };
}
var zd = [nx, sx, ax, ox];
function Id(i) {
  let e = zd[i](),
    t = new pt(wl, Sl);
  return t.scale.set(2.2, 1, 2.4), t.position.y = 0.02, t.renderOrder = -1, e.root.add(t), e;
}
var va = new Ls("#80d0ff", "#2d6812", 0.8);
wt.add(va);
var Cr = new Ai("#fff4dc", 2.4);
Cr.position.set(12, 24, 10);
Cr.castShadow = !0;
Cr.shadow.mapSize.set(1024, 1024);
Object.assign(Cr.shadow.camera, {
  left: -19,
  right: 19,
  top: 19,
  bottom: -19,
  near: 1,
  far: 80
});
Cr.shadow.bias = -4e-4;
Cr.shadow.normalBias = 0.03;
wt.add(Cr);
wt.add(Cr.target);
var Od = new Ai("#b0d8ff", 0.4);
Od.position.set(-14, 10, -12);
wt.add(Od);
var _l = new Za("#ff5500", 0, 60, 1.8);
_l.position.set(0, 6, -16);
wt.add(_l);
var Un = new Za("#fff4c0", 0, 12, 2.2);
Un.position.set(0, 2, 0);
wt.add(Un);
var $i = [{
    id: "garden",
    name: "CLAY GARDEN",
    sky: ["#248be3", "#86d4ff"],
    fog: ["#58b2ed", 65, 145],
    hemi: ["#80d0ff", "#2d6812", 0.8],
    sun: ["#fff4dc", 2.4, [12, 24, 10]],
    env: 0,
    exp: 1.15,
    ground: "#2c7816",
    slab: "#6e3810",
    floor: {
      gap: "#1c4e0e",
      tiles: ["#3fa626", "#2d8c18", "#e26012", "#1b6fd9", "#e89e00", "#349940"],
      swirl: "#95f03a"
    },
    art: "linear-gradient(#248be3 0 35%,#2c7816 35%)",
    icons: ["\u{1F333}", "\u{1F344}", "\u{1F33C}", "\u{1F344}"],
    r: -2
  }, {
    id: "desert",
    name: "CLAY DESERT",
    sky: ["#eb4010", "#ff982e"],
    fog: ["#d45d1e", 65, 160],
    hemi: ["#ffb070", "#662808", 0.7],
    sun: ["#ff9f50", 2.7, [-20, 13, -6]],
    env: 0,
    exp: 1.12,
    ground: "#ba641e",
    slab: "#732c0a",
    floor: {
      gap: "#5a2005",
      tiles: ["#cf6719", "#bd5711", "#dc7d25", "#ad470b", "#d67120"],
      swirl: "#ffc233"
    },
    art: "linear-gradient(#eb4010,#ffa033 40%,#ba641e 40%)",
    icons: ["\u{1F335}", "\u{1FAA8}", "\u{1F335}", "\u2600\uFE0F"],
    r: 2
  }, {
    id: "snow",
    name: "CLAY SNOW",
    sky: ["#225ea8", "#8ec9f5"],
    fog: ["#6eaad9", 55, 145],
    hemi: ["#c4e5ff", "#2c4b75", 0.9],
    sun: ["#ffffff", 2.2, [10, 24, 12]],
    env: 0,
    exp: 1.15,
    ground: "#c5e2f7",
    slab: "#2b4a70",
    floor: {
      gap: "#38608a",
      tiles: ["#daf0fd", "#c0e3f8", "#abd6f2", "#ccebfa", "#9cc9eb"],
      swirl: "#ffffff"
    },
    art: "linear-gradient(#225ea8 0 35%,#c5e2f7 35%)",
    icons: ["\u{1F332}", "\u26C4", "\u2744\uFE0F", "\u{1F332}"],
    r: -1
  }, {
    id: "factory",
    name: "CLAY TOY FACTORY",
    sky: ["#26334a", "#6c7f9e"],
    fog: ["#506482", 55, 145],
    hemi: ["#b8c8f0", "#252d3d", 0.85],
    sun: ["#fff2d0", 2.3, [8, 22, 14]],
    env: 0,
    exp: 1.15,
    ground: "#404654",
    slab: "#1a202c",
    floor: {
      gap: "#121721",
      checker: ["#f5b300", "#1864cc"],
      swirl: "#ffdc33"
    },
    art: "repeating-conic-gradient(#f5b300 0 25%,#1864cc 0 50%) 0 0/36px 36px",
    icons: ["\u2699\uFE0F", "\u{1F527}", "\u2699\uFE0F", "\u{1F9F8}"],
    r: 1.5
  }, {
    id: "volcano",
    name: "CLAY VOLCANO",
    sky: ["#0d0202", "#541205"],
    fog: ["#2e0804", 35, 120],
    hemi: ["#ff6b3d", "#140303", 0.6],
    sun: ["#ff8547", 1.8, [-10, 18, 8]],
    env: 2.8,
    exp: 1.18,
    ground: "#1c1210",
    slab: "#0d0707",
    floor: {
      gap: "#0a0505",
      tiles: ["#2c1e1c", "#221616", "#352422", "#281a18"],
      lava: !0,
      swirl: "#4a2820"
    },
    art: "radial-gradient(circle at 50% 120%,#ff5500,#3a0e08 60%,#0d0202)",
    icons: ["\u{1F30B}", "\u{1F525}", "\u{1FAA8}", "\u{1F525}"],
    r: -2.5
  }],
  Fn = {};
$i.forEach((i, e) => Fn[i.id] = i);
function cx(i) {
  let [e, t] = Pr(16, 256),
    r = t.createLinearGradient(0, 0, 0, 256);
  r.addColorStop(0, i.sky[0]), r.addColorStop(1, i.sky[1]), t.fillStyle = r, t.fillRect(0, 0, 16, 256);
  let n = new lr(e);
  return n.encoding = Ke, n;
}
function lx(i) {
  let [e, t] = Pr(1024, 1024),
    [r, n] = Pr(1024, 1024),
    s = i.floor,
    o = Os(i.id.length * 31 + 7);
  t.fillStyle = s.gap, t.fillRect(0, 0, 1024, 1024), n.fillStyle = "#000", n.fillRect(0, 0, 1024, 1024);
  let a = 6,
    l = 1024 / a;
  for (let d = 0; d < a; d++) for (let u = 0; u < a; u++) {
    let p = s.checker ? s.checker[(d + u) % 2] : s.tiles[Math.floor(o() * s.tiles.length)],
      g = d * l + 6 + o() * 2,
      f = u * l + 6 + o() * 2,
      m = l - 12 - o() * 3,
      v = l - 12 - o() * 3;
    t.fillStyle = p, vs(t, g, f, m, v, 20), t.fill();
    let y = t.createRadialGradient(g + m * 0.32, f + v * 0.28, 8, g + m / 2, f + v / 2, m * 0.75);
    if (y.addColorStop(0, "rgba(255,255,255,.22)"), y.addColorStop(1, "rgba(0,0,0,.15)"), t.fillStyle = y, vs(t, g, f, m, v, 20), t.fill(), o() < 0.35) {
      t.strokeStyle = s.swirl, t.globalAlpha = 0.75, t.lineWidth = 8, t.lineCap = "round", t.beginPath();
      let x = g + m / 2,
        b = f + v / 2;
      for (let w = 0; w < 4.2 * xe; w += 0.15) {
        let A = w * l * 0.03,
          L = x + Math.cos(w) * A,
          M = b + Math.sin(w) * A;
        w ? t.lineTo(L, M) : t.moveTo(L, M);
      }
      t.stroke(), t.globalAlpha = 1;
    }
    if (o() < 0.5) {
      let x = (b, w, A) => {
        b.strokeStyle = w, b.lineWidth = A, b.beginPath();
        let L = g + o() * m,
          M = f + o() * v;
        b.moveTo(L, M);
        for (let T = 0; T < 5; T++) L += st(-40, 40), M += st(-40, 40), L = Ui(L, g, g + m), M = Ui(M, f, f + v), b.lineTo(L, M);
        b.stroke();
      };
      s.lava ? x(t, "#ff5500", 6) : x(t, "rgba(0,0,0,.28)", 3);
    }
    if (i.id === "garden" && o() < 0.45) for (let x = 0; x < 4; x++) {
      let b = g + o() * m,
        w = f + o() * v;
      t.fillStyle = ["#ffffff", "#ffbc00", "#ff2d7a"][x % 3];
      for (let A = 0; A < 5; A++) t.beginPath(), t.arc(b + Math.cos(A * 1.25) * 7, w + Math.sin(A * 1.25) * 7, 5, 0, We), t.fill();
      t.fillStyle = "#e69500", t.beginPath(), t.arc(b, w, 4, 0, We), t.fill();
    }
  }
  if (s.lava) {
    n.strokeStyle = "#ff6600", n.lineWidth = 9, n.shadowColor = "#ff3300", n.shadowBlur = 22;
    for (let d = 1; d < a; d++) {
      n.beginPath(), n.moveTo(d * l, 0);
      for (let u = 0; u <= 1024; u += 40) n.lineTo(d * l + st(-6, 6), u);
      n.stroke(), n.beginPath(), n.moveTo(0, d * l);
      for (let u = 0; u <= 1024; u += 40) n.lineTo(u, d * l + st(-6, 6));
      n.stroke();
    }
    t.globalCompositeOperation = "lighter", t.globalAlpha = 0.7, t.drawImage(r, 0, 0), t.globalAlpha = 1, t.globalCompositeOperation = "source-over";
  }
  let c = new lr(e);
  c.encoding = Ke, c.anisotropy = kn, c.generateMipmaps = !0, c.minFilter = qr, c.magFilter = It;
  let h = new lr(r);
  return h.encoding = Ke, h.anisotropy = kn, h.generateMipmaps = !0, h.minFilter = qr, h.magFilter = It, {
    map: c,
    em: h
  };
}
var fi = Ge(wt),
  xa = ["#6e1ed4", "#106ce8", "#12a832", "#f5af00", "#f2580a", "#e01c1c"],
  Fi = new Wt({
    roughness: 0.58,
    bumpMap: oo,
    bumpScale: 0.1,
    emissive: new He("#000")
  }),
  Nd = Ds("#6e3810", {
    r: 0.55
  }),
  kd = Ds("#2c7816", {
    r: 0.58
  });
(function () {
  let i = new Ji(),
    e = [[-Ee + $t, -Ee], [Ee - $t, -Ee], [Ee, -Ee + $t], [Ee, Ee - $t], [Ee - $t, Ee], [-Ee + $t, Ee], [-Ee, Ee - $t], [-Ee, -Ee + $t]];
  i.moveTo(e[0][0], e[0][1]);
  for (let h = 1; h < 8; h++) i.lineTo(e[h][0], e[h][1]);
  let t = new Kc(i);
  t.rotateX(-xe / 2);
  let r = t.attributes.position,
    n = t.attributes.uv;
  for (let h = 0; h < r.count; h++) n.setXY(h, (r.getX(h) + Ee) / (2 * Ee), 1 - (r.getZ(h) + Ee) / (2 * Ee));
  let s = new pt(t, Fi);
  s.receiveShadow = !0, fi.add(s), I(Xe(2 * Ee + 2.2, 0.7, 2 * Ee + 2.2, 0.35, 0.01), Nd, 0, -0.36, 0, fi, !1);
  for (let h = 0; h < 3; h++) I(Xe(2 * Ee + 2.6 + h * 0.5, 0.18, 2 * Ee + 2.6 + h * 0.5, 0.09, 0.01), we(xa[(h * 2 + 1) % 6], {
    r: 0.46
  }), 0, -0.18 - h * 0.17, 0, fi, !1);
  let o = new pt(new Ts(160, 48).rotateX(-xe / 2), kd);
  o.position.y = -0.72, o.receiveShadow = !0, wt.add(o);
  let a = (h, d, u) => {
      let p = ni[h];
      return [-p.x * u + -p.z * d, -p.z * u + p.x * d];
    },
    l = (h, d, u, p) => {
      let g = Math.hypot(u - h, p - d),
        f = Ge(fi, (h + u) / 2, 0, (d + p) / 2);
      f.rotation.y = Math.atan2(-(p - d), u - h);
      for (let m = 0; m < 6; m++) I(Xe(g + 0.02, 0.2, 0.66 - m * 0.035, 0.095, 0.01), we(xa[m], {
        r: 0.46
      }), 0, 0.1 + m * 0.175, 0, f, m > 3);
    },
    c = (h, d) => {
      for (let u = 0; u < 6; u++) I(qe(0.42 - u * 0.02, 0.44 - u * 0.02, 0.18, 24, 0), we(xa[u], {
        r: 0.46
      }), h, 0.09 + u * 0.175, d, fi, u > 3);
      I(Ce(0.26, 0.01), we("#e01c1c", {
        r: 0.44
      }), h, 1.13, d, fi);
    };
  for (let h = 0; h < 4; h++) for (let d of [-1, 1]) {
    let u = a(h, d * (xt + 0.22), Ee + 0.33),
      p = a(h, d * (Ee - $t + 0.1), Ee + 0.33);
    l(u[0], u[1], p[0], p[1]);
    let g = a(h, d * (Ee - $t + 0.05), Ee + 0.2);
    c(g[0], g[1]);
  }
  for (let h of [-1, 1]) for (let d of [-1, 1]) {
    let u = 0.33 / ji;
    l(h * (Ee - $t) + h * u, d * Ee + d * u, h * Ee + h * u, d * (Ee - $t) + d * u);
  }
})();
function hx() {
  let [i, e] = Pr(128, 128);
  e.clearRect(0, 0, 128, 128), e.strokeStyle = "rgba(255,255,255,.98)", e.lineWidth = 5;
  for (let r = 0; r <= 128; r += 21) e.beginPath(), e.moveTo(r, 0), e.lineTo(r, 128), e.stroke(), e.beginPath(), e.moveTo(0, r), e.lineTo(128, r), e.stroke();
  let t = new lr(i);
  return t.wrapS = t.wrapT = Ln, t.repeat.set(4, 2), t.anisotropy = kn, t;
}
var ux = hx(),
  $o = new Wt({
    map: ux,
    transparent: !0,
    alphaTest: 0.35,
    side: Gr,
    roughness: 0.7,
    color: "#ffffff"
  }),
  Lr = [];
for (let i = 0; i < 4; i++) {
  let e = ni[i],
    t = Ge(fi, -e.x * Ee, 0, -e.z * Ee);
  t.rotation.y = Math.atan2(-e.x, -e.z);
  let r = 1.55,
    n = Ds("#ffffff", {
      r: 0.45
    }),
    s = Ds("#3a3230", {
      r: 0.55
    });
  I(new yi(2 * xt, r).rotateX(-xe / 2), s, 0, 0.015, r / 2, t, !1);
  for (let f of [-1, 1]) {
    I(qe(0.17, 0.19, 1.75, 18, 0), n, f * xt, 0.875, 0, t), I(qe(0.12, 0.13, 1.2, 14, 0), n, f * xt, 0.6, r, t), I(Ce(0.22, 0.01), n, f * xt, 1.78, 0, t);
    let m = I(qe(0.1, 0.1, Math.hypot(r, 0.55), 12, 0), n, f * xt, 1.48, r / 2, t);
    m.rotation.x = xe / 2 - Math.atan2(0.55, r);
  }
  let o = I(qe(0.15, 0.15, 2 * xt, 18, 0), n, 0, 1.75, 0, t);
  o.rotation.z = xe / 2;
  let a = I(qe(0.1, 0.1, 2 * xt, 14, 0), n, 0, 1.2, r, t);
  a.rotation.z = xe / 2;
  let l = new pt(new yi(2 * xt, 1.2), $o);
  l.position.set(0, 0.6, r), t.add(l);
  for (let f of [-1, 1]) {
    let m = new pt(new yi(r, 1.5), $o);
    m.rotation.y = xe / 2, m.position.set(f * xt, 0.75, r / 2), t.add(m);
  }
  let c = new pt(new yi(2 * xt, Math.hypot(r, 0.55)), $o);
  c.rotation.x = xe / 2 - Math.atan2(0.55, r) + xe / 2, c.position.set(0, 1.48, r / 2), t.add(c);
  let [h, d] = Pr(256, 128),
    u = new lr(h);
  u.encoding = Ke;
  let p = new zc(new Fa({
    map: u,
    depthTest: !0
  }));
  p.scale.set(2.2, 1.1, 1), p.position.set(0, 2.55, 0), t.add(p);
  let g = Ge(t, 0, 0, 0.15);
  for (let f = 0; f < 5; f++) I(Xe(2 * xt + 0.5, 0.24, 0.7 - f * 0.04, 0.11, 0.01), we(f % 2 ? "#9e724a" : "#7a4f28", {
    r: 0.55
  }), 0, 0.12 + f * 0.22, 0, g);
  I(Xe(2 * xt + 0.3, 0.16, 0.4, 0.08, 0), n, 0, 1.2, 0, g), g.visible = !1, Lr.push({
    g: t,
    mat: n,
    matD: s,
    hc: h,
    hg: d,
    ht: u,
    spr: p,
    wall: g,
    flash: 0,
    wallT: -1
  });
}
function Vn(i, e, t, r) {
  let n = Lr[i],
    s = n.hg;
  s.clearRect(0, 0, 256, 128), s.fillStyle = "rgba(25,12,5,.88)", vs(s, 8, 10, 240, 108, 30), s.fill(), s.fillStyle = t, vs(s, 16, 18, 224, 92, 24), s.fill(), s.fillStyle = "rgba(255,255,255,.3)", vs(s, 24, 22, 208, 30, 14), s.fill(), s.font = '64px "Luckiest Guy", "Arial Black"', s.textAlign = "center", s.textBaseline = "middle", s.fillStyle = "rgba(0,0,0,.45)";
  let o = r ? "OUT" : String(e);
  s.fillText(o, 128, 74), s.fillStyle = "#fff", s.fillText(o, 128, 69), n.ht.needsUpdate = !0;
}
var li = [];
for (let [i, e] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
  let t = i / ji,
    r = e / ji,
    n = Ee - $t / 2,
    s = Ge(fi, i * n + t * 1.05, 0, e * n + r * 1.05);
  s.rotation.y = Math.atan2(-t, -r);
  let o = Ds("#d2d6e4", {
    r: 0.3,
    m: 0.55
  });
  I(Xe(1.2, 0.35, 1.1, 0.12, 0.01), we("#e06f15", {
    r: 0.48
  }), 0, 0.55, 0, s), I(Xe(1, 0.12, 0.9, 0.05, 0.01), we("#6b3a12", {
    r: 0.55
  }), 0, 0.78, 0, s);
  let a = [];
  for (let g of [-1, 1]) for (let f of [-1, 1]) er(s, g * 0.62, 0.3, f * 0.38, 0.26, 0.18, "#e06f15", a);
  for (let g = 0; g < 5; g++) {
    let f = I(ut(0.22, 0.04, 8, 22, We, 0), we("#ffb300", {
      r: 0.35,
      m: 0.2
    }), 0, 0.88 + g * 0.08, -0.15, s, !1);
    f.rotation.x = xe / 2;
  }
  let l = Ge(s, 0, 1.05, -0.1);
  l.rotation.x = -0.5;
  let c = Ge(l);
  I(qe(0.3, 0.36, 1.3, 24, 0), o, 0, 0, 0.4, c).rotation.x = xe / 2, I(ut(0.32, 0.08, 12, 28, We, 0), we("#e01c1c", {
    r: 0.4
  }), 0, 0, 1.05, c).rotation.x = 0, I(ut(0.36, 0.06, 10, 28, We, 0), we("#106ce8", {
    r: 0.4
  }), 0, 0, 0, c);
  let h = I(qe(0.14, 0.14, 0.06, 18, 0), we("#ffffff", {
    r: 0.25
  }), 0.42, 0.15, 0.1, s, !1);
  h.rotation.z = xe / 2;
  let d = I(Ce(mt, 0), we("#ffffff", {
    r: 0.3
  }), 0, 0, 1.05, c);
  d.visible = !1;
  let u = i * n - t * 0.55,
    p = e * n - r * 0.55;
  li.push({
    g: s,
    piv: l,
    barrel: c,
    bmat: o,
    preview: d,
    charge: -1,
    queue: 0,
    recoil: 0,
    nx: t,
    nz: r,
    mx: u,
    mz: p,
    wheels: a
  });
}
var gu = ["#e61a10", "#146fe8", "#f5a800", "#0eb352", "#8524e8", "#ff5400", "#e61a10", "#146fe8"];
function dx(i) {
  let [e, t] = Pr(512, 256);
  t.fillStyle = i, t.fillRect(0, 0, 512, 256), t.fillStyle = "rgba(0,0,0,0.18)", t.fillRect(0, 96, 512, 64), t.fillStyle = "#ffffff", t.fillRect(0, 100, 512, 56), t.fillStyle = "#ffffff";
  for (let n = 0; n < 4; n++) t.beginPath(), t.arc(64 + n * 128, 48, 16, 0, We), t.fill(), t.beginPath(), t.arc(64 + n * 128, 208, 16, 0, We), t.fill();
  let r = new lr(e);
  return r.encoding = Ke, r.anisotropy = kn, r.generateMipmaps = !0, r.minFilter = qr, r.magFilter = It, r;
}
var gt = [];
for (let i = 0; i < 8; i++) {
  let e = Ge(wt),
    t = new Wt({
      map: dx(gu[i]),
      roughness: 0.35,
      metalness: 0.03,
      bumpMap: Ml,
      bumpScale: 0.03
    }),
    r = I(new Qi(mt, 32, 22), t, 0, 0, 0, e),
    n = new pt(wl, Sl);
  n.scale.set(1.3, 1, 1.3), n.renderOrder = -1, wt.add(n), e.visible = !1, n.visible = !1, gt.push({
    id: i,
    color: gu[i],
    gr: e,
    mesh: r,
    sh: n,
    active: !1,
    held: null,
    x: 0,
    z: 0,
    y: mt,
    vx: 0,
    vz: 0,
    vy: 0,
    ignore: [0, 0, 0, 0],
    squash: 0,
    lastHit: -1,
    chkT: 0,
    cx: 0,
    cz: 0,
    tx: 0,
    tz: 0,
    ty: 0,
    age: 0,
    heldSlot: -1
  });
}
var Dr = 500,
  px = ci(new Yc(0.1, 1), 0.02, 20),
  fx = new Wt({
    roughness: 0.8,
    bumpMap: oo,
    bumpScale: 0.2
  }),
  Wr = new Ic(px, fx, Dr);
Wr.frustumCulled = !1;
Wr.castShadow = !1;
wt.add(Wr);
var wr = new Float32Array(Dr * 3),
  kr = new Float32Array(Dr * 3),
  us = new Float32Array(Dr),
  Ud = new Float32Array(Dr),
  Fd = new Float32Array(Dr),
  ya = new Float32Array(Dr),
  ec = new at(),
  ol = new He(),
  Bd = new at().makeScale(0, 0, 0);
for (let i = 0; i < Dr; i++) Wr.setMatrixAt(i, Bd), Wr.setColorAt(i, ol.set("#ffffff"));
var tc = 0,
  cl = 0;
function Jt(i, e, t, r, n, s, o, a, l = 1, c = 18, h = 1) {
  ol.set(n);
  for (let d = 0; d < r; d++) {
    let u = tc;
    tc = (tc + 1) % Dr;
    let p = Math.random() * We,
      g = s * (0.35 + Math.random() * 0.65);
    wr[u * 3] = i, wr[u * 3 + 1] = e, wr[u * 3 + 2] = t, kr[u * 3] = Math.cos(p) * g * h, kr[u * 3 + 1] = (0.4 + Math.random()) * g * 0.6 * l, kr[u * 3 + 2] = Math.sin(p) * g * h, us[u] = Ud[u] = a * (0.6 + Math.random() * 0.6), Fd[u] = o * (0.6 + Math.random() * 0.8), ya[u] = c;
    let f = 0.85 + Math.random() * 0.3;
    Wr.setColorAt(u, ol.clone().multiplyScalar(f));
  }
  Wr.instanceColor.needsUpdate = !0, cl = Dr;
}
function mx(i) {
  if (!cl) return;
  let e = 0;
  for (let t = 0; t < Dr; t++) {
    if (us[t] <= 0) continue;
    if (us[t] -= i, us[t] <= 0) {
      Wr.setMatrixAt(t, Bd);
      continue;
    }
    e++;
    let r = t * 3;
    kr[r + 1] -= ya[t] * i, wr[r] += kr[r] * i, wr[r + 1] += kr[r + 1] * i, wr[r + 2] += kr[r + 2] * i, wr[r + 1] < 0.05 && ya[t] > 0 && (wr[r + 1] = 0.05, kr[r + 1] *= -0.3, kr[r] *= 0.7, kr[r + 2] *= 0.7);
    let n = us[t] / Ud[t],
      s = Fd[t] * (ya[t] <= 0 ? 1.6 - n * 0.8 : Math.min(1, n * 2.5));
    ec.makeScale(s * 10, s * 10, s * 10), ec.setPosition(wr[r], wr[r + 1], wr[r + 2]), Wr.setMatrixAt(t, ec);
  }
  Wr.instanceMatrix.needsUpdate = !0, e || (cl = 0);
}
var Ja = [];
for (let i = 0; i < 10; i++) {
  let e = new pt(new Jc(0.55, 0.85, 40).rotateX(-xe / 2), new Ei({
    color: "#fff",
    transparent: !0,
    depthWrite: !1,
    opacity: 0,
    blending: wa
  }));
  e.visible = !1, wt.add(e), Ja.push({
    m: e,
    t: 1,
    dur: 0.4,
    s: 3
  });
}
var rc = 0;
function ba(i, e, t, r = 3, n = 0.4) {
  let s = Ja[rc];
  rc = (rc + 1) % Ja.length, s.m.material.color.set(t), s.m.position.set(i, 0.08, e), s.t = 0, s.dur = n, s.s = r, s.m.visible = !0;
}
function gx(i) {
  for (let e of Ja) {
    if (!e.m.visible) continue;
    if (e.t += i / e.dur, e.t >= 1) {
      e.m.visible = !1;
      continue;
    }
    let t = 0.4 + e.t * e.s;
    e.m.scale.set(t, 1, t), e.m.material.opacity = (1 - e.t) * 0.9;
  }
}
var mi = {};
function Gd(i) {
  let e = Ge(wt),
    t = [],
    r = Os(i.length * 977 + i.charCodeAt(0)),
    n = -0.72,
    s = (c, h, d, u = !1) => {
      for (let p = 0; p < 60; p++) {
        let g = r() * We,
          f = c + r() * (h - c),
          m = Math.cos(g) * f,
          v = Math.sin(g) * f;
        if (!(Math.abs(m) < Ee + 3 && Math.abs(v) < Ee + 3) && !(u && v > Ee + 2 && Math.abs(m) < Ee + 6)) {
          d(m, v, r);
          return;
        }
      }
    },
    o = (c, h, d, u) => {
      let p = I(Ce(d, 0.06, 24, 14), we(u), c, n - d * 0.55, h, e, !1);
      p.scale.y = 0.5;
    },
    a = null;
  if (i === "garden") {
    let c = (p, g, f) => {
        let m = Ge(e, p, n, g);
        m.scale.setScalar(f), I(qe(0.25, 0.38, 2, 14, 0.02), we("#6e3810", {
          r: 0.55
        }), 0, 1, 0, m), I(Ce(1.15, 0.02), we("#288c1c", {
          r: 0.5
        }), 0, 2.7, 0, m), I(Ce(0.85, 0.02), we("#38a628", {
          r: 0.5
        }), 0.75, 2.25, 0.3, m), I(Ce(0.8, 0.02), we("#1f7014", {
          r: 0.5
        }), -0.65, 2.35, -0.2, m), I(Ce(0.6, 0.02), we("#329c22", {
          r: 0.5
        }), 0.1, 3.5, 0.1, m), t.push(v => m.rotation.z = Math.sin(v * 0.8 + p) * 0.02);
      },
      h = (p, g, f, m) => {
        let v = Ge(e, p, n, g);
        v.scale.setScalar(f), I(qe(0.16, 0.22, 0.6, 14, 0), we("#fffdf2", {
          r: 0.45
        }), 0, 0.3, 0, v);
        let y = I(Ns(0.5), we(m, {
          r: 0.44
        }), 0, 0.55, 0, v);
        y.scale.y = 0.7;
        for (let x = 0; x < 4; x++) {
          let b = x * 1.6;
          I(Ce(0.08, 0, 10, 8), we("#ffffff", {
            r: 0.3
          }), Math.sin(b) * 0.3, 0.75, Math.cos(b) * 0.3, v, !1);
        }
      },
      d = (p, g, f) => {
        let m = Ge(e, p, n, g);
        I(qe(0.03, 0.03, 0.6, 8, 0), we("#288c1c", {
          r: 0.5
        }), 0, 0.3, 0, m, !1);
        let v = I(ut(0.12, 0.07, 10, 16, We, 0), we(f, {
          r: 0.44
        }), 0, 0.65, 0, m, !1);
        v.rotation.x = -1.1, I(Ce(0.08, 0, 10, 8), we("#ffb800", {
          r: 0.35
        }), 0, 0.68, 0.03, m, !1), t.push(y => m.rotation.z = Math.sin(y * 2 + p * 3) * 0.12);
      },
      u = (p, g) => {
        for (let f = 0; f < 3; f++) I(Ce(0.6 + r() * 0.3, 0.02), we(["#288c1c", "#38a628", "#1f7014"][f], {
          r: 0.5
        }), p + st(-0.6, 0.6), n + 0.3, g + st(-0.6, 0.6), e);
      };
    for (let p = 0; p < 14; p++) s(17, 34, (g, f) => c(g, f, 1 + r() * 0.6), !0);
    for (let p = 0; p < 14; p++) s(13, 24, (g, f) => h(g, f, 0.8 + r() * 0.9, ["#e01c1c", "#8c22e6", "#ff5a00"][p % 3]));
    for (let p = 0; p < 34; p++) s(12.5, 22, (g, f) => d(g, f, ["#ffffff", "#ff267e", "#ffb800", "#00c2f5"][p % 4]));
    for (let p = 0; p < 12; p++) s(14, 30, (g, f) => u(g, f));
    for (let p = 0; p < 8; p++) {
      let g = xe + r() * xe;
      o(Math.cos(g) * 55, Math.sin(g) * 55, 10 + r() * 8, "#226e13");
    }
    a = {
      n: 140,
      color: "#ffea70",
      size: 0.22,
      box: [30, 8, 30],
      vel: [0.3, 0.2, 0.2],
      wob: 1
    };
  } else if (i === "desert") {
    let c = (u, p, g) => {
        let f = Ge(e, u, n, p);
        f.scale.setScalar(g);
        let m = we("#23821c", {
          r: 0.5
        });
        I(qi(0.36, 1.7, 0.01), m, 0, 1.2, 0, f);
        for (let v of [-1, 1]) if (r() < 0.8) {
          let y = I(qi(0.18, 0.35, 0), m, v * 0.45, 1.1 + r() * 0.3, 0, f);
          y.rotation.z = xe / 2, I(qi(0.18, 0.5, 0), m, v * 0.68, 1.45, 0, f);
        }
        I(Ce(0.14, 0, 12, 10), we("#e8156e", {
          r: 0.4
        }), 0, 2.25, 0, f, !1);
        for (let v = 0; v < 8; v++) I(qe(0.012, 0.012, 0.12, 6, 0), we("#fffae8", {
          r: 0.3
        }), Math.sin(v) * 0.37, 0.6 + v * 0.2, Math.cos(v) * 0.37, f, !1);
      },
      h = (u, p, g) => {
        let f = I(ci(new qa(g, 1), g * 0.06, 2 / g), we(["#a85220", "#8c3c12", "#bd6228"][Math.floor(r() * 3)], {
          r: 0.6
        }), u, n + g * 0.4, p, e);
        f.rotation.set(r(), r(), r()), f.scale.y = 0.7;
      };
    for (let u = 0; u < 16; u++) s(14, 32, (p, g) => c(p, g, 0.9 + r() * 0.7), !0);
    for (let u = 0; u < 22; u++) s(13, 30, (p, g) => h(p, g, 0.4 + r() * 1.1));
    for (let u = 0; u < 6; u++) {
      let p = xe * 1.15 + u * 0.14 * xe,
        g = Math.cos(p) * 70,
        f = Math.sin(p) * 70,
        m = Ge(e, g, n, f),
        v = 6 + r() * 6,
        y = 6 + r() * 7;
      for (let x = 0; x < 4; x++) I(qe(v * (1 - x * 0.05), v * (1.02 - x * 0.05), y / 4, 16, 0), we(["#b8551c", "#c76826", "#a34510", "#d1752e"][x], {
        r: 0.6
      }), 0, y / 8 + x * y / 4, 0, m, !1);
    }
    let d = new pt(new Qi(9, 32, 16), new Ei({
      color: "#ffc24a",
      fog: !1
    }));
    d.position.set(-60, 10, -110), e.add(d), a = {
      n: 120,
      color: "#f7b368",
      size: 0.18,
      box: [30, 4, 30],
      vel: [2.5, 0.1, 0.6],
      wob: 0.5
    };
  } else if (i === "snow") {
    let c = (u, p, g) => {
        let f = Ge(e, u, n, p);
        f.scale.setScalar(g), I(qe(0.2, 0.26, 0.8, 12, 0), we("#5e3518", {
          r: 0.6
        }), 0, 0.4, 0, f);
        for (let m = 0; m < 3; m++) I(ss(1.2 - m * 0.3, 1.3, 14, 0), we("#0f4f32", {
          r: 0.5
        }), 0, 1.2 + m * 0.75, 0, f), I(ss(0.9 - m * 0.25, 0.6, 14, 0), we("#ffffff", {
          r: 0.45
        }), 0, 1.65 + m * 0.75, 0, f, !1);
      },
      h = (u, p) => {
        let g = Ge(e, u, n, p),
          f = we("#ffffff", {
            r: 0.45
          });
        I(Ce(0.7, 0.01), f, 0, 0.6, 0, g), I(Ce(0.5, 0.01), f, 0, 1.5, 0, g), I(Ce(0.36, 0.01), f, 0, 2.2, 0, g);
        let m = I(ss(0.08, 0.4, 10, 0), we("#ff7700", {
          r: 0.4
        }), 0, 2.2, 0.45, g, !1);
        m.rotation.x = xe / 2;
        for (let v of [-1, 1]) I(Ce(0.05, 0, 8, 8), rt.pupil, v * 0.12, 2.3, 0.32, g, !1);
        I(ut(0.38, 0.1, 10, 24, We, 0), we("#e01c1c", {
          r: 0.45
        }), 0, 1.9, 0, g).rotation.x = xe / 2, g.rotation.y = Math.atan2(-u, -p);
      },
      d = (u, p, g) => {
        let f = I(new Zc(g, 0), new Wt({
          color: "#7cd4ff",
          roughness: 0.1,
          metalness: 0.15,
          transparent: !0,
          opacity: 0.88,
          emissive: "#1468a8",
          emissiveIntensity: 0.4
        }), u, n + g * 1.4, p, e);
        f.scale.y = 1.8, f.rotation.y = r() * 3;
      };
    for (let u = 0; u < 18; u++) s(15, 34, (p, g) => c(p, g, 1 + r() * 0.8), !0);
    for (let u = 0; u < 3; u++) s(14, 22, (p, g) => h(p, g));
    for (let u = 0; u < 12; u++) s(13, 28, (p, g) => d(p, g, 0.4 + r() * 0.6));
    for (let u = 0; u < 14; u++) s(13, 30, (p, g) => {
      let f = I(Ce(0.8 + r() * 0.8, 0.02), we("#ffffff", {
        r: 0.45
      }), p, n, g, e);
      f.scale.y = 0.45;
    });
    for (let u = 0; u < 8; u++) {
      let p = xe + r() * xe;
      o(Math.cos(p) * 55, Math.sin(p) * 55, 12 + r() * 8, "#cfe4f7");
    }
    a = {
      n: 600,
      color: "#ffffff",
      size: 0.2,
      box: [34, 22, 34],
      vel: [0.4, -2.2, 0.2],
      wob: 1,
      fall: !0
    };
  } else if (i === "factory") {
    let c = (p, g, f, m, v, y) => {
        let x = new Ji(),
          b = Math.max(8, Math.round(m * 7));
        for (let T = 0; T < b * 4; T++) {
          let R = T / (b * 4) * We,
            H = T % 4 < 2 ? m : m * 0.8;
          T ? x.lineTo(Math.cos(R) * H, Math.sin(R) * H) : x.moveTo(Math.cos(R) * H, Math.sin(R) * H);
        }
        let w = new On();
        w.absarc(0, 0, m * 0.28, 0, We, !0), x.holes.push(w);
        let A = new Xa(x, {
          depth: m * 0.25,
          bevelEnabled: !0,
          bevelSize: 0.05,
          bevelThickness: 0.05,
          bevelSegments: 2,
          curveSegments: 4
        });
        A.center();
        let L = I(A, we(v, {
          r: 0.4,
          m: 0.3
        }), p, g, f, e);
        y ? L.rotation.x = xe / 2 : L.rotation.y = Math.atan2(-p, -f);
        let M = (r() < 0.5 ? 1 : -1) * (0.4 + r() * 0.6) / m;
        t.push((T, R) => L.rotation.z += M * R);
      },
      h = (p, g) => {
        let f = Ge(e, p, n, g);
        f.rotation.y = Math.atan2(-p, -g);
        let m = ["#e62218", "#166ae0", "#f5b300", "#12a832", "#8524e8"][Math.floor(r() * 5)];
        I(Xe(2.2, 2, 1.6, 0.3, 0), we(m, {
          r: 0.48
        }), 0, 1, 0, f), I(Xe(1.6, 0.4, 1.2, 0.15, 0), we("#282c36", {
          r: 0.55
        }), 0, 2.2, 0, f), I(qe(0.2, 0.25, 1.4, 14, 0), rt.metal, 0.6, 2.9, 0, f);
        let v = I(qe(0.3, 0.3, 0.06, 24, 0), we("#ffffff", {
          r: 0.25
        }), -0.4, 1.3, 0.82, f, !1);
        v.rotation.x = xe / 2;
        let y = I(Xe(0.04, 0.25, 0.03, 0.01, 0), we("#e62218", {
          r: 0.4
        }), -0.4, 1.38, 0.86, f, !1);
        t.push(x => y.rotation.z = Math.sin(x * 3 + p) * 1.2);
        for (let x = 0; x < 3; x++) I(Ce(0.09, 0, 10, 8), we(["#ff2218", "#16e038", "#ffcc00"][x], {
          e: ["#e61810", "#12b82e", "#e69e00"][x],
          ei: 1.1
        }), 0.2 + x * 0.25, 1.6, 0.82, f, !1);
      },
      d = (p, g, f) => {
        let m = Ge(e, p, n, g);
        m.rotation.y = r() * We;
        let v = we(f, {
          r: 0.42,
          m: 0.25
        });
        I(qe(0.3, 0.3, 3, 18, 0), v, 0, 1.5, 0, m);
        let y = I(ut(0.7, 0.3, 14, 18, xe / 2, 0), v, 0.7, 3, 0, m);
        y.rotation.z = 0, I(qe(0.3, 0.3, 3, 18, 0), v, 2.2, 3.7, 0, m).rotation.z = xe / 2, I(qe(0.4, 0.4, 0.2, 18, 0), we("#262a34", {
          r: 0.55
        }), 0, 0.4, 0, m);
      },
      u = (p, g) => {
        let f = Ge(e, p, n, g);
        f.rotation.y = Math.atan2(-p, -g) + xe / 2, I(Xe(6, 0.5, 1.4, 0.2, 0), we("#262a34", {
          r: 0.55
        }), 0, 0.6, 0, f), I(Xe(6.2, 0.2, 0.18, 0.08, 0), we("#f5b300", {
          r: 0.45
        }), 0, 0.9, 0.75, f), I(Xe(6.2, 0.2, 0.18, 0.08, 0), we("#f5b300", {
          r: 0.45
        }), 0, 0.9, -0.75, f);
        let m = [];
        for (let v = 0; v < 3; v++) {
          let y = I(Xe(0.6, 0.6, 0.6, 0.12, 0), we(["#e62218", "#166ae0", "#12a832"][v], {
            r: 0.45
          }), -2 + v * 2, 1.15, 0, f);
          m.push(y);
        }
        t.push(v => m.forEach((y, x) => y.position.x = (v * 0.8 + x * 2) % 6 - 3));
      };
    for (let p = 0; p < 10; p++) s(14, 30, (g, f) => c(g, n + 1 + r() * 4, f, 0.8 + r() * 1.6, ["#c2c6d4", "#f5b300", "#e62218", "#166ae0"][p % 4], r() < 0.3));
    for (let p = 0; p < 7; p++) s(15, 30, (g, f) => h(g, f), !0);
    for (let p = 0; p < 6; p++) s(15, 32, (g, f) => d(g, f, ["#e62218", "#12a832", "#166ae0", "#f5b300"][p % 4]), !0);
    for (let p = 0; p < 4; p++) s(14, 26, (g, f) => u(g, f));
    for (let p = 0; p < 3; p++) {
      let g = -30 + p * 30;
      c(g, 12, -45, 5 + r() * 2, ["#c2c6d4", "#f5b300", "#e62218"][p]);
    }
    a = {
      n: 90,
      color: "#ffdc40",
      size: 0.16,
      box: [30, 6, 30],
      vel: [0.2, 0.6, 0.2],
      wob: 1
    };
  } else if (i === "volcano") {
    let c = Ge(e, 0, n, -75);
    I(ss(26, 24, 32, 0.02), we("#1a0f0d", {
      r: 0.6
    }), 0, 12, 0, c, !1);
    let h = I(ss(6, 3, 24, 0), we("#ff4400", {
      e: "#ff2200",
      ei: 2
    }), 0, 23, 0, c, !1);
    t.push(u => h.material.emissiveIntensity = 1.6 + Math.sin(u * 3) * 0.5);
    let d = new Wt({
      color: "#ff5500",
      emissive: "#ff2e00",
      emissiveIntensity: 1.8,
      roughness: 0.3
    });
    for (let u = 0; u < 8; u++) s(13, 28, (p, g) => {
      let f = new pt(new Ts(1 + r() * 2, 24).rotateX(-xe / 2), d);
      f.position.set(p, n + 0.03, g), e.add(f);
      let m = I(ut(1, 0.25, 10, 26, We, 0), we("#120a09", {
        r: 0.6
      }), p, n + 0.05, g, e, !1);
      m.rotation.x = xe / 2, m.scale.setScalar(f.geometry.parameters.radius);
    });
    t.push(u => d.emissiveIntensity = 1.5 + Math.sin(u * 2.2) * 0.4);
    for (let u = 0; u < 26; u++) s(13, 32, (p, g) => {
      let f = 0.5 + r() * 1.4;
      I(ci(new qa(f, 1), f * 0.06, 2 / f), we(["#1c1210", "#2a1a16", "#150e0c"][u % 3], {
        r: 0.65
      }), p, n + f * 0.4, g, e).rotation.set(r(), r(), r());
    });
    for (let u = 0; u < 6; u++) {
      let p = xe + r() * xe;
      o(Math.cos(p) * 50, Math.sin(p) * 50, 10 + r() * 8, "#150c0a");
    }
    a = {
      n: 220,
      color: "#ff7720",
      size: 0.2,
      box: [30, 14, 30],
      vel: [0.2, 2.2, 0.2],
      wob: 1,
      rise: !0
    };
  }
  let l = null;
  if (a) {
    let c = new Tt(),
      h = new Float32Array(a.n * 3);
    for (let d = 0; d < a.n; d++) h[d * 3] = st(-a.box[0], a.box[0]), h[d * 3 + 1] = st(0, a.box[1]), h[d * 3 + 2] = st(-a.box[2], a.box[2]);
    c.setAttribute("position", new Qt(h, 3)), l = new Nc(c, new Ga({
      color: a.color,
      size: a.size,
      map: tx,
      transparent: !0,
      depthWrite: !1,
      blending: i === "volcano" ? wa : Wi
    })), l.frustumCulled = !1, e.add(l), t.push((d, u) => {
      let p = c.attributes.position.array;
      for (let g = 0; g < a.n; g++) {
        let f = g * 3;
        p[f] += (a.vel[0] + Math.sin(d + g) * a.wob * 0.5) * u, p[f + 1] += (a.vel[1] + Math.sin(d * 1.3 + g * 0.7) * 0.15) * u, p[f + 2] += (a.vel[2] + Math.cos(d + g) * a.wob * 0.4) * u, p[f + 1] < 0 && (p[f + 1] += a.box[1]), p[f + 1] > a.box[1] && (p[f + 1] -= a.box[1]), p[f] > a.box[0] && (p[f] -= 2 * a.box[0]), p[f] < -a.box[0] && (p[f] += 2 * a.box[0]), p[f + 2] > a.box[2] && (p[f + 2] -= 2 * a.box[2]), p[f + 2] < -a.box[2] && (p[f + 2] += 2 * a.box[2]);
      }
      c.attributes.position.needsUpdate = !0;
    });
  }
  return e.visible = !1, {
    g: e,
    anims: t,
    floor: lx(Fn[i]),
    sky: cx(Fn[i])
  };
}
var hr = "garden";
function Wn(i) {
  hr = i, mi[i] || (mi[i] = Gd(i));
  for (let r in mi) mi[r].g.visible = r === i;
  let e = Fn[i],
    t = mi[i];
  va.color.set(e.hemi[0]), va.groundColor.set(e.hemi[1]), va.intensity = e.hemi[2], Cr.color.set(e.sun[0]), Cr.intensity = e.sun[1], Cr.position.set(...e.sun[2]), _l.intensity = e.env, wt.background = t.sky, wt.fog.color.set(e.fog[0]), wt.fog.near = e.fog[1], wt.fog.far = e.fog[2], Fi.map = t.floor.map, Fi.emissiveMap = t.floor.em, Fi.emissive.set(e.floor.lava ? "#ffffff" : "#000000"), Fi.emissiveIntensity = e.floor.lava ? 1 : 0, Fi.needsUpdate = !0, Nd.color.set(e.slab), kd.color.set(e.ground), yr.toneMappingExposure = e.exp, tt && Re !== "select" && co(Re === "play" || Re === "countdown" ? i : "menu");
}
var vx = et.map((i, e) => {
    let t = Id(e);
    return wt.add(t.root), t;
  }),
  Ue = [0, 1, 2, 3].map(i => ({
    slot: i
  }));
function ks(i) {
  let e = ni[i.slot],
    t = -e.z,
    r = e.x,
    n = Rd - i.off;
  i.x = -e.x * n + t * i.t, i.z = -e.z * n + r * i.t;
  let s = Math.cos(i.aim),
    o = Math.sin(i.aim);
  i.dx = e.x * s + t * o, i.dz = e.z * s + r * o;
}
function Vd(i, e, t, r, n) {
  Object.assign(i, {
    slot: e,
    char: t,
    name: r,
    human: n === "local",
    remote: n === "remote",
    cpu: n === "cpu",
    t: 0,
    off: 0,
    vt: 0,
    aim: 0,
    aimTarget: 0,
    hp: Nn,
    alive: !0,
    holding: null,
    holdT: 0,
    dashT: -1,
    dashCD: 0,
    action: 0,
    actionSeen: 0,
    input: 0,
    netInput: 0,
    netActSeen: 0,
    smokeT: 0,
    hurt: 0,
    nt: 0,
    noff: 0,
    naim: 0,
    elimT: 0
  }), i.ai = {
    think: st(0.2, 0.38),
    moveT: 0,
    aim: 0,
    tgt: -1,
    aimOff: 0,
    err: 0,
    lastThreat: -1,
    throwAt: st(0.9, 2.2),
    threw: !1,
    skill: st(0.4, 0.65)
  }, i.model = vx[t], ks(i), i.px = i.x, i.pz = i.z, i.vx = i.vz = 0;
  let s = i.model;
  s.root.rotation.set(0, 0, 0), s.root.position.set(i.x, 0, i.z), s.root.scale.setScalar(1), s.ch.rotation.set(0, 0, 0);
}
var Re = "menu",
  cr = !0,
  Ar = !1,
  Hr = 0,
  tr = -1,
  jr = ao,
  Ci = 0,
  Nt = 0,
  fr = 0,
  gi = !1,
  Br = 0,
  ar = 0,
  ll = -1,
  hl = -1,
  Si = "PLAYER 1",
  Lt = 0,
  Wd = "single",
  Bn = 0,
  mr = {};
function Tl() {
  let i = 0;
  for (let e = 0; e < gt.length; e++) gt[e].active && i++;
  return i;
}
function vu(i) {
  return Ue[i].alive;
}
function Hn() {
  Ci++;
  let i = null,
    e = [];
  for (let t of li) t.charge < 0 && t.queue === 0 && e.push(t);
  i = e.length ? e[Math.floor(Math.random() * e.length)] : li[Math.floor(Math.random() * 4)], i.queue++;
}
function Hd(i) {
  for (let e = 0; e < 4; e++) {
    let t = li[e];
    t.charge < 0 && t.queue > 0 && (t.queue--, t.charge = 0, Rr("charge", e)), t.charge >= 0 && (t.charge += i, t.charge >= 0.9 && (t.charge = -1, xx(t, e)));
  }
}
function xx(i, e) {
  Ci = Math.max(0, Ci - 1);
  let t = null;
  for (let s of gt) if (!s.active) {
    t = s;
    break;
  }
  if (!t) return;
  let r = Math.atan2(-i.nz, -i.nx) + st(-0.42, 0.42),
    n = st(16, 19);
  Object.assign(t, {
    active: !0,
    held: null,
    x: i.mx,
    z: i.mz,
    y: 1.4,
    vy: 3,
    vx: Math.cos(r) * n,
    vz: Math.sin(r) * n,
    squash: 0.4,
    lastHit: -1,
    chkT: 0,
    cx: i.mx,
    cz: i.mz
  }), t.ignore.fill(0), Rr("launch", e, t.id);
}
function ul(i) {
  let e = null,
    t = 1e9;
  for (let r = 0; r < gt.length; r++) {
    let n = gt[r];
    if (!n.active || n.held || n.ignore[i.slot] > 0) continue;
    let s = n.x - i.x,
      o = n.z - i.z,
      a = s * i.dx + o * i.dz,
      l = Math.abs(s * i.dz - o * i.dx);
    if (a > -0.4 && a < 2.8 && l < 1.7) {
      let c = s * s + o * o;
      c < t && (t = c, e = n);
    }
  }
  return e;
}
function yx(i) {
  if (i.holding) {
    jd(i);
    return;
  }
  let e = ul(i);
  if (e) {
    e.held = i, i.holding = e, i.holdT = 0, i.ai.threw = !1, i.ai.throwAt = st(0.8, 2.2), i.ai.tgt = -1, Rr("cap", i.slot, e.id);
    return;
  }
}
function jd(i) {
  let e = i.holding;
  if (!e) return;
  i.holding = null, e.held = null;
  let t = 24;
  e.x = i.x + i.dx * 1.35, e.z = i.z + i.dz * 1.35, e.y = mt, e.vx = i.dx * t + i.vx * 0.35, e.vz = i.dz * t + i.vz * 0.35, e.vy = 2, e.ignore[i.slot] = 0.32, e.lastHit = i.slot, e.squash = 0.35, Rr("throw", i.slot, e.id);
}
function bx(i) {
  if (i.alive = !1, i.holding) {
    let e = i.holding;
    e.held = null, e.vx = i.dx * 14, e.vz = i.dz * 14, e.ignore[i.slot] = 1, i.holding = null;
  }
  i.dashT = -1, i.off = 0, Rr("elim", i.slot);
}
function Mx(i, e) {
  i.active = !1, i.held = null;
  let t = Ue[e];
  if (!cr && !Ar && t.alive && (t.hp = Math.max(0, t.hp - 1), i.lastHit === Nt && e !== Nt && (Bn++, El(i.x, 1.8, i.z, "+1 GOAL! (+1,000)", "#ffb800"))), Rr("goal", e, t.hp, i.x, i.z, i.id), !cr && t.hp <= 0 && t.alive && bx(t), !cr && !Ar) {
    let r = 0,
      n = -1;
    for (let s of Ue) s.alive && (r++, n = s.slot);
    if (r <= 1) {
      Ar = !0, Hr = 0.01, tr = n;
      return;
    }
  }
  Ar || Hn();
}
function Sx(i, e) {
  let t = 4 * e,
    r = ((i + e) % t + t) % t;
  return r < 2 * e ? r - e : 3 * e - r;
}
function qd(i, e) {
  let t = ni[i.slot],
    r = -t.z,
    n = t.x,
    s = i.ai;
  if (s.think -= e, s.think <= 0) if (s.think = st(0.2, 0.36) + (1 - s.skill) * 0.22, i.holding) {
    if (s.tgt < 0 || !Ue[s.tgt].alive) {
      let a = [];
      for (let l of Ue) l.alive && l.slot !== i.slot && (a.push(l.slot), l.slot !== Nt && a.push(l.slot));
      s.tgt = a.length ? a[Math.floor(Math.random() * a.length)] : -1, s.aimOff = st(-xt * 0.85, xt * 0.85), s.moveT = Ui(i.t + st(-1.5, 1.5), -Fr, Fr);
    }
    if (s.tgt >= 0) {
      let a = ni[s.tgt],
        l = -a.x * Ee + -a.z * s.aimOff,
        c = -a.z * Ee + a.x * s.aimOff,
        h = l - i.x,
        d = c - i.z,
        u = (Math.random() - 0.5) * 0.5 * (1.2 - s.skill);
      s.aim = Ui(Math.atan2(h * r + d * n, h * t.x + d * t.z) + u, -0.7, 0.7);
    }
  } else {
    let a = null,
      l = 9,
      c = 0;
    for (let h = 0; h < gt.length; h++) {
      let d = gt[h];
      if (!d.active || d.held) continue;
      let u = -(t.x * d.x + t.z * d.z),
        p = r * d.x + n * d.z,
        g = -(t.x * d.vx + t.z * d.vz),
        f = r * d.vx + n * d.vz;
      if (g > 0.5) {
        let m = (Rd - 0.9 - u) / g;
        m > -0.15 && m < l && (l = m, a = d, c = Sx(p + f * Math.max(m, 0) * (0.9 + st(-0.15, 0.15)), Ee - mt));
      }
    }
    if (a) {
      if (s.lastThreat !== a.id || Math.random() < 0.1) {
        s.lastThreat = a.id;
        let d = (1.4 - s.skill) * 3.2;
        s.err = (Math.random() + Math.random() - 1) * d, Math.random() < 0.22 && (s.err += (Math.random() < 0.5 ? -1 : 1) * st(2.2, 4.4));
      }
      let h = c + s.err;
      l > 1.4 && (h = Cd(h, 0, 0.45)), s.moveT = Ui(h, -Fr, Fr), ul(i) && Math.random() < 0.32 + s.skill * 0.35 && i.action++;
    } else {
      let h = null,
        d = 1e9;
      for (let u of gt) {
        if (!u.active || u.held) continue;
        let p = (u.x - i.x) ** 2 + (u.z - i.z) ** 2;
        p < d && (d = p, h = u);
      }
      s.moveT = h ? Ui((r * h.x + n * h.z) * 0.45, -Fr * 0.75, Fr * 0.75) : Math.sin(ar * 0.5 + i.slot) * 2, ul(i) && Math.random() < 0.4 && i.action++;
    }
  }
  i.holding && (i.aimTarget = s.aim, !s.threw && i.holdT > s.throwAt && (s.threw = !0, i.action++));
  let o = s.moveT - i.t;
  i.input = Math.abs(o) < 0.28 ? 0 : Ui(o * 1.2, -0.88, 0.88), i.holding || (i.aimTarget = i.input * 0.3);
}
function Xd() {
  return (mr.KeyD || mr.ArrowRight ? 1 : 0) - (mr.KeyA || mr.ArrowLeft ? 1 : 0);
}
function Yd(i, e) {
  if (!i.alive) return;
  let t = i.input * Pd;
  if (i.vt += (t - i.vt) * Math.min(1, e * 22), i.t += i.vt * e, i.t > Fr ? (i.t = Fr, i.vt = 0) : i.t < -Fr && (i.t = -Fr, i.vt = 0), i.cpu || (i.aimTarget = i.holding ? i.input * 0.6 : i.input * 0.3), i.aim += (i.aimTarget - i.aim) * Math.min(1, e * 10), i.dashT >= 0) {
    i.dashT += e;
    let r = Math.min(1, i.dashT / Ld);
    i.off = Math.sin(xe * r) * j1, r >= 1 && (i.dashT = -1, i.off = 0);
  }
  i.px = i.x, i.pz = i.z, ks(i), i.vx = (i.x - i.px) / e, i.vz = (i.z - i.pz) / e;
}
function Zd(i, e) {
  Yd(i, e), i.alive && (i.dashCD -= e, i.actionSeen < i.action && (i.actionSeen = i.action, yx(i)), i.holding && (i.holdT += e, i.holdT >= q1 && jd(i)));
}
var ic = (2 * Ee - $t) / ji - mt;
function Ma(i) {
  for (let e = 0; e < gt.length; e++) {
    let t = gt[e];
    if (!t.active || t.held) continue;
    for (let s = 0; s < 4; s++) t.ignore[s] -= i;
    t.x += t.vx * i, t.z += t.vz * i, t.vy -= 28 * i, t.y += t.vy * i, t.y < mt && (t.y = mt, t.vy = t.vy < -2 ? -t.vy * 0.45 : 0);
    let r = Math.hypot(t.vx, t.vz);
    if (r < 0.01) {
      let s = Math.random() * We;
      t.vx = Math.cos(s) * ns, t.vz = Math.sin(s) * ns, r = ns;
    }
    let n = r;
    r > fu ? n = fu : r > pu ? n = r + (pu - r) * i * 0.3 : r < ns && (n = r + (ns - r) * Math.min(1, i * 3)), n !== r && (t.vx *= n / r, t.vz *= n / r), Math.abs(t.vx) < 1.5 && (t.vx = t.vx >= 0 ? 1.5 : -1.5), Math.abs(t.vz) < 1.5 && (t.vz = t.vz >= 0 ? 1.5 : -1.5);
    for (let s = 0; s < 4 && t.active; s++) {
      let o = ni[s],
        a = -o.z,
        l = o.x,
        c = -(o.x * t.x + o.z * t.z);
      if (c <= Ee - mt) continue;
      let h = a * t.x + l * t.z,
        d = -(o.x * t.vx + o.z * t.vz),
        u = a * t.vx + l * t.vz;
      if (vu(s) && Math.abs(h) < xt) {
        if (c > Ee && (h > xt - mt ? (h = xt - mt, u = -Math.abs(u)) : h < -xt + mt && (h = -xt + mt, u = Math.abs(u))), c > Ee + 0.75) {
          t.x = -o.x * c + a * h, t.z = -o.z * c + l * h, Mx(t, s);
          break;
        }
      } else c = Ee - mt, d > 0 && (d = -d, d < -6 && Rr("wall", t.x, t.z));
      t.x = -o.x * c + a * h, t.z = -o.z * c + l * h, t.vx = -o.x * d + a * u, t.vz = -o.z * d + l * u;
    }
    if (t.active) {
      for (let s = 0; s < 4; s++) {
        let o = s & 1 ? 1 : -1,
          a = s & 2 ? 1 : -1,
          l = (o * t.x + a * t.z) / ji;
        if (l > ic) {
          let c = o / ji,
            h = a / ji;
          t.x -= c * (l - ic), t.z -= h * (l - ic);
          let d = t.vx * c + t.vz * h;
          d > 0 && (t.vx -= 2 * d * c, t.vz -= 2 * d * h);
        }
      }
      for (let s = 0; s < 4; s++) {
        if (!vu(s)) continue;
        let o = ni[s],
          a = -o.z,
          l = o.x;
        for (let c = -1; c <= 1; c += 2) {
          let h = -o.x * Ee + a * c * xt,
            d = -o.z * Ee + l * c * xt,
            u = t.x - h,
            p = t.z - d,
            g = u * u + p * p,
            f = mt + 0.2;
          if (g < f * f) {
            let m = Math.sqrt(g) || 0.001,
              v = u / m,
              y = p / m;
            t.x = h + v * f, t.z = d + y * f;
            let x = t.vx * v + t.vz * y;
            x < 0 && (t.vx -= 2 * x * v, t.vz -= 2 * x * y);
          }
        }
      }
      for (let s = 0; s < 4; s++) {
        let o = Ue[s];
        if (!o.alive || t.ignore[s] > 0) continue;
        let a = t.x - o.x,
          l = t.z - o.z,
          c = a * a + l * l,
          h = H1 + mt;
        if (c >= h * h) continue;
        let d = Math.sqrt(c) || 0.001,
          u = a / d,
          p = l / d;
        t.x = o.x + u * h, t.z = o.z + p * h;
        let g = t.vx - o.vx,
          f = t.vz - o.vz,
          m = g * u + f * p;
        m < 0 && (t.vx -= 2 * m * u, t.vz -= 2 * m * p);
        let v = o.dashT >= 0 && o.dashT < Ld * 0.65,
          y = ni[s];
        if (v) {
          let x = o.dx * 0.7 + u * 0.3,
            b = o.dz * 0.7 + p * 0.3,
            w = Math.hypot(x, b);
          t.vx = x / w * 32, t.vz = b / w * 32, t.vy = 6, t.squash = 0.6, Rr("hit", t.x, t.z, 1, s);
        } else {
          t.vx += o.vx * 0.45, t.vz += o.vz * 0.45;
          let x = t.vx * y.x + t.vz * y.z;
          x < 6 && (t.vx += y.x * (6 - x), t.vz += y.z * (6 - x));
          let b = Math.hypot(t.vx, t.vz);
          b < 15 && (t.vx *= 15 / b, t.vz *= 15 / b), t.vy = 3, t.squash = 0.35, Rr("hit", t.x, t.z, 0, s);
        }
        t.ignore[s] = 0.14, t.lastHit = s;
      }
      if (!(Math.abs(t.x) < Ee + 2.5 && Math.abs(t.z) < Ee + 2.5) || t.x !== t.x || t.z !== t.z) {
        t.active = !1, Hn();
        continue;
      }
      if (t.chkT += i, t.chkT > 1.6) {
        if (Math.hypot(t.x - t.cx, t.z - t.cz) < 0.9) {
          let s = Math.hypot(t.x, t.z) || 1;
          t.vx = -t.x / s * 16 + st(-2, 2), t.vz = -t.z / s * 16 + st(-2, 2);
        }
        t.chkT = 0, t.cx = t.x, t.cz = t.z;
      }
    }
  }
  for (let e = 0; e < gt.length; e++) {
    let t = gt[e];
    if (!(!t.active || t.held)) for (let r = e + 1; r < gt.length; r++) {
      let n = gt[r];
      if (!n.active || n.held) continue;
      let s = n.x - t.x,
        o = n.z - t.z,
        a = s * s + o * o;
      if (a >= 4 * mt * mt) continue;
      let l = Math.sqrt(a) || 0.001,
        c = s / l,
        h = o / l,
        d = (2 * mt - l) / 2;
      t.x -= c * d, t.z -= h * d, n.x += c * d, n.z += h * d;
      let u = (n.vx - t.vx) * c + (n.vz - t.vz) * h;
      u < 0 && (t.vx += u * c, t.vz += u * h, n.vx -= u * c, n.vz -= u * h, t.squash = n.squash = 0.25);
    }
  }
}
function wx(i) {
  for (let r of Ue) r.alive && (r.human ? r.input = Xd() : r.remote ? r.input = r.netInput : qd(r, i));
  for (let r of Ue) Zd(r, i);
  Hd(i), Ar || (jr -= i, jr <= 0 && (jr += ao, Tl() + Ci < (cr ? 2 : Dd) && Hn()));
  let e = Math.max(1, Math.ceil(i / 0.008)),
    t = i / e;
  for (let r = 0; r < e; r++) Ma(t);
  for (let r of Ue) {
    let n = r.holding;
    n && (n.x = r.x + r.dx * 1.22, n.z = r.z + r.dz * 1.22, n.y = 0.5, n.vx = r.vx, n.vz = r.vz, n.vy = 0);
  }
  Ar && Hr > 0 && (Hr -= i, Hr <= 0 && Rr("win", tr));
}
function Rr(i, ...e) {
  Jd(i, e), cr || void 0;
}
function Jd(i, e) {
  switch (i) {
    case "hit":
      {
        let t = e[2],
          r = Ue[e[3]],
          n = et[r.char].color;
        Jt(e[0], 0.5, e[1], t ? 26 : 12, n, t ? 9 : 6, t ? 0.14 : 0.1, 0.7), Jt(e[0], 0.5, e[1], t ? 10 : 5, "#fff4dc", t ? 8 : 5, 0.08, 0.5), ba(e[0], e[1], t ? "#ffd23f" : "#ffffff", t ? 5 : 3), Kd(e[0], e[1], t ? 7 : 3), Br = Math.max(Br, t ? 0.45 : 0.14), zt(t ? "strong" : "hit");
        break;
      }
    case "goal":
      _x(e[0], e[1], e[2], e[3]);
      break;
    case "elim":
      Tx(e[0]);
      break;
    case "cap":
      {
        let t = Ue[e[0]];
        Jt(t.x + t.dx, 0.6, t.z + t.dz, 8, et[t.char].color, 4, 0.08, 0.4), zt("capture");
        break;
      }
    case "throw":
      {
        let t = Ue[e[0]];
        Jt(t.x + t.dx * 1.2, 0.6, t.z + t.dz * 1.2, 10, "#fff4dc", 6, 0.09, 0.4), ba(t.x + t.dx, t.z + t.dz, "#ffffff", 2, 0.3), zt("throw");
        break;
      }
    case "dash":
      {
        let t = Ue[e[0]];
        Jt(t.x - t.dx * 0.8, 0.2, t.z - t.dz * 0.8, 10, Fn[hr].ground, 4, 0.1, 0.5), zt("dash");
        break;
      }
    case "charge":
      zt("charge");
      break;
    case "launch":
      {
        let t = li[e[0]];
        t.recoil = 1, Jt(t.mx, 1.3, t.mz, 16, "#ffe8b0", 6, 0.12, 0.6), ba(t.mx, t.mz, "#ffd23f", 3), zt("launch");
        break;
      }
    case "wall":
      zt("wall"), Jt(e[0], 0.4, e[1], 4, "#fff4dc", 3, 0.07, 0.35);
      break;
    case "win":
      op(e[0]);
      break;
  }
}
function Kd(i, e, t) {
  Un.position.set(i, 1.5, e), Un.intensity = t;
}
function _x(i, e, t, r) {
  let n = Ue[i],
    s = Lr[i],
    o = et[n.char].color;
  n.hp = e, Jt(t, 0.6, r, 34, o, 10, 0.14, 0.9), Jt(t, 0.6, r, 16, "#ffffff", 8, 0.1, 0.6), ba(t, r, o, 6, 0.55), Kd(t, r, 8), s.flash = 1, n.hurt = 1, Br = Math.max(Br, 0.5), zt("goal"), cr || (Vn(i, e, o, !n.alive && e <= 0), lo(i, !0), El(t, 1.5, r, "-1 HP", o));
}
function Tx(i) {
  let e = Ue[i],
    t = Lr[i];
  e.alive = !1, e.elimT = 0, t.wallT = 0, t.wall.visible = !0, Jt(e.x, 1, e.z, 40, "#6a5a50", 8, 0.16, 1.2), Jt(e.x, 1, e.z, 20, et[e.char].color, 9, 0.12, 1), Br = 0.7, zt("elim"), Vn(i, 0, "#777", !0), lo(i, !0), El(e.x, 2.2, e.z, "ELIMINATED!", "#ff5a4a");
}
var tt = null,
  Bi,
  ti,
  xs,
  dl,
  xu = 0;
function pl() {
  if (tt) {
    tt.state === "suspended" && tt.resume();
    return;
  }
  try {
    tt = new (window.AudioContext || window.webkitAudioContext)();
  } catch {
    return;
  }
  let i = tt.createDynamicsCompressor();
  i.connect(tt.destination), Bi = tt.createGain(), Bi.gain.value = 0.85, Bi.connect(i), ti = tt.createGain(), ti.gain.value = 0.16, ti.connect(Bi), xs = tt.createGain(), xs.gain.value = 0.55, xs.connect(Bi), dl = tt.createBuffer(1, tt.sampleRate, tt.sampleRate);
  let e = dl.getChannelData(0);
  for (let t = 0; t < e.length; t++) e[t] = Math.random() * 2 - 1;
  co(Re === "play" ? hr : "menu");
}
function lt(i, e, t, r, n, s = 0, o) {
  if (!tt) return;
  let a = tt.currentTime + s,
    l = tt.createOscillator(),
    c = tt.createGain();
  l.type = i, l.frequency.setValueAtTime(e, a), t && l.frequency.exponentialRampToValueAtTime(t, a + r), c.gain.setValueAtTime(1e-4, a), c.gain.exponentialRampToValueAtTime(n, a + 0.008), c.gain.exponentialRampToValueAtTime(1e-4, a + r), l.connect(c), c.connect(o || xs), l.start(a), l.stop(a + r + 0.05);
}
function $r(i, e, t, r = 1, n = "bandpass", s = 0, o = 0, a) {
  if (!tt) return;
  let l = tt.currentTime + s,
    c = tt.createBufferSource();
  c.buffer = dl;
  let h = tt.createBiquadFilter();
  h.type = n, h.frequency.setValueAtTime(t, l), o && h.frequency.exponentialRampToValueAtTime(o, l + i), h.Q.value = r;
  let d = tt.createGain();
  d.gain.setValueAtTime(e, l), d.gain.exponentialRampToValueAtTime(1e-4, l + i), c.connect(h), h.connect(d), d.connect(a || xs), c.start(l, Math.random() * 0.5), c.stop(l + i + 0.05);
}
var yu = {
  hit() {
    lt("square", 420, 160, 0.09, 0.25), $r(0.06, 0.4, 1800, 1.5);
  },
  strong() {
    lt("sawtooth", 220, 55, 0.3, 0.4), lt("square", 660, 180, 0.15, 0.25), $r(0.25, 0.7, 900, 0.8, "lowpass", 0, 200);
  },
  capture() {
    lt("sine", 420, 980, 0.1, 0.35), lt("triangle", 880, 1320, 0.08, 0.2, 0.05);
  },
  throw() {
    $r(0.22, 0.5, 500, 2, "bandpass", 0, 3500), lt("sawtooth", 180, 620, 0.16, 0.18);
  },
  dash() {
    $r(0.3, 0.55, 300, 1.5, "bandpass", 0, 2500), lt("square", 120, 240, 0.18, 0.12);
  },
  charge() {
    lt("sine", 200, 700, 0.85, 0.12);
  },
  launch() {
    lt("sine", 160, 40, 0.25, 0.6), $r(0.3, 0.6, 1200, 0.7, "lowpass", 0, 300), lt("square", 300, 900, 0.12, 0.15, 0.02);
  },
  wall() {
    let i = tt.currentTime;
    i - xu < 0.07 || (xu = i, lt("triangle", 260, 180, 0.06, 0.15));
  },
  goal() {
    [784, 622, 523, 392].forEach((i, e) => lt("sawtooth", i, i * 0.98, 0.14, 0.22, e * 0.07)), $r(0.4, 0.6, 700, 0.6, "lowpass", 0, 150), lt("sine", 110, 40, 0.4, 0.5);
  },
  elim() {
    lt("sawtooth", 440, 60, 1, 0.35), $r(0.8, 0.7, 600, 0.5, "lowpass", 0, 80), [330, 262, 196, 131].forEach((i, e) => lt("square", i, i, 0.18, 0.15, 0.15 + e * 0.15));
  },
  victory() {
    [523, 659, 784, 1047, 784, 1047, 1319].forEach((i, e) => {
      lt("square", i, i, 0.2, 0.18, e * 0.12), lt("triangle", i / 2, i / 2, 0.22, 0.18, e * 0.12);
    });
  },
  beep() {
    lt("square", 660, 660, 0.12, 0.2);
  },
  go() {
    lt("square", 990, 990, 0.35, 0.25), lt("sawtooth", 495, 495, 0.35, 0.15);
  },
  click() {
    lt("triangle", 700, 1100, 0.07, 0.2);
  }
};
function zt(i, e) {
  !tt || cr && !e || yu[i] && yu[i]();
}
var Ex = {
    menu: {
      bpm: 112,
      root: 57,
      scale: [0, 2, 4, 7, 9],
      lead: "triangle",
      bass: "triangle",
      seed: 3,
      den: 0.45
    },
    garden: {
      bpm: 128,
      root: 60,
      scale: [0, 2, 4, 7, 9],
      lead: "square",
      bass: "triangle",
      seed: 7,
      den: 0.55
    },
    desert: {
      bpm: 104,
      root: 52,
      scale: [0, 1, 4, 5, 7, 8, 10],
      lead: "sawtooth",
      bass: "triangle",
      seed: 11,
      den: 0.45
    },
    snow: {
      bpm: 118,
      root: 64,
      scale: [0, 2, 4, 5, 7, 9, 11],
      lead: "sine",
      bass: "triangle",
      seed: 5,
      den: 0.6
    },
    factory: {
      bpm: 140,
      root: 55,
      scale: [0, 3, 5, 7, 10],
      lead: "square",
      bass: "square",
      seed: 13,
      den: 0.6
    },
    volcano: {
      bpm: 152,
      root: 45,
      scale: [0, 2, 3, 5, 7, 8, 10],
      lead: "sawtooth",
      bass: "sawtooth",
      seed: 17,
      den: 0.55
    }
  },
  St = {
    st: null,
    step: 0,
    next: 0,
    timer: null,
    mel: null,
    name: ""
  };
function co(i) {
  if (!tt || St.name === i) return;
  St.name = i;
  let e = Ex[i];
  St.st = e;
  let t = Os(e.seed),
    r = [0, 5, 3, 4];
  St.mel = [];
  for (let n = 0; n < 64; n++) {
    let s = r[n >> 4];
    St.mel.push(t() < e.den ? s + [0, 2, 4, 7][Math.floor(t() * 4)] : -99);
  }
  St.prog = r, St.timer || (St.timer = setInterval(Ax, 25)), St.next = tt.currentTime + 0.08, St.step = 0;
}
var nc = i => 440 * Math.pow(2, (i - 69) / 12);
function sc(i, e) {
  let t = i.scale.length;
  return i.root + i.scale[(e % t + t) % t] + 12 * Math.floor(e / t);
}
function Ax() {
  if (!tt || !St.st) return;
  let i = St.st,
    e = 60 / i.bpm / 4;
  for (; St.next < tt.currentTime + 0.12;) {
    let t = St.next,
      r = St.step,
      n = r & 15,
      s = t - tt.currentTime;
    {
      if (n % 4 === 0 && lt("sine", 150, 40, 0.18, 0.55, s, ti), (n === 4 || n === 12) && $r(0.12, 0.35, 1800, 0.8, "bandpass", s, 0, ti), n % 2 === 0 && $r(0.04, n % 4 === 2 ? 0.18 : 0.08, 8e3, 1, "highpass", s, 0, ti), n % 4 === 0 || n % 4 === 3) {
        let a = sc(i, St.prog[r >> 4]) - 12;
        lt(i.bass, nc(a), 0, e * 1.6, 0.22, s, ti);
      }
      let o = St.mel[r];
      o > -50 && lt(i.lead, nc(sc(i, o) + 12), 0, e * 1.4, i.lead === "sawtooth" ? 0.08 : 0.11, s, ti), St.name === "snow" && n % 8 === 0 && o > -50 && lt("sine", nc(sc(i, o + 7) + 24), 0, 0.4, 0.05, s, ti);
    }
    St.next += e, St.step = (r + 1) % 64;
  }
}
var Ka = [];
for (let i = 0; i < 8; i++) {
  let e = document.createElement("div");
  e.className = "ft", ce("floats").appendChild(e), Ka.push({
    el: e,
    t: 1,
    x: 0,
    y: 0,
    z: 0
  });
}
var ac = 0,
  oc = new C();
function El(i, e, t, r, n) {
  let s = Ka[ac];
  ac = (ac + 1) % Ka.length, s.el.textContent = r, s.el.style.color = n, s.x = i, s.y = e, s.z = t, s.t = 0, s.el.style.display = "block";
}
function Cx(i) {
  for (let e of Ka) {
    if (e.t >= 1) continue;
    if (e.t += i / 1.3, e.t >= 1) {
      e.el.style.display = "none";
      continue;
    }
    oc.set(e.x, e.y + e.t * 2, e.z).project(pr);
    let t = (oc.x * 0.5 + 0.5) * innerWidth,
      r = (-oc.y * 0.5 + 0.5) * innerHeight,
      n = e.t < 0.15 ? e.t / 0.15 * 1.2 : 1.2 - (e.t - 0.15) * 0.3;
    e.el.style.transform = `translate(${t}px,${r}px) translate(-50%,-50%) scale(${n})`, e.el.style.opacity = e.t > 0.75 ? (1 - e.t) * 4 : 1;
  }
}
var zs = [],
  Qd = [];
function $d() {
  let i = ce("cards");
  i.innerHTML = "", Ue.forEach((e, t) => {
    let r = et[e.char],
      n = document.createElement("div");
    n.className = "pcard" + (e.human ? " me" : ""), n.style.setProperty("--c", r.color), n.style.setProperty("--d", r.dark), n.innerHTML = `<div class="pimg"><img src="${zs[e.char]}"></div><div class="pinfo"><div class="pname"></div><div class="prow"><span class="pnum">P${t + 1} ${Y1[t]}</span><span class="php"><small>HP</small><b>15</b></span></div><div class="pbar"><i></i></div></div><div class="pstamp">ELIMINATED</div>`, n.querySelector(".pname").textContent = e.name, i.appendChild(n), e.card = {
      el: n,
      hp: n.querySelector(".php b"),
      bar: n.querySelector(".pbar i")
    }, lo(t, !1);
  });
}
function lo(i, e) {
  let t = Ue[i];
  t.card && (t.card.hp.textContent = t.hp, t.card.bar.style.width = t.hp / Nn * 100 + "%", t.card.bar.style.setProperty("--bw", Nn / Math.max(1, t.hp) * 100 + "%"), t.card.bar.classList.toggle("low", t.hp <= 4), t.card.el.classList.toggle("dead", !t.alive), e && t.card.el.animate && t.card.el.animate([{
    transform: "translateX(0) scale(1)"
  }, {
    transform: "translateX(10px) scale(1.06)",
    filter: "brightness(1.6)"
  }, {
    transform: "translateX(-6px) scale(1)"
  }, {
    transform: "translateX(0)"
  }], {
    duration: 380
  }));
}
var ep = 0;
function tp() {
  clearTimeout(ep), ce("over").classList.remove("reveal");
  for (let i of gt) i.active = !1, i.held = null, i.gr.visible = !1, i.sh.visible = !1;
  for (let i of li) i.charge = -1, i.queue = 0, i.recoil = 0, i.preview.visible = !1;
  for (let i of Lr) i.wall.visible = !1, i.wallT = -1, i.flash = 0;
  Ci = 0, Ar = !1, Hr = 0, tr = -1, jr = ao, ll = -1, hl = -1;
}
function Qa() {
  cr = !0, tp(), Nt = 0;
  for (let i = 0; i < 4; i++) Vd(Ue[i], i, i, et[i].name, "cpu");
  for (let i = 0; i < 4; i++) Lr[i].mat.color.set(et[i].color), Lr[i].matD.color.set(et[i].dark), Vn(i, Nn, et[i].color, !1);
  Hn();
}
function $a(i, e, t) {
  Is = !1, cr = !1, tp(), Nt = t, Wn(i), Bn = 0;
  for (let r = 0; r < 4; r++) {
    let n = e[r],
      s = r === t ? "local" : n.human ? (null, "remote") : "cpu";
    Vd(Ue[r], r, n.char, n.name, s), Lr[r].mat.color.set(et[n.char].color), Lr[r].matD.color.set(et[n.char].dark), Vn(r, Nn, et[n.char].color, !1);
  }
  $d(), gr(null), ce("hud").classList.add("on"), ce("scorePill").style.display = "block", ce("scorePill").textContent = "SCORE 0", Re = "countdown", fr = 3.2, gi = !1, co(i);
}
function rp() {
  Re = "play", Hn();
}
var bu = new Ti(),
  Mu = new C();
function Rx(i) {
  for (let e of Ue) {
    let t = e.model;
    if (!t) continue;
    t.root.position.set(e.x, 0, e.z), t.root.rotation.y = Math.atan2(e.dx, e.dz);
    let r = Math.min(1, Math.hypot(e.vx || 0, e.vz || 0) / Pd);
    for (let n of t.wheels) n.rotation.x += (Math.abs(e.vt || 0) + (e.dashT >= 0 ? 20 : 0)) * i / 0.3;
    if (t.update(ar + e.slot * 1.7, r, e), e.hurt > 0) {
      e.hurt = Math.max(0, e.hurt - i * 2.2);
      let n = Math.sin(e.hurt * 30) * e.hurt * 0.12;
      t.root.scale.set(1 + n, 1 - n, 1 + n);
    } else e.alive && t.root.scale.setScalar(1);
    e.dashT >= 0 ? (t.root.rotation.x = 0, t.ch.rotation.x = -0.25) : t.ch.rotation.x *= 0.85, !e.alive && !cr ? (e.elimT += i, t.root.rotation.z = Cd(t.root.rotation.z, 0.35, i * 3), t.root.position.y = -0.12, t.ch.rotation.y += i * 4, e.smokeT -= i, e.smokeT <= 0 && (e.smokeT = 0.18, Jt(e.x + st(-0.3, 0.3), 1.2, e.z + st(-0.3, 0.3), 1, "#5a5250", 0.8, 0.16, 1.4, 1, -1.5, 0.3))) : t.root.rotation.z = 0, e.alive && e.slot >= 0 && (ar * 10 | 0) % 3 === 0 && Math.random() < 0.05 && Jt(e.x - e.dx * 0.95, 0.9, e.z - e.dz * 0.95, 1, "#e8e2da", 0.6, 0.09, 0.9, 1, -1, 0.3);
  }
  for (let e of gt) {
    if (!e.active) {
      e.gr.visible && (e.gr.visible = !1, e.sh.visible = !1);
      continue;
    }
    e.gr.visible = !0, e.sh.visible = !0, e.gr.position.set(e.x, e.y, e.z), e.squash = Math.max(0, e.squash - i * 3);
    let t = Math.sin(e.squash * 12) * e.squash * 0.6;
    e.gr.scale.set(1 + t * 0.5, 1 - t, 1 + t * 0.5);
    let r = Math.hypot(e.vx, e.vz);
    r > 0.1 && (Mu.set(e.vz / r, 0, -e.vx / r), bu.setFromAxisAngle(Mu, r * i / mt), e.mesh.quaternion.premultiply(bu)), e.sh.position.set(e.x, 0.03, e.z);
    let n = 1.3 / (1 + (e.y - mt) * 0.6);
    e.sh.scale.set(n, 1, n);
  }
  for (let e of li) {
    let t = e.charge >= 0 ? e.charge / 0.9 : 0;
    e.preview.visible = e.charge >= 0, e.preview.visible && e.preview.scale.setScalar(0.3 + t * 0.7), e.recoil = Math.max(0, e.recoil - i * 3), e.barrel.position.z = -e.recoil * 0.35, e.barrel.scale.set(1 + t * 0.15 * Math.sin(ar * 30), 1 + t * 0.15 * Math.sin(ar * 30), 1 - t * 0.12), e.bmat.emissive.setRGB(t * 0.9, t * 0.5, 0), e.piv.rotation.x = -0.5 - t * 0.1;
  }
  for (let e = 0; e < 4; e++) {
    let t = Lr[e];
    if (t.flash > 0 && (t.flash = Math.max(0, t.flash - i * 2.5), t.mat.emissive.setRGB(t.flash, t.flash * 0.85, t.flash * 0.5)), t.wallT >= 0 && t.wallT < 1) {
      t.wallT = Math.min(1, t.wallT + i * 2.2);
      let r = t.wallT,
        n = 1 + Math.sin(r * xe * 2.5) * (1 - r) * 0.5;
      t.wall.scale.set(1, Math.max(0.01, r * n), 1);
    }
    t.spr.position.y = 2.55 + Math.sin(ar * 2 + e) * 0.06;
  }
  Un.intensity = Math.max(0, Un.intensity - i * 30);
}
var Su = new C(0, 30, 40),
  wu = new C(),
  as = new C(),
  os = new C(),
  cc = 0,
  ua = 0;
function Px() {
  return ce("cards").offsetWidth + 28;
}
function Lx(i) {
  let e = innerWidth,
    t = innerHeight,
    r = 0;
  if (Re === "play" || Re === "countdown") {
    r = Px();
    let s = Math.max(0.5, (e - r) / t),
      o = Math.tan(pr.fov * xe / 360),
      a = Math.max(10.1 / o, 12.7 / (o * s)),
      l = 0.97,
      c = X1[Nt];
    as.set(Math.sin(c) * Math.cos(l) * a, Math.sin(l) * a, Math.cos(c) * Math.cos(l) * a), os.set(Math.sin(c) * 0.7, 0, Math.cos(c) * 0.7), as.add(os);
  } else if (Re === "over" && tr >= 0) {
    let s = Ue[tr],
      o = Math.atan2(s.dx, s.dz) + Math.sin(ar * 0.4) * 0.5;
    as.set(s.x + Math.sin(o) * 6.5, 4.2, s.z + Math.cos(o) * 6.5), os.set(s.x, innerWidth <= 850 && ce("over").classList.contains("reveal") ? -0.2 : 1.1, s.z);
  } else {
    cc += i * 0.07;
    let s = e / t,
      o = s < 1 ? 36 / s * 0.75 : 30;
    as.set(Math.sin(cc) * o, Re === "maps" ? 20 : 15, Math.cos(cc) * o), os.set(0, Re === "menu" ? -2.5 : -1, 0);
  }
  ua += (r - ua) * Math.min(1, i * 5);
  let n = 1 - Math.exp(-i * (Re === "over" ? 2.5 : 3.5));
  if (Su.lerp(as, n), wu.lerp(os, n), pr.position.copy(Su), Br > 0) {
    Br = Math.max(0, Br - i * 2.2);
    let s = Br * Br * 0.9;
    pr.position.x += st(-s, s), pr.position.y += st(-s, s), pr.position.z += st(-s, s);
  }
  pr.lookAt(wu), pr.aspect = e / t, ua > 1 ? pr.setViewOffset(e, t, -ua / 2, 0, e, t) : pr.clearViewOffset(), pr.updateProjectionMatrix();
}
var Gt = new Ss(),
  Ni = new Ot(36, 1, 0.1, 200),
  ip = [];
(function () {
  let [i, e] = Pr(16, 256),
    t = e.createLinearGradient(0, 0, 0, 256);
  t.addColorStop(0, "#faebd0"), t.addColorStop(1, "#d4ad77"), e.fillStyle = t, e.fillRect(0, 0, 16, 256);
  let r = new lr(i);
  r.encoding = Ke, Gt.background = r, Gt.fog = new ka("#e8c697", 16, 45), Gt.add(new Ls("#fff8e8", "#8a5a2a", 1));
  let n = new Ai("#fff2dc", 2.3);
  n.position.set(4, 8, 6), n.castShadow = !0, n.shadow.mapSize.set(1024, 1024), Object.assign(n.shadow.camera, {
    left: -5,
    right: 5,
    top: 5,
    bottom: -5,
    near: 1,
    far: 30
  }), n.shadow.bias = -4e-4, n.shadow.normalBias = 0.02, Gt.add(n);
  let s = new Ai("#ffffff", 1.1);
  s.position.set(-5, 4, -6), Gt.add(s), Gt.userData.rim = s, I(new Ts(40, 48).rotateX(-xe / 2), we("#e6caa0", {
    r: 0.6
  }), 0, 0, 0, Gt, !1);
  for (let c = 0; c < 6; c++) I(qe(1.75 - c * 0.05, 1.8 - c * 0.05, 0.1, 40, 0), we(xa[c], {
    r: 0.46
  }), 0, 0.05 + c * 0.09, 0, Gt, c === 5);
  let o = Ge(Gt, 0, 0, 0);
  Gt.userData.ped = o;
  let a = new pt(wl, Sl);
  a.scale.set(2.6, 1, 2.6), a.position.y = 0.56, Gt.add(a);
  let l = Os(5);
  for (let c = 0; c < 9; c++) {
    let h = xe * 0.75 + c / 8 * xe * 1.5 + xe * 0.25,
      d = Math.cos(h) * (6 + l() * 3),
      u = Math.sin(h) * (5 + l() * 3) - 3;
    if (u > 1) continue;
    let p = Ge(Gt, d, 0, u),
      g = 0.8 + l() * 0.8;
    p.scale.setScalar(g), I(qe(0.16, 0.22, 0.6, 14, 0), we("#fffdf2", {
      r: 0.45
    }), 0, 0.3, 0, p);
    let f = I(Ns(0.55), we(["#e01c1c", "#8c22e6", "#156ee8", "#ff5a00"][c % 4], {
      r: 0.45
    }), 0, 0.55, 0, p);
    f.scale.y = 0.7;
    for (let m = 0; m < 4; m++) I(Ce(0.08, 0, 10, 8), rt.white, Math.sin(m * 1.6) * 0.32, 0.78, Math.cos(m * 1.6) * 0.32, p, !1);
  }
  for (let c = 0; c < 5; c++) I(new Qi(mt, 24, 16), gt[c].mesh.material, -3.5 + c * 1.8, mt, -2.5 - l() * 2, Gt);
  for (let c = 0; c < 4; c++) {
    let h = Id(c);
    h.root.position.y = 0.56, h.root.visible = !1, o.add(h.root), ip.push(h);
  }
})();
var ds = 0;
function Dx(i) {
  let e = Gt.userData.ped;
  e.rotation.y = Math.sin(ar * 0.5) * 0.6 + 0.35, ds = Math.min(1, ds + i * 3.5);
  let t = 1 + Math.sin(ds * xe * 2) * (1 - ds) * 0.25;
  ip.forEach((c, h) => {
    if (c.root.visible = h === Lt, h === Lt) {
      c.root.scale.setScalar(1.15 * t), c.update(ar, 0.3, null);
      for (let d of c.wheels) d.rotation.x += i * 2;
    }
  });
  let r = innerWidth,
    n = innerHeight,
    s = r / n;
  Ni.aspect = s;
  let o = Math.sin(ar * 0.3) * 0.2,
    a = 6;
  s < 1.1 && (a = 6 * 1.1 / s), Ni.position.set(Math.sin(o) * a, 2.6, Math.cos(o) * a), Ni.lookAt(0, 1.3, 0);
  let l = r > 820 ? 340 : 0;
  l ? Ni.setViewOffset(r, n, -l / 2, n * 0.05, r, n) : Ni.setViewOffset(r, n, 0, n * 0.12, r, n), Ni.updateProjectionMatrix(), Gt.userData.rim.color.set(et[Lt].color);
}
function zx() {
  let i = new no({
    antialias: !0,
    alpha: !0,
    preserveDrawingBuffer: !0
  });
  i.setPixelRatio(1), i.setSize(240, 240), i.outputEncoding = Ke, i.toneMapping = gl, i.toneMappingExposure = 1.15;
  let e = new Ss();
  e.add(new Ls("#ffffff", "#705030", 1.1));
  let t = new Ai("#fff", 2.5);
  t.position.set(3, 5, 6), e.add(t);
  let r = new Ai("#ffc0e0", 0.9);
  r.position.set(-4, 2, -3), e.add(r);
  let n = new Ot(30, 1, 0.1, 50),
    s = [];
  for (let o = 0; o < 4; o++) {
    let a = zd[o]();
    a.root.rotation.y = -0.35, e.add(a.root), a.update(0, 0, null), n.position.set(0.9, et[o].py + 0.45, 3.1), n.lookAt(0, et[o].py - 0.05, 0), i.render(e, n), s.push(i.domElement.toDataURL("image/png")), n.position.set(1.2, 2.4, 4.8), n.lookAt(0, 1.05, 0), i.render(e, n), Qd.push(i.domElement.toDataURL("image/png")), e.remove(a.root);
  }
  i.dispose();
  try {
    i.forceContextLoss();
  } catch {}
  return s;
}
var kx = ["menu", "select", "maps", "pause", "over"];
function gr(i) {
  kx.forEach(e => ce(e).classList.toggle("on", e === i));
}
function Sa() {
  Re = "menu", ce("hud").classList.remove("on"), ce("scorePill").style.display = "none", ce("count").style.display = "none", gr("menu"), Qa(), Wn(hr), tt && co("menu");
}
function lc(i) {
  Wd = i, Re = "select", gr("select"), Cl();
}
function Ux() {
  Re = "maps", gr("maps"), sp();
}
function fl() {
  Si = ce("nameIn").value.toUpperCase().replace(/[^A-Z0-9 _-]/g, "").trim().slice(0, 12) || "PLAYER 1";
}
function Cl() {
  fl();
  let i = et[Lt];
  ce("selPName").textContent = Si, ce("selCName").textContent = i.name, ce("selVeh").textContent = "RIDES THE " + i.vehicle, ce("selDesc").textContent = i.desc, ce("selPanel").style.setProperty("--cc", i.color), ce("selStats").innerHTML = i.stats.map((e, t) => `<div class="stat"><span>${ix[t]}</span><div><i style="width:${e * 20}%"></i></div></div>`).join(""), [...ce("selRow").children].forEach((e, t) => e.classList.toggle("sel", t === Lt));
}
function ps(i) {
  i !== Lt && (Lt = (i + 4) % 4, ds = 0, zt("click", 1)), Cl();
}
function sp() {
  [...ce("mapGrid").children].forEach((i, e) => i.classList.toggle("sel", $i[e].id === hr));
}
function Fx() {
  let i = "BALL B\u25CFNK",
    e = [["#e62015", "#850c05"], ["#126ee8", "#0a3e8c"], ["#f5a800", "#9e6500"], ["#18b82e", "#0c6e19"], null, ["#126ee8", "#0a3e8c"], null, ["#18b82e", "#0c6e19"], ["#8020e6", "#490d8a"]],
    t = ce("title");
  [...i].forEach((s, o) => {
    let a = document.createElement("span");
    s === " " ? (a.className = "gap", a.innerHTML = "&nbsp;") : s === "\u25CF" ? (a.className = "ballO", a.innerHTML = "&nbsp;") : (a.textContent = s, a.style.setProperty("--c", e[o][0]), a.style.setProperty("--d", e[o][1])), a.style.animationDelay = o * 0.12 + "s", t.appendChild(a);
  });
  let r = ce("selRow");
  et.forEach((s, o) => {
    let a = document.createElement("div");
    a.className = "ccard", a.style.setProperty("--c", s.color), a.style.setProperty("--d", s.dark), a.innerHTML = `<img src="${zs[o]}"><div>${s.name}</div>`, a.onclick = () => ps(o), r.appendChild(a);
  });
  let n = ce("mapGrid");
  $i.forEach(s => {
    let o = document.createElement("div");
    o.className = "mcard", o.style.setProperty("--r", s.r + "deg"), o.innerHTML = `<div class="mart" style="background:${s.art}">${s.icons.map((a, l) => `<span style="left:${8 + l * 24}%;top:${l % 2 ? 52 : 18}%">${a}</span>`).join("")}</div><div class="mn">${s.name}</div>`, o.onclick = () => {
      Wn(s.id), zt("click", 1), sp();
    }, n.appendChild(o);
  });
}
function Bx() {
  let i = (e, t) => ce(e).addEventListener("click", () => {
    pl(), zt("click", 1), t();
  });
  i("bSingle", () => lc("single")), i("selBack", () => {
    Re = "menu", gr("menu");
  }), i("selGo", () => {
    fl(), Wd === "single" ? Ux() : (Re = "mp", gr("mp"));
  }), i("selPrev", () => ps(Lt - 1)), i("selNext", () => ps(Lt + 1)), ce("nameIn").addEventListener("input", Cl), i("mapBack", () => lc("single")), i("mapGo", () => {
    fl();
    let e = [0, 1, 2, 3].filter(r => r !== Lt),
      t = [{
        name: Si,
        char: Lt,
        human: !0
      }];
    e.forEach(r => t.push({
      name: et[r].name,
      char: r,
      human: !1
    })), $a(hr, t, 0);
  }), i("pResume", () => {
    gi = !1, gr(null);
  }), i("pQuit", Sa), i("oMenu", Sa), i("oAgain", () => {
    {
      let e = Ue.map(t => ({
        name: t.name,
        char: t.char,
        human: t.human
      }));
      $a(hr, e, 0);
    }
  }), addEventListener("keydown", e => {
    if (document.activeElement && document.activeElement.tagName === "INPUT") {
      e.code === "Enter" && document.activeElement.blur();
      return;
    }
    mr[e.code] = !0, ["Space", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.code) && e.preventDefault(), e.code === "Space" && !e.repeat && Re === "play" && !gi && lp(), e.code === "Escape" && Re === "play" && !null && (gi = !gi, gr(gi ? "pause" : null)), Re === "select" && ((e.code === "ArrowLeft" || e.code === "KeyA") && ps(Lt - 1), (e.code === "ArrowRight" || e.code === "KeyD") && ps(Lt + 1));
  }), addEventListener("keyup", e => {
    mr[e.code] = !1;
  }), addEventListener("blur", () => {
    for (let e in mr) mr[e] = !1;
  }), addEventListener("pointerdown", pl, {
    once: !0
  }), addEventListener("resize", ap);
}
function ap() {
  yr.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1)), yr.setSize(innerWidth, innerHeight, !1);
}
function op(i) {
  if (Re === "over" || i < 0 || i > 3) return;
  Re = "over", tr = i;
  let e = Ue[i],
    t = et[e.char];
  ce("over").classList.remove("reveal");
  let r = ce("overPanel");
  r.style.setProperty("--c", t.color), r.style.setProperty("--d", t.dark), ce("winImg").src = Qd[e.char], ce("winName").textContent = e.name;
  let n = tr === Nt;
  ce("winSub").textContent = (n ? "YOU WIN! " : "") + "LAST PLAYER STANDING!", ce("oAgain").textContent = "PLAY AGAIN";
  let s = ce("spScoreBox");
  if (s) {
    s.style.display = "block";
    let o = Ue[Nt],
      a = Math.max(0, o ? o.hp : 0),
      l = Bn * 1e3,
      c = a * 200,
      h = n ? 5e3 : 0,
      d = l + c + h;
    ce("scGoals").textContent = Bn, ce("scGoalsPts").textContent = "+" + l.toLocaleString() + " PTS", ce("scHP").textContent = a + " / " + Nn, ce("scHPPts").textContent = "+" + c.toLocaleString() + " PTS", ce("scWinPts").textContent = n ? "+5,000 PTS" : "+0 PTS", ce("scTotal").textContent = d.toLocaleString() + " PTS";
  }
  ep = setTimeout(() => {
    Re !== "over" || tr !== i || (gr("over"), requestAnimationFrame(() => {
      Re === "over" && tr === i && ce("over").classList.add("reveal");
    }));
  }, 2600), zt("victory");
  for (let o = 0; o < 5; o++) setTimeout(() => Jt(e.x, 1.5, e.z, 24, ["#e01c1c", "#156ee8", "#f5a800", "#1cb329", "#8020e6"][o], 9, 0.12, 1.2, 1.6), o * 220);
}
function lp() {
  if (!(Re !== "play" || gi)) {
    let i = Ue[Nt];
    i && i.alive && i.action++;
  }
}
var eo = new Set();
function Tu() {
  let i = (eo.has("R") ? 1 : 0) - (eo.has("L") ? 1 : 0);
  mr.KeyA = mr.ArrowLeft = i < 0, mr.KeyD = mr.ArrowRight = i > 0;
}
function Ll(i, e, t) {
  let r = ce(i);
  if (!r) return;
  let n = o => {
      o.preventDefault();
      try {
        r.setPointerCapture(o.pointerId);
      } catch {}
      r.classList.add("down"), eo.add(e), Tu(), t && t();
    },
    s = () => {
      eo.delete(e), r.classList.remove("down"), Tu();
    };
  r.addEventListener("pointerdown", n), r.addEventListener("pointerup", s), r.addEventListener("pointercancel", s), r.addEventListener("pointerleave", s), r.addEventListener("lostpointercapture", s), r.addEventListener("contextmenu", o => o.preventDefault());
}
Ll("tLeft", "L");
Ll("tRight", "R");
Ll("tAction", "A", lp);
function Dl(i) {
  document.body.classList.toggle("touch", !!i);
}
var jx = () => {
  try {
    return !!(window.matchMedia && window.matchMedia("(pointer:coarse)").matches);
  } catch {
    return !1;
  }
};
Dl("ontouchstart" in window || (navigator.maxTouchPoints || 0) > 0 || jx());
addEventListener("pointerdown", i => {
  i.pointerType === "touch" && Dl(!0);
}, {
  passive: !0
});
addEventListener("keydown", i => {
  i.code && (i.code.indexOf("Key") === 0 || i.code === "Space" || i.code.indexOf("Arrow") === 0) && Dl(!1);
});
var Is = !1;
function Yx(i) {
  Rx(i);
}
var Eu = performance.now(),
  hc = 0;
function hp(i) {
  requestAnimationFrame(hp);
  let e = Math.min((i - Eu) / 1e3, 0.05);
  if (Eu = i, ar += e, Re === "select") {
    Dx(e), yr.render(Gt, Ni);
    return;
  }
  if (Re === "countdown" && !false) {
    let r = Math.ceil(fr);
    fr -= e;
    let n = Math.ceil(fr),
      s = ce("count");
    s.style.display = "block", n !== r && n > 0 && (s.textContent = n, zt("beep"), s.animate && s.animate([{
      transform: "scale(1.6)",
      opacity: 0
    }, {
      transform: "scale(1)",
      opacity: 1
    }], {
      duration: 250
    })), fr <= 0 && !(null === "client") && (s.textContent = "BONK!", zt("go"), s.animate && s.animate([{
      transform: "scale(.6)"
    }, {
      transform: "scale(1.25)"
    }, {
      transform: "scale(1)",
      opacity: 0
    }], {
      duration: 900,
      fill: "forwards"
    }), setTimeout(() => {
      Re !== "countdown" && (s.style.display = "none");
    }, 900), rp());
  }
  if (Re === "play" && !gi || (Re === "menu" || Re === "maps" || Re === "mp") && cr || Re === "over") wx(e);else if (Re === "countdown") for (let r of Ue) ks(r), r.vx = r.vz = 0;
  null === "host", Yx(e), mx(e), gx(e);
  let t = mi[hr];
  if (t) for (let r of t.anims) r(ar, e);
  if (Fn[hr].floor.lava && (Fi.emissiveIntensity = 0.8 + Math.sin(ar * 2) * 0.25), Lx(e), Cx(e), Re === "play") {
    let r = Math.max(0, Math.ceil(jr));
    r !== ll && (ll = r, ce("nextPill").textContent = "NEXT BALL " + r);
    let n = Tl();
    {
      let s = Ue[Nt],
        o = Bn * 1e3 + Math.max(0, s ? s.hp : 0) * 200;
      ce("scorePill").textContent = "SCORE " + o.toLocaleString();
    }
  }
  yr.render(wt, pr);
}
zs = zx();
Fx();
Bx();
ap();
Wn("garden");
Qa();
for (let i of $i) mi[i.id] || (mi[i.id] = Gd(i.id));
Wn("garden");
document.fonts && document.fonts.ready && document.fonts.ready.then(() => {
  for (let i = 0; i < 4; i++) {
    let e = Ue[i];
    Vn(i, e.hp, et[e.char].color, !e.alive);
  }
});
requestAnimationFrame(hp);