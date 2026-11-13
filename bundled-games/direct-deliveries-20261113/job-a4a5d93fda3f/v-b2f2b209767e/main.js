import * as S from "./vendor/001-three-0.185.js";
import { EffectComposer as Vc } from "./vendor/003-EffectComposer.js";
import { RenderPass as Ac } from "./vendor/005-RenderPass.js";
import { UnrealBloomPass as Cc } from "./vendor/007-UnrealBloomPass.js";
import { OutputPass as Pc } from "./vendor/009-OutputPass.js";
var Zs = {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0
  },
  si = {
    id: "local",
    name: "Player",
    purchasedItems: []
  },
  ri = {
    player: si,
    players: [si],
    viewContext: "full_screen",
    contentSafeAreaInset: Zs,
    initialGameState: null
  },
  ja = 5e3,
  Wa = ["pointerdown", "keydown", "touchend"],
  Co = null,
  _s = null,
  Ds = null,
  Us = !1,
  js = !1,
  Xt = null,
  Ws = new Set(),
  Ys = new Set();
function Qs(o) {
  Ds = o;
  let e = o.contentSafeAreaInset ?? Zs;
  for (let t of ["top", "right", "bottom", "left"]) document.documentElement.style.setProperty(`--remix-safe-${t}`, `${e[t]}px`);
}
function Qa(o) {
  js = o, Xt && (Xt.output.gain.value = o ? 0 : 1);
  for (let e of [...Ys]) e(o);
}
var ui = Number.NEGATIVE_INFINITY,
  Vt = null,
  Fs = null,
  $s = !1,
  At = !1,
  ai = !1,
  Js = "",
  li = !1,
  Ks = new Set(),
  Xs = new Set(),
  Hn = () => document.pointerLockElement !== null,
  Mn = () => Hn() || At,
  $a = () => navigator.userActivation?.isActive === !0;
function er() {
  let o = Mn();
  if (o !== ai) {
    ai = o;
    for (let e of [...Ks]) e(o);
  }
}
function di() {
  At && (At = !1, Vt && (Vt.style.cursor = Js), er());
}
function pi(o) {
  return Promise.resolve(false);
}
async function Ka(o) {
  return Vt = o, (await pi(o)) ? !0 : $s ? (At = !0, Js = o.style.cursor, o.style.cursor = "none", er(), !0) : !1;
}
function Rn() {
  li || (li = !0, document.addEventListener("pointerdown", () => {
    ui = performance.now(), At && Vt && !Hn() && pi(Vt);
  }, !0), document.addEventListener("pointermove", o => {
    if (!(!Mn() || o.movementX === 0 && o.movementY === 0)) for (let e of [...Xs]) e(o.movementX, o.movementY);
  }), document.addEventListener("pointerlockchange", () => {
    Hn() && At && Vt && (At = !1, Vt.style.cursor = Js), er();
  }), document.addEventListener("keydown", o => {
    o.key === "Escape" && di();
  }));
}
var Q = {
  ready() {
    if (!_s) {
      Rn();
      let saved = null;
      try {
        saved = JSON.parse(localStorage.getItem("gamelab-squadron-settings") || "null");
      } catch {}
      ri.initialGameState = saved ? {
        gameState: saved
      } : null;
      Qs(ri);
      _s = Promise.resolve(ri);
    }
    return _s;
  },
  get info() {
    return Ds;
  },
  get safeArea() {
    return Ds?.contentSafeAreaInset ?? Zs;
  },
  get muted() {
    return js;
  },
  onMute(o) {
    return Ys.add(o), () => Ys.delete(o);
  },
  audio() {
    if (Xt) return Xt;
    let o = new AudioContext(),
      e = o.createGain();
    e.gain.value = js ? 0 : 1, e.connect(o.destination), Xt = {
      context: o,
      output: e
    };
    let t = () => {
      o.state === "suspended" && !document.hidden && o.resume();
    };
    for (let n of Wa) window.addEventListener(n, t, !0);
    return document.addEventListener("visibilitychange", () => {
      document.hidden ? o.suspend() : t();
    }), Xt;
  },
  saveState(o) {
    localStorage.setItem("gamelab-squadron-settings", JSON.stringify(o));
  },
  async lockPointer(o) {
    return Rn(), Mn() ? !0 : ($s ||= performance.now() - ui <= ja || $a(), Fs ??= Ka(o).finally(() => {
      Fs = null, $s = !1;
    }), Fs);
  },
  unlockPointer() {
    Hn() ? document.exitPointerLock() : di();
  },
  get pointerLocked() {
    return Mn();
  },
  onPointerLock(o) {
    return Rn(), Ks.add(o), () => Ks.delete(o);
  },
  onLook(o) {
    return Rn(), Xs.add(o), () => Xs.delete(o);
  }
};
function ue(o) {
  return Object.freeze({
    ...o
  });
}
import * as x from "./vendor/001-three-0.185.js";
import { Lensflare as Xa, LensflareElement as Po } from "./vendor/011-Lensflare.js";
var Ct = new x.Vector3(-0.55, 0.42, -0.72).normalize(),
  Za = new x.Vector3(-0.9, -0.35, 0.1).normalize();
function we(o) {
  return o.userData.shared = !0, o;
}
function Jt(o, e) {
  let t = document.createElement("canvas");
  return t.width = o, t.height = e, [t, t.getContext("2d")];
}
function eo(o) {
  let e = new x.CanvasTexture(o);
  return e.colorSpace = x.SRGBColorSpace, e;
}
var Zt = () => (Math.random() + Math.random() + Math.random() - 1.5) / 1.5;
function to(o, e, t, n, s, r) {
  for (let i of [0, -e, e]) {
    let a = t + i;
    if (a + s < 0 || a - s > e) continue;
    let l = o.createRadialGradient(a, n, 0, a, n, s);
    l.addColorStop(0, r), l.addColorStop(1, "rgba(0,0,0,0)"), o.fillStyle = l, o.fillRect(a - s, n - s, s * 2, s * 2);
  }
}
function Ja() {
  let [t, n] = Jt(2048, 1024),
    s = n.createLinearGradient(0, 0, 0, 1024);
  s.addColorStop(0, "#0a0d17"), s.addColorStop(0.5, "#0c0e13"), s.addColorStop(1, "#06070b"), n.fillStyle = s, n.fillRect(0, 0, 2048, 1024);
  let r = i => 1024 * 0.5 + Math.sin(i / 2048 * Math.PI * 2 + 0.6) * 1024 * 0.22;
  n.globalCompositeOperation = "lighter";
  for (let i = 0; i < 700; i++) {
    let a = Math.random() * 2048,
      l = Math.random() < 0.6 ? "rgba(80,110,200,0.05)" : "rgba(130,85,190,0.05)";
    to(n, 2048, a, r(a) + Zt() * 1024 * 0.06, 20 + Math.random() * 90, l);
  }
  for (let i = 0; i < 160; i++) {
    let a = Math.random() * 2048;
    to(n, 2048, a, r(a) + 1024 * 0.025 + Zt() * 1024 * 0.012, 10 + Math.random() * 30, "rgba(220,160,110,0.035)");
  }
  n.globalCompositeOperation = "source-over";
  for (let i = 0; i < 220; i++) {
    let a = Math.random() * 2048;
    to(n, 2048, a, r(a) + Zt() * 1024 * 0.02, 10 + Math.random() * 40, "rgba(4,5,9,0.2)");
  }
  n.globalCompositeOperation = "lighter";
  for (let i = 0; i < 3e3; i++) {
    let a = Math.random() * 2048,
      l = Math.random() < 0.4 ? r(a) + Zt() * 1024 * 0.08 : Math.random() * 1024;
    n.fillStyle = `rgba(200,210,255,${0.15 + Math.random() * 0.5})`, n.fillRect(a, l, Math.random() < 0.9 ? 1 : 2, 1);
  }
  return eo(t);
}
function tr(o, e) {
  let [t, n] = Jt(o, o),
    s = o / 2,
    r = n.createRadialGradient(s, s, 0, s, s, s);
  for (let [i, a] of e) r.addColorStop(i, a);
  return n.fillStyle = r, n.fillRect(0, 0, o, o), eo(t);
}
function el() {
  let [t, n] = Jt(1024, 512);
  n.fillStyle = "#3a5068", n.fillRect(0, 0, 1024, 512);
  for (let s = 0; s < 120; s++) to(n, 1024, Math.random() * 1024, Math.random() * 512, 30 + Math.random() * 90, "rgba(30,50,75,0.35)");
  for (let s = 0; s < 26; s++) {
    let r = Math.random() * 1024,
      i = 512 * 0.15 + Math.random() * 512 * 0.7;
    for (let a = 0; a < 30; a++) {
      let l = Math.random() < 0.5 ? "rgba(110,100,85,0.45)" : "rgba(90,85,78,0.45)";
      to(n, 1024, r + Zt() * 70, i + Zt() * 40, 8 + Math.random() * 30, l);
    }
  }
  for (let s = 0; s < 260; s++) {
    let r = Math.random() * 1024,
      i = Math.random() * 512;
    n.save(), n.translate(r, i), n.scale(4 + Math.random() * 6, 1), to(n, 1024 * 10, 0, 0, 4 + Math.random() * 12, `rgba(235,240,250,${0.12 + Math.random() * 0.3})`), n.restore();
  }
  return eo(t);
}
var mi = `
varying vec3 vN; varying vec3 vW; varying vec2 vUv;
void main(){ vUv=uv; vN=normalize(mat3(modelMatrix)*normal); vec4 w=modelMatrix*vec4(position,1.); vW=w.xyz;
gl_Position=projectionMatrix*viewMatrix*w; }`;
function tl(o) {
  return we(new x.ShaderMaterial({
    uniforms: {
      map: {
        value: o
      },
      sunDir: {
        value: Ct
      }
    },
    vertexShader: mi,
    fragmentShader: `
uniform sampler2D map; uniform vec3 sunDir; varying vec3 vN; varying vec2 vUv;
void main(){ vec3 n=normalize(vN); float d=dot(n,sunDir);
vec3 tex=texture2D(map,vUv).rgb; float day=smoothstep(-0.12,0.45,d);
vec3 col=tex*(0.012+day*1.5)*vec3(1.0,0.97,0.93);
col+=vec3(1.0,0.45,0.2)*smoothstep(-0.15,0.0,d)*smoothstep(0.22,0.0,d)*0.06;
gl_FragColor=vec4(col,1.);
#include <tonemapping_fragment>
#include <colorspace_fragment>
}`,
    fog: !1
  }));
}
function ol() {
  return we(new x.ShaderMaterial({
    uniforms: {
      sunDir: {
        value: Ct
      },
      color: {
        value: new x.Color("#6cc8ff")
      }
    },
    vertexShader: mi,
    fragmentShader: `
uniform vec3 sunDir; uniform vec3 color; varying vec3 vN; varying vec3 vW;
void main(){ vec3 n=normalize(vN); vec3 v=normalize(cameraPosition-vW);
float f=pow(1.0-clamp(dot(n,v),0.,1.),3.0);
float lit=smoothstep(-0.35,0.6,dot(n,sunDir));
float a=f*(0.08+lit*1.6);
gl_FragColor=vec4(color*a*1.8,a);
}`,
    transparent: !0,
    blending: x.AdditiveBlending,
    depthWrite: !1,
    toneMapped: !1,
    fog: !1
  }));
}
function hi() {
  return we(new x.ShaderMaterial({
    uniforms: {
      pixelRatio: {
        value: 1
      }
    },
    vertexShader: `
attribute vec3 aColor; attribute float aSize; uniform float pixelRatio; varying vec3 vC;
void main(){ vC=aColor; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); gl_PointSize=aSize*pixelRatio; }`,
    fragmentShader: `
varying vec3 vC;
void main(){ float d=length(gl_PointCoord-0.5); float a=smoothstep(0.5,0.05,d); gl_FragColor=vec4(vC*a,a); }`,
    transparent: !0,
    blending: x.AdditiveBlending,
    depthWrite: !1,
    toneMapped: !1,
    fog: !1
  }));
}
function fi(o, e, t) {
  let n = new Float32Array(o * 3),
    s = new Float32Array(o * 3),
    r = new Float32Array(o),
    i = new x.Vector3();
  for (let c = 0; c < o; c++) {
    i.randomDirection().multiplyScalar(e), n.set([i.x, i.y, i.z], c * 3);
    let u = c < 300,
      d = u ? 1.5 + Math.random() * 1.8 : 0.25 + Math.random() * 0.75,
      p = Math.random(),
      m = p < 0.7 ? [1, 1, 1] : p < 0.9 ? [0.72, 0.84, 1] : [1, 0.82, 0.62];
    s.set([m[0] * d, m[1] * d, m[2] * d], c * 3), r[c] = u ? 2.5 + Math.random() * 1.8 : 1 + Math.random() * 1.5;
  }
  let a = we(new x.BufferGeometry());
  a.setAttribute("position", new x.BufferAttribute(n, 3)), a.setAttribute("aColor", new x.BufferAttribute(s, 3)), a.setAttribute("aSize", new x.BufferAttribute(r, 1));
  let l = new x.Points(a, t);
  return l.frustumCulled = !1, l.renderOrder = -9, l;
}
var nl = null;
function bi() {
  return nl ??= {
    core: tr(128, [[0, "rgba(255,255,255,1)"], [0.25, "rgba(255,255,255,0.9)"], [0.5, "rgba(255,240,220,0.25)"], [1, "rgba(0,0,0,0)"]]),
    glare: tr(256, [[0, "rgba(255,240,215,0.55)"], [0.15, "rgba(255,220,180,0.22)"], [0.45, "rgba(200,170,150,0.06)"], [1, "rgba(0,0,0,0)"]])
  };
}
function kn(o, e, t, n, s) {
  let r = we(new x.SpriteMaterial({
    map: o,
    blending: x.AdditiveBlending,
    depthWrite: !1,
    toneMapped: !1,
    fog: !1,
    transparent: !0
  }));
  r.color.setRGB(e, t, n);
  let i = new x.Sprite(r);
  return i.scale.setScalar(s), i.renderOrder = -8, i;
}
function Ei(o) {
  let e = new x.Group();
  e.name = "planet";
  let t = new x.Mesh(we(new x.SphereGeometry(o, 96, 64)), tl(el())),
    n = new x.Mesh(we(new x.SphereGeometry(o * 1.035, 96, 64)), ol());
  return t.renderOrder = -7, n.renderOrder = -6, e.add(t, n), e.rotation.set(0.35, 0, 0.2), e;
}
function sl() {
  let o = (() => {
      let [s, r] = Jt(128, 128);
      return r.strokeStyle = "rgba(160,200,255,0.5)", r.lineWidth = 5, r.filter = "blur(2px)", r.beginPath(), r.arc(64, 64, 54, 0, Math.PI * 2), r.stroke(), eo(s);
    })(),
    e = (() => {
      let [s, r] = Jt(128, 128);
      r.fillStyle = "rgba(255,255,255,0.35)", r.beginPath();
      for (let i = 0; i < 6; i++) {
        let a = i / 6 * Math.PI * 2;
        r.lineTo(64 + Math.cos(a) * 58, 64 + Math.sin(a) * 58);
      }
      return r.fill(), eo(s);
    })(),
    t = (() => {
      let [s, r] = Jt(512, 64),
        i = r.createLinearGradient(0, 0, 512, 0);
      return i.addColorStop(0, "rgba(0,0,0,0)"), i.addColorStop(0.5, "rgba(200,220,255,0.8)"), i.addColorStop(1, "rgba(0,0,0,0)"), r.fillStyle = i, r.fillRect(0, 30, 512, 4), eo(s);
    })(),
    n = tr(128, [[0, "rgba(255,230,200,0.5)"], [1, "rgba(0,0,0,0)"]]);
  return {
    ring: o,
    hex: e,
    streak: t,
    disc: n
  };
}
function rl(o) {
  let e = we(new x.IcosahedronGeometry(1, 1)),
    t = e.attributes.position;
  for (let E = 0; E < t.count; E++) {
    let M = t.getX(E),
      v = t.getY(E),
      V = t.getZ(E),
      C = 1 + 0.22 * Math.sin(M * 3.1 + v * 1.7) + 0.15 * Math.sin(v * 4.3 - V * 2.9) + 0.1 * Math.sin(V * 5.7 + M * 2.3);
    t.setXYZ(E, M * C, v * C * 0.8, V * C);
  }
  e.computeVertexNormals();
  let n = we(new x.MeshStandardMaterial({
      color: "#4a4038",
      roughness: 0.95,
      metalness: 0,
      flatShading: !0
    })),
    s = 250,
    r = new x.InstancedMesh(e, n, s);
  r.name = "asteroids";
  let i = new x.Matrix4(),
    a = new x.Quaternion(),
    l = new x.Euler(),
    c = new x.Vector3(),
    u = new x.Vector3();
  for (let E = 0; E < s; E++) {
    u.randomDirection(), Math.random() < 0.8 && (u.x = -Math.abs(u.x) * 1.5 - 0.3), u.y = u.y * 0.5 - 0.25, u.normalize().multiplyScalar(2800 + Math.random() * 3700), a.setFromEuler(l.set(Math.random() * 6.3, Math.random() * 6.3, Math.random() * 6.3));
    let M = 5 + Math.pow(Math.random(), 2.2) * 55;
    c.set(M * (0.8 + Math.random() * 0.5), M * (0.7 + Math.random() * 0.4), M * (0.8 + Math.random() * 0.5)), r.setMatrixAt(E, i.compose(u, a, c));
  }
  r.computeBoundingSphere(), o.add(r);
  let d = 1500,
    p = new Float32Array(d * 3);
  for (let E = 0; E < d; E++) u.randomDirection().multiplyScalar(2700 + Math.random() * 1800), p.set([u.x, u.y, u.z], E * 3);
  let m = we(new x.BufferGeometry());
  m.setAttribute("position", new x.BufferAttribute(p, 3));
  let f = we(new x.PointsMaterial({
      color: "#8a8ea8",
      size: 1.5,
      sizeAttenuation: !1,
      transparent: !0,
      opacity: 0.6,
      depthWrite: !1
    })),
    h = new x.Points(m, f);
  h.name = "dust", o.add(h);
}
function il(o, e) {
  let t = new x.Scene(),
    n = new x.ShaderMaterial({
      uniforms: {
        sunDir: {
          value: Ct
        }
      },
      vertexShader: "varying vec3 vD; void main(){ vD=normalize(position); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }",
      fragmentShader: `uniform vec3 sunDir; varying vec3 vD;
void main(){ vec3 d=normalize(vD); vec3 c=mix(vec3(0.008,0.012,0.025),vec3(0.05,0.08,0.15),d.y*0.5+0.5);
float s=max(dot(d,sunDir),0.); c+=vec3(1.,0.85,0.65)*(pow(s,24.)*6.+pow(s,4.)*0.25); gl_FragColor=vec4(c,1.); }`,
      side: x.BackSide
    }),
    s = new x.SphereGeometry(10, 32, 16);
  t.add(new x.Mesh(s, n));
  let r = new x.PMREMGenerator(e);
  o.environment = r.fromScene(t, 0.04).texture, r.dispose(), s.dispose(), n.dispose(), o.environmentIntensity = 0.6;
}
function gi(o, e) {
  o.background = new x.Color("#05070c");
  let t = Ct.clone(),
    n = new x.Group();
  n.name = "sky-follow", o.add(n);
  let s = we(new x.MeshBasicMaterial({
      map: Ja(),
      side: x.BackSide,
      depthWrite: !1,
      fog: !1
    })),
    r = new x.Mesh(we(new x.SphereGeometry(4e4, 64, 32)), s);
  r.renderOrder = -10, r.frustumCulled = !1, n.add(r);
  let i = hi();
  n.add(fi(6e3, 3e4, i));
  let a = new x.Group();
  a.name = "sun", a.position.copy(Ct).multiplyScalar(25e3);
  let l = bi();
  a.add(kn(l.glare, 2.2, 1.9, 1.5, 16e3), kn(l.core, 6, 5.2, 4, 1500));
  let c = sl(),
    u = new Xa();
  u.addElement(new Po(c.disc, 380, 0, new x.Color(1, 0.9, 0.75))), u.addElement(new Po(c.streak, 900, 0, new x.Color(0.7, 0.8, 1))), u.addElement(new Po(c.hex, 70, 0.35, new x.Color(0.5, 0.7, 1))), u.addElement(new Po(c.ring, 140, 0.6, new x.Color(0.6, 0.8, 1))), u.addElement(new Po(c.hex, 110, 0.9, new x.Color(0.8, 0.6, 1))), a.add(u), n.add(a);
  let d = Ei(9e3);
  d.position.copy(Za).multiplyScalar(24e3), n.add(d);
  let p = new x.DirectionalLight("#ffe6c8", 3.2);
  return p.position.copy(Ct).multiplyScalar(2e3), p.target.position.set(0, 0, 0), o.add(p, p.target), o.add(new x.HemisphereLight("#6d8fc9", "#1a1410", 0.55)), il(o, e), rl(o), {
    sunDirection: t,
    sunLight: p,
    update(m, f) {
      n.position.copy(m.position), d.rotation.y += f * 0.004, i.uniforms.pixelRatio.value = e.getPixelRatio();
    }
  };
}
var v0 = ue({
  id: "deep-space",
  name: "Deep Space",
  role: "environment",
  create: () => {
    let o = new x.Group();
    o.name = "deep-space-preview";
    let e = Ei(3);
    e.position.set(-3, -1, 0), o.add(e), o.add(fi(1500, 40, hi()));
    let t = bi(),
      n = new x.Group();
    return n.position.copy(Ct).multiplyScalar(12), n.add(kn(t.glare, 2.2, 1.9, 1.5, 8), kn(t.core, 6, 5.2, 4, 1)), o.add(n), o;
  }
});
import * as b from "./vendor/001-three-0.185.js";
function pe(o) {
  return o.userData.shared = !0, o;
}
var q = new b.Vector3(),
  Sn = new b.Vector3(),
  de = new b.Quaternion(),
  yi = new b.Quaternion(),
  zo = new b.Matrix4(),
  Vn = new b.Vector3(),
  Bo = new b.Color(),
  Ri = new b.Vector3(0, 1, 0);
function K(o, e) {
  return o + Math.random() * (e - o);
}
function Pt(o) {
  let e = Math.random() * 2 - 1,
    t = Math.random() * Math.PI * 2,
    n = Math.sqrt(1 - e * e);
  return o.set(n * Math.cos(t), n * Math.sin(t), e);
}
function ir(o) {
  let e = document.createElement("canvas");
  e.width = e.height = o;
  let t = e.getContext("2d");
  if (!t) throw new Error("fx: no 2d context");
  return [e, t];
}
function Ln(o) {
  let e = new b.CanvasTexture(o);
  return e.needsUpdate = !0, pe(e);
}
var An = null,
  or = null,
  nr = null,
  Cn = null;
function Io() {
  if (An) return An;
  let [o, e] = ir(64),
    t = e.createRadialGradient(32, 32, 0, 32, 32, 32);
  return t.addColorStop(0, "rgba(255,255,255,1)"), t.addColorStop(0.18, "rgba(255,255,255,0.85)"), t.addColorStop(0.45, "rgba(255,255,255,0.28)"), t.addColorStop(1, "rgba(255,255,255,0)"), e.fillStyle = t, e.fillRect(0, 0, 64, 64), An = Ln(o), An;
}
function Hi(o, e, t) {
  let [n, s] = ir(o),
    r = o / 2,
    i = 1337 + e,
    a = () => (i = i * 16807 % 2147483647, i / 2147483647);
  for (let c = 0; c < e; c++) {
    let u = a() * Math.PI * 2,
      d = a() * r * 0.42,
      p = r + Math.cos(u) * d,
      m = r + Math.sin(u) * d,
      f = r * (0.25 + a() * 0.35),
      h = s.createRadialGradient(p, m, 0, p, m, f),
      E = (0.25 + a() * 0.35) * t;
    h.addColorStop(0, `rgba(255,255,255,${E})`), h.addColorStop(0.6, `rgba(255,255,255,${E * 0.45})`), h.addColorStop(1, "rgba(255,255,255,0)"), s.fillStyle = h, s.fillRect(0, 0, o, o);
  }
  s.globalCompositeOperation = "destination-in";
  let l = s.createRadialGradient(r, r, 0, r, r, r);
  return l.addColorStop(0, "rgba(255,255,255,1)"), l.addColorStop(0.65, "rgba(255,255,255,0.9)"), l.addColorStop(1, "rgba(255,255,255,0)"), s.fillStyle = l, s.fillRect(0, 0, o, o), n;
}
function Bn() {
  return or || (or = Ln(Hi(128, 14, 1.3))), or;
}
function rr() {
  return nr || (nr = Ln(Hi(128, 22, 1))), nr;
}
function Mi() {
  if (Cn) return Cn;
  let [o, e] = ir(128),
    t = e.createRadialGradient(64, 64, 0, 64, 64, 64);
  return t.addColorStop(0, "rgba(255,255,255,0)"), t.addColorStop(0.6, "rgba(255,255,255,0.02)"), t.addColorStop(0.82, "rgba(255,255,255,0.55)"), t.addColorStop(0.9, "rgba(255,255,255,1)"), t.addColorStop(0.96, "rgba(255,255,255,0.3)"), t.addColorStop(1, "rgba(255,255,255,0)"), e.fillStyle = t, e.fillRect(0, 0, 128, 128), Cn = Ln(o), Cn;
}
var sr = 2e3,
  al = `
varying vec3 vColor;
varying float vF;
void main() {
  mat4 im = mat4(1.0);
  #ifdef USE_INSTANCING
  im = instanceMatrix;
  #endif
  vec4 wp = modelMatrix * im * vec4(position, 1.0);
  vec3 n = normalize(mat3(modelMatrix) * mat3(im) * normal);
  vec3 v = normalize(cameraPosition - wp.xyz);
  vF = abs(dot(n, v));
  vColor = vec3(1.0);
  #ifdef USE_INSTANCING_COLOR
  vColor = instanceColor;
  #endif
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`,
  ll = `
uniform float uPow;
uniform float uGain;
varying vec3 vColor;
varying float vF;
void main() {
  float i = pow(vF, uPow) * uGain;
  gl_FragColor = vec4(vColor * i, 1.0);
}
`,
  Pn = null;
function ki() {
  if (Pn) return Pn;
  let o = (e, t) => pe(new b.ShaderMaterial({
    uniforms: {
      uPow: {
        value: e
      },
      uGain: {
        value: t
      }
    },
    vertexShader: al,
    fragmentShader: ll,
    blending: b.AdditiveBlending,
    transparent: !0,
    depthWrite: !1,
    toneMapped: !1
  }));
  return Pn = {
    coreGeo: pe(new b.CapsuleGeometry(0.11, 9.6, 3, 8)),
    glowGeo: pe(new b.CapsuleGeometry(0.42, 10.2, 4, 10)),
    coreMat: o(0.7, 1),
    glowMat: o(2.2, 0.9)
  }, Pn;
}
var Si = [new b.Color(1.6, 3.6, 4), new b.Color(4, 1.5, 1.5), new b.Color(4.2, 2.4, 1.1)],
  Vi = [new b.Color(3176147).multiplyScalar(2.6).add(new b.Color(0, 0.25, 0.35)), new b.Color(16724032).multiplyScalar(2.4), new b.Color(16738844).multiplyScalar(2.4)],
  Ai = [1, 1, 1.55],
  Ci = [1, 0.9, 1.1],
  cl = `
attribute vec3 iPos;
attribute vec4 iColor;
attribute vec2 iSizeRot;
attribute vec3 iVel;
uniform float uStretch;
varying vec2 vUv;
varying vec4 vColor;
void main() {
  vUv = uv;
  vColor = iColor;
  vec4 mv = viewMatrix * vec4(iPos, 1.0);
  float size = iSizeRot.x;
  vec2 p;
  if (uStretch > 0.0) {
    vec3 vd = mat3(viewMatrix) * iVel;
    float l2 = length(vd.xy);
    vec2 dir = l2 > 1e-4 ? vd.xy / l2 : vec2(0.0, 1.0);
    vec2 perp = vec2(-dir.y, dir.x);
    float len = size + l2 * uStretch;
    p = dir * (position.y * len) + perp * (position.x * size);
  } else {
    float c = cos(iSizeRot.y), s = sin(iSizeRot.y);
    vec2 q = position.xy * size;
    p = vec2(c * q.x - s * q.y, s * q.x + c * q.y);
  }
  mv.xy += p;
  gl_Position = projectionMatrix * mv;
}
`,
  ul = `
uniform sampler2D uMap;
varying vec2 vUv;
varying vec4 vColor;
void main() {
  float a = texture2D(uMap, vUv).a * vColor.a;
  if (a < 0.003) discard;
  gl_FragColor = vec4(vColor.rgb, a);
}
`,
  Lo = class {
    cap;
    kind;
    px;
    py;
    pz;
    vx;
    vy;
    vz;
    age;
    life;
    s0;
    s1;
    rot;
    rotV;
    drag;
    alpha;
    ramp;
    grav;
    next = 0;
    mesh;
    geom;
    aPos;
    aCol;
    aSR;
    aVel;
    constructor(e, t, n, s) {
      this.kind = e, this.cap = t;
      let r = () => new Float32Array(t);
      this.px = r(), this.py = r(), this.pz = r(), this.vx = r(), this.vy = r(), this.vz = r(), this.age = r(), this.life = r(), this.s0 = r(), this.s1 = r(), this.rot = r(), this.rotV = r(), this.drag = r(), this.alpha = r(), this.ramp = r(), this.grav = r();
      let i = new b.PlaneGeometry(1, 1),
        a = new b.InstancedBufferGeometry();
      a.index = i.index, a.setAttribute("position", i.getAttribute("position")), a.setAttribute("uv", i.getAttribute("uv")), i.dispose(), this.aPos = new b.InstancedBufferAttribute(new Float32Array(t * 3), 3), this.aCol = new b.InstancedBufferAttribute(new Float32Array(t * 4), 4), this.aSR = new b.InstancedBufferAttribute(new Float32Array(t * 2), 2), this.aVel = new b.InstancedBufferAttribute(new Float32Array(t * 3), 3);
      for (let c of [this.aPos, this.aCol, this.aSR, this.aVel]) c.setUsage(b.DynamicDrawUsage);
      a.setAttribute("iPos", this.aPos), a.setAttribute("iColor", this.aCol), a.setAttribute("iSizeRot", this.aSR), a.setAttribute("iVel", this.aVel), a.instanceCount = 0, this.geom = pe(a);
      let l = pe(new b.ShaderMaterial({
        uniforms: {
          uMap: {
            value: n
          },
          uStretch: {
            value: e === "spark" ? 0.035 : 0
          }
        },
        vertexShader: cl,
        fragmentShader: ul,
        transparent: !0,
        depthWrite: !1,
        blending: e === "smoke" ? b.NormalBlending : b.AdditiveBlending,
        toneMapped: !1
      }));
      this.mesh = new b.Mesh(this.geom, l), this.mesh.frustumCulled = !1, this.mesh.renderOrder = s, this.mesh.name = `fx-${e}`;
    }
    spawn(e, t, n, s, r, i, a, l, c, u, d, p, m = 0) {
      let f = this.next;
      this.next = (f + 1) % this.cap, this.px[f] = e, this.py[f] = t, this.pz[f] = n, this.vx[f] = s, this.vy[f] = r, this.vz[f] = i, this.age[f] = 0, this.life[f] = a, this.s0[f] = l, this.s1[f] = c, this.rot[f] = Math.random() * Math.PI * 2, this.rotV[f] = (Math.random() - 0.5) * 2, this.ramp[f] = u, this.alpha[f] = d, this.drag[f] = p, this.grav[f] = m;
    }
    clear() {
      this.life.fill(0), this.geom.instanceCount = 0;
    }
    update(e) {
      let t = this.aPos.array,
        n = this.aCol.array,
        s = this.aSR.array,
        r = this.aVel.array,
        i = 0;
      for (let a = 0; a < this.cap; a++) {
        let l = this.life[a];
        if (l <= 0) continue;
        let c = this.age[a] + e;
        if (c >= l) {
          this.life[a] = 0;
          continue;
        }
        this.age[a] = c;
        let u = Math.exp(-this.drag[a] * e);
        this.vx[a] *= u, this.vy[a] = this.vy[a] * u + this.grav[a] * e, this.vz[a] *= u, this.px[a] += this.vx[a] * e, this.py[a] += this.vy[a] * e, this.pz[a] += this.vz[a] * e, this.rot[a] += this.rotV[a] * e;
        let d = c / l,
          p = 1 - (1 - d) * (1 - d),
          m = this.s0[a] + (this.s1[a] - this.s0[a]) * p,
          f = 1,
          h = 1,
          E = 1,
          M = this.alpha[a];
        if (this.kind === "smoke") {
          let C = this.ramp[a],
            U = Math.max(0, 1 - d * 6);
          f = C + U * 0.25, h = C + U * 0.1, E = C * 1.05, M *= Math.min(1, d * 10) * (1 - d);
        } else dl(this.ramp[a], d), f = Bo.r, h = Bo.g, E = Bo.b, M *= this.ramp[a] === 4 ? (1 - d) * (1 - d) : Math.pow(1 - d, 1.2);
        let v = i * 3,
          V = i * 4;
        t[v] = this.px[a], t[v + 1] = this.py[a], t[v + 2] = this.pz[a], r[v] = this.vx[a], r[v + 1] = this.vy[a], r[v + 2] = this.vz[a], n[V] = f, n[V + 1] = h, n[V + 2] = E, n[V + 3] = M, s[i * 2] = m, s[i * 2 + 1] = this.rot[a], i++;
      }
      if (this.geom.instanceCount = i, i > 0) for (let a of [this.aPos, this.aCol, this.aSR, this.aVel]) a.clearUpdateRanges(), a.addUpdateRange(0, i * a.itemSize), a.needsUpdate = !0;
    }
  };
function mt(o, e, t, n, s, r, i) {
  Bo.setRGB(e + (s - e) * o, t + (r - t) * o, n + (i - n) * o);
}
function dl(o, e) {
  switch (o) {
    case 0:
      e < 0.12 ? mt(e / 0.12, 5, 4.4, 3.2, 4.2, 2.1, 0.6) : e < 0.45 ? mt((e - 0.12) / 0.33, 4.2, 2.1, 0.6, 2.2, 0.55, 0.1) : mt((e - 0.45) / 0.55, 2.2, 0.55, 0.1, 0.35, 0.05, 0.02);
      break;
    case 1:
      mt(e, 1.6, 4.2, 4.8, 0.2, 0.7, 2.4);
      break;
    case 2:
      mt(e, 4.5, 1.6, 1.5, 2.2, 0.1, 0.15);
      break;
    case 3:
      mt(e, 4.6, 2.6, 1.1, 2.8, 0.6, 0.1);
      break;
    case 4:
      mt(e, 7, 6.4, 5.6, 3.5, 1.8, 0.7);
      break;
    default:
      mt(e, 6, 4.8, 2.4, 3.2, 0.9, 0.15);
      break;
  }
}
var wi = [1, 2, 3],
  Se = 80,
  Je = 16,
  oo = 4,
  ht = 48;
var pl = ["spark", "flak", "ship", "big", "reactor"],
  In = class {
    root = new b.Group();
    fire;
    smoke;
    sparks;
    boltCore;
    boltGlow;
    boltN = 0;
    debris;
    dPos = new Float32Array(Se * 3);
    dVel = new Float32Array(Se * 3);
    dQuat = new Float32Array(Se * 4);
    dAxis = new Float32Array(Se * 3);
    dSpin = new Float32Array(Se);
    dScale = new Float32Array(Se);
    dAge = new Float32Array(Se);
    dLife = new Float32Array(Se);
    dTrail = new Float32Array(Se);
    dNext = 0;
    rings = [];
    ringMats = [];
    rAge = new Float32Array(Je);
    rLife = new Float32Array(Je);
    rR0 = new Float32Array(Je);
    rR1 = new Float32Array(Je);
    rA = new Float32Array(Je);
    rNext = 0;
    lights = [];
    lAge = new Float32Array(oo);
    lLife = new Float32Array(oo);
    lPeak = new Float32Array(oo);
    lNext = 0;
    eT = new Float32Array(ht);
    eX = new Float32Array(ht);
    eY = new Float32Array(ht);
    eZ = new Float32Array(ht);
    eSize = new Float32Array(ht);
    eKind = new Int8Array(ht).fill(-1);
    ePos = new b.Vector3();
    constructor(e) {
      this.root.name = "fx", e.add(this.root), this.smoke = new Lo("smoke", 900, rr(), 10), this.fire = new Lo("fire", 1400, Bn(), 11), this.sparks = new Lo("spark", 900, Io(), 12), this.root.add(this.smoke.mesh, this.fire.mesh, this.sparks.mesh);
      let t = ki();
      this.boltGlow = new b.InstancedMesh(t.glowGeo, t.glowMat, sr), this.boltCore = new b.InstancedMesh(t.coreGeo, t.coreMat, sr);
      for (let i of [this.boltGlow, this.boltCore]) i.instanceMatrix.setUsage(b.DynamicDrawUsage), i.setColorAt(0, Bo.setRGB(1, 1, 1)), i.instanceColor?.setUsage(b.DynamicDrawUsage), i.count = 0, i.frustumCulled = !1, i.renderOrder = 13, this.root.add(i);
      this.boltGlow.name = "fx-bolt-glow", this.boltCore.name = "fx-bolt-core";
      let n = pe(new b.BoxGeometry(1, 0.35, 0.7)),
        s = pe(new b.MeshStandardMaterial({
          color: 2829361,
          roughness: 0.75,
          metalness: 0.6,
          emissive: new b.Color(1, 0.32, 0.08),
          emissiveIntensity: 0.7
        }));
      this.debris = new b.InstancedMesh(n, s, Se), this.debris.instanceMatrix.setUsage(b.DynamicDrawUsage), this.debris.count = 0, this.debris.frustumCulled = !1, this.debris.name = "fx-debris", this.root.add(this.debris);
      let r = pe(new b.PlaneGeometry(1, 1));
      for (let i = 0; i < Je; i++) {
        let a = pe(new b.MeshBasicMaterial({
            map: Mi(),
            color: new b.Color(3.2, 2.2, 1.4),
            transparent: !0,
            opacity: 0,
            blending: b.AdditiveBlending,
            depthWrite: !1,
            side: b.DoubleSide,
            toneMapped: !1
          })),
          l = new b.Mesh(r, a);
        l.visible = !1, l.frustumCulled = !1, l.renderOrder = 14, this.rings.push(l), this.ringMats.push(a), this.root.add(l);
      }
      for (let i = 0; i < oo; i++) {
        let a = new b.PointLight(16751178, 0, 100, 2);
        a.castShadow = !1, this.lights.push(a), this.root.add(a);
      }
    }
    beginBolts() {
      this.boltN = 0;
    }
    pushBolt(e, t, n) {
      if (this.boltN >= sr) return;
      let s = this.boltN++;
      de.setFromUnitVectors(Ri, t);
      let r = Ai[n];
      Vn.set(r, Ci[n], r), zo.compose(e, de, Vn), this.boltCore.setMatrixAt(s, zo), this.boltGlow.setMatrixAt(s, zo), this.boltCore.setColorAt(s, Si[n]), this.boltGlow.setColorAt(s, Vi[n]);
    }
    endBolts() {
      let e = this.boltN;
      for (let t of [this.boltCore, this.boltGlow]) if (t.count = e, e > 0) {
        t.instanceMatrix.clearUpdateRanges(), t.instanceMatrix.addUpdateRange(0, e * 16), t.instanceMatrix.needsUpdate = !0;
        let n = t.instanceColor;
        n && (n.clearUpdateRanges(), n.addUpdateRange(0, e * 3), n.needsUpdate = !0);
      }
    }
    explode(e, t, n) {
      switch (t) {
        case "spark":
          this.expSpark(e, n ?? 1.5);
          break;
        case "flak":
          this.expFlak(e, n ?? 6);
          break;
        case "ship":
          this.expShip(e, n ?? 10);
          break;
        case "big":
          this.expBig(e, n ?? 60);
          break;
        case "reactor":
          this.expReactor(e, n ?? 220);
          break;
      }
    }
    burstFire(e, t, n, s, r, i, a, l, c, u) {
      for (let d = 0; d < t; d++) {
        Pt(q);
        let p = K(n, s),
          m = Math.random() * c;
        this.fire.spawn(e.x + q.x * m, e.y + q.y * m, e.z + q.z * m, q.x * p, q.y * p, q.z * p, K(a, l), r * K(0.7, 1.2), i * K(0.8, 1.25), 0, K(0.7, 1), u);
      }
    }
    burstSmoke(e, t, n, s, r, i, a, l, c, u) {
      for (let d = 0; d < t; d++) {
        Pt(q);
        let p = K(0.3, 1) * n,
          m = Math.random() * l;
        this.smoke.spawn(e.x + q.x * m, e.y + q.y * m, e.z + q.z * m, q.x * p, q.y * p, q.z * p, K(i, a), s * K(0.7, 1.2), r * K(0.8, 1.3), c * K(0.7, 1.3), u, 1.6);
      }
    }
    burstSparks(e, t, n, s, r, i, a, l) {
      for (let c = 0; c < t; c++) {
        Pt(q);
        let u = K(n, s);
        this.sparks.spawn(e.x, e.y, e.z, q.x * u, q.y * u, q.z * u, K(i, a), r, r * 0.5, l, 1, 1.2);
      }
    }
    flash(e, t, n, s = 4) {
      this.fire.spawn(e.x, e.y, e.z, 0, 0, 0, n, t * 0.6, t, s, 1, 0);
    }
    expSpark(e, t) {
      this.flash(e, t * 2, 0.12, 5), this.burstSparks(e, 8, t * 12, t * 30, t * 0.18, 0.2, 0.45, 5);
    }
    expFlak(e, t) {
      this.flash(e, t * 1.6, 0.14, 4), this.burstFire(e, 7, t * 0.8, t * 2.2, t * 0.35, t * 0.8, 0.25, 0.45, t * 0.2, 4), this.burstSmoke(e, 3, t * 0.4, t * 0.55, t * 1.5, 2, 3.2, t * 0.25, 0.12, 0.55), this.burstSparks(e, 6, t * 5, t * 10, t * 0.08, 0.2, 0.4, 5);
    }
    expShip(e, t) {
      this.flash(e, t * 3.2, 0.22, 4), this.burstFire(e, 26, t * 1.2, t * 4, t * 0.45, t * 1.3, 0.55, 1.1, t * 0.25, 3), this.burstSmoke(e, 12, t * 1.2, t * 0.6, t * 2.4, 2.2, 3.8, t * 0.4, 0.09, 0.6), this.burstSparks(e, 24, t * 5, t * 14, t * 0.12, 0.4, 1, 5), this.spawnDebris(e, 6, t * 2, t * 6, t * 0.18), this.ring(e, t * 0.8, t * 5, 0.55, 0.8), this.light(e, t * 14, 8 * t * t, 0.35);
    }
    expBig(e, t) {
      this.flash(e, t * 2.6, 0.3, 4), this.flash(e, t * 1.2, 0.5, 0), this.burstFire(e, 60, t * 0.6, t * 2.2, t * 0.25, t * 0.75, 0.8, 1.7, t * 0.3, 2.2), this.burstSmoke(e, 30, t * 0.5, t * 0.35, t * 1.3, 3, 5.5, t * 0.5, 0.08, 0.65), this.burstSparks(e, 36, t * 1.5, t * 4.5, t * 0.05, 0.8, 1.8, 5), this.spawnDebris(e, 12, t * 0.5, t * 1.8, t * 0.06), this.ring(e, t * 0.4, t * 3.2, 0.9, 1), this.light(e, t * 8, 6 * t * t, 0.7);
    }
    expReactor(e, t) {
      this.flash(e, t * 1.8, 0.7, 4), this.flash(e, t * 0.9, 1.4, 0), this.burstFire(e, 40, t * 0.3, t * 0.9, t * 0.12, t * 0.35, 1, 2.2, t * 0.15, 1.5), this.burstSparks(e, 50, t * 0.8, t * 2.5, t * 0.025, 1.2, 2.6, 5), this.ring(e, t * 0.2, t * 2.6, 2.2, 1), this.light(e, t * 5, 5 * t * t, 2.8);
      for (let n = 0; n < 9; n++) Pt(Sn).multiplyScalar(t * K(0.15, 0.65)), Sn.add(e), this.schedule(Sn, K(0.15, 2.4), 3, t * K(0.18, 0.32));
      this.schedule(e, 2.5, 3, t * 0.5), this.scheduleRing(e, 2.5, t);
    }
    schedule(e, t, n, s) {
      for (let r = 0; r < ht; r++) if (!(this.eKind[r] >= 0)) {
        this.eKind[r] = n, this.eT[r] = t, this.eX[r] = e.x, this.eY[r] = e.y, this.eZ[r] = e.z, this.eSize[r] = s;
        return;
      }
    }
    scheduleRing(e, t, n) {
      this.schedule(e, t, 10, n);
    }
    spawnDebris(e, t, n, s, r) {
      for (let i = 0; i < t; i++) {
        let a = this.dNext;
        this.dNext = (a + 1) % Se, Pt(q);
        let l = K(n, s);
        this.dPos[a * 3] = e.x, this.dPos[a * 3 + 1] = e.y, this.dPos[a * 3 + 2] = e.z, this.dVel[a * 3] = q.x * l, this.dVel[a * 3 + 1] = q.y * l, this.dVel[a * 3 + 2] = q.z * l, Pt(q), this.dAxis[a * 3] = q.x, this.dAxis[a * 3 + 1] = q.y, this.dAxis[a * 3 + 2] = q.z, de.setFromAxisAngle(Pt(Sn), Math.random() * 6.28), this.dQuat[a * 4] = de.x, this.dQuat[a * 4 + 1] = de.y, this.dQuat[a * 4 + 2] = de.z, this.dQuat[a * 4 + 3] = de.w, this.dSpin[a] = K(3, 12), this.dScale[a] = Math.max(0.3, r * K(0.5, 1.5)), this.dAge[a] = 0, this.dLife[a] = K(1.4, 3), this.dTrail[a] = 0;
      }
    }
    ring(e, t, n, s, r) {
      let i = this.rNext;
      this.rNext = (i + 1) % Je;
      let a = this.rings[i];
      a.position.copy(e), a.visible = !0, this.rAge[i] = 0, this.rLife[i] = s, this.rR0[i] = t, this.rR1[i] = n, this.rA[i] = r;
    }
    light(e, t, n, s) {
      let r = this.lNext;
      this.lNext = (r + 1) % oo;
      let i = this.lights[r];
      i.position.copy(e), i.distance = t, this.lAge[r] = 0, this.lLife[r] = s, this.lPeak[r] = n, i.intensity = n;
    }
    impact(e, t) {
      let n = wi[t],
        s = t === 2 ? 1.4 : 1;
      this.flash(e, 2.4 * s, 0.09, n), this.fire.spawn(e.x, e.y, e.z, 0, 0, 0, 0.16, 0.8 * s, 1.8 * s, 5, 0.7, 0), this.burstSparks(e, 5, 10, 28, 0.16, 0.15, 0.35, n);
    }
    puff(e, t = 1.5) {
      this.smoke.spawn(e.x, e.y, e.z, K(-0.5, 0.5), K(-0.5, 0.5), K(-0.5, 0.5), K(1, 1.5), t, t * 2.6, 0.28 * K(0.8, 1.2), 0.42, 1);
    }
    muzzle(e, t) {
      let n = wi[t];
      this.fire.spawn(e.x, e.y, e.z, 0, 0, 0, 0.06, 1.2, 2, n, 1, 0), this.fire.spawn(e.x, e.y, e.z, 0, 0, 0, 0.04, 0.5, 0.9, 4, 0.9, 0);
    }
    update(e, t) {
      e = Math.min(Math.max(e, 0), 0.1);
      for (let s = 0; s < ht; s++) {
        let r = this.eKind[s];
        if (!(r < 0) && (this.eT[s] -= e, !(this.eT[s] > 0))) if (this.eKind[s] = -1, this.ePos.set(this.eX[s], this.eY[s], this.eZ[s]), r === 10) {
          let i = this.eSize[s];
          this.ring(this.ePos, i * 0.3, i * 3.2, 2.4, 1), this.flash(this.ePos, i * 1.4, 0.6, 4), this.light(this.ePos, i * 5, 5 * i * i, 1.6);
        } else this.explode(this.ePos, pl[r], this.eSize[s]);
      }
      this.fire.update(e), this.smoke.update(e), this.sparks.update(e);
      let n = 0;
      for (let s = 0; s < Se; s++) {
        if (this.dLife[s] <= 0) continue;
        this.dAge[s] += e;
        let r = this.dAge[s] / this.dLife[s];
        if (r >= 1) {
          this.dLife[s] = 0;
          continue;
        }
        let i = Math.exp(-0.4 * e),
          a = s * 3;
        this.dVel[a] *= i, this.dVel[a + 1] *= i, this.dVel[a + 2] *= i, this.dPos[a] += this.dVel[a] * e, this.dPos[a + 1] += this.dVel[a + 1] * e, this.dPos[a + 2] += this.dVel[a + 2] * e, de.set(this.dQuat[s * 4], this.dQuat[s * 4 + 1], this.dQuat[s * 4 + 2], this.dQuat[s * 4 + 3]), q.set(this.dAxis[a], this.dAxis[a + 1], this.dAxis[a + 2]), yi.setFromAxisAngle(q, this.dSpin[s] * e), de.multiply(yi), this.dQuat[s * 4] = de.x, this.dQuat[s * 4 + 1] = de.y, this.dQuat[s * 4 + 2] = de.z, this.dQuat[s * 4 + 3] = de.w, q.set(this.dPos[a], this.dPos[a + 1], this.dPos[a + 2]);
        let l = this.dScale[s] * (r > 0.8 ? (1 - r) * 5 : 1);
        if (Vn.set(l, l, l), zo.compose(q, de, Vn), this.debris.setMatrixAt(n++, zo), this.dTrail[s] -= e, this.dTrail[s] <= 0 && r < 0.75) {
          this.dTrail[s] = 0.035;
          let c = this.dScale[s];
          this.fire.spawn(q.x, q.y, q.z, 0, 0, 0, 0.45, c * 1.4, c * 0.4, 0, 0.8 * (1 - r), 0), Math.random() < 0.35 && this.smoke.spawn(q.x, q.y, q.z, 0, 0, 0, 1.2, c * 1.2, c * 3.5, 0.1, 0.35, 0);
        }
      }
      this.debris.count = n, n > 0 && (this.debris.instanceMatrix.needsUpdate = !0), t.getWorldQuaternion(de);
      for (let s = 0; s < Je; s++) {
        let r = this.rings[s];
        if (!r.visible) continue;
        this.rAge[s] += e;
        let i = this.rAge[s] / this.rLife[s];
        if (i >= 1) {
          r.visible = !1, this.ringMats[s].opacity = 0;
          continue;
        }
        let a = 1 - Math.pow(1 - i, 3),
          l = this.rR0[s] + (this.rR1[s] - this.rR0[s]) * a;
        r.scale.set(l * 2, l * 2, 1), r.quaternion.copy(de), this.ringMats[s].opacity = this.rA[s] * (1 - i) * (1 - i) * Math.min(1, i * 12);
      }
      for (let s = 0; s < oo; s++) {
        let r = this.lights[s];
        if (r.intensity <= 0) continue;
        this.lAge[s] += e;
        let i = this.lAge[s] / this.lLife[s];
        r.intensity = i >= 1 ? 0 : this.lPeak[s] * (1 - i) * (1 - i);
      }
    }
    clear() {
      this.fire.clear(), this.smoke.clear(), this.sparks.clear(), this.boltN = 0, this.boltCore.count = 0, this.boltGlow.count = 0, this.dLife.fill(0), this.debris.count = 0;
      for (let e = 0; e < Je; e++) this.rings[e].visible = !1, this.ringMats[e].opacity = 0;
      for (let e of this.lights) e.intensity = 0;
      this.eKind.fill(-1);
    }
  },
  ml = `
varying float vF;
varying float vL;
void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vec3 n = normalize(normalMatrix * normal);
  vF = abs(dot(n, normalize(-mv.xyz)));
  vL = uv.y;
  gl_Position = projectionMatrix * mv;
}
`,
  hl = `
uniform vec3 uColor;
varying float vF;
varying float vL;
void main() {
  float along = pow(1.0 - vL, 1.6);
  float i = along * pow(vF, 1.4);
  gl_FragColor = vec4(uColor * i, 1.0);
}
`,
  zn = null;
function vi() {
  if (zn) return zn;
  let o = new b.ConeGeometry(1, 1, 14, 1, !0);
  return o.translate(0, 0.5, 0), o.rotateX(Math.PI / 2), zn = pe(o), zn;
}
var Ti = new Map();
function xi(o) {
  return pe(new b.ShaderMaterial({
    uniforms: {
      uColor: {
        value: o
      }
    },
    vertexShader: ml,
    fragmentShader: hl,
    blending: b.AdditiveBlending,
    transparent: !0,
    depthWrite: !1,
    side: b.DoubleSide,
    toneMapped: !1
  }));
}
function fl(o) {
  let e = new b.Color(o),
    t = e.getHexString(),
    n = Ti.get(t);
  if (n) return n;
  let s = new b.Color(1, 1, 1),
    r = (a, l) => pe(new b.SpriteMaterial({
      map: Io(),
      color: a,
      opacity: l,
      blending: b.AdditiveBlending,
      depthWrite: !1,
      transparent: !0,
      toneMapped: !1
    })),
    i = {
      core: r(e.clone().lerp(s, 0.55).multiplyScalar(4), 1),
      halo: r(e.clone().multiplyScalar(1.4), 0.5),
      plume: xi(e.clone().multiplyScalar(2.4)),
      inner: xi(e.clone().lerp(s, 0.6).multiplyScalar(3.2))
    };
  return Ti.set(t, i), i;
}
function zt(o, e) {
  let t = fl(o),
    n = new b.Group();
  n.name = "engine-glow";
  let s = new b.Sprite(t.halo),
    r = new b.Sprite(t.core),
    i = new b.Mesh(vi(), t.plume),
    a = new b.Mesh(vi(), t.inner);
  for (let c of [s, r, i, a]) c.renderOrder = 15, n.add(c);
  let l = {
    core: r,
    halo: s,
    plume: i,
    inner: a,
    radius: e
  };
  return n.userData.fxGlow = l, De(n, 0.5, !1), n;
}
function De(o, e, t) {
  let n = o.userData.fxGlow;
  if (!n) return;
  let s = Math.min(1, Math.max(0, e)),
    r = n.radius,
    i = 0.92 + Math.random() * 0.16,
    a = t ? 1.7 : 1,
    l = r * (1.2 + 5 * s) * a * i,
    c = r * (0.75 + 0.15 * s) * (t ? 1.15 : 1);
  n.plume.scale.set(c, c, l), n.inner.scale.set(c * 0.45, c * 0.45, l * 0.6);
  let u = r * (1.6 + 1.4 * s) * (t ? 1.35 : 1) * (0.95 + Math.random() * 0.1);
  n.core.scale.set(u, u, 1);
  let d = r * (3.5 + 2.5 * s) * (t ? 1.4 : 1);
  n.halo.scale.set(d, d, 1);
}
var R0 = ue({
    id: "laser-bolts",
    name: "Laser Bolts",
    role: "effect",
    create: () => {
      let o = new b.Group();
      o.name = "laser-bolts";
      let e = ki(),
        t = new b.InstancedMesh(e.glowGeo, e.glowMat, 9),
        n = new b.InstancedMesh(e.coreGeo, e.coreMat, 9),
        s = new b.Vector3(0, 0, -1),
        r = new b.Quaternion().setFromUnitVectors(Ri, s),
        i = new b.Vector3(),
        a = new b.Vector3(),
        l = new b.Matrix4(),
        c = 0;
      for (let u = 0; u < 3; u++) for (let d = 0; d < 3; d++) {
        i.set((u - 1) * 4, (d - 1) * 2.5, (d - 1) * 4);
        let p = Ai[u];
        a.set(p, Ci[u], p), l.compose(i, r, a), t.setMatrixAt(c, l), n.setMatrixAt(c, l), t.setColorAt(c, Vi[u]), n.setColorAt(c, Si[u]), c++;
      }
      return t.frustumCulled = !1, n.frustumCulled = !1, o.add(t, n), o;
    }
  }),
  H0 = ue({
    id: "flak-and-explosions",
    name: "Flak and Explosions",
    role: "effect",
    create: () => {
      let o = new b.Group();
      o.name = "flak-and-explosions";
      let e = (n, s, r, i, a, l, c, u = 1) => {
        let d = pe(new b.SpriteMaterial({
            map: n,
            color: s,
            opacity: u,
            transparent: !0,
            depthWrite: !1,
            blending: c ? b.AdditiveBlending : b.NormalBlending,
            toneMapped: !1
          })),
          p = new b.Sprite(d);
        return p.scale.set(r, r, 1), p.position.set(i, a, l), o.add(p), p;
      };
      e(rr(), new b.Color(0.1, 0.09, 0.09), 12, -8, 1.5, -1, !1, 0.7), e(Bn(), new b.Color(2.2, 0.55, 0.1), 10, -8, 0, 0, !0), e(Bn(), new b.Color(4.2, 2.1, 0.6), 6, -7.5, 0.4, 0.3, !0), e(Io(), new b.Color(6, 5.5, 4.8), 3.5, -8, 0, 0.5, !0), e(rr(), new b.Color(0.14, 0.14, 0.15), 7, 0, 0, 0, !1, 0.75), e(Bn(), new b.Color(4, 1.8, 0.5), 3.5, 0.3, -0.2, 0.3, !0);
      for (let n = 0; n < 12; n++) {
        let s = n / 12 * Math.PI * 2,
          r = e(Io(), new b.Color(6, 4.2, 1.8), 0.8, 8 + Math.cos(s) * 2.5, Math.sin(s) * 2.5, 0, !0);
        r.scale.set(0.5, 1.8, 1), r.material.rotation = s - Math.PI / 2;
      }
      e(Io(), new b.Color(5, 4.5, 3.5), 2.5, 8, 0, 0, !0);
      let t = new b.Mesh(pe(new b.PlaneGeometry(1, 1)), pe(new b.MeshBasicMaterial({
        map: Mi(),
        color: new b.Color(3.2, 2.2, 1.4),
        transparent: !0,
        opacity: 0.8,
        blending: b.AdditiveBlending,
        depthWrite: !1,
        toneMapped: !1
      })));
      return t.scale.set(18, 18, 1), t.position.set(-8, 0, -2), o.add(t), o;
    }
  });
var Bt = null,
  qo = 0,
  zi = 24,
  Pi = {};
function lr() {
  if (Bt) return Bt;
  try {
    let {
        context: o,
        output: e
      } = Q.audio(),
      t = o.createDynamicsCompressor();
    t.threshold.value = -16, t.knee.value = 10, t.ratio.value = 6, t.attack.value = 0.003, t.release.value = 0.2, t.connect(e);
    let n = o.createGain();
    n.gain.value = 0.8, n.connect(t);
    let s = o.createGain();
    s.connect(n);
    let r = o.createGain();
    r.gain.value = 1;
    let i = o.createDelay(1);
    i.delayTime.value = 0.19;
    let a = o.createGain();
    a.gain.value = 0.38;
    let l = o.createBiquadFilter();
    l.type = "lowpass", l.frequency.value = 1800;
    let c = o.createGain();
    c.gain.value = 0.35, r.connect(i), i.connect(l), l.connect(a), a.connect(i), l.connect(c), c.connect(n);
    let u = Math.floor(o.sampleRate * 2),
      d = o.createBuffer(1, u, o.sampleRate),
      p = d.getChannelData(0);
    for (let m = 0; m < u; m++) p[m] = Math.random() * 2 - 1;
    return Bt = {
      ctx: o,
      master: n,
      dry: s,
      send: r,
      noise: d
    }, Bt;
  } catch {
    return null;
  }
}
function fe(o, e, t = !1) {
  let n = lr();
  if (!n || !t && qo >= zi) return null;
  if (o) {
    let s = n.ctx.currentTime,
      r = Pi[o];
    if (r !== void 0 && s - r < e && s >= r) return null;
    Pi[o] = s;
  }
  return n;
}
function ft(o) {
  return o === void 0 || !Number.isFinite(o) ? 1 : Math.max(0, Math.min(1, o));
}
function Bi(o, e) {
  let t = o.ctx.createGain();
  if (t.gain.value = 0, t.connect(o.dry), e > 0) {
    let n = o.ctx.createGain();
    n.gain.value = e, t.connect(n), n.connect(o.send);
  }
  return t;
}
function Ii(o, e) {
  qo++, o.onended = () => {
    qo = Math.max(0, qo - 1), o.disconnect();
    for (let t of e) t.disconnect();
  };
}
function Li(o, e, t, n, s) {
  o.cancelScheduledValues(e), o.setValueAtTime(1e-4, e), o.linearRampToValueAtTime(Math.max(1e-4, t), e + n), o.exponentialRampToValueAtTime(1e-4, e + s);
}
function j(o, e) {
  let t = o.ctx.currentTime + (e.delay ?? 0),
    n = o.ctx.createOscillator();
  n.type = e.type, n.frequency.setValueAtTime(e.f0, t), e.f1 !== void 0 && n.frequency.exponentialRampToValueAtTime(Math.max(1, e.f1), t + e.dur), e.detune && (n.detune.value = e.detune);
  let s = Bi(o, e.reverb ?? 0.15),
    r = [s];
  if (e.lp) {
    let i = o.ctx.createBiquadFilter();
    i.type = "lowpass", i.frequency.value = e.lp, n.connect(i), i.connect(s), r.push(i);
  } else n.connect(s);
  Li(s.gain, t, e.vol, e.attack ?? 0.004, e.dur), Ii(n, r), n.start(t), n.stop(t + e.dur + 0.05);
}
function Ve(o, e) {
  let t = o.ctx.currentTime + (e.delay ?? 0),
    n = o.ctx.createBufferSource();
  n.buffer = o.noise, n.loop = !0, n.playbackRate.value = e.rate ?? 1;
  let s = o.ctx.createBiquadFilter();
  s.type = e.filter, s.Q.value = e.q ?? 0.8, s.frequency.setValueAtTime(e.f0, t), e.f1 !== void 0 && s.frequency.exponentialRampToValueAtTime(Math.max(10, e.f1), t + e.dur);
  let r = Bi(o, e.reverb ?? 0.2);
  n.connect(s), s.connect(r), Li(r.gain, t, e.vol, e.attack ?? 0.003, e.dur), Ii(n, [s, r]), n.start(t, Math.random() * 1.5), n.stop(t + e.dur + 0.05);
}
var no = (o, e) => o + Math.random() * (e - o),
  so = null;
function bl(o) {
  let e = o.ctx,
    t = e.createGain();
  t.gain.value = 0, t.connect(o.dry);
  let n = e.createBiquadFilter();
  n.type = "lowpass", n.frequency.value = 400, n.Q.value = 2;
  let s = e.createGain();
  s.gain.value = 0.35, n.connect(s), s.connect(t);
  let r = e.createOscillator();
  r.type = "sawtooth", r.frequency.value = 55;
  let i = e.createOscillator();
  i.type = "sawtooth", i.frequency.value = 55, i.detune.value = 9, r.connect(n), i.connect(n);
  let a = e.createBufferSource();
  a.buffer = o.noise, a.loop = !0;
  let l = e.createBiquadFilter();
  l.type = "bandpass", l.frequency.value = 900, l.Q.value = 6;
  let c = e.createGain();
  c.gain.value = 0.1, a.connect(l), l.connect(c), c.connect(t);
  let u = e.createOscillator();
  u.type = "square", u.frequency.value = 220;
  let d = e.createBiquadFilter();
  d.type = "lowpass", d.frequency.value = 2200;
  let p = e.createGain();
  return p.gain.value = 0, u.connect(d), d.connect(p), p.connect(t), r.start(), i.start(), a.start(), u.start(), {
    gain: t,
    saw1: r,
    saw2: i,
    lp: n,
    scream: l,
    screamGain: c,
    boostOsc: u,
    boostGain: p
  };
}
var qn = -1,
  ar = 0,
  L = {
    laser(o) {
      let e = fe("laser", 0.06);
      if (!e) return;
      let t = ft(o) * 0.16,
        n = no(1500, 1750);
      j(e, {
        type: "square",
        f0: n,
        f1: n * 0.28,
        dur: 0.12,
        vol: t,
        detune: no(-30, 30),
        lp: 4500,
        reverb: 0.2
      }), j(e, {
        type: "sine",
        f0: n * 0.5,
        f1: n * 0.18,
        dur: 0.1,
        vol: t * 0.8
      });
    },
    enemyLaser(o) {
      let e = fe("enemyLaser", 0.08333333333333333);
      if (!e) return;
      let t = ft(o) * 0.13,
        n = no(700, 820);
      j(e, {
        type: "sawtooth",
        f0: n,
        f1: n * 0.3,
        dur: 0.14,
        vol: t,
        detune: no(-40, 40),
        lp: 2600
      }), j(e, {
        type: "square",
        f0: n * 0.51,
        f1: n * 0.2,
        dur: 0.12,
        vol: t * 0.5,
        lp: 1800
      });
    },
    turret(o) {
      let e = fe("turret", 0.125);
      if (!e) return;
      let t = ft(o) * 0.22;
      j(e, {
        type: "sine",
        f0: 160,
        f1: 45,
        dur: 0.22,
        vol: t * 1.2,
        reverb: 0.3
      }), j(e, {
        type: "sawtooth",
        f0: 420,
        f1: 90,
        dur: 0.18,
        vol: t * 0.5,
        lp: 1500
      }), Ve(e, {
        dur: 0.12,
        vol: t * 0.6,
        filter: "lowpass",
        f0: 2500,
        f1: 300
      });
    },
    flak(o) {
      let e = fe("flak", 0.1);
      if (!e) return;
      let t = ft(o) * 0.28;
      Ve(e, {
        dur: 0.35,
        vol: t,
        filter: "lowpass",
        f0: no(1200, 1800),
        f1: 150,
        q: 1.2,
        reverb: 0.45
      }), Ve(e, {
        dur: 0.05,
        vol: t * 0.6,
        filter: "highpass",
        f0: 2500
      });
    },
    hit(o) {
      let e = fe("hit", 0.04);
      if (!e) return;
      let t = ft(o) * 0.12,
        n = no(2400, 3200);
      j(e, {
        type: "triangle",
        f0: n,
        f1: n * 0.8,
        dur: 0.07,
        vol: t,
        attack: 0.001
      }), j(e, {
        type: "square",
        f0: n * 1.47,
        dur: 0.04,
        vol: t * 0.35,
        attack: 0.001,
        lp: 6e3
      }), Ve(e, {
        dur: 0.04,
        vol: t * 0.6,
        filter: "highpass",
        f0: 4e3
      });
    },
    hurt(o) {
      let e = fe("hurt", 0.08);
      if (!e) return;
      let t = ft(o) * 0.35;
      Ve(e, {
        dur: 0.3,
        vol: t,
        filter: "lowpass",
        f0: 900,
        f1: 120,
        q: 3,
        rate: 0.5
      }), j(e, {
        type: "square",
        f0: 330,
        f1: 180,
        dur: 0.14,
        vol: t * 0.35,
        lp: 1400
      }), j(e, {
        type: "triangle",
        f0: 1240,
        f1: 900,
        dur: 0.12,
        vol: t * 0.3,
        attack: 0.001
      });
    },
    explosion(o, e) {
      let t = Math.max(0, Math.min(1, Number.isFinite(o) ? o : 0)),
        n = fe(t < 0.5 ? "explSmall" : "explBig", t < 0.5 ? 0.07 : 0.15, t >= 0.7);
      if (!n) return;
      let s = ft(e) * (0.35 + 0.35 * t),
        r = 0.45 + t * 2.6;
      Ve(n, {
        dur: r,
        vol: s,
        filter: "lowpass",
        f0: 2600 - t * 1200,
        f1: 60 + (1 - t) * 80,
        q: 0.9,
        reverb: 0.3 + t * 0.4,
        rate: 1 - t * 0.5
      }), Ve(n, {
        dur: 0.08 + t * 0.1,
        vol: s * 0.7,
        filter: "bandpass",
        f0: 1800,
        f1: 600,
        q: 0.7
      }), j(n, {
        type: "sine",
        f0: 110 - t * 50,
        f1: 28,
        dur: 0.35 + t * 1.2,
        vol: s * 1.1,
        attack: 0.005,
        reverb: 0
      }), t > 0.5 && (Ve(n, {
        dur: r * 1.2,
        vol: s * 0.55,
        filter: "lowpass",
        f0: 280,
        f1: 40,
        q: 1.5,
        delay: 0.1,
        attack: 0.25,
        rate: 0.35,
        reverb: 0.5
      }), Ve(n, {
        dur: 0.6,
        vol: s * 0.4,
        filter: "bandpass",
        f0: 900,
        f1: 200,
        delay: 0.18 + Math.random() * 0.15,
        q: 1.2
      }));
    },
    missileLaunch(o) {
      let e = fe("missile", 0.1);
      if (!e) return;
      let t = ft(o) * 0.28;
      Ve(e, {
        dur: 0.7,
        vol: t,
        filter: "bandpass",
        f0: 500,
        f1: 3500,
        q: 2,
        attack: 0.05,
        reverb: 0.3
      }), j(e, {
        type: "sawtooth",
        f0: 180,
        f1: 900,
        dur: 0.6,
        vol: t * 0.3,
        attack: 0.04,
        lp: 2e3
      }), j(e, {
        type: "sine",
        f0: 90,
        f1: 40,
        dur: 0.2,
        vol: t * 0.8
      });
    },
    lockTone(o) {
      let e = lr();
      if (!e) return;
      let t = e.ctx.currentTime,
        n = Math.max(0, Math.min(1, Number.isFinite(o) ? o : 0));
      (qn < 0 || t - qn > 0.15 || t < qn) && (ar = t), qn = t, !(t < ar) && (ar = t + (0.28 - 0.22 * n), !(qo >= zi) && j(e, {
        type: "square",
        f0: 1e3 + n * 400,
        dur: 0.05,
        vol: 0.06,
        attack: 0.002,
        lp: 3500,
        reverb: 0
      }));
    },
    lockAcquired() {
      let o = fe("lockAcq", 0.2, !0);
      if (o) for (let e = 0; e < 2; e++) j(o, {
        type: "square",
        f0: 1760,
        dur: 0.08,
        vol: 0.09,
        delay: e * 0.11,
        attack: 0.002,
        lp: 4e3,
        reverb: 0.05
      }), j(o, {
        type: "sine",
        f0: 880,
        dur: 0.08,
        vol: 0.08,
        delay: e * 0.11,
        attack: 0.002
      });
    },
    alarm() {
      let o = fe("alarm", 0.6, !0);
      if (o) for (let e = 0; e < 2; e++) j(o, {
        type: "sawtooth",
        f0: 620,
        f1: 440,
        dur: 0.36,
        vol: 0.12,
        delay: e * 0.4,
        attack: 0.02,
        lp: 1800,
        reverb: 0.25
      }), j(o, {
        type: "square",
        f0: 310,
        f1: 220,
        dur: 0.36,
        vol: 0.06,
        delay: e * 0.4,
        attack: 0.02,
        lp: 1200
      });
    },
    objective() {
      let o = fe("objective", 0.3, !0);
      if (!o) return;
      [523.25, 659.25, 783.99, 1046.5].forEach((t, n) => {
        j(o, {
          type: "triangle",
          f0: t,
          dur: n === 3 ? 0.7 : 0.18,
          vol: 0.14,
          delay: n * 0.08,
          attack: 0.01,
          reverb: 0.4
        }), j(o, {
          type: "sawtooth",
          f0: t,
          dur: n === 3 ? 0.6 : 0.16,
          vol: 0.04,
          delay: n * 0.08,
          detune: 7,
          lp: 2500,
          reverb: 0.4
        });
      });
    },
    uiClick() {
      let o = fe("ui", 0.03, !0);
      o && j(o, {
        type: "sine",
        f0: 1400,
        f1: 900,
        dur: 0.05,
        vol: 0.1,
        attack: 0.001,
        reverb: 0
      });
    },
    respawn() {
      let o = fe("respawn", 0.5, !0);
      o && (Ve(o, {
        dur: 0.9,
        vol: 0.22,
        filter: "bandpass",
        f0: 250,
        f1: 4e3,
        q: 3,
        attack: 0.5,
        reverb: 0.5
      }), j(o, {
        type: "sine",
        f0: 200,
        f1: 1200,
        dur: 0.9,
        vol: 0.1,
        attack: 0.5,
        reverb: 0.5
      }), j(o, {
        type: "triangle",
        f0: 1200,
        dur: 0.4,
        vol: 0.08,
        delay: 0.8,
        reverb: 0.5
      }));
    },
    victory() {
      let o = fe("victory", 1, !0);
      if (!o) return;
      let e = [[392, 0, 0.16], [523.25, 0.16, 0.16], [659.25, 0.32, 0.16], [783.99, 0.48, 0.35], [659.25, 0.86, 0.14], [783.99, 1, 0.14], [1046.5, 1.14, 0.9]];
      for (let [t, n, s] of e) j(o, {
        type: "sawtooth",
        f0: t,
        dur: s + 0.08,
        vol: 0.09,
        delay: n,
        attack: 0.01,
        lp: 3e3,
        reverb: 0.35
      }), j(o, {
        type: "square",
        f0: t,
        dur: s + 0.08,
        vol: 0.04,
        delay: n,
        detune: 8,
        attack: 0.01,
        lp: 2e3,
        reverb: 0.35
      });
      j(o, {
        type: "triangle",
        f0: 130.81,
        dur: 1,
        vol: 0.14,
        delay: 0,
        attack: 0.02
      }), j(o, {
        type: "triangle",
        f0: 130.81,
        dur: 1,
        vol: 0.14,
        delay: 1.14,
        attack: 0.02
      });
    },
    defeat() {
      let o = fe("defeat", 1, !0);
      if (!o) return;
      [392, 349.23, 311.13, 233.08].forEach((t, n) => {
        let s = n === 3 ? 1.1 : 0.4;
        j(o, {
          type: "sawtooth",
          f0: t,
          f1: n === 3 ? t * 0.85 : void 0,
          dur: s,
          vol: 0.09,
          delay: n * 0.38,
          attack: 0.03,
          lp: 1200,
          reverb: 0.5
        }), j(o, {
          type: "sine",
          f0: t / 2,
          dur: s,
          vol: 0.12,
          delay: n * 0.38,
          attack: 0.03
        });
      }), Ve(o, {
        dur: 1.6,
        vol: 0.12,
        filter: "lowpass",
        f0: 300,
        f1: 50,
        delay: 0.4,
        attack: 0.4,
        rate: 0.4,
        reverb: 0.4
      });
    },
    engine(o, e) {
      let t = lr();
      if (!t) return;
      so || (so = bl(t));
      let n = so,
        s = t.ctx.currentTime,
        r = Math.max(0, Math.min(1, Number.isFinite(o) ? o : 0)),
        i = 42 + r * 38 + (e ? 18 : 0);
      n.saw1.frequency.setTargetAtTime(i, s, 0.15), n.saw2.frequency.setTargetAtTime(i * 1.005, s, 0.15), n.lp.frequency.setTargetAtTime(260 + r * 700 + (e ? 600 : 0), s, 0.15), n.scream.frequency.setTargetAtTime(700 + r * 1500 + (e ? 1400 : 0), s, 0.2), n.screamGain.gain.setTargetAtTime(0.05 + r * 0.18 + (e ? 0.12 : 0), s, 0.2), n.boostOsc.frequency.setTargetAtTime(i * 4, s, 0.15), n.boostGain.gain.setTargetAtTime(e ? 0.035 : 0, s, 0.12), n.gain.gain.setTargetAtTime(0.14 + r * 0.08, s, 0.25);
    },
    engineOff() {
      !Bt || !so || (so.gain.gain.setTargetAtTime(0, Bt.ctx.currentTime, 0.2), so.boostGain.gain.setTargetAtTime(0, Bt.ctx.currentTime, 0.1));
    }
  };
import * as T from "./vendor/001-three-0.185.js";
import { GLTFLoader as El } from "./vendor/013-GLTFLoader.js";
var On = {
    enemy: {
      rot: [0, Math.PI, 0],
      size: 10,
      axis: "max",
      anchor: "center"
    },
    dome: {
      rot: [0, 0, 0],
      size: 92,
      axis: "x",
      anchor: "bottom"
    },
    bridge: {
      rot: [0, Math.PI, 0],
      size: 116,
      axis: "x",
      anchor: "bottom"
    },
    hangar: {
      rot: [0, 0, 0],
      size: 140,
      axis: "z",
      anchor: "center"
    },
    reactor: {
      rot: [Math.PI, 0, 0],
      size: 120,
      axis: "x",
      anchor: "top"
    },
    turret: {
      rot: [0, Math.PI, 0],
      size: 16,
      axis: "max",
      anchor: "bottom"
    },
    missile: {
      rot: [0, Math.PI, 0],
      size: 3.4,
      axis: "max",
      anchor: "center"
    },
    dreadnought: {
      rot: [0, Math.PI / 2, 0],
      size: 1800,
      axis: "z",
      anchor: "center"
    }
  },
  gl = new El(),
  ro = new T.Box3(),
  Go = new T.Vector3(),
  Gn = new T.Vector3();
function qi(o) {
  o.traverse(e => {
    if (e instanceof T.Mesh) {
      e.geometry.userData.shared = !0;
      for (let t of [e.material].flat()) t.userData.shared = !0;
    }
  });
}
function Nn(o, e) {
  let t = new T.Group();
  t.add(o), t.rotation.set(e.rot[0], e.rot[1], e.rot[2]), t.updateMatrixWorld(!0), ro.setFromObject(t), ro.getSize(Go);
  let n = e.axis === "max" ? Math.max(Go.x, Go.y, Go.z) : Go[e.axis],
    s = n > 0 ? e.size / n : 1;
  t.scale.setScalar(s), t.updateMatrixWorld(!0), ro.setFromObject(t), ro.getCenter(Gn), t.position.set(-Gn.x, e.anchor === "bottom" ? -ro.min.y : e.anchor === "top" ? -ro.max.y : -Gn.y, -Gn.z);
  let r = new T.Group();
  return r.add(t), r;
}
function Gi(o) {
  let e = 0;
  return o.traverse(t => {
    if (t instanceof T.Mesh) {
      let n = t.geometry;
      e += (n.index ? n.index.count : n.attributes.position.count) / 3;
    }
  }), Math.round(e);
}
async function Oi(o) {
  try {
    let e = await gl.loadAsync(o);
    return e.scene.traverse(t => {
      if (t instanceof T.Mesh) for (let n of [t.material].flat()) n instanceof T.MeshStandardMaterial && (n.envMapIntensity = 1.1);
    }), e.scene;
  } catch (e) {
    return console.warn("model failed to load", o, e), null;
  }
}
var ze = (o, e = 0.5, t = 0.5, n = {}) => new T.MeshStandardMaterial({
  color: o,
  metalness: e,
  roughness: t,
  ...n
});
function yl() {
  let o = new T.Group(),
    e = ze("#d8d4cc", 0.4, 0.5),
    t = ze("#b3262c", 0.4, 0.5),
    n = ze("#3a3a40", 0.6, 0.5),
    s = new T.Mesh(new T.BoxGeometry(1.1, 1, 6), e);
  o.add(s);
  let r = new T.Mesh(new T.ConeGeometry(0.62, 3.4, 4), e);
  r.rotation.x = -Math.PI / 2, r.rotation.y = Math.PI / 4, r.position.z = -4.6, o.add(r);
  for (let i of [-1, 1]) for (let a of [-1, 1]) {
    let l = new T.Mesh(new T.BoxGeometry(4.5, 0.12, 1.8), e);
    l.position.set(i * 2.6, a * 0.55, 1.6), l.rotation.z = i * a * 0.22, o.add(l);
    let c = new T.Mesh(new T.BoxGeometry(2, 0.14, 0.4), t);
    c.position.set(i * 2.4, a * 0.56, 1.1), c.rotation.z = i * a * 0.22, o.add(c);
    let u = new T.Mesh(new T.CylinderGeometry(0.35, 0.35, 2.2, 10), n);
    u.rotation.x = Math.PI / 2, u.position.set(i * 1, a * 0.75, 2.2), o.add(u);
    let d = new T.Mesh(new T.CylinderGeometry(0.07, 0.07, 3.6, 6), n);
    d.rotation.x = Math.PI / 2, d.position.set(i * 4.8, a * 1.05, 0.2), o.add(d);
  }
  return o;
}
function wl() {
  let o = new T.Group(),
    e = new T.MeshStandardMaterial({
      color: "#3f8bff",
      emissive: new T.Color("#2a6cff"),
      emissiveIntensity: 1.2,
      transparent: !0,
      opacity: 0.55,
      metalness: 0.2,
      roughness: 0.1
    }),
    t = new T.Mesh(new T.SphereGeometry(40, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), e);
  t.position.y = 8, o.add(t);
  let n = new T.Mesh(new T.SphereGeometry(40.5, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), new T.MeshBasicMaterial({
    color: new T.Color(0.6, 1.4, 2.4),
    wireframe: !0,
    toneMapped: !1
  }));
  n.position.y = 8, o.add(n);
  let s = new T.Mesh(new T.CylinderGeometry(44, 46, 8, 32), ze("#6d6a66", 0.6, 0.5));
  return s.position.y = 4, o.add(s), o;
}
function vl() {
  let o = new T.Group(),
    e = ze("#8b8781", 0.55, 0.55),
    t = new T.MeshBasicMaterial({
      color: new T.Color(2.2, 1.3, 0.6),
      toneMapped: !1
    }),
    n = new T.Mesh(new T.BoxGeometry(60, 50, 50), e);
  n.position.y = 25, o.add(n);
  let s = new T.Mesh(new T.BoxGeometry(120, 26, 36), e);
  s.position.y = 62, o.add(s);
  let r = new T.Mesh(new T.BoxGeometry(110, 3, 37), t);
  r.position.y = 64, o.add(r);
  for (let i of [-1, 1]) {
    let a = new T.Mesh(new T.SphereGeometry(10, 16, 12), e);
    a.position.set(i * 42, 80, 0), o.add(a);
  }
  return o;
}
function Tl() {
  let o = new T.Group(),
    e = ze("#77736d", 0.55, 0.55),
    t = new T.Mesh(new T.BoxGeometry(90, 50, 170), e);
  o.add(t);
  let n = new T.Mesh(new T.PlaneGeometry(70, 30), new T.MeshBasicMaterial({
    color: new T.Color(2, 1, 0.4),
    toneMapped: !1
  }));
  return n.position.z = -85.5, n.rotation.y = Math.PI, o.add(n), o;
}
function xl() {
  let o = new T.Group(),
    e = ze("#5b5752", 0.6, 0.5),
    t = new T.Mesh(new T.TorusGeometry(48, 12, 10, 32), e);
  t.rotation.x = Math.PI / 2, t.position.y = 10, o.add(t);
  let n = new T.Mesh(new T.CircleGeometry(40, 32), new T.MeshBasicMaterial({
    color: new T.Color(3, 1.2, 0.3),
    toneMapped: !1
  }));
  return n.rotation.x = -Math.PI / 2, n.position.y = 6, o.add(n), o;
}
function Rl() {
  let o = new T.Group(),
    e = ze("#8e8a84", 0.55, 0.5),
    t = ze("#3b3c40", 0.7, 0.4),
    n = new T.Mesh(new T.CylinderGeometry(7, 8, 3, 16), e);
  n.position.y = 1.5, o.add(n);
  let s = new T.Mesh(new T.BoxGeometry(8, 5, 8), e);
  s.position.y = 5.5, o.add(s);
  for (let r of [-1, 1]) {
    let i = new T.Mesh(new T.CylinderGeometry(0.6, 0.6, 9, 8), t);
    i.rotation.x = Math.PI / 2, i.position.set(r * 2, 6, -7), o.add(i);
  }
  return o;
}
function Hl() {
  let o = new T.Group(),
    e = new T.Mesh(new T.CylinderGeometry(0.22, 0.22, 2.6, 10), ze("#d8d4cc", 0.4, 0.5));
  e.rotation.x = Math.PI / 2, o.add(e);
  let t = new T.Mesh(new T.ConeGeometry(0.22, 0.8, 10), ze("#b3262c", 0.4, 0.5));
  return t.rotation.x = -Math.PI / 2, t.position.z = -1.7, o.add(t), o;
}
var Ni = {
    enemy: yl,
    dome: wl,
    bridge: vl,
    hangar: Tl,
    reactor: xl,
    turret: Rl,
    missile: Hl,
    dreadnought: () => new T.Group()
  },
  cr = {
    enemy: ["./assets/017-modelsenemy-fighter-27d05e86-1570-4c67-b9ff-d7e43b3ebf09.gltf-bin"],
    dome: ["./assets/022-modelsshield-dome-4a29b842-1371-4f86-9a74-aadd30bf3988.gltf-binar"],
    bridge: ["./assets/015-modelsbridge-tower-c12b62c5-602f-488c-90aa-cbf28d3b3411.gltf-bina"],
    hangar: ["./assets/018-modelshangar-bay-e8dc5c9f-43aa-46e5-b166-481ec190e167.gltf-binary"],
    reactor: ["./assets/021-modelsreactor-vent-2d6569c1-ba4e-4bef-9fcd-817b278c1832.gltf-bina"],
    turret: ["./assets/019-modelshull-turret-3432c1be-e356-4380-8c28-4bd94b98c636.gltf-binar"],
    missile: ["./assets/020-modelslock-on-missile-72381474-f3ba-463c-888d-c806c3d4aa3e.gltf-b"],
    dreadnought: ["./assets/016-modelsdreadnought-2b6df755-e500-45d0-9346-fbca22697e74.gltf-binar"]
  };
async function Ml(o) {
  for (let t of cr[o]) {
    let n = await Oi(t);
    if (n) {
      let s = Nn(n, On[o]);
      return qi(s), {
        model: s,
        file: !0,
        tris: Gi(s)
      };
    }
  }
  let e = Nn(Ni[o](), {
    ...On[o],
    rot: [0, 0, 0]
  });
  return qi(e), {
    model: e,
    file: !1,
    tris: Gi(e)
  };
}
async function _i() {
  let o = Object.keys(cr),
    e = await Promise.all(o.map(n => Ml(n))),
    t = {
      fromFile: {},
      report: []
    };
  return o.forEach((n, s) => {
    t[n] = e[s].model, t.fromFile[n] = e[s].file, t.report.push(`${n}: ${e[s].file ? "glb" : "procedural"} ${e[s].tris} tris`);
  }), t;
}
function bt(o) {
  let e = new T.Group(),
    t = Nn(Ni[o](), {
      ...On[o],
      rot: [0, 0, 0]
    });
  return e.add(t), (async () => {
    for (let n of cr[o]) {
      let s = await Oi(n);
      if (s) {
        e.remove(t), e.add(Nn(s, On[o]));
        return;
      }
    }
  })(), e;
}
var C0 = ue({
    id: "enemy-fighter",
    name: "Enemy Fighter",
    role: "character",
    create: () => bt("enemy")
  }),
  P0 = ue({
    id: "dreadnought",
    name: "Dreadnought (escort model)",
    role: "structure",
    create: () => bt("dreadnought")
  }),
  z0 = ue({
    id: "shield-dome",
    name: "Shield Dome",
    role: "structure",
    create: () => bt("dome")
  }),
  B0 = ue({
    id: "bridge-tower",
    name: "Bridge Tower",
    role: "structure",
    create: () => bt("bridge")
  }),
  I0 = ue({
    id: "hangar-bay",
    name: "Hangar Bay",
    role: "structure",
    create: () => bt("hangar")
  }),
  L0 = ue({
    id: "reactor-vent",
    name: "Reactor Vent",
    role: "structure",
    create: () => bt("reactor")
  }),
  q0 = ue({
    id: "hull-turret",
    name: "Hull Turret",
    role: "prop",
    create: () => bt("turret")
  }),
  G0 = ue({
    id: "lock-on-missile",
    name: "Lock-on Missile",
    role: "prop",
    create: () => bt("missile")
  });
import * as g from "./vendor/001-three-0.185.js";
import * as N from "./vendor/001-three-0.185.js";
function Et(o) {
  let e = o >>> 0;
  return () => {
    e = e + 1831565813 >>> 0;
    let t = e;
    return t = Math.imul(t ^ t >>> 15, t | 1), t ^= t + Math.imul(t ^ t >>> 7, t | 61), ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
var io = (o, e, t) => o < e ? e : o > t ? t : o;
var ve = -700,
  et = 700,
  Ue = et - ve,
  ur = 6,
  dr = -6,
  Be = o => (o - ve) / Ue,
  ae = o => 8 + 312 * o,
  It = o => 14 + 70 * o,
  Lt = o => -(12 + 52 * o),
  Fn = [{
    f: 0.68,
    h: 5,
    t0: 0.16,
    t1: 0.78
  }, {
    f: 0.4,
    h: 10,
    t0: 0.32,
    t1: 0.78
  }],
  kl = {
    f: 0.55,
    h: 5,
    t0: 0.2,
    t1: 0.9
  };
function Sl(o, e) {
  let t = ae(e),
    n = 0;
  for (let s of Fn) e >= s.t0 && e <= s.t1 && o < s.f * t && (n = Math.max(n, s.h));
  return n;
}
function Vl(o, e) {
  let t = ae(e),
    n = kl;
  return e >= n.t0 && e <= n.t1 && o < n.f * t ? n.h : 0;
}
function No(o, e) {
  let t = io(Be(e), 0, 1),
    n = ae(t),
    s = Math.min(1, Math.abs(o) / n);
  return ur + (It(t) - ur) * (1 - s) + Sl(Math.abs(o), t);
}
function _o(o, e) {
  let t = io(Be(e), 0, 1),
    n = ae(t),
    s = Math.min(1, Math.abs(o) / n);
  return dr + (Lt(t) - dr) * (1 - s) - Vl(Math.abs(o), t);
}
function Dn(o, e, t) {
  let n = io(Be(e), 0, 1),
    s = ae(n);
  return t.set(Math.sign(o || 1) * ((It(n) - ur) / s), 1, -0.05).normalize();
}
function Un(o, e, t) {
  let n = io(Be(e), 0, 1),
    s = ae(n);
  return t.set(Math.sign(o || 1) * ((dr - Lt(n)) / s), -1, -0.04).normalize();
}
var Oo = (o, e, t, n, s, r) => ({
    min: new N.Vector3(o, e, t),
    max: new N.Vector3(n, s, r)
  }),
  ao = [Oo(-175, 20, 390, 175, 96, 695), Oo(-62, 90, 455, 62, 150, 690)],
  G = [{
    index: 0,
    kind: "dome",
    name: "Port Shield Dome",
    short: "Port Dome",
    aim: new N.Vector3(-118, 128, 565),
    base: new N.Vector3(-118, 96, 565),
    spheres: [{
      c: new N.Vector3(-118, 108, 565),
      r: 46
    }],
    boxes: [],
    baseHp: 900,
    stage: 0,
    facing: new N.Vector3(0, 1, 0)
  }, {
    index: 1,
    kind: "dome",
    name: "Starboard Shield Dome",
    short: "Stbd Dome",
    aim: new N.Vector3(118, 128, 565),
    base: new N.Vector3(118, 96, 565),
    spheres: [{
      c: new N.Vector3(118, 108, 565),
      r: 46
    }],
    boxes: [],
    baseHp: 900,
    stage: 0,
    facing: new N.Vector3(0, 1, 0)
  }, {
    index: 2,
    kind: "hangar",
    name: "Port Hangar Bay",
    short: "Port Hangar",
    aim: new N.Vector3(-140, -58, 125),
    base: new N.Vector3(-105, -56, 125),
    spheres: [],
    boxes: [Oo(-142, -99, 55, -68, -14, 195)],
    baseHp: 1100,
    stage: 1,
    facing: new N.Vector3(-1, -0.2, 0).normalize()
  }, {
    index: 3,
    kind: "hangar",
    name: "Starboard Hangar Bay",
    short: "Stbd Hangar",
    aim: new N.Vector3(140, -58, 125),
    base: new N.Vector3(105, -56, 125),
    spheres: [],
    boxes: [Oo(68, -99, 55, 142, -14, 195)],
    baseHp: 1100,
    stage: 1,
    facing: new N.Vector3(1, -0.2, 0).normalize()
  }, {
    index: 4,
    kind: "bridge",
    name: "Bridge Tower",
    short: "Bridge",
    aim: new N.Vector3(0, 200, 600),
    base: new N.Vector3(0, 148, 610),
    spheres: [],
    boxes: [Oo(-58, 148, 560, 58, 250, 660)],
    baseHp: 1500,
    stage: 1,
    facing: new N.Vector3(0, 0.3, -1).normalize()
  }, {
    index: 5,
    kind: "reactor",
    name: "Reactor Core",
    short: "Reactor",
    aim: new N.Vector3(0, -78, 380),
    base: new N.Vector3(0, -54, 380),
    spheres: [{
      c: new N.Vector3(0, -70, 380),
      r: 42
    }],
    boxes: [],
    baseHp: 2e3,
    stage: 2,
    facing: new N.Vector3(0, -1, 0)
  }],
  qt = G.length;
function gt(o) {
  return o[0] > 0 || o[1] > 0 ? 0 : o[2] > 0 || o[3] > 0 || o[4] > 0 ? 1 : 2;
}
function Al() {
  let o = Et(90210),
    e = [],
    t = u => G.some(d => d.aim.distanceTo(u) < 70) || ao.some(d => pr(u, d, 8)),
    n = [],
    s = (u, d, p) => {
      let m = [];
      for (let f = 0; m.length < u && f < 4e3; f++) {
        let h = p();
        h && (n.some(E => E.pos.distanceTo(h.pos) < d) || (n.push(h), m.push(h)));
      }
      return m;
    },
    r = s(14, 110, () => {
      let u = -560 + o() * 940,
        d = ae(Be(u)),
        p = (o() < 0.5 ? -1 : 1) * d * (0.12 + o() * 0.72),
        m = new N.Vector3(p, No(p, u), u);
      return t(m) ? null : {
        index: 0,
        pos: m,
        normal: Dn(p, u, new N.Vector3())
      };
    }),
    i = s(8, 110, () => {
      let u = -500 + o() * 1150,
        d = ae(Be(u)),
        p = (o() < 0.5 ? -1 : 1) * d * (0.15 + o() * 0.7),
        m = new N.Vector3(p, _o(p, u), u);
      return t(m) || G.some(f => f.kind === "hangar" && Math.abs(f.base.x - p) < 75 && Math.abs(f.base.z - u) < 135) ? null : {
        index: 0,
        pos: m,
        normal: Un(p, u, new N.Vector3())
      };
    }),
    a = s(6, 70, () => {
      let u = (o() < 0.5 ? -1 : 1) * (72 + o() * 95),
        d = 400 + o() * 280,
        p = new N.Vector3(u, 96, d);
      return G.some(m => m.kind === "dome" && m.base.distanceTo(p) < 64) ? null : {
        index: 0,
        pos: p,
        normal: new N.Vector3(0, 1, 0)
      };
    }),
    l = [r, i, r, a],
    c = r.length + i.length + a.length;
  for (let u = 0; e.length < c; u++) {
    let p = l[u % 4].shift();
    if (p && e.push(p), u > 200) break;
  }
  return e.forEach((u, d) => u.index = d), e;
}
function pr(o, e, t) {
  return o.x > e.min.x - t && o.x < e.max.x + t && o.y > e.min.y - t && o.y < e.max.y + t && o.z > e.min.z - t && o.z < e.max.z + t;
}
var te = Al(),
  be = te.length,
  Cl = 6,
  Fi = 9,
  _n = new N.Vector3();
function Pl(o, e, t) {
  if (o.z < ve - e || o.z > et + e) return 0;
  let n = io(Be(o.z), 0, 1),
    s = ae(n),
    r = Math.abs(o.x);
  if (r > s + e) return 0;
  let i = No(o.x, o.z),
    a = _o(o.x, o.z);
  if (o.y > i + e || o.y < a - e) return 0;
  let l = i + e - o.y,
    c = o.y - (a - e),
    u = s + e - r,
    d = et + e - o.z,
    p = o.z - (ve - e),
    m = l;
  return Dn(o.x, o.z, t), c < m && (m = c, Un(o.x, o.z, t)), u < m && (m = u, t.set(Math.sign(o.x || 1), 0, -312 / Ue).normalize()), d < m && (m = d, t.set(0, 0, 1)), p < m && (m = p, t.set(0, 0, -1)), m;
}
function zl(o, e, t, n) {
  if (!pr(o, t, e)) return 0;
  let s = [o.x - (t.min.x - e), t.max.x + e - o.x, o.y - (t.min.y - e), t.max.y + e - o.y, o.z - (t.min.z - e), t.max.z + e - o.z],
    r = 0;
  for (let l = 1; l < 6; l++) s[l] < s[r] && (r = l);
  let i = r >> 1,
    a = r & 1 ? 1 : -1;
  return n.set(i === 0 ? a : 0, i === 1 ? a : 0, i === 2 ? a : 0), s[r];
}
function Bl(o, e, t, n, s) {
  let r = o.x - t.x,
    i = o.y - t.y,
    a = o.z - t.z,
    l = r * r + i * i + a * a,
    c = e + n;
  if (l >= c * c) return 0;
  let u = Math.sqrt(l) || 1e-4;
  return s.set(r / u, i / u, a / u), c - u;
}
var Il = [...ao, ...G.flatMap(o => o.boxes)],
  Ll = G.flatMap(o => o.spheres);
function lo(o, e, t) {
  if (o.x < -340 - e || o.x > 340 + e || o.y < -110 - e || o.y > 260 + e || o.z < ve - e || o.z > et + e) return 0;
  let n = Pl(o, e, t);
  for (let s of Il) {
    let r = zl(o, e, s, _n);
    r > n && (n = r, t.copy(_n));
  }
  for (let s of Ll) {
    let r = Bl(o, e, s.c, s.r, _n);
    r > n && (n = r, t.copy(_n));
  }
  return n;
}
var ql = new N.Vector3();
function jn(o, e = 0.5) {
  return lo(o, e, ql) > 0;
}
function mr(o, e = 2) {
  for (let t of G) {
    for (let n of t.spheres) if (o.distanceToSquared(n.c) < (n.r + e) * (n.r + e)) return t.index;
    for (let n of t.boxes) if (pr(o, n, e)) return t.index;
  }
  return -1;
}
function Ae(o, e) {
  return e.copy(o.pos).addScaledVector(o.normal, Cl);
}
var Di = new N.Vector3(0, 330, -1350),
  Fo = 3200;
function Wn(o, e) {
  let t = G[o];
  return e.set(t.base.x + Math.sign(t.base.x) * 50, t.base.y - 6, t.base.z + (Math.random() - 0.5) * 80);
}
function Yn(o, e) {
  let t = G[o];
  return e.set(Math.sign(t.base.x), -0.25, -0.35).normalize();
}
var co = 6,
  Qn = -6,
  wt = 1 / 90,
  Gl = 1;
function Ol() {
  let e = Et(7),
    t = () => {
      let d = document.createElement("canvas");
      return d.width = d.height = 1024, [d, d.getContext("2d")];
    },
    [n, s] = t(),
    [r, i] = t(),
    [a, l] = t();
  s.fillStyle = "#86817a", s.fillRect(0, 0, 1024, 1024), i.fillStyle = "#000", i.fillRect(0, 0, 1024, 1024), l.fillStyle = "#9a9a9a", l.fillRect(0, 0, 1024, 1024);
  let c = (d, p, m, f, h) => {
    if (h > 0 && (m > 60 || f > 60) && e() < 0.85) {
      if (m > f) {
        let v = Math.round(m * (0.3 + e() * 0.4));
        c(d, p, v, f, h - 1), c(d + v, p, m - v, f, h - 1);
      } else {
        let v = Math.round(f * (0.3 + e() * 0.4));
        c(d, p, m, v, h - 1), c(d, p + v, m, f - v, h - 1);
      }
      return;
    }
    let E = 134 + Math.floor((e() - 0.5) * 40),
      M = Math.floor(e() * 8);
    if (s.fillStyle = `rgb(${E + M},${E + M / 2},${E - 4})`, s.fillRect(d, p, m, f), l.fillStyle = `rgb(${130 + Math.floor(e() * 90)},0,0)`, l.fillRect(d, p, m, f), e() < 0.25) {
      s.fillStyle = "rgba(40,38,36,0.55)";
      let v = m * (0.2 + e() * 0.5),
        V = f * (0.2 + e() * 0.5);
      if (s.fillRect(d + (m - v) / 2, p + (f - V) / 2, v, V), e() < 0.5) {
        s.strokeStyle = "rgba(30,30,30,0.5)", s.lineWidth = 1;
        for (let C = 0; C < V; C += 4) s.beginPath(), s.moveTo(d + (m - v) / 2, p + (f - V) / 2 + C), s.lineTo(d + (m + v) / 2, p + (f - V) / 2 + C), s.stroke();
      }
    }
    if (e() < 0.08) {
      let v = 2 + Math.floor(e() * 8);
      for (let V = 0; V < v; V++) i.fillStyle = e() < 0.8 ? "#ffb060" : "#9fd8ff", i.fillRect(d + 4 + V * 7, p + f / 2, 4, 3), s.fillStyle = "#2a2622", s.fillRect(d + 3 + V * 7, p + f / 2 - 1, 6, 5);
    }
    s.strokeStyle = "rgba(60,56,52,0.75)", s.lineWidth = 1.5, s.strokeRect(d + 1, p + 1, m - 2, f - 2), s.strokeStyle = "rgba(200,196,188,0.25)", s.lineWidth = 1, s.beginPath(), s.moveTo(d + 2, p + f - 2), s.lineTo(d + 2, p + 2), s.lineTo(d + m - 2, p + 2), s.stroke();
  };
  for (let d = 0; d < 1024; d += 256) for (let p = 0; p < 1024; p += 256) c(p, d, 256, 256, 5);
  for (let d = 0; d < 60; d++) {
    let p = e() * 1024,
      m = e() * 1024,
      f = 20 + e() * 90,
      h = s.createRadialGradient(p, m, 0, p, m, f);
    h.addColorStop(0, "rgba(40,34,30,0.18)"), h.addColorStop(1, "rgba(40,34,30,0)"), s.fillStyle = h, s.fillRect(p - f, m - f, f * 2, f * 2);
  }
  let u = (d, p) => {
    let m = new g.CanvasTexture(d);
    return m.wrapS = m.wrapT = g.RepeatWrapping, m.anisotropy = 8, p && (m.colorSpace = g.SRGBColorSpace), m.userData.shared = !0, m;
  };
  return {
    map: u(n, !0),
    emissive: u(r, !0),
    rough: u(a, !1)
  };
}
function hr(o, e, t, n, s, r) {
  let i = (c, u, d, p, m) => {
      s.push(c, u, d), r.push(p, m);
    },
    a = (c, u, d, p) => {
      for (let m of [c, u, d]) p ? i(m[0], m[1], m[2], m[2] * wt, m[1] * wt) : i(m[0], m[1], m[2], m[0] * wt, m[2] * wt);
    };
  for (let c = 0; c < n; c++) {
    let u = e + (t - e) * c / n,
      d = e + (t - e) * (c + 1) / n,
      p = ve + u * Ue,
      m = ve + d * Ue,
      f = o(u),
      h = o(d);
    for (let E = 0; E < f.length; E++) {
      let M = (E + 1) % f.length,
        v = [f[E][0], f[E][1], p],
        V = [f[M][0], f[M][1], p],
        C = [h[E][0], h[E][1], m],
        U = [h[M][0], h[M][1], m],
        ne = Math.abs(f[E][0] - f[M][0]) < Math.abs(f[E][1] - f[M][1]) * 0.8;
      a(v, U, V, ne), a(v, C, U, ne);
    }
  }
  let l = (c, u) => {
    let d = o(c),
      p = ve + c * Ue,
      m = 0,
      f = 0;
    for (let h of d) m += h[0] / d.length, f += h[1] / d.length;
    for (let h = 0; h < d.length; h++) {
      let E = (h + 1) % d.length,
        M = u > 0 ? [[m, f], d[E], d[h]] : [[m, f], d[h], d[E]];
      for (let v of M) i(v[0], v[1], p, v[0] * wt, v[1] * wt);
    }
  };
  l(t, 1), l(e, -1);
}
function $n(o, e, t) {
  let {
      min: n,
      max: s
    } = o,
    r = (i, a) => {
      let l = [0, 1, 2, 0, 2, 3];
      for (let c of l) e.push(i[c][0], i[c][1], i[c][2]), t.push(i[c][a[0]] * wt, i[c][a[1]] * wt);
    };
  r([[n.x, s.y, n.z], [n.x, s.y, s.z], [s.x, s.y, s.z], [s.x, s.y, n.z]], [0, 2]), r([[n.x, n.y, n.z], [s.x, n.y, n.z], [s.x, n.y, s.z], [n.x, n.y, s.z]], [0, 2]), r([[s.x, n.y, n.z], [s.x, s.y, n.z], [s.x, s.y, s.z], [s.x, n.y, s.z]], [2, 1]), r([[n.x, n.y, n.z], [n.x, n.y, s.z], [n.x, s.y, s.z], [n.x, s.y, n.z]], [2, 1]), r([[n.x, n.y, s.z], [s.x, n.y, s.z], [s.x, s.y, s.z], [n.x, s.y, s.z]], [0, 1]), r([[n.x, n.y, n.z], [n.x, s.y, n.z], [s.x, s.y, n.z], [s.x, n.y, n.z]], [0, 1]);
}
function Nl(o, e) {
  let t = new g.BufferGeometry();
  return t.setAttribute("position", new g.Float32BufferAttribute(o, 3)), t.setAttribute("uv", new g.Float32BufferAttribute(e, 2)), t.computeVertexNormals(), t.computeBoundingSphere(), t.userData.shared = !0, t;
}
function _l() {
  let o = new g.ShaderMaterial({
    uniforms: {
      uTime: {
        value: 0
      },
      uHit: {
        value: 0
      },
      uColor: {
        value: new g.Color(0.35, 0.8, 2.2)
      }
    },
    vertexShader: `
      varying vec3 vN; varying vec3 vV; varying vec3 vP;
      void main() {
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vP = position;
        vN = normalize(mat3(modelMatrix) * normal);
        vV = normalize(cameraPosition - wp.xyz);
        gl_Position = projectionMatrix * viewMatrix * wp;
      }`,
    fragmentShader: `
      uniform float uTime; uniform float uHit; uniform vec3 uColor;
      varying vec3 vN; varying vec3 vV; varying vec3 vP;
      void main() {
        float f = pow(1.0 - abs(dot(vN, vV)), 2.5);
        vec3 p = vP * 0.12;
        float hex = abs(sin(p.x * 3.0 + p.y * 1.7) * sin(p.y * 3.0 - p.z * 1.7) * sin(p.z * 3.0 + p.x * 1.7));
        float lines = smoothstep(0.92, 1.0, 1.0 - hex);
        float scan = 0.5 + 0.5 * sin(vP.y * 0.25 - uTime * 2.0);
        float a = f * (0.35 + 0.25 * scan) + lines * 0.12 + uHit * (0.25 + f);
        gl_FragColor = vec4(uColor * a, 1.0);
      }`,
    transparent: !0,
    depthWrite: !1,
    blending: g.AdditiveBlending,
    side: g.DoubleSide,
    toneMapped: !1
  });
  return o.userData.shared = !0, o;
}
var Kn = new g.Vector3(),
  yt = new g.Vector3(),
  Fl = new g.Quaternion(),
  fr = new g.Vector3(0, 1, 0),
  Xn = class {
    constructor(e, t) {
      this.fx = t;
      let n = Ol(),
        s = new g.MeshStandardMaterial({
          color: "#d8d2ca",
          map: n.map,
          roughnessMap: n.rough,
          roughness: 0.8,
          metalness: 0.55,
          emissive: new g.Color(1.6, 0.95, 0.5),
          emissiveMap: n.emissive,
          emissiveIntensity: 1.4,
          flatShading: !0
        });
      s.userData.shared = !0, this.charred = new g.MeshStandardMaterial({
        color: "#231e1b",
        roughness: 0.95,
        metalness: 0.3,
        emissive: new g.Color(0.9, 0.25, 0.05),
        emissiveIntensity: 0.35
      }), this.charred.userData.shared = !0;
      let r = [],
        i = [];
      hr(h => {
        let E = ae(h);
        return [[0, It(h)], [E, co], [E, Qn], [0, Lt(h)], [-E, Qn], [-E, co]];
      }, 0, 1, 24, r, i);
      for (let h of Fn) hr(E => {
        let M = ae(E),
          v = h.f * M,
          V = co + (It(E) - co) * (1 - h.f);
        return [[0, It(E) + h.h], [v, V + h.h], [v, V - 2], [-v, V - 2], [-v, V + h.h]];
      }, h.t0, h.t1, 12, r, i);
      hr(h => {
        let M = 0.55 * ae(h),
          v = Qn + (Lt(h) - Qn) * (1 - 0.55);
        return [[0, Lt(h) + 2], [-M, v + 2], [-M, v - 5], [0, Lt(h) - 5], [M, v - 5], [M, v + 2]].reverse();
      }, 0.2, 0.9, 12, r, i);
      for (let h of ao) $n(h, r, i);
      $n({
        min: new g.Vector3(-200, 10, 600),
        max: new g.Vector3(200, 60, 700)
      }, r, i), $n({
        min: new g.Vector3(-120, 90, 420),
        max: new g.Vector3(120, 112, 470)
      }, r, i), $n({
        min: new g.Vector3(-40, 150, 470),
        max: new g.Vector3(40, 160, 540)
      }, r, i);
      let l = new g.Mesh(Nl(r, i), s);
      this.group.add(l), this.buildGreebles(s), this.buildLights(), this.buildEngines();
      for (let h of G) {
        let E = new g.Group();
        E.position.copy(h.base);
        let M = h.kind,
          v = e[M].clone(!0);
        h.kind === "hangar" && Math.sign(h.base.x) !== Gl && (v.rotation.y = Math.PI), E.add(v);
        let V = v.clone(!0);
        V.traverse(ne => {
          ne instanceof g.Mesh && (ne.material = this.charred);
        }), V.scale.set(1, h.kind === "dome" ? 0.35 : 0.6, 1), V.rotation.z = h.kind === "dome" ? 0.12 : 0.05, V.visible = !1, E.add(V);
        let C = null,
          U = null;
        if (h.stage > 0) {
          U = _l();
          let ne = h.kind === "hangar" ? 95 : h.kind === "bridge" ? 90 : 70;
          C = new g.Mesh(new g.SphereGeometry(ne, 32, 16), U), C.geometry.userData.shared = !0, C.position.copy(h.aim).sub(h.base), h.kind === "hangar" && C.scale.set(0.7, 0.75, 1.05), h.kind === "reactor" && C.scale.set(1, 0.55, 1), E.add(C);
        }
        this.group.add(E), this.comps.push({
          root: E,
          model: v,
          wreck: V,
          shield: C,
          shieldMat: U,
          destroyed: !1,
          hit: 0,
          smokeT: 0
        });
      }
      let c = G[5],
        u = s;
      for (let h = 0; h < 6; h++) {
        let E = new g.CylinderGeometry(46, 46, 5, 8, 1, !1, h / 6 * Math.PI * 2, Math.PI / 3);
        E.userData.shared = !0;
        let M = new g.Mesh(E, u);
        M.position.set(c.base.x, c.base.y - 24, c.base.z), M.userData.angle = h / 6 * Math.PI * 2 + Math.PI / 6, this.group.add(M), this.reactorPlates.push(M);
      }
      let d = new g.MeshBasicMaterial({
        color: new g.Color(3.2, 1.3, 0.35),
        toneMapped: !1
      });
      d.userData.shared = !0;
      let p = new g.SphereGeometry(24, 24, 16);
      p.userData.shared = !0, this.reactorCore = new g.Mesh(p, d), this.reactorCore.position.set(c.base.x, c.base.y - 12, c.base.z), this.group.add(this.reactorCore);
      let m = new g.CylinderGeometry(5, 7, 3, 10);
      m.userData.shared = !0;
      let f = Dl();
      for (let h of te) {
        let E = new g.Group();
        E.position.copy(h.pos), E.quaternion.setFromUnitVectors(fr, h.normal);
        let M = new g.Group(),
          v = new g.LOD();
        v.addLevel(e.turret.clone(!0), 0), v.addLevel(f.clone(!0), 420), M.add(v), E.add(M);
        let V = new g.Mesh(m, this.charred);
        V.position.y = 1, V.visible = !1, E.add(V), E.visible = !1, this.group.add(E), this.turrets.push({
          root: E,
          yaw: M,
          stump: V,
          state: 0,
          angle: 0,
          smokeT: Math.random()
        });
      }
      if (e.fromFile.dreadnought) {
        let h = (E, M, v, V, C) => {
          let U = e.dreadnought.clone(!0);
          U.position.set(E, M, v), U.rotation.y = V, U.scale.setScalar(C), this.escorts.add(U);
        };
        h(-4200, 900, -3200, -0.6, 1.1), h(4800, -700, 2600, 2.4, 1.3), this.group.add(this.escorts);
      }
    }
    group = new g.Group();
    comps = [];
    turrets = [];
    engines = [];
    reactorPlates = [];
    reactorCore;
    reactorOpen = 0;
    charred;
    time = 0;
    escorts = new g.Group();
    buildGreebles(e) {
      let t = Et(1234),
        n = 1500,
        s = new g.BoxGeometry(1, 1, 1);
      s.userData.shared = !0;
      let r = new g.MeshStandardMaterial({
        color: "#8d8881",
        roughness: 0.7,
        metalness: 0.5,
        flatShading: !0
      });
      r.userData.shared = !0;
      let i = new g.InstancedMesh(s, r, n),
        a = new g.Matrix4(),
        l = new g.Quaternion(),
        c = new g.Vector3(),
        u = new g.Vector3(),
        d = new g.Vector3(),
        p = new g.Color(),
        m = (h, E, M) => {
          for (let v of G) if (Math.hypot(v.base.x - h, v.base.z - M) < 70 && Math.abs(v.base.y - E) < 90) return !0;
          for (let v of ao) if (h > v.min.x - 4 && h < v.max.x + 4 && M > v.min.z - 4 && M < v.max.z + 4 && E > 0) return !0;
          for (let v of te) if (Math.abs(v.pos.x - h) < 16 && Math.abs(v.pos.z - M) < 16 && Math.abs(v.pos.y - E) < 20) return !0;
          return !1;
        },
        f = 0;
      for (let h = 0; f < n && h < n * 4; h++) {
        let E = t() < 0.72,
          M = ve + 30 + t() * (Ue - 40),
          v = ae(Be(M)),
          V = (t() < 0.5 ? -1 : 1) * v * Math.pow(t(), 0.8) * 0.95,
          C = E ? No(V, M) : _o(V, M);
        if (m(V, C, M)) continue;
        E ? Dn(V, M, d) : Un(V, M, d);
        let U = t(),
          ne = t() < 0.12,
          dt = t(),
          St = ne ? 1.2 + t() * 1.5 : 1.5 + U * U * 12,
          pt = ne ? 30 + t() * 90 : 1.5 + dt * dt * 20,
          Xe = ne ? 0.8 + t() * 1.2 : 0.3 + Math.pow(t(), 4) * 4;
        c.set(St, Xe, pt), l.setFromUnitVectors(fr, d), u.set(V, C, M).addScaledVector(d, Xe / 2 - 0.4), a.compose(u, l, c), i.setMatrixAt(f, a);
        let Ze = 0.7 + t() * 0.35;
        p.setRGB(Ze, Ze * 0.98, Ze * 0.94), i.setColorAt(f, p), f++;
      }
      i.count = f, this.group.add(i);
    }
    buildLights() {
      let e = Et(55),
        t = new g.BoxGeometry(1, 1, 1);
      t.userData.shared = !0;
      let n = new g.MeshBasicMaterial({
        color: "#ffffff",
        toneMapped: !1
      });
      n.userData.shared = !0;
      let s = 1400,
        r = new g.InstancedMesh(t, n, s),
        i = new g.Matrix4(),
        a = new g.Quaternion(),
        l = new g.Vector3(),
        c = new g.Vector3(),
        u = new g.Color(2.4, 1.25, 0.5),
        d = new g.Color(0.8, 1.6, 2.6),
        p = 0,
        m = (h, E, M, v, V, C, U = 0, ne = u) => {
          p >= s || (a.setFromAxisAngle(fr, U), i.compose(c.set(h, E, M), a, l.set(v, V, C)), r.setMatrixAt(p, i), r.setColorAt(p, ne), p++);
        },
        f = Math.atan2(312, Ue);
      for (let h of [-1, 1]) for (let E = ve + 60; E < et - 10; E += 5.5) {
        if (e() < 0.35) continue;
        let M = ae(Be(E));
        for (let v of [-2.4, 2.4]) e() < 0.3 || m(h * (M + 0.25), v, E, 0.4, 1, 2.8, h * f);
      }
      for (let h of Fn) for (let E of [-1, 1]) for (let M = h.t0 + 0.01; M < h.t1; M += 0.006) {
        if (e() < 0.45) continue;
        let v = ve + M * Ue,
          V = ae(M),
          C = h.f * V,
          U = co + (It(M) - co) * (1 - h.f);
        m(E * (C + 0.3), U + h.h * 0.35, v, 0.4, 0.8, 3.5, E * f * h.f);
      }
      for (let h of ao) {
        let E = Math.floor((h.max.y - h.min.y - 8) / 7);
        for (let M = 0; M < E; M++) {
          let v = h.min.y + 8 + M * 7;
          if (!(v < 30)) {
            for (let V = h.min.x + 4; V < h.max.x - 4; V += 5) e() < 0.45 || m(V, v, h.min.z - 0.3, 2.6, 1.1, 0.4);
            for (let V = h.min.z + 4; V < h.max.z - 4; V += 5) e() < 0.5 || (m(h.min.x - 0.3, v, V, 0.4, 1.1, 2.6), e() < 0.5 && m(h.max.x + 0.3, v, V, 0.4, 1.1, 2.6));
          }
        }
      }
      for (let h = 0; h < 260; h++) {
        let E = ve + 40 + e() * (Ue - 60),
          M = ae(Be(E)),
          v = (e() - 0.5) * 2 * M * 0.9,
          C = e() < 0.75 ? No(v, E) + 0.6 : _o(v, E) - 0.6;
        m(v, C, E, 1.2, 0.5, 1.2, 0, e() < 0.2 ? d : u);
      }
      r.count = p, r.instanceMatrix.needsUpdate = !0, r.instanceColor && (r.instanceColor.needsUpdate = !0), this.group.add(r);
    }
    buildEngines() {
      let t = new g.MeshStandardMaterial({
        color: "#3a3836",
        metalness: 0.8,
        roughness: 0.4,
        side: g.DoubleSide
      });
      t.userData.shared = !0;
      let n = new g.MeshBasicMaterial({
        color: new g.Color(1.2, 2.4, 3.6),
        toneMapped: !1
      });
      n.userData.shared = !0;
      let s = [[0, 8, 36], [-120, 6, 30], [120, 6, 30], [-215, 2, 17], [215, 2, 17], [-60, -22, 14], [60, -22, 14]];
      for (let [r, i, a] of s) {
        let l = new g.CylinderGeometry(a, a * 1.1, 20, 24, 1, !0);
        l.userData.shared = !0;
        let c = new g.Mesh(l, t);
        c.rotation.x = Math.PI / 2, c.position.set(r, i, et + 8), this.group.add(c);
        let u = new g.CircleGeometry(a * 0.92, 24);
        u.userData.shared = !0;
        let d = new g.Mesh(u, n);
        d.position.set(r, i, et + 4), this.group.add(d);
        let p = zt("#7fd0ff", a * 0.95);
        p.position.set(r, i, et + 12), this.group.add(p), this.engines.push(p);
      }
    }
    shieldHit(e) {
      this.comps[e].hit = 1;
    }
    sync(e, t, n) {
      for (let s = 0; s < this.comps.length; s++) {
        let r = this.comps[s],
          i = G[s],
          a = e[s] <= 0;
        a !== r.destroyed && (r.destroyed = a, r.model.visible = !a, r.wreck.visible = a), r.shield && (r.shield.visible = !a && t < i.stage);
      }
      this.reactorOpenTarget = t >= 2 ? 1 : 0;
      for (let s = 0; s < this.turrets.length; s++) {
        let r = this.turrets[s],
          i = n[s] ?? 0,
          a = i === 0 ? 0 : i === 1 ? 1 : 2;
        a !== r.state && (r.state = a, r.root.visible = a !== 0, r.yaw.visible = a === 2, r.stump.visible = a === 1);
      }
    }
    reactorOpenTarget = 0;
    settle() {
      this.reactorOpen = this.reactorOpenTarget;
    }
    aimTurret(e, t, n) {
      let s = this.turrets[e];
      if (s.state !== 2 || !t) return;
      Kn.copy(t), s.root.worldToLocal(Kn);
      let i = Math.atan2(-Kn.x, -Kn.z) - s.angle;
      i = Math.atan2(Math.sin(i), Math.cos(i)), s.angle += Math.max(-1.6 * n, Math.min(1.6 * n, i)), s.yaw.rotation.y = s.angle;
    }
    update(e) {
      this.time += e;
      for (let s of this.engines) De(s, 0.75 + 0.05 * Math.sin(this.time * 3), !1);
      this.reactorOpen += (this.reactorOpenTarget - this.reactorOpen) * Math.min(1, e * 0.6);
      let t = this.comps[5].destroyed;
      for (let s of this.reactorPlates) {
        let r = s.userData.angle,
          i = this.reactorOpen * 60;
        s.position.set(G[5].base.x + Math.cos(r) * i, G[5].base.y - 24 + this.reactorOpen * 14, G[5].base.z - Math.sin(r) * i), s.visible = this.reactorOpen < 0.98;
      }
      let n = 0.75 + 0.25 * Math.sin(this.time * (3 + this.reactorOpen * 5));
      this.reactorCore.visible = !t, this.reactorCore.scale.setScalar((0.6 + this.reactorOpen * 0.5) * (0.92 + 0.08 * n));
      for (let s = 0; s < this.comps.length; s++) {
        let r = this.comps[s];
        if (r.shieldMat && (r.hit = Math.max(0, r.hit - e * 2.5), r.shieldMat.uniforms.uTime.value = this.time, r.shieldMat.uniforms.uHit.value = r.hit), r.destroyed && (r.smokeT -= e, r.smokeT <= 0)) {
          r.smokeT = 0.12 + Math.random() * 0.2;
          let i = G[s];
          yt.copy(i.aim), yt.x += (Math.random() - 0.5) * 50, yt.y += (Math.random() - 0.5) * 20, yt.z += (Math.random() - 0.5) * 50, Math.random() < 0.25 ? this.fx.explode(yt, "spark", 4) : this.fx.puff(yt, 10 + Math.random() * 10);
        }
      }
      for (let s of this.turrets) s.state === 1 && (s.smokeT -= e, s.smokeT <= 0 && (s.smokeT = 0.5 + Math.random() * 0.6, s.root.getWorldPosition(yt), this.fx.puff(yt, 3)));
    }
  };
function Dl() {
  let o = new g.Group(),
    e = new g.MeshStandardMaterial({
      color: "#8e8a84",
      metalness: 0.55,
      roughness: 0.5
    });
  e.userData.shared = !0;
  let t = new g.Mesh(new g.CylinderGeometry(6, 7.5, 3, 10), e);
  t.position.y = 1.5;
  let n = new g.Mesh(new g.BoxGeometry(8, 5, 9), e);
  n.position.y = 5.5;
  let s = new g.Mesh(new g.BoxGeometry(5, 1.2, 9), e);
  return s.position.set(0, 6, -8), o.add(t, n, s), o.traverse(r => {
    r instanceof g.Mesh && (r.geometry.userData.shared = !0);
  }), o;
}
import * as y from "./vendor/001-three-0.185.js";
var Xi = 0.88,
  wr = 0.7,
  vr = 0.4,
  Wo = 0.23,
  os = 0.045,
  Le = 0.45,
  ns = 4.4,
  Gt = 4.08,
  Zi = -3.85,
  Ul = 0.2,
  ot = "#c9c6be",
  bo = "#aeaca6",
  jl = "#a19e97",
  Wl = "#8f8e8a",
  Te = "#4b4e55",
  Ot = "#2c2f35",
  Ui = "#0d1a28",
  Yl = "#aab1bc",
  Tr = [[1, 1], [1, -1], [-1, 1], [-1, -1]],
  Ql = [0, 3, 2, 1],
  uo = () => ({
    pos: [],
    nrm: [],
    col: [],
    uv: []
  }),
  po = 0.42,
  br = new y.Vector3(),
  Zn = new y.Vector3(),
  Er = new y.Vector3(),
  Jn = new y.Vector3(),
  ho = new y.Vector3(),
  ji = new y.Matrix3(),
  Do = new y.Color(),
  $l = new y.Matrix4(),
  Kl = new y.Quaternion(),
  Xl = new y.Euler(),
  Zl = new y.Vector3(),
  xr = new y.Vector3();
function W(o, e, t, n) {
  let s = e.index ? e.toNonIndexed() : e;
  s.attributes.normal || s.computeVertexNormals();
  let r = t ?? $l.identity();
  ji.getNormalMatrix(r), n !== null && Do.set(n);
  let i = s.attributes.position,
    a = s.attributes.normal,
    l = n === null ? s.attributes.color : void 0;
  for (let c = 0; c + 2 < i.count; c += 3) {
    br.fromBufferAttribute(i, c).applyMatrix4(r), Zn.fromBufferAttribute(i, c + 1).applyMatrix4(r), Er.fromBufferAttribute(i, c + 2).applyMatrix4(r), ho.subVectors(Er, Zn).cross(xr.subVectors(br, Zn));
    let u = Math.abs(ho.x),
      d = Math.abs(ho.y),
      p = Math.abs(ho.z),
      m = u >= d && u >= p ? 0 : d >= p ? 1 : 2;
    for (let f = 0; f < 3; f++) {
      let h = f === 0 ? br : f === 1 ? Zn : Er;
      Jn.fromBufferAttribute(a, c + f).applyMatrix3(ji).normalize(), l && Do.fromBufferAttribute(l, c + f), o.pos.push(h.x, h.y, h.z), o.nrm.push(Jn.x, Jn.y, Jn.z), o.col.push(Do.r, Do.g, Do.b), m === 0 ? o.uv.push(h.z * po, h.y * po) : m === 1 ? o.uv.push(h.x * po, h.z * po) : o.uv.push(h.x * po, h.y * po);
    }
  }
  s !== e && s.dispose(), e.dispose();
}
function mo(o) {
  let e = new y.BufferGeometry();
  return e.setAttribute("position", new y.Float32BufferAttribute(o.pos, 3)), e.setAttribute("normal", new y.Float32BufferAttribute(o.nrm, 3)), e.setAttribute("color", new y.Float32BufferAttribute(o.col, 3)), e.setAttribute("uv", new y.Float32BufferAttribute(o.uv, 2)), e.computeBoundingSphere(), e.userData.shared = !0, e;
}
function se(o, e, t, n = 0, s = 0, r = 0) {
  return new y.Matrix4().compose(xr.set(o, e, t), Kl.setFromEuler(Xl.set(n, s, r)), Zl.set(1, 1, 1));
}
var Yo = class {
  v = [];
  tri(e, t, n, s) {
    ho.subVectors(t, e).cross(xr.subVectors(n, e)), ho.dot(s) < 0 ? this.v.push(e.x, e.y, e.z, n.x, n.y, n.z, t.x, t.y, t.z) : this.v.push(e.x, e.y, e.z, t.x, t.y, t.z, n.x, n.y, n.z);
  }
  quad(e, t, n, s, r) {
    this.tri(e, t, n, r), this.tri(e, n, s, r);
  }
  geometry() {
    let e = new y.BufferGeometry();
    return e.setAttribute("position", new y.Float32BufferAttribute(this.v, 3)), e.computeVertexNormals(), e;
  }
};
function Ji(o) {
  let e = 0,
    t = 0;
  for (let n of o.pts) e += n[0], t += n[1];
  return [e / o.pts.length, t / o.pts.length];
}
function Wi(o, e) {
  let t = new Yo(),
    n = o.pts.length,
    [s, r] = Ji(o),
    i = new y.Vector3(),
    a = new y.Vector3(),
    l = new y.Vector3(),
    c = new y.Vector3(),
    u = new y.Vector3();
  for (let d = 0; d < n; d++) {
    let p = (d + 1) % n;
    a.set(o.pts[d][0], o.pts[d][1], o.z), l.set(o.pts[p][0], o.pts[p][1], o.z), c.set(e.pts[p][0], e.pts[p][1], e.z), u.set(e.pts[d][0], e.pts[d][1], e.z), i.set((a.x + l.x) / 2 - s, (a.y + l.y) / 2 - r, 0), t.quad(a, l, c, u, i);
  }
  return t.geometry();
}
function gr(o, e) {
  let t = new Yo(),
    [n, s] = Ji(o),
    r = new y.Vector3(n, s, o.z),
    i = new y.Vector3(0, 0, e),
    a = new y.Vector3(),
    l = new y.Vector3();
  for (let c = 0; c < o.pts.length; c++) {
    let u = (c + 1) % o.pts.length;
    a.set(o.pts[c][0], o.pts[c][1], o.z), l.set(o.pts[u][0], o.pts[u][1], o.z), t.tri(r, a, l, i);
  }
  return t.geometry();
}
function Uo(o, e, t) {
  let n = new Yo(),
    s = 0,
    r = 0;
  for (let u of o) s += u[0] / o.length, r += u[1] / o.length;
  let i = new y.Vector3(0, 1, 0),
    a = new y.Vector3(0, -1, 0),
    l = (u, d) => new y.Vector3(u[0], d, u[1]);
  for (let u = 1; u + 1 < o.length; u++) n.tri(l(o[0], t), l(o[u], t), l(o[u + 1], t), i), n.tri(l(o[0], e), l(o[u], e), l(o[u + 1], e), a);
  let c = new y.Vector3();
  for (let u = 0; u < o.length; u++) {
    let d = o[u],
      p = o[(u + 1) % o.length];
    c.set((d[0] + p[0]) / 2 - s, 0, (d[1] + p[1]) / 2 - r), n.quad(l(d, e), l(p, e), l(p, t), l(d, t), c);
  }
  return n.geometry();
}
function Ie(o, e, t, n, s, r, i, a, l) {
  W(o, new y.CylinderGeometry(a, i, r - s, l), se(t, n, (s + r) / 2, Math.PI / 2), e);
}
function yr(o, e, t, n, s, r, i) {
  let a = new y.Vector3().subVectors(n, t),
    l = a.length();
  if (l < 1e-4) return;
  a.divideScalar(l);
  let c = new y.Vector3().crossVectors(a, i).normalize(),
    u = new y.Vector3().crossVectors(c, a).normalize(),
    d = new y.Matrix4().makeBasis(a, u, c);
  d.setPosition(new y.Vector3().addVectors(t, n).multiplyScalar(0.5)), W(o, new y.BoxGeometry(l, s, r), d, e);
}
function je(o, e, t, n, s, r) {
  return {
    z: o,
    pts: [[e - r, n], [e, n + r], [t, s - r], [t - r, s], [-t + r, s], [-t, s - r], [-e, n + r], [-e + r, n]]
  };
}
function jo(o, e, t, n) {
  return {
    z: o,
    pts: [[e, t], [e * 0.86, t + n * 0.62], [e * 0.5, t + n], [-e * 0.5, t + n], [-e * 0.86, t + n * 0.62], [-e, t]]
  };
}
function Yi(o, e, t, n) {
  let s = [je(-6.35, 0.2, 0.12, -0.2, 0.1, 0.05), je(-5.75, 0.33, 0.21, -0.3, 0.2, 0.08), je(-4.9, 0.4, 0.26, -0.36, 0.26, 0.09), je(-4.55, 0.43, 0.28, -0.38, 0.28, 0.09), je(-3, 0.55, 0.36, -0.46, 0.37, 0.1), je(-1.5, 0.66, 0.46, -0.54, 0.46, 0.11), je(0.4, 0.74, 0.56, -0.6, 0.54, 0.12), je(1, 0.8, 0.64, -0.62, 0.56, 0.12), je(3.95, 0.8, 0.64, -0.62, 0.56, 0.12), je(4.2, 0.7, 0.54, -0.52, 0.46, 0.1)],
    r = [Te, ot, t, ot, ot, ot, ot, ot, bo];
  for (let u = 0; u + 1 < s.length; u++) W(o, Wi(s[u], s[u + 1]), null, r[u]);
  W(o, gr(s[0], -1), null, Te), W(o, gr(s[s.length - 1], 1), null, Ot);
  let i = [jo(-2.55, 0.2, 0.34, 0.03), jo(-1.5, 0.4, 0.42, 0.32), jo(-0.3, 0.44, 0.47, 0.42), jo(0.55, 0.42, 0.5, 0.36), jo(0.98, 0.32, 0.51, 0.08)];
  for (let u = 0; u + 1 < i.length; u++) W(e, Wi(i[u], i[u + 1]), null, Ui);
  W(e, gr(i[i.length - 1], 1), null, Ui);
  let a = 1.6;
  if (W(o, new y.CylinderGeometry(0.26, 0.28, 0.16, n ? 10 : 20), se(0, 0.6, a), bo), W(e, new y.SphereGeometry(0.26, n ? 10 : 20, n ? 5 : 10, 0, Math.PI * 2, 0, Math.PI / 2), se(0, 0.68, a), Yl), W(e, new y.CylinderGeometry(0.263, 0.263, 0.05, n ? 10 : 20), se(0, 0.72, a), t), W(o, new y.BoxGeometry(0.8, 0.14, 2.6), se(0, -0.6, 0.1), Wl), n) return;
  let l = new y.Vector3(0, 1, 0),
    c = (u, d, p = 1.04) => {
      let m = u.pts[0][1];
      return new y.Vector3(u.pts[d][0] * p, m + (u.pts[d][1] - m) * p, u.z);
    };
  for (let u of [i[1], i[2], i[3]]) for (let d = 0; d < u.pts.length - 1; d++) yr(e, Ot, c(u, d), c(u, d + 1), 0.05, 0.06, new y.Vector3(0, 0, 1));
  for (let u of [2, 3]) for (let d = 0; d + 1 < i.length; d++) yr(e, Ot, c(i[d], u), c(i[d + 1], u), 0.05, 0.05, l);
  W(e, new y.SphereGeometry(0.055, 10, 8), se(0.02, 0.84, a - 0.19), "#0b0b0e"), W(e, new y.BoxGeometry(0.1, 0.06, 0.06), se(-0.12, 0.8, a - 0.18, 0.5, 0.5, 0), t), W(o, new y.BoxGeometry(0.2, 0.07, 0.9), se(0.3, 0.58, 2.75), Te), W(o, new y.BoxGeometry(0.2, 0.07, 0.9), se(-0.3, 0.58, 2.75), Te), W(o, new y.BoxGeometry(0.46, 0.05, 0.34), se(0, 0.575, 3.55), Ot), W(o, new y.BoxGeometry(0.18, 0.06, 0.75), se(0, 0.325, -4, -0.06, 0, 0), bo), W(o, new y.BoxGeometry(0.3, 0.06, 0.5), se(0, -0.64, 2.4), Te);
  for (let u of [-1, 1]) {
    let d = new y.Vector3(u * 0.425, -0.06, -3.6),
      p = new y.Vector3(u * 0.535, -0.06, -2);
    yr(o, Te, d, p, 0.14, 0.05, l);
  }
}
var Qi = o => 1 + 0.35 * (o - 0.35) / 3.65,
  fo = o => 4 - 1.25 * (o - 0.35) / 3.65;
function es(o, e, t, n) {
  return [[o, Qi(o) + t], [e, Qi(e) + t], [e, fo(e) - n], [o, fo(o) - n]];
}
function $i(o, e, t, n) {
  W(o, Uo(es(0.35, 4, 0, 0), -0.05, 0.05), null, ot), W(o, Uo(es(1.2, 1.5, 0.03, 0.03), -0.05 - 0.008, 0.05 + 0.008), null, t), W(o, Uo(es(1.66, 1.8, 0.03, 0.03), -0.05 - 0.008, 0.05 + 0.008), null, t);
  let r = n ? 10 : 20;
  Ie(o, bo, Le, 0, 0.2, 0.6, 0.41, 0.38, r), Ie(o, bo, Le, 0, 0.6, 3.95, 0.38, 0.38, r), Ie(e, Ot, Le, 0, 3.95, ns, 0.36, 0.31, r), W(e, new y.CircleGeometry(0.34, r), se(Le, 0, 0.19, 0, Math.PI, 0), "#111317"), W(o, new y.BoxGeometry(0.2, 0.2, 1.5), se(4.02, 0, 2.05), ot), Ie(o, ot, Gt, 0, -0.3, 1.3, 0.13, 0.13, n ? 6 : 12), Ie(o, bo, Gt, 0, -3.2, -0.3, 0.07, 0.07, n ? 5 : 10), Ie(e, Ot, Gt, 0, -3.72, -3.2, 0.1, 0.1, n ? 6 : 12), !n && (W(o, Uo([[0.85, fo(0.85) - 0.42], [3.85, fo(3.85) - 0.42], [3.85, fo(3.85) - 0.02], [0.85, fo(0.85) - 0.02]], -0.05 - 0.004, 0.05 + 0.004), null, jl), W(o, Uo(es(2.4, 3, 0.35, 1.3), -0.05 - 0.006, 0.05 + 0.006), null, Te), Ie(o, Te, Le, 0, 1.35, 1.5, 0.395, 0.395, r), Ie(o, Te, Le, 0, 3.3, 3.45, 0.395, 0.395, r), W(e, new y.TorusGeometry(0.37, 0.035, 6, r), se(Le, 0, 0.2), Te), W(e, new y.ConeGeometry(0.12, 0.22, 10), se(Le, 0, 0.12, -Math.PI / 2), Te), W(e, new y.CircleGeometry(0.27, r), se(Le, 0, ns + 0.005), "#0a0a0c"), Ie(o, Te, Gt, 0, -1.6, -1.45, 0.095, 0.095, 10), Ie(o, Te, Gt, 0, -0.36, -0.26, 0.14, 0.14, 12), Ie(e, Ot, Gt, 0, Zi + 0.03, -3.72, 0.055, 0.055, 8));
}
function Rr(o, e, t, n, s, r, i) {
  let a = o * e,
    l = a * t,
    c = wr + n * Math.cos(l) - s * Math.sin(l),
    u = a * vr + n * Math.sin(l) + s * Math.cos(l);
  return o < 0 ? i.set(-c, -u, r) : i.set(c, u, r);
}
function Jl(o, e, t) {
  let n = o * e,
    s = se(wr, n * vr, 0, 0, 0, n * t);
  return o < 0 ? new y.Matrix4().makeRotationZ(Math.PI).multiply(s) : s;
}
var Ki = new Map();
function ec(o) {
  let e = Ki.get(o);
  if (e) return e;
  let t = uo(),
    n = uo();
  Yi(t, n, o, !1);
  let s = uo(),
    r = uo();
  $i(s, r, o, !1);
  let i = uo();
  Yi(i, i, o, !0);
  let a = uo();
  $i(a, a, o, !0);
  let l = mo(a);
  for (let [u, d] of Tr) W(i, l.clone(), Jl(u, d, Wo), null);
  l.dispose();
  let c = {
    body: [mo(t), mo(n)],
    wing: [mo(s), mo(r)],
    far: mo(i)
  };
  return Ki.set(o, c), c;
}
var tt = null;
function tc() {
  if (tt) return tt;
  let o = 256,
    e = document.createElement("canvas");
  e.width = e.height = o;
  let t = e.getContext("2d"),
    n = 7,
    s = () => (n = n * 16807 % 2147483647, n / 2147483647);
  t.fillStyle = "#efefef", t.fillRect(0, 0, o, o);
  let r = [],
    i = (a, l, c, u, d) => {
      if (d > 4 || c < 48 && u < 48 || d > 1 && s() < 0.2) {
        r.push([a, l, c, u]);
        return;
      }
      let p = 0.3 + s() * 0.4;
      c > u ? (i(a, l, c * p, u, d + 1), i(a + c * p, l, c * (1 - p), u, d + 1)) : (i(a, l, c, u * p, d + 1), i(a, l + u * p, c, u * (1 - p), d + 1));
    };
  i(0, 0, o, o, 0);
  for (let [a, l, c, u] of r) {
    let d = Math.round(228 + s() * 27);
    t.fillStyle = `rgb(${d},${d},${d - 2})`, t.fillRect(a, l, c, u);
  }
  t.strokeStyle = "rgba(38,40,46,0.55)", t.lineWidth = 1.5;
  for (let [a, l, c, u] of r) t.strokeRect(a + 0.75, l + 0.75, c - 1.5, u - 1.5);
  t.fillStyle = "rgba(40,40,44,0.35)";
  for (let [a, l, c, u] of r) if (!(c < 40 || s() < 0.5)) for (let d = a + 5; d < a + c - 4; d += 7) t.fillRect(d, l + 3, 1.2, 1.2), t.fillRect(d, l + u - 4, 1.2, 1.2);
  for (let a = 0; a < 260; a++) {
    t.fillStyle = `rgba(70,62,54,${0.03 + s() * 0.06})`;
    let l = 2 + s() * 10;
    t.fillRect(s() * o, s() * o, l, l * (0.4 + s() * 2.5));
  }
  return tt = new y.CanvasTexture(e), tt.colorSpace = y.SRGBColorSpace, tt.wrapS = tt.wrapT = y.RepeatWrapping, tt.anisotropy = 4, tt.userData.shared = !0, tt;
}
var ts = null;
function oc() {
  if (ts) return ts;
  let o = new y.MeshStandardMaterial({
      vertexColors: !0,
      map: tc(),
      metalness: 0.25,
      roughness: 0.62,
      envMapIntensity: 1.1
    }),
    e = new y.MeshStandardMaterial({
      vertexColors: !0,
      metalness: 0.85,
      roughness: 0.2,
      envMapIntensity: 1.3
    });
  return o.userData.shared = e.userData.shared = !0, ts = {
    main: o,
    gloss: e
  }, ts;
}
function Hr(o) {
  let e = ec(o),
    {
      main: t,
      gloss: n
    } = oc(),
    s = new y.Group();
  s.name = "starwing";
  let r = new y.Group();
  r.scale.setScalar(Xi), s.add(r);
  let i = new y.Group();
  i.add(new y.Mesh(e.body[0], t), new y.Mesh(e.body[1], n));
  let a = {
    foil: 1,
    pivots: [],
    glows: []
  };
  for (let [c, u] of Tr) {
    let d = new y.Group();
    d.rotation.z = c < 0 ? Math.PI : 0;
    let p = c * u,
      m = new y.Group();
    m.position.set(wr, p * vr, 0), m.rotation.z = p * Wo, m.add(new y.Mesh(e.wing[0], t), new y.Mesh(e.wing[1], n)), d.add(m), i.add(d), a.pivots.push({
      obj: m,
      s: p
    });
    let f = zt(o, Ul);
    Rr(c, u, Wo, Le, 0, ns + 0.05, f.position), r.add(f), a.glows.push({
      obj: f,
      sx: c,
      sy: u
    });
  }
  let l = new y.LOD();
  return l.addLevel(i, 0), l.addLevel(new y.Mesh(e.far, t), 230), r.add(l), s.userData.rig = a, s;
}
function Eo(o, e, t) {
  let n = e ? 1 : 0;
  if (Math.abs(o.foil - n) < 0.001) return;
  o.foil += (n - o.foil) * (1 - Math.exp(-t / 0.12)), Math.abs(o.foil - n) < 0.001 && (o.foil = n);
  let s = os + (Wo - os) * o.foil;
  for (let r of o.pivots) r.obj.rotation.z = r.s * s;
  for (let r of o.glows) Rr(r.sx, r.sy, s, Le, 0, ns + 0.05, r.obj.position);
}
function Qo(o, e, t) {
  let [n, s] = Tr[Ql[(o % 4 + 4) % 4]],
    r = os + (Wo - os) * e;
  return Rr(n, s, r, Gt, 0, Zi, t).multiplyScalar(Xi);
}
var $0 = ue({
  id: "squad-interceptor",
  name: "Squad X-wing",
  role: "character",
  create: () => Hr("#6cfaff")
});
import * as le from "./vendor/001-three-0.185.js";
function ss(o) {
  let e = Math.abs(o);
  return e < 0.16 ? 0 : Math.sign(o) * (e - 0.16) / (1 - 0.16);
}
var kr = class {
    connected = !1;
    active = !1;
    invertY = !1;
    lx = 0;
    ly = 0;
    rx = 0;
    ry = 0;
    lt = 0;
    rt = 0;
    down = new Array(17).fill(!1);
    prev = new Array(17).fill(!1);
    constructor() {
      let e = () => this.active = !1;
      window.addEventListener("keydown", e), window.addEventListener("mousedown", e), window.addEventListener("mousemove", t => {
        Math.abs(t.movementX) + Math.abs(t.movementY) > 3 && (this.active = !1);
      });
    }
    poll() {
      let e = this.prev;
      this.prev = this.down, this.down = e, this.down.fill(!1), this.lx = this.ly = this.rx = this.ry = this.lt = this.rt = 0;
      let t = navigator.getGamepads ? navigator.getGamepads() : [],
        n = null;
      for (let i of t) if (i && i.connected) {
        n = i;
        break;
      }
      if (this.connected = n !== null, !n) return;
      let s = n.axes;
      this.lx = ss(s[0] ?? 0), this.ly = ss(s[1] ?? 0), this.rx = ss(s[2] ?? 0), this.ry = ss(s[3] ?? 0);
      let r = n.buttons;
      for (let i = 0; i < 17 && i < r.length; i++) this.down[i] = r[i].pressed || r[i].value > 0.5;
      this.lt = r[6]?.value ?? 0, this.rt = r[7]?.value ?? 0, (this.lx || this.ly || this.rx || this.ry || this.lt > 0.2 || this.rt > 0.2 || this.down.some(Boolean)) && (this.active = !0);
    }
    held(e) {
      return this.down[e];
    }
    pressed(e) {
      return this.down[e] && !this.prev[e];
    }
  },
  P = new kr(),
  ea = document.createElement("style");
ea.textContent = ".pad-focus{outline:2px solid #fff !important;outline-offset:3px;filter:brightness(1.15)}";
document.head.append(ea);
var nt = null,
  Mr = !1;
function nc(o) {
  return [...o.querySelectorAll("button")].filter(e => !e.disabled && e.getClientRects().length > 0);
}
function $o(o) {
  nt !== o && (nt?.classList.remove("pad-focus"), nt = o, nt?.classList.add("pad-focus"));
}
function Sr(o) {
  if (!o || !P.connected) return $o(null), !1;
  let e = nc(o);
  if (e.length === 0) return $o(null), !1;
  if (!nt || !e.includes(nt)) {
    if (!P.active) return $o(null), !1;
    $o(e.find(i => !("padSkip" in i.dataset)) ?? e[0]);
  }
  let t = 0,
    n = 0;
  P.pressed(12) ? n = -1 : P.pressed(13) ? n = 1 : P.pressed(14) ? t = -1 : P.pressed(15) && (t = 1);
  let s = Math.abs(P.lx) > 0.5 ? Math.sign(P.lx) : 0,
    r = Math.abs(P.ly) > 0.5 ? Math.sign(P.ly) : 0;
  return s || r ? (!Mr && !t && !n && (Math.abs(P.ly) >= Math.abs(P.lx) ? n = r : t = s), Mr = !0) : Mr = !1, (t || n) && $o(sc(nt, e, t, n)), P.pressed(0) && nt ? (nt.click(), !0) : !1;
}
function sc(o, e, t, n) {
  let s = o.getBoundingClientRect(),
    r = s.left + s.width / 2,
    i = s.top + s.height / 2,
    a = o,
    l = 1 / 0;
  for (let c of e) {
    if (c === o) continue;
    let u = c.getBoundingClientRect(),
      d = u.left + u.width / 2 - r,
      p = u.top + u.height / 2 - i,
      m = d * t + p * n;
    if (m <= 1) continue;
    let f = Math.abs(d * n) + Math.abs(p * t),
      h = m + f * 2;
    h < l && (l = h, a = c);
  }
  if (a === o) {
    let c = e.indexOf(o);
    if (n) return e[(c + n + e.length) % e.length];
  }
  return a;
}
var Nt = 22,
  is = 82,
  dc = 135,
  pc = 3.2,
  mc = 2,
  hc = 1.7,
  fc = 2.6,
  bc = 0.2,
  ta = 0.011,
  as = class {
    held = new Set();
    stickX = 0;
    stickY = 0;
    firing = !1;
    missileQueued = !1;
    touched = !1;
    enabled = !1;
    autoFire = !1;
    autoBoost = !1;
    constructor(e) {
      window.addEventListener("keydown", t => {
        (t.code === "Tab" || t.code === "Space") && t.preventDefault(), !t.repeat && (this.held.add(t.code), this.enabled && (this.touched = !0, (t.code === "KeyE" || t.code === "KeyF") && (this.missileQueued = !0)));
      }), window.addEventListener("keyup", t => this.held.delete(t.code)), window.addEventListener("blur", () => {
        this.held.clear(), this.firing = !1;
      }), e.addEventListener("contextmenu", t => t.preventDefault()), e.addEventListener("pointerdown", t => {
        !this.enabled || !Q.pointerLocked || (this.touched = !0, t.button === 0 && (this.firing = !0), t.button === 2 && (this.missileQueued = !0));
      }), window.addEventListener("pointerup", t => {
        t.button === 0 && (this.firing = !1);
      }), Q.onLook((t, n) => {
        if (!this.enabled) return;
        this.stickX += t * ta, this.stickY += n * ta;
        let s = Math.hypot(this.stickX, this.stickY);
        s > 1 && (this.stickX /= s, this.stickY /= s);
      });
    }
    pollPad() {
      !this.enabled || !P.connected || (P.active && (this.touched = !0), P.pressed(6) && (this.missileQueued = !0));
    }
    throttleAxis() {
      let e = this.axis(["KeyW", "ArrowUp"], ["KeyS", "ArrowDown"]),
        t = (P.held(12) ? 1 : 0) - (P.held(13) ? 1 : 0);
      return oa(e + t - P.ry);
    }
    rollAxis() {
      let e = this.axis(["KeyA", "ArrowLeft"], ["KeyD", "ArrowRight"]),
        t = (P.held(4) ? 1 : 0) - (P.held(5) ? 1 : 0);
      return oa(e + t - P.rx);
    }
    get boostHeld() {
      return this.enabled && (this.held.has("ShiftLeft") || this.held.has("ShiftRight") || P.held(0));
    }
    axis(e, t) {
      let n = e.some(r => this.held.has(r)) ? 1 : 0,
        s = t.some(r => this.held.has(r)) ? 1 : 0;
      return n - s;
    }
    get fireHeld() {
      return this.enabled && (this.firing || this.held.has("Space") || P.rt > 0.3) || this.autoFire;
    }
    decay(e) {
      let t = Math.exp(-e / bc);
      if (this.stickX *= t, this.stickY *= t, this.enabled && (P.lx || P.ly)) {
        let n = Math.sign(P.lx) * Math.abs(P.lx) ** 1.5,
          s = Math.sign(P.ly) * Math.abs(P.ly) ** 1.5 * (P.invertY ? -1 : 1),
          r = Math.hypot(n, s);
        r > 1 && (n /= r, s /= r), this.stickX = n, this.stickY = s;
      }
    }
    reset() {
      this.stickX = this.stickY = 0, this.firing = !1, this.missileQueued = !1;
    }
  };
function oa(o) {
  return Math.max(-1, Math.min(1, o));
}
var go = new le.Quaternion(),
  na = new le.Euler(0, 0, 0, "YXZ"),
  rs = new le.Vector3(),
  sa = new le.Vector3(),
  yo = new le.Vector3(),
  ra = new le.Vector3(0, 0, -1),
  ls = class {
    pos = new le.Vector3();
    quat = new le.Quaternion();
    vel = new le.Vector3();
    fwd = new le.Vector3(0, 0, -1);
    throttle = 0.6;
    speed = 50;
    boost = 100;
    boosting = !1;
    hp = 100;
    lastHit = -99;
    lastCrash = -99;
    alive = !1;
    outOfBounds = !1;
    rollInput = 0;
    turnX = 0;
    turnY = 0;
    spawn(e, t) {
      this.pos.copy(e);
      let n = new le.Matrix4().lookAt(new le.Vector3(), t, new le.Vector3(0, 1, 0));
      this.quat.setFromRotationMatrix(n), this.fwd.copy(ra).applyQuaternion(this.quat), this.throttle = 0.7, this.speed = Nt + (is - Nt) * 0.7, this.vel.copy(this.fwd).multiplyScalar(this.speed), this.boost = 100, this.hp = 100, this.alive = !0, this.lastHit = -99;
    }
    step(e, t, n) {
      let s = t.enabled,
        r = s ? t.throttleAxis() : 0,
        i = s ? t.rollAxis() : 0,
        a = s && t.boostHeld || t.autoBoost;
      this.throttle = Math.max(0, Math.min(1, this.throttle + r * e * 0.9)), this.rollInput += (i - this.rollInput) * Math.min(1, e * 8);
      let l = -t.stickY * mc,
        c = -t.stickX * hc;
      this.turnX = t.stickX, this.turnY = t.stickY, na.set(l * e, c * e, this.rollInput * fc * e, "YXZ"), go.setFromEuler(na), this.quat.multiply(go).normalize(), this.fwd.copy(ra).applyQuaternion(this.quat), this.outOfBounds = this.pos.length() > Fo, this.outOfBounds && (sa.copy(this.pos).multiplyScalar(-1).normalize(), this.turnToward(sa, 1.2 * e)), this.boosting = a && this.boost > 1, this.boosting ? this.boost = Math.max(0, this.boost - 30 * e) : this.boost = Math.min(100, this.boost + 13 * e);
      let u = this.boosting ? dc : Nt + (is - Nt) * this.throttle,
        d = u > this.speed ? this.boosting ? 90 : 55 : 45;
      this.speed += Math.max(-d * e, Math.min(d * e, u - this.speed)), this.vel.copy(this.fwd).multiplyScalar(this.speed), this.pos.addScaledVector(this.vel, e);
      let p = 0,
        m = lo(this.pos, pc, rs);
      if (m > 0) {
        this.pos.addScaledVector(rs, m + 0.2);
        let f = -this.fwd.dot(rs);
        f > 0 && (yo.copy(this.fwd).addScaledVector(rs, f * 1.4).normalize(), go.setFromUnitVectors(this.fwd, yo), this.quat.premultiply(go).normalize(), this.fwd.copy(yo), n - this.lastCrash > 0.5 && (p = Math.min(45, 6 + f * this.speed * 0.5), this.lastCrash = n), this.speed *= 0.55);
      }
      return n - this.lastHit > 5 && this.hp < 100 && (this.hp = Math.min(100, this.hp + 5 * e)), p;
    }
    turnToward(e, t) {
      let n = this.fwd.angleTo(e);
      n < 1e-4 || (yo.copy(this.fwd).lerp(e, Math.min(1, t / n)).normalize(), go.setFromUnitVectors(this.fwd, yo), this.quat.premultiply(go).normalize(), this.fwd.copy(yo));
    }
  };
import * as Y from "./vendor/001-three-0.185.js";
var cs = 1,
  us = 2,
  re = 1,
  wo = 2,
  ia = 3,
  ds = 1,
  Ko = 2,
  ps = 3,
  ms = 4,
  Xo = 5,
  hs = 6,
  fs = 7,
  Zo = 8,
  aa = new ArrayBuffer(65536),
  O = new DataView(aa),
  qe = o => Math.max(-32767, Math.min(32767, Math.round(o * 32767)));
function la(o) {
  let e = 0;
  O.setUint8(e, cs), e += 1, O.setUint32(e, o.mission), e += 4, O.setUint16(e, o.epoch), e += 2, O.setUint32(e, o.seq), e += 4, O.setFloat64(e, o.time), e += 8, O.setUint8(e, o.phase), e += 1, O.setFloat32(e, o.jump), e += 4, O.setUint16(e, o.tickets), e += 2, O.setUint8(e, o.stage), e += 1, O.setUint8(e, o.wave), e += 1, O.setUint8(e, o.pilots), e += 1;
  for (let s = 0; s < qt; s++) O.setFloat32(e, o.compHp[s]), e += 4, O.setFloat32(e, o.compMax[s]), e += 4;
  for (let s = 0; s < be; s++) O.setUint8(e, o.turrets[s]), e += 1;
  let t = Math.min(200, o.enemies.length);
  O.setUint8(e, t), e += 1;
  for (let s = 0; s < t; s++) {
    let r = o.enemies[s];
    O.setUint16(e, r.id), e += 2, O.setFloat32(e, r.x), e += 4, O.setFloat32(e, r.y), e += 4, O.setFloat32(e, r.z), e += 4, O.setInt16(e, qe(r.qx)), e += 2, O.setInt16(e, qe(r.qy)), e += 2, O.setInt16(e, qe(r.qz)), e += 2, O.setInt16(e, qe(r.qw)), e += 2, O.setUint8(e, Math.round(Math.max(0, Math.min(1, r.hp)) * 255)), e += 1;
  }
  let n = Math.min(250, o.events.length);
  O.setUint8(e, n), e += 1;
  for (let s = 0; s < n; s++) {
    let r = o.events[s];
    O.setUint8(e, r.kind), e += 1, O.setUint32(e, r.id), e += 4, O.setFloat64(e, r.time), e += 8, O.setFloat32(e, r.x), e += 4, O.setFloat32(e, r.y), e += 4, O.setFloat32(e, r.z), e += 4, O.setInt16(e, qe(r.dx)), e += 2, O.setInt16(e, qe(r.dy)), e += 2, O.setInt16(e, qe(r.dz)), e += 2, O.setUint16(e, r.ref), e += 2;
  }
  return aa.slice(0, e);
}
var We = o => Number.isFinite(o);
function ca(o) {
  try {
    let e = new DataView(o),
      t = 0;
    if (e.getUint8(t) !== cs) return null;
    t += 1;
    let n = e.getUint32(t);
    t += 4;
    let s = e.getUint16(t);
    t += 2;
    let r = e.getUint32(t);
    t += 4;
    let i = e.getFloat64(t);
    t += 8;
    let a = e.getUint8(t);
    t += 1;
    let l = e.getFloat32(t);
    t += 4;
    let c = e.getUint16(t);
    t += 2;
    let u = e.getUint8(t);
    t += 1;
    let d = e.getUint8(t);
    t += 1;
    let p = e.getUint8(t);
    t += 1;
    let m = [],
      f = [];
    for (let C = 0; C < qt; C++) m.push(e.getFloat32(t)), t += 4, f.push(e.getFloat32(t)), t += 4;
    let h = [];
    for (let C = 0; C < be; C++) h.push(e.getUint8(t)), t += 1;
    let E = e.getUint8(t);
    t += 1;
    let M = [];
    for (let C = 0; C < E; C++) {
      let U = e.getUint16(t);
      t += 2;
      let ne = e.getFloat32(t);
      t += 4;
      let dt = e.getFloat32(t);
      t += 4;
      let St = e.getFloat32(t);
      t += 4;
      let pt = e.getInt16(t) / 32767;
      t += 2;
      let Xe = e.getInt16(t) / 32767;
      t += 2;
      let Ze = e.getInt16(t) / 32767;
      t += 2;
      let Ao = e.getInt16(t) / 32767;
      t += 2;
      let Ns = e.getUint8(t) / 255;
      t += 1;
      let Kt = Math.hypot(pt, Xe, Ze, Ao) || 1;
      pt /= Kt, Xe /= Kt, Ze /= Kt, Ao /= Kt, !(!We(ne) || !We(dt) || !We(St)) && M.push({
        id: U,
        x: ne,
        y: dt,
        z: St,
        qx: pt,
        qy: Xe,
        qz: Ze,
        qw: Ao,
        hp: Ns
      });
    }
    let v = e.getUint8(t);
    t += 1;
    let V = [];
    for (let C = 0; C < v; C++) {
      let U = e.getUint8(t);
      t += 1;
      let ne = e.getUint32(t);
      t += 4;
      let dt = e.getFloat64(t);
      t += 8;
      let St = e.getFloat32(t);
      t += 4;
      let pt = e.getFloat32(t);
      t += 4;
      let Xe = e.getFloat32(t);
      t += 4;
      let Ze = e.getInt16(t) / 32767;
      t += 2;
      let Ao = e.getInt16(t) / 32767;
      t += 2;
      let Ns = e.getInt16(t) / 32767;
      t += 2;
      let Kt = e.getUint16(t);
      t += 2, !(!We(dt) || !We(St) || !We(pt) || !We(Xe)) && V.push({
        kind: U,
        id: ne,
        time: dt,
        x: St,
        y: pt,
        z: Xe,
        dx: Ze,
        dy: Ao,
        dz: Ns,
        ref: Kt
      });
    }
    return !We(i) || !We(l) ? null : {
      mission: n,
      epoch: s,
      seq: r,
      time: i,
      phase: a,
      jump: l,
      tickets: c,
      stage: u,
      wave: d,
      pilots: p,
      compHp: m,
      compMax: f,
      turrets: h,
      enemies: M,
      events: V
    };
  } catch {
    return null;
  }
}
var ua = new ArrayBuffer(128),
  oe = new DataView(ua);
function da(o) {
  let e = 0;
  return oe.setUint8(e, us), e += 1, oe.setUint32(e, o.mission), e += 4, oe.setUint32(e, o.seq), e += 4, oe.setFloat64(e, o.time), e += 8, oe.setUint8(e, (o.alive ? 1 : 0) | (o.boost ? 2 : 0)), e += 1, oe.setFloat32(e, o.x), e += 4, oe.setFloat32(e, o.y), e += 4, oe.setFloat32(e, o.z), e += 4, oe.setInt16(e, qe(o.qx)), e += 2, oe.setInt16(e, qe(o.qy)), e += 2, oe.setInt16(e, qe(o.qz)), e += 2, oe.setInt16(e, qe(o.qw)), e += 2, oe.setUint8(e, Math.round(Math.max(0, Math.min(1, o.throttle)) * 255)), e += 1, oe.setUint16(e, o.fire & 65535), e += 2, oe.setUint16(e, o.missiles & 65535), e += 2, oe.setUint8(e, Math.round(Math.max(0, Math.min(1, o.hp)) * 255)), e += 1, oe.setUint8(e, o.mtKind), e += 1, oe.setUint16(e, o.mtId), e += 2, oe.setUint8(e, o.color), e += 1, ua.slice(0, e);
}
function pa(o) {
  try {
    let e = new DataView(o),
      t = 0;
    if (e.getUint8(t) !== us) return null;
    t += 1;
    let n = e.getUint32(t);
    t += 4;
    let s = e.getUint32(t);
    t += 4;
    let r = e.getFloat64(t);
    t += 8;
    let i = e.getUint8(t);
    t += 1;
    let a = e.getFloat32(t);
    t += 4;
    let l = e.getFloat32(t);
    t += 4;
    let c = e.getFloat32(t);
    t += 4;
    let u = e.getInt16(t) / 32767;
    t += 2;
    let d = e.getInt16(t) / 32767;
    t += 2;
    let p = e.getInt16(t) / 32767;
    t += 2;
    let m = e.getInt16(t) / 32767;
    t += 2;
    let f = e.getUint8(t) / 255;
    t += 1;
    let h = e.getUint16(t);
    t += 2;
    let E = e.getUint16(t);
    t += 2;
    let M = e.getUint8(t) / 255;
    t += 1;
    let v = e.getUint8(t);
    t += 1;
    let V = e.getUint16(t);
    t += 2;
    let C = e.getUint8(t);
    t += 1;
    let U = Math.hypot(u, d, p, m) || 1;
    return u /= U, d /= U, p /= U, m /= U, ![r, a, l, c].every(We) || Math.abs(a) > 1e5 || Math.abs(l) > 1e5 || Math.abs(c) > 1e5 ? null : {
      mission: n,
      seq: s,
      time: r,
      alive: (i & 1) !== 0,
      boost: (i & 2) !== 0,
      x: a,
      y: l,
      z: c,
      qx: u,
      qy: d,
      qz: p,
      qw: m,
      throttle: f,
      fire: h,
      missiles: E,
      hp: M,
      mtKind: v,
      mtId: V,
      color: C
    };
  } catch {
    return null;
  }
}
function ma(o) {
  return typeof o == "object" && o !== null && typeof o.t == "string";
}
var _t = 0,
  Ft = 1,
  st = 2;
var Jo = [{
  title: "Squadron inbound",
  moment: "Six starfighters boost in formation toward the dreadnought, then snap their S-foils open for attack",
  durationMs: 2800,
  seed: 11,
  destroyed: [],
  player: {
    pos: [0, 300, -1450],
    look: [0, 150, 300],
    speed: 82,
    boost: [0, 1.5]
  },
  wingmen: [{
    rel: [-24, 3, -16],
    speed: 82,
    boost: [0, 1.55]
  }, {
    rel: [24, 3, -16],
    speed: 82,
    boost: [0, 1.6]
  }, {
    rel: [-48, 7, -34],
    speed: 82,
    boost: [0, 1.65]
  }, {
    rel: [48, 7, -34],
    speed: 82,
    boost: [0, 1.7]
  }, {
    rel: [0, 12, -52],
    speed: 82,
    boost: [0, 1.75]
  }],
  enemies: [],
  camera: {
    kind: "follow",
    who: "player",
    offset: [8, 5, 28],
    look: [0, 0, -80]
  }
}, {
  title: "Tail chase",
  moment: "Looking back off a squadmate's wing: the fighter on their tail is shot apart by your lasers",
  durationMs: 3200,
  seed: 23,
  destroyed: [],
  player: {
    pos: [-39, 190, -370],
    look: [-40, 186, -300],
    speed: 61,
    steer: [{
      t: 0,
      to: {
        enemy: 0
      },
      rate: 1.6
    }],
    fire: [{
      from: 0.9,
      to: 2.2,
      at: {
        enemy: 0
      }
    }]
  },
  wingmen: [{
    pos: [-40, 186, -320],
    look: [-24, 184, 0],
    speed: 60,
    steer: [{
      t: 0.3,
      to: {
        point: [120, 210, 300]
      },
      rate: 0.45
    }]
  }, {
    pos: [30, 204, -372],
    look: [34, 204, 0],
    speed: 64,
    fire: [{
      from: 0.6,
      to: 2.4,
      at: {
        enemy: 1
      }
    }],
    steer: [{
      t: 0,
      to: {
        enemy: 1
      },
      rate: 0.6
    }]
  }],
  enemies: [{
    chase: 0,
    gap: 22
  }, {
    pos: [70, 222, -80],
    look: [30, 204, -372]
  }],
  kills: [{
    t: 1.9,
    enemy: 0
  }],
  camera: {
    kind: "follow",
    who: "w0",
    offset: [-7, 3.5, -17],
    look: [1, -1, 20]
  }
}, {
  title: "Shield dome",
  moment: "Diving on the port shield dome with missiles away; the dome bursts as the squad pulls up",
  durationMs: 3200,
  seed: 37,
  destroyed: [],
  weak: [0],
  player: {
    pos: [-112, 265, 300],
    look: [-118, 128, 565],
    speed: 80,
    steer: [{
      t: 0,
      to: {
        comp: 0
      },
      rate: 0.6
    }, {
      t: 1.5,
      to: {
        point: [-150, 420, 760]
      },
      rate: 1.1
    }],
    missiles: [{
      t: 0.2,
      at: {
        comp: 0
      }
    }],
    fire: [{
      from: 0.1,
      to: 1.4,
      at: {
        comp: 0
      }
    }]
  },
  wingmen: [{
    rel: [-26, 2, -12],
    speed: 80,
    steer: [{
      t: 0,
      to: {
        comp: 0
      },
      rate: 0.6
    }, {
      t: 1.4,
      to: {
        point: [-260, 400, 700]
      },
      rate: 1.1
    }],
    fire: [{
      from: 0.2,
      to: 1.4,
      at: {
        comp: 0
      }
    }],
    missiles: [{
      t: 0.35,
      at: {
        comp: 0
      }
    }]
  }, {
    rel: [28, 5, -8],
    speed: 80,
    steer: [{
      t: 0,
      to: {
        comp: 0
      },
      rate: 0.6
    }, {
      t: 1.6,
      to: {
        point: [60, 420, 740]
      },
      rate: 1.1
    }],
    fire: [{
      from: 0.3,
      to: 1.4,
      at: {
        comp: 0
      }
    }]
  }],
  enemies: [{
    pos: [-40, 330, 700],
    look: [-112, 300, 170]
  }],
  kills: [{
    t: 2,
    comp: 0
  }],
  camera: {
    kind: "chase"
  }
}, {
  title: "Turret run",
  moment: "Skimming the hull at full throttle, blasting deck turrets as flak bursts around the squad",
  durationMs: 2800,
  seed: 41,
  destroyed: [0, 1],
  lane: {
    x: -60,
    z0: -300,
    z1: -100,
    width: 40
  },
  player: {
    pos: [-58, 96, -440],
    look: [-58, 80, -200],
    speed: 82,
    steer: [{
      t: 0,
      to: {
        lane: !0
      },
      rate: 0.5
    }, {
      t: 2.2,
      to: {
        point: [-58, 120, 300]
      },
      rate: 0.8
    }],
    fire: [{
      from: 0.15,
      to: 2.4,
      at: {
        lane: !0
      }
    }]
  },
  wingmen: [{
    rel: [-24, 3, -16],
    speed: 82,
    steer: [{
      t: 0,
      to: {
        lane: !0
      },
      rate: 0.5
    }],
    fire: [{
      from: 0.3,
      to: 2.4,
      at: {
        lane: !0
      }
    }]
  }, {
    rel: [27, 9, -26],
    speed: 82,
    fire: [{
      from: 0.5,
      to: 2.4,
      at: {
        lane: !0
      }
    }]
  }],
  enemies: [{
    pos: [-20, 140, 160],
    look: [-58, 96, -440]
  }],
  kills: [{
    t: 0.9,
    lane: 0
  }, {
    t: 1.9,
    lane: 1
  }],
  camera: {
    kind: "chase"
  }
}, {
  title: "Check your six",
  moment: "An enemy fighter hounds a squadmate across the deck until your lasers tear it apart",
  durationMs: 3e3,
  seed: 53,
  destroyed: [0, 1],
  player: {
    pos: [262, 199, 356],
    look: [0, 196, 350],
    speed: 61,
    steer: [{
      t: 0,
      to: {
        enemy: 0
      },
      rate: 1.6
    }],
    fire: [{
      from: 1,
      to: 2.3,
      at: {
        enemy: 0
      }
    }]
  },
  wingmen: [{
    pos: [210, 196, 350],
    look: [-100, 200, 336],
    speed: 60,
    steer: [{
      t: 0.5,
      to: {
        point: [-400, 240, 240]
      },
      rate: 0.35
    }]
  }, {
    pos: [250, 232, 395],
    look: [-100, 236, 380],
    speed: 64
  }],
  enemies: [{
    chase: 0,
    gap: 22
  }, {
    pos: [-150, 220, 330],
    look: [210, 196, 350]
  }],
  kills: [{
    t: 2,
    enemy: 0
  }],
  camera: {
    kind: "fixed",
    pos: [130, 184, 292],
    look: "e0"
  }
}, {
  title: "Hangar bay",
  moment: "Fighters scramble out of the port hangar as the squad's missiles fly straight into the bay",
  durationMs: 3200,
  seed: 67,
  destroyed: [0, 1],
  weak: [2],
  player: {
    pos: [-470, -66, 50],
    look: [-140, -58, 125],
    speed: 80,
    steer: [{
      t: 0,
      to: {
        comp: 2
      },
      rate: 0.5
    }, {
      t: 2.1,
      to: {
        point: [-420, -260, 520]
      },
      rate: 1.1
    }],
    missiles: [{
      t: 0.2,
      at: {
        comp: 2
      }
    }],
    fire: [{
      from: 0.4,
      to: 1.9,
      at: {
        comp: 2
      }
    }]
  },
  wingmen: [{
    rel: [-30, 6, -10],
    speed: 80,
    steer: [{
      t: 0,
      to: {
        comp: 2
      },
      rate: 0.5
    }, {
      t: 2,
      to: {
        point: [-600, -200, 520]
      },
      rate: 1.1
    }],
    missiles: [{
      t: 0.4,
      at: {
        comp: 2
      }
    }]
  }, {
    rel: [30, -6, -12],
    speed: 80,
    steer: [{
      t: 0,
      to: {
        comp: 2
      },
      rate: 0.5
    }, {
      t: 2.2,
      to: {
        point: [-300, -300, 400]
      },
      rate: 1.1
    }],
    fire: [{
      from: 0.4,
      to: 1.9,
      at: {
        enemy: 0
      }
    }]
  }],
  enemies: [{
    hangar: 2,
    t: 0
  }, {
    hangar: 2,
    t: 0.55
  }, {
    hangar: 2,
    t: 1.1
  }],
  kills: [{
    t: 2.2,
    comp: 2
  }],
  camera: {
    kind: "chase"
  }
}, {
  title: "Bridge tower",
  moment: "The squad sweeps over the deck and a missile volley brings down the bridge tower",
  durationMs: 3e3,
  seed: 79,
  destroyed: [0, 1, 2, 3],
  weak: [4],
  player: {
    pos: [-16, 244, 240],
    look: [0, 200, 600],
    speed: 82,
    steer: [{
      t: 0,
      to: {
        comp: 4
      },
      rate: 0.5
    }, {
      t: 1.7,
      to: {
        point: [-60, 520, 800]
      },
      rate: 1
    }],
    missiles: [{
      t: 0.2,
      at: {
        comp: 4
      }
    }]
  },
  wingmen: [{
    rel: [-34, 6, -6],
    speed: 82,
    steer: [{
      t: 0,
      to: {
        comp: 4
      },
      rate: 0.5
    }, {
      t: 1.7,
      to: {
        point: [-260, 480, 760]
      },
      rate: 1
    }],
    missiles: [{
      t: 0.35,
      at: {
        comp: 4
      }
    }]
  }, {
    rel: [36, 2, -14],
    speed: 82,
    steer: [{
      t: 0,
      to: {
        comp: 4
      },
      rate: 0.5
    }, {
      t: 1.9,
      to: {
        point: [200, 500, 780]
      },
      rate: 1
    }],
    missiles: [{
      t: 0.5,
      at: {
        comp: 4
      }
    }]
  }, {
    rel: [4, 16, 24],
    speed: 82,
    steer: [{
      t: 0,
      to: {
        comp: 4
      },
      rate: 0.5
    }, {
      t: 2,
      to: {
        point: [0, 560, 800]
      },
      rate: 1
    }],
    fire: [{
      from: 0.3,
      to: 1.8,
      at: {
        comp: 4
      }
    }]
  }],
  enemies: [],
  kills: [{
    t: 2.2,
    comp: 4
  }],
  camera: {
    kind: "fixed",
    pos: [84, 272, 330],
    look: [0, 250, 590],
    drift: [0, 2, 12]
  }
}, {
  title: "Reactor core",
  moment: "Under the hull the whole squad fires into the exposed reactor as the core detonates",
  durationMs: 2500,
  seed: 97,
  destroyed: [0, 1, 2, 3, 4],
  weak: [5],
  player: {
    pos: [6, -140, -20],
    look: [0, -78, 380],
    speed: 80,
    steer: [{
      t: 0,
      to: {
        comp: 5
      },
      rate: 0.5
    }, {
      t: 1.8,
      to: {
        point: [0, -330, 900]
      },
      rate: 0.9
    }],
    missiles: [{
      t: 0.15,
      at: {
        comp: 5
      }
    }],
    fire: [{
      from: 0.1,
      to: 1.8,
      at: {
        comp: 5
      }
    }]
  },
  wingmen: [{
    rel: [-30, 4, -14],
    speed: 80,
    steer: [{
      t: 0,
      to: {
        comp: 5
      },
      rate: 0.5
    }, {
      t: 1.8,
      to: {
        point: [-300, -300, 900]
      },
      rate: 0.9
    }],
    missiles: [{
      t: 0.3,
      at: {
        comp: 5
      }
    }]
  }, {
    rel: [30, 4, -14],
    speed: 80,
    steer: [{
      t: 0,
      to: {
        comp: 5
      },
      rate: 0.5
    }, {
      t: 1.8,
      to: {
        point: [300, -300, 900]
      },
      rate: 0.9
    }],
    missiles: [{
      t: 0.45,
      at: {
        comp: 5
      }
    }]
  }, {
    rel: [-56, -6, -34],
    speed: 80,
    steer: [{
      t: 1.8,
      to: {
        point: [-420, -360, 800]
      },
      rate: 0.9
    }],
    fire: [{
      from: 0.3,
      to: 1.8,
      at: {
        comp: 5
      }
    }]
  }, {
    rel: [56, -6, -34],
    speed: 80,
    steer: [{
      t: 1.8,
      to: {
        point: [420, -360, 800]
      },
      rate: 0.9
    }],
    fire: [{
      from: 0.3,
      to: 1.8,
      at: {
        comp: 5
      }
    }]
  }],
  enemies: [],
  kills: [{
    t: 2.2,
    comp: 5
  }],
  camera: {
    kind: "chase"
  }
}, {
  title: "Dreadnought falls",
  moment: "Wide on the dreadnought as explosions rip along its hull and the squad races clear toward camera",
  durationMs: 4e3,
  seed: 131,
  destroyed: [0, 1, 2, 3, 4],
  weak: [5],
  player: {
    pos: [-656, 146, -206],
    look: [-846, 172, -312],
    speed: 82
  },
  wingmen: [{
    rel: [-22, 4, 16],
    speed: 82
  }, {
    rel: [24, 2, 18],
    speed: 82
  }, {
    rel: [-46, 9, 36],
    speed: 82
  }, {
    rel: [44, 7, 40],
    speed: 82
  }, {
    rel: [0, 14, 52],
    speed: 82
  }],
  enemies: [],
  kills: [{
    t: 0.2,
    comp: 5
  }],
  camera: {
    kind: "fixed",
    pos: [-880, 200, -330],
    look: [-40, 0, 160],
    drift: [-10, 4, -6]
  }
}];
var Ec = 135,
  fa = new Y.Vector3(0, 1, 0),
  gc = new Y.Vector3(),
  yc = new Y.Matrix4(),
  wc = new Y.Quaternion(),
  ce = new Y.Vector3(),
  vo = new Y.Vector3(),
  To = new Y.Vector3(),
  Ge = (o, e = new Y.Vector3()) => e.set(o[0], o[1], o[2]);
function Vr(o, e, t) {
  let n = Math.abs(o.y) > 0.95 ? To.set(0, 0, 1) : fa;
  return t.setFromRotationMatrix(yc.lookAt(gc, o, n)), Math.abs(e) > 0.001 && t.multiply(wc.setFromAxisAngle(To.set(0, 0, 1), e)), t;
}
function ha(o, e, t) {
  let n = o.angleTo(e);
  if (n < 1e-4) return 0;
  let s = vo.crossVectors(o, e).dot(fa);
  return o.lerp(e, Math.min(1, t / n)).normalize(), Math.sign(s) * Math.min(n, t);
}
var Ar = (o, e) => !!e && o >= e[0] && o < e[1],
  bs = class {
    constructor(e) {
      this.host = e;
    }
    active = !1;
    shotIndex = -1;
    shot = Jo[0];
    t = 0;
    wings = [];
    foes = [];
    lane = [];
    done = new Set();
    weakHp = new Map();
    baseTurrets = [];
    player = null;
    random = Math.random;
    camQ = new Y.Quaternion();
    ghost = {
      pos: new Y.Vector3(),
      fwd: new Y.Vector3(0, 0, -1),
      quat: new Y.Quaternion(),
      speed: 60
    };
    start(e = 0) {
      this.active && this.stop(!1), this.active = !0, this.random = Math.random, this.host.begin();
      let t = this.host.sim();
      this.baseTurrets = t ? t.turrets.map(n => n.state) : [];
      for (let n = 0; n < 5; n++) {
        let s = this.host.makeWing(n + 1);
        s.root.visible = !1, this.wings.push({
          id: `trailer-wing-${n}`,
          vis: s,
          view: {
            id: `trailer-wing-${n}`,
            pos: new Y.Vector3(),
            vel: new Y.Vector3(),
            alive: !1
          },
          on: !1,
          ...this.newActor({
            speed: 60
          })
        });
      }
      this.shotIndex = Math.max(-1, Math.min(Jo.length - 1, e) - 1), this.nextShot();
    }
    stop(e) {
      if (this.active) {
        this.active = !1, Math.random = this.random;
        for (let t of this.wings) this.host.dropWing(t.vis);
        this.wings = [], this.foes = [], this.host.input.autoFire = !1, this.host.input.autoBoost = !1, this.host.finish(), e && window.dispatchEvent(new Event("remix:trailer-end"));
      }
    }
    pilots() {
      return this.wings.filter(e => e.on).map(e => e.view);
    }
    newActor(e) {
      return {
        spec: e,
        pos: new Y.Vector3(),
        fwd: new Y.Vector3(0, 0, -1),
        quat: new Y.Quaternion(),
        speed: e.speed,
        bank: 0,
        boosting: !1,
        shots: 0,
        fireT: 0,
        fired: new Set()
      };
    }
    place(e, t, n) {
      e.spec = t, t.pos ? Ge(t.pos, e.pos) : t.rel && n && Ge(t.rel, e.pos).applyQuaternion(n.quat).add(n.pos), t.look ? e.fwd.copy(Ge(t.look, ce)).sub(e.pos).normalize() : n && e.fwd.copy(n.fwd), e.boosting = Ar(0, t.boost), e.speed = e.boosting ? 120 : t.speed, e.bank = 0, e.shots = 0, e.fireT = 0, e.fired.clear(), Vr(e.fwd, 0, e.quat);
    }
    nextShot() {
      if (this.shotIndex++, this.shotIndex >= Jo.length) {
        this.stop(!0);
        return;
      }
      let e = Jo[this.shotIndex];
      this.shot = e, this.t = 0, this.done.clear(), Math.random = Et(e.seed), this.host.cut();
      let t = this.host.sim();
      if (!t) return;
      t.phase = re, t.ended = !1, t.endTimer = 0, t.jump = 560 - this.shotIndex * 45, t.waveTimer = 1e6, t.enemies.length = 0, t.fresh.length = 0, this.weakHp.clear();
      for (let a = 0; a < t.compHp.length; a++) e.destroyed.includes(a) ? t.compHp[a] = 0 : e.weak?.includes(a) ? (t.compHp[a] = 2e3, this.weakHp.set(a, 2e3)) : t.compHp[a] = t.compMax[a];
      t.stage = gt(t.compHp), t.turrets.forEach((a, l) => {
        a.state = this.baseTurrets[l] ?? 0, a.hp = a.max, a.boltCd = 0.3 + Math.random() * 1.2, a.flakCd = 0.2 + Math.random() * 1.5;
      }), this.lane = [];
      let n = e.lane;
      if (n) {
        this.lane = te.filter(a => a.normal.y > 0.6 && Math.abs(a.pos.x - n.x) < n.width && a.pos.z >= n.z0 && a.pos.z <= n.z1).sort((a, l) => a.pos.z - l.pos.z).map(a => a.index);
        for (let a of this.lane) t.turrets[a].state = 2, t.turrets[a].hp = 36;
      }
      let s = this.host.ship,
        r = this.player = this.newActor(e.player);
      this.place(r, e.player, null), s.spawn(r.pos, r.fwd), s.speed = r.speed, s.throttle = Y.MathUtils.clamp((e.player.speed - 22) / 60, 0, 1), s.boost = 100, s.boosting = r.boosting, this.host.input.autoBoost = r.boosting, this.host.input.autoFire = !1;
      let i = {
        pos: s.pos,
        quat: s.quat,
        fwd: s.fwd
      };
      this.wings.forEach((a, l) => {
        let c = e.wingmen[l];
        a.on = !!c, a.vis.root.visible = a.on, c && (this.place(a, c, i), a.view.alive = !0, this.syncWing(a, 0, !0));
      }), this.foes = e.enemies.map(a => ({
        spec: a,
        e: null,
        spawned: !1,
        pos: new Y.Vector3(),
        fwd: new Y.Vector3(0, 0, -1),
        quat: new Y.Quaternion(),
        bank: 0,
        speed: 60
      })), this.spawnFoes(t), this.initCamera(), this.host.settle();
    }
    spawnFoes(e) {
      for (let t of this.foes) {
        if (t.spawned || (t.spec.t ?? 0) > this.t) continue;
        t.spawned = !0;
        let n = t.spec;
        if (n.hangar !== void 0) {
          let s = Wn(n.hangar, ce.clone());
          t.e = e.spawnAt(s, Yn(n.hangar, vo), n.hangar);
        } else if (n.chase !== void 0) {
          let s = this.wings[n.chase];
          t.pos.copy(s.pos).addScaledVector(s.fwd, -(n.gap ?? 45)), t.fwd.copy(s.fwd), t.speed = s.speed, t.e = e.spawnAt(t.pos, t.fwd), this.pinChaser(t);
        } else if (n.pos) {
          let s = Ge(n.pos),
            r = n.look ? Ge(n.look).sub(s).normalize() : vo.set(0, 0, -1);
          t.e = e.spawnAt(s, r);
        }
      }
    }
    update(e) {
      if (!this.active || (this.t += e, this.t * 1e3 >= this.shot.durationMs && (this.nextShot(), !this.active))) return;
      let t = this.host.sim();
      if (!t) return;
      this.spawnFoes(t), this.cueKills(t);
      let n = this.host.ship,
        s = this.player;
      s.pos.copy(n.pos), s.fwd.copy(n.fwd);
      let r = this.steerAt(s.spec);
      r && this.aimPoint(r.to, n.pos, n.fwd, ce) && n.turnToward(ce.sub(n.pos).normalize(), (r.rate ?? 1) * e), this.host.input.autoBoost = Ar(this.t, s.spec.boost), this.host.input.autoFire = (s.spec.fire ?? []).some(i => this.t >= i.from && this.t < i.to && this.aimPoint(i.at, n.pos, n.fwd, vo)), this.launchMissiles(s, n.pos, n.quat, n.fwd, n.speed);
      for (let i of this.wings) i.on && this.flyWing(i, e);
    }
    afterSim(e) {
      if (this.active) for (let t of this.foes) {
        if (t.spec.chase === void 0 || !t.e) continue;
        if (!this.host.sim()?.enemies.includes(t.e)) {
          t.e = null;
          continue;
        }
        let n = this.wings[t.spec.chase];
        ce.copy(n.pos).sub(t.pos);
        let s = ce.length(),
          r = ha(t.fwd, ce.divideScalar(Math.max(s, 0.001)), 2.4 * e);
        t.bank += (Y.MathUtils.clamp(-r / Math.max(e, 0.001) * 0.8, -0.9, 0.9) - t.bank) * Math.min(1, e * 4), t.speed = Y.MathUtils.clamp(n.speed + (s - (t.spec.gap ?? 45)) * 1.5, 30, 150), t.pos.addScaledVector(t.fwd, t.speed * e), this.pinChaser(t);
      }
    }
    pinChaser(e) {
      let t = e.e;
      t && (Vr(e.fwd, e.bank, e.quat), t.pos.copy(e.pos), t.fwd.copy(e.fwd), t.quat.copy(e.quat), t.speed = e.speed, t.mode = 0, t.target = this.wings[e.spec.chase].id, t.retarget = 99);
    }
    cueKills(e) {
      let t = this.host.selfId();
      for (let [s, r] of this.weakHp) {
        let i = e.compHp[s];
        i > 0 && r - i >= 150 && (e.compHp[s] = 1, e.applyHits(t, [[st, s, 200]])), this.weakHp.set(s, e.compHp[s]);
      }
      (this.shot.kills ?? []).forEach((s, r) => {
        if (!(this.done.has(r) || this.t < s.t)) {
          if (this.done.add(r), s.comp !== void 0 && e.compHp[s.comp] > 0 && (e.compHp[s.comp] = 1, e.applyHits(t, [[st, s.comp, 200]])), s.enemy !== void 0) {
            let i = this.foes[s.enemy]?.e;
            i && e.enemies.includes(i) && e.applyHits(t, [[_t, i.id, 200]]);
          }
          if (s.lane !== void 0) {
            let i = this.lane[s.lane];
            i !== void 0 && e.turrets[i].state === 2 && (e.turrets[i].hp = 1, e.applyHits(t, [[Ft, i, 200]]));
          }
        }
      });
    }
    steerAt(e) {
      let t = null;
      for (let n of e.steer ?? []) n.t <= this.t && (t = n);
      return t;
    }
    aimPoint(e, t, n, s) {
      let r = this.host.sim();
      if ("point" in e) return Ge(e.point, s), !0;
      if ("comp" in e) return !r || r.compHp[e.comp] <= 0 ? !1 : (s.copy(G[e.comp].aim), !0);
      if ("enemy" in e) {
        let i = this.foes[e.enemy]?.e;
        if (!i || !r?.enemies.includes(i)) return !1;
        let a = i.pos.distanceTo(t);
        return s.copy(i.pos).addScaledVector(i.fwd, i.speed * (a / 620)), !0;
      }
      if ("wing" in e) {
        let i = this.wings[e.wing];
        return i?.on ? (s.copy(i.pos), !0) : !1;
      }
      if ("lane" in e) {
        let i = 1 / 0;
        for (let a of this.lane) {
          if (!r || r.turrets[a].state !== 2) continue;
          Ae(te[a], To);
          let l = To.distanceTo(t);
          To.sub(t).dot(n) / l < 0.3 || l > i || (i = l, Ae(te[a], s));
        }
        return i < 1 / 0;
      }
      return !1;
    }
    missileTarget(e) {
      let t = this.host.sim();
      if ("comp" in e) return [3, e.comp];
      if ("enemy" in e) {
        let n = this.foes[e.enemy]?.e;
        return n ? [1, n.id] : [0, 0];
      }
      if ("lane" in e) {
        let n = this.lane.find(s => t?.turrets[s].state === 2);
        return n !== void 0 ? [2, n] : [0, 0];
      }
      return [0, 0];
    }
    launchMissiles(e, t, n, s, r) {
      (e.spec.missiles ?? []).forEach((i, a) => {
        if (e.fired.has(a) || this.t < i.t) return;
        e.fired.add(a);
        let [l, c] = this.missileTarget(i.at);
        this.host.missile(vo.set(0, -1.2, -2).applyQuaternion(n).add(t), s, r, l, c);
      });
    }
    flyWing(e, t) {
      let n = e.spec,
        s = this.steerAt(n),
        r = 0;
      s && this.aimPoint(s.to, e.pos, e.fwd, ce) && (r = ha(e.fwd, ce.sub(e.pos).normalize(), (s.rate ?? 1) * t)), e.boosting = Ar(this.t, n.boost);
      let i = e.boosting ? Ec : n.speed,
        a = i > e.speed ? e.boosting ? 90 : 55 : 45;
      e.speed += Y.MathUtils.clamp(i - e.speed, -a * t, a * t), e.bank += (Y.MathUtils.clamp(-r / Math.max(t, 0.001) * 0.8, -0.9, 0.9) - e.bank) * Math.min(1, t * 4), e.pos.addScaledVector(e.fwd, e.speed * t), Vr(e.fwd, e.bank, e.quat);
      let l = (n.fire ?? []).find(c => this.t >= c.from && this.t < c.to);
      if (e.fireT -= t, l && e.fireT <= 0) {
        e.fireT = 0.12;
        let c = e.vis.rig?.foil ?? 1,
          u = Qo(e.shots++, c, vo).applyQuaternion(e.quat).add(e.pos);
        this.aimPoint(l.at, e.pos, e.fwd, ce) && To.copy(ce).sub(e.pos).normalize().angleTo(e.fwd) < 0.35 || ce.copy(e.pos).addScaledVector(e.fwd, 380), this.host.laser(u.clone(), ce.sub(u).normalize(), 560 + e.speed);
      }
      this.launchMissiles(e, e.pos, e.quat, e.fwd, e.speed), this.syncWing(e, t, !1);
    }
    syncWing(e, t, n) {
      e.view.pos.copy(e.pos), e.view.vel.copy(e.fwd).multiplyScalar(e.speed), e.vis.root.position.copy(e.pos), e.vis.root.quaternion.copy(e.quat);
      for (let r of e.vis.glows) De(r, 1, e.boosting);
      let s = e.vis.rig;
      s && (n && (s.foil = e.boosting ? 1 : 0), Eo(s, !e.boosting, n ? 10 : t));
    }
    subject(e) {
      if (e === "player") {
        let s = this.host.ship;
        return {
          pos: s.pos,
          quat: s.quat,
          fwd: s.fwd,
          speed: s.speed
        };
      }
      let t = Number(e.slice(1));
      if (e[0] === "w") {
        let s = this.wings[t];
        return s?.on ? s : null;
      }
      let n = this.foes[t];
      return !n?.e || !this.host.sim()?.enemies.includes(n.e) ? null : n.spec.chase !== void 0 ? n : {
        pos: n.e.pos,
        quat: n.e.quat,
        fwd: n.e.fwd,
        speed: n.e.speed
      };
    }
    initCamera() {
      let e = this.shot.camera,
        t = e.kind === "follow" ? e.who : e.kind === "fixed" && typeof e.look == "string" ? e.look : null;
      if (!t) return;
      let n = this.subject(t);
      n && (this.camQ.copy(n.quat), this.ghost.pos.copy(n.pos), this.ghost.fwd.copy(n.fwd), this.ghost.quat.copy(n.quat), this.ghost.speed = n.speed);
    }
    track(e, t) {
      let n = this.subject(e),
        s = this.ghost;
      return n ? (s.pos.copy(n.pos), s.fwd.copy(n.fwd), s.quat.copy(n.quat), s.speed = n.speed) : s.pos.addScaledVector(s.fwd, s.speed * t), s;
    }
    placeCamera(e, t) {
      if (!this.active) return !1;
      let n = this.shot.camera;
      if (e.up.set(0, 1, 0), n.kind === "chase") return !1;
      if (n.kind === "fixed") return Ge(n.pos, e.position), n.drift && e.position.addScaledVector(Ge(n.drift, ce), this.t), typeof n.look == "string" ? e.lookAt(this.track(n.look, t).pos) : e.lookAt(Ge(n.look, ce)), !0;
      let s = this.track(n.who, t);
      return this.camQ.slerp(s.quat, 1 - Math.exp(-t / 0.12)), e.position.copy(Ge(n.offset, ce).applyQuaternion(this.camQ)).add(s.pos), e.up.applyQuaternion(this.camQ), e.lookAt(Ge(n.look, ce).applyQuaternion(this.camQ).add(s.pos)), !0;
    }
  };
import * as ga from "./vendor/001-three-0.185.js";
var he = ["#6cfaff", "#ffb347", "#9dff6c", "#ff7ae0", "#ffe066", "#7fb2ff", "#ff8a7a", "#c59bff", "#6cffc4", "#ff9ec7", "#ffcf7a", "#e8f1ff"],
  me = "#6cfaff",
  Z = "#ff9b4a",
  Ce = "#ff4d5e";
function ya() {
  return {
    crossX: 0,
    crossY: 0,
    stickX: 0,
    stickY: 0,
    leadX: 0,
    leadY: 0,
    leadOn: !1,
    lockX: 0,
    lockY: 0,
    lockProgress: 0,
    lockOn: !1,
    markers: Array.from({
      length: 160
    }, () => ({
      kind: "enemy",
      x: 0,
      y: 0,
      onScreen: !1,
      behind: !1,
      dist: 0
    })),
    markerCount: 0,
    hull: 1,
    boost: 1,
    speed: 0,
    throttle: 0,
    missiles: 0,
    missileCharge: 0,
    objective: "",
    objectiveSub: "",
    jump: 0,
    tickets: 0,
    wave: 0,
    score: 0,
    squad: [],
    hitMarker: 0,
    damage: 0,
    outOfBounds: !1,
    deadText: "",
    flying: !1,
    showHint: !0,
    needsLock: !1,
    padHint: !1,
    netNote: ""
  };
}
var vc = `
.sw-root{position:fixed;inset:0;pointer-events:none;font-family:'Eurostile','Bank Gothic','Segoe UI',system-ui,sans-serif;color:#dff9ff;
  padding:var(--remix-safe-top,0px) var(--remix-safe-right,0px) var(--remix-safe-bottom,0px) var(--remix-safe-left,0px);user-select:none}
.sw-canvas{position:absolute;inset:0;width:100%;height:100%}
.sw-panel{position:absolute;text-transform:uppercase;letter-spacing:.12em;text-shadow:0 0 8px rgba(108,250,255,.5)}
.sw-top{top:14px;left:50%;transform:translateX(-50%);text-align:center}
.sw-obj{font-size:15px;font-weight:700;color:${Z};text-shadow:0 0 10px rgba(255,155,74,.6)}
.sw-objsub{font-size:11px;opacity:.8;margin-top:3px}
.sw-jump{font-size:22px;font-weight:700;margin-top:6px;font-variant-numeric:tabular-nums}
.sw-jump.warn{color:${Ce};text-shadow:0 0 10px rgba(255,77,94,.7)}
.sw-tl{top:14px;left:16px;font-size:11px;min-width:190px}
.sw-tl .row{display:flex;gap:8px;align-items:center;padding:2px 0;opacity:.95}
.sw-tl .dot{width:8px;height:8px;transform:rotate(45deg);flex:none}
.sw-tl .nm{flex:1;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;max-width:140px}
.sw-tl .sc{font-variant-numeric:tabular-nums;opacity:.8}
.sw-tl .down{opacity:.4;text-decoration:line-through}
.sw-tr{top:14px;right:16px;text-align:right;font-size:12px;line-height:1.6}
.sw-tr b{font-size:18px;color:#fff;font-variant-numeric:tabular-nums}
.sw-bl{bottom:18px;left:18px;width:230px;font-size:11px}
.sw-br{bottom:18px;right:18px;width:210px;font-size:11px;text-align:right}
.sw-bar{height:8px;border:1px solid rgba(108,250,255,.6);margin:3px 0 8px;position:relative;background:rgba(5,20,30,.4)}
.sw-bar i{position:absolute;left:0;top:0;bottom:0;background:${me};box-shadow:0 0 8px ${me}}
.sw-bar.hull i{background:#7fffb0;box-shadow:0 0 8px #7fffb0}
.sw-bar.low i{background:${Ce};box-shadow:0 0 8px ${Ce}}
.sw-pips{display:flex;gap:6px;justify-content:flex-end;margin-top:4px}
.sw-pips span{width:10px;height:22px;border:1px solid ${Z};background:rgba(255,155,74,.15)}
.sw-pips span.on{background:${Z};box-shadow:0 0 8px ${Z}}
.sw-center{top:58%;left:50%;transform:translate(-50%,-50%);text-align:center;font-size:13px}
.sw-banner{top:24%;left:50%;transform:translateX(-50%);text-align:center;transition:opacity .4s}
.sw-banner .big{font-size:30px;font-weight:800;letter-spacing:.2em}
.sw-banner .small{font-size:13px;margin-top:6px;opacity:.85}
.sw-hint{bottom:70px;left:50%;transform:translateX(-50%);font-size:12px;text-align:center;opacity:.9;line-height:1.7;
  background:rgba(4,12,20,.55);border:1px solid rgba(108,250,255,.35);padding:8px 16px}
.sw-hint kbd{border:1px solid rgba(108,250,255,.6);padding:0 5px;margin:0 2px;font-family:inherit}
.sw-warn{top:36%;left:50%;transform:translateX(-50%);color:${Ce};font-size:16px;font-weight:700;text-shadow:0 0 10px rgba(255,77,94,.8)}
.sw-dmg{position:absolute;inset:0;pointer-events:none;box-shadow:inset 0 0 160px rgba(255,40,40,.0);transition:box-shadow .08s}
.sw-menu{position:fixed;inset:0;display:flex;align-items:center;justify-content:center;pointer-events:auto;
  background:radial-gradient(ellipse at center,rgba(4,10,18,.35),rgba(2,4,8,.8));font-family:'Eurostile','Bank Gothic','Segoe UI',system-ui,sans-serif;color:#dff9ff}
.sw-card{min-width:340px;max-width:min(560px,92vw);max-height:90vh;overflow:auto;padding:26px 30px;background:rgba(6,16,26,.82);border:1px solid rgba(108,250,255,.45);
  box-shadow:0 0 40px rgba(108,250,255,.12);text-align:center}
.sw-title{font-size:40px;font-weight:800;letter-spacing:.22em;color:#fff;text-shadow:0 0 18px rgba(108,250,255,.7);margin:0}
.sw-tag{font-size:13px;letter-spacing:.18em;text-transform:uppercase;color:${Z};margin:8px 0 20px}
.sw-btn{display:block;width:100%;margin:10px 0;padding:12px 16px;font:inherit;font-size:15px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;
  color:#021018;background:${me};border:0;cursor:pointer;box-shadow:0 0 16px rgba(108,250,255,.5)}
.sw-btn:hover{filter:brightness(1.12)}
.sw-btn:disabled{opacity:.45;cursor:default;filter:none}
.sw-btn.alt{background:transparent;color:${me};border:1px solid rgba(108,250,255,.6);box-shadow:none}
.sw-btn.warm{background:${Z};box-shadow:0 0 16px rgba(255,155,74,.5)}
.sw-small{font-size:12px;opacity:.8;line-height:1.6;margin-top:12px}
.sw-err{color:${Ce};font-size:13px;margin-top:10px;min-height:1em}
.sw-list{text-align:left;margin:14px 0;font-size:13px;letter-spacing:.06em}
.sw-list .p{display:flex;justify-content:space-between;padding:5px 8px;border-bottom:1px solid rgba(108,250,255,.12)}
.sw-list .p.empty{opacity:.3}
.sw-table{width:100%;border-collapse:collapse;font-size:13px;margin-top:12px}
.sw-table td,.sw-table th{padding:5px 6px;text-align:right;border-bottom:1px solid rgba(108,250,255,.14)}
.sw-table td:first-child,.sw-table th:first-child{text-align:left}
.sw-table th{font-size:11px;opacity:.7;letter-spacing:.12em}
.sw-table tr.me td{color:${me}}
.sw-menu.cine{display:block;background:linear-gradient(90deg,rgba(2,6,12,.72) 0%,rgba(2,6,12,.35) 30%,rgba(2,6,12,0) 52%),
  linear-gradient(0deg,rgba(2,5,10,.55) 0%,rgba(2,5,10,0) 22%),linear-gradient(180deg,rgba(2,5,10,.5) 0%,rgba(2,5,10,0) 18%);
  pointer-events:none;animation:sw-fade 1.2s ease-out both}
.sw-menu.cine>*{pointer-events:auto}
.sw-menu.cine::before,.sw-menu.cine::after{content:'';position:absolute;left:0;right:0;height:5.5vh;background:#010204;pointer-events:none}
.sw-menu.cine::before{top:0}
.sw-menu.cine::after{bottom:0}
.sw-hero{position:absolute;top:calc(max(8vh,48px) + var(--remix-safe-top,0px));left:calc(max(5vw,32px) + var(--remix-safe-left,0px));
  animation:sw-in .9s cubic-bezier(.2,.8,.2,1) .15s both}
.sw-hero .kicker{display:flex;align-items:center;gap:12px;font-size:12px;letter-spacing:.42em;text-transform:uppercase;color:${Z};
  text-shadow:0 0 10px rgba(255,155,74,.55)}
.sw-hero .kicker::before{content:'';width:42px;height:2px;background:${Z};box-shadow:0 0 8px ${Z}}
.sw-logo{margin:10px 0 0;font-weight:900;font-style:italic;line-height:.86;letter-spacing:.04em;text-transform:uppercase;transform:skewX(-8deg);
  transform-origin:left bottom;font-size:clamp(46px,8.4vw,128px)}
.sw-logo span{display:block;background:linear-gradient(180deg,#ffffff 0%,#dffcff 42%,#6cfaff 58%,#2a8fb8 100%);-webkit-background-clip:text;background-clip:text;
  color:transparent;filter:drop-shadow(0 0 18px rgba(108,250,255,.45)) drop-shadow(0 4px 0 rgba(0,20,30,.8))}
.sw-logo span+span{margin-left:.55em;background:linear-gradient(180deg,#fff4e8 0%,#ffd2a8 40%,${Z} 60%,#b4481c 100%);-webkit-background-clip:text;
  background-clip:text;filter:drop-shadow(0 0 20px rgba(255,155,74,.5)) drop-shadow(0 4px 0 rgba(30,8,0,.8))}
.sw-hero .rule{display:flex;align-items:center;gap:10px;margin-top:18px;font-size:13px;letter-spacing:.3em;text-transform:uppercase;color:#bfefff;opacity:.9}
.sw-hero .rule i{display:block;height:1px;width:clamp(60px,14vw,220px);background:linear-gradient(90deg,${me},transparent)}
.sw-actions{position:absolute;left:calc(max(5vw,32px) + var(--remix-safe-left,0px));bottom:calc(max(11vh,72px) + var(--remix-safe-bottom,0px));
  width:clamp(260px,26vw,360px);animation:sw-in .9s cubic-bezier(.2,.8,.2,1) .4s both}
.sw-cta{position:relative;display:flex;align-items:center;justify-content:space-between;width:100%;margin:0 0 12px;padding:15px 22px 15px 26px;font:inherit;
  font-size:16px;font-weight:800;letter-spacing:.2em;text-transform:uppercase;text-align:left;cursor:pointer;color:#021018;background:${me};border:0;
  clip-path:polygon(14px 0,100% 0,100% calc(100% - 14px),calc(100% - 14px) 100%,0 100%,0 14px);box-shadow:0 0 22px rgba(108,250,255,.45);
  transition:transform .15s,filter .15s,background .15s,color .15s}
.sw-cta::after{content:'\u25B8';font-size:18px;transition:transform .15s}
.sw-cta:hover:not(:disabled){transform:translateX(8px);filter:brightness(1.12)}
.sw-cta:hover:not(:disabled)::after{transform:translateX(4px)}
.sw-cta.ghost{--edge:rgba(108,250,255,.55);color:${me};background-color:rgba(6,22,34,.55);box-shadow:inset 0 0 0 1px var(--edge);backdrop-filter:blur(4px);
  background-image:linear-gradient(to top left,transparent calc(50% - 1.1px),var(--edge) calc(50% - 1.1px),var(--edge) 50%,transparent 50%),
    linear-gradient(to bottom right,transparent calc(50% - 1.1px),var(--edge) calc(50% - 1.1px),var(--edge) 50%,transparent 50%);
  background-repeat:no-repeat;background-size:14px 14px;background-position:left top,right bottom}
.sw-cta.ghost:hover:not(:disabled){background-color:rgba(108,250,255,.16)}
.sw-cta:disabled{opacity:.45;cursor:default}
.sw-cta.pad-focus{transform:translateX(8px);filter:brightness(1.2);outline:none !important}
.sw-cta.pad-focus::after{transform:translateX(4px)}
.sw-cta.ghost.pad-focus{background-color:rgba(108,250,255,.22)}
.sw-cta small{display:block;font-size:10px;font-weight:600;letter-spacing:.16em;opacity:.7;margin-top:3px}
.sw-toggle{display:flex;align-items:center;justify-content:space-between;width:100%;margin:0 0 12px;padding:8px 14px;font:inherit;font-size:11px;font-weight:700;
  letter-spacing:.2em;text-transform:uppercase;color:${me};background:rgba(6,22,34,.55);border:1px solid rgba(108,250,255,.4);cursor:pointer;backdrop-filter:blur(4px)}
.sw-toggle:hover,.sw-toggle.pad-focus{background:rgba(108,250,255,.16)}
.sw-toggle b{min-width:3.2em;padding:2px 8px;text-align:center;border:1px solid rgba(108,250,255,.6);color:${me}}
.sw-toggle b.on{background:${me};color:#021018}
.sw-actions .sw-err{text-align:left;font-size:12px;letter-spacing:.04em;line-height:1.5}
.sw-brief{position:absolute;right:calc(max(4vw,28px) + var(--remix-safe-right,0px));bottom:calc(max(11vh,72px) + var(--remix-safe-bottom,0px));
  width:clamp(220px,24vw,320px);padding:14px 16px 12px;font-size:12px;line-height:1.55;color:#cfeefa;background:rgba(4,12,20,.45);
  border-left:2px solid ${Z};backdrop-filter:blur(3px);animation:sw-in .9s cubic-bezier(.2,.8,.2,1) .6s both}
.sw-brief h3{margin:0 0 8px;font-size:11px;letter-spacing:.32em;text-transform:uppercase;color:${Z}}
.sw-brief ol{margin:0;padding-left:18px}
.sw-brief li{margin:2px 0}
.sw-brief b{color:#fff}
.sw-brief .foot{margin-top:8px;opacity:.65;font-size:11px;letter-spacing:.06em}
@keyframes sw-fade{from{opacity:0}to{opacity:1}}
@keyframes sw-in{from{opacity:0;transform:translateX(-24px)}to{opacity:1;transform:none}}
@media (max-height:520px){.sw-brief{display:none}}
@media (max-width:720px){.sw-brief{display:none}.sw-actions{width:auto;right:calc(5vw + var(--remix-safe-right,0px))}}
`;
function k(o, e = "", t) {
  let n = document.createElement(o);
  return e && (n.className = e), t?.append(n), n;
}
function Ye(o, e) {
  o.textContent !== e && (o.textContent = e);
}
var ba = o => {
    let e = Math.max(0, Math.ceil(o));
    return `${Math.floor(e / 60)}:${String(e % 60).padStart(2, "0")}`;
  },
  Ea = "<kbd>Mouse</kbd> steer &nbsp; <kbd>W</kbd><kbd>S</kbd> throttle &nbsp; <kbd>A</kbd><kbd>D</kbd> roll &nbsp; <kbd>Shift</kbd> boost<br><kbd>Left click</kbd>/<kbd>Space</kbd> lasers &nbsp; <kbd>Right click</kbd>/<kbd>E</kbd> lock-on missile &nbsp; (arrow keys work too)",
  Tc = "<kbd>Left stick</kbd> steer &nbsp; <kbd>Right stick</kbd> throttle / roll &nbsp; <kbd>LB</kbd><kbd>RB</kbd> roll &nbsp; <kbd>A</kbd> boost<br><kbd>RT</kbd> lasers &nbsp; <kbd>LT</kbd> lock-on missile &nbsp; <kbd>Start</kbd> mission menu",
  Es = class {
    root = k("div", "sw-root");
    canvas = k("canvas", "sw-canvas", this.root);
    g = this.canvas.getContext("2d");
    flight = k("div", "", this.root);
    objective;
    objectiveSub;
    jump;
    squad;
    stats;
    hullBar;
    boostBar;
    speedText;
    pips;
    lockText;
    center;
    hint;
    hintPad = !1;
    warn;
    dmg;
    bannerEl;
    bannerBig;
    bannerSmall;
    bannerUntil = 0;
    menu = null;
    invertBtn = null;
    onInvertToggle = null;
    squadKey = "";
    statsKey = "";
    dpr = 1;
    w = 1;
    h = 1;
    constructor() {
      let e = document.createElement("style");
      e.textContent = vc, document.head.append(e), document.body.append(this.root);
      let t = k("div", "sw-panel sw-top", this.flight);
      this.objective = k("div", "sw-obj", t), this.objectiveSub = k("div", "sw-objsub", t), this.jump = k("div", "sw-jump", t), this.squad = k("div", "sw-panel sw-tl", this.flight), this.stats = k("div", "sw-panel sw-tr", this.flight);
      let n = k("div", "sw-panel sw-bl", this.flight);
      k("div", "", n).textContent = "Hull", this.hullBar = k("div", "sw-bar hull", n), k("i", "", this.hullBar), k("div", "", n).textContent = "Boost", this.boostBar = k("div", "sw-bar", n), k("i", "", this.boostBar), this.speedText = k("div", "", n);
      let s = k("div", "sw-panel sw-br", this.flight);
      k("div", "", s).textContent = "Lock-on missiles", this.pips = k("div", "sw-pips", s);
      for (let r = 0; r < 4; r++) k("span", "", this.pips);
      this.lockText = k("div", "", s), this.lockText.style.marginTop = "6px", this.center = k("div", "sw-panel sw-center", this.flight), this.hint = k("div", "sw-panel sw-hint", this.flight), this.hint.innerHTML = Ea, this.warn = k("div", "sw-panel sw-warn", this.flight), this.dmg = k("div", "sw-dmg", this.root), this.bannerEl = k("div", "sw-panel sw-banner", this.root), this.bannerBig = k("div", "big", this.bannerEl), this.bannerSmall = k("div", "small", this.bannerEl), this.bannerEl.style.opacity = "0", this.flight.style.display = "none", this.resize();
    }
    resize() {
      this.dpr = Math.min(window.devicePixelRatio || 1, 2), this.w = window.innerWidth, this.h = window.innerHeight, this.canvas.width = Math.round(this.w * this.dpr), this.canvas.height = Math.round(this.h * this.dpr);
    }
    setFlightVisible(e) {
      this.flight.style.display = e ? "" : "none", e || this.g.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    banner(e, t = "", n = me, s = 3) {
      Ye(this.bannerBig, e), Ye(this.bannerSmall, t), this.bannerBig.style.color = n, this.bannerBig.style.textShadow = `0 0 16px ${n}`, this.bannerEl.style.opacity = "1", this.bannerUntil = performance.now() + s * 1e3;
    }
    clearBanner() {
      this.bannerEl.style.opacity = "0", this.bannerUntil = 0;
    }
    openMenu() {
      this.closeMenu();
      let e = k("div", "sw-menu");
      return document.body.append(e), this.menu = e, k("div", "sw-card", e);
    }
    closeMenu() {
      this.menu?.remove(), this.menu = null, this.invertBtn = null;
    }
    addInvertToggle(e) {
      let t = k("button", "sw-toggle", e);
      t.dataset.padSkip = "", k("span", "", t).textContent = "Controller \xB7 invert stick", k("b", "", t), t.style.display = "none", t.onclick = () => this.onInvertToggle?.(), this.invertBtn = t;
    }
    syncPadOptions(e, t) {
      let n = this.invertBtn;
      if (!n) return;
      n.style.display = e ? "" : "none";
      let s = n.lastChild;
      Ye(s, t ? "On" : "Off"), s.classList.toggle("on", t);
    }
    get menuElement() {
      return this.menu && this.menu.style.pointerEvents !== "none" ? this.menu : null;
    }
    get menuOpen() {
      return this.menu !== null;
    }
    showTitle(e, t, n, s) {
      this.closeMenu();
      let r = k("div", "sw-menu cine");
      document.body.append(r), this.menu = r;
      let i = k("div", "sw-hero", r);
      k("div", "kicker", i).textContent = "Starfighter strike";
      let a = k("h1", "sw-logo", i);
      k("span", "", a).textContent = "Squadron";
      let l = k("div", "rule", i);
      k("i", "", l), k("span", "", l).textContent = "Twelve pilots \xB7 one dreadnought \xB7 no retreat";
      let c = k("div", "sw-actions", r);
      this.addInvertToggle(c);
      let p = k("button", "sw-cta ghost", c),
        m = k("span", "", p);
      m.textContent = "Fly solo", k("small", "", m).textContent = "Launch immediately", p.onclick = () => s.solo(), k("div", "sw-err", c).textContent = t || (e ? "" : "");
      let f = k("div", "sw-brief", r);
      f.innerHTML = '<h3>Mission briefing</h3><ol><li>Knock out both <b>shield domes</b> to drop the deflector.</li><li>Destroy the <b>hangar bays</b> and <b>bridge tower</b>.</li><li>Hit the exposed <b>reactor core</b> under the hull before the dreadnought jumps.</li></ol><div class="foot">Threat level scales with squad size.</div>';
    }
    showResults(e, t, n, s, r) {
      let i = this.openMenu();
      this.menu.style.pointerEvents = "none", k("h1", "sw-title", i).textContent = e ? "DREADNOUGHT DESTROYED" : "MISSION FAILED", i.firstChild.style.fontSize = "30px", k("div", "sw-tag", i).textContent = e ? `Reactor breach in ${ba(n)}` : t === "jump" ? "The dreadnought jumped to hyperspace" : t === "abort" ? "The strike was called off" : "The squad was wiped out";
      let a = k("table", "sw-table", i);
      a.innerHTML = "<tr><th>Pilot</th><th>Kills</th><th>Turrets</th><th>Systems</th><th>Score</th></tr>";
      for (let l of s) {
        let c = k("tr", l.me ? "me" : "", a);
        for (let u of [l.name, l.kills, l.turrets, l.systems, l.score]) k("td", "", c).textContent = String(u);
      }
      k("div", "sw-tag", i).textContent = `Your score ${r}`;
    }
    frame(e) {
      let t = performance.now();
      this.bannerUntil && t > this.bannerUntil && (this.bannerEl.style.opacity = "0", this.bannerUntil = 0), Ye(this.objective, e.objective), Ye(this.objectiveSub, e.objectiveSub), Ye(this.jump, `Hyperspace jump in ${ba(e.jump)}`), this.jump.classList.toggle("warn", e.jump < 60);
      let n = e.squad.map(i => `${i.name}|${i.alive}|${i.score}|${i.color}`).join(";");
      if (n !== this.squadKey) {
        this.squadKey = n, this.squad.innerHTML = '<div style="opacity:.7;margin-bottom:4px">Squad</div>';
        for (let i of e.squad) {
          let a = k("div", "row", this.squad),
            l = k("span", "dot", a);
          l.style.background = i.color, l.style.boxShadow = `0 0 6px ${i.color}`;
          let c = k("span", `nm${i.alive ? "" : " down"}`, a);
          c.textContent = i.name + (i.self ? " \u25C2" : ""), k("span", "sc", a).textContent = String(i.score);
        }
      }
      let s = `${e.score}|${e.tickets}|${e.wave}|${e.netNote}`;
      s !== this.statsKey && (this.statsKey = s, this.stats.innerHTML = `Score <b>${e.score}</b><br>Reserve ships <b>${e.tickets}</b><br>Wave <b>${e.wave}</b>${e.netNote ? `<br><span style="color:${Z}">${e.netNote}</span>` : ""}`), this.hullBar.firstChild.style.width = `${Math.max(0, e.hull) * 100}%`, this.hullBar.classList.toggle("low", e.hull < 0.3), this.boostBar.firstChild.style.width = `${Math.max(0, e.boost) * 100}%`, Ye(this.speedText, `Speed ${Math.round(e.speed)} \xB7 Throttle ${Math.round(e.throttle * 100)}%`);
      let r = this.pips.children;
      for (let i = 0; i < r.length; i++) r[i].className = i < e.missiles ? "on" : "";
      Ye(this.lockText, e.lockOn ? "LOCKED \u2014 fire missile" : e.lockProgress > 0 ? "Acquiring lock\u2026" : e.missiles < 4 ? `Reloading ${Math.round(e.missileCharge * 100)}%` : ""), this.lockText.style.color = e.lockOn ? Ce : "", Ye(this.center, e.needsLock ? e.padHint ? "Click or use your controller to take the controls" : "Click to take the controls" : e.deadText), this.hint.style.display = e.showHint && e.flying ? "" : "none", e.padHint !== this.hintPad && (this.hintPad = e.padHint, this.hint.innerHTML = e.padHint ? Tc : Ea), Ye(this.warn, e.outOfBounds ? "Leaving combat area \u2014 turning back" : e.flying && e.hull < 0.25 ? "HULL CRITICAL" : ""), this.dmg.style.boxShadow = `inset 0 0 ${120 + e.damage * 80}px rgba(255,40,40,${Math.min(0.55, e.damage * 0.6)})`, this.draw(e);
    }
    draw(e) {
      let t = this.g;
      t.setTransform(this.dpr, 0, 0, this.dpr, 0, 0), t.clearRect(0, 0, this.w, this.h), t.lineCap = "round", t.font = '600 11px Eurostile, "Segoe UI", system-ui, sans-serif', t.textAlign = "center";
      for (let a = 0; a < e.markerCount; a++) this.drawMarker(e.markers[a]);
      if (!e.flying) return;
      let n = e.crossX,
        s = e.crossY;
      t.strokeStyle = me, t.shadowColor = me, t.shadowBlur = 0, t.lineWidth = 1.6, t.beginPath(), t.arc(n, s, 22, 0, Math.PI * 2), t.stroke(), t.beginPath();
      for (let [a, l] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) t.moveTo(n + a * 28, s + l * 28), t.lineTo(n + a * 40, s + l * 40);
      if (t.stroke(), t.fillStyle = e.hitMarker > 0 ? "#fff" : Z, t.beginPath(), t.arc(n, s, 2.2, 0, Math.PI * 2), t.fill(), e.hitMarker > 0) {
        t.strokeStyle = `rgba(255,255,255,${Math.min(1, e.hitMarker * 4)})`, t.beginPath();
        for (let [a, l] of [[1, 1], [-1, 1], [1, -1], [-1, -1]]) t.moveTo(n + a * 8, s + l * 8), t.lineTo(n + a * 15, s + l * 15);
        t.stroke();
      }
      t.lineWidth = 3, t.strokeStyle = "rgba(108,250,255,0.25)", t.beginPath(), t.arc(n, s, 64, Math.PI * 0.72, Math.PI * 1.28), t.stroke(), t.strokeStyle = me, t.beginPath(), t.arc(n, s, 64, Math.PI * 1.28 - Math.PI * 0.56 * e.boost, Math.PI * 1.28), t.stroke(), t.strokeStyle = "rgba(255,155,74,0.25)", t.beginPath(), t.arc(n, s, 64, -Math.PI * 0.28, Math.PI * 0.28), t.stroke(), t.strokeStyle = e.hull < 0.3 ? Ce : Z, t.shadowColor = t.strokeStyle, t.beginPath(), t.arc(n, s, 64, Math.PI * 0.28 - Math.PI * 0.56 * e.hull, Math.PI * 0.28), t.stroke();
      let r = this.w / 2 + e.stickX * 70,
        i = this.h / 2 + e.stickY * 70;
      if (t.shadowBlur = 0, t.strokeStyle = "rgba(108,250,255,0.55)", t.lineWidth = 1.4, t.beginPath(), t.arc(r, i, 5, 0, Math.PI * 2), t.stroke(), e.leadOn && (t.strokeStyle = Ce, t.shadowColor = Ce, t.shadowBlur = 0, t.lineWidth = 1.5, t.beginPath(), t.arc(e.leadX, e.leadY, 7, 0, Math.PI * 2), t.moveTo(e.leadX - 11, e.leadY), t.lineTo(e.leadX - 4, e.leadY), t.moveTo(e.leadX + 4, e.leadY), t.lineTo(e.leadX + 11, e.leadY), t.stroke()), e.lockProgress > 0) {
        let a = e.lockOn ? 26 : 70 - 44 * e.lockProgress;
        t.strokeStyle = e.lockOn ? Ce : Z, t.shadowColor = t.strokeStyle, t.shadowBlur = 0, t.lineWidth = 2, t.save(), t.translate(e.lockX, e.lockY), t.rotate(e.lockOn ? performance.now() / 400 : e.lockProgress * 2), t.beginPath();
        for (let l = 0; l < 4; l++) {
          let c = l * Math.PI / 2;
          t.moveTo(Math.cos(c) * a, Math.sin(c) * a), t.lineTo(Math.cos(c + 0.9) * a, Math.sin(c + 0.9) * a);
        }
        t.stroke(), t.restore();
      }
      t.shadowBlur = 0;
    }
    drawMarker(e) {
      let t = this.g,
        n = this.w,
        s = this.h;
      if (e.kind === "system") {
        let r = e.vulnerable ? Z : "rgba(127,178,255,0.8)";
        if (!e.onScreen) {
          if (!e.vulnerable) return;
          let a = e.x - n / 2,
            l = e.y - s / 2,
            c = Math.hypot(a, l) || 1;
          a /= c, l /= c;
          let u = n / 2 - 50,
            d = s / 2 - 50,
            p = Math.min(u / Math.abs(a || 1e-6), d / Math.abs(l || 1e-6)),
            m = n / 2 + a * p,
            f = s / 2 + l * p;
          t.save(), t.translate(m, f), t.rotate(Math.atan2(l, a)), t.fillStyle = Z, t.shadowColor = Z, t.shadowBlur = 0, t.beginPath(), t.moveTo(14, 0), t.lineTo(-6, -9), t.lineTo(-6, 9), t.closePath(), t.fill(), t.restore(), t.shadowBlur = 0, t.fillStyle = Z, t.fillText(`${e.label ?? ""} ${Math.round(e.dist)}m`, m - a * 26, f - l * 26 + 4);
          return;
        }
        if (!e.vulnerable && e.dist > 900) {
          t.strokeStyle = "rgba(127,178,255,0.45)", t.lineWidth = 1, t.beginPath(), t.moveTo(e.x, e.y - 5), t.lineTo(e.x + 5, e.y), t.lineTo(e.x, e.y + 5), t.lineTo(e.x - 5, e.y), t.closePath(), t.stroke();
          return;
        }
        let i = Math.max(16, Math.min(60, 9e3 / Math.max(1, e.dist)));
        t.strokeStyle = r, t.shadowColor = r, t.shadowBlur = 0, t.lineWidth = 1.6, t.beginPath();
        for (let [a, l] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) t.moveTo(e.x + a * i, e.y + l * i * 0.6), t.lineTo(e.x + a * i * 0.6, e.y + l * i);
        e.vulnerable || (t.moveTo(e.x, e.y - 8), t.lineTo(e.x + 8, e.y), t.lineTo(e.x, e.y + 8), t.lineTo(e.x - 8, e.y), t.closePath()), t.stroke(), t.shadowBlur = 0, t.fillStyle = r, (e.vulnerable || e.dist < 700) && (t.fillText(`${e.label ?? ""}${e.vulnerable ? "" : " \xB7 SHIELDED"}`, e.x, e.y - i - 16), t.fillText(`${Math.round(e.dist)}m`, e.x, e.y + i + 14)), e.hp != null && e.vulnerable && (t.fillStyle = "rgba(255,155,74,0.25)", t.fillRect(e.x - 30, e.y - i - 10, 60, 4), t.fillStyle = Z, t.fillRect(e.x - 30, e.y - i - 10, 60 * e.hp, 4));
        return;
      }
      if (e.onScreen) {
        if (e.kind === "enemy") {
          let r = Math.max(6, Math.min(22, 1400 / Math.max(1, e.dist)));
          t.strokeStyle = e.locked ? "#ffffff" : Ce, t.lineWidth = 1.4, t.beginPath(), t.moveTo(e.x - r, e.y - r + 4), t.lineTo(e.x - r, e.y - r), t.lineTo(e.x - r + 4, e.y - r), t.moveTo(e.x + r - 4, e.y - r), t.lineTo(e.x + r, e.y - r), t.lineTo(e.x + r, e.y - r + 4), t.moveTo(e.x + r, e.y + r - 4), t.lineTo(e.x + r, e.y + r), t.lineTo(e.x + r - 4, e.y + r), t.moveTo(e.x - r + 4, e.y + r), t.lineTo(e.x - r, e.y + r), t.lineTo(e.x - r, e.y + r - 4), t.stroke(), e.hp != null && e.hp < 0.99 && (t.fillStyle = Ce, t.fillRect(e.x - r, e.y + r + 3, 2 * r * e.hp, 2));
        } else if (e.kind === "turret") t.strokeStyle = "rgba(255,155,74,0.8)", t.lineWidth = 1.2, t.beginPath(), t.moveTo(e.x, e.y - 6), t.lineTo(e.x + 6, e.y), t.lineTo(e.x, e.y + 6), t.lineTo(e.x - 6, e.y), t.closePath(), t.stroke();else if (e.kind === "ally") {
          let r = e.color ?? me;
          t.fillStyle = r, t.strokeStyle = r, t.beginPath(), t.moveTo(e.x, e.y - 12), t.lineTo(e.x + 6, e.y - 20), t.lineTo(e.x - 6, e.y - 20), t.closePath(), t.fill(), t.fillText(e.label ?? "", e.x, e.y - 26);
        }
      }
    }
  },
  en = new ga.Vector3();
function vt(o, e, t, n, s) {
  en.copy(o).applyMatrix4(e.matrixWorldInverse);
  let r = en.z > 0;
  en.applyMatrix4(e.projectionMatrix);
  let i = (en.x * 0.5 + 0.5) * t,
    a = (-en.y * 0.5 + 0.5) * n;
  r && (i = t - i, a = n - a), s.x = i, s.y = a, s.behind = r, s.onScreen = !r && i > 0 && i < t && a > 0 && a < n;
}
var Qe = () => performance.now() / 1e3,
  tn = class {
    constructor(e, t, n) {
      this.minDelay = e;
      this.maxDelay = t;
      this.delay = n;
    }
    offset = Number.NaN;
    newest = Number.NEGATIVE_INFINITY;
    time = Number.NaN;
    delay;
    underruns = 0;
    stable = 0;
    reset() {
      this.offset = Number.NaN, this.newest = Number.NEGATIVE_INFINITY, this.time = Number.NaN, this.stable = 0;
    }
    sample(e) {
      let t = e - Qe();
      Number.isNaN(this.offset) || t > this.offset ? this.offset = t : this.offset -= 4e-4, e > this.newest && (this.newest = e);
    }
    get newestTime() {
      return this.newest;
    }
    advance(e) {
      if (Number.isNaN(this.offset)) return this.time;
      let t = Qe() + this.offset - this.delay;
      if (Number.isNaN(this.time) || t - this.time > 1) this.time = t;else {
        let n = Math.max(0.85, Math.min(1.15, 1 + (t - this.time) * 1.5));
        this.time += e * n;
      }
      return this.time > this.newest ? (this.underruns++, this.stable = 0, this.delay = Math.min(this.maxDelay, this.delay + 0.012)) : (this.stable += e, this.stable > 3 && (this.delay = Math.max(this.minDelay, this.delay - e * 0.02))), this.time;
    }
  },
  on = class {
    constructor(e = 32) {
      this.cap = e;
    }
    items = [];
    push(e, t) {
      if (!Number.isNaN(t) && e.time < t - 0.5) return !1;
      let n = this.items[this.items.length - 1];
      if (!n || e.time > n.time) this.items.push(e);else {
        if (this.items.some(r => r.time === e.time)) return !1;
        let s = this.items.length - 1;
        for (; s >= 0 && this.items[s].time > e.time;) s--;
        this.items.splice(s + 1, 0, e);
      }
      for (; this.items.length > this.cap;) this.items.shift();
      return !0;
    }
    clear() {
      this.items.length = 0;
    }
    get latest() {
      return this.items[this.items.length - 1];
    }
    bracket(e) {
      let t = this.items;
      if (t.length === 0) return null;
      if (e <= t[0].time) return [t[0], t[0], 0];
      for (let n = t.length - 1; n >= 0; n--) if (t[n].time <= e) {
        let s = t[n],
          r = t[n + 1];
        if (!r) return [s, s, e - s.time];
        let i = (e - s.time) / (r.time - s.time);
        return [s, r, Math.max(0, Math.min(1, i))];
      }
      return [t[0], t[0], 0];
    }
  };
import * as J from "./vendor/001-three-0.185.js";
var xc = 600,
  xs = 290,
  va = 2.4,
  Pr = 320,
  Ta = 3.2,
  Rc = 460,
  ys = 36,
  xa = 5,
  ws = new J.Vector3(0, 1, 0),
  wa = new J.Vector3(),
  _ = new J.Vector3(),
  vs = new J.Vector3(),
  nn = new J.Vector3(),
  Ts = new J.Matrix4(),
  Cr = new J.Vector3(),
  Dt = class o {
    constructor(e, t, n, s, r = 0) {
      this.mission = e;
      this.epoch = t;
      this.nameOf = s;
      this.time = r;
      let i = Math.max(1, n),
        a = 0.6 + 0.4 * i;
      this.compMax = G.map(c => Math.round(c.baseHp * a)), this.compHp = this.compMax.slice(), this.tickets = 2 + 2 * i;
      let l = 110 + 14 * i;
      this.turrets = te.map(() => ({
        state: 0,
        hp: l,
        max: l,
        boltCd: Math.random() * 2,
        flakCd: Math.random() * 3
      })), this.pilots = i, this.deployTurrets();
    }
    time;
    seq = 0;
    phase = re;
    jump = xc;
    tickets;
    wave = 0;
    waveTimer = 9;
    stage = 0;
    pilots = 1;
    compHp;
    compMax;
    turrets;
    enemies = [];
    scores = new Map();
    endReason = "";
    endTimer = 0;
    ended = !1;
    recent = [];
    fresh = [];
    eventCounter = 0;
    nextEnemyId = 1;
    spawnQueue = [];
    hangarFlip = 0;
    lastAlive = 0;
    static resume(e, t, n) {
      let s = new o(e.mission, e.epoch + 1, e.pilots, n, e.time);
      s.phase = e.phase, s.jump = e.jump, s.tickets = e.tickets, s.wave = e.wave, s.waveTimer = 12, s.compHp = e.compHp.slice(), s.compMax = e.compMax.slice(), s.stage = gt(s.compHp), e.turrets.forEach((i, a) => {
        let l = s.turrets[a];
        i === 0 ? l.state = 0 : i === 1 ? l.state = 1 : (l.state = 2, l.hp = Math.max(1, (i - 2) / 253 * l.max));
      });
      let r = 0;
      for (let i of e.enemies) {
        let a = new J.Quaternion(i.qx, i.qy, i.qz, i.qw),
          l = new J.Vector3(0, 0, -1).applyQuaternion(a);
        s.enemies.push({
          id: i.id,
          pos: new J.Vector3(i.x, i.y, i.z),
          fwd: l,
          quat: a,
          bank: 0,
          speed: 62,
          hp: Math.max(1, i.hp * ys),
          target: null,
          retarget: 0,
          mode: 0,
          modeT: 0,
          fireCd: 1 + Math.random(),
          evade: new J.Vector3()
        }), r = Math.max(r, i.id);
      }
      s.nextEnemyId = (r + 1) % 65535 || 1;
      for (let i of t) s.scores.set(i.id, {
        ...i
      });
      return s;
    }
    row(e) {
      let t = this.scores.get(e);
      return t || (t = {
        id: e,
        name: this.nameOf(e),
        kills: 0,
        turrets: 0,
        systems: 0,
        deaths: 0,
        score: 0
      }, this.scores.set(e, t)), t;
    }
    rows() {
      return [...this.scores.values()].sort((e, t) => t.score - e.score);
    }
    emit(e, t, n, s, r = 0, i = 0, a = 0, l = 0, c = this.time) {
      this.eventCounter = this.eventCounter + 1 & 4194303;
      let u = {
        kind: e,
        id: (this.epoch & 1023) << 22 | this.eventCounter,
        time: c,
        x: t,
        y: n,
        z: s,
        dx: r,
        dy: i,
        dz: a,
        ref: l
      };
      return this.recent.push({
        ev: u,
        created: this.time
      }), this.fresh.push(u), u;
    }
    deployTurrets() {
      let e = Math.min(be, 8 + Math.round(1.3 * this.pilots) + this.stage * 2),
        t = this.turrets.filter(n => n.state !== 0).length;
      for (let n of this.turrets) {
        if (t >= e) break;
        n.state === 0 && (n.state = 2, t++);
      }
    }
    applyHits(e, t) {
      if (this.phase !== re || !Array.isArray(t)) return;
      let n = this.row(e);
      for (let s of t.slice(0, 80)) {
        if (!Array.isArray(s) || s.length !== 3) continue;
        let [r, i, a] = s,
          l = Math.max(0, Math.min(200, Number(a) || 0));
        if (r === _t) {
          let c = this.enemies.findIndex(d => d.id === i);
          if (c < 0) continue;
          let u = this.enemies[c];
          u.hp -= l, u.hp <= 0 ? (this.enemies.splice(c, 1), this.emit(ms, u.pos.x, u.pos.y, u.pos.z, u.fwd.x, u.fwd.y, u.fwd.z, u.id), n.kills++, n.score += 100) : u.mode === 0 && Math.random() < 0.3 && this.startEvade(u);
        } else if (r === Ft) {
          let c = this.turrets[i];
          if (!c || c.state !== 2) continue;
          if (c.hp -= l, c.hp <= 0) {
            c.state = 1;
            let u = te[i];
            this.emit(hs, u.pos.x, u.pos.y, u.pos.z, u.normal.x, u.normal.y, u.normal.z, i), n.turrets++, n.score += 150;
          }
        } else if (r === st) {
          let c = G[i];
          if (!c || this.compHp[i] <= 0 || this.stage < c.stage) continue;
          let u = Math.min(l, this.compHp[i]);
          if (this.compHp[i] -= u, n.score += Math.round(u * 0.5), this.compHp[i] <= 0) {
            this.compHp[i] = 0, this.emit(Xo, c.aim.x, c.aim.y, c.aim.z, 0, 0, 0, i), n.systems++, n.score += 500;
            let d = this.stage;
            this.stage = gt(this.compHp), this.stage !== d && this.deployTurrets(), c.kind === "reactor" && this.finish(!0, "reactor");
          }
        }
      }
    }
    onDeath(e) {
      this.row(e).deaths++;
    }
    trySpawn(e) {
      return this.phase !== re || this.tickets <= 0 ? !1 : (this.tickets--, !0);
    }
    abort() {
      this.finish(!1, "abort"), this.ended = !0;
    }
    finish(e, t) {
      if (this.phase === re && (this.phase = e ? wo : ia, this.endReason = t, this.endTimer = 0, e)) {
        let n = 2e3 + Math.round(this.jump) * 4;
        for (let s of this.scores.values()) s.score += n;
      }
    }
    step(e, t) {
      this.time += e;
      for (let r of t) this.row(r.id);
      let n = Math.max(1, t.length);
      if (n !== this.pilots && (this.pilots = n, this.deployTurrets()), this.phase !== re) {
        this.endTimer += e, this.endTimer > (this.phase === wo ? 7 : 4.5) && (this.ended = !0), this.stepEnemies(e, t, !1);
        return;
      }
      this.jump -= e, this.jump <= 0 && (this.jump = 0, this.finish(!1, "jump"));
      let s = t.some(r => r.alive);
      s && (this.lastAlive = this.time), this.tickets <= 0 && !s && this.time - this.lastAlive > 2.5 && this.finish(!1, "squad"), this.stepWaves(e), this.stepEnemies(e, t, !0), this.stepTurrets(e, t);
    }
    stepWaves(e) {
      this.waveTimer -= e;
      let t = Math.min(44, 5 + 3 * this.pilots);
      if (this.waveTimer <= 0) {
        this.wave = Math.min(255, this.wave + 1);
        let n = 2 + Math.round(1.4 * this.pilots) + Math.floor(this.wave / 2),
          s = Math.max(0, t - this.enemies.length - this.spawnQueue.length),
          r = Math.min(n, s),
          i = [2, 3].filter(a => this.compHp[a] > 0);
        for (let a = 0; a < r; a++) {
          let l = -1;
          i.length > 0 && (l = i[this.hangarFlip++ % i.length]), this.spawnQueue.push({
            at: this.time + a * 0.45,
            source: l
          });
        }
        this.waveTimer = Math.max(20, 36 - this.wave * 0.8 - this.stage * 3);
      }
      for (let n = this.spawnQueue.length - 1; n >= 0; n--) {
        let s = this.spawnQueue[n];
        s.at > this.time || (this.spawnQueue.splice(n, 1), !(this.enemies.length >= t) && this.spawnEnemy(s.source));
      }
    }
    spawnEnemy(e) {
      let t = new J.Vector3(),
        n = new J.Vector3(),
        s = 0;
      if (e >= 0 && this.compHp[e] > 0) Wn(e, t), Yn(e, n), s = 2, this.emit(Zo, t.x, t.y, t.z, n.x, n.y, n.z, e);else {
        let a = Math.random() * Math.PI * 2,
          l = 900 + Math.random() * 600;
        t.set(Math.cos(a) * l, 150 + (Math.random() - 0.3) * 500, Math.sin(a) * l), n.copy(t).multiplyScalar(-1).normalize(), this.emit(fs, t.x, t.y, t.z, n.x, n.y, n.z, 0);
      }
      let r = new J.Quaternion().setFromRotationMatrix(Ts.lookAt(Cr, n, ws)),
        i = this.nextEnemyId;
      this.nextEnemyId = this.nextEnemyId % 65534 + 1, this.enemies.push({
        id: i,
        pos: t,
        fwd: n,
        quat: r,
        bank: 0,
        speed: 62,
        hp: ys,
        target: null,
        retarget: 0,
        mode: s,
        modeT: s === 2 ? 1.6 : 0,
        fireCd: 1.5 + Math.random(),
        evade: new J.Vector3()
      });
    }
    spawnAt(e, t, n = -1) {
      n >= 0 && this.emit(Zo, e.x, e.y, e.z, t.x, t.y, t.z, n);
      let s = t.clone().normalize(),
        r = new J.Quaternion().setFromRotationMatrix(Ts.lookAt(Cr, s, ws)),
        i = {
          id: this.nextEnemyId,
          pos: e.clone(),
          fwd: s,
          quat: r,
          bank: 0,
          speed: 62,
          hp: ys,
          target: null,
          retarget: 0,
          mode: n >= 0 ? 2 : 0,
          modeT: n >= 0 ? 1.6 : 0,
          fireCd: 0.4,
          evade: new J.Vector3()
        };
      return this.nextEnemyId = this.nextEnemyId % 65534 + 1, this.enemies.push(i), i;
    }
    startEvade(e) {
      e.mode = 1, e.modeT = 1.2 + Math.random() * 1.2, e.evade.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize(), e.evade.addScaledVector(e.fwd, 0.6).normalize();
    }
    stepEnemies(e, t, n) {
      let s = Math.min(1.6, 1 + this.wave * 0.03 + this.stage * 0.1);
      for (let r of this.enemies) {
        r.retarget -= e, r.fireCd -= e, r.modeT -= e;
        let i = t.find(f => f.id === r.target && f.alive);
        if (!i || r.retarget <= 0) {
          let f = 1 / 0;
          for (let h of t) {
            if (!h.alive) continue;
            let E = h.pos.distanceTo(r.pos) * (0.7 + Math.random() * 0.6);
            E < f && (f = E, i = h);
          }
          r.target = i?.id ?? null, r.retarget = 3 + Math.random() * 4;
        }
        let a = wa,
          l = 1 / 0;
        if (r.mode === 2) a.copy(r.fwd), r.modeT <= 0 && (r.mode = 0);else if (r.mode === 1) a.copy(r.evade), r.modeT <= 0 && (r.mode = 0);else if (i) {
          l = i.pos.distanceTo(r.pos);
          let f = l / xs;
          a.copy(i.pos).addScaledVector(i.vel, f * 0.85).sub(r.pos).normalize(), l < 55 && this.startEvade(r);
        } else {
          let f = this.time * 0.08 + r.id;
          a.set(Math.sin(f) * 900, 260, Math.cos(f) * 900).sub(r.pos).normalize();
        }
        _.copy(r.pos).addScaledVector(r.fwd, 70), lo(_, 26, nn) > 0 && a.addScaledVector(nn, 2.5).normalize(), lo(r.pos, 8, nn) > 0 && (r.pos.addScaledVector(nn, 6), a.copy(nn)), r.pos.lengthSq() > Fo * Fo && a.copy(r.pos).multiplyScalar(-1).normalize();
        let u = (r.mode === 1 ? 1.9 : 1.35) * e,
          d = r.fwd.angleTo(a);
        vs.crossVectors(r.fwd, a);
        let p = vs.dot(ws);
        if (d > 1e-4) {
          let f = Math.min(1, u / d);
          r.fwd.lerp(a, f).normalize();
        }
        r.bank += (Math.max(-1, Math.min(1, -p * 3)) * 0.9 - r.bank) * Math.min(1, e * 3);
        let m = r.mode === 1 ? 78 : r.mode === 2 ? 70 : l < 160 ? 52 : 64;
        if (r.speed += (m - r.speed) * Math.min(1, e * 1.5), r.pos.addScaledVector(r.fwd, r.speed * e), _.copy(ws), Math.abs(r.fwd.y) > 0.95 && _.set(0, 0, 1), Ts.lookAt(Cr, r.fwd, _), r.quat.setFromRotationMatrix(Ts), Math.abs(r.bank) > 0.001) {
          vs.set(0, 0, 1);
          let f = Hc.setFromAxisAngle(vs, r.bank);
          r.quat.multiply(f);
        }
        if (n && r.mode === 0 && i && r.fireCd <= 0 && l < 520 && (_.copy(i.pos).addScaledVector(i.vel, l / xs).sub(r.pos).normalize(), _.angleTo(r.fwd) < 0.16)) {
          let f = 0.028 / s;
          _.x += (Math.random() - 0.5) * f, _.y += (Math.random() - 0.5) * f, _.z += (Math.random() - 0.5) * f, _.normalize();
          let h = r.pos.x + r.fwd.x * 5,
            E = r.pos.y + r.fwd.y * 5,
            M = r.pos.z + r.fwd.z * 5;
          this.emit(ds, h, E, M, _.x, _.y, _.z, r.id), r.fireCd = (0.42 + Math.random() * 0.4) / s;
        }
      }
    }
    stepTurrets(e, t) {
      let n = Math.min(2, 1 + this.stage * 0.25 + this.wave * 0.02);
      for (let s = 0; s < be; s++) {
        let r = this.turrets[s];
        if (r.state !== 2 || (r.boltCd -= e, r.flakCd -= e, r.boltCd > 0 && r.flakCd > 0)) continue;
        let i = te[s],
          a = Ae(i, wa),
          l = null,
          c = 950;
        for (let u of t) {
          if (!u.alive) continue;
          _.copy(u.pos).sub(a);
          let d = _.length();
          d > c || _.dot(i.normal) / d < 0.04 || (c = d, l = u);
        }
        if (!l) {
          r.boltCd <= 0 && (r.boltCd = 0.5), r.flakCd <= 0 && (r.flakCd = 0.7);
          continue;
        }
        if (r.boltCd <= 0 && c < 780) {
          let u = c / Pr;
          _.copy(l.pos).addScaledVector(l.vel, u).sub(a).normalize(), _.x += (Math.random() - 0.5) * 0.04, _.y += (Math.random() - 0.5) * 0.04, _.z += (Math.random() - 0.5) * 0.04, _.normalize(), this.emit(Ko, a.x, a.y, a.z, _.x, _.y, _.z, s), r.boltCd = (1.5 + Math.random() * 0.9) / n;
        }
        if (r.flakCd <= 0) {
          let u = c / Rc;
          _.copy(l.pos).addScaledVector(l.vel, u), _.x += (Math.random() - 0.5) * 44, _.y += (Math.random() - 0.5) * 44, _.z += (Math.random() - 0.5) * 44, this.emit(ps, _.x, _.y, _.z, 0, 0, 0, s, this.time + u), r.flakCd = (2.6 + Math.random() * 1.4) / n;
        }
      }
    }
    snapshot() {
      let e = this.time - 0.32;
      for (; this.recent.length && this.recent[0].created < e;) this.recent.shift();
      let t = this.turrets.map(n => n.state === 0 ? 0 : n.state === 1 ? 1 : 2 + Math.round(Math.max(0, n.hp) / n.max * 253));
      return {
        mission: this.mission,
        epoch: this.epoch,
        seq: ++this.seq,
        time: this.time,
        phase: this.phase,
        jump: this.jump,
        tickets: this.tickets,
        stage: this.stage,
        wave: this.wave,
        pilots: this.pilots,
        compHp: this.compHp.slice(),
        compMax: this.compMax.slice(),
        turrets: t,
        enemies: this.enemies.map(n => ({
          id: n.id,
          x: n.pos.x,
          y: n.pos.y,
          z: n.pos.z,
          qx: n.quat.x,
          qy: n.quat.y,
          qz: n.quat.z,
          qw: n.quat.w,
          hp: n.hp / ys
        })),
        events: this.recent.map(n => n.ev)
      };
    }
  },
  Hc = new J.Quaternion();
var zc = Q.ready(),
  zr = 1 / 30,
  Bc = 1 / 15,
  Ic = 1 / 20,
  Yr = 560,
  Lc = 1.45,
  Br = 12,
  qc = 0.11,
  Is = 4,
  Gc = 12,
  Ro = 0.8,
  Oc = 0.19,
  Nc = 4,
  Qr = 66,
  ct = new S.WebGLRenderer({
    antialias: !0,
    powerPreference: "high-performance"
  });
ct.outputColorSpace = S.SRGBColorSpace;
ct.toneMapping = S.ACESFilmicToneMapping;
ct.toneMappingExposure = 1.05;
var Mo = ct.domElement;
Mo.style.cssText = "display:block;position:fixed;inset:0;width:100%;height:100%;touch-action:none";
document.body.style.cssText = "margin:0;overflow:hidden;background:#05070c";
document.body.append(Mo);
var ke = new S.Scene(),
  I = new S.PerspectiveCamera(Qr, 1, 0.5, 6e4);
I.position.set(0, 300, -1600);
var ko = new Vc(ct);
ko.addPass(new Ac(ke, I));
var _c = new Cc(new S.Vector2(512, 512), 0.85, 0.55, 0.82);
ko.addPass(_c);
ko.addPass(new Pc());
var Fc = gi(ke, ct),
  Sa = new S.DirectionalLight("#9fb6e0", 1.1);
Sa.position.set(600, 900, 900);
ke.add(Sa);
var F = new In(ke),
  $ = new Es(),
  ie = new as(Mo),
  _r = Qr;
function Va() {
  let o = window.innerWidth,
    e = window.innerHeight,
    t = Math.min(window.devicePixelRatio || 1, 1.5);
  ct.setPixelRatio(t), ct.setSize(o, e), ko.setPixelRatio(t), ko.setSize(o, e), I.aspect = o / e;
  let n = Math.max(1, 16 / 9 / I.aspect);
  _r = S.MathUtils.radToDeg(2 * Math.atan(Math.tan(S.MathUtils.degToRad(Qr / 2)) * n)), I.fov = _r, I.updateProjectionMatrix(), $.resize();
}
window.addEventListener("resize", Va);
Va();
var xn = await _i();
console.info("[models]", xn.report.join(" | "));
var it = new Xn(xn, F);
ke.add(it.group);
function fn(o) {
  let e = Hr(o),
    t = e.userData.rig;
  return ke.add(e), {
    root: e,
    glows: t.glows.map(n => n.obj),
    rig: t
  };
}
var Aa = [],
  Ra = xn.fromFile.enemy ? Uc() : null;
function Dc() {
  let o = Aa.pop();
  if (o) return o.root.visible = !0, o;
  let e = new S.Group(),
    t = new S.LOD();
  t.addLevel(xn.enemy.clone(!0), 0), Ra && t.addLevel(Ra.clone(!0), 240), e.add(t);
  let n = [];
  for (let [s, r] of [[-1.1, 0.7], [1.1, 0.7], [-1.1, -0.7], [1.1, -0.7]]) {
    let i = zt("#ff5a3c", 0.34);
    i.position.set(s, r, 3.6), e.add(i), n.push(i);
  }
  return ke.add(e), {
    root: e,
    glows: n
  };
}
function $r(o) {
  o.root.visible = !1, Aa.push(o);
}
function Uc() {
  let o = new S.Group(),
    e = new S.MeshStandardMaterial({
      color: "#cfcac2",
      metalness: 0.4,
      roughness: 0.5
    }),
    t = new S.MeshStandardMaterial({
      color: "#b3262c",
      metalness: 0.4,
      roughness: 0.5
    });
  e.userData.shared = t.userData.shared = !0;
  let n = new S.Mesh(new S.BoxGeometry(1.2, 1, 9), e);
  o.add(n);
  for (let s of [-1, 1]) for (let r of [-1, 1]) {
    let i = new S.Mesh(new S.BoxGeometry(4.6, 0.15, 2), r > 0 ? t : e);
    i.position.set(s * 2.6, r * 0.5, 2), i.rotation.z = s * r * 0.25, o.add(i);
  }
  return o.traverse(s => {
    s instanceof S.Mesh && (s.geometry.userData.shared = !0);
  }), o;
}
var Ho = [],
  Kr = [];
function jc() {
  let o = Kr.pop();
  if (o) return o.visible = !0, o;
  let e = new S.Group();
  e.add(xn.missile.clone(!0));
  let t = zt("#8fd8ff", 0.3);
  return t.position.z = 1.7, De(t, 1, !0), e.add(t), ke.add(e), e;
}
var B = "title",
  Yt = "",
  sn = !1,
  ln = !1,
  D = 0,
  A = null,
  bn = !1,
  rn = 0,
  Ir = 0,
  Lr = 0,
  lt = 0,
  ks = 0,
  Ca = 0,
  Fr = !1,
  cn = 0,
  Dr = 0,
  Qt = new on(24),
  Ke = new tn(0.09, 0.4, 0.16),
  Rt = null,
  $t = [],
  R = {
    phase: re,
    jump: 600,
    tickets: 0,
    stage: 0,
    wave: 0,
    pilots: 1,
    compHp: G.map(o => o.baseHp),
    compMax: G.map(o => o.baseHp),
    turrets: new Array(be).fill(0)
  },
  Cs = 0,
  un = 0,
  w = new ls(),
  X = null,
  kt = 0,
  So = 0,
  Fe = !1,
  Pa = 0,
  Ht = !1,
  Ss = 0,
  Ur = 0,
  jr = [0, 0],
  Vs = 0,
  xt = Is,
  dn = 0,
  Ee = 0,
  _e = -1,
  xe = 0,
  Rs = !1,
  Ps = [],
  qr = 0,
  Wc = 0,
  xo = 0,
  Mt = 0,
  En = 0,
  He = 0,
  Gr = "",
  jt = new S.Quaternion(),
  gn = new S.Vector3(),
  za = new S.Vector3(),
  Ba = new S.Vector3(),
  Ia = -99,
  ee = 0,
  Me = new Map(),
  ye = new Map(),
  pn = new Map(),
  yn = 0,
  rt = [],
  Xr = [],
  Tt = [],
  mn = [],
  wn = new Map(),
  an = [],
  z = new S.Vector3(),
  ge = new S.Vector3(),
  Ne = new S.Vector3(),
  zs = new S.Quaternion(),
  Ls = new S.Vector3(0, 0, -1),
  La = new S.Vector3(0, 4.2, 19),
  Yc = ya(),
  Zr = () => Math.floor(Math.random() * 4294967294) + 1 >>> 0,
  Qc = () => null !== null,
  qa = () => A ? A.time : Ke.time;
function $c() {
  return [].map(o => o.id).sort();
}
function Ga(o) {
  let e = $c().indexOf(o);
  if (e >= 0) return e % he.length;
  let t = 0;
  for (let n of o) t = t * 31 + n.charCodeAt(0) >>> 0;
  return t % he.length;
}
function at(o, e) {
  let t = o.distanceTo(w.alive ? w.pos : I.position);
  return Math.max(0, 1 - t / e);
}
function Ha(o) {
  return $t.find(e => e.id === o);
}
function ut() {
  B = "title", $.setFlightVisible(!1), ie.enabled = !1, Q.unlockPointer(), L.engineOff(), $.showTitle(!!null, Yt, sn, {
    friends: () => {
      L.uiClick(), void 0;
    },
    solo: () => {
      L.uiClick(), Na();
    }
  });
}
var Ma = "";
function Vo() {
  Oa(), Qt.clear(), Ke.reset(), Rt = null, $t = [], Ps = [], A = null, rn = 0, bn = !1, Fr = !1, cn = 0;
  for (let o of Me.values()) o.buf.clear(), o.pb.reset(), o.lastFire = -1, o.lastMissiles = -1;
}
function Oa() {
  F.clear();
  for (let o of rt) Xr.push(o);
  rt.length = 0, Tt.length = 0, mn.length = 0, an.length = 0, wn.clear();
  for (let o of Ho) o.obj.visible = !1, Kr.push(o.obj);
  Ho.length = 0;
  for (let o of ye.values()) $r(o.vis);
  ye.clear(), pn.clear();
}
function vn(o, e, t) {
  Vo(), D = o, B = "mission", $.closeMenu(), $.setFlightVisible(!0), Tn(!1), lt = 0, R.compMax = G.map(n => n.baseHp), R.compHp = R.compMax.slice(), R.turrets.fill(0), R.stage = 0, R.wave = 0, R.phase = re, Cs = 0, un = 0, true && (t || !Qc()) && (A = new Dt(o, 1, e, n => "Pilot"), lt = 1, qs()), kt = Ga("local"), X ? Jr() : X = fn(he[kt]), Ht = !1, Fe = !1, ei(), $.banner("STRIKE BEGINS", "Take down the shield domes on the aft deck", "#ff9b4a", 4), jt.copy(w.quat), gn.copy(w.pos), Q.pointerLocked || Q.lockPointer(Mo);
}
function Jr() {
  X && (ke.remove(X.root), X = fn(he[kt]));
}
function ei() {
  let o = new S.Vector3((Math.random() - 0.5) * 160, (Math.random() - 0.5) * 60, (Math.random() - 0.5) * 60),
    e = Di.clone().add(o),
    t = new S.Vector3(0, 190, 320).sub(e).normalize();
  w.spawn(e, t), So = 0, xt = Is, dn = 0, Ee = 0, _e = -1, xe = 0, jt.copy(w.quat), gn.copy(w.pos), L.respawn();
}
function Na() {
  null && void 0, vn(Zr(), 1, !0);
}
function qs() {
  if (A) {
    R.phase = A.phase, R.jump = A.jump, R.tickets = A.tickets, R.stage = A.stage, R.wave = A.wave, R.pilots = A.pilots;
    for (let o = 0; o < qt; o++) R.compHp[o] = A.compHp[o], R.compMax[o] = A.compMax[o];
    for (let o = 0; o < be; o++) {
      let e = A.turrets[o];
      R.turrets[o] = e.state === 0 ? 0 : e.state === 1 ? 1 : 2 + Math.round(Math.max(0, e.hp) / e.max * 253);
    }
  }
}
function Zc(o) {
  R.phase = o.phase, R.jump = o.jump, R.tickets = o.tickets, R.stage = o.stage, R.wave = o.wave, R.pilots = o.pilots;
  for (let e = 0; e < qt; e++) R.compHp[e] = o.compHp[e], R.compMax[e] = o.compMax[e];
  for (let e = 0; e < be; e++) R.turrets[e] = o.turrets[e];
}
function _a(o, e, t, n) {
  if (Fr || B !== "mission") return;
  Fr = !0, $t = n, Dr = n.find(r => r.id === "local")?.score ?? 0, B = "results", ie.enabled = !1, Q.unlockPointer(), L.engineOff(), o ? L.victory() : L.defeat(), $.setFlightVisible(!1), $.showResults(o, e, t, n.map(r => ({
    name: r.name,
    kills: r.kills,
    turrets: r.turrets,
    systems: r.systems,
    score: r.score,
    me: r.id === "local"
  })), Dr), cn = ee + 6, A = null;
}
function Jc(o, e) {
  if (o !== "local") return;
  let t = ca(e);
  if (!t) return;
  if (B !== "mission" || t.mission !== D) {
    t.phase === re && (ks = t.mission, Ca = Qe(), R.pilots = t.pilots, B === "lobby" && void 0);
    return;
  }
  if (A || t.epoch < lt) return;
  t.epoch > lt && (lt = t.epoch, Qt.clear(), Ke.reset());
  let n = t;
  if (n.byId = new Map(t.enemies.map(s => [s.id, s])), Ke.sample(t.time), !!Qt.push(n, Ke.time)) {
    (!Rt || t.time > Rt.time) && (Rt = n);
    for (let s of t.events) Fa(s);
  }
}
function e0(o, e) {
  let t = pa(e);
  if (!t) return;
  let n = Me.get(o);
  n || (n = {
    id: o,
    buf: new on(24),
    pb: new tn(0.08, 0.3, 0.13),
    vis: null,
    pos: new S.Vector3(),
    quat: new S.Quaternion(),
    vel: new S.Vector3(),
    fwd: new S.Vector3(0, 0, -1),
    alive: !1,
    color: t.color % he.length,
    lastFire: -1,
    lastMissiles: -1,
    lastSeen: 0,
    mission: 0,
    throttle: 0,
    boost: !1,
    shown: !1
  }, Me.set(o, n)), n.lastSeen = Qe(), t.mission !== n.mission && (n.mission = t.mission, n.buf.clear(), n.pb.reset(), n.lastFire = -1, n.lastMissiles = -1);
  let s = t.color % he.length;
  (s !== n.color || !n.vis) && (n.color = s, n.vis && ke.remove(n.vis.root), n.vis = fn(he[s]), n.vis.root.visible = !1), n.pb.sample(t.time), n.buf.push(t, n.pb.time);
}
function Fa(o) {
  if (!wn.has(o.id)) if (wn.set(o.id, ee), o.kind === ds || o.kind === Ko) {
    let e = o.kind === Ko,
      t = new S.Vector3(o.dx, o.dy, o.dz).normalize();
    Tt.push({
      origin: new S.Vector3(o.x, o.y, o.z),
      dir: t,
      t0: o.time,
      speed: e ? Pr : xs,
      life: e ? Ta : va,
      kind: e ? 2 : 1,
      pos: new S.Vector3(o.x, o.y, o.z),
      prev: new S.Vector3(o.x, o.y, o.z),
      started: !1,
      done: !1
    });
  } else mn.push({
    ev: o,
    done: !1
  });
}
function ka() {
  if (Re.active || !null || null.peers.length === 0) return;
  let o = w.quat,
    e = {
      mission: B === "mission" ? D : 0,
      seq: ++Wc,
      time: Qe(),
      alive: w.alive && B === "mission",
      boost: w.boosting,
      x: w.pos.x,
      y: w.pos.y,
      z: w.pos.z,
      qx: o.x,
      qy: o.y,
      qz: o.z,
      qw: o.w,
      throttle: w.throttle,
      fire: Ss,
      missiles: Ur,
      hp: w.hp / 100,
      mtKind: jr[0],
      mtId: jr[1],
      color: kt
    };
  void 0;
}
function hn(o) {
  A ? A.applyHits("local", o) : Ps.push(...o);
}
function t0() {
  if (Ps.length === 0 || A) return;
  let o = "local";
  if (!o) return;
  let e = {
    t: "hits",
    mission: D,
    h: Ps.splice(0, 80)
  };
  void 0;
}
function ti(o, e) {
  Re.active || !w.alive || B !== "mission" || R.phase !== re || (w.hp -= o, w.lastHit = ee, En = Math.min(1, En + o / 30), He = Math.min(1.5, He + o / 25), L.hurt(Math.min(1, 0.4 + o / 30)), w.hp <= 0 && o0());
}
function o0() {
  if (w.alive = !1, w.hp = 0, Ia = ee, Ba.copy(w.pos), za.copy(La).multiplyScalar(4.5).applyQuaternion(jt).add(w.pos), F.explode(w.pos, "ship", 9), L.explosion(0.45), He = 1.5, So = Nc, Fe = !1, Ee = 0, _e = -1, xe = 0, A) A.onDeath("local");else if ("local") {
    let o = {
      t: "died",
      mission: D
    };
    void 0;
  }
  X && (X.root.visible = !1);
}
function n0() {
  if (Ht || Fe) return;
  if (A) {
    A.trySpawn("local") ? ei() : Ht = !0;
    return;
  }
  let o = "local";
  if (!o) return;
  if (R.tickets <= 0) {
    Ht = !0;
    return;
  }
  Fe = !0, Pa = ee;
  let e = {
    t: "spawnReq",
    mission: D
  };
  void 0;
}
function oi(o, e, t, n, s) {
  let r = Xr.pop() ?? {
    pos: new S.Vector3(),
    prev: new S.Vector3(),
    dir: new S.Vector3(),
    speed: 0,
    life: 0,
    kind: 0,
    own: !1
  };
  r.pos.copy(o), r.prev.copy(o), r.dir.copy(e), r.speed = t, r.life = Lc, r.kind = n, r.own = s, rt.push(r);
}
function Or(o, e, t, n) {
  Ne.subVectors(e, o);
  let s = Ne.lengthSq(),
    r = s > 0 ? Ne.dot(z.subVectors(t, o)) / s : 0;
  return r = Math.max(0, Math.min(1, r)), z.copy(o).addScaledVector(Ne, r), z.distanceToSquared(t) < n * n;
}
function s0(o) {
  let e = null,
    t = 1 / 0;
  for (let r of ye.values()) {
    ge.subVectors(r.pos, w.pos);
    let i = ge.length();
    if (i > 950 || i < 8) continue;
    let a = ge.divideScalar(i).angleTo(w.fwd);
    if (a > 0.4) continue;
    let l = a + i / 4e3;
    l < t && (t = l, e = r);
  }
  if (!e) return null;
  let n = e.pos.distanceTo(w.pos),
    s = n / (Yr + w.speed * 0.5);
  return o.copy(e.pos).addScaledVector(e.fwd, 62 * s), {
    id: e.id,
    dist: n
  };
}
var As = new S.Vector3(),
  Da = !1;
function r0(o) {
  if (!w.alive) {
    B === "mission" && R.phase === re && (So -= o, So <= 0 && n0(), Fe && ee - Pa > 3 && (Fe = !1)), L.engineOff();
    return;
  }
  ie.decay(o);
  let e = w.step(o, ie, ee);
  if (e > 0 && (F.explode(z.copy(w.pos).addScaledVector(w.fwd, 3), "spark", 3), ti(e), !w.alive)) return;
  L.engine(w.throttle, w.boosting);
  let t = s0(As);
  if (Da = t !== null, Vs -= o, ie.fireHeld && Vs <= 0 && R.phase === re) {
    Vs = qc;
    let i = Qo(Ss, X?.rig?.foil ?? 1, ge).applyQuaternion(w.quat).add(w.pos),
      a = Ne;
    t && z.subVectors(As, w.pos).normalize().angleTo(w.fwd) < 0.045 ? a.copy(As) : a.copy(w.pos).addScaledVector(w.fwd, t ? Math.max(120, t.dist) : 380);
    let l = a.sub(i).normalize();
    oi(i, l, Yr + w.speed, 0, !0), F.muzzle(i, 0), Ss = Ss + 1 & 65535, L.laser(0.9);
  }
  let n = 0,
    s = -1,
    r = Oc;
  for (let i of ye.values()) {
    z.subVectors(i.pos, w.pos);
    let a = z.length();
    if (a > 1100) continue;
    let l = z.divideScalar(a).angleTo(w.fwd);
    l < r && (r = l, n = 1, s = i.id);
  }
  for (let i = 0; i < be; i++) {
    if (R.turrets[i] < 2) continue;
    Ae(te[i], ge), z.subVectors(ge, w.pos);
    let a = z.length();
    if (a > 900) continue;
    let l = z.divideScalar(a).angleTo(w.fwd);
    l < r && (r = l, n = 2, s = i);
  }
  for (let i of G) {
    if (R.compHp[i.index] <= 0 || R.stage < i.stage) continue;
    z.subVectors(i.aim, w.pos);
    let a = z.length();
    if (a > 1500) continue;
    let l = z.divideScalar(a).angleTo(w.fwd);
    l < r * 1.3 && (r = l, n = 3, s = i.index);
  }
  if (xt > 0 && n !== 0 ? (n === Ee && s === _e ? xe += o : (Ee = n, _e = s, xe = 0, Rs = !1), xe < Ro ? L.lockTone(xe / Ro) : Rs || (Rs = !0, L.lockAcquired())) : (Ee = 0, _e = -1, xe = 0), xt < Is && (dn += o / Gc, dn >= 1 && (dn = 0, xt++)), ie.missileQueued && (ie.missileQueued = !1, xt > 0 && R.phase === re)) {
    xt--;
    let i = xe >= Ro,
      a = i ? Ee : 0,
      l = i ? _e : 0;
    ni(z.set(0, -1.2, -2).applyQuaternion(w.quat).add(w.pos), w.fwd, w.speed, a, l, !0), Ur = Ur + 1 & 65535, jr = [a, Math.max(0, l)], L.missileLaunch(), xe = 0, Rs = !1;
  }
}
function ni(o, e, t, n, s, r) {
  let i = jc();
  i.position.copy(o), Ho.push({
    obj: i,
    pos: o.clone(),
    vel: e.clone().multiplyScalar(t + 40),
    kind: n,
    id: s,
    life: 6,
    own: r,
    trail: 0
  });
}
function i0(o, e) {
  if (o.kind === 1) {
    let t = ye.get(o.id);
    return t ? (e.copy(t.pos), !0) : !1;
  }
  if (o.kind === 2) {
    let t = te[o.id];
    return !t || !(R.turrets[o.id] >= 2) ? !1 : (Ae(t, e), !0);
  }
  if (o.kind === 3) {
    let t = G[o.id];
    return !t || R.compHp[o.id] <= 0 ? !1 : (e.copy(t.aim), !0);
  }
  return !1;
}
function a0(o) {
  for (let e = Ho.length - 1; e >= 0; e--) {
    let t = Ho[e];
    t.life -= o;
    let n = Math.min(230, t.vel.length() + 140 * o),
      s = !1;
    if (i0(t, ge)) {
      z.subVectors(ge, t.pos);
      let r = z.length();
      z.divideScalar(r), Ne.copy(t.vel).normalize();
      let i = Ne.angleTo(z);
      i > 1e-4 && Ne.lerp(z, Math.min(1, 2.8 * o / i)).normalize(), t.vel.copy(Ne).multiplyScalar(n);
      let a = t.kind === 1 ? 7 : t.kind === 2 ? 11 : 26;
      if (r < a + n * o && (s = !0, t.own)) {
        let l = t.kind === 1 ? 100 : t.kind === 2 ? 170 : 200;
        hn([[t.kind === 1 ? _t : t.kind === 2 ? Ft : st, t.id, l]]), Mt = 0.25;
      }
    } else t.vel.setLength(n);
    t.pos.addScaledVector(t.vel, o), !s && jn(t.pos, 1) && (s = !0, t.own && t.kind === 3 && mr(t.pos, 4) === t.id && (hn([[st, t.id, 200]]), Mt = 0.25)), t.obj.position.copy(t.pos), Ne.copy(t.vel).normalize(), t.obj.quaternion.setFromUnitVectors(Ls, Ne), t.trail -= o, t.trail <= 0 && (t.trail = 0.03, F.puff(t.pos, 1.2)), (s || t.life <= 0) && (F.explode(t.pos, s ? "ship" : "flak", s ? 9 : 5), L.explosion(0.3, at(t.pos, 900)), t.obj.visible = !1, Kr.push(t.obj), Ho.splice(e, 1));
  }
}
function l0(o) {
  F.beginBolts();
  for (let t = rt.length - 1; t >= 0; t--) {
    let n = rt[t];
    n.life -= o, n.prev.copy(n.pos), n.pos.addScaledVector(n.dir, n.speed * o);
    let s = n.life <= 0;
    if (!s && n.own && B === "mission") {
      for (let r of ye.values()) if (Or(n.prev, n.pos, r.pos, xa + 1.5)) {
        hn([[_t, r.id, Br]]), F.impact(r.pos, 0), L.hit(0.6), Mt = 0.15, s = !0;
        break;
      }
      if (!s) for (let r = 0; r < be; r++) {
        if (R.turrets[r] < 2) continue;
        let i = Ae(te[r], ge);
        if (!(n.pos.distanceToSquared(i) > 900 && n.prev.distanceToSquared(i) > 900) && Or(n.prev, n.pos, i, Fi)) {
          hn([[Ft, r, Br]]), F.impact(n.pos, 0), L.hit(0.5), Mt = 0.15, s = !0;
          break;
        }
      }
      if (!s) {
        let r = mr(n.pos);
        if (r >= 0) {
          s = !0;
          let i = G[r];
          R.compHp[r] > 0 && R.stage >= i.stage ? (hn([[st, r, Br]]), F.impact(n.pos, 2), L.hit(0.5), Mt = 0.15) : (it.shieldHit(r), F.impact(n.pos, 0));
        }
      }
    }
    if (!s && jn(n.pos) && (F.impact(n.prev, n.kind), s = !0), s) {
      Xr.push(n), rt[t] = rt[rt.length - 1], rt.pop();
      continue;
    }
    F.pushBolt(n.pos, n.dir, n.kind);
  }
  let e = qa();
  for (let t = Tt.length - 1; t >= 0; t--) {
    let n = Tt[t],
      s = e - n.t0;
    if (n.done || s > n.life) {
      Tt[t] = Tt[Tt.length - 1], Tt.pop();
      continue;
    }
    if (!(s < 0 || Number.isNaN(s))) {
      if (n.prev.copy(n.pos), n.pos.copy(n.origin).addScaledVector(n.dir, n.speed * s), !n.started) {
        n.started = !0, n.prev.copy(n.origin);
        let r = at(n.origin, 700);
        r > 0 && (n.kind === 2 ? L.turret(r) : L.enemyLaser(r)), F.muzzle(n.origin, n.kind);
      }
      if (w.alive && Or(n.prev, n.pos, w.pos, 4.3)) {
        ti(n.kind === 2 ? 8 : 6, n.origin), F.impact(w.pos, n.kind), n.done = !0;
        continue;
      }
      if (s > 0.12 && jn(n.pos)) {
        F.impact(n.prev, n.kind), n.done = !0;
        continue;
      }
      F.pushBolt(n.pos, n.dir, n.kind);
    }
  }
  F.endBolts();
}
function c0(o) {
  return G[o].name;
}
function u0() {
  let o = qa();
  for (let e = mn.length - 1; e >= 0; e--) {
    let n = mn[e].ev;
    if (!(o < n.time) && (mn.splice(e, 1), !(o - n.time > 3 && n.kind !== Xo))) switch (z.set(n.x, n.y, n.z), n.kind) {
      case ps:
        {
          if (F.explode(z, "flak", 7), L.flak(at(z, 700)), w.alive) {
            let s = z.distanceTo(w.pos);
            s < 24 && ti(14 * (1 - s / 24), z);
          }
          break;
        }
      case ms:
        {
          pn.set(n.ref, ee);
          let s = ye.get(n.ref);
          s && ($r(s.vis), ye.delete(n.ref)), F.explode(z, "ship", 10), L.explosion(0.3, at(z, 1400));
          break;
        }
      case hs:
        {
          F.explode(z, "big", 22), L.explosion(0.5, at(z, 1500));
          break;
        }
      case Xo:
        {
          let s = n.ref;
          if (G[s]?.kind === "reactor") {
            F.explode(z, "reactor", 260), L.explosion(1), He = 2;
            for (let r = 0; r < 26; r++) an.push({
              at: ee + 0.4 + r * 0.24 + Math.random() * 0.2,
              pos: new S.Vector3((Math.random() - 0.5) * 500, (Math.random() - 0.3) * 120, -600 + Math.random() * 1250),
              kind: "big",
              size: 50 + Math.random() * 60
            });
            $.banner("REACTOR CRITICAL", "Get clear of the dreadnought!", "#ff4d5e", 5);
          } else F.explode(z, "big", 75), L.explosion(0.9, Math.max(0.35, at(z, 3e3))), L.objective(), He = Math.max(He, 0.6), $.banner(`${c0(s)} destroyed`, "", "#ff9b4a", 3);
          break;
        }
      case fs:
        {
          F.explode(z, "spark", 8), F.muzzle(z, 0);
          break;
        }
      case Zo:
        {
          F.muzzle(z, 1);
          break;
        }
    }
  }
  for (let e = an.length - 1; e >= 0; e--) {
    let t = an[e];
    ee < t.at || (an.splice(e, 1), F.explode(t.pos, t.kind, t.size), Math.random() < 0.5 && L.explosion(0.8, 0.6), He = Math.max(He, 0.5));
  }
  if (yn % 120 === 0) {
    for (let [e, t] of wn) ee - t > 6 && wn.delete(e);
    for (let [e, t] of pn) ee - t > 6 && pn.delete(e);
  }
}
function Hs(o, e, t, n, s, r, i, a, l) {
  if (pn.has(o)) return;
  let c = ye.get(o);
  c || (c = {
    id: o,
    pos: new S.Vector3(),
    quat: new S.Quaternion(),
    fwd: new S.Vector3(),
    hp: l,
    vis: Dc(),
    seen: yn
  }, ye.set(o, c)), c.pos.set(e, t, n), c.quat.set(s, r, i, a), c.fwd.copy(Ls).applyQuaternion(c.quat), c.hp = l, c.seen = yn, c.vis.root.position.copy(c.pos), c.vis.root.quaternion.copy(c.quat);
}
var $e = new S.Quaternion(),
  Bs = new S.Quaternion();
function d0() {
  if (yn++, A) for (let o of A.enemies) Hs(o.id, o.pos.x, o.pos.y, o.pos.z, o.quat.x, o.quat.y, o.quat.z, o.quat.w, o.hp / 36);else {
    let o = Qt.bracket(Ke.time);
    if (o) {
      let [e, t, n] = o;
      if (e !== t) for (let s of e.enemies) {
        let r = t.byId.get(s.id);
        if (!r) {
          Hs(s.id, s.x, s.y, s.z, s.qx, s.qy, s.qz, s.qw, s.hp);
          continue;
        }
        $e.set(s.qx, s.qy, s.qz, s.qw), Bs.set(r.qx, r.qy, r.qz, r.qw), $e.slerp(Bs, n), Hs(s.id, s.x + (r.x - s.x) * n, s.y + (r.y - s.y) * n, s.z + (r.z - s.z) * n, $e.x, $e.y, $e.z, $e.w, r.hp);
      } else {
        let s = Math.min(0.1, Math.max(0, n));
        for (let r of e.enemies) $e.set(r.qx, r.qy, r.qz, r.qw), z.copy(Ls).applyQuaternion($e).multiplyScalar(62 * s), Hs(r.id, r.x + z.x, r.y + z.y, r.z + z.z, r.qx, r.qy, r.qz, r.qw, r.hp);
      }
    }
  }
  for (let [o, e] of ye) {
    if (e.seen !== yn) {
      $r(e.vis), ye.delete(o);
      continue;
    }
    for (let t of e.vis.glows) De(t, 0.8, !1);
  }
}
var Ms = new Map();
function Ua() {
  let o = [];
  if (B === "mission") {
    let t = Ms.get("local");
    t || (t = {
      id: "local",
      pos: new S.Vector3(),
      vel: new S.Vector3(),
      alive: !1
    }, Ms.set("local", t)), t.pos.copy(w.pos), t.vel.copy(w.vel), t.alive = w.alive, o.push(t);
  }
  let e = Qe();
  for (let t of Me.values()) {
    if (t.mission !== D || e - t.lastSeen > 3) continue;
    let n = Ms.get(t.id);
    n || (n = {
      id: t.id,
      pos: new S.Vector3(),
      vel: new S.Vector3(),
      alive: !1
    }, Ms.set(t.id, n)), n.pos.copy(t.pos), n.vel.copy(t.vel), n.alive = t.alive, o.push(n);
  }
  return Re.active && o.push(...Re.pilots()), o;
}
function p0(o) {
  let e = Qe();
  for (let t of Me.values()) {
    if (!(B === "mission" && t.mission === D && e - t.lastSeen < 3)) {
      t.vis && (t.vis.root.visible = !1), t.alive = !1;
      continue;
    }
    let s = t.pb.advance(o),
      r = t.buf.bracket(s);
    if (!r) continue;
    let [i, a, l] = r,
      c = t.alive;
    if (i !== a) {
      let m = Math.hypot(a.x - i.x, a.y - i.y, a.z - i.z),
        f = m > 300 ? 1 : l;
      t.pos.set(i.x + (a.x - i.x) * f, i.y + (a.y - i.y) * f, i.z + (a.z - i.z) * f), $e.set(i.qx, i.qy, i.qz, i.qw), Bs.set(a.qx, a.qy, a.qz, a.qw), t.quat.copy($e).slerp(Bs, f);
      let h = Math.max(0.001, a.time - i.time);
      m < 300 && t.vel.set((a.x - i.x) / h, (a.y - i.y) / h, (a.z - i.z) / h), t.alive = l > 0.5 ? a.alive : i.alive;
    } else {
      let m = Math.min(0.1, Math.max(0, l));
      t.pos.set(i.x, i.y, i.z).addScaledVector(t.vel, m), t.quat.set(i.qx, i.qy, i.qz, i.qw), t.alive = i.alive;
    }
    t.fwd.copy(Ls).applyQuaternion(t.quat), t.throttle = i.throttle, t.boost = i.boost, c && !t.alive && (F.explode(t.pos, "ship", 12), L.explosion(0.45, at(t.pos, 1500)));
    let u = i.fire;
    t.lastFire < 0 && (t.lastFire = u);
    let d = u - t.lastFire & 65535;
    if (d > 0 && d < 30 && t.alive) {
      for (let f = 0; f < Math.min(d, 3); f++) Qo(u - f - 1, t.vis?.rig?.foil ?? 1, ge).applyQuaternion(t.quat).add(t.pos), oi(ge, t.fwd, Yr + t.vel.length(), 0, !1);
      let m = at(t.pos, 500);
      m > 0.05 && L.laser(m * 0.5);
    }
    t.lastFire = u, t.lastMissiles < 0 && (t.lastMissiles = i.missiles);
    let p = i.missiles - t.lastMissiles & 65535;
    if (p > 0 && p < 10 && t.alive && ni(ge.copy(t.pos), t.fwd, t.vel.length(), i.mtKind, i.mtId, !1), t.lastMissiles = i.missiles, t.vis) {
      t.vis.root.visible = t.alive, t.vis.root.position.copy(t.pos), t.vis.root.quaternion.copy(t.quat);
      for (let m of t.vis.glows) De(m, t.throttle, t.boost);
      t.vis.rig && Eo(t.vis.rig, !t.boost, o);
    }
  }
}
function m0(o) {
  let e = null,
    t = null;
  if (w.alive) e = w.pos, t = w.quat, Gr = "";else if (Ht || B === "mission" && So < 0.5) {
    let i = Me.get(Gr);
    (!i || !i.alive) && (i = [...Me.values()].find(a => a.alive && a.mission === D), Gr = i?.id ?? ""), i && (e = i.pos, t = i.quat);
  }
  if (!Re.placeCamera(I, o)) if (e && t) jt.slerp(t, 1 - Math.exp(-o / 0.085)), gn.copy(e), z.copy(La).applyQuaternion(jt), I.position.copy(gn).add(z), I.quaternion.copy(jt);else if (B === "title") {
    let i = -0.75 + Math.sin(ee * 0.045) * 0.42,
      a = 1250 + Math.sin(ee * 0.07) * 110;
    I.position.set(Math.sin(i) * a, 300 + Math.sin(ee * 0.09) * 70, -Math.cos(i) * a), I.lookAt(0, 20, 60), I.rotateY(0.2 * Math.min(1.6, I.aspect / (16 / 9))), I.rotateX(0.07), I.rotateZ(Math.sin(ee * 0.06) * 0.03);
  } else if (B !== "mission" && B !== "results") {
    let i = ee * 0.035;
    I.position.set(Math.sin(i) * 1500 - 400, 420 + Math.sin(ee * 0.1) * 120, -Math.cos(i) * 1400), I.lookAt(0, 60, 150);
  } else I.position.lerp(za, 1 - Math.exp(-o / 0.35)), zs.copy(I.quaternion), ee - Ia < 2.2 ? I.lookAt(Ba) : I.lookAt(0, 50, 200), I.quaternion.copy(zs.slerp(I.quaternion, 1 - Math.exp(-o / 0.6)));
  if (He > 0) {
    let i = He * 0.6;
    I.position.x += (Math.random() - 0.5) * i, I.position.y += (Math.random() - 0.5) * i, I.position.z += (Math.random() - 0.5) * i, He = Math.max(0, He - o * 2.2);
  }
  let n = w.alive && w.boosting ? 9 : 0,
    s = w.alive ? (w.speed - Nt) / (is - Nt) * 3 : 0,
    r = _r + n + s;
  Math.abs(I.fov - r) > 0.01 && (I.fov += (r - I.fov) * Math.min(1, o * 4), I.updateProjectionMatrix()), I.updateMatrixWorld();
}
var h0 = () => R.phase === wo ? ["Reactor breach \u2014 dreadnought going down!", "Stand by for results"] : R.phase !== re ? ["Mission failed", ""] : R.stage === 0 ? [`Destroy the shield domes (${(R.compHp[0] > 0 ? 1 : 0) + (R.compHp[1] > 0 ? 1 : 0)} left)`, "Aft deck, flanking the bridge \xB7 the deflector protects every other system"] : R.stage === 1 ? [`Destroy the hangar bays and bridge tower (${[2, 3, 4].filter(e => R.compHp[e] > 0).length} left)`, "Deflector down \xB7 hangars hang under the hull and launch the fighter waves"] : ["Reactor exposed \u2014 destroy the core", "Under the hull, aft of the hangars"];
function f0() {
  let o = window.innerWidth,
    e = window.innerHeight,
    t = Yc;
  t.flying = w.alive && B === "mission";
  let n = 0,
    s = () => t.markers[n++],
    r = I.position;
  for (let c of G) {
    if (R.compHp[c.index] <= 0) continue;
    let u = s();
    u.kind = "system", vt(c.aim, I, o, e, u), u.dist = c.aim.distanceTo(r), u.label = c.short, u.hp = R.compMax[c.index] > 0 ? R.compHp[c.index] / R.compMax[c.index] : 1, u.vulnerable = R.stage >= c.stage, u.locked = !1;
  }
  for (let c of ye.values()) {
    if (n >= t.markers.length - 20) break;
    let u = c.pos.distanceTo(r);
    if (u > 1800) continue;
    let d = s();
    d.kind = "enemy", vt(c.pos, I, o, e, d), d.dist = u, d.hp = c.hp, d.locked = Ee === 1 && _e === c.id && xe >= Ro;
  }
  for (let c = 0; c < be; c++) {
    if (R.turrets[c] < 2 || n >= t.markers.length - 14) continue;
    let u = Ae(te[c], z),
      d = u.distanceTo(r);
    if (d > 650) continue;
    let p = s();
    p.kind = "turret", vt(u, I, o, e, p), p.dist = d;
  }
  for (let c of Me.values()) {
    if (!c.alive || c.mission !== D || n >= t.markers.length) continue;
    let u = s();
    u.kind = "ally", vt(c.pos, I, o, e, u), u.dist = c.pos.distanceTo(r), u.label = "Pilot", u.color = he[c.color];
  }
  if (t.markerCount = n, t.flying && (z.copy(w.pos).addScaledVector(w.fwd, 400), vt(z, I, o, e, Oe), t.crossX = Oe.x, t.crossY = Oe.y, t.stickX = ie.stickX, t.stickY = ie.stickY, t.leadOn = !1, Da && (vt(As, I, o, e, Oe), t.leadOn = Oe.onScreen, t.leadX = Oe.x, t.leadY = Oe.y), t.lockProgress = Ee ? Math.min(1, xe / Ro) : 0, t.lockOn = Ee !== 0 && xe >= Ro, Ee)) {
    let c = Ee === 2 ? te[_e] : void 0,
      u = Ee === 1 ? ye.get(_e)?.pos : Ee === 2 ? c && Ae(c, ge) : G[_e]?.aim;
    u ? (vt(u, I, o, e, Oe), t.lockX = Oe.x, t.lockY = Oe.y, Oe.onScreen || (t.lockProgress = 0)) : t.lockProgress = 0;
  }
  t.hull = w.hp / 100, t.boost = w.boost / 100, t.speed = w.alive ? w.speed : 0, t.throttle = w.throttle, t.missiles = xt, t.missileCharge = dn;
  let [i, a] = h0();
  t.objective = i, t.objectiveSub = a, t.jump = R.jump, t.tickets = R.tickets, t.wave = R.wave, t.score = Ha("local")?.score ?? 0;
  let l = [{
    name: "Pilot",
    alive: w.alive,
    color: he[kt],
    score: t.score,
    self: !0
  }];
  for (let c of Me.values()) c.mission !== D || Qe() - c.lastSeen > 3 || l.push({
    name: "Pilot",
    alive: c.alive,
    color: he[c.color],
    score: Ha(c.id)?.score ?? 0,
    self: !1
  });
  t.squad = l, t.hitMarker = Mt, t.damage = En, t.outOfBounds = w.alive && w.outOfBounds, t.deadText = w.alive || R.phase !== re ? "" : Ht ? "No reserve ships left \u2014 spectating the squad" : Fe ? "Requesting a reserve ship\u2026" : `Ship destroyed \xB7 reserve ship launching in ${Math.max(0, Math.ceil(So))}`, t.showHint = !ie.touched, t.needsLock = B === "mission" && !Q.pointerLocked && !P.active, t.padHint = P.connected, t.netNote = bn ? "Squad link lost \u2014 reconnecting" : "", $.frame(t);
}
var Oe = {
  x: 0,
  y: 0,
  onScreen: !1,
  behind: !1
};
function b0(o) {
  let e = Ua();
  for (let t = 0; t < be; t++) {
    if (R.turrets[t] < 2) continue;
    let n = Ae(te[t], ge),
      s = null,
      r = 1100;
    for (let i of e) {
      if (!i.alive) continue;
      let a = i.pos.distanceTo(n);
      a < r && (r = a, s = i.pos);
    }
    it.aimTurret(t, s, o);
  }
}
var Gs = document.createElement("div");
document.body.append(Gs);
var Wt = document.createElement("button");
Wt.textContent = "Abandon mission";
Wt.style.cssText = "position:fixed;left:50%;top:66%;transform:translateX(-50%);padding:8px 18px;font:600 12px system-ui,sans-serif;letter-spacing:.14em;text-transform:uppercase;color:#6cfaff;background:rgba(4,14,22,.75);border:1px solid rgba(108,250,255,.5);cursor:pointer;display:none;z-index:5";
Gs.append(Wt);
var Os = document.createElement("div");
Os.textContent = "A select  \xB7  B / Start resume";
Os.style.cssText = "position:fixed;left:50%;top:calc(66% + 44px);transform:translateX(-50%);font:600 11px system-ui,sans-serif;letter-spacing:.14em;color:#6cfaff;background:rgba(4,14,22,.8);padding:5px 12px;display:none;z-index:5;pointer-events:none;white-space:nowrap";
Gs.append(Os);
var Ut = !1;
function Tn(o) {
  Ut = o, ie.enabled = B === "mission" && !o, o || ie.reset();
}
Wt.onclick = () => {
  if (L.uiClick(), Tn(!1), A && null && [].length > 0) {
    A.abort();
    return;
  }
  w.alive = !1, X && (X.root.visible = !1), Vo(), D = 0, null ? void 0 : ut();
};
Mo.addEventListener("pointerdown", () => {
  B === "mission" && !Q.pointerLocked && Q.lockPointer(Mo);
});
var Re = new bs({
  ship: w,
  input: ie,
  selfId: () => "local",
  sim: () => A,
  begin: () => {
    Tn(!1), $.closeMenu(), Vo(), B = "mission", D = Zr(), $.setFlightVisible(!1), $.root.style.display = "none", ie.enabled = !1, ie.reset(), Q.unlockPointer(), A = new Dt(D, 1, 6, o => "Pilot"), lt = 1, kt = 0, X ? Jr() : X = fn(he[0]), Ht = !1, Fe = !1, xt = Is;
  },
  cut: () => {
    Oa(), He = 0, Vs = 0, Ee = 0, _e = -1, xe = 0;
  },
  settle: () => {
    qs(), R.stage = gt(R.compHp), Cs = R.stage, un = R.wave, it.sync(R.compHp, R.stage, R.turrets), it.settle(), jt.copy(w.quat), gn.copy(w.pos);
    let o = X?.rig;
    o && (o.foil = w.boosting ? 1 : 0, Eo(o, !w.boosting, 10));
  },
  finish: () => {
    Vo(), w.alive = !1, X && (X.root.visible = !1), D = 0, R.compHp = G.map(o => o.baseHp), R.compMax = G.map(o => o.baseHp), R.turrets.fill(0), R.stage = 0, it.sync(R.compHp, R.stage, R.turrets), it.settle(), $.clearBanner(), $.root.style.display = "", I.up.set(0, 1, 0), null ? void 0 : ut();
  },
  makeWing: o => fn(he[o % he.length]),
  dropWing: o => ke.remove(o.root),
  laser: (o, e, t) => {
    oi(o, e, t, 0, !0), F.muzzle(o, 0);
    let n = at(o, 500);
    n > 0.05 && L.laser(n * 0.5);
  },
  missile: (o, e, t, n, s) => {
    ni(o, e, t, n, s, !0), L.missileLaunch();
  }
});
function E0(o) {
  ee += o, P.poll();
  let e = !1;
  if (Re.active || (B === "mission" ? ((P.pressed(9) || P.pressed(8) || Ut && P.pressed(1)) && (L.uiClick(), Tn(!Ut)), Ut && (e = Sr(Gs))) : (Ut && Tn(!1), e = Sr($.menuElement), $.syncPadOptions(P.connected, P.invertY))), e || ie.pollPad(), Mt = Math.max(0, Mt - o), En = Math.max(0, En - o * 1.6), B === "mission") {
    if (Re.update(o), A && !bn) {
      rn += o;
      let n = 0,
        s = Ua();
      for (; rn >= zr && n < 4;) A.step(zr, s), rn -= zr, n++;
      n === 4 && (rn = 0), Re.afterSim(o);
      for (let r of A.fresh) Fa(r);
      if (A.fresh.length = 0, qs(), Ir -= o, Ir <= 0 && null && !Re.active) {
        Ir = Bc;
        let r = A.snapshot(),
          i = r;
        i.byId = new Map(), Rt = i, void 0;
      }
      if (Lr -= o, Lr <= 0 && (Lr = 1, $t = A.rows(), null && !Re.active && void 0), A.ended && !Re.active) {
        let r = A.rows(),
          i = {
            t: "end",
            mission: D,
            win: A.phase === wo,
            time: 600 - A.jump,
            rows: r,
            reason: A.endReason
          };
        void 0, _a(i.win, i.reason, i.time, r);
      }
    } else if (!A) {
      Ke.advance(o);
      let n = Qt.bracket(Ke.time);
      n && Zc(n[0]);
    }
    B === "mission" && (R.stage = gt(R.compHp), R.stage !== Cs && (R.stage === 1 && $.banner("DEFLECTOR DOWN", "Hangar bays and bridge tower are exposed", "#6cfaff", 4), R.stage === 2 && $.banner("REACTOR EXPOSED", "The core vent under the hull is open \u2014 hit it!", "#ff9b4a", 5), L.alarm(), Cs = R.stage), R.wave > un && ((un > 0 || R.wave === 1) && $.banner(`Enemy wave ${R.wave}`, "Fighters inbound", "#ff4d5e", 2.5), un = R.wave), r0(o), xo -= o, xo <= 0 && (xo = Ic, ka()), qr -= o, qr <= 0 && (qr = 0.1, t0()));
  } else null && (xo -= o, xo <= 0 && (xo = 0.5, ka(), B === "lobby" && void 0));
  if (d0(), p0(o), a0(o), l0(o), u0(), it.sync(R.compHp, R.stage, R.turrets), b0(o), it.update(o), X) {
    X.root.visible = w.alive && B === "mission", X.root.position.copy(w.pos), zs.setFromAxisAngle(z.set(0, 0, 1), -ie.stickX * 0.35), X.root.quaternion.copy(w.quat).multiply(zs);
    for (let n of X.glows) De(n, w.throttle, w.boosting);
    X.rig && Eo(X.rig, !w.boosting, o);
  }
  m0(o), Fc.update(I, o), F.update(o, I), B === "mission" && f0();
  let t = B === "mission" && !Re.active && (Ut || !Q.pointerLocked && !P.active);
  if (Wt.style.display = t ? "" : "none", Os.style.display = t && Ut ? "" : "none", t) {
    let n = A && null && [].length > 0 ? "End strike for the squad" : "Abandon mission";
    Wt.textContent !== n && (Wt.textContent = n);
  }
  B === "results" && cn > 0 && ee >= cn && (cn = 0, void 0);
}
var Wr = new S.Timer();
Wr.connect(document);
ct.setAnimationLoop(o => {
  Wr.update(o);
  let e = Math.min(Wr.getDelta(), 0.1);
  E0(e), ko.render();
});
await zc;
P.invertY = Q.info?.initialGameState?.gameState.invertStick === !0;
$.onInvertToggle = () => {
  L.uiClick(), P.invertY = !P.invertY, Q.saveState({
    invertStick: P.invertY
  });
};
null && (null(o => {
  o.ended || null === o || (void 0, !(B === "mission" && D && !null) && (B !== "mission" || (Vo(), w.alive = !1), void 0));
}), null(o => {
  Yt = o.code === "room_full" ? "That lobby is full." : o.code === "room_not_found" ? "That invite has expired." : "Could not join the lobby. Try again, or fly solo.", B === "title" ? ut() : B === "lobby" && (void 0, void 0);
}));
void 0;
window.addEventListener("remix:trailer-start", o => {
  o.preventDefault(), Re.start();
});
B === "title" && ut();