var Xe = {
    canvas: {
      width: 720,
      height: 1280
    },
    defaults: {
      frisbeeColor: "#F44336",
      fieldColor: "#2E9B3E",
      poleColor: "#FFEB3B",
      characterColor: "#2196F3",
      startingDifficulty: 1,
      difficultyRampSpeed: "medium",
      poleSpeedMultiplier: 1,
      baseDistance: 28,
      frisbeeSpeedMultiplier: 1,
      catchZoneSize: "medium",
      gravityMultiplier: 1,
      devMode: !0
    }
  },
  J = Xe;
var Ue = [{
    id: "classic",
    name: "Classic",
    unlockScore: 0,
    baseColor: 16777215,
    rimColor: 16716947,
    starColor: 16716947
  }, {
    id: "golden",
    name: "Golden",
    unlockScore: 10,
    baseColor: 16766720,
    rimColor: 16747520,
    starColor: 16777215
  }, {
    id: "ocean",
    name: "Ocean",
    unlockScore: 20,
    baseColor: 52945,
    rimColor: 2003199,
    starColor: 16777215
  }, {
    id: "fire",
    name: "Fire",
    unlockScore: 30,
    baseColor: 16729344,
    rimColor: 16711680,
    starColor: 16776960
  }, {
    id: "galaxy",
    name: "Galaxy",
    unlockScore: 40,
    baseColor: 9662683,
    rimColor: 16711935,
    starColor: 65535
  }, {
    id: "rainbow",
    name: "Rainbow",
    unlockScore: 50,
    baseColor: 16716947,
    rimColor: 65416,
    starColor: 16766720
  }],
  fe = "classic",
  E,
  G,
  V,
  W,
  $,
  re,
  F,
  X,
  D,
  A = [],
  O = [],
  Q = [],
  j = [],
  ae = [],
  ie = [],
  ce = [],
  ee = [],
  k = [],
  p = null,
  je = {},
  _ = null,
  he = null,
  oe = !1,
  $e = ["./_remote/571f63e52f8bedde/music1-rTr7oTZyHa-wWvN1d7TczfkXTFX3G3KelKgp1qZsO.mp3"],
  le = [],
  He = 0,
  n,
  Be = "play",
  Se = 0,
  Ce = 0;
var Ke = J.canvas.width,
  Je = J.canvas.height;
function we() {
  return false;
}
function ke() {
  return we() ? 12058368 : 7103487;
}
function Qe() {
  return we() ? "#B7FF00" : "#6C63FF";
}
function De() {
  let t = document.getElementById("frisbee-selector-btn");
  t && (we() ? (t.style.background = "linear-gradient(135deg, #B7FF00 0%, #8BC34A 100%)", t.style.boxShadow = "0 4px 12px rgba(183, 255, 0, 0.5)") : (t.style.background = "", t.style.boxShadow = ""));
}
function Ge() {
  if (!V || !G) return;
  let t = V.domElement.parentElement;
  if (!t) return;
  let o = t.clientWidth,
    e = t.clientHeight,
    s = Math.min(window.devicePixelRatio || 1, 2);
  V.setPixelRatio(s), V.setSize(o, e, !1), G.aspect = o / e, G.updateProjectionMatrix();
  let a = document.getElementById("trajectory-canvas");
  if (a) {
    a.width = o * s, a.height = e * s;
    let i = a.getContext("2d");
    i && i.scale(s, s);
  }
  let c = document.getElementById("score-wrapper");
  if (c) {
    let i = o / e,
      r = Math.abs(i - 2 / 3) < .02;
    c.style.top = r || i > 2 / 3 ? "18px" : "50px";
  }
}
function te() {
  if (_) {
    try {
      _.stop();
    } catch {}
    _ = null;
  }
  if (!p || le.length === 0 || oe) return;
  let t = () => {
    let o = le[He % le.length],
      e = p.createBufferSource(),
      s = p.createGain();
    e.buffer = o, e.loop = !1, s.gain.value = .3, e.connect(s), s.connect(p.destination), e.start(0), _ = e, e.onended = () => {
      _ === e && (He++, te());
    };
  };
  p.state === "suspended" ? p.resume().then(t).catch(() => {}) : t();
}
function Fe() {
  if (_) {
    try {
      _.stop();
    } catch {}
    _ = null;
  }
}
async function et() {
  if (!p) return;
  let t = $e.map(async e => {
    try {
      let a = await (await fetch(e)).arrayBuffer();
      return await p.decodeAudioData(a);
    } catch {
      return null;
    }
  });
  le = (await Promise.all(t)).filter(e => e !== null);
}
function tt() {
  if (oe || !p) return;
  p.state === "suspended" && p.resume();
  let t = p.currentTime,
    o = p.createGain();
  o.connect(p.destination), o.gain.setValueAtTime(.18, t), o.gain.exponentialRampToValueAtTime(.001, t + .35);
  let e = p.createOscillator();
  e.type = "sine", e.frequency.setValueAtTime(880, t), e.frequency.exponentialRampToValueAtTime(1320, t + .08), e.connect(o), e.start(t), e.stop(t + .35);
  let s = p.createGain();
  s.connect(p.destination), s.gain.setValueAtTime(.1, t + .05), s.gain.exponentialRampToValueAtTime(.001, t + .3);
  let a = p.createOscillator();
  a.type = "sine", a.frequency.setValueAtTime(1320, t + .05), a.connect(s), a.start(t + .05), a.stop(t + .3);
}
function ot() {
  if (oe || !p) return;
  p.state === "suspended" && p.resume();
  let t = p.currentTime,
    o = p.createGain();
  o.connect(p.destination), o.gain.setValueAtTime(.2, t), o.gain.exponentialRampToValueAtTime(.001, t + .25);
  let e = p.createOscillator();
  e.type = "sine", e.frequency.setValueAtTime(180, t), e.frequency.exponentialRampToValueAtTime(60, t + .2), e.connect(o), e.start(t), e.stop(t + .25);
  let s = p.sampleRate * .15,
    a = p.createBuffer(1, s, p.sampleRate),
    c = a.getChannelData(0);
  for (let f = 0; f < s; f++) c[f] = (Math.random() * 2 - 1) * .3;
  let i = p.createBufferSource();
  i.buffer = a;
  let r = p.createBiquadFilter();
  r.type = "lowpass", r.frequency.setValueAtTime(400, t), r.frequency.exponentialRampToValueAtTime(100, t + .15);
  let d = p.createGain();
  d.gain.setValueAtTime(.12, t), d.gain.exponentialRampToValueAtTime(.001, t + .15), i.connect(r), r.connect(d), d.connect(p.destination), i.start(t), i.stop(t + .15);
}
function st() {
  if (oe || !p) return;
  p.state === "suspended" && p.resume();
  let t = p.currentTime,
    o = p.sampleRate * .2,
    e = p.createBuffer(1, o, p.sampleRate),
    s = e.getChannelData(0);
  for (let r = 0; r < o; r++) s[r] = Math.random() * 2 - 1;
  let a = p.createBufferSource();
  a.buffer = e;
  let c = p.createBiquadFilter();
  c.type = "bandpass", c.frequency.setValueAtTime(800, t), c.frequency.exponentialRampToValueAtTime(2e3, t + .12), c.Q.value = 2;
  let i = p.createGain();
  i.gain.setValueAtTime(.12, t), i.gain.exponentialRampToValueAtTime(.001, t + .2), a.connect(c), c.connect(i), i.connect(p.destination), a.start(t), a.stop(t + .2);
}
function nt() {
  let t = document.getElementById("game-canvas"),
    o = !1;
  V && (o = !0, V.forceContextLoss(), V.dispose());
  let e = window.__frisbee_renderer;
  if (e && e !== V) {
    o = !0;
    try {
      e.forceContextLoss(), e.dispose();
    } catch {}
  }
  if (o && t) {
    let h = t.parentElement,
      w = document.createElement("canvas");
    w.id = "game-canvas", w.className = t.className, w.style.cssText = t.style.cssText, h?.replaceChild(w, t), t = w;
  }
  E = new THREE.Scene();
  let s = new THREE.SphereGeometry(400, 16, 16),
    a = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      vertexShader: `
      varying vec3 vPosition;
      void main() {
        vPosition = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
      fragmentShader: `
      varying vec3 vPosition;
      void main() {
        float h = normalize(vPosition).y;
        vec3 topColor = vec3(0.18, 0.45, 0.96);       // deep cartoon blue
        vec3 midColor = vec3(0.40, 0.68, 0.98);       // bright sky blue
        vec3 horizonColor = vec3(0.70, 0.88, 1.0);    // light blue horizon
        float midFactor = smoothstep(-0.1, 0.35, h);
        float topFactor = smoothstep(0.25, 0.85, h);
        vec3 skyColor = mix(horizonColor, midColor, midFactor);
        skyColor = mix(skyColor, topColor, topFactor);
        gl_FragColor = vec4(skyColor, 1.0);
      }
    `
    });
  $ = new THREE.Mesh(s, a), $.userData.isSky = !0, E.add($), at(), E.fog = new THREE.Fog(11788543, 180, 380), G = new THREE.PerspectiveCamera(68, Ke / Je, .1, 1e3), G.position.set(0, 16, -10), G.lookAt(0, 0, 10);
  try {
    V = new THREE.WebGLRenderer({
      canvas: t,
      antialias: !0,
      powerPreference: "default",
      failIfMajorPerformanceCaveat: !1
    });
  } catch {
    try {
      V = new THREE.WebGLRenderer({
        canvas: t,
        antialias: !1,
        powerPreference: "default",
        failIfMajorPerformanceCaveat: !1
      });
    } catch {
      let v = document.createElement("div");
      throw v.style.cssText = "position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:#1a1a2e;color:#fff;font-family:Inter,sans-serif;font-size:18px;text-align:center;padding:24px;z-index:9999", v.innerHTML = "WebGL is not available.<br>Please enable hardware acceleration in your browser settings and reload.", document.body.appendChild(v), new Error("WebGL not available \u2014 cannot create renderer");
    }
  }
  window.__frisbee_renderer = V, Ge(), window.addEventListener("resize", Ge);
  let c = new THREE.AmbientLight(16777215, .6);
  E.add(c), re = new THREE.DirectionalLight(16777215, .8), re.position.set(0, 20, 10), E.add(re);
  let i = document.createElement("canvas");
  i.width = 512, i.height = 512;
  let r = i.getContext("2d");
  r.fillStyle = window.gameConfig.fieldColor || "#2E9B3E", r.fillRect(0, 0, 512, 512);
  let d = 64,
    f = Math.ceil(512 / d);
  for (let h = 0; h < f; h++) h % 2 === 0 && (r.fillStyle = "rgba(0, 0, 0, 0.08)", r.fillRect(0, h * d, 512, d));
  for (let h = 0; h < 3e3; h++) {
    let w = Math.random() * 512,
      v = Math.random() * 512;
    r.fillStyle = Math.random() > .5 ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)", r.fillRect(w, v, 2, 3);
  }
  let l = new THREE.CanvasTexture(i);
  l.wrapS = THREE.RepeatWrapping, l.wrapT = THREE.RepeatWrapping, l.repeat.set(15, 100);
  let m = new THREE.PlaneGeometry(360, 1e4),
    u = new THREE.MeshLambertMaterial({
      map: l,
      emissive: 1727514,
      emissiveIntensity: .25
    });
  W = new THREE.Mesh(m, u), W.rotation.x = -Math.PI / 2, W.position.y = 0, W.position.z = 10, W.receiveShadow = !1, E.add(W), rt(), ct(), lt(), ye(), Me();
}
function at() {
  let t = [16777215, 15792383, 15135487].map(e => new THREE.MeshBasicMaterial({
      color: e,
      transparent: !0,
      opacity: .95,
      fog: !1
    })),
    o = [5, 6, 7, 8].map(e => new THREE.SphereGeometry(e, 8, 8));
  for (let e = 0; e < 12; e++) {
    let s = new THREE.Group(),
      a = 4 + Math.floor(Math.random() * 3),
      c = t[Math.floor(Math.random() * t.length)];
    for (let d = 0; d < a; d++) {
      let f = new THREE.Mesh(o[Math.floor(Math.random() * o.length)], c);
      f.position.x = (d - a / 2) * 4, f.position.y = Math.sin(d) * 2.5, f.position.z = (Math.random() - .5) * 3, s.add(f);
    }
    let i = Math.floor(e / 4),
      r = e % 4;
    s.position.x = (r - 1.5) * 40, s.position.y = 50 + Math.random() * 30, s.position.z = i * 50 + Math.random() * 20, s.rotation.y = Math.random() * Math.PI * 2, s.userData.isCloud = !0, s.userData.baseZOffset = s.position.z - 10, E.add(s), k.push(s);
  }
}
function it() {
  let t = new THREE.MeshBasicMaterial({
    color: 16777215
  });
  function o(e, s, a, c) {
    let i = new THREE.PlaneGeometry(e, s),
      r = new THREE.Mesh(i, t);
    r.rotation.x = -Math.PI / 2, r.position.set(a, .02, c), r.userData.isStructure = !0, E.add(r), k.push(r);
  }
  o(.15, 1e4, -12, 10), o(.15, 1e4, 12, 10);
}
function Le(t, o, e, s = 1) {
  let a = new THREE.Group(),
    c = new THREE.MeshLambertMaterial({
      color: 7029795
    }),
    i = new THREE.MeshLambertMaterial({
      color: 3046706,
      emissive: 1793568,
      emissiveIntensity: .1
    }),
    r = new THREE.Mesh(new THREE.CylinderGeometry(.4 * s, .5 * s, 4 * s, 6), c);
  r.position.y = 2 * s, r.castShadow = !1, a.add(r);
  let d = new THREE.ConeGeometry(2.5 * s, 5 * s, 6),
    f = new THREE.Mesh(d, i);
  f.position.y = 5.5 * s, f.castShadow = !1, a.add(f);
  let l = new THREE.Mesh(d, i);
  l.position.y = 7.5 * s, l.scale.set(.7, .7, .7), l.castShadow = !1, a.add(l);
  let m = new THREE.Mesh(d, i);
  return m.position.y = 9 * s, m.scale.set(.5, .5, .5), m.castShadow = !1, a.add(m), a.position.set(t, o, e), a.userData.isStructure = !0, a.userData.baseZOffset = e - 10, a;
}
function rt() {
  k.forEach(g => E.remove(g)), k = [];
  let t = new THREE.MeshLambertMaterial({
      color: 13421772,
      emissive: 13421772,
      emissiveIntensity: .3
    }),
    o = new THREE.MeshLambertMaterial({
      color: 8947848,
      emissive: 8947848,
      emissiveIntensity: .3
    }),
    e = new THREE.MeshLambertMaterial({
      color: 4473924,
      emissive: 4473924,
      emissiveIntensity: .3
    }),
    s = new THREE.MeshLambertMaterial({
      color: 16777215,
      emissive: 16777215,
      emissiveIntensity: .3
    }),
    a = new THREE.MeshLambertMaterial({
      color: 16767916,
      emissive: 16767916,
      emissiveIntensity: .3
    }),
    c = new THREE.BoxGeometry(1.2, .6, 400),
    i = new THREE.BoxGeometry(.8, 1.2, .6),
    r = new THREE.SphereGeometry(.35, 6, 6),
    d = 14,
    f = 12,
    l = .6,
    m = 400,
    h = [16711680, 255, 16776960, 65280, 16711935, 65535, 16746496, 8913151, 16777215, 16738740, 16716947, 3329330, 2003199, 16766720, 16729344].map(g => new THREE.MeshLambertMaterial({
      color: g,
      emissive: g,
      emissiveIntensity: .3
    }));
  for (let g = 0; g < 2; g++) {
    let b = g === 0 ? -1 : 1;
    for (let z = 0; z < f; z++) {
      let B = b * (d + z * .5),
        Z = z * l,
        U = 10,
        se = new THREE.Mesh(c, t);
      se.position.set(B, Z, U), se.userData.isStructure = !0, E.add(se), k.push(se);
      let ve = 26,
        Te = m / ve;
      for (let me = 0; me < ve; me++) {
        if (Math.random() < .08) continue;
        let ne = -50 + me * Te + (Math.random() - .5) * Te * .6,
          Ze = (Math.random() - .5) * .4,
          Re = B + Ze,
          qe = (Math.random() - .5) * .15,
          Pe = Z + l / 2 + qe,
          Ye = h[Math.floor(Math.random() * h.length)],
          N = .9 + Math.random() * .2,
          q = new THREE.Mesh(i, Ye);
        q.scale.set(N, N, N), q.position.set(Re, Pe + .7 * N, ne), q.userData.isStructure = !0, q.userData.baseZOffset = ne - U, q.castShadow = !1, E.add(q), k.push(q);
        let Y = new THREE.Mesh(r, a);
        Y.scale.set(N, N, N), Y.position.set(Re, Pe + 1.5 * N, ne), Y.userData.isStructure = !0, Y.userData.baseZOffset = ne - U, Y.castShadow = !1, E.add(Y), k.push(Y);
      }
    }
    let y = new THREE.BoxGeometry(.3, f * l + 2, m),
      H = new THREE.Mesh(y, o);
    H.position.set(b * (d + f * .5 + 1), f * l / 2, 10), H.userData.isStructure = !0, H.castShadow = !1, E.add(H), k.push(H);
    let S = new THREE.BoxGeometry(2, .3, m),
      C = new THREE.Mesh(S, e);
    C.position.set(b * (d + f * .5), f * l + 2, 10), C.userData.isStructure = !0, C.castShadow = !1, E.add(C), k.push(C);
  }
  let w = new THREE.CylinderGeometry(.05, .05, 3, 6),
    v = new THREE.BoxGeometry(.05, .8, 1.2),
    T = [16711680, 255, 16776960, 65280].map(g => new THREE.MeshLambertMaterial({
      color: g
    }));
  for (let g = 0; g < 4; g++) {
    let b = -40 + g * 30,
      y = T[g % T.length];
    for (let H = 0; H < 2; H++) {
      let S = H === 0 ? -1 : 1,
        C = S * (d + f * .5 + 1.5),
        z = new THREE.Mesh(w, s);
      z.position.set(C, f * l + 3.5, b), z.userData.isStructure = !0, z.userData.baseZOffset = b - 10, z.castShadow = !1, E.add(z), k.push(z);
      let B = new THREE.Mesh(v, y);
      B.position.set(C + S * .5, f * l + 4.5, b), B.userData.isStructure = !0, B.userData.baseZOffset = b - 10, B.castShadow = !1, E.add(B), k.push(B);
    }
  }
  let I = d + f * .5 + .5,
    P = f * l + 2 - 2,
    x = 15,
    M = m / x;
  for (let g = 0; g < x; g++) {
    let b = -50 + g * M,
      y = .8 + Math.random() * .4,
      H = (Math.random() - .5) * 1,
      S = Le(-I + H, P, b, y);
    E.add(S), k.push(S);
    let C = Le(I + H, P, b, y);
    E.add(C), k.push(C);
  }
  it();
}
function Ie(t, o) {
  let s = Math.round(t * 64),
    a = Math.round(o * 64),
    c = document.createElement("canvas");
  c.width = s, c.height = a;
  let i = c.getContext("2d");
  i.fillStyle = "#ffffff", i.fillRect(0, 0, s, a);
  let r = 38,
    f = r + 38;
  i.fillStyle = "#ff4da6";
  let l = s + a;
  for (let u = -l; u < l; u += f) i.beginPath(), i.moveTo(u, 0), i.lineTo(u + r, 0), i.lineTo(u + r - a, a), i.lineTo(u - a, a), i.closePath(), i.fill();
  let m = new THREE.CanvasTexture(c);
  return m.wrapS = THREE.RepeatWrapping, m.wrapT = THREE.RepeatWrapping, m;
}
function Ae() {
  let t = Qe(),
    o = document.createElement("canvas");
  o.width = 256, o.height = 256;
  let e = o.getContext("2d"),
    s = 128,
    a = 128;
  e.beginPath(), e.arc(s, a, 126, 0, Math.PI * 2), e.fillStyle = t, e.fill(), e.beginPath(), e.arc(s, a, 110, 0, Math.PI * 2), e.strokeStyle = "#FFD93D", e.lineWidth = 6, e.stroke(), e.beginPath();
  for (let c = 0; c < 5; c++) {
    let i = -Math.PI / 2 + c * 2 * Math.PI / 5,
      r = i + Math.PI / 5,
      d = s + Math.cos(i) * 55,
      f = a + Math.sin(i) * 55,
      l = s + Math.cos(r) * 22,
      m = a + Math.sin(r) * 22;
    c === 0 ? e.moveTo(d, f) : e.lineTo(d, f), e.lineTo(l, m);
  }
  return e.closePath(), e.fillStyle = "#FFFFFF", e.fill(), e.strokeStyle = "#FFD93D", e.lineWidth = 3, e.stroke(), new THREE.CanvasTexture(o);
}
function ct() {
  let t = new THREE.Group(),
    o = new THREE.CylinderGeometry(.95, .95, .1, 32),
    e = ke(),
    s = new THREE.MeshLambertMaterial({
      color: e,
      emissive: e,
      emissiveIntensity: .15
    }),
    a = Ae(),
    c = new THREE.MeshBasicMaterial({
      map: a
    }),
    i = new THREE.Mesh(o, [s, c, c]);
  i.castShadow = !1, t.add(i);
  let r = new THREE.TorusGeometry(.89, .06, 12, 32),
    d = new THREE.MeshLambertMaterial({
      color: 16774628,
      emissive: 16774628,
      emissiveIntensity: .2
    }),
    f = new THREE.Mesh(r, d);
  f.rotation.x = Math.PI / 2, t.add(f);
  let l = new THREE.TorusGeometry(1.06, .08, 8, 24),
    m = new THREE.MeshBasicMaterial({
      color: e,
      transparent: !0,
      opacity: .2
    }),
    u = new THREE.Mesh(l, m);
  u.rotation.x = Math.PI / 2, t.add(u), t.userData.glow = u, t.userData.baseY = 2, t.position.set(n.throwerPos.x, 2, n.throwerPos.z), E.add(t), F = t;
  let h = new THREE.Group(),
    w = 2.2,
    v = 2.2,
    L = v + 4,
    T = new THREE.CylinderGeometry(.1, .1, L, 8),
    I = new THREE.MeshLambertMaterial({
      color: 16777215,
      emissive: 16777215,
      emissiveIntensity: .1
    }),
    R = new THREE.Mesh(T, I);
  R.position.y = L / 2, R.castShadow = !1, h.add(R);
  let P = new THREE.PlaneGeometry(w, v, 16, 10),
    x = new THREE.TextureLoader().load("./_remote/c94973c845238843/logo-tWUf4VMivC-LsnBT6yvPuSv2dGwErmc3NtKVz4DVw.webp"),
    M = new THREE.MeshBasicMaterial({
      map: x,
      side: THREE.DoubleSide,
      transparent: !0
    }),
    g = new THREE.Mesh(P, M);
  g.position.set(w / 2, L - v / 2, 0), g.castShadow = !1, h.add(g), h.userData.flag = g, h.userData.flagGeometry = P, h.userData.flagOriginalPositions = [];
  let b = P.attributes.position;
  for (let y = 0; y < b.count; y++) h.userData.flagOriginalPositions.push({
    x: b.getX(y),
    y: b.getY(y),
    z: b.getZ(y)
  });
  h.position.copy(n.receiverPos), E.add(h), X = h;
}
function lt() {
  let t = new THREE.Group(),
    o = new THREE.CylinderGeometry(.95, .95, .1, 32),
    e = ke(),
    s = new THREE.MeshLambertMaterial({
      color: e,
      emissive: e,
      emissiveIntensity: .15
    }),
    a = Ae(),
    c = new THREE.MeshBasicMaterial({
      map: a
    }),
    i = new THREE.Mesh(o, [s, c, c]);
  i.castShadow = !1, t.add(i);
  let r = new THREE.TorusGeometry(.89, .06, 12, 32),
    d = new THREE.MeshLambertMaterial({
      color: 16774628,
      emissive: 16774628,
      emissiveIntensity: .2
    }),
    f = new THREE.Mesh(r, d);
  f.rotation.x = Math.PI / 2, t.add(f), t.position.copy(n.frisbeePos), E.add(t), D = t;
}
function ft() {
  if (n.phase !== "flying") {
    O.forEach(e => {
      e && (e.visible = !1);
    });
    return;
  }
  let t = .35,
    o = !1;
  A.length === 0 ? o = !0 : o = n.frisbeePos.distanceTo(A[A.length - 1].position) >= t, o && A.push({
    position: n.frisbeePos.clone(),
    rotation: n.frisbeeRotation,
    age: 0
  }), A.length > 35 && A.shift(), A.forEach(e => {
    e.age += .035;
  }), dt();
}
function dt() {
  if (A.length < 2) {
    O.forEach(e => {
      e && (e.visible = !1);
    });
    return;
  }
  let t = [new THREE.Color(16711935), new THREE.Color(16711808), new THREE.Color(16729344), new THREE.Color(16766720), new THREE.Color(65416), new THREE.Color(65535), new THREE.Color(35071)],
    o = new THREE.SphereGeometry(1, 8, 8);
  for (let e = 0; e < A.length; e++) {
    let s = A[e];
    if (!s) continue;
    let a = 1 - s.age;
    if (a <= 0 || e === A.length - 1) continue;
    let i = e / Math.max(1, A.length - 1) * (t.length - 1),
      r = Math.floor(i),
      d = Math.min(r + 1, t.length - 1),
      f = new THREE.Color();
    f.lerpColors(t[r], t[d], i - r);
    let l = Math.min(1, s.age * 5);
    if (e < O.length && O[e]) {
      let m = O[e];
      m.visible = !0;
      let u = .55 * a * l;
      m.scale.set(u, u, u), m.material.color.copy(f), m.material.emissive && m.material.emissive.copy(f), m.material.opacity = a * .95, m.position.copy(s.position);
    } else {
      let m = new THREE.MeshBasicMaterial({
          color: f,
          transparent: !0,
          opacity: a * .95,
          depthWrite: !1
        }),
        u = new THREE.Mesh(o, m);
      u.renderOrder = -1, E.add(u), O.push(u);
      let h = .55 * a * l;
      u.scale.set(h, h, h), u.position.copy(s.position);
    }
  }
  for (let e = A.length; e < O.length; e++) O[e] && (O[e].visible = !1);
}
function ue() {
  A = [], O.forEach(t => {
    t.visible = !1;
  });
}
function ut(t) {
  let o = [16716947, 16766720, 65535, 16738740, 16776960, 16711935, 65416, 16746496],
    e = new THREE.SphereGeometry(.15, 4, 4);
  for (let s = 0; s < 20; s++) {
    let a = Math.random() * Math.PI * 2,
      c = Math.random() * Math.PI,
      i = 8 + Math.random() * 6,
      r = new THREE.Vector3(Math.sin(c) * Math.cos(a) * i, Math.sin(c) * Math.sin(a) * i, Math.cos(c) * i),
      d = o[Math.floor(Math.random() * o.length)],
      f = new THREE.MeshBasicMaterial({
        color: d,
        transparent: !0,
        opacity: 1
      }),
      l = new THREE.Mesh(e, f);
    l.position.copy(t), E.add(l), ce.push({
      mesh: l,
      velocity: r,
      lifetime: 0,
      maxLifetime: 1.5 + Math.random() * .5,
      initialColor: d,
      trail: []
    });
  }
}
function mt(t) {
  let o = new THREE.Vector3(),
    e = new THREE.Vector3();
  for (let s = ce.length - 1; s >= 0; s--) {
    let a = ce[s];
    if (a.lifetime += t, a.lifetime >= a.maxLifetime) {
      E.remove(a.mesh), a.mesh.geometry.dispose(), a.mesh.material.dispose(), ce.splice(s, 1);
      continue;
    }
    o.set(0, -15 * t, 0), a.velocity.add(o), e.copy(a.velocity).multiplyScalar(t), a.mesh.position.add(e);
    let c = a.lifetime / a.maxLifetime;
    a.mesh.material.opacity = 1 - c;
    let i = 1 - c * .5;
    a.mesh.scale.set(i, i, i);
  }
}
function K(t) {
  t.traverse(o => {
    o.geometry && o.geometry.dispose();
    let e = o.material;
    e && (Array.isArray(e) ? e.forEach(s => s.dispose()) : e.dispose());
  });
}
function ye() {
  ae.forEach(f => {
    E.remove(f), K(f);
  }), ae = [], ie.forEach(f => {
    E.remove(f), K(f);
  }), ie = [];
  let t = new THREE.CylinderGeometry(1.5, 1.5, .1, 16),
    o = new THREE.MeshLambertMaterial({
      color: 16777215
    }),
    e = new THREE.Mesh(t, o);
  e.position.set(n.throwerPos.x, .05, n.throwerPos.z), e.receiveShadow = !1, E.add(e), ae.push(e);
  let s = new THREE.Mesh(t, o);
  s.position.set(n.receiverPos.x, .05, n.receiverPos.z), s.receiveShadow = !1, E.add(s), ae.push(s);
  let a = new THREE.MeshBasicMaterial({
      color: 16777215
    }),
    c = new THREE.PlaneGeometry(24, .15),
    i = new THREE.Mesh(c, a);
  i.rotation.x = -Math.PI / 2, i.position.set(0, .02, n.throwerPos.z), E.add(i), ie.push(i);
  let r = new THREE.PlaneGeometry(24, .15),
    d = new THREE.Mesh(r, a);
  d.rotation.x = -Math.PI / 2, d.position.set(0, .02, n.receiverPos.z), E.add(d), ie.push(d);
}
function ht(t) {
  let o = new THREE.Group(),
    e = new THREE.TorusGeometry(t, .15, 16, 48),
    s = new THREE.MeshPhongMaterial({
      color: 16763904,
      emissive: 16746496,
      emissiveIntensity: .7,
      specular: 16777215,
      shininess: 120,
      transparent: !0,
      opacity: .95
    }),
    a = new THREE.Mesh(e, s);
  o.add(a);
  let c = new THREE.TorusGeometry(t - .04, .07, 8, 48),
    i = new THREE.MeshBasicMaterial({
      color: 16772744,
      transparent: !0,
      opacity: .6
    }),
    r = new THREE.Mesh(c, i);
  o.add(r);
  let d = new THREE.TorusGeometry(t + .08, .1, 8, 48),
    f = new THREE.MeshBasicMaterial({
      color: 16755251,
      transparent: !0,
      opacity: .25
    }),
    l = new THREE.Mesh(d, f);
  o.add(l);
  let m = new THREE.SphereGeometry(.08, 8, 8),
    u = [16772676, 16737792, 16763904, 16772676, 16737792, 16763904];
  for (let L = 0; L < 6; L++) {
    let T = L / 6 * Math.PI * 2,
      I = new THREE.MeshBasicMaterial({
        color: u[L],
        transparent: !0,
        opacity: .85
      }),
      R = new THREE.Mesh(m, I);
    R.position.set(Math.cos(T) * t, Math.sin(T) * t, 0), R.userData.orbitAngle = T, R.userData.orbitRadius = t, o.add(R);
  }
  let h = new THREE.OctahedronGeometry(.15, 0),
    w = new THREE.MeshBasicMaterial({
      color: 16777215,
      transparent: !0,
      opacity: .8
    }),
    v = new THREE.Mesh(h, w);
  return v.userData.isSparkle = !0, o.add(v), o;
}
function Me() {
  Q.forEach(l => {
    E.remove(l.mesh), K(l.mesh);
  }), Q = [], j.forEach(l => {
    E.remove(l.mesh), K(l.mesh);
  }), j = [], ee.forEach(l => {
    E.remove(l.mesh), K(l.mesh);
  }), ee = [];
  let t = window.gameConfig,
    o = t.baseDistance || 28,
    e;
  n.score === 0 ? e = 1 : e = Math.min(6, 2 + Math.floor((n.score - 1) / 3));
  let s = (t.poleSpeedMultiplier || 1) * (1 + n.score * .1);
  n.poleCount = e, n.poleSpeed = s;
  let a = 9133302,
    c = 16766720,
    i = [];
  for (let l = 0; l < e; l++) {
    let m = n.score >= 3 && (l === 0 || i[l - 1] !== "wall") && Math.random() < .35;
    i.push(m ? "wall" : "pole");
  }
  let r = i.map((l, m) => l === "pole" ? m : -1).filter(l => l >= 0),
    d = 0;
  r.length >= 3 && (d = Math.max(1, Math.floor(r.length * .4)));
  let f = new Set();
  for (; f.size < d && f.size < r.length;) f.add(r[Math.floor(Math.random() * r.length)]);
  for (let l = 0; l < e; l++) {
    let m = n.throwerPos.z + o * (l + 1) / (e + 1);
    if (i[l] === "wall") {
      if (n.score >= 6 && Math.random() < .5) {
        let R = new THREE.Group(),
          P = [];
        for (let x = 0; x < 4; x++) {
          let M = new THREE.Group(),
            g = 6 - .15,
            b = new THREE.BoxGeometry(g, 4.5, .5),
            y = Ie(g, 4.5),
            H = new THREE.MeshLambertMaterial({
              map: y
            }),
            S = new THREE.Mesh(b, H);
          S.castShadow = !1, M.add(S);
          let C = new THREE.BoxGeometry(6 - .05, .35, .5 + .1),
            z = new THREE.MeshLambertMaterial({
              color: 14024814,
              emissive: 14024814,
              emissiveIntensity: .25
            }),
            B = new THREE.Mesh(C, z);
          B.position.y = 4.5 / 2 + .15, M.add(B);
          let Z = -24 / 2 + 6 / 2 + x * 6;
          M.position.x = Z, R.add(M), P.push(M);
        }
        R.position.set(0, -4.5, m), E.add(R), j.push({
          mesh: R,
          maxY: 2 + Math.random() * 1.5,
          speed: .8 + Math.random() * .6,
          phase: Math.random() * Math.PI * 2,
          width: 24,
          height: 4.5,
          isSplit: !0,
          segments: P
        });
      } else {
        let T = new THREE.Group(),
          I = new THREE.BoxGeometry(24, 4.5, .5),
          R = Ie(24, 4.5),
          P = new THREE.MeshLambertMaterial({
            map: R
          }),
          x = new THREE.Mesh(I, P);
        x.castShadow = !1, T.add(x);
        let M = new THREE.BoxGeometry(24 + .1, .35, .5 + .1),
          g = new THREE.MeshLambertMaterial({
            color: 14024814,
            emissive: 14024814,
            emissiveIntensity: .25
          }),
          b = new THREE.Mesh(M, g);
        b.position.y = 4.5 / 2 + .15, T.add(b), T.position.set(0, -4.5, m), E.add(T), j.push({
          mesh: T,
          maxY: 2 + Math.random() * 1.5,
          speed: .8 + Math.random() * .6,
          phase: Math.random() * Math.PI * 2,
          width: 24,
          height: 4.5
        });
      }
    } else {
      let u = new THREE.Group(),
        h = 3,
        w = .75,
        v = .8,
        L = w * 2 * v * .85,
        T = L * (h - 1) + w * 2 * v,
        I = new THREE.SphereGeometry(w, 14, 10),
        R = [8141549, 9133302, 10980346];
      for (let y = 0; y < h; y++) {
        let H = new THREE.MeshLambertMaterial({
            color: R[y],
            emissive: R[y],
            emissiveIntensity: .15
          }),
          S = new THREE.Mesh(I, H);
        S.scale.set(1, v, 1), S.position.y = w * v + y * L, S.castShadow = !1, u.add(S);
      }
      let P = new THREE.CylinderGeometry(.8, .85, .3, 10),
        x = new THREE.MeshLambertMaterial({
          color: c,
          emissive: c,
          emissiveIntensity: .2
        }),
        M = new THREE.Mesh(P, x);
      M.position.y = .15, u.add(M);
      let g = 18 - n.score * .2,
        b = (Math.random() - .5) * g;
      u.position.set(b, 0, m), E.add(u), Q.push({
        mesh: u,
        baseX: 0,
        range: 10,
        speed: s * (.8 + Math.random() * .4),
        phase: Math.random() * Math.PI * 2,
        direction: Math.random() > .5 ? 1 : -1,
        canPause: f.has(l),
        isPaused: !1,
        pauseTimer: 0,
        pauseDuration: 1,
        lastDirection: 0,
        pauseCooldown: 0,
        pauseCooldownDuration: 2,
        pausedPosition: 0
      });
    }
  }
  if (n.score >= 1 && Math.random() < .4) {
    let l = n.throwerPos.z + o * (.3 + Math.random() * .4),
      m = (Math.random() - .5) * 12,
      u = 2,
      h = 1.4,
      w = ht(h);
    w.position.set(m, u, l), w.rotation.y = 0, E.add(w), ee.push({
      mesh: w,
      zPos: l,
      xPos: m,
      yPos: u,
      radius: h,
      collected: !1,
      rotationSpeed: .5 + Math.random() * .5
    });
  }
}
function pt(t) {
  let o = performance.now() / 1e3;
  Q.forEach(e => {
    if (e.pauseCooldown > 0 && (e.pauseCooldown -= t), e.canPause && !e.isPaused && e.pauseCooldown <= 0) {
      let s = Math.sin(o * e.speed + e.phase);
      Math.abs(s) < .15 && Math.random() < .5 && (e.isPaused = !0, e.pauseTimer = 0, e.lastDirection = s < 0 ? -1 : 1, e.pausedPosition = e.mesh.position.x);
    }
    e.isPaused ? (e.pauseTimer += t, e.mesh.position.x = e.pausedPosition, e.pauseTimer >= e.pauseDuration && (e.isPaused = !1, e.pauseCooldown = e.pauseCooldownDuration, e.phase = Math.asin((e.pausedPosition - e.baseX) / e.range) - o * e.speed)) : e.mesh.position.x = e.baseX + Math.sin(o * e.speed + e.phase) * e.range;
  });
}
function gt() {
  let t = performance.now() / 1e3;
  j.forEach(o => {
    let e = -o.height / 2,
      s = o.maxY - o.height / 2;
    if (o.isSplit && o.segments) o.mesh.position.y = 0, o.segments.forEach((a, c) => {
      let i = c % 2 === 0 ? 0 : Math.PI,
        r = (Math.sin(t * o.speed + o.phase + i) + 1) / 2;
      a.position.y = e + r * (s - e);
    });else {
      let a = (Math.sin(t * o.speed + o.phase) + 1) / 2;
      o.mesh.position.y = e + a * (s - e);
    }
  });
}
function Et() {
  let t = n.frisbeePos;
  for (let o of Q) {
    let e = o.mesh.position;
    if (Math.abs(t.z - e.z) < .8 && t.y > 0 && t.y < 5 && Math.abs(t.x - e.x) < .6 + .7) return o;
  }
  for (let o of j) {
    let e = o.mesh.position;
    if (o.isSplit && o.segments) {
      let s = o.width / o.segments.length;
      for (let a of o.segments) {
        let c = e.x + a.position.x,
          i = a.position.y,
          r = i + o.height / 2,
          d = Math.max(0, i - o.height / 2);
        if (!(r <= 0) && Math.abs(t.z - e.z) < .5 + .5 && Math.abs(t.x - c) < s / 2 + .5 && t.y > d - .5 && t.y < r + .5) return o;
      }
    } else {
      let s = e.y + o.height / 2,
        a = Math.max(0, e.y - o.height / 2),
        c = .5;
      if (s <= 0) continue;
      if (Math.abs(t.z - e.z) < c + .5 && t.y > a - .5 && t.y < s + .5) return o;
    }
  }
  return null;
}
function bt() {
  let t = n.frisbeePos,
    o = xe;
  for (let e of ee) {
    if (e.collected) continue;
    let s = Math.min(o.z, t.z) - 1.5,
      a = Math.max(o.z, t.z) + 1.5;
    if (e.zPos >= s && e.zPos <= a) {
      let i = t.z - o.z,
        r,
        d;
      if (Math.abs(i) > .001) {
        let u = (e.zPos - o.z) / i,
          h = Math.max(0, Math.min(1, u));
        r = o.x + (t.x - o.x) * h, d = o.y + (t.y - o.y) * h;
      } else r = t.x, d = t.y;
      let f = r - e.xPos,
        l = d - e.yPos;
      if (Math.sqrt(f * f + l * l) < e.radius * 1.2) {
        e.collected = !0, n.multiplier++, Ve();
        let u = document.getElementById("combo-display");
        u.textContent = `\xD7${n.multiplier}`, u.style.color = "#00e5ff", u.style.textShadow = "0 0 20px #00e5ff, 0 0 40px #7c4dff, 0 2px 0 #111, 0 3px 10px rgba(0,0,0,0.9)", u.classList.add("visible"), setTimeout(() => {
          u.classList.remove("visible"), u.style.color = "#FFD54F", u.style.textShadow = "";
        }, 800), tt();
        wt(e);
      }
    }
  }
}
function wt(t) {
  let o = t.mesh,
    e = o.scale.x,
    s = performance.now(),
    a = 300;
  function c() {
    let i = performance.now() - s,
      r = Math.min(1, i / a),
      d = e * (1 + r * .5);
    o.scale.set(d, d, d), o.traverse(f => {
      if (f.material) {
        let l = f.material;
        l.transparent !== void 0 && (l.transparent = !0, l.opacity = 1 - r);
      }
    }), r < 1 ? requestAnimationFrame(c) : (E.remove(o), K(o));
  }
  c();
}
function yt(t) {
  let o = (t || performance.now()) * .001;
  for (let e of ee) e.collected || (e.mesh.position.y = e.yPos + Math.sin(o * 1.8 + e.zPos) * .15, e.mesh.rotation.y = Math.sin(o * .6 + e.zPos) * .35, e.mesh.children.forEach(s => {
    if (s.userData.orbitAngle !== void 0) {
      let a = s.userData.orbitAngle + o * 2,
        c = s.userData.orbitRadius;
      s.position.set(Math.cos(a) * c, Math.sin(a) * c, 0);
    }
    if (s.userData.isSparkle) {
      s.rotation.y = o * 3, s.rotation.x = o * 2;
      let a = .8 + Math.sin(o * 4) * .2;
      s.scale.set(a, a, a);
    }
  }));
}
function Ve() {
  let t = document.getElementById("multiplier-display");
  t && (n.multiplier > 1 ? (t.textContent = `\xD7${n.multiplier}`, t.style.display = "block") : t.style.display = "none");
}
function pe() {
  if (n.phase !== "aiming") return;
  let t = window.gameConfig,
    o = n.dragCurrent.x - n.dragStart.x,
    e = n.dragCurrent.y - n.dragStart.y,
    s = Math.sqrt(o * o + e * e),
    a = n.throwerPos.clone();
  a.y = 2;
  let c = n.receiverPos.clone();
  c.y = 2;
  let i = Math.min(s / 100, 2) * (t.frisbeeSpeedMultiplier || 1),
    r = -(o / s) * i * 15,
    f = Math.abs(e / s) * i * 5,
    l = (a.z + c.z) / 2,
    m = new THREE.Vector3(a.x + r, 2, l + f);
  n.curvePath = {
    start: a,
    control: m,
    end: c,
    progress: 0,
    duration: 1
  }, n.phase = "flying", n.frisbeePos.copy(a), xe.copy(a), n.isDragging = !1, D.visible = !0, D.position.copy(a), F.visible = !1, st();
  let u = document.getElementById("trajectory-canvas");
  u.getContext("2d").clearRect(0, 0, u.width, u.height);
}
var xe = new THREE.Vector3();
function Mt(t) {
  if (n.phase !== "flying" || !n.curvePath) return;
  xe.copy(n.frisbeePos), n.curvePath.progress += t / n.curvePath.duration;
  let o = Math.min(1, Math.max(0, n.curvePath.progress)),
    e = 1 - o,
    {
      start: s,
      control: a,
      end: c
    } = n.curvePath,
    i = new THREE.Vector3(e * e * s.x + 2 * e * o * a.x + o * o * c.x, e * e * s.y + 2 * e * o * a.y + o * o * c.y, e * e * s.z + 2 * e * o * a.z + o * o * c.z);
  n.frisbeePos.copy(i);
  let r = new THREE.Vector3(2 * e * (a.x - s.x) + 2 * o * (c.x - a.x), 2 * e * (a.y - s.y) + 2 * o * (c.y - a.y), 2 * e * (a.z - s.z) + 2 * o * (c.z - a.z));
  n.frisbeeRotation += t * 10, D.position.copy(n.frisbeePos), D.rotation.y = n.frisbeeRotation, D.rotation.z = Math.sin(Math.atan2(r.x, r.z)) * .3, ft(), bt();
  let d = Et();
  if (d) {
    Tt(d);
    return;
  }
  if (o >= 1) {
    xt();
    return;
  }
}
function xt() {
  n.score += n.multiplier;
  let t = n.receiverPos.clone();
  t.y = 3, ut(t), document.getElementById("score-value").textContent = String(n.score);
  let o = document.getElementById("combo-display"),
    e = ["NICE CATCH!", "ON FIRE!", "BULLSEYE!", "SMOOTH!", "NAILED IT!", "TOO EASY!", "UNSTOPPABLE!", "WICKED!", "EPIC THROW!", "STELLAR!", "BOOM!", "FLAWLESS!", "LEGEND!", "SAVAGE!", "CLUTCH!"],
    s = ["#FFFFFF", "#FFE082", "#B3E5FC"],
    a = e[Math.floor(Math.random() * e.length)],
    c = s[Math.floor(Math.random() * s.length)];
  o.textContent = a, o.style.color = c, o.classList.add("visible"), setTimeout(() => {
    o.classList.remove("visible"), o.style.color = "#FFD54F";
  }, 800), ue(), O.forEach(i => {
    i && (i.visible = !1);
  }), D.visible = !1, F.visible = !1, n.phase = "transitioning", n.transitionProgress = 0;
}
function vt(t) {
  if (n.phase === "transitioning") if (n.transitionProgress += t * 2, n.transitionProgress >= 1) {
    let o = window.gameConfig.baseDistance || 28;
    n.throwerPos.copy(n.receiverPos), n.receiverPos.z += o, n.frisbeePos.set(n.throwerPos.x + .91, 2.1, n.throwerPos.z + .28), n.frisbeeVel.set(0, 0, 0), ue(), F.position.copy(n.throwerPos), X.position.copy(n.receiverPos), D.position.copy(n.frisbeePos), D.rotation.set(0, 0, 0), n.frisbeeRotation = 0, G.position.set(n.throwerPos.x, 16, n.throwerPos.z - 10), G.lookAt(n.throwerPos.x, 0, n.throwerPos.z + 10), ye(), Me();
    let e = n.throwerPos.z + 10;
    W.position.z = e, $.position.z = n.throwerPos.z, k.forEach(s => {
      s.position.z = s.userData.baseZOffset !== void 0 ? e + s.userData.baseZOffset : e;
    }), n.phase = "aiming";
  } else {
    let o = n.transitionProgress,
      e = o * o * (3 - 2 * o),
      s = n.throwerPos.z - 10,
      a = n.receiverPos.z - 10;
    G.position.y = 16, G.position.z = s + (a - s) * e, G.lookAt(0, 0, G.position.z + 22);
  }
}
function Tt(t) {
  n.lives--, ot(), We();
  let o = document.getElementById("combo-display"),
    e = ["FAIL!", "MISS!", "CRASH!", "OOPS!", "WIPEOUT!"];
  o.textContent = e[Math.floor(Math.random() * e.length)], o.style.color = "#ffffff", o.style.textShadow = "0 0 10px #ff1493, 0 0 20px #ff1493, 0 2px 0 #222, 0 3px 8px rgba(0,0,0,0.9)", o.classList.add("visible"), setTimeout(() => {
    o.classList.remove("visible"), o.style.color = "#FFD54F", o.style.textShadow = "";
  }, 1e3), n.phase = "collision", n.collisionAnimTime = 0, n.collisionStartPos = n.frisbeePos.clone(), n.collisionVelocity = new THREE.Vector3((Math.random() - .5) * 3, 2, n.frisbeeVel.z * .3), n.collisionRotVel = (Math.random() - .5) * 20;
}
function We() {
  for (let t = 1; t <= 3; t++) {
    let o = document.getElementById(`life-${t}`);
    o && (t > n.lives ? o.classList.add("lost") : o.classList.remove("lost"));
  }
}
function Rt(t) {
  if (n.phase !== "collision") return;
  n.collisionAnimTime += t;
  let o = n.collisionAnimTime,
    s = .6 * Math.exp(-o * 4),
    a = 25,
    c = 18,
    i = Math.sin(o * a) * s,
    r = Math.cos(o * c) * s * .6;
  G.position.set(n.throwerPos.x + i, 16 + r, n.throwerPos.z - 10), G.lookAt(n.throwerPos.x + i * .3, 0, n.throwerPos.z + 10), n.collisionVelocity && (n.collisionVelocity.y -= 15 * t, n.frisbeePos.x += n.collisionVelocity.x * t, n.frisbeePos.y += n.collisionVelocity.y * t, n.frisbeePos.z += n.collisionVelocity.z * t), n.frisbeeRotation += n.collisionRotVel * t, D.rotation.y = n.frisbeeRotation, D.rotation.x += t * 8, D.rotation.z += t * 6, D.position.copy(n.frisbeePos), (n.frisbeePos.y < -2 || n.collisionAnimTime > 1.5) && (n.lives <= 0 ? Ht() : (n.phase = "aiming", n.frisbeePos.set(n.throwerPos.x, 2, n.throwerPos.z), D.position.copy(n.frisbeePos), D.rotation.set(0, 0, 0), ue()));
}
async function Ht() {
  n.phase = "gameover", Fe();
  if (n.score > n.bestScore) {
    n.bestScore = n.score, document.getElementById("best-value").textContent = String(n.bestScore);
    let o = (await readLocalState())?.state || {};
    o.bestScore = n.bestScore, fe && (o.selectedFrisbee = fe), await writeLocalState(o);
  }
  void 0, showLocalResult();
}
function de() {
  document.getElementById("game-over-screen").style.display = "none";
  ue(), n.score = 0, n.combo = 1, n.lives = 3, n.multiplier = 1, n.phase = "aiming", We(), Ve(), n.throwerPos.set(0, 0, 0), n.receiverPos.set(0, 0, window.gameConfig.baseDistance || 28), n.frisbeePos.set(0, 2, 0), n.frisbeeVel.set(0, 0, 0), n.frisbeeRotation = 0, F.position.copy(n.throwerPos), X.position.copy(n.receiverPos), D.position.copy(n.frisbeePos), D.rotation.set(0, 0, 0), G.position.set(0, 16, -10), G.lookAt(0, 0, 10), W.position.z = 10, document.getElementById("score-value").textContent = "0";
  let t = document.getElementById("tutorial-message");
  t && t.classList.add("visible"), ye(), Me(), te();
}
function Ee() {
  let t = document.getElementById("trajectory-canvas"),
    o = t.getContext("2d");
  if (o.clearRect(0, 0, t.width, t.height), n.phase !== "aiming" || !n.isDragging) return;
  let e = n.dragCurrent.x - n.dragStart.x,
    s = n.dragCurrent.y - n.dragStart.y,
    a = Math.sqrt(e * e + s * s);
  if (a < 10) return;
  let c = window.gameConfig,
    i = n.throwerPos.clone();
  i.y = 2;
  let r = n.receiverPos.clone();
  r.y = 2;
  let d = Math.min(a / 100, 2) * (c.frisbeeSpeedMultiplier || 1),
    f = -(e / a) * d * 15,
    m = Math.abs(s / a) * d * 5,
    u = (i.z + r.z) / 2,
    h = new THREE.Vector3(i.x + f, 2, u + m),
    w = V.getPixelRatio(),
    v = t.width / w,
    L = t.height / w,
    T = new THREE.Vector3();
  function I(M) {
    return T.copy(M).project(G), T.z < -1 || T.z > 1 ? null : {
      x: (T.x + 1) / 2 * v,
      y: (-T.y + 1) / 2 * L
    };
  }
  let R = 18,
    P = [];
  for (let M = 0; M <= R; M++) {
    let g = M / R,
      b = 1 - g,
      y = b * b * i.x + 2 * b * g * h.x + g * g * r.x,
      H = b * b * i.y + 2 * b * g * h.y + g * g * r.y,
      S = b * b * i.z + 2 * b * g * h.z + g * g * r.z,
      C = I(new THREE.Vector3(y, H, S));
    C && P.push(C);
  }
  if (P.length < 2) return;
  let x = [[255, 107, 107], [255, 159, 67], [255, 217, 61], [0, 229, 160], [0, 212, 255], [108, 99, 255], [255, 107, 255]];
  for (let M = 0; M < P.length; M++) {
    let g = M / (P.length - 1),
      b = g * (x.length - 1),
      y = Math.floor(b),
      H = Math.min(y + 1, x.length - 1),
      S = b - y,
      C = Math.round(x[y][0] + (x[H][0] - x[y][0]) * S),
      z = Math.round(x[y][1] + (x[H][1] - x[y][1]) * S),
      B = Math.round(x[y][2] + (x[H][2] - x[y][2]) * S),
      Z = .35 + .55 * g,
      U = 3 + 1.2 * (1 - g);
    o.beginPath(), o.arc(P[M].x, P[M].y, U + 3, 0, Math.PI * 2), o.fillStyle = `rgba(${C}, ${z}, ${B}, ${Z * .2})`, o.fill(), o.beginPath(), o.arc(P[M].x, P[M].y, U, 0, Math.PI * 2), o.fillStyle = `rgba(${C}, ${z}, ${B}, ${Z})`, o.fill();
  }
}
function St() {
  let t = document.getElementById("game-canvas"),
    o = document.getElementById("tutorial-message"),
    e = 40;
  t.addEventListener("touchstart", s => {
    if (s.preventDefault(), n.phase === "aiming") {
      let a = s.touches[0];
      n.isDragging = !0, n.dragStart = {
        x: a.clientX,
        y: a.clientY
      }, n.dragCurrent = {
        x: a.clientX,
        y: a.clientY
      }, o && o.classList.remove("visible");
    }
    ze();
  }), t.addEventListener("touchmove", s => {
    if (s.preventDefault(), n.isDragging && n.phase === "aiming") {
      let a = s.touches[0];
      n.dragCurrent = {
        x: a.clientX,
        y: a.clientY
      }, Ee();
    }
  }), t.addEventListener("touchend", s => {
    if (s.preventDefault(), n.phase === "aiming" && n.isDragging) {
      let a = n.dragCurrent.x - n.dragStart.x,
        c = n.dragCurrent.y - n.dragStart.y;
      if (Math.sqrt(a * a + c * c) >= e) pe();else {
        n.isDragging = !1;
        let i = document.getElementById("trajectory-canvas");
        i.getContext("2d").clearRect(0, 0, i.width, i.height);
      }
    }
  }), t.addEventListener("touchcancel", s => {
    s.preventDefault(), n.isDragging = !1;
    let a = document.getElementById("trajectory-canvas");
    a.getContext("2d").clearRect(0, 0, a.width, a.height);
  }), t.addEventListener("mousedown", s => {
    n.phase === "aiming" && (n.isDragging = !0, n.dragStart = {
      x: s.clientX,
      y: s.clientY
    }, n.dragCurrent = {
      x: s.clientX,
      y: s.clientY
    }, o && o.classList.remove("visible")), p && p.state === "suspended" && ze();
  }), t.addEventListener("mousemove", s => {
    n.isDragging && n.phase === "aiming" && (n.dragCurrent = {
      x: s.clientX,
      y: s.clientY
    }, Ee());
  }), t.addEventListener("mouseup", () => {
    if (n.phase === "aiming" && n.isDragging) {
      let s = n.dragCurrent.x - n.dragStart.x,
        a = n.dragCurrent.y - n.dragStart.y;
      if (Math.sqrt(s * s + a * a) >= e) pe();else {
        n.isDragging = !1;
        let c = document.getElementById("trajectory-canvas");
        c.getContext("2d").clearRect(0, 0, c.width, c.height);
      }
    }
  }), document.addEventListener("keydown", s => {
    s.code === "Space" && n.phase === "aiming" && (n.dragStart = {
      x: 360,
      y: 640
    }, n.dragCurrent = {
      x: 360,
      y: 540
    }, o && o.classList.remove("visible"), pe());
  }), document.getElementById("restart-btn").addEventListener("click", de), document.getElementById("restart-btn").addEventListener("touchend", s => {
    s.preventDefault(), de();
  }), document.getElementById("frisbee-selector-btn").addEventListener("click", s => {
    s.preventDefault(), be();
  }), document.getElementById("frisbee-selector-btn").addEventListener("touchend", s => {
    s.preventDefault(), s.stopPropagation(), be();
  }), document.getElementById("close-frisbee-selector").addEventListener("click", s => {
    s.preventDefault(), ge();
  }), document.getElementById("close-frisbee-selector").addEventListener("touchend", s => {
    s.preventDefault(), ge();
  }), document.getElementById("frisbee-overlay").addEventListener("click", s => {
    s.target.id === "frisbee-overlay" && ge();
  });
}
function be() {
  let t = document.getElementById("frisbee-overlay"),
    o = document.getElementById("frisbee-options");
  o.innerHTML = "", Ue.forEach(e => {
    let s = document.createElement("div");
    s.className = "frisbee-option";
    let a = window.gameConfig.devMode || n.bestScore >= e.unlockScore,
      c = fe === e.id;
    a || s.classList.add("locked"), c && s.classList.add("selected");
    let i = document.createElement("div");
    i.className = "frisbee-preview", i.style.background = `radial-gradient(circle, #${e.baseColor.toString(16).padStart(6, "0")} 0%, #${e.rimColor.toString(16).padStart(6, "0")} 100%)`, i.style.border = `4px solid #${e.rimColor.toString(16).padStart(6, "0")}`, i.innerHTML = `<span style="font-size: 48px; color: #${e.starColor.toString(16).padStart(6, "0")}; text-shadow: 0 0 8px rgba(255,255,255,0.5);">\u2605</span>`, a || (i.innerHTML += '<div class="lock-icon">\u{1F512}</div>'), s.appendChild(i);
    let r = document.createElement("div");
    r.className = "frisbee-name", r.textContent = e.name, s.appendChild(r);
    let d = document.createElement("div");
    d.className = "frisbee-unlock", d.textContent = a ? c ? "\u2713 Selected" : "Unlocked" : `Score ${e.unlockScore}+`, s.appendChild(d), a && s.addEventListener("click", () => {
      fe = e.id, Dt(e.id), be();
    }), o.appendChild(s);
  }), t.classList.add("visible");
}
function ge() {
  document.getElementById("frisbee-overlay").classList.remove("visible");
}
async function Ct() {
  try {
    let t = await readLocalState();
    t && t.state && t.state.bestScore && (n.bestScore = t.state.bestScore, document.getElementById("best-value").textContent = String(n.bestScore));
  } catch {
    void 0;
  }
}
async function Dt(t) {
  try {
    let e = (await readLocalState())?.state || {};
    e.selectedFrisbee = t, await writeLocalState(e);
  } catch (o) {
    void 0;
  }
}
function Gt() {
  document.getElementById("edit-indicator").classList.add("visible"), Fe();
}
function Lt() {
  document.getElementById("edit-indicator").classList.remove("visible"), te();
}
function ze() {
  !p || p.state !== "suspended" || p.resume().then(() => {
    !_ || _.context.state, te();
  }).catch(() => {});
}
function Oe(t) {
  let o = Math.min(.11, (t - Se) / 1e3);
  if (Se = t, Be === "play") {
    let s = document.getElementById("tutorial-message");
    s && (n.score === 0 && n.phase === "aiming" ? s.classList.add("visible") : s.classList.remove("visible"));
    let a = n.frisbeePos.x,
      c = n.frisbeePos.z;
    if (re.position.set(a, 20, c + 10), pt(o), gt(), yt(t), Mt(o), vt(o), Rt(o), mt(o), n.phase === "aiming") {
      F.visible = !0;
      let i = t / 1e3,
        r = Math.sin(i * 2) * .15,
        d = Math.sin(i * 1.5) * .1;
      if (n.frisbeePos.copy(n.throwerPos), n.frisbeePos.y = F.userData.baseY + r, D.visible = !1, F.position.copy(n.throwerPos), F.position.y = F.userData.baseY + r, F.rotation.z = d, F.userData.glow) {
        let f = 1 + Math.sin(i * 3) * .1;
        F.userData.glow.scale.set(f, f, f), F.userData.glow.material.opacity = .2 + Math.sin(i * 3) * .1;
      }
    }
    if (X && X.userData.flag) {
      let i = X.userData.flagGeometry,
        r = X.userData.flagOriginalPositions,
        d = t / 1e3,
        f = i.attributes.position;
      for (let l = 0; l < f.count; l++) {
        let m = r[l].x,
          u = r[l].y,
          h = i.parameters.width / 2,
          w = Math.max(0, Math.min(1, (m + h) / (h * 2))),
          v = Math.sin(d * 3 + m * 2.5) * .25,
          L = Math.sin(d * 5 + m * 4 + u) * .15,
          T = Math.sin(d * 7 + u * 3) * .08,
          I = Math.pow(w, 1.8),
          R = Math.sin(d * 4 + u * 2) * .1 * I,
          P = (v + L + T) * I;
        f.setZ(l, P), f.setX(l, m + R * .5);
      }
      f.needsUpdate = !0;
    }
    if (t - Ce > 100) {
      let i = n.throwerPos.z + 10;
      k.forEach(r => {
        r.position.z = r.userData.baseZOffset !== void 0 ? i + r.userData.baseZOffset : i;
      }), $ && ($.position.z = n.throwerPos.z), W && (W.position.z = i), Ce = t;
    }
    Ee();
  }
  V.render(E, G);
  let e = requestAnimationFrame(Oe);
  window.__frisbee_animFrame = e;
}
async function _e(t, o) {
  void 0, Be = t, o && (p = o.context, je = o.buffers, he = o.gainNode), await et(), n = {
    phase: "aiming",
    score: 0,
    bestScore: 0,
    combo: 1,
    lives: 3,
    throwerPos: new THREE.Vector3(0, 0, 0),
    receiverPos: new THREE.Vector3(0, 0, window.gameConfig.baseDistance || 28),
    frisbeePos: new THREE.Vector3(0, 2, 0),
    frisbeeVel: new THREE.Vector3(0, 0, 0),
    frisbeeRotation: 0,
    isDragging: !1,
    dragStart: {
      x: 0,
      y: 0
    },
    dragCurrent: {
      x: 0,
      y: 0
    },
    throwPower: 0,
    throwAngleH: 0,
    throwAngleV: 0,
    currentDifficulty: 1,
    poleCount: 2,
    poleSpeed: 1,
    gapWidth: 3.5,
    transitionProgress: 0,
    cameraTargetPos: new THREE.Vector3(0, 3, -5),
    throwAnimProgress: 0,
    throwAnimDuration: .25,
    collisionAnimTime: 0,
    collisionRotVel: 0,
    multiplier: 1
  }, void 0, await Ct(), n.receiverPos.set(0, 0, window.gameConfig.baseDistance || 28);
  let e = window.__frisbee_animFrame;
  e && cancelAnimationFrame(e), nt(), St(), De();
  t === "edit" ? Gt() : Lt();
  let s = requestAnimationFrame(Oe);
  window.__frisbee_animFrame = s;
}
async function Ne() {
  return zt();
}
async function zt() {
  const context = new (window.AudioContext || window.webkitAudioContext)();
  const gainNode = context.createGain();
  gainNode.connect(context.destination);
  gainNode.gain.value = .3;
  return {
    context,
    buffers: {},
    gainNode
  };
}
window.gameConfig || (window.gameConfig = {
  ...J.defaults
});
async function Bt() {
  let t = await Ne();
  await _e("play", t), requestAnimationFrame(() => {
    let o = document.getElementById("loading-screen");
    o && (o.style.transition = "opacity 0.3s ease", o.style.opacity = "0", setTimeout(() => {
      o.style.display = "none";
    }, 300));
  });
}
Bt();
async function readLocalState(){try{const raw=localStorage.getItem("frisbee-loop-state");return raw?{state:JSON.parse(raw)}:null;}catch{return null;}}
async function writeLocalState(value){try{localStorage.setItem("frisbee-loop-state",JSON.stringify(value));}catch{}}
function showLocalResult(){document.getElementById("final-score").textContent=String(n.score);document.getElementById("restart-btn").style.display="block";document.getElementById("game-over-screen").style.display="flex";document.getElementById("game-over-screen").classList.add("visible");}
