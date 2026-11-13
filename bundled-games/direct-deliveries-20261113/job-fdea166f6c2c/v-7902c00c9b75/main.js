import * as THREE from './lib/three/build/three.module.js';
import { EffectComposer } from './lib/three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from './lib/three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from './lib/three/examples/jsm/postprocessing/ShaderPass.js';
import { OutputPass } from './lib/three/examples/jsm/postprocessing/OutputPass.js';
import { UnrealBloomPass } from './lib/three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { GTAOPass } from './lib/three/examples/jsm/postprocessing/GTAOPass.js';
import { SimplifyModifier } from './lib/three/examples/jsm/modifiers/SimplifyModifier.js';
import { mergeVertices, mergeGeometries } from './lib/three/examples/jsm/utils/BufferGeometryUtils.js';
import { RoomEnvironment } from './lib/three/examples/jsm/environments/RoomEnvironment.js';

const setLoad = (pct, msg) => { const b = document.getElementById('lbar'); if (b) b.style.width = pct + '%'; if (msg) document.getElementById('lstat').textContent = msg; };
clearTimeout(window.__loadFail); setLoad(45, 'BUILDING THE WORLD');
const V3 = THREE.Vector3;
const rand = (a = 1, b) => b === undefined ? Math.random() * a : a + Math.random() * (b - a);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const damp = (a, b, l, dt) => a + (b - a) * (1 - Math.exp(-l * dt));
const lerpAngle = (a, b, t) => { const d = ((b - a + Math.PI) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2) - Math.PI; return a + d * t; };
const $ = id => document.getElementById(id);

// =====================================================================
// RENDERER / SCENE
// =====================================================================
const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' });
const TOUCH = matchMedia('(pointer: coarse)').matches || /touch/.test(location.search);
const DPR = Math.min(devicePixelRatio, TOUCH ? 1.5 : 2);
renderer.setPixelRatio(DPR);
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.NeutralToneMapping;
renderer.toneMappingExposure = 1.05;
document.body.prepend(renderer.domElement);

const scene = new THREE.Scene();
const BG = new THREE.Color('#e6e6ea');
scene.background = BG;
scene.fog = new THREE.Fog(BG, 38, 150);

const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.3, 500);
const sky = new THREE.Mesh(new THREE.SphereGeometry(420, 32, 16), new THREE.ShaderMaterial({
  side: THREE.BackSide, depthWrite: false, fog: false,
  uniforms: { cTop: { value: new THREE.Color('#c3c6d2') }, cHor: { value: BG.clone() }, cLow: { value: new THREE.Color('#d6d6dc') }, sunDir: { value: new THREE.Vector3(-0.4, 0.75, 0.5).normalize() } },
  vertexShader: `varying vec3 vD; void main(){ vD = normalize(position); vec4 p = projectionMatrix * modelViewMatrix * vec4(position,1.0); gl_Position = p.xyww; }`,
  fragmentShader: `uniform vec3 cTop, cHor, cLow, sunDir; varying vec3 vD;
    void main(){ float y = vD.y;
      vec3 c = y > 0.0 ? mix(cHor, cTop, pow(smoothstep(0.0, 0.85, y), 0.8)) : mix(cHor, cLow, smoothstep(0.0, -0.4, y));
      float s = max(dot(normalize(vD), sunDir), 0.0); c += vec3(1.0, 0.98, 0.94) * (pow(s, 24.0) * 0.35 + pow(s, 4.0) * 0.06);
      gl_FragColor = vec4(c, 1.0); }`
}));
sky.renderOrder = -1; sky.frustumCulled = false;
scene.add(sky);

const hemi = new THREE.HemisphereLight('#ffffff', '#a9a9b6', 2.1);
scene.add(hemi);
const sun = new THREE.DirectionalLight('#ffffff', 3.1);
sun.castShadow = true;
sun.shadow.mapSize.set(TOUCH ? 1024 : 2048, TOUCH ? 1024 : 2048);
const sc = sun.shadow.camera; sc.left = -30; sc.right = 30; sc.top = 30; sc.bottom = -30; sc.near = 1; sc.far = 90; sc.updateProjectionMatrix();
sun.shadow.bias = -0.0006; sun.shadow.normalBias = 0.05;
scene.add(sun, sun.target);

// post: MSAA target -> output -> custom superhot FX
const rt = new THREE.WebGLRenderTarget(innerWidth * DPR, innerHeight * DPR, { type: THREE.HalfFloatType, samples: TOUCH ? 2 : 4 });
const composer = new EffectComposer(renderer, rt);
composer.addPass(new RenderPass(scene, camera));
const gtao = new GTAOPass(scene, camera, innerWidth, innerHeight);
gtao.updateGtaoMaterial({ radius: 0.9, distanceExponent: 1.6, thickness: 1.2, scale: 1.25, samples: 12 });
gtao.updatePdMaterial({ lumaPhi: 10, depthPhi: 2, normalPhi: 3, radius: 5, rings: 2, samples: 16 });
gtao.blendIntensity = 0.9;
// faded/transparent things must not leave ambient-occlusion silhouettes behind
gtao.overrideVisibility = function () {
  const cache = this._visibilityCache;
  this.scene.traverse(o => { cache.set(o, o.visible); if (o.isPoints || o.isLine || (o.material && o.material.transparent)) o.visible = false; });
};
composer.addPass(gtao);
// safety net: one NaN/Inf pixel would otherwise be smeared across the whole screen by the bloom blur
composer.addPass(new ShaderPass({
  uniforms: { tDiffuse: { value: null } },
  vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
  fragmentShader: `uniform sampler2D tDiffuse; varying vec2 vUv;
    void main(){ vec4 c = texture2D(tDiffuse, vUv);
      if (any(isnan(c)) || any(isinf(c))) c = vec4(0.0, 0.0, 0.0, 1.0);
      gl_FragColor = clamp(c, 0.0, 64.0); }`
}));
const bloom = new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 0.55, 0.45, 1.85);
if (!TOUCH) composer.addPass(bloom);   // bloom = ~10 full-screen passes: desktop only
composer.addPass(new OutputPass());
const fxPass = new ShaderPass({
  uniforms: { tDiffuse: { value: null }, uCrack: { value: 0 }, uCrackC: { value: new THREE.Vector2(0.5, 0.5) }, uPunch: { value: 0 }, uSlow: { value: 0 }, uTime: { value: 0 }, uFlash: { value: 0 }, uWhite: { value: 0 }, uRes: { value: new THREE.Vector2(innerWidth, innerHeight) } },
  vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
  fragmentShader: `
    uniform sampler2D tDiffuse; uniform vec2 uCrackC; uniform float uCrack, uPunch, uSlow, uTime, uFlash, uWhite; uniform vec2 uRes; varying vec2 vUv;
    float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233))) * 43758.5453); }
    vec2 h2(vec2 p){ p = vec2(dot(p, vec2(127.1,311.7)), dot(p, vec2(269.5,183.3))); return fract(sin(p) * 43758.5453); }
    void main(){
      vec2 uv = vUv; float edge = 0.0, shade = 0.0;
      if (uCrack > 0.001) {
        vec2 p = (uv - uCrackC) * vec2(uRes.x / uRes.y, 1.0);
        float pr = length(p);
        vec2 q = vec2(atan(p.y, p.x) * 1.5, log(pr + 0.03) * 2.1);
        vec2 g = floor(q), f = fract(q); float d1 = 8.0, d2 = 8.0; vec2 id = vec2(0.0);
        for (int j = -1; j <= 1; j++) for (int i = -1; i <= 1; i++) {
          vec2 o = vec2(float(i), float(j)); vec2 rr = o + h2(g + o) - f; float d = dot(rr, rr);
          if (d < d1) { d2 = d1; d1 = d; id = g + o; } else if (d < d2) d2 = d;
        }
        float reach = smoothstep(uCrack * 1.6, uCrack * 1.6 - 0.25, pr);
        edge = (1.0 - smoothstep(0.0, 0.035, sqrt(d2) - sqrt(d1))) * reach * (0.55 + 0.45 * smoothstep(0.6, 0.0, pr));
        vec2 hv = h2(id);
        uv += (hv - 0.5) * 0.03 * uCrack * reach;
        shade = (hv.x - 0.5) * 0.12 * reach;
      }
      vec2 c = uv - 0.5; float r = length(c);
      float ab = 0.0008 + uSlow * 0.0032 + uPunch * 0.012;
      vec2 off = c * ab * (0.4 + r * 2.0);
      vec3 col;
      col.r = texture2D(tDiffuse, uv + off).r;
      col.g = texture2D(tDiffuse, uv).g;
      col.b = texture2D(tDiffuse, uv - off).b;
      // cold, slightly desaturated look when time is frozen
      float l = dot(col, vec3(0.299,0.587,0.114));
      float redness = clamp((col.r - max(col.g, col.b)) * 2.5, 0.0, 1.0);   // SUPERHOT red never drains
      col = mix(col, vec3(l) * vec3(0.93,0.98,1.06), smoothstep(0.35, 1.0, uSlow) * 0.55 * (1.0 - redness));
      col *= 1.0 - smoothstep(0.42, 0.95, r) * (0.22 + uSlow * 0.18);
      float n = hash(uv * uRes + fract(uTime * 7.3) * 100.0);
      col += (n - 0.5) * (0.025 + uSlow * 0.02);
      col += shade * uCrack;
      col = mix(col, vec3(1.0), edge * uCrack * 0.85);
      col = mix(col, vec3(1.0, 0.13, 0.08), uFlash * 0.55);
      col = mix(col, vec3(1.0), uWhite);
      gl_FragColor = vec4(col, 1.0);
    }`
});
composer.addPass(fxPass);

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight); composer.setSize(innerWidth, innerHeight);
  bloom.resolution.set(innerWidth, innerHeight);
  fxPass.uniforms.uRes.value.set(innerWidth, innerHeight);
});

// =====================================================================
// MATERIALS / TEXTURES / GEOMETRY CACHE
// =====================================================================
function canvasTex(draw, size = 128) {
  const c = document.createElement('canvas'); c.width = c.height = size;
  draw(c.getContext('2d'), size);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}
const rivets = (x, s, col) => { x.fillStyle = col; for (const [a, b] of [[16, 16], [s - 16, 16], [16, s - 16], [s - 16, s - 16]]) { x.beginPath(); x.arc(a, b, 5, 0, 7); x.fill(); } };
const qTex = canvasTex((x, s) => {
  x.fillStyle = '#ffb81c'; x.fillRect(0, 0, s, s);
  x.strokeStyle = '#b86a00'; x.lineWidth = 8; x.strokeRect(4, 4, s - 8, s - 8);
  rivets(x, s, '#8a4b00');
  x.font = '900 86px "Arial Black", Arial, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle';
  x.fillStyle = '#8a4b00'; x.fillText('?', s / 2 + 6, s / 2 + 10);
  x.fillStyle = '#111'; x.fillText('?', s / 2, s / 2 + 4);
});
const usedTex = canvasTex((x, s) => {
  x.fillStyle = '#b8b8be'; x.fillRect(0, 0, s, s);
  x.strokeStyle = '#8c8c94'; x.lineWidth = 8; x.strokeRect(4, 4, s - 8, s - 8); rivets(x, s, '#7c7c84');
});
const brickTex = canvasTex((x, s) => {
  x.fillStyle = '#f2f2f4'; x.fillRect(0, 0, s, s);
  x.fillStyle = '#b4b4bc'; const rh = s / 4;
  for (let r = 0; r < 4; r++) {
    x.fillRect(0, r * rh, s, 4);
    const o = r % 2 ? s / 4 : 0;
    for (let c = 0; c < 3; c++) x.fillRect((o + c * s / 2) % s, r * rh, 4, rh);
  }
  x.fillRect(0, s - 4, s, 4);
});
const emblemTex = canvasTex((x, s) => {
  x.fillStyle = '#fff'; x.beginPath(); x.arc(s / 2, s / 2, s / 2 - 2, 0, 7); x.fill();
  x.fillStyle = '#e3241b'; x.font = '900 46px "Arial Black", Arial'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('M', s / 2, s / 2 + 3);
}, 64);

// SUPERHOT red: glassy crystal — sharp reflections, clearcoat sheen, light passing through tinted red
const envTex = (() => { const pm = new THREE.PMREMGenerator(renderer); const t = pm.fromScene(new RoomEnvironment(), 0.04).texture; pm.dispose(); return t; })();
function redGlass(color, emissive, ei) {
  return new THREE.MeshPhysicalMaterial({
    color, emissive, emissiveIntensity: ei, roughness: 0.12, metalness: 0.0, flatShading: true,
    clearcoat: 0.6, clearcoatRoughness: 0.08, ior: 1.5, specularIntensity: 0.55, specularColor: new THREE.Color('#ff6a50'),
    transmission: TOUCH ? 0 : 0.06, thickness: 1.2,   // transmission re-renders the whole scene: desktop only attenuationColor: new THREE.Color('#ff0000'), attenuationDistance: 0.2,
    envMap: envTex, envMapIntensity: 0.55,
  });
}
function gridify(mat, strength, key) {
  mat.onBeforeCompile = sh => {
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vWP; varying vec3 vWN;')
      .replace('#include <project_vertex>', '#include <project_vertex>\nvWP = (modelMatrix * vec4(transformed,1.0)).xyz; vWN = normalize(mat3(modelMatrix) * objectNormal);');
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vWP; varying vec3 vWN;')
      .replace('#include <color_fragment>', `#include <color_fragment>
        vec3 gw = max(fwidth(vWP), vec3(1e-4));
        vec3 gg = abs(fract(vWP - 0.5) - 0.5) / gw + abs(vWN) * 1e3;
        float gl = 1.0 - min(min(gg.x, gg.y), gg.z);
        diffuseColor.rgb *= 1.0 - clamp(gl, 0.0, 1.0) * ${strength.toFixed(3)};
        diffuseColor.rgb *= mix(0.80, 1.0, clamp((vWP.y + 7.0) / 7.0, 0.0, 1.0));`);
  };
  mat.customProgramCacheKey = () => 'grid-' + key;
  return mat;
}

const M = {
  white: gridify(new THREE.MeshStandardMaterial({ color: '#f4f4f6', roughness: 0.92 }), 0.075, 'w'),
  hard: gridify(new THREE.MeshStandardMaterial({ color: '#dcdce2', roughness: 0.8 }), 0.12, 'h'),
  decor: new THREE.MeshStandardMaterial({ color: '#f7f7f9', roughness: 0.95, flatShading: true }),
  cloud: new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 1, flatShading: true, emissive: '#ffffff', emissiveIntensity: 0.25 }),
  black: new THREE.MeshStandardMaterial({ color: '#141417', roughness: 0.3, metalness: 0.3 }),
  pipe: new THREE.MeshStandardMaterial({ color: '#17171b', roughness: 0.16, metalness: 0.45 }),
  hole: new THREE.MeshBasicMaterial({ color: '#000000' }),
  red: redGlass('#c40800', '#6a0000', 0.55),
  red2: redGlass('#8a0400', '#420000', 0.5),
  red3: redGlass('#e01806', '#7a0400', 0.5),
  gold: new THREE.MeshStandardMaterial({ color: '#ffbf1f', emissive: '#ff9a00', emissiveIntensity: 0.35, roughness: 0.28, metalness: 0.55 }),
  eyeW: new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.3 }),
  eyeB: new THREE.MeshStandardMaterial({ color: '#0a0a0a', roughness: 0.2 }),
  // porcelain SUPERHOT Mario: white figure, black overalls, the red cap is his only color
  skin: new THREE.MeshStandardMaterial({ color: '#f1f1f3', roughness: 0.22, flatShading: true }),
  shirt: new THREE.MeshStandardMaterial({ color: '#f6f6f8', roughness: 0.25, flatShading: true }),
  overall: new THREE.MeshStandardMaterial({ color: '#16161a', roughness: 0.35, flatShading: true }),
  cap: new THREE.MeshStandardMaterial({ color: '#e0201a', roughness: 0.45, flatShading: true }),
  glove: new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.25, flatShading: true }),
  shoe: new THREE.MeshStandardMaterial({ color: '#16161a', roughness: 0.3, flatShading: true }),
  sole: new THREE.MeshStandardMaterial({ color: '#0c0c0e', roughness: 0.5 }),
  hair: new THREE.MeshStandardMaterial({ color: '#16161a', roughness: 0.4, flatShading: true }),
  iris: new THREE.MeshStandardMaterial({ color: '#2f6fe0', roughness: 0.2 }),
  emblem: new THREE.MeshStandardMaterial({ map: emblemTex, transparent: true, roughness: 0.5 }),
  brick: new THREE.MeshStandardMaterial({ map: brickTex, roughness: 0.85 }),
  q: new THREE.MeshStandardMaterial({ map: qTex, emissiveMap: qTex, emissive: '#ffffff', emissiveIntensity: 0.25, roughness: 0.4, metalness: 0.15 }),
  used: new THREE.MeshStandardMaterial({ map: usedTex, roughness: 0.8 }),
  bullet: new THREE.MeshBasicMaterial({ color: '#ff1a0a' }),
  trail: new THREE.MeshBasicMaterial({ color: '#ff2a1a', transparent: true, opacity: 0.55, depthWrite: false }),
  fireball: new THREE.MeshStandardMaterial({ color: '#ffd24a', emissive: '#ffae00', emissiveIntensity: 1.6, roughness: 0.3, flatShading: true }),
  ftrail: new THREE.MeshBasicMaterial({ color: '#ffb000', transparent: true, opacity: 0.6, depthWrite: false }),
  flash: new THREE.MeshBasicMaterial({ color: '#ff3a20' }),
  dust: new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 1, flatShading: true }),
  edge: new THREE.LineBasicMaterial({ color: '#9d9da8', transparent: true, opacity: 0.45 }),
};

function crystal(mat, key, rim = '#ff6a4a', k = 1.4) {
  const c = new THREE.Color(rim);
  mat.onBeforeCompile = sh => {
    sh.uniforms.uRim = { value: c };
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', '#include <common>\nuniform vec3 uRim;')
      .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
        float fr = pow(1.0 - clamp(abs(dot(normalize(vViewPosition), normal)), 0.0, 1.0), 2.5);
        totalEmissiveRadiance += uRim * fr * ${k.toFixed(2)};`);
  };
  mat.customProgramCacheKey = () => 'crystal-' + key;
  return mat;
}
crystal(M.red, 'r', '#ff2a10', 0.9); crystal(M.red2, 'r2', '#ff1a08', 0.8); crystal(M.red3, 'r3', '#ff4020', 0.8);
function trailMaterial(hex, op) {
  return new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, uniforms: { c: { value: new THREE.Color(hex) }, o: { value: op } },
    vertexShader: `varying float vT; void main(){ vT = position.z + 0.5; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `uniform vec3 c; uniform float o; varying float vT; void main(){ gl_FragColor = vec4(c, o * pow(clamp(vT, 0.0, 1.0), 1.5)); }`,
  });
}
M.bullet = new THREE.MeshStandardMaterial({ color: '#2a2a30', roughness: 0.3, metalness: 0.6 });
M.trail = trailMaterial('#ff2b1c', 0.75);      // theirs: red streak
M.ftrail = trailMaterial('#141418', 0.7);      // yours: ink streak
M.flash.color.setRGB(1.6, 1.5, 1.45);

M.laser = new THREE.MeshBasicMaterial({ color: '#ff2b1c', transparent: true, opacity: 0.35, depthWrite: false });
M.ring = new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.8, depthWrite: false, side: THREE.DoubleSide });
M.castle = gridify(new THREE.MeshStandardMaterial({ color: '#a4a4ae', roughness: 0.75 }), 0.14, 'c');
M.spike = new THREE.MeshStandardMaterial({ color: '#141417', roughness: 0.3, metalness: 0.3, flatShading: true });
M.shellM = new THREE.MeshStandardMaterial({ color: '#17171b', roughness: 0.22, metalness: 0.45, flatShading: true });
M.mover = gridify(new THREE.MeshStandardMaterial({ color: '#2c2c33', roughness: 0.35, metalness: 0.25 }), 0.25, 'mv');
M.crystal = crystal(new THREE.MeshStandardMaterial({ color: '#ff3b2a', emissive: '#ff2010', emissiveIntensity: 1.1, roughness: 0.1, metalness: 0.2, flatShading: true }), 'cr', '#ffd0c0', 2);
M.crystalGot = new THREE.MeshStandardMaterial({ color: '#ffffff', transparent: true, opacity: 0.35, roughness: 0.2, flatShading: true });
M.blob = new THREE.MeshBasicMaterial({ color: '#000', transparent: true, opacity: 0.28, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });

for (const m of [M.white, M.hard, M.castle, M.mover, M.brick, M.q, M.used, M.shellM, M.pipe, M.decor]) { m.polygonOffset = true; m.polygonOffsetFactor = 1; m.polygonOffsetUnits = 1; }
M.edgeLight = new THREE.LineBasicMaterial({ color: '#f4f4f8', transparent: true, opacity: 0.55, depthWrite: false });
const BLACKS = new Set();
const edgeLightCache = new Map();
function outlineBlacks(root) {
  if (TOUCH) return;
  if (!BLACKS.size) for (const m of [M.black, M.pipe, M.shellM, M.mover, M.spike]) BLACKS.add(m);
  const todo = [];
  root.traverse(o => { if (o.isMesh && BLACKS.has(o.material) && !o.userData.outlined && o.visible) todo.push(o); });
  for (const o of todo) {
    o.userData.outlined = true;
    let eg = edgeLightCache.get(o.geometry.uuid);
    if (!eg) { eg = new THREE.EdgesGeometry(o.geometry, 32); edgeLightCache.set(o.geometry.uuid, eg); }
    const l = new THREE.LineSegments(eg, M.edgeLight); l.raycast = () => { }; o.add(l);
  }
}
const geoCache = new Map();
const cached = (k, mk) => { let g = geoCache.get(k); if (!g) { g = mk(); geoCache.set(k, g); } return g; };
const boxGeo = (w, h, d) => cached(`b${w}|${h}|${d}`, () => new THREE.BoxGeometry(w, h, d));
const edgeGeo = (w, h, d) => cached(`e${w}|${h}|${d}`, () => new THREE.EdgesGeometry(boxGeo(w, h, d)));
const icoGeo = (r, d = 1) => cached(`i${r}|${d}`, () => new THREE.IcosahedronGeometry(r, d));
const sphGeo = (r, a = 16, b = 12) => cached(`s${r}|${a}|${b}`, () => new THREE.SphereGeometry(r, a, b));
const capGeo = (r, l) => cached(`c${r}|${l}`, () => new THREE.CapsuleGeometry(r, l, 4, 10));
const cylGeo = (a, b, h, s = 20) => cached(`y${a}|${b}|${h}|${s}`, () => new THREE.CylinderGeometry(a, b, h, s));
const shardGeos = [new THREE.TetrahedronGeometry(0.17), new THREE.OctahedronGeometry(0.12), new THREE.TetrahedronGeometry(0.1), new THREE.BoxGeometry(0.16, 0.05, 0.11)];
const trailGeo = new THREE.BoxGeometry(0.035, 0.035, 1);

function mesh(geo, mat, x = 0, y = 0, z = 0, parent, shadow = true) {
  const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = shadow;
  if (parent) parent.add(m); return m;
}

// =====================================================================
// AUDIO (all synthesized)
// =====================================================================
let AC = null, master, sfxBus, musicBus, musicLP, noiseBuf, freezeG;
function initAudio() {
  if (AC) { if (AC.state === 'suspended') AC.resume(); return; }
  try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return; }
  master = AC.createGain(); master.gain.value = 0.6;
  const comp = AC.createDynamicsCompressor(); master.connect(comp); comp.connect(AC.destination);
  sfxBus = AC.createGain(); sfxBus.connect(master);
  musicLP = AC.createBiquadFilter(); musicLP.type = 'lowpass'; musicLP.frequency.value = 5000; musicLP.Q.value = 0.8;
  musicBus = AC.createGain(); musicBus.gain.value = 0.55; musicBus.connect(musicLP); musicLP.connect(master);
  freezeG = AC.createGain(); freezeG.gain.value = 0; freezeG.connect(master);
  const hum = AC.createOscillator(); hum.type = 'sine'; hum.frequency.value = 52; hum.connect(freezeG); hum.start();
  const hum2 = AC.createOscillator(); hum2.type = 'triangle'; hum2.frequency.value = 104.6; const h2g = AC.createGain(); h2g.gain.value = 0.25; hum2.connect(h2g); h2g.connect(freezeG); hum2.start();
  noiseBuf = AC.createBuffer(1, AC.sampleRate * 2, AC.sampleRate);
  const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
}
function tone({ type = 'square', f = 440, f1 = 0, dur = 0.15, vol = 0.1, delay = 0, bus, a = 0.004 }) {
  if (!AC) return;
  const t = AC.currentTime + delay;
  const o = AC.createOscillator(); o.type = type; o.frequency.setValueAtTime(f, t);
  if (f1) o.frequency.exponentialRampToValueAtTime(Math.max(f1, 1), t + dur);
  const g = AC.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g); g.connect(bus || sfxBus); o.start(t); o.stop(t + dur + 0.03);
}
function noise({ dur = 0.2, vol = 0.2, f = 2000, q = 1, type = 'bandpass', delay = 0, bus }) {
  if (!AC) return;
  const t = AC.currentTime + delay;
  const s = AC.createBufferSource(); s.buffer = noiseBuf;
  const fl = AC.createBiquadFilter(); fl.type = type; fl.frequency.value = f; fl.Q.value = q;
  const g = AC.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  s.connect(fl); fl.connect(g); g.connect(bus || sfxBus); s.start(t, Math.random()); s.stop(t + dur + 0.03);
}
const semi = n => Math.pow(2, n / 12);
const SFX = {
  jump() { tone({ f: 260, f1: 640, dur: 0.17, vol: 0.06 }); tone({ type: 'triangle', f: 520, f1: 1300, dur: 0.12, vol: 0.05 }); },
  land() { noise({ dur: 0.08, vol: 0.12, f: 500, type: 'lowpass' }); },
  coin() { tone({ f: 988, dur: 0.08, vol: 0.05 }); tone({ f: 1319, dur: 0.4, vol: 0.05, delay: 0.075 }); },
  stomp(c = 1) { const k = semi((c - 1) * 2); tone({ f: 720 * k, f1: 180 * k, dur: 0.13, vol: 0.09 }); noise({ dur: 0.09, vol: 0.25, f: 900, type: 'lowpass' }); },
  shatter() {
    const s = 0.55 + 0.45 * G.ts;
    noise({ dur: 0.45, vol: 0.3, f: 3400 * s, q: 0.6 }); noise({ dur: 0.18, vol: 0.3, f: 700 * s, type: 'lowpass' });
    for (let i = 0; i < 8; i++) tone({ type: 'sine', f: rand(2200, 5600) * s, dur: rand(0.08, 0.35), vol: 0.03, delay: rand(0, 0.22) });
  },
  shot(v = 1) {
    const s = 0.45 + 0.55 * G.ts;
    noise({ dur: 0.25, vol: 0.5 * v, f: 1100 * s, type: 'lowpass' }); tone({ type: 'sine', f: 170 * s, f1: 38, dur: 0.24, vol: 0.32 * v });
    noise({ dur: 0.05, vol: 0.18 * v, f: 5200 * s, q: 0.5 });
  },
  fire() { tone({ type: 'sawtooth', f: 1300, f1: 260, dur: 0.17, vol: 0.045 }); noise({ dur: 0.14, vol: 0.14, f: 4200, q: 0.8 }); },
  empty() { tone({ f: 130, dur: 0.06, vol: 0.05 }); tone({ f: 110, dur: 0.06, vol: 0.05, delay: 0.07 }); },
  wahoo() { [0, 4, 7, 12, 16].forEach((n, i) => tone({ type: 'triangle', f: 440 * semi(n), dur: 0.12, vol: 0.05, delay: i * 0.04 })); tone({ f: 330, f1: 990, dur: 0.3, vol: 0.04 }); },
  longjump() { noise({ dur: 0.3, vol: 0.14, f: 1800, q: 1.4 }); tone({ type: 'triangle', f: 300, f1: 800, dur: 0.22, vol: 0.06 }); },
  wallkick() { tone({ f: 600, f1: 1400, dur: 0.1, vol: 0.06 }); noise({ dur: 0.06, vol: 0.2, f: 2400, q: 1 }); },
  resume() { noise({ dur: 0.3, vol: 0.12, f: 600, q: 1.2 }); tone({ type: 'sine', f: 90, f1: 260, dur: 0.22, vol: 0.12 }); },
  whoosh() { noise({ dur: 0.35, vol: 0.3, f: 900, q: 2.5 }); noise({ dur: 0.2, vol: 0.12, f: 3000, q: 3 }); },
  bump() { tone({ f: 170, f1: 110, dur: 0.1, vol: 0.08 }); tone({ type: 'triangle', f: 85, dur: 0.14, vol: 0.18 }); },
  brick() { noise({ dur: 0.32, vol: 0.38, f: 1500, q: 0.6 }); tone({ type: 'triangle', f: 240, f1: 70, dur: 0.22, vol: 0.18 }); },
  sprout() { tone({ f: 300, f1: 900, dur: 0.45, vol: 0.035 }); tone({ type: 'triangle', f: 600, f1: 1800, dur: 0.45, vol: 0.03 }); },
  power() { [0, 4, 7, 12, 16, 19, 24].forEach((n, i) => tone({ f: 523 * semi(n), dur: 0.1, vol: 0.045, delay: i * 0.055 })); },
  shrink() { [12, 7, 4, 0, -5, -12].forEach((n, i) => tone({ f: 523 * semi(n), dur: 0.09, vol: 0.045, delay: i * 0.06 })); },
  pound() { noise({ dur: 0.5, vol: 0.65, f: 380, type: 'lowpass' }); tone({ type: 'sine', f: 110, f1: 32, dur: 0.5, vol: 0.45 }); },
  spin() { tone({ type: 'triangle', f: 380, f1: 1000, dur: 0.18, vol: 0.06 }); noise({ dur: 0.18, vol: 0.08, f: 3000, q: 1.5 }); },
  death() { tone({ f: 900, f1: 60, dur: 1.0, vol: 0.07 }); noise({ dur: 0.7, vol: 0.35, f: 2600, q: 0.5 }); tone({ type: 'sine', f: 80, f1: 30, dur: 0.8, vol: 0.4 }); },
  flag() { [0, 2, 4, 5, 7, 9, 11, 12, 16, 19, 24].forEach((n, i) => tone({ f: 392 * semi(n), dur: 0.14, vol: 0.045, delay: i * 0.065 })); },
  boom() { noise({ dur: 0.4, vol: 0.5, f: 480, type: 'lowpass' }); tone({ type: 'sine', f: 95, f1: 30, dur: 0.4, vol: 0.35 }); },
  word() { tone({ type: 'sine', f: 62, f1: 38, dur: 0.7, vol: 0.55 }); noise({ dur: 0.55, vol: 0.32, f: 240, type: 'lowpass' }); noise({ dur: 0.3, vol: 0.12, f: 6000, q: 0.4 }); },
};

// music: an original bouncy loop whose tempo AND brightness follow the flow of time
const LEAD = [76, 0, 79, 76, 0, 72, 74, 76, 76, 0, 72, 69, 0, 72, 71, 69, 77, 0, 81, 77, 0, 72, 74, 77, 79, 0, 83, 81, 79, 77, 76, 74];
const BASS = [48, 0, 55, 0, 60, 0, 55, 0, 45, 0, 52, 0, 57, 0, 52, 0, 41, 0, 48, 0, 53, 0, 48, 0, 43, 0, 50, 0, 55, 0, 47, 0];
const mtof = n => 440 * semi(n - 69);
const music = { clock: 0, step: 0 };
function updateMusic(dt) {
  if (!AC) return;
  const ts = G.paused ? 0 : G.ts;
  music.clock += dt * ts * (152 / 60) * 2;
  musicLP.frequency.setTargetAtTime(260 + 5200 * ts * ts, AC.currentTime, 0.06);
  const frozen = G.state === 'play' && !G.paused ? Math.pow(1 - ts, 3) : 0;
  freezeG.gain.setTargetAtTime(frozen * 0.07, AC.currentTime, 0.08);
  G.frozenFor = frozen > 0.6 ? (G.frozenFor || 0) + dt : (G.frozenFor > 0.5 && ts > 0.55 ? (SFX.resume(), 0) : (ts > 0.55 ? 0 : G.frozenFor || 0));
  let guard = 0;
  while (music.clock >= 1 && guard++ < 4) {
    music.clock -= 1;
    const s = music.step, warp = 0.94 + 0.06 * ts;
    if (LEAD[s]) tone({ f: mtof(LEAD[s]) * warp, dur: 0.15, vol: 0.045, bus: musicBus });
    if (BASS[s]) tone({ type: 'triangle', f: mtof(BASS[s]) * warp, dur: 0.22, vol: 0.16, bus: musicBus });
    if (s % 4 === 0) tone({ type: 'sine', f: 150, f1: 42, dur: 0.16, vol: 0.32, bus: musicBus });
    if (s % 8 === 4) noise({ dur: 0.12, vol: 0.13, f: 1800, q: 0.7, bus: musicBus });
    if (s % 2 === 1) noise({ dur: 0.035, vol: 0.05, f: 7500, type: 'highpass', bus: musicBus });
    music.step = (s + 1) % 32;
  }
}

let voice = null;
function pickVoice() {
  const vs = speechSynthesis.getVoices();
  voice = vs.find(v => /Fred|Daniel|Google UK English Male|Alex/i.test(v.name)) || vs.find(v => /^en/i.test(v.lang)) || null;
}
if ('speechSynthesis' in window) { pickVoice(); speechSynthesis.onvoiceschanged = pickVoice; }
function say(w) {
  try {
    if (!('speechSynthesis' in window)) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(w.replace(/\./g, ''));
    if (voice) u.voice = voice; u.pitch = 0.1; u.rate = 0.85; u.volume = 1;
    speechSynthesis.speak(u);
  } catch (e) { }
}

// =====================================================================
// INPUT
// =====================================================================
const keys = new Set(), pressed = new Set();
const KEYMAP = { Space: 'jump', ShiftLeft: 'pound', ShiftRight: 'pound', KeyC: 'pound', KeyF: 'fire', KeyR: 'restart' };
addEventListener('keydown', e => {
  if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) e.preventDefault();
  if (!keys.has(e.code) && KEYMAP[e.code]) pressed.add(KEYMAP[e.code]);
  initAudio();
  if (e.code === 'KeyP' && (G.state === 'play') && G.ready && !e.repeat) { G.paused ? resume() : pause(); }
  if (G.state === 'rate' && G.rateDone) { const n = +e.key; if (n >= 1 && n <= 5) G.rateDone(n); else if (e.code === 'Escape' || e.code === 'Enter' || e.code === 'Space') G.rateDone(0); keys.add(e.code); return; }
  if (e.code === 'KeyT' && (G.state === 'title' || G.state === 'end' || G.paused)) { G.statsOpen ? closeStats() : openStats(); }
  if (G.state === 'story' && !keys.has(e.code) && !e.repeat) storyKey();
  if (G.state === 'title' && e.code === 'KeyN' && G.ready) { learned.clear(); try { localStorage.removeItem(LEARN_KEY); } catch (er) { } saveProgress(0); refreshTitle(); startGame(0); }
  keys.add(e.code);
});
addEventListener('keyup', e => keys.delete(e.code));
addEventListener('blur', () => { keys.clear(); if (G.state === 'play' && !G.paused) pause(); });
const held = (...c) => c.some(k => keys.has(k));

function lock() { if (TOUCH) return; try { const r = renderer.domElement.requestPointerLock(); if (r && r.catch) r.catch(() => { }); } catch (e) { } }
document.addEventListener('pointerlockchange', () => {
  G.locked = document.pointerLockElement === renderer.domElement;   // losing capture never pauses: the mouse is optional
});
let dragging = false;
addEventListener('pointerdown', e => {
  initAudio();
  if (!G.ready) return;
  if (G.statsOpen || G.state === 'rate') return;
  if (G.state === 'story') { storyKey(); return; }
  if (G.state === 'title') { startGame(); return; }
  if (G.state === 'end') { startGame(0); return; }
  if (G.paused) { resume(); return; }
  if (G.state === 'dead' && G.deadT > 0.5) { retry(); return; }
  if (G.state === 'replay') { endReplay(); return; }
  // Touch pointers activate menus above, but should not start mouse-look in gameplay.
  if (e.pointerType !== 'mouse') return;
  if (G.state === 'play' || G.state === 'dead') { if (!G.locked) lock(); dragging = !G.locked; G.lastMouse = G.time; }
});
addEventListener('mouseup', () => dragging = false);
addEventListener('mousemove', e => {
  if (!dragging && !G.locked) return;
  if (G.state !== 'play' || G.paused) return;   // menus, replays, story screens: the mouse never turns the camera
  const mx = e.movementX || 0, my = e.movementY || 0;
  cam.uYaw -= mx * 0.0022; cam.uPitch = clamp(cam.uPitch + my * 0.0018, -0.3, 0.45);
  G.lastMouse = G.time;
});

// =====================================================================
// WORLD
// =====================================================================
const world = { group: null, labels: [], extraOcc: [], gates: [], crystals: [], checkpoints: [], shells: [], barriers: [], solids: [], meshes: [], enemies: [], blasters: [], bullets: [], fireballs: [], coins: [], items: [], movers: [], bumps: [], parts: [], decor: [], flag: null, start: new V3() };
const STEP = 0.06;

function clearWorld() {
  if (world.group) scene.remove(world.group);
  world.group = new THREE.Group(); scene.add(world.group);
  for (const k of ['labels', 'extraOcc', 'gates', 'crystals', 'checkpoints', 'shells', 'barriers', 'solids', 'meshes', 'enemies', 'blasters', 'bullets', 'fireballs', 'coins', 'items', 'movers', 'bumps', 'parts', 'decor']) world[k] = [];
  world.flag = null; world.hints = []; world.camMeshes = null; faded.clear(); $('bossbar').classList.add('hide-el');
  for (const p of popups) p.el.remove(); popups.length = 0;
  if (typeof $ === 'function' && $('labels')) $('labels').innerHTML = '';
}

function addSolid(x0, y0, z0, x1, y1, z1, mat, o = {}) {
  const w = +(x1 - x0).toFixed(3), h = +(y1 - y0).toFixed(3), d = +(z1 - z0).toFixed(3);
  const m = new THREE.Mesh(boxGeo(w, h, d), mat);
  m.position.set((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
  m.castShadow = o.cast !== false; m.receiveShadow = true;
  if (o.visible === false) m.visible = false;
  if (!TOUCH && o.edges !== false && o.visible !== false) m.add(new THREE.LineSegments(edgeGeo(w, h, d), M.edge));
  world.group.add(m);
  const s = { min: new V3(x0, y0, z0), max: new V3(x1, y1, z1), mesh: m, type: o.type || 'solid' };
  m.userData.solid = s;
  world.solids.push(s); world.meshes.push(m);
  return s;
}
function removeSolid(s) {
  world.solids.splice(world.solids.indexOf(s), 1);
  world.meshes.splice(world.meshes.indexOf(s.mesh), 1);
  world.group.remove(s.mesh);
}
function solidAt(x, y, z) {
  for (const s of world.solids) if (x > s.min.x && x < s.max.x && y > s.min.y && y < s.max.y && z > s.min.z && z < s.max.z) return s;
  return null;
}
function overlapBox(p, he, s) {
  return p.x + he.x > s.min.x && p.x - he.x < s.max.x && p.z + he.z > s.min.z && p.z - he.z < s.max.z && p.y + he.h > s.min.y && p.y < s.max.y;
}
function bodiesOverlap(a, b, shrink = 0.85) {
  return Math.abs(a.p.x - b.p.x) < (a.he.x + b.he.x) * shrink && Math.abs(a.p.z - b.p.z) < (a.he.z + b.he.z) * shrink &&
    a.p.y < b.p.y + b.he.h * shrink && a.p.y + a.he.h > b.p.y + b.he.h * (1 - shrink);
}

// swept-ish AABB vs world, axis separated. p = feet centre.
function moveBody(b, dt) {
  const S = world.solids, p = b.p, v = b.v, he = b.he;
  const r = { ground: null, ceil: null, wall: false };
  const lift = b.assist && v.y <= 4 ? 0.36 : 0;
  const stepUp = s => { if (lift && p.y + lift >= s.max.y && !solidAt(p.x, s.max.y + he.h * 0.5, p.z)) { b.snapY = (b.snapY || 0) + (s.max.y - p.y); p.y = s.max.y; if (v.y < 0) v.y = 0; return true; } return false; };
  p.x += v.x * dt;
  for (const s of S) {
    if (p.x + he.x > s.min.x && p.x - he.x < s.max.x && p.z + he.z > s.min.z && p.z - he.z < s.max.z && p.y + he.h > s.min.y && p.y + STEP < s.max.y) {
      if (s.oneWay) continue;
      if (stepUp(s)) continue;
      const left = p.x < (s.min.x + s.max.x) / 2;
      p.x = left ? s.min.x - he.x - 1e-4 : s.max.x + he.x + 1e-4; v.x = 0; r.wall = true; r.wnx = left ? -1 : 1;
    }
  }
  p.z += v.z * dt;
  for (const s of S) {
    if (p.x + he.x > s.min.x && p.x - he.x < s.max.x && p.z + he.z > s.min.z && p.z - he.z < s.max.z && p.y + he.h > s.min.y && p.y + STEP < s.max.y) {
      if (s.oneWay) continue;
      if (stepUp(s)) continue;
      const near = p.z < (s.min.z + s.max.z) / 2;
      p.z = near ? s.min.z - he.z - 1e-4 : s.max.z + he.z + 1e-4; v.z = 0; r.wall = true; r.wnz = near ? -1 : 1;
    }
  }
  const up = v.y > 0, y0 = p.y;
  p.y += v.y * dt;
  let best = 1e9;
  for (const s of S) {
    if (!overlapBox(p, he, s)) continue;
    if (s.oneWay && (up || y0 < s.max.y - 0.12 - (s.delta ? Math.max(s.delta.y, 0) : 0))) continue;   // jump-through: only land from above
    if (up && b.assist) {
      // corner correction: barely clipping a block edge slides you past it
      const ox1 = p.x + he.x - s.min.x, ox2 = s.max.x - (p.x - he.x), oz1 = p.z + he.z - s.min.z, oz2 = s.max.z - (p.z - he.z);
      const m = Math.min(ox1, ox2, oz1, oz2);
      if (m < 0.25 && !solidAt(p.x + (m === ox1 ? -m - 0.02 : m === ox2 ? m + 0.02 : 0), p.y + he.h * 0.5, p.z + (m === oz1 ? -m - 0.02 : m === oz2 ? m + 0.02 : 0))) {
        const bx = p.x, bz = p.z;
        if (m === ox1) p.x -= m + 0.01; else if (m === ox2) p.x += m + 0.01; else if (m === oz1) p.z -= m + 0.01; else p.z += m + 0.01;
        b.snapX = (b.snapX || 0) + (p.x - bx); b.snapZ = (b.snapZ || 0) + (p.z - bz);
        if (s.type === 'q' || s.type === 'brick') b.edgeHit = s;   // grazed a block: it still gets bumped
        continue;
      }
    }
    if (up) {
      p.y = s.min.y - he.h - 1e-4;
      const dd = Math.abs(p.x - (s.min.x + s.max.x) / 2) + Math.abs(p.z - (s.min.z + s.max.z) / 2);
      if (dd < best) { best = dd; r.ceil = s; }
    } else { p.y = s.max.y; r.ground = s; }
    v.y = 0;
  }
  return r;
}

const ray = new THREE.Raycaster();
const _d = new V3();
function rayDist(a, dir, far) {
  ray.set(a, dir); ray.far = far;
  const h = ray.intersectObjects(world.meshes, false);
  return h.length ? h[0].distance : far;
}
function camRayDist(a, dir, far) {
  // camera only collides with big terrain — floating blocks, pipes and bricks never yank it in
  if (!world.camMeshes) world.camMeshes = world.solids.filter(s => s.type === 'solid' && (s.max.x - s.min.x) * (s.max.y - s.min.y) * (s.max.z - s.min.z) > 12 && s.mesh.visible).map(s => s.mesh);
  ray.set(a, dir); ray.far = far;
  const h = ray.intersectObjects(world.camMeshes, false);
  return h.length ? h[0].distance : far;
}
// see-through occluders: blocks between the camera and Mario fade out
const fadeCache = new Map(), faded = new Set();
const FADE_MIN = 0.14;
// each faded mesh gets its own transparent copy so it can ease in/out on its own
const fadeMat = m => { const f = m.clone(); f.transparent = true; f.opacity = 1; f.depthWrite = false; return f; };
const _oc = new V3();
function updateOccluders() {
  const now = new Set();
  if (G.state === 'play' || G.state === 'dead') {
    const P = player; _oc.set(P.p.x, P.p.y + P.he.h * 0.55, P.p.z);
    for (const tgt of [_oc, new V3(P.p.x, P.p.y + 0.1, P.p.z)]) {
      const dir = tgt.clone().sub(camera.position), L = dir.length(); dir.divideScalar(L);
      ray.set(camera.position, dir); ray.far = L - 0.25;
      for (const h of ray.intersectObjects(world.extraOcc, false)) now.add(h.object);
      for (const h of ray.intersectObjects(world.meshes, false)) {
        const so = h.object.userData.solid;
        if (!so || so === P.ground || so.max.y <= P.p.y + 0.35) continue;   // floors never fade
        if (so.vis) so.vis.forEach(m => now.add(m)); else if (h.object.visible) now.add(h.object);
      }
    }
    // fade only what really sits in the line of sight (a thick camera→Mario ray), or practically touches the lens
    const c = camera.position, seg = _oc.clone().sub(c);
    const boxDist2 = (so, x, y, z) => { const dx = Math.max(so.min.x - x, 0, x - so.max.x), dy = Math.max(so.min.y - y, 0, y - so.max.y), dz = Math.max(so.min.z - z, 0, z - so.max.z); return dx * dx + dy * dy + dz * dz; };
    for (const so of world.solids) {
      if (so === P.ground || so.max.y <= P.p.y + 0.35) continue;
      let hit = boxDist2(so, c.x, c.y, c.z) < 6.25;
      // sample only the camera-side 70% of the sight line: walls standing *beside* Mario are not in the way
      for (let k = 1; k <= 10 && !hit; k++) { const t = k / 10 * 0.55; hit = boxDist2(so, c.x + seg.x * t, c.y + seg.y * t, c.z + seg.z * t) < 0.16; }
      if (hit) { if (so.vis) so.vis.forEach(m => now.add(m)); else if (so.mesh.visible) now.add(so.mesh); }
    }
  }
  const fdt = Math.min(G.realDt || 1 / 60, 0.05);
  for (const m of now) if (!faded.has(m)) { const cur = m.material; m.userData.origMat = cur; m.material = fadeMat(cur); for (const c of m.children) c.visible = false; faded.add(m); }
  for (const m of faded) {
    const ud = m.userData;
    if (now.has(m)) ud.fadeHold = 0.35; else ud.fadeHold = Math.max(0, (ud.fadeHold || 0) - fdt);   // linger a moment before returning
    const want = ud.fadeHold > 0 ? FADE_MIN : 1;
    m.material.opacity = damp(m.material.opacity, want, want < m.material.opacity ? 14 : 7, fdt);
    if (want === 1 && m.material.opacity > 0.985) { m.material.dispose(); m.material = ud.origMat; for (const c of m.children) c.visible = true; faded.delete(m); }
  }
}
function los(a, b) { _d.subVectors(b, a); const L = _d.length(); _d.divideScalar(L); return rayDist(a, _d, L) >= L - 0.4; }

// =====================================================================
// MODELS
// =====================================================================
// ---------- SDF sculpting → faceted low-poly meshes (baked once at load with surface nets)
const SD = {
  sph: (cx, cy, cz, r) => (x, y, z) => Math.hypot(x - cx, y - cy, z - cz) - r,
  ell: (cx, cy, cz, rx, ry, rz) => (x, y, z) => {
    const px = (x - cx) / rx, py = (y - cy) / ry, pz = (z - cz) / rz, k0 = Math.hypot(px, py, pz), k1 = Math.hypot(px / rx, py / ry, pz / rz);
    return k1 < 1e-9 ? -Math.min(rx, ry, rz) : k0 * (k0 - 1) / k1;
  },
  cone: (ax, ay, az, bx, by, bz, r1, r2 = r1) => {           // round cone (iq)
    const bax = bx - ax, bay = by - ay, baz = bz - az, l2 = bax * bax + bay * bay + baz * baz, rr = r1 - r2, a2 = l2 - rr * rr, il2 = 1 / l2;
    return (x, y, z) => {
      const pax = x - ax, pay = y - ay, paz = z - az, yy = pax * bax + pay * bay + paz * baz, zz = yy - l2;
      const qx = pax * l2 - bax * yy, qy = pay * l2 - bay * yy, qz = paz * l2 - baz * yy, x2 = qx * qx + qy * qy + qz * qz;
      const y2 = yy * yy * l2, z2 = zz * zz * l2, k = Math.sign(rr) * rr * rr * x2;
      if (Math.sign(zz) * a2 * z2 > k) return Math.sqrt(x2 + z2) * il2 - r2;
      if (Math.sign(yy) * a2 * y2 < k) return Math.sqrt(x2 + y2) * il2 - r1;
      return (Math.sqrt(x2 * a2 * il2) + yy * rr) * il2 - r1;
    };
  },
  rbox: (cx, cy, cz, hx, hy, hz, r) => (x, y, z) => {
    const qx = Math.abs(x - cx) - hx + r, qy = Math.abs(y - cy) - hy + r, qz = Math.abs(z - cz) - hz + r;
    return Math.hypot(Math.max(qx, 0), Math.max(qy, 0), Math.max(qz, 0)) + Math.min(Math.max(qx, qy, qz), 0) - r;
  },
  // keep the side where n·p > d
  half: (nx, ny, nz, d) => { const l = Math.hypot(nx, ny, nz); return (x, y, z) => (d - (x * nx + y * ny + z * nz)) / l; },
  smooth: (k, ...fs) => (x, y, z) => {
    let d = fs[0](x, y, z);
    for (let i = 1; i < fs.length; i++) { const b = fs[i](x, y, z), h = Math.max(k - Math.abs(d - b), 0) / k; d = Math.min(d, b) - h * h * k * 0.25; }
    return d;
  },
  and: (...fs) => (x, y, z) => { let d = -1e9; for (const f of fs) d = Math.max(d, f(x, y, z)); return d; },
  cut: (a, b) => (x, y, z) => Math.max(a(x, y, z), -b(x, y, z)),
  mirror: f => (x, y, z) => f(Math.abs(x), y, z),
};
function bakeSDF(f, b0, b1, step) {
  const nx = Math.ceil((b1[0] - b0[0]) / step) + 2, ny = Math.ceil((b1[1] - b0[1]) / step) + 2, nz = Math.ceil((b1[2] - b0[2]) / step) + 2;
  const F = new Float32Array(nx * ny * nz), id = (i, j, k) => i + nx * (j + ny * k);
  for (let k = 0; k < nz; k++) for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++)
    F[id(i, j, k)] = (i === 0 || j === 0 || k === 0 || i === nx - 1 || j === ny - 1 || k === nz - 1) ? 1 : f(b0[0] + (i - 1) * step, b0[1] + (j - 1) * step, b0[2] + (k - 1) * step);
  const V = new Int32Array(nx * ny * nz).fill(-1), pos = [], idx = [], cv = new Float32Array(8);
  const C = [[0, 0, 0], [1, 0, 0], [0, 1, 0], [1, 1, 0], [0, 0, 1], [1, 0, 1], [0, 1, 1], [1, 1, 1]];
  const E = [[0, 1], [2, 3], [4, 5], [6, 7], [0, 2], [1, 3], [4, 6], [5, 7], [0, 4], [1, 5], [2, 6], [3, 7]];
  for (let k = 0; k < nz - 1; k++) for (let j = 0; j < ny - 1; j++) for (let i = 0; i < nx - 1; i++) {
    let m = 0;
    for (let c = 0; c < 8; c++) { cv[c] = F[id(i + C[c][0], j + C[c][1], k + C[c][2])]; if (cv[c] < 0) m |= 1 << c; }
    if (m === 0 || m === 255) continue;
    let sx = 0, sy = 0, sz = 0, n = 0;
    for (const [a, b] of E) if ((cv[a] < 0) !== (cv[b] < 0)) {
      const t = cv[a] / (cv[a] - cv[b]); sx += C[a][0] + t * (C[b][0] - C[a][0]); sy += C[a][1] + t * (C[b][1] - C[a][1]); sz += C[a][2] + t * (C[b][2] - C[a][2]); n++;
    }
    V[id(i, j, k)] = pos.length / 3;
    pos.push(b0[0] + (i - 1 + sx / n) * step, b0[1] + (j - 1 + sy / n) * step, b0[2] + (k - 1 + sz / n) * step);
  }
  const P = (v, o) => pos[v * 3 + o];
  const quad = (a, b, c, d, flip) => { if (a < 0 || b < 0 || c < 0 || d < 0) return; if (flip) idx.push(a, c, b, a, d, c); else idx.push(a, b, c, a, c, d); };
  for (let k = 1; k < nz - 1; k++) for (let j = 1; j < ny - 1; j++) for (let i = 1; i < nx - 1; i++) {
    const in0 = F[id(i, j, k)] < 0;
    if (in0 !== (F[id(i + 1, j, k)] < 0)) quad(V[id(i, j - 1, k - 1)], V[id(i, j, k - 1)], V[id(i, j, k)], V[id(i, j - 1, k)], !in0);
    if (in0 !== (F[id(i, j + 1, k)] < 0)) quad(V[id(i - 1, j, k - 1)], V[id(i - 1, j, k)], V[id(i, j, k)], V[id(i, j, k - 1)], !in0);
    if (in0 !== (F[id(i, j, k + 1)] < 0)) quad(V[id(i - 1, j - 1, k)], V[id(i, j - 1, k)], V[id(i, j, k)], V[id(i - 1, j, k)], !in0);
  }
  // orientation check against the field gradient (outward)
  let agree = 0;
  for (let t = 0; t < Math.min(idx.length, 600); t += 3) {
    const a = idx[t], b = idx[t + 1], c = idx[t + 2];
    const ux = P(b, 0) - P(a, 0), uy = P(b, 1) - P(a, 1), uz = P(b, 2) - P(a, 2), vx = P(c, 0) - P(a, 0), vy = P(c, 1) - P(a, 1), vz = P(c, 2) - P(a, 2);
    const cx = uy * vz - uz * vy, cy = uz * vx - ux * vz, cz = ux * vy - uy * vx;
    const mx = (P(a, 0) + P(b, 0) + P(c, 0)) / 3, my = (P(a, 1) + P(b, 1) + P(c, 1)) / 3, mz = (P(a, 2) + P(b, 2) + P(c, 2)) / 3, h = step * 0.5;
    const gx = f(mx + h, my, mz) - f(mx - h, my, mz), gy = f(mx, my + h, mz) - f(mx, my - h, mz), gz = f(mx, my, mz + h) - f(mx, my, mz - h);
    agree += Math.sign(cx * gx + cy * gy + cz * gz);
  }
  if (agree < 0) for (let t = 0; t < idx.length; t += 3) { const q = idx[t + 1]; idx[t + 1] = idx[t + 2]; idx[t + 2] = q; }
  let g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx);
  return g;
}
// decimate to clean, deliberate low-poly facets, then flat-shade (the SUPERHOT crystal look)
const simplifier = new SimplifyModifier();
// Taubin smoothing: evens out the surface-nets grid without shrinking the shape (and never opens holes)
function relax(g, iters = 3) {
  const pos = g.attributes.position, idx = g.index.array, n = pos.count, P = pos.array;
  const nb = Array.from({ length: n }, () => []);
  for (let i = 0; i < idx.length; i += 3) { const a = idx[i], b = idx[i + 1], c = idx[i + 2]; nb[a].push(b, c); nb[b].push(a, c); nb[c].push(a, b); }
  const tmp = new Float32Array(P.length);
  const pass = lam => {
    for (let v = 0; v < n; v++) {
      const s = nb[v], k = s.length;
      if (!k) { tmp[v * 3] = P[v * 3]; tmp[v * 3 + 1] = P[v * 3 + 1]; tmp[v * 3 + 2] = P[v * 3 + 2]; continue; }
      let x = 0, y = 0, z = 0; for (const u of s) { x += P[u * 3]; y += P[u * 3 + 1]; z += P[u * 3 + 2]; }
      tmp[v * 3] = P[v * 3] + lam * (x / k - P[v * 3]); tmp[v * 3 + 1] = P[v * 3 + 1] + lam * (y / k - P[v * 3 + 1]); tmp[v * 3 + 2] = P[v * 3 + 2] + lam * (z / k - P[v * 3 + 2]);
    }
    P.set(tmp);
  };
  for (let i = 0; i < iters; i++) { pass(0.5); pass(-0.53); }
  pos.needsUpdate = true; return g;
}
// watertight low-poly: surface nets on a coarse grid + relax + flat shading (no decimation = no holes, no flipped triangles)
function facet(g) {
  relax(g, 8);
  g = g.toNonIndexed(); g.computeVertexNormals();   // flat shading: crisp low-poly planes (mesh stays watertight)
  return g;
}
// true low-poly: shrink-wrap an icosahedron (80 or 320 triangles) onto the sculpted shape — few big even facets, always closed
function shrinkWrap(f, b0, b1, detail) {
  // an interior point to cast from: the deepest sample in the box
  let c = new V3(), best = 1e9; const N = 14;
  for (let i = 0; i <= N; i++) for (let j = 0; j <= N; j++) for (let k = 0; k <= N; k++) {
    const x = b0[0] + (b1[0] - b0[0]) * i / N, y = b0[1] + (b1[1] - b0[1]) * j / N, z = b0[2] + (b1[2] - b0[2]) * k / N, d = f(x, y, z);
    if (d < best) { best = d; c.set(x, y, z); }
  }
  const maxR = Math.hypot(b1[0] - b0[0], b1[1] - b0[1], b1[2] - b0[2]);
  const base = WRAP.mode === 'box' ? new THREE.BoxGeometry(2, 2, 2, 2, 2, 2) : new THREE.IcosahedronGeometry(1, WRAP.mode === 'gem' ? 0 : detail);
  let g = mergeVertices(base.deleteAttribute('normal').deleteAttribute('uv'));
  const pos = g.attributes.position, d = new V3();
  for (let i = 0; i < pos.count; i++) {
    d.set(pos.getX(i), pos.getY(i), pos.getZ(i)).normalize();
    let lo = 0, hi = 0, st = maxR / 120;
    for (let t = st; t <= maxR; t += st) { if (f(c.x + d.x * t, c.y + d.y * t, c.z + d.z * t) > 0) { hi = t; break; } lo = t; }
    if (!hi) hi = lo;
    for (let it = 0; it < 18; it++) { const m = (lo + hi) / 2; if (f(c.x + d.x * m, c.y + d.y * m, c.z + d.z * m) > 0) hi = m; else lo = m; }
    const inflate = WRAP.mode === 'gem' ? 1.2 : 1;   // a 20-face gem touches only at its corners — push faces out to the surface
    pos.setXYZ(i, c.x + d.x * hi * inflate, c.y + d.y * hi * inflate, c.z + d.z * hi * inflate);
  }
  g = g.toNonIndexed(); g.computeVertexNormals();
  return g;
}
const WRAP = { mode: 'gem' };
const sculpt = (key, f, b0, b1, step) => cached('lp-' + WRAP.mode + '-' + key, () => shrinkWrap(f, b0, b1, Math.max(b1[0] - b0[0], b1[1] - b0[1], b1[2] - b0[2]) > 0.55 ? 2 : 1));

// Hand-built low-poly Mario (Super Mario 64 proportions): few deliberate shapes, flat-shaded
function buildMario() {
  const root = new THREE.Group();
  const pivot = new THREE.Group(); pivot.position.y = 0.7; root.add(pivot);
  const body = new THREE.Group(); body.position.y = -0.7; pivot.add(body);
  const add = (geo, mat, parent, x = 0, y = 0, z = 0) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; parent.add(m); return m; };
  const lathe = (key, pts, seg = 8) => cached('mlathe-' + key, () => new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), seg));
  const sph = (r, w, h) => cached(`msph${r}|${w}|${h}`, () => new THREE.SphereGeometry(r, w, h));
  // legs + shoes
  const legs = [1, -1].map(sx => {
    const leg = new THREE.Group(); leg.position.set(0.13 * sx, 0.45, 0); leg.rotation.y = sx > 0 ? 0.32 : -0.12; body.add(leg);   // uneven toe-out
    add(cylGeo(0.1, 0.085, 0.36, 6), M.overall, leg, 0, -0.16, 0.01);   // reaches down into the shoe — no gap at the ankle
    // flat-soled shoe: upper dome cut flat + a sole that sits on the floor
    const up = add(cached('mshoeup', () => new THREE.SphereGeometry(0.15, 8, 5, 0, Math.PI * 2, 0, Math.PI * 0.62)), M.shoe, leg, 0, -0.39, 0.07); up.scale.set(0.95, 0.75, 1.5);
    const sole = add(cylGeo(0.142, 0.145, 0.03, 8), M.shoe, leg, 0, -0.435, 0.07); sole.scale.set(0.95, 1, 1.5);
    return leg;
  });
  // torso: black pear of overalls, white chest, bib + straps + buttons
  add(lathe('belly', [[0, 0.36], [0.2, 0.38], [0.29, 0.5], [0.31, 0.64], [0.27, 0.78], [0, 0.84]]), M.overall, body);
  add(lathe('chest', [[0, 0.74], [0.25, 0.76], [0.28, 0.86], [0.22, 0.98], [0.12, 1.03], [0, 1.04]]), M.shirt, body);
  add(boxGeo(0.3, 0.16, 0.08), M.overall, body, 0, 0.83, 0.21).rotation.x = -0.2;
  // back straps: the left one has slipped down the shoulder
  const bs1 = add(boxGeo(0.07, 0.26, 0.05), M.overall, body, 0.11, 0.92, -0.2); bs1.rotation.x = 0.3;
  const bs2 = add(boxGeo(0.07, 0.26, 0.05), M.overall, body, -0.15, 0.9, -0.2); bs2.rotation.set(0.3, 0, -0.35);
  for (const sx of [1, -1]) {
    const st = add(boxGeo(0.07, 0.24, 0.05), M.overall, body, 0.11 * sx, 0.93, 0.19); st.rotation.x = -0.35;
    add(cached('mbtn', () => new THREE.SphereGeometry(0.035, 6, 4)), M.glove, body, 0.1 * sx, 0.86, 0.255);
  }
  // arms + big gloves
  const arms = [1, -1].map(sx => {
    const arm = new THREE.Group(); arm.position.set(0.3 * sx, 0.95, 0); body.add(arm);
    add(sph(0.09, 6, 4), M.shirt, arm, 0, 0, 0);
    add(cylGeo(0.075, 0.07, 0.2, 6), M.shirt, arm, 0, -0.12, 0);
    add(sph(0.125, 7, 5), M.glove, arm, 0, -0.3, 0.01);
    return arm;
  });
  // head
  const head = new THREE.Group(); head.position.set(0, 1.18, 0.02); body.add(head);
  add(sph(0.29, 10, 7), M.skin, head).scale.set(1, 0.95, 0.95);
  add(sph(0.12, 7, 5), M.skin, head, 0, -0.04, 0.3);                                   // nose
  for (const sx of [1, -1]) {
    const mu = add(sph(0.1, 6, 4), M.hair, head, 0.1 * sx, sx > 0 ? -0.13 : -0.15, 0.25); mu.scale.set(sx > 0 ? 1.6 : 1.4, 0.6, 0.75); mu.rotation.z = (sx > 0 ? 0.5 : 0.28) * sx;
    add(sph(0.065, 6, 4), M.skin, head, 0.28 * sx, -0.02, 0).scale.set(0.5, 1, 0.8);     // ears
    add(boxGeo(0.06, 0.13, 0.08), M.hair, head, 0.26 * sx, 0.0, 0.08);                    // sideburns
  }
  const hairBack = add(sph(0.285, 9, 5), M.hair, head, 0, -0.02, -0.04); hairBack.scale.set(1.01, 0.75, 0.96);
  // one messy tuft sticking out on the left, behind the ear
  const tuft = add(cached('mtuft', () => new THREE.ConeGeometry(0.06, 0.16, 4)), M.hair, head, -0.25, 0.02, -0.17); tuft.rotation.set(0.6, 0, 1.1);
  const tuft2 = add(cached('mtuft', () => new THREE.ConeGeometry(0.06, 0.16, 4)), M.hair, head, -0.21, -0.06, -0.22); tuft2.rotation.set(0.9, 0.3, 0.8); tuft2.scale.setScalar(0.75);
  // cap: low dome + flat bill
  const cap = new THREE.Group(); cap.position.set(0.02, 0.03, -0.01); cap.rotation.set(-0.12, 0.1, -0.14); head.add(cap);   // cocked to one side
  const dome = add(lathe('capdome', [[0.315, 0.0], [0.33, 0.07], [0.3, 0.17], [0.23, 0.26], [0.12, 0.31], [0, 0.32]], 10), M.cap, cap);
  const bill = add(cached('mbill', () => new THREE.CylinderGeometry(0.22, 0.24, 0.035, 10, 1, false, -Math.PI / 2, Math.PI)), M.cap, cap, 0, 0.05, 0.22);
  bill.scale.set(1.05, 1, 1.05); bill.rotation.x = 0.12;
  // cap emblem
  const emb = add(cached('memb', () => new THREE.CircleGeometry(0.08, 14)), M.emblem, cap, 0, 0.175, 0.302); emb.rotation.x = -0.45; emb.castShadow = false;
  M.emblem.polygonOffset = true; M.emblem.polygonOffsetFactor = -4; M.emblem.polygonOffsetUnits = -4; M.emblem.depthWrite = false;
  // eyes
  const eyes = [1, -1].map(sx => { const e = add(cached('eyeOval', () => new THREE.SphereGeometry(1, 6, 4)), M.eyeB, head, 0.085 * sx, 0.04, 0.262); e.scale.set(0.035, 0.068, 0.03); e.rotation.y = 0.3 * sx; return e; });
  slim(root, new Set(eyes), 'mario');
  return { root, pivot, body, legL: legs[0], legR: legs[1], armL: arms[0], armR: arms[1], head, eyes };
}

// draw-call diet: merge a group's direct (non-animated) mesh children into one mesh per material
const mergeCache = new Map();
function mergeChildren(group, keep = new Set(), key = null) {
  const byMat = new Map();
  for (const c of group.children) if (c.isMesh && !keep.has(c) && !c.children.length) (byMat.get(c.material) || byMat.set(c.material, []).get(c.material)).push(c);
  for (const [mat, list] of byMat) {
    if (list.length < 2) continue;
    const ck = key && key + '|' + mat.uuid;
    let geo = ck && mergeCache.get(ck);
    if (!geo) {
      const parts = list.map(m => { m.updateMatrix(); let g = m.geometry.index ? m.geometry.toNonIndexed() : m.geometry.clone();
        for (const a of Object.keys(g.attributes)) if (a !== 'position' && a !== 'normal') g.deleteAttribute(a);
        if (!g.attributes.normal) g.computeVertexNormals(); return g.applyMatrix4(m.matrix); });
      geo = mergeGeometries(parts); if (!geo) continue; if (ck) mergeCache.set(ck, geo);
    }
    const merged = new THREE.Mesh(geo, mat); merged.castShadow = list[0].castShadow; merged.receiveShadow = list[0].receiveShadow;
    for (const m of list) group.remove(m);
    group.add(merged);
  }
}
function slim(root, keep, key) { const groups = []; root.traverse(o => { if (o.isGroup || o === root) groups.push(o); }); groups.forEach((g, i) => mergeChildren(g, keep, key + i)); }

function angryEyes(parent, y, z, spread, s = 1) {
  for (const sx of [1, -1]) {
    const w = mesh(sphGeo(0.09 * s, 10, 8), M.eyeW, spread * sx, y, z, parent, false); w.scale.set(0.8, 1.2, 0.5);
    mesh(sphGeo(0.045 * s, 8, 6), M.eyeB, (spread - 0.015) * sx, y - 0.02 * s, z + 0.04 * s, parent, false);
    const b = mesh(boxGeo(0.17 * s, 0.045 * s, 0.04 * s), M.eyeB, spread * sx, y + 0.12 * s, z + 0.02, parent, false); b.rotation.z = 0.42 * sx;
  }
}
function buildGoomba() {
  const root = new THREE.Group(), body = new THREE.Group(); root.add(body);
  mesh(icoGeo(0.5, 1), M.red, 0, 0.55, 0, body).scale.set(1, 0.7, 1);
  mesh(icoGeo(0.3, 1), M.red2, 0, 0.3, 0.08, body).scale.set(1, 0.9, 0.9);
  angryEyes(body, 0.44, 0.36, 0.13);
  const feet = [1, -1].map(sx => mesh(boxGeo(0.24, 0.14, 0.32), M.black, 0.17 * sx, 0.07, 0.02, root));
  slim(root, new Set(feet), 'goomba');
  return { root, body, feet };
}
function buildShooter() {
  const root = new THREE.Group(), body = new THREE.Group(); root.add(body);
  const laser = new THREE.Mesh(trailGeo, M.laser); laser.visible = false; root.userData.laser = laser;
  const S = SD;
  // sculpted Koopa: domed shell with a rim on the back, belly plate in front, neck + head with a beak-like snout
  const shellF = S.smooth(0.05,
    S.and(S.ell(0, 0.72, -0.1, 0.43, 0.5, 0.4), S.half(0, 0, -1, 0.02)),     // back dome
    S.ell(0, 0.5, -0.04, 0.47, 0.11, 0.44));                                  // rim
  add(sculpt('k-shell', shellF, [-0.55, 0.3, -0.6], [0.55, 1.3, 0.45], 0.02, 120), M.red2);
  const bellyF = S.smooth(0.06, S.ell(0, 0.72, 0.06, 0.33, 0.42, 0.2), S.ell(0, 0.42, 0.04, 0.26, 0.16, 0.18));
  add(sculpt('k-belly', bellyF, [-0.4, 0.2, -0.2], [0.4, 1.2, 0.3], 0.02, 70), M.red3);
  const headF = S.smooth(0.07,
    S.cone(0, 1.0, 0.02, 0, 1.13, 0.12, 0.13, 0.11),
    S.ell(0, 1.24, 0.16, 0.2, 0.19, 0.2),
    S.ell(0, 1.17, 0.33, 0.13, 0.1, 0.13));
  add(sculpt('k-head', headF, [-0.3, 0.88, -0.15], [0.3, 1.5, 0.52], 0.016, 90), M.red);
  angryEyes(body, 1.27, 0.32, 0.085, 0.8);
  for (const sx of [1, -1]) {
    const leg = sculpt('k-leg', S.smooth(0.05, S.cone(0, 0.36, 0, 0, 0.1, 0.03, 0.09, 0.08), S.ell(0, 0.06, 0.08, 0.1, 0.06, 0.15)), [-0.16, -0.02, -0.15], [0.16, 0.48, 0.3], 0.018, 40);
    const m = add(leg, M.red); m.position.x = 0.17 * sx; root.add(m);
  }
  // two-handed aim: both arms meet at the pistol grip
  const armGeo = sculpt('k-arm', S.smooth(0.04, S.cone(0, 0, 0, 0, 0, 0.34, 0.075, 0.065), S.sph(0, 0, 0.36, 0.085)), [-0.13, -0.13, -0.12], [0.13, 0.13, 0.5], 0.016, 40);
  for (const sx of [1, -1]) { const a = add(armGeo, M.red); a.position.set(0.26 * sx, 0.9, 0.05); a.lookAt(new V3(0.08, 0.95, 0.5)); }
  // the pistol: slide, angled grip, trigger guard — reads as a gun from any angle
  const gun = new THREE.Group(); gun.position.set(0.08, 0.98, 0.46); body.add(gun);
  mesh(boxGeo(0.075, 0.085, 0.34), M.black, 0, 0.03, 0.06, gun);                            // slide
  mesh(cylGeo(0.022, 0.022, 0.05, 8), M.black, 0, 0.03, 0.245, gun).rotation.x = Math.PI / 2;  // muzzle
  const grip = mesh(boxGeo(0.065, 0.17, 0.085), M.black, 0, -0.07, -0.05, gun); grip.rotation.x = -0.28;
  mesh(boxGeo(0.02, 0.055, 0.085), M.black, 0, -0.04, 0.04, gun);                           // trigger guard
  const flash = mesh(sphGeo(0.11, 10, 8), M.flash, 0, 0.03, 0.3, gun, false); flash.scale.setScalar(0.001);
  slim(root, new Set([flash, ...gun.children]), 'koopa');
  return { root, body, gun, flash, laser };
  function add(geo, mat) { const m = new THREE.Mesh(geo, mat); m.castShadow = true; body.add(m); return m; }
}
function buildBill() {
  const root = new THREE.Group(), body = new THREE.Group(); body.position.y = 0.42; root.add(body);
  const c = mesh(capGeo(0.38, 0.5), M.red, 0, 0, 0.05, body); c.rotation.x = Math.PI / 2;
  const back = mesh(cylGeo(0.42, 0.42, 0.14, 18), M.black, 0, 0, -0.5, body); back.rotation.x = Math.PI / 2;
  angryEyes(body, 0.13, 0.33, 0.15, 1);
  for (const sx of [1, -1]) mesh(boxGeo(0.1, 0.22, 0.18), M.black, 0.4 * sx, -0.1, -0.05, body);
  slim(root, new Set(), 'bill');
  return { root, body };
}
function buildThwomp() {
  const root = new THREE.Group(), body = new THREE.Group(); root.add(body);
  mesh(boxGeo(1.6, 1.6, 1.1), M.red2, 0, 0.8, 0, body);
  const cone = cached('spk', () => new THREE.ConeGeometry(0.17, 0.36, 4));
  for (const [x, y, rz] of [[-0.95, 0.35, Math.PI / 2], [-0.95, 1.25, Math.PI / 2], [0.95, 0.35, -Math.PI / 2], [0.95, 1.25, -Math.PI / 2], [-0.45, 1.78, 0], [0.45, 1.78, 0], [-0.45, -0.18, Math.PI], [0.45, -0.18, Math.PI]])
    mesh(cone, M.spike, x, y, 0, body).rotation.z = rz;
  angryEyes(body, 1.02, 0.56, 0.3, 1.9);
  for (let i = 0; i < 5; i++) mesh(boxGeo(0.12, 0.2, 0.05), M.eyeW, -0.36 + i * 0.18, 0.42, 0.56, body, false);
  slim(root, new Set(), 'thwomp');
  return { root, body };
}
function buildPiranha() {
  const root = new THREE.Group(), body = new THREE.Group(); root.add(body);
  mesh(cylGeo(0.09, 0.11, 0.95, 8), M.black, 0, 0.47, 0, body);
  for (const sx of [1, -1]) { const l = mesh(sphGeo(0.2, 10, 8), M.black, 0.2 * sx, 0.38, 0, body); l.scale.set(1, 0.3, 0.55); l.rotation.z = -0.4 * sx; }
  const head = new THREE.Group(); head.position.y = 1.02; body.add(head);
  mesh(icoGeo(0.38, 1), M.red, 0, 0.06, 0, head).scale.set(1, 1.05, 1);
  const jaw = mesh(icoGeo(0.34, 1), M.red2, 0, -0.14, 0.04, head); jaw.scale.set(0.95, 0.55, 0.95);
  mesh(boxGeo(0.5, 0.07, 0.3), M.eyeB, 0, -0.06, 0.24, head, false);
  for (let i = 0; i < 4; i++) mesh(cached('tooth', () => new THREE.ConeGeometry(0.035, 0.09, 4)), M.eyeW, -0.15 + i * 0.1, -0.02, 0.36, head, false).rotation.x = Math.PI;
  for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; mesh(sphGeo(0.06, 8, 6), M.eyeW, Math.sin(a) * 0.3, 0.2 + Math.cos(a) * 0.1, Math.cos(a) * 0.25 - 0.05, head, false); }
  slim(root, new Set([jaw]), 'piranha');
  return { root, body, head, jaw };
}
function buildBoss() {
  const root = new THREE.Group(), body = new THREE.Group(); root.add(body);
  mesh(icoGeo(1.0, 1), M.red2, 0, 1.3, -0.3, body).scale.set(1.12, 1.1, 0.95);
  const cone = cached('bspk', () => new THREE.ConeGeometry(0.16, 0.5, 5));
  for (let i = 0; i < 9; i++) { const a = -1.2 + (i % 3) * 1.2, y = 0.75 + Math.floor(i / 3) * 0.55; const c = mesh(cone, M.spike, Math.sin(a) * 0.95, y, -0.3 - Math.cos(a) * 0.82, body); c.lookAt(new V3(Math.sin(a) * 3, y, -0.3 - Math.cos(a) * 3)); c.rotateX(Math.PI / 2); }
  mesh(icoGeo(0.8, 1), M.red3, 0, 1.15, 0.38, body).scale.set(0.95, 1.12, 0.5);
  const head = new THREE.Group(); head.position.set(0, 2.3, 0.45); body.add(head);
  mesh(icoGeo(0.58, 1), M.red, 0, 0, 0, head);
  mesh(icoGeo(0.36, 0), M.red, 0, -0.14, 0.44, head).scale.set(1.2, 0.8, 1);
  const horn = cached('horn', () => new THREE.ConeGeometry(0.12, 0.5, 6));
  for (const sx of [1, -1]) { const h = mesh(horn, M.gold, 0.36 * sx, 0.48, -0.1, head); h.rotation.z = -0.5 * sx; }
  angryEyes(head, 0.16, 0.46, 0.21, 1.7);
  for (let i = 0; i < 4; i++) mesh(cached('btooth', () => new THREE.ConeGeometry(0.05, 0.14, 4)), M.eyeW, -0.2 + i * 0.13, -0.32, 0.66, head, false).rotation.x = Math.PI;
  const mouth = mesh(sphGeo(0.2, 12, 10), M.flash, 0, -0.24, 0.72, head, false); mouth.scale.setScalar(0.001);
  for (const sx of [1, -1]) { const a = mesh(capGeo(0.2, 0.5), M.red, 0.98 * sx, 1.45, 0.3, body); a.rotation.z = 0.6 * sx; a.rotation.x = -0.4; }
  const feet = [1, -1].map(sx => mesh(boxGeo(0.55, 0.3, 0.75), M.black, 0.5 * sx, 0.15, 0.1, root));
  const crown = new THREE.Group(); crown.position.set(0, 0.62, -0.05); head.add(crown);
  for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2; mesh(cached('crn', () => new THREE.ConeGeometry(0.08, 0.28, 4)), M.gold, Math.sin(a) * 0.22, 0, Math.cos(a) * 0.22, crown); }
  slim(root, new Set([mouth, ...feet]), 'boss');
  return { root, body, head, mouth, feet };
}
function buildShell() {
  const g = new THREE.Group();
  const dome = mesh(icoGeo(0.36, 1), M.shellM, 0, 0.2, 0, g); dome.scale.set(1, 0.62, 1.12);
  const rim = mesh(cylGeo(0.37, 0.37, 0.09, 10), M.red2, 0, 0.1, 0, g); rim.scale.z = 1.12;
  mesh(cylGeo(0.33, 0.33, 0.04, 10), M.red3, 0, 0.04, 0, g).scale.z = 1.1;
  return g;
}
function buildMushroom() {
  const g = new THREE.Group();
  const cap = mesh(cached('mhemi', () => new THREE.SphereGeometry(0.34, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2)), M.gold, 0, 0.26, 0, g); cap.scale.y = 0.9;
  for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2; mesh(sphGeo(0.08, 8, 6), M.eyeW, Math.sin(a) * 0.24, 0.42, Math.cos(a) * 0.24, g, false).scale.y = 0.5; }
  mesh(sphGeo(0.08, 8, 6), M.eyeW, 0, 0.57, 0, g, false).scale.y = 0.5;
  mesh(cylGeo(0.2, 0.22, 0.3, 14), M.glove, 0, 0.15, 0, g);
  for (const sx of [1, -1]) mesh(capGeo(0.025, 0.06), M.eyeB, 0.07 * sx, 0.17, 0.19, g, false);
  return g;
}
function buildFlower() {
  const g = new THREE.Group();
  mesh(cylGeo(0.04, 0.04, 0.42, 6), M.black, 0, 0.21, 0, g);
  for (const sx of [1, -1]) { const l = mesh(sphGeo(0.1, 8, 6), M.black, 0.1 * sx, 0.16, 0, g); l.scale.set(1, 0.35, 0.6); }
  const head = new THREE.Group(); head.position.y = 0.52; g.add(head);
  for (let i = 0; i < 7; i++) { const a = i / 7 * Math.PI * 2; mesh(sphGeo(0.1, 10, 8), M.glove, Math.cos(a) * 0.17, Math.sin(a) * 0.17, 0, head).scale.set(1, 1, 0.45); }
  mesh(sphGeo(0.12, 12, 10), M.black, 0, 0, 0.04, head);
  g.userData.head = head;
  return g;
}

// =====================================================================
// REPLAY — SUPERHOT-style: record by world time, play back in real time
// =====================================================================
const REC = { frames: [], wt: 0, last: -1, rate: 1 / 30, qs: [] };
const recMark = (o, ...nodes) => { o.userData.rec = nodes; return o; };
function recReset() { REC.frames = []; REC.wt = 0; REC.last = -1; REC.rate = 1 / 30; REC.qs = []; }
function wNode(a, n) { const p = n.position, q = n.quaternion, s = n.scale; a.push(p.x, p.y, p.z, q.x, q.y, q.z, q.w, s.x, s.y, s.z, n.visible ? 1 : 0); }
function rNode(d, i, n) { n.position.set(d[i], d[i + 1], d[i + 2]); n.quaternion.set(d[i + 3], d[i + 4], d[i + 5], d[i + 6]); n.scale.set(d[i + 7], d[i + 8], d[i + 9]); n.visible = d[i + 10] > 0.5; return i + 11; }
const playerNodes = () => { const m = player.model; return [m.root, m.pivot, m.body, m.legL, m.legR, m.armL, m.armR, m.head, ...m.eyes]; };
function recFrame() {
  const ch = world.group.children, prev = REC.frames.length ? REC.frames[REC.frames.length - 1].kids : null;
  let kids = prev;
  if (!prev || prev.length !== ch.length || prev.some((k, i) => k !== ch[i])) kids = ch.slice();
  const a = [], objs = [];
  for (const o of ch) { const r = o.userData.rec; if (!r) continue; objs.push(o); wNode(a, o); for (const n of r) wNode(a, n); }
  for (const n of playerNodes()) wNode(a, n);
  a.push(camera.position.x, camera.position.y, camera.position.z, camera.quaternion.x, camera.quaternion.y, camera.quaternion.z, camera.quaternion.w, camera.fov);
  REC.frames.push({ t: REC.wt, kids, objs, d: new Float32Array(a) });
  if (REC.frames.length > 5000) { REC.frames = REC.frames.filter((_, i) => i % 2 === 0); REC.rate *= 2; }
}
function applyFrame(f) {
  const g = world.group;
  for (const c of g.children) c.parent = null;
  g.children.length = 0;
  for (const k of f.kids) { k.parent = g; g.children.push(k); }
  let i = 0; const d = f.d;
  for (const o of f.objs) { i = rNode(d, i, o); for (const n of o.userData.rec) i = rNode(d, i, n); }
  for (const n of playerNodes()) i = rNode(d, i, n);
  camera.position.set(d[i], d[i + 1], d[i + 2]); camera.quaternion.set(d[i + 3], d[i + 4], d[i + 5], d[i + 6]);
  camera.fov = d[i + 7]; camera.updateProjectionMatrix();
  for (const q of REC.qs) q.m.material = f.t >= q.t ? M.used : M.q;
}

// =====================================================================
// LEVEL BUILDER
// =====================================================================
const B = {
  start(x, y = 0, z = 0) { world.start.set(x, y, z); },
  hints(list) { world.hints = list.map(([x, t]) => ({ x, t, shown: false })); },
  ground(x0, x1, top = 0, z0 = -4, z1 = 4) { addSolid(x0, top - 10, z0, x1, top, z1, M.white); },
  plat(x0, x1, y0, y1, z0, z1, mat = M.white) { return addSolid(x0, y0, z0, x1, y1, z1, mat); },
  pillar(x0, x1, top, z0, z1) { addSolid(x0, top - 14, z0, x1, top, z1, M.white); },
  q(x, y, z, content = 'coin') { const s = addSolid(x - 0.5, y, z - 0.5, x + 0.5, y + 1, z + 0.5, M.q, { type: 'q', edges: false }); s.content = content; s.used = false; recMark(s.mesh); },
  brick(x, y, z) { recMark(addSolid(x - 0.5, y, z - 0.5, x + 0.5, y + 1, z + 0.5, M.brick, { type: 'brick', edges: false }).mesh); },
  bricks(x0, x1, y, z, qs = {}) { for (let x = x0; x <= x1; x++) qs[x] ? B.q(x, y, z, qs[x]) : B.brick(x, y, z); },
  stair(x0, n, dir = 1, top = 0, z0 = -4, z1 = 4) {
    for (let i = 0; i < n; i++) { const h = dir > 0 ? i + 1 : n - i; addSolid(x0 + i, top - 9.9, z0 + 0.02, x0 + i + 1, top + h, z1 - 0.02, M.hard); }
  },
  pipe(x, z, h, top = 0) {
    const g = new THREE.Group(); g.position.set(x, top, z); world.group.add(g);
    const bm = mesh(cylGeo(0.8, 0.8, h - 0.42, 26), M.pipe, 0, (h - 0.42) / 2, 0, g); bm.receiveShadow = true;
    const rim = mesh(cylGeo(0.98, 0.98, 0.42, 26), M.pipe, 0, h - 0.21, 0, g); rim.receiveShadow = true;
    mesh(cylGeo(0.76, 0.76, 0.02, 22), M.hole, 0, h + 0.002, 0, g, false);
    addSolid(x - 0.98, top - 0.5, z - 0.98, x + 0.98, top + h, z + 0.98, M.pipe, { visible: false, edges: false }).vis = g.children.slice();
  },
  coin(x, y, z) {
    const m = mesh(cylGeo(0.3, 0.3, 0.07, 20), M.gold, x, y, z, world.group); m.rotation.x = Math.PI / 2;
    const g = new THREE.Group(); g.position.set(x, y, z); m.position.set(0, 0, 0); g.add(m); world.group.add(recMark(g));
    world.coins.push({ mesh: g, p: new V3(x, y, z), t: rand(6) });
  },
  coins(x0, x1, y, z, step = 1) { for (let x = x0; x <= x1 + 1e-6; x += step) B.coin(x, y, z); },
  arc(x0, x1, y, z, h, n = 5) { for (let i = 0; i < n; i++) { const t = i / (n - 1); B.coin(x0 + (x1 - x0) * t, y + Math.sin(t * Math.PI) * h, z); } },
  goomba(x, z = 0, y = 0) {
    const m = buildGoomba(); world.group.add(recMark(m.root, m.body, ...m.feet));
    world.enemies.push({ type: 'goomba', p: new V3(x, y + 0.05, z), v: new V3(), he: { x: 0.42, h: 0.86, z: 0.42 }, m, head: -Math.PI / 2, alive: true, t: rand(10), ground: null, turnCD: 0 });
  },
  shooter(x, y, z, o = {}) {
    const m = buildShooter(); world.group.add(recMark(m.root, m.body, m.flash)); world.group.add(recMark(m.laser));
    const e = { type: 'shooter', p: new V3(x, y + 0.05, z), v: new V3(), he: { x: 0.4, h: 1.32, z: 0.4 }, m, head: -Math.PI / 2, alive: true, t: rand(10), cd: rand(1.2, 2.6), ground: null };
    if (o.sleep) e.dormantX = x - o.sleep;          // holds fire until you're this close
    if (o.still) e.still = true;                      // never walks (snipers on ledges)
    world.enemies.push(e);
  },
  // SUPERHOT room: a red crystal wall that shatters once every enemy in [x0, x1] is dead
  gate(x, x0, x1, top = 0, z0 = -4, z1 = 4, h = 6) {
    const s = addSolid(x, top, z0, x + 0.8, top + h, z1, M.red2, { type: 'gate' });
    world.gates.push({ s, x0, x1, open: false });
  },
  crystal(x, y, z) {
    const g = new THREE.Group(); g.position.set(x, y, z); world.group.add(recMark(g));
    const c = mesh(cached('crys', () => new THREE.OctahedronGeometry(0.34, 0)), M.crystal, 0, 0, 0, g); c.scale.y = 1.5;
    const idx = world.crystals.length;
    world.crystals.push({ g, c, p: new V3(x, y, z), idx, got: (G.crysSaved[LEVELS[G.level]?.id] || 0) & (1 << idx) });
    if (world.crystals[idx].got) c.material = M.crystalGot;
  },
  blaster(x, z, dir = -1, top = 0) {
    const g = new THREE.Group(); g.position.set(x, top, z); world.group.add(g);
    mesh(boxGeo(0.9, 0.3, 0.9), M.overall, 0, 0.15, 0, g).receiveShadow = true;
    mesh(boxGeo(1, 1.0, 1), M.black, 0, 0.8, 0, g);
    const bar = mesh(cylGeo(0.42, 0.42, 1.08, 18), M.pipe, 0, 0.8, 0, g); bar.rotation.z = Math.PI / 2;
    mesh(cylGeo(0.32, 0.32, 0.02, 16), M.hole, 0.545 * dir, 0.8, 0, g, false).rotation.z = Math.PI / 2;
    mesh(sphGeo(0.12, 10, 8), M.red, 0, 1.36, 0, g, false);
    addSolid(x - 0.5, top, z - 0.5, x + 0.5, top + 1.3, z + 0.5, M.black, { visible: false, edges: false }).vis = g.children.slice();
    world.blasters.push({ x, z, top, dir, cd: rand(1, 2.5) });
  },
  mover(x, top, z, w, d, axis, amp, spd, phase = 0) {
    const s = addSolid(x - w / 2, top - 0.6, z - d / 2, x + w / 2, top, z + d / 2, M.mover, { type: 'mover' }); s.oneWay = true;
    s.delta = new V3(); recMark(s.mesh);
    world.movers.push({ s, base: new V3(x, top - 0.3, z), axis: new V3(...axis), amp, spd, phase, t: 0, half: new V3(w / 2, 0.3, d / 2) });
  },
  strip(x0, x1, top = 0) {
    for (let x = x0 + 0.3; x < x1; x += 0.9) for (const sz of [1, -1]) {
      const c = mesh(boxGeo(0.22, 0.03, 1.1), M.red2, x, top + 0.016, sz * 0.42, world.group, false); c.rotation.y = sz * 0.75; c.receiveShadow = true;
    }
  },
  plate(x, z, top = 0) {
    const s = addSolid(x - 1.1, top, z - 1.1, x + 1.1, top + 0.18, z + 1.1, M.shellM, { type: 'plate' });
    const ring = mesh(cylGeo(0.5, 0.5, 0.02, 6), M.red2, x, top + 0.19, z, world.group, false); s.deco = ring;
  },
  checkpoint(x, top = 0, z = 0) {
    const g = new THREE.Group(); g.position.set(x, top, z); world.group.add(g);
    mesh(cylGeo(0.04, 0.04, 2.1, 8), M.black, 0, 1.05, 0, g);
    const fl = mesh(boxGeo(0.04, 0.42, 0.7), M.black, 0, 1.85, -0.37, g);
    mesh(cylGeo(0.3, 0.36, 0.14, 8), M.black, 0, 0.07, 0, g);
    world.checkpoints.push({ x, y: top + 0.05, z: 0, fl, hit: false });
    g.children.forEach(m => world.extraOcc.push(m));
  },
  castle(x0, x1, z0 = -3, z1 = 3) {
    addSolid(x0, -10, z0, x1, 0, z1, M.hard);
    addSolid(x0, 0, z1, x1, 1.2, z1 + 0.8, M.castle); addSolid(x0, 0, z0 - 0.8, x1, 1.2, z0, M.castle);
    for (let x = x0 + 3; x < x1 - 1; x += 8) for (const z of [z1 + 1.8, z0 - 1.8]) {
      const m = mesh(boxGeo(1.2, 16, 1.2), M.castle, x, -2, z, world.group); m.receiveShadow = true;
    }
  },
  tower(x, side, top = 4) { const z0 = side > 0 ? 6 : -8; B.pillar(x - 1, x + 1, top, z0, z0 + 2); B.shooter(x, top, z0 + 1); },
  barrier(x, top, z0, z1, h = 7) { world.barriers.push(addSolid(x, top, z0, x + 1, top + h, z1, M.red2, { type: 'barrier' })); },
  thwomp(x, z = 0, top = 0, h = 4.6) {
    const m = buildThwomp(); world.group.add(recMark(m.root, m.body));
    world.enemies.push({ type: 'thwomp', p: new V3(x, top + h, z), v: new V3(), he: { x: 0.8, h: 1.6, z: 0.55 }, m, head: 0, alive: true, t: rand(5), st: 'wait', home: top + h, wt: 0 });
  },
  piranha(x, z, h, top = 0) {
    B.pipe(x, z, h, top);
    const m = buildPiranha(); world.group.add(recMark(m.root, m.body, m.head, m.jaw));
    const base = top + h;
    world.enemies.push({ type: 'piranha', p: new V3(x, base - 1.5, z), v: new V3(), he: { x: 0.42, h: 1.4, z: 0.42 }, m, head: -Math.PI / 2, alive: true, t: rand(5), ph: 'down', wt: rand(0.4, 2.2), up: base, dn: base - 1.5 });
  },
  boss(x, z, top, x0, x1) {
    const m = buildBoss(); world.group.add(recMark(m.root, m.body, m.head, m.mouth, ...m.feet));
    world.enemies.push({ type: 'boss', p: new V3(x, top + 0.05, z), v: new V3(), he: { x: 1.05, h: 2.7, z: 1.05 }, m, head: -Math.PI / 2, alive: true, t: 0, hp: 3, inv: 0, st: 'walk', cd: 2, n: 0, wt: 0, x0, x1 });
  },
  flag(x, top = 0) {
    addSolid(x - 0.5, top, -0.5, x + 0.5, top + 1, 0.5, M.hard);
    const g = new THREE.Group(); g.position.set(x, top + 1, 0); world.group.add(g);
    mesh(cylGeo(0.07, 0.07, 9, 10), M.black, 0, 4.5, 0, g);
    mesh(cylGeo(0.12, 0.07, 0.3, 8), M.black, 0, 9.12, 0, g);
    const shape = new THREE.Shape(); shape.moveTo(0, 0); shape.lineTo(-1.7, -0.6); shape.lineTo(0, -1.2); shape.lineTo(0, 0);
    const fl = mesh(new THREE.ShapeGeometry(shape), new THREE.MeshStandardMaterial({ color: '#ffbf1f', emissive: '#ff9a00', emissiveIntensity: 0.3, side: THREE.DoubleSide, roughness: 0.5 }), -0.07, 8.8, 0, g);
    recMark(g, fl);
    let gEnd = x + 0.5;
    for (const so of world.solids) if (so.max.y === top && so.min.x <= x && so.max.x > gEnd && so.min.z <= -2.9 && so.max.z >= 2.9) gEnd = so.max.x;
    if (gEnd < x + 13) addSolid(gEnd, top - 10, -4, x + 13, top, 4, M.white);
    const cx = x + 8, cz = -2.7, cg = new THREE.Group(); cg.position.set(cx, top, cz); world.group.add(cg);
    const wall = mesh(boxGeo(5, 3.6, 2.4), M.hard, 0, 1.8, 0, cg); wall.receiveShadow = true;
    const keep = mesh(boxGeo(2.6, 2.2, 1.8), M.hard, 0, 4.7, -0.2, cg); keep.receiveShadow = true;
    for (let i = 0; i < 5; i++) mesh(boxGeo(0.6, 0.6, 2.4), M.hard, -2.2 + i * 1.1, 3.9, 0, cg);
    for (let i = 0; i < 3; i++) mesh(boxGeo(0.5, 0.5, 1.8), M.hard, -1.05 + i * 1.05, 6.05, -0.2, cg);
    mesh(boxGeo(1.2, 1.9, 0.06), M.hole, 0, 0.95, 1.23, cg, false);
    const arch = mesh(cylGeo(0.6, 0.6, 0.06, 16, 1), M.hole, 0, 1.9, 1.23, cg, false); arch.rotation.x = Math.PI / 2;
    mesh(boxGeo(0.4, 0.6, 0.06), M.hole, 0, 4.9, 0.72, cg, false);
    mesh(cylGeo(0.04, 0.04, 1.6, 6), M.black, 0, 7.1, -0.2, cg);
    const sf = mesh(boxGeo(0.7, 0.45, 0.04), M.red, 0.37, 7.6, -0.2, cg, false); sf.scale.y = 0.001;
    world.flag = { x, top, g, fl, cx, sf, door: cz + 1.2 };
  },
};

function decorate(x0, x1) {
  for (let x = x0 - 20; x < x1 + 40; x += rand(10, 18) * (TOUCH ? 2.2 : 1)) {
    const side = Math.random() < 0.5 ? -1 : 1;
    const g = new THREE.Group(); g.position.set(x, rand(13, 26), side * rand(22, 55)); world.group.add(g);
    const n = 3 + (Math.random() * 3 | 0);
    for (let i = 0; i < n; i++) { const r = rand(1.4, 2.6); mesh(icoGeo(+r.toFixed(1), 1), M.cloud, (i - n / 2) * 1.9, rand(-0.4, 0.8), rand(-0.8, 0.8), g, false); }
    if (Math.random() < 0.4) for (const sx of [1, -1]) mesh(capGeo(0.14, 0.4), M.eyeB, sx * 0.55, 0.6, -side * 2.1, g, false);
    world.decor.push({ g: recMark(g), spd: rand(0.3, 0.8), kind: 'cloud' });
  }
  for (let x = x0 - 10; x < x1 + 30; x += rand(24, 40)) {
    const side = Math.random() < 0.5 ? -1 : 1, r = +rand(9, 17).toFixed(1);
    const h = mesh(icoGeo(r, 1), M.decor, x, -13, side * rand(38, 60), world.group, false); h.scale.y = 1.35; h.receiveShadow = true;
    const ez = h.position.z - side * r * 0.82, ey = -13 + r * 1.35 * 0.55;
    for (const sx of [1, -1]) mesh(capGeo(0.35, 1.4), M.eyeB, x + sx * 1.3, ey, ez, world.group, false);
  }
  for (let i = 0; i < (TOUCH ? 8 : 26); i++) {
    const s = +rand(0.8, 3.2).toFixed(1);
    const c = mesh(boxGeo(s, s, s), M.decor, rand(x0 - 20, x1 + 30), rand(-34, -8), rand(-45, 45), world.group, false);
    c.rotation.set(rand(6), rand(6), rand(6));
    world.decor.push({ g: recMark(c), spd: rand(0.1, 0.4), kind: 'cube' });
  }
}

const L = (id, name, sub, build) => ({ id, name, sub, build });
const LEVELS = [
  // ---------------- WORLD 1 ----------------
  L('1-1', 'TIME IS A PLUMBER', "STOMP THEM. OR DON'T MOVE.", b => {
    b.start(0, 0, 0);
    b.ground(-10, 82);
    b.coins(2.5, 4.5, 1.3, 0);
    b.plat(6, 7, 0, 1.6, -4, 4, M.hard);                       // a wall: you must jump
    b.coin(6.5, 2.8, 0);
    b.brick(11, 3, 0); b.q(12, 3, 0, 'coin'); b.brick(13, 3, 0); b.q(14, 3, 0, 'mushroom'); b.brick(15, 3, 0);
    b.goomba(21, 0);
    b.pipe(26, 0, 2); b.coin(26, 3, 0); b.pipe(30.5, -1.6, 2.5); b.coin(30.5, 3.5, -1.6);
    b.checkpoint(34);
    b.plat(41, 42.2, 0, 1.3, 1.9, 3.6, M.hard);                // optional cover, off the firing line
    b.shooter(48, 0, 0); world.enemies[world.enemies.length - 1].dormantX = 36.5;   // waits for its lesson
    b.plat(52, 64, 0, 1.4, 1.6, 4, M.hard); b.plat(52, 64, 0, 1.4, -4, -1.6, M.hard);   // the shell corridor
    b.goomba(57, 0); b.goomba(59, 0); b.goomba(61, 0);
    b.checkpoint(67);
    b.coins(69, 75, 1.3, 0, 2);
    b.ground(82, 92, 4.8);                                       // too tall for one jump: double jump
    b.coins(83, 85, 6.2, 0);
    b.checkpoint(86.5, 4.8);
    b.arc(92.5, 98.5, 6.2, 0, 1.6, 5);                          // the long-jump line
    b.ground(98.5, 136, 4.8);
    b.plate(104, 0, 4.8);
    b.goomba(110, 1.5, 4.8); b.goomba(112, -1.5, 4.8);
    b.q(114, 7.8, 0, 'coin'); b.shooter(118, 4.8, 2.5);
    b.crystal(6.5, 4.4, 0);           // hop on the first wall
    b.crystal(99.5, 7.2, 0);          // the top of a perfect long jump
    b.crystal(84.5, 8.6, -3);         // jump from the high ledge's edge
    b.flag(126, 4.8);
  }),
  L('1-2', 'SHELL GAME', 'EVERY KOOPA IS AMMO.', b => {
    b.start(0); b.ground(-8, 112);
    b.coins(3, 6, 1.3, 0); b.q(6, 3, 0, 'mushroom');
    // intro: a sleeping Koopa, three Goombas lined up behind it
    b.shooter(12, 0, 0, { sleep: 5, still: true });
    b.goomba(19, -0.6); b.goomba(20.5, 0); b.goomba(22, 0.6);
    b.pipe(26, 3, 4.6); b.crystal(26, 5.6, 3);                         // double-jump onto the tall pipe
    // develop: a corridor — kick it in, watch it chain
    b.plat(28, 30, 0, 1.2, -1.6, 1.6, M.hard); b.shooter(29, 1.2, 0, { sleep: 4, still: true });
    b.plat(30, 44, 0, 1.4, 1.6, 4, M.hard); b.plat(30, 44, 0, 1.4, -4, -1.6, M.hard);
    b.goomba(35, 0); b.goomba(37, 0); b.goomba(39, 0); b.goomba(41, 0);
    b.checkpoint(46);
    // twist: a ricochet room — shells bounce off the pillar and the walls; clear it to open the gate
    b.plat(50, 64, 0, 2, 3.4, 4, M.hard); b.plat(50, 64, 0, 2, -4, -3.4, M.hard);
    b.plat(56, 57.2, 0, 2.5, -1, 1, M.hard); b.crystal(56.6, 5.7, 0);  // on top of the pillar, then up
    b.shooter(52, 0, 0, { sleep: 5, still: true });
    b.goomba(60, 2.4); b.goomba(60, -2.4); b.goomba(62.5, 0); b.goomba(59, 0);
    b.gate(64, 49, 64);
    // finale: one kick, eight Goombas
    b.plat(72.5, 75, 0, 1, -1.5, 1.5, M.hard); b.shooter(73.6, 1, 0, { sleep: 6, still: true });
    for (let i = 0; i < 8; i++) b.goomba(81 + i * 1.7, (i % 2 ? 0.5 : -0.5));
    b.coins(80, 94, 1.3, 2.8, 2);
    b.plat(98, 104, 0, 4.8, -4, -1.5, M.hard); b.crystal(101, 6, -2.8);          // a double-jump ledge off to the side
    b.flag(106);
  }),
  L('1-3', 'BULLET BALLET', 'EVERY ROOM LOCKS UNTIL IT\'S CLEAN.', b => {
    b.start(0); b.ground(-8, 122, 0, -6, 6);
    b.q(4, 3, 0, 'mushroom');
    // room 1: one Koopa behind cover
    b.pipe(15, 1.6, 2); b.pipe(15, -2.6, 1.5);
    b.shooter(21, 0, 0); b.goomba(18, -3);
    b.gate(24, 8, 24, 0, -6, 6);
    // room 2: crossfire from two pedestals
    b.plat(31, 32, 0, 1.6, -1.5, 1.5, M.hard); b.goomba(34, 0);
    b.plat(38, 40.5, 0, 1.5, 3.5, 5.5, M.hard); b.shooter(39.2, 1.5, 4.5, { still: true });
    b.plat(41, 43.5, 0, 1.5, -5.5, -3.5, M.hard); b.shooter(42.2, 1.5, -4.5, { still: true });
    b.plat(44, 45.5, 0, 4.6, -6, -4.4, M.hard); b.crystal(44.75, 5.8, -5.2);   // double-jump up the pillar
    b.gate(46.5, 25, 46.5, 0, -6, 6);
    b.checkpoint(48.5);
    // room 3: a shell is your shield — three Koopas in a lane
    b.shooter(53, 0, 0, { sleep: 4, still: true });
    b.plat(58, 59, 0, 1.4, 2, 6, M.hard); b.plat(58, 59, 0, 1.4, -6, -2, M.hard);
    b.crystal(58.5, 6.3, 4);
    b.shooter(68, 0, -2, { still: true }); b.shooter(70, 0, 0, { still: true }); b.shooter(72, 0, 2, { still: true });
    b.gate(75, 49, 75, 0, -6, 6);
    // finale: the ring
    b.plat(88.5, 90.5, 0, 2.2, -1, 1, M.hard); b.crystal(89.5, 5, 0);
    b.plat(83, 85, 0, 0.8, 4, 6, M.hard); b.shooter(84, 0.8, 5, { still: true });
    b.plat(83, 85, 0, 0.8, -6, -4, M.hard); b.shooter(84, 0.8, -5, { still: true });
    b.plat(94, 96, 0, 0.8, 4, 6, M.hard); b.shooter(95, 0.8, 5, { still: true });
    b.plat(94, 96, 0, 0.8, -6, -4, M.hard); b.shooter(95, 0.8, -5, { still: true });
    b.goomba(86, 0); b.goomba(92, 2);
    b.gate(100, 76, 100, 0, -6, 6);
    b.stair(104, 5, 1, 0, -6, 6);
    b.flag(115);
  }),
  L('1-4', 'THWOMP HALL', 'LOOK UP. THEN DON\'T.', b => {
    b.start(0); b.castle(-8, 40);
    b.q(5, 3, 0, 'mushroom');
    b.coin(12, 1, 0); b.thwomp(12, 0);
    b.thwomp(18, -1.5); b.thwomp(18, 1.5); b.coin(18, 1, 0);
    b.goomba(22, 0);
    b.plat(24, 25.5, 0, 3, -3, -1.5, M.hard);                           // a perch: jump onto the Thwomp's head
    b.thwomp(27, 0); b.crystal(27, 8.4, 0);
    b.shooter(34, 0, 2);
    b.arc(40.3, 43.7, 1.5, 0, 2, 3); b.crystal(42, 4.7, 0);             // double-jump over the gap
    b.castle(44, 104);
    b.checkpoint(46);
    b.thwomp(50, 0); b.thwomp(54, 0); b.thwomp(58, 0); b.coins(50, 58, 1, 0, 2);
    b.q(62, 3, 0, 'flower');
    b.plat(66, 70, 0, 2, -3, 3, M.hard); b.thwomp(68, 0, 2); b.crystal(68, 2.9, 0);   // grab it from under the Thwomp
    b.goomba(74, 0); b.goomba(76, 1.2);
    b.thwomp(80, -1.5); b.thwomp(82, 1.5); b.shooter(90, 0, 2);
    b.stair(92, 4, 1, 0, -3, 3);
    b.flag(100);
  }),
  // ---------------- WORLD 2 ----------------
  L('2-1', 'SKY HIGH, SLOWLY', 'BLACK PLATFORMS NEVER STOP. RIDING ONE COUNTS AS MOVING.', b => {
    b.start(0, 0, 0);
    b.ground(-8, 12);
    b.coins(3, 7, 1.3, 0);
    b.q(6, 3, 0, 'mushroom');
    b.mover(17, 0, 0, 4, 3.5, [1, 0, 0], 2, 1.1);
    b.ground(23, 34, 1);
    b.goomba(29, 0, 1); b.shooter(33, 1, 2.5);
    b.arc(34, 38, 2.5, 0, 2, 4);
    b.mover(39, 2.5, 0, 3.5, 3.5, [0, 1, 0], 1.5, 1.2);
    b.ground(44, 58, 3, -3, 3);
    b.q(48, 6, 0, 'flower');
    b.goomba(51, 1, 3); b.goomba(53, -1, 3);
    b.blaster(56, 0, -1, 3);
    b.mover(62.5, 3, 0, 3.5, 3.5, [0, 0, 1], 2.5, 1.3);
    b.mover(68, 3.5, 0, 3.5, 3.5, [1, 0, 0], 1.6, 1.6, 1);
    b.coins(61.5, 69.5, 5, 0, 2);
    b.ground(74, 92, 2);
    b.bricks(78, 82, 5, 0, { 80: 'coin' });
    b.coins(76, 82, 3.3, 2.5);
    b.goomba(80, 0, 2); b.goomba(86, -1.5, 2);
    b.shooter(84, 2, -3); b.shooter(88, 2, 3);
    b.pillar(95, 97, 3, -1.5, 1.5);
    b.pillar(100, 102, 4.5, -1.5, 1.5); b.shooter(101, 4.5, 0);
    b.pillar(105, 107, 3.5, -1.5, 1.5);
    b.coin(96, 4.5, 0); b.coin(106, 5, 0);
    b.ground(110, 134, 4);
    b.blaster(118, 0, -1, 4);
    b.goomba(114, 0, 4); b.goomba(116, -1.6, 4);
    b.stair(121, 5, 1, 4);
    b.crystal(39, 6.7, 0);                                              // ride the lift to the top, then jump
    b.pillar(84, 86, 4, -8.5, -6.5); b.crystal(85, 5.2, -7.5);          // a side pillar off the island
    b.crystal(125.5, 10.6, 0);                                          // above the last stair
    b.flag(130, 4);
  }),
  L('2-2', 'LONG JUMP CANYON', 'RUN. SHIFT. FLY.', b => {
    b.start(0); b.ground(-8, 14);
    b.q(6, 3, 0, 'mushroom');
    b.arc(14.5, 20.5, 1.4, 0, 1.6, 5); b.crystal(18, 4.2, 0);           // long jump goes under it; a double jump goes through it
    b.ground(20.5, 34);
    b.goomba(27, 0); b.goomba(29, 1.5);
    b.arc(34.5, 40.5, 1.4, 0, 1.6, 5);
    b.ground(40.5, 60);
    b.blaster(59, 2.6, -1);                                              // Bullet Bills down the runway
    b.coins(44, 52, 1.3, 0, 2);
    b.ground(60, 74, 4.8);
    b.checkpoint(62.5, 4.8);
    b.plat(64, 66, 4.8, 8.3, -6, -4.4, M.hard); b.crystal(65, 9.4, -5.2);
    b.arc(74.5, 80.5, 6.2, 0, 1.6, 5);
    b.ground(80.5, 88, 4.8, -2, 2); b.shooter(87, 4.8, 0, { still: true });
    b.arc(88.5, 94.5, 6.2, 0, 1.6, 5);
    b.ground(94.5, 104, 4.8, -2, 2); b.goomba(99, 0, 4.8);
    b.ground(97, 100, 4.8, 6.5, 9); b.crystal(98.5, 6, 7.7);              // a hidden island to the right
    b.arc(104.5, 111, 6.2, 0, 1.6, 5);
    b.ground(110.5, 134, 4.8);
    b.blaster(122, 0, -1, 4.8); b.goomba(116, 1.5, 4.8);
    b.flag(128, 4.8);
  }),
  L('2-3', 'WALL JUMP TOWER', 'UP IS THE ONLY WAY OUT.', b => {
    b.start(0); b.ground(-8, 22);
    b.q(5, 3, 0, 'mushroom');
    // canyon 1: bounce between the walls, then step onto the block
    b.plat(12, 22, 0, 9, 1.1, 4, M.hard); b.plat(12, 22, 0, 9, -4, -1.1, M.hard);
    b.coin(16, 2.5, 0); b.coin(18, 4.5, 0); b.coin(20, 6.5, 0);
    b.crystal(17, 9.9, 2.6);                                             // on top of the canyon wall
    b.plat(22, 30, -10, 5.5, -4, 4, M.hard);
    // canyon 2: higher, with a sniper waiting at the top
    b.plat(30, 40, -10, 5.5, -1.1, 1.1, M.hard);
    b.plat(30, 40, -10, 14.5, 1.1, 4, M.hard); b.plat(30, 40, -10, 14.5, -4, -1.1, M.hard);
    b.plat(40, 50, -10, 11.5, -4, 4, M.hard);
    b.shooter(48, 11.5, 0, { still: true, sleep: 16 });
    b.checkpoint(44, 11.5);
    // the beam: Bullet Bills come straight down it
    b.plat(50, 62, 1.5, 11.5, -1, 1, M.hard);
    b.blaster(61.3, 0, -1, 11.5); b.crystal(61.3, 14.4, 0);
    // drop to the courtyard
    b.ground(64, 88, 4);
    b.goomba(70, 1.5, 4); b.goomba(72, -1.5, 4); b.shooter(76, 4, 2.5);
    // final canyon up to the flag
    b.plat(80, 88, 4, 14, 1.1, 4, M.hard); b.plat(80, 88, 4, 14, -4, -1.1, M.hard);
    b.crystal(84, 14.9, -2.6);
    b.plat(88, 100, -10, 10, -4, 4, M.hard);
    b.flag(95, 10);
  }),
  L('2-4', 'THE AIRSHIP', 'EVERY RIDE IS IN REAL TIME.', b => {
    b.start(0); b.ground(-8, 10);
    b.q(5, 3, 0, 'mushroom');
    b.mover(16, 0, 0, 4, 4, [1, 0, 0], 2, 1.0);
    b.mover(24, 1, 0, 4, 4, [0, 0, 1], 2.5, 1.2); b.shooter(24, 1, 0);
    b.mover(31, 2, 0, 4, 4, [0, 1, 0], 1.5, 1.0);
    b.ground(36.5, 54, 3, -3, 3); b.thwomp(48, 0, 3); b.goomba(51, 0, 3); b.q(43, 6, 0, 'flower');
    b.mover(60, 3, 0, 4, 4, [1, 0, 0], 2, 1.3); b.shooter(60, 3, 0);
    b.mover(70, 3, 0, 4, 4, [0, 0, 1], 3, 1.0);
    b.mover(77, 4, 0, 4, 4, [1, 0, 0], 2, 1.4, 1.5);
    b.coins(60, 77, 6, 0, 3);
    b.ground(83, 108, 4);
    b.goomba(90, 0, 4); b.goomba(92, 1.5, 4);
    b.blaster(98, -2.5, -1, 4);
    b.crystal(31, 6.6, 0); b.crystal(24, 4.6, 2.6); b.crystal(98, 6.8, -2.5);
    b.flag(104, 4);
  }),
  // ---------------- WORLD 3 ----------------
  L('3-1', 'CROSSFIRE', "IT'S A-ME. STANDING STILL.", b => {
    b.start(0, 0, 0);
    b.ground(-8, 40, 0, -5, 5);
    b.q(5, 3, 0, 'mushroom'); b.q(7, 3, 0, 'flower');
    b.coins(10, 13, 1.3, 0);
    b.tower(16, 1); b.tower(22, -1);
    b.plat(18, 19, 0, 1.5, -1.5, 1.5, M.hard);
    b.plat(25, 26.5, 0, 1.5, -3, -0.5, M.hard);
    b.goomba(20, 2); b.goomba(24, -2);
    b.pipe(30, 2.2, 2); b.shooter(30, 2, 2.2);
    b.gate(39, 10, 39, 0, -5, 5);
    b.crystal(16, 5.4, 7);
    b.pipe(30, -2.5, 2);
    b.tower(34, 1); b.tower(36.5, -1);
    b.arc(40.5, 43.5, 1.5, 0, 2.5, 4);
    b.ground(44, 112, 0, -5, 5);
    b.bricks(48, 54, 3.5, 0, { 51: 'flower' });
    b.goomba(50, 2); b.goomba(52, -2); b.goomba(54, 2.5);
    b.crystal(51, 7.2, 0);
    b.gate(57, 44, 57, 0, -5, 5);
    b.checkpoint(58.5);
    b.blaster(62, -3, -1); b.blaster(62, 3, -1);
    b.coins(60, 64, 1.3, 0);
    b.tower(68, 1); b.tower(70, -1);
    b.plat(72, 76, 0, 2, -2, 2); b.shooter(74, 2, 0);
    b.tower(78, 1);
    b.goomba(81, 0); b.goomba(83, 2.5); b.goomba(85, -2.5);
    b.pipe(88, 0, 2.5); b.shooter(88, 2.5, 0);
    b.gate(92.5, 66, 92.5, 0, -5, 5);
    b.crystal(78, 5.4, 7);
    b.q(91, 3, -3, 'coin'); b.q(91, 3, 3, 'mushroom');
    b.stair(94, 6, 1, 0, -5, 5);
    b.flag(105);
  }),
  L('3-2', 'SHELL SHOCK', 'THE GARDEN BITES. THE SHELLS BITE BACK.', b => {
    b.start(0); b.ground(-8, 64, 0, -5, 5);
    b.q(4, 3, 0, 'mushroom'); b.q(6, 3, 0, 'flower');
    b.shooter(9, 0, 0, { sleep: 4, still: true });
    for (const [x, z, h] of [[12, -2.5, 2], [12, 2.5, 2.5], [18, 0, 2], [24, -2.5, 2.5], [24, 2.5, 2]]) b.piranha(x, z, h);
    b.goomba(15, 0); b.goomba(21, 2.5); b.goomba(21, -2.5);
    b.pipe(30, 0, 3.5); b.shooter(30, 3.5, 0); b.crystal(30, 6.2, -2.4);
    b.gate(33, 8, 33, 0, -5, 5);
    b.bricks(34, 40, 3.5, 0, { 37: 'coin' });
    b.coins(34, 40, 5.5, 0, 2);
    b.piranha(44, 0, 2.5); b.piranha(47, -3, 2); b.piranha(47, 3, 2); b.piranha(50, 0, 3);
    b.tower(56, 1); b.tower(60, -1);
    b.arc(64.3, 67.7, 1.5, 0, 2.5, 4);
    b.ground(68, 112, 0, -5, 5);
    b.q(71, 3, 0, 'flower');
    for (const [x, z, h] of [[75, -3, 2], [75, 3, 2], [79, 0, 2.5], [83, -2.5, 2], [83, 2.5, 3], [87, 0, 2]]) b.piranha(x, z, h);
    b.shooter(70, 0, 0, { sleep: 4, still: true });
    b.goomba(77, 0); b.goomba(81, 1.5); b.goomba(85, -1.5);
    b.shooter(90, 0, 3.5); b.crystal(83, 4.4, 2.5);
    b.gate(91.5, 68, 91.5, 0, -5, 5);
    b.crystal(97.5, 6.8, 0);
    b.stair(93, 5, 1, 0, -5, 5);
    b.flag(103);
  }),
  L('3-3', 'FINAL EXAM', 'EVERYTHING YOU LEARNED. NO HINTS.', b => {
    b.start(0); b.ground(-8, 30, 0, -5, 5);
    b.q(4, 3, 0, 'mushroom');
    // 1. double-jump the ledge while Bills fly down the side lane
    b.blaster(27, 3.2, -1); b.crystal(16, 5.2, 0);
    b.ground(30, 44, 4.8, -4, 4);
    b.checkpoint(32, 4.8);
    // 2. long jump the gap, a sniper on the far side
    b.arc(44.5, 50.5, 6.2, 0, 1.6, 5);
    b.ground(50.5, 62, 4.8, -4, 4); b.shooter(56, 4.8, 2.5, { still: true });
    // 3. wall-jump canyon
    b.plat(62, 72, -6, 4.8, -1.1, 1.1, M.hard);
    b.plat(62, 72, -6, 13.8, 1.1, 4, M.hard); b.plat(62, 72, -6, 13.8, -4, -1.1, M.hard);
    b.crystal(67, 14.7, 2.6);
    b.plat(72, 80, -6, 10.3, -4, 4, M.hard);
    b.checkpoint(76, 10.3);
    // 4. the Thwomp bridge
    b.plat(80, 96, 7, 10.3, -1, 1, M.hard);
    b.thwomp(84, 0, 10.3); b.thwomp(88, 0, 10.3); b.thwomp(92, 0, 10.3);
    // 5. the last room
    b.ground(96, 132, 10.3, -5, 5);
    b.shooter(99, 10.3, 0, { sleep: 4, still: true });
    b.shooter(106, 10.3, 3.5, { still: true }); b.shooter(106, 10.3, -3.5, { still: true }); b.shooter(112, 10.3, 0, { still: true });
    b.goomba(104, 0, 10.3); b.goomba(109, 2, 10.3);
    b.plat(114, 115.5, 10.3, 14.9, -5, -3.5, M.hard); b.crystal(114.75, 16, -4.25);
    b.gate(118, 96, 118, 10.3, -5, 5);
    b.flag(126, 10.3);
  }),
  L('3-4', 'THE CRYSTAL KING', 'THE PRINCESS IS NOT IN THIS CASTLE. NOTHING IS.', b => {
    b.start(0); b.castle(-8, 30);
    b.q(4, 3, 0, 'mushroom'); b.q(6, 3, 0, 'flower');
    b.thwomp(14, 0); b.goomba(18, 0); b.shooter(24, 0, 2.2);
    b.arc(30.3, 32.7, 1.5, 0, 2, 3);
    b.castle(33, 80, -6, 6);
    b.q(40, 4, -3, 'flower'); b.q(40, 4, 3, 'mushroom');
    b.boss(62, 0, 0, 38, 77);
    b.crystal(40, 7.4, -3); b.plat(75, 77, 0, 4.6, 4, 6, M.hard); b.crystal(76, 5.8, 5); b.crystal(86, 1.4, 0);
    b.barrier(78, 0, -6, 6);
    b.castle(80, 96);
    b.flag(90);
  }),
];

// ---------- ASSET VIEWER: every enemy and object on display, walk around with Mario
const GALLERY = L('VIEW', 'ASSET VIEWER', 'WALK AROUND. NOTHING HERE CAN HURT YOU.', b => {
  b.start(0, 0, 0);
  b.ground(-6, 58, 0, -9, 10);
  const E = -4.5, O = 5;   // enemy row (left), object row (right)
  const label = (t, x, y, z) => world.labels.push({ t, p: new V3(x, y, z) });
  b.goomba(6, E); label('GOOMBA', 6, 1.6, E);
  b.shooter(11, 0, E); label('KOOPA SHOOTER', 11, 2.1, E);
  { const m = buildBill(); world.group.add(m.root); world.enemies.push({ type: 'bill', p: new V3(16, 0.6, E), v: new V3(1e-4, 0, 0), he: { x: 0.42, h: 0.84, z: 0.42 }, m, head: Math.PI / 2, alive: true, t: 0, life: 1e9, max: 1e9 }); } label('BULLET BILL', 16, 2.4, E);
  b.piranha(21, E, 2); label('PIRANHA PLANT', 21, 4.6, E);
  b.thwomp(26.5, E, 0, 2.2); label('THWOMP', 26.5, 5.2, E);
  b.boss(34, E, 0, 30, 38); label('THE CRYSTAL KING', 34, 4.1, E);
  b.goomba(41, E); world.enemies[world.enemies.length - 1].shellDemo = true; label('SHELL — RUN INTO IT', 41, 1.5, E);
  b.coin(6, 1.2, O); label('COIN', 6, 2.2, O);
  b.crystal(9, 1.4, O); label('CRYSTAL', 9, 2.6, O);
  { const m = buildMushroom(); m.position.set(12, 0, O); world.group.add(m); } label('MUSHROOM', 12, 1.4, O);
  { const m = buildFlower(); m.position.set(15, 0, O); world.group.add(m); world.decor.push({ g: m, spd: 0, kind: 'flowerShow' }); } label('SHELL FLOWER', 15, 1.5, O);
  b.q(18, 2.6, O, 'coin'); b.brick(19, 2.6, O); b.q(20, 2.6, O, 'mushroom'); label('? BLOCKS + BRICK — HIT FROM BELOW', 19, 4.6, O);
  b.plate(24, O, 0); label('POUND PLATE — SHIFT IN THE AIR', 24, 1.4, O);
  b.checkpoint(28, 0, O); label('CHECKPOINT', 28, 3, O);
  b.pipe(31.5, O, 2); label('PIPE', 31.5, 3, O);
  b.blaster(35, O, -1); label('BULLET BILL BLASTER', 35, 2.4, O);
  b.mover(40, 0.8, O, 3.5, 3.5, [1, 0, 0], 1.6, 1); label('MOVING PLATFORM — JUMP-THROUGH', 40, 3.2, O);
  b.gate(46, 44, 46, 0, 2.5, 8, 4); label('ROOM GATE — WALK UP TO IT', 46.4, 5, O);
  b.flag(50, 0); label('GOAL FLAG + CASTLE', 50, 11, 0);
});
function galleryIdle(e, dt) {
  const m = e.m;
  if (e.type === 'goomba') {
    if (e.shellDemo && !e.converted) { e.converted = true; e.alive = false; world.group.remove(m.root); spawnShell(e.p.x, 0.05, e.p.z, 0); return; }
    const w = e.t * 9; m.body.rotation.z = Math.sin(w) * 0.1; m.body.position.y = Math.abs(Math.sin(w)) * 0.05;
    m.feet[0].position.y = 0.07 + Math.max(0, Math.sin(w)) * 0.08; m.feet[1].position.y = 0.07 + Math.max(0, -Math.sin(w)) * 0.08;
  } else if (e.type === 'shooter') {
    m.body.position.y = Math.sin(e.t * 3) * 0.025; e.head = -Math.PI / 2 + Math.sin(e.t * 0.6) * 0.5;
    m.flash.scale.setScalar(Math.max(0.001, Math.sin(e.t * 1.3) * 0.6)); m.laser.visible = false;
  } else if (e.type === 'bill') { m.body.rotation.z = Math.sin(e.t * 9) * 0.06; m.body.position.y = 0.42 + Math.sin(e.t * 2) * 0.08; e.v.set(0, 0, 0.0001); }
  else if (e.type === 'piranha') { e.p.y = e.up; e.head = -Math.PI / 2 + Math.sin(e.t) * 0.6; m.jaw.position.y = -0.14 - Math.max(0, Math.sin(e.t * 6)) * 0.08; m.body.rotation.z = Math.sin(e.t * 3) * 0.08; }
  else if (e.type === 'thwomp') { e.p.y = e.home + Math.sin(e.t * 2) * 0.05; m.body.position.x = Math.sin(e.t * 50) * 0.02; }
  else if (e.type === 'boss') { e.head = -Math.PI / 2 + Math.sin(e.t * 0.5) * 0.4; m.body.rotation.z = Math.sin(e.t * 2) * 0.04; m.mouth.scale.setScalar(Math.max(0.001, Math.sin(e.t * 1.1) * 0.8)); }
  m.root.position.copy(e.p); m.root.rotation.y = e.type === 'bill' ? Math.PI / 2 : e.head;
}
function updateLabels() {
  const box = $('labels');
  if (!G.gallery) { if (box.childElementCount) box.innerHTML = ''; return; }
  for (const l of world.labels) {
    if (!l.el) { l.el = document.createElement('div'); l.el.className = 'tag3d'; l.el.textContent = l.t; box.appendChild(l.el); }
    _pv.copy(l.p).project(camera);
    const dist = camera.position.distanceTo(l.p);
    l.el.style.display = _pv.z > 1 || dist > 26 ? 'none' : 'block';
    l.el.style.left = ((_pv.x + 1) / 2 * innerWidth) + 'px'; l.el.style.top = ((1 - _pv.y) / 2 * innerHeight) + 'px';
    l.el.style.opacity = clamp(1.4 - dist / 22, 0.25, 1);
  }
}
function enterGallery() {
  G.gallery = true; G.ready = true;
  $('title').classList.add('hide'); $('hud').classList.add('on'); $('viewerbar').classList.remove('hide-el');
  for (const id of ['score', 'coins', 'time', 'deaths']) $(id).parentElement.parentElement.style.visibility = 'hidden';
  G.state = 'play'; G.level = -1; loadLevel(-1); $('lvlname').textContent = 'VIEW';
}

// =====================================================================
// PARTICLES, POPUPS, FX
// =====================================================================
const popups = [];
function popText(text, pos, cls = '') {
  const el = document.createElement('div'); el.className = 'pop ' + cls; el.textContent = text; document.body.appendChild(el);
  popups.push({ el, p: pos.clone(), t: 0 });
}
const _pv = new V3();
function updatePopups(dt) {
  for (let i = popups.length - 1; i >= 0; i--) {
    const q = popups[i]; q.t += dt; q.p.y += dt * 1.4;
    _pv.copy(q.p).project(camera);
    q.el.style.left = ((_pv.x + 1) / 2 * innerWidth) + 'px';
    q.el.style.top = ((1 - _pv.y) / 2 * innerHeight) + 'px';
    q.el.style.opacity = _pv.z > 1 ? 0 : clamp(1.6 - q.t * 1.6, 0, 1);
    if (q.t > 1) { q.el.remove(); popups.splice(i, 1); }
  }
}

function addPart(m, v, life, o = {}) {
  if (TOUCH) m.castShadow = false;
  world.group.add(recMark(m));
  world.parts.push({ m, v, life, max: life, s0: m.scale.x, rs: o.rs, spin: o.spin || new V3(rand(-8, 8), rand(-8, 8), rand(-8, 8)), g: o.g ?? 18, kind: o.kind || 'shard' });
  if (world.parts.length > (TOUCH ? 220 : 700)) { const old = world.parts.shift(); world.group.remove(old.m); }
}
function shatter(c, ext, mats, n, imp = new V3(), power = 5) {
  for (let i = 0; i < n; i++) {
    const m = new THREE.Mesh(shardGeos[i % shardGeos.length], mats[i % mats.length]); m.castShadow = true;
    m.position.set(c.x + rand(-ext.x, ext.x), c.y + rand(-ext.y, ext.y), c.z + rand(-ext.z, ext.z));
    m.rotation.set(rand(6), rand(6), rand(6)); m.scale.setScalar(rand(0.6, 1.8));
    const v = m.position.clone().sub(c).normalize().multiplyScalar(rand(1.5, power)).add(imp); v.y += rand(2, 6);
    addPart(m, v, rand(1.8, 3.4));
  }
}
function sparks(p, mat, n = 6, spd = 4) {
  for (let i = 0; i < n; i++) {
    const m = new THREE.Mesh(shardGeos[3], mat); m.position.copy(p); m.scale.setScalar(rand(0.4, 0.9));
    addPart(m, new V3(rand(-1, 1), rand(-0.3, 1.2), rand(-1, 1)).normalize().multiplyScalar(rand(1, spd)), rand(0.3, 0.7), { g: 6 });
  }
}
function dust(p, n = 6, spd = 2.2, ring = false) {
  for (let i = 0; i < n; i++) {
    const a = ring ? i / n * Math.PI * 2 : rand(7);
    const m = new THREE.Mesh(icoGeo(0.13, 0), M.dust); m.position.set(p.x + Math.cos(a) * 0.3, p.y + 0.12, p.z + Math.sin(a) * 0.3); m.scale.setScalar(rand(0.6, 1.2));
    addPart(m, new V3(Math.cos(a) * spd * rand(0.6, 1), rand(0.3, 1.2), Math.sin(a) * spd * rand(0.6, 1)), rand(0.4, 0.7), { g: -1, kind: 'dust', spin: new V3(rand(-3, 3), rand(-3, 3), 0) });
  }
}
function updateParts(dt) {
  const P = world.parts;
  for (let i = P.length - 1; i >= 0; i--) {
    const q = P[i]; q.life -= dt;
    if (q.life <= 0) { world.group.remove(q.m); P.splice(i, 1); continue; }
    q.v.y -= q.g * dt;
    if (q.kind === 'dust') q.v.multiplyScalar(Math.exp(-dt * 4));
    q.m.position.addScaledVector(q.v, dt);
    q.m.rotation.x += q.spin.x * dt; q.m.rotation.y += q.spin.y * dt; q.m.rotation.z += q.spin.z * dt;
    if (q.kind === 'shard' && q.v.y < 0) {
      const s = solidAt(q.m.position.x, q.m.position.y, q.m.position.z);
      if (s) { q.m.position.y = s.max.y + 0.02; q.v.y *= -0.3; q.v.x *= 0.55; q.v.z *= 0.55; q.spin.multiplyScalar(0.6); }
    }
    const k = q.life / q.max;
    if (q.kind === 'ring') { q.m.scale.setScalar(0.4 + (1 - k) * (q.rs || 3.6)); q.m.rotation.set(-Math.PI / 2, 0, 0); continue; }
    if (q.kind === 'dust') q.m.scale.setScalar(q.s0 * (1 + (1 - k) * 1.2) * Math.min(1, k * 2));
    else q.m.scale.setScalar(q.s0 * Math.min(1, k * 3));
  }
}

// =====================================================================
// GAME STATE
// =====================================================================
const G = { crysRun: 0, crysSaved: (() => { try { return JSON.parse(localStorage.getItem('superhot-mario-crystals')) || {}; } catch (e) { return {}; } })(), state: 'title', paused: false, locked: false, level: 0, score: 0, coins: 0, deaths: 0, levelTime: 0, totalTime: 0,
  ts: 0.12, crack: 0, punch: 0, hitstop: 0, shake: 0, flash: 0, white: 0, boost: 0, look: 0, deadT: 0, winT: 0, winPhase: 0, chanted: false, snap: null, time: 0 };
const MAXS = 8.5;
const CAM_YAW = -Math.PI / 2, CAM_PITCH = 0.46;
const cam = { yaw: CAM_YAW, pitch: CAM_PITCH, uYaw: 0, uPitch: 0, dist: 9.6, target: new V3(), intro: 0 };

const player = { assist: true, p: new V3(), v: new V3(), he: { x: 0.3, h: 0.95, z: 0.3 }, big: false, fire: 3, ground: null, coyote: 0, jumpBuf: 0, jumpCut: true,
  facing: Math.PI / 2, pound: 0, poundT: 0, invuln: 0, dead: false, combo: 0, sq: 1, sqv: 0, phase: 0, throwT: 0, flip: 0, model: null };
player.model = buildMario(); scene.add(player.model.root);

function setBig(b) {
  player.big = b; player.he.h = b ? 1.42 : 0.95;
  $('power').textContent = b ? ('SUPER') : 'SMALL';
}
function addScore(n, pos, cls = '') { G.score += n; if (pos) popText(String(n), pos, cls); }

function loadLevel(i, retrying = false) {
  G.level = i;
  clearWorld();
  const L = i < 0 ? GALLERY : LEVELS[i];
  L.build(B);
  const fx = world.flag ? world.flag.x : 100;
  decorate(-10, fx);
  recReset();
  outlineBlacks(world.group);
  if (TOUCH) {   // mobile: the world only receives shadows
    world.group.traverse(o => { if (o.isMesh) o.castShadow = false; });   // only Mario casts a real shadow on phones
  }
  if (retrying && G.snap) { G.score = G.snap.score; G.coins = G.snap.coins; }
  else G.snap = { score: G.score, coins: G.coins };
  const P = player;
  P.chain = 0; P.landT = 1; P.long = false; P.flipT = 0; P.wallT = 0;
  P.p.copy(world.start); P.v.set(0, 0, 0); P.dead = false; P.pound = 0; P.invuln = 0; P.combo = 0; P.ground = null; P.fire = 3;
  P.facing = Math.PI / 2; P.model.root.visible = true; P.model.pivot.rotation.set(0, 0, 0);
  setBig(false);
  if (!retrying) { G.cp = null; G.crysRun = 0; }
  // a fresh start of 1-1 always runs the whole tutorial again (only the wall-jump tip for later levels is remembered)
  if (i === 0 && !retrying && G.state !== 'title') { for (const k of [...learned]) if (k !== 'wall') learned.delete(k); try { localStorage.setItem(LEARN_KEY, JSON.stringify([...learned])); } catch (e) { } }
  for (const c of world.crystals) if (G.crysRun & (1 << c.idx)) { c.taken = true; world.group.remove(c.g); }
  updateCrystalHUD();
  if (retrying && G.cp && G.cp.lv === i) {
    P.p.set(G.cp.x, G.cp.y, G.cp.z);
    for (let k = 0; k <= G.cp.i; k++) { const c = world.checkpoints[k]; if (c) { c.hit = true; c.fl.material = M.red; } }
    world.enemies = world.enemies.filter(e => { const keep = e.p.x > G.cp.x + 4 || e.type === 'boss'; if (!keep) world.group.remove(e.m.root); return keep; });
    P.invuln = G.gallery ? 0 : 1.5;
    for (const e of world.enemies) if (e.type === 'shooter') e.cd = Math.max(e.cd, 1.6);
    if (i === 0) { const before = [['move', 'jump', 'qhit', 'stomp'], ['freeze', 'dodge', 'stompKoopa', 'kick'], ['double']]; for (let k = 0; k <= G.cp.i && k < before.length; k++) for (let j = 0; j <= k; j++) before[j].forEach(id => learned.has(id) || learned.add('skip:' + id)); }
  }
  hideLesson(); G.dodgeB = null; G.freezeT = 0;
  if (!retrying) { cam.uYaw = 0; cam.uPitch = 0; }
  cam.yaw = CAM_YAW + cam.uYaw; cam.pitch = CAM_PITCH + cam.uPitch; cam.lead = 0; camVel.x = camVel.y = camVel.z = camVel.lead = 0; cam.groundY = P.p.y + 0.85; cam.target.set(P.p.x, P.p.y + 0.85, P.p.z); cam.intro = 1;
  if (G.state !== 'title') statAttempt();
  G.levelTime = 0; G.ts = 0.05; G.winPhase = 0; G.inCastle = false; P.hidden = false; G.chanted = false; G.deadT = 0; G.flash = 0;
  $('lvlname').textContent = L.id;
  $('cardn').textContent = L.id + ' — ' + L.name; $('cards').textContent = L.sub;
  const card = $('card'); card.classList.remove('show'); void card.offsetWidth; if (G.state !== 'title') card.classList.add('show');
  hideBig();
  if (G.state === 'title') titleTableau();
  if (i !== 0 && !retrying) { $('hint').textContent = 'TIME MOVES ONLY WHEN YOU MOVE'; }
}
function startGame(from = loadProgress()) {
  G.score = 0; G.coins = 0; G.deaths = 0; G.totalTime = 0; G.snap = null;
  $('title').classList.add('hide'); $('end').classList.add('hide');
  $('hud').classList.add('on');
  enterLevel(from);
}
function retry() { G.state = 'play'; loadLevel(G.level, true); }
function pause() { G.paused = true; $('pause').classList.remove('hide'); $('card').classList.remove('show'); }
function resume() { G.paused = false; $('pause').classList.add('hide'); lock(); }
function nextLevel() {
  const id = LEVELS[G.level].id, worldDone = G.level === LEVELS.length - 1 || LEVELS[G.level + 1].id[0] !== id[0];
  G.level++;
  const go = () => { if (G.level >= LEVELS.length) { saveProgress(0); showStory(STORY.end, showEnd); } else enterLevel(G.level); };
  if (worldDone && location.search.includes('playtest')) askRating(id[0], go); else go();
}
// ---------- lessons: the game teaches each move the moment you need it, and only stops when you've done it
const LEARN_KEY = 'superhot-mario-learned';
const learned = (() => { try { return new Set(JSON.parse(localStorage.getItem(LEARN_KEY)) || []); } catch (e) { return new Set(); } })();
const TAUGHT_ONLY = new Set(['freeze', 'dodge', 'stompKoopa', 'kick', 'double', 'long', 'pound', 'wall']);
function learn(id) {
  if (learned.has(id)) return;
  // moves done by accident before their lesson don't count — the game still teaches them at their spot
  if (TAUGHT_ONLY.has(id) && !(lessonNow && lessonNow.id === id)) return;
  learned.add(id); try { localStorage.setItem(LEARN_KEY, JSON.stringify([...learned])); } catch (e) { }
  if (lessonNow && lessonNow.id === id) lessonDone();
}
const near = x => G.level === 0 && player.p.x > x;
const koopaGone = () => !world.enemies.some(e => e.alive && e.type === 'shooter' && e.p.x < 52);
const LESSONS = [
  { id: 'move', keys: ['W', 'A', 'S', 'D'], verb: 'MOVE', when: () => G.level === 0 },
  { id: 'jump', keys: ['SPACE'], verb: 'JUMP', sub: 'HOLD IT TO JUMP HIGHER', when: () => near(1.5) },
  { id: 'qhit', keys: [], verb: 'HIT ? BLOCKS FROM BELOW', when: () => near(8.5), skip: () => near(18) },
  { id: 'stomp', keys: [], verb: 'JUMP ON ITS HEAD', when: () => near(15), skip: () => near(27) },
  { id: 'freeze', keys: [], verb: 'STAND STILL', sub: 'WATCH THE BULLET', when: () => near(36.5), skip: () => near(64) || koopaGone(), slam: 'TIME MOVES ONLY\nWHEN YOU MOVE.', start: () => { const s = world.enemies.find(e => e.type === 'shooter' && e.p.x < 52); if (s) { s.cd = 0; s.losT = 0; s.teach = true; } } },
  { id: 'dodge', keys: ['A', 'D'], verb: 'STEP OUT OF ITS PATH', sub: 'ONLY MOVE WHEN YOU MUST', when: () => near(36.5) && (learned.has('freeze') || learned.has('skip:freeze')), skip: () => near(64) || koopaGone() },
  { id: 'stompKoopa', keys: [], verb: 'STOMP THE KOOPA', sub: 'ITS BULLETS KILL. ITS HEAD DOESN\'T', when: () => near(36.5) && (learned.has('dodge') || learned.has('skip:dodge')), skip: () => near(64) || koopaGone() },
  { id: 'kick', keys: [], verb: 'RUN INTO THE SHELL', sub: 'KICK IT DOWN THE CORRIDOR', when: () => world.shells.some(s => s.st === 'idle'), skip: () => near(66) },
  { id: 'double', keys: ['SPACE', 'THEN', 'SPACE'], verb: 'DOUBLE JUMP', sub: 'PRESS JUMP AGAIN IN THE AIR', when: () => near(67), skip: () => near(82) && player.p.y > 4.5 },
  { id: 'long', keys: ['RUN', '+', 'SHIFT'], verb: 'LONG JUMP', sub: 'TOO FAR FOR A NORMAL JUMP', when: () => near(84) && player.p.y > 4, skip: () => near(99.5) },
  { id: 'pound', keys: ['SPACE', 'THEN', 'SHIFT'], verb: 'GROUND POUND', sub: 'SMASH THE BLACK PLATE', when: () => near(100.5), skip: () => near(116) },
  { id: 'wall', keys: ['SPACE'], verb: 'WALL JUMP', sub: 'WHILE SLIDING DOWN A WALL', when: () => player.wallSlide && G.level > 0 },
];
let lessonNow = null, lessonT = 0;
function showLesson(L) {
  lessonNow = L; lessonT = 0;
  let keysShown = L.keys;
  if (TOUCH) { const map = { W: 'STICK', SPACE: 'JUMP', SHIFT: 'ACTION', RUN: 'STICK' }; keysShown = [...new Set(L.keys.filter(k => !['A', 'S', 'D'].includes(k)).map(k => map[k] || k))]; if (L.keys.length === 2 && L.keys[0] === 'A') keysShown = ['STICK ←→']; }
  $('lkeys').innerHTML = keysShown.map(k => `<div class="kc${k === '+' || k === 'THEN' ? ' t' : ''}">${k}</div>`).join('');
  $('lverb').textContent = L.verb; $('lsub').textContent = L.sub || '';
  const el = $('lesson'); el.classList.remove('done'); el.classList.add('on');
  if (L.slam && !G.slammed) { G.slammed = true; const b = $('big'); b.className = ''; b.innerHTML = '<div class="w">' + L.slam.replace('\n', '<br>') + '</div>'; void b.offsetWidth; b.className = 'show lessonSlam'; SFX.word(); setTimeout(() => { if (b.classList.contains('lessonSlam')) b.className = ''; }, 1800); }
  if (L.start) L.start();
}
function lessonDone() {
  const el = $('lesson'); el.classList.add('done'); $('lverb').textContent = 'NICE.'; $('lsub').textContent = ''; $('lkeys').innerHTML = '';
  tone({ f: 880, dur: 0.07, vol: 0.04 }); tone({ f: 1320, dur: 0.16, vol: 0.04, delay: 0.07 });
  const L = lessonNow; lessonNow = { id: '_done', t: 0.8 };
  setTimeout(() => { if (lessonNow && lessonNow.id === '_done') { el.classList.remove('on'); lessonNow = null; } }, 800);
  void L;
}
function hideLesson() { $('lesson').classList.remove('on'); lessonNow = null; }
function updateLessons(dt) {
  if (G.state !== 'play' || G.gallery) { if (lessonNow) hideLesson(); return; }
  const P = player;
  P.moved = (P.moved || 0) + Math.hypot(P.v.x, P.v.z) * dt;
  if (P.moved > 4) learn('move');
  if (lessonNow && lessonNow.id === 'freeze') { G.freezeT = G.ts < 0.08 && world.bullets.length ? (G.freezeT || 0) + dt : 0; if (G.freezeT > 0.6) learn('freeze'); }
  if (lessonNow && lessonNow.id === 'dodge') {
    if (!G.dodgeB && world.bullets.length) G.dodgeB = world.bullets[0];
    const b = G.dodgeB;
    if (b && !player.dead) {
      // out of its path = the bullet's flight line misses you by a safe margin (or it's already gone)
      const c = new V3(player.p.x, player.p.y + player.he.h * 0.5, player.p.z).sub(b.p), vd = b.v.clone().normalize();
      const miss = c.clone().sub(vd.clone().multiplyScalar(c.dot(vd))).length();
      if (!world.bullets.includes(b) || c.dot(vd) < 0 || miss > 1.0) { G.dodgeB = null; learn('dodge'); }
    }
  }
  if (lessonNow && lessonNow.id !== '_done') {
    lessonT += dt;
    if ((lessonNow.skip && lessonNow.skip()) || !lessonNow.when()) { if (lessonNow.skip && lessonNow.skip()) learned.add('skip:' + lessonNow.id); hideLesson(); }
    return;
  }
  if (lessonNow) return;
  for (const L of LESSONS) {
    if (learned.has(L.id) || learned.has('skip:' + L.id) || !L.when()) continue;
    if (L.skip && L.skip()) { learned.add('skip:' + L.id); continue; }
    showLesson(L); break;
  }
}

// ---------- story terminal (SUPERHOT-style chat between chapters)
const STORY = {
  0: ['> chat.exe --connect', 'luigi_92: hey bro', 'luigi_92: got something for u', 'luigi_92: its a cracked mario game. never released. nobody knows who made it', 'luigi_92: they say its the most innovative plumber game ever', 'luigi_92: just run it', '> run superhot_mario.exe'],
  4: ['luigi_92: so?? how is it', 'luigi_92: did u notice the time thing', 'luigi_92: it only moves when u move', 'luigi_92: thats not a bug. dont tell anyone', 'luigi_92: next world is in the sky. i couldnt get past it', '> continue'],
  8: ['luigi_92: bro u still there', 'luigi_92: i tried to quit. the game doesnt let me quit', 'luigi_92: the red ones. they know where i am', 'SYSTEM: luigi_92 has disconnected.', 'SYSTEM: KEEP PLAYING.', '> continue'],
  11: ['SYSTEM: THE PRINCESS IS NOT IN ANOTHER CASTLE.', 'SYSTEM: THERE IS NO PRINCESS.', 'SYSTEM: THERE IS ONLY THE CRYSTAL KING.', 'SYSTEM: BREAK HIM.', '> run castle.exe'],
  end: ['SYSTEM: THE CRYSTAL KING IS SHATTERED.', 'SYSTEM: THE THRONE IS EMPTY.', 'SYSTEM: YOU ARE THE KING NOW.', 'SYSTEM: SUPERHOT MARIO IS THE MOST INNOVATIVE PLUMBER GAME I\'VE PLAYED IN YEARS.', 'luigi_92: bro?', 'luigi_92: ...mario?'],
};
const term = { lines: [], i: 0, c: 0, done: null, timer: 0, finished: false };
function showStory(lines, done) {
  G.state = 'story'; $('hud').classList.remove('on');
  term.lines = lines; term.i = 0; term.c = 0; term.done = done; term.finished = false; term.timer = 0;
  $('tlines').innerHTML = ''; $('tfoot').classList.remove('on'); $('term').classList.remove('hide-el');
}
function lineClass(l) { return l.startsWith('SYSTEM') ? 'sys' : l.startsWith('>') ? 'cmd' : 'who'; }
function updateStory(dt) {
  if (term.finished) return;
  term.timer -= dt;
  if (term.timer > 0) return;
  const box = $('tlines');
  if (term.c === 0) { const d = document.createElement('div'); d.className = lineClass(term.lines[term.i]) + ' cur'; box.appendChild(d); }
  const line = term.lines[term.i], el = box.lastChild;
  term.c = Math.min(line.length, term.c + 2);
  el.textContent = line.slice(0, term.c);
  tone({ type: 'square', f: rand(1400, 2000), dur: 0.015, vol: 0.012 });
  term.timer = 0.022;
  if (term.c >= line.length) {
    el.classList.remove('cur'); term.i++; term.c = 0; term.timer = 0.45;
    if (term.i >= term.lines.length) { term.finished = true; $('tfoot').classList.add('on'); box.lastChild.classList.add('cur'); }
  }
}
function storyKey() {
  if (!term.finished) {
    const box = $('tlines'); box.innerHTML = '';
    for (const l of term.lines) { const d = document.createElement('div'); d.className = lineClass(l); d.textContent = l; box.appendChild(d); }
    box.lastChild.classList.add('cur'); term.finished = true; $('tfoot').classList.add('on'); return;
  }
  $('term').classList.add('hide-el'); $('hud').classList.add('on');
  const d = term.done; term.done = null; d && d();
}
// ---------- playtest telemetry (local only) — answers "is this fun?" with numbers
const STATS_KEY = 'superhot-mario-stats';
const STATS = (() => { try { return JSON.parse(localStorage.getItem(STATS_KEY)) || null; } catch (e) { return null; } })() || { sessions: 0, levels: {}, ratings: {} };
STATS.sessions++;
const statsSave = () => { try { localStorage.setItem(STATS_KEY, JSON.stringify(STATS)); } catch (e) { } };
const lvStat = id => STATS.levels[id] || (STATS.levels[id] = { attempts: 0, clears: 0, deaths: [], times: [], frozen: 0, played: 0, rWatched: 0, rSkipped: 0, quits: 0 });
function statAttempt() { if (G.gallery) return; lvStat(LEVELS[G.level].id).attempts++; statsSave(); }
function statDeath(cause) { if (G.gallery) return; const s = lvStat(LEVELS[G.level].id); s.deaths.push([+player.p.x.toFixed(1), cause || '?', +G.levelTime.toFixed(1)]); if (s.deaths.length > 300) s.deaths.shift(); statsSave(); }
function statClear() { if (G.gallery) return; const s = lvStat(LEVELS[G.level].id); s.clears++; s.times.push(+G.levelTime.toFixed(1)); statsSave(); }
function statTick(dt) { if (G.state !== 'play' || G.gallery) return; const s = lvStat(LEVELS[G.level].id); s.played += dt; if (G.ts < 0.15) s.frozen += dt; }
setInterval(statsSave, 5000);
addEventListener('beforeunload', () => { if (!G.gallery && (G.state === 'play' || G.state === 'dead')) lvStat(LEVELS[G.level].id).quits++; statsSave(); });
function statsTable() {
  let h = '<table><tr><th>LEVEL</th><th>TRIES</th><th>CLEARS</th><th>DEATHS</th><th>BEST</th><th>FROZEN</th><th>REPLAY</th><th>TOP KILLER</th></tr>';
  for (const L of LEVELS) {
    const s = STATS.levels[L.id]; if (!s) { h += `<tr class="dim"><td>${L.id}</td><td colspan="7">not played</td></tr>`; continue; }
    const c = {}; s.deaths.forEach(d => c[d[1]] = (c[d[1]] || 0) + 1);
    const top = Object.entries(c).sort((a, b) => b[1] - a[1])[0];
    h += `<tr><td>${L.id}</td><td>${s.attempts}</td><td>${s.clears}</td><td>${s.deaths.length}</td><td>${s.times.length ? Math.min(...s.times).toFixed(1) + 's' : '—'}</td>` +
      `<td>${s.played ? Math.round(s.frozen / s.played * 100) + '%' : '—'}</td><td>${s.rWatched}/${s.rWatched + s.rSkipped}</td><td>${top ? top[0] + ' ×' + top[1] : '—'}</td></tr>`;
  }
  const r = Object.entries(STATS.ratings).map(([w, a]) => `WORLD ${w}: ${(a.reduce((x, y) => x + y, 0) / a.length).toFixed(1)}/5 (${a.length})`).join(' · ');
  return h + '</table><div class="rt">FUN RATINGS — ' + (r || 'none yet') + '</div>';
}
function openStats() {
  $('statsbody').innerHTML = statsTable(); $('stats').classList.remove('hide-el'); G.statsOpen = true;
  if (document.pointerLockElement) document.exitPointerLock();
}
function closeStats() { $('stats').classList.add('hide-el'); G.statsOpen = false; }
function exportStats() {
  const txt = JSON.stringify({ game: 'superhot-mario', exported: new Date().toISOString(), ...STATS }, null, 1);
  try { navigator.clipboard.writeText(txt); } catch (e) { }
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([txt], { type: 'application/json' })); a.download = 'superhot-mario-playtest.json'; a.click();
  $('statsmsg').textContent = 'COPIED + DOWNLOADED. SEND IT TO THE DEV.';
}
// end-of-world fun rating (skippable)
function askRating(world, done) {
  hideBig(); G.state = 'rate'; $('rate').classList.remove('hide-el'); $('ratew').textContent = 'WORLD ' + world;
  if (document.pointerLockElement) document.exitPointerLock();
  G.rateDone = v => {
    if (v) { (STATS.ratings[world] = STATS.ratings[world] || []).push(v); statsSave(); }
    $('rate').classList.add('hide-el'); G.rateDone = null; done();
  };
}

const SAVE_KEY = 'superhot-mario-save';
function saveProgress(i) { try { localStorage.setItem(SAVE_KEY, JSON.stringify({ level: i })); } catch (e) { } }
function loadProgress() { try { return JSON.parse(localStorage.getItem(SAVE_KEY) || '{}').level || 0; } catch (e) { return 0; } }
function enterLevel(i) {
  const go = () => { G.state = 'play'; G.level = i; loadLevel(i); saveProgress(i); lock(); };
  if (STORY[i]) showStory(STORY[i], go); else go();
}
function refreshTitle() {
  const sv = loadProgress();
  const verb = TOUCH ? 'TAP' : 'CLICK';
  if (TOUCH) { const c = document.querySelector('#title .credit'); if (c) c.textContent = 'A FAN-MADE PARODY · NOT AFFILIATED WITH NINTENDO OR SUPERHOT TEAM'; }
  $('startmsg').textContent = sv > 0 ? (TOUCH ? 'TAP TO CONTINUE — ' : 'CONTINUE — ') + LEVELS[sv].id : verb + ' TO PLAY';
  $('newmsg').style.display = sv > 0 ? 'inline' : 'none';
}

function startReplay() {
  if (REC.frames.length < 12) { chant(['SUPER.', 'HOT.', 'SUPER.', 'MARIO.'], nextLevel); return; }
  G.state = 'replay'; G.rpT = -0.25; G.rpI = 0;
  $('hud').classList.remove('on'); $('replay').classList.add('on'); document.body.classList.add('replaying');
  chant(['SUPER.', 'HOT.', 'SUPER.', 'MARIO.']);
  applyFrame(REC.frames[0]);
}
function updateReplay(dt) {
  const F = REC.frames, t0 = F[0].t;
  G.rpT += dt;
  while (G.rpI < F.length - 1 && F[G.rpI + 1].t - t0 <= G.rpT) G.rpI++;
  applyFrame(F[G.rpI]);
  const total = F[F.length - 1].t - t0;
  $('rpbar').style.width = (clamp(G.rpT / Math.max(total, 0.01), 0, 1) * 100).toFixed(1) + '%';
  $('rptime').textContent = Math.max(0, G.rpT).toFixed(1) + 's / ' + total.toFixed(1) + 's REAL TIME';
  if (G.rpT > total + 0.6) endReplay();
}
function endReplay() {
  if (G.state !== 'replay') return;
  const st = lvStat(LEVELS[G.level].id); if (G.rpI >= REC.frames.length - 1) st.rWatched++; else st.rSkipped++;
  $('replay').classList.remove('on'); $('hud').classList.add('on'); document.body.classList.remove('replaying');
  recReset(); nextLevel();
}
function showEnd() {
  G.state = 'end'; $('hud').classList.remove('on');
  $('ecr').textContent = crystalTotal() + '/' + (LEVELS.length * 3);
  $('es').textContent = String(G.score).padStart(6, '0'); $('ec').textContent = G.coins; $('ed').textContent = G.deaths; $('et').textContent = G.totalTime.toFixed(1) + 's';
  $('end').classList.remove('hide');
  if (document.pointerLockElement) document.exitPointerLock();
}

let chantToken = 0;
function showBig(word, cls, sub = '') {
  const el = $('big'); el.className = '';
  el.innerHTML = `<div class="w">${word}</div>` + (sub ? `<div class="sub">${sub}</div>` : '');
  void el.offsetWidth; el.className = 'show ' + cls;
}
function hideBig() { chantToken++; $('big').className = ''; }
function chant(words, done) {
  const tok = ++chantToken; let i = 0;
  const step = () => {
    if (tok !== chantToken) return;
    if (i >= words.length) { $('big').className = ''; done && done(); return; }
    showBig(words[i], 'chant'); SFX.word(); say(words[i]); G.shake = Math.max(G.shake, 0.35); G.white = 0.35; i++;
    setTimeout(step, 760);
  };
  step();
}

// =====================================================================
// PLAYER
// =====================================================================
// camera-relative controls: forward is wherever you point the camera
function camForward() { return new V3(-Math.sin(cam.yaw), 0, -Math.cos(cam.yaw)); }

function updatePlayer(dt) {
  const P = player;
  if (P.dead) return;
  if (G.state === 'win') { winUpdate(dt); animatePlayer(dt); return; }
  if (G.state !== 'play') { animatePlayer(dt); return; }

  P.invuln = Math.max(0, P.invuln - dt); P.throwT = Math.max(0, P.throwT - dt);
  P.jumpBuf -= dt; P.coyote -= dt;
  if (pressed.has('jump')) P.jumpBuf = 0.15;
  if (P.ground) P.landT = (P.landT || 0) + dt;
  P.wallT = Math.max(0, (P.wallT || 0) - dt); P.lockT = Math.max(0, (P.lockT || 0) - dt); P.flipT = Math.max(0, (P.flipT || 0) - dt);

  const fwd = camForward(), right = new V3(Math.cos(cam.yaw), 0, -Math.sin(cam.yaw));
  let iz = (held('KeyW', 'ArrowUp') ? 1 : 0) - (held('KeyS', 'ArrowDown') ? 1 : 0);
  let ix = (held('KeyD', 'ArrowRight') ? 1 : 0) - (held('KeyA', 'ArrowLeft') ? 1 : 0);
  if (touchUI.stick.on) { ix = touchUI.stick.x; iz = touchUI.stick.y; }
  const wish = fwd.multiplyScalar(iz).addScaledVector(right, ix);
  const wl = wish.length(); if (wl > 1) wish.divideScalar(wl);

  if (P.pound === 1) {
    P.poundT -= dt; P.v.set(0, 0, 0);
    P.flip = (1 - Math.max(P.poundT, 0) / 0.22) * Math.PI * 2;
    if (P.poundT <= 0) { P.pound = 2; P.v.y = -34; P.flip = 0; }
  } else {
    if (P.pound === 2) { P.v.x = 0; P.v.z = 0; }
    else {
      // skid: pushing against current velocity on the ground brakes hard (Mario turnaround)
      const vlen = Math.hypot(P.v.x, P.v.z);
      const against = wl > 0.01 && vlen > 4 && (wish.x * P.v.x + wish.z * P.v.z) / vlen < -0.45;
      if (against && P.ground && !P.skid) { P.skid = 0.18; tone({ type: 'sawtooth', f: 900, f1: 500, dur: 0.12, vol: 0.025 }); dust(P.p, 3, 1.2); }
      P.skid = Math.max(0, (P.skid || 0) - dt);
      const top = P.long ? 13.5 : MAXS;
      const accel = P.ground ? (against ? 150 : 85) : P.long ? 10 : 48;
      const rate = (wl > 0.01 ? accel : (P.ground ? 70 : P.long ? 0 : 6)) * dt * (P.lockT > 0 ? 0.15 : 1);
      let tx = wish.x * top, tz = wish.z * top;
      if (P.long && wl < 0.01) { tx = P.v.x; tz = P.v.z; }
      let dvx = tx - P.v.x, dvz = tz - P.v.z; const dl = Math.hypot(dvx, dvz);
      if (dl > rate) { dvx *= rate / dl; dvz *= rate / dl; }
      P.v.x += dvx; P.v.z += dvz;
    }
    const hsNow = Math.hypot(P.v.x, P.v.z);
    // LONG JUMP: Shift while running on the ground
    if (pressed.has('pound') && P.ground && hsNow > 5 && P.pound === 0) {
      const dx = P.v.x / hsNow, dz = P.v.z / hsNow;
      P.v.set(dx * 13.5, 12, dz * 13.5); P.long = true; P.ground = null; P.coyote = 0; P.jumpBuf = 0; P.jumpCut = true; P.chain = 0;
      P.facing = Math.atan2(dx, dz); SFX.longjump(); dust(P.p, 6, 2.2); G.boost = 0.15; P.sqv = 5; learn('long');
    }
    if (P.jumpBuf > 0 && P.coyote > 0 && P.pound === 0) {
      P.v.y = 17; P.jumpBuf = 0; P.coyote = 0; P.ground = null; P.jumpCut = false; P.long = false; P.airJumps = 1;
      learn('jump'); SFX.jump(); P.sqv = 6; dust(P.p, 5, 1.6);
    } else if (P.jumpBuf > 0 && !P.ground && P.wallT > 0 && P.v.y < 1.5 && P.pound === 0) {   // wall kick only while sliding / at the top
      // WALL JUMP: kick off the wall you're touching
      P.v.set(P.wallN.x * 8.5, 16, P.wallN.z * 8.5); P.jumpBuf = 0; P.wallT = 0; P.lockT = 0.2; P.jumpCut = false; P.long = false; P.chain = 0; P.airJumps = 1;
      P.facing = Math.atan2(P.wallN.x, P.wallN.z); SFX.wallkick(); G.boost = 0.15; P.sqv = 6; learn('wall');
      dust(new V3(P.p.x - P.wallN.x * 0.3, P.p.y + 0.5, P.p.z - P.wallN.z * 0.3), 6, 2);
    }
    // DOUBLE JUMP: one extra jump in the air, any time — recharged by landing, wall kicks and stomps
    const nearFloor = P.v.y < 0 && (solidAt(P.p.x, P.p.y - 0.8, P.p.z) || solidAt(P.p.x, P.p.y - 0.4, P.p.z));
    if (P.jumpBuf > 0 && !P.ground && P.coyote <= 0 && !nearFloor && (P.airJumps || 0) > 0 && P.pound === 0 && !P.long && !(P.wallT > 0 && P.v.y < 1.5)) {
      P.v.y = 15.5; P.airJumps--; P.jumpBuf = 0; P.jumpCut = false; P.flipT = 0.45;
      SFX.wahoo(); G.boost = 0.2; P.sqv = 7; learn('double');
      ringFx(new V3(P.p.x, P.p.y - 0.05, P.p.z), 1.4, 0.3); dust(P.p, 6, 1.8, true);
    }
    if (!held('Space') && P.v.y > 0 && !P.jumpCut) { P.v.y *= 0.5; P.jumpCut = true; }
    if (P.pound !== 2) {
      let g = P.long ? 38 : P.v.y > 0 ? 44 : 62;
      if (held('Space') && Math.abs(P.v.y) < 3 && !P.long) g *= 0.5;   // apex hang: a beat to read the bullets
      P.v.y -= g * dt; P.v.y = Math.max(P.v.y, P.wallSlide ? -5 : -32);
    }
    if (pressed.has('pound') && !P.ground && P.pound === 0 && !P.long) { P.pound = 1; P.poundT = 0.22; P.chain = 0; SFX.spin(); }
  }

  // carried by moving platform
  if (P.ground && P.ground.delta) P.p.add(P.ground.delta);

  const wasGround = !!P.ground, prevVy = P.v.y;
  const speed = Math.hypot(P.v.x, P.v.y, P.v.z);
  const steps = Math.max(1, Math.ceil(speed * dt / 0.35));
  P.ground = null; let ceil = null, wn = null;
  for (let i = 0; i < steps; i++) {
    const r = moveBody(P, dt / steps);
    if (r.ground) P.ground = r.ground;
    if (r.ceil && !ceil) ceil = r.ceil;
    if (r.wall) wn = { x: r.wnx || 0, z: r.wnz || 0 };
  }
  P.wallSlide = false;
  if (!P.ground && wn && P.pound === 0) {
    const into = -(wish.x * wn.x + wish.z * wn.z);
    P.wallT = 0.16; P.wallN = new V3(wn.x, 0, wn.z).normalize();
    if (into > 0.3 && P.v.y < 0) { P.wallSlide = true; if (Math.random() < 0.3) dust(new V3(P.p.x - wn.x * 0.3, P.p.y + 0.6, P.p.z - wn.z * 0.3), 1, 0.5); }
  }
  if (P.ground) {
    P.coyote = 0.12;
    if (!wasGround) {
      if (P.pound === 2) poundImpact();
      else if (prevVy < -8) { SFX.land(); dust(P.p, 4, 1.4); }
      P.sqv = -Math.min(Math.abs(prevVy) * 0.35, 9);
      if (P.long) { dust(P.p, 6, 2); P.chain = 0; }
      P.airJumps = 1;
      P.pound = 0; P.combo = 0; P.long = false; P.landT = 0; P.flipT = 0;
    }
  }
  // generous block hits: rising with your head just under a ? block / brick (even off its edge) bumps it
  if (!ceil && prevVy > 0) {
    const head = P.p.y + P.he.h; let best = 1e9;
    for (const so of world.solids) {
      if (so.type !== 'q' && so.type !== 'brick') continue;
      if (head > so.min.y - 0.1 && head <= so.min.y + 0.05 && P.p.x > so.min.x - P.he.x - 0.3 && P.p.x < so.max.x + P.he.x + 0.3 && P.p.z > so.min.z - P.he.z - 0.3 && P.p.z < so.max.z + P.he.z + 0.3) {
        const dd = Math.hypot(P.p.x - (so.min.x + so.max.x) / 2, P.p.z - (so.min.z + so.max.z) / 2);
        if (dd < best) { best = dd; ceil = so; }
      }
    }
    if (ceil) {
      // a real hit (well under the block) stops the jump; a graze off its edge bumps it and you keep rising
      const ox = Math.min(P.p.x + P.he.x, ceil.max.x) - Math.max(P.p.x - P.he.x, ceil.min.x), oz = Math.min(P.p.z + P.he.z, ceil.max.z) - Math.max(P.p.z - P.he.z, ceil.min.z);
      if (ox > 0.25 && oz > 0.25) P.v.y = Math.min(P.v.y, 0);
      if (P.lastBump === ceil && G.time - P.lastBumpT < 0.4) ceil = null; else { P.lastBump = ceil; P.lastBumpT = G.time; }
    }
  }
  if (!ceil && P.edgeHit) ceil = P.edgeHit;
  P.edgeHit = null;
  if (ceil) bumpBlock(ceil);
  if (P.p.y < -14) { G.cause = 'fall'; killPlayer(true); return; }

  // fireball

  // coins
  const cy = P.p.y + P.he.h / 2;
  for (let i = world.coins.length - 1; i >= 0; i--) {
    const c = world.coins[i];
    if (Math.abs(c.p.x - P.p.x) < 0.7 && Math.abs(c.p.z - P.p.z) < 0.7 && Math.abs(c.p.y - cy) < P.he.h / 2 + 0.4) {
      world.group.remove(c.mesh); world.coins.splice(i, 1); G.coins++; addScore(200, c.p, 'gold'); SFX.coin(); sparks(c.p, M.gold, 7, 3);
    }
  }
  // items
  for (let i = world.items.length - 1; i >= 0; i--) {
    const it = world.items[i];
    if (it.type !== 'popcoin' && it.state !== 'emerge' && bodiesOverlap(P, it, 1)) {
      world.group.remove(it.mesh); world.items.splice(i, 1);
      if (it.type === 'flower') { P.fire = Math.min(P.fire + 3, 6); setBig(true); popText('+3 SHOTS', it.p.clone().add(new V3(0, 1, 0))); }
      else { if (P.big) addScore(1000, it.p); setBig(true); popText('SUPER', it.p.clone().add(new V3(0, 1.4, 0)), 'red'); }
      addScore(1000, null); SFX.power(); P.sqv = 8; G.boost = 0.25;
      sparks(it.p.clone().add(new V3(0, 0.5, 0)), M.gold, 12, 5);
    }
  }
  // crystals (3 hidden per level)
  for (const c of world.crystals) {
    c.g.rotation.y += dt * 2; c.g.position.y = c.p.y + Math.sin(G.time * 2 + c.idx) * 0.12;
    if (!G.gallery && !c.taken && Math.abs(c.p.x - P.p.x) < 0.75 && Math.abs(c.p.z - P.p.z) < 0.75 && Math.abs(c.p.y - (P.p.y + P.he.h / 2)) < P.he.h / 2 + 0.55) {
      c.taken = true; world.group.remove(c.g); G.crysRun |= 1 << c.idx;
      addScore(c.got ? 500 : 2000, c.p.clone().add(new V3(0, 1, 0)), 'red'); popText('CRYSTAL ' + (popcount(G.crysRun)) + '/3', c.p.clone().add(new V3(0, 1.8, 0)), 'red');
      SFX.power(); G.boost = 0.3; G.punch = 0.6; sparks(c.p, M.crystal, 14, 5); updateCrystalHUD();
    }
  }
  // checkpoints
  for (let i = 0; i < world.checkpoints.length; i++) {
    const c = world.checkpoints[i];
    if (!c.hit && P.p.x > c.x && P.p.y > c.y - 1.5) {
      c.hit = true; if (faded.has(c.fl)) c.fl.userData.origMat = M.red; else c.fl.material = M.red; G.cp = { lv: G.level, x: c.x + 0.5, y: c.y, z: 0, i };
      popText('CHECKPOINT', P.p.clone().add(new V3(0, P.he.h + 1.1, 0)), 'red'); tone({ f: 660, dur: 0.08, vol: 0.05 }); tone({ f: 990, dur: 0.2, vol: 0.05, delay: 0.08 });
    }
  }
  // tutorial hints
  for (const h of world.hints) if (!h.shown && P.p.x > h.x) {
    h.shown = true; const el = $('hint'); el.textContent = h.t; el.classList.add('on');
    clearTimeout(G.hintT); G.hintT = setTimeout(() => el.classList.remove('on'), 4200);
  }
  // flag
  if (!G.gallery && world.flag && P.p.x > world.flag.x - 0.9 && Math.abs(P.p.z) < 4.5) grabFlag();

  // facing
  const hs = Math.hypot(P.v.x, P.v.z);
  P.dustT = (P.dustT || 0) - dt;
  if (P.ground && hs > 6 && P.dustT <= 0) { P.dustT = 0.11; dust(P.p, 1, 0.8); }
  if (P.pound === 2) { const m = new THREE.Mesh(icoGeo(0.22, 0), M.dust); m.position.set(P.p.x + rand(-0.2, 0.2), P.p.y + P.he.h * 0.6, P.p.z + rand(-0.2, 0.2)); addPart(m, new V3(0, 2, 0), 0.25, { g: 0, kind: 'dust', spin: new V3() }); }
  if (wl > 0.1 && !P.skid) P.facing = lerpAngle(P.facing, Math.atan2(wish.x, wish.z), 1 - Math.exp(-dt * 20));
  else if (hs > 0.4 && !P.skid) P.facing = lerpAngle(P.facing, Math.atan2(P.v.x, P.v.z), 1 - Math.exp(-dt * 14));
  animatePlayer(dt);
}

function throwFire() {
  const P = player;
  if (P.fire <= 0) { SFX.empty(); popText('NO AMMO', P.p.clone().add(new V3(0, P.he.h + 0.6, 0))); return; }
  P.fire--; setBig(P.big); P.throwT = 0.22; G.boost = 0.28;
  const fwd = camForward();
  const from = P.p.clone().add(new V3(0, P.he.h * 0.62, 0)).addScaledVector(fwd, 0.45);
  // soft auto-aim: closest enemy inside a cone
  let target = null, best = 0.5;
  for (const e of world.enemies) {
    if (!e.alive || e.type === 'thwomp' || (e.type === 'piranha' && e.p.y < e.dn + 0.4)) continue;
    const to = new V3(e.p.x - from.x, e.p.y + e.he.h * 0.5 - from.y, e.p.z - from.z); const d = to.length();
    if (d > 28 || d < 0.5) continue;
    const ang = Math.acos(clamp((to.x * fwd.x + to.z * fwd.z) / Math.hypot(to.x, to.z), -1, 1));
    if (ang < best) { best = ang; target = e; }
  }
  const dir = target ? new V3(target.p.x, target.p.y + target.he.h * 0.5, target.p.z).sub(from).normalize() : fwd.clone();
  P.facing = Math.atan2(dir.x, dir.z);
  const g = new THREE.Group(); g.position.copy(from); world.group.add(g);
  mesh(capGeo(0.06, 0.14), M.bullet, 0, 0, 0, g, false).rotation.x = Math.PI / 2;
  const tr = mesh(trailGeo, M.ftrail, 0, 0, 0, g, false); tr.scale.z = 0.01; recMark(g, tr);
  world.fireballs.push({ p: from, v: dir.multiplyScalar(16), g, tr, life: 6, travel: 0 });
  sparks(from.clone().addScaledVector(dir, 0.02), M.flash, 4, 2);
  SFX.shot(0.85);
}

function poundImpact() {
  const P = player;
  SFX.pound(); G.shake = Math.max(G.shake, 0.7); G.boost = 0.35; G.hitstop = 0.05;
  if (P.ground && P.ground.type === 'plate') { smashPlate(P.ground); learn('pound'); } else if (G.level !== 0) learn('pound');
  dust(P.p, 14, 5, true);
  ringFx(P.p, 3.6);
  for (const e of world.enemies) {
    if (!e.alive || tough(e)) continue;
    const d = Math.hypot(e.p.x - P.p.x, e.p.z - P.p.z);
    if (d < 3.4 && Math.abs(e.p.y - P.p.y) < 1.6) { killEnemy(e, new V3(e.p.x - P.p.x, 3, e.p.z - P.p.z).normalize().multiplyScalar(6)); addScore(400, e.p.clone().add(new V3(0, 1.2, 0))); }
  }
  const s = P.ground;
  if (s && s.type === 'brick') breakBrick(s);
  else if (s && s.type === 'q' && !s.used) hitQ(s);
}

function smashPlate(s) {
  if (s.used) return; s.used = true;
  s.mesh.material = M.used; if (s.deco) s.deco.visible = false;
  const c = new V3((s.min.x + s.max.x) / 2, s.max.y, (s.min.z + s.max.z) / 2);
  for (let i = 0; i < 8; i++) {
    const g = new THREE.Group(); const cm = mesh(cylGeo(0.3, 0.3, 0.07, 20), M.gold, 0, 0, 0, g); cm.rotation.x = Math.PI / 2;
    g.position.copy(c).add(new V3(rand(-0.5, 0.5), 0.3, rand(-0.5, 0.5))); world.group.add(recMark(g));
    world.items.push({ type: 'popcoin', mesh: g, p: g.position, v: new V3(rand(-2, 2), rand(9, 13), rand(-2, 2)), t: rand(-0.15, 0), state: 'pop', he: { x: 0, h: 0, z: 0 } });
    G.coins++;
  }
  spawnShell(c.x, c.y + 0.1, c.z, 9);
  addScore(1000, c.clone().add(new V3(0, 1.5, 0)), 'red'); SFX.coin(); SFX.power();
}
function ringFx(p, rs, life = 0.45) {
  const ring = new THREE.Mesh(cached('ring', () => new THREE.RingGeometry(0.85, 1, 48)), M.ring);
  ring.rotation.x = -Math.PI / 2; ring.position.set(p.x, p.y + 0.04, p.z); ring.scale.setScalar(0.4);
  addPart(ring, new V3(), life, { g: 0, kind: 'ring', spin: new V3(), rs });
}
const tough = e => e.type === 'thwomp' || e.type === 'boss' || (e.type === 'piranha' && e.p.y < e.dn + 0.4);
function bumpBlock(s) {
  if (s.type === 'q' && !s.used) hitQ(s);
  else if (s.type === 'brick') { if (player.big) breakBrick(s); else { SFX.bump(); world.bumps.push({ m: s.mesh, t: 0, y0: s.mesh.position.y }); } }
  else SFX.bump();
  // anything standing on the block gets knocked out
  for (const e of world.enemies) if (e.alive && !tough(e) && Math.abs(e.p.y - s.max.y) < 0.15 && e.p.x > s.min.x - 0.3 && e.p.x < s.max.x + 0.3 && e.p.z > s.min.z - 0.3 && e.p.z < s.max.z + 0.3) {
    killEnemy(e, new V3(0, 6, 0)); addScore(200, e.p.clone().add(new V3(0, 1, 0)));
  }
}
function hitQ(s) {
  learn('qhit');
  s.used = true; if (faded.has(s.mesh)) s.mesh.userData.origMat = M.used; else s.mesh.material = M.used; SFX.bump(); REC.qs.push({ m: s.mesh, t: REC.wt });
  world.bumps.push({ m: s.mesh, t: 0, y0: s.mesh.position.y });
  const top = new V3((s.min.x + s.max.x) / 2, s.max.y, (s.min.z + s.max.z) / 2);
  if (s.content === 'coin') {
    const g = new THREE.Group(); const c = mesh(cylGeo(0.3, 0.3, 0.07, 20), M.gold, 0, 0, 0, g); c.rotation.x = Math.PI / 2;
    g.position.copy(top).y += 0.4; world.group.add(recMark(g));
    world.items.push({ type: 'popcoin', mesh: g, p: g.position, v: new V3(0, 11, 0), t: 0, state: 'pop', he: { x: 0, h: 0, z: 0 } });
    G.coins++; SFX.coin();
  } else {
    if (s.content === 'flower' || (s.content === 'mushroom' && player.big)) { spawnShell(top.x, top.y + 0.05, top.z, 7); SFX.sprout(); return; }
    const type = s.content;
    const m = type === 'flower' ? buildFlower() : buildMushroom();
    m.position.copy(top).y -= 0.65; world.group.add(recMark(m));
    const dx = player.p.x < top.x ? 1 : -1;
    world.items.push({ type, mesh: m, p: m.position, v: new V3(), he: { x: 0.34, h: 0.6, z: 0.34 }, t: 0, state: 'emerge', y1: top.y, dir: dx, ground: null });
    SFX.sprout();
  }
}
function breakBrick(s) {
  removeSolid(s); SFX.brick(); G.shake = Math.max(G.shake, 0.3);
  const c = s.mesh.position.clone();
  shatter(c, new V3(0.45, 0.45, 0.45), [M.brick, M.white, M.hard], 22, new V3(0, 3, 0), 6);
  addScore(50, null);
}

function hurtPlayer() {
  const P = player;
  if (P.invuln > 0 || P.dead || G.state !== 'play' || G.gallery || G.noHurt) return;   // nothing hurts in the viewer
  if (P.big) {
    setBig(false); P.invuln = 2; SFX.shrink(); G.shake = 0.5; G.flash = 0.6; G.hitstop = 0.12;
    shatter(P.p.clone().add(new V3(0, 0.8, 0)), new V3(0.3, 0.4, 0.3), [M.shirt, M.cap, M.overall], 12, new V3(), 4);
  } else killPlayer(false);
}
function killPlayer(fell) {
  const P = player;
  if (P.dead) return;
  P.dead = true; G.state = 'dead'; G.deaths++; G.deadT = 0; statDeath(fell ? 'fall' : G.cause);
  // clear every other text layer so the death screen never stacks on top of them
  $('card').classList.remove('show'); $('hint').classList.remove('on'); hideLesson();
  for (const q of popups) q.el.remove(); popups.length = 0;
  if (!fell) { const sp = P.p.clone(); sp.y += P.he.h * 0.6; sp.project(camera); fxPass.uniforms.uCrackC.value.set((sp.x + 1) / 2, (sp.y + 1) / 2); G.crack = 0.001; }
  SFX.death(); G.flash = 1; G.shake = 0.8;
  if (!fell) {
    P.model.root.visible = false;
    shatter(P.p.clone().add(new V3(0, P.he.h / 2, 0)), new V3(0.3, P.he.h / 2, 0.3), [M.shirt, M.skin, M.overall, M.cap, M.glove], 46, new V3(), 6);
  }
  const lines = ['MAMMA MIA.', 'TOO SLOW.', 'GAME OVER?', 'MAMMA MIA.', 'NOT SUPER.'];
  setTimeout(() => { if (G.state === 'dead') showBig(lines[(Math.random() * lines.length) | 0], 'dead', 'CLICK · SPACE · R — TRY AGAIN'); }, 250);
}

const popcount = n => { let c = 0; while (n) { c += n & 1; n >>= 1; } return c; };
function updateCrystalHUD() {
  if (G.gallery) { $('crys').innerHTML = ''; return; }
  const id = LEVELS[G.level].id, saved = G.crysSaved[id] || 0;
  let h = '';
  for (let i = 0; i < 3; i++) h += `<span class="cr${(G.crysRun | saved) & (1 << i) ? ' on' : ''}${G.crysRun & (1 << i) ? ' new' : ''}"></span>`;
  $('crys').innerHTML = h;
}
function saveCrystals() {
  const id = LEVELS[G.level].id;
  G.crysSaved[id] = (G.crysSaved[id] || 0) | G.crysRun;
  try { localStorage.setItem('superhot-mario-crystals', JSON.stringify(G.crysSaved)); } catch (e) { }
}
function crystalTotal() { return Object.values(G.crysSaved).reduce((a, b) => a + popcount(b), 0); }
function grabFlag() {
  saveCrystals();
  const P = player, f = world.flag;
  statClear();
  G.state = 'win'; G.winT = 0; G.winPhase = 0;
  const h = clamp((P.p.y - (f.top + 1)) / 9, 0, 1);
  const bonus = h > 0.85 ? 5000 : h > 0.6 ? 2000 : h > 0.35 ? 800 : h > 0.12 ? 400 : 100;
  addScore(bonus, P.p.clone().add(new V3(0, 2, 0)), 'red');
  P.v.set(0, 0, 0); P.pound = 0; P.p.y = Math.max(P.p.y, f.top + 1);
  P.long = false; P.flipT = 0; P.wallSlide = false; P.skid = 0; P.throwT = 0; P.lockT = 0; P.wallT = 0;   // no leftover move poses on the pole
  SFX.flag(); G.shake = 0.4;
  world.enemies.forEach((e, i) => { if (e.alive) e.dieAt = 0.35 + i * 0.07 + rand(0.15); });
  for (const b of world.bullets) { sparks(b.p, M.bullet, 5); world.group.remove(b.g); }
  world.bullets.length = 0;
}
function winUpdate(dt) {
  const P = player, f = world.flag;
  G.winT += dt;
  if (G.winPhase === 0) {
    P.p.x = damp(P.p.x, f.x - 0.42, 20, dt); P.p.z = damp(P.p.z, 0, 12, dt);
    P.p.y = Math.max(f.top + 1, P.p.y - 6.5 * dt);
    f.fl.position.y = Math.max(1.6, f.fl.position.y - 6.5 * dt);
    P.facing = lerpAngle(P.facing, Math.PI / 2, 1 - Math.exp(-dt * 12));
    if (P.p.y <= f.top + 1.001 && G.winT > 0.9) { G.winPhase = 1; G.winT = 0; P.v.set(4.5, 8, 0); SFX.jump(); }
  } else {
    P.v.y -= 44 * dt;
    const atDoor = P.p.x >= f.cx - 0.08;
    if (G.inCastle) { P.v.set(0, 0, 0); }
    else if (!atDoor) { P.v.x = 4.2; P.v.z = (0.8 - P.p.z) * 3; }
    else { P.v.x = (f.cx - P.p.x) * 8; P.v.z = -3; }
    const r = moveBody(P, dt); P.ground = r.ground;
    P.facing = lerpAngle(P.facing, atDoor ? Math.PI : Math.atan2(P.v.x, P.v.z), 1 - Math.exp(-dt * 12));
    if (P.p.z < f.door - 0.15 && !G.inCastle) { G.inCastle = true; G.winT = 0; tone({ f: 200, f1: 120, dur: 0.2, vol: 0.08 }); }
    if (G.inCastle) {
      P.v.z = 0; P.v.x = 0; P.model.root.visible = false; P.hidden = true;
      f.sf.scale.y = Math.min(1, G.winT * 1.5); f.sf.position.y = 7.1 + Math.min(1, G.winT * 1.5) * 0.5;
      if (G.winT > 1.3 && !G.chanted) { G.chanted = true; startReplay(); }
    } else if (G.winT > 6 && !G.chanted) { G.chanted = true; startReplay(); }
  }
}

function animatePlayer(dt) {
  const P = player, md = P.model;
  P.sqv += (1 - P.sq) * 320 * dt; P.sqv *= Math.exp(-dt * 16); P.sq = clamp(P.sq + P.sqv * dt, 0.6, 1.4);
  const base = P.big ? 1.0 : 0.68;
  md.root.scale.set(base / Math.sqrt(P.sq), base * P.sq, base / Math.sqrt(P.sq));
  // glide the model over instant physics corrections so nothing visibly pops
  P.vo = P.vo || new V3();
  if (P.snapY || P.snapX || P.snapZ) { P.vo.x -= P.snapX || 0; P.vo.y -= P.snapY || 0; P.vo.z -= P.snapZ || 0; P.snapX = P.snapY = P.snapZ = 0; }
  P.vo.multiplyScalar(Math.exp(-dt * 22));
  md.root.position.copy(P.p).add(P.vo);
  md.root.rotation.y = P.facing;
  md.root.visible = !P.dead && !P.hidden && (P.invuln <= 0 || Math.floor(G.time * 18) % 2 === 0);

  const hs = Math.hypot(P.v.x, P.v.z), k = Math.min(hs / 6, 1);
  const onGround = !!P.ground || G.state === 'title';
  let lL = 0, lR = 0, aL = 0, aR = 0, aLz = 0, aRz = 0, bob = 0, lean = 0;
  if (G.state === 'win' && G.winPhase === 0) { aL = -2.9; aR = -2.6; lL = -0.5; lR = -0.2; }
  else if (P.long) { aL = aR = -2.6; lL = lR = 0.5; lean = 1.05; }
  else if (P.wallSlide) { aL = -2.7; aR = -0.4; lL = -0.6; lR = 0.2; }
  else if (P.flipT > 0) { aL = aR = -1.2; lL = lR = -1.3; }
  else if (P.pound === 1) { lL = lR = -1.4; aL = aR = -0.8; }
  else if (P.pound === 2) { lL = lR = -1.1; aL = aR = -2.8; aLz = 0.4; aRz = -0.4; }
  else if (P.skid > 0 && onGround) { aL = aR = -1.2; lL = -0.5; lR = 0.3; lean = -0.35; }
  else if (onGround) {
    P.phase += hs * dt * 2.1;
    const s = Math.sin(P.phase) * 0.95 * k;
    lL = s; lR = -s; aL = -s * 0.85; aR = s * 0.85; bob = Math.abs(Math.cos(P.phase)) * 0.06 * k; lean = k * 0.12;
    if (hs < 0.3) { bob = Math.sin(G.time * 2.4) * 0.012; aL = -0.22; aR = 0.18; aLz = 0.2; aRz = -0.06; lL = -0.12; lR = 0.08; }
  } else if (P.v.y > 0) { aR = -2.9; aL = 0.5; lL = -0.9; lR = 0.35; aLz = 0.2; }
  else { aLz = 1.1; aRz = -1.1; lL = -0.3; lR = 0.25; }
  if (P.throwT > 0) aR = -1.6;
  md.legL.rotation.x = damp(md.legL.rotation.x, lL, 22, dt); md.legR.rotation.x = damp(md.legR.rotation.x, lR, 22, dt);
  md.armL.rotation.x = damp(md.armL.rotation.x, aL, 22, dt); md.armR.rotation.x = damp(md.armR.rotation.x, aR, 22, dt);
  md.armL.rotation.z = damp(md.armL.rotation.z, aLz, 22, dt); md.armR.rotation.z = damp(md.armR.rotation.z, aRz, 22, dt);
  md.body.position.y = -0.7 + bob;
  // life: blink, torso twist with the stride, head counter-turn + tilt
  P.blinkT = (P.blinkT ?? 2) - dt; if (P.blinkT < -0.12) P.blinkT = rand(2, 4.5);
  for (const e of md.eyes) e.scale.y = P.blinkT < 0 ? 0.012 : 0.068;
  const idle = onGround && hs < 0.3 ? 1 : 0;
  const twist = onGround && !P.skid ? Math.sin(P.phase) * 0.24 * k + idle * 0.16 : 0;
  md.body.rotation.y = damp(md.body.rotation.y, twist, 16, dt);
  md.head.rotation.y = damp(md.head.rotation.y, -twist * 0.75 - idle * 0.12, 16, dt);
  md.head.rotation.z = damp(md.head.rotation.z, idle * 0.09 + Math.sin(P.phase) * 0.05 * k, 10, dt);
  md.pivot.rotation.z = damp(md.pivot.rotation.z, idle * -0.04, 8, dt);   // weight on one leg
  md.head.rotation.x = damp(md.head.rotation.x, -0.12 + (!onGround && P.v.y > 0 ? -0.18 : !onGround ? 0.12 : 0) + (onGround ? Math.sin(P.phase * 2) * 0.04 * k : 0), 12, dt);
  md.pivot.rotation.x = P.pound === 1 ? P.flip : P.flipT > 0 ? (1 - P.flipT / 0.45) * Math.PI * 2 : damp(md.pivot.rotation.x, lean, 12, dt);
}

// =====================================================================
// ENEMIES, PROJECTILES, ITEMS
// =====================================================================
function killEnemy(e, imp) {
  if (!e.alive) return;
  e.alive = false; world.group.remove(e.m.root); if (e.m.laser) world.group.remove(e.m.laser);
  const c = e.p.clone(); c.y += e.he.h / 2;
  shatter(c, new V3(e.he.x, e.he.h / 2, e.he.z), [M.red, M.red2, M.red, M.red3], e.type === 'goomba' ? 26 : 32, imp || new V3(), 5);
  SFX.shatter(); G.shake = Math.max(G.shake, 0.22); G.punch = Math.max(G.punch, 0.7);
}
function stomp(e) {
  const P = player;
  if (e.type === 'shooter') { spawnShell(e.p.x, e.p.y + 0.05, e.p.z, 3); learn('stompKoopa'); }
  learn('stomp');
  P.combo++; P.pound = 0;
  const pts = [100, 200, 400, 800, 1000, 2000, 4000, 8000][Math.min(P.combo - 1, 7)];
  killEnemy(e, new V3(0, -2, 0)); addScore(pts, e.p.clone().add(new V3(0, 1.3, 0)), P.combo > 2 ? 'red' : '');
  P.v.y = 17; P.jumpCut = false; P.ground = null; P.p.y = Math.max(P.p.y, e.p.y + e.he.h * 0.6); P.airJumps = 1;
  G.hitstop = 0.07; G.boost = 0.2; P.sqv = -5; SFX.stomp(P.combo);
}
function fireBullet(from, to, speed = 11, quiet = false) {
  const dir = to.clone().sub(from).normalize();
  dir.x += rand(-0.02, 0.02); dir.y += rand(-0.02, 0.02); dir.z += rand(-0.02, 0.02); dir.normalize();
  const g = new THREE.Group(); g.position.copy(from); world.group.add(g);
  const head = mesh(capGeo(0.06, 0.14), M.bullet, 0, 0, 0, g, false); head.rotation.x = Math.PI / 2;
  const tr = mesh(trailGeo, M.trail, 0, 0, 0, g, false); tr.scale.z = 0.01; recMark(g, tr);
  world.bullets.push({ p: from.clone(), v: dir.multiplyScalar(speed), g, tr, life: 8, travel: 0 });
  sparks(from, M.flash, 5, 3);
  if (!quiet) SFX.shot(clamp(1 - from.distanceTo(player.p) / 40, 0.12, 1));
}

const _a = new V3();
function updateEnemies(dt, rdt) {
  const P = player, playing = G.state === 'play' && !P.dead, active = G.state === 'play' || G.state === 'dead';
  for (const e of world.enemies) {
    if (!e.alive) continue;
    if (e.dieAt !== undefined) { e.dieAt -= rdt; if (e.dieAt <= 0) { killEnemy(e, new V3(0, 3, 0)); addScore(100, e.p.clone().add(new V3(0, 1.2, 0))); continue; } }
    e.t += dt;
    if (G.gallery) { galleryIdle(e, rdt); continue; }
    const dx = P.p.x - e.p.x, dz = P.p.z - e.p.z, dy = P.p.y - e.p.y, dist = Math.hypot(dx, dz);
    if (e.type === 'goomba') {
      e.calm = Math.max(0, (e.calm || 0) - dt);
      const chase = active && e.calm <= 0 && dist < 10 && Math.abs(dy) < 2.6;
      if (chase && !e.noticed && e.ground) { e.noticed = true; e.v.y = 6.5; e.hopT = 0.35; popText('!', e.p.clone().add(new V3(0, 1.4, 0)), 'red'); tone({ f: 880, f1: 1320, dur: 0.08, vol: 0.04 }); }
      if (!chase && dist > 14) e.noticed = false;
      e.hopT = Math.max(0, (e.hopT || 0) - dt);
      let spd = e.hopT > 0 ? 0 : chase ? 3.0 : 1.5;
      if (chase) e.head = lerpAngle(e.head, Math.atan2(dx, dz), 1 - Math.exp(-dt * 4));
      const fx = Math.sin(e.head), fz = Math.cos(e.head);
      e.turnCD -= dt;
      if (e.ground && !solidAt(e.p.x + fx * 0.7, e.p.y - 0.25, e.p.z + fz * 0.7)) {
        // a ledge: drop down if there's floor below, otherwise wander off — never camp the landing spot
        let floor = false;
        for (let h = 0.8; h < 6; h += 0.8) if (solidAt(e.p.x + fx * 0.9, e.p.y - h, e.p.z + fz * 0.9)) { floor = true; break; }
        if (!floor && e.turnCD <= 0) { e.head += Math.PI + rand(-0.6, 0.6); e.turnCD = 0.6; if (chase) e.calm = 2.2; }
      }
      e.v.x = Math.sin(e.head) * spd; e.v.z = Math.cos(e.head) * spd;
      e.v.y -= 40 * dt;
      if (e.ground && e.ground.delta) e.p.add(e.ground.delta);
      const r = moveBody(e, dt); e.ground = r.ground;
      if (r.wall && !chase && e.turnCD <= 0) { e.head += Math.PI; e.turnCD = 0.5; }
      const w = e.t * (spd > 2 ? 14 : 9);
      e.m.body.rotation.z = Math.sin(w) * 0.1;
      e.m.body.position.y = Math.abs(Math.sin(w)) * 0.05;
      e.m.feet[0].position.y = 0.07 + Math.max(0, Math.sin(w)) * 0.08; e.m.feet[1].position.y = 0.07 + Math.max(0, -Math.sin(w)) * 0.08;
    } else if (e.type === 'shooter') {
      // SUPERHOT enemies walk at you between shots (stop at ledges, hold position when close)
      const awake = !e.dormantX || P.p.x > e.dormantX;
      const near = awake && active && dist < 22 && Math.abs(dy) < 6;
      let sp = 0;
      if (near && !e.still && dist > 6 && e.cd > 0.7 && e.ground) {
        const fx = dx / dist, fz = dz / dist;
        if (solidAt(e.p.x + fx * 0.6, e.p.y - 0.25, e.p.z + fz * 0.6)) { sp = 1.3; e.v.x = fx * sp; e.v.z = fz * sp; }
      }
      if (!sp) { e.v.x = 0; e.v.z = 0; }
      e.v.y -= 40 * dt;
      if (e.ground && e.ground.delta) e.p.add(e.ground.delta);
      const r = moveBody(e, dt); e.ground = r.ground;
      const inRange = awake && playing && dist < 26 && Math.abs(dy) < 12;
      if (near || inRange) e.head = lerpAngle(e.head, Math.atan2(dx, dz), 1 - Math.exp(-dt * 5));
      e.m.body.position.y = sp ? Math.abs(Math.sin(e.t * 9)) * 0.06 : Math.sin(e.t * 3) * 0.025;
      e.m.body.rotation.z = sp ? Math.sin(e.t * 9) * 0.08 : 0;
      if (inRange) {
        e.cd -= dt;
        e.m.flash.scale.setScalar(e.cd < 0.5 ? 0.25 + (0.5 - Math.max(e.cd, 0)) * 1.8 : 0.001);
        if (e.cd < 0.6) {
          e.m.root.updateMatrixWorld(true);
          const mz = e.m.gun.localToWorld(new V3(0, 0.03, 0.29)), tg = P.p.clone(); tg.y += P.he.h * 0.55;
          const L = mz.distanceTo(tg), lz = e.m.laser;
          e.losT = (e.losT || 0) - dt; if (e.losT <= 0) { e.losOK = los(mz, tg); e.losT = 0.15; }
          lz.visible = !!e.losOK; lz.position.copy(mz).lerp(tg, 0.5); lz.lookAt(tg); lz.scale.set(0.6, 0.6, L);
          M.laser.opacity = 0.12 + (0.6 - Math.max(e.cd, 0)) * 0.4;
        } else e.m.laser.visible = false;
        if (e.cd <= 0) {
          e.m.root.updateMatrixWorld(true);
          const muzzle = e.m.gun.localToWorld(new V3(0, 0.03, 0.29));
          const tgt = P.p.clone(); tgt.y += P.he.h * 0.55;
          if (los(muzzle, tgt)) { fireBullet(muzzle, tgt, e.teach ? 5 : 11); e.teach = false; e.cd = rand(2.1, 2.9); e.m.body.rotation.x = -0.25; e.m.laser.visible = false; }
          else e.cd = 0.6;
        }
      } else { e.m.flash.scale.setScalar(0.001); e.cd = Math.max(e.cd, 0.9); e.m.laser.visible = false; }
      e.m.body.rotation.x = damp(e.m.body.rotation.x, 0, 6, dt);
    } else if (e.type === 'thwomp') {
      if (e.st === 'wait') {
        e.p.y = e.home + Math.sin(e.t * 2) * 0.05;
        const near = Math.abs(dx) < 4 && Math.abs(dz) < 3;
        e.m.body.position.x = near ? Math.sin(e.t * 50) * 0.025 : 0;
        if (playing && Math.abs(dx) < 1.7 && Math.abs(dz) < 1.6 && P.p.y < e.p.y) { e.st = 'fall'; e.v.set(0, -2, 0); e.m.body.position.x = 0; }
      } else if (e.st === 'fall') {
        e.v.y -= 75 * dt; e.v.x = e.v.z = 0;
        const r = moveBody(e, dt);
        if (r.ground) { e.st = 'land'; e.wt = 1.2; SFX.boom(); G.shake = Math.max(G.shake, clamp(1 - dist / 16, 0, 1) * 0.9); dust(e.p, 12, 4.5, true); ringFx(e.p, 2.5); }
      } else if (e.st === 'land') { e.wt -= dt; if (e.wt <= 0) e.st = 'rise'; }
      else { e.p.y += 2.4 * dt; if (e.p.y >= e.home) { e.p.y = e.home; e.st = 'wait'; } }
    } else if (e.type === 'piranha') {
      e.wt -= dt;
      if (e.ph === 'down') { e.p.y = e.dn; if (e.wt <= 0 && !(playing && dist < 1.9)) e.ph = 'rise'; }
      else if (e.ph === 'rise') { e.p.y += 2.8 * dt; if (e.p.y >= e.up) { e.p.y = e.up; e.ph = 'up'; e.wt = 2.4; e.shot = false; } }
      else if (e.ph === 'up') {
        if (!e.shot && e.wt < 1.5 && playing && dist < 20) {
          e.shot = true; e.m.root.updateMatrixWorld(true);
          const from = e.m.head.localToWorld(new V3(0, 0, 0.4)), tg = P.p.clone(); tg.y += P.he.h * 0.55;
          if (los(from, tg)) fireBullet(from, tg, 9);
        }
        if (e.wt <= 0) e.ph = 'sink';
      } else { e.p.y -= 2.8 * dt; if (e.p.y <= e.dn) { e.p.y = e.dn; e.ph = 'down'; e.wt = rand(1.6, 2.6); } }
      if (playing) e.head = lerpAngle(e.head, Math.atan2(dx, dz), 1 - Math.exp(-dt * 6));
      e.m.jaw.position.y = -0.14 - Math.max(0, Math.sin(e.t * 9)) * 0.08;
      e.m.body.rotation.z = Math.sin(e.t * 3) * 0.08;
    } else if (e.type === 'boss') {
      updateBoss(e, dt, dx, dz, dist, playing);
    } else if (e.type === 'bill') {
      e.life -= dt;
      if (playing) { e.v.z += clamp(dz, -1, 1) * dt * 1.2; e.v.z = clamp(e.v.z, -1.6, 1.6); }
      e.p.addScaledVector(e.v, dt);
      const c = solidAt(e.p.x + Math.sign(e.v.x) * 0.5, e.p.y + 0.42, e.p.z);
      if (e.life <= 0 || (c && e.life < e.max - 0.4)) { killEnemy(e, new V3()); continue; }
      e.m.body.rotation.z = Math.sin(e.t * 9) * 0.06;
    }
    e.m.root.position.copy(e.p);
    e.m.root.rotation.y = e.type === 'bill' ? Math.atan2(e.v.x, e.v.z) : e.head;
    if (e.p.y < -16) { e.alive = false; world.group.remove(e.m.root); continue; }
    // vs player
    const top = e.p.y + e.he.h;
    const stompable = e.type !== 'piranha' && e.type !== 'thwomp' && !(e.type === 'boss' && e.inv > 0);
    if (playing && stompable && P.v.y < 0.5 && Math.abs(P.p.x - e.p.x) < e.he.x + P.he.x + 0.35 && Math.abs(P.p.z - e.p.z) < e.he.z + P.he.z + 0.35 && P.p.y > top - 0.55 && P.p.y < top + 0.35) {
      if (e.type === 'boss') hitBoss(e, 'stomp'); else stomp(e);
      continue;
    }
    if (playing && bodiesOverlap(P, e, 0.8)) {
      if (e.type === 'piranha') { if (e.p.y > e.dn + 0.45 && P.invuln <= 0) { G.cause = 'piranha'; hurtPlayer(); } }
      else if (e.type === 'thwomp') {
        if (P.v.y < 2 && P.p.y > e.p.y + e.he.h * 0.55) { P.p.y = e.p.y + e.he.h + 0.02; P.v.y = 13; P.jumpCut = false; P.pound = 0; SFX.bump(); G.shake = Math.max(G.shake, 0.2); }
        else { G.cause = 'thwomp'; hurtPlayer(); }
      } else if (e.type === 'boss') {
        if (P.p.y > e.p.y + e.he.h * 0.55 && P.v.y < 4) hitBoss(e, 'stomp');
        else if (e.inv < 1.2) { G.cause = 'boss'; hurtPlayer(); }
      } else if (P.pound === 2 || P.p.y > e.p.y + e.he.h * 0.55 || (P.v.y < 1 && P.p.y > e.p.y + e.he.h * 0.3)) stomp(e);
      else { G.cause = e.type; hurtPlayer(); }
    }
  }
  world.enemies = world.enemies.filter(e => e.alive);

  // SUPERHOT rooms: gates shatter when the room is clear
  for (const gt of world.gates) {
    if (gt.open) continue;
    const left = world.enemies.some(e => e.alive && (e.type === 'goomba' || e.type === 'shooter') && Math.abs(e.p.z) < 5.6 && e.p.x > gt.x0 && e.p.x < gt.x1);
    if (!left && P.p.x > gt.x0 - 2) {
      gt.open = true; removeSolid(gt.s); SFX.brick(); SFX.word(); G.shake = Math.max(G.shake, 0.6); G.hitstop = 0.12; G.white = 0.3;
      shatter(gt.s.mesh.position.clone(), new V3(0.4, 2.5, 3.5), [M.red2, M.red, M.red3], 46, new V3(4, 2, 0), 7);
      popText('CLEAR', P.p.clone().add(new V3(0, P.he.h + 1.2, 0)), 'red');
    }
  }
  // bill blasters
  if (G.gallery) return;
  for (const bl of world.blasters) {
    const dx = P.p.x - bl.x;
    if (!playing || Math.sign(dx) !== bl.dir || Math.abs(dx) > 30 || Math.abs(dx) < 1.5 || Math.abs(P.p.y - bl.top) > 8) continue;
    bl.cd -= dt;
    if (bl.cd <= 0) {
      bl.cd = rand(3.4, 4.2);
      const m = buildBill(); world.group.add(recMark(m.root, m.body)); outlineBlacks(m.root);
      const e = { type: 'bill', p: new V3(bl.x + bl.dir * 1.15, bl.top + 0.38, bl.z), v: new V3(bl.dir * 5.5, 0, 0), he: { x: 0.42, h: 0.84, z: 0.42 }, m, head: 0, alive: true, t: 0, life: 9, max: 9 };
      m.root.position.copy(e.p); world.enemies.push(e);
      SFX.boom(); G.shake = Math.max(G.shake, 0.15);
      dust(new V3(e.p.x, e.p.y + 0.2, e.p.z), 6, 2);
    }
  }
}

// ---------- shells: Mario's weapon. aimed by movement, not by a crosshair
const SHELL_SPEED = 13;
function spawnShell(x, y, z, vy = 0) {
  const m = buildShell(); m.position.set(x, y, z); world.group.add(recMark(m)); outlineBlacks(m);
  world.shells.push({ p: new V3(x, y, z), v: new V3(0, vy, 0), he: { x: 0.34, h: 0.4, z: 0.34 }, st: 'idle', dir: new V3(), cd: 0.4, bounces: 0, life: 0, combo: 0, m, ground: null });
}
function shatterShell(sh) {
  sh.dead = true; world.group.remove(sh.m);
  shatter(sh.p.clone().add(new V3(0, 0.2, 0)), new V3(0.3, 0.15, 0.3), [M.shellM, M.red2], 16, new V3(), 4); SFX.shatter();
}
function updateShells(dt) {
  const P = player, playing = G.state === 'play' && !P.dead;
  for (const sh of world.shells) {
    if (sh.dead) continue;
    sh.cd -= dt; sh.v.y -= 40 * dt;
    if (sh.st === 'slide') { sh.v.x = sh.dir.x * SHELL_SPEED; sh.v.z = sh.dir.z * SHELL_SPEED; sh.life += dt; sh.m.rotation.y += dt * 18; }
    else { sh.v.x = 0; sh.v.z = 0; }
    if (sh.ground && sh.ground.delta) sh.p.add(sh.ground.delta);
    const r = moveBody(sh, dt); sh.ground = r.ground;
    if (sh.st === 'slide' && r.wall) {
      if (sh.v.x === 0) sh.dir.x *= -1; if (sh.v.z === 0) sh.dir.z *= -1;
      sh.bounces++; tone({ f: 1500, f1: 700, dur: 0.06, vol: 0.05 }); sparks(sh.p.clone().add(new V3(0, 0.2, 0)), M.shellM, 4, 2);
      if (sh.bounces > 4) { shatterShell(sh); continue; }
    }
    if (sh.p.y < -16 || sh.life > 9) { if (sh.p.y >= -16) shatterShell(sh); else { sh.dead = true; world.group.remove(sh.m); } continue; }
    sh.m.position.copy(sh.p);
    if (sh.st === 'slide') {
      for (const e of world.enemies) {
        if (!e.alive || !bodiesOverlap(sh, e, 1)) continue;
        if (e.type === 'piranha' && e.p.y < e.dn + 0.4) continue;
        if (e.type === 'thwomp') { shatterShell(sh); break; }
        if (e.type === 'boss') { hitBoss(e, 'shell'); shatterShell(sh); break; }
        sh.combo++; killEnemy(e, sh.dir.clone().multiplyScalar(6)); addScore(200 * Math.min(2 ** (sh.combo - 1), 16), e.p.clone().add(new V3(0, 1.3, 0)), sh.combo > 1 ? 'red' : '');
      }
      if (sh.dead) continue;
      for (let j = world.bullets.length - 1; j >= 0; j--) {
        const b = world.bullets[j];
        if (Math.abs(b.p.x - sh.p.x) < 0.5 && Math.abs(b.p.z - sh.p.z) < 0.5 && b.p.y > sh.p.y - 0.1 && b.p.y < sh.p.y + 0.8) {
          sparks(b.p, M.bullet, 6, 3); world.group.remove(b.g); world.bullets.splice(j, 1); tone({ f: 2400, f1: 1200, dur: 0.05, vol: 0.05 });
        }
      }
    }
    if (playing && sh.cd <= 0 && bodiesOverlap(P, sh, 1)) {
      if (sh.st === 'idle') {
        let dx = sh.p.x - P.p.x, dz = sh.p.z - P.p.z;
        const hs = Math.hypot(P.v.x, P.v.z);
        if (hs > 1) { dx = dx * 0.4 + P.v.x / hs; dz = dz * 0.4 + P.v.z / hs; }
        let l = Math.hypot(dx, dz);
        if (l < 0.15) { dx = Math.sin(P.facing); dz = Math.cos(P.facing); l = 1; }
        sh.dir.set(dx / l, 0, dz / l);
        sh.st = 'slide'; sh.cd = 0.35; sh.bounces = 0; sh.life = 0; sh.combo = 0;
        G.boost = 0.3; G.hitstop = 0.04; SFX.stomp(2); popText('KICK', sh.p.clone().add(new V3(0, 0.9, 0))); learn('kick');
        if (P.v.y < 0 && P.p.y > sh.p.y + 0.2) { P.v.y = 11; P.jumpCut = false; }
      } else if (P.v.y < 1 && P.p.y > sh.p.y + 0.25) {
        sh.st = 'idle'; sh.cd = 0.35; P.v.y = 12; P.jumpCut = false; SFX.bump();
      }
    }
  }
  world.shells = world.shells.filter(s => !s.dead);
}

function updateBoss(e, dt, dx, dz, dist, playing) {
  const P = player;
  e.inv = Math.max(0, e.inv - dt);
  const active = playing && P.p.x > e.x0 - 3;
  e.v.y -= 40 * dt;
  const rage = e.hp <= 1.01;
  if (e.st === 'walk') {
    const want = active ? clamp(dx, -1, 1) * (rage ? 3.2 : 2.2) : 0;
    e.v.x = damp(e.v.x, want, 4, dt); e.v.z = active ? clamp(dz, -1, 1) * 1.4 : 0;
    if (active) { e.cd -= dt; if (e.cd <= 0) { e.st = e.n++ % 2 === 0 ? 'breath' : 'crouch'; e.wt = 0.9; } }
    e.m.body.rotation.z = Math.sin(e.t * 6) * 0.06 * Math.min(1, Math.abs(e.v.x));
  } else if (e.st === 'breath') {
    e.v.x = e.v.z = 0; e.wt -= dt;
    e.m.mouth.scale.setScalar(0.25 + (0.9 - Math.max(e.wt, 0)) * 1.6);
    if (e.wt <= 0) {
      e.m.root.updateMatrixWorld(true);
      const from = e.m.mouth.getWorldPosition(new V3()), base = Math.atan2(dx, dz), n = rage ? 7 : 5;
      for (let i = 0; i < n; i++) {
        const a = base + (i - (n - 1) / 2) * 0.2;
        const to = from.clone().add(new V3(Math.sin(a) * 10, 0, Math.cos(a) * 10)); to.y = P.p.y + P.he.h * 0.5;
        fireBullet(from, to, 7.5, i > 0);
      }
      SFX.boom(); e.m.mouth.scale.setScalar(0.001); e.st = 'walk'; e.cd = rage ? 1.5 : 2.3;
    }
  } else if (e.st === 'crouch') {
    e.v.x = e.v.z = 0; e.wt -= dt; e.m.body.scale.y = 1 - (0.9 - Math.max(e.wt, 0)) * 0.22;
    if (e.wt <= 0.25) { e.v.y = 16; e.v.x = clamp(dx, -7, 7) / 1.5; e.v.z = clamp(dz, -4, 4) / 1.5; e.st = 'air'; e.m.body.scale.y = 1.08; SFX.jump(); }
  }
  const r = moveBody(e, dt); e.ground = r.ground;
  e.p.x = clamp(e.p.x, e.x0, e.x1);
  if (e.st === 'air') {
    e.m.body.scale.y = damp(e.m.body.scale.y, 1, 6, dt);
    if (r.ground) {
      e.st = 'walk'; e.cd = rage ? 1.4 : 2.2; e.m.body.scale.y = 1;
      SFX.pound(); G.shake = Math.max(G.shake, 1); dust(e.p, 18, 6, true); ringFx(e.p, 7, 0.6);
      if (playing && P.ground && Math.hypot(P.p.x - e.p.x, P.p.z - e.p.z) < 6.5) { G.cause = 'boss'; hurtPlayer(); }
    }
  }
  if (playing) e.head = lerpAngle(e.head, Math.atan2(dx, dz), 1 - Math.exp(-dt * 3));
  e.m.root.visible = e.inv > 0 ? Math.floor(G.time * 16) % 2 === 0 : true;
  const bb = $('bossbar');
  if (active && bb.classList.contains('hide-el')) bb.classList.remove('hide-el');
  $('bossfill').style.width = (clamp(e.hp / 3, 0, 1) * 100) + '%';
}
function hitBoss(e, kind) {
  const P = player;
  if (e.inv > 0 || !e.alive) return;
  e.hp -= kind === 'fire' ? 0.34 : 1; e.inv = kind === 'fire' ? 0.3 : 1.7;
  const c = e.p.clone(); c.y += 1.6;
  shatter(c, new V3(1, 1, 1), [M.red, M.red2, M.red3], kind === 'fire' ? 8 : 26, new V3(0, 4, 0), 6);
  SFX.shatter(); G.shake = Math.max(G.shake, 0.6); G.punch = 1;
  if (kind === 'stomp') {
    P.v.y = 19; P.jumpCut = false; P.pound = 0; P.p.y = e.p.y + e.he.h + 0.05; G.hitstop = 0.16; SFX.stomp(4);
    addScore(2000, c.clone().add(new V3(0, 1.4, 0)), 'red');
    e.v.x = clamp(e.p.x - P.p.x, -1, 1) * 6;
  }
  if (e.hp <= 0.01) bossDie(e);
}
function bossDie(e) {
  const c = e.p.clone(); c.y += 1.4;
  killEnemy(e, new V3(0, 6, 0));
  shatter(c, new V3(1.1, 1.3, 1.1), [M.red, M.red2, M.red3, M.gold], 70, new V3(0, 5, 0), 9);
  G.hitstop = 0.35; G.shake = 1.3; G.white = 0.7; G.boost = 1.5;
  addScore(10000, c.clone().add(new V3(0, 2, 0)), 'red');
  SFX.boom(); setTimeout(() => SFX.shatter(), 120);
  $('bossbar').classList.add('hide-el');
  showBig('SHATTERED.', 'chant'); setTimeout(() => { if ($('big').classList.contains('chant')) $('big').className = ''; }, 900);
  world.barriers.forEach((s, i) => setTimeout(() => {
    if (!world.solids.includes(s)) return;
    removeSolid(s); SFX.brick(); G.shake = Math.max(G.shake, 0.4);
    shatter(s.mesh.position.clone(), new V3(0.5, 3, 5), [M.red2, M.red, M.red3], 40, new V3(3, 2, 0), 6);
  }, 700 + i * 200));
}

function updateProjectiles(dt) {
  const P = player;
  // enemy bullets
  for (let i = world.bullets.length - 1; i >= 0; i--) {
    const b = world.bullets[i]; let dead = false;
    const steps = Math.max(1, Math.ceil(b.v.length() * dt / 0.15));
    for (let s = 0; s < steps && !dead; s++) {
      b.p.addScaledVector(b.v, dt / steps);
      if (solidAt(b.p.x, b.p.y, b.p.z)) { sparks(b.p, M.bullet, 6, 2.5); dead = true; break; }
      if (!P.dead && G.state === 'play' && Math.abs(b.p.x - P.p.x) < P.he.x - 0.04 && Math.abs(b.p.z - P.p.z) < P.he.z - 0.04 && b.p.y > P.p.y + 0.08 && b.p.y < P.p.y + P.he.h - 0.06) {
        dead = true; if (P.invuln <= 0) { G.cause = 'bullet'; hurtPlayer(); } break;
      }
      for (let j = world.fireballs.length - 1; j >= 0; j--) {
        const f = world.fireballs[j];
        if (f.p.distanceToSquared(b.p) < 0.3) { sparks(b.p, M.bullet, 8, 4); sparks(b.p, M.red, 5, 3); world.group.remove(f.g); world.fireballs.splice(j, 1); addScore(100, b.p); tone({ f: 2400, f1: 1200, dur: 0.06, vol: 0.05 }); noise({ dur: 0.08, vol: 0.15, f: 5000, q: 1 }); dead = true; break; }
      }
    }
    if (!dead && !b.near && !P.dead && G.state === 'play') {
      const dx = b.p.x - P.p.x, dy = b.p.y - (P.p.y + P.he.h * 0.5), dz = b.p.z - P.p.z;
      if (dx * dx + dy * dy + dz * dz < 1.1) { b.near = true; SFX.whoosh(); G.punch = Math.max(G.punch, 0.45); G.shake = Math.max(G.shake, 0.12); }
    }
    b.life -= dt; b.travel += b.v.length() * dt;
    if (dead || b.life <= 0) { world.group.remove(b.g); world.bullets.splice(i, 1); continue; }
    b.g.position.copy(b.p); _a.copy(b.p).add(b.v); b.g.lookAt(_a);
    const L = Math.min(b.travel, 7); b.tr.scale.z = Math.max(L, 0.01); b.tr.position.z = -L / 2;
  }
  // player fireballs
  for (let i = world.fireballs.length - 1; i >= 0; i--) {
    const f = world.fireballs[i]; let dead = false;
    const steps = Math.max(1, Math.ceil(f.v.length() * dt / 0.2));
    for (let s = 0; s < steps && !dead; s++) {
      f.p.addScaledVector(f.v, dt / steps);
      if (solidAt(f.p.x, f.p.y, f.p.z)) { const sol = solidAt(f.p.x, f.p.y, f.p.z); if (sol.type === 'brick') breakBrick(sol); sparks(f.p, M.bullet, 7, 3); dead = true; break; }
      for (const e of world.enemies) {
        if (!e.alive) continue;
        if (Math.abs(f.p.x - e.p.x) < e.he.x + 0.2 && Math.abs(f.p.z - e.p.z) < e.he.z + 0.2 && f.p.y > e.p.y - 0.2 && f.p.y < e.p.y + e.he.h + 0.2) {
          if (e.type === 'piranha' && e.p.y < e.dn + 0.4) continue;
          if (e.type === 'thwomp') { sparks(f.p, M.bullet, 7, 3); tone({ f: 1800, f1: 900, dur: 0.08, vol: 0.05 }); dead = true; break; }
          if (e.type === 'boss') { hitBoss(e, 'fire'); sparks(f.p, M.bullet, 7, 3); dead = true; break; }
          killEnemy(e, f.v.clone().normalize().multiplyScalar(5)); addScore(200, e.p.clone().add(new V3(0, 1.3, 0))); sparks(f.p, M.bullet, 7, 3); dead = true; break;
        }
      }
    }
    f.life -= dt; f.travel += f.v.length() * dt;
    if (dead || f.life <= 0) { world.group.remove(f.g); world.fireballs.splice(i, 1); continue; }
    f.g.position.copy(f.p); _a.copy(f.p).add(f.v); f.g.lookAt(_a);
    const L = Math.min(f.travel, 7); f.tr.scale.z = Math.max(L, 0.01); f.tr.position.z = -L / 2;
  }
}

function updateItems(wdt, rdt) {
  for (let i = world.items.length - 1; i >= 0; i--) {
    const it = world.items[i];
    const dt = it.type === 'popcoin' ? wdt : rdt;   // power-ups live on real time: frozen world, running mushroom
    it.t += dt;
    if (it.type === 'popcoin') {
      it.v.y -= 32 * dt; it.p.addScaledVector(it.v, dt); it.mesh.rotation.y += dt * 22;
      if (it.t > 0.55) { sparks(it.p, M.gold, 6, 3); addScore(200, it.p, 'gold'); world.group.remove(it.mesh); world.items.splice(i, 1); }
      continue;
    }
    if (it.state === 'emerge') {
      it.p.y = Math.min(it.y1, it.p.y + dt * 1.6);
      if (it.p.y >= it.y1) it.state = 'live';
    } else if (it.type === 'mushroom') {
      it.v.x = it.dir * 2.8; it.v.z = 0; it.v.y -= 40 * dt;
      if (it.ground && it.ground.delta) it.p.add(it.ground.delta);
      const r = moveBody(it, dt); it.ground = r.ground;
      if (r.wall) it.dir *= -1;
      if (it.p.y < -16) { world.group.remove(it.mesh); world.items.splice(i, 1); continue; }
    }
    if (it.type === 'flower') { it.mesh.rotation.y = Math.sin(it.t * 2) * 0.5; it.mesh.userData.head.rotation.z += dt * 2; }
  }
}

function updateWorldBits(dt, rdt) {
  for (const m of world.movers) {
    m.t += rdt;   // platforms run on real time — they never stall while you wait
    const c = m.base.clone().addScaledVector(m.axis, Math.sin(m.t * m.spd + m.phase) * m.amp);
    m.s.delta.subVectors(c, m.s.mesh.position);
    m.s.mesh.position.copy(c); m.s.min.subVectors(c, m.half); m.s.max.addVectors(c, m.half);
  }
  for (const c of world.coins) {
    c.t += dt; c.mesh.rotation.y = c.t * 3; c.mesh.position.y = c.p.y + Math.sin(c.t * 2.5) * 0.08;
    if (G.state !== 'replay') c.mesh.scale.setScalar(clamp((c.mesh.position.distanceTo(camera.position) - 1.2) / 2.2, 0.001, 1));
  }
  for (let i = world.bumps.length - 1; i >= 0; i--) {
    const b = world.bumps[i]; b.t += rdt;
    b.m.position.y = b.y0 + Math.sin(Math.min(b.t / 0.18, 1) * Math.PI) * 0.35;
    if (b.t >= 0.18) { b.m.position.y = b.y0; world.bumps.splice(i, 1); }
  }
  for (const d of world.decor) {
    if (d.kind === 'flowerShow') { d.g.rotation.y += rdt * 0.8; continue; }
    if (d.kind === 'cloud') d.g.position.x += dt * d.spd;
    else { d.g.rotation.x += dt * d.spd * 0.3; d.g.rotation.y += dt * d.spd * 0.4; }
  }
  if (world.flag) world.flag.fl.rotation.y = Math.sin(G.time * 3) * 0.15;
  M.q.emissiveIntensity = 0.18 + Math.sin(G.time * 4) * 0.12;
}

// =====================================================================
// CAMERA, TIME, HUD
// =====================================================================
const _off = new V3(), _tg = new V3(), _zero = new V3();
// critically damped spring (Unity-style SmoothDamp): position AND velocity stay continuous, so the view never jolts
const camVel = { x: 0, y: 0, z: 0, lead: 0 };
function smoothDamp(cur, target, key, smoothTime, dt) {
  const omega = 2 / smoothTime, x = omega * dt, e = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);
  const change = cur - target, temp = (camVel[key] + omega * change) * dt;
  camVel[key] = (camVel[key] - omega * temp) * e;
  return target + (change + temp) * e;
}
function updateCamera(dt) {
  if (G.photo) return;   // debug: camera placed by hand for model inspection
  const P = player;
  if (G.state === 'title') cam.yaw = -Math.PI / 2 - 0.9 + Math.sin(G.time * 0.12) * 0.55;
  else if (G.state !== 'win') {
    // fixed chase camera: always looks down the level; mouse-drag / Q,E offsets spring back
    if (!G.paused) { if (held('KeyQ')) { cam.uYaw += dt * 1.8; G.lastMouse = G.time; } if (held('KeyE')) { cam.uYaw -= dt * 1.8; G.lastMouse = G.time; } }
    // the camera stays where you put it; it only drifts back home while you stand still (so "forward" never changes mid-run)
    const idle = !dragging && G.time - (G.lastMouse || 0) > 2.5 && Math.hypot(P.v.x, P.v.z) < 0.3 && !held('KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight');
    if (G.state === 'play' && idle) { cam.uYaw = lerpAngle(cam.uYaw, 0, 1 - Math.exp(-dt * 1.5)); cam.uPitch = damp(cam.uPitch, 0, 1.5, dt); }
    const orbit = G.state === 'dead' ? (G.deadT || 0) * 0.3 : 0;   // cosmetic death orbit — your angle comes back on respawn
    cam.yaw = CAM_YAW + cam.uYaw + orbit; cam.pitch = CAM_PITCH + cam.uPitch;
  }
  if (G.state === 'win' && world.flag) {
    const f = world.flag, e = 1 - Math.exp(-dt * 2.6);
    cam.yaw = lerpAngle(cam.yaw, 0, e); cam.pitch = damp(cam.pitch, 0.06, 2.6, dt);
    cam.target.x = damp(cam.target.x, f.x + 2.2, 2.6, dt); cam.target.y = damp(cam.target.y, f.top + 4.6, 2.6, dt); cam.target.z = damp(cam.target.z, 0, 2.6, dt);
    cam.winD = damp(cam.winD || cam.dist, 19, 2.2, dt);
    _off.set(Math.sin(cam.yaw) * Math.cos(cam.pitch), Math.sin(cam.pitch), Math.cos(cam.yaw) * Math.cos(cam.pitch));
    camera.position.copy(cam.target).addScaledVector(_off, cam.winD);
    camera.lookAt(cam.target); camera.fov = damp(camera.fov, 50, 3, dt); camera.updateProjectionMatrix();
    sky.position.copy(camera.position);
    sun.position.set(cam.target.x - 12, cam.target.y + 26, cam.target.z + 14); sun.target.position.copy(cam.target);
    return;
  }
  cam.winD = 0;
  const followY = !(P.dead && P.p.y < -2);
  // look ahead in the running direction so you see what's coming; z follows loosely so the view stays calm
  const f0 = camForward();
  cam.lead = smoothDamp(cam.lead || 0, clamp((P.v.x * f0.x + P.v.z * f0.z) * 0.3, -1.5, 3), 'lead', 0.45, dt);
  const vo = P.vo || _zero;
  _tg.set(P.p.x + vo.x + f0.x * cam.lead, P.p.y + vo.y + (P.big ? 1.1 : 0.85), (P.p.z + vo.z) * 0.75 + f0.z * cam.lead);
  cam.target.x = smoothDamp(cam.target.x, _tg.x, 'x', 0.16, dt); cam.target.z = smoothDamp(cam.target.z, _tg.z, 'z', 0.24, dt);
  if (followY) {
    if (P.ground || G.state !== 'play') cam.groundY = _tg.y;
    // hold height through small hops, but never trail far below Mario (stairs!) or sink into a block
    const want = P.ground || G.state !== 'play' ? _tg.y : clamp(cam.groundY ?? _tg.y, _tg.y - 1.1, _tg.y + 0.4);
    cam.target.y = smoothDamp(cam.target.y, want, 'y', 0.28, dt);
  }
  const k = cam.intro * cam.intro * (3 - 2 * cam.intro); cam.intro = Math.max(0, cam.intro - dt * 0.75);
  const T = G.state === 'title';
  const portrait = innerHeight > innerWidth * 1.05;
  const pitch = T ? 0.16 : cam.pitch + k * 0.45 + (portrait ? 0.12 : 0), yaw = T ? cam.yaw : cam.yaw + k * 0.9, dist = T ? (portrait ? 9 : 6.2) : (cam.dist + k * 9) * (portrait ? 1.3 : 1);
  _off.set(Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), Math.cos(yaw) * Math.cos(pitch));
  const d = dist;   // no camera collision: it keeps a steady view, occluders fade instead
  camera.position.copy(cam.target).addScaledVector(_off, d);
  if (G.shake > 0) { const s = G.shake * G.shake * 0.35; camera.position.x += rand(-s, s); camera.position.y += rand(-s, s); camera.position.z += rand(-s, s); }
  camera.lookAt(cam.target);
  const hs = Math.hypot(P.v.x, P.v.z) / MAXS;
  const wantFov = innerHeight > innerWidth * 1.05 ? 72 : 52;
  if (camera.fov !== wantFov) { camera.fov = wantFov; camera.updateProjectionMatrix(); }
  sky.position.copy(camera.position);
  sun.position.set(cam.target.x - 12, cam.target.y + 26, cam.target.z + 14); sun.target.position.copy(cam.target);
}

function updateTimeScale(dt) {
  const P = player;
  let target;
  if (G.state === 'title') target = 0.12;
  else if (G.state === 'dead') target = 0.16;
  else if (G.state === 'win') target = G.winPhase === 0 ? 0.25 : 1;
  else {
    const hs = Math.hypot(P.v.x, P.v.z) / MAXS;
    const vs = P.ground ? 0 : Math.min(Math.abs(P.v.y) / 16, 1) * 0.75;
    target = 0.03 + Math.max(hs, vs) * 0.97;
    if (P.ground && P.ground.type === 'mover') target = 1;   // riding a platform counts as moving
    if (P.pound === 1) target = 0.06;
    if (P.pound === 2 || G.boost > 0) target = 1;
    target = clamp(target, 0.03, 1);
  }
  G.ts = damp(G.ts, target, target > G.ts ? 16 : 10, dt);
  G.look = damp(G.look, 0, 6, dt);
  G.boost = Math.max(0, G.boost - dt);
}

let lastFire = -1;
function updateHUD() {
  const P = player;
  $('score').textContent = String(G.score).padStart(6, '0');
  $('coins').textContent = String(G.coins).padStart(2, '0');
  $('time').textContent = G.levelTime.toFixed(1);
  $('deaths').textContent = G.deaths;
  $('tfill').style.width = (G.ts * 100).toFixed(1) + '%';
  $('tlab').textContent = 'TIME ×' + G.ts.toFixed(2);
  if (P.fire !== lastFire) {
    lastFire = P.fire;
    let h = '<span class="k">AMMO</span>';
    for (let i = 0; i < Math.max(3, P.fire); i++) h += `<div class="fb${i < P.fire ? '' : ' off'}"></div>`;
    $('fire').innerHTML = h;
    setBig(P.big);
  }
}

const blob = new THREE.Mesh(new THREE.CircleGeometry(0.42, 24), M.blob); blob.rotation.x = -Math.PI / 2; scene.add(blob);
const _down = new V3(0, -1, 0), _bp = new V3();
function updateBlob() {
  const P = player, r = player.model.root;
  if (!r.visible || G.state === 'end') { blob.visible = false; return; }
  _bp.set(r.position.x, r.position.y + 0.05, r.position.z);
  const d = rayDist(_bp, _down, 30);
  blob.visible = d < 30;
  blob.position.set(_bp.x, _bp.y - d + 0.015, _bp.z);
  const k = clamp(1 - (d - 0.05) / 9, 0.25, 1) * (P.big ? 1 : 0.75);
  blob.scale.setScalar(k); M.blob.opacity = 0.32 * k;
}

// drop GTAO if the machine can't keep up
const perf = { t: 0, n: 0, acc: 0, done: location.search.includes('debug') };
if (TOUCH) { gtao.enabled = false; perf.done = true; }
function perfGuard(dt) {
  if (perf.done || G.state !== 'play') return;
  perf.acc += dt; perf.n++;
  if (perf.acc > 3) {
    const avg = perf.acc / perf.n;
    if (avg > 1 / 42) { gtao.enabled = false; console.log('GTAO disabled, avg frame', (avg * 1000).toFixed(1), 'ms'); }
    perf.done = true;
  }
}

// a frozen moment behind the title screen
function titleTableau() {
  const sh = buildShooter(); world.group.add(sh.root);
  sh.root.position.set(7, 0, 3.5); sh.root.rotation.y = Math.atan2(-7, -3.5); sh.flash.scale.setScalar(0.9);
  const sh2 = buildShooter(); world.group.add(sh2.root);
  sh2.root.position.set(6, 0, -4.2); sh2.root.rotation.y = Math.atan2(-6, 4.2);
  const go = buildGoomba(); world.group.add(go.root); go.root.position.set(3.2, 0, -1.4); go.root.rotation.y = -2.2; go.body.rotation.z = 0.1;
  const tgt = new V3(0, 0.75, 0);
  for (const [from, along] of [[new V3(6.6, 0.86, 3.2), 0.45], [new V3(5.7, 0.86, -3.9), 0.62], [new V3(6.6, 0.86, 3.2), 0.8]]) {
    const pos = from.clone().lerp(tgt, along);
    const g = new THREE.Group(); g.position.copy(pos); world.group.add(g); g.lookAt(tgt);
    mesh(capGeo(0.06, 0.14), M.bullet, 0, 0, 0, g, false).rotation.x = Math.PI / 2;
    const L = Math.min(from.distanceTo(pos), 3.2);
    const tr = mesh(trailGeo, M.trail, 0, 0, -L / 2, g, false); tr.scale.z = L;
  }
  for (let i = 0; i < 18; i++) {
    const m = new THREE.Mesh(shardGeos[i % 4], i % 2 ? M.red : M.red2); m.castShadow = true;
    m.position.set(4.6 + rand(-0.8, 0.8), rand(0.4, 2.2), 1.6 + rand(-0.8, 0.8)); m.rotation.set(rand(6), rand(6), rand(6)); m.scale.setScalar(rand(0.7, 1.8));
    world.group.add(m);
  }
  player.facing = 0.4;
}

// ---------- touch controls: floating stick (left half), JUMP / ACTION buttons, swipe right half to look
const touchUI = { stick: { on: false, x: 0, y: 0, id: null, ox: 0, oy: 0 }, look: { id: null, x: 0, y: 0 } };
if (TOUCH) {
  $('touch').classList.remove('hide-el');
  const base = $('stickBase'), knob = $('stickKnob'), R = 52;
  const inPlay = () => G.state === 'play' && !G.paused && !G.statsOpen;
  const btn = (el, down, up) => {
    el.addEventListener('touchstart', e => { e.preventDefault(); e.stopPropagation(); initAudio(); el.classList.add('down'); down(); }, { passive: false });
    const end = e => { e.preventDefault(); el.classList.remove('down'); up && up(); };
    el.addEventListener('touchend', end, { passive: false }); el.addEventListener('touchcancel', end, { passive: false });
  };
  btn($('tJump'), () => { pressed.add('jump'); keys.add('Space'); if (G.state === 'dead' && G.deadT > 0.5) retry(); }, () => keys.delete('Space'));
  btn($('tAction'), () => pressed.add('pound'));
  btn($('tPause'), () => { if (G.state === 'play') G.paused ? resume() : pause(); });
  addEventListener('touchstart', e => {
    initAudio();
    if (!inPlay()) return;                      // menus, story, rating: let the tap act as a click
    e.preventDefault();
    for (const t of e.changedTouches) {
      if (t.clientX < innerWidth * 0.5 && touchUI.stick.id === null) {
        Object.assign(touchUI.stick, { id: t.identifier, ox: t.clientX, oy: t.clientY, on: true, x: 0, y: 0 });
        base.style.left = t.clientX + 'px'; base.style.top = t.clientY + 'px'; base.classList.add('on'); knob.style.transform = '';
      } else if (touchUI.look.id === null) Object.assign(touchUI.look, { id: t.identifier, x: t.clientX, y: t.clientY });
    }
  }, { passive: false });
  addEventListener('touchmove', e => {
    if (!inPlay()) return;
    e.preventDefault();
    for (const t of e.changedTouches) {
      if (t.identifier === touchUI.stick.id) {
        let dx = t.clientX - touchUI.stick.ox, dy = t.clientY - touchUI.stick.oy; const l = Math.hypot(dx, dy);
        if (l > R) { dx *= R / l; dy *= R / l; }
        knob.style.transform = `translate(${dx}px, ${dy}px)`;
        const m = Math.min(l / R, 1), dead = 0.18;
        touchUI.stick.x = clamp(dx / R * (m < dead ? 0 : 1), -1, 1); touchUI.stick.y = clamp(-dy / R * (m < dead ? 0 : 1), -1, 1);
      } else if (t.identifier === touchUI.look.id) {
        const mx = t.clientX - touchUI.look.x, my = t.clientY - touchUI.look.y; touchUI.look.x = t.clientX; touchUI.look.y = t.clientY;
        cam.uYaw -= mx * 0.006; cam.uPitch = clamp(cam.uPitch + my * 0.004, -0.3, 0.45); G.lastMouse = G.time;
      }
    }
  }, { passive: false });
  const endTouch = e => {
    for (const t of e.changedTouches) {
      if (t.identifier === touchUI.stick.id) { Object.assign(touchUI.stick, { id: null, on: false, x: 0, y: 0 }); base.classList.remove('on'); }
      if (t.identifier === touchUI.look.id) touchUI.look.id = null;
    }
  };
  addEventListener('touchend', endTouch); addEventListener('touchcancel', endTouch);
}
function updateTouchUI() {
  if (!TOUCH) return;
  const show = G.state === 'play' && !G.paused;
  $('touch').style.display = show ? '' : 'none';
  if (!show && touchUI.stick.on) { Object.assign(touchUI.stick, { id: null, on: false, x: 0, y: 0 }); $('stickBase').classList.remove('on'); }
}

// =====================================================================
// LOOP
// =====================================================================
loadLevel(0); refreshTitle();
if (/viewer/.test(location.search + location.hash)) enterGallery();
document.querySelectorAll('#rate button').forEach(b => b.addEventListener('click', e => { e.stopPropagation(); G.rateDone && G.rateDone(+b.dataset.v); }));
$('sexp').addEventListener('click', e => { e.stopPropagation(); exportStats(); });
$('sclose').addEventListener('click', e => { e.stopPropagation(); closeStats(); });

if (location.search.includes('debug')) window.__dbg = { G, player, world, loadLevel, cam, keys, pressed, LEVELS, solidAt, faded, camera, learned, THREE, M, buildMario, buildShooter, scene, mergeVertices, WRAP, spawnShell, renderer, composer, titleShow: () => { G.state = "title"; loadLevel(0); $("title").classList.remove("hide"); $("hud").classList.remove("on"); } };
setLoad(75, 'FREEZING TIME');
try { await renderer.compileAsync(scene, camera); } catch (e) { }
setLoad(92, 'ALMOST');
let framesDrawn = 0;
const reveal = () => { setLoad(100); G.ready = true; const l = document.getElementById('loader'); l.classList.add('done'); setTimeout(() => l.remove(), 800); };
let last = performance.now();
// safety net: an invalid number (NaN/Infinity) anywhere in the player, camera or clock would black out the screen.
// restore the last good state instantly and log the first occurrence so the cause can be found.
const lastGood = { p: new V3(), v: new V3(), ct: new V3(), ts: 0.05 };
window.__nanLog = [];
function finite3(v) { return Number.isFinite(v.x) && Number.isFinite(v.y) && Number.isFinite(v.z); }
function sanity(where) {
  const P = player;
  const bad = [];
  if (!finite3(P.p)) bad.push('p'); if (!finite3(P.v)) bad.push('v'); if (P.vo && !finite3(P.vo)) bad.push('vo');
  if (!finite3(cam.target)) bad.push('camTarget'); if (!Number.isFinite(G.ts)) bad.push('ts'); if (!Number.isFinite(P.facing)) bad.push('facing');
  if (!Number.isFinite(cam.lead || 0)) bad.push('lead');
  for (const k of ['x', 'y', 'z', 'lead']) if (!Number.isFinite(camVel[k])) { bad.push('camVel.' + k); camVel[k] = 0; }
  if (bad.length) {
    if (window.__nanLog.length < 5) window.__nanLog.push({ where, bad, state: G.state, level: G.level, pound: P.pound, long: P.long, wallT: P.wallT, wallN: P.wallN && P.wallN.toArray(), ground: P.ground && P.ground.type, flipT: P.flipT, airJumps: P.airJumps });
    console.warn('sanity restore', where, bad.join(','));
    if (bad.includes('p')) P.p.copy(lastGood.p); if (bad.includes('v')) P.v.set(0, 0, 0); if (bad.includes('vo')) P.vo.set(0, 0, 0);
    if (bad.includes('camTarget')) cam.target.copy(lastGood.ct); if (bad.includes('ts')) G.ts = lastGood.ts; if (bad.includes('facing')) P.facing = Math.PI / 2;
    if (bad.includes('lead')) cam.lead = 0;
  } else { lastGood.p.copy(P.p); lastGood.v.copy(P.v); lastGood.ct.copy(cam.target); lastGood.ts = G.ts; }
  for (const k of ['flash', 'white', 'punch', 'crack', 'shake']) if (!Number.isFinite(G[k])) G[k] = 0;
}
function frame(now) {
  requestAnimationFrame(frame);
  if (++framesDrawn === 4) (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(reveal);
  let dt = Math.min((now - last) / 1000, 0.05); last = now;
  G.time += dt; G.realDt = dt;

  if (G.state === 'story') updateStory(dt);
  if (G.state === 'replay') {
    if (G.rpT > 0.4 && (pressed.has('jump') || pressed.has('fire') || pressed.has('restart'))) endReplay();
    else updateReplay(dt);
  } else if (!G.paused) {
    if (pressed.has('restart') && (G.state === 'play' || G.state === 'dead')) { pressed.clear(); retry(); }
    if (G.state === 'dead') {
      G.deadT += dt;
      if (G.deadT > 0.5 && (pressed.has('jump') || pressed.has('restart'))) { pressed.clear(); retry(); }
      else if (G.deadT > 3.2) retry();
    }
    sanity('pre');
    updateTimeScale(dt); statTick(dt); updateLessons(dt);
    let pdt = dt;
    if (G.hitstop > 0) { G.hitstop -= dt; pdt = 0; }
    const wdt = pdt * G.ts;
    if (G.state === 'play') { G.levelTime += dt; G.totalTime += dt; }
    updateWorldBits(wdt, pdt);
    updatePlayer(pdt);
    if (G.state !== 'title') { updateEnemies(wdt, pdt); updateProjectiles(wdt); updateItems(wdt, pdt); updateShells(wdt); }
    else for (const e of world.enemies) { e.m.root.position.copy(e.p); e.m.root.rotation.y = e.head; }
    updateParts(wdt);
    if (G.state === 'play' || G.state === 'win') {
      REC.wt += wdt;
      if (REC.wt - REC.last >= REC.rate) { REC.last = REC.wt; recFrame(); }
    }
  }
  pressed.clear();
  sanity('post');
  updatePopups(dt); updateLabels(); updateTouchUI();
  if (G.state === 'title' && innerWidth > innerHeight) camera.setViewOffset(innerWidth, innerHeight, -innerWidth * 0.2, 0, innerWidth, innerHeight);
  else if (camera.view && camera.view.enabled) camera.clearViewOffset();
  if (G.state !== 'replay') { updateCamera(G.paused ? 0 : dt); updateOccluders(); }
  updateBlob();
  perfGuard(dt);
  updateHUD();
  updateMusic(dt);

  G.shake = Math.max(0, G.shake - dt * 1.8);
  G.flash = Math.max(0, G.flash - dt * 1.6);
  G.white = Math.max(0, G.white - dt * 2.2);
  G.punch = Math.max(0, G.punch - dt * 3.5);
  const u = fxPass.uniforms; u.uPunch.value = G.punch;
  if (G.state === 'dead' && G.crack > 0) G.crack = Math.min(1, G.crack + dt * 5); else G.crack = 0;
  u.uCrack.value = G.crack;
  u.uSlow.value = G.state === 'title' ? 0.4 : G.state === 'replay' ? 0.05 : 1 - G.ts; u.uTime.value = G.time; u.uFlash.value = G.flash; u.uWhite.value = G.white * 0.5;
  composer.render();
}
requestAnimationFrame(frame);
