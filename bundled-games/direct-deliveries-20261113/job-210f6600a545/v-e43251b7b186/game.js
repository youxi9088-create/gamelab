function readLocalProgress() {
  try {
    const x = JSON.parse(localStorage.getItem('skyrollLocalProgress') || '{}');
    return {
      level: Math.max(1, Math.min(30, Math.floor(Number(x.level) || 1))),
      stars: x.stars && typeof x.stars === 'object' ? x.stars : {}
    };
  } catch {
    return {
      level: 1,
      stars: {}
    };
  }
}
function showLocalResult(won, reason = '') {
  const old = document.getElementById('local-result');
  if (old) old.remove();
  document.getElementById('in-game-controls').style.display = 'none';
  if (won) {
    const x = readLocalProgress();
    x.stars[currentLevelIndex] = Math.max(Number(x.stars[currentLevelIndex]) || 0, finalStars);
    x.level = Math.max(x.level, Math.min(totalLevels, currentLevelIndex + 1));
    localStorage.setItem('skyrollLocalProgress', JSON.stringify(x));
  }
  const panel = document.createElement('div');
  panel.id = 'local-result';
  panel.className = 'overlay';
  panel.style.display = 'flex';
  panel.style.alignItems = 'center';
  panel.style.justifyContent = 'center';
  const card = document.createElement('div');
  card.className = 'modal-card';
  const title = document.createElement('h2');
  title.textContent = won ? 'LEVEL COMPLETE' : 'GAME OVER';
  card.append(title);
  const detail = document.createElement('p');
  detail.textContent = 'Level ' + currentLevelIndex + (won ? ' · ' + finalStars + ' / 3 stars' : ' · ' + reason);
  card.append(detail);
  const add = (label, fn) => {
    const btn = document.createElement('button');
    btn.className = 'btn';
    btn.textContent = label;
    btn.style.margin = '8px';
    btn.onclick = () => {
      panel.remove();
      fn();
    };
    card.append(btn);
  };
  add('RETRY', () => window.startGame());
  if (won && currentLevelIndex < totalLevels) add('NEXT LEVEL', () => {
    currentLevelIndex++;
    window.startGame();
  });
  add('MAIN MENU', () => window.forceEndGame());
  panel.append(card);
  document.body.append(panel);
}
import * as THREE from './_remote/28f7db420fe306d9/three.module.js';
import * as CANNON from './_remote/378fdf6dadf61abc/+esm.js';
document.addEventListener('selectstart', e => e.preventDefault());
document.addEventListener('touchmove', e => e.preventDefault(), {
  passive: false
});
let scene, camera, renderer, world, ballMesh, ballBody;
let terrainMesh, terrainGeo, waterMesh, skybox, treeMesh1, treeMesh2, treeMesh3;
let dirLight, hemiLight;
let pendingMuted = false;
let gameState = 'INTRO';
let scoreDistance = 0;
let lives = 3;
let internalWaveCounter = 1;
let timeLeft = 0;
let currentWaveMaxTime = 0;
let difficultyMultiplier = 1.0;
let currentLevelIndex = readLocalProgress().level;
let totalLevels = 30;
let levelTimeLimit = 0;
let starThresholds = {
  star3: 0,
  star2: 0
};
let finishTimer = 0;
let fireworks = [];
let finalStars = 0;
let randomSeed = 1;
function seededRandom() {
  let t = randomSeed += 0x6D2B79F5;
  t = Math.imul(t ^ t >>> 15, t | 1);
  t ^= t + Math.imul(t ^ t >>> 7, t | 61);
  return ((t ^ t >>> 14) >>> 0) / 4294967296;
}
let originalMathRandom = Math.random;
const activeChunks = [];
const checkpoints = [];
const dynamicObjects = [];
const pistonPool = [];
const fanPool = [];
const elevatorPool = [];
const polesPool = [];
const windmillPool = [];
const buzzsawPool = [];
const sweeperPool = [];
const crumblingPool = [];
let globalX = 0,
  globalY = 0,
  globalZ = 15;
let safeRespawnPos = new THREE.Vector3(0, 5, 5);
let challengesCount = 0;
let isNextConnector = false;
let pendingDownhill = false;
let waveCounterToAssign = 2;
let pendingWaveDistance = 0;
let pendingWaveTimeBuffer = 5.0;
let audioCtx;
let normalRollGain, ropeRollGain, rainGain;
let normalRollSource, ropeRollSource, rainSource;
let impactAudioBuffer = null;
let buttonAudioBuffer = null;
let goalAudioBuffer = null;
let isAudioInitialized = false;
const ropeZones = [];
let smoothConcreteMat;
let globalCannonballGeo;
let globalCannonballMat;
let crackedConcreteMat;
let rainInstancedMesh;
let rainData = [];
let ripplePool = [];
let weatherState = {
  currentDayIndex: -1,
  rainPhase: 'night',
  rainStartTime: 0,
  rainEndTime: 0,
  isRaining: false,
  nextLightningTime: 0,
  lightningFlashAlpha: 0,
  flashesRemaining: 0,
  flashDelayTimer: 0
};
const rainRaycaster = new THREE.Raycaster();
const downVector = new THREE.Vector3(0, -1, 0);
const gloomyColor = new THREE.Color(0x4a5a6a);
const lightningColor = new THREE.Color(0xddeeff);
let environmentTime = 0;
const ENV_STATES = {
  day: {
    sky: new THREE.Color('#87CEEB'),
    dir: new THREE.Color(0xffffff),
    hemiS: new THREE.Color(0xffffff),
    hemiG: new THREE.Color(0x88cc88),
    intensity: 1.5
  },
  sunset: {
    sky: new THREE.Color('#ff7e5f'),
    dir: new THREE.Color(0xffaa55),
    hemiS: new THREE.Color(0xcc8855),
    hemiG: new THREE.Color(0x332211),
    intensity: 1.1
  },
  night: {
    sky: new THREE.Color('#0a0b1a'),
    dir: new THREE.Color(0x4a5a8a),
    hemiS: new THREE.Color(0x1a2a4a),
    hemiG: new THREE.Color(0x05050a),
    intensity: 0.35
  },
  sunrise: {
    sky: new THREE.Color('#c9a0dc'),
    dir: new THREE.Color(0xffdd99),
    hemiS: new THREE.Color(0xccaacc),
    hemiG: new THREE.Color(0x443344),
    intensity: 1.0
  }
};
const tempColor = new THREE.Color();
function pseudoRandom(x, z) {
  let n = Math.sin(x * 12.9898 + z * 78.233) * 43758.5453;
  return n - Math.floor(n);
}
async function initAudio() {
  if (isAudioInitialized) return;
  isAudioInitialized = true;
  try {
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContext();
    normalRollGain = audioCtx.createGain();
    normalRollGain.gain.value = 0;
    normalRollGain.connect(audioCtx.destination);
    ropeRollGain = audioCtx.createGain();
    ropeRollGain.gain.value = 0;
    ropeRollGain.connect(audioCtx.destination);
    rainGain = audioCtx.createGain();
    rainGain.gain.value = 0;
    rainGain.connect(audioCtx.destination);
    const [resNormal, resRope, resImpact, resBtn, resRain, resGoal] = await Promise.all([fetch('./_runtime_resources/fed182248e92e5c5a718fde0.mp3'), fetch('./_runtime_resources/fc9ac480c81764002b8446ac.mp3'), fetch('./_runtime_resources/bf5365b2d43f33c3731dad55.mp3'), fetch('./_runtime_resources/fac726460064b745586a4c12.mp3'), fetch('./_runtime_resources/56d732b56139cc90d9f1e40e.mp3'), fetch('./_runtime_resources/c7bcfe2048d5fdde2ff078b2.mp3')]);
    const [bufNormal, bufRope, bufImpact, bufBtn, bufRain, bufGoal] = await Promise.all([resNormal.arrayBuffer().then(b => audioCtx.decodeAudioData(b)), resRope.arrayBuffer().then(b => audioCtx.decodeAudioData(b)), resImpact.arrayBuffer().then(b => audioCtx.decodeAudioData(b)), resBtn.arrayBuffer().then(b => audioCtx.decodeAudioData(b)), resRain.arrayBuffer().then(b => audioCtx.decodeAudioData(b)), resGoal.arrayBuffer().then(b => audioCtx.decodeAudioData(b))]);
    impactAudioBuffer = bufImpact;
    buttonAudioBuffer = bufBtn;
    goalAudioBuffer = bufGoal;
    normalRollSource = audioCtx.createBufferSource();
    normalRollSource.buffer = bufNormal;
    normalRollSource.loop = true;
    normalRollSource.connect(normalRollGain);
    normalRollSource.start(0);
    ropeRollSource = audioCtx.createBufferSource();
    ropeRollSource.buffer = bufRope;
    ropeRollSource.loop = true;
    ropeRollSource.connect(ropeRollGain);
    ropeRollSource.start(0);
    rainSource = audioCtx.createBufferSource();
    rainSource.buffer = bufRain;
    rainSource.loop = true;
    rainSource.connect(rainGain);
    rainSource.start(0);
  } catch (e) {
    console.error("Lỗi khởi tạo Web Audio API:", e);
  }
}
window.playButtonSound = async () => {
  if (!isAudioInitialized) {
    await initAudio();
  }
  if (!audioCtx || !buttonAudioBuffer || pendingMuted) return;
  if (audioCtx.state === 'suspended') audioCtx.resume();
  let source = audioCtx.createBufferSource();
  source.buffer = buttonAudioBuffer;
  source.connect(audioCtx.destination);
  source.start(0);
};
function playImpactSound(velocity) {
  if (!audioCtx || !impactAudioBuffer) return;
  let vol = Math.min(1.0, velocity / 20.0);
  if (vol < 0.15) return;
  let source = audioCtx.createBufferSource();
  source.buffer = impactAudioBuffer;
  let gainNode = audioCtx.createGain();
  gainNode.gain.value = vol * 0.8;
  source.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  source.start(0);
}
window.playGoalSound = () => {
  if (!audioCtx || !goalAudioBuffer || pendingMuted) return;
  let source = audioCtx.createBufferSource();
  source.buffer = goalAudioBuffer;
  source.connect(audioCtx.destination);
  source.start(0);
};
function getDeterministicSequence(targetLv) {
  let count = targetLv <= 3 ? 3 : targetLv <= 10 ? 4 + Math.floor((targetLv - 4) / 6 * 3) : targetLv <= 15 ? 8 + Math.floor((targetLv - 11) / 4 * 3) : targetLv <= 22 ? 12 + Math.floor((targetLv - 16) / 6 * 4) : 17 + Math.floor((targetLv - 23) / 7 * 4);
  if (count > 21) count = 21;
  let tempSeed = hashSeed(targetLv + 8888);
  function localRandom() {
    let t = tempSeed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
  const localEasyTypes = [1, 2, 3, 4, 5, 6, 7, 8, 11, 16];
  const localHardTypes = [9, 10, 12, 13, 14, 15, 17];
  let localEasyBag = [];
  let localHardBag = [];
  function getNextLocalType(tier) {
    let bag = tier === 'easy' ? localEasyBag : localHardBag;
    let source = tier === 'easy' ? localEasyTypes : localHardTypes;
    if (bag.length === 0) {
      bag.push(...source);
      for (let i = bag.length - 1; i > 0; i--) {
        const j = Math.floor(localRandom() * (i + 1));
        [bag[i], bag[j]] = [bag[j], bag[i]];
      }
    }
    return bag.pop();
  }
  let seq = [];
  if (targetLv <= 3) {
    for (let i = 0; i < count; i++) seq.push(getNextLocalType('easy'));
  } else {
    seq.push(getNextLocalType('hard'));
    let hardRatio = Math.min(0.6, 0.1 + targetLv / 30 * 0.5);
    for (let i = 1; i < count; i++) {
      if (localRandom() < hardRatio) seq.push(getNextLocalType('hard'));else seq.push(getNextLocalType('easy'));
    }
    for (let i = seq.length - 1; i > 0; i--) {
      const j = Math.floor(localRandom() * (i + 1));
      [seq[i], seq[j]] = [seq[j], seq[i]];
    }
  }
  return seq;
}
function calculateExactLevelTime(targetLv) {
  let seq = getDeterministicSequence(targetLv);
  let extraL = (targetLv - 1) * 0.8;
  let simZ = 15;
  simZ -= 25;
  simZ -= 40 + extraL;
  for (let i = 0; i < seq.length; i++) {
    let type = seq[i];
    if (type === 1) simZ -= 140 + extraL;else if (type === 2) simZ -= 120 + extraL;else if (type === 3) simZ -= 100 + extraL;else if (type === 4) simZ -= 160 + extraL;else if (type === 5) simZ -= 90 + extraL;else if (type === 6) simZ -= 80 + extraL;else if (type === 7) simZ -= 70 + extraL;else if (type === 8) simZ -= 58 + extraL;else if (type === 9) simZ -= 190 + extraL;else if (type === 10) simZ -= 30.68;else if (type === 11) simZ -= 130 + extraL;else if (type === 12) simZ -= 41.8;else if (type === 13) simZ -= 100 + extraL;else if (type === 14) simZ -= 140;else if (type === 15) simZ -= 86;else if (type === 16) simZ -= 44;else if (type === 17) simZ -= 220 + extraL * 5;
    simZ -= 40 + extraL;
  }
  let exactDistanceZ = simZ;
  let totalDistance = 15 - exactDistanceZ;
  let levelBonusTime = 2.0 + (targetLv - 1) * 0.5;
  let time3StarTarget = totalDistance / 15.0 + levelBonusTime;
  let finalTimeLimit = time3StarTarget / 0.65;
  return finalTimeLimit;
}
let lastGroundedY = 5.0;
function hashSeed(n) {
  n = Math.imul(n ^ n >>> 15, 1 | n);
  n ^= n + Math.imul(n ^ n >>> 7, 61 | n);
  return (n ^ n >>> 14) >>> 0;
}
const skins = [{
  name: "CLASSIC",
  type: "classic",
  unlocked: true
}, {
  name: "CLASSIC 2",
  type: "classic2",
  unlocked: true
}];
let currentSkinIndex = 0;
let introSpinAngle = 0;
let skinParticles = [];
let trackMaterials, grassMat, defaultMat, hazardMat, solarPanelMat, steelMat, elevatorMat, poleMat, mazeWallMat;
let isDragging = false,
  lastX = 0,
  lastY = 0;
let accumulatedDx = 0,
  accumulatedDy = 0;
let previousBallPos = new THREE.Vector3(0, 5, 5);
let currentYaw = 0,
  rollAngle = 0;
let lastFrameTime = performance.now();
let gameTime = 0;
init();
animate();
function createCrackedConcreteTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#9aa1a6';
  ctx.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 3000; i++) {
    ctx.fillStyle = Math.random() > 0.5 ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)';
    ctx.fillRect(Math.random() * 512, Math.random() * 512, Math.random() * 10, Math.random() * 10);
  }
  ctx.strokeStyle = '#2c3e50';
  for (let i = 0; i < 15; i++) {
    ctx.beginPath();
    ctx.lineWidth = Math.random() * 2 + 1;
    let startX = Math.random() * 512;
    let startY = Math.random() * 512;
    ctx.moveTo(startX, startY);
    let segments = Math.floor(Math.random() * 5) + 3;
    for (let j = 0; j < segments; j++) {
      startX += (Math.random() - 0.5) * 100;
      startY += (Math.random() - 0.5) * 100;
      ctx.lineTo(startX, startY);
    }
    ctx.stroke();
  }
  ctx.fillStyle = 'rgba(46, 204, 113, 0.1)';
  ctx.fillRect(0, 0, 512, 20);
  ctx.fillRect(0, 492, 512, 20);
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = 4;
  return tex;
}
function createSoccerTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  const imgData = ctx.createImageData(512, 256);
  const data = imgData.data;
  const t = (1.0 + Math.sqrt(5.0)) / 2.0;
  const invT = 1.0 / t;
  let pentagons = [[0, 1, t], [0, 1, -t], [0, -1, t], [0, -1, -t], [1, t, 0], [1, -t, 0], [-1, t, 0], [-1, -t, 0], [t, 0, 1], [t, 0, -1], [-t, 0, 1], [-t, 0, -1]];
  let hexagons = [[1, 1, 1], [1, 1, -1], [1, -1, 1], [1, -1, -1], [-1, 1, 1], [-1, 1, -1], [-1, -1, 1], [-1, -1, -1], [0, t, invT], [0, t, -invT], [0, -t, invT], [0, -t, -invT], [invT, 0, t], [invT, 0, -t], [-invT, 0, t], [-invT, 0, -t], [t, invT, 0], [t, -invT, 0], [-t, invT, 0], [-t, -invT, 0]];
  let points = pentagons.concat(hexagons);
  points = points.map(p => {
    let len = Math.sqrt(p[0] * p[0] + p[1] * p[1] + p[2] * p[2]);
    return [p[0] / len, p[1] / len, p[2] / len];
  });
  for (let y = 0; y < 256; y++) {
    let phi = y / 256 * Math.PI;
    let sinPhi = Math.sin(phi);
    let cosPhi = Math.cos(phi);
    for (let x = 0; x < 512; x++) {
      let theta = x / 512 * 2 * Math.PI;
      let px = sinPhi * Math.cos(theta);
      let pz = sinPhi * Math.sin(theta);
      let py = cosPhi;
      let max1 = -2,
        max2 = -2;
      let bestIdx = -1;
      for (let i = 0; i < 32; i++) {
        let dot = px * points[i][0] + py * points[i][1] + pz * points[i][2];
        if (dot > max1) {
          max2 = max1;
          max1 = dot;
          bestIdx = i;
        } else if (dot > max2) {
          max2 = dot;
        }
      }
      let idx = (y * 512 + x) * 4;
      let diff = max1 - max2;
      if (diff < 0.003) {
        data[idx] = 20;
        data[idx + 1] = 20;
        data[idx + 2] = 20;
      } else if (diff < 0.007) {
        let blend = (diff - 0.003) / 0.004;
        let targetColor = bestIdx < 12 ? 26 : 244;
        data[idx] = 20 + blend * (targetColor - 20);
        data[idx + 1] = 20 + blend * (targetColor - 20);
        data[idx + 2] = 20 + blend * (targetColor - 20);
      } else {
        if (bestIdx < 12) {
          data[idx] = 26;
          data[idx + 1] = 26;
          data[idx + 2] = 26;
        } else {
          data[idx] = 244;
          data[idx + 1] = 246;
          data[idx + 2] = 246;
        }
      }
      data[idx + 3] = 255;
    }
  }
  ctx.putImageData(imgData, 0, 0);
  const tex = new THREE.CanvasTexture(canvas);
  tex.anisotropy = 4;
  return tex;
}
function createChampionTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  const imgData = ctx.createImageData(512, 256);
  const data = imgData.data;
  const t = (1.0 + Math.sqrt(5.0)) / 2.0;
  let rawPoints = [[0, 1, t], [0, 1, -t], [0, -1, t], [0, -1, -t], [1, t, 0], [1, -t, 0], [-1, t, 0], [-1, -t, 0], [t, 0, 1], [t, 0, -1], [-t, 0, 1], [-t, 0, -1]];
  let points = rawPoints.map(p => {
    let len = Math.sqrt(p[0] * p[0] + p[1] * p[1] + p[2] * p[2]);
    return new THREE.Vector3(p[0] / len, p[1] / len, p[2] / len);
  });
  let stars = [];
  for (let i = 0; i < 12; i++) {
    let v = points[i];
    let neighbor = null;
    for (let j = 0; j < 12; j++) {
      if (i === j) continue;
      if (v.dot(points[j]) > 0.4) {
        neighbor = points[j];
        break;
      }
    }
    let ref = neighbor.clone();
    let proj = v.clone().multiplyScalar(ref.dot(v));
    let xLocal = ref.sub(proj).normalize();
    let yLocal = new THREE.Vector3().crossVectors(v, xLocal).normalize();
    stars.push({
      v: v,
      xDir: xLocal,
      yDir: yLocal
    });
  }
  const R_tip = Math.acos(1 / Math.sqrt(5)) / 2;
  const R_valley = R_tip * 0.45;
  const pi5 = Math.PI / 5;
  const pTipX = R_tip;
  const pTipY = 0;
  const pValX = R_valley * Math.cos(pi5);
  const pValY = R_valley * Math.sin(pi5);
  const A = pTipY - pValY;
  const B = pValX - pTipX;
  const C = A * pTipX + B * pTipY;
  for (let y = 0; y < 256; y++) {
    let phi = y / 256 * Math.PI;
    let sinPhi = Math.sin(phi);
    let cosPhi = Math.cos(phi);
    for (let x = 0; x < 512; x++) {
      let theta = x / 512 * 2 * Math.PI;
      let P = new THREE.Vector3(sinPhi * Math.cos(theta), cosPhi, sinPhi * Math.sin(theta));
      let maxDot = -2;
      let bestStar = null;
      for (let i = 0; i < 12; i++) {
        let d = P.dot(stars[i].v);
        if (d > maxDot) {
          maxDot = d;
          bestStar = stars[i];
        }
      }
      let dx = P.dot(bestStar.xDir);
      let dy = P.dot(bestStar.yDir);
      let angle = Math.atan2(dy, dx);
      let a = Math.abs(angle) % (Math.PI * 0.4);
      if (a > Math.PI * 0.2) a = Math.PI * 0.4 - a;
      let R_bound = C / (A * Math.cos(a) + B * Math.sin(a));
      let dist = Math.acos(maxDot);
      let idx = (y * 512 + x) * 4;
      let diff = dist - R_bound;
      let noise = Math.sin(x * 0.8) * Math.cos(y * 0.8) * 10;
      if (diff < -0.015) {
        data[idx] = 15 + noise;
        data[idx + 1] = 25 + noise;
        data[idx + 2] = 60 + noise;
      } else if (diff < 0.0) {
        let blend = Math.abs(diff) / 0.015;
        data[idx] = (15 + noise) * blend;
        data[idx + 1] = (25 + noise) * blend;
        data[idx + 2] = (60 + noise) * blend;
      } else if (diff < 0.015) {
        let blend = diff / 0.015;
        data[idx] = 80 + blend * 165;
        data[idx + 1] = 85 + blend * 165;
        data[idx + 2] = 90 + blend * 160;
      } else {
        data[idx] = 245;
        data[idx + 1] = 250;
        data[idx + 2] = 250;
      }
      data[idx + 3] = 255;
    }
  }
  ctx.putImageData(imgData, 0, 0);
  const tex = new THREE.CanvasTexture(canvas);
  tex.anisotropy = 4;
  return tex;
}
function createBaseballTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#fdfbf7';
  ctx.fillRect(0, 0, 1024, 512);
  const cy = 256;
  const amp = 140;
  const freq = Math.PI * 4;
  ctx.beginPath();
  ctx.lineWidth = 4;
  ctx.strokeStyle = 'rgba(0,0,0,0.15)';
  for (let x = 0; x <= 1024; x += 2) {
    let normX = x / 1024;
    let y = cy + Math.sin(normX * freq) * amp;
    if (x === 0) ctx.moveTo(x, y);else ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.lineWidth = 8;
  ctx.strokeStyle = '#c0392b';
  ctx.lineCap = 'round';
  const stitchSpacing = 16;
  for (let x = 0; x <= 1024; x += stitchSpacing) {
    let normX = x / 1024;
    let y = cy + Math.sin(normX * freq) * amp;
    let dyDeriv = Math.cos(normX * freq) * freq * amp;
    let tangentAngle = Math.atan2(dyDeriv, 1024);
    let normalAngle = tangentAngle + Math.PI / 2;
    let stitchLength = 16;
    let dxStitch = Math.cos(normalAngle) * stitchLength;
    let dyStitch = Math.sin(normalAngle) * stitchLength;
    ctx.beginPath();
    ctx.moveTo(x - dxStitch, y - dyStitch);
    ctx.lineTo(x + dxStitch, y + dyStitch);
    ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.anisotropy = 4;
  return tex;
}
function init() {
  window.addEventListener('contextmenu', e => e.preventDefault());
  scene = new THREE.Scene();
  scene.background = new THREE.Color(ENV_STATES.day.sky);
  scene.fog = new THREE.Fog(ENV_STATES.day.sky, 350, 1000);
  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1500);
  renderer = new THREE.WebGLRenderer({
    antialias: true
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  document.body.appendChild(renderer.domElement);
  hemiLight = new THREE.HemisphereLight(ENV_STATES.day.hemiS, ENV_STATES.day.hemiG, 1.0);
  scene.add(hemiLight);
  dirLight = new THREE.DirectionalLight(ENV_STATES.day.dir, ENV_STATES.day.intensity);
  dirLight.position.set(50, 100, 50);
  dirLight.castShadow = true;
  dirLight.shadow.mapSize.width = 2048;
  dirLight.shadow.mapSize.height = 2048;
  dirLight.shadow.camera.left = -40;
  dirLight.shadow.camera.right = 40;
  dirLight.shadow.camera.top = 40;
  dirLight.shadow.camera.bottom = -40;
  dirLight.shadow.camera.near = 0.5;
  dirLight.shadow.camera.far = 250;
  dirLight.shadow.bias = -0.0005;
  dirLight.target = new THREE.Object3D();
  scene.add(dirLight.target);
  scene.add(dirLight);
  world = new CANNON.World({
    gravity: new CANNON.Vec3(0, -35, 0)
  });
  defaultMat = new CANNON.Material();
  world.addContactMaterial(new CANNON.ContactMaterial(defaultMat, defaultMat, {
    friction: 0.0,
    restitution: 0.0,
    contactEquationStiffness: 1e8,
    contactEquationRelaxation: 3
  }));
  elevatorMat = new CANNON.Material();
  world.addContactMaterial(new CANNON.ContactMaterial(defaultMat, elevatorMat, {
    friction: 0.0,
    restitution: 0.0,
    contactEquationStiffness: 1e10,
    contactEquationRelaxation: 1
  }));
  poleMat = new CANNON.Material();
  world.addContactMaterial(new CANNON.ContactMaterial(defaultMat, poleMat, {
    friction: 0.0,
    restitution: 0.2,
    contactEquationStiffness: 1e8,
    contactEquationRelaxation: 3
  }));
  const stnCanv = document.createElement('canvas');
  stnCanv.width = 512;
  stnCanv.height = 512;
  const ctxS = stnCanv.getContext('2d');
  ctxS.fillStyle = '#E5E7E9';
  ctxS.fillRect(0, 0, 512, 512);
  ctxS.lineWidth = 4;
  ctxS.strokeStyle = '#D5D8DC';
  for (let y = 0; y <= 512; y += 64) {
    let offsetX = y / 64 % 2 === 0 ? 0 : 64;
    for (let x = -64; x <= 512; x += 128) {
      ctxS.strokeRect(x + offsetX, y, 128, 64);
      ctxS.fillStyle = Math.random() > 0.5 ? '#F2F3F4' : '#E5E7E9';
      ctxS.fillRect(x + offsetX + 2, y + 2, 124, 60);
    }
  }
  const stnTex = new THREE.CanvasTexture(stnCanv);
  stnTex.wrapS = THREE.RepeatWrapping;
  stnTex.wrapT = THREE.RepeatWrapping;
  stnTex.anisotropy = renderer.capabilities.getMaxAnisotropy();
  trackMaterials = [new THREE.MeshStandardMaterial({
    map: stnTex,
    roughness: 0.8,
    metalness: 0.1,
    side: THREE.DoubleSide
  }), new THREE.MeshStandardMaterial({
    color: 0xD5D8DC,
    roughness: 0.9,
    metalness: 0.1,
    side: THREE.DoubleSide
  }), new THREE.MeshStandardMaterial({
    color: 0xBFC9CA,
    roughness: 1.0,
    side: THREE.DoubleSide
  })];
  smoothConcreteMat = new THREE.MeshStandardMaterial({
    color: 0xF4F6F6,
    roughness: 0.7,
    metalness: 0.1
  });
  crackedConcreteMat = new THREE.MeshStandardMaterial({
    map: createCrackedConcreteTexture(),
    roughness: 0.9,
    metalness: 0.1
  });
  globalCannonballGeo = new THREE.IcosahedronGeometry(0.8, 3);
  globalCannonballMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.1,
    metalness: 0.3
  });
  grassMat = new THREE.MeshStandardMaterial({
    color: 0x2ecc71,
    roughness: 0.9,
    metalness: 0.0
  });
  steelMat = new THREE.MeshStandardMaterial({
    color: 0x95a5a6,
    roughness: 0.6,
    metalness: 0.5
  });
  mazeWallMat = new THREE.MeshStandardMaterial({
    color: 0xecf0f1,
    roughness: 0.3,
    metalness: 0.2
  });
  const hazCanvas = document.createElement('canvas');
  hazCanvas.width = 256;
  hazCanvas.height = 256;
  const hCtx = hazCanvas.getContext('2d');
  hCtx.fillStyle = '#f1c40f';
  hCtx.fillRect(0, 0, 256, 256);
  hCtx.fillStyle = '#222222';
  for (let i = -256; i < 256; i += 64) {
    hCtx.beginPath();
    hCtx.moveTo(i, 0);
    hCtx.lineTo(i + 32, 0);
    hCtx.lineTo(i + 288, 256);
    hCtx.lineTo(i + 256, 256);
    hCtx.fill();
  }
  const hazardTex = new THREE.CanvasTexture(hazCanvas);
  hazardTex.wrapS = THREE.RepeatWrapping;
  hazardTex.wrapT = THREE.RepeatWrapping;
  hazardMat = new THREE.MeshStandardMaterial({
    map: hazardTex,
    roughness: 0.5
  });
  const solCanvas = document.createElement('canvas');
  solCanvas.width = 256;
  solCanvas.height = 256;
  const slCtx = solCanvas.getContext('2d');
  slCtx.fillStyle = '#1e3799';
  slCtx.fillRect(0, 0, 256, 256);
  slCtx.strokeStyle = '#00d2d3';
  slCtx.lineWidth = 4;
  for (let i = 0; i <= 256; i += 32) {
    slCtx.beginPath();
    slCtx.moveTo(i, 0);
    slCtx.lineTo(i, 256);
    slCtx.stroke();
    slCtx.beginPath();
    slCtx.moveTo(0, i);
    slCtx.lineTo(256, i);
    slCtx.stroke();
  }
  const solarTex = new THREE.CanvasTexture(solCanvas);
  solarTex.wrapS = THREE.RepeatWrapping;
  solarTex.wrapT = THREE.RepeatWrapping;
  solarTex.repeat.set(4, 2);
  solarPanelMat = new THREE.MeshStandardMaterial({
    map: solarTex,
    roughness: 0.2,
    metalness: 0.8
  });
  ballBody = new CANNON.Body({
    mass: 12,
    material: defaultMat,
    position: new CANNON.Vec3(0, 5, 5),
    shape: new CANNON.Sphere(0.8)
  });
  ballBody.linearDamping = 0.0;
  ballBody.fixedRotation = true;
  ballBody.updateMassProperties();
  ballBody.addEventListener('collide', e => {
    if (gameState !== 'PLAYING') return;
    const velocity = e.contact.getImpactVelocityAlongNormal();
    if (Math.abs(velocity) > 3.0) {
      playImpactSound(Math.abs(velocity));
    }
  });
  world.addBody(ballBody);
  buildBallSkin(currentSkinIndex);
  updateSkinUI();
  const skyCanvas = document.createElement('canvas');
  skyCanvas.width = 2048;
  skyCanvas.height = 1024;
  const sCtx = skyCanvas.getContext('2d');
  let grd = sCtx.createLinearGradient(0, 0, 0, 1024);
  grd.addColorStop(0, '#ffffff');
  grd.addColorStop(0.5, '#ffffff');
  grd.addColorStop(1, '#ffffff');
  sCtx.fillStyle = grd;
  sCtx.fillRect(0, 0, 2048, 1024);
  const sunGrd = sCtx.createRadialGradient(1024, 500, 0, 1024, 500, 400);
  sunGrd.addColorStop(0, 'rgba(255, 255, 200, 0.4)');
  sunGrd.addColorStop(1, 'rgba(255, 255, 200, 0)');
  sCtx.fillStyle = sunGrd;
  sCtx.fillRect(0, 0, 2048, 1024);
  sCtx.fillStyle = '#7FB3D5';
  sCtx.beginPath();
  sCtx.moveTo(0, 1024);
  for (let i = 0; i <= 2048; i += 10) {
    sCtx.lineTo(i, 600 - Math.sin(i * 0.01) * 60 - Math.sin(i * 0.05) * 15);
  }
  sCtx.lineTo(2048, 1024);
  sCtx.fill();
  sCtx.fillStyle = '#5499C7';
  sCtx.beginPath();
  sCtx.moveTo(0, 1024);
  for (let i = 0; i <= 2048; i += 10) {
    sCtx.lineTo(i, 680 - Math.sin(i * 0.008 + 10) * 50 - Math.sin(i * 0.03) * 25);
  }
  sCtx.lineTo(2048, 1024);
  sCtx.fill();
  sCtx.fillStyle = '#2980B9';
  sCtx.beginPath();
  sCtx.moveTo(0, 1024);
  for (let i = 0; i <= 2048; i += 10) {
    sCtx.lineTo(i, 780 - Math.sin(i * 0.015 + 5) * 40 - Math.cos(i * 0.04) * 20);
  }
  sCtx.lineTo(2048, 1024);
  sCtx.fill();
  const skyTex = new THREE.CanvasTexture(skyCanvas);
  skyTex.wrapS = THREE.RepeatWrapping;
  const skyMat = new THREE.MeshBasicMaterial({
    map: skyTex,
    side: THREE.BackSide,
    fog: false,
    color: 0xffffff
  });
  skybox = new THREE.Mesh(new THREE.CylinderGeometry(600, 600, 1200, 48, 1, true), skyMat);
  skybox.position.y = 100;
  scene.add(skybox);
  terrainGeo = new THREE.PlaneGeometry(800, 800, 40, 40);
  terrainGeo.rotateX(-Math.PI / 2);
  const posAttr = terrainGeo.attributes.position;
  const colors = [];
  for (let i = 0; i < posAttr.count; i++) {
    colors.push(1, 1, 1);
  }
  terrainGeo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  terrainMesh = new THREE.Mesh(terrainGeo, new THREE.MeshStandardMaterial({
    vertexColors: true,
    flatShading: true,
    roughness: 0.9,
    metalness: 0.1
  }));
  terrainMesh.position.y = -280;
  terrainMesh.receiveShadow = true;
  terrainMesh.userData = {
    lastGridX: 9999,
    lastGridZ: 9999
  };
  scene.add(terrainMesh);
  waterMesh = new THREE.Mesh(new THREE.PlaneGeometry(800, 800).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({
    color: 0x00cec9,
    transparent: true,
    opacity: 0.85,
    roughness: 0.1,
    metalness: 0.6
  }));
  waterMesh.position.y = -275;
  scene.add(waterMesh);
  const pineT = new THREE.CylinderGeometry(0.15, 0.3, 3.0, 5).toNonIndexed();
  pineT.translate(0, 1.5, 0);
  const pineC1 = new THREE.ConeGeometry(1.8, 3.0, 7).toNonIndexed();
  pineC1.translate(0, 4.5, 0);
  const pineC2 = new THREE.ConeGeometry(1.3, 2.2, 7).toNonIndexed();
  pineC2.translate(0, 6.2, 0);
  const pineC3 = new THREE.ConeGeometry(0.7, 1.5, 7).toNonIndexed();
  pineC3.translate(0, 7.5, 0);
  const ptCnt = pineT.attributes.position.count;
  const plCnt = pineC1.attributes.position.count + pineC2.attributes.position.count + pineC3.attributes.position.count;
  const pinePos = new Float32Array((ptCnt + plCnt) * 3);
  const pineNrm = new Float32Array((ptCnt + plCnt) * 3);
  pinePos.set(pineT.attributes.position.array, 0);
  let pOff = ptCnt * 3;
  [pineC1, pineC2, pineC3].forEach(g => {
    pinePos.set(g.attributes.position.array, pOff);
    pOff += g.attributes.position.count * 3;
  });
  pineNrm.set(pineT.attributes.normal.array, 0);
  pOff = ptCnt * 3;
  [pineC1, pineC2, pineC3].forEach(g => {
    pineNrm.set(g.attributes.normal.array, pOff);
    pOff += g.attributes.position.count * 3;
  });
  const pineGeo = new THREE.BufferGeometry();
  pineGeo.setAttribute('position', new THREE.BufferAttribute(pinePos, 3));
  pineGeo.setAttribute('normal', new THREE.BufferAttribute(pineNrm, 3));
  pineGeo.addGroup(0, ptCnt, 0);
  pineGeo.addGroup(ptCnt, plCnt, 1);
  const oakT = new THREE.CylinderGeometry(0.3, 0.5, 2.5, 6).toNonIndexed();
  oakT.translate(0, 1.25, 0);
  const oakL = new THREE.IcosahedronGeometry(2.2, 1).toNonIndexed();
  oakL.translate(0, 4.0, 0);
  const otCnt = oakT.attributes.position.count;
  const olCnt = oakL.attributes.position.count;
  const oakPos = new Float32Array((otCnt + olCnt) * 3);
  const oakNrm = new Float32Array((otCnt + olCnt) * 3);
  oakPos.set(oakT.attributes.position.array, 0);
  oakPos.set(oakL.attributes.position.array, otCnt * 3);
  oakNrm.set(oakT.attributes.normal.array, 0);
  oakNrm.set(oakL.attributes.normal.array, otCnt * 3);
  const oakGeo = new THREE.BufferGeometry();
  oakGeo.setAttribute('position', new THREE.BufferAttribute(oakPos, 3));
  oakGeo.setAttribute('normal', new THREE.BufferAttribute(oakNrm, 3));
  oakGeo.addGroup(0, otCnt, 0);
  oakGeo.addGroup(otCnt, olCnt, 1);
  const birchT = new THREE.CylinderGeometry(0.12, 0.2, 4.0, 5).toNonIndexed();
  birchT.translate(0, 2.0, 0);
  const birchL = new THREE.DodecahedronGeometry(1.6, 1).toNonIndexed();
  birchL.translate(0, 5.5, 0);
  const btCnt = birchT.attributes.position.count;
  const blCnt = birchL.attributes.position.count;
  const birchPos = new Float32Array((btCnt + blCnt) * 3);
  const birchNrm = new Float32Array((btCnt + blCnt) * 3);
  birchPos.set(birchT.attributes.position.array, 0);
  birchPos.set(birchL.attributes.position.array, btCnt * 3);
  birchNrm.set(birchT.attributes.normal.array, 0);
  birchNrm.set(birchL.attributes.normal.array, btCnt * 3);
  const birchGeo = new THREE.BufferGeometry();
  birchGeo.setAttribute('position', new THREE.BufferAttribute(birchPos, 3));
  birchGeo.setAttribute('normal', new THREE.BufferAttribute(birchNrm, 3));
  birchGeo.addGroup(0, btCnt, 0);
  birchGeo.addGroup(btCnt, blCnt, 1);
  const woodMat = new THREE.MeshStandardMaterial({
    color: 0x5c4033,
    roughness: 1.0,
    flatShading: true
  });
  const birchWoodMat = new THREE.MeshStandardMaterial({
    color: 0xd4c5a9,
    roughness: 1.0,
    flatShading: true
  });
  const pineLfMat = new THREE.MeshStandardMaterial({
    color: 0x1a6b3a,
    roughness: 0.9,
    flatShading: true
  });
  const oakLfMat = new THREE.MeshStandardMaterial({
    color: 0x2d8f4e,
    roughness: 0.9,
    flatShading: true
  });
  const birchLfMat = new THREE.MeshStandardMaterial({
    color: 0x5cb85c,
    roughness: 0.9,
    flatShading: true
  });
  treeMesh1 = new THREE.InstancedMesh(pineGeo, [woodMat, pineLfMat], 10000);
  treeMesh1.receiveShadow = true;
  treeMesh1.castShadow = true;
  treeMesh1.frustumCulled = false;
  scene.add(treeMesh1);
  treeMesh2 = new THREE.InstancedMesh(oakGeo, [woodMat, oakLfMat], 10000);
  treeMesh2.receiveShadow = true;
  treeMesh2.castShadow = true;
  treeMesh2.frustumCulled = false;
  scene.add(treeMesh2);
  treeMesh3 = new THREE.InstancedMesh(birchGeo, [birchWoodMat, birchLfMat], 10000);
  treeMesh3.receiveShadow = true;
  treeMesh3.castShadow = true;
  treeMesh3.frustumCulled = false;
  scene.add(treeMesh3);
  const rainCount = 3000;
  const rainGeo = new THREE.CylinderGeometry(0.006, 0.006, 1.2, 4);
  rainGeo.translate(0, 0.6, 0);
  const rainMat = new THREE.MeshBasicMaterial({
    color: 0xccddff,
    transparent: true,
    opacity: 0.0,
    depthWrite: false
  });
  rainInstancedMesh = new THREE.InstancedMesh(rainGeo, rainMat, rainCount);
  rainInstancedMesh.frustumCulled = false;
  for (let i = 0; i < rainCount; i++) {
    rainData.push({
      x: (Math.random() - 0.5) * 40,
      y: (Math.random() - 0.5) * 40,
      z: (Math.random() - 0.5) * 40,
      speed: 40 + Math.random() * 20
    });
    const mat = new THREE.Matrix4();
    mat.setPosition(rainData[i].x, rainData[i].y, rainData[i].z);
    rainInstancedMesh.setMatrixAt(i, mat);
  }
  scene.add(rainInstancedMesh);
  const rippleGeo = new THREE.RingGeometry(0.13, 0.15, 24);
  for (let i = 0; i < 50; i++) {
    const rippleMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.0,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    const ripple = new THREE.Mesh(rippleGeo, rippleMat);
    ripple.visible = false;
    scene.add(ripple);
    ripplePool.push({
      mesh: ripple,
      life: 0
    });
  }
  createStartLine();
  window.addEventListener('pointerdown', e => {
    if (gameState !== 'PLAYING') return;
    isDragging = true;
    lastX = e.clientX;
    lastY = e.clientY;
    accumulatedDx = 0;
    accumulatedDy = 0;
  });
  window.addEventListener('pointermove', e => {
    if (!isDragging || gameState !== 'PLAYING') return;
    accumulatedDx += e.clientX - lastX;
    accumulatedDy += e.clientY - lastY;
    lastX = e.clientX;
    lastY = e.clientY;
  });
  const stopDrag = () => {
    isDragging = false;
  };
  window.addEventListener('pointerup', stopDrag);
  window.addEventListener('pointercancel', stopDrag);
  window.addEventListener('pointerout', stopDrag);
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}
function updateSkinUI() {
  const skin = skins[currentSkinIndex];
  const nameEl = document.getElementById('skin-name');
  const playBtn = document.getElementById('play-btn');
  const unlockBtn = document.getElementById('unlock-btn');
  if (skin.unlocked) {
    nameEl.innerText = skin.name;
    {
      playBtn.style.display = 'block';
      playBtn.disabled = false;
      playBtn.style.opacity = '1';
      playBtn.style.pointerEvents = 'auto';
      playBtn.innerText = 'PLAY';
    }
    unlockBtn.style.display = 'none';
  } else {
    nameEl.innerText = "🔒 " + skin.name;
    playBtn.style.display = 'none';
    unlockBtn.style.display = 'block';
    unlockBtn.innerText = "🔓 UNLOCK - " + skin.price + " BITS";
  }
}
window.updateSkinUI = updateSkinUI;
function createClassicTexture() {
  const texCanvas = document.createElement('canvas');
  texCanvas.width = 512;
  texCanvas.height = 512;
  const ctx = texCanvas.getContext('2d');
  ctx.fillStyle = '#ecf0f1';
  ctx.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 6; i++) {
    let startX = i * (512 / 6);
    ctx.beginPath();
    ctx.moveTo(startX, 80);
    ctx.lineTo(startX + 512 / 6 * 0.6, 256);
    ctx.lineTo(startX, 432);
    ctx.lineTo(startX + 512 / 6 * 0.4, 432);
    ctx.lineTo(startX + 512 / 6, 256);
    ctx.lineTo(startX + 512 / 6 * 0.4, 80);
    ctx.closePath();
    ctx.fillStyle = i % 2 === 0 ? '#ffffff' : '#2c3e50';
    ctx.fill();
  }
  ctx.fillStyle = '#2ecc71';
  ctx.fillRect(0, 0, 512, 60);
  ctx.fillRect(0, 452, 512, 60);
  ctx.fillStyle = '#111111';
  ctx.fillRect(0, 60, 512, 20);
  ctx.fillRect(0, 432, 512, 20);
  const ballTexture = new THREE.CanvasTexture(texCanvas);
  ballTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();
  return ballTexture;
}
function createClassic2Texture() {
  const texCanvas = document.createElement('canvas');
  texCanvas.width = 512;
  texCanvas.height = 512;
  const ctx = texCanvas.getContext('2d');
  ctx.fillStyle = '#ff0055';
  ctx.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 6; i++) {
    let startX = i * (512 / 6);
    ctx.beginPath();
    ctx.moveTo(startX, 80);
    ctx.lineTo(startX + 512 / 6 * 0.6, 256);
    ctx.lineTo(startX, 432);
    ctx.lineTo(startX + 512 / 6 * 0.4, 432);
    ctx.lineTo(startX + 512 / 6, 256);
    ctx.lineTo(startX + 512 / 6 * 0.4, 80);
    ctx.closePath();
    ctx.fillStyle = i % 2 === 0 ? '#ffffff' : '#2d3436';
    ctx.fill();
  }
  ctx.fillStyle = '#222222';
  ctx.fillRect(0, 0, 512, 60);
  ctx.fillRect(0, 452, 512, 60);
  ctx.fillStyle = '#bdc3c7';
  ctx.fillRect(0, 60, 512, 20);
  ctx.fillRect(0, 432, 512, 20);
  const ballTexture = new THREE.CanvasTexture(texCanvas);
  ballTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();
  return ballTexture;
}
function createMissingTexture() {
  let canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  let ctx = canvas.getContext('2d');
  for (let y = 0; y < 256; y += 128) {
    for (let x = 0; x < 256; x += 128) {
      ctx.fillStyle = (x + y) % 256 === 0 ? '#ff00ff' : '#111111';
      ctx.fillRect(x, y, 128, 128);
    }
  }
  let tex = new THREE.CanvasTexture(canvas);
  tex.magFilter = THREE.NearestFilter;
  return tex;
}
function createDiceFace(num) {
  let canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  let ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, 256, 256);
  ctx.fillStyle = num === 1 || num === 4 ? '#e74c3c' : '#222222';
  const dot = (x, y) => {
    ctx.beginPath();
    ctx.arc(x, y, 25, 0, Math.PI * 2);
    ctx.fill();
  };
  if (num === 1) {
    dot(128, 128);
  }
  if (num === 2) {
    dot(64, 64);
    dot(192, 192);
  }
  if (num === 3) {
    dot(64, 64);
    dot(128, 128);
    dot(192, 192);
  }
  if (num === 4) {
    dot(64, 64);
    dot(192, 64);
    dot(64, 192);
    dot(192, 192);
  }
  if (num === 5) {
    dot(64, 64);
    dot(192, 64);
    dot(128, 128);
    dot(64, 192);
    dot(192, 192);
  }
  if (num === 6) {
    dot(64, 40);
    dot(192, 40);
    dot(64, 128);
    dot(192, 128);
    dot(64, 216);
    dot(192, 216);
  }
  ctx.lineWidth = 10;
  ctx.strokeStyle = '#dddddd';
  ctx.strokeRect(0, 0, 256, 256);
  let tex = new THREE.CanvasTexture(canvas);
  tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
  return new THREE.MeshStandardMaterial({
    map: tex,
    roughness: 0.1,
    metalness: 0.1
  });
}
function createCarbonTexture() {
  let canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  let ctx = canvas.getContext('2d');
  ctx.fillStyle = '#222';
  ctx.fillRect(0, 0, 256, 256);
  ctx.fillStyle = '#333';
  for (let y = 0; y < 256; y += 16) {
    for (let x = 0; x < 256; x += 16) {
      if ((x / 16 + y / 16) % 2 === 0) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + 16, y + 16);
        ctx.lineTo(x + 16, y + 8);
        ctx.lineTo(x + 8, y);
        ctx.fill();
      }
    }
  }
  let tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(4, 4);
  return tex;
}
function createWatermelonTexture() {
  let canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  let ctx = canvas.getContext('2d');
  ctx.fillStyle = '#0a3d14';
  ctx.fillRect(0, 0, 512, 512);
  ctx.fillStyle = '#2ecc71';
  ctx.shadowColor = '#2ecc71';
  ctx.shadowBlur = 15;
  const stripes = 8;
  const spacing = 512 / stripes;
  for (let i = 0; i < stripes; i++) {
    ctx.beginPath();
    let startX = i * spacing;
    ctx.moveTo(startX, 0);
    for (let y = 0; y <= 512; y += 20) {
      let noise = Math.sin(y * 0.03) * 12 + Math.cos(y * 0.07) * 5;
      ctx.lineTo(startX + noise, y);
    }
    ctx.lineTo(startX + 22, 512);
    for (let y = 512; y >= 0; y -= 20) {
      let noise = Math.sin(y * 0.03) * 12 + Math.cos(y * 0.07) * 5;
      ctx.lineTo(startX + 22 + noise, y);
    }
    ctx.fill();
  }
  ctx.shadowBlur = 0;
  let tex = new THREE.CanvasTexture(canvas);
  tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
  return tex;
}
function buildBallSkin(index) {
  if (ballMesh) {
    scene.remove(ballMesh);
    ballMesh.traverse(child => {
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (Array.isArray(child.material)) child.material.forEach(m => m.dispose());else child.material.dispose();
      }
    });
  }
  skinParticles.forEach(p => scene.remove(p));
  skinParticles = [];
  const type = skins[index].type;
  const group = new THREE.Group();
  if (type === "classic") {
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(0.8, 32, 32), new THREE.MeshStandardMaterial({
      map: createClassicTexture(),
      roughness: 0.2,
      metalness: 0.1
    }));
    mesh.rotation.z = Math.PI / 2;
    mesh.castShadow = true;
    group.add(mesh);
  } else if (type === "classic2") {
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(0.8, 32, 32), new THREE.MeshStandardMaterial({
      map: createClassic2Texture(),
      roughness: 0.2,
      metalness: 0.1
    }));
    mesh.rotation.z = Math.PI / 2;
    mesh.castShadow = true;
    group.add(mesh);
  } else if (type === "soccer") {
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(0.8, 64, 64), new THREE.MeshStandardMaterial({
      map: createSoccerTexture(),
      roughness: 0.6,
      metalness: 0.1
    }));
    mesh.rotation.z = Math.PI / 2;
    mesh.castShadow = true;
    group.add(mesh);
  } else if (type === "champion") {
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(0.8, 64, 64), new THREE.MeshStandardMaterial({
      map: createChampionTexture(),
      roughness: 0.5,
      metalness: 0.2
    }));
    mesh.rotation.z = Math.PI / 2;
    mesh.castShadow = true;
    group.add(mesh);
  } else if (type === "baseball") {
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(0.8, 64, 64), new THREE.MeshStandardMaterial({
      map: createBaseballTexture(),
      roughness: 0.8,
      metalness: 0.0
    }));
    mesh.rotation.set(Math.PI / 2, Math.PI / 2, 0);
    mesh.castShadow = true;
    group.add(mesh);
  } else if (type === "apex") {
    const core = new THREE.Mesh(new THREE.SphereGeometry(0.72, 32, 32), new THREE.MeshStandardMaterial({
      color: 0x111111,
      roughness: 0.8
    }));
    const rimMat = new THREE.MeshStandardMaterial({
      color: 0xeeeeee,
      metalness: 0.9,
      roughness: 0.1
    });
    const neonMat = new THREE.MeshBasicMaterial({
      color: 0xff6600
    });
    const rim1 = new THREE.Mesh(new THREE.TorusGeometry(0.73, 0.08, 16, 64), rimMat);
    rim1.rotation.y = Math.PI / 2;
    rim1.position.x = 0.35;
    rim1.castShadow = true;
    const rim2 = new THREE.Mesh(new THREE.TorusGeometry(0.73, 0.08, 16, 64), rimMat);
    rim2.rotation.y = Math.PI / 2;
    rim2.position.x = -0.35;
    rim2.castShadow = true;
    const hub1 = new THREE.Mesh(new THREE.SphereGeometry(0.76, 32, 16, 0, Math.PI * 2, 0, Math.PI / 3.5), rimMat);
    hub1.rotation.z = -Math.PI / 2;
    const hub2 = new THREE.Mesh(new THREE.SphereGeometry(0.76, 32, 16, 0, Math.PI * 2, 0, Math.PI / 3.5), rimMat);
    hub2.rotation.z = Math.PI / 2;
    const neonGroup = new THREE.Group();
    const chevGroup = new THREE.Group();
    const boxGeoChev = new THREE.BoxGeometry(0.04, 0.2, 0.04);
    const leftPart = new THREE.Mesh(boxGeoChev, neonMat);
    leftPart.rotation.z = Math.PI / 4;
    leftPart.position.set(-0.07, 0, 0);
    const rightPart = new THREE.Mesh(boxGeoChev, neonMat);
    rightPart.rotation.z = -Math.PI / 4;
    rightPart.position.set(0.07, 0, 0);
    chevGroup.add(leftPart, rightPart);
    for (let i = 0; i < 8; i++) {
      let arrow = chevGroup.clone();
      let angle = i / 8 * Math.PI * 2;
      arrow.position.set(0, Math.cos(angle) * 0.74, Math.sin(angle) * 0.74);
      arrow.rotation.x = -angle;
      neonGroup.add(arrow);
    }
    core.castShadow = true;
    group.add(core, rim1, rim2, hub1, hub2, neonGroup);
  } else if (type === "carbongold") {
    const carbon = new THREE.Mesh(new THREE.SphereGeometry(0.79, 32, 32), new THREE.MeshStandardMaterial({
      map: createCarbonTexture(),
      roughness: 0.8,
      metalness: 0.5
    }));
    const goldWire = new THREE.Mesh(new THREE.IcosahedronGeometry(0.81, 2), new THREE.MeshStandardMaterial({
      color: 0xffd700,
      metalness: 1.0,
      roughness: 0.1,
      wireframe: true
    }));
    carbon.castShadow = true;
    group.add(carbon, goldWire);
  } else if (type === "bomb") {
    const bomb = new THREE.Mesh(new THREE.SphereGeometry(0.8, 32, 32), new THREE.MeshStandardMaterial({
      color: 0x111111,
      roughness: 0.2,
      metalness: 0.8
    }));
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.2, 0.2, 16), new THREE.MeshStandardMaterial({
      color: 0x555555
    }));
    cap.position.y = 0.85;
    const wire = new THREE.Mesh(new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(new THREE.Vector3(0, 0.95, 0), new THREE.Vector3(0.2, 1.2, 0), new THREE.Vector3(0.4, 1.0, 0)), 10, 0.03, 8, false), new THREE.MeshStandardMaterial({
      color: 0x8b4513
    }));
    const sparks = new THREE.Group();
    const sparkGeo = new THREE.ConeGeometry(0.05, 0.2, 4);
    const sparkMat = new THREE.MeshBasicMaterial({
      color: 0xffdd00
    });
    for (let i = 0; i < 8; i++) {
      let sp = new THREE.Mesh(sparkGeo, sparkMat);
      sp.position.set((Math.random() - 0.5) * 0.2, (Math.random() - 0.5) * 0.2, (Math.random() - 0.5) * 0.2);
      sp.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
      sparks.add(sp);
    }
    sparks.position.set(0.4, 1.0, 0);
    bomb.castShadow = true;
    group.add(bomb, cap, wire, sparks);
    group.userData.isBomb = true;
    group.userData.sparks = sparks;
  } else if (type === "quantum") {
    const cage = new THREE.Mesh(new THREE.IcosahedronGeometry(0.79, 1), new THREE.MeshStandardMaterial({
      color: 0xbdc3c7,
      metalness: 0.9,
      roughness: 0.1,
      wireframe: true
    }));
    const core = new THREE.Mesh(new THREE.SphereGeometry(0.45, 32, 32), new THREE.MeshBasicMaterial({
      color: 0xff0022
    }));
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xffd700
    });
    const r1 = new THREE.Mesh(new THREE.TorusGeometry(0.60, 0.02, 16, 64), ringMat);
    const r2 = new THREE.Mesh(new THREE.TorusGeometry(0.65, 0.02, 16, 64), ringMat);
    const r3 = new THREE.Mesh(new THREE.TorusGeometry(0.70, 0.02, 16, 64), ringMat);
    const invisibleShell = new THREE.Mesh(new THREE.SphereGeometry(0.8, 16, 16), new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0,
      depthWrite: false
    }));
    invisibleShell.castShadow = true;
    group.add(invisibleShell, cage, core, r1, r2, r3);
    group.userData.isQuantum = true;
    group.userData.core = core;
    group.userData.rings = [r1, r2, r3];
  } else if (type === "watermelon") {
    const melon = new THREE.Mesh(new THREE.SphereGeometry(0.8, 32, 32), new THREE.MeshStandardMaterial({
      map: createWatermelonTexture(),
      roughness: 0.8,
      metalness: 0.0
    }));
    const stem = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.02, 8, 16, Math.PI), new THREE.MeshStandardMaterial({
      color: 0x145a32
    }));
    stem.position.y = 0.8;
    stem.rotation.x = Math.PI / 2;
    stem.rotation.y = 0.5;
    melon.castShadow = true;
    group.add(melon, stem);
  } else if (type === "eyeball") {
    const eyeGroup = new THREE.Group();
    const texCanvas = document.createElement('canvas');
    texCanvas.width = 512;
    texCanvas.height = 512;
    const ctx = texCanvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 512, 512);
    ctx.strokeStyle = 'rgba(200, 0, 0, 0.6)';
    ctx.lineWidth = 4;
    for (let i = 0; i < 40; i++) {
      ctx.beginPath();
      ctx.moveTo(256, 256);
      let endX = 256 + Math.cos(i * 0.15) * 400 + (Math.random() - 0.5) * 100;
      let endY = 256 + Math.sin(i * 0.15) * 400 + (Math.random() - 0.5) * 100;
      ctx.quadraticCurveTo(256 + Math.cos(i * 0.15) * 150, 256 + Math.sin(i * 0.15) * 150, endX, endY);
      ctx.stroke();
    }
    const ballTexture = new THREE.CanvasTexture(texCanvas);
    const sclera = new THREE.Mesh(new THREE.SphereGeometry(0.78, 32, 32), new THREE.MeshStandardMaterial({
      map: ballTexture,
      roughness: 0.1
    }));
    const iris = new THREE.Mesh(new THREE.SphereGeometry(0.79, 32, 16, 0, Math.PI * 2, 0, Math.PI / 4.5), new THREE.MeshStandardMaterial({
      color: 0x00cec9,
      roughness: 0.1
    }));
    iris.rotation.x = Math.PI / 2;
    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.80, 32, 16, 0, Math.PI * 2, 0, Math.PI / 9), new THREE.MeshStandardMaterial({
      color: 0x000000,
      roughness: 0.1
    }));
    pupil.rotation.x = Math.PI / 2;
    const highlight = new THREE.Mesh(new THREE.SphereGeometry(0.81, 16, 8, 0, Math.PI * 2, 0, Math.PI / 24), new THREE.MeshBasicMaterial({
      color: 0xffffff
    }));
    highlight.rotation.x = Math.PI / 2 - 0.15;
    highlight.rotation.y = 0.15;
    sclera.castShadow = true;
    sclera.receiveShadow = true;
    iris.castShadow = true;
    iris.receiveShadow = true;
    pupil.castShadow = true;
    pupil.receiveShadow = true;
    eyeGroup.add(sclera, iris, pupil, highlight);
    group.add(eyeGroup);
  } else if (type === "donut") {
    const doughGeo = new THREE.TorusGeometry(0.5, 0.3, 32, 32);
    const dough = new THREE.Mesh(doughGeo, new THREE.MeshStandardMaterial({
      color: 0xeebb99,
      roughness: 0.6
    }));
    const icingGeo = new THREE.TorusGeometry(0.5, 0.32, 32, 32);
    const pos = icingGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      let x = pos.getX(i),
        y = pos.getY(i),
        z = pos.getZ(i);
      if (z < 0) {
        pos.setZ(i, 0);
      } else {
        let angle = Math.atan2(y, x);
        let drip = Math.sin(angle * 12) * 0.04 + Math.cos(angle * 7) * 0.02;
        pos.setZ(i, z + drip);
      }
    }
    icingGeo.computeVertexNormals();
    const icing = new THREE.Mesh(icingGeo, new THREE.MeshStandardMaterial({
      color: 0xff69b4,
      roughness: 0.1,
      metalness: 0.1
    }));
    icing.position.z = 0.01;
    dough.castShadow = true;
    dough.receiveShadow = true;
    icing.castShadow = true;
    icing.receiveShadow = true;
    group.add(dough, icing);
    const sprinkleGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.08);
    const colors = [0xffffff, 0x00ffff, 0xffff00, 0xff0000];
    for (let i = 0; i < 120; i++) {
      let a = Math.random() * Math.PI * 2;
      let r = 0.5 + (Math.random() - 0.5) * 0.28;
      let sp = new THREE.Mesh(sprinkleGeo, new THREE.MeshBasicMaterial({
        color: colors[Math.floor(Math.random() * colors.length)]
      }));
      sp.position.set(Math.cos(a) * r, Math.sin(a) * r, 0.32 + Math.random() * 0.04);
      sp.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
      sp.castShadow = true;
      group.add(sp);
    }
    group.rotation.y = Math.PI / 2;
  } else if (type === "spiky") {
    const coreGeo = new THREE.SphereGeometry(0.55, 32, 32);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x111111,
      roughness: 0.8
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    coreMesh.castShadow = true;
    group.add(coreMesh);
    const spikeGeo = new THREE.ConeGeometry(0.12, 0.4, 8);
    spikeGeo.translate(0, 0.2, 0);
    const spikeMat = new THREE.MeshStandardMaterial({
      color: 0x00ff00,
      emissive: 0x003300
    });
    const samples = 14;
    const offset = 2 / samples;
    const increment = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < samples; i++) {
      let y = i * offset - 1 + offset / 2;
      let r = Math.sqrt(1 - Math.pow(y, 2));
      let phi = (i + 1) % samples * increment;
      let vec = new THREE.Vector3(Math.cos(phi) * r, y, Math.sin(phi) * r).normalize();
      let spike = new THREE.Mesh(spikeGeo, spikeMat);
      spike.position.copy(vec.clone().multiplyScalar(0.5));
      spike.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), vec);
      spike.castShadow = true;
      group.add(spike);
    }
  } else if (type === "disco") {
    const geo = new THREE.IcosahedronGeometry(0.8, 2);
    const mat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 1.0,
      roughness: 0.1,
      flatShading: true
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.castShadow = true;
    group.add(mesh);
  } else if (type === "ufo") {
    const centerMesh = new THREE.Mesh(new THREE.SphereGeometry(0.45, 16, 16), new THREE.MeshStandardMaterial({
      color: 0xff0000,
      emissive: 0xff0000,
      emissiveIntensity: 1.5
    }));
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0xbdc3c7,
      metalness: 0.8,
      roughness: 0.2
    });
    const ring1 = new THREE.Mesh(new THREE.TorusGeometry(0.7, 0.06, 8, 32), ringMat);
    const ring2 = new THREE.Mesh(new THREE.TorusGeometry(0.9, 0.06, 8, 32), ringMat);
    ring1.castShadow = true;
    ring2.castShadow = true;
    ring2.rotation.x = Math.PI / 2;
    group.add(centerMesh, ring1, ring2);
    group.userData.isUFO = true;
    group.userData.ring1 = ring1;
    group.userData.ring2 = ring2;
    group.userData.keepUpright = true;
  } else if (type === "dice") {
    const boxGeo = new THREE.BoxGeometry(1.15, 1.15, 1.15);
    const diceMats = [createDiceFace(1), createDiceFace(6), createDiceFace(2), createDiceFace(5), createDiceFace(3), createDiceFace(4)];
    const boxMesh = new THREE.Mesh(boxGeo, diceMats);
    boxMesh.castShadow = true;
    group.add(boxMesh);
  } else if (type === "d20") {
    const d20Geo = new THREE.IcosahedronGeometry(0.85, 0);
    const d20Mat = new THREE.MeshStandardMaterial({
      color: 0x8e44ad,
      roughness: 0.2,
      metalness: 0.5
    });
    const d20Mesh = new THREE.Mesh(d20Geo, d20Mat);
    d20Mesh.castShadow = true;
    const d20Edges = new THREE.EdgesGeometry(d20Geo);
    const d20EdgesMat = new THREE.LineBasicMaterial({
      color: 0xff00ff,
      linewidth: 2
    });
    const d20Wire = new THREE.LineSegments(d20Edges, d20EdgesMat);
    group.add(d20Mesh, d20Wire);
  } else if (type === "slime") {
    const slimeGeo = new THREE.IcosahedronGeometry(0.75, 16);
    slimeGeo.userData = {
      origPos: slimeGeo.attributes.position.clone()
    };
    const slime = new THREE.Mesh(slimeGeo, new THREE.MeshStandardMaterial({
      color: 0x00ff00,
      emissive: 0x005500,
      roughness: 0.2
    }));
    slime.castShadow = true;
    const bubbles = new THREE.Mesh(new THREE.IcosahedronGeometry(0.78, 2), new THREE.MeshPhysicalMaterial({
      color: 0x55ff55,
      transmission: 0.9,
      transparent: true,
      opacity: 0.6,
      roughness: 0.0
    }));
    group.add(slime, bubbles);
    group.userData.isSlime = true;
    group.userData.slimeGeo = slimeGeo;
  } else if (type === "glitch") {
    const glitchGeo = new THREE.SphereGeometry(0.78, 32, 32);
    const mainMat = new THREE.MeshStandardMaterial({
      map: createMissingTexture(),
      roughness: 0.4
    });
    const core = new THREE.Mesh(glitchGeo, mainMat);
    core.castShadow = true;
    const ghostCyan = new THREE.Mesh(glitchGeo, new THREE.MeshBasicMaterial({
      color: 0x00ffff,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending
    }));
    const ghostMagenta = new THREE.Mesh(glitchGeo, new THREE.MeshBasicMaterial({
      color: 0xff00ff,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending
    }));
    group.add(core, ghostCyan, ghostMagenta);
    group.userData.isGlitch = true;
    group.userData.core = core;
    group.userData.cyan = ghostCyan;
    group.userData.magenta = ghostMagenta;
  }
  ballMesh = group;
  scene.add(ballMesh);
}
window.nextSkin = () => {
  currentSkinIndex = (currentSkinIndex + 1) % skins.length;
  buildBallSkin(currentSkinIndex);
  updateSkinUI();
};
window.prevSkin = () => {
  currentSkinIndex = (currentSkinIndex - 1 + skins.length) % skins.length;
  buildBallSkin(currentSkinIndex);
  updateSkinUI();
};
window.startGame = () => {
  if (!isAudioInitialized) {
    initAudio();
  } else if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  window.loadLevel(currentLevelIndex);
  document.getElementById('intro-overlay').style.display = 'none';
  document.getElementById('top-ui').style.display = 'flex';
  document.getElementById('in-game-controls').style.display = 'flex';
  ballMesh.rotation.set(0, 0, 0);
  currentYaw = 0;
  rollAngle = 0;
  if (skins[currentSkinIndex].type === "eyeball" && ballMesh.children[0]) {
    ballMesh.children[0].rotation.y = 0;
  }
  if (skins[currentSkinIndex].type === "baseball" && ballMesh.children[0]) {
    ballMesh.children[0].rotation.set(Math.PI / 2, Math.PI / 2, 0);
  }
  lastFrameTime = performance.now();
  gameState = 'PLAYING';
};
window.loadLevel = levelIndex => {
  document.getElementById('top-ui').style.display = 'flex';
  document.getElementById('in-game-controls').style.display = 'flex';
  document.getElementById('intro-overlay').style.display = 'none';
  document.getElementById('pause-overlay').style.display = 'none';
  document.getElementById('confirm-end-overlay').style.display = 'none';
  activeChunks.forEach(chunk => {
    if (chunk.mesh) {
      scene.remove(chunk.mesh);
      chunk.mesh.traverse(c => {
        if (c.geometry) c.geometry.dispose();
      });
    }
    if (chunk.body) world.removeBody(chunk.body);
    if (chunk.mesh && chunk.mesh.userData && chunk.mesh.userData.physicsBodies) chunk.mesh.userData.physicsBodies.forEach(b => world.removeBody(b));
  });
  activeChunks.length = 0;
  ropeZones.length = 0;
  dynamicObjects.forEach(obj => {
    if (obj.group) scene.remove(obj.group);
    if (obj.body) world.removeBody(obj.body);
    if (obj.staticBody) world.removeBody(obj.staticBody);
    if (obj.rotatingBody) world.removeBody(obj.rotatingBody);
    if (obj.projectiles) obj.projectiles.forEach(p => {
      scene.remove(p.mesh);
      world.removeBody(p.body);
    });
    if (obj.type === 'piston') pistonPool.push(obj);else if (obj.type === 'fan') fanPool.push(obj);else if (obj.type === 'elevator') elevatorPool.push(obj);else if (obj.type === 'poles15_downhill') polesPool.push(obj);else if (obj.type === 'windmill') windmillPool.push(obj);else if (obj.type === 'buzzsaw') buzzsawPool.push(obj);else if (obj.type === 'sweeper') sweeperPool.push(obj);else if (obj.type === 'crumbling_path') {
      if (obj.slabs) obj.slabs.forEach(s => {
        if (s.state < 2 && s.body) world.removeBody(s.body);
      });
      crumblingPool.push(obj);
    }
  });
  dynamicObjects.length = 0;
  checkpoints.forEach(cp => {
    cp.meshes.forEach(m => {
      scene.remove(m);
      if (m.geometry) m.geometry.dispose();
    });
    if (cp.gemMesh) {
      scene.remove(cp.gemMesh);
      if (cp.gemMesh.geometry) cp.gemMesh.geometry.dispose();
    }
    if (cp.gemRing) {
      scene.remove(cp.gemRing);
      if (cp.gemRing.geometry) cp.gemRing.geometry.dispose();
    }
    if (cp.archGroup) {
      scene.remove(cp.archGroup);
      cp.archGroup.traverse(c => {
        if (c.geometry) c.geometry.dispose();
      });
    }
  });
  checkpoints.length = 0;
  fireworks.forEach(fw => {
    scene.remove(fw);
    fw.geometry.dispose();
    fw.material.dispose();
  });
  fireworks.length = 0;
  globalX = 0;
  globalY = 0;
  globalZ = 15;
  gameTime = 0;
  internalWaveCounter = 1;
  finalStars = 0;
  let accumulatedEnvTime = 0;
  for (let lv = 1; lv < levelIndex; lv++) {
    accumulatedEnvTime += calculateExactLevelTime(lv);
  }
  environmentTime = accumulatedEnvTime;
  let currentSequence = getDeterministicSequence(levelIndex);
  let nextSequence = getDeterministicSequence(levelIndex + 1);
  spawnModule(0, levelIndex);
  spawnModule(0, levelIndex);
  for (let i = 0; i < currentSequence.length; i++) {
    spawnModule(currentSequence[i], levelIndex);
    spawnModule(0, levelIndex);
  }
  let exactDistanceZ = globalZ;
  spawnModule(99, levelIndex);
  spawnModule(0, levelIndex + 1);
  spawnModule(0, levelIndex + 1);
  let illusionCount = Math.min(5, nextSequence.length);
  for (let i = 0; i < illusionCount; i++) {
    spawnModule(nextSequence[i], levelIndex + 1);
    spawnModule(0, levelIndex + 1);
  }
  lastGroundedY = 5.0;
  let totalDistance = 15 - exactDistanceZ;
  let levelBonusTime = 2.0 + (levelIndex - 1) * 0.5;
  let time3StarTarget = totalDistance / 15.0 + levelBonusTime;
  levelTimeLimit = time3StarTarget / 0.65;
  starThresholds.star3 = levelTimeLimit * 0.65;
  starThresholds.star2 = levelTimeLimit * 0.82;
  timeLeft = levelTimeLimit;
  ballBody.position.set(0, 5, 5);
  ballBody.velocity.set(0, 0, 0);
  ballBody.angularVelocity.set(0, 0, 0);
  ballBody.sleep();
  ballBody.wakeUp();
  previousBallPos.copy(ballBody.position);
  currentYaw = 0;
  rollAngle = 0;
  accumulatedDx = 0;
  accumulatedDy = 0;
  if (ballMesh) {
    ballMesh.position.copy(ballBody.position);
    ballMesh.rotation.set(0, 0, 0);
  }
  updateUI();
  gameState = 'PLAYING';
  lastFrameTime = performance.now();
};
window.pauseGame = () => {
  if (gameState !== 'PLAYING') return;
  gameState = 'PAUSED';
  document.getElementById('pause-overlay').style.display = 'flex';
};
window.resumeGame = () => {
  gameState = 'PLAYING';
  lastFrameTime = performance.now();
  document.getElementById('pause-overlay').style.display = 'none';
};
window.askEndGame = () => {
  if (gameState !== 'PLAYING' && gameState !== 'PAUSED') return;
  window.previousState = gameState;
  gameState = 'CONFIRM_END';
  document.getElementById('confirm-end-overlay').style.display = 'flex';
};
window.cancelEndGame = () => {
  gameState = window.previousState || 'PLAYING';
  if (gameState === 'PLAYING') lastFrameTime = performance.now();
  document.getElementById('confirm-end-overlay').style.display = 'none';
};
window.forceEndGame = () => {
  document.getElementById('confirm-end-overlay').style.display = 'none';
  document.getElementById('top-ui').style.display = 'none';
  document.getElementById('in-game-controls').style.display = 'none';
  document.getElementById('intro-overlay').style.display = 'block';
  gameState = 'INTRO';
  updateSkinUI();
};
window.restartGame = () => {
  document.getElementById('top-ui').style.display = 'none';
  document.getElementById('in-game-controls').style.display = 'none';
  document.getElementById('intro-overlay').style.display = 'block';
  for (let i = activeChunks.length - 1; i >= 0; i--) {
    let chunk = activeChunks[i];
    if (chunk.mesh) {
      scene.remove(chunk.mesh);
      chunk.mesh.traverse(child => {
        if (child.geometry) child.geometry.dispose();
      });
    }
    if (chunk.body) world.removeBody(chunk.body);
    if (chunk.mesh && chunk.mesh.userData && chunk.mesh.userData.physicsBodies) {
      chunk.mesh.userData.physicsBodies.forEach(b => world.removeBody(b));
    }
  }
  activeChunks.length = 0;
  ropeZones.length = 0;
  for (let i = dynamicObjects.length - 1; i >= 0; i--) {
    let obj = dynamicObjects[i];
    if (obj.group) scene.remove(obj.group);
    if (obj.body) world.removeBody(obj.body);
    if (obj.staticBody) world.removeBody(obj.staticBody);
    if (obj.rotatingBody) world.removeBody(obj.rotatingBody);
    if (obj.projectiles) {
      obj.projectiles.forEach(p => {
        scene.remove(p.mesh);
        world.removeBody(p.body);
      });
    }
    if (obj.type === 'piston') pistonPool.push(obj);else if (obj.type === 'fan') fanPool.push(obj);else if (obj.type === 'elevator') elevatorPool.push(obj);else if (obj.type === 'poles15_downhill') polesPool.push(obj);else if (obj.type === 'windmill') windmillPool.push(obj);else if (obj.type === 'buzzsaw') buzzsawPool.push(obj);else if (obj.type === 'sweeper') sweeperPool.push(obj);else if (obj.type === 'crumbling_path') {
      if (obj.slabs) {
        obj.slabs.forEach(s => {
          if (s.state < 2 && s.body) world.removeBody(s.body);
        });
      }
      crumblingPool.push(obj);
    }
  }
  dynamicObjects.length = 0;
  for (let i = checkpoints.length - 1; i >= 0; i--) {
    let cp = checkpoints[i];
    cp.meshes.forEach(m => {
      scene.remove(m);
      if (m.geometry) m.geometry.dispose();
    });
    if (cp.gemMesh) {
      scene.remove(cp.gemMesh);
      if (cp.gemMesh.geometry) cp.gemMesh.geometry.dispose();
    }
  }
  checkpoints.length = 0;
  globalX = 0;
  globalY = 0;
  globalZ = 15;
  safeRespawnPos.set(0, 5, 5);
  scoreDistance = 0;
  lives = 3;
  internalWaveCounter = 1;
  difficultyMultiplier = 1.0;
  challengesCount = 0;
  isNextConnector = false;
  pendingDownhill = false;
  waveCounterToAssign = 2;
  pendingWaveDistance = 0;
  pendingWaveTimeBuffer = 5.0;
  environmentTime = 0;
  spawnModule(0);
  spawnModule(0);
  spawnModule(0);
  while (checkpoints.length === 0) {
    spawnModule(-1);
  }
  if (checkpoints.length > 0) {
    timeLeft = checkpoints[0].allocatedTime;
    currentWaveMaxTime = timeLeft;
  }
  ballBody.position.set(0, 5, 5);
  ballBody.velocity.set(0, 0, 0);
  ballBody.angularVelocity.set(0, 0, 0);
  ballBody.force.set(0, 0, 0);
  ballBody.torque.set(0, 0, 0);
  if (ballBody.vlambda) ballBody.vlambda.set(0, 0, 0);
  if (ballBody.wlambda) ballBody.wlambda.set(0, 0, 0);
  ballBody.sleep();
  ballBody.wakeUp();
  previousBallPos.copy(ballBody.position);
  currentYaw = 0;
  rollAngle = 0;
  introSpinAngle = 0;
  accumulatedDx = 0;
  accumulatedDy = 0;
  gameTime = 0;
  if (ballMesh) {
    ballMesh.position.copy(ballBody.position);
    ballMesh.rotation.set(0, 0, 0);
    if (skins[currentSkinIndex].type === "eyeball" && ballMesh.children[0]) {
      ballMesh.children[0].rotation.y = 0;
    }
    if (skins[currentSkinIndex].type === "baseball" && ballMesh.children[0]) {
      ballMesh.children[0].rotation.set(Math.PI / 2, Math.PI / 2, 0);
    }
  }
  updateUI();
  gameState = 'INTRO';
  lastFrameTime = performance.now();
};
function createStartLine() {
  const startCanvas = document.createElement('canvas');
  startCanvas.width = 256;
  startCanvas.height = 256;
  const sCtx = startCanvas.getContext('2d');
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      sCtx.fillStyle = (i + j) % 2 === 0 ? '#ffffff' : '#bdc3c7';
      sCtx.fillRect(i * 64, j * 64, 64, 64);
    }
  }
  const startTex = new THREE.CanvasTexture(startCanvas);
  startTex.wrapS = THREE.RepeatWrapping;
  startTex.wrapT = THREE.RepeatWrapping;
  startTex.repeat.set(3, 2.5);
  startTex.minFilter = THREE.NearestFilter;
  startTex.magFilter = THREE.NearestFilter;
  const pMat = new THREE.MeshStandardMaterial({
    map: startTex,
    roughness: 0.8
  });
  const pGeo = new THREE.PlaneGeometry(12, 10);
  const pMesh = new THREE.Mesh(pGeo, pMat);
  pMesh.rotation.x = -Math.PI / 2;
  pMesh.position.set(0, 0.05, 10);
  scene.add(pMesh);
  function createPillar(px, pz) {
    const pg = new THREE.BoxGeometry(1.5, 8, 1.5);
    const pm = new THREE.MeshStandardMaterial({
      color: 0xecf0f1,
      roughness: 0.3,
      metalness: 0.5
    });
    const pM = new THREE.Mesh(pg, pm);
    pM.position.set(px, 4, pz);
    pM.castShadow = true;
    scene.add(pM);
    const gg = new THREE.BoxGeometry(1.6, 0.6, 1.6);
    const gm = new THREE.MeshStandardMaterial({
      color: 0xff0055,
      emissive: 0xff0055,
      emissiveIntensity: 1.0
    });
    const gM = new THREE.Mesh(gg, gm);
    gM.position.set(px, 6, pz);
    scene.add(gM);
  }
  createPillar(-4.5, 10);
  createPillar(4.5, 10);
}
function createTrackSegment(waypoints, widths, segments, options = {}) {
  const curve = new THREE.CatmullRomCurve3(waypoints);
  const visVertices = [];
  const visIndices = [];
  const visUvs = [];
  const physVertices = [];
  const physIndices = [];
  const wallH = options.wallHeight !== undefined ? options.wallHeight : 0.02;
  const curbWidth = 0.3;
  const depth = 2.0;
  const bankAngles = options.bankAngles || new Array(widths.length).fill(0);
  const uScaleX = options.uvScaleX || 1.0;
  const uMap = [0, 0, 0, 0, uScaleX, uScaleX, uScaleX, uScaleX];
  const totalLength = curve.getLength();
  const flatDist = 4.0;
  const taperDist = 3.0;
  for (let i = 0; i <= segments; i++) {
    const tSegment = i / segments;
    const pt = curve.getPoint(tSegment);
    const tangent = curve.getTangent(tSegment).normalize();
    const wIdxFloat = tSegment * (widths.length - 1);
    const wIdx = Math.floor(wIdxFloat);
    const wFrac = wIdxFloat - wIdx;
    const trackWidth = widths[wIdx] * (1 - wFrac) + widths[Math.min(wIdx + 1, widths.length - 1)] * wFrac;
    const halfW = trackWidth / 2;
    const currentBank = bankAngles[wIdx] * (1 - wFrac) + bankAngles[Math.min(wIdx + 1, bankAngles.length - 1)] * wFrac;
    const normal = new THREE.Vector3(0, 1, 0).applyAxisAngle(tangent, currentBank);
    const right = new THREE.Vector3().crossVectors(tangent, normal).normalize();
    let currentWallH = wallH;
    if (wallH > 0) {
      let d = tSegment * totalLength;
      if (d < flatDist) {
        currentWallH = 0;
      } else if (d < flatDist + taperDist) {
        currentWallH = wallH * ((d - flatDist) / taperDist);
      } else if (totalLength - d < flatDist) {
        currentWallH = 0;
      } else if (totalLength - d < flatDist + taperDist) {
        currentWallH = wallH * ((totalLength - d - flatDist) / taperDist);
      }
    }
    const visCross = [pt.clone().add(right.clone().multiplyScalar(-halfW - curbWidth)).add(normal.clone().multiplyScalar(-depth)), pt.clone().add(right.clone().multiplyScalar(-halfW - curbWidth)).add(normal.clone().multiplyScalar(currentWallH)), pt.clone().add(right.clone().multiplyScalar(-halfW)).add(normal.clone().multiplyScalar(currentWallH)), pt.clone().add(right.clone().multiplyScalar(-halfW)).add(normal.clone().multiplyScalar(0)), pt.clone().add(right.clone().multiplyScalar(halfW)).add(normal.clone().multiplyScalar(0)), pt.clone().add(right.clone().multiplyScalar(halfW)).add(normal.clone().multiplyScalar(currentWallH)), pt.clone().add(right.clone().multiplyScalar(halfW + curbWidth)).add(normal.clone().multiplyScalar(currentWallH)), pt.clone().add(right.clone().multiplyScalar(halfW + curbWidth)).add(normal.clone().multiplyScalar(-depth))];
    for (let j = 0; j < 8; j++) {
      visVertices.push(visCross[j].x, visCross[j].y, visCross[j].z);
      visUvs.push(uMap[j], tSegment * (totalLength / 10));
    }
    const wPhys = currentWallH > 0.1 ? currentWallH : 0;
    const physCross = [pt.clone().add(right.clone().multiplyScalar(-halfW)).add(normal.clone().multiplyScalar(wPhys)), pt.clone().add(right.clone().multiplyScalar(-halfW)).add(normal.clone().multiplyScalar(0)), pt.clone().add(right.clone().multiplyScalar(halfW)).add(normal.clone().multiplyScalar(0)), pt.clone().add(right.clone().multiplyScalar(halfW)).add(normal.clone().multiplyScalar(wPhys))];
    for (let j = 0; j < 4; j++) physVertices.push(physCross[j].x, physCross[j].y, physCross[j].z);
  }
  const visGeo = new THREE.BufferGeometry();
  for (let i = 0; i < segments; i++) {
    for (let j = 0; j < 8; j++) {
      const nextJ = (j + 1) % 8;
      visIndices.push(i * 8 + j, i * 8 + nextJ, (i + 1) * 8 + j);
      visIndices.push((i + 1) * 8 + j, i * 8 + nextJ, (i + 1) * 8 + nextJ);
      let matIndex = 1;
      if (j === 3) matIndex = 0;else if (j === 7 || j === 0) matIndex = 2;
      visGeo.addGroup(visIndices.length - 6, 6, matIndex);
    }
  }
  if (options.capStart) {
    let capStartIdx = visIndices.length;
    visIndices.push(0, 7, 4, 0, 4, 3, 7, 6, 5, 7, 5, 4, 0, 3, 2, 0, 2, 1);
    visGeo.addGroup(capStartIdx, 18, 1);
  }
  if (options.capEnd) {
    let L = segments * 8;
    let backStartIdx = visIndices.length;
    visIndices.push(L + 0, L + 3, L + 4, L + 0, L + 4, L + 7, L + 7, L + 4, L + 5, L + 7, L + 5, L + 6, L + 0, L + 1, L + 2, L + 0, L + 2, L + 3);
    visGeo.addGroup(backStartIdx, 18, 1);
  }
  visGeo.setAttribute('position', new THREE.Float32BufferAttribute(visVertices, 3));
  visGeo.setAttribute('uv', new THREE.Float32BufferAttribute(visUvs, 2));
  visGeo.setIndex(visIndices);
  visGeo.computeVertexNormals();
  const mesh = new THREE.Mesh(visGeo, trackMaterials);
  mesh.receiveShadow = true;
  scene.add(mesh);
  for (let i = 0; i < segments; i++) {
    for (let j = 0; j < 3; j++) {
      visIndices.push(i * 8 + j);
      const nextJ = j + 1;
      physIndices.push(i * 4 + j, i * 4 + nextJ, (i + 1) * 4 + j);
      physIndices.push((i + 1) * 4 + j, i * 4 + nextJ, (i + 1) * 4 + nextJ);
    }
  }
  const trimesh = new CANNON.Trimesh(physVertices, physIndices);
  const body = new CANNON.Body({
    mass: 0,
    material: defaultMat
  });
  body.addShape(trimesh);
  world.addBody(body);
  return {
    mesh,
    body
  };
}
function createRopeSegment(waypoints, segments) {
  const curve = new THREE.CatmullRomCurve3(waypoints);
  const physVertices = [];
  const physIndices = [];
  const group = new THREE.Group();
  const railMat = new THREE.MeshStandardMaterial({
    color: 0xff5e00,
    metalness: 0.4,
    roughness: 0.2
  });
  const bracketMat = new THREE.MeshStandardMaterial({
    color: 0x34495e,
    metalness: 0.8,
    roughness: 0.4
  });
  const tube1Points = [];
  const tube2Points = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const pt = curve.getPoint(t);
    const tangent = curve.getTangent(t).normalize();
    const up = new THREE.Vector3(0, 1, 0);
    const right = new THREE.Vector3().crossVectors(tangent, up).normalize();
    const pLeft = pt.clone().add(right.clone().multiplyScalar(-0.4));
    const pRight = pt.clone().add(right.clone().multiplyScalar(0.4));
    const pCenter = pt.clone().add(up.clone().multiplyScalar(-0.3));
    tube1Points.push(pLeft);
    tube2Points.push(pRight);
    physVertices.push(pLeft.x, pLeft.y, pLeft.z);
    physVertices.push(pCenter.x, pCenter.y, pCenter.z);
    physVertices.push(pRight.x, pRight.y, pRight.z);
    if (i % 15 === 0 && i < segments && i > 0) {
      const sleeperGeo = new THREE.BoxGeometry(2.0, 0.2, 0.4);
      const sleeperMesh = new THREE.Mesh(sleeperGeo, bracketMat);
      sleeperMesh.position.copy(pCenter).add(up.clone().multiplyScalar(-0.22));
      const rotationMatrix = new THREE.Matrix4().makeBasis(right, up, tangent);
      sleeperMesh.quaternion.setFromRotationMatrix(rotationMatrix);
      sleeperMesh.castShadow = true;
      sleeperMesh.receiveShadow = true;
      group.add(sleeperMesh);
    }
  }
  for (let i = 0; i < segments; i++) {
    let curr = i * 3;
    let next = (i + 1) * 3;
    physIndices.push(curr, curr + 1, next);
    physIndices.push(next, curr + 1, next + 1);
    physIndices.push(curr + 1, curr + 2, next + 1);
    physIndices.push(next + 1, curr + 2, next + 2);
  }
  const visTube1 = tube1Points.map(p => p.clone());
  const visTube2 = tube2Points.map(p => p.clone());
  visTube1[0].y -= 0.6;
  visTube2[0].y -= 0.6;
  visTube1[visTube1.length - 1].y -= 0.6;
  visTube2[visTube2.length - 1].y -= 0.6;
  const tube1Geo = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(visTube1), segments, 0.12, 12, false);
  const tube2Geo = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(visTube2), segments, 0.12, 12, false);
  const mesh1 = new THREE.Mesh(tube1Geo, railMat);
  const mesh2 = new THREE.Mesh(tube2Geo, railMat);
  mesh1.castShadow = true;
  mesh2.castShadow = true;
  group.add(mesh1);
  group.add(mesh2);
  const capGeo = new THREE.SphereGeometry(0.12, 12, 12);
  const cap1Start = new THREE.Mesh(capGeo, railMat);
  cap1Start.position.copy(visTube1[0]);
  group.add(cap1Start);
  const cap2Start = new THREE.Mesh(capGeo, railMat);
  cap2Start.position.copy(visTube2[0]);
  group.add(cap2Start);
  const cap1End = new THREE.Mesh(capGeo, railMat);
  cap1End.position.copy(visTube1[visTube1.length - 1]);
  group.add(cap1End);
  const cap2End = new THREE.Mesh(capGeo, railMat);
  cap2End.position.copy(visTube2[visTube2.length - 1]);
  group.add(cap2End);
  scene.add(group);
  const trimesh = new CANNON.Trimesh(physVertices, physIndices);
  const body = new CANNON.Body({
    mass: 0,
    material: defaultMat
  });
  body.addShape(trimesh);
  world.addBody(body);
  group.userData.physicsBodies = group.userData.physicsBodies || [];
  group.userData.physicsBodies.push(body);
  return {
    mesh: group,
    body: body
  };
}
function spawnDynamicObstacle(type, x, y, z, options = {}) {
  const pool = type === 'piston' ? pistonPool : type === 'fan' ? fanPool : type === 'elevator' ? elevatorPool : type === 'poles15_downhill' ? polesPool : type === 'buzzsaw' ? buzzsawPool : type === 'sweeper' ? sweeperPool : type === 'crumbling_path' ? crumblingPool : windmillPool;
  if (pool.length > 0) {
    const obj = pool.pop();
    if (type === 'poles15_downhill') {
      obj.group.position.set(x, y, z);
      obj.body.position.set(x, y, z);
    } else if (type === 'piston') {
      const side = options.side || 1;
      obj.side = side;
      obj.baseX = x;
      obj.offset = Math.random() * Math.PI * 2;
      obj.group.position.set(x, y, z);
      obj.baseMesh.position.set(side * 4.5, 1.0, 0);
      obj.rodMesh.position.set(side * 4.5, 1.0, 0);
      obj.body.position.set(x, y, z);
    } else if (type === 'fan') {
      obj.group.position.set(x, y - 0.25, z);
      obj.body.position.set(x, y - 0.25, z);
      obj.speed = 0.18;
      obj.centerZ = z;
    } else if (type === 'elevator') {
      obj.baseX = x;
      obj.baseY = y - 0.25;
      obj.baseZ = z;
      obj.offset = Math.random() * Math.PI * 2;
      obj.group.position.set(x, y - 0.25, z);
      obj.body.position.set(x, y - 0.25, z);
    } else if (type === 'windmill') {
      obj.dir = options.direction || 1;
      obj.speed = options.speed || 1.8;
      obj.offset = Math.random() * Math.PI * 2;
      const coreHeight = 5.2;
      obj.group.position.set(x, y + coreHeight, z);
      obj.body.position.set(x, y + coreHeight, z);
    } else if (type === 'buzzsaw') {
      obj.centerX = x;
      obj.centerZ = z;
      obj.baseY = y;
      obj.dir = options.direction || 1;
      obj.speed = options.speed || 1.8;
      obj.radius = options.radius || 12.0;
      obj.offset = Math.random() * Math.PI * 2;
      obj.group.position.set(x, y, z);
    } else if (type === 'sweeper') {
      obj.group.position.set(x, y, z);
      obj.staticBody.position.set(x, y - 1.0, z);
      obj.rotatingBody.position.set(x, y - 0.5, z);
      obj.rotatingGroup.rotation.y = 0;
      obj.rotatingBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), 0);
      obj.centerX = x;
      obj.baseY = y;
      obj.centerZ = z;
    } else if (type === 'crumbling_path') {
      obj.startZ = options.startZ;
      obj.endZ = options.endZ;
      obj.baseY = y;
      const length = Math.abs(obj.startZ - obj.endZ);
      const waypoints = [new THREE.Vector3(x, y, obj.startZ), new THREE.Vector3(x + 15.0, y, obj.startZ - length * 0.33), new THREE.Vector3(x - 15.0, y, obj.startZ - length * 0.66), new THREE.Vector3(x, y, obj.endZ)];
      const curve = new THREE.CatmullRomCurve3(waypoints);
      obj.slabs.forEach(slab => {
        let t = slab.tSegment;
        let pt = curve.getPoint(t);
        let tangent = curve.getTangent(t).normalize();
        let angle = Math.atan2(tangent.x, tangent.z);
        slab.mesh.position.set(pt.x, y - 0.25, pt.z);
        slab.mesh.rotation.set(0, angle, 0);
        slab.initialPos.copy(slab.mesh.position);
        slab.initialRot.copy(slab.mesh.rotation);
        slab.body.position.set(pt.x, y - 0.25, pt.z);
        slab.body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), angle);
        slab.initialQuat.copy(slab.body.quaternion);
        world.removeBody(slab.body);
        slab.state = 0;
        slab.timer = 0;
        slab.fallVelocity = 0;
        slab.mesh.visible = true;
        world.addBody(slab.body);
      });
      scene.add(obj.group);
    }
    if (obj.type !== 'crumbling_path') {
      scene.add(obj.group);
      if (obj.body) world.addBody(obj.body);
      if (obj.staticBody) world.addBody(obj.staticBody);
      if (obj.rotatingBody) world.addBody(obj.rotatingBody);
    }
    dynamicObjects.push(obj);
    return;
  }
  const group = new THREE.Group();
  let yOffset = 0;
  if (type === 'fan' || type === 'elevator') yOffset = -0.25;
  if (type !== 'poles15_downhill' && type !== 'windmill' && type !== 'buzzsaw' && type !== 'sweeper' && type !== 'crumbling_path') {
    group.position.set(x, y + yOffset, z);
  }
  if (type === 'piston') {
    const side = options.side || 1;
    const baseMesh = new THREE.Mesh(new THREE.BoxGeometry(3, 2.0, 2.5), new THREE.MeshStandardMaterial({
      color: 0x555555
    }));
    baseMesh.position.set(side * 4.5, 1.0, 0);
    baseMesh.castShadow = true;
    group.add(baseMesh);
    const rodMesh = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.6, 0.6), new THREE.MeshStandardMaterial({
      color: 0xbdc3c7
    }));
    rodMesh.position.set(side * 4.5, 1.0, 0);
    group.add(rodMesh);
    const pushGroup = new THREE.Group();
    const headMesh = new THREE.Mesh(new THREE.BoxGeometry(0.5, 2.0, 3.2), hazardMat);
    headMesh.position.set(0, 1.0, 0);
    pushGroup.add(headMesh);
    group.add(pushGroup);
    scene.add(group);
    const body = new CANNON.Body({
      type: CANNON.Body.KINEMATIC,
      position: new CANNON.Vec3(x, y, z)
    });
    body.addShape(new CANNON.Box(new CANNON.Vec3(0.25, 1.0, 1.6)), new CANNON.Vec3(0, 1.0, 0));
    world.addBody(body);
    dynamicObjects.push({
      type: 'piston',
      group,
      pushGroup,
      baseMesh,
      rodMesh,
      body,
      baseX: x,
      side: side,
      offset: Math.random() * Math.PI * 2
    });
  } else if (type === 'fan') {
    const arm1Geo = new THREE.BoxGeometry(6, 0.5, 30);
    const arm2Geo = new THREE.BoxGeometry(30, 0.5, 6);
    const arm1 = new THREE.Mesh(arm1Geo, solarPanelMat);
    const arm2 = new THREE.Mesh(arm2Geo, solarPanelMat);
    arm1.castShadow = true;
    arm1.receiveShadow = true;
    group.add(arm1);
    arm2.castShadow = true;
    arm2.receiveShadow = true;
    group.add(arm2);
    scene.add(group);
    const body = new CANNON.Body({
      type: CANNON.Body.KINEMATIC,
      position: new CANNON.Vec3(x, y - 0.25, z),
      material: defaultMat
    });
    body.addShape(new CANNON.Box(new CANNON.Vec3(3, 0.25, 15)));
    body.addShape(new CANNON.Box(new CANNON.Vec3(15, 0.25, 3)));
    world.addBody(body);
    dynamicObjects.push({
      type: 'fan',
      group,
      body,
      speed: 0.18,
      centerZ: z
    });
  } else if (type === 'elevator') {
    const platGroup = new THREE.Group();
    const floorGeo = new THREE.BoxGeometry(11, 0.5, 11);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x4a4e59,
      roughness: 0.9,
      metalness: 0.6
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.receiveShadow = true;
    floorMesh.castShadow = true;
    platGroup.add(floorMesh);
    const edgeZGeo = new THREE.BoxGeometry(12, 0.5, 0.5);
    const edgeXGeo = new THREE.BoxGeometry(0.5, 0.5, 11);
    const edgeFront = new THREE.Mesh(edgeZGeo, hazardMat);
    edgeFront.position.set(0, 0, -5.75);
    edgeFront.castShadow = true;
    platGroup.add(edgeFront);
    const edgeBack = new THREE.Mesh(edgeZGeo, hazardMat);
    edgeBack.position.set(0, 0, 5.75);
    edgeBack.castShadow = true;
    platGroup.add(edgeBack);
    const edgeLeft = new THREE.Mesh(edgeXGeo, hazardMat);
    edgeLeft.position.set(-5.75, 0, 0);
    edgeLeft.castShadow = true;
    platGroup.add(edgeLeft);
    const edgeRight = new THREE.Mesh(edgeXGeo, hazardMat);
    edgeRight.position.set(5.75, 0, 0);
    edgeRight.castShadow = true;
    platGroup.add(edgeRight);
    const ringGeo = new THREE.TorusGeometry(1.5, 0.1, 16, 32);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0x00d2d3,
      emissive: 0x00d2d3,
      emissiveIntensity: 1.5
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 2;
    ringMesh.position.y = 0.26;
    platGroup.add(ringMesh);
    group.add(platGroup);
    scene.add(group);
    const body = new CANNON.Body({
      type: CANNON.Body.KINEMATIC,
      position: new CANNON.Vec3(x, y - 0.25, z)
    });
    body.addShape(new CANNON.Box(new CANNON.Vec3(5.5, 0.25, 5.5)));
    body.material = elevatorMat;
    world.addBody(body);
    dynamicObjects.push({
      type: 'elevator',
      group,
      body,
      baseX: x,
      baseY: y - 0.25,
      baseZ: z,
      offset: Math.random() * Math.PI * 2
    });
  } else if (type === 'poles15_downhill') {
    const poleGeo = new THREE.CylinderGeometry(0.25, 0.25, 3, 16);
    poleGeo.translate(0, 1.5, 0);
    group.position.set(x, y, z);
    const body = new CANNON.Body({
      type: CANNON.Body.KINEMATIC,
      position: new CANNON.Vec3(x, y, z),
      material: poleMat
    });
    const rows = [2, 3, 2, 3, 2];
    const sectionLength = options.length || 30;
    const zSpacing = sectionLength / rows.length;
    let startLocalZ = -10;
    rows.forEach((count, index) => {
      let localZ = startLocalZ - index * zSpacing;
      let localY = 0;
      let xPositions = count === 3 ? [-2.7, 0, 2.7] : [-1.4, 1.4];
      xPositions.forEach(localX => {
        const poleMesh = new THREE.Mesh(poleGeo, hazardMat);
        poleMesh.position.set(localX, localY, localZ);
        poleMesh.castShadow = true;
        group.add(poleMesh);
        const poleShape = new CANNON.Cylinder(0.25, 0.25, 3, 16);
        const q = new CANNON.Quaternion();
        q.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), Math.PI / 2);
        body.addShape(poleShape, new CANNON.Vec3(localX, localY + 1.5, localZ), q);
      });
    });
    scene.add(group);
    world.addBody(body);
    dynamicObjects.push({
      type: 'poles15_downhill',
      group,
      body
    });
  } else if (type === 'windmill') {
    const coreHeight = 5.2;
    group.position.set(x, y + coreHeight, z);
    const ivoryMat = new THREE.MeshStandardMaterial({
      color: 0xFFFFF0,
      roughness: 0.2,
      metalness: 0.5
    });
    const hubGeo = new THREE.SphereGeometry(1.0, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    hubGeo.rotateX(Math.PI / 2);
    const hubMesh = new THREE.Mesh(hubGeo, ivoryMat);
    hubMesh.position.z = 0.5;
    hubMesh.castShadow = true;
    group.add(hubMesh);
    const baseGeo = new THREE.CylinderGeometry(1.0, 1.0, 1.0, 32);
    baseGeo.rotateX(Math.PI / 2);
    const baseMesh = new THREE.Mesh(baseGeo, ivoryMat);
    baseMesh.castShadow = true;
    group.add(baseMesh);
    const rotorGroup = new THREE.Group();
    const body = new CANNON.Body({
      type: CANNON.Body.KINEMATIC,
      position: new CANNON.Vec3(x, y + coreHeight, z)
    });
    body.material = defaultMat;
    const bladeLength = 4.8;
    const bladeHalfLength = bladeLength / 2;
    const bladeWidth = 1.2;
    const bladeDepth = 1.4;
    const pastelPinkMat = new THREE.MeshStandardMaterial({
      color: 0xFFB6C1,
      roughness: 0.6,
      metalness: 0.2
    });
    for (let i = 0; i < 3; i++) {
      const angle = i * (Math.PI * 2) / 3;
      const bladeGroup = new THREE.Group();
      const blade = new THREE.Mesh(new THREE.BoxGeometry(bladeLength, bladeWidth, bladeDepth), pastelPinkMat);
      blade.castShadow = true;
      bladeGroup.add(blade);
      bladeGroup.position.set(Math.cos(angle) * bladeHalfLength, Math.sin(angle) * bladeHalfLength, 0);
      bladeGroup.rotation.z = angle;
      rotorGroup.add(bladeGroup);
      const shape = new CANNON.Box(new CANNON.Vec3(bladeHalfLength, bladeWidth / 2, bladeDepth / 2));
      const q = new CANNON.Quaternion();
      q.setFromAxisAngle(new CANNON.Vec3(0, 0, 1), angle);
      body.addShape(shape, new CANNON.Vec3(Math.cos(angle) * bladeHalfLength, Math.sin(angle) * bladeHalfLength, 0), q);
    }
    group.add(rotorGroup);
    scene.add(group);
    world.addBody(body);
    dynamicObjects.push({
      type: 'windmill',
      group: group,
      rotorGroup: rotorGroup,
      body: body,
      dir: options.direction || 1,
      speed: options.speed || 1.8,
      offset: Math.random() * Math.PI * 2
    });
  } else if (type === 'buzzsaw') {
    group.position.set(x, y, z);
    const radius = options.radius || 12.0;
    const steelMat = new THREE.MeshStandardMaterial({
      color: 0x7f8c8d,
      roughness: 0.5,
      metalness: 0.8
    });
    const redNeon = new THREE.MeshStandardMaterial({
      color: 0xff0000,
      emissive: 0xff0000,
      emissiveIntensity: 2.0
    });
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 1.2, 16), steelMat);
    hub.position.y = 0.6;
    hub.castShadow = true;
    group.add(hub);
    const armGroup = new THREE.Group();
    const arm = new THREE.Mesh(new THREE.BoxGeometry(radius, 0.6, 1.2), steelMat);
    arm.position.set(radius / 2, 0.6, 0);
    arm.castShadow = true;
    const ledStrip = new THREE.Mesh(new THREE.BoxGeometry(radius - 2.0, 0.65, 0.4), redNeon);
    ledStrip.position.set(radius / 2, 0.6, 0);
    armGroup.add(arm, ledStrip);
    group.add(armGroup);
    const sawGroup = new THREE.Group();
    sawGroup.position.set(radius, 0.8, 0);
    const plateGeo = new THREE.CylinderGeometry(2.2, 2.2, 0.2, 24);
    const bottomPlate = new THREE.Mesh(plateGeo, steelMat);
    bottomPlate.position.y = -0.6;
    bottomPlate.castShadow = true;
    const topPlate = new THREE.Mesh(plateGeo, steelMat);
    topPlate.position.y = 0.6;
    topPlate.castShadow = true;
    const coreSaw = new THREE.Mesh(new THREE.CylinderGeometry(2.0, 2.0, 1.0, 24), redNeon);
    const spikeGeo = new THREE.ConeGeometry(0.3, 0.8, 4);
    spikeGeo.translate(0, 2.5, 0);
    for (let i = 0; i < 12; i++) {
      const spike = new THREE.Mesh(spikeGeo, steelMat);
      spike.rotation.z = -Math.PI / 2;
      spike.rotation.x = i / 12 * Math.PI * 2;
      coreSaw.add(spike);
    }
    sawGroup.add(bottomPlate, topPlate, coreSaw);
    group.add(sawGroup);
    scene.add(group);
    const body = new CANNON.Body({
      type: CANNON.Body.KINEMATIC,
      position: new CANNON.Vec3(x + radius, y + 0.8, z),
      material: hazardMat
    });
    body.addShape(new CANNON.Box(new CANNON.Vec3(2.4, 0.8, 2.4)));
    world.addBody(body);
    dynamicObjects.push({
      type: 'buzzsaw',
      group: group,
      sawGroup: sawGroup,
      body: body,
      centerX: x,
      centerZ: z,
      baseY: y,
      radius: radius,
      dir: options.direction || 1,
      speed: options.speed || 1.8,
      offset: Math.random() * Math.PI * 2
    });
  } else if (type === 'sweeper') {
    group.position.set(x, y, z);
    const staticGroup = new THREE.Group();
    const rotatingGroup = new THREE.Group();
    group.add(staticGroup);
    group.add(rotatingGroup);
    const centerMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.5,
      metalness: 0.1,
      emissive: 0xffffff,
      emissiveIntensity: 0.2
    });
    const centerMesh = new THREE.Mesh(new THREE.CylinderGeometry(2.8, 2.8, 2.0, 32), centerMat);
    centerMesh.position.y = -1.0;
    centerMesh.castShadow = true;
    centerMesh.receiveShadow = true;
    staticGroup.add(centerMesh);
    const pinkMat = new THREE.MeshStandardMaterial({
      color: 0xff3385,
      roughness: 0.6,
      metalness: 0.1,
      emissive: 0xff3385,
      emissiveIntensity: 0.3
    });
    const armGeo = new THREE.BoxGeometry(3.2, 1.0, 9.2);
    const arm1 = new THREE.Mesh(armGeo, pinkMat);
    arm1.position.set(0, -0.5, 7.4);
    arm1.castShadow = true;
    arm1.receiveShadow = true;
    rotatingGroup.add(arm1);
    scene.add(group);
    const staticBody = new CANNON.Body({
      type: CANNON.Body.STATIC,
      position: new CANNON.Vec3(x, y - 1.0, z),
      material: defaultMat
    });
    const padBox = new CANNON.Box(new CANNON.Vec3(2.5, 1.0, 2.5));
    staticBody.addShape(padBox);
    const q45 = new CANNON.Quaternion();
    q45.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), Math.PI / 4);
    staticBody.addShape(padBox, new CANNON.Vec3(0, 0, 0), q45);
    world.addBody(staticBody);
    const rotatingBody = new CANNON.Body({
      type: CANNON.Body.KINEMATIC,
      position: new CANNON.Vec3(x, y - 0.5, z),
      material: defaultMat
    });
    const armShape = new CANNON.Box(new CANNON.Vec3(1.6, 0.5, 4.6));
    rotatingBody.addShape(armShape, new CANNON.Vec3(0, 0, 7.4));
    world.addBody(rotatingBody);
    dynamicObjects.push({
      type: 'sweeper',
      group: group,
      rotatingGroup: rotatingGroup,
      staticBody: staticBody,
      rotatingBody: rotatingBody,
      centerX: x,
      baseY: y,
      centerZ: z
    });
    return;
  } else if (type === 'crumbling_path') {
    const startZ = options.startZ;
    const endZ = options.endZ;
    const length = Math.abs(startZ - endZ);
    const waveCount = 2.5;
    const waypoints = [new THREE.Vector3(x, y, startZ), new THREE.Vector3(x + 15.0, y, startZ - length * 0.33), new THREE.Vector3(x - 15.0, y, startZ - length * 0.66), new THREE.Vector3(x, y, endZ)];
    const curve = new THREE.CatmullRomCurve3(waypoints);
    const slabs = [];
    const slabDepth = 1.6;
    const gap = 0.2;
    const segmentLength = slabDepth + gap;
    const steps = Math.floor(length / segmentLength);
    const topGeo = new THREE.BoxGeometry(6.0, 0.4, slabDepth);
    const physShape = new CANNON.Box(new CANNON.Vec3(3.0, 0.2, slabDepth / 2));
    for (let i = 0; i <= steps; i++) {
      let tSegment = i / steps;
      let pt = curve.getPoint(tSegment);
      let tangent = curve.getTangent(tSegment).normalize();
      let angle = Math.atan2(tangent.x, tangent.z);
      const topMesh = new THREE.Mesh(topGeo, crackedConcreteMat);
      topMesh.receiveShadow = true;
      topMesh.castShadow = true;
      topMesh.position.set(pt.x, y - 0.25, pt.z);
      topMesh.rotation.set(0, angle, 0);
      group.add(topMesh);
      const body = new CANNON.Body({
        type: CANNON.Body.STATIC,
        position: new CANNON.Vec3(pt.x, y - 0.25, pt.z),
        material: defaultMat
      });
      body.addShape(physShape);
      body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), angle);
      world.addBody(body);
      slabs.push({
        mesh: topMesh,
        body: body,
        tSegment: tSegment,
        initialPos: topMesh.position.clone(),
        initialRot: topMesh.rotation.clone(),
        initialQuat: body.quaternion.clone(),
        state: 0,
        timer: 0,
        fallVelocity: 0
      });
    }
    scene.add(group);
    dynamicObjects.push({
      type: 'crumbling_path',
      group: group,
      slabs: slabs,
      startZ: startZ,
      endZ: endZ,
      baseY: y
    });
  }
}
function spawnModule(forceType, levelContext = currentLevelIndex) {
  let type = forceType;
  let extraL = (levelContext - 1) * 0.8;
  let speedMult = 1.0 + Math.min(0.30, (levelContext - 1) * 0.01);
  let pts = [],
    wds = [],
    bankAngles = null,
    wallH = 0.02,
    segmentCount = 50;
  if (type === 0) {
    let dist = 40 + extraL;
    if (globalZ === 15) {
      dist = 25;
      pts = [new THREE.Vector3(globalX, globalY, globalZ), new THREE.Vector3(globalX, globalY, globalZ - 10), new THREE.Vector3(globalX, globalY, globalZ - dist)];
      wds = [12, 12, 6];
      segmentCount = 40;
    } else {
      pts = [new THREE.Vector3(globalX, globalY, globalZ), new THREE.Vector3(globalX, globalY, globalZ - dist)];
      wds = [6, 6];
      segmentCount = 40;
    }
    pendingWaveDistance += dist;
    pendingWaveTimeBuffer -= dist / 8.5 - dist / 12.0;
    globalZ -= dist;
  } else if (type === 1) {
    let dist = 140 + extraL;
    pts = [new THREE.Vector3(globalX, globalY, globalZ), new THREE.Vector3(globalX, globalY, globalZ - dist * 0.1), new THREE.Vector3(globalX - 7, globalY, globalZ - dist * 0.3), new THREE.Vector3(globalX + 7, globalY, globalZ - dist * 0.5), new THREE.Vector3(globalX - 7, globalY, globalZ - dist * 0.7), new THREE.Vector3(globalX + 7, globalY, globalZ - dist * 0.9), new THREE.Vector3(globalX, globalY, globalZ - dist)];
    wds = [6, 2.0, 2.0, 2.0, 2.0, 2.0, 6];
    segmentCount = 150;
    pendingWaveDistance += dist;
    pendingWaveTimeBuffer += 5.0;
    globalZ -= dist;
  } else if (type === 2) {
    let runDist = 45 + extraL;
    let ptsA = [new THREE.Vector3(globalX, globalY, globalZ), new THREE.Vector3(globalX, globalY - 12, globalZ - runDist * 0.6), new THREE.Vector3(globalX, globalY - 5, globalZ - runDist)];
    let chunkA = createTrackSegment(ptsA, [6, 4, 4], 60, {
      capEnd: true
    });
    chunkA.endZ = globalZ - runDist;
    activeChunks.push(chunkA);
    globalZ -= runDist;
    globalY -= 5;
    globalZ -= 35;
    globalY -= 15;
    pts = [new THREE.Vector3(globalX, globalY, globalZ), new THREE.Vector3(globalX, globalY, globalZ - 40)];
    wds = [12, 6];
    segmentCount = 40;
    pendingWaveDistance += runDist + 35 + 40;
    globalZ -= 40;
    let chunkB = createTrackSegment(pts, wds, segmentCount, {
      capStart: true
    });
    chunkB.endZ = globalZ;
    activeChunks.push(chunkB);
    pts = [];
  } else if (type === 3) {
    let dist = 100 + extraL;
    pts = [new THREE.Vector3(globalX, globalY, globalZ), new THREE.Vector3(globalX - 10, globalY, globalZ - dist * 0.3), new THREE.Vector3(globalX + 10, globalY, globalZ - dist * 0.7), new THREE.Vector3(globalX, globalY, globalZ - dist)];
    wds = [6, 8, 8, 6];
    wallH = 1.5;
    segmentCount = 100;
    pendingWaveDistance += dist;
    pendingWaveTimeBuffer -= dist / 8.5 - dist / 20.0;
    globalZ -= dist;
  } else if (type === 4) {
    let dist = 160 + extraL;
    pts = [new THREE.Vector3(globalX, globalY, globalZ), new THREE.Vector3(globalX - 15, globalY, globalZ - dist * 0.33), new THREE.Vector3(globalX + 15, globalY, globalZ - dist * 0.66), new THREE.Vector3(globalX, globalY, globalZ - dist)];
    wds = [6, 6, 6, 6];
    bankAngles = [0, -Math.PI / 4.5, Math.PI / 4.5, 0];
    segmentCount = 160;
    pendingWaveDistance += dist;
    globalZ -= dist;
  } else if (type === 5) {
    pts = [new THREE.Vector3(globalX, globalY, globalZ), new THREE.Vector3(globalX, globalY, globalZ - 10)];
    let chunkM = createTrackSegment(pts, [6, 6], 10, {
      capEnd: true
    });
    chunkM.endZ = globalZ - 10;
    activeChunks.push(chunkM);
    let splitD = 60 + extraL;
    let ptsL = [new THREE.Vector3(globalX - 2, globalY, globalZ - 10), new THREE.Vector3(globalX - 4, globalY, globalZ - 10 - splitD * 0.5), new THREE.Vector3(globalX - 2, globalY, globalZ - 10 - splitD)];
    let ptsR = [new THREE.Vector3(globalX + 2, globalY, globalZ - 10), new THREE.Vector3(globalX + 4, globalY, globalZ - 10 - splitD * 0.5), new THREE.Vector3(globalX + 2, globalY, globalZ - 10 - splitD)];
    let chunkL = createTrackSegment(ptsL, [1.8, 1.8, 1.8], 50, {
      capStart: true,
      capEnd: true
    });
    chunkL.endZ = globalZ - 10 - splitD;
    activeChunks.push(chunkL);
    let chunkR = createTrackSegment(ptsR, [1.8, 1.8, 1.8], 50, {
      capStart: true,
      capEnd: true
    });
    chunkR.endZ = globalZ - 10 - splitD;
    activeChunks.push(chunkR);
    globalZ -= 10 + splitD;
    pts = [new THREE.Vector3(globalX, globalY, globalZ), new THREE.Vector3(globalX, globalY, globalZ - 20)];
    wds = [6, 6];
    segmentCount = 20;
    pendingWaveDistance += 10 + splitD + 20;
    pendingWaveTimeBuffer += 3.0;
    globalZ -= 20;
    let chunkEnd = createTrackSegment(pts, wds, segmentCount, {
      capStart: true
    });
    chunkEnd.endZ = globalZ;
    activeChunks.push(chunkEnd);
    pts = [];
  } else if (type === 6) {
    let dist = 80 + extraL;
    pts = [new THREE.Vector3(globalX, globalY, globalZ), new THREE.Vector3(globalX, globalY, globalZ - dist)];
    wds = [6, 6];
    segmentCount = 60;
    spawnDynamicObstacle('piston', globalX, globalY, globalZ - dist * 0.3, {
      side: 1
    });
    spawnDynamicObstacle('piston', globalX, globalY, globalZ - dist * 0.55, {
      side: -1
    });
    spawnDynamicObstacle('piston', globalX, globalY, globalZ - dist * 0.8, {
      side: 1
    });
    pendingWaveDistance += dist;
    pendingWaveTimeBuffer += 4.0;
    globalZ -= dist;
  } else if (type === 7) {
    pts = [new THREE.Vector3(globalX, globalY, globalZ), new THREE.Vector3(globalX, globalY, globalZ - 10)];
    let chunkA = createTrackSegment(pts, [6, 6], 10, {
      capEnd: true
    });
    chunkA.endZ = globalZ - 10;
    activeChunks.push(chunkA);
    spawnDynamicObstacle('fan', globalX, globalY, globalZ - 25);
    globalZ -= 40;
    pts = [new THREE.Vector3(globalX, globalY, globalZ), new THREE.Vector3(globalX, globalY, globalZ - 30 - extraL)];
    let chunkB = createTrackSegment(pts, [6, 6], 20, {
      capStart: true
    });
    chunkB.endZ = globalZ - (30 + extraL);
    activeChunks.push(chunkB);
    pts = [];
    pendingWaveDistance += 10 + 40 + 30 + extraL;
    pendingWaveTimeBuffer += 10.0;
    globalZ -= 30 + extraL;
  } else if (type === 8) {
    pts = [new THREE.Vector3(globalX, globalY, globalZ), new THREE.Vector3(globalX, globalY, globalZ - 10)];
    let chunkA = createTrackSegment(pts, [6, 6], 10, {
      capEnd: true
    });
    chunkA.endZ = globalZ - 10;
    activeChunks.push(chunkA);
    spawnDynamicObstacle('elevator', globalX, globalY, globalZ - 19);
    globalZ -= 28;
    globalY += 25;
    pts = [new THREE.Vector3(globalX, globalY, globalZ), new THREE.Vector3(globalX, globalY, globalZ - 30 - extraL)];
    let chunkB = createTrackSegment(pts, [6, 6], 20, {
      capStart: true
    });
    chunkB.endZ = globalZ - (30 + extraL);
    activeChunks.push(chunkB);
    pts = [];
    pendingWaveDistance += 40 + 28 + extraL;
    pendingWaveTimeBuffer += 15.0;
    globalZ -= 30 + extraL;
  } else if (type === 9) {
    let dist = 180 + extraL;
    pts = [new THREE.Vector3(globalX, globalY, globalZ)];
    const waveCount = 4;
    const amplitude = 8;
    const pointsCount = 15;
    for (let i = 1; i < pointsCount; i++) {
      let t = i / pointsCount;
      let zPos = globalZ - dist * t;
      let currentAmp = amplitude;
      if (i === 1 || i === pointsCount - 1) currentAmp = amplitude * 0.5;
      let xPos = globalX + Math.sin(t * Math.PI * waveCount) * currentAmp;
      pts.push(new THREE.Vector3(xPos, globalY, zPos));
    }
    pts.push(new THREE.Vector3(globalX, globalY, globalZ - dist));
    let chunkRope = createRopeSegment(pts, 180);
    chunkRope.endZ = globalZ - dist;
    activeChunks.push(chunkRope);
    ropeZones.push({
      startZ: globalZ,
      endZ: globalZ - dist
    });
    let chunkEnd = createTrackSegment([new THREE.Vector3(globalX, globalY, globalZ - dist), new THREE.Vector3(globalX, globalY, globalZ - dist - 10)], [6, 6], 10, {
      capStart: true
    });
    chunkEnd.endZ = globalZ - dist - 10;
    activeChunks.push(chunkEnd);
    globalZ -= 10;
    pendingWaveDistance += dist + 10;
    pendingWaveTimeBuffer += 12.0;
    globalZ -= dist;
  } else if (type === 10) {
    const group = new THREE.Group();
    const body = new CANNON.Body({
      mass: 0,
      material: defaultMat
    });
    group.userData.physicsBodies = [];
    const platSize = 5;
    const gapDiagonal = 0.16;
    const offset = gapDiagonal / Math.sqrt(2);
    const shift = platSize + offset;
    let curX = 3 + platSize / 2 + offset;
    let curZ = globalZ - platSize / 2 - offset;
    let dir = -1;
    let bridgeShape = new CANNON.Box(new CANNON.Vec3(0.6, 0.5, 0.6));
    let bQ = new CANNON.Quaternion();
    bQ.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), Math.PI / 4);
    body.addShape(bridgeShape, new CANNON.Vec3(3 + offset / 2, globalY - 0.5, globalZ - offset / 2), bQ);
    for (let i = 0; i < 5; i++) {
      let plat = new THREE.Mesh(new THREE.BoxGeometry(platSize, 1.0, platSize), grassMat);
      plat.position.set(curX, globalY - 0.5, curZ);
      plat.receiveShadow = true;
      plat.castShadow = true;
      group.add(plat);
      body.addShape(new CANNON.Box(new CANNON.Vec3(platSize / 2, 0.5, platSize / 2)), new CANNON.Vec3(curX, globalY - 0.5, curZ));
      if (i < 4) {
        let nextX = curX + shift * dir;
        let nextZ = curZ - shift;
        let bCX = (curX + nextX) / 2;
        let bCZ = (curZ + nextZ) / 2;
        body.addShape(bridgeShape, new CANNON.Vec3(bCX, globalY - 0.5, bCZ), bQ);
        curX = nextX;
        curZ = nextZ;
        dir *= -1;
      }
    }
    let catcherZ = curZ - platSize / 2 - offset - 5;
    let catcherPlat = createTrackSegment([new THREE.Vector3(0, globalY, curZ - platSize / 2 - offset), new THREE.Vector3(0, globalY, catcherZ)], [6, 6], 10, {
      capStart: true
    });
    catcherPlat.endZ = catcherZ;
    activeChunks.push(catcherPlat);
    body.addShape(bridgeShape, new CANNON.Vec3(3 + offset / 2, globalY - 0.5, curZ - platSize / 2 - offset / 2), bQ);
    scene.add(group);
    world.addBody(body);
    group.userData.physicsBodies.push(body);
    activeChunks.push({
      mesh: group,
      body: null,
      endZ: catcherZ
    });
    let dist = globalZ - catcherZ;
    pendingWaveDistance += dist;
    pendingWaveTimeBuffer += 15.0;
    globalZ -= dist;
  } else if (type === 11) {
    let distDrop = 80 + extraL;
    let dropY = 30;
    let ptsA = [new THREE.Vector3(globalX, globalY, globalZ), new THREE.Vector3(globalX, globalY, globalZ - 10), new THREE.Vector3(globalX, globalY - dropY, globalZ - distDrop + 10), new THREE.Vector3(globalX, globalY - dropY, globalZ - distDrop)];
    let chunkA = createTrackSegment(ptsA, [6, 6, 6, 6], 80, {
      wallHeight: 0.0
    });
    chunkA.endZ = globalZ - distDrop;
    activeChunks.push(chunkA);
    globalZ -= distDrop;
    globalY -= dropY;
    let flatDist = 50;
    let ptsB = [new THREE.Vector3(globalX, globalY, globalZ), new THREE.Vector3(globalX, globalY, globalZ - flatDist)];
    let chunkB = createTrackSegment(ptsB, [6, 6], 50);
    chunkB.endZ = globalZ - flatDist;
    activeChunks.push(chunkB);
    spawnDynamicObstacle('poles15_downhill', globalX, globalY, globalZ, {
      length: 30
    });
    globalZ -= flatDist;
    pendingWaveDistance += distDrop + flatDist;
    pendingWaveTimeBuffer += 10.0;
  } else if (type === 12) {
    let gridW = 15;
    let gridH = 19;
    let S = 2.2;
    let mazeWidth = gridW * S;
    let mazeLength = gridH * S;
    let mazeWallHeight = 1.6;
    let chunkBase = createTrackSegment([new THREE.Vector3(globalX, globalY, globalZ), new THREE.Vector3(globalX, globalY, globalZ - mazeLength)], [mazeWidth, mazeWidth], 10, {
      capStart: true,
      capEnd: true
    });
    chunkBase.endZ = globalZ - mazeLength;
    activeChunks.push(chunkBase);
    let maze = Array(gridW).fill().map(() => Array(gridH).fill(1));
    function carve(x, z) {
      maze[x][z] = 0;
      const dirs = [[0, -2], [2, 0], [0, 2], [-2, 0]].sort(() => Math.random() - 0.5);
      for (let d of dirs) {
        let nx = x + d[0],
          nz = z + d[1];
        if (nx > 0 && nx < gridW - 1 && nz > 0 && nz < gridH - 1 && maze[nx][nz] === 1) {
          maze[x + d[0] / 2][z + d[1] / 2] = 0;
          carve(nx, nz);
        }
      }
    }
    let entryX = Math.floor(gridW / 2);
    carve(entryX, gridH - 2);
    maze[entryX][gridH - 1] = 0;
    maze[entryX][0] = 0;
    if (maze[entryX][1] === 1) maze[entryX][1] = 0;
    const group = new THREE.Group();
    group.userData.physicsBodies = [];
    const geometries = [];
    const wallGeo = new THREE.BoxGeometry(S, mazeWallHeight, S);
    wallGeo.translate(0, mazeWallHeight / 2, 0);
    for (let x = 0; x < gridW; x++) {
      for (let z = 0; z < gridH; z++) {
        if (maze[x][z] === 1) {
          let localX = (x - Math.floor(gridW / 2)) * S;
          let localZ = -(z * S) - S / 2;
          let wMesh = new THREE.Mesh(wallGeo, mazeWallMat);
          wMesh.position.set(localX, 0, localZ);
          wMesh.updateMatrix();
          geometries.push(wMesh);
          const wallBody = new CANNON.Body({
            mass: 0,
            material: poleMat
          });
          const shape = new CANNON.Box(new CANNON.Vec3(S / 2, mazeWallHeight / 2, S / 2));
          wallBody.addShape(shape);
          wallBody.position.set(globalX + localX, globalY + mazeWallHeight / 2, globalZ + localZ);
          world.addBody(wallBody);
          group.userData.physicsBodies.push(wallBody);
        }
      }
    }
    const instancedWalls = new THREE.InstancedMesh(wallGeo, mazeWallMat, geometries.length);
    instancedWalls.castShadow = true;
    instancedWalls.receiveShadow = true;
    geometries.forEach((m, i) => instancedWalls.setMatrixAt(i, m.matrix));
    group.add(instancedWalls);
    group.position.set(globalX, globalY, globalZ);
    scene.add(group);
    activeChunks.push({
      mesh: group,
      body: null,
      endZ: globalZ - mazeLength
    });
    globalZ -= mazeLength;
    pendingWaveDistance += mazeLength;
    pendingWaveTimeBuffer += 30.0;
  } else if (type === 13) {
    let dist = 100 + extraL;
    pts = [new THREE.Vector3(globalX, globalY, globalZ), new THREE.Vector3(globalX, globalY, globalZ - dist)];
    wds = [6, 6];
    segmentCount = 60;
    spawnDynamicObstacle('windmill', globalX, globalY, globalZ - dist * 0.35, {
      direction: 1,
      speed: 2.5 * speedMult
    });
    spawnDynamicObstacle('windmill', globalX, globalY, globalZ - dist * 0.65, {
      direction: -1,
      speed: 2.5 * speedMult
    });
    pendingWaveDistance += dist;
    pendingWaveTimeBuffer += 5.0;
    globalZ -= dist;
  } else if (type === 14) {
    let startZ = globalZ;
    let currentZ = startZ;
    const group14 = new THREE.Group();
    const body14 = new CANNON.Body({
      mass: 0,
      material: defaultMat
    });
    const addSolidBlock = (w, h, d, px, py, pz) => {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), smoothConcreteMat);
      mesh.position.set(px, py, pz);
      mesh.receiveShadow = true;
      mesh.castShadow = true;
      group14.add(mesh);
      body14.addShape(new CANNON.Box(new CANNON.Vec3(w / 2, h / 2, d / 2)), new CANNON.Vec3(px, py, pz));
    };
    addSolidBlock(30, 2.0, 6, globalX, globalY - 1.0, currentZ - 3);
    addSolidBlock(6, 2.0, 18, globalX - 12, globalY - 1.0, currentZ - 15);
    addSolidBlock(6, 2.0, 18, globalX + 12, globalY - 1.0, currentZ - 15);
    addSolidBlock(30, 2.0, 6, globalX, globalY - 1.0, currentZ - 27);
    let chunkBridge = createTrackSegment([new THREE.Vector3(globalX, globalY, currentZ - 30), new THREE.Vector3(globalX, globalY, currentZ - 110)], [6, 6], 80);
    chunkBridge.endZ = currentZ - 110;
    activeChunks.push(chunkBridge);
    addSolidBlock(30, 2.0, 6, globalX, globalY - 1.0, currentZ - 113);
    addSolidBlock(6, 2.0, 18, globalX - 12, globalY - 1.0, currentZ - 125);
    addSolidBlock(6, 2.0, 18, globalX + 12, globalY - 1.0, currentZ - 125);
    addSolidBlock(30, 2.0, 6, globalX, globalY - 1.0, currentZ - 137);
    scene.add(group14);
    world.addBody(body14);
    activeChunks.push({
      mesh: group14,
      body: body14,
      endZ: currentZ - 140
    });
    const cannonGroup = new THREE.Group();
    const porcelainMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.1,
      metalness: 0.3
    });
    const skyBlueNeonMat = new THREE.MeshStandardMaterial({
      color: 0x00bfff,
      roughness: 0.2,
      metalness: 0.8,
      emissive: 0x00bfff,
      emissiveIntensity: 1.2
    });
    const darkHoleMat = new THREE.MeshBasicMaterial({
      color: 0x050505
    });
    [-2.0, 0, 2.0].forEach(x => {
      const bracket = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.2, 1.5), porcelainMat);
      bracket.position.set(x, globalY + 0.6, currentZ - 118.5);
      bracket.castShadow = true;
      const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.65, 2.6, 16), porcelainMat);
      barrel.rotation.x = Math.PI / 2;
      barrel.position.set(x, globalY + 1.2, currentZ - 117.5);
      barrel.castShadow = true;
      const muzzle = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.6, 0.6, 16), porcelainMat);
      muzzle.rotation.x = Math.PI / 2;
      muzzle.position.set(x, globalY + 1.2, currentZ - 115.9);
      muzzle.castShadow = true;
      const hole = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.1, 16), darkHoleMat);
      hole.rotation.x = Math.PI / 2;
      hole.position.set(x, globalY + 1.2, currentZ - 115.5);
      const ring1 = new THREE.Mesh(new THREE.TorusGeometry(0.68, 0.06, 16, 32), skyBlueNeonMat);
      ring1.position.set(x, globalY + 1.2, currentZ - 116.8);
      const ring2 = new THREE.Mesh(new THREE.TorusGeometry(0.68, 0.06, 16, 32), skyBlueNeonMat);
      ring2.position.set(x, globalY + 1.2, currentZ - 118.0);
      cannonGroup.add(bracket, barrel, muzzle, hole, ring1, ring2);
    });
    scene.add(cannonGroup);
    dynamicObjects.push({
      type: 'cannon_manager',
      group: cannonGroup,
      zSpawn: currentZ - 115.4,
      baseZ: currentZ - 115.4,
      holeZ: currentZ - 15,
      lastFireTime: gameTime,
      fireInterval: 2.0 / speedMult,
      projectiles: [],
      baseY: globalY
    });
    globalZ -= 140;
    pendingWaveDistance += 140;
    pendingWaveTimeBuffer += 20.0;
  } else if (type === 15) {
    let currentZ = globalZ;
    const group15 = new THREE.Group();
    const body15 = new CANNON.Body({
      mass: 0,
      material: defaultMat
    });
    const addSolidBlock = (w, h, d, px, py, pz) => {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), smoothConcreteMat);
      mesh.position.set(px, py, pz);
      mesh.receiveShadow = true;
      mesh.castShadow = true;
      group15.add(mesh);
      body15.addShape(new CANNON.Box(new CANNON.Vec3(w / 2, h / 2, d / 2)), new CANNON.Vec3(px, py, pz));
    };
    addSolidBlock(6.0, 2.0, 10, globalX, globalY - 1.0, currentZ - 5);
    currentZ -= 10;
    const createDonutPlatform = cz => {
      const shape = new THREE.Shape();
      shape.absarc(0, 0, 14, 0, Math.PI * 2, false);
      const hole = new THREE.Path();
      hole.absarc(0, 0, 10, 0, Math.PI * 2, true);
      shape.holes.push(hole);
      const donutGeo = new THREE.ExtrudeGeometry(shape, {
        depth: 2.0,
        bevelEnabled: false,
        curveSegments: 32
      });
      donutGeo.rotateX(Math.PI / 2);
      const donutMesh = new THREE.Mesh(donutGeo, smoothConcreteMat);
      donutMesh.position.set(globalX, globalY, cz);
      donutMesh.receiveShadow = true;
      donutMesh.castShadow = true;
      group15.add(donutMesh);
      const numSegs = 16;
      const radiusCenterPath = 12.0;
      const boxShape = new CANNON.Box(new CANNON.Vec3(2.0, 1.0, 2.45));
      for (let i = 0; i < numSegs; i++) {
        let a = i / numSegs * Math.PI * 2;
        let q = new CANNON.Quaternion();
        q.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), -a);
        body15.addShape(boxShape, new CANNON.Vec3(globalX + Math.cos(a) * radiusCenterPath, globalY - 1.0, cz + Math.sin(a) * radiusCenterPath), q);
      }
    };
    createDonutPlatform(currentZ - 14);
    spawnDynamicObstacle('buzzsaw', globalX, globalY, currentZ - 14, {
      direction: 1,
      speed: 1.8 * speedMult,
      radius: 12.0
    });
    currentZ -= 28;
    addSolidBlock(4.6, 2.0, 10, globalX, globalY - 1.0, currentZ - 5);
    const safeZoneMat = new THREE.MeshStandardMaterial({
      color: 0x2ecc71,
      roughness: 0.8,
      metalness: 0.1
    });
    const safePad = new THREE.Mesh(new THREE.BoxGeometry(4.8, 2.05, 4), safeZoneMat);
    safePad.position.set(globalX, globalY - 1.0, currentZ - 5);
    safePad.receiveShadow = true;
    group15.add(safePad);
    currentZ -= 10;
    createDonutPlatform(currentZ - 14);
    spawnDynamicObstacle('buzzsaw', globalX, globalY, currentZ - 14, {
      direction: -1,
      speed: 1.8 * speedMult,
      radius: 12.0
    });
    currentZ -= 28;
    addSolidBlock(6.0, 2.0, 10, globalX, globalY - 1.0, currentZ - 5);
    currentZ -= 10;
    scene.add(group15);
    world.addBody(body15);
    activeChunks.push({
      mesh: group15,
      body: body15,
      endZ: currentZ
    });
    globalZ = currentZ;
    pendingWaveDistance += 86;
    pendingWaveTimeBuffer += 18.0;
  } else if (type === 16) {
    let currentZ = globalZ;
    let entry = createTrackSegment([new THREE.Vector3(globalX, globalY, currentZ), new THREE.Vector3(globalX, globalY, currentZ - 10)], [6, 6], 10, {
      capEnd: true
    });
    entry.endZ = currentZ - 10;
    activeChunks.push(entry);
    currentZ -= 10;
    let sweeperCenterZ = currentZ - 12;
    spawnDynamicObstacle('sweeper', globalX, globalY, sweeperCenterZ);
    currentZ -= 24;
    let exit = createTrackSegment([new THREE.Vector3(globalX, globalY, currentZ), new THREE.Vector3(globalX, globalY, currentZ - 10)], [6, 6], 10, {
      capStart: true
    });
    exit.endZ = currentZ - 10;
    activeChunks.push(exit);
    currentZ -= 10;
    globalZ = currentZ;
    pendingWaveDistance += 44;
    pendingWaveTimeBuffer += 10.0;
  } else if (type === 17) {
    let currentZ = globalZ;
    let length = 200 + extraL * 5;
    let entry = createTrackSegment([new THREE.Vector3(globalX, globalY, currentZ), new THREE.Vector3(globalX, globalY, currentZ - 10)], [6, 6], 10, {
      capEnd: true
    });
    entry.endZ = currentZ - 10;
    activeChunks.push(entry);
    currentZ -= 10;
    spawnDynamicObstacle('crumbling_path', globalX, globalY, currentZ, {
      startZ: currentZ,
      endZ: currentZ - length
    });
    currentZ -= length;
    let exit = createTrackSegment([new THREE.Vector3(globalX, globalY, currentZ), new THREE.Vector3(globalX, globalY, currentZ - 10)], [6, 6], 10, {
      capStart: true
    });
    exit.endZ = currentZ - 10;
    activeChunks.push(exit);
    currentZ -= 10;
    globalZ = currentZ;
    pendingWaveDistance += length + 20;
    pendingWaveTimeBuffer += length / 8.0;
  } else if (type === 99) {
    pts = [new THREE.Vector3(globalX, globalY, globalZ), new THREE.Vector3(globalX, globalY, globalZ - 15), new THREE.Vector3(globalX, globalY, globalZ - 25), new THREE.Vector3(globalX, globalY, globalZ - 40)];
    wds = [6, 18, 18, 6];
    segmentCount = 50;
    const padCenterZ = globalZ - 20;
    const padOuterGeo = new THREE.CylinderGeometry(5.0, 5.0, 0.04, 32);
    const padOuterMat = new THREE.MeshStandardMaterial({
      color: 0x95a5a6,
      roughness: 0.8,
      metalness: 0.1
    });
    const padOuterMesh = new THREE.Mesh(padOuterGeo, padOuterMat);
    padOuterMesh.position.set(globalX, globalY + 0.02, padCenterZ);
    padOuterMesh.receiveShadow = true;
    scene.add(padOuterMesh);
    const padInnerGeo = new THREE.CylinderGeometry(3.5, 3.5, 0.05, 32);
    const padInnerMat = new THREE.MeshStandardMaterial({
      color: 0xbdc3c7,
      roughness: 0.9,
      metalness: 0.0
    });
    const padInnerMesh = new THREE.Mesh(padInnerGeo, padInnerMat);
    padInnerMesh.position.set(globalX, globalY + 0.025, padCenterZ);
    padInnerMesh.receiveShadow = true;
    scene.add(padInnerMesh);
    const gemGeo = new THREE.OctahedronGeometry(1.0);
    const gemMat = new THREE.MeshStandardMaterial({
      color: 0xf39c12,
      emissive: 0xf39c12,
      emissiveIntensity: 0.5
    });
    const gemMesh = new THREE.Mesh(gemGeo, gemMat);
    gemMesh.position.set(globalX, globalY + 2.5, padCenterZ);
    gemMesh.castShadow = true;
    scene.add(gemMesh);
    const ringGeo = new THREE.TorusGeometry(1.6, 0.1, 8, 32);
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      roughness: 0.2,
      metalness: 1.0
    });
    const gemRing = new THREE.Mesh(ringGeo, goldMat);
    gemRing.position.copy(gemMesh.position);
    gemRing.rotation.x = Math.PI / 2;
    scene.add(gemRing);
    const archGroup = new THREE.Group();
    const whiteStoneMat = new THREE.MeshStandardMaterial({
      color: 0xecf0f1,
      roughness: 0.9,
      metalness: 0.1
    });
    const darkStoneMat = new THREE.MeshStandardMaterial({
      color: 0x7f8c8d,
      roughness: 0.9,
      metalness: 0.0
    });
    const leafMat = new THREE.MeshStandardMaterial({
      color: 0x27ae60,
      roughness: 0.9,
      flatShading: true
    });
    const neonTrims = [];
    const stoneParts = [];
    function createTemplePillar(px, pz) {
      const pillarGroup = new THREE.Group();
      const base1 = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.4, 3.0), darkStoneMat);
      base1.position.y = 0.2;
      base1.castShadow = true;
      pillarGroup.add(base1);
      const base2 = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.4, 2.4), whiteStoneMat);
      base2.position.y = 0.6;
      base2.castShadow = true;
      pillarGroup.add(base2);
      const shaft = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.0, 9, 6), darkStoneMat);
      shaft.position.y = 5.3;
      shaft.castShadow = true;
      pillarGroup.add(shaft);
      stoneParts.push(base1, base2, shaft);
      const trimBot = new THREE.Mesh(new THREE.CylinderGeometry(1.05, 1.05, 0.4, 6), goldMat);
      trimBot.position.y = 1.0;
      pillarGroup.add(trimBot);
      neonTrims.push(trimBot);
      const trimTop = new THREE.Mesh(new THREE.CylinderGeometry(1.05, 1.05, 0.4, 6), goldMat);
      trimTop.position.y = 9.6;
      pillarGroup.add(trimTop);
      neonTrims.push(trimTop);
      pillarGroup.position.set(px, globalY, pz);
      return pillarGroup;
    }
    const pLeft = createTemplePillar(globalX - 6.5, padCenterZ);
    archGroup.add(pLeft);
    const pRight = createTemplePillar(globalX + 6.5, padCenterZ);
    archGroup.add(pRight);
    const roof1 = new THREE.Mesh(new THREE.BoxGeometry(18, 1.5, 3.5), darkStoneMat);
    roof1.position.set(globalX, globalY + 10.55, padCenterZ);
    roof1.castShadow = true;
    archGroup.add(roof1);
    const roof2 = new THREE.Mesh(new THREE.BoxGeometry(16, 1.0, 2.5), whiteStoneMat);
    roof2.position.set(globalX, globalY + 11.8, padCenterZ);
    roof2.castShadow = true;
    archGroup.add(roof2);
    stoneParts.push(roof1, roof2);
    const leafGeo = new THREE.DodecahedronGeometry(1.2, 0);
    const leaf1 = new THREE.Mesh(leafGeo, leafMat);
    leaf1.position.set(globalX - 7.5, globalY + 10.5, padCenterZ + 1.0);
    archGroup.add(leaf1);
    const leaf2 = new THREE.Mesh(leafGeo, leafMat);
    leaf2.position.set(globalX + 7.5, globalY + 10.5, padCenterZ - 1.0);
    archGroup.add(leaf2);
    scene.add(archGroup);
    checkpoints.push({
      x: globalX,
      z: padCenterZ,
      y: globalY,
      active: true,
      meshes: [padOuterMesh, padInnerMesh],
      gemMesh: gemMesh,
      gemRing: gemRing,
      neonTrims: neonTrims,
      stoneParts: stoneParts,
      isFinish: true,
      archGroup: archGroup
    });
    let chunkCP = createTrackSegment(pts, wds, segmentCount, {
      capEnd: false
    });
    chunkCP.endZ = globalZ - 40;
    activeChunks.push(chunkCP);
    pts = [];
    globalZ -= 40;
  }
  if (pts.length > 0) {
    let chunk = createTrackSegment(pts, wds, segmentCount, {
      wallHeight: wallH,
      bankAngles: bankAngles
    });
    chunk.endZ = globalZ;
    activeChunks.push(chunk);
  }
}
function updateUI() {
  let levelEl = document.getElementById('ui-level');
  if (levelEl) levelEl.innerText = currentLevelIndex;
  if (levelTimeLimit > 0) {
    let percent = Math.max(0, timeLeft / levelTimeLimit * 100);
    let fillEl = document.getElementById('ui-time-fill');
    if (fillEl) {
      fillEl.style.width = percent + '%';
      if (percent < 15) fillEl.className = 'time-bar-fill danger';else if (percent < 30) fillEl.className = 'time-bar-fill warning';else fillEl.className = 'time-bar-fill';
    }
    document.querySelectorAll('.star-zone-3').forEach(s => {
      if (percent < 30) s.classList.add('star-lost');else s.classList.remove('star-lost');
    });
    document.querySelectorAll('.star-zone-2').forEach(s => {
      if (percent < 15) s.classList.add('star-lost');else s.classList.remove('star-lost');
    });
    document.querySelectorAll('.star-zone-1').forEach(s => {
      if (percent <= 0) s.classList.add('star-lost');else s.classList.remove('star-lost');
    });
  }
}
function resetObstaclesForRespawn() {
  dynamicObjects.forEach(obj => {
    if (obj.type === 'crumbling_path' && obj.startZ <= safeRespawnPos.z + 10) {
      obj.slabs.forEach(slab => {
        world.removeBody(slab.body);
        slab.state = 0;
        slab.timer = 0;
        slab.fallVelocity = 0;
        slab.mesh.position.copy(slab.initialPos);
        slab.mesh.rotation.copy(slab.initialRot);
        slab.mesh.visible = true;
        slab.body.position.copy(slab.initialPos);
        slab.body.quaternion.copy(slab.initialQuat);
        world.addBody(slab.body);
      });
    }
  });
}
function handlePlayerDeath(reason) {
  triggerGameOver(reason);
}
function triggerGameOver(reason) {
  gameState = 'GAMEOVER';
  document.getElementById('in-game-controls').style.display = 'none';
  showLocalResult(false, reason);
}
function updateEnvironment(envTime, dt) {
  let t = envTime % 240.0;
  let phase1 = 'day',
    phase2 = 'day',
    lerpAmt = 0;
  if (t < 60) {
    phase1 = 'day';
    phase2 = 'day';
    lerpAmt = 0;
  } else if (t < 75) {
    phase1 = 'day';
    phase2 = 'sunset';
    lerpAmt = (t - 60) / 15;
  } else if (t < 105) {
    phase1 = 'sunset';
    phase2 = 'sunset';
    lerpAmt = 0;
  } else if (t < 120) {
    phase1 = 'sunset';
    phase2 = 'night';
    lerpAmt = (t - 105) / 15;
  } else if (t < 180) {
    phase1 = 'night';
    phase2 = 'night';
    lerpAmt = 0;
  } else if (t < 195) {
    phase1 = 'night';
    phase2 = 'sunrise';
    lerpAmt = (t - 180) / 15;
  } else if (t < 225) {
    phase1 = 'sunrise';
    phase2 = 'sunrise';
    lerpAmt = 0;
  } else {
    phase1 = 'sunrise';
    phase2 = 'day';
    lerpAmt = (t - 225) / 15;
  }
  let dayIndex = Math.floor(envTime / 240.0);
  if (dayIndex !== weatherState.currentDayIndex) {
    weatherState.currentDayIndex = dayIndex;
    weatherState.rainPhase = dayIndex % 2 === 0 ? 'night' : 'day';
    let fixedOffset = pseudoRandom(dayIndex, dayIndex * 2) * 20.0;
    if (weatherState.rainPhase === 'day') weatherState.rainStartTime = 10.0 + fixedOffset;else weatherState.rainStartTime = 130.0 + fixedOffset;
    weatherState.rainEndTime = weatherState.rainStartTime + 45.0;
  }
  weatherState.isRaining = t >= weatherState.rainStartTime && t <= weatherState.rainEndTime;
  tempColor.copy(ENV_STATES[phase1].sky).lerp(ENV_STATES[phase2].sky, lerpAmt);
  let currentDirColor = new THREE.Color().copy(ENV_STATES[phase1].dir).lerp(ENV_STATES[phase2].dir, lerpAmt);
  let currentIntensity = ENV_STATES[phase1].intensity * (1 - lerpAmt) + ENV_STATES[phase2].intensity * lerpAmt;
  let currentHemiS = new THREE.Color().copy(ENV_STATES[phase1].hemiS).lerp(ENV_STATES[phase2].hemiS, lerpAmt);
  let currentHemiG = new THREE.Color().copy(ENV_STATES[phase1].hemiG).lerp(ENV_STATES[phase2].hemiG, lerpAmt);
  if (weatherState.isRaining) {
    rainInstancedMesh.material.opacity = Math.min(0.5, rainInstancedMesh.material.opacity + dt * 0.5);
    if (rainGain) {
      if (pendingMuted || gameState === 'GAMEOVER' || gameState === 'INTRO' || gameState === 'LEVEL_COMPLETE' || gameState === "WAITING_LOCAL") {
        rainGain.gain.value = 0;
      } else {
        rainGain.gain.value = Math.min(1.2, rainGain.gain.value + dt * 1.5);
      }
    }
    if (weatherState.rainPhase === 'day') {
      tempColor.lerp(gloomyColor, 0.7);
      currentDirColor.lerp(gloomyColor, 0.7);
      currentIntensity *= 0.6;
    } else if (weatherState.rainPhase === 'night') {
      if ((t > weatherState.nextLightningTime || weatherState.nextLightningTime > weatherState.rainEndTime) && weatherState.flashesRemaining === 0) {
        weatherState.flashesRemaining = 2 + Math.floor(Math.random() * 3);
        weatherState.flashDelayTimer = 0;
        weatherState.nextLightningTime = t + 1.0 + Math.random() * 2.0;
      }
      if (weatherState.flashesRemaining > 0) {
        weatherState.flashDelayTimer -= dt;
        if (weatherState.flashDelayTimer <= 0 && weatherState.lightningFlashAlpha <= 0.1) {
          weatherState.lightningFlashAlpha = 0.7 + Math.random() * 0.3;
          weatherState.flashDelayTimer = 0.05 + Math.random() * 0.1;
          weatherState.flashesRemaining--;
        }
      }
      if (weatherState.lightningFlashAlpha > 0) {
        tempColor.lerp(lightningColor, weatherState.lightningFlashAlpha * 0.6);
        currentDirColor.lerp(lightningColor, weatherState.lightningFlashAlpha);
        currentHemiS.lerp(lightningColor, weatherState.lightningFlashAlpha);
        currentIntensity += weatherState.lightningFlashAlpha * 4.0;
        weatherState.lightningFlashAlpha -= dt * 15.0;
        if (weatherState.lightningFlashAlpha < 0) weatherState.lightningFlashAlpha = 0;
      }
    }
  } else {
    rainInstancedMesh.material.opacity = Math.max(0, rainInstancedMesh.material.opacity - dt * 1.5);
    weatherState.lightningFlashAlpha = 0;
    if (rainGain) rainGain.gain.value = 0;
  }
  scene.background.copy(tempColor);
  scene.fog.color.copy(tempColor);
  skybox.material.color.copy(tempColor);
  dirLight.color.copy(currentDirColor);
  dirLight.intensity = currentIntensity;
  hemiLight.color.copy(currentHemiS);
  hemiLight.groundColor.copy(currentHemiG);
  let lightAngle = envTime / 240 * Math.PI * 2;
  let lX = Math.sin(lightAngle) * 60;
  let lY = Math.max(25, Math.abs(Math.cos(lightAngle)) * 80);
  dirLight.position.set(ballMesh.position.x + lX, ballMesh.position.y + lY, ballMesh.position.z + 30);
  dirLight.target.position.copy(ballMesh.position);
  dirLight.target.updateMatrixWorld();
}
function animate() {
  let now = performance.now();
  let dt = (now - lastFrameTime) / 1000;
  if (dt > 0.1) dt = 0.016;
  lastFrameTime = now;
  if (gameState === 'PLAYING') {
    gameTime += dt;
    environmentTime += dt;
  }
  updateEnvironment(environmentTime, dt);
  if (rainInstancedMesh.material.opacity > 0) {
    const dummy = new THREE.Matrix4();
    const camX = camera.position.x;
    const camY = camera.position.y;
    const camZ = camera.position.z;
    for (let i = 0; i < rainData.length; i++) {
      let p = rainData[i];
      p.y -= p.speed * dt;
      if (p.y < camY - 20) p.y += 40;
      if (p.x < camX - 20) p.x += 40;else if (p.x > camX + 20) p.x -= 40;
      if (p.z < camZ - 20) p.z += 40;else if (p.z > camZ + 20) p.z -= 40;
      dummy.makeTranslation(p.x, p.y, p.z);
      rainInstancedMesh.setMatrixAt(i, dummy);
    }
    rainInstancedMesh.instanceMatrix.needsUpdate = true;
    if (weatherState.isRaining && gameState === 'PLAYING') {
      let rayTargets = [];
      activeChunks.forEach(c => {
        if (c.mesh) rayTargets.push(c.mesh);
      });
      dynamicObjects.forEach(o => {
        if (o.group) rayTargets.push(o.group);
      });
      for (let i = 0; i < 4; i++) {
        let rx = ballMesh.position.x + (Math.random() - 0.5) * 40;
        let rz = ballMesh.position.z + (Math.random() - 0.5) * 40;
        let ry = ballMesh.position.y + 20;
        rainRaycaster.set(new THREE.Vector3(rx, ry, rz), downVector);
        let hits = rainRaycaster.intersectObjects(rayTargets, true);
        if (hits.length > 0) {
          let freeRipple = ripplePool.find(r => r.life <= 0);
          if (freeRipple) {
            freeRipple.life = 1.0;
            freeRipple.mesh.visible = true;
            freeRipple.mesh.position.copy(hits[0].point).add(hits[0].face.normal.clone().multiplyScalar(0.015));
            freeRipple.mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), hits[0].face.normal);
            freeRipple.mesh.scale.set(0.1, 0.1, 0.1);
            freeRipple.mesh.material.opacity = 0.5;
          }
        }
      }
    }
  }
  for (let i = 0; i < ripplePool.length; i++) {
    let r = ripplePool[i];
    if (r.life > 0) {
      r.life -= dt * 2.0;
      let s = 0.3 + (1.0 - r.life) * 2.5;
      r.mesh.scale.set(s, s, s);
      r.mesh.material.opacity = r.life * 0.4;
      if (r.life <= 0) r.mesh.visible = false;
    }
  }
  let isGrounded = false;
  let onRope = false;
  if (gameState === 'PLAYING') {
    for (let i = 0; i < world.contacts.length; i++) {
      if (world.contacts[i].bi === ballBody || world.contacts[i].bj === ballBody) {
        isGrounded = true;
        break;
      }
    }
    if (isGrounded) {
      lastGroundedY = ballMesh.position.y;
      let pz = ballMesh.position.z;
      for (let i = 0; i < ropeZones.length; i++) {
        if (pz <= ropeZones[i].startZ && pz >= ropeZones[i].endZ) {
          onRope = true;
          break;
        }
      }
    }
  }
  if (gameState === 'PLAYING' && isAudioInitialized && audioCtx.state === 'running') {
    let speed = Math.sqrt(ballBody.velocity.x * ballBody.velocity.x + ballBody.velocity.z * ballBody.velocity.z);
    let targetNormal = 0;
    let targetRope = 0;
    if (isGrounded && speed > 1.0) {
      let duckingFactor = weatherState.isRaining ? 0.15 : 0.85;
      let vol = Math.min(1.0, speed / 30.0) * duckingFactor;
      if (onRope) targetRope = Math.min(3.0, vol * 2.5);else targetNormal = vol;
    }
    let lerpSpeed = 12.0 * dt;
    if (normalRollGain) normalRollGain.gain.value += (targetNormal - normalRollGain.gain.value) * lerpSpeed;
    if (ropeRollGain) ropeRollGain.gain.value += (targetRope - ropeRollGain.gain.value) * lerpSpeed;
  } else if (isAudioInitialized) {
    if (normalRollGain) normalRollGain.gain.value = 0;
    if (ropeRollGain) ropeRollGain.gain.value = 0;
  }
  skybox.position.x = camera.position.x;
  skybox.position.z = camera.position.z;
  let gridX = Math.floor(camera.position.x / 20) * 20;
  let gridZ = Math.floor(camera.position.z / 20) * 20;
  if (terrainMesh.userData.lastGridX !== gridX || terrainMesh.userData.lastGridZ !== gridZ) {
    terrainMesh.userData.lastGridX = gridX;
    terrainMesh.userData.lastGridZ = gridZ;
    terrainMesh.position.set(gridX, -280, gridZ);
    waterMesh.position.set(gridX, -275, gridZ);
    const pos = terrainGeo.attributes.position;
    const cols = terrainGeo.attributes.color;
    let treeCount1 = 0,
      treeCount2 = 0,
      treeCount3 = 0;
    const dummy = new THREE.Object3D();
    for (let i = 0; i < pos.count; i++) {
      let lx = i % 41 * 20 - 400;
      let lz = Math.floor(i / 41) * 20 - 400;
      let wx = gridX + lx;
      let wz = gridZ + lz;
      let riverX = Math.sin(wz * 0.015) * 60 + Math.sin(wz * 0.04) * 20;
      let distToRiver = Math.abs(wx - riverX);
      let valley = Math.max(0, distToRiver - 12);
      let h = Math.pow(valley, 1.2) * 0.25 + Math.sin(wx * 0.05) * 4;
      h = Math.min(h, 110);
      pos.setY(i, h);
      if (h < 6) {
        cols.setXYZ(i, 0.92, 0.86, 0.7);
      } else if (h < 40) {
        cols.setXYZ(i, 0.18, 0.55, 0.34);
      } else if (h < 80) {
        cols.setXYZ(i, 0.5, 0.54, 0.55);
      } else {
        cols.setXYZ(i, 0.95, 0.95, 0.98);
      }
      let prng1 = pseudoRandom(wx, wz);
      let prng2 = pseudoRandom(wx + 100, wz + 100);
      if (h > 6 && h < 50) {
        if (prng1 > 0.12) {
          dummy.position.set(wx, -280 + h, wz);
          dummy.rotation.y = prng2 * Math.PI * 2;
          let treeScale = prng1 > 0.7 ? 2.0 + prng2 * 2.5 : 0.9 + prng2 * 1.2;
          dummy.scale.setScalar(treeScale);
          dummy.updateMatrix();
          let tType = Math.floor(prng2 * 3);
          if (tType === 0 && treeCount1 < 10000) {
            treeMesh1.setMatrixAt(treeCount1++, dummy.matrix);
          } else if (tType === 1 && treeCount2 < 10000) {
            treeMesh2.setMatrixAt(treeCount2++, dummy.matrix);
          } else if (treeCount3 < 10000) {
            treeMesh3.setMatrixAt(treeCount3++, dummy.matrix);
          }
        }
        let prng3 = pseudoRandom(wx + 50, wz + 50);
        let prng4 = pseudoRandom(wx + 200, wz + 200);
        if (prng3 > 0.25) {
          dummy.position.set(wx + (prng3 - 0.5) * 14, -280 + h, wz + (prng4 - 0.5) * 14);
          dummy.rotation.y = prng4 * Math.PI * 2;
          let treeScale = 0.7 + prng3 * 1.0;
          dummy.scale.setScalar(treeScale);
          dummy.updateMatrix();
          let tType = Math.floor(prng4 * 3);
          if (tType === 0 && treeCount1 < 10000) {
            treeMesh1.setMatrixAt(treeCount1++, dummy.matrix);
          } else if (tType === 1 && treeCount2 < 10000) {
            treeMesh2.setMatrixAt(treeCount2++, dummy.matrix);
          } else if (treeCount3 < 10000) {
            treeMesh3.setMatrixAt(treeCount3++, dummy.matrix);
          }
        }
        let prng5 = pseudoRandom(wx + 300, wz + 300);
        let prng6 = pseudoRandom(wx + 400, wz + 400);
        if (prng5 > 0.45) {
          dummy.position.set(wx + (prng5 - 0.5) * 18, -280 + h, wz + (prng6 - 0.5) * 18);
          dummy.rotation.y = prng6 * Math.PI * 2;
          let treeScale = 0.5 + prng5 * 0.8;
          dummy.scale.setScalar(treeScale);
          dummy.updateMatrix();
          let tType = Math.floor(prng5 * 3);
          if (tType === 0 && treeCount1 < 10000) {
            treeMesh1.setMatrixAt(treeCount1++, dummy.matrix);
          } else if (tType === 1 && treeCount2 < 10000) {
            treeMesh2.setMatrixAt(treeCount2++, dummy.matrix);
          } else if (treeCount3 < 10000) {
            treeMesh3.setMatrixAt(treeCount3++, dummy.matrix);
          }
        }
      }
    }
    treeMesh1.count = treeCount1;
    treeMesh1.instanceMatrix.needsUpdate = true;
    treeMesh2.count = treeCount2;
    treeMesh2.instanceMatrix.needsUpdate = true;
    treeMesh3.count = treeCount3;
    treeMesh3.instanceMatrix.needsUpdate = true;
    pos.needsUpdate = true;
    cols.needsUpdate = true;
    terrainGeo.computeVertexNormals();
  }
  dynamicObjects.forEach(obj => {
    if (obj.type === 'piston') {
      const movePhase = (Math.sin(gameTime * 3.7 + obj.offset) + 1) / 2;
      const headX = obj.side * (-2.75 + movePhase * 5.45);
      obj.pushGroup.position.x = headX;
      obj.body.position.x = obj.baseX + headX;
      const baseCenterX = obj.side * 4.5;
      const rodLength = Math.abs(headX - baseCenterX);
      obj.rodMesh.scale.x = rodLength;
      obj.rodMesh.position.x = (headX + baseCenterX) / 2;
    } else if (obj.type === 'fan') {
      const targetAngle = gameTime * obj.speed;
      obj.body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), targetAngle);
      obj.group.quaternion.copy(obj.body.quaternion);
    } else if (obj.type === 'elevator') {
      const omega = Math.PI / 5;
      const phase = gameTime * omega + obj.offset;
      const currentY = obj.baseY + 12.5 - 15 * Math.cos(phase);
      const vy = 15 * omega * Math.sin(phase);
      const pitchOmega = 1.0;
      const pitchPhase = gameTime * pitchOmega + obj.offset * 1.5;
      const maxPitch = Math.PI / 10;
      const pitchAngle = maxPitch * Math.sin(pitchPhase);
      const angularVy = maxPitch * pitchOmega * Math.cos(pitchPhase);
      obj.body.position.y = currentY;
      obj.body.velocity.y = vy;
      obj.body.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), pitchAngle);
      obj.body.angularVelocity.set(angularVy, 0, 0);
      obj.group.position.y = currentY;
      obj.group.quaternion.copy(obj.body.quaternion);
    } else if (obj.type === 'windmill') {
      const targetAngle = gameTime * obj.speed * obj.dir + obj.offset;
      obj.body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 0, 1), targetAngle);
      obj.rotorGroup.rotation.z = targetAngle;
    } else if (obj.type === 'buzzsaw') {
      const targetAngle = gameTime * obj.speed * obj.dir + obj.offset;
      obj.group.rotation.y = -targetAngle;
      obj.sawGroup.rotation.y += 15.0 * dt * obj.dir;
      const px = obj.centerX + Math.cos(targetAngle) * obj.radius;
      const pz = obj.centerZ + Math.sin(targetAngle) * obj.radius;
      obj.body.position.set(px, obj.baseY + 0.8, pz);
    } else if (obj.type === 'sweeper') {
      let cycleTime = gameTime % 8.0;
      let currentAngle = 0;
      if (cycleTime < 2.0) {
        currentAngle = 0;
      } else if (cycleTime < 4.0) {
        let p = (cycleTime - 2.0) / 2.0;
        p = p * p * (3 - 2 * p);
        currentAngle = p * Math.PI;
      } else if (cycleTime < 6.0) {
        currentAngle = Math.PI;
      } else {
        let p = (cycleTime - 6.0) / 2.0;
        p = p * p * (3 - 2 * p);
        currentAngle = Math.PI + p * Math.PI;
      }
      obj.rotatingGroup.rotation.y = currentAngle;
      obj.rotatingBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), currentAngle);
    } else if (obj.type === 'cannon_manager') {
      if (gameState === 'PLAYING' && gameTime - obj.lastFireTime > obj.fireInterval) {
        obj.lastFireTime = gameTime;
        let lanes = [-2.0, 0, 2.0];
        let safeLane = Math.floor(Math.random() * 3);
        lanes.splice(safeLane, 1);
        if (Math.random() > 0.4 && lanes.length === 2) {
          lanes.splice(Math.floor(Math.random() * 2), 1);
        }
        lanes.forEach(x => {
          const bMesh = new THREE.Mesh(globalCannonballGeo, globalCannonballMat);
          bMesh.position.set(globalX + x, obj.baseY + 0.8, obj.zSpawn);
          bMesh.castShadow = true;
          scene.add(bMesh);
          const bBody = new CANNON.Body({
            mass: 20,
            shape: new CANNON.Sphere(0.8),
            material: defaultMat
          });
          bBody.position.copy(bMesh.position);
          bBody.velocity.set(0, 0, 45);
          bBody.angularVelocity.set(45 / 0.8, 0, 0);
          world.addBody(bBody);
          obj.projectiles.push({
            mesh: bMesh,
            body: bBody
          });
        });
      }
      for (let i = obj.projectiles.length - 1; i >= 0; i--) {
        let p = obj.projectiles[i];
        p.mesh.position.copy(p.body.position);
        p.mesh.quaternion.copy(p.body.quaternion);
        if (p.body.position.y < obj.baseY - 2 || p.body.position.z > obj.holeZ + 20) {
          scene.remove(p.mesh);
          world.removeBody(p.body);
          obj.projectiles.splice(i, 1);
        }
      }
    } else if (obj.type === 'crumbling_path') {
      if (gameState === 'PLAYING') {
        obj.slabs.forEach(slab => {
          if (slab.state === 0) {
            let distZ = Math.abs(ballMesh.position.z - slab.initialPos.z);
            let distX = Math.abs(ballMesh.position.x - slab.initialPos.x);
            if (distZ < 2.0 && distX < 4.0) {
              slab.state = 1;
              slab.timer = 0.25;
            }
          } else if (slab.state === 1) {
            slab.timer -= dt;
            slab.mesh.position.y = slab.initialPos.y + (Math.random() - 0.5) * 0.04;
            if (slab.timer <= 0) {
              slab.state = 2;
              world.removeBody(slab.body);
            }
          } else if (slab.state === 2) {
            slab.fallVelocity += 25.0 * dt;
            slab.mesh.position.y -= slab.fallVelocity * dt;
            slab.mesh.rotation.x += dt * 1.5;
            if (slab.mesh.position.y < obj.baseY - 40.0) {
              slab.mesh.visible = false;
            }
          }
        });
      }
    }
  });
  const skinDynTime = now / 1000;
  if (ballMesh.userData) {
    if (ballMesh.userData.isUFO) {
      ballMesh.userData.ring1.rotation.x += 0.05;
      ballMesh.userData.ring2.rotation.y += 0.05;
    }
    if (ballMesh.userData.isQuantum) {
      let beatTime = skinDynTime * 1.2 % 1.0;
      let s = 1.0;
      if (beatTime < 0.15) s = 1.0 + Math.sin(beatTime * Math.PI / 0.15) * 0.25;else if (beatTime > 0.25 && beatTime < 0.4) s = 1.0 + Math.sin((beatTime - 0.25) * Math.PI / 0.15) * 0.15;
      ballMesh.userData.core.scale.set(s, s, s);
      ballMesh.userData.rings[0].rotation.x += 0.02;
      ballMesh.userData.rings[0].rotation.y += 0.01;
      ballMesh.userData.rings[1].rotation.y -= 0.03;
      ballMesh.userData.rings[1].rotation.z += 0.02;
      ballMesh.userData.rings[2].rotation.x -= 0.01;
      ballMesh.userData.rings[2].rotation.z -= 0.02;
    }
    if (ballMesh.userData.isBomb) {
      ballMesh.userData.sparks.rotation.y += 0.5;
      let s = 1 + Math.sin(skinDynTime * 20) * 0.2;
      ballMesh.userData.sparks.scale.set(s, s, s);
    }
    if (ballMesh.userData.isSlime) {
      const pos = ballMesh.userData.slimeGeo.attributes.position;
      const orig = ballMesh.userData.slimeGeo.userData.origPos;
      for (let i = 0; i < pos.count; i++) {
        let ox = orig.getX(i),
          oy = orig.getY(i),
          oz = orig.getZ(i);
        let scale = 1 + Math.sin(skinDynTime * 5 + ox * 5 + oy * 5) * 0.05 + Math.cos(skinDynTime * 3 + oz * 4) * 0.05;
        pos.setXYZ(i, ox * scale, oy * scale, oz * scale);
      }
      pos.needsUpdate = true;
      ballMesh.userData.slimeGeo.computeVertexNormals();
    }
    if (ballMesh.userData.isGlitch) {
      if (Math.random() > 0.7) {
        ballMesh.userData.cyan.position.set((Math.random() - 0.5) * 0.1, (Math.random() - 0.5) * 0.1, (Math.random() - 0.5) * 0.1);
        ballMesh.userData.magenta.position.set((Math.random() - 0.5) * 0.1, (Math.random() - 0.5) * 0.1, (Math.random() - 0.5) * 0.1);
      } else {
        ballMesh.userData.cyan.position.set(0, 0, 0);
        ballMesh.userData.magenta.position.set(0, 0, 0);
      }
      if (Math.random() > 0.9) {
        let s = 1.0 + (Math.random() - 0.5) * 0.3;
        ballMesh.scale.set(1.0, s, 1.0);
      } else {
        ballMesh.scale.set(1, 1, 1);
      }
      if (Math.random() > 0.8) {
        const glitchBox = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.15, 0.15), new THREE.MeshBasicMaterial({
          color: Math.random() > 0.5 ? 0x00ffff : 0xff00ff
        }));
        glitchBox.position.copy(ballMesh.position);
        glitchBox.position.x += (Math.random() - 0.5) * 1.5;
        glitchBox.position.y += (Math.random() - 0.5) * 1.5;
        glitchBox.position.z += (Math.random() - 0.5) * 1.5;
        scene.add(glitchBox);
        skinParticles.push(glitchBox);
      }
    }
    for (let i = skinParticles.length - 1; i >= 0; i--) {
      let p = skinParticles[i];
      p.scale.multiplyScalar(0.7);
      if (p.scale.x < 0.01) {
        scene.remove(p);
        p.geometry.dispose();
        p.material.dispose();
        skinParticles.splice(i, 1);
      }
    }
  }
  if (gameState === 'PLAYING') {
    timeLeft -= dt;
    if (timeLeft <= 0 || ballMesh.position.y < lastGroundedY - 120.0) {
      timeLeft = 0;
      finalStars = 0;
      gameState = 'GAMEOVER';
      showLocalResult(false, "Time expired or ball fell");
    }
    updateUI();
    if (accumulatedDx !== 0 || accumulatedDy !== 0) {
      let inputAmp = window.innerWidth < 800 ? 2.0 : 1.0;
      let rawDx = accumulatedDx * inputAmp;
      let rawDy = accumulatedDy * inputAmp;
      const maxSwipe = 60;
      let pushX = Math.max(-maxSwipe, Math.min(maxSwipe, rawDx));
      let pushY = Math.max(-maxSwipe, Math.min(maxSwipe, rawDy));
      ballBody.wakeUp();
      ballBody.velocity.x += pushX * 0.245;
      ballBody.velocity.z += pushY * 0.25;
      accumulatedDx = 0;
      accumulatedDy = 0;
    }
    let currentSpeed = Math.sqrt(ballBody.velocity.x * ballBody.velocity.x + ballBody.velocity.z * ballBody.velocity.z);
    let drag = 1 - Math.min(0.06, currentSpeed * 0.0015);
    let frameFriction = drag * 0.987;
    let timeCorrectedFriction = Math.pow(frameFriction, 60 * dt);
    ballBody.velocity.x *= timeCorrectedFriction;
    ballBody.velocity.z *= timeCorrectedFriction;
    if (ballBody.velocity.z < -60) ballBody.velocity.z = -60;
    if (ballBody.velocity.z > 20) ballBody.velocity.z = 20;
    if (ballBody.velocity.x < -40) ballBody.velocity.x = -40;
    if (ballBody.velocity.x > 40) ballBody.velocity.x = 40;
    for (let i = 0; i < checkpoints.length; i++) {
      let cp = checkpoints[i];
      if (cp.active && cp.gemMesh) {
        cp.gemMesh.rotation.y += 2.0 * dt;
        cp.gemMesh.position.y = cp.y + 2.5 + Math.sin(gameTime * 3) * 0.3;
      }
      let distToCenter = Math.sqrt(Math.pow(ballMesh.position.x - cp.x, 2) + Math.pow(ballMesh.position.z - cp.z, 2));
      let verticalDist = Math.abs(ballMesh.position.y - cp.y);
      if (cp.active && cp.isFinish && verticalDist < 4.0 && distToCenter < 3.5) {
        cp.active = false;
        let percentLeft = timeLeft / levelTimeLimit * 100;
        if (percentLeft >= 30) finalStars = 3;else if (percentLeft >= 15) finalStars = 2;else finalStars = 1;
        const emeraldHex = 0x2ecc71;
        cp.meshes[0].material.color.setHex(emeraldHex);
        cp.meshes[1].material.color.setHex(0x27ae60);
        if (cp.gemMesh) {
          cp.gemMesh.material.color.setHex(emeraldHex);
          cp.gemMesh.material.emissive.setHex(emeraldHex);
          cp.gemMesh.material.emissiveIntensity = 1.5;
        }
        if (cp.gemRing) {
          cp.gemRing.material.color.setHex(emeraldHex);
          cp.gemRing.material.emissive.setHex(emeraldHex);
          cp.gemRing.material.emissiveIntensity = 1.0;
        }
        if (cp.neonTrims) {
          cp.neonTrims.forEach(trim => {
            trim.material.color.setHex(emeraldHex);
            trim.material.emissive.setHex(emeraldHex);
            trim.material.emissiveIntensity = 1.0;
          });
        }
        if (cp.stoneParts) {
          cp.stoneParts.forEach(part => {
            part.material.color.setHex(0xffd700);
            part.material.emissive.setHex(0xffaa00);
            part.material.emissiveIntensity = 0.5;
            part.material.metalness = 0.8;
            part.material.roughness = 0.2;
          });
        }
        for (let f = 0; f < 120; f++) {
          const colors = [0x2ecc71, 0x27ae60, 0xf1c40f, 0xffffff, 0xa4de02];
          const c = colors[Math.floor(originalMathRandom() * colors.length)];
          const fwMesh = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.4, 0.4), new THREE.MeshBasicMaterial({
            color: c
          }));
          fwMesh.position.set(cp.x, cp.y + 2.0, cp.z);
          let u = originalMathRandom();
          let v = originalMathRandom();
          let theta = u * 2.0 * Math.PI;
          let phi = Math.acos(2.0 * v - 1.0);
          let speed = 25 + originalMathRandom() * 30;
          fwMesh.userData = {
            vx: Math.sin(phi) * Math.cos(theta) * speed,
            vy: Math.sin(phi) * Math.sin(theta) * speed + 15,
            vz: Math.cos(phi) * speed
          };
          scene.add(fwMesh);
          fireworks.push(fwMesh);
        }
        gameState = 'LEVEL_COMPLETE';
        finishTimer = 1.5;
        if (window.playGoalSound) window.playGoalSound();
      }
    }
    world.step(1 / 60);
  }
  if (gameState === 'LEVEL_COMPLETE') {
    finishTimer -= dt;
    ballBody.velocity.x *= 0.90;
    ballBody.velocity.z *= 0.90;
    world.step(1 / 60);
    fireworks.forEach(fw => {
      fw.position.x += fw.userData.vx * dt;
      fw.position.y += fw.userData.vy * dt;
      fw.position.z += fw.userData.vz * dt;
      fw.userData.vy -= 60 * dt;
      fw.rotation.x += 10 * dt;
      fw.rotation.y += 10 * dt;
      fw.scale.multiplyScalar(0.96);
    });
    if (finishTimer <= 0) {
      gameState = "WAITING_LOCAL";
      showLocalResult(true, "");
    }
  }
  if (gameState === 'INTRO') {
    introSpinAngle += 0.02;
    ballMesh.position.set(0, 5.8, 5);
    if (ballMesh.userData && ballMesh.userData.keepUpright) {
      ballMesh.rotation.y = introSpinAngle;
    } else if (skins[currentSkinIndex].type === "eyeball" && ballMesh.children[0]) {
      ballMesh.children[0].rotation.y = Math.sin(introSpinAngle) * 0.5;
    } else {
      ballMesh.rotation.y = introSpinAngle;
      ballMesh.rotation.x = introSpinAngle * 0.5;
    }
  } else {
    ballMesh.position.copy(ballBody.position);
    const deltaPos = new THREE.Vector3().copy(ballBody.position).sub(previousBallPos);
    const distXZ = Math.sqrt(deltaPos.x * deltaPos.x + deltaPos.z * deltaPos.z);
    if (gameState === 'PLAYING') {
      if (ballMesh.userData && ballMesh.userData.keepUpright) {
        if (distXZ > 0.005) {
          let targetYaw = Math.atan2(deltaPos.x, deltaPos.z);
          let deltaAngle = (targetYaw - currentYaw) % (Math.PI * 2);
          if (deltaAngle > Math.PI) deltaAngle -= Math.PI * 2;
          if (deltaAngle < -Math.PI) deltaAngle += Math.PI * 2;
          currentYaw += deltaAngle * 0.25;
          ballMesh.quaternion.identity();
          ballMesh.rotateY(currentYaw);
        }
      } else {
        if (distXZ > 0.005) {
          let targetYaw = Math.atan2(deltaPos.x, deltaPos.z);
          let deltaAngle = (targetYaw - currentYaw) % (Math.PI * 2);
          if (deltaAngle > Math.PI) deltaAngle -= Math.PI * 2;
          if (deltaAngle < -Math.PI) deltaAngle += Math.PI * 2;
          currentYaw += deltaAngle * 0.25;
          rollAngle += distXZ / 0.8;
          ballMesh.quaternion.identity();
          ballMesh.rotateY(currentYaw);
          ballMesh.rotateX(rollAngle);
        }
      }
    }
  }
  previousBallPos.copy(ballBody.position);
  for (let i = activeChunks.length - 1; i >= 0; i--) {
    let chunk = activeChunks[i];
    if (chunk.endZ > safeRespawnPos.z + 50) {
      if (chunk.mesh) {
        scene.remove(chunk.mesh);
        chunk.mesh.traverse(child => {
          if (child.geometry) child.geometry.dispose();
        });
      }
      for (let j = ropeZones.length - 1; j >= 0; j--) {
        if (ropeZones[j].endZ > safeRespawnPos.z + 50) ropeZones.splice(j, 1);
      }
      if (chunk.body) world.removeBody(chunk.body);
      if (chunk.mesh && chunk.mesh.userData && chunk.mesh.userData.physicsBodies) {
        chunk.mesh.userData.physicsBodies.forEach(b => world.removeBody(b));
      }
      activeChunks.splice(i, 1);
    }
  }
  for (let i = dynamicObjects.length - 1; i >= 0; i--) {
    let obj = dynamicObjects[i];
    let isBehind = false;
    if (obj.body) {
      isBehind = obj.body.position.z > safeRespawnPos.z + 50;
    } else if (obj.type === 'cannon_manager') {
      isBehind = obj.baseZ > safeRespawnPos.z + 50;
    } else if (obj.type === 'sweeper') {
      isBehind = obj.centerZ > safeRespawnPos.z + 50;
    } else if (obj.type === 'crumbling_path') {
      isBehind = obj.endZ > safeRespawnPos.z + 50;
    }
    if (isBehind) {
      if (obj.group) scene.remove(obj.group);
      if (obj.body) world.removeBody(obj.body);
      if (obj.staticBody) world.removeBody(obj.staticBody);
      if (obj.rotatingBody) world.removeBody(obj.rotatingBody);
      if (obj.projectiles) {
        obj.projectiles.forEach(p => {
          scene.remove(p.mesh);
          world.removeBody(p.body);
        });
      }
      if (obj.type === 'piston') pistonPool.push(obj);else if (obj.type === 'fan') fanPool.push(obj);else if (obj.type === 'elevator') elevatorPool.push(obj);else if (obj.type === 'poles15_downhill') polesPool.push(obj);else if (obj.type === 'windmill') windmillPool.push(obj);else if (obj.type === 'buzzsaw') buzzsawPool.push(obj);else if (obj.type === 'sweeper') sweeperPool.push(obj);else if (obj.type === 'crumbling_path') {
        if (obj.slabs) {
          obj.slabs.forEach(s => {
            if (s.state < 2 && s.body) world.removeBody(s.body);
          });
        }
        crumblingPool.push(obj);
      }
      dynamicObjects.splice(i, 1);
    }
  }
  for (let i = checkpoints.length - 1; i >= 0; i--) {
    let cp = checkpoints[i];
    if (cp.z > safeRespawnPos.z + 50 && !cp.active) {
      cp.meshes.forEach(m => {
        scene.remove(m);
        if (m.geometry) m.geometry.dispose();
      });
      if (cp.gemMesh) {
        scene.remove(cp.gemMesh);
        if (cp.gemMesh.geometry) cp.gemMesh.geometry.dispose();
        if (cp.gemMesh.material) cp.gemMesh.material.dispose();
      }
      checkpoints.splice(i, 1);
    }
  }
  const rayFrom = new CANNON.Vec3().copy(ballBody.position);
  const fallRayTo = new CANNON.Vec3(rayFrom.x, rayFrom.y - 5.0, rayFrom.z);
  const fallRayResult = new CANNON.RaycastResult();
  world.raycastClosest(rayFrom, fallRayTo, {}, fallRayResult);
  let isFalling = !fallRayResult.hasHit && ballMesh.position.y < globalY - 5.0 && ballBody.velocity.y < -5.0;
  let targetCamPos, lookTarget;
  if (gameState === 'INTRO') {
    targetCamPos = new THREE.Vector3(0, 7.0, 14.5);
    lookTarget = new THREE.Vector3(0, 5.5, 5);
    camera.position.lerp(targetCamPos, 0.1);
  } else if (isFalling) {
    targetCamPos = new THREE.Vector3(camera.position.x * 0.95 + ballMesh.position.x * 0.05, camera.position.y - 0.2, ballMesh.position.z + 10);
    lookTarget = ballMesh.position.clone();
    camera.position.lerp(targetCamPos, 0.1);
  } else {
    targetCamPos = ballMesh.position.clone().add(new THREE.Vector3(0, 8.5, 13.0));
    lookTarget = ballMesh.position.clone();
    lookTarget.z -= 8.5;
    camera.position.lerp(targetCamPos, 0.15);
  }
  camera.lookAt(lookTarget);
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}