// This is ammo.js, a port of Bullet Physics to JavaScript. zlib licensed.

var Ammo = function () {
  var _scriptDir = typeof document !== "undefined" && document.currentScript ? document.currentScript.src : undefined;
  if (typeof __filename !== "undefined") {
    _scriptDir = _scriptDir || __filename;
  }
  return function (Ammo) {
    Ammo = Ammo || {};
    var b;
    b ||= typeof Ammo !== "undefined" ? Ammo : {};
    var aa = {};
    var ba;
    for (ba in b) {
      if (b.hasOwnProperty(ba)) {
        aa[ba] = b[ba];
      }
    }
    var ca = false;
    var da = false;
    var ea = false;
    var fa = false;
    ca = typeof window === "object";
    da = typeof importScripts === "function";
    ea = typeof process === "object" && typeof process.versions === "object" && typeof process.versions.node === "string";
    fa = !ca && !ea && !da;
    var ha = "";
    var ja;
    var ka;
    var la;
    var ma;
    if (ea) {
      ha = da ? require("path").dirname(ha) + "/" : __dirname + "/";
      ja = function (a, c) {
        la ||= require("fs");
        ma ||= require("path");
        a = ma.normalize(a);
        return la.readFileSync(a, c ? null : "utf8");
      };
      ka = function (a) {
        a = ja(a, true);
        if (!a.buffer) {
          a = new Uint8Array(a);
        }
        assert(a.buffer);
        return a;
      };
      if (process.argv.length > 1) {
        process.argv[1].replace(/\\/g, "/");
      }
      process.argv.slice(2);
      process.on("uncaughtException", function (a) {
        throw a;
      });
      process.on("unhandledRejection", na);
      b.inspect = function () {
        return "[Emscripten Module object]";
      };
    } else if (fa) {
      if (typeof read != "undefined") {
        ja = function (a) {
          return read(a);
        };
      }
      ka = function (a) {
        if (typeof readbuffer === "function") {
          return new Uint8Array(readbuffer(a));
        }
        a = read(a, "binary");
        assert(typeof a === "object");
        return a;
      };
      if (typeof print !== "undefined") {
        if (typeof console === "undefined") {
          console = {};
        }
        console.log = print;
        console.warn = console.error = typeof printErr !== "undefined" ? printErr : print;
      }
    } else if (ca || da) {
      if (da) {
        ha = self.location.href;
      } else if (document.currentScript) {
        ha = document.currentScript.src;
      }
      if (_scriptDir) {
        ha = _scriptDir;
      }
      ha = ha.indexOf("blob:") !== 0 ? ha.substr(0, ha.lastIndexOf("/") + 1) : "";
      ja = function (a) {
        var c = new XMLHttpRequest();
        c.open("GET", a, false);
        c.send(null);
        return c.responseText;
      };
      if (da) {
        ka = function (a) {
          var c = new XMLHttpRequest();
          c.open("GET", a, false);
          c.responseType = "arraybuffer";
          c.send(null);
          return new Uint8Array(c.response);
        };
      }
    }
    var oa = b.print || console.log.bind(console);
    var pa = b.printErr || console.warn.bind(console);
    for (ba in aa) {
      if (aa.hasOwnProperty(ba)) {
        b[ba] = aa[ba];
      }
    }
    aa = null;
    var qa = [];
    var ra;
    var sa;
    if (b.wasmBinary) {
      sa = b.wasmBinary;
    }
    var noExitRuntime;
    if (b.noExitRuntime) {
      noExitRuntime = b.noExitRuntime;
    }
    if (typeof WebAssembly !== "object") {
      pa("no native wasm support detected");
    }
    var ta;
    var ua = new WebAssembly.Table({
      initial: 935,
      maximum: 955,
      element: "anyfunc"
    });
    var va = false;
    function assert(a, c) {
      if (!a) {
        na("Assertion failed: " + c);
      }
    }
    var wa = typeof TextDecoder !== "undefined" ? new TextDecoder("utf8") : undefined;
    function xa(a, c, d) {
      var e = c + d;
      for (d = c; a[d] && !(d >= e);) {
        ++d;
      }
      if (d - c > 16 && a.subarray && wa) {
        return wa.decode(a.subarray(c, d));
      }
      for (e = ""; c < d;) {
        var f = a[c++];
        if (f & 128) {
          var m = a[c++] & 63;
          if ((f & 224) == 192) {
            e += String.fromCharCode((f & 31) << 6 | m);
          } else {
            var C = a[c++] & 63;
            f = (f & 240) == 224 ? (f & 15) << 12 | m << 6 | C : (f & 7) << 18 | m << 12 | C << 6 | a[c++] & 63;
            if (f < 65536) {
              e += String.fromCharCode(f);
            } else {
              f -= 65536;
              e += String.fromCharCode(f >> 10 | 55296, f & 1023 | 56320);
            }
          }
        } else {
          e += String.fromCharCode(f);
        }
      }
      return e;
    }
    if (typeof TextDecoder !== "undefined") {
      new TextDecoder("utf-16le");
    }
    var ya;
    var za;
    var Aa;
    var Ba;
    var Ca;
    var Da;
    var Ea = b.INITIAL_MEMORY || 67108864;
    if (ta = b.wasmMemory ? b.wasmMemory : new WebAssembly.Memory({
      initial: Ea / 65536,
      maximum: Ea / 65536
    })) {
      ya = ta.buffer;
    }
    Ea = ya.byteLength;
    var Fa = ya;
    ya = Fa;
    b.HEAP8 = za = new Int8Array(Fa);
    b.HEAP16 = new Int16Array(Fa);
    b.HEAP32 = Ba = new Int32Array(Fa);
    b.HEAPU8 = Aa = new Uint8Array(Fa);
    b.HEAPU16 = new Uint16Array(Fa);
    b.HEAPU32 = new Uint32Array(Fa);
    b.HEAPF32 = Ca = new Float32Array(Fa);
    b.HEAPF64 = Da = new Float64Array(Fa);
    Ba[8080] = 5275360;
    function Ga(a) {
      while (a.length > 0) {
        var c = a.shift();
        if (typeof c == "function") {
          c(b);
        } else {
          var d = c.Ky;
          if (typeof d === "number") {
            if (c.vy === undefined) {
              b.dynCall_v(d);
            } else {
              b.dynCall_vi(d, c.vy);
            }
          } else {
            d(c.vy === undefined ? null : c.vy);
          }
        }
      }
    }
    var Ha = [];
    var Ia = [];
    var Ja = [];
    var Ka = [];
    var La = false;
    function Ma() {
      var a = b.preRun.shift();
      Ha.unshift(a);
    }
    var Na = 0;
    var Oa = null;
    var Pa = null;
    b.preloadedImages = {};
    b.preloadedAudios = {};
    function na(a) {
      if (b.onAbort) {
        b.onAbort(a);
      }
      a += "";
      oa(a);
      pa(a);
      va = true;
      throw new WebAssembly.RuntimeError("abort(" + a + "). Build with -s ASSERTIONS=1 for more info.");
    }
    function Qa() {
      var a = Ra;
      if (String.prototype.startsWith) {
        return a.startsWith("data:application/octet-stream;base64,");
      } else {
        return a.indexOf("data:application/octet-stream;base64,") === 0;
      }
    }
    var Ra = "ammo.wasm.wasm";
    if (!Qa()) {
      var Sa = Ra;
      Ra = b.locateFile ? b.locateFile(Sa, ha) : ha + Sa;
    }
    function Ta() {
      try {
        if (sa) {
          return new Uint8Array(sa);
        }
        if (ka) {
          return ka(Ra);
        }
        throw "both async and sync fetching of the wasm failed";
      } catch (a) {
        na(a);
      }
    }
    function Ua() {
      if (sa || !ca && !da || typeof fetch !== "function") {
        return new Promise(function (a) {
          a(Ta());
        });
      } else {
        return fetch(Ra, {
          credentials: "same-origin"
        }).then(function (a) {
          if (!a.ok) {
            throw "failed to load wasm binary file at '" + Ra + "'";
          }
          return a.arrayBuffer();
        }).catch(function () {
          return Ta();
        });
      }
    }
    var Va = {
      1864: function (a, c, d, e, f, m, C, P) {
        a = b.getCache(b.ConcreteContactResultCallback)[a];
        if (!a.hasOwnProperty("addSingleResult")) {
          throw "a JSImplementation must implement all functions, you forgot ConcreteContactResultCallback::addSingleResult.";
        }
        return a.addSingleResult(c, d, e, f, m, C, P);
      },
      2424: function (a, c, d, e) {
        a = b.getCache(b.DebugDrawer)[a];
        if (!a.hasOwnProperty("drawLine")) {
          throw "a JSImplementation must implement all functions, you forgot DebugDrawer::drawLine.";
        }
        a.drawLine(c, d, e);
      },
      2649: function (a, c, d, e, f, m) {
        a = b.getCache(b.DebugDrawer)[a];
        if (!a.hasOwnProperty("drawContactPoint")) {
          throw "a JSImplementation must implement all functions, you forgot DebugDrawer::drawContactPoint.";
        }
        a.drawContactPoint(c, d, e, f, m);
      },
      2906: function (a, c) {
        a = b.getCache(b.DebugDrawer)[a];
        if (!a.hasOwnProperty("reportErrorWarning")) {
          throw "a JSImplementation must implement all functions, you forgot DebugDrawer::reportErrorWarning.";
        }
        a.reportErrorWarning(c);
      },
      3153: function (a, c, d) {
        a = b.getCache(b.DebugDrawer)[a];
        if (!a.hasOwnProperty("draw3dText")) {
          throw "a JSImplementation must implement all functions, you forgot DebugDrawer::draw3dText.";
        }
        a.draw3dText(c, d);
      },
      3380: function (a, c) {
        a = b.getCache(b.DebugDrawer)[a];
        if (!a.hasOwnProperty("setDebugMode")) {
          throw "a JSImplementation must implement all functions, you forgot DebugDrawer::setDebugMode.";
        }
        a.setDebugMode(c);
      },
      3606: function (a) {
        a = b.getCache(b.DebugDrawer)[a];
        if (!a.hasOwnProperty("getDebugMode")) {
          throw "a JSImplementation must implement all functions, you forgot DebugDrawer::getDebugMode.";
        }
        return a.getDebugMode();
      }
    };
    Ia.push({
      Ky: function () {
        Wa();
      }
    });
    var Xa = [null, [], []];
    function Ya(a, c) {
      Za ||= [];
      var d = Za;
      d.length = 0;
      for (var e; e = Aa[a++];) {
        if (e === 100 || e === 102) {
          c = c + 7 & -8;
          d.push(Da[c >> 3]);
          c += 8;
        } else {
          c = c + 3 & -4;
          d.push(Ba[c >> 2]);
          c += 4;
        }
      }
      return d;
    }
    var Za;
    var $a = {
      i: function () {
        na();
      },
      d: function (a, c, d) {
        c = Ya(c, d);
        return Va[a].apply(null, c);
      },
      a: function (a, c, d) {
        c = Ya(c, d);
        return Va[a].apply(null, c);
      },
      f: function (a, c, d) {
        Aa.copyWithin(a, c, c + d);
      },
      g: function () {
        na("OOM");
      },
      h: function () {
        return 0;
      },
      e: function () {},
      c: function (a, c, d, e) {
        var f = 0;
        for (var m = 0; m < d; m++) {
          var C = Ba[c + m * 8 >> 2];
          for (var P = Ba[c + (m * 8 + 4) >> 2], ia = 0; ia < P; ia++) {
            var nb = Aa[C + ia];
            var Wb = Xa[a];
            if (nb === 0 || nb === 10) {
              (a === 1 ? oa : pa)(xa(Wb, 0));
              Wb.length = 0;
            } else {
              Wb.push(nb);
            }
          }
          f += P;
        }
        Ba[e >> 2] = f;
        return 0;
      },
      b: function (a) {
        var c = Date.now();
        Ba[a >> 2] = c / 1000 | 0;
        Ba[a + 4 >> 2] = c % 1000 * 1000 | 0;
        return 0;
      },
      memory: ta,
      table: ua
    };
    var ab = function () {
      function a(f) {
        b.asm = f.exports;
        Na--;
        if (b.monitorRunDependencies) {
          b.monitorRunDependencies(Na);
        }
        if (Na == 0) {
          if (Oa !== null) {
            clearInterval(Oa);
            Oa = null;
          }
          if (Pa) {
            f = Pa;
            Pa = null;
            f();
          }
        }
      }
      function c(f) {
        a(f.instance);
      }
      function d(f) {
        return Ua().then(function (m) {
          return WebAssembly.instantiate(m, e);
        }).then(f, function (m) {
          pa("failed to asynchronously prepare wasm: " + m);
          na(m);
        });
      }
      var e = {
        a: $a
      };
      Na++;
      if (b.monitorRunDependencies) {
        b.monitorRunDependencies(Na);
      }
      if (b.instantiateWasm) {
        try {
          return b.instantiateWasm(e, a);
        } catch (f) {
          pa("Module.instantiateWasm callback failed with error: " + f);
          return false;
        }
      }
      (function () {
        if (sa || typeof WebAssembly.instantiateStreaming !== "function" || Qa() || typeof fetch !== "function") {
          return d(c);
        }
        fetch(Ra, {
          credentials: "same-origin"
        }).then(function (f) {
          return WebAssembly.instantiateStreaming(f, e).then(c, function (m) {
            pa("wasm streaming compile failed: " + m);
            pa("falling back to ArrayBuffer instantiation");
            d(c);
          });
        });
      })();
      return {};
    }();
    b.asm = ab;
    var Wa = b.___wasm_call_ctors = function () {
      return (Wa = b.___wasm_call_ctors = b.asm.j).apply(null, arguments);
    };
    var bb = b._emscripten_bind_btCollisionWorld_getDispatcher_0 = function () {
      return (bb = b._emscripten_bind_btCollisionWorld_getDispatcher_0 = b.asm.k).apply(null, arguments);
    };
    var cb = b._emscripten_bind_btCollisionWorld_rayTest_3 = function () {
      return (cb = b._emscripten_bind_btCollisionWorld_rayTest_3 = b.asm.l).apply(null, arguments);
    };
    var db = b._emscripten_bind_btCollisionWorld_getPairCache_0 = function () {
      return (db = b._emscripten_bind_btCollisionWorld_getPairCache_0 = b.asm.m).apply(null, arguments);
    };
    var eb = b._emscripten_bind_btCollisionWorld_getDispatchInfo_0 = function () {
      return (eb = b._emscripten_bind_btCollisionWorld_getDispatchInfo_0 = b.asm.n).apply(null, arguments);
    };
    var fb = b._emscripten_bind_btCollisionWorld_addCollisionObject_1 = function () {
      return (fb = b._emscripten_bind_btCollisionWorld_addCollisionObject_1 = b.asm.o).apply(null, arguments);
    };
    var gb = b._emscripten_bind_btCollisionWorld_addCollisionObject_2 = function () {
      return (gb = b._emscripten_bind_btCollisionWorld_addCollisionObject_2 = b.asm.p).apply(null, arguments);
    };
    var hb = b._emscripten_bind_btCollisionWorld_addCollisionObject_3 = function () {
      return (hb = b._emscripten_bind_btCollisionWorld_addCollisionObject_3 = b.asm.q).apply(null, arguments);
    };
    var ib = b._emscripten_bind_btCollisionWorld_removeCollisionObject_1 = function () {
      return (ib = b._emscripten_bind_btCollisionWorld_removeCollisionObject_1 = b.asm.r).apply(null, arguments);
    };
    var jb = b._emscripten_bind_btCollisionWorld_getBroadphase_0 = function () {
      return (jb = b._emscripten_bind_btCollisionWorld_getBroadphase_0 = b.asm.s).apply(null, arguments);
    };
    var kb = b._emscripten_bind_btCollisionWorld_convexSweepTest_5 = function () {
      return (kb = b._emscripten_bind_btCollisionWorld_convexSweepTest_5 = b.asm.t).apply(null, arguments);
    };
    var lb = b._emscripten_bind_btCollisionWorld_contactPairTest_3 = function () {
      return (lb = b._emscripten_bind_btCollisionWorld_contactPairTest_3 = b.asm.u).apply(null, arguments);
    };
    var mb = b._emscripten_bind_btCollisionWorld_contactTest_2 = function () {
      return (mb = b._emscripten_bind_btCollisionWorld_contactTest_2 = b.asm.v).apply(null, arguments);
    };
    var ob = b._emscripten_bind_btCollisionWorld_updateSingleAabb_1 = function () {
      return (ob = b._emscripten_bind_btCollisionWorld_updateSingleAabb_1 = b.asm.w).apply(null, arguments);
    };
    var pb = b._emscripten_bind_btCollisionWorld_setDebugDrawer_1 = function () {
      return (pb = b._emscripten_bind_btCollisionWorld_setDebugDrawer_1 = b.asm.x).apply(null, arguments);
    };
    var qb = b._emscripten_bind_btCollisionWorld_getDebugDrawer_0 = function () {
      return (qb = b._emscripten_bind_btCollisionWorld_getDebugDrawer_0 = b.asm.y).apply(null, arguments);
    };
    var rb = b._emscripten_bind_btCollisionWorld_debugDrawWorld_0 = function () {
      return (rb = b._emscripten_bind_btCollisionWorld_debugDrawWorld_0 = b.asm.z).apply(null, arguments);
    };
    var sb = b._emscripten_bind_btCollisionWorld_debugDrawObject_3 = function () {
      return (sb = b._emscripten_bind_btCollisionWorld_debugDrawObject_3 = b.asm.A).apply(null, arguments);
    };
    var tb = b._emscripten_bind_btCollisionWorld___destroy___0 = function () {
      return (tb = b._emscripten_bind_btCollisionWorld___destroy___0 = b.asm.B).apply(null, arguments);
    };
    var ub = b._emscripten_bind_btCollisionShape_setLocalScaling_1 = function () {
      return (ub = b._emscripten_bind_btCollisionShape_setLocalScaling_1 = b.asm.C).apply(null, arguments);
    };
    var vb = b._emscripten_bind_btCollisionShape_getLocalScaling_0 = function () {
      return (vb = b._emscripten_bind_btCollisionShape_getLocalScaling_0 = b.asm.D).apply(null, arguments);
    };
    var wb = b._emscripten_bind_btCollisionShape_calculateLocalInertia_2 = function () {
      return (wb = b._emscripten_bind_btCollisionShape_calculateLocalInertia_2 = b.asm.E).apply(null, arguments);
    };
    var xb = b._emscripten_bind_btCollisionShape_setMargin_1 = function () {
      return (xb = b._emscripten_bind_btCollisionShape_setMargin_1 = b.asm.F).apply(null, arguments);
    };
    var yb = b._emscripten_bind_btCollisionShape_getMargin_0 = function () {
      return (yb = b._emscripten_bind_btCollisionShape_getMargin_0 = b.asm.G).apply(null, arguments);
    };
    var zb = b._emscripten_bind_btCollisionShape___destroy___0 = function () {
      return (zb = b._emscripten_bind_btCollisionShape___destroy___0 = b.asm.H).apply(null, arguments);
    };
    var Ab = b._emscripten_bind_btCollisionObject_setAnisotropicFriction_2 = function () {
      return (Ab = b._emscripten_bind_btCollisionObject_setAnisotropicFriction_2 = b.asm.I).apply(null, arguments);
    };
    var Bb = b._emscripten_bind_btCollisionObject_getCollisionShape_0 = function () {
      return (Bb = b._emscripten_bind_btCollisionObject_getCollisionShape_0 = b.asm.J).apply(null, arguments);
    };
    var Cb = b._emscripten_bind_btCollisionObject_setContactProcessingThreshold_1 = function () {
      return (Cb = b._emscripten_bind_btCollisionObject_setContactProcessingThreshold_1 = b.asm.K).apply(null, arguments);
    };
    var Db = b._emscripten_bind_btCollisionObject_setActivationState_1 = function () {
      return (Db = b._emscripten_bind_btCollisionObject_setActivationState_1 = b.asm.L).apply(null, arguments);
    };
    var Eb = b._emscripten_bind_btCollisionObject_forceActivationState_1 = function () {
      return (Eb = b._emscripten_bind_btCollisionObject_forceActivationState_1 = b.asm.M).apply(null, arguments);
    };
    var Fb = b._emscripten_bind_btCollisionObject_activate_0 = function () {
      return (Fb = b._emscripten_bind_btCollisionObject_activate_0 = b.asm.N).apply(null, arguments);
    };
    var Gb = b._emscripten_bind_btCollisionObject_activate_1 = function () {
      return (Gb = b._emscripten_bind_btCollisionObject_activate_1 = b.asm.O).apply(null, arguments);
    };
    var Hb = b._emscripten_bind_btCollisionObject_isActive_0 = function () {
      return (Hb = b._emscripten_bind_btCollisionObject_isActive_0 = b.asm.P).apply(null, arguments);
    };
    var Ib = b._emscripten_bind_btCollisionObject_isKinematicObject_0 = function () {
      return (Ib = b._emscripten_bind_btCollisionObject_isKinematicObject_0 = b.asm.Q).apply(null, arguments);
    };
    var Jb = b._emscripten_bind_btCollisionObject_isStaticObject_0 = function () {
      return (Jb = b._emscripten_bind_btCollisionObject_isStaticObject_0 = b.asm.R).apply(null, arguments);
    };
    var Kb = b._emscripten_bind_btCollisionObject_isStaticOrKinematicObject_0 = function () {
      return (Kb = b._emscripten_bind_btCollisionObject_isStaticOrKinematicObject_0 = b.asm.S).apply(null, arguments);
    };
    var Lb = b._emscripten_bind_btCollisionObject_getRestitution_0 = function () {
      return (Lb = b._emscripten_bind_btCollisionObject_getRestitution_0 = b.asm.T).apply(null, arguments);
    };
    var Mb = b._emscripten_bind_btCollisionObject_getFriction_0 = function () {
      return (Mb = b._emscripten_bind_btCollisionObject_getFriction_0 = b.asm.U).apply(null, arguments);
    };
    var Nb = b._emscripten_bind_btCollisionObject_getRollingFriction_0 = function () {
      return (Nb = b._emscripten_bind_btCollisionObject_getRollingFriction_0 = b.asm.V).apply(null, arguments);
    };
    var Ob = b._emscripten_bind_btCollisionObject_setRestitution_1 = function () {
      return (Ob = b._emscripten_bind_btCollisionObject_setRestitution_1 = b.asm.W).apply(null, arguments);
    };
    var Pb = b._emscripten_bind_btCollisionObject_setFriction_1 = function () {
      return (Pb = b._emscripten_bind_btCollisionObject_setFriction_1 = b.asm.X).apply(null, arguments);
    };
    var Qb = b._emscripten_bind_btCollisionObject_setRollingFriction_1 = function () {
      return (Qb = b._emscripten_bind_btCollisionObject_setRollingFriction_1 = b.asm.Y).apply(null, arguments);
    };
    var Rb = b._emscripten_bind_btCollisionObject_getWorldTransform_0 = function () {
      return (Rb = b._emscripten_bind_btCollisionObject_getWorldTransform_0 = b.asm.Z).apply(null, arguments);
    };
    var Sb = b._emscripten_bind_btCollisionObject_getCollisionFlags_0 = function () {
      return (Sb = b._emscripten_bind_btCollisionObject_getCollisionFlags_0 = b.asm._).apply(null, arguments);
    };
    var Tb = b._emscripten_bind_btCollisionObject_setCollisionFlags_1 = function () {
      return (Tb = b._emscripten_bind_btCollisionObject_setCollisionFlags_1 = b.asm.$).apply(null, arguments);
    };
    var Ub = b._emscripten_bind_btCollisionObject_setWorldTransform_1 = function () {
      return (Ub = b._emscripten_bind_btCollisionObject_setWorldTransform_1 = b.asm.aa).apply(null, arguments);
    };
    var Vb = b._emscripten_bind_btCollisionObject_setCollisionShape_1 = function () {
      return (Vb = b._emscripten_bind_btCollisionObject_setCollisionShape_1 = b.asm.ba).apply(null, arguments);
    };
    var Xb = b._emscripten_bind_btCollisionObject_setCcdMotionThreshold_1 = function () {
      return (Xb = b._emscripten_bind_btCollisionObject_setCcdMotionThreshold_1 = b.asm.ca).apply(null, arguments);
    };
    var Yb = b._emscripten_bind_btCollisionObject_setCcdSweptSphereRadius_1 = function () {
      return (Yb = b._emscripten_bind_btCollisionObject_setCcdSweptSphereRadius_1 = b.asm.da).apply(null, arguments);
    };
    var Zb = b._emscripten_bind_btCollisionObject_getUserIndex_0 = function () {
      return (Zb = b._emscripten_bind_btCollisionObject_getUserIndex_0 = b.asm.ea).apply(null, arguments);
    };
    var $b = b._emscripten_bind_btCollisionObject_setUserIndex_1 = function () {
      return ($b = b._emscripten_bind_btCollisionObject_setUserIndex_1 = b.asm.fa).apply(null, arguments);
    };
    var ac = b._emscripten_bind_btCollisionObject_getUserPointer_0 = function () {
      return (ac = b._emscripten_bind_btCollisionObject_getUserPointer_0 = b.asm.ga).apply(null, arguments);
    };
    var bc = b._emscripten_bind_btCollisionObject_setUserPointer_1 = function () {
      return (bc = b._emscripten_bind_btCollisionObject_setUserPointer_1 = b.asm.ha).apply(null, arguments);
    };
    var cc = b._emscripten_bind_btCollisionObject_getBroadphaseHandle_0 = function () {
      return (cc = b._emscripten_bind_btCollisionObject_getBroadphaseHandle_0 = b.asm.ia).apply(null, arguments);
    };
    var dc = b._emscripten_bind_btCollisionObject___destroy___0 = function () {
      return (dc = b._emscripten_bind_btCollisionObject___destroy___0 = b.asm.ja).apply(null, arguments);
    };
    var ec = b._emscripten_bind_btDynamicsWorld_addAction_1 = function () {
      return (ec = b._emscripten_bind_btDynamicsWorld_addAction_1 = b.asm.ka).apply(null, arguments);
    };
    var fc = b._emscripten_bind_btDynamicsWorld_removeAction_1 = function () {
      return (fc = b._emscripten_bind_btDynamicsWorld_removeAction_1 = b.asm.la).apply(null, arguments);
    };
    var hc = b._emscripten_bind_btDynamicsWorld_getSolverInfo_0 = function () {
      return (hc = b._emscripten_bind_btDynamicsWorld_getSolverInfo_0 = b.asm.ma).apply(null, arguments);
    };
    var ic = b._emscripten_bind_btDynamicsWorld_setInternalTickCallback_1 = function () {
      return (ic = b._emscripten_bind_btDynamicsWorld_setInternalTickCallback_1 = b.asm.na).apply(null, arguments);
    };
    var jc = b._emscripten_bind_btDynamicsWorld_setInternalTickCallback_2 = function () {
      return (jc = b._emscripten_bind_btDynamicsWorld_setInternalTickCallback_2 = b.asm.oa).apply(null, arguments);
    };
    var kc = b._emscripten_bind_btDynamicsWorld_setInternalTickCallback_3 = function () {
      return (kc = b._emscripten_bind_btDynamicsWorld_setInternalTickCallback_3 = b.asm.pa).apply(null, arguments);
    };
    var lc = b._emscripten_bind_btDynamicsWorld_getDispatcher_0 = function () {
      return (lc = b._emscripten_bind_btDynamicsWorld_getDispatcher_0 = b.asm.qa).apply(null, arguments);
    };
    var mc = b._emscripten_bind_btDynamicsWorld_rayTest_3 = function () {
      return (mc = b._emscripten_bind_btDynamicsWorld_rayTest_3 = b.asm.ra).apply(null, arguments);
    };
    var nc = b._emscripten_bind_btDynamicsWorld_getPairCache_0 = function () {
      return (nc = b._emscripten_bind_btDynamicsWorld_getPairCache_0 = b.asm.sa).apply(null, arguments);
    };
    var oc = b._emscripten_bind_btDynamicsWorld_getDispatchInfo_0 = function () {
      return (oc = b._emscripten_bind_btDynamicsWorld_getDispatchInfo_0 = b.asm.ta).apply(null, arguments);
    };
    var pc = b._emscripten_bind_btDynamicsWorld_addCollisionObject_1 = function () {
      return (pc = b._emscripten_bind_btDynamicsWorld_addCollisionObject_1 = b.asm.ua).apply(null, arguments);
    };
    var qc = b._emscripten_bind_btDynamicsWorld_addCollisionObject_2 = function () {
      return (qc = b._emscripten_bind_btDynamicsWorld_addCollisionObject_2 = b.asm.va).apply(null, arguments);
    };
    var rc = b._emscripten_bind_btDynamicsWorld_addCollisionObject_3 = function () {
      return (rc = b._emscripten_bind_btDynamicsWorld_addCollisionObject_3 = b.asm.wa).apply(null, arguments);
    };
    var sc = b._emscripten_bind_btDynamicsWorld_removeCollisionObject_1 = function () {
      return (sc = b._emscripten_bind_btDynamicsWorld_removeCollisionObject_1 = b.asm.xa).apply(null, arguments);
    };
    var tc = b._emscripten_bind_btDynamicsWorld_getBroadphase_0 = function () {
      return (tc = b._emscripten_bind_btDynamicsWorld_getBroadphase_0 = b.asm.ya).apply(null, arguments);
    };
    var uc = b._emscripten_bind_btDynamicsWorld_convexSweepTest_5 = function () {
      return (uc = b._emscripten_bind_btDynamicsWorld_convexSweepTest_5 = b.asm.za).apply(null, arguments);
    };
    var vc = b._emscripten_bind_btDynamicsWorld_contactPairTest_3 = function () {
      return (vc = b._emscripten_bind_btDynamicsWorld_contactPairTest_3 = b.asm.Aa).apply(null, arguments);
    };
    var wc = b._emscripten_bind_btDynamicsWorld_contactTest_2 = function () {
      return (wc = b._emscripten_bind_btDynamicsWorld_contactTest_2 = b.asm.Ba).apply(null, arguments);
    };
    var xc = b._emscripten_bind_btDynamicsWorld_updateSingleAabb_1 = function () {
      return (xc = b._emscripten_bind_btDynamicsWorld_updateSingleAabb_1 = b.asm.Ca).apply(null, arguments);
    };
    var yc = b._emscripten_bind_btDynamicsWorld_setDebugDrawer_1 = function () {
      return (yc = b._emscripten_bind_btDynamicsWorld_setDebugDrawer_1 = b.asm.Da).apply(null, arguments);
    };
    var zc = b._emscripten_bind_btDynamicsWorld_getDebugDrawer_0 = function () {
      return (zc = b._emscripten_bind_btDynamicsWorld_getDebugDrawer_0 = b.asm.Ea).apply(null, arguments);
    };
    var Ac = b._emscripten_bind_btDynamicsWorld_debugDrawWorld_0 = function () {
      return (Ac = b._emscripten_bind_btDynamicsWorld_debugDrawWorld_0 = b.asm.Fa).apply(null, arguments);
    };
    var Bc = b._emscripten_bind_btDynamicsWorld_debugDrawObject_3 = function () {
      return (Bc = b._emscripten_bind_btDynamicsWorld_debugDrawObject_3 = b.asm.Ga).apply(null, arguments);
    };
    var Cc = b._emscripten_bind_btDynamicsWorld___destroy___0 = function () {
      return (Cc = b._emscripten_bind_btDynamicsWorld___destroy___0 = b.asm.Ha).apply(null, arguments);
    };
    var Dc = b._emscripten_bind_btTypedConstraint_enableFeedback_1 = function () {
      return (Dc = b._emscripten_bind_btTypedConstraint_enableFeedback_1 = b.asm.Ia).apply(null, arguments);
    };
    var Ec = b._emscripten_bind_btTypedConstraint_getBreakingImpulseThreshold_0 = function () {
      return (Ec = b._emscripten_bind_btTypedConstraint_getBreakingImpulseThreshold_0 = b.asm.Ja).apply(null, arguments);
    };
    var Fc = b._emscripten_bind_btTypedConstraint_setBreakingImpulseThreshold_1 = function () {
      return (Fc = b._emscripten_bind_btTypedConstraint_setBreakingImpulseThreshold_1 = b.asm.Ka).apply(null, arguments);
    };
    var Gc = b._emscripten_bind_btTypedConstraint_getParam_2 = function () {
      return (Gc = b._emscripten_bind_btTypedConstraint_getParam_2 = b.asm.La).apply(null, arguments);
    };
    var Hc = b._emscripten_bind_btTypedConstraint_setParam_3 = function () {
      return (Hc = b._emscripten_bind_btTypedConstraint_setParam_3 = b.asm.Ma).apply(null, arguments);
    };
    var Ic = b._emscripten_bind_btTypedConstraint___destroy___0 = function () {
      return (Ic = b._emscripten_bind_btTypedConstraint___destroy___0 = b.asm.Na).apply(null, arguments);
    };
    var Jc = b._emscripten_bind_btConcaveShape_setLocalScaling_1 = function () {
      return (Jc = b._emscripten_bind_btConcaveShape_setLocalScaling_1 = b.asm.Oa).apply(null, arguments);
    };
    var Kc = b._emscripten_bind_btConcaveShape_getLocalScaling_0 = function () {
      return (Kc = b._emscripten_bind_btConcaveShape_getLocalScaling_0 = b.asm.Pa).apply(null, arguments);
    };
    var Lc = b._emscripten_bind_btConcaveShape_calculateLocalInertia_2 = function () {
      return (Lc = b._emscripten_bind_btConcaveShape_calculateLocalInertia_2 = b.asm.Qa).apply(null, arguments);
    };
    var Mc = b._emscripten_bind_btConcaveShape___destroy___0 = function () {
      return (Mc = b._emscripten_bind_btConcaveShape___destroy___0 = b.asm.Ra).apply(null, arguments);
    };
    var Nc = b._emscripten_bind_btCapsuleShape_btCapsuleShape_2 = function () {
      return (Nc = b._emscripten_bind_btCapsuleShape_btCapsuleShape_2 = b.asm.Sa).apply(null, arguments);
    };
    var Oc = b._emscripten_bind_btCapsuleShape_setMargin_1 = function () {
      return (Oc = b._emscripten_bind_btCapsuleShape_setMargin_1 = b.asm.Ta).apply(null, arguments);
    };
    var Pc = b._emscripten_bind_btCapsuleShape_getMargin_0 = function () {
      return (Pc = b._emscripten_bind_btCapsuleShape_getMargin_0 = b.asm.Ua).apply(null, arguments);
    };
    var Qc = b._emscripten_bind_btCapsuleShape_getUpAxis_0 = function () {
      return (Qc = b._emscripten_bind_btCapsuleShape_getUpAxis_0 = b.asm.Va).apply(null, arguments);
    };
    var Rc = b._emscripten_bind_btCapsuleShape_getRadius_0 = function () {
      return (Rc = b._emscripten_bind_btCapsuleShape_getRadius_0 = b.asm.Wa).apply(null, arguments);
    };
    var Sc = b._emscripten_bind_btCapsuleShape_getHalfHeight_0 = function () {
      return (Sc = b._emscripten_bind_btCapsuleShape_getHalfHeight_0 = b.asm.Xa).apply(null, arguments);
    };
    var Tc = b._emscripten_bind_btCapsuleShape_setLocalScaling_1 = function () {
      return (Tc = b._emscripten_bind_btCapsuleShape_setLocalScaling_1 = b.asm.Ya).apply(null, arguments);
    };
    var Uc = b._emscripten_bind_btCapsuleShape_getLocalScaling_0 = function () {
      return (Uc = b._emscripten_bind_btCapsuleShape_getLocalScaling_0 = b.asm.Za).apply(null, arguments);
    };
    var Vc = b._emscripten_bind_btCapsuleShape_calculateLocalInertia_2 = function () {
      return (Vc = b._emscripten_bind_btCapsuleShape_calculateLocalInertia_2 = b.asm._a).apply(null, arguments);
    };
    var Wc = b._emscripten_bind_btCapsuleShape___destroy___0 = function () {
      return (Wc = b._emscripten_bind_btCapsuleShape___destroy___0 = b.asm.$a).apply(null, arguments);
    };
    var Xc = b._emscripten_bind_btIDebugDraw_drawLine_3 = function () {
      return (Xc = b._emscripten_bind_btIDebugDraw_drawLine_3 = b.asm.ab).apply(null, arguments);
    };
    var Yc = b._emscripten_bind_btIDebugDraw_drawContactPoint_5 = function () {
      return (Yc = b._emscripten_bind_btIDebugDraw_drawContactPoint_5 = b.asm.bb).apply(null, arguments);
    };
    var Zc = b._emscripten_bind_btIDebugDraw_reportErrorWarning_1 = function () {
      return (Zc = b._emscripten_bind_btIDebugDraw_reportErrorWarning_1 = b.asm.cb).apply(null, arguments);
    };
    var $c = b._emscripten_bind_btIDebugDraw_draw3dText_2 = function () {
      return ($c = b._emscripten_bind_btIDebugDraw_draw3dText_2 = b.asm.db).apply(null, arguments);
    };
    var ad = b._emscripten_bind_btIDebugDraw_setDebugMode_1 = function () {
      return (ad = b._emscripten_bind_btIDebugDraw_setDebugMode_1 = b.asm.eb).apply(null, arguments);
    };
    var bd = b._emscripten_bind_btIDebugDraw_getDebugMode_0 = function () {
      return (bd = b._emscripten_bind_btIDebugDraw_getDebugMode_0 = b.asm.fb).apply(null, arguments);
    };
    var cd = b._emscripten_bind_btIDebugDraw___destroy___0 = function () {
      return (cd = b._emscripten_bind_btIDebugDraw___destroy___0 = b.asm.gb).apply(null, arguments);
    };
    var dd = b._emscripten_bind_btDefaultCollisionConfiguration_btDefaultCollisionConfiguration_0 = function () {
      return (dd = b._emscripten_bind_btDefaultCollisionConfiguration_btDefaultCollisionConfiguration_0 = b.asm.hb).apply(null, arguments);
    };
    var ed = b._emscripten_bind_btDefaultCollisionConfiguration_btDefaultCollisionConfiguration_1 = function () {
      return (ed = b._emscripten_bind_btDefaultCollisionConfiguration_btDefaultCollisionConfiguration_1 = b.asm.ib).apply(null, arguments);
    };
    var fd = b._emscripten_bind_btDefaultCollisionConfiguration___destroy___0 = function () {
      return (fd = b._emscripten_bind_btDefaultCollisionConfiguration___destroy___0 = b.asm.jb).apply(null, arguments);
    };
    var gd = b._emscripten_bind_btTriangleMeshShape_setLocalScaling_1 = function () {
      return (gd = b._emscripten_bind_btTriangleMeshShape_setLocalScaling_1 = b.asm.kb).apply(null, arguments);
    };
    var hd = b._emscripten_bind_btTriangleMeshShape_getLocalScaling_0 = function () {
      return (hd = b._emscripten_bind_btTriangleMeshShape_getLocalScaling_0 = b.asm.lb).apply(null, arguments);
    };
    var id = b._emscripten_bind_btTriangleMeshShape_calculateLocalInertia_2 = function () {
      return (id = b._emscripten_bind_btTriangleMeshShape_calculateLocalInertia_2 = b.asm.mb).apply(null, arguments);
    };
    var jd = b._emscripten_bind_btTriangleMeshShape___destroy___0 = function () {
      return (jd = b._emscripten_bind_btTriangleMeshShape___destroy___0 = b.asm.nb).apply(null, arguments);
    };
    var kd = b._emscripten_bind_btGhostObject_btGhostObject_0 = function () {
      return (kd = b._emscripten_bind_btGhostObject_btGhostObject_0 = b.asm.ob).apply(null, arguments);
    };
    var ld = b._emscripten_bind_btGhostObject_getNumOverlappingObjects_0 = function () {
      return (ld = b._emscripten_bind_btGhostObject_getNumOverlappingObjects_0 = b.asm.pb).apply(null, arguments);
    };
    var md = b._emscripten_bind_btGhostObject_getOverlappingObject_1 = function () {
      return (md = b._emscripten_bind_btGhostObject_getOverlappingObject_1 = b.asm.qb).apply(null, arguments);
    };
    var nd = b._emscripten_bind_btGhostObject_setAnisotropicFriction_2 = function () {
      return (nd = b._emscripten_bind_btGhostObject_setAnisotropicFriction_2 = b.asm.rb).apply(null, arguments);
    };
    var od = b._emscripten_bind_btGhostObject_getCollisionShape_0 = function () {
      return (od = b._emscripten_bind_btGhostObject_getCollisionShape_0 = b.asm.sb).apply(null, arguments);
    };
    var pd = b._emscripten_bind_btGhostObject_setContactProcessingThreshold_1 = function () {
      return (pd = b._emscripten_bind_btGhostObject_setContactProcessingThreshold_1 = b.asm.tb).apply(null, arguments);
    };
    var qd = b._emscripten_bind_btGhostObject_setActivationState_1 = function () {
      return (qd = b._emscripten_bind_btGhostObject_setActivationState_1 = b.asm.ub).apply(null, arguments);
    };
    var rd = b._emscripten_bind_btGhostObject_forceActivationState_1 = function () {
      return (rd = b._emscripten_bind_btGhostObject_forceActivationState_1 = b.asm.vb).apply(null, arguments);
    };
    var sd = b._emscripten_bind_btGhostObject_activate_0 = function () {
      return (sd = b._emscripten_bind_btGhostObject_activate_0 = b.asm.wb).apply(null, arguments);
    };
    var td = b._emscripten_bind_btGhostObject_activate_1 = function () {
      return (td = b._emscripten_bind_btGhostObject_activate_1 = b.asm.xb).apply(null, arguments);
    };
    var ud = b._emscripten_bind_btGhostObject_isActive_0 = function () {
      return (ud = b._emscripten_bind_btGhostObject_isActive_0 = b.asm.yb).apply(null, arguments);
    };
    var vd = b._emscripten_bind_btGhostObject_isKinematicObject_0 = function () {
      return (vd = b._emscripten_bind_btGhostObject_isKinematicObject_0 = b.asm.zb).apply(null, arguments);
    };
    var wd = b._emscripten_bind_btGhostObject_isStaticObject_0 = function () {
      return (wd = b._emscripten_bind_btGhostObject_isStaticObject_0 = b.asm.Ab).apply(null, arguments);
    };
    var xd = b._emscripten_bind_btGhostObject_isStaticOrKinematicObject_0 = function () {
      return (xd = b._emscripten_bind_btGhostObject_isStaticOrKinematicObject_0 = b.asm.Bb).apply(null, arguments);
    };
    var yd = b._emscripten_bind_btGhostObject_getRestitution_0 = function () {
      return (yd = b._emscripten_bind_btGhostObject_getRestitution_0 = b.asm.Cb).apply(null, arguments);
    };
    var zd = b._emscripten_bind_btGhostObject_getFriction_0 = function () {
      return (zd = b._emscripten_bind_btGhostObject_getFriction_0 = b.asm.Db).apply(null, arguments);
    };
    var Ad = b._emscripten_bind_btGhostObject_getRollingFriction_0 = function () {
      return (Ad = b._emscripten_bind_btGhostObject_getRollingFriction_0 = b.asm.Eb).apply(null, arguments);
    };
    var Bd = b._emscripten_bind_btGhostObject_setRestitution_1 = function () {
      return (Bd = b._emscripten_bind_btGhostObject_setRestitution_1 = b.asm.Fb).apply(null, arguments);
    };
    var Cd = b._emscripten_bind_btGhostObject_setFriction_1 = function () {
      return (Cd = b._emscripten_bind_btGhostObject_setFriction_1 = b.asm.Gb).apply(null, arguments);
    };
    var Dd = b._emscripten_bind_btGhostObject_setRollingFriction_1 = function () {
      return (Dd = b._emscripten_bind_btGhostObject_setRollingFriction_1 = b.asm.Hb).apply(null, arguments);
    };
    var Ed = b._emscripten_bind_btGhostObject_getWorldTransform_0 = function () {
      return (Ed = b._emscripten_bind_btGhostObject_getWorldTransform_0 = b.asm.Ib).apply(null, arguments);
    };
    var Fd = b._emscripten_bind_btGhostObject_getCollisionFlags_0 = function () {
      return (Fd = b._emscripten_bind_btGhostObject_getCollisionFlags_0 = b.asm.Jb).apply(null, arguments);
    };
    var Gd = b._emscripten_bind_btGhostObject_setCollisionFlags_1 = function () {
      return (Gd = b._emscripten_bind_btGhostObject_setCollisionFlags_1 = b.asm.Kb).apply(null, arguments);
    };
    var Hd = b._emscripten_bind_btGhostObject_setWorldTransform_1 = function () {
      return (Hd = b._emscripten_bind_btGhostObject_setWorldTransform_1 = b.asm.Lb).apply(null, arguments);
    };
    var Id = b._emscripten_bind_btGhostObject_setCollisionShape_1 = function () {
      return (Id = b._emscripten_bind_btGhostObject_setCollisionShape_1 = b.asm.Mb).apply(null, arguments);
    };
    var Jd = b._emscripten_bind_btGhostObject_setCcdMotionThreshold_1 = function () {
      return (Jd = b._emscripten_bind_btGhostObject_setCcdMotionThreshold_1 = b.asm.Nb).apply(null, arguments);
    };
    var Kd = b._emscripten_bind_btGhostObject_setCcdSweptSphereRadius_1 = function () {
      return (Kd = b._emscripten_bind_btGhostObject_setCcdSweptSphereRadius_1 = b.asm.Ob).apply(null, arguments);
    };
    var Ld = b._emscripten_bind_btGhostObject_getUserIndex_0 = function () {
      return (Ld = b._emscripten_bind_btGhostObject_getUserIndex_0 = b.asm.Pb).apply(null, arguments);
    };
    var Md = b._emscripten_bind_btGhostObject_setUserIndex_1 = function () {
      return (Md = b._emscripten_bind_btGhostObject_setUserIndex_1 = b.asm.Qb).apply(null, arguments);
    };
    var Nd = b._emscripten_bind_btGhostObject_getUserPointer_0 = function () {
      return (Nd = b._emscripten_bind_btGhostObject_getUserPointer_0 = b.asm.Rb).apply(null, arguments);
    };
    var Od = b._emscripten_bind_btGhostObject_setUserPointer_1 = function () {
      return (Od = b._emscripten_bind_btGhostObject_setUserPointer_1 = b.asm.Sb).apply(null, arguments);
    };
    var Pd = b._emscripten_bind_btGhostObject_getBroadphaseHandle_0 = function () {
      return (Pd = b._emscripten_bind_btGhostObject_getBroadphaseHandle_0 = b.asm.Tb).apply(null, arguments);
    };
    var Qd = b._emscripten_bind_btGhostObject___destroy___0 = function () {
      return (Qd = b._emscripten_bind_btGhostObject___destroy___0 = b.asm.Ub).apply(null, arguments);
    };
    var Rd = b._emscripten_bind_btConeShape_btConeShape_2 = function () {
      return (Rd = b._emscripten_bind_btConeShape_btConeShape_2 = b.asm.Vb).apply(null, arguments);
    };
    var Sd = b._emscripten_bind_btConeShape_setLocalScaling_1 = function () {
      return (Sd = b._emscripten_bind_btConeShape_setLocalScaling_1 = b.asm.Wb).apply(null, arguments);
    };
    var Td = b._emscripten_bind_btConeShape_getLocalScaling_0 = function () {
      return (Td = b._emscripten_bind_btConeShape_getLocalScaling_0 = b.asm.Xb).apply(null, arguments);
    };
    var Ud = b._emscripten_bind_btConeShape_calculateLocalInertia_2 = function () {
      return (Ud = b._emscripten_bind_btConeShape_calculateLocalInertia_2 = b.asm.Yb).apply(null, arguments);
    };
    var Vd = b._emscripten_bind_btConeShape___destroy___0 = function () {
      return (Vd = b._emscripten_bind_btConeShape___destroy___0 = b.asm.Zb).apply(null, arguments);
    };
    var Wd = b._emscripten_bind_btActionInterface_updateAction_2 = function () {
      return (Wd = b._emscripten_bind_btActionInterface_updateAction_2 = b.asm._b).apply(null, arguments);
    };
    var Xd = b._emscripten_bind_btActionInterface___destroy___0 = function () {
      return (Xd = b._emscripten_bind_btActionInterface___destroy___0 = b.asm.$b).apply(null, arguments);
    };
    var Yd = b._emscripten_bind_btVector3_btVector3_0 = function () {
      return (Yd = b._emscripten_bind_btVector3_btVector3_0 = b.asm.ac).apply(null, arguments);
    };
    var Zd = b._emscripten_bind_btVector3_btVector3_3 = function () {
      return (Zd = b._emscripten_bind_btVector3_btVector3_3 = b.asm.bc).apply(null, arguments);
    };
    var $d = b._emscripten_bind_btVector3_length_0 = function () {
      return ($d = b._emscripten_bind_btVector3_length_0 = b.asm.cc).apply(null, arguments);
    };
    var ae = b._emscripten_bind_btVector3_x_0 = function () {
      return (ae = b._emscripten_bind_btVector3_x_0 = b.asm.dc).apply(null, arguments);
    };
    var be = b._emscripten_bind_btVector3_y_0 = function () {
      return (be = b._emscripten_bind_btVector3_y_0 = b.asm.ec).apply(null, arguments);
    };
    var ce = b._emscripten_bind_btVector3_z_0 = function () {
      return (ce = b._emscripten_bind_btVector3_z_0 = b.asm.fc).apply(null, arguments);
    };
    var de = b._emscripten_bind_btVector3_setX_1 = function () {
      return (de = b._emscripten_bind_btVector3_setX_1 = b.asm.gc).apply(null, arguments);
    };
    var ee = b._emscripten_bind_btVector3_setY_1 = function () {
      return (ee = b._emscripten_bind_btVector3_setY_1 = b.asm.hc).apply(null, arguments);
    };
    var fe = b._emscripten_bind_btVector3_setZ_1 = function () {
      return (fe = b._emscripten_bind_btVector3_setZ_1 = b.asm.ic).apply(null, arguments);
    };
    var ge = b._emscripten_bind_btVector3_setValue_3 = function () {
      return (ge = b._emscripten_bind_btVector3_setValue_3 = b.asm.jc).apply(null, arguments);
    };
    var he = b._emscripten_bind_btVector3_normalize_0 = function () {
      return (he = b._emscripten_bind_btVector3_normalize_0 = b.asm.kc).apply(null, arguments);
    };
    var ie = b._emscripten_bind_btVector3_rotate_2 = function () {
      return (ie = b._emscripten_bind_btVector3_rotate_2 = b.asm.lc).apply(null, arguments);
    };
    var je = b._emscripten_bind_btVector3_dot_1 = function () {
      return (je = b._emscripten_bind_btVector3_dot_1 = b.asm.mc).apply(null, arguments);
    };
    var ke = b._emscripten_bind_btVector3_op_mul_1 = function () {
      return (ke = b._emscripten_bind_btVector3_op_mul_1 = b.asm.nc).apply(null, arguments);
    };
    var le = b._emscripten_bind_btVector3_op_add_1 = function () {
      return (le = b._emscripten_bind_btVector3_op_add_1 = b.asm.oc).apply(null, arguments);
    };
    var me = b._emscripten_bind_btVector3_op_sub_1 = function () {
      return (me = b._emscripten_bind_btVector3_op_sub_1 = b.asm.pc).apply(null, arguments);
    };
    var ne = b._emscripten_bind_btVector3___destroy___0 = function () {
      return (ne = b._emscripten_bind_btVector3___destroy___0 = b.asm.qc).apply(null, arguments);
    };
    var oe = b._emscripten_bind_btVehicleRaycaster_castRay_3 = function () {
      return (oe = b._emscripten_bind_btVehicleRaycaster_castRay_3 = b.asm.rc).apply(null, arguments);
    };
    var pe = b._emscripten_bind_btVehicleRaycaster___destroy___0 = function () {
      return (pe = b._emscripten_bind_btVehicleRaycaster___destroy___0 = b.asm.sc).apply(null, arguments);
    };
    var qe = b._emscripten_bind_btQuadWord_x_0 = function () {
      return (qe = b._emscripten_bind_btQuadWord_x_0 = b.asm.tc).apply(null, arguments);
    };
    var re = b._emscripten_bind_btQuadWord_y_0 = function () {
      return (re = b._emscripten_bind_btQuadWord_y_0 = b.asm.uc).apply(null, arguments);
    };
    var se = b._emscripten_bind_btQuadWord_z_0 = function () {
      return (se = b._emscripten_bind_btQuadWord_z_0 = b.asm.vc).apply(null, arguments);
    };
    var te = b._emscripten_bind_btQuadWord_w_0 = function () {
      return (te = b._emscripten_bind_btQuadWord_w_0 = b.asm.wc).apply(null, arguments);
    };
    var ue = b._emscripten_bind_btQuadWord_setX_1 = function () {
      return (ue = b._emscripten_bind_btQuadWord_setX_1 = b.asm.xc).apply(null, arguments);
    };
    var ve = b._emscripten_bind_btQuadWord_setY_1 = function () {
      return (ve = b._emscripten_bind_btQuadWord_setY_1 = b.asm.yc).apply(null, arguments);
    };
    var we = b._emscripten_bind_btQuadWord_setZ_1 = function () {
      return (we = b._emscripten_bind_btQuadWord_setZ_1 = b.asm.zc).apply(null, arguments);
    };
    var xe = b._emscripten_bind_btQuadWord_setW_1 = function () {
      return (xe = b._emscripten_bind_btQuadWord_setW_1 = b.asm.Ac).apply(null, arguments);
    };
    var ye = b._emscripten_bind_btQuadWord___destroy___0 = function () {
      return (ye = b._emscripten_bind_btQuadWord___destroy___0 = b.asm.Bc).apply(null, arguments);
    };
    var ze = b._emscripten_bind_btCylinderShape_btCylinderShape_1 = function () {
      return (ze = b._emscripten_bind_btCylinderShape_btCylinderShape_1 = b.asm.Cc).apply(null, arguments);
    };
    var Ae = b._emscripten_bind_btCylinderShape_setMargin_1 = function () {
      return (Ae = b._emscripten_bind_btCylinderShape_setMargin_1 = b.asm.Dc).apply(null, arguments);
    };
    var Be = b._emscripten_bind_btCylinderShape_getMargin_0 = function () {
      return (Be = b._emscripten_bind_btCylinderShape_getMargin_0 = b.asm.Ec).apply(null, arguments);
    };
    var Ce = b._emscripten_bind_btCylinderShape_setLocalScaling_1 = function () {
      return (Ce = b._emscripten_bind_btCylinderShape_setLocalScaling_1 = b.asm.Fc).apply(null, arguments);
    };
    var De = b._emscripten_bind_btCylinderShape_getLocalScaling_0 = function () {
      return (De = b._emscripten_bind_btCylinderShape_getLocalScaling_0 = b.asm.Gc).apply(null, arguments);
    };
    var Ee = b._emscripten_bind_btCylinderShape_calculateLocalInertia_2 = function () {
      return (Ee = b._emscripten_bind_btCylinderShape_calculateLocalInertia_2 = b.asm.Hc).apply(null, arguments);
    };
    var Fe = b._emscripten_bind_btCylinderShape___destroy___0 = function () {
      return (Fe = b._emscripten_bind_btCylinderShape___destroy___0 = b.asm.Ic).apply(null, arguments);
    };
    var Ge = b._emscripten_bind_btDiscreteDynamicsWorld_btDiscreteDynamicsWorld_4 = function () {
      return (Ge = b._emscripten_bind_btDiscreteDynamicsWorld_btDiscreteDynamicsWorld_4 = b.asm.Jc).apply(null, arguments);
    };
    var He = b._emscripten_bind_btDiscreteDynamicsWorld_setGravity_1 = function () {
      return (He = b._emscripten_bind_btDiscreteDynamicsWorld_setGravity_1 = b.asm.Kc).apply(null, arguments);
    };
    var Ie = b._emscripten_bind_btDiscreteDynamicsWorld_getGravity_0 = function () {
      return (Ie = b._emscripten_bind_btDiscreteDynamicsWorld_getGravity_0 = b.asm.Lc).apply(null, arguments);
    };
    var Je = b._emscripten_bind_btDiscreteDynamicsWorld_addRigidBody_1 = function () {
      return (Je = b._emscripten_bind_btDiscreteDynamicsWorld_addRigidBody_1 = b.asm.Mc).apply(null, arguments);
    };
    var Ke = b._emscripten_bind_btDiscreteDynamicsWorld_addRigidBody_3 = function () {
      return (Ke = b._emscripten_bind_btDiscreteDynamicsWorld_addRigidBody_3 = b.asm.Nc).apply(null, arguments);
    };
    var Le = b._emscripten_bind_btDiscreteDynamicsWorld_removeRigidBody_1 = function () {
      return (Le = b._emscripten_bind_btDiscreteDynamicsWorld_removeRigidBody_1 = b.asm.Oc).apply(null, arguments);
    };
    var Me = b._emscripten_bind_btDiscreteDynamicsWorld_addConstraint_1 = function () {
      return (Me = b._emscripten_bind_btDiscreteDynamicsWorld_addConstraint_1 = b.asm.Pc).apply(null, arguments);
    };
    var Ne = b._emscripten_bind_btDiscreteDynamicsWorld_addConstraint_2 = function () {
      return (Ne = b._emscripten_bind_btDiscreteDynamicsWorld_addConstraint_2 = b.asm.Qc).apply(null, arguments);
    };
    var Oe = b._emscripten_bind_btDiscreteDynamicsWorld_removeConstraint_1 = function () {
      return (Oe = b._emscripten_bind_btDiscreteDynamicsWorld_removeConstraint_1 = b.asm.Rc).apply(null, arguments);
    };
    var Pe = b._emscripten_bind_btDiscreteDynamicsWorld_stepSimulation_1 = function () {
      return (Pe = b._emscripten_bind_btDiscreteDynamicsWorld_stepSimulation_1 = b.asm.Sc).apply(null, arguments);
    };
    var Qe = b._emscripten_bind_btDiscreteDynamicsWorld_stepSimulation_2 = function () {
      return (Qe = b._emscripten_bind_btDiscreteDynamicsWorld_stepSimulation_2 = b.asm.Tc).apply(null, arguments);
    };
    var Re = b._emscripten_bind_btDiscreteDynamicsWorld_stepSimulation_3 = function () {
      return (Re = b._emscripten_bind_btDiscreteDynamicsWorld_stepSimulation_3 = b.asm.Uc).apply(null, arguments);
    };
    var Se = b._emscripten_bind_btDiscreteDynamicsWorld_setContactAddedCallback_1 = function () {
      return (Se = b._emscripten_bind_btDiscreteDynamicsWorld_setContactAddedCallback_1 = b.asm.Vc).apply(null, arguments);
    };
    var Te = b._emscripten_bind_btDiscreteDynamicsWorld_setContactProcessedCallback_1 = function () {
      return (Te = b._emscripten_bind_btDiscreteDynamicsWorld_setContactProcessedCallback_1 = b.asm.Wc).apply(null, arguments);
    };
    var Ue = b._emscripten_bind_btDiscreteDynamicsWorld_setContactDestroyedCallback_1 = function () {
      return (Ue = b._emscripten_bind_btDiscreteDynamicsWorld_setContactDestroyedCallback_1 = b.asm.Xc).apply(null, arguments);
    };
    var Ve = b._emscripten_bind_btDiscreteDynamicsWorld_getDispatcher_0 = function () {
      return (Ve = b._emscripten_bind_btDiscreteDynamicsWorld_getDispatcher_0 = b.asm.Yc).apply(null, arguments);
    };
    var We = b._emscripten_bind_btDiscreteDynamicsWorld_rayTest_3 = function () {
      return (We = b._emscripten_bind_btDiscreteDynamicsWorld_rayTest_3 = b.asm.Zc).apply(null, arguments);
    };
    var Xe = b._emscripten_bind_btDiscreteDynamicsWorld_getPairCache_0 = function () {
      return (Xe = b._emscripten_bind_btDiscreteDynamicsWorld_getPairCache_0 = b.asm._c).apply(null, arguments);
    };
    var Ye = b._emscripten_bind_btDiscreteDynamicsWorld_getDispatchInfo_0 = function () {
      return (Ye = b._emscripten_bind_btDiscreteDynamicsWorld_getDispatchInfo_0 = b.asm.$c).apply(null, arguments);
    };
    var Ze = b._emscripten_bind_btDiscreteDynamicsWorld_addCollisionObject_1 = function () {
      return (Ze = b._emscripten_bind_btDiscreteDynamicsWorld_addCollisionObject_1 = b.asm.ad).apply(null, arguments);
    };
    var $e = b._emscripten_bind_btDiscreteDynamicsWorld_addCollisionObject_2 = function () {
      return ($e = b._emscripten_bind_btDiscreteDynamicsWorld_addCollisionObject_2 = b.asm.bd).apply(null, arguments);
    };
    var af = b._emscripten_bind_btDiscreteDynamicsWorld_addCollisionObject_3 = function () {
      return (af = b._emscripten_bind_btDiscreteDynamicsWorld_addCollisionObject_3 = b.asm.cd).apply(null, arguments);
    };
    var bf = b._emscripten_bind_btDiscreteDynamicsWorld_removeCollisionObject_1 = function () {
      return (bf = b._emscripten_bind_btDiscreteDynamicsWorld_removeCollisionObject_1 = b.asm.dd).apply(null, arguments);
    };
    var cf = b._emscripten_bind_btDiscreteDynamicsWorld_getBroadphase_0 = function () {
      return (cf = b._emscripten_bind_btDiscreteDynamicsWorld_getBroadphase_0 = b.asm.ed).apply(null, arguments);
    };
    var df = b._emscripten_bind_btDiscreteDynamicsWorld_convexSweepTest_5 = function () {
      return (df = b._emscripten_bind_btDiscreteDynamicsWorld_convexSweepTest_5 = b.asm.fd).apply(null, arguments);
    };
    var ef = b._emscripten_bind_btDiscreteDynamicsWorld_contactPairTest_3 = function () {
      return (ef = b._emscripten_bind_btDiscreteDynamicsWorld_contactPairTest_3 = b.asm.gd).apply(null, arguments);
    };
    var ff = b._emscripten_bind_btDiscreteDynamicsWorld_contactTest_2 = function () {
      return (ff = b._emscripten_bind_btDiscreteDynamicsWorld_contactTest_2 = b.asm.hd).apply(null, arguments);
    };
    var gf = b._emscripten_bind_btDiscreteDynamicsWorld_updateSingleAabb_1 = function () {
      return (gf = b._emscripten_bind_btDiscreteDynamicsWorld_updateSingleAabb_1 = b.asm.id).apply(null, arguments);
    };
    var hf = b._emscripten_bind_btDiscreteDynamicsWorld_setDebugDrawer_1 = function () {
      return (hf = b._emscripten_bind_btDiscreteDynamicsWorld_setDebugDrawer_1 = b.asm.jd).apply(null, arguments);
    };
    var jf = b._emscripten_bind_btDiscreteDynamicsWorld_getDebugDrawer_0 = function () {
      return (jf = b._emscripten_bind_btDiscreteDynamicsWorld_getDebugDrawer_0 = b.asm.kd).apply(null, arguments);
    };
    var kf = b._emscripten_bind_btDiscreteDynamicsWorld_debugDrawWorld_0 = function () {
      return (kf = b._emscripten_bind_btDiscreteDynamicsWorld_debugDrawWorld_0 = b.asm.ld).apply(null, arguments);
    };
    var lf = b._emscripten_bind_btDiscreteDynamicsWorld_debugDrawObject_3 = function () {
      return (lf = b._emscripten_bind_btDiscreteDynamicsWorld_debugDrawObject_3 = b.asm.md).apply(null, arguments);
    };
    var mf = b._emscripten_bind_btDiscreteDynamicsWorld_addAction_1 = function () {
      return (mf = b._emscripten_bind_btDiscreteDynamicsWorld_addAction_1 = b.asm.nd).apply(null, arguments);
    };
    var nf = b._emscripten_bind_btDiscreteDynamicsWorld_removeAction_1 = function () {
      return (nf = b._emscripten_bind_btDiscreteDynamicsWorld_removeAction_1 = b.asm.od).apply(null, arguments);
    };
    var of = b._emscripten_bind_btDiscreteDynamicsWorld_getSolverInfo_0 = function () {
      return (of = b._emscripten_bind_btDiscreteDynamicsWorld_getSolverInfo_0 = b.asm.pd).apply(null, arguments);
    };
    var pf = b._emscripten_bind_btDiscreteDynamicsWorld_setInternalTickCallback_1 = function () {
      return (pf = b._emscripten_bind_btDiscreteDynamicsWorld_setInternalTickCallback_1 = b.asm.qd).apply(null, arguments);
    };
    var qf = b._emscripten_bind_btDiscreteDynamicsWorld_setInternalTickCallback_2 = function () {
      return (qf = b._emscripten_bind_btDiscreteDynamicsWorld_setInternalTickCallback_2 = b.asm.rd).apply(null, arguments);
    };
    var rf = b._emscripten_bind_btDiscreteDynamicsWorld_setInternalTickCallback_3 = function () {
      return (rf = b._emscripten_bind_btDiscreteDynamicsWorld_setInternalTickCallback_3 = b.asm.sd).apply(null, arguments);
    };
    var sf = b._emscripten_bind_btDiscreteDynamicsWorld___destroy___0 = function () {
      return (sf = b._emscripten_bind_btDiscreteDynamicsWorld___destroy___0 = b.asm.td).apply(null, arguments);
    };
    var tf = b._emscripten_bind_btConvexShape_setLocalScaling_1 = function () {
      return (tf = b._emscripten_bind_btConvexShape_setLocalScaling_1 = b.asm.ud).apply(null, arguments);
    };
    var uf = b._emscripten_bind_btConvexShape_getLocalScaling_0 = function () {
      return (uf = b._emscripten_bind_btConvexShape_getLocalScaling_0 = b.asm.vd).apply(null, arguments);
    };
    var vf = b._emscripten_bind_btConvexShape_calculateLocalInertia_2 = function () {
      return (vf = b._emscripten_bind_btConvexShape_calculateLocalInertia_2 = b.asm.wd).apply(null, arguments);
    };
    var wf = b._emscripten_bind_btConvexShape_setMargin_1 = function () {
      return (wf = b._emscripten_bind_btConvexShape_setMargin_1 = b.asm.xd).apply(null, arguments);
    };
    var xf = b._emscripten_bind_btConvexShape_getMargin_0 = function () {
      return (xf = b._emscripten_bind_btConvexShape_getMargin_0 = b.asm.yd).apply(null, arguments);
    };
    var yf = b._emscripten_bind_btConvexShape___destroy___0 = function () {
      return (yf = b._emscripten_bind_btConvexShape___destroy___0 = b.asm.zd).apply(null, arguments);
    };
    var zf = b._emscripten_bind_btDispatcher_getNumManifolds_0 = function () {
      return (zf = b._emscripten_bind_btDispatcher_getNumManifolds_0 = b.asm.Ad).apply(null, arguments);
    };
    var Af = b._emscripten_bind_btDispatcher_getManifoldByIndexInternal_1 = function () {
      return (Af = b._emscripten_bind_btDispatcher_getManifoldByIndexInternal_1 = b.asm.Bd).apply(null, arguments);
    };
    var Bf = b._emscripten_bind_btDispatcher___destroy___0 = function () {
      return (Bf = b._emscripten_bind_btDispatcher___destroy___0 = b.asm.Cd).apply(null, arguments);
    };
    var Cf = b._emscripten_bind_btGeneric6DofConstraint_btGeneric6DofConstraint_3 = function () {
      return (Cf = b._emscripten_bind_btGeneric6DofConstraint_btGeneric6DofConstraint_3 = b.asm.Dd).apply(null, arguments);
    };
    var Df = b._emscripten_bind_btGeneric6DofConstraint_btGeneric6DofConstraint_5 = function () {
      return (Df = b._emscripten_bind_btGeneric6DofConstraint_btGeneric6DofConstraint_5 = b.asm.Ed).apply(null, arguments);
    };
    var Ef = b._emscripten_bind_btGeneric6DofConstraint_setLinearLowerLimit_1 = function () {
      return (Ef = b._emscripten_bind_btGeneric6DofConstraint_setLinearLowerLimit_1 = b.asm.Fd).apply(null, arguments);
    };
    var Ff = b._emscripten_bind_btGeneric6DofConstraint_setLinearUpperLimit_1 = function () {
      return (Ff = b._emscripten_bind_btGeneric6DofConstraint_setLinearUpperLimit_1 = b.asm.Gd).apply(null, arguments);
    };
    var Gf = b._emscripten_bind_btGeneric6DofConstraint_setAngularLowerLimit_1 = function () {
      return (Gf = b._emscripten_bind_btGeneric6DofConstraint_setAngularLowerLimit_1 = b.asm.Hd).apply(null, arguments);
    };
    var Hf = b._emscripten_bind_btGeneric6DofConstraint_setAngularUpperLimit_1 = function () {
      return (Hf = b._emscripten_bind_btGeneric6DofConstraint_setAngularUpperLimit_1 = b.asm.Id).apply(null, arguments);
    };
    var If = b._emscripten_bind_btGeneric6DofConstraint_getFrameOffsetA_0 = function () {
      return (If = b._emscripten_bind_btGeneric6DofConstraint_getFrameOffsetA_0 = b.asm.Jd).apply(null, arguments);
    };
    var Jf = b._emscripten_bind_btGeneric6DofConstraint_enableFeedback_1 = function () {
      return (Jf = b._emscripten_bind_btGeneric6DofConstraint_enableFeedback_1 = b.asm.Kd).apply(null, arguments);
    };
    var Kf = b._emscripten_bind_btGeneric6DofConstraint_getBreakingImpulseThreshold_0 = function () {
      return (Kf = b._emscripten_bind_btGeneric6DofConstraint_getBreakingImpulseThreshold_0 = b.asm.Ld).apply(null, arguments);
    };
    var Lf = b._emscripten_bind_btGeneric6DofConstraint_setBreakingImpulseThreshold_1 = function () {
      return (Lf = b._emscripten_bind_btGeneric6DofConstraint_setBreakingImpulseThreshold_1 = b.asm.Md).apply(null, arguments);
    };
    var Mf = b._emscripten_bind_btGeneric6DofConstraint_getParam_2 = function () {
      return (Mf = b._emscripten_bind_btGeneric6DofConstraint_getParam_2 = b.asm.Nd).apply(null, arguments);
    };
    var Nf = b._emscripten_bind_btGeneric6DofConstraint_setParam_3 = function () {
      return (Nf = b._emscripten_bind_btGeneric6DofConstraint_setParam_3 = b.asm.Od).apply(null, arguments);
    };
    var Of = b._emscripten_bind_btGeneric6DofConstraint___destroy___0 = function () {
      return (Of = b._emscripten_bind_btGeneric6DofConstraint___destroy___0 = b.asm.Pd).apply(null, arguments);
    };
    var Pf = b._emscripten_bind_btStridingMeshInterface_setScaling_1 = function () {
      return (Pf = b._emscripten_bind_btStridingMeshInterface_setScaling_1 = b.asm.Qd).apply(null, arguments);
    };
    var Qf = b._emscripten_bind_btStridingMeshInterface___destroy___0 = function () {
      return (Qf = b._emscripten_bind_btStridingMeshInterface___destroy___0 = b.asm.Rd).apply(null, arguments);
    };
    var Rf = b._emscripten_bind_btMotionState_getWorldTransform_1 = function () {
      return (Rf = b._emscripten_bind_btMotionState_getWorldTransform_1 = b.asm.Sd).apply(null, arguments);
    };
    var Sf = b._emscripten_bind_btMotionState_setWorldTransform_1 = function () {
      return (Sf = b._emscripten_bind_btMotionState_setWorldTransform_1 = b.asm.Td).apply(null, arguments);
    };
    var Tf = b._emscripten_bind_btMotionState___destroy___0 = function () {
      return (Tf = b._emscripten_bind_btMotionState___destroy___0 = b.asm.Ud).apply(null, arguments);
    };
    var Uf = b._emscripten_bind_ConvexResultCallback_hasHit_0 = function () {
      return (Uf = b._emscripten_bind_ConvexResultCallback_hasHit_0 = b.asm.Vd).apply(null, arguments);
    };
    var Vf = b._emscripten_bind_ConvexResultCallback_get_m_collisionFilterGroup_0 = function () {
      return (Vf = b._emscripten_bind_ConvexResultCallback_get_m_collisionFilterGroup_0 = b.asm.Wd).apply(null, arguments);
    };
    var Wf = b._emscripten_bind_ConvexResultCallback_set_m_collisionFilterGroup_1 = function () {
      return (Wf = b._emscripten_bind_ConvexResultCallback_set_m_collisionFilterGroup_1 = b.asm.Xd).apply(null, arguments);
    };
    var Xf = b._emscripten_bind_ConvexResultCallback_get_m_collisionFilterMask_0 = function () {
      return (Xf = b._emscripten_bind_ConvexResultCallback_get_m_collisionFilterMask_0 = b.asm.Yd).apply(null, arguments);
    };
    var Yf = b._emscripten_bind_ConvexResultCallback_set_m_collisionFilterMask_1 = function () {
      return (Yf = b._emscripten_bind_ConvexResultCallback_set_m_collisionFilterMask_1 = b.asm.Zd).apply(null, arguments);
    };
    var Zf = b._emscripten_bind_ConvexResultCallback_get_m_closestHitFraction_0 = function () {
      return (Zf = b._emscripten_bind_ConvexResultCallback_get_m_closestHitFraction_0 = b.asm._d).apply(null, arguments);
    };
    var $f = b._emscripten_bind_ConvexResultCallback_set_m_closestHitFraction_1 = function () {
      return ($f = b._emscripten_bind_ConvexResultCallback_set_m_closestHitFraction_1 = b.asm.$d).apply(null, arguments);
    };
    var ag = b._emscripten_bind_ConvexResultCallback___destroy___0 = function () {
      return (ag = b._emscripten_bind_ConvexResultCallback___destroy___0 = b.asm.ae).apply(null, arguments);
    };
    var bg = b._emscripten_bind_ContactResultCallback_addSingleResult_7 = function () {
      return (bg = b._emscripten_bind_ContactResultCallback_addSingleResult_7 = b.asm.be).apply(null, arguments);
    };
    var cg = b._emscripten_bind_ContactResultCallback___destroy___0 = function () {
      return (cg = b._emscripten_bind_ContactResultCallback___destroy___0 = b.asm.ce).apply(null, arguments);
    };
    var dg = b._emscripten_bind_btSoftBodySolver___destroy___0 = function () {
      return (dg = b._emscripten_bind_btSoftBodySolver___destroy___0 = b.asm.de).apply(null, arguments);
    };
    var eg = b._emscripten_bind_RayResultCallback_hasHit_0 = function () {
      return (eg = b._emscripten_bind_RayResultCallback_hasHit_0 = b.asm.ee).apply(null, arguments);
    };
    var fg = b._emscripten_bind_RayResultCallback_get_m_collisionFilterGroup_0 = function () {
      return (fg = b._emscripten_bind_RayResultCallback_get_m_collisionFilterGroup_0 = b.asm.fe).apply(null, arguments);
    };
    var gg = b._emscripten_bind_RayResultCallback_set_m_collisionFilterGroup_1 = function () {
      return (gg = b._emscripten_bind_RayResultCallback_set_m_collisionFilterGroup_1 = b.asm.ge).apply(null, arguments);
    };
    var hg = b._emscripten_bind_RayResultCallback_get_m_collisionFilterMask_0 = function () {
      return (hg = b._emscripten_bind_RayResultCallback_get_m_collisionFilterMask_0 = b.asm.he).apply(null, arguments);
    };
    var ig = b._emscripten_bind_RayResultCallback_set_m_collisionFilterMask_1 = function () {
      return (ig = b._emscripten_bind_RayResultCallback_set_m_collisionFilterMask_1 = b.asm.ie).apply(null, arguments);
    };
    var jg = b._emscripten_bind_RayResultCallback_get_m_closestHitFraction_0 = function () {
      return (jg = b._emscripten_bind_RayResultCallback_get_m_closestHitFraction_0 = b.asm.je).apply(null, arguments);
    };
    var kg = b._emscripten_bind_RayResultCallback_set_m_closestHitFraction_1 = function () {
      return (kg = b._emscripten_bind_RayResultCallback_set_m_closestHitFraction_1 = b.asm.ke).apply(null, arguments);
    };
    var lg = b._emscripten_bind_RayResultCallback_get_m_collisionObject_0 = function () {
      return (lg = b._emscripten_bind_RayResultCallback_get_m_collisionObject_0 = b.asm.le).apply(null, arguments);
    };
    var mg = b._emscripten_bind_RayResultCallback_set_m_collisionObject_1 = function () {
      return (mg = b._emscripten_bind_RayResultCallback_set_m_collisionObject_1 = b.asm.me).apply(null, arguments);
    };
    var ng = b._emscripten_bind_RayResultCallback___destroy___0 = function () {
      return (ng = b._emscripten_bind_RayResultCallback___destroy___0 = b.asm.ne).apply(null, arguments);
    };
    var og = b._emscripten_bind_btMatrix3x3_setEulerZYX_3 = function () {
      return (og = b._emscripten_bind_btMatrix3x3_setEulerZYX_3 = b.asm.oe).apply(null, arguments);
    };
    var pg = b._emscripten_bind_btMatrix3x3_getRotation_1 = function () {
      return (pg = b._emscripten_bind_btMatrix3x3_getRotation_1 = b.asm.pe).apply(null, arguments);
    };
    var qg = b._emscripten_bind_btMatrix3x3_getRow_1 = function () {
      return (qg = b._emscripten_bind_btMatrix3x3_getRow_1 = b.asm.qe).apply(null, arguments);
    };
    var rg = b._emscripten_bind_btMatrix3x3___destroy___0 = function () {
      return (rg = b._emscripten_bind_btMatrix3x3___destroy___0 = b.asm.re).apply(null, arguments);
    };
    var sg = b._emscripten_bind_btScalarArray_size_0 = function () {
      return (sg = b._emscripten_bind_btScalarArray_size_0 = b.asm.se).apply(null, arguments);
    };
    var tg = b._emscripten_bind_btScalarArray_at_1 = function () {
      return (tg = b._emscripten_bind_btScalarArray_at_1 = b.asm.te).apply(null, arguments);
    };
    var ug = b._emscripten_bind_btScalarArray___destroy___0 = function () {
      return (ug = b._emscripten_bind_btScalarArray___destroy___0 = b.asm.ue).apply(null, arguments);
    };
    var vg = b._emscripten_bind_Material_get_m_kLST_0 = function () {
      return (vg = b._emscripten_bind_Material_get_m_kLST_0 = b.asm.ve).apply(null, arguments);
    };
    var wg = b._emscripten_bind_Material_set_m_kLST_1 = function () {
      return (wg = b._emscripten_bind_Material_set_m_kLST_1 = b.asm.we).apply(null, arguments);
    };
    var xg = b._emscripten_bind_Material_get_m_kAST_0 = function () {
      return (xg = b._emscripten_bind_Material_get_m_kAST_0 = b.asm.xe).apply(null, arguments);
    };
    var yg = b._emscripten_bind_Material_set_m_kAST_1 = function () {
      return (yg = b._emscripten_bind_Material_set_m_kAST_1 = b.asm.ye).apply(null, arguments);
    };
    var zg = b._emscripten_bind_Material_get_m_kVST_0 = function () {
      return (zg = b._emscripten_bind_Material_get_m_kVST_0 = b.asm.ze).apply(null, arguments);
    };
    var Ag = b._emscripten_bind_Material_set_m_kVST_1 = function () {
      return (Ag = b._emscripten_bind_Material_set_m_kVST_1 = b.asm.Ae).apply(null, arguments);
    };
    var Bg = b._emscripten_bind_Material_get_m_flags_0 = function () {
      return (Bg = b._emscripten_bind_Material_get_m_flags_0 = b.asm.Be).apply(null, arguments);
    };
    var Cg = b._emscripten_bind_Material_set_m_flags_1 = function () {
      return (Cg = b._emscripten_bind_Material_set_m_flags_1 = b.asm.Ce).apply(null, arguments);
    };
    var Dg = b._emscripten_bind_Material___destroy___0 = function () {
      return (Dg = b._emscripten_bind_Material___destroy___0 = b.asm.De).apply(null, arguments);
    };
    var Eg = b._emscripten_bind_btDispatcherInfo_get_m_timeStep_0 = function () {
      return (Eg = b._emscripten_bind_btDispatcherInfo_get_m_timeStep_0 = b.asm.Ee).apply(null, arguments);
    };
    var Fg = b._emscripten_bind_btDispatcherInfo_set_m_timeStep_1 = function () {
      return (Fg = b._emscripten_bind_btDispatcherInfo_set_m_timeStep_1 = b.asm.Fe).apply(null, arguments);
    };
    var Gg = b._emscripten_bind_btDispatcherInfo_get_m_stepCount_0 = function () {
      return (Gg = b._emscripten_bind_btDispatcherInfo_get_m_stepCount_0 = b.asm.Ge).apply(null, arguments);
    };
    var Hg = b._emscripten_bind_btDispatcherInfo_set_m_stepCount_1 = function () {
      return (Hg = b._emscripten_bind_btDispatcherInfo_set_m_stepCount_1 = b.asm.He).apply(null, arguments);
    };
    var Ig = b._emscripten_bind_btDispatcherInfo_get_m_dispatchFunc_0 = function () {
      return (Ig = b._emscripten_bind_btDispatcherInfo_get_m_dispatchFunc_0 = b.asm.Ie).apply(null, arguments);
    };
    var Jg = b._emscripten_bind_btDispatcherInfo_set_m_dispatchFunc_1 = function () {
      return (Jg = b._emscripten_bind_btDispatcherInfo_set_m_dispatchFunc_1 = b.asm.Je).apply(null, arguments);
    };
    var Kg = b._emscripten_bind_btDispatcherInfo_get_m_timeOfImpact_0 = function () {
      return (Kg = b._emscripten_bind_btDispatcherInfo_get_m_timeOfImpact_0 = b.asm.Ke).apply(null, arguments);
    };
    var Lg = b._emscripten_bind_btDispatcherInfo_set_m_timeOfImpact_1 = function () {
      return (Lg = b._emscripten_bind_btDispatcherInfo_set_m_timeOfImpact_1 = b.asm.Le).apply(null, arguments);
    };
    var Mg = b._emscripten_bind_btDispatcherInfo_get_m_useContinuous_0 = function () {
      return (Mg = b._emscripten_bind_btDispatcherInfo_get_m_useContinuous_0 = b.asm.Me).apply(null, arguments);
    };
    var Ng = b._emscripten_bind_btDispatcherInfo_set_m_useContinuous_1 = function () {
      return (Ng = b._emscripten_bind_btDispatcherInfo_set_m_useContinuous_1 = b.asm.Ne).apply(null, arguments);
    };
    var Og = b._emscripten_bind_btDispatcherInfo_get_m_enableSatConvex_0 = function () {
      return (Og = b._emscripten_bind_btDispatcherInfo_get_m_enableSatConvex_0 = b.asm.Oe).apply(null, arguments);
    };
    var Pg = b._emscripten_bind_btDispatcherInfo_set_m_enableSatConvex_1 = function () {
      return (Pg = b._emscripten_bind_btDispatcherInfo_set_m_enableSatConvex_1 = b.asm.Pe).apply(null, arguments);
    };
    var Qg = b._emscripten_bind_btDispatcherInfo_get_m_enableSPU_0 = function () {
      return (Qg = b._emscripten_bind_btDispatcherInfo_get_m_enableSPU_0 = b.asm.Qe).apply(null, arguments);
    };
    var Rg = b._emscripten_bind_btDispatcherInfo_set_m_enableSPU_1 = function () {
      return (Rg = b._emscripten_bind_btDispatcherInfo_set_m_enableSPU_1 = b.asm.Re).apply(null, arguments);
    };
    var Sg = b._emscripten_bind_btDispatcherInfo_get_m_useEpa_0 = function () {
      return (Sg = b._emscripten_bind_btDispatcherInfo_get_m_useEpa_0 = b.asm.Se).apply(null, arguments);
    };
    var Tg = b._emscripten_bind_btDispatcherInfo_set_m_useEpa_1 = function () {
      return (Tg = b._emscripten_bind_btDispatcherInfo_set_m_useEpa_1 = b.asm.Te).apply(null, arguments);
    };
    var Ug = b._emscripten_bind_btDispatcherInfo_get_m_allowedCcdPenetration_0 = function () {
      return (Ug = b._emscripten_bind_btDispatcherInfo_get_m_allowedCcdPenetration_0 = b.asm.Ue).apply(null, arguments);
    };
    var Vg = b._emscripten_bind_btDispatcherInfo_set_m_allowedCcdPenetration_1 = function () {
      return (Vg = b._emscripten_bind_btDispatcherInfo_set_m_allowedCcdPenetration_1 = b.asm.Ve).apply(null, arguments);
    };
    var Wg = b._emscripten_bind_btDispatcherInfo_get_m_useConvexConservativeDistanceUtil_0 = function () {
      return (Wg = b._emscripten_bind_btDispatcherInfo_get_m_useConvexConservativeDistanceUtil_0 = b.asm.We).apply(null, arguments);
    };
    var Xg = b._emscripten_bind_btDispatcherInfo_set_m_useConvexConservativeDistanceUtil_1 = function () {
      return (Xg = b._emscripten_bind_btDispatcherInfo_set_m_useConvexConservativeDistanceUtil_1 = b.asm.Xe).apply(null, arguments);
    };
    var Yg = b._emscripten_bind_btDispatcherInfo_get_m_convexConservativeDistanceThreshold_0 = function () {
      return (Yg = b._emscripten_bind_btDispatcherInfo_get_m_convexConservativeDistanceThreshold_0 = b.asm.Ye).apply(null, arguments);
    };
    var Zg = b._emscripten_bind_btDispatcherInfo_set_m_convexConservativeDistanceThreshold_1 = function () {
      return (Zg = b._emscripten_bind_btDispatcherInfo_set_m_convexConservativeDistanceThreshold_1 = b.asm.Ze).apply(null, arguments);
    };
    var $g = b._emscripten_bind_btDispatcherInfo___destroy___0 = function () {
      return ($g = b._emscripten_bind_btDispatcherInfo___destroy___0 = b.asm._e).apply(null, arguments);
    };
    var ah = b._emscripten_bind_btWheelInfoConstructionInfo_get_m_chassisConnectionCS_0 = function () {
      return (ah = b._emscripten_bind_btWheelInfoConstructionInfo_get_m_chassisConnectionCS_0 = b.asm.$e).apply(null, arguments);
    };
    var bh = b._emscripten_bind_btWheelInfoConstructionInfo_set_m_chassisConnectionCS_1 = function () {
      return (bh = b._emscripten_bind_btWheelInfoConstructionInfo_set_m_chassisConnectionCS_1 = b.asm.af).apply(null, arguments);
    };
    var ch = b._emscripten_bind_btWheelInfoConstructionInfo_get_m_wheelDirectionCS_0 = function () {
      return (ch = b._emscripten_bind_btWheelInfoConstructionInfo_get_m_wheelDirectionCS_0 = b.asm.bf).apply(null, arguments);
    };
    var dh = b._emscripten_bind_btWheelInfoConstructionInfo_set_m_wheelDirectionCS_1 = function () {
      return (dh = b._emscripten_bind_btWheelInfoConstructionInfo_set_m_wheelDirectionCS_1 = b.asm.cf).apply(null, arguments);
    };
    var eh = b._emscripten_bind_btWheelInfoConstructionInfo_get_m_wheelAxleCS_0 = function () {
      return (eh = b._emscripten_bind_btWheelInfoConstructionInfo_get_m_wheelAxleCS_0 = b.asm.df).apply(null, arguments);
    };
    var fh = b._emscripten_bind_btWheelInfoConstructionInfo_set_m_wheelAxleCS_1 = function () {
      return (fh = b._emscripten_bind_btWheelInfoConstructionInfo_set_m_wheelAxleCS_1 = b.asm.ef).apply(null, arguments);
    };
    var gh = b._emscripten_bind_btWheelInfoConstructionInfo_get_m_suspensionRestLength_0 = function () {
      return (gh = b._emscripten_bind_btWheelInfoConstructionInfo_get_m_suspensionRestLength_0 = b.asm.ff).apply(null, arguments);
    };
    var hh = b._emscripten_bind_btWheelInfoConstructionInfo_set_m_suspensionRestLength_1 = function () {
      return (hh = b._emscripten_bind_btWheelInfoConstructionInfo_set_m_suspensionRestLength_1 = b.asm.gf).apply(null, arguments);
    };
    var ih = b._emscripten_bind_btWheelInfoConstructionInfo_get_m_maxSuspensionTravelCm_0 = function () {
      return (ih = b._emscripten_bind_btWheelInfoConstructionInfo_get_m_maxSuspensionTravelCm_0 = b.asm.hf).apply(null, arguments);
    };
    var jh = b._emscripten_bind_btWheelInfoConstructionInfo_set_m_maxSuspensionTravelCm_1 = function () {
      return (jh = b._emscripten_bind_btWheelInfoConstructionInfo_set_m_maxSuspensionTravelCm_1 = b.asm.jf).apply(null, arguments);
    };
    var kh = b._emscripten_bind_btWheelInfoConstructionInfo_get_m_wheelRadius_0 = function () {
      return (kh = b._emscripten_bind_btWheelInfoConstructionInfo_get_m_wheelRadius_0 = b.asm.kf).apply(null, arguments);
    };
    var lh = b._emscripten_bind_btWheelInfoConstructionInfo_set_m_wheelRadius_1 = function () {
      return (lh = b._emscripten_bind_btWheelInfoConstructionInfo_set_m_wheelRadius_1 = b.asm.lf).apply(null, arguments);
    };
    var mh = b._emscripten_bind_btWheelInfoConstructionInfo_get_m_suspensionStiffness_0 = function () {
      return (mh = b._emscripten_bind_btWheelInfoConstructionInfo_get_m_suspensionStiffness_0 = b.asm.mf).apply(null, arguments);
    };
    var nh = b._emscripten_bind_btWheelInfoConstructionInfo_set_m_suspensionStiffness_1 = function () {
      return (nh = b._emscripten_bind_btWheelInfoConstructionInfo_set_m_suspensionStiffness_1 = b.asm.nf).apply(null, arguments);
    };
    var oh = b._emscripten_bind_btWheelInfoConstructionInfo_get_m_wheelsDampingCompression_0 = function () {
      return (oh = b._emscripten_bind_btWheelInfoConstructionInfo_get_m_wheelsDampingCompression_0 = b.asm.of).apply(null, arguments);
    };
    var ph = b._emscripten_bind_btWheelInfoConstructionInfo_set_m_wheelsDampingCompression_1 = function () {
      return (ph = b._emscripten_bind_btWheelInfoConstructionInfo_set_m_wheelsDampingCompression_1 = b.asm.pf).apply(null, arguments);
    };
    var qh = b._emscripten_bind_btWheelInfoConstructionInfo_get_m_wheelsDampingRelaxation_0 = function () {
      return (qh = b._emscripten_bind_btWheelInfoConstructionInfo_get_m_wheelsDampingRelaxation_0 = b.asm.qf).apply(null, arguments);
    };
    var rh = b._emscripten_bind_btWheelInfoConstructionInfo_set_m_wheelsDampingRelaxation_1 = function () {
      return (rh = b._emscripten_bind_btWheelInfoConstructionInfo_set_m_wheelsDampingRelaxation_1 = b.asm.rf).apply(null, arguments);
    };
    var sh = b._emscripten_bind_btWheelInfoConstructionInfo_get_m_frictionSlip_0 = function () {
      return (sh = b._emscripten_bind_btWheelInfoConstructionInfo_get_m_frictionSlip_0 = b.asm.sf).apply(null, arguments);
    };
    var th = b._emscripten_bind_btWheelInfoConstructionInfo_set_m_frictionSlip_1 = function () {
      return (th = b._emscripten_bind_btWheelInfoConstructionInfo_set_m_frictionSlip_1 = b.asm.tf).apply(null, arguments);
    };
    var uh = b._emscripten_bind_btWheelInfoConstructionInfo_get_m_maxSuspensionForce_0 = function () {
      return (uh = b._emscripten_bind_btWheelInfoConstructionInfo_get_m_maxSuspensionForce_0 = b.asm.uf).apply(null, arguments);
    };
    var vh = b._emscripten_bind_btWheelInfoConstructionInfo_set_m_maxSuspensionForce_1 = function () {
      return (vh = b._emscripten_bind_btWheelInfoConstructionInfo_set_m_maxSuspensionForce_1 = b.asm.vf).apply(null, arguments);
    };
    var wh = b._emscripten_bind_btWheelInfoConstructionInfo_get_m_bIsFrontWheel_0 = function () {
      return (wh = b._emscripten_bind_btWheelInfoConstructionInfo_get_m_bIsFrontWheel_0 = b.asm.wf).apply(null, arguments);
    };
    var xh = b._emscripten_bind_btWheelInfoConstructionInfo_set_m_bIsFrontWheel_1 = function () {
      return (xh = b._emscripten_bind_btWheelInfoConstructionInfo_set_m_bIsFrontWheel_1 = b.asm.xf).apply(null, arguments);
    };
    var yh = b._emscripten_bind_btWheelInfoConstructionInfo___destroy___0 = function () {
      return (yh = b._emscripten_bind_btWheelInfoConstructionInfo___destroy___0 = b.asm.yf).apply(null, arguments);
    };
    var zh = b._emscripten_bind_btConvexTriangleMeshShape_btConvexTriangleMeshShape_1 = function () {
      return (zh = b._emscripten_bind_btConvexTriangleMeshShape_btConvexTriangleMeshShape_1 = b.asm.zf).apply(null, arguments);
    };
    var Ah = b._emscripten_bind_btConvexTriangleMeshShape_btConvexTriangleMeshShape_2 = function () {
      return (Ah = b._emscripten_bind_btConvexTriangleMeshShape_btConvexTriangleMeshShape_2 = b.asm.Af).apply(null, arguments);
    };
    var Bh = b._emscripten_bind_btConvexTriangleMeshShape_setLocalScaling_1 = function () {
      return (Bh = b._emscripten_bind_btConvexTriangleMeshShape_setLocalScaling_1 = b.asm.Bf).apply(null, arguments);
    };
    var Ch = b._emscripten_bind_btConvexTriangleMeshShape_getLocalScaling_0 = function () {
      return (Ch = b._emscripten_bind_btConvexTriangleMeshShape_getLocalScaling_0 = b.asm.Cf).apply(null, arguments);
    };
    var Dh = b._emscripten_bind_btConvexTriangleMeshShape_calculateLocalInertia_2 = function () {
      return (Dh = b._emscripten_bind_btConvexTriangleMeshShape_calculateLocalInertia_2 = b.asm.Df).apply(null, arguments);
    };
    var Eh = b._emscripten_bind_btConvexTriangleMeshShape_setMargin_1 = function () {
      return (Eh = b._emscripten_bind_btConvexTriangleMeshShape_setMargin_1 = b.asm.Ef).apply(null, arguments);
    };
    var Fh = b._emscripten_bind_btConvexTriangleMeshShape_getMargin_0 = function () {
      return (Fh = b._emscripten_bind_btConvexTriangleMeshShape_getMargin_0 = b.asm.Ff).apply(null, arguments);
    };
    var Gh = b._emscripten_bind_btConvexTriangleMeshShape___destroy___0 = function () {
      return (Gh = b._emscripten_bind_btConvexTriangleMeshShape___destroy___0 = b.asm.Gf).apply(null, arguments);
    };
    var Hh = b._emscripten_bind_btBroadphaseInterface_getOverlappingPairCache_0 = function () {
      return (Hh = b._emscripten_bind_btBroadphaseInterface_getOverlappingPairCache_0 = b.asm.Hf).apply(null, arguments);
    };
    var Ih = b._emscripten_bind_btBroadphaseInterface___destroy___0 = function () {
      return (Ih = b._emscripten_bind_btBroadphaseInterface___destroy___0 = b.asm.If).apply(null, arguments);
    };
    var Jh = b._emscripten_bind_btRigidBodyConstructionInfo_btRigidBodyConstructionInfo_3 = function () {
      return (Jh = b._emscripten_bind_btRigidBodyConstructionInfo_btRigidBodyConstructionInfo_3 = b.asm.Jf).apply(null, arguments);
    };
    var Kh = b._emscripten_bind_btRigidBodyConstructionInfo_btRigidBodyConstructionInfo_4 = function () {
      return (Kh = b._emscripten_bind_btRigidBodyConstructionInfo_btRigidBodyConstructionInfo_4 = b.asm.Kf).apply(null, arguments);
    };
    var Lh = b._emscripten_bind_btRigidBodyConstructionInfo_get_m_linearDamping_0 = function () {
      return (Lh = b._emscripten_bind_btRigidBodyConstructionInfo_get_m_linearDamping_0 = b.asm.Lf).apply(null, arguments);
    };
    var Mh = b._emscripten_bind_btRigidBodyConstructionInfo_set_m_linearDamping_1 = function () {
      return (Mh = b._emscripten_bind_btRigidBodyConstructionInfo_set_m_linearDamping_1 = b.asm.Mf).apply(null, arguments);
    };
    var Nh = b._emscripten_bind_btRigidBodyConstructionInfo_get_m_angularDamping_0 = function () {
      return (Nh = b._emscripten_bind_btRigidBodyConstructionInfo_get_m_angularDamping_0 = b.asm.Nf).apply(null, arguments);
    };
    var Oh = b._emscripten_bind_btRigidBodyConstructionInfo_set_m_angularDamping_1 = function () {
      return (Oh = b._emscripten_bind_btRigidBodyConstructionInfo_set_m_angularDamping_1 = b.asm.Of).apply(null, arguments);
    };
    var Ph = b._emscripten_bind_btRigidBodyConstructionInfo_get_m_friction_0 = function () {
      return (Ph = b._emscripten_bind_btRigidBodyConstructionInfo_get_m_friction_0 = b.asm.Pf).apply(null, arguments);
    };
    var Qh = b._emscripten_bind_btRigidBodyConstructionInfo_set_m_friction_1 = function () {
      return (Qh = b._emscripten_bind_btRigidBodyConstructionInfo_set_m_friction_1 = b.asm.Qf).apply(null, arguments);
    };
    var Rh = b._emscripten_bind_btRigidBodyConstructionInfo_get_m_rollingFriction_0 = function () {
      return (Rh = b._emscripten_bind_btRigidBodyConstructionInfo_get_m_rollingFriction_0 = b.asm.Rf).apply(null, arguments);
    };
    var Sh = b._emscripten_bind_btRigidBodyConstructionInfo_set_m_rollingFriction_1 = function () {
      return (Sh = b._emscripten_bind_btRigidBodyConstructionInfo_set_m_rollingFriction_1 = b.asm.Sf).apply(null, arguments);
    };
    var Th = b._emscripten_bind_btRigidBodyConstructionInfo_get_m_restitution_0 = function () {
      return (Th = b._emscripten_bind_btRigidBodyConstructionInfo_get_m_restitution_0 = b.asm.Tf).apply(null, arguments);
    };
    var Uh = b._emscripten_bind_btRigidBodyConstructionInfo_set_m_restitution_1 = function () {
      return (Uh = b._emscripten_bind_btRigidBodyConstructionInfo_set_m_restitution_1 = b.asm.Uf).apply(null, arguments);
    };
    var Vh = b._emscripten_bind_btRigidBodyConstructionInfo_get_m_linearSleepingThreshold_0 = function () {
      return (Vh = b._emscripten_bind_btRigidBodyConstructionInfo_get_m_linearSleepingThreshold_0 = b.asm.Vf).apply(null, arguments);
    };
    var Wh = b._emscripten_bind_btRigidBodyConstructionInfo_set_m_linearSleepingThreshold_1 = function () {
      return (Wh = b._emscripten_bind_btRigidBodyConstructionInfo_set_m_linearSleepingThreshold_1 = b.asm.Wf).apply(null, arguments);
    };
    var Xh = b._emscripten_bind_btRigidBodyConstructionInfo_get_m_angularSleepingThreshold_0 = function () {
      return (Xh = b._emscripten_bind_btRigidBodyConstructionInfo_get_m_angularSleepingThreshold_0 = b.asm.Xf).apply(null, arguments);
    };
    var Yh = b._emscripten_bind_btRigidBodyConstructionInfo_set_m_angularSleepingThreshold_1 = function () {
      return (Yh = b._emscripten_bind_btRigidBodyConstructionInfo_set_m_angularSleepingThreshold_1 = b.asm.Yf).apply(null, arguments);
    };
    var Zh = b._emscripten_bind_btRigidBodyConstructionInfo_get_m_additionalDamping_0 = function () {
      return (Zh = b._emscripten_bind_btRigidBodyConstructionInfo_get_m_additionalDamping_0 = b.asm.Zf).apply(null, arguments);
    };
    var $h = b._emscripten_bind_btRigidBodyConstructionInfo_set_m_additionalDamping_1 = function () {
      return ($h = b._emscripten_bind_btRigidBodyConstructionInfo_set_m_additionalDamping_1 = b.asm._f).apply(null, arguments);
    };
    var ai = b._emscripten_bind_btRigidBodyConstructionInfo_get_m_additionalDampingFactor_0 = function () {
      return (ai = b._emscripten_bind_btRigidBodyConstructionInfo_get_m_additionalDampingFactor_0 = b.asm.$f).apply(null, arguments);
    };
    var bi = b._emscripten_bind_btRigidBodyConstructionInfo_set_m_additionalDampingFactor_1 = function () {
      return (bi = b._emscripten_bind_btRigidBodyConstructionInfo_set_m_additionalDampingFactor_1 = b.asm.ag).apply(null, arguments);
    };
    var ci = b._emscripten_bind_btRigidBodyConstructionInfo_get_m_additionalLinearDampingThresholdSqr_0 = function () {
      return (ci = b._emscripten_bind_btRigidBodyConstructionInfo_get_m_additionalLinearDampingThresholdSqr_0 = b.asm.bg).apply(null, arguments);
    };
    var di = b._emscripten_bind_btRigidBodyConstructionInfo_set_m_additionalLinearDampingThresholdSqr_1 = function () {
      return (di = b._emscripten_bind_btRigidBodyConstructionInfo_set_m_additionalLinearDampingThresholdSqr_1 = b.asm.cg).apply(null, arguments);
    };
    var ei = b._emscripten_bind_btRigidBodyConstructionInfo_get_m_additionalAngularDampingThresholdSqr_0 = function () {
      return (ei = b._emscripten_bind_btRigidBodyConstructionInfo_get_m_additionalAngularDampingThresholdSqr_0 = b.asm.dg).apply(null, arguments);
    };
    var fi = b._emscripten_bind_btRigidBodyConstructionInfo_set_m_additionalAngularDampingThresholdSqr_1 = function () {
      return (fi = b._emscripten_bind_btRigidBodyConstructionInfo_set_m_additionalAngularDampingThresholdSqr_1 = b.asm.eg).apply(null, arguments);
    };
    var gi = b._emscripten_bind_btRigidBodyConstructionInfo_get_m_additionalAngularDampingFactor_0 = function () {
      return (gi = b._emscripten_bind_btRigidBodyConstructionInfo_get_m_additionalAngularDampingFactor_0 = b.asm.fg).apply(null, arguments);
    };
    var hi = b._emscripten_bind_btRigidBodyConstructionInfo_set_m_additionalAngularDampingFactor_1 = function () {
      return (hi = b._emscripten_bind_btRigidBodyConstructionInfo_set_m_additionalAngularDampingFactor_1 = b.asm.gg).apply(null, arguments);
    };
    var ii = b._emscripten_bind_btRigidBodyConstructionInfo___destroy___0 = function () {
      return (ii = b._emscripten_bind_btRigidBodyConstructionInfo___destroy___0 = b.asm.hg).apply(null, arguments);
    };
    var ji = b._emscripten_bind_btCollisionConfiguration___destroy___0 = function () {
      return (ji = b._emscripten_bind_btCollisionConfiguration___destroy___0 = b.asm.ig).apply(null, arguments);
    };
    var ki = b._emscripten_bind_btPersistentManifold_btPersistentManifold_0 = function () {
      return (ki = b._emscripten_bind_btPersistentManifold_btPersistentManifold_0 = b.asm.jg).apply(null, arguments);
    };
    var li = b._emscripten_bind_btPersistentManifold_getBody0_0 = function () {
      return (li = b._emscripten_bind_btPersistentManifold_getBody0_0 = b.asm.kg).apply(null, arguments);
    };
    var mi = b._emscripten_bind_btPersistentManifold_getBody1_0 = function () {
      return (mi = b._emscripten_bind_btPersistentManifold_getBody1_0 = b.asm.lg).apply(null, arguments);
    };
    var ni = b._emscripten_bind_btPersistentManifold_getNumContacts_0 = function () {
      return (ni = b._emscripten_bind_btPersistentManifold_getNumContacts_0 = b.asm.mg).apply(null, arguments);
    };
    var oi = b._emscripten_bind_btPersistentManifold_getContactPoint_1 = function () {
      return (oi = b._emscripten_bind_btPersistentManifold_getContactPoint_1 = b.asm.ng).apply(null, arguments);
    };
    var pi = b._emscripten_bind_btPersistentManifold___destroy___0 = function () {
      return (pi = b._emscripten_bind_btPersistentManifold___destroy___0 = b.asm.og).apply(null, arguments);
    };
    var qi = b._emscripten_bind_btCompoundShape_btCompoundShape_0 = function () {
      return (qi = b._emscripten_bind_btCompoundShape_btCompoundShape_0 = b.asm.pg).apply(null, arguments);
    };
    var ri = b._emscripten_bind_btCompoundShape_btCompoundShape_1 = function () {
      return (ri = b._emscripten_bind_btCompoundShape_btCompoundShape_1 = b.asm.qg).apply(null, arguments);
    };
    var si = b._emscripten_bind_btCompoundShape_addChildShape_2 = function () {
      return (si = b._emscripten_bind_btCompoundShape_addChildShape_2 = b.asm.rg).apply(null, arguments);
    };
    var ti = b._emscripten_bind_btCompoundShape_removeChildShape_1 = function () {
      return (ti = b._emscripten_bind_btCompoundShape_removeChildShape_1 = b.asm.sg).apply(null, arguments);
    };
    var ui = b._emscripten_bind_btCompoundShape_removeChildShapeByIndex_1 = function () {
      return (ui = b._emscripten_bind_btCompoundShape_removeChildShapeByIndex_1 = b.asm.tg).apply(null, arguments);
    };
    var vi = b._emscripten_bind_btCompoundShape_getNumChildShapes_0 = function () {
      return (vi = b._emscripten_bind_btCompoundShape_getNumChildShapes_0 = b.asm.ug).apply(null, arguments);
    };
    var wi = b._emscripten_bind_btCompoundShape_getChildShape_1 = function () {
      return (wi = b._emscripten_bind_btCompoundShape_getChildShape_1 = b.asm.vg).apply(null, arguments);
    };
    var xi = b._emscripten_bind_btCompoundShape_updateChildTransform_2 = function () {
      return (xi = b._emscripten_bind_btCompoundShape_updateChildTransform_2 = b.asm.wg).apply(null, arguments);
    };
    var yi = b._emscripten_bind_btCompoundShape_updateChildTransform_3 = function () {
      return (yi = b._emscripten_bind_btCompoundShape_updateChildTransform_3 = b.asm.xg).apply(null, arguments);
    };
    var zi = b._emscripten_bind_btCompoundShape_setMargin_1 = function () {
      return (zi = b._emscripten_bind_btCompoundShape_setMargin_1 = b.asm.yg).apply(null, arguments);
    };
    var Ai = b._emscripten_bind_btCompoundShape_getMargin_0 = function () {
      return (Ai = b._emscripten_bind_btCompoundShape_getMargin_0 = b.asm.zg).apply(null, arguments);
    };
    var Bi = b._emscripten_bind_btCompoundShape_setLocalScaling_1 = function () {
      return (Bi = b._emscripten_bind_btCompoundShape_setLocalScaling_1 = b.asm.Ag).apply(null, arguments);
    };
    var Ci = b._emscripten_bind_btCompoundShape_getLocalScaling_0 = function () {
      return (Ci = b._emscripten_bind_btCompoundShape_getLocalScaling_0 = b.asm.Bg).apply(null, arguments);
    };
    var Di = b._emscripten_bind_btCompoundShape_calculateLocalInertia_2 = function () {
      return (Di = b._emscripten_bind_btCompoundShape_calculateLocalInertia_2 = b.asm.Cg).apply(null, arguments);
    };
    var Ei = b._emscripten_bind_btCompoundShape___destroy___0 = function () {
      return (Ei = b._emscripten_bind_btCompoundShape___destroy___0 = b.asm.Dg).apply(null, arguments);
    };
    var Fi = b._emscripten_bind_ClosestConvexResultCallback_ClosestConvexResultCallback_2 = function () {
      return (Fi = b._emscripten_bind_ClosestConvexResultCallback_ClosestConvexResultCallback_2 = b.asm.Eg).apply(null, arguments);
    };
    var Gi = b._emscripten_bind_ClosestConvexResultCallback_hasHit_0 = function () {
      return (Gi = b._emscripten_bind_ClosestConvexResultCallback_hasHit_0 = b.asm.Fg).apply(null, arguments);
    };
    var Hi = b._emscripten_bind_ClosestConvexResultCallback_get_m_convexFromWorld_0 = function () {
      return (Hi = b._emscripten_bind_ClosestConvexResultCallback_get_m_convexFromWorld_0 = b.asm.Gg).apply(null, arguments);
    };
    var Ii = b._emscripten_bind_ClosestConvexResultCallback_set_m_convexFromWorld_1 = function () {
      return (Ii = b._emscripten_bind_ClosestConvexResultCallback_set_m_convexFromWorld_1 = b.asm.Hg).apply(null, arguments);
    };
    var Ji = b._emscripten_bind_ClosestConvexResultCallback_get_m_convexToWorld_0 = function () {
      return (Ji = b._emscripten_bind_ClosestConvexResultCallback_get_m_convexToWorld_0 = b.asm.Ig).apply(null, arguments);
    };
    var Ki = b._emscripten_bind_ClosestConvexResultCallback_set_m_convexToWorld_1 = function () {
      return (Ki = b._emscripten_bind_ClosestConvexResultCallback_set_m_convexToWorld_1 = b.asm.Jg).apply(null, arguments);
    };
    var Li = b._emscripten_bind_ClosestConvexResultCallback_get_m_hitNormalWorld_0 = function () {
      return (Li = b._emscripten_bind_ClosestConvexResultCallback_get_m_hitNormalWorld_0 = b.asm.Kg).apply(null, arguments);
    };
    var Mi = b._emscripten_bind_ClosestConvexResultCallback_set_m_hitNormalWorld_1 = function () {
      return (Mi = b._emscripten_bind_ClosestConvexResultCallback_set_m_hitNormalWorld_1 = b.asm.Lg).apply(null, arguments);
    };
    var Ni = b._emscripten_bind_ClosestConvexResultCallback_get_m_hitPointWorld_0 = function () {
      return (Ni = b._emscripten_bind_ClosestConvexResultCallback_get_m_hitPointWorld_0 = b.asm.Mg).apply(null, arguments);
    };
    var Oi = b._emscripten_bind_ClosestConvexResultCallback_set_m_hitPointWorld_1 = function () {
      return (Oi = b._emscripten_bind_ClosestConvexResultCallback_set_m_hitPointWorld_1 = b.asm.Ng).apply(null, arguments);
    };
    var Pi = b._emscripten_bind_ClosestConvexResultCallback_get_m_collisionFilterGroup_0 = function () {
      return (Pi = b._emscripten_bind_ClosestConvexResultCallback_get_m_collisionFilterGroup_0 = b.asm.Og).apply(null, arguments);
    };
    var Qi = b._emscripten_bind_ClosestConvexResultCallback_set_m_collisionFilterGroup_1 = function () {
      return (Qi = b._emscripten_bind_ClosestConvexResultCallback_set_m_collisionFilterGroup_1 = b.asm.Pg).apply(null, arguments);
    };
    var Ri = b._emscripten_bind_ClosestConvexResultCallback_get_m_collisionFilterMask_0 = function () {
      return (Ri = b._emscripten_bind_ClosestConvexResultCallback_get_m_collisionFilterMask_0 = b.asm.Qg).apply(null, arguments);
    };
    var Si = b._emscripten_bind_ClosestConvexResultCallback_set_m_collisionFilterMask_1 = function () {
      return (Si = b._emscripten_bind_ClosestConvexResultCallback_set_m_collisionFilterMask_1 = b.asm.Rg).apply(null, arguments);
    };
    var Ti = b._emscripten_bind_ClosestConvexResultCallback_get_m_closestHitFraction_0 = function () {
      return (Ti = b._emscripten_bind_ClosestConvexResultCallback_get_m_closestHitFraction_0 = b.asm.Sg).apply(null, arguments);
    };
    var Ui = b._emscripten_bind_ClosestConvexResultCallback_set_m_closestHitFraction_1 = function () {
      return (Ui = b._emscripten_bind_ClosestConvexResultCallback_set_m_closestHitFraction_1 = b.asm.Tg).apply(null, arguments);
    };
    var Vi = b._emscripten_bind_ClosestConvexResultCallback___destroy___0 = function () {
      return (Vi = b._emscripten_bind_ClosestConvexResultCallback___destroy___0 = b.asm.Ug).apply(null, arguments);
    };
    var Wi = b._emscripten_bind_AllHitsRayResultCallback_AllHitsRayResultCallback_2 = function () {
      return (Wi = b._emscripten_bind_AllHitsRayResultCallback_AllHitsRayResultCallback_2 = b.asm.Vg).apply(null, arguments);
    };
    var Xi = b._emscripten_bind_AllHitsRayResultCallback_hasHit_0 = function () {
      return (Xi = b._emscripten_bind_AllHitsRayResultCallback_hasHit_0 = b.asm.Wg).apply(null, arguments);
    };
    var Yi = b._emscripten_bind_AllHitsRayResultCallback_get_m_collisionObjects_0 = function () {
      return (Yi = b._emscripten_bind_AllHitsRayResultCallback_get_m_collisionObjects_0 = b.asm.Xg).apply(null, arguments);
    };
    var Zi = b._emscripten_bind_AllHitsRayResultCallback_set_m_collisionObjects_1 = function () {
      return (Zi = b._emscripten_bind_AllHitsRayResultCallback_set_m_collisionObjects_1 = b.asm.Yg).apply(null, arguments);
    };
    var $i = b._emscripten_bind_AllHitsRayResultCallback_get_m_rayFromWorld_0 = function () {
      return ($i = b._emscripten_bind_AllHitsRayResultCallback_get_m_rayFromWorld_0 = b.asm.Zg).apply(null, arguments);
    };
    var aj = b._emscripten_bind_AllHitsRayResultCallback_set_m_rayFromWorld_1 = function () {
      return (aj = b._emscripten_bind_AllHitsRayResultCallback_set_m_rayFromWorld_1 = b.asm._g).apply(null, arguments);
    };
    var bj = b._emscripten_bind_AllHitsRayResultCallback_get_m_rayToWorld_0 = function () {
      return (bj = b._emscripten_bind_AllHitsRayResultCallback_get_m_rayToWorld_0 = b.asm.$g).apply(null, arguments);
    };
    var cj = b._emscripten_bind_AllHitsRayResultCallback_set_m_rayToWorld_1 = function () {
      return (cj = b._emscripten_bind_AllHitsRayResultCallback_set_m_rayToWorld_1 = b.asm.ah).apply(null, arguments);
    };
    var dj = b._emscripten_bind_AllHitsRayResultCallback_get_m_hitNormalWorld_0 = function () {
      return (dj = b._emscripten_bind_AllHitsRayResultCallback_get_m_hitNormalWorld_0 = b.asm.bh).apply(null, arguments);
    };
    var ej = b._emscripten_bind_AllHitsRayResultCallback_set_m_hitNormalWorld_1 = function () {
      return (ej = b._emscripten_bind_AllHitsRayResultCallback_set_m_hitNormalWorld_1 = b.asm.ch).apply(null, arguments);
    };
    var fj = b._emscripten_bind_AllHitsRayResultCallback_get_m_hitPointWorld_0 = function () {
      return (fj = b._emscripten_bind_AllHitsRayResultCallback_get_m_hitPointWorld_0 = b.asm.dh).apply(null, arguments);
    };
    var gj = b._emscripten_bind_AllHitsRayResultCallback_set_m_hitPointWorld_1 = function () {
      return (gj = b._emscripten_bind_AllHitsRayResultCallback_set_m_hitPointWorld_1 = b.asm.eh).apply(null, arguments);
    };
    var hj = b._emscripten_bind_AllHitsRayResultCallback_get_m_hitFractions_0 = function () {
      return (hj = b._emscripten_bind_AllHitsRayResultCallback_get_m_hitFractions_0 = b.asm.fh).apply(null, arguments);
    };
    var ij = b._emscripten_bind_AllHitsRayResultCallback_set_m_hitFractions_1 = function () {
      return (ij = b._emscripten_bind_AllHitsRayResultCallback_set_m_hitFractions_1 = b.asm.gh).apply(null, arguments);
    };
    var jj = b._emscripten_bind_AllHitsRayResultCallback_get_m_collisionFilterGroup_0 = function () {
      return (jj = b._emscripten_bind_AllHitsRayResultCallback_get_m_collisionFilterGroup_0 = b.asm.hh).apply(null, arguments);
    };
    var kj = b._emscripten_bind_AllHitsRayResultCallback_set_m_collisionFilterGroup_1 = function () {
      return (kj = b._emscripten_bind_AllHitsRayResultCallback_set_m_collisionFilterGroup_1 = b.asm.ih).apply(null, arguments);
    };
    var lj = b._emscripten_bind_AllHitsRayResultCallback_get_m_collisionFilterMask_0 = function () {
      return (lj = b._emscripten_bind_AllHitsRayResultCallback_get_m_collisionFilterMask_0 = b.asm.jh).apply(null, arguments);
    };
    var mj = b._emscripten_bind_AllHitsRayResultCallback_set_m_collisionFilterMask_1 = function () {
      return (mj = b._emscripten_bind_AllHitsRayResultCallback_set_m_collisionFilterMask_1 = b.asm.kh).apply(null, arguments);
    };
    var nj = b._emscripten_bind_AllHitsRayResultCallback_get_m_closestHitFraction_0 = function () {
      return (nj = b._emscripten_bind_AllHitsRayResultCallback_get_m_closestHitFraction_0 = b.asm.lh).apply(null, arguments);
    };
    var oj = b._emscripten_bind_AllHitsRayResultCallback_set_m_closestHitFraction_1 = function () {
      return (oj = b._emscripten_bind_AllHitsRayResultCallback_set_m_closestHitFraction_1 = b.asm.mh).apply(null, arguments);
    };
    var pj = b._emscripten_bind_AllHitsRayResultCallback_get_m_collisionObject_0 = function () {
      return (pj = b._emscripten_bind_AllHitsRayResultCallback_get_m_collisionObject_0 = b.asm.nh).apply(null, arguments);
    };
    var qj = b._emscripten_bind_AllHitsRayResultCallback_set_m_collisionObject_1 = function () {
      return (qj = b._emscripten_bind_AllHitsRayResultCallback_set_m_collisionObject_1 = b.asm.oh).apply(null, arguments);
    };
    var rj = b._emscripten_bind_AllHitsRayResultCallback___destroy___0 = function () {
      return (rj = b._emscripten_bind_AllHitsRayResultCallback___destroy___0 = b.asm.ph).apply(null, arguments);
    };
    var sj = b._emscripten_bind_tMaterialArray_size_0 = function () {
      return (sj = b._emscripten_bind_tMaterialArray_size_0 = b.asm.qh).apply(null, arguments);
    };
    var tj = b._emscripten_bind_tMaterialArray_at_1 = function () {
      return (tj = b._emscripten_bind_tMaterialArray_at_1 = b.asm.rh).apply(null, arguments);
    };
    var uj = b._emscripten_bind_tMaterialArray___destroy___0 = function () {
      return (uj = b._emscripten_bind_tMaterialArray___destroy___0 = b.asm.sh).apply(null, arguments);
    };
    var vj = b._emscripten_bind_btDefaultVehicleRaycaster_btDefaultVehicleRaycaster_1 = function () {
      return (vj = b._emscripten_bind_btDefaultVehicleRaycaster_btDefaultVehicleRaycaster_1 = b.asm.th).apply(null, arguments);
    };
    var wj = b._emscripten_bind_btDefaultVehicleRaycaster_castRay_3 = function () {
      return (wj = b._emscripten_bind_btDefaultVehicleRaycaster_castRay_3 = b.asm.uh).apply(null, arguments);
    };
    var xj = b._emscripten_bind_btDefaultVehicleRaycaster___destroy___0 = function () {
      return (xj = b._emscripten_bind_btDefaultVehicleRaycaster___destroy___0 = b.asm.vh).apply(null, arguments);
    };
    var yj = b._emscripten_bind_btEmptyShape_btEmptyShape_0 = function () {
      return (yj = b._emscripten_bind_btEmptyShape_btEmptyShape_0 = b.asm.wh).apply(null, arguments);
    };
    var zj = b._emscripten_bind_btEmptyShape_setLocalScaling_1 = function () {
      return (zj = b._emscripten_bind_btEmptyShape_setLocalScaling_1 = b.asm.xh).apply(null, arguments);
    };
    var Aj = b._emscripten_bind_btEmptyShape_getLocalScaling_0 = function () {
      return (Aj = b._emscripten_bind_btEmptyShape_getLocalScaling_0 = b.asm.yh).apply(null, arguments);
    };
    var Bj = b._emscripten_bind_btEmptyShape_calculateLocalInertia_2 = function () {
      return (Bj = b._emscripten_bind_btEmptyShape_calculateLocalInertia_2 = b.asm.zh).apply(null, arguments);
    };
    var Cj = b._emscripten_bind_btEmptyShape___destroy___0 = function () {
      return (Cj = b._emscripten_bind_btEmptyShape___destroy___0 = b.asm.Ah).apply(null, arguments);
    };
    var Dj = b._emscripten_bind_btConstraintSetting_btConstraintSetting_0 = function () {
      return (Dj = b._emscripten_bind_btConstraintSetting_btConstraintSetting_0 = b.asm.Bh).apply(null, arguments);
    };
    var Ej = b._emscripten_bind_btConstraintSetting_get_m_tau_0 = function () {
      return (Ej = b._emscripten_bind_btConstraintSetting_get_m_tau_0 = b.asm.Ch).apply(null, arguments);
    };
    var Fj = b._emscripten_bind_btConstraintSetting_set_m_tau_1 = function () {
      return (Fj = b._emscripten_bind_btConstraintSetting_set_m_tau_1 = b.asm.Dh).apply(null, arguments);
    };
    var Gj = b._emscripten_bind_btConstraintSetting_get_m_damping_0 = function () {
      return (Gj = b._emscripten_bind_btConstraintSetting_get_m_damping_0 = b.asm.Eh).apply(null, arguments);
    };
    var Hj = b._emscripten_bind_btConstraintSetting_set_m_damping_1 = function () {
      return (Hj = b._emscripten_bind_btConstraintSetting_set_m_damping_1 = b.asm.Fh).apply(null, arguments);
    };
    var Ij = b._emscripten_bind_btConstraintSetting_get_m_impulseClamp_0 = function () {
      return (Ij = b._emscripten_bind_btConstraintSetting_get_m_impulseClamp_0 = b.asm.Gh).apply(null, arguments);
    };
    var Jj = b._emscripten_bind_btConstraintSetting_set_m_impulseClamp_1 = function () {
      return (Jj = b._emscripten_bind_btConstraintSetting_set_m_impulseClamp_1 = b.asm.Hh).apply(null, arguments);
    };
    var Kj = b._emscripten_bind_btConstraintSetting___destroy___0 = function () {
      return (Kj = b._emscripten_bind_btConstraintSetting___destroy___0 = b.asm.Ih).apply(null, arguments);
    };
    var Lj = b._emscripten_bind_LocalShapeInfo_get_m_shapePart_0 = function () {
      return (Lj = b._emscripten_bind_LocalShapeInfo_get_m_shapePart_0 = b.asm.Jh).apply(null, arguments);
    };
    var Mj = b._emscripten_bind_LocalShapeInfo_set_m_shapePart_1 = function () {
      return (Mj = b._emscripten_bind_LocalShapeInfo_set_m_shapePart_1 = b.asm.Kh).apply(null, arguments);
    };
    var Nj = b._emscripten_bind_LocalShapeInfo_get_m_triangleIndex_0 = function () {
      return (Nj = b._emscripten_bind_LocalShapeInfo_get_m_triangleIndex_0 = b.asm.Lh).apply(null, arguments);
    };
    var Oj = b._emscripten_bind_LocalShapeInfo_set_m_triangleIndex_1 = function () {
      return (Oj = b._emscripten_bind_LocalShapeInfo_set_m_triangleIndex_1 = b.asm.Mh).apply(null, arguments);
    };
    var Pj = b._emscripten_bind_LocalShapeInfo___destroy___0 = function () {
      return (Pj = b._emscripten_bind_LocalShapeInfo___destroy___0 = b.asm.Nh).apply(null, arguments);
    };
    var Qj = b._emscripten_bind_btRigidBody_btRigidBody_1 = function () {
      return (Qj = b._emscripten_bind_btRigidBody_btRigidBody_1 = b.asm.Oh).apply(null, arguments);
    };
    var Rj = b._emscripten_bind_btRigidBody_getCenterOfMassTransform_0 = function () {
      return (Rj = b._emscripten_bind_btRigidBody_getCenterOfMassTransform_0 = b.asm.Ph).apply(null, arguments);
    };
    var Sj = b._emscripten_bind_btRigidBody_setCenterOfMassTransform_1 = function () {
      return (Sj = b._emscripten_bind_btRigidBody_setCenterOfMassTransform_1 = b.asm.Qh).apply(null, arguments);
    };
    var Tj = b._emscripten_bind_btRigidBody_setSleepingThresholds_2 = function () {
      return (Tj = b._emscripten_bind_btRigidBody_setSleepingThresholds_2 = b.asm.Rh).apply(null, arguments);
    };
    var Uj = b._emscripten_bind_btRigidBody_getLinearDamping_0 = function () {
      return (Uj = b._emscripten_bind_btRigidBody_getLinearDamping_0 = b.asm.Sh).apply(null, arguments);
    };
    var Vj = b._emscripten_bind_btRigidBody_getAngularDamping_0 = function () {
      return (Vj = b._emscripten_bind_btRigidBody_getAngularDamping_0 = b.asm.Th).apply(null, arguments);
    };
    var Wj = b._emscripten_bind_btRigidBody_setDamping_2 = function () {
      return (Wj = b._emscripten_bind_btRigidBody_setDamping_2 = b.asm.Uh).apply(null, arguments);
    };
    var Xj = b._emscripten_bind_btRigidBody_setMassProps_2 = function () {
      return (Xj = b._emscripten_bind_btRigidBody_setMassProps_2 = b.asm.Vh).apply(null, arguments);
    };
    var Yj = b._emscripten_bind_btRigidBody_getLinearFactor_0 = function () {
      return (Yj = b._emscripten_bind_btRigidBody_getLinearFactor_0 = b.asm.Wh).apply(null, arguments);
    };
    var Zj = b._emscripten_bind_btRigidBody_setLinearFactor_1 = function () {
      return (Zj = b._emscripten_bind_btRigidBody_setLinearFactor_1 = b.asm.Xh).apply(null, arguments);
    };
    var ak = b._emscripten_bind_btRigidBody_applyTorque_1 = function () {
      return (ak = b._emscripten_bind_btRigidBody_applyTorque_1 = b.asm.Yh).apply(null, arguments);
    };
    var bk = b._emscripten_bind_btRigidBody_applyLocalTorque_1 = function () {
      return (bk = b._emscripten_bind_btRigidBody_applyLocalTorque_1 = b.asm.Zh).apply(null, arguments);
    };
    var ck = b._emscripten_bind_btRigidBody_applyForce_2 = function () {
      return (ck = b._emscripten_bind_btRigidBody_applyForce_2 = b.asm._h).apply(null, arguments);
    };
    var dk = b._emscripten_bind_btRigidBody_applyCentralForce_1 = function () {
      return (dk = b._emscripten_bind_btRigidBody_applyCentralForce_1 = b.asm.$h).apply(null, arguments);
    };
    var ek = b._emscripten_bind_btRigidBody_applyCentralLocalForce_1 = function () {
      return (ek = b._emscripten_bind_btRigidBody_applyCentralLocalForce_1 = b.asm.ai).apply(null, arguments);
    };
    var fk = b._emscripten_bind_btRigidBody_applyTorqueImpulse_1 = function () {
      return (fk = b._emscripten_bind_btRigidBody_applyTorqueImpulse_1 = b.asm.bi).apply(null, arguments);
    };
    var gk = b._emscripten_bind_btRigidBody_applyImpulse_2 = function () {
      return (gk = b._emscripten_bind_btRigidBody_applyImpulse_2 = b.asm.ci).apply(null, arguments);
    };
    var hk = b._emscripten_bind_btRigidBody_applyCentralImpulse_1 = function () {
      return (hk = b._emscripten_bind_btRigidBody_applyCentralImpulse_1 = b.asm.di).apply(null, arguments);
    };
    var ik = b._emscripten_bind_btRigidBody_updateInertiaTensor_0 = function () {
      return (ik = b._emscripten_bind_btRigidBody_updateInertiaTensor_0 = b.asm.ei).apply(null, arguments);
    };
    var jk = b._emscripten_bind_btRigidBody_getLinearVelocity_0 = function () {
      return (jk = b._emscripten_bind_btRigidBody_getLinearVelocity_0 = b.asm.fi).apply(null, arguments);
    };
    var kk = b._emscripten_bind_btRigidBody_getAngularVelocity_0 = function () {
      return (kk = b._emscripten_bind_btRigidBody_getAngularVelocity_0 = b.asm.gi).apply(null, arguments);
    };
    var lk = b._emscripten_bind_btRigidBody_setLinearVelocity_1 = function () {
      return (lk = b._emscripten_bind_btRigidBody_setLinearVelocity_1 = b.asm.hi).apply(null, arguments);
    };
    var mk = b._emscripten_bind_btRigidBody_setAngularVelocity_1 = function () {
      return (mk = b._emscripten_bind_btRigidBody_setAngularVelocity_1 = b.asm.ii).apply(null, arguments);
    };
    var nk = b._emscripten_bind_btRigidBody_getMotionState_0 = function () {
      return (nk = b._emscripten_bind_btRigidBody_getMotionState_0 = b.asm.ji).apply(null, arguments);
    };
    var ok = b._emscripten_bind_btRigidBody_setMotionState_1 = function () {
      return (ok = b._emscripten_bind_btRigidBody_setMotionState_1 = b.asm.ki).apply(null, arguments);
    };
    var pk = b._emscripten_bind_btRigidBody_getAngularFactor_0 = function () {
      return (pk = b._emscripten_bind_btRigidBody_getAngularFactor_0 = b.asm.li).apply(null, arguments);
    };
    var qk = b._emscripten_bind_btRigidBody_setAngularFactor_1 = function () {
      return (qk = b._emscripten_bind_btRigidBody_setAngularFactor_1 = b.asm.mi).apply(null, arguments);
    };
    var rk = b._emscripten_bind_btRigidBody_upcast_1 = function () {
      return (rk = b._emscripten_bind_btRigidBody_upcast_1 = b.asm.ni).apply(null, arguments);
    };
    var sk = b._emscripten_bind_btRigidBody_getAabb_2 = function () {
      return (sk = b._emscripten_bind_btRigidBody_getAabb_2 = b.asm.oi).apply(null, arguments);
    };
    var tk = b._emscripten_bind_btRigidBody_applyGravity_0 = function () {
      return (tk = b._emscripten_bind_btRigidBody_applyGravity_0 = b.asm.pi).apply(null, arguments);
    };
    var uk = b._emscripten_bind_btRigidBody_getGravity_0 = function () {
      return (uk = b._emscripten_bind_btRigidBody_getGravity_0 = b.asm.qi).apply(null, arguments);
    };
    var vk = b._emscripten_bind_btRigidBody_setGravity_1 = function () {
      return (vk = b._emscripten_bind_btRigidBody_setGravity_1 = b.asm.ri).apply(null, arguments);
    };
    var wk = b._emscripten_bind_btRigidBody_getBroadphaseProxy_0 = function () {
      return (wk = b._emscripten_bind_btRigidBody_getBroadphaseProxy_0 = b.asm.si).apply(null, arguments);
    };
    var xk = b._emscripten_bind_btRigidBody_clearForces_0 = function () {
      return (xk = b._emscripten_bind_btRigidBody_clearForces_0 = b.asm.ti).apply(null, arguments);
    };
    var yk = b._emscripten_bind_btRigidBody_setAnisotropicFriction_2 = function () {
      return (yk = b._emscripten_bind_btRigidBody_setAnisotropicFriction_2 = b.asm.ui).apply(null, arguments);
    };
    var zk = b._emscripten_bind_btRigidBody_getCollisionShape_0 = function () {
      return (zk = b._emscripten_bind_btRigidBody_getCollisionShape_0 = b.asm.vi).apply(null, arguments);
    };
    var Ak = b._emscripten_bind_btRigidBody_setContactProcessingThreshold_1 = function () {
      return (Ak = b._emscripten_bind_btRigidBody_setContactProcessingThreshold_1 = b.asm.wi).apply(null, arguments);
    };
    var Bk = b._emscripten_bind_btRigidBody_setActivationState_1 = function () {
      return (Bk = b._emscripten_bind_btRigidBody_setActivationState_1 = b.asm.xi).apply(null, arguments);
    };
    var Ck = b._emscripten_bind_btRigidBody_forceActivationState_1 = function () {
      return (Ck = b._emscripten_bind_btRigidBody_forceActivationState_1 = b.asm.yi).apply(null, arguments);
    };
    var Dk = b._emscripten_bind_btRigidBody_activate_0 = function () {
      return (Dk = b._emscripten_bind_btRigidBody_activate_0 = b.asm.zi).apply(null, arguments);
    };
    var Ek = b._emscripten_bind_btRigidBody_activate_1 = function () {
      return (Ek = b._emscripten_bind_btRigidBody_activate_1 = b.asm.Ai).apply(null, arguments);
    };
    var Fk = b._emscripten_bind_btRigidBody_isActive_0 = function () {
      return (Fk = b._emscripten_bind_btRigidBody_isActive_0 = b.asm.Bi).apply(null, arguments);
    };
    var Gk = b._emscripten_bind_btRigidBody_isKinematicObject_0 = function () {
      return (Gk = b._emscripten_bind_btRigidBody_isKinematicObject_0 = b.asm.Ci).apply(null, arguments);
    };
    var Hk = b._emscripten_bind_btRigidBody_isStaticObject_0 = function () {
      return (Hk = b._emscripten_bind_btRigidBody_isStaticObject_0 = b.asm.Di).apply(null, arguments);
    };
    var Ik = b._emscripten_bind_btRigidBody_isStaticOrKinematicObject_0 = function () {
      return (Ik = b._emscripten_bind_btRigidBody_isStaticOrKinematicObject_0 = b.asm.Ei).apply(null, arguments);
    };
    var Jk = b._emscripten_bind_btRigidBody_getRestitution_0 = function () {
      return (Jk = b._emscripten_bind_btRigidBody_getRestitution_0 = b.asm.Fi).apply(null, arguments);
    };
    var Kk = b._emscripten_bind_btRigidBody_getFriction_0 = function () {
      return (Kk = b._emscripten_bind_btRigidBody_getFriction_0 = b.asm.Gi).apply(null, arguments);
    };
    var Lk = b._emscripten_bind_btRigidBody_getRollingFriction_0 = function () {
      return (Lk = b._emscripten_bind_btRigidBody_getRollingFriction_0 = b.asm.Hi).apply(null, arguments);
    };
    var Mk = b._emscripten_bind_btRigidBody_setRestitution_1 = function () {
      return (Mk = b._emscripten_bind_btRigidBody_setRestitution_1 = b.asm.Ii).apply(null, arguments);
    };
    var Nk = b._emscripten_bind_btRigidBody_setFriction_1 = function () {
      return (Nk = b._emscripten_bind_btRigidBody_setFriction_1 = b.asm.Ji).apply(null, arguments);
    };
    var Ok = b._emscripten_bind_btRigidBody_setRollingFriction_1 = function () {
      return (Ok = b._emscripten_bind_btRigidBody_setRollingFriction_1 = b.asm.Ki).apply(null, arguments);
    };
    var Pk = b._emscripten_bind_btRigidBody_getWorldTransform_0 = function () {
      return (Pk = b._emscripten_bind_btRigidBody_getWorldTransform_0 = b.asm.Li).apply(null, arguments);
    };
    var Qk = b._emscripten_bind_btRigidBody_getCollisionFlags_0 = function () {
      return (Qk = b._emscripten_bind_btRigidBody_getCollisionFlags_0 = b.asm.Mi).apply(null, arguments);
    };
    var Rk = b._emscripten_bind_btRigidBody_setCollisionFlags_1 = function () {
      return (Rk = b._emscripten_bind_btRigidBody_setCollisionFlags_1 = b.asm.Ni).apply(null, arguments);
    };
    var Sk = b._emscripten_bind_btRigidBody_setWorldTransform_1 = function () {
      return (Sk = b._emscripten_bind_btRigidBody_setWorldTransform_1 = b.asm.Oi).apply(null, arguments);
    };
    var Tk = b._emscripten_bind_btRigidBody_setCollisionShape_1 = function () {
      return (Tk = b._emscripten_bind_btRigidBody_setCollisionShape_1 = b.asm.Pi).apply(null, arguments);
    };
    var Uk = b._emscripten_bind_btRigidBody_setCcdMotionThreshold_1 = function () {
      return (Uk = b._emscripten_bind_btRigidBody_setCcdMotionThreshold_1 = b.asm.Qi).apply(null, arguments);
    };
    var Vk = b._emscripten_bind_btRigidBody_setCcdSweptSphereRadius_1 = function () {
      return (Vk = b._emscripten_bind_btRigidBody_setCcdSweptSphereRadius_1 = b.asm.Ri).apply(null, arguments);
    };
    var Wk = b._emscripten_bind_btRigidBody_getUserIndex_0 = function () {
      return (Wk = b._emscripten_bind_btRigidBody_getUserIndex_0 = b.asm.Si).apply(null, arguments);
    };
    var Xk = b._emscripten_bind_btRigidBody_setUserIndex_1 = function () {
      return (Xk = b._emscripten_bind_btRigidBody_setUserIndex_1 = b.asm.Ti).apply(null, arguments);
    };
    var Yk = b._emscripten_bind_btRigidBody_getUserPointer_0 = function () {
      return (Yk = b._emscripten_bind_btRigidBody_getUserPointer_0 = b.asm.Ui).apply(null, arguments);
    };
    var Zk = b._emscripten_bind_btRigidBody_setUserPointer_1 = function () {
      return (Zk = b._emscripten_bind_btRigidBody_setUserPointer_1 = b.asm.Vi).apply(null, arguments);
    };
    var $k = b._emscripten_bind_btRigidBody_getBroadphaseHandle_0 = function () {
      return ($k = b._emscripten_bind_btRigidBody_getBroadphaseHandle_0 = b.asm.Wi).apply(null, arguments);
    };
    var al = b._emscripten_bind_btRigidBody___destroy___0 = function () {
      return (al = b._emscripten_bind_btRigidBody___destroy___0 = b.asm.Xi).apply(null, arguments);
    };
    var bl = b._emscripten_bind_btIndexedMeshArray_size_0 = function () {
      return (bl = b._emscripten_bind_btIndexedMeshArray_size_0 = b.asm.Yi).apply(null, arguments);
    };
    var cl = b._emscripten_bind_btIndexedMeshArray_at_1 = function () {
      return (cl = b._emscripten_bind_btIndexedMeshArray_at_1 = b.asm.Zi).apply(null, arguments);
    };
    var dl = b._emscripten_bind_btIndexedMeshArray___destroy___0 = function () {
      return (dl = b._emscripten_bind_btIndexedMeshArray___destroy___0 = b.asm._i).apply(null, arguments);
    };
    var el = b._emscripten_bind_btDbvtBroadphase_btDbvtBroadphase_0 = function () {
      return (el = b._emscripten_bind_btDbvtBroadphase_btDbvtBroadphase_0 = b.asm.$i).apply(null, arguments);
    };
    var fl = b._emscripten_bind_btDbvtBroadphase___destroy___0 = function () {
      return (fl = b._emscripten_bind_btDbvtBroadphase___destroy___0 = b.asm.aj).apply(null, arguments);
    };
    var gl = b._emscripten_bind_btHeightfieldTerrainShape_btHeightfieldTerrainShape_9 = function () {
      return (gl = b._emscripten_bind_btHeightfieldTerrainShape_btHeightfieldTerrainShape_9 = b.asm.bj).apply(null, arguments);
    };
    var hl = b._emscripten_bind_btHeightfieldTerrainShape_setMargin_1 = function () {
      return (hl = b._emscripten_bind_btHeightfieldTerrainShape_setMargin_1 = b.asm.cj).apply(null, arguments);
    };
    var il = b._emscripten_bind_btHeightfieldTerrainShape_getMargin_0 = function () {
      return (il = b._emscripten_bind_btHeightfieldTerrainShape_getMargin_0 = b.asm.dj).apply(null, arguments);
    };
    var jl = b._emscripten_bind_btHeightfieldTerrainShape_setLocalScaling_1 = function () {
      return (jl = b._emscripten_bind_btHeightfieldTerrainShape_setLocalScaling_1 = b.asm.ej).apply(null, arguments);
    };
    var kl = b._emscripten_bind_btHeightfieldTerrainShape_getLocalScaling_0 = function () {
      return (kl = b._emscripten_bind_btHeightfieldTerrainShape_getLocalScaling_0 = b.asm.fj).apply(null, arguments);
    };
    var ll = b._emscripten_bind_btHeightfieldTerrainShape_calculateLocalInertia_2 = function () {
      return (ll = b._emscripten_bind_btHeightfieldTerrainShape_calculateLocalInertia_2 = b.asm.gj).apply(null, arguments);
    };
    var ml = b._emscripten_bind_btHeightfieldTerrainShape___destroy___0 = function () {
      return (ml = b._emscripten_bind_btHeightfieldTerrainShape___destroy___0 = b.asm.hj).apply(null, arguments);
    };
    var nl = b._emscripten_bind_btDefaultSoftBodySolver_btDefaultSoftBodySolver_0 = function () {
      return (nl = b._emscripten_bind_btDefaultSoftBodySolver_btDefaultSoftBodySolver_0 = b.asm.ij).apply(null, arguments);
    };
    var ol = b._emscripten_bind_btDefaultSoftBodySolver___destroy___0 = function () {
      return (ol = b._emscripten_bind_btDefaultSoftBodySolver___destroy___0 = b.asm.jj).apply(null, arguments);
    };
    var pl = b._emscripten_bind_btCollisionDispatcher_btCollisionDispatcher_1 = function () {
      return (pl = b._emscripten_bind_btCollisionDispatcher_btCollisionDispatcher_1 = b.asm.kj).apply(null, arguments);
    };
    var ql = b._emscripten_bind_btCollisionDispatcher_getNumManifolds_0 = function () {
      return (ql = b._emscripten_bind_btCollisionDispatcher_getNumManifolds_0 = b.asm.lj).apply(null, arguments);
    };
    var rl = b._emscripten_bind_btCollisionDispatcher_getManifoldByIndexInternal_1 = function () {
      return (rl = b._emscripten_bind_btCollisionDispatcher_getManifoldByIndexInternal_1 = b.asm.mj).apply(null, arguments);
    };
    var sl = b._emscripten_bind_btCollisionDispatcher___destroy___0 = function () {
      return (sl = b._emscripten_bind_btCollisionDispatcher___destroy___0 = b.asm.nj).apply(null, arguments);
    };
    var tl = b._emscripten_bind_btAxisSweep3_btAxisSweep3_2 = function () {
      return (tl = b._emscripten_bind_btAxisSweep3_btAxisSweep3_2 = b.asm.oj).apply(null, arguments);
    };
    var ul = b._emscripten_bind_btAxisSweep3_btAxisSweep3_3 = function () {
      return (ul = b._emscripten_bind_btAxisSweep3_btAxisSweep3_3 = b.asm.pj).apply(null, arguments);
    };
    var vl = b._emscripten_bind_btAxisSweep3_btAxisSweep3_4 = function () {
      return (vl = b._emscripten_bind_btAxisSweep3_btAxisSweep3_4 = b.asm.qj).apply(null, arguments);
    };
    var wl = b._emscripten_bind_btAxisSweep3_btAxisSweep3_5 = function () {
      return (wl = b._emscripten_bind_btAxisSweep3_btAxisSweep3_5 = b.asm.rj).apply(null, arguments);
    };
    var xl = b._emscripten_bind_btAxisSweep3___destroy___0 = function () {
      return (xl = b._emscripten_bind_btAxisSweep3___destroy___0 = b.asm.sj).apply(null, arguments);
    };
    var yl = b._emscripten_bind_VoidPtr___destroy___0 = function () {
      return (yl = b._emscripten_bind_VoidPtr___destroy___0 = b.asm.tj).apply(null, arguments);
    };
    var zl = b._emscripten_bind_btSoftBodyWorldInfo_btSoftBodyWorldInfo_0 = function () {
      return (zl = b._emscripten_bind_btSoftBodyWorldInfo_btSoftBodyWorldInfo_0 = b.asm.uj).apply(null, arguments);
    };
    var Al = b._emscripten_bind_btSoftBodyWorldInfo_get_air_density_0 = function () {
      return (Al = b._emscripten_bind_btSoftBodyWorldInfo_get_air_density_0 = b.asm.vj).apply(null, arguments);
    };
    var Bl = b._emscripten_bind_btSoftBodyWorldInfo_set_air_density_1 = function () {
      return (Bl = b._emscripten_bind_btSoftBodyWorldInfo_set_air_density_1 = b.asm.wj).apply(null, arguments);
    };
    var Cl = b._emscripten_bind_btSoftBodyWorldInfo_get_water_density_0 = function () {
      return (Cl = b._emscripten_bind_btSoftBodyWorldInfo_get_water_density_0 = b.asm.xj).apply(null, arguments);
    };
    var Dl = b._emscripten_bind_btSoftBodyWorldInfo_set_water_density_1 = function () {
      return (Dl = b._emscripten_bind_btSoftBodyWorldInfo_set_water_density_1 = b.asm.yj).apply(null, arguments);
    };
    var El = b._emscripten_bind_btSoftBodyWorldInfo_get_water_offset_0 = function () {
      return (El = b._emscripten_bind_btSoftBodyWorldInfo_get_water_offset_0 = b.asm.zj).apply(null, arguments);
    };
    var Fl = b._emscripten_bind_btSoftBodyWorldInfo_set_water_offset_1 = function () {
      return (Fl = b._emscripten_bind_btSoftBodyWorldInfo_set_water_offset_1 = b.asm.Aj).apply(null, arguments);
    };
    var Gl = b._emscripten_bind_btSoftBodyWorldInfo_get_m_maxDisplacement_0 = function () {
      return (Gl = b._emscripten_bind_btSoftBodyWorldInfo_get_m_maxDisplacement_0 = b.asm.Bj).apply(null, arguments);
    };
    var Hl = b._emscripten_bind_btSoftBodyWorldInfo_set_m_maxDisplacement_1 = function () {
      return (Hl = b._emscripten_bind_btSoftBodyWorldInfo_set_m_maxDisplacement_1 = b.asm.Cj).apply(null, arguments);
    };
    var Il = b._emscripten_bind_btSoftBodyWorldInfo_get_water_normal_0 = function () {
      return (Il = b._emscripten_bind_btSoftBodyWorldInfo_get_water_normal_0 = b.asm.Dj).apply(null, arguments);
    };
    var Jl = b._emscripten_bind_btSoftBodyWorldInfo_set_water_normal_1 = function () {
      return (Jl = b._emscripten_bind_btSoftBodyWorldInfo_set_water_normal_1 = b.asm.Ej).apply(null, arguments);
    };
    var Kl = b._emscripten_bind_btSoftBodyWorldInfo_get_m_broadphase_0 = function () {
      return (Kl = b._emscripten_bind_btSoftBodyWorldInfo_get_m_broadphase_0 = b.asm.Fj).apply(null, arguments);
    };
    var Ll = b._emscripten_bind_btSoftBodyWorldInfo_set_m_broadphase_1 = function () {
      return (Ll = b._emscripten_bind_btSoftBodyWorldInfo_set_m_broadphase_1 = b.asm.Gj).apply(null, arguments);
    };
    var Ml = b._emscripten_bind_btSoftBodyWorldInfo_get_m_dispatcher_0 = function () {
      return (Ml = b._emscripten_bind_btSoftBodyWorldInfo_get_m_dispatcher_0 = b.asm.Hj).apply(null, arguments);
    };
    var Nl = b._emscripten_bind_btSoftBodyWorldInfo_set_m_dispatcher_1 = function () {
      return (Nl = b._emscripten_bind_btSoftBodyWorldInfo_set_m_dispatcher_1 = b.asm.Ij).apply(null, arguments);
    };
    var Ol = b._emscripten_bind_btSoftBodyWorldInfo_get_m_gravity_0 = function () {
      return (Ol = b._emscripten_bind_btSoftBodyWorldInfo_get_m_gravity_0 = b.asm.Jj).apply(null, arguments);
    };
    var Pl = b._emscripten_bind_btSoftBodyWorldInfo_set_m_gravity_1 = function () {
      return (Pl = b._emscripten_bind_btSoftBodyWorldInfo_set_m_gravity_1 = b.asm.Kj).apply(null, arguments);
    };
    var Ql = b._emscripten_bind_btSoftBodyWorldInfo___destroy___0 = function () {
      return (Ql = b._emscripten_bind_btSoftBodyWorldInfo___destroy___0 = b.asm.Lj).apply(null, arguments);
    };
    var Rl = b._emscripten_bind_btConeTwistConstraint_btConeTwistConstraint_2 = function () {
      return (Rl = b._emscripten_bind_btConeTwistConstraint_btConeTwistConstraint_2 = b.asm.Mj).apply(null, arguments);
    };
    var Sl = b._emscripten_bind_btConeTwistConstraint_btConeTwistConstraint_4 = function () {
      return (Sl = b._emscripten_bind_btConeTwistConstraint_btConeTwistConstraint_4 = b.asm.Nj).apply(null, arguments);
    };
    var Tl = b._emscripten_bind_btConeTwistConstraint_setLimit_2 = function () {
      return (Tl = b._emscripten_bind_btConeTwistConstraint_setLimit_2 = b.asm.Oj).apply(null, arguments);
    };
    var Ul = b._emscripten_bind_btConeTwistConstraint_setAngularOnly_1 = function () {
      return (Ul = b._emscripten_bind_btConeTwistConstraint_setAngularOnly_1 = b.asm.Pj).apply(null, arguments);
    };
    var Vl = b._emscripten_bind_btConeTwistConstraint_setDamping_1 = function () {
      return (Vl = b._emscripten_bind_btConeTwistConstraint_setDamping_1 = b.asm.Qj).apply(null, arguments);
    };
    var Wl = b._emscripten_bind_btConeTwistConstraint_enableMotor_1 = function () {
      return (Wl = b._emscripten_bind_btConeTwistConstraint_enableMotor_1 = b.asm.Rj).apply(null, arguments);
    };
    var Xl = b._emscripten_bind_btConeTwistConstraint_setMaxMotorImpulse_1 = function () {
      return (Xl = b._emscripten_bind_btConeTwistConstraint_setMaxMotorImpulse_1 = b.asm.Sj).apply(null, arguments);
    };
    var Yl = b._emscripten_bind_btConeTwistConstraint_setMaxMotorImpulseNormalized_1 = function () {
      return (Yl = b._emscripten_bind_btConeTwistConstraint_setMaxMotorImpulseNormalized_1 = b.asm.Tj).apply(null, arguments);
    };
    var Zl = b._emscripten_bind_btConeTwistConstraint_setMotorTarget_1 = function () {
      return (Zl = b._emscripten_bind_btConeTwistConstraint_setMotorTarget_1 = b.asm.Uj).apply(null, arguments);
    };
    var $l = b._emscripten_bind_btConeTwistConstraint_setMotorTargetInConstraintSpace_1 = function () {
      return ($l = b._emscripten_bind_btConeTwistConstraint_setMotorTargetInConstraintSpace_1 = b.asm.Vj).apply(null, arguments);
    };
    var am = b._emscripten_bind_btConeTwistConstraint_enableFeedback_1 = function () {
      return (am = b._emscripten_bind_btConeTwistConstraint_enableFeedback_1 = b.asm.Wj).apply(null, arguments);
    };
    var bm = b._emscripten_bind_btConeTwistConstraint_getBreakingImpulseThreshold_0 = function () {
      return (bm = b._emscripten_bind_btConeTwistConstraint_getBreakingImpulseThreshold_0 = b.asm.Xj).apply(null, arguments);
    };
    var cm = b._emscripten_bind_btConeTwistConstraint_setBreakingImpulseThreshold_1 = function () {
      return (cm = b._emscripten_bind_btConeTwistConstraint_setBreakingImpulseThreshold_1 = b.asm.Yj).apply(null, arguments);
    };
    var dm = b._emscripten_bind_btConeTwistConstraint_getParam_2 = function () {
      return (dm = b._emscripten_bind_btConeTwistConstraint_getParam_2 = b.asm.Zj).apply(null, arguments);
    };
    var em = b._emscripten_bind_btConeTwistConstraint_setParam_3 = function () {
      return (em = b._emscripten_bind_btConeTwistConstraint_setParam_3 = b.asm._j).apply(null, arguments);
    };
    var fm = b._emscripten_bind_btConeTwistConstraint___destroy___0 = function () {
      return (fm = b._emscripten_bind_btConeTwistConstraint___destroy___0 = b.asm.$j).apply(null, arguments);
    };
    var gm = b._emscripten_bind_btHingeConstraint_btHingeConstraint_2 = function () {
      return (gm = b._emscripten_bind_btHingeConstraint_btHingeConstraint_2 = b.asm.ak).apply(null, arguments);
    };
    var hm = b._emscripten_bind_btHingeConstraint_btHingeConstraint_3 = function () {
      return (hm = b._emscripten_bind_btHingeConstraint_btHingeConstraint_3 = b.asm.bk).apply(null, arguments);
    };
    var im = b._emscripten_bind_btHingeConstraint_btHingeConstraint_4 = function () {
      return (im = b._emscripten_bind_btHingeConstraint_btHingeConstraint_4 = b.asm.ck).apply(null, arguments);
    };
    var jm = b._emscripten_bind_btHingeConstraint_btHingeConstraint_5 = function () {
      return (jm = b._emscripten_bind_btHingeConstraint_btHingeConstraint_5 = b.asm.dk).apply(null, arguments);
    };
    var km = b._emscripten_bind_btHingeConstraint_btHingeConstraint_6 = function () {
      return (km = b._emscripten_bind_btHingeConstraint_btHingeConstraint_6 = b.asm.ek).apply(null, arguments);
    };
    var lm = b._emscripten_bind_btHingeConstraint_btHingeConstraint_7 = function () {
      return (lm = b._emscripten_bind_btHingeConstraint_btHingeConstraint_7 = b.asm.fk).apply(null, arguments);
    };
    var mm = b._emscripten_bind_btHingeConstraint_setLimit_4 = function () {
      return (mm = b._emscripten_bind_btHingeConstraint_setLimit_4 = b.asm.gk).apply(null, arguments);
    };
    var nm = b._emscripten_bind_btHingeConstraint_setLimit_5 = function () {
      return (nm = b._emscripten_bind_btHingeConstraint_setLimit_5 = b.asm.hk).apply(null, arguments);
    };
    var om = b._emscripten_bind_btHingeConstraint_enableAngularMotor_3 = function () {
      return (om = b._emscripten_bind_btHingeConstraint_enableAngularMotor_3 = b.asm.ik).apply(null, arguments);
    };
    var pm = b._emscripten_bind_btHingeConstraint_setAngularOnly_1 = function () {
      return (pm = b._emscripten_bind_btHingeConstraint_setAngularOnly_1 = b.asm.jk).apply(null, arguments);
    };
    var qm = b._emscripten_bind_btHingeConstraint_enableMotor_1 = function () {
      return (qm = b._emscripten_bind_btHingeConstraint_enableMotor_1 = b.asm.kk).apply(null, arguments);
    };
    var rm = b._emscripten_bind_btHingeConstraint_setMaxMotorImpulse_1 = function () {
      return (rm = b._emscripten_bind_btHingeConstraint_setMaxMotorImpulse_1 = b.asm.lk).apply(null, arguments);
    };
    var sm = b._emscripten_bind_btHingeConstraint_setMotorTarget_2 = function () {
      return (sm = b._emscripten_bind_btHingeConstraint_setMotorTarget_2 = b.asm.mk).apply(null, arguments);
    };
    var tm = b._emscripten_bind_btHingeConstraint_enableFeedback_1 = function () {
      return (tm = b._emscripten_bind_btHingeConstraint_enableFeedback_1 = b.asm.nk).apply(null, arguments);
    };
    var um = b._emscripten_bind_btHingeConstraint_getBreakingImpulseThreshold_0 = function () {
      return (um = b._emscripten_bind_btHingeConstraint_getBreakingImpulseThreshold_0 = b.asm.ok).apply(null, arguments);
    };
    var wm = b._emscripten_bind_btHingeConstraint_setBreakingImpulseThreshold_1 = function () {
      return (wm = b._emscripten_bind_btHingeConstraint_setBreakingImpulseThreshold_1 = b.asm.pk).apply(null, arguments);
    };
    var xm = b._emscripten_bind_btHingeConstraint_getParam_2 = function () {
      return (xm = b._emscripten_bind_btHingeConstraint_getParam_2 = b.asm.qk).apply(null, arguments);
    };
    var ym = b._emscripten_bind_btHingeConstraint_setParam_3 = function () {
      return (ym = b._emscripten_bind_btHingeConstraint_setParam_3 = b.asm.rk).apply(null, arguments);
    };
    var zm = b._emscripten_bind_btHingeConstraint___destroy___0 = function () {
      return (zm = b._emscripten_bind_btHingeConstraint___destroy___0 = b.asm.sk).apply(null, arguments);
    };
    var Am = b._emscripten_bind_btConeShapeZ_btConeShapeZ_2 = function () {
      return (Am = b._emscripten_bind_btConeShapeZ_btConeShapeZ_2 = b.asm.tk).apply(null, arguments);
    };
    var Bm = b._emscripten_bind_btConeShapeZ_setLocalScaling_1 = function () {
      return (Bm = b._emscripten_bind_btConeShapeZ_setLocalScaling_1 = b.asm.uk).apply(null, arguments);
    };
    var Cm = b._emscripten_bind_btConeShapeZ_getLocalScaling_0 = function () {
      return (Cm = b._emscripten_bind_btConeShapeZ_getLocalScaling_0 = b.asm.vk).apply(null, arguments);
    };
    var Dm = b._emscripten_bind_btConeShapeZ_calculateLocalInertia_2 = function () {
      return (Dm = b._emscripten_bind_btConeShapeZ_calculateLocalInertia_2 = b.asm.wk).apply(null, arguments);
    };
    var Em = b._emscripten_bind_btConeShapeZ___destroy___0 = function () {
      return (Em = b._emscripten_bind_btConeShapeZ___destroy___0 = b.asm.xk).apply(null, arguments);
    };
    var Fm = b._emscripten_bind_btConeShapeX_btConeShapeX_2 = function () {
      return (Fm = b._emscripten_bind_btConeShapeX_btConeShapeX_2 = b.asm.yk).apply(null, arguments);
    };
    var Gm = b._emscripten_bind_btConeShapeX_setLocalScaling_1 = function () {
      return (Gm = b._emscripten_bind_btConeShapeX_setLocalScaling_1 = b.asm.zk).apply(null, arguments);
    };
    var Hm = b._emscripten_bind_btConeShapeX_getLocalScaling_0 = function () {
      return (Hm = b._emscripten_bind_btConeShapeX_getLocalScaling_0 = b.asm.Ak).apply(null, arguments);
    };
    var Im = b._emscripten_bind_btConeShapeX_calculateLocalInertia_2 = function () {
      return (Im = b._emscripten_bind_btConeShapeX_calculateLocalInertia_2 = b.asm.Bk).apply(null, arguments);
    };
    var Jm = b._emscripten_bind_btConeShapeX___destroy___0 = function () {
      return (Jm = b._emscripten_bind_btConeShapeX___destroy___0 = b.asm.Ck).apply(null, arguments);
    };
    var Km = b._emscripten_bind_btTriangleMesh_btTriangleMesh_0 = function () {
      return (Km = b._emscripten_bind_btTriangleMesh_btTriangleMesh_0 = b.asm.Dk).apply(null, arguments);
    };
    var Lm = b._emscripten_bind_btTriangleMesh_btTriangleMesh_1 = function () {
      return (Lm = b._emscripten_bind_btTriangleMesh_btTriangleMesh_1 = b.asm.Ek).apply(null, arguments);
    };
    var Mm = b._emscripten_bind_btTriangleMesh_btTriangleMesh_2 = function () {
      return (Mm = b._emscripten_bind_btTriangleMesh_btTriangleMesh_2 = b.asm.Fk).apply(null, arguments);
    };
    var Nm = b._emscripten_bind_btTriangleMesh_addTriangle_3 = function () {
      return (Nm = b._emscripten_bind_btTriangleMesh_addTriangle_3 = b.asm.Gk).apply(null, arguments);
    };
    var Om = b._emscripten_bind_btTriangleMesh_addTriangle_4 = function () {
      return (Om = b._emscripten_bind_btTriangleMesh_addTriangle_4 = b.asm.Hk).apply(null, arguments);
    };
    var Pm = b._emscripten_bind_btTriangleMesh_findOrAddVertex_2 = function () {
      return (Pm = b._emscripten_bind_btTriangleMesh_findOrAddVertex_2 = b.asm.Ik).apply(null, arguments);
    };
    var Qm = b._emscripten_bind_btTriangleMesh_addIndex_1 = function () {
      return (Qm = b._emscripten_bind_btTriangleMesh_addIndex_1 = b.asm.Jk).apply(null, arguments);
    };
    var Rm = b._emscripten_bind_btTriangleMesh_getIndexedMeshArray_0 = function () {
      return (Rm = b._emscripten_bind_btTriangleMesh_getIndexedMeshArray_0 = b.asm.Kk).apply(null, arguments);
    };
    var Sm = b._emscripten_bind_btTriangleMesh_setScaling_1 = function () {
      return (Sm = b._emscripten_bind_btTriangleMesh_setScaling_1 = b.asm.Lk).apply(null, arguments);
    };
    var Tm = b._emscripten_bind_btTriangleMesh___destroy___0 = function () {
      return (Tm = b._emscripten_bind_btTriangleMesh___destroy___0 = b.asm.Mk).apply(null, arguments);
    };
    var Um = b._emscripten_bind_btConvexHullShape_btConvexHullShape_0 = function () {
      return (Um = b._emscripten_bind_btConvexHullShape_btConvexHullShape_0 = b.asm.Nk).apply(null, arguments);
    };
    var Vm = b._emscripten_bind_btConvexHullShape_btConvexHullShape_1 = function () {
      return (Vm = b._emscripten_bind_btConvexHullShape_btConvexHullShape_1 = b.asm.Ok).apply(null, arguments);
    };
    var Wm = b._emscripten_bind_btConvexHullShape_btConvexHullShape_2 = function () {
      return (Wm = b._emscripten_bind_btConvexHullShape_btConvexHullShape_2 = b.asm.Pk).apply(null, arguments);
    };
    var Xm = b._emscripten_bind_btConvexHullShape_addPoint_1 = function () {
      return (Xm = b._emscripten_bind_btConvexHullShape_addPoint_1 = b.asm.Qk).apply(null, arguments);
    };
    var Ym = b._emscripten_bind_btConvexHullShape_addPoint_2 = function () {
      return (Ym = b._emscripten_bind_btConvexHullShape_addPoint_2 = b.asm.Rk).apply(null, arguments);
    };
    var Zm = b._emscripten_bind_btConvexHullShape_setMargin_1 = function () {
      return (Zm = b._emscripten_bind_btConvexHullShape_setMargin_1 = b.asm.Sk).apply(null, arguments);
    };
    var $m = b._emscripten_bind_btConvexHullShape_getMargin_0 = function () {
      return ($m = b._emscripten_bind_btConvexHullShape_getMargin_0 = b.asm.Tk).apply(null, arguments);
    };
    var an = b._emscripten_bind_btConvexHullShape_getNumVertices_0 = function () {
      return (an = b._emscripten_bind_btConvexHullShape_getNumVertices_0 = b.asm.Uk).apply(null, arguments);
    };
    var bn = b._emscripten_bind_btConvexHullShape_initializePolyhedralFeatures_1 = function () {
      return (bn = b._emscripten_bind_btConvexHullShape_initializePolyhedralFeatures_1 = b.asm.Vk).apply(null, arguments);
    };
    var cn = b._emscripten_bind_btConvexHullShape_recalcLocalAabb_0 = function () {
      return (cn = b._emscripten_bind_btConvexHullShape_recalcLocalAabb_0 = b.asm.Wk).apply(null, arguments);
    };
    var dn = b._emscripten_bind_btConvexHullShape_getConvexPolyhedron_0 = function () {
      return (dn = b._emscripten_bind_btConvexHullShape_getConvexPolyhedron_0 = b.asm.Xk).apply(null, arguments);
    };
    var en = b._emscripten_bind_btConvexHullShape_setLocalScaling_1 = function () {
      return (en = b._emscripten_bind_btConvexHullShape_setLocalScaling_1 = b.asm.Yk).apply(null, arguments);
    };
    var fn = b._emscripten_bind_btConvexHullShape_getLocalScaling_0 = function () {
      return (fn = b._emscripten_bind_btConvexHullShape_getLocalScaling_0 = b.asm.Zk).apply(null, arguments);
    };
    var gn = b._emscripten_bind_btConvexHullShape_calculateLocalInertia_2 = function () {
      return (gn = b._emscripten_bind_btConvexHullShape_calculateLocalInertia_2 = b.asm._k).apply(null, arguments);
    };
    var hn = b._emscripten_bind_btConvexHullShape___destroy___0 = function () {
      return (hn = b._emscripten_bind_btConvexHullShape___destroy___0 = b.asm.$k).apply(null, arguments);
    };
    var jn = b._emscripten_bind_btVehicleTuning_btVehicleTuning_0 = function () {
      return (jn = b._emscripten_bind_btVehicleTuning_btVehicleTuning_0 = b.asm.al).apply(null, arguments);
    };
    var kn = b._emscripten_bind_btVehicleTuning_get_m_suspensionStiffness_0 = function () {
      return (kn = b._emscripten_bind_btVehicleTuning_get_m_suspensionStiffness_0 = b.asm.bl).apply(null, arguments);
    };
    var ln = b._emscripten_bind_btVehicleTuning_set_m_suspensionStiffness_1 = function () {
      return (ln = b._emscripten_bind_btVehicleTuning_set_m_suspensionStiffness_1 = b.asm.cl).apply(null, arguments);
    };
    var mn = b._emscripten_bind_btVehicleTuning_get_m_suspensionCompression_0 = function () {
      return (mn = b._emscripten_bind_btVehicleTuning_get_m_suspensionCompression_0 = b.asm.dl).apply(null, arguments);
    };
    var nn = b._emscripten_bind_btVehicleTuning_set_m_suspensionCompression_1 = function () {
      return (nn = b._emscripten_bind_btVehicleTuning_set_m_suspensionCompression_1 = b.asm.el).apply(null, arguments);
    };
    var on = b._emscripten_bind_btVehicleTuning_get_m_suspensionDamping_0 = function () {
      return (on = b._emscripten_bind_btVehicleTuning_get_m_suspensionDamping_0 = b.asm.fl).apply(null, arguments);
    };
    var pn = b._emscripten_bind_btVehicleTuning_set_m_suspensionDamping_1 = function () {
      return (pn = b._emscripten_bind_btVehicleTuning_set_m_suspensionDamping_1 = b.asm.gl).apply(null, arguments);
    };
    var qn = b._emscripten_bind_btVehicleTuning_get_m_maxSuspensionTravelCm_0 = function () {
      return (qn = b._emscripten_bind_btVehicleTuning_get_m_maxSuspensionTravelCm_0 = b.asm.hl).apply(null, arguments);
    };
    var rn = b._emscripten_bind_btVehicleTuning_set_m_maxSuspensionTravelCm_1 = function () {
      return (rn = b._emscripten_bind_btVehicleTuning_set_m_maxSuspensionTravelCm_1 = b.asm.il).apply(null, arguments);
    };
    var sn = b._emscripten_bind_btVehicleTuning_get_m_frictionSlip_0 = function () {
      return (sn = b._emscripten_bind_btVehicleTuning_get_m_frictionSlip_0 = b.asm.jl).apply(null, arguments);
    };
    var tn = b._emscripten_bind_btVehicleTuning_set_m_frictionSlip_1 = function () {
      return (tn = b._emscripten_bind_btVehicleTuning_set_m_frictionSlip_1 = b.asm.kl).apply(null, arguments);
    };
    var un = b._emscripten_bind_btVehicleTuning_get_m_maxSuspensionForce_0 = function () {
      return (un = b._emscripten_bind_btVehicleTuning_get_m_maxSuspensionForce_0 = b.asm.ll).apply(null, arguments);
    };
    var vn = b._emscripten_bind_btVehicleTuning_set_m_maxSuspensionForce_1 = function () {
      return (vn = b._emscripten_bind_btVehicleTuning_set_m_maxSuspensionForce_1 = b.asm.ml).apply(null, arguments);
    };
    var wn = b._emscripten_bind_btCollisionObjectWrapper_getWorldTransform_0 = function () {
      return (wn = b._emscripten_bind_btCollisionObjectWrapper_getWorldTransform_0 = b.asm.nl).apply(null, arguments);
    };
    var xn = b._emscripten_bind_btCollisionObjectWrapper_getCollisionObject_0 = function () {
      return (xn = b._emscripten_bind_btCollisionObjectWrapper_getCollisionObject_0 = b.asm.ol).apply(null, arguments);
    };
    var yn = b._emscripten_bind_btCollisionObjectWrapper_getCollisionShape_0 = function () {
      return (yn = b._emscripten_bind_btCollisionObjectWrapper_getCollisionShape_0 = b.asm.pl).apply(null, arguments);
    };
    var zn = b._emscripten_bind_btShapeHull_btShapeHull_1 = function () {
      return (zn = b._emscripten_bind_btShapeHull_btShapeHull_1 = b.asm.ql).apply(null, arguments);
    };
    var An = b._emscripten_bind_btShapeHull_buildHull_1 = function () {
      return (An = b._emscripten_bind_btShapeHull_buildHull_1 = b.asm.rl).apply(null, arguments);
    };
    var Bn = b._emscripten_bind_btShapeHull_numVertices_0 = function () {
      return (Bn = b._emscripten_bind_btShapeHull_numVertices_0 = b.asm.sl).apply(null, arguments);
    };
    var Cn = b._emscripten_bind_btShapeHull_getVertexPointer_0 = function () {
      return (Cn = b._emscripten_bind_btShapeHull_getVertexPointer_0 = b.asm.tl).apply(null, arguments);
    };
    var Dn = b._emscripten_bind_btShapeHull___destroy___0 = function () {
      return (Dn = b._emscripten_bind_btShapeHull___destroy___0 = b.asm.ul).apply(null, arguments);
    };
    var En = b._emscripten_bind_btDefaultMotionState_btDefaultMotionState_0 = function () {
      return (En = b._emscripten_bind_btDefaultMotionState_btDefaultMotionState_0 = b.asm.vl).apply(null, arguments);
    };
    var Fn = b._emscripten_bind_btDefaultMotionState_btDefaultMotionState_1 = function () {
      return (Fn = b._emscripten_bind_btDefaultMotionState_btDefaultMotionState_1 = b.asm.wl).apply(null, arguments);
    };
    var Gn = b._emscripten_bind_btDefaultMotionState_btDefaultMotionState_2 = function () {
      return (Gn = b._emscripten_bind_btDefaultMotionState_btDefaultMotionState_2 = b.asm.xl).apply(null, arguments);
    };
    var Hn = b._emscripten_bind_btDefaultMotionState_getWorldTransform_1 = function () {
      return (Hn = b._emscripten_bind_btDefaultMotionState_getWorldTransform_1 = b.asm.yl).apply(null, arguments);
    };
    var In = b._emscripten_bind_btDefaultMotionState_setWorldTransform_1 = function () {
      return (In = b._emscripten_bind_btDefaultMotionState_setWorldTransform_1 = b.asm.zl).apply(null, arguments);
    };
    var Jn = b._emscripten_bind_btDefaultMotionState_get_m_graphicsWorldTrans_0 = function () {
      return (Jn = b._emscripten_bind_btDefaultMotionState_get_m_graphicsWorldTrans_0 = b.asm.Al).apply(null, arguments);
    };
    var Kn = b._emscripten_bind_btDefaultMotionState_set_m_graphicsWorldTrans_1 = function () {
      return (Kn = b._emscripten_bind_btDefaultMotionState_set_m_graphicsWorldTrans_1 = b.asm.Bl).apply(null, arguments);
    };
    var Ln = b._emscripten_bind_btDefaultMotionState___destroy___0 = function () {
      return (Ln = b._emscripten_bind_btDefaultMotionState___destroy___0 = b.asm.Cl).apply(null, arguments);
    };
    var Mn = b._emscripten_bind_btWheelInfo_btWheelInfo_1 = function () {
      return (Mn = b._emscripten_bind_btWheelInfo_btWheelInfo_1 = b.asm.Dl).apply(null, arguments);
    };
    var Nn = b._emscripten_bind_btWheelInfo_getSuspensionRestLength_0 = function () {
      return (Nn = b._emscripten_bind_btWheelInfo_getSuspensionRestLength_0 = b.asm.El).apply(null, arguments);
    };
    var On = b._emscripten_bind_btWheelInfo_updateWheel_2 = function () {
      return (On = b._emscripten_bind_btWheelInfo_updateWheel_2 = b.asm.Fl).apply(null, arguments);
    };
    var Pn = b._emscripten_bind_btWheelInfo_get_m_suspensionStiffness_0 = function () {
      return (Pn = b._emscripten_bind_btWheelInfo_get_m_suspensionStiffness_0 = b.asm.Gl).apply(null, arguments);
    };
    var Qn = b._emscripten_bind_btWheelInfo_set_m_suspensionStiffness_1 = function () {
      return (Qn = b._emscripten_bind_btWheelInfo_set_m_suspensionStiffness_1 = b.asm.Hl).apply(null, arguments);
    };
    var Rn = b._emscripten_bind_btWheelInfo_get_m_frictionSlip_0 = function () {
      return (Rn = b._emscripten_bind_btWheelInfo_get_m_frictionSlip_0 = b.asm.Il).apply(null, arguments);
    };
    var Sn = b._emscripten_bind_btWheelInfo_set_m_frictionSlip_1 = function () {
      return (Sn = b._emscripten_bind_btWheelInfo_set_m_frictionSlip_1 = b.asm.Jl).apply(null, arguments);
    };
    var Tn = b._emscripten_bind_btWheelInfo_get_m_engineForce_0 = function () {
      return (Tn = b._emscripten_bind_btWheelInfo_get_m_engineForce_0 = b.asm.Kl).apply(null, arguments);
    };
    var Un = b._emscripten_bind_btWheelInfo_set_m_engineForce_1 = function () {
      return (Un = b._emscripten_bind_btWheelInfo_set_m_engineForce_1 = b.asm.Ll).apply(null, arguments);
    };
    var Vn = b._emscripten_bind_btWheelInfo_get_m_rollInfluence_0 = function () {
      return (Vn = b._emscripten_bind_btWheelInfo_get_m_rollInfluence_0 = b.asm.Ml).apply(null, arguments);
    };
    var Wn = b._emscripten_bind_btWheelInfo_set_m_rollInfluence_1 = function () {
      return (Wn = b._emscripten_bind_btWheelInfo_set_m_rollInfluence_1 = b.asm.Nl).apply(null, arguments);
    };
    var Xn = b._emscripten_bind_btWheelInfo_get_m_suspensionRestLength1_0 = function () {
      return (Xn = b._emscripten_bind_btWheelInfo_get_m_suspensionRestLength1_0 = b.asm.Ol).apply(null, arguments);
    };
    var Yn = b._emscripten_bind_btWheelInfo_set_m_suspensionRestLength1_1 = function () {
      return (Yn = b._emscripten_bind_btWheelInfo_set_m_suspensionRestLength1_1 = b.asm.Pl).apply(null, arguments);
    };
    var Zn = b._emscripten_bind_btWheelInfo_get_m_wheelsRadius_0 = function () {
      return (Zn = b._emscripten_bind_btWheelInfo_get_m_wheelsRadius_0 = b.asm.Ql).apply(null, arguments);
    };
    var $n = b._emscripten_bind_btWheelInfo_set_m_wheelsRadius_1 = function () {
      return ($n = b._emscripten_bind_btWheelInfo_set_m_wheelsRadius_1 = b.asm.Rl).apply(null, arguments);
    };
    var ao = b._emscripten_bind_btWheelInfo_get_m_wheelsDampingCompression_0 = function () {
      return (ao = b._emscripten_bind_btWheelInfo_get_m_wheelsDampingCompression_0 = b.asm.Sl).apply(null, arguments);
    };
    var bo = b._emscripten_bind_btWheelInfo_set_m_wheelsDampingCompression_1 = function () {
      return (bo = b._emscripten_bind_btWheelInfo_set_m_wheelsDampingCompression_1 = b.asm.Tl).apply(null, arguments);
    };
    var co = b._emscripten_bind_btWheelInfo_get_m_wheelsDampingRelaxation_0 = function () {
      return (co = b._emscripten_bind_btWheelInfo_get_m_wheelsDampingRelaxation_0 = b.asm.Ul).apply(null, arguments);
    };
    var eo = b._emscripten_bind_btWheelInfo_set_m_wheelsDampingRelaxation_1 = function () {
      return (eo = b._emscripten_bind_btWheelInfo_set_m_wheelsDampingRelaxation_1 = b.asm.Vl).apply(null, arguments);
    };
    var fo = b._emscripten_bind_btWheelInfo_get_m_steering_0 = function () {
      return (fo = b._emscripten_bind_btWheelInfo_get_m_steering_0 = b.asm.Wl).apply(null, arguments);
    };
    var go = b._emscripten_bind_btWheelInfo_set_m_steering_1 = function () {
      return (go = b._emscripten_bind_btWheelInfo_set_m_steering_1 = b.asm.Xl).apply(null, arguments);
    };
    var ho = b._emscripten_bind_btWheelInfo_get_m_maxSuspensionForce_0 = function () {
      return (ho = b._emscripten_bind_btWheelInfo_get_m_maxSuspensionForce_0 = b.asm.Yl).apply(null, arguments);
    };
    var io = b._emscripten_bind_btWheelInfo_set_m_maxSuspensionForce_1 = function () {
      return (io = b._emscripten_bind_btWheelInfo_set_m_maxSuspensionForce_1 = b.asm.Zl).apply(null, arguments);
    };
    var jo = b._emscripten_bind_btWheelInfo_get_m_maxSuspensionTravelCm_0 = function () {
      return (jo = b._emscripten_bind_btWheelInfo_get_m_maxSuspensionTravelCm_0 = b.asm._l).apply(null, arguments);
    };
    var ko = b._emscripten_bind_btWheelInfo_set_m_maxSuspensionTravelCm_1 = function () {
      return (ko = b._emscripten_bind_btWheelInfo_set_m_maxSuspensionTravelCm_1 = b.asm.$l).apply(null, arguments);
    };
    var lo = b._emscripten_bind_btWheelInfo_get_m_wheelsSuspensionForce_0 = function () {
      return (lo = b._emscripten_bind_btWheelInfo_get_m_wheelsSuspensionForce_0 = b.asm.am).apply(null, arguments);
    };
    var mo = b._emscripten_bind_btWheelInfo_set_m_wheelsSuspensionForce_1 = function () {
      return (mo = b._emscripten_bind_btWheelInfo_set_m_wheelsSuspensionForce_1 = b.asm.bm).apply(null, arguments);
    };
    var no = b._emscripten_bind_btWheelInfo_get_m_bIsFrontWheel_0 = function () {
      return (no = b._emscripten_bind_btWheelInfo_get_m_bIsFrontWheel_0 = b.asm.cm).apply(null, arguments);
    };
    var oo = b._emscripten_bind_btWheelInfo_set_m_bIsFrontWheel_1 = function () {
      return (oo = b._emscripten_bind_btWheelInfo_set_m_bIsFrontWheel_1 = b.asm.dm).apply(null, arguments);
    };
    var po = b._emscripten_bind_btWheelInfo_get_m_raycastInfo_0 = function () {
      return (po = b._emscripten_bind_btWheelInfo_get_m_raycastInfo_0 = b.asm.em).apply(null, arguments);
    };
    var qo = b._emscripten_bind_btWheelInfo_set_m_raycastInfo_1 = function () {
      return (qo = b._emscripten_bind_btWheelInfo_set_m_raycastInfo_1 = b.asm.fm).apply(null, arguments);
    };
    var ro = b._emscripten_bind_btWheelInfo_get_m_chassisConnectionPointCS_0 = function () {
      return (ro = b._emscripten_bind_btWheelInfo_get_m_chassisConnectionPointCS_0 = b.asm.gm).apply(null, arguments);
    };
    var so = b._emscripten_bind_btWheelInfo_set_m_chassisConnectionPointCS_1 = function () {
      return (so = b._emscripten_bind_btWheelInfo_set_m_chassisConnectionPointCS_1 = b.asm.hm).apply(null, arguments);
    };
    var to = b._emscripten_bind_btWheelInfo_get_m_worldTransform_0 = function () {
      return (to = b._emscripten_bind_btWheelInfo_get_m_worldTransform_0 = b.asm.im).apply(null, arguments);
    };
    var uo = b._emscripten_bind_btWheelInfo_set_m_worldTransform_1 = function () {
      return (uo = b._emscripten_bind_btWheelInfo_set_m_worldTransform_1 = b.asm.jm).apply(null, arguments);
    };
    var vo = b._emscripten_bind_btWheelInfo_get_m_wheelDirectionCS_0 = function () {
      return (vo = b._emscripten_bind_btWheelInfo_get_m_wheelDirectionCS_0 = b.asm.km).apply(null, arguments);
    };
    var wo = b._emscripten_bind_btWheelInfo_set_m_wheelDirectionCS_1 = function () {
      return (wo = b._emscripten_bind_btWheelInfo_set_m_wheelDirectionCS_1 = b.asm.lm).apply(null, arguments);
    };
    var xo = b._emscripten_bind_btWheelInfo_get_m_wheelAxleCS_0 = function () {
      return (xo = b._emscripten_bind_btWheelInfo_get_m_wheelAxleCS_0 = b.asm.mm).apply(null, arguments);
    };
    var yo = b._emscripten_bind_btWheelInfo_set_m_wheelAxleCS_1 = function () {
      return (yo = b._emscripten_bind_btWheelInfo_set_m_wheelAxleCS_1 = b.asm.nm).apply(null, arguments);
    };
    var zo = b._emscripten_bind_btWheelInfo_get_m_rotation_0 = function () {
      return (zo = b._emscripten_bind_btWheelInfo_get_m_rotation_0 = b.asm.om).apply(null, arguments);
    };
    var Ao = b._emscripten_bind_btWheelInfo_set_m_rotation_1 = function () {
      return (Ao = b._emscripten_bind_btWheelInfo_set_m_rotation_1 = b.asm.pm).apply(null, arguments);
    };
    var Bo = b._emscripten_bind_btWheelInfo_get_m_deltaRotation_0 = function () {
      return (Bo = b._emscripten_bind_btWheelInfo_get_m_deltaRotation_0 = b.asm.qm).apply(null, arguments);
    };
    var Co = b._emscripten_bind_btWheelInfo_set_m_deltaRotation_1 = function () {
      return (Co = b._emscripten_bind_btWheelInfo_set_m_deltaRotation_1 = b.asm.rm).apply(null, arguments);
    };
    var Do = b._emscripten_bind_btWheelInfo_get_m_brake_0 = function () {
      return (Do = b._emscripten_bind_btWheelInfo_get_m_brake_0 = b.asm.sm).apply(null, arguments);
    };
    var Eo = b._emscripten_bind_btWheelInfo_set_m_brake_1 = function () {
      return (Eo = b._emscripten_bind_btWheelInfo_set_m_brake_1 = b.asm.tm).apply(null, arguments);
    };
    var Fo = b._emscripten_bind_btWheelInfo_get_m_clippedInvContactDotSuspension_0 = function () {
      return (Fo = b._emscripten_bind_btWheelInfo_get_m_clippedInvContactDotSuspension_0 = b.asm.um).apply(null, arguments);
    };
    var Go = b._emscripten_bind_btWheelInfo_set_m_clippedInvContactDotSuspension_1 = function () {
      return (Go = b._emscripten_bind_btWheelInfo_set_m_clippedInvContactDotSuspension_1 = b.asm.vm).apply(null, arguments);
    };
    var Ho = b._emscripten_bind_btWheelInfo_get_m_suspensionRelativeVelocity_0 = function () {
      return (Ho = b._emscripten_bind_btWheelInfo_get_m_suspensionRelativeVelocity_0 = b.asm.wm).apply(null, arguments);
    };
    var Io = b._emscripten_bind_btWheelInfo_set_m_suspensionRelativeVelocity_1 = function () {
      return (Io = b._emscripten_bind_btWheelInfo_set_m_suspensionRelativeVelocity_1 = b.asm.xm).apply(null, arguments);
    };
    var Jo = b._emscripten_bind_btWheelInfo_get_m_skidInfo_0 = function () {
      return (Jo = b._emscripten_bind_btWheelInfo_get_m_skidInfo_0 = b.asm.ym).apply(null, arguments);
    };
    var Ko = b._emscripten_bind_btWheelInfo_set_m_skidInfo_1 = function () {
      return (Ko = b._emscripten_bind_btWheelInfo_set_m_skidInfo_1 = b.asm.zm).apply(null, arguments);
    };
    var Lo = b._emscripten_bind_btWheelInfo___destroy___0 = function () {
      return (Lo = b._emscripten_bind_btWheelInfo___destroy___0 = b.asm.Am).apply(null, arguments);
    };
    var Mo = b._emscripten_bind_btVector4_btVector4_0 = function () {
      return (Mo = b._emscripten_bind_btVector4_btVector4_0 = b.asm.Bm).apply(null, arguments);
    };
    var No = b._emscripten_bind_btVector4_btVector4_4 = function () {
      return (No = b._emscripten_bind_btVector4_btVector4_4 = b.asm.Cm).apply(null, arguments);
    };
    var Oo = b._emscripten_bind_btVector4_w_0 = function () {
      return (Oo = b._emscripten_bind_btVector4_w_0 = b.asm.Dm).apply(null, arguments);
    };
    var Po = b._emscripten_bind_btVector4_setValue_4 = function () {
      return (Po = b._emscripten_bind_btVector4_setValue_4 = b.asm.Em).apply(null, arguments);
    };
    var Qo = b._emscripten_bind_btVector4_length_0 = function () {
      return (Qo = b._emscripten_bind_btVector4_length_0 = b.asm.Fm).apply(null, arguments);
    };
    var Ro = b._emscripten_bind_btVector4_x_0 = function () {
      return (Ro = b._emscripten_bind_btVector4_x_0 = b.asm.Gm).apply(null, arguments);
    };
    var So = b._emscripten_bind_btVector4_y_0 = function () {
      return (So = b._emscripten_bind_btVector4_y_0 = b.asm.Hm).apply(null, arguments);
    };
    var To = b._emscripten_bind_btVector4_z_0 = function () {
      return (To = b._emscripten_bind_btVector4_z_0 = b.asm.Im).apply(null, arguments);
    };
    var Uo = b._emscripten_bind_btVector4_setX_1 = function () {
      return (Uo = b._emscripten_bind_btVector4_setX_1 = b.asm.Jm).apply(null, arguments);
    };
    var Vo = b._emscripten_bind_btVector4_setY_1 = function () {
      return (Vo = b._emscripten_bind_btVector4_setY_1 = b.asm.Km).apply(null, arguments);
    };
    var Wo = b._emscripten_bind_btVector4_setZ_1 = function () {
      return (Wo = b._emscripten_bind_btVector4_setZ_1 = b.asm.Lm).apply(null, arguments);
    };
    var Xo = b._emscripten_bind_btVector4_normalize_0 = function () {
      return (Xo = b._emscripten_bind_btVector4_normalize_0 = b.asm.Mm).apply(null, arguments);
    };
    var Yo = b._emscripten_bind_btVector4_rotate_2 = function () {
      return (Yo = b._emscripten_bind_btVector4_rotate_2 = b.asm.Nm).apply(null, arguments);
    };
    var Zo = b._emscripten_bind_btVector4_dot_1 = function () {
      return (Zo = b._emscripten_bind_btVector4_dot_1 = b.asm.Om).apply(null, arguments);
    };
    var $o = b._emscripten_bind_btVector4_op_mul_1 = function () {
      return ($o = b._emscripten_bind_btVector4_op_mul_1 = b.asm.Pm).apply(null, arguments);
    };
    var ap = b._emscripten_bind_btVector4_op_add_1 = function () {
      return (ap = b._emscripten_bind_btVector4_op_add_1 = b.asm.Qm).apply(null, arguments);
    };
    var bp = b._emscripten_bind_btVector4_op_sub_1 = function () {
      return (bp = b._emscripten_bind_btVector4_op_sub_1 = b.asm.Rm).apply(null, arguments);
    };
    var cp = b._emscripten_bind_btVector4___destroy___0 = function () {
      return (cp = b._emscripten_bind_btVector4___destroy___0 = b.asm.Sm).apply(null, arguments);
    };
    var dp = b._emscripten_bind_btDefaultCollisionConstructionInfo_btDefaultCollisionConstructionInfo_0 = function () {
      return (dp = b._emscripten_bind_btDefaultCollisionConstructionInfo_btDefaultCollisionConstructionInfo_0 = b.asm.Tm).apply(null, arguments);
    };
    var ep = b._emscripten_bind_btDefaultCollisionConstructionInfo___destroy___0 = function () {
      return (ep = b._emscripten_bind_btDefaultCollisionConstructionInfo___destroy___0 = b.asm.Um).apply(null, arguments);
    };
    var fp = b._emscripten_bind_Anchor_get_m_node_0 = function () {
      return (fp = b._emscripten_bind_Anchor_get_m_node_0 = b.asm.Vm).apply(null, arguments);
    };
    var gp = b._emscripten_bind_Anchor_set_m_node_1 = function () {
      return (gp = b._emscripten_bind_Anchor_set_m_node_1 = b.asm.Wm).apply(null, arguments);
    };
    var hp = b._emscripten_bind_Anchor_get_m_local_0 = function () {
      return (hp = b._emscripten_bind_Anchor_get_m_local_0 = b.asm.Xm).apply(null, arguments);
    };
    var ip = b._emscripten_bind_Anchor_set_m_local_1 = function () {
      return (ip = b._emscripten_bind_Anchor_set_m_local_1 = b.asm.Ym).apply(null, arguments);
    };
    var jp = b._emscripten_bind_Anchor_get_m_body_0 = function () {
      return (jp = b._emscripten_bind_Anchor_get_m_body_0 = b.asm.Zm).apply(null, arguments);
    };
    var kp = b._emscripten_bind_Anchor_set_m_body_1 = function () {
      return (kp = b._emscripten_bind_Anchor_set_m_body_1 = b.asm._m).apply(null, arguments);
    };
    var lp = b._emscripten_bind_Anchor_get_m_influence_0 = function () {
      return (lp = b._emscripten_bind_Anchor_get_m_influence_0 = b.asm.$m).apply(null, arguments);
    };
    var mp = b._emscripten_bind_Anchor_set_m_influence_1 = function () {
      return (mp = b._emscripten_bind_Anchor_set_m_influence_1 = b.asm.an).apply(null, arguments);
    };
    var np = b._emscripten_bind_Anchor_get_m_c0_0 = function () {
      return (np = b._emscripten_bind_Anchor_get_m_c0_0 = b.asm.bn).apply(null, arguments);
    };
    var op = b._emscripten_bind_Anchor_set_m_c0_1 = function () {
      return (op = b._emscripten_bind_Anchor_set_m_c0_1 = b.asm.cn).apply(null, arguments);
    };
    var pp = b._emscripten_bind_Anchor_get_m_c1_0 = function () {
      return (pp = b._emscripten_bind_Anchor_get_m_c1_0 = b.asm.dn).apply(null, arguments);
    };
    var qp = b._emscripten_bind_Anchor_set_m_c1_1 = function () {
      return (qp = b._emscripten_bind_Anchor_set_m_c1_1 = b.asm.en).apply(null, arguments);
    };
    var rp = b._emscripten_bind_Anchor_get_m_c2_0 = function () {
      return (rp = b._emscripten_bind_Anchor_get_m_c2_0 = b.asm.fn).apply(null, arguments);
    };
    var sp = b._emscripten_bind_Anchor_set_m_c2_1 = function () {
      return (sp = b._emscripten_bind_Anchor_set_m_c2_1 = b.asm.gn).apply(null, arguments);
    };
    var tp = b._emscripten_bind_Anchor___destroy___0 = function () {
      return (tp = b._emscripten_bind_Anchor___destroy___0 = b.asm.hn).apply(null, arguments);
    };
    var up = b._emscripten_bind_btVehicleRaycasterResult_get_m_hitPointInWorld_0 = function () {
      return (up = b._emscripten_bind_btVehicleRaycasterResult_get_m_hitPointInWorld_0 = b.asm.jn).apply(null, arguments);
    };
    var vp = b._emscripten_bind_btVehicleRaycasterResult_set_m_hitPointInWorld_1 = function () {
      return (vp = b._emscripten_bind_btVehicleRaycasterResult_set_m_hitPointInWorld_1 = b.asm.kn).apply(null, arguments);
    };
    var wp = b._emscripten_bind_btVehicleRaycasterResult_get_m_hitNormalInWorld_0 = function () {
      return (wp = b._emscripten_bind_btVehicleRaycasterResult_get_m_hitNormalInWorld_0 = b.asm.ln).apply(null, arguments);
    };
    var xp = b._emscripten_bind_btVehicleRaycasterResult_set_m_hitNormalInWorld_1 = function () {
      return (xp = b._emscripten_bind_btVehicleRaycasterResult_set_m_hitNormalInWorld_1 = b.asm.mn).apply(null, arguments);
    };
    var yp = b._emscripten_bind_btVehicleRaycasterResult_get_m_distFraction_0 = function () {
      return (yp = b._emscripten_bind_btVehicleRaycasterResult_get_m_distFraction_0 = b.asm.nn).apply(null, arguments);
    };
    var zp = b._emscripten_bind_btVehicleRaycasterResult_set_m_distFraction_1 = function () {
      return (zp = b._emscripten_bind_btVehicleRaycasterResult_set_m_distFraction_1 = b.asm.on).apply(null, arguments);
    };
    var Ap = b._emscripten_bind_btVehicleRaycasterResult___destroy___0 = function () {
      return (Ap = b._emscripten_bind_btVehicleRaycasterResult___destroy___0 = b.asm.pn).apply(null, arguments);
    };
    var Bp = b._emscripten_bind_btVector3Array_size_0 = function () {
      return (Bp = b._emscripten_bind_btVector3Array_size_0 = b.asm.qn).apply(null, arguments);
    };
    var Cp = b._emscripten_bind_btVector3Array_at_1 = function () {
      return (Cp = b._emscripten_bind_btVector3Array_at_1 = b.asm.rn).apply(null, arguments);
    };
    var Dp = b._emscripten_bind_btVector3Array___destroy___0 = function () {
      return (Dp = b._emscripten_bind_btVector3Array___destroy___0 = b.asm.sn).apply(null, arguments);
    };
    var Ep = b._emscripten_bind_btConstraintSolver___destroy___0 = function () {
      return (Ep = b._emscripten_bind_btConstraintSolver___destroy___0 = b.asm.tn).apply(null, arguments);
    };
    var Fp = b._emscripten_bind_btRaycastVehicle_btRaycastVehicle_3 = function () {
      return (Fp = b._emscripten_bind_btRaycastVehicle_btRaycastVehicle_3 = b.asm.un).apply(null, arguments);
    };
    var Gp = b._emscripten_bind_btRaycastVehicle_applyEngineForce_2 = function () {
      return (Gp = b._emscripten_bind_btRaycastVehicle_applyEngineForce_2 = b.asm.vn).apply(null, arguments);
    };
    var Hp = b._emscripten_bind_btRaycastVehicle_setSteeringValue_2 = function () {
      return (Hp = b._emscripten_bind_btRaycastVehicle_setSteeringValue_2 = b.asm.wn).apply(null, arguments);
    };
    var Ip = b._emscripten_bind_btRaycastVehicle_getWheelTransformWS_1 = function () {
      return (Ip = b._emscripten_bind_btRaycastVehicle_getWheelTransformWS_1 = b.asm.xn).apply(null, arguments);
    };
    var Jp = b._emscripten_bind_btRaycastVehicle_updateWheelTransform_2 = function () {
      return (Jp = b._emscripten_bind_btRaycastVehicle_updateWheelTransform_2 = b.asm.yn).apply(null, arguments);
    };
    var Kp = b._emscripten_bind_btRaycastVehicle_addWheel_7 = function () {
      return (Kp = b._emscripten_bind_btRaycastVehicle_addWheel_7 = b.asm.zn).apply(null, arguments);
    };
    var Lp = b._emscripten_bind_btRaycastVehicle_getNumWheels_0 = function () {
      return (Lp = b._emscripten_bind_btRaycastVehicle_getNumWheels_0 = b.asm.An).apply(null, arguments);
    };
    var Mp = b._emscripten_bind_btRaycastVehicle_getRigidBody_0 = function () {
      return (Mp = b._emscripten_bind_btRaycastVehicle_getRigidBody_0 = b.asm.Bn).apply(null, arguments);
    };
    var Np = b._emscripten_bind_btRaycastVehicle_getWheelInfo_1 = function () {
      return (Np = b._emscripten_bind_btRaycastVehicle_getWheelInfo_1 = b.asm.Cn).apply(null, arguments);
    };
    var Op = b._emscripten_bind_btRaycastVehicle_setBrake_2 = function () {
      return (Op = b._emscripten_bind_btRaycastVehicle_setBrake_2 = b.asm.Dn).apply(null, arguments);
    };
    var Pp = b._emscripten_bind_btRaycastVehicle_setCoordinateSystem_3 = function () {
      return (Pp = b._emscripten_bind_btRaycastVehicle_setCoordinateSystem_3 = b.asm.En).apply(null, arguments);
    };
    var Qp = b._emscripten_bind_btRaycastVehicle_getCurrentSpeedKmHour_0 = function () {
      return (Qp = b._emscripten_bind_btRaycastVehicle_getCurrentSpeedKmHour_0 = b.asm.Fn).apply(null, arguments);
    };
    var Rp = b._emscripten_bind_btRaycastVehicle_getChassisWorldTransform_0 = function () {
      return (Rp = b._emscripten_bind_btRaycastVehicle_getChassisWorldTransform_0 = b.asm.Gn).apply(null, arguments);
    };
    var Sp = b._emscripten_bind_btRaycastVehicle_rayCast_1 = function () {
      return (Sp = b._emscripten_bind_btRaycastVehicle_rayCast_1 = b.asm.Hn).apply(null, arguments);
    };
    var Tp = b._emscripten_bind_btRaycastVehicle_updateVehicle_1 = function () {
      return (Tp = b._emscripten_bind_btRaycastVehicle_updateVehicle_1 = b.asm.In).apply(null, arguments);
    };
    var Up = b._emscripten_bind_btRaycastVehicle_resetSuspension_0 = function () {
      return (Up = b._emscripten_bind_btRaycastVehicle_resetSuspension_0 = b.asm.Jn).apply(null, arguments);
    };
    var Vp = b._emscripten_bind_btRaycastVehicle_getSteeringValue_1 = function () {
      return (Vp = b._emscripten_bind_btRaycastVehicle_getSteeringValue_1 = b.asm.Kn).apply(null, arguments);
    };
    var Wp = b._emscripten_bind_btRaycastVehicle_updateWheelTransformsWS_1 = function () {
      return (Wp = b._emscripten_bind_btRaycastVehicle_updateWheelTransformsWS_1 = b.asm.Ln).apply(null, arguments);
    };
    var Xp = b._emscripten_bind_btRaycastVehicle_updateWheelTransformsWS_2 = function () {
      return (Xp = b._emscripten_bind_btRaycastVehicle_updateWheelTransformsWS_2 = b.asm.Mn).apply(null, arguments);
    };
    var Yp = b._emscripten_bind_btRaycastVehicle_setPitchControl_1 = function () {
      return (Yp = b._emscripten_bind_btRaycastVehicle_setPitchControl_1 = b.asm.Nn).apply(null, arguments);
    };
    var Zp = b._emscripten_bind_btRaycastVehicle_updateSuspension_1 = function () {
      return (Zp = b._emscripten_bind_btRaycastVehicle_updateSuspension_1 = b.asm.On).apply(null, arguments);
    };
    var $p = b._emscripten_bind_btRaycastVehicle_updateFriction_1 = function () {
      return ($p = b._emscripten_bind_btRaycastVehicle_updateFriction_1 = b.asm.Pn).apply(null, arguments);
    };
    var aq = b._emscripten_bind_btRaycastVehicle_getRightAxis_0 = function () {
      return (aq = b._emscripten_bind_btRaycastVehicle_getRightAxis_0 = b.asm.Qn).apply(null, arguments);
    };
    var bq = b._emscripten_bind_btRaycastVehicle_getUpAxis_0 = function () {
      return (bq = b._emscripten_bind_btRaycastVehicle_getUpAxis_0 = b.asm.Rn).apply(null, arguments);
    };
    var cq = b._emscripten_bind_btRaycastVehicle_getForwardAxis_0 = function () {
      return (cq = b._emscripten_bind_btRaycastVehicle_getForwardAxis_0 = b.asm.Sn).apply(null, arguments);
    };
    var dq = b._emscripten_bind_btRaycastVehicle_getForwardVector_0 = function () {
      return (dq = b._emscripten_bind_btRaycastVehicle_getForwardVector_0 = b.asm.Tn).apply(null, arguments);
    };
    var eq = b._emscripten_bind_btRaycastVehicle_getUserConstraintType_0 = function () {
      return (eq = b._emscripten_bind_btRaycastVehicle_getUserConstraintType_0 = b.asm.Un).apply(null, arguments);
    };
    var fq = b._emscripten_bind_btRaycastVehicle_setUserConstraintType_1 = function () {
      return (fq = b._emscripten_bind_btRaycastVehicle_setUserConstraintType_1 = b.asm.Vn).apply(null, arguments);
    };
    var gq = b._emscripten_bind_btRaycastVehicle_setUserConstraintId_1 = function () {
      return (gq = b._emscripten_bind_btRaycastVehicle_setUserConstraintId_1 = b.asm.Wn).apply(null, arguments);
    };
    var hq = b._emscripten_bind_btRaycastVehicle_getUserConstraintId_0 = function () {
      return (hq = b._emscripten_bind_btRaycastVehicle_getUserConstraintId_0 = b.asm.Xn).apply(null, arguments);
    };
    var iq = b._emscripten_bind_btRaycastVehicle_updateAction_2 = function () {
      return (iq = b._emscripten_bind_btRaycastVehicle_updateAction_2 = b.asm.Yn).apply(null, arguments);
    };
    var jq = b._emscripten_bind_btRaycastVehicle___destroy___0 = function () {
      return (jq = b._emscripten_bind_btRaycastVehicle___destroy___0 = b.asm.Zn).apply(null, arguments);
    };
    var kq = b._emscripten_bind_btCylinderShapeX_btCylinderShapeX_1 = function () {
      return (kq = b._emscripten_bind_btCylinderShapeX_btCylinderShapeX_1 = b.asm._n).apply(null, arguments);
    };
    var lq = b._emscripten_bind_btCylinderShapeX_setMargin_1 = function () {
      return (lq = b._emscripten_bind_btCylinderShapeX_setMargin_1 = b.asm.$n).apply(null, arguments);
    };
    var mq = b._emscripten_bind_btCylinderShapeX_getMargin_0 = function () {
      return (mq = b._emscripten_bind_btCylinderShapeX_getMargin_0 = b.asm.ao).apply(null, arguments);
    };
    var nq = b._emscripten_bind_btCylinderShapeX_setLocalScaling_1 = function () {
      return (nq = b._emscripten_bind_btCylinderShapeX_setLocalScaling_1 = b.asm.bo).apply(null, arguments);
    };
    var oq = b._emscripten_bind_btCylinderShapeX_getLocalScaling_0 = function () {
      return (oq = b._emscripten_bind_btCylinderShapeX_getLocalScaling_0 = b.asm.co).apply(null, arguments);
    };
    var pq = b._emscripten_bind_btCylinderShapeX_calculateLocalInertia_2 = function () {
      return (pq = b._emscripten_bind_btCylinderShapeX_calculateLocalInertia_2 = b.asm.eo).apply(null, arguments);
    };
    var qq = b._emscripten_bind_btCylinderShapeX___destroy___0 = function () {
      return (qq = b._emscripten_bind_btCylinderShapeX___destroy___0 = b.asm.fo).apply(null, arguments);
    };
    var rq = b._emscripten_bind_btCylinderShapeZ_btCylinderShapeZ_1 = function () {
      return (rq = b._emscripten_bind_btCylinderShapeZ_btCylinderShapeZ_1 = b.asm.go).apply(null, arguments);
    };
    var sq = b._emscripten_bind_btCylinderShapeZ_setMargin_1 = function () {
      return (sq = b._emscripten_bind_btCylinderShapeZ_setMargin_1 = b.asm.ho).apply(null, arguments);
    };
    var tq = b._emscripten_bind_btCylinderShapeZ_getMargin_0 = function () {
      return (tq = b._emscripten_bind_btCylinderShapeZ_getMargin_0 = b.asm.io).apply(null, arguments);
    };
    var uq = b._emscripten_bind_btCylinderShapeZ_setLocalScaling_1 = function () {
      return (uq = b._emscripten_bind_btCylinderShapeZ_setLocalScaling_1 = b.asm.jo).apply(null, arguments);
    };
    var vq = b._emscripten_bind_btCylinderShapeZ_getLocalScaling_0 = function () {
      return (vq = b._emscripten_bind_btCylinderShapeZ_getLocalScaling_0 = b.asm.ko).apply(null, arguments);
    };
    var wq = b._emscripten_bind_btCylinderShapeZ_calculateLocalInertia_2 = function () {
      return (wq = b._emscripten_bind_btCylinderShapeZ_calculateLocalInertia_2 = b.asm.lo).apply(null, arguments);
    };
    var xq = b._emscripten_bind_btCylinderShapeZ___destroy___0 = function () {
      return (xq = b._emscripten_bind_btCylinderShapeZ___destroy___0 = b.asm.mo).apply(null, arguments);
    };
    var yq = b._emscripten_bind_btConvexPolyhedron_get_m_vertices_0 = function () {
      return (yq = b._emscripten_bind_btConvexPolyhedron_get_m_vertices_0 = b.asm.no).apply(null, arguments);
    };
    var zq = b._emscripten_bind_btConvexPolyhedron_set_m_vertices_1 = function () {
      return (zq = b._emscripten_bind_btConvexPolyhedron_set_m_vertices_1 = b.asm.oo).apply(null, arguments);
    };
    var Aq = b._emscripten_bind_btConvexPolyhedron_get_m_faces_0 = function () {
      return (Aq = b._emscripten_bind_btConvexPolyhedron_get_m_faces_0 = b.asm.po).apply(null, arguments);
    };
    var Bq = b._emscripten_bind_btConvexPolyhedron_set_m_faces_1 = function () {
      return (Bq = b._emscripten_bind_btConvexPolyhedron_set_m_faces_1 = b.asm.qo).apply(null, arguments);
    };
    var Cq = b._emscripten_bind_btConvexPolyhedron___destroy___0 = function () {
      return (Cq = b._emscripten_bind_btConvexPolyhedron___destroy___0 = b.asm.ro).apply(null, arguments);
    };
    var Dq = b._emscripten_bind_btSequentialImpulseConstraintSolver_btSequentialImpulseConstraintSolver_0 = function () {
      return (Dq = b._emscripten_bind_btSequentialImpulseConstraintSolver_btSequentialImpulseConstraintSolver_0 = b.asm.so).apply(null, arguments);
    };
    var Eq = b._emscripten_bind_btSequentialImpulseConstraintSolver___destroy___0 = function () {
      return (Eq = b._emscripten_bind_btSequentialImpulseConstraintSolver___destroy___0 = b.asm.to).apply(null, arguments);
    };
    var Fq = b._emscripten_bind_tAnchorArray_size_0 = function () {
      return (Fq = b._emscripten_bind_tAnchorArray_size_0 = b.asm.uo).apply(null, arguments);
    };
    var Gq = b._emscripten_bind_tAnchorArray_at_1 = function () {
      return (Gq = b._emscripten_bind_tAnchorArray_at_1 = b.asm.vo).apply(null, arguments);
    };
    var Hq = b._emscripten_bind_tAnchorArray_clear_0 = function () {
      return (Hq = b._emscripten_bind_tAnchorArray_clear_0 = b.asm.wo).apply(null, arguments);
    };
    var Iq = b._emscripten_bind_tAnchorArray_push_back_1 = function () {
      return (Iq = b._emscripten_bind_tAnchorArray_push_back_1 = b.asm.xo).apply(null, arguments);
    };
    var Jq = b._emscripten_bind_tAnchorArray_pop_back_0 = function () {
      return (Jq = b._emscripten_bind_tAnchorArray_pop_back_0 = b.asm.yo).apply(null, arguments);
    };
    var Kq = b._emscripten_bind_tAnchorArray___destroy___0 = function () {
      return (Kq = b._emscripten_bind_tAnchorArray___destroy___0 = b.asm.zo).apply(null, arguments);
    };
    var Lq = b._emscripten_bind_RaycastInfo_get_m_contactNormalWS_0 = function () {
      return (Lq = b._emscripten_bind_RaycastInfo_get_m_contactNormalWS_0 = b.asm.Ao).apply(null, arguments);
    };
    var Mq = b._emscripten_bind_RaycastInfo_set_m_contactNormalWS_1 = function () {
      return (Mq = b._emscripten_bind_RaycastInfo_set_m_contactNormalWS_1 = b.asm.Bo).apply(null, arguments);
    };
    var Nq = b._emscripten_bind_RaycastInfo_get_m_contactPointWS_0 = function () {
      return (Nq = b._emscripten_bind_RaycastInfo_get_m_contactPointWS_0 = b.asm.Co).apply(null, arguments);
    };
    var Oq = b._emscripten_bind_RaycastInfo_set_m_contactPointWS_1 = function () {
      return (Oq = b._emscripten_bind_RaycastInfo_set_m_contactPointWS_1 = b.asm.Do).apply(null, arguments);
    };
    var Pq = b._emscripten_bind_RaycastInfo_get_m_suspensionLength_0 = function () {
      return (Pq = b._emscripten_bind_RaycastInfo_get_m_suspensionLength_0 = b.asm.Eo).apply(null, arguments);
    };
    var Qq = b._emscripten_bind_RaycastInfo_set_m_suspensionLength_1 = function () {
      return (Qq = b._emscripten_bind_RaycastInfo_set_m_suspensionLength_1 = b.asm.Fo).apply(null, arguments);
    };
    var Rq = b._emscripten_bind_RaycastInfo_get_m_hardPointWS_0 = function () {
      return (Rq = b._emscripten_bind_RaycastInfo_get_m_hardPointWS_0 = b.asm.Go).apply(null, arguments);
    };
    var Sq = b._emscripten_bind_RaycastInfo_set_m_hardPointWS_1 = function () {
      return (Sq = b._emscripten_bind_RaycastInfo_set_m_hardPointWS_1 = b.asm.Ho).apply(null, arguments);
    };
    var Tq = b._emscripten_bind_RaycastInfo_get_m_wheelDirectionWS_0 = function () {
      return (Tq = b._emscripten_bind_RaycastInfo_get_m_wheelDirectionWS_0 = b.asm.Io).apply(null, arguments);
    };
    var Uq = b._emscripten_bind_RaycastInfo_set_m_wheelDirectionWS_1 = function () {
      return (Uq = b._emscripten_bind_RaycastInfo_set_m_wheelDirectionWS_1 = b.asm.Jo).apply(null, arguments);
    };
    var Vq = b._emscripten_bind_RaycastInfo_get_m_wheelAxleWS_0 = function () {
      return (Vq = b._emscripten_bind_RaycastInfo_get_m_wheelAxleWS_0 = b.asm.Ko).apply(null, arguments);
    };
    var Wq = b._emscripten_bind_RaycastInfo_set_m_wheelAxleWS_1 = function () {
      return (Wq = b._emscripten_bind_RaycastInfo_set_m_wheelAxleWS_1 = b.asm.Lo).apply(null, arguments);
    };
    var Xq = b._emscripten_bind_RaycastInfo_get_m_isInContact_0 = function () {
      return (Xq = b._emscripten_bind_RaycastInfo_get_m_isInContact_0 = b.asm.Mo).apply(null, arguments);
    };
    var Yq = b._emscripten_bind_RaycastInfo_set_m_isInContact_1 = function () {
      return (Yq = b._emscripten_bind_RaycastInfo_set_m_isInContact_1 = b.asm.No).apply(null, arguments);
    };
    var Zq = b._emscripten_bind_RaycastInfo_get_m_groundObject_0 = function () {
      return (Zq = b._emscripten_bind_RaycastInfo_get_m_groundObject_0 = b.asm.Oo).apply(null, arguments);
    };
    var $q = b._emscripten_bind_RaycastInfo_set_m_groundObject_1 = function () {
      return ($q = b._emscripten_bind_RaycastInfo_set_m_groundObject_1 = b.asm.Po).apply(null, arguments);
    };
    var ar = b._emscripten_bind_RaycastInfo___destroy___0 = function () {
      return (ar = b._emscripten_bind_RaycastInfo___destroy___0 = b.asm.Qo).apply(null, arguments);
    };
    var br = b._emscripten_bind_btMultiSphereShape_btMultiSphereShape_3 = function () {
      return (br = b._emscripten_bind_btMultiSphereShape_btMultiSphereShape_3 = b.asm.Ro).apply(null, arguments);
    };
    var cr = b._emscripten_bind_btMultiSphereShape_setLocalScaling_1 = function () {
      return (cr = b._emscripten_bind_btMultiSphereShape_setLocalScaling_1 = b.asm.So).apply(null, arguments);
    };
    var dr = b._emscripten_bind_btMultiSphereShape_getLocalScaling_0 = function () {
      return (dr = b._emscripten_bind_btMultiSphereShape_getLocalScaling_0 = b.asm.To).apply(null, arguments);
    };
    var er = b._emscripten_bind_btMultiSphereShape_calculateLocalInertia_2 = function () {
      return (er = b._emscripten_bind_btMultiSphereShape_calculateLocalInertia_2 = b.asm.Uo).apply(null, arguments);
    };
    var fr = b._emscripten_bind_btMultiSphereShape___destroy___0 = function () {
      return (fr = b._emscripten_bind_btMultiSphereShape___destroy___0 = b.asm.Vo).apply(null, arguments);
    };
    var gr = b._emscripten_bind_btSoftBody_btSoftBody_4 = function () {
      return (gr = b._emscripten_bind_btSoftBody_btSoftBody_4 = b.asm.Wo).apply(null, arguments);
    };
    var hr = b._emscripten_bind_btSoftBody_checkLink_2 = function () {
      return (hr = b._emscripten_bind_btSoftBody_checkLink_2 = b.asm.Xo).apply(null, arguments);
    };
    var ir = b._emscripten_bind_btSoftBody_checkFace_3 = function () {
      return (ir = b._emscripten_bind_btSoftBody_checkFace_3 = b.asm.Yo).apply(null, arguments);
    };
    var jr = b._emscripten_bind_btSoftBody_appendMaterial_0 = function () {
      return (jr = b._emscripten_bind_btSoftBody_appendMaterial_0 = b.asm.Zo).apply(null, arguments);
    };
    var kr = b._emscripten_bind_btSoftBody_appendNode_2 = function () {
      return (kr = b._emscripten_bind_btSoftBody_appendNode_2 = b.asm._o).apply(null, arguments);
    };
    var lr = b._emscripten_bind_btSoftBody_appendLink_4 = function () {
      return (lr = b._emscripten_bind_btSoftBody_appendLink_4 = b.asm.$o).apply(null, arguments);
    };
    var mr = b._emscripten_bind_btSoftBody_appendFace_4 = function () {
      return (mr = b._emscripten_bind_btSoftBody_appendFace_4 = b.asm.ap).apply(null, arguments);
    };
    var nr = b._emscripten_bind_btSoftBody_appendTetra_5 = function () {
      return (nr = b._emscripten_bind_btSoftBody_appendTetra_5 = b.asm.bp).apply(null, arguments);
    };
    var or = b._emscripten_bind_btSoftBody_appendAnchor_4 = function () {
      return (or = b._emscripten_bind_btSoftBody_appendAnchor_4 = b.asm.cp).apply(null, arguments);
    };
    var pr = b._emscripten_bind_btSoftBody_addForce_1 = function () {
      return (pr = b._emscripten_bind_btSoftBody_addForce_1 = b.asm.dp).apply(null, arguments);
    };
    var qr = b._emscripten_bind_btSoftBody_addForce_2 = function () {
      return (qr = b._emscripten_bind_btSoftBody_addForce_2 = b.asm.ep).apply(null, arguments);
    };
    var rr = b._emscripten_bind_btSoftBody_addAeroForceToNode_2 = function () {
      return (rr = b._emscripten_bind_btSoftBody_addAeroForceToNode_2 = b.asm.fp).apply(null, arguments);
    };
    var sr = b._emscripten_bind_btSoftBody_getTotalMass_0 = function () {
      return (sr = b._emscripten_bind_btSoftBody_getTotalMass_0 = b.asm.gp).apply(null, arguments);
    };
    var tr = b._emscripten_bind_btSoftBody_setTotalMass_2 = function () {
      return (tr = b._emscripten_bind_btSoftBody_setTotalMass_2 = b.asm.hp).apply(null, arguments);
    };
    var ur = b._emscripten_bind_btSoftBody_setMass_2 = function () {
      return (ur = b._emscripten_bind_btSoftBody_setMass_2 = b.asm.ip).apply(null, arguments);
    };
    var vr = b._emscripten_bind_btSoftBody_transform_1 = function () {
      return (vr = b._emscripten_bind_btSoftBody_transform_1 = b.asm.jp).apply(null, arguments);
    };
    var wr = b._emscripten_bind_btSoftBody_translate_1 = function () {
      return (wr = b._emscripten_bind_btSoftBody_translate_1 = b.asm.kp).apply(null, arguments);
    };
    var xr = b._emscripten_bind_btSoftBody_rotate_1 = function () {
      return (xr = b._emscripten_bind_btSoftBody_rotate_1 = b.asm.lp).apply(null, arguments);
    };
    var yr = b._emscripten_bind_btSoftBody_scale_1 = function () {
      return (yr = b._emscripten_bind_btSoftBody_scale_1 = b.asm.mp).apply(null, arguments);
    };
    var zr = b._emscripten_bind_btSoftBody_generateClusters_1 = function () {
      return (zr = b._emscripten_bind_btSoftBody_generateClusters_1 = b.asm.np).apply(null, arguments);
    };
    var Ar = b._emscripten_bind_btSoftBody_generateClusters_2 = function () {
      return (Ar = b._emscripten_bind_btSoftBody_generateClusters_2 = b.asm.op).apply(null, arguments);
    };
    var Br = b._emscripten_bind_btSoftBody_generateBendingConstraints_2 = function () {
      return (Br = b._emscripten_bind_btSoftBody_generateBendingConstraints_2 = b.asm.pp).apply(null, arguments);
    };
    var Cr = b._emscripten_bind_btSoftBody_upcast_1 = function () {
      return (Cr = b._emscripten_bind_btSoftBody_upcast_1 = b.asm.qp).apply(null, arguments);
    };
    var Dr = b._emscripten_bind_btSoftBody_setAnisotropicFriction_2 = function () {
      return (Dr = b._emscripten_bind_btSoftBody_setAnisotropicFriction_2 = b.asm.rp).apply(null, arguments);
    };
    var Er = b._emscripten_bind_btSoftBody_getCollisionShape_0 = function () {
      return (Er = b._emscripten_bind_btSoftBody_getCollisionShape_0 = b.asm.sp).apply(null, arguments);
    };
    var Fr = b._emscripten_bind_btSoftBody_setContactProcessingThreshold_1 = function () {
      return (Fr = b._emscripten_bind_btSoftBody_setContactProcessingThreshold_1 = b.asm.tp).apply(null, arguments);
    };
    var Gr = b._emscripten_bind_btSoftBody_setActivationState_1 = function () {
      return (Gr = b._emscripten_bind_btSoftBody_setActivationState_1 = b.asm.up).apply(null, arguments);
    };
    var Hr = b._emscripten_bind_btSoftBody_forceActivationState_1 = function () {
      return (Hr = b._emscripten_bind_btSoftBody_forceActivationState_1 = b.asm.vp).apply(null, arguments);
    };
    var Ir = b._emscripten_bind_btSoftBody_activate_0 = function () {
      return (Ir = b._emscripten_bind_btSoftBody_activate_0 = b.asm.wp).apply(null, arguments);
    };
    var Jr = b._emscripten_bind_btSoftBody_activate_1 = function () {
      return (Jr = b._emscripten_bind_btSoftBody_activate_1 = b.asm.xp).apply(null, arguments);
    };
    var Kr = b._emscripten_bind_btSoftBody_isActive_0 = function () {
      return (Kr = b._emscripten_bind_btSoftBody_isActive_0 = b.asm.yp).apply(null, arguments);
    };
    var Lr = b._emscripten_bind_btSoftBody_isKinematicObject_0 = function () {
      return (Lr = b._emscripten_bind_btSoftBody_isKinematicObject_0 = b.asm.zp).apply(null, arguments);
    };
    var Mr = b._emscripten_bind_btSoftBody_isStaticObject_0 = function () {
      return (Mr = b._emscripten_bind_btSoftBody_isStaticObject_0 = b.asm.Ap).apply(null, arguments);
    };
    var Nr = b._emscripten_bind_btSoftBody_isStaticOrKinematicObject_0 = function () {
      return (Nr = b._emscripten_bind_btSoftBody_isStaticOrKinematicObject_0 = b.asm.Bp).apply(null, arguments);
    };
    var Or = b._emscripten_bind_btSoftBody_getRestitution_0 = function () {
      return (Or = b._emscripten_bind_btSoftBody_getRestitution_0 = b.asm.Cp).apply(null, arguments);
    };
    var Pr = b._emscripten_bind_btSoftBody_getFriction_0 = function () {
      return (Pr = b._emscripten_bind_btSoftBody_getFriction_0 = b.asm.Dp).apply(null, arguments);
    };
    var Qr = b._emscripten_bind_btSoftBody_getRollingFriction_0 = function () {
      return (Qr = b._emscripten_bind_btSoftBody_getRollingFriction_0 = b.asm.Ep).apply(null, arguments);
    };
    var Rr = b._emscripten_bind_btSoftBody_setRestitution_1 = function () {
      return (Rr = b._emscripten_bind_btSoftBody_setRestitution_1 = b.asm.Fp).apply(null, arguments);
    };
    var Sr = b._emscripten_bind_btSoftBody_setFriction_1 = function () {
      return (Sr = b._emscripten_bind_btSoftBody_setFriction_1 = b.asm.Gp).apply(null, arguments);
    };
    var Tr = b._emscripten_bind_btSoftBody_setRollingFriction_1 = function () {
      return (Tr = b._emscripten_bind_btSoftBody_setRollingFriction_1 = b.asm.Hp).apply(null, arguments);
    };
    var Ur = b._emscripten_bind_btSoftBody_getWorldTransform_0 = function () {
      return (Ur = b._emscripten_bind_btSoftBody_getWorldTransform_0 = b.asm.Ip).apply(null, arguments);
    };
    var Vr = b._emscripten_bind_btSoftBody_getCollisionFlags_0 = function () {
      return (Vr = b._emscripten_bind_btSoftBody_getCollisionFlags_0 = b.asm.Jp).apply(null, arguments);
    };
    var Wr = b._emscripten_bind_btSoftBody_setCollisionFlags_1 = function () {
      return (Wr = b._emscripten_bind_btSoftBody_setCollisionFlags_1 = b.asm.Kp).apply(null, arguments);
    };
    var Xr = b._emscripten_bind_btSoftBody_setWorldTransform_1 = function () {
      return (Xr = b._emscripten_bind_btSoftBody_setWorldTransform_1 = b.asm.Lp).apply(null, arguments);
    };
    var Yr = b._emscripten_bind_btSoftBody_setCollisionShape_1 = function () {
      return (Yr = b._emscripten_bind_btSoftBody_setCollisionShape_1 = b.asm.Mp).apply(null, arguments);
    };
    var Zr = b._emscripten_bind_btSoftBody_setCcdMotionThreshold_1 = function () {
      return (Zr = b._emscripten_bind_btSoftBody_setCcdMotionThreshold_1 = b.asm.Np).apply(null, arguments);
    };
    var $r = b._emscripten_bind_btSoftBody_setCcdSweptSphereRadius_1 = function () {
      return ($r = b._emscripten_bind_btSoftBody_setCcdSweptSphereRadius_1 = b.asm.Op).apply(null, arguments);
    };
    var as = b._emscripten_bind_btSoftBody_getUserIndex_0 = function () {
      return (as = b._emscripten_bind_btSoftBody_getUserIndex_0 = b.asm.Pp).apply(null, arguments);
    };
    var bs = b._emscripten_bind_btSoftBody_setUserIndex_1 = function () {
      return (bs = b._emscripten_bind_btSoftBody_setUserIndex_1 = b.asm.Qp).apply(null, arguments);
    };
    var cs = b._emscripten_bind_btSoftBody_getUserPointer_0 = function () {
      return (cs = b._emscripten_bind_btSoftBody_getUserPointer_0 = b.asm.Rp).apply(null, arguments);
    };
    var ds = b._emscripten_bind_btSoftBody_setUserPointer_1 = function () {
      return (ds = b._emscripten_bind_btSoftBody_setUserPointer_1 = b.asm.Sp).apply(null, arguments);
    };
    var es = b._emscripten_bind_btSoftBody_getBroadphaseHandle_0 = function () {
      return (es = b._emscripten_bind_btSoftBody_getBroadphaseHandle_0 = b.asm.Tp).apply(null, arguments);
    };
    var gs = b._emscripten_bind_btSoftBody_get_m_cfg_0 = function () {
      return (gs = b._emscripten_bind_btSoftBody_get_m_cfg_0 = b.asm.Up).apply(null, arguments);
    };
    var hs = b._emscripten_bind_btSoftBody_set_m_cfg_1 = function () {
      return (hs = b._emscripten_bind_btSoftBody_set_m_cfg_1 = b.asm.Vp).apply(null, arguments);
    };
    var is = b._emscripten_bind_btSoftBody_get_m_nodes_0 = function () {
      return (is = b._emscripten_bind_btSoftBody_get_m_nodes_0 = b.asm.Wp).apply(null, arguments);
    };
    var js = b._emscripten_bind_btSoftBody_set_m_nodes_1 = function () {
      return (js = b._emscripten_bind_btSoftBody_set_m_nodes_1 = b.asm.Xp).apply(null, arguments);
    };
    var ks = b._emscripten_bind_btSoftBody_get_m_materials_0 = function () {
      return (ks = b._emscripten_bind_btSoftBody_get_m_materials_0 = b.asm.Yp).apply(null, arguments);
    };
    var ls = b._emscripten_bind_btSoftBody_set_m_materials_1 = function () {
      return (ls = b._emscripten_bind_btSoftBody_set_m_materials_1 = b.asm.Zp).apply(null, arguments);
    };
    var ms = b._emscripten_bind_btSoftBody_get_m_anchors_0 = function () {
      return (ms = b._emscripten_bind_btSoftBody_get_m_anchors_0 = b.asm._p).apply(null, arguments);
    };
    var ns = b._emscripten_bind_btSoftBody_set_m_anchors_1 = function () {
      return (ns = b._emscripten_bind_btSoftBody_set_m_anchors_1 = b.asm.$p).apply(null, arguments);
    };
    var ps = b._emscripten_bind_btSoftBody___destroy___0 = function () {
      return (ps = b._emscripten_bind_btSoftBody___destroy___0 = b.asm.aq).apply(null, arguments);
    };
    var qs = b._emscripten_bind_btIntArray_size_0 = function () {
      return (qs = b._emscripten_bind_btIntArray_size_0 = b.asm.bq).apply(null, arguments);
    };
    var rs = b._emscripten_bind_btIntArray_at_1 = function () {
      return (rs = b._emscripten_bind_btIntArray_at_1 = b.asm.cq).apply(null, arguments);
    };
    var ss = b._emscripten_bind_btIntArray___destroy___0 = function () {
      return (ss = b._emscripten_bind_btIntArray___destroy___0 = b.asm.dq).apply(null, arguments);
    };
    var ts = b._emscripten_bind_Config_get_kVCF_0 = function () {
      return (ts = b._emscripten_bind_Config_get_kVCF_0 = b.asm.eq).apply(null, arguments);
    };
    var us = b._emscripten_bind_Config_set_kVCF_1 = function () {
      return (us = b._emscripten_bind_Config_set_kVCF_1 = b.asm.fq).apply(null, arguments);
    };
    var vs = b._emscripten_bind_Config_get_kDP_0 = function () {
      return (vs = b._emscripten_bind_Config_get_kDP_0 = b.asm.gq).apply(null, arguments);
    };
    var xs = b._emscripten_bind_Config_set_kDP_1 = function () {
      return (xs = b._emscripten_bind_Config_set_kDP_1 = b.asm.hq).apply(null, arguments);
    };
    var ys = b._emscripten_bind_Config_get_kDG_0 = function () {
      return (ys = b._emscripten_bind_Config_get_kDG_0 = b.asm.iq).apply(null, arguments);
    };
    var zs = b._emscripten_bind_Config_set_kDG_1 = function () {
      return (zs = b._emscripten_bind_Config_set_kDG_1 = b.asm.jq).apply(null, arguments);
    };
    var As = b._emscripten_bind_Config_get_kLF_0 = function () {
      return (As = b._emscripten_bind_Config_get_kLF_0 = b.asm.kq).apply(null, arguments);
    };
    var Bs = b._emscripten_bind_Config_set_kLF_1 = function () {
      return (Bs = b._emscripten_bind_Config_set_kLF_1 = b.asm.lq).apply(null, arguments);
    };
    var Cs = b._emscripten_bind_Config_get_kPR_0 = function () {
      return (Cs = b._emscripten_bind_Config_get_kPR_0 = b.asm.mq).apply(null, arguments);
    };
    var Ds = b._emscripten_bind_Config_set_kPR_1 = function () {
      return (Ds = b._emscripten_bind_Config_set_kPR_1 = b.asm.nq).apply(null, arguments);
    };
    var Es = b._emscripten_bind_Config_get_kVC_0 = function () {
      return (Es = b._emscripten_bind_Config_get_kVC_0 = b.asm.oq).apply(null, arguments);
    };
    var Fs = b._emscripten_bind_Config_set_kVC_1 = function () {
      return (Fs = b._emscripten_bind_Config_set_kVC_1 = b.asm.pq).apply(null, arguments);
    };
    var Gs = b._emscripten_bind_Config_get_kDF_0 = function () {
      return (Gs = b._emscripten_bind_Config_get_kDF_0 = b.asm.qq).apply(null, arguments);
    };
    var Hs = b._emscripten_bind_Config_set_kDF_1 = function () {
      return (Hs = b._emscripten_bind_Config_set_kDF_1 = b.asm.rq).apply(null, arguments);
    };
    var Is = b._emscripten_bind_Config_get_kMT_0 = function () {
      return (Is = b._emscripten_bind_Config_get_kMT_0 = b.asm.sq).apply(null, arguments);
    };
    var Js = b._emscripten_bind_Config_set_kMT_1 = function () {
      return (Js = b._emscripten_bind_Config_set_kMT_1 = b.asm.tq).apply(null, arguments);
    };
    var Ks = b._emscripten_bind_Config_get_kCHR_0 = function () {
      return (Ks = b._emscripten_bind_Config_get_kCHR_0 = b.asm.uq).apply(null, arguments);
    };
    var Ls = b._emscripten_bind_Config_set_kCHR_1 = function () {
      return (Ls = b._emscripten_bind_Config_set_kCHR_1 = b.asm.vq).apply(null, arguments);
    };
    var Ms = b._emscripten_bind_Config_get_kKHR_0 = function () {
      return (Ms = b._emscripten_bind_Config_get_kKHR_0 = b.asm.wq).apply(null, arguments);
    };
    var Ns = b._emscripten_bind_Config_set_kKHR_1 = function () {
      return (Ns = b._emscripten_bind_Config_set_kKHR_1 = b.asm.xq).apply(null, arguments);
    };
    var Os = b._emscripten_bind_Config_get_kSHR_0 = function () {
      return (Os = b._emscripten_bind_Config_get_kSHR_0 = b.asm.yq).apply(null, arguments);
    };
    var Ps = b._emscripten_bind_Config_set_kSHR_1 = function () {
      return (Ps = b._emscripten_bind_Config_set_kSHR_1 = b.asm.zq).apply(null, arguments);
    };
    var Qs = b._emscripten_bind_Config_get_kAHR_0 = function () {
      return (Qs = b._emscripten_bind_Config_get_kAHR_0 = b.asm.Aq).apply(null, arguments);
    };
    var Rs = b._emscripten_bind_Config_set_kAHR_1 = function () {
      return (Rs = b._emscripten_bind_Config_set_kAHR_1 = b.asm.Bq).apply(null, arguments);
    };
    var Ss = b._emscripten_bind_Config_get_kSRHR_CL_0 = function () {
      return (Ss = b._emscripten_bind_Config_get_kSRHR_CL_0 = b.asm.Cq).apply(null, arguments);
    };
    var Ts = b._emscripten_bind_Config_set_kSRHR_CL_1 = function () {
      return (Ts = b._emscripten_bind_Config_set_kSRHR_CL_1 = b.asm.Dq).apply(null, arguments);
    };
    var Us = b._emscripten_bind_Config_get_kSKHR_CL_0 = function () {
      return (Us = b._emscripten_bind_Config_get_kSKHR_CL_0 = b.asm.Eq).apply(null, arguments);
    };
    var Vs = b._emscripten_bind_Config_set_kSKHR_CL_1 = function () {
      return (Vs = b._emscripten_bind_Config_set_kSKHR_CL_1 = b.asm.Fq).apply(null, arguments);
    };
    var Ws = b._emscripten_bind_Config_get_kSSHR_CL_0 = function () {
      return (Ws = b._emscripten_bind_Config_get_kSSHR_CL_0 = b.asm.Gq).apply(null, arguments);
    };
    var Xs = b._emscripten_bind_Config_set_kSSHR_CL_1 = function () {
      return (Xs = b._emscripten_bind_Config_set_kSSHR_CL_1 = b.asm.Hq).apply(null, arguments);
    };
    var Ys = b._emscripten_bind_Config_get_kSR_SPLT_CL_0 = function () {
      return (Ys = b._emscripten_bind_Config_get_kSR_SPLT_CL_0 = b.asm.Iq).apply(null, arguments);
    };
    var Zs = b._emscripten_bind_Config_set_kSR_SPLT_CL_1 = function () {
      return (Zs = b._emscripten_bind_Config_set_kSR_SPLT_CL_1 = b.asm.Jq).apply(null, arguments);
    };
    var $s = b._emscripten_bind_Config_get_kSK_SPLT_CL_0 = function () {
      return ($s = b._emscripten_bind_Config_get_kSK_SPLT_CL_0 = b.asm.Kq).apply(null, arguments);
    };
    var at = b._emscripten_bind_Config_set_kSK_SPLT_CL_1 = function () {
      return (at = b._emscripten_bind_Config_set_kSK_SPLT_CL_1 = b.asm.Lq).apply(null, arguments);
    };
    var bt = b._emscripten_bind_Config_get_kSS_SPLT_CL_0 = function () {
      return (bt = b._emscripten_bind_Config_get_kSS_SPLT_CL_0 = b.asm.Mq).apply(null, arguments);
    };
    var ct = b._emscripten_bind_Config_set_kSS_SPLT_CL_1 = function () {
      return (ct = b._emscripten_bind_Config_set_kSS_SPLT_CL_1 = b.asm.Nq).apply(null, arguments);
    };
    var dt = b._emscripten_bind_Config_get_maxvolume_0 = function () {
      return (dt = b._emscripten_bind_Config_get_maxvolume_0 = b.asm.Oq).apply(null, arguments);
    };
    var et = b._emscripten_bind_Config_set_maxvolume_1 = function () {
      return (et = b._emscripten_bind_Config_set_maxvolume_1 = b.asm.Pq).apply(null, arguments);
    };
    var ft = b._emscripten_bind_Config_get_timescale_0 = function () {
      return (ft = b._emscripten_bind_Config_get_timescale_0 = b.asm.Qq).apply(null, arguments);
    };
    var gt = b._emscripten_bind_Config_set_timescale_1 = function () {
      return (gt = b._emscripten_bind_Config_set_timescale_1 = b.asm.Rq).apply(null, arguments);
    };
    var ht = b._emscripten_bind_Config_get_viterations_0 = function () {
      return (ht = b._emscripten_bind_Config_get_viterations_0 = b.asm.Sq).apply(null, arguments);
    };
    var it = b._emscripten_bind_Config_set_viterations_1 = function () {
      return (it = b._emscripten_bind_Config_set_viterations_1 = b.asm.Tq).apply(null, arguments);
    };
    var jt = b._emscripten_bind_Config_get_piterations_0 = function () {
      return (jt = b._emscripten_bind_Config_get_piterations_0 = b.asm.Uq).apply(null, arguments);
    };
    var kt = b._emscripten_bind_Config_set_piterations_1 = function () {
      return (kt = b._emscripten_bind_Config_set_piterations_1 = b.asm.Vq).apply(null, arguments);
    };
    var lt = b._emscripten_bind_Config_get_diterations_0 = function () {
      return (lt = b._emscripten_bind_Config_get_diterations_0 = b.asm.Wq).apply(null, arguments);
    };
    var mt = b._emscripten_bind_Config_set_diterations_1 = function () {
      return (mt = b._emscripten_bind_Config_set_diterations_1 = b.asm.Xq).apply(null, arguments);
    };
    var nt = b._emscripten_bind_Config_get_citerations_0 = function () {
      return (nt = b._emscripten_bind_Config_get_citerations_0 = b.asm.Yq).apply(null, arguments);
    };
    var ot = b._emscripten_bind_Config_set_citerations_1 = function () {
      return (ot = b._emscripten_bind_Config_set_citerations_1 = b.asm.Zq).apply(null, arguments);
    };
    var pt = b._emscripten_bind_Config_get_collisions_0 = function () {
      return (pt = b._emscripten_bind_Config_get_collisions_0 = b.asm._q).apply(null, arguments);
    };
    var qt = b._emscripten_bind_Config_set_collisions_1 = function () {
      return (qt = b._emscripten_bind_Config_set_collisions_1 = b.asm.$q).apply(null, arguments);
    };
    var rt = b._emscripten_bind_Config___destroy___0 = function () {
      return (rt = b._emscripten_bind_Config___destroy___0 = b.asm.ar).apply(null, arguments);
    };
    var st = b._emscripten_bind_Node_get_m_x_0 = function () {
      return (st = b._emscripten_bind_Node_get_m_x_0 = b.asm.br).apply(null, arguments);
    };
    var tt = b._emscripten_bind_Node_set_m_x_1 = function () {
      return (tt = b._emscripten_bind_Node_set_m_x_1 = b.asm.cr).apply(null, arguments);
    };
    var ut = b._emscripten_bind_Node_get_m_q_0 = function () {
      return (ut = b._emscripten_bind_Node_get_m_q_0 = b.asm.dr).apply(null, arguments);
    };
    var vt = b._emscripten_bind_Node_set_m_q_1 = function () {
      return (vt = b._emscripten_bind_Node_set_m_q_1 = b.asm.er).apply(null, arguments);
    };
    var wt = b._emscripten_bind_Node_get_m_v_0 = function () {
      return (wt = b._emscripten_bind_Node_get_m_v_0 = b.asm.fr).apply(null, arguments);
    };
    var xt = b._emscripten_bind_Node_set_m_v_1 = function () {
      return (xt = b._emscripten_bind_Node_set_m_v_1 = b.asm.gr).apply(null, arguments);
    };
    var yt = b._emscripten_bind_Node_get_m_f_0 = function () {
      return (yt = b._emscripten_bind_Node_get_m_f_0 = b.asm.hr).apply(null, arguments);
    };
    var zt = b._emscripten_bind_Node_set_m_f_1 = function () {
      return (zt = b._emscripten_bind_Node_set_m_f_1 = b.asm.ir).apply(null, arguments);
    };
    var At = b._emscripten_bind_Node_get_m_n_0 = function () {
      return (At = b._emscripten_bind_Node_get_m_n_0 = b.asm.jr).apply(null, arguments);
    };
    var Bt = b._emscripten_bind_Node_set_m_n_1 = function () {
      return (Bt = b._emscripten_bind_Node_set_m_n_1 = b.asm.kr).apply(null, arguments);
    };
    var Ct = b._emscripten_bind_Node_get_m_im_0 = function () {
      return (Ct = b._emscripten_bind_Node_get_m_im_0 = b.asm.lr).apply(null, arguments);
    };
    var Dt = b._emscripten_bind_Node_set_m_im_1 = function () {
      return (Dt = b._emscripten_bind_Node_set_m_im_1 = b.asm.mr).apply(null, arguments);
    };
    var Et = b._emscripten_bind_Node_get_m_area_0 = function () {
      return (Et = b._emscripten_bind_Node_get_m_area_0 = b.asm.nr).apply(null, arguments);
    };
    var Ft = b._emscripten_bind_Node_set_m_area_1 = function () {
      return (Ft = b._emscripten_bind_Node_set_m_area_1 = b.asm.or).apply(null, arguments);
    };
    var Gt = b._emscripten_bind_Node___destroy___0 = function () {
      return (Gt = b._emscripten_bind_Node___destroy___0 = b.asm.pr).apply(null, arguments);
    };
    var Ht = b._emscripten_bind_btGhostPairCallback_btGhostPairCallback_0 = function () {
      return (Ht = b._emscripten_bind_btGhostPairCallback_btGhostPairCallback_0 = b.asm.qr).apply(null, arguments);
    };
    var It = b._emscripten_bind_btGhostPairCallback___destroy___0 = function () {
      return (It = b._emscripten_bind_btGhostPairCallback___destroy___0 = b.asm.rr).apply(null, arguments);
    };
    var Jt = b._emscripten_bind_btOverlappingPairCallback___destroy___0 = function () {
      return (Jt = b._emscripten_bind_btOverlappingPairCallback___destroy___0 = b.asm.sr).apply(null, arguments);
    };
    var Kt = b._emscripten_bind_btKinematicCharacterController_btKinematicCharacterController_3 = function () {
      return (Kt = b._emscripten_bind_btKinematicCharacterController_btKinematicCharacterController_3 = b.asm.tr).apply(null, arguments);
    };
    var Lt = b._emscripten_bind_btKinematicCharacterController_btKinematicCharacterController_4 = function () {
      return (Lt = b._emscripten_bind_btKinematicCharacterController_btKinematicCharacterController_4 = b.asm.ur).apply(null, arguments);
    };
    var Mt = b._emscripten_bind_btKinematicCharacterController_setUpAxis_1 = function () {
      return (Mt = b._emscripten_bind_btKinematicCharacterController_setUpAxis_1 = b.asm.vr).apply(null, arguments);
    };
    var Nt = b._emscripten_bind_btKinematicCharacterController_setWalkDirection_1 = function () {
      return (Nt = b._emscripten_bind_btKinematicCharacterController_setWalkDirection_1 = b.asm.wr).apply(null, arguments);
    };
    var Ot = b._emscripten_bind_btKinematicCharacterController_setVelocityForTimeInterval_2 = function () {
      return (Ot = b._emscripten_bind_btKinematicCharacterController_setVelocityForTimeInterval_2 = b.asm.xr).apply(null, arguments);
    };
    var Pt = b._emscripten_bind_btKinematicCharacterController_warp_1 = function () {
      return (Pt = b._emscripten_bind_btKinematicCharacterController_warp_1 = b.asm.yr).apply(null, arguments);
    };
    var Qt = b._emscripten_bind_btKinematicCharacterController_preStep_1 = function () {
      return (Qt = b._emscripten_bind_btKinematicCharacterController_preStep_1 = b.asm.zr).apply(null, arguments);
    };
    var Rt = b._emscripten_bind_btKinematicCharacterController_playerStep_2 = function () {
      return (Rt = b._emscripten_bind_btKinematicCharacterController_playerStep_2 = b.asm.Ar).apply(null, arguments);
    };
    var St = b._emscripten_bind_btKinematicCharacterController_setFallSpeed_1 = function () {
      return (St = b._emscripten_bind_btKinematicCharacterController_setFallSpeed_1 = b.asm.Br).apply(null, arguments);
    };
    var Tt = b._emscripten_bind_btKinematicCharacterController_setJumpSpeed_1 = function () {
      return (Tt = b._emscripten_bind_btKinematicCharacterController_setJumpSpeed_1 = b.asm.Cr).apply(null, arguments);
    };
    var Ut = b._emscripten_bind_btKinematicCharacterController_setMaxJumpHeight_1 = function () {
      return (Ut = b._emscripten_bind_btKinematicCharacterController_setMaxJumpHeight_1 = b.asm.Dr).apply(null, arguments);
    };
    var Vt = b._emscripten_bind_btKinematicCharacterController_canJump_0 = function () {
      return (Vt = b._emscripten_bind_btKinematicCharacterController_canJump_0 = b.asm.Er).apply(null, arguments);
    };
    var Wt = b._emscripten_bind_btKinematicCharacterController_jump_0 = function () {
      return (Wt = b._emscripten_bind_btKinematicCharacterController_jump_0 = b.asm.Fr).apply(null, arguments);
    };
    var Xt = b._emscripten_bind_btKinematicCharacterController_setGravity_1 = function () {
      return (Xt = b._emscripten_bind_btKinematicCharacterController_setGravity_1 = b.asm.Gr).apply(null, arguments);
    };
    var Yt = b._emscripten_bind_btKinematicCharacterController_getGravity_0 = function () {
      return (Yt = b._emscripten_bind_btKinematicCharacterController_getGravity_0 = b.asm.Hr).apply(null, arguments);
    };
    var Zt = b._emscripten_bind_btKinematicCharacterController_setMaxSlope_1 = function () {
      return (Zt = b._emscripten_bind_btKinematicCharacterController_setMaxSlope_1 = b.asm.Ir).apply(null, arguments);
    };
    var $t = b._emscripten_bind_btKinematicCharacterController_getMaxSlope_0 = function () {
      return ($t = b._emscripten_bind_btKinematicCharacterController_getMaxSlope_0 = b.asm.Jr).apply(null, arguments);
    };
    var au = b._emscripten_bind_btKinematicCharacterController_getGhostObject_0 = function () {
      return (au = b._emscripten_bind_btKinematicCharacterController_getGhostObject_0 = b.asm.Kr).apply(null, arguments);
    };
    var bu = b._emscripten_bind_btKinematicCharacterController_setUseGhostSweepTest_1 = function () {
      return (bu = b._emscripten_bind_btKinematicCharacterController_setUseGhostSweepTest_1 = b.asm.Lr).apply(null, arguments);
    };
    var cu = b._emscripten_bind_btKinematicCharacterController_onGround_0 = function () {
      return (cu = b._emscripten_bind_btKinematicCharacterController_onGround_0 = b.asm.Mr).apply(null, arguments);
    };
    var du = b._emscripten_bind_btKinematicCharacterController_setUpInterpolate_1 = function () {
      return (du = b._emscripten_bind_btKinematicCharacterController_setUpInterpolate_1 = b.asm.Nr).apply(null, arguments);
    };
    var eu = b._emscripten_bind_btKinematicCharacterController_updateAction_2 = function () {
      return (eu = b._emscripten_bind_btKinematicCharacterController_updateAction_2 = b.asm.Or).apply(null, arguments);
    };
    var fu = b._emscripten_bind_btKinematicCharacterController___destroy___0 = function () {
      return (fu = b._emscripten_bind_btKinematicCharacterController___destroy___0 = b.asm.Pr).apply(null, arguments);
    };
    var gu = b._emscripten_bind_btSoftBodyArray_size_0 = function () {
      return (gu = b._emscripten_bind_btSoftBodyArray_size_0 = b.asm.Qr).apply(null, arguments);
    };
    var hu = b._emscripten_bind_btSoftBodyArray_at_1 = function () {
      return (hu = b._emscripten_bind_btSoftBodyArray_at_1 = b.asm.Rr).apply(null, arguments);
    };
    var iu = b._emscripten_bind_btSoftBodyArray___destroy___0 = function () {
      return (iu = b._emscripten_bind_btSoftBodyArray___destroy___0 = b.asm.Sr).apply(null, arguments);
    };
    var ju = b._emscripten_bind_btFaceArray_size_0 = function () {
      return (ju = b._emscripten_bind_btFaceArray_size_0 = b.asm.Tr).apply(null, arguments);
    };
    var ku = b._emscripten_bind_btFaceArray_at_1 = function () {
      return (ku = b._emscripten_bind_btFaceArray_at_1 = b.asm.Ur).apply(null, arguments);
    };
    var lu = b._emscripten_bind_btFaceArray___destroy___0 = function () {
      return (lu = b._emscripten_bind_btFaceArray___destroy___0 = b.asm.Vr).apply(null, arguments);
    };
    var mu = b._emscripten_bind_btStaticPlaneShape_btStaticPlaneShape_2 = function () {
      return (mu = b._emscripten_bind_btStaticPlaneShape_btStaticPlaneShape_2 = b.asm.Wr).apply(null, arguments);
    };
    var nu = b._emscripten_bind_btStaticPlaneShape_setLocalScaling_1 = function () {
      return (nu = b._emscripten_bind_btStaticPlaneShape_setLocalScaling_1 = b.asm.Xr).apply(null, arguments);
    };
    var ou = b._emscripten_bind_btStaticPlaneShape_getLocalScaling_0 = function () {
      return (ou = b._emscripten_bind_btStaticPlaneShape_getLocalScaling_0 = b.asm.Yr).apply(null, arguments);
    };
    var pu = b._emscripten_bind_btStaticPlaneShape_calculateLocalInertia_2 = function () {
      return (pu = b._emscripten_bind_btStaticPlaneShape_calculateLocalInertia_2 = b.asm.Zr).apply(null, arguments);
    };
    var qu = b._emscripten_bind_btStaticPlaneShape___destroy___0 = function () {
      return (qu = b._emscripten_bind_btStaticPlaneShape___destroy___0 = b.asm._r).apply(null, arguments);
    };
    var ru = b._emscripten_bind_btOverlappingPairCache_setInternalGhostPairCallback_1 = function () {
      return (ru = b._emscripten_bind_btOverlappingPairCache_setInternalGhostPairCallback_1 = b.asm.$r).apply(null, arguments);
    };
    var su = b._emscripten_bind_btOverlappingPairCache_getNumOverlappingPairs_0 = function () {
      return (su = b._emscripten_bind_btOverlappingPairCache_getNumOverlappingPairs_0 = b.asm.as).apply(null, arguments);
    };
    var tu = b._emscripten_bind_btOverlappingPairCache___destroy___0 = function () {
      return (tu = b._emscripten_bind_btOverlappingPairCache___destroy___0 = b.asm.bs).apply(null, arguments);
    };
    var uu = b._emscripten_bind_btIndexedMesh_get_m_numTriangles_0 = function () {
      return (uu = b._emscripten_bind_btIndexedMesh_get_m_numTriangles_0 = b.asm.cs).apply(null, arguments);
    };
    var vu = b._emscripten_bind_btIndexedMesh_set_m_numTriangles_1 = function () {
      return (vu = b._emscripten_bind_btIndexedMesh_set_m_numTriangles_1 = b.asm.ds).apply(null, arguments);
    };
    var wu = b._emscripten_bind_btIndexedMesh___destroy___0 = function () {
      return (wu = b._emscripten_bind_btIndexedMesh___destroy___0 = b.asm.es).apply(null, arguments);
    };
    var xu = b._emscripten_bind_btSoftRigidDynamicsWorld_btSoftRigidDynamicsWorld_5 = function () {
      return (xu = b._emscripten_bind_btSoftRigidDynamicsWorld_btSoftRigidDynamicsWorld_5 = b.asm.fs).apply(null, arguments);
    };
    var yu = b._emscripten_bind_btSoftRigidDynamicsWorld_addSoftBody_3 = function () {
      return (yu = b._emscripten_bind_btSoftRigidDynamicsWorld_addSoftBody_3 = b.asm.gs).apply(null, arguments);
    };
    var zu = b._emscripten_bind_btSoftRigidDynamicsWorld_removeSoftBody_1 = function () {
      return (zu = b._emscripten_bind_btSoftRigidDynamicsWorld_removeSoftBody_1 = b.asm.hs).apply(null, arguments);
    };
    var Au = b._emscripten_bind_btSoftRigidDynamicsWorld_removeCollisionObject_1 = function () {
      return (Au = b._emscripten_bind_btSoftRigidDynamicsWorld_removeCollisionObject_1 = b.asm.is).apply(null, arguments);
    };
    var Bu = b._emscripten_bind_btSoftRigidDynamicsWorld_getWorldInfo_0 = function () {
      return (Bu = b._emscripten_bind_btSoftRigidDynamicsWorld_getWorldInfo_0 = b.asm.js).apply(null, arguments);
    };
    var Cu = b._emscripten_bind_btSoftRigidDynamicsWorld_getSoftBodyArray_0 = function () {
      return (Cu = b._emscripten_bind_btSoftRigidDynamicsWorld_getSoftBodyArray_0 = b.asm.ks).apply(null, arguments);
    };
    var Du = b._emscripten_bind_btSoftRigidDynamicsWorld_getDispatcher_0 = function () {
      return (Du = b._emscripten_bind_btSoftRigidDynamicsWorld_getDispatcher_0 = b.asm.ls).apply(null, arguments);
    };
    var Eu = b._emscripten_bind_btSoftRigidDynamicsWorld_rayTest_3 = function () {
      return (Eu = b._emscripten_bind_btSoftRigidDynamicsWorld_rayTest_3 = b.asm.ms).apply(null, arguments);
    };
    var Fu = b._emscripten_bind_btSoftRigidDynamicsWorld_getPairCache_0 = function () {
      return (Fu = b._emscripten_bind_btSoftRigidDynamicsWorld_getPairCache_0 = b.asm.ns).apply(null, arguments);
    };
    var Gu = b._emscripten_bind_btSoftRigidDynamicsWorld_getDispatchInfo_0 = function () {
      return (Gu = b._emscripten_bind_btSoftRigidDynamicsWorld_getDispatchInfo_0 = b.asm.os).apply(null, arguments);
    };
    var Hu = b._emscripten_bind_btSoftRigidDynamicsWorld_addCollisionObject_1 = function () {
      return (Hu = b._emscripten_bind_btSoftRigidDynamicsWorld_addCollisionObject_1 = b.asm.ps).apply(null, arguments);
    };
    var Iu = b._emscripten_bind_btSoftRigidDynamicsWorld_addCollisionObject_2 = function () {
      return (Iu = b._emscripten_bind_btSoftRigidDynamicsWorld_addCollisionObject_2 = b.asm.qs).apply(null, arguments);
    };
    var Ju = b._emscripten_bind_btSoftRigidDynamicsWorld_addCollisionObject_3 = function () {
      return (Ju = b._emscripten_bind_btSoftRigidDynamicsWorld_addCollisionObject_3 = b.asm.rs).apply(null, arguments);
    };
    var Ku = b._emscripten_bind_btSoftRigidDynamicsWorld_getBroadphase_0 = function () {
      return (Ku = b._emscripten_bind_btSoftRigidDynamicsWorld_getBroadphase_0 = b.asm.ss).apply(null, arguments);
    };
    var Lu = b._emscripten_bind_btSoftRigidDynamicsWorld_convexSweepTest_5 = function () {
      return (Lu = b._emscripten_bind_btSoftRigidDynamicsWorld_convexSweepTest_5 = b.asm.ts).apply(null, arguments);
    };
    var Mu = b._emscripten_bind_btSoftRigidDynamicsWorld_contactPairTest_3 = function () {
      return (Mu = b._emscripten_bind_btSoftRigidDynamicsWorld_contactPairTest_3 = b.asm.us).apply(null, arguments);
    };
    var Nu = b._emscripten_bind_btSoftRigidDynamicsWorld_contactTest_2 = function () {
      return (Nu = b._emscripten_bind_btSoftRigidDynamicsWorld_contactTest_2 = b.asm.vs).apply(null, arguments);
    };
    var Ou = b._emscripten_bind_btSoftRigidDynamicsWorld_updateSingleAabb_1 = function () {
      return (Ou = b._emscripten_bind_btSoftRigidDynamicsWorld_updateSingleAabb_1 = b.asm.ws).apply(null, arguments);
    };
    var Pu = b._emscripten_bind_btSoftRigidDynamicsWorld_setDebugDrawer_1 = function () {
      return (Pu = b._emscripten_bind_btSoftRigidDynamicsWorld_setDebugDrawer_1 = b.asm.xs).apply(null, arguments);
    };
    var Qu = b._emscripten_bind_btSoftRigidDynamicsWorld_getDebugDrawer_0 = function () {
      return (Qu = b._emscripten_bind_btSoftRigidDynamicsWorld_getDebugDrawer_0 = b.asm.ys).apply(null, arguments);
    };
    var Ru = b._emscripten_bind_btSoftRigidDynamicsWorld_debugDrawWorld_0 = function () {
      return (Ru = b._emscripten_bind_btSoftRigidDynamicsWorld_debugDrawWorld_0 = b.asm.zs).apply(null, arguments);
    };
    var Su = b._emscripten_bind_btSoftRigidDynamicsWorld_debugDrawObject_3 = function () {
      return (Su = b._emscripten_bind_btSoftRigidDynamicsWorld_debugDrawObject_3 = b.asm.As).apply(null, arguments);
    };
    var Tu = b._emscripten_bind_btSoftRigidDynamicsWorld_setGravity_1 = function () {
      return (Tu = b._emscripten_bind_btSoftRigidDynamicsWorld_setGravity_1 = b.asm.Bs).apply(null, arguments);
    };
    var Uu = b._emscripten_bind_btSoftRigidDynamicsWorld_getGravity_0 = function () {
      return (Uu = b._emscripten_bind_btSoftRigidDynamicsWorld_getGravity_0 = b.asm.Cs).apply(null, arguments);
    };
    var Vu = b._emscripten_bind_btSoftRigidDynamicsWorld_addRigidBody_1 = function () {
      return (Vu = b._emscripten_bind_btSoftRigidDynamicsWorld_addRigidBody_1 = b.asm.Ds).apply(null, arguments);
    };
    var Wu = b._emscripten_bind_btSoftRigidDynamicsWorld_addRigidBody_3 = function () {
      return (Wu = b._emscripten_bind_btSoftRigidDynamicsWorld_addRigidBody_3 = b.asm.Es).apply(null, arguments);
    };
    var Xu = b._emscripten_bind_btSoftRigidDynamicsWorld_removeRigidBody_1 = function () {
      return (Xu = b._emscripten_bind_btSoftRigidDynamicsWorld_removeRigidBody_1 = b.asm.Fs).apply(null, arguments);
    };
    var Yu = b._emscripten_bind_btSoftRigidDynamicsWorld_addConstraint_1 = function () {
      return (Yu = b._emscripten_bind_btSoftRigidDynamicsWorld_addConstraint_1 = b.asm.Gs).apply(null, arguments);
    };
    var Zu = b._emscripten_bind_btSoftRigidDynamicsWorld_addConstraint_2 = function () {
      return (Zu = b._emscripten_bind_btSoftRigidDynamicsWorld_addConstraint_2 = b.asm.Hs).apply(null, arguments);
    };
    var $u = b._emscripten_bind_btSoftRigidDynamicsWorld_removeConstraint_1 = function () {
      return ($u = b._emscripten_bind_btSoftRigidDynamicsWorld_removeConstraint_1 = b.asm.Is).apply(null, arguments);
    };
    var av = b._emscripten_bind_btSoftRigidDynamicsWorld_stepSimulation_1 = function () {
      return (av = b._emscripten_bind_btSoftRigidDynamicsWorld_stepSimulation_1 = b.asm.Js).apply(null, arguments);
    };
    var bv = b._emscripten_bind_btSoftRigidDynamicsWorld_stepSimulation_2 = function () {
      return (bv = b._emscripten_bind_btSoftRigidDynamicsWorld_stepSimulation_2 = b.asm.Ks).apply(null, arguments);
    };
    var cv = b._emscripten_bind_btSoftRigidDynamicsWorld_stepSimulation_3 = function () {
      return (cv = b._emscripten_bind_btSoftRigidDynamicsWorld_stepSimulation_3 = b.asm.Ls).apply(null, arguments);
    };
    var dv = b._emscripten_bind_btSoftRigidDynamicsWorld_setContactAddedCallback_1 = function () {
      return (dv = b._emscripten_bind_btSoftRigidDynamicsWorld_setContactAddedCallback_1 = b.asm.Ms).apply(null, arguments);
    };
    var ev = b._emscripten_bind_btSoftRigidDynamicsWorld_setContactProcessedCallback_1 = function () {
      return (ev = b._emscripten_bind_btSoftRigidDynamicsWorld_setContactProcessedCallback_1 = b.asm.Ns).apply(null, arguments);
    };
    var fv = b._emscripten_bind_btSoftRigidDynamicsWorld_setContactDestroyedCallback_1 = function () {
      return (fv = b._emscripten_bind_btSoftRigidDynamicsWorld_setContactDestroyedCallback_1 = b.asm.Os).apply(null, arguments);
    };
    var gv = b._emscripten_bind_btSoftRigidDynamicsWorld_addAction_1 = function () {
      return (gv = b._emscripten_bind_btSoftRigidDynamicsWorld_addAction_1 = b.asm.Ps).apply(null, arguments);
    };
    var hv = b._emscripten_bind_btSoftRigidDynamicsWorld_removeAction_1 = function () {
      return (hv = b._emscripten_bind_btSoftRigidDynamicsWorld_removeAction_1 = b.asm.Qs).apply(null, arguments);
    };
    var iv = b._emscripten_bind_btSoftRigidDynamicsWorld_getSolverInfo_0 = function () {
      return (iv = b._emscripten_bind_btSoftRigidDynamicsWorld_getSolverInfo_0 = b.asm.Rs).apply(null, arguments);
    };
    var jv = b._emscripten_bind_btSoftRigidDynamicsWorld_setInternalTickCallback_1 = function () {
      return (jv = b._emscripten_bind_btSoftRigidDynamicsWorld_setInternalTickCallback_1 = b.asm.Ss).apply(null, arguments);
    };
    var kv = b._emscripten_bind_btSoftRigidDynamicsWorld_setInternalTickCallback_2 = function () {
      return (kv = b._emscripten_bind_btSoftRigidDynamicsWorld_setInternalTickCallback_2 = b.asm.Ts).apply(null, arguments);
    };
    var lv = b._emscripten_bind_btSoftRigidDynamicsWorld_setInternalTickCallback_3 = function () {
      return (lv = b._emscripten_bind_btSoftRigidDynamicsWorld_setInternalTickCallback_3 = b.asm.Us).apply(null, arguments);
    };
    var mv = b._emscripten_bind_btSoftRigidDynamicsWorld___destroy___0 = function () {
      return (mv = b._emscripten_bind_btSoftRigidDynamicsWorld___destroy___0 = b.asm.Vs).apply(null, arguments);
    };
    var nv = b._emscripten_bind_btFixedConstraint_btFixedConstraint_4 = function () {
      return (nv = b._emscripten_bind_btFixedConstraint_btFixedConstraint_4 = b.asm.Ws).apply(null, arguments);
    };
    var ov = b._emscripten_bind_btFixedConstraint_enableFeedback_1 = function () {
      return (ov = b._emscripten_bind_btFixedConstraint_enableFeedback_1 = b.asm.Xs).apply(null, arguments);
    };
    var pv = b._emscripten_bind_btFixedConstraint_getBreakingImpulseThreshold_0 = function () {
      return (pv = b._emscripten_bind_btFixedConstraint_getBreakingImpulseThreshold_0 = b.asm.Ys).apply(null, arguments);
    };
    var qv = b._emscripten_bind_btFixedConstraint_setBreakingImpulseThreshold_1 = function () {
      return (qv = b._emscripten_bind_btFixedConstraint_setBreakingImpulseThreshold_1 = b.asm.Zs).apply(null, arguments);
    };
    var rv = b._emscripten_bind_btFixedConstraint_getParam_2 = function () {
      return (rv = b._emscripten_bind_btFixedConstraint_getParam_2 = b.asm._s).apply(null, arguments);
    };
    var sv = b._emscripten_bind_btFixedConstraint_setParam_3 = function () {
      return (sv = b._emscripten_bind_btFixedConstraint_setParam_3 = b.asm.$s).apply(null, arguments);
    };
    var tv = b._emscripten_bind_btFixedConstraint___destroy___0 = function () {
      return (tv = b._emscripten_bind_btFixedConstraint___destroy___0 = b.asm.at).apply(null, arguments);
    };
    var uv = b._emscripten_bind_btTransform_btTransform_0 = function () {
      return (uv = b._emscripten_bind_btTransform_btTransform_0 = b.asm.bt).apply(null, arguments);
    };
    var vv = b._emscripten_bind_btTransform_btTransform_2 = function () {
      return (vv = b._emscripten_bind_btTransform_btTransform_2 = b.asm.ct).apply(null, arguments);
    };
    var wv = b._emscripten_bind_btTransform_setIdentity_0 = function () {
      return (wv = b._emscripten_bind_btTransform_setIdentity_0 = b.asm.dt).apply(null, arguments);
    };
    var xv = b._emscripten_bind_btTransform_setOrigin_1 = function () {
      return (xv = b._emscripten_bind_btTransform_setOrigin_1 = b.asm.et).apply(null, arguments);
    };
    var yv = b._emscripten_bind_btTransform_setRotation_1 = function () {
      return (yv = b._emscripten_bind_btTransform_setRotation_1 = b.asm.ft).apply(null, arguments);
    };
    var zv = b._emscripten_bind_btTransform_getOrigin_0 = function () {
      return (zv = b._emscripten_bind_btTransform_getOrigin_0 = b.asm.gt).apply(null, arguments);
    };
    var Av = b._emscripten_bind_btTransform_getRotation_0 = function () {
      return (Av = b._emscripten_bind_btTransform_getRotation_0 = b.asm.ht).apply(null, arguments);
    };
    var Bv = b._emscripten_bind_btTransform_getBasis_0 = function () {
      return (Bv = b._emscripten_bind_btTransform_getBasis_0 = b.asm.it).apply(null, arguments);
    };
    var Cv = b._emscripten_bind_btTransform_setFromOpenGLMatrix_1 = function () {
      return (Cv = b._emscripten_bind_btTransform_setFromOpenGLMatrix_1 = b.asm.jt).apply(null, arguments);
    };
    var Dv = b._emscripten_bind_btTransform_inverse_0 = function () {
      return (Dv = b._emscripten_bind_btTransform_inverse_0 = b.asm.kt).apply(null, arguments);
    };
    var Ev = b._emscripten_bind_btTransform_op_mul_1 = function () {
      return (Ev = b._emscripten_bind_btTransform_op_mul_1 = b.asm.lt).apply(null, arguments);
    };
    var Fv = b._emscripten_bind_btTransform___destroy___0 = function () {
      return (Fv = b._emscripten_bind_btTransform___destroy___0 = b.asm.mt).apply(null, arguments);
    };
    var Gv = b._emscripten_bind_ClosestRayResultCallback_ClosestRayResultCallback_2 = function () {
      return (Gv = b._emscripten_bind_ClosestRayResultCallback_ClosestRayResultCallback_2 = b.asm.nt).apply(null, arguments);
    };
    var Hv = b._emscripten_bind_ClosestRayResultCallback_hasHit_0 = function () {
      return (Hv = b._emscripten_bind_ClosestRayResultCallback_hasHit_0 = b.asm.ot).apply(null, arguments);
    };
    var Iv = b._emscripten_bind_ClosestRayResultCallback_get_m_rayFromWorld_0 = function () {
      return (Iv = b._emscripten_bind_ClosestRayResultCallback_get_m_rayFromWorld_0 = b.asm.pt).apply(null, arguments);
    };
    var Jv = b._emscripten_bind_ClosestRayResultCallback_set_m_rayFromWorld_1 = function () {
      return (Jv = b._emscripten_bind_ClosestRayResultCallback_set_m_rayFromWorld_1 = b.asm.qt).apply(null, arguments);
    };
    var Kv = b._emscripten_bind_ClosestRayResultCallback_get_m_rayToWorld_0 = function () {
      return (Kv = b._emscripten_bind_ClosestRayResultCallback_get_m_rayToWorld_0 = b.asm.rt).apply(null, arguments);
    };
    var Lv = b._emscripten_bind_ClosestRayResultCallback_set_m_rayToWorld_1 = function () {
      return (Lv = b._emscripten_bind_ClosestRayResultCallback_set_m_rayToWorld_1 = b.asm.st).apply(null, arguments);
    };
    var Mv = b._emscripten_bind_ClosestRayResultCallback_get_m_hitNormalWorld_0 = function () {
      return (Mv = b._emscripten_bind_ClosestRayResultCallback_get_m_hitNormalWorld_0 = b.asm.tt).apply(null, arguments);
    };
    var Nv = b._emscripten_bind_ClosestRayResultCallback_set_m_hitNormalWorld_1 = function () {
      return (Nv = b._emscripten_bind_ClosestRayResultCallback_set_m_hitNormalWorld_1 = b.asm.ut).apply(null, arguments);
    };
    var Ov = b._emscripten_bind_ClosestRayResultCallback_get_m_hitPointWorld_0 = function () {
      return (Ov = b._emscripten_bind_ClosestRayResultCallback_get_m_hitPointWorld_0 = b.asm.vt).apply(null, arguments);
    };
    var Pv = b._emscripten_bind_ClosestRayResultCallback_set_m_hitPointWorld_1 = function () {
      return (Pv = b._emscripten_bind_ClosestRayResultCallback_set_m_hitPointWorld_1 = b.asm.wt).apply(null, arguments);
    };
    var Qv = b._emscripten_bind_ClosestRayResultCallback_get_m_collisionFilterGroup_0 = function () {
      return (Qv = b._emscripten_bind_ClosestRayResultCallback_get_m_collisionFilterGroup_0 = b.asm.xt).apply(null, arguments);
    };
    var Rv = b._emscripten_bind_ClosestRayResultCallback_set_m_collisionFilterGroup_1 = function () {
      return (Rv = b._emscripten_bind_ClosestRayResultCallback_set_m_collisionFilterGroup_1 = b.asm.yt).apply(null, arguments);
    };
    var Sv = b._emscripten_bind_ClosestRayResultCallback_get_m_collisionFilterMask_0 = function () {
      return (Sv = b._emscripten_bind_ClosestRayResultCallback_get_m_collisionFilterMask_0 = b.asm.zt).apply(null, arguments);
    };
    var Tv = b._emscripten_bind_ClosestRayResultCallback_set_m_collisionFilterMask_1 = function () {
      return (Tv = b._emscripten_bind_ClosestRayResultCallback_set_m_collisionFilterMask_1 = b.asm.At).apply(null, arguments);
    };
    var Uv = b._emscripten_bind_ClosestRayResultCallback_get_m_closestHitFraction_0 = function () {
      return (Uv = b._emscripten_bind_ClosestRayResultCallback_get_m_closestHitFraction_0 = b.asm.Bt).apply(null, arguments);
    };
    var Vv = b._emscripten_bind_ClosestRayResultCallback_set_m_closestHitFraction_1 = function () {
      return (Vv = b._emscripten_bind_ClosestRayResultCallback_set_m_closestHitFraction_1 = b.asm.Ct).apply(null, arguments);
    };
    var Wv = b._emscripten_bind_ClosestRayResultCallback_get_m_collisionObject_0 = function () {
      return (Wv = b._emscripten_bind_ClosestRayResultCallback_get_m_collisionObject_0 = b.asm.Dt).apply(null, arguments);
    };
    var Xv = b._emscripten_bind_ClosestRayResultCallback_set_m_collisionObject_1 = function () {
      return (Xv = b._emscripten_bind_ClosestRayResultCallback_set_m_collisionObject_1 = b.asm.Et).apply(null, arguments);
    };
    var Yv = b._emscripten_bind_ClosestRayResultCallback___destroy___0 = function () {
      return (Yv = b._emscripten_bind_ClosestRayResultCallback___destroy___0 = b.asm.Ft).apply(null, arguments);
    };
    var Zv = b._emscripten_bind_btSoftBodyRigidBodyCollisionConfiguration_btSoftBodyRigidBodyCollisionConfiguration_0 = function () {
      return (Zv = b._emscripten_bind_btSoftBodyRigidBodyCollisionConfiguration_btSoftBodyRigidBodyCollisionConfiguration_0 = b.asm.Gt).apply(null, arguments);
    };
    var $v = b._emscripten_bind_btSoftBodyRigidBodyCollisionConfiguration_btSoftBodyRigidBodyCollisionConfiguration_1 = function () {
      return ($v = b._emscripten_bind_btSoftBodyRigidBodyCollisionConfiguration_btSoftBodyRigidBodyCollisionConfiguration_1 = b.asm.Ht).apply(null, arguments);
    };
    var aw = b._emscripten_bind_btSoftBodyRigidBodyCollisionConfiguration___destroy___0 = function () {
      return (aw = b._emscripten_bind_btSoftBodyRigidBodyCollisionConfiguration___destroy___0 = b.asm.It).apply(null, arguments);
    };
    var bw = b._emscripten_bind_ConcreteContactResultCallback_ConcreteContactResultCallback_0 = function () {
      return (bw = b._emscripten_bind_ConcreteContactResultCallback_ConcreteContactResultCallback_0 = b.asm.Jt).apply(null, arguments);
    };
    var cw = b._emscripten_bind_ConcreteContactResultCallback_addSingleResult_7 = function () {
      return (cw = b._emscripten_bind_ConcreteContactResultCallback_addSingleResult_7 = b.asm.Kt).apply(null, arguments);
    };
    var dw = b._emscripten_bind_ConcreteContactResultCallback___destroy___0 = function () {
      return (dw = b._emscripten_bind_ConcreteContactResultCallback___destroy___0 = b.asm.Lt).apply(null, arguments);
    };
    var ew = b._emscripten_bind_btBvhTriangleMeshShape_btBvhTriangleMeshShape_2 = function () {
      return (ew = b._emscripten_bind_btBvhTriangleMeshShape_btBvhTriangleMeshShape_2 = b.asm.Mt).apply(null, arguments);
    };
    var fw = b._emscripten_bind_btBvhTriangleMeshShape_btBvhTriangleMeshShape_3 = function () {
      return (fw = b._emscripten_bind_btBvhTriangleMeshShape_btBvhTriangleMeshShape_3 = b.asm.Nt).apply(null, arguments);
    };
    var gw = b._emscripten_bind_btBvhTriangleMeshShape_setLocalScaling_1 = function () {
      return (gw = b._emscripten_bind_btBvhTriangleMeshShape_setLocalScaling_1 = b.asm.Ot).apply(null, arguments);
    };
    var hw = b._emscripten_bind_btBvhTriangleMeshShape_getLocalScaling_0 = function () {
      return (hw = b._emscripten_bind_btBvhTriangleMeshShape_getLocalScaling_0 = b.asm.Pt).apply(null, arguments);
    };
    var iw = b._emscripten_bind_btBvhTriangleMeshShape_calculateLocalInertia_2 = function () {
      return (iw = b._emscripten_bind_btBvhTriangleMeshShape_calculateLocalInertia_2 = b.asm.Qt).apply(null, arguments);
    };
    var jw = b._emscripten_bind_btBvhTriangleMeshShape___destroy___0 = function () {
      return (jw = b._emscripten_bind_btBvhTriangleMeshShape___destroy___0 = b.asm.Rt).apply(null, arguments);
    };
    var kw = b._emscripten_bind_btConstCollisionObjectArray_size_0 = function () {
      return (kw = b._emscripten_bind_btConstCollisionObjectArray_size_0 = b.asm.St).apply(null, arguments);
    };
    var lw = b._emscripten_bind_btConstCollisionObjectArray_at_1 = function () {
      return (lw = b._emscripten_bind_btConstCollisionObjectArray_at_1 = b.asm.Tt).apply(null, arguments);
    };
    var mw = b._emscripten_bind_btConstCollisionObjectArray___destroy___0 = function () {
      return (mw = b._emscripten_bind_btConstCollisionObjectArray___destroy___0 = b.asm.Ut).apply(null, arguments);
    };
    var nw = b._emscripten_bind_btSliderConstraint_btSliderConstraint_3 = function () {
      return (nw = b._emscripten_bind_btSliderConstraint_btSliderConstraint_3 = b.asm.Vt).apply(null, arguments);
    };
    var ow = b._emscripten_bind_btSliderConstraint_btSliderConstraint_5 = function () {
      return (ow = b._emscripten_bind_btSliderConstraint_btSliderConstraint_5 = b.asm.Wt).apply(null, arguments);
    };
    var pw = b._emscripten_bind_btSliderConstraint_setLowerLinLimit_1 = function () {
      return (pw = b._emscripten_bind_btSliderConstraint_setLowerLinLimit_1 = b.asm.Xt).apply(null, arguments);
    };
    var qw = b._emscripten_bind_btSliderConstraint_setUpperLinLimit_1 = function () {
      return (qw = b._emscripten_bind_btSliderConstraint_setUpperLinLimit_1 = b.asm.Yt).apply(null, arguments);
    };
    var rw = b._emscripten_bind_btSliderConstraint_setLowerAngLimit_1 = function () {
      return (rw = b._emscripten_bind_btSliderConstraint_setLowerAngLimit_1 = b.asm.Zt).apply(null, arguments);
    };
    var sw = b._emscripten_bind_btSliderConstraint_setUpperAngLimit_1 = function () {
      return (sw = b._emscripten_bind_btSliderConstraint_setUpperAngLimit_1 = b.asm._t).apply(null, arguments);
    };
    var tw = b._emscripten_bind_btSliderConstraint_enableFeedback_1 = function () {
      return (tw = b._emscripten_bind_btSliderConstraint_enableFeedback_1 = b.asm.$t).apply(null, arguments);
    };
    var uw = b._emscripten_bind_btSliderConstraint_getBreakingImpulseThreshold_0 = function () {
      return (uw = b._emscripten_bind_btSliderConstraint_getBreakingImpulseThreshold_0 = b.asm.au).apply(null, arguments);
    };
    var vw = b._emscripten_bind_btSliderConstraint_setBreakingImpulseThreshold_1 = function () {
      return (vw = b._emscripten_bind_btSliderConstraint_setBreakingImpulseThreshold_1 = b.asm.bu).apply(null, arguments);
    };
    var ww = b._emscripten_bind_btSliderConstraint_getParam_2 = function () {
      return (ww = b._emscripten_bind_btSliderConstraint_getParam_2 = b.asm.cu).apply(null, arguments);
    };
    var xw = b._emscripten_bind_btSliderConstraint_setParam_3 = function () {
      return (xw = b._emscripten_bind_btSliderConstraint_setParam_3 = b.asm.du).apply(null, arguments);
    };
    var yw = b._emscripten_bind_btSliderConstraint___destroy___0 = function () {
      return (yw = b._emscripten_bind_btSliderConstraint___destroy___0 = b.asm.eu).apply(null, arguments);
    };
    var zw = b._emscripten_bind_btPairCachingGhostObject_btPairCachingGhostObject_0 = function () {
      return (zw = b._emscripten_bind_btPairCachingGhostObject_btPairCachingGhostObject_0 = b.asm.fu).apply(null, arguments);
    };
    var Aw = b._emscripten_bind_btPairCachingGhostObject_setAnisotropicFriction_2 = function () {
      return (Aw = b._emscripten_bind_btPairCachingGhostObject_setAnisotropicFriction_2 = b.asm.gu).apply(null, arguments);
    };
    var Bw = b._emscripten_bind_btPairCachingGhostObject_getCollisionShape_0 = function () {
      return (Bw = b._emscripten_bind_btPairCachingGhostObject_getCollisionShape_0 = b.asm.hu).apply(null, arguments);
    };
    var Cw = b._emscripten_bind_btPairCachingGhostObject_setContactProcessingThreshold_1 = function () {
      return (Cw = b._emscripten_bind_btPairCachingGhostObject_setContactProcessingThreshold_1 = b.asm.iu).apply(null, arguments);
    };
    var Dw = b._emscripten_bind_btPairCachingGhostObject_setActivationState_1 = function () {
      return (Dw = b._emscripten_bind_btPairCachingGhostObject_setActivationState_1 = b.asm.ju).apply(null, arguments);
    };
    var Ew = b._emscripten_bind_btPairCachingGhostObject_forceActivationState_1 = function () {
      return (Ew = b._emscripten_bind_btPairCachingGhostObject_forceActivationState_1 = b.asm.ku).apply(null, arguments);
    };
    var Fw = b._emscripten_bind_btPairCachingGhostObject_activate_0 = function () {
      return (Fw = b._emscripten_bind_btPairCachingGhostObject_activate_0 = b.asm.lu).apply(null, arguments);
    };
    var Gw = b._emscripten_bind_btPairCachingGhostObject_activate_1 = function () {
      return (Gw = b._emscripten_bind_btPairCachingGhostObject_activate_1 = b.asm.mu).apply(null, arguments);
    };
    var Hw = b._emscripten_bind_btPairCachingGhostObject_isActive_0 = function () {
      return (Hw = b._emscripten_bind_btPairCachingGhostObject_isActive_0 = b.asm.nu).apply(null, arguments);
    };
    var Iw = b._emscripten_bind_btPairCachingGhostObject_isKinematicObject_0 = function () {
      return (Iw = b._emscripten_bind_btPairCachingGhostObject_isKinematicObject_0 = b.asm.ou).apply(null, arguments);
    };
    var Jw = b._emscripten_bind_btPairCachingGhostObject_isStaticObject_0 = function () {
      return (Jw = b._emscripten_bind_btPairCachingGhostObject_isStaticObject_0 = b.asm.pu).apply(null, arguments);
    };
    var Kw = b._emscripten_bind_btPairCachingGhostObject_isStaticOrKinematicObject_0 = function () {
      return (Kw = b._emscripten_bind_btPairCachingGhostObject_isStaticOrKinematicObject_0 = b.asm.qu).apply(null, arguments);
    };
    var Lw = b._emscripten_bind_btPairCachingGhostObject_getRestitution_0 = function () {
      return (Lw = b._emscripten_bind_btPairCachingGhostObject_getRestitution_0 = b.asm.ru).apply(null, arguments);
    };
    var Mw = b._emscripten_bind_btPairCachingGhostObject_getFriction_0 = function () {
      return (Mw = b._emscripten_bind_btPairCachingGhostObject_getFriction_0 = b.asm.su).apply(null, arguments);
    };
    var Nw = b._emscripten_bind_btPairCachingGhostObject_getRollingFriction_0 = function () {
      return (Nw = b._emscripten_bind_btPairCachingGhostObject_getRollingFriction_0 = b.asm.tu).apply(null, arguments);
    };
    var Ow = b._emscripten_bind_btPairCachingGhostObject_setRestitution_1 = function () {
      return (Ow = b._emscripten_bind_btPairCachingGhostObject_setRestitution_1 = b.asm.uu).apply(null, arguments);
    };
    var Pw = b._emscripten_bind_btPairCachingGhostObject_setFriction_1 = function () {
      return (Pw = b._emscripten_bind_btPairCachingGhostObject_setFriction_1 = b.asm.vu).apply(null, arguments);
    };
    var Qw = b._emscripten_bind_btPairCachingGhostObject_setRollingFriction_1 = function () {
      return (Qw = b._emscripten_bind_btPairCachingGhostObject_setRollingFriction_1 = b.asm.wu).apply(null, arguments);
    };
    var Rw = b._emscripten_bind_btPairCachingGhostObject_getWorldTransform_0 = function () {
      return (Rw = b._emscripten_bind_btPairCachingGhostObject_getWorldTransform_0 = b.asm.xu).apply(null, arguments);
    };
    var Sw = b._emscripten_bind_btPairCachingGhostObject_getCollisionFlags_0 = function () {
      return (Sw = b._emscripten_bind_btPairCachingGhostObject_getCollisionFlags_0 = b.asm.yu).apply(null, arguments);
    };
    var Tw = b._emscripten_bind_btPairCachingGhostObject_setCollisionFlags_1 = function () {
      return (Tw = b._emscripten_bind_btPairCachingGhostObject_setCollisionFlags_1 = b.asm.zu).apply(null, arguments);
    };
    var Uw = b._emscripten_bind_btPairCachingGhostObject_setWorldTransform_1 = function () {
      return (Uw = b._emscripten_bind_btPairCachingGhostObject_setWorldTransform_1 = b.asm.Au).apply(null, arguments);
    };
    var Vw = b._emscripten_bind_btPairCachingGhostObject_setCollisionShape_1 = function () {
      return (Vw = b._emscripten_bind_btPairCachingGhostObject_setCollisionShape_1 = b.asm.Bu).apply(null, arguments);
    };
    var Ww = b._emscripten_bind_btPairCachingGhostObject_setCcdMotionThreshold_1 = function () {
      return (Ww = b._emscripten_bind_btPairCachingGhostObject_setCcdMotionThreshold_1 = b.asm.Cu).apply(null, arguments);
    };
    var Xw = b._emscripten_bind_btPairCachingGhostObject_setCcdSweptSphereRadius_1 = function () {
      return (Xw = b._emscripten_bind_btPairCachingGhostObject_setCcdSweptSphereRadius_1 = b.asm.Du).apply(null, arguments);
    };
    var Yw = b._emscripten_bind_btPairCachingGhostObject_getUserIndex_0 = function () {
      return (Yw = b._emscripten_bind_btPairCachingGhostObject_getUserIndex_0 = b.asm.Eu).apply(null, arguments);
    };
    var Zw = b._emscripten_bind_btPairCachingGhostObject_setUserIndex_1 = function () {
      return (Zw = b._emscripten_bind_btPairCachingGhostObject_setUserIndex_1 = b.asm.Fu).apply(null, arguments);
    };
    var $w = b._emscripten_bind_btPairCachingGhostObject_getUserPointer_0 = function () {
      return ($w = b._emscripten_bind_btPairCachingGhostObject_getUserPointer_0 = b.asm.Gu).apply(null, arguments);
    };
    var ax = b._emscripten_bind_btPairCachingGhostObject_setUserPointer_1 = function () {
      return (ax = b._emscripten_bind_btPairCachingGhostObject_setUserPointer_1 = b.asm.Hu).apply(null, arguments);
    };
    var bx = b._emscripten_bind_btPairCachingGhostObject_getBroadphaseHandle_0 = function () {
      return (bx = b._emscripten_bind_btPairCachingGhostObject_getBroadphaseHandle_0 = b.asm.Iu).apply(null, arguments);
    };
    var cx = b._emscripten_bind_btPairCachingGhostObject_getNumOverlappingObjects_0 = function () {
      return (cx = b._emscripten_bind_btPairCachingGhostObject_getNumOverlappingObjects_0 = b.asm.Ju).apply(null, arguments);
    };
    var dx = b._emscripten_bind_btPairCachingGhostObject_getOverlappingObject_1 = function () {
      return (dx = b._emscripten_bind_btPairCachingGhostObject_getOverlappingObject_1 = b.asm.Ku).apply(null, arguments);
    };
    var ex = b._emscripten_bind_btPairCachingGhostObject___destroy___0 = function () {
      return (ex = b._emscripten_bind_btPairCachingGhostObject___destroy___0 = b.asm.Lu).apply(null, arguments);
    };
    var fx = b._emscripten_bind_btManifoldPoint_getPositionWorldOnA_0 = function () {
      return (fx = b._emscripten_bind_btManifoldPoint_getPositionWorldOnA_0 = b.asm.Mu).apply(null, arguments);
    };
    var gx = b._emscripten_bind_btManifoldPoint_getPositionWorldOnB_0 = function () {
      return (gx = b._emscripten_bind_btManifoldPoint_getPositionWorldOnB_0 = b.asm.Nu).apply(null, arguments);
    };
    var hx = b._emscripten_bind_btManifoldPoint_getAppliedImpulse_0 = function () {
      return (hx = b._emscripten_bind_btManifoldPoint_getAppliedImpulse_0 = b.asm.Ou).apply(null, arguments);
    };
    var ix = b._emscripten_bind_btManifoldPoint_getDistance_0 = function () {
      return (ix = b._emscripten_bind_btManifoldPoint_getDistance_0 = b.asm.Pu).apply(null, arguments);
    };
    var jx = b._emscripten_bind_btManifoldPoint_get_m_localPointA_0 = function () {
      return (jx = b._emscripten_bind_btManifoldPoint_get_m_localPointA_0 = b.asm.Qu).apply(null, arguments);
    };
    var kx = b._emscripten_bind_btManifoldPoint_set_m_localPointA_1 = function () {
      return (kx = b._emscripten_bind_btManifoldPoint_set_m_localPointA_1 = b.asm.Ru).apply(null, arguments);
    };
    var lx = b._emscripten_bind_btManifoldPoint_get_m_localPointB_0 = function () {
      return (lx = b._emscripten_bind_btManifoldPoint_get_m_localPointB_0 = b.asm.Su).apply(null, arguments);
    };
    var mx = b._emscripten_bind_btManifoldPoint_set_m_localPointB_1 = function () {
      return (mx = b._emscripten_bind_btManifoldPoint_set_m_localPointB_1 = b.asm.Tu).apply(null, arguments);
    };
    var nx = b._emscripten_bind_btManifoldPoint_get_m_positionWorldOnB_0 = function () {
      return (nx = b._emscripten_bind_btManifoldPoint_get_m_positionWorldOnB_0 = b.asm.Uu).apply(null, arguments);
    };
    var ox = b._emscripten_bind_btManifoldPoint_set_m_positionWorldOnB_1 = function () {
      return (ox = b._emscripten_bind_btManifoldPoint_set_m_positionWorldOnB_1 = b.asm.Vu).apply(null, arguments);
    };
    var px = b._emscripten_bind_btManifoldPoint_get_m_positionWorldOnA_0 = function () {
      return (px = b._emscripten_bind_btManifoldPoint_get_m_positionWorldOnA_0 = b.asm.Wu).apply(null, arguments);
    };
    var qx = b._emscripten_bind_btManifoldPoint_set_m_positionWorldOnA_1 = function () {
      return (qx = b._emscripten_bind_btManifoldPoint_set_m_positionWorldOnA_1 = b.asm.Xu).apply(null, arguments);
    };
    var rx = b._emscripten_bind_btManifoldPoint_get_m_normalWorldOnB_0 = function () {
      return (rx = b._emscripten_bind_btManifoldPoint_get_m_normalWorldOnB_0 = b.asm.Yu).apply(null, arguments);
    };
    var sx = b._emscripten_bind_btManifoldPoint_set_m_normalWorldOnB_1 = function () {
      return (sx = b._emscripten_bind_btManifoldPoint_set_m_normalWorldOnB_1 = b.asm.Zu).apply(null, arguments);
    };
    var tx = b._emscripten_bind_btManifoldPoint_get_m_userPersistentData_0 = function () {
      return (tx = b._emscripten_bind_btManifoldPoint_get_m_userPersistentData_0 = b.asm._u).apply(null, arguments);
    };
    var ux = b._emscripten_bind_btManifoldPoint_set_m_userPersistentData_1 = function () {
      return (ux = b._emscripten_bind_btManifoldPoint_set_m_userPersistentData_1 = b.asm.$u).apply(null, arguments);
    };
    var vx = b._emscripten_bind_btManifoldPoint___destroy___0 = function () {
      return (vx = b._emscripten_bind_btManifoldPoint___destroy___0 = b.asm.av).apply(null, arguments);
    };
    var wx = b._emscripten_bind_btPoint2PointConstraint_btPoint2PointConstraint_2 = function () {
      return (wx = b._emscripten_bind_btPoint2PointConstraint_btPoint2PointConstraint_2 = b.asm.bv).apply(null, arguments);
    };
    var xx = b._emscripten_bind_btPoint2PointConstraint_btPoint2PointConstraint_4 = function () {
      return (xx = b._emscripten_bind_btPoint2PointConstraint_btPoint2PointConstraint_4 = b.asm.cv).apply(null, arguments);
    };
    var yx = b._emscripten_bind_btPoint2PointConstraint_setPivotA_1 = function () {
      return (yx = b._emscripten_bind_btPoint2PointConstraint_setPivotA_1 = b.asm.dv).apply(null, arguments);
    };
    var zx = b._emscripten_bind_btPoint2PointConstraint_setPivotB_1 = function () {
      return (zx = b._emscripten_bind_btPoint2PointConstraint_setPivotB_1 = b.asm.ev).apply(null, arguments);
    };
    var Ax = b._emscripten_bind_btPoint2PointConstraint_getPivotInA_0 = function () {
      return (Ax = b._emscripten_bind_btPoint2PointConstraint_getPivotInA_0 = b.asm.fv).apply(null, arguments);
    };
    var Bx = b._emscripten_bind_btPoint2PointConstraint_getPivotInB_0 = function () {
      return (Bx = b._emscripten_bind_btPoint2PointConstraint_getPivotInB_0 = b.asm.gv).apply(null, arguments);
    };
    var Cx = b._emscripten_bind_btPoint2PointConstraint_enableFeedback_1 = function () {
      return (Cx = b._emscripten_bind_btPoint2PointConstraint_enableFeedback_1 = b.asm.hv).apply(null, arguments);
    };
    var Dx = b._emscripten_bind_btPoint2PointConstraint_getBreakingImpulseThreshold_0 = function () {
      return (Dx = b._emscripten_bind_btPoint2PointConstraint_getBreakingImpulseThreshold_0 = b.asm.iv).apply(null, arguments);
    };
    var Ex = b._emscripten_bind_btPoint2PointConstraint_setBreakingImpulseThreshold_1 = function () {
      return (Ex = b._emscripten_bind_btPoint2PointConstraint_setBreakingImpulseThreshold_1 = b.asm.jv).apply(null, arguments);
    };
    var Fx = b._emscripten_bind_btPoint2PointConstraint_getParam_2 = function () {
      return (Fx = b._emscripten_bind_btPoint2PointConstraint_getParam_2 = b.asm.kv).apply(null, arguments);
    };
    var Gx = b._emscripten_bind_btPoint2PointConstraint_setParam_3 = function () {
      return (Gx = b._emscripten_bind_btPoint2PointConstraint_setParam_3 = b.asm.lv).apply(null, arguments);
    };
    var Hx = b._emscripten_bind_btPoint2PointConstraint_get_m_setting_0 = function () {
      return (Hx = b._emscripten_bind_btPoint2PointConstraint_get_m_setting_0 = b.asm.mv).apply(null, arguments);
    };
    var Ix = b._emscripten_bind_btPoint2PointConstraint_set_m_setting_1 = function () {
      return (Ix = b._emscripten_bind_btPoint2PointConstraint_set_m_setting_1 = b.asm.nv).apply(null, arguments);
    };
    var Jx = b._emscripten_bind_btPoint2PointConstraint___destroy___0 = function () {
      return (Jx = b._emscripten_bind_btPoint2PointConstraint___destroy___0 = b.asm.ov).apply(null, arguments);
    };
    var Kx = b._emscripten_bind_btSoftBodyHelpers_btSoftBodyHelpers_0 = function () {
      return (Kx = b._emscripten_bind_btSoftBodyHelpers_btSoftBodyHelpers_0 = b.asm.pv).apply(null, arguments);
    };
    var Lx = b._emscripten_bind_btSoftBodyHelpers_CreateRope_5 = function () {
      return (Lx = b._emscripten_bind_btSoftBodyHelpers_CreateRope_5 = b.asm.qv).apply(null, arguments);
    };
    var Mx = b._emscripten_bind_btSoftBodyHelpers_CreatePatch_9 = function () {
      return (Mx = b._emscripten_bind_btSoftBodyHelpers_CreatePatch_9 = b.asm.rv).apply(null, arguments);
    };
    var Nx = b._emscripten_bind_btSoftBodyHelpers_CreatePatchUV_10 = function () {
      return (Nx = b._emscripten_bind_btSoftBodyHelpers_CreatePatchUV_10 = b.asm.sv).apply(null, arguments);
    };
    var Ox = b._emscripten_bind_btSoftBodyHelpers_CreateEllipsoid_4 = function () {
      return (Ox = b._emscripten_bind_btSoftBodyHelpers_CreateEllipsoid_4 = b.asm.tv).apply(null, arguments);
    };
    var Px = b._emscripten_bind_btSoftBodyHelpers_CreateFromTriMesh_5 = function () {
      return (Px = b._emscripten_bind_btSoftBodyHelpers_CreateFromTriMesh_5 = b.asm.uv).apply(null, arguments);
    };
    var Qx = b._emscripten_bind_btSoftBodyHelpers_CreateFromConvexHull_4 = function () {
      return (Qx = b._emscripten_bind_btSoftBodyHelpers_CreateFromConvexHull_4 = b.asm.vv).apply(null, arguments);
    };
    var Rx = b._emscripten_bind_btSoftBodyHelpers___destroy___0 = function () {
      return (Rx = b._emscripten_bind_btSoftBodyHelpers___destroy___0 = b.asm.wv).apply(null, arguments);
    };
    var Sx = b._emscripten_bind_btBroadphaseProxy_get_m_collisionFilterGroup_0 = function () {
      return (Sx = b._emscripten_bind_btBroadphaseProxy_get_m_collisionFilterGroup_0 = b.asm.xv).apply(null, arguments);
    };
    var Tx = b._emscripten_bind_btBroadphaseProxy_set_m_collisionFilterGroup_1 = function () {
      return (Tx = b._emscripten_bind_btBroadphaseProxy_set_m_collisionFilterGroup_1 = b.asm.yv).apply(null, arguments);
    };
    var Ux = b._emscripten_bind_btBroadphaseProxy_get_m_collisionFilterMask_0 = function () {
      return (Ux = b._emscripten_bind_btBroadphaseProxy_get_m_collisionFilterMask_0 = b.asm.zv).apply(null, arguments);
    };
    var Vx = b._emscripten_bind_btBroadphaseProxy_set_m_collisionFilterMask_1 = function () {
      return (Vx = b._emscripten_bind_btBroadphaseProxy_set_m_collisionFilterMask_1 = b.asm.Av).apply(null, arguments);
    };
    var Wx = b._emscripten_bind_btBroadphaseProxy___destroy___0 = function () {
      return (Wx = b._emscripten_bind_btBroadphaseProxy___destroy___0 = b.asm.Bv).apply(null, arguments);
    };
    var Xx = b._emscripten_bind_tNodeArray_size_0 = function () {
      return (Xx = b._emscripten_bind_tNodeArray_size_0 = b.asm.Cv).apply(null, arguments);
    };
    var Yx = b._emscripten_bind_tNodeArray_at_1 = function () {
      return (Yx = b._emscripten_bind_tNodeArray_at_1 = b.asm.Dv).apply(null, arguments);
    };
    var Zx = b._emscripten_bind_tNodeArray___destroy___0 = function () {
      return (Zx = b._emscripten_bind_tNodeArray___destroy___0 = b.asm.Ev).apply(null, arguments);
    };
    var $x = b._emscripten_bind_btBoxShape_btBoxShape_1 = function () {
      return ($x = b._emscripten_bind_btBoxShape_btBoxShape_1 = b.asm.Fv).apply(null, arguments);
    };
    var ay = b._emscripten_bind_btBoxShape_setMargin_1 = function () {
      return (ay = b._emscripten_bind_btBoxShape_setMargin_1 = b.asm.Gv).apply(null, arguments);
    };
    var by = b._emscripten_bind_btBoxShape_getMargin_0 = function () {
      return (by = b._emscripten_bind_btBoxShape_getMargin_0 = b.asm.Hv).apply(null, arguments);
    };
    var cy = b._emscripten_bind_btBoxShape_setLocalScaling_1 = function () {
      return (cy = b._emscripten_bind_btBoxShape_setLocalScaling_1 = b.asm.Iv).apply(null, arguments);
    };
    var dy = b._emscripten_bind_btBoxShape_getLocalScaling_0 = function () {
      return (dy = b._emscripten_bind_btBoxShape_getLocalScaling_0 = b.asm.Jv).apply(null, arguments);
    };
    var ey = b._emscripten_bind_btBoxShape_calculateLocalInertia_2 = function () {
      return (ey = b._emscripten_bind_btBoxShape_calculateLocalInertia_2 = b.asm.Kv).apply(null, arguments);
    };
    var fy = b._emscripten_bind_btBoxShape___destroy___0 = function () {
      return (fy = b._emscripten_bind_btBoxShape___destroy___0 = b.asm.Lv).apply(null, arguments);
    };
    var gy = b._emscripten_bind_btFace_get_m_indices_0 = function () {
      return (gy = b._emscripten_bind_btFace_get_m_indices_0 = b.asm.Mv).apply(null, arguments);
    };
    var hy = b._emscripten_bind_btFace_set_m_indices_1 = function () {
      return (hy = b._emscripten_bind_btFace_set_m_indices_1 = b.asm.Nv).apply(null, arguments);
    };
    var iy = b._emscripten_bind_btFace_get_m_plane_1 = function () {
      return (iy = b._emscripten_bind_btFace_get_m_plane_1 = b.asm.Ov).apply(null, arguments);
    };
    var jy = b._emscripten_bind_btFace_set_m_plane_2 = function () {
      return (jy = b._emscripten_bind_btFace_set_m_plane_2 = b.asm.Pv).apply(null, arguments);
    };
    var ky = b._emscripten_bind_btFace___destroy___0 = function () {
      return (ky = b._emscripten_bind_btFace___destroy___0 = b.asm.Qv).apply(null, arguments);
    };
    var ly = b._emscripten_bind_DebugDrawer_DebugDrawer_0 = function () {
      return (ly = b._emscripten_bind_DebugDrawer_DebugDrawer_0 = b.asm.Rv).apply(null, arguments);
    };
    var my = b._emscripten_bind_DebugDrawer_drawLine_3 = function () {
      return (my = b._emscripten_bind_DebugDrawer_drawLine_3 = b.asm.Sv).apply(null, arguments);
    };
    var ny = b._emscripten_bind_DebugDrawer_drawContactPoint_5 = function () {
      return (ny = b._emscripten_bind_DebugDrawer_drawContactPoint_5 = b.asm.Tv).apply(null, arguments);
    };
    var oy = b._emscripten_bind_DebugDrawer_reportErrorWarning_1 = function () {
      return (oy = b._emscripten_bind_DebugDrawer_reportErrorWarning_1 = b.asm.Uv).apply(null, arguments);
    };
    var py = b._emscripten_bind_DebugDrawer_draw3dText_2 = function () {
      return (py = b._emscripten_bind_DebugDrawer_draw3dText_2 = b.asm.Vv).apply(null, arguments);
    };
    var qy = b._emscripten_bind_DebugDrawer_setDebugMode_1 = function () {
      return (qy = b._emscripten_bind_DebugDrawer_setDebugMode_1 = b.asm.Wv).apply(null, arguments);
    };
    var ry = b._emscripten_bind_DebugDrawer_getDebugMode_0 = function () {
      return (ry = b._emscripten_bind_DebugDrawer_getDebugMode_0 = b.asm.Xv).apply(null, arguments);
    };
    var sy = b._emscripten_bind_DebugDrawer___destroy___0 = function () {
      return (sy = b._emscripten_bind_DebugDrawer___destroy___0 = b.asm.Yv).apply(null, arguments);
    };
    var ty = b._emscripten_bind_btCapsuleShapeX_btCapsuleShapeX_2 = function () {
      return (ty = b._emscripten_bind_btCapsuleShapeX_btCapsuleShapeX_2 = b.asm.Zv).apply(null, arguments);
    };
    var uy = b._emscripten_bind_btCapsuleShapeX_setMargin_1 = function () {
      return (uy = b._emscripten_bind_btCapsuleShapeX_setMargin_1 = b.asm._v).apply(null, arguments);
    };
    var vy = b._emscripten_bind_btCapsuleShapeX_getMargin_0 = function () {
      return (vy = b._emscripten_bind_btCapsuleShapeX_getMargin_0 = b.asm.$v).apply(null, arguments);
    };
    var wy = b._emscripten_bind_btCapsuleShapeX_getUpAxis_0 = function () {
      return (wy = b._emscripten_bind_btCapsuleShapeX_getUpAxis_0 = b.asm.aw).apply(null, arguments);
    };
    var xy = b._emscripten_bind_btCapsuleShapeX_getRadius_0 = function () {
      return (xy = b._emscripten_bind_btCapsuleShapeX_getRadius_0 = b.asm.bw).apply(null, arguments);
    };
    var yy = b._emscripten_bind_btCapsuleShapeX_getHalfHeight_0 = function () {
      return (yy = b._emscripten_bind_btCapsuleShapeX_getHalfHeight_0 = b.asm.cw).apply(null, arguments);
    };
    var zy = b._emscripten_bind_btCapsuleShapeX_setLocalScaling_1 = function () {
      return (zy = b._emscripten_bind_btCapsuleShapeX_setLocalScaling_1 = b.asm.dw).apply(null, arguments);
    };
    var Ay = b._emscripten_bind_btCapsuleShapeX_getLocalScaling_0 = function () {
      return (Ay = b._emscripten_bind_btCapsuleShapeX_getLocalScaling_0 = b.asm.ew).apply(null, arguments);
    };
    var By = b._emscripten_bind_btCapsuleShapeX_calculateLocalInertia_2 = function () {
      return (By = b._emscripten_bind_btCapsuleShapeX_calculateLocalInertia_2 = b.asm.fw).apply(null, arguments);
    };
    var Cy = b._emscripten_bind_btCapsuleShapeX___destroy___0 = function () {
      return (Cy = b._emscripten_bind_btCapsuleShapeX___destroy___0 = b.asm.gw).apply(null, arguments);
    };
    var Dy = b._emscripten_bind_btQuaternion_btQuaternion_4 = function () {
      return (Dy = b._emscripten_bind_btQuaternion_btQuaternion_4 = b.asm.hw).apply(null, arguments);
    };
    var Ey = b._emscripten_bind_btQuaternion_setValue_4 = function () {
      return (Ey = b._emscripten_bind_btQuaternion_setValue_4 = b.asm.iw).apply(null, arguments);
    };
    var Fy = b._emscripten_bind_btQuaternion_setEulerZYX_3 = function () {
      return (Fy = b._emscripten_bind_btQuaternion_setEulerZYX_3 = b.asm.jw).apply(null, arguments);
    };
    var Gy = b._emscripten_bind_btQuaternion_setRotation_2 = function () {
      return (Gy = b._emscripten_bind_btQuaternion_setRotation_2 = b.asm.kw).apply(null, arguments);
    };
    var Hy = b._emscripten_bind_btQuaternion_normalize_0 = function () {
      return (Hy = b._emscripten_bind_btQuaternion_normalize_0 = b.asm.lw).apply(null, arguments);
    };
    var Iy = b._emscripten_bind_btQuaternion_length2_0 = function () {
      return (Iy = b._emscripten_bind_btQuaternion_length2_0 = b.asm.mw).apply(null, arguments);
    };
    var Jy = b._emscripten_bind_btQuaternion_length_0 = function () {
      return (Jy = b._emscripten_bind_btQuaternion_length_0 = b.asm.nw).apply(null, arguments);
    };
    var Ky = b._emscripten_bind_btQuaternion_dot_1 = function () {
      return (Ky = b._emscripten_bind_btQuaternion_dot_1 = b.asm.ow).apply(null, arguments);
    };
    var Ly = b._emscripten_bind_btQuaternion_normalized_0 = function () {
      return (Ly = b._emscripten_bind_btQuaternion_normalized_0 = b.asm.pw).apply(null, arguments);
    };
    var My = b._emscripten_bind_btQuaternion_getAxis_0 = function () {
      return (My = b._emscripten_bind_btQuaternion_getAxis_0 = b.asm.qw).apply(null, arguments);
    };
    var Ny = b._emscripten_bind_btQuaternion_inverse_0 = function () {
      return (Ny = b._emscripten_bind_btQuaternion_inverse_0 = b.asm.rw).apply(null, arguments);
    };
    var Oy = b._emscripten_bind_btQuaternion_getAngle_0 = function () {
      return (Oy = b._emscripten_bind_btQuaternion_getAngle_0 = b.asm.sw).apply(null, arguments);
    };
    var Py = b._emscripten_bind_btQuaternion_getAngleShortestPath_0 = function () {
      return (Py = b._emscripten_bind_btQuaternion_getAngleShortestPath_0 = b.asm.tw).apply(null, arguments);
    };
    var Qy = b._emscripten_bind_btQuaternion_angle_1 = function () {
      return (Qy = b._emscripten_bind_btQuaternion_angle_1 = b.asm.uw).apply(null, arguments);
    };
    var Ry = b._emscripten_bind_btQuaternion_angleShortestPath_1 = function () {
      return (Ry = b._emscripten_bind_btQuaternion_angleShortestPath_1 = b.asm.vw).apply(null, arguments);
    };
    var Sy = b._emscripten_bind_btQuaternion_op_add_1 = function () {
      return (Sy = b._emscripten_bind_btQuaternion_op_add_1 = b.asm.ww).apply(null, arguments);
    };
    var Ty = b._emscripten_bind_btQuaternion_op_sub_1 = function () {
      return (Ty = b._emscripten_bind_btQuaternion_op_sub_1 = b.asm.xw).apply(null, arguments);
    };
    var Uy = b._emscripten_bind_btQuaternion_op_mul_1 = function () {
      return (Uy = b._emscripten_bind_btQuaternion_op_mul_1 = b.asm.yw).apply(null, arguments);
    };
    var Vy = b._emscripten_bind_btQuaternion_op_mulq_1 = function () {
      return (Vy = b._emscripten_bind_btQuaternion_op_mulq_1 = b.asm.zw).apply(null, arguments);
    };
    var Wy = b._emscripten_bind_btQuaternion_op_div_1 = function () {
      return (Wy = b._emscripten_bind_btQuaternion_op_div_1 = b.asm.Aw).apply(null, arguments);
    };
    var Xy = b._emscripten_bind_btQuaternion_x_0 = function () {
      return (Xy = b._emscripten_bind_btQuaternion_x_0 = b.asm.Bw).apply(null, arguments);
    };
    var Yy = b._emscripten_bind_btQuaternion_y_0 = function () {
      return (Yy = b._emscripten_bind_btQuaternion_y_0 = b.asm.Cw).apply(null, arguments);
    };
    var Zy = b._emscripten_bind_btQuaternion_z_0 = function () {
      return (Zy = b._emscripten_bind_btQuaternion_z_0 = b.asm.Dw).apply(null, arguments);
    };
    var $y = b._emscripten_bind_btQuaternion_w_0 = function () {
      return ($y = b._emscripten_bind_btQuaternion_w_0 = b.asm.Ew).apply(null, arguments);
    };
    var az = b._emscripten_bind_btQuaternion_setX_1 = function () {
      return (az = b._emscripten_bind_btQuaternion_setX_1 = b.asm.Fw).apply(null, arguments);
    };
    var bz = b._emscripten_bind_btQuaternion_setY_1 = function () {
      return (bz = b._emscripten_bind_btQuaternion_setY_1 = b.asm.Gw).apply(null, arguments);
    };
    var cz = b._emscripten_bind_btQuaternion_setZ_1 = function () {
      return (cz = b._emscripten_bind_btQuaternion_setZ_1 = b.asm.Hw).apply(null, arguments);
    };
    var dz = b._emscripten_bind_btQuaternion_setW_1 = function () {
      return (dz = b._emscripten_bind_btQuaternion_setW_1 = b.asm.Iw).apply(null, arguments);
    };
    var ez = b._emscripten_bind_btQuaternion___destroy___0 = function () {
      return (ez = b._emscripten_bind_btQuaternion___destroy___0 = b.asm.Jw).apply(null, arguments);
    };
    var fz = b._emscripten_bind_btCapsuleShapeZ_btCapsuleShapeZ_2 = function () {
      return (fz = b._emscripten_bind_btCapsuleShapeZ_btCapsuleShapeZ_2 = b.asm.Kw).apply(null, arguments);
    };
    var gz = b._emscripten_bind_btCapsuleShapeZ_setMargin_1 = function () {
      return (gz = b._emscripten_bind_btCapsuleShapeZ_setMargin_1 = b.asm.Lw).apply(null, arguments);
    };
    var hz = b._emscripten_bind_btCapsuleShapeZ_getMargin_0 = function () {
      return (hz = b._emscripten_bind_btCapsuleShapeZ_getMargin_0 = b.asm.Mw).apply(null, arguments);
    };
    var iz = b._emscripten_bind_btCapsuleShapeZ_getUpAxis_0 = function () {
      return (iz = b._emscripten_bind_btCapsuleShapeZ_getUpAxis_0 = b.asm.Nw).apply(null, arguments);
    };
    var jz = b._emscripten_bind_btCapsuleShapeZ_getRadius_0 = function () {
      return (jz = b._emscripten_bind_btCapsuleShapeZ_getRadius_0 = b.asm.Ow).apply(null, arguments);
    };
    var kz = b._emscripten_bind_btCapsuleShapeZ_getHalfHeight_0 = function () {
      return (kz = b._emscripten_bind_btCapsuleShapeZ_getHalfHeight_0 = b.asm.Pw).apply(null, arguments);
    };
    var lz = b._emscripten_bind_btCapsuleShapeZ_setLocalScaling_1 = function () {
      return (lz = b._emscripten_bind_btCapsuleShapeZ_setLocalScaling_1 = b.asm.Qw).apply(null, arguments);
    };
    var mz = b._emscripten_bind_btCapsuleShapeZ_getLocalScaling_0 = function () {
      return (mz = b._emscripten_bind_btCapsuleShapeZ_getLocalScaling_0 = b.asm.Rw).apply(null, arguments);
    };
    var nz = b._emscripten_bind_btCapsuleShapeZ_calculateLocalInertia_2 = function () {
      return (nz = b._emscripten_bind_btCapsuleShapeZ_calculateLocalInertia_2 = b.asm.Sw).apply(null, arguments);
    };
    var oz = b._emscripten_bind_btCapsuleShapeZ___destroy___0 = function () {
      return (oz = b._emscripten_bind_btCapsuleShapeZ___destroy___0 = b.asm.Tw).apply(null, arguments);
    };
    var pz = b._emscripten_bind_btContactSolverInfo_get_m_splitImpulse_0 = function () {
      return (pz = b._emscripten_bind_btContactSolverInfo_get_m_splitImpulse_0 = b.asm.Uw).apply(null, arguments);
    };
    var qz = b._emscripten_bind_btContactSolverInfo_set_m_splitImpulse_1 = function () {
      return (qz = b._emscripten_bind_btContactSolverInfo_set_m_splitImpulse_1 = b.asm.Vw).apply(null, arguments);
    };
    var rz = b._emscripten_bind_btContactSolverInfo_get_m_splitImpulsePenetrationThreshold_0 = function () {
      return (rz = b._emscripten_bind_btContactSolverInfo_get_m_splitImpulsePenetrationThreshold_0 = b.asm.Ww).apply(null, arguments);
    };
    var sz = b._emscripten_bind_btContactSolverInfo_set_m_splitImpulsePenetrationThreshold_1 = function () {
      return (sz = b._emscripten_bind_btContactSolverInfo_set_m_splitImpulsePenetrationThreshold_1 = b.asm.Xw).apply(null, arguments);
    };
    var tz = b._emscripten_bind_btContactSolverInfo_get_m_numIterations_0 = function () {
      return (tz = b._emscripten_bind_btContactSolverInfo_get_m_numIterations_0 = b.asm.Yw).apply(null, arguments);
    };
    var uz = b._emscripten_bind_btContactSolverInfo_set_m_numIterations_1 = function () {
      return (uz = b._emscripten_bind_btContactSolverInfo_set_m_numIterations_1 = b.asm.Zw).apply(null, arguments);
    };
    var vz = b._emscripten_bind_btContactSolverInfo___destroy___0 = function () {
      return (vz = b._emscripten_bind_btContactSolverInfo___destroy___0 = b.asm._w).apply(null, arguments);
    };
    var wz = b._emscripten_bind_btGeneric6DofSpringConstraint_btGeneric6DofSpringConstraint_3 = function () {
      return (wz = b._emscripten_bind_btGeneric6DofSpringConstraint_btGeneric6DofSpringConstraint_3 = b.asm.$w).apply(null, arguments);
    };
    var xz = b._emscripten_bind_btGeneric6DofSpringConstraint_btGeneric6DofSpringConstraint_5 = function () {
      return (xz = b._emscripten_bind_btGeneric6DofSpringConstraint_btGeneric6DofSpringConstraint_5 = b.asm.ax).apply(null, arguments);
    };
    var yz = b._emscripten_bind_btGeneric6DofSpringConstraint_enableSpring_2 = function () {
      return (yz = b._emscripten_bind_btGeneric6DofSpringConstraint_enableSpring_2 = b.asm.bx).apply(null, arguments);
    };
    var zz = b._emscripten_bind_btGeneric6DofSpringConstraint_setStiffness_2 = function () {
      return (zz = b._emscripten_bind_btGeneric6DofSpringConstraint_setStiffness_2 = b.asm.cx).apply(null, arguments);
    };
    var Az = b._emscripten_bind_btGeneric6DofSpringConstraint_setDamping_2 = function () {
      return (Az = b._emscripten_bind_btGeneric6DofSpringConstraint_setDamping_2 = b.asm.dx).apply(null, arguments);
    };
    var Bz = b._emscripten_bind_btGeneric6DofSpringConstraint_setEquilibriumPoint_0 = function () {
      return (Bz = b._emscripten_bind_btGeneric6DofSpringConstraint_setEquilibriumPoint_0 = b.asm.ex).apply(null, arguments);
    };
    var Cz = b._emscripten_bind_btGeneric6DofSpringConstraint_setEquilibriumPoint_1 = function () {
      return (Cz = b._emscripten_bind_btGeneric6DofSpringConstraint_setEquilibriumPoint_1 = b.asm.fx).apply(null, arguments);
    };
    var Dz = b._emscripten_bind_btGeneric6DofSpringConstraint_setEquilibriumPoint_2 = function () {
      return (Dz = b._emscripten_bind_btGeneric6DofSpringConstraint_setEquilibriumPoint_2 = b.asm.gx).apply(null, arguments);
    };
    var Ez = b._emscripten_bind_btGeneric6DofSpringConstraint_setLinearLowerLimit_1 = function () {
      return (Ez = b._emscripten_bind_btGeneric6DofSpringConstraint_setLinearLowerLimit_1 = b.asm.hx).apply(null, arguments);
    };
    var Fz = b._emscripten_bind_btGeneric6DofSpringConstraint_setLinearUpperLimit_1 = function () {
      return (Fz = b._emscripten_bind_btGeneric6DofSpringConstraint_setLinearUpperLimit_1 = b.asm.ix).apply(null, arguments);
    };
    var Gz = b._emscripten_bind_btGeneric6DofSpringConstraint_setAngularLowerLimit_1 = function () {
      return (Gz = b._emscripten_bind_btGeneric6DofSpringConstraint_setAngularLowerLimit_1 = b.asm.jx).apply(null, arguments);
    };
    var Hz = b._emscripten_bind_btGeneric6DofSpringConstraint_setAngularUpperLimit_1 = function () {
      return (Hz = b._emscripten_bind_btGeneric6DofSpringConstraint_setAngularUpperLimit_1 = b.asm.kx).apply(null, arguments);
    };
    var Iz = b._emscripten_bind_btGeneric6DofSpringConstraint_getFrameOffsetA_0 = function () {
      return (Iz = b._emscripten_bind_btGeneric6DofSpringConstraint_getFrameOffsetA_0 = b.asm.lx).apply(null, arguments);
    };
    var Jz = b._emscripten_bind_btGeneric6DofSpringConstraint_enableFeedback_1 = function () {
      return (Jz = b._emscripten_bind_btGeneric6DofSpringConstraint_enableFeedback_1 = b.asm.mx).apply(null, arguments);
    };
    var Kz = b._emscripten_bind_btGeneric6DofSpringConstraint_getBreakingImpulseThreshold_0 = function () {
      return (Kz = b._emscripten_bind_btGeneric6DofSpringConstraint_getBreakingImpulseThreshold_0 = b.asm.nx).apply(null, arguments);
    };
    var Lz = b._emscripten_bind_btGeneric6DofSpringConstraint_setBreakingImpulseThreshold_1 = function () {
      return (Lz = b._emscripten_bind_btGeneric6DofSpringConstraint_setBreakingImpulseThreshold_1 = b.asm.ox).apply(null, arguments);
    };
    var Mz = b._emscripten_bind_btGeneric6DofSpringConstraint_getParam_2 = function () {
      return (Mz = b._emscripten_bind_btGeneric6DofSpringConstraint_getParam_2 = b.asm.px).apply(null, arguments);
    };
    var Nz = b._emscripten_bind_btGeneric6DofSpringConstraint_setParam_3 = function () {
      return (Nz = b._emscripten_bind_btGeneric6DofSpringConstraint_setParam_3 = b.asm.qx).apply(null, arguments);
    };
    var Oz = b._emscripten_bind_btGeneric6DofSpringConstraint___destroy___0 = function () {
      return (Oz = b._emscripten_bind_btGeneric6DofSpringConstraint___destroy___0 = b.asm.rx).apply(null, arguments);
    };
    var Pz = b._emscripten_bind_btSphereShape_btSphereShape_1 = function () {
      return (Pz = b._emscripten_bind_btSphereShape_btSphereShape_1 = b.asm.sx).apply(null, arguments);
    };
    var Qz = b._emscripten_bind_btSphereShape_setMargin_1 = function () {
      return (Qz = b._emscripten_bind_btSphereShape_setMargin_1 = b.asm.tx).apply(null, arguments);
    };
    var Rz = b._emscripten_bind_btSphereShape_getMargin_0 = function () {
      return (Rz = b._emscripten_bind_btSphereShape_getMargin_0 = b.asm.ux).apply(null, arguments);
    };
    var Sz = b._emscripten_bind_btSphereShape_setLocalScaling_1 = function () {
      return (Sz = b._emscripten_bind_btSphereShape_setLocalScaling_1 = b.asm.vx).apply(null, arguments);
    };
    var Tz = b._emscripten_bind_btSphereShape_getLocalScaling_0 = function () {
      return (Tz = b._emscripten_bind_btSphereShape_getLocalScaling_0 = b.asm.wx).apply(null, arguments);
    };
    var Uz = b._emscripten_bind_btSphereShape_calculateLocalInertia_2 = function () {
      return (Uz = b._emscripten_bind_btSphereShape_calculateLocalInertia_2 = b.asm.xx).apply(null, arguments);
    };
    var Vz = b._emscripten_bind_btSphereShape___destroy___0 = function () {
      return (Vz = b._emscripten_bind_btSphereShape___destroy___0 = b.asm.yx).apply(null, arguments);
    };
    var Wz = b._emscripten_bind_LocalConvexResult_LocalConvexResult_5 = function () {
      return (Wz = b._emscripten_bind_LocalConvexResult_LocalConvexResult_5 = b.asm.zx).apply(null, arguments);
    };
    var Xz = b._emscripten_bind_LocalConvexResult_get_m_hitCollisionObject_0 = function () {
      return (Xz = b._emscripten_bind_LocalConvexResult_get_m_hitCollisionObject_0 = b.asm.Ax).apply(null, arguments);
    };
    var Yz = b._emscripten_bind_LocalConvexResult_set_m_hitCollisionObject_1 = function () {
      return (Yz = b._emscripten_bind_LocalConvexResult_set_m_hitCollisionObject_1 = b.asm.Bx).apply(null, arguments);
    };
    var Zz = b._emscripten_bind_LocalConvexResult_get_m_localShapeInfo_0 = function () {
      return (Zz = b._emscripten_bind_LocalConvexResult_get_m_localShapeInfo_0 = b.asm.Cx).apply(null, arguments);
    };
    var $z = b._emscripten_bind_LocalConvexResult_set_m_localShapeInfo_1 = function () {
      return ($z = b._emscripten_bind_LocalConvexResult_set_m_localShapeInfo_1 = b.asm.Dx).apply(null, arguments);
    };
    var aA = b._emscripten_bind_LocalConvexResult_get_m_hitNormalLocal_0 = function () {
      return (aA = b._emscripten_bind_LocalConvexResult_get_m_hitNormalLocal_0 = b.asm.Ex).apply(null, arguments);
    };
    var bA = b._emscripten_bind_LocalConvexResult_set_m_hitNormalLocal_1 = function () {
      return (bA = b._emscripten_bind_LocalConvexResult_set_m_hitNormalLocal_1 = b.asm.Fx).apply(null, arguments);
    };
    var cA = b._emscripten_bind_LocalConvexResult_get_m_hitPointLocal_0 = function () {
      return (cA = b._emscripten_bind_LocalConvexResult_get_m_hitPointLocal_0 = b.asm.Gx).apply(null, arguments);
    };
    var dA = b._emscripten_bind_LocalConvexResult_set_m_hitPointLocal_1 = function () {
      return (dA = b._emscripten_bind_LocalConvexResult_set_m_hitPointLocal_1 = b.asm.Hx).apply(null, arguments);
    };
    var eA = b._emscripten_bind_LocalConvexResult_get_m_hitFraction_0 = function () {
      return (eA = b._emscripten_bind_LocalConvexResult_get_m_hitFraction_0 = b.asm.Ix).apply(null, arguments);
    };
    var fA = b._emscripten_bind_LocalConvexResult_set_m_hitFraction_1 = function () {
      return (fA = b._emscripten_bind_LocalConvexResult_set_m_hitFraction_1 = b.asm.Jx).apply(null, arguments);
    };
    var gA = b._emscripten_bind_LocalConvexResult___destroy___0 = function () {
      return (gA = b._emscripten_bind_LocalConvexResult___destroy___0 = b.asm.Kx).apply(null, arguments);
    };
    var hA = b._emscripten_enum_btConstraintParams_BT_CONSTRAINT_ERP = function () {
      return (hA = b._emscripten_enum_btConstraintParams_BT_CONSTRAINT_ERP = b.asm.Lx).apply(null, arguments);
    };
    var iA = b._emscripten_enum_btConstraintParams_BT_CONSTRAINT_STOP_ERP = function () {
      return (iA = b._emscripten_enum_btConstraintParams_BT_CONSTRAINT_STOP_ERP = b.asm.Mx).apply(null, arguments);
    };
    var jA = b._emscripten_enum_btConstraintParams_BT_CONSTRAINT_CFM = function () {
      return (jA = b._emscripten_enum_btConstraintParams_BT_CONSTRAINT_CFM = b.asm.Nx).apply(null, arguments);
    };
    var kA = b._emscripten_enum_btConstraintParams_BT_CONSTRAINT_STOP_CFM = function () {
      return (kA = b._emscripten_enum_btConstraintParams_BT_CONSTRAINT_STOP_CFM = b.asm.Ox).apply(null, arguments);
    };
    var lA = b._emscripten_enum_PHY_ScalarType_PHY_FLOAT = function () {
      return (lA = b._emscripten_enum_PHY_ScalarType_PHY_FLOAT = b.asm.Px).apply(null, arguments);
    };
    var mA = b._emscripten_enum_PHY_ScalarType_PHY_DOUBLE = function () {
      return (mA = b._emscripten_enum_PHY_ScalarType_PHY_DOUBLE = b.asm.Qx).apply(null, arguments);
    };
    var nA = b._emscripten_enum_PHY_ScalarType_PHY_INTEGER = function () {
      return (nA = b._emscripten_enum_PHY_ScalarType_PHY_INTEGER = b.asm.Rx).apply(null, arguments);
    };
    var oA = b._emscripten_enum_PHY_ScalarType_PHY_SHORT = function () {
      return (oA = b._emscripten_enum_PHY_ScalarType_PHY_SHORT = b.asm.Sx).apply(null, arguments);
    };
    var pA = b._emscripten_enum_PHY_ScalarType_PHY_FIXEDPOINT88 = function () {
      return (pA = b._emscripten_enum_PHY_ScalarType_PHY_FIXEDPOINT88 = b.asm.Tx).apply(null, arguments);
    };
    var qA = b._emscripten_enum_PHY_ScalarType_PHY_UCHAR = function () {
      return (qA = b._emscripten_enum_PHY_ScalarType_PHY_UCHAR = b.asm.Ux).apply(null, arguments);
    };
    b._malloc = function () {
      return (b._malloc = b.asm.Vx).apply(null, arguments);
    };
    b._free = function () {
      return (b._free = b.asm.Wx).apply(null, arguments);
    };
    b.dynCall_vi = function () {
      return (b.dynCall_vi = b.asm.Xx).apply(null, arguments);
    };
    b.dynCall_v = function () {
      return (b.dynCall_v = b.asm.Yx).apply(null, arguments);
    };
    b.asm = ab;
    b.UTF8ToString = function (a, c) {
      if (a) {
        return xa(Aa, a, c);
      } else {
        return "";
      }
    };
    b.addFunction = function (a, c) {
      if (!ra) {
        ra = new WeakMap();
        for (var d = 0; d < ua.length; d++) {
          var e = ua.get(d);
          if (e) {
            ra.set(e, d);
          }
        }
      }
      if (ra.has(a)) {
        a = ra.get(a);
      } else {
        if (qa.length) {
          d = qa.pop();
        } else {
          d = ua.length;
          try {
            ua.grow(1);
          } catch (P) {
            if (!(P instanceof RangeError)) {
              throw P;
            }
            throw "Unable to grow wasm table. Set ALLOW_TABLE_GROWTH.";
          }
        }
        try {
          ua.set(d, a);
        } catch (P) {
          if (!(P instanceof TypeError)) {
            throw P;
          }
          assert(typeof c !== "undefined", "Missing signature argument to addFunction");
          if (typeof WebAssembly.Function === "function") {
            var f = {
              i: "i32",
              j: "i64",
              f: "f32",
              d: "f64"
            };
            var m = {
              parameters: [],
              results: c[0] == "v" ? [] : [f[c[0]]]
            };
            for (e = 1; e < c.length; ++e) {
              m.parameters.push(f[c[e]]);
            }
            c = new WebAssembly.Function(m, a);
          } else {
            f = [1, 0, 1, 96];
            m = c.slice(0, 1);
            c = c.slice(1);
            var C = {
              i: 127,
              j: 126,
              f: 125,
              d: 124
            };
            f.push(c.length);
            for (e = 0; e < c.length; ++e) {
              f.push(C[c[e]]);
            }
            if (m == "v") {
              f.push(0);
            } else {
              f = f.concat([1, C[m]]);
            }
            f[1] = f.length - 2;
            c = new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0].concat(f, [2, 7, 1, 1, 101, 1, 102, 0, 0, 7, 5, 1, 1, 102, 0, 0]));
            c = new WebAssembly.Module(c);
            c = new WebAssembly.Instance(c, {
              e: {
                f: a
              }
            }).exports.f;
          }
          ua.set(d, c);
        }
        a = ra[a] = d;
      }
      return a;
    };
    var rA;
    b.then = function (a) {
      if (rA) {
        a(b);
      } else {
        var c = b.onRuntimeInitialized;
        b.onRuntimeInitialized = function () {
          if (c) {
            c();
          }
          a(b);
        };
      }
      return b;
    };
    Pa = function sA() {
      if (!rA) {
        tA();
      }
      if (!rA) {
        Pa = sA;
      }
    };
    function tA() {
      function a() {
        if (!rA && (rA = true, b.calledRun = true, !va)) {
          La = true;
          Ga(Ia);
          Ga(Ja);
          if (b.onRuntimeInitialized) {
            b.onRuntimeInitialized();
          }
          if (b.postRun) {
            for (typeof b.postRun == "function" && (b.postRun = [b.postRun]); b.postRun.length;) {
              var c = b.postRun.shift();
              Ka.unshift(c);
            }
          }
          Ga(Ka);
        }
      }
      if (!(Na > 0)) {
        if (b.preRun) {
          for (typeof b.preRun == "function" && (b.preRun = [b.preRun]); b.preRun.length;) {
            Ma();
          }
        }
        Ga(Ha);
        if (!(Na > 0)) {
          if (b.setStatus) {
            b.setStatus("Running...");
            setTimeout(function () {
              setTimeout(function () {
                b.setStatus("");
              }, 1);
              a();
            }, 1);
          } else {
            a();
          }
        }
      }
    }
    b.run = tA;
    if (b.preInit) {
      for (typeof b.preInit == "function" && (b.preInit = [b.preInit]); b.preInit.length > 0;) {
        b.preInit.pop()();
      }
    }
    noExitRuntime = true;
    tA();
    function g() {}
    g.prototype = Object.create(g.prototype);
    g.prototype.constructor = g;
    g.prototype.$x = g;
    g.ay = {};
    b.WrapperObject = g;
    function h(a) {
      return (a || g).ay;
    }
    b.getCache = h;
    function k(a, c) {
      var d = h(c);
      var e = d[a];
      if (e) {
        return e;
      }
      e = Object.create((c || g).prototype);
      e.Zx = a;
      return d[a] = e;
    }
    b.wrapPointer = k;
    b.castObject = function (a, c) {
      return k(a.Zx, c);
    };
    b.NULL = k(0);
    b.destroy = function (a) {
      if (!a.__destroy__) {
        throw "Error: Cannot destroy object. (Did you create it yourself?)";
      }
      a.__destroy__();
      delete h(a.$x)[a.Zx];
    };
    b.compare = function (a, c) {
      return a.Zx === c.Zx;
    };
    b.getPointer = function (a) {
      return a.Zx;
    };
    b.getClass = function (a) {
      return a.$x;
    };
    var uA = 0;
    var vA = 0;
    var wA = 0;
    var xA = [];
    var yA = 0;
    function zA() {
      if (yA) {
        for (var a = 0; a < xA.length; a++) {
          b._free(xA[a]);
        }
        xA.length = 0;
        b._free(uA);
        uA = 0;
        vA += yA;
        yA = 0;
      }
      if (!uA) {
        vA += 128;
        uA = b._malloc(vA);
        assert(uA);
      }
      wA = 0;
    }
    function AA(a, c) {
      assert(uA);
      a = a.length * c.BYTES_PER_ELEMENT;
      a = a + 7 & -8;
      if (wA + a >= vA) {
        assert(a > 0);
        yA += a;
        c = b._malloc(a);
        xA.push(c);
      } else {
        c = uA + wA;
        wA += a;
      }
      return c;
    }
    function BA(a, c, d) {
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
      for (var e = 0; e < a.length; e++) {
        c[d + e] = a[e];
      }
    }
    function CA(a) {
      if (typeof a === "string") {
        var c = 0;
        for (var d = 0; d < a.length; ++d) {
          var e = a.charCodeAt(d);
          if (e >= 55296 && e <= 57343) {
            e = 65536 + ((e & 1023) << 10) | a.charCodeAt(++d) & 1023;
          }
          if (e <= 127) {
            ++c;
          } else {
            c = e <= 2047 ? c + 2 : e <= 65535 ? c + 3 : c + 4;
          }
        }
        c = Array(c + 1);
        e = c.length;
        d = 0;
        if (e > 0) {
          e = d + e - 1;
          for (var f = 0; f < a.length; ++f) {
            var m = a.charCodeAt(f);
            if (m >= 55296 && m <= 57343) {
              var C = a.charCodeAt(++f);
              m = 65536 + ((m & 1023) << 10) | C & 1023;
            }
            if (m <= 127) {
              if (d >= e) {
                break;
              }
              c[d++] = m;
            } else {
              if (m <= 2047) {
                if (d + 1 >= e) {
                  break;
                }
                c[d++] = m >> 6 | 192;
              } else {
                if (m <= 65535) {
                  if (d + 2 >= e) {
                    break;
                  }
                  c[d++] = m >> 12 | 224;
                } else {
                  if (d + 3 >= e) {
                    break;
                  }
                  c[d++] = m >> 18 | 240;
                  c[d++] = m >> 12 & 63 | 128;
                }
                c[d++] = m >> 6 & 63 | 128;
              }
              c[d++] = m & 63 | 128;
            }
          }
          c[d] = 0;
        }
        a = AA(c, za);
        BA(c, za, a);
      }
      return a;
    }
    function DA(a) {
      if (typeof a === "object") {
        var c = AA(a, Ca);
        BA(a, Ca, c);
        return c;
      }
      return a;
    }
    function EA() {
      throw "cannot construct a btCollisionWorld, no constructor in IDL";
    }
    EA.prototype = Object.create(g.prototype);
    EA.prototype.constructor = EA;
    EA.prototype.$x = EA;
    EA.ay = {};
    b.btCollisionWorld = EA;
    EA.prototype.getDispatcher = function () {
      return k(bb(this.Zx), FA);
    };
    EA.prototype.rayTest = function (a, c, d) {
      var e = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      if (d && typeof d === "object") {
        d = d.Zx;
      }
      cb(e, a, c, d);
    };
    EA.prototype.getPairCache = function () {
      return k(db(this.Zx), GA);
    };
    EA.prototype.getDispatchInfo = function () {
      return k(eb(this.Zx), l);
    };
    EA.prototype.addCollisionObject = function (a, c, d) {
      var e = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      if (d && typeof d === "object") {
        d = d.Zx;
      }
      if (c === undefined) {
        fb(e, a);
      } else if (d === undefined) {
        gb(e, a, c);
      } else {
        hb(e, a, c, d);
      }
    };
    EA.prototype.removeCollisionObject = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      ib(c, a);
    };
    EA.prototype.getBroadphase = function () {
      return k(jb(this.Zx), HA);
    };
    EA.prototype.convexSweepTest = function (a, c, d, e, f) {
      var m = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      if (d && typeof d === "object") {
        d = d.Zx;
      }
      if (e && typeof e === "object") {
        e = e.Zx;
      }
      if (f && typeof f === "object") {
        f = f.Zx;
      }
      kb(m, a, c, d, e, f);
    };
    EA.prototype.contactPairTest = function (a, c, d) {
      var e = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      if (d && typeof d === "object") {
        d = d.Zx;
      }
      lb(e, a, c, d);
    };
    EA.prototype.contactTest = function (a, c) {
      var d = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      mb(d, a, c);
    };
    EA.prototype.updateSingleAabb = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      ob(c, a);
    };
    EA.prototype.setDebugDrawer = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      pb(c, a);
    };
    EA.prototype.getDebugDrawer = function () {
      return k(qb(this.Zx), IA);
    };
    EA.prototype.debugDrawWorld = function () {
      rb(this.Zx);
    };
    EA.prototype.debugDrawObject = function (a, c, d) {
      var e = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      if (d && typeof d === "object") {
        d = d.Zx;
      }
      sb(e, a, c, d);
    };
    EA.prototype.__destroy__ = function () {
      tb(this.Zx);
    };
    function n() {
      throw "cannot construct a btCollisionShape, no constructor in IDL";
    }
    n.prototype = Object.create(g.prototype);
    n.prototype.constructor = n;
    n.prototype.$x = n;
    n.ay = {};
    b.btCollisionShape = n;
    n.prototype.setLocalScaling = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      ub(c, a);
    };
    n.prototype.getLocalScaling = function () {
      return k(vb(this.Zx), p);
    };
    n.prototype.calculateLocalInertia = function (a, c) {
      var d = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      wb(d, a, c);
    };
    n.prototype.setMargin = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      xb(c, a);
    };
    n.prototype.getMargin = function () {
      return yb(this.Zx);
    };
    n.prototype.__destroy__ = function () {
      zb(this.Zx);
    };
    function q() {
      throw "cannot construct a btCollisionObject, no constructor in IDL";
    }
    q.prototype = Object.create(g.prototype);
    q.prototype.constructor = q;
    q.prototype.$x = q;
    q.ay = {};
    b.btCollisionObject = q;
    q.prototype.setAnisotropicFriction = function (a, c) {
      var d = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      Ab(d, a, c);
    };
    q.prototype.getCollisionShape = function () {
      return k(Bb(this.Zx), n);
    };
    q.prototype.setContactProcessingThreshold = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Cb(c, a);
    };
    q.prototype.setActivationState = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Db(c, a);
    };
    q.prototype.forceActivationState = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Eb(c, a);
    };
    q.prototype.activate = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (a === undefined) {
        Fb(c);
      } else {
        Gb(c, a);
      }
    };
    q.prototype.isActive = function () {
      return !!Hb(this.Zx);
    };
    q.prototype.isKinematicObject = function () {
      return !!Ib(this.Zx);
    };
    q.prototype.isStaticObject = function () {
      return !!Jb(this.Zx);
    };
    q.prototype.isStaticOrKinematicObject = function () {
      return !!Kb(this.Zx);
    };
    q.prototype.getRestitution = function () {
      return Lb(this.Zx);
    };
    q.prototype.getFriction = function () {
      return Mb(this.Zx);
    };
    q.prototype.getRollingFriction = function () {
      return Nb(this.Zx);
    };
    q.prototype.setRestitution = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Ob(c, a);
    };
    q.prototype.setFriction = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Pb(c, a);
    };
    q.prototype.setRollingFriction = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Qb(c, a);
    };
    q.prototype.getWorldTransform = function () {
      return k(Rb(this.Zx), r);
    };
    q.prototype.getCollisionFlags = function () {
      return Sb(this.Zx);
    };
    q.prototype.setCollisionFlags = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Tb(c, a);
    };
    q.prototype.setWorldTransform = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Ub(c, a);
    };
    q.prototype.setCollisionShape = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Vb(c, a);
    };
    q.prototype.setCcdMotionThreshold = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Xb(c, a);
    };
    q.prototype.setCcdSweptSphereRadius = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Yb(c, a);
    };
    q.prototype.getUserIndex = function () {
      return Zb(this.Zx);
    };
    q.prototype.setUserIndex = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      $b(c, a);
    };
    q.prototype.getUserPointer = function () {
      return k(ac(this.Zx), JA);
    };
    q.prototype.setUserPointer = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      bc(c, a);
    };
    q.prototype.getBroadphaseHandle = function () {
      return k(cc(this.Zx), t);
    };
    q.prototype.__destroy__ = function () {
      dc(this.Zx);
    };
    function u() {
      throw "cannot construct a btDynamicsWorld, no constructor in IDL";
    }
    u.prototype = Object.create(EA.prototype);
    u.prototype.constructor = u;
    u.prototype.$x = u;
    u.ay = {};
    b.btDynamicsWorld = u;
    u.prototype.addAction = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      ec(c, a);
    };
    u.prototype.removeAction = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      fc(c, a);
    };
    u.prototype.getSolverInfo = function () {
      return k(hc(this.Zx), v);
    };
    u.prototype.setInternalTickCallback = function (a, c, d) {
      var e = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      if (d && typeof d === "object") {
        d = d.Zx;
      }
      if (c === undefined) {
        ic(e, a);
      } else if (d === undefined) {
        jc(e, a, c);
      } else {
        kc(e, a, c, d);
      }
    };
    u.prototype.getDispatcher = function () {
      return k(lc(this.Zx), FA);
    };
    u.prototype.rayTest = function (a, c, d) {
      var e = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      if (d && typeof d === "object") {
        d = d.Zx;
      }
      mc(e, a, c, d);
    };
    u.prototype.getPairCache = function () {
      return k(nc(this.Zx), GA);
    };
    u.prototype.getDispatchInfo = function () {
      return k(oc(this.Zx), l);
    };
    u.prototype.addCollisionObject = function (a, c, d) {
      var e = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      if (d && typeof d === "object") {
        d = d.Zx;
      }
      if (c === undefined) {
        pc(e, a);
      } else if (d === undefined) {
        qc(e, a, c);
      } else {
        rc(e, a, c, d);
      }
    };
    u.prototype.removeCollisionObject = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      sc(c, a);
    };
    u.prototype.getBroadphase = function () {
      return k(tc(this.Zx), HA);
    };
    u.prototype.convexSweepTest = function (a, c, d, e, f) {
      var m = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      if (d && typeof d === "object") {
        d = d.Zx;
      }
      if (e && typeof e === "object") {
        e = e.Zx;
      }
      if (f && typeof f === "object") {
        f = f.Zx;
      }
      uc(m, a, c, d, e, f);
    };
    u.prototype.contactPairTest = function (a, c, d) {
      var e = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      if (d && typeof d === "object") {
        d = d.Zx;
      }
      vc(e, a, c, d);
    };
    u.prototype.contactTest = function (a, c) {
      var d = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      wc(d, a, c);
    };
    u.prototype.updateSingleAabb = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      xc(c, a);
    };
    u.prototype.setDebugDrawer = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      yc(c, a);
    };
    u.prototype.getDebugDrawer = function () {
      return k(zc(this.Zx), IA);
    };
    u.prototype.debugDrawWorld = function () {
      Ac(this.Zx);
    };
    u.prototype.debugDrawObject = function (a, c, d) {
      var e = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      if (d && typeof d === "object") {
        d = d.Zx;
      }
      Bc(e, a, c, d);
    };
    u.prototype.__destroy__ = function () {
      Cc(this.Zx);
    };
    function KA() {
      throw "cannot construct a btTypedConstraint, no constructor in IDL";
    }
    KA.prototype = Object.create(g.prototype);
    KA.prototype.constructor = KA;
    KA.prototype.$x = KA;
    KA.ay = {};
    b.btTypedConstraint = KA;
    KA.prototype.enableFeedback = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Dc(c, a);
    };
    KA.prototype.getBreakingImpulseThreshold = function () {
      return Ec(this.Zx);
    };
    KA.prototype.setBreakingImpulseThreshold = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Fc(c, a);
    };
    KA.prototype.getParam = function (a, c) {
      var d = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      return Gc(d, a, c);
    };
    KA.prototype.setParam = function (a, c, d) {
      var e = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      if (d && typeof d === "object") {
        d = d.Zx;
      }
      Hc(e, a, c, d);
    };
    KA.prototype.__destroy__ = function () {
      Ic(this.Zx);
    };
    function LA() {
      throw "cannot construct a btConcaveShape, no constructor in IDL";
    }
    LA.prototype = Object.create(n.prototype);
    LA.prototype.constructor = LA;
    LA.prototype.$x = LA;
    LA.ay = {};
    b.btConcaveShape = LA;
    LA.prototype.setLocalScaling = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Jc(c, a);
    };
    LA.prototype.getLocalScaling = function () {
      return k(Kc(this.Zx), p);
    };
    LA.prototype.calculateLocalInertia = function (a, c) {
      var d = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      Lc(d, a, c);
    };
    LA.prototype.__destroy__ = function () {
      Mc(this.Zx);
    };
    function MA(a, c) {
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      this.Zx = Nc(a, c);
      h(MA)[this.Zx] = this;
    }
    MA.prototype = Object.create(n.prototype);
    MA.prototype.constructor = MA;
    MA.prototype.$x = MA;
    MA.ay = {};
    b.btCapsuleShape = MA;
    MA.prototype.setMargin = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Oc(c, a);
    };
    MA.prototype.getMargin = function () {
      return Pc(this.Zx);
    };
    MA.prototype.getUpAxis = function () {
      return Qc(this.Zx);
    };
    MA.prototype.getRadius = function () {
      return Rc(this.Zx);
    };
    MA.prototype.getHalfHeight = function () {
      return Sc(this.Zx);
    };
    MA.prototype.setLocalScaling = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Tc(c, a);
    };
    MA.prototype.getLocalScaling = function () {
      return k(Uc(this.Zx), p);
    };
    MA.prototype.calculateLocalInertia = function (a, c) {
      var d = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      Vc(d, a, c);
    };
    MA.prototype.__destroy__ = function () {
      Wc(this.Zx);
    };
    function IA() {
      throw "cannot construct a btIDebugDraw, no constructor in IDL";
    }
    IA.prototype = Object.create(g.prototype);
    IA.prototype.constructor = IA;
    IA.prototype.$x = IA;
    IA.ay = {};
    b.btIDebugDraw = IA;
    IA.prototype.drawLine = function (a, c, d) {
      var e = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      if (d && typeof d === "object") {
        d = d.Zx;
      }
      Xc(e, a, c, d);
    };
    IA.prototype.drawContactPoint = function (a, c, d, e, f) {
      var m = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      if (d && typeof d === "object") {
        d = d.Zx;
      }
      if (e && typeof e === "object") {
        e = e.Zx;
      }
      if (f && typeof f === "object") {
        f = f.Zx;
      }
      Yc(m, a, c, d, e, f);
    };
    IA.prototype.reportErrorWarning = function (a) {
      var c = this.Zx;
      zA();
      a = a && typeof a === "object" ? a.Zx : CA(a);
      Zc(c, a);
    };
    IA.prototype.draw3dText = function (a, c) {
      var d = this.Zx;
      zA();
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      c = c && typeof c === "object" ? c.Zx : CA(c);
      $c(d, a, c);
    };
    IA.prototype.setDebugMode = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      ad(c, a);
    };
    IA.prototype.getDebugMode = function () {
      return bd(this.Zx);
    };
    IA.prototype.__destroy__ = function () {
      cd(this.Zx);
    };
    function NA(a) {
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      this.Zx = a === undefined ? dd() : ed(a);
      h(NA)[this.Zx] = this;
    }
    NA.prototype = Object.create(g.prototype);
    NA.prototype.constructor = NA;
    NA.prototype.$x = NA;
    NA.ay = {};
    b.btDefaultCollisionConfiguration = NA;
    NA.prototype.__destroy__ = function () {
      fd(this.Zx);
    };
    function OA() {
      throw "cannot construct a btTriangleMeshShape, no constructor in IDL";
    }
    OA.prototype = Object.create(LA.prototype);
    OA.prototype.constructor = OA;
    OA.prototype.$x = OA;
    OA.ay = {};
    b.btTriangleMeshShape = OA;
    OA.prototype.setLocalScaling = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      gd(c, a);
    };
    OA.prototype.getLocalScaling = function () {
      return k(hd(this.Zx), p);
    };
    OA.prototype.calculateLocalInertia = function (a, c) {
      var d = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      id(d, a, c);
    };
    OA.prototype.__destroy__ = function () {
      jd(this.Zx);
    };
    function w() {
      this.Zx = kd();
      h(w)[this.Zx] = this;
    }
    w.prototype = Object.create(q.prototype);
    w.prototype.constructor = w;
    w.prototype.$x = w;
    w.ay = {};
    b.btGhostObject = w;
    w.prototype.getNumOverlappingObjects = function () {
      return ld(this.Zx);
    };
    w.prototype.getOverlappingObject = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      return k(md(c, a), q);
    };
    w.prototype.setAnisotropicFriction = function (a, c) {
      var d = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      nd(d, a, c);
    };
    w.prototype.getCollisionShape = function () {
      return k(od(this.Zx), n);
    };
    w.prototype.setContactProcessingThreshold = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      pd(c, a);
    };
    w.prototype.setActivationState = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      qd(c, a);
    };
    w.prototype.forceActivationState = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      rd(c, a);
    };
    w.prototype.activate = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (a === undefined) {
        sd(c);
      } else {
        td(c, a);
      }
    };
    w.prototype.isActive = function () {
      return !!ud(this.Zx);
    };
    w.prototype.isKinematicObject = function () {
      return !!vd(this.Zx);
    };
    w.prototype.isStaticObject = function () {
      return !!wd(this.Zx);
    };
    w.prototype.isStaticOrKinematicObject = function () {
      return !!xd(this.Zx);
    };
    w.prototype.getRestitution = function () {
      return yd(this.Zx);
    };
    w.prototype.getFriction = function () {
      return zd(this.Zx);
    };
    w.prototype.getRollingFriction = function () {
      return Ad(this.Zx);
    };
    w.prototype.setRestitution = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Bd(c, a);
    };
    w.prototype.setFriction = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Cd(c, a);
    };
    w.prototype.setRollingFriction = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Dd(c, a);
    };
    w.prototype.getWorldTransform = function () {
      return k(Ed(this.Zx), r);
    };
    w.prototype.getCollisionFlags = function () {
      return Fd(this.Zx);
    };
    w.prototype.setCollisionFlags = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Gd(c, a);
    };
    w.prototype.setWorldTransform = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Hd(c, a);
    };
    w.prototype.setCollisionShape = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Id(c, a);
    };
    w.prototype.setCcdMotionThreshold = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Jd(c, a);
    };
    w.prototype.setCcdSweptSphereRadius = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Kd(c, a);
    };
    w.prototype.getUserIndex = function () {
      return Ld(this.Zx);
    };
    w.prototype.setUserIndex = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Md(c, a);
    };
    w.prototype.getUserPointer = function () {
      return k(Nd(this.Zx), JA);
    };
    w.prototype.setUserPointer = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Od(c, a);
    };
    w.prototype.getBroadphaseHandle = function () {
      return k(Pd(this.Zx), t);
    };
    w.prototype.__destroy__ = function () {
      Qd(this.Zx);
    };
    function PA(a, c) {
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      this.Zx = Rd(a, c);
      h(PA)[this.Zx] = this;
    }
    PA.prototype = Object.create(n.prototype);
    PA.prototype.constructor = PA;
    PA.prototype.$x = PA;
    PA.ay = {};
    b.btConeShape = PA;
    PA.prototype.setLocalScaling = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Sd(c, a);
    };
    PA.prototype.getLocalScaling = function () {
      return k(Td(this.Zx), p);
    };
    PA.prototype.calculateLocalInertia = function (a, c) {
      var d = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      Ud(d, a, c);
    };
    PA.prototype.__destroy__ = function () {
      Vd(this.Zx);
    };
    function QA() {
      throw "cannot construct a btActionInterface, no constructor in IDL";
    }
    QA.prototype = Object.create(g.prototype);
    QA.prototype.constructor = QA;
    QA.prototype.$x = QA;
    QA.ay = {};
    b.btActionInterface = QA;
    QA.prototype.updateAction = function (a, c) {
      var d = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      Wd(d, a, c);
    };
    QA.prototype.__destroy__ = function () {
      Xd(this.Zx);
    };
    function p(a, c, d) {
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      if (d && typeof d === "object") {
        d = d.Zx;
      }
      this.Zx = a === undefined ? Yd() : c === undefined ? _emscripten_bind_btVector3_btVector3_1(a) : d === undefined ? _emscripten_bind_btVector3_btVector3_2(a, c) : Zd(a, c, d);
      h(p)[this.Zx] = this;
    }
    p.prototype = Object.create(g.prototype);
    p.prototype.constructor = p;
    p.prototype.$x = p;
    p.ay = {};
    b.btVector3 = p;
    p.prototype.length = p.prototype.length = function () {
      return $d(this.Zx);
    };
    p.prototype.x = p.prototype.x = function () {
      return ae(this.Zx);
    };
    p.prototype.y = p.prototype.y = function () {
      return be(this.Zx);
    };
    p.prototype.z = p.prototype.z = function () {
      return ce(this.Zx);
    };
    p.prototype.setX = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      de(c, a);
    };
    p.prototype.setY = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      ee(c, a);
    };
    p.prototype.setZ = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      fe(c, a);
    };
    p.prototype.setValue = function (a, c, d) {
      var e = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      if (d && typeof d === "object") {
        d = d.Zx;
      }
      ge(e, a, c, d);
    };
    p.prototype.normalize = p.prototype.normalize = function () {
      he(this.Zx);
    };
    p.prototype.rotate = p.prototype.rotate = function (a, c) {
      var d = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      return k(ie(d, a, c), p);
    };
    p.prototype.dot = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      return je(c, a);
    };
    p.prototype.op_mul = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      return k(ke(c, a), p);
    };
    p.prototype.op_add = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      return k(le(c, a), p);
    };
    p.prototype.op_sub = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      return k(me(c, a), p);
    };
    p.prototype.__destroy__ = function () {
      ne(this.Zx);
    };
    function RA() {
      throw "cannot construct a btVehicleRaycaster, no constructor in IDL";
    }
    RA.prototype = Object.create(g.prototype);
    RA.prototype.constructor = RA;
    RA.prototype.$x = RA;
    RA.ay = {};
    b.btVehicleRaycaster = RA;
    RA.prototype.castRay = function (a, c, d) {
      var e = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      if (d && typeof d === "object") {
        d = d.Zx;
      }
      oe(e, a, c, d);
    };
    RA.prototype.__destroy__ = function () {
      pe(this.Zx);
    };
    function SA() {
      throw "cannot construct a btQuadWord, no constructor in IDL";
    }
    SA.prototype = Object.create(g.prototype);
    SA.prototype.constructor = SA;
    SA.prototype.$x = SA;
    SA.ay = {};
    b.btQuadWord = SA;
    SA.prototype.x = SA.prototype.x = function () {
      return qe(this.Zx);
    };
    SA.prototype.y = SA.prototype.y = function () {
      return re(this.Zx);
    };
    SA.prototype.z = SA.prototype.z = function () {
      return se(this.Zx);
    };
    SA.prototype.w = function () {
      return te(this.Zx);
    };
    SA.prototype.setX = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      ue(c, a);
    };
    SA.prototype.setY = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      ve(c, a);
    };
    SA.prototype.setZ = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      we(c, a);
    };
    SA.prototype.setW = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      xe(c, a);
    };
    SA.prototype.__destroy__ = function () {
      ye(this.Zx);
    };
    function TA(a) {
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      this.Zx = ze(a);
      h(TA)[this.Zx] = this;
    }
    TA.prototype = Object.create(n.prototype);
    TA.prototype.constructor = TA;
    TA.prototype.$x = TA;
    TA.ay = {};
    b.btCylinderShape = TA;
    TA.prototype.setMargin = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Ae(c, a);
    };
    TA.prototype.getMargin = function () {
      return Be(this.Zx);
    };
    TA.prototype.setLocalScaling = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Ce(c, a);
    };
    TA.prototype.getLocalScaling = function () {
      return k(De(this.Zx), p);
    };
    TA.prototype.calculateLocalInertia = function (a, c) {
      var d = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      Ee(d, a, c);
    };
    TA.prototype.__destroy__ = function () {
      Fe(this.Zx);
    };
    function x(a, c, d, e) {
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      if (d && typeof d === "object") {
        d = d.Zx;
      }
      if (e && typeof e === "object") {
        e = e.Zx;
      }
      this.Zx = Ge(a, c, d, e);
      h(x)[this.Zx] = this;
    }
    x.prototype = Object.create(u.prototype);
    x.prototype.constructor = x;
    x.prototype.$x = x;
    x.ay = {};
    b.btDiscreteDynamicsWorld = x;
    x.prototype.setGravity = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      He(c, a);
    };
    x.prototype.getGravity = function () {
      return k(Ie(this.Zx), p);
    };
    x.prototype.addRigidBody = function (a, c, d) {
      var e = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      if (d && typeof d === "object") {
        d = d.Zx;
      }
      if (c === undefined) {
        Je(e, a);
      } else if (d === undefined) {
        _emscripten_bind_btDiscreteDynamicsWorld_addRigidBody_2(e, a, c);
      } else {
        Ke(e, a, c, d);
      }
    };
    x.prototype.removeRigidBody = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Le(c, a);
    };
    x.prototype.addConstraint = function (a, c) {
      var d = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      if (c === undefined) {
        Me(d, a);
      } else {
        Ne(d, a, c);
      }
    };
    x.prototype.removeConstraint = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Oe(c, a);
    };
    x.prototype.stepSimulation = function (a, c, d) {
      var e = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      if (d && typeof d === "object") {
        d = d.Zx;
      }
      if (c === undefined) {
        return Pe(e, a);
      } else if (d === undefined) {
        return Qe(e, a, c);
      } else {
        return Re(e, a, c, d);
      }
    };
    x.prototype.setContactAddedCallback = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Se(c, a);
    };
    x.prototype.setContactProcessedCallback = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Te(c, a);
    };
    x.prototype.setContactDestroyedCallback = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Ue(c, a);
    };
    x.prototype.getDispatcher = function () {
      return k(Ve(this.Zx), FA);
    };
    x.prototype.rayTest = function (a, c, d) {
      var e = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      if (d && typeof d === "object") {
        d = d.Zx;
      }
      We(e, a, c, d);
    };
    x.prototype.getPairCache = function () {
      return k(Xe(this.Zx), GA);
    };
    x.prototype.getDispatchInfo = function () {
      return k(Ye(this.Zx), l);
    };
    x.prototype.addCollisionObject = function (a, c, d) {
      var e = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      if (d && typeof d === "object") {
        d = d.Zx;
      }
      if (c === undefined) {
        Ze(e, a);
      } else if (d === undefined) {
        $e(e, a, c);
      } else {
        af(e, a, c, d);
      }
    };
    x.prototype.removeCollisionObject = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      bf(c, a);
    };
    x.prototype.getBroadphase = function () {
      return k(cf(this.Zx), HA);
    };
    x.prototype.convexSweepTest = function (a, c, d, e, f) {
      var m = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      if (d && typeof d === "object") {
        d = d.Zx;
      }
      if (e && typeof e === "object") {
        e = e.Zx;
      }
      if (f && typeof f === "object") {
        f = f.Zx;
      }
      df(m, a, c, d, e, f);
    };
    x.prototype.contactPairTest = function (a, c, d) {
      var e = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      if (d && typeof d === "object") {
        d = d.Zx;
      }
      ef(e, a, c, d);
    };
    x.prototype.contactTest = function (a, c) {
      var d = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      ff(d, a, c);
    };
    x.prototype.updateSingleAabb = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      gf(c, a);
    };
    x.prototype.setDebugDrawer = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      hf(c, a);
    };
    x.prototype.getDebugDrawer = function () {
      return k(jf(this.Zx), IA);
    };
    x.prototype.debugDrawWorld = function () {
      kf(this.Zx);
    };
    x.prototype.debugDrawObject = function (a, c, d) {
      var e = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      if (d && typeof d === "object") {
        d = d.Zx;
      }
      lf(e, a, c, d);
    };
    x.prototype.addAction = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      mf(c, a);
    };
    x.prototype.removeAction = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      nf(c, a);
    };
    x.prototype.getSolverInfo = function () {
      return k(of(this.Zx), v);
    };
    x.prototype.setInternalTickCallback = function (a, c, d) {
      var e = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      if (d && typeof d === "object") {
        d = d.Zx;
      }
      if (c === undefined) {
        pf(e, a);
      } else if (d === undefined) {
        qf(e, a, c);
      } else {
        rf(e, a, c, d);
      }
    };
    x.prototype.__destroy__ = function () {
      sf(this.Zx);
    };
    function UA() {
      throw "cannot construct a btConvexShape, no constructor in IDL";
    }
    UA.prototype = Object.create(n.prototype);
    UA.prototype.constructor = UA;
    UA.prototype.$x = UA;
    UA.ay = {};
    b.btConvexShape = UA;
    UA.prototype.setLocalScaling = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      tf(c, a);
    };
    UA.prototype.getLocalScaling = function () {
      return k(uf(this.Zx), p);
    };
    UA.prototype.calculateLocalInertia = function (a, c) {
      var d = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      vf(d, a, c);
    };
    UA.prototype.setMargin = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      wf(c, a);
    };
    UA.prototype.getMargin = function () {
      return xf(this.Zx);
    };
    UA.prototype.__destroy__ = function () {
      yf(this.Zx);
    };
    function FA() {
      throw "cannot construct a btDispatcher, no constructor in IDL";
    }
    FA.prototype = Object.create(g.prototype);
    FA.prototype.constructor = FA;
    FA.prototype.$x = FA;
    FA.ay = {};
    b.btDispatcher = FA;
    FA.prototype.getNumManifolds = function () {
      return zf(this.Zx);
    };
    FA.prototype.getManifoldByIndexInternal = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      return k(Af(c, a), VA);
    };
    FA.prototype.__destroy__ = function () {
      Bf(this.Zx);
    };
    function WA(a, c, d, e, f) {
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      if (d && typeof d === "object") {
        d = d.Zx;
      }
      if (e && typeof e === "object") {
        e = e.Zx;
      }
      if (f && typeof f === "object") {
        f = f.Zx;
      }
      this.Zx = e === undefined ? Cf(a, c, d) : f === undefined ? _emscripten_bind_btGeneric6DofConstraint_btGeneric6DofConstraint_4(a, c, d, e) : Df(a, c, d, e, f);
      h(WA)[this.Zx] = this;
    }
    WA.prototype = Object.create(KA.prototype);
    WA.prototype.constructor = WA;
    WA.prototype.$x = WA;
    WA.ay = {};
    b.btGeneric6DofConstraint = WA;
    WA.prototype.setLinearLowerLimit = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Ef(c, a);
    };
    WA.prototype.setLinearUpperLimit = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Ff(c, a);
    };
    WA.prototype.setAngularLowerLimit = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Gf(c, a);
    };
    WA.prototype.setAngularUpperLimit = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Hf(c, a);
    };
    WA.prototype.getFrameOffsetA = function () {
      return k(If(this.Zx), r);
    };
    WA.prototype.enableFeedback = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Jf(c, a);
    };
    WA.prototype.getBreakingImpulseThreshold = function () {
      return Kf(this.Zx);
    };
    WA.prototype.setBreakingImpulseThreshold = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Lf(c, a);
    };
    WA.prototype.getParam = function (a, c) {
      var d = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      return Mf(d, a, c);
    };
    WA.prototype.setParam = function (a, c, d) {
      var e = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      if (d && typeof d === "object") {
        d = d.Zx;
      }
      Nf(e, a, c, d);
    };
    WA.prototype.__destroy__ = function () {
      Of(this.Zx);
    };
    function XA() {
      throw "cannot construct a btStridingMeshInterface, no constructor in IDL";
    }
    XA.prototype = Object.create(g.prototype);
    XA.prototype.constructor = XA;
    XA.prototype.$x = XA;
    XA.ay = {};
    b.btStridingMeshInterface = XA;
    XA.prototype.setScaling = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Pf(c, a);
    };
    XA.prototype.__destroy__ = function () {
      Qf(this.Zx);
    };
    function YA() {
      throw "cannot construct a btMotionState, no constructor in IDL";
    }
    YA.prototype = Object.create(g.prototype);
    YA.prototype.constructor = YA;
    YA.prototype.$x = YA;
    YA.ay = {};
    b.btMotionState = YA;
    YA.prototype.getWorldTransform = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Rf(c, a);
    };
    YA.prototype.setWorldTransform = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Sf(c, a);
    };
    YA.prototype.__destroy__ = function () {
      Tf(this.Zx);
    };
    function y() {
      throw "cannot construct a ConvexResultCallback, no constructor in IDL";
    }
    y.prototype = Object.create(g.prototype);
    y.prototype.constructor = y;
    y.prototype.$x = y;
    y.ay = {};
    b.ConvexResultCallback = y;
    y.prototype.hasHit = function () {
      return !!Uf(this.Zx);
    };
    y.prototype.get_m_collisionFilterGroup = y.prototype.by = function () {
      return Vf(this.Zx);
    };
    y.prototype.set_m_collisionFilterGroup = y.prototype.dy = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Wf(c, a);
    };
    Object.defineProperty(y.prototype, "m_collisionFilterGroup", {
      get: y.prototype.by,
      set: y.prototype.dy
    });
    y.prototype.get_m_collisionFilterMask = y.prototype.cy = function () {
      return Xf(this.Zx);
    };
    y.prototype.set_m_collisionFilterMask = y.prototype.ey = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Yf(c, a);
    };
    Object.defineProperty(y.prototype, "m_collisionFilterMask", {
      get: y.prototype.cy,
      set: y.prototype.ey
    });
    y.prototype.get_m_closestHitFraction = y.prototype.fy = function () {
      return Zf(this.Zx);
    };
    y.prototype.set_m_closestHitFraction = y.prototype.gy = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      $f(c, a);
    };
    Object.defineProperty(y.prototype, "m_closestHitFraction", {
      get: y.prototype.fy,
      set: y.prototype.gy
    });
    y.prototype.__destroy__ = function () {
      ag(this.Zx);
    };
    function ZA() {
      throw "cannot construct a ContactResultCallback, no constructor in IDL";
    }
    ZA.prototype = Object.create(g.prototype);
    ZA.prototype.constructor = ZA;
    ZA.prototype.$x = ZA;
    ZA.ay = {};
    b.ContactResultCallback = ZA;
    ZA.prototype.addSingleResult = function (a, c, d, e, f, m, C) {
      var P = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      if (d && typeof d === "object") {
        d = d.Zx;
      }
      if (e && typeof e === "object") {
        e = e.Zx;
      }
      if (f && typeof f === "object") {
        f = f.Zx;
      }
      if (m && typeof m === "object") {
        m = m.Zx;
      }
      if (C && typeof C === "object") {
        C = C.Zx;
      }
      return bg(P, a, c, d, e, f, m, C);
    };
    ZA.prototype.__destroy__ = function () {
      cg(this.Zx);
    };
    function $A() {
      throw "cannot construct a btSoftBodySolver, no constructor in IDL";
    }
    $A.prototype = Object.create(g.prototype);
    $A.prototype.constructor = $A;
    $A.prototype.$x = $A;
    $A.ay = {};
    b.btSoftBodySolver = $A;
    $A.prototype.__destroy__ = function () {
      dg(this.Zx);
    };
    function z() {
      throw "cannot construct a RayResultCallback, no constructor in IDL";
    }
    z.prototype = Object.create(g.prototype);
    z.prototype.constructor = z;
    z.prototype.$x = z;
    z.ay = {};
    b.RayResultCallback = z;
    z.prototype.hasHit = function () {
      return !!eg(this.Zx);
    };
    z.prototype.get_m_collisionFilterGroup = z.prototype.by = function () {
      return fg(this.Zx);
    };
    z.prototype.set_m_collisionFilterGroup = z.prototype.dy = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      gg(c, a);
    };
    Object.defineProperty(z.prototype, "m_collisionFilterGroup", {
      get: z.prototype.by,
      set: z.prototype.dy
    });
    z.prototype.get_m_collisionFilterMask = z.prototype.cy = function () {
      return hg(this.Zx);
    };
    z.prototype.set_m_collisionFilterMask = z.prototype.ey = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      ig(c, a);
    };
    Object.defineProperty(z.prototype, "m_collisionFilterMask", {
      get: z.prototype.cy,
      set: z.prototype.ey
    });
    z.prototype.get_m_closestHitFraction = z.prototype.fy = function () {
      return jg(this.Zx);
    };
    z.prototype.set_m_closestHitFraction = z.prototype.gy = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      kg(c, a);
    };
    Object.defineProperty(z.prototype, "m_closestHitFraction", {
      get: z.prototype.fy,
      set: z.prototype.gy
    });
    z.prototype.get_m_collisionObject = z.prototype.hy = function () {
      return k(lg(this.Zx), q);
    };
    z.prototype.set_m_collisionObject = z.prototype.oy = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      mg(c, a);
    };
    Object.defineProperty(z.prototype, "m_collisionObject", {
      get: z.prototype.hy,
      set: z.prototype.oy
    });
    z.prototype.__destroy__ = function () {
      ng(this.Zx);
    };
    function aB() {
      throw "cannot construct a btMatrix3x3, no constructor in IDL";
    }
    aB.prototype = Object.create(g.prototype);
    aB.prototype.constructor = aB;
    aB.prototype.$x = aB;
    aB.ay = {};
    b.btMatrix3x3 = aB;
    aB.prototype.setEulerZYX = function (a, c, d) {
      var e = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      if (d && typeof d === "object") {
        d = d.Zx;
      }
      og(e, a, c, d);
    };
    aB.prototype.getRotation = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      pg(c, a);
    };
    aB.prototype.getRow = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      return k(qg(c, a), p);
    };
    aB.prototype.__destroy__ = function () {
      rg(this.Zx);
    };
    function bB() {
      throw "cannot construct a btScalarArray, no constructor in IDL";
    }
    bB.prototype = Object.create(g.prototype);
    bB.prototype.constructor = bB;
    bB.prototype.$x = bB;
    bB.ay = {};
    b.btScalarArray = bB;
    bB.prototype.size = bB.prototype.size = function () {
      return sg(this.Zx);
    };
    bB.prototype.at = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      return tg(c, a);
    };
    bB.prototype.__destroy__ = function () {
      ug(this.Zx);
    };
    function A() {
      throw "cannot construct a Material, no constructor in IDL";
    }
    A.prototype = Object.create(g.prototype);
    A.prototype.constructor = A;
    A.prototype.$x = A;
    A.ay = {};
    b.Material = A;
    A.prototype.get_m_kLST = A.prototype.jA = function () {
      return vg(this.Zx);
    };
    A.prototype.set_m_kLST = A.prototype.QC = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      wg(c, a);
    };
    Object.defineProperty(A.prototype, "m_kLST", {
      get: A.prototype.jA,
      set: A.prototype.QC
    });
    A.prototype.get_m_kAST = A.prototype.iA = function () {
      return xg(this.Zx);
    };
    A.prototype.set_m_kAST = A.prototype.PC = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      yg(c, a);
    };
    Object.defineProperty(A.prototype, "m_kAST", {
      get: A.prototype.iA,
      set: A.prototype.PC
    });
    A.prototype.get_m_kVST = A.prototype.kA = function () {
      return zg(this.Zx);
    };
    A.prototype.set_m_kVST = A.prototype.RC = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Ag(c, a);
    };
    Object.defineProperty(A.prototype, "m_kVST", {
      get: A.prototype.kA,
      set: A.prototype.RC
    });
    A.prototype.get_m_flags = A.prototype.Rz = function () {
      return Bg(this.Zx);
    };
    A.prototype.set_m_flags = A.prototype.xC = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Cg(c, a);
    };
    Object.defineProperty(A.prototype, "m_flags", {
      get: A.prototype.Rz,
      set: A.prototype.xC
    });
    A.prototype.__destroy__ = function () {
      Dg(this.Zx);
    };
    function l() {
      throw "cannot construct a btDispatcherInfo, no constructor in IDL";
    }
    l.prototype = Object.create(g.prototype);
    l.prototype.constructor = l;
    l.prototype.$x = l;
    l.ay = {};
    b.btDispatcherInfo = l;
    l.prototype.get_m_timeStep = l.prototype.XA = function () {
      return Eg(this.Zx);
    };
    l.prototype.set_m_timeStep = l.prototype.DD = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Fg(c, a);
    };
    Object.defineProperty(l.prototype, "m_timeStep", {
      get: l.prototype.XA,
      set: l.prototype.DD
    });
    l.prototype.get_m_stepCount = l.prototype.OA = function () {
      return Gg(this.Zx);
    };
    l.prototype.set_m_stepCount = l.prototype.uD = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Hg(c, a);
    };
    Object.defineProperty(l.prototype, "m_stepCount", {
      get: l.prototype.OA,
      set: l.prototype.uD
    });
    l.prototype.get_m_dispatchFunc = l.prototype.Jz = function () {
      return Ig(this.Zx);
    };
    l.prototype.set_m_dispatchFunc = l.prototype.pC = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Jg(c, a);
    };
    Object.defineProperty(l.prototype, "m_dispatchFunc", {
      get: l.prototype.Jz,
      set: l.prototype.pC
    });
    l.prototype.get_m_timeOfImpact = l.prototype.WA = function () {
      return Kg(this.Zx);
    };
    l.prototype.set_m_timeOfImpact = l.prototype.CD = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Lg(c, a);
    };
    Object.defineProperty(l.prototype, "m_timeOfImpact", {
      get: l.prototype.WA,
      set: l.prototype.CD
    });
    l.prototype.get_m_useContinuous = l.prototype.ZA = function () {
      return !!Mg(this.Zx);
    };
    l.prototype.set_m_useContinuous = l.prototype.FD = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Ng(c, a);
    };
    Object.defineProperty(l.prototype, "m_useContinuous", {
      get: l.prototype.ZA,
      set: l.prototype.FD
    });
    l.prototype.get_m_enableSatConvex = l.prototype.Nz = function () {
      return !!Og(this.Zx);
    };
    l.prototype.set_m_enableSatConvex = l.prototype.tC = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Pg(c, a);
    };
    Object.defineProperty(l.prototype, "m_enableSatConvex", {
      get: l.prototype.Nz,
      set: l.prototype.tC
    });
    l.prototype.get_m_enableSPU = l.prototype.Mz = function () {
      return !!Qg(this.Zx);
    };
    l.prototype.set_m_enableSPU = l.prototype.sC = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Rg(c, a);
    };
    Object.defineProperty(l.prototype, "m_enableSPU", {
      get: l.prototype.Mz,
      set: l.prototype.sC
    });
    l.prototype.get_m_useEpa = l.prototype.aB = function () {
      return !!Sg(this.Zx);
    };
    l.prototype.set_m_useEpa = l.prototype.HD = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Tg(c, a);
    };
    Object.defineProperty(l.prototype, "m_useEpa", {
      get: l.prototype.aB,
      set: l.prototype.HD
    });
    l.prototype.get_m_allowedCcdPenetration = l.prototype.lz = function () {
      return Ug(this.Zx);
    };
    l.prototype.set_m_allowedCcdPenetration = l.prototype.TB = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Vg(c, a);
    };
    Object.defineProperty(l.prototype, "m_allowedCcdPenetration", {
      get: l.prototype.lz,
      set: l.prototype.TB
    });
    l.prototype.get_m_useConvexConservativeDistanceUtil = l.prototype.$A = function () {
      return !!Wg(this.Zx);
    };
    l.prototype.set_m_useConvexConservativeDistanceUtil = l.prototype.GD = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Xg(c, a);
    };
    Object.defineProperty(l.prototype, "m_useConvexConservativeDistanceUtil", {
      get: l.prototype.$A,
      set: l.prototype.GD
    });
    l.prototype.get_m_convexConservativeDistanceThreshold = l.prototype.Ez = function () {
      return Yg(this.Zx);
    };
    l.prototype.set_m_convexConservativeDistanceThreshold = l.prototype.kC = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Zg(c, a);
    };
    Object.defineProperty(l.prototype, "m_convexConservativeDistanceThreshold", {
      get: l.prototype.Ez,
      set: l.prototype.kC
    });
    l.prototype.__destroy__ = function () {
      $g(this.Zx);
    };
    function B() {
      throw "cannot construct a btWheelInfoConstructionInfo, no constructor in IDL";
    }
    B.prototype = Object.create(g.prototype);
    B.prototype.constructor = B;
    B.prototype.$x = B;
    B.ay = {};
    b.btWheelInfoConstructionInfo = B;
    B.prototype.get_m_chassisConnectionCS = B.prototype.yz = function () {
      return k(ah(this.Zx), p);
    };
    B.prototype.set_m_chassisConnectionCS = B.prototype.eC = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      bh(c, a);
    };
    Object.defineProperty(B.prototype, "m_chassisConnectionCS", {
      get: B.prototype.yz,
      set: B.prototype.eC
    });
    B.prototype.get_m_wheelDirectionCS = B.prototype.Ay = function () {
      return k(ch(this.Zx), p);
    };
    B.prototype.set_m_wheelDirectionCS = B.prototype.Hy = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      dh(c, a);
    };
    Object.defineProperty(B.prototype, "m_wheelDirectionCS", {
      get: B.prototype.Ay,
      set: B.prototype.Hy
    });
    B.prototype.get_m_wheelAxleCS = B.prototype.zy = function () {
      return k(eh(this.Zx), p);
    };
    B.prototype.set_m_wheelAxleCS = B.prototype.Gy = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      fh(c, a);
    };
    Object.defineProperty(B.prototype, "m_wheelAxleCS", {
      get: B.prototype.zy,
      set: B.prototype.Gy
    });
    B.prototype.get_m_suspensionRestLength = B.prototype.TA = function () {
      return gh(this.Zx);
    };
    B.prototype.set_m_suspensionRestLength = B.prototype.zD = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      hh(c, a);
    };
    Object.defineProperty(B.prototype, "m_suspensionRestLength", {
      get: B.prototype.TA,
      set: B.prototype.zD
    });
    B.prototype.get_m_maxSuspensionTravelCm = B.prototype.my = function () {
      return ih(this.Zx);
    };
    B.prototype.set_m_maxSuspensionTravelCm = B.prototype.ty = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      jh(c, a);
    };
    Object.defineProperty(B.prototype, "m_maxSuspensionTravelCm", {
      get: B.prototype.my,
      set: B.prototype.ty
    });
    B.prototype.get_m_wheelRadius = B.prototype.gB = function () {
      return kh(this.Zx);
    };
    B.prototype.set_m_wheelRadius = B.prototype.ND = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      lh(c, a);
    };
    Object.defineProperty(B.prototype, "m_wheelRadius", {
      get: B.prototype.gB,
      set: B.prototype.ND
    });
    B.prototype.get_m_suspensionStiffness = B.prototype.ny = function () {
      return mh(this.Zx);
    };
    B.prototype.set_m_suspensionStiffness = B.prototype.uy = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      nh(c, a);
    };
    Object.defineProperty(B.prototype, "m_suspensionStiffness", {
      get: B.prototype.ny,
      set: B.prototype.uy
    });
    B.prototype.get_m_wheelsDampingCompression = B.prototype.By = function () {
      return oh(this.Zx);
    };
    B.prototype.set_m_wheelsDampingCompression = B.prototype.Iy = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      ph(c, a);
    };
    Object.defineProperty(B.prototype, "m_wheelsDampingCompression", {
      get: B.prototype.By,
      set: B.prototype.Iy
    });
    B.prototype.get_m_wheelsDampingRelaxation = B.prototype.Cy = function () {
      return qh(this.Zx);
    };
    B.prototype.set_m_wheelsDampingRelaxation = B.prototype.Jy = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      rh(c, a);
    };
    Object.defineProperty(B.prototype, "m_wheelsDampingRelaxation", {
      get: B.prototype.Cy,
      set: B.prototype.Jy
    });
    B.prototype.get_m_frictionSlip = B.prototype.iy = function () {
      return sh(this.Zx);
    };
    B.prototype.set_m_frictionSlip = B.prototype.py = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      th(c, a);
    };
    Object.defineProperty(B.prototype, "m_frictionSlip", {
      get: B.prototype.iy,
      set: B.prototype.py
    });
    B.prototype.get_m_maxSuspensionForce = B.prototype.ly = function () {
      return uh(this.Zx);
    };
    B.prototype.set_m_maxSuspensionForce = B.prototype.sy = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      vh(c, a);
    };
    Object.defineProperty(B.prototype, "m_maxSuspensionForce", {
      get: B.prototype.ly,
      set: B.prototype.sy
    });
    B.prototype.get_m_bIsFrontWheel = B.prototype.wy = function () {
      return !!wh(this.Zx);
    };
    B.prototype.set_m_bIsFrontWheel = B.prototype.Dy = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      xh(c, a);
    };
    Object.defineProperty(B.prototype, "m_bIsFrontWheel", {
      get: B.prototype.wy,
      set: B.prototype.Dy
    });
    B.prototype.__destroy__ = function () {
      yh(this.Zx);
    };
    function cB(a, c) {
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      this.Zx = c === undefined ? zh(a) : Ah(a, c);
      h(cB)[this.Zx] = this;
    }
    cB.prototype = Object.create(UA.prototype);
    cB.prototype.constructor = cB;
    cB.prototype.$x = cB;
    cB.ay = {};
    b.btConvexTriangleMeshShape = cB;
    cB.prototype.setLocalScaling = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Bh(c, a);
    };
    cB.prototype.getLocalScaling = function () {
      return k(Ch(this.Zx), p);
    };
    cB.prototype.calculateLocalInertia = function (a, c) {
      var d = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      Dh(d, a, c);
    };
    cB.prototype.setMargin = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Eh(c, a);
    };
    cB.prototype.getMargin = function () {
      return Fh(this.Zx);
    };
    cB.prototype.__destroy__ = function () {
      Gh(this.Zx);
    };
    function HA() {
      throw "cannot construct a btBroadphaseInterface, no constructor in IDL";
    }
    HA.prototype = Object.create(g.prototype);
    HA.prototype.constructor = HA;
    HA.prototype.$x = HA;
    HA.ay = {};
    b.btBroadphaseInterface = HA;
    HA.prototype.getOverlappingPairCache = function () {
      return k(Hh(this.Zx), GA);
    };
    HA.prototype.__destroy__ = function () {
      Ih(this.Zx);
    };
    function D(a, c, d, e) {
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      if (d && typeof d === "object") {
        d = d.Zx;
      }
      if (e && typeof e === "object") {
        e = e.Zx;
      }
      this.Zx = e === undefined ? Jh(a, c, d) : Kh(a, c, d, e);
      h(D)[this.Zx] = this;
    }
    D.prototype = Object.create(g.prototype);
    D.prototype.constructor = D;
    D.prototype.$x = D;
    D.ay = {};
    b.btRigidBodyConstructionInfo = D;
    D.prototype.get_m_linearDamping = D.prototype.lA = function () {
      return Lh(this.Zx);
    };
    D.prototype.set_m_linearDamping = D.prototype.SC = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Mh(c, a);
    };
    Object.defineProperty(D.prototype, "m_linearDamping", {
      get: D.prototype.lA,
      set: D.prototype.SC
    });
    D.prototype.get_m_angularDamping = D.prototype.nz = function () {
      return Nh(this.Zx);
    };
    D.prototype.set_m_angularDamping = D.prototype.VB = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Oh(c, a);
    };
    Object.defineProperty(D.prototype, "m_angularDamping", {
      get: D.prototype.nz,
      set: D.prototype.VB
    });
    D.prototype.get_m_friction = D.prototype.Sz = function () {
      return Ph(this.Zx);
    };
    D.prototype.set_m_friction = D.prototype.yC = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Qh(c, a);
    };
    Object.defineProperty(D.prototype, "m_friction", {
      get: D.prototype.Sz,
      set: D.prototype.yC
    });
    D.prototype.get_m_rollingFriction = D.prototype.GA = function () {
      return Rh(this.Zx);
    };
    D.prototype.set_m_rollingFriction = D.prototype.mD = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Sh(c, a);
    };
    Object.defineProperty(D.prototype, "m_rollingFriction", {
      get: D.prototype.GA,
      set: D.prototype.mD
    });
    D.prototype.get_m_restitution = D.prototype.EA = function () {
      return Th(this.Zx);
    };
    D.prototype.set_m_restitution = D.prototype.kD = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Uh(c, a);
    };
    Object.defineProperty(D.prototype, "m_restitution", {
      get: D.prototype.EA,
      set: D.prototype.kD
    });
    D.prototype.get_m_linearSleepingThreshold = D.prototype.mA = function () {
      return Vh(this.Zx);
    };
    D.prototype.set_m_linearSleepingThreshold = D.prototype.TC = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Wh(c, a);
    };
    Object.defineProperty(D.prototype, "m_linearSleepingThreshold", {
      get: D.prototype.mA,
      set: D.prototype.TC
    });
    D.prototype.get_m_angularSleepingThreshold = D.prototype.oz = function () {
      return Xh(this.Zx);
    };
    D.prototype.set_m_angularSleepingThreshold = D.prototype.WB = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Yh(c, a);
    };
    Object.defineProperty(D.prototype, "m_angularSleepingThreshold", {
      get: D.prototype.oz,
      set: D.prototype.WB
    });
    D.prototype.get_m_additionalDamping = D.prototype.iz = function () {
      return !!Zh(this.Zx);
    };
    D.prototype.set_m_additionalDamping = D.prototype.QB = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      $h(c, a);
    };
    Object.defineProperty(D.prototype, "m_additionalDamping", {
      get: D.prototype.iz,
      set: D.prototype.QB
    });
    D.prototype.get_m_additionalDampingFactor = D.prototype.jz = function () {
      return ai(this.Zx);
    };
    D.prototype.set_m_additionalDampingFactor = D.prototype.RB = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      bi(c, a);
    };
    Object.defineProperty(D.prototype, "m_additionalDampingFactor", {
      get: D.prototype.jz,
      set: D.prototype.RB
    });
    D.prototype.get_m_additionalLinearDampingThresholdSqr = D.prototype.kz = function () {
      return ci(this.Zx);
    };
    D.prototype.set_m_additionalLinearDampingThresholdSqr = D.prototype.SB = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      di(c, a);
    };
    Object.defineProperty(D.prototype, "m_additionalLinearDampingThresholdSqr", {
      get: D.prototype.kz,
      set: D.prototype.SB
    });
    D.prototype.get_m_additionalAngularDampingThresholdSqr = D.prototype.hz = function () {
      return ei(this.Zx);
    };
    D.prototype.set_m_additionalAngularDampingThresholdSqr = D.prototype.PB = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      fi(c, a);
    };
    Object.defineProperty(D.prototype, "m_additionalAngularDampingThresholdSqr", {
      get: D.prototype.hz,
      set: D.prototype.PB
    });
    D.prototype.get_m_additionalAngularDampingFactor = D.prototype.gz = function () {
      return gi(this.Zx);
    };
    D.prototype.set_m_additionalAngularDampingFactor = D.prototype.OB = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      hi(c, a);
    };
    Object.defineProperty(D.prototype, "m_additionalAngularDampingFactor", {
      get: D.prototype.gz,
      set: D.prototype.OB
    });
    D.prototype.__destroy__ = function () {
      ii(this.Zx);
    };
    function dB() {
      throw "cannot construct a btCollisionConfiguration, no constructor in IDL";
    }
    dB.prototype = Object.create(g.prototype);
    dB.prototype.constructor = dB;
    dB.prototype.$x = dB;
    dB.ay = {};
    b.btCollisionConfiguration = dB;
    dB.prototype.__destroy__ = function () {
      ji(this.Zx);
    };
    function VA() {
      this.Zx = ki();
      h(VA)[this.Zx] = this;
    }
    VA.prototype = Object.create(g.prototype);
    VA.prototype.constructor = VA;
    VA.prototype.$x = VA;
    VA.ay = {};
    b.btPersistentManifold = VA;
    VA.prototype.getBody0 = function () {
      return k(li(this.Zx), q);
    };
    VA.prototype.getBody1 = function () {
      return k(mi(this.Zx), q);
    };
    VA.prototype.getNumContacts = function () {
      return ni(this.Zx);
    };
    VA.prototype.getContactPoint = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      return k(oi(c, a), E);
    };
    VA.prototype.__destroy__ = function () {
      pi(this.Zx);
    };
    function eB(a) {
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      this.Zx = a === undefined ? qi() : ri(a);
      h(eB)[this.Zx] = this;
    }
    eB.prototype = Object.create(n.prototype);
    eB.prototype.constructor = eB;
    eB.prototype.$x = eB;
    eB.ay = {};
    b.btCompoundShape = eB;
    eB.prototype.addChildShape = function (a, c) {
      var d = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      si(d, a, c);
    };
    eB.prototype.removeChildShape = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      ti(c, a);
    };
    eB.prototype.removeChildShapeByIndex = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      ui(c, a);
    };
    eB.prototype.getNumChildShapes = function () {
      return vi(this.Zx);
    };
    eB.prototype.getChildShape = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      return k(wi(c, a), n);
    };
    eB.prototype.updateChildTransform = function (a, c, d) {
      var e = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      if (d && typeof d === "object") {
        d = d.Zx;
      }
      if (d === undefined) {
        xi(e, a, c);
      } else {
        yi(e, a, c, d);
      }
    };
    eB.prototype.setMargin = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      zi(c, a);
    };
    eB.prototype.getMargin = function () {
      return Ai(this.Zx);
    };
    eB.prototype.setLocalScaling = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Bi(c, a);
    };
    eB.prototype.getLocalScaling = function () {
      return k(Ci(this.Zx), p);
    };
    eB.prototype.calculateLocalInertia = function (a, c) {
      var d = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      Di(d, a, c);
    };
    eB.prototype.__destroy__ = function () {
      Ei(this.Zx);
    };
    function F(a, c) {
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      this.Zx = Fi(a, c);
      h(F)[this.Zx] = this;
    }
    F.prototype = Object.create(y.prototype);
    F.prototype.constructor = F;
    F.prototype.$x = F;
    F.ay = {};
    b.ClosestConvexResultCallback = F;
    F.prototype.hasHit = function () {
      return !!Gi(this.Zx);
    };
    F.prototype.get_m_convexFromWorld = F.prototype.Fz = function () {
      return k(Hi(this.Zx), p);
    };
    F.prototype.set_m_convexFromWorld = F.prototype.lC = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Ii(c, a);
    };
    Object.defineProperty(F.prototype, "m_convexFromWorld", {
      get: F.prototype.Fz,
      set: F.prototype.lC
    });
    F.prototype.get_m_convexToWorld = F.prototype.Gz = function () {
      return k(Ji(this.Zx), p);
    };
    F.prototype.set_m_convexToWorld = F.prototype.mC = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Ki(c, a);
    };
    Object.defineProperty(F.prototype, "m_convexToWorld", {
      get: F.prototype.Gz,
      set: F.prototype.mC
    });
    F.prototype.get_m_hitNormalWorld = F.prototype.jy = function () {
      return k(Li(this.Zx), p);
    };
    F.prototype.set_m_hitNormalWorld = F.prototype.qy = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Mi(c, a);
    };
    Object.defineProperty(F.prototype, "m_hitNormalWorld", {
      get: F.prototype.jy,
      set: F.prototype.qy
    });
    F.prototype.get_m_hitPointWorld = F.prototype.ky = function () {
      return k(Ni(this.Zx), p);
    };
    F.prototype.set_m_hitPointWorld = F.prototype.ry = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Oi(c, a);
    };
    Object.defineProperty(F.prototype, "m_hitPointWorld", {
      get: F.prototype.ky,
      set: F.prototype.ry
    });
    F.prototype.get_m_collisionFilterGroup = F.prototype.by = function () {
      return Pi(this.Zx);
    };
    F.prototype.set_m_collisionFilterGroup = F.prototype.dy = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Qi(c, a);
    };
    Object.defineProperty(F.prototype, "m_collisionFilterGroup", {
      get: F.prototype.by,
      set: F.prototype.dy
    });
    F.prototype.get_m_collisionFilterMask = F.prototype.cy = function () {
      return Ri(this.Zx);
    };
    F.prototype.set_m_collisionFilterMask = F.prototype.ey = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Si(c, a);
    };
    Object.defineProperty(F.prototype, "m_collisionFilterMask", {
      get: F.prototype.cy,
      set: F.prototype.ey
    });
    F.prototype.get_m_closestHitFraction = F.prototype.fy = function () {
      return Ti(this.Zx);
    };
    F.prototype.set_m_closestHitFraction = F.prototype.gy = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Ui(c, a);
    };
    Object.defineProperty(F.prototype, "m_closestHitFraction", {
      get: F.prototype.fy,
      set: F.prototype.gy
    });
    F.prototype.__destroy__ = function () {
      Vi(this.Zx);
    };
    function G(a, c) {
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      this.Zx = Wi(a, c);
      h(G)[this.Zx] = this;
    }
    G.prototype = Object.create(z.prototype);
    G.prototype.constructor = G;
    G.prototype.$x = G;
    G.ay = {};
    b.AllHitsRayResultCallback = G;
    G.prototype.hasHit = function () {
      return !!Xi(this.Zx);
    };
    G.prototype.get_m_collisionObjects = G.prototype.Bz = function () {
      return k(Yi(this.Zx), fB);
    };
    G.prototype.set_m_collisionObjects = G.prototype.hC = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Zi(c, a);
    };
    Object.defineProperty(G.prototype, "m_collisionObjects", {
      get: G.prototype.Bz,
      set: G.prototype.hC
    });
    G.prototype.get_m_rayFromWorld = G.prototype.xy = function () {
      return k($i(this.Zx), p);
    };
    G.prototype.set_m_rayFromWorld = G.prototype.Ey = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      aj(c, a);
    };
    Object.defineProperty(G.prototype, "m_rayFromWorld", {
      get: G.prototype.xy,
      set: G.prototype.Ey
    });
    G.prototype.get_m_rayToWorld = G.prototype.yy = function () {
      return k(bj(this.Zx), p);
    };
    G.prototype.set_m_rayToWorld = G.prototype.Fy = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      cj(c, a);
    };
    Object.defineProperty(G.prototype, "m_rayToWorld", {
      get: G.prototype.yy,
      set: G.prototype.Fy
    });
    G.prototype.get_m_hitNormalWorld = G.prototype.jy = function () {
      return k(dj(this.Zx), gB);
    };
    G.prototype.set_m_hitNormalWorld = G.prototype.qy = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      ej(c, a);
    };
    Object.defineProperty(G.prototype, "m_hitNormalWorld", {
      get: G.prototype.jy,
      set: G.prototype.qy
    });
    G.prototype.get_m_hitPointWorld = G.prototype.ky = function () {
      return k(fj(this.Zx), gB);
    };
    G.prototype.set_m_hitPointWorld = G.prototype.ry = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      gj(c, a);
    };
    Object.defineProperty(G.prototype, "m_hitPointWorld", {
      get: G.prototype.ky,
      set: G.prototype.ry
    });
    G.prototype.get_m_hitFractions = G.prototype.Zz = function () {
      return k(hj(this.Zx), bB);
    };
    G.prototype.set_m_hitFractions = G.prototype.FC = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      ij(c, a);
    };
    Object.defineProperty(G.prototype, "m_hitFractions", {
      get: G.prototype.Zz,
      set: G.prototype.FC
    });
    G.prototype.get_m_collisionFilterGroup = G.prototype.by = function () {
      return jj(this.Zx);
    };
    G.prototype.set_m_collisionFilterGroup = G.prototype.dy = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      kj(c, a);
    };
    Object.defineProperty(G.prototype, "m_collisionFilterGroup", {
      get: G.prototype.by,
      set: G.prototype.dy
    });
    G.prototype.get_m_collisionFilterMask = G.prototype.cy = function () {
      return lj(this.Zx);
    };
    G.prototype.set_m_collisionFilterMask = G.prototype.ey = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      mj(c, a);
    };
    Object.defineProperty(G.prototype, "m_collisionFilterMask", {
      get: G.prototype.cy,
      set: G.prototype.ey
    });
    G.prototype.get_m_closestHitFraction = G.prototype.fy = function () {
      return nj(this.Zx);
    };
    G.prototype.set_m_closestHitFraction = G.prototype.gy = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      oj(c, a);
    };
    Object.defineProperty(G.prototype, "m_closestHitFraction", {
      get: G.prototype.fy,
      set: G.prototype.gy
    });
    G.prototype.get_m_collisionObject = G.prototype.hy = function () {
      return k(pj(this.Zx), q);
    };
    G.prototype.set_m_collisionObject = G.prototype.oy = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      qj(c, a);
    };
    Object.defineProperty(G.prototype, "m_collisionObject", {
      get: G.prototype.hy,
      set: G.prototype.oy
    });
    G.prototype.__destroy__ = function () {
      rj(this.Zx);
    };
    function hB() {
      throw "cannot construct a tMaterialArray, no constructor in IDL";
    }
    hB.prototype = Object.create(g.prototype);
    hB.prototype.constructor = hB;
    hB.prototype.$x = hB;
    hB.ay = {};
    b.tMaterialArray = hB;
    hB.prototype.size = hB.prototype.size = function () {
      return sj(this.Zx);
    };
    hB.prototype.at = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      return k(tj(c, a), A);
    };
    hB.prototype.__destroy__ = function () {
      uj(this.Zx);
    };
    function iB(a) {
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      this.Zx = vj(a);
      h(iB)[this.Zx] = this;
    }
    iB.prototype = Object.create(RA.prototype);
    iB.prototype.constructor = iB;
    iB.prototype.$x = iB;
    iB.ay = {};
    b.btDefaultVehicleRaycaster = iB;
    iB.prototype.castRay = function (a, c, d) {
      var e = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      if (d && typeof d === "object") {
        d = d.Zx;
      }
      wj(e, a, c, d);
    };
    iB.prototype.__destroy__ = function () {
      xj(this.Zx);
    };
    function jB() {
      this.Zx = yj();
      h(jB)[this.Zx] = this;
    }
    jB.prototype = Object.create(LA.prototype);
    jB.prototype.constructor = jB;
    jB.prototype.$x = jB;
    jB.ay = {};
    b.btEmptyShape = jB;
    jB.prototype.setLocalScaling = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      zj(c, a);
    };
    jB.prototype.getLocalScaling = function () {
      return k(Aj(this.Zx), p);
    };
    jB.prototype.calculateLocalInertia = function (a, c) {
      var d = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      Bj(d, a, c);
    };
    jB.prototype.__destroy__ = function () {
      Cj(this.Zx);
    };
    function H() {
      this.Zx = Dj();
      h(H)[this.Zx] = this;
    }
    H.prototype = Object.create(g.prototype);
    H.prototype.constructor = H;
    H.prototype.$x = H;
    H.ay = {};
    b.btConstraintSetting = H;
    H.prototype.get_m_tau = H.prototype.VA = function () {
      return Ej(this.Zx);
    };
    H.prototype.set_m_tau = H.prototype.BD = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Fj(c, a);
    };
    Object.defineProperty(H.prototype, "m_tau", {
      get: H.prototype.VA,
      set: H.prototype.BD
    });
    H.prototype.get_m_damping = H.prototype.Hz = function () {
      return Gj(this.Zx);
    };
    H.prototype.set_m_damping = H.prototype.nC = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Hj(c, a);
    };
    Object.defineProperty(H.prototype, "m_damping", {
      get: H.prototype.Hz,
      set: H.prototype.nC
    });
    H.prototype.get_m_impulseClamp = H.prototype.eA = function () {
      return Ij(this.Zx);
    };
    H.prototype.set_m_impulseClamp = H.prototype.LC = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Jj(c, a);
    };
    Object.defineProperty(H.prototype, "m_impulseClamp", {
      get: H.prototype.eA,
      set: H.prototype.LC
    });
    H.prototype.__destroy__ = function () {
      Kj(this.Zx);
    };
    function kB() {
      throw "cannot construct a LocalShapeInfo, no constructor in IDL";
    }
    kB.prototype = Object.create(g.prototype);
    kB.prototype.constructor = kB;
    kB.prototype.$x = kB;
    kB.ay = {};
    b.LocalShapeInfo = kB;
    kB.prototype.get_m_shapePart = kB.prototype.JA = function () {
      return Lj(this.Zx);
    };
    kB.prototype.set_m_shapePart = kB.prototype.pD = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Mj(c, a);
    };
    Object.defineProperty(kB.prototype, "m_shapePart", {
      get: kB.prototype.JA,
      set: kB.prototype.pD
    });
    kB.prototype.get_m_triangleIndex = kB.prototype.YA = function () {
      return Nj(this.Zx);
    };
    kB.prototype.set_m_triangleIndex = kB.prototype.ED = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Oj(c, a);
    };
    Object.defineProperty(kB.prototype, "m_triangleIndex", {
      get: kB.prototype.YA,
      set: kB.prototype.ED
    });
    kB.prototype.__destroy__ = function () {
      Pj(this.Zx);
    };
    function I(a) {
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      this.Zx = Qj(a);
      h(I)[this.Zx] = this;
    }
    I.prototype = Object.create(q.prototype);
    I.prototype.constructor = I;
    I.prototype.$x = I;
    I.ay = {};
    b.btRigidBody = I;
    I.prototype.getCenterOfMassTransform = function () {
      return k(Rj(this.Zx), r);
    };
    I.prototype.setCenterOfMassTransform = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Sj(c, a);
    };
    I.prototype.setSleepingThresholds = function (a, c) {
      var d = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      Tj(d, a, c);
    };
    I.prototype.getLinearDamping = function () {
      return Uj(this.Zx);
    };
    I.prototype.getAngularDamping = function () {
      return Vj(this.Zx);
    };
    I.prototype.setDamping = function (a, c) {
      var d = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      Wj(d, a, c);
    };
    I.prototype.setMassProps = function (a, c) {
      var d = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      Xj(d, a, c);
    };
    I.prototype.getLinearFactor = function () {
      return k(Yj(this.Zx), p);
    };
    I.prototype.setLinearFactor = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Zj(c, a);
    };
    I.prototype.applyTorque = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      ak(c, a);
    };
    I.prototype.applyLocalTorque = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      bk(c, a);
    };
    I.prototype.applyForce = function (a, c) {
      var d = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      ck(d, a, c);
    };
    I.prototype.applyCentralForce = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      dk(c, a);
    };
    I.prototype.applyCentralLocalForce = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      ek(c, a);
    };
    I.prototype.applyTorqueImpulse = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      fk(c, a);
    };
    I.prototype.applyImpulse = function (a, c) {
      var d = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      gk(d, a, c);
    };
    I.prototype.applyCentralImpulse = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      hk(c, a);
    };
    I.prototype.updateInertiaTensor = function () {
      ik(this.Zx);
    };
    I.prototype.getLinearVelocity = function () {
      return k(jk(this.Zx), p);
    };
    I.prototype.getAngularVelocity = function () {
      return k(kk(this.Zx), p);
    };
    I.prototype.setLinearVelocity = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      lk(c, a);
    };
    I.prototype.setAngularVelocity = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      mk(c, a);
    };
    I.prototype.getMotionState = function () {
      return k(nk(this.Zx), YA);
    };
    I.prototype.setMotionState = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      ok(c, a);
    };
    I.prototype.getAngularFactor = function () {
      return k(pk(this.Zx), p);
    };
    I.prototype.setAngularFactor = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      qk(c, a);
    };
    I.prototype.upcast = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      return k(rk(c, a), I);
    };
    I.prototype.getAabb = function (a, c) {
      var d = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      sk(d, a, c);
    };
    I.prototype.applyGravity = function () {
      tk(this.Zx);
    };
    I.prototype.getGravity = function () {
      return k(uk(this.Zx), p);
    };
    I.prototype.setGravity = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      vk(c, a);
    };
    I.prototype.getBroadphaseProxy = function () {
      return k(wk(this.Zx), t);
    };
    I.prototype.clearForces = function () {
      xk(this.Zx);
    };
    I.prototype.setAnisotropicFriction = function (a, c) {
      var d = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      yk(d, a, c);
    };
    I.prototype.getCollisionShape = function () {
      return k(zk(this.Zx), n);
    };
    I.prototype.setContactProcessingThreshold = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Ak(c, a);
    };
    I.prototype.setActivationState = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Bk(c, a);
    };
    I.prototype.forceActivationState = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Ck(c, a);
    };
    I.prototype.activate = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (a === undefined) {
        Dk(c);
      } else {
        Ek(c, a);
      }
    };
    I.prototype.isActive = function () {
      return !!Fk(this.Zx);
    };
    I.prototype.isKinematicObject = function () {
      return !!Gk(this.Zx);
    };
    I.prototype.isStaticObject = function () {
      return !!Hk(this.Zx);
    };
    I.prototype.isStaticOrKinematicObject = function () {
      return !!Ik(this.Zx);
    };
    I.prototype.getRestitution = function () {
      return Jk(this.Zx);
    };
    I.prototype.getFriction = function () {
      return Kk(this.Zx);
    };
    I.prototype.getRollingFriction = function () {
      return Lk(this.Zx);
    };
    I.prototype.setRestitution = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Mk(c, a);
    };
    I.prototype.setFriction = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Nk(c, a);
    };
    I.prototype.setRollingFriction = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Ok(c, a);
    };
    I.prototype.getWorldTransform = function () {
      return k(Pk(this.Zx), r);
    };
    I.prototype.getCollisionFlags = function () {
      return Qk(this.Zx);
    };
    I.prototype.setCollisionFlags = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Rk(c, a);
    };
    I.prototype.setWorldTransform = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Sk(c, a);
    };
    I.prototype.setCollisionShape = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Tk(c, a);
    };
    I.prototype.setCcdMotionThreshold = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Uk(c, a);
    };
    I.prototype.setCcdSweptSphereRadius = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Vk(c, a);
    };
    I.prototype.getUserIndex = function () {
      return Wk(this.Zx);
    };
    I.prototype.setUserIndex = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Xk(c, a);
    };
    I.prototype.getUserPointer = function () {
      return k(Yk(this.Zx), JA);
    };
    I.prototype.setUserPointer = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Zk(c, a);
    };
    I.prototype.getBroadphaseHandle = function () {
      return k($k(this.Zx), t);
    };
    I.prototype.__destroy__ = function () {
      al(this.Zx);
    };
    function lB() {
      throw "cannot construct a btIndexedMeshArray, no constructor in IDL";
    }
    lB.prototype = Object.create(g.prototype);
    lB.prototype.constructor = lB;
    lB.prototype.$x = lB;
    lB.ay = {};
    b.btIndexedMeshArray = lB;
    lB.prototype.size = lB.prototype.size = function () {
      return bl(this.Zx);
    };
    lB.prototype.at = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      return k(cl(c, a), mB);
    };
    lB.prototype.__destroy__ = function () {
      dl(this.Zx);
    };
    function nB() {
      this.Zx = el();
      h(nB)[this.Zx] = this;
    }
    nB.prototype = Object.create(g.prototype);
    nB.prototype.constructor = nB;
    nB.prototype.$x = nB;
    nB.ay = {};
    b.btDbvtBroadphase = nB;
    nB.prototype.__destroy__ = function () {
      fl(this.Zx);
    };
    function oB(a, c, d, e, f, m, C, P, ia) {
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      if (d && typeof d === "object") {
        d = d.Zx;
      }
      if (e && typeof e === "object") {
        e = e.Zx;
      }
      if (f && typeof f === "object") {
        f = f.Zx;
      }
      if (m && typeof m === "object") {
        m = m.Zx;
      }
      if (C && typeof C === "object") {
        C = C.Zx;
      }
      if (P && typeof P === "object") {
        P = P.Zx;
      }
      if (ia && typeof ia === "object") {
        ia = ia.Zx;
      }
      this.Zx = gl(a, c, d, e, f, m, C, P, ia);
      h(oB)[this.Zx] = this;
    }
    oB.prototype = Object.create(LA.prototype);
    oB.prototype.constructor = oB;
    oB.prototype.$x = oB;
    oB.ay = {};
    b.btHeightfieldTerrainShape = oB;
    oB.prototype.setMargin = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      hl(c, a);
    };
    oB.prototype.getMargin = function () {
      return il(this.Zx);
    };
    oB.prototype.setLocalScaling = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      jl(c, a);
    };
    oB.prototype.getLocalScaling = function () {
      return k(kl(this.Zx), p);
    };
    oB.prototype.calculateLocalInertia = function (a, c) {
      var d = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      ll(d, a, c);
    };
    oB.prototype.__destroy__ = function () {
      ml(this.Zx);
    };
    function pB() {
      this.Zx = nl();
      h(pB)[this.Zx] = this;
    }
    pB.prototype = Object.create($A.prototype);
    pB.prototype.constructor = pB;
    pB.prototype.$x = pB;
    pB.ay = {};
    b.btDefaultSoftBodySolver = pB;
    pB.prototype.__destroy__ = function () {
      ol(this.Zx);
    };
    function qB(a) {
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      this.Zx = pl(a);
      h(qB)[this.Zx] = this;
    }
    qB.prototype = Object.create(FA.prototype);
    qB.prototype.constructor = qB;
    qB.prototype.$x = qB;
    qB.ay = {};
    b.btCollisionDispatcher = qB;
    qB.prototype.getNumManifolds = function () {
      return ql(this.Zx);
    };
    qB.prototype.getManifoldByIndexInternal = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      return k(rl(c, a), VA);
    };
    qB.prototype.__destroy__ = function () {
      sl(this.Zx);
    };
    function rB(a, c, d, e, f) {
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      if (d && typeof d === "object") {
        d = d.Zx;
      }
      if (e && typeof e === "object") {
        e = e.Zx;
      }
      if (f && typeof f === "object") {
        f = f.Zx;
      }
      this.Zx = d === undefined ? tl(a, c) : e === undefined ? ul(a, c, d) : f === undefined ? vl(a, c, d, e) : wl(a, c, d, e, f);
      h(rB)[this.Zx] = this;
    }
    rB.prototype = Object.create(g.prototype);
    rB.prototype.constructor = rB;
    rB.prototype.$x = rB;
    rB.ay = {};
    b.btAxisSweep3 = rB;
    rB.prototype.__destroy__ = function () {
      xl(this.Zx);
    };
    function JA() {
      throw "cannot construct a VoidPtr, no constructor in IDL";
    }
    JA.prototype = Object.create(g.prototype);
    JA.prototype.constructor = JA;
    JA.prototype.$x = JA;
    JA.ay = {};
    b.VoidPtr = JA;
    JA.prototype.__destroy__ = function () {
      yl(this.Zx);
    };
    function J() {
      this.Zx = zl();
      h(J)[this.Zx] = this;
    }
    J.prototype = Object.create(g.prototype);
    J.prototype.constructor = J;
    J.prototype.$x = J;
    J.ay = {};
    b.btSoftBodyWorldInfo = J;
    J.prototype.get_air_density = J.prototype.Ly = function () {
      return Al(this.Zx);
    };
    J.prototype.set_air_density = J.prototype.sB = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Bl(c, a);
    };
    Object.defineProperty(J.prototype, "air_density", {
      get: J.prototype.Ly,
      set: J.prototype.sB
    });
    J.prototype.get_water_density = J.prototype.pB = function () {
      return Cl(this.Zx);
    };
    J.prototype.set_water_density = J.prototype.WD = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Dl(c, a);
    };
    Object.defineProperty(J.prototype, "water_density", {
      get: J.prototype.pB,
      set: J.prototype.WD
    });
    J.prototype.get_water_offset = J.prototype.rB = function () {
      return El(this.Zx);
    };
    J.prototype.set_water_offset = J.prototype.YD = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Fl(c, a);
    };
    Object.defineProperty(J.prototype, "water_offset", {
      get: J.prototype.rB,
      set: J.prototype.YD
    });
    J.prototype.get_m_maxDisplacement = J.prototype.sA = function () {
      return Gl(this.Zx);
    };
    J.prototype.set_m_maxDisplacement = J.prototype.ZC = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Hl(c, a);
    };
    Object.defineProperty(J.prototype, "m_maxDisplacement", {
      get: J.prototype.sA,
      set: J.prototype.ZC
    });
    J.prototype.get_water_normal = J.prototype.qB = function () {
      return k(Il(this.Zx), p);
    };
    J.prototype.set_water_normal = J.prototype.XD = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Jl(c, a);
    };
    Object.defineProperty(J.prototype, "water_normal", {
      get: J.prototype.qB,
      set: J.prototype.XD
    });
    J.prototype.get_m_broadphase = J.prototype.sz = function () {
      return k(Kl(this.Zx), HA);
    };
    J.prototype.set_m_broadphase = J.prototype.$B = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Ll(c, a);
    };
    Object.defineProperty(J.prototype, "m_broadphase", {
      get: J.prototype.sz,
      set: J.prototype.$B
    });
    J.prototype.get_m_dispatcher = J.prototype.Kz = function () {
      return k(Ml(this.Zx), FA);
    };
    J.prototype.set_m_dispatcher = J.prototype.qC = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Nl(c, a);
    };
    Object.defineProperty(J.prototype, "m_dispatcher", {
      get: J.prototype.Kz,
      set: J.prototype.qC
    });
    J.prototype.get_m_gravity = J.prototype.Uz = function () {
      return k(Ol(this.Zx), p);
    };
    J.prototype.set_m_gravity = J.prototype.AC = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Pl(c, a);
    };
    Object.defineProperty(J.prototype, "m_gravity", {
      get: J.prototype.Uz,
      set: J.prototype.AC
    });
    J.prototype.__destroy__ = function () {
      Ql(this.Zx);
    };
    function sB(a, c, d, e) {
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      if (d && typeof d === "object") {
        d = d.Zx;
      }
      if (e && typeof e === "object") {
        e = e.Zx;
      }
      this.Zx = d === undefined ? Rl(a, c) : e === undefined ? _emscripten_bind_btConeTwistConstraint_btConeTwistConstraint_3(a, c, d) : Sl(a, c, d, e);
      h(sB)[this.Zx] = this;
    }
    sB.prototype = Object.create(KA.prototype);
    sB.prototype.constructor = sB;
    sB.prototype.$x = sB;
    sB.ay = {};
    b.btConeTwistConstraint = sB;
    sB.prototype.setLimit = function (a, c) {
      var d = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      Tl(d, a, c);
    };
    sB.prototype.setAngularOnly = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Ul(c, a);
    };
    sB.prototype.setDamping = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Vl(c, a);
    };
    sB.prototype.enableMotor = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Wl(c, a);
    };
    sB.prototype.setMaxMotorImpulse = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Xl(c, a);
    };
    sB.prototype.setMaxMotorImpulseNormalized = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Yl(c, a);
    };
    sB.prototype.setMotorTarget = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Zl(c, a);
    };
    sB.prototype.setMotorTargetInConstraintSpace = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      $l(c, a);
    };
    sB.prototype.enableFeedback = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      am(c, a);
    };
    sB.prototype.getBreakingImpulseThreshold = function () {
      return bm(this.Zx);
    };
    sB.prototype.setBreakingImpulseThreshold = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      cm(c, a);
    };
    sB.prototype.getParam = function (a, c) {
      var d = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      return dm(d, a, c);
    };
    sB.prototype.setParam = function (a, c, d) {
      var e = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      if (d && typeof d === "object") {
        d = d.Zx;
      }
      em(e, a, c, d);
    };
    sB.prototype.__destroy__ = function () {
      fm(this.Zx);
    };
    function tB(a, c, d, e, f, m, C) {
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      if (d && typeof d === "object") {
        d = d.Zx;
      }
      if (e && typeof e === "object") {
        e = e.Zx;
      }
      if (f && typeof f === "object") {
        f = f.Zx;
      }
      if (m && typeof m === "object") {
        m = m.Zx;
      }
      if (C && typeof C === "object") {
        C = C.Zx;
      }
      this.Zx = d === undefined ? gm(a, c) : e === undefined ? hm(a, c, d) : f === undefined ? im(a, c, d, e) : m === undefined ? jm(a, c, d, e, f) : C === undefined ? km(a, c, d, e, f, m) : lm(a, c, d, e, f, m, C);
      h(tB)[this.Zx] = this;
    }
    tB.prototype = Object.create(KA.prototype);
    tB.prototype.constructor = tB;
    tB.prototype.$x = tB;
    tB.ay = {};
    b.btHingeConstraint = tB;
    tB.prototype.setLimit = function (a, c, d, e, f) {
      var m = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      if (d && typeof d === "object") {
        d = d.Zx;
      }
      if (e && typeof e === "object") {
        e = e.Zx;
      }
      if (f && typeof f === "object") {
        f = f.Zx;
      }
      if (f === undefined) {
        mm(m, a, c, d, e);
      } else {
        nm(m, a, c, d, e, f);
      }
    };
    tB.prototype.enableAngularMotor = function (a, c, d) {
      var e = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      if (d && typeof d === "object") {
        d = d.Zx;
      }
      om(e, a, c, d);
    };
    tB.prototype.setAngularOnly = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      pm(c, a);
    };
    tB.prototype.enableMotor = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      qm(c, a);
    };
    tB.prototype.setMaxMotorImpulse = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      rm(c, a);
    };
    tB.prototype.setMotorTarget = function (a, c) {
      var d = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      sm(d, a, c);
    };
    tB.prototype.enableFeedback = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      tm(c, a);
    };
    tB.prototype.getBreakingImpulseThreshold = function () {
      return um(this.Zx);
    };
    tB.prototype.setBreakingImpulseThreshold = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      wm(c, a);
    };
    tB.prototype.getParam = function (a, c) {
      var d = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      return xm(d, a, c);
    };
    tB.prototype.setParam = function (a, c, d) {
      var e = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      if (d && typeof d === "object") {
        d = d.Zx;
      }
      ym(e, a, c, d);
    };
    tB.prototype.__destroy__ = function () {
      zm(this.Zx);
    };
    function uB(a, c) {
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      this.Zx = Am(a, c);
      h(uB)[this.Zx] = this;
    }
    uB.prototype = Object.create(PA.prototype);
    uB.prototype.constructor = uB;
    uB.prototype.$x = uB;
    uB.ay = {};
    b.btConeShapeZ = uB;
    uB.prototype.setLocalScaling = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Bm(c, a);
    };
    uB.prototype.getLocalScaling = function () {
      return k(Cm(this.Zx), p);
    };
    uB.prototype.calculateLocalInertia = function (a, c) {
      var d = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      Dm(d, a, c);
    };
    uB.prototype.__destroy__ = function () {
      Em(this.Zx);
    };
    function vB(a, c) {
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      this.Zx = Fm(a, c);
      h(vB)[this.Zx] = this;
    }
    vB.prototype = Object.create(PA.prototype);
    vB.prototype.constructor = vB;
    vB.prototype.$x = vB;
    vB.ay = {};
    b.btConeShapeX = vB;
    vB.prototype.setLocalScaling = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Gm(c, a);
    };
    vB.prototype.getLocalScaling = function () {
      return k(Hm(this.Zx), p);
    };
    vB.prototype.calculateLocalInertia = function (a, c) {
      var d = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      Im(d, a, c);
    };
    vB.prototype.__destroy__ = function () {
      Jm(this.Zx);
    };
    function wB(a, c) {
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      this.Zx = a === undefined ? Km() : c === undefined ? Lm(a) : Mm(a, c);
      h(wB)[this.Zx] = this;
    }
    wB.prototype = Object.create(XA.prototype);
    wB.prototype.constructor = wB;
    wB.prototype.$x = wB;
    wB.ay = {};
    b.btTriangleMesh = wB;
    wB.prototype.addTriangle = function (a, c, d, e) {
      var f = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      if (d && typeof d === "object") {
        d = d.Zx;
      }
      if (e && typeof e === "object") {
        e = e.Zx;
      }
      if (e === undefined) {
        Nm(f, a, c, d);
      } else {
        Om(f, a, c, d, e);
      }
    };
    wB.prototype.findOrAddVertex = function (a, c) {
      var d = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      return Pm(d, a, c);
    };
    wB.prototype.addIndex = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Qm(c, a);
    };
    wB.prototype.getIndexedMeshArray = function () {
      return k(Rm(this.Zx), lB);
    };
    wB.prototype.setScaling = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Sm(c, a);
    };
    wB.prototype.__destroy__ = function () {
      Tm(this.Zx);
    };
    function xB(a, c) {
      zA();
      if (typeof a == "object") {
        a = DA(a);
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      this.Zx = a === undefined ? Um() : c === undefined ? Vm(a) : Wm(a, c);
      h(xB)[this.Zx] = this;
    }
    xB.prototype = Object.create(n.prototype);
    xB.prototype.constructor = xB;
    xB.prototype.$x = xB;
    xB.ay = {};
    b.btConvexHullShape = xB;
    xB.prototype.addPoint = function (a, c) {
      var d = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      if (c === undefined) {
        Xm(d, a);
      } else {
        Ym(d, a, c);
      }
    };
    xB.prototype.setMargin = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Zm(c, a);
    };
    xB.prototype.getMargin = function () {
      return $m(this.Zx);
    };
    xB.prototype.getNumVertices = function () {
      return an(this.Zx);
    };
    xB.prototype.initializePolyhedralFeatures = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      return !!bn(c, a);
    };
    xB.prototype.recalcLocalAabb = function () {
      cn(this.Zx);
    };
    xB.prototype.getConvexPolyhedron = function () {
      return k(dn(this.Zx), yB);
    };
    xB.prototype.setLocalScaling = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      en(c, a);
    };
    xB.prototype.getLocalScaling = function () {
      return k(fn(this.Zx), p);
    };
    xB.prototype.calculateLocalInertia = function (a, c) {
      var d = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      gn(d, a, c);
    };
    xB.prototype.__destroy__ = function () {
      hn(this.Zx);
    };
    function K() {
      this.Zx = jn();
      h(K)[this.Zx] = this;
    }
    K.prototype = Object.create(g.prototype);
    K.prototype.constructor = K;
    K.prototype.$x = K;
    K.ay = {};
    b.btVehicleTuning = K;
    K.prototype.get_m_suspensionStiffness = K.prototype.ny = function () {
      return kn(this.Zx);
    };
    K.prototype.set_m_suspensionStiffness = K.prototype.uy = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      ln(c, a);
    };
    Object.defineProperty(K.prototype, "m_suspensionStiffness", {
      get: K.prototype.ny,
      set: K.prototype.uy
    });
    K.prototype.get_m_suspensionCompression = K.prototype.PA = function () {
      return mn(this.Zx);
    };
    K.prototype.set_m_suspensionCompression = K.prototype.vD = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      nn(c, a);
    };
    Object.defineProperty(K.prototype, "m_suspensionCompression", {
      get: K.prototype.PA,
      set: K.prototype.vD
    });
    K.prototype.get_m_suspensionDamping = K.prototype.QA = function () {
      return on(this.Zx);
    };
    K.prototype.set_m_suspensionDamping = K.prototype.wD = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      pn(c, a);
    };
    Object.defineProperty(K.prototype, "m_suspensionDamping", {
      get: K.prototype.QA,
      set: K.prototype.wD
    });
    K.prototype.get_m_maxSuspensionTravelCm = K.prototype.my = function () {
      return qn(this.Zx);
    };
    K.prototype.set_m_maxSuspensionTravelCm = K.prototype.ty = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      rn(c, a);
    };
    Object.defineProperty(K.prototype, "m_maxSuspensionTravelCm", {
      get: K.prototype.my,
      set: K.prototype.ty
    });
    K.prototype.get_m_frictionSlip = K.prototype.iy = function () {
      return sn(this.Zx);
    };
    K.prototype.set_m_frictionSlip = K.prototype.py = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      tn(c, a);
    };
    Object.defineProperty(K.prototype, "m_frictionSlip", {
      get: K.prototype.iy,
      set: K.prototype.py
    });
    K.prototype.get_m_maxSuspensionForce = K.prototype.ly = function () {
      return un(this.Zx);
    };
    K.prototype.set_m_maxSuspensionForce = K.prototype.sy = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      vn(c, a);
    };
    Object.defineProperty(K.prototype, "m_maxSuspensionForce", {
      get: K.prototype.ly,
      set: K.prototype.sy
    });
    function zB() {
      throw "cannot construct a btCollisionObjectWrapper, no constructor in IDL";
    }
    zB.prototype = Object.create(g.prototype);
    zB.prototype.constructor = zB;
    zB.prototype.$x = zB;
    zB.ay = {};
    b.btCollisionObjectWrapper = zB;
    zB.prototype.getWorldTransform = function () {
      return k(wn(this.Zx), r);
    };
    zB.prototype.getCollisionObject = function () {
      return k(xn(this.Zx), q);
    };
    zB.prototype.getCollisionShape = function () {
      return k(yn(this.Zx), n);
    };
    function AB(a) {
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      this.Zx = zn(a);
      h(AB)[this.Zx] = this;
    }
    AB.prototype = Object.create(g.prototype);
    AB.prototype.constructor = AB;
    AB.prototype.$x = AB;
    AB.ay = {};
    b.btShapeHull = AB;
    AB.prototype.buildHull = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      return !!An(c, a);
    };
    AB.prototype.numVertices = function () {
      return Bn(this.Zx);
    };
    AB.prototype.getVertexPointer = function () {
      return k(Cn(this.Zx), p);
    };
    AB.prototype.__destroy__ = function () {
      Dn(this.Zx);
    };
    function BB(a, c) {
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      this.Zx = a === undefined ? En() : c === undefined ? Fn(a) : Gn(a, c);
      h(BB)[this.Zx] = this;
    }
    BB.prototype = Object.create(YA.prototype);
    BB.prototype.constructor = BB;
    BB.prototype.$x = BB;
    BB.ay = {};
    b.btDefaultMotionState = BB;
    BB.prototype.getWorldTransform = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Hn(c, a);
    };
    BB.prototype.setWorldTransform = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      In(c, a);
    };
    BB.prototype.get_m_graphicsWorldTrans = BB.prototype.Tz = function () {
      return k(Jn(this.Zx), r);
    };
    BB.prototype.set_m_graphicsWorldTrans = BB.prototype.zC = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Kn(c, a);
    };
    Object.defineProperty(BB.prototype, "m_graphicsWorldTrans", {
      get: BB.prototype.Tz,
      set: BB.prototype.zC
    });
    BB.prototype.__destroy__ = function () {
      Ln(this.Zx);
    };
    function L(a) {
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      this.Zx = Mn(a);
      h(L)[this.Zx] = this;
    }
    L.prototype = Object.create(g.prototype);
    L.prototype.constructor = L;
    L.prototype.$x = L;
    L.ay = {};
    b.btWheelInfo = L;
    L.prototype.getSuspensionRestLength = function () {
      return Nn(this.Zx);
    };
    L.prototype.updateWheel = function (a, c) {
      var d = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      On(d, a, c);
    };
    L.prototype.get_m_suspensionStiffness = L.prototype.ny = function () {
      return Pn(this.Zx);
    };
    L.prototype.set_m_suspensionStiffness = L.prototype.uy = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Qn(c, a);
    };
    Object.defineProperty(L.prototype, "m_suspensionStiffness", {
      get: L.prototype.ny,
      set: L.prototype.uy
    });
    L.prototype.get_m_frictionSlip = L.prototype.iy = function () {
      return Rn(this.Zx);
    };
    L.prototype.set_m_frictionSlip = L.prototype.py = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Sn(c, a);
    };
    Object.defineProperty(L.prototype, "m_frictionSlip", {
      get: L.prototype.iy,
      set: L.prototype.py
    });
    L.prototype.get_m_engineForce = L.prototype.Oz = function () {
      return Tn(this.Zx);
    };
    L.prototype.set_m_engineForce = L.prototype.uC = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Un(c, a);
    };
    Object.defineProperty(L.prototype, "m_engineForce", {
      get: L.prototype.Oz,
      set: L.prototype.uC
    });
    L.prototype.get_m_rollInfluence = L.prototype.FA = function () {
      return Vn(this.Zx);
    };
    L.prototype.set_m_rollInfluence = L.prototype.lD = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Wn(c, a);
    };
    Object.defineProperty(L.prototype, "m_rollInfluence", {
      get: L.prototype.FA,
      set: L.prototype.lD
    });
    L.prototype.get_m_suspensionRestLength1 = L.prototype.UA = function () {
      return Xn(this.Zx);
    };
    L.prototype.set_m_suspensionRestLength1 = L.prototype.AD = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Yn(c, a);
    };
    Object.defineProperty(L.prototype, "m_suspensionRestLength1", {
      get: L.prototype.UA,
      set: L.prototype.AD
    });
    L.prototype.get_m_wheelsRadius = L.prototype.hB = function () {
      return Zn(this.Zx);
    };
    L.prototype.set_m_wheelsRadius = L.prototype.OD = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      $n(c, a);
    };
    Object.defineProperty(L.prototype, "m_wheelsRadius", {
      get: L.prototype.hB,
      set: L.prototype.OD
    });
    L.prototype.get_m_wheelsDampingCompression = L.prototype.By = function () {
      return ao(this.Zx);
    };
    L.prototype.set_m_wheelsDampingCompression = L.prototype.Iy = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      bo(c, a);
    };
    Object.defineProperty(L.prototype, "m_wheelsDampingCompression", {
      get: L.prototype.By,
      set: L.prototype.Iy
    });
    L.prototype.get_m_wheelsDampingRelaxation = L.prototype.Cy = function () {
      return co(this.Zx);
    };
    L.prototype.set_m_wheelsDampingRelaxation = L.prototype.Jy = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      eo(c, a);
    };
    Object.defineProperty(L.prototype, "m_wheelsDampingRelaxation", {
      get: L.prototype.Cy,
      set: L.prototype.Jy
    });
    L.prototype.get_m_steering = L.prototype.NA = function () {
      return fo(this.Zx);
    };
    L.prototype.set_m_steering = L.prototype.tD = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      go(c, a);
    };
    Object.defineProperty(L.prototype, "m_steering", {
      get: L.prototype.NA,
      set: L.prototype.tD
    });
    L.prototype.get_m_maxSuspensionForce = L.prototype.ly = function () {
      return ho(this.Zx);
    };
    L.prototype.set_m_maxSuspensionForce = L.prototype.sy = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      io(c, a);
    };
    Object.defineProperty(L.prototype, "m_maxSuspensionForce", {
      get: L.prototype.ly,
      set: L.prototype.sy
    });
    L.prototype.get_m_maxSuspensionTravelCm = L.prototype.my = function () {
      return jo(this.Zx);
    };
    L.prototype.set_m_maxSuspensionTravelCm = L.prototype.ty = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      ko(c, a);
    };
    Object.defineProperty(L.prototype, "m_maxSuspensionTravelCm", {
      get: L.prototype.my,
      set: L.prototype.ty
    });
    L.prototype.get_m_wheelsSuspensionForce = L.prototype.iB = function () {
      return lo(this.Zx);
    };
    L.prototype.set_m_wheelsSuspensionForce = L.prototype.PD = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      mo(c, a);
    };
    Object.defineProperty(L.prototype, "m_wheelsSuspensionForce", {
      get: L.prototype.iB,
      set: L.prototype.PD
    });
    L.prototype.get_m_bIsFrontWheel = L.prototype.wy = function () {
      return !!no(this.Zx);
    };
    L.prototype.set_m_bIsFrontWheel = L.prototype.Dy = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      oo(c, a);
    };
    Object.defineProperty(L.prototype, "m_bIsFrontWheel", {
      get: L.prototype.wy,
      set: L.prototype.Dy
    });
    L.prototype.get_m_raycastInfo = L.prototype.DA = function () {
      return k(po(this.Zx), M);
    };
    L.prototype.set_m_raycastInfo = L.prototype.jD = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      qo(c, a);
    };
    Object.defineProperty(L.prototype, "m_raycastInfo", {
      get: L.prototype.DA,
      set: L.prototype.jD
    });
    L.prototype.get_m_chassisConnectionPointCS = L.prototype.zz = function () {
      return k(ro(this.Zx), p);
    };
    L.prototype.set_m_chassisConnectionPointCS = L.prototype.fC = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      so(c, a);
    };
    Object.defineProperty(L.prototype, "m_chassisConnectionPointCS", {
      get: L.prototype.zz,
      set: L.prototype.fC
    });
    L.prototype.get_m_worldTransform = L.prototype.jB = function () {
      return k(to(this.Zx), r);
    };
    L.prototype.set_m_worldTransform = L.prototype.QD = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      uo(c, a);
    };
    Object.defineProperty(L.prototype, "m_worldTransform", {
      get: L.prototype.jB,
      set: L.prototype.QD
    });
    L.prototype.get_m_wheelDirectionCS = L.prototype.Ay = function () {
      return k(vo(this.Zx), p);
    };
    L.prototype.set_m_wheelDirectionCS = L.prototype.Hy = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      wo(c, a);
    };
    Object.defineProperty(L.prototype, "m_wheelDirectionCS", {
      get: L.prototype.Ay,
      set: L.prototype.Hy
    });
    L.prototype.get_m_wheelAxleCS = L.prototype.zy = function () {
      return k(xo(this.Zx), p);
    };
    L.prototype.set_m_wheelAxleCS = L.prototype.Gy = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      yo(c, a);
    };
    Object.defineProperty(L.prototype, "m_wheelAxleCS", {
      get: L.prototype.zy,
      set: L.prototype.Gy
    });
    L.prototype.get_m_rotation = L.prototype.HA = function () {
      return zo(this.Zx);
    };
    L.prototype.set_m_rotation = L.prototype.nD = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Ao(c, a);
    };
    Object.defineProperty(L.prototype, "m_rotation", {
      get: L.prototype.HA,
      set: L.prototype.nD
    });
    L.prototype.get_m_deltaRotation = L.prototype.Iz = function () {
      return Bo(this.Zx);
    };
    L.prototype.set_m_deltaRotation = L.prototype.oC = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Co(c, a);
    };
    Object.defineProperty(L.prototype, "m_deltaRotation", {
      get: L.prototype.Iz,
      set: L.prototype.oC
    });
    L.prototype.get_m_brake = L.prototype.rz = function () {
      return Do(this.Zx);
    };
    L.prototype.set_m_brake = L.prototype.ZB = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Eo(c, a);
    };
    Object.defineProperty(L.prototype, "m_brake", {
      get: L.prototype.rz,
      set: L.prototype.ZB
    });
    L.prototype.get_m_clippedInvContactDotSuspension = L.prototype.Az = function () {
      return Fo(this.Zx);
    };
    L.prototype.set_m_clippedInvContactDotSuspension = L.prototype.gC = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Go(c, a);
    };
    Object.defineProperty(L.prototype, "m_clippedInvContactDotSuspension", {
      get: L.prototype.Az,
      set: L.prototype.gC
    });
    L.prototype.get_m_suspensionRelativeVelocity = L.prototype.SA = function () {
      return Ho(this.Zx);
    };
    L.prototype.set_m_suspensionRelativeVelocity = L.prototype.yD = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Io(c, a);
    };
    Object.defineProperty(L.prototype, "m_suspensionRelativeVelocity", {
      get: L.prototype.SA,
      set: L.prototype.yD
    });
    L.prototype.get_m_skidInfo = L.prototype.KA = function () {
      return Jo(this.Zx);
    };
    L.prototype.set_m_skidInfo = L.prototype.qD = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Ko(c, a);
    };
    Object.defineProperty(L.prototype, "m_skidInfo", {
      get: L.prototype.KA,
      set: L.prototype.qD
    });
    L.prototype.__destroy__ = function () {
      Lo(this.Zx);
    };
    function N(a, c, d, e) {
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      if (d && typeof d === "object") {
        d = d.Zx;
      }
      if (e && typeof e === "object") {
        e = e.Zx;
      }
      this.Zx = a === undefined ? Mo() : c === undefined ? _emscripten_bind_btVector4_btVector4_1(a) : d === undefined ? _emscripten_bind_btVector4_btVector4_2(a, c) : e === undefined ? _emscripten_bind_btVector4_btVector4_3(a, c, d) : No(a, c, d, e);
      h(N)[this.Zx] = this;
    }
    N.prototype = Object.create(p.prototype);
    N.prototype.constructor = N;
    N.prototype.$x = N;
    N.ay = {};
    b.btVector4 = N;
    N.prototype.w = function () {
      return Oo(this.Zx);
    };
    N.prototype.setValue = function (a, c, d, e) {
      var f = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      if (d && typeof d === "object") {
        d = d.Zx;
      }
      if (e && typeof e === "object") {
        e = e.Zx;
      }
      Po(f, a, c, d, e);
    };
    N.prototype.length = N.prototype.length = function () {
      return Qo(this.Zx);
    };
    N.prototype.x = N.prototype.x = function () {
      return Ro(this.Zx);
    };
    N.prototype.y = N.prototype.y = function () {
      return So(this.Zx);
    };
    N.prototype.z = N.prototype.z = function () {
      return To(this.Zx);
    };
    N.prototype.setX = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Uo(c, a);
    };
    N.prototype.setY = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Vo(c, a);
    };
    N.prototype.setZ = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Wo(c, a);
    };
    N.prototype.normalize = N.prototype.normalize = function () {
      Xo(this.Zx);
    };
    N.prototype.rotate = N.prototype.rotate = function (a, c) {
      var d = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      return k(Yo(d, a, c), p);
    };
    N.prototype.dot = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      return Zo(c, a);
    };
    N.prototype.op_mul = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      return k($o(c, a), p);
    };
    N.prototype.op_add = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      return k(ap(c, a), p);
    };
    N.prototype.op_sub = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      return k(bp(c, a), p);
    };
    N.prototype.__destroy__ = function () {
      cp(this.Zx);
    };
    function CB() {
      this.Zx = dp();
      h(CB)[this.Zx] = this;
    }
    CB.prototype = Object.create(g.prototype);
    CB.prototype.constructor = CB;
    CB.prototype.$x = CB;
    CB.ay = {};
    b.btDefaultCollisionConstructionInfo = CB;
    CB.prototype.__destroy__ = function () {
      ep(this.Zx);
    };
    function O() {
      throw "cannot construct a Anchor, no constructor in IDL";
    }
    O.prototype = Object.create(g.prototype);
    O.prototype.constructor = O;
    O.prototype.$x = O;
    O.ay = {};
    b.Anchor = O;
    O.prototype.get_m_node = O.prototype.uA = function () {
      return k(fp(this.Zx), Node);
    };
    O.prototype.set_m_node = O.prototype.aD = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      gp(c, a);
    };
    Object.defineProperty(O.prototype, "m_node", {
      get: O.prototype.uA,
      set: O.prototype.aD
    });
    O.prototype.get_m_local = O.prototype.nA = function () {
      return k(hp(this.Zx), p);
    };
    O.prototype.set_m_local = O.prototype.UC = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      ip(c, a);
    };
    Object.defineProperty(O.prototype, "m_local", {
      get: O.prototype.nA,
      set: O.prototype.UC
    });
    O.prototype.get_m_body = O.prototype.qz = function () {
      return k(jp(this.Zx), I);
    };
    O.prototype.set_m_body = O.prototype.YB = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      kp(c, a);
    };
    Object.defineProperty(O.prototype, "m_body", {
      get: O.prototype.qz,
      set: O.prototype.YB
    });
    O.prototype.get_m_influence = O.prototype.gA = function () {
      return lp(this.Zx);
    };
    O.prototype.set_m_influence = O.prototype.NC = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      mp(c, a);
    };
    Object.defineProperty(O.prototype, "m_influence", {
      get: O.prototype.gA,
      set: O.prototype.NC
    });
    O.prototype.get_m_c0 = O.prototype.uz = function () {
      return k(np(this.Zx), aB);
    };
    O.prototype.set_m_c0 = O.prototype.aC = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      op(c, a);
    };
    Object.defineProperty(O.prototype, "m_c0", {
      get: O.prototype.uz,
      set: O.prototype.aC
    });
    O.prototype.get_m_c1 = O.prototype.vz = function () {
      return k(pp(this.Zx), p);
    };
    O.prototype.set_m_c1 = O.prototype.bC = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      qp(c, a);
    };
    Object.defineProperty(O.prototype, "m_c1", {
      get: O.prototype.vz,
      set: O.prototype.bC
    });
    O.prototype.get_m_c2 = O.prototype.wz = function () {
      return rp(this.Zx);
    };
    O.prototype.set_m_c2 = O.prototype.cC = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      sp(c, a);
    };
    Object.defineProperty(O.prototype, "m_c2", {
      get: O.prototype.wz,
      set: O.prototype.cC
    });
    O.prototype.__destroy__ = function () {
      tp(this.Zx);
    };
    function Q() {
      throw "cannot construct a btVehicleRaycasterResult, no constructor in IDL";
    }
    Q.prototype = Object.create(g.prototype);
    Q.prototype.constructor = Q;
    Q.prototype.$x = Q;
    Q.ay = {};
    b.btVehicleRaycasterResult = Q;
    Q.prototype.get_m_hitPointInWorld = Q.prototype.bA = function () {
      return k(up(this.Zx), p);
    };
    Q.prototype.set_m_hitPointInWorld = Q.prototype.IC = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      vp(c, a);
    };
    Object.defineProperty(Q.prototype, "m_hitPointInWorld", {
      get: Q.prototype.bA,
      set: Q.prototype.IC
    });
    Q.prototype.get_m_hitNormalInWorld = Q.prototype.$z = function () {
      return k(wp(this.Zx), p);
    };
    Q.prototype.set_m_hitNormalInWorld = Q.prototype.GC = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      xp(c, a);
    };
    Object.defineProperty(Q.prototype, "m_hitNormalInWorld", {
      get: Q.prototype.$z,
      set: Q.prototype.GC
    });
    Q.prototype.get_m_distFraction = Q.prototype.Lz = function () {
      return yp(this.Zx);
    };
    Q.prototype.set_m_distFraction = Q.prototype.rC = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      zp(c, a);
    };
    Object.defineProperty(Q.prototype, "m_distFraction", {
      get: Q.prototype.Lz,
      set: Q.prototype.rC
    });
    Q.prototype.__destroy__ = function () {
      Ap(this.Zx);
    };
    function gB() {
      throw "cannot construct a btVector3Array, no constructor in IDL";
    }
    gB.prototype = Object.create(g.prototype);
    gB.prototype.constructor = gB;
    gB.prototype.$x = gB;
    gB.ay = {};
    b.btVector3Array = gB;
    gB.prototype.size = gB.prototype.size = function () {
      return Bp(this.Zx);
    };
    gB.prototype.at = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      return k(Cp(c, a), p);
    };
    gB.prototype.__destroy__ = function () {
      Dp(this.Zx);
    };
    function DB() {
      throw "cannot construct a btConstraintSolver, no constructor in IDL";
    }
    DB.prototype = Object.create(g.prototype);
    DB.prototype.constructor = DB;
    DB.prototype.$x = DB;
    DB.ay = {};
    b.btConstraintSolver = DB;
    DB.prototype.__destroy__ = function () {
      Ep(this.Zx);
    };
    function R(a, c, d) {
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      if (d && typeof d === "object") {
        d = d.Zx;
      }
      this.Zx = Fp(a, c, d);
      h(R)[this.Zx] = this;
    }
    R.prototype = Object.create(QA.prototype);
    R.prototype.constructor = R;
    R.prototype.$x = R;
    R.ay = {};
    b.btRaycastVehicle = R;
    R.prototype.applyEngineForce = function (a, c) {
      var d = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      Gp(d, a, c);
    };
    R.prototype.setSteeringValue = function (a, c) {
      var d = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      Hp(d, a, c);
    };
    R.prototype.getWheelTransformWS = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      return k(Ip(c, a), r);
    };
    R.prototype.updateWheelTransform = function (a, c) {
      var d = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      Jp(d, a, c);
    };
    R.prototype.addWheel = function (a, c, d, e, f, m, C) {
      var P = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      if (d && typeof d === "object") {
        d = d.Zx;
      }
      if (e && typeof e === "object") {
        e = e.Zx;
      }
      if (f && typeof f === "object") {
        f = f.Zx;
      }
      if (m && typeof m === "object") {
        m = m.Zx;
      }
      if (C && typeof C === "object") {
        C = C.Zx;
      }
      return k(Kp(P, a, c, d, e, f, m, C), L);
    };
    R.prototype.getNumWheels = function () {
      return Lp(this.Zx);
    };
    R.prototype.getRigidBody = function () {
      return k(Mp(this.Zx), I);
    };
    R.prototype.getWheelInfo = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      return k(Np(c, a), L);
    };
    R.prototype.setBrake = function (a, c) {
      var d = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      Op(d, a, c);
    };
    R.prototype.setCoordinateSystem = function (a, c, d) {
      var e = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      if (d && typeof d === "object") {
        d = d.Zx;
      }
      Pp(e, a, c, d);
    };
    R.prototype.getCurrentSpeedKmHour = function () {
      return Qp(this.Zx);
    };
    R.prototype.getChassisWorldTransform = function () {
      return k(Rp(this.Zx), r);
    };
    R.prototype.rayCast = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      return Sp(c, a);
    };
    R.prototype.updateVehicle = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Tp(c, a);
    };
    R.prototype.resetSuspension = function () {
      Up(this.Zx);
    };
    R.prototype.getSteeringValue = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      return Vp(c, a);
    };
    R.prototype.updateWheelTransformsWS = function (a, c) {
      var d = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      if (c === undefined) {
        Wp(d, a);
      } else {
        Xp(d, a, c);
      }
    };
    R.prototype.setPitchControl = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Yp(c, a);
    };
    R.prototype.updateSuspension = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Zp(c, a);
    };
    R.prototype.updateFriction = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      $p(c, a);
    };
    R.prototype.getRightAxis = function () {
      return aq(this.Zx);
    };
    R.prototype.getUpAxis = function () {
      return bq(this.Zx);
    };
    R.prototype.getForwardAxis = function () {
      return cq(this.Zx);
    };
    R.prototype.getForwardVector = function () {
      return k(dq(this.Zx), p);
    };
    R.prototype.getUserConstraintType = function () {
      return eq(this.Zx);
    };
    R.prototype.setUserConstraintType = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      fq(c, a);
    };
    R.prototype.setUserConstraintId = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      gq(c, a);
    };
    R.prototype.getUserConstraintId = function () {
      return hq(this.Zx);
    };
    R.prototype.updateAction = function (a, c) {
      var d = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      iq(d, a, c);
    };
    R.prototype.__destroy__ = function () {
      jq(this.Zx);
    };
    function EB(a) {
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      this.Zx = kq(a);
      h(EB)[this.Zx] = this;
    }
    EB.prototype = Object.create(TA.prototype);
    EB.prototype.constructor = EB;
    EB.prototype.$x = EB;
    EB.ay = {};
    b.btCylinderShapeX = EB;
    EB.prototype.setMargin = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      lq(c, a);
    };
    EB.prototype.getMargin = function () {
      return mq(this.Zx);
    };
    EB.prototype.setLocalScaling = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      nq(c, a);
    };
    EB.prototype.getLocalScaling = function () {
      return k(oq(this.Zx), p);
    };
    EB.prototype.calculateLocalInertia = function (a, c) {
      var d = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      pq(d, a, c);
    };
    EB.prototype.__destroy__ = function () {
      qq(this.Zx);
    };
    function FB(a) {
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      this.Zx = rq(a);
      h(FB)[this.Zx] = this;
    }
    FB.prototype = Object.create(TA.prototype);
    FB.prototype.constructor = FB;
    FB.prototype.$x = FB;
    FB.ay = {};
    b.btCylinderShapeZ = FB;
    FB.prototype.setMargin = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      sq(c, a);
    };
    FB.prototype.getMargin = function () {
      return tq(this.Zx);
    };
    FB.prototype.setLocalScaling = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      uq(c, a);
    };
    FB.prototype.getLocalScaling = function () {
      return k(vq(this.Zx), p);
    };
    FB.prototype.calculateLocalInertia = function (a, c) {
      var d = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      wq(d, a, c);
    };
    FB.prototype.__destroy__ = function () {
      xq(this.Zx);
    };
    function yB() {
      throw "cannot construct a btConvexPolyhedron, no constructor in IDL";
    }
    yB.prototype = Object.create(g.prototype);
    yB.prototype.constructor = yB;
    yB.prototype.$x = yB;
    yB.ay = {};
    b.btConvexPolyhedron = yB;
    yB.prototype.get_m_vertices = yB.prototype.dB = function () {
      return k(yq(this.Zx), gB);
    };
    yB.prototype.set_m_vertices = yB.prototype.KD = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      zq(c, a);
    };
    Object.defineProperty(yB.prototype, "m_vertices", {
      get: yB.prototype.dB,
      set: yB.prototype.KD
    });
    yB.prototype.get_m_faces = yB.prototype.Qz = function () {
      return k(Aq(this.Zx), GB);
    };
    yB.prototype.set_m_faces = yB.prototype.wC = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Bq(c, a);
    };
    Object.defineProperty(yB.prototype, "m_faces", {
      get: yB.prototype.Qz,
      set: yB.prototype.wC
    });
    yB.prototype.__destroy__ = function () {
      Cq(this.Zx);
    };
    function HB() {
      this.Zx = Dq();
      h(HB)[this.Zx] = this;
    }
    HB.prototype = Object.create(g.prototype);
    HB.prototype.constructor = HB;
    HB.prototype.$x = HB;
    HB.ay = {};
    b.btSequentialImpulseConstraintSolver = HB;
    HB.prototype.__destroy__ = function () {
      Eq(this.Zx);
    };
    function IB() {
      throw "cannot construct a tAnchorArray, no constructor in IDL";
    }
    IB.prototype = Object.create(g.prototype);
    IB.prototype.constructor = IB;
    IB.prototype.$x = IB;
    IB.ay = {};
    b.tAnchorArray = IB;
    IB.prototype.size = IB.prototype.size = function () {
      return Fq(this.Zx);
    };
    IB.prototype.at = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      return k(Gq(c, a), O);
    };
    IB.prototype.clear = IB.prototype.clear = function () {
      Hq(this.Zx);
    };
    IB.prototype.push_back = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Iq(c, a);
    };
    IB.prototype.pop_back = function () {
      Jq(this.Zx);
    };
    IB.prototype.__destroy__ = function () {
      Kq(this.Zx);
    };
    function M() {
      throw "cannot construct a RaycastInfo, no constructor in IDL";
    }
    M.prototype = Object.create(g.prototype);
    M.prototype.constructor = M;
    M.prototype.$x = M;
    M.ay = {};
    b.RaycastInfo = M;
    M.prototype.get_m_contactNormalWS = M.prototype.Cz = function () {
      return k(Lq(this.Zx), p);
    };
    M.prototype.set_m_contactNormalWS = M.prototype.iC = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Mq(c, a);
    };
    Object.defineProperty(M.prototype, "m_contactNormalWS", {
      get: M.prototype.Cz,
      set: M.prototype.iC
    });
    M.prototype.get_m_contactPointWS = M.prototype.Dz = function () {
      return k(Nq(this.Zx), p);
    };
    M.prototype.set_m_contactPointWS = M.prototype.jC = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Oq(c, a);
    };
    Object.defineProperty(M.prototype, "m_contactPointWS", {
      get: M.prototype.Dz,
      set: M.prototype.jC
    });
    M.prototype.get_m_suspensionLength = M.prototype.RA = function () {
      return Pq(this.Zx);
    };
    M.prototype.set_m_suspensionLength = M.prototype.xD = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Qq(c, a);
    };
    Object.defineProperty(M.prototype, "m_suspensionLength", {
      get: M.prototype.RA,
      set: M.prototype.xD
    });
    M.prototype.get_m_hardPointWS = M.prototype.Wz = function () {
      return k(Rq(this.Zx), p);
    };
    M.prototype.set_m_hardPointWS = M.prototype.CC = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Sq(c, a);
    };
    Object.defineProperty(M.prototype, "m_hardPointWS", {
      get: M.prototype.Wz,
      set: M.prototype.CC
    });
    M.prototype.get_m_wheelDirectionWS = M.prototype.fB = function () {
      return k(Tq(this.Zx), p);
    };
    M.prototype.set_m_wheelDirectionWS = M.prototype.MD = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Uq(c, a);
    };
    Object.defineProperty(M.prototype, "m_wheelDirectionWS", {
      get: M.prototype.fB,
      set: M.prototype.MD
    });
    M.prototype.get_m_wheelAxleWS = M.prototype.eB = function () {
      return k(Vq(this.Zx), p);
    };
    M.prototype.set_m_wheelAxleWS = M.prototype.LD = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Wq(c, a);
    };
    Object.defineProperty(M.prototype, "m_wheelAxleWS", {
      get: M.prototype.eB,
      set: M.prototype.LD
    });
    M.prototype.get_m_isInContact = M.prototype.hA = function () {
      return !!Xq(this.Zx);
    };
    M.prototype.set_m_isInContact = M.prototype.OC = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Yq(c, a);
    };
    Object.defineProperty(M.prototype, "m_isInContact", {
      get: M.prototype.hA,
      set: M.prototype.OC
    });
    M.prototype.get_m_groundObject = M.prototype.Vz = function () {
      return Zq(this.Zx);
    };
    M.prototype.set_m_groundObject = M.prototype.BC = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      $q(c, a);
    };
    Object.defineProperty(M.prototype, "m_groundObject", {
      get: M.prototype.Vz,
      set: M.prototype.BC
    });
    M.prototype.__destroy__ = function () {
      ar(this.Zx);
    };
    function JB(a, c, d) {
      zA();
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (typeof c == "object") {
        c = DA(c);
      }
      if (d && typeof d === "object") {
        d = d.Zx;
      }
      this.Zx = br(a, c, d);
      h(JB)[this.Zx] = this;
    }
    JB.prototype = Object.create(n.prototype);
    JB.prototype.constructor = JB;
    JB.prototype.$x = JB;
    JB.ay = {};
    b.btMultiSphereShape = JB;
    JB.prototype.setLocalScaling = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      cr(c, a);
    };
    JB.prototype.getLocalScaling = function () {
      return k(dr(this.Zx), p);
    };
    JB.prototype.calculateLocalInertia = function (a, c) {
      var d = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      er(d, a, c);
    };
    JB.prototype.__destroy__ = function () {
      fr(this.Zx);
    };
    function S(a, c, d, e) {
      zA();
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      if (d && typeof d === "object") {
        d = d.Zx;
      }
      if (typeof e == "object") {
        e = DA(e);
      }
      this.Zx = gr(a, c, d, e);
      h(S)[this.Zx] = this;
    }
    S.prototype = Object.create(q.prototype);
    S.prototype.constructor = S;
    S.prototype.$x = S;
    S.ay = {};
    b.btSoftBody = S;
    S.prototype.checkLink = function (a, c) {
      var d = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      return !!hr(d, a, c);
    };
    S.prototype.checkFace = function (a, c, d) {
      var e = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      if (d && typeof d === "object") {
        d = d.Zx;
      }
      return !!ir(e, a, c, d);
    };
    S.prototype.appendMaterial = function () {
      return k(jr(this.Zx), A);
    };
    S.prototype.appendNode = function (a, c) {
      var d = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      kr(d, a, c);
    };
    S.prototype.appendLink = function (a, c, d, e) {
      var f = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      if (d && typeof d === "object") {
        d = d.Zx;
      }
      if (e && typeof e === "object") {
        e = e.Zx;
      }
      lr(f, a, c, d, e);
    };
    S.prototype.appendFace = function (a, c, d, e) {
      var f = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      if (d && typeof d === "object") {
        d = d.Zx;
      }
      if (e && typeof e === "object") {
        e = e.Zx;
      }
      mr(f, a, c, d, e);
    };
    S.prototype.appendTetra = function (a, c, d, e, f) {
      var m = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      if (d && typeof d === "object") {
        d = d.Zx;
      }
      if (e && typeof e === "object") {
        e = e.Zx;
      }
      if (f && typeof f === "object") {
        f = f.Zx;
      }
      nr(m, a, c, d, e, f);
    };
    S.prototype.appendAnchor = function (a, c, d, e) {
      var f = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      if (d && typeof d === "object") {
        d = d.Zx;
      }
      if (e && typeof e === "object") {
        e = e.Zx;
      }
      or(f, a, c, d, e);
    };
    S.prototype.addForce = function (a, c) {
      var d = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      if (c === undefined) {
        pr(d, a);
      } else {
        qr(d, a, c);
      }
    };
    S.prototype.addAeroForceToNode = function (a, c) {
      var d = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      rr(d, a, c);
    };
    S.prototype.getTotalMass = function () {
      return sr(this.Zx);
    };
    S.prototype.setTotalMass = function (a, c) {
      var d = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      tr(d, a, c);
    };
    S.prototype.setMass = function (a, c) {
      var d = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      ur(d, a, c);
    };
    S.prototype.transform = S.prototype.transform = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      vr(c, a);
    };
    S.prototype.translate = S.prototype.translate = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      wr(c, a);
    };
    S.prototype.rotate = S.prototype.rotate = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      xr(c, a);
    };
    S.prototype.scale = S.prototype.scale = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      yr(c, a);
    };
    S.prototype.generateClusters = function (a, c) {
      var d = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      if (c === undefined) {
        return zr(d, a);
      } else {
        return Ar(d, a, c);
      }
    };
    S.prototype.generateBendingConstraints = function (a, c) {
      var d = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      return Br(d, a, c);
    };
    S.prototype.upcast = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      return k(Cr(c, a), S);
    };
    S.prototype.setAnisotropicFriction = function (a, c) {
      var d = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      Dr(d, a, c);
    };
    S.prototype.getCollisionShape = function () {
      return k(Er(this.Zx), n);
    };
    S.prototype.setContactProcessingThreshold = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Fr(c, a);
    };
    S.prototype.setActivationState = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Gr(c, a);
    };
    S.prototype.forceActivationState = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Hr(c, a);
    };
    S.prototype.activate = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (a === undefined) {
        Ir(c);
      } else {
        Jr(c, a);
      }
    };
    S.prototype.isActive = function () {
      return !!Kr(this.Zx);
    };
    S.prototype.isKinematicObject = function () {
      return !!Lr(this.Zx);
    };
    S.prototype.isStaticObject = function () {
      return !!Mr(this.Zx);
    };
    S.prototype.isStaticOrKinematicObject = function () {
      return !!Nr(this.Zx);
    };
    S.prototype.getRestitution = function () {
      return Or(this.Zx);
    };
    S.prototype.getFriction = function () {
      return Pr(this.Zx);
    };
    S.prototype.getRollingFriction = function () {
      return Qr(this.Zx);
    };
    S.prototype.setRestitution = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Rr(c, a);
    };
    S.prototype.setFriction = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Sr(c, a);
    };
    S.prototype.setRollingFriction = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Tr(c, a);
    };
    S.prototype.getWorldTransform = function () {
      return k(Ur(this.Zx), r);
    };
    S.prototype.getCollisionFlags = function () {
      return Vr(this.Zx);
    };
    S.prototype.setCollisionFlags = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Wr(c, a);
    };
    S.prototype.setWorldTransform = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Xr(c, a);
    };
    S.prototype.setCollisionShape = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Yr(c, a);
    };
    S.prototype.setCcdMotionThreshold = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Zr(c, a);
    };
    S.prototype.setCcdSweptSphereRadius = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      $r(c, a);
    };
    S.prototype.getUserIndex = function () {
      return as(this.Zx);
    };
    S.prototype.setUserIndex = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      bs(c, a);
    };
    S.prototype.getUserPointer = function () {
      return k(cs(this.Zx), JA);
    };
    S.prototype.setUserPointer = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      ds(c, a);
    };
    S.prototype.getBroadphaseHandle = function () {
      return k(es(this.Zx), t);
    };
    S.prototype.get_m_cfg = S.prototype.xz = function () {
      return k(gs(this.Zx), T);
    };
    S.prototype.set_m_cfg = S.prototype.dC = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      hs(c, a);
    };
    Object.defineProperty(S.prototype, "m_cfg", {
      get: S.prototype.xz,
      set: S.prototype.dC
    });
    S.prototype.get_m_nodes = S.prototype.vA = function () {
      return k(is(this.Zx), KB);
    };
    S.prototype.set_m_nodes = S.prototype.bD = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      js(c, a);
    };
    Object.defineProperty(S.prototype, "m_nodes", {
      get: S.prototype.vA,
      set: S.prototype.bD
    });
    S.prototype.get_m_materials = S.prototype.rA = function () {
      return k(ks(this.Zx), hB);
    };
    S.prototype.set_m_materials = S.prototype.YC = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      ls(c, a);
    };
    Object.defineProperty(S.prototype, "m_materials", {
      get: S.prototype.rA,
      set: S.prototype.YC
    });
    S.prototype.get_m_anchors = S.prototype.mz = function () {
      return k(ms(this.Zx), IB);
    };
    S.prototype.set_m_anchors = S.prototype.UB = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      ns(c, a);
    };
    Object.defineProperty(S.prototype, "m_anchors", {
      get: S.prototype.mz,
      set: S.prototype.UB
    });
    S.prototype.__destroy__ = function () {
      ps(this.Zx);
    };
    function LB() {
      throw "cannot construct a btIntArray, no constructor in IDL";
    }
    LB.prototype = Object.create(g.prototype);
    LB.prototype.constructor = LB;
    LB.prototype.$x = LB;
    LB.ay = {};
    b.btIntArray = LB;
    LB.prototype.size = LB.prototype.size = function () {
      return qs(this.Zx);
    };
    LB.prototype.at = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      return rs(c, a);
    };
    LB.prototype.__destroy__ = function () {
      ss(this.Zx);
    };
    function T() {
      throw "cannot construct a Config, no constructor in IDL";
    }
    T.prototype = Object.create(g.prototype);
    T.prototype.constructor = T;
    T.prototype.$x = T;
    T.ay = {};
    b.Config = T;
    T.prototype.get_kVCF = T.prototype.fz = function () {
      return ts(this.Zx);
    };
    T.prototype.set_kVCF = T.prototype.NB = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      us(c, a);
    };
    Object.defineProperty(T.prototype, "kVCF", {
      get: T.prototype.fz,
      set: T.prototype.NB
    });
    T.prototype.get_kDP = T.prototype.Ty = function () {
      return vs(this.Zx);
    };
    T.prototype.set_kDP = T.prototype.AB = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      xs(c, a);
    };
    Object.defineProperty(T.prototype, "kDP", {
      get: T.prototype.Ty,
      set: T.prototype.AB
    });
    T.prototype.get_kDG = T.prototype.Sy = function () {
      return ys(this.Zx);
    };
    T.prototype.set_kDG = T.prototype.zB = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      zs(c, a);
    };
    Object.defineProperty(T.prototype, "kDG", {
      get: T.prototype.Sy,
      set: T.prototype.zB
    });
    T.prototype.get_kLF = T.prototype.Vy = function () {
      return As(this.Zx);
    };
    T.prototype.set_kLF = T.prototype.CB = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Bs(c, a);
    };
    Object.defineProperty(T.prototype, "kLF", {
      get: T.prototype.Vy,
      set: T.prototype.CB
    });
    T.prototype.get_kPR = T.prototype.Xy = function () {
      return Cs(this.Zx);
    };
    T.prototype.set_kPR = T.prototype.EB = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Ds(c, a);
    };
    Object.defineProperty(T.prototype, "kPR", {
      get: T.prototype.Xy,
      set: T.prototype.EB
    });
    T.prototype.get_kVC = T.prototype.ez = function () {
      return Es(this.Zx);
    };
    T.prototype.set_kVC = T.prototype.MB = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Fs(c, a);
    };
    Object.defineProperty(T.prototype, "kVC", {
      get: T.prototype.ez,
      set: T.prototype.MB
    });
    T.prototype.get_kDF = T.prototype.Ry = function () {
      return Gs(this.Zx);
    };
    T.prototype.set_kDF = T.prototype.yB = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Hs(c, a);
    };
    Object.defineProperty(T.prototype, "kDF", {
      get: T.prototype.Ry,
      set: T.prototype.yB
    });
    T.prototype.get_kMT = T.prototype.Wy = function () {
      return Is(this.Zx);
    };
    T.prototype.set_kMT = T.prototype.DB = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Js(c, a);
    };
    Object.defineProperty(T.prototype, "kMT", {
      get: T.prototype.Wy,
      set: T.prototype.DB
    });
    T.prototype.get_kCHR = T.prototype.Qy = function () {
      return Ks(this.Zx);
    };
    T.prototype.set_kCHR = T.prototype.xB = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Ls(c, a);
    };
    Object.defineProperty(T.prototype, "kCHR", {
      get: T.prototype.Qy,
      set: T.prototype.xB
    });
    T.prototype.get_kKHR = T.prototype.Uy = function () {
      return Ms(this.Zx);
    };
    T.prototype.set_kKHR = T.prototype.BB = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Ns(c, a);
    };
    Object.defineProperty(T.prototype, "kKHR", {
      get: T.prototype.Uy,
      set: T.prototype.BB
    });
    T.prototype.get_kSHR = T.prototype.Yy = function () {
      return Os(this.Zx);
    };
    T.prototype.set_kSHR = T.prototype.FB = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Ps(c, a);
    };
    Object.defineProperty(T.prototype, "kSHR", {
      get: T.prototype.Yy,
      set: T.prototype.FB
    });
    T.prototype.get_kAHR = T.prototype.Py = function () {
      return Qs(this.Zx);
    };
    T.prototype.set_kAHR = T.prototype.wB = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Rs(c, a);
    };
    Object.defineProperty(T.prototype, "kAHR", {
      get: T.prototype.Py,
      set: T.prototype.wB
    });
    T.prototype.get_kSRHR_CL = T.prototype.az = function () {
      return Ss(this.Zx);
    };
    T.prototype.set_kSRHR_CL = T.prototype.IB = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Ts(c, a);
    };
    Object.defineProperty(T.prototype, "kSRHR_CL", {
      get: T.prototype.az,
      set: T.prototype.IB
    });
    T.prototype.get_kSKHR_CL = T.prototype.Zy = function () {
      return Us(this.Zx);
    };
    T.prototype.set_kSKHR_CL = T.prototype.GB = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Vs(c, a);
    };
    Object.defineProperty(T.prototype, "kSKHR_CL", {
      get: T.prototype.Zy,
      set: T.prototype.GB
    });
    T.prototype.get_kSSHR_CL = T.prototype.cz = function () {
      return Ws(this.Zx);
    };
    T.prototype.set_kSSHR_CL = T.prototype.KB = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Xs(c, a);
    };
    Object.defineProperty(T.prototype, "kSSHR_CL", {
      get: T.prototype.cz,
      set: T.prototype.KB
    });
    T.prototype.get_kSR_SPLT_CL = T.prototype.bz = function () {
      return Ys(this.Zx);
    };
    T.prototype.set_kSR_SPLT_CL = T.prototype.JB = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Zs(c, a);
    };
    Object.defineProperty(T.prototype, "kSR_SPLT_CL", {
      get: T.prototype.bz,
      set: T.prototype.JB
    });
    T.prototype.get_kSK_SPLT_CL = T.prototype.$y = function () {
      return $s(this.Zx);
    };
    T.prototype.set_kSK_SPLT_CL = T.prototype.HB = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      at(c, a);
    };
    Object.defineProperty(T.prototype, "kSK_SPLT_CL", {
      get: T.prototype.$y,
      set: T.prototype.HB
    });
    T.prototype.get_kSS_SPLT_CL = T.prototype.dz = function () {
      return bt(this.Zx);
    };
    T.prototype.set_kSS_SPLT_CL = T.prototype.LB = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      ct(c, a);
    };
    Object.defineProperty(T.prototype, "kSS_SPLT_CL", {
      get: T.prototype.dz,
      set: T.prototype.LB
    });
    T.prototype.get_maxvolume = T.prototype.lB = function () {
      return dt(this.Zx);
    };
    T.prototype.set_maxvolume = T.prototype.SD = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      et(c, a);
    };
    Object.defineProperty(T.prototype, "maxvolume", {
      get: T.prototype.lB,
      set: T.prototype.SD
    });
    T.prototype.get_timescale = T.prototype.nB = function () {
      return ft(this.Zx);
    };
    T.prototype.set_timescale = T.prototype.UD = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      gt(c, a);
    };
    Object.defineProperty(T.prototype, "timescale", {
      get: T.prototype.nB,
      set: T.prototype.UD
    });
    T.prototype.get_viterations = T.prototype.oB = function () {
      return ht(this.Zx);
    };
    T.prototype.set_viterations = T.prototype.VD = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      it(c, a);
    };
    Object.defineProperty(T.prototype, "viterations", {
      get: T.prototype.oB,
      set: T.prototype.VD
    });
    T.prototype.get_piterations = T.prototype.mB = function () {
      return jt(this.Zx);
    };
    T.prototype.set_piterations = T.prototype.TD = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      kt(c, a);
    };
    Object.defineProperty(T.prototype, "piterations", {
      get: T.prototype.mB,
      set: T.prototype.TD
    });
    T.prototype.get_diterations = T.prototype.Oy = function () {
      return lt(this.Zx);
    };
    T.prototype.set_diterations = T.prototype.vB = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      mt(c, a);
    };
    Object.defineProperty(T.prototype, "diterations", {
      get: T.prototype.Oy,
      set: T.prototype.vB
    });
    T.prototype.get_citerations = T.prototype.My = function () {
      return nt(this.Zx);
    };
    T.prototype.set_citerations = T.prototype.tB = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      ot(c, a);
    };
    Object.defineProperty(T.prototype, "citerations", {
      get: T.prototype.My,
      set: T.prototype.tB
    });
    T.prototype.get_collisions = T.prototype.Ny = function () {
      return pt(this.Zx);
    };
    T.prototype.set_collisions = T.prototype.uB = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      qt(c, a);
    };
    Object.defineProperty(T.prototype, "collisions", {
      get: T.prototype.Ny,
      set: T.prototype.uB
    });
    T.prototype.__destroy__ = function () {
      rt(this.Zx);
    };
    function Node() {
      throw "cannot construct a Node, no constructor in IDL";
    }
    Node.prototype = Object.create(g.prototype);
    Node.prototype.constructor = Node;
    Node.prototype.$x = Node;
    Node.ay = {};
    b.Node = Node;
    Node.prototype.get_m_x = Node.prototype.kB = function () {
      return k(st(this.Zx), p);
    };
    Node.prototype.set_m_x = Node.prototype.RD = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      tt(c, a);
    };
    Object.defineProperty(Node.prototype, "m_x", {
      get: Node.prototype.kB,
      set: Node.prototype.RD
    });
    Node.prototype.get_m_q = Node.prototype.CA = function () {
      return k(ut(this.Zx), p);
    };
    Node.prototype.set_m_q = Node.prototype.iD = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      vt(c, a);
    };
    Object.defineProperty(Node.prototype, "m_q", {
      get: Node.prototype.CA,
      set: Node.prototype.iD
    });
    Node.prototype.get_m_v = Node.prototype.cB = function () {
      return k(wt(this.Zx), p);
    };
    Node.prototype.set_m_v = Node.prototype.JD = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      xt(c, a);
    };
    Object.defineProperty(Node.prototype, "m_v", {
      get: Node.prototype.cB,
      set: Node.prototype.JD
    });
    Node.prototype.get_m_f = Node.prototype.Pz = function () {
      return k(yt(this.Zx), p);
    };
    Node.prototype.set_m_f = Node.prototype.vC = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      zt(c, a);
    };
    Object.defineProperty(Node.prototype, "m_f", {
      get: Node.prototype.Pz,
      set: Node.prototype.vC
    });
    Node.prototype.get_m_n = Node.prototype.tA = function () {
      return k(At(this.Zx), p);
    };
    Node.prototype.set_m_n = Node.prototype.$C = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Bt(c, a);
    };
    Object.defineProperty(Node.prototype, "m_n", {
      get: Node.prototype.tA,
      set: Node.prototype.$C
    });
    Node.prototype.get_m_im = Node.prototype.dA = function () {
      return Ct(this.Zx);
    };
    Node.prototype.set_m_im = Node.prototype.KC = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Dt(c, a);
    };
    Object.defineProperty(Node.prototype, "m_im", {
      get: Node.prototype.dA,
      set: Node.prototype.KC
    });
    Node.prototype.get_m_area = Node.prototype.pz = function () {
      return Et(this.Zx);
    };
    Node.prototype.set_m_area = Node.prototype.XB = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Ft(c, a);
    };
    Object.defineProperty(Node.prototype, "m_area", {
      get: Node.prototype.pz,
      set: Node.prototype.XB
    });
    Node.prototype.__destroy__ = function () {
      Gt(this.Zx);
    };
    function MB() {
      this.Zx = Ht();
      h(MB)[this.Zx] = this;
    }
    MB.prototype = Object.create(g.prototype);
    MB.prototype.constructor = MB;
    MB.prototype.$x = MB;
    MB.ay = {};
    b.btGhostPairCallback = MB;
    MB.prototype.__destroy__ = function () {
      It(this.Zx);
    };
    function NB() {
      throw "cannot construct a btOverlappingPairCallback, no constructor in IDL";
    }
    NB.prototype = Object.create(g.prototype);
    NB.prototype.constructor = NB;
    NB.prototype.$x = NB;
    NB.ay = {};
    b.btOverlappingPairCallback = NB;
    NB.prototype.__destroy__ = function () {
      Jt(this.Zx);
    };
    function U(a, c, d, e) {
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      if (d && typeof d === "object") {
        d = d.Zx;
      }
      if (e && typeof e === "object") {
        e = e.Zx;
      }
      this.Zx = e === undefined ? Kt(a, c, d) : Lt(a, c, d, e);
      h(U)[this.Zx] = this;
    }
    U.prototype = Object.create(QA.prototype);
    U.prototype.constructor = U;
    U.prototype.$x = U;
    U.ay = {};
    b.btKinematicCharacterController = U;
    U.prototype.setUpAxis = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Mt(c, a);
    };
    U.prototype.setWalkDirection = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Nt(c, a);
    };
    U.prototype.setVelocityForTimeInterval = function (a, c) {
      var d = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      Ot(d, a, c);
    };
    U.prototype.warp = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Pt(c, a);
    };
    U.prototype.preStep = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Qt(c, a);
    };
    U.prototype.playerStep = function (a, c) {
      var d = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      Rt(d, a, c);
    };
    U.prototype.setFallSpeed = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      St(c, a);
    };
    U.prototype.setJumpSpeed = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Tt(c, a);
    };
    U.prototype.setMaxJumpHeight = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Ut(c, a);
    };
    U.prototype.canJump = function () {
      return !!Vt(this.Zx);
    };
    U.prototype.jump = function () {
      Wt(this.Zx);
    };
    U.prototype.setGravity = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Xt(c, a);
    };
    U.prototype.getGravity = function () {
      return Yt(this.Zx);
    };
    U.prototype.setMaxSlope = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Zt(c, a);
    };
    U.prototype.getMaxSlope = function () {
      return $t(this.Zx);
    };
    U.prototype.getGhostObject = function () {
      return k(au(this.Zx), V);
    };
    U.prototype.setUseGhostSweepTest = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      bu(c, a);
    };
    U.prototype.onGround = function () {
      return !!cu(this.Zx);
    };
    U.prototype.setUpInterpolate = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      du(c, a);
    };
    U.prototype.updateAction = function (a, c) {
      var d = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      eu(d, a, c);
    };
    U.prototype.__destroy__ = function () {
      fu(this.Zx);
    };
    function OB() {
      throw "cannot construct a btSoftBodyArray, no constructor in IDL";
    }
    OB.prototype = Object.create(g.prototype);
    OB.prototype.constructor = OB;
    OB.prototype.$x = OB;
    OB.ay = {};
    b.btSoftBodyArray = OB;
    OB.prototype.size = OB.prototype.size = function () {
      return gu(this.Zx);
    };
    OB.prototype.at = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      return k(hu(c, a), S);
    };
    OB.prototype.__destroy__ = function () {
      iu(this.Zx);
    };
    function GB() {
      throw "cannot construct a btFaceArray, no constructor in IDL";
    }
    GB.prototype = Object.create(g.prototype);
    GB.prototype.constructor = GB;
    GB.prototype.$x = GB;
    GB.ay = {};
    b.btFaceArray = GB;
    GB.prototype.size = GB.prototype.size = function () {
      return ju(this.Zx);
    };
    GB.prototype.at = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      return k(ku(c, a), PB);
    };
    GB.prototype.__destroy__ = function () {
      lu(this.Zx);
    };
    function QB(a, c) {
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      this.Zx = mu(a, c);
      h(QB)[this.Zx] = this;
    }
    QB.prototype = Object.create(LA.prototype);
    QB.prototype.constructor = QB;
    QB.prototype.$x = QB;
    QB.ay = {};
    b.btStaticPlaneShape = QB;
    QB.prototype.setLocalScaling = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      nu(c, a);
    };
    QB.prototype.getLocalScaling = function () {
      return k(ou(this.Zx), p);
    };
    QB.prototype.calculateLocalInertia = function (a, c) {
      var d = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      pu(d, a, c);
    };
    QB.prototype.__destroy__ = function () {
      qu(this.Zx);
    };
    function GA() {
      throw "cannot construct a btOverlappingPairCache, no constructor in IDL";
    }
    GA.prototype = Object.create(g.prototype);
    GA.prototype.constructor = GA;
    GA.prototype.$x = GA;
    GA.ay = {};
    b.btOverlappingPairCache = GA;
    GA.prototype.setInternalGhostPairCallback = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      ru(c, a);
    };
    GA.prototype.getNumOverlappingPairs = function () {
      return su(this.Zx);
    };
    GA.prototype.__destroy__ = function () {
      tu(this.Zx);
    };
    function mB() {
      throw "cannot construct a btIndexedMesh, no constructor in IDL";
    }
    mB.prototype = Object.create(g.prototype);
    mB.prototype.constructor = mB;
    mB.prototype.$x = mB;
    mB.ay = {};
    b.btIndexedMesh = mB;
    mB.prototype.get_m_numTriangles = mB.prototype.yA = function () {
      return uu(this.Zx);
    };
    mB.prototype.set_m_numTriangles = mB.prototype.eD = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      vu(c, a);
    };
    Object.defineProperty(mB.prototype, "m_numTriangles", {
      get: mB.prototype.yA,
      set: mB.prototype.eD
    });
    mB.prototype.__destroy__ = function () {
      wu(this.Zx);
    };
    function W(a, c, d, e, f) {
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      if (d && typeof d === "object") {
        d = d.Zx;
      }
      if (e && typeof e === "object") {
        e = e.Zx;
      }
      if (f && typeof f === "object") {
        f = f.Zx;
      }
      this.Zx = xu(a, c, d, e, f);
      h(W)[this.Zx] = this;
    }
    W.prototype = Object.create(x.prototype);
    W.prototype.constructor = W;
    W.prototype.$x = W;
    W.ay = {};
    b.btSoftRigidDynamicsWorld = W;
    W.prototype.addSoftBody = function (a, c, d) {
      var e = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      if (d && typeof d === "object") {
        d = d.Zx;
      }
      yu(e, a, c, d);
    };
    W.prototype.removeSoftBody = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      zu(c, a);
    };
    W.prototype.removeCollisionObject = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Au(c, a);
    };
    W.prototype.getWorldInfo = function () {
      return k(Bu(this.Zx), J);
    };
    W.prototype.getSoftBodyArray = function () {
      return k(Cu(this.Zx), OB);
    };
    W.prototype.getDispatcher = function () {
      return k(Du(this.Zx), FA);
    };
    W.prototype.rayTest = function (a, c, d) {
      var e = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      if (d && typeof d === "object") {
        d = d.Zx;
      }
      Eu(e, a, c, d);
    };
    W.prototype.getPairCache = function () {
      return k(Fu(this.Zx), GA);
    };
    W.prototype.getDispatchInfo = function () {
      return k(Gu(this.Zx), l);
    };
    W.prototype.addCollisionObject = function (a, c, d) {
      var e = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      if (d && typeof d === "object") {
        d = d.Zx;
      }
      if (c === undefined) {
        Hu(e, a);
      } else if (d === undefined) {
        Iu(e, a, c);
      } else {
        Ju(e, a, c, d);
      }
    };
    W.prototype.getBroadphase = function () {
      return k(Ku(this.Zx), HA);
    };
    W.prototype.convexSweepTest = function (a, c, d, e, f) {
      var m = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      if (d && typeof d === "object") {
        d = d.Zx;
      }
      if (e && typeof e === "object") {
        e = e.Zx;
      }
      if (f && typeof f === "object") {
        f = f.Zx;
      }
      Lu(m, a, c, d, e, f);
    };
    W.prototype.contactPairTest = function (a, c, d) {
      var e = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      if (d && typeof d === "object") {
        d = d.Zx;
      }
      Mu(e, a, c, d);
    };
    W.prototype.contactTest = function (a, c) {
      var d = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      Nu(d, a, c);
    };
    W.prototype.updateSingleAabb = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Ou(c, a);
    };
    W.prototype.setDebugDrawer = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Pu(c, a);
    };
    W.prototype.getDebugDrawer = function () {
      return k(Qu(this.Zx), IA);
    };
    W.prototype.debugDrawWorld = function () {
      Ru(this.Zx);
    };
    W.prototype.debugDrawObject = function (a, c, d) {
      var e = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      if (d && typeof d === "object") {
        d = d.Zx;
      }
      Su(e, a, c, d);
    };
    W.prototype.setGravity = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Tu(c, a);
    };
    W.prototype.getGravity = function () {
      return k(Uu(this.Zx), p);
    };
    W.prototype.addRigidBody = function (a, c, d) {
      var e = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      if (d && typeof d === "object") {
        d = d.Zx;
      }
      if (c === undefined) {
        Vu(e, a);
      } else if (d === undefined) {
        _emscripten_bind_btSoftRigidDynamicsWorld_addRigidBody_2(e, a, c);
      } else {
        Wu(e, a, c, d);
      }
    };
    W.prototype.removeRigidBody = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Xu(c, a);
    };
    W.prototype.addConstraint = function (a, c) {
      var d = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      if (c === undefined) {
        Yu(d, a);
      } else {
        Zu(d, a, c);
      }
    };
    W.prototype.removeConstraint = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      $u(c, a);
    };
    W.prototype.stepSimulation = function (a, c, d) {
      var e = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      if (d && typeof d === "object") {
        d = d.Zx;
      }
      if (c === undefined) {
        return av(e, a);
      } else if (d === undefined) {
        return bv(e, a, c);
      } else {
        return cv(e, a, c, d);
      }
    };
    W.prototype.setContactAddedCallback = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      dv(c, a);
    };
    W.prototype.setContactProcessedCallback = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      ev(c, a);
    };
    W.prototype.setContactDestroyedCallback = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      fv(c, a);
    };
    W.prototype.addAction = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      gv(c, a);
    };
    W.prototype.removeAction = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      hv(c, a);
    };
    W.prototype.getSolverInfo = function () {
      return k(iv(this.Zx), v);
    };
    W.prototype.setInternalTickCallback = function (a, c, d) {
      var e = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      if (d && typeof d === "object") {
        d = d.Zx;
      }
      if (c === undefined) {
        jv(e, a);
      } else if (d === undefined) {
        kv(e, a, c);
      } else {
        lv(e, a, c, d);
      }
    };
    W.prototype.__destroy__ = function () {
      mv(this.Zx);
    };
    function RB(a, c, d, e) {
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      if (d && typeof d === "object") {
        d = d.Zx;
      }
      if (e && typeof e === "object") {
        e = e.Zx;
      }
      this.Zx = nv(a, c, d, e);
      h(RB)[this.Zx] = this;
    }
    RB.prototype = Object.create(KA.prototype);
    RB.prototype.constructor = RB;
    RB.prototype.$x = RB;
    RB.ay = {};
    b.btFixedConstraint = RB;
    RB.prototype.enableFeedback = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      ov(c, a);
    };
    RB.prototype.getBreakingImpulseThreshold = function () {
      return pv(this.Zx);
    };
    RB.prototype.setBreakingImpulseThreshold = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      qv(c, a);
    };
    RB.prototype.getParam = function (a, c) {
      var d = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      return rv(d, a, c);
    };
    RB.prototype.setParam = function (a, c, d) {
      var e = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      if (d && typeof d === "object") {
        d = d.Zx;
      }
      sv(e, a, c, d);
    };
    RB.prototype.__destroy__ = function () {
      tv(this.Zx);
    };
    function r(a, c) {
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      this.Zx = a === undefined ? uv() : c === undefined ? _emscripten_bind_btTransform_btTransform_1(a) : vv(a, c);
      h(r)[this.Zx] = this;
    }
    r.prototype = Object.create(g.prototype);
    r.prototype.constructor = r;
    r.prototype.$x = r;
    r.ay = {};
    b.btTransform = r;
    r.prototype.setIdentity = function () {
      wv(this.Zx);
    };
    r.prototype.setOrigin = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      xv(c, a);
    };
    r.prototype.setRotation = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      yv(c, a);
    };
    r.prototype.getOrigin = function () {
      return k(zv(this.Zx), p);
    };
    r.prototype.getRotation = function () {
      return k(Av(this.Zx), X);
    };
    r.prototype.getBasis = function () {
      return k(Bv(this.Zx), aB);
    };
    r.prototype.setFromOpenGLMatrix = function (a) {
      var c = this.Zx;
      zA();
      if (typeof a == "object") {
        a = DA(a);
      }
      Cv(c, a);
    };
    r.prototype.inverse = r.prototype.inverse = function () {
      return k(Dv(this.Zx), r);
    };
    r.prototype.op_mul = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      return k(Ev(c, a), r);
    };
    r.prototype.__destroy__ = function () {
      Fv(this.Zx);
    };
    function Y(a, c) {
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      this.Zx = Gv(a, c);
      h(Y)[this.Zx] = this;
    }
    Y.prototype = Object.create(z.prototype);
    Y.prototype.constructor = Y;
    Y.prototype.$x = Y;
    Y.ay = {};
    b.ClosestRayResultCallback = Y;
    Y.prototype.hasHit = function () {
      return !!Hv(this.Zx);
    };
    Y.prototype.get_m_rayFromWorld = Y.prototype.xy = function () {
      return k(Iv(this.Zx), p);
    };
    Y.prototype.set_m_rayFromWorld = Y.prototype.Ey = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Jv(c, a);
    };
    Object.defineProperty(Y.prototype, "m_rayFromWorld", {
      get: Y.prototype.xy,
      set: Y.prototype.Ey
    });
    Y.prototype.get_m_rayToWorld = Y.prototype.yy = function () {
      return k(Kv(this.Zx), p);
    };
    Y.prototype.set_m_rayToWorld = Y.prototype.Fy = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Lv(c, a);
    };
    Object.defineProperty(Y.prototype, "m_rayToWorld", {
      get: Y.prototype.yy,
      set: Y.prototype.Fy
    });
    Y.prototype.get_m_hitNormalWorld = Y.prototype.jy = function () {
      return k(Mv(this.Zx), p);
    };
    Y.prototype.set_m_hitNormalWorld = Y.prototype.qy = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Nv(c, a);
    };
    Object.defineProperty(Y.prototype, "m_hitNormalWorld", {
      get: Y.prototype.jy,
      set: Y.prototype.qy
    });
    Y.prototype.get_m_hitPointWorld = Y.prototype.ky = function () {
      return k(Ov(this.Zx), p);
    };
    Y.prototype.set_m_hitPointWorld = Y.prototype.ry = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Pv(c, a);
    };
    Object.defineProperty(Y.prototype, "m_hitPointWorld", {
      get: Y.prototype.ky,
      set: Y.prototype.ry
    });
    Y.prototype.get_m_collisionFilterGroup = Y.prototype.by = function () {
      return Qv(this.Zx);
    };
    Y.prototype.set_m_collisionFilterGroup = Y.prototype.dy = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Rv(c, a);
    };
    Object.defineProperty(Y.prototype, "m_collisionFilterGroup", {
      get: Y.prototype.by,
      set: Y.prototype.dy
    });
    Y.prototype.get_m_collisionFilterMask = Y.prototype.cy = function () {
      return Sv(this.Zx);
    };
    Y.prototype.set_m_collisionFilterMask = Y.prototype.ey = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Tv(c, a);
    };
    Object.defineProperty(Y.prototype, "m_collisionFilterMask", {
      get: Y.prototype.cy,
      set: Y.prototype.ey
    });
    Y.prototype.get_m_closestHitFraction = Y.prototype.fy = function () {
      return Uv(this.Zx);
    };
    Y.prototype.set_m_closestHitFraction = Y.prototype.gy = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Vv(c, a);
    };
    Object.defineProperty(Y.prototype, "m_closestHitFraction", {
      get: Y.prototype.fy,
      set: Y.prototype.gy
    });
    Y.prototype.get_m_collisionObject = Y.prototype.hy = function () {
      return k(Wv(this.Zx), q);
    };
    Y.prototype.set_m_collisionObject = Y.prototype.oy = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Xv(c, a);
    };
    Object.defineProperty(Y.prototype, "m_collisionObject", {
      get: Y.prototype.hy,
      set: Y.prototype.oy
    });
    Y.prototype.__destroy__ = function () {
      Yv(this.Zx);
    };
    function SB(a) {
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      this.Zx = a === undefined ? Zv() : $v(a);
      h(SB)[this.Zx] = this;
    }
    SB.prototype = Object.create(NA.prototype);
    SB.prototype.constructor = SB;
    SB.prototype.$x = SB;
    SB.ay = {};
    b.btSoftBodyRigidBodyCollisionConfiguration = SB;
    SB.prototype.__destroy__ = function () {
      aw(this.Zx);
    };
    function TB() {
      this.Zx = bw();
      h(TB)[this.Zx] = this;
    }
    TB.prototype = Object.create(ZA.prototype);
    TB.prototype.constructor = TB;
    TB.prototype.$x = TB;
    TB.ay = {};
    b.ConcreteContactResultCallback = TB;
    TB.prototype.addSingleResult = function (a, c, d, e, f, m, C) {
      var P = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      if (d && typeof d === "object") {
        d = d.Zx;
      }
      if (e && typeof e === "object") {
        e = e.Zx;
      }
      if (f && typeof f === "object") {
        f = f.Zx;
      }
      if (m && typeof m === "object") {
        m = m.Zx;
      }
      if (C && typeof C === "object") {
        C = C.Zx;
      }
      return cw(P, a, c, d, e, f, m, C);
    };
    TB.prototype.__destroy__ = function () {
      dw(this.Zx);
    };
    function UB(a, c, d) {
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      if (d && typeof d === "object") {
        d = d.Zx;
      }
      this.Zx = d === undefined ? ew(a, c) : fw(a, c, d);
      h(UB)[this.Zx] = this;
    }
    UB.prototype = Object.create(OA.prototype);
    UB.prototype.constructor = UB;
    UB.prototype.$x = UB;
    UB.ay = {};
    b.btBvhTriangleMeshShape = UB;
    UB.prototype.setLocalScaling = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      gw(c, a);
    };
    UB.prototype.getLocalScaling = function () {
      return k(hw(this.Zx), p);
    };
    UB.prototype.calculateLocalInertia = function (a, c) {
      var d = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      iw(d, a, c);
    };
    UB.prototype.__destroy__ = function () {
      jw(this.Zx);
    };
    function fB() {
      throw "cannot construct a btConstCollisionObjectArray, no constructor in IDL";
    }
    fB.prototype = Object.create(g.prototype);
    fB.prototype.constructor = fB;
    fB.prototype.$x = fB;
    fB.ay = {};
    b.btConstCollisionObjectArray = fB;
    fB.prototype.size = fB.prototype.size = function () {
      return kw(this.Zx);
    };
    fB.prototype.at = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      return k(lw(c, a), q);
    };
    fB.prototype.__destroy__ = function () {
      mw(this.Zx);
    };
    function VB(a, c, d, e, f) {
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      if (d && typeof d === "object") {
        d = d.Zx;
      }
      if (e && typeof e === "object") {
        e = e.Zx;
      }
      if (f && typeof f === "object") {
        f = f.Zx;
      }
      this.Zx = e === undefined ? nw(a, c, d) : f === undefined ? _emscripten_bind_btSliderConstraint_btSliderConstraint_4(a, c, d, e) : ow(a, c, d, e, f);
      h(VB)[this.Zx] = this;
    }
    VB.prototype = Object.create(KA.prototype);
    VB.prototype.constructor = VB;
    VB.prototype.$x = VB;
    VB.ay = {};
    b.btSliderConstraint = VB;
    VB.prototype.setLowerLinLimit = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      pw(c, a);
    };
    VB.prototype.setUpperLinLimit = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      qw(c, a);
    };
    VB.prototype.setLowerAngLimit = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      rw(c, a);
    };
    VB.prototype.setUpperAngLimit = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      sw(c, a);
    };
    VB.prototype.enableFeedback = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      tw(c, a);
    };
    VB.prototype.getBreakingImpulseThreshold = function () {
      return uw(this.Zx);
    };
    VB.prototype.setBreakingImpulseThreshold = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      vw(c, a);
    };
    VB.prototype.getParam = function (a, c) {
      var d = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      return ww(d, a, c);
    };
    VB.prototype.setParam = function (a, c, d) {
      var e = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      if (d && typeof d === "object") {
        d = d.Zx;
      }
      xw(e, a, c, d);
    };
    VB.prototype.__destroy__ = function () {
      yw(this.Zx);
    };
    function V() {
      this.Zx = zw();
      h(V)[this.Zx] = this;
    }
    V.prototype = Object.create(w.prototype);
    V.prototype.constructor = V;
    V.prototype.$x = V;
    V.ay = {};
    b.btPairCachingGhostObject = V;
    V.prototype.setAnisotropicFriction = function (a, c) {
      var d = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      Aw(d, a, c);
    };
    V.prototype.getCollisionShape = function () {
      return k(Bw(this.Zx), n);
    };
    V.prototype.setContactProcessingThreshold = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Cw(c, a);
    };
    V.prototype.setActivationState = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Dw(c, a);
    };
    V.prototype.forceActivationState = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Ew(c, a);
    };
    V.prototype.activate = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (a === undefined) {
        Fw(c);
      } else {
        Gw(c, a);
      }
    };
    V.prototype.isActive = function () {
      return !!Hw(this.Zx);
    };
    V.prototype.isKinematicObject = function () {
      return !!Iw(this.Zx);
    };
    V.prototype.isStaticObject = function () {
      return !!Jw(this.Zx);
    };
    V.prototype.isStaticOrKinematicObject = function () {
      return !!Kw(this.Zx);
    };
    V.prototype.getRestitution = function () {
      return Lw(this.Zx);
    };
    V.prototype.getFriction = function () {
      return Mw(this.Zx);
    };
    V.prototype.getRollingFriction = function () {
      return Nw(this.Zx);
    };
    V.prototype.setRestitution = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Ow(c, a);
    };
    V.prototype.setFriction = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Pw(c, a);
    };
    V.prototype.setRollingFriction = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Qw(c, a);
    };
    V.prototype.getWorldTransform = function () {
      return k(Rw(this.Zx), r);
    };
    V.prototype.getCollisionFlags = function () {
      return Sw(this.Zx);
    };
    V.prototype.setCollisionFlags = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Tw(c, a);
    };
    V.prototype.setWorldTransform = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Uw(c, a);
    };
    V.prototype.setCollisionShape = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Vw(c, a);
    };
    V.prototype.setCcdMotionThreshold = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Ww(c, a);
    };
    V.prototype.setCcdSweptSphereRadius = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Xw(c, a);
    };
    V.prototype.getUserIndex = function () {
      return Yw(this.Zx);
    };
    V.prototype.setUserIndex = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Zw(c, a);
    };
    V.prototype.getUserPointer = function () {
      return k($w(this.Zx), JA);
    };
    V.prototype.setUserPointer = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      ax(c, a);
    };
    V.prototype.getBroadphaseHandle = function () {
      return k(bx(this.Zx), t);
    };
    V.prototype.getNumOverlappingObjects = function () {
      return cx(this.Zx);
    };
    V.prototype.getOverlappingObject = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      return k(dx(c, a), q);
    };
    V.prototype.__destroy__ = function () {
      ex(this.Zx);
    };
    function E() {
      throw "cannot construct a btManifoldPoint, no constructor in IDL";
    }
    E.prototype = Object.create(g.prototype);
    E.prototype.constructor = E;
    E.prototype.$x = E;
    E.ay = {};
    b.btManifoldPoint = E;
    E.prototype.getPositionWorldOnA = function () {
      return k(fx(this.Zx), p);
    };
    E.prototype.getPositionWorldOnB = function () {
      return k(gx(this.Zx), p);
    };
    E.prototype.getAppliedImpulse = function () {
      return hx(this.Zx);
    };
    E.prototype.getDistance = function () {
      return ix(this.Zx);
    };
    E.prototype.get_m_localPointA = E.prototype.oA = function () {
      return k(jx(this.Zx), p);
    };
    E.prototype.set_m_localPointA = E.prototype.VC = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      kx(c, a);
    };
    Object.defineProperty(E.prototype, "m_localPointA", {
      get: E.prototype.oA,
      set: E.prototype.VC
    });
    E.prototype.get_m_localPointB = E.prototype.pA = function () {
      return k(lx(this.Zx), p);
    };
    E.prototype.set_m_localPointB = E.prototype.WC = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      mx(c, a);
    };
    Object.defineProperty(E.prototype, "m_localPointB", {
      get: E.prototype.pA,
      set: E.prototype.WC
    });
    E.prototype.get_m_positionWorldOnB = E.prototype.BA = function () {
      return k(nx(this.Zx), p);
    };
    E.prototype.set_m_positionWorldOnB = E.prototype.hD = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      ox(c, a);
    };
    Object.defineProperty(E.prototype, "m_positionWorldOnB", {
      get: E.prototype.BA,
      set: E.prototype.hD
    });
    E.prototype.get_m_positionWorldOnA = E.prototype.AA = function () {
      return k(px(this.Zx), p);
    };
    E.prototype.set_m_positionWorldOnA = E.prototype.gD = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      qx(c, a);
    };
    Object.defineProperty(E.prototype, "m_positionWorldOnA", {
      get: E.prototype.AA,
      set: E.prototype.gD
    });
    E.prototype.get_m_normalWorldOnB = E.prototype.wA = function () {
      return k(rx(this.Zx), p);
    };
    E.prototype.set_m_normalWorldOnB = E.prototype.cD = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      sx(c, a);
    };
    Object.defineProperty(E.prototype, "m_normalWorldOnB", {
      get: E.prototype.wA,
      set: E.prototype.cD
    });
    E.prototype.get_m_userPersistentData = E.prototype.bB = function () {
      return tx(this.Zx);
    };
    E.prototype.set_m_userPersistentData = E.prototype.ID = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      ux(c, a);
    };
    Object.defineProperty(E.prototype, "m_userPersistentData", {
      get: E.prototype.bB,
      set: E.prototype.ID
    });
    E.prototype.__destroy__ = function () {
      vx(this.Zx);
    };
    function WB(a, c, d, e) {
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      if (d && typeof d === "object") {
        d = d.Zx;
      }
      if (e && typeof e === "object") {
        e = e.Zx;
      }
      this.Zx = d === undefined ? wx(a, c) : e === undefined ? _emscripten_bind_btPoint2PointConstraint_btPoint2PointConstraint_3(a, c, d) : xx(a, c, d, e);
      h(WB)[this.Zx] = this;
    }
    WB.prototype = Object.create(KA.prototype);
    WB.prototype.constructor = WB;
    WB.prototype.$x = WB;
    WB.ay = {};
    b.btPoint2PointConstraint = WB;
    WB.prototype.setPivotA = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      yx(c, a);
    };
    WB.prototype.setPivotB = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      zx(c, a);
    };
    WB.prototype.getPivotInA = function () {
      return k(Ax(this.Zx), p);
    };
    WB.prototype.getPivotInB = function () {
      return k(Bx(this.Zx), p);
    };
    WB.prototype.enableFeedback = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Cx(c, a);
    };
    WB.prototype.getBreakingImpulseThreshold = function () {
      return Dx(this.Zx);
    };
    WB.prototype.setBreakingImpulseThreshold = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Ex(c, a);
    };
    WB.prototype.getParam = function (a, c) {
      var d = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      return Fx(d, a, c);
    };
    WB.prototype.setParam = function (a, c, d) {
      var e = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      if (d && typeof d === "object") {
        d = d.Zx;
      }
      Gx(e, a, c, d);
    };
    WB.prototype.get_m_setting = WB.prototype.IA = function () {
      return k(Hx(this.Zx), H);
    };
    WB.prototype.set_m_setting = WB.prototype.oD = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Ix(c, a);
    };
    Object.defineProperty(WB.prototype, "m_setting", {
      get: WB.prototype.IA,
      set: WB.prototype.oD
    });
    WB.prototype.__destroy__ = function () {
      Jx(this.Zx);
    };
    function XB() {
      this.Zx = Kx();
      h(XB)[this.Zx] = this;
    }
    XB.prototype = Object.create(g.prototype);
    XB.prototype.constructor = XB;
    XB.prototype.$x = XB;
    XB.ay = {};
    b.btSoftBodyHelpers = XB;
    XB.prototype.CreateRope = function (a, c, d, e, f) {
      var m = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      if (d && typeof d === "object") {
        d = d.Zx;
      }
      if (e && typeof e === "object") {
        e = e.Zx;
      }
      if (f && typeof f === "object") {
        f = f.Zx;
      }
      return k(Lx(m, a, c, d, e, f), S);
    };
    XB.prototype.CreatePatch = function (a, c, d, e, f, m, C, P, ia) {
      var nb = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      if (d && typeof d === "object") {
        d = d.Zx;
      }
      if (e && typeof e === "object") {
        e = e.Zx;
      }
      if (f && typeof f === "object") {
        f = f.Zx;
      }
      if (m && typeof m === "object") {
        m = m.Zx;
      }
      if (C && typeof C === "object") {
        C = C.Zx;
      }
      if (P && typeof P === "object") {
        P = P.Zx;
      }
      if (ia && typeof ia === "object") {
        ia = ia.Zx;
      }
      return k(Mx(nb, a, c, d, e, f, m, C, P, ia), S);
    };
    XB.prototype.CreatePatchUV = function (a, c, d, e, f, m, C, P, ia, nb) {
      var Wb = this.Zx;
      zA();
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      if (d && typeof d === "object") {
        d = d.Zx;
      }
      if (e && typeof e === "object") {
        e = e.Zx;
      }
      if (f && typeof f === "object") {
        f = f.Zx;
      }
      if (m && typeof m === "object") {
        m = m.Zx;
      }
      if (C && typeof C === "object") {
        C = C.Zx;
      }
      if (P && typeof P === "object") {
        P = P.Zx;
      }
      if (ia && typeof ia === "object") {
        ia = ia.Zx;
      }
      if (typeof nb == "object") {
        nb = DA(nb);
      }
      return k(Nx(Wb, a, c, d, e, f, m, C, P, ia, nb), S);
    };
    XB.prototype.CreateEllipsoid = function (a, c, d, e) {
      var f = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      if (d && typeof d === "object") {
        d = d.Zx;
      }
      if (e && typeof e === "object") {
        e = e.Zx;
      }
      return k(Ox(f, a, c, d, e), S);
    };
    XB.prototype.CreateFromTriMesh = function (a, c, d, e, f) {
      var m = this.Zx;
      zA();
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (typeof c == "object") {
        c = DA(c);
      }
      if (typeof d == "object" && typeof d === "object") {
        var C = AA(d, Ba);
        BA(d, Ba, C);
        d = C;
      }
      if (e && typeof e === "object") {
        e = e.Zx;
      }
      if (f && typeof f === "object") {
        f = f.Zx;
      }
      return k(Px(m, a, c, d, e, f), S);
    };
    XB.prototype.CreateFromConvexHull = function (a, c, d, e) {
      var f = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      if (d && typeof d === "object") {
        d = d.Zx;
      }
      if (e && typeof e === "object") {
        e = e.Zx;
      }
      return k(Qx(f, a, c, d, e), S);
    };
    XB.prototype.__destroy__ = function () {
      Rx(this.Zx);
    };
    function t() {
      throw "cannot construct a btBroadphaseProxy, no constructor in IDL";
    }
    t.prototype = Object.create(g.prototype);
    t.prototype.constructor = t;
    t.prototype.$x = t;
    t.ay = {};
    b.btBroadphaseProxy = t;
    t.prototype.get_m_collisionFilterGroup = t.prototype.by = function () {
      return Sx(this.Zx);
    };
    t.prototype.set_m_collisionFilterGroup = t.prototype.dy = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Tx(c, a);
    };
    Object.defineProperty(t.prototype, "m_collisionFilterGroup", {
      get: t.prototype.by,
      set: t.prototype.dy
    });
    t.prototype.get_m_collisionFilterMask = t.prototype.cy = function () {
      return Ux(this.Zx);
    };
    t.prototype.set_m_collisionFilterMask = t.prototype.ey = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Vx(c, a);
    };
    Object.defineProperty(t.prototype, "m_collisionFilterMask", {
      get: t.prototype.cy,
      set: t.prototype.ey
    });
    t.prototype.__destroy__ = function () {
      Wx(this.Zx);
    };
    function KB() {
      throw "cannot construct a tNodeArray, no constructor in IDL";
    }
    KB.prototype = Object.create(g.prototype);
    KB.prototype.constructor = KB;
    KB.prototype.$x = KB;
    KB.ay = {};
    b.tNodeArray = KB;
    KB.prototype.size = KB.prototype.size = function () {
      return Xx(this.Zx);
    };
    KB.prototype.at = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      return k(Yx(c, a), Node);
    };
    KB.prototype.__destroy__ = function () {
      Zx(this.Zx);
    };
    function YB(a) {
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      this.Zx = $x(a);
      h(YB)[this.Zx] = this;
    }
    YB.prototype = Object.create(n.prototype);
    YB.prototype.constructor = YB;
    YB.prototype.$x = YB;
    YB.ay = {};
    b.btBoxShape = YB;
    YB.prototype.setMargin = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      ay(c, a);
    };
    YB.prototype.getMargin = function () {
      return by(this.Zx);
    };
    YB.prototype.setLocalScaling = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      cy(c, a);
    };
    YB.prototype.getLocalScaling = function () {
      return k(dy(this.Zx), p);
    };
    YB.prototype.calculateLocalInertia = function (a, c) {
      var d = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      ey(d, a, c);
    };
    YB.prototype.__destroy__ = function () {
      fy(this.Zx);
    };
    function PB() {
      throw "cannot construct a btFace, no constructor in IDL";
    }
    PB.prototype = Object.create(g.prototype);
    PB.prototype.constructor = PB;
    PB.prototype.$x = PB;
    PB.ay = {};
    b.btFace = PB;
    PB.prototype.get_m_indices = PB.prototype.fA = function () {
      return k(gy(this.Zx), LB);
    };
    PB.prototype.set_m_indices = PB.prototype.MC = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      hy(c, a);
    };
    Object.defineProperty(PB.prototype, "m_indices", {
      get: PB.prototype.fA,
      set: PB.prototype.MC
    });
    PB.prototype.get_m_plane = PB.prototype.zA = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      return iy(c, a);
    };
    PB.prototype.set_m_plane = PB.prototype.fD = function (a, c) {
      var d = this.Zx;
      zA();
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      jy(d, a, c);
    };
    Object.defineProperty(PB.prototype, "m_plane", {
      get: PB.prototype.zA,
      set: PB.prototype.fD
    });
    PB.prototype.__destroy__ = function () {
      ky(this.Zx);
    };
    function ZB() {
      this.Zx = ly();
      h(ZB)[this.Zx] = this;
    }
    ZB.prototype = Object.create(IA.prototype);
    ZB.prototype.constructor = ZB;
    ZB.prototype.$x = ZB;
    ZB.ay = {};
    b.DebugDrawer = ZB;
    ZB.prototype.drawLine = function (a, c, d) {
      var e = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      if (d && typeof d === "object") {
        d = d.Zx;
      }
      my(e, a, c, d);
    };
    ZB.prototype.drawContactPoint = function (a, c, d, e, f) {
      var m = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      if (d && typeof d === "object") {
        d = d.Zx;
      }
      if (e && typeof e === "object") {
        e = e.Zx;
      }
      if (f && typeof f === "object") {
        f = f.Zx;
      }
      ny(m, a, c, d, e, f);
    };
    ZB.prototype.reportErrorWarning = function (a) {
      var c = this.Zx;
      zA();
      a = a && typeof a === "object" ? a.Zx : CA(a);
      oy(c, a);
    };
    ZB.prototype.draw3dText = function (a, c) {
      var d = this.Zx;
      zA();
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      c = c && typeof c === "object" ? c.Zx : CA(c);
      py(d, a, c);
    };
    ZB.prototype.setDebugMode = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      qy(c, a);
    };
    ZB.prototype.getDebugMode = function () {
      return ry(this.Zx);
    };
    ZB.prototype.__destroy__ = function () {
      sy(this.Zx);
    };
    function $B(a, c) {
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      this.Zx = ty(a, c);
      h($B)[this.Zx] = this;
    }
    $B.prototype = Object.create(MA.prototype);
    $B.prototype.constructor = $B;
    $B.prototype.$x = $B;
    $B.ay = {};
    b.btCapsuleShapeX = $B;
    $B.prototype.setMargin = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      uy(c, a);
    };
    $B.prototype.getMargin = function () {
      return vy(this.Zx);
    };
    $B.prototype.getUpAxis = function () {
      return wy(this.Zx);
    };
    $B.prototype.getRadius = function () {
      return xy(this.Zx);
    };
    $B.prototype.getHalfHeight = function () {
      return yy(this.Zx);
    };
    $B.prototype.setLocalScaling = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      zy(c, a);
    };
    $B.prototype.getLocalScaling = function () {
      return k(Ay(this.Zx), p);
    };
    $B.prototype.calculateLocalInertia = function (a, c) {
      var d = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      By(d, a, c);
    };
    $B.prototype.__destroy__ = function () {
      Cy(this.Zx);
    };
    function X(a, c, d, e) {
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      if (d && typeof d === "object") {
        d = d.Zx;
      }
      if (e && typeof e === "object") {
        e = e.Zx;
      }
      this.Zx = Dy(a, c, d, e);
      h(X)[this.Zx] = this;
    }
    X.prototype = Object.create(SA.prototype);
    X.prototype.constructor = X;
    X.prototype.$x = X;
    X.ay = {};
    b.btQuaternion = X;
    X.prototype.setValue = function (a, c, d, e) {
      var f = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      if (d && typeof d === "object") {
        d = d.Zx;
      }
      if (e && typeof e === "object") {
        e = e.Zx;
      }
      Ey(f, a, c, d, e);
    };
    X.prototype.setEulerZYX = function (a, c, d) {
      var e = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      if (d && typeof d === "object") {
        d = d.Zx;
      }
      Fy(e, a, c, d);
    };
    X.prototype.setRotation = function (a, c) {
      var d = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      Gy(d, a, c);
    };
    X.prototype.normalize = X.prototype.normalize = function () {
      Hy(this.Zx);
    };
    X.prototype.length2 = function () {
      return Iy(this.Zx);
    };
    X.prototype.length = X.prototype.length = function () {
      return Jy(this.Zx);
    };
    X.prototype.dot = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      return Ky(c, a);
    };
    X.prototype.normalized = function () {
      return k(Ly(this.Zx), X);
    };
    X.prototype.getAxis = function () {
      return k(My(this.Zx), p);
    };
    X.prototype.inverse = X.prototype.inverse = function () {
      return k(Ny(this.Zx), X);
    };
    X.prototype.getAngle = function () {
      return Oy(this.Zx);
    };
    X.prototype.getAngleShortestPath = function () {
      return Py(this.Zx);
    };
    X.prototype.angle = X.prototype.angle = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      return Qy(c, a);
    };
    X.prototype.angleShortestPath = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      return Ry(c, a);
    };
    X.prototype.op_add = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      return k(Sy(c, a), X);
    };
    X.prototype.op_sub = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      return k(Ty(c, a), X);
    };
    X.prototype.op_mul = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      return k(Uy(c, a), X);
    };
    X.prototype.op_mulq = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      return k(Vy(c, a), X);
    };
    X.prototype.op_div = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      return k(Wy(c, a), X);
    };
    X.prototype.x = X.prototype.x = function () {
      return Xy(this.Zx);
    };
    X.prototype.y = X.prototype.y = function () {
      return Yy(this.Zx);
    };
    X.prototype.z = X.prototype.z = function () {
      return Zy(this.Zx);
    };
    X.prototype.w = function () {
      return $y(this.Zx);
    };
    X.prototype.setX = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      az(c, a);
    };
    X.prototype.setY = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      bz(c, a);
    };
    X.prototype.setZ = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      cz(c, a);
    };
    X.prototype.setW = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      dz(c, a);
    };
    X.prototype.__destroy__ = function () {
      ez(this.Zx);
    };
    function aC(a, c) {
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      this.Zx = fz(a, c);
      h(aC)[this.Zx] = this;
    }
    aC.prototype = Object.create(MA.prototype);
    aC.prototype.constructor = aC;
    aC.prototype.$x = aC;
    aC.ay = {};
    b.btCapsuleShapeZ = aC;
    aC.prototype.setMargin = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      gz(c, a);
    };
    aC.prototype.getMargin = function () {
      return hz(this.Zx);
    };
    aC.prototype.getUpAxis = function () {
      return iz(this.Zx);
    };
    aC.prototype.getRadius = function () {
      return jz(this.Zx);
    };
    aC.prototype.getHalfHeight = function () {
      return kz(this.Zx);
    };
    aC.prototype.setLocalScaling = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      lz(c, a);
    };
    aC.prototype.getLocalScaling = function () {
      return k(mz(this.Zx), p);
    };
    aC.prototype.calculateLocalInertia = function (a, c) {
      var d = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      nz(d, a, c);
    };
    aC.prototype.__destroy__ = function () {
      oz(this.Zx);
    };
    function v() {
      throw "cannot construct a btContactSolverInfo, no constructor in IDL";
    }
    v.prototype = Object.create(g.prototype);
    v.prototype.constructor = v;
    v.prototype.$x = v;
    v.ay = {};
    b.btContactSolverInfo = v;
    v.prototype.get_m_splitImpulse = v.prototype.LA = function () {
      return !!pz(this.Zx);
    };
    v.prototype.set_m_splitImpulse = v.prototype.rD = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      qz(c, a);
    };
    Object.defineProperty(v.prototype, "m_splitImpulse", {
      get: v.prototype.LA,
      set: v.prototype.rD
    });
    v.prototype.get_m_splitImpulsePenetrationThreshold = v.prototype.MA = function () {
      return rz(this.Zx);
    };
    v.prototype.set_m_splitImpulsePenetrationThreshold = v.prototype.sD = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      sz(c, a);
    };
    Object.defineProperty(v.prototype, "m_splitImpulsePenetrationThreshold", {
      get: v.prototype.MA,
      set: v.prototype.sD
    });
    v.prototype.get_m_numIterations = v.prototype.xA = function () {
      return tz(this.Zx);
    };
    v.prototype.set_m_numIterations = v.prototype.dD = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      uz(c, a);
    };
    Object.defineProperty(v.prototype, "m_numIterations", {
      get: v.prototype.xA,
      set: v.prototype.dD
    });
    v.prototype.__destroy__ = function () {
      vz(this.Zx);
    };
    function bC(a, c, d, e, f) {
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      if (d && typeof d === "object") {
        d = d.Zx;
      }
      if (e && typeof e === "object") {
        e = e.Zx;
      }
      if (f && typeof f === "object") {
        f = f.Zx;
      }
      this.Zx = e === undefined ? wz(a, c, d) : f === undefined ? _emscripten_bind_btGeneric6DofSpringConstraint_btGeneric6DofSpringConstraint_4(a, c, d, e) : xz(a, c, d, e, f);
      h(bC)[this.Zx] = this;
    }
    bC.prototype = Object.create(WA.prototype);
    bC.prototype.constructor = bC;
    bC.prototype.$x = bC;
    bC.ay = {};
    b.btGeneric6DofSpringConstraint = bC;
    bC.prototype.enableSpring = function (a, c) {
      var d = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      yz(d, a, c);
    };
    bC.prototype.setStiffness = function (a, c) {
      var d = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      zz(d, a, c);
    };
    bC.prototype.setDamping = function (a, c) {
      var d = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      Az(d, a, c);
    };
    bC.prototype.setEquilibriumPoint = function (a, c) {
      var d = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      if (a === undefined) {
        Bz(d);
      } else if (c === undefined) {
        Cz(d, a);
      } else {
        Dz(d, a, c);
      }
    };
    bC.prototype.setLinearLowerLimit = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Ez(c, a);
    };
    bC.prototype.setLinearUpperLimit = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Fz(c, a);
    };
    bC.prototype.setAngularLowerLimit = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Gz(c, a);
    };
    bC.prototype.setAngularUpperLimit = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Hz(c, a);
    };
    bC.prototype.getFrameOffsetA = function () {
      return k(Iz(this.Zx), r);
    };
    bC.prototype.enableFeedback = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Jz(c, a);
    };
    bC.prototype.getBreakingImpulseThreshold = function () {
      return Kz(this.Zx);
    };
    bC.prototype.setBreakingImpulseThreshold = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Lz(c, a);
    };
    bC.prototype.getParam = function (a, c) {
      var d = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      return Mz(d, a, c);
    };
    bC.prototype.setParam = function (a, c, d) {
      var e = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      if (d && typeof d === "object") {
        d = d.Zx;
      }
      Nz(e, a, c, d);
    };
    bC.prototype.__destroy__ = function () {
      Oz(this.Zx);
    };
    function cC(a) {
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      this.Zx = Pz(a);
      h(cC)[this.Zx] = this;
    }
    cC.prototype = Object.create(n.prototype);
    cC.prototype.constructor = cC;
    cC.prototype.$x = cC;
    cC.ay = {};
    b.btSphereShape = cC;
    cC.prototype.setMargin = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Qz(c, a);
    };
    cC.prototype.getMargin = function () {
      return Rz(this.Zx);
    };
    cC.prototype.setLocalScaling = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Sz(c, a);
    };
    cC.prototype.getLocalScaling = function () {
      return k(Tz(this.Zx), p);
    };
    cC.prototype.calculateLocalInertia = function (a, c) {
      var d = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      Uz(d, a, c);
    };
    cC.prototype.__destroy__ = function () {
      Vz(this.Zx);
    };
    function Z(a, c, d, e, f) {
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      if (c && typeof c === "object") {
        c = c.Zx;
      }
      if (d && typeof d === "object") {
        d = d.Zx;
      }
      if (e && typeof e === "object") {
        e = e.Zx;
      }
      if (f && typeof f === "object") {
        f = f.Zx;
      }
      this.Zx = Wz(a, c, d, e, f);
      h(Z)[this.Zx] = this;
    }
    Z.prototype = Object.create(g.prototype);
    Z.prototype.constructor = Z;
    Z.prototype.$x = Z;
    Z.ay = {};
    b.LocalConvexResult = Z;
    Z.prototype.get_m_hitCollisionObject = Z.prototype.Xz = function () {
      return k(Xz(this.Zx), q);
    };
    Z.prototype.set_m_hitCollisionObject = Z.prototype.DC = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      Yz(c, a);
    };
    Object.defineProperty(Z.prototype, "m_hitCollisionObject", {
      get: Z.prototype.Xz,
      set: Z.prototype.DC
    });
    Z.prototype.get_m_localShapeInfo = Z.prototype.qA = function () {
      return k(Zz(this.Zx), kB);
    };
    Z.prototype.set_m_localShapeInfo = Z.prototype.XC = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      $z(c, a);
    };
    Object.defineProperty(Z.prototype, "m_localShapeInfo", {
      get: Z.prototype.qA,
      set: Z.prototype.XC
    });
    Z.prototype.get_m_hitNormalLocal = Z.prototype.aA = function () {
      return k(aA(this.Zx), p);
    };
    Z.prototype.set_m_hitNormalLocal = Z.prototype.HC = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      bA(c, a);
    };
    Object.defineProperty(Z.prototype, "m_hitNormalLocal", {
      get: Z.prototype.aA,
      set: Z.prototype.HC
    });
    Z.prototype.get_m_hitPointLocal = Z.prototype.cA = function () {
      return k(cA(this.Zx), p);
    };
    Z.prototype.set_m_hitPointLocal = Z.prototype.JC = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      dA(c, a);
    };
    Object.defineProperty(Z.prototype, "m_hitPointLocal", {
      get: Z.prototype.cA,
      set: Z.prototype.JC
    });
    Z.prototype.get_m_hitFraction = Z.prototype.Yz = function () {
      return eA(this.Zx);
    };
    Z.prototype.set_m_hitFraction = Z.prototype.EC = function (a) {
      var c = this.Zx;
      if (a && typeof a === "object") {
        a = a.Zx;
      }
      fA(c, a);
    };
    Object.defineProperty(Z.prototype, "m_hitFraction", {
      get: Z.prototype.Yz,
      set: Z.prototype.EC
    });
    Z.prototype.__destroy__ = function () {
      gA(this.Zx);
    };
    (function () {
      function a() {
        b.BT_CONSTRAINT_ERP = hA();
        b.BT_CONSTRAINT_STOP_ERP = iA();
        b.BT_CONSTRAINT_CFM = jA();
        b.BT_CONSTRAINT_STOP_CFM = kA();
        b.PHY_FLOAT = lA();
        b.PHY_DOUBLE = mA();
        b.PHY_INTEGER = nA();
        b.PHY_SHORT = oA();
        b.PHY_FIXEDPOINT88 = pA();
        b.PHY_UCHAR = qA();
      }
      if (La) {
        a();
      } else {
        Ja.unshift(a);
      }
    })();
    this.Ammo = b;
    return Ammo;
  };
}();
if (typeof exports === "object" && typeof module === "object") {
  module.exports = Ammo;
} else if (typeof define === "function" && define.amd) {
  define([], function () {
    return Ammo;
  });
} else if (typeof exports === "object") {
  exports.Ammo = Ammo;
}