try { for (const [f, w, u] of [["IBM Plex Mono", "500", "assets/fonts/IBMPlexMono-500.woff2"], ["IBM Plex Mono", "700", "assets/fonts/IBMPlexMono-700.woff2"], ["Special Elite", "400", "assets/fonts/SpecialElite-400.woff2"], ["VT323", "400", "assets/fonts/VT323-400.woff2"]]) { const ff = new FontFace(f, `url(${u})`, { weight: w }); document.fonts.add(ff); ff.load().catch(() => { }); } } catch (e) { }
import * as THREE from './lib/three/build/three.module.js';
import { EffectComposer } from './lib/three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from './lib/three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from './lib/three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from './lib/three/examples/jsm/postprocessing/ShaderPass.js';
import { OutputPass } from './lib/three/examples/jsm/postprocessing/OutputPass.js';
import { GLTFLoader } from './lib/three/examples/jsm/loaders/GLTFLoader.js';
import { clone as cloneSkinned } from './lib/three/examples/jsm/utils/SkeletonUtils.js';
import { OrbitControls } from './lib/three/examples/jsm/controls/OrbitControls.js';

const $ = id => document.getElementById(id);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const rand = (a, b) => a + Math.random() * (b - a);
const damp = (a, b, l, dt) => a + (b - a) * (1 - Math.exp(-l * dt));
const PERF_LOW = matchMedia('(pointer: coarse)').matches || /touch/.test(location.search);   // phones/tablets: cheaper rendering
let TOUCH = PERF_LOW || (matchMedia('(any-pointer: coarse)').matches && !matchMedia('(pointer: fine)').matches);   // which prompts/controls to show; flips on first touch or key press
const SHIFT = 90;
// five nights; each harder: the bear moves sooner and more often, the door gives you less time, quotas rise
const NIGHTS = [
  { quota: 35, start: 1e9, move: [7.5, 9.5], adv: 0.42, hold: 2.5, open: 5.0, gap: [15, 19], max: 2, life: 1.25 },
  { lureCD: 16, lurk: 4.2, quota: 45, start: 12, move: [5.5, 7.5], adv: 0.55, hold: 3.0, open: 4.2, gap: [13, 17], max: 3, life: 1.15 },
  { lureCD: 18, lurk: 3.8, quota: 50, start: 9, move: [5.5, 7.5], adv: 0.55, hold: 3.0, open: 3.6, gap: [12, 15], max: 3, life: 1.05 },
  { lureCD: 20, lurk: 3.4, quota: 45, start: 7, move: [6.0, 7.8], adv: 0.55, hold: 3.0, open: 3.4, gap: [11, 14], max: 4, life: 1.0 },
  { lureCD: 22, lurk: 3.2, quota: 45, start: 6, move: [5.6, 7.2], adv: 0.58, hold: 3.2, open: 3.3, gap: [10, 13], max: 4, life: 0.95, blackout: true },
];
const NIGHT_INFO = [
  { day: 'MONDAY', name: 'TRAINING', news: ['Make pizza', 'Lure Pepper away on the cameras', 'Hold the kitchen door shut'], tip: 'Follow the green arrow. It always points at what to do next.' },
  { day: 'TUESDAY', name: 'BURGERS', news: ['Burgers: grill a patty on the stove', 'Chop lettuce, stack it all on a bun'], tip: 'Patties burn if you leave them on the stove.' },
  { day: 'WEDNESDAY', name: "HE'S FASTER", news: ['Pepper moves faster tonight', 'He waits silently at the door first'], tip: 'He waits at the door quietly before he pushes. One camera check + jingle and he walks away.' },
  { day: 'THURSDAY', name: 'RUSH HOUR', news: ['Up to 4 tickets at once', 'Tickets expire faster'], tip: 'Start a pizza, then build a burger while it bakes.' },
  { day: 'FRIDAY', name: 'BLACKOUT', news: ['The power cuts out', 'No power = no cameras, no jingle. Listen.'], tip: 'In the dark, footsteps tell you where he is.' },
];
const starGoals = q => [q, Math.ceil(q * 1.4), Math.ceil(q * 1.8)];
const STORY = [
  ["Hey, hey! Welcome to Pepper's Pizza Palace. I'm the manager.", "Night shift is easy. Cook what's on the tickets, ring the bell, collect tips.", "Oh, and Pepper, our mascot bear, has a, uh, free-roaming mode at night.", "If he knocks on the kitchen door... just hold it shut. Ha. Ha.", "Make your quota and you've got a job tomorrow. Good luck!"],
  ["Night two! You made it. See? Told you it was easy.", "Pepper's been a little more... active. When you hear footsteps, check the cameras.", "Burgers sell great after midnight. Don't ask me why."],
  ["Okay so, the last cook didn't make his quota.", "We found his hat. Just the hat. Anyway!", "Don't let food burn. The smell gets Pepper... excited."],
  ["Corporate says Pepper's motion sensors are 'working as intended'.", "I've stopped asking what that means.", "He's faster tonight. Keep your eyes on that monitor."],
  ["Last night of the week. Corporate visits tomorrow.", "The power's been flickering. If the lights go out, keep cooking. And listen.", "Whatever happens... don't let him in. Bye!"],
];
const ENDING = ["...Hello? Hello? You're still there?", "Wow. Five nights. Nobody's made it five nights.", "Corporate wants to make you Employee of the Month.", "Pepper wants to make you... dinner. Ha. Ha. See you Monday!"];
const SAVE_KEY = 'nightshift-save';
const save = (() => { try { return JSON.parse(localStorage.getItem(SAVE_KEY)) || { unlocked: 0, stars: [] }; } catch (e) { return { unlocked: 0, stars: [] }; } })();
const writeSave = () => { try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); } catch (e) { } };

// =====================================================================
// RENDERER / SCENE
// =====================================================================
let renderer;
try { renderer = new THREE.WebGLRenderer({ antialias: !PERF_LOW, powerPreference: 'high-performance' }); }
catch (e) {
  document.getElementById('loader').innerHTML = '<div class="logo" style="font-size:54px">NIGHT<br><span class="r">SHIFT</span></div><div class="lt" style="animation:none;opacity:.8;max-width:460px;text-align:center;line-height:1.8;letter-spacing:.15em">THIS BROWSER COULD NOT START 3D GRAPHICS (WEBGL).<br>TURN ON HARDWARE ACCELERATION IN SETTINGS, OR TRY CHROME, SAFARI OR FIREFOX.</div>';
  throw e;
}
renderer.setPixelRatio(Math.min(devicePixelRatio, PERF_LOW ? 1.5 : 2));
const VW = () => Math.max(2, innerWidth || document.documentElement.clientWidth || 2), VH = () => Math.max(2, innerHeight || document.documentElement.clientHeight || 2);   // embeds (Rosebud iframe) can start at 0×0
renderer.setSize(VW(), VH());
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.15;
document.body.prepend(renderer.domElement);
renderer.domElement.addEventListener('webglcontextlost', e => { e.preventDefault(); if (G.state === 'play' && !G.paused) pauseGame(true); });
renderer.domElement.addEventListener('webglcontextrestored', () => location.reload());
const scene = new THREE.Scene(); scene.background = new THREE.Color('#020203'); scene.fog = new THREE.Fog('#020203', 14, 30);
const camera = new THREE.PerspectiveCamera(42, innerWidth / innerHeight, 0.1, 200);
let camZoom = 0, camX = 6.5, camZ = 3.7;
function fitCamera() {
  camera.aspect = VW() / VH();
  try { const o = G.camOverride; if (o) { const k = clamp((performance.now() - o.t0) / (o.dur || 1), 0, 1), e = k * k * (3 - 2 * k);   // trailer shots (debug only)
    camera.fov = o.fov || 40; camera.position.set(...o.from.map((v, i) => v + (o.to[i] - v) * e)); camera.lookAt(...o.look); camera.updateProjectionMatrix(); return; } } catch (e) { }
  const portrait = innerHeight > innerWidth;
  camera.fov = portrait ? 66 : 42;
  // closer, follows the cook sideways so stations and food read at phone size; title/scare keep the wide shot
  let close = 0, px = 6.5, pz = 4.5, hero = 0; try { hero = G.hero || 0; close = G.state === 'play' || G.state === 'over' ? (G.bear.stage === 4 || G.bear.inside ? 0.25 : 1) : 0; px = player.x; pz = player.z; } catch (e) { } // G/player not declared yet on first call
  camZoom = damp(camZoom, close, close < camZoom ? 5 : 2, 1 / 60);
  const k = (portrait ? 1.0 : clamp(1.62 / camera.aspect, 1, 1.32)) * (1 - camZoom * (portrait ? 0.12 : 0.16)) * (1 - hero * 0.55);   // hero: trailer close-up (debug only)
  camX = damp(camX, 6.5 + (clamp(px, 2.5, 10.5) - 6.5) * (hero ? 1 : camZoom * (portrait ? 0.85 : 0.45)), 4, 1 / 60);
  camZ = damp(camZ, hero ? pz - 0.2 : 3.7 + (clamp(pz, 1.5, 5) - 3.4) * camZoom * 0.2, 4, 1 / 60);
  const steep = camZoom; camera.position.set(camX, (9.2 + steep * 2.6) * k, camZ + (10.3 - steep * 2.4) * k); camera.lookAt(camX, 0.4, camZ - steep * 0.25 + (portrait ? 0.5 : 0)); camera.updateProjectionMatrix();
}
fitCamera();

// ---------- post: grain, heavy vignette, chromatic fringe, sickly grade, bloom on emissives (desktop)
const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera); composer.addPass(renderPass);
const bloom = new UnrealBloomPass(new THREE.Vector2(VW(), VH()), 0.55, 0.6, 0.72);
if (!PERF_LOW) composer.addPass(bloom);
composer.addPass(new OutputPass());
const gradePass = new ShaderPass({
  uniforms: { tDiffuse: { value: null }, t: { value: 0 }, fear: { value: 0 }, flash: { value: 0 }, res: { value: new THREE.Vector2(VW(), VH()) } },
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }',
  fragmentShader: `uniform sampler2D tDiffuse; uniform float t, fear, flash; uniform vec2 res; varying vec2 vUv;
    float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233))) * 43758.5453); }
    void main(){
      vec2 uv = vUv, c = uv - .5; float r = length(c);
      float ab = .0015 + fear * .006;
      vec3 col = vec3(texture2D(tDiffuse, uv + c * ab).r, texture2D(tDiffuse, uv).g, texture2D(tDiffuse, uv - c * ab).b);
      float l = dot(col, vec3(.3,.59,.11));
      col = mix(vec3(l), col, .62);                                   // drained color
      col *= mix(vec3(.82,.95,1.0), vec3(1.08,1.0,.82), smoothstep(.05,.6,l));   // teal shadows, sodium highlights
      col *= 1. - smoothstep(.28, .85, r) * (.82 + fear * .1);          // heavy vignette
      col += (h(uv * res + fract(t) * 91.) - .5) * (.075 + fear * .05);  // film grain
      col *= .96 + .04 * sin(uv.y * res.y * 1.2 + t * 2.);
      col = mix(col, vec3(1.,.95,.9), flash);
      gl_FragColor = vec4(col, 1.);
    }` });
composer.addPass(gradePass);
let lastW = 0, lastH = 0;
function onResize() { const w = VW(), h = VH(); if (w === lastW && h === lastH) return; lastW = w; lastH = h;
  renderer.setSize(w, h); composer.setSize(w, h); gradePass.uniforms.res.value.set(w, h); fitCamera(); try { sizeStatic(); } catch (e) { } }
addEventListener('resize', onResize);
try { new ResizeObserver(onResize).observe(document.documentElement); } catch (e) { }

// ---------- lights: almost nothing ambient; pools of light only
const hemi = new THREE.HemisphereLight('#4a5a78', '#120a08', 0.55); scene.add(hemi);
const tube = new THREE.SpotLight('#e8f0d0', 85, 16, 0.95, 0.8, 1.7); tube.position.set(6.2, 6.2, 3.3); tube.target.position.set(6.2, 0, 3.3);
tube.castShadow = true; tube.shadow.mapSize.set(PERF_LOW ? 1024 : 2048, PERF_LOW ? 1024 : 2048); tube.shadow.bias = -0.0006; scene.add(tube, tube.target);
const workLight = new THREE.SpotLight('#ffd9a0', 60, 10, 1.1, 0.8, 1.5); workLight.position.set(5, 3.3, 2.4); workLight.target.position.set(5, 0.9, 0.3); scene.add(workLight, workLight.target);
const stoveGlow = new THREE.PointLight('#ff6a1a', 0, 5, 1.6); stoveGlow.position.set(6.5, 1.5, 1.1); scene.add(stoveGlow);
const doorLight = new THREE.PointLight('#ff1a12', 0, 6, 1.3); doorLight.position.set(12, 2.4, 3.5); scene.add(doorLight);
const fillL = new THREE.PointLight('#c8a070', 16, 6, 1.3); fillL.position.set(1.5, 2.6, 3.0); scene.add(fillL);
const exitGlow = new THREE.PointLight('#ff2a1a', 3.5, 3.5, 1.5); exitGlow.position.set(12.4, 3, 3.5); scene.add(exitGlow);

// =====================================================================
// PROCEDURAL GRIME TEXTURES
// =====================================================================
function tex(w, h, draw, rep = [1, 1]) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); draw(x, w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...rep); t.anisotropy = 8; return t;
}
function grime(x, w, h, n = 60, a = 0.18, col = '20,14,8') {
  for (let i = 0; i < n; i++) { const r = Math.random() * w * 0.18 + 6, gx = Math.random() * w, gy = Math.random() * h;
    const g = x.createRadialGradient(gx, gy, 0, gx, gy, r); g.addColorStop(0, `rgba(${col},${a * Math.random()})`); g.addColorStop(1, `rgba(${col},0)`); x.fillStyle = g; x.fillRect(gx - r, gy - r, r * 2, r * 2); }
  const im = x.getImageData(0, 0, w, h), d = im.data; for (let i = 0; i < d.length; i += 4) { const nz = (Math.random() - 0.5) * 18; d[i] += nz; d[i + 1] += nz; d[i + 2] += nz; } x.putImageData(im, 0, 0);
}
const T = {
  floor: tex(512, 512, (x, w, h) => { const n = 4, s = w / n;
    for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) { x.fillStyle = (i + j) % 2 ? '#857f72' : '#121212'; x.fillRect(i * s, j * s, s, s); }
    x.strokeStyle = 'rgba(60,55,45,.8)'; x.lineWidth = 3; for (let i = 0; i <= n; i++) { x.beginPath(); x.moveTo(i * s, 0); x.lineTo(i * s, h); x.stroke(); x.beginPath(); x.moveTo(0, i * s); x.lineTo(w, i * s); x.stroke(); }
    grime(x, w, h, 90, 0.35); for (let i = 0; i < 6; i++) { x.fillStyle = `rgba(70,10,8,${Math.random() * 0.25})`; x.beginPath(); x.ellipse(Math.random() * w, Math.random() * h, 8 + Math.random() * 20, 5 + Math.random() * 10, Math.random() * 3, 0, 7); x.fill(); } }, [13 / 4, 7 / 4]),
  wall: tex(512, 512, (x, w, h) => {
    x.fillStyle = '#3c3a33'; x.fillRect(0, 0, w, h * 0.55);                       // stained plaster
    x.fillStyle = '#c9c4b2'; x.fillRect(0, h * 0.55, w, h * 0.45);               // tile wainscot
    x.strokeStyle = 'rgba(40,36,30,.7)'; x.lineWidth = 2; for (let yy = h * 0.55; yy < h; yy += 28) { x.beginPath(); x.moveTo(0, yy); x.lineTo(w, yy); x.stroke(); } for (let xx = 0; xx < w; xx += 28) { x.beginPath(); x.moveTo(xx, h * 0.55); x.lineTo(xx, h); x.stroke(); }
    x.fillStyle = '#6e1712'; x.fillRect(0, h * 0.53, w, 14);                     // red stripe
    grime(x, w, h, 120, 0.4); for (let i = 0; i < 14; i++) { x.fillStyle = `rgba(20,14,6,${0.15 + Math.random() * 0.25})`; const sx = Math.random() * w; x.fillRect(sx, h * 0.3, 2 + Math.random() * 3, h * (0.2 + Math.random() * 0.5)); } }, [3, 1]),
  steel: tex(256, 256, (x, w, h) => { const g = x.createLinearGradient(0, 0, w, 0); g.addColorStop(0, '#7d8288'); g.addColorStop(0.5, '#9aa0a6'); g.addColorStop(1, '#73787e'); x.fillStyle = g; x.fillRect(0, 0, w, h);
    x.strokeStyle = 'rgba(255,255,255,.08)'; for (let i = 0; i < 120; i++) { x.beginPath(); const yy = Math.random() * h; x.moveTo(0, yy); x.lineTo(w, yy + Math.random() * 6 - 3); x.stroke(); } grime(x, w, h, 40, 0.35, '40,26,10'); }),
  steelTop: tex(256, 256, (x, w, h) => { x.fillStyle = '#a7acb0'; x.fillRect(0, 0, w, h); x.strokeStyle = 'rgba(0,0,0,.12)'; for (let i = 0; i < 80; i++) { x.beginPath(); x.moveTo(Math.random() * w, Math.random() * h); x.lineTo(Math.random() * w, Math.random() * h); x.stroke(); } grime(x, w, h, 30, 0.3, '50,30,10'); }),
  rust: tex(256, 256, (x, w, h) => { x.fillStyle = '#2c2e31'; x.fillRect(0, 0, w, h); grime(x, w, h, 80, 0.5, '90,40,15'); }),
  door: tex(256, 512, (x, w, h) => { x.fillStyle = '#4a4f55'; x.fillRect(0, 0, w, h); x.fillStyle = '#3a3e43'; x.fillRect(14, 14, w - 28, h - 28);
    x.fillStyle = '#1b1c1e'; for (const yy of [30, h - 30]) for (const xx of [30, w - 30]) { x.beginPath(); x.arc(xx, yy, 6, 0, 7); x.fill(); }
    x.fillStyle = '#b8a64a'; x.fillRect(30, h * 0.52, w - 60, 46); x.fillStyle = '#111'; x.font = 'bold 30px monospace'; x.textAlign = 'center'; x.fillText('STAFF ONLY', w / 2, h * 0.52 + 33);
    grime(x, w, h, 70, 0.5, '60,30,10'); x.strokeStyle = 'rgba(0,0,0,.6)'; x.lineWidth = 3; for (let i = 0; i < 9; i++) { x.beginPath(); const sx = w * 0.3 + Math.random() * w * 0.4, sy = h * 0.6 + Math.random() * h * 0.2; x.moveTo(sx, sy); x.lineTo(sx + Math.random() * 30 - 15, sy + 30 + Math.random() * 40); x.stroke(); } }),
  poster: tex(256, 384, (x, w, h) => { x.fillStyle = '#e8d9a8'; x.fillRect(0, 0, w, h); x.fillStyle = '#7a1710'; x.fillRect(0, 0, w, 70);
    x.fillStyle = '#efe4c4'; x.font = 'bold 50px Georgia'; x.textAlign = 'center'; x.fillText('SMILE!', w / 2, 52);
    x.fillStyle = '#5b3a22'; x.beginPath(); x.arc(w / 2, 200, 78, 0, 7); x.fill(); for (const s of [-1, 1]) { x.beginPath(); x.arc(w / 2 + s * 62, 135, 26, 0, 7); x.fill(); }
    x.fillStyle = '#0a0a0a'; for (const s of [-1, 1]) { x.beginPath(); x.arc(w / 2 + s * 28, 185, 15, 0, 7); x.fill(); } x.fillStyle = '#fff'; for (const s of [-1, 1]) x.fillRect(w / 2 + s * 28 - 2, 183, 4, 4);
    x.fillStyle = '#c9a77a'; x.beginPath(); x.ellipse(w / 2, 228, 40, 28, 0, 0, 7); x.fill(); x.fillStyle = '#111'; for (let i = -2; i <= 2; i++) x.fillRect(w / 2 + i * 12 - 4, 240, 8, 12);
    x.fillStyle = '#7a1710'; x.font = 'bold 22px Georgia'; x.fillText("PEPPER'S PIZZA", w / 2, 320); x.font = 'italic 16px Georgia'; x.fillText('where fun never ends', w / 2, 345);
    grime(x, w, h, 50, 0.5, '60,40,10'); x.fillStyle = 'rgba(0,0,0,.5)'; x.beginPath(); x.moveTo(w, 0); x.lineTo(w - 50, 0); x.lineTo(w, 60); x.fill(); }),
  exit: tex(128, 48, (x, w, h) => { x.fillStyle = '#300'; x.fillRect(0, 0, w, h); x.fillStyle = '#ff3b2a'; x.font = 'bold 34px sans-serif'; x.textAlign = 'center'; x.fillText('EXIT', w / 2, 37); }),
};
// counter variety: 5 differently-worn steel skins + varied cabinet fronts, so the counter run doesn't read as one tile repeated
const steelSkin = (seed, tint) => tex(256, 256, (x, w, h) => { const g = x.createLinearGradient(0, 0, w, 0); g.addColorStop(0, tint[0]); g.addColorStop(0.5, tint[1]); g.addColorStop(1, tint[0]); x.fillStyle = g; x.fillRect(0, 0, w, h);
  x.strokeStyle = 'rgba(255,255,255,.07)'; for (let i = 0; i < 90; i++) { x.beginPath(); const yy = Math.random() * h; x.moveTo(0, yy); x.lineTo(w, yy + Math.random() * 6 - 3); x.stroke(); }
  grime(x, w, h, 20 + seed * 14, 0.25 + seed * 0.07, seed % 2 ? '40,26,10' : '24,20,16');
  if (seed > 1) for (let i = 0; i < seed * 3; i++) { x.fillStyle = `rgba(30,18,8,${0.15 + Math.random() * 0.2})`; const sx = Math.random() * w; x.fillRect(sx, Math.random() * h * 0.4, 2 + Math.random() * 4, h * (0.2 + Math.random() * 0.5)); }   // drips
  if (seed === 4) { x.fillStyle = 'rgba(200,200,190,.5)'; x.fillRect(w * 0.1, h * 0.7, w * 0.3, h * 0.12); x.fillStyle = '#222'; x.font = 'bold 18px monospace'; x.fillText('NO. 4', w * 0.12, h * 0.8); } });
const SIDE_V = [['#6f747a', '#8a9096'], ['#7a7a74', '#93918a'], ['#666a70', '#80868c'], ['#74716a', '#8e8a82'], ['#6c7076', '#868b90']].map((t, i) => new THREE.MeshStandardMaterial({ map: steelSkin(i, t), roughness: 0.45 + i * 0.05, metalness: 0.55 }));
const TOP_V = [0, 1, 2].map(i => { const m = new THREE.MeshStandardMaterial({ map: T.steelTop.clone(), roughness: 0.3 + i * 0.08, metalness: 0.65 }); m.map.offset.set(Math.random(), Math.random()); m.map.rotation = i * 1.3; m.map.needsUpdate = true; return m; });
const darkM = new THREE.MeshStandardMaterial({ color: '#0d0d0f', roughness: 1 }), panelM = SIDE_V.map(m => m);
function cabinetFront(g, x, z, v) {
  // which side faces the floor?
  const open = (dx, dz) => { const X = x + dx, Z = z + dz; return X >= 1 && X <= 11 && Z >= 1 && Z <= LAYOUT.length - 2 && LAYOUT[Z][X] === '.'; };
  for (const [dx, dz] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
    if (!open(dx, dz)) continue;
    const f = new THREE.Group(); f.rotation.y = Math.atan2(dx, dz); f.position.set(dx * 0.495, 0, dz * 0.495); g.add(f);
    const pan = (w, h, px, py, m = panelM[(v + 2) % 5]) => box(w, h, 0.02, m, px, py, 0.012, f);
    const handle = (w, px, py, vert) => box(vert ? 0.025 : w, vert ? w : 0.025, 0.03, M.metal, px, py, 0.035, f);
    const kind = (v + x * 3 + z) % 6;
    if (kind === 0) { pan(0.44, 0.66, -0.23, 0.42); pan(0.44, 0.66, 0.23, 0.42); handle(0.16, -0.05, 0.5, true); handle(0.16, 0.05, 0.5, true); }
    else if (kind === 1) { for (let k = 0; k < 3; k++) { pan(0.9, 0.2, 0, 0.18 + k * 0.23); handle(0.22, 0, 0.22 + k * 0.23); } }
    else if (kind === 2) { pan(0.9, 0.66, 0, 0.42, darkM); box(0.9, 0.03, 0.3, M.metal, 0, 0.36, -0.14, f);   // open shelf with pots
      cyl(0.13, 0.12, 0.16, M.metal, -0.22, 0.46, -0.15, f, 12); cyl(0.11, 0.11, 0.1, M.pipe, 0.18, 0.43, -0.15, f, 12); box(0.24, 0.16, 0.2, M.crate, 0.2, 0.13, -0.15, f); }
    else if (kind === 3) { pan(0.9, 0.18, 0, 0.7); handle(0.2, 0, 0.72); pan(0.9, 0.46, 0, 0.3); handle(0.16, 0.36, 0.38, true); }
    else if (kind === 4) { pan(0.9, 0.66, 0, 0.42); for (let k = 0; k < 6; k++) box(0.6, 0.015, 0.02, darkM, 0, 0.24 + k * 0.06, 0.03, f); }
    else { pan(0.44, 0.66, -0.23, 0.42); box(0.44, 0.66, 0.02, darkM, 0.23, 0.42, 0.005, f); handle(0.16, -0.05, 0.5, true); }   // a door is missing
    box(0.98, 0.07, 0.03, darkM, 0, 0.035, 0.0, f);   // kick plate
  }
}
function crateTex(label) { return tex(256, 128, (x, w, h) => { x.fillStyle = '#6b5236'; x.fillRect(0, 0, w, h); x.fillStyle = '#5b4429'; for (let i = 0; i < 4; i++) x.fillRect(0, i * 32 + 28, w, 4);
  x.fillStyle = 'rgba(15,10,6,.85)'; x.font = 'bold 36px monospace'; x.textAlign = 'center'; x.fillText(label, w / 2, 78); grime(x, w, h, 30, 0.4); }); }

// =====================================================================
// MATERIALS / MESH HELPERS
// =====================================================================
const mat = (c, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.75, ...o });
const M = {
  floor: new THREE.MeshStandardMaterial({ map: T.floor, roughness: 0.55, metalness: 0.05 }), wall: new THREE.MeshStandardMaterial({ map: T.wall, roughness: 0.9 }),
  counter: new THREE.MeshStandardMaterial({ map: T.steelTop, roughness: 0.35, metalness: 0.65 }), counterSide: new THREE.MeshStandardMaterial({ map: T.steel, roughness: 0.45, metalness: 0.6 }),
  crate: mat('#6b5236'), board: mat('#a07a4c', { roughness: 0.85 }), oven: new THREE.MeshStandardMaterial({ map: T.rust, metalness: 0.5, roughness: 0.5 }), ovenWin: mat('#ff8a3a', { emissive: '#ff5a1a', emissiveIntensity: 0 }),
  stove: new THREE.MeshStandardMaterial({ map: T.rust, metalness: 0.5, roughness: 0.6 }), plateS: mat('#d8d6cf', { roughness: 0.3 }), trash: mat('#252b25', { roughness: 0.6, metalness: 0.4 }),
  serve: mat('#7a6a3a', { roughness: 0.4, metalness: 0.5 }),
  door: new THREE.MeshStandardMaterial({ map: T.door, metalness: 0.55, roughness: 0.5 }), doorWin: new THREE.MeshBasicMaterial({ color: '#020203' }),
  chef: mat('#6f7378'), chefHat: mat('#d9d6cc'), skin: mat('#d8b08e'), apron: mat('#8a8070'), pants: mat('#1c1d22'),
  dough: mat('#e6d2a2'), tomato: mat('#b8281e', { roughness: 0.4 }), cheese: mat('#e8bf3a'), bun: mat('#b8803e'), pattyRaw: mat('#c76f6f'), pattyCook: mat('#4f2b18'), burnt: mat('#0e0c0a'),
  lettuce: mat('#4f9a3e'), crust: mat('#c88a3c'), sauce: mat('#9a1f18'), melt: mat('#f0cf62'),
  bearFur: mat('#4a2c19', { roughness: 0.95 }), bearLight: mat('#7a5a3c', { roughness: 0.95 }), bearDark: new THREE.MeshBasicMaterial({ color: '#000000' }),
  eye: new THREE.MeshBasicMaterial({ color: '#ffffff' }), eyeRed: new THREE.MeshBasicMaterial({ color: '#ff2a2a' }), hatBlack: mat('#0d0d10'),
  metal: mat('#8a9096', { metalness: 0.85, roughness: 0.35 }), endo: mat('#5a5e63', { metalness: 0.9, roughness: 0.4 }), teeth: mat('#cfc6a8', { roughness: 0.5 }),
  wire: mat('#1a1a1a'), bow: mat('#140c0a'), hatStain: mat('#bfb49a', { roughness: 0.9 }),
  pipe: mat('#3a3d40', { metalness: 0.7, roughness: 0.5 }), exit: new THREE.MeshBasicMaterial({ map: T.exit }), poster: new THREE.MeshStandardMaterial({ map: T.poster, roughness: 0.95 }),
};
M.eye.toneMapped = false; M.eyeRed.toneMapped = false;
const box = (w, h, d, m, x = 0, y = 0, z = 0, p) => { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.position.set(x, y, z); o.castShadow = o.receiveShadow = true; if (p) p.add(o); return o; };
const cyl = (r1, r2, h, m, x = 0, y = 0, z = 0, p, seg = 16) => { const o = new THREE.Mesh(new THREE.CylinderGeometry(r1, r2, h, seg), m); o.position.set(x, y, z); o.castShadow = o.receiveShadow = true; if (p) p.add(o); return o; };
const sph = (r, m, x = 0, y = 0, z = 0, p, s = 12) => { const o = new THREE.Mesh(new THREE.SphereGeometry(r, s, Math.max(6, s * 0.7 | 0)), m); o.position.set(x, y, z); o.castShadow = true; if (p) p.add(o); return o; };

// =====================================================================
// KITCHEN LAYOUT — 13 × 9 tiles; walls are counters/stations, floor is x1..11, z1..7
// =====================================================================
const LAYOUT = [
  'kDTCcOScPBpLk',
  'c...........c',
  'b...........c',
  'b...iii.....d',
  'c...........c',
  't...........c',
  'cccccvccccccc',
];
const KIND = { k: 'counter', c: 'counter', i: 'counter', D: 'crate:dough', T: 'crate:tomato', C: 'crate:cheese', B: 'crate:bun', p: 'crate:patty', L: 'crate:lettuce',
  O: 'oven', S: 'stove', P: 'plates', b: 'board', t: 'trash', v: 'serve', d: 'door' };
const LABEL = { dough: 'DOUGH', tomato: 'TOMATO', cheese: 'CHEESE', bun: 'BUNS', patty: 'BEEF', lettuce: 'LETTUCE' };
const tiles = {};
const key = (x, z) => x + ',' + z;
const kitchen = new THREE.Group(); scene.add(kitchen);
function plane(w, h, m, x, y, z, ry = 0, p = kitchen) { const o = new THREE.Mesh(new THREE.PlaneGeometry(w, h), m); o.position.set(x, y, z); o.rotation.y = ry; o.receiveShadow = true; p.add(o); return o; }
function buildKitchen() {
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(13, 7), M.floor); fl.rotation.x = -Math.PI / 2; fl.position.set(6.5, 0, 3.5); fl.receiveShadow = true; kitchen.add(fl);
  const wallBack = M.wall.clone(); wallBack.map = T.wall.clone(); wallBack.map.repeat.set(4, 1); wallBack.map.needsUpdate = true;
  box(13, 3.6, 0.3, wallBack, 6.5, 1.8, -0.15, kitchen); box(0.3, 3.6, 7, M.wall, -0.15, 1.8, 3.5, kitchen);
  box(0.3, 3.6, 3, M.wall, 13.15, 1.8, 1.5, kitchen); box(0.3, 3.6, 3, M.wall, 13.15, 1.8, 5.5, kitchen); box(0.3, 1.3, 1, M.wall, 13.15, 2.95, 3.5, kitchen);
  // pipes + vents along the ceiling line, a dead clock, peeling posters, EXIT sign
  for (const [y, z] of [[3.25, 0.12], [3.05, 0.2]]) { const pp = cyl(0.06, 0.06, 13, M.pipe, 6.5, y, z, kitchen, 8); pp.rotation.z = Math.PI / 2; }
  const pv = cyl(0.07, 0.07, 3.2, M.pipe, 12.85, 1.7, 0.25, kitchen, 8);
  box(0.9, 0.4, 0.06, M.hatBlack, 9.4, 2.9, 0.03, kitchen);
  for (const [x, ry, z] of [[9.6, 0, 0.02], [11.2, 0, 0.02]]) { const ps = plane(0.8, 1.2, M.poster, x, 2.05, z + 0.01, ry); ps.rotation.z = rand(-0.08, 0.08); }
  const side = plane(0.8, 1.2, M.poster, 0.02, 2.0, 5.0, Math.PI / 2); side.rotation.z = 0.06;
  const ex = plane(0.7, 0.26, M.exit, 12.98, 3.1, 3.5, -Math.PI / 2);
  for (let z = 0; z < LAYOUT.length; z++) for (let x = 0; x < 13; x++) {
    const ch = LAYOUT[z][x]; if (ch === '.') continue;
    const kind = KIND[ch], t = { kind, x, z, item: null, progress: 0, cook: 0 }; tiles[key(x, z)] = t;
    const cx = x + 0.5, cz = z + 0.5;
    if (kind === 'door') { buildDoor(t); continue; }
    const g = new THREE.Group(); g.position.set(cx, 0, cz); kitchen.add(g); t.mesh = g;
    const vi = (x * 7 + z * 13) % 5; box(0.98, 0.86, 0.98, SIDE_V[vi], 0, 0.43, 0, g); box(1, 0.06, 1, TOP_V[(x + z) % 3], 0, 0.89, 0, g);
    if (kind !== 'trash') cabinetFront(g, x, z, vi);
    t.top = 0.92; const n0 = g.children.length;
    if (kind.startsWith('crate:')) {
      const ing = kind.slice(6), ct = new THREE.MeshStandardMaterial({ map: crateTex(LABEL[ing]), roughness: 0.9 });
      const cr = box(0.84, 0.4, 0.84, [M.crate, M.crate, M.crate, M.crate, ct, M.crate], 0, 1.12, 0, g); t.top = 1.32;
      cr.rotation.y = rand(-0.08, 0.08);
      for (let i = 0; i < 2; i++) { const ic = makeItem({ type: ing, state: 'raw' }); ic.scale.setScalar(0.8); ic.position.set(-0.17 + i * 0.32, 1.32, rand(-0.12, 0.12)); g.add(ic); }
    } else if (kind === 'board') { const bd = box(0.7, 0.05, 0.55, M.board, 0, 0.94, 0, g); bd.rotation.y = rand(-0.1, 0.1); t.top = 0.97; const kn = box(0.04, 0.02, 0.32, M.metal, 0.3, 0.98, 0.16, g); kn.rotation.y = 0.5; }
    else if (kind === 'oven') {
      box(0.96, 1.14, 0.96, M.oven, 0, 0.57, 0, g); t.ovenWin = box(0.58, 0.34, 0.02, M.ovenWin.clone(), 0, 0.55, 0.49, g); box(0.7, 0.04, 0.04, M.metal, 0, 0.82, 0.5, g);
      box(0.96, 0.06, 0.96, M.counter, 0, 1.15, 0, g); t.top = 1.18;
    } else if (kind === 'stove') { box(0.96, 0.1, 0.96, M.stove, 0, 0.94, 0, g); t.ring = cyl(0.3, 0.3, 0.02, new THREE.MeshBasicMaterial({ color: '#160a06' }), 0, 1.0, 0, g, 24); t.top = 1.02; }
    else if (kind === 'plates') { for (let i = 0; i < 5; i++) cyl(0.3, 0.25, 0.035, M.plateS, rand(-0.02, 0.02), 0.94 + i * 0.04, rand(-0.02, 0.02), g, 18); t.top = 1.15; }
    else if (kind === 'trash') { cyl(0.36, 0.3, 0.9, M.trash, 0, 0.45, 0, g, 12); box(0.98, 0.02, 0.98, M.trash, 0, 0.9, 0, g); const bag = sph(0.28, mat('#111', { roughness: 0.3 }), 0.05, 0.98, 0, g, 8); bag.scale.y = 0.5; }
    else if (kind === 'serve') {
      box(1, 0.06, 1, M.serve, 0, 0.91, 0, g); t.top = 0.95;
      const bell = new THREE.Group(); bell.position.set(0.28, 0.95, 0.28); g.add(bell); const bl = sph(0.09, mat('#b89a4a', { metalness: 0.9, roughness: 0.25 }), 0, 0.05, 0, bell, 12); bl.scale.y = 0.7; cyl(0.11, 0.11, 0.02, M.metal, 0, 0.01, 0, bell);
      const pass = box(1, 0.06, 0.4, M.metal, 0, 1.75, 0.3, g); const lampS = new THREE.PointLight('#ffcf7a', 7, 3.2, 1.4); lampS.position.set(0, 1.7, -0.3); g.add(lampS); bell.userData.bell = true;
    }
    t.parts = g.children.slice(n0);   // the boxy station pieces, swapped for Tripo props once props.glb loads
  }
  // security monitor: a boxy CRT on a wall bracket
  const mon = new THREE.Group(); mon.position.set(3.2, 2.42, 0.4); mon.rotation.x = 0.12; kitchen.add(mon);
  box(1.9, 1.35, 0.9, mat('#1a1a1c', { roughness: 0.6 }), 0, 0, -0.2, mon);
  monitorScreen = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1.08), screenMat); monitorScreen.position.z = 0.26; mon.add(monitorScreen);
  box(0.1, 0.1, 0.5, M.pipe, 0, 0.8, -0.4, mon);
  const lamp = new THREE.PointLight('#9ad0a0', 2.2, 3.6, 1.5); lamp.position.set(0, -0.2, 1); mon.add(lamp); monitorLamp = lamp;
  // stove hood
  const hood = box(1.9, 0.5, 0.95, new THREE.MeshStandardMaterial({ map: T.steel, metalness: 0.6, roughness: 0.5 }), 5.9, 2.9, 0.47, kitchen);
  wallClock = new THREE.Group(); wallClock.position.set(7.9, 2.6, 0.03); kitchen.add(wallClock);
  cyl(0.28, 0.28, 0.05, mat('#e8e2d0'), 0, 0, 0, wallClock, 20).rotation.x = Math.PI / 2;
  const hand = box(0.03, 0.2, 0.02, M.hatBlack, 0, 0.09, 0.04, wallClock); wallClock.userData.hand = hand;
}
function buildDoor(t) {
  const g = new THREE.Group(); g.position.set(13.0, 0, 3.0); kitchen.add(g); t.mesh = g;
  const panel = new THREE.Group(); g.add(panel); t.panel = panel;
  box(0.12, 2.5, 1.0, M.door, 0, 1.25, 0.5, panel);
  const win = cyl(0.17, 0.17, 0.14, M.doorWin, 0, 1.85, 0.5, panel, 20); win.rotation.z = Math.PI / 2; t.win = win;
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.03, 8, 20), M.metal); rim.position.set(-0.08, 1.85, 0.5); rim.rotation.y = Math.PI / 2; panel.add(rim);
  t.eyes = new THREE.Group(); t.eyes.position.set(0.09, 1.86, 0.5); panel.add(t.eyes);
  for (const s of [-1, 1]) { const e = sph(0.034, M.eye, 0, 0, s * 0.08, t.eyes, 8); e.castShadow = false; }
  t.eyes.visible = false;
  box(0.08, 0.05, 0.3, M.metal, -0.09, 1.1, 0.82, panel); box(0.06, 0.12, 0.06, M.metal, -0.09, 1.1, 0.95, panel);
  t.top = 1;
}

// =====================================================================
// ITEMS
// =====================================================================
const PIZZA = ['dough', 'tomato', 'cheese'], BURGER = ['bun', 'patty', 'lettuce'];
function makeItem(it) { return PROP.ready ? makeItemModel(it) : makeItemProc(it); }
function makeItemProc(it) {
  const g = new THREE.Group();
  const Ty = it.type, st = it.state;
  if (Ty === 'plate') {
    cyl(0.32, 0.26, 0.04, M.plateS, 0, 0.02, 0, g, 20);
    const c = it.contents;
    if (c.has('dough')) {
      const burnt = it.pizza === 2, cooked = it.pizza === 1;
      cyl(0.29, 0.29, 0.05, burnt ? M.burnt : cooked ? M.crust : M.dough, 0, 0.07, 0, g, 20);
      if (c.has('tomato')) cyl(0.24, 0.24, 0.02, burnt ? M.burnt : M.sauce, 0, 0.105, 0, g, 20);
      if (c.has('cheese')) for (let i = 0; i < 7; i++) { const a = i / 7 * 6.28; box(0.08, 0.02, 0.08, burnt ? M.burnt : cooked ? M.melt : M.cheese, Math.cos(a) * 0.14, 0.125, Math.sin(a) * 0.14, g); }
    } else {
      let y = 0.05;
      if (c.has('bun')) { cyl(0.19, 0.21, 0.07, M.bun, 0, y + 0.035, 0, g); y += 0.07; }
      if (c.has('patty')) { cyl(0.2, 0.2, 0.06, M.pattyCook, 0, y + 0.03, 0, g); y += 0.06; }
      if (c.has('lettuce')) { cyl(0.22, 0.19, 0.03, M.lettuce, 0, y + 0.015, 0, g, 10); y += 0.03; }
      if (c.has('bun') && c.has('patty') && c.has('lettuce')) { const t = sph(0.2, M.bun, 0, y, 0, g, 12); t.scale.y = 0.6; }
    }
    return g;
  }
  if (Ty === 'dough') { const d = cyl(0.2, 0.22, 0.09, M.dough, 0, 0.045, 0, g, 14); d.scale.z = 0.85; }
  if (Ty === 'tomato') { if (st === 'chopped') for (let i = 0; i < 3; i++) cyl(0.08, 0.08, 0.03, M.tomato, -0.11 + i * 0.11, 0.02, 0, g, 10); else sph(0.13, M.tomato, 0, 0.12, 0, g); }
  if (Ty === 'cheese') { const w = box(0.24, 0.13, 0.17, M.cheese, 0, 0.065, 0, g); w.rotation.y = 0.4; }
  if (Ty === 'bun') { const t = sph(0.18, M.bun, 0, 0.05, 0, g, 12); t.scale.y = 0.55; }
  if (Ty === 'patty') cyl(0.18, 0.18, 0.06, st === 'burnt' ? M.burnt : st === 'cooked' ? M.pattyCook : M.pattyRaw, 0, 0.03, 0, g, 14);
  if (Ty === 'lettuce') { if (st === 'chopped') for (let i = 0; i < 4; i++) { const l = box(0.11, 0.02, 0.09, M.lettuce, rand(-0.11, 0.11), 0.02 + i * 0.01, rand(-0.09, 0.09), g); l.rotation.y = rand(0, 3); } else sph(0.15, M.lettuce, 0, 0.14, 0, g, 9); }
  return g;
}

// =====================================================================
// PROPS — Tripo food + station models (props.glb, one named root per prop). Boxy versions remain as fallback.
// =====================================================================
const PROP = { ready: false, src: {}, cache: new Map() };
const burntMats = new Map();
// a clone of prop `name`, scaled so its footprint (or height) is `size`, centered, sitting on y=0
function prop(name, size, byHeight = false) {
  const src = PROP.src[name]; if (!src) return new THREE.Group();
  let fit = PROP.cache.get(name);
  if (!fit) { const b = new THREE.Box3().setFromObject(src), sz = b.getSize(new THREE.Vector3()), c = b.getCenter(new THREE.Vector3()); fit = { sz, c, minY: b.min.y }; PROP.cache.set(name, fit); }
  const k = size / (byHeight ? fit.sz.y : Math.max(fit.sz.x, fit.sz.z));
  const inner = src.clone(true); inner.position.set(-fit.c.x * k, -fit.minY * k, -fit.c.z * k); inner.scale.setScalar(k);
  inner.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  const g = new THREE.Group(); g.add(inner); g.userData.h = fit.sz.y * k; return g;
}
function charred(o) {   // burnt = the cooked model, scorched almost black
  o.traverse(m => { if (!m.isMesh) return; let b = burntMats.get(m.material); if (!b) { b = m.material.clone(); b.color = new THREE.Color('#2a1d16'); b.roughness = 1; burntMats.set(m.material, b); } m.material = b; });
  return o;
}
function initProps(gltf) {
  for (const n of gltf.scene.children) PROP.src[n.name] = n;
  PROP.ready = true;
  upgradeStations();
  for (const t of Object.values(tiles)) if (t.item) refreshTile(t);
  setHold(player.hold);
}
function makeItemModel(it) {
  const g = new THREE.Group(), T = it.type, st = it.state;
  if (T === 'plate') {
    const pl = prop('plate', 0.62); g.add(pl); const y = Math.max(0.03, pl.userData.h * 0.55), c = it.contents;
    const put = (o, x = 0, z = 0, yy = y) => { o.position.set(x, yy, z); g.add(o); return o; };
    if (PIZZA.every(x => c.has(x))) put(it.pizza === 2 ? charred(prop('pizza_baked', 0.54)) : prop(it.pizza === 1 ? 'pizza_baked' : 'pizza_raw', 0.54));
    else if (BURGER.every(x => c.has(x))) put(prop('burger', 0.4));
    else {   // partial: show exactly what's on the plate
      if (c.has('dough')) { const d = put(prop('dough', 0.5)); d.scale.y = 0.35; }
      const dy = c.has('dough') ? y + 0.05 : y;
      if (c.has('tomato')) put(prop('tomato_chopped', 0.28), -0.1, 0.04, dy);
      if (c.has('cheese')) put(prop('cheese', 0.2), 0.12, -0.04, dy);
      if (c.has('bun')) put(prop('bun', 0.34));
      if (c.has('patty')) put(prop('patty_cooked', 0.32), c.has('bun') ? 0 : 0, 0, c.has('bun') ? y + 0.12 : y);
      if (c.has('lettuce')) put(prop('lettuce_chopped', 0.3), 0, 0, y + (c.has('bun') ? 0.12 : 0) + (c.has('patty') ? 0.07 : 0));
    }
    return g;
  }
  const M2 = { dough: ['dough', 0.34], cheese: ['cheese', 0.28], bun: ['bun', 0.34] };
  if (M2[T]) g.add(prop(...M2[T]));
  if (T === 'tomato') g.add(st === 'chopped' ? prop('tomato_chopped', 0.34) : prop('tomato', 0.26));
  if (T === 'lettuce') g.add(st === 'chopped' ? prop('lettuce_chopped', 0.34) : prop('lettuce', 0.3));
  if (T === 'patty') g.add(st === 'raw' ? prop('patty_raw', 0.34) : st === 'cooked' ? prop('patty_cooked', 0.34) : charred(prop('patty_cooked', 0.34)));
  return g;
}
function upgradeStations() {
  for (const t of Object.values(tiles)) {
    if (!t.parts) continue; const g = t.mesh, k = t.kind, hide = f => t.parts.forEach(o => { if (f(o)) o.visible = false; });
    if (k.startsWith('crate:')) {
      hide(o => true); const ing = k.slice(6);
      const cr = prop('crate', 0.86); cr.position.y = 0.92; cr.rotation.y = rand(-0.08, 0.08); g.add(cr);
      const lab = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.2), new THREE.MeshStandardMaterial({ map: crateTex(LABEL[ing]), roughness: 0.9, transparent: true, opacity: 0.92 }));
      lab.position.set(0, 0.92 + cr.userData.h * 0.5, 0.445); cr.add(lab); lab.position.y = cr.userData.h * 0.5; lab.position.z = 0.445;
      for (let i = 0; i < 3; i++) { const ic = makeItem({ type: ing, state: 'raw' }); ic.scale.setScalar(0.85); ic.position.set(-0.22 + i * 0.22, 0.92 + cr.userData.h * 0.55, rand(-0.12, 0.12)); ic.rotation.y = rand(0, 6); g.add(ic); }
      t.top = 0.92 + cr.userData.h; t.smokeY = t.top;
    } else if (k === 'oven') {
      hide(o => true); const ov = prop('oven', 0.98); ov.position.y = 0.92; g.add(ov); const h = ov.userData.h;
      const glow = new THREE.Mesh(new THREE.PlaneGeometry(0.52, h * 0.42), new THREE.MeshStandardMaterial({ color: '#000', emissive: '#ff6a1a', emissiveIntensity: 0, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
      glow.position.set(-0.06, 0.92 + h * 0.45, 0.5); g.add(glow); t.ovenWin = glow;
      t.top = 0.92 + h; t.smokeY = t.top + 0.1;
    } else if (k === 'stove') {
      hide(o => o !== t.ring); const gr = prop('stove', 0.98); gr.position.y = 0.92; g.add(gr);
      t.top = 0.92 + gr.userData.h; t.ring.position.y = t.top + 0.004; t.ring.scale.set(0.8, 1, 0.8); t.smokeY = t.top + 0.1;
    } else if (k === 'plates') {
      hide(o => true); for (let i = 0; i < 5; i++) { const p = prop('plate', 0.6); p.position.set(rand(-0.02, 0.02), 0.92 + i * 0.035, rand(-0.02, 0.02)); p.rotation.y = rand(0, 6); g.add(p); } t.top = 0.92 + 5 * 0.035 + 0.02;
    } else if (k === 'board') {   // Tripo's board came out as mostly knife: keep the readable wooden board
    } else if (k === 'trash') {
      g.children.forEach(o => { if (o.isMesh) o.visible = false; }); const tr = prop('trash', 1.0, true); g.add(tr); t.top = 1.0;
    } else if (k === 'serve') {
      hide(o => o.userData.bell); const b = prop('bell', 0.2); b.position.set(0.28, 0.95, 0.28); g.add(b);
    }
  }
}
const needsProcessing = it => (it.type === 'tomato' || it.type === 'lettuce') ? it.state !== 'chopped' : it.type === 'patty' ? it.state !== 'cooked' : false;
function plateAccepts(plate, it) {
  if (it.type === 'plate' || needsProcessing(it) || it.state === 'burnt') return false;
  if (plate.pizza) return false;
  const c = plate.contents; if (c.has(it.type)) return false;
  const recipe = PIZZA.includes(it.type) ? PIZZA : BURGER;
  for (const x of c) if (!recipe.includes(x)) return false;
  return true;
}
function dishOf(p) {
  if (p.type !== 'plate') return null;
  if (PIZZA.every(x => p.contents.has(x)) && p.pizza === 1) return 'pizza';
  if (BURGER.every(x => p.contents.has(x))) return 'burger';
  return null;
}
const isRawPizza = p => p.type === 'plate' && PIZZA.every(x => p.contents.has(x)) && !p.pizza;
const newPlate = () => ({ type: 'plate', state: 'raw', contents: new Set(), pizza: 0 });
function setTileItem(t, it) {
  if (t.itemMesh) { t.mesh.remove(t.itemMesh); t.itemMesh = null; }
  t.item = it; t.cook = it ? t.cook : 0;
  if (it) { t.itemMesh = makeItem(it); t.itemMesh.position.y = t.kind === 'oven' ? 0.3 : t.top; if (t.kind === 'oven') { t.itemMesh.position.z = 0.1; t.itemMesh.scale.setScalar(0.85); } t.mesh.add(t.itemMesh); }
}
function refreshTile(t) { setTileItem(t, t.item); }

// =====================================================================
// PLAYER — the night-shift kid (paper hat, grey uniform, stained apron)
// =====================================================================
const player = { x: 6.5, z: 4.5, vx: 0, vz: 0, face: Math.PI, hold: null, holdMesh: null, mesh: null, walk: 0, chopping: false, holdingDoor: false };
function buildChef() {
  const g = new THREE.Group(); const body = new THREE.Group(); g.add(body);
  box(0.46, 0.5, 0.3, M.chef, 0, 0.64, 0, body);
  box(0.4, 0.46, 0.03, M.apron, 0, 0.56, 0.16, body);
  const head = new THREE.Group(); head.position.y = 1.08; body.add(head);
  box(0.3, 0.32, 0.3, M.skin, 0, 0, 0, head);
  box(0.32, 0.12, 0.32, mat('#2a1c14'), 0, 0.16, -0.02, head);
  const hat = box(0.34, 0.12, 0.2, M.chefHat, 0, 0.24, 0, head); hat.rotation.z = 0.08;
  for (const s of [-1, 1]) box(0.04, 0.04, 0.02, M.hatBlack, s * 0.07, 0.02, 0.155, head);
  const legs = [-1, 1].map(s => box(0.16, 0.36, 0.18, M.pants, s * 0.12, 0.18, 0, g));
  const arms = [-1, 1].map(s => { const a = new THREE.Group(); a.position.set(s * 0.3, 0.84, 0); body.add(a); box(0.12, 0.38, 0.12, M.chef, 0, -0.17, 0, a); box(0.1, 0.1, 0.1, M.skin, 0, -0.38, 0, a); return a; });
  g.traverse(o => { if (o.isMesh) o.userData.proc = true; });
  return { g, body, head, legs, arms };
}
const chef = buildChef(); scene.add(chef.g); player.mesh = chef;
const playerLamp = new THREE.PointLight('#ffd8a8', 1.6, 3.6, 1.4); playerLamp.position.set(0, 2.8, 0.9); chef.g.add(playerLamp);
const insideLight = new THREE.SpotLight('#cfd8ff', 0, 7, 0.45, 0.7, 1.4); insideLight.position.set(11.2, 4.4, 5.2); insideLight.target.position.set(11.3, 1.4, 3.6); scene.add(insideLight, insideLight.target);
const handAnchor = new THREE.Group(); handAnchor.position.set(0, 1.0, 0.38); chef.body.add(handAnchor);

// held item sits between the cook's palms (carry clip holds both hands out front)
const _hl = new THREE.Vector3(), _hr = new THREE.Vector3();
function placeHeld() {
  playerLamp.intensity = G.hero ? 0.35 : 1.6; if (G.hero) { workLight.intensity = 28; tube.angle = 0.95; }
  if (!chef.handL || handAnchor.parent !== scene) return;
  chef.g.updateMatrixWorld(true); chef.handL.getWorldPosition(_hl); chef.handR.getWorldPosition(_hr);
  handAnchor.position.copy(_hl).add(_hr).multiplyScalar(0.5);
  const fx = Math.sin(chef.g.rotation.y), fz = Math.cos(chef.g.rotation.y);
  handAnchor.position.x += fx * 0.05; handAnchor.position.z += fz * 0.05; handAnchor.position.y += 0.015;
  handAnchor.rotation.y = chef.g.rotation.y;
  handAnchor.visible = chef.g.visible;
}
function setHold(it) { player.hold = it; if (player.holdMesh) handAnchor.remove(player.holdMesh); player.holdMesh = it ? makeItem(it) : null; if (player.holdMesh) handAnchor.add(player.holdMesh); }
const solid = (x, z) => x < 0 || z < 0 || x > 12 || z > 6 || !!tiles[key(x, z)];
function collide(nx, nz) {
  const r = 0.36;   // matches the cook model's shoulders so hands/apron don't sink into counters
  for (let tz = Math.floor(nz - r); tz <= Math.floor(nz + r); tz++) for (let tx = Math.floor(nx - r); tx <= Math.floor(nx + r); tx++) {
    if (!solid(tx, tz)) continue;
    const cx = clamp(nx, tx, tx + 1), cz = clamp(nz, tz, tz + 1), dx = nx - cx, dz = nz - cz, d = Math.hypot(dx, dz);
    if (d < r && d > 1e-6) { nx = cx + dx / d * r; nz = cz + dz / d * r; } else if (d <= 1e-6) return null;
  }
  return [nx, nz];
}
function facingTile() {
  const fx = Math.sin(player.face), fz = Math.cos(player.face);
  let best = null, bs = 1e9;
  for (const t of Object.values(tiles)) {
    const dx = t.x + 0.5 - player.x, dz = t.z + 0.5 - player.z, d = Math.hypot(dx, dz);
    if (d > 1.25) continue;
    const dot = (dx * fx + dz * fz) / d; if (dot < 0.35) continue;
    const s = d - dot * 0.6; if (s < bs) { bs = s; best = t; }
  }
  return best;
}
const nearDoor = () => Math.hypot(player.x - 12, player.z - 3.5) < 1.35;
const hl = new THREE.Mesh(new THREE.BoxGeometry(1.02, 0.03, 1.02), new THREE.MeshBasicMaterial({ color: '#fff3c8', transparent: true, opacity: 0.12, depthWrite: false }));
scene.add(hl);

// =====================================================================
// PEPPER — a worn, uncanny animatronic (torn fur, exposed endoskeleton jaw, black sockets, pinprick eyes)
// =====================================================================
function buildBear() {
  const g = new THREE.Group(); const body = new THREE.Group(); body.rotation.x = 0.12; g.add(body);
  const torso = cyl(0.42, 0.52, 1.0, M.bearFur, 0, 1.35, 0, body, 10); torso.scale.z = 0.8;
  const belly = cyl(0.3, 0.38, 0.75, M.bearLight, 0, 1.32, 0.16, body, 10); belly.scale.z = 0.5;
  box(0.24, 0.3, 0.1, M.endo, 0.24, 1.55, 0.3, body);                         // torn chest panel
  for (let i = 0; i < 3; i++) { const w = cyl(0.012, 0.012, 0.32, M.wire, 0.18 + i * 0.05, 1.52, 0.35, body, 4); w.rotation.z = rand(-0.4, 0.4); }
  const bow = box(0.3, 0.1, 0.06, M.bow, 0, 1.87, 0.33, body); bow.rotation.z = 0.15;
  const neck = cyl(0.07, 0.07, 0.25, M.endo, 0, 1.97, 0.02, body, 8);
  const head = new THREE.Group(); head.position.set(0, 2.32, 0.05); body.add(head);
  const skull = sph(0.36, M.bearFur, 0, 0, 0, head, 10); skull.scale.set(1.05, 0.95, 1);
  const muzzle = sph(0.2, M.bearLight, 0, -0.08, 0.3, head, 9); muzzle.scale.set(1.15, 0.75, 1.05);
  sph(0.055, M.bearDark, 0, 0.0, 0.5, head, 8);
  for (const s of [-1, 1]) { const ear = sph(0.12, M.bearFur, s * 0.28, 0.3, -0.02, head, 7); ear.scale.z = 0.5; ear.rotation.z = s * (s > 0 ? 0.5 : 0.1); }
  const eyes = [-1, 1].map(s => { const sock = sph(0.085, M.bearDark, s * 0.14, 0.08, 0.27, head, 10); sock.scale.z = 0.6; const pupil = sph(0.026, M.eye, s * 0.14, 0.08, 0.33, head, 6); pupil.castShadow = false; return pupil; });
  const jaw = new THREE.Group(); jaw.position.set(0, -0.17, 0.12); head.add(jaw);
  box(0.3, 0.05, 0.3, M.endo, 0, -0.02, 0.12, jaw);
  for (let i = 0; i < 6; i++) box(0.035, 0.06, 0.03, M.teeth, -0.11 + i * 0.044, 0.03, 0.26, jaw);
  for (let i = 0; i < 6; i++) box(0.035, 0.05, 0.03, M.teeth, -0.11 + i * 0.044, 0.05, 0.38 - 0.08, head);
  // a battered chef hat, tilted
  const hat = new THREE.Group(); hat.position.set(0.06, 0.34, -0.02); hat.rotation.z = -0.22; head.add(hat);
  cyl(0.2, 0.2, 0.1, M.hatStain, 0, 0, 0, hat, 10); const ht = sph(0.23, M.hatStain, 0, 0.15, 0, hat, 9); ht.scale.y = 0.65;
  const arms = [-1, 1].map(s => { const a = new THREE.Group(); a.position.set(s * 0.48, 1.78, 0); a.rotation.z = s * 0.08; body.add(a);
    cyl(0.12, 0.11, 0.62, M.bearFur, 0, -0.3, 0, a, 8); const fore = cyl(0.05, 0.05, 0.36, M.endo, 0, -0.75, 0.02, a, 6); const hand = sph(0.13, M.bearLight, 0, -0.98, 0.04, a, 7); hand.scale.set(1, 1.2, 0.8); return a; });
  for (const s of [-1, 1]) { cyl(0.15, 0.13, 0.82, M.bearFur, s * 0.22, 0.42, 0, g, 8); const f = sph(0.18, M.bearLight, s * 0.22, 0.06, 0.12, g, 7); f.scale.set(1, 0.5, 1.5); }
  g.traverse(o => { if (o.isMesh) o.castShadow = true; });
  g.traverse(o => { if (o.isMesh) o.userData.proc = true; });
  return { g, body, head, jaw, eyes, arms };
}
const HALL = new THREE.Group(); HALL.position.set(100, 0, 0); scene.add(HALL);
const hallAmb = new THREE.PointLight('#8aa0c0', 6, 30, 1); hallAmb.position.set(100, 6, -2); scene.add(hallAmb);
const hallLights = [];
function buildHall() {
  const hf = new THREE.MeshStandardMaterial({ map: T.floor.clone(), roughness: 0.6 }); hf.map.repeat.set(10, 7); hf.map.needsUpdate = true;
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(40, 30), hf); fl.rotation.x = -Math.PI / 2; fl.receiveShadow = true; HALL.add(fl);
  const hw = new THREE.MeshStandardMaterial({ map: T.wall.clone(), roughness: 0.9 }); hw.map.repeat.set(5, 1); hw.map.needsUpdate = true;
  // stage (cam 1): curtain + stage + cheap stars
  box(6, 0.6, 3, mat('#3a1612'), -10, 0.3, -6, HALL); box(12, 6, 0.3, hw, -10, 3, -8, HALL);
  for (let i = 0; i < 9; i++) box(0.72, 4.6, 0.12, mat(i % 2 ? '#4a0e0c' : '#360a08', { roughness: 1 }), -13.4 + i * 0.72, 3.3, -7.7 + (i % 2) * 0.08, HALL);
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 0.8), new THREE.MeshStandardMaterial({ map: tex(256, 86, (x, w, h) => { x.fillStyle = '#2a0a06'; x.fillRect(0, 0, w, h); x.fillStyle = '#e8c45a'; x.font = 'bold 40px Georgia'; x.textAlign = 'center'; x.fillText("PEPPER'S", w / 2, 56); }), emissive: '#e8c45a', emissiveIntensity: 0.15 }));
  sign.position.set(-10, 5.3, -7.5); HALL.add(sign);
  // dining (cam 2): tables, party hats, a birthday banner
  for (const [x, z] of [[-3, -4], [0, -4], [-3, -1], [0, -1]]) { box(1.8, 0.06, 0.9, mat('#cfc8b4'), x, 0.8, z, HALL); cyl(0.06, 0.06, 0.8, M.metal, x, 0.4, z, HALL, 8);
    const hat = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.26, 8), mat(['#7a1a1a', '#1a4a1a', '#1a1a5a', '#6a5a14'][(x + z + 10) % 4])); hat.position.set(x + rand(-0.6, 0.6), 0.96, z + rand(-0.2, 0.2)); hat.rotation.z = rand(-1.4, 1.4); HALL.add(hat); }
  box(0.3, 6, 12, hw, -6, 3, -3, HALL); box(14, 6, 0.3, hw, -1, 3, -8, HALL);
  for (let i = 0; i < 4; i++) { const ps = plane(0.8, 1.2, M.poster, -4.5 + i * 1.6, 2.3, -7.8, 0, HALL); ps.rotation.z = rand(-0.1, 0.1); }
  // the east hall (cam 3): long, narrow, posters, a flickering light at the far end
  box(14, 4, 0.3, hw, 4, 2, 2, HALL); box(14, 4, 0.3, hw, 4, 2, -1, HALL);
  for (let i = 0; i < 5; i++) { const ps = plane(0.8, 1.2, M.poster, -1 + i * 2.6, 2.2, 1.84, Math.PI, HALL); ps.rotation.z = rand(-0.12, 0.12); }
  box(0.3, 4, 3, M.door, 11, 2, 0.5, HALL);
  for (const [x, z, c, i] of [[-10, -4, '#ffb070', 26], [-2, -2.5, '#c8d8ff', 18], [3, 0.5, '#e8f0c8', 14], [9, 0.5, '#e8f0c8', 9]]) { const l = new THREE.PointLight(c, i, 11, 1.4); l.position.set(x, 3.6, z); l.userData.base = i; HALL.add(l); hallLights.push(l); }
}
const bear = buildBear(); HALL.add(bear.g);
const insideBear = buildBear(); insideBear.g.visible = false; scene.add(insideBear.g);
// Pepper on the other side of the kitchen door: seen through the gap as it gets pushed open
const doorBear = buildBear(); doorBear.g.visible = false; doorBear.g.position.set(13.75, 0, 3.55); doorBear.g.rotation.y = -Math.PI / 2; doorBear.g.scale.setScalar(0.92); scene.add(doorBear.g);
const outLight = new THREE.PointLight('#ff2a1a', 0, 3, 1.2); outLight.position.set(13.2, 2.2, 3.5); scene.add(outLight);
const STAGE_POS = [[-10, 0.6, -6, 0], [-1.5, 0, -2.5, -0.6], [2, 0, 0.5, -Math.PI / 2], [8.2, 0, 0.5, -Math.PI / 2]];
const CAMS = [
  { name: 'CAM 1A — SHOW STAGE', pos: [-6, 3.6, 1], look: [-10, 1.8, -6] },
  { name: 'CAM 2B — DINING AREA', pos: [3, 3.6, -6.8], look: [-2, 1, -2] },
  { name: 'CAM 4A — EAST HALL', pos: [-3, 3.4, 0.5], look: [10, 1.4, 0.5] },
];
const camCams = CAMS.map(c => { const k = new THREE.PerspectiveCamera(58, 16 / 9, 0.1, 60); k.position.set(100 + c.pos[0], c.pos[1], c.pos[2]); k.lookAt(100 + c.look[0], c.look[1], c.look[2]); return k; });
const camOf = stage => stage === 0 ? 0 : stage === 1 ? 1 : 2;

// security monitor render target + static shader
const rt = new THREE.WebGLRenderTarget(PERF_LOW ? 256 : 384, PERF_LOW ? 144 : 216);
let monitorScreen, monitorLamp, wallClock;
const screenMat = new THREE.ShaderMaterial({
  uniforms: { tex: { value: rt.texture }, t: { value: 0 }, glitch: { value: 0 } },
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }',
  fragmentShader: `uniform sampler2D tex; uniform float t, glitch; varying vec2 vUv;
    float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233))) * 43758.5453); }
    void main(){ vec2 uv = vUv; uv.x += (h(vec2(floor(uv.y * 40.), t)) - .5) * .06 * glitch;
      vec3 c = texture2D(tex, uv).rgb; float l = dot(c, vec3(.3,.59,.11)); c = mix(vec3(l) * vec3(.75,1.05,.9), c, .3) * 2.6;
      float n = h(uv * 300. + t); c = mix(c, vec3(n), .08 + glitch * .7); c *= .85 + .15 * sin(uv.y * 400. + t * 30.);
      gl_FragColor = vec4(c, 1.); }`,
});

// =====================================================================
// AUDIO (synthesized)
// =====================================================================
let AC = null, master, amb;
function initAudio() {
  if (AC) { if (AC.state === 'suspended') AC.resume(); return; }
  try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return; }
  master = AC.createGain(); master.gain.value = 0.7; master.connect(AC.destination);
  // fluorescent hum + low drone
  amb = AC.createGain(); amb.gain.value = 0; amb.connect(master);
  for (const [f, v, ty] of [[120, 0.03, 'sawtooth'], [55, 0.12, 'sine'], [58.3, 0.08, 'sine']]) { const o = AC.createOscillator(); o.type = ty; o.frequency.value = f; const g = AC.createGain(); g.gain.value = v; const lp = AC.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 400; o.connect(lp); lp.connect(g); g.connect(amb); o.start(); }
}
function tone(f, d = 0.12, v = 0.1, type = 'sine', f1 = 0, delay = 0) {
  if (!AC) return; const t = AC.currentTime + delay, o = AC.createOscillator(), g = AC.createGain();
  o.type = type; o.frequency.setValueAtTime(f, t); if (f1) o.frequency.exponentialRampToValueAtTime(f1, t + d);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + 0.006); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
  o.connect(g); g.connect(master); o.start(t); o.stop(t + d + 0.05);
}
function noise(d = 0.2, v = 0.2, f = 2000, type = 'bandpass', delay = 0, q = 1) {
  if (!AC) return; const t = AC.currentTime + delay, n = AC.createBufferSource(), b = AC.createBuffer(1, Math.max(1, AC.sampleRate * d | 0), AC.sampleRate);
  const ch = b.getChannelData(0); for (let i = 0; i < ch.length; i++) ch[i] = Math.random() * 2 - 1;
  n.buffer = b; const fl = AC.createBiquadFilter(); fl.type = type; fl.frequency.value = f; fl.Q.value = q; const g = AC.createGain();
  g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.0001, t + d); n.connect(fl); fl.connect(g); g.connect(master); n.start(t);
}
const SFX = {
  pick() { tone(520, 0.06, 0.06, 'triangle', 700); }, put() { tone(300, 0.07, 0.07, 'triangle', 220); noise(0.04, 0.06, 1500); },
  chop() { noise(0.05, 0.18, 3200, 'bandpass', 0, 2); tone(900, 0.03, 0.04, 'square'); },
  done() { tone(880, 0.1, 0.06, 'sine'); tone(1320, 0.18, 0.06, 'sine', 0, 0.08); },
  ding() { tone(1568, 0.6, 0.1, 'sine'); tone(2093, 0.8, 0.06, 'sine', 0, 0.02); },
  serve() { [0, 4, 7, 12].forEach((s, i) => tone(523 * 2 ** (s / 12), 0.18, 0.06, 'triangle', 0, i * 0.06)); },
  bad() { tone(200, 0.25, 0.08, 'square', 120); },
  sizzle(v = 0.05) { noise(0.25, v, 5000, 'highpass'); },
  burnAlarm() { tone(1900, 0.08, 0.05, 'square'); tone(1900, 0.08, 0.05, 'square', 0, 0.16); },
  step(vol) { noise(0.16, 0.45 * vol, 160, 'lowpass'); tone(62, 0.22, 0.32 * vol, 'sine', 34); tone(rand(1700, 2300), 0.06, 0.025 * vol, 'square', 0, 0.03); noise(0.05, 0.1 * vol, 3400, 'bandpass', 0.05, 6); },
  bang(vol = 1) { noise(0.3, 0.6 * vol, 260, 'lowpass'); tone(60, 0.35, 0.5 * vol, 'sine', 30); noise(0.08, 0.2 * vol, 2200); },
  creak() { tone(140, 0.7, 0.05, 'sawtooth', 210); },
  retreat() { for (let i = 0; i < 4; i++) { noise(0.12, 0.25 / (i + 1), 180, 'lowpass', i * 0.45); } },
  breath() { noise(1.1, 0.12, 500, 'bandpass', 0, 0.6); },
  cam() { noise(0.12, 0.12, 4000, 'highpass'); tone(1200, 0.04, 0.03, 'square'); },
  scream() { for (let i = 0; i < 9; i++) tone(rand(240, 1100), 1.3, 0.14, i % 2 ? 'sawtooth' : 'square', rand(120, 360), i * 0.015); tone(80, 1.2, 0.5, 'square', 40); noise(1.4, 1, 1500, 'bandpass', 0, 0.3); noise(0.4, 0.8, 300, 'lowpass'); },
  clank() { const f = rand(90, 160); tone(f, 1.4, 0.05, 'triangle', f * 0.92); tone(f * 2.76, 0.8, 0.02, 'sine'); noise(0.5, 0.06, 700, 'bandpass', 0, 3); },
  note(f, v) { const d = 2 ** (rand(-0.03, 0.03)); tone(f * d, 0.5, v, 'triangle'); tone(f * 2 * d, 0.25, v * 0.35, 'sine'); },
  chime() { [0, 7, 12, 16, 19, 24].forEach((s, i) => tone(392 * 2 ** (s / 12), 0.7, 0.07, 'sine', 0, i * 0.18)); },
  order() { tone(988, 0.08, 0.05, 'square'); tone(1319, 0.12, 0.05, 'square', 0, 0.09); },
};

// =====================================================================
// CHARACTER MODELS — Tripo meshes, auto-rigged (Mixamo skeleton), clips trimmed to what the game uses
// =====================================================================
const rigs = [];
function upgradeRig(rig, gltf, height) {
  const m = cloneSkinned(gltf.scene); m.scale.setScalar(height);   // rigged source is unit-height with its origin at the feet
  m.traverse(o => { if (o.isMesh) { o.castShadow = true; o.frustumCulled = false; if (o.material) o.material.envMapIntensity = 0.4; } });
  rig.g.traverse(o => { if (o.userData.proc) o.visible = false; });
  rig.g.add(m); rig.model = m; rig.mixer = new THREE.AnimationMixer(m); rig.actions = {}; rig.cur = null;
  for (const c of gltf.animations) rig.actions[c.name] = rig.mixer.clipAction(c);
  m.traverse(o => { if (!o.isBone) return; if (/Head$/.test(o.name)) rig.headBone = o; if (/LeftHand$/.test(o.name)) rig.handL = o; if (/RightHand$/.test(o.name)) rig.handR = o; });
  rigs.push(rig); return m;
}
function play(rig, name, { fade = 0.2, speed = 1, once = false } = {}) {
  if (!rig.mixer || !rig.actions[name]) return;
  const a = rig.actions[name]; a.timeScale = speed;
  if (rig.cur === a && !once) return;
  a.reset(); a.setLoop(once ? THREE.LoopOnce : THREE.LoopRepeat); a.clampWhenFinished = once; a.fadeIn(fade).play();
  if (rig.cur && rig.cur !== a) rig.cur.fadeOut(fade);
  rig.cur = a;
}
// Pepper's painted eyes become black sockets with glowing pinpricks, pinned to the head bone
function addEyes(rig, height) {
  if (!rig.headBone) return;
  rig.model.updateMatrixWorld(true);
  const eyes = [];
  for (const s of [-1, 1]) {
    const p = new THREE.Vector3(s * 0.036 * height, 0.32 * height, 0.105 * height); rig.g.localToWorld(p);
    const e = new THREE.Mesh(new THREE.SphereGeometry(0.013, 8, 6), M.eye); rig.headBone.add(e);
    rig.headBone.worldToLocal(e.position.copy(p)); const sc = new THREE.Vector3(); rig.headBone.getWorldScale(sc); e.scale.divide(sc).multiplyScalar(rig.g.scale.x);
    eyes.push(e);
  }
  rig.eyesGlow = eyes;
}
const GLTFS = {};
const modelsReady = (async () => {
  try {
    const L = new GLTFLoader();
    const [pep, cook] = await Promise.all([L.loadAsync('assets/models/pepper.glb'), L.loadAsync('assets/models/cook.glb')]);
    GLTFS.pepper = pep; GLTFS.cook = cook;
    try { GLTFS.props = await L.loadAsync('assets/models/props.glb'); initProps(GLTFS.props); } catch (e) { console.warn('props unavailable, keeping boxy stations', e); }
    for (const r of [bear, insideBear, doorBear, scareBear]) { upgradeRig(r, pep, 2.55); addEyes(r, 2.55); play(r, 'idle'); }
    for (const r of [bear, insideBear, doorBear, scareBear]) r.body.rotation.x = 0;
    upgradeRig(chef, cook, 1.5); play(chef, 'idle');
    scene.add(handAnchor); handAnchor.position.set(0, 0, 0);   // held items now ride on the model's hands (placeHeld)
    window.__models = true;
  } catch (e) { console.warn('character models unavailable, using fallback rigs', e); }
})();

// =====================================================================
// GAME STATE
// =====================================================================
const G = { night: 0, N: null, clockOn: true, paused: false, lessonI: 0, power: true, state: 'title', t: 0, cash: 0, served: 0, missed: 0, orders: [], nextOrder: 3, tablet: false, cam: 0, autoCam: 0, autoT: 0,
  bear: { stage: 0, moveT: 9, doorT: 0, open: 0, bangT: 0, inside: false, insideT: 0, attacks: 0 }, glitch: 0, flicker: 0, shake: 0, hintT: 0, hints: new Set() };
let pops = [], smoke = [];

function resetShift() {
  for (const t of Object.values(tiles)) { if (t.item) setTileItem(t, null); t.cook = 0; t.progress = 0; }
  setHold(null); Object.assign(player, { x: 6.5, z: 4.8, vx: 0, vz: 0, face: Math.PI });
  Object.assign(G, { lureCD: 0, lured: 0, t: 0, cash: 0, served: 0, missed: 0, orders: [], nextOrder: 2.5, tablet: false, glitch: 0, flicker: 0, shake: 0, power: true });
  G.N = NIGHTS[G.night];
  G.bear = { stage: 0, moveT: G.N.start, doorT: 0, open: 0, bangT: 0, inside: false, insideT: 0, attacks: 0, scripted: G.night === 0, tutorial: false };
  insideBear.g.visible = false; insideBear.g.scale.setScalar(1); insideLight.intensity = 0; $('orders').innerHTML = ''; G.hints.clear(); showTablet(false);
  const door = tiles['12,3']; door.panel.rotation.y = 0; door.eyes.visible = false;
  updateHUD();
}

// --------------------------------------------------------------- orders
function addOrder(force) {
  const type = force || (G.night === 0 ? 'pizza' : Math.random() < 0.5 ? 'pizza' : 'burger');
  const life = (type === 'pizza' ? 52 : 44) * (G.N ? G.N.life : 1);
  const el = document.createElement('div'); el.className = 'tk';
  G.ticketNo = (G.ticketNo || 40 + (Math.random() * 50 | 0)) + 1; el.style.setProperty('--r', rand(-2.5, 2.5).toFixed(1) + 'deg');
  el.innerHTML = `<div class="no"><span>#0${G.ticketNo}</span><span>TBL ${1 + (Math.random() * 9 | 0)}</span></div><div class="nm">${type === 'pizza' ? '1 PIZZA' : '1 BURGER'}</div><div class="rc">${type === 'pizza' ? 'dough<br>tomato (chop)<br>cheese<br>&gt; oven' : 'bun<br>patty (grill)<br>lettuce (chop)'}</div><div class="bar"><i></i></div>`;
  $('orders').appendChild(el); G.orders.push({ type, life, max: life, el }); SFX.order();
}
function updateOrders(dt) {
  G.nextOrder -= dt;
  if (G.tutorialCooking) return;
  if (G.nextOrder <= 0 && G.orders.length < G.N.max && G.t < SHIFT - 12) { addOrder(); G.nextOrder = G.orders.length <= 1 ? rand(6, 9) : rand(G.N.gap[0], G.N.gap[1]); }
  for (const o of G.orders.slice()) {
    if (!o.tut) o.life -= dt; const k = o.life / o.max;
    o.el.querySelector('.bar i').style.width = (k * 100) + '%';
    o.el.classList.toggle('warn', k < 0.5); o.el.classList.toggle('late', k < 0.2);
    if (o.life <= 0) { G.orders.splice(G.orders.indexOf(o), 1); o.el.remove(); G.missed++; G.cash = Math.max(0, G.cash - 5); SFX.bad(); pop('-$5 MISSED', 6.5, 6.5, true); }
  }
}
function serve(dish) {
  const o = G.orders.find(o => o.type === dish);
  if (!o) { pop('NOBODY ORDERED THAT', 6.5, 6.5, true); SFX.bad(); return false; }
  G.orders.splice(G.orders.indexOf(o), 1); o.el.remove();
  const tip = Math.round(4 * o.life / o.max) * 2, base = dish === 'pizza' ? 20 : 15;
  G.cash += base + tip; G.served++; SFX.serve(); pop(`+$${base + tip}`, 6.5, 6.5); lessonEvent('serve');
  return true;
}

// --------------------------------------------------------------- interaction
function interact() {
  G.idleT = 0;
  const t = facingTile(); if (!t) return;
  if (chef.mixer && Math.hypot(player.vx, player.vz) < 0.6) { play(chef, 'interact', { once: true, speed: 2.2, fade: 0.08 }); chef.lockT = 0.35; }
  const h = player.hold, it = t.item;
  if (t.kind.startsWith('crate:')) {
    const ing = t.kind.slice(6);
    if (!h) { setHold({ type: ing, state: 'raw' }); SFX.pick(); hint('pick'); }
    else if (h.type === 'plate' && plateAccepts(h, { type: ing, state: 'raw' })) { h.contents.add(ing); setHold(h); SFX.put(); }
    return;
  }
  if (t.kind === 'plates') { if (!h) { setHold(newPlate()); SFX.pick(); } else if (h.type !== 'plate' && !it) { /* nothing */ } return; }
  if (t.kind === 'trash') { if (h) { if (h.type === 'plate') setHold(newPlate()); else setHold(null); noise(0.2, 0.15, 400, 'lowpass'); } return; }
  if (t.kind === 'serve') { if (h && h.type === 'plate') { const d = dishOf(h); if (d && serve(d)) setHold(null); else if (!d) { pop('NOT FINISHED', 6.5, 6.5, true); SFX.bad(); } } return; }
  if (t.kind === 'door') return;
  if (t.kind === 'oven') {
    if (!it && h && isRawPizza(h)) { setTileItem(t, h); t.cook = 0; setHold(null); SFX.put(); SFX.sizzle(); hint('oven'); }
    else if (it && !h) { setHold(it); setTileItem(t, null); SFX.pick(); }
    else if (h && !isRawPizza(h)) { pop(h.type === 'plate' ? 'NEEDS DOUGH + TOMATO + CHEESE' : 'PUT IT ON A PLATE', t.x + 0.5, t.z + 0.5, true); }
    return;
  }
  if (t.kind === 'stove') {
    if (!it && h && h.type === 'patty' && h.state === 'raw') { setTileItem(t, h); t.cook = 0; setHold(null); SFX.put(); SFX.sizzle(0.1); }
    else if (it && !h) { setHold(it); setTileItem(t, null); SFX.pick(); }
    else if (it && h && h.type === 'plate' && plateAccepts(h, it)) { h.contents.add(it.type); setHold(h); setTileItem(t, null); SFX.put(); }
    else if (h) pop('ONLY RAW PATTIES', t.x + 0.5, t.z + 0.5, true);
    return;
  }
  // counter / board — empty hands on a board with something unchopped = start chopping (hold), not pick up
  if (t.kind === 'board' && !h && it && (it.type === 'tomato' || it.type === 'lettuce') && it.state !== 'chopped') return;
  if (h && !it) { setTileItem(t, h); setHold(null); SFX.put(); if (t.kind === 'board' && needsProcessing(h) && h.type !== 'patty') hint('chop'); return; }
  if (!h && it) { setHold(it); setTileItem(t, null); SFX.pick(); return; }
  if (h && it) {
    if (h.type === 'plate' && it.type !== 'plate' && plateAccepts(h, it)) { h.contents.add(it.type); setHold(h); setTileItem(t, null); SFX.put(); return; }
    if (it.type === 'plate' && h.type !== 'plate' && plateAccepts(it, h)) { it.contents.add(h.type); refreshTile(t); setHold(null); SFX.put(); return; }
    pop("CAN'T COMBINE", t.x + 0.5, t.z + 0.5, true);
  }
}
function updateChop(dt, holdingUse) {
  player.chopping = false;
  const t = facingTile();
  if (!holdingUse || player.hold || !t || t.kind !== 'board' || !t.item || !(t.item.type === 'tomato' || t.item.type === 'lettuce') || t.item.state === 'chopped') return;
  player.chopping = true; t.progress += dt;
  if ((t.progress * 6 | 0) !== ((t.progress - dt) * 6 | 0)) SFX.chop();
  if (t.progress >= 1.3) { t.item.state = 'chopped'; t.progress = 0; refreshTile(t); SFX.done(); }
}

// --------------------------------------------------------------- cooking
function updateCooking(dt) {
  let glow = 0;
  for (const t of Object.values(tiles)) {
    if (t.kind === 'oven') {
      const on = t.item && t.item.type === 'plate' && t.item.pizza !== undefined;
      t.ovenWin.material.emissiveIntensity = on ? 1.4 + Math.sin(G.t * 9) * 0.2 : 0;
      if (!on) continue; t.cook += dt;
      if (t.item.pizza === 0 && t.cook > 7) { t.item.pizza = 1; refreshTile(t); SFX.ding(); pop('PIZZA READY', t.x + 0.5, t.z + 0.5); }
      if (t.item.pizza === 1 && t.cook > 15) { t.item.pizza = 2; refreshTile(t); pop('BURNT!', t.x + 0.5, t.z + 0.5, true); }
      if (t.item.pizza === 1 && t.cook > 11 && Math.random() < dt * 3) puff(t, 0.4);
      if (t.item.pizza === 2) { if (Math.random() < dt * 14) puff(t, 1); if ((G.t * 2 | 0) !== ((G.t - dt) * 2 | 0)) SFX.burnAlarm(); }
    }
    if (t.kind === 'stove') {
      const on = !!t.item; t.ring.material.color.set(on ? '#ff5a1a' : '#1a0c08'); if (on) glow = 1;
      if (!on) continue; t.cook += dt;
      if ((t.cook * 1.5 | 0) !== ((t.cook - dt) * 1.5 | 0)) SFX.sizzle(0.03);
      if (t.item.state === 'raw' && t.cook > 5) { t.item.state = 'cooked'; refreshTile(t); SFX.done(); }
      if (t.item.state === 'cooked' && t.cook > 12) { t.item.state = 'burnt'; refreshTile(t); pop('BURNT!', t.x + 0.5, t.z + 0.5, true); }
      if (t.item.state === 'cooked' && t.cook > 9 && Math.random() < dt * 3) puff(t, 0.4);
      if (t.item.state === 'burnt') { if (Math.random() < dt * 14) puff(t, 1); if ((G.t * 2 | 0) !== ((G.t - dt) * 2 | 0)) SFX.burnAlarm(); }
    }
  }
  stoveGlow.intensity = damp(stoveGlow.intensity, glow * (3 + Math.sin(G.t * 23) * 0.6), 6, dt);
}
const smokeGeo = new THREE.SphereGeometry(0.18, 8, 6);
function puff(t, k) {
  const m = new THREE.Mesh(smokeGeo, new THREE.MeshBasicMaterial({ color: k > 0.7 ? '#2a2a2e' : '#9a9aa2', transparent: true, opacity: 0.55, depthWrite: false }));
  m.position.set(t.x + 0.5 + rand(-0.2, 0.2), (t.kind === 'oven' ? (t.smokeY || 1.3) : (t.smokeY || 1.15)), t.z + 0.5 + rand(-0.2, 0.2)); scene.add(m);
  smoke.push({ m, v: new THREE.Vector3(rand(-0.15, 0.15), rand(0.6, 1.1), rand(0.05, 0.3)), life: 2.2 });
}
function updateSmoke(dt) {
  for (let i = smoke.length - 1; i >= 0; i--) { const s = smoke[i]; s.life -= dt; s.m.position.addScaledVector(s.v, dt); s.m.scale.multiplyScalar(1 + dt * 0.9); s.m.material.opacity = Math.max(0, s.life / 2.2) * 0.55;
    if (s.life <= 0) { scene.remove(s.m); s.m.material.dispose(); smoke.splice(i, 1); } }
}

// --------------------------------------------------------------- the night
function updateBear(dt) {
  const B = G.bear, door = tiles['12,3'], prog = G.t / SHIFT;
  if (B.inside) {
    B.insideT += dt; G.flicker = 1;
    insideBear.g.position.set(11.3, 0, 3.6); insideBear.g.lookAt(player.x, 0, player.z);
    insideBear.head.rotation.z = Math.sin(B.insideT * 20) * 0.08; insideLight.intensity = Math.random() < 0.12 ? 0 : 16;
    if (B.insideT > 1.6) jumpscare();
    return;
  }
  const N = G.N;
  if (B.stage < 4) {
    if (!B.scripted) B.moveT -= dt;
    if (B.moveT <= 0) {
      B.moveT = rand(N.move[0], N.move[1]) - prog * 1.5;
      if (Math.random() < N.adv + prog * 0.15) {
        B.stage++; G.glitch = 1; G.flicker = Math.max(G.flicker, 0.35); SFX.step(0.25 + B.stage * 0.2);
        if (B.stage === 3) setTimeout(() => SFX.breath(), 600);
        if (B.stage === 4) { B.held = 0; B.open = 0; B.bangT = 0.3; B.attacks++; B.lurk = B.tutorial || G.night === 0 ? 0 : (N.lurk || 3.5) * rand(0.85, 1.15); B.lurk0 = B.lurk; if (!B.lurk) { doorLight.intensity = 3; if (G.night > 0) hint('door'); } }
      }
    }
  } else if (B.lurk > 0) {
    // silent: standing behind the door. Only CAM 4A, the wall monitor, or his eyes in the door window give him away
    B.lurk -= dt; const holding = player.holdingDoor; if (holding) B.held += dt * 1.5;
    if (B.held >= N.hold * 0.6) { B.lurk = 0; B.stage = G.night >= 3 && Math.random() < 0.3 ? 3 : Math.random() < 0.6 ? 2 : 1; B.moveT = rand(N.move[0], N.move[1]) + 2; B.held = 0; SFX.retreat(); pop('HE GAVE UP', 11, 3.5); lessonEvent('retreat'); G.calm = (G.calm || 0) + 1; }
    else if (B.lurk <= 0) { B.bangT = 0; doorLight.intensity = 3; SFX.bang(1.3); G.shake = 0.7; hint('door'); }   // now he pushes
  } else {
    B.bangT -= dt;
    const holding = player.holdingDoor;
    if (holding) B.held += dt;
    B.open = clamp(B.open + (holding ? -2.2 : 1 / (N.open * (B.tutorial ? 1.5 : 1))) * dt, 0, 1);
    if (B.bangT <= 0) { B.bangT = holding ? rand(0.5, 0.8) : rand(0.8, 1.2); SFX.bang(holding ? 1 : 0.7); G.shake = Math.max(G.shake, holding ? 0.5 : 0.25); if (!holding && B.open > 0.3) SFX.creak(); }
    if (B.open >= 1) { B.inside = true; B.insideT = 0; insideBear.g.visible = true; door.eyes.visible = false; SFX.bang(1.2); G.shake = 0.8; }
    else if (B.held >= N.hold) { B.stage = G.night >= 3 && Math.random() < 0.4 ? 3 : Math.random() < 0.6 ? 2 : 1; /* thu+: sometimes he only pretends to leave */ B.moveT = rand(N.move[0], N.move[1]) + 2; B.open = 0; B.tutorial = false; B.scripted = false; SFX.retreat(); pop('IT WALKED AWAY', 11, 3.5); lessonEvent('retreat'); }
  }
  // door visuals
  const pushing = B.stage === 4 && !(B.lurk > 0);
  door.panel.rotation.y = damp(door.panel.rotation.y, -B.open * 1.1 + (B.stage === 4 ? Math.sin(G.t * 40) * 0.02 * (G.shake > 0.2 ? 1 : 0) : 0), 12, dt);
  door.eyes.visible = B.stage === 4 && !B.inside;
  doorBear.g.visible = B.stage === 4 && !B.inside; play(doorBear, B.lurk > 0 ? 'idle' : 'scratch', { speed: B.lurk > 0 ? 0.6 : 1.3 }); play(bear, B.stage === 3 ? 'walk' : 'idle', { speed: B.stage === 3 ? 0.35 : 1 }); outLight.intensity = doorBear.g.visible ? 2 + B.open * 6 : 0;
  if (doorBear.g.visible) { doorBear.g.position.x = 13.75 - B.open * 0.45; doorBear.jaw.rotation.x = 0.2 + Math.sin(G.t * 11) * 0.12; doorBear.head.rotation.z = Math.sin(G.t * 3) * 0.1; }
  doorLight.intensity = damp(doorLight.intensity, pushing ? 2.5 + Math.sin(G.t * 12) * 1 : B.stage === 4 ? 0.5 : 0, 6, dt);
  const dEl = $('door'); dEl.classList.toggle('on', pushing); dEl.classList.toggle('near', false);
  if (pushing) { const holding = player.holdingDoor; $('doorTxt').textContent = holding ? 'HOLD IT SHUT...' : 'HE\'S AT THE DOOR!';
    $('doorBar').style.width = (holding ? B.held / N.hold : B.open) * 100 + '%'; dEl.classList.toggle('holding', holding); }
  // the bear on cameras
  const sp = B.stage === 4 ? [10.2, 0, 0.5, -Math.PI / 2] : STAGE_POS[Math.min(B.stage, 3)];
  bear.g.visible = B.stage < 4 || B.lurk > 0;
  bear.g.position.set(sp[0], sp[1], sp[2]); bear.g.rotation.y = sp[3];
  bear.head.rotation.y = Math.sin(G.t * 0.7) * 0.15; bear.jaw.rotation.x = B.stage >= 3 ? 0.25 + Math.sin(G.t * 9) * 0.1 : 0;
}
function jumpscare() {
  if (G.state !== 'play') return;
  document.body.classList.remove('playing'); G.state = 'scare'; G.scareT = 0; SFX.scream(); showTablet(false); $('hud').classList.add('hide'); $('touch').classList.add('hide'); if (call.active) endCall();
  scareBear.g.visible = true; play(scareBear, 'idle', { fade: 0, speed: 3 });
}
const scareBear = buildBear(); scareBear.g.visible = false; camera.add(scareBear.g); scene.add(camera);
scareBear.g.position.set(0, -2.35, -2.1); scareBear.g.rotation.y = 0;
scareBear.g.traverse(o => { if (o.isMesh) o.castShadow = false; });
const scareLight = new THREE.PointLight('#ffe8d0', 0, 5, 1.4); scareLight.position.set(0, -0.45, -0.6); camera.add(scareLight);

// --------------------------------------------------------------- tablet / monitor

// AUDIO LURE (cameras' own power): play Pepper's jingle in the room you're watching; he walks back to it if he can hear it (≤ 2 rooms away)
// and isn't already pushing on the door. Cooldown makes the door the backup plan.
const LURE_ROOM = [0, 1, 2];   // cam index -> the stage that room is
function lureReady() { return (G.lureCD || 0) <= 0 && G.power !== false; }
function lure() {
  if (G.state !== 'play' || !G.tablet) return;
  if (!lureReady()) { tone(180, 0.12, 0.05, 'square'); return; }
  const B = G.bear, room = LURE_ROOM[G.cam], N = G.N;
  G.lureCD = (N.lureCD || 14) + (G.lured || 0) * 4; G.lureMax = G.lureCD; G.flags.lured = true; SFX.cam();   // he gets used to the song: each success makes the next recharge longer
  [659, 784, 880, 784, 659].forEach((f, i) => setTimeout(() => SFX.note(f, 0.06), i * 160));   // tinny jingle through the speakers
  const pushing = B.stage === 4 && !(B.lurk > 0);
  if (!B.inside && !pushing && B.stage > room && B.stage - room <= 2) {
    setTimeout(() => { if (B.inside || (B.stage === 4 && !(B.lurk > 0))) return;
      B.stage = room; B.lurk = 0; B.held = 0; B.open = 0; B.moveT = rand(N.move[0], N.move[1]) + 1.5; G.glitch = 1; SFX.retreat(); G.lured = (G.lured || 0) + 1; lessonEvent('lure');
      showBanner('♪ HE FOLLOWS THE MUSIC', CAMS[G.cam].name.split('—')[1].trim()); }, 650);
  } else setTimeout(() => showBanner('♪ NOTHING', pushing ? 'TOO LATE — HOLD THE DOOR' : B.stage <= room ? 'HE IS NOT PAST THIS ROOM' : 'TOO FAR — HE CAN\'T HEAR IT'), 650);
}
function updateLure(dt) {
  G.lureCD = Math.max(0, (G.lureCD || 0) - dt);
  const b = $('lureBtn'); b.classList.toggle('cd', !lureReady()); $('lureBar').style.width = (G.lureCD > 0 ? (1 - G.lureCD / (G.lureMax || 14)) * 100 : 0) + '%';
  b.querySelector('.ln').textContent = G.lureCD > 0 ? `♪ RECHARGING ${Math.ceil(G.lureCD)}s` : '♪ PLAY JINGLE HERE';
  $('tablet').classList.toggle('dark', G.power === false);
}
function showTablet(on) {
  G.tablet = on; $('tablet').classList.toggle('hide', !on); document.body.classList.toggle('tab', on); $('hud').classList.toggle('tab', on);
  if (on) { setCam(camOf(G.bear.stage) === G.cam ? G.cam : G.cam); SFX.cam(); hint('cam'); }
}
function setCam(c) { G.cam = c; $('camLab').textContent = CAMS[c].name; document.querySelectorAll('#tablet .map button').forEach((b, i) => b.classList.toggle('on', i === c)); SFX.cam(); G.glitch = Math.max(G.glitch, 0.6); }

// static canvas overlay (full-screen tablet noise)
const stc = $('static'), stx = stc.getContext('2d');
function sizeStatic() { stc.width = 200; stc.height = Math.round(200 * innerHeight / innerWidth); stc.style.width = '100%'; stc.style.height = '100%'; }
sizeStatic();
function drawStatic(a) {
  stc.style.opacity = a; if (a < 0.01) return;
  const im = stx.createImageData(stc.width, stc.height), d = im.data;
  for (let i = 0; i < d.length; i += 4) { const v = Math.random() * 255; d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255; }
  stx.putImageData(im, 0, 0);
}

// --------------------------------------------------------------- HUD / hints / pops
function updateHUD() {
  const mins = Math.min(359, Math.floor(G.t / SHIFT * 360)), hh = Math.floor(mins / 60), mm = mins % 60; $('hour').textContent = `${hh === 0 ? 12 : hh}:${String(mm).padStart(2, '0')}`;
  $('cash').textContent = '$' + G.cash;
  if (!G.N) return;
  $('clockBar').style.width = clamp(G.t / SHIFT, 0, 1) * 100 + '%';
  $('goalBar').style.width = clamp(G.cash / (G.N.quota * 1.8), 0, 1) * 100 + '%';
  if (!G.quotaMet && G.cash >= G.N.quota && G.state === 'play') { G.quotaMet = true; $('money').classList.add('ok'); showBanner('QUOTA MET', 'NOW SURVIVE UNTIL 6 AM'); SFX.chime(); }
  $('clockS').textContent = G.quotaMet ? 'JUST SURVIVE' : !G.clockOn ? 'TRAINING' : 'SURVIVE UNTIL 6 AM';
}
function wipe(fn) { const w = $('wipe'); w.classList.remove('go'); void w.offsetWidth; w.classList.add('go'); noise(0.35, 0.08, 4000); setTimeout(fn, 190); }
function showBanner(big, small) { const b = $('banner'); b.innerHTML = `${big}<small>${small}</small>`; b.classList.add('on'); clearTimeout(G.bannerT); G.bannerT = setTimeout(() => b.classList.remove('on'), 2600); }
const HINTS_ = () => ({
  start: TOUCH ? 'Walk with the stick · USE to grab dough from the crate' : 'WASD move · E grab / place · hold E to chop',
  pick: 'Dough + chopped tomato + cheese on a plate → into the OVEN',
  chop: TOUCH ? 'Hold USE on the board to chop' : 'Hold E on the board to chop',
  oven: 'Wait for the ding. Don\'t let it burn.',
  door: TOUCH ? 'RUN TO THE DOOR · HOLD THE DOOR BUTTON' : 'RUN TO THE DOOR · HOLD SPACE',
  cam: 'Play the jingle on the camera where he is (or one room behind) to pull him back.',
  monitor: 'The monitor above the counter shows the hallway. Keep an eye on it.',
  power: 'POWER OUT. Listen for footsteps.',
});
function hint(id) { if (G.hints.has(id) || (G.night === 0 && !G.lessonDone && id !== 'power')) return; G.hints.add(id); const el = $('hint'); el.textContent = HINTS_()[id]; el.classList.add('on'); G.hintT = id === 'door' ? 4 : 5; }
function pop(text, x, z, bad) { const el = document.createElement('div'); el.className = 'pop' + (bad ? ' bad' : ''); el.textContent = text; document.body.appendChild(el); pops.push({ el, p: new THREE.Vector3(x, 1.6, z), t: 0 }); }
const _v = new THREE.Vector3();

// progress bars over stations: cooking (green), done (gold), about to burn (red, blinking), chopping
const bars = new Map();
function updateBars() {
  const show = G.state === 'play' && !G.tablet;
  for (const t of Object.values(tiles)) {
    let k = null, cls = '';
    if (show && t.item) {
      if (t.kind === 'oven' && t.item.type === 'plate') { if (t.item.pizza === 0) k = t.cook / 7; else if (t.item.pizza === 1) { k = 1 - (t.cook - 7) / 8; cls = t.cook > 11 ? 'warn' : 'done'; } }
      if (t.kind === 'stove') { if (t.item.state === 'raw') k = t.cook / 5; else if (t.item.state === 'cooked') { k = 1 - (t.cook - 5) / 7; cls = t.cook > 9 ? 'warn' : 'done'; } }
      if (t.kind === 'board' && t.progress > 0 && t.item.state !== 'chopped') k = t.progress / 1.3;
    }
    let el = bars.get(t);
    if (k === null) { if (el) el.style.display = 'none'; continue; }
    if (!el) { el = document.createElement('div'); el.className = 'pb'; el.innerHTML = '<i></i>'; document.body.appendChild(el); bars.set(t, el); }
    _v.set(t.x + 0.5, (t.top || 1) + 0.55, t.z + 0.5).project(camera);
    el.style.display = ''; el.className = 'pb ' + cls; el.firstChild.style.width = clamp(k, 0, 1) * 100 + '%';
    el.style.left = ((_v.x + 1) / 2 * innerWidth) + 'px'; el.style.top = ((1 - _v.y) / 2 * innerHeight) + 'px';
  }
}

// guide: what should I do next? (always on for MON/TUE, after 6 s of hesitation on later nights)
const tileK = k => Object.values(tiles).find(t => t.kind === k);
function nextTarget() {
  const h = player.hold, oven = tileK('oven'), stove = tileK('stove'), plates = tileK('plates'), serveT = tileK('serve'), trash = tileK('trash');
  const crate = x => tileK('crate:' + x), bds = boards(), counters = Object.values(tiles).filter(t => t.kind === 'counter');
  const chopped = x => bds.find(b => b.item && b.item.type === x && b.item.state === 'chopped');
  const rawOn = x => bds.find(b => b.item && b.item.type === x && b.item.state !== 'chopped');
  const freeBoard = () => bds.find(b => !b.item);
  const nearFree = () => counters.filter(t => !t.item).sort((a, b) => Math.hypot(a.x - player.x, a.z - player.z) - Math.hypot(b.x - player.x, b.z - player.z))[0];
  const plateWaiting = it => Object.values(tiles).find(t => t.item && t.item.type === 'plate' && !t.item.pizza && t.kind !== 'oven' && plateAccepts(t.item, it));
  const want = G.orders[0] ? G.orders[0].type : null;
  if (h) {
    if (h.type === 'plate') {
      const d = dishOf(h); if (d) return [serveT, 'SERVE'];
      if (h.pizza === 2) return [trash, 'TRASH IT'];
      if (isRawPizza(h)) return oven.item ? [nearFree(), 'PUT DOWN'] : [oven, 'BAKE'];
      const pz = [...h.contents].some(x => PIZZA.includes(x)) || (!h.contents.size && want !== 'burger');
      for (const x of (pz ? PIZZA : BURGER)) { if (h.contents.has(x)) continue;
        if (x === 'tomato' || x === 'lettuce') { const b = chopped(x); if (b) return [b, 'ADD ' + x.toUpperCase()]; }
        else if (x === 'patty') { if (stove.item && stove.item.state === 'cooked') return [stove, 'ADD PATTY']; }
        else return [crate(x), 'ADD ' + x.toUpperCase()]; }
      return [nearFree(), 'PUT DOWN'];
    }
    if (h.state === 'burnt') return [trash, 'TRASH IT'];
    if ((h.type === 'tomato' || h.type === 'lettuce') && h.state !== 'chopped') return freeBoard() ? [freeBoard(), 'ON THE BOARD'] : [nearFree(), 'PUT DOWN'];
    if (h.type === 'patty' && h.state === 'raw') return stove.item ? [nearFree(), 'PUT DOWN'] : [stove, 'GRILL'];
    const pw = plateWaiting(h); return pw ? [pw, 'ADD TO PLATE'] : [nearFree(), 'PUT DOWN'];
  }
  if (oven.item && oven.item.pizza >= 1) return [oven, oven.item.pizza === 2 ? 'TAKE OUT' : 'TAKE OUT'];
  if (stove.item && stove.item.state === 'burnt') return [stove, 'TAKE OFF'];
  const ready = it => (it === 'tomato' || it === 'lettuce') ? !!chopped(it) : it === 'patty' ? !!(stove.item && stove.item.state === 'cooked') : true;
  const wp = Object.values(tiles).find(t => t.item && t.item.type === 'plate' && t.kind !== 'oven' && t.kind !== 'serve');
  if (wp) { const need = (([...wp.item.contents].some(x => PIZZA.includes(x)) ? PIZZA : BURGER)).filter(x => !wp.item.contents.has(x));
    if (!need.length || need.every(ready)) return [wp, 'PICK UP'];
  }
  const kind = want || (wp ? ([...wp.item.contents].some(x => PIZZA.includes(x)) ? 'pizza' : 'burger') : null); if (!kind) return null;
  if (kind === 'pizza') {
    if (oven.item) return null;   // baking: nothing urgent
    if (!chopped('tomato')) { const r = rawOn('tomato'); return r ? [r, 'CHOP (HOLD)'] : [crate('tomato'), 'GRAB TOMATO']; }
    return [plates, 'GRAB PLATE'];
  }
  if (!stove.item) return [crate('patty'), 'GRAB PATTY'];
  if (!chopped('lettuce')) { const r = rawOn('lettuce'); return r ? [r, 'CHOP (HOLD)'] : [crate('lettuce'), 'GRAB LETTUCE']; }
  return stove.item.state === 'cooked' || wp ? [plates, 'GRAB PLATE'] : [plates, 'GRAB PLATE'];
}
let guideEl = null;
function updateGuide(dt) {
  G.idleT = (G.idleT || 0) + dt;
  const assist = G.night <= 1 || G.idleT > 6;
  const on = G.state === 'play' && assist && !G.tablet && G.bear.stage < 4 && !G.bear.inside && !(G.night === 0 && lessonNow && ['move', 'cam', 'camoff', 'door', 'wait'].includes(lessonNow.id));
  const tv = on ? nextTarget() : null;
  if (!guideEl) { guideEl = document.createElement('div'); guideEl.className = 'guide'; document.body.appendChild(guideEl); }
  if (!tv || !tv[0]) { guideEl.style.display = 'none'; return; }
  const [t, verb] = tv; _v.set(t.x + 0.5, (t.top || 1) + 0.9 + Math.sin(performance.now() / 180) * 0.06, t.z + 0.5).project(camera);
  guideEl.style.display = ''; guideEl.textContent = verb;
  const gw = guideEl.offsetWidth / 2 + 8; guideEl.style.left = clamp((_v.x + 1) / 2 * innerWidth, gw, innerWidth - gw) + 'px'; guideEl.style.top = clamp((1 - _v.y) / 2 * innerHeight, 40, innerHeight - 10) + 'px';
}
function updatePops(dt) { for (let i = pops.length - 1; i >= 0; i--) { const q = pops[i]; q.t += dt; q.p.y += dt * 0.8; _v.copy(q.p).project(camera);
  q.el.style.left = ((_v.x + 1) / 2 * innerWidth) + 'px'; q.el.style.top = ((1 - _v.y) / 2 * innerHeight) + 'px'; q.el.style.opacity = clamp(1.5 - q.t, 0, 1);
  if (q.t > 1.4) { q.el.remove(); pops.splice(i, 1); } } }

// =====================================================================
// INPUT
// =====================================================================
const keys = new Set(); let useHeld = false, doorHeld = false, stick = { on: false, x: 0, y: 0, id: null };
const KEYMAP = { ' ': 'Space', 'Enter': 'Enter', 'Escape': 'Escape', 'Tab': 'Tab', 'ArrowUp': 'ArrowUp', 'ArrowDown': 'ArrowDown', 'ArrowLeft': 'ArrowLeft', 'ArrowRight': 'ArrowRight' };
const codeOf = e => e.code || KEYMAP[e.key] || ('Key' + (e.key || '').toUpperCase());
addEventListener('keydown', e => {
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  const code = codeOf(e); if (e.repeat && keys.has(code)) { e.preventDefault(); return; }
  if (['Space', 'Tab', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter'].includes(code) || (G.state === 'play' && /^Key|^Digit/.test(code))) e.preventDefault();
  initAudio();
  const navD = { ArrowUp: -1, ArrowLeft: -1, KeyW: -1, ArrowDown: 1, ArrowRight: 1, KeyS: 1 }[code];
  if ((G.state === 'title' || G.state === 'over' || G.paused) && navD) { menuMove(navD); return; }
  if (G.state === 'title') { if ((code === 'Space' || code === 'Enter') && G.ready) { if (!menuGo()) startOrContinue(); } return; }
  if (G.state === 'brief') { if (code === 'Space' || code === 'Enter' || code === 'KeyE') { e.preventDefault(); beginNight(); } return; }
  if (G.state === 'over') { if (code === 'Enter' || code === 'Space') menuGo(); return; }
  if (call.active && !G.paused && (code === 'Escape' || code === 'Enter')) { if (code === 'Escape') endCall(); else nextCallLine(); return; }
  if (code === 'Escape' || code === 'KeyP') { pauseGame(!G.paused); return; }
  if (G.paused) { if (code === 'Enter' || code === 'Space') menuGo(); return; }
  if (G.state !== 'play') return;
  if (!keys.has(code)) {
    if (code === 'KeyE' || code === 'KeyJ') { if (!G.tablet) interact(); }
    if (code === 'Tab' || code === 'KeyQ') showTablet(!G.tablet);
    if (G.tablet && ['Digit1', 'Digit2', 'Digit3'].includes(code)) setCam(+code.slice(5) - 1);
    if (G.tablet && (code === 'Space' || code === 'KeyL' || code === 'Enter' || code === 'KeyE')) lure();
  }
  keys.add(code);
});
addEventListener('keyup', e => keys.delete(codeOf(e)));
// =====================================================================
// LESSONS (night 1 tutorial) — each finishes when you actually do it
// =====================================================================
const K = (desk, touch) => ({ desk, touch }); const KR = v => v && v.desk !== undefined ? (TOUCH ? v.touch : v.desk) : v;
const LESSONS = [
  { id: 'move', keys: K(['W', 'A', 'S', 'D'], ['STICK']), verb: 'MOVE', sub: 'WALK AROUND THE KITCHEN', check: () => G.moved > 1.5 },
  { id: 'tomato', keys: K(['E'], ['USE']), verb: 'GRAB A TOMATO', sub: 'FROM THE CRATE ON THE BACK COUNTER', check: () => player.hold && player.hold.type === 'tomato' },
  { id: 'board', keys: K(['E'], ['USE']), verb: 'PUT IT ON A BOARD', sub: 'CUTTING BOARDS ARE ON THE LEFT WALL', check: () => boards().some(t => t.item && t.item.type === 'tomato') },
  { id: 'chop', keys: K(['HOLD E'], ['HOLD USE']), verb: 'CHOP IT', sub: 'STAND AT THE BOARD WITH EMPTY HANDS', check: () => boards().some(t => t.item && t.item.type === 'tomato' && t.item.state === 'chopped') || (player.hold && player.hold.type === 'plate' && player.hold.contents.has('tomato')) },
  { id: 'plate', keys: K(['E'], ['USE']), verb: 'GRAB A PLATE', sub: 'THE STACK NEXT TO THE STOVE', check: () => player.hold && player.hold.type === 'plate' },
  { id: 'scoop', keys: K(['E'], ['USE']), verb: 'SCOOP THE TOMATO ON', sub: 'USE THE BOARD WHILE HOLDING THE PLATE', check: () => player.hold && player.hold.type === 'plate' && player.hold.contents.has('tomato') },
  { id: 'top', keys: K(['E'], ['USE']), verb: 'ADD DOUGH + CHEESE', sub: 'USE THEIR CRATES WHILE HOLDING THE PLATE', check: () => player.hold && isRawPizza(player.hold) },
  { id: 'oven', keys: K(['E'], ['USE']), verb: 'BAKE IT', sub: 'PUT THE PLATE IN THE OVEN', check: () => tiles['5,0'].item && isRawPizza(tiles['5,0'].item) },
  { id: 'wait', keys: [], verb: 'WAIT FOR THE DING', sub: "THEN TAKE IT OUT. DON'T LET IT BURN", check: () => player.hold && dishOf(player.hold) === 'pizza' },
  { id: 'serve', keys: K(['E'], ['USE']), verb: 'RING IT UP AT THE WINDOW', sub: 'THE SERVING WINDOW AT THE FRONT', check: () => G.flags.served },
  { id: 'cam', keys: K(['TAB'], ['CAM']), verb: 'SOMETHING MOVED', sub: K('OPEN THE CAMERAS (TAB)', 'OPEN THE CAMERAS'), check: () => G.tablet, start: () => { G.bear.stage = 2; G.glitch = 1; G.flicker = 0.6; SFX.step(0.6); } },
  { id: 'lure', keys: K(['SPACE'], ['♪']), verb: 'LURE HIM BACK', sub: K('PRESS SPACE TO PLAY HIS JINGLE ON THIS CAMERA', 'TAP PLAY JINGLE ON THIS CAMERA'), check: () => G.flags.lured,
    start: () => { G.bear.stage = 3; setCam(2); } },
  { id: 'camoff', keys: K(['TAB'], ['CAM']), verb: 'GET BACK TO WORK', sub: 'THE JINGLE NEEDS TIME TO RECHARGE. LISTEN FOR FOOTSTEPS', check: () => !G.tablet,
    start: () => { setTimeout(() => { if (G.night === 0 && G.bear.stage < 3) { G.bear.stage = 3; G.glitch = 1; SFX.step(0.8); setTimeout(() => SFX.breath(), 500); } }, 1800); } },
  { id: 'door', keys: K(['HOLD SPACE'], ['HOLD DOOR']), verb: 'HOLD THE DOOR!', sub: 'NO JINGLE LEFT — RUN TO THE DOOR ON THE RIGHT AND HOLD IT', check: () => G.flags.retreat,
    start: () => { G.lureCD = 30; G.lureMax = 30; setTimeout(() => { if (G.night === 0 && G.bear.stage < 4) { G.bear.tutorial = true; G.bear.stage = 3; G.bear.moveT = 0; G.bear.scripted = false; G.N._adv = G.N.adv; G.N.adv = 1; } }, 2500); } },
  { id: 'burger', keys: [], verb: 'YOU GOT THIS', sub: 'FILL EVERY TICKET · EARN THE TIPS GOAL · SURVIVE UNTIL 6 AM', check: () => G.lessonT > 6.5,
    start: () => { G.clockOn = true; G.tutorialCooking = false; G.nextOrder = 2; if (G.N._adv) G.N.adv = G.N._adv; G.bear.moveT = 10; } },
];
const boards = () => Object.values(tiles).filter(t => t.kind === 'board');
let lessonNow = null;
function showLesson(L) {
  lessonNow = L; G.lessonT = 0; if (L.start) L.start();
  $('lkeys').innerHTML = (KR(L.keys) || []).map(k => `<div class="kc">${k}</div>`).join(''); $('lverb').textContent = L.verb; $('lsub').textContent = KR(L.sub);
  const el = $('lesson'); el.classList.remove('done'); el.classList.add('on');
}
function lessonEvent(e) { G.flags[e === 'serve' ? 'served' : e] = true; }
function updateLessons(dt) {
  if (G.night !== 0 || G.lessonI >= LESSONS.length) return;
  G.lessonT += dt;
  if (!lessonNow) { if (G.lessonI === 0 && G.lessonT < 2.6) return; showLesson(LESSONS[G.lessonI]); return; } // let the NIGHT 1 card play first
  if (lessonNow.done) return;
  if (lessonNow.check()) {
    lessonNow.done = true; const el = $('lesson'); el.classList.add('done'); $('lverb').textContent = 'NICE.'; $('lkeys').innerHTML = ''; $('lsub').textContent = '';
    tone(880, 0.08, 0.05); tone(1320, 0.16, 0.05, 'sine', 0, 0.07);
    setTimeout(() => { el.classList.remove('on'); lessonNow = null; G.lessonI++; if (G.lessonI >= LESSONS.length) G.lessonDone = true; }, 900);
  }
}

// =====================================================================
// PHONE CALLS (story)
// =====================================================================
// manager voice: ElevenLabs v4 lines (assets/voice/<call>_<line>.mp3) played through a phone-line filter
const VOX = { bufs: {}, src: null, hiss: null, chain: null };
async function loadVoice(key, n) {
  for (let j = 0; j < n; j++) { const id = `${key}_${j}`; if (VOX.bufs[id] !== undefined) continue; VOX.bufs[id] = null;
    fetch(`assets/voice/${id}.mp3`).then(r => r.ok ? r.arrayBuffer() : Promise.reject()).then(ab => { VOX.bufs[id] = ab; }).catch(() => { }); }
}
function phoneChain() {
  if (VOX.chain || !AC) return VOX.chain;
  const hp = AC.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 330;
  const lp = AC.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 3300;
  const pk = AC.createBiquadFilter(); pk.type = 'peaking'; pk.frequency.value = 1700; pk.gain.value = 5; pk.Q.value = 0.8;
  const sh = AC.createWaveShaper(); const c = new Float32Array(1024); for (let i = 0; i < 1024; i++) { const x = i / 511.5 - 1; c[i] = Math.tanh(x * 1.6) / Math.tanh(1.6); } sh.curve = c;
  const g = AC.createGain(); g.gain.value = 1.05; hp.connect(lp); lp.connect(pk); pk.connect(sh); sh.connect(g); g.connect(master);
  return VOX.chain = hp;
}
function lineHiss(on) {
  if (!AC) return;
  if (on && !VOX.hiss) { const n = AC.sampleRate * 2, b = AC.createBuffer(1, n, AC.sampleRate), d = b.getChannelData(0); for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * 0.018;
    const s = AC.createBufferSource(); s.buffer = b; s.loop = true; s.connect(phoneChain()); s.start(); VOX.hiss = s; }
  if (!on && VOX.hiss) { try { VOX.hiss.stop(); } catch (e) { } VOX.hiss = null; }
}
setTimeout(() => loadVoice('n' + (Math.min(save.unlocked, 4) + 1), STORY[Math.min(save.unlocked, 4)].length), 1500);   // the call you'll hear first
function stopVoice() { if (VOX.src) { try { VOX.src.onended = null; VOX.src.stop(); } catch (e) { } VOX.src = null; } }
function playCall(lines, who, done, key) {
  call.active = true; Object.assign(call, { lines, key, i: 0, c: 0, t: 0, done }); $('callWho').textContent = who; $('call').classList.remove('hide');
  $('callSk').textContent = TOUCH ? 'TAP HERE — NEXT' : 'ENTER — NEXT · ESC — HANG UP';
  ring(); lineHiss(true); speakLine();
}
function ring() { tone(440, 0.4, 0.05, 'sine'); tone(480, 0.4, 0.05, 'sine'); }
function speakLine() {
  stopVoice(); call.dur = 0; call.ended = false;
  const id = call.key && `${call.key}_${call.i}`, ab = id && VOX.bufs[id];
  if (!AC || !ab) return;   // no audio (blocked/missing): subtitles alone, old timing
  const myI = call.i;
  AC.decodeAudioData(ab.slice(0)).then(buf => {
    if (!call.active || call.i !== myI) return;
    const s = AC.createBufferSource(); s.buffer = buf; s.connect(phoneChain()); s.start(); VOX.src = s; call.dur = buf.duration;
    s.onended = () => { if (VOX.src === s) { VOX.src = null; call.ended = true; } };
  }).catch(() => { });
}
function updateCall(dt) {
  const line = call.lines[call.i]; if (!line) return;
  const rate = call.dur ? line.length / (call.dur * 0.92) : 45;   // subtitles keep pace with the voice
  call.c = Math.min(line.length, call.c + dt * rate); $('callTxt').textContent = line.slice(0, call.c | 0);
  if (call.dur) { if (call.ended) { call.t += dt; if (call.t > 0.45) nextCallLine(); } }
  else if (call.c >= line.length) { call.t += dt; if (call.t > 1.4 + line.length * 0.035) nextCallLine(); }
}
function nextCallLine() {
  const line = call.lines[call.i];
  if (line && call.c < line.length && !call.dur) { call.c = line.length; return; }
  call.i++; call.c = 0; call.t = 0;
  if (call.i >= call.lines.length) endCall(); else speakLine();
}
function endCall() { call.active = false; stopVoice(); lineHiss(false); $('call').classList.add('hide'); tone(300, 0.15, 0.04, 'square'); const d = call.done; call.done = null; d && d(); }

// =====================================================================
// FLOW: title → night card → call → shift → results
// =====================================================================
function renderNights() {
  const el = $('nights'); el.innerHTML = '';
  for (let i = 0; i < NIGHTS.length; i++) {
    const b = document.createElement('button'); const st = save.stars[i] || 0;
    b.innerHTML = `<b class="dn">${NIGHT_INFO[i].day.slice(0, 3)} · ${i + 1}</b><span class="nn">${i <= save.unlocked ? NIGHT_INFO[i].name : '???'}</span><i>${i <= save.unlocked ? ('★'.repeat(st) + '☆'.repeat(3 - st)) : 'LOCKED'}</i>`;
    b.disabled = i > save.unlocked; if (i === Math.min(save.unlocked, NIGHTS.length - 1)) b.classList.add('cur');
    onTap(b, () => { initAudio(); startNight(i); });
    el.appendChild(b);
  }
  setTimeout(() => menuSel(Math.min(save.unlocked, NIGHTS.length - 1)), 30);
  const cur = Math.min(save.unlocked, NIGHTS.length - 1);
  $('goMsg').textContent = cur ? `CONTINUE — ${NIGHT_INFO[cur].day}` : 'CLOCK IN FOR YOUR FIRST SHIFT';
  $('subMsg').innerHTML = save.unlocked >= NIGHTS.length - 1 && save.stars[NIGHTS.length - 1] ? 'WEEK SURVIVED. GO FOR ★★★ ON EVERY NIGHT.' : 'SURVIVE FIVE NIGHT SHIFTS. MAKE QUOTA. KEEP THE DOOR SHUT.';
}
function startNight(i) { wipe(() => startNight_(i)); }
function startNight_(i) {
  loadVoice(`n${i + 1}`, STORY[i].length); if (i === NIGHTS.length - 1) loadVoice('end', ENDING.length);
  initAudio(); if (call.active) endCall(); G.night = i;
  for (const id of ['title', 'over', 'pause']) $(id).classList.add('hide');
  $('hud').classList.remove('hide'); syncTouchUI();
  resetShift(); G.paused = false;
  G.flags = {}; G.lessonI = 0; G.lessonDone = false; G.moved = 0; lessonNow = null; $('lesson').classList.remove('on');
  G.clockOn = i !== 0; G.tutorialCooking = i === 0;
  if (i === 0) { const o = addOrder('pizza'); G.orders[0].tut = true; G.nextOrder = 1e9; }
  if (i === 1) { addOrder('burger'); G.nextOrder = 14; }
  $('quota').textContent = '/' + G.N.quota; $('quota').classList.remove('ok'); $('money').classList.remove('ok'); G.quotaMet = false;
  const sg = starGoals(G.N.quota); $('goalTick2').style.left = (100 / 1.8 * 1.4) + '%'; $('goalTick3').style.right = '0';
  $('pauseRecipes').innerHTML = recipeHTML(i);
  G.state = 'brief'; G.briefT = 0; beginNight_();   // straight into the kitchen: no reading before playing
}
function recipeHTML(i) {
  const row = (name, steps) => `<div class="rr"><b>${name}</b>${steps.map(x => `<span>${x}</span>`).join('<i>+</i>')}</div>`;
  return row('PIZZA', ['plate', 'dough', 'tomato <em>chop</em>', 'cheese', '<em>oven</em>']) + (i >= 1 ? row('BURGER', ['plate', 'bun', 'patty <em>grill</em>', 'lettuce <em>chop</em>']) : '');
}
function showBrief(i) {
  const N = NIGHTS[i], I = NIGHT_INFO[i], sg = starGoals(N.quota);
  G.state = 'brief'; $('hud').classList.add('hide'); $('touch').classList.add('hide');
  $('briefCard').innerHTML = `<div class="hd"><div class="day">${I.day}</div><div class="no">NIGHT ${i + 1} OF 5</div></div>
    <div class="nm">${I.name}</div>
    <h4>TONIGHT'S GOAL</h4><div class="goal">EARN <b>$${N.quota}</b> IN TIPS<br>AND SURVIVE UNTIL <b>6 AM</b></div>
    <h4>${i === 0 ? 'YOUR FIRST SHIFT' : 'NEW TONIGHT'}</h4><ul>${I.news.map(n => `<li>${n}</li>`).join('')}</ul>
    <h4>RECIPES</h4><div class="rcp">${recipeHTML(i)}</div>
    <h4>RATING</h4><div class="stars">★ $${sg[0]} &nbsp; ★★ $${sg[1]} &nbsp; ★★★ $${sg[2]}${save.stars[i] ? ` &nbsp;·&nbsp; BEST ${'★'.repeat(save.stars[i])}` : ''}</div>
    <div class="tip">TIP — ${I.tip}</div>
    <div class="go2" id="briefGo">${TOUCH ? 'TAP' : 'PRESS SPACE'} TO CLOCK IN</div>`;
  $('brief').classList.remove('hide'); G.briefT = performance.now();
}
function beginNight() {
  if (G.state !== 'brief' || performance.now() - G.briefT < 350) return;
  G.state = 'starting'; wipe(beginNight_);
}
function beginNight_() {
  const i = G.night; $('brief').classList.add('hide');
  $('hud').classList.remove('hide');
  initAudio(); SFX.cam();
  const card = $('card'); $('cardN').textContent = NIGHT_INFO[i].day; $('cardS').textContent = i === 0 ? 'YOUR FIRST SHIFT' : `${NIGHT_INFO[i].name} · GOAL $${G.N.quota}`;
  card.classList.remove('show'); void card.offsetWidth; card.classList.add('show');
  if (amb) amb.gain.setTargetAtTime(1, AC.currentTime, 1);
  G.state = 'play'; syncTouchUI(); document.body.classList.add('playing');
  setTimeout(() => { if (G.state === 'play' && G.night === i) playCall(STORY[i], `INCOMING CALL · MANAGER · NIGHT ${i + 1}`, () => { if (i > 0) hint('monitor'); }, `n${i + 1}`); }, i === 0 ? 2800 : 1400);
}
function startOrContinue() { startNight(Math.min(save.unlocked, NIGHTS.length - 1)); }
function toMenu() { wipe(toMenu_); }
function toMenu_() {
  stopVoice(); lineHiss(false);
  if (call.active) endCall();
  G.state = 'title'; G.paused = false; for (const id of ['over', 'pause', 'hud', 'touch', 'call']) $(id).classList.add('hide'); $('title').classList.remove('hide'); showTablet(false);
  if (amb) amb.gain.setTargetAtTime(0.3, AC.currentTime, 0.5); renderNights();
}
function pauseGame(on) { if (G.state !== 'play') return; G.paused = on; document.body.classList.toggle('playing', !on); if (on) menuSel(0); $('pause').classList.toggle('hide', !on); if (on) showTablet(false); try { if (AC) on ? AC.suspend() : AC.resume(); } catch (e) { } }
function weekComplete() {
  G.state = 'over'; $('hud').classList.add('hide'); $('touch').classList.add('hide');
  const ov = $('over'); ov.className = 'screen win'; ov.classList.remove('hide');
  $('overBig').textContent = 'WEEK COMPLETE'; $('overStamp').textContent = 'HIRED'; $('tcDay').textContent = 'END OF WEEK'; const tot = save.stars.reduce((a, b) => a + (b || 0), 0);
  $('overStars').textContent = '★'.repeat(Math.round(tot / 5)) + '☆'.repeat(3 - Math.round(tot / 5));
  $('overStats').textContent = `EMPLOYEE OF THE MONTH · ${tot}/15 STARS · PEPPER IS STILL HUNGRY`;
  $('overChk').innerHTML = ''; $('overNext').textContent = tot < 15 ? 'GO BACK FOR ★★★ ON EVERY NIGHT' : 'PERFECT WEEK.'; $('overTip').textContent = '';
  $('bNext').style.display = 'none'; $('bAgain').textContent = 'PLAY NIGHT 5 AGAIN';
  SFX.chime();
}


// =====================================================================
// INPUT LAYER — pointer events (mouse / touch / pen, every modern browser), keyboard (physical key codes, so AZERTY etc. work), gamepad
// =====================================================================
// one tap = one action: pointerup inside the element, deduped against the synthetic click that some browsers fire after it; Enter/Space on a focused button still works via click

// menu selection: arrows / WASD / d-pad move, Enter / Space / A confirm, hover follows the mouse; ticks like a game menu
function menuButtons() {
  const scr = ['pause', 'over', 'title'].map($).find(e => e && !e.classList.contains('hide') && (e.id !== 'pause' || G.paused));
  if (!scr) return [];
  return [...scr.querySelectorAll(scr.id === 'title' ? '#nights button:not(:disabled)' : '.btns button')].filter(b => b.offsetParent && b.style.display !== 'none');
}
function menuSel(i) { const bs = menuButtons(); if (!bs.length) return; G.menuI = (i + bs.length) % bs.length; bs.forEach((b, k) => b.classList.toggle('sel', k === G.menuI)); }
function menuMove(d) { const bs = menuButtons(); if (!bs.length) return false; menuSel((G.menuI ?? 0) + d); tone(900, 0.025, 0.03, 'square'); return true; }
function menuGo() { const bs = menuButtons(); const b = bs[G.menuI ?? 0]; if (!b) return false; b.click(); return true; }
document.addEventListener('pointerover', e => { const b = e.target.closest && e.target.closest('.btns button, #nights button:not(:disabled)'); if (!b) return; const bs = menuButtons(), k = bs.indexOf(b); if (k >= 0 && k !== G.menuI) { menuSel(k); tone(900, 0.02, 0.02, 'square'); } });
function onTap(el, fn) {
  let last = 0, downOn = false;
  el.addEventListener('pointerdown', e => { if (e.button > 0) return; downOn = true; e.stopPropagation(); unlockAudio(); });
  el.addEventListener('pointerup', e => { if (!downOn) return; downOn = false; e.stopPropagation(); e.preventDefault(); last = performance.now(); uiSfx(); fn(e); });
  el.addEventListener('pointercancel', () => downOn = false); el.addEventListener('pointerleave', () => downOn = false);
  el.addEventListener('click', e => { e.stopPropagation(); if (performance.now() - last > 600) { last = performance.now(); uiSfx(); fn(e); } });
}
// press-and-hold buttons (USE, HOLD DOOR): captured pointer, released on up / cancel / capture loss / app switch
const holds = new Set();
function onHold(el, down, up) {
  let pid = null;
  const release = () => { if (pid === null) return; pid = null; el.classList.remove('down'); holds.delete(release); up && up(); };
  el.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); unlockAudio(); if (pid !== null) return; pid = e.pointerId;
    try { el.setPointerCapture(pid); } catch (er) { } el.classList.add('down'); holds.add(release); buzz(12); down(e); });
  for (const ev of ['pointerup', 'pointercancel', 'lostpointercapture']) el.addEventListener(ev, e => { if (e.pointerId === pid) release(); });
}
function uiSfx() { tone(1250, 0.03, 0.035, 'square'); noise(0.03, 0.05, 3000); }
const buzz = ms => { try { navigator.vibrate && navigator.vibrate(ms); } catch (e) { } };
function releaseAll() { keys.clear(); useHeld = doorHeld = false; [...holds].forEach(r => r()); stickRelease(); }
// iOS/Safari only start audio from inside a user gesture's end event; resume on every gesture until it's running
function unlockAudio() { initAudio(); try { if (AC && AC.state !== 'running') AC.resume(); } catch (e) { } }
for (const ev of ['pointerup', 'touchend', 'keydown', 'mousedown']) addEventListener(ev, unlockAudio, { capture: true, passive: true });

// switch on-screen controls + prompts to whatever the player is actually using
function syncTouchUI() { $('touch').classList.toggle('hide', !(TOUCH && G.state === 'play')); document.body.classList.toggle('touchmode', TOUCH); $('camTip').textContent = TOUCH ? 'CAM — CLOSE' : 'TAB / Q — CLOSE · 1 2 3 — SWITCH'; }
function setMode(touch) { if (TOUCH === touch) return; TOUCH = touch; syncTouchUI(); if (lessonNow && !lessonNow.done) showLesson(lessonNow); if (G.state === 'brief') showBrief(G.night); }
addEventListener('pointerdown', e => { if (e.pointerType === 'touch' || e.pointerType === 'pen') setMode(true); }, { capture: true });
addEventListener('keydown', e => { if (!['Escape', 'F5', 'F11', 'F12'].includes(e.code)) setMode(false); }, { capture: true });

// browser chrome that breaks games: long-press menus, text selection, pinch/double-tap zoom, page scroll
addEventListener('contextmenu', e => e.preventDefault());
addEventListener('selectstart', e => e.preventDefault());
addEventListener('dragstart', e => e.preventDefault());
for (const ev of ['gesturestart', 'gesturechange']) addEventListener(ev, e => e.preventDefault());
addEventListener('touchmove', e => { if (!e.target.closest('#av, .scroll')) e.preventDefault(); }, { passive: false });
// losing focus mid-hold must not leave a key down; leaving mid-shift pauses
addEventListener('blur', releaseAll);
document.addEventListener('visibilitychange', () => { if (document.hidden) { releaseAll(); if (G.state === 'play' && !G.paused) pauseGame(true); } });
addEventListener('pagehide', releaseAll);

// screens: tap anywhere
onTap($('title'), () => { if (G.ready) startOrContinue(); });
onTap($('brief'), () => beginNight());
onTap($('call'), () => nextCallLine());
function onNext() { if (G.night + 1 < NIGHTS.length) startNight(G.night + 1); else { $('over').classList.add('hide'); G.state = 'ending'; playCall(ENDING, 'INCOMING CALL · MANAGER · 6:00 AM', weekComplete, 'end'); } }
onTap($('bNext'), onNext);
onTap($('bAgain'), () => startNight(G.night));
onTap($('bOverMenu'), toMenu);
onTap($('bResume'), () => pauseGame(false));
onTap($('bRetry'), () => startNight(G.night));
onTap($('bMenu'), toMenu);
document.querySelectorAll('#tablet .map button').forEach(b => onTap(b, () => setCam(+b.dataset.c)));
onHold($('lureBtn'), () => lure());

// on-screen buttons
onHold($('tUse'), () => { useHeld = true; if (G.state === 'play' && !G.tablet) interact(); }, () => useHeld = false);
onHold($('tDoor'), () => doorHeld = true, () => doorHeld = false);
onHold($('tCam'), () => { if (G.state === 'play') showTablet(!G.tablet); });
onHold($('tPause'), () => pauseGame(!G.paused));

// virtual stick: any touch/pen that starts on the left part of the screen during play
const stickBase = $('stickBase'), stickKnob = $('stickKnob'), STICK_R = 52;
function stickRelease() { if (stick.id === null && !stick.on) return; Object.assign(stick, { id: null, on: false, x: 0, y: 0 }); stickBase.classList.remove('on'); }
addEventListener('pointerdown', e => {
  if (G.state !== 'play' || G.paused || e.pointerType === 'mouse' || stick.id !== null) return;
  if (e.target.closest('.tbtn, #call, #tablet .map, button') || e.clientX > innerWidth * 0.55) return;
  e.preventDefault(); Object.assign(stick, { id: e.pointerId, ox: e.clientX, oy: e.clientY, on: true, x: 0, y: 0 });
  stickBase.style.left = e.clientX + 'px'; stickBase.style.top = e.clientY + 'px'; stickBase.classList.add('on'); stickKnob.style.transform = '';
}, { passive: false });
addEventListener('pointermove', e => { if (e.pointerId !== stick.id) return;
  let dx = e.clientX - stick.ox, dy = e.clientY - stick.oy; const l = Math.hypot(dx, dy); if (l > STICK_R) { dx *= STICK_R / l; dy *= STICK_R / l; }
  stickKnob.style.transform = `translate(${dx}px,${dy}px)`; const live = l > STICK_R * 0.18; stick.x = live ? dx / STICK_R : 0; stick.y = live ? dy / STICK_R : 0; }, { passive: true });
for (const ev of ['pointerup', 'pointercancel']) addEventListener(ev, e => { if (e.pointerId === stick.id) stickRelease(); });

// gamepad: left stick / d-pad move · A use (hold to chop) · B or RT hold door · Y or LB cameras · X/1-2-3 cycles cams · Start pause · A confirms menus
const pad = { prev: [] };
function pollPad() {
  const gps = navigator.getGamepads ? navigator.getGamepads() : []; const gp = [...gps].find(g => g && g.connected); if (!gp) { pad.active && (pad.active = false, stickRelease()); return; }
  const b = i => !!(gp.buttons[i] && (gp.buttons[i].pressed || gp.buttons[i].value > 0.5)), was = i => !!pad.prev[i], hit = i => b(i) && !was(i);
  let ax = gp.axes[0] || 0, ay = gp.axes[1] || 0; if (b(14)) ax = -1; if (b(15)) ax = 1; if (b(12)) ay = -1; if (b(13)) ay = 1;
  const moving = Math.hypot(ax, ay) > 0.22;
  if (moving || gp.buttons.some(x => x.pressed)) { if (!pad.active) { pad.active = true; setMode(false); } }
  if (G.state === 'play' && !G.paused) {
    if (moving) Object.assign(stick, { on: true, id: 'pad', x: ax, y: ay }); else if (stick.id === 'pad') Object.assign(stick, { on: false, id: null, x: 0, y: 0 });
    useHeld = b(0) && !G.tablet; if (hit(0)) { if (G.tablet) lure(); else interact(); } if (G.tablet && hit(1)) showTablet(false);
    doorHeld = b(1) || b(7);
    if (hit(3) || hit(4)) showTablet(!G.tablet);
    if (G.tablet && (hit(2) || hit(5))) setCam((G.cam + 1) % 3);
    if (call.active && hit(2)) nextCallLine();
  } else {
    if (hit(12) || hit(14)) menuMove(-1); if (hit(13) || hit(15)) menuMove(1);
    if (hit(0)) { if (G.state === 'brief') beginNight(); else if (!menuGo() && G.state === 'title' && G.ready) startOrContinue(); }
  }
  if (hit(9)) { if (G.state === 'play') pauseGame(!G.paused); }
  pad.prev = gp.buttons.map(x => x.pressed || x.value > 0.5);
}
// =====================================================================
// LOOP
// =====================================================================
function updatePlayer(dt) {
  const holdDoorKey = keys.has('Space') || doorHeld;
  player.holdingDoor = holdDoorKey && nearDoor() && !G.tablet;
  let ix = (keys.has('KeyD') || keys.has('ArrowRight') ? 1 : 0) - (keys.has('KeyA') || keys.has('ArrowLeft') ? 1 : 0);
  let iz = (keys.has('KeyS') || keys.has('ArrowDown') ? 1 : 0) - (keys.has('KeyW') || keys.has('ArrowUp') ? 1 : 0);
  if (stick.on) { ix = stick.x; iz = stick.y; }
  if (G.tablet || player.holdingDoor) { ix = 0; iz = 0; }
  const l = Math.hypot(ix, iz); if (l > 1) { ix /= l; iz /= l; }
  const sp = 4.6;
  player.vx = damp(player.vx, ix * sp, 14, dt); player.vz = damp(player.vz, iz * sp, 14, dt);
  const ox = player.x, oz = player.z;
  const r = collide(player.x + player.vx * dt, player.z + player.vz * dt); if (r) { player.x = r[0]; player.z = r[1]; }
  player.speed = dt > 0 ? Math.hypot(player.x - ox, player.z - oz) / dt : 0;   // real speed after collision: no running in place against counters
  if (l > 0.15) player.face = Math.atan2(ix, iz) + 0 * 0;
  if (player.holdingDoor) player.face = Math.PI / 2;
  const useNow = keys.has('KeyE') || keys.has('KeyJ') || useHeld;
  updateChop(dt, useNow && !G.tablet);
  // animate chef
  const hs = player.speed; player.walk += hs * dt * 3.2;
  chef.g.position.set(player.x, 0, player.z);
  chef.g.rotation.y = damp(chef.g.rotation.y + ((player.face - chef.g.rotation.y + Math.PI * 3) % (Math.PI * 2) - Math.PI), chef.g.rotation.y, 0, dt);
  chef.g.rotation.y = player.face;
  const sw = Math.sin(player.walk) * Math.min(hs / 3, 1);
  chef.legs[0].position.z = sw * 0.12; chef.legs[1].position.z = -sw * 0.12; chef.body.position.y = Math.abs(sw) * 0.05;
  const push = player.holdingDoor ? 1 : 0, chop = player.chopping ? Math.sin(G.t * 26) : 0;
  chef.arms.forEach((a, i) => { a.rotation.x = damp(a.rotation.x, player.hold ? -1.3 : push ? -1.5 : player.chopping ? -1.1 + (i ? chop * 0.5 : 0) : sw * (i ? 0.6 : -0.6), 16, dt); });
  chef.body.rotation.x = damp(chef.body.rotation.x, push * 0.25, 10, dt);
  placeHeld();
  if (chef.mixer) {
    chef.lockT = Math.max(0, (chef.lockT || 0) - dt);
    if (player.holdingDoor) play(chef, 'push', { speed: 1.4 });
    else if (player.chopping) play(chef, 'chop', { speed: 1.6 });
    else if (hs > 0.6) play(chef, player.hold ? 'carry' : 'run', { speed: player.hold ? 1.5 : 1.05 });
    else if (chef.lockT <= 0) play(chef, player.hold ? 'carry' : 'idle', { speed: player.hold ? 0.0001 : 1 });
  }
  // target highlight
  const t = G.tablet ? null : facingTile();
  hl.visible = !!t && t.kind !== 'door'; if (t) hl.position.set(t.x + 0.5, (t.top || 1) + 0.02, t.z + 0.5);
}

let last = performance.now(), frameN = 0, monCam = 0, monT = 0;
function frame(now) {
  requestAnimationFrame(frame);
  if (innerWidth < 4 || innerHeight < 4) return;   // hidden / zero-size embed: don't draw into a 0×0 framebuffer
  onResize();
  const dt = Math.min((now - last) / 1000, 0.05); last = now; frameN++;
  const T = now / 1000;
  pollPad();
  if (G.state === 'assets') { viewerFrame(dt); return; }
  if (G.paused) { composer.render(); return; }
  for (const r of rigs) { let v = r.g.visible, o = r.g.parent; while (v && o && o !== scene) { v = o.visible; o = o.parent; } if (v) r.mixer.update(dt); }
  if (call.active && (G.state === 'play' || G.state === 'ending')) updateCall(dt);
  if (G.state === 'play') {
    if (G.clockOn) G.t += dt;
    const px = player.x, pz = player.z;
    updatePlayer(dt); updateCooking(dt); updateOrders(dt); updateBear(dt); updateHUD(); updateLessons(dt); updateBlackout(dt); updateLure(dt); updateAudioMood(dt);
    G.moved = (G.moved || 0) + Math.hypot(player.x - px, player.z - pz);
    $('quota').classList.toggle('ok', G.cash >= G.N.quota);
    if (G.t >= SHIFT && !G.bear.inside) endShift(true);
  } else if (G.state === 'title') {
    chef.g.position.set(player.x, 0, player.z);
    // Pepper stands in the kitchen on the title screen, staring at you. Twitches.
    insideBear.g.visible = true; insideBear.g.scale.setScalar(1.25); insideBear.g.position.set(9.9, 0, 4.9); insideBear.g.lookAt(camera.position.x, 0, camera.position.z);
    insideBear.head.rotation.z = Math.random() < 0.02 ? rand(-0.3, 0.3) : damp(insideBear.head.rotation.z, 0.18, 4, dt);
    insideBear.jaw.rotation.x = Math.random() < 0.01 ? 0.45 : damp(insideBear.jaw.rotation.x, 0.08, 6, dt);
    doorLight.intensity = 2 + Math.sin(T * 3) * 0.5; G.flicker = Math.max(G.flicker, Math.random() < 0.004 ? 0.7 : 0);
  }
  if (G.state === 'scare') {
    G.scareT += dt; scareLight.intensity = Math.random() < 0.2 ? 1 : (window.__models ? 9 : 3.2);
    scareBear.g.position.set(rand(-0.04, 0.04), (window.__models ? -1.3 : -2.3) + rand(-0.04, 0.04), (window.__models ? -3.2 : -1.75) + Math.min(G.scareT, 0.22) * (window.__models ? 5.2 : 0.5)); scareBear.jaw.rotation.x = 0.5 + Math.sin(G.scareT * 40) * 0.2;
    G.shake = 1; G.flicker = 1;
    if (G.scareT > 1.25) { scareBear.g.visible = false; scareLight.intensity = 0; endShift(false); }
  }
  G.hintT -= dt; if (G.hintT <= 0) $('hint').classList.remove('on');
  updateBars(); updateGuide(dt);
  updateSmoke(dt); updatePops(dt);
  // lighting mood: flicker
  G.flicker = Math.max(0, G.flicker - dt * 0.8); G.glitch = Math.max(0, G.glitch - dt * 1.4);
  const fl = G.flicker > 0 && Math.random() < G.flicker * 0.6 ? rand(0.05, 0.4) : 1;
  tube.intensity = 85 * fl * (G.bear.inside ? 0.25 : 1) * (G.power === false ? 0.15 : 1);
  // shake
  G.shake = Math.max(0, G.shake - dt * 2);
  fitCamera(); if (G.shake > 0) { camera.position.x += rand(-1, 1) * G.shake * 0.12; camera.position.y += rand(-1, 1) * G.shake * 0.08; }
  if (wallClock) wallClock.userData.hand.parent.rotation.z = -G.t / SHIFT * Math.PI * 2;
  exitGlow.intensity = Math.random() < 0.015 ? 0.4 : 3.5;
  const fear = clamp((G.bear.stage - 1) / 3, 0, 1) * (G.state === 'play' ? 1 : 0) + (G.bear.inside ? 0.6 : 0);
  gradePass.uniforms.t.value = T; gradePass.uniforms.fear.value = damp(gradePass.uniforms.fear.value, Math.min(1, fear), 3, dt);
  gradePass.uniforms.flash.value = G.state === 'scare' && G.scareT < 0.08 ? 0.7 : Math.max(0, gradePass.uniforms.flash.value - dt * 4);
  for (const l of hallLights) l.intensity = l.userData.base * (Math.random() < 0.03 ? 0.15 : 1);
  // security monitor: cycles cameras, renders at low res every other frame
  monT += dt; if (G.bear.stage === 3 && monCam !== 2 && G.state === 'play') { monCam = 2; monT = -4; G.glitch = 1; } else if (monT > 3.2) { monT = 0; monCam = (monCam + 1) % 3; G.glitch = Math.max(G.glitch, 0.35); }
  screenMat.uniforms.t.value = T; screenMat.uniforms.glitch.value = G.glitch;
  if (monitorLamp) monitorLamp.intensity = 1.6 + G.glitch * 2;
  if (G.tablet) {
    const k = camCams[G.cam]; k.aspect = innerWidth / innerHeight; k.updateProjectionMatrix();
    renderer.setRenderTarget(null); renderPass.camera = k; composer.render(); renderPass.camera = camera; drawStatic(0.07 + G.glitch * 0.5);
  } else {
    screenMat.uniforms.glitch.value = G.power === false ? 1 : G.glitch;
    if (frameN % 2 === 0 && G.power !== false) { renderer.setRenderTarget(rt); renderer.render(scene, camCams[monCam]); renderer.setRenderTarget(null); }
    composer.render(); drawStatic(G.state === 'scare' ? 0.18 : 0);
  }
}

// Pepper's jingle on a dying music box: starts when he's in the east hall, louder at the door, out of tune
const JINGLE = [659, 784, 880, 784, 659, 523, 587, 659, 587, 523, 440, 0, 659, 784, 880, 1047, 988, 880, 784, 0];
let mbT = 0, mbI = 0, ambT = 6;
function updateAudioMood(dt) {
  if (!AC || G.state !== 'play') return;
  const B = G.bear, lvl = B.inside ? 1 : B.stage >= 4 ? 0.8 : B.stage === 3 ? 0.4 : 0;
  if (lvl > 0) { mbT -= dt; if (mbT <= 0) { mbT = 0.3 + (1 - lvl) * 0.18 + (Math.random() < 0.1 ? 0.25 : 0); const f = JINGLE[mbI++ % JINGLE.length]; if (f) SFX.note(f * (B.inside ? 0.94 : 1), 0.05 * lvl); } }
  else mbI = 0;
  ambT -= dt; if (ambT <= 0) { ambT = rand(7, 16); if (Math.random() < 0.6) SFX.clank(); else SFX.creak(); }
}

// night 5: the power flickers out for a few seconds (no tube light, no wall monitor)
function updateBlackout(dt) {
  if (!G.N.blackout) return;
  G.boT = (G.boT ?? rand(15, 22)) - dt;
  if (G.power && G.boT <= 0) { G.power = false; G.boT = rand(3.5, 5); tone(80, 0.6, 0.2, 'sawtooth', 40); hint('power'); }
  else if (!G.power && G.boT <= 0) { G.power = true; G.boT = rand(14, 20); tone(120, 0.3, 0.08, 'square', 240); }
}
function endShift(win) {
  if (G.state === 'over') return;
  document.body.classList.remove('playing'); G.state = 'over'; G.overT = 0; showTablet(false); $('banner').classList.remove('on'); $('hint').classList.remove('on'); if (guideEl) guideEl.style.display = 'none'; $('card').classList.remove('show'); if (call.active) endCall(); $('touch').classList.add('hide'); $('lesson').classList.remove('on');
  const ov = $('over'); ov.classList.remove('hide');
  const q = G.N.quota, passed = win && G.cash >= q; G.passed = passed;
  ov.className = 'screen ' + (passed ? 'win' : 'lose'); $('tcDay').textContent = NIGHT_INFO[G.night].day + ' · NIGHT ' + (G.night + 1);
  $('overStamp').textContent = passed ? 'SURVIVED' : win ? 'FIRED' : 'EATEN';
  $('bNext').style.display = passed ? '' : 'none'; setTimeout(() => menuSel(0), 50); $('bNext').textContent = G.night + 1 < NIGHTS.length ? `NIGHT ${G.night + 2} →` : 'CLOCK OUT →'; $('bAgain').textContent = 'RETRY NIGHT';
  if (passed) {
    SFX.chime(); const stars = G.cash >= q * 1.8 ? 3 : G.cash >= q * 1.4 ? 2 : 1;
    save.stars[G.night] = Math.max(save.stars[G.night] || 0, stars); save.unlocked = Math.max(save.unlocked, Math.min(G.night + 1, NIGHTS.length - 1)); writeSave();
    $('overBig').textContent = '6 AM'; $('overStars').textContent = '★'.repeat(stars) + '☆'.repeat(3 - stars);
    $('overStats').textContent = `${NIGHT_INFO[G.night].day} SURVIVED · ${G.served} SERVED · ${G.missed} MISSED`;
  } else if (win) {
    SFX.bad(); $('overBig').textContent = "YOU'RE FIRED."; $('overStars').textContent = '';
    $('overStats').textContent = `YOU SURVIVED — BUT MADE $${G.cash} OF A $${q} QUOTA`;
  } else {
    $('overBig').textContent = 'PEPPER GOT YOU.'; $('overStars').textContent = '';
    $('overStats').textContent = `HE GOT IN AT ${$('hour').textContent} · $${G.cash} IN TIPS · ${G.served} SERVED`;
  }
  const sg = starGoals(q), ok = (c, t) => `<div class="${c ? 'y' : 'n'}">${c ? '✓' : '✗'} ${t}</div>`;
  $('overChk').innerHTML = ok(win, win ? 'SURVIVED UNTIL 6 AM' : 'KEEP THE DOOR SHUT UNTIL 6 AM') + ok(G.cash >= q, `TIPS $${G.cash} / $${q}`)
    + (passed ? ok(G.cash >= sg[2], `★★★ AT $${sg[2]}`) : '');
  const nx = G.night + 1;
  $('overNext').textContent = passed ? (nx < NIGHTS.length ? `UP NEXT: ${NIGHT_INFO[nx].day} — ${NIGHT_INFO[nx].name}` : 'ONE LAST CALL FROM THE MANAGER...') : '';
  $('overTip').textContent = passed ? '' : win ? 'TIP — Start a pizza, then prep the next ticket while it bakes. Tickets that expire cost you $5.'
    : 'TIP — Glance at the wall monitor. When it shows him in the hallway (and you hear footsteps), get to the door and hold it.';
  if (amb) amb.gain.setTargetAtTime(0.3, AC.currentTime, 0.4);
  insideBear.g.visible = false; insideLight.intensity = 0;
}
setInterval(() => { if (G.state === 'over') G.overT = (G.overT || 0) + 0.25; }, 250);

buildKitchen(); buildHall(); resetShift();
// title tableau: a pizza in the oven, the bear on the monitor
setTileItem(tiles['5,0'], Object.assign(newPlate(), { contents: new Set(PIZZA), pizza: 1 }));
setTileItem(tiles['5,3'], Object.assign(newPlate(), { contents: new Set(BURGER) }));
G.N = NIGHTS[0]; G.bear.stage = 2; updateBear(0); G.bear.stage = 0;
renderNights();
setTimeout(() => { $('lbar').style.width = '100%'; $('lstat').textContent = 'CLOCKING IN'; }, 150);
// wait for the character models (max ~6 s; the boxy fallback rigs keep the game playable if they never arrive)
Promise.race([Promise.all([modelsReady, new Promise(r => setTimeout(r, 900))]), new Promise(r => setTimeout(r, 6000))])
  .then(() => { $('loader').classList.add('done'); G.ready = true; setTimeout(() => $('loader').remove(), 700); });

// =====================================================================
// ASSET VIEWER (?assets) — browse every in-game asset: characters + clips, food, stations, sets, textures
// =====================================================================
let viewerFrame = () => {};
if (location.search.includes('assets')) modelsReady.then(initAssetViewer);
function initAssetViewer() {
  G.state = 'assets';
  for (const id of ['title', 'hud', 'touch', 'call', 'card', 'tablet', 'static']) $(id) && $(id).classList.add('hide');
  const vs = new THREE.Scene(), vcam = new THREE.PerspectiveCamera(40, innerWidth / innerHeight, 0.01, 200);
  const ctl = new OrbitControls(vcam, renderer.domElement); ctl.enableDamping = true;
  const studio = new THREE.Group(); vs.add(studio);
  studio.add(new THREE.HemisphereLight('#dfe6ff', '#3a3430', 1.6));
  const key = new THREE.DirectionalLight('#fff4e0', 2.6); key.position.set(3, 6, 4); key.castShadow = true; key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { left: -6, right: 6, top: 6, bottom: -6 }); studio.add(key);
  const rim = new THREE.DirectionalLight('#9ab8ff', 1.2); rim.position.set(-4, 3, -5); studio.add(rim);
  const moody = new THREE.Group(); vs.add(moody); moody.visible = false;
  const mSpot = new THREE.SpotLight('#e8f0d0', 60, 14, 0.7, 0.8, 1.6); mSpot.position.set(0, 6, 1.5); mSpot.castShadow = true; moody.add(mSpot, mSpot.target);
  moody.add(new THREE.HemisphereLight('#4a5a78', '#120a08', 0.4)); const mRed = new THREE.PointLight('#ff2a1a', 6, 6, 1.4); mRed.position.set(2.5, 1.5, 1); moody.add(mRed);
  const floor = new THREE.Mesh(new THREE.CircleGeometry(30, 48), new THREE.MeshStandardMaterial({ color: '#2a2a2e', roughness: 0.9 })); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; vs.add(floor);
  const grid = new THREE.GridHelper(20, 40, '#555', '#3a3a3a'); grid.position.y = 0.002; vs.add(grid);
  const stage = new THREE.Group(); vs.add(stage);
  let mixer = null, skel = null, labels = [], cur = null, look = 'studio', wire = false, spin = false;

  // ---- catalogue: every entry builds a fresh object from the same code the game uses
  const tileOf = k => Object.values(tiles).find(t => t.kind === k);
  const station = k => () => { const t = tileOf(k); const o = t.mesh.clone(true); o.position.set(0, 0, 0); o.rotation.set(0, 0, 0); if (t.itemMesh) o.remove(o.children.find(c => c.uuid === t.itemMesh.uuid)); return o; };
  const plateOf = (set, pz = 0) => { const p = newPlate(); set.forEach(x => p.contents.add(x)); p.pizza = pz; return p; };
  const FOOD = [
    ['dough', { type: 'dough', state: 'raw' }], ['tomato', { type: 'tomato', state: 'raw' }], ['tomato · chopped', { type: 'tomato', state: 'chopped' }],
    ['cheese', { type: 'cheese', state: 'raw' }], ['bun', { type: 'bun', state: 'raw' }], ['patty · raw', { type: 'patty', state: 'raw' }],
    ['patty · cooked', { type: 'patty', state: 'cooked' }], ['patty · burnt', { type: 'patty', state: 'burnt' }], ['lettuce', { type: 'lettuce', state: 'raw' }],
    ['lettuce · chopped', { type: 'lettuce', state: 'chopped' }], ['plate', newPlate()], ['pizza · raw', plateOf(PIZZA)], ['pizza · baked', plateOf(PIZZA, 1)],
    ['pizza · burnt', plateOf(PIZZA, 2)], ['burger', plateOf(BURGER)], ['burger · partial', plateOf(['bun', 'patty'])],
  ];
  const gridOf = (list, gap, scale = 1) => () => { const g = new THREE.Group(); const cols = Math.ceil(Math.sqrt(list.length));
    list.forEach(([name, mk], i) => { const o = mk(); o.scale.multiplyScalar(scale); o.position.set((i % cols - (cols - 1) / 2) * gap, 0, (Math.floor(i / cols) - (Math.ceil(list.length / cols) - 1) / 2) * gap); o.userData.label = name; g.add(o); }); return g; };
  const character = (name, h) => () => { const gl = GLTFS[name]; if (!gl) return new THREE.Group(); const m = cloneSkinned(gl.scene); m.scale.setScalar(h);
    m.traverse(o => { if (o.isMesh) { o.castShadow = true; o.frustumCulled = false; } }); const g = new THREE.Group(); g.add(m); g.userData.gltf = gl; g.userData.model = m; return g; };
  const CAT = [
    ['Characters', [
      ['Pepper · animatronic (Tripo, rigged)', character('pepper', 2.55), { file: 'assets/models/pepper.glb', concept: 'tools/gen/pepper/concept.png' }],
      ['Cook · player (Tripo, rigged)', character('cook', 1.5), { file: 'assets/models/cook.glb', concept: 'tools/gen/cook/concept.png' }],
      ['Pepper · legacy fallback rig', () => buildBear().g, {}],
      ['Cook · legacy fallback rig', () => buildChef().g, {}],
    ]],
    ['Food', [
      ['All food states', gridOf(FOOD.map(([n, it]) => [n, () => makeItem(it)]), 0.75, 1.4), {}],
      ...FOOD.map(([n, it]) => [n, () => { const o = makeItem(it); o.scale.setScalar(3); return o; }, {}]),
    ]],
    ['Stations', [
      ['All stations', gridOf([['dough crate', station('crate:dough')], ['tomato crate', station('crate:tomato')], ['cheese crate', station('crate:cheese')], ['bun crate', station('crate:bun')],
        ['beef crate', station('crate:patty')], ['lettuce crate', station('crate:lettuce')], ['oven', station('oven')], ['stove', station('stove')], ['plates', station('plates')],
        ['cutting board', station('board')], ['trash', station('trash')], ['serving window', station('serve')], ['counter', station('counter')]], 1.5), {}],
      ...['oven', 'stove', 'plates', 'board', 'trash', 'serve', 'counter', 'crate:dough', 'crate:tomato', 'crate:cheese', 'crate:bun', 'crate:patty', 'crate:lettuce'].map(k => [k.replace('crate:', 'crate · '), station(k), {}]),
      ['kitchen door', () => { const o = tiles['12,3'].mesh.clone(true); o.position.set(0, 0, 0); return o; }, {}],
    ]],
    ['Sets', [
      ['Kitchen (whole)', () => { const k = kitchen.clone(true); k.position.set(-6.5, 0, -3.5); return k; }, { far: 16 }],
      ['Pizzeria (camera sets)', () => { const h = HALL.clone(true); h.position.set(0, 0, 3); h.traverse(o => { if (o.isMesh && o.geometry.type === 'PlaneGeometry' && o.geometry.parameters.width >= 40) o.visible = false; }); return h; }, { far: 24 }],
    ]],
    ['Textures', Object.entries(T).map(([k, t]) => [k, null, { tex: t }]).concat([['crate label', null, { tex: crateTex('DOUGH') }]])],
  ];

  // ---- UI
  const css = document.createElement('style'); css.textContent = `
    #av { position:fixed; inset:0; pointer-events:none; z-index:20; font:500 12px var(--mono); color:#e8e4da; }
    #av .side { position:absolute; left:0; top:0; bottom:0; width:260px; overflow:auto; background:rgba(8,8,10,.92); border-right:1px solid #2a2a2e; pointer-events:auto; padding:14px 0; }
    #av h1 { font:30px var(--px); margin:0 16px 10px; letter-spacing:.05em; } #av h1 b { color:var(--red); font-weight:normal; }
    #av h2 { font:700 9px var(--mono); letter-spacing:.3em; opacity:.5; margin:14px 16px 4px; }
    #av .it { padding:5px 16px; cursor:pointer; } #av .it:hover { background:#1c1c20; } #av .it.on { background:#e8e4da; color:#000; }
    #av .info { position:absolute; right:0; top:0; width:300px; max-height:100%; overflow:auto; background:rgba(8,8,10,.92); border-left:1px solid #2a2a2e; pointer-events:auto; padding:14px 16px; box-sizing:border-box; }
    #av .info h3 { font:24px var(--px); margin:0 0 8px; } #av .row { display:flex; justify-content:space-between; padding:2px 0; border-bottom:1px dashed #2a2a2e; } #av .row span:first-child { opacity:.55; }
    #av .btns2 { display:flex; flex-wrap:wrap; gap:6px; margin:10px 0; } #av button { font:20px var(--px); background:#141418; color:#e8e4da; border:1px solid #555; padding:2px 10px; cursor:pointer; } #av button.on { background:#e8e4da; color:#000; }
    #av .info img { width:100%; margin-top:10px; background:#fff; } #av .tx { position:absolute; left:260px; right:300px; top:0; bottom:0; display:flex; align-items:center; justify-content:center; pointer-events:none; }
    #av .tx canvas { max-width:80%; max-height:80%; image-rendering:pixelated; box-shadow:0 10px 40px #000; } #av .lbl { position:absolute; transform:translate(-50%,0); font:500 10px var(--mono); background:rgba(0,0,0,.6); padding:1px 5px; white-space:nowrap; }
    #av .hint { position:absolute; left:276px; bottom:12px; opacity:.5; font-size:11px; }
    @media (max-width: 760px) { #av .side { width:150px; } #av .info { width:100%; top:auto; bottom:0; max-height:38%; } #av .tx { left:150px; right:0; bottom:38%; } #av .hint { display:none; } }`;
  document.head.appendChild(css);
  const av = document.createElement('div'); av.id = 'av'; document.body.appendChild(av);
  av.innerHTML = `<div class="side"><h1>NIGHT SHIFT <b>ASSETS</b></h1></div><div class="tx"></div><div class="info"></div><div class="hint">drag to orbit · scroll to zoom · right-drag to pan · [ ] prev/next</div><div class="labels"></div>`;
  const side = av.querySelector('.side'), info = av.querySelector('.info'), txBox = av.querySelector('.tx'), lblBox = av.querySelector('.labels');
  const flat = [];
  for (const [group, items] of CAT) { const h = document.createElement('h2'); h.textContent = group.toUpperCase(); side.appendChild(h);
    for (const e of items) { const d = document.createElement('div'); d.className = 'it'; d.textContent = e[0]; d.onclick = () => select(flat.indexOf(e)); side.appendChild(d); e.el = d; e.group = group; flat.push(e); } }
  addEventListener('keydown', ev => { if (ev.key === ']' || ev.key === 'ArrowDown') { ev.preventDefault(); select((flat.indexOf(cur) + 1) % flat.length); } if (ev.key === '[' || ev.key === 'ArrowUp') { ev.preventDefault(); select((flat.indexOf(cur) - 1 + flat.length) % flat.length); } });

  const stats = o => { let tris = 0, meshes = 0; const mats = new Set(), texs = new Set(); o.traverse(m => { if (!m.isMesh) return; meshes++;
    const gg = m.geometry; tris += (gg.index ? gg.index.count : gg.attributes.position.count) / 3; [].concat(m.material).forEach(mt => { mats.add(mt); for (const k of ['map', 'normalMap', 'roughnessMap', 'metalnessMap', 'emissiveMap']) if (mt[k]) texs.add(mt[k]); }); });
    return { tris: tris | 0, meshes, mats: mats.size, texs: [...texs] }; };
  function frameObject(o, far) { const b = new THREE.Box3().setFromObject(o); const sz = b.getSize(new THREE.Vector3()), c = b.getCenter(new THREE.Vector3());
    const r = far || Math.max(sz.x, sz.y, sz.z) * 1.6 + 0.4; ctl.target.copy(c); vcam.position.set(c.x + r * 0.55, c.y + r * 0.45, c.z + r * 0.9); vcam.near = r / 200; vcam.far = r * 40; vcam.updateProjectionMatrix(); ctl.update(); }
  function row(k, v) { return `<div class="row"><span>${k}</span><span>${v}</span></div>`; }
  function select(i) {
    const e = flat[i]; if (!e) return; cur = e; flat.forEach(f => f.el.classList.toggle('on', f === e)); e.el.scrollIntoView({ block: 'nearest' });
    stage.clear(); mixer = null; if (skel) { vs.remove(skel); skel = null; } labels.forEach(l => l.el.remove()); labels = []; txBox.innerHTML = '';
    const [name, mk, meta] = e; let html = `<h3>${name}</h3><div style="opacity:.5;margin-bottom:8px">${e.group}</div>`;
    if (meta.tex) { const img = meta.tex.image; const c = document.createElement('canvas'); c.width = img.width; c.height = img.height; c.getContext('2d').drawImage(img, 0, 0); c.style.width = Math.min(560, img.width * 2) + 'px'; txBox.appendChild(c);
      floor.visible = grid.visible = false; info.innerHTML = html + row('size', `${img.width}×${img.height}`) + row('source', 'procedural canvas') + row('repeat', `${meta.tex.repeat.x.toFixed(2)} × ${meta.tex.repeat.y.toFixed(2)}`); return; }
    floor.visible = grid.visible = true;
    const o = mk(); stage.add(o); o.traverse(m => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; m.visible = m.visible && !(m.userData.proc && o.userData.gltf); } });
    if (o.userData.gltf) { mixer = new THREE.AnimationMixer(o.userData.model); skel = new THREE.SkeletonHelper(o.userData.model); skel.visible = false; vs.add(skel); }
    frameObject(o, meta.far);
    o.traverse(c => { if (c.userData.label) { const el = document.createElement('div'); el.className = 'lbl'; el.textContent = c.userData.label; lblBox.appendChild(el); labels.push({ el, o: c }); } });
    const st = stats(o);
    html += row('triangles', st.tris.toLocaleString()) + row('meshes', st.meshes) + row('materials', st.mats) + row('textures', st.texs.length);
    if (st.texs.length) html += row('max texture', Math.max(...st.texs.map(t => t.image ? t.image.width || 0 : 0)) + 'px');
    if (meta.file) html += row('file', `<a href="${meta.file}" style="color:#b9f5b0" download>${meta.file.split('/').pop()}</a>`) + `<div class="row"><span>size</span><span id="avSize">…</span></div>`;
    if (o.userData.gltf) { const clips = o.userData.gltf.animations; html += `<div style="margin-top:12px;opacity:.55">ANIMATION CLIPS (${clips.length})</div><div class="btns2">` + clips.map((c, j) => `<button data-clip="${j}">${c.name} · ${c.duration.toFixed(1)}s</button>`).join('') + '</div>';
      html += `<div class="btns2"><button data-act="pause">pause</button><button data-act="slow">0.25×</button><button data-act="skel">skeleton</button></div>`; }
    html += `<div class="btns2"><button data-act="look">${look === 'studio' ? 'game lighting' : 'studio lighting'}</button><button data-act="wire">wireframe</button><button data-act="spin">turntable</button></div>`;
    if (meta.concept) html += `<div style="margin-top:12px;opacity:.55">CONCEPT (source image)</div><img src="${meta.concept}" onerror="this.remove()">`;
    info.innerHTML = html;
    if (meta.file) fetch(meta.file, { method: 'HEAD' }).then(r => { const n = +r.headers.get('content-length'); const el = document.getElementById('avSize'); if (el) el.textContent = n ? (n / 1048576).toFixed(2) + ' MB' : '?'; }).catch(() => { });
    info.querySelectorAll('[data-clip]').forEach(b => b.onclick = () => { mixer.stopAllAction(); mixer.timeScale = 1; mixer.clipAction(o.userData.gltf.animations[+b.dataset.clip]).reset().play(); info.querySelectorAll('[data-clip]').forEach(x => x.classList.toggle('on', x === b)); });
    info.querySelectorAll('[data-act]').forEach(b => b.onclick = () => { const a = b.dataset.act;
      if (a === 'pause' && mixer) mixer.timeScale = mixer.timeScale ? 0 : 1; if (a === 'slow' && mixer) mixer.timeScale = mixer.timeScale === 0.25 ? 1 : 0.25;
      if (a === 'skel' && skel) skel.visible = !skel.visible; if (a === 'look') { look = look === 'studio' ? 'game' : 'studio'; select(flat.indexOf(cur)); }
      if (a === 'wire') { wire = !wire; stage.traverse(m => { if (m.isMesh) [].concat(m.material).forEach(mt => mt.wireframe = wire); }); } if (a === 'spin') spin = !spin; });
    const first = info.querySelector('[data-clip]'); if (first) first.click();
  }
  const vp = new THREE.Vector3();
  viewerFrame = dt => {
    ctl.update(); if (mixer) mixer.update(dt); if (spin) stage.rotation.y += dt * 0.5;
    const game = look === 'game'; studio.visible = !game; moody.visible = game; vs.background = new THREE.Color(game ? '#020203' : '#1b1b1f'); vs.fog = game ? new THREE.Fog('#020203', 8, 26) : null;
    for (const l of labels) { l.o.getWorldPosition(vp); vp.y += 0.05; vp.project(vcam); l.el.style.left = ((vp.x + 1) / 2 * innerWidth) + 'px'; l.el.style.top = ((1 - vp.y) / 2 * innerHeight) + 'px'; l.el.style.display = vp.z < 1 ? '' : 'none'; }
    vcam.aspect = innerWidth / innerHeight; vcam.updateProjectionMatrix();
    if (game) { renderPass.scene = vs; renderPass.camera = vcam; composer.render(); renderPass.scene = scene; renderPass.camera = camera; } else renderer.render(vs, vcam);
  };
  select(0);
  window.__viewer = { select, count: flat.length };
}

if (location.search.includes('debug')) window.__dbg = { lure, lureReady, showTablet, setCam, camOf, G, chef, addOrder, call, VOX, nextTarget, beginNight: () => { if (G.state === 'brief') { G.state = 'starting'; beginNight_(); } }, player, tiles, interact, setHold, newPlate, setTileItem, facingTile, keys, updateBear, PIZZA, BURGER, startNight: startNight_, LESSONS, save, NIGHTS, nextCallLine, endCall };
requestAnimationFrame(frame);
