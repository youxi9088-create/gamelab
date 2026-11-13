(function () {
  "use strict";
  var IN_HOST = false;
  THREE.ColorManagement.legacyMode = false;
  var rand = function (a, b) {
    return a + Math.random() * (b - a);
  };
  var clamp = function (v, a, b) {
    return v < a ? a : v > b ? b : v;
  };
  var lerp = function (a, b, t) {
    return a + (b - a) * t;
  };
  var damp = function (a, b, l, dt) {
    return lerp(a, b, 1 - Math.exp(-l * dt));
  };
  var pick = function (arr) {
    return arr[Math.random() * arr.length | 0];
  };
  var seed = 1;
  function srand() {
    seed = seed * 16807 % 2147483647;
    return (seed - 1) / 2147483646;
  }
  var rr = function (a, b) {
    return a + srand() * (b - a);
  };
  var spick = function (arr) {
    return arr[srand() * arr.length | 0];
  };
  var easeOutBack = function (t) {
    var c = 1.9;
    return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2);
  };
  function hexRGB(h) {
    var n = parseInt(h.slice(1), 16);
    return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255];
  }
  var V1 = new THREE.Vector3(),
    V2 = new THREE.Vector3(),
    V3 = new THREE.Vector3(),
    V4 = new THREE.Vector3();
  var Q1 = new THREE.Quaternion(),
    Q2 = new THREE.Quaternion(),
    M1 = new THREE.Matrix4(),
    M2 = new THREE.Matrix4();
  var E1 = new THREE.Euler(),
    C1 = new THREE.Color();
  var now = 0;
  var SAVE_KEY = "tinyterror_v1";
  var save = {
    stars: [0, 0, 0, 0, 0],
    best: [0, 0, 0, 0, 0],
    skin: 0,
    music: true,
    sfx: true,
    seenIntro: 0
  };
  var PREFS = ["stars", "best", "skin", "music", "sfx", "seenIntro"];
  var AC = null;
  function loadSave() {
    try {
      var raw = localStorage.getItem(SAVE_KEY);
      if (raw) {
        var sv = JSON.parse(raw);
        PREFS.forEach(function (k2) {
          if (k2 in sv) save[k2] = sv[k2];
        });
      }
    } catch (e) {}
    fixSave();
    return Promise.resolve();
  }
  function fixSave() {
    ["stars", "best"].forEach(function (k) {
      if (!Array.isArray(save[k])) save[k] = [];
      while (save[k].length < STAGES.length) save[k].push(0);
      save[k] = save[k].slice(0, STAGES.length).map(function (v) {
        return v || 0;
      });
    });
  }
  function persist() {
    try {
      var prefs = {};
      PREFS.forEach(function (k) {
        prefs[k] = save[k];
      });
      localStorage.setItem(SAVE_KEY, JSON.stringify(prefs));
    } catch (e) {}
  }
  var HOST = {
    on: false,
    level: 1,
    count: 5,
    stars: null,
    reported: false,
    gotInfo: false
  };
  function starsFor(i) {
    if (HOST.stars) {
      var v = HOST.stars[i];
      if (v === undefined) v = HOST.stars[String(i + 1)];
      return v || 0;
    }
    return save.stars[i] || 0;
  }
  function totalStars() {
    var t = 0;
    for (var i = 0; i < STAGES.length; i++) t += starsFor(i);
    return t;
  }
  function readHostStars(p) {
    var ls = p && p.levelStars;
    if (!ls) return;
    var out = [];
    for (var i = 0; i < STAGES.length; i++) {
      var v = Array.isArray(ls) ? ls[i] : ls[String(i + 1)] !== undefined ? ls[String(i + 1)] : ls[i + 1];
      out.push(typeof v === "number" ? clamp(v | 0, 0, 3) : 0);
    }
    HOST.stars = out;
  }
  function applyGameInfo(data) {
    HOST.gotInfo = true;
    var lb = data && data.levelBased;
    if (lb) {
      if (typeof lb.levelCount === "number" && lb.levelCount > 0) HOST.count = lb.levelCount;
      var p = lb.progress || {};
      if (typeof p.currentLevelIndex === "number") HOST.level = clamp(p.currentLevelIndex | 0, 1, STAGES.length);
      readHostStars(p);
    }
    if (G_.mode === "menu") {
      selStage = HOST.level - 1;
      if (ready) {
        loadCity(selStage);
        menuPose();
      }
      renderMenu();
    }
  }
  var canvas = document.getElementById("c");
  var UA = navigator.userAgent || "";
  var COARSE = window.matchMedia && matchMedia("(pointer:coarse)").matches || /Android|iPhone|iPad|iPod|Mobile/i.test(UA);
  var CORES = navigator.hardwareConcurrency || (COARSE ? 4 : 8),
    DMEM = navigator.deviceMemory || (COARSE ? 3 : 8);
  var QT = [{
    pr: 2.0,
    shadow: 1024,
    soft: false,
    peds: 130,
    rim: 4.2,
    cheapPost: 1,
    sw: 0.78
  }, {
    pr: 2.0,
    shadow: 1024,
    soft: false,
    peds: 180,
    rim: 3.2,
    cheapPost: 0,
    sw: 0.88
  }, {
    pr: 2.0,
    shadow: 2048,
    soft: true,
    peds: 220,
    rim: 2.6,
    cheapPost: 0,
    sw: 1.0
  }];
  var Q = {
    tier: COARSE ? CORES <= 4 || DMEM <= 3 ? 0 : 1 : 2
  };
  var qArg = /[?&]q=([012])/.exec(location.search);
  if (qArg) Q.tier = +qArg[1];
  Q.boot = Q.tier;
  Q.s = QT[Q.tier];
  var MAXPIX = COARSE ? 720 * 1280 : 2300 * 1000;
  function pixelsFor(t) {
    return Math.max(0.75, Math.min(window.devicePixelRatio || 1, QT[t].pr, Math.sqrt(MAXPIX / Math.max(1, innerWidth * innerHeight))));
  }
  var WANT_POST = function () {
    var c = document.createElement("canvas"),
      g = c.getContext("webgl2");
    if (g) return true;
    g = c.getContext("webgl");
    return !!(g && g.getExtension("WEBGL_depth_texture"));
  }();
  var renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: !WANT_POST,
      powerPreference: "high-performance"
    });
  } catch (e) {
    var lm = document.getElementById("loadmsg");
    if (lm) lm.textContent = "This device could not start 3D graphics.";
    throw e;
  }
  var pixelRatio = pixelsFor(Q.tier);
  renderer.setPixelRatio(pixelRatio);
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.NoToneMapping;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = Q.s.soft ? THREE.PCFSoftShadowMap : THREE.PCFShadowMap;
  var scene = new THREE.Scene();
  var SKY = new THREE.Color("#8FD3F4");
  scene.background = SKY;
  scene.fog = new THREE.Fog(SKY, 80, 210);
  var camera = new THREE.PerspectiveCamera(48, 1, 0.3, 450);
  scene.add(new THREE.HemisphereLight("#F2F8FF", "#9C8A70", 0.62));
  var sun = new THREE.DirectionalLight("#FFF4E2", 1.05);
  sun.castShadow = true;
  sun.shadow.mapSize.set(Q.s.shadow, Q.s.shadow);
  sun.shadow.bias = -0.0006;
  sun.shadow.normalBias = 0.03;
  scene.add(sun);
  scene.add(sun.target);
  var SUN_DIR = new THREE.Vector3(0.55, 1, -0.45).normalize();
  var POST = {
    on: false,
    rt: null,
    scene: null,
    cam: null,
    mat: null
  };
  (function () {
    var gl = renderer.getContext();
    var ok = renderer.capabilities.isWebGL2 || !!gl.getExtension("WEBGL_depth_texture");
    if (!ok) return;
    var rt = new THREE.WebGLRenderTarget(4, 4, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      depthBuffer: true,
      stencilBuffer: false
    });
    rt.texture.generateMipmaps = false;
    rt.depthTexture = new THREE.DepthTexture(4, 4);
    rt.depthTexture.type = THREE.UnsignedIntType;
    var mat = new THREE.ShaderMaterial({
      uniforms: {
        tColor: {
          value: rt.texture
        },
        tDepth: {
          value: rt.depthTexture
        },
        uRes: {
          value: new THREE.Vector2(4, 4)
        },
        uPR: {
          value: 1
        },
        uNear: {
          value: camera.near
        },
        uFar: {
          value: camera.far
        },
        uFogN: {
          value: 80
        },
        uFogF: {
          value: 210
        },
        uInk: {
          value: new THREE.Color("#161020")
        }
      },
      vertexShader: "varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.0,1.0);}",
      fragmentShader: ["uniform sampler2D tColor;uniform sampler2D tDepth;uniform vec2 uRes;uniform float uPR;uniform float uNear;uniform float uFar;uniform float uFogN;uniform float uFogF;uniform vec3 uInk;varying vec2 vUv;", "float lin(vec2 uv){float d=texture2D(tDepth,uv).x;float z=d*2.0-1.0;return 2.0*uNear*uFar/(uFar+uNear-z*(uFar-uNear));}", "vec3 srgb(vec3 c){c=clamp(c,0.0,1.0);return mix(c*12.92,1.055*pow(c,vec3(1.0/2.4))-0.055,step(0.0031308,c));}", "vec3 col(vec2 uv){return srgb(texture2D(tColor,uv).rgb);}", "void main(){", "  vec2 px=uPR*0.9/uRes;", "  float d0=lin(vUv),dl=lin(vUv-vec2(px.x,0.0)),dr=lin(vUv+vec2(px.x,0.0)),du=lin(vUv+vec2(0.0,px.y)),dn=lin(vUv-vec2(0.0,px.y));", "  float w0=1.0/d0;float lap=abs(1.0/dl+1.0/dr-2.0*w0)+abs(1.0/du+1.0/dn-2.0*w0);", "  float eD=smoothstep(0.035,0.09,lap/w0);", "  float fogA=1.0-clamp((d0-uFogN)/max(0.001,uFogF-uFogN),0.0,1.0);", "  vec4 raw=texture2D(tColor,vUv);float noDots=step(raw.a,0.9);" + "\n" + "  vec3 c0=col(vUv);", Q.s.cheapPost ? "  float eC=0.0;" : "  vec3 cl=col(vUv-vec2(px.x,0.0)),cr=col(vUv+vec2(px.x,0.0)),cu=col(vUv+vec2(0.0,px.y)),cn=col(vUv-vec2(0.0,px.y));\n  float ce=length(cl-cr)+length(cu-cn);\n  float near=1.0-smoothstep(35.0,90.0,d0);\n  float eC=smoothstep(0.5,0.85,ce)*near;", "  float edge=max(eD*mix(1.0,0.55,smoothstep(70.0,180.0,d0)),eC*0.85)*fogA;", "  float lum=dot(c0,vec3(0.299,0.587,0.114));", "  vec3 c=mix(vec3(lum),c0,1.1);", "  float cell=5.0*uPR;", "  vec2 p=mat2(0.7071,-0.7071,0.7071,0.7071)*(gl_FragCoord.xy/cell);vec2 f=fract(p)-0.5;float r=length(f);", "  bool sky=d0>uFar*0.97||fogA<0.03;", "  float shade=sky?0.10+0.28*vUv.y:clamp((0.44-lum)/0.4,0.0,1.0);", "  float dotR=sqrt(shade)*0.52;", "  float aa=0.9/cell;float dm=1.0-smoothstep(dotR-aa,dotR+aa,r);", "  c=mix(c,sky?c*0.86:c*0.5,dm*step(0.02,shade)*(1.0-noDots));", "  c=mix(c,uInk,edge);", "  gl_FragColor=vec4(c,1.0);", "}"].join("\n"),
      depthTest: false,
      depthWrite: false
    });
    var sc = new THREE.Scene();
    var q = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat);
    q.frustumCulled = false;
    sc.add(q);
    POST.rt = rt;
    POST.mat = mat;
    POST.scene = sc;
    POST.cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    POST.on = true;
  })();
  function postResize(w, h) {
    if (!POST.on) return;
    var W = Math.max(1, Math.floor(w * pixelRatio)),
      H = Math.max(1, Math.floor(h * pixelRatio));
    POST.rt.setSize(W, H);
    POST.mat.uniforms.uRes.value.set(W, H);
    POST.mat.uniforms.uPR.value = Math.max(1, pixelRatio);
  }
  function renderFrame() {
    if (!POST.on) {
      renderer.render(scene, camera);
      return;
    }
    POST.mat.uniforms.uNear.value = camera.near;
    POST.mat.uniforms.uFar.value = camera.far;
    POST.mat.uniforms.uFogN.value = scene.fog.near;
    POST.mat.uniforms.uFogF.value = scene.fog.far;
    renderer.setRenderTarget(POST.rt);
    renderer.render(scene, camera);
    renderer.setRenderTarget(null);
    renderer.render(POST.scene, POST.cam);
  }
  var AU = {
    ctx: null,
    master: null,
    sfx: null,
    music: null,
    noise: null,
    fireGain: null
  };
  function audioInit() {
    if (AU.ctx) {
      if (AU.ctx.state === "suspended") AU.ctx.resume();
      return;
    }
    var AC = null;
    {
      return;
    }
    var ctx = AU.ctx = new null();
    var comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -14;
    comp.ratio.value = 6;
    AU.master = ctx.createGain();
    AU.master.gain.value = 0.75;
    AU.master.connect(comp);
    comp.connect(ctx.destination);
    AU.sfx = ctx.createGain();
    AU.sfx.gain.value = save.sfx ? 1 : 0;
    AU.sfx.connect(AU.master);
    AU.music = ctx.createGain();
    AU.music.gain.value = save.music ? 0.3 : 0;
    AU.music.connect(AU.master);
    var len = ctx.sampleRate * 2,
      buf = ctx.createBuffer(1, len, ctx.sampleRate),
      d = buf.getChannelData(0);
    for (var i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    AU.noise = buf;
    var src = ctx.createBufferSource();
    src.buffer = buf;
    src.loop = true;
    var bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 700;
    bp.Q.value = 0.6;
    var lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 2400;
    AU.fireGain = ctx.createGain();
    AU.fireGain.gain.value = 0;
    var lfo = ctx.createOscillator();
    lfo.frequency.value = 7;
    var lg = ctx.createGain();
    lg.gain.value = 260;
    lfo.connect(lg);
    lg.connect(bp.frequency);
    lfo.start();
    src.connect(bp);
    bp.connect(lp);
    lp.connect(AU.fireGain);
    AU.fireGain.connect(AU.sfx);
    src.start();
    AU.fireChain = lp;
    loadSndAssets();
    Music.start();
  }
  function setAudioPrefs() {
    if (!AU.ctx) return;
    AU.sfx.gain.setTargetAtTime(save.sfx ? 1 : 0, AU.ctx.currentTime, 0.05);
    AU.music.gain.setTargetAtTime(save.music ? 0.3 : 0, AU.ctx.currentTime, 0.1);
  }
  var sfxMul = 1;
  function sNoise(dur, vol, f0, f1, type, q, delay, dest) {
    if (!AU.ctx || sfxMul < 0.03) return;
    vol *= sfxMul;
    var c = AU.ctx,
      t = c.currentTime + (delay || 0);
    noiseAt(t, dur, vol, f0, f1, type, q, dest || AU.sfx);
  }
  function noiseAt(t, dur, vol, f0, f1, type, q, dest) {
    var c = AU.ctx,
      s = c.createBufferSource();
    s.buffer = AU.noise;
    s.playbackRate.value = rand(0.8, 1.2);
    var f = c.createBiquadFilter();
    f.type = type || "lowpass";
    f.Q.value = q || 0.7;
    f.frequency.setValueAtTime(f0, t);
    f.frequency.exponentialRampToValueAtTime(Math.max(30, f1), t + dur);
    var g = c.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f);
    f.connect(g);
    g.connect(dest);
    s.start(t, rand(0, 1));
    s.stop(t + dur + 0.05);
  }
  function sTone(type, f0, f1, dur, vol, delay, dest) {
    if (!AU.ctx || sfxMul < 0.03) return;
    vol *= sfxMul;
    toneAt(AU.ctx.currentTime + (delay || 0), type, f0, f1, dur, vol, dest || AU.sfx);
  }
  function toneAt(t, type, f0, f1, dur, vol, dest, lpf) {
    var c = AU.ctx,
      o = c.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(f0, t);
    if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
    var g = c.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    if (lpf) {
      var f = c.createBiquadFilter();
      f.type = "lowpass";
      f.frequency.value = lpf;
      o.connect(f);
      f.connect(g);
    } else o.connect(g);
    g.connect(dest);
    o.start(t);
    o.stop(t + dur + 0.05);
  }
  var lastSnd = {};
  function throttle(key, ms) {
    var n = performance.now();
    if (lastSnd[key] && n - lastSnd[key] < ms) return false;
    lastSnd[key] = n;
    return true;
  }
  var SFX = {
    pop: function () {
      if (!throttle("pop", 40)) return;
      sNoise(0.12, 0.3, 3200, 600, "bandpass", 1.2);
      sTone("square", rand(500, 700), 180, 0.08, 0.05);
    },
    crash: function (size) {
      if (!throttle("crash" + (size > 1 ? "b" : "s"), 70)) return;
      var v = clamp(0.35 + size * 0.2, 0.3, 1);
      sNoise(0.5 + size * 0.35, v, 2600, 120, "lowpass", 0.8);
      sTone("sine", 110 - size * 12, 32, 0.4 + size * 0.2, v * 0.8);
      sNoise(0.25, v * 0.4, 5000, 1500, "highpass", 0.5, 0.05);
    },
    boom: function () {
      if (!throttle("boom", 60)) return;
      sNoise(0.7, 0.8, 1800, 60, "lowpass", 0.9);
      sTone("sine", 90, 25, 0.6, 0.7);
    },
    shot: function () {
      if (!throttle("shot", 80)) return;
      sNoise(0.25, 0.35, 2400, 300, "lowpass", 1);
      sTone("square", 160, 60, 0.12, 0.08);
    },
    gun: function () {
      if (!throttle("gun", 50)) return;
      sNoise(0.06, 0.25, 4000, 2000, "bandpass", 1.5);
    },
    wahwah: function () {
      [[392, 370], [370, 349], [349, 330], [330, 262]].forEach(function (f, i) {
        sTone("triangle", f[0], f[1], i === 3 ? 0.9 : 0.34, 0.16, i * 0.36);
        sTone("sawtooth", f[0] / 2, f[1] / 2, i === 3 ? 0.9 : 0.34, 0.04, i * 0.36);
      });
    },
    hit: function (heavy) {
      if (!throttle("hit", 60)) return;
      sNoise(heavy ? 0.22 : 0.1, heavy ? 0.7 : 0.4, 2400, 300, "lowpass", 1);
      sTone("square", heavy ? 160 : 240, 50, heavy ? 0.18 : 0.08, heavy ? 0.22 : 0.12);
    },
    hurt: function () {
      if (!throttle("hurt", 150)) return;
      sTone("sawtooth", 300, 140, 0.25, 0.18);
      sNoise(0.2, 0.3, 900, 200, "lowpass", 1);
    },
    clank: function () {
      if (!throttle("clank", 160)) return;
      sTone("square", 880, 700, 0.12, 0.08);
      sTone("triangle", 1320, 1100, 0.18, 0.08, 0.02);
    },
    stomp: function () {
      sTone("sine", 130, 32, 0.5, 0.95);
      sNoise(0.35, 0.7, 1800, 70, "lowpass", 1.2);
      sTone("triangle", 220, 45, 0.15, 0.35);
    },
    whoosh: function () {},
    spin: function () {
      if (!throttle("spin", 320)) return;
      sNoise(0.22, 0.42, 1600, 300, "bandpass", 1.0);
      sTone("triangle", 420, 620, 0.18, 0.16, 0.01);
    },
    fly: function () {
      if (!throttle("fly", 420)) return;
      sNoise(0.28, 0.28, 520, 135, "lowpass", 0.6);
      sTone("sine", 120, 165, 0.2, 0.1);
    },
    flap: function () {
      if (!throttle("flap", 260)) return;
      sNoise(0.09, 0.18, 240, 95, "lowpass", 0.55);
    },
    roar: function (big) {
      var d = big ? 1.4 : 0.8;
      sTone("sawtooth", 210, 70, d, 0.35);
      sTone("sawtooth", 160, 55, d, 0.3, 0.02);
      sNoise(d, 0.4, 1500, 200, "bandpass", 1.5);
    },
    step: function (s) {
      if (!throttle("step", 120)) return;
      sTone("sine", 70, 35, 0.2, clamp(0.08 * s, 0, 0.6));
    },
    scream: function () {
      if (!throttle("scream", 700)) return;
      var f = rand(900, 1300);
      sTone("triangle", f, f * 1.25, 0.18, 0.04);
      sTone("triangle", f * 1.2, f * 0.9, 0.22, 0.035, 0.16);
    },
    siren: function () {
      if (!throttle("siren", 1400)) return;
      sTone("square", 700, 950, 0.35, 0.03, 0, undefined);
      sTone("square", 950, 700, 0.35, 0.03, 0.35);
    },
    grow: function () {
      [523, 659, 784, 1046].forEach(function (f, i) {
        sTone("triangle", f, f, 0.35, 0.12, i * 0.07);
      });
    },
    reward: function () {
      [523, 659, 784, 1046].forEach(function (f, i) {
        sTone("triangle", f, f * 1.02, 0.28, 0.18, i * 0.06);
      });
    },
    chomp: function () {
      sNoise(0.12, 0.5, 1800, 400, "bandpass", 2);
      sTone("square", 220, 90, 0.1, 0.12);
      sNoise(0.1, 0.4, 1500, 300, "bandpass", 2, 0.12);
    },
    rip: function () {
      sNoise(0.45, 0.6, 600, 4200, "bandpass", 1.5);
      sTone("sawtooth", 300, 900, 0.3, 0.08);
    },
    throwS: function () {
      sNoise(0.3, 0.4, 300, 1800, "bandpass", 2);
    },
    ko: function () {
      [392, 330, 262, 196].forEach(function (f, i) {
        sTone("triangle", f, f * 0.98, 0.25, 0.12, i * 0.12);
      });
    },
    click: function () {
      sTone("triangle", 660, 880, 0.08, 0.08);
    }
  };
  var SND = {},
    SND_IDS = ["sfx_pop", "sfx_smash", "sfx_boom", "sfx_stomp", "sfx_whoosh", "sfx_spin_soft", "sfx_fly_soft", "sfx_roar", "sfx_chomp", "sfx_rip", "sfx_powerup", "sfx_ko", "sfx_click", "sfx_fire_loop", "music_menu_loop", "music_rampage_loop"];
  var sndAsked = false;
  function sndUrls(id) {
    var hits = [],
      out = [];
    try {
      if (typeof assets !== "undefined" && assets) hits.push(assets[id]);
    } catch (e) {}
    try {
      if (window.assets) hits.push(window.assets[id]);
    } catch (e) {}
    try {
      if (window.ASSET_MAP) hits.push(window.ASSET_MAP[id]);
    } catch (e) {}
    try {
      if (window.lib && window.lib.getAsset) hits.push(window.lib.getAsset(id));
    } catch (e) {}
    for (var i = 0; i < hits.length; i++) {
      var a = hits[i],
        u = a && (a.url || (typeof a === "string" ? a : null));
      if (typeof u === "string" && u && out.indexOf(u) < 0) out.push(u);
    }
    out.push("assets/snd/" + id + ".mp3");
    return out;
  }
  function loadSndAssets() {
    if (sndAsked || !AU.ctx) return;
    sndAsked = true;
    SND_IDS.forEach(function (id) {
      loadSnd(id, sndUrls(id), 0);
    });
  }
  function loadSnd(id, urls, i) {
    if (i >= urls.length || !AU.ctx) return;
    fetch(urls[i]).then(function (r) {
      if (!r.ok) throw 0;
      return r.arrayBuffer();
    }).then(function (b) {
      return new Promise(function (res, rej) {
        AU.ctx.decodeAudioData(b, res, rej);
      });
    }).then(function (buf) {
      SND[id] = buf;
      if (id === "sfx_fire_loop") swapFireLoop();
    }, function () {
      loadSnd(id, urls, i + 1);
    });
  }
  function playSnd(id, vol, rate, delay) {
    var b = SND[id];
    if (!b || !AU.ctx || sfxMul < 0.03) return false;
    var s = AU.ctx.createBufferSource();
    s.buffer = b;
    s.playbackRate.value = rate || 1;
    var g = AU.ctx.createGain();
    g.gain.value = (vol === undefined ? 1 : vol) * sfxMul;
    s.connect(g);
    g.connect(AU.sfx);
    s.start(AU.ctx.currentTime + (delay || 0));
    return true;
  }
  function swapFireLoop() {
    if (!AU.ctx || !AU.fireGain || !SND.sfx_fire_loop || AU.fireSample) return;
    if (AU.fireChain) {
      try {
        AU.fireChain.disconnect();
      } catch (e) {}
    }
    var s = AU.ctx.createBufferSource();
    s.buffer = SND.sfx_fire_loop;
    s.loop = true;
    s.connect(AU.fireGain);
    s.start();
    AU.fireSample = s;
  }
  var MUS = {
    node: null,
    cur: null
  };
  function musicTrack(id, vol) {
    if (!AU.ctx || !SND[id] || MUS.cur === id) return;
    var t = AU.ctx.currentTime,
      old = MUS.node;
    var s = AU.ctx.createBufferSource();
    s.buffer = SND[id];
    s.loop = true;
    var g = AU.ctx.createGain();
    g.gain.value = 0.0001;
    s.connect(g);
    g.connect(AU.music);
    s.start(t);
    g.gain.setTargetAtTime(vol, t, 0.5);
    MUS.node = {
      s: s,
      g: g
    };
    MUS.cur = id;
    if (old) {
      old.g.gain.setTargetAtTime(0, t, 0.4);
      setTimeout(function () {
        try {
          old.s.stop();
        } catch (e) {}
      }, 2200);
    }
  }
  function musicStop() {
    var o = MUS.node;
    if (!o || !AU.ctx) return;
    o.g.gain.setTargetAtTime(0, AU.ctx.currentTime, 0.3);
    MUS.node = null;
    MUS.cur = null;
    setTimeout(function () {
      try {
        o.s.stop();
      } catch (e) {}
    }, 1600);
  }
  (function () {
    var P = {};
    Object.keys(SFX).forEach(function (k) {
      P[k] = SFX[k];
    });
    SFX.pop = function () {
      if (!SND.sfx_pop) return P.pop();
      if (!throttle("s_pop", 45)) return;
      playSnd("sfx_pop", 0.5, rand(0.9, 1.14));
    };
    SFX.crash = function (size) {
      if (!SND.sfx_smash) return P.crash(size);
      if (!throttle("s_crash" + (size > 1 ? "b" : "s"), 85)) return;
      playSnd("sfx_smash", clamp(0.38 + size * 0.18, 0.34, 0.95), size > 1 ? rand(0.8, 0.92) : rand(1.04, 1.22));
    };
    SFX.boom = function () {
      if (!SND.sfx_boom) return P.boom();
      if (!throttle("s_boom", 75)) return;
      playSnd("sfx_boom", 0.8, rand(0.9, 1.1));
    };
    SFX.hit = function (heavy) {
      if (!SND.sfx_smash || !SND.sfx_pop) return P.hit(heavy);
      if (!throttle("s_hit", 70)) return;
      if (heavy) playSnd("sfx_smash", 0.45, rand(1.14, 1.3));else playSnd("sfx_pop", 0.3, rand(1.16, 1.36));
    };
    SFX.stomp = function () {
      if (!SND.sfx_stomp) return P.stomp();
      playSnd("sfx_stomp", 1.05, rand(0.96, 1.04));
      sTone("sine", 120, 36, 0.26, 0.35);
      sNoise(0.18, 0.35, 2200, 100, "lowpass", 1.1);
    };
    SFX.whoosh = function () {};
    SFX.spin = function () {
      if (!SND.sfx_spin_soft) return P.spin();
      if (!throttle("s_spin", 320)) return;
      playSnd("sfx_spin_soft", 0.72, rand(1.02, 1.1));
      sNoise(0.16, 0.28, 1400, 380, "bandpass", 0.9);
      sTone("sine", 380, 560, 0.14, 0.1, 0.02);
    };
    SFX.fly = function () {
      if (!SND.sfx_fly_soft) return P.fly();
      if (!throttle("s_fly", 420)) return;
      playSnd("sfx_fly_soft", 0.44, rand(0.99, 1.05));
    };
    SFX.flap = function () {
      return P.flap();
    };
    SFX.roar = function (big) {
      if (!SND.sfx_roar) return P.roar(big);
      playSnd("sfx_roar", big ? 0.75 : 0.5, big ? rand(0.86, 0.95) : rand(1.05, 1.2));
    };
    SFX.chomp = function () {
      if (!SND.sfx_chomp) return P.chomp();
      playSnd("sfx_chomp", 0.55, rand(0.95, 1.1));
    };
    SFX.rip = function () {
      if (!SND.sfx_rip) return P.rip();
      playSnd("sfx_rip", 0.55, rand(0.95, 1.08));
    };
    SFX.grow = function () {
      if (!SND.sfx_powerup) return P.grow();
      playSnd("sfx_powerup", 0.6);
    };
    SFX.reward = function () {
      if (!SND.sfx_powerup) return P.reward();
      if (!throttle("s_reward", 250)) return;
      playSnd("sfx_powerup", 0.85, 1.08);
    };
    SFX.ko = function () {
      if (!SND.sfx_ko) return P.ko();
      playSnd("sfx_ko", 0.6);
    };
    SFX.wahwah = function () {
      if (!SND.sfx_ko) return P.wahwah();
      playSnd("sfx_ko", 0.55, 0.88);
    };
    SFX.click = function () {
      if (!SND.sfx_click) return P.click();
      playSnd("sfx_click", 0.45, rand(0.97, 1.05));
    };
  })();
  var Music = {
    on: false,
    step: 0,
    next: 0,
    bpm: 116,
    intensity: 0,
    timer: null,
    bass: [36, 0, 36, 0, 43, 0, 36, 0, 39, 0, 39, 0, 41, 0, 43, 0, 36, 0, 36, 0, 43, 0, 36, 0, 34, 0, 34, 0, 38, 0, 41, 0],
    lead: [72, 0, 75, 77, 0, 75, 72, 0, 70, 0, 72, 0, 67, 0, 0, 0, 72, 0, 75, 77, 0, 79, 77, 0, 75, 0, 77, 75, 72, 0, 0, 0, 79, 0, 77, 75, 0, 77, 79, 0, 82, 0, 79, 0, 77, 0, 75, 0, 77, 0, 75, 72, 0, 70, 72, 0, 67, 0, 70, 0, 72, 0, 0, 0],
    start: function () {
      if (this.timer || !AU.ctx) return;
      this.next = AU.ctx.currentTime + 0.1;
      var self = this;
      this.timer = setInterval(function () {
        self.tick();
      }, 30);
    },
    tick: function () {
      var c = AU.ctx;
      if (!c) return;
      if (SND.music_menu_loop || SND.music_rampage_loop) {
        this.next = Math.max(this.next, c.currentTime + 0.05);
        if (!this.on) {
          musicStop();
          return;
        }
        var md = typeof G_ !== "undefined" && G_ ? G_.mode : "menu";
        var fight = md === "play" || md === "intro";
        var id = fight ? "music_rampage_loop" : "music_menu_loop";
        if (!SND[id]) id = fight ? "music_menu_loop" : "music_rampage_loop";
        musicTrack(id, id === "music_rampage_loop" ? 0.85 : 0.7);
        return;
      }
      if (!this.on) {
        this.next = Math.max(this.next, c.currentTime + 0.05);
        return;
      }
      var sp = 60 / this.bpm / 4;
      while (this.next < c.currentTime + 0.12) {
        this.play(this.step, this.next);
        this.next += sp;
        this.step = (this.step + 1) % 64;
      }
    },
    play: function (s, t) {
      var I = this.intensity,
        D = AU.music,
        st = s % 16,
        mf = function (n) {
          return 440 * Math.pow(2, (n - 69) / 12);
        };
      if (st % 4 === 0) toneAt(t, "sine", 120, 40, 0.22, 0.9, D);
      if (I >= 1 && (st === 4 || st === 12)) noiseAt(t, 0.16, 0.45, 2600, 900, "bandpass", 0.8, D);
      if (st % 2 === 0 || I >= 3) noiseAt(t, 0.04, I >= 1 ? 0.18 : 0.1, 9000, 6000, "highpass", 0.7, D);
      var b = this.bass[s % 32];
      if (b) toneAt(t, "triangle", mf(b), mf(b), 0.2, 0.45, D, 900);
      if (I >= 2) {
        var l = this.lead[s];
        if (l) toneAt(t, "square", mf(l), mf(l), 0.14, 0.09, D, 2600);
      }
      if (I >= 3 && st % 8 === 6) toneAt(t, "square", mf(this.lead[(s + 32) % 64] || 79) * 2, mf(79) * 2, 0.08, 0.035, D, 3000);
    }
  };
  function Particles(max, additive) {
    this.max = max;
    this.i = 0;
    this.pos = new Float32Array(max * 3);
    this.vel = new Float32Array(max * 3);
    this.col = new Float32Array(max * 4);
    this.size = new Float32Array(max);
    this.life = new Float32Array(max);
    this.ml = new Float32Array(max);
    this.p = new Float32Array(max * 12);
    var g = new THREE.BufferGeometry();
    this.aPos = new THREE.BufferAttribute(this.pos, 3).setUsage(THREE.DynamicDrawUsage);
    this.aCol = new THREE.BufferAttribute(this.col, 4).setUsage(THREE.DynamicDrawUsage);
    this.aSize = new THREE.BufferAttribute(this.size, 1).setUsage(THREE.DynamicDrawUsage);
    g.setAttribute("position", this.aPos);
    g.setAttribute("rgba", this.aCol);
    g.setAttribute("size", this.aSize);
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1e5);
    this.mat = new THREE.ShaderMaterial({
      uniforms: {
        uScale: {
          value: 400
        },
        uLin: {
          value: 1
        }
      },
      vertexShader: "attribute float size;attribute vec4 rgba;varying vec4 vC;uniform float uScale;void main(){vC=rgba;vec4 mv=modelViewMatrix*vec4(position,1.0);gl_PointSize=size*uScale/max(0.1,-mv.z);gl_Position=projectionMatrix*mv;}",
      fragmentShader: additive ? "varying vec4 vC;uniform float uLin;void main(){vec2 p=gl_PointCoord-0.5;float d=length(p);if(d>0.5)discard;float a=pow(1.0-d*2.0,1.2);vec3 c=mix(vC.rgb,pow(vC.rgb,vec3(2.2)),uLin);gl_FragColor=vec4(c,vC.a*a);}" : "varying vec4 vC;uniform float uLin;void main(){vec2 p=gl_PointCoord-0.5;float d=length(p);if(d>0.5)discard;float a=smoothstep(0.5,0.44,d);vec3 c=mix(vC.rgb,pow(vC.rgb,vec3(2.2)),uLin);gl_FragColor=vec4(c,vC.a*a);}",
      transparent: true,
      depthWrite: false,
      blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending
    });
    this.points = new THREE.Points(g, this.mat);
    this.points.frustumCulled = false;
    this.points.renderOrder = additive ? 11 : 10;
    scene.add(this.points);
  }
  Particles.prototype.spawn = function (x, y, z, vx, vy, vz, life, s0, s1, a0, a1, c0, c1, grav, drag) {
    var i = this.i;
    this.i = (i + 1) % this.max;
    this.pos[i * 3] = x;
    this.pos[i * 3 + 1] = y;
    this.pos[i * 3 + 2] = z;
    this.vel[i * 3] = vx;
    this.vel[i * 3 + 1] = vy;
    this.vel[i * 3 + 2] = vz;
    this.life[i] = life;
    this.ml[i] = life;
    var p = this.p,
      o = i * 12;
    p[o] = s0;
    p[o + 1] = s1;
    p[o + 2] = a0;
    p[o + 3] = a1;
    p[o + 4] = c0[0];
    p[o + 5] = c0[1];
    p[o + 6] = c0[2];
    p[o + 7] = c1[0];
    p[o + 8] = c1[1];
    p[o + 9] = c1[2];
    p[o + 10] = grav || 0;
    p[o + 11] = drag || 0;
  };
  Particles.prototype.update = function (dt) {
    var p = this.p;
    for (var i = 0; i < this.max; i++) {
      if (this.life[i] <= 0) {
        if (this.size[i] !== 0) this.size[i] = 0;
        continue;
      }
      this.life[i] -= dt;
      var o = i * 12,
        t = 1 - Math.max(0, this.life[i]) / this.ml[i],
        k = i * 3,
        dr = Math.exp(-p[o + 11] * dt);
      this.vel[k] *= dr;
      this.vel[k + 1] = this.vel[k + 1] * dr - p[o + 10] * dt;
      this.vel[k + 2] *= dr;
      this.pos[k] += this.vel[k] * dt;
      this.pos[k + 1] += this.vel[k + 1] * dt;
      this.pos[k + 2] += this.vel[k + 2] * dt;
      if (this.pos[k + 1] < 0.05) {
        this.pos[k + 1] = 0.05;
        this.vel[k + 1] *= -0.2;
      }
      this.size[i] = this.life[i] > 0 ? lerp(p[o], p[o + 1], t) : 0;
      var c = i * 4;
      this.col[c] = lerp(p[o + 4], p[o + 7], t);
      this.col[c + 1] = lerp(p[o + 5], p[o + 8], t);
      this.col[c + 2] = lerp(p[o + 6], p[o + 9], t);
      this.col[c + 3] = lerp(p[o + 2], p[o + 3], t);
    }
    this.aPos.needsUpdate = true;
    this.aCol.needsUpdate = true;
    this.aSize.needsUpdate = true;
  };
  Particles.prototype.clear = function () {
    this.life.fill(0);
  };
  var FX_ADD = new Particles(1600, true);
  var FX_SMOKE = new Particles(1400, false);
  var COL = {
    fireA: hexRGB("#FFF3B0"),
    fireB: hexRGB("#FF7A1A"),
    fireC: hexRGB("#E8341C"),
    smokeA: hexRGB("#6B6470"),
    smokeB: hexRGB("#3E3942"),
    dust: hexRGB("#D9CBB0"),
    dustB: hexRGB("#BFAE92"),
    spark: hexRGB("#FFE7A3"),
    sparkB: hexRGB("#FF9C3A"),
    tracer: hexRGB("#FFF1A8")
  };
  function dustBurst(x, z, r, n, y) {
    for (var i = 0; i < n; i++) {
      var a = Math.random() * 6.283,
        sp = rand(0.4, 1) * r * 1.6;
      FX_SMOKE.spawn(x + Math.cos(a) * r * 0.3, (y || 0) + rand(0.1, 0.4) * r, z + Math.sin(a) * r * 0.3, Math.cos(a) * sp, rand(0.2, 1) * r * 0.6, Math.sin(a) * sp, rand(0.9, 1.7), r * 0.8, r * 2.2, 0.75, 0, COL.dust, COL.dustB, -0.2, 1.6);
    }
  }
  function sparks(x, y, z, n, s) {
    for (var i = 0; i < n; i++) FX_ADD.spawn(x, y, z, rand(-1, 1) * 6 * s, rand(1, 6) * s, rand(-1, 1) * 6 * s, rand(0.25, 0.5), 0.25 * s, 0.05, 1, 0, COL.spark, COL.sparkB, 14 * s, 1);
  }
  function explosion(x, y, z, r) {
    for (var i = 0; i < 26; i++) {
      var a = Math.random() * 6.283,
        e = rand(-0.2, 1),
        sp = rand(2, 7) * r;
      FX_ADD.spawn(x, y, z, Math.cos(a) * sp * (1 - Math.abs(e) * 0.5), e * sp, Math.sin(a) * sp * (1 - Math.abs(e) * 0.5), rand(0.3, 0.6), r * 0.8, r * 2.4, 1, 0, COL.fireA, pick([COL.fireB, COL.fireC]), -2, 3);
    }
    for (i = 0; i < 14; i++) FX_SMOKE.spawn(x + rand(-1, 1) * r, y + rand(0, 1) * r, z + rand(-1, 1) * r, rand(-1.5, 1.5) * r, rand(1, 3) * r, rand(-1.5, 1.5) * r, rand(1.2, 2.2), r * 1.2, r * 3.4, 0.7, 0, COL.smokeA, COL.smokeB, -0.6, 1.2);
    sparks(x, y, z, 10, r);
  }
  var rings = [];
  (function () {
    var g = new THREE.RingGeometry(0.82, 1, 56);
    g.rotateX(-Math.PI / 2);
    for (var i = 0; i < 5; i++) {
      var m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({
        color: "#FFF6E0",
        transparent: true,
        opacity: 0,
        depthWrite: false
      }));
      m.visible = false;
      m.renderOrder = 9;
      scene.add(m);
      rings.push({
        m: m,
        t: 0,
        d: 1,
        r: 1
      });
    }
  })();
  var ringIdx = 0;
  function shockwave(x, z, r, dur) {
    var R = rings[ringIdx++ % rings.length];
    R.m.position.set(x, 0.14, z);
    R.t = 0;
    R.d = dur || 0.45;
    R.r = r;
    R.m.visible = true;
  }
  function updateRings(dt) {
    rings.forEach(function (R) {
      if (!R.m.visible) return;
      R.t += dt;
      var t = R.t / R.d;
      if (t >= 1) {
        R.m.visible = false;
        return;
      }
      var e = 1 - Math.pow(1 - t, 3);
      R.m.scale.setScalar(0.2 + e * R.r);
      R.m.material.opacity = 0.85 * (1 - t);
    });
  }
  function mkCanvas(w, h) {
    var c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    return c;
  }
  function finishTex(c, repeat) {
    var t = new THREE.CanvasTexture(c);
    t.encoding = THREE.sRGBEncoding;
    t.anisotropy = 4;
    return t;
  }
  function wallTex(floors, cols, style) {
    var c = mkCanvas(256, 256),
      x = c.getContext("2d"),
      fh = 256 / floors,
      cw = 256 / cols;
    x.fillStyle = "#FFFFFF";
    x.fillRect(0, 0, 256, 256);
    if (style === "factory" || style === "warehouse") {
      x.fillStyle = "#FFFFFF";
      x.fillRect(0, 0, 256, 256);
      x.fillStyle = "rgba(0,0,0,0.08)";
      for (var i = 0; i < 256; i += 10) x.fillRect(i, 0, 3, 256);
      if (style === "factory") {
        for (var r = 0; r < floors; r++) {
          var yy = 30 + r * (200 / floors);
          x.fillStyle = "#2F4063";
          x.fillRect(12, yy, 232, 26);
          x.fillStyle = "rgba(200,230,255,0.4)";
          for (i = 16; i < 240; i += 24) x.fillRect(i, yy + 3, 8, 20);
        }
      } else {
        x.fillStyle = "#7A8494";
        x.fillRect(60, 120, 136, 136);
        x.fillStyle = "rgba(0,0,0,0.25)";
        for (i = 124; i < 256; i += 10) x.fillRect(60, i, 136, 3);
      }
      return finishTex(c);
    }
    if (style === "church") {
      for (var k2 = 0; k2 < cols; k2++) {
        var cx2 = (k2 + 0.5) * cw;
        x.fillStyle = "#2F4063";
        x.fillRect(cx2 - 12, 70, 24, 110);
        x.beginPath();
        x.arc(cx2, 70, 12, Math.PI, 0);
        x.fill();
        x.fillStyle = "#E86A4A";
        x.fillRect(cx2 - 8, 90, 7, 30);
        x.fillStyle = "#5E9BE0";
        x.fillRect(cx2 + 1, 90, 7, 30);
        x.fillStyle = "#F2B23A";
        x.fillRect(cx2 - 8, 124, 16, 30);
      }
      return finishTex(c);
    }
    if (style === "office") {
      x.fillStyle = "#34496B";
      x.fillRect(0, 0, 256, 256);
      for (var f = 0; f < floors; f++) for (var k = 0; k < cols; k++) {
        x.fillStyle = (f * 7 + k * 3) % 5 === 0 ? "#6E8FB8" : "#4C6690";
        x.fillRect(k * cw + 3, f * fh + 3, cw - 6, fh - 7);
        x.fillStyle = "rgba(255,255,255,0.18)";
        x.fillRect(k * cw + 3, f * fh + 3, (cw - 6) * 0.35, fh - 7);
      }
      x.fillStyle = "#E9EEF4";
      for (f = 0; f <= floors; f++) x.fillRect(0, f * fh - 2, 256, 4);
      for (k = 0; k <= cols; k++) x.fillRect(k * cw - 2, 0, 4, 256);
      return finishTex(c);
    }
    x.fillStyle = "rgba(0,0,0,0.06)";
    for (f = 0; f < floors; f++) x.fillRect(0, (f + 1) * fh - 4, 256, 4);
    if (style === "tower") {
      x.fillStyle = "rgba(0,0,0,0.05)";
      for (k = 0; k <= cols; k++) x.fillRect(k * cw - 3, 0, 6, 256);
    }
    var start = style === "shop" ? 1 : 0;
    for (f = start; f < floors; f++) {
      for (k = 0; k < cols; k++) {
        var fy = 256 - (f + 1) * fh;
        if (style === "house" && f === 0 && k === (cols / 2 | 0)) {
          x.fillStyle = "#7A4B3A";
          x.fillRect(k * cw + cw * 0.3, 256 - fh * 0.82, cw * 0.4, fh * 0.82);
          x.fillStyle = "#E7C36A";
          x.fillRect(k * cw + cw * 0.6, 256 - fh * 0.42, 5, 5);
          continue;
        }
        var tall = style === "tower" ? 0.7 : 0.56,
          wide = style === "tower" ? 0.7 : 0.54;
        var wx = k * cw + cw * (1 - wide) / 2,
          wy = fy + fh * 0.2,
          ww = cw * wide,
          wh = fh * tall * 0.95;
        x.fillStyle = "rgba(0,0,0,0.12)";
        x.fillRect(wx - 3, wy - 3, ww + 6, wh + 6);
        x.fillStyle = (f * 5 + k * 3) % 7 === 0 ? "#F3D98B" : "#2F4063";
        x.fillRect(wx, wy, ww, wh);
        x.fillStyle = "rgba(200,230,255,0.45)";
        x.fillRect(wx + ww * 0.1, wy + wh * 0.1, ww * 0.28, wh * 0.8);
        if (style !== "tower") {
          x.fillStyle = "rgba(255,255,255,0.9)";
          x.fillRect(wx - 3, wy + wh, ww + 6, 4);
        }
        if (style === "apt" && k % 2 === 0 && f > 0) {
          x.fillStyle = "rgba(0,0,0,0.22)";
          x.fillRect(wx - 5, wy + wh + 4, ww + 10, 3);
        }
      }
    }
    if (style === "shop") {
      var h0 = fh;
      x.fillStyle = "rgba(0,0,0,0.18)";
      x.fillRect(0, 256 - h0 - 4, 256, 6);
      x.fillStyle = "#2F4063";
      x.fillRect(16, 256 - h0 * 0.86, 150, h0 * 0.72);
      x.fillStyle = "rgba(200,230,255,0.45)";
      x.fillRect(24, 256 - h0 * 0.8, 40, h0 * 0.6);
      x.fillStyle = "#6B4636";
      x.fillRect(186, 256 - h0 * 0.86, 50, h0 * 0.86);
    }
    return finishTex(c);
  }
  function stripeTex() {
    var c = mkCanvas(128, 32),
      x = c.getContext("2d");
    for (var i = 0; i < 8; i++) {
      x.fillStyle = i % 2 ? "#FFFFFF" : "#B9B2A8";
      x.fillRect(i * 16, 0, 16, 32);
    }
    x.fillStyle = "rgba(0,0,0,0.12)";
    x.fillRect(0, 26, 128, 6);
    return finishTex(c);
  }
  var AD_WORDS = ["SNACKO", "ZIPPY COLA", "MEGA MART", "BURGER BARN", "SUNNY FM", "PIXEL PHONE", "CHOMP CHIPS", "GO KART"];
  function adTex(word, bg, fg) {
    var c = mkCanvas(256, 96),
      x = c.getContext("2d");
    x.fillStyle = bg;
    x.fillRect(0, 0, 256, 96);
    x.fillStyle = "rgba(255,255,255,0.18)";
    x.beginPath();
    x.arc(215, 48, 60, 0, 6.3);
    x.fill();
    x.fillStyle = fg;
    x.font = 'bold 40px "Arial Black", Impact, sans-serif';
    x.textAlign = "center";
    x.textBaseline = "middle";
    x.fillText(word, 128, 50, 230);
    x.strokeStyle = "rgba(0,0,0,0.25)";
    x.lineWidth = 8;
    x.strokeRect(4, 4, 248, 88);
    return finishTex(c);
  }
  var TOON = function () {
    var d = new Uint8Array([105, 105, 105, 255, 185, 185, 185, 255, 255, 255, 255, 255]);
    var t = new THREE.DataTexture(d, 3, 1);
    t.minFilter = t.magFilter = THREE.NearestFilter;
    t.generateMipmaps = false;
    t.needsUpdate = true;
    return t;
  }();
  function toon(o) {
    var m = new THREE.MeshToonMaterial(Object.assign({
      gradientMap: TOON
    }, o || {}));
    return m;
  }
  var LOD = Q.tier === 0 ? 0 : Q.tier === 1 ? 1 : 2;
  var CYLSEG = [6, 8, 10][LOD],
    CONESEG = [5, 6, 7][LOD],
    BALLDET = LOD === 0 ? 0 : 1;
  var G = {
    box: new THREE.BoxGeometry(1, 1, 1),
    cyl: new THREE.CylinderGeometry(0.5, 0.5, 1, CYLSEG),
    wheel: new THREE.CylinderGeometry(0.5, 0.5, 1, CYLSEG).rotateZ(Math.PI / 2),
    ico: new THREE.IcosahedronGeometry(0.5, 0),
    ball: new THREE.IcosahedronGeometry(0.5, BALLDET),
    cone: new THREE.ConeGeometry(0.5, 1, CONESEG),
    pyr: new THREE.ConeGeometry(0.7071, 1, 4).rotateY(Math.PI / 4),
    prism: function () {
      var s = new THREE.Shape();
      s.moveTo(-0.5, 0);
      s.lineTo(0.5, 0);
      s.lineTo(0, 1);
      s.lineTo(-0.5, 0);
      var g = new THREE.ExtrudeGeometry(s, {
        depth: 1,
        bevelEnabled: false
      });
      g.translate(0, -0.5, -0.5);
      return g;
    }(),
    ring: new THREE.CylinderGeometry(0.5, 0.5, 1, [20, 28, 36][LOD], 1, true),
    head: new THREE.IcosahedronGeometry(0.5, BALLDET),
    cap: new THREE.SphereGeometry(0.5, [6, 8, 8][LOD], [3, 4, 4][LOD], 0, Math.PI * 2, 0, Math.PI / 2),
    tcone: new THREE.CylinderGeometry(0.18, 0.5, 1, 6),
    bird: function () {
      var g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.Float32BufferAttribute([0, 0, 0.2, -0.9, 0.15, -0.1, 0, 0, -0.2, 0, 0, 0.2, 0, 0, -0.2, 0.9, 0.15, -0.1], 3));
      g.computeVertexNormals();
      return g;
    }()
  };
  var MAT = {
    plain: toon({
      color: "#FFFFFF"
    }),
    flat: toon({
      color: "#FFFFFF"
    }),
    glow: new THREE.MeshBasicMaterial({
      color: "#FFFFFF"
    }),
    stripe: toon({
      color: "#FFFFFF",
      map: stripeTex()
    }),
    dbl: toon({
      color: "#FFFFFF",
      side: THREE.DoubleSide
    }),
    bird: new THREE.MeshBasicMaterial({
      color: "#3A3346",
      side: THREE.DoubleSide
    })
  };
  function bMat(tex) {
    var side = toon({
      color: "#FFFFFF",
      map: tex
    });
    return [side, side, MAT.plain, MAT.plain, side, side];
  }
  var BMAT = {
    house: bMat(wallTex(2, 3, "house")),
    villa: bMat(wallTex(2, 4, "house")),
    shop: bMat(wallTex(3, 3, "shop")),
    apt: bMat(wallTex(7, 4, "apt")),
    bungalow: bMat(wallTex(1, 4, "house")),
    town: bMat(wallTex(3, 2, "house")),
    school: bMat(wallTex(2, 7, "apt")),
    church: bMat(wallTex(1, 3, "church")),
    factory: bMat(wallTex(2, 1, "factory")),
    warehouse: bMat(wallTex(1, 1, "warehouse")),
    office: bMat(wallTex(12, 6, "office")),
    tower: bMat(wallTex(12, 5, "tower")),
    sky: bMat(wallTex(16, 5, "tower"))
  };
  var ADS = AD_WORDS.map(function (w, i) {
    var pal = [["#E8453C", "#FFF3D6"], ["#2F7FE0", "#FFFFFF"], ["#FFC53D", "#2A1F3D"], ["#3DBB6E", "#FFFFFF"], ["#8A5CF6", "#FFE9A8"], ["#FF7AB6", "#FFFFFF"], ["#F2A23A", "#2A1F3D"], ["#23B5C9", "#FFFFFF"]][i];
    var m = new THREE.MeshBasicMaterial({
      map: adTex(w, pal[0], pal[1])
    });
    return [MAT.plain, MAT.plain, MAT.plain, MAT.plain, m, m];
  });
  var PAL = {
    wallS: ["#FFF1C9", "#C9EBB4", "#BFE4F7", "#FFD0C2", "#FFE27A", "#E3D2FF", "#FFFFFF"],
    roof: ["#E0402F", "#3E63B8", "#3F9A55", "#9A3F86", "#D9702C", "#E0402F"],
    wallM: ["#E86A4A", "#F2B23A", "#3FB6A8", "#5E9BE0", "#FFF1D6", "#F07F9C", "#A77BE0"],
    awn: ["#D8453A", "#2F7FE0", "#3DBB6E", "#F2A23A", "#8A5CF6", "#23B5C9"],
    wallT: ["#8FC4F2", "#B5D3F0", "#D5DCE6", "#F2D49A", "#9EE0CF", "#C9B5F2", "#F5C9B0"],
    car: ["#D8453A", "#3C79C8", "#F1F1EE", "#F1F1EE", "#B9BEC6", "#B9BEC6", "#33363E", "#2FA6A0", "#F2B33D", "#E8783A"],
    van: ["#F1F1EE", "#B9BEC6", "#3C79C8", "#D8453A", "#6B7B4A"],
    bus: ["#F2A23A", "#3C79C8", "#D8453A"],
    leaf: ["#4FAF5A", "#6CC04A", "#3E9A63", "#86C95B"],
    pine: ["#2F7D57", "#3A8C5E", "#2A6E4F"],
    flower: ["#FF7AB6", "#FFD166", "#FFFFFF", "#FF8F7E", "#B9A6FF"],
    shirt: ["#E8453C", "#2F7FE0", "#FFC53D", "#3DBB6E", "#8A5CF6", "#FF7AB6", "#F1F1EE", "#33363E", "#F2A23A"],
    skin: ["#F2C9A5", "#D9A47C", "#A8714D", "#7A4B32", "#F7DCC0"]
  };
  function wheels(w, z1, z2, r) {
    r = r || 0.44;
    var y = r / 2,
      x = w / 2;
    return [["wheel", "plain", -x, y, z1, 0.2, r, r, "#23232B"], ["wheel", "plain", x, y, z1, 0.2, r, r, "#23232B"], ["wheel", "plain", -x, y, z2, 0.2, r, r, "#23232B"], ["wheel", "plain", x, y, z2, 0.2, r, r, "#23232B"]];
  }
  function lights(w, y, zf, zb) {
    return [["box", "glow", -w * 0.3, y, zf, w * 0.2, 0.1, 0.04, "#FFF6D8"], ["box", "glow", w * 0.3, y, zf, w * 0.2, 0.1, 0.04, "#FFF6D8"], ["box", "plain", -w * 0.32, y, zb, w * 0.18, 0.1, 0.04, "#E8453C"], ["box", "plain", w * 0.32, y, zb, w * 0.18, 0.1, 0.04, "#E8453C"]];
  }
  PAL.tank = ["#E8E4DC", "#8FC4F2", "#F2B23A", "#E86A4A"];
  PAL.hair = ["#2A1F1A", "#5A3A22", "#8A5A2E", "#E8C46A", "#B8452A", "#9A9A9A", "#1A1A2A"];
  PAL.pants = ["#2F4A7A", "#3A3A44", "#6B5A44", "#2F5A3A", "#7A2F3A", "#4A4A6A"];
  PAL.town = ["#E86A4A", "#F2B23A", "#3FB6A8", "#5E9BE0", "#FFF1D6", "#F07F9C", "#A77BE0", "#C9EBB4", "#FFD0C2"];
  var TYPES = {
    tree: {
      tier: 0,
      hp: 1,
      val: 10,
      hw: 0.8,
      hd: 0.8,
      h: 2.6,
      grab: 1,
      parts: [["cyl", "plain", 0, 0.6, 0, 0.26, 1.2, 0.26, "#8B5A3C"], ["ico", "flat", 0, 1.75, 0, 1.6, 1.6, 1.6, "@leaf"], ["ico", "flat", 0.35, 2.35, -0.1, 0.9, 0.9, 0.9, "@leaf"]]
    },
    pine: {
      tier: 0,
      hp: 1,
      val: 10,
      hw: 0.75,
      hd: 0.75,
      h: 3.2,
      grab: 1,
      parts: [["cyl", "plain", 0, 0.35, 0, 0.24, 0.7, 0.24, "#7A4E36"], ["cone", "flat", 0, 1.3, 0, 1.5, 1.5, 1.5, "@pine"], ["cone", "flat", 0, 2.2, 0, 1.1, 1.3, 1.1, "@pine"], ["cone", "flat", 0, 2.9, 0, 0.7, 0.9, 0.7, "@pine"]]
    },
    birch: {
      tier: 0,
      hp: 1,
      val: 10,
      hw: 0.65,
      hd: 0.65,
      h: 3.3,
      grab: 1,
      parts: [["cyl", "plain", 0, 1.0, 0, 0.2, 2.0, 0.2, "#F4F1EA"], ["box", "plain", 0, 0.7, 0.08, 0.1, 0.08, 0.06, "#2A2A2A"], ["box", "plain", 0, 1.3, -0.08, 0.1, 0.06, 0.06, "#2A2A2A"], ["ico", "flat", 0, 2.5, 0, 1.2, 1.7, 1.2, "#9ED25A"]]
    },
    bush: {
      tier: 0,
      hp: 0.6,
      val: 5,
      hw: 0.6,
      hd: 0.6,
      h: 0.8,
      grab: 1,
      parts: [["ico", "flat", 0, 0.38, 0, 1.1, 0.8, 1.1, "@leaf"], ["ico", "flat", 0.35, 0.3, 0.2, 0.6, 0.55, 0.6, "@leaf"]]
    },
    hedge: {
      tier: 0,
      hp: 0.6,
      val: 5,
      hw: 1.2,
      hd: 0.35,
      h: 0.9,
      grab: 1,
      parts: [["box", "plain", 0, 0.45, 0, 2.4, 0.9, 0.7, "#3E9A4A"]]
    },
    flowers: {
      tier: 0,
      hp: 0.4,
      val: 5,
      hw: 0.8,
      hd: 0.35,
      h: 0.5,
      grab: 1,
      parts: [["box", "plain", 0, 0.12, 0, 1.6, 0.24, 0.7, "#8A5A3C"], ["ball", "plain", -0.5, 0.35, 0, 0.32, 0.3, 0.32, "@flower"], ["ball", "plain", 0, 0.38, 0.1, 0.34, 0.3, 0.34, "#FFFFFF"], ["ball", "plain", 0.5, 0.35, -0.05, 0.32, 0.3, 0.32, "@flower"], ["ico", "flat", -0.25, 0.3, -0.15, 0.4, 0.3, 0.3, "#5DAA55"], ["ico", "flat", 0.25, 0.3, 0.15, 0.4, 0.3, 0.3, "#5DAA55"]]
    },
    lamp: {
      tier: 0,
      hp: 0.6,
      val: 8,
      hw: 0.25,
      hd: 0.25,
      h: 3.0,
      grab: 1,
      parts: [["cyl", "plain", 0, 1.45, 0, 0.12, 2.9, 0.12, "#3F4457"], ["box", "plain", 0, 2.9, 0.3, 0.1, 0.1, 0.6, "#3F4457"], ["box", "glow", 0, 2.82, 0.6, 0.3, 0.12, 0.34, "#FFF0B8"], ["cyl", "plain", 0, 0.1, 0, 0.3, 0.2, 0.3, "#3F4457"]]
    },
    signal: {
      tier: 0,
      hp: 0.6,
      val: 10,
      hw: 0.25,
      hd: 0.25,
      h: 3.2,
      grab: 1,
      parts: [["cyl", "plain", 0, 1.5, 0, 0.14, 3, 0.14, "#3F4457"], ["box", "plain", 0, 2.8, 0.1, 0.36, 0.95, 0.3, "#2A2D38"], ["ball", "glow", 0, 3.1, 0.26, 0.2, 0.2, 0.08, "#FF5A4A"], ["ball", "glow", 0, 2.8, 0.26, 0.2, 0.2, 0.08, "#6B5A2A"], ["ball", "glow", 0, 2.5, 0.26, 0.2, 0.2, 0.08, "#2C5A3A"]]
    },
    hydrant: {
      tier: 0,
      hp: 0.5,
      val: 6,
      hw: 0.2,
      hd: 0.2,
      h: 0.65,
      grab: 1,
      parts: [["cyl", "plain", 0, 0.3, 0, 0.3, 0.6, 0.3, "#D8453A"], ["ball", "plain", 0, 0.6, 0, 0.3, 0.22, 0.3, "#D8453A"], ["cyl", "plain", 0, 0.38, 0, 0.1, 0.44, 0.1, "#D8453A", 0, 0, 1.5708]]
    },
    bench: {
      tier: 0,
      hp: 0.6,
      val: 6,
      hw: 0.75,
      hd: 0.35,
      h: 0.8,
      grab: 1,
      parts: [["box", "plain", 0, 0.38, 0, 1.4, 0.1, 0.5, "#B07A4F"], ["box", "plain", 0, 0.66, -0.22, 1.4, 0.34, 0.08, "#B07A4F"], ["box", "plain", -0.55, 0.2, 0, 0.08, 0.4, 0.45, "#3F4457"], ["box", "plain", 0.55, 0.2, 0, 0.08, 0.4, 0.45, "#3F4457"]]
    },
    fence: {
      tier: 0,
      hp: 0.4,
      val: 4,
      hw: 1.0,
      hd: 0.1,
      h: 0.8,
      grab: 1,
      parts: [["box", "plain", 0, 0.5, 0, 2, 0.1, 0.06, "#F7F3EC"], ["box", "plain", 0, 0.25, 0, 2, 0.1, 0.06, "#F7F3EC"], ["box", "plain", -0.75, 0.38, 0, 0.14, 0.76, 0.08, "#F7F3EC"], ["box", "plain", -0.25, 0.38, 0, 0.14, 0.76, 0.08, "#F7F3EC"], ["box", "plain", 0.25, 0.38, 0, 0.14, 0.76, 0.08, "#F7F3EC"], ["box", "plain", 0.75, 0.38, 0, 0.14, 0.76, 0.08, "#F7F3EC"]]
    },
    mailbox: {
      tier: 0,
      hp: 0.4,
      val: 4,
      hw: 0.2,
      hd: 0.25,
      h: 1.0,
      grab: 1,
      parts: [["box", "plain", 0, 0.4, 0, 0.08, 0.8, 0.08, "#6B4A36"], ["box", "plain", 0, 0.88, 0, 0.26, 0.24, 0.44, "#3C79C8"], ["box", "plain", 0.15, 0.98, 0.1, 0.03, 0.18, 0.06, "#D8453A"]]
    },
    bin: {
      tier: 0,
      hp: 0.4,
      val: 4,
      hw: 0.22,
      hd: 0.22,
      h: 0.8,
      grab: 1,
      parts: [["cyl", "plain", 0, 0.38, 0, 0.44, 0.76, 0.44, "#3E8A5A"], ["cyl", "plain", 0, 0.8, 0, 0.48, 0.08, 0.48, "#2F6E48"]]
    },
    phone: {
      tier: 0,
      hp: 0.6,
      val: 8,
      hw: 0.4,
      hd: 0.4,
      h: 2.3,
      grab: 1,
      parts: [["box", "plain", 0, 1.1, 0, 0.8, 2.2, 0.8, "#D8453A"], ["box", "plain", 0, 1.2, 0.41, 0.6, 1.3, 0.02, "#CFE6F2"], ["box", "plain", 0, 2.25, 0, 0.9, 0.12, 0.9, "#B83A30"]]
    },
    kiosk: {
      tier: 0,
      hp: 0.9,
      val: 14,
      hw: 0.9,
      hd: 0.7,
      h: 2.4,
      grab: 1,
      parts: [["box", "plain", 0, 0.9, 0, 1.7, 1.8, 1.3, "#3FB6A8"], ["box", "stripe", 0, 2.0, 0.45, 1.9, 0.18, 0.9, "#E8453C", 0.3, 0, 0], ["box", "plain", 0, 1.2, 0.66, 1.3, 0.6, 0.04, "#2F4063"], ["box", "plain", 0, 2.25, 0, 1.8, 0.1, 1.4, "#2E8C80"]]
    },
    cone: {
      tier: 0,
      hp: 0.3,
      val: 2,
      hw: 0.2,
      hd: 0.2,
      h: 0.6,
      grab: 1,
      parts: [["tcone", "plain", 0, 0.3, 0, 0.4, 0.6, 0.4, "#FF7A1A"], ["cyl", "plain", 0, 0.32, 0, 0.3, 0.1, 0.3, "#FFFFFF"]]
    },
    fountain: {
      tier: 0,
      hp: 1.5,
      val: 25,
      hw: 1.3,
      hd: 1.3,
      h: 1.6,
      parts: [["cyl", "plain", 0, 0.25, 0, 2.6, 0.5, 2.6, "#D9D3C4"], ["cyl", "plain", 0, 0.46, 0, 2.2, 0.1, 2.2, "#7FD1F0"], ["cyl", "plain", 0, 0.9, 0, 0.3, 1.0, 0.3, "#D9D3C4"], ["cyl", "plain", 0, 1.35, 0, 0.9, 0.15, 0.9, "#D9D3C4"], ["ball", "glow", 0, 1.6, 0, 0.5, 0.4, 0.5, "#BDEBFF"]]
    },
    slide: {
      tier: 0,
      hp: 1.1,
      val: 16,
      hw: 0.62,
      hd: 1.5,
      h: 2.2,
      grab: 1,
      parts: [["box", "plain", -0.5, 0.8, -1.02, 0.11, 1.6, 0.11, "#3C79C8"], ["box", "plain", 0.5, 0.8, -1.02, 0.11, 1.6, 0.11, "#3C79C8"], ["box", "plain", -0.5, 0.8, -0.28, 0.11, 1.6, 0.11, "#3C79C8"], ["box", "plain", 0.5, 0.8, -0.28, 0.11, 1.6, 0.11, "#3C79C8"], ["box", "plain", 0, 0.44, -1.02, 1.05, 0.08, 0.12, "#FFC53D"], ["box", "plain", 0, 0.78, -1.02, 1.05, 0.08, 0.12, "#FFC53D"], ["box", "plain", 0, 1.12, -1.02, 1.05, 0.08, 0.12, "#FFC53D"], ["box", "plain", 0, 1.46, -1.02, 1.05, 0.08, 0.12, "#FFC53D"], ["box", "plain", 0, 1.6, -0.65, 1.12, 0.1, 1.05, "#E8453C"], ["box", "plain", -0.54, 1.88, -0.65, 0.08, 0.52, 1.05, "#3C79C8"], ["box", "plain", 0.54, 1.88, -0.65, 0.08, 0.52, 1.05, "#3C79C8"], ["box", "plain", -0.5, 1.9, -1.02, 0.11, 0.62, 0.11, "#3C79C8"], ["box", "plain", 0.5, 1.9, -1.02, 0.11, 0.62, 0.11, "#3C79C8"], ["box", "plain", 0, 2.12, -1.02, 1.11, 0.1, 0.11, "#FFC53D"], ["box", "plain", 0, 1.86, -1.02, 1.11, 0.08, 0.09, "#FFC53D"], ["box", "plain", 0, 1.02, 0.6, 0.8, 0.09, 2.05, "#F2B33D", 0.62, 0, 0], ["box", "plain", -0.42, 1.1, 0.6, 0.09, 0.26, 2.05, "#E8783A", 0.62, 0, 0], ["box", "plain", 0.42, 1.1, 0.6, 0.09, 0.26, 2.05, "#E8783A", 0.62, 0, 0]]
    },
    swings: {
      tier: 0,
      hp: 0.8,
      val: 12,
      hw: 1.3,
      hd: 0.5,
      h: 1.9,
      grab: 1,
      parts: [["box", "plain", -1.2, 0.9, 0, 0.1, 1.8, 0.1, "#3C79C8"], ["box", "plain", 1.2, 0.9, 0, 0.1, 1.8, 0.1, "#3C79C8"], ["box", "plain", 0, 1.8, 0, 2.5, 0.1, 0.1, "#3C79C8"], ["box", "plain", -0.5, 0.45, 0, 0.45, 0.06, 0.26, "#D8453A"], ["box", "plain", 0.5, 0.45, 0, 0.45, 0.06, 0.26, "#FFC53D"], ["box", "plain", -0.5, 1.12, 0, 0.03, 1.3, 0.03, "#3F4457"], ["box", "plain", 0.5, 1.12, 0, 0.03, 1.3, 0.03, "#3F4457"]]
    },
    picnic: {
      tier: 0,
      hp: 0.5,
      val: 8,
      hw: 0.8,
      hd: 0.8,
      h: 0.8,
      grab: 1,
      parts: [["box", "plain", 0, 0.72, 0, 1.5, 0.08, 0.7, "#B07A4F"], ["box", "plain", 0, 0.42, 0.65, 1.5, 0.06, 0.28, "#B07A4F"], ["box", "plain", 0, 0.42, -0.65, 1.5, 0.06, 0.28, "#B07A4F"], ["box", "plain", -0.6, 0.36, 0, 0.08, 0.72, 1.3, "#8C5A3C"], ["box", "plain", 0.6, 0.36, 0, 0.08, 0.72, 1.3, "#8C5A3C"]]
    },
    hoop: {
      tier: 0,
      hp: 0.6,
      val: 8,
      hw: 0.3,
      hd: 0.5,
      h: 3.2,
      grab: 1,
      parts: [["cyl", "plain", 0, 1.4, -0.3, 0.14, 2.8, 0.14, "#3F4457"], ["box", "plain", 0, 2.9, 0, 1.2, 0.8, 0.06, "#FFFFFF"], ["cyl", "plain", 0, 2.65, 0.3, 0.5, 0.05, 0.5, "#FF7A1A"]]
    },
    busstop: {
      tier: 0,
      hp: 1,
      val: 15,
      hw: 1.3,
      hd: 0.55,
      h: 2.3,
      grab: 1,
      parts: [["box", "plain", 0, 2.2, 0, 2.5, 0.1, 1.0, "#3F4457"], ["box", "plain", 0, 1.2, -0.45, 2.4, 1.8, 0.05, "#BFE3F2"], ["box", "plain", -1.15, 1.1, 0, 0.08, 2.2, 0.08, "#3F4457"], ["box", "plain", 1.15, 1.1, 0, 0.08, 2.2, 0.08, "#3F4457"], ["box", "plain", 0, 0.45, -0.25, 1.8, 0.08, 0.35, "#B07A4F"], ["box", "ad", 0.75, 1.3, -0.4, 0.8, 1.3, 0.05, "#FFFFFF"]]
    },
    billboard: {
      tier: 0,
      hp: 1.2,
      val: 20,
      hw: 1.7,
      hd: 0.3,
      h: 4.8,
      parts: [["box", "plain", -1.1, 1.6, 0, 0.18, 3.2, 0.18, "#3F4457"], ["box", "plain", 1.1, 1.6, 0, 0.18, 3.2, 0.18, "#3F4457"], ["box", "ad", 0, 3.8, 0, 3.4, 1.3, 0.12, "#FFFFFF"], ["box", "plain", 0, 3.1, 0.2, 3.4, 0.06, 0.3, "#3F4457"]]
    },
    sedan: {
      tier: 0,
      hp: 1,
      val: 18,
      hw: 0.55,
      hd: 1.05,
      h: 1.1,
      car: 1,
      grab: 1,
      parts: [["box", "plain", 0, 0.5, 0, 1.1, 0.38, 2.1, "@car"], ["box", "plain", 0, 0.84, -0.12, 0.96, 0.34, 1.1, "#CFE6F2"], ["box", "plain", 0, 1.02, -0.12, 0.9, 0.05, 1.0, "@car"], ["box", "plain", 0, 0.3, 0, 1.0, 0.1, 1.9, "#2A2D38"]].concat(wheels(1.04, 0.62, -0.62), lights(1.1, 0.55, 1.06, -1.06))
    },
    van: {
      tier: 0,
      hp: 1.2,
      val: 22,
      hw: 0.6,
      hd: 1.15,
      h: 1.6,
      car: 1,
      grab: 1,
      parts: [["box", "plain", 0, 0.85, -0.15, 1.18, 1.1, 1.9, "@van"], ["box", "plain", 0, 0.62, 0.95, 1.18, 0.6, 0.5, "@van"], ["box", "plain", 0, 1.08, 0.8, 1.1, 0.4, 0.2, "#CFE6F2"], ["box", "plain", 0, 1.0, -0.15, 1.21, 0.28, 1.4, "#CFE6F2"]].concat(wheels(1.1, 0.72, -0.72, 0.46), lights(1.18, 0.6, 1.21, -1.11))
    },
    taxi: {
      tier: 0,
      hp: 1,
      val: 22,
      hw: 0.55,
      hd: 1.05,
      h: 1.3,
      car: 1,
      grab: 1,
      parts: [["box", "plain", 0, 0.5, 0, 1.1, 0.38, 2.1, "#F2B33D"], ["box", "plain", 0, 0.84, -0.12, 0.96, 0.34, 1.1, "#CFE6F2"], ["box", "plain", 0, 1.02, -0.12, 0.9, 0.05, 1.0, "#F2B33D"], ["box", "plain", 0, 1.14, -0.12, 0.4, 0.18, 0.24, "#2A1F3D"], ["box", "plain", 0, 0.52, 0, 1.12, 0.08, 1.4, "#2A1F3D"]].concat(wheels(1.04, 0.62, -0.62), lights(1.1, 0.55, 1.06, -1.06))
    },
    truck: {
      tier: 0,
      hp: 1.6,
      val: 30,
      hw: 0.65,
      hd: 1.6,
      h: 2.0,
      car: 1,
      grab: 1,
      parts: [["box", "plain", 0, 1.15, -0.45, 1.3, 1.6, 2.3, "@van"], ["box", "plain", 0, 0.8, 1.15, 1.2, 1.0, 0.9, "@car"], ["box", "plain", 0, 1.05, 1.58, 1.05, 0.4, 0.04, "#CFE6F2"], ["box", "plain", 0, 0.3, 0, 1.0, 0.14, 3.0, "#2A2D38"]].concat(wheels(1.2, 1.1, -1.1, 0.52), lights(1.2, 0.65, 1.61, -1.61))
    },
    bus: {
      tier: 0,
      hp: 2,
      val: 40,
      hw: 0.7,
      hd: 2.25,
      h: 2.1,
      car: 1,
      grab: 1,
      parts: [["box", "plain", 0, 1.1, 0, 1.35, 1.6, 4.5, "@bus"], ["box", "plain", 0, 1.35, -0.1, 1.38, 0.55, 3.9, "#CFE6F2"], ["box", "plain", 0, 1.2, 2.26, 1.2, 0.9, 0.04, "#CFE6F2"], ["box", "plain", 0, 1.93, 0, 1.2, 0.08, 4.2, "#F1F1EE"]].concat(wheels(1.3, 1.5, -1.5, 0.6), lights(1.35, 0.6, 2.26, -2.26))
    }
  };
  TYPES.house = {
    tier: 1,
    hp: 5,
    val: 70,
    hw: 2.3,
    hd: 2.3,
    h: 4.8,
    big: 1,
    parts: [["box", "house", 0, 1.3, 0, 4.0, 2.6, 3.6, "@wallS"], ["prism", "flat", 0, 3.4, 0, 4.5, 1.6, 4.1, "@roof"], ["box", "plain", 1.1, 3.9, -0.7, 0.5, 1.3, 0.5, "#B5654A"], ["box", "plain", 0, 0.12, 2.0, 1.4, 0.24, 0.5, "#D9D3C4"], ["box", "plain", 0, 2.62, 1.95, 1.6, 0.08, 0.5, "@roof"]]
  };
  TYPES.bungalow = {
    tier: 1,
    hp: 4,
    val: 55,
    hw: 2.7,
    hd: 2.0,
    h: 3.1,
    big: 1,
    parts: [["box", "bungalow", 0, 1.1, 0, 5.0, 2.2, 3.4, "@wallS"], ["pyr", "flat", 0, 2.6, 0, 5.5, 0.9, 3.9, "@roof"], ["box", "plain", -1.6, 0.12, 1.85, 1.2, 0.24, 0.5, "#D9D3C4"]]
  };
  TYPES.villa = {
    tier: 1,
    hp: 7,
    val: 100,
    hw: 3.4,
    hd: 2.3,
    h: 5.0,
    big: 1,
    parts: [["box", "villa", -0.9, 1.4, 0, 4.8, 2.8, 3.8, "@wallS"], ["prism", "flat", -0.9, 3.6, 0, 5.3, 1.6, 4.3, "@roof"], ["box", "plain", 2.4, 1.1, 0.2, 1.9, 2.2, 3.4, "@wallS"], ["box", "plain", 2.4, 2.3, 0.2, 2.1, 0.2, 3.6, "@roof"], ["box", "plain", 2.4, 0.8, 1.92, 1.5, 1.5, 0.04, "#8A8F9C"], ["box", "plain", -2.6, 4.0, -0.8, 0.5, 1.2, 0.5, "#B5654A"]]
  };
  TYPES.town = {
    tier: 1,
    hp: 6,
    val: 85,
    hw: 1.5,
    hd: 2.4,
    h: 8.2,
    big: 1,
    parts: [["box", "town", 0, 3.0, 0, 2.9, 6.0, 4.6, "@town"], ["prism", "flat", 0, 6.8, 0, 3.1, 1.6, 4.9, "@roof"], ["box", "plain", 0.7, 7.3, -0.6, 0.4, 1.0, 0.4, "#B5654A"], ["box", "plain", 0, 6.05, 0, 3.0, 0.12, 4.7, "#FFFFFF"], ["box", "plain", 0, 0.12, 2.45, 1.0, 0.24, 0.4, "#D9D3C4"]]
  };
  TYPES.gas = {
    tier: 1,
    hp: 4,
    val: 130,
    hw: 3.3,
    hd: 3.9,
    h: 3.8,
    big: 1,
    boom: 1,
    parts: [["box", "plain", 0, 3.3, 1.2, 6.4, 0.45, 4.2, "#F4F4F2"], ["box", "plain", 0, 3.3, 1.2, 6.5, 0.18, 4.3, "#D8453A"], ["cyl", "plain", -2.6, 1.55, -0.4, 0.26, 3.1, 0.26, "#E8E4DC"], ["cyl", "plain", 2.6, 1.55, -0.4, 0.26, 3.1, 0.26, "#E8E4DC"], ["cyl", "plain", -2.6, 1.55, 2.8, 0.26, 3.1, 0.26, "#E8E4DC"], ["cyl", "plain", 2.6, 1.55, 2.8, 0.26, 3.1, 0.26, "#E8E4DC"], ["box", "plain", -1.2, 0.7, 1.2, 0.6, 1.4, 0.45, "#D8453A"], ["box", "plain", 1.2, 0.7, 1.2, 0.6, 1.4, 0.45, "#D8453A"], ["box", "glow", -1.2, 1.2, 1.44, 0.4, 0.3, 0.03, "#BDEBFF"], ["box", "glow", 1.2, 1.2, 1.44, 0.4, 0.3, 0.03, "#BDEBFF"], ["box", "shop", 0, 1.35, -2.9, 5.0, 2.7, 2.0, "#F2E6CC"], ["box", "plain", 0, 2.75, -2.9, 5.2, 0.15, 2.2, "#D8453A"]]
  };
  TYPES.watertower = {
    tier: 1,
    hp: 4,
    val: 90,
    hw: 1.9,
    hd: 1.9,
    h: 9.8,
    big: 1,
    parts: [["cyl", "plain", -1.2, 3, -1.2, 0.2, 6, 0.2, "#8A8F9C"], ["cyl", "plain", 1.2, 3, -1.2, 0.2, 6, 0.2, "#8A8F9C"], ["cyl", "plain", -1.2, 3, 1.2, 0.2, 6, 0.2, "#8A8F9C"], ["cyl", "plain", 1.2, 3, 1.2, 0.2, 6, 0.2, "#8A8F9C"], ["box", "plain", 0, 3, 0, 2.6, 0.1, 0.1, "#8A8F9C", 0, 0.785, 0.9], ["cyl", "plain", 0, 7.3, 0, 3.6, 2.8, 3.6, "@tank"], ["cyl", "plain", 0, 7.3, 0, 3.66, 0.4, 3.66, "#FFFFFF"], ["cone", "flat", 0, 9.2, 0, 4.0, 1.2, 4.0, "#5E6A7A"]]
  };
  TYPES.shop = {
    tier: 2,
    hp: 8,
    val: 130,
    hw: 3.0,
    hd: 3.4,
    h: 5.8,
    big: 2,
    parts: [["box", "shop", 0, 2.6, 0, 6, 5.2, 6, "@wallM"], ["box", "plain", 0, 5.3, 0, 6.3, 0.25, 6.3, "#ECE6DA"], ["box", "stripe", 0, 1.9, 3.35, 5.4, 0.2, 1.1, "@awn", 0.35, 0, 0], ["box", "glow", 0, 2.55, 3.04, 3.6, 0.6, 0.1, "#FFF6E0"], ["box", "plain", -1.5, 5.8, -1.2, 1.4, 0.8, 1.2, "#A9ADB8"], ["box", "plain", 1.6, 5.7, 1.0, 1.0, 0.6, 1.0, "#A9ADB8"]]
  };
  TYPES.apt = {
    tier: 2,
    hp: 10,
    val: 170,
    hw: 3.3,
    hd: 3.3,
    h: 12.3,
    big: 2,
    parts: [["box", "apt", 0, 4.8, 0, 6.4, 9.6, 6.4, "@wallM"], ["box", "plain", 0, 9.72, 0, 6.7, 0.25, 6.7, "#ECE6DA"], ["cyl", "plain", 1.4, 10.9, 1.2, 1.5, 1.6, 1.5, "#9A6B4A"], ["cone", "flat", 1.4, 12.0, 1.2, 1.7, 0.6, 1.7, "#7A5238"], ["box", "plain", 1.4, 10.1, 1.2, 1.2, 0.5, 1.2, "#5A5E6B"], ["box", "plain", -1.6, 10.2, -1.4, 1.4, 0.7, 1.4, "#A9ADB8"]]
  };
  TYPES.apt2 = {
    tier: 2,
    hp: 10,
    val: 170,
    hw: 3.3,
    hd: 3.3,
    h: 12.3,
    big: 2,
    parts: [["box", "apt", 0, 4.8, 0, 6.4, 9.6, 6.4, "@wallM"], ["box", "plain", 0, 9.72, 0, 6.7, 0.25, 6.7, "#ECE6DA"], ["box", "ad", 0, 11.3, -0.8, 5.2, 1.8, 0.14, "#FFFFFF"], ["box", "plain", -1.8, 10.4, -0.9, 0.12, 1.2, 0.12, "#3F4457"], ["box", "plain", 1.8, 10.4, -0.9, 0.12, 1.2, 0.12, "#3F4457"], ["box", "plain", 1.5, 10.2, 1.6, 1.4, 0.7, 1.4, "#A9ADB8"]]
  };
  TYPES.church = {
    tier: 2,
    hp: 10,
    val: 210,
    hw: 2.6,
    hd: 5.9,
    h: 14.5,
    big: 2,
    parts: [["box", "church", 0, 2.4, -1.0, 4.4, 4.8, 7.6, "#F3EBDC"], ["prism", "flat", 0, 5.8, -1.0, 4.9, 2.2, 8.0, "#8C3B2F"], ["box", "plain", 0, 4.6, 4.2, 2.6, 9.2, 2.6, "#EFE5D2"], ["box", "plain", 0, 7.6, 5.52, 1.0, 1.0, 0.05, "#FFFFFF"], ["box", "plain", 0, 7.6, 5.53, 0.1, 0.8, 0.05, "#2A1F1A"], ["pyr", "flat", 0, 11.2, 4.2, 2.9, 4.2, 2.9, "#3E63B8"], ["box", "glow", 0, 13.8, 4.2, 0.12, 1.2, 0.12, "#FFD23F"], ["box", "glow", 0, 13.9, 4.2, 0.6, 0.12, 0.12, "#FFD23F"], ["box", "plain", 0, 1.2, 5.55, 1.2, 2.4, 0.05, "#6B4636"]]
  };
  TYPES.school = {
    tier: 2,
    hp: 11,
    val: 200,
    hw: 5.6,
    hd: 2.8,
    h: 7.5,
    big: 2,
    parts: [["box", "school", 0, 2.5, 0, 11, 5, 5, "#E8A06A"], ["box", "plain", 0, 5.12, 0, 11.3, 0.25, 5.3, "#ECE6DA"], ["box", "plain", 0, 2.8, 2.7, 3, 5.6, 0.8, "#D9D3C4"], ["box", "plain", 0, 4.9, 3.12, 2.2, 0.6, 0.05, "#3E63B8"], ["cyl", "plain", 4.8, 3.7, 2.6, 0.12, 7.4, 0.12, "#A9ADB8"], ["box", "plain", 5.3, 6.8, 2.6, 1.0, 0.6, 0.04, "#E8453C"]]
  };
  TYPES.factory = {
    tier: 2,
    hp: 12,
    val: 230,
    hw: 4.6,
    hd: 3.6,
    h: 13.5,
    big: 2,
    smoke: [[3.4, 13.6, -2.2], [1.8, 11.6, -2.2]],
    parts: [["box", "factory", 0, 2.5, 0, 9, 5, 7, "#C9B79C"], ["prism", "flat", -3, 5.6, 0, 3, 1.2, 7, "#8A8F9C"], ["prism", "flat", 0, 5.6, 0, 3, 1.2, 7, "#8A8F9C"], ["prism", "flat", 3, 5.6, 0, 3, 1.2, 7, "#8A8F9C"], ["cyl", "plain", 3.4, 6.8, -2.2, 1.0, 13.6, 1.0, "#B5503F"], ["cyl", "plain", 3.4, 12.2, -2.2, 1.06, 0.6, 1.06, "#F4F1EA"], ["cyl", "plain", 1.8, 5.8, -2.2, 0.8, 11.6, 0.8, "#B5503F"], ["cyl", "plain", 1.8, 10.4, -2.2, 0.86, 0.5, 0.86, "#F4F1EA"]]
  };
  TYPES.warehouse = {
    tier: 2,
    hp: 9,
    val: 150,
    hw: 4.1,
    hd: 3.1,
    h: 5.2,
    big: 2,
    parts: [["box", "warehouse", 0, 2.3, 0, 8, 4.6, 6, "@van"], ["prism", "flat", 0, 5.0, 0, 8.2, 0.9, 6.2, "#8A8F9C"], ["box", "plain", 0, 4.1, 3.05, 8.1, 0.3, 0.1, "#F2B33D"]]
  };
  TYPES.frame = {
    tier: 2,
    hp: 6,
    val: 120,
    hw: 3,
    hd: 3,
    h: 9.4,
    big: 2,
    parts: [["box", "plain", -2.8, 4.6, -2.8, 0.4, 9.2, 0.4, "#B9BEC6"], ["box", "plain", 2.8, 4.6, -2.8, 0.4, 9.2, 0.4, "#B9BEC6"], ["box", "plain", -2.8, 4.6, 2.8, 0.4, 9.2, 0.4, "#B9BEC6"], ["box", "plain", 2.8, 4.6, 2.8, 0.4, 9.2, 0.4, "#B9BEC6"], ["box", "plain", 0, 3.1, 0, 6, 0.3, 6, "#C9CED6"], ["box", "plain", 0, 6.2, 0, 6, 0.3, 6, "#C9CED6"], ["box", "plain", -1.2, 7.4, -1.2, 2.2, 2.2, 2.2, "#E8A06A"], ["box", "plain", 0, 9.25, 0, 6, 0.3, 6, "#C9CED6"]]
  };
  TYPES.crane = {
    tier: 2,
    hp: 6,
    val: 160,
    hw: 0.9,
    hd: 0.9,
    h: 23,
    big: 2,
    parts: [["box", "plain", 0, 11, 0, 0.9, 22, 0.9, "#F2B33D"], ["box", "plain", 4, 22.4, 0, 14, 0.7, 0.8, "#F2B33D"], ["box", "plain", -2.4, 21.6, 0, 1.8, 1.4, 1.2, "#5A5E6B"], ["box", "plain", 0.9, 21.4, 0, 1.4, 1.3, 1.3, "#E8E4DC"], ["box", "plain", 9.5, 17.5, 0, 0.05, 9.4, 0.05, "#2A2D38"], ["box", "plain", 9.5, 12.8, 0, 1.4, 0.6, 1.4, "#6B7B4A"], ["box", "plain", 0, 0.3, 0, 2.0, 0.6, 2.0, "#8A8F9C"]]
  };
  TYPES.office = {
    tier: 3,
    hp: 14,
    val: 260,
    hw: 3.1,
    hd: 3.1,
    h: 14,
    big: 3,
    parts: [["box", "office", 0, 6.5, 0, 6, 13, 6, "@wallT"], ["box", "plain", 0, 13.1, 0, 6.2, 0.3, 6.2, "#E6E9EF"], ["box", "plain", 0, 13.8, 0, 3.6, 1.2, 3.6, "#C9CED6"], ["box", "plain", 0, 0.9, 3.05, 3, 1.8, 0.12, "#2F4063"]]
  };
  TYPES.office2 = {
    tier: 3,
    hp: 15,
    val: 300,
    hw: 3.1,
    hd: 3.1,
    h: 19,
    big: 3,
    parts: [["box", "office", 0, 5, 0, 6, 10, 6, "@wallT"], ["box", "plain", 0, 10.1, 0, 6.2, 0.25, 6.2, "#E6E9EF"], ["box", "office", 0, 14, 0, 4.4, 8, 4.4, "@wallT"], ["box", "plain", 0, 18.1, 0, 4.6, 0.25, 4.6, "#E6E9EF"], ["box", "plain", -1, 18.7, 1, 1.2, 1, 1.2, "#A9ADB8"]]
  };
  TYPES.tower = {
    tier: 3,
    hp: 16,
    val: 320,
    hw: 3.1,
    hd: 3.1,
    h: 18.5,
    big: 3,
    parts: [["box", "tower", 0, 8, 0, 6, 16, 6, "@wallT"], ["box", "plain", 0, 16.8, 0, 4.2, 1.6, 4.2, "@wallT"], ["box", "plain", 0, 17.7, 0, 3.0, 0.3, 3.0, "#E6E9EF"], ["cyl", "plain", 1, 18.6, 1, 0.12, 1.6, 0.12, "#3F4457"]]
  };
  TYPES.sky = {
    tier: 3,
    hp: 20,
    val: 480,
    hw: 3.1,
    hd: 3.1,
    h: 26.5,
    big: 3,
    parts: [["box", "sky", 0, 10, 0, 6, 20, 6, "@wallT"], ["box", "sky", 0, 21.5, 0, 4.4, 3, 4.4, "@wallT"], ["box", "plain", 0, 23.1, 0, 3.4, 0.3, 3.4, "#E6E9EF"], ["cyl", "plain", 0, 24.6, 0, 0.22, 3.0, 0.22, "#D8453A"], ["ball", "glow", 0, 26.2, 0, 0.35, 0.35, 0.35, "#FF5A4A"]]
  };
  TYPES.radio = {
    tier: 3,
    hp: 12,
    val: 280,
    hw: 1.4,
    hd: 1.4,
    h: 28,
    big: 3,
    parts: [["tcone", "plain", 0, 13, 0, 2.6, 26, 2.6, "#E8453C"], ["cyl", "plain", 0, 8, 0, 1.9, 1.2, 1.9, "#FFFFFF"], ["cyl", "plain", 0, 16, 0, 1.4, 1.2, 1.4, "#FFFFFF"], ["cyl", "plain", 0, 27, 0, 0.14, 2, 0.14, "#3F4457"], ["ball", "glow", 0, 28.1, 0, 0.5, 0.5, 0.5, "#FF5A4A"]]
  };
  TYPES.stadium = {
    tier: 3,
    hp: 32,
    val: 1000,
    hw: 6.4,
    hd: 5.4,
    h: 9,
    big: 3,
    parts: [["ring", "dbl", 0, 2.2, 0, 12.6, 4.4, 10.6, "#E8E4DC"], ["ring", "dbl", 0, 4.7, 0, 13.0, 0.6, 11.0, "#E8453C"], ["cyl", "plain", 0, 0.25, 0, 12.2, 0.3, 10.2, "#5DBB4F"], ["box", "plain", 0, 0.42, 0, 0.12, 0.02, 8.6, "#FFFFFF"], ["cyl", "plain", 0, 0.42, 0, 2.2, 0.02, 2.2, "#FFFFFF"], ["cyl", "plain", 5.6, 4.5, 4.6, 0.3, 9, 0.3, "#3F4457"], ["cyl", "plain", -5.6, 4.5, -4.6, 0.3, 9, 0.3, "#3F4457"], ["box", "glow", 5.6, 9, 4.6, 1.6, 0.8, 0.3, "#FFF6D8", 0, 0.7, 0], ["box", "glow", -5.6, 9, -4.6, 1.6, 0.8, 0.3, "#FFF6D8", 0, 0.7, 0]]
  };
  PAL.toyWall = ["#E8453C", "#F2B33D", "#3DBB6E", "#3C79C8", "#8A5CF6", "#FF7AB6", "#23B5C9", "#FFF1D6"];
  PAL.toyRoof = ["#E0402F", "#3E63B8", "#3F9A55", "#D9702C", "#8A5CF6", "#F2B33D"];
  TYPES.playhouse = {
    tier: 0,
    hp: 2.8,
    val: 45,
    hw: 1.05,
    hd: 0.98,
    h: 2.45,
    parts: [["box", "plain", 0, 0.22, 0, 2.08, 0.44, 1.92, "#C98C4E"], ["box", "plain", 0, 0.98, 0, 2.0, 1.52, 1.84, "#F0C083"], ["box", "plain", 0, 1.72, 0, 2.18, 0.1, 2.0, "#F7F3EC"], ["prism", "flat", 0, 2.06, 0, 2.3, 0.78, 2.04, "#E8453C"], ["box", "plain", 0, 0.73, 0.93, 0.62, 1.06, 0.06, "#8C5A3C"], ["ball", "plain", 0.22, 0.73, 0.99, 0.11, 0.11, 0.11, "#FFC53D"], ["box", "plain", -0.64, 1.2, 0.93, 0.54, 0.54, 0.06, "#BFE3F2"], ["box", "plain", -0.64, 1.2, 0.96, 0.6, 0.08, 0.04, "#F7F3EC"], ["box", "plain", -0.64, 1.2, 0.96, 0.08, 0.6, 0.04, "#F7F3EC"], ["box", "plain", 0.66, 1.2, -0.93, 0.54, 0.54, 0.06, "#BFE3F2"], ["box", "plain", 0, 0.07, 1.2, 1.3, 0.14, 0.55, "#C98C4E"]]
  };
  TYPES.seesaw = {
    tier: 0,
    hp: 0.6,
    val: 12,
    hw: 0.3,
    hd: 1.35,
    h: 0.95,
    grab: 1,
    parts: [["box", "plain", 0, 0.28, 0, 0.34, 0.56, 0.46, "#3C79C8"], ["box", "plain", 0, 0.62, 0, 0.36, 0.12, 2.6, "#F2B33D", 0.14, 0, 0], ["box", "plain", 0, 0.95, -1.12, 0.4, 0.3, 0.1, "#E8453C"], ["box", "plain", 0, 0.58, 1.12, 0.4, 0.3, 0.1, "#E8453C"], ["box", "plain", 0, 0.78, -1.02, 0.5, 0.1, 0.34, "#E8453C"], ["box", "plain", 0, 0.42, 1.02, 0.5, 0.1, 0.34, "#3DBB6E"]]
  };
  TYPES.springy = {
    tier: 0,
    hp: 0.4,
    val: 10,
    hw: 0.32,
    hd: 0.46,
    h: 0.98,
    grab: 1,
    parts: [["cyl", "plain", 0, 0.2, 0, 0.13, 0.4, 0.13, "#F2B33D"], ["box", "plain", 0, 0.6, -0.02, 0.5, 0.42, 0.9, "#3DBB6E"], ["ball", "plain", 0, 0.8, 0.42, 0.44, 0.42, 0.4, "#3DBB6E"], ["box", "plain", 0, 0.86, -0.42, 0.12, 0.34, 0.12, "#2E9E3A"], ["cyl", "plain", -0.3, 0.72, 0.02, 0.06, 0.34, 0.06, "#2F4063", 0, 0, 1.5708], ["ball", "plain", -0.16, 0.88, 0.62, 0.1, 0.1, 0.1, "#161020"], ["ball", "plain", 0.16, 0.88, 0.62, 0.1, 0.1, 0.1, "#161020"]]
  };
  TYPES.sandtoys = {
    tier: 0,
    hp: 0.3,
    val: 6,
    hw: 0.34,
    hd: 0.3,
    h: 0.4,
    grab: 1,
    parts: [["tcone", "plain", -0.14, 0.17, 0, 0.34, 0.34, 0.34, "#E8453C", 3.1416, 0, 0], ["box", "plain", 0.26, 0.03, 0.12, 0.16, 0.05, 0.3, "#3C79C8"], ["box", "plain", 0.26, 0.14, -0.1, 0.05, 0.24, 0.05, "#3C79C8", 0.5, 0, 0], ["ball", "plain", -0.1, 0.16, 0.42, 0.3, 0.3, 0.3, "#FFC53D"]]
  };
  TYPES.toyblock = {
    tier: 0,
    hp: 0.45,
    val: 15,
    hw: 0.45,
    hd: 0.42,
    h: 1.02,
    grab: 1,
    toy: 1,
    parts: [["box", "plain", 0, 0.31, 0, 0.86, 0.62, 0.78, "@toyWall"], ["prism", "flat", 0, 0.8, 0, 0.96, 0.36, 0.84, "@toyRoof"], ["box", "plain", 0, 0.17, 0.4, 0.24, 0.34, 0.04, "#F7F3EC"], ["box", "plain", -0.24, 0.46, 0.4, 0.2, 0.2, 0.04, "#F7F3EC"], ["box", "plain", 0.24, 0.46, 0.4, 0.2, 0.2, 0.04, "#F7F3EC"], ["cyl", "plain", 0.26, 1.0, -0.14, 0.13, 0.28, 0.13, "#F7F3EC"]]
  };
  ["house", "bungalow", "town", "sedan", "van", "taxi", "bus", "tree", "pine", "lamp"].forEach(function (k) {
    var T = TYPES[k];
    TYPES["toy_" + k] = Object.assign({}, T, {
      tier: 0,
      hp: 0.45,
      val: T.car ? 14 : 18,
      big: 0,
      grab: 1,
      toy: 1
    });
  });
  var CARS = ["sedan", "sedan", "sedan", "sedan", "van", "taxi", "truck"];
  var MAP = 84,
    GRID = [],
    CENTERS = [];
  var PLATE = 0.09;
  var placeY = 0;
  function groundAt(x, z) {
    var bx = Math.round((x - 10) / 20) * 20 + 10,
      bz = Math.round((z - 10) / 20) * 20 + 10;
    if (Math.abs(bx) > 70 || Math.abs(bz) > 70) return 0;
    return Math.abs(x - bx) < 6.25 && Math.abs(z - bz) < 6.25 ? PLATE : 0;
  }
  for (var gi = -80; gi <= 80; gi += 20) GRID.push(gi);
  for (gi = -70; gi <= 70; gi += 20) CENTERS.push(gi);
  var objects = [],
    bigObjects = [],
    movers = [],
    partMeshes = {},
    cityGroup = null,
    totalValue = 0,
    decor = [],
    blockInfo = [];
  function addObj(type, x, z, rotQuarter, sc, sy) {
    var T = TYPES[type],
      r = (rotQuarter || 0) & 3;
    sc = sc || 1;
    sy = sy || 1;
    var o = {
      type: type,
      T: T,
      x: x,
      z: z,
      y0: placeY,
      rotQ: r,
      rot: r * Math.PI / 2,
      sc: sc,
      sy: sy,
      hw: (r % 2 ? T.hd : T.hw) * sc,
      hd: (r % 2 ? T.hw : T.hd) * sc,
      h: T.h * sc * sy,
      hp: T.hp * 1.3 * (0.7 + 0.3 * sy),
      alive: true,
      parts: [],
      state: 0,
      st: 0,
      cd: 1,
      burn: 0,
      flash: 0,
      wob: 0,
      tint: 0,
      active: false,
      tilt: new THREE.Vector3(),
      pal: {},
      adIdx: srand() * ADS.length | 0,
      qs: 0
    };
    T.parts.forEach(function (p) {
      var matKey = p[1],
        key;
      if (matKey in BMAT) key = type + "|" + matKey;else if (matKey === "ad") key = p[0] + "|ad" + o.adIdx;else key = p[0] + "|" + matKey;
      var col = p[8];
      if (col.charAt(0) === "@") {
        var pk = col.slice(1);
        if (!o.pal[pk]) o.pal[pk] = spick(PAL[pk]);
        col = o.pal[pk];
      }
      var local = new THREE.Matrix4().compose(new THREE.Vector3(p[2], p[3], p[4]), new THREE.Quaternion().setFromEuler(new THREE.Euler(p[9] || 0, p[10] || 0, p[11] || 0)), new THREE.Vector3(p[5], p[6], p[7]));
      if (!partMeshes[key]) partMeshes[key] = {
        geom: G[p[0]],
        mat: BMAT[matKey] || (matKey === "ad" ? ADS[o.adIdx] : MAT[matKey]),
        list: []
      };
      o.parts.push({
        pm: partMeshes[key],
        idx: 0,
        local: local,
        color: new THREE.Color(col)
      });
    });
    objects.push(o);
    return o;
  }
  var PG = {},
    PGC = 6;
  function pgAdd(b) {
    for (var ix = Math.floor((b.x - b.hw) / PGC); ix <= Math.floor((b.x + b.hw) / PGC); ix++) for (var iz = Math.floor((b.z - b.hd) / PGC); iz <= Math.floor((b.z + b.hd) / PGC); iz++) {
      var k = ix * 4096 + iz;
      (PG[k] = PG[k] || []).push(b);
    }
  }
  function fits(x, z, hw, hd, m) {
    m = m === undefined ? 0.25 : m;
    for (var ix = Math.floor((x - hw - m) / PGC); ix <= Math.floor((x + hw + m) / PGC); ix++) for (var iz = Math.floor((z - hd - m) / PGC); iz <= Math.floor((z + hd + m) / PGC); iz++) {
      var L = PG[ix * 4096 + iz];
      if (!L) continue;
      for (var i = 0; i < L.length; i++) {
        var b = L[i];
        if (Math.abs(b.x - x) < b.hw + hw + m && Math.abs(b.z - z) < b.hd + hd + m) return false;
      }
    }
    return true;
  }
  function reserve(x, z, hw, hd) {
    pgAdd({
      x: x,
      z: z,
      hw: hw,
      hd: hd
    });
  }
  function place(type, x, z, rq, sc, sy, force) {
    var T = TYPES[type],
      r = (rq || 0) & 3,
      s = sc || 1;
    var hw = (r % 2 ? T.hd : T.hw) * s,
      hd = (r % 2 ? T.hw : T.hd) * s;
    if (!force && !T.big && !fits(x, z, hw, hd, Math.min(0.25, 0.1 + 0.3 * Math.min(hw, hd)))) return null;
    var o = addObj(type, x, z, r, sc, sy);
    pgAdd(o);
    return o;
  }
  function addDecor(geom, color, x, y, z, sx, sy, sz, ry) {
    decor.push([geom, color, new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, ry || 0, 0)), new THREE.Vector3(sx, sy, sz))]);
  }
  var OG = {},
    OGC = 12,
    qStamp = 1;
  function ogBuild() {
    OG = {};
    objects.forEach(function (o) {
      if (o.mv) return;
      for (var ix = Math.floor((o.x - o.hw) / OGC); ix <= Math.floor((o.x + o.hw) / OGC); ix++) for (var iz = Math.floor((o.z - o.hd) / OGC); iz <= Math.floor((o.z + o.hd) / OGC); iz++) {
        var k = ix * 4096 + iz;
        (OG[k] = OG[k] || []).push(o);
      }
    });
  }
  function eachNear(x, z, r, fn, withMovers) {
    var st = ++qStamp;
    for (var ix = Math.floor((x - r) / OGC); ix <= Math.floor((x + r) / OGC); ix++) for (var iz = Math.floor((z - r) / OGC); iz <= Math.floor((z + r) / OGC); iz++) {
      var L = OG[ix * 4096 + iz];
      if (!L) continue;
      for (var i = 0; i < L.length; i++) {
        var o = L[i];
        if (o.qs === st) continue;
        o.qs = st;
        if (o.alive) fn(o);
      }
    }
    if (withMovers !== false) for (var j = 0; j < movers.length; j++) {
      var m = movers[j];
      if (m.alive && Math.abs(m.x - x) < r + 3 && Math.abs(m.z - z) < r + 3) fn(m);
    }
  }
  var STAGES = [{
    name: "Maple Grove",
    desc: "A sleepy small town with a main street, a church and a lake shore.",
    time: 240,
    diff: 0,
    par: 0,
    layout: "suburb",
    tankFrom: 2,
    heliFrom: 3
  }, {
    name: "Midtown",
    desc: "Apartments, an industrial harbor and a construction boom.",
    time: 270,
    diff: 0.5,
    par: 0,
    layout: "mid",
    tankFrom: 1,
    heliFrom: 2
  }, {
    name: "Metro Core",
    desc: "High-rises, a stadium and the whole army.",
    time: 300,
    diff: 1,
    par: 0,
    layout: "metro",
    tankFrom: 1,
    heliFrom: 1
  }, {
    name: "Steel District",
    desc: "The same skyline, sharper rivals. They hit harder and they waste nothing.",
    time: 300,
    diff: 1,
    par: 0.5,
    layout: "metro",
    tankFrom: 1,
    heliFrom: 1
  }, {
    name: "Kaiju Kingdom",
    desc: "Four rivals with your exact stats. Same damage, same hide, no handicap.",
    time: 300,
    diff: 1,
    par: 1,
    layout: "metro",
    tankFrom: 1,
    heliFrom: 1
  }];
  function zoneFor(layout, cx, cz) {
    var ring = Math.max(Math.abs(cx), Math.abs(cz)),
      k = cx + "," + cz,
      r = srand();
    var special = {
      suburb: {
        "10,10": "plaza",
        "-30,10": "church",
        "30,-10": "school",
        "-10,30": "gasMix",
        "50,30": "gasMix",
        "-50,-30": "gasMix",
        "-30,-30": "park",
        "30,30": "sports",
        "-50,50": "tower",
        "70,-70": "forest",
        "-70,-70": "forest",
        "50,-50": "park",
        "-70,30": "park",
        "10,-50": "suburb",
        "-10,-70": "park",
        "70,50": "park"
      },
      mid: {
        "-10,10": "plaza",
        "10,-30": "construction",
        "-30,-10": "church",
        "30,30": "park",
        "-50,-50": "school",
        "-30,50": "sports",
        "-70,-30": "gasMix",
        "10,-70": "playground",
        "-10,-70": "park",
        "-50,10": "construction",
        "-70,70": "forest"
      },
      metro: {
        "10,10": "stadium",
        "-10,-10": "plaza",
        "30,-10": "construction",
        "-30,30": "construction",
        "-50,-30": "park",
        "50,-50": "sports",
        "-10,-70": "park",
        "10,-70": "playground",
        "-70,-70": "school",
        "70,-30": "gasMix",
        "-30,-50": "church"
      }
    }[layout];
    if (k === "10,-70" && layout === "suburb") return "toytown";
    if (special[k]) return special[k];
    if (layout === "suburb") {
      if (ring === 10) return r < 0.5 ? "main" : "mainMix";
      if (ring === 70) return r < 0.25 ? "woods" : "suburb";
      return r < 0.12 ? "park" : "suburb";
    }
    if (layout === "mid") {
      if (cz >= 50 && cx >= -10) return r < 0.55 ? "industrial" : "yard";
      if (ring === 10) return "office";
      if (ring === 30) return r < 0.5 ? "mixed" : "main";
      if (ring === 50) return r < 0.5 ? "mixed" : r < 0.8 ? "mainMix" : "suburb";
      return r < 0.7 ? "suburb" : "park";
    }
    if (cz >= 50) return r < 0.6 ? "industrial" : "yard";
    if (ring === 10) return "down";
    if (ring === 30) return r < 0.6 ? "down" : "office";
    if (ring === 50) return r < 0.5 ? "office" : "mixed";
    return r < 0.55 ? "mixed" : r < 0.8 ? "main" : "suburb";
  }
  var ZONE_COL = {
    park: "#93CF6F",
    playground: "#93CF6F",
    toytown: "#93CF6F",
    sports: "#93CF6F",
    forest: "#7CC35E",
    woods: "#8DCB6A",
    suburb: "#9AD276",
    church: "#9AD276",
    school: "#C9C1AE",
    gasMix: "#CFC8BA",
    tower: "#93CF6F",
    plaza: "#E4DCCB",
    main: "#CFC8BA",
    mainMix: "#CFC8BA",
    mixed: "#CFC8BA",
    office: "#C4C0B8",
    down: "#C4C0B8",
    construction: "#C9B08A",
    industrial: "#BDB8AE",
    yard: "#BDB8AE",
    stadium: "#C4C0B8"
  };
  function buildCity(stageIdx) {
    if (cityGroup) {
      cityGroup.traverse(function (o) {
        if (o.isInstancedMesh) o.dispose();
      });
      scene.remove(cityGroup);
    }
    cityGroup = new THREE.Group();
    scene.add(cityGroup);
    objects = [];
    bigObjects = [];
    movers = [];
    partMeshes = {};
    decor = [];
    PG = {};
    blockInfo = [];
    seed = 4321 + stageIdx * 997;
    var layout = STAGES[stageIdx].layout;
    var ground = new THREE.Mesh(new THREE.PlaneGeometry(900, 900), toon({
      color: "#8BC968"
    }));
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.02;
    ground.receiveShadow = true;
    cityGroup.add(ground);
    var asphalt = new THREE.Mesh(new THREE.PlaneGeometry(172, 172), toon({
      color: "#6B7086"
    }));
    asphalt.rotation.x = -Math.PI / 2;
    asphalt.receiveShadow = true;
    cityGroup.add(asphalt);
    var sea = new THREE.Mesh(new THREE.PlaneGeometry(900, 400), toon({
      color: "#3FA9E0"
    }));
    sea.rotation.x = -Math.PI / 2;
    sea.position.set(0, -0.35, 297);
    cityGroup.add(sea);
    var sand = new THREE.Mesh(new THREE.PlaneGeometry(900, 12), toon({
      color: "#F2D9A0"
    }));
    sand.rotation.x = -Math.PI / 2;
    sand.position.set(0, -0.01, 92);
    sand.receiveShadow = true;
    cityGroup.add(sand);
    for (var px = -70; px <= 70; px += 35) {
      addDecor("box", "#A9764F", px, 0.2, 104, 3, 0.25, 22);
      addDecor("box", "#A9764F", px + 3, 0.2, 114, 6, 0.25, 3);
      addDecor("box", pick(["#F4F4F2", "#E8453C", "#3E63B8"]), px + 6, 0.3, 102 + rr(0, 10), 2.2, 0.9, 5.5);
      addDecor("box", "#F4F4F2", px + 6, 1.1, 101 + rr(0, 10), 1.4, 0.8, 1.8);
    }
    for (px = -200; px <= 200; px += 7) if (Math.abs(px) > 5) addDecor("box", "#E8E0C8", px, 0.05, 88.5, 5.5, 0.1, 1.2);
    CENTERS.forEach(function (cx) {
      CENTERS.forEach(function (cz) {
        var zone = zoneFor(layout, cx, cz);
        blockInfo.push({
          x: cx,
          z: cz,
          zone: zone
        });
        addDecor("box", "#D9D3C4", cx, (PLATE - 0.01) / 2, cz, 14.4, PLATE - 0.01, 14.4);
        addDecor("box", ZONE_COL[zone] || "#CFC8BA", cx, PLATE / 2, cz, 12.6, PLATE, 12.6);
        placeY = PLATE;
        fillBlock(zone, cx, cz);
        placeY = 0;
      });
    });
    GRID.forEach(function (g) {
      for (var t = -83; t <= 83; t += 4) {
        if (GRID.some(function (h) {
          return Math.abs(t - h) < 5;
        })) continue;
        addDecor("box", "#F4EFD8", g, 0.015, t, 0.18, 0.02, 1.6);
        addDecor("box", "#F4EFD8", t, 0.015, g, 1.6, 0.02, 0.18);
      }
    });
    GRID.forEach(function (gx) {
      GRID.forEach(function (gz) {
        [[0, -4.2], [0, 4.2], [-4.2, 0], [4.2, 0]].forEach(function (o) {
          for (var k = -2; k <= 2; k++) {
            if (o[0] === 0) addDecor("box", "#F4F1E8", gx + k * 1.1, 0.018, gz + o[1], 0.6, 0.02, 1.6);else addDecor("box", "#F4F1E8", gx + o[0], 0.018, gz + k * 1.1, 1.6, 0.02, 0.6);
          }
        });
        if (Math.abs(gx) < 80 && Math.abs(gz) < 80 && srand() < 0.55) {
          place("signal", gx + 3.6, gz - 3.6, 2);
          place("signal", gx - 3.6, gz + 3.6, 0);
        }
      });
    });
    GRID.forEach(function (g) {
      [[1, -1.5], [-1, 1.5]].forEach(function (L) {
        var n = 3 + (srand() * 2 | 0),
          off = rr(0, 172),
          sp = rr(4.5, 6.5);
        for (var i = 0; i < n; i++) {
          var t = (off + i * 172 / n) % 172 - 86;
          var o = addObj(srand() < 0.1 ? "bus" : spick(CARS), g + L[1], t, L[0] > 0 ? 0 : 2);
          o.mv = {
            axis: "z",
            dir: L[0],
            sp: sp
          };
          movers.push(o);
          var o2 = addObj(srand() < 0.1 ? "bus" : spick(CARS), -t, g - L[1], L[0] > 0 ? 1 : 3);
          o2.mv = {
            axis: "x",
            dir: L[0],
            sp: sp
          };
          movers.push(o2);
        }
      });
      CENTERS.forEach(function (a) {
        if (srand() < 0.4) {
          var side = srand() < 0.5 ? 1 : -1;
          place(spick(CARS), g + 2.5 * side, a + rr(-4, 4), side > 0 ? 0 : 2);
        }
        if (srand() < 0.4) {
          side = srand() < 0.5 ? 1 : -1;
          place(spick(CARS), a + rr(-4, 4), g + 2.5 * side, side > 0 ? 1 : 3);
        }
      });
    });
    SPAWNS.forEach(function (sp, si) {
      if (si === 0) return;
      objects = objects.filter(function (o) {
        return o.mv || !(Math.abs(o.x - sp[0]) < 4.5 && Math.abs(o.z - sp[1]) < 4.5);
      });
      movers.forEach(function (o) {
        if (Math.abs(o.x - sp[0]) < 4 && Math.abs(o.z - sp[1]) < 4) {
          if (o.mv.axis === "z") o.z += 9;else o.x += 9;
        }
      });
    });
    objects.forEach(function (o) {
      o.parts.forEach(function (p) {
        p.idx = p.pm.list.length;
        p.pm.list.push(o);
      });
      if (o.T.big) bigObjects.push(o);
    });
    Object.keys(partMeshes).forEach(function (k) {
      var pm = partMeshes[k];
      pm.mesh = new THREE.InstancedMesh(pm.geom, pm.mat, pm.list.length);
      pm.mesh.castShadow = true;
      pm.mesh.receiveShadow = true;
      pm.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      pm.mesh.frustumCulled = false;
      cityGroup.add(pm.mesh);
    });
    totalValue = 0;
    objects.forEach(function (o) {
      if (!o.mv) totalValue += o.T.val;
    });
    ogBuild();
    var byGeom = {};
    decor.forEach(function (d) {
      (byGeom[d[0]] = byGeom[d[0]] || []).push(d);
    });
    Object.keys(byGeom).forEach(function (gk) {
      var list = byGeom[gk],
        m = new THREE.InstancedMesh(G[gk], MAT.plain, list.length);
      list.forEach(function (d, i) {
        m.setMatrixAt(i, d[2]);
        m.setColorAt(i, C1.set(d[1]));
      });
      m.receiveShadow = true;
      cityGroup.add(m);
    });
    var hills = new THREE.InstancedMesh(G.ico, toon({
        color: "#FFFFFF"
      }), 40),
      hn = 0;
    for (var i = 0; i < 60 && hn < 40; i++) {
      var a = i / 60 * 6.283,
        R = rr(150, 190),
        hx = Math.cos(a) * R,
        hz = Math.sin(a) * R;
      if (hz > 60) continue;
      var sc = rr(30, 62);
      M1.compose(V1.set(hx, -sc * 0.25, hz), Q1.identity(), V2.set(sc * 1.6, sc, sc * 1.6));
      hills.setMatrixAt(hn, M1);
      hills.setColorAt(hn++, C1.set(spick(["#7DBF63", "#6FB35C", "#8CCB6E", "#9BD27A"])));
    }
    hills.count = hn;
    cityGroup.add(hills);
    var rimList = [];
    for (var side = 0; side < 3; side++) for (var t2 = -130; t2 <= 130; t2 += Q.s.rim) {
      var d = rr(MAP + 8, MAP + 45),
        x = side === 0 ? t2 : side === 1 ? -d : d,
        z = side === 0 ? -d : t2;
      if (side > 0 && z > 86) continue;
      rimList.push([x + rr(-1, 1), z + rr(-1, 1), rr(2.4, 5.2)]);
    }
    var rim = new THREE.InstancedMesh(G.cone, MAT.flat, rimList.length);
    rim.castShadow = true;
    rimList.forEach(function (r, i) {
      M1.compose(V1.set(r[0], r[2], r[1]), Q1.identity(), V2.set(r[2], r[2] * 2, r[2]));
      rim.setMatrixAt(i, M1);
      rim.setColorAt(i, C1.set(spick(PAL.pine.concat(PAL.leaf))));
    });
    cityGroup.add(rim);
    buildPeds();
  }
  var SPAWNS = [[10, -73.6], [-80, 0], [80, 0], [-40, 60], [40, -40]];
  var TOY = {
    x: 10,
    z: -70
  };
  function trees(cx, cz, n, kinds, rad) {
    for (var i = 0; i < n * 3 && n > 0; i++) {
      var x = cx + rr(-rad, rad),
        z = cz + rr(-rad, rad);
      if (place(spick(kinds), x, z, 0, rr(0.8, 1.25))) n--;
    }
  }
  function edgeProps(cx, cz, busy) {
    [[-6.75, 0, 3], [6.75, 0, 1], [0, -6.75, 2], [0, 6.75, 0]].forEach(function (e) {
      var along = e[0] === 0 ? [1, 0] : [0, 1];
      for (var k = -1; k <= 1; k++) {
        var x = cx + e[0] + along[0] * k * 4.4 + along[0] * rr(-0.6, 0.6),
          z = cz + e[1] + along[1] * k * 4.4 + along[1] * rr(-0.6, 0.6),
          r = srand();
        if (k === 0 && r < 0.35) place("lamp", x, z, e[2]);else if (busy && r < 0.18) place("busstop", x, z, e[2]);else if (busy && r < 0.3) place(spick(["kiosk", "phone", "bin"]), x, z, e[2]);else if (r < 0.42) place(spick(["bin", "hydrant", "bench"]), x, z, e[2]);else if (busy && r < 0.62) place("tree", x, z, 0, rr(0.7, 0.9));
      }
    });
  }
  function lotHouse(lx, lz, face, big) {
    var type = big ? "villa" : spick(["house", "house", "house", "bungalow"]);
    var rq = face,
      fz = [1, 0, -1, 0][face],
      fx = [0, 1, 0, -1][face];
    var o = place(type, lx - fx * 0.3, lz - fz * 0.3, rq, 1, 1);
    if (!o) return;
    addDecor("box", "#DCD3BE", lx + fx * 2.7, PLATE + 0.01, lz + fz * 2.7, fx ? 1.0 : 1.0, 0.02, fz ? 1.0 : 1.0);
    var fr = fx ? 1 : 0;
    place("fence", lx + fx * 2.75 + (fx ? 0 : -2.0), lz + fz * 2.75 + (fz ? 0 : -2.0), fr);
    place("fence", lx + fx * 2.75 + (fx ? 0 : 2.0), lz + fz * 2.75 + (fz ? 0 : 2.0), fr);
    place("mailbox", lx + fx * 2.4 + (fx ? 0 : 0.6), lz + fz * 2.4 + (fz ? 0 : 0.6), face);
    if (srand() < 0.4 && fits(lx - fx * 2.9, lz - fz * 2.9, 1.2, 1.2)) {
      addDecor("box", "#6CC3E6", lx - fx * 2.9, PLATE + 0.02, lz - fz * 2.9, fx ? 1.1 : 2.2, 0.04, fz ? 1.1 : 2.2);
      reserve(lx - fx * 2.9, lz - fz * 2.9, fx ? 0.6 : 1.1, fz ? 0.6 : 1.1);
    }
    trees(lx, lz, 1 + (srand() * 2 | 0), ["tree", "tree", "pine", "birch", "bush"], 3.1);
    if (srand() < 0.5) place("flowers", lx + fx * 2.4 + (fx ? 0 : -1.7), lz + fz * 2.4 + (fz ? 0 : -1.7), fx ? 1 : 0);
  }
  function fillBlock(zone, cx, cz) {
    var Q = [[-3.5, -3.5], [3.5, -3.5], [-3.5, 3.5], [3.5, 3.5]];
    switch (zone) {
      case "suburb":
      case "woods":
        {
          var vert = srand() < 0.5;
          Q.forEach(function (p) {
            var face = vert ? p[1] > 0 ? 0 : 2 : p[0] > 0 ? 1 : 3;
            if (zone === "woods" && srand() < 0.4) {
              trees(cx + p[0], cz + p[1], 5, ["pine", "pine", "tree", "birch"], 3);
              return;
            }
            lotHouse(cx + p[0], cz + p[1], face, false);
          });
          edgeProps(cx, cz, false);
          break;
        }
      case "main":
      case "mainMix":
        {
          var rot = srand() < 0.5;
          [-1, 1].forEach(function (side) {
            for (var k = 0; k < 4; k++) {
              var off = -4.6 + k * 3.07,
                depth = side * 3.5,
                type = zone === "mainMix" && k === 1 ? "shop" : "town";
              if (type === "shop") {
                place("shop", rot ? cx + side * 3.3 : cx, rot ? cz : cz + side * 3.3, rot ? side > 0 ? 1 : 3 : side > 0 ? 0 : 2, 0.95, rr(0.9, 1.1));
                k++;
                continue;
              }
              var x = rot ? cx + depth : cx + off,
                z = rot ? cz + off : cz + depth;
              place("town", x, z, rot ? side > 0 ? 1 : 3 : side > 0 ? 0 : 2, 1, rr(0.8, 1.2));
            }
          });
          edgeProps(cx, cz, true);
          break;
        }
      case "mixed":
        {
          var kinds = ["shop", "apt", "apt2", "town"];
          Q.forEach(function (p) {
            var k = spick(kinds);
            if (k === "town") {
              var rq = p[1] > 0 ? 0 : 2;
              place("town", cx + p[0] - 1.6, cz + p[1], rq, 1, rr(0.9, 1.2));
              place("town", cx + p[0] + 1.6, cz + p[1], rq, 1, rr(0.8, 1.1));
            } else place(k, cx + p[0], cz + p[1], k === "shop" ? p[1] > 0 ? 0 : 2 : srand() * 4 | 0, 1, rr(0.85, 1.2));
          });
          edgeProps(cx, cz, true);
          break;
        }
      case "office":
      case "down":
        {
          var ks = zone === "down" ? ["tower", "sky", "office2", "sky", "tower"] : ["office", "office2", "tower", "apt2"];
          Q.forEach(function (p) {
            place(spick(ks), cx + p[0], cz + p[1], 0, 1, rr(0.8, 1.25));
          });
          edgeProps(cx, cz, true);
          break;
        }
      case "industrial":
        {
          place("factory", cx - 1.2, cz + 2.6, 0, 1, rr(0.9, 1.1));
          place("warehouse", cx + 2.2, cz - 3.7, 0, 0.8, rr(0.9, 1.1));
          for (var i = 0; i < 4; i++) place(spick(["truck", "van"]), cx - 5 + i * 1.4, cz - 3.4, 0);
          place("cone", cx - 5.6, cz - 5.8);
          place("cone", cx - 4.8, cz - 5.8);
          edgeProps(cx, cz, false);
          break;
        }
      case "yard":
        {
          place("warehouse", cx - 2.2, cz + 2.8, 0, 1, rr(0.9, 1.15));
          place("warehouse", cx + 2.2, cz - 3.2, 2, 0.9, rr(0.9, 1.1));
          addDecor("box", "#7A7F90", cx, PLATE + 0.01, cz, 12, 0.02, 12);
          for (i = 0; i < 6; i++) place(spick(["truck", "truck", "van"]), cx + rr(-5, 5), cz + rr(-5, 5), srand() * 4 | 0);
          break;
        }
      case "construction":
        {
          place("crane", cx + 3.5, cz + 3.5, 0);
          place("frame", cx - 2.6, cz - 2.2, 0, 1, rr(0.8, 1.2));
          for (i = 0; i < 8; i++) place("cone", cx + rr(-6, 6), cz + rr(-6, 6));
          [[-6.2, 0, 1], [6.2, 0, 1], [0, 6.2, 0], [0, -6.2, 0]].forEach(function (f) {
            for (var k = -2; k <= 2; k++) place("fence", cx + f[0] + (f[2] ? 0 : k * 2.2), cz + f[1] + (f[2] ? k * 2.2 : 0), f[2]);
          });
          place("truck", cx + 2.6, cz - 3.4, 1);
          break;
        }
      case "church":
        {
          place("church", cx, cz - 0.6, 0, 1, 1);
          trees(cx, cz, 6, ["pine", "tree", "birch"], 6);
          place("bench", cx - 3.6, cz + 5.2, 0);
          place("bench", cx + 3.6, cz + 5.2, 0);
          edgeProps(cx, cz, false);
          break;
        }
      case "school":
        {
          place("school", cx, cz - 3.2, 0, 1, 1);
          addDecor("box", "#D9704A", cx, PLATE + 0.01, cz + 3.4, 11, 0.02, 5.4);
          addDecor("box", "#FFFFFF", cx, PLATE + 0.02, cz + 3.4, 0.1, 0.02, 5.2);
          reserve(cx, cz + 3.4, 5.5, 2.7);
          place("hoop", cx - 5.2, cz + 3.4, 1);
          place("hoop", cx + 5.2, cz + 3.4, 3);
          edgeProps(cx, cz, false);
          break;
        }
      case "gasMix":
        {
          place("gas", cx - 2.8, cz + 1.6, 0, 1, 1);
          place(spick(["shop", "bungalow"]), cx + 3.6, cz - 3.2, 2, 0.9, 1);
          place("sedan", cx - 1.2, cz + 2.8, 0);
          place("billboard", cx + 4.6, cz + 5.2, 0);
          trees(cx, cz, 2, ["tree", "bush"], 6);
          edgeProps(cx, cz, true);
          break;
        }
      case "tower":
        {
          place("watertower", cx + 2, cz + 2, 0);
          trees(cx, cz, 9, ["pine", "tree", "birch", "bush"], 6);
          place("picnic", cx - 3, cz - 3, 0);
          break;
        }
      case "stadium":
        {
          place("stadium", cx, cz, 0, 1, 1);
          break;
        }
      case "plaza":
        {
          addDecor("box", "#D7CBB4", cx, PLATE + 0.01, cz, 9, 0.02, 9);
          reserve(cx, cz, 1.6, 1.6);
          place("fountain", cx, cz);
          [[-3.2, 0, 1], [3.2, 0, 3], [0, -3.2, 0], [0, 3.2, 2]].forEach(function (b) {
            place("bench", cx + b[0], cz + b[1], b[2]);
          });
          [[-5.2, -5.2], [5.2, -5.2], [-5.2, 5.2], [5.2, 5.2]].forEach(function (p) {
            place("tree", cx + p[0], cz + p[1], 0, rr(0.9, 1.1));
          });
          place("flowers", cx - 5.3, cz, 1);
          place("flowers", cx + 5.3, cz, 1);
          place("kiosk", cx + 2.6, cz - 5.4, 0);
          place("billboard", cx - 2.6, cz + 5.6, 2);
          break;
        }
      case "sports":
        {
          addDecor("box", "#5DBB4F", cx, PLATE + 0.01, cz, 11, 0.02, 7);
          addDecor("box", "#FFFFFF", cx, PLATE + 0.02, cz, 0.12, 0.02, 7);
          addDecor("cyl", "#FFFFFF", cx, PLATE + 0.015, cz, 2.2, 0.02, 2.2);
          reserve(cx, cz, 5.5, 3.5);
          place("hoop", cx - 5.3, cz, 1);
          place("hoop", cx + 5.3, cz, 3);
          trees(cx, cz, 5, ["tree", "pine"], 6.2);
          place("bench", cx, cz - 5.3, 0);
          place("bench", cx - 3, cz + 5.3, 2);
          break;
        }
      case "toytown":
        {
          var sx = cx,
            sz = cz + 0.8;
          addDecor("box", "#C98C4E", sx, PLATE + 0.005, sz, 7.9, 0.02, 7.5);
          addDecor("box", "#E9C98F", sx, PLATE + 0.012, sz, 7.4, 0.02, 7.0);
          addDecor("box", "#9BA0B2", sx, PLATE + 0.02, sz, 2.0, 0.02, 7.0);
          for (var q = -3; q <= 3; q++) addDecor("box", "#F4EFD8", sx, PLATE + 0.03, sz + q * 1.0, 0.07, 0.01, 0.42);
          placeY = PLATE + 0.03;
          [-2.5, -1.2, 0.1, 1.4].forEach(function (z, i) {
            place("toyblock", sx - 1.8, sz + z + rr(-0.1, 0.1), 1, rr(0.88, 1.12), rr(0.9, 1.15), true);
            if (i !== 2) place("toyblock", sx + 1.8, sz + z + 0.5 + rr(-0.1, 0.1), 3, rr(0.88, 1.12), rr(0.9, 1.15), true);
          });
          place("toyblock", sx - 1.7, sz + 2.8, 2, 1.05, 1, true);
          place("toyblock", sx + 1.8, sz + 2.9, 2, 0.95, 1.1, true);
          [[-2.9, -2.3], [2.9, -2.2], [-2.9, 2.5], [2.9, 3.3], [-2.8, 0.3]].forEach(function (t, i) {
            place(i % 2 ? "toy_pine" : "toy_tree", sx + t[0], sz + t[1], 0, 0.34, 1, true);
          });
          [[-0.95, -1.8], [0.95, 0.2], [-0.95, 2.2]].forEach(function (t) {
            place("toy_lamp", sx + t[0], sz + t[1], t[0] < 0 ? 1 : 3, 0.32, 1, true);
          });
          place("toy_sedan", sx + 0.2, sz + 2.25, 0, 0.42, 1, true);
          place("toy_van", sx - 0.35, sz - 1.2, 2, 0.3, 1, true);
          placeY = PLATE;
          place("playhouse", cx - 4.4, cz + 2.9, 1, 1, 1, true);
          place("slide", cx + 4.5, cz + 2.6, 3, 1, 1, true);
          place("swings", cx - 4.4, cz - 3.3, 0, 1, 1, true);
          place("seesaw", cx + 4.4, cz - 3.2, 1, 1, 1, true);
          place("springy", cx - 5.0, cz + 0.2, 1, 1, 1, true);
          place("springy", cx + 2.2, cz - 5.0, 0, 1, 1, true);
          placeY = PLATE + 0.03;
          place("sandtoys", cx - 2.6, cz - 1.9, 0, 1, 1, true);
          place("sandtoys", cx + 2.7, cz + 4.0, 2, 1, 1, true);
          placeY = PLATE;
          reserve(sx, sz, 3.7, 3.5);
          place("bench", cx - 1.6, cz - 5.4, 0);
          place("bench", cx + 3.4, cz + 5.4, 2);
          place("bin", cx + 5.5, cz - 5.2, 0);
          place("flowers", cx - 5.4, cz - 5.2, 0);
          for (var rt = -5.4; rt <= 5.5; rt += 2.15) {
            var hs = function () {
              return rr(2.6, 3.0);
            };
            place("hedge", cx + rt, cz - 5.8, 0, 1, hs(), true);
            place("hedge", cx + rt + 0.4, cz + 5.8, 0, 1, hs(), true);
            place("hedge", cx - 5.8, cz + rt + 0.3, 1, 1, hs(), true);
            place("hedge", cx + 5.8, cz + rt - 0.2, 1, 1, hs(), true);
          }
          [[-5.9, -5.9], [5.9, -5.9], [-5.9, 5.9], [5.9, 5.9]].forEach(function (c) {
            place("tree", cx + c[0], cz + c[1], 0, rr(1.0, 1.2), 1, true);
          });
          edgeProps(cx, cz, false);
          break;
        }
      case "playground":
        {
          addDecor("box", "#E6CFA0", cx, PLATE + 0.01, cz, 8, 0.02, 8);
          place("slide", cx - 2, cz - 1.5, 1);
          place("swings", cx + 2, cz + 1.5, 0);
          place("picnic", cx + 3, cz - 3, 0);
          trees(cx, cz, 7, ["tree", "birch", "bush"], 6);
          place("bench", cx - 3.5, cz + 3.5, 0);
          break;
        }
      case "forest":
        {
          trees(cx, cz, 16, ["pine", "pine", "tree", "birch"], 6);
          break;
        }
      default:
        {
          addDecor("cyl", "#6CC3E6", cx + 2, PLATE + 0.02, cz + 2, 6.4, 0.06, 5.2);
          addDecor("cyl", "#D9D3C4", cx + 2, PLATE, cz + 2, 7.0, 0.05, 5.8);
          reserve(cx + 2, cz + 2, 3.5, 2.9);
          addDecor("box", "#E6D5AE", cx - 3, PLATE + 0.01, cz, 1.2, 0.02, 12.6);
          addDecor("box", "#E6D5AE", cx, PLATE + 0.01, cz - 3.5, 12.6, 0.02, 1.2);
          reserve(cx - 3, cz, 0.6, 6.3);
          reserve(cx, cz - 3.5, 6.3, 0.6);
          place("bench", cx - 1.6, cz - 2.4, 0);
          place("bench", cx - 4.3, cz + 2.3, 1);
          place("picnic", cx + 4, cz - 5.3, 0);
          place("flowers", cx - 5.3, cz - 5.3, 0);
          trees(cx, cz, 8, ["tree", "tree", "pine", "birch", "bush"], 6.1);
          place("lamp", cx - 2.2, cz - 4.4, 0);
        }
    }
  }
  var PED_MAX = Q.s.peds,
    peds = [],
    pedParts = {};
  var PED_PARTS = ["torso", "hips", "legL", "legR", "armL", "armR", "head", "hair"];
  function buildPeds() {
    peds = [];
    var geo = {
      torso: G.box,
      hips: G.box,
      legL: G.box,
      legR: G.box,
      armL: G.box,
      armR: G.box,
      head: G.head,
      hair: G.cap
    };
    PED_PARTS.forEach(function (k) {
      var m = new THREE.InstancedMesh(geo[k], MAT.plain, PED_MAX);
      m.castShadow = k === "torso" || k === "head";
      m.frustumCulled = false;
      m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      pedParts[k] = m;
      cityGroup.add(m);
    });
    for (var i = 0; i < PED_MAX; i++) {
      var b = spick(blockInfo);
      var p = {
        bx: b.x,
        bz: b.z,
        t: rr(0, 4),
        sp: rr(0.9, 1.4) * (srand() < 0.5 ? 1 : -1) / 13.5,
        x: 0,
        z: 0,
        yaw: 0,
        st: 0,
        ft: 0,
        vx: 0,
        vz: 0,
        ph: rr(0, 6),
        wa: 0,
        hat: srand() < 0.35
      };
      var shirt = spick(PAL.shirt),
        pants = spick(PAL.pants),
        skin = spick(PAL.skin),
        hair = p.hat ? spick(["#E8453C", "#3E63B8", "#F2B33D", "#2A2D38"]) : spick(PAL.hair);
      pedParts.torso.setColorAt(i, C1.set(shirt));
      pedParts.armL.setColorAt(i, C1);
      pedParts.armR.setColorAt(i, C1);
      pedParts.hips.setColorAt(i, C1.set(pants));
      pedParts.legL.setColorAt(i, C1);
      pedParts.legR.setColorAt(i, C1);
      pedParts.head.setColorAt(i, C1.set(skin));
      pedParts.hair.setColorAt(i, C1.set(hair));
      peds.push(p);
    }
  }
  var PED_H = 6.75;
  function pedLoopPos(p) {
    var t = (p.t % 4 + 4) % 4,
      side = t | 0,
      f = t - side,
      h = PED_H,
      x,
      z;
    if (side === 0) {
      x = -h + f * 2 * h;
      z = -h;
    } else if (side === 1) {
      x = h;
      z = -h + f * 2 * h;
    } else if (side === 2) {
      x = h - f * 2 * h;
      z = h;
    } else {
      x = -h;
      z = h - f * 2 * h;
    }
    return [p.bx + x, p.bz + z];
  }
  var clouds = [],
    cloudMesh,
    birdMesh,
    birds = [];
  (function () {
    cloudMesh = new THREE.InstancedMesh(G.ball, toon({
      color: "#FFFFFF",
      emissive: "#E6F2FA",
      emissiveIntensity: 0.55
    }), 80);
    for (var i = 0; i < 16; i++) {
      var c = {
          x: rand(-200, 200),
          z: rand(-200, 200),
          y: rand(52, 70),
          puffs: [],
          sp: rand(1, 2.2)
        },
        n = 3 + (Math.random() * 3 | 0);
      for (var k = 0; k < n; k++) c.puffs.push([k * 5 - n * 2.5 + rand(-1, 1), rand(-1, 2), rand(-2, 2), rand(6, 10)]);
      clouds.push(c);
    }
    scene.add(cloudMesh);
    birdMesh = new THREE.InstancedMesh(G.bird, MAT.bird, 24);
    birdMesh.frustumCulled = false;
    for (i = 0; i < 24; i++) birds.push({
      f: i / 6 | 0,
      k: i % 6,
      ph: rand(0, 6)
    });
    scene.add(birdMesh);
  })();
  function updateSky(dt) {
    var n = 0;
    clouds.forEach(function (c) {
      c.x += c.sp * dt;
      if (c.x > 210) c.x = -210;
      c.puffs.forEach(function (p) {
        M1.compose(V1.set(c.x + p[0], c.y + p[1], c.z + p[2]), Q1.identity(), V2.set(p[3], p[3] * 0.6, p[3] * 0.8));
        cloudMesh.setMatrixAt(n++, M1);
      });
    });
    cloudMesh.count = n;
    cloudMesh.instanceMatrix.needsUpdate = true;
    birds.forEach(function (b, i) {
      var a = now * 0.12 + b.f * 1.6,
        R = 50 + b.f * 14,
        off = [[0, 0], [-1.4, -1.2], [1.4, -1.2], [-2.8, -2.4], [2.8, -2.4], [0, -3]][b.k];
      var tx = -Math.sin(a),
        tz = Math.cos(a),
        sx = Math.cos(a),
        sz = Math.sin(a);
      V1.set(sx * R + sx * off[0] + tx * off[1], 32 + b.f * 4 + Math.sin(now + b.ph) * 0.5, sz * R + sz * off[0] + tz * off[1]);
      Q1.setFromEuler(E1.set(0, Math.atan2(tx, tz), 0));
      M1.compose(V1, Q1, V2.set(1.1, 0.4 + Math.abs(Math.sin(now * 9 + b.ph)) * 0.9, 1.1));
      birdMesh.setMatrixAt(i, M1);
    });
    birdMesh.instanceMatrix.needsUpdate = true;
  }
  var HIDE = new THREE.Matrix4().makeScale(0, 0, 0);
  var CHAR = new THREE.Color("#3A2E2C"),
    FLASH = new THREE.Color("#FFFFFF"),
    EMBER = new THREE.Color("#FF8A3A");
  function objMatrix(o, out) {
    var ys = 1,
      sink = 0,
      sx = 1,
      k = 0;
    if (o.state === 1) {
      k = clamp(o.st / o.cd, 0, 1);
      ys = 1 - k * k * 0.95;
      sink = -k * 0.3;
    }
    var w = o.wob;
    if (w > 0) {
      sx = 1 + Math.sin(w * 40) * 0.06 * w;
      ys *= 1 - Math.sin(w * 40) * 0.05 * w;
    }
    Q1.setFromEuler(E1.set(o.tilt.x * k, o.rot, o.tilt.z * k));
    var shake = o.state === 1 ? 0.1 * o.hw : 0;
    return out.compose(V1.set(o.x + rand(-shake, shake), sink + o.y0, o.z + rand(-shake, shake)), Q1, V2.set(sx * o.sc, ys * o.sc * o.sy, sx * o.sc));
  }
  function writeObj(o) {
    if (!o.alive) {
      o.parts.forEach(function (p) {
        p.pm.mesh.setMatrixAt(p.idx, HIDE);
        p.pm.dirty = true;
      });
      return;
    }
    objMatrix(o, M2);
    o.parts.forEach(function (p) {
      M1.multiplyMatrices(M2, p.local);
      p.pm.mesh.setMatrixAt(p.idx, M1);
      C1.copy(p.color);
      if (o.tint > 0) C1.lerp(CHAR, clamp(o.tint, 0, 0.75));
      if (o.burn > 0) C1.lerp(EMBER, 0.25 + 0.1 * Math.sin(now * 20 + o.x));
      if (o.flash > 0) C1.lerp(FLASH, clamp(o.flash * 5, 0, 0.8));
      p.pm.mesh.setColorAt(p.idx, C1);
      p.pm.dirty = true;
    });
  }
  function flushMeshes() {
    for (var k in partMeshes) {
      var pm = partMeshes[k];
      if (pm.dirty) {
        pm.mesh.instanceMatrix.needsUpdate = true;
        if (pm.mesh.instanceColor) pm.mesh.instanceColor.needsUpdate = true;
        pm.dirty = false;
      }
    }
  }
  function mainColor(o) {
    for (var q = 0; q < o.parts.length; q++) if (o.T.parts[q][8].charAt(0) === "@") return o.parts[q].color;
    return o.parts[0].color;
  }
  var DEB_MAX = 560;
  var debMesh = new THREE.InstancedMesh(G.box, MAT.plain, DEB_MAX);
  debMesh.castShadow = true;
  debMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  debMesh.frustumCulled = false;
  scene.add(debMesh);
  var debris = [];
  for (var di = 0; di < DEB_MAX; di++) {
    debris.push({
      on: false,
      p: new THREE.Vector3(),
      v: new THREE.Vector3(),
      q: new THREE.Quaternion(),
      w: new THREE.Vector3(),
      s: new THREE.Vector3(),
      life: 0
    });
    debMesh.setMatrixAt(di, HIDE);
    debMesh.setColorAt(di, C1.set("#fff"));
  }
  var debI = 0;
  function spawnDebris(x, y, z, sx, sy, sz, vx, vy, vz, color, life, spin) {
    var d = debris[debI],
      i = debI;
    debI = (debI + 1) % DEB_MAX;
    d.on = true;
    d.p.set(x, y, z);
    d.v.set(vx, vy, vz);
    d.s.set(sx, sy, sz);
    d.q.setFromEuler(E1.set(rand(0, 6), rand(0, 6), rand(0, 6)));
    var sp = spin === undefined ? 8 : spin;
    d.w.set(rand(-sp, sp), rand(-sp, sp), rand(-sp, sp));
    d.life = life || rand(3, 4.5);
    debMesh.setColorAt(i, color);
  }
  function updateDebris(dt) {
    for (var i = 0; i < DEB_MAX; i++) {
      var d = debris[i];
      if (!d.on) continue;
      d.life -= dt;
      if (d.life <= 0) {
        d.on = false;
        debMesh.setMatrixAt(i, HIDE);
        continue;
      }
      d.v.y -= 22 * dt;
      d.p.addScaledVector(d.v, dt);
      var hy = Math.min(d.s.x, d.s.y, d.s.z) * 0.5;
      if (d.p.y < hy) {
        d.p.y = hy;
        if (d.v.y < 0) d.v.y *= -0.3;
        d.v.x *= 0.82;
        d.v.z *= 0.82;
        d.w.multiplyScalar(0.8);
      }
      var wl = d.w.length();
      if (wl > 0.01) {
        Q1.setFromAxisAngle(V1.copy(d.w).divideScalar(wl), wl * dt);
        d.q.premultiply(Q1);
      }
      var sc = d.life < 0.6 ? d.life / 0.6 : 1;
      M1.compose(d.p, d.q, V2.copy(d.s).multiplyScalar(sc));
      debMesh.setMatrixAt(i, M1);
    }
    debMesh.instanceMatrix.needsUpdate = true;
    if (debMesh.instanceColor) debMesh.instanceColor.needsUpdate = true;
  }
  var RUB_MAX = 700;
  var rubMesh = new THREE.InstancedMesh(G.ico, MAT.flat, RUB_MAX);
  rubMesh.receiveShadow = true;
  rubMesh.castShadow = true;
  rubMesh.frustumCulled = false;
  for (var ri = 0; ri < RUB_MAX; ri++) {
    rubMesh.setMatrixAt(ri, HIDE);
    rubMesh.setColorAt(ri, C1.set("#888"));
  }
  scene.add(rubMesh);
  var rubI = 0;
  var GLASS = new THREE.Color("#CFEFFF");
  function rubble(o) {
    var n = o.T.big >= 2 ? 6 : 4;
    for (var k = 0; k < n; k++) {
      var i = rubI;
      rubI = (rubI + 1) % RUB_MAX;
      var w = o.hw * rand(0.55, 0.95),
        h = Math.min(o.h * 0.14, 2.6) * rand(0.6, 1.1);
      M1.compose(V1.set(o.x + rand(-0.6, 0.6) * o.hw, o.y0 + h * 0.15, o.z + rand(-0.6, 0.6) * o.hd), Q1.setFromEuler(E1.set(rand(-0.3, 0.3), rand(0, 6), rand(-0.3, 0.3))), V2.set(w * 1.3, h, w * 1.2));
      rubMesh.setMatrixAt(i, M1);
      rubMesh.setColorAt(i, C1.copy(o.parts[k % 3 === 2 && o.parts[1] ? 1 : 0].color).lerp(CHAR, rand(0.35, 0.6)));
    }
    rubMesh.instanceMatrix.needsUpdate = true;
    rubMesh.instanceColor.needsUpdate = true;
  }
  function clearDebris() {
    debris.forEach(function (d, i) {
      d.on = false;
      debMesh.setMatrixAt(i, HIDE);
    });
    for (var i = 0; i < RUB_MAX; i++) rubMesh.setMatrixAt(i, HIDE);
    rubMesh.instanceMatrix.needsUpdate = true;
    debMesh.instanceMatrix.needsUpdate = true;
    FX_ADD.clear();
    FX_SMOKE.clear();
  }
  var dragons = [],
    player = null;
  function nearestDragon(x, z, maxD, exclude) {
    var best = null,
      bd = maxD || 1e9;
    for (var i = 0; i < dragons.length; i++) {
      var d = dragons[i];
      if (d === exclude || d.dead) continue;
      var dd = Math.hypot(d.pos.x - x, d.pos.z - z);
      if (dd < bd) {
        bd = dd;
        best = d;
      }
    }
    return best;
  }
  function soundAt(x, z) {
    var c = player || dragons[0];
    if (!c) {
      sfxMul = 1;
      return;
    }
    var d = Math.hypot(x - c.pos.x, z - c.pos.z),
      r = 14 + c.s * 4;
    sfxMul = d < r ? 1 : Math.pow(clamp(1 - (d - r) / 70, 0, 1), 1.6);
  }
  function nearCam(x, z, r) {
    return Math.hypot(x - camLook.x, z - camLook.z) < (r || 60);
  }
  function updateTraffic(dt) {
    for (var i = 0; i < movers.length; i++) {
      var o = movers[i];
      if (!o.alive || o.state) continue;
      var fx = o.mv.axis === "x" ? o.mv.dir : 0,
        fz = o.mv.axis === "z" ? o.mv.dir : 0,
        blocked = false,
        panic = false;
      for (var k = 0; k < dragons.length; k++) {
        var d = dragons[k];
        if (d.dead) continue;
        var dx = d.pos.x - o.x,
          dz = d.pos.z - o.z,
          ahead = dx * fx + dz * fz,
          side = Math.abs(dx * fz - dz * fx);
        if (ahead > 0 && ahead < 2.2 + 0.7 * d.s && side < 0.9 + 0.5 * d.s && d.alt < 1) blocked = true;
        if (Math.abs(dx) + Math.abs(dz) < 12 * d.s) panic = true;
      }
      o.cur = damp(o.cur === undefined ? o.mv.sp : o.cur, blocked ? 0 : o.mv.sp * (panic ? 1.9 : 1), blocked ? 12 : 3, dt);
      if (o.mv.axis === "z") {
        o.z += o.mv.dir * o.cur * dt;
        if (o.z > 89) o.z = -89;else if (o.z < -89) o.z = 89;
      } else {
        o.x += o.mv.dir * o.cur * dt;
        if (o.x > 89) o.x = -89;else if (o.x < -89) o.x = 89;
      }
      writeObj(o);
    }
  }
  var PED_DEF = {
    hips: {
      piv: [0, 0.36, 0],
      off: [0, 0, 0],
      s: [0.3, 0.1, 0.2]
    },
    legL: {
      piv: [-0.08, 0.34, 0],
      off: [0, -0.16, 0],
      s: [0.12, 0.32, 0.15]
    },
    legR: {
      piv: [0.08, 0.34, 0],
      off: [0, -0.16, 0],
      s: [0.12, 0.32, 0.15]
    },
    torso: {
      piv: [0, 0.54, 0],
      off: [0, 0, 0],
      s: [0.32, 0.32, 0.2]
    },
    armL: {
      piv: [-0.21, 0.66, 0],
      off: [0, -0.14, 0],
      s: [0.09, 0.3, 0.1]
    },
    armR: {
      piv: [0.21, 0.66, 0],
      off: [0, -0.14, 0],
      s: [0.09, 0.3, 0.1]
    },
    head: {
      piv: [0, 0.86, 0],
      off: [0, 0, 0],
      s: [0.32, 0.32, 0.32]
    },
    hair: {
      piv: [0, 0.88, 0],
      off: [0, 0, 0],
      s: [0.34, 0.26, 0.34]
    }
  };
  var MP = new THREE.Matrix4(),
    MO = new THREE.Matrix4(),
    MB = new THREE.Matrix4(),
    QP = new THREE.Quaternion(),
    VP = new THREE.Vector3(),
    VS = new THREE.Vector3(),
    ONE = new THREE.Vector3(1, 1, 1);
  function pedPart(k, i, rx, rz) {
    var D = PED_DEF[k];
    MP.compose(VP.set(D.piv[0], D.piv[1], D.piv[2]), QP.setFromEuler(E1.set(rx || 0, 0, rz || 0)), ONE);
    MO.compose(VP.set(D.off[0], D.off[1], D.off[2]), Q2.identity(), VS.set(D.s[0], D.s[1], D.s[2]));
    M1.multiplyMatrices(MB, MP).multiply(MO);
    pedParts[k].setMatrixAt(i, M1);
  }
  function hidePed(i) {
    PED_PARTS.forEach(function (k) {
      pedParts[k].setMatrixAt(i, HIDE);
    });
  }
  function resetPeds() {
    peds.forEach(function (p) {
      p.st = 0;
      var q = pedLoopPos(p);
      p.x = q[0];
      p.z = q[1];
      p.vx = p.vz = 0;
      p.y = 0;
    });
  }
  function knockPeds(x, z, r, by, up) {
    var n = 0;
    for (var i = 0; i < peds.length; i++) {
      var p = peds[i];
      if (p.st >= 3) continue;
      var dx = p.x - x,
        dz = p.z - z,
        d = Math.hypot(dx, dz);
      if (d > r) continue;
      p.st = 3;
      p.ft = 1.1;
      p.y = 0.1;
      var sp = rand(4, 8);
      p.vx = dx / (d || 1) * sp;
      p.vz = dz / (d || 1) * sp;
      p.vy = up || rand(5, 9);
      p.spin = rand(8, 14);
      if (n++ < 2 && nearCam(x, z, 40)) SFX.scream();
      if (by) by.addScore(5, p.x, 1, p.z, false, false);
    }
  }
  function updatePeds(dt) {
    for (var i = 0; i < peds.length; i++) {
      var p = peds[i];
      if (p.st === 4) {
        p.ft -= dt;
        if (p.ft > 0) {
          hidePed(i);
          continue;
        }
        p.st = 0;
        var b = pick(blockInfo);
        p.bx = b.x;
        p.bz = b.z;
        var q0 = pedLoopPos(p);
        p.x = q0[0];
        p.z = q0[1];
        p.y = 0;
      }
      var nd = nearestDragon(p.x, p.z, 60),
        dx = 0,
        dz = 0,
        d = 99,
        pr = 0,
        run = 0,
        tumble = 0;
      if (nd) {
        dx = p.x - nd.pos.x;
        dz = p.z - nd.pos.z;
        d = Math.hypot(dx, dz) || 0.01;
        pr = 5 + 3.5 * nd.s;
      }
      if (p.st === 3) {
        p.ft -= dt;
        p.vy -= 18 * dt;
        p.x += p.vx * dt;
        p.z += p.vz * dt;
        p.y += p.vy * dt;
        tumble = (1.1 - p.ft) * p.spin;
        if (p.y < 0) {
          p.y = 0;
          p.vy = Math.abs(p.vy) * 0.3;
          p.vx *= 0.6;
          p.vz *= 0.6;
        }
        if (p.ft <= 0) {
          p.st = 4;
          p.ft = rand(9, 14);
          dustBurst(p.x, p.z, 0.35, 4, 0.3);
          hidePed(i);
          continue;
        }
      } else if (p.st === 0) {
        p.t += p.sp * dt;
        var q = pedLoopPos(p);
        if (Math.abs(q[0] - p.x) + Math.abs(q[1] - p.z) > 1e-4) p.yaw = Math.atan2(q[0] - p.x, q[1] - p.z);
        p.x = q[0];
        p.z = q[1];
        p.ph += dt * 7;
        if (d < pr && G_.mode === "play") {
          p.st = 1;
          p.ft = rand(3, 5);
          if (Math.random() < 0.2 && nearCam(p.x, p.z, 40)) SFX.scream();
        }
      } else {
        if (d < pr && G_.mode === "play") {
          p.st = 1;
          p.ft = Math.max(p.ft, 1.5);
        }
        var tx, tz, spd;
        if (p.st === 1) {
          tx = dx / d;
          tz = dz / d;
          spd = 4.6;
          run = 1;
          p.ft -= dt;
          if (p.ft <= 0) {
            p.st = 2;
            p.wa = rand(0, 6.283);
          }
        } else {
          if (Math.random() < dt * 0.4) p.wa += rand(-1.5, 1.5);
          tx = Math.sin(p.wa);
          tz = Math.cos(p.wa);
          spd = 1.1;
        }
        p.vx = damp(p.vx, tx * spd, 5, dt);
        p.vz = damp(p.vz, tz * spd, 5, dt);
        p.x += p.vx * dt;
        p.z += p.vz * dt;
        p.ph += dt * (run ? 17 : 7);
        if (Math.abs(p.vx) + Math.abs(p.vz) > 0.05) p.yaw = Math.atan2(p.vx, p.vz);
        eachNear(p.x, p.z, 1, function (o) {
          if (!o.T.big || o.state) return;
          var c = circleBox(p.x, p.z, 0.22, o);
          if (c) {
            p.x += c.nx * c.pen;
            p.z += c.nz * c.pen;
            if (p.st === 2) p.wa += 2;
          }
        }, false);
        if (Math.abs(p.x) > MAP || Math.abs(p.z) > MAP) {
          p.x = clamp(p.x, -MAP, MAP);
          p.z = clamp(p.z, -MAP, MAP);
          p.wa += 3;
        }
      }
      if (nd && p.st < 3) {
        var body = 0.6 * nd.s + 0.3;
        if (d < body && nd.alt < 0.5 * nd.s) {
          p.x = nd.pos.x + dx / d * body;
          p.z = nd.pos.z + dz / d * body;
        }
      }
      if (!nearCam(p.x, p.z, 95)) {
        hidePed(i);
        continue;
      }
      var sw = Math.sin(p.ph),
        bob = Math.abs(Math.cos(p.ph)) * (run ? 0.07 : 0.03);
      MB.compose(VP.set(p.x, (p.y || 0) + bob, p.z), QP.setFromEuler(E1.set((run ? 0.22 : 0) + tumble, p.yaw, tumble * 0.4, "YXZ")), ONE);
      var leg = sw * (run ? 0.95 : 0.5),
        arm = run ? 0 : sw * 0.45,
        raise = run ? 2.7 + Math.sin(p.ph * 1.7) * 0.25 : 0;
      if (p.st === 3) {
        leg = 0.6;
        raise = 2.9;
      }
      pedPart("hips", i);
      pedPart("torso", i);
      pedPart("head", i);
      pedPart("hair", i);
      pedPart("legL", i, leg, 0);
      pedPart("legR", i, -leg, 0);
      pedPart("armL", i, -arm, -raise);
      pedPart("armR", i, arm, raise);
    }
    PED_PARTS.forEach(function (k) {
      pedParts[k].instanceMatrix.needsUpdate = true;
    });
  }
  var matCache = {};
  function lmat(c) {
    return matCache[c] || (matCache[c] = toon({
      color: c
    }));
  }
  function bmat(c) {
    return matCache["b" + c] || (matCache["b" + c] = new THREE.MeshBasicMaterial({
      color: c
    }));
  }
  var CHARMAT = toon({
    color: "#2E2628"
  });
  function part(parent, geom, mat, x, y, z, sx, sy, sz, rx, ry, rz) {
    var m = new THREE.Mesh(geom, mat);
    m.position.set(x, y, z);
    m.scale.set(sx, sy, sz);
    if (rx || ry || rz) m.rotation.set(rx || 0, ry || 0, rz || 0);
    m.castShadow = true;
    parent.add(m);
    return m;
  }
  function buildTank() {
    var g = new THREE.Group(),
      olive = lmat("#6E7F4C"),
      dark = lmat("#33372F");
    part(g, G.box, olive, 0, 0.55, 0, 1.6, 0.5, 2.3);
    part(g, G.box, olive, 0, 0.72, 1.2, 1.5, 0.2, 0.3, 0.5);
    part(g, G.box, dark, -0.85, 0.35, 0, 0.42, 0.6, 2.5);
    part(g, G.box, dark, 0.85, 0.35, 0, 0.42, 0.6, 2.5);
    for (var i = -2; i <= 2; i++) {
      part(g, G.wheel, lmat("#4A4F42"), -0.86, 0.3, i * 0.5, 0.46, 0.4, 0.4);
      part(g, G.wheel, lmat("#4A4F42"), 0.86, 0.3, i * 0.5, 0.46, 0.4, 0.4);
    }
    var tur = new THREE.Group();
    tur.position.y = 0.95;
    g.add(tur);
    part(tur, G.box, lmat("#7A8B55"), 0, 0.12, -0.1, 1.05, 0.42, 1.2);
    part(tur, G.cyl, lmat("#7A8B55"), 0, 0.36, -0.3, 0.3, 0.14, 0.3);
    part(tur, G.box, lmat("#FFFFFF"), 0.53, 0.14, -0.1, 0.02, 0.22, 0.22);
    var barrel = part(tur, G.cyl, dark, 0, 0.12, 1.1, 0.14, 1.5, 0.14, Math.PI / 2);
    var tip = new THREE.Object3D();
    tip.position.set(0, 0.12, 1.9);
    tur.add(tip);
    g.scale.setScalar(2.0);
    return {
      g: g,
      turret: tur,
      tip: tip,
      barrel: barrel,
      r: 2.6
    };
  }
  function buildPolice() {
    var g = new THREE.Group();
    part(g, G.box, lmat("#F4F4F2"), 0, 0.5, 0, 1.1, 0.38, 2.1);
    part(g, G.box, lmat("#23336B"), 0, 0.46, 0, 1.12, 0.16, 1.2);
    part(g, G.box, lmat("#CFE6F2"), 0, 0.84, -0.12, 0.96, 0.34, 1.1);
    part(g, G.box, lmat("#F4F4F2"), 0, 1.02, -0.12, 0.9, 0.05, 1.0);
    var red = part(g, G.box, bmat("#FF3B30"), -0.2, 1.12, -0.12, 0.34, 0.14, 0.22),
      blue = part(g, G.box, bmat("#2F7FFF"), 0.2, 1.12, -0.12, 0.34, 0.14, 0.22);
    [[-0.52, 0.62], [0.52, 0.62], [-0.52, -0.62], [0.52, -0.62]].forEach(function (w) {
      part(g, G.wheel, lmat("#23232B"), w[0], 0.22, w[1], 0.2, 0.44, 0.44);
    });
    part(g, G.box, bmat("#FFF6D8"), -0.33, 0.55, 1.06, 0.22, 0.1, 0.04);
    part(g, G.box, bmat("#FFF6D8"), 0.33, 0.55, 1.06, 0.22, 0.1, 0.04);
    g.scale.setScalar(1.35);
    return {
      g: g,
      red: red,
      blue: blue,
      r: 1.6
    };
  }
  function buildHeli() {
    var g = new THREE.Group(),
      body = lmat("#56663F"),
      dark = lmat("#2E3328");
    part(g, G.ball, body, 0, 0, 0, 1.3, 1.1, 2.0);
    part(g, G.ball, lmat("#BFE3F2"), 0, 0.12, 0.62, 0.95, 0.75, 0.9);
    var tail = new THREE.Group();
    g.add(tail);
    part(tail, G.box, body, 0, 0.1, -1.9, 0.28, 0.3, 2.4);
    part(tail, G.box, body, 0, 0.55, -2.95, 0.1, 0.9, 0.5);
    part(g, G.box, dark, -0.5, -0.72, 0, 0.08, 0.08, 2.0);
    part(g, G.box, dark, 0.5, -0.72, 0, 0.08, 0.08, 2.0);
    [[-0.5, 0.4], [0.5, 0.4], [-0.5, -0.4], [0.5, -0.4]].forEach(function (s) {
      part(g, G.box, dark, s[0], -0.55, s[1], 0.06, 0.34, 0.06);
    });
    part(g, G.box, lmat("#F2B33D"), 0.66, 0, 0, 0.02, 0.3, 0.6);
    var rotor = new THREE.Group();
    rotor.position.y = 0.7;
    g.add(rotor);
    part(rotor, G.cyl, dark, 0, 0, 0, 0.18, 0.3, 0.18);
    part(rotor, G.box, dark, 0, 0.12, 0, 4.2, 0.04, 0.22);
    part(rotor, G.box, dark, 0, 0.12, 0, 0.22, 0.04, 4.2);
    var trotor = new THREE.Group();
    trotor.position.set(0.12, 0.55, -3.05);
    tail.add(trotor);
    part(trotor, G.box, dark, 0, 0, 0, 0.04, 1.0, 0.12);
    g.scale.setScalar(2.4);
    return {
      g: g,
      rotor: rotor,
      trotor: trotor,
      tail: tail,
      r: 3
    };
  }
  var enemies = [];
  var snapRoad = function (v) {
    return clamp(Math.round(v / 20) * 20, -80, 80);
  };
  function spawnEnemy(kind) {
    var b = kind === "tank" ? buildTank() : kind === "police" ? buildPolice() : buildHeli();
    var alive = dragons.filter(function (d) {
        return !d.dead;
      }),
      ref = pick(alive.length ? alive : dragons);
    var e = {
      kind: kind,
      b: b,
      g: b.g,
      hp: {
        police: 1.5,
        tank: 5,
        heli: 3
      }[kind],
      alive: true,
      dying: false,
      wreck: 0,
      t: 0,
      cd: rand(1.5, 3),
      yaw: 0,
      y: 0,
      spd: 0,
      burst: 0,
      bt: 0,
      target: ref,
      tt: 0
    };
    if (kind === "heli") {
      var a = rand(0, 6.283);
      e.x = clamp(ref.pos.x + Math.cos(a) * 60, -110, 110);
      e.z = clamp(ref.pos.z + Math.sin(a) * 60, -110, 80);
      e.y = 26;
      e.ang = a;
    } else if (Math.random() < 0.5) {
      e.axis = "x";
      e.z = pick(GRID);
      e.x = ref.pos.x > 0 ? -88 : 88;
    } else {
      e.axis = "z";
      e.x = pick(GRID);
      e.z = ref.pos.z > 0 ? -88 : 88;
    }
    e.id = void 0;
    e.g.position.set(e.x, e.y, e.z);
    scene.add(e.g);
    enemies.push(e);
    return e;
  }
  function clearEnemies() {
    enemies.forEach(function (e) {
      scene.remove(e.g);
      if (e.turret) scene.remove(e.turret.m);
    });
    enemies.length = 0;
    projs.forEach(function (p) {
      p.on = false;
      p.m.visible = false;
    });
    clearFlying();
  }
  function driveRoad(e, dt, maxSp, stopDist) {
    var T = e.target,
      dx = T.pos.x - e.x,
      dz = T.pos.z - e.z,
      dist = Math.hypot(dx, dz),
      mvx = 0,
      mvz = 0;
    if (dist > stopDist) {
      if (e.axis === "z") {
        var tz = snapRoad(T.pos.z),
          d = tz - e.z;
        if (Math.abs(d) > 0.25) mvz = Math.sign(d);else if (Math.abs(dx) > 1) {
          e.axis = "x";
          e.z = tz;
        }
      } else {
        var tx = clamp(T.pos.x, -86, 86),
          d2 = tx - e.x,
          tzz = snapRoad(T.pos.z);
        if (Math.abs(e.x - snapRoad(e.x)) < 0.3 && Math.abs(tzz - e.z) > 1) {
          e.axis = "z";
          e.x = snapRoad(e.x);
        } else if (Math.abs(d2) > 0.5) mvx = Math.sign(d2);
      }
    }
    e.spd = damp(e.spd, mvx || mvz ? maxSp : 0, 3, dt);
    e.x += mvx * e.spd * dt;
    e.z += mvz * e.spd * dt;
    if (mvx || mvz) {
      var ty = Math.atan2(mvx, mvz),
        dy = Math.atan2(Math.sin(ty - e.yaw), Math.cos(ty - e.yaw));
      e.yaw += dy * (1 - Math.exp(-8 * dt));
    }
    return dist;
  }
  function chest(d, out) {
    return out.set(d.pos.x, d.alt + d.jumpY + 0.85 * d.s, d.pos.z);
  }
  function updateEnemies(dt) {
    for (var i = enemies.length - 1; i >= 0; i--) {
      var e = enemies[i];
      e.t += dt;
      soundAt(e.x, e.z);
      if (e.wreck > 0) {
        e.wreck -= dt;
        if (Math.random() < dt * 14) FX_ADD.spawn(e.x + rand(-1, 1), e.y + rand(0.5, 1.5), e.z + rand(-1, 1), rand(-0.3, 0.3), rand(1.5, 3), rand(-0.3, 0.3), rand(0.4, 0.7), 1.2, 0.2, 0.9, 0, COL.fireA, COL.fireC, -2, 0.5);
        if (Math.random() < dt * 8) FX_SMOKE.spawn(e.x, e.y + 2, e.z, rand(-0.5, 0.5), rand(2, 3), rand(-0.5, 0.5), rand(1.5, 2.5), 1.2, 3.5, 0.6, 0, COL.smokeA, COL.smokeB, -0.6, 0.4);
        if (e.wreck < 1) e.g.position.y = e.y - (1 - e.wreck) * 2.5;
        if (e.turret) {
          var T = e.turret;
          T.v.y -= 20 * dt;
          T.m.position.addScaledVector(T.v, dt);
          T.m.rotation.x += T.w * dt;
          T.m.rotation.z += T.w * 0.6 * dt;
          if (T.m.position.y < 0.7) {
            T.m.position.y = 0.7;
            T.v.set(T.v.x * 0.4, Math.abs(T.v.y) * 0.25, T.v.z * 0.4);
            T.w *= 0.5;
          }
          if (e.wreck < 1) T.m.position.y -= dt * 2.5;
        }
        if (e.wreck <= 0) {
          scene.remove(e.g);
          if (e.turret) scene.remove(e.turret.m);
          enemies.splice(i, 1);
          delete false[e.id];
        }
        continue;
      }
      if (e.dying) {
        e.vy -= 12 * dt;
        e.y += e.vy * dt;
        e.yaw += dt * e.spin;
        e.g.rotation.x = Math.min(0.9, e.g.rotation.x + dt * 0.6);
        e.g.rotation.z += dt * 1.2;
        e.x += e.vx * dt;
        e.z += e.vz * dt;
        e.b.rotor.rotation.y += dt * 8;
        FX_SMOKE.spawn(e.x, e.y, e.z, rand(-0.5, 0.5), 1.5, rand(-0.5, 0.5), 1.8, 1.4, 4, 0.8, 0, COL.smokeA, COL.smokeB, -0.8, 0.4);
        if (Math.random() < 0.8) FX_ADD.spawn(e.x + rand(-0.8, 0.8), e.y + rand(-0.5, 0.8), e.z + rand(-0.8, 0.8), rand(-1, 1), rand(0, 2), rand(-1, 1), 0.35, 1.8, 0.4, 1, 0, COL.fireA, COL.fireB, -1, 1);
        if (e.y <= 1.2) {
          e.dying = false;
          e.y = 1.2;
          e.wreck = 7;
          e.g.rotation.set(0.25, e.yaw, 1.3);
          explosion(e.x, 1.5, e.z, 2.4);
          explosion(e.x + 1.5, 1, e.z - 1, 1.4);
          SFX.boom();
          SFX.crash(2);
          addTrauma(nearCam(e.x, e.z, 50) ? 0.4 : 0.05);
          shockwave(e.x, e.z, 7, 0.55);
          dustBurst(e.x, e.z, 2.2, 18);
          if (nearCam(e.x, e.z, 70)) pow("boom", e.x, 3, e.z, true, true);
          charEnemy(e);
          crashDamage(e.x, e.z, 4.5, 6, e.killer);
          for (var k = 0; k < 8; k++) spawnDebris(e.x, 1.5, e.z, rand(0.3, 0.9), rand(0.2, 0.5), rand(0.3, 1), rand(-9, 9), rand(6, 14), rand(-9, 9), C1.set(k < 3 ? "#2E3328" : "#56663F"), rand(2.5, 3.5));
        }
        e.g.position.set(e.x, e.y, e.z);
        e.g.rotation.y = e.yaw;
        continue;
      }
      if (void 0) {
        continue;
      }
      e.tt -= dt;
      if (e.tt <= 0 || !e.target || e.target.dead) {
        e.tt = 1.2;
        e.target = nearestDragon(e.x, e.z, 1e9) || player;
      }
      var T0 = e.target,
        dist;
      if (e.kind === "police") {
        dist = driveRoad(e, dt, 9, 4 + 1.2 * T0.s);
        var blink = Math.sin(now * 14) > 0;
        e.b.red.visible = blink;
        e.b.blue.visible = !blink;
        if (dist < 30 && G_.mode === "play") SFX.siren();
        e.cd -= dt;
        if (dist < 12 + 2 * T0.s && e.cd <= 0 && G_.mode === "play") {
          e.cd = rand(1.4, 2.2);
          V1.set(e.x, 2, e.z);
          chest(T0, V2);
          V3.subVectors(V2, V1).normalize().multiplyScalar(40);
          fireProj("bullet", V1, V3, 0.6);
          SFX.gun();
        }
      } else if (e.kind === "tank") {
        dist = driveRoad(e, dt, 4.2, 16 + 2.4 * T0.s);
        var aim = Math.atan2(T0.pos.x - e.x, T0.pos.z - e.z) - e.yaw;
        e.b.turret.rotation.y = damp(e.b.turret.rotation.y, Math.atan2(Math.sin(aim), Math.cos(aim)), 4, dt);
        e.cd -= dt;
        if (dist < 24 + 2.6 * T0.s && e.cd <= 0 && G_.mode === "play") {
          e.cd = rand(2.2, 3.2);
          e.b.tip.getWorldPosition(V1);
          chest(T0, V2);
          var Tt = clamp(dist / 22, 0.6, 1.7);
          V2.x += T0.vel.x * Tt * 0.7;
          V2.z += T0.vel.z * Tt * 0.7;
          V3.subVectors(V2, V1).divideScalar(Tt);
          V3.y += 0.5 * 12 * Tt;
          fireProj("shell", V1, V3, 9);
          for (var k2 = 0; k2 < 8; k2++) FX_SMOKE.spawn(V1.x, V1.y, V1.z, rand(-1.5, 1.5), rand(0, 1.5), rand(-1.5, 1.5), 0.8, 0.8, 2.4, 0.6, 0, COL.dust, COL.smokeA, -0.5, 2);
          FX_ADD.spawn(V1.x, V1.y, V1.z, 0, 0, 0, 0.12, 2.4, 0.6, 1, 0, COL.fireA, COL.fireB, 0, 0);
          SFX.shot();
          e.b.barrel.position.z = 0.75;
        }
        e.b.barrel.position.z = damp(e.b.barrel.position.z, 1.1, 6, dt);
      } else {
        e.ang += dt * 0.34;
        var R = 14 + 2.4 * T0.s,
          tx = T0.pos.x + Math.cos(e.ang) * R,
          tz = T0.pos.z + Math.sin(e.ang) * R,
          ty = T0.alt + 1.6 * T0.s + 5 + Math.sin(e.t * 1.3) * 0.8;
        var ox = e.x,
          oz = e.z;
        e.x = damp(e.x, tx, 0.8, dt);
        e.z = damp(e.z, tz, 0.8, dt);
        e.y = damp(e.y, ty, 1.1, dt);
        var vx = (e.x - ox) / Math.max(dt, 1e-4),
          vz = (e.z - oz) / Math.max(dt, 1e-4);
        e.yaw = Math.atan2(T0.pos.x - e.x, T0.pos.z - e.z);
        e.b.rotor.rotation.y += dt * 28;
        e.b.trotor.rotation.x += dt * 30;
        dist = Math.hypot(T0.pos.x - e.x, T0.pos.z - e.z);
        e.cd -= dt;
        if (e.cd <= 0 && dist < R + 10 && G_.mode === "play") {
          e.cd = rand(2.6, 3.4);
          e.burst = 8;
          e.bt = 0;
        }
        if (e.burst > 0) {
          e.bt -= dt;
          if (e.bt <= 0) {
            e.bt = 0.08;
            e.burst--;
            V1.set(e.x + Math.sin(e.yaw) * 3.5, e.y - 1, e.z + Math.cos(e.yaw) * 3.5);
            chest(T0, V2);
            V2.x += rand(-0.5, 0.5) * T0.s;
            V2.y += rand(-0.4, 0.4) * T0.s;
            V2.z += rand(-0.5, 0.5) * T0.s;
            V3.subVectors(V2, V1).normalize().multiplyScalar(50);
            fireProj("bullet", V1, V3, 1.6);
            SFX.gun();
            FX_ADD.spawn(V1.x, V1.y, V1.z, 0, 0, 0, 0.06, 1.4, 0.3, 1, 0, COL.fireA, COL.fireB, 0, 0);
          }
        }
        e.g.rotation.x = clamp((vx * Math.sin(e.yaw) + vz * Math.cos(e.yaw)) * 0.03, -0.3, 0.3);
      }
      e.g.position.set(e.x, e.y, e.z);
      e.g.rotation.y = e.yaw;
    }
    sfxMul = 1;
  }
  function charEnemy(e) {
    e.g.traverse(function (m) {
      if (m.isMesh) m.material = CHARMAT;
    });
  }
  function crashDamage(x, z, r, dmg, by) {
    eachNear(x, z, r, function (o) {
      if (distToBox(x, z, o) < r) damageObj(o, dmg, x, z, "boom", by, true);
    });
    knockPeds(x, z, r, by);
    dragons.forEach(function (d) {
      if (d !== by && !d.dead && Math.hypot(d.pos.x - x, d.pos.z - z) < r + d.s * 0.5 && d.alt < 2) d.hurt(dmg * 2, by, "boom", x, z);
    });
  }
  function hurtEnemy(e, dmg, kind, by) {
    if (!e.alive || e.dying || e.wreck) return;
    e.hp -= dmg;
    if (Math.random() < 0.3) sparks(e.x, e.y + 1.5, e.z, 5, 0.8);
    if (e.hp <= 0) killEnemy(e, kind, by);
  }
  function killEnemy(e, kind, by) {
    e.alive = false;
    e.killer = by;
    var val = {
      police: 80,
      tank: 200,
      heli: 300
    }[e.kind];
    if (by) by.addScore(val, e.x, (e.y || 0) + 3, e.z, true, true);
    soundAt(e.x, e.z);
    if (e.kind === "heli") {
      e.dying = true;
      e.vy = 3;
      e.spin = rand(7, 11) * (Math.random() < 0.5 ? 1 : -1);
      e.vx = rand(-4, 4);
      e.vz = rand(-4, 4);
      SFX.boom();
      explosion(e.x, e.y, e.z, 1.4);
      if (nearCam(e.x, e.z, 70)) pow("boom", e.x, e.y + 2, e.z, false, true);
      e.b.tail.visible = false;
      spawnDebris(e.x - Math.sin(e.yaw) * 4, e.y, e.z - Math.cos(e.yaw) * 4, 0.7, 0.7, 5.5, rand(-5, 5), 6, rand(-5, 5), C1.set("#56663F"), 3.5, 5);
      spawnDebris(e.x, e.y + 1.8, e.z, 9, 0.1, 0.5, rand(-8, 8), 10, rand(-8, 8), C1.set("#2E3328"), 3, 12);
      spawnDebris(e.x, e.y + 1.8, e.z, 0.5, 0.1, 9, rand(-8, 8), 12, rand(-8, 8), C1.set("#2E3328"), 3, 12);
      sfxMul = 1;
      return;
    }
    explosion(e.x, 1, e.z, e.kind === "tank" ? 2 : 1.4);
    SFX.boom();
    addTrauma(nearCam(e.x, e.z, 40) ? 0.25 : 0.03);
    shockwave(e.x, e.z, e.kind === "tank" ? 6 : 4, 0.4);
    if (nearCam(e.x, e.z, 70)) pow("boom", e.x, 3, e.z, e.kind === "tank", true);
    var col = new THREE.Color(e.kind === "tank" ? "#6E7F4C" : "#F4F4F2");
    for (var k = 0; k < 9; k++) spawnDebris(e.x, 1, e.z, rand(0.3, 0.8), rand(0.2, 0.5), rand(0.3, 0.8), rand(-8, 8), rand(6, 13), rand(-8, 8), k < 3 ? C1.set("#33372F") : col, rand(2, 3));
    charEnemy(e);
    e.wreck = 5.5;
    e.y = 0;
    if (e.kind === "tank") {
      var tw = new THREE.Vector3();
      e.b.turret.getWorldPosition(tw);
      e.g.remove(e.b.turret);
      e.b.turret.position.copy(tw);
      e.b.turret.scale.setScalar(2);
      e.b.turret.rotation.set(0, e.yaw, 0);
      scene.add(e.b.turret);
      e.turret = {
        m: e.b.turret,
        v: new THREE.Vector3(rand(-4, 4), rand(14, 18), rand(-4, 4)),
        w: rand(6, 10)
      };
    } else {
      e.g.rotation.z = Math.PI * 0.95;
      e.y = 1.2;
    }
    crashDamage(e.x, e.z, 3, 3, by);
    sfxMul = 1;
  }
  var projs = [];
  (function () {
    var shellMat = lmat("#2E3328"),
      bulMat = bmat("#FFE9A0");
    for (var i = 0; i < 60; i++) {
      var shell = i < 14,
        m = new THREE.Mesh(shell ? G.ball : G.box, shell ? shellMat : bulMat);
      m.scale.set(shell ? 0.55 : 0.1, shell ? 0.55 : 0.1, shell ? 0.55 : 1.4);
      m.visible = false;
      scene.add(m);
      projs.push({
        m: m,
        kind: shell ? "shell" : "bullet",
        on: false,
        p: new THREE.Vector3(),
        v: new THREE.Vector3(),
        t: 0,
        dmg: 1
      });
    }
  })();
  function fireProj(kind, from, vel, dmg) {
    for (var i = 0; i < projs.length; i++) {
      var p = projs[i];
      if (p.on || p.kind !== kind) continue;
      p.on = true;
      p.t = 0;
      p.dmg = dmg;
      p.p.copy(from);
      p.v.copy(vel);
      p.m.visible = true;
      p.m.position.copy(from);
      return;
    }
  }
  function updateProjs(dt) {
    for (var i = 0; i < projs.length; i++) {
      var p = projs[i];
      if (!p.on) continue;
      p.t += dt;
      if (p.kind === "shell") p.v.y -= 12 * dt;
      p.p.addScaledVector(p.v, dt);
      p.m.position.copy(p.p);
      if (p.kind === "bullet") p.m.lookAt(V1.copy(p.p).add(p.v));else if (Math.random() < 0.7) FX_SMOKE.spawn(p.p.x, p.p.y, p.p.z, 0, 0.3, 0, 0.5, 0.4, 1.0, 0.45, 0, COL.dust, COL.smokeA, 0, 1);
      var hit = null;
      for (var k = 0; k < dragons.length; k++) {
        var d = dragons[k];
        if (d.dead) continue;
        if (p.p.distanceTo(chest(d, V2)) < 0.75 * d.s + 0.3) {
          hit = d;
          break;
        }
      }
      soundAt(p.p.x, p.p.z);
      if (hit && G_.mode === "play") {
        p.on = false;
        p.m.visible = false;
        if (p.kind === "shell") {
          explosion(p.p.x, p.p.y, p.p.z, 1);
          SFX.boom();
        } else sparks(p.p.x, p.p.y, p.p.z, 3, 0.5);
        hit.hurt(p.dmg, null, p.kind === "shell" ? "shell" : "bullet", p.p.x - p.v.x, p.p.z - p.v.z);
      } else if (p.p.y < 0.1 || p.t > 3) {
        p.on = false;
        p.m.visible = false;
        if (p.kind === "shell" && p.p.y < 0.5) {
          explosion(p.p.x, 0.4, p.p.z, 1);
          SFX.boom();
          if (nearCam(p.p.x, p.p.z, 30)) addTrauma(0.08);
          crashDamage(p.p.x, p.p.z, 2, 3, null);
        } else if (p.p.y < 0.5) dustBurst(p.p.x, p.p.z, 0.2, 2);
      }
    }
    sfxMul = 1;
  }
  var heldMats = {};
  function hmat(c) {
    var k = c.getHexString();
    return heldMats[k] || (heldMats[k] = toon({
      color: "#" + k
    }));
  }
  function buildHeld(o, split) {
    var gA = new THREE.Group(),
      gB = split ? new THREE.Group() : null,
      cy = o.T.h * 0.5;
    function add(g, geom, col, x, y, z, sx, sy, sz, p) {
      var m = new THREE.Mesh(geom, hmat(col));
      m.position.set(x, y - cy, z);
      m.scale.set(sx, sy, sz);
      m.rotation.set(p[9] || 0, p[10] || 0, p[11] || 0);
      m.castShadow = true;
      g.add(m);
    }
    o.T.parts.forEach(function (p, i) {
      var col = o.parts[i].color,
        geom = G[p[0]],
        pz = p[4],
        sz = p[7],
        z0 = pz - sz / 2,
        z1 = pz + sz / 2;
      if (split && p[0] === "box" && !(p[9] || p[10] || p[11]) && z0 < -0.05 && z1 > 0.05) {
        add(gB, geom, col, p[2], p[3], z0 / 2, p[5], p[6], -z0, p);
        add(gA, geom, col, p[2], p[3], z1 / 2, p[5], p[6], z1, p);
      } else add(split && pz < 0 ? gB : gA, geom, col, p[2], p[3], pz, p[5], p[6], sz, p);
    });
    [gA, gB].forEach(function (g) {
      if (g) {
        g.scale.setScalar(o.sc);
        scene.add(g);
      }
    });
    return [gA, gB];
  }
  var chunks = [];
  function flingChunk(g, vx, vy, vz, spin, life) {
    chunks.push({
      g: g,
      v: new THREE.Vector3(vx, vy, vz),
      w: new THREE.Vector3(rand(-spin, spin), rand(-spin, spin), rand(-spin, spin)),
      life: life || 2.2,
      s0: g.scale.x
    });
  }
  function updateChunks(dt) {
    for (var i = chunks.length - 1; i >= 0; i--) {
      var c = chunks[i];
      c.life -= dt;
      c.v.y -= 20 * dt;
      c.g.position.addScaledVector(c.v, dt);
      c.g.rotation.x += c.w.x * dt;
      c.g.rotation.y += c.w.y * dt;
      c.g.rotation.z += c.w.z * dt;
      if (c.g.position.y < 0.4 * c.s0) {
        c.g.position.y = 0.4 * c.s0;
        c.v.multiplyScalar(0.5);
        c.v.y = Math.abs(c.v.y) * 0.4;
        c.w.multiplyScalar(0.6);
      }
      if (Math.random() < dt * 12 && c.life > 1) FX_SMOKE.spawn(c.g.position.x, c.g.position.y, c.g.position.z, 0, 1, 0, 0.8, 0.4, 1.4, 0.5, 0, COL.smokeA, COL.smokeB, -0.3, 0.5);
      if (c.life < 0.4) c.g.scale.setScalar(c.s0 * Math.max(0.01, c.life / 0.4));
      if (c.life <= 0) {
        scene.remove(c.g);
        chunks.splice(i, 1);
      }
    }
  }
  var thrown = [];
  function throwItem(g, vel, sz, by) {
    thrown.push({
      g: g,
      v: vel.clone(),
      w: new THREE.Vector3(rand(-9, 9), rand(-4, 4), rand(-9, 9)),
      by: by,
      sz: sz
    });
  }
  function updateThrown(dt) {
    for (var i = thrown.length - 1; i >= 0; i--) {
      var t = thrown[i];
      t.v.y -= 20 * dt;
      t.g.position.addScaledVector(t.v, dt);
      t.g.rotation.x += t.w.x * dt;
      t.g.rotation.y += t.w.y * dt;
      t.g.rotation.z += t.w.z * dt;
      var P = t.g.position,
        hitE = null,
        hitD = null;
      enemies.forEach(function (e) {
        if (e.alive && !e.dying && !e.wreck && Math.hypot(e.x - P.x, e.z - P.z) < e.b.r + t.sz && Math.abs(e.y + 1 - P.y) < 3) hitE = e;
      });
      dragons.forEach(function (d) {
        if (d !== t.by && !d.dead && P.distanceTo(chest(d, V2)) < 0.8 * d.s + t.sz * 0.5) hitD = d;
      });
      if (P.y < t.sz * 0.3 || hitE || hitD || Math.abs(P.x) > 120 || Math.abs(P.z) > 120) {
        thrown.splice(i, 1);
        soundAt(P.x, P.z);
        explosion(P.x, Math.max(0.5, P.y), P.z, 0.6 + t.sz * 0.3);
        SFX.crash(1);
        dustBurst(P.x, P.z, 0.6 + t.sz * 0.3, 8);
        if (nearCam(P.x, P.z, 40)) {
          addTrauma(0.1);
          pow("crash", P.x, P.y + 1.5, P.z, false, true);
        }
        if (hitE) hurtEnemy(hitE, 6, "throw", t.by);
        if (hitD) hitD.hurt(10 + t.sz * 4, t.by, "throw", P.x - t.v.x, P.z - t.v.z);
        eachNear(P.x, P.z, 1.5 + t.sz, function (o) {
          if (distToBox(P.x, P.z, o) < 1 + t.sz * 0.8) damageObj(o, 3, P.x, P.z, "throw", t.by, true);
        });
        knockPeds(P.x, P.z, 1.5 + t.sz, t.by);
        flingChunk(t.g, t.v.x * 0.2, 4, t.v.z * 0.2, 6, 1.2);
        sfxMul = 1;
      }
    }
  }
  function clearFlying() {
    chunks.forEach(function (c) {
      scene.remove(c.g);
    });
    chunks.length = 0;
    thrown.forEach(function (t) {
      scene.remove(t.g);
    });
    thrown.length = 0;
  }
  var LV = [{
    s: 1.0,
    tier: 0,
    need: 320,
    hp: 60,
    unlock: "Burn cars, trees and lamps"
  }, {
    s: 1.8,
    tier: 1,
    need: 1200,
    hp: 100,
    unlock: "Houses crumble now. Walk into small stuff to grab it"
  }, {
    s: 3.1,
    tier: 2,
    need: 3000,
    hp: 160,
    unlock: "Shops, apartments and factories are fair game"
  }, {
    s: 5.2,
    tier: 3,
    need: 6400,
    hp: 240,
    unlock: "Towers and the stadium go down now"
  }, {
    s: 7.8,
    tier: 3,
    need: 1e9,
    hp: 330,
    unlock: "Maximum kaiju"
  }];
  var BOT_NAMES = ["xX_Blaze_Xx", "NoodleTail", "Pyro_Pete", "moss_muncher", "KaijuKid07", "ToastyTom", "Sm0kyBoi", "LilSizzle", "Draco99", "grr1337", "Wyrmlord", "sk8ergator"];
  var RIGS = {
    dragon: {
      hips: "Bone_000",
      legR: ["Bone_006", "Bone_005", "Bone_004", "Bone_003"],
      legL: ["Bone_011", "Bone_010", "Bone_009", "Bone_008"],
      spine: ["Bone_015", "Bone_014", "Bone_013", "Bone_012"],
      neck: "Bone_025",
      head: "Bone_024",
      skull: "Bone_023",
      wingR: ["Bone_028", "Bone_027", "Bone_026"],
      wingL: ["Bone_031", "Bone_030", "Bone_029"],
      armR: ["Bone_036", "Bone_035", "Bone_034", "Bone_033"],
      armL: ["Bone_041", "Bone_040", "Bone_039", "Bone_038"],
      tail: ["Bone_022", "Bone_021", "Bone_020", "Bone_019", "Bone_018", "Bone_017", "Bone_016"],
      armDrop: 0,
      mouth: [0, 1.02, 0.64]
    },
    char2: {
      hips: "Bone_000",
      legR: ["Bone_009", "Bone_008", "Bone_007", "Bone_006"],
      legL: ["Bone_014", "Bone_013", "Bone_012", "Bone_011"],
      spine: ["Bone_001", "Bone_004", "Bone_003", "Bone_002"],
      neck: "Bone_025",
      head: "Bone_024",
      skull: "Bone_023",
      wingR: ["Bone_028", "Bone_027", "Bone_026"],
      wingL: ["Bone_031", "Bone_030", "Bone_029"],
      armR: ["Bone_036", "Bone_035", "Bone_034", "Bone_033"],
      armL: ["Bone_041", "Bone_040", "Bone_039", "Bone_038"],
      tail: ["Bone_021", "Bone_020", "Bone_019", "Bone_018", "Bone_017", "Bone_016", "Bone_015"],
      armDrop: -0.9,
      tailFix: [0.13, 0.14],
      mouth: [0, 1.3, 0.54]
    }
  };
  var BN = RIGS[window.CHARACTER] || RIGS.dragon;
  var SKINS = [{
    name: "Gold",
    need: 0,
    h: 0,
    s: 1,
    b: 1,
    swatch: "#F2C14E",
    fire: ["#FFF3B0", "#FF7A1A", "#E8341C"]
  }, {
    name: "Ruby",
    need: 2,
    h: -0.8,
    s: 1.15,
    b: 0.92,
    swatch: "#D8453A",
    fire: ["#FFE0B0", "#FF5A1A", "#C81C2C"]
  }, {
    name: "Jade",
    need: 4,
    h: 1.25,
    s: 0.95,
    b: 0.9,
    swatch: "#3DBB6E",
    fire: ["#F4FFB0", "#9BE22A", "#2E9E3A"]
  }, {
    name: "Frost",
    need: 6,
    h: 2.6,
    s: 0.75,
    b: 1.1,
    swatch: "#7FC8F2",
    fire: ["#E8FBFF", "#5AC8FF", "#2A6BE8"]
  }, {
    name: "Shadow",
    need: 8,
    h: -2.3,
    s: 0.6,
    b: 0.5,
    swatch: "#5B3F7A",
    fire: ["#F6D8FF", "#B45AFF", "#6A1FC8"]
  }];
  function circleBox(px, pz, r, o) {
    var cx = clamp(px, o.x - o.hw, o.x + o.hw),
      cz = clamp(pz, o.z - o.hd, o.z + o.hd);
    var dx = px - cx,
      dz = pz - cz,
      d2 = dx * dx + dz * dz;
    if (d2 >= r * r) return null;
    var d = Math.sqrt(d2);
    if (d < 1e-4) {
      var ox = o.hw - Math.abs(px - o.x),
        oz = o.hd - Math.abs(pz - o.z);
      return ox < oz ? {
        nx: Math.sign(px - o.x) || 1,
        nz: 0,
        pen: ox + r
      } : {
        nx: 0,
        nz: Math.sign(pz - o.z) || 1,
        pen: oz + r
      };
    }
    return {
      nx: dx / d,
      nz: dz / d,
      pen: r - d
    };
  }
  function distToBox(px, pz, o) {
    var cx = clamp(px, o.x - o.hw, o.x + o.hw),
      cz = clamp(pz, o.z - o.hd, o.z + o.hd);
    return Math.hypot(px - cx, pz - cz);
  }
  function worldAuth() {
    return !false;
  }
  var DK = ["fire", "spin", "stomp", "boom", "burn", "throw", "ram", "grab"];
  var activeList = [];
  function activate(o) {
    if (!o.active) {
      o.active = true;
      activeList.push(o);
    }
  }
  function damageObj(o, amt, fx, fz, kind, by, silent) {
    if (!o.alive || o.state === 1) return;
    if (void 0) {
      if (kind === "fire") {
        o.tint = Math.min(0.5, o.tint + amt * 0.02);
        o.burn = Math.max(o.burn, 1.2);
        o.burnBy = by;
      } else if (kind !== "burn") {
        o.flash = 0.16;
        o.wob = Math.min(1, o.wob + 0.5);
      }
      activate(o);
      return;
    }
    var at = by ? LV[by.lvl].tier : 0;
    if (o.T.tier > at) {
      if (silent || !by) return;
      if (kind !== "fire") {
        o.wob = 0.6;
        activate(o);
        if (nearCam(o.x, o.z, 50)) sparks(o.x - (o.x - fx) * 0.2, Math.min(o.h, by.s * 1.2), o.z - (o.z - fz) * 0.2, 6, 0.6 + by.s * 0.2);
        if (by.isPlayer) {
          SFX.clank();
          tooBig(o);
        }
      } else {
        o.tint = Math.min(0.35, o.tint + amt * 0.02);
        activate(o);
        if (by.isPlayer) tooBig(o);
      }
      return;
    }
    var mult = (1 + 0.45 * (at - o.T.tier) + (by && by.lvl >= LV.length - 1 ? 0.3 : 0)) * (by ? by.dmgMul : 1);
    o.hp -= amt * mult;
    o.flash = 0.16;
    o.wob = Math.min(1, o.wob + 0.5);
    o.tint = Math.min(0.6, o.tint + amt * mult * 0.12 / o.T.hp);
    if (kind === "fire") {
      o.burn = 2.2;
      o.burnBy = by;
    }
    activate(o);
    if (o.hp <= 0) destroyObj(o, fx, fz, kind, by);
  }
  function destroyObj(o, fx, fz, kind, by) {
    var T = o.T,
      big = T.big || 0,
      vis = nearCam(o.x, o.z, 75);
    var dx = o.x - fx,
      dz = o.z - fz,
      dl = Math.hypot(dx, dz) || 1;
    dx /= dl;
    dz /= dl;
    if (!o.mv && worldAuth()) G_.destroyedVal += T.val;
    if (by) by.addScore(T.val, o.x, o.h * 0.7, o.z, big);
    if (minimap.ctx && big) minimap.mark(o);
    soundAt(o.x, o.z);
    if (big) {
      o.state = 1;
      o.st = 0;
      o.cd = 0.6 + big * 0.25;
      o.tilt.set(rand(-0.25, 0.25), 0, rand(-0.25, 0.25));
      activate(o);
      if (vis) {
        var n = 9 + big * 7,
          c0 = o.parts[0].color,
          c1 = o.parts[1] ? o.parts[1].color : c0;
        for (var i = 0; i < n; i++) {
          var sz = rand(0.35, 0.8) * (0.6 + big * 0.5);
          spawnDebris(o.x + rand(-1, 1) * o.hw, rand(0.3, 1) * o.h, o.z + rand(-1, 1) * o.hd, sz, sz * rand(0.5, 1.2), sz * rand(0.5, 1.2), dx * rand(2, 9) + rand(-3, 3), rand(3, 11), dz * rand(2, 9) + rand(-3, 3), C1.copy(Math.random() < 0.8 ? c0 : c1).lerp(CHAR, o.tint * 0.6));
        }
        for (i = 0; i < 6 + big * 3; i++) spawnDebris(o.x + rand(-1, 1) * o.hw, rand(0.3, 1) * o.h, o.z + rand(-1, 1) * o.hd, rand(0.15, 0.35), 0.04, rand(0.15, 0.35), rand(-7, 7), rand(4, 10), rand(-7, 7), GLASS, rand(1.2, 2));
        var th = Math.min(o.h * 0.28, 7);
        spawnDebris(o.x + dx * 0.5, o.h - th * 0.5, o.z + dz * 0.5, o.hw * 1.7, th, o.hd * 1.7, dx * (2 + big), 1.5, dz * (2 + big), C1.copy(c0).lerp(CHAR, o.tint * 0.5), 1.4 + big * 0.2, 1.8);
        dustBurst(o.x, o.z, Math.max(o.hw, o.hd) * 1.1, 10 + big * 6);
        pow(big >= 2 || Math.random() < 0.5 ? "crash" : "pop", o.x, o.h * 0.8, o.z, big >= 2, big >= 2);
      }
      SFX.crash(big);
      if (vis) {
        addTrauma(0.2 + big * 0.12);
        if (by && by.isPlayer) hitstop(40 + big * 25);
      }
      if (T.boom) {
        explosion(o.x, 2, o.z, 3);
        explosion(o.x + 2, 1.5, o.z - 1, 2);
        SFX.boom();
        shockwave(o.x, o.z, 10, 0.6);
        crashDamage(o.x, o.z, 7, 6, by);
        if (vis) pow("boom", o.x, 5, o.z, true, true);
      }
    } else {
      o.alive = false;
      writeObj(o);
      if (vis) {
        var sp = kind === "spin" ? 13 : kind === "stomp" ? 8 : 6;
        spawnDebris(o.x, o.h * 0.4, o.z, o.hw * 1.6, o.h * 0.6, o.hd * 1.6, dx * sp + rand(-2, 2), rand(5, 10), dz * sp + rand(-2, 2), C1.copy(mainColor(o)).lerp(CHAR, o.tint * 0.5), rand(2, 3));
        for (i = 0; i < 3; i++) spawnDebris(o.x, o.h * 0.5, o.z, 0.25, 0.25, 0.25, rand(-4, 4) + dx * 3, rand(4, 8), rand(-4, 4) + dz * 3, o.parts[0].color, rand(1.5, 2.5));
        if (T.car && Math.random() < 0.5) explosion(o.x, 0.6, o.z, 0.6);
        dustBurst(o.x, o.z, 0.6, 4);
        if (T.car || Math.random() < 0.25) pow(T.car && Math.random() < 0.4 ? "boom" : "pop", o.x, o.h + 1, o.z, false);
        addTrauma(0.03);
      }
      SFX.pop();
    }
    sfxMul = 1;
  }
  function tooBig(o) {
    if (G_.tooBigT > 0) return;
    G_.tooBigT = 2.5;
    floatText("Too big! Grow first", o.x, Math.min(o.h, 3 * player.s), o.z, "warn");
  }
  function Rig(root) {
    this.b = {};
    var self = this;
    root.updateMatrixWorld(true);
    root.traverse(function (o) {
      if (!o.isBone) return;
      var C = new THREE.Quaternion();
      o.getWorldQuaternion(C);
      self.b[o.name] = {
        bone: o,
        rest: o.quaternion.clone(),
        C: C,
        Ci: C.clone().invert(),
        e: new THREE.Vector3()
      };
    });
  }
  Rig.prototype.rot = function (name, x, y, z) {
    var b = this.b[name];
    if (!b) return;
    b.e.x += x;
    b.e.y += y;
    b.e.z += z;
  };
  Rig.prototype.apply = function () {
    for (var k in this.b) {
      var b = this.b[k];
      if (b.e.x === 0 && b.e.y === 0 && b.e.z === 0) {
        b.bone.quaternion.copy(b.rest);
        continue;
      }
      Q1.setFromEuler(E1.set(b.e.x, b.e.y, b.e.z, "YXZ"));
      b.bone.quaternion.copy(b.rest).multiply(Q2.copy(b.Ci).multiply(Q1).multiply(b.C));
      b.e.set(0, 0, 0);
    }
  };
  var DRAGON_BUF = null,
    DRAGON_TEXS = null;
  function dragonTextures() {
    if (DRAGON_TEXS) return DRAGON_TEXS;
    var tl = new THREE.TextureLoader();
    var tx = function (k, srgb) {
      var t = tl.load(DRAGON_TEX[k]);
      t.flipY = false;
      if (srgb) t.encoding = THREE.sRGBEncoding;
      t.anisotropy = 4;
      return t;
    };
    return DRAGON_TEXS = {
      base: tx("base", true),
      normal: tx("normal")
    };
  }
  var dragonBufP = null;
  function pickGlb(M) {
    for (var k in M) {
      var a = M[k],
        u = a && (a.url || a);
      if (typeof u === "string" && (/\.glb(\?|$)/i.test(u) || a && a.type === "model_3d")) return u;
    }
    return null;
  }
  function dragonAssetUrl() {
    var maps = [];
    try {
      if (typeof assets !== "undefined" && assets) maps.push(assets);
    } catch (e) {}
    try {
      if (window.assets) maps.push(window.assets);
    } catch (e) {}
    try {
      if (window.ASSET_MAP) maps.push(window.ASSET_MAP);
    } catch (e) {}
    for (var i = 0; i < maps.length; i++) {
      var u = pickGlb(maps[i]);
      if (u) return u;
    }
    return null;
  }
  function loadDragonBuf() {
    if (dragonBufP) return dragonBufP;
    var url = dragonAssetUrl() || DRAGON_GLB_URL;
    if (!url) return dragonBufP = Promise.reject(new Error("dragon asset not found - upload dragon.glb"));
    return dragonBufP = fetch(url).then(function (r) {
      if (!r.ok) throw new Error("dragon model " + r.status + " at " + url);
      return r.arrayBuffer();
    }).then(function (b) {
      return DRAGON_BUF = new Uint8Array(b);
    });
  }
  function parseDragon(cb) {
    loadDragonBuf().then(function () {
      new THREE.GLTFLoader().parse(DRAGON_BUF.buffer.slice(0), "", function (gltf) {
        cb(gltf.scene);
      }, function (e) {
        console.error(e);
        el("loadmsg").textContent = "Could not load the dragon.";
      });
    }, function (e) {
      console.error(e);
      el("loadmsg").textContent = "Could not load the dragon.";
    });
  }
  function makeSkinMat() {
    var T = dragonTextures();
    var mat = toon({
      map: T.base,
      normalMap: T.normal,
      side: THREE.DoubleSide,
      opacity: POST.on ? 0.5 : 1,
      blending: THREE.CustomBlending,
      blendSrc: THREE.OneFactor,
      blendDst: THREE.ZeroFactor
    });
    mat.normalScale.set(0.6, 0.6);
    mat.userData.u = {
      uHue: {
        value: 0
      },
      uSat: {
        value: 1
      },
      uBri: {
        value: 1
      },
      uFlash: {
        value: 0
      }
    };
    mat.onBeforeCompile = function (sh) {
      Object.assign(sh.uniforms, mat.userData.u);
      sh.fragmentShader = "uniform float uHue;uniform float uSat;uniform float uBri;uniform float uFlash;\nvec3 skinAdj(vec3 c){const vec3 k=vec3(0.57735);float ca=cos(uHue);c=c*ca+cross(k,c)*sin(uHue)+k*dot(k,c)*(1.0-ca);float l=dot(c,vec3(0.299,0.587,0.114));return max(mix(vec3(l),c,uSat)*uBri,0.0);}\n" + sh.fragmentShader.replace("#include <map_fragment>", "#include <map_fragment>\nvec3 skinColor=skinAdj(diffuseColor.rgb);float skinLum=dot(skinColor,vec3(0.299,0.587,0.114));vec3 hitTint=vec3(skinLum*1.75,skinLum*0.70,skinLum*0.35);diffuseColor.rgb=mix(skinColor,hitTint,uFlash);");
    };
    return mat;
  }
  function Dragon(model, opts) {
    this.isPlayer = !!opts.player;
    this.name = opts.name;
    this.skin = opts.skin;
    this.brain = opts.brain || null;
    this.root = new THREE.Group();
    this.root.rotation.order = "YXZ";
    scene.add(this.root);
    this.model = model;
    this.root.add(model);
    this.mat = makeSkinMat();
    var self = this;
    model.traverse(function (o) {
      if (o.isMesh) {
        o.castShadow = true;
        o.receiveShadow = true;
        o.frustumCulled = false;
        o.material = self.mat;
      }
    });
    this.rig = new Rig(model);
    var head = this.rig.b[BN.head].bone;
    var MO = BN.mouth || [0, 1.3, 0.54];
    var mq = /[?&]mouth=([-\d.]+),([-\d.]+)/.exec(location.search);
    if (mq) MO = [0, +mq[1], +mq[2]];
    this.mouth = new THREE.Object3D();
    head.add(this.mouth);
    this.mouth.position.copy(head.worldToLocal(new THREE.Vector3(MO[0], MO[1], MO[2])));
    this.kb = new THREE.Vector3();
    this.stars = [0, 1, 2].map(function () {
      var m = new THREE.Mesh(G.ball, new THREE.MeshBasicMaterial({
        color: "#FFD23F"
      }));
      m.visible = false;
      scene.add(m);
      return m;
    });
    this.dmgMul = 1;
    this.pvp = 1;
    this.pos = new THREE.Vector3();
    this.vel = new THREE.Vector3();
    this.in = {
      x: 0,
      z: 0,
      fire: false
    };
    this.fireCol = SKINS[0].fire.map(hexRGB);
    this.setSkin(this.skin);
    this.reset(0, 0, 0);
    this.score = 0;
    this.kills = 0;
  }
  Dragon.prototype.setSkin = function (i) {
    var S = SKINS[i],
      u = this.mat.userData.u;
    this.skin = i;
    u.uHue.value = S.h;
    u.uSat.value = S.s;
    u.uBri.value = S.b;
    this.fireCol = S.fire.map(hexRGB);
    this.color = S.swatch;
  };
  Dragon.prototype.reset = function (x, z, yaw) {
    Object.assign(this, {
      yaw: yaw || 0,
      lvl: 0,
      s: 1,
      sTarget: 1,
      growT: -1,
      growFrom: 1,
      meter: 0,
      hp: LV[0].hp,
      fire: 0,
      spinT: -1,
      spinCd: 0,
      stompT: -1,
      stompCd: 0,
      roarT: -1,
      jumpY: 0,
      phase: 0,
      moveBlend: 0,
      lastStepSign: 0,
      flinch: 0,
      alt: 0,
      flying: false,
      airborne: false,
      fb: 0,
      energy: 1,
      fuel: 1,
      fuelWait: 0,
      fireLock: false,
      dive: false,
      landT: 0,
      wingPh: 0,
      roll: 0,
      lastHurt: -99,
      dead: false,
      deadT: 0,
      respawnT: 0,
      inv: 0,
      grab: null,
      grabCd: 0,
      combo: 0,
      comboT: 0,
      lastBy: null,
      lastByT: -99,
      bump: 0
    });
    this.pos.set(x, 0, z);
    this.vel.set(0, 0, 0);
    this.in = {
      x: 0,
      z: 0,
      fire: false
    };
    this.gy = groundAt(x, z);
    this.root.visible = true;
    this.hitFlash = 0;
    this.mat.userData.u.uFlash.value = 0;
    this.kb.set(0, 0, 0);
    this.hitT = -1;
    this.stagger = 0;
    this.hitDir = 1;
    this.fireHurtT = 0;
  };
  Dragon.prototype.maxHp = function () {
    return LV[this.lvl].hp;
  };
  Dragon.prototype.addScore = function (val, x, y, z, big, meter) {
    if (G_.mode === "intro") return;
    this.combo++;
    this.comboT = 2.4;
    var pts = Math.round(val * (1 + Math.min(this.combo, 20) * 0.05));
    if (void 0) {
      if (this.isPlayer) floatText("+" + pts, x, y, z, big ? "big" : "");
      return;
    }
    this.score += pts;
    if (meter !== false) this.meter += val;
    if (this.isPlayer) floatText("+" + pts, x, y, z, big ? "big" : "");
    if (this.lvl < LV.length - 1 && this.meter >= LV[this.lvl].need) this.growUp();
  };
  Dragon.prototype.growUp = function () {
    if (this.lvl >= LV.length - 1) return;
    var ratio = this.hp / this.maxHp();
    this.meter -= LV[this.lvl].need;
    this.lvl++;
    this.growFrom = this.s;
    this.sTarget = LV[this.lvl].s;
    this.growT = 0;
    this.roarT = 0;
    this.hp = Math.min(this.maxHp(), ratio * this.maxHp() + this.maxHp() * 0.3);
    soundAt(this.pos.x, this.pos.z);
    SFX.roar(true);
    sfxMul = 1;
    if (nearCam(this.pos.x, this.pos.z, 60)) {
      shockwave(this.pos.x, this.pos.z, 6 * this.sTarget, 0.7);
      dustBurst(this.pos.x, this.pos.z, 1.2 * this.sTarget, 22);
    }
    if (this.isPlayer) {
      slowmo = 0.25;
      SFX.grow();
      addTrauma(0.6);
      banner("Size up!", LV[this.lvl].unlock);
      Music.intensity = Math.min(3, 1 + this.lvl);
    } else feed(this.name + " grew to size " + (this.lvl + 1), this.color);
  };
  Dragon.prototype.hurt = function (amt, by, kind, fx, fz, net) {
    if (this.dead || this.inv > 0 || this.growT >= 0 || G_.mode !== "play") return;
    var ghost = false;
    if (void 0 && !net) {
      if (this === player) return;
      ghost = true;
    }
    var noKb = ghost || this.netRemote;
    if (!ghost) this.hp -= amt;
    this.lastHurt = now;
    this.hitFlash = Math.max(this.hitFlash || 0, kind === "fire" ? 0.06 : 0.16);
    if (by) {
      this.lastBy = by;
      this.lastByT = now;
    }
    var heavy = kind === "spin" || kind === "stomp" || kind === "throw" || amt >= 8,
      vis = nearCam(this.pos.x, this.pos.z, 60);
    var dx = this.pos.x - (fx !== undefined ? fx : by ? by.pos.x : this.pos.x - Math.sin(this.yaw)),
      dz = this.pos.z - (fz !== undefined ? fz : by ? by.pos.z : this.pos.z - Math.cos(this.yaw)),
      dl = Math.hypot(dx, dz) || 1;
    dx /= dl;
    dz /= dl;
    var facing = Math.sin(this.yaw) * dx + Math.cos(this.yaw) * dz;
    this.hitDir = facing > 0 ? -1 : 1;
    if (kind === "fire") {
      this.flinch = Math.min(0.6, this.flinch + 0.08);
      this.fireHurtT -= 1;
      if (this.fireHurtT <= 0 && vis) {
        this.fireHurtT = 8;
        chest(this, V1);
        FX_SMOKE.spawn(V1.x, V1.y + 0.3 * this.s, V1.z, rand(-1, 1), 2, rand(-1, 1), 0.8, 0.3 * this.s, 1.2 * this.s, 0.6, 0, COL.smokeA, COL.smokeB, -0.5, 0.5);
      }
    } else {
      var push = (heavy ? 7 : 2.5) * (by ? Math.sqrt(by.s / this.s) : 0.6);
      if (!noKb) {
        this.kb.x += dx * push;
        this.kb.z += dz * push;
      }
      this.hitT = 0;
      this.flinch = Math.min(1, this.flinch + (heavy ? 0.8 : 0.35));
      if (heavy) {
        this.stagger = 0.4;
        if (this.grab) this.dropGrab();
        if (this.stompT >= 0 && this.stompT < 0.14) this.stompT = -1;
      }
      if (vis) {
        chest(this, V1);
        V1.x -= dx * 0.4 * this.s;
        V1.z -= dz * 0.4 * this.s;
        sparks(V1.x, V1.y, V1.z, heavy ? 16 : 6, 0.6 + this.s * 0.25);
        if (heavy) {
          shockwave(this.pos.x, this.pos.z, 1.6 * this.s, 0.3);
          pow("hit", V1.x, V1.y + 0.8 * this.s, V1.z, false, true);
        }
      }
      soundAt(this.pos.x, this.pos.z);
      SFX.hit(heavy);
      sfxMul = 1;
      if (by && by.isPlayer) {
        hitstop(heavy ? 90 : 35);
        addTrauma(heavy ? 0.25 : 0.08);
      }
    }
    if (by && by.isPlayer) {
      this.dmgAcc = (this.dmgAcc || 0) + amt;
      if (kind !== "fire" || this.dmgAcc >= 4) {
        floatText("-" + Math.round(this.dmgAcc), this.pos.x, this.alt + 2 * this.s, this.pos.z, "dmg");
        this.dmgAcc = 0;
      }
    }
    if (this.isPlayer) {
      addTrauma(kind === "fire" ? 0.02 : 0.08 + amt * 0.02);
      if (kind !== "fire") SFX.hurt();
      if (kind !== "fire" || Math.random() < 0.05) {
        hud.hurt.classList.remove("on");
        void hud.hurt.offsetWidth;
        hud.hurt.classList.add("on");
      }
      if (heavy) pow("hurt", this.pos.x, this.alt + 1.9 * this.s, this.pos.z, false, true);
    }
    if (!ghost && this.hp <= 0) this.die(by || (now - this.lastByT < 4 ? this.lastBy : null));
  };
  Dragon.prototype.die = function (by) {
    this.hp = 0;
    this.dead = true;
    this.deadT = 0;
    this.respawnT = 4.5;
    this.flying = false;
    this.dive = false;
    this.fire = 0;
    if (this.grab) this.dropGrab();
    soundAt(this.pos.x, this.pos.z);
    if (this.isPlayer) SFX.ko();else if (by && by.isPlayer) SFX.reward();
    SFX.boom();
    sfxMul = 1;
    if (nearCam(this.pos.x, this.pos.z, 70)) {
      explosion(this.pos.x, this.s, this.pos.z, 0.8 + this.s * 0.3);
      pow("ko", this.pos.x, this.s * 2, this.pos.z, true, true);
      addTrauma(0.3);
    }
    if (by && by !== this) {
      if (worldAuth()) {
        by.kills++;
        by.addScore(300 + 250 * this.lvl, this.pos.x, this.s * 2, this.pos.z, true);
      }
      feed(by.name + " KO'd " + this.name, by.color);
    } else feed(this.name + " was taken down by the army", "#8A8F9C");
    if (this.isPlayer) playerDown();
  };
  Dragon.prototype.respawn = function () {
    var self = this,
      best = SPAWNS[0],
      bs = -1;
    SPAWNS.forEach(function (sp) {
      var d = nearestDragon(sp[0], sp[1], 1e9, self),
        dd = d ? Math.hypot(d.pos.x - sp[0], d.pos.z - sp[1]) : 999;
      if (dd > bs) {
        bs = dd;
        best = sp;
      }
    });
    var keep = Math.max(0, this.lvl - 1);
    this.respawnAt(best[0], best[1], keep);
  };
  Dragon.prototype.respawnAt = function (x, z, lvl) {
    this.stars.forEach(function (m) {
      m.visible = false;
    });
    var score = this.score,
      kills = this.kills;
    this.reset(x, z, Math.atan2(-x, -z));
    this.lvl = clamp(lvl, 0, LV.length - 1);
    this.s = this.sTarget = LV[this.lvl].s;
    this.hp = this.maxHp();
    this.inv = 2.5;
    this.score = score;
    this.kills = kills;
    if (this.isPlayer) playerUp();
  };
  Dragon.prototype.dropGrab = function () {
    var g = this.grab;
    if (g) g.parts.forEach(function (p) {
      if (p && p.parent && !g.fired) scene.remove(p);
    });
    this.grab = null;
  };
  Dragon.prototype.canGrab = function (o) {
    return o.T.grab && this.lvl >= 1 && !this.grab && this.grabCd <= 0 && this.alt < 0.2 && !this.flying && this.stompT < 0 && this.spinT < 0 && Math.max(o.hw, o.hd) * 2 <= 1.3 * this.s && o.h <= 1.5 * this.s && o.T.tier <= LV[this.lvl].tier;
  };
  var GK = ["tear", "throw", "eat"];
  Dragon.prototype.startGrab = function (o) {
    var k = this.in.forceKind || pick(o.T.car ? ["tear", "tear", "throw", "eat"] : ["throw", "eat"]);
    o.alive = false;
    writeObj(o);
    if (!o.mv && worldAuth()) G_.destroyedVal += o.T.val;
    this.addScore(o.T.val, o.x, o.h + this.s, o.z, false);
    var parts = buildHeld(o, k === "tear");
    parts.forEach(function (p) {
      if (p) p.position.set(o.x, o.h * 0.5, o.z);
    });
    var lf = this.in.grabLift || 0.25;
    this.grab = {
      k: k,
      t: 0,
      lift: lf,
      rip: lf + 0.4,
      dur: k === "tear" ? lf + 0.8 : k === "throw" ? 0.72 : 0.85,
      parts: parts,
      fired: false,
      car: !!o.T.car,
      sz: Math.max(o.hw, o.hd, o.h * 0.5) * 1.2,
      from: new THREE.Vector3(o.x, o.h * 0.5, o.z),
      rot0: o.rot,
      sc0: o.sc
    };
    soundAt(this.pos.x, this.pos.z);
    SFX.pop();
    sfxMul = 1;
  };
  var GP = new THREE.Vector3(),
    GW = new THREE.Vector3();
  Dragon.prototype.updateGrab = function (dt) {
    var g = this.grab;
    if (!g) return;
    g.t += dt;
    var t = g.t,
      s = this.s,
      lift = clamp(t / g.lift, 0, 1),
      e = lift * lift * (3 - 2 * lift),
      gap = 0,
      shake = 0,
      scl = 1,
      tilt = 0,
      self = this;
    this.root.updateMatrixWorld(true);
    var M = this.root.matrixWorld;
    function local(x, y, z) {
      return V3.set(x, y, z).applyMatrix4(M);
    }
    if (g.k === "eat") {
      GP.copy(local(0, 1.75, 0.95));
      if (t > 0.25) {
        var k2 = clamp((t - 0.25) / 0.3, 0, 1);
        GP.lerp(local(0, 1.12, 0.7), k2);
        scl = 1 - k2 * 0.92;
      }
      if (t > 0.55 && !g.fired) {
        g.fired = true;
        scene.remove(g.parts[0]);
        soundAt(this.pos.x, this.pos.z);
        SFX.chomp();
        sfxMul = 1;
        this.hp = Math.min(this.maxHp(), this.hp + 8);
        this.mouth.getWorldPosition(V1);
        if (nearCam(this.pos.x, this.pos.z, 60)) {
          for (var i = 0; i < 10; i++) FX_SMOKE.spawn(V1.x, V1.y, V1.z, rand(-2, 2), rand(0, 2), rand(-2, 2), 0.5, 0.25 * s, 0.05, 1, 0, COL.dust, COL.dustB, 9, 1);
          pow("chomp", V1.x, V1.y + 0.4 * s, V1.z, false, true);
        }
      }
    } else if (g.k === "throw") {
      GP.copy(local(0, 2.25, 0.1));
      if (t > 0.25) GP.lerp(local(0, 2.0, -0.45), clamp((t - 0.25) / 0.2, 0, 1));
      tilt = -clamp((t - 0.25) / 0.2, 0, 1) * 0.8;
      if (t > 0.45 && !g.fired) {
        g.fired = true;
        var fx = Math.sin(this.yaw),
          fz = Math.cos(this.yaw),
          spd = 12 + 5 * Math.sqrt(s);
        throwItem(g.parts[0], V2.set(fx * spd, 6 + s, fz * spd), g.sz, this);
        soundAt(this.pos.x, this.pos.z);
        SFX.throwS();
        sfxMul = 1;
        if (nearCam(this.pos.x, this.pos.z, 60)) pow("yeet", g.parts[0].position.x, g.parts[0].position.y + 0.6 * s, g.parts[0].position.z, false, true);
      }
    } else {
      GP.copy(local(0, 1.8, 0.8));
      if (t > g.lift && t < g.rip) {
        shake = 0.05 * Math.sin(t * 90);
        gap = (t - g.lift) * 0.5;
      }
      if (t > g.rip && !g.fired) {
        g.fired = true;
        var sx = Math.cos(this.yaw),
          sz = -Math.sin(this.yaw);
        g.parts.forEach(function (p, h) {
          var sg = h ? -1 : 1;
          flingChunk(p, sx * sg * 9 + rand(-1, 1), 6, sz * sg * 9 + rand(-1, 1), 8, 2.2);
        });
        soundAt(this.pos.x, this.pos.z);
        SFX.rip();
        if (g.car) SFX.boom();
        sfxMul = 1;
        if (nearCam(this.pos.x, this.pos.z, 60)) {
          explosion(GP.x, GP.y, GP.z, 0.7);
          sparks(GP.x, GP.y, GP.z, 14, 0.8);
          pow("rip", GP.x, GP.y + s, GP.z, true, true);
          addTrauma(this.isPlayer ? 0.15 : 0.03);
        }
        this.addScore(15, GP.x, GP.y, GP.z, false);
      }
    }
    if (!g.fired) {
      var from = g.from;
      g.parts.forEach(function (p, h) {
        if (!p) return;
        var sg = h ? -1 : 1,
          across = g.k === "tear";
        GW.lerpVectors(from, GP, e);
        if (across) {
          var off = (0.05 + gap) * s * 0.5;
          GW.x += Math.cos(self.yaw) * sg * off;
          GW.z -= Math.sin(self.yaw) * sg * off;
        }
        GW.y += shake * s;
        p.position.copy(GW);
        var yaw = lerp(g.rot0, self.yaw + (across ? Math.PI / 2 : 0), e);
        p.rotation.set(tilt, yaw, across ? sg * gap * 0.9 : 0, "YXZ");
        p.scale.setScalar(g.sc0 * Math.max(0.01, scl));
      });
    }
    if (t >= g.dur) {
      this.grab = null;
      this.grabCd = 0.25;
    }
  };
  Dragon.prototype.doSpin = function () {
    if (this.dead || this.stagger > 0 || this.spinCd > 0 || this.stompT >= 0 || this.dive || this.grab) return;
    this.spinT = 0;
    this.spinCd = 1.1;
    this.spinN = (this.spinN || 0) + 1;
    soundAt(this.pos.x, this.pos.z);
    SFX.spin();
    sfxMul = 1;
  };
  Dragon.prototype.doStomp = function () {
    if (this.dead || this.stagger > 0 || this.stompCd > 0 || this.spinT >= 0 || this.dive || this.grab) return;
    if (this.flying || this.alt > 0.5) {
      this.flying = false;
      this.dive = true;
      this.stompCd = 1.8;
      soundAt(this.pos.x, this.pos.z);
      SFX.roar(false);
      sfxMul = 1;
      return;
    }
    this.stompT = 0;
    this.stompCd = 1.8;
    this.stompN = (this.stompN || 0) + 1;
  };
  Dragon.prototype.toggleFly = function () {
    if (this.dead || this.stagger > 0 || this.dive || this.grab) return;
    if (this.flying) {
      this.flying = false;
      return;
    }
    if (this.alt < 0.3 && this.energy > 0.2 && this.stompT < 0 && this.spinT < 0) {
      this.flying = true;
      this.airborne = true;
      soundAt(this.pos.x, this.pos.z);
      SFX.fly();
      sfxMul = 1;
      if (nearCam(this.pos.x, this.pos.z, 60)) {
        dustBurst(this.pos.x, this.pos.z, 0.8 * this.s, 16);
        shockwave(this.pos.x, this.pos.z, 2.2 * this.s, 0.4);
      }
    }
  };
  Dragon.prototype.dmgScale = function () {
    return Math.pow(this.s, 0.75);
  };
  Dragon.prototype.spinHit = function () {
    var self = this,
      s = this.s,
      R = 2.2 * s,
      x0 = this.pos.x,
      z0 = this.pos.z,
      cy = chest(this, V4.set(0, 0, 0)).y;
    eachNear(x0, z0, R, function (o) {
      if (o.h > self.alt - 0.2 && distToBox(x0, z0, o) < R) damageObj(o, 5, x0, z0, "spin", self);
    });
    enemies.slice().forEach(function (e) {
      if (Math.hypot(e.x - x0, e.z - z0) < R + e.b.r * 0.5 && Math.abs(e.y - cy) < 2.5 * s) hurtEnemy(e, 5, "spin", self);
    });
    dragons.forEach(function (o) {
      if (o !== self && !o.dead && Math.hypot(o.pos.x - x0, o.pos.z - z0) < R + o.s * 0.5 && Math.abs(o.alt - self.alt) < 2 * s) o.hurt(12 * self.pvp * self.dmgScale(), self, "spin", x0, z0);
    });
    knockPeds(x0, z0, R, self);
    if (nearCam(x0, z0, 60)) {
      shockwave(x0, z0, R, 0.35);
      pow("spin", x0, s * 1.2, z0, false, true);
      for (var k = 0; k < 16; k++) {
        var a = k / 16 * 6.283;
        FX_SMOKE.spawn(x0 + Math.cos(a) * R * 0.7, this.alt + 0.3 * s, z0 + Math.sin(a) * R * 0.7, -Math.sin(a) * 6 * s, 0.5, Math.cos(a) * 6 * s, 0.6, 0.6 * s, 1.4 * s, 0.6, 0, COL.dust, COL.dustB, 0, 3);
      }
    }
    if (this.isPlayer) addTrauma(0.15);
  };
  Dragon.prototype.quake = function (R, dmg, shake) {
    var self = this,
      x = this.pos.x,
      z = this.pos.z,
      vis = nearCam(x, z, 60);
    eachNear(x, z, R, function (o) {
      var d = distToBox(x, z, o);
      if (d < R) damageObj(o, dmg * (1 - d / R * 0.6), x, z, "stomp", self);
    });
    enemies.slice().forEach(function (e) {
      if (e.kind !== "heli" && Math.hypot(e.x - x, e.z - z) < R + e.b.r * 0.5) hurtEnemy(e, dmg, "stomp", self);
    });
    dragons.forEach(function (o) {
      if (o !== self && !o.dead && o.alt < 1 && Math.hypot(o.pos.x - x, o.pos.z - z) < R + o.s * 0.4) o.hurt(dmg * 1.6 * self.pvp * self.dmgScale() / Math.pow(o.s, 0.25), self, "stomp", x, z);
    });
    knockPeds(x, z, R, self, 10);
    if (vis) {
      shockwave(x, z, R * 1.1, 0.5);
      dustBurst(x, z, 0.9 * this.s, 20);
      if (R > 2 * this.s) pow("stomp", x, 0.3 * this.s, z, R > 3.5 * this.s, true);
    }
    soundAt(x, z);
    SFX.stomp();
    sfxMul = 1;
    if (vis) addTrauma(this.isPlayer ? shake : shake * 0.3);
    if (this.isPlayer) hitstop(50);
    this.landT = 0.3;
  };
  Dragon.prototype.landing = function () {
    if (this.dive) {
      this.dive = false;
      this.quake(3.8 * this.s, 11, 0.6);
      if (this.isPlayer) slowmo = 0.5;
    } else this.quake(1.5 * this.s, 2, 0.15);
  };
  Dragon.prototype.update = function (dt, rdt) {
    var s = this.s,
      self = this,
      I = this.in;
    this.inv = Math.max(0, this.inv - dt);
    if (this.hitFlash > 0) this.hitFlash = Math.max(0, this.hitFlash - dt);
    this.mat.userData.u.uFlash.value = 0.16 * clamp(this.hitFlash / 0.16, 0, 1);
    if (this.dead) {
      this.deadT += dt;
      this.animDead(dt);
      this.respawnT -= dt;
      if (this.respawnT <= 0 && G_.mode === "play" && worldAuth()) this.respawn();
      return;
    }
    this.root.visible = this.inv > 0 ? Math.sin(now * 30) > -0.3 : true;
    if (this.growT >= 0) {
      this.growT += rdt;
      var gt = clamp(this.growT / 0.9, 0, 1);
      this.s = lerp(this.growFrom, this.sTarget, easeOutBack(gt));
      if (gt >= 1) this.growT = -1;
      s = this.s;
    }
    this.comboT -= dt;
    if (this.comboT <= 0) this.combo = 0;
    this.grabCd -= dt;
    if (this.hitT >= 0) {
      this.hitT += dt;
      if (this.hitT > 0.45) this.hitT = -1;
    }
    this.stagger = Math.max(0, this.stagger - dt);
    var ix = I.x,
      iz = I.z,
      il = Math.hypot(ix, iz);
    if (il > 1) {
      ix /= il;
      iz /= il;
    }
    if (this.fireLock && this.fuel > 0.22) this.fireLock = false;
    var canFire = I.fire && this.fuel > 0 && !this.fireLock && this.stagger <= 0 && this.spinT < 0 && this.stompT < 0 && !this.dive && !this.grab && (G_.mode === "play" || G_.mode === "intro");
    this.fire = damp(this.fire, canFire ? 1 : 0, 14, rdt);
    if (canFire) {
      this.fuel = Math.max(0, this.fuel - dt / 5);
      this.fuelWait = 0.45;
      if (this.fuel <= 0) {
        this.fireLock = true;
        if (this.isPlayer) {
          SFX.click();
          floatText("Out of breath!", this.pos.x, this.alt + 2 * this.s, this.pos.z, "warn");
        }
      }
    } else if (this.fuelWait > 0) this.fuelWait -= dt;else this.fuel = Math.min(1, this.fuel + dt / 4);
    if (this.flying) {
      this.energy -= dt / 7;
      if (this.energy <= 0) {
        this.energy = 0;
        this.flying = false;
      }
    } else if (this.alt < 0.05) this.energy = Math.min(1, this.energy + dt / 3.5);
    var tAlt = this.flying ? 1.7 * s + 0.8 : 0;
    if (this.dive) this.alt = Math.max(0, this.alt - dt * (6 + 10 * s));else this.alt = damp(this.alt, tAlt, this.flying ? 2.6 : 4.5, dt);
    if (this.alt > 0.3) this.airborne = true;
    if (this.airborne && !this.flying && this.alt < 0.06) {
      this.airborne = false;
      this.alt = 0;
      this.landing();
    }
    this.fb = damp(this.fb, (this.flying || this.alt > 0.35 * s) && !this.dive ? 1 : 0, 5, dt);
    var busy = this.stompT >= 0 && this.stompT < 0.15;
    var baseSp = (4.2 + 0.4 * this.lvl) * Math.pow(s, 0.8);
    var maxSp = baseSp * (1 - 0.5 * this.fire) * (busy ? 0.1 : 1) * (1 + 0.6 * this.fb) * (this.dive ? 0.3 : 1) * (this.grab ? 0.3 : 1) * (this.stagger > 0 ? 0.15 : 1);
    var acc = this.fb > 0.5 ? 4 : 9;
    this.vel.x = damp(this.vel.x, ix * maxSp, acc, dt);
    this.vel.z = damp(this.vel.z, iz * maxSp, acc, dt);
    var sp = Math.hypot(this.vel.x, this.vel.z),
      prevYaw = this.yaw;
    if (il > 0.15 && !this.grab) {
      var ty = Math.atan2(ix, iz),
        dy = Math.atan2(Math.sin(ty - this.yaw), Math.cos(ty - this.yaw));
      this.yaw += dy * (1 - Math.exp(-(this.fire > 0.5 ? 5 : this.fb > 0.5 ? 6 : 12) * dt));
    }
    if (I.face !== undefined && this.fire > 0.3) {
      var dyf = Math.atan2(Math.sin(I.face - this.yaw), Math.cos(I.face - this.yaw));
      this.yaw += dyf * (1 - Math.exp(-6 * dt));
    }
    var yawRate = dt > 0 ? (this.yaw - prevYaw) / dt : 0;
    this.roll = damp(this.roll, clamp(-yawRate * 0.35, -0.55, 0.55) * this.fb, 6, dt);
    this.pos.x = clamp(this.pos.x + (this.vel.x + this.kb.x) * dt, -MAP, MAP);
    this.pos.z = clamp(this.pos.z + (this.vel.z + this.kb.z) * dt, -MAP, MAP);
    this.kb.multiplyScalar(Math.exp(-5 * dt));
    var r = 0.62 * s,
      bumped = false;
    for (var pass = 0; pass < 2; pass++) {
      eachNear(this.pos.x, this.pos.z, r + 7, function (o) {
        if (o.state === 1 || o.h < self.alt + 0.15 * s || o.h < 0.3 * s) return;
        var c = circleBox(self.pos.x, self.pos.z, r, o);
        if (!c) return;
        if (pass === 0 && self.canGrab(o) && (sp > 0.5 || o.mv)) {
          self.startGrab(o);
          return;
        }
        self.pos.x += c.nx * c.pen;
        self.pos.z += c.nz * c.pen;
        bumped = true;
      });
    }
    this.bump = bumped ? this.bump + dt : 0;
    dragons.forEach(function (o) {
      if (o === self || o.dead) return;
      var dx = self.pos.x - o.pos.x,
        dz = self.pos.z - o.pos.z,
        d = Math.hypot(dx, dz),
        m = r + 0.62 * o.s;
      if (d < m && d > 1e-3 && Math.abs(self.alt - o.alt) < Math.max(s, o.s)) {
        var push = (m - d) * (o.s / (s + o.s));
        self.pos.x += dx / d * push;
        self.pos.z += dz / d * push;
      }
    });
    var chestV = chest(this, V4.set(0, 0, 0)).clone();
    enemies.forEach(function (e) {
      if (e.kind === "heli" && e.alive && !e.dying && !e.wreck && V2.set(e.x, e.y, e.z).distanceTo(chestV) < 1.3 * s + 2) hurtEnemy(e, 99, "ram", self);
    });
    var spinYaw = 0;
    if (this.spinT >= 0) {
      var prev = this.spinT;
      this.spinT += dt;
      var D = 0.5;
      spinYaw = Math.PI * 2 * (1 - Math.pow(1 - clamp(this.spinT / D, 0, 1), 2));
      if (prev < 0.12 && this.spinT >= 0.12) this.spinHit();
      if (this.spinT >= D) this.spinT = -1;
    }
    this.spinCd = Math.max(0, this.spinCd - dt);
    this.jumpY = 0;
    if (this.stompT >= 0) {
      var p0 = this.stompT;
      this.stompT += dt;
      var up0 = 0.14,
        air = 0.38;
      if (this.stompT > up0 && this.stompT < up0 + air) this.jumpY = Math.sin((this.stompT - up0) / air * Math.PI) * 0.9 * s;
      if (p0 < up0 && this.stompT >= up0) {
        soundAt(this.pos.x, this.pos.z);
        SFX.roar(false);
        sfxMul = 1;
      }
      if (p0 < up0 + air && this.stompT >= up0 + air) this.quake(3.2 * s, 8, 0.35 + 0.05 * s);
      if (this.stompT > up0 + air + 0.25) this.stompT = -1;
    }
    this.stompCd = Math.max(0, this.stompCd - dt);
    if (this.roarT >= 0) {
      this.roarT += rdt;
      if (this.roarT > 1.3) this.roarT = -1;
    }
    if (this.landT > 0) this.landT -= dt;
    if (this.fire > 0.3) this.breathe(dt);
    if (this.isPlayer && AU.fireGain) AU.fireGain.gain.setTargetAtTime(this.fire * 0.55, AU.ctx.currentTime, 0.05);
    this.updateGrab(dt);
    this.poseAnim(dt, rdt, sp, baseSp, spinYaw);
    if (G_.mode === "play" && worldAuth() && now - this.lastHurt > 4) this.hp = Math.min(this.maxHp(), this.hp + this.maxHp() * 0.03 * dt);
  };
  Dragon.prototype.poseAnim = function (dt, rdt, sp, baseSp, spinYaw) {
    var s = this.s;
    var moveN = clamp(sp / Math.max(0.01, baseSp), 0, 1);
    this.moveBlend = damp(this.moveBlend, moveN > 0.08 ? moveN : 0, 10, dt);
    this.phase += dt * (1.2 + 1.3 * this.moveBlend) * Math.PI * 2;
    var wf = lerp(0.5 + 1.1 * this.moveBlend, 2.1, this.fb) + (this.spinT >= 0 ? 2 : 0) + (this.roarT >= 0 ? 1.5 : 0);
    var prevW = this.wingPh;
    this.wingPh += dt * wf * Math.PI * 2;
    var vis = nearCam(this.pos.x, this.pos.z, 70);
    if (this.fb > 0.5 && Math.floor(prevW / 6.283) !== Math.floor(this.wingPh / 6.283)) {
      soundAt(this.pos.x, this.pos.z);
      SFX.flap();
      sfxMul = 1;
      if (vis && this.alt < 3 * s) dustBurst(this.pos.x, this.pos.z, 0.5 * s, 4);
    }
    var stp = Math.sin(this.phase);
    if (this.moveBlend > 0.3 && this.fb < 0.3 && Math.sign(stp) !== this.lastStepSign) {
      this.lastStepSign = Math.sign(stp);
      if (s > 1.5) {
        if (this.isPlayer) addTrauma(0.03 * (s - 1));
        soundAt(this.pos.x, this.pos.z);
        SFX.step(s);
        sfxMul = 1;
        if (vis) dustBurst(this.pos.x, this.pos.z, 0.3 * s, 3);
      }
    }
    if (vis || this.isPlayer) this.animate(dt);
    this.gy = damp(this.gy, groundAt(this.pos.x, this.pos.z), 12, dt);
    this.root.position.set(this.pos.x, this.alt + this.jumpY + this.gy, this.pos.z);
    this.root.rotation.set(this.fb * (0.12 + 0.28 * this.moveBlend) + (this.dive ? 0.35 : 0), this.yaw + spinYaw, this.roll);
    var sq = 1;
    if (this.landT > 0) sq = 1 - 0.18 * Math.sin(clamp(1 - this.landT / 0.3, 0, 1) * Math.PI);
    if (this.stompT >= 0 && this.stompT < 0.14) sq = 1 - 0.12 * Math.sin(this.stompT / 0.14 * Math.PI * 0.5);
    var w = s * (1 + (1 - sq) * 0.5);
    this.root.scale.set(w, s * sq, w);
    this.flinch = Math.max(0, this.flinch - dt * 4);
  };
  Dragon.prototype.breathe = function (dt) {
    this.breatheFX(dt);
    this.breathHit(dt);
  };
  Dragon.prototype.breatheFX = function (dt) {
    var s = this.s;
    this.mouth.getWorldPosition(V1);
    var fx = Math.sin(this.yaw),
      fz = Math.cos(this.yaw),
      range = 3.6 * s + this.alt * 0.8,
      vis = nearCam(this.pos.x, this.pos.z, 70);
    V3.set(this.pos.x + fx * range, this.root.position.y + (this.alt > 0.5 ? -0.2 * s : 0.4 * s), this.pos.z + fz * range).sub(V1).normalize();
    if (vis) {
      var spd = range / 0.42,
        fc = this.fireCol;
      for (var f = 0; f < (this.isPlayer ? 5 : 3); f++) {
        var jx = rand(-0.18, 0.18),
          jy = rand(-0.1, 0.1),
          jz = rand(-0.18, 0.18);
        FX_ADD.spawn(V1.x, V1.y, V1.z, (V3.x + jx) * spd * rand(0.8, 1.1), (V3.y + jy) * spd * rand(0.8, 1.1), (V3.z + jz) * spd * rand(0.8, 1.1), rand(0.38, 0.55), 0.3 * s, 2.1 * s, 1, 0, fc[0], Math.random() < 0.5 ? fc[1] : fc[2], -1.5 * s, 1.2);
      }
      if (Math.random() < 0.5) FX_SMOKE.spawn(V1.x + V3.x * range * 0.8, Math.max(0.3, V1.y * 0.6), V1.z + V3.z * range * 0.8, rand(-1, 1), rand(1, 3) * s * 0.5, rand(-1, 1), rand(0.8, 1.4), 0.6 * s, 2.2 * s, 0.35, 0, COL.smokeA, COL.smokeB, -1, 1);
    }
  };
  Dragon.prototype.breathHit = function (dt) {
    var self = this,
      s = this.s;
    this.mouth.getWorldPosition(V1);
    var fx = Math.sin(this.yaw),
      fz = Math.cos(this.yaw),
      range = 3.6 * s + this.alt * 0.8;
    var cx = this.pos.x,
      cz = this.pos.z,
      amt = 7 * dt * this.fire;
    eachNear(cx + fx * range * 0.5, cz + fz * range * 0.5, range * 0.7 + 6, function (o) {
      if (o.state === 1) return;
      var dx = o.x - cx,
        dz = o.z - cz,
        dl = Math.hypot(dx, dz),
        d = dl - Math.max(o.hw, o.hd) * 0.7;
      if (d > range * 1.15) return;
      var dot = (dx * fx + dz * fz) / (dl || 1);
      if (dot > 0.78 || d < s * 0.8 && dot > 0.2) damageObj(o, amt, cx, cz, "fire", self);
    });
    enemies.slice().forEach(function (e) {
      var dx = e.x - cx,
        dz = e.z - cz,
        dl = Math.hypot(dx, dz) || 1;
      if (dl > range * 1.4 + e.b.r) return;
      var dot = (dx * fx + dz * fz) / dl,
        vy = e.kind === "heli" ? Math.abs(e.y - V1.y) < 3 * s + 3 : true;
      if (dot > 0.7 && vy) hurtEnemy(e, amt, "fire", self);
    });
    dragons.forEach(function (o) {
      if (o === self || o.dead) return;
      var dx = o.pos.x - cx,
        dz = o.pos.z - cz,
        dl = Math.hypot(dx, dz) || 1;
      if (dl > range * 1.2 + o.s * 0.5 || Math.abs(o.alt - self.alt) > 2.5 * s) return;
      if ((dx * fx + dz * fz) / dl > 0.72) o.hurt(11 * dt * self.fire * self.pvp * self.dmgScale(), self, "fire", cx, cz);
    });
    for (var i = 0; i < peds.length; i++) {
      var p = peds[i];
      if (p.st >= 3) continue;
      var dx2 = p.x - cx,
        dz2 = p.z - cz,
        dl2 = Math.hypot(dx2, dz2);
      if (dl2 < range && (dx2 * fx + dz2 * fz) / (dl2 || 1) > 0.8) knockPeds(p.x, p.z, 0.5, this, 6);
    }
    if (this.isPlayer) addTrauma(0.012);
  };
  var NET_DELAY = 0.12;
  Dragon.prototype.updateRemote = function (dt, rdt) {
    var B = false[this.k],
      s = this.s;
    this.inv = Math.max(0, this.inv - dt);
    if (this.hitFlash > 0) this.hitFlash = Math.max(0, this.hitFlash - dt);
    this.mat.userData.u.uFlash.value = 0.16 * clamp(this.hitFlash / 0.16, 0, 1);
    if (this.dead) {
      this.deadT += dt;
      this.animDead(dt);
      if (worldAuth()) {
        this.respawnT -= dt;
        if (this.respawnT <= 0 && G_.mode === "play") this.respawn();
      }
      return;
    }
    this.root.visible = this.inv > 0 ? Math.sin(now * 30) > -0.3 : true;
    if (this.growT >= 0) {
      this.growT += rdt;
      var gt = clamp(this.growT / 0.9, 0, 1);
      this.s = lerp(this.growFrom, this.sTarget, easeOutBack(gt));
      if (gt >= 1) this.growT = -1;
      s = this.s;
    }
    var px = this.pos.x,
      pz = this.pos.z,
      pyaw = this.yaw;
    if (B && B.length) {
      var tgt = performance.now() - NET_DELAY * 1000;
      while (B.length > 2 && B[1].r <= tgt) B.shift();
      var a = B[0],
        b = B.length > 1 ? B[1] : B[0];
      var kf = b.r > a.r ? clamp((tgt - a.r) / (b.r - a.r), 0, 1) : 0;
      this.pos.x = lerp(a.x, b.x, kf);
      this.pos.z = lerp(a.z, b.z, kf);
      this.alt = lerp(a.y, b.y, kf);
      this.yaw = a.a + Math.atan2(Math.sin(b.a - a.a), Math.cos(b.a - a.a)) * kf;
      this.flying = !!(b.f & 1);
      this.dive = !!(b.f & 2);
      this.fireOn = !!(b.f & 4);
      if (b.sn !== this.lastSn) {
        this.lastSn = b.sn;
        if (this.spinT < 0) {
          this.spinT = 0;
          soundAt(this.pos.x, this.pos.z);
          SFX.spin();
          sfxMul = 1;
        }
      }
      if (b.tn !== this.lastTn) {
        this.lastTn = b.tn;
        if (this.stompT < 0) this.stompT = 0;
      }
    }
    var vx = dt > 0 ? (this.pos.x - px) / dt : 0,
      vz = dt > 0 ? (this.pos.z - pz) / dt : 0;
    this.vel.set(vx, 0, vz);
    var sp = Math.hypot(vx, vz),
      baseSp = (4.2 + 0.4 * this.lvl) * Math.pow(s, 0.8);
    var yawRate = dt > 0 ? Math.atan2(Math.sin(this.yaw - pyaw), Math.cos(this.yaw - pyaw)) / dt : 0;
    this.roll = damp(this.roll, clamp(-yawRate * 0.35, -0.55, 0.55) * this.fb, 6, dt);
    this.fire = damp(this.fire, this.fireOn ? 1 : 0, 14, rdt);
    if (worldAuth()) {
      if (this.fire > 0.3) {
        this.fuel = Math.max(0, this.fuel - dt / 5);
        this.fuelWait = 0.45;
      } else if (this.fuelWait > 0) this.fuelWait -= dt;else this.fuel = Math.min(1, this.fuel + dt / 4);
      if (this.fuel <= 0) this.fire = 0;
    }
    if (this.fire > 0.3) {
      this.breatheFX(dt);
      this.breathHit(dt);
    }
    this.fb = damp(this.fb, (this.flying || this.alt > 0.35 * s) && !this.dive ? 1 : 0, 5, dt);
    if (this.alt > 0.3) this.airborne = true;
    if (this.airborne && !this.flying && this.alt < 0.12) {
      this.airborne = false;
      this.landing();
    }
    var spinYaw = 0;
    if (this.spinT >= 0) {
      var prev = this.spinT;
      this.spinT += dt;
      spinYaw = Math.PI * 2 * (1 - Math.pow(1 - clamp(this.spinT / 0.5, 0, 1), 2));
      if (prev < 0.12 && this.spinT >= 0.12) this.spinHit();
      if (this.spinT >= 0.5) this.spinT = -1;
    }
    this.jumpY = 0;
    if (this.stompT >= 0) {
      var p0 = this.stompT,
        up0 = 0.14,
        air = 0.38;
      this.stompT += dt;
      if (this.stompT > up0 && this.stompT < up0 + air) this.jumpY = Math.sin((this.stompT - up0) / air * Math.PI) * 0.9 * s;
      if (p0 < up0 && this.stompT >= up0) {
        soundAt(this.pos.x, this.pos.z);
        SFX.roar(false);
        sfxMul = 1;
      }
      if (p0 < up0 + air && this.stompT >= up0 + air) this.quake(3.2 * s, 8, 0.35 + 0.05 * s);
      if (this.stompT > up0 + air + 0.25) this.stompT = -1;
    }
    this.spinCd = Math.max(0, this.spinCd - dt);
    this.stompCd = Math.max(0, this.stompCd - dt);
    if (this.roarT >= 0) {
      this.roarT += rdt;
      if (this.roarT > 1.3) this.roarT = -1;
    }
    if (this.landT > 0) this.landT -= dt;
    this.comboT -= dt;
    if (this.comboT <= 0) this.combo = 0;
    if (this.hitT >= 0) {
      this.hitT += dt;
      if (this.hitT > 0.45) this.hitT = -1;
    }
    this.stagger = Math.max(0, this.stagger - dt);
    this.updateGrab(dt);
    this.poseAnim(dt, rdt, sp, baseSp, spinYaw);
  };
  Dragon.prototype.animDead = function (dt) {
    var t = this.deadT,
      s = this.s,
      R = this.rig;
    var wob = t < 0.7 ? Math.sin(t * 14) * 0.18 * (1 - t / 0.7) : 0;
    var k = clamp((t - 0.55) / 0.45, 0, 1),
      fall = k * k;
    var bounce = t > 1.0 && t < 1.35 ? Math.sin((t - 1.0) / 0.35 * Math.PI) * 0.12 : 0;
    this.root.rotation.set(0, this.yaw + (t < 0.7 ? Math.sin(t * 9) * 0.3 : 0.3), wob + fall * 1.45 * this.hitDir - bounce * this.hitDir);
    var sink = Math.max(0, t - 2.4) * 0.7 * s;
    this.alt = Math.max(0, this.alt - dt * 6);
    this.root.position.set(this.pos.x, this.alt + bounce * s * 0.5 - sink + this.gy, this.pos.z);
    if (t > 3.1) this.root.visible = false;
    var showStars = t < 2.3 && this.root.visible;
    this.stars.forEach(function (m, i) {
      m.visible = showStars;
      if (!showStars) return;
      var a = t * 7 + i * 2.094,
        hy = this.alt + (t < 0.7 ? 2.1 : 2.1 - fall * 1.5) * s;
      m.position.set(this.pos.x + Math.cos(a) * 0.55 * s, hy + Math.sin(a * 2) * 0.08 * s, this.pos.z + Math.sin(a) * 0.55 * s);
      m.scale.setScalar(0.22 * s);
    }, this);
    if (t > 1.0 && t - dt <= 1.0 && nearCam(this.pos.x, this.pos.z, 60)) {
      dustBurst(this.pos.x, this.pos.z, 1.2 * s, 18);
      soundAt(this.pos.x, this.pos.z);
      SFX.step(s + 2);
      sfxMul = 1;
      if (this.isPlayer) addTrauma(0.3);
    }
    if (Math.random() < 0.3 && t > 1 && t < 3 && nearCam(this.pos.x, this.pos.z, 60)) FX_SMOKE.spawn(this.pos.x, s * 0.5, this.pos.z, rand(-0.5, 0.5), 1.5, rand(-0.5, 0.5), 1.5, s * 0.5, s * 1.5, 0.6, 0, COL.smokeA, COL.smokeB, -0.5, 0.5);
    R.rot(BN.skull, -0.6, 0, 0);
    R.rot(BN.neck, -0.35 + wob, 0, 0);
    R.rot(BN.head, 0, wob * 2, 0);
    R.rot(BN.armR[1], 0, 0, -0.9);
    R.rot(BN.armL[1], 0, 0, 0.9);
    R.rot(BN.wingR[0], 0, 0, 0.5);
    R.rot(BN.wingL[0], 0, 0, -0.5);
    for (var i = 0; i < BN.tail.length; i++) R.rot(BN.tail[i], 0.05, Math.sin(t * 3 - i) * 0.1 * (1 - k), 0);
    R.apply();
  };
  Dragon.prototype.animate = function (dt) {
    var R = this.rig,
      t = now,
      fb = this.fb,
      mb = this.moveBlend * (1 - fb),
      ph = this.phase;
    var fire = this.fire,
      spin = this.spinT >= 0 ? Math.sin(clamp(this.spinT / 0.5, 0, 1) * Math.PI) : 0;
    var roar = this.roarT >= 0 ? Math.sin(clamp(this.roarT / 1.3, 0, 1) * Math.PI) : 0;
    var st = this.stompT,
      crouch = 0,
      tuck = 0,
      land = this.landT > 0 ? Math.sin(clamp(1 - this.landT / 0.3, 0, 1) * Math.PI) : 0;
    if (st >= 0) {
      if (st < 0.14) crouch = Math.sin(st / 0.14 * Math.PI * 0.5);else if (st < 0.52) {
        tuck = Math.sin((st - 0.14) / 0.38 * Math.PI);
        crouch = Math.max(0, 1 - (st - 0.14) / 0.08);
      }
    }
    if (this.dive) tuck = Math.max(tuck, 0.8);
    var up = 0,
      eat = 0,
      strain = 0,
      wind = 0,
      g = this.grab;
    if (g) {
      var lt = clamp(g.t / (g.lift * 0.9), 0, 1),
        out = g.t > g.dur - 0.18 ? clamp((g.dur - g.t) / 0.18, 0, 1) : 1;
      if (g.k === "eat") {
        eat = lt * out;
        if (g.t > 0.55) eat *= 0.6;
      } else if (g.k === "tear") {
        eat = lt * out * 0.8;
        if (g.t > g.lift && g.t < g.rip) strain = 1;else if (g.t >= g.rip) strain = -out;
      } else {
        up = lt * out;
        wind = g.t < 0.45 ? clamp((g.t - 0.22) / 0.2, 0, 1) : -clamp((g.t - 0.45) / 0.1, 0, 1) * out;
      }
    }
    var tearOpen = strain < 0 ? -strain : 0;
    strain = Math.max(0, strain);
    var breathe = Math.sin(t * 2.2),
      jit = (fire * 0.02 + roar * 0.03 + strain * 0.03) * Math.sin(t * 55),
      wingPh = this.wingPh;
    this.model.position.y = (1 - Math.cos(ph * 2)) * 0.5 * 0.05 * mb + fb * Math.sin(wingPh) * 0.06;
    R.rot(BN.hips, 0, Math.sin(ph) * 0.12 * mb, Math.sin(ph) * 0.07 * mb);
    [[BN.legR, 0, 1], [BN.legL, Math.PI, -1]].forEach(function (L) {
      var p = ph + L[1],
        sgn = L[2],
        swing = -Math.sin(p) * 0.6 * mb,
        lift = Math.max(0, Math.cos(p)) * mb,
        dangle = Math.sin(t * 3 + L[1]) * 0.08 * fb;
      R.rot(L[0][0], swing - lift * 0.25 - crouch * 0.5 - tuck * 0.7 - land * 0.4 + fb * 0.75 + dangle - strain * 0.15, 0, sgn * (0.04 * mb + strain * 0.12));
      R.rot(L[0][1], lift * 0.9 + crouch * 0.9 + tuck * 1.2 + land * 0.7 + fb * 0.5 + strain * 0.3, 0, 0);
      R.rot(L[0][2], -lift * 0.4 - crouch * 0.4 - tuck * 0.4 - land * 0.3 - swing * 0.3 + fb * 0.35 - strain * 0.15, 0, 0);
    });
    var hr = this.hitT >= 0 ? Math.sin(clamp(this.hitT / 0.45, 0, 1) * Math.PI) * (1 - this.hitT / 0.45 * 0.5) : 0,
      hd = this.hitDir;
    if (this.stagger > 0) hr = Math.max(hr, 0.5 + Math.sin(t * 20) * 0.1);
    var lean = -0.35 * hr * hd + 0.1 * mb + 0.12 * fire - 0.25 * roar + 0.25 * crouch - 0.1 * tuck + 0.25 * land - 0.2 * this.flinch + 0.12 * fb - 0.15 * up - 0.2 * wind + 0.15 * eat;
    R.rot(BN.spine[1], lean * 0.5 + breathe * 0.02, -Math.sin(ph) * 0.1 * mb, -Math.sin(ph) * 0.05 * mb);
    R.rot(BN.spine[2], lean * 0.5 + breathe * 0.025 + jit - fb * Math.sin(wingPh) * 0.05, 0, 0);
    R.rot(BN.neck, -0.45 * hr * hd + 0.18 * fire - 0.25 * roar + Math.sin(ph * 2) * 0.04 * mb - 0.22 * fb * this.moveBlend - 0.2 * up + 0.2 * eat, Math.sin(t * 0.7) * 0.12 * (1 - this.moveBlend) * (1 - fire), 0);
    R.rot(BN.head, 0.12 * fire - 0.35 * roar - breathe * 0.03 + 0.1 * crouch - 0.12 * fb * this.moveBlend - 0.15 * up + 0.1 * eat, 0, Math.sin(t * 0.9) * 0.05 * (1 - this.moveBlend));
    R.rot(BN.skull, -0.5 * hr - 0.42 * fire - 0.55 * roar - 0.25 * spin + jit - 0.45 * eat - 0.2 * strain, 0, 0);
    [[BN.armR, 1, 0], [BN.armL, -1, Math.PI]].forEach(function (A) {
      var sgn = A[1],
        p = ph + A[2];
      var lower = 0.8 + (BN.armDrop || 0) - 0.9 * hr - 0.55 * fire - 1.1 * roar - 0.9 * spin - 0.5 * tuck + breathe * 0.03 - 0.2 * fb - 1.9 * up - 0.5 * eat + 0.25 * strain;
      R.rot(A[0][1], Math.sin(p) * 0.55 * mb - 0.3 * fire - 0.35 * fb - 0.35 * up - 1.1 * eat + 0.6 * wind, 0, sgn * lower);
      R.rot(A[0][2], 0, sgn * (0.5 + 0.3 * mb + 0.3 * fire + 0.5 * fb + 0.4 * up + 0.9 * eat - 0.5 * strain - 1.2 * tearOpen), 0);
    });
    var flap = Math.sin(wingPh),
      wAmp = lerp(0.12 + 0.2 * mb + 0.35 * tuck + 0.3 * roar + 0.2 * spin + 0.2 * strain, 0.85, fb);
    [[BN.wingR, 1], [BN.wingL, -1]].forEach(function (W) {
      var sgn = W[1],
        spread = 0.6 * hr + 0.25 * roar + 0.15 * fire + 0.25 * fb + 0.2 * strain;
      R.rot(W[0][0], 0, sgn * (-0.15 + spread * 0.5 - 0.15 * fb), sgn * (flap * wAmp - spread));
      R.rot(W[0][1], 0, 0, sgn * (Math.sin(wingPh - 0.9) * wAmp * 0.6));
      R.rot(W[0][2], 0, 0, sgn * (Math.sin(wingPh - 1.6) * wAmp * 0.4 * fb));
    });
    var tailAmp = 0.14 + 0.16 * mb + 0.1 * fire - 0.06 * fb;
    for (var i = 0; i < BN.tail.length; i++) {
      var y = Math.sin((mb > 0.2 ? ph : t * (1.6 + fb * 1.4)) - i * 0.55) * tailAmp * (0.4 + i / 6);
      var x = -0.15 * spin * (i < 3 ? 1 : 0.2) + 0.05 * Math.sin(t * 1.3 - i * 0.4) - 0.12 * land + fb * (i < 2 ? 0.2 : -0.05) + fb * Math.sin(wingPh - i * 0.5) * 0.05;
      var tf = BN.tailFix;
      R.rot(BN.tail[i], x - 0.2 * hr + (tf ? tf[0] : 0), y + Math.sin(t * 30 - i) * 0.25 * hr + spin * 0.15 - this.roll * 0.25 * fb + (tf ? tf[1] : 0), 0);
    }
    R.apply();
  };
  function Brain(d) {
    this.d = d;
    this.think = rand(0.2, 1);
    this.aggr = rand(0.25, 0.9);
    this.skill = rand(0.45, 0.95);
    this.flyLove = rand(0.2, 0.9);
    this.mode = "farm";
    this.obj = null;
    this.foe = null;
    this.enemy = null;
    this.goal = new THREE.Vector3();
    this.side = 0;
    this.sideT = 0;
    this.idle = 0;
    this.wob = rand(0, 6);
    this.fireHold = 0;
  }
  Brain.prototype.pickFarm = function () {
    var d = this.d,
      tier = LV[d.lvl].tier,
      best = null,
      bs = -1,
      R = 24 + 5 * d.s;
    eachNear(d.pos.x, d.pos.z, R, function (o) {
      if (o.state || o.T.tier > tier || o.mv) return;
      var dist = Math.hypot(o.x - d.pos.x, o.z - d.pos.z),
        sc = o.T.val / (dist + 6) * (o.T.tier === tier ? 1.4 : 1) * rand(0.8, 1.2);
      if (sc > bs) {
        bs = sc;
        best = o;
      }
    }, false);
    if (!best) {
      for (var i = 0; i < 40; i++) {
        var o = pick(objects);
        if (o.alive && !o.state && !o.mv && o.T.tier <= tier) {
          best = o;
          break;
        }
      }
    }
    return best;
  };
  Brain.prototype.decide = function () {
    var d = this.d,
      hp = d.hp / d.maxHp(),
      self = this;
    this.think = rand(0.35, 0.8) * (1.5 - this.skill * 0.7);
    if (Math.random() < 0.04) {
      this.idle = rand(0.4, 1.1);
      return;
    }
    var threat = null;
    dragons.forEach(function (o) {
      if (o !== d && !o.dead && o.s > d.s * 1.3 && Math.hypot(o.pos.x - d.pos.x, o.pos.z - d.pos.z) < 12 + 4 * o.s) threat = o;
    });
    if (threat && hp < 0.45) {
      this.mode = "flee";
      var dx = d.pos.x - threat.pos.x,
        dz = d.pos.z - threat.pos.z,
        l = Math.hypot(dx, dz) || 1;
      this.goal.set(clamp(d.pos.x + dx / l * 35, -MAP, MAP), 0, clamp(d.pos.z + dz / l * 35, -MAP, MAP));
      if (!d.flying && d.energy > 0.4 && Math.random() < 0.6) d.toggleFly();
      return;
    }
    var foe = null,
      fd = 1e9;
    dragons.forEach(function (o) {
      if (o === d || o.dead) return;
      var dist = Math.hypot(o.pos.x - d.pos.x, o.pos.z - d.pos.z),
        grudge = d.lastBy === o && now - d.lastByT < 4;
      if (dist < 10 + 3 * d.s && (grudge || o.s <= d.s * 1.15 && Math.random() < self.aggr * 0.6) && dist < fd) {
        fd = dist;
        foe = o;
      }
    });
    if (foe && hp > 0.3) {
      this.mode = "fight";
      this.foe = foe;
      return;
    }
    var en = null,
      ed = 18 + 2 * d.s;
    enemies.forEach(function (e) {
      if (e.alive && !e.dying && !e.wreck && e.target === d) {
        var dist = Math.hypot(e.x - d.pos.x, e.z - d.pos.z);
        if (dist < ed) {
          ed = dist;
          en = e;
        }
      }
    });
    if (en && (this.huntT || 0) >= 0 && Math.random() < 0.55 + this.aggr * 0.3) {
      if (this.mode !== "hunt") this.huntT = 0;
      this.mode = "hunt";
      this.enemy = en;
      return;
    }
    if (this.mode !== "farm" || !this.obj || !this.obj.alive || this.obj.state) {
      this.obj = this.pickFarm();
    }
    this.mode = "farm";
  };
  Brain.prototype.update = function (dt) {
    var d = this.d,
      I = d.in;
    I.x = 0;
    I.z = 0;
    I.fire = false;
    I.face = undefined;
    if (d.dead || G_.mode !== "play") return;
    if (this.huntT < 0) this.huntT += dt;
    this.think -= dt;
    if (this.think <= 0) this.decide();
    if (this.idle > 0) {
      this.idle -= dt;
      return;
    }
    var tx = this.goal.x,
      tz = this.goal.z,
      stopAt = 0,
      attack = false,
      faceX = null,
      faceZ = null,
      s = d.s;
    if (this.mode === "farm" && this.obj) {
      var o = this.obj;
      if (!o.alive || o.state) {
        this.obj = null;
        this.think = Math.min(this.think, 0.15);
      } else {
        tx = o.x;
        tz = o.z;
        var edge = distToBox(d.pos.x, d.pos.z, o);
        stopAt = 2.2 * s;
        if (edge < 3.3 * s) {
          attack = true;
          faceX = o.x;
          faceZ = o.z;
          if (edge < 1.6 * s) stopAt = 99;
        }
        if (edge < 3 * s && d.stompCd <= 0 && o.T.big && Math.random() < dt * 0.5) d.doStomp();
      }
    } else if (this.mode === "fight" && this.foe) {
      var f = this.foe;
      if (f.dead) {
        this.mode = "farm";
        this.think = 0;
      } else {
        tx = f.pos.x;
        tz = f.pos.z;
        var fdist = Math.hypot(tx - d.pos.x, tz - d.pos.z);
        stopAt = 2.0 * s + 0.4 * f.s;
        faceX = tx;
        faceZ = tz;
        if (fdist < 3.4 * s + f.s) attack = true;
        if (fdist < 2.2 * s + 0.6 * f.s && d.spinCd <= 0 && Math.random() < dt * 2 * this.skill) d.doSpin();
        if (fdist < 3 * s && d.stompCd <= 0 && Math.random() < dt * 0.8 * this.skill) d.doStomp();
        if (fdist > 26 + 3 * s) {
          this.mode = "farm";
          this.think = 0;
        }
      }
    } else if (this.mode === "hunt" && this.enemy) {
      var e = this.enemy;
      this.huntT = (this.huntT || 0) + dt;
      if (!e.alive || e.dying || e.wreck || this.huntT > 7) {
        this.mode = "farm";
        this.obj = null;
        this.think = 0;
        this.huntT = -5;
      } else {
        tx = e.x;
        tz = e.z;
        stopAt = 2.4 * s + e.b.r;
        faceX = tx;
        faceZ = tz;
        if (Math.hypot(tx - d.pos.x, tz - d.pos.z) < 3.8 * s + e.b.r) attack = true;
      }
    } else if (this.mode === "flee") {
      if (Math.hypot(tx - d.pos.x, tz - d.pos.z) < 4) {
        this.mode = "farm";
        this.think = 0;
      }
    }
    var dx = tx - d.pos.x,
      dz = tz - d.pos.z,
      dist = Math.hypot(dx, dz);
    if (!d.flying && dist > 42 && d.energy > 0.85 && Math.random() < dt * this.flyLove) d.toggleFly();
    if (d.flying && (dist < 8 + s || attack && this.mode === "farm")) d.toggleFly();
    if (d.bump > 0.5 && this.sideT <= 0) {
      this.side = Math.random() < 0.5 ? 1 : -1;
      this.sideT = rand(0.8, 1.4);
      if (d.energy > 0.6 && Math.random() < 0.3) d.toggleFly();
    }
    if (dist > stopAt && dist > 0.01) {
      var mx = dx / dist,
        mz = dz / dist,
        w = Math.sin(now * 0.9 + this.wob) * 0.22;
      var c = Math.cos(w),
        sn = Math.sin(w);
      var rx = mx * c - mz * sn,
        rz = mx * sn + mz * c;
      mx = rx;
      mz = rz;
      if (this.sideT > 0) {
        this.sideT -= dt;
        mx += -dz / dist * this.side * 1.2;
        mz += dx / dist * this.side * 1.2;
      }
      var k = clamp((dist - stopAt) / 3, 0.35, 1);
      I.x = mx * k;
      I.z = mz * k;
    } else if (this.sideT > 0) this.sideT -= dt;
    if (attack) {
      this.fireHold = 0.35 + this.skill * 0.3;
      if (faceX !== null) I.face = Math.atan2(faceX - d.pos.x, faceZ - d.pos.z);
      if (dist <= stopAt + 0.5) {
        var fy = I.face;
        I.x += Math.sin(fy) * 0.12;
        I.z += Math.cos(fy) * 0.12;
      }
    }
    if (this.fireHold > 0) {
      this.fireHold -= dt;
      I.fire = true;
    }
    if (Math.random() < dt * 0.03) d.doSpin();
  };
  var G_ = {
    mode: "menu",
    stage: 0,
    time: 150,
    destroyedVal: 0,
    spT: {
      police: 10,
      tank: 4,
      heli: 4
    },
    told: {},
    tooBigT: 0,
    fireHeld: false
  };
  var selStage = 0,
    cityStage = -1,
    cityDirty = true,
    ready = false;
  var timeScale = 1,
    hitstopUntil = 0,
    slowmo = 1,
    trauma = 0;
  function addTrauma(v) {
    trauma = Math.min(1, trauma + v / (1 + 0.28 * (player ? player.lvl : 0)));
  }
  function hitstop(ms) {
    hitstopUntil = Math.max(hitstopUntil, performance.now() + ms);
  }
  function flatPct() {
    return clamp(G_.destroyedVal / (totalValue * 0.99), 0, 1);
  }
  var el = function (id) {
    return document.getElementById(id);
  };
  var keys = {};
  window.addEventListener("keydown", function (e) {
    if (e.repeat) return;
    keys[e.code] = true;
    audioInit();
    if (G_.mode === "play" && player) {
      if (e.code === "KeyQ" || e.code === "KeyK") player.doSpin();
      if (e.code === "KeyE" || e.code === "KeyL") player.doStomp();
      if (e.code === "KeyF" || e.code === "ShiftLeft" || e.code === "ShiftRight") player.toggleFly();
      if (e.code === "Escape" || e.code === "KeyP") pauseGame();
      if (e.code === "Space") e.preventDefault();
    } else if (G_.mode === "paused" && (e.code === "Escape" || e.code === "KeyP")) resumeGame();else if (G_.mode === "menu" && e.code === "Enter") startGame();else if (G_.mode === "menu" && e.code === "ArrowLeft") switchStage(-1);else if (G_.mode === "menu" && e.code === "ArrowRight") switchStage(1);else if (G_.mode === "intro") skipIntro();
  });
  window.addEventListener("keyup", function (e) {
    keys[e.code] = false;
  });
  var joy = {
    id: null,
    ox: 0,
    oy: 0,
    x: 0,
    y: 0
  };
  var joyEl = el("joy"),
    knobEl = el("knob"),
    touchZone = el("touch");
  touchZone.addEventListener("pointerdown", function (e) {
    audioInit();
    if (G_.mode !== "play" || joy.id !== null) return;
    joy.id = e.pointerId;
    joy.ox = e.clientX / UIS;
    joy.oy = e.clientY / UIS;
    joy.x = joy.y = 0;
    joyEl.style.left = joy.ox + "px";
    joyEl.style.top = joy.oy + "px";
    joyEl.classList.add("on");
    knobEl.style.transform = "translate(-50%,-50%)";
    try {
      touchZone.setPointerCapture(e.pointerId);
    } catch (err) {}
  });
  touchZone.addEventListener("pointermove", function (e) {
    if (e.pointerId !== joy.id) return;
    var dx = e.clientX / UIS - joy.ox,
      dy = e.clientY / UIS - joy.oy,
      L = Math.hypot(dx, dy),
      R = 56;
    if (L > R) {
      dx *= R / L;
      dy *= R / L;
    }
    joy.x = dx / R;
    joy.y = dy / R;
    knobEl.style.transform = "translate(calc(-50% + " + dx + "px),calc(-50% + " + dy + "px))";
  });
  function joyEnd(e) {
    if (e && e.pointerId !== joy.id) return;
    joy.id = null;
    joy.x = joy.y = 0;
    joyEl.classList.remove("on");
  }
  ["pointerup", "pointercancel", "lostpointercapture"].forEach(function (ev) {
    touchZone.addEventListener(ev, joyEnd);
    window.addEventListener(ev, joyEnd);
  });
  window.addEventListener("blur", function () {
    joyEnd();
    G_.fireHeld = false;
    for (var k in keys) keys[k] = false;
  });
  function bindBtn(id, down, up) {
    var b = el(id);
    b.addEventListener("pointerdown", function (e) {
      e.preventDefault();
      audioInit();
      b.classList.add("press");
      down();
      try {
        b.setPointerCapture(e.pointerId);
      } catch (er) {}
    });
    var u = function () {
      b.classList.remove("press");
      if (up) up();
    };
    b.addEventListener("pointerup", u);
    b.addEventListener("pointercancel", u);
    b.addEventListener("lostpointercapture", u);
  }
  bindBtn("bFire", function () {
    G_.fireHeld = true;
  }, function () {
    G_.fireHeld = false;
  });
  bindBtn("bSpin", function () {
    if (G_.mode === "play") player.doSpin();
  });
  bindBtn("bStomp", function () {
    if (G_.mode === "play") player.doStomp();
  });
  bindBtn("bFly", function () {
    if (G_.mode === "play") player.toggleFly();
  });
  document.addEventListener("contextmenu", function (e) {
    e.preventDefault();
  });
  function readInput() {
    var I = player.in,
      kx = 0,
      kz = 0;
    if (G_.mode !== "play" || false) {
      I.x = I.z = 0;
      I.fire = false;
      return;
    }
    if (keys.KeyW || keys.ArrowUp) kz += 1;
    if (keys.KeyS || keys.ArrowDown) kz -= 1;
    if (keys.KeyA || keys.ArrowLeft) kx += 1;
    if (keys.KeyD || keys.ArrowRight) kx -= 1;
    I.x = kx - joy.x;
    I.z = kz - joy.y;
    I.face = undefined;
    I.fire = G_.mode === "play" && (G_.fireHeld || !!keys.Space || !!keys.KeyJ);
  }
  var hud = {
    speed: el("speed"),
    time: el("time"),
    bar: el("barFill"),
    size: el("sizeLbl"),
    hp: el("hpFill"),
    banner: el("banner"),
    bT: el("bannerT"),
    bS: el("bannerS"),
    cdSpin: el("cdSpin"),
    cdStomp: el("cdStomp"),
    cdFly: el("cdFly"),
    cdFire: el("cdFire"),
    fly: el("bFly"),
    fireBtn: el("bFire"),
    hurt: el("hurt"),
    board: el("board"),
    feed: el("feed"),
    down: el("down"),
    downS: el("downS")
  };
  var floats = [];
  (function () {
    var host = el("floats");
    for (var i = 0; i < 16; i++) {
      var d = document.createElement("div");
      d.className = "float";
      host.appendChild(d);
      floats.push({
        el: d,
        t: 0,
        p: new THREE.Vector3(),
        on: false
      });
    }
  })();
  var floatI = 0;
  function floatText(txt, x, y, z, cls) {
    var f = floats[floatI++ % floats.length];
    f.on = true;
    f.t = 0;
    f.p.set(x, y, z);
    f.el.textContent = txt;
    f.el.className = "float " + (cls || "");
    f.el.style.opacity = 1;
  }
  function project(p, out) {
    V1.copy(p).project(camera);
    out.x = (V1.x * 0.5 + 0.5) * canvas.clientWidth / UIS;
    out.y = (-V1.y * 0.5 + 0.5) * canvas.clientHeight / UIS;
    out.z = V1.z;
    return out;
  }
  var SP = {
    x: 0,
    y: 0,
    z: 0
  };
  function updateFloats(dt) {
    floats.forEach(function (f) {
      if (!f.on) return;
      f.t += dt;
      if (f.t > 0.9) {
        f.on = false;
        f.el.style.opacity = 0;
        return;
      }
      V2.copy(f.p);
      V2.y += f.t * 2.5 * player.s;
      project(V2, SP);
      var sc = f.t < 0.12 ? 0.6 + f.t / 0.12 * 0.6 : 1.2 - Math.min(0.2, f.t - 0.12);
      f.el.style.transform = "translate(" + SP.x + "px," + SP.y + "px) translate(-50%,-50%) scale(" + sc + ")";
      f.el.style.opacity = f.t > 0.6 ? (0.9 - f.t) / 0.3 : 1;
    });
  }
  var pows = [],
    powI = 0,
    lastPow = 0;
  (function () {
    var host = el("floats");
    for (var i = 0; i < 7; i++) {
      var d = document.createElement("div");
      d.className = "pow";
      host.appendChild(d);
      pows.push({
        el: d,
        t: 0,
        p: new THREE.Vector3(),
        on: false,
        rot: 0
      });
    }
  })();
  var WORDS = {
    crash: ["Crash!", "Krakk!", "Smash!", "Ka-blam!", "Crunch!"],
    pop: ["Pow!", "Bonk!", "Wham!", "Thwack!", "Zok!"],
    boom: ["Kaboom!", "Blam!", "Boom!"],
    stomp: ["Stomp!", "Thoom!"],
    spin: ["Whoosh!", "Swish!"],
    hit: ["Wham!", "Bam!", "Thwack!", "Smack!", "Kapow!"],
    hurt: ["Ouch!", "Yowch!"],
    chomp: ["Chomp!", "Gulp!", "Munch!"],
    rip: ["Rrrip!", "Skrrk!", "Rip!"],
    yeet: ["Yeet!", "Fwoosh!", "Hup!"],
    ko: ["K.O.!", "Down!"]
  };
  function pow(kind, x, y, z, big, force) {
    var t = performance.now(),
      active = 0;
    pows.forEach(function (q) {
      if (q.on && q.t < 0.5) active++;
    });
    if (active >= 2 || t - lastPow < (force ? 140 : 450)) return;
    lastPow = t;
    var P = pows[powI++ % pows.length];
    P.on = true;
    P.t = 0;
    P.p.set(x, y, z);
    P.rot = rand(-14, 14);
    P.el.textContent = pick(WORDS[kind]);
    P.el.className = "pow " + pick(["", "red", "white"]);
  }
  function updatePows(dt) {
    pows.forEach(function (P) {
      if (!P.on) return;
      P.t += dt;
      if (P.t > 0.75) {
        P.on = false;
        P.el.style.opacity = 0;
        return;
      }
      project(P.p, SP);
      var sc = P.t < 0.08 ? 0.3 + P.t / 0.08 * 0.95 : P.t < 0.16 ? 1.25 - (P.t - 0.08) / 0.08 * 0.25 : 1;
      P.el.style.transform = "translate(" + SP.x + "px," + SP.y + "px) translate(-50%,-50%) rotate(" + P.rot + "deg) scale(" + sc + ")";
      P.el.style.opacity = P.t > 0.55 ? (0.75 - P.t) / 0.2 : 1;
    });
  }
  var bannerT = 0;
  function banner(t, s) {
    hud.bT.textContent = t;
    hud.bS.textContent = s || "";
    hud.bS.style.display = s ? "" : "none";
    hud.banner.classList.remove("show");
    void hud.banner.offsetWidth;
    hud.banner.classList.add("show");
    bannerT = 2.4;
  }
  function feed(msg, color) {
    if (G_.mode !== "play") return;
    var d = document.createElement("div");
    d.className = "fd";
    d.style.setProperty("--c", color || "#161020");
    var b = document.createElement("b");
    b.textContent = "\u25cf ";
    d.appendChild(b);
    d.appendChild(document.createTextNode(msg));
    hud.feed.insertBefore(d, hud.feed.firstChild);
    while (hud.feed.children.length > 3) hud.feed.removeChild(hud.feed.lastChild);
    setTimeout(function () {
      d.style.opacity = 0;
      setTimeout(function () {
        if (d.parentNode) d.parentNode.removeChild(d);
      }, 450);
    }, 4200);
  }
  var tags = [];
  function buildTags() {
    var host = el("tags");
    host.innerHTML = "";
    tags = [];
    dragons.forEach(function (d) {
      if (d.isPlayer) return;
      var t = document.createElement("div");
      t.className = "tag";
      t.style.setProperty("--c", d.color);
      t.innerHTML = "<i></i><span></span><u><s></s></u>";
      t.querySelector("span").textContent = d.name;
      host.appendChild(t);
      tags.push({
        el: t,
        d: d,
        lv: t.querySelector("i"),
        hp: t.querySelector("s"),
        last: ""
      });
    });
  }
  function updateTags() {
    tags.forEach(function (T) {
      var d = T.d,
        show = G_.mode === "play" && !d.dead && nearCam(d.pos.x, d.pos.z, 55);
      if (show) {
        V2.set(d.pos.x, d.alt + d.jumpY + 2.25 * d.s + 0.4, d.pos.z);
        project(V2, SP);
        show = SP.z < 1 && SP.y > 40;
      }
      T.el.style.display = show ? "block" : "none";
      if (!show) return;
      T.el.style.transform = "translate(" + SP.x + "px," + SP.y + "px) translate(-50%,-100%)";
      var lv = String(d.lvl + 1);
      if (T.last !== lv) {
        T.lv.textContent = lv;
        T.last = lv;
      }
      T.hp.style.transform = "scaleX(" + clamp(d.hp / d.maxHp(), 0, 1).toFixed(2) + ")";
    });
  }
  var boardT = 0;
  function standings() {
    return dragons.slice().sort(function (a, b) {
      return b.score - a.score;
    });
  }
  function renderBoard(host, full) {
    var html = "";
    standings().forEach(function (d, i) {
      html += '<div class="bRow' + (d.isPlayer ? " me" : "") + (d.dead && !full ? " ko" : "") + '" style="--c:' + d.color + '">' + (full ? '<span class="r">' + (i + 1) + ".</span>" : "") + '<i></i><span class="n"></span><span class="p">' + d.score.toLocaleString("en-US") + "</span></div>";
    });
    host.innerHTML = html;
    standings().forEach(function (d, i) {
      host.children[i].querySelector(".n").textContent = d.isPlayer ? "You" : d.name;
    });
  }
  (function () {
    var tr = el("timeRow"),
      hudEl = el("hud");
    var sync = function () {
      var w = tr.getBoundingClientRect().width / UIS;
      var desktop = window.matchMedia && matchMedia("(hover:hover) and (pointer:fine)").matches;
      if (w > 20) hudEl.style.setProperty("--mw", Math.round(w * (desktop ? 1.1 : 0.72)) + "px");
    };
    if (window.ResizeObserver) new ResizeObserver(sync).observe(tr);
    window.addEventListener("resize", sync);
    setTimeout(sync, 0);
  })();
  var minimap = {
    cv: el("mini"),
    ctx: null,
    base: null,
    bctx: null,
    R: 96,
    t: 0,
    toX: function (x) {
      return (1 - (x + this.R) / (2 * this.R)) * this.base.width;
    },
    toY: function (z) {
      return (1 - (z + this.R) / (2 * this.R)) * this.base.height;
    },
    init: function () {
      var dpr = Math.min(2, window.devicePixelRatio || 1),
        S = Math.round(132 * dpr);
      this.cv.width = this.cv.height = S;
      this.ctx = this.cv.getContext("2d");
      this.base = document.createElement("canvas");
      this.base.width = this.base.height = S;
      var c = this.bctx = this.base.getContext("2d");
      c.fillStyle = "#7CC35E";
      c.fillRect(0, 0, S, S);
      c.fillStyle = "#3FA9E0";
      c.fillRect(0, 0, S, this.toY(88));
      c.fillStyle = "#F2D9A0";
      c.fillRect(0, this.toY(88), S, this.toY(86) - this.toY(88));
      c.fillStyle = "#6B7086";
      c.fillRect(this.toX(86), this.toY(86), this.toX(-86) - this.toX(86), this.toY(-86) - this.toY(86));
      var self = this,
        px = S / (2 * this.R);
      blockInfo.forEach(function (b) {
        c.fillStyle = ZONE_COL[b.zone] || "#CFC8BA";
        c.fillRect(self.toX(b.x + 6.3), self.toY(b.z + 6.3), 12.6 * px, 12.6 * px);
      });
      objects.forEach(function (o) {
        if (!o.T.big) return;
        c.fillStyle = o.T.big >= 3 ? "#5E6A86" : o.T.big === 2 ? "#8C8FA6" : "#C98A6A";
        c.fillRect(self.toX(o.x + o.hw), self.toY(o.z + o.hd), o.hw * 2 * px, o.hd * 2 * px);
      });
    },
    mark: function (o) {
      var px = this.base.width / (2 * this.R);
      this.bctx.fillStyle = "#4A3C38";
      this.bctx.fillRect(this.toX(o.x + o.hw), this.toY(o.z + o.hd), o.hw * 2 * px, o.hd * 2 * px);
    },
    draw: function () {
      if (!this.ctx) return;
      var c = this.ctx,
        S = this.cv.width,
        self = this,
        k = S / 132;
      c.drawImage(this.base, 0, 0);
      enemies.forEach(function (e) {
        if (!e.alive || e.wreck) return;
        c.fillStyle = "#FF3B30";
        c.strokeStyle = "#161020";
        c.lineWidth = k;
        var x = self.toX(e.x),
          y = self.toY(e.z);
        c.fillRect(x - 2 * k, y - 2 * k, 4 * k, 4 * k);
        c.strokeRect(x - 2 * k, y - 2 * k, 4 * k, 4 * k);
      });
      dragons.forEach(function (d) {
        if (d.dead) return;
        var x = self.toX(d.pos.x),
          y = self.toY(d.pos.z),
          r = (4.5 + d.lvl * 1.0) * k;
        c.beginPath();
        c.arc(x, y, r, 0, 6.283);
        c.fillStyle = d.color;
        c.fill();
        c.lineWidth = 1.6 * k;
        c.strokeStyle = "#161020";
        c.stroke();
        if (d.isPlayer) {
          c.beginPath();
          c.arc(x, y, r + 4.5 * k, 0, 6.283);
          c.strokeStyle = "#FFFFFF";
          c.lineWidth = 2.4 * k;
          c.stroke();
          var fx = -Math.sin(d.yaw),
            fy = -Math.cos(d.yaw);
          c.beginPath();
          c.moveTo(x + fx * (r + 10 * k), y + fy * (r + 10 * k));
          c.lineTo(x - fy * 4.5 * k + fx * (r + 2.5 * k), y + fx * 4.5 * k + fy * (r + 2.5 * k));
          c.lineTo(x + fy * 4.5 * k + fx * (r + 2.5 * k), y - fx * 4.5 * k + fy * (r + 2.5 * k));
          c.closePath();
          c.fillStyle = "#FFFFFF";
          c.fill();
          c.strokeStyle = "#161020";
          c.lineWidth = k;
          c.stroke();
        }
      });
    }
  };
  var shownScore = 0,
    speedOp = 0;
  function updateHUD(dt) {
    var p = player;
    var t = Math.max(0, Math.ceil(G_.time));
    hud.time.textContent = (t / 60 | 0) + ":" + ("0" + t % 60).slice(-2);
    hud.time.classList.toggle("low", G_.time < 20);
    var frac = p.lvl >= LV.length - 1 ? 1 : clamp(p.meter / LV[p.lvl].need, 0, 1);
    hud.bar.style.transform = "scaleX(" + frac + ")";
    hud.size.textContent = p.lvl >= LV.length - 1 ? "Max" : "Size " + (p.lvl + 1);
    hud.hp.style.transform = "scaleX(" + clamp(p.hp / p.maxHp(), 0, 1) + ")";
    el("hpWrap").classList.toggle("low", p.hp / p.maxHp() < 0.3);
    hud.cdSpin.style.setProperty("--p", clamp(p.spinCd / 1.1, 0, 1));
    hud.cdStomp.style.setProperty("--p", clamp(p.stompCd / 1.8, 0, 1));
    hud.cdFly.style.setProperty("--p", 1 - p.energy);
    hud.cdFire.style.setProperty("--p", 1 - p.fuel);
    hud.fireBtn.classList.toggle("empty", p.fireLock);
    hud.fly.classList.toggle("active", p.flying);
    hud.fly.querySelector("span").textContent = p.flying ? "Land" : "Fly";
    var spd = clamp(Math.max(p.fb * p.moveBlend * 0.75, p.dive ? 1 : 0, p.spinT >= 0 ? 0.6 : 0, p.growT >= 0 ? 0.9 : 0), 0, 1);
    speedOp = damp(speedOp, spd, 8, dt);
    hud.speed.style.opacity = speedOp.toFixed(2);
    if (bannerT > 0) {
      bannerT -= dt;
      if (bannerT <= 0) hud.banner.classList.remove("show");
    }
    if (p.dead) hud.downS.textContent = p.respawnT > 0.5 ? "Back in " + Math.ceil(p.respawnT) + " (one size smaller)" : "Get back in there!";
    boardT -= dt;
    minimap.t -= dt;
    if (boardT <= 0) {
      boardT = 0.3;
      renderBoard(hud.board, false);
    }
    if (minimap.t <= 0) {
      minimap.t = 0.1;
      minimap.draw();
    }
    G_.tooBigT -= dt;
  }
  function playerDown() {
    show("down", true);
    G_.fireHeld = false;
    addTrauma(0.5);
    slowmo = 0.3;
    Music.intensity = 1;
  }
  function playerUp() {
    show("down", false);
    banner("Back for more!", "Respawned at size " + (player.lvl + 1));
    Music.intensity = Math.min(3, 1 + player.lvl);
  }
  function updateObjects(dt) {
    for (var i = activeList.length - 1; i >= 0; i--) {
      var o = activeList[i],
        keep = false;
      if (o.flash > 0) {
        o.flash -= dt;
        keep = true;
      }
      if (o.wob > 0) {
        o.wob = Math.max(0, o.wob - dt * 2.5);
        keep = true;
      }
      if (o.burn > 0 && o.alive) {
        o.burn -= dt;
        keep = true;
        if (o.state === 0) damageObj(o, 1.2 * dt, o.x + 0.01, o.z, "burn", o.burnBy, true);
        if (nearCam(o.x, o.z, 80) && Math.random() < dt * (8 + o.hw * 6)) {
          var px = o.x + rand(-1, 1) * o.hw,
            pz = o.z + rand(-1, 1) * o.hd,
            py = rand(0.5, 1) * o.h;
          FX_ADD.spawn(px, py, pz, rand(-0.3, 0.3), rand(1, 2.5), rand(-0.3, 0.3), rand(0.4, 0.7), 0.5 + o.hw * 0.3, 0.1, 0.9, 0, COL.fireA, COL.fireC, -2, 0.5);
          FX_SMOKE.spawn(px, py + 0.5, pz, rand(-0.3, 0.3), rand(1, 2), rand(-0.3, 0.3), rand(1.2, 2), 0.5 + o.hw * 0.4, 1.6 + o.hw, 0.45, 0, COL.smokeA, COL.smokeB, -0.5, 0.4);
        }
      }
      if (o.state === 1) {
        o.st += dt;
        keep = true;
        if (nearCam(o.x, o.z, 80)) {
          if (Math.random() < dt * 30) {
            var a = Math.random() * 6.283;
            FX_SMOKE.spawn(o.x + Math.cos(a) * o.hw, 0.4, o.z + Math.sin(a) * o.hd, Math.cos(a) * 3, rand(1, 3), Math.sin(a) * 3, rand(1, 1.8), o.hw * 0.8, o.hw * 2.4, 0.7, 0, COL.dust, COL.dustB, -0.3, 1.2);
          }
          if (Math.random() < dt * 14) spawnDebris(o.x + rand(-1, 1) * o.hw, o.h * (1 - o.st / o.cd) * rand(0.6, 1), o.z + rand(-1, 1) * o.hd, rand(0.3, 0.7), rand(0.3, 0.6), rand(0.3, 0.7), rand(-3, 3), rand(0, 3), rand(-3, 3), o.parts[0].color, rand(1.5, 2.5));
          if (o.T.smoke && Math.random() < dt * 10) FX_ADD.spawn(o.x + rand(-1, 1), o.h * (1 - o.st / o.cd), o.z + rand(-1, 1), 0, 2, 0, 0.5, 1.2, 0.3, 1, 0, COL.fireA, COL.fireB, -1, 1);
        }
        if (o.st >= o.cd) {
          o.alive = false;
          o.state = 2;
          rubble(o);
          if (nearCam(o.x, o.z, 80)) {
            dustBurst(o.x, o.z, o.hw * 1.2, 10);
            addTrauma(0.1 * o.T.big);
          }
          keep = false;
        }
      }
      writeObj(o);
      if (!keep) {
        o.active = false;
        activeList.splice(i, 1);
      }
    }
  }
  var smokeT = 0;
  function updateChimneys(dt) {
    smokeT -= dt;
    if (smokeT > 0) return;
    smokeT = 0.18;
    bigObjects.forEach(function (o) {
      if (!o.T.smoke || !o.alive || o.state || !nearCam(o.x, o.z, 90)) return;
      o.T.smoke.forEach(function (s) {
        var sy = s[1] * o.sy;
        FX_SMOKE.spawn(o.x + s[0], sy, o.z + s[2], rand(0.3, 0.8), rand(1.5, 2.5), rand(-0.2, 0.2), rand(2.5, 3.5), 0.8, 3.5, 0.55, 0, COL.dust, COL.smokeB, -0.3, 0.3);
      });
    });
  }
  function tell(key, t, s) {
    if (G_.told[key]) return;
    G_.told[key] = 1;
    banner(t, s);
  }
  function updateSpawner(dt) {
    var g = G_,
      S = STAGES[g.stage],
      c = {
        police: 0,
        tank: 0,
        heli: 0
      },
      top = 0;
    enemies.forEach(function (e) {
      if (e.alive) c[e.kind]++;
    });
    dragons.forEach(function (d) {
      if (!d.dead) top = Math.max(top, d.lvl);
    });
    g.spT.police -= dt;
    if (g.spT.police <= 0) {
      g.spT.police = rand(5, 8);
      if (c.police < 2 + Math.min(top, 3)) {
        spawnEnemy("police");
        tell("police", "Sirens!", "Cop cars are worth bonus points");
      }
    }
    if (top >= S.tankFrom) {
      g.spT.tank -= dt;
      if (g.spT.tank <= 0) {
        g.spT.tank = rand(7, 11);
        if (c.tank < 1 + top - S.tankFrom + g.stage) {
          spawnEnemy("tank");
          tell("tank", "Tanks rolling in!", "Their shells hurt. Burn them first");
        }
      }
    }
    if (top >= S.heliFrom) {
      g.spT.heli -= dt;
      if (g.spT.heli <= 0) {
        g.spT.heli = rand(9, 13);
        if (c.heli < 1 + top - S.heliFrom) {
          spawnEnemy("heli");
          tell("heli", "Air strike!", "Fly up or breathe fire at the choppers");
        }
      }
    }
  }
  var camPos = new THREE.Vector3(0, 8, -70),
    camLook = new THREE.Vector3(),
    camScale = 1;
  function updateCamera(dt, rdt) {
    var g = player;
    if (window.__camO) {
      var o = window.__camO;
      camera.position.set(o[0], o[1], o[2]);
      camera.lookAt(o[3], o[4], o[5]);
      camLook.set(o[3], 0, o[5]);
      sun.target.position.set(o[3], 0, o[5]);
      sun.position.copy(sun.target.position).addScaledVector(SUN_DIR, 70);
      return;
    }
    if (!g) {
      camera.position.set(0, 30, -60);
      camera.lookAt(0, 0, 0);
      return;
    }
    if (G_.mode === "intro") {
      camera.position.copy(camPos);
      trauma = Math.max(0, trauma - rdt * 1.4);
      var shI = trauma * trauma * 0.12;
      camera.position.x += Math.sin(now * 63) * shI + Math.sin(now * 0.63) * 0.022;
      camera.position.y += Math.sin(now * 57) * shI + Math.sin(now * 0.47 + 1.2) * 0.016;
      camera.lookAt(camLook);
      sun.target.position.set(g.pos.x, 0, g.pos.z);
      sun.position.copy(sun.target.position).addScaledVector(SUN_DIR, 70);
      return;
    }
    if (G_.mode === "menu") {
      var a = now * 0.22,
        port = camera.aspect < 1;
      camPos.lerp(V1.set(g.pos.x + Math.sin(a) * (port ? 4.8 : 4.5), port ? 1.15 : 1.3, g.pos.z + Math.cos(a) * (port ? 4.8 : 4.5)), 1 - Math.exp(-3 * rdt));
      camLook.set(g.pos.x, port ? -0.5 : 0.2, g.pos.z);
      if (g.isPlayer) g.yaw = a;
    } else {
      camScale = damp(camScale, g.s, 4, rdt);
      var cs = camScale * 0.9 + 0.3;
      var aim = V2.set(g.pos.x + g.vel.x * 0.25, 0, g.pos.z + g.vel.z * 0.25 + 1.2 * cs);
      var snap = G_.camSnap ? 1 : 0;
      G_.camSnap = 0;
      camPos.lerp(V1.set(aim.x, 5.4 * cs + 1.6 + Math.max(0, g.alt) * 0.75, aim.z - 5.6 * cs - 1.6), snap || 1 - Math.exp(-6 * rdt));
      camLook.lerp(V3.set(aim.x, 0.9 * g.s + Math.max(0, g.alt) * 0.8, aim.z), snap || 1 - Math.exp(-8 * rdt));
    }
    camera.position.copy(camPos);
    trauma = Math.max(0, trauma - rdt * 1.4);
    var sh = trauma * trauma,
      amp = 0.5 * (0.6 + camScale * 0.28);
    camera.position.x += (Math.sin(now * 63) + Math.sin(now * 29)) * 0.5 * sh * amp;
    camera.position.y += (Math.sin(now * 57 + 1) + Math.sin(now * 23)) * 0.5 * sh * amp;
    camera.lookAt(camLook);
    camera.rotation.z += Math.sin(now * 41) * sh * 0.03;
    var sw = (16 + camScale * 9) * Q.s.sw;
    sun.target.position.set(g.pos.x, 0, g.pos.z + 4 * camScale);
    sun.position.copy(sun.target.position).addScaledVector(SUN_DIR, 70);
    var sc = sun.shadow.camera;
    if (Math.abs(sc.right - sw) > 0.5) {
      sc.left = -sw;
      sc.right = sw;
      sc.top = sw;
      sc.bottom = -sw;
      sc.near = 1;
      sc.far = 160;
      sc.updateProjectionMatrix();
    }
  }
  function show(id, on) {
    el(id).classList.toggle("hide", !on);
  }
  function stageLocked(i) {
    return HOST.on ? false : i > 0 && save.stars[i - 1] < 1;
  }
  function renderMenu() {
    var host = el("stages");
    host.innerHTML = "";
    var i = selStage,
      S = STAGES[i],
      locked = stageLocked(i),
      st = starsFor(i);
    var b = document.createElement("div");
    b.className = "stage sel" + (locked ? " locked" : "");
    b.innerHTML = '<span class="issue">Issue #' + (i + 1) + '</span><span class="sName"></span><span class="sDesc"></span><span class="sMeta"></span>';
    b.querySelector(".sName").textContent = S.name;
    b.querySelector(".sDesc").textContent = locked ? "Finish top 3 in " + STAGES[i - 1].name + " to unlock" : S.desc + (save.best[i] ? " Best: " + save.best[i].toLocaleString("en-US") : "");
    b.querySelector(".sMeta").textContent = locked ? "Locked" : "\u2605\u2605\u2605".slice(0, st) + "\u2606\u2606\u2606".slice(0, 3 - st);
    host.appendChild(b);
    el("prevStage").disabled = i === 0;
    el("nextStage").disabled = i === STAGES.length - 1;
    el("prevStage").style.display = el("nextStage").style.display = HOST.on ? "none" : "";
    el("stageDots").innerHTML = HOST.on ? "" : STAGES.map(function (x, k) {
      return '<i class="' + (k === i ? "on" : "") + '"></i>';
    }).join("");
    var sb = el("startBtn");
    sb.disabled = locked;
    sb.querySelector("span").textContent = locked ? "Locked" : "Start rampage!";
    var sk = el("skins");
    sk.innerHTML = "";
    var ts = totalStars();
    SKINS.forEach(function (S, i) {
      var locked = ts < S.need;
      var b = document.createElement("button");
      b.className = "skin" + (i === save.skin ? " sel" : "") + (locked ? " locked" : "");
      b.style.setProperty("--c", S.swatch);
      b.setAttribute("aria-label", S.name + (locked ? ", needs " + S.need + " stars" : ""));
      b.innerHTML = "<i></i><span></span>";
      b.querySelector("span").textContent = locked ? "\u2605" + S.need : S.name;
      b.disabled = locked;
      b.addEventListener("click", function () {
        audioInit();
        SFX.click();
        save.skin = i;
        persist();
        if (player) player.setSkin(i);
        renderMenu();
      });
      sk.appendChild(b);
    });
    el("totStars").textContent = ts + " / " + STAGES.length * 3 + " \u2605";
    syncToggles();
  }
  function syncToggles() {
    document.querySelectorAll("[data-toggle]").forEach(function (b) {
      var k = b.getAttribute("data-toggle");
      b.setAttribute("aria-pressed", save[k] ? "true" : "false");
      b.textContent = (k === "music" ? "Music " : "Sound ") + (save[k] ? "on" : "off");
    });
  }
  document.querySelectorAll("[data-toggle]").forEach(function (b) {
    b.addEventListener("click", function () {
      audioInit();
      var k = b.getAttribute("data-toggle");
      save[k] = !save[k];
      persist();
      setAudioPrefs();
      syncToggles();
      SFX.click();
    });
  });
  function loadCity(i) {
    clearEnemies();
    clearDebris();
    buildCity(i);
    cityStage = i;
    cityDirty = false;
    objects.forEach(function (o, k) {
      o.i = k;
    });
    objects.forEach(writeObj);
    flushMeshes();
    resetPeds();
    activeList.length = 0;
    minimap.init();
    try {
      renderer.compile(scene, camera);
    } catch (e) {}
    qReset();
  }
  function menuPose() {
    var mp = selStage === 0 ? [TOY.x + 0.15, TOY.z - 0.6] : [0, -60];
    dragons.forEach(function (d) {
      d.reset(mp[0], mp[1], 0);
      d.root.visible = d.isPlayer;
      d.root.position.set(d.pos.x, 0, d.pos.z);
      if (!d.isPlayer) {
        d.dead = true;
        d.respawnT = 1e9;
      }
    });
    if (player) player.yaw = Math.PI * 0.85;
  }
  function startGame() {
    if (!ready) return;
    var i = selStage;
    if (stageLocked(i)) return;
    HOST.reported = false;
    G_.stage = i;
    if (cityStage !== i || cityDirty) loadCity(i);
    cityDirty = true;
    var names = BOT_NAMES.slice().sort(function () {
        return Math.random() - 0.5;
      }),
      others = [0, 1, 2, 3, 4].filter(function (k) {
        return k !== save.skin;
      });
    dragons.forEach(function (d, k) {
      var sp = SPAWNS[k];
      d.reset(sp[0], sp[1], Math.atan2(-sp[0], -sp[1]));
      d.score = 0;
      d.kills = 0;
      d.root.visible = true;
      if (!d.isPlayer) {
        var diff = STAGES[i].diff,
          par = STAGES[i].par || 0,
          B = new Brain(d);
        B.skill *= 0.55 + 0.45 * diff;
        B.aggr *= 0.35 + 0.65 * diff;
        B.flyLove *= 0.5 + 0.5 * diff;
        B.skill = Math.min(1, B.skill + 0.2 * par);
        B.aggr = Math.min(1, B.aggr + 0.2 * par);
        d.name = names[k];
        d.setSkin(others[k - 1]);
        d.brain = B;
        d.inv = 1;
        var dm = (B.skill * 0.4 + 0.12) * (0.45 + 0.55 * diff),
          pv = 0.45 + 0.55 * diff;
        d.dmgMul = dm + (1 - dm) * par;
        d.pvp = pv + (1 - pv) * par;
        d.dead = true;
        d.respawnT = 1e9;
        d.root.visible = false;
      } else {
        d.pvp = 1;
        d.setSkin(save.skin);
      }
    });
    buildTags();
    Object.assign(G_, {
      time: STAGES[i].time,
      destroyedVal: 0,
      spT: {
        police: 8,
        tank: 4,
        heli: 4
      },
      told: {},
      tooBigT: 0,
      fireHeld: false,
      mode: "intro"
    });
    shownScore = 0;
    camScale = 1;
    hud.feed.innerHTML = "";
    show("down", false);
    show("menu", false);
    show("end", false);
    show("pause", false);
    show("hud", false);
    Music.on = true;
    Music.intensity = 0;
    if (i === 0) {
      if (!save.seenIntro) {
        save.seenIntro = 1;
        persist();
      }
      startIntro();
    } else {
      intro = null;
      G_.mode = "play";
      G_.camSnap = 1;
      beginPlay();
    }
  }
  function beginPlay() {
    var i = G_.stage;
    G_.mode = "play";
    show("cine", false);
    show("hud", true);
    dragons.forEach(function (d, k) {
      if (d.isPlayer) return;
      var sp = SPAWNS[k];
      d.reset(sp[0], sp[1], Math.atan2(-sp[0], -sp[1]));
      d.score = 0;
      d.kills = 0;
      d.inv = 1.5;
      d.root.visible = true;
    });
    player.in.x = player.in.z = 0;
    player.in.fire = false;
    player.in.forceKind = undefined;
    player.score = 0;
    player.kills = 0;
    Music.intensity = 1;
    renderBoard(hud.board, false);
    minimap.draw();
    qReset();
    banner(STAGES[i].name, "4 rival dragons want this town. Out-smash them!");
  }
  var intro = null;
  var CAPS = [[0.3, "Meanwhile, in a quiet little town\u2026"], [2.1, "A terrible beast awakens!"], [7.0, "\u2026a very, VERY little town."]];
  function startIntro() {
    var P = player,
      T = TOY;
    P.reset(T.x + 0.2, T.z - 2.3, 0);
    intro = {
      t: 0,
      capI: -1,
      did: {},
      car: null,
      shot: -1
    };
    objects.forEach(function (o) {
      if (o.type === "toy_sedan" && o.alive) intro.car = o;
    });
    show("cine", true);
    el("cine").classList.remove("out");
    el("caption").classList.remove("on");
    camPos.set(T.x + 0.12, 0.55, P.pos.z + 3.35);
    camLook.set(P.pos.x, 0.95, P.pos.z);
    slowmo = 1;
  }
  function skipIntro() {
    if (!intro || intro.t > 8.1) return;
    intro.t = 8.1;
    intro.skipped = true;
    var P = player;
    if (P.grab) P.dropGrab();
    P.spinT = -1;
    el("caption").classList.remove("on");
  }
  el("cine").addEventListener("pointerdown", function (e) {
    e.preventDefault();
    audioInit();
    skipIntro();
  });
  function introCam(t) {
    var P = player,
      T = TOY,
      px = P.pos.x,
      pz = P.pos.z;
    if (t < 6.6) {
      var k = clamp(t / 6.6, 0, 1);
      var up = clamp((t - 4.9) / 0.7, 0, 1);
      return [V1.set(T.x + 0.12, 0.65 + 0.3 * k + 0.25 * up, pz + 4.0 - 0.45 * k), V2.set(px, 1.05 + 0.25 * k + 0.6 * up, pz), 0];
    }
    var r = clamp((t - 6.6) / 2.0, 0, 1),
      e = r * r * (3 - 2 * r);
    return [V1.set(T.x + 0.12 + e * 2.6, 1.2 + e * 23.4, pz + 3.55 - e * 21), V2.set(px, 1.9 + e * 0.8, pz + e * 4), 0];
  }
  function turnTo(P, target, rate, rdt) {
    var d = Math.atan2(Math.sin(target - P.yaw), Math.cos(target - P.yaw));
    P.yaw += d * (1 - Math.exp(-rate * rdt));
  }
  function walkTo(P, tx, tz, sp) {
    var dx = tx - P.pos.x,
      dz = tz - P.pos.z,
      d = Math.hypot(dx, dz);
    if (d < 0.22) return true;
    P.in.x = dx / d * sp;
    P.in.z = dz / d * sp;
    return false;
  }
  function updateIntro(dt, rdt) {
    var I = intro,
      P = player,
      T = TOY,
      t0 = I.t;
    I.t += rdt;
    var t = I.t;
    var at = function (x) {
      return t0 < x && t >= x;
    };
    P.in.x = 0;
    P.in.z = 0;
    P.in.fire = false;
    if (t < 2.0) walkTo(P, T.x + 0.1, T.z - 0.6, 0.3);
    if (at(2.1) && P.roarT < 0 && !I.did.roar) {
      I.did.roar = 1;
      P.roarT = 0;
      SFX.roar(true);
      addTrauma(0.5);
    }
    if (t > 2.3 && t < 3.7) turnTo(P, Math.atan2(T.x - 1.8 - P.pos.x, T.z - 0.4 - P.pos.z), 7, rdt);
    if (t > 2.95 && t < 3.7) P.in.fire = true;
    if (t > 3.85 && t < 5.0 && I.car) walkTo(P, I.car.x - 0.1, I.car.z - 0.95, 0.45);
    if (t > 4.6 && t < 5.05 && I.car) turnTo(P, Math.atan2(I.car.x - P.pos.x, I.car.z - P.pos.z), 8, rdt);
    if (t > 5.1 && t < 5.9) turnTo(P, 0.5, 6, rdt);
    if (at(5.05) && I.car && I.car.alive) {
      P.in.forceKind = "tear";
      P.in.grabLift = 0.62;
      P.startGrab(I.car);
      P.in.forceKind = undefined;
      P.in.grabLift = undefined;
    }
    if (at(8.1)) banner("Tiny Terror!", "Every kaiju starts small");
    var ci = -1;
    CAPS.forEach(function (c, k) {
      if (t >= c[0]) ci = k;
    });
    if (t > 2.6 && t < 7.0) ci = -2;
    if (ci !== I.capI) {
      I.capI = ci;
      var cap = el("caption");
      if (ci >= 0) {
        cap.textContent = CAPS[ci][1];
        cap.classList.remove("on");
        void cap.offsetWidth;
        cap.classList.add("on");
      } else cap.classList.remove("on");
    }
    if (at(8.4)) el("cine").classList.add("out");
    var cam = introCam(Math.min(t, 8.7));
    if (cam[2] !== I.shot) {
      I.shot = cam[2];
      camPos.copy(cam[0]);
      camLook.copy(cam[1]);
    } else {
      var f = I.skipped ? 1 - Math.exp(-6 * rdt) : 1 - Math.exp(-16 * rdt);
      camPos.lerp(cam[0], f);
      camLook.lerp(cam[1], 1 - Math.exp(-11 * rdt));
    }
    if (t >= 8.85) {
      intro = null;
      beginPlay();
    }
  }
  function toMenu() {
    intro = null;
    show("cine", false);
    G_.mode = "menu";
    G_.fireHeld = false;
    joyEnd();
    show("hud", false);
    show("end", false);
    show("pause", false);
    show("menu", true);
    show("down", false);
    tags.forEach(function (T) {
      T.el.style.display = "none";
    });
    if (cityDirty) loadCity(selStage);
    clearEnemies();
    menuPose();
    Music.intensity = 0;
    renderMenu();
  }
  function pauseGame() {
    if (G_.mode === "intro") {
      skipIntro();
      return;
    }
    if (G_.mode !== "play") return;
    G_.fireHeld = false;
    joyEnd();
    el("restartBtn").classList.toggle("hide", !!false);
    el("quitBtn").textContent = "Menu";
    G_.mode = "paused";
    Music.on = false;
    show("pause", true);
    syncToggles();
  }
  function resumeGame() {
    if (G_.mode !== "paused") return;
    G_.mode = "play";
    Music.on = true;
    show("pause", false);
    last = performance.now();
  }
  var ORD = ["1st", "2nd", "3rd", "4th", "5th"];
  function endGame() {
    var g = G_;
    g.mode = "end";
    g.fireHeld = false;
    joyEnd();
    var st = standings(),
      rank = st.indexOf(player),
      stars = rank === 0 ? 3 : rank === 1 ? 2 : rank === 2 ? 1 : 0,
      pct = flatPct();
    var newBest = player.score > save.best[g.stage];
    save.stars[g.stage] = Math.max(save.stars[g.stage], stars);
    if (newBest) save.best[g.stage] = player.score;
    persist();
    if (HOST.on && !HOST.reported) {
      HOST.reported = true;
    }
    el("stars").style.display = "";
    el("againBtn").textContent = "Retry";
    el("againBtn").classList.remove("hide");
    el("menuBtn").textContent = "Menu";
    el("endTitle").textContent = rank === 0 ? "You win!" : ORD[rank] + " place";
    el("endTitle").style.fontSize = "";
    el("endScore").textContent = player.score.toLocaleString("en-US");
    el("newBest").classList.toggle("hide", !newBest || player.score === 0);
    renderBoard(el("standings"), true);
    el("endStats").textContent = (pct >= 1 ? STAGES[g.stage].name + " is flattened! " : Math.floor(pct * 100) + "% of " + STAGES[g.stage].name + " flattened. ") + "You KO'd " + player.kills + (player.kills === 1 ? " rival." : " rivals.");
    var sEl = el("stars").children;
    for (var i = 0; i < 3; i++) sEl[i].classList.toggle("on", i < stars);
    var hasNext = !HOST.on && g.stage < STAGES.length - 1 && save.stars[g.stage] >= 1;
    el("nextBtn").classList.toggle("hide", !hasNext);
    el("endHint").textContent = stars === 0 ? "Finish in the top 3 to clear this issue." : !hasNext && !HOST.on && g.stage < STAGES.length - 1 ? "Finish in the top 3 to unlock " + STAGES[g.stage + 1].name + "." : "";
    show("hud", false);
    show("down", false);
    show("end", true);
    Music.intensity = 0;
    tags.forEach(function (T) {
      T.el.style.display = "none";
    });
    if (rank === 0) SFX.grow();
  }
  el("startBtn").addEventListener("click", function () {
    audioInit();
    startGame();
  });
  function switchStage(d) {
    var n = clamp(selStage + d, 0, STAGES.length - 1);
    if (n === selStage) return;
    audioInit();
    SFX.click();
    selStage = n;
    loadCity(n);
    menuPose();
    renderMenu();
  }
  el("prevStage").addEventListener("click", function () {
    switchStage(-1);
  });
  el("nextStage").addEventListener("click", function () {
    switchStage(1);
  });
  el("againBtn").addEventListener("click", function () {
    audioInit();
    {
      startGame();
    }
  });
  el("nextBtn").addEventListener("click", function () {
    audioInit();
    selStage = G_.stage + 1;
    startGame();
  });
  el("menuBtn").addEventListener("click", function () {
    audioInit();
    {
      toMenu();
    }
  });
  el("pauseBtn").addEventListener("click", function () {
    audioInit();
    pauseGame();
  });
  el("resumeBtn").addEventListener("click", function () {
    resumeGame();
  });
  el("restartBtn").addEventListener("click", function () {
    {
      startGame();
    }
  });
  el("quitBtn").addEventListener("click", function () {
    {
      toMenu();
    }
  });
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) pauseGame();
  });
  var NET_MAX = 4;
  var NET_STAGE = 4;
  var NET_RATE = 1 / 20;
  var EK = ["police", "tank", "heli"];
  function nr(v) {
    return Math.round(v * 100) / 100;
  }
  var viewOff = null,
    last = performance.now(),
    simMode = false;
  var UIS = 1;
  function uiScale() {
    var w = innerWidth,
      h = innerHeight;
    return h > w && w > 560 ? clamp(w / 390, 1, 2.2) : 1;
  }
  var FT = new Float32Array(90),
    ftN = 0,
    ftSkip = 30,
    goodRuns = 0;
  Q.step = 0;
  Q.floor = 0;
  Q.climbed = 0;
  function applyQ() {
    var st = Q.step;
    var wantSoft = Q.s.soft && st === 0,
      wantShadow = st < 3,
      size = st >= 2 ? 512 : st >= 1 ? 1024 : Q.s.shadow;
    if (renderer.shadowMap.enabled !== wantShadow || renderer.shadowMap.type !== (wantSoft ? THREE.PCFSoftShadowMap : THREE.PCFShadowMap)) {
      renderer.shadowMap.enabled = wantShadow;
      renderer.shadowMap.type = wantSoft ? THREE.PCFSoftShadowMap : THREE.PCFShadowMap;
      scene.traverse(function (o) {
        if (o.material) {
          var m = o.material;
          if (m.length) m.forEach(function (x) {
            x.needsUpdate = true;
          });else m.needsUpdate = true;
        }
      });
    }
    sun.castShadow = wantShadow;
    if (wantShadow && sun.shadow.mapSize.x !== size) {
      sun.shadow.mapSize.set(size, size);
      if (sun.shadow.map) {
        sun.shadow.map.dispose();
        sun.shadow.map = null;
      }
    }
    POST.on = !!POST.rt;
    resize();
  }
  function qReset() {
    ftN = 0;
    ftSkip = 30;
    goodRuns = 0;
  }
  function qWatch(rdt) {
    if (ftSkip > 0) {
      ftSkip--;
      return;
    }
    FT[ftN++] = rdt;
    if (ftN < FT.length) return;
    ftN = 0;
    var a = Array.prototype.slice.call(FT).sort(function (x, y) {
        return x - y;
      }),
      p90 = a[80];
    if (p90 > 0.0215) {
      if (Q.step < 3) {
        Q.step++;
        if (Q.climbed) Q.floor = Q.step;
        applyQ();
        ftSkip = 30;
      }
      goodRuns = 0;
    } else if (p90 < 0.0178 && Q.step > Q.floor) {
      if (++goodRuns >= 4) {
        Q.step--;
        Q.climbed = 1;
        applyQ();
        ftSkip = 30;
        goodRuns = 0;
      }
    } else goodRuns = 0;
  }
  function resize() {
    var w = window.innerWidth,
      h = window.innerHeight;
    UIS = uiScale();
    document.documentElement.style.setProperty("--ui", String(UIS));
    pixelRatio = Math.max(0.6, pixelsFor(Q.tier) * (Q.step >= 2 ? 0.7 : Q.step >= 1 ? 0.85 : 1));
    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.fov = w < h ? 62 : 48;
    viewOff = null;
    camera.clearViewOffset();
    camera.updateProjectionMatrix();
    var s = h * pixelRatio / (2 * Math.tan(camera.fov * Math.PI / 360));
    FX_ADD.mat.uniforms.uScale.value = s;
    FX_SMOKE.mat.uniforms.uScale.value = s;
    FX_ADD.mat.uniforms.uLin.value = FX_SMOKE.mat.uniforms.uLin.value = POST.on ? 1 : 0;
    postResize(w, h);
  }
  window.addEventListener("resize", resize);
  function loop() {
    requestAnimationFrame(loop);
    if (simMode) return;
    var t = performance.now();
    if (t - last < 13.5) return;
    var rdt = Math.min(0.05, (t - last) / 1000);
    last = t;
    frame(t, rdt, true);
  }
  function frame(t, rdt, doRender) {
    if (!simMode) qWatch(rdt);
    var wantOff = G_.mode === "menu" && camera.aspect > 1.3;
    if (wantOff !== viewOff) {
      viewOff = wantOff;
      if (wantOff) camera.setViewOffset(innerWidth, innerHeight, innerWidth * 0.2, 0, innerWidth, innerHeight);else camera.clearViewOffset();
    }
    var paused = G_.mode === "paused";
    slowmo = damp(slowmo, 1, 2.2, rdt);
    timeScale = t < hitstopUntil ? 0.05 : slowmo;
    var dt = paused ? 0 : rdt * timeScale;
    if (!paused) now += rdt;
    if (ready && !paused) {
      if (G_.mode === "play") {
        if (worldAuth()) {
          G_.time -= dt;
          updateSpawner(dt);
        }
        if (G_.time <= 0 || flatPct() >= 1) endGame();
      }
      if (G_.mode === "intro") {
        updateIntro(dt, rdt);
        player.update(dt, rdt);
      }
      if (G_.mode === "play" || G_.mode === "menu") {
        readInput();
        dragons.forEach(function (d) {
          if (!d.isPlayer && d.brain && G_.mode === "play" && !d.netRemote) d.brain.update(dt);
        });
        dragons.forEach(function (d) {
          if (d.netRemote) {
            if (G_.mode === "play") d.updateRemote(dt, rdt);
          } else if (d.isPlayer || G_.mode === "play") d.update(dt, rdt);
        });
      }
      updateObjects(dt);
      updateChimneys(dt);
      updateTraffic(dt);
      updatePeds(dt);
      updateEnemies(dt);
      updateProjs(dt);
      updateThrown(dt);
      updateChunks(dt);
    }
    if (!paused) {
      updateDebris(dt);
      FX_ADD.update(dt);
      FX_SMOKE.update(dt);
      updateRings(dt);
      updateSky(dt);
    }
    flushMeshes();
    updateCamera(dt, paused ? 0 : rdt);
    var fN = 80,
      fF = 210;
    if (G_.mode === "menu") {
      fN = 10;
      fF = 20;
    } else if (G_.mode === "intro" && intro) {
      var fo = clamp((intro.t - 6.6) / 1.4, 0, 1);
      fN = lerp(10, 80, fo);
      fF = lerp(20, 210, fo);
    }
    scene.fog.near = damp(scene.fog.near, fN, 5, rdt);
    scene.fog.far = damp(scene.fog.far, fF, 5, rdt);
    if (G_.mode === "play") updateHUD(rdt);
    updateFloats(paused ? 0 : rdt);
    updatePows(paused ? 0 : rdt);
    updateTags();
    if (doRender) renderFrame();
  }
  window.__sim = function (sec) {
    simMode = true;
    var t = performance.now();
    for (var i = 0; i < sec * 60; i++) {
      t += 1000 / 60;
      frame(t, 1 / 60, false);
    }
    simMode = false;
    last = performance.now();
    qReset();
    renderFrame();
  };
  window.__rig = function () {
    return BN;
  };
  window.__qset = function (st) {
    Q.step = st;
    applyQ();
  };
  window.__introT = function () {
    return intro ? +intro.t.toFixed(2) : -1;
  };
  window.__q = function () {
    return {
      tier: Q.tier,
      step: Q.step,
      pr: +pixelRatio.toFixed(2),
      shadow: sun.castShadow ? sun.shadow.mapSize.x : 0,
      post: POST.on
    };
  };
  window.__R = renderer;
  window.__scene = scene;
  window.__cam = camera;
  window.__G = G_;
  window.__stage = function (i) {
    selStage = i;
    loadCity(i);
  };
  window.__spawn = spawnEnemy;
  window.__en = enemies;
  window.__grow = function (d) {
    d = d || player;
    d.meter = LV[d.lvl].need;
    d.growUp();
  };
  window.__D = function () {
    return dragons;
  };
  window.__peds = function () {
    return peds;
  };
  window.__kill = function (e) {
    killEnemy(e, "fire", player);
  };
  window.__flat = flatPct;
  window.__tv = function () {
    return totalValue;
  };
  window.__objs = function () {
    return objects;
  };
  var started = false;
  function boot() {
    if (started) return Promise.resolve();
    started = true;
    return loadSave().then(function () {
      if (HOST.on && HOST.gotInfo) selStage = clamp(HOST.level - 1, 0, STAGES.length - 1);
      loadCity(selStage);
      Music.on = true;
      resize();
      renderMenu();
      requestAnimationFrame(loop);
      return new Promise(function (done) {
        var models = [];
        (function next() {
          if (models.length === 5) {
            models.forEach(function (m, k) {
              dragons.push(new Dragon(m, {
                player: k === 0,
                name: k === 0 ? "You" : BOT_NAMES[k],
                skin: k === 0 ? save.skin : k
              }));
            });
            dragons.forEach(function (d, k) {
              d.k = k;
              d.netRemote = false;
            });
            player = dragons[0];
            ready = true;
            menuPose();
            show("loadmsg", false);
            show("startBtn", true);
            done();
            return;
          }
          parseDragon(function (m) {
            models.push(m);
            setTimeout(next, 0);
          });
        })();
      });
    });
  }
  window.__boot = boot;
  {
    boot();
  }
})();