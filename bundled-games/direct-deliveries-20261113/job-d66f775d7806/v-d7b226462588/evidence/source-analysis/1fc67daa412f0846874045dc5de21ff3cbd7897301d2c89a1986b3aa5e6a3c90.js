var $jscomp = $jscomp || {};
$jscomp.scope = {};
$jscomp.arrayIteratorImpl = function (k) {
  var n = 0;
  return function () {
    if (n < k.length) {
      return {
        done: false,
        value: k[n++]
      };
    } else {
      return {
        done: true
      };
    }
  };
};
$jscomp.arrayIterator = function (k) {
  return {
    next: $jscomp.arrayIteratorImpl(k)
  };
};
$jscomp.makeIterator = function (k) {
  var n = typeof Symbol != "undefined" && Symbol.iterator && k[Symbol.iterator];
  if (n) {
    return n.call(k);
  } else {
    return $jscomp.arrayIterator(k);
  }
};
$jscomp.ASSUME_ES5 = false;
$jscomp.ASSUME_NO_NATIVE_MAP = false;
$jscomp.ASSUME_NO_NATIVE_SET = false;
$jscomp.SIMPLE_FROUND_POLYFILL = false;
$jscomp.ISOLATE_POLYFILLS = false;
$jscomp.FORCE_POLYFILL_PROMISE = false;
$jscomp.FORCE_POLYFILL_PROMISE_WHEN_NO_UNHANDLED_REJECTION = false;
$jscomp.getGlobal = function (k) {
  k = [typeof globalThis == "object" && globalThis, k, typeof window == "object" && window, typeof self == "object" && self, typeof global == "object" && global];
  for (var n = 0; n < k.length; ++n) {
    var l = k[n];
    if (l && l.Math == Math) {
      return l;
    }
  }
  throw Error("Cannot find global object");
};
$jscomp.global = $jscomp.getGlobal(this);
$jscomp.defineProperty = $jscomp.ASSUME_ES5 || typeof Object.defineProperties == "function" ? Object.defineProperty : function (k, n, l) {
  if (k == Array.prototype || k == Object.prototype) {
    return k;
  }
  k[n] = l.value;
  return k;
};
$jscomp.IS_SYMBOL_NATIVE = typeof Symbol === "function" && typeof Symbol("x") === "symbol";
$jscomp.TRUST_ES6_POLYFILLS = !$jscomp.ISOLATE_POLYFILLS || $jscomp.IS_SYMBOL_NATIVE;
$jscomp.polyfills = {};
$jscomp.propertyToPolyfillSymbol = {};
$jscomp.POLYFILL_PREFIX = "$jscp$";
function $jscomp$lookupPolyfilledValue(k, n) {
  var l = $jscomp.propertyToPolyfillSymbol[n];
  if (l == null) {
    return k[n];
  }
  l = k[l];
  if (l !== undefined) {
    return l;
  } else {
    return k[n];
  }
}
$jscomp.polyfill = function (k, n, l, p) {
  if (n) {
    if ($jscomp.ISOLATE_POLYFILLS) {
      $jscomp.polyfillIsolated(k, n, l, p);
    } else {
      $jscomp.polyfillUnisolated(k, n, l, p);
    }
  }
};
$jscomp.polyfillUnisolated = function (k, n, l, p) {
  l = $jscomp.global;
  k = k.split(".");
  for (p = 0; p < k.length - 1; p++) {
    var h = k[p];
    if (!(h in l)) {
      return;
    }
    l = l[h];
  }
  k = k[k.length - 1];
  p = l[k];
  n = n(p);
  if (n != p && n != null) {
    $jscomp.defineProperty(l, k, {
      configurable: true,
      writable: true,
      value: n
    });
  }
};
$jscomp.polyfillIsolated = function (k, n, l, p) {
  var h = k.split(".");
  k = h.length === 1;
  p = h[0];
  p = !k && p in $jscomp.polyfills ? $jscomp.polyfills : $jscomp.global;
  for (var A = 0; A < h.length - 1; A++) {
    var f = h[A];
    if (!(f in p)) {
      return;
    }
    p = p[f];
  }
  h = h[h.length - 1];
  l = $jscomp.IS_SYMBOL_NATIVE && l === "es6" ? p[h] : null;
  n = n(l);
  if (n != null) {
    if (k) {
      $jscomp.defineProperty($jscomp.polyfills, h, {
        configurable: true,
        writable: true,
        value: n
      });
    } else if (n !== l) {
      if ($jscomp.propertyToPolyfillSymbol[h] === undefined) {
        l = Math.random() * 1000000000 >>> 0;
        $jscomp.propertyToPolyfillSymbol[h] = $jscomp.IS_SYMBOL_NATIVE ? $jscomp.global.Symbol(h) : $jscomp.POLYFILL_PREFIX + l + "$" + h;
      }
      $jscomp.defineProperty(p, $jscomp.propertyToPolyfillSymbol[h], {
        configurable: true,
        writable: true,
        value: n
      });
    }
  }
};
$jscomp.polyfill("Promise", function (k) {
  function n() {
    this.batch_ = null;
  }
  function l(f) {
    if (f instanceof h) {
      return f;
    } else {
      return new h(function (q, v) {
        q(f);
      });
    }
  }
  if (k && (!$jscomp.FORCE_POLYFILL_PROMISE && (!$jscomp.FORCE_POLYFILL_PROMISE_WHEN_NO_UNHANDLED_REJECTION || typeof $jscomp.global.PromiseRejectionEvent !== "undefined") || !$jscomp.global.Promise || $jscomp.global.Promise.toString().indexOf("[native code]") === -1)) {
    return k;
  }
  n.prototype.asyncExecute = function (f) {
    if (this.batch_ == null) {
      this.batch_ = [];
      var q = this;
      this.asyncExecuteFunction(function () {
        q.executeBatch_();
      });
    }
    this.batch_.push(f);
  };
  var p = $jscomp.global.setTimeout;
  n.prototype.asyncExecuteFunction = function (f) {
    p(f, 0);
  };
  n.prototype.executeBatch_ = function () {
    while (this.batch_ && this.batch_.length) {
      var f = this.batch_;
      this.batch_ = [];
      for (var q = 0; q < f.length; ++q) {
        var v = f[q];
        f[q] = null;
        try {
          v();
        } catch (z) {
          this.asyncThrow_(z);
        }
      }
    }
    this.batch_ = null;
  };
  n.prototype.asyncThrow_ = function (f) {
    this.asyncExecuteFunction(function () {
      throw f;
    });
  };
  function h(f) {
    this.state_ = 0;
    this.result_ = undefined;
    this.onSettledCallbacks_ = [];
    this.isRejectionHandled_ = false;
    var q = this.createResolveAndReject_();
    try {
      f(q.resolve, q.reject);
    } catch (v) {
      q.reject(v);
    }
  }
  h.prototype.createResolveAndReject_ = function () {
    function f(z) {
      return function (O) {
        if (!v) {
          v = true;
          z.call(q, O);
        }
      };
    }
    var q = this;
    var v = false;
    return {
      resolve: f(this.resolveTo_),
      reject: f(this.reject_)
    };
  };
  h.prototype.resolveTo_ = function (f) {
    if (f === this) {
      this.reject_(new TypeError("A Promise cannot resolve to itself"));
    } else if (f instanceof h) {
      this.settleSameAsPromise_(f);
    } else {
      a: switch (typeof f) {
        case "object":
          var q = f != null;
          break a;
        case "function":
          q = true;
          break a;
        default:
          q = false;
      }
      if (q) {
        this.resolveToNonPromiseObj_(f);
      } else {
        this.fulfill_(f);
      }
    }
  };
  h.prototype.resolveToNonPromiseObj_ = function (f) {
    var q = undefined;
    try {
      q = f.then;
    } catch (v) {
      this.reject_(v);
      return;
    }
    if (typeof q == "function") {
      this.settleSameAsThenable_(q, f);
    } else {
      this.fulfill_(f);
    }
  };
  h.prototype.reject_ = function (f) {
    this.settle_(2, f);
  };
  h.prototype.fulfill_ = function (f) {
    this.settle_(1, f);
  };
  h.prototype.settle_ = function (f, q) {
    if (this.state_ != 0) {
      throw Error("Cannot settle(" + f + ", " + q + "): Promise already settled in state" + this.state_);
    }
    this.state_ = f;
    this.result_ = q;
    if (this.state_ === 2) {
      this.scheduleUnhandledRejectionCheck_();
    }
    this.executeOnSettledCallbacks_();
  };
  h.prototype.scheduleUnhandledRejectionCheck_ = function () {
    var f = this;
    p(function () {
      if (f.notifyUnhandledRejection_()) {
        var q = $jscomp.global.console;
        if (typeof q !== "undefined") {
          q.error(f.result_);
        }
      }
    }, 1);
  };
  h.prototype.notifyUnhandledRejection_ = function () {
    if (this.isRejectionHandled_) {
      return false;
    }
    var f = $jscomp.global.CustomEvent;
    var q = $jscomp.global.Event;
    var v = $jscomp.global.dispatchEvent;
    if (typeof v === "undefined") {
      return true;
    }
    if (typeof f === "function") {
      f = new f("unhandledrejection", {
        cancelable: true
      });
    } else if (typeof q === "function") {
      f = new q("unhandledrejection", {
        cancelable: true
      });
    } else {
      f = $jscomp.global.document.createEvent("CustomEvent");
      f.initCustomEvent("unhandledrejection", false, true, f);
    }
    f.promise = this;
    f.reason = this.result_;
    return v(f);
  };
  h.prototype.executeOnSettledCallbacks_ = function () {
    if (this.onSettledCallbacks_ != null) {
      for (var f = 0; f < this.onSettledCallbacks_.length; ++f) {
        A.asyncExecute(this.onSettledCallbacks_[f]);
      }
      this.onSettledCallbacks_ = null;
    }
  };
  var A = new n();
  h.prototype.settleSameAsPromise_ = function (f) {
    var q = this.createResolveAndReject_();
    f.callWhenSettled_(q.resolve, q.reject);
  };
  h.prototype.settleSameAsThenable_ = function (f, q) {
    var v = this.createResolveAndReject_();
    try {
      f.call(q, v.resolve, v.reject);
    } catch (z) {
      v.reject(z);
    }
  };
  h.prototype.then = function (f, q) {
    function v(t, x) {
      if (typeof t == "function") {
        return function (D) {
          try {
            z(t(D));
          } catch (R) {
            O(R);
          }
        };
      } else {
        return x;
      }
    }
    var z;
    var O;
    var ba = new h(function (t, x) {
      z = t;
      O = x;
    });
    this.callWhenSettled_(v(f, z), v(q, O));
    return ba;
  };
  h.prototype.catch = function (f) {
    return this.then(undefined, f);
  };
  h.prototype.callWhenSettled_ = function (f, q) {
    function v() {
      switch (z.state_) {
        case 1:
          f(z.result_);
          break;
        case 2:
          q(z.result_);
          break;
        default:
          throw Error("Unexpected state: " + z.state_);
      }
    }
    var z = this;
    if (this.onSettledCallbacks_ == null) {
      A.asyncExecute(v);
    } else {
      this.onSettledCallbacks_.push(v);
    }
    this.isRejectionHandled_ = true;
  };
  h.resolve = l;
  h.reject = function (f) {
    return new h(function (q, v) {
      v(f);
    });
  };
  h.race = function (f) {
    return new h(function (q, v) {
      for (var z = $jscomp.makeIterator(f), O = z.next(); !O.done; O = z.next()) {
        l(O.value).callWhenSettled_(q, v);
      }
    });
  };
  h.all = function (f) {
    var q = $jscomp.makeIterator(f);
    var v = q.next();
    if (v.done) {
      return l([]);
    } else {
      return new h(function (z, O) {
        function ba(D) {
          return function (R) {
            t[D] = R;
            x--;
            if (x == 0) {
              z(t);
            }
          };
        }
        var t = [];
        var x = 0;
        do {
          t.push(undefined);
          x++;
          l(v.value).callWhenSettled_(ba(t.length - 1), O);
          v = q.next();
        } while (!v.done);
      });
    }
  };
  return h;
}, "es6", "es3");
$jscomp.owns = function (k, n) {
  return Object.prototype.hasOwnProperty.call(k, n);
};
$jscomp.assign = $jscomp.TRUST_ES6_POLYFILLS && typeof Object.assign == "function" ? Object.assign : function (k, n) {
  for (var l = 1; l < arguments.length; l++) {
    var p = arguments[l];
    if (p) {
      for (var h in p) {
        if ($jscomp.owns(p, h)) {
          k[h] = p[h];
        }
      }
    }
  }
  return k;
};
$jscomp.polyfill("Object.assign", function (k) {
  return k || $jscomp.assign;
}, "es6", "es3");
$jscomp.checkStringArgs = function (k, n, l) {
  if (k == null) {
    throw new TypeError("The 'this' value for String.prototype." + l + " must not be null or undefined");
  }
  if (n instanceof RegExp) {
    throw new TypeError("First argument to String.prototype." + l + " must not be a regular expression");
  }
  return k + "";
};
$jscomp.polyfill("String.prototype.startsWith", function (k) {
  if (k) {
    return k;
  } else {
    return function (n, l) {
      var p = $jscomp.checkStringArgs(this, n, "startsWith");
      n += "";
      var h = p.length;
      var A = n.length;
      l = Math.max(0, Math.min(l | 0, p.length));
      for (var f = 0; f < A && l < h;) {
        if (p[l++] != n[f++]) {
          return false;
        }
      }
      return f >= A;
    };
  }
}, "es6", "es3");
$jscomp.polyfill("Array.prototype.copyWithin", function (k) {
  function n(l) {
    l = Number(l);
    if (l === Infinity || l === -Infinity) {
      return l;
    } else {
      return l | 0;
    }
  }
  if (k) {
    return k;
  } else {
    return function (l, p, h) {
      var A = this.length;
      l = n(l);
      p = n(p);
      h = h === undefined ? A : n(h);
      l = l < 0 ? Math.max(A + l, 0) : Math.min(l, A);
      p = p < 0 ? Math.max(A + p, 0) : Math.min(p, A);
      h = h < 0 ? Math.max(A + h, 0) : Math.min(h, A);
      if (l < p) {
        while (p < h) {
          if (p in this) {
            this[l++] = this[p++];
          } else {
            delete this[l++];
            p++;
          }
        }
      } else {
        h = Math.min(h, A + p - l);
        l += h - p;
        while (h > p) {
          if (--h in this) {
            this[--l] = this[h];
          } else {
            delete this[--l];
          }
        }
      }
      return this;
    };
  }
}, "es6", "es3");
$jscomp.typedArrayCopyWithin = function (k) {
  if (k) {
    return k;
  } else {
    return Array.prototype.copyWithin;
  }
};
$jscomp.polyfill("Int8Array.prototype.copyWithin", $jscomp.typedArrayCopyWithin, "es6", "es5");
$jscomp.polyfill("Uint8Array.prototype.copyWithin", $jscomp.typedArrayCopyWithin, "es6", "es5");
$jscomp.polyfill("Uint8ClampedArray.prototype.copyWithin", $jscomp.typedArrayCopyWithin, "es6", "es5");
$jscomp.polyfill("Int16Array.prototype.copyWithin", $jscomp.typedArrayCopyWithin, "es6", "es5");
$jscomp.polyfill("Uint16Array.prototype.copyWithin", $jscomp.typedArrayCopyWithin, "es6", "es5");
$jscomp.polyfill("Int32Array.prototype.copyWithin", $jscomp.typedArrayCopyWithin, "es6", "es5");
$jscomp.polyfill("Uint32Array.prototype.copyWithin", $jscomp.typedArrayCopyWithin, "es6", "es5");
$jscomp.polyfill("Float32Array.prototype.copyWithin", $jscomp.typedArrayCopyWithin, "es6", "es5");
$jscomp.polyfill("Float64Array.prototype.copyWithin", $jscomp.typedArrayCopyWithin, "es6", "es5");
var DracoDecoderModule = function () {
  var k = typeof document !== "undefined" && document.currentScript ? document.currentScript.src : undefined;
  if (typeof __filename !== "undefined") {
    k = k || __filename;
  }
  return function (n) {
    function l(e) {
      if (a.locateFile) {
        return a.locateFile(e, U);
      } else {
        return U + e;
      }
    }
    function p(e, b, c) {
      var d = b + c;
      for (c = b; e[c] && !(c >= d);) {
        ++c;
      }
      if (c - b > 16 && e.buffer && va) {
        return va.decode(e.subarray(b, c));
      }
      for (d = ""; b < c;) {
        var g = e[b++];
        if (g & 128) {
          var u = e[b++] & 63;
          if ((g & 224) == 192) {
            d += String.fromCharCode((g & 31) << 6 | u);
          } else {
            var X = e[b++] & 63;
            g = (g & 240) == 224 ? (g & 15) << 12 | u << 6 | X : (g & 7) << 18 | u << 12 | X << 6 | e[b++] & 63;
            if (g < 65536) {
              d += String.fromCharCode(g);
            } else {
              g -= 65536;
              d += String.fromCharCode(g >> 10 | 55296, g & 1023 | 56320);
            }
          }
        } else {
          d += String.fromCharCode(g);
        }
      }
      return d;
    }
    function h(e, b) {
      if (e) {
        return p(ea, e, b);
      } else {
        return "";
      }
    }
    function A() {
      var e = ja.buffer;
      a.HEAP8 = Y = new Int8Array(e);
      a.HEAP16 = new Int16Array(e);
      a.HEAP32 = ca = new Int32Array(e);
      a.HEAPU8 = ea = new Uint8Array(e);
      a.HEAPU16 = new Uint16Array(e);
      a.HEAPU32 = V = new Uint32Array(e);
      a.HEAPF32 = new Float32Array(e);
      a.HEAPF64 = new Float64Array(e);
    }
    function f(e) {
      if (a.onAbort) {
        a.onAbort(e);
      }
      e = "Aborted(" + e + ")";
      da(e);
      wa = true;
      e = new WebAssembly.RuntimeError(e + ". Build with -sASSERTIONS for more info.");
      ka(e);
      throw e;
    }
    function q(e) {
      try {
        if (e == P && fa) {
          return new Uint8Array(fa);
        }
        if (ma) {
          return ma(e);
        }
        throw "both async and sync fetching of the wasm failed";
      } catch (b) {
        f(b);
      }
    }
    function v() {
      if (!fa && (xa || ha)) {
        if (typeof fetch == "function" && !P.startsWith("file://")) {
          return fetch(P, {
            credentials: "same-origin"
          }).then(function (e) {
            if (!e.ok) {
              throw "failed to load wasm binary file at '" + P + "'";
            }
            return e.arrayBuffer();
          }).catch(function () {
            return q(P);
          });
        }
        if (na) {
          return new Promise(function (e, b) {
            na(P, function (c) {
              e(new Uint8Array(c));
            }, b);
          });
        }
      }
      return Promise.resolve().then(function () {
        return q(P);
      });
    }
    function z(e) {
      while (e.length > 0) {
        e.shift()(a);
      }
    }
    function O(e) {
      this.excPtr = e;
      this.ptr = e - 24;
      this.set_type = function (b) {
        V[this.ptr + 4 >> 2] = b;
      };
      this.get_type = function () {
        return V[this.ptr + 4 >> 2];
      };
      this.set_destructor = function (b) {
        V[this.ptr + 8 >> 2] = b;
      };
      this.get_destructor = function () {
        return V[this.ptr + 8 >> 2];
      };
      this.set_refcount = function (b) {
        ca[this.ptr >> 2] = b;
      };
      this.set_caught = function (b) {
        Y[this.ptr + 12 >> 0] = b ? 1 : 0;
      };
      this.get_caught = function () {
        return Y[this.ptr + 12 >> 0] != 0;
      };
      this.set_rethrown = function (b) {
        Y[this.ptr + 13 >> 0] = b ? 1 : 0;
      };
      this.get_rethrown = function () {
        return Y[this.ptr + 13 >> 0] != 0;
      };
      this.init = function (b, c) {
        this.set_adjusted_ptr(0);
        this.set_type(b);
        this.set_destructor(c);
        this.set_refcount(0);
        this.set_caught(false);
        this.set_rethrown(false);
      };
      this.add_ref = function () {
        ca[this.ptr >> 2] += 1;
      };
      this.release_ref = function () {
        var b = ca[this.ptr >> 2];
        ca[this.ptr >> 2] = b - 1;
        return b === 1;
      };
      this.set_adjusted_ptr = function (b) {
        V[this.ptr + 16 >> 2] = b;
      };
      this.get_adjusted_ptr = function () {
        return V[this.ptr + 16 >> 2];
      };
      this.get_exception_ptr = function () {
        if (ya(this.get_type())) {
          return V[this.excPtr >> 2];
        }
        var b = this.get_adjusted_ptr();
        if (b !== 0) {
          return b;
        } else {
          return this.excPtr;
        }
      };
    }
    function ba() {
      function e() {
        if (!la && (la = true, a.calledRun = true, !wa)) {
          za = true;
          z(oa);
          Aa(a);
          if (a.onRuntimeInitialized) {
            a.onRuntimeInitialized();
          }
          if (a.postRun) {
            for (typeof a.postRun == "function" && (a.postRun = [a.postRun]); a.postRun.length;) {
              Ba.unshift(a.postRun.shift());
            }
          }
          z(Ba);
        }
      }
      if (!(aa > 0)) {
        if (a.preRun) {
          for (typeof a.preRun == "function" && (a.preRun = [a.preRun]); a.preRun.length;) {
            Ca.unshift(a.preRun.shift());
          }
        }
        z(Ca);
        if (!(aa > 0)) {
          if (a.setStatus) {
            a.setStatus("Running...");
            setTimeout(function () {
              setTimeout(function () {
                a.setStatus("");
              }, 1);
              e();
            }, 1);
          } else {
            e();
          }
        }
      }
    }
    function t() {}
    function x(e) {
      return (e || t).__cache__;
    }
    function D(e, b) {
      var c = x(b);
      var d = c[e];
      if (d) {
        return d;
      }
      d = Object.create((b || t).prototype);
      d.ptr = e;
      return c[e] = d;
    }
    function R(e) {
      if (typeof e === "string") {
        var b = 0;
        for (var c = 0; c < e.length; ++c) {
          var d = e.charCodeAt(c);
          if (d <= 127) {
            b++;
          } else if (d <= 2047) {
            b += 2;
          } else if (d >= 55296 && d <= 57343) {
            b += 4;
            ++c;
          } else {
            b += 3;
          }
        }
        b = Array(b + 1);
        c = 0;
        d = b.length;
        if (d > 0) {
          d = c + d - 1;
          for (var g = 0; g < e.length; ++g) {
            var u = e.charCodeAt(g);
            if (u >= 55296 && u <= 57343) {
              var X = e.charCodeAt(++g);
              u = 65536 + ((u & 1023) << 10) | X & 1023;
            }
            if (u <= 127) {
              if (c >= d) {
                break;
              }
              b[c++] = u;
            } else {
              if (u <= 2047) {
                if (c + 1 >= d) {
                  break;
                }
                b[c++] = u >> 6 | 192;
              } else {
                if (u <= 65535) {
                  if (c + 2 >= d) {
                    break;
                  }
                  b[c++] = u >> 12 | 224;
                } else {
                  if (c + 3 >= d) {
                    break;
                  }
                  b[c++] = u >> 18 | 240;
                  b[c++] = u >> 12 & 63 | 128;
                }
                b[c++] = u >> 6 & 63 | 128;
              }
              b[c++] = u & 63 | 128;
            }
          }
          b[c] = 0;
        }
        e = r.alloc(b, Y);
        r.copy(b, Y, e);
        return e;
      }
      return e;
    }
    function pa(e) {
      if (typeof e === "object") {
        var b = r.alloc(e, Y);
        r.copy(e, Y, b);
        return b;
      }
      return e;
    }
    function Z() {
      throw "cannot construct a VoidPtr, no constructor in IDL";
    }
    function S() {
      this.ptr = Da();
      x(S)[this.ptr] = this;
    }
    function Q() {
      this.ptr = Ea();
      x(Q)[this.ptr] = this;
    }
    function W() {
      this.ptr = Fa();
      x(W)[this.ptr] = this;
    }
    function w() {
      this.ptr = Ga();
      x(w)[this.ptr] = this;
    }
    function C() {
      this.ptr = Ha();
      x(C)[this.ptr] = this;
    }
    function F() {
      this.ptr = Ia();
      x(F)[this.ptr] = this;
    }
    function G() {
      this.ptr = Ja();
      x(G)[this.ptr] = this;
    }
    function E() {
      this.ptr = Ka();
      x(E)[this.ptr] = this;
    }
    function T() {
      this.ptr = La();
      x(T)[this.ptr] = this;
    }
    function B() {
      throw "cannot construct a Status, no constructor in IDL";
    }
    function H() {
      this.ptr = Ma();
      x(H)[this.ptr] = this;
    }
    function I() {
      this.ptr = Na();
      x(I)[this.ptr] = this;
    }
    function J() {
      this.ptr = Oa();
      x(J)[this.ptr] = this;
    }
    function K() {
      this.ptr = Pa();
      x(K)[this.ptr] = this;
    }
    function L() {
      this.ptr = Qa();
      x(L)[this.ptr] = this;
    }
    function M() {
      this.ptr = Ra();
      x(M)[this.ptr] = this;
    }
    function N() {
      this.ptr = Sa();
      x(N)[this.ptr] = this;
    }
    function y() {
      this.ptr = Ta();
      x(y)[this.ptr] = this;
    }
    function m() {
      this.ptr = Ua();
      x(m)[this.ptr] = this;
    }
    n = n === undefined ? {} : n;
    var a = typeof n != "undefined" ? n : {};
    var Aa;
    var ka;
    a.ready = new Promise(function (e, b) {
      Aa = e;
      ka = b;
    });
    var Va = false;
    var Wa = false;
    a.onRuntimeInitialized = function () {
      Va = true;
      if (Wa && typeof a.onModuleLoaded === "function") {
        a.onModuleLoaded(a);
      }
    };
    a.onModuleParsed = function () {
      Wa = true;
      if (Va && typeof a.onModuleLoaded === "function") {
        a.onModuleLoaded(a);
      }
    };
    a.isVersionSupported = function (e) {
      if (typeof e !== "string") {
        return false;
      }
      e = e.split(".");
      if (e.length < 2 || e.length > 3) {
        return false;
      } else if (e[0] == 1 && e[1] >= 0 && e[1] <= 5) {
        return true;
      } else if (e[0] != 0 || e[1] > 10) {
        return false;
      } else {
        return true;
      }
    };
    var Xa = Object.assign({}, a);
    var xa = typeof window == "object";
    var ha = typeof importScripts == "function";
    var Ya = typeof process == "object" && typeof process.versions == "object" && typeof process.versions.node == "string";
    var U = "";
    if (Ya) {
      var Za = require("fs");
      var qa = require("path");
      U = ha ? qa.dirname(U) + "/" : __dirname + "/";
      function $a(e, b) {
        e = e.startsWith("file://") ? new URL(e) : qa.normalize(e);
        return Za.readFileSync(e, b ? undefined : "utf8");
      }
      function ma(e) {
        e = $a(e, true);
        if (!e.buffer) {
          e = new Uint8Array(e);
        }
        return e;
      }
      function na(e, b, c) {
        e = e.startsWith("file://") ? new URL(e) : qa.normalize(e);
        Za.readFile(e, function (d, g) {
          if (d) {
            c(d);
          } else {
            b(g.buffer);
          }
        });
      }
      if (process.argv.length > 1) {
        process.argv[1].replace(/\\/g, "/");
      }
      process.argv.slice(2);
      a.inspect = function () {
        return "[Emscripten Module object]";
      };
    } else if (xa || ha) {
      if (ha) {
        U = self.location.href;
      } else if (typeof document != "undefined" && document.currentScript) {
        U = document.currentScript.src;
      }
      if (k) {
        U = k;
      }
      U = U.indexOf("blob:") !== 0 ? U.substr(0, U.replace(/[?#].*/, "").lastIndexOf("/") + 1) : "";
      $a = function (e) {
        var b = new XMLHttpRequest();
        b.open("GET", e, false);
        b.send(null);
        return b.responseText;
      };
      if (ha) {
        ma = function (e) {
          var b = new XMLHttpRequest();
          b.open("GET", e, false);
          b.responseType = "arraybuffer";
          b.send(null);
          return new Uint8Array(b.response);
        };
      }
      na = function (e, b, c) {
        var d = new XMLHttpRequest();
        d.open("GET", e, true);
        d.responseType = "arraybuffer";
        d.onload = function () {
          if (d.status == 200 || d.status == 0 && d.response) {
            b(d.response);
          } else {
            c();
          }
        };
        d.onerror = c;
        d.send(null);
      };
    }
    var ud = a.print || console.log.bind(console);
    var da = a.printErr || console.warn.bind(console);
    Object.assign(a, Xa);
    Xa = null;
    var fa;
    if (a.wasmBinary) {
      fa = a.wasmBinary;
    }
    if (typeof WebAssembly != "object") {
      f("no native wasm support detected");
    }
    var ja;
    var wa = false;
    var va = typeof TextDecoder != "undefined" ? new TextDecoder("utf8") : undefined;
    var Y;
    var ea;
    var ca;
    var V;
    var Ca = [];
    var oa = [];
    var Ba = [];
    var za = false;
    var aa = 0;
    var ra = null;
    var ia = null;
    var P = "draco_decoder.wasm";
    if (!P.startsWith("data:application/octet-stream;base64,")) {
      P = l(P);
    }
    var vd = 0;
    var wd = [null, [], []];
    var xd = {
      b: function (e, b, c) {
        new O(e).init(b, c);
        vd++;
        throw e;
      },
      a: function () {
        f("");
      },
      g: function (e, b, c) {
        ea.copyWithin(e, b, b + c);
      },
      e: function (e) {
        var b = ea.length;
        e >>>= 0;
        if (e > 2147483648) {
          return false;
        }
        for (var c = 1; c <= 4; c *= 2) {
          var d = b * (1 + 0.2 / c);
          d = Math.min(d, e + 100663296);
          var g = Math;
          d = Math.max(e, d);
          g = g.min.call(g, 2147483648, d + (65536 - d % 65536) % 65536);
          a: {
            d = ja.buffer;
            try {
              ja.grow(g - d.byteLength + 65535 >>> 16);
              A();
              var u = 1;
              break a;
            } catch (X) {}
            u = undefined;
          }
          if (u) {
            return true;
          }
        }
        return false;
      },
      f: function (e) {
        return 52;
      },
      d: function (e, b, c, d, g) {
        return 70;
      },
      c: function (e, b, c, d) {
        var g = 0;
        for (var u = 0; u < c; u++) {
          var X = V[b >> 2];
          var ab = V[b + 4 >> 2];
          b += 8;
          for (var sa = 0; sa < ab; sa++) {
            var ta = ea[X + sa];
            var ua = wd[e];
            if (ta === 0 || ta === 10) {
              (e === 1 ? ud : da)(p(ua, 0));
              ua.length = 0;
            } else {
              ua.push(ta);
            }
          }
          g += ab;
        }
        V[d >> 2] = g;
        return 0;
      }
    };
    (function () {
      function e(g, u) {
        a.asm = g.exports;
        ja = a.asm.h;
        A();
        oa.unshift(a.asm.i);
        aa--;
        if (a.monitorRunDependencies) {
          a.monitorRunDependencies(aa);
        }
        if (aa == 0) {
          if (ra !== null) {
            clearInterval(ra);
            ra = null;
          }
          if (ia) {
            g = ia;
            ia = null;
            g();
          }
        }
      }
      function b(g) {
        e(g.instance);
      }
      function c(g) {
        return v().then(function (u) {
          return WebAssembly.instantiate(u, d);
        }).then(function (u) {
          return u;
        }).then(g, function (u) {
          da("failed to asynchronously prepare wasm: " + u);
          f(u);
        });
      }
      var d = {
        a: xd
      };
      aa++;
      if (a.monitorRunDependencies) {
        a.monitorRunDependencies(aa);
      }
      if (a.instantiateWasm) {
        try {
          return a.instantiateWasm(d, e);
        } catch (g) {
          da("Module.instantiateWasm callback failed with error: " + g);
          ka(g);
        }
      }
      (function () {
        if (fa || typeof WebAssembly.instantiateStreaming != "function" || P.startsWith("data:application/octet-stream;base64,") || P.startsWith("file://") || Ya || typeof fetch != "function") {
          return c(b);
        } else {
          return fetch(P, {
            credentials: "same-origin"
          }).then(function (g) {
            return WebAssembly.instantiateStreaming(g, d).then(b, function (u) {
              da("wasm streaming compile failed: " + u);
              da("falling back to ArrayBuffer instantiation");
              return c(b);
            });
          });
        }
      })().catch(ka);
      return {};
    })();
    var bb = a._emscripten_bind_VoidPtr___destroy___0 = function () {
      return (bb = a._emscripten_bind_VoidPtr___destroy___0 = a.asm.k).apply(null, arguments);
    };
    var Da = a._emscripten_bind_DecoderBuffer_DecoderBuffer_0 = function () {
      return (Da = a._emscripten_bind_DecoderBuffer_DecoderBuffer_0 = a.asm.l).apply(null, arguments);
    };
    var cb = a._emscripten_bind_DecoderBuffer_Init_2 = function () {
      return (cb = a._emscripten_bind_DecoderBuffer_Init_2 = a.asm.m).apply(null, arguments);
    };
    var db = a._emscripten_bind_DecoderBuffer___destroy___0 = function () {
      return (db = a._emscripten_bind_DecoderBuffer___destroy___0 = a.asm.n).apply(null, arguments);
    };
    var Ea = a._emscripten_bind_AttributeTransformData_AttributeTransformData_0 = function () {
      return (Ea = a._emscripten_bind_AttributeTransformData_AttributeTransformData_0 = a.asm.o).apply(null, arguments);
    };
    var eb = a._emscripten_bind_AttributeTransformData_transform_type_0 = function () {
      return (eb = a._emscripten_bind_AttributeTransformData_transform_type_0 = a.asm.p).apply(null, arguments);
    };
    var fb = a._emscripten_bind_AttributeTransformData___destroy___0 = function () {
      return (fb = a._emscripten_bind_AttributeTransformData___destroy___0 = a.asm.q).apply(null, arguments);
    };
    var Fa = a._emscripten_bind_GeometryAttribute_GeometryAttribute_0 = function () {
      return (Fa = a._emscripten_bind_GeometryAttribute_GeometryAttribute_0 = a.asm.r).apply(null, arguments);
    };
    var gb = a._emscripten_bind_GeometryAttribute___destroy___0 = function () {
      return (gb = a._emscripten_bind_GeometryAttribute___destroy___0 = a.asm.s).apply(null, arguments);
    };
    var Ga = a._emscripten_bind_PointAttribute_PointAttribute_0 = function () {
      return (Ga = a._emscripten_bind_PointAttribute_PointAttribute_0 = a.asm.t).apply(null, arguments);
    };
    var hb = a._emscripten_bind_PointAttribute_size_0 = function () {
      return (hb = a._emscripten_bind_PointAttribute_size_0 = a.asm.u).apply(null, arguments);
    };
    var ib = a._emscripten_bind_PointAttribute_GetAttributeTransformData_0 = function () {
      return (ib = a._emscripten_bind_PointAttribute_GetAttributeTransformData_0 = a.asm.v).apply(null, arguments);
    };
    var jb = a._emscripten_bind_PointAttribute_attribute_type_0 = function () {
      return (jb = a._emscripten_bind_PointAttribute_attribute_type_0 = a.asm.w).apply(null, arguments);
    };
    var kb = a._emscripten_bind_PointAttribute_data_type_0 = function () {
      return (kb = a._emscripten_bind_PointAttribute_data_type_0 = a.asm.x).apply(null, arguments);
    };
    var lb = a._emscripten_bind_PointAttribute_num_components_0 = function () {
      return (lb = a._emscripten_bind_PointAttribute_num_components_0 = a.asm.y).apply(null, arguments);
    };
    var mb = a._emscripten_bind_PointAttribute_normalized_0 = function () {
      return (mb = a._emscripten_bind_PointAttribute_normalized_0 = a.asm.z).apply(null, arguments);
    };
    var nb = a._emscripten_bind_PointAttribute_byte_stride_0 = function () {
      return (nb = a._emscripten_bind_PointAttribute_byte_stride_0 = a.asm.A).apply(null, arguments);
    };
    var ob = a._emscripten_bind_PointAttribute_byte_offset_0 = function () {
      return (ob = a._emscripten_bind_PointAttribute_byte_offset_0 = a.asm.B).apply(null, arguments);
    };
    var pb = a._emscripten_bind_PointAttribute_unique_id_0 = function () {
      return (pb = a._emscripten_bind_PointAttribute_unique_id_0 = a.asm.C).apply(null, arguments);
    };
    var qb = a._emscripten_bind_PointAttribute___destroy___0 = function () {
      return (qb = a._emscripten_bind_PointAttribute___destroy___0 = a.asm.D).apply(null, arguments);
    };
    var Ha = a._emscripten_bind_AttributeQuantizationTransform_AttributeQuantizationTransform_0 = function () {
      return (Ha = a._emscripten_bind_AttributeQuantizationTransform_AttributeQuantizationTransform_0 = a.asm.E).apply(null, arguments);
    };
    var rb = a._emscripten_bind_AttributeQuantizationTransform_InitFromAttribute_1 = function () {
      return (rb = a._emscripten_bind_AttributeQuantizationTransform_InitFromAttribute_1 = a.asm.F).apply(null, arguments);
    };
    var sb = a._emscripten_bind_AttributeQuantizationTransform_quantization_bits_0 = function () {
      return (sb = a._emscripten_bind_AttributeQuantizationTransform_quantization_bits_0 = a.asm.G).apply(null, arguments);
    };
    var tb = a._emscripten_bind_AttributeQuantizationTransform_min_value_1 = function () {
      return (tb = a._emscripten_bind_AttributeQuantizationTransform_min_value_1 = a.asm.H).apply(null, arguments);
    };
    var ub = a._emscripten_bind_AttributeQuantizationTransform_range_0 = function () {
      return (ub = a._emscripten_bind_AttributeQuantizationTransform_range_0 = a.asm.I).apply(null, arguments);
    };
    var vb = a._emscripten_bind_AttributeQuantizationTransform___destroy___0 = function () {
      return (vb = a._emscripten_bind_AttributeQuantizationTransform___destroy___0 = a.asm.J).apply(null, arguments);
    };
    var Ia = a._emscripten_bind_AttributeOctahedronTransform_AttributeOctahedronTransform_0 = function () {
      return (Ia = a._emscripten_bind_AttributeOctahedronTransform_AttributeOctahedronTransform_0 = a.asm.K).apply(null, arguments);
    };
    var wb = a._emscripten_bind_AttributeOctahedronTransform_InitFromAttribute_1 = function () {
      return (wb = a._emscripten_bind_AttributeOctahedronTransform_InitFromAttribute_1 = a.asm.L).apply(null, arguments);
    };
    var xb = a._emscripten_bind_AttributeOctahedronTransform_quantization_bits_0 = function () {
      return (xb = a._emscripten_bind_AttributeOctahedronTransform_quantization_bits_0 = a.asm.M).apply(null, arguments);
    };
    var yb = a._emscripten_bind_AttributeOctahedronTransform___destroy___0 = function () {
      return (yb = a._emscripten_bind_AttributeOctahedronTransform___destroy___0 = a.asm.N).apply(null, arguments);
    };
    var Ja = a._emscripten_bind_PointCloud_PointCloud_0 = function () {
      return (Ja = a._emscripten_bind_PointCloud_PointCloud_0 = a.asm.O).apply(null, arguments);
    };
    var zb = a._emscripten_bind_PointCloud_num_attributes_0 = function () {
      return (zb = a._emscripten_bind_PointCloud_num_attributes_0 = a.asm.P).apply(null, arguments);
    };
    var Ab = a._emscripten_bind_PointCloud_num_points_0 = function () {
      return (Ab = a._emscripten_bind_PointCloud_num_points_0 = a.asm.Q).apply(null, arguments);
    };
    var Bb = a._emscripten_bind_PointCloud___destroy___0 = function () {
      return (Bb = a._emscripten_bind_PointCloud___destroy___0 = a.asm.R).apply(null, arguments);
    };
    var Ka = a._emscripten_bind_Mesh_Mesh_0 = function () {
      return (Ka = a._emscripten_bind_Mesh_Mesh_0 = a.asm.S).apply(null, arguments);
    };
    var Cb = a._emscripten_bind_Mesh_num_faces_0 = function () {
      return (Cb = a._emscripten_bind_Mesh_num_faces_0 = a.asm.T).apply(null, arguments);
    };
    var Db = a._emscripten_bind_Mesh_num_attributes_0 = function () {
      return (Db = a._emscripten_bind_Mesh_num_attributes_0 = a.asm.U).apply(null, arguments);
    };
    var Eb = a._emscripten_bind_Mesh_num_points_0 = function () {
      return (Eb = a._emscripten_bind_Mesh_num_points_0 = a.asm.V).apply(null, arguments);
    };
    var Fb = a._emscripten_bind_Mesh___destroy___0 = function () {
      return (Fb = a._emscripten_bind_Mesh___destroy___0 = a.asm.W).apply(null, arguments);
    };
    var La = a._emscripten_bind_Metadata_Metadata_0 = function () {
      return (La = a._emscripten_bind_Metadata_Metadata_0 = a.asm.X).apply(null, arguments);
    };
    var Gb = a._emscripten_bind_Metadata___destroy___0 = function () {
      return (Gb = a._emscripten_bind_Metadata___destroy___0 = a.asm.Y).apply(null, arguments);
    };
    var Hb = a._emscripten_bind_Status_code_0 = function () {
      return (Hb = a._emscripten_bind_Status_code_0 = a.asm.Z).apply(null, arguments);
    };
    var Ib = a._emscripten_bind_Status_ok_0 = function () {
      return (Ib = a._emscripten_bind_Status_ok_0 = a.asm._).apply(null, arguments);
    };
    var Jb = a._emscripten_bind_Status_error_msg_0 = function () {
      return (Jb = a._emscripten_bind_Status_error_msg_0 = a.asm.$).apply(null, arguments);
    };
    var Kb = a._emscripten_bind_Status___destroy___0 = function () {
      return (Kb = a._emscripten_bind_Status___destroy___0 = a.asm.aa).apply(null, arguments);
    };
    var Ma = a._emscripten_bind_DracoFloat32Array_DracoFloat32Array_0 = function () {
      return (Ma = a._emscripten_bind_DracoFloat32Array_DracoFloat32Array_0 = a.asm.ba).apply(null, arguments);
    };
    var Lb = a._emscripten_bind_DracoFloat32Array_GetValue_1 = function () {
      return (Lb = a._emscripten_bind_DracoFloat32Array_GetValue_1 = a.asm.ca).apply(null, arguments);
    };
    var Mb = a._emscripten_bind_DracoFloat32Array_size_0 = function () {
      return (Mb = a._emscripten_bind_DracoFloat32Array_size_0 = a.asm.da).apply(null, arguments);
    };
    var Nb = a._emscripten_bind_DracoFloat32Array___destroy___0 = function () {
      return (Nb = a._emscripten_bind_DracoFloat32Array___destroy___0 = a.asm.ea).apply(null, arguments);
    };
    var Na = a._emscripten_bind_DracoInt8Array_DracoInt8Array_0 = function () {
      return (Na = a._emscripten_bind_DracoInt8Array_DracoInt8Array_0 = a.asm.fa).apply(null, arguments);
    };
    var Ob = a._emscripten_bind_DracoInt8Array_GetValue_1 = function () {
      return (Ob = a._emscripten_bind_DracoInt8Array_GetValue_1 = a.asm.ga).apply(null, arguments);
    };
    var Pb = a._emscripten_bind_DracoInt8Array_size_0 = function () {
      return (Pb = a._emscripten_bind_DracoInt8Array_size_0 = a.asm.ha).apply(null, arguments);
    };
    var Qb = a._emscripten_bind_DracoInt8Array___destroy___0 = function () {
      return (Qb = a._emscripten_bind_DracoInt8Array___destroy___0 = a.asm.ia).apply(null, arguments);
    };
    var Oa = a._emscripten_bind_DracoUInt8Array_DracoUInt8Array_0 = function () {
      return (Oa = a._emscripten_bind_DracoUInt8Array_DracoUInt8Array_0 = a.asm.ja).apply(null, arguments);
    };
    var Rb = a._emscripten_bind_DracoUInt8Array_GetValue_1 = function () {
      return (Rb = a._emscripten_bind_DracoUInt8Array_GetValue_1 = a.asm.ka).apply(null, arguments);
    };
    var Sb = a._emscripten_bind_DracoUInt8Array_size_0 = function () {
      return (Sb = a._emscripten_bind_DracoUInt8Array_size_0 = a.asm.la).apply(null, arguments);
    };
    var Tb = a._emscripten_bind_DracoUInt8Array___destroy___0 = function () {
      return (Tb = a._emscripten_bind_DracoUInt8Array___destroy___0 = a.asm.ma).apply(null, arguments);
    };
    var Pa = a._emscripten_bind_DracoInt16Array_DracoInt16Array_0 = function () {
      return (Pa = a._emscripten_bind_DracoInt16Array_DracoInt16Array_0 = a.asm.na).apply(null, arguments);
    };
    var Ub = a._emscripten_bind_DracoInt16Array_GetValue_1 = function () {
      return (Ub = a._emscripten_bind_DracoInt16Array_GetValue_1 = a.asm.oa).apply(null, arguments);
    };
    var Vb = a._emscripten_bind_DracoInt16Array_size_0 = function () {
      return (Vb = a._emscripten_bind_DracoInt16Array_size_0 = a.asm.pa).apply(null, arguments);
    };
    var Wb = a._emscripten_bind_DracoInt16Array___destroy___0 = function () {
      return (Wb = a._emscripten_bind_DracoInt16Array___destroy___0 = a.asm.qa).apply(null, arguments);
    };
    var Qa = a._emscripten_bind_DracoUInt16Array_DracoUInt16Array_0 = function () {
      return (Qa = a._emscripten_bind_DracoUInt16Array_DracoUInt16Array_0 = a.asm.ra).apply(null, arguments);
    };
    var Xb = a._emscripten_bind_DracoUInt16Array_GetValue_1 = function () {
      return (Xb = a._emscripten_bind_DracoUInt16Array_GetValue_1 = a.asm.sa).apply(null, arguments);
    };
    var Yb = a._emscripten_bind_DracoUInt16Array_size_0 = function () {
      return (Yb = a._emscripten_bind_DracoUInt16Array_size_0 = a.asm.ta).apply(null, arguments);
    };
    var Zb = a._emscripten_bind_DracoUInt16Array___destroy___0 = function () {
      return (Zb = a._emscripten_bind_DracoUInt16Array___destroy___0 = a.asm.ua).apply(null, arguments);
    };
    var Ra = a._emscripten_bind_DracoInt32Array_DracoInt32Array_0 = function () {
      return (Ra = a._emscripten_bind_DracoInt32Array_DracoInt32Array_0 = a.asm.va).apply(null, arguments);
    };
    var $b = a._emscripten_bind_DracoInt32Array_GetValue_1 = function () {
      return ($b = a._emscripten_bind_DracoInt32Array_GetValue_1 = a.asm.wa).apply(null, arguments);
    };
    var ac = a._emscripten_bind_DracoInt32Array_size_0 = function () {
      return (ac = a._emscripten_bind_DracoInt32Array_size_0 = a.asm.xa).apply(null, arguments);
    };
    var bc = a._emscripten_bind_DracoInt32Array___destroy___0 = function () {
      return (bc = a._emscripten_bind_DracoInt32Array___destroy___0 = a.asm.ya).apply(null, arguments);
    };
    var Sa = a._emscripten_bind_DracoUInt32Array_DracoUInt32Array_0 = function () {
      return (Sa = a._emscripten_bind_DracoUInt32Array_DracoUInt32Array_0 = a.asm.za).apply(null, arguments);
    };
    var cc = a._emscripten_bind_DracoUInt32Array_GetValue_1 = function () {
      return (cc = a._emscripten_bind_DracoUInt32Array_GetValue_1 = a.asm.Aa).apply(null, arguments);
    };
    var dc = a._emscripten_bind_DracoUInt32Array_size_0 = function () {
      return (dc = a._emscripten_bind_DracoUInt32Array_size_0 = a.asm.Ba).apply(null, arguments);
    };
    var ec = a._emscripten_bind_DracoUInt32Array___destroy___0 = function () {
      return (ec = a._emscripten_bind_DracoUInt32Array___destroy___0 = a.asm.Ca).apply(null, arguments);
    };
    var Ta = a._emscripten_bind_MetadataQuerier_MetadataQuerier_0 = function () {
      return (Ta = a._emscripten_bind_MetadataQuerier_MetadataQuerier_0 = a.asm.Da).apply(null, arguments);
    };
    var fc = a._emscripten_bind_MetadataQuerier_HasEntry_2 = function () {
      return (fc = a._emscripten_bind_MetadataQuerier_HasEntry_2 = a.asm.Ea).apply(null, arguments);
    };
    var gc = a._emscripten_bind_MetadataQuerier_GetIntEntry_2 = function () {
      return (gc = a._emscripten_bind_MetadataQuerier_GetIntEntry_2 = a.asm.Fa).apply(null, arguments);
    };
    var hc = a._emscripten_bind_MetadataQuerier_GetIntEntryArray_3 = function () {
      return (hc = a._emscripten_bind_MetadataQuerier_GetIntEntryArray_3 = a.asm.Ga).apply(null, arguments);
    };
    var ic = a._emscripten_bind_MetadataQuerier_GetDoubleEntry_2 = function () {
      return (ic = a._emscripten_bind_MetadataQuerier_GetDoubleEntry_2 = a.asm.Ha).apply(null, arguments);
    };
    var jc = a._emscripten_bind_MetadataQuerier_GetStringEntry_2 = function () {
      return (jc = a._emscripten_bind_MetadataQuerier_GetStringEntry_2 = a.asm.Ia).apply(null, arguments);
    };
    var kc = a._emscripten_bind_MetadataQuerier_NumEntries_1 = function () {
      return (kc = a._emscripten_bind_MetadataQuerier_NumEntries_1 = a.asm.Ja).apply(null, arguments);
    };
    var lc = a._emscripten_bind_MetadataQuerier_GetEntryName_2 = function () {
      return (lc = a._emscripten_bind_MetadataQuerier_GetEntryName_2 = a.asm.Ka).apply(null, arguments);
    };
    var mc = a._emscripten_bind_MetadataQuerier___destroy___0 = function () {
      return (mc = a._emscripten_bind_MetadataQuerier___destroy___0 = a.asm.La).apply(null, arguments);
    };
    var Ua = a._emscripten_bind_Decoder_Decoder_0 = function () {
      return (Ua = a._emscripten_bind_Decoder_Decoder_0 = a.asm.Ma).apply(null, arguments);
    };
    var nc = a._emscripten_bind_Decoder_DecodeArrayToPointCloud_3 = function () {
      return (nc = a._emscripten_bind_Decoder_DecodeArrayToPointCloud_3 = a.asm.Na).apply(null, arguments);
    };
    var oc = a._emscripten_bind_Decoder_DecodeArrayToMesh_3 = function () {
      return (oc = a._emscripten_bind_Decoder_DecodeArrayToMesh_3 = a.asm.Oa).apply(null, arguments);
    };
    var pc = a._emscripten_bind_Decoder_GetAttributeId_2 = function () {
      return (pc = a._emscripten_bind_Decoder_GetAttributeId_2 = a.asm.Pa).apply(null, arguments);
    };
    var qc = a._emscripten_bind_Decoder_GetAttributeIdByName_2 = function () {
      return (qc = a._emscripten_bind_Decoder_GetAttributeIdByName_2 = a.asm.Qa).apply(null, arguments);
    };
    var rc = a._emscripten_bind_Decoder_GetAttributeIdByMetadataEntry_3 = function () {
      return (rc = a._emscripten_bind_Decoder_GetAttributeIdByMetadataEntry_3 = a.asm.Ra).apply(null, arguments);
    };
    var sc = a._emscripten_bind_Decoder_GetAttribute_2 = function () {
      return (sc = a._emscripten_bind_Decoder_GetAttribute_2 = a.asm.Sa).apply(null, arguments);
    };
    var tc = a._emscripten_bind_Decoder_GetAttributeByUniqueId_2 = function () {
      return (tc = a._emscripten_bind_Decoder_GetAttributeByUniqueId_2 = a.asm.Ta).apply(null, arguments);
    };
    var uc = a._emscripten_bind_Decoder_GetMetadata_1 = function () {
      return (uc = a._emscripten_bind_Decoder_GetMetadata_1 = a.asm.Ua).apply(null, arguments);
    };
    var vc = a._emscripten_bind_Decoder_GetAttributeMetadata_2 = function () {
      return (vc = a._emscripten_bind_Decoder_GetAttributeMetadata_2 = a.asm.Va).apply(null, arguments);
    };
    var wc = a._emscripten_bind_Decoder_GetFaceFromMesh_3 = function () {
      return (wc = a._emscripten_bind_Decoder_GetFaceFromMesh_3 = a.asm.Wa).apply(null, arguments);
    };
    var xc = a._emscripten_bind_Decoder_GetTriangleStripsFromMesh_2 = function () {
      return (xc = a._emscripten_bind_Decoder_GetTriangleStripsFromMesh_2 = a.asm.Xa).apply(null, arguments);
    };
    var yc = a._emscripten_bind_Decoder_GetTrianglesUInt16Array_3 = function () {
      return (yc = a._emscripten_bind_Decoder_GetTrianglesUInt16Array_3 = a.asm.Ya).apply(null, arguments);
    };
    var zc = a._emscripten_bind_Decoder_GetTrianglesUInt32Array_3 = function () {
      return (zc = a._emscripten_bind_Decoder_GetTrianglesUInt32Array_3 = a.asm.Za).apply(null, arguments);
    };
    var Ac = a._emscripten_bind_Decoder_GetAttributeFloat_3 = function () {
      return (Ac = a._emscripten_bind_Decoder_GetAttributeFloat_3 = a.asm._a).apply(null, arguments);
    };
    var Bc = a._emscripten_bind_Decoder_GetAttributeFloatForAllPoints_3 = function () {
      return (Bc = a._emscripten_bind_Decoder_GetAttributeFloatForAllPoints_3 = a.asm.$a).apply(null, arguments);
    };
    var Cc = a._emscripten_bind_Decoder_GetAttributeIntForAllPoints_3 = function () {
      return (Cc = a._emscripten_bind_Decoder_GetAttributeIntForAllPoints_3 = a.asm.ab).apply(null, arguments);
    };
    var Dc = a._emscripten_bind_Decoder_GetAttributeInt8ForAllPoints_3 = function () {
      return (Dc = a._emscripten_bind_Decoder_GetAttributeInt8ForAllPoints_3 = a.asm.bb).apply(null, arguments);
    };
    var Ec = a._emscripten_bind_Decoder_GetAttributeUInt8ForAllPoints_3 = function () {
      return (Ec = a._emscripten_bind_Decoder_GetAttributeUInt8ForAllPoints_3 = a.asm.cb).apply(null, arguments);
    };
    var Fc = a._emscripten_bind_Decoder_GetAttributeInt16ForAllPoints_3 = function () {
      return (Fc = a._emscripten_bind_Decoder_GetAttributeInt16ForAllPoints_3 = a.asm.db).apply(null, arguments);
    };
    var Gc = a._emscripten_bind_Decoder_GetAttributeUInt16ForAllPoints_3 = function () {
      return (Gc = a._emscripten_bind_Decoder_GetAttributeUInt16ForAllPoints_3 = a.asm.eb).apply(null, arguments);
    };
    var Hc = a._emscripten_bind_Decoder_GetAttributeInt32ForAllPoints_3 = function () {
      return (Hc = a._emscripten_bind_Decoder_GetAttributeInt32ForAllPoints_3 = a.asm.fb).apply(null, arguments);
    };
    var Ic = a._emscripten_bind_Decoder_GetAttributeUInt32ForAllPoints_3 = function () {
      return (Ic = a._emscripten_bind_Decoder_GetAttributeUInt32ForAllPoints_3 = a.asm.gb).apply(null, arguments);
    };
    var Jc = a._emscripten_bind_Decoder_GetAttributeDataArrayForAllPoints_5 = function () {
      return (Jc = a._emscripten_bind_Decoder_GetAttributeDataArrayForAllPoints_5 = a.asm.hb).apply(null, arguments);
    };
    var Kc = a._emscripten_bind_Decoder_SkipAttributeTransform_1 = function () {
      return (Kc = a._emscripten_bind_Decoder_SkipAttributeTransform_1 = a.asm.ib).apply(null, arguments);
    };
    var Lc = a._emscripten_bind_Decoder_GetEncodedGeometryType_Deprecated_1 = function () {
      return (Lc = a._emscripten_bind_Decoder_GetEncodedGeometryType_Deprecated_1 = a.asm.jb).apply(null, arguments);
    };
    var Mc = a._emscripten_bind_Decoder_DecodeBufferToPointCloud_2 = function () {
      return (Mc = a._emscripten_bind_Decoder_DecodeBufferToPointCloud_2 = a.asm.kb).apply(null, arguments);
    };
    var Nc = a._emscripten_bind_Decoder_DecodeBufferToMesh_2 = function () {
      return (Nc = a._emscripten_bind_Decoder_DecodeBufferToMesh_2 = a.asm.lb).apply(null, arguments);
    };
    var Oc = a._emscripten_bind_Decoder___destroy___0 = function () {
      return (Oc = a._emscripten_bind_Decoder___destroy___0 = a.asm.mb).apply(null, arguments);
    };
    var Pc = a._emscripten_enum_draco_AttributeTransformType_ATTRIBUTE_INVALID_TRANSFORM = function () {
      return (Pc = a._emscripten_enum_draco_AttributeTransformType_ATTRIBUTE_INVALID_TRANSFORM = a.asm.nb).apply(null, arguments);
    };
    var Qc = a._emscripten_enum_draco_AttributeTransformType_ATTRIBUTE_NO_TRANSFORM = function () {
      return (Qc = a._emscripten_enum_draco_AttributeTransformType_ATTRIBUTE_NO_TRANSFORM = a.asm.ob).apply(null, arguments);
    };
    var Rc = a._emscripten_enum_draco_AttributeTransformType_ATTRIBUTE_QUANTIZATION_TRANSFORM = function () {
      return (Rc = a._emscripten_enum_draco_AttributeTransformType_ATTRIBUTE_QUANTIZATION_TRANSFORM = a.asm.pb).apply(null, arguments);
    };
    var Sc = a._emscripten_enum_draco_AttributeTransformType_ATTRIBUTE_OCTAHEDRON_TRANSFORM = function () {
      return (Sc = a._emscripten_enum_draco_AttributeTransformType_ATTRIBUTE_OCTAHEDRON_TRANSFORM = a.asm.qb).apply(null, arguments);
    };
    var Tc = a._emscripten_enum_draco_GeometryAttribute_Type_INVALID = function () {
      return (Tc = a._emscripten_enum_draco_GeometryAttribute_Type_INVALID = a.asm.rb).apply(null, arguments);
    };
    var Uc = a._emscripten_enum_draco_GeometryAttribute_Type_POSITION = function () {
      return (Uc = a._emscripten_enum_draco_GeometryAttribute_Type_POSITION = a.asm.sb).apply(null, arguments);
    };
    var Vc = a._emscripten_enum_draco_GeometryAttribute_Type_NORMAL = function () {
      return (Vc = a._emscripten_enum_draco_GeometryAttribute_Type_NORMAL = a.asm.tb).apply(null, arguments);
    };
    var Wc = a._emscripten_enum_draco_GeometryAttribute_Type_COLOR = function () {
      return (Wc = a._emscripten_enum_draco_GeometryAttribute_Type_COLOR = a.asm.ub).apply(null, arguments);
    };
    var Xc = a._emscripten_enum_draco_GeometryAttribute_Type_TEX_COORD = function () {
      return (Xc = a._emscripten_enum_draco_GeometryAttribute_Type_TEX_COORD = a.asm.vb).apply(null, arguments);
    };
    var Yc = a._emscripten_enum_draco_GeometryAttribute_Type_GENERIC = function () {
      return (Yc = a._emscripten_enum_draco_GeometryAttribute_Type_GENERIC = a.asm.wb).apply(null, arguments);
    };
    var Zc = a._emscripten_enum_draco_EncodedGeometryType_INVALID_GEOMETRY_TYPE = function () {
      return (Zc = a._emscripten_enum_draco_EncodedGeometryType_INVALID_GEOMETRY_TYPE = a.asm.xb).apply(null, arguments);
    };
    var $c = a._emscripten_enum_draco_EncodedGeometryType_POINT_CLOUD = function () {
      return ($c = a._emscripten_enum_draco_EncodedGeometryType_POINT_CLOUD = a.asm.yb).apply(null, arguments);
    };
    var ad = a._emscripten_enum_draco_EncodedGeometryType_TRIANGULAR_MESH = function () {
      return (ad = a._emscripten_enum_draco_EncodedGeometryType_TRIANGULAR_MESH = a.asm.zb).apply(null, arguments);
    };
    var bd = a._emscripten_enum_draco_DataType_DT_INVALID = function () {
      return (bd = a._emscripten_enum_draco_DataType_DT_INVALID = a.asm.Ab).apply(null, arguments);
    };
    var cd = a._emscripten_enum_draco_DataType_DT_INT8 = function () {
      return (cd = a._emscripten_enum_draco_DataType_DT_INT8 = a.asm.Bb).apply(null, arguments);
    };
    var dd = a._emscripten_enum_draco_DataType_DT_UINT8 = function () {
      return (dd = a._emscripten_enum_draco_DataType_DT_UINT8 = a.asm.Cb).apply(null, arguments);
    };
    var ed = a._emscripten_enum_draco_DataType_DT_INT16 = function () {
      return (ed = a._emscripten_enum_draco_DataType_DT_INT16 = a.asm.Db).apply(null, arguments);
    };
    var fd = a._emscripten_enum_draco_DataType_DT_UINT16 = function () {
      return (fd = a._emscripten_enum_draco_DataType_DT_UINT16 = a.asm.Eb).apply(null, arguments);
    };
    var gd = a._emscripten_enum_draco_DataType_DT_INT32 = function () {
      return (gd = a._emscripten_enum_draco_DataType_DT_INT32 = a.asm.Fb).apply(null, arguments);
    };
    var hd = a._emscripten_enum_draco_DataType_DT_UINT32 = function () {
      return (hd = a._emscripten_enum_draco_DataType_DT_UINT32 = a.asm.Gb).apply(null, arguments);
    };
    var id = a._emscripten_enum_draco_DataType_DT_INT64 = function () {
      return (id = a._emscripten_enum_draco_DataType_DT_INT64 = a.asm.Hb).apply(null, arguments);
    };
    var jd = a._emscripten_enum_draco_DataType_DT_UINT64 = function () {
      return (jd = a._emscripten_enum_draco_DataType_DT_UINT64 = a.asm.Ib).apply(null, arguments);
    };
    var kd = a._emscripten_enum_draco_DataType_DT_FLOAT32 = function () {
      return (kd = a._emscripten_enum_draco_DataType_DT_FLOAT32 = a.asm.Jb).apply(null, arguments);
    };
    var ld = a._emscripten_enum_draco_DataType_DT_FLOAT64 = function () {
      return (ld = a._emscripten_enum_draco_DataType_DT_FLOAT64 = a.asm.Kb).apply(null, arguments);
    };
    var md = a._emscripten_enum_draco_DataType_DT_BOOL = function () {
      return (md = a._emscripten_enum_draco_DataType_DT_BOOL = a.asm.Lb).apply(null, arguments);
    };
    var nd = a._emscripten_enum_draco_DataType_DT_TYPES_COUNT = function () {
      return (nd = a._emscripten_enum_draco_DataType_DT_TYPES_COUNT = a.asm.Mb).apply(null, arguments);
    };
    var od = a._emscripten_enum_draco_StatusCode_OK = function () {
      return (od = a._emscripten_enum_draco_StatusCode_OK = a.asm.Nb).apply(null, arguments);
    };
    var pd = a._emscripten_enum_draco_StatusCode_DRACO_ERROR = function () {
      return (pd = a._emscripten_enum_draco_StatusCode_DRACO_ERROR = a.asm.Ob).apply(null, arguments);
    };
    var qd = a._emscripten_enum_draco_StatusCode_IO_ERROR = function () {
      return (qd = a._emscripten_enum_draco_StatusCode_IO_ERROR = a.asm.Pb).apply(null, arguments);
    };
    var rd = a._emscripten_enum_draco_StatusCode_INVALID_PARAMETER = function () {
      return (rd = a._emscripten_enum_draco_StatusCode_INVALID_PARAMETER = a.asm.Qb).apply(null, arguments);
    };
    var sd = a._emscripten_enum_draco_StatusCode_UNSUPPORTED_VERSION = function () {
      return (sd = a._emscripten_enum_draco_StatusCode_UNSUPPORTED_VERSION = a.asm.Rb).apply(null, arguments);
    };
    var td = a._emscripten_enum_draco_StatusCode_UNKNOWN_VERSION = function () {
      return (td = a._emscripten_enum_draco_StatusCode_UNKNOWN_VERSION = a.asm.Sb).apply(null, arguments);
    };
    a._malloc = function () {
      return (a._malloc = a.asm.Tb).apply(null, arguments);
    };
    a._free = function () {
      return (a._free = a.asm.Ub).apply(null, arguments);
    };
    function ya() {
      return (ya = a.asm.Vb).apply(null, arguments);
    }
    a.___start_em_js = 15856;
    a.___stop_em_js = 15954;
    var la;
    ia = function b() {
      if (!la) {
        ba();
      }
      if (!la) {
        ia = b;
      }
    };
    if (a.preInit) {
      for (typeof a.preInit == "function" && (a.preInit = [a.preInit]); a.preInit.length > 0;) {
        a.preInit.pop()();
      }
    }
    ba();
    t.prototype = Object.create(t.prototype);
    t.prototype.constructor = t;
    t.prototype.__class__ = t;
    t.__cache__ = {};
    a.WrapperObject = t;
    a.getCache = x;
    a.wrapPointer = D;
    a.castObject = function (b, c) {
      return D(b.ptr, c);
    };
    a.NULL = D(0);
    a.destroy = function (b) {
      if (!b.__destroy__) {
        throw "Error: Cannot destroy object. (Did you create it yourself?)";
      }
      b.__destroy__();
      delete x(b.__class__)[b.ptr];
    };
    a.compare = function (b, c) {
      return b.ptr === c.ptr;
    };
    a.getPointer = function (b) {
      return b.ptr;
    };
    a.getClass = function (b) {
      return b.__class__;
    };
    var r = {
      buffer: 0,
      size: 0,
      pos: 0,
      temps: [],
      needed: 0,
      prepare: function () {
        if (r.needed) {
          for (var b = 0; b < r.temps.length; b++) {
            a._free(r.temps[b]);
          }
          r.temps.length = 0;
          a._free(r.buffer);
          r.buffer = 0;
          r.size += r.needed;
          r.needed = 0;
        }
        if (!r.buffer) {
          r.size += 128;
          r.buffer = a._malloc(r.size);
          if (!r.buffer) {
            f(undefined);
          }
        }
        r.pos = 0;
      },
      alloc: function (b, c) {
        if (!r.buffer) {
          f(undefined);
        }
        b = b.length * c.BYTES_PER_ELEMENT;
        b = b + 7 & -8;
        if (r.pos + b >= r.size) {
          if (!(b > 0)) {
            f(undefined);
          }
          r.needed += b;
          c = a._malloc(b);
          r.temps.push(c);
        } else {
          c = r.buffer + r.pos;
          r.pos += b;
        }
        return c;
      },
      copy: function (b, c, d) {
        d >>>= 0;
        switch (c.BYTES_PER_ELEMENT) {
          case 2:
            d >>>= 1;
            break;
          case 4:
            d >>>= 2;
            break;
          case 8:
            d >>>= 3;
        }
        for (var g = 0; g < b.length; g++) {
          c[d + g] = b[g];
        }
      }
    };
    Z.prototype = Object.create(t.prototype);
    Z.prototype.constructor = Z;
    Z.prototype.__class__ = Z;
    Z.__cache__ = {};
    a.VoidPtr = Z;
    Z.prototype.__destroy__ = Z.prototype.__destroy__ = function () {
      bb(this.ptr);
    };
    S.prototype = Object.create(t.prototype);
    S.prototype.constructor = S;
    S.prototype.__class__ = S;
    S.__cache__ = {};
    a.DecoderBuffer = S;
    S.prototype.Init = S.prototype.Init = function (b, c) {
      var d = this.ptr;
      r.prepare();
      if (typeof b == "object") {
        b = pa(b);
      }
      if (c && typeof c === "object") {
        c = c.ptr;
      }
      cb(d, b, c);
    };
    S.prototype.__destroy__ = S.prototype.__destroy__ = function () {
      db(this.ptr);
    };
    Q.prototype = Object.create(t.prototype);
    Q.prototype.constructor = Q;
    Q.prototype.__class__ = Q;
    Q.__cache__ = {};
    a.AttributeTransformData = Q;
    Q.prototype.transform_type = Q.prototype.transform_type = function () {
      return eb(this.ptr);
    };
    Q.prototype.__destroy__ = Q.prototype.__destroy__ = function () {
      fb(this.ptr);
    };
    W.prototype = Object.create(t.prototype);
    W.prototype.constructor = W;
    W.prototype.__class__ = W;
    W.__cache__ = {};
    a.GeometryAttribute = W;
    W.prototype.__destroy__ = W.prototype.__destroy__ = function () {
      gb(this.ptr);
    };
    w.prototype = Object.create(t.prototype);
    w.prototype.constructor = w;
    w.prototype.__class__ = w;
    w.__cache__ = {};
    a.PointAttribute = w;
    w.prototype.size = w.prototype.size = function () {
      return hb(this.ptr);
    };
    w.prototype.GetAttributeTransformData = w.prototype.GetAttributeTransformData = function () {
      return D(ib(this.ptr), Q);
    };
    w.prototype.attribute_type = w.prototype.attribute_type = function () {
      return jb(this.ptr);
    };
    w.prototype.data_type = w.prototype.data_type = function () {
      return kb(this.ptr);
    };
    w.prototype.num_components = w.prototype.num_components = function () {
      return lb(this.ptr);
    };
    w.prototype.normalized = w.prototype.normalized = function () {
      return !!mb(this.ptr);
    };
    w.prototype.byte_stride = w.prototype.byte_stride = function () {
      return nb(this.ptr);
    };
    w.prototype.byte_offset = w.prototype.byte_offset = function () {
      return ob(this.ptr);
    };
    w.prototype.unique_id = w.prototype.unique_id = function () {
      return pb(this.ptr);
    };
    w.prototype.__destroy__ = w.prototype.__destroy__ = function () {
      qb(this.ptr);
    };
    C.prototype = Object.create(t.prototype);
    C.prototype.constructor = C;
    C.prototype.__class__ = C;
    C.__cache__ = {};
    a.AttributeQuantizationTransform = C;
    C.prototype.InitFromAttribute = C.prototype.InitFromAttribute = function (b) {
      var c = this.ptr;
      if (b && typeof b === "object") {
        b = b.ptr;
      }
      return !!rb(c, b);
    };
    C.prototype.quantization_bits = C.prototype.quantization_bits = function () {
      return sb(this.ptr);
    };
    C.prototype.min_value = C.prototype.min_value = function (b) {
      var c = this.ptr;
      if (b && typeof b === "object") {
        b = b.ptr;
      }
      return tb(c, b);
    };
    C.prototype.range = C.prototype.range = function () {
      return ub(this.ptr);
    };
    C.prototype.__destroy__ = C.prototype.__destroy__ = function () {
      vb(this.ptr);
    };
    F.prototype = Object.create(t.prototype);
    F.prototype.constructor = F;
    F.prototype.__class__ = F;
    F.__cache__ = {};
    a.AttributeOctahedronTransform = F;
    F.prototype.InitFromAttribute = F.prototype.InitFromAttribute = function (b) {
      var c = this.ptr;
      if (b && typeof b === "object") {
        b = b.ptr;
      }
      return !!wb(c, b);
    };
    F.prototype.quantization_bits = F.prototype.quantization_bits = function () {
      return xb(this.ptr);
    };
    F.prototype.__destroy__ = F.prototype.__destroy__ = function () {
      yb(this.ptr);
    };
    G.prototype = Object.create(t.prototype);
    G.prototype.constructor = G;
    G.prototype.__class__ = G;
    G.__cache__ = {};
    a.PointCloud = G;
    G.prototype.num_attributes = G.prototype.num_attributes = function () {
      return zb(this.ptr);
    };
    G.prototype.num_points = G.prototype.num_points = function () {
      return Ab(this.ptr);
    };
    G.prototype.__destroy__ = G.prototype.__destroy__ = function () {
      Bb(this.ptr);
    };
    E.prototype = Object.create(t.prototype);
    E.prototype.constructor = E;
    E.prototype.__class__ = E;
    E.__cache__ = {};
    a.Mesh = E;
    E.prototype.num_faces = E.prototype.num_faces = function () {
      return Cb(this.ptr);
    };
    E.prototype.num_attributes = E.prototype.num_attributes = function () {
      return Db(this.ptr);
    };
    E.prototype.num_points = E.prototype.num_points = function () {
      return Eb(this.ptr);
    };
    E.prototype.__destroy__ = E.prototype.__destroy__ = function () {
      Fb(this.ptr);
    };
    T.prototype = Object.create(t.prototype);
    T.prototype.constructor = T;
    T.prototype.__class__ = T;
    T.__cache__ = {};
    a.Metadata = T;
    T.prototype.__destroy__ = T.prototype.__destroy__ = function () {
      Gb(this.ptr);
    };
    B.prototype = Object.create(t.prototype);
    B.prototype.constructor = B;
    B.prototype.__class__ = B;
    B.__cache__ = {};
    a.Status = B;
    B.prototype.code = B.prototype.code = function () {
      return Hb(this.ptr);
    };
    B.prototype.ok = B.prototype.ok = function () {
      return !!Ib(this.ptr);
    };
    B.prototype.error_msg = B.prototype.error_msg = function () {
      return h(Jb(this.ptr));
    };
    B.prototype.__destroy__ = B.prototype.__destroy__ = function () {
      Kb(this.ptr);
    };
    H.prototype = Object.create(t.prototype);
    H.prototype.constructor = H;
    H.prototype.__class__ = H;
    H.__cache__ = {};
    a.DracoFloat32Array = H;
    H.prototype.GetValue = H.prototype.GetValue = function (b) {
      var c = this.ptr;
      if (b && typeof b === "object") {
        b = b.ptr;
      }
      return Lb(c, b);
    };
    H.prototype.size = H.prototype.size = function () {
      return Mb(this.ptr);
    };
    H.prototype.__destroy__ = H.prototype.__destroy__ = function () {
      Nb(this.ptr);
    };
    I.prototype = Object.create(t.prototype);
    I.prototype.constructor = I;
    I.prototype.__class__ = I;
    I.__cache__ = {};
    a.DracoInt8Array = I;
    I.prototype.GetValue = I.prototype.GetValue = function (b) {
      var c = this.ptr;
      if (b && typeof b === "object") {
        b = b.ptr;
      }
      return Ob(c, b);
    };
    I.prototype.size = I.prototype.size = function () {
      return Pb(this.ptr);
    };
    I.prototype.__destroy__ = I.prototype.__destroy__ = function () {
      Qb(this.ptr);
    };
    J.prototype = Object.create(t.prototype);
    J.prototype.constructor = J;
    J.prototype.__class__ = J;
    J.__cache__ = {};
    a.DracoUInt8Array = J;
    J.prototype.GetValue = J.prototype.GetValue = function (b) {
      var c = this.ptr;
      if (b && typeof b === "object") {
        b = b.ptr;
      }
      return Rb(c, b);
    };
    J.prototype.size = J.prototype.size = function () {
      return Sb(this.ptr);
    };
    J.prototype.__destroy__ = J.prototype.__destroy__ = function () {
      Tb(this.ptr);
    };
    K.prototype = Object.create(t.prototype);
    K.prototype.constructor = K;
    K.prototype.__class__ = K;
    K.__cache__ = {};
    a.DracoInt16Array = K;
    K.prototype.GetValue = K.prototype.GetValue = function (b) {
      var c = this.ptr;
      if (b && typeof b === "object") {
        b = b.ptr;
      }
      return Ub(c, b);
    };
    K.prototype.size = K.prototype.size = function () {
      return Vb(this.ptr);
    };
    K.prototype.__destroy__ = K.prototype.__destroy__ = function () {
      Wb(this.ptr);
    };
    L.prototype = Object.create(t.prototype);
    L.prototype.constructor = L;
    L.prototype.__class__ = L;
    L.__cache__ = {};
    a.DracoUInt16Array = L;
    L.prototype.GetValue = L.prototype.GetValue = function (b) {
      var c = this.ptr;
      if (b && typeof b === "object") {
        b = b.ptr;
      }
      return Xb(c, b);
    };
    L.prototype.size = L.prototype.size = function () {
      return Yb(this.ptr);
    };
    L.prototype.__destroy__ = L.prototype.__destroy__ = function () {
      Zb(this.ptr);
    };
    M.prototype = Object.create(t.prototype);
    M.prototype.constructor = M;
    M.prototype.__class__ = M;
    M.__cache__ = {};
    a.DracoInt32Array = M;
    M.prototype.GetValue = M.prototype.GetValue = function (b) {
      var c = this.ptr;
      if (b && typeof b === "object") {
        b = b.ptr;
      }
      return $b(c, b);
    };
    M.prototype.size = M.prototype.size = function () {
      return ac(this.ptr);
    };
    M.prototype.__destroy__ = M.prototype.__destroy__ = function () {
      bc(this.ptr);
    };
    N.prototype = Object.create(t.prototype);
    N.prototype.constructor = N;
    N.prototype.__class__ = N;
    N.__cache__ = {};
    a.DracoUInt32Array = N;
    N.prototype.GetValue = N.prototype.GetValue = function (b) {
      var c = this.ptr;
      if (b && typeof b === "object") {
        b = b.ptr;
      }
      return cc(c, b);
    };
    N.prototype.size = N.prototype.size = function () {
      return dc(this.ptr);
    };
    N.prototype.__destroy__ = N.prototype.__destroy__ = function () {
      ec(this.ptr);
    };
    y.prototype = Object.create(t.prototype);
    y.prototype.constructor = y;
    y.prototype.__class__ = y;
    y.__cache__ = {};
    a.MetadataQuerier = y;
    y.prototype.HasEntry = y.prototype.HasEntry = function (b, c) {
      var d = this.ptr;
      r.prepare();
      if (b && typeof b === "object") {
        b = b.ptr;
      }
      c = c && typeof c === "object" ? c.ptr : R(c);
      return !!fc(d, b, c);
    };
    y.prototype.GetIntEntry = y.prototype.GetIntEntry = function (b, c) {
      var d = this.ptr;
      r.prepare();
      if (b && typeof b === "object") {
        b = b.ptr;
      }
      c = c && typeof c === "object" ? c.ptr : R(c);
      return gc(d, b, c);
    };
    y.prototype.GetIntEntryArray = y.prototype.GetIntEntryArray = function (b, c, d) {
      var g = this.ptr;
      r.prepare();
      if (b && typeof b === "object") {
        b = b.ptr;
      }
      c = c && typeof c === "object" ? c.ptr : R(c);
      if (d && typeof d === "object") {
        d = d.ptr;
      }
      hc(g, b, c, d);
    };
    y.prototype.GetDoubleEntry = y.prototype.GetDoubleEntry = function (b, c) {
      var d = this.ptr;
      r.prepare();
      if (b && typeof b === "object") {
        b = b.ptr;
      }
      c = c && typeof c === "object" ? c.ptr : R(c);
      return ic(d, b, c);
    };
    y.prototype.GetStringEntry = y.prototype.GetStringEntry = function (b, c) {
      var d = this.ptr;
      r.prepare();
      if (b && typeof b === "object") {
        b = b.ptr;
      }
      c = c && typeof c === "object" ? c.ptr : R(c);
      return h(jc(d, b, c));
    };
    y.prototype.NumEntries = y.prototype.NumEntries = function (b) {
      var c = this.ptr;
      if (b && typeof b === "object") {
        b = b.ptr;
      }
      return kc(c, b);
    };
    y.prototype.GetEntryName = y.prototype.GetEntryName = function (b, c) {
      var d = this.ptr;
      if (b && typeof b === "object") {
        b = b.ptr;
      }
      if (c && typeof c === "object") {
        c = c.ptr;
      }
      return h(lc(d, b, c));
    };
    y.prototype.__destroy__ = y.prototype.__destroy__ = function () {
      mc(this.ptr);
    };
    m.prototype = Object.create(t.prototype);
    m.prototype.constructor = m;
    m.prototype.__class__ = m;
    m.__cache__ = {};
    a.Decoder = m;
    m.prototype.DecodeArrayToPointCloud = m.prototype.DecodeArrayToPointCloud = function (b, c, d) {
      var g = this.ptr;
      r.prepare();
      if (typeof b == "object") {
        b = pa(b);
      }
      if (c && typeof c === "object") {
        c = c.ptr;
      }
      if (d && typeof d === "object") {
        d = d.ptr;
      }
      return D(nc(g, b, c, d), B);
    };
    m.prototype.DecodeArrayToMesh = m.prototype.DecodeArrayToMesh = function (b, c, d) {
      var g = this.ptr;
      r.prepare();
      if (typeof b == "object") {
        b = pa(b);
      }
      if (c && typeof c === "object") {
        c = c.ptr;
      }
      if (d && typeof d === "object") {
        d = d.ptr;
      }
      return D(oc(g, b, c, d), B);
    };
    m.prototype.GetAttributeId = m.prototype.GetAttributeId = function (b, c) {
      var d = this.ptr;
      if (b && typeof b === "object") {
        b = b.ptr;
      }
      if (c && typeof c === "object") {
        c = c.ptr;
      }
      return pc(d, b, c);
    };
    m.prototype.GetAttributeIdByName = m.prototype.GetAttributeIdByName = function (b, c) {
      var d = this.ptr;
      r.prepare();
      if (b && typeof b === "object") {
        b = b.ptr;
      }
      c = c && typeof c === "object" ? c.ptr : R(c);
      return qc(d, b, c);
    };
    m.prototype.GetAttributeIdByMetadataEntry = m.prototype.GetAttributeIdByMetadataEntry = function (b, c, d) {
      var g = this.ptr;
      r.prepare();
      if (b && typeof b === "object") {
        b = b.ptr;
      }
      c = c && typeof c === "object" ? c.ptr : R(c);
      d = d && typeof d === "object" ? d.ptr : R(d);
      return rc(g, b, c, d);
    };
    m.prototype.GetAttribute = m.prototype.GetAttribute = function (b, c) {
      var d = this.ptr;
      if (b && typeof b === "object") {
        b = b.ptr;
      }
      if (c && typeof c === "object") {
        c = c.ptr;
      }
      return D(sc(d, b, c), w);
    };
    m.prototype.GetAttributeByUniqueId = m.prototype.GetAttributeByUniqueId = function (b, c) {
      var d = this.ptr;
      if (b && typeof b === "object") {
        b = b.ptr;
      }
      if (c && typeof c === "object") {
        c = c.ptr;
      }
      return D(tc(d, b, c), w);
    };
    m.prototype.GetMetadata = m.prototype.GetMetadata = function (b) {
      var c = this.ptr;
      if (b && typeof b === "object") {
        b = b.ptr;
      }
      return D(uc(c, b), T);
    };
    m.prototype.GetAttributeMetadata = m.prototype.GetAttributeMetadata = function (b, c) {
      var d = this.ptr;
      if (b && typeof b === "object") {
        b = b.ptr;
      }
      if (c && typeof c === "object") {
        c = c.ptr;
      }
      return D(vc(d, b, c), T);
    };
    m.prototype.GetFaceFromMesh = m.prototype.GetFaceFromMesh = function (b, c, d) {
      var g = this.ptr;
      if (b && typeof b === "object") {
        b = b.ptr;
      }
      if (c && typeof c === "object") {
        c = c.ptr;
      }
      if (d && typeof d === "object") {
        d = d.ptr;
      }
      return !!wc(g, b, c, d);
    };
    m.prototype.GetTriangleStripsFromMesh = m.prototype.GetTriangleStripsFromMesh = function (b, c) {
      var d = this.ptr;
      if (b && typeof b === "object") {
        b = b.ptr;
      }
      if (c && typeof c === "object") {
        c = c.ptr;
      }
      return xc(d, b, c);
    };
    m.prototype.GetTrianglesUInt16Array = m.prototype.GetTrianglesUInt16Array = function (b, c, d) {
      var g = this.ptr;
      if (b && typeof b === "object") {
        b = b.ptr;
      }
      if (c && typeof c === "object") {
        c = c.ptr;
      }
      if (d && typeof d === "object") {
        d = d.ptr;
      }
      return !!yc(g, b, c, d);
    };
    m.prototype.GetTrianglesUInt32Array = m.prototype.GetTrianglesUInt32Array = function (b, c, d) {
      var g = this.ptr;
      if (b && typeof b === "object") {
        b = b.ptr;
      }
      if (c && typeof c === "object") {
        c = c.ptr;
      }
      if (d && typeof d === "object") {
        d = d.ptr;
      }
      return !!zc(g, b, c, d);
    };
    m.prototype.GetAttributeFloat = m.prototype.GetAttributeFloat = function (b, c, d) {
      var g = this.ptr;
      if (b && typeof b === "object") {
        b = b.ptr;
      }
      if (c && typeof c === "object") {
        c = c.ptr;
      }
      if (d && typeof d === "object") {
        d = d.ptr;
      }
      return !!Ac(g, b, c, d);
    };
    m.prototype.GetAttributeFloatForAllPoints = m.prototype.GetAttributeFloatForAllPoints = function (b, c, d) {
      var g = this.ptr;
      if (b && typeof b === "object") {
        b = b.ptr;
      }
      if (c && typeof c === "object") {
        c = c.ptr;
      }
      if (d && typeof d === "object") {
        d = d.ptr;
      }
      return !!Bc(g, b, c, d);
    };
    m.prototype.GetAttributeIntForAllPoints = m.prototype.GetAttributeIntForAllPoints = function (b, c, d) {
      var g = this.ptr;
      if (b && typeof b === "object") {
        b = b.ptr;
      }
      if (c && typeof c === "object") {
        c = c.ptr;
      }
      if (d && typeof d === "object") {
        d = d.ptr;
      }
      return !!Cc(g, b, c, d);
    };
    m.prototype.GetAttributeInt8ForAllPoints = m.prototype.GetAttributeInt8ForAllPoints = function (b, c, d) {
      var g = this.ptr;
      if (b && typeof b === "object") {
        b = b.ptr;
      }
      if (c && typeof c === "object") {
        c = c.ptr;
      }
      if (d && typeof d === "object") {
        d = d.ptr;
      }
      return !!Dc(g, b, c, d);
    };
    m.prototype.GetAttributeUInt8ForAllPoints = m.prototype.GetAttributeUInt8ForAllPoints = function (b, c, d) {
      var g = this.ptr;
      if (b && typeof b === "object") {
        b = b.ptr;
      }
      if (c && typeof c === "object") {
        c = c.ptr;
      }
      if (d && typeof d === "object") {
        d = d.ptr;
      }
      return !!Ec(g, b, c, d);
    };
    m.prototype.GetAttributeInt16ForAllPoints = m.prototype.GetAttributeInt16ForAllPoints = function (b, c, d) {
      var g = this.ptr;
      if (b && typeof b === "object") {
        b = b.ptr;
      }
      if (c && typeof c === "object") {
        c = c.ptr;
      }
      if (d && typeof d === "object") {
        d = d.ptr;
      }
      return !!Fc(g, b, c, d);
    };
    m.prototype.GetAttributeUInt16ForAllPoints = m.prototype.GetAttributeUInt16ForAllPoints = function (b, c, d) {
      var g = this.ptr;
      if (b && typeof b === "object") {
        b = b.ptr;
      }
      if (c && typeof c === "object") {
        c = c.ptr;
      }
      if (d && typeof d === "object") {
        d = d.ptr;
      }
      return !!Gc(g, b, c, d);
    };
    m.prototype.GetAttributeInt32ForAllPoints = m.prototype.GetAttributeInt32ForAllPoints = function (b, c, d) {
      var g = this.ptr;
      if (b && typeof b === "object") {
        b = b.ptr;
      }
      if (c && typeof c === "object") {
        c = c.ptr;
      }
      if (d && typeof d === "object") {
        d = d.ptr;
      }
      return !!Hc(g, b, c, d);
    };
    m.prototype.GetAttributeUInt32ForAllPoints = m.prototype.GetAttributeUInt32ForAllPoints = function (b, c, d) {
      var g = this.ptr;
      if (b && typeof b === "object") {
        b = b.ptr;
      }
      if (c && typeof c === "object") {
        c = c.ptr;
      }
      if (d && typeof d === "object") {
        d = d.ptr;
      }
      return !!Ic(g, b, c, d);
    };
    m.prototype.GetAttributeDataArrayForAllPoints = m.prototype.GetAttributeDataArrayForAllPoints = function (b, c, d, g, u) {
      var X = this.ptr;
      if (b && typeof b === "object") {
        b = b.ptr;
      }
      if (c && typeof c === "object") {
        c = c.ptr;
      }
      if (d && typeof d === "object") {
        d = d.ptr;
      }
      if (g && typeof g === "object") {
        g = g.ptr;
      }
      if (u && typeof u === "object") {
        u = u.ptr;
      }
      return !!Jc(X, b, c, d, g, u);
    };
    m.prototype.SkipAttributeTransform = m.prototype.SkipAttributeTransform = function (b) {
      var c = this.ptr;
      if (b && typeof b === "object") {
        b = b.ptr;
      }
      Kc(c, b);
    };
    m.prototype.GetEncodedGeometryType_Deprecated = m.prototype.GetEncodedGeometryType_Deprecated = function (b) {
      var c = this.ptr;
      if (b && typeof b === "object") {
        b = b.ptr;
      }
      return Lc(c, b);
    };
    m.prototype.DecodeBufferToPointCloud = m.prototype.DecodeBufferToPointCloud = function (b, c) {
      var d = this.ptr;
      if (b && typeof b === "object") {
        b = b.ptr;
      }
      if (c && typeof c === "object") {
        c = c.ptr;
      }
      return D(Mc(d, b, c), B);
    };
    m.prototype.DecodeBufferToMesh = m.prototype.DecodeBufferToMesh = function (b, c) {
      var d = this.ptr;
      if (b && typeof b === "object") {
        b = b.ptr;
      }
      if (c && typeof c === "object") {
        c = c.ptr;
      }
      return D(Nc(d, b, c), B);
    };
    m.prototype.__destroy__ = m.prototype.__destroy__ = function () {
      Oc(this.ptr);
    };
    (function () {
      function b() {
        a.ATTRIBUTE_INVALID_TRANSFORM = Pc();
        a.ATTRIBUTE_NO_TRANSFORM = Qc();
        a.ATTRIBUTE_QUANTIZATION_TRANSFORM = Rc();
        a.ATTRIBUTE_OCTAHEDRON_TRANSFORM = Sc();
        a.INVALID = Tc();
        a.POSITION = Uc();
        a.NORMAL = Vc();
        a.COLOR = Wc();
        a.TEX_COORD = Xc();
        a.GENERIC = Yc();
        a.INVALID_GEOMETRY_TYPE = Zc();
        a.POINT_CLOUD = $c();
        a.TRIANGULAR_MESH = ad();
        a.DT_INVALID = bd();
        a.DT_INT8 = cd();
        a.DT_UINT8 = dd();
        a.DT_INT16 = ed();
        a.DT_UINT16 = fd();
        a.DT_INT32 = gd();
        a.DT_UINT32 = hd();
        a.DT_INT64 = id();
        a.DT_UINT64 = jd();
        a.DT_FLOAT32 = kd();
        a.DT_FLOAT64 = ld();
        a.DT_BOOL = md();
        a.DT_TYPES_COUNT = nd();
        a.OK = od();
        a.DRACO_ERROR = pd();
        a.IO_ERROR = qd();
        a.INVALID_PARAMETER = rd();
        a.UNSUPPORTED_VERSION = sd();
        a.UNKNOWN_VERSION = td();
      }
      if (za) {
        b();
      } else {
        oa.unshift(b);
      }
    })();
    if (typeof a.onModuleParsed === "function") {
      a.onModuleParsed();
    }
    a.Decoder.prototype.GetEncodedGeometryType = function (b) {
      if (b.__class__ && b.__class__ === a.DecoderBuffer) {
        return a.Decoder.prototype.GetEncodedGeometryType_Deprecated(b);
      }
      if (b.byteLength < 8) {
        return a.INVALID_GEOMETRY_TYPE;
      }
      switch (b[7]) {
        case 0:
          return a.POINT_CLOUD;
        case 1:
          return a.TRIANGULAR_MESH;
        default:
          return a.INVALID_GEOMETRY_TYPE;
      }
    };
    return n.ready;
  };
}();
if (typeof exports === "object" && typeof module === "object") {
  module.exports = DracoDecoderModule;
} else if (typeof define === "function" && define.amd) {
  define([], function () {
    return DracoDecoderModule;
  });
} else if (typeof exports === "object") {
  exports.DracoDecoderModule = DracoDecoderModule;
}