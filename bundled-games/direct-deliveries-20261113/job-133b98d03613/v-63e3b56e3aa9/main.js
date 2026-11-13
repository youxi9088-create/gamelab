import * as N from "./vendor/001-three-0.185.js";
import * as H from "./vendor/001-three-0.185.js";
import { RoundedBoxGeometry as Ot } from "./vendor/003-RoundedBoxGeometry.js";
import { mergeGeometries as or } from "./vendor/005-BufferGeometryUtils.js";
var Io = {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0
  },
  Ms = {
    id: "local",
    name: "Player",
    purchasedItems: []
  },
  Hs = {
    player: Ms,
    players: [Ms],
    viewContext: "full_screen",
    contentSafeAreaInset: Io,
    initialGameState: null
  },
  Ua = 5e3,
  Wa = ["pointerdown", "keydown", "touchend"],
  xo = null,
  Ro = null,
  Ho = !1,
  Vt = null,
  ko = new Set(),
  So = new Set();
function zo(n) {
  Ro = n;
  let e = n.contentSafeAreaInset ?? Io;
  for (let t of ["top", "right", "bottom", "left"]) document.documentElement.style.setProperty(`--remix-safe-${t}`, `${e[t]}px`);
}
var Cs = Number.NEGATIVE_INFINITY,
  bt = null,
  wo = null,
  Ao = !1,
  gt = !1,
  Ss = !1,
  Po = "",
  zs = !1,
  Co = new Set(),
  Lo = new Set(),
  An = () => document.pointerLockElement !== null,
  Cn = () => An() || gt,
  ja = () => navigator.userActivation?.isActive === !0;
function Go() {
  let n = Cn();
  if (n !== Ss) {
    Ss = n;
    for (let e of [...Co]) e(n);
  }
}
function Ls() {
  gt && (gt = !1, bt && (bt.style.cursor = Po), Go());
}
function Is(n) {
  return document.pointerLockElement === n ? Promise.resolve(!0) : new Promise(e => {
    let t = a => {
        document.removeEventListener("pointerlockchange", o), document.removeEventListener("pointerlockerror", s), e(a);
      },
      o = () => t(document.pointerLockElement === n),
      s = () => t(!1);
    document.addEventListener("pointerlockchange", o), document.addEventListener("pointerlockerror", s);
    try {
      n.requestPointerLock()?.catch?.(() => t(!1));
    } catch {
      t(!1);
    }
  });
}
async function Ka(n) {
  return bt = n, (await Is(n)) ? !0 : Ao ? (gt = !0, Po = n.style.cursor, n.style.cursor = "none", Go(), !0) : !1;
}
function zn() {
  zs || (zs = !0, document.addEventListener("pointerdown", () => {
    Cs = performance.now(), gt && bt && !An() && Is(bt);
  }, !0), document.addEventListener("pointermove", n => {
    if (!(!Cn() || n.movementX === 0 && n.movementY === 0)) for (let e of [...Lo]) e(n.movementX, n.movementY);
  }), document.addEventListener("pointerlockchange", () => {
    An() && gt && bt && (gt = !1, bt.style.cursor = Po), Go();
  }), document.addEventListener("keydown", n => {
    n.key === "Escape" && Ls();
  }));
}
var ke = {
  ready() {
    if (!xo) {
      zn();
      xo = Promise.resolve((zo(Hs), Hs));
    }
    return xo;
  },
  get info() {
    return Ro;
  },
  get safeArea() {
    return Ro?.contentSafeAreaInset ?? Io;
  },
  get muted() {
    return Ho;
  },
  onMute(n) {
    return So.add(n), () => So.delete(n);
  },
  audio() {
    if (Vt) return Vt;
    let n = new AudioContext(),
      e = n.createGain();
    e.gain.value = Ho ? 0 : 1, e.connect(n.destination), Vt = {
      context: n,
      output: e
    };
    let t = () => {
      n.state === "suspended" && !document.hidden && n.resume();
    };
    for (let o of Wa) window.addEventListener(o, t, !0);
    return document.addEventListener("visibilitychange", () => {
      document.hidden ? n.suspend() : t();
    }), Vt;
  },
  async lockPointer(n) {
    return zn(), Cn() ? !0 : (Ao ||= performance.now() - Cs <= Ua || ja(), wo ??= Ka(n).finally(() => {
      wo = null, Ao = !1;
    }), wo);
  },
  unlockPointer() {
    An() ? document.exitPointerLock() : Ls();
  },
  get pointerLocked() {
    return Cn();
  },
  onPointerLock(n) {
    return zn(), Co.add(n), () => Co.delete(n);
  },
  onLook(n) {
    return zn(), Lo.add(n), () => Lo.delete(n);
  }
};
function on(n) {
  return Object.freeze({
    ...n
  });
}
import * as V from "./vendor/001-three-0.185.js";
import { mergeGeometries as Ya, mergeVertices as Xa } from "./vendor/005-BufferGeometryUtils.js";
var Ln = {
  uLightDirView: {
    value: new V.Vector3(0, 1, 0)
  },
  uDotSize: {
    value: 5
  }
};
function Ns(n, e, t) {
  Ln.uLightDirView.value.copy(e).transformDirection(n.matrixWorldInverse), Ln.uDotSize.value = 4.2 * t;
}
var nt = null;
function Za() {
  if (nt) return nt;
  let n = new Uint8Array([70, 70, 70, 255, 150, 150, 150, 255, 255, 255, 255, 255]);
  return nt = new V.DataTexture(n, 3, 1, V.RGBAFormat), nt.minFilter = V.NearestFilter, nt.magFilter = V.NearestFilter, nt.generateMipmaps = !1, nt.needsUpdate = !0, nt.userData.shared = !0, nt;
}
var Qa = `
{
  float ndl = dot(normalize(normal), uLightDirView);
  vec2 hp = mat2(0.7071, -0.7071, 0.7071, 0.7071) * gl_FragCoord.xy / uDotSize;
  vec2 hc = fract(hp) - 0.5;
  float hr = clamp((0.2 - ndl) * 0.7, 0.0, 0.62);
  float hd = hr > 0.0 ? 1.0 - smoothstep(hr - 0.05, hr, length(hc)) : 0.0;
  outgoingLight *= 1.0 - hd * 0.42;
}
`,
  Ja = `
{
  // Towers darken and lose their windows with distance, so the skyway stays the focus.
  float far = smoothstep(140.0, 700.0, distance(vWorldPos, cameraPosition));
  diffuseColor.rgb *= 1.0 - 0.55 * far;
  vec3 an = abs(vWorldNormal);
  if (an.y < 0.5 && vWorldPos.y > 4.0 && far < 0.95) {
    float u = an.x > an.z ? vWorldPos.z : vWorldPos.x;
    vec2 cell = vec2(u / 3.6, vWorldPos.y / 4.6);
    vec2 id = floor(cell);
    vec2 f = fract(cell);
    float win = step(0.25, f.x) * step(f.x, 0.75) * step(0.3, f.y) * step(f.y, 0.7);
    float seed = dot(id + floor(vWorldPos.xz * 0.02) * 7.0 + sign(vWorldNormal.xz) * 3.0, vec2(12.9898, 78.233));
    float h = fract(sin(seed) * 43758.5453);
    float lit = step(0.8, h);
    vec3 wc = mix(vec3(1.0, 0.72, 0.9), vec3(0.62, 0.9, 1.0), step(0.9, h));
    wc = mix(wc, vec3(1.0, 0.86, 0.6), step(0.96, h));
    totalEmissiveRadiance += wc * win * lit * 0.55 * (1.0 - far);
  }
}
`;
function P(n, e = {}) {
  let t = new V.MeshToonMaterial({
      color: n,
      gradientMap: Za(),
      emissive: e.emissive ?? 0,
      emissiveIntensity: e.emissiveIntensity ?? 1,
      map: e.map ?? null,
      emissiveMap: e.emissiveMap ?? null,
      side: e.side ?? V.FrontSide,
      transparent: e.transparent ?? !1,
      opacity: e.opacity ?? 1,
      vertexColors: e.vertexColors ?? !1
    }),
    o = e.windows ?? !1,
    s = e.halftone ?? !0;
  return !s && !o || (t.onBeforeCompile = a => {
    a.uniforms.uLightDirView = Ln.uLightDirView, a.uniforms.uDotSize = Ln.uDotSize;
    let r = a.fragmentShader.replace("#include <common>", `#include <common>
uniform vec3 uLightDirView;
uniform float uDotSize;
` + (o ? `varying vec3 vWorldPos;
varying vec3 vWorldNormal;
` : ""));
    s && (r = r.replace("#include <opaque_fragment>", Qa + "#include <opaque_fragment>")), o && (r = r.replace("#include <emissivemap_fragment>", `#include <emissivemap_fragment>
` + Ja), a.vertexShader = a.vertexShader.replace("#include <common>", `#include <common>
varying vec3 vWorldPos;
varying vec3 vWorldNormal;`).replace("#include <worldpos_vertex>", `#include <worldpos_vertex>
          {
            vec4 wp = vec4(transformed, 1.0);
            vec3 wn = objectNormal;
            #ifdef USE_INSTANCING
              wp = instanceMatrix * wp;
              wn = mat3(instanceMatrix) * wn;
            #endif
            wp = modelMatrix * wp;
            vWorldPos = wp.xyz;
            vWorldNormal = normalize(mat3(modelMatrix) * wn);
          }`)), a.fragmentShader = r;
  }, t.customProgramCacheKey = () => `toon-${s ? "h" : ""}${o ? "w" : ""}`), t;
}
var Ps = new Map();
function te(n, e = 2.5, t = 1) {
  let o = new V.Color(n),
    s = `${o.getHexString()}-${e}-${t}`,
    a = Ps.get(s);
  return a || (a = new V.MeshBasicMaterial({
    color: o.multiplyScalar(e),
    transparent: t < 1,
    opacity: t,
    depthWrite: t >= 1,
    blending: t < 1 ? V.AdditiveBlending : V.NormalBlending
  }), a.userData.shared = !0, Ps.set(s, a)), a;
}
var er = `
#include <common>
#include <fog_pars_vertex>
uniform float uThickness;
void main() {
  vec4 mvPosition = vec4(position, 1.0);
  vec3 n = normal;
  #ifdef USE_INSTANCING
    // Inflate after the instance transform, along the true (inverse-transpose)
    // normal, so a stretched instance keeps an even ink line.
    vec3 sc = vec3(length(instanceMatrix[0].xyz), length(instanceMatrix[1].xyz), length(instanceMatrix[2].xyz));
    mvPosition = instanceMatrix * mvPosition;
    n = normalize(mat3(instanceMatrix) * (normal / (sc * sc)));
  #endif
  mvPosition.xyz += n * uThickness;
  mvPosition = modelViewMatrix * mvPosition;
  gl_Position = projectionMatrix * mvPosition;
  #include <fog_vertex>
}
`,
  tr = `
#include <common>
#include <fog_pars_fragment>
uniform vec3 uColor;
void main() {
  gl_FragColor = vec4(uColor, 1.0);
  #include <fog_fragment>
}
`,
  Le = 722710,
  Gs = new Map();
function Bs(n, e = Le, t = !0) {
  let o = `${n}-${e}-${t}`,
    s = Gs.get(o);
  return s || (s = new V.ShaderMaterial({
    uniforms: V.UniformsUtils.merge([V.UniformsLib.fog, {
      uThickness: {
        value: n
      },
      uColor: {
        value: new V.Color(e)
      }
    }]),
    vertexShader: er,
    fragmentShader: tr,
    side: V.BackSide,
    fog: t
  }), s.userData.shared = !0, Gs.set(o, s)), s;
}
var Vs = new WeakMap();
function Os(n) {
  let e = Vs.get(n);
  if (e) return e;
  let t = new V.BufferGeometry();
  t.setAttribute("position", n.getAttribute("position").clone()), n.index && t.setIndex(n.index.clone());
  let o = Xa(t, 0.001);
  return t.dispose(), o.computeVertexNormals(), n.userData.shared && (o.userData.shared = !0), Vs.set(n, o), o;
}
function X(n, e = 0.06, t = Le, o = !0) {
  if (n instanceof V.InstancedMesh) {
    let a = new V.InstancedMesh(Os(n.geometry), Bs(e, t, o), n.count);
    return a.instanceMatrix = n.instanceMatrix, a.frustumCulled = !1, a.userData.outline = !0, n.add(a), n;
  }
  let s = new V.Mesh(Os(n.geometry), Bs(e, t, o));
  return s.userData.outline = !0, s.castShadow = !1, n.add(s), n;
}
function me(n, e, t, o = {}) {
  let s = document.createElement("canvas");
  s.width = n, s.height = e;
  let a = s.getContext("2d");
  t(a, n, e);
  let r = new V.CanvasTexture(s);
  return (o.srgb ?? !0) && (r.colorSpace = V.SRGBColorSpace), o.repeat && (r.wrapS = V.RepeatWrapping, r.wrapT = V.RepeatWrapping), r.anisotropy = o.anisotropy ?? 4, r;
}
var nr = new V.Matrix4();
function In(n, e = new Set()) {
  n.updateMatrixWorld(!0);
  let t = new V.Matrix4().copy(n.matrixWorld).invert(),
    o = new Map(),
    s = l => {
      if (e.has(l)) return;
      let i = l;
      if (i.isMesh && !i.isInstancedMesh && !Array.isArray(i.material) && i.visible && !i.userData.noMerge) {
        let c = i.geometry,
          p = Object.keys(c.attributes).sort().join(","),
          f = `${i.material.uuid}|${p}|${i.renderOrder}|${JSON.stringify(i.userData)}`,
          h = o.get(f);
        h ? h.push(i) : o.set(f, [i]);
      }
      for (let c of l.children) s(c);
    };
  s(n);
  let a = new Set();
  for (let l of o.values()) if (l.length > 1) for (let i of l) a.add(i);
  let r = 0;
  for (let l of o.values()) {
    if (l.length < 2) continue;
    let i = l.map(h => {
        let b = h.geometry.index ? h.geometry.toNonIndexed() : h.geometry.clone();
        return b.morphAttributes = {}, b.applyMatrix4(nr.multiplyMatrices(t, h.matrixWorld)), b;
      }),
      c = Ya(i, !1);
    for (let h of i) h.dispose();
    if (!c) continue;
    let p = l[0],
      f = new V.Mesh(c, p.material);
    f.userData = {
      ...p.userData
    }, f.renderOrder = p.renderOrder, n.add(f);
    for (let h of l) {
      for (let b of [...h.children]) a.has(b) || n.attach(b);
      h.removeFromParent();
    }
    r += l.length - 1;
  }
  return r;
}
var Z = [{
    id: "zenith",
    name: "ZENITH-X",
    tagline: "The flagship pod. Balanced in every way.",
    top: 113,
    accel: 52,
    turn: 1.95,
    mass: 1,
    bars: [3, 3, 3, 3],
    livery: 0
  }, {
    id: "viper",
    name: "SPARK VIPER",
    tagline: "Brutal top speed. Steady hands only.",
    top: 120,
    accel: 46,
    turn: 1.8,
    mass: 0.9,
    bars: [5, 2, 2, 2],
    livery: 1
  }, {
    id: "wisp",
    name: "HALO WISP",
    tagline: "Quick as lightning, light as glass.",
    top: 108,
    accel: 58,
    turn: 2.2,
    mass: 0.8,
    bars: [2, 5, 5, 1],
    livery: 2
  }, {
    id: "hammer",
    name: "NOVA HAMMER",
    tagline: "A tank with turbines. Wins every shove.",
    top: 111,
    accel: 47,
    turn: 1.85,
    mass: 1.5,
    bars: [3, 2, 2, 5],
    livery: 3
  }],
  Ee = [{
    main: "#ffd21f",
    accent: "#ff2e88",
    dark: "#2a1640",
    glow: "#38f6ff",
    number: "07"
  }, {
    main: "#ff3d6e",
    accent: "#fff04d",
    dark: "#1d1030",
    glow: "#ff9d2e",
    number: "13"
  }, {
    main: "#35e4ff",
    accent: "#ff4fd8",
    dark: "#161a3d",
    glow: "#b6ff3b",
    number: "21"
  }, {
    main: "#9dff2e",
    accent: "#3a2d8c",
    dark: "#141628",
    glow: "#ff3df2",
    number: "44"
  }, {
    main: "#ff8a1f",
    accent: "#1b1b3a",
    dark: "#26122a",
    glow: "#36e2ff",
    number: "09"
  }, {
    main: "#a46bff",
    accent: "#3dffc5",
    dark: "#1a0f33",
    glow: "#3dffc5",
    number: "66"
  }, {
    main: "#f4f1ff",
    accent: "#ff2e4d",
    dark: "#221633",
    glow: "#ff2e4d",
    number: "01"
  }, {
    main: "#2e6bff",
    accent: "#ffb321",
    dark: "#0f1433",
    glow: "#ffe35a",
    number: "88"
  }],
  Us = 0.065;
function Ds(n, e) {
  return me(512, 128, (t, o, s) => {
    e && (t.translate(o, 0), t.scale(-1, 1)), t.fillStyle = n.main, t.fillRect(0, 0, o, s), t.fillStyle = n.accent;
    for (let a = 0; a < 3; a++) {
      let r = 250 + a * 46;
      t.beginPath(), t.moveTo(r, 0), t.lineTo(r + 26, 0), t.lineTo(r - 30, s), t.lineTo(r - 56, s), t.closePath(), t.fill();
    }
    t.fillRect(0, s * 0.72, 230, s * 0.14), t.strokeStyle = n.dark, t.lineWidth = 9;
    for (let a = 0; a < 3; a++) {
      let r = 40 + a * 26;
      t.beginPath(), t.moveTo(r + 16, 22), t.lineTo(r, s / 2), t.lineTo(r + 16, s - 22), t.stroke();
    }
    t.fillStyle = "#ffffff", t.strokeStyle = "#0b0716", t.lineWidth = 6, t.beginPath(), t.arc(170, s / 2 - 6, 36, 0, Math.PI * 2), t.fill(), t.stroke(), t.save(), t.setTransform(1, 0, 0, 1, 0, 0), t.fillStyle = "#0b0716", t.font = 'italic 900 40px "Arial Black", Impact, sans-serif', t.textAlign = "center", t.textBaseline = "middle", t.fillText(n.number, e ? o - 170 : 170, s / 2 - 4), t.restore(), t.strokeStyle = "rgba(11,7,22,0.55)", t.lineWidth = 3;
    for (let a of [120, 420]) t.beginPath(), t.moveTo(a, 0), t.lineTo(a, s), t.stroke();
    for (let a = 0; a < 6; a++) t.fillStyle = a % 2 ? n.dark : "#ffffff", t.fillRect(452 + a * 10, 0, 10, s);
    t.fillStyle = "rgba(11,7,22,0.18)";
    for (let a = s * 0.55; a < s; a += 9) for (let r = a / 9 % 2 ? 4 : 0; r < o; r += 9) t.beginPath(), t.arc(r, a, 1.1 + (a - s * 0.55) / s * 5, 0, Math.PI * 2), t.fill();
    t.lineWidth = 8, t.strokeStyle = "#0b0716", t.strokeRect(0, 0, o, s);
  });
}
var Pn = null;
function sr() {
  Pn || (Pn = me(128, 128, (e, t, o) => {
    let s = e.createRadialGradient(t / 2, o / 2, 4, t / 2, o / 2, t / 2);
    s.addColorStop(0, "rgba(5,2,15,0.85)"), s.addColorStop(0.6, "rgba(5,2,15,0.5)"), s.addColorStop(1, "rgba(5,2,15,0)"), e.fillStyle = s, e.fillRect(0, 0, t, o);
  }), Pn.userData.shared = !0);
  let n = new H.MeshBasicMaterial({
    map: Pn,
    transparent: !0,
    depthWrite: !1
  });
  return n.userData.shared = !0, n;
}
var Fs = null;
function K(n, e, t, o, s, a, r = 0, l = 0, i = 0, c = Us) {
  let p = new H.Mesh(e, t);
  return p.position.set(o, s, a), p.rotation.set(r, l, i), p.userData.merge = c > 0, n.body.add(p), p;
}
function ar(n) {
  let e = new Map();
  for (let t of [...n.children]) {
    if (!(t instanceof H.Mesh) || !t.userData.merge) continue;
    t.updateMatrix();
    let o = t.geometry,
      s = o.index ? o.toNonIndexed() : o.clone();
    for (let l of Object.keys(s.attributes)) ["position", "normal", "uv"].includes(l) || s.deleteAttribute(l);
    s.applyMatrix4(t.matrix);
    let a = t.material,
      r = e.get(a);
    r ? r.push(s) : e.set(a, [s]), n.remove(t), o.dispose();
  }
  for (let [t, o] of e) {
    let s = or(o, !1);
    for (let r of o) r.dispose();
    if (!s) continue;
    let a = X(new H.Mesh(s, t), Us);
    a.userData.part = !0, n.add(a);
  }
}
function Nt(n, e, t, o, s) {
  K(n, new H.CylinderGeometry(s * 0.9, s * 1.1, 0.7, 16), n.dark, e, t, o, Math.PI / 2);
  let a = new H.Mesh(new H.CircleGeometry(s * 0.78, 18), n.glowMat);
  a.position.set(e, t, o + 0.36), n.body.add(a);
  let r = new H.ConeGeometry(s * 0.72, 1, 14, 1, !0);
  r.rotateX(Math.PI / 2), r.translate(0, 0, 0.5);
  let l = new H.Mesh(r, n.flameMat);
  l.position.set(e, t, o + 0.38), n.body.add(l), n.flames.push(l), n.exhausts.push(new H.Vector3(e, t, o + 0.6));
}
function rr(n) {
  for (let e of [-1, 1]) {
    let t = e * 1.35;
    K(n, new Ot(0.95, 0.85, 5, 2, 0.22), e < 0 ? n.decalL : n.decalR, t, 0, 0.2), K(n, new H.ConeGeometry(0.46, 1.3, 14), n.accent, t, 0, -2.85, -Math.PI / 2), K(n, new H.BoxGeometry(0.28, 0.2, 3.2), n.accent, t, 0.48, 0.1), K(n, new H.BoxGeometry(0.12, 0.85, 1.2), n.accent, t, 0.75, 2, -0.4), Nt(n, t, 0, 2.95, 0.42);
  }
  K(n, new H.SphereGeometry(0.62, 20, 14), n.main, 0, 0.02, -0.4).scale.set(1, 0.8, 2.3), K(n, new H.SphereGeometry(0.46, 18, 12), n.glass, 0, 0.36, -0.9).scale.set(0.82, 0.6, 1.3), K(n, new H.BoxGeometry(2.3, 0.14, 1.5), n.dark, 0, -0.08, 0.9), K(n, new H.BoxGeometry(2.1, 0.12, 0.35), n.accent, 0, 0.05, -1.9), Nt(n, 0, 0.05, 1.55, 0.3);
}
function ir(n) {
  for (let e of [-1, 1]) {
    let t = e * 1.6;
    K(n, new Ot(0.72, 0.68, 6.2, 2, 0.2), e < 0 ? n.decalL : n.decalR, t, 0, 0.1), K(n, new H.ConeGeometry(0.36, 2, 12), n.accent, t, 0, -4.2, -Math.PI / 2), K(n, new H.BoxGeometry(1.35, 0.1, 0.9), n.dark, e * 0.85, 0.05, 1.3, 0, e * 0.45), K(n, new H.BoxGeometry(0.9, 0.1, 0.5), n.accent, t + e * 0.6, 0.1, 2.3, 0, 0, e * 0.25), Nt(n, t, 0, 3.55, 0.34);
  }
  K(n, new H.SphereGeometry(0.55, 18, 12), n.main, 0, 0.1, 1).scale.set(0.9, 0.75, 2.1), K(n, new H.SphereGeometry(0.4, 16, 10), n.glass, 0, 0.42, 0.6).scale.set(0.8, 0.6, 1.2), K(n, new H.BoxGeometry(0.1, 0.9, 1), n.accent, 0.3, 0.8, 1.8, -0.5, 0, 0.2), K(n, new H.BoxGeometry(0.1, 0.9, 1), n.accent, -0.3, 0.8, 1.8, -0.5, 0, -0.2), K(n, new H.CylinderGeometry(0.06, 0.06, 3.1, 8), n.dark, 0, 0.1, -1.2, 0, 0, Math.PI / 2), K(n, new H.CylinderGeometry(0.06, 0.06, 3.1, 8), n.dark, 0, 0.1, -2.6, 0, 0, Math.PI / 2);
}
function lr(n) {
  for (let t of [-1, 1]) {
    let o = t * 1.25;
    K(n, new H.CapsuleGeometry(0.46, 3.1, 6, 16), t < 0 ? n.decalL : n.decalR, o, 0, 0.3, Math.PI / 2), K(n, new H.SphereGeometry(0.3, 12, 10), n.accent, o, 0, -1.95), K(n, new H.BoxGeometry(0.1, 0.7, 0.9), n.accent, o + t * 0.2, 0.55, 1.4, -0.3, 0, t * 0.35), Nt(n, o, 0, 2.2, 0.38);
  }
  K(n, new H.TorusGeometry(1.25, 0.13, 10, 40), n.accent, 0, 0.18, -0.3, Math.PI / 2), K(n, new H.SphereGeometry(0.66, 20, 14), n.main, 0, 0.1, -0.35).scale.set(1, 0.85, 1.7), K(n, new H.SphereGeometry(0.46, 18, 12), n.glass, 0, 0.45, -0.65).scale.set(0.85, 0.65, 1.15), K(n, new H.BoxGeometry(2.4, 0.1, 0.7), n.dark, 0, 0, 0.8);
  let e = new H.Mesh(new H.TorusGeometry(1.25, 0.05, 6, 40), n.glowMat);
  e.rotation.x = Math.PI / 2, e.position.set(0, 0.32, -0.3), n.body.add(e);
}
function cr(n) {
  for (let e of [-1, 1]) {
    let t = e * 1.5;
    K(n, new Ot(1.25, 1.05, 5, 2, 0.18), e < 0 ? n.decalL : n.decalR, t, 0, 0.3), K(n, new Ot(1.35, 0.3, 2.2, 2, 0.1), n.dark, t, 0.62, 0.2), K(n, new H.BoxGeometry(1.1, 0.8, 0.7), n.accent, t, 0, -2.45, 0.35), Nt(n, t, 0.24, 2.95, 0.34), Nt(n, t, -0.26, 2.95, 0.34);
  }
  K(n, new H.BoxGeometry(4.3, 0.36, 0.42), n.accent, 0, -0.12, -2.95), K(n, new Ot(1.2, 0.85, 2.6, 2, 0.2), n.main, 0, 0.1, -0.3), K(n, new Ot(0.9, 0.45, 1.2, 2, 0.15), n.glass, 0, 0.6, -0.7), K(n, new H.BoxGeometry(1.9, 0.2, 1.6), n.dark, 0, -0.1, 1.1), K(n, new H.CylinderGeometry(0.05, 0.05, 1.1, 6), n.dark, 0.35, 1.05, 0.6, 0.3);
}
var pr = {
  zenith: rr,
  viper: ir,
  wisp: lr,
  hammer: cr
};
function sn(n, e) {
  let t = new H.Group(),
    o = new H.Group();
  t.add(o);
  let s = new H.Color(e.glow),
    a = {
      body: o,
      main: P(e.main),
      accent: P(e.accent),
      dark: P(e.dark),
      decalL: P(16777215, {
        map: Ds(e, !1)
      }),
      decalR: P(16777215, {
        map: Ds(e, !0)
      }),
      glass: P("#9ff4ff", {
        emissive: "#1f7fa8",
        emissiveIntensity: 0.9
      }),
      glowMat: te(e.glow, 2),
      flameMat: te(e.glow, 1.3, 0.7),
      flames: [],
      exhausts: []
    };
  pr[n](a), ar(o);
  let r = dr[n],
    l = [];
  for (let f of [-1, 1]) {
    let h = new H.Mesh(new H.BoxGeometry(0.08, 0.14, r.len), a.glowMat);
    h.position.set(f * r.x, r.y, r.z), o.add(h), l.push(h);
  }
  let i = [new H.Vector3(-r.tipX, r.y + 0.2, r.tipZ), new H.Vector3(r.tipX, r.y + 0.2, r.tipZ)];
  In(o, new Set(a.flames)), Fs ??= sr();
  let c = new H.Mesh(new H.PlaneGeometry(4.6, 7.4), Fs);
  c.rotation.x = -Math.PI / 2, c.position.y = -1, t.add(c), $s ??= fr();
  let p = new H.Mesh(new H.PlaneGeometry(6, 9), new H.MeshBasicMaterial({
    map: $s,
    color: s.clone().multiplyScalar(1.4),
    transparent: !0,
    blending: H.AdditiveBlending,
    depthWrite: !1
  }));
  return p.rotation.x = -Math.PI / 2, p.position.y = -0.95, t.add(p), {
    root: t,
    body: o,
    flames: a.flames,
    exhausts: a.exhausts,
    tips: i,
    blob: c,
    underglow: p,
    glowColor: s
  };
}
var dr = {
    zenith: {
      x: 1.84,
      y: -0.05,
      z: 0.2,
      len: 4.2,
      tipX: 1.85,
      tipZ: -2.6
    },
    viper: {
      x: 1.97,
      y: -0.05,
      z: 0.1,
      len: 5,
      tipX: 2,
      tipZ: -3.8
    },
    wisp: {
      x: 1.73,
      y: 0,
      z: 0.3,
      len: 2.6,
      tipX: 1.75,
      tipZ: -1.6
    },
    hammer: {
      x: 2.14,
      y: 0,
      z: 0.3,
      len: 4.2,
      tipX: 2.2,
      tipZ: -2.4
    }
  },
  $s = null;
function fr() {
  let n = me(128, 128, (e, t, o) => {
    let s = e.createRadialGradient(t / 2, o / 2, 2, t / 2, o / 2, t / 2);
    s.addColorStop(0, "rgba(255,255,255,0.9)"), s.addColorStop(0.45, "rgba(255,255,255,0.35)"), s.addColorStop(1, "rgba(255,255,255,0)"), e.fillStyle = s, e.fillRect(0, 0, t, o);
  });
  return n.userData.shared = !0, n;
}
function Gn(n, e) {
  let t = sn(n, Ee[e]);
  t.blob.visible = !1, t.underglow.visible = !1;
  for (let o of t.flames) o.scale.set(1, 1, 1.6);
  return t.root;
}
var Fi = on({
    id: "ship-zenith-x",
    name: "ZENITH-X",
    role: "Player/rival pod \u2014 balanced twin-nacelle racer",
    create: () => Gn("zenith", 0)
  }),
  $i = on({
    id: "ship-spark-viper",
    name: "SPARK VIPER",
    role: "Player/rival pod \u2014 top-speed long nacelles",
    create: () => Gn("viper", 1)
  }),
  Ui = on({
    id: "ship-halo-wisp",
    name: "HALO WISP",
    role: "Player/rival pod \u2014 agile halo-ring racer",
    create: () => Gn("wisp", 2)
  }),
  Wi = on({
    id: "ship-nova-hammer",
    name: "NOVA HAMMER",
    role: "Player/rival pod \u2014 heavy armoured quad-engine",
    create: () => Gn("hammer", 3)
  });
var Bn = null,
  ot = null;
function we() {
  if (Bn) return Bn;
  let {
      context: n,
      output: e
    } = ke.audio(),
    t = n.createGain();
  t.gain.value = 0.32;
  let o = n.createGain();
  o.gain.value = 0;
  let s = n.createGain();
  s.gain.value = 0;
  let a = n.createDynamicsCompressor();
  a.threshold.value = -14, a.ratio.value = 4;
  let r = n.createBiquadFilter();
  r.type = "lowpass", r.frequency.value = 5200, t.connect(r).connect(a), o.connect(a), s.connect(a), a.connect(e), Bn = {
    ctx: n,
    sfx: t,
    music: o,
    engine: s
  }, ot = n.createBuffer(1, n.sampleRate, n.sampleRate);
  let l = ot.getChannelData(0);
  for (let i = 0; i < l.length; i++) l[i] = Math.random() * 2 - 1;
  return Bn;
}
function pn() {
  we();
}
function ur(n) {
  let e = we(),
    t = e.ctx.createGain();
  return t.gain.value = n, t.connect(e.sfx), {
    ctx: e.ctx,
    out: t
  };
}
function pe(n, e, t, o, s, a = 1, r = 0) {
  let l = n.ctx.currentTime + r,
    i = n.ctx.createOscillator(),
    c = n.ctx.createGain();
  i.type = e, i.frequency.setValueAtTime(t, l), i.frequency.exponentialRampToValueAtTime(Math.max(1, o), l + s), c.gain.setValueAtTime(1e-4, l), c.gain.exponentialRampToValueAtTime(a, l + 0.008), c.gain.exponentialRampToValueAtTime(1e-4, l + s), i.connect(c).connect(n.out), i.start(l), i.stop(l + s + 0.05);
}
function pt(n, e, t, o, s, a = 1, r = 0, l = 1) {
  if (!ot) return;
  let i = n.ctx.currentTime + r,
    c = n.ctx.createBufferSource();
  c.buffer = ot, c.loop = !0;
  let p = n.ctx.createBiquadFilter();
  p.type = e, p.Q.value = l, p.frequency.setValueAtTime(t, i), p.frequency.exponentialRampToValueAtTime(Math.max(20, o), i + s);
  let f = n.ctx.createGain();
  f.gain.setValueAtTime(1e-4, i), f.gain.exponentialRampToValueAtTime(a, i + 0.01), f.gain.exponentialRampToValueAtTime(1e-4, i + s), c.connect(p).connect(f).connect(n.out), c.start(i, Math.random() * 0.5), c.stop(i + s + 0.05);
}
function Fe(n, e = 1) {
  if (e < 0.02) return;
  let t = ur(e),
    o = 0.96 + Math.random() * 0.08;
  switch (n) {
    case "click":
      pe(t, "sine", 880, 990, 0.07, 0.18);
      break;
    case "back":
      pe(t, "sine", 660, 440, 0.1, 0.18);
      break;
    case "select":
      pe(t, "triangle", 523, 523, 0.12, 0.22), pe(t, "triangle", 784, 784, 0.18, 0.2, 0.07);
      break;
    case "count":
      pe(t, "sine", 587, 587, 0.2, 0.3);
      break;
    case "go":
      pe(t, "sine", 1175, 1175, 0.45, 0.28), pe(t, "triangle", 587, 587, 0.45, 0.14);
      break;
    case "boost":
      pe(t, "triangle", 220 * o, 660 * o, 0.35, 0.16), pt(t, "bandpass", 500, 2800, 0.45, 0.28, 0, 1.2);
      break;
    case "miniturbo":
      pe(t, "sine", 660, 1320, 0.16, 0.2), pe(t, "sine", 990, 1760, 0.16, 0.12, 0.05), pt(t, "bandpass", 900, 3500, 0.3, 0.2, 0, 1.5);
      break;
    case "turbo":
      pt(t, "lowpass", 400, 3200, 0.8, 0.4), pe(t, "triangle", 90, 240, 0.8, 0.14);
      break;
    case "glitch":
      for (let s = 0; s < 7; s++) {
        let a = 300 + Math.random() * 1400;
        pe(t, s % 2 ? "square" : "triangle", a, a * (0.7 + Math.random() * 0.6), 0.05, 0.07, s * 0.045);
      }
      pt(t, "highpass", 3e3, 1200, 0.3, 0.12);
      break;
    case "bump":
      pe(t, "sine", 140 * o, 60, 0.18, 0.4), pt(t, "lowpass", 900, 200, 0.14, 0.2);
      break;
    case "wall":
      pt(t, "bandpass", 1200 * o, 500, 0.22, 0.3, 0, 0.8), pe(t, "sine", 110, 50, 0.2, 0.3);
      break;
    case "jump":
      pe(t, "sine", 330, 700, 0.3, 0.22), pt(t, "bandpass", 700, 2200, 0.3, 0.14, 0, 1.2);
      break;
    case "land":
      pe(t, "sine", 110, 45, 0.25, 0.45), pt(t, "lowpass", 700, 120, 0.2, 0.25);
      break;
    case "lap":
      pe(t, "sine", 784, 784, 0.16, 0.24), pe(t, "sine", 1175, 1175, 0.3, 0.22, 0.12);
      break;
    case "final":
      for (let s = 0; s < 4; s++) pe(t, "triangle", [523, 659, 784, 1047][s], [523, 659, 784, 1047][s], 0.2, 0.16, s * 0.1);
      break;
    case "checkpoint":
      pe(t, "sine", 1319, 1319, 0.18, 0.18);
      break;
    case "respawn":
      pe(t, "sine", 300, 900, 0.5, 0.2);
      break;
  }
}
var dt = null;
function dn(n, e, t, o) {
  let s = we();
  if (!dt) {
    let i = s.ctx.createOscillator(),
      c = s.ctx.createOscillator(),
      p = s.ctx.createOscillator();
    i.type = "sawtooth", c.type = "triangle", p.type = "sine";
    let f = s.ctx.createBiquadFilter();
    f.type = "lowpass", f.Q.value = 2;
    let h = s.ctx.createGain();
    h.gain.value = 0.16;
    let b = s.ctx.createGain();
    b.gain.value = 0.025, i.connect(f), c.connect(f), f.connect(h).connect(s.engine), p.connect(b).connect(s.engine);
    let u = s.ctx.createBufferSource();
    u.buffer = ot, u.loop = !0;
    let m = s.ctx.createBiquadFilter();
    m.type = "bandpass", m.Q.value = 0.8;
    let v = s.ctx.createGain();
    v.gain.value = 0, u.connect(m).connect(v).connect(s.engine);
    for (let E of [i, c, p]) E.start();
    u.start(), dt = {
      o1: i,
      o2: c,
      o3: p,
      filter: f,
      whoosh: v,
      wf: m
    };
  }
  let a = s.ctx.currentTime,
    r = Math.min(1.4, n / 130),
    l = 48 + r * 150 + (e ? 30 : 0);
  dt.o1.frequency.setTargetAtTime(l, a, 0.08), dt.o2.frequency.setTargetAtTime(l * 0.502, a, 0.08), dt.o3.frequency.setTargetAtTime(l * 4, a, 0.08), dt.filter.frequency.setTargetAtTime(220 + r * 900 + (e ? 500 : 0), a, 0.1), dt.wf.frequency.setTargetAtTime(500 + r * 2500, a, 0.1), dt.whoosh.gain.setTargetAtTime((r * 0.12 + (e ? 0.1 : 0) + (o ? 0.07 : 0)) * (t ? 1 : 0), a, 0.1), s.engine.gain.setTargetAtTime(t ? 0.3 : 0, a, 0.15);
}
var Dt = ["intro", "verse", "verse", "chorus", "chorus", "break", "chorus", "chorus"],
  hr = {
    menu: {
      title: "NEON GRID",
      bpm: 98,
      key: 41,
      verse: [[0, "m7"], [8, "M7"], [3, "M"], [10, "M"]],
      chorus: [[8, "M7"], [10, "M"], [0, "m"], [7, "m"]],
      bass: "pulse",
      drive: 0.25,
      drums: "half",
      arp: {
        rate: 2,
        pattern: [0, 2, 1, 3],
        wave: "triangle",
        octave: 12,
        chorus: !0
      },
      chords: {
        style: "pad",
        steps: []
      },
      lead: [[0, 19, 8], [8, 15, 4], [12, 12, 4], [16, 20, 8], [24, 17, 4], [28, 15, 4], [32, 15, 6], [38, 14, 2], [40, 12, 8], [48, 10, 6], [54, 12, 2], [56, 14, 8]],
      leadWave: "triangle",
      arrangement: ["intro", "verse", "chorus", "break"],
      level: 1
    },
    harbor: {
      title: "SUNSET OVERDRIVE",
      bpm: 118,
      key: 45,
      verse: [[0, "m"], [10, "M"], [8, "M"], [7, "M"]],
      chorus: [[8, "M"], [10, "M"], [0, "m"], [0, "m7"]],
      bass: "octave",
      drive: 0.35,
      drums: "four",
      arp: {
        rate: 1,
        pattern: [0, 1, 2, 3, 2, 1, 2, 3],
        wave: "square",
        octave: 12,
        chorus: !0
      },
      chords: {
        style: "pad",
        steps: []
      },
      lead: [[0, 12, 3], [3, 10, 3], [6, 8, 2], [8, 7, 4], [12, 8, 4], [16, 7, 3], [19, 10, 3], [22, 14, 2], [24, 15, 6], [30, 14, 2], [32, 12, 6], [38, 15, 2], [40, 19, 4], [44, 17, 2], [46, 15, 2], [48, 12, 8], [56, 10, 2], [58, 12, 2], [60, 7, 4]],
      leadWave: "sawtooth",
      arrangement: Dt,
      level: 1
    },
    canyon: {
      title: "CHROME RAIN",
      bpm: 128,
      key: 40,
      verse: [[0, "m"], [1, "M"], [0, "m"], [10, "M"]],
      chorus: [[8, "M"], [10, "M"], [0, "m"], [7, "M"]],
      bass: "rolling",
      drive: 0.8,
      drums: "dark",
      arp: {
        rate: 1,
        pattern: [0, 0, 3, 0, 2, 0, 3, 1],
        wave: "sawtooth",
        octave: 12,
        chorus: !1
      },
      chords: {
        style: "stab",
        steps: [0, 3, 6, 10, 12]
      },
      lead: [[0, 12, 2], [2, 13, 2], [4, 12, 2], [6, 8, 2], [8, 7, 2], [10, 8, 2], [12, 12, 4], [16, 10, 4], [20, 14, 2], [22, 15, 2], [24, 14, 4], [28, 10, 4], [32, 12, 2], [34, 13, 2], [36, 12, 2], [38, 15, 2], [40, 19, 6], [46, 17, 2], [48, 15, 4], [52, 13, 4], [56, 11, 6], [62, 12, 2]],
      leadWave: "square",
      arrangement: Dt,
      level: 0.95
    },
    citadel: {
      title: "CITADEL ASCENT",
      bpm: 136,
      key: 38,
      verse: [[0, "m"], [8, "M"], [3, "M"], [10, "M"]],
      chorus: [[5, "m"], [8, "M"], [10, "M"], [0, "m"]],
      bass: "gallop",
      drive: 0.45,
      drums: "four",
      arp: {
        rate: 1,
        pattern: [0, 1, 2, 1, 3, 2, 1, 2],
        wave: "sawtooth",
        octave: 24,
        chorus: !0
      },
      chords: {
        style: "stab",
        steps: [2, 6, 10, 14]
      },
      lead: [[0, 24, 6], [6, 22, 2], [8, 20, 4], [12, 17, 4], [16, 15, 6], [22, 17, 2], [24, 20, 8], [32, 22, 6], [38, 19, 2], [40, 17, 4], [44, 14, 4], [48, 12, 8], [56, 14, 2], [58, 15, 2], [60, 17, 4]],
      leadWave: "sawtooth",
      arrangement: Dt,
      level: 0.9
    },
    coast: {
      title: "COASTLINE DASH",
      bpm: 124,
      key: 36,
      verse: [[0, "m7"], [8, "M"], [3, "M"], [10, "M"]],
      chorus: [[8, "M"], [10, "M"], [0, "m"], [7, "M"]],
      bass: "funk",
      drive: 0.3,
      drums: "four",
      arp: {
        rate: 2,
        pattern: [0, 2, 1, 2],
        wave: "square",
        octave: 12,
        chorus: !1
      },
      chords: {
        style: "stab",
        steps: [0, 3, 8, 11]
      },
      lead: [[0, 15, 1], [2, 15, 1], [3, 12, 2], [6, 15, 2], [8, 17, 2], [10, 15, 2], [12, 12, 3], [16, 14, 1], [18, 14, 1], [19, 10, 2], [22, 14, 2], [24, 17, 2], [26, 14, 2], [28, 10, 3], [32, 12, 1], [34, 12, 1], [35, 15, 2], [38, 19, 2], [40, 24, 4], [44, 22, 2], [46, 19, 2], [48, 19, 4], [52, 17, 2], [54, 15, 2], [56, 14, 4], [60, 11, 4]],
      leadWave: "square",
      arrangement: Dt,
      level: 1
    },
    freefall: {
      title: "FREEFALL PROTOCOL",
      bpm: 140,
      key: 43,
      verse: [[0, "m"], [0, "m7"], [8, "M"], [7, "M"]],
      chorus: [[5, "m"], [8, "M"], [7, "M"], [7, "sus"]],
      bass: "reese",
      drive: 0.65,
      drums: "break",
      arp: {
        rate: 1,
        pattern: [0, 2, 0, 3, 0, 1, 0, 2],
        wave: "square",
        octave: 24,
        chorus: !0
      },
      chords: {
        style: "stab",
        steps: [0, 3, 6]
      },
      lead: [[0, 17, 2], [3, 17, 2], [6, 15, 2], [8, 12, 2], [11, 15, 2], [14, 17, 2], [16, 15, 2], [19, 15, 2], [22, 14, 2], [24, 10, 2], [27, 14, 2], [30, 15, 2], [32, 19, 4], [36, 23, 2], [38, 24, 2], [40, 26, 4], [44, 23, 4], [48, 19, 6], [54, 17, 2], [56, 15, 4], [60, 14, 4]],
      leadWave: "sawtooth",
      arrangement: Dt,
      level: 0.95
    },
    skyline: {
      title: "SKYLINE RUNNER",
      bpm: 132,
      key: 47,
      leadBase: 59,
      verse: [[0, "m"], [8, "M"], [3, "M"], [10, "M"]],
      chorus: [[8, "M"], [10, "M"], [7, "m"], [0, "m"]],
      bass: "pulse",
      drive: 0.4,
      drums: "four",
      arp: {
        rate: 1,
        pattern: [0, 1, 2, 3, 4, 3, 2, 1],
        wave: "sawtooth",
        octave: 12,
        chorus: !0
      },
      chords: {
        style: "pad",
        steps: []
      },
      lead: [[0, 20, 4], [4, 19, 4], [8, 15, 4], [12, 19, 4], [16, 22, 4], [20, 19, 4], [24, 17, 4], [28, 14, 4], [32, 19, 6], [38, 17, 2], [40, 14, 4], [44, 10, 4], [48, 12, 8], [56, 15, 4], [60, 19, 4]],
      leadWave: "sawtooth",
      arrangement: Dt,
      level: 0.95
    }
  },
  mr = {
    bay: "harbor",
    cobalt: "canyon",
    zenith: "citadel",
    "coast-rush": "coast",
    "neon-freefall": "freefall",
    "skyline-ascent": "skyline"
  };
function Zs(n) {
  return mr[n] ?? "harbor";
}
var br = {
    m: [0, 3, 7],
    M: [0, 4, 7],
    m7: [0, 3, 7, 10],
    M7: [0, 4, 7, 11],
    sus: [0, 5, 7]
  },
  Et = n => 440 * Math.pow(2, (n - 69) / 12),
  gr = 0.24;
function vr(n, [e, t]) {
  return br[t].map(o => {
    let s = n + 24 + e + o;
    for (; s > 72;) s -= 12;
    for (; s < 55;) s += 12;
    return s;
  }).sort((o, s) => o - s);
}
function Er(n, [e]) {
  return n + (e > 7 ? e - 12 : e);
}
var ln = null,
  Ws = "off",
  _s = 0,
  qs = 0,
  rn = 0,
  Dn = 0,
  Vn = null,
  Nn = 0,
  js = 0;
function yr(n, e) {
  let t = Math.floor(n.sampleRate * e),
    o = n.createBuffer(2, t, n.sampleRate);
  for (let s = 0; s < 2; s++) {
    let a = o.getChannelData(s);
    for (let r = 0; r < t; r++) a[r] = (Math.random() * 2 - 1) * Math.pow(1 - r / t, 3.4);
  }
  return o;
}
function Tr(n) {
  let e = 1 + n * 18,
    t = new Float32Array(1024);
  for (let o = 0; o < t.length; o++) {
    let s = o / (t.length - 1) * 2 - 1;
    t[o] = Math.tanh(e * s) / Math.tanh(e);
  }
  return t;
}
function Ke() {
  if (Vn) return Vn;
  let n = we(),
    e = n.ctx,
    t = e.createBiquadFilter();
  t.type = "lowpass", t.frequency.value = 7e3, t.Q.value = 0.3, t.connect(n.music);
  let o = e.createGain();
  o.connect(t);
  let s = e.createDelay(2),
    a = e.createGain();
  a.gain.value = 0.36;
  let r = e.createBiquadFilter();
  r.type = "lowpass", r.frequency.value = 2200;
  let l = e.createGain(),
    i = e.createGain();
  i.gain.value = 0.5, l.connect(s), s.connect(r), r.connect(a).connect(s), r.connect(i).connect(t);
  let c = e.createConvolver();
  c.buffer = yr(e, 1.9);
  let p = e.createGain(),
    f = e.createGain();
  f.gain.value = 0.45, p.connect(c).connect(f).connect(t);
  let h = (v, E, M) => {
      let k = e.createGain();
      if (k.connect(v), E) {
        let x = e.createGain();
        x.gain.value = E, k.connect(x).connect(l);
      }
      if (M) {
        let x = e.createGain();
        x.gain.value = M, k.connect(x).connect(p);
      }
      return k;
    },
    b = e.createWaveShaper();
  b.oversample = "2x";
  let u = e.createBiquadFilter();
  u.type = "lowpass", u.frequency.value = 1800;
  let m = e.createGain();
  return m.connect(b).connect(u).connect(o), Vn = {
    master: t,
    duck: o,
    delay: s,
    shaper: b,
    pad: h(o, 0, 0.6),
    chords: h(o, 0.2, 0.35),
    bass: m,
    arp: h(t, 0.45, 0.25),
    lead: h(t, 0.3, 0.4),
    drums: h(t, 0, 0.1)
  }, Vn;
}
function cn(n, e, t, o, s, a) {
  n.gain.setValueAtTime(1e-4, e), n.gain.exponentialRampToValueAtTime(o, e + t), n.gain.setValueAtTime(o, e + Math.max(t, s - a)), n.gain.exponentialRampToValueAtTime(1e-4, e + s);
}
function Ks(n, e, t, o, s) {
  let a = we().ctx,
    r = Ke(),
    l = a.createBiquadFilter();
  l.type = "lowpass", l.Q.value = s ? 2 : 0.7, s ? (l.frequency.setValueAtTime(3200, e), l.frequency.exponentialRampToValueAtTime(700, e + t)) : (l.frequency.setValueAtTime(700, e), l.frequency.linearRampToValueAtTime(1900, e + t * 0.5), l.frequency.linearRampToValueAtTime(900, e + t));
  let i = a.createGain();
  s ? cn(i, e, 0.005, o, t, t * 0.7) : cn(i, e, 0.5, o, t, 0.7), l.connect(i).connect(s ? r.chords : r.pad);
  for (let c of n) for (let p of s ? [-12, 12] : [-9, 9]) {
    let f = a.createOscillator();
    f.type = "sawtooth", f.frequency.value = Et(c), f.detune.value = p, f.connect(l), f.start(e), f.stop(e + t + 0.05);
  }
}
function vt(n, e, t, o, s, a = 1) {
  let r = we().ctx,
    l = r.createBiquadFilter();
  l.type = "lowpass", l.Q.value = s ? 1 : 4;
  let i = (s ? 500 : 1300) * a;
  l.frequency.setValueAtTime(i, e), l.frequency.exponentialRampToValueAtTime(s ? 260 : 160, e + Math.max(0.08, t));
  let c = r.createGain();
  cn(c, e, 0.005, o, t, t * 0.5), l.connect(c).connect(Ke().bass);
  let p = [];
  for (let b of s ? [-16, 16] : [0]) {
    let u = r.createOscillator();
    u.type = "sawtooth", u.frequency.value = Et(n), u.detune.value = b, u.connect(l), p.push(u);
  }
  let f = r.createOscillator();
  f.type = "sine", f.frequency.value = Et(n - 12);
  let h = r.createGain();
  h.gain.value = 0.7, f.connect(h).connect(c);
  for (let b of [...p, f]) b.start(e), b.stop(e + t + 0.05);
}
function xr(n, e, t, o, s) {
  let a = we().ctx,
    r = a.createOscillator();
  r.type = s, r.frequency.value = Et(n);
  let l = a.createBiquadFilter();
  l.type = "lowpass", l.Q.value = 3, l.frequency.setValueAtTime(3e3, e), l.frequency.exponentialRampToValueAtTime(500, e + 0.2);
  let i = a.createGain();
  cn(i, e, 0.003, t, 0.24, 0.2);
  let c = a.createStereoPanner();
  c.pan.value = o, r.connect(l).connect(i).connect(c).connect(Ke().arp), r.start(e), r.stop(e + 0.28);
}
function wr(n, e, t, o, s) {
  let a = we().ctx,
    r = Nn && e - js < 0.05,
    l = Et(r ? Nn : n),
    i = a.createBiquadFilter();
  i.type = "lowpass", i.frequency.value = s === "triangle" ? 3e3 : 2300, i.Q.value = 2;
  let c = a.createGain();
  cn(c, e, 0.02, o, t + 0.12, 0.2), i.connect(c).connect(Ke().lead);
  let p = a.createOscillator();
  p.frequency.value = 5.5;
  let f = a.createGain();
  f.gain.setValueAtTime(0, e), f.gain.linearRampToValueAtTime(t > 0.3 ? 12 : 0, e + Math.min(0.4, t)), p.connect(f);
  let h = [s, s === "triangle" ? "sine" : "square"].map((b, u) => {
    let m = a.createOscillator();
    return m.type = b, m.frequency.setValueAtTime(l, e), m.frequency.exponentialRampToValueAtTime(Et(n), e + (r ? 0.07 : 0.001)), m.detune.value = u ? 7 : -5, f.connect(m.detune), m.connect(i), m;
  });
  for (let b of [p, ...h]) b.start(e), b.stop(e + t + 0.2);
  Nn = n, js = e + t;
}
function On(n, e, t) {
  let o = we().ctx,
    s = Ke(),
    a = o.createOscillator();
  a.frequency.setValueAtTime(160, n), a.frequency.exponentialRampToValueAtTime(44, n + 0.11);
  let r = o.createGain();
  r.gain.setValueAtTime(e, n), r.gain.exponentialRampToValueAtTime(1e-4, n + 0.34), a.connect(r).connect(s.drums), a.start(n), a.stop(n + 0.36), je(n, "highpass", 3e3, 0.012, e * 0.25), s.duck.gain.setValueAtTime(0.35, n), s.duck.gain.linearRampToValueAtTime(1, n + t);
}
function je(n, e, t, o, s, a = 0.8) {
  if (!ot) return;
  let r = we().ctx,
    l = r.createBufferSource();
  l.buffer = ot;
  let i = r.createBiquadFilter();
  i.type = e, i.frequency.value = t, i.Q.value = a;
  let c = r.createGain();
  c.gain.setValueAtTime(s, n), c.gain.exponentialRampToValueAtTime(1e-4, n + o), l.connect(i).connect(c).connect(Ke().drums), l.start(n, Math.random() * 0.5), l.stop(n + o + 0.02);
}
function an(n, e) {
  let t = we().ctx;
  je(n, "bandpass", 1900, 0.2, e);
  let o = t.createOscillator();
  o.type = "triangle", o.frequency.setValueAtTime(210, n), o.frequency.exponentialRampToValueAtTime(160, n + 0.08);
  let s = t.createGain();
  s.gain.setValueAtTime(e * 0.7, n), s.gain.exponentialRampToValueAtTime(1e-4, n + 0.11), o.connect(s).connect(Ke().drums), o.start(n), o.stop(n + 0.13);
}
function Ys(n, e) {
  for (let t = 0; t < 3; t++) je(n + t * 0.011, "bandpass", 1300, t === 2 ? 0.16 : 0.02, e, 1.2);
}
function Rr(n, e, t) {
  let o = we().ctx,
    s = o.createOscillator();
  s.frequency.setValueAtTime(e, n), s.frequency.exponentialRampToValueAtTime(e * 0.55, n + 0.2);
  let a = o.createGain();
  a.gain.setValueAtTime(t, n), a.gain.exponentialRampToValueAtTime(1e-4, n + 0.25), s.connect(a).connect(Ke().drums), s.start(n), s.stop(n + 0.27);
}
function Mr(n, e, t) {
  if (!ot) return;
  let o = we().ctx,
    s = o.createBufferSource();
  s.buffer = ot, s.loop = !0;
  let a = o.createBiquadFilter();
  a.type = "bandpass", a.Q.value = 2, a.frequency.setValueAtTime(300, n), a.frequency.exponentialRampToValueAtTime(7e3, n + e);
  let r = o.createGain();
  r.gain.setValueAtTime(1e-4, n), r.gain.exponentialRampToValueAtTime(t, n + e * 0.95), r.gain.exponentialRampToValueAtTime(1e-4, n + e), s.connect(a).connect(r).connect(Ke().drums), s.start(n), s.stop(n + e + 0.02);
}
function Bo(n, e) {
  let t = n.arrangement;
  return e < t.length ? t[e] : t[1 + (e - 1) % (t.length - 1)];
}
function Hr(n, e, t) {
  let o = Dn % 64,
    s = Math.floor(Dn / 64),
    a = Bo(n, s),
    r = Bo(n, s + 1),
    l = Math.floor(o / 16),
    i = o % 16,
    p = (a === "chorus" ? n.chorus : n.verse)[l],
    f = vr(n.key, p),
    h = Er(n.key, p),
    b = a === "chorus",
    u = a === "verse" || a === "chorus" || a === "intro" && l >= 2,
    m = l === 3;
  if ((!b || n.chords.style === "pad") && i === 0 && Ks(f, e, t * 16, b ? 0.05 : 0.04, !1), b && n.chords.style === "stab" && n.chords.steps.includes(i) && Ks(f, e, t * 1.6, 0.045, !0), a !== "intro") if (a === "break") i === 0 && vt(h, e, t * 15, 0.12, !0, 0.6);else switch (n.bass) {
    case "octave":
      o % 2 === 0 && vt(h + (o % 4 === 2 ? 12 : 0), e, t * 1.6, 0.13, !1);
      break;
    case "rolling":
      vt(h + (i === 14 ? 12 : 0), e, t * 0.9, i % 4 === 0 ? 0.13 : 0.13 * 0.75, !1);
      break;
    case "gallop":
      i % 4 !== 1 && vt(h + (i % 4 === 3 ? 12 : 0), e, t * 0.9, 0.13, !1);
      break;
    case "funk":
      {
        let k = [0, 3, 6, 8, 10, 11, 14].indexOf(i);
        k >= 0 && vt(h + [0, 12, 0, 7, 12, 0, 10][k], e, t * 1.3, 0.13, !1);
        break;
      }
    case "reese":
      {
        let k = [0, 6, 8, 12, 14].indexOf(i);
        k >= 0 && vt(h + [0, 0, 12, 7, 10][k], e, t * [6, 2, 4, 2, 2][k], 0.13, !0);
        break;
      }
    case "pulse":
      o % 2 === 0 && vt(h, e, t * 1.8, 0.13 * (n.bpm < 110 ? 0.85 : 1), !1, 0.5 + i / 20);
      break;
  }
  if ((a !== "chorus" || n.arp.chorus) && o % n.arp.rate === 0) {
    let E = Math.floor(o / n.arp.rate),
      M = f[n.arp.pattern[E % n.arp.pattern.length] % f.length] + n.arp.octave;
    xr(M, e, b ? 0.035 : a === "intro" ? 0.04 : 0.045, E % 2 ? 0.4 : -0.4, n.arp.wave);
  }
  if (b || a === "break") {
    let E = n.lead.find(M => M[0] === o);
    E && wr((n.leadBase ?? n.key + 24) + E[1], e, E[2] * t * 0.95, a === "break" ? 0.04 : 0.06, n.leadWave);
  }
  if (u) {
    let E = a === "intro" ? 0.6 : 1,
      M = t * 3;
    switch (n.drums) {
      case "four":
        i % 4 === 0 && On(e, 0.42 * E, M), (i === 4 || i === 12) && (an(e, 0.13 * E), b && Ys(e, 0.08)), (i % 2 === 1 || b && i % 4 !== 0) && je(e, "highpass", 8e3, 0.04, (i % 2 ? 0.03 : 0.018) * E), b && i % 4 === 2 && je(e, "highpass", 6500, 0.18, 0.02);
        break;
      case "dark":
        (i % 4 === 0 || i === 14 && b) && On(e, (i === 14 ? 0.3 : 0.44) * E, M), (i === 4 || i === 12) && (Ys(e, 0.11 * E), an(e, 0.08 * E)), je(e, "bandpass", 9500, 0.03, (i % 2 ? 0.03 : 0.015) * E, 3), b && i % 4 === 2 && je(e, "highpass", 6e3, 0.2, 0.022);
        break;
      case "half":
        (i === 0 || i === 10) && On(e, 0.36 * E, t * 4), i === 8 && an(e, 0.1 * E), (i % 2 === 0 || b && i % 4 === 3) && je(e, "highpass", 8e3, 0.04, 0.02 * E);
        break;
      case "break":
        (i === 0 || i === 10 || b && i === 7) && On(e, 0.42 * E, M), (i === 4 || i === 12) && an(e, 0.13 * E), (i === 7 || i === 15) && an(e, 0.035 * E), je(e, "highpass", 8500, 0.035, (i % 4 === 2 ? 0.032 : 0.018) * E);
        break;
    }
  }
  m && i === 0 && r === "chorus" && a !== "chorus" && Mr(e, t * 16, 0.07), m && r === "chorus" && u && i >= 12 && Rr(e, [220, 180, 150, 120][i - 12], 0.14), o === 0 && b && Bo(n, s - 1) !== "chorus" && je(e, "highpass", 4500, 1.6, 0.06);
}
function Xs() {
  let n = we();
  if (!ln) return;
  if (n.ctx.state !== "running") {
    rn = n.ctx.currentTime + 0.05;
    return;
  }
  let e = 60 / ln.bpm / 4;
  for (; rn < n.ctx.currentTime + 0.3;) Hr(ln, rn, e), rn += e, Dn++;
}
function Vo(n) {
  if (n === Ws) return null;
  let e = we(),
    t = Ke();
  Ws = n, window.clearInterval(_s), window.clearTimeout(qs);
  let o = e.ctx.currentTime;
  if (e.music.gain.cancelScheduledValues(o), e.music.gain.setTargetAtTime(0, o, 0.12), n === "off") return ln = null, null;
  let s = hr[n];
  return qs = window.setTimeout(() => {
    let a = e.ctx.currentTime;
    ln = s, Dn = 0, Nn = 0, rn = a + 0.05, t.delay.delayTime.setValueAtTime(180 / s.bpm / 4, a), t.shaper.curve = Tr(s.drive), e.music.gain.cancelScheduledValues(a), e.music.gain.setValueAtTime(0, a), e.music.gain.linearRampToValueAtTime(gr * s.level, a + 1.2), Xs(), _s = window.setInterval(Xs, 50);
  }, 450), s.title;
}
import * as C from "./vendor/001-three-0.185.js";
var Ie = 3e3,
  kr = `
attribute float aSize;
attribute vec3 aColor;
varying vec3 vColor;
uniform float uScale;
void main() {
  vColor = aColor;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_PointSize = aSize * uScale / max(0.5, -mv.z);
  gl_Position = projectionMatrix * mv;
}`,
  Sr = `
varying vec3 vColor;
void main() {
  vec2 c = gl_PointCoord - 0.5;
  float star = max(0.0, 1.0 - (abs(c.x) * 7.0 + abs(c.y) * 1.2)) + max(0.0, 1.0 - (abs(c.y) * 7.0 + abs(c.x) * 1.2));
  float core = smoothstep(0.32, 0.1, length(c));
  float a = clamp(star + core, 0.0, 1.0);
  if (a < 0.02) discard;
  gl_FragColor = vec4(vColor * a, 1.0);
}`,
  Fn = class {
    group = new C.Group();
    geometry = new C.BufferGeometry();
    material;
    pos = new Float32Array(Ie * 3);
    vel = new Float32Array(Ie * 3);
    col = new Float32Array(Ie * 3);
    size = new Float32Array(Ie);
    life = new Float32Array(Ie);
    maxLife = new Float32Array(Ie);
    drag = new Float32Array(Ie);
    grav = new Float32Array(Ie);
    outPos = new Float32Array(Ie * 3);
    outCol = new Float32Array(Ie * 3);
    outSize = new Float32Array(Ie);
    count = 0;
    booms = [];
    popups = [];
    sonics = [];
    layer;
    camera;
    tmp = new C.Vector3();
    liveAttrs = [];
    fireMat = P("#ffb321", {
      emissive: "#ff6a00",
      emissiveIntensity: 1.2
    });
    smokeMat = P("#3a2a4a", {
      transparent: !0,
      opacity: 0.9
    });
    constructor(e, t) {
      this.camera = e, this.layer = t, this.geometry.setAttribute("position", new C.BufferAttribute(this.outPos, 3).setUsage(C.DynamicDrawUsage)), this.geometry.setAttribute("aColor", new C.BufferAttribute(this.outCol, 3).setUsage(C.DynamicDrawUsage)), this.geometry.setAttribute("aSize", new C.BufferAttribute(this.outSize, 1).setUsage(C.DynamicDrawUsage)), this.liveAttrs = ["position", "aColor", "aSize"].map(l => this.geometry.getAttribute(l)), this.material = new C.ShaderMaterial({
        uniforms: {
          uScale: {
            value: 400
          }
        },
        vertexShader: kr,
        fragmentShader: Sr,
        transparent: !0,
        depthWrite: !1,
        blending: C.AdditiveBlending
      });
      let o = new C.Points(this.geometry, this.material);
      o.frustumCulled = !1, this.group.add(o);
      let s = new C.IcosahedronGeometry(1, 2),
        a = new C.TorusGeometry(1, 0.08, 6, 40);
      for (let l = 0; l < 12; l++) {
        let i = new C.Group(),
          c = X(new C.Mesh(s, this.fireMat), 0.12),
          p = X(new C.Mesh(s, this.smokeMat), 0.1),
          f = new C.Mesh(a, new C.MeshBasicMaterial({
            color: new C.Color(3, 2.4, 1.2),
            transparent: !0,
            blending: C.AdditiveBlending,
            depthWrite: !1
          }));
        f.rotation.x = Math.PI / 2, i.add(p, c, f), i.visible = !1, this.group.add(i), this.booms.push({
          group: i,
          fire: c,
          smoke: p,
          ring: f,
          t: 0,
          scale: 1,
          active: !1
        });
      }
      let r = new C.TorusGeometry(1, 0.06, 6, 48);
      for (let l = 0; l < 10; l++) {
        let i = new C.MeshBasicMaterial({
            color: 16777215,
            transparent: !0,
            blending: C.AdditiveBlending,
            depthWrite: !1
          }),
          c = new C.Mesh(r, i);
        c.visible = !1, this.group.add(c), this.sonics.push({
          mesh: c,
          mat: i,
          t: 0,
          active: !1,
          color: new C.Color()
        });
      }
    }
    setViewportHeight(e, t) {
      this.material.uniforms.uScale.value = e / (2 * Math.tan(C.MathUtils.degToRad(t) / 2));
    }
    emit(e, t, o, s, a, r = 1.5, l = 0) {
      let i;
      this.count < Ie ? i = this.count++ : i = Math.floor(Math.random() * Ie), this.pos[i * 3] = e.x, this.pos[i * 3 + 1] = e.y, this.pos[i * 3 + 2] = e.z, this.vel[i * 3] = t.x, this.vel[i * 3 + 1] = t.y, this.vel[i * 3 + 2] = t.z, this.col[i * 3] = o.r, this.col[i * 3 + 1] = o.g, this.col[i * 3 + 2] = o.b, this.size[i] = s, this.life[i] = a, this.maxLife[i] = a, this.drag[i] = r, this.grav[i] = l;
    }
    burst(e, t, o, s, a = 0.9, r = 0.6, l) {
      for (let i = 0; i < o; i++) this.tmp.set(Math.random() - 0.5, Math.random() - 0.3, Math.random() - 0.5).normalize().multiplyScalar(s * (0.4 + Math.random() * 0.8)), l && this.tmp.add(l), this.emit(e, this.tmp, t, a * (0.6 + Math.random() * 0.8), r * (0.6 + Math.random() * 0.8), 2.2, 18);
    }
    explosion(e, t = 1, o) {
      let s = this.booms.find(a => !a.active) ?? this.booms[0];
      s.active = !0, s.t = 0, s.scale = t, s.group.position.copy(e), s.group.visible = !0, s.group.userData.carry = o ? o.clone().multiplyScalar(0.6) : new C.Vector3(), this.burst(e, new C.Color(3, 1.6, 0.4), Math.round(40 * t), 22 * t, 1.4, 0.8, o), this.burst(e, new C.Color(2.4, 0.6, 2.2), Math.round(18 * t), 14 * t, 1.1, 0.7, o);
    }
    sonic(e, t, o) {
      let s = this.sonics.find(a => !a.active) ?? this.sonics[0];
      s.active = !0, s.t = 0, s.color.copy(o).multiplyScalar(2), s.mesh.position.copy(e), s.mesh.quaternion.copy(t), s.mesh.visible = !0;
    }
    popup(e, t, o = "#ffe14d", s = !1) {
      let a = document.createElement("div");
      a.className = "npz-pop" + (s ? " big" : ""), a.textContent = t, a.style.setProperty("--pop-color", o), a.style.setProperty("--pop-rot", `${(Math.random() - 0.5) * 24}deg`), this.layer.append(a), this.popups.push({
        el: a,
        pos: e.clone(),
        t: 0
      }), this.popups.length > 6 && this.popups.shift().el.remove();
    }
    update(e, t, o) {
      let s = 0;
      for (let a = 0; a < this.count; a++) {
        if (this.life[a] -= e, this.life[a] <= 0) {
          let i = --this.count;
          a !== i && (this.copyParticle(i, a), a--);
          continue;
        }
        let r = Math.exp(-this.drag[a] * e);
        this.vel[a * 3] *= r, this.vel[a * 3 + 1] = this.vel[a * 3 + 1] * r - this.grav[a] * e, this.vel[a * 3 + 2] *= r, this.pos[a * 3] += this.vel[a * 3] * e, this.pos[a * 3 + 1] += this.vel[a * 3 + 1] * e, this.pos[a * 3 + 2] += this.vel[a * 3 + 2] * e;
        let l = this.life[a] / this.maxLife[a];
        this.outPos[s * 3] = this.pos[a * 3], this.outPos[s * 3 + 1] = this.pos[a * 3 + 1], this.outPos[s * 3 + 2] = this.pos[a * 3 + 2], this.outCol[s * 3] = this.col[a * 3] * l, this.outCol[s * 3 + 1] = this.col[a * 3 + 1] * l, this.outCol[s * 3 + 2] = this.col[a * 3 + 2] * l, this.outSize[s] = this.size[a] * (0.4 + 0.6 * l), s++;
      }
      this.geometry.setDrawRange(0, s);
      for (let a of this.liveAttrs) a.clearUpdateRanges(), a.addUpdateRange(0, Math.max(1, s * a.itemSize)), a.needsUpdate = !0;
      for (let a of this.booms) {
        if (!a.active) continue;
        a.t += e;
        let r = a.t / 0.85;
        if (r >= 1) {
          a.active = !1, a.group.visible = !1;
          continue;
        }
        let l = a.group.userData.carry;
        a.group.position.addScaledVector(l, e);
        let i = a.scale,
          c = 1 - Math.pow(1 - Math.min(1, r * 2.2), 3);
        a.fire.scale.setScalar(i * (0.5 + 3.4 * c) * (1 - Math.max(0, r - 0.55) * 2)), a.fire.visible = r < 0.95, a.smoke.scale.setScalar(i * (1 + 4.2 * c)), a.smoke.position.y = r * 3 * i, a.smoke.visible = r > 0.12, a.ring.scale.setScalar(i * (1 + 11 * c)), a.ring.material.opacity = 1 - r;
      }
      for (let a of this.sonics) {
        if (!a.active) continue;
        a.t += e;
        let r = a.t / 0.55;
        if (r >= 1) {
          a.active = !1, a.mesh.visible = !1;
          continue;
        }
        let l = 1 - (1 - r) * (1 - r);
        a.mesh.scale.setScalar(2 + l * 9), a.mat.color.copy(a.color).multiplyScalar(1 - r);
      }
      for (let a = this.popups.length - 1; a >= 0; a--) {
        let r = this.popups[a];
        if (r.t += e, r.t > 1) {
          r.el.remove(), this.popups.splice(a, 1);
          continue;
        }
        if (this.tmp.copy(r.pos).project(this.camera), this.tmp.z > 1) {
          r.el.style.opacity = "0";
          continue;
        }
        let l = (this.tmp.x * 0.5 + 0.5) * t,
          i = (-this.tmp.y * 0.5 + 0.5) * o - r.t * 50,
          c = r.t < 0.12 ? 0.3 + r.t / 0.12 * 1 : 1.3 - Math.min(0.3, (r.t - 0.12) * 1.5);
        r.el.style.opacity = String(r.t > 0.7 ? 1 - (r.t - 0.7) / 0.3 : 1), r.el.style.transform = `translate(${l}px, ${i}px) translate(-50%, -50%) rotate(var(--pop-rot)) scale(${c})`;
      }
    }
    copyParticle(e, t) {
      for (let o = 0; o < 3; o++) this.pos[t * 3 + o] = this.pos[e * 3 + o], this.vel[t * 3 + o] = this.vel[e * 3 + o], this.col[t * 3 + o] = this.col[e * 3 + o];
      this.size[t] = this.size[e], this.life[t] = this.life[e], this.maxLife[t] = this.maxLife[e], this.drag[t] = this.drag[e], this.grav[t] = this.grav[e];
    }
    clear() {
      this.count = 0, this.geometry.setDrawRange(0, 0);
      for (let e of this.booms) e.active = !1, e.group.visible = !1;
      for (let e of this.sonics) e.active = !1, e.mesh.visible = !1;
      for (let e of this.popups) e.el.remove();
      this.popups.length = 0;
    }
  },
  fn = class {
    mesh;
    points = [];
    sides = [];
    positions;
    colors;
    color;
    segments;
    timer = 0;
    constructor(e, t = 22) {
      this.segments = t, this.color = e.clone().multiplyScalar(2.2);
      for (let a = 0; a < t; a++) this.points.push(new C.Vector3()), this.sides.push(new C.Vector3(1, 0, 0));
      this.positions = new Float32Array(t * 2 * 3), this.colors = new Float32Array(t * 2 * 3);
      let o = [];
      for (let a = 0; a < t - 1; a++) {
        let r = a * 2;
        o.push(r, r + 2, r + 1, r + 1, r + 2, r + 3);
      }
      let s = new C.BufferGeometry();
      s.setAttribute("position", new C.BufferAttribute(this.positions, 3).setUsage(C.DynamicDrawUsage)), s.setAttribute("color", new C.BufferAttribute(this.colors, 3).setUsage(C.DynamicDrawUsage)), s.setIndex(o), this.mesh = new C.Mesh(s, new C.MeshBasicMaterial({
        vertexColors: !0,
        transparent: !0,
        blending: C.AdditiveBlending,
        depthWrite: !1,
        side: C.DoubleSide
      })), this.mesh.frustumCulled = !1;
    }
    reset(e) {
      for (let t of this.points) t.copy(e);
    }
    update(e, t, o, s, a) {
      if (this.mesh.visible = a > 0.01, this.timer += e, this.timer > 0.016) {
        this.timer = 0;
        let i = this.points.pop(),
          c = this.sides.pop();
        this.points.unshift(i), this.sides.unshift(c);
      }
      this.points[0].copy(t), this.sides[0].copy(o);
      let r = this.positions,
        l = this.colors;
      for (let i = 0; i < this.segments; i++) {
        let c = 1 - i / (this.segments - 1),
          p = s * (0.3 + 0.7 * c),
          f = this.points[i],
          h = this.sides[i],
          b = i * 6;
        r[b] = f.x - h.x * p, r[b + 1] = f.y - h.y * p, r[b + 2] = f.z - h.z * p, r[b + 3] = f.x + h.x * p, r[b + 4] = f.y + h.y * p, r[b + 5] = f.z + h.z * p;
        let u = c * c * a;
        l[b] = l[b + 3] = this.color.r * u, l[b + 1] = l[b + 4] = this.color.g * u, l[b + 2] = l[b + 5] = this.color.b * u;
      }
      this.mesh.geometry.getAttribute("position").needsUpdate = !0, this.mesh.geometry.getAttribute("color").needsUpdate = !0;
    }
  };
import * as ft from "./vendor/001-three-0.185.js";
import { EffectComposer as zr } from "./vendor/007-EffectComposer.js";
import { RenderPass as Ar } from "./vendor/009-RenderPass.js";
import { ShaderPass as Qs } from "./vendor/011-ShaderPass.js";
import { UnrealBloomPass as Cr } from "./vendor/013-UnrealBloomPass.js";
var Oo = `
    bool brokenF(float x) { return (floatBitsToUint(x) & 0x7f800000u) == 0x7f800000u || abs(x) > 6e4; }
    vec4 scrub(vec4 c) { return (brokenF(c.r) || brokenF(c.g) || brokenF(c.b)) ? vec4(0.0, 0.0, 0.0, 1.0) : vec4(clamp(c.rgb, 0.0, 64.0), c.a); }`,
  Lr = {
    uniforms: {
      tDiffuse: {
        value: null
      },
      uTime: {
        value: 0
      },
      uSpeed: {
        value: 0
      },
      uBoost: {
        value: 0
      },
      uAspect: {
        value: 1
      },
      uFlash: {
        value: new ft.Color(0, 0, 0)
      },
      uFlashAmount: {
        value: 0
      },
      uGlitch: {
        value: 0
      }
    },
    vertexShader: `
    varying vec2 vUv;
    void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float uTime; uniform float uSpeed; uniform float uBoost; uniform float uAspect;
    uniform vec3 uFlash; uniform float uFlashAmount; uniform float uGlitch;
    varying vec2 vUv;
    float hash(float n) { return fract(sin(n) * 43758.5453); }
    ${Oo}
    void main() {
      vec2 c = vUv - vec2(0.5, 0.56);
      c.x *= uAspect;
      float r = length(c);
      float ang = atan(c.y, c.x);
      vec2 dir = normalize(c + 1e-5);
      // Glitch: torn rows and shifted blocks after flying through a glitch gate.
      vec2 uv = vUv;
      float blk = 0.0;
      if (uGlitch > 0.001) {
        float gt = floor(uTime * 22.0);
        float rowN = hash(floor(vUv.y * 26.0) * 7.3 + gt);
        uv.x += (rowN - 0.5) * 0.09 * uGlitch * step(0.55, rowN);
        blk = step(0.9, hash(floor(vUv.x * 10.0) + floor(vUv.y * 7.0) * 13.0 + gt));
        uv += blk * uGlitch * vec2(0.025, -0.01);
      }
      // Boost fringe (and glitch split).
      float ca = uBoost * 0.0035 * r + uGlitch * 0.012;
      vec3 col;
      col.r = scrub(texture2D(tDiffuse, uv + dir * ca)).r;
      col.g = scrub(texture2D(tDiffuse, uv)).g;
      col.b = scrub(texture2D(tDiffuse, uv - dir * ca)).b;
      col = mix(col, col.gbr, blk * uGlitch * 0.8);
      col *= 1.0 - uGlitch * 0.25 * step(0.5, fract(vUv.y * 180.0));
      // Speed lines: thin wedges that flicker outward.
      float bins = 170.0;
      float id = floor((ang + 3.14159) / 6.28318 * bins);
      float frame = floor(uTime * 24.0);
      float h = hash(id * 13.7 + frame * 3.1);
      float inner = 0.34 + hash(id + frame) * 0.28;
      float show = step(1.0 - min(uSpeed, 1.0) * 0.34, h);
      float within = fract((ang + 3.14159) / 6.28318 * bins);
      float wedge = smoothstep(0.5, 0.15, abs(within - 0.5));
      float line = show * wedge * smoothstep(inner, inner + 0.25, r);
      col = mix(col, vec3(1.0), clamp(line * (0.2 + uBoost * 0.24), 0.0, 0.5));
      // Damage flash from the edges.
      float edge = smoothstep(0.25, 0.85, r);
      col = mix(col, uFlash, uFlashAmount * edge);
      // Ink vignette.
      col *= 1.0 - smoothstep(0.55, 1.05, r) * 0.55;
      gl_FragColor = vec4(col, 1.0);
      // As the last pass: ACES tone mapping and sRGB, exactly as an output pass would.
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
    }`
  };
function Js(n, e, t) {
  let o = new ft.WebGLRenderTarget(1, 1, {
      type: ft.HalfFloatType,
      samples: 4
    }),
    s = new zr(n, o);
  s.addPass(new Ar(e, t));
  let a = new Cr(new ft.Vector2(256, 256), 0.34, 0.3, 0.95),
    r = a.materialHighPassFilter;
  r.fragmentShader = r.fragmentShader.replace("void main", `${Oo}
void main`).replace(/texture2D\(\s*tDiffuse\s*,\s*vUv\s*\)/, "scrub(texture2D(tDiffuse, vUv))"), r.needsUpdate = !0, r.fragmentShader.includes("scrub(texture2D") || s.addPass(new Qs({
    uniforms: {
      tDiffuse: {
        value: null
      }
    },
    vertexShader: "varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
    fragmentShader: `uniform sampler2D tDiffuse; varying vec2 vUv; ${Oo}
void main() { gl_FragColor = scrub(texture2D(tDiffuse, vUv)); }`
  })), s.addPass(a);
  let l = new Qs(Lr);
  return s.addPass(l), {
    composer: s,
    comic: l,
    bloom: a,
    setSize(i, c, p) {
      s.setPixelRatio(p), s.setSize(i, c), a.setSize(i * p / 2, c * p / 2), l.uniforms.uAspect.value = i / c;
    }
  };
}
function Ir() {
  let n = [];
  for (let e = 90; e <= 540; e += 45) {
    let t = e * Math.PI / 180;
    n.push([Math.round(110 * Math.cos(t) * 10) / 10, 36 * (e - 90) / 450, Math.round(110 * Math.sin(t) * 10) / 10]);
  }
  return n;
}
var ie = [{
    id: "bay",
    biome: "harbor",
    name: "SUNSET HARBOR",
    subtitle: "Skim the ocean at dusk past islands, a giant wheel and the lighthouse",
    difficulty: "EASY",
    points: [[0, 0, 0], [0, 0, -250], [40, 6, -420], [180, 18, -500], [340, 10, -440], [420, 0, -300], [400, 0, -140], [300, 0, -60], [320, 0, 60], [420, 8, 160], [400, 20, 320], [260, 24, 400], [100, 8, 380], [-20, 0, 300], [-40, 0, 150]],
    width: 32,
    laps: 3,
    start: 0.3,
    tunnels: [[5.05, 5.95]],
    jumps: [[1.62, 1.74], [11.4, 11.6]],
    boosts: [[0.8, 0], [1.4, 0], [3.4, -7], [4.5, 7], [6.6, 6], [8.3, -6], [9.5, 0], [12.4, 7], [13.2, -7], [14.4, 0]],
    blocks: [[2.9, [-6]], [6.8, [7]], [10.3, [0]], [12.9, [-8]]],
    sliders: [[4.4, 9, 1], [9, 9, 1.1]],
    signs: ["HARBOR GP", "NEO RAMEN", "VOLTA COLA", "SURF CITY", "ZAP!", "PIER 99", "KAIRO-9", "SUNSET FM"],
    theme: {
      skyTop: "#1d0f4a",
      skyMid: "#a8367a",
      horizon: "#ffae6e",
      fog: "#6a3a6e",
      sun: "#ffd84d",
      neonA: "#36f3ff",
      neonB: "#ff5fa8",
      road: "#2b2c5c",
      wall: "#3d2a78",
      ground: "#1c3a78",
      building: "#3a2e6e",
      cloud: "#ffa6c9",
      key: "#ffe2c4"
    }
  }, {
    id: "cobalt",
    biome: "megacity",
    name: "CHROME CANYON",
    subtitle: "A rain-soaked figure-eight through a megacity, under a giant hologram",
    difficulty: "MEDIUM",
    points: [[-120, 0, -60], [-160, 0, -220], [-60, 0, -340], [100, 0, -330], [170, 2, -200], [110, 8, -80], [0, 20, 0], [-110, 16, 90], [-190, 8, 220], [-110, 2, 350], [60, 0, 360], [170, 0, 240], [120, 0, 110]],
    width: 30,
    laps: 3,
    start: 0.35,
    tunnels: [[9.1, 9.95]],
    jumps: [[7.3, 7.48], [11.25, 11.4]],
    boosts: [[0.7, 0], [1.4, -6], [2.5, 5], [4.6, 0], [5.5, -5], [8.5, -4], [10.3, 5], [11.05, 0], [12.4, -5]],
    blocks: [[1.9, [-6]], [4.2, [7]], [6.5, [0]], [10.7, [-7]], [12.1, [6]]],
    sliders: [[5.4, 9, 1], [9.6, 8, 1.1]],
    landmark: [-15, 227],
    signs: ["CHROME", "MEGA BYTE", "ROBO SUSHI", "POW!", "NEXUS 3000", "GLITCH FM", "TURBO TEA", "KOI CORP"],
    theme: {
      skyTop: "#02040f",
      skyMid: "#0d1745",
      horizon: "#2f4fb4",
      fog: "#0a1034",
      sun: "#e9f3ff",
      neonA: "#b6ff3b",
      neonB: "#35c8ff",
      road: "#1a1f46",
      wall: "#1d2a60",
      ground: "#04071a",
      building: "#172456",
      cloud: "#40509a",
      key: "#cfe0ff"
    }
  }, {
    id: "zenith",
    biome: "sky",
    name: "SKY CITADEL",
    subtitle: "Spiral around a colossal spire above a sea of clouds, then dive",
    difficulty: "HARD",
    points: [[300, 0, 110], [150, 0, 110], ...Ir(), [-110, 36, -150], [-40, 30, -290], [120, 16, -330], [280, 6, -260], [370, 0, -120], [360, 0, 20]],
    width: 30,
    laps: 3,
    start: 0.5,
    tunnels: [[16.15, 17.85]],
    jumps: [[13.2, 13.34], [14.3, 14.5]],
    boosts: [[1.2, -5], [1.6, 5], [3.5, 0], [5.5, -6], [7.5, 6], [9.5, 0], [11.5, -5], [12.9, 0], [15.3, 5], [18.4, -4]],
    blocks: [[4.5, [-7]], [6.5, [6]], [8.5, [0]], [10.5, [-6]], [15.8, [7]], [18, [0]]],
    sliders: [[2.6, 9, 1], [12.2, 9, 1.1]],
    landmark: [0, 0],
    signs: ["CITADEL", "SOLAR DRIFT", "CLOUD 9", "WHOOSH!", "HELIX CORP", "ARCADIA", "SKYLINE", "HALO-7"],
    theme: {
      skyTop: "#0a0528",
      skyMid: "#3b1a7e",
      horizon: "#ff4fa3",
      fog: "#3e2170",
      sun: "#ffd36b",
      neonA: "#ffcc33",
      neonB: "#ff3df2",
      road: "#2a1f58",
      wall: "#3d2a80",
      ground: "#180e3a",
      building: "#3d2f80",
      cloud: "#9c7ae0",
      key: "#ffe0f4"
    }
  }],
  yt = [{
    ...ie[0],
    id: "coast-rush",
    name: "COASTLINE RUSH",
    subtitle: "Blast down the neon shore: a tunnel, two jumps and nobody in your way",
    difficulty: "EASY",
    open: !0,
    medals: [28.5, 31, 34.5],
    laps: 1,
    start: 0,
    points: [[0, 0, 0], [0, 4, -220], [80, 10, -420], [240, 14, -520], [420, 8, -480], [560, 0, -360], [620, 0, -180], [560, 6, 0], [420, 16, 120], [260, 22, 140], [120, 12, 260], [100, 0, 440], [200, 0, 600], [380, 6, 660], [560, 0, 620]],
    width: 30,
    tunnels: [[5.1, 5.8]],
    jumps: [[2.3, 2.42], [10.45, 10.6]],
    boosts: [[0.6, 0], [1.5, 6], [3.3, -6], [4.6, 0], [6.4, 5], [7.6, -5], [9.2, 0], [11.4, 6], [12.6, -6], [13.4, 0]],
    blocks: [[1.9, [-6]], [4, [6]], [6.9, [0]], [8.8, [-7]], [12.1, [5]]],
    sliders: [[3, 9, 1], [11, 9, 1.1]]
  }, {
    ...ie[1],
    id: "neon-freefall",
    name: "NEON FREEFALL",
    subtitle: "Dive from the rooftops to street level through rain, drops and glitches",
    difficulty: "MEDIUM",
    open: !0,
    medals: [26, 28, 31],
    laps: 1,
    start: 0,
    points: [[0, 70, 0], [0, 66, -200], [-100, 58, -360], [-260, 50, -420], [-400, 40, -340], [-440, 30, -180], [-360, 24, -40], [-220, 18, 20], [-120, 10, 140], [-160, 4, 300], [-300, 0, 380], [-440, 0, 480], [-400, 0, 640], [-240, 0, 700], [-80, 0, 660]],
    width: 30,
    tunnels: [[9.1, 9.8]],
    jumps: [[1.3, 1.42], [5.3, 5.45], [11.2, 11.35]],
    boosts: [[0.5, 0], [2.2, -6], [3.4, 6], [4.4, 0], [6.4, -5], [7.4, 5], [8.6, 0], [10.3, -6], [12.4, 6], [13.3, 0]],
    blocks: [[2.7, [6]], [4.9, [-6]], [7.9, [0]], [10.7, [7]], [12.9, [-6]]],
    sliders: [[6.9, 9, 1], [11.9, 9, 1.2]],
    landmark: [-250, 150]
  }, {
    ...ie[2],
    id: "skyline-ascent",
    name: "SKYLINE ASCENT",
    subtitle: "Climb a staircase of ramps and jumps up to the crown of the clouds",
    difficulty: "HARD",
    open: !0,
    medals: [27.5, 30, 33.5],
    laps: 1,
    start: 0,
    points: [[0, 0, 0], [0, 6, -200], [120, 14, -340], [300, 24, -360], [420, 34, -240], [400, 44, -80], [260, 52, 20], [100, 58, -20], [-60, 66, 40], [-160, 74, 180], [-120, 80, 340], [40, 84, 420], [220, 88, 380], [340, 92, 260], [380, 96, 100]],
    width: 30,
    tunnels: [[4.2, 4.9]],
    jumps: [[6.3, 6.45], [10.3, 10.45]],
    boosts: [[0.6, 0], [1.6, 6], [2.7, -6], [3.6, 0], [5.4, 6], [7.4, -5], [8.6, 0], [9.6, 6], [11.6, -6], [12.8, 0], [13.6, 5]],
    blocks: [[1.2, [6]], [3.2, [-6]], [5.8, [0]], [8.1, [7]], [11.2, [-6]], [13.2, [0]]],
    sliders: [[7, 9, 1], [12.4, 9, 1.1]],
    landmark: [200, 200]
  }],
  tl = [...ie, ...yt];
import * as J from "./vendor/001-three-0.185.js";
import * as Ut from "./vendor/001-three-0.185.js";
import * as g from "./vendor/001-three-0.185.js";
import { RoundedBoxGeometry as Br } from "./vendor/003-RoundedBoxGeometry.js";
var Vr = 42,
  Rt = 1.32,
  Or = 3,
  be = new g.Vector3(),
  Re = new g.Vector3(),
  xt = new g.Vector3(),
  Ft = new g.Vector3(),
  _n = new g.Matrix4(),
  No = new g.Quaternion(),
  Nr = new g.Vector3(),
  qn = 12,
  jn = 3,
  wt = 3.8,
  na = 1.2;
function Mt() {
  return {
    p: new g.Vector3(),
    t: new g.Vector3(),
    r: new g.Vector3(),
    u: new g.Vector3()
  };
}
var st = class {
    def;
    L;
    N;
    step;
    halfW;
    pos;
    tan;
    right;
    up;
    kYaw;
    kPitch;
    gap;
    tunnel;
    gapRanges = [];
    tunnelRanges = [];
    boosts = [];
    obstacles = [];
    kickers = [];
    checkpoints = [];
    open;
    startS;
    finishS;
    bounds = {
      minX: 0,
      maxX: 0,
      minZ: 0,
      maxZ: 0
    };
    cellSize = 40;
    grid = new Map();
    lengths;
    curveLength;
    sStart;
    nPoints;
    constructor(e) {
      this.def = e, this.halfW = e.width / 2, this.nPoints = e.points.length, this.open = !!e.open;
      let t = this.open,
        o = new g.CatmullRomCurve3(e.points.map(([u, m, v]) => new g.Vector3(u * Rt, m * 1.15 + Vr, v * Rt)), !t, "centripetal");
      o.arcLengthDivisions = this.nPoints * 400, this.lengths = o.getLengths(this.nPoints * 400), this.curveLength = this.lengths[this.lengths.length - 1], this.sStart = t ? 0 : this.rawS(e.start);
      let s = Math.round(this.curveLength / Or) + (t ? 1 : 0);
      this.N = s, this.L = this.curveLength, this.step = t ? this.L / (s - 1) : this.L / s, this.startS = t ? 40 : 0, this.finishS = t ? this.L - 70 : this.L;
      let a = u => t ? g.MathUtils.clamp(u, 0, s - 1) : (u % s + s) % s;
      this.pos = new Float32Array(s * 3), this.tan = new Float32Array(s * 3), this.right = new Float32Array(s * 3), this.up = new Float32Array(s * 3), this.kYaw = new Float32Array(s), this.kPitch = new Float32Array(s), this.gap = new Uint8Array(s), this.tunnel = new Uint8Array(s);
      let r = new Float32Array(s);
      for (let u = 0; u < s; u++) {
        let m = t ? u / (s - 1) : ((this.sStart + u * this.step) / this.L % 1 + 1) % 1;
        o.getPointAt(m, be), o.getTangentAt(m, Re).normalize(), this.pos.set([be.x, be.y, be.z], u * 3), this.tan.set([Re.x, Re.y, Re.z], u * 3), r[u] = Math.atan2(Re.x, -Re.z);
      }
      let l = new Float32Array(s);
      for (let u = 0; u < s; u++) {
        let m = r[a(u + 1)] - r[a(u - 1)];
        m = Math.atan2(Math.sin(m), Math.cos(m)), l[u] = m / (2 * this.step);
      }
      let i = new Float32Array(s),
        c = 9;
      for (let u = 0; u < s; u++) {
        let m = 0;
        for (let v = -c; v <= c; v++) m += l[a(u + v)];
        i[u] = g.MathUtils.clamp(m / (2 * c + 1) * 30, -0.46, 0.46);
      }
      for (let u = 0; u < s; u++) {
        Re.fromArray(this.tan, u * 3), xt.set(0, 1, 0).addScaledVector(Re, -Re.y).normalize(), Ft.crossVectors(Re, xt).normalize();
        let m = Math.cos(i[u]),
          v = Math.sin(i[u]);
        be.copy(Ft).multiplyScalar(m).addScaledVector(xt, -v), this.right.set([be.x, be.y, be.z], u * 3), be.copy(xt).multiplyScalar(m).addScaledVector(Ft, v), this.up.set([be.x, be.y, be.z], u * 3);
      }
      let p = new Float32Array(s),
        f = new Float32Array(s);
      for (let u = 0; u < s; u++) {
        let m = a(u + 1);
        Re.fromArray(this.tan, m * 3), xt.fromArray(this.right, u * 3), Ft.fromArray(this.up, u * 3), p[u] = Math.asin(g.MathUtils.clamp(Re.dot(xt), -1, 1)) / this.step, f[u] = Math.asin(g.MathUtils.clamp(Re.dot(Ft), -1, 1)) / this.step;
      }
      for (let u = 0; u < s; u++) {
        let m = 0,
          v = 0;
        for (let E = -2; E <= 2; E++) m += p[a(u + E)], v += f[a(u + E)];
        this.kYaw[u] = m / 5, this.kPitch[u] = v / 5;
      }
      for (let [u, m] of e.tunnels) this.tunnelRanges.push(...this.rangeS(u, m));
      for (let [u, m] of e.jumps) {
        let v = this.rangeS(u, m);
        this.gapRanges.push(...v), this.kickers.push(v[0][0]);
      }
      for (let u = 0; u < s; u++) {
        let m = u * this.step;
        this.gapRanges.some(([v, E]) => m >= v - 1 && m <= E + 1) && (this.gap[u] = 1), this.tunnelRanges.some(([v, E]) => m >= v && m <= E) && (this.tunnel[u] = 1);
      }
      for (let [u, m] of e.boosts) this.boosts.push({
        s: this.sOf(u),
        x: m
      });
      for (let [u, m] of e.blocks) for (let v of m) this.obstacles.push({
        s: this.sOf(u),
        x: v,
        amp: 0,
        speed: 0,
        phase: 0
      });
      e.sliders.forEach(([u, m, v], E) => this.obstacles.push({
        s: this.sOf(u),
        x: 0,
        amp: m,
        speed: v,
        phase: E * 1.7
      }));
      for (let [, u] of this.gapRanges) {
        let m = this.obstacles.map(E => this.delta(u, E.s)).filter(E => E >= -20 && E < 260);
        if (!m.length) continue;
        let v = 260 - Math.min(...m);
        for (let E of this.obstacles) {
          let M = this.delta(u, E.s);
          M >= -20 && M < 260 + v + 60 && (E.s = this.wrap(E.s + v));
        }
      }
      this.obstacles.sort((u, m) => u.s - m.s);
      for (let u = this.obstacles.length - 1; u > 0; u--) Math.abs(this.delta(this.obstacles[u - 1].s, this.obstacles[u].s)) < 170 && this.obstacles.splice(u, 1);
      !t && this.obstacles.length > 1 && Math.abs(this.delta(this.obstacles[this.obstacles.length - 1].s, this.obstacles[0].s)) < 170 && this.obstacles.pop();
      let h = this.finishS - this.startS;
      for (let u = 0; u < 4; u++) {
        let m = this.startS + h * u / 4,
          v = E => this.gap[this.index(E)] === 1 || this.tunnel[this.index(E)] === 1 || this.kickers.some(M => {
            let k = this.delta(M, E);
            return k > -70 && k < 160;
          });
        if (u > 0) for (; v(m);) m += 10;
        this.checkpoints.push(m);
      }
      let b = this.bounds;
      b.minX = b.minZ = 1 / 0, b.maxX = b.maxZ = -1 / 0;
      for (let u = 0; u < s; u++) {
        let m = this.pos[u * 3],
          v = this.pos[u * 3 + 2];
        b.minX = Math.min(b.minX, m), b.maxX = Math.max(b.maxX, m), b.minZ = Math.min(b.minZ, v), b.maxZ = Math.max(b.maxZ, v);
        let E = `${Math.floor(m / this.cellSize)},${Math.floor(v / this.cellSize)}`,
          M = this.grid.get(E);
        M ? M.push(u) : this.grid.set(E, [u]);
      }
    }
    rawS(e) {
      let t = this.lengths.length - 1,
        o = g.MathUtils.clamp(Math.round(e / (this.open ? this.nPoints - 1 : this.nPoints) * t), 0, t);
      return this.lengths[o];
    }
    sOf(e) {
      return this.wrap(this.rawS(e) - this.sStart);
    }
    rangeS(e, t) {
      let o = this.sOf(e),
        s = this.sOf(t);
      return this.open ? [[Math.min(o, s), Math.max(o, s)]] : o <= s ? [[o, s]] : [[o, this.L], [0, s]];
    }
    wrap(e) {
      return this.open ? g.MathUtils.clamp(e, 0, this.L) : (e % this.L + this.L) % this.L;
    }
    delta(e, t) {
      if (this.open) return t - e;
      let o = this.wrap(t - e);
      return o > this.L / 2 && (o -= this.L), o;
    }
    index(e) {
      return this.open ? g.MathUtils.clamp(Math.floor(this.wrap(e) / this.step), 0, this.N - 1) : Math.floor(this.wrap(e) / this.step) % this.N;
    }
    si = 0;
    sj = 0;
    sw = 0;
    seg(e) {
      let t = (Number.isFinite(e) ? this.wrap(e) : 0) / this.step,
        o = Math.floor(t);
      this.open ? (this.si = Math.min(o, this.N - 1), this.sj = Math.min(o + 1, this.N - 1)) : (this.si = o % this.N, this.sj = (this.si + 1) % this.N), this.sw = t - o;
    }
    lerp3(e, t) {
      let o = this.si * 3,
        s = this.sj * 3,
        a = this.sw;
      return t.set(e[o] + (e[s] - e[o]) * a, e[o + 1] + (e[s + 1] - e[o + 1]) * a, e[o + 2] + (e[s + 2] - e[o + 2]) * a);
    }
    frameAt(e, t) {
      return this.seg(e), this.lerp3(this.pos, t.p), this.lerp3(this.tan, t.t).normalize(), this.lerp3(this.right, t.r).normalize(), this.lerp3(this.up, t.u).normalize(), t;
    }
    yawAt(e) {
      return this.seg(e), this.kYaw[this.si] + (this.kYaw[this.sj] - this.kYaw[this.si]) * this.sw;
    }
    pitchAt(e) {
      return this.seg(e), this.kPitch[this.si] + (this.kPitch[this.sj] - this.kPitch[this.si]) * this.sw;
    }
    obstacleX(e, t) {
      return e.amp ? e.x + e.amp * Math.sin(t * e.speed + e.phase) : e.x;
    }
    isGap(e) {
      return this.gap[this.index(e)] === 1;
    }
    isTunnel(e) {
      return this.tunnel[this.index(e)] === 1;
    }
    point(e, t, o, s, a = ge) {
      return this.frameAt(e, a), s.copy(a.p).addScaledVector(a.r, t).addScaledVector(a.u, o);
    }
    nearest(e, t, o = 1) {
      let s = Math.floor(e / this.cellSize),
        a = Math.floor(t / this.cellSize),
        r = -1,
        l = 1 / 0;
      for (let i = -o; i <= o; i++) for (let c = -o; c <= o; c++) {
        let p = this.grid.get(`${s + i},${a + c}`);
        if (p) for (let f of p) {
          let h = this.pos[f * 3] - e,
            b = this.pos[f * 3 + 2] - t,
            u = h * h + b * b;
          u < l && (l = u, r = f);
        }
      }
      return {
        k: r,
        d: Math.sqrt(l)
      };
    }
    roadBelow(e, t, o, s = -1 / 0, a = 1 / 0) {
      let r = Math.floor(e / this.cellSize),
        l = Math.floor(t / this.cellSize),
        i = Math.ceil(o / this.cellSize),
        c = 1 / 0;
      for (let p = -i; p <= i; p++) for (let f = -i; f <= i; f++) {
        let h = this.grid.get(`${r + p},${l + f}`);
        if (h) for (let b of h) {
          let u = this.pos[b * 3 + 1];
          if (u < s || u > a) continue;
          let m = this.pos[b * 3] - e,
            v = this.pos[b * 3 + 2] - t;
          m * m + v * v < o * o && (c = Math.min(c, u));
        }
      }
      return c;
    }
    sweep(e, t, o, s, a = !1) {
      let r = [],
        l = [],
        i = [],
        c = e.length,
        p = [0];
      for (let b = 1; b < c; b++) p.push(p[b - 1] + Math.hypot(e[b][0] - e[b - 1][0], e[b][1] - e[b - 1][1]));
      let f = p[c - 1] || 1;
      for (let [b, u] of t) {
        let m = Math.max(1, Math.ceil((u - b) / o)),
          v = r.length / 3;
        for (let E = 0; E <= m; E++) {
          let M = b + (u - b) * E / m;
          this.frameAt(M, ge);
          for (let k = 0; k < c; k++) be.copy(ge.p).addScaledVector(ge.r, e[k][0]).addScaledVector(ge.u, e[k][1]), r.push(be.x, be.y, be.z), l.push(a ? p[k] / 4 : p[k] / f, M / s);
        }
        for (let E = 0; E < m; E++) for (let M = 0; M < c - 1; M++) {
          let k = v + E * c + M,
            x = k + c;
          i.push(k, k + 1, x, k + 1, x + 1, x);
        }
      }
      let h = new g.BufferGeometry();
      return h.setAttribute("position", new g.Float32BufferAttribute(r, 3)), h.setAttribute("uv", new g.Float32BufferAttribute(l, 2)), h.setIndex(i), h.computeVertexNormals(), h;
    }
    solidRanges() {
      let e = [...this.gapRanges].sort((s, a) => s[0] - a[0]),
        t = [],
        o = 0;
      for (let [s, a] of e) s > o && t.push([o, s]), o = Math.max(o, a);
      return o < this.L && t.push([o, this.L]), t;
    }
  },
  ge = Mt();
function Dr(n, e, t, o) {
  let s = (l, i, c, p) => {
      if (l.fillStyle = p ? "#000" : n, l.fillRect(0, 0, i, c), o === "harbor" && !p) {
        l.strokeStyle = "rgba(255,255,255,0.06)", l.lineWidth = 2;
        let f = 18;
        for (let h = 0; h < c + f; h += f * 1.5) for (let b = h / (f * 1.5) % 2 * f * 0.866; b < i + f; b += f * 1.732) {
          l.beginPath();
          for (let u = 0; u < 6; u++) {
            let m = Math.PI / 3 * u + Math.PI / 6;
            l.lineTo(b + Math.cos(m) * f, h + Math.sin(m) * f);
          }
          l.closePath(), l.stroke();
        }
      }
      if (o === "megacity") {
        let f = 11,
          h = () => (f = f * 16807 % 2147483647) / 2147483647;
        l.strokeStyle = p ? "rgba(80,200,255,0.35)" : "rgba(120,200,255,0.12)", l.fillStyle = l.strokeStyle, l.lineWidth = 2;
        for (let b = 0; b < 26; b++) {
          let u = 30 + h() * (i - 60),
            m = h() * c;
          l.beginPath(), l.moveTo(u, m);
          for (let v = 0; v < 3; v++) v % 2 ? u += (h() - 0.5) * 60 : m += 20 + h() * 60, l.lineTo(u, m);
          l.stroke(), l.fillRect(u - 3, m - 3, 6, 6);
        }
      }
      if (o === "sky" && !p) {
        l.strokeStyle = "rgba(255,214,120,0.35)", l.lineWidth = 2.5;
        for (let f = -64; f < c + 64; f += 64) for (let h = 0; h <= i; h += 64) l.beginPath(), l.moveTo(h, f), l.lineTo(h + 32, f + 32), l.lineTo(h, f + 64), l.lineTo(h - 32, f + 32), l.closePath(), l.stroke();
        l.fillStyle = "rgba(255,255,255,0.05)";
        for (let f = 0; f < 40; f++) l.fillRect(f * 97 % i, f * 181 % c, 18, 2);
      }
      p || (l.fillStyle = "rgba(0,0,0,0.18)", l.fillRect(i * 0.3, 0, i * 0.4, c)), l.fillStyle = "#0b0716", l.fillRect(0, 0, 12, c), l.fillRect(i - 12, 0, 12, c), l.fillStyle = e, l.fillRect(i - 24, 0, 6, c), l.fillStyle = t, l.fillRect(18, 0, 6, c), l.fillStyle = p ? "rgba(255,255,255,0.35)" : o === "sky" ? "#ffd76a" : "#e9e6ff";
      for (let f of [i / 3, 2 * i / 3]) if (o === "megacity") l.fillRect(f - 6, 0, 3, c), l.fillRect(f + 3, 0, 3, c);else if (o === "sky") for (let h of [c * 0.1, c * 0.6]) l.beginPath(), l.moveTo(f, h), l.lineTo(f + 8, h + 20), l.lineTo(f, h + 40), l.lineTo(f - 8, h + 20), l.closePath(), l.fill();else l.fillRect(f - 4, 0, 8, c * 0.42), p || (l.strokeStyle = "#0b0716", l.lineWidth = 3, l.strokeRect(f - 5.5, -2, 11, c * 0.42 + 2));
    },
    a = me(256, 512, (l, i, c) => s(l, i, c, !1), {
      repeat: !0,
      anisotropy: 8
    }),
    r = me(256, 512, (l, i, c) => s(l, i, c, !0), {
      repeat: !0,
      anisotropy: 8
    });
  return {
    map: a,
    emissive: r
  };
}
function ta(n, e) {
  return me(128, 256, (t, o, s) => {
    t.fillStyle = n, t.fillRect(0, 0, o, s), t.fillStyle = e;
    for (let a = 0; a < s; a += 64) t.beginPath(), t.moveTo(o * 0.2, a + 48), t.lineTo(o * 0.5, a + 16), t.lineTo(o * 0.8, a + 48), t.lineTo(o * 0.8, a + 60), t.lineTo(o * 0.5, a + 28), t.lineTo(o * 0.2, a + 60), t.closePath(), t.fill();
    t.fillStyle = "#0b0716", t.fillRect(0, 0, o, 10), t.fillRect(0, 0, 8, s);
  }, {
    repeat: !0
  });
}
function Fr() {
  return new g.ShaderMaterial({
    uniforms: {
      uTime: {
        value: 0
      }
    },
    vertexShader: `
      varying vec2 vUv; varying float vSeed;
      void main() {
        vUv = uv;
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vSeed = floor(modelMatrix[3].x * 0.37 + modelMatrix[3].z * 0.71);
        gl_Position = projectionMatrix * viewMatrix * wp;
      }`,
    fragmentShader: `
      uniform float uTime; varying vec2 vUv; varying float vSeed;
      float hash(vec2 p) { return fract(sin(dot(p, vec2(41.3, 289.1))) * 43758.5453); }
      void main() {
        float t = floor(uTime * 14.0);
        float row = floor(vUv.y * 12.0);
        float tear = (hash(vec2(row, t + vSeed)) - 0.5) * 0.3 * step(0.72, hash(vec2(row * 3.1, t)));
        vec2 g = vec2(vUv.x + tear, vUv.y);
        vec2 cell = floor(g * vec2(20.0, 11.0));
        float h = hash(cell + vec2(t * 0.37, vSeed));
        vec3 col = h < 0.34 ? vec3(0.2, 1.0, 1.0) : h < 0.67 ? vec3(1.0, 0.25, 0.9) : vec3(1.0, 0.9, 0.3);
        float on = step(0.5, hash(cell * 1.7 + t));
        float scan = 0.55 + 0.45 * step(0.5, fract(vUv.y * 36.0 - uTime * 4.0));
        float d = min(min(vUv.x, 1.0 - vUv.x), min(vUv.y, 1.0 - vUv.y));
        float border = 1.0 - smoothstep(0.015, 0.04, d);
        float a = (0.1 + on * 0.5) * scan;
        col = mix(col, vec3(1.0), border);
        a = max(a, border * 0.95);
        gl_FragColor = vec4(col * a * 1.4, a);
      }`,
    transparent: !0,
    depthWrite: !1,
    blending: g.AdditiveBlending,
    side: g.DoubleSide
  });
}
function $r(n) {
  return me(128, 128, (e, t, o) => {
    e.fillStyle = "#06101f", e.fillRect(0, 0, t, o), e.fillStyle = n;
    for (let s = 0; s < 2; s++) {
      let a = s * 64;
      e.beginPath(), e.moveTo(10, a + 56), e.lineTo(t / 2, a + 12), e.lineTo(t - 10, a + 56), e.lineTo(t - 34, a + 60), e.lineTo(t / 2, a + 34), e.lineTo(34, a + 60), e.closePath(), e.fill();
    }
    e.strokeStyle = "#ffffff", e.lineWidth = 6, e.strokeRect(3, -4, t - 6, o + 8);
  }, {
    repeat: !0
  });
}
function Ur(n = "#ffd21f") {
  return me(256, 64, (e, t, o) => {
    e.fillStyle = n, e.fillRect(0, 0, t, o), e.fillStyle = "#0b0716";
    for (let s = -o; s < t + o; s += 40) e.beginPath(), e.moveTo(s, 0), e.lineTo(s + 20, 0), e.lineTo(s + 20 + o, o), e.lineTo(s + o, o), e.closePath(), e.fill();
  }, {
    repeat: !0
  });
}
function Wr() {
  return me(256, 32, (n, e, t) => {
    for (let s = 0; s < t; s += 16) for (let a = 0; a < e; a += 16) n.fillStyle = (a / 16 + s / 16) % 2 ? "#0b0716" : "#ffffff", n.fillRect(a, s, 16, 16);
  }, {
    repeat: !0
  });
}
function $t(n, e, t = "#0b0716") {
  return me(512, 192, (o, s, a) => {
    o.fillStyle = t, o.fillRect(0, 0, s, a), o.strokeStyle = e, o.lineWidth = 10, o.strokeRect(14, 14, s - 28, a - 28), o.font = 'italic 900 88px "Arial Black", Impact, sans-serif', o.textAlign = "center", o.textBaseline = "middle";
    let r = 88;
    for (; o.measureText(n).width > s - 70 && r > 30;) r -= 4, o.font = `italic 900 ${r}px "Arial Black", Impact, sans-serif`;
    o.lineWidth = 12, o.strokeStyle = "#000", o.strokeText(n, s / 2, a / 2 + 4), o.fillStyle = e, o.fillText(n, s / 2, a / 2 + 4), o.fillStyle = "#ffffff", o.globalAlpha = 0.5, o.fillText(n, s / 2 - 3, a / 2);
  });
}
function Wn(n, e, t, o, s, a = Nr.set(1, 1, 1)) {
  return n.frameAt(e, ge), be.copy(ge.p).addScaledVector(ge.r, t).addScaledVector(ge.u, o), Re.copy(ge.t).negate(), _n.makeBasis(ge.r, ge.u, Re), No.setFromRotationMatrix(_n), s.compose(be, No, a);
}
function ut(n, e, t, o, s) {
  Wn(n, t, o, s, _n), _n.decompose(e.position, e.quaternion, e.scale);
}
function oa(n) {
  let e = n.def.theme,
    t = new g.Group(),
    o = n.halfW,
    s = n.L,
    a = s / Math.round(s / 26),
    r = n.solidRanges(),
    l = Dr(e.road, e.neonA, e.neonB, n.def.biome),
    i = new g.Mesh(n.sweep([[-o, 0], [o, 0]], r, 3, a), P(16777215, {
      map: l.map,
      emissiveMap: l.emissive,
      emissive: 16777215,
      emissiveIntensity: 0.45,
      halftone: !1
    }));
  t.add(i);
  let c = new g.Mesh(n.sweep([[o, 0], [o + 1.1, -0.2], [o + 0.9, -1.1], [o - 3, -2.6], [-o + 3, -2.6], [-o - 0.9, -1.1], [-o - 1.1, -0.2], [-o, 0]], r, 6, 20), P(e.wall, {
    side: g.DoubleSide
  }));
  t.add(c);
  let p = new g.Mesh(n.sweep([[o + 1.05, -0.35], [o + 0.95, -1.05]], r, 6, 20), te(e.neonA, 1.1)),
    f = new g.Mesh(n.sweep([[-o - 0.95, -1.05], [-o - 1.05, -0.35]], r, 6, 20), te(e.neonB, 1.1));
  t.add(p, f);
  let h = ta(e.wall, e.neonA),
    b = ta(e.wall, e.neonB);
  if (t.add(new g.Mesh(n.sweep([[o, 0], [o + 0.25, 1.35]], r, 3, 9), P(16777215, {
    map: h,
    emissiveMap: h,
    emissive: 3815994,
    side: g.DoubleSide
  })), new g.Mesh(n.sweep([[-o - 0.25, 1.35], [-o, 0]], r, 3, 9), P(16777215, {
    map: b,
    emissiveMap: b,
    emissive: 3815994,
    side: g.DoubleSide
  })), new g.Mesh(n.sweep([[o + 0.2, 1.3], [o + 0.3, 1.55], [o + 1.15, 1.55], [o + 1.1, -0.2]], r, 3, 9), new g.MeshBasicMaterial({
    color: Le,
    side: g.DoubleSide
  })), new g.Mesh(n.sweep([[-o - 1.1, -0.2], [-o - 1.15, 1.55], [-o - 0.3, 1.55], [-o - 0.2, 1.3]], r, 3, 9), new g.MeshBasicMaterial({
    color: Le,
    side: g.DoubleSide
  })), new g.Mesh(n.sweep([[o + 0.45, 1.58], [o + 0.85, 1.58]], r, 3, 9), te(e.neonA, 1)), new g.Mesh(n.sweep([[-o - 0.85, 1.58], [-o - 0.45, 1.58]], r, 3, 9), te(e.neonB, 1.15))), n.tunnelRanges.length) {
    let A = [[o + 1.2, 1.4], [o + 1.2, 7], [o - 3.5, 10.5], [-o + 3.5, 10.5], [-o - 1.2, 7], [-o - 1.2, 1.4]],
      L = A.map(([ce, ne]) => [ce + Math.sign(ce) * 1.4, ne + (ne > 8 ? 1.5 : 0)]);
    L[0][1] = L[L.length - 1][1] = -1;
    let Q = me(256, 256, (ce, ne, He) => {
      ce.fillStyle = e.wall, ce.fillRect(0, 0, ne, He), ce.fillStyle = "rgba(0,0,0,0.35)";
      for (let ct = 0; ct < He; ct += 32) ce.fillRect(0, ct, ne, 6);
    }, {
      repeat: !0
    });
    t.add(new g.Mesh(n.sweep(A, n.tunnelRanges, 3, 12), P(16777215, {
      map: Q,
      side: g.DoubleSide
    }))), t.add(new g.Mesh(n.sweep(L.slice().reverse(), n.tunnelRanges, 3, 12), P(e.building, {
      side: g.DoubleSide
    }))), t.add(new g.Mesh(n.sweep([[-o + 5, 10.4], [-o + 4, 10.4]], n.tunnelRanges, 3, 12), te(e.neonB, 1.6))), t.add(new g.Mesh(n.sweep([[o - 4, 10.4], [o - 5, 10.4]], n.tunnelRanges, 3, 12), te(e.neonA, 1.6)));
    let j = [];
    for (let [ce, ne] of n.tunnelRanges) for (let He = ce + 8; He < ne - 4; He += 14) j.push([He - 0.6, He + 0.6]);
    let Ce = A.map(([ce, ne]) => [ce * 0.985, ne * 0.98]);
    t.add(new g.Mesh(n.sweep(Ce, j, 1.2, 12), te(e.neonA, 1.3)));
    let xe = [];
    for (let [ce, ne] of n.tunnelRanges) xe.push([ce - 1.2, ce + 0.2], [ne - 0.2, ne + 1.2]);
    let ht = A.map(([ce, ne]) => [ce * 1.02, ne * 1.02 + 0.1]);
    t.add(new g.Mesh(n.sweep(ht, xe, 1.4, 12), new g.MeshBasicMaterial({
      color: Le,
      side: g.DoubleSide
    })));
    let mt = L.map(([ce, ne]) => [ce * 1.01, ne + 0.05]);
    t.add(new g.Mesh(n.sweep(mt, xe, 1.4, 12), new g.MeshBasicMaterial({
      color: new g.Color(e.neonB).multiplyScalar(1.2),
      side: g.DoubleSide
    })));
  }
  let u = Wr();
  u.repeat.set(1, 1);
  let m = [[n.startS - 1.6, n.startS + 1.6]];
  n.open && m.push([n.finishS - 1.6, n.finishS + 1.6]), t.add(new g.Mesh(n.sweep([[-o, 0.05], [o, 0.05]], m, 3.2, 3.2), P(16777215, {
    map: u,
    halftone: !1
  })));
  let v = $r(e.neonA),
    E = new g.MeshBasicMaterial({
      map: v,
      color: new g.Color(1.35, 1.35, 1.35)
    });
  for (let A of n.boosts) t.add(new g.Mesh(n.sweep([[A.x - jn, 0.06], [A.x + jn, 0.06]], [[A.s - qn, A.s + qn]], 1.5, 6), E));
  let M = Fr(),
    k = new g.PlaneGeometry(wt * 2, 4.4);
  k.translate(0, 2.5, 0);
  let x = new g.PlaneGeometry(wt * 2, 2.2);
  x.rotateX(-Math.PI / 2), x.translate(0, 0.12, 0);
  let B = new g.OctahedronGeometry(0.75, 0);
  B.scale(1, 1.5, 1);
  let O = P("#1b1330"),
    z = new g.TorusGeometry(0.62, 0.12, 6, 20),
    I = [],
    W = [],
    U = new Set();
  for (let A of n.obstacles) {
    let L = new g.Group();
    U.add(L), L.add(new g.Mesh(k, M), new g.Mesh(x, M));
    for (let Q of [-1, 1]) {
      let j = new g.Group();
      j.add(X(new g.Mesh(B, O), 0.07));
      let Ce = new g.Mesh(z, te(A.amp ? "#ff4fd8" : e.neonA, 1.8));
      Ce.rotation.y = Math.PI / 2, j.add(Ce), j.position.set(Q * (wt + 0.6), 2.6, 0), L.add(j), W.push(j);
    }
    ut(n, L, A.s, A.x, 0), t.add(L), A.amp && I.push({
      mesh: L,
      o: A
    });
  }
  let ue = Ur(),
    S = P(16777215, {
      map: ue,
      emissive: 3351040,
      halftone: !1
    });
  for (let A of n.kickers) {
    t.add(new g.Mesh(n.sweep([[-o, 0.07], [o, 0.07]], [[A - 9, A]], 1, 3), S));
    let L = new g.Mesh(new g.PlaneGeometry(10, 4), new g.MeshBasicMaterial({
      map: $t("\u25B2 JUMP \u25B2", "#ffd21f"),
      transparent: !0
    }));
    ut(n, L, A - 40, 0, 11), t.add(L);
  }
  let G = [],
    $ = P("#2a1a3a"),
    q = te("#ff2a3a", 3),
    he = te("#3dff7a", 3),
    qe = n.open ? [...n.checkpoints, n.finishS] : n.checkpoints,
    Oe = P("#1b1330"),
    ve = P(e.building),
    le = P(16777215, {
      map: u,
      halftone: !1
    });
  qe.forEach((A, L) => {
    let Q = n.open && L === qe.length - 1,
      j = new g.Group(),
      Ce = o + 2.4,
      xe = L === 0 ? 15 : 13.5,
      ht = L === 0 ? Oe : ve;
    for (let ne of [-1, 1]) {
      j.add(X(new g.Mesh(new Br(1.8, xe, 1.8, 2, 0.3), ht), 0.12)), j.children[j.children.length - 1].position.set(ne * Ce, xe / 2 - 1, 0);
      let He = new g.Mesh(new g.BoxGeometry(0.3, xe - 2, 0.3), te(ne < 0 ? e.neonB : e.neonA, 1.4));
      He.position.set(ne * (Ce - 0.95), xe / 2 - 1, 0.7), j.add(He);
    }
    let mt = X(new g.Mesh(new g.BoxGeometry(Ce * 2 + 1.8, 3, 1.6), ht), 0.12);
    mt.position.set(0, xe - 1, 0), j.add(mt);
    let ce = new g.Mesh(new g.PlaneGeometry(Ce * 1.3, 2.4), new g.MeshBasicMaterial({
      map: $t(Q ? "FINISH" : L === 0 ? n.def.name : `CHECKPOINT ${L}`, L === 0 || Q ? "#ffe14d" : e.neonA),
      color: new g.Color(1.15, 1.15, 1.15)
    }));
    if (ce.position.set(0, xe - 1, 0.82), j.add(ce), Q) {
      let ne = new g.Mesh(new g.PlaneGeometry(Ce * 2 + 1.8, 1.2), le);
      ne.position.set(0, xe + 1.05, 0.82), j.add(ne);
    }
    if (L === 0) {
      let ne = new g.Mesh(new g.PlaneGeometry(Ce * 2 + 1.8, 1.2), le);
      ne.position.set(0, xe + 1.05, 0.82), j.add(ne);
      for (let He = 0; He < 5; He++) {
        let ct = X(new g.Mesh(new g.SphereGeometry(0.6, 14, 10), $), 0.08);
        ct.position.set((He - 2) * 2.4, xe - 3.3, 0.9), j.add(ct), G.push(ct), U.add(ct);
      }
    }
    ut(n, j, A, 0, 0), t.add(j);
  });
  let se = new g.TorusGeometry(o + 5, 0.45, 8, 56, Math.PI),
    w = 0;
  for (let A = 120; A < s - 60 && w < 9; A += 37) {
    let L = n.index(A);
    if (n.tunnel[L] || n.gap[L] || Math.abs(n.kYaw[L]) > 0.004 || n.checkpoints.some(j => Math.abs(n.delta(j, A)) < 50)) continue;
    let Q = new g.Mesh(se, te(w % 2 ? e.neonA : e.neonB, 1.25));
    ut(n, Q, A, 0, -1), t.add(Q), w++, A += 160;
  }
  let y = [],
    T = [];
  for (let A = 10; A < s; A += 34) {
    let L = n.index(A);
    if (n.tunnel[L] || n.gap[L]) continue;
    n.frameAt(A, ge);
    let Q = ge.p.y - 2.6;
    Q < 4 || n.roadBelow(ge.p.x, ge.p.z, o + 8, -1 / 0, Q - 4) < 1 / 0 || (y.push(new g.Matrix4().compose(xt.set(ge.p.x, Q / 2, ge.p.z), No.identity(), Ft.set(2.2, Q, 2.2))), T.push(Wn(n, A, 0, -2.6, new g.Matrix4(), new g.Vector3(o * 1.2, 1.4, 2.6))));
  }
  let F = new g.InstancedMesh(new g.CylinderGeometry(0.5, 0.62, 1, 10), P(e.wall), y.length);
  y.forEach((A, L) => F.setMatrixAt(L, A)), F.frustumCulled = !1, X(F, 0.08);
  let Y = new g.InstancedMesh(new g.BoxGeometry(1, 1, 1), P(e.wall), T.length);
  T.forEach((A, L) => Y.setMatrixAt(L, A)), Y.frustumCulled = !1, X(Y, 0.06), t.add(F, Y);
  let Te = [],
    Gt = [],
    Ts = [],
    Fa = new g.Color(e.neonA),
    $a = new g.Color(e.neonB),
    xs = 0;
  for (let [A, L] of r) for (let Q = A + 6; Q < L - 3; Q += 16) if (!n.tunnel[n.index(Q)]) {
    for (let j of [-1, 1]) Te.push(Wn(n, Q, j * (o + 0.7), 3.2, new g.Matrix4(), new g.Vector3(0.35, 3.4, 0.35))), Gt.push(Wn(n, Q, j * (o - 0.2), 4.9, new g.Matrix4(), new g.Vector3(1.9, 0.3, 0.6))), Ts.push(((xs + (j > 0 ? 1 : 0)) % 2 ? Fa : $a).clone());
    xs++;
  }
  let To = new g.InstancedMesh(new g.BoxGeometry(1, 1, 1), new g.MeshBasicMaterial({
    color: Le
  }), Te.length);
  Te.forEach((A, L) => To.setMatrixAt(L, A)), To.frustumCulled = !1;
  let Sn = new g.InstancedMesh(new g.BoxGeometry(1, 1, 1), new g.MeshBasicMaterial({
    color: new g.Color(1.1, 1.1, 1.1)
  }), Gt.length);
  Gt.forEach((A, L) => {
    Sn.setMatrixAt(L, A), Sn.setColorAt(L, Ts[L]);
  }), Sn.frustumCulled = !1, t.add(To, Sn);
  let ws = n.def.signs,
    Rs = new g.MeshBasicMaterial({
      color: Le
    }),
    Bt = 0;
  for (let A = 90; A < s - 40 && Bt < 16; A += 150) {
    let L = n.index(A);
    if (n.tunnel[L]) continue;
    let Q = Bt % 2 ? 1 : -1,
      j = new g.Group(),
      Ce = Bt % 3 === 0 ? e.neonA : Bt % 3 === 1 ? e.neonB : "#ffe14d",
      xe = new g.Mesh(new g.PlaneGeometry(14, 5.25), new g.MeshBasicMaterial({
        map: $t(ws[Bt % ws.length], Ce),
        color: new g.Color(1.05, 1.05, 1.05),
        side: g.DoubleSide
      })),
      ht = new g.Mesh(new g.BoxGeometry(14.8, 6, 0.5), Rs);
    ht.position.z = -0.3;
    let mt = new g.Mesh(new g.BoxGeometry(0.6, 9, 0.6), Rs);
    mt.position.y = -7, j.add(xe, ht, mt), ut(n, j, A, Q * (o + 12), 10), j.rotateY(-Q * 0.35), t.add(j), Bt++;
  }
  return In(t, U), {
    group: t,
    update: A => {
      v.offset.y = -A * 2.2, M.uniforms.uTime.value = A;
      for (let L = 0; L < W.length; L++) W[L].position.y = 2.6 + Math.sin(A * 3 + L) * 0.25, W[L].rotation.y = A * 2 + L;
    },
    updateObstacles: A => {
      for (let {
        mesh: L,
        o: Q
      } of I) ut(n, L, Q.s, n.obstacleX(Q, A), 0);
    },
    startLamps: G,
    setLamps: (A, L) => {
      G.forEach((Q, j) => {
        Q.material = L ? he : j < A ? q : $;
      });
    }
  };
}
function aa(n) {
  let e = n.track,
    t = e.N,
    o = new Float32Array(t),
    s = e.halfW - 4.5;
  for (let r = 0; r < t; r++) {
    let l = 0;
    for (let i = 4; i < 22; i++) l += e.kYaw[e.open ? Math.min(r + i, t - 1) : (r + i) % t];
    o[r] = Ut.MathUtils.clamp(l / 18 * 950, -1, 1) * s;
  }
  let a = new Float32Array(t);
  for (let r = 0; r < t; r++) {
    let l = 0;
    for (let i = -7; i <= 7; i++) l += o[e.open ? Math.min(Math.max(r + i, 0), t - 1) : (r + i + t) % t];
    a[r] = l / 15;
  }
  return a;
}
var Do = wt + 1.7 + 0.8,
  un = [],
  Kn = [];
function sa(n, e, t, o, s, a) {
  let r = e.track,
    l = 0;
  for (let f of r.obstacles) {
    let h = r.delta(n.s, f.s);
    if (Math.abs(h - t) > 10) continue;
    let b = e.time + Math.max(0, h) / Math.max(25, s),
      u = r.obstacleX(f, b),
      m = f.amp ? Math.abs(f.amp * f.speed * Math.cos(b * f.speed + f.phase)) * 0.25 : 0,
      v = l++;
    for (; v > 0 && un[v - 1] > u - Do - m;) un[v] = un[v - 1], Kn[v] = Kn[v - 1], v--;
    un[v] = u - Do - m, Kn[v] = u + Do + m;
  }
  let i = o,
    c = 1 / 0,
    p = -a;
  for (let f = 0; f <= l; f++) {
    let h = p,
      b = f < l ? Math.min(un[f], a) : a;
    if (b - h >= 0.5) {
      let u = Ut.MathUtils.clamp(o, h, b),
        m = Math.abs(u - o) + Math.abs(u - n.x) * 0.4;
      m < c && (c = m, i = u);
    }
    f < l && (p = Math.max(p, Kn[f]));
  }
  return i;
}
function ra(n, e, t) {
  let o = e.track,
    s = n.input,
    a = Math.max(0, n.vf),
    r = 16 + a * 0.3,
    l = o.halfW - 3.3,
    i = e.line[o.index(n.s + r * 0.7)] + n.aiLane,
    c = n.aiSkill > 0.94,
    p = n.rubber < n.aiSkill * 0.95;
  if (!p && (c || n.id % 2 === 0)) for (let z of o.boosts) {
    let I = o.delta(n.s, z.s);
    I > 10 && I < 120 && (i = z.x);
  }
  for (let z of e.racers) {
    if (z === n) continue;
    let I = o.delta(n.s, z.s);
    if (I > 0 && I < 28 && Math.abs(z.x - i) < 3.6 && z.vf < n.vf + 4) {
      let W = z.x + o.halfW,
        U = o.halfW - z.x;
      i = z.x + (U > W ? 3.8 : -3.8);
    }
  }
  let f = r,
    h = 1 / 0,
    b = 1 / 0;
  for (let z of o.obstacles) {
    let I = o.delta(n.s, z.s);
    I <= -2 || I >= 60 + a * 1.4 || (I < h - 10 ? (Math.abs(I - h) > 10 && (b = h), h = I) : Math.abs(I - h) > 10 && I < b && (b = I));
  }
  if (h < 1 / 0) {
    let z = b < 1 / 0 && b - h < 160 ? sa(n, e, b, i, a, l) : i,
      I = sa(n, e, h, z, a, l);
    (Math.abs(I - i) > 0.1 || Math.abs(I - n.x) > 1) && (f = Ut.MathUtils.clamp(h * 0.75, 8, r)), i = I;
  }
  i = Ut.MathUtils.clamp(i, -l, l);
  let u = 0;
  for (let z = 0; z < 6; z++) u += o.yawAt(n.s + r * z / 6);
  u /= 6;
  let m = Math.max(0.3, n.turnRateAt(a)),
    v = u * a / m,
    E = Math.atan2(i - n.x, f);
  s.steer = Ut.MathUtils.clamp(v + (E - n.psi) * 2.6 - n.yawVel * 0.12, -1, 1);
  let M = 0,
    k = 25 + a * 1.25;
  for (let z = 10; z < k; z += 8) M = Math.max(M, Math.abs(o.yawAt(n.s + z)));
  let x = a > 50,
    B = m * (x ? 1.3 : 1),
    O = M > 1e-4 ? B / M * (0.92 + n.aiSkill * 0.1) : 1 / 0;
  if (s.throttle = a > O * 1.05 ? -0.7 : a > O ? 0.2 : 1, f < r && Math.abs(i - n.x) > 3 && f < 40 && a > 60 && (s.throttle = Math.min(s.throttle, 0.1)), s.drift = x && (n.drifting ? Math.abs(v) > 0.7 && Math.sign(v) === n.driftDir : Math.abs(v) > 0.95), s.turbo = n.turboCharge >= 1 && !p && Math.abs(u) < 0.002 && n.turboT <= 0 && Math.random() < t * 0.6, e.running && a < 6) {
    if (n.aiStuck += t, n.aiStuck > 2.2) {
      n.aiStuck = 0;
      let z = 0,
        I = -1;
      for (let W of [-10, -5, 0, 5, 10]) {
        let U = 99;
        for (let ue of o.obstacles) Math.abs(o.delta(n.s, ue.s)) < 20 && (U = Math.min(U, Math.abs(o.obstacleX(ue, e.time) - W)));
        U > I && (I = U, z = W);
      }
      n.x = z, n.psi = 0, n.vf = 20;
    }
  } else n.aiStuck = 0;
}
import * as Wt from "./vendor/001-three-0.185.js";
var hn = 1.15,
  Fo = 34,
  _r = 150,
  qr = 16,
  jr = 3.4,
  Ht = class {
    id;
    name;
    isPlayer;
    spec;
    livery;
    color;
    visual;
    trails;
    vapor;
    wasBoosting = !1;
    input = {
      throttle: 0,
      steer: 0,
      drift: !1,
      turbo: !1
    };
    s = 0;
    x = 0;
    h = hn;
    vf = 0;
    vr = 0;
    vh = 0;
    psi = 0;
    yawVel = 0;
    dist = 0;
    lastGroundS = 0;
    airborne = !1;
    airTime = 0;
    boostT = 0;
    turboT = 0;
    turboCharge = 0;
    drifting = !1;
    driftDir = 0;
    driftT = 0;
    spinT = 0;
    invulnT = 0;
    slowT = 0;
    wallT = 0;
    wallHits = 0;
    glitchHits = 0;
    inGlitch = !1;
    glitchT = 0;
    remote = !1;
    bot = !1;
    offRoad = !1;
    dnf = !1;
    netId = "";
    lap = 0;
    finished = !1;
    finishTime = 0;
    place = 1;
    lapStart = 0;
    bestLap = 1 / 0;
    lastLap = 0;
    cpNext = 1;
    aiSkill = 1;
    rubber = 1;
    aiLane = 0;
    aiStuck = 0;
    aiAcc = 0;
    impact = 0;
    landing = 0;
    scrape = 0;
    steerVis = 0;
    constructor(e, t, o, s, a) {
      this.id = e, this.name = t, this.isPlayer = o, this.spec = s, this.livery = a, this.color = new Wt.Color(a.main), this.visual = sn(s.id, a), this.trails = this.visual.exhausts.slice(0, 2).map(() => new fn(new Wt.Color(a.glow))), this.vapor = this.visual.tips.map(() => new fn(new Wt.Color(0.55, 0.6, 0.7), 16));
    }
    get speed() {
      return Math.hypot(this.vf, this.vr);
    }
    turnRateAt(e) {
      let t = this.spec.top;
      return this.spec.turn * (1 - 0.36 * Math.min(1, e / t)) * Math.min(1, 0.35 + e / 25);
    }
    maxSpeed() {
      let e = 0;
      this.boostT > 0 && (e = 0.12), this.turboT > 0 && (e = Math.max(e, 0.18));
      let t = this.spec.top * (1 + e) * this.rubber;
      return this.slowT > 0 && (t *= 0.7), t;
    }
    place0(e, t, o) {
      this.s = e.wrap(t), this.x = o, this.h = hn, this.vf = this.vr = this.vh = 0, this.psi = 0, this.yawVel = 0, this.lastGroundS = this.s;
    }
    step(e, t, o) {
      this.impact = 0, this.landing = 0, this.scrape = 0, this.boostT = Math.max(0, this.boostT - t), this.turboT = Math.max(0, this.turboT - t), this.invulnT = Math.max(0, this.invulnT - t), this.spinT = Math.max(0, this.spinT - t), this.slowT = Math.max(0, this.slowT - t);
      let s = this.input,
        a = o && this.spinT <= 0,
        r = a ? s.throttle : 0,
        l = this.speed,
        i = !this.airborne,
        c = a && s.drift && l > 35 && i;
      c && !this.drifting && Math.abs(s.steer) > 0.3 && (this.drifting = !0, this.driftDir = Math.sign(s.steer), this.driftT = 0);
      let p = 0;
      if (this.drifting && (!c || l < 25) && (this.drifting = !1, p = this.driftT), this.drifting && (this.driftT += t * (0.6 + 0.6 * Math.abs(s.steer))), p > 0.55) {
        let se = p > 2.1 ? 3 : p > 1.25 ? 2 : 1;
        this.boostT = Math.max(this.boostT, [0, 0.55, 0.9, 1.35][se]), this.turboCharge = Math.min(3, this.turboCharge + [0, 0.25, 0.45, 0.7][se]), this.vf += [0, 2, 3.5, 5][se], this.driftBoostLevel = se;
      }
      let f = a ? s.steer : 0,
        h = this.turnRateAt(l);
      if (this.drifting) {
        let se = f * this.driftDir;
        f = this.driftDir * (0.55 + 0.45 * Math.max(-0.4, se) + 0.35), h *= 1.3;
      }
      i || (h *= 0.45);
      let b = f * h;
      this.yawVel += (b - this.yawVel) * Math.min(1, t * 9), this.spinT > 0 && (this.yawVel = 0), this.psi += this.yawVel * t;
      let u = Math.cos(this.psi),
        m = Math.sin(this.psi),
        v = this.vf * u + this.vr * m,
        E = -this.vf * m + this.vr * u,
        M = this.maxSpeed(),
        k = i ? 1 : 0.35;
      if (r > 0) {
        if (v < M) {
          let se = Math.max(0, v / M);
          v += this.spec.accel * r * (1 - se * se) * k * t;
        }
      } else r < 0 ? (v += (v > 0 ? -95 : -22) * -r * t, v = Math.max(v, -22)) : v -= v * 0.45 * t;
      (this.boostT > 0 || this.turboT > 0) && (v += this.spec.accel * 0.45 * t), v > M && (v -= (v - M) * 0.9 * t), this.spinT > 0 && (v -= v * 1.8 * t);
      let x = this.drifting ? 2.4 : i ? 9 : 0.6,
        B = E * (1 - Math.exp(-x * t));
      E -= B, !this.drifting && i && v > 0 && (v += Math.abs(B) * 0.25), this.vf = v * u - E * m, this.vr = v * m + E * u;
      let O = e.yawAt(this.s),
        z = e.pitchAt(this.s),
        I = Wt.MathUtils.clamp(1 - O * this.x, 0.6, 1.4),
        W = this.vf * t / I;
      this.s = e.wrap(this.s + W), this.dist += W, this.x += this.vr * t;
      let U = O * W,
        ue = Math.cos(U),
        S = Math.sin(U),
        G = this.vf * ue + this.vr * S;
      this.vr = this.vr * ue - this.vf * S, this.vf = G, this.psi -= U, this.psi = Math.atan2(Math.sin(this.psi), Math.cos(this.psi));
      let $ = z * W,
        q = Math.cos($),
        he = Math.sin($),
        qe = this.vf * q + this.vh * he;
      this.vh = this.vh * q - this.vf * he, this.vf = qe, e.frameAt(this.s, Yn);
      let Oe = e.isTunnel(this.s);
      this.offRoad = !Oe && Math.abs(this.x) > e.halfW + 0.4;
      let ve = e.isGap(this.s) || this.offRoad;
      this.vh -= Fo * Yn.u.y * t, this.vf -= Fo * 0.35 * Yn.t.y * t, this.vr -= Fo * 0.25 * Yn.r.y * t, !ve && this.h < jr && (this.vh += (_r * (hn - this.h) - qr * this.vh) * t), this.h += this.vh * t, !ve && this.h < 0.35 && this.h > -1.2 && (this.vh < -9 && (this.landing = -this.vh), this.h = 0.35, this.vh < 0 && (this.vh = 0)), Oe && this.h > 7.5 && (this.h = 7.5, this.vh = Math.min(0, this.vh)), this.airborne = this.h > 2.4 || ve, this.airTime = this.airborne ? this.airTime + t : 0, !ve && this.h < 2 && (this.lastGroundS = this.s);
      let le = e.halfW - 1.9;
      if (!ve && Math.abs(this.x) > le && (this.h < 4 || Oe)) {
        let se = Math.sign(this.x);
        this.x = se * le;
        let w = this.vr * se;
        this.x = se * (le - 0.05), w > 0 && (this.impact = w, this.vf *= 1 - Math.min(0.06, w / 500), w > 12 && this.wallT <= 0 && this.wallHits++), this.vr = -se * Math.max(3, w * 0.2), this.psi * se > 0 && (this.psi *= 0.8), this.yawVel * se > 0 && (this.yawVel *= 0.6), this.scrape = Math.max(2, this.speed * 0.2), this.vf *= 1 - 0.12 * t, this.wallT = 0.12;
      }
      this.wallT = Math.max(0, this.wallT - t), this.steerVis += ((a ? s.steer : 0) - this.steerVis) * Math.min(1, t * 6);
    }
    driftBoostLevel = 0;
    get driftLevel() {
      return this.drifting ? this.driftT > 2.1 ? 3 : this.driftT > 1.25 ? 2 : this.driftT > 0.55 ? 1 : 0 : 0;
    }
  },
  Yn = Mt();
function ia(n, e, t) {
  for (let a = 0; a < e.length; a++) {
    let r = e[a];
    if (!r.remote) for (let l = a + 1; l < e.length; l++) {
      let i = e[l];
      if (i.remote) continue;
      let c = n.delta(r.s, i.s);
      if (Math.abs(c) > 5.2) continue;
      let p = i.x - r.x;
      if (Math.abs(p) > 3.4 || Math.abs(i.h - r.h) > 2.6) continue;
      let f = 5.2 - Math.abs(c),
        h = 3.4 - Math.abs(p),
        b = r.spec.mass,
        u = i.spec.mass,
        m = u / (b + u),
        v = b / (b + u),
        E;
      if (h / 3.4 < f / 5.2) {
        let M = Math.sign(p) || 1;
        r.x -= M * h * m, i.x += M * h * v;
        let k = (r.vr - i.vr) * M;
        if (E = Math.max(0, k), k > 0) {
          let x = k * 1.05;
          r.vr -= M * x * m, i.vr += M * x * v;
        }
      } else {
        let M = Math.sign(c) || 1,
          k = M > 0 ? r : i,
          x = M > 0 ? i : r,
          B = M > 0 ? m : v,
          O = M > 0 ? v : m;
        k.s = n.wrap(k.s - f * B), k.dist -= f * B, x.s = n.wrap(x.s + f * O), x.dist += f * O;
        let z = k.vf - x.vf;
        if (E = Math.max(0, z), z > 0) {
          let I = z * 0.8;
          k.vf -= I * B, x.vf += I * O * 0.9;
        }
      }
      E > 3 && t(r, i, E);
    }
  }
}
var ua = {
    sound() {},
    shake() {},
    flash() {},
    glitch() {},
    sonic() {},
    message() {},
    finish() {},
    rivalFinish() {}
  },
  mn = [{
    name: "ROOKIE",
    skill: 0.86
  }, {
    name: "PRO",
    skill: 0.93
  }, {
    name: "ELITE",
    skill: 0.985
  }],
  $o = ["KIRA VOLT", "REX BYTE", "LUMA RAY", "TITO TURBO", "MIKA ZEN", "DAX NITRO", "IVY GLITCH", "NOVA KAI"],
  la = ["GLITCH!", "ERR0R!", "LAG!", "404!", "BZZT!"],
  ha = [5e3, 3600, 2600, 1900, 1400, 1e3, 700, 450],
  de = new J.Vector3(),
  Uo = new J.Vector3(),
  kt = new J.Vector3(),
  ca = new J.Matrix4(),
  pa = new J.Vector3(),
  da = new J.Quaternion(),
  Kr = new J.Color(2.2, 1.5, 0.5),
  Yr = [new J.Color(0, 0, 0), new J.Color(0.5, 1.4, 2.4), new J.Color(2.4, 1.2, 0.3), new J.Color(2.2, 0.5, 2)],
  fa = new J.Color(0.5, 1.8, 2.2),
  Xr = [new J.Color(0.3, 2, 2), new J.Color(2, 0.4, 1.8), new J.Color(2, 1.8, 0.5)],
  bn = 8,
  _t = class n {
    track;
    visuals;
    fx;
    hooks;
    demo;
    online;
    group = new J.Group();
    racers = [];
    player;
    line;
    frame = Mt();
    laps;
    trial;
    lapLen;
    recordSplits = null;
    cpTimes = new Map();
    viewer = null;
    hulls = new Map();
    phase = "intro";
    introT = 2.6;
    countdownT = 3.6;
    time = 0;
    clock = 0;
    running = !1;
    playerFinished = !1;
    wrongWayT = 0;
    lastCount = -1;
    prevS = [];
    prevTurbo = [];
    startPress = -1;
    constructor(e, t, o, s, a, r, l = !1, i) {
      this.track = e, this.visuals = t, this.fx = o, this.hooks = s, this.demo = l, this.online = !!i, this.trial = e.open && !i, this.lapLen = e.finishS - e.startS, this.laps = l ? 999 : e.def.laps;
      let c = Z[a],
        p = Ee.map((x, B) => B).filter(x => x !== c.livery),
        f = [];
      for (let x = 0; x < 7; x++) f.push(Z[(a + 1 + x) % Z.length]);
      let h = i ? i.order.length : 0,
        b = Math.min(bn - h, 4),
        u = i ? b + Math.max(0, i.order.findIndex(x => x.id === i.selfId)) : this.trial ? 0 : 5,
        m = i ? bn : this.trial ? l ? 4 : 1 : 8,
        v = new Set(),
        E = [];
      i && i.order.forEach((x, B) => {
        let O = (Z[x.ship] ?? Z[0]).livery;
        for (; v.has(O);) O = (O + 1) % Ee.length;
        v.add(O), E[B] = O;
      });
      let M = Ee.map((x, B) => B).filter(x => !v.has(x)),
        k = 0;
      for (let x = 0; x < m; x++) {
        if (i) {
          let O = x - b;
          if (O >= 0 && O < h) {
            let I = i.order[O],
              W = I.id === i.selfId,
              U = new Ht(x, W ? "YOU" : I.name.toUpperCase(), W, Z[I.ship] ?? Z[0], Ee[E[O]]);
            U.remote = !W, U.netId = I.id, this.addToGrid(U, x);
            continue;
          }
          let z = new Ht(x, $o[k], !1, Z[(k + 1) % Z.length], Ee[M[k % M.length]]);
          z.bot = !0, z.remote = !0, z.netId = `cpu-${x}`, z.aiSkill = z.rubber = mn[1].skill + (k % 3 - 1) * 0.02, z.aiLane = (x % 3 - 1) * 2, k++, this.addToGrid(z, x);
          continue;
        }
        let B;
        if (x === u) B = new Ht(x, l ? $o[7] : "YOU", !l, c, Ee[c.livery]), l && (B.aiSkill = B.rubber = 0.95);else {
          B = new Ht(x, $o[k], !1, f[k], Ee[p[k % p.length]]);
          let O = mn[r].skill;
          B.aiSkill = O + (k % 3 - 1) * 0.02 + (x < u ? 0.01 : 0), B.rubber = B.aiSkill, k++;
        }
        B.aiLane = (x % 3 - 1) * 2, this.addToGrid(B, x);
      }
      this.player = this.racers[u], this.line = aa(this), this.updatePlaces();
      for (let x of this.racers) this.placeVisual(x, 0, 0), x.visual.exhausts.slice(0, 2).forEach((B, O) => x.trails[O].reset(x.visual.body.localToWorld(de.copy(B))));
      t.setLamps(0, !1), l && (this.phase = "running", this.running = !0, t.setLamps(5, !0));
    }
    addToGrid(e, t) {
      let o = this.track,
        s = Math.floor(t / 2),
        a = this.trial && !this.demo ? 0 : t % 2 ? 1 : -1,
        r = o.open ? o.startS : o.L;
      e.place0(o, r - 14 - s * 12, a * 6), e.dist = -(r - e.s), this.racers.push(e), this.cpTimes.set(e, []), this.group.add(e.visual.root);
      for (let l of [...e.trails, ...e.vapor]) this.group.add(l.mesh);
      this.prevS.push(e.s), this.prevTurbo.push(!1);
    }
    snapshot() {
      let e = this.player;
      return {
        t: this.clock,
        d: e.dist,
        x: e.x,
        h: e.h,
        p: e.psi,
        f: e.vf,
        r: e.vr,
        st: e.steerVis,
        dr: e.drifting ? e.driftDir : 0,
        b: e.boostT > 0 || e.turboT > 0 ? 1 : 0
      };
    }
    applyRemote(e, t) {
      e.dist = t.d, e.s = this.track.wrap(t.d), e.x = t.x, e.h = t.h, e.psi = t.p, e.vf = t.f, e.vr = t.r, e.steerVis = t.st, e.drifting = t.dr !== 0, t.dr && (e.driftDir = t.dr), e.boostT = t.b ? 0.2 : 0, e.input.throttle = 1;
    }
    setBotOwner(e) {
      let t = !1;
      return this.racers.forEach((o, s) => {
        !o.bot || o.dnf || o.remote !== e || (t = !0, o.remote = !e, e && (o.vh = 0, o.aiAcc = 0, o.cpNext = Math.max(1, this.checkpointsBefore(o.dist)), o.lastGroundS = o.s, this.prevS[s] = o.s));
      }), t;
    }
    checkpointsBefore(e) {
      let t = this.track.checkpoints,
        o = Math.floor(e / this.lapLen),
        s = e - o * this.lapLen,
        a = o * t.length;
      for (let r of t) r - this.track.startS <= s && a++;
      return a;
    }
    botSnaps() {
      let e = [];
      for (let t of this.racers) !t.bot || t.remote || t.dnf || e.push([t.id, t.dist, t.x, t.h, t.psi, t.vf, t.vr, t.steerVis, t.drifting ? t.driftDir : 0, t.boostT > 0 || t.turboT > 0 ? 1 : 0]);
      return e;
    }
    remoteById(e) {
      return this.racers.find(t => t.remote && t.netId === e);
    }
    markFinished(e, t) {
      let o = this.remoteById(e);
      !o || o.finished || (o.finished = !0, o.finishTime = t, o.lap = this.laps + 1, this.updatePlaces());
    }
    dropRacer(e) {
      let t = this.remoteById(e);
      if (!(!t || t.dnf)) {
        t.dnf = !0, t.visual.root.visible = !1;
        for (let o of [...t.trails, ...t.vapor]) o.mesh.visible = !1;
        this.updatePlaces();
      }
    }
    world(e, t, o, s) {
      return this.track.point(e.s, e.x + t, e.h + o, s, this.frame);
    }
    sound(e, t, o = 1) {
      t.isPlayer ? this.hooks.sound(e, null, o) : this.hooks.sound(e, this.world(t, 0, 0, Uo), o);
    }
    respawn(e, t) {
      let o = e.s;
      e.place0(this.track, t, 0), e.dist += this.track.delta(o, e.s), e.h = hn + 1.5, e.vf = 30, e.invulnT = 2, e.spinT = 0, this.placeVisual(e, 0, 0), e.trails.forEach((s, a) => s.reset(e.visual.body.localToWorld(de.copy(e.visual.exhausts[a])))), e.vapor.forEach((s, a) => s.reset(e.visual.body.localToWorld(de.copy(e.visual.tips[a])))), this.prevS[this.racers.indexOf(e)] = e.s, e.isPlayer && this.hooks.sound("respawn", null);
    }
    velocityOf(e, t) {
      return this.track.frameAt(e.s, this.frame), t.copy(this.frame.t).multiplyScalar(e.vf).addScaledVector(this.frame.r, e.vr).addScaledVector(this.frame.u, e.vh);
    }
    glitches(e) {
      let t = e.inGlitch;
      if (e.inGlitch = !1, e.h > 5) return;
      let o = this.track;
      for (let s of o.obstacles) if (!(Math.abs(o.delta(s.s, e.s)) > na + 1.5) && !(Math.abs(e.x - o.obstacleX(s, this.time)) > wt + 0.9)) {
        e.inGlitch = !0;
        break;
      }
      if (!(!e.inGlitch || t)) {
        e.glitchHits++, e.vf *= 0.74, e.slowT = Math.max(e.slowT, 1.1), e.boostT = 0, e.glitchT = 0.9, this.world(e, 0, 1, de);
        for (let s = 0; s < 3; s++) this.fx.burst(de, Xr[s], 10, 12, 1.2, 0.5);
        this.sound("glitch", e, 0.8), e.isPlayer && (this.fx.popup(de, la[Math.floor(Math.random() * la.length)], "#ff4fd8"), this.hooks.glitch(0.9));
      }
    }
    update(e, t) {
      let o = this.track;
      if (this.phase === "intro") this.introT -= e, this.introT <= 0 && (this.phase = "countdown");else if (this.phase === "countdown") {
        this.countdownT -= e;
        let i = Math.min(5, Math.floor((3.6 - this.countdownT) / 0.72) + 1);
        if (i !== this.lastCount && (this.lastCount = i, this.visuals.setLamps(i, !1), i >= 3 && (this.hooks.sound("count", null), this.hooks.message(String(6 - i), "#ffffff"))), this.player.input.throttle > 0 && this.startPress < 0 && (this.startPress = this.countdownT), this.player.input.throttle <= 0 && (this.startPress = -1), this.countdownT <= 0) {
          this.phase = "running", this.running = !0, this.visuals.setLamps(5, !0), this.hooks.sound("go", null), this.startPress >= 0 && this.startPress < 0.45 ? (this.player.boostT = 1.3, this.player.vf = 30, this.hooks.message("PERFECT START!", "#b6ff3b"), this.hooks.sound("boost", null)) : this.hooks.message("GO!", "#b6ff3b", "Tip: hit the throttle on the 5th light for a turbo start");
          for (let c of this.racers) !c.isPlayer && !c.remote && Math.random() < c.aiSkill - 0.55 && (c.boostT = 0.8 + Math.random() * 0.5, c.vf = 22);
        }
      }
      this.clock += e, this.running && (this.time += e), this.visuals.updateObstacles(this.time);
      let s = Math.max(1, Math.ceil(e / (1 / 120))),
        a = e / s;
      for (let i = 0; i < s; i++) {
        for (let c = 0; c < this.racers.length; c++) {
          let p = this.racers[c];
          if (!p.remote) {
            if ((!p.isPlayer || p.finished) && (p.aiAcc += a, p.aiAcc >= 1 / 40 && (ra(p, this, p.aiAcc), p.aiAcc = 0)), this.running && p.input.turbo && !this.prevTurbo[c] && p.turboCharge >= 1 && p.turboT <= 0 && (p.turboCharge -= 1, p.turboT = 1.6, this.sound("turbo", p), p.isPlayer && this.hooks.shake(0.15)), this.prevTurbo[c] = p.input.turbo, p.finished && this.trial && !this.demo && (p.input.throttle = p.vf > 3 ? -0.8 : 0, p.input.turbo = !1, p.input.drift = !1), p.driftBoostLevel = 0, p.step(o, a, this.running), o.open && (p.s >= o.L - 0.5 && p.vf > 0 || p.s <= 0.5 && p.vf < 0) && (p.vf = 0), !Number.isFinite(p.s + p.x + p.h + p.vf + p.vr + p.vh + p.psi + p.dist)) {
              let f = Number.isFinite(p.lastGroundS) ? p.lastGroundS : 0;
              p.dist = Number.isFinite(p.dist) ? p.dist : 0, p.place0(o, f, 0), p.vf = 20;
            }
            this.glitches(p), p.glitchT = Math.max(0, p.glitchT - a), p.driftBoostLevel > 0 && p.isPlayer && (this.hooks.sound("miniturbo", null), this.hooks.message(["", "MINI TURBO", "SUPER TURBO", "ULTRA TURBO!"][p.driftBoostLevel], ["", "#36f3ff", "#ffb321", "#ff3df2"][p.driftBoostLevel])), p.impact > 10 && p.isPlayer && this.hooks.sound("wall", null, Math.min(0.6, p.impact / 50)), p.landing > 12 && p.isPlayer && (this.hooks.sound("land", null, Math.min(1, p.landing / 25)), this.hooks.shake(Math.min(0.3, p.landing / 70)), this.world(p, 0, -0.6, de), this.fx.burst(de, fa, 14, 10, 1, 0.4));
          }
        }
        ia(o, this.racers, (c, p, f) => {
          (c.isPlayer || p.isPlayer) && f > 6 && this.hooks.sound("bump", null, Math.min(0.6, f / 30));
        });
      }
      for (let i = 0; i < this.racers.length; i++) {
        let c = this.racers[i],
          p = this.prevS[i];
        if (this.prevS[i] = c.s, c.remote) {
          c.finished || (c.lap = Math.min(this.laps, Math.max(1, Math.floor(c.dist / this.lapLen) + 1)));
          continue;
        }
        let f = m => o.delta(p, m) >= 0 && o.delta(c.s, m) < 0 && Math.abs(o.delta(p, c.s)) < 50;
        for (let m of o.boosts) c.h < 2.8 && Math.abs(c.x - m.x) < jn + 0.6 && Math.abs(o.delta(m.s, c.s)) < qn && (c.boostT < 0.5 && c.isPlayer && (this.hooks.sound("boost", null), this.hooks.shake(0.1)), c.boostT = Math.max(c.boostT, 0.9));
        for (let m of o.kickers) f(m) && c.h < 3.2 && (c.vh = Math.max(c.vh, 13 + Math.max(0, c.vf) * 0.05), c.isPlayer && (this.hooks.sound("jump", null), this.hooks.message("JUMP!", "#ffd21f")));
        if (c.h < -18) {
          let m = o.checkpoints,
            v = Math.max(0, c.cpNext - 1) % m.length;
          c.isPlayer && (this.hooks.message("OFF THE EDGE!", "#ff2e4d", v === 0 ? "Back to the start line" : `Back to checkpoint ${v}`), this.hooks.flash("#0b0716", 0.9)), this.respawn(c, m[v] + 6), c.vf = 45;
          continue;
        }
        let h = Math.floor(c.dist / this.lapLen);
        if (h > c.lap - 1 && !c.finished) for (; c.lap - 1 < h;) {
          if (c.lap++, c.lap >= 2) {
            let m = this.time - c.lapStart;
            if (c.lastLap = m, c.bestLap = Math.min(c.bestLap, m), c.lap - 1 >= this.laps) c.finished = !0, c.finishTime = this.time, c.isPlayer ? (this.playerFinished = !0, this.hooks.finish()) : this.hooks.rivalFinish(c);else if (c.isPlayer) {
              let v = c.lap === this.laps;
              this.hooks.sound(v ? "final" : "lap", null), this.hooks.message(v ? "FINAL LAP!" : `LAP ${c.lap}/${this.laps}`, v ? "#ff3df2" : "#36f3ff", Me(m));
            }
          }
          c.lapStart = this.time;
        }
        let b = o.checkpoints,
          u = Math.floor(c.cpNext / b.length) * this.lapLen + b[c.cpNext % b.length] - o.startS;
        if (c.dist >= u) {
          let m = this.cpTimes.get(c);
          if (m[c.cpNext] = this.time, c.isPlayer && this.trial && c.cpNext % b.length !== 0 && !c.finished) {
            let v = this.recordSplits?.[c.cpNext - 1],
              E = v !== void 0 ? this.time - v : NaN,
              M = Number.isFinite(E) ? `${E <= 0 ? "\u2212" : "+"}${Math.abs(E).toFixed(2)}s vs record` : Me(this.time);
            this.hooks.message(`CHECKPOINT ${c.cpNext}/${b.length - 1}`, Number.isFinite(E) ? E <= 0 ? "#b6ff3b" : "#ff6b6b" : "#36f3ff", M), this.hooks.sound("checkpoint", null);
          } else if (c.isPlayer && c.cpNext % b.length !== 0 && !c.finished) {
            let v = this.racers.find(k => k.place === 1),
              E = v && v !== c ? this.cpTimes.get(v)[c.cpNext] : void 0,
              M = E !== void 0 ? `+${(this.time - E).toFixed(2)}s to the leader` : "You are leading!";
            this.hooks.message(`CHECKPOINT ${c.cpNext % b.length}`, "#36f3ff", M), this.hooks.sound("checkpoint", null);
          }
          c.cpNext++;
        }
      }
      this.updatePlaces();
      let r = 0;
      for (let i of this.racers) r += i.dist / this.racers.length;
      for (let i of this.racers) {
        if (i.finished) {
          i.rubber += (0.62 - i.rubber) * Math.min(1, e * 0.5);
          continue;
        }
        if (i.isPlayer || i.remote) continue;
        let c = i.dist - (this.demo ? r + 25 : this.online ? this.nearestFriend(i) : this.player.dist),
          p = this.demo ? J.MathUtils.clamp(1 - c / 600, 0.8, 1.15) : J.MathUtils.clamp(1 - c / 1600, 0.84, 1.08);
        i.rubber += (i.aiSkill * p - i.rubber) * Math.min(1, e);
      }
      let l = this.player;
      this.running && !l.finished && Math.abs(l.psi) > 1.8 && l.speed > 8 ? this.wrongWayT += e : this.wrongWayT = 0;
      for (let i of this.racers) this.placeVisual(i, e, t);
    }
    nearestFriend(e) {
      let t = this.player.dist,
        o = 1 / 0;
      for (let s of this.racers) {
        if (s.bot || s.dnf || s.finished) continue;
        let a = Math.abs(s.dist - e.dist);
        a < o && (o = a, t = s.dist);
      }
      return t;
    }
    order = [];
    static byPosition(e, t) {
      return e.dnf !== t.dnf ? e.dnf ? 1 : -1 : e.finished && t.finished ? e.finishTime - t.finishTime : e.finished ? -1 : t.finished ? 1 : t.dist - e.dist;
    }
    updatePlaces() {
      let e = this.order;
      if (e.length !== this.racers.length) {
        e.length = 0;
        for (let t of this.racers) e.push(t);
      }
      e.sort(n.byPosition);
      for (let t = 0; t < e.length; t++) e[t].place = t + 1;
    }
    standings() {
      return this.order;
    }
    results() {
      let e = this.standings().map(t => {
        if (t.finished) return {
          racer: t,
          time: t.finishTime,
          place: 0,
          estimated: !1
        };
        if (t.dnf || t.remote && !t.bot) return {
          racer: t,
          time: t.dnf ? 1 / 0 : this.time + 999,
          place: 0,
          estimated: !0
        };
        let o = this.laps * this.lapLen - t.dist,
          s = Math.max(45, t.dist / Math.max(1, this.time));
        return {
          racer: t,
          time: this.time + o / s,
          place: 0,
          estimated: !0
        };
      });
      return e.sort((t, o) => t.time - o.time), e.forEach((t, o) => t.place = o + 1), e;
    }
    placeVisual(e, t, o) {
      if (e.dnf) return;
      let s = e.visual,
        a = this.frame;
      this.track.frameAt(e.s, a), s.root.position.copy(a.p).addScaledVector(a.r, e.x).addScaledVector(a.u, e.h + Math.sin(o * 5 + e.id) * 0.07), pa.copy(a.t).negate(), ca.makeBasis(a.r, a.u, pa), s.root.quaternion.setFromRotationMatrix(ca), s.root.rotateY(-e.psi);
      let r = e.drifting ? -e.driftDir * 0.38 : 0,
        l = e.spinT > 0 ? e.spinT * 14 : 0;
      s.body.rotation.set(J.MathUtils.clamp(e.vh * 0.025, -0.35, 0.35), J.MathUtils.lerp(s.body.rotation.y, r, Math.min(1, t * 8)) + l * t, -e.steerVis * 0.32 - (e.drifting ? e.driftDir * 0.12 : 0)), e.spinT <= 0 && !e.drifting && (s.body.rotation.y *= 0.9), s.blob.position.y = -e.h + 0.12, s.blob.scale.setScalar(J.MathUtils.clamp(1.2 - e.h * 0.06, 0.3, 1)), s.blob.visible = !this.track.isGap(e.s) && !e.offRoad, s.underglow.position.y = -e.h + 0.18, s.underglow.visible = s.blob.visible && e.h < 6, s.underglow.scale.setScalar(J.MathUtils.clamp(1.25 - e.h * 0.08, 0.4, 1.1) * (0.92 + Math.sin(o * 8 + e.id) * 0.08)), s.body.visible = !(e.invulnT > 0 && Math.sin(o * 40) > 0);
      let i = !!this.viewer && s.root.position.distanceToSquared(this.viewer) > 48400;
      this.hulls.has(e) || this.hulls.set(e, s.body.children.find(m => m.userData.outline));
      let c = this.hulls.get(e);
      c && (c.visible = !i);
      for (let m of s.flames) m.visible = !i;
      i && (s.underglow.visible = !1);
      let p = e.boostT > 0 || e.turboT > 0,
        h = (this.running ? Math.max(0.25, e.input.throttle) : 0.25) * (p ? 3 : 1.5) * (0.85 + Math.random() * 0.3);
      for (let m of s.flames) m.scale.set(p ? 1.3 : 1, p ? 1.3 : 1, h);
      if (t <= 0) return;
      Uo.copy(a.r).applyAxisAngle(a.u, -e.psi);
      for (let m = 0; m < e.trails.length; m++) s.body.localToWorld(de.copy(s.exhausts[m])), e.trails[m].update(t, de, Uo, p ? 0.24 : 0.16, p ? 0.7 : 0.32 + Math.min(0.3, e.speed / 320));
      let b = i ? 0 : J.MathUtils.clamp((e.speed - 95) / 45, 0, 1);
      for (let m = 0; m < e.vapor.length; m++) s.body.localToWorld(de.copy(s.tips[m])), e.vapor[m].update(t, de, a.u, 0.05, b);
      p && !e.wasBoosting && this.running && (s.body.getWorldQuaternion(da), this.world(e, 0, 0.3, de), this.fx.sonic(de, da, s.glowColor), this.hooks.sonic(e)), e.wasBoosting = p;
      let u = e.driftLevel;
      if (e.drifting && u > 0 && Math.random() < 0.8) for (let m = 0; m < 2; m++) s.body.localToWorld(de.copy(s.exhausts[m])), kt.copy(a.u).multiplyScalar(4 + Math.random() * 5).addScaledVector(a.r, (Math.random() - 0.5) * 8), this.fx.emit(de, kt, Yr[u], 1 + u * 0.25, 0.3, 3, 20);
      p && Math.random() < 0.4 && (s.body.localToWorld(de.copy(s.exhausts[0])), this.velocityOf(e, kt).multiplyScalar(0.6), this.fx.emit(de, kt, fa, 1.3, 0.25, 4)), e.scrape > 0 && Math.random() < 0.6 && (this.world(e, Math.sign(e.x) * 1.9, -0.3, de), this.velocityOf(e, kt).multiplyScalar(0.4), kt.addScaledVector(a.u, 5), this.fx.emit(de, kt, Kr, 1, 0.35, 2, 25));
    }
    dispose() {}
  };
function Me(n) {
  if (!isFinite(n)) return "--:--.--";
  let e = Math.floor(n / 60),
    t = n - e * 60;
  return `${e}:${t < 10 ? "0" : ""}${t.toFixed(2)}`;
}
var ga = "zoompunk-records-v1",
  St = {};
function ma(n) {
  return Array.isArray(n) ? n.filter(e => e && typeof e.time == "number" && isFinite(e.time) && e.time > 5 && typeof e.ship == "number").map(e => {
    let t = {
      time: e.time,
      ship: e.ship | 0,
      date: String(e.date ?? "")
    };
    return Array.isArray(e.splits) && e.splits.every(o => typeof o == "number" && isFinite(o)) && (t.splits = e.splits.slice(0, 8)), t;
  }).sort((e, t) => e.time - t.time).slice(0, 3) : [];
}
function ba(n) {
  if (!(!n || typeof n != "object")) for (let [e, t] of Object.entries(n)) St[e] = ma([...(St[e] ?? []), ...ma(t)]);
}
function va(n) {
  St = {}, ba(n?.records);
  try {
    ba(JSON.parse(localStorage.getItem(ga) ?? "{}"));
  } catch {}
}
function zt(n) {
  return St[n] ?? [];
}
function Wo(n, e, t, o) {
  let s = {
    time: e,
    ship: t,
    date: new Date().toISOString().slice(0, 10)
  };
  o?.length && o.every(l => isFinite(l)) && (s.splits = o);
  let a = [...zt(n), s].sort((l, i) => l.time - i.time).slice(0, 3),
    r = a.indexOf(s) + 1;
  if (r === 0) return 0;
  St[n] = a;
  try {
    localStorage.setItem(ga, JSON.stringify(St));
  } catch {}
  return r;
}
import * as d from "./vendor/001-three-0.185.js";
import { mergeGeometries as At } from "./vendor/005-BufferGeometryUtils.js";
var Zr = `
#include <common>
#include <fog_pars_vertex>
varying vec3 vWorld;
varying vec2 vUv;
void main() {
  vUv = uv;
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vWorld = wp.xyz;
  vec4 mvPosition = viewMatrix * wp;
  gl_Position = projectionMatrix * mvPosition;
  #include <fog_vertex>
}`,
  Ea = `
float hash(vec2 p) { return fract(sin(dot(p, vec2(41.3, 289.1))) * 43758.5453); }
float vnoise(vec2 p) {
  vec2 i = floor(p); vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p) { return vnoise(p) * 0.55 + vnoise(p * 2.1 + 7.3) * 0.3 + vnoise(p * 4.3 + 1.7) * 0.15; }
`;
function ya(n, e, t = {}) {
  return new d.ShaderMaterial({
    uniforms: d.UniformsUtils.merge([d.UniformsLib.fog, n]),
    vertexShader: Zr,
    fragmentShader: e,
    fog: !0,
    ...t
  });
}
var Qr = `
varying vec3 vDir;
void main() {
  vDir = normalize(position);
  vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  gl_Position = p.xyww;
}`,
  Jr = `
uniform vec3 uTop; uniform vec3 uMid; uniform vec3 uHorizon; uniform vec3 uSun; uniform vec3 uSunDir; uniform vec3 uGround;
uniform float uSunSize; uniform float uStripes; uniform float uStars;
varying vec3 vDir;
float hash(vec2 p) { return fract(sin(dot(p, vec2(41.3, 289.1))) * 43758.5453); }
void main() {
  vec3 d = normalize(vDir);
  float h = d.y;
  vec3 col = mix(uHorizon, uMid, smoothstep(0.0, 0.22, h));
  col = mix(col, uTop, smoothstep(0.22, 0.75, h));
  col = mix(col, uGround, smoothstep(0.0, -0.08, h));
  vec2 sp = vec2(atan(d.z, d.x) * 220.0, h * 220.0);
  float st = step(0.992, hash(floor(sp))) * smoothstep(0.25, 0.6, h) * uStars;
  col += vec3(1.0, 0.9, 1.0) * st * smoothstep(0.35, 0.0, length(fract(sp) - 0.5)) * 1.5;
  float a = acos(clamp(dot(d, uSunDir), -1.0, 1.0));
  float R = uSunSize;
  float rel = (d.y - uSunDir.y) / R;
  float stripe = rel < 0.0 && uStripes > 0.5 ? step(0.28 + rel * 0.25, fract(rel * 5.0 + 0.5)) : 1.0;
  float disc = step(a, R) * stripe;
  float rim = step(a, R + 0.008) * (1.0 - step(a, R));
  vec3 sunCol = mix(uSun * 2.0, vec3(1.0, 0.4, 0.55) * 1.8, clamp(-rel, 0.0, 1.0) * uStripes);
  col = mix(col, sunCol, disc);
  col = mix(col, vec3(0.04, 0.02, 0.08), rim);
  col += uSun * pow(max(0.0, 1.0 - a / 0.6), 3.0) * 0.35;
  gl_FragColor = vec4(col, 1.0);
}`;
function Ta(n, e) {
  return new d.ShaderMaterial({
    uniforms: {
      uColor: {
        value: new d.Color(n).multiplyScalar(e)
      }
    },
    vertexShader: `
      varying float vT; varying vec3 vN; varying vec3 vV;
      void main() {
        vT = uv.y;
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: `
      uniform vec3 uColor; varying float vT; varying vec3 vN; varying vec3 vV;
      void main() {
        float edge = pow(clamp(abs(dot(normalize(vN), normalize(vV))), 0.0, 1.0), 1.5);
        float a = pow(vT, 1.6) * edge;
        gl_FragColor = vec4(uColor * a, a);
      }`,
    transparent: !0,
    depthWrite: !1,
    blending: d.AdditiveBlending,
    side: d.DoubleSide
  });
}
function ei(n) {
  let e = n.map(([o, s]) => {
      let a = o.index ? o.toNonIndexed() : o;
      for (let c of Object.keys(a.attributes)) ["position", "normal"].includes(c) || a.deleteAttribute(c);
      let r = new d.Color(s),
        l = a.getAttribute("position").count,
        i = new Float32Array(l * 3);
      for (let c = 0; c < l; c++) i.set([r.r, r.g, r.b], c * 3);
      return a.setAttribute("color", new d.BufferAttribute(i, 3)), a;
    }),
    t = At(e, !1);
  for (let o of e) o.dispose();
  return t;
}
function Ye(n, e, t, o, s = 0) {
  let a = new d.InstancedMesh(n, e, Math.max(1, t.length));
  return a.count = t.length, t.forEach((r, l) => a.setMatrixAt(l, r)), o && o.forEach((r, l) => a.setColorAt(l, r)), a.frustumCulled = !1, s > 0 && X(a, s), a;
}
var Pe = new d.Matrix4(),
  fe = new d.Quaternion(),
  Se = new d.Vector3(),
  Xe = new d.Vector3(),
  Xn = new d.Vector3(0, 1, 0);
function Ko(n, e) {
  let t = n.theme,
    o = new d.Mesh(new d.SphereGeometry(2800, 40, 20), new d.ShaderMaterial({
      uniforms: {
        uTop: {
          value: new d.Color(t.skyTop)
        },
        uMid: {
          value: new d.Color(t.skyMid)
        },
        uHorizon: {
          value: new d.Color(t.horizon)
        },
        uGround: {
          value: new d.Color(t.fog).multiplyScalar(0.7)
        },
        uSun: {
          value: new d.Color(t.sun)
        },
        uSunDir: {
          value: n.sunDir
        },
        uSunSize: {
          value: e.sunSize
        },
        uStripes: {
          value: e.stripes ? 1 : 0
        },
        uStars: {
          value: e.stars
        }
      },
      vertexShader: Qr,
      fragmentShader: Jr,
      side: d.BackSide,
      depthWrite: !1,
      fog: !1
    }));
  o.renderOrder = -10, o.frustumCulled = !1, o.position.set(n.cx, 0, n.cz), n.group.add(o);
}
function qo(n, e, t, o, s, a = 0) {
  let r = me(2048, 256, (i, c, p) => {
    i.clearRect(0, 0, c, p);
    let f = 0;
    for (; f < c;) {
      let h = 20 + n.rnd() * 60,
        b = 40 + n.rnd() * 190;
      i.fillStyle = `#${o.getHexString()}`, i.fillRect(f, p - b, h, b), n.rnd() > 0.6 && i.fillRect(f + h / 2 - 2, p - b - 30, 4, 30), i.fillStyle = s;
      for (let u = p - b + 8; u < p - 6; u += 12) for (let m = f + 4; m < f + h - 6; m += 9) n.rnd() > 0.85 && i.fillRect(m, u, 4, 5);
      f += h + n.rnd() * 6;
    }
  });
  r.wrapS = d.RepeatWrapping, r.repeat.set(3, 1);
  let l = new d.Mesh(new d.CylinderGeometry(e, e, t, 64, 1, !0), new d.MeshBasicMaterial({
    map: r,
    transparent: !0,
    side: d.BackSide,
    fog: !1,
    depthWrite: !1
  }));
  l.position.set(n.cx, a + t / 2 - 4, n.cz), l.renderOrder = -9, n.group.add(l);
}
function jo(n, e, t, o, s, a, r = 0) {
  let l = [];
  for (let p = 0; p < e; p++) {
    let f = 4 + p % 3,
      h = p / e * Math.PI * 2 + n.rnd() * 0.4,
      b = t[0] + n.rnd() * (t[1] - t[0]),
      u = new d.Vector3(n.cx + Math.cos(h) * b, o[0] + n.rnd() * (o[1] - o[0]), n.cz + Math.sin(h) * b);
    if (!(r && n.track.nearest(u.x, u.z, 4).d < r)) {
      fe.setFromAxisAngle(Xn, -h + Math.PI / 2);
      for (let m = 0; m < f; m++) {
        let v = s[0] + n.rnd() * (s[1] - s[0]),
          E = new d.Vector3((m - f / 2) * v * 1.2, Math.sin(m * 2.1) * v * 0.35, Math.cos(m * 1.7) * v * 0.5).applyQuaternion(fe);
        Pe.compose(E.add(u), fe, Xe.set(v * 1.3, v, v)), l.push(new d.SphereGeometry(1, 14, 10).applyMatrix4(Pe));
      }
    }
  }
  let i = At(l, !1);
  for (let p of l) p.dispose();
  if (!i) return;
  let c = P(a, {
    emissive: a,
    emissiveIntensity: 0.35
  });
  c.fog = !1, n.group.add(X(new d.Mesh(i, c), 1.6, Le, !1));
}
function xa(n, e) {
  let {
      track: t,
      theme: o
    } = n,
    s = t.bounds,
    a = new d.Color(o.building),
    r = e.palette?.map(x => new d.Color(x)),
    l = new d.Color(o.neonA),
    i = new d.Color(o.neonB),
    c = [],
    p = [],
    f = [],
    h = [],
    b = [],
    u = [],
    m = [],
    v = [],
    E = t.halfW;
  for (let x = s.minX - e.margin; x <= s.maxX + e.margin; x += e.spacing) for (let B = s.minZ - e.margin; B <= s.maxZ + e.margin; B += e.spacing) {
    if (n.rnd() < 0.12) continue;
    let O = e.size[0] + n.rnd() * (e.size[1] - e.size[0]),
      z = e.size[0] + n.rnd() * (e.size[1] - e.size[0]),
      I = x + (n.rnd() - 0.5) * 8,
      W = B + (n.rnd() - 0.5) * 8;
    if (!e.allow(I, W)) continue;
    let U = t.nearest(I, W, 2),
      ue = U.d - Math.max(O, z) * 0.7 - E,
      S = U.k >= 0 ? t.pos[U.k * 3 + 1] : 0,
      G = e.base(I, W),
      $;
    if (ue < 8) {
      if ($ = Math.min(S - 16 - G, 8 + n.rnd() * 26), $ < 6) continue;
    } else $ = e.height(ue);
    let q = d.MathUtils.clamp((ue - 20) / 520, 0, 1),
      he = (0.7 + n.rnd() * 0.4) * (1 - 0.72 * q),
      Oe = (r ? r[Math.floor(n.rnd() * r.length)] : a).clone().multiplyScalar(he).offsetHSL((n.rnd() - 0.5) * 0.06, -0.15 * q, 0),
      ve = new d.Matrix4().compose(new d.Vector3(I, G, W), fe.identity(), new d.Vector3(O, $, z));
    if (ue > e.far) {
      f.push(ve), h.push(Oe);
      continue;
    }
    if (c.push(ve), p.push(Oe), n.rnd() > 0.72) {
      let le = n.rnd() > 0.5 ? z / 2 : -z / 2;
      b.push(new d.Matrix4().compose(new d.Vector3(I, G + $ + 0.3, W + le), fe.identity(), new d.Vector3(O * 1.02, 0.7, 0.7))), u.push((n.rnd() > 0.5 ? l : i).clone().multiplyScalar(0.85));
    }
    if (e.neonStrips && n.rnd() < e.neonStrips && $ > 40) {
      let le = n.rnd() > 0.5 ? 1 : -1,
        se = n.rnd() > 0.5 ? 1 : -1;
      m.push(new d.Matrix4().compose(new d.Vector3(I + le * O / 2, G + $ * 0.45, W + se * z / 2), fe.identity(), new d.Vector3(0.9, $ * 0.85, 0.9))), v.push([l, i, new d.Color("#ffe14d")][Math.floor(n.rnd() * 3)].clone().multiplyScalar(1.1));
    }
  }
  let M = new d.BoxGeometry(1, 1, 1);
  M.translate(0, 0.5, 0), n.group.add(Ye(M, P(16777215, {
    windows: !0
  }), c, p, 0.35)), n.group.add(Ye(M, P(16777215, {
    halftone: !1
  }), f, h));
  let k = new d.BoxGeometry(1, 1, 1);
  return n.group.add(Ye(k, new d.MeshBasicMaterial({
    color: 16777215
  }), b, u)), m.length && n.group.add(Ye(k, new d.MeshBasicMaterial({
    color: 16777215
  }), m, v)), {
    near: c
  };
}
function Yo(n, e, t, o) {
  let s = new d.InstancedMesh(new d.BoxGeometry(2.6, 1.2, 6), new d.MeshBasicMaterial({
    color: 16777215
  }), e);
  s.frustumCulled = !1;
  let a = [new d.Color(n.theme.neonA), new d.Color(n.theme.neonB), new d.Color("#ffe14d")],
    r = [];
  for (let i = 0; i < e; i++) {
    let c = n.rnd() * Math.PI * 2,
      p = new d.Vector3(Math.cos(c), 0, Math.sin(c)),
      f = new d.Vector3(n.cx + (n.rnd() - 0.5) * o, t[0] + n.rnd() * (t[1] - t[0]), n.cz + (n.rnd() - 0.5) * o).addScaledVector(p, -800);
    r.push({
      o: f,
      dir: p,
      speed: 30 + n.rnd() * 40,
      t: n.rnd() * 1600
    }), s.setColorAt(i, a[i % 3].clone().multiplyScalar(1.3));
  }
  n.group.add(s);
  let l = new d.Vector3(0, 0, 1);
  n.updaters.push((i, c) => {
    for (let p = 0; p < e; p++) {
      let f = r[p];
      f.t = (f.t + f.speed * c) % 1600, Se.copy(f.o).addScaledVector(f.dir, f.t), fe.setFromUnitVectors(l, f.dir), s.setMatrixAt(p, Pe.compose(Se, fe, Xe.set(1, 1, 1)));
    }
    s.instanceMatrix.needsUpdate = !0;
  });
}
function wa(n, e) {
  let {
      track: t,
      theme: o
    } = n,
    s = t.def.signs,
    a = [o.neonA, o.neonB, "#ffe14d"],
    r = new d.MeshBasicMaterial({
      color: Le
    });
  for (let l = 0; l < e; l++) {
    let i = Math.floor((l + 0.5) / e * t.N),
      c = l % 2 ? 1 : -1,
      p = t.halfW + 45 + n.rnd() * 40,
      f = t.pos[i * 3] + t.right[i * 3] * p * c,
      h = t.pos[i * 3 + 2] + t.right[i * 3 + 2] * p * c,
      b = t.pos[i * 3 + 1] + 14 + n.rnd() * 20,
      u = new d.Group(),
      m = new d.Mesh(new d.PlaneGeometry(26, 9.75), new d.MeshBasicMaterial({
        map: $t(s[l % s.length], a[l % 3]),
        color: new d.Color(1.1, 1.1, 1.1),
        side: d.DoubleSide
      })),
      v = new d.Mesh(new d.BoxGeometry(27.4, 11, 0.8), r);
    v.position.z = -0.5;
    let E = new d.Mesh(new d.BoxGeometry(0.8, b, 0.8), r);
    E.position.set(0, -b / 2, -0.6), u.add(m, v, E), u.position.set(f, b, h), u.lookAt(t.pos[i * 3], b, t.pos[i * 3 + 2]), n.group.add(u);
  }
}
function ti(n, e) {
  let {
      track: t,
      theme: o
    } = n,
    s = t.def.signs;
  for (let a = 0; a < e; a++) {
    let r = Math.floor((a + 0.3) / e * t.N),
      l = a % 2 ? 1 : -1,
      i = t.halfW + 60 + n.rnd() * 60,
      c = t.pos[r * 3] + t.right[r * 3] * i * l,
      p = t.pos[r * 3 + 2] + t.right[r * 3 + 2] * i * l,
      f = t.pos[r * 3 + 1] + 20 + n.rnd() * 25,
      h = new d.Mesh(new d.PlaneGeometry(30, 11.25), new d.MeshBasicMaterial({
        map: $t(s[a % s.length], a % 2 ? o.neonA : o.neonB, "rgba(10,6,24,0.35)"),
        color: new d.Color(1.2, 1.2, 1.2),
        transparent: !0,
        side: d.DoubleSide,
        depthWrite: !1
      }));
    h.position.set(c, f, p), h.lookAt(t.pos[r * 3], f, t.pos[r * 3 + 2]), n.group.add(h);
    let b = f;
    n.updaters.push(u => h.position.y = b + Math.sin(u * 0.6 + a) * 2);
  }
}
function _o(n, e, t, o, s) {
  let a = new d.Vector3(0.35, 1, 0.3).normalize(),
    r = new d.DirectionalLight(n.theme.key, s);
  return r.position.copy(a).multiplyScalar(100), n.group.add(new d.HemisphereLight(e, t, o), r), a;
}
var ni = `
#include <common>
#include <fog_pars_fragment>
uniform float uTime; uniform vec3 uDeep; uniform vec3 uShallow; uniform vec3 uSun; uniform vec3 uSunDir; uniform vec3 uFoam;
varying vec3 vWorld;
${Ea}
void main() {
  vec2 p = vWorld.xz;
  float w = sin(p.x * 0.021 + uTime * 0.6 + sin(p.y * 0.013) * 2.5) + sin(p.y * 0.027 - uTime * 0.45 + sin(p.x * 0.017) * 2.0);
  vec3 col = mix(uDeep, uShallow, 0.4 + 0.12 * w);
  // Cartoon wave strokes.
  vec2 q = p * vec2(0.03, 0.08);
  vec2 cell = floor(q); vec2 f = fract(q);
  float r = hash(cell);
  float y = f.y - 0.5 - 0.18 * sin(uTime * 1.3 + r * 6.2831);
  float dash = step(0.7, r) * smoothstep(0.06, 0.0, abs(y)) * smoothstep(0.48, 0.3, abs(f.x - 0.5));
  col = mix(col, uFoam, dash * 0.65);
  // Glittering path of sunlight.
  vec3 v = normalize(vWorld - cameraPosition);
  vec3 refl = reflect(v, vec3(0.0, 1.0, 0.0));
  float spec = pow(max(dot(refl, uSunDir), 0.0), 60.0);
  float glit = step(0.55, hash(floor(p * 0.3) + floor(uTime * 5.0)));
  col += uSun * spec * (0.5 + glit * 1.6);
  gl_FragColor = vec4(col, 1.0);
  #include <fog_fragment>
}`;
function oi(n) {
  let {
    track: e,
    theme: t,
    group: o
  } = n;
  Ko(n, {
    sunSize: 0.16,
    stripes: !0,
    stars: 0.5
  }), qo(n, 1700, 170, new d.Color(t.fog).multiplyScalar(0.72), t.neonB), jo(n, 14, [1100, 1400], [230, 420], [24, 42], t.cloud);
  let s = {
      uTime: {
        value: 0
      },
      uDeep: {
        value: new d.Color("#132a66")
      },
      uShallow: {
        value: new d.Color(t.ground)
      },
      uSun: {
        value: new d.Color(t.sun)
      },
      uSunDir: {
        value: n.sunDir
      },
      uFoam: {
        value: new d.Color("#bfe9ff")
      }
    },
    a = new d.Mesh(new d.PlaneGeometry(9e3, 9e3), ya(s, ni));
  a.rotation.x = -Math.PI / 2, a.position.set(n.cx, 0, n.cz), o.add(a);
  let r = a.material;
  n.updaters.push(w => r.uniforms.uTime.value = w);
  let l = [];
  for (let w = 0; w < e.N; w += 55) {
    let y = w / 55 % 2 ? 1 : -1,
      T = e.halfW + 70 + n.rnd() * 90,
      F = e.pos[w * 3] + e.right[w * 3] * T * y,
      Y = e.pos[w * 3 + 2] + e.right[w * 3 + 2] * T * y;
    l.push({
      x: F,
      z: Y,
      r: 70 + n.rnd() * 70
    });
  }
  for (let w = 0; w < 7; w++) {
    let y = w / 7 * Math.PI * 2 + 0.4,
      T = 750 + n.rnd() * 350;
    l.push({
      x: n.cx + Math.cos(y) * T,
      z: n.cz + Math.sin(y) * T,
      r: 160 + n.rnd() * 140
    });
  }
  let i = [],
    c = [],
    p = [];
  for (let w of l) i.push(new d.Matrix4().compose(Se.set(w.x, 2.5, w.z), fe.identity(), Xe.set(w.r, 5, w.r))), c.push(new d.Matrix4().compose(Se.set(w.x, 5.5, w.z), fe.identity(), Xe.set(w.r * 0.86, 3, w.r * 0.86))), p.push(new d.Matrix4().compose(Se.set(w.x, 0.4, w.z), fe.identity(), Xe.set(w.r * 1.12, 1, w.r * 1.12)));
  let f = new d.CylinderGeometry(1, 1.06, 1, 20);
  o.add(Ye(f, P("#2a2346"), i, void 0, 0.02)), o.add(Ye(f, P("#1c1838"), c, void 0, 0.02));
  let h = new d.TorusGeometry(1, 0.012, 4, 48);
  h.rotateX(Math.PI / 2);
  let b = i.map(w => w.clone().multiply(Pe.makeTranslation(0, 0.5, 0)));
  o.add(Ye(h, te(t.neonA, 1.2), b));
  let u = new d.RingGeometry(0.97, 1, 40);
  u.rotateX(-Math.PI / 2), o.add(Ye(u, new d.MeshBasicMaterial({
    color: new d.Color(t.neonB).multiplyScalar(0.9)
  }), p)), xa(n, {
    spacing: 40,
    margin: 1100,
    allow: (w, y) => l.some(T => (w - T.x) ** 2 + (y - T.z) ** 2 < (T.r * 0.8) ** 2),
    base: () => 7,
    height: w => w < 60 ? 18 + n.rnd() * 55 : 25 + n.rnd() * 90,
    size: [14, 28],
    far: 190,
    palette: ["#3a2e6e", "#2c3a6e", "#4a2a5e", "#1f4a5e", "#5a2a4a", "#2a2a52"],
    neonStrips: 0.45
  }), wa(n, 9);
  let v = new d.CylinderGeometry(0.5, 0.8, 14, 6).translate(0, 7, 0),
    E = At(Array.from({
      length: 6
    }, (w, y) => {
      let T = new d.BoxGeometry(1.2, 0.25, 7).translate(0, 0, 3.5);
      return T.rotateX(0.45), T.rotateY(y / 6 * Math.PI * 2), T.translate(0, 14, 0);
    })),
    M = [];
  for (let w of l.slice(0, 20)) for (let y = 0; y < 5; y++) {
    let T = n.rnd() * Math.PI * 2,
      F = w.r * (0.82 + n.rnd() * 0.1);
    fe.setFromAxisAngle(Se.set(Math.cos(T), 0, Math.sin(T)).cross(Xn).normalize(), -0.15 - n.rnd() * 0.15), M.push(new d.Matrix4().compose(Se.set(w.x + Math.cos(T) * F, 7, w.z + Math.sin(T) * F), fe.clone(), Xe.setScalar(0.9 + n.rnd() * 0.5)));
  }
  o.add(Ye(v, P("#1b1330"), M, void 0, 0.1));
  let k = M.map((w, y) => new d.Color(y % 3 ? t.neonB : t.neonA).multiplyScalar(1.25));
  o.add(Ye(E, new d.MeshBasicMaterial({
    color: 16777215
  }), M, k));
  let x = l[2] ?? l[0],
    B = new d.Group();
  B.position.set(x.x, 80, x.z), B.lookAt(n.cx, 80, n.cz);
  let O = new d.Group();
  O.add(new d.Mesh(new d.TorusGeometry(62, 1.1, 8, 72), te(t.neonB, 1.3))), O.add(X(new d.Mesh(new d.TorusGeometry(56, 1.6, 8, 64), P("#f4f1ff")), 0.3));
  let z = [];
  for (let w = 0; w < 16; w++) z.push(new d.BoxGeometry(0.8, 112, 0.8).rotateZ(w / 16 * Math.PI));
  O.add(new d.Mesh(At(z), new d.MeshBasicMaterial({
    color: Le
  }))), O.add(new d.Mesh(new d.CylinderGeometry(5, 5, 6, 16).rotateX(Math.PI / 2), P(t.neonA))), B.add(O);
  let I = new d.BoxGeometry(6, 7, 6),
    W = 16,
    U = new d.InstancedMesh(I, P(16777215), W),
    ue = [t.neonA, t.neonB, "#ffe14d", "#b6ff3b"];
  for (let w = 0; w < W; w++) U.setColorAt(w, new d.Color(ue[w % 4]));
  U.frustumCulled = !1, X(U, 0.25), B.add(U);
  for (let w of [-1, 1]) {
    let y = X(new d.Mesh(new d.BoxGeometry(3, 92, 3), P("#2a1a4a")), 0.2);
    y.position.set(w * 24, -38, 0), y.rotation.z = w * 0.28, B.add(y);
  }
  o.add(B), n.updaters.push(w => {
    O.rotation.z = w * 0.08;
    for (let y = 0; y < W; y++) {
      let T = w * 0.08 + y / W * Math.PI * 2;
      U.setMatrixAt(y, Pe.makeTranslation(Math.cos(T) * 56, Math.sin(T) * 56 - 5, 0));
    }
    U.instanceMatrix.needsUpdate = !0;
  });
  let S = l[Math.min(l.length - 1, 6)],
    G = new d.Group();
  G.position.set(S.x, 7, S.z);
  let $ = me(64, 256, (w, y, T) => {
    for (let F = 0; F < T; F += 32) w.fillStyle = F / 32 % 2 ? "#ff4a5e" : "#fff6e0", w.fillRect(0, F, y, 32);
  });
  G.add(X(new d.Mesh(new d.CylinderGeometry(4, 7, 60, 16).translate(0, 30, 0), P(16777215, {
    map: $
  })), 0.3)), G.add(X(new d.Mesh(new d.CylinderGeometry(6, 6, 2, 16).translate(0, 60, 0), P("#2a1a4a")), 0.2)), G.add(new d.Mesh(new d.SphereGeometry(4, 16, 12).translate(0, 65, 0), te("#fff2a0", 2.2))), G.add(X(new d.Mesh(new d.ConeGeometry(6, 6, 16).translate(0, 71, 0), P("#ff4a5e")), 0.2));
  let q = new d.Group();
  q.position.y = 65;
  let he = new d.ConeGeometry(38, 520, 24, 1, !0);
  he.translate(0, -260, 0), he.rotateZ(Math.PI / 2);
  let qe = Ta("#fff2c0", 0.55);
  for (let w of [0, Math.PI]) {
    let y = new d.Mesh(he, qe);
    y.rotation.y = w, q.add(y);
  }
  G.add(q), o.add(G), n.updaters.push(w => q.rotation.y = w * 0.6);
  let Oe = ei([[new d.BoxGeometry(4, 2, 12).translate(0, 1, 0), "#fff6e0"], [new d.ConeGeometry(2, 4, 4).rotateX(-Math.PI / 2).rotateZ(Math.PI / 4).translate(0, 1, -8), "#fff6e0"], [new d.BoxGeometry(3, 2, 4).translate(0, 3, 2), "#ff4a5e"], [new d.CylinderGeometry(0.25, 0.25, 14, 5).translate(0, 9, -1), "#2a1a4a"], [new d.ConeGeometry(4, 11, 3).scale(0.25, 1, 1).translate(0, 9, -3), "#36f3ff"]]),
    ve = 8,
    le = new d.InstancedMesh(Oe, P(16777215, {
      vertexColors: !0
    }), ve);
  le.frustumCulled = !1, X(le, 0.15), o.add(le);
  let se = Array.from({
    length: ve
  }, () => ({
    r: 350 + n.rnd() * 500,
    a: n.rnd() * 6.28,
    w: (0.02 + n.rnd() * 0.02) * (n.rnd() > 0.5 ? 1 : -1)
  }));
  return n.updaters.push(w => {
    se.forEach((y, T) => {
      let F = y.a + w * y.w;
      Se.set(n.cx + Math.cos(F) * y.r, 0.5 + Math.sin(w * 1.5 + T) * 0.4, n.cz + Math.sin(F) * y.r), fe.setFromAxisAngle(Xn, -F + (y.w > 0 ? Math.PI : 0)), le.setMatrixAt(T, Pe.compose(Se, fe, Xe.set(1, 1, 1)));
    }), le.instanceMatrix.needsUpdate = !0;
  }), Yo(n, 18, [90, 180], 900), {
    fogNear: 320,
    fogFar: 1900
  };
}
var si = `
attribute float aEnd;
uniform float uTime; uniform vec3 uCam;
varying float vA;
void main() {
  vec3 box = vec3(160.0, 110.0, 160.0);
  vec3 p = position;
  p.y -= uTime * (90.0 + fract(position.x * 13.7) * 40.0);
  p = mod(p - uCam + box * 0.5, box) - box * 0.5 + uCam;
  p.y -= aEnd * 3.2;
  p.x += aEnd * 0.4;
  vA = 1.0 - aEnd * 0.8;
  gl_Position = projectionMatrix * viewMatrix * vec4(p, 1.0);
}`,
  ai = `
uniform vec3 uA; uniform vec3 uB; uniform float uTime;
varying vec3 vN; varying vec3 vV; varying vec3 vW;
void main() {
  float f = pow(max(0.0, 1.0 - abs(dot(normalize(vN), normalize(vV)))), 1.6);
  float scan = 0.55 + 0.45 * step(0.5, fract(vW.y * 0.35 - uTime * 2.0));
  vec3 col = mix(uA, uB, 0.5 + 0.5 * sin(vW.y * 0.02 + uTime));
  float a = (0.18 + f * 0.9) * scan;
  gl_FragColor = vec4(col * a, a);
}`;
function Ra(n, e) {
  return new d.ShaderMaterial({
    uniforms: {
      uA: {
        value: new d.Color(n).multiplyScalar(1.4)
      },
      uB: {
        value: new d.Color(e).multiplyScalar(1.4)
      },
      uTime: {
        value: 0
      }
    },
    vertexShader: `
      varying vec3 vN; varying vec3 vV; varying vec3 vW;
      void main() {
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vW = wp.xyz;
        vec4 mv = viewMatrix * wp;
        vN = normalize(mat3(modelMatrix) * normal);
        vV = cameraPosition - wp.xyz;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: ai,
    transparent: !0,
    depthWrite: !1,
    blending: d.AdditiveBlending,
    side: d.DoubleSide
  });
}
function ri(n) {
  let {
    track: e,
    theme: t,
    group: o
  } = n;
  Ko(n, {
    sunSize: 0.07,
    stripes: !1,
    stars: 0.35
  }), qo(n, 1500, 320, new d.Color(t.fog).multiplyScalar(0.9), t.neonB), qo(n, 1150, 260, new d.Color(t.building).multiplyScalar(0.55), t.neonA);
  let s = me(128, 128, (S, G, $) => {
    S.fillStyle = "#000", S.fillRect(0, 0, G, $), S.fillStyle = t.neonB, S.fillRect(0, 0, G, 3), S.fillRect(0, 0, 3, $);
  }, {
    repeat: !0
  });
  s.repeat.set(6e3 / 44, 6e3 / 44);
  let a = new d.Mesh(new d.PlaneGeometry(6e3, 6e3), P(t.ground, {
    emissiveMap: s,
    emissive: 16777215,
    emissiveIntensity: 0.25,
    halftone: !1
  }));
  a.rotation.x = -Math.PI / 2, a.position.set(n.cx, 0, n.cz), o.add(a);
  let r = e.def.landmark ?? [0, 0],
    l = new d.Vector3(r[0] * Rt, 0, r[1] * Rt);
  xa(n, {
    spacing: 42,
    margin: 560,
    allow: (S, G) => (S - l.x) ** 2 + (G - l.z) ** 2 > 70 ** 2,
    base: () => 0,
    height: S => S < 60 ? 70 + n.rnd() * 170 : 90 + n.rnd() * 220,
    size: [16, 30],
    far: 170,
    neonStrips: 0.35
  }), wa(n, 12);
  let i = new d.Group();
  i.position.copy(l), i.add(X(new d.Mesh(new d.CylinderGeometry(22, 34, 420, 8).translate(0, 210, 0), P(t.building, {
    windows: !0
  })), 0.5)), i.add(X(new d.Mesh(new d.ConeGeometry(22, 90, 8).translate(0, 465, 0), P("#0c1238")), 0.4)), i.add(new d.Mesh(new d.CylinderGeometry(1.2, 1.2, 70, 6).translate(0, 540, 0), te("#ff4a5e", 1.4)));
  let c = [];
  for (let S = 0; S < 3; S++) {
    let G = new d.Mesh(new d.TorusGeometry(60 + S * 16, 1.4, 6, 64), te(S % 2 ? t.neonA : t.neonB, 1.3));
    G.position.y = 300 + S * 34, G.rotation.x = Math.PI / 2, i.add(G), c.push(G);
  }
  o.add(i);
  let p = Ra(t.neonB, "#ff4fd8"),
    f = [],
    h = 11;
  for (let S = 0; S < h; S++) {
    let G = 14 * Math.sin((S + 1.3) / (h + 1) * Math.PI) + 2,
      $ = new d.Mesh(new d.SphereGeometry(1, 16, 12), p);
    $.scale.set(G, G * 0.8, G * 1.6), f.push($), o.add($);
  }
  let b = new d.BufferGeometry().setFromPoints([new d.Vector3(0, 0, 0), new d.Vector3(0, 22, 26), new d.Vector3(0, -22, 26)]);
  b.computeVertexNormals();
  let u = new d.Mesh(b, p);
  o.add(u);
  let m = new d.BufferGeometry().setFromPoints([new d.Vector3(0, 0, 0), new d.Vector3(18, -4, 10), new d.Vector3(4, 0, 16)]);
  m.computeVertexNormals();
  let v = [new d.Mesh(m, p), new d.Mesh(m, p)];
  v[1].scale.x = -1, o.add(...v);
  let E = (S, G, $) => $.set(l.x + Math.cos(S) * 170, 230 + Math.sin(S * 2 + G * 0.5) * 30, l.z + Math.sin(S) * 170),
    M = new d.Vector3();
  n.updaters.push(S => {
    p.uniforms.uTime.value = S;
    let G = S * 0.22;
    for (let q = 0; q < h; q++) {
      let he = G - q * 0.06;
      E(he, S, f[q].position), f[q].position.y += Math.sin(S * 3 - q * 0.7) * 3, E(he + 0.02, S, M), f[q].lookAt(M);
    }
    let $ = f[h - 1];
    u.position.copy($.position), u.quaternion.copy($.quaternion), u.rotateY(Math.sin(S * 3) * 0.4);
    for (let q = 0; q < 2; q++) v[q].position.copy(f[3].position), v[q].quaternion.copy(f[3].quaternion), v[q].rotateZ((q ? -1 : 1) * (0.3 + Math.sin(S * 4) * 0.25));
    c.forEach((q, he) => q.rotation.z = S * (0.2 + he * 0.1) * (he % 2 ? -1 : 1));
  });
  let k = Ta("#bfe0ff", 0.4),
    x = new d.ConeGeometry(34, 700, 20, 1, !0);
  x.translate(0, -350, 0), x.rotateX(Math.PI);
  let B = [];
  for (let S = 0; S < 6; S++) {
    let G = S / 6 * Math.PI * 2,
      $ = new d.Mesh(x, k);
    $.position.set(n.cx + Math.cos(G) * 520, 0, n.cz + Math.sin(G) * 520), o.add($), B.push({
      mesh: $,
      phase: S * 1.3
    });
  }
  n.updaters.push(S => {
    for (let G of B) G.mesh.rotation.set(Math.sin(S * 0.3 + G.phase) * 0.45, 0, Math.cos(S * 0.23 + G.phase) * 0.45);
  });
  let O = 1400,
    z = new Float32Array(O * 2 * 3),
    I = new Float32Array(O * 2);
  for (let S = 0; S < O; S++) {
    let G = (n.rnd() - 0.5) * 160,
      $ = (n.rnd() - 0.5) * 110,
      q = (n.rnd() - 0.5) * 160;
    z.set([G, $, q, G, $, q], S * 6), I.set([0, 1], S * 2);
  }
  let W = new d.BufferGeometry();
  W.setAttribute("position", new d.BufferAttribute(z, 3)), W.setAttribute("aEnd", new d.BufferAttribute(I, 1));
  let U = new d.ShaderMaterial({
      uniforms: {
        uTime: {
          value: 0
        },
        uCam: {
          value: new d.Vector3()
        }
      },
      vertexShader: si,
      fragmentShader: "varying float vA; void main() { gl_FragColor = vec4(vec3(0.55, 0.7, 1.0) * vA, vA * 0.55); }",
      transparent: !0,
      depthWrite: !1,
      blending: d.AdditiveBlending
    }),
    ue = new d.LineSegments(W, U);
  return ue.frustumCulled = !1, o.add(ue), n.updaters.push((S, G, $) => {
    U.uniforms.uTime.value = S, U.uniforms.uCam.value.copy($);
  }), Yo(n, 80, [70, 260], 1e3), {
    fogNear: 200,
    fogFar: 1350
  };
}
var ii = `
#include <common>
#include <fog_pars_fragment>
uniform float uTime; uniform vec3 uLight; uniform vec3 uShade; uniform vec3 uSun; uniform vec3 uSunDir;
uniform vec3 uNeonA; uniform vec3 uNeonB;
varying vec3 vWorld;
${Ea}
void main() {
  vec2 p = vWorld.xz * 0.0045 + vec2(uTime * 0.006, uTime * 0.002);
  float h = fbm(p) * 0.75 + fbm(p * 2.7 + 3.1) * 0.25;
  float bands = floor(h * 4.0) / 3.0;
  vec3 col = mix(uShade, uLight, clamp(bands, 0.0, 1.0));
  // The drowned city glows up through the thin spots in the clouds.
  float thin = smoothstep(0.42, 0.2, h);
  float hue = vnoise(vWorld.xz * 0.0011 + 7.0);
  col += mix(uNeonA, uNeonB, smoothstep(0.35, 0.65, hue)) * thin * 0.55;
  float line = 1.0 - smoothstep(0.0, max(fwidth(h * 4.0) * 1.5, 1e-3), abs(fract(h * 4.0) - 0.02));
  col = mix(col, uShade * 0.75, line * 0.35);
  vec3 v = normalize(vWorld - cameraPosition);
  col += uSun * pow(max(dot(v, uSunDir), 0.0), 8.0) * 0.35;
  gl_FragColor = vec4(col, 1.0);
  #include <fog_fragment>
}`;
function li(n) {
  let {
    track: e,
    theme: t,
    group: o
  } = n;
  Ko(n, {
    sunSize: 0.12,
    stripes: !0,
    stars: 0.8
  });
  let s = {
      uTime: {
        value: 0
      },
      uLight: {
        value: new d.Color(t.cloud)
      },
      uShade: {
        value: new d.Color(t.ground).lerp(new d.Color(t.skyMid), 0.35)
      },
      uSun: {
        value: new d.Color(t.sun)
      },
      uSunDir: {
        value: n.sunDir
      },
      uNeonA: {
        value: new d.Color(t.neonB)
      },
      uNeonB: {
        value: new d.Color("#36f3ff")
      }
    },
    a = new d.Mesh(new d.PlaneGeometry(9e3, 9e3), ya(s, ii));
  a.rotation.x = -Math.PI / 2, a.position.set(n.cx, 14, n.cz), o.add(a);
  let r = a.material;
  n.updaters.push(y => r.uniforms.uTime.value = y), jo(n, 30, [250, 1400], [0, 14], [18, 34], t.cloud, 150), jo(n, 12, [1200, 1600], [200, 380], [30, 50], "#c7a2ff");
  let l = new d.Group(),
    i = [],
    c = 0,
    p = 46;
  for (let y = 0; y < 9; y++) {
    let T = 60 - y * 3,
      F = p * 0.86;
    i.push(new d.CylinderGeometry(F, p, T, 8).rotateY(y * 0.2).translate(0, c + T / 2, 0)), c += T, p = F;
  }
  l.add(X(new d.Mesh(At(i), P("#3a2f70", {
    windows: !0
  })), 0.6));
  let f = [];
  c = 0, p = 46;
  for (let y = 0; y < 9; y++) {
    let T = 60 - y * 3;
    f.push(new d.TorusGeometry(p * 0.93 + 1.2, 1.1, 6, 32).rotateX(Math.PI / 2).translate(0, c + T, 0)), c += T, p *= 0.86;
  }
  l.add(new d.Mesh(At(f), te(t.neonA, 1.4)));
  let h = X(new d.Mesh(new d.OctahedronGeometry(24, 0), P("#b6f0ff", {
    emissive: "#5fd8ff",
    emissiveIntensity: 1.1
  })), 0.5);
  h.position.y = c + 60, h.scale.set(1, 1.7, 1), l.add(h);
  let b = new d.Mesh(new d.TorusGeometry(46, 1.6, 6, 64), te(t.neonB, 1.4));
  b.position.y = c + 60, l.add(b);
  let u = e.def.landmark ?? [0, 0];
  l.position.set(u[0] * Rt, 14, u[1] * Rt), o.add(l), n.updaters.push(y => {
    h.rotation.y = y * 0.5, h.position.y = c + 60 + Math.sin(y) * 4, b.rotation.set(Math.PI / 2 + Math.sin(y * 0.4) * 0.3, y * 0.3, 0);
  });
  let m = [];
  for (let y = 0; y < 16; y++) {
    let T = y / 16 * Math.PI * 2 + n.rnd() * 0.3,
      F = 330 + n.rnd() * 700,
      Y = n.cx + Math.cos(T) * F,
      Te = n.cz + Math.sin(T) * F;
    e.nearest(Y, Te, 3).d < e.halfW + 40 || m.push({
      x: Y,
      y: 30 + n.rnd() * 110,
      z: Te,
      r: 18 + n.rnd() * 26,
      phase: n.rnd() * 6,
      kind: y % 3
    });
  }
  let v = new d.ConeGeometry(1, 1.8, 7).rotateX(Math.PI).translate(0, -0.9, 0),
    E = new d.CylinderGeometry(1, 0.95, 0.25, 7),
    M = At([new d.BoxGeometry(0.34, 0.9, 0.34).translate(-0.22, 0.55, 0.1), new d.BoxGeometry(0.26, 1.4, 0.26).translate(0.18, 0.8, -0.12), new d.BoxGeometry(0.22, 0.6, 0.22).translate(0.05, 0.4, 0.38)]),
    k = new d.OctahedronGeometry(0.35).scale(1, 1.8, 1).translate(0, 0.6, 0),
    x = new d.InstancedMesh(v, P("#3a2e5e"), m.length),
    B = new d.InstancedMesh(E, P("#241e44"), m.length),
    O = new d.InstancedMesh(M, P("#2c2458", {
      windows: !0
    }), m.length),
    z = new d.InstancedMesh(new d.TorusGeometry(1, 0.03, 4, 28).rotateX(Math.PI / 2).translate(0, 0.13, 0), te(t.neonB, 1.3), m.length);
  z.frustumCulled = !1, o.add(z);
  let I = new d.InstancedMesh(k, te(t.neonA, 1.3), m.length);
  for (let y of [x, B, O, I]) y.frustumCulled = !1, o.add(y);
  X(x, 0.02), X(B, 0.02), X(O, 0.02), n.updaters.push(y => {
    m.forEach((T, F) => {
      Se.set(T.x, T.y + Math.sin(y * 0.5 + T.phase) * 3, T.z), fe.setFromAxisAngle(Xn, T.phase), x.setMatrixAt(F, Pe.compose(Se, fe, Xe.set(T.r, T.r, T.r))), B.setMatrixAt(F, Pe.compose(Se, fe, Xe.set(T.r, T.r, T.r))), z.setMatrixAt(F, Pe);
      let Y = Xe.set(T.r * 0.8, T.r * 0.8, T.r * 0.8);
      O.setMatrixAt(F, T.kind === 2 ? Pe.makeScale(0, 0, 0) : Pe.compose(Se, fe, Y)), I.setMatrixAt(F, T.kind === 2 ? Pe.compose(Se, fe, Y) : Pe.makeScale(0, 0, 0));
    });
    for (let T of [x, B, O, I, z]) T.instanceMatrix.needsUpdate = !0;
  });
  let W = new d.Vector3(0.7, 0.28, 0.65).normalize(),
    U = new d.Group();
  U.position.set(n.cx, 0, n.cz).addScaledVector(W, 2300);
  let ue = me(64, 256, (y, T, F) => {
      let Y = ["#ffb86b", "#ff8a8a", "#ffd6a0", "#e070a8", "#ffc27a", "#b86ad0"];
      for (let Te = 0; Te < F; Te += 16) y.fillStyle = Y[Te / 16 % Y.length], y.fillRect(0, Te, T, 16);
    }),
    S = P(16777215, {
      map: ue,
      emissive: "#ff9a7a",
      emissiveIntensity: 0.35
    });
  S.fog = !1, U.add(X(new d.Mesh(new d.SphereGeometry(260, 40, 24), S), 4, Le, !1));
  let G = me(256, 8, (y, T, F) => {
      for (let Y = 0; Y < T; Y += 4) y.fillStyle = `rgba(255, ${190 + Y * 7 % 60}, ${170 + Y * 3 % 70}, ${0.25 + Y * 13 % 10 / 14})`, y.fillRect(Y, 0, 4, F);
    }),
    $ = new d.RingGeometry(340, 560, 96, 1),
    q = $.getAttribute("uv"),
    he = $.getAttribute("position");
  for (let y = 0; y < q.count; y++) {
    let T = Math.hypot(he.getX(y), he.getY(y));
    q.setXY(y, (T - 340) / 220, 0.5);
  }
  let qe = new d.Mesh($, new d.MeshBasicMaterial({
    map: G,
    transparent: !0,
    side: d.DoubleSide,
    fog: !1,
    depthWrite: !1
  }));
  qe.rotation.set(1.25, 0.2, 0.3), U.add(qe), U.lookAt(n.cx, 0, n.cz), o.add(U);
  let Oe = new d.SphereGeometry(1, 12, 8).scale(3.5, 0.9, 6),
    ve = new d.BufferGeometry().setFromPoints([new d.Vector3(0, 0, -4), new d.Vector3(14, 0, 2), new d.Vector3(0, 0, 4)]);
  ve.computeVertexNormals();
  let le = Ra(t.neonA, t.neonB);
  n.updaters.push(y => le.uniforms.uTime.value = y);
  let se = te(t.neonA, 1.3),
    w = [];
  for (let y = 0; y < 4; y++) {
    let T = new d.Group();
    T.add(new d.Mesh(Oe, le));
    let F = new d.Mesh(ve, le),
      Y = new d.Mesh(ve, le);
    Y.scale.x = -1;
    let Te = new d.Mesh(new d.SphereGeometry(0.8, 8, 6), se);
    Te.position.set(14, 0, 2), F.add(Te);
    let Gt = Te.clone();
    Y.add(Gt), T.add(F, Y), T.scale.setScalar(1.6), o.add(T), w.push({
      g: T,
      wl: F,
      wr: Y,
      r: 420 + y * 120,
      alt: 120 + y * 30,
      ph: y * 1.7
    });
  }
  return n.updaters.push(y => {
    for (let T of w) {
      let F = y * 0.06 + T.ph;
      T.g.position.set(n.cx + Math.cos(F) * T.r, T.alt + Math.sin(y * 0.7 + T.ph) * 12, n.cz + Math.sin(F) * T.r), T.g.rotation.set(0, -F, Math.sin(y * 0.7 + T.ph) * 0.15);
      let Y = Math.sin(y * 1.8 + T.ph) * 0.35;
      T.wl.rotation.z = Y, T.wr.rotation.z = -Y;
    }
  }), ti(n, 7), Yo(n, 30, [100, 260], 900), {
    fogNear: 380,
    fogFar: 2300
  };
}
function Ma(n) {
  let e = n.def.theme,
    t = new d.Group(),
    o = n.bounds,
    s = n.def.id.length * 977 + 13,
    a = {
      track: n,
      theme: e,
      group: t,
      cx: (o.minX + o.maxX) / 2,
      cz: (o.minZ + o.maxZ) / 2,
      sunDir: new d.Vector3(-0.35, 0.1, -1).normalize(),
      rnd: () => (s = s * 16807 % 2147483647, s / 2147483647),
      updaters: []
    },
    r,
    l;
  switch (n.def.biome) {
    case "harbor":
      a.sunDir.set(-0.3, 0.06, -1).normalize(), r = oi(a), l = _o(a, new d.Color(e.skyMid).lerp(new d.Color("#ffffff"), 0.55), "#2a4a8a", 1.7, 2.3);
      break;
    case "megacity":
      a.sunDir.set(0.4, 0.35, -1).normalize(), r = ri(a), l = _o(a, new d.Color(e.skyMid).lerp(new d.Color("#ffffff"), 0.5), e.ground, 1.6, 2.1);
      break;
    default:
      a.sunDir.set(-0.5, 0.08, -1).normalize(), r = li(a), l = _o(a, new d.Color(e.cloud).lerp(new d.Color(e.skyMid), 0.3), "#c88ab8", 1.9, 2.3);
  }
  return {
    group: t,
    keyDir: l,
    fog: {
      color: e.fog,
      near: r.fogNear,
      far: r.fogFar
    },
    update: (i, c, p) => {
      for (let f of a.updaters) f(i, c, p);
    }
  };
}
function ae(n, e = "", t = "") {
  let o = document.createElement(n);
  return e && (o.className = e), t && (o.innerHTML = t), o;
}
var ci = 600,
  qt = 76,
  Zn = 58,
  Qn = 270,
  Jn = (n, e) => 2 * Math.PI * n * e / 360;
function pi() {
  let n = Jn(qt, Qn),
    e = Jn(Zn, 80),
    t = "";
  for (let s = 0; s <= 12; s++) {
    let a = (135 + Qn * s / 12) * Math.PI / 180,
      r = s % 2 === 0,
      l = r ? 86 : 88;
    t += `<line x1="${100 + Math.cos(a) * l}" y1="${100 + Math.sin(a) * l}" x2="${100 + Math.cos(a) * 92}" y2="${100 + Math.sin(a) * 92}" stroke="${r ? "#fff" : "rgba(255,255,255,.45)"}" stroke-width="${r ? 3 : 2}" stroke-linecap="round"/>`;
  }
  let o = "";
  for (let s = 0; s < 3; s++) {
    let a = 135 + s * 90 + 5;
    o += `<circle cx="100" cy="100" r="${Zn}" fill="none" stroke="rgba(255,255,255,.12)" stroke-width="9" stroke-dasharray="${e} 999" transform="rotate(${a} 100 100)"/>`, o += `<circle class="turbo" data-t="${s}" cx="100" cy="100" r="${Zn}" fill="none" stroke="url(#npzTurbo)" stroke-width="9" stroke-dasharray="0 999" transform="rotate(${a} 100 100)"/>`;
  }
  return `<svg viewBox="0 0 200 200">
    <defs>
      <linearGradient id="npzSpeed" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#36f3ff"/><stop offset="0.6" stop-color="#b98cff"/><stop offset="1" stop-color="#ff3df2"/></linearGradient>
      <linearGradient id="npzTurbo" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffe14d"/><stop offset="1" stop-color="#ff9a2e"/></linearGradient>
    </defs>
    <circle cx="100" cy="100" r="97" fill="#160c30" stroke="#0b0716" stroke-width="5"/>
    <circle cx="100" cy="100" r="70" fill="#0f0822"/>
    ${t}
    <circle cx="100" cy="100" r="${qt}" fill="none" stroke="rgba(255,255,255,.1)" stroke-width="11" stroke-dasharray="${n} 999" stroke-linecap="round" transform="rotate(135 100 100)"/>
    <circle class="arc" cx="100" cy="100" r="${qt}" fill="none" stroke="url(#npzSpeed)" stroke-width="11" stroke-dasharray="0 999" stroke-linecap="round" transform="rotate(135 100 100)"/>
    <circle class="cap" cx="100" cy="100" r="6" fill="#fff" stroke="#0b0716" stroke-width="3"/>
    ${o}
    <text class="spd" x="100" y="108" text-anchor="middle">0</text>
    <text class="unit" x="100" y="124" text-anchor="middle">KM/H</text>
    <text class="tlabel" x="94" y="160" text-anchor="middle">TURBO</text>
    <rect x="115" y="150" width="15" height="14" rx="3" fill="#ffe14d" stroke="#0b0716" stroke-width="2"/>
    <text class="key" x="122.5" y="161" text-anchor="middle">E</text>
  </svg>`;
}
var eo = class {
  root;
  quit;
  pos;
  lapLabel;
  bestLabel;
  trial = !1;
  record = 1 / 0;
  posBig;
  posOf;
  standRows = [];
  gapEls = [];
  lapNum;
  time;
  best;
  mapCtx;
  mapBase = null;
  mapFit = {
    sx: 1,
    ox: 0,
    oz: 0
  };
  gauge;
  speedArc;
  cap;
  speedText;
  turboArcs;
  wrong;
  lastStand = "";
  lastOrder = [];
  lastKmh = -1;
  lastTurbo = -1;
  tick = 0;
  constructor(e) {
    this.root = ae("div", "npz-hud"), e.append(this.root);
    let t = ae("div", "npz-pos");
    this.pos = t;
    let o = ae("div", "npz-panel accent big");
    this.posBig = ae("b", "npz-ink", "1"), this.posOf = ae("span", "", "/8"), o.append(this.posBig, this.posOf, ae("span", "npz-label", "POS"));
    let s = ae("div", "npz-panel npz-stand");
    for (let f = 0; f < 8; f++) {
      let h = ae("div", "row");
      this.standRows.push(h), s.append(h);
    }
    t.append(o, s);
    let a = ae("div", "npz-panel accent npz-lap"),
      r = ae("div");
    this.lapNum = ae("b", "npz-ink", "1/3"), this.lapLabel = ae("span", "npz-label", "LAP"), r.append(this.lapLabel, this.lapNum);
    let l = ae("div", "t");
    this.time = ae("b", "npz-ink", "0:00.00"), l.append(ae("span", "npz-label", "TIME"), this.time);
    let i = ae("div");
    this.best = ae("b", "npz-ink", "--:--.--"), this.bestLabel = ae("span", "npz-label", "BEST LAP"), i.append(this.bestLabel, this.best), a.append(r, l, i);
    let c = ae("div", "npz-panel npz-map"),
      p = ae("canvas");
    p.width = p.height = 240, this.mapCtx = p.getContext("2d"), c.append(p), this.gauge = ae("div", "npz-gauge", pi()), this.speedArc = this.gauge.querySelector(".arc"), this.cap = this.gauge.querySelector(".cap"), this.speedText = this.gauge.querySelector(".spd"), this.turboArcs = [...this.gauge.querySelectorAll(".turbo")], this.quit = ae("button", "npz-panel npz-quit", "<i>\u2715</i>QUIT RACE"), this.wrong = ae("div", "npz-panel npz-wrong npz-ink", "\u27F2 WRONG WAY!"), this.root.append(t, a, c, this.gauge, this.quit, this.wrong);
  }
  show(e) {
    this.root.classList.toggle("on", e);
  }
  setMode(e, t = 1 / 0) {
    this.trial = e, this.record = t, this.pos.hidden = e, this.lapLabel.textContent = e ? "SECTOR" : "LAP", this.bestLabel.textContent = e ? "RECORD" : "BEST LAP";
  }
  setTrack(e) {
    let t = document.createElement("canvas");
    t.width = t.height = 240, jt(t, e, this.mapFit), this.mapBase = t, this.lastStand = "";
  }
  update(e) {
    let t = e.player;
    if (this.tick++, this.time.textContent = Me(t.finished ? t.finishTime : e.time), this.trial) {
      let l = e.track.checkpoints.length;
      this.lapNum.textContent = `${Math.min(l, Math.max(1, t.cpNext))}/${l}`, this.best.textContent = Me(this.record);
    } else this.posBig.textContent = String(t.place), this.posOf.textContent = `/${e.racers.length}`, this.lapNum.textContent = `${Math.min(e.laps, Math.max(1, t.lap))}/${e.laps}`, this.best.textContent = Me(t.bestLap);
    let o = Math.round(Math.max(0, t.vf) * 3.6);
    if (o !== this.lastKmh) {
      this.lastKmh = o;
      let l = Math.min(1, o / ci);
      this.speedArc.setAttribute("stroke-dasharray", `${Jn(qt, Qn) * l} 999`);
      let i = (135 + Qn * l) * Math.PI / 180;
      this.cap.setAttribute("cx", String(100 + Math.cos(i) * qt)), this.cap.setAttribute("cy", String(100 + Math.sin(i) * qt)), this.speedText.textContent = String(o);
    }
    this.gauge.classList.toggle("boost", t.boostT > 0 || t.turboT > 0);
    let s = Math.round(t.turboCharge * 50);
    if (s !== this.lastTurbo && (this.lastTurbo = s, this.turboArcs.forEach((l, i) => {
      let c = Math.max(0, Math.min(1, t.turboCharge - i));
      l.setAttribute("stroke-dasharray", `${Jn(Zn, 80) * c} 999`), l.classList.toggle("full", c >= 1);
    })), this.trial) {
      this.wrong.classList.toggle("on", e.wrongWayT > 0.6), this.tick % 2 === 0 && this.drawMap(e);
      return;
    }
    let a = e.standings(),
      r = a.length !== this.lastOrder.length;
    for (let l = 0; !r && l < a.length; l++) r = a[l].id !== this.lastOrder[l];
    if ((r || this.lastStand === "") && (this.lastStand = "set", this.lastOrder = a.map(l => l.id), a.forEach((l, i) => {
      let c = this.standRows[i];
      c.className = "row" + (l.isPlayer ? " me" : ""), c.innerHTML = `<span class="n">${i + 1}</span><span class="dot" style="background:${l.livery.main}"></span><span class="nm">${l.name}</span><span class="gp"></span>`, this.gapEls[i] = c.lastElementChild;
    })), this.tick % 6 === 0) {
      let l = a[0];
      a.forEach((i, c) => {
        this.gapEls[c].textContent = i.finished ? "FIN" : c === 0 ? "" : `-${Math.max(0, Math.round(l.dist - i.dist))}m`;
      });
    }
    this.wrong.classList.toggle("on", e.wrongWayT > 0.6), this.tick % 2 === 0 && this.drawMap(e);
  }
  drawMap(e) {
    let t = this.mapCtx;
    t.clearRect(0, 0, 240, 240), this.mapBase && t.drawImage(this.mapBase, 0, 0);
    let o = this.mapFit;
    for (let s = 0; s < 2; s++) for (let a of e.racers) {
      if (a.isPlayer !== (s === 1)) continue;
      let r = e.track.index(a.s) * 3,
        l = (e.track.pos[r] - o.ox) * o.sx + 120,
        i = (e.track.pos[r + 2] - o.oz) * o.sx + 120;
      t.beginPath(), t.arc(l, i, a.isPlayer ? 9 : 6.5, 0, Math.PI * 2), t.fillStyle = a.livery.main, t.fill(), t.lineWidth = 3, t.strokeStyle = "#0b0716", t.stroke(), a.isPlayer && (t.beginPath(), t.arc(l, i, 13, 0, Math.PI * 2), t.strokeStyle = "#ffffff", t.lineWidth = 2.5, t.stroke());
    }
  }
};
function jt(n, e, t = {
  sx: 1,
  ox: 0,
  oz: 0
}) {
  let o = n.getContext("2d"),
    s = n.width,
    a = e.bounds,
    r = Math.max(a.maxX - a.minX, a.maxZ - a.minZ);
  t.sx = s * 0.84 / r, t.ox = (a.minX + a.maxX) / 2, t.oz = (a.minZ + a.maxZ) / 2, o.clearRect(0, 0, s, s);
  let l = e.open ? e.N - 1 : e.N,
    i = () => {
      o.beginPath();
      for (let f = 0; f <= l; f += 2) {
        let h = f % e.N * 3,
          b = (e.pos[h] - t.ox) * t.sx + s / 2,
          u = (e.pos[h + 2] - t.oz) * t.sx + s / 2;
        f === 0 ? o.moveTo(b, u) : o.lineTo(b, u);
      }
      e.open || o.closePath();
    };
  o.lineJoin = "round", i(), o.strokeStyle = "#0b0716", o.lineWidth = s * 0.07, o.stroke(), i(), o.strokeStyle = e.def.theme.neonA, o.lineWidth = s * 0.032, o.stroke(), o.lineWidth = s * 0.018, o.strokeStyle = "#ffffff", o.beginPath();
  let c = !1;
  for (let f = 0; f <= l; f++) {
    let h = f % e.N * 3,
      b = e.pos[h + 1] > 60,
      u = (e.pos[h] - t.ox) * t.sx + s / 2,
      m = (e.pos[h + 2] - t.oz) * t.sx + s / 2;
    b && !c ? (o.moveTo(u, m), c = !0) : b ? o.lineTo(u, m) : c = !1;
  }
  o.globalAlpha = 0.5, o.stroke(), o.globalAlpha = 1, (e.open ? [e.index(e.startS), e.index(e.finishS)] : [0]).forEach((f, h) => {
    let b = (e.pos[f * 3] - t.ox) * t.sx + s / 2,
      u = (e.pos[f * 3 + 2] - t.oz) * t.sx + s / 2;
    o.fillStyle = h === 1 ? "#ffe14d" : "#ffffff", o.strokeStyle = "#0b0716", o.lineWidth = 3, o.fillRect(b - 6, u - 6, 12, 12), o.strokeRect(b - 6, u - 6, 12, 12);
  });
}
var di = ["SPEED", "ACCEL", "HANDLING", "WEIGHT"],
  fi = {
    harbor: "OCEAN \xB7 SUNSET",
    megacity: "MEGACITY \xB7 MIDNIGHT RAIN",
    sky: "ABOVE THE CLOUDS \xB7 NEON DUSK"
  },
  Ha = [{
    blurb: "Relaxed rivals. Learn the lines.",
    level: 1
  }, {
    blurb: "Sharp racers who fight for every corner.",
    level: 2
  }, {
    blurb: "No mercy. Perfect lines, full turbo.",
    level: 3
  }];
function ka(n) {
  let e = Math.floor(n / 60),
    t = n - e * 60;
  return `${e}:${t < 10 ? "0" : ""}${t.toFixed(2)}`;
}
function gn(n, e = "", t = "") {
  return `<div class="npz-nav">
    <button class="npz-nav-btn back" data-act="back"><i>\u25C0</i><span>${n}</span></button>
    <div class="npz-nav-mid" data-f="navmid"></div>
    ${e ? `<button class="npz-nav-btn next" data-act="${t}"><span>${e}</span><i>\u25B6</i></button>` : '<span class="npz-nav-btn spacer"></span>'}
  </div>`;
}
var to = [{
    name: "GRAND PRIX",
    blurb: "Three laps of a circuit against seven rival pilots. Finish on the podium.",
    tags: ["3 CIRCUITS", "8 PODS", "3 LAPS"],
    icon: '<svg viewBox="0 0 64 64"><path d="M14 56V8" stroke="#0b0716" stroke-width="5" stroke-linecap="round"/><path d="M16 10h36l-7 11 7 11H16z" fill="#fff" stroke="#0b0716" stroke-width="4" stroke-linejoin="round"/><path d="M16 10h9v7h-9zM34 10h9v7h-9zM25 17h9v8h-9zM43 17h5l-3 5 2 3h-4zM16 25h9v7h-9zM34 25h9v7h-9z" fill="#0b0716"/></svg>'
  }, {
    name: "TIME ATTACK",
    blurb: "Point-to-point routes with no laps and no rivals: just you, the road and the clock.",
    tags: ["3 ROUTES", "SOLO", "A \u2192 B"],
    icon: '<svg viewBox="0 0 64 64"><circle cx="32" cy="36" r="22" fill="#fff" stroke="#0b0716" stroke-width="5"/><path d="M26 6h12M32 6v8M50 16l4-4" stroke="#0b0716" stroke-width="5" stroke-linecap="round"/><path d="M32 36V22" stroke="#0b0716" stroke-width="5" stroke-linecap="round"/><path d="M32 36l9 6" stroke="#ff3df2" stroke-width="4" stroke-linecap="round"/><circle cx="32" cy="36" r="3.5" fill="#0b0716"/></svg>'
  }],
  no = class {
    state = {
      ship: 0,
      track: 0,
      trial: 0,
      difficulty: 1,
      mode: 0
    };
    screen = "hidden";
    title;
    modeScreen;
    trackScreen;
    shipScreen;
    modeCards = [];
    cards = [];
    routeCards = [];
    rivals = [];
    shipName;
    shipTag;
    stats;
    dots;
    logoA;
    logoB;
    titleFocus = 0;
    modeFocus = -1;
    onChange = () => {};
    onScreen = () => {};
    onStart = () => {};
    onSound = () => {};
    records = () => [];
    constructor(e) {
      this.title = document.createElement("div"), this.title.className = "npz-overlay npz-title", this.title.innerHTML = `
      <div class="wrap">
        <div class="npz-logo"><div class="a" data-f="logoA"></div><div class="b" data-f="logoB"></div></div>
        <div class="npz-sub">ANTI-GRAVITY STREET GRAND PRIX</div>
        <div class="npz-modes">
          <button class="npz-btn primary big focus" data-act="start" data-mode="0">PLAY SOLO</button>
          
        </div>
      </div>`, this.modeScreen = document.createElement("div"), this.modeScreen.className = "npz-overlay npz-select", this.modeScreen.innerHTML = `
      <div class="head"><div class="npz-steps"><i class="on"></i><i></i><i></i></div><h2>CHOOSE YOUR MODE</h2></div>
      <div class="npz-modecards">${to.map((r, l) => `<button class="npz-panel accent modecard m${l}" data-modecard="${l}">
          <span class="icon">${r.icon}</span>
          <b class="npz-ink">${r.name}</b>
          <p>${r.blurb}</p>
          <span class="tags">${r.tags.map(i => `<span class="npz-tag plain">${i}</span>`).join("")}</span>
        </button>`).join("")}</div>
      ${gn("BACK")}`;
      let t = ie.map(r => new st(r)),
        o = yt.map(r => new st(r)),
        s = (r, l, i) => {
          let c = r.theme,
            p = o[l],
            f = i === "trial" ? `${((p.finishS - p.startS) / 1e3).toFixed(1)} KM` : `${r.laps} LAPS`;
          return `<div class="npz-circuit" data-${i}="${l}">
          <div class="npz-panel card" style="--w1:${c.skyMid};--w2:${c.horizon};--w3:${c.neonA}">
            <div class="band"></div>
            <canvas width="160" height="160"></canvas>
            <div class="txt">
              <span class="world">${fi[r.biome]}</span>
              <b class="npz-ink">${r.name}</b>
              <p>${r.subtitle}</p>
              <div class="tags"><span class="npz-tag ${r.difficulty}">${r.difficulty}</span><span class="npz-tag plain">${f}</span>${i === "trial" && r.medals ? `<span class="npz-tag gold">\u2605 GOLD ${ka(r.medals[0])}</span>` : ""}</div>
            </div>
          </div>
          <div class="fame"></div>
        </div>`;
        };
      this.trackScreen = document.createElement("div"), this.trackScreen.className = "npz-overlay npz-select", this.trackScreen.innerHTML = `
      <div class="head"><div class="npz-steps"><i class="on"></i><i class="on"></i><i></i></div><h2 data-f="maptitle">CHOOSE YOUR CIRCUIT</h2></div>
      <div class="npz-circuits" data-f="circuits">${ie.map((r, l) => s(r, l, "track")).join("")}</div>
      <div class="npz-circuits" data-f="routes">${yt.map((r, l) => s(r, l, "trial")).join("")}</div>
      ${gn("BACK", "NEXT", "next")}`, this.shipScreen = document.createElement("div"), this.shipScreen.className = "npz-overlay npz-select", this.shipScreen.innerHTML = `
      <div class="head"><div class="npz-steps"><i class="on"></i><i class="on"></i><i class="on"></i></div><h2>CHOOSE YOUR POD</h2></div>
      <div class="npz-panel accent npz-shipcard">
        <div class="npz-label">YOUR POD</div>
        <div class="nav"><button class="npz-arrow" data-act="ship-" aria-label="Previous pod">\u25C0</button><b class="npz-ink" data-f="name"></b><button class="npz-arrow" data-act="ship+" aria-label="Next pod">\u25B6</button></div>
        <p data-f="tag"></p>
        <div class="npz-stats" data-f="stats"></div>
        <div class="npz-dots" data-f="dots"></div>
        <div class="npz-controls"><span><kbd>WASD</kbd>steer</span><span><kbd>SHIFT</kbd>drift</span><span><kbd>E</kbd>turbo</span></div>
      </div>
      <div class="npz-panel accent npz-rivals">
        <div class="npz-label">RIVAL LEVEL</div>
        ${mn.map((r, l) => `<button class="rival" data-diff="${l}">
            <span class="meter">${[1, 2, 3].map(i => `<i class="${i <= Ha[l].level ? "on" : ""}"></i>`).join("")}</span>
            <span class="txt"><b>${r.name}</b><small>${Ha[l].blurb}</small></span>
          </button>`).join("")}
      </div>
      ${gn("BACK", "RACE!", "race")}`, e.append(this.title, this.modeScreen, this.trackScreen, this.shipScreen), this.modeCards = [...this.modeScreen.querySelectorAll("[data-modecard]")], this.cards = [...this.trackScreen.querySelectorAll("[data-track]")], this.routeCards = [...this.trackScreen.querySelectorAll("[data-trial]")], this.rivals = [...this.shipScreen.querySelectorAll("[data-diff]")];
      let a = (r, l) => r.querySelector(`[data-f="${l}"]`);
      this.shipName = a(this.shipScreen, "name"), this.shipTag = a(this.shipScreen, "tag"), this.stats = a(this.shipScreen, "stats"), this.dots = a(this.shipScreen, "dots"), this.logoA = a(this.title, "logoA"), this.logoB = a(this.title, "logoB"), this.setName("GLITCH", "RIDERS"), t.forEach((r, l) => jt(this.cards[l].querySelector("canvas"), r)), o.forEach((r, l) => jt(this.routeCards[l].querySelector("canvas"), r));
      for (let r of [this.title, this.modeScreen, this.trackScreen, this.shipScreen]) r.addEventListener("click", l => {
        let i = l.target,
          c = i.closest("[data-modecard]");
        if (c) {
          this.pickMode(Number(c.dataset.modecard));
          return;
        }
        let p = i.closest("[data-track],[data-trial]");
        if (p) {
          p.dataset.track !== void 0 ? this.set("track", Number(p.dataset.track)) : this.set("trial", Number(p.dataset.trial));
          return;
        }
        let f = i.closest("button");
        f && (f.dataset.diff ? this.set("difficulty", Number(f.dataset.diff)) : this.act(f.dataset.act ?? ""));
      });
      this.render();
    }
    setName(e, t) {
      this.logoA.textContent = e, this.logoB.textContent = t;
    }
    get visible() {
      return this.screen !== "hidden";
    }
    get trialMode() {
      return this.state.mode === 1;
    }
    get def() {
      return this.trialMode ? yt[this.state.trial] : ie[this.state.track];
    }
    show(e) {
      this.screen = e, this.modeFocus = -1, this.title.classList.toggle("on", e === "title"), this.modeScreen.classList.toggle("on", e === "mode"), this.trackScreen.classList.toggle("on", e === "track"), this.shipScreen.classList.toggle("on", e === "ship"), this.render(), this.onScreen(e);
    }
    pickMode(e) {
      this.state.mode !== e && (this.state.mode = e, this.onChange("mode")), this.act("next");
    }
    act(e) {
      e === "start" ? (this.onSound("select"), this.show("mode")) : e === "next" ? (this.onSound("select"), this.show(this.screen === "mode" ? "track" : "ship")) : e === "race" ? (this.onSound("select"), this.onStart()) : e === "back" ? (this.onSound("back"), this.show(this.screen === "ship" ? "track" : this.screen === "track" ? "mode" : "title")) : (e === "ship-" || e === "ship+") && this.step("ship", e.endsWith("+") ? 1 : -1);
    }
    set(e, t) {
      this.state[e] !== t && (this.state[e] = t, this.onSound("click"), this.render(), this.onChange(e));
    }
    step(e, t) {
      let s = {
        ship: Z.length,
        track: ie.length,
        trial: yt.length,
        difficulty: mn.length,
        mode: to.length
      }[e];
      this.set(e, (this.state[e] + t + s) % s);
    }
    key(e) {
      if (!this.visible) return !1;
      let t = e === "KeyA" || e === "ArrowLeft",
        o = e === "KeyD" || e === "ArrowRight",
        s = e === "KeyW" || e === "ArrowUp",
        a = e === "KeyS" || e === "ArrowDown",
        r = e === "Enter" || e === "Space" || e === "NumpadEnter",
        l = e === "Escape" || e === "Backspace";
      if (this.screen === "title") {
        if (t || o) this.titleFocus = 0, this.onSound("click"), this.render();else if (r) this.act("start");else return !1;
      } else if (this.screen === "mode") {
        if (t || o || s || a) this.modeFocus = this.modeFocus < 0 ? this.state.mode : (this.modeFocus + (t || s ? -1 : 1) + to.length) % to.length, this.onSound("click"), this.render();else if (r) this.pickMode(this.modeFocus < 0 ? this.state.mode : this.modeFocus);else if (l) this.act("back");else return !1;
      } else if (this.screen === "track") {
        if (s || a) this.step(this.trialMode ? "trial" : "track", s ? -1 : 1);else if (r || o) this.act("next");else if (l || t) this.act("back");else return !1;
      } else if (this.screen === "ship") if (t || o) this.step("ship", t ? -1 : 1);else if ((s || a) && !this.trialMode) this.step("difficulty", a ? 1 : -1);else if (r) this.act("race");else if (l) this.act("back");else return !1;
      return !0;
    }
    fameHtml(e) {
      let t = this.records(e),
        o = s => {
          let a = t[s - 1],
            r = a ? Ee[Z[a.ship]?.livery ?? 0].main : "transparent";
          return `<div class="bar r${s}">
        <span class="medal">${s}</span>
        <span class="time">${a ? ka(a.time) : "--:--.--"}</span>
        <span class="pod"><i style="background:${r}"></i>${a ? Z[a.ship]?.name ?? "" : "open spot"}</span>
      </div>`;
        };
      return `<div class="ticket">
      <div class="top"><span class="trophy">\u{1F3C6}</span><span class="npz-label">HALL OF FAME</span></div>
      ${o(1)}${o(2)}${o(3)}
    </div>`;
    }
    render() {
      this.title.querySelectorAll("[data-mode]").forEach(s => s.classList.toggle("focus", Number(s.dataset.mode) === this.titleFocus)), this.modeCards.forEach((s, a) => s.classList.toggle("focus", a === this.modeFocus));
      let e = this.trialMode,
        t = (s, a, r, l) => s.forEach((i, c) => {
          let p = c === r;
          i.classList.toggle("on", p), i.querySelector(".fame").innerHTML = p && l ? this.fameHtml(a[c].id) : "";
        });
      t(this.cards, ie, this.state.track, !e), t(this.routeCards, yt, this.state.trial, e), this.trackScreen.querySelector('[data-f="circuits"]').hidden = e, this.trackScreen.querySelector('[data-f="routes"]').hidden = !e, this.trackScreen.querySelector('[data-f="maptitle"]').textContent = e ? "CHOOSE YOUR ROUTE" : "CHOOSE YOUR CIRCUIT", this.shipScreen.querySelector(".npz-rivals").hidden = e, this.shipScreen.querySelector('[data-act="race"] span').textContent = e ? "GO!" : "RACE!", this.rivals.forEach((s, a) => s.classList.toggle("on", a === this.state.difficulty));
      let o = Z[this.state.ship];
      this.shipName.textContent = o.name, this.shipTag.textContent = o.tagline, this.stats.innerHTML = o.bars.map((s, a) => `<span class="npz-label">${di[a]}</span><div class="pips">${[0, 1, 2, 3, 4].map(r => `<i class="${r < s ? "on" : ""}"></i>`).join("")}</div>`).join(""), this.dots.innerHTML = Z.map((s, a) => `<i class="${a === this.state.ship ? "on" : ""}"></i>`).join("");
    }
  };
import * as Sa from "./vendor/001-three-0.185.js";
var at = new Sa.Vector3(),
  so = class {
    layer;
    tags = new Map();
    race = null;
    constructor(e) {
      this.layer = document.createElement("div"), this.layer.className = "npz-tags", e.append(this.layer);
    }
    setRace(e) {
      if (this.race = e, this.layer.replaceChildren(), this.tags.clear(), !!e) for (let t of e.racers) {
        if (!t.remote || t.bot) continue;
        let o = document.createElement("div");
        o.className = "npz-tag3d" + (t.remote ? " friend" : ""), o.innerHTML = `<i style="background:${t.livery.main}"></i>${t.name}`, this.layer.append(o), this.tags.set(t.id, o);
      }
    }
    update(e, t, o, s) {
      let a = this.race;
      if (a && (this.layer.style.display = s ? "" : "none", !!s)) for (let r of a.racers) {
        let l = this.tags.get(r.id);
        if (!l) continue;
        at.copy(r.visual.root.position);
        let i = at.distanceTo(e.position);
        if (at.y += 2.5, at.project(e), r.dnf || at.z > 1 || i > 260 || Math.abs(at.x) > 1.1 || Math.abs(at.y) > 1.1) {
          l.style.opacity = "0";
          continue;
        }
        let c = Math.max(0.55, Math.min(1, 40 / i));
        l.style.opacity = String(Math.min(1, (260 - i) / 60)), l.style.transform = `translate(${(at.x * 0.5 + 0.5) * t}px, ${(-at.y * 0.5 + 0.5) * o}px) translate(-50%, -100%) scale(${c})`;
      }
    }
  };
var hi = `
:root {
  --ink: #0b0716;
  --panel: rgba(20, 11, 42, 0.9);
  --panel-solid: #160c30;
  --cream: #fff6e0;
  --pink: #ff3df2;
  --cyan: #36f3ff;
  --yellow: #ffe14d;
  --lime: #b6ff3b;
  --red: #ff4a5e;
  --display: 'Arial Black', 'Arial Bold', Impact, 'Helvetica Neue', sans-serif;
  --body: 'Helvetica Neue', 'Segoe UI', Arial, sans-serif;
}
.npz-root, .npz-root * { box-sizing: border-box; }
.npz-root {
  position: fixed; inset: 0; pointer-events: none; font-family: var(--display); color: #fff;
  user-select: none; -webkit-user-select: none; overflow: hidden;
  --pad-t: calc(var(--remix-safe-top, 0px) + 14px);
  --pad-r: calc(var(--remix-safe-right, 0px) + 16px);
  --pad-b: calc(var(--remix-safe-bottom, 0px) + 14px);
  --pad-l: calc(var(--remix-safe-left, 0px) + 16px);
}
.npz-panel {
  position: relative; background: var(--panel); border: 3px solid var(--ink); border-radius: 10px;
  box-shadow: 4px 4px 0 var(--ink), inset 0 1px 0 rgba(255,255,255,0.1);
}
.npz-panel.accent::before {
  content: ''; position: absolute; left: 8px; right: 8px; top: -3px; height: 3px; border-radius: 0 0 3px 3px;
  background: linear-gradient(90deg, var(--cyan), var(--pink));
}
.npz-label { font-family: var(--body); font-weight: 800; font-size: 10px; letter-spacing: 2px; color: var(--cyan); text-transform: uppercase; }
.npz-ink { -webkit-text-stroke: 2px var(--ink); paint-order: stroke fill; text-shadow: 2px 2px 0 var(--ink); }
.npz-hud { position: absolute; inset: 0; display: none; }
.npz-hud.on { display: block; }

/* Position + standings */
.npz-pos { position: absolute; left: var(--pad-l); top: var(--pad-t); width: 190px; }
.npz-pos .big { display: flex; align-items: baseline; gap: 4px; padding: 4px 12px 5px; }
.npz-pos .big b { font-size: 38px; line-height: 1; font-style: italic; color: var(--yellow); }
.npz-pos .big span { font-size: 17px; font-style: italic; color: #fff; opacity: 0.9; }
.npz-pos .big .npz-label { margin-left: auto; align-self: center; }
.npz-stand { margin-top: 8px; padding: 5px 6px; font-family: var(--body); font-weight: 700; font-size: 11.5px; }
.npz-stand .row { display: flex; align-items: center; gap: 6px; padding: 1px 5px; border-radius: 4px; white-space: nowrap; height: 18px; }
.npz-stand .row.me { background: var(--yellow); color: var(--ink); }
.npz-stand .row .n { width: 12px; font-family: var(--display); font-style: italic; font-size: 10px; opacity: 0.75; }
.npz-stand .row .dot { width: 9px; height: 9px; border-radius: 50%; border: 2px solid var(--ink); flex: none; }
.npz-stand .row .nm { flex: 1; overflow: hidden; text-overflow: ellipsis; }
.npz-stand .row .gp { font-size: 10px; opacity: 0.7; font-variant-numeric: tabular-nums; }

/* Lap + time */
.npz-lap { position: absolute; left: 50%; top: var(--pad-t); transform: translateX(-50%); display: flex; align-items: stretch; padding: 4px 6px; }
.npz-lap > div { padding: 1px 12px; text-align: center; }
.npz-lap > div + div { border-left: 2px solid rgba(255,255,255,0.1); }
.npz-lap b { display: block; font-size: 20px; font-style: italic; line-height: 1.1; font-variant-numeric: tabular-nums; }
.npz-lap .t b { color: var(--yellow); }

/* Minimap */
.npz-map { position: absolute; right: var(--pad-r); top: var(--pad-t); padding: 5px; }
.npz-map canvas { display: block; width: 148px; height: 148px; }

/* Round speedometer */
.npz-gauge { position: absolute; right: var(--pad-r); bottom: var(--pad-b); width: 184px; height: 184px; filter: drop-shadow(4px 4px 0 var(--ink)); }
.npz-gauge svg { width: 100%; height: 100%; overflow: visible; }
.npz-gauge .spd { font-family: var(--display); font-style: italic; font-size: 44px; fill: #fff; stroke: var(--ink); stroke-width: 5px; paint-order: stroke fill; }
.npz-gauge .unit { font-family: var(--body); font-weight: 800; font-size: 11px; letter-spacing: 2px; fill: var(--cyan); }
.npz-gauge .tlabel { font-family: var(--body); font-weight: 800; font-size: 9px; letter-spacing: 1.5px; fill: var(--yellow); }
.npz-gauge .key { font-family: var(--display); font-size: 10px; fill: var(--ink); }
.npz-gauge.boost .arc { filter: drop-shadow(0 0 6px var(--cyan)); }
.npz-gauge .turbo.full { filter: drop-shadow(0 0 4px var(--yellow)); }

/* Quit */
.npz-quit { position: absolute; left: var(--pad-l); bottom: var(--pad-b); pointer-events: auto; cursor: pointer; font-family: var(--display); font-style: italic; font-size: 12px; letter-spacing: 1px; color: #fff; padding: 7px 14px 7px 11px; display: flex; gap: 8px; align-items: center; transition: transform 0.1s, background 0.1s; }
.npz-quit i { display: grid; place-items: center; width: 18px; height: 18px; border-radius: 50%; background: var(--red); border: 2px solid var(--ink); font-style: normal; font-size: 11px; color: var(--ink); }
.npz-quit:hover { background: #2a1650; transform: translateY(-1px); }
.npz-quit:active { transform: translate(2px, 2px); box-shadow: 2px 2px 0 var(--ink); }

/* Center messages */
.npz-np { position: absolute; left: 50%; bottom: calc(var(--pad-b) + 8px); transform: translateX(-50%); display: flex; align-items: center; gap: 8px; padding: 6px 14px 6px 8px; border-radius: 999px; background: rgba(11,7,22,0.82); border: 2px solid rgba(255,255,255,0.12); box-shadow: 0 0 18px rgba(255,61,242,0.25); opacity: 0; pointer-events: none; white-space: nowrap; }
.npz-np.on { animation: npz-np 5s ease both; }
.npz-np i { font-style: normal; width: 22px; height: 22px; display: grid; place-items: center; border-radius: 50%; background: var(--pink); color: var(--ink); font-size: 12px; }
.npz-np span { font-family: var(--body); font-weight: 800; font-size: 9px; letter-spacing: 2px; opacity: 0.6; }
.npz-np b { font-style: italic; font-size: 13px; letter-spacing: 0.5px; color: var(--cyan); }
@keyframes npz-np { 0% { opacity: 0; transform: translate(-50%, 12px); } 10%, 82% { opacity: 1; transform: translate(-50%, 0); } 100% { opacity: 0; transform: translate(-50%, 6px); } }
.npz-msg { position: absolute; left: 50%; top: 27%; transform: translate(-50%, -50%); text-align: center; pointer-events: none; }
.npz-msg .m { font-size: clamp(30px, 4.4vw, 58px); font-style: italic; white-space: nowrap; -webkit-text-stroke: 3px var(--ink); paint-order: stroke fill; text-shadow: 4px 4px 0 var(--ink); transform: skewX(-8deg); }
.npz-msg .s { font-family: var(--body); font-weight: 800; font-size: 14px; margin-top: 4px; text-shadow: 0 2px 0 var(--ink), 0 0 6px var(--ink); }
.npz-msg.pop .m { animation: npz-pop 0.32s cubic-bezier(.2,1.7,.4,1); }
.npz-msg.count .m { font-size: clamp(70px, 10vw, 130px); }
.npz-wrong { position: absolute; left: 50%; top: 44%; transform: translate(-50%, -50%); padding: 6px 18px; background: var(--red); color: #fff; font-size: 22px; font-style: italic; display: none; animation: npz-blink 0.5s steps(2) infinite; }
.npz-wrong.on { display: block; }

/* Comic popups (world-anchored) */
.npz-pops { position: absolute; inset: 0; overflow: hidden; }
.npz-pop { position: absolute; left: 0; top: 0; font-size: 24px; font-style: italic; color: var(--pop-color, var(--yellow)); -webkit-text-stroke: 3px var(--ink); paint-order: stroke fill; text-shadow: 3px 3px 0 var(--ink); white-space: nowrap; padding: 14px 20px; will-change: transform; }
.npz-pop::before { content: ''; position: absolute; inset: 0; z-index: -1; background: #fff; clip-path: polygon(50% 0%, 61% 22%, 86% 8%, 78% 34%, 100% 44%, 78% 58%, 92% 86%, 64% 76%, 52% 100%, 40% 78%, 12% 92%, 20% 62%, 0% 50%, 22% 36%, 8% 12%, 36% 22%); opacity: 0.9; }
.npz-pop.big { font-size: 36px; }

.npz-flash { position: absolute; inset: 0; background: #fff; opacity: 0; pointer-events: none; }

/* Overlays */
.npz-overlay { position: absolute; inset: 0; pointer-events: auto; display: none; }
.npz-overlay.on { display: block; }
.npz-btn { pointer-events: auto; cursor: pointer; font-family: var(--display); font-style: italic; letter-spacing: 0.5px; border: 3px solid var(--ink); border-radius: 8px; color: var(--ink); background: var(--cream); box-shadow: 4px 4px 0 var(--ink); padding: 9px 20px; font-size: 16px; transition: transform 0.08s, box-shadow 0.08s, background 0.1s; }
.npz-btn:hover, .npz-btn.focus { transform: translate(-1px, -1px); box-shadow: 5px 5px 0 var(--ink); }
.npz-btn:active { transform: translate(2px, 2px); box-shadow: 2px 2px 0 var(--ink); }
.npz-btn.primary { background: var(--yellow); }
.npz-btn.ghost { background: rgba(20, 11, 42, 0.9); color: #fff; }
.npz-btn.big { font-size: 24px; padding: 12px 42px; border-radius: 10px; box-shadow: 5px 5px 0 var(--pink), 5px 5px 0 3px var(--ink); }
.npz-btn.big:hover, .npz-btn.big.focus { box-shadow: 6px 6px 0 var(--pink), 6px 6px 0 3px var(--ink); }

/* Title */
.npz-title { background: radial-gradient(ellipse at center, rgba(11,7,22,0.15) 0%, rgba(11,7,22,0.55) 70%, rgba(11,7,22,0.8) 100%); }
.npz-title .wrap { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 22px; padding: 20px; text-align: center; }
.npz-logo { line-height: 0.88; transform: skewX(-9deg) rotate(-3deg); }
.npz-logo .a { font-size: clamp(34px, 6vw, 84px); color: var(--yellow); -webkit-text-stroke: 4px var(--ink); paint-order: stroke fill; text-shadow: 5px 5px 0 var(--pink), 5px 5px 0 4px var(--ink); font-style: italic; }
.npz-logo .b { font-size: clamp(44px, 8.5vw, 124px); color: var(--cyan); -webkit-text-stroke: 5px var(--ink); paint-order: stroke fill; text-shadow: 7px 7px 0 var(--ink); font-style: italic; }
.npz-sub { font-family: var(--body); font-weight: 800; font-size: clamp(11px, 1.2vw, 14px); letter-spacing: 5px; color: #fff; background: var(--ink); padding: 6px 14px; border-radius: 4px; box-shadow: 3px 3px 0 var(--pink); }

/* Selector screens (shared frame) */
.npz-select { background: linear-gradient(180deg, rgba(11,7,22,0.72) 0%, rgba(11,7,22,0.15) 26%, rgba(11,7,22,0.15) 70%, rgba(11,7,22,0.8) 100%); }
.npz-select .head { position: absolute; left: 0; right: 0; top: var(--pad-t); display: flex; flex-direction: column; align-items: center; gap: 6px; pointer-events: none; }
.npz-select .head h2 { margin: 0; font-size: clamp(24px, 3vw, 36px); font-style: italic; color: #fff; -webkit-text-stroke: 3px var(--ink); paint-order: stroke fill; text-shadow: 4px 4px 0 var(--ink); transform: skewX(-8deg); }
.npz-steps { display: flex; gap: 6px; }
.npz-steps i { width: 26px; height: 5px; border-radius: 3px; background: rgba(255,255,255,0.25); border: 1px solid var(--ink); }
.npz-steps i.on { background: var(--yellow); }
.npz-tag { font-family: var(--body); font-weight: 800; font-size: 9px; letter-spacing: 1.5px; padding: 2px 8px; border-radius: 3px; border: 2px solid var(--ink); background: var(--cyan); color: var(--ink); }
.npz-tag.MEDIUM { background: var(--yellow); }
.npz-tag.HARD { background: var(--pink); }
.npz-tag.plain { background: var(--cream); }
.npz-tag.gold { background: linear-gradient(180deg, #fff27a, #ffc61a); }

/* The shared nav bar: BACK bottom-left, forward bottom-right, same size everywhere */
.npz-nav { position: absolute; left: var(--pad-l); right: var(--pad-r); bottom: var(--pad-b); display: flex; align-items: center; gap: 16px; }
.npz-nav-mid { flex: 1; text-align: center; font-family: var(--body); font-weight: 800; font-size: 13px; text-shadow: 0 2px 0 var(--ink), 0 0 8px var(--ink); display: flex; flex-direction: column; gap: 3px; }
.npz-nav-mid .err { color: #ff8a9a; }
.npz-nav-btn { pointer-events: auto; cursor: pointer; width: 190px; height: 52px; display: flex; align-items: center; justify-content: center; gap: 12px; font-family: var(--display); font-style: italic; font-size: 19px; letter-spacing: 0.5px; border: 3px solid var(--ink); border-radius: 10px; box-shadow: 4px 4px 0 var(--ink); transition: transform 0.08s, box-shadow 0.08s, background 0.15s; }
.npz-nav-btn i { font-style: normal; font-size: 12px; width: 24px; height: 24px; display: grid; place-items: center; border-radius: 50%; border: 2px solid var(--ink); }
.npz-nav-btn.back { background: var(--panel-solid); color: #fff; }
.npz-nav-btn.back i { background: rgba(255,255,255,0.12); }
.npz-nav-btn.next { background: var(--yellow); color: var(--ink); }
.npz-nav-btn.next i { background: var(--ink); color: var(--yellow); }
.npz-nav-btn:hover { transform: translate(-1px, -1px); box-shadow: 5px 5px 0 var(--ink); }
.npz-nav-btn:active { transform: translate(2px, 2px); box-shadow: 2px 2px 0 var(--ink); }
.npz-nav-btn:disabled { opacity: 0.4; cursor: default; transform: none; }
.npz-nav-btn.next.is-ready { background: var(--lime); }

/* Circuit list with Hall of Fame drawers */
.npz-circuits { position: absolute; left: var(--pad-l); top: 50%; transform: translateY(-46%); display: flex; flex-direction: column; gap: 12px; }
.npz-circuit { pointer-events: auto; cursor: pointer; display: flex; align-items: stretch; }
.npz-circuit .card { position: relative; z-index: 1; width: min(380px, 38vw); display: flex; gap: 12px; align-items: center; padding: 10px 14px 10px 10px; overflow: hidden; transition: transform 0.15s, box-shadow 0.15s; }
.npz-circuit .card .band { position: absolute; left: 0; top: 0; bottom: 0; width: 6px; background: linear-gradient(180deg, var(--w1), var(--w2)); }
.npz-circuit .card canvas { width: 74px; height: 74px; flex: none; margin-left: 6px; border-radius: 8px; background: radial-gradient(circle at 50% 40%, color-mix(in srgb, var(--w1) 45%, transparent), transparent 75%); }
.npz-circuit .txt { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
.npz-circuit .world { font-family: var(--body); font-weight: 800; font-size: 9px; letter-spacing: 1.8px; color: var(--w2); }
.npz-circuit .txt b { font-size: 20px; font-style: italic; line-height: 1.05; }
.npz-circuit .txt p { margin: 0; font-family: var(--body); font-weight: 600; font-size: 11px; opacity: 0.8; line-height: 1.3; }
.npz-circuit .tags { display: flex; gap: 6px; margin-top: 3px; }
.npz-circuit .card { opacity: 0.62; filter: saturate(0.55); transform: scale(0.97); transform-origin: left center; transition: transform 0.25s cubic-bezier(.2,1.3,.4,1), opacity 0.2s, filter 0.2s, background 0.25s; }
.npz-circuit .card .band { transition: width 0.25s, box-shadow 0.25s; }
.npz-circuit:hover .card { opacity: 0.9; filter: none; transform: scale(0.99) translateX(3px); }
/* The chosen map lights up in its own world colours instead of an outline. */
.npz-circuit.on .card { opacity: 1; filter: none; transform: translateX(12px); background: linear-gradient(100deg, rgba(20,11,42,0.96) 30%, color-mix(in srgb, var(--w1) 55%, rgba(20,11,42,0.9))); }
.npz-circuit.on .card .band { width: 10px; box-shadow: 0 0 18px var(--w2), 0 0 4px var(--w3); }
.npz-circuit.on .card canvas { filter: drop-shadow(0 0 6px var(--w3)); }
.npz-circuit.on .world { color: var(--w3); }
.npz-circuit .fame { width: 0; overflow: hidden; transition: width 0.35s cubic-bezier(.2,1.3,.4,1); display: flex; align-items: center; }
.npz-circuit.on .fame { width: 260px; }
/* The drawer: a trophy ticket pulled out from behind the card, with a perforated edge. */
.npz-circuit .ticket { flex: none; position: relative; margin-left: 4px; width: 250px; padding: 9px 12px 10px 20px; background: var(--cream); color: var(--ink); border: 3px solid var(--ink); border-left: 0; border-radius: 0 12px 12px 0; box-shadow: 4px 4px 0 var(--ink); animation: npz-ticket 0.45s cubic-bezier(.2,1.3,.4,1); }
.npz-circuit .ticket::before { content: ''; position: absolute; left: 0; top: 6px; bottom: 6px; width: 8px; background: radial-gradient(circle at 0 50%, var(--ink) 3px, transparent 3.5px) 0 0 / 8px 12px repeat-y; }
.npz-circuit .ticket .top { display: flex; align-items: center; gap: 6px; margin-bottom: 6px; }
.npz-circuit .ticket .top .npz-label { color: var(--ink); }
.npz-circuit .ticket .trophy { font-size: 16px; filter: drop-shadow(1px 1px 0 var(--ink)); }
.npz-circuit .ticket .bar { display: grid; grid-template-columns: 26px auto 1fr; align-items: center; gap: 8px; padding: 3px 0; border-top: 2px dashed rgba(11,7,22,0.15); animation: npz-bar 0.5s both; }
.npz-circuit .ticket .bar.r2 { animation-delay: 0.08s; }
.npz-circuit .ticket .bar.r3 { animation-delay: 0.16s; }
.npz-circuit .ticket .medal { width: 24px; height: 24px; border-radius: 50%; border: 2px solid var(--ink); display: grid; place-items: center; font-family: var(--display); font-style: italic; font-size: 12px; }
.npz-circuit .ticket .r1 .medal { background: linear-gradient(180deg, #fff27a, #ffc61a); box-shadow: 0 0 0 2px #fff27a; }
.npz-circuit .ticket .r2 .medal { background: linear-gradient(180deg, #f2f4ff, #aab3d6); }
.npz-circuit .ticket .r3 .medal { background: linear-gradient(180deg, #ffc58a, #d9823b); }
.npz-circuit .ticket .time { font-family: var(--display); font-style: italic; font-size: 15px; font-variant-numeric: tabular-nums; }
.npz-circuit .ticket .pod { font-family: var(--body); font-weight: 800; font-size: 9.5px; letter-spacing: 0.5px; opacity: 0.75; display: flex; align-items: center; gap: 4px; justify-content: flex-end; white-space: nowrap; }
.npz-circuit .ticket .pod i { width: 8px; height: 8px; border-radius: 50%; border: 1.5px solid var(--ink); }

/* Pod select */
.npz-shipcard { position: absolute; left: var(--pad-l); top: 50%; transform: translateY(-50%); width: min(330px, 34vw); padding: 12px 16px 14px; }
.npz-shipcard .nav { display: flex; align-items: center; gap: 10px; margin-top: 4px; }
.npz-shipcard .nav b { flex: 1; text-align: center; font-size: 24px; font-style: italic; white-space: nowrap; }
.npz-arrow { pointer-events: auto; cursor: pointer; width: 34px; height: 34px; border: 3px solid var(--ink); border-radius: 50%; background: var(--yellow); color: var(--ink); font-size: 13px; box-shadow: 2px 2px 0 var(--ink); display: grid; place-items: center; }
.npz-arrow:active { transform: translate(1px, 1px); box-shadow: 1px 1px 0 var(--ink); }
.npz-arrow:disabled { opacity: 0.4; }
.npz-shipcard p { font-family: var(--body); font-weight: 600; font-size: 12.5px; opacity: 0.85; text-align: center; margin: 6px 0 12px; }
.npz-stats { display: grid; grid-template-columns: auto 1fr; gap: 7px 12px; align-items: center; }
.npz-stats .pips { display: flex; gap: 4px; }
.npz-stats .pips i { flex: 1; height: 8px; border-radius: 2px; background: rgba(255,255,255,0.14); }
.npz-stats .pips i.on { background: linear-gradient(90deg, var(--cyan), var(--yellow)); }
.npz-dots { display: flex; justify-content: center; gap: 6px; margin-top: 14px; }
.npz-dots i { width: 8px; height: 8px; border-radius: 50%; background: rgba(255,255,255,0.25); border: 1px solid var(--ink); }
.npz-dots i.on { background: var(--yellow); }
.npz-controls { font-family: var(--body); font-weight: 700; font-size: 11px; opacity: 0.85; display: flex; flex-wrap: wrap; gap: 6px 12px; justify-content: center; margin-top: 14px; }
.npz-controls kbd { font-family: var(--display); font-size: 10px; background: var(--cream); color: var(--ink); border: 2px solid var(--ink); border-radius: 4px; padding: 0 5px; margin-right: 3px; }
.npz-rivals { position: absolute; right: var(--pad-r); top: 50%; transform: translateY(-50%); width: min(290px, 30vw); padding: 12px 12px 8px; display: flex; flex-direction: column; gap: 8px; }
.npz-rivals .rival { pointer-events: auto; cursor: pointer; display: flex; align-items: center; gap: 12px; padding: 9px 10px; border-radius: 9px; background: rgba(255,255,255,0.05); border: 2px solid transparent; color: #fff; text-align: left; transition: background 0.15s, transform 0.12s; }
.npz-rivals .rival:hover { transform: translateX(-3px); }
.npz-rivals .rival.on { background: linear-gradient(90deg, rgba(255,61,242,0.28), rgba(255,61,242,0.08)); border-color: var(--pink); }
.npz-rivals .meter { display: flex; gap: 3px; align-items: flex-end; }
.npz-rivals .meter i { width: 7px; border-radius: 2px; background: rgba(255,255,255,0.18); border: 1.5px solid var(--ink); }
.npz-rivals .meter i:nth-child(1) { height: 10px; }
.npz-rivals .meter i:nth-child(2) { height: 16px; }
.npz-rivals .meter i:nth-child(3) { height: 22px; }
.npz-rivals .meter i.on { background: var(--yellow); }
.npz-rivals .rival.on .meter i.on { background: var(--pink); }
.npz-rivals .txt { display: flex; flex-direction: column; gap: 2px; }
.npz-rivals .txt b { font-family: var(--display); font-style: italic; font-size: 16px; }
.npz-rivals .txt small { font-family: var(--body); font-weight: 600; font-size: 11px; opacity: 0.75; }

/* Pause */
.npz-pause { background: rgba(11,7,22,0.66); display: none; place-items: center; }
.npz-pause.on { display: grid; }
.npz-pause .box { padding: 22px 28px; display: flex; flex-direction: column; gap: 12px; align-items: stretch; min-width: 260px; text-align: center; }
.npz-pause h2 { margin: 0 0 4px; font-size: 32px; font-style: italic; color: var(--yellow); -webkit-text-stroke: 3px var(--ink); paint-order: stroke fill; text-shadow: 3px 3px 0 var(--ink); }

/* Results */
.npz-results { background: rgba(11,7,22,0.35); display: none; place-items: center; }
.npz-results.on { display: grid; }
.npz-results .box { width: min(520px, 92vw); padding: 16px 20px 18px; animation: npz-slide 0.45s cubic-bezier(.2,1.4,.4,1); }
.npz-results h2 { margin: 0; text-align: center; font-size: clamp(38px, 4.6vw, 58px); font-style: italic; -webkit-text-stroke: 4px var(--ink); paint-order: stroke fill; text-shadow: 5px 5px 0 var(--ink); transform: skewX(-9deg) rotate(-2deg); }
.npz-results h2.win { color: var(--yellow); }
.npz-results h2.lose { color: var(--red); }
.npz-results h2 { color: #fff; }
.npz-medals { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin: 4px 0 2px; }
.npz-medals .medal { display: flex; flex-direction: column; align-items: center; gap: 2px; padding: 8px 4px 7px; border-radius: 9px; border: 2px solid rgba(255,255,255,0.12); background: rgba(255,255,255,0.04); opacity: 0.55; }
.npz-medals .medal i { width: 26px; height: 26px; border-radius: 50%; border: 2px solid var(--ink); background: var(--m); display: grid; place-items: center; font-style: normal; font-size: 13px; color: var(--ink); box-shadow: 2px 2px 0 var(--ink); }
.npz-medals .medal span { font-family: var(--body); font-weight: 800; font-size: 9.5px; letter-spacing: 1.5px; color: var(--m); }
.npz-medals .medal b { font-family: var(--display); font-style: italic; font-size: 15px; font-variant-numeric: tabular-nums; }
.npz-medals .medal.got { opacity: 1; border-color: var(--m); background: color-mix(in srgb, var(--m) 14%, transparent); }
.npz-results .sub { text-align: center; font-family: var(--body); font-weight: 800; font-size: 12px; letter-spacing: 1px; color: var(--cyan); margin: 4px 0 10px; }
.npz-results table { width: 100%; border-collapse: collapse; font-family: var(--body); font-weight: 700; font-size: 12.5px; }
.npz-results td { padding: 3px 6px; border-bottom: 1px solid rgba(255,255,255,0.07); white-space: nowrap; }
.npz-results td.nm { width: 100%; }
.npz-results td.pl { font-family: var(--display); font-style: italic; }
.npz-results td.tm { font-variant-numeric: tabular-nums; text-align: right; }
.npz-results tr.me td { background: var(--yellow); color: var(--ink); }
.npz-results .score { margin-top: 10px; display: grid; grid-template-columns: 1fr auto; gap: 2px 12px; font-family: var(--body); font-weight: 700; font-size: 12.5px; }
.npz-results .score .tot { font-family: var(--display); font-size: 22px; color: var(--yellow); font-style: italic; margin-top: 4px; }
.npz-results .npz-btn { margin-top: 12px; width: 100%; }

/* Finish screen: header, result hero beside the standings, score chips, action */
.npz-results .box.res { width: min(780px, 94vw); padding: 16px 20px 18px; }
.npz-results .res-head { display: flex; flex-direction: column; align-items: center; gap: 2px; }
.npz-results .res-head .npz-label { opacity: 0.8; }
.npz-results .res h2 { font-size: clamp(30px, 3.6vw, 46px); }
.npz-results .res-body { display: grid; grid-template-columns: 220px 1fr; gap: 14px; margin-top: 12px; align-items: stretch; }
.npz-results .res-hero { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; padding: 14px 12px; border-radius: 12px; background: linear-gradient(180deg, rgba(255,255,255,0.07), rgba(255,255,255,0.02)); border: 2px solid rgba(255,255,255,0.08); text-align: center; }
.npz-results .res-hero.win { background: linear-gradient(180deg, rgba(255,225,77,0.16), rgba(255,225,77,0.03)); }
.npz-results .res-hero .place { display: flex; align-items: flex-start; line-height: 0.9; transform: skewX(-8deg); }
.npz-results .res-hero .place b { font-size: 84px; font-style: italic; color: #fff; -webkit-text-stroke: 4px var(--ink); paint-order: stroke fill; text-shadow: 5px 5px 0 var(--ink); }
.npz-results .res-hero.win .place b { color: var(--yellow); }
.npz-results .res-hero .place sup { font-size: 24px; font-style: italic; margin: 8px 0 0 4px; -webkit-text-stroke: 2px var(--ink); paint-order: stroke fill; }
.npz-results .res-hero .stats { display: grid; grid-template-columns: auto auto; gap: 3px 12px; align-items: baseline; margin-top: 6px; }
.npz-results .res-hero .stats span { font-family: var(--body); font-weight: 800; font-size: 10px; letter-spacing: 1.5px; opacity: 0.65; text-align: right; }
.npz-results .res-hero .stats b { font-style: italic; font-size: 17px; font-variant-numeric: tabular-nums; text-align: left; }
.npz-results .res-hero .big { font-size: 34px; font-style: italic; font-variant-numeric: tabular-nums; -webkit-text-stroke: 3px var(--ink); paint-order: stroke fill; text-shadow: 3px 3px 0 var(--ink); }
.npz-results .res-hero .disc { width: 70px; height: 70px; border-radius: 50%; display: grid; place-items: center; font-size: 34px; color: var(--ink); background: radial-gradient(circle at 35% 30%, #fff 0%, var(--m) 45%, color-mix(in srgb, var(--m) 60%, #000) 100%); border: 3px solid var(--ink); box-shadow: 4px 4px 0 var(--ink), 0 0 30px color-mix(in srgb, var(--m) 50%, transparent); margin-bottom: 4px; }
.npz-results .res-hero .delta { font-family: var(--body); font-weight: 800; font-size: 12px; opacity: 0.8; }
.npz-results .res-hero .delta.up { color: var(--lime); opacity: 1; }
.npz-results .res-hero .delta.down { color: #ff8a9a; opacity: 1; }
.npz-results .res-hero .npz-record { margin-top: 6px; font-size: 12px; }
.npz-results .res-list { display: flex; flex-direction: column; gap: 8px; min-width: 0; }
.npz-results .res-list .npz-medals { margin: 0; }
.npz-results .res table { border-collapse: separate; border-spacing: 0 3px; font-size: 12.5px; }
.npz-results .res td { border: 0; padding: 5px 8px; background: rgba(255,255,255,0.04); }
.npz-results .res td:first-child { border-radius: 7px 0 0 7px; width: 28px; text-align: center; }
.npz-results .res td:last-child { border-radius: 0 7px 7px 0; }
.npz-results .res td.nm { width: 100%; }
.npz-results .res td.nm em { font-style: normal; font-size: 8.5px; letter-spacing: 1px; padding: 1px 5px; border-radius: 3px; background: rgba(255,255,255,0.12); margin-left: 6px; vertical-align: 1px; }
.npz-results .res td.dt { font-size: 10.5px; opacity: 0.55; }
.npz-results .res td .dot { display: inline-block; width: 10px; height: 10px; border-radius: 50%; border: 2px solid var(--ink); margin-right: 8px; vertical-align: -1px; }
.npz-results .res tr.me td { background: rgba(255,225,77,0.18); color: var(--yellow); }
.npz-results .res tr.me td.dt { color: #fff; }
.npz-results .res tr.open td { opacity: 0.4; }
.npz-results .res-score { display: grid; grid-template-columns: repeat(3, 1fr) 1.15fr; gap: 8px; margin-top: 14px; }
.npz-results .res-score .chip { display: flex; flex-direction: column; gap: 2px; padding: 8px 10px; border-radius: 9px; background: rgba(255,255,255,0.05); border: 2px solid rgba(255,255,255,0.07); }
.npz-results .res-score .chip span { font-family: var(--body); font-weight: 800; font-size: 9.5px; letter-spacing: 1.5px; opacity: 0.65; }
.npz-results .res-score .chip b { font-style: italic; font-size: 20px; font-variant-numeric: tabular-nums; }
.npz-results .res-score .chip small { font-family: var(--body); font-weight: 700; font-size: 9.5px; opacity: 0.55; }
.npz-results .res-score .chip.total { background: var(--yellow); color: var(--ink); border-color: var(--ink); box-shadow: 3px 3px 0 var(--ink); justify-content: center; }
.npz-results .res-score .chip.total span { opacity: 0.75; }
.npz-results .res-score .chip.total b { font-size: 28px; }
@media (max-width: 640px) {
  .npz-results .res-body { grid-template-columns: 1fr; }
  .npz-results .res-score { grid-template-columns: 1fr 1fr; }
}


/* Solo mode cards: Grand Prix or Time Attack */
.npz-root [hidden] { display: none !important; }
.npz-modecards { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -48%); display: flex; gap: clamp(16px, 3vw, 40px); }
.npz-modecards .modecard { pointer-events: auto; cursor: pointer; width: min(320px, 36vw); display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 22px 22px 20px; color: #fff; text-align: center; font: inherit; transition: transform 0.15s, box-shadow 0.15s, background 0.15s; }
.npz-modecards .icon { width: 86px; height: 86px; border-radius: 50%; display: grid; place-items: center; border: 3px solid var(--ink); box-shadow: 4px 4px 0 var(--ink); background: var(--cyan); transition: transform 0.2s; }
.npz-modecards .m1 .icon { background: var(--pink); }
.npz-modecards .icon svg { width: 56px; height: 56px; }
.npz-modecards b { font-size: clamp(24px, 2.6vw, 32px); font-style: italic; }
.npz-modecards p { margin: 0; font-family: var(--body); font-weight: 600; font-size: 13px; line-height: 1.4; opacity: 0.85; min-height: 3.6em; }
.npz-modecards .tags { display: flex; gap: 6px; flex-wrap: wrap; justify-content: center; }
.npz-modecards .modecard { --glow: var(--cyan); }
.npz-modecards .modecard.m1 { --glow: var(--pink); }
.npz-modecards .modecard::after { content: 'PLAY \u25B6'; font-family: var(--display); font-style: italic; font-size: 13px; letter-spacing: 1px; color: var(--ink); background: var(--glow); border: 2px solid var(--ink); border-radius: 6px; padding: 4px 12px; margin-top: 4px; opacity: 0; transform: translateY(6px); transition: opacity 0.15s, transform 0.15s; }
.npz-modecards .modecard:hover, .npz-modecards .modecard.focus { transform: translateY(-8px); box-shadow: 5px 9px 0 var(--ink), 0 0 44px color-mix(in srgb, var(--glow) 35%, transparent); background: linear-gradient(180deg, rgba(20,11,42,0.96), color-mix(in srgb, var(--glow) 18%, rgba(20,11,42,0.96))); }
.npz-modecards .modecard:hover::after, .npz-modecards .modecard.focus::after { opacity: 1; transform: none; }
.npz-modecards .modecard:hover .icon, .npz-modecards .modecard.focus .icon { transform: rotate(-8deg) scale(1.08); }
.npz-modecards .modecard:active { transform: translateY(-3px) scale(0.99); }
.npz-nav-btn.spacer { visibility: hidden; pointer-events: none; }

/* Title modes: two equal buttons */
.npz-modes { display: flex; gap: 16px; flex-wrap: wrap; justify-content: center; }
.npz-modes .npz-btn.big { width: 290px; font-size: 21px; padding: 13px 0; }
.npz-btn.pink { background: var(--pink); }
.npz-btn:disabled { opacity: 0.45; cursor: default; transform: none; box-shadow: 3px 3px 0 var(--ink); }

/* Friends lobby */
.npz-lobby .col.left { position: absolute; left: var(--pad-l); top: 96px; width: min(320px, 34vw); display: flex; flex-direction: column; gap: 14px; }
.npz-lobby .podcard { padding: 12px 14px; text-align: center; }
.npz-lobby .podcard .nav { display: flex; align-items: center; gap: 8px; margin-top: 6px; }
.npz-lobby .podcard .nav b { flex: 1; font-size: 20px; font-style: italic; white-space: nowrap; }
.npz-lobby .podcard p { font-family: var(--body); font-weight: 600; font-size: 12px; opacity: 0.85; margin: 6px 0 10px; }
.npz-lobby .podcard .npz-btn { font-size: 13px; padding: 7px 14px; }
.npz-lobby .circuit { padding: 10px 12px; }
.npz-lobby .maps { display: flex; gap: 8px; margin-top: 6px; }
.npz-lobby .map { pointer-events: auto; cursor: pointer; flex: 1; background: rgba(255,255,255,0.05); border: 2px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 6px 4px; color: #fff; display: flex; flex-direction: column; align-items: center; gap: 4px; font-family: var(--display); font-style: italic; font-size: 9.5px; }
.npz-lobby .map canvas { width: 54px; height: 54px; }
.npz-lobby .map.on { border-color: var(--yellow); background: rgba(255,225,77,0.14); box-shadow: 0 0 0 2px var(--ink); }
.npz-lobby .map:disabled { cursor: default; }
.npz-lobby .map:disabled:not(.on) { opacity: 0.45; }
.npz-lobby .note { font-family: var(--body); font-weight: 700; font-size: 11px; opacity: 0.8; margin: 8px 0 0; text-align: center; }
.npz-lobby .seats { position: absolute; right: var(--pad-r); top: 96px; width: min(330px, 36vw); padding: 10px 12px; display: flex; flex-direction: column; gap: 8px; }
.npz-lobby .seats > div { display: flex; flex-direction: column; gap: 6px; }
.npz-lobby .seats .invite { font-size: 13px; padding: 7px 12px; }
.npz-lobby .seats .cpu { display: flex; align-items: center; gap: 8px; padding: 6px 9px; border-radius: 7px; background: rgba(54,243,255,0.08); font-family: var(--body); font-weight: 700; font-size: 11.5px; }
.npz-lobby .seats .cpu b { font-family: var(--display); font-style: italic; font-size: 12px; color: var(--cyan); white-space: nowrap; }
.npz-lobby .seats .cpu span { opacity: 0.8; }
.npz-lobby .seat { display: grid; grid-template-columns: 14px 1fr auto; grid-template-rows: auto auto; column-gap: 8px; align-items: center; padding: 7px 9px; border-radius: 7px; background: rgba(255,255,255,0.05); border: 2px solid transparent; font-family: var(--body); font-weight: 800; font-size: 12.5px; }
.npz-lobby .seat .dot { grid-row: span 2; width: 12px; height: 12px; border-radius: 50%; border: 2px solid var(--ink); background: rgba(255,255,255,0.15); }
.npz-lobby .seat .nm em { font-style: normal; font-size: 9px; letter-spacing: 1px; color: var(--yellow); margin-left: 4px; }
.npz-lobby .seat .pod { grid-column: 2; font-size: 10.5px; opacity: 0.75; font-weight: 700; }
.npz-lobby .seat .st { grid-column: 3; grid-row: 1 / span 2; font-family: var(--display); font-style: italic; font-size: 10px; padding: 3px 7px; border-radius: 4px; background: rgba(255,255,255,0.1); }
.npz-lobby .seat.ready .st { background: var(--lime); color: var(--ink); }
.npz-lobby .seat.me { border-color: rgba(255,225,77,0.6); }
.npz-lobby .seat.empty { opacity: 0.5; border-style: dashed; border-color: rgba(255,255,255,0.2); }
.npz-lobby .seat.empty .nm { grid-row: span 2; }

/* Floating rival names */
.npz-tags { position: absolute; inset: 0; overflow: hidden; }
.npz-tag3d { position: absolute; left: 0; top: 0; display: flex; align-items: center; gap: 5px; padding: 2px 8px 2px 5px; border-radius: 10px; background: rgba(20, 11, 42, 0.85); border: 2px solid var(--ink); box-shadow: 2px 2px 0 var(--ink); font-family: var(--display); font-style: italic; font-size: 11px; white-space: nowrap; transform-origin: 50% 100%; will-change: transform; }
.npz-tag3d i { width: 8px; height: 8px; border-radius: 50%; border: 1.5px solid var(--ink); }
.npz-tag3d.friend { background: var(--yellow); color: var(--ink); }

/* Results extras */
.npz-record { display: block; width: fit-content; margin: 6px auto 0; font-family: var(--display); font-style: italic; font-size: 14px; color: var(--ink); background: linear-gradient(90deg, #fff27a, #ffc61a); border: 3px solid var(--ink); border-radius: 6px; padding: 3px 12px; box-shadow: 3px 3px 0 var(--pink); animation: npz-pop 0.4s cubic-bezier(.2,1.7,.4,1); }
.npz-results .live { text-align: center; font-family: var(--body); font-weight: 800; font-size: 11px; opacity: 0.75; margin-top: 8px; }

@media (max-width: 900px) {
  .npz-lobby .col.left { top: 80px; }
  .npz-lobby .seats { top: 80px; }
}

@keyframes npz-ticket { 0% { transform: translateX(-60px); opacity: 0; } 100% { transform: none; opacity: 1; } }
@keyframes npz-bar { 0% { transform: translateX(-14px); opacity: 0; } 100% { transform: none; opacity: 1; } }
@keyframes npz-pop { 0% { transform: skewX(-8deg) scale(0.3); } 100% { transform: skewX(-8deg) scale(1); } }
@keyframes npz-blink { 50% { opacity: 0.35; } }
@keyframes npz-slide { 0% { transform: translateY(30px) scale(0.9); opacity: 0; } 100% { transform: none; opacity: 1; } }

@media (max-height: 600px) {
  .npz-stand { display: none; }
  .npz-circuit .txt p { display: none; }
  .npz-controls { display: none; }
}
@media (max-width: 760px) {
  .npz-map { display: none; }
  .npz-lap { left: auto; right: var(--pad-r); transform: none; flex-direction: column; }
  .npz-lap > div + div { border-left: 0; border-top: 2px solid rgba(255,255,255,0.1); }
  .npz-pos { width: 150px; }
  .npz-gauge { width: 150px; height: 150px; }
  .npz-circuit .card { width: min(300px, 70vw); }
  .npz-circuit .txt p { display: none; }
  .npz-circuit.on .fame { width: 0; }
  .npz-shipcard { left: 50%; top: auto; bottom: calc(var(--pad-b) + 72px); transform: translateX(-50%); width: min(340px, 90vw); }
  .npz-rivals { display: none; }
  .npz-nav-btn { width: 130px; font-size: 15px; }
}
`;
function za() {
  let n = document.createElement("style");
  n.textContent = hi, document.head.append(n);
}
var mi = ke.ready();
za();
var bi = 1.25,
  We = new N.WebGLRenderer({
    antialias: !1,
    powerPreference: "high-performance"
  });
We.outputColorSpace = N.SRGBColorSpace;
We.toneMapping = N.ACESFilmicToneMapping;
We.toneMappingExposure = 1;
We.domElement.style.cssText = "display:block;touch-action:none;position:fixed;inset:0;width:100%;height:100%";
document.body.style.cssText = "margin:0;overflow:hidden;background:#0b0716";
document.body.append(We.domElement);
var Be = new N.Scene(),
  _ = new N.PerspectiveCamera(70, 1, 0.3, 6e3),
  po = Js(We, Be, _),
  _e = document.createElement("div");
_e.className = "npz-root";
document.body.append(_e);
var cs = document.createElement("div");
cs.className = "npz-pops";
var ps = document.createElement("div");
ps.className = "npz-flash";
_e.append(cs, ps);
var ds = new so(_e),
  tt = new eo(_e),
  Ge = document.createElement("div");
Ge.className = "npz-msg";
Ge.innerHTML = '<div class="m"></div><div class="s"></div>';
_e.append(Ge);
var Zt = document.createElement("div");
Zt.className = "npz-np";
_e.append(Zt);
function fs(n) {
  let e = Vo(n);
  e && (Zt.innerHTML = `<i>\u266A</i><span>NOW PLAYING</span><b>${e}</b>`, Zt.classList.remove("on"), Zt.offsetWidth, Zt.classList.add("on"));
}
var re = new no(_e);
re.records = n => zt(n);
var Qe = document.createElement("div");
Qe.className = "npz-overlay npz-pause";
Qe.innerHTML = `<div class="npz-panel accent box"><h2>PAUSED</h2>
  <button class="npz-btn primary" data-act="resume">RESUME</button>
  <button class="npz-btn" data-act="restart">RESTART RACE</button>
  <button class="npz-btn" data-act="menu">QUIT TO MENU</button></div>`;
_e.append(Qe);
var Ve = document.createElement("div");
Ve.className = "npz-overlay npz-results";
_e.append(Ve);
var Je = new Fn(_, cs);
Be.add(Je.group);
var $e = null;
function tn(n) {
  if ($e?.id === n.id) return $e;
  $e && (Be.remove($e.group), yo($e.group));
  let e = new st(n),
    t = oa(e),
    o = Ma(e),
    s = new N.Group();
  return s.add(o.group, t.group), Be.add(s), Be.fog = new N.Fog(o.fog.color, o.fog.near, o.fog.far), Be.background = new N.Color(n.theme.fog), $e = {
    id: n.id,
    track: e,
    visuals: t,
    world: o,
    group: s
  }, tt.setTrack(e), ys(), $e;
}
var ze = null;
function us() {
  mo();
  let n = tn(re.def);
  ze = new _t(n.track, n.visuals, Je, ua, re.state.ship, 2, !0), ze.viewer = _.position, Be.add(ze.group), ys(), is = !1;
}
function mo() {
  ze && (Be.remove(ze.group), yo(ze.group), ze = null);
}
var De = null;
function It(n, e = re.state.ship) {
  if (De && (Be.remove(De.root), yo(De.root), De = null), !n) return;
  let t = Z[e];
  De = sn(t.id, Ee[t.livery]), De.blob.position.y = -2.3, Be.add(De.root);
}
var Ae = "menu",
  R = null,
  et = !1,
  en = !1,
  wn = -1,
  lt = -1,
  Ue = 0,
  La = 1 / 0,
  Tn = 0,
  gi = {
    t: 0,
    d: 0,
    x: 0,
    h: 0,
    p: 0,
    f: 0,
    r: 0,
    st: 0,
    dr: 0,
    b: 0
  },
  xn = 0;
function Ct(n, e = "#ffffff", t = "") {
  let o = Ge.firstElementChild,
    s = Ge.lastElementChild;
  o.textContent = n, o.style.color = e, s.textContent = t, Ge.className = "npz-msg", /^[0-9]$/.test(n) && Ge.classList.add("count"), Ge.offsetWidth, Ge.classList.add("pop"), Ge.style.opacity = "1", xn = /^[0-9]$/.test(n) ? 0.7 : 1.5;
}
var Ze = 0,
  Rn = 0,
  ro = 0,
  Qt = 0,
  ns = 0,
  Mn = 0,
  bo = 0,
  Xo = 0,
  os = {
    sound(n, e, t = 1) {
      let o = t;
      e && (o *= Math.max(0, 1 - e.distanceTo(_.position) / 140) * 0.8), Fe(n, o);
    },
    shake(n) {
      Ze = Math.min(1, Ze + n);
    },
    flash(n, e) {
      po.comic.uniforms.uFlash.value.set(n), Rn = Math.max(Rn, e);
    },
    glitch(n) {
      Qt = Math.max(Qt, n), Ze = Math.min(1, Ze + 0.12);
    },
    sonic(n) {
      n.isPlayer && (ns = 3, Ze = Math.min(1, Ze + 0.1));
    },
    message: Ct,
    finish() {
      let n = R,
        e = n.player;
      if (ro = 0.6, wn = 2.4, bo = 6, Mn = 1.3, n.trial) {
        let o = n.cpTimes.get(e) ?? [],
          s = n.track.checkpoints.slice(1).map((r, l) => o[l + 1] ?? NaN);
        La = zt(n.track.def.id)[0]?.time ?? 1 / 0, Ue = Wo(n.track.def.id, e.finishTime, re.state.ship, s), tt.setMode(!0, zt(n.track.def.id)[0]?.time ?? 1 / 0);
        let a = hs(n, e.finishTime);
        Ct(Ue === 1 ? "NEW RECORD!" : a ? `${a.name} MEDAL!` : "FINISH!", a ? a.color : "#ffffff", Me(e.finishTime)), Fe(a || Ue ? "final" : "lap");
        return;
      }
      let t = e.place <= 3;
      Ct(e.place === 1 ? "CHAMPION!" : t ? "PODIUM!" : "FINISH", t ? "#ffe14d" : "#ffffff", `${Pa(e.place)} of ${n.racers.length}`), Fe(t ? "final" : "lap"), Ue = Wo(n.track.def.id, e.finishTime, re.state.ship);
    },
    rivalFinish(n) {
      false;
    }
  },
  Aa = [new N.Color(3, 2.4, 0.6), new N.Color(0.6, 2.6, 3), new N.Color(3, 0.7, 2.6), new N.Color(1.6, 3, 0.8)],
  Zo = new N.Vector3();
function vi(n) {
  if (bo -= n, Xo -= n, Xo > 0 || !R) return;
  Xo = 0.28 + Math.random() * 0.25, R.track.point(R.track.open ? R.track.finishS : 0, (Math.random() - 0.5) * 40, 22 + Math.random() * 18, Zo);
  let e = Aa[Math.floor(Math.random() * Aa.length)];
  Je.burst(Zo, e, 70, 26, 2, 1.3), os.sound("land", Zo, 0.35);
}
var Ia = [{
  name: "GOLD",
  color: "#ffe14d",
  points: 5e3
}, {
  name: "SILVER",
  color: "#dfe6ff",
  points: 3600
}, {
  name: "BRONZE",
  color: "#ffae6b",
  points: 2600
}];
function fo(n, e) {
  return n.track.def.medals?.[e] ?? n.lapLen / [115, 105, 95][e];
}
function hs(n, e) {
  return Ia.find((t, o) => e <= fo(n, o)) ?? null;
}
function Pa(n) {
  return `${n}${n === 1 ? "st" : n === 2 ? "nd" : n === 3 ? "rd" : "th"}`;
}
function ms() {
  mo(), It(!1);
  let e = tn(re.def);
  R && gs(), Je.clear(), R = new _t(e.track, e.visuals, Je, os, re.state.ship, re.state.difficulty), R.viewer = _.position, ds.setRace(R);
  let t = zt(e.track.def.id)[0];
  R.trial && (R.recordSplits = t?.splits ?? null), tt.setMode(R.trial, t?.time ?? 1 / 0), Ue = 0, Mn = 0, bo = 0, Qt = 0, Be.add(R.group), ys(), Ae = "race", et = !1, en = !1, wn = -1, lt = -1, io = !1, lo = 0, re.show("hidden"), tt.show(!0), Qe.classList.remove("on"), Ve.classList.remove("on"), _.clearViewOffset(), fs(Zs(e.track.def.id)), R.trial ? Ct(e.track.def.name, "#36f3ff", `TIME ATTACK \xB7 ${(R.lapLen / 1e3).toFixed(1)} KM${t ? ` \xB7 RECORD ${Me(t.time)}` : ""}`) : Ct(e.track.def.name, "#36f3ff", `${e.track.def.laps} LAPS \xB7 ${R.racers.length} PILOTS`);
}
var go = new Set();
function gs() {
  R && (Be.remove(R.group), R.dispose(), yo(R.group), R = null, ds.setRace(null));
}
function Pt(n = "title") {
  gs(), Je.clear(), Ae = "menu", et = !1, tt.show(!1), Qe.classList.remove("on"), Ve.classList.remove("on"), Ge.style.opacity = "0", tn(re.def), re.show(n), fs("menu"), dn(0, !1, !1, !1);
}
function uo(n) {
  Ae !== "race" || !R || R.playerFinished || (Qe.querySelector('[data-act="restart"]').toggleAttribute("hidden", false), Qe.querySelector("h2").textContent = "PAUSED", et = n, Qe.classList.toggle("on", n), n && dn(0, !1, !1, !1));
}
function Ba() {
  let n = R,
    e = n.player,
    t = Math.max(0, 1e3 - e.wallHits * 40 - e.glitchHits * 100);
  if (n.trial) {
    let r = hs(n, e.finishTime),
      l = Math.max(0, Math.round((fo(n, 2) - e.finishTime) * 40)),
      i = r ? r.points : 1400;
    return {
      total: i + l + t,
      place: 1,
      bonus: l,
      clean: t,
      placePts: i
    };
  }
  let o = n.laps * n.track.L / 72,
    s = Math.max(0, Math.round((o - e.finishTime) * 25)),
    a = ha[e.place - 1] ?? 0;
  return {
    total: a + s + t,
    place: e.place,
    bonus: s,
    clean: t,
    placePts: a
  };
}
var as = n => `<i class="dot" style="background:${n}"></i>`;
function Va(n) {
  let e = Ba(),
    t = R.player;
  return `<div class="res-score">
    <div class="chip"><span>${n}</span><b>${e.placePts}</b></div>
    <div class="chip"><span>TIME BONUS</span><b>+${e.bonus}</b></div>
    <div class="chip"><span>CLEAN LINE</span><b>+${e.clean}</b><small>${t.wallHits} scrapes \xB7 ${t.glitchHits} glitches</small></div>
    <div class="chip total"><span>SCORE</span><b>${e.total}</b></div>
  </div>`;
}
function Oa() {
  return '<button class="npz-btn primary" data-act="menu">MAIN MENU</button>';
}
function yi() {
  let n = R,
    e = n.player,
    t = hs(n, e.finishTime),
    o = Ia.map((i, c) => {
      let p = e.finishTime <= fo(n, c);
      return `<div class="medal ${p ? "got" : ""}" style="--m:${i.color}"><i>${p ? "\u2605" : ""}</i><span>${i.name}</span><b>${Me(fo(n, c))}</b></div>`;
    }).join(""),
    s = zt(n.track.def.id),
    a = [0, 1, 2].map(i => {
      let c = s[i];
      return c ? `<tr class="${i + 1 === Ue ? "me" : ""}"><td class="pl">${i + 1}</td><td class="nm">${as(Ee[Z[c.ship]?.livery ?? 0].main)}${Z[c.ship]?.name ?? ""}</td><td class="dt">${c.date}</td><td class="tm">${Me(c.time)}</td></tr>` : `<tr class="open"><td class="pl">${i + 1}</td><td class="nm">${as("transparent")}Open spot</td><td class="dt"></td><td class="tm">--:--.--</td></tr>`;
    }).join(""),
    r = e.finishTime - La,
    l = Number.isFinite(r) ? `<span class="delta ${r <= 0 ? "up" : "down"}">${r <= 0 ? "\u2212" : "+"}${Math.abs(r).toFixed(2)}s vs record</span>` : '<span class="delta">First run on this route</span>';
  Ve.innerHTML = `<div class="npz-panel accent box res">
    <div class="res-head">
      <span class="npz-label">TIME ATTACK \xB7 ${n.track.def.name}</span>
      <h2 class="${t ? "win" : ""}" ${t ? `style="color:${t.color}"` : ""}>${t ? `${t.name} MEDAL!` : "ROUTE COMPLETE"}</h2>
    </div>
    <div class="res-body">
      <div class="res-hero">
        <div class="disc" style="--m:${t?.color ?? "#5a4b86"}">${t ? "\u2605" : "\u2713"}</div>
        <span class="npz-label">YOUR TIME</span>
        <b class="big">${Me(e.finishTime)}</b>
        ${l}
        ${Ue ? `<span class="npz-record">\u{1F3C6} ${Ue === 1 ? "NEW ROUTE RECORD" : `HALL OF FAME #${Ue}`}</span>` : ""}
      </div>
      <div class="res-list">
        <div class="npz-medals">${o}</div>
        <span class="npz-label">HALL OF FAME</span>
        <table>${a}</table>
      </div>
    </div>
    ${Va(t ? `${t.name} MEDAL` : "FINISH")}
    ${Oa()}
  </div>`, Ve.classList.add("on"), tt.show(!1), lt < 0 && !en && (lt = 3);
}
function ho() {
  if (!R) return;
  if (R.trial) return yi();
  let n = R,
    e = n.player,
    t = e.place,
    o = t <= 3,
    s = false,
    a = n.results().map(i => {
      let c = i.racer,
        p = c.dnf ? "DNF" : c.remote && !c.bot && !c.finished ? "RACING\u2026" : `${i.estimated ? "~" : ""}${Me(i.time)}`;
      return `<tr class="${c.isPlayer ? "me" : ""}"><td class="pl">${i.place}</td><td class="nm">${as(c.livery.main)}${c.name}${c.bot ? " <em>CPU</em>" : ""}</td><td class="dt">${c.spec.name}</td><td class="tm">${p}</td></tr>`;
    }).join(""),
    r = t === 1 ? "VICTORY!" : o ? "PODIUM!" : "DEFEAT",
    l = Pa(t).slice(String(t).length).toUpperCase();
  Ve.innerHTML = `<div class="npz-panel accent box res">
    <div class="res-head">
      <span class="npz-label">${"GRAND PRIX"} \xB7 ${n.track.def.name}</span>
      <h2 class="${o ? "win" : "lose"}">${r}</h2>
    </div>
    <div class="res-body">
      <div class="res-hero ${o ? "win" : ""}">
        <div class="place"><b>${t}</b><sup>${l}</sup></div>
        <span class="npz-label">OF ${n.racers.length} PODS</span>
        <div class="stats">
          <span>TIME</span><b>${Me(e.finishTime)}</b>
          <span>BEST LAP</span><b>${Me(e.bestLap)}</b>
        </div>
        ${Ue ? `<span class="npz-record">\u{1F3C6} HALL OF FAME #${Ue}</span>` : ""}
      </div>
      <div class="res-list">
        <table>${a}</table>
        ${s ? '<div class="live">Waiting for your friends to cross the line\u2026</div>' : ""}
      </div>
    </div>
    ${Va("POSITION")}
    ${Oa()}
  </div>`, Ve.classList.add("on"), tt.show(!1), !s && lt < 0 && !en && (lt = 3);
}
function Ti() {
  en || !R || (en = !0);
}
var Eo = new Set(),
  xi = new Set(["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Tab", "Backspace"]);
window.addEventListener("keydown", n => {
  if (xi.has(n.code) && n.preventDefault(), pn(), !n.repeat) {
    if (Eo.add(n.code), Ae === "menu") {
      re.key(n.code);
      return;
    }
    if (Ae === "lobby") {
      return;
    }
    if (n.code === "Escape" || n.code === "KeyP") uo(!et);else if (et && (n.code === "Enter" || n.code === "Space")) uo(!1);else if (n.code === "KeyR" && R && R.running && !et && !R.player.finished) {
      let e = R.player;
      R.respawn(e, e.lastGroundS), e.vf = 0;
    }
  }
});
window.addEventListener("keyup", n => Eo.delete(n.code));
window.addEventListener("blur", () => Eo.clear());
document.addEventListener("visibilitychange", () => {
  document.hidden && Ae === "race" && R?.running && uo(!0);
});
We.domElement.addEventListener("pointerdown", () => pn());
Qe.addEventListener("click", n => {
  let e = n.target.closest("button")?.dataset.act;
  e && (Fe("click"), e === "resume" ? uo(!1) : e === "restart" ? ms() : e === "menu" && Pt());
});
Ve.addEventListener("click", n => {
  let e = n.target.closest("button")?.dataset.act;
  e === "menu" ? Pt() : e === "lobby" && vs();
});
tt.quit.addEventListener("click", () => {
  Ae === "race" && (Pt(), Fe("back"));
});
re.onSound = n => {
  pn(), Fe(n);
};
re.onScreen = n => {
  n === "title" || n === "mode" || n === "track" ? (It(!1), ze || us()) : n === "ship" && (mo(), It(!0));
};
re.onChange = n => {
  (n === "track" || n === "trial" || n === "mode") && us(), n === "ship" && re.screen === "ship" && It(!0);
};
re.onStart = () => ms();
var Kt = (...n) => n.some(e => Eo.has(e));
function wi() {
  if (!R || R.player.finished) return;
  let n = R.player.input;
  n.throttle = (Kt("KeyW", "ArrowUp") ? 1 : 0) - (Kt("KeyS", "ArrowDown") ? 1 : 0), n.steer = (Kt("KeyD", "ArrowRight") ? 1 : 0) - (Kt("KeyA", "ArrowLeft") ? 1 : 0), n.drift = Kt("ShiftLeft", "ShiftRight"), n.turbo = Kt("KeyE");
}
var ee = Mt(),
  vn = new N.Vector3(),
  Yt = new N.Vector3(0, 1, 0),
  Ca = new N.Vector3(),
  Lt = new N.Vector3(),
  Hn = new N.Vector3(),
  rs = new N.Vector3(),
  Jt = new N.Vector3(0, 1, 0),
  ao = new N.Vector3(),
  Qo = new N.Vector3(0, 0, -1),
  is = !1,
  io = !1,
  lo = 0,
  it = 70,
  Jo = 2.8;
function Ri(n, e) {
  let t = R,
    o = t.player;
  t.track.frameAt(o.s, ee);
  let s = o.visual.root.position;
  Ca.copy(ee.t).applyAxisAngle(ee.u, -o.psi);
  let a = Math.min(1.2, Math.max(0, o.vf) / 115),
    r = o.boostT > 0 || o.turboT > 0;
  if (t.phase === "intro") {
    let c = 1 - t.introT / 2.6,
      p = c * c * (3 - 2 * c),
      f = N.MathUtils.lerp(Math.PI * 0.85, 0, p),
      h = N.MathUtils.lerp(26, 9, p);
    _.position.copy(s).addScaledVector(ee.t, -Math.cos(f) * h).addScaledVector(ee.r, Math.sin(f) * h * 0.8).addScaledVector(ee.u, N.MathUtils.lerp(10, 3, p)), _.up.copy(Jt), _.lookAt(Hn.copy(s).addScaledVector(ee.t, N.MathUtils.lerp(-8, 6, p))), vn.copy(ee.t), Yt.copy(ee.u), io = !0, it = 62;
  } else if (o.finished) lo += n * 0.35, _.position.copy(s).addScaledVector(ee.t, Math.cos(lo) * 10).addScaledVector(ee.r, Math.sin(lo) * 8).addScaledVector(ee.u, 3.6), _.up.copy(Jt), _.lookAt(s), it += (60 - it) * Math.min(1, n * 2);else {
    io || (vn.copy(ee.t), Yt.copy(ee.u), io = !0);
    let c = Lt.copy(ee.t).lerp(Ca, o.drifting ? 0.35 : 0.6).normalize();
    vn.lerp(c, 1 - Math.exp(-n * 7)).normalize(), Yt.lerp(ee.u, 1 - Math.exp(-n * 5)).normalize();
    let p = 7.6 + a * 2.2 + (r ? 1.1 : 0),
      f = 2.6 + a * 0.5 + (o.airborne ? 1.2 : 0);
    Jo += (f - Jo) * Math.min(1, n * 4), _.position.copy(s).addScaledVector(vn, -p).addScaledVector(Yt, Jo), _.up.copy(Jt).lerp(Yt, 0.75).normalize(), Hn.copy(s).addScaledVector(vn, 12).addScaledVector(Yt, 1.1), _.lookAt(Hn);
    let h = 64 + a * 14 + (r ? 4 : 0);
    it += (h - it) * Math.min(1, n * 3), it += ns, ns *= Math.exp(-n * 6);
  }
  let l = a > 0.7 ? (a - 0.7) * 0.05 + (r ? 0.03 : 0) : 0,
    i = Ze * Ze * 0.8 + l;
  rs.set((Math.random() - 0.5) * i, (Math.random() - 0.5) * i, (Math.random() - 0.5) * i * 0.5), _.position.add(rs);
}
function Mi(n, e) {
  let t = ze,
    o = t.standings(),
    s = o[0],
    a = 0,
    r = Math.min(5, o.length);
  for (let c = 0; c < r; c++) a += t.track.delta(s.s, o[c].s) / r;
  let l = s.s + a;
  t.track.frameAt(l, ee), is || (ao.copy(ee.p), Qo.copy(ee.t), is = !0), ao.lerp(ee.p, 1 - Math.exp(-n * 8)), Qo.lerp(ee.t, 1 - Math.exp(-n * 1.5)).normalize();
  let i = Math.sin(e * 0.13) * 0.45;
  Lt.copy(Qo).applyAxisAngle(Jt, i), _.position.copy(ao).addScaledVector(Lt, -30).add(Hn.set(0, 46, 0)), _.up.copy(Jt), _.lookAt(Hn.copy(ao).addScaledVector(Lt, 4)), it = 50, _.clearViewOffset();
}
function Hi(n) {
  let e = $e.track,
    t = 26;
  if (e.frameAt(t, ee), De) {
    ut(e, De.root, t, 0, 2.4 + Math.sin(n * 1.6) * 0.25), De.root.rotateY(n * 0.5), De.body.rotation.z = Math.sin(n * 1.1) * 0.08;
    for (let s of De.flames) s.scale.set(1, 1, 1.4 + Math.random() * 0.4);
  }
  let o = Math.sin(n * 0.12) * 0.7 + 0.5;
  Lt.copy(ee.p).addScaledVector(ee.u, 2.4), _.position.copy(Lt).addScaledVector(ee.t, -Math.cos(o) * 12).addScaledVector(ee.r, Math.sin(o) * 12).addScaledVector(ee.u, 2.6), _.up.copy(Jt), _.lookAt(Lt.addScaledVector(ee.u, 0.3)), it = 50, _.clearViewOffset();
}
var kn = 1,
  Ne = 1;
function Es() {
  kn = Math.max(0.6, Math.min(window.devicePixelRatio || 1, bi) * Ne);
  let n = window.innerWidth,
    e = window.innerHeight;
  n < 2 || e < 2 || (We.setPixelRatio(kn), We.setSize(n, e), po.setSize(n, e, kn), _.aspect = n / e, _.updateProjectionMatrix());
}
window.addEventListener("resize", Es);
Es();
var es = new Float32Array(512),
  Xt = 0,
  co = 0,
  En = 0,
  yn = 0,
  ts = 1,
  Na = 0;
function Da(n) {
  Na = performance.now() + n * 1e3, Xt = 0, co = 0;
}
function ki(n) {
  if (n <= 0 || n > 0.5 || document.hidden || performance.now() < Na || (Xt < es.length && (es[Xt++] = n), co += n, co < 2)) return;
  let e = es.subarray(0, Xt).sort(),
    t = Math.max(1, Math.floor(Xt * 0.9)),
    o = 0;
  for (let r = 0; r < t; r++) o += e[r];
  Xt = 0, co = 0;
  let s = t / o;
  s < 50 ? (En++, yn = 0) : s > 58 ? (yn++, En = 0) : En = yn = 0;
  let a = Ne;
  if (En >= (s < 45 ? 1 : 2) && Ne > 0.6) {
    ts = Ne - 0.05;
    let r = Ne * Math.sqrt(s / 58);
    Ne = Math.max(0.6, Math.min(Ne - 0.06, Math.max(Ne - 0.3, r))), En = 0;
  } else yn >= 8 && Ne < ts && (Ne = Math.min(ts, Ne + 0.1), yn = 0);
  Ne !== a && (Es(), Da(1.5));
}
function ys() {
  Da(3), We.compileAsync(Be, _).catch(() => {});
}
var ls = new N.Timer();
ls.connect(document);
var rt = 0;
We.setAnimationLoop(n => {
  ls.update(n);
  let e = ls.getDelta(),
    t = Math.min(e, 1 / 20);
  if (ki(e), rt += t, !$e) return;
  let o = $e;
  o.visuals.update(rt), o.world.update(rt, t, _.position);
  let s = 0,
    a = 0;
  if (Ae === "race" && R) {
    if (!et || false) {
      wi();
      let i = Mn > 0 ? t * 0.3 : t;
      {
        Mn = Math.max(0, Mn - t), R.update(i, rt), bo > 0 && vi(t), false;
      }
      let c = R.player;
      s = Math.min(1.2, Math.max(0, c.vf) / 115), a = c.boostT > 0 || c.turboT > 0 ? 1 : 0, dn(c.speed, a > 0, R.phase !== "intro", c.drifting), wn > 0 && (wn -= t, wn <= 0 && ho()), lt > 0 && (lt -= t, lt <= 0 && Ti());
    }
    Ri(et && !false ? 0 : t, rt), tt.update(R), ds.update(_, window.innerWidth, window.innerHeight, R.phase !== "intro");
  } else ze ? (ze.update(t, rt), ze.trial && ze.standings()[0].dist > ze.lapLen + 40 && us(), Mi(t, rt)) : Hi(rt);
  let r = Math.max(1, 16 / 9 / _.aspect);
  _.fov = N.MathUtils.radToDeg(2 * Math.atan(Math.tan(N.MathUtils.degToRad(it / 2)) * Math.min(r, 1.8))), _.updateProjectionMatrix(), _.updateMatrixWorld(), xn > 0 && (xn -= t, xn <= 0.25 && (Ge.style.opacity = String(Math.max(0, xn / 0.25)))), Ze = Math.max(0, Ze - t * 1.6), Rn = Math.max(0, Rn - t * 1.8), ro = Math.max(0, ro - t * 2), ps.style.opacity = String(ro * 0.6);
  let l = po.comic.uniforms;
  l.uTime.value = rt, l.uSpeed.value += (Math.max(0, s - 0.5) * 1.4 + a * 0.4 - l.uSpeed.value) * Math.min(1, t * 4), l.uBoost.value += (a - l.uBoost.value) * Math.min(1, t * 5), l.uFlashAmount.value = Rn, Qt = Math.max(0, Qt - t * 1.3), l.uGlitch.value = Qt, Je.setViewportHeight(window.innerHeight * kn, _.fov), Je.update(et ? 0 : t, window.innerWidth, window.innerHeight), Ns(_, o.world.keyDir, kn), po.composer.render(t), Ae === "race" && _.position.sub(rs);
});
tn(re.def);
re.show("title");
pn();
Vo("menu");
va();
re.render();
function yo(n) {
  n.traverse(e => {
    if (e instanceof N.Mesh || e instanceof N.Points) {
      e.geometry.userData.shared || e.geometry.dispose();
      for (let t of [e.material].flat()) if (!t.userData.shared) {
        for (let o of Object.values(t)) o instanceof N.Texture && !o.userData.shared && o.dispose();
        t.dispose();
      }
    }
  }), n.clear();
}