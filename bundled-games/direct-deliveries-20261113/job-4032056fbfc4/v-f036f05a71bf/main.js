import * as THREE from './_remote/0d0e081c7ee3d520/three@0.184.0.js';
import { RoundedBoxGeometry } from './_remote/df1cf3fb2a21416f/RoundedBoxGeometry.js';
import { makeLevel, findBlocker, COLORS, SKINS, LEVELS_PER_DISTRICT, loadSave, saveGame, makeGoals, goalMet, MAX_LEVEL, isMilestone, testLevels } from './level.js';
import { t, setLang, getLang, detectLanguage, applyStaticI18n, LANGS } from './i18n.js';
const save = loadSave();
const $ = id => document.getElementById(id);
if (!save.lang) {
  save.lang = detectLanguage();
  saveGame(save);
}
setLang(save.lang);
applyStaticI18n();
function roman(num) {
  const map = [[10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']];
  let out = '';
  for (const [v, s] of map) while (num >= v) {
    out += s;
    num -= v;
  }
  return out;
}
function dName(d) {
  const lap = Math.floor(d / 10);
  return t('d' + d % 10) + (lap > 0 ? ' ' + roman(lap + 1) : '');
}
function colorName(i) {
  return t('c' + i);
}
function goalText(g) {
  return t('goal_' + g.id, {
    n: g.limit
  });
}
const renderer = new THREE.WebGLRenderer({
  antialias: true
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.BasicShadowMap;
$('game-container').appendChild(renderer.domElement);
const scene = new THREE.Scene();
scene.background = new THREE.Color('#6fb6d6');
const camera = new THREE.OrthographicCamera(-5, 5, 9, -9, 0.1, 200);
const hemi = new THREE.HemisphereLight(0xffffff, 0x8899aa, 1.6);
scene.add(hemi);
const sun = new THREE.DirectionalLight(0xfff2dd, 1.8);
sun.castShadow = true;
sun.shadow.mapSize.set(1024, 1024);
Object.assign(sun.shadow.camera, {
  left: -14,
  right: 14,
  top: 14,
  bottom: -14,
  near: 1,
  far: 60
});
scene.add(sun);
scene.add(sun.target);
const loader = new THREE.TextureLoader();
function loadTiled(url) {
  const t = loader.load(url);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}
const roadTex = loadTiled('assets/asphalt-tile.webp');
const lotTex = loadTiled('assets/asphalt-tile.webp');
const sidewalkTex = loadTiled('assets/sidewalk-tile.webp');
sidewalkTex.repeat.set(24, 24);
const ground = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), new THREE.MeshStandardMaterial({
  map: sidewalkTex,
  roughness: 0.9
}));
ground.rotation.x = -Math.PI / 2;
ground.position.y = -0.02;
ground.receiveShadow = true;
scene.add(ground);
const THEMES = [{
  name: 'Day',
  bg: 0x6fb6d6,
  sky: 0xffffff,
  gnd: 0x8899aa,
  hemiI: 1.6,
  sun: 0xfff2dd,
  sunI: 1.8,
  ground: 0xffffff,
  road: 0x8a8d96,
  lot: 0xffffff
}, {
  name: 'Night',
  bg: 0x0d1430,
  sky: 0x6f80c8,
  gnd: 0x1a1f33,
  hemiI: 0.9,
  sun: 0x9fb4ff,
  sunI: 0.9,
  ground: 0x5a6280,
  road: 0x55596a,
  lot: 0x8a90a8
}, {
  name: 'Snow',
  bg: 0xcfe3f2,
  sky: 0xffffff,
  gnd: 0xb8c8d8,
  hemiI: 1.8,
  sun: 0xffffff,
  sunI: 1.5,
  ground: 0xf4f8ff,
  road: 0xa8b0bc,
  lot: 0xe2e8f0
}, {
  name: 'Neon',
  bg: 0x1a0830,
  sky: 0xff6bcb,
  gnd: 0x1fd1d1,
  hemiI: 1.2,
  sun: 0xd28cff,
  sunI: 1.1,
  ground: 0x6a4a8a,
  road: 0x4a3a66,
  lot: 0x9a7ac0
}, {
  name: 'Sunset',
  bg: 0xf29a6b,
  sky: 0xffd2a8,
  gnd: 0x7a5a6a,
  hemiI: 1.4,
  sun: 0xffa060,
  sunI: 1.6,
  ground: 0xf3d6c2,
  road: 0x857a80,
  lot: 0xf6e2d6
}, {
  name: 'Rain',
  bg: 0x7d8a96,
  sky: 0xc8d4de,
  gnd: 0x4a525c,
  hemiI: 1.3,
  sun: 0xdfe8f0,
  sunI: 1.0,
  ground: 0xa9b3bc,
  road: 0x6a7079,
  lot: 0xb8c0c8
}, {
  name: 'Desert',
  bg: 0xf3d9a4,
  sky: 0xfff0d0,
  gnd: 0xa88a5a,
  hemiI: 1.6,
  sun: 0xffe2a8,
  sunI: 1.9,
  ground: 0xf0d8a8,
  road: 0x9a8a72,
  lot: 0xf5e6c8
}, {
  name: 'Autumn',
  bg: 0xd9a066,
  sky: 0xffe0b8,
  gnd: 0x8a5a3a,
  hemiI: 1.5,
  sun: 0xffc890,
  sunI: 1.6,
  ground: 0xe8c4a0,
  road: 0x8a7e76,
  lot: 0xf0dccb
}];
const MILESTONE_THEME = {
  name: 'Gold',
  bg: 0x2a1a05,
  sky: 0xffe08a,
  gnd: 0x6b4c00,
  hemiI: 1.5,
  sun: 0xffd23f,
  sunI: 2.0,
  ground: 0xcfa64a,
  road: 0x6a5a3a,
  lot: 0xf3d98a
};
let theme = THEMES[0];
function applyTheme(n) {
  theme = isMilestone(n) ? MILESTONE_THEME : THEMES[Math.floor((n - 1) / 5) % THEMES.length];
  scene.background.setHex(theme.bg);
  hemi.color.setHex(theme.sky);
  hemi.groundColor.setHex(theme.gnd);
  hemi.intensity = theme.hemiI;
  sun.color.setHex(theme.sun);
  sun.intensity = theme.sunI;
  ground.material.color.setHex(theme.ground);
  document.body.style.background = '#' + theme.bg.toString(16).padStart(6, '0');
}
const levelGroup = new THREE.Group();
scene.add(levelGroup);
const music = new Audio('assets/audio/city-rush-music.mp3');
music.loop = true;
music.volume = 0.35;
const sfxGo = new Audio('assets/audio/taxi-go.mp3');
sfxGo.volume = 0.6;
const sfxCoin = new Audio('assets/audio/coin-collect.mp3');
sfxCoin.volume = 0.7;
let audioCtx = null;
function unlockAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (!save.muted && music.paused) music.play().catch(() => {});
}
window.addEventListener('pointerdown', unlockAudio);
function playClip(clip) {
  if (save.muted) return;
  clip.currentTime = 0;
  clip.play().catch(() => {});
}
function beep(freq, duration, type = 'sine', volume = 0.15) {
  if (save.muted || !audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(volume, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
  osc.connect(gain).connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + duration);
}
function jingle(notes) {
  notes.forEach((f, i) => setTimeout(() => beep(f, 0.18, 'triangle', 0.18), i * 110));
}
let level = null;
let G = {};
let vehicles = [];
let queue = [];
let slotCount = 4;
let timeLeft = 0;
let phase = 'menu';
let levelCoins = 0;
let undoStack = [];
let boardTimer = 0;
let queueShift = 0;
let hoppers = [];
let slotGroup = null;
let queuePool = [];
let stats = {
  taps: 0,
  blocked: 0,
  extra: 0,
  peak: 0,
  timeLeft: 0
};
let goals = [];
let baseSlots = 4;
let combo = 0;
let lastDepart = -10;
let mini = null;
const MISSIONS = [{
  id: 'taxis',
  text: 'Send off 15 vehicles',
  goal: 15,
  reward: 40
}, {
  id: 'wins',
  text: 'Clear 3 levels',
  goal: 3,
  reward: 50
}, {
  id: 'combos',
  text: 'Hit 2 combos (x3+)',
  goal: 2,
  reward: 45
}, {
  id: 'buses',
  text: 'Fill 3 buses',
  goal: 3,
  reward: 40
}, {
  id: 'gold',
  text: 'Get a 3-badge win',
  goal: 1,
  reward: 60
}, {
  id: 'minis',
  text: 'Complete 2 mini goals',
  goal: 2,
  reward: 50
}];
function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}
function ensureDaily() {
  const key = todayKey();
  if (save.daily && save.daily.date === key) return;
  let h = 0;
  for (const ch of key) h = h * 31 + ch.charCodeAt(0) >>> 0;
  const ids = MISSIONS.map(m => m.id);
  const picked = [];
  while (picked.length < 3) {
    h = h * 1103515245 + 12345 >>> 0;
    const id = ids[h % ids.length];
    if (!picked.includes(id)) picked.push(id);
  }
  save.daily = {
    date: key,
    missions: picked.map(id => ({
      id,
      progress: 0,
      claimed: false
    }))
  };
  saveGame(save);
}
function progressMission(id, amount = 1) {
  ensureDaily();
  const m = save.daily.missions.find(x => x.id === id);
  if (!m) return;
  const def = MISSIONS.find(x => x.id === id);
  if (m.progress >= def.goal) return;
  m.progress = Math.min(def.goal, m.progress + amount);
  if (m.progress >= def.goal) toast(t('dailyDone', {
    m: t('m_' + id, {
      n: def.goal
    })
  }));
  saveGame(save);
}
function openMissions() {
  ensureDaily();
  showOnly('missions');
  const list = $('missionList');
  list.innerHTML = '';
  for (const m of save.daily.missions) {
    const def = MISSIONS.find(x => x.id === m.id);
    const row = document.createElement('div');
    row.className = 'skin';
    row.innerHTML = `<div class="nm">${t('m_' + m.id, {
      n: def.goal
    })}<div style="font-size:12px;color:#777">${m.progress}/${def.goal}</div></div>`;
    const b = document.createElement('button');
    const ready = m.progress >= def.goal;
    b.className = 'btn ' + (m.claimed ? 'dark' : ready ? 'green' : '');
    b.textContent = m.claimed ? t('claimed') : `🪙 ${def.reward}`;
    b.disabled = m.claimed || !ready;
    b.onclick = () => {
      m.claimed = true;
      save.coins += def.reward;
      saveGame(save);
      playClip(sfxCoin);
      $('mapCoins').textContent = save.coins;
      openMissions();
    };
    row.appendChild(b);
    list.appendChild(row);
  }
}
function setupMini() {
  const counts = {};
  vehicles.forEach(v => counts[v.color] = (counts[v.color] || 0) + 1);
  let color = 0;
  let best = -1;
  for (const c in counts) if (counts[c] > best) {
    best = counts[c];
    color = +c;
  }
  const need = best >= 3 ? 3 : 2;
  mini = {
    color,
    need,
    streak: 0,
    done: false,
    bonus: 10 + level.n * 2
  };
}
function miniText() {
  if (!mini) return '';
  return `${mini.done ? '✅' : '⭐'} ${t('miniGoal', {
    n: mini.need,
    c: colorName(mini.color)
  })}${mini.done ? '' : ` (${mini.streak}/${mini.need})`}`;
}
function trackMini(v) {
  if (!mini || mini.done) return;
  mini.streak = v.color === mini.color ? mini.streak + 1 : 0;
  if (mini.streak >= mini.need) {
    mini.done = true;
    levelCoins += mini.bonus;
    toast(t('miniDone', {
      c: mini.bonus
    }));
    jingle([784, 988, 1175]);
    progressMission('minis');
  }
  refreshGoalLabel();
}
function capFirst(s) {
  return s ? s.charAt(0).toLocaleUpperCase(getLang() === 'tr' ? 'tr-TR' : undefined) + s.slice(1) : s;
}
const esc = s => String(s).replace(/[&<>]/g, c => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;'
})[c]);
let questHlTimer = null;
function refreshGoalLabel() {
  const panel = $('questPanel');
  const isBonus = mode === 'bonus';
  $('qpTitle').textContent = isBonus ? t('bonusLabel') : '🎯 ' + t('gpTitle');
  const chips = goals.map(g => `<span class="qpChip">${esc(t('gp_' + g.id, {
    n: g.limit
  }))}</span>`);
  if (mini) {
    const s = mini.done ? mini.need : mini.streak;
    chips.push(`<span class="qpChip${mini.done ? ' done' : ''}">${mini.done ? '✅ ' : '⭐ '}${esc(capFirst(t('gpMini', {
      c: colorName(mini.color),
      s,
      n: mini.need
    })))}</span>`);
  }
  $('qpChips').innerHTML = chips.join('');
  const details = [];
  if (isBonus) details.push(t('bonusTut'));else if (mode === 'challenge' && level) details.push(t('chTut', {
    s: level.slots
  }));
  goals.forEach(g => details.push('🎯 ' + t('gpGoalLong', {
    text: goalText(g)
  })));
  if (mini) details.push('⭐ ' + t('gpMiniLong', {
    text: t('miniGoal', {
      n: mini.need,
      c: colorName(mini.color)
    }),
    b: mini.bonus
  }));
  $('qpDetails').innerHTML = details.map(d => `<div>${esc(d)}</div>`).join('');
  panel.style.display = chips.length || details.length ? '' : 'none';
}
function highlightQuestPanel() {
  const panel = $('questPanel');
  panel.classList.remove('min', 'open');
  $('qpInfo').textContent = '▾';
  panel.classList.add('hl');
  clearTimeout(questHlTimer);
  questHlTimer = setTimeout(() => panel.classList.remove('hl'), 2000);
}
$('qpInfo').onclick = e => {
  e.stopPropagation();
  const open = $('questPanel').classList.toggle('open');
  $('qpInfo').textContent = open ? '▴' : '▾';
};
$('qpMin').onclick = e => {
  e.stopPropagation();
  const p = $('questPanel');
  const min = p.classList.toggle('min');
  p.classList.remove('open', 'hl');
  $('qpInfo').textContent = '▾';
  $('qpMin').textContent = min ? '▸' : '—';
};
let mode = 'normal';
let delivered = 0;
let bonusRound = 0;
let queueVip = [];
let vipState = 'none';
let vipTimer = 0;
function genLevel(n, m, round = 0) {
  let L;
  if (m === 'challenge') {
    L = makeLevel(n + 8);
    L.slots = 3;
    L.time = Math.round(L.time * 1.25);
  } else if (m === 'bonus') {
    L = makeLevel(n + 1 + round * 3);
    L.slots = 6;
    L.time = 60;
  } else {
    L = makeLevel(n);
  }
  L.n = n;
  return L;
}
function makeVips(len) {
  const out = new Array(len).fill(false);
  if (level.n < 2) return out;
  const max = mode === 'bonus' ? 3 : 2;
  let count = 0;
  for (let i = 3; i < len && count < max; i++) {
    if (Math.random() < 0.06) {
      out[i] = true;
      count++;
    }
  }
  return out;
}
function vipTexture() {
  const c = document.createElement('canvas');
  c.width = 128;
  c.height = 64;
  const g = c.getContext('2d');
  g.fillStyle = '#ffd23f';
  g.beginPath();
  g.roundRect(4, 4, 120, 56, 18);
  g.fill();
  g.fillStyle = '#5a3a00';
  g.font = 'bold 38px Inter, sans-serif';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillText('👑VIP', 64, 34);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
const vipMat = new THREE.SpriteMaterial({
  map: vipTexture(),
  depthTest: false
});
function refreshLevelLabel() {
  if (!level) return;
  const n = level.n;
  $('levelLabel').textContent = mode === 'bonus' ? `🎁 ${n}` : mode === 'challenge' ? `🏆 ${n}` : `${isMilestone(n) ? '🌟' : n % 10 === 0 ? '⚡' : '📍'} ${n}`;
  $('levelLabel').title = t('levelLabel', {
    d: dName(Math.floor((n - 1) / LEVELS_PER_DISTRICT)),
    n
  });
}
const QUEUE_SPACING = 0.42;
function computeGeometry() {
  const {
    W,
    H
  } = level;
  G = {
    W,
    H,
    xL: -W / 2 - 0.75,
    xR: W / 2 + 0.75,
    zT: -H / 2 - 0.75,
    zB: H / 2 + 0.75
  };
  G.slotZ = G.zT - 1.75;
  G.qZ = G.zT - 3.45;
  G.qStartX = -(W / 2 + 1.1);
  G.maxQueue = Math.floor((W + 2.2) / QUEUE_SPACING);
}
function cellToWorld(x, y) {
  return [x - (G.W - 1) / 2, y - (G.H - 1) / 2];
}
function slotX(i) {
  const spacing = Math.min(1.15, (G.W + 2) / slotCount);
  return (i - (slotCount - 1) / 2) * spacing;
}
function vehicleCenter(v) {
  const horizontal = v.dir === 1 || v.dir === 3;
  const cx = v.x + (horizontal ? (v.len - 1) / 2 : 0);
  const cy = v.y + (horizontal ? 0 : (v.len - 1) / 2);
  return cellToWorld(cx, cy);
}
function dirYaw(dir) {
  const d = [[0, -1], [1, 0], [0, 1], [-1, 0]][dir];
  return Math.atan2(d[0], d[1]);
}
function fitCamera() {
  const aspect = window.innerWidth / window.innerHeight;
  const zMin = G.qZ - 0.8;
  const zMax = G.zB + 0.9;
  const cz = (zMin + zMax) / 2;
  const xHalf = G.W / 2 + 1.2;
  const H = window.innerHeight;
  const hudOn = $('hud').style.display !== 'none';
  const topPx = hudOn ? $('hud').getBoundingClientRect().bottom + 8 : H * 0.18;
  const botPx = hudOn ? $('bottomBar').getBoundingClientRect().top - 8 - 40 : H * 0.85;
  const band = Math.max(H * 0.35, botPx - topPx);
  const f = band / H;
  const contentHalf = (zMax - zMin) * 0.93 / 2 + 0.3;
  const half = Math.max(contentHalf / f, xHalf / aspect);
  const d = ((topPx + topPx + band) / 2 - H / 2) * (2 * half / H);
  camera.left = -half * aspect;
  camera.right = half * aspect;
  camera.top = half + d;
  camera.bottom = -half + d;
  camera.position.set(0, 30, cz + 12);
  camera.lookAt(0, 0, cz);
  camera.updateProjectionMatrix();
  sun.position.set(6, 18, cz + 8);
  sun.target.position.set(0, 0, cz);
}
window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  if (level) fitCamera();
});
if (window.ResizeObserver) {
  const ro = new ResizeObserver(() => {
    if (level) fitCamera();
  });
  ro.observe(document.getElementById('hud'));
  ro.observe(document.getElementById('bottomBar'));
}
const wheelGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.1, 12);
const wheelMat = new THREE.MeshStandardMaterial({
  color: 0x1b1b1f,
  roughness: 0.8
});
const glassMat = new THREE.MeshStandardMaterial({
  color: 0x22303f,
  roughness: 0.2,
  metalness: 0.4
});
const lightMat = new THREE.MeshStandardMaterial({
  color: 0xfff6c8,
  emissive: 0xfff0a0,
  emissiveIntensity: 0.8
});
function questionTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d');
  g.fillStyle = '#ffffff';
  g.beginPath();
  g.arc(64, 64, 56, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = '#5a5f6b';
  g.font = 'bold 90px Inter, sans-serif';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillText('?', 64, 70);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
const questionMat = new THREE.SpriteMaterial({
  map: questionTexture()
});
function box(w, h, d, mat, y, z = 0, x = 0) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x, y, z);
  m.castShadow = true;
  return m;
}
const rbCache = new Map();
function rbox(w, h, d, mat, y, z = 0, x = 0, r = 0.06) {
  const key = [w, h, d, r].map(n => n.toFixed(3)).join('|');
  let geo = rbCache.get(key);
  if (!geo) {
    geo = new RoundedBoxGeometry(w, h, d, 2, Math.min(r, w / 2 - 0.001, h / 2 - 0.001, d / 2 - 0.001));
    rbCache.set(key, geo);
  }
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  m.castShadow = true;
  return m;
}
const trimMat = new THREE.MeshStandardMaterial({
  color: 0x23262d,
  roughness: 0.7
});
const chromeMat = new THREE.MeshStandardMaterial({
  color: 0xc9ced6,
  roughness: 0.3,
  metalness: 0.7
});
const tailMat = new THREE.MeshStandardMaterial({
  color: 0xff3b3b,
  emissive: 0xc01010,
  emissiveIntensity: 0.6
});
const hubMat = new THREE.MeshStandardMaterial({
  color: 0xb8bec8,
  roughness: 0.35,
  metalness: 0.6
});
const roofLightMat = new THREE.MeshStandardMaterial({
  color: 0xe9edf2,
  roughness: 0.5
});
const busGlassMat = new THREE.MeshStandardMaterial({
  color: 0x1d2a38,
  roughness: 0.15,
  metalness: 0.5
});
const shadowMat = new THREE.MeshBasicMaterial({
  color: 0x000000,
  transparent: true,
  opacity: 0.28,
  depthWrite: false
});
const tyreGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.12, 16);
const hubGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.125, 10);
const CAR_TYPES = ['sedan', 'hatchback', 'suv', 'pickup', 'taxi', 'van'];
function vehicleType(v) {
  const n = level ? level.n : 1;
  const h = Math.abs(v.x * 73856093 ^ v.y * 19349663 ^ v.color * 83492791 ^ n * 2654435761) >>> 0;
  if (v.bus) {
    const pool = n >= 40 ? ['minibus', 'shortbus', 'citybus'] : n >= 12 ? ['minibus', 'shortbus'] : ['minibus'];
    return pool[h % pool.length];
  }
  return CAR_TYPES[h % CAR_TYPES.length];
}
function addWheels(g, axles, halfW, big = false) {
  for (const z of axles) {
    for (const side of [-1, 1]) {
      const w = new THREE.Mesh(tyreGeo, wheelMat);
      w.rotation.z = Math.PI / 2;
      w.position.set(side * halfW, 0.15, z);
      if (big) w.scale.set(1.12, 1.15, 1.12);
      const hub = new THREE.Mesh(hubGeo, hubMat);
      hub.rotation.z = Math.PI / 2;
      hub.position.set(side * (halfW + 0.005), 0.15, z);
      g.add(w, hub);
    }
  }
}
function addLights(g, L, Wd, y, wide = false) {
  const hw = Wd / 2 - (wide ? 0.1 : 0.12);
  for (const s of [-1, 1]) {
    g.add(rbox(wide ? 0.16 : 0.15, 0.06, 0.04, lightMat, y, L / 2 - 0.005, s * hw, 0.015));
    g.add(rbox(0.13, 0.06, 0.04, tailMat, y, -L / 2 + 0.005, s * hw, 0.015));
  }
  g.add(rbox(Wd * 0.92, 0.07, 0.06, trimMat, 0.2, L / 2 - 0.01, 0, 0.03));
  g.add(rbox(Wd * 0.92, 0.07, 0.06, trimMat, 0.2, -L / 2 + 0.01, 0, 0.03));
}
function addMirrors(g, z, Wd, y, mat) {
  for (const s of [-1, 1]) g.add(rbox(0.07, 0.05, 0.08, mat, y, z, s * (Wd / 2 + 0.03), 0.02));
}
function buildVehicleVisual(v) {
  const g = new THREE.Group();
  const hidden = v.mystery && !v.revealed;
  const skin = save.skin;
  const color = hidden ? 0x8a8f99 : COLORS[v.color].hex;
  const L = v.len * 0.96 - 0.14;
  const type = vehicleType(v);
  const isBus = !!v.bus;
  const Wd = isBus ? 0.8 : type === 'suv' || type === 'pickup' || type === 'van' ? 0.76 : 0.72;
  const bodyMat = new THREE.MeshStandardMaterial({
    color,
    roughness: 0.38,
    metalness: skin === 'gold' ? 0.45 : 0.15,
    emissive: skin === 'neon' && !hidden ? color : 0x000000,
    emissiveIntensity: skin === 'neon' ? 0.35 : 0
  });
  const roofMat = skin === 'retro' && !hidden ? new THREE.MeshStandardMaterial({
    color: 0xf4f1e8,
    roughness: 0.5
  }) : bodyMat;
  const sh = new THREE.Mesh(new THREE.PlaneGeometry(Wd + 0.16, L + 0.14), shadowMat);
  sh.rotation.x = -Math.PI / 2;
  sh.position.y = 0.012;
  g.add(sh);
  let roofTop = 0.7;
  let beltY = 0.36;
  if (!isBus) {
    const bodyH = type === 'suv' ? 0.34 : type === 'van' ? 0.3 : type === 'pickup' ? 0.32 : 0.27;
    const bodyY = 0.17 + bodyH / 2;
    g.add(rbox(Wd, bodyH, L, bodyMat, bodyY, 0, 0, 0.09));
    beltY = bodyY + bodyH / 2;
    addWheels(g, [-L * 0.31, L * 0.3], Wd / 2 - 0.02, type === 'suv' || type === 'pickup');
    addLights(g, L, Wd, bodyY + 0.02);
    if (type === 'van') {
      const boxL = L * 0.8;
      const bz = -L * 0.1;
      g.add(rbox(Wd * 0.98, 0.42, boxL, roofMat, beltY + 0.2, bz, 0, 0.08));
      g.add(rbox(Wd * 0.86, 0.22, 0.04, glassMat, beltY + 0.17, bz + boxL / 2 + 0.005, 0, 0.02));
      for (const s of [-1, 1]) g.add(rbox(0.02, 0.18, 0.26, glassMat, beltY + 0.2, bz + boxL / 2 - 0.2, s * (Wd * 0.49 + 0.003), 0.008));
      g.add(rbox(Wd * 0.6, 0.02, boxL * 0.7, trimMat, beltY + 0.42, bz, 0, 0.01));
      addMirrors(g, bz + boxL / 2 - 0.05, Wd, beltY + 0.12, trimMat);
      roofTop = beltY + 0.42;
    } else if (type === 'pickup') {
      const cabL = L * 0.34;
      const cz = L * 0.08;
      g.add(rbox(Wd * 0.9, 0.24, cabL + 0.06, glassMat, beltY + 0.11, cz, 0, 0.06));
      g.add(rbox(Wd * 0.86, 0.05, cabL - 0.04, roofMat, beltY + 0.245, cz, 0, 0.025));
      const bedL = L * 0.4;
      const bedZ = -L / 2 + bedL / 2 + 0.04;
      g.add(rbox(Wd * 0.86, 0.02, bedL, trimMat, beltY + 0.005, bedZ, 0, 0.01));
      for (const s of [-1, 1]) g.add(rbox(0.05, 0.1, bedL, bodyMat, beltY + 0.05, bedZ, s * (Wd * 0.45), 0.02));
      g.add(rbox(Wd * 0.86, 0.1, 0.05, bodyMat, beltY + 0.05, bedZ - bedL / 2, 0, 0.02));
      addMirrors(g, cz + cabL / 2, Wd, beltY + 0.08, trimMat);
      roofTop = beltY + 0.27;
    } else {
      const cabL = type === 'hatchback' ? L * 0.56 : type === 'suv' ? L * 0.64 : L * 0.48;
      const cz = type === 'hatchback' ? -L * 0.12 : type === 'suv' ? -L * 0.07 : -L * 0.04;
      const cabH = type === 'suv' ? 0.26 : 0.22;
      g.add(rbox(Wd * 0.84, cabH, cabL, glassMat, beltY + cabH / 2 - 0.01, cz, 0, 0.08));
      g.add(rbox(Wd * 0.8, 0.05, cabL * 0.82, roofMat, beltY + cabH - 0.005, cz, 0, 0.025));
      g.add(rbox(Wd * 0.85, cabH * 0.8, 0.04, bodyMat, beltY + cabH / 2 - 0.02, cz + cabL * 0.05, 0, 0.01));
      addMirrors(g, cz + cabL / 2 - 0.02, Wd, beltY + 0.04, bodyMat);
      roofTop = beltY + cabH + 0.02;
      if (type === 'suv') {
        for (const s of [-1, 1]) g.add(rbox(0.03, 0.03, cabL * 0.8, chromeMat, roofTop + 0.005, cz, s * Wd * 0.33, 0.01));
        roofTop += 0.03;
      }
      if (type === 'taxi') {
        const signMat = skin === 'gold' ? new THREE.MeshStandardMaterial({
          color: 0xe6b422,
          metalness: 0.8,
          roughness: 0.25,
          emissive: 0x6b4c00
        }) : lightMat;
        g.add(rbox(0.3, 0.1, 0.14, signMat, roofTop + 0.05, cz, 0, 0.03));
        roofTop += 0.1;
      }
      g.add(rbox(Wd * 0.5, 0.012, 0.3, trimMat, beltY + 0.002, L / 2 - 0.28, 0, 0.004));
    }
  } else {
    const tall = type === 'minibus' ? 0.62 : type === 'shortbus' ? 0.72 : 0.76;
    const baseY = 0.18;
    const noseL = type === 'minibus' ? 0.32 : 0.06;
    const bodyL = L - noseL;
    const bz = -noseL / 2;
    g.add(rbox(Wd, tall, bodyL, bodyMat, baseY + tall / 2, bz, 0, 0.1));
    if (type === 'minibus') {
      g.add(rbox(Wd * 0.96, 0.28, noseL + 0.1, bodyMat, baseY + 0.14, L / 2 - noseL / 2 - 0.05, 0, 0.09));
      g.add(rbox(Wd * 0.86, 0.26, 0.05, glassMat, baseY + tall - 0.2, bz + bodyL / 2, 0, 0.03));
    } else {
      g.add(rbox(Wd * 0.88, tall * 0.5, 0.05, busGlassMat, baseY + tall * 0.6, L / 2 - 0.02, 0, 0.03));
    }
    const winY = baseY + tall * 0.62;
    for (const s of [-1, 1]) {
      g.add(rbox(0.03, tall * 0.34, bodyL * 0.86, busGlassMat, winY, bz - 0.02, s * (Wd / 2), 0.01));
      const panes = Math.round(bodyL / 0.42);
      for (let i = 1; i < panes; i++) {
        const pz = bz - bodyL * 0.43 + bodyL * 0.86 * i / panes;
        g.add(rbox(0.035, tall * 0.34, 0.035, bodyMat, winY, pz, s * (Wd / 2), 0.008));
      }
    }
    g.add(rbox(0.035, tall * 0.7, 0.26, busGlassMat, baseY + tall * 0.45, bz + bodyL * 0.36, Wd / 2, 0.01));
    const rt = baseY + tall;
    if (type === 'citybus') {
      g.add(rbox(Wd * 0.6, 0.09, bodyL * 0.3, roofLightMat, rt + 0.04, bz - bodyL * 0.15, 0, 0.03));
      g.add(rbox(Wd * 0.4, 0.06, 0.24, roofLightMat, rt + 0.03, bz + bodyL * 0.28, 0, 0.02));
      g.add(rbox(0.04, 0.12, bodyL * 0.6, trimMat, baseY + 0.1, bz, -Wd / 2 - 0.005, 0.01));
    } else if (type === 'shortbus') {
      g.add(rbox(Wd * 0.5, 0.08, 0.4, roofLightMat, rt + 0.035, bz, 0, 0.03));
    } else {
      g.add(rbox(Wd * 0.7, 0.02, bodyL * 0.6, trimMat, rt + 0.005, bz, 0, 0.01));
    }
    roofTop = rt + 0.06;
    beltY = baseY + 0.2;
    addMirrors(g, L / 2 - 0.08, Wd, baseY + tall * 0.7, trimMat);
    addWheels(g, type === 'citybus' ? [-L * 0.3, L * 0.3] : [-L * 0.32, 0, L * 0.3], Wd / 2 - 0.02, true);
    addLights(g, L, Wd, baseY + 0.12, true);
  }
  if (skin === 'checker' && !hidden) {
    const checkMat = new THREE.MeshStandardMaterial({
      color: 0x151515
    });
    const n = 6 * v.len;
    const seg = (L - 0.3) / n;
    for (let i = 0; i < n; i += 2) {
      const z = -L / 2 + 0.15 + seg * (i + 0.5);
      for (const s of [-1, 1]) g.add(rbox(0.02, 0.06, seg, checkMat, beltY - 0.06, z, s * (Wd / 2 + 0.006), 0.005));
    }
  }
  if (skin === 'gold' && !hidden) {
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xe6b422,
      metalness: 0.9,
      roughness: 0.2
    });
    for (const s of [-1, 1]) g.add(rbox(0.02, 0.04, L * 0.8, goldMat, beltY - 0.02, 0, s * (Wd / 2 + 0.006), 0.01));
  }
  if (hidden) {
    const s = new THREE.Sprite(questionMat);
    s.scale.set(0.55, 0.55, 1);
    s.position.y = 1.15;
    g.add(s);
  }
  const seats = new THREE.Group();
  g.add(seats);
  g.userData = {
    bodyMat,
    seats,
    L,
    roofTop,
    shake: 0,
    flash: 0,
    bounce: 0
  };
  refreshSeats(v, g);
  return g;
}
const seatGeo = new THREE.SphereGeometry(0.075, 8, 6);
function refreshSeats(v, visual = v.visual) {
  const seats = visual.userData.seats;
  seats.clear();
  const L = visual.userData.L;
  for (let i = 0; i < v.cap; i++) {
    const filled = i < v.filled;
    const m = new THREE.Mesh(seatGeo, new THREE.MeshStandardMaterial({
      color: filled ? COLORS[v.color].hex : 0xffffff,
      emissive: filled ? COLORS[v.color].hex : 0x000000,
      emissiveIntensity: 0.4,
      transparent: !filled,
      opacity: filled ? 1 : 0.35
    }));
    const row = Math.floor(i / 3);
    const col = i % 3;
    m.position.set((col - 1) * 0.2, (visual.userData.roofTop || 0.9) + 0.1, -L / 2 + 0.3 + row * 0.3 + (v.bus ? 0.3 : 0.05));
    seats.add(m);
  }
  seats.visible = v.status !== 'lot';
}
function createPassenger(colorIndex) {
  const g = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({
    color: COLORS[colorIndex].hex,
    roughness: 0.6
  });
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.14, 0.36, 10), mat);
  body.position.y = 0.2;
  body.castShadow = true;
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.11, 12, 10), new THREE.MeshStandardMaterial({
    color: 0xffd7b0
  }));
  head.position.y = 0.48;
  head.castShadow = true;
  const vip = new THREE.Sprite(vipMat);
  vip.scale.set(0.6, 0.3, 1);
  vip.position.y = 0.85;
  vip.visible = false;
  g.add(body, head, vip);
  g.userData = {
    mat,
    colorIndex,
    vip
  };
  return g;
}
function plane(w, d, mat, x, y, z) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), mat);
  m.rotation.x = -Math.PI / 2;
  m.position.set(x, y, z);
  m.receiveShadow = true;
  levelGroup.add(m);
  return m;
}
function buildStatic() {
  const {
    W,
    H
  } = G;
  roadTex.repeat.set((W + 3) / 2, (H + 3) / 2);
  plane(W + 3, H + 3, new THREE.MeshStandardMaterial({
    map: roadTex,
    color: theme.road
  }), 0, 0, 0);
  plane(W + 14, 1.6, new THREE.MeshStandardMaterial({
    map: roadTex,
    color: theme.road
  }), 0, 0.001, G.zT);
  lotTex.repeat.set(W / 2, H / 2);
  plane(W, H, new THREE.MeshStandardMaterial({
    map: lotTex,
    color: theme.lot
  }), 0, 0.01, 0);
  const lineMat = new THREE.MeshBasicMaterial({
    color: 0xf5f5f5,
    transparent: true,
    opacity: 0.55
  });
  for (let i = 0; i <= W; i++) plane(0.04, H, lineMat, i - W / 2, 0.02, 0);
  for (let j = 0; j <= H; j++) plane(W, 0.04, lineMat, 0, 0.02, j - H / 2);
  const dashMat = new THREE.MeshBasicMaterial({
    color: 0xffd54a
  });
  for (let x = -W / 2 - 6; x < W / 2 + 6; x += 0.8) plane(0.4, 0.06, dashMat, x, 0.012, G.zT);
  plane(W + 14, 1.0, new THREE.MeshStandardMaterial({
    color: 0xd9cdb5
  }), 0, 0.005, G.qZ);
  for (const [cx, cy, kind] of level.obstacles) {
    const [wx, wz] = cellToWorld(cx, cy);
    if (kind === 'p') {
      const pot = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.3, 0.9), new THREE.MeshStandardMaterial({
        color: 0xb08a6a
      }));
      pot.position.set(wx, 0.15, wz);
      pot.castShadow = true;
      const bush = new THREE.Mesh(new THREE.SphereGeometry(0.4, 12, 10), new THREE.MeshStandardMaterial({
        color: 0x3fae5a,
        roughness: 0.8
      }));
      bush.position.set(wx, 0.55, wz);
      bush.castShadow = true;
      levelGroup.add(pot, bush);
      continue;
    }
    const cone = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.6, 14), new THREE.MeshStandardMaterial({
      color: 0xff7a1a
    }));
    cone.position.set(wx, 0.3, wz);
    cone.castShadow = true;
    const stripe = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.17, 0.1, 14), new THREE.MeshStandardMaterial({
      color: 0xffffff
    }));
    stripe.position.set(wx, 0.33, wz);
    const base = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.05, 0.6), new THREE.MeshStandardMaterial({
      color: 0x333333
    }));
    base.position.set(wx, 0.03, wz);
    levelGroup.add(cone, stripe, base);
  }
  for (const [x, z] of [[G.xL - 1.4, G.zB + 0.5], [G.xR + 1.4, G.zB + 0.5], [G.xL - 1.4, 0], [G.xR + 1.4, 0]]) {
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.6), new THREE.MeshStandardMaterial({
      color: 0x7a5230
    }));
    trunk.position.set(x, 0.3, z);
    const top = new THREE.Mesh(new THREE.SphereGeometry(0.55, 12, 10), new THREE.MeshStandardMaterial({
      color: 0x3fae5a,
      roughness: 0.8
    }));
    top.position.set(x, 0.9, z);
    top.castShadow = true;
    levelGroup.add(trunk, top);
  }
}
function buildSlots() {
  if (slotGroup) levelGroup.remove(slotGroup);
  slotGroup = new THREE.Group();
  const spacing = Math.min(1.15, (G.W + 2) / slotCount);
  const mat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.8
  });
  const padMat = new THREE.MeshStandardMaterial({
    color: 0x4a4f5c
  });
  for (let i = 0; i < slotCount; i++) {
    const x = slotX(i);
    const pad = new THREE.Mesh(new THREE.PlaneGeometry(spacing - 0.1, 2.3), padMat);
    pad.rotation.x = -Math.PI / 2;
    pad.position.set(x, 0.008, G.slotZ);
    pad.receiveShadow = true;
    slotGroup.add(pad);
    for (const side of [-1, 1]) {
      const line = new THREE.Mesh(new THREE.PlaneGeometry(0.05, 2.3), mat);
      line.rotation.x = -Math.PI / 2;
      line.position.set(x + side * (spacing / 2 - 0.05), 0.015, G.slotZ);
      slotGroup.add(line);
    }
  }
  levelGroup.add(slotGroup);
}
function buildQueuePool() {
  queuePool = [];
  for (let i = 0; i < G.maxQueue; i++) {
    const p = createPassenger(0);
    p.position.set(G.qStartX + i * QUEUE_SPACING, 0, G.qZ);
    levelGroup.add(p);
    queuePool.push(p);
  }
}
function createVehicleMesh(v) {
  const root = new THREE.Group();
  root.userData.vid = v.id;
  v.root = root;
  v.visual = buildVehicleVisual(v);
  root.add(v.visual);
  levelGroup.add(root);
}
function rebuildVisual(v) {
  v.root.remove(v.visual);
  v.visual = buildVehicleVisual(v);
  v.root.add(v.visual);
}
function placeAtRest(v) {
  const u = v.root.userData;
  u.path = null;
  u.done = null;
  if (v.status === 'lot') {
    const [x, z] = vehicleCenter(v);
    v.root.position.set(x, 0, z);
    v.root.rotation.y = dirYaw(v.dir);
    v.root.scale.setScalar(1);
    u.scaleTarget = 1;
  } else if (v.status === 'slot') {
    v.root.position.set(slotX(v.slot), 0, G.slotZ);
    v.root.rotation.y = Math.PI;
    v.root.scale.setScalar(0.82);
    u.scaleTarget = 0.82;
  }
  if (v.status === 'gone') {
    levelGroup.remove(v.root);
  } else if (!v.root.parent) {
    levelGroup.add(v.root);
  }
}
function updateReveals() {
  for (const v of vehicles) {
    if (v.status === 'lot' && v.mystery && !v.revealed) {
      if (!findBlocker(v, vehicles, level.obstacles, G.W, G.H)) {
        v.revealed = true;
        rebuildVisual(v);
        v.visual.userData.bounce = 0.4;
        burst(v.root.position, COLORS[v.color].hex, 14);
        beep(880, 0.15, 'triangle');
      }
    }
  }
}
function setPath(v, points, speed, done) {
  const u = v.root.userData;
  u.path = points.map(p => ({
    pos: new THREE.Vector3(p[0], 0, p[1]),
    rev: !!p[2]
  }));
  u.speed = speed;
  u.done = done;
}
function exitPath(v) {
  const [cx, cz] = vehicleCenter(v);
  const pts = [];
  if (v.dir === 0) {
    pts.push([cx, G.zT]);
  } else if (v.dir === 2) {
    const side = cx < 0 ? G.xL : G.xR;
    pts.push([cx, G.zB], [side, G.zB], [side, G.zT]);
  } else if (v.dir === 1) {
    pts.push([G.xR, cz], [G.xR, G.zT]);
  } else {
    pts.push([G.xL, cz], [G.xL, G.zT]);
  }
  const sx = slotX(v.slot);
  pts.push([sx, G.zT], [sx, G.slotZ]);
  return pts;
}
const tmpVec = new THREE.Vector3();
function dampAngle(current, target, rate, dt) {
  let diff = ((target - current + Math.PI) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2) - Math.PI;
  return current + diff * (1 - Math.exp(-rate * dt));
}
function stepVehicle(v, dt) {
  const root = v.root;
  const u = root.userData;
  if (u.scaleTarget !== undefined) {
    const s = THREE.MathUtils.damp(root.scale.x, u.scaleTarget, 6, dt);
    root.scale.setScalar(s);
  }
  if (u.path && u.path.length) {
    let move = u.speed * dt;
    const head = u.path[0];
    tmpVec.subVectors(head.pos, root.position);
    if (tmpVec.lengthSq() > 1e-6) {
      let desired = Math.atan2(tmpVec.x, tmpVec.z);
      if (head.rev) desired += Math.PI;
      root.rotation.y = dampAngle(root.rotation.y, desired, 16, dt);
    }
    while (move > 0 && u.path.length) {
      const target = u.path[0].pos;
      tmpVec.subVectors(target, root.position);
      const len = tmpVec.length();
      if (len <= move) {
        root.position.copy(target);
        move -= len;
        u.path.shift();
      } else {
        root.position.addScaledVector(tmpVec, move / len);
        move = 0;
      }
    }
    if (!u.path.length) {
      const cb = u.done;
      u.path = null;
      u.done = null;
      if (cb) cb();
    }
  }
  const vu = v.visual.userData;
  if (vu.shake > 0) {
    vu.shake -= dt;
    v.visual.position.x = Math.sin(vu.shake * 70) * 0.09 * (vu.shake / 0.35);
  } else {
    v.visual.position.x = 0;
  }
  if (vu.flash > 0) {
    vu.flash -= dt;
    vu.bodyMat.emissive.setHex(Math.sin(vu.flash * 30) > 0 ? 0xff0000 : 0x000000);
    vu.bodyMat.emissiveIntensity = 0.6;
    if (vu.flash <= 0) {
      vu.bodyMat.emissive.setHex(save.skin === 'neon' ? vu.bodyMat.color.getHex() : 0x000000);
      vu.bodyMat.emissiveIntensity = save.skin === 'neon' ? 0.35 : 0;
    }
  }
  if (vu.bounce > 0) {
    vu.bounce -= dt;
    const k = Math.max(0, vu.bounce) / 0.4;
    v.visual.scale.set(1 + Math.sin(k * Math.PI) * 0.12, 1 - Math.sin(k * Math.PI) * 0.1, 1 + Math.sin(k * Math.PI) * 0.12);
  } else {
    v.visual.scale.set(1, 1, 1);
  }
}
const particles = [];
const particleGeo = new THREE.BoxGeometry(0.1, 0.1, 0.1);
const coinGeo = new THREE.CylinderGeometry(0.13, 0.13, 0.04, 14);
const coinMat = new THREE.MeshStandardMaterial({
  color: 0xffd23f,
  metalness: 0.7,
  roughness: 0.3,
  emissive: 0x6b4c00
});
function burst(pos, color, count, coins = false) {
  for (let i = 0; i < count; i++) {
    const mesh = new THREE.Mesh(coins ? coinGeo : particleGeo, coins ? coinMat : new THREE.MeshBasicMaterial({
      color
    }));
    mesh.position.set(pos.x, 0.5, pos.z);
    const a = Math.random() * Math.PI * 2;
    const s = 1.5 + Math.random() * 2.5;
    particles.push({
      mesh,
      vel: new THREE.Vector3(Math.cos(a) * s, 3 + Math.random() * 3, Math.sin(a) * s),
      life: 0.8 + Math.random() * 0.4,
      spin: (Math.random() - 0.5) * 20
    });
    scene.add(mesh);
  }
}
function updateParticles(dt) {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.life -= dt;
    p.vel.y -= 12 * dt;
    p.mesh.position.addScaledVector(p.vel, dt);
    p.mesh.rotation.x += p.spin * dt;
    p.mesh.rotation.z += p.spin * dt;
    p.mesh.scale.setScalar(Math.max(0.01, Math.min(1, p.life * 2)));
    if (p.life <= 0) {
      scene.remove(p.mesh);
      particles.splice(i, 1);
    }
  }
}
function occupiedSlots() {
  const used = new Set();
  for (const v of vehicles) {
    if (v.slot !== null && ['moving', 'slot', 'full'].includes(v.status)) used.add(v.slot);
  }
  return used;
}
function freeSlot() {
  const used = occupiedSlots();
  for (let i = 0; i < slotCount; i++) if (!used.has(i)) return i;
  return -1;
}
function isIdle() {
  return hoppers.length === 0 && !vehicles.some(v => ['moving', 'full', 'leaving'].includes(v.status));
}
function pushUndo() {
  undoStack.push({
    vs: vehicles.map(v => ({
      status: v.status,
      slot: v.slot,
      filled: v.filled,
      revealed: v.revealed
    })),
    queue: [...queue],
    queueVip: [...queueVip],
    delivered,
    levelCoins
  });
  if (undoStack.length > 10) undoStack.shift();
}
function tapVehicle(v) {
  if (v.status !== 'lot') return;
  stats.taps++;
  const blocker = findBlocker(v, vehicles, level.obstacles, G.W, G.H);
  if (blocker) {
    stats.blocked++;
    v.visual.userData.shake = 0.35;
    if (blocker !== 'cone') blocker.visual.userData.flash = 0.5;
    beep(130, 0.18, 'square', 0.1);
    if (navigator.vibrate) navigator.vibrate(30);
    return;
  }
  const slot = freeSlot();
  if (slot < 0) {
    v.visual.userData.shake = 0.35;
    toast(t('toastFull'));
    beep(130, 0.18, 'square', 0.1);
    return;
  }
  if (isIdle()) {
    pushUndo();
  } else {
    undoStack = [];
  }
  v.status = 'moving';
  v.slot = slot;
  stats.peak = Math.max(stats.peak, occupiedSlots().size);
  v.visual.userData.seats.visible = true;
  playClip(sfxGo);
  burst(v.root.position, 0xcccccc, 6);
  setPath(v, exitPath(v), 11, () => {
    v.status = 'slot';
    v.root.userData.scaleTarget = 0.82;
    v.visual.userData.bounce = 0.4;
    boardTimer = Math.min(boardTimer, 0.1);
  });
  updateReveals();
}
function spawnHopper(colorIndex, v, isVip = false) {
  const p = createPassenger(colorIndex);
  p.userData.vip.visible = isVip;
  p.position.set(G.qStartX, 0, G.qZ);
  levelGroup.add(p);
  hoppers.push({
    mesh: p,
    from: p.position.clone(),
    v,
    t: 0
  });
}
function updateHoppers(dt) {
  for (let i = hoppers.length - 1; i >= 0; i--) {
    const h = hoppers[i];
    h.t += dt / 0.32;
    const to = h.v.root.position;
    const k = Math.min(1, h.t);
    h.mesh.position.lerpVectors(h.from, to, k);
    h.mesh.position.y = Math.sin(k * Math.PI) * 1.2;
    if (h.t >= 1) {
      levelGroup.remove(h.mesh);
      hoppers.splice(i, 1);
      h.v.visual.userData.bounce = 0.3;
      refreshSeats(h.v);
      beep(500 + h.v.filled * 90, 0.08, 'triangle', 0.12);
    }
  }
}
function departVehicle(v) {
  v.status = 'leaving';
  const sx = slotX(v.slot);
  v.slot = null;
  levelCoins += v.bus ? 6 : 3;
  combo = clock - lastDepart < 2.5 ? combo + 1 : 1;
  lastDepart = clock;
  if (combo >= 3) {
    const bonus = combo * 2;
    levelCoins += bonus;
    toast(t('combo', {
      n: combo,
      c: bonus
    }));
    beep(660 + combo * 80, 0.2, 'triangle', 0.18);
    if (combo === 3) progressMission('combos');
  }
  progressMission('taxis');
  if (v.bus) progressMission('buses');
  trackMini(v);
  playClip(sfxCoin);
  burst(v.root.position, 0, 8, true);
  burst(v.root.position, COLORS[v.color].hex, 10);
  v.root.userData.scaleTarget = 1;
  setPath(v, [[sx, G.zT, true], [G.xR + 8, G.zT]], 12, () => {
    v.status = 'gone';
    levelGroup.remove(v.root);
    checkWin();
  });
}
function updateBoarding(dt) {
  boardTimer -= dt;
  for (const v of vehicles) {
    if (v.status === 'full' && hoppers.every(h => h.v !== v)) {
      v.departIn -= dt;
      if (v.departIn <= 0) departVehicle(v);
    }
  }
  if (boardTimer > 0 || !queue.length) return;
  const c = queue[0];
  const target = vehicles.find(v => v.status === 'slot' && v.color === c && v.filled < v.cap);
  if (!target) return;
  target.filled++;
  queue.shift();
  const isVip = !!queueVip.shift();
  delivered++;
  if (isVip) {
    if (vipState === 'active') {
      const bonus = (target.bus ? 6 : 3) * 3;
      levelCoins += bonus;
      toast(t('vipDone', {
        n: bonus
      }));
      jingle([988, 1175, 1568]);
      burst(target.root.position, 0, 10, true);
    }
    vipState = 'none';
  }
  queueShift += QUEUE_SPACING;
  spawnHopper(c, target, isVip);
  boardTimer = 0.12;
  if (target.filled >= target.cap) {
    target.status = 'full';
    target.departIn = 0.25;
  }
}
function checkLose() {
  if (!queue.length || !isIdle()) return;
  const parked = vehicles.filter(v => v.status === 'slot').length;
  const c = queue[0];
  const match = vehicles.some(v => v.status === 'slot' && v.color === c && v.filled < v.cap);
  if (!match && parked >= slotCount) lose('jam');
}
function checkWin() {
  if (phase !== 'play') return;
  if (!vehicles.every(v => v.status === 'gone')) return;
  if (mode === 'bonus') {
    bonusRound++;
    level = genLevel(level.n, 'bonus', bonusRound);
    buildBoard();
    toast(t('newBoard'));
    return;
  }
  win();
}
function updateVip(dt) {
  if (queueVip[0] && vipState === 'none') {
    vipState = 'active';
    vipTimer = 10;
    toast(t('vipWaiting', {
      c: colorName(queue[0])
    }));
    beep(1046, 0.15, 'triangle', 0.15);
  }
  if (vipState === 'active') {
    vipTimer -= dt;
    if (vipTimer <= 0) {
      vipState = 'missed';
      toast(t('vipMissed'));
    }
  }
}
function buildBoard() {
  levelGroup.clear();
  slotGroup = null;
  hoppers = [];
  vehicles = level.vehicles.map(v => ({
    ...v,
    status: 'lot',
    slot: null,
    filled: 0,
    revealed: false
  }));
  queue = [...level.passengers];
  queueVip = makeVips(queue.length);
  vipState = 'none';
  slotCount = level.slots;
  undoStack = [];
  queueShift = 0;
  boardTimer = 0;
  computeGeometry();
  buildStatic();
  buildSlots();
  buildQueuePool();
  vehicles.forEach(v => {
    createVehicleMesh(v);
    placeAtRest(v);
  });
  updateReveals();
  fitCamera();
}
function finishBonus() {
  phase = 'win';
  const n = level.n;
  const first = !save.specials['b' + n];
  const reward = levelCoins + delivered * 2 + (first ? 50 : 0);
  save.specials['b' + n] = true;
  levelCoins = reward;
  save.coins += reward;
  saveGame(save);
  $('winTitle').textContent = t('bonusResult');
  $('badgeRow').textContent = '🎁';
  $('statLine').textContent = t('bonusText', {
    p: delivered
  });
  $('goalList').innerHTML = '';
  $('winText').textContent = t('coinsEarned', {
    n: reward
  });
  $('nextBtn').textContent = t('continue');
  jingle([523, 659, 784, 1046]);
  setTimeout(() => {
    showOnly('win');
    setHud(false);
  }, 500);
}
function startLevel(n, m = 'normal') {
  mode = m;
  level = genLevel(n, m);
  bonusRound = 0;
  delivered = 0;
  baseSlots = level.slots;
  timeLeft = level.time;
  stats = {
    taps: 0,
    blocked: 0,
    extra: 0,
    peak: 0,
    timeLeft: 0
  };
  goals = m === 'normal' ? makeGoals(level) : [];
  combo = 0;
  lastDepart = -10;
  levelCoins = 0;
  applyTheme(n);
  buildBoard();
  setupMini();
  refreshGoalLabel();
  showOnly(null);
  setHud(true);
  phase = 'play';
  refreshLevelLabel();
  refreshGoalLabel();
  highlightQuestPanel();
  updateHud();
  fitCamera();
  if (m === 'bonus' || m === 'challenge') {} else if (n === 1) toast(t('tut1'));else if (n === 2) toast(t('tutVip'));else if (n === 3) toast(t('tut2'));else if (n === 4) toast(t('tut3'));else if (n === 5) toast(t('tut4'));else if (isMilestone(n)) toast(t('milestoneStart', {
    n
  }));else if (n === 15) toast(t('tutPlanter'));else if (n % 10 === 0) toast(t('rushTut'));else if (n % 5 === 1) toast(t('newDistrict', {
    d: dName(Math.floor((n - 1) / LEVELS_PER_DISTRICT))
  }));
}
function win() {
  phase = 'win';
  stats.timeLeft = timeLeft;
  const n = level.n;
  $('nextBtn').textContent = mode === 'normal' ? t('next') : t('continue');
  if (mode === 'challenge') {
    const first = !save.specials['c' + n];
    const chBonus = first ? 100 + Math.min(n, 200) * 5 : 40;
    const reward = levelCoins + 10 + Math.min(n, 200) * 3 + chBonus;
    save.specials['c' + n] = true;
    levelCoins = reward;
    save.coins += reward;
    saveGame(save);
    progressMission('wins');
    $('winTitle').textContent = t('chWin');
    $('badgeRow').textContent = '🏆';
    $('statLine').textContent = t('stats', {
      taps: stats.taps,
      blocked: stats.blocked,
      time: Math.ceil(timeLeft),
      spare: Math.max(0, slotCount - stats.peak)
    });
    $('goalList').innerHTML = `<div style="font-weight:700;color:#b8860b">${t('chReward', {
      n: chBonus
    })}</div>`;
    $('winText').textContent = t('coinsEarned', {
      n: reward
    });
    jingle([523, 659, 784, 1046, 1318]);
    setTimeout(() => {
      showOnly('win');
      setHud(false);
    }, 700);
    return;
  }
  const milestone = isMilestone(n);
  let milestoneBonus = 0;
  if (milestone && !save.specials['m' + n]) {
    milestoneBonus = 50 + n;
    save.specials['m' + n] = true;
  }
  $('winTitle').textContent = n >= MAX_LEVEL ? t('finalWin') : milestone ? t('milestoneWin', {
    n
  }) : t('cleared');
  if (n >= MAX_LEVEL) $('nextBtn').textContent = t('cityMap');
  const timeFrac = timeLeft / level.time;
  const spare = slotCount - stats.peak;
  const badges = 1 + (timeFrac >= 0.35 && stats.extra === 0 ? 1 : 0) + (stats.blocked <= 1 && spare >= 1 ? 1 : 0);
  const prevBest = save.best[n] || 0;
  const badgeBonus = Math.max(0, badges - prevBest) * 10;
  save.best[n] = Math.max(prevBest, badges);
  const done = save.goalsDone[n] || [];
  let goalBonus = 0;
  const goalHtml = goals.map(g => {
    const met = goalMet(g, stats, slotCount);
    let pay = 0;
    if (met) {
      pay = done.includes(g.id) ? Math.ceil(g.bonus / 2) : g.bonus;
      if (!done.includes(g.id)) done.push(g.id);
      goalBonus += pay;
    }
    return `<div style="font-weight:700;color:${met ? '#1a8a48' : '#999'}">${met ? '✅' : '⬜'} ${goalText(g)}${met ? ` <span style="color:#b8860b">+${pay}🪙</span>` : ''}</div>`;
  }).join('');
  save.goalsDone[n] = done;
  const reward = levelCoins + 10 + Math.min(n, 200) * 3 + goalBonus + badgeBonus + milestoneBonus;
  levelCoins = reward;
  save.coins += reward;
  save.level = Math.min(MAX_LEVEL + 1, Math.max(save.level, n + 1));
  saveGame(save);
  progressMission('wins');
  if (badges === 3) progressMission('gold');
  $('badgeRow').textContent = [0, 1, 2].map(i => i < badges ? '🏅' : '▫️').join(' ');
  $('statLine').textContent = t('stats', {
    taps: stats.taps,
    blocked: stats.blocked,
    time: Math.ceil(timeLeft),
    spare: Math.max(0, spare)
  });
  $('goalList').innerHTML = goalHtml + `<div style="font-weight:700;color:${mini.done ? '#1a8a48' : '#999'}">${mini.done ? '⭐' : '⬜'} ${t('miniLabel', {
    text: t('miniGoal', {
      n: mini.need,
      c: colorName(mini.color)
    })
  })}${mini.done ? ` <span style="color:#b8860b">+${mini.bonus}🪙</span>` : ''}</div>`;
  if (milestoneBonus) $('goalList').innerHTML += `<div style="font-weight:800;color:#b8860b">${t('milestoneReward', {
    n: milestoneBonus
  })}</div>`;
  $('winText').textContent = t('coinsEarned', {
    n: reward
  }) + (badgeBonus ? t('newBadge', {
    n: badgeBonus
  }) : '');
  jingle(milestone ? [523, 659, 784, 1046, 1318, 1568] : [523, 659, 784, 1046]);
  if (milestone) for (let i = 0; i < 8; i++) setTimeout(() => burst(new THREE.Vector3((Math.random() - 0.5) * 6, 0, (Math.random() - 0.5) * 6), 0xffd23f, 16), i * 120);
  for (let i = 0; i < 4; i++) setTimeout(() => burst(new THREE.Vector3((Math.random() - 0.5) * 4, 0, (Math.random() - 0.5) * 4), 0, 10, true), i * 150);
  setTimeout(() => {
    showOnly('win');
    setHud(false);
  }, 700);
}
function lose(reason) {
  if (mode === 'bonus') {
    finishBonus();
    return;
  }
  phase = 'lose';
  $('loseTitle').textContent = reason === 'jam' ? t('jammed') : t('timeUp');
  $('loseText').textContent = reason === 'jam' ? t('jamText') : t('timeText');
  level.loseReason = reason;
  jingle([392, 330, 262]);
  showOnly('lose');
}
function relayoutSlots() {
  for (const v of vehicles) {
    if (v.slot === null) continue;
    if (v.status === 'slot' || v.status === 'full') {
      setPath(v, [[slotX(v.slot), G.slotZ]], 6, null);
    } else if (v.status === 'moving') {
      const u = v.root.userData;
      if (u.path && u.path.length >= 2) {
        const sx = slotX(v.slot);
        u.path[u.path.length - 2].pos.x = sx;
        u.path[u.path.length - 1].pos.x = sx;
      }
    }
  }
}
let toastTimer = null;
function toast(text) {
  const t = $('toast');
  t.textContent = text;
  t.style.opacity = 1;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.style.opacity = 0, 1800);
}
function showOnly(id) {
  for (const o of ['map', 'shop', 'win', 'lose', 'missions', 'settings']) $(o).style.display = o === id ? 'flex' : 'none';
}
function setHud(on) {
  $('hud').style.display = on ? 'flex' : 'none';
  $('bottomBar').style.display = on ? 'flex' : 'none';
  $('muteBtn').style.display = on ? 'block' : 'none';
}
function updateHud() {
  $('coinLabel').textContent = save.coins + levelCoins * (phase === 'play' ? 1 : 0);
  const frac = Math.max(0, timeLeft / level.time);
  $('timerBar').style.width = frac * 100 + '%';
  $('timerBar').style.background = frac < 0.25 ? '#ff4757' : 'linear-gradient(90deg, #ffc81e, #ff8c1a)';
  const secs = Math.ceil(Math.max(0, timeLeft));
  $('paxLabel').textContent = mode === 'bonus' ? `✅ ${delivered}` : `🧍 ${queue.length}`;
  $('timeLabel').textContent = vipState === 'active' ? t('vipHud', {
    t: Math.ceil(vipTimer)
  }) : `⏱ ${secs}`;
  $('sentLabel').textContent = `🚕 ${vehicles.filter(v => v.status === 'leaving' || v.status === 'gone').length}`;
  $('slotLabel').textContent = `🅿 ${occupiedSlots().size}/${slotCount}`;
}
function openMap() {
  phase = 'menu';
  setHud(false);
  showOnly('map');
  $('mapCoins').textContent = save.coins;
  const scroll = $('mapScroll');
  scroll.innerHTML = '';
  const districtCount = Math.min(MAX_LEVEL / LEVELS_PER_DISTRICT, Math.floor((save.level - 1) / LEVELS_PER_DISTRICT) + 2);
  for (let d = districtCount - 1; d >= 0; d--) {
    const box = document.createElement('div');
    box.className = 'district';
    const unlocked = d * LEVELS_PER_DISTRICT + 1 <= save.level;
    box.innerHTML = `<h3>${unlocked ? '🏙' : '🔒'} ${dName(d)}</h3>`;
    const nodes = document.createElement('div');
    nodes.className = 'nodes';
    for (let i = 1; i <= LEVELS_PER_DISTRICT; i++) {
      const n = d * LEVELS_PER_DISTRICT + i;
      const b = document.createElement('button');
      b.className = 'node ' + (n < save.level ? 'done' : n === save.level ? 'current' : 'locked');
      const best = save.best[n] || 0;
      const tag = isMilestone(n) ? '🌟' : n % 10 === 0 ? '⚡' : '';
      b.innerHTML = n < save.level ? `${n}<div style="font-size:9px;line-height:1">${'🏅'.repeat(best) || '✓'}</div>` : `${n}${tag ? `<div style="font-size:10px;line-height:1">${tag}</div>` : ''}`;
      if (isMilestone(n)) b.style.boxShadow = '0 0 0 3px #ffd23f, 0 4px 0 #b8860b';
      if (n <= save.level) b.onclick = () => startLevel(n);
      nodes.appendChild(b);
    }
    box.appendChild(nodes);
    const last = d * LEVELS_PER_DISTRICT + LEVELS_PER_DISTRICT;
    if (save.level > last) {
      const row = document.createElement('div');
      row.className = 'nodes';
      row.style.cssText = 'justify-content:center;gap:10px;margin-top:10px';
      const addSpecial = (m, icon, label, key) => {
        const b = document.createElement('button');
        const done = save.specials[key + last];
        b.className = 'node special ' + (done ? 'done' : 'current');
        b.textContent = `${icon} ${label}${done ? ' ✓' : ''}`;
        b.onclick = () => startLevel(last, m);
        row.appendChild(b);
      };
      addSpecial('bonus', '🎁', t('bonusNode'), 'b');
      if (last % 10 === 0) addSpecial('challenge', '🏆', t('chNode'), 'c');
      box.appendChild(row);
    }
    scroll.appendChild(box);
  }
  $('playBtn').textContent = save.level > MAX_LEVEL ? t('replay', {
    n: MAX_LEVEL
  }) : t('play', {
    n: save.level
  });
  setTimeout(() => scroll.scrollTop = scroll.scrollHeight, 0);
}
function openShop() {
  showOnly('shop');
  $('shopCoins').textContent = save.coins;
  const list = $('skinList');
  list.innerHTML = '';
  for (const skin of SKINS) {
    const row = document.createElement('div');
    row.className = 'skin';
    const owned = save.owned.includes(skin.id);
    const equipped = save.skin === skin.id;
    row.innerHTML = `<div class="sw" style="background:${skin.swatch}"></div><div class="nm">${t('s_' + skin.id)}</div>`;
    const b = document.createElement('button');
    b.className = 'btn ' + (equipped ? 'dark' : owned ? 'green' : '');
    b.textContent = equipped ? t('equipped') : owned ? t('equip') : `🪙 ${skin.cost}`;
    b.disabled = equipped || !owned && save.coins < skin.cost;
    b.onclick = () => {
      if (!owned) {
        save.coins -= skin.cost;
        save.owned.push(skin.id);
        playClip(sfxCoin);
      }
      save.skin = skin.id;
      saveGame(save);
      openShop();
      $('mapCoins').textContent = save.coins;
    };
    row.appendChild(b);
    list.appendChild(row);
  }
}
$('mapBtn').onclick = openMap;
$('playBtn').onclick = () => startLevel(Math.min(save.level, MAX_LEVEL));
$('shopBtn').onclick = openShop;
$('shopClose').onclick = openMap;
$('missionsBtn').onclick = openMissions;
$('missionsClose').onclick = openMap;
$('nextBtn').onclick = () => {
  if (mode === 'normal' && level.n >= MAX_LEVEL) openMap();else if (mode === 'normal') startLevel(level.n + 1);else startLevel(Math.min(save.level, MAX_LEVEL));
};
$('winMapBtn').onclick = openMap;
$('loseMapBtn').onclick = openMap;
$('retryBtn').onclick = () => startLevel(level.n, mode);
function refreshMuteIcon() {
  const btn = $('muteBtn');
  btn.textContent = save.muted ? '🔇' : '🔊';
  btn.classList.toggle('off', save.muted);
  btn.setAttribute('aria-pressed', String(save.muted));
  btn.title = t('sound') + ': ' + t(save.muted ? 'off' : 'on');
  const toggle = $('soundToggle');
  if (toggle) {
    toggle.textContent = (save.muted ? '🔇 ' : '🔊 ') + t(save.muted ? 'off' : 'on');
    toggle.className = 'btn ' + (save.muted ? 'dark' : 'green');
  }
}
$('muteBtn').onclick = () => {
  save.muted = !save.muted;
  saveGame(save);
  refreshMuteIcon();
  if (save.muted) music.pause();else music.play().catch(() => {});
};
refreshMuteIcon();
let settingsReturn = null;
function renderSettings() {
  const list = $('langList');
  list.innerHTML = '';
  for (const L of LANGS) {
    const b = document.createElement('button');
    b.className = 'btn langBtn ' + (L.code === getLang() ? 'sel green' : 'dark');
    b.textContent = L.label;
    b.onclick = () => {
      save.lang = L.code;
      saveGame(save);
      setLang(L.code);
      applyStaticI18n();
      refreshLevelLabel();
      if (mini) refreshGoalLabel();
      renderSettings();
    };
    list.appendChild(b);
  }
  refreshMuteIcon();
}
function openSettings() {
  const prevPhase = phase;
  const prevOverlay = ['map', 'win', 'lose'].find(o => $(o).style.display === 'flex') || null;
  if (phase === 'play') phase = 'settings';
  settingsReturn = () => {
    phase = prevPhase;
    if (prevOverlay === 'map') openMap();else showOnly(prevOverlay);
  };
  showOnly('settings');
  renderSettings();
}
$('mapSettingsBtn').onclick = openSettings;
$('hudSettingsBtn').onclick = () => {
  if (phase === 'play') openSettings();
};
$('settingsClose').onclick = () => settingsReturn && settingsReturn();
$('soundToggle').onclick = () => {
  $('muteBtn').onclick();
  renderSettings();
};
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
renderer.domElement.addEventListener('pointerdown', e => {
  if (phase !== 'play') return;
  pointer.set(e.clientX / window.innerWidth * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);
  raycaster.setFromCamera(pointer, camera);
  const roots = vehicles.filter(v => v.status === 'lot').map(v => v.root);
  const hits = raycaster.intersectObjects(roots, true);
  let picked = null;
  if (hits.length) {
    let o = hits[0].object;
    while (o && o.userData.vid === undefined) o = o.parent;
    if (o) picked = vehicles[o.userData.vid];
  } else {
    const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.3);
    const p = new THREE.Vector3();
    if (raycaster.ray.intersectPlane(groundPlane, p)) {
      let best = 0.6;
      for (const v of vehicles) {
        if (v.status !== 'lot') continue;
        const d = v.root.position.distanceTo(new THREE.Vector3(p.x, 0, p.z)) - (v.len - 1) * 0.5;
        if (d < best) {
          best = d;
          picked = v;
        }
      }
    }
  }
  if (picked) tapVehicle(picked);
});
const timer = new THREE.Timer();
let clock = 0;
renderer.setAnimationLoop(time => {
  timer.update(time);
  const dt = Math.min(0.05, Math.max(0, timer.getDelta()));
  clock += dt;
  if (phase === 'play') {
    timeLeft -= dt;
    updateBoarding(dt);
    updateVip(dt);
    checkLose();
    if (timeLeft <= 0 && phase === 'play') {
      timeLeft = 0;
      lose('time');
    }
    updateHud();
  }
  if (level && phase !== 'ad') {
    if (phase !== 'play' && phase !== 'win') {} else {
      vehicles.forEach(v => stepVehicle(v, dt));
      updateHoppers(dt);
    }
    queueShift = THREE.MathUtils.damp(queueShift, 0, 10, dt);
    queuePool.forEach((p, i) => {
      const visible = i < queue.length;
      p.visible = visible;
      if (!visible) return;
      if (p.userData.colorIndex !== queue[i]) {
        p.userData.colorIndex = queue[i];
        p.userData.mat.color.setHex(COLORS[queue[i]].hex);
      }
      p.userData.vip.visible = !!queueVip[i];
      p.position.x = G.qStartX + i * QUEUE_SPACING + queueShift;
      p.position.y = Math.abs(Math.sin(clock * 6 + i * 0.7)) * (i === 0 ? 0.12 : 0.04);
    });
  }
  updateParticles(dt);
  renderer.render(scene, camera);
});
level = makeLevel(Math.max(1, save.level));
startLevel(Math.min(save.level, MAX_LEVEL));
openMap();
window.taxiSelfTest = (from = 1, to = MAX_LEVEL, chunk = 1) => new Promise(resolve => {
  const failures = [];
  let n = from;
  const t0 = performance.now();
  const step = () => {
    const end = Math.min(to, n + chunk - 1);
    failures.push(...testLevels(n, end));
    n = end + 1;
    if (n <= to) setTimeout(step, 0);else {
      console.info(`[TaxiSort self-test] levels ${from}-${to}: ${failures.length} failures in ${Math.round(performance.now() - t0)}ms`, failures);
      resolve(failures);
    }
  };
  step();
});
if (location.hash.includes('selftest')) window.taxiSelfTest();