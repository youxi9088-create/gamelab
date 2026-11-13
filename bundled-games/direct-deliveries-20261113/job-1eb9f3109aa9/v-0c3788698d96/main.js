// Viktor Vega: The Setup — 1994-style cinematic action
const W = 960;
const H = 540;
const WH = 1040;
const GROUND = 1000;
const F1 = 730;
const F2 = 460;
const WORLD_R = 6880;
const GRAV = 2100;
const CRATE = 64;
const SLASH = 0.3;

const container = document.getElementById('game-container');
const canvas = document.createElement('canvas');
canvas.width = W;
canvas.height = H;
canvas.style.imageRendering = 'pixelated';
container.appendChild(canvas);
let ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

// Pixel-art sprite pipeline: characters render at half resolution, get a hard
// 1px ink outline + rim light, then blit back at 2x with nearest filtering.
const PX = 2;
const RIG_W = 220;
const RIG_H = 260;
const RIG_OX = 110;
const RIG_OY = 215;
const mkCanvas = () => {
  const c = document.createElement('canvas');
  c.width = RIG_W;
  c.height = RIG_H;
  const g = c.getContext('2d');
  g.imageSmoothingEnabled = false;
  return [c, g];
};
const [rigCanvas, rigCtx] = mkCanvas();
const [inkCanvas, inkCtx] = mkCanvas();
const [outCanvas, outCtx] = mkCanvas();

function resize() {
  const s = Math.min(innerWidth / W, innerHeight / H);
  canvas.style.width = W * s + 'px';
  canvas.style.height = H * s + 'px';
  canvas.style.margin = `${(innerHeight - H * s) / 2}px auto 0`;
}
addEventListener('resize', resize);
resize();

function loadImg(src) {
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.src = src;
  return img;
}
const IMG = {
  aim: loadImg('assets/viktor-v2.webp'),
  thug: loadImg('assets/thug-v2.webp'),
  enforcer: loadImg('assets/enforcer-v2.webp'),
  crate: loadImg('assets/crate.webp'),
  bg: loadImg('assets/warehouse-bg.webp'),
};
const ready = (img) => img.complete && img.naturalWidth > 0;
const lerp = (a, b, k) => a + (b - a) * k;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const easeOut = (k) => 1 - Math.pow(1 - k, 3);

// ---------- Audio ----------
const music = new Audio('assets/audio/music-hiphop.mp3');
music.loop = true;
music.volume = 0.45;
const sfx = {
  gun: 'assets/audio/gunshot.mp3',
  hit: 'assets/audio/hit.mp3',
  shotgun: 'assets/audio/shotgun.mp3',
  crate: 'assets/audio/crate-break.mp3',
};
const pools = {};
for (const k in sfx) pools[k] = { list: [0, 1, 2, 3].map(() => new Audio(sfx[k])), i: 0 };
let muted = false;
let actx = null;
function play(name, vol = 0.6) {
  if (muted) return;
  const p = pools[name];
  const a = p.list[p.i++ % p.list.length];
  a.volume = clamp(vol, 0, 1);
  a.currentTime = 0;
  a.play().catch(() => {});
}
function beep(freq, dur, type = 'square', vol = 0.06, slide = 0.3) {
  if (muted || !actx) return;
  const o = actx.createOscillator();
  const g = actx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, actx.currentTime);
  o.frequency.exponentialRampToValueAtTime(Math.max(20, freq * slide), actx.currentTime + dur);
  g.gain.setValueAtTime(vol, actx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + dur);
  o.connect(g).connect(actx.destination);
  o.start();
  o.stop(actx.currentTime + dur);
}
function noise(dur, f0, f1, vol = 0.3) {
  if (muted || !actx) return;
  const len = Math.floor(actx.sampleRate * dur);
  const buf = actx.createBuffer(1, len, actx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = actx.createBufferSource();
  src.buffer = buf;
  const f = actx.createBiquadFilter();
  f.type = 'bandpass';
  f.frequency.setValueAtTime(f0, actx.currentTime);
  f.frequency.exponentialRampToValueAtTime(f1, actx.currentTime + dur);
  const g = actx.createGain();
  g.gain.value = vol;
  src.connect(f).connect(g).connect(actx.destination);
  src.start();
}
const swish = () => noise(0.18, 3000, 600, 0.35);

// ---------- Input ----------
const keys = {};
const pressed = {};
addEventListener('keydown', (e) => {
  if (!actx) actx = new AudioContext();
  if (!keys[e.code]) pressed[e.code] = true;
  keys[e.code] = true;
  if (e.code === 'KeyM') {
    muted = !muted;
    music.muted = muted;
  }
  if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) e.preventDefault();
});
addEventListener('keyup', (e) => {
  keys[e.code] = false;
});
const down = (...c) => c.some((k) => keys[k]);
const hit = (...c) => c.some((k) => pressed[k]);
const JUMP = ['Space', 'KeyW', 'ArrowUp'];

// ---------- Rigs (sprite torso/arm + articulated legs) ----------
const RIG = {
  viktor: { img: IMG.aim, ratio: 417 / 939, h: 92, anchor: 0.28, bodyX: 0.48, bodyB: 0.56, armX: 0.48, armY0: 0.135, armY1: 0.255,
    piv: [0.27, 0.18], muz: [1.0, 0.16], legTop: 0.53, legW: 9, pants: '#3e4048', pantsB: '#26272e', crease: '#5d616c', shoe: '#0b0b0e', coat: '#3a3c44', coatD: '#202127' },
  thug: { img: IMG.thug, ratio: 394 / 907, h: 100, anchor: 0.25, bodyX: 0.54, bodyB: 0.75, armX: 0.54, armY0: 0.135, armY1: 0.275,
    piv: [0.24, 0.19], muz: [1.0, 0.16], legTop: 0.68, legW: 9, pants: '#1d2333', pantsB: '#11141d', crease: '#323a50', shoe: '#3a1c10', coat: '#6a4024', coatD: '#3e2414', tail: [4, 8, 16] },
  boss: { img: IMG.enforcer, ratio: 531 / 925, h: 130, anchor: 0.28, bodyX: 0.5, bodyB: 0.8, armX: 0.5, armY0: 0.14, armY1: 0.29,
    piv: [0.28, 0.19], muz: [1.0, 0.17], legTop: 0.73, legW: 13, pants: '#15171c', pantsB: '#0b0c0f', crease: '#2a2e36', shoe: '#08080a', coat: '#23262e', coatD: '#101216', tail: [6, 10, 24] },
};
const legLen = (R) => (1 - R.legTop) * R.h;
const rigDW = (R) => R.h * (ready(R.img) ? R.img.naturalWidth / R.img.naturalHeight : R.ratio);

function rigPoint(R, x, y, dir, pose) {
  const dw = rigDW(R);
  const mx = (R.muz[0] - R.piv[0]) * dw + (pose.armOff || 0);
  const my = (R.muz[1] - R.piv[1]) * R.h;
  const a = pose.arm || 0;
  let rx = mx * Math.cos(a) - my * Math.sin(a);
  let ry = mx * Math.sin(a) + my * Math.cos(a);
  rx += (R.piv[0] - R.anchor) * dw;
  ry += (R.piv[1] - R.legTop) * R.h;
  const t = pose.torso || 0;
  const tx = rx * Math.cos(t) - ry * Math.sin(t);
  const ty = rx * Math.sin(t) + ry * Math.cos(t);
  return { x: x + dir * (tx + (pose.hipX || 0)), y: y + ty + pose.hipY };
}

function drawLeg(R, hx, hy, foot, L, color) {
  let fx = foot[0];
  let fy = foot[1];
  let dx = fx - hx;
  let dy = fy - hy;
  let d = Math.max(0.01, Math.hypot(dx, dy));
  const maxD = L - 0.5;
  if (d > maxD) {
    fx = hx + (dx / d) * maxD;
    fy = hy + (dy / d) * maxD;
    dx = fx - hx;
    dy = fy - hy;
    d = maxD;
  }
  const half = L / 2;
  const hh = Math.sqrt(Math.max(0, half * half - (d / 2) * (d / 2)));
  let nx = -dy / d;
  let ny = dx / d;
  if (nx < 0) {
    nx = -nx;
    ny = -ny;
  }
  const kx = Math.round(hx + dx / 2 + nx * hh);
  const ky = Math.round(hy + dy / 2 + ny * hh);
  fx = Math.round(fx);
  fy = Math.round(fy);
  // tapered trouser segments as solid polygons (hip wide -> knee -> ankle narrow)
  const seg = (ax, ay, bx, by, w0, w1, col) => {
    const l = Math.max(0.01, Math.hypot(bx - ax, by - ay));
    const px = -(by - ay) / l;
    const py = (bx - ax) / l;
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.moveTo(ax + px * w0, ay + py * w0);
    ctx.lineTo(bx + px * w1, by + py * w1);
    ctx.lineTo(bx - px * w1, by - py * w1);
    ctx.lineTo(ax - px * w0, ay - py * w0);
    ctx.closePath();
    ctx.fill();
  };
  const w = R.legW / 2;
  seg(hx, hy - 2, kx, ky, w + 1, w, color);
  seg(kx, ky, fx, fy - 4, w, w - 1, color);
  ctx.beginPath();
  ctx.arc(kx, ky, w, 0, Math.PI * 2);
  ctx.fill();
  // front crease highlight + back shadow
  ctx.lineCap = 'butt';
  ctx.strokeStyle = R.crease;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(hx + w * 0.4, hy);
  ctx.lineTo(kx + w * 0.5, ky);
  ctx.lineTo(fx + w * 0.4, fy - 5);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath();
  ctx.moveTo(hx - w + 1, hy);
  ctx.lineTo(kx - w + 1, ky);
  ctx.lineTo(fx - w + 1, fy - 5);
  ctx.stroke();
  // knee fold when bent
  if (Math.abs(kx - (hx + fx) / 2) > 3) {
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.fillRect(kx - 2, ky - 1, 4, 2);
  }
  // shoe: heel, sole, rounded toe, shine
  const sw = R.legW * 1.75;
  const x0 = Math.round(fx - w - 1);
  ctx.fillStyle = R.shoe;
  ctx.fillRect(x0, fy - 6, sw - 3, 6);
  ctx.fillRect(x0 + sw - 3, fy - 4, 3, 4);
  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.fillRect(x0, fy - 1, sw, 1);
  ctx.fillStyle = 'rgba(255,255,255,0.28)';
  ctx.fillRect(x0 + sw - 6, fy - 5, 3, 1);
}

function drawSwordArm(ang) {
  ctx.save();
  ctx.rotate(ang);
  ctx.fillStyle = '#3a3d45';
  ctx.fillRect(0, -5, 22, 10);
  ctx.fillStyle = '#e8e8e0';
  ctx.fillRect(21, -4, 3, 8);
  ctx.fillStyle = '#c08a68';
  ctx.fillRect(24, -4, 7, 8);
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(18, -2, 12, 4);
  ctx.fillStyle = '#9a7a30';
  ctx.fillRect(30, -6, 3, 12);
  ctx.fillStyle = '#d8e4ee';
  ctx.beginPath();
  ctx.moveTo(33, -2);
  ctx.lineTo(86, -2);
  ctx.lineTo(92, 1);
  ctx.lineTo(33, 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(34, -2, 50, 1);
  ctx.restore();
}

function drawRig(R, x, y, dir, pose, o = {}) {
  if (!ready(R.img)) return;
  const main = ctx;
  rigCtx.setTransform(1, 0, 0, 1, 0, 0);
  rigCtx.clearRect(0, 0, RIG_W, RIG_H);
  rigCtx.setTransform(1 / PX, 0, 0, 1 / PX, RIG_OX, RIG_OY);
  ctx = rigCtx;
  try {
    drawRigRaw(R, 0, 0, dir, pose, { ...o, alpha: undefined });
  } finally {
    ctx = main;
  }
  // silhouette -> ink
  inkCtx.globalCompositeOperation = 'source-over';
  inkCtx.clearRect(0, 0, RIG_W, RIG_H);
  inkCtx.drawImage(rigCanvas, 0, 0);
  inkCtx.globalCompositeOperation = 'source-in';
  inkCtx.fillStyle = '#07060b';
  inkCtx.fillRect(0, 0, RIG_W, RIG_H);
  // compose: outline (4-dir), sprite, rim light on top/front edges
  outCtx.globalCompositeOperation = 'source-over';
  outCtx.clearRect(0, 0, RIG_W, RIG_H);
  outCtx.drawImage(inkCanvas, -1, 0);
  outCtx.drawImage(inkCanvas, 1, 0);
  outCtx.drawImage(inkCanvas, 0, -1);
  outCtx.drawImage(inkCanvas, 0, 1);
  outCtx.drawImage(rigCanvas, 0, 0);
  if (!o.white) {
    // inner shadow along the bottom/back edge for chunkier 16-bit shading
    outCtx.globalCompositeOperation = 'source-atop';
    outCtx.globalAlpha = 0.35;
    outCtx.drawImage(inkCanvas, -dir, -1);
    outCtx.globalAlpha = 1;
    outCtx.globalCompositeOperation = 'source-over';
  }
  main.save();
  if (o.alpha !== undefined) main.globalAlpha = clamp(o.alpha, 0, 1);
  main.imageSmoothingEnabled = false;
  main.drawImage(outCanvas, Math.round(x) - RIG_OX * PX, Math.round(y) - RIG_OY * PX, RIG_W * PX, RIG_H * PX);
  main.restore();
}

function drawCoat(R, pose) {
  const f = pose.flap || 0;
  ctx.save();
  ctx.translate(pose.hipX || 0, pose.hipY);
  ctx.rotate(pose.torso || 0);
  if (R.tail) {
    // long coat: back panel swings out behind the legs
    const [top, len, back] = R.tail;
    const bx = -back + f * len * 0.8;
    const by = top + len - Math.abs(f) * len * 0.3;
    ctx.fillStyle = R.coatD;
    ctx.beginPath();
    ctx.moveTo(-back + 2, top - 6);
    ctx.lineTo(4, top - 6);
    ctx.lineTo(2, top + len * 0.6);
    ctx.lineTo(bx, by);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = R.coat;
    ctx.fillRect(Math.round(bx), Math.round(by) - 2, 6, 2);
    ctx.restore();
    return;
  }
  const bx = -10 + f * 12;
  const by = 12 - Math.abs(f) * 4;
  ctx.fillStyle = R.coat;
  ctx.beginPath();
  ctx.moveTo(-9, -4);
  ctx.lineTo(8, -4);
  ctx.lineTo(9, 9);
  ctx.lineTo(1, 10);
  ctx.lineTo(bx, by);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = R.coatD;
  ctx.beginPath();
  ctx.moveTo(-9, -4);
  ctx.lineTo(-3, -4);
  ctx.lineTo(-1, 10);
  ctx.lineTo(bx, by);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = R.crease;
  ctx.fillRect(1, -2, 2, 11);
  ctx.restore();
}

function drawRigRaw(R, x, y, dir, pose, o = {}) {
  const img = R.img;
  if (!ready(img)) return;
  const iw = img.naturalWidth;
  const ih = img.naturalHeight;
  const dw = rigDW(R);
  const L = legLen(R);
  ctx.save();
  ctx.translate(Math.round(x), Math.round(y));
  if (o.alpha !== undefined) ctx.globalAlpha = clamp(o.alpha, 0, 1);
  if (o.clip) {
    ctx.beginPath();
    ctx.rect(-300, -400, 600, 400);
    ctx.clip();
  }
  ctx.scale(dir, 1);
  if (pose.rot) ctx.rotate(pose.rot);
  if (pose.sx || pose.sy) ctx.scale(pose.sx || 1, pose.sy || 1);
  if (o.sink) ctx.translate(0, o.sink);
  if (o.white) ctx.filter = 'brightness(3.5) saturate(0)';
  else if (o.filter) ctx.filter = o.filter;
  const hx = pose.hipX || 0;
  const hy = pose.hipY;
  drawLeg(R, hx - 3, hy, pose.feet[1], L, R.pantsB);
  drawLeg(R, hx + 1, hy, pose.feet[0], L, R.pants);
  if (R.coat) drawCoat(R, pose);
  ctx.save();
  ctx.translate(hx, hy);
  ctx.rotate(pose.torso || 0);
  ctx.drawImage(img, 0, 0, R.bodyX * iw, R.bodyB * ih, -R.anchor * dw, -R.legTop * R.h, R.bodyX * dw, R.bodyB * R.h);
  ctx.translate((R.piv[0] - R.anchor) * dw, (R.piv[1] - R.legTop) * R.h);
  if (pose.sword !== undefined) {
    drawSwordArm(pose.sword);
  } else {
    ctx.rotate(pose.arm || 0);
    ctx.translate(pose.armOff || 0, 0);
    ctx.drawImage(img, R.armX * iw, R.armY0 * ih, (1 - R.armX) * iw, (R.armY1 - R.armY0) * ih,
      (R.armX - R.piv[0]) * dw, (R.armY0 - R.piv[1]) * R.h, (1 - R.armX) * dw, (R.armY1 - R.armY0) * R.h);
  }
  ctx.restore();
  ctx.restore();
}

function walkFeet(ph, S, lift) {
  const fr = Math.floor(ph * 8) % 8;
  const a = (fr / 8) * Math.PI * 2;
  return {
    a,
    feet: [
      [S * Math.sin(a), -Math.max(0, Math.cos(a)) * lift],
      [S * Math.sin(a + Math.PI), -Math.max(0, Math.cos(a + Math.PI)) * lift],
    ],
  };
}

// ---------- World data ----------
const SECTIONS = [
  { x1: 1400, name: 'LOADING DOCK', tint: [70, 35, 10], lamp: '255,170,60', style: 'sodium' },
  { x1: 2900, name: 'STORAGE COMPLEX', tint: [10, 55, 45], lamp: '160,255,215', style: 'fluoro' },
  { x1: 4280, name: 'SECURITY OFFICES', tint: [45, 42, 30], lamp: '225,235,255', style: 'office' },
  { x1: 5880, name: 'INDUSTRIAL MACHINERY', tint: [75, 5, 5], lamp: '255,50,35', style: 'alarm' },
  { x1: 99999, name: "THE ENFORCER'S STRONGHOLD", tint: [15, 25, 75], lamp: '140,170,255', style: 'cold' },
];
const secIndex = (x) => SECTIONS.findIndex((s) => x < s.x1);

let seed = 7;
const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const mids = [];
for (let px = 0; px < WORLD_R * 0.6 + W; ) {
  const w = 60 + rnd() * 130;
  mids.push({ x: px, w, h: 110 + rnd() * 210, sec: secIndex(px / 0.6), v: rnd() });
  px += w + 20 + rnd() * 70;
}

const lamps = [
  [180, 560, 1000], [560, 560, 1000], [900, 750, 1000], [1250, 750, 1000], [1000, 420, 730],
  [1550, 750, 1000], [1950, 750, 1000], [2300, 750, 1000], [2700, 750, 1000], [1750, 480, 730], [2150, 480, 730],
  [2600, 420, 730], [1850, 200, 460], [2250, 200, 460], [1500, 350, 460],
  [3120, 750, 1000], [3550, 750, 1000], [4050, 750, 1000], [3150, 480, 730], [3800, 480, 730], [4100, 480, 730],
  [4450, 560, 1000], [4850, 560, 1000], [5250, 560, 1000], [5520, 750, 1000], [5090, 480, 730], [5520, 480, 730], [5690, 200, 460],
  [6100, 450, 1000], [6380, 380, 1000], [6660, 450, 1000],
].map(([x, top, floor]) => ({ x, top, floor, sec: secIndex(x) }));

const rooms = [
  { x: 2900, y: 746, w: 1380, h: 254, s: 'office' },
  { x: 2970, y: 476, w: 1310, h: 254, s: 'office' },
  { x: 1400, y: 345, w: 230, h: 115, s: 'secret' },
  { x: 5780, y: 345, w: 100, h: 115, s: 'armory' },
  { x: 5604, y: 470, w: 162, h: 430, s: 'shaft' },
];

const decor = [
  { t: 'sign', x: 110, y: 760, text: 'DOCK 7', c: '#c8a030' },
  { t: 'sign', x: 820, y: 790, text: 'NO SMOKING', c: '#b02020' },
  { t: 'pallet', x: 850 }, { t: 'glass', x: 1000 }, { t: 'barrel', x: 1290 }, { t: 'barrel', x: 1325 },
  { t: 'toolbox', x: 1040, y: F1 }, { t: 'fan', x: 1180, y: 590, r: 40 }, { t: 'hook', x: 450, y: 560 },
  { t: 'sign', x: 1440, y: 790, text: 'BAY 2 - HEAVY LOAD', c: '#c8a030' },
  { t: 'graffiti', x: 1660, y: 380 }, { t: 'glass', x: 2200 }, { t: 'fan', x: 2500, y: 560, r: 50 },
  { t: 'barrel', x: 2470, y: F1 }, { t: 'sparkbox', x: 2860, y: 820 }, { t: 'pallet', x: 2250 },
  { t: 'sign', x: 3440, y: 780, text: 'SECURITY CHIEF  ↑', c: '#d0c8a0' },
  { t: 'sign', x: 4110, y: 800, text: 'KEYCARD REQUIRED', c: '#b02020' },
  { t: 'sign', x: 3960, y: 520, text: 'CHIEF OF SECURITY', c: '#c8a030' },
  { t: 'cooler', x: 3280 }, { t: 'plant', x: 3780 }, { t: 'glass', x: 3560 }, { t: 'deskdeco', x: 3100, y: F1 },
  { t: 'deskdeco', x: 4000, y: F1 }, { t: 'plant', x: 3330, y: F1 },
  { t: 'sign', x: 4500, y: 700, text: 'CRUSH HAZARD', c: '#d0b020' },
  { t: 'sign', x: 4945, y: 690, text: 'LIFT', c: '#d0b020' },
  { t: 'sign', x: 5150, y: 820, text: 'DANGER HIGH VOLTAGE', c: '#d0b020' },
  { t: 'fan', x: 4700, y: 600, r: 60 }, { t: 'steampipe', x: 4400, y: 650 }, { t: 'sparkbox', x: 5320, y: 800 },
  { t: 'piston', x: 4330, y: GROUND }, { t: 'sign', x: 5785, y: 365, text: 'ARMORY', c: '#3060c0' },
  { t: 'steampipe', x: 5650, y: 760 },
  { t: 'sign', x: 6000, y: 760, text: 'KEEP OUT', c: '#b02020' },
  { t: 'pallet', x: 6100 }, { t: 'barrel', x: 6820 }, { t: 'shutter', x: 6780 }, { t: 'fan', x: 6380, y: 560, r: 55 },
];
const staticBlood = [[980, 1000, 50], [2380, 1000, 70], [3330, 1000, 60], [5000, 1000, 50], [6450, 1000, 90]];

let solids, platforms, ladders, floorRects, enemies, bullets, particles, flashes, decals, pickups, hazards, conveyors, secrets;
let player, camX, camY, state = 'title', score, shake, flashT, hitstop = 0, timeScale = 1;
let bossActive, banner, lastSec, introT, vicT, tT = 0, lvT = 0, msgCd = 0;

function gAt(list, x, floorY, stack = 1, type = 'crate', drop = null) {
  for (let i = 0; i < stack; i++) list.push({ x, y: floorY - CRATE * (i + 1), w: CRATE, h: CRATE, type, hp: 3, drop });
}

function buildLevel() {
  const s = [];
  const P = [];
  const L = [];
  const floor = (x0, x1, y) => P.push({ x: x0, y, w: x1 - x0, kind: 'floor' });
  const cat = (x0, x1, y) => P.push({ x: x0, y, w: x1 - x0, kind: 'cat' });
  const ladder = (x, top, bottom) => L.push({ x, top, bottom });
  const wall = (x, y0, y1, w = 16) => s.push({ x, y: y0, w, h: y1 - y0, type: 'wall' });
  const door = (x, fy, lock = null) => s.push({ x, y: fy - 110, w: 16, h: 110, type: 'door', lock, open: 0 });

  // ===== A: Loading Dock =====
  gAt(s, 196, GROUND);
  s.push({ x: 260, y: 850, w: 300, h: 150, type: 'truck' });
  gAt(s, 420, 850);
  s.push({ x: 620, y: GROUND - 56, w: 110, h: 56, type: 'forklift' });
  gAt(s, 1100, GROUND);
  floor(700, 1400, F1);
  ladder(760, F1, GROUND);

  // ===== B: Storage Complex =====
  floor(1400, 1880, F1);
  floor(2000, 2970, F1);
  ladder(1550, F1, GROUND);
  ladder(2330, F2, F1);
  ladder(2750, F1, GROUND);
  floor(1400, 1625, F2);
  cat(1625, 2400, F2);
  s.push({ x: 1384, y: 300, w: 256, h: 45, type: 'ceiling' });
  wall(1384, 345, 460);
  s.push({ x: 1610, y: 345, w: 20, h: 115, type: 'breakwall', hp: 5 });
  gAt(s, 1650, GROUND);
  gAt(s, 1780, GROUND);
  gAt(s, 1844, GROUND, 2);
  gAt(s, 2060, F1);
  gAt(s, 1960, F2);
  s.push({ x: 2550, y: GROUND - 140, w: 24, h: 140, type: 'barricade', hp: 4 });

  // ===== C: Security Offices =====
  wall(2900, 746, 890);
  door(2900, GROUND);
  floor(2970, 3370, F1);
  floor(3720, 4280, F1);
  floor(2900, 4280, F2);
  wall(3340, 746, 890);
  door(3340, GROUND);
  wall(3740, 746, 890);
  door(3740, GROUND);
  wall(4280, F2, 890, 20);
  s.push({ x: 4280, y: GROUND - 110, w: 20, h: 110, type: 'door', lock: 'red', open: 0 });
  // stairs in room 2 (first step needs a small hop, so you can walk under them)
  for (let i = 0; i < 15; i++) {
    P.push({ x: 3385 + i * 22, y: Math.round(964 - i * ((964 - F1) / 14)), w: 24, kind: 'step' });
  }
  s.push({ x: 3040, y: GROUND - 48, w: 60, h: 48, type: 'desk' });
  s.push({ x: 3950, y: GROUND - 72, w: 36, h: 72, type: 'cabinet' });
  wall(3900, 476, 620);
  door(3900, F1);
  ladder(4220, F1, GROUND);

  // ===== D: Industrial Machinery =====
  s.push({ x: 4800, y: GROUND - 100, w: 90, h: 100, type: 'machine' });
  P.push({ x: 4950, y: GROUND, w: 80, kind: 'lift', move: { ax: 4950, ay: GROUND, bx: 4950, by: F1, period: 6, hold: true } });
  floor(5030, 5150, F1);
  P.push({ x: 5160, y: F1, w: 90, kind: 'lift', move: { ax: 5160, ay: F1, bx: 5330, by: F1, period: 5, hold: true } });
  floor(5430, 5600, F1);
  ladder(5445, F1, GROUND);
  gAt(s, 5470, GROUND);
  wall(5604, 470, 880);
  wall(5750, 470, 880);
  P.push({ x: 5622, y: 890, w: 58, kind: 'cat' });
  P.push({ x: 5692, y: 780, w: 56, kind: 'cat' });
  P.push({ x: 5622, y: 670, w: 58, kind: 'cat' });
  P.push({ x: 5692, y: 560, w: 56, kind: 'cat' });
  cat(5604, 5766, F2);
  floor(5766, 5880, F2);
  s.push({ x: 5766, y: 330, w: 114, h: 15, type: 'ceiling' });
  s.push({ x: 5780, y: F2 - 110, w: 16, h: 110, type: 'door', lock: 'blue', open: 0 });
  wall(5866, 345, 460, 14);

  // ===== E: Stronghold =====
  cat(6000, 6200, 870);
  cat(6560, 6760, 870);
  cat(6280, 6480, 740);
  s.push({ x: 6230, y: GROUND - 80, w: 40, h: 80, type: 'barrier' });
  s.push({ x: 6520, y: GROUND - 80, w: 40, h: 80, type: 'barrier' });
  gAt(s, 6380, GROUND, 1, 'breakable', 'health');
  s.push({ x: WORLD_R, y: 0, w: 60, h: GROUND, type: 'wall' });

  solids = s;
  platforms = P;
  ladders = L;
  floorRects = P.filter((p) => p.kind === 'floor').map((p) => ({ x: p.x, y: p.y, w: p.w, h: 14 }));

  hazards = [
    { t: 'crusher', x: 4590, w: 70, y: GROUND, top: 600, period: 3.2, off: 0 },
    { t: 'electric', x: 5100, w: 300, y: GROUND, period: 3, on: 1.3 },
    { t: 'steam', x: 5060, y: GROUND, period: 3.5, off: 1 },
    { t: 'steam', x: 5800, y: GROUND, period: 3, off: 0.3 },
  ];
  conveyors = [{ x: 4380, w: 410, y: GROUND, speed: -80 }];
  secrets = [
    { x: 1400, y: 345, w: 210, h: 115, found: false },
    { x: 5796, y: 345, w: 70, h: 115, found: false },
  ];

  const E = (kind, x, y, minX, maxX) => makeEnemy(kind, x, y, minX, maxX);
  enemies = [
    E('gunner', 500, 850, 470, 550),
    E('patrol', 900, GROUND, 800, 1060),
    E('gunner', 1190, GROUND),
    E('patrol', 1100, F1, 720, 1390),
    E('gunner', 1990, GROUND),
    E('rusher', 2400, GROUND),
    E('gunner', 2160, F1, 2130, 2300),
    E('patrol', 2700, F1, 2420, 2960),
    E('gunner', 1900, F2, 1650, 1950),
    E('patrol', 2200, F2, 2030, 2390),
    E('gunner', 3130, GROUND, 3110, 3320),
    E('patrol', 3200, F1, 2990, 3360),
    E('rusher', 3600, GROUND, 3420, 3730),
    E('gunner', 4050, GROUND, 4000, 4200),
    E('patrol', 3800, F1, 3730, 3890),
    E('gunner', 4180, F1, 3930, 4270),
    E('rusher', 4450, GROUND, 4300, 4780),
    E('gunner', 4920, GROUND, 4900, 4945),
    E('gunner', 5100, F1, 5040, 5145),
    E('gunner', 5540, F1, 5460, 5595),
    E('gunner', 5560, GROUND, 5540, 5590),
    E('boss', 6700, GROUND),
  ];
  for (const e of enemies) if (e.kind === 'gunner' && e.x < 1300) e.dir = -1;

  pickups = [];
  const pk = (x, y, type, color) => pickups.push({ x, y, w: 22, h: 20, vx: 0, vy: 0, type, color, t: Math.random() * 3 });
  pk(320, 850, 'ammo');
  pk(1440, F2, 'key', 'blue');
  pk(1500, F2, 'health');
  pk(1560, F2, 'ammo');
  pk(4060, F1, 'key', 'red');
  pk(3020, F1, 'ammo');
  pk(5815, F2, 'health');
  pk(5845, F2, 'ammo');
  pk(5830, F2, 'health');
}

function makeEnemy(kind, x, y, minX, maxX) {
  const boss = kind === 'boss';
  const hp = boss ? 45 : kind === 'rusher' ? 3 : 4;
  return {
    kind, x, y, w: boss ? 48 : 32, h: boss ? 130 : 100, ch: boss ? 78 : 50,
    vx: 0, vy: 0, dir: -1, hp, maxHp: hp,
    minX: minX ?? x - 400, maxX: maxX ?? x + 400,
    alert: false, alertT: 0, aimT: 0, cool: 1, crouch: false,
    hurt: 0, stagger: 0, dead: false, deadT: 0, walkPh: 0, flashT: 0,
    pattern: boss ? 'dormant' : '', patT: 0, slashId: -1, coverAt: 30,
    armA: 0.65, recoil: 0, hitAnim: 0, hitMax: 0.15, hitKind: 'gun', scanT: 0, scanTimer: 2 + Math.random() * 2, startle: 0, lastFr: 0,
  };
}

function reset() {
  buildLevel();
  player = {
    x: 100, y: GROUND, w: 30, h: 92, ch: 56, vx: 0, vy: 0, dir: 1, hp: 8, maxHp: 8,
    onGround: true, onCat: false, crouch: false, crouchAmt: 0, shootCd: 0, slashT: 0, slashCd: 0, slashId: 0,
    inv: 0, coyote: 0, jumpBuf: 0, dropT: 0, ammo: 12, mag: 12, reserve: 48, reloadT: 0,
    recoil: 0, walkPh: 0, idleT: 0, aimHold: 0, land: 0, takeoffT: 0, hurtT: 0, hurtAnim: 0, flashT: 0,
    dead: false, deathT: 0, climb: null, climbPh: 0, keys: {}, secrets: 0, plat: null, pose: null,
  };
  player.pose = playerPose(player);
  bullets = [];
  particles = [];
  flashes = [];
  decals = staticBlood.map(([x, y, w]) => ({ x, y, w }));
  camX = 0;
  camY = WH - H;
  score = 0;
  shake = 0;
  flashT = 0;
  hitstop = 0;
  timeScale = 1;
  bossActive = false;
  banner = null;
  lastSec = -1;
  introT = 0;
  vicT = 0;
  lvT = 0;
}

// ---------- Physics ----------
function boxOf(b) {
  const h = b.crouch ? b.ch : b.h;
  return { x: b.x - b.w / 2, y: b.y - h, w: b.w, h };
}
const overlaps = (a, r) => a.x < r.x + r.w && a.x + a.w > r.x && a.y < r.y + r.h && a.y + a.h > r.y;
const inRect = (px, py, r) => px > r.x && px < r.x + r.w && py > r.y && py < r.y + r.h;
const activeSolid = (s) => !s.dead && !(s.type === 'door' && s.open > 0.85);

function moveBody(b, dt) {
  const wasGround = b.onGround;
  b.vy = Math.min(b.vy + GRAV * dt, 1100);
  b.hitWall = false;
  b.x += b.vx * dt;
  if (wasGround && Math.abs(b.vx) > 1) {
    for (const p of platforms) {
      if (p.move) continue;
      const dy = b.y - p.y;
      if (dy > 0.5 && dy <= 18 && b.x + b.w / 2 > p.x && b.x - b.w / 2 < p.x + p.w) b.y = p.y;
    }
  }
  let bx = boxOf(b);
  for (const s of solids) {
    if (!activeSolid(s) || !overlaps(bx, s)) continue;
    if (bx.y + bx.h - s.y < 2 || s.y + s.h - bx.y < 2) continue;
    if (b.x < s.x + s.w / 2) b.x = s.x - b.w / 2 - 0.01;
    else b.x = s.x + s.w + b.w / 2 + 0.01;
    b.hitWall = true;
    bx = boxOf(b);
  }
  const prevY = b.y;
  b.y += b.vy * dt;
  b.onGround = false;
  b.onCat = false;
  b.plat = null;
  const h = b.crouch ? b.ch : b.h;
  bx = boxOf(b);
  for (const s of solids) {
    if (!activeSolid(s) || !overlaps(bx, s)) continue;
    if (prevY <= s.y + 1) {
      b.y = s.y;
      b.vy = 0;
      b.onGround = true;
    } else if (prevY - h >= s.y + s.h - 1) {
      b.y = s.y + s.h + h;
      b.vy = 0;
    }
    bx = boxOf(b);
  }
  if (b.y >= GROUND) {
    b.y = GROUND;
    b.vy = 0;
    b.onGround = true;
  }
  if (b.vy >= 0) {
    for (const p of platforms) {
      if (b.dropT > 0 && p.kind !== 'floor') continue;
      if (b.x + b.w / 2 > p.x && b.x - b.w / 2 < p.x + p.w && prevY <= p.y + 1 && b.y >= p.y) {
        b.y = p.y;
        b.vy = 0;
        b.onGround = true;
        b.onCat = p.kind !== 'floor';
        b.plat = p;
      }
    }
  }
  b.x = clamp(b.x, 20, WORLD_R - 20);
}

function blockerAt(px, py) {
  for (const s of solids) if (activeSolid(s) && inRect(px, py, s)) return s;
  for (const f of floorRects) if (inRect(px, py, f)) return f;
  return null;
}
function blocked(x1, y1, x2, y2) {
  const n = Math.ceil(Math.hypot(x2 - x1, y2 - y1) / 8);
  for (let i = 1; i < n; i++) {
    if (blockerAt(x1 + ((x2 - x1) * i) / n, y1 + ((y2 - y1) * i) / n)) return true;
  }
  return false;
}

// ---------- FX ----------
function burst(x, y, color, n, speed = 350, kind = 'spark', life = 0.4) {
  for (let i = 0; i < n; i++) {
    particles.push({ x, y, vx: (Math.random() - 0.5) * speed * 2, vy: -Math.random() * speed, life: life * (0.5 + Math.random()), color, kind, size: kind === 'wood' ? 5 : 3, floor: y + 40 });
  }
}
function ricochet(x, y, dir, wood) {
  for (let i = 0; i < 6; i++) {
    particles.push({ x, y, vx: -dir * (100 + Math.random() * 300), vy: (Math.random() - 0.7) * 300, life: 0.25 + Math.random() * 0.2, color: i < 3 ? '#fff6b0' : '#ffb040', kind: 'spark', size: 2, floor: GROUND });
  }
  if (wood) burst(x, y, '#7a5230', 4, 200, 'wood', 0.6);
  particles.push({ x, y, vx: 0, vy: -30, life: 0.5, color: 'rgba(160,160,170,0.4)', kind: 'smoke', size: 10 });
  flashes.push({ x, y, r: 40, life: 0.05, max: 0.05, color: '255,210,120' });
}
function surfaceBelow(x, y) {
  let best = GROUND;
  for (const p of platforms) if (x > p.x && x < p.x + p.w && p.y >= y - 2 && p.y < best) best = p.y;
  for (const s of solids) if (activeSolid(s) && x > s.x && x < s.x + s.w && s.y >= y - 2 && s.y < best) best = s.y;
  return best;
}
function shell(x, y, dir) {
  particles.push({ x, y, vx: -dir * (60 + Math.random() * 80), vy: -200 - Math.random() * 100, life: 1.6, color: '#e0b040', kind: 'shell', size: 3, rot: 0, floor: surfaceBelow(x, y) });
}

// ---------- Player ----------
function playerPose(p) {
  const R = RIG.viktor;
  const L = legLen(R);
  const standY = -L + 1;
  const pose = { hipX: 0, hipY: standY, torso: 0, arm: 0.28, feet: [[5, 0], [-7, 0]], rot: 0, armOff: 0 };
  if (p.dead) {
    const t = p.deathT;
    pose.feet = [[12, 0], [-10, 0]];
    if (t < 0.15) {
      const k = t / 0.15;
      pose.torso = -0.4 * k;
      pose.arm = -0.9 * k;
      pose.hipX = -4 * k;
      pose.feet = [[5, 0], [-7, 0]];
    } else if (t < 0.55) {
      const k = (t - 0.15) / 0.4;
      pose.hipY = lerp(standY, -16, k);
      pose.torso = lerp(-0.4, 0.35, k);
      pose.arm = lerp(-0.9, 1.3, k);
      pose.hipX = -4;
    } else {
      const k = Math.min(1, (t - 0.55) / 0.4);
      pose.hipY = -16;
      pose.torso = 0.35;
      pose.arm = 1.4;
      pose.hipX = -4;
      pose.rot = k * k * 1.45;
      if (t > 0.95) pose.rot += Math.sin((t - 0.95) * 22) * 0.06 * Math.exp(-(t - 0.95) * 6);
    }
    return pose;
  }
  if (p.climb) {
    const s = Math.sin(p.climbPh * 6);
    pose.feet = [[3, -Math.max(0, s) * 12], [-3, -Math.max(0, -s) * 12]];
    pose.arm = -1.35 + s * 0.1;
    return pose;
  }
  const c = p.crouchAmt;
  if (!p.onGround) {
    if (p.vy < -250) {
      pose.feet = [[11, -15], [-8, -1]];
      pose.torso = -0.04;
    } else if (p.vy < 250) {
      pose.feet = [[9, -17], [-5, -13]];
      pose.torso = 0.02;
    } else {
      pose.feet = [[7, -3], [-9, -1]];
      pose.torso = 0.05;
    }
    // comic key poses: stretch rising, tuck at apex, reach down falling
    if (p.vy < -250) {
      pose.feet = [[12, -18], [-9, -2]];
      pose.sy = 1.07;
      pose.sx = 0.94;
      pose.torso = -0.08;
    } else if (p.vy < 250) {
      pose.feet = [[10, -24], [-1, -19]];
      pose.hipY = standY - 2;
      pose.torso = 0.06;
    } else {
      pose.feet = [[9, -2], [-11, -6]];
      pose.sy = 1.04;
      pose.sx = 0.97;
      pose.torso = 0.1;
    }
    if (p.takeoffT > 0) {
      pose.hipY = standY + 9;
      pose.feet = [[8, 0], [-8, 0]];
      pose.torso = 0.14;
      pose.sy = 0.88;
      pose.sx = 1.1;
    }
    pose.arm = p.aimHold > 0 ? 0 : (p.vy < -250 ? 0.05 : p.vy < 250 ? -0.05 : 0.25);
    pose.flap = clamp(p.vy / 700, -0.6, 0.6) - 0.15;
  } else if (Math.abs(p.vx) > 15 && c < 0.5) {
    const run = Math.abs(p.vx) > 240;
    const wf = walkFeet(p.walkPh, run ? 18 : 12, run ? 12 : 7);
    pose.feet = wf.feet;
    const s = Math.sin(wf.a);
    // weight: drop on contact, rise on passing, shift over the planted foot
    pose.hipY = standY + Math.round(Math.abs(s) * (run ? 4 : 2.5));
    pose.hipX = Math.round(Math.cos(wf.a) * (run ? 2 : 1.5));
    // swagger: shoulders roll against the stride, deep lean when running
    pose.torso = (run ? 0.17 : 0.05) + Math.cos(wf.a * 2) * (run ? 0.025 : 0.03);
    if (run) {
      pose.sy = 1 - Math.abs(s) * 0.03;
      pose.sx = 1 + Math.abs(s) * 0.03;
    }
    pose.arm = (p.aimHold > 0 ? 0 : run ? 0.38 : 0.3) + (p.aimHold > 0 ? 0.015 : 0.07) * s;
    pose.flap = -(run ? 0.45 : 0.2) + Math.sin(wf.a * 2) * 0.1;
  } else {
    const b = Math.sin(p.idleT * 2.2);
    pose.hipY = standY + (b > 0.3 ? 1 : 0);
    pose.hipX = Math.sin(p.idleT * 0.55) > 0.6 ? 1 : 0;
    // attitude: leaning back slightly, chest out, weight on the back foot
    pose.torso = -0.035 + b * 0.02 + (pose.hipX ? 0.015 : 0);
    pose.feet = [[7, 0], [-9, 0]];
    pose.sy = 1 + b * 0.008;
    pose.flap = b * 0.04;
    let arm = p.aimHold > 0 ? 0 : 0.3 + b * 0.02;
    const f = p.idleT % 7;
    if (p.aimHold <= 0 && f > 5 && f < 6.2) arm += Math.sin(((f - 5) / 1.2) * Math.PI) * 0.55;
    pose.arm = arm;
  }
  if (c > 0) {
    pose.hipY = lerp(pose.hipY, -11, c);
    const cf = [[16, 0], [-14, -2]];
    pose.feet = pose.feet.map((f, i) => [lerp(f[0], cf[i][0], c), lerp(f[1], cf[i][1], c)]);
    pose.torso = lerp(pose.torso, 0.14, c);
    pose.flap = lerp(pose.flap || 0, 0.3, c);
    // overshoot squash as he drops in
    const mid = Math.sin(c * Math.PI);
    pose.sx = (pose.sx || 1) + mid * 0.06;
    pose.sy = (pose.sy || 1) - mid * 0.06;
    if (p.aimHold <= 0) pose.arm = lerp(pose.arm, 0.2, c);
  }
  if (p.land > 0 && c < 0.5) {
    const k = p.land / 0.14;
    pose.hipY += 10 * k;
    pose.feet = [[9, 0], [-9, 0]];
    pose.torso += 0.16 * k;
    pose.flap = 0.45 * k;
    pose.sy = 1 - 0.16 * k;
    pose.sx = 1 + 0.12 * k;
  }
  if (p.recoil > 0) {
    const r = p.recoil;
    pose.arm -= r * 0.5;
    pose.torso -= r * 0.14;
    pose.hipX -= r * 4;
    pose.hipY += r * 1.5;
    pose.armOff = -r * 7;
    pose.sx = (pose.sx || 1) * (1 - r * 0.04);
    pose.flap = (pose.flap || 0) - r * 0.15;
  }
  if (p.hurtAnim > 0) {
    const k = p.hurtAnim / 0.3;
    const snap = k > 0.7 ? 1 : k / 0.7;
    pose.torso -= 0.55 * snap;
    pose.arm -= 0.9 * snap;
    pose.hipX -= 6 * snap;
    pose.hipY += 4 * snap;
    pose.flap = 0.5 * snap;
    pose.sx = 0.9 + 0.1 * (1 - snap);
    pose.sy = 1.06 - 0.06 * (1 - snap);
    pose.feet = [[pose.feet[0][0] + 4 * snap, pose.feet[0][1]], [pose.feet[1][0] - 5 * snap, pose.feet[1][1]]];
  }
  if (p.slashT > 0) {
    const s = SLASH - p.slashT;
    let sw;
    let tor;
    if (s < 0.05) {
      const k = s / 0.05;
      sw = lerp(0.3, -2.5, k);
      tor = -0.32 * k;
      pose.hipX -= 5 * k;
      pose.hipY += 2 * k;
      pose.flap = 0.3 * k;
      pose.sx = 1 - 0.06 * k;
      pose.sy = 1 + 0.04 * k;
    } else if (s < 0.12) {
      const k = easeOut((s - 0.05) / 0.07);
      sw = lerp(-2.5, 1.15, k);
      tor = lerp(-0.32, 0.34, k);
      pose.hipX += lerp(-5, 9, k);
      pose.hipY += lerp(2, 5, k);
      pose.flap = lerp(0.3, -0.7, k);
      pose.sx = 1 + 0.1 * Math.sin(k * Math.PI);
      pose.sy = 1 - 0.06 * Math.sin(k * Math.PI);
    } else if (s < 0.2) {
      const k = (s - 0.12) / 0.08;
      sw = lerp(1.15, 1.45, k);
      tor = lerp(0.34, 0.28, k);
      pose.hipX += 9;
      pose.hipY += 5;
      pose.flap = lerp(-0.7, -0.3, k);
    } else {
      const k = Math.min(1, (s - 0.2) / 0.1);
      sw = lerp(1.45, 0.3, easeOut(k));
      tor = lerp(0.28, 0, k);
      pose.hipX += 9 * (1 - k);
      pose.hipY += 5 * (1 - k);
      pose.flap = -0.3 * (1 - k);
    }
    pose.sword = sw;
    pose.arm = 0;
    pose.torso += tor;
    if (p.onGround && c < 0.5) pose.feet = s < 0.05 ? [[8, 0], [-12, 0]] : [[17, 0], [-13, 0]];
  }
  return pose;
}

function playerMuzzle() {
  const p = player;
  return rigPoint(RIG.viktor, p.x, p.y, p.dir, { ...p.pose, arm: 0, armOff: 0 });
}
function startReload() {
  const p = player;
  if (p.reloadT > 0 || p.ammo >= p.mag) return;
  if (p.reserve <= 0) {
    beep(1800, 0.04, 'square', 0.05, 0.9);
    return;
  }
  p.reloadT = 0.9;
  beep(500, 0.06, 'square', 0.05, 0.8);
}
function playerShoot() {
  const p = player;
  if (p.reloadT > 0) return;
  if (p.ammo <= 0) {
    startReload();
    p.shootCd = 0.25;
    return;
  }
  const m = playerMuzzle();
  p.ammo--;
  p.shootCd = 0.22;
  p.recoil = 1;
  p.aimHold = 0.9;
  p.flashT = 0.06;
  bullets.push({ x: m.x, y: m.y, vx: p.dir * 1100, vy: 0, owner: 'player', life: 0.85 });
  flashes.push({ x: m.x + p.dir * 8, y: m.y, r: 130, life: 0.07, max: 0.07, color: '255,200,110' });
  shell(p.x + p.dir * 6, m.y + 4, p.dir);
  play('gun', 0.5);
  shake = Math.max(shake, 3);
  if (p.ammo === 0) startReload();
}
function canStand(p) {
  const b = { x: p.x - p.w / 2, y: p.y - p.h, w: p.w, h: p.h - 1 };
  return !solids.some((s) => activeSolid(s) && overlaps(b, s));
}

function updatePlayer(dt) {
  const p = player;
  p.shootCd -= dt;
  p.slashCd -= dt;
  p.slashT -= dt;
  p.inv -= dt;
  p.hurtT -= dt;
  p.hurtAnim = Math.max(0, p.hurtAnim - dt);
  p.flashT -= dt;
  p.aimHold -= dt;
  p.takeoffT -= dt;
  p.recoil = Math.max(0, p.recoil - dt * 7);
  p.land -= dt;
  p.dropT -= dt;
  p.idleT += dt;
  if (p.dead) {
    p.deathT += dt;
    if (p.deathT > 0.3 && p.deathT - dt <= 0.3) {
      particles.push({ x: p.x + p.dir * 20, y: p.y - 50, vx: p.dir * 90, vy: -150, life: 3, color: '#222', kind: 'gun', size: 4, rot: 0, floor: p.y });
    }
    p.vx *= 0.92;
    moveBody(p, dt);
    if (p.deathT > 1.9) state = 'over';
    p.pose = playerPose(p);
    return;
  }
  if (p.reloadT > 0) {
    p.reloadT -= dt;
    if (p.reloadT <= 0) {
      const n = Math.min(p.mag - p.ammo, p.reserve);
      p.ammo += n;
      p.reserve -= n;
      beep(900, 0.05, 'square', 0.05, 1.2);
    }
  }

  // ladders
  const upKey = down('KeyW', 'ArrowUp');
  const dnKey = down('KeyS', 'ArrowDown');
  if (p.climb) {
    const l = p.climb;
    let v = 0;
    if (upKey) v = -150;
    if (dnKey) v = 150;
    p.y += v * dt;
    p.climbPh += Math.abs(v) * dt * 0.02;
    p.vx = 0;
    p.vy = 0;
    p.crouch = false;
    p.crouchAmt = 0;
    if (p.y <= l.top) {
      p.y = l.top;
      p.climb = null;
      p.onGround = true;
    } else if (p.y >= l.bottom) {
      p.y = l.bottom;
      p.climb = null;
      p.onGround = true;
    } else if (hit('Space') || hit('KeyA', 'ArrowLeft', 'KeyD', 'ArrowRight')) {
      p.climb = null;
      p.dropT = 0.15;
      if (hit('Space')) p.vy = -450;
      if (down('KeyA', 'ArrowLeft')) p.dir = -1;
      if (down('KeyD', 'ArrowRight')) p.dir = 1;
    }
    if (p.climb && Math.abs(v) > 0 && Math.floor(p.climbPh * 4) !== Math.floor((p.climbPh - Math.abs(v) * dt * 0.02) * 4)) beep(180, 0.04, 'square', 0.03, 0.8);
    p.pose = playerPose(p);
    return;
  }
  const lad = ladders.find((l) => Math.abs(p.x - l.x) < 14 && p.y >= l.top - 2 && p.y <= l.bottom + 2);
  if (lad && ((upKey && p.y > lad.top + 4) || (dnKey && p.y < lad.bottom - 4 && p.onGround))) {
    p.climb = lad;
    p.x = lad.x;
    p.vx = 0;
    p.vy = 0;
    p.jumpBuf = 0;
    if (p.y <= lad.top + 1) p.y = lad.top + 4;
    p.pose = playerPose(p);
    return;
  }

  const wasGround = p.onGround;
  const vyBefore = p.vy;
  if (dnKey && p.onGround) p.crouch = true;
  else if (p.crouch && canStand(p)) p.crouch = false;
  p.crouchAmt = clamp(p.crouchAmt + (p.crouch ? 1 : -1) * dt * 14, 0, 1);

  let move = 0;
  if (down('KeyA', 'ArrowLeft')) move -= 1;
  if (down('KeyD', 'ArrowRight')) move += 1;
  if (move && p.slashT <= 0) p.dir = move;
  const run = down('ShiftLeft', 'ShiftRight');
  let target = move * (run ? 300 : 210);
  if (p.crouch) target = 0;
  const acc = p.onGround ? 2600 : 1500;
  p.vx += clamp(target - p.vx, -acc * dt, acc * dt);

  p.coyote = p.onGround ? 0.1 : p.coyote - dt;
  p.jumpBuf = hit(...JUMP) ? 0.12 : p.jumpBuf - dt;
  if (p.jumpBuf > 0) {
    if (dnKey && p.onCat) {
      p.dropT = 0.25;
      p.y += 2;
      p.jumpBuf = 0;
      p.crouch = false;
    } else if (p.coyote > 0 && (!p.crouch || canStand(p))) {
      p.crouch = false;
      p.vy = -760;
      p.coyote = 0;
      p.jumpBuf = 0;
      p.takeoffT = 0.07;
      beep(220, 0.12, 'square', 0.04, 2);
    }
  }
  if (p.vy < 0 && !down(...JUMP)) p.vy += GRAV * 1.3 * dt;

  if (hit('KeyR')) startReload();
  if (down('KeyJ', 'KeyZ') && p.shootCd <= 0 && p.slashT <= 0) playerShoot();
  if (hit('KeyK', 'KeyX') && p.slashCd <= 0) {
    p.slashT = SLASH;
    p.slashCd = 0.36;
    p.slashId++;
    p.vx += p.dir * 140;
    swish();
  }
  const se = SLASH - p.slashT;
  if (p.slashT > 0 && se > 0.04 && se < 0.16) swordHits();

  moveBody(p, dt);
  applyConveyor(p, dt);
  if (!wasGround && p.onGround && vyBefore > 350) {
    p.land = 0.14;
    burst(p.x, p.y, 'rgba(140,140,150,0.5)', 4, 80, 'smoke', 0.4);
  }
  p.walkPh += (Math.abs(p.vx) * dt) / 75;
  if (Math.abs(p.vx) > 15 || !p.onGround) p.idleT = 0;
  p.pose = playerPose(p);
  updateDoorsAndSecrets();
}

function applyConveyor(b, dt) {
  if (!b.onGround || b.plat || b.y !== GROUND) return;
  for (const c of conveyors) if (b.x > c.x && b.x < c.x + c.w) b.x += c.speed * dt;
}

function swordHits() {
  const p = player;
  const top = p.crouch ? 62 : 98;
  const zone = { x: p.dir > 0 ? p.x : p.x - 80, y: p.y - top, w: 80, h: top };
  for (const e of enemies) {
    if (e.dead || e.slashId === p.slashId || e.pattern === 'dormant') continue;
    if (overlaps(zone, boxOf(e))) {
      e.slashId = p.slashId;
      damageEnemy(e, 3, p.dir, 'sword');
      hitstop = 0.08;
      shake = Math.max(shake, 7);
      burst(e.x, e.y - 60, '#e8f4ff', 6, 300);
    }
  }
  for (const s of solids) {
    if (['breakable', 'breakwall', 'barricade'].includes(s.type) && !s.dead && s.slashId !== p.slashId && overlaps(zone, s)) {
      s.slashId = p.slashId;
      damageCrate(s, 3);
    }
  }
  for (const b of bullets) {
    if (b.owner === 'enemy' && inRect(b.x, b.y, zone)) {
      b.life = 0;
      ricochet(b.x, b.y, -p.dir, false);
      beep(2400, 0.08, 'triangle', 0.06, 0.5);
    }
  }
}

function hurtPlayer(d, fromDir) {
  const p = player;
  if (p.inv > 0 || p.dead || state !== 'play') return;
  comic(p.x - (fromDir || 0) * 6, p.y - 104, Math.random() < 0.5 ? 'OOF!' : 'UGH!', '#ff4a3a', 18);
  p.hp -= d;
  p.inv = 1;
  p.hurtT = 0.12;
  p.hurtAnim = 0.3;
  flashT = 0.2;
  shake = 11;
  hitstop = 0.05;
  p.vx += fromDir * 160;
  if (p.climb) {
    p.climb = null;
    p.dropT = 0.15;
  }
  play('hit', 0.6);
  burst(p.x, p.y - 60, '#b0101c', 12, 300, 'blood', 0.6);
  if (p.hp <= 0) {
    p.hp = 0;
    p.dead = true;
    p.deathT = 0;
    p.crouch = false;
    p.crouchAmt = 0;
    p.slashT = 0;
    p.vy = -220;
    p.vx = fromDir * 120;
    timeScale = 0.5;
    decals.push({ x: p.x, y: p.y, w: 60 });
  }
}

function updateDoorsAndSecrets() {
  const p = player;
  msgCd -= 1 / 60;
  for (const s of solids) {
    if (s.type !== 'door') continue;
    const near = Math.abs(p.x - (s.x + s.w / 2)) < 70 && Math.abs(p.y - (s.y + s.h)) < 24;
    if (near && s.open === 0) {
      if (!s.lock || p.keys[s.lock]) {
        s.opening = true;
        noise(0.5, 400, 150, 0.15);
        if (s.lock) banner = { text: 'ACCESS GRANTED', t: 1.2, small: true };
      } else if (msgCd <= 0) {
        msgCd = 2;
        banner = { text: `LOCKED — ${s.lock.toUpperCase()} KEYCARD REQUIRED`, t: 1.6, small: true };
        beep(160, 0.2, 'square', 0.06, 0.8);
      }
    }
  }
  const pb = boxOf(p);
  for (const z of secrets) {
    if (!z.found && overlaps(pb, z)) {
      z.found = true;
      p.secrets++;
      score += 1000;
      banner = { text: 'SECRET FOUND!  +1000', t: 2, small: true };
      [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => beep(f, 0.12, 'square', 0.05, 1), i * 90));
    }
  }
}

// ---------- Crates & pickups ----------
function damageCrate(s, dmg) {
  s.hp -= dmg;
  const wood = s.type !== 'breakwall';
  const col = wood ? '#8a5a30' : '#8a8478';
  burst(s.x + s.w / 2, s.y + s.h / 2, col, 5, 220, 'wood', 0.6);
  if (s.hp <= 0) {
    s.dead = true;
    play('crate', 0.5);
    shake = Math.max(shake, 6);
    burst(s.x + s.w / 2, s.y + s.h / 2, wood ? '#9a6838' : '#a09a90', 22, 380, 'wood', 0.9);
    for (let i = 0; i < 4; i++) particles.push({ x: s.x + s.w / 2, y: s.y + s.h / 2, vx: (Math.random() - 0.5) * 80, vy: -40, life: 0.9, color: 'rgba(150,140,130,0.4)', kind: 'smoke', size: 14 });
    score += 50;
    if (s.type === 'breakable') {
      const drop = s.drop || (Math.random() < 0.4 ? (Math.random() < 0.5 ? 'health' : 'ammo') : null);
      if (drop) pickups.push({ x: s.x + s.w / 2, y: s.y + s.h, w: 22, h: 20, vx: 0, vy: -250, type: drop, t: 0 });
    }
    if (s.type === 'barricade') banner = { text: 'SHORTCUT OPENED', t: 1.4, small: true };
    solids = solids.filter((o) => !o.dead);
  }
}

function updatePickups(dt) {
  const pb = boxOf(player);
  for (const k of pickups) {
    k.t += dt;
    moveBody(k, dt);
    if (overlaps(pb, boxOf(k)) && !player.dead) {
      k.taken = true;
      if (k.type === 'health') player.hp = Math.min(player.maxHp, player.hp + 3);
      else if (k.type === 'ammo') player.reserve += 24;
      else player.keys[k.color] = true;
      score += k.type === 'key' ? 500 : 100;
      beep(660, 0.1, 'square', 0.06, 2);
      setTimeout(() => beep(990, 0.12, 'square', 0.06, 1.5), 90);
      banner = { text: k.type === 'health' ? '+ HEALTH' : k.type === 'ammo' ? '+ AMMO' : `${k.color.toUpperCase()} KEYCARD ACQUIRED`, t: 1.4, small: true };
    }
  }
  pickups = pickups.filter((k) => !k.taken);
}

// ---------- Enemies ----------
function enemyRig(e) {
  return e.kind === 'boss' ? RIG.boss : RIG.thug;
}
function muzzleOf(e) {
  const pose = e.pose || enemyPose(e);
  return rigPoint(enemyRig(e), e.x, e.y, e.dir, { ...pose, arm: 0, armOff: 0, rot: 0 });
}
function playerTargetY() {
  return player.y - (player.crouch ? 28 : 55);
}
function canShoot(e) {
  const m = muzzleOf(e);
  if (blocked(e.x, m.y, m.x, m.y)) return false;
  return !blocked(m.x, m.y, player.x, playerTargetY());
}
function coverFor(e, dir = e.dir) {
  return solids.find((s) => {
    if (!activeSolid(s) || s.h < 50 || ['ceiling', 'wall', 'door', 'truck'].includes(s.type)) return false;
    if (Math.abs(s.y + s.h - e.y) > 2) return false;
    const d = (s.x + s.w / 2 - e.x) * dir;
    return d > 0 && d < 120;
  });
}
function sees(e) {
  const dx = player.x - e.x;
  const dist = Math.abs(dx);
  if (Math.abs(player.y - e.y) > 240 || dist > 540 || player.dead || player.climb && Math.abs(player.y - e.y) > 120) return false;
  if (Math.sign(dx) !== e.dir && dist > 150) return false;
  const m = muzzleOf(e);
  return !blocked(e.x, m.y, player.x, player.y - (player.crouch ? 50 : 85));
}

function enemyFire(e) {
  const m = muzzleOf(e);
  const ty = playerTargetY() + (Math.random() - 0.5) * 14;
  const ang = Math.atan2(ty - m.y, player.x - m.x);
  bullets.push({ x: m.x, y: m.y, vx: Math.cos(ang) * 480, vy: Math.sin(ang) * 480, owner: 'enemy', life: 1.6 });
  e.flashT = 0.06;
  e.recoil = 1;
  flashes.push({ x: m.x, y: m.y, r: 100, life: 0.06, max: 0.06, color: '255,170,90' });
  shell(e.x, m.y, e.dir);
  play('gun', 0.28);
}

function damageEnemy(e, dmg, dir, src) {
  if (e.dead || e.pattern === 'dormant') return;
  if (e.kind === 'boss' && e.pattern === 'stun') dmg *= 2;
  e.hp -= dmg;
  e.hurt = 0.1;
  e.hitKind = src;
  e.hitMax = src === 'sword' ? 0.4 : 0.15;
  e.hitAnim = e.hitMax;
  if (!e.alert) {
    e.alert = true;
    e.alertT = 0.5;
    e.dir = -dir;
  }
  burst(e.x - dir * 4, e.y - e.h * 0.6, '#a0101a', src === 'sword' ? 16 : 10, 260, 'blood', 0.55);
  play('hit', 0.35);
  if (e.kind !== 'boss') {
    e.vx = dir * (src === 'sword' ? 280 : 160);
    e.stagger = src === 'sword' ? 0.45 : 0.22;
    e.aimT = 0;
    e.crouch = false;
  } else {
    e.x += dir * 4;
    e.hitAnim = e.hitMax * 0.6;
  }
  if (e.hp <= 0) killEnemy(e, dir, src);
}

function killEnemy(e, dir, src) {
  if (!e.dead) {
    const words = src === 'sword' ? ['SLASH!', 'SHNK!', 'KRAK!'] : ['POW!', 'BLAM!', 'THWAK!'];
    comic(e.x + dir * 10, e.y - e.h - 18, words[Math.floor(Math.random() * 3)], src === 'sword' ? '#7fd8ff' : '#ffd23a', e.kind === 'boss' ? 34 : 22);
  }
  e.dead = true;
  e.deadT = 0;
  e.crouch = false;
  e.aimT = 0;
  if (src === 'sword') {
    e.deathType = 'launch';
    e.vy = -380;
    e.vx = dir * 260;
    score += 200;
  } else {
    e.deathType = Math.random() < 0.5 ? 'back' : 'crumple';
    e.vx = e.deathType === 'back' ? dir * 140 : dir * 30;
  }
  e.dir = -dir;
  particles.push({ x: e.x, y: e.y - 60, vx: dir * 120, vy: -200, life: 3, color: '#1a1a1a', kind: 'gun', size: 4, rot: 0, floor: e.y });
  decals.push({ x: e.x + dir * 30, y: e.y, w: 30 + Math.random() * 40 });
  score += e.kind === 'boss' ? 5000 : 500;
  shake = Math.max(shake, e.kind === 'boss' ? 22 : 8);
  if (e.kind === 'boss') {
    e.deathType = 'crumple';
    state = 'victory';
    vicT = 0;
    timeScale = 0.3;
    hitstop = 0.2;
    flashes.push({ x: e.x, y: e.y - 70, r: 400, life: 0.3, max: 0.3, color: '255,255,255' });
    burst(e.x, e.y - 70, '#a0101a', 40, 450, 'blood', 1);
  }
}

function enemyPose(e) {
  const R = enemyRig(e);
  const boss = e.kind === 'boss';
  const L = legLen(R);
  const standY = -L + 1;
  const pose = { hipX: 0, hipY: standY, torso: 0, arm: e.armA, feet: [[5, 0], [-6, 0]], rot: 0, armOff: 0 };
  if (e.dead) {
    const t = e.deadT;
    if (e.deathType === 'back') {
      if (t < 0.12) {
        const k = t / 0.12;
        pose.torso = -0.4 * k;
        pose.arm = -0.8 * k;
      } else if (t < 0.45) {
        const k = (t - 0.12) / 0.33;
        pose.hipY = lerp(standY, standY * 0.55, k);
        pose.torso = -0.4;
        pose.arm = lerp(-0.8, -1.3, k);
        pose.feet = [[10, 0], [-8, 0]];
      } else {
        const k = Math.min(1, (t - 0.45) / 0.35);
        pose.hipY = standY * 0.55;
        pose.torso = -0.4;
        pose.arm = -1.3;
        pose.feet = [[10, 0], [-8, 0]];
        pose.rot = -k * k * 1.5;
      }
    } else if (e.deathType === 'crumple') {
      if (t < 0.1) {
        const k = t / 0.1;
        pose.torso = 0.3 * k;
        pose.arm = lerp(e.armA, 0.8, k);
      } else if (t < 0.6) {
        const k = (t - 0.1) / 0.5;
        pose.hipY = lerp(standY, -12, k);
        pose.feet = [[12, 0], [-12, 0]];
        pose.torso = lerp(0.3, 0.5, k);
        pose.arm = lerp(0.8, 1.3, k);
      } else {
        const k = Math.min(1, (t - 0.6) / 0.4);
        pose.hipY = -12;
        pose.feet = [[12, 0], [-12, 0]];
        pose.torso = 0.5;
        pose.arm = 1.3;
        pose.rot = k * k * 1.45;
      }
    } else {
      pose.rot = -Math.min(1.6, t * 7);
      pose.feet = [[10 * Math.sin(t * 20), -10], [-8, -4]];
      pose.arm = -1.4;
      pose.torso = -0.3;
    }
    return pose;
  }
  const spd = Math.abs(e.vx);
  if (spd > 5 && e.onGround) {
    const charge = boss && e.pattern === 'charge';
    const wf = walkFeet(e.walkPh, boss ? (charge ? 22 : 15) : spd > 120 ? 15 : 10, boss ? 9 : 6);
    pose.feet = wf.feet;
    pose.hipY += Math.round(Math.abs(Math.sin(wf.a)) * (boss ? 4 : 2));
    pose.hipX = Math.round(Math.cos(wf.a) * (boss ? 2 : 1));
    pose.torso = (charge ? 0.38 : spd > 120 ? 0.08 : 0.03) + Math.cos(wf.a * 2) * 0.015;
    pose.arm += Math.sin(wf.a) * (e.alert ? 0.015 : 0.05);
    pose.flap = -(charge ? 0.7 : spd > 120 ? 0.45 : 0.2) + Math.sin(wf.a * 2) * 0.1;
  } else {
    const b = Math.sin(tT * 2 + e.x);
    pose.hipY += b > 0.3 ? 1 : 0;
    pose.torso = b * 0.012;
    pose.flap = b * 0.04;
  }
  if (!e.onGround) pose.feet = [[8, -12], [-6, -4]];
  if (e.scanT > 0) pose.torso -= 0.05;
  if (e.startle > 0) {
    const k = e.startle / 0.25;
    pose.hipY -= 3 * k;
    pose.torso -= 0.12 * k;
  }
  if (e.aimT > 0) pose.arm += Math.sin(tT * 30) * 0.012;
  if (boss) {
    if (e.pattern === 'pump') pose.armOff = -8 * Math.max(0, Math.sin(lvT * 14));
    if (e.pattern === 'windup') {
      pose.torso = 0.3;
      pose.hipY += 8;
      pose.feet = [[15, 0], [-15, 0]];
      pose.arm = 0.5;
      pose.hipX = Math.sin(tT * 60) * 2;
    }
    if (e.pattern === 'charge') pose.arm = 0.6;
    if (e.pattern === 'stun') {
      pose.torso = -0.2 + Math.sin(tT * 6) * 0.08;
      pose.arm = 1.0;
      pose.hipY += 5;
      pose.feet = [[9, 0], [-12, 0]];
    }
  }
  if (e.recoil > 0) {
    pose.arm -= e.recoil * (boss ? 0.5 : 0.35);
    pose.torso -= e.recoil * (boss ? 0.15 : 0.05);
    pose.hipX -= e.recoil * (boss ? 6 : 2);
  }
  if (e.hitAnim > 0) {
    const k = e.hitAnim / e.hitMax;
    pose.sx = 1 - 0.1 * k;
    pose.sy = 1 + 0.05 * k;
    pose.flap = 0.6 * k;
    if (e.hitKind === 'sword') {
      pose.torso -= 0.65 * k;
      pose.arm -= 1.2 * k;
      pose.hipY += 7 * k;
      pose.hipX -= 5 * k;
      pose.feet = [[12, 0], [-16, 0]];
    } else {
      // sharp snap then settle: head/shoulders whip back, knees give slightly
      const snap = k > 0.6 ? 1 : k / 0.6;
      pose.torso -= 0.3 * snap;
      pose.arm -= 0.4 * snap;
      pose.hipX -= 4 * snap;
      pose.hipY += 2 * snap;
      pose.feet = [[pose.feet[0][0] + 3 * snap, pose.feet[0][1]], [pose.feet[1][0] - 3 * snap, pose.feet[1][1]]];
    }
  }
  return pose;
}

function updateEnemy(e, dt) {
  e.recoil = Math.max(0, e.recoil - dt * 6);
  e.hitAnim = Math.max(0, e.hitAnim - dt);
  e.startle = Math.max(0, e.startle - dt);
  if (e.dead) {
    e.deadT += dt;
    if (e.onGround) e.vx *= 0.88;
    moveBody(e, dt);
    e.pose = enemyPose(e);
    return;
  }
  e.hurt -= dt;
  e.stagger -= dt;
  e.alertT -= dt;
  e.flashT -= dt;
  if (e.kind === 'boss') {
    updateBoss(e, dt);
    e.pose = enemyPose(e);
    return;
  }
  const dx = player.x - e.x;
  const dist = Math.abs(dx);
  if (!e.alert) {
    if (e.kind === 'gunner') {
      e.vx = 0;
      e.scanTimer -= dt;
      if (e.scanTimer <= 0) {
        e.dir *= -1;
        e.scanTimer = 2.5 + Math.random() * 2;
      }
    } else if (e.scanT > 0) {
      e.vx = 0;
      const prev = e.scanT;
      e.scanT -= dt;
      for (const th of [0.9, 0.5, 0.2]) if (prev > th && e.scanT <= th) e.dir *= -1;
    } else {
      e.vx = e.dir * 55;
      if ((e.x <= e.minX && e.dir < 0) || (e.x >= e.maxX && e.dir > 0) || e.hitWall) e.scanT = 1.4;
    }
    if (sees(e)) {
      e.alert = true;
      e.alertT = 0.7;
      e.startle = 0.25;
      e.scanT = 0;
      e.dir = Math.sign(dx) || 1;
      e.cool = 0.6 + Math.random() * 0.5;
      e.crouch = !!coverFor(e) && e.kind === 'gunner';
      beep(1400, 0.08, 'square', 0.04, 1);
    }
  } else if (e.stagger > 0) {
    e.vx *= 0.9;
  } else if (player.dead) {
    e.vx = 0;
    e.crouch = false;
  } else {
    e.dir = Math.sign(dx) || e.dir;
    const cover = coverFor(e);
    let want = 0;
    if (e.kind === 'rusher') {
      if (dist > 140) want = e.dir * 170;
    } else if (e.kind === 'patrol') {
      if (cover && dist > 180) want = 0;
      else if (dist > 380) want = e.dir * 90;
      else if (dist < 170) want = -e.dir * 80;
    }
    if (e.aimT > 0) want = e.kind === 'rusher' ? want * 0.25 : 0;
    if ((e.x <= e.minX && want < 0) || (e.x >= e.maxX && want > 0)) want = 0;
    e.vx = want;
    e.cool -= dt;
    if (e.aimT > 0) {
      e.aimT -= dt;
      e.crouch = false;
      if (e.aimT <= 0) {
        if (canShoot(e) || Math.random() < 0.35) enemyFire(e);
        const base = e.kind === 'rusher' ? 1.1 : e.kind === 'gunner' ? 1.9 : 1.6;
        e.cool = base + Math.random() * 0.7;
      }
    } else if (e.cool <= 0 && dist < 620 && Math.abs(player.y - e.y) < 260) {
      if (canShoot(e) || (cover && Math.random() < 0.3)) {
        e.aimT = e.kind === 'rusher' ? 0.38 : 0.55;
        beep(1900, 0.05, 'square', 0.03, 1);
      } else e.cool = 0.35;
    } else if (cover && e.kind !== 'rusher' && e.cool > 0.3) {
      e.crouch = true;
    } else if (!cover) e.crouch = false;
    if (e.kind === 'rusher' && dist < 40 && Math.abs(player.y - e.y) < 30) hurtPlayer(1, e.dir);
  }
  if (e.crouch) e.vx = 0;
  const target = !e.alert ? 0.65 : e.aimT > 0 ? 0 : 0.3;
  e.armA += (target - e.armA) * Math.min(1, dt * 12);
  moveBody(e, dt);
  e.walkPh += (Math.abs(e.vx) * dt) / 70;
  e.pose = enemyPose(e);
}

function shotgunBlast(e) {
  const m = muzzleOf(e);
  const base = Math.atan2(playerTargetY() - m.y, player.x - m.x);
  comic(m.x + e.dir * 30, m.y - 26, 'BOOM!', '#ff8a1e', 26);
  for (let i = 0; i < 6; i++) {
    const a = base + (i - 2.5) * 0.08 + (Math.random() - 0.5) * 0.04;
    bullets.push({ x: m.x, y: m.y, vx: Math.cos(a) * 640, vy: Math.sin(a) * 640, owner: 'enemy', life: 0.55, pellet: true });
  }
  e.flashT = 0.1;
  e.recoil = 1;
  flashes.push({ x: m.x + e.dir * 20, y: m.y, r: 220, life: 0.1, max: 0.1, color: '255,180,80' });
  burst(m.x + e.dir * 20, m.y, '#ffd070', 10, 300);
  for (let i = 0; i < 5; i++) {
    particles.push({ x: m.x + e.dir * 10, y: m.y, vx: e.dir * (40 + i * 30), vy: -20, life: 0.7, color: 'rgba(170,170,180,0.35)', kind: 'smoke', size: 12 });
  }
  particles.push({ x: e.x, y: m.y, vx: -e.dir * 80, vy: -250, life: 1.6, color: '#c02020', kind: 'shell', size: 4, rot: 0, floor: e.y });
  play('shotgun', 0.6);
  shake = Math.max(shake, 10);
}

function updateBoss(e, dt) {
  const dx = player.x - e.x;
  const dist = Math.abs(dx);
  const phase2 = e.hp < e.maxHp / 2;
  const spd = phase2 ? 1.3 : 1;
  e.patT -= dt;
  let armT = 0.25;
  switch (e.pattern) {
    case 'dormant':
      e.vx = 0;
      armT = 0.6;
      if (bossActive && e.patT <= 0) {
        e.pattern = 'idle';
        e.patT = 0.4;
      }
      break;
    case 'idle':
      e.crouch = false;
      e.dir = Math.sign(dx) || e.dir;
      e.vx = dist > 300 ? e.dir * 80 * spd : 0;
      if (e.hitWall && dist > 300) startCover(e);
      else if (e.patT <= 0) {
        const r = Math.random();
        if (e.hp <= e.coverAt) {
          e.coverAt -= 15;
          startCover(e);
        } else if (dist < 340 && r < 0.6) {
          e.pattern = 'pump';
          e.patT = phase2 ? 0.45 : 0.7;
          e.blasts = phase2 ? 2 : 1;
          beep(300, 0.08, 'square', 0.06, 2);
        } else if (r < 0.88) {
          e.pattern = 'windup';
          e.patT = phase2 ? 0.45 : 0.6;
          beep(120, 0.4, 'sawtooth', 0.06, 0.5);
        } else startCover(e);
      }
      break;
    case 'pump':
      e.vx = 0;
      e.crouch = false;
      armT = 0;
      e.dir = Math.sign(dx) || e.dir;
      if (e.patT <= 0) {
        shotgunBlast(e);
        e.vx = -e.dir * 60;
        e.blasts--;
        if (e.blasts > 0) {
          e.patT = 0.5;
          beep(300, 0.08, 'square', 0.06, 2);
        } else {
          e.pattern = 'recover';
          e.patT = 0.7;
        }
      }
      break;
    case 'windup':
      e.vx = 0;
      armT = 0.5;
      e.dir = Math.sign(dx) || e.dir;
      e.chargeDir = e.dir;
      if (e.patT <= 0) {
        e.pattern = 'charge';
        e.patT = 1.6;
      }
      break;
    case 'charge': {
      armT = 0.6;
      e.vx = e.chargeDir * 400 * spd;
      if (overlaps(boxOf(player), boxOf(e))) hurtPlayer(2, e.chargeDir);
      if (Math.random() < 0.3) burst(e.x - e.chargeDir * 20, e.y, 'rgba(140,140,150,0.4)', 1, 60, 'smoke', 0.4);
      if (e.hitWall) {
        e.pattern = 'stun';
        e.patT = 1.6;
        shake = 16;
        play('hit', 0.5);
        burst(e.x + e.chargeDir * 30, e.y - 70, '#fff0a0', 14, 350);
        banner = { text: 'STUNNED!', t: 1, small: true };
      } else if (e.patT <= 0 || (player.x - e.x) * e.chargeDir < -180) {
        e.pattern = 'recover';
        e.patT = 0.6;
      }
      break;
    }
    case 'stun':
      e.vx = 0;
      armT = 1;
      if (e.patT <= 0) {
        e.pattern = 'idle';
        e.patT = 0.5;
      }
      break;
    case 'cover':
      armT = 0.4;
      if (Math.abs(e.x - e.coverX) > 10 && !e.inCover) {
        e.dir = Math.sign(e.coverX - e.x);
        e.vx = e.dir * 160 * spd;
        if (e.hitWall) e.inCover = true;
      } else {
        e.inCover = true;
        e.vx = 0;
        e.dir = Math.sign(dx) || e.dir;
        e.crouch = true;
        e.coverHold -= dt;
        if (e.coverHold <= 0) {
          e.crouch = false;
          e.pattern = 'pump';
          e.patT = 0.4;
          e.blasts = phase2 ? 2 : 1;
          beep(300, 0.08, 'square', 0.06, 2);
        }
      }
      if (e.patT <= 0 && !e.inCover) {
        e.pattern = 'idle';
        e.patT = 0.3;
      }
      break;
    case 'recover':
    default:
      e.vx *= 0.85;
      e.crouch = false;
      if (e.patT <= 0) {
        e.pattern = 'idle';
        e.patT = 0.4 + Math.random() * 0.6;
      }
  }
  e.armA += (armT - e.armA) * Math.min(1, dt * 10);
  moveBody(e, dt);
  e.walkPh += (Math.abs(e.vx) * dt) / 95;
  const fr = Math.floor(e.walkPh * 8) % 8;
  if (fr !== e.lastFr && (fr === 0 || fr === 4) && Math.abs(e.vx) > 20) {
    shake = Math.max(shake, e.pattern === 'charge' ? 6 : 3);
    burst(e.x, e.y, 'rgba(140,140,150,0.45)', 3, 70, 'smoke', 0.5);
    beep(55, 0.14, 'sine', 0.14, 0.6);
  }
  e.lastFr = fr;
}

function startCover(e) {
  const bars = solids.filter((s) => s.type === 'barrier' && !s.dead);
  if (!bars.length) {
    e.pattern = 'idle';
    e.patT = 0.5;
    return;
  }
  bars.sort((a, b) => Math.abs(a.x - e.x) - Math.abs(b.x - e.x));
  const b = bars[0];
  const cx = b.x + b.w / 2;
  const side = Math.sign(cx - player.x) || 1;
  e.coverX = cx + side * (b.w / 2 + e.w / 2 + 6);
  e.pattern = 'cover';
  e.inCover = false;
  e.patT = 3;
  e.coverHold = 1.3 + Math.random() * 0.6;
}

// ---------- Hazards & moving platforms ----------
function hazardState(h) {
  const ph = (lvT + (h.off || 0)) % h.period;
  if (h.t === 'crusher') {
    let k = 0;
    if (ph > 2.2 && ph < 2.35) k = (ph - 2.2) / 0.15;
    else if (ph >= 2.35 && ph < 2.9) k = 1;
    else if (ph >= 2.9) k = 1 - (ph - 2.9) / 0.3;
    return { k, warn: ph > 1.5 && ph < 2.2, active: ph > 2.25 && ph < 2.9, ph };
  }
  if (h.t === 'electric') return { active: ph < h.on, warn: ph > h.period - 0.5, ph };
  return { active: ph < 0.9, warn: ph > h.period - 0.5, ph };
}

function updateWorld(dt) {
  for (const p of platforms) {
    if (!p.move) continue;
    const m = p.move;
    const ph = (lvT % m.period) / m.period;
    let k = 0.5 - 0.5 * Math.cos(ph * Math.PI * 2);
    if (m.hold) k = clamp((k - 0.12) / 0.76, 0, 1);
    const nx = lerp(m.ax, m.bx, k);
    const ny = lerp(m.ay, m.by, k);
    p.dx = nx - p.x;
    p.dy = ny - p.y;
    p.x = nx;
    p.y = ny;
    for (const b of [player, ...enemies, ...pickups]) {
      if (b.plat === p && b.onGround && !b.climb) {
        b.x += p.dx;
        b.y += p.dy;
      }
    }
  }
  for (const s of solids) {
    if (s.type === 'door' && s.opening && s.open < 1) s.open = Math.min(1, s.open + dt * 2.5);
  }
  const pb = boxOf(player);
  for (const h of hazards) {
    const st = hazardState(h);
    if (h.t === 'crusher') {
      if (st.active && overlaps(pb, { x: h.x, y: h.y - 110, w: h.w, h: 110 })) hurtPlayer(2, Math.sign(player.x - (h.x + h.w / 2)) || 1);
      if (st.ph > 2.35 && st.ph - dt <= 2.35 && Math.abs(h.x - player.x) < 900) {
        shake = Math.max(shake, 8);
        play('hit', 0.4);
        burst(h.x + h.w / 2, h.y, 'rgba(150,150,160,0.5)', 8, 160, 'smoke', 0.6);
        burst(h.x + h.w / 2, h.y - 4, '#ffd070', 10, 300);
      }
    } else if (h.t === 'electric') {
      if (st.active && player.onGround && player.y === GROUND && player.x > h.x && player.x < h.x + h.w) {
        if (player.inv <= 0 && !player.dead) {
          hurtPlayer(1, 0);
          player.vy = -520;
          burst(player.x, player.y - 20, '#a0e0ff', 14, 300);
        }
      }
      if (st.active && Math.random() < 0.5) {
        particles.push({ x: h.x + Math.random() * h.w, y: h.y - 2, vx: (Math.random() - 0.5) * 200, vy: -Math.random() * 250, life: 0.25, color: '#b0e8ff', kind: 'spark', size: 2, floor: GROUND });
      }
    } else if (h.t === 'steam') {
      if (st.active) {
        if (Math.random() < 0.7) particles.push({ x: h.x + (Math.random() - 0.5) * 16, y: h.y - 4, vx: (Math.random() - 0.5) * 30, vy: -160 - Math.random() * 120, life: 0.8, color: 'rgba(220,220,230,0.35)', kind: 'smoke', size: 8 });
        if (overlaps(pb, { x: h.x - 18, y: h.y - 130, w: 36, h: 130 })) hurtPlayer(1, Math.sign(player.x - h.x) || 1);
      } else if (st.warn && Math.random() < 0.2) {
        particles.push({ x: h.x, y: h.y - 4, vx: (Math.random() - 0.5) * 20, vy: -40, life: 0.5, color: 'rgba(220,220,230,0.25)', kind: 'smoke', size: 4 });
      }
    }
  }
  // ambient: steam pipes and sparking boxes
  for (const d of decor) {
    if (Math.abs(d.x - camX - W / 2) > W) continue;
    if (d.t === 'steampipe' && Math.random() < 0.15) {
      particles.push({ x: d.x + 40, y: d.y + 4, vx: 30 + Math.random() * 30, vy: -20, life: 1, color: 'rgba(200,200,210,0.22)', kind: 'smoke', size: 6 });
    }
    if (d.t === 'sparkbox' && Math.random() < 0.012) {
      for (let i = 0; i < 10; i++) particles.push({ x: d.x + 14, y: d.y + 20, vx: (Math.random() - 0.3) * 260, vy: -Math.random() * 200, life: 0.4 + Math.random() * 0.3, color: i % 2 ? '#fff6b0' : '#ffb040', kind: 'spark', size: 2, floor: surfaceBelow(d.x, d.y + 30) });
      flashes.push({ x: d.x + 14, y: d.y + 20, r: 70, life: 0.08, max: 0.08, color: '255,220,140' });
      beep(3000, 0.05, 'sawtooth', 0.02, 0.3);
    }
  }
}

// ---------- Bullets ----------
function updateBullets(dt) {
  for (const b of bullets) {
    const steps = Math.ceil((Math.hypot(b.vx, b.vy) * dt) / 14);
    for (let i = 0; i < steps && b.life > 0; i++) {
      b.x += (b.vx * dt) / steps;
      b.y += (b.vy * dt) / steps;
      const s = blockerAt(b.x, b.y);
      if (s) {
        b.life = 0;
        const wood = s.type === 'crate' || s.type === 'breakable' || s.type === 'barricade';
        ricochet(b.x, b.y, Math.sign(b.vx), wood);
        if (b.owner === 'player' && ['breakable', 'breakwall', 'barricade'].includes(s.type)) damageCrate(s, 1);
        break;
      }
      if (b.y > GROUND) {
        b.life = 0;
        ricochet(b.x, GROUND, Math.sign(b.vx), false);
        break;
      }
      if (b.owner === 'player') {
        for (const e of enemies) {
          if (!e.dead && e.pattern !== 'dormant' && inRect(b.x, b.y, boxOf(e))) {
            b.life = 0;
            damageEnemy(e, 1, Math.sign(b.vx), 'gun');
            break;
          }
        }
      } else if (!player.dead && inRect(b.x, b.y, boxOf(player))) {
        b.life = 0;
        hurtPlayer(1, Math.sign(b.vx));
      }
    }
    b.life -= dt;
  }
  bullets = bullets.filter((b) => b.life > 0);
}

function updateParticles(dt) {
  for (const pt of particles) {
    pt.life -= dt;
    pt.x += pt.vx * dt;
    pt.y += pt.vy * dt;
    if (pt.kind === 'smoke') {
      pt.size += dt * 20;
      continue;
    }
    pt.vy += 1100 * dt;
    if (pt.kind === 'shell' || pt.kind === 'gun') pt.rot = (pt.rot || 0) + dt * (pt.kind === 'gun' ? 8 : 20) * (pt.vy === 0 ? 0 : 1);
    const fl = pt.floor || GROUND;
    if (pt.y > fl && pt.vy > 0) {
      pt.y = fl;
      if (pt.kind === 'shell' || pt.kind === 'wood' || pt.kind === 'gun') {
        if (pt.kind === 'shell' && pt.vy > 120) beep(4000 + Math.random() * 1500, 0.02, 'triangle', 0.015, 0.9);
        pt.vy *= -0.35;
        pt.vx *= 0.6;
        if (Math.abs(pt.vy) < 30) pt.vy = 0;
      } else pt.life = 0;
    }
  }
  particles = particles.filter((pt) => pt.life > 0);
  for (const f of flashes) f.life -= dt;
  flashes = flashes.filter((f) => f.life > 0);
}

// ---------- Main update ----------
function update(dt) {
  tT += dt;
  if (banner) {
    banner.t -= dt;
    if (banner.t <= 0) banner = null;
  }
  if (state === 'title' || state === 'over' || state === 'win') {
    if (hit('Enter')) {
      reset();
      state = 'intro';
      introT = 0;
      music.currentTime = 0;
      music.volume = 0.45;
      music.play().catch(() => {});
    }
    if (state === 'title') {
      camX = (tT * 30) % 1000;
      camY = WH - H;
    }
    return;
  }
  if (state === 'intro') {
    introT += dt;
    if (introT > 0.8 && introT - dt <= 0.8) {
      beep(1500, 0.05, 'square', 0.06, 0.6);
      beep(700, 0.15, 'square', 0.05, 0.5);
      const m = playerMuzzle();
      flashes.push({ x: m.x, y: m.y, r: 60, life: 0.15, max: 0.15, color: '255,255,255' });
    }
    if (introT > 1.6) state = 'play';
    lvT += dt;
    updateParticles(dt);
    return;
  }
  lvT += dt;
  if (state === 'victory') {
    vicT += dt / Math.max(0.01, timeScale);
    if (vicT > 1.4) timeScale = 1;
    music.volume = Math.max(0, 0.45 - vicT * 0.1);
    for (const e of enemies) updateEnemy(e, dt);
    updateParticles(dt);
    player.vx *= 0.9;
    moveBody(player, dt);
    player.aimHold = 0;
    player.idleT += dt;
    player.pose = playerPose(player);
    if (vicT > 5 && hit('Enter')) state = 'win';
    return;
  }

  updateWorld(dt);
  updatePlayer(dt);
  for (const e of enemies) {
    if (Math.abs(e.x - player.x) > 1400 && !e.dead) continue;
    updateEnemy(e, dt);
    if (!e.dead) applyConveyor(e, dt);
  }
  updateBullets(dt);
  updatePickups(dt);
  updateParticles(dt);

  const sec = secIndex(player.x);
  if (sec !== lastSec) {
    lastSec = sec;
    banner = { text: SECTIONS[sec].name, t: 2.2 };
  }
  if (!bossActive && player.x > 5980) {
    bossActive = true;
    solids.push({ x: 5880, y: 0, w: 20, h: GROUND, type: 'wall' });
    const boss = enemies.find((e) => e.kind === 'boss');
    boss.patT = 2;
    banner = { text: 'THE WAREHOUSE ENFORCER', t: 2.4, boss: true };
    shake = 14;
    play('shotgun', 0.5);
  }
  updateCamera(dt);
  shake *= Math.pow(0.004, dt);
  flashT -= dt;
}

function updateCamera(dt) {
  let tx = player.x - W * 0.4 + player.dir * 60;
  const minX = bossActive ? 5880 : 0;
  tx = clamp(tx, minX, WORLD_R + 20 - W);
  const ty = clamp(player.y - 340, 0, WH - H);
  camX += (tx - camX) * Math.min(1, dt * 5);
  camY += (ty - camY) * Math.min(1, dt * 4);
}

// ---------- Rendering ----------
function drawChar(img, x, y, h, dir, anchor, o = {}) {
  if (!ready(img)) return;
  const dw = (h * img.naturalWidth) / img.naturalHeight;
  ctx.save();
  ctx.translate(Math.round(x), Math.round(y));
  ctx.scale(dir, 1);
  if (o.filter) ctx.filter = o.filter;
  ctx.drawImage(img, -anchor * dw, -h, dw, h);
  ctx.restore();
}

function lampIntensity(l, i) {
  const st = SECTIONS[l.sec].style;
  if (st === 'sodium') return 0.26 + 0.03 * Math.sin(tT * 3 + i);
  if (st === 'fluoro') return (tT * 1.7 + i * 0.37) % 4 < 0.08 ? 0.04 : 0.2;
  if (st === 'office') return (tT * 0.9 + i * 0.53) % 5 < 0.06 ? 0.05 : 0.17;
  if (st === 'alarm') return 0.07 + 0.28 * Math.max(0, Math.sin(tT * 4 + i));
  if (i % 2 && Math.random() < 0.08) return 0.03;
  return 0.22;
}

function tintAt(wx) {
  const i = Math.max(0, secIndex(wx));
  const s = SECTIONS[i];
  let c = s.tint;
  const n = SECTIONS[i + 1];
  if (n && wx > s.x1 - 300) {
    const k = (wx - (s.x1 - 300)) / 300;
    c = c.map((v, j) => v + (n.tint[j] - v) * k);
  }
  return `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},0.42)`;
}

function drawBackground() {
  if (ready(IMG.bg)) {
    const bw = H * (IMG.bg.naturalWidth / IMG.bg.naturalHeight);
    const off = (camX * 0.25) % bw;
    for (let x = -off; x < W; x += bw) ctx.drawImage(IMG.bg, x, 0, bw, H);
  } else {
    ctx.fillStyle = '#0b0e16';
    ctx.fillRect(0, 0, W, H);
  }
  ctx.fillStyle = 'rgba(4,6,14,0.55)';
  ctx.fillRect(0, 0, W, H);
  const gr = ctx.createLinearGradient(0, 0, W, 0);
  for (let i = 0; i <= 8; i++) gr.addColorStop(i / 8, tintAt(camX + (i * W) / 8));
  ctx.fillStyle = gr;
  ctx.fillRect(0, 0, W, H);

  const base = GROUND - camY * 0.8 - 100;
  for (const m of mids) {
    const sx = m.x - camX * 0.6;
    if (sx + m.w < 0 || sx > W) continue;
    const top = base - m.h;
    ctx.fillStyle = 'rgba(6,8,14,0.82)';
    if (m.sec === 0) {
      ctx.fillRect(sx, top, m.w, m.h);
      ctx.fillStyle = 'rgba(70,50,30,0.35)';
      for (let y = top + 20; y < base; y += 40) {
        ctx.fillRect(sx, y, m.w, 3);
        for (let x = sx + 6; x < sx + m.w - 16; x += 22 + m.v * 10) ctx.fillRect(x, y - 14, 14, 14);
      }
    } else if (m.sec === 1) {
      const rows = Math.floor(m.h / 50);
      for (let r = 0; r < rows; r++) {
        const y = base - (r + 1) * 50;
        ctx.fillStyle = ['rgba(20,40,40,0.85)', 'rgba(45,25,20,0.85)', 'rgba(15,22,32,0.85)'][((m.v * 7 + r) % 3) | 0];
        ctx.fillRect(sx, y, m.w, 48);
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        for (let x = sx + 4; x < sx + m.w; x += 8) ctx.fillRect(x, y + 4, 2, 40);
      }
    } else if (m.sec === 2) {
      ctx.fillRect(sx, base - 160, m.w, 160);
      ctx.fillStyle = 'rgba(200,190,140,0.08)';
      ctx.fillRect(sx + 8, base - 140, m.w - 16, 50);
    } else if (m.sec === 3) {
      ctx.fillRect(sx + m.w * 0.2, top, m.w * 0.6, m.h);
      ctx.beginPath();
      ctx.ellipse(sx + m.w / 2, top, m.w * 0.3, 10, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(sx - 30, top + 40 + m.v * 60, m.w + 60, 10);
      ctx.strokeStyle = 'rgba(90,20,20,0.4)';
      ctx.lineWidth = 3;
      ctx.save();
      ctx.translate(sx + m.w / 2, top + m.h * 0.5);
      ctx.rotate(tT * (m.v > 0.5 ? 1 : -1));
      ctx.beginPath();
      ctx.arc(0, 0, 18, 0, Math.PI * 2);
      for (let k = 0; k < 6; k++) {
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos((k * Math.PI) / 3) * 22, Math.sin((k * Math.PI) / 3) * 22);
      }
      ctx.stroke();
      ctx.restore();
    } else {
      ctx.strokeStyle = 'rgba(70,90,130,0.25)';
      ctx.lineWidth = 1;
      for (let x = sx; x < sx + m.w + 20; x += 10) {
        ctx.beginPath();
        ctx.moveTo(x, base - 200);
        ctx.lineTo(x + 10, base);
        ctx.moveTo(x + 10, base - 200);
        ctx.lineTo(x, base);
        ctx.stroke();
      }
      ctx.fillRect(sx, base - 205, m.w + 20, 6);
    }
  }
}

const vis = (x, w = 0) => x + w > camX - 100 && x < camX + W + 100;

function drawRooms() {
  for (const r of rooms) {
    if (!vis(r.x, r.w)) continue;
    if (r.s === 'office') {
      ctx.fillStyle = '#1d1b17';
      ctx.fillRect(r.x, r.y, r.w, r.h);
      ctx.fillStyle = '#2a2219';
      ctx.fillRect(r.x, r.y + r.h - 70, r.w, 70);
      ctx.fillStyle = '#3a2e20';
      ctx.fillRect(r.x, r.y + r.h - 72, r.w, 3);
      for (let x = r.x + 60; x < r.x + r.w - 100; x += 210) {
        ctx.fillStyle = '#0c1018';
        ctx.fillRect(x, r.y + 40, 90, 80);
        ctx.fillStyle = 'rgba(120,150,190,0.18)';
        for (let y = r.y + 44; y < r.y + 118; y += 6) ctx.fillRect(x + 3, y, 84, 3);
        ctx.fillStyle = '#3a3428';
        ctx.fillRect(x - 3, r.y + 37, 96, 4);
        ctx.fillRect(x - 3, r.y + 120, 96, 4);
        ctx.fillStyle = '#2a261e';
        ctx.fillRect(x + 120, r.y + 60, 30, 22);
        ctx.fillStyle = '#4a4030';
        ctx.fillRect(x + 123, r.y + 63, 24, 16);
      }
    } else if (r.s === 'secret') {
      ctx.fillStyle = '#100c0a';
      ctx.fillRect(r.x, r.y, r.w, r.h);
      ctx.fillStyle = '#2a1e14';
      for (let x = r.x + 10; x < r.x + r.w; x += 40) ctx.fillRect(x, r.y + 70, 30, 45);
    } else if (r.s === 'armory') {
      ctx.fillStyle = '#0c1220';
      ctx.fillRect(r.x, r.y, r.w, r.h);
      ctx.fillStyle = '#1e2a40';
      for (let x = r.x + 10; x < r.x + r.w - 10; x += 14) ctx.fillRect(x, r.y + 20, 4, 40);
    } else if (r.s === 'shaft') {
      ctx.fillStyle = '#0a0b0f';
      ctx.fillRect(r.x, r.y, r.w, r.h);
      ctx.fillStyle = '#16181f';
      for (let y = r.y; y < r.y + r.h; y += 30) ctx.fillRect(r.x, y, r.w, 2);
      ctx.fillStyle = '#c8a020';
      ctx.font = '700 9px Orbitron';
      ctx.fillText('SHAFT 3', r.x + 50, r.y + 120);
    }
  }
}

function drawLamps() {
  lamps.forEach((l, i) => {
    if (!vis(l.x - 250, 500)) return;
    const s = SECTIONS[l.sec];
    const inten = lampIntensity(l, i);
    const top = l.top;
    const fl = l.floor;
    const tube = s.style === 'fluoro' || s.style === 'office';
    const wide = tube ? 36 : 14;
    const spread = Math.min(230, (fl - top) * 0.55);
    const gr = ctx.createLinearGradient(0, top, 0, fl);
    gr.addColorStop(0, `rgba(${s.lamp},${inten})`);
    gr.addColorStop(1, `rgba(${s.lamp},0)`);
    ctx.fillStyle = gr;
    ctx.beginPath();
    ctx.moveTo(l.x - wide, top);
    ctx.lineTo(l.x + wide, top);
    ctx.lineTo(l.x + spread, fl);
    ctx.lineTo(l.x - spread, fl);
    ctx.fill();
    const pool = ctx.createRadialGradient(l.x, fl, 5, l.x, fl, spread);
    pool.addColorStop(0, `rgba(${s.lamp},${inten * 0.8})`);
    pool.addColorStop(1, `rgba(${s.lamp},0)`);
    ctx.fillStyle = pool;
    ctx.fillRect(l.x - spread, fl - 30, spread * 2, 30);
    ctx.fillStyle = '#111';
    ctx.fillRect(l.x - 1, top - 40, 2, 34);
    ctx.fillStyle = '#20242c';
    ctx.fillRect(l.x - wide - 6, top - 8, wide * 2 + 12, 8);
    ctx.fillStyle = `rgba(${s.lamp},${0.4 + inten * 2})`;
    ctx.fillRect(l.x - wide, top - 2, wide * 2, 3);
    // drifting dust motes caught in the light cone
    ctx.fillStyle = `rgba(${s.lamp},${Math.min(0.55, inten * 3)})`;
    for (let d = 0; d < 7; d++) {
      const ph = tT * (0.05 + d * 0.013) + d * 0.37 + i * 0.61;
      const v = ph % 1;
      const yy = top + 10 + v * (fl - top - 20);
      const half = wide + (spread - wide) * ((yy - top) / (fl - top));
      const xx = l.x + Math.sin(ph * 6.28 + d * 2.1) * half * 0.7;
      ctx.fillRect(Math.round(xx / 2) * 2, Math.round(yy / 2) * 2, 2, 2);
    }
  });
}

function drawSign(d) {
  ctx.font = '700 11px Orbitron';
  const w = ctx.measureText(d.text).width + 20;
  ctx.fillStyle = '#121212';
  ctx.fillRect(d.x - 2, d.y - 2, w + 4, 28);
  ctx.fillStyle = d.c;
  ctx.fillRect(d.x, d.y, w, 24);
  ctx.fillStyle = '#111';
  ctx.fillText(d.text, d.x + 10, d.y + 16);
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.fillRect(d.x + w * 0.6, d.y, w * 0.4, 24);
}

function drawDecor() {
  for (const d of decor) {
    if (!vis(d.x, 120)) continue;
    const y = d.y ?? GROUND;
    switch (d.t) {
      case 'sign':
        drawSign(d);
        break;
      case 'hook':
        ctx.fillStyle = '#2a2a30';
        ctx.fillRect(d.x, y - 300, 3, 300);
        ctx.strokeStyle = '#5a5a60';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(d.x + 1, y + 12, 10, -Math.PI / 2, Math.PI * 0.9);
        ctx.stroke();
        break;
      case 'fan': {
        ctx.fillStyle = '#14161c';
        ctx.beginPath();
        ctx.arc(d.x, y, d.r + 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.save();
        ctx.translate(d.x, y);
        ctx.rotate(tT * 6);
        ctx.fillStyle = '#2c303a';
        for (let k = 0; k < 4; k++) {
          ctx.rotate(Math.PI / 2);
          ctx.beginPath();
          ctx.ellipse(d.r * 0.5, 0, d.r * 0.48, d.r * 0.18, 0.3, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
        ctx.strokeStyle = '#3a3f4a';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(d.x, y, d.r + 4, 0, Math.PI * 2);
        for (let k = -d.r; k <= d.r; k += 10) {
          ctx.moveTo(d.x + k, y - d.r);
          ctx.lineTo(d.x + k, y + d.r);
        }
        ctx.stroke();
        ctx.fillStyle = '#555';
        ctx.fillRect(d.x - 4, y - 4, 8, 8);
        break;
      }
      case 'steampipe':
        ctx.fillStyle = '#2a2024';
        ctx.fillRect(d.x - 200, y, 240, 12);
        ctx.fillStyle = '#4a3a3c';
        for (let x = d.x - 200; x < d.x + 40; x += 60) ctx.fillRect(x, y - 3, 6, 18);
        ctx.fillStyle = '#5a2020';
        ctx.fillRect(d.x + 30, y - 6, 14, 24);
        break;
      case 'sparkbox':
        ctx.fillStyle = '#2a2e36';
        ctx.fillRect(d.x, d.y, 30, 40);
        ctx.fillStyle = '#c8a020';
        ctx.fillRect(d.x + 4, d.y + 4, 22, 6);
        ctx.strokeStyle = '#111';
        ctx.beginPath();
        ctx.moveTo(d.x + 15, d.y + 40);
        ctx.lineTo(d.x + 20, d.y + 60);
        ctx.stroke();
        break;
      case 'piston': {
        const k = (Math.sin(tT * 2.5) + 1) / 2;
        ctx.fillStyle = '#1a1c22';
        ctx.fillRect(d.x, y - 260, 50, 30);
        ctx.fillStyle = '#5a5f6a';
        ctx.fillRect(d.x + 20, y - 230, 10, 60 + k * 100);
        ctx.fillStyle = '#2c3038';
        ctx.fillRect(d.x + 5, y - 170 + k * 100, 40, 20);
        break;
      }
      case 'graffiti':
        ctx.strokeStyle = 'rgba(200,40,40,0.7)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(d.x + 40, d.y);
        ctx.lineTo(d.x, d.y);
        ctx.moveTo(d.x + 10, d.y - 8);
        ctx.lineTo(d.x, d.y);
        ctx.lineTo(d.x + 10, d.y + 8);
        ctx.stroke();
        ctx.fillStyle = 'rgba(200,40,40,0.7)';
        ctx.font = '700 10px Orbitron';
        ctx.fillText('STASH', d.x + 2, d.y - 14);
        break;
      case 'shutter':
        ctx.fillStyle = '#181c24';
        ctx.fillRect(d.x - 60, GROUND - 200, 160, 200);
        ctx.fillStyle = '#262c38';
        for (let yy = GROUND - 196; yy < GROUND; yy += 10) ctx.fillRect(d.x - 56, yy, 152, 5);
        ctx.fillStyle = '#c8a020';
        ctx.font = '700 12px Orbitron';
        ctx.fillText('EXIT', d.x + 2, GROUND - 210);
        break;
    }
  }
  for (const b of decals) {
    if (!vis(b.x)) continue;
    ctx.fillStyle = 'rgba(90,0,8,0.75)';
    ctx.beginPath();
    ctx.ellipse(b.x, b.y - 1, b.w / 2, 4, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  for (const d of decor) {
    if (!vis(d.x, 80)) continue;
    const y = d.y ?? GROUND;
    if (d.t === 'barrel') {
      ctx.fillStyle = '#3a1416';
      ctx.fillRect(d.x, y - 52, 32, 52);
      ctx.fillStyle = '#5a2224';
      ctx.fillRect(d.x + 4, y - 52, 6, 52);
      ctx.fillStyle = '#1a0a0c';
      ctx.fillRect(d.x, y - 40, 32, 3);
      ctx.fillRect(d.x, y - 16, 32, 3);
    } else if (d.t === 'pallet') {
      ctx.fillStyle = '#4a3420';
      ctx.fillRect(d.x, y - 12, 70, 4);
      ctx.fillRect(d.x, y - 4, 70, 4);
      ctx.fillStyle = '#2a1c10';
      for (let i = 0; i < 3; i++) ctx.fillRect(d.x + i * 30, y - 8, 10, 4);
    } else if (d.t === 'glass') {
      ctx.fillStyle = 'rgba(170,220,240,0.7)';
      for (let i = 0; i < 7; i++) {
        const gx = d.x + ((i * 37) % 60);
        ctx.beginPath();
        ctx.moveTo(gx, y);
        ctx.lineTo(gx + 3 + (i % 3), y - 2 - (i % 2) * 2);
        ctx.lineTo(gx + 6, y);
        ctx.fill();
      }
    } else if (d.t === 'toolbox') {
      ctx.fillStyle = '#8a1a1a';
      ctx.fillRect(d.x, y - 18, 34, 18);
      ctx.fillStyle = '#300';
      ctx.fillRect(d.x + 10, y - 23, 14, 5);
    } else if (d.t === 'cooler') {
      ctx.fillStyle = '#c8c8c0';
      ctx.fillRect(d.x, y - 50, 22, 50);
      ctx.fillStyle = 'rgba(120,180,230,0.7)';
      ctx.fillRect(d.x + 2, y - 72, 18, 22);
    } else if (d.t === 'plant') {
      ctx.fillStyle = '#4a2a18';
      ctx.fillRect(d.x, y - 20, 20, 20);
      ctx.fillStyle = '#1e3a20';
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.ellipse(d.x + 10 + (i - 2) * 5, y - 32 - (i % 2) * 8, 4, 14, (i - 2) * 0.4, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (d.t === 'deskdeco') {
      ctx.fillStyle = '#3a2a1a';
      ctx.fillRect(d.x, y - 34, 80, 6);
      ctx.fillRect(d.x + 4, y - 28, 6, 28);
      ctx.fillRect(d.x + 70, y - 28, 6, 28);
      ctx.fillStyle = '#d8d0b8';
      ctx.fillRect(d.x + 14, y - 38, 18, 4);
      ctx.fillStyle = '#2a2a30';
      ctx.fillRect(d.x + 44, y - 58, 26, 20);
      ctx.fillStyle = 'rgba(80,200,120,0.6)';
      ctx.fillRect(d.x + 47, y - 55, 20, 14);
    }
  }
}

function drawLadders() {
  for (const l of ladders) {
    if (!vis(l.x - 20, 40)) continue;
    ctx.fillStyle = '#5a5040';
    ctx.fillRect(l.x - 12, l.top - 30, 3, l.bottom - l.top + 30);
    ctx.fillRect(l.x + 9, l.top - 30, 3, l.bottom - l.top + 30);
    ctx.fillStyle = '#8a7a58';
    for (let y = l.top - 24; y < l.bottom; y += 14) ctx.fillRect(l.x - 10, y, 20, 3);
    ctx.fillStyle = '#c8a020';
    ctx.fillRect(l.x - 12, l.top - 32, 24, 3);
  }
}

function hazard(x, y, w, h) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  ctx.fillStyle = '#c8a020';
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = '#111';
  for (let i = -h; i < w; i += 16) {
    ctx.beginPath();
    ctx.moveTo(x + i, y + h);
    ctx.lineTo(x + i + 8, y + h);
    ctx.lineTo(x + i + 8 + h, y);
    ctx.lineTo(x + i + h, y);
    ctx.fill();
  }
  ctx.restore();
}

function drawPlatforms() {
  for (const p of platforms) {
    if (!vis(p.x, p.w)) continue;
    if (p.kind === 'floor') {
      ctx.fillStyle = '#2a2d36';
      ctx.fillRect(p.x, p.y, p.w, 16);
      ctx.fillStyle = '#41465a';
      ctx.fillRect(p.x, p.y, p.w, 3);
      ctx.fillStyle = '#15171d';
      ctx.fillRect(p.x, p.y + 13, p.w, 3);
      ctx.fillStyle = '#5a6070';
      for (let x = p.x + 8; x < p.x + p.w; x += 32) ctx.fillRect(x, p.y + 7, 2, 2);
    } else if (p.kind === 'step') {
      ctx.fillStyle = '#4c5366';
      ctx.fillRect(p.x, p.y, p.w, 4);
      ctx.fillStyle = '#2a2e3a';
      ctx.fillRect(p.x, p.y + 4, p.w, 6);
      ctx.fillStyle = '#5a6070';
      ctx.fillRect(p.x + p.w - 2, p.y - 30, 2, 30);
      ctx.fillRect(p.x, p.y - 30, p.w, 2);
    } else if (p.kind === 'lift') {
      const vertical = p.move && p.move.ax === p.move.bx;
      if (vertical) {
        ctx.strokeStyle = '#2a2a30';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(p.x + 6, 560);
        ctx.lineTo(p.x + 6, p.y);
        ctx.moveTo(p.x + p.w - 6, 560);
        ctx.lineTo(p.x + p.w - 6, p.y);
        ctx.stroke();
        ctx.fillStyle = '#1c1e24';
        ctx.fillRect(p.x - 10, 540, p.w + 20, 24);
        ctx.fillStyle = Math.sin(tT * 8) > 0 ? '#e0a020' : '#503010';
        ctx.fillRect(p.x + p.w / 2 - 4, 548, 8, 8);
      } else {
        ctx.fillStyle = '#1a1c22';
        ctx.fillRect(p.move.ax, p.move.ay + 18, p.move.bx - p.move.ax + p.w, 4);
      }
      ctx.fillStyle = '#3a3f4c';
      ctx.fillRect(p.x, p.y, p.w, 14);
      hazard(p.x, p.y, p.w, 5);
      ctx.fillStyle = '#20232c';
      ctx.fillRect(p.x + 4, p.y + 14, p.w - 8, 4);
    } else {
      ctx.fillStyle = '#353a48';
      ctx.fillRect(p.x, p.y, p.w, 12);
      ctx.fillStyle = '#4c5366';
      ctx.fillRect(p.x, p.y, p.w, 3);
      ctx.fillStyle = '#20232c';
      for (let x = p.x + 4; x < p.x + p.w; x += 8) ctx.fillRect(x, p.y + 5, 4, 5);
      if (p.w > 80) {
        ctx.fillStyle = '#4a5062';
        for (let x = p.x; x <= p.x + p.w; x += 24) ctx.fillRect(x, p.y - 24, 3, 24);
        ctx.fillRect(p.x, p.y - 26, p.w, 3);
        ctx.fillStyle = '#1a1d25';
        if (p.y > 800) {
          ctx.fillRect(p.x + 10, p.y + 12, 7, GROUND - p.y - 12);
          ctx.fillRect(p.x + p.w - 17, p.y + 12, 7, GROUND - p.y - 12);
        } else {
          ctx.fillStyle = '#3c3f48';
          ctx.fillRect(p.x + 10, p.y - 300, 2, 300);
          ctx.fillRect(p.x + p.w - 12, p.y - 300, 2, 300);
        }
      }
    }
  }
}

function drawHazards() {
  for (const h of hazards) {
    if (!vis(h.x - 50, (h.w || 0) + 100)) continue;
    const st = hazardState(h);
    if (h.t === 'crusher') {
      const headY = lerp(h.top + 40, h.y - 30, st.k);
      ctx.fillStyle = '#1a1c22';
      ctx.fillRect(h.x - 15, h.top, h.w + 30, 40);
      ctx.fillStyle = '#5a5f6a';
      ctx.fillRect(h.x + h.w / 2 - 8, h.top + 40, 16, headY - h.top - 40);
      ctx.fillStyle = '#2c3038';
      ctx.fillRect(h.x, headY, h.w, 30);
      hazard(h.x, headY + 24, h.w, 6);
      ctx.fillStyle = st.warn && Math.sin(tT * 30) > 0 ? '#ff2020' : '#401010';
      ctx.fillRect(h.x + h.w + 4, h.top + 10, 10, 10);
      hazard(h.x - 10, h.y - 4, h.w + 20, 4);
    } else if (h.t === 'electric') {
      ctx.fillStyle = '#1a1e26';
      ctx.fillRect(h.x, h.y - 6, h.w, 6);
      ctx.fillStyle = '#2e3644';
      for (let x = h.x; x < h.x + h.w; x += 10) ctx.fillRect(x, h.y - 6, 5, 6);
      if (st.active) {
        ctx.strokeStyle = 'rgba(170,230,255,0.9)';
        ctx.lineWidth = 2;
        for (let a = 0; a < 4; a++) {
          ctx.beginPath();
          let x = h.x + Math.random() * h.w;
          ctx.moveTo(x, h.y - 4);
          for (let s = 0; s < 5; s++) {
            x += (Math.random() - 0.5) * 30;
            ctx.lineTo(x, h.y - 6 - s * 8 - Math.random() * 6);
          }
          ctx.stroke();
        }
        ctx.fillStyle = 'rgba(120,200,255,0.12)';
        ctx.fillRect(h.x, h.y - 60, h.w, 60);
      } else if (st.warn && Math.random() < 0.5) {
        ctx.fillStyle = 'rgba(170,230,255,0.6)';
        ctx.fillRect(h.x + Math.random() * h.w, h.y - 8, 3, 3);
      }
    } else if (h.t === 'steam') {
      ctx.fillStyle = '#2a2e36';
      ctx.fillRect(h.x - 14, h.y - 6, 28, 6);
      ctx.fillStyle = st.warn ? '#e08020' : '#3a3f4a';
      ctx.fillRect(h.x - 8, h.y - 8, 16, 2);
    }
  }
  for (const c of conveyors) {
    if (!vis(c.x, c.w)) continue;
    ctx.fillStyle = '#20232a';
    ctx.fillRect(c.x, c.y - 8, c.w, 8);
    ctx.fillStyle = '#4a505c';
    const o = (lvT * Math.abs(c.speed)) % 16;
    for (let x = c.x + (c.speed < 0 ? 16 - o : o); x < c.x + c.w; x += 16) ctx.fillRect(x, c.y - 8, 8, 3);
    ctx.fillStyle = '#15171c';
    for (let x = c.x + 10; x < c.x + c.w; x += 40) {
      ctx.beginPath();
      ctx.arc(x, c.y - 4, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function drawSolids() {
  for (const s of solids) {
    if (s.dead || !vis(s.x, s.w)) continue;
    switch (s.type) {
      case 'crate':
      case 'breakable':
        if (ready(IMG.crate)) {
          ctx.save();
          if (s.type === 'breakable') ctx.filter = 'sepia(1) saturate(1.6) hue-rotate(-10deg) brightness(1.15)';
          ctx.drawImage(IMG.crate, s.x, s.y, s.w, s.h);
          ctx.restore();
          // crisp pixel bevel: lit top/left, shadowed bottom/right, ink outline
          ctx.fillStyle = 'rgba(255,230,180,0.22)';
          ctx.fillRect(s.x + 2, s.y + 2, s.w - 4, 2);
          ctx.fillRect(s.x + 2, s.y + 2, 2, s.h - 4);
          ctx.fillStyle = 'rgba(0,0,0,0.35)';
          ctx.fillRect(s.x + 2, s.y + s.h - 4, s.w - 4, 2);
          ctx.fillRect(s.x + s.w - 4, s.y + 2, 2, s.h - 4);
          ctx.strokeStyle = '#0a0706';
          ctx.lineWidth = 2;
          ctx.strokeRect(s.x + 1, s.y + 1, s.w - 2, s.h - 2);
        } else {
          ctx.fillStyle = '#5a3a22';
          ctx.fillRect(s.x, s.y, s.w, s.h);
        }
        if (s.type === 'breakable') {
          ctx.fillStyle = 'rgba(20,10,0,0.8)';
          ctx.font = '700 8px Orbitron';
          ctx.fillText('FRAGILE', s.x + 12, s.y + 36);
          crackLines(s);
        }
        ctx.fillStyle = 'rgba(0,0,0,0.35)';
        ctx.fillRect(s.x, s.y + s.h - 6, s.w, 6);
        break;
      case 'machine': {
        const gr = ctx.createLinearGradient(s.x, 0, s.x + s.w, 0);
        gr.addColorStop(0, '#2c313c');
        gr.addColorStop(0.5, '#3e4452');
        gr.addColorStop(1, '#1c2028');
        ctx.fillStyle = gr;
        ctx.fillRect(s.x, s.y, s.w, s.h);
        hazard(s.x, s.y, s.w, 10);
        ctx.fillStyle = '#15181e';
        ctx.fillRect(s.x + 12, s.y + 22, s.w - 24, 40);
        ctx.save();
        ctx.translate(s.x + s.w / 2, s.y + 42);
        ctx.rotate(lvT * 3);
        ctx.strokeStyle = '#5a5f6a';
        ctx.lineWidth = 3;
        ctx.beginPath();
        for (let k = 0; k < 6; k++) {
          ctx.moveTo(0, 0);
          ctx.lineTo(Math.cos(k) * 14, Math.sin(k) * 14);
        }
        ctx.stroke();
        ctx.restore();
        ctx.fillStyle = Math.sin(tT * 6) > 0 ? '#e02020' : '#401010';
        ctx.fillRect(s.x + s.w - 20, s.y + 75, 8, 8);
        break;
      }
      case 'truck':
        ctx.fillStyle = '#2a3038';
        ctx.fillRect(s.x, s.y, s.w, s.h - 24);
        ctx.fillStyle = '#353d48';
        for (let x = s.x + 6; x < s.x + s.w; x += 24) ctx.fillRect(x, s.y + 4, 3, s.h - 32);
        ctx.fillStyle = 'rgba(160,40,30,0.6)';
        ctx.font = '700 14px Orbitron';
        ctx.fillText('MORETTI BROS. FREIGHT', s.x + 30, s.y + 64);
        ctx.fillStyle = '#111';
        ctx.fillRect(s.x + 10, s.y + s.h - 24, s.w - 20, 6);
        ctx.beginPath();
        ctx.arc(s.x + 50, s.y + s.h - 12, 12, 0, Math.PI * 2);
        ctx.arc(s.x + 80, s.y + s.h - 12, 12, 0, Math.PI * 2);
        ctx.arc(s.x + s.w - 50, s.y + s.h - 12, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#4a505c';
        ctx.fillRect(s.x, s.y, s.w, 3);
        break;
      case 'forklift':
        ctx.fillStyle = '#b08a18';
        ctx.fillRect(s.x + 20, s.y + 10, s.w - 30, s.h - 22);
        ctx.fillStyle = '#222';
        ctx.fillRect(s.x + 50, s.y - 40, 4, 50);
        ctx.fillRect(s.x + s.w - 14, s.y - 40, 4, 50);
        ctx.fillRect(s.x + 50, s.y - 42, s.w - 60, 4);
        ctx.fillRect(s.x + 4, s.y - 30, 6, s.h + 30);
        ctx.fillStyle = '#111';
        ctx.beginPath();
        ctx.arc(s.x + 35, GROUND - 12, 12, 0, Math.PI * 2);
        ctx.arc(s.x + s.w - 20, GROUND - 12, 12, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'barrier':
        ctx.fillStyle = '#6a6c70';
        ctx.beginPath();
        ctx.moveTo(s.x + 10, s.y);
        ctx.lineTo(s.x + s.w - 10, s.y);
        ctx.lineTo(s.x + s.w, s.y + s.h);
        ctx.lineTo(s.x, s.y + s.h);
        ctx.fill();
        ctx.fillStyle = '#a01818';
        ctx.fillRect(s.x + 4, s.y + 30, s.w - 8, 8);
        ctx.fillStyle = '#ddd';
        ctx.fillRect(s.x + 4, s.y + 40, s.w - 8, 4);
        break;
      case 'desk':
        ctx.fillStyle = '#4a3220';
        ctx.fillRect(s.x, s.y, s.w, s.h);
        ctx.fillStyle = '#6a4a30';
        ctx.fillRect(s.x - 4, s.y, s.w + 8, 6);
        ctx.fillStyle = '#2a1c10';
        ctx.fillRect(s.x + 6, s.y + 14, s.w - 12, 3);
        ctx.fillRect(s.x + 6, s.y + 30, s.w - 12, 3);
        ctx.fillStyle = '#d8d0b8';
        ctx.fillRect(s.x + 10, s.y - 3, 16, 3);
        break;
      case 'cabinet':
        ctx.fillStyle = '#4a4e56';
        ctx.fillRect(s.x, s.y, s.w, s.h);
        ctx.fillStyle = '#2a2e36';
        for (let i = 0; i < 3; i++) {
          ctx.fillRect(s.x + 3, s.y + 4 + i * 23, s.w - 6, 19);
          ctx.fillStyle = '#8a8e96';
          ctx.fillRect(s.x + s.w / 2 - 5, s.y + 12 + i * 23, 10, 3);
          ctx.fillStyle = '#2a2e36';
        }
        break;
      case 'breakwall':
        ctx.fillStyle = '#4a4440';
        ctx.fillRect(s.x, s.y, s.w, s.h);
        ctx.fillStyle = '#3a3430';
        for (let y = s.y; y < s.y + s.h; y += 12) ctx.fillRect(s.x, y, s.w, 2);
        ctx.strokeStyle = '#1a1614';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(s.x + 4, s.y + 20);
        ctx.lineTo(s.x + 14, s.y + 46);
        ctx.lineTo(s.x + 6, s.y + 70);
        ctx.lineTo(s.x + 16, s.y + 96);
        if (s.hp < 4) {
          ctx.moveTo(s.x + 16, s.y + 10);
          ctx.lineTo(s.x + 4, s.y + 60);
        }
        ctx.stroke();
        break;
      case 'barricade':
        ctx.fillStyle = '#5a3a20';
        for (let i = 0; i < 6; i++) ctx.fillRect(s.x - 4, s.y + 8 + i * 22, s.w + 8, 14);
        ctx.fillStyle = '#3a2410';
        ctx.fillRect(s.x + 2, s.y, 6, s.h);
        ctx.fillRect(s.x + s.w - 8, s.y, 6, s.h);
        ctx.fillStyle = 'rgba(220,60,40,0.8)';
        ctx.font = '700 9px Orbitron';
        ctx.save();
        ctx.translate(s.x + 16, s.y + 110);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText('KEEP OUT', 0, 0);
        ctx.restore();
        crackLines(s);
        break;
      case 'door': {
        ctx.fillStyle = '#0c0d10';
        ctx.fillRect(s.x - 4, s.y - 6, s.w + 8, s.h + 6);
        const lift = s.open * (s.h - 8);
        ctx.fillStyle = s.lock === 'red' ? '#4a2a2a' : s.lock === 'blue' ? '#2a3450' : '#3a3e48';
        ctx.fillRect(s.x, s.y, s.w, s.h - lift);
        ctx.fillStyle = '#1a1c22';
        for (let y = s.y + 6; y < s.y + s.h - lift; y += 14) ctx.fillRect(s.x, y, s.w, 2);
        const lit = !s.lock || player.keys[s.lock] || s.open > 0;
        ctx.fillStyle = lit ? '#30e060' : s.lock === 'red' ? '#ff3030' : '#3080ff';
        ctx.fillRect(s.x + (s.x > player.x ? -12 : s.w + 4), s.y + 44, 6, 8);
        break;
      }
      case 'ceiling':
        ctx.fillStyle = '#16181e';
        ctx.fillRect(s.x, s.y, s.w, s.h);
        hazard(s.x, s.y + s.h - 6, s.w, 6);
        break;
      case 'wall':
        ctx.fillStyle = '#12151c';
        ctx.fillRect(s.x, s.y, s.w, s.h);
        ctx.fillStyle = '#1e232e';
        for (let y = s.y; y < s.y + s.h; y += 12) ctx.fillRect(s.x, y, s.w, 5);
        break;
    }
  }
}

function crackLines(s) {
  const max = s.type === 'barricade' ? 4 : 3;
  if (s.hp >= max) return;
  ctx.strokeStyle = '#1a0e04';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(s.x + 6, s.y + 8);
  ctx.lineTo(s.x + s.w * 0.5, s.y + s.h * 0.45);
  ctx.lineTo(s.x + s.w * 0.35, s.y + s.h * 0.8);
  if (s.hp < max - 1) {
    ctx.moveTo(s.x + s.w - 6, s.y + 12);
    ctx.lineTo(s.x + s.w * 0.55, s.y + s.h * 0.6);
  }
  ctx.stroke();
}

// ---------- Comic-book impact captions (visual only) ----------
const comics = [];
function comic(x, y, txt, col = '#ffd23a', size = 22) {
  comics.push({ x, y, txt, col, size, t0: tT, rot: (Math.random() - 0.5) * 0.4 });
  if (comics.length > 10) comics.shift();
}
function drawComics() {
  for (let i = comics.length - 1; i >= 0; i--) {
    const c = comics[i];
    const age = tT - c.t0;
    if (age > 0.65 || age < 0) {
      comics.splice(i, 1);
      continue;
    }
    const sc = age < 0.07 ? lerp(0.3, 1.3, age / 0.07) : age < 0.13 ? lerp(1.3, 1, (age - 0.07) / 0.06) : 1;
    ctx.save();
    ctx.globalAlpha = age > 0.45 ? 1 - (age - 0.45) / 0.2 : 1;
    ctx.translate(Math.round(c.x), Math.round(c.y - age * 30));
    ctx.rotate(c.rot);
    ctx.scale(sc, sc);
    const r = c.size * 1.6;
    ctx.beginPath();
    for (let k = 0; k < 20; k++) {
      const rr = k % 2 ? r * 0.62 : r;
      const a = (k / 20) * Math.PI * 2;
      ctx.lineTo(Math.cos(a) * rr * 1.35, Math.sin(a) * rr * 0.8);
    }
    ctx.closePath();
    ctx.fillStyle = '#fff6dc';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#0a0808';
    ctx.stroke();
    ctx.font = `900 ${c.size}px Impact, Orbitron, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineWidth = 5;
    ctx.strokeText(c.txt, 0, 1);
    ctx.fillStyle = c.col;
    ctx.fillText(c.txt, 0, 1);
    ctx.restore();
  }
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
}

function muzzleFlash(x, y, dir, s = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(dir * s, s);
  const fr = Math.floor(tT * 30) % 2;
  const g = ctx.createRadialGradient(8, 0, 0, 8, 0, 34);
  g.addColorStop(0, 'rgba(255,200,90,0.45)');
  g.addColorStop(1, 'rgba(255,160,40,0)');
  ctx.fillStyle = g;
  ctx.fillRect(-26, -34, 68, 68);
  // hard-edged pixel star (two alternating frames)
  ctx.fillStyle = '#ff8a1e';
  ctx.beginPath();
  if (fr) {
    ctx.moveTo(0, -6); ctx.lineTo(18, -14); ctx.lineTo(14, -4); ctx.lineTo(34, 0);
    ctx.lineTo(14, 4); ctx.lineTo(18, 14); ctx.lineTo(0, 6);
  } else {
    ctx.moveTo(0, -5); ctx.lineTo(24, -8); ctx.lineTo(16, -2); ctx.lineTo(28, 0);
    ctx.lineTo(16, 2); ctx.lineTo(24, 8); ctx.lineTo(0, 5);
  }
  ctx.fill();
  ctx.fillStyle = '#fff8d0';
  ctx.beginPath();
  ctx.moveTo(0, -3); ctx.lineTo(14, -6); ctx.lineTo(10, -1); ctx.lineTo(22, 0);
  ctx.lineTo(10, 1); ctx.lineTo(14, 6); ctx.lineTo(0, 3);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, -2, 8, 4);
  ctx.restore();
}

function drawEnemy(e) {
  const isBoss = e.kind === 'boss';
  if (!vis(e.x - 60, 120)) return;
  const pose = e.pose || enemyPose(e);
  if (e.dead) {
    const t = e.deadT;
    if (t > 4) return;
    drawRig(enemyRig(e), e.x, e.y, e.dir, pose, { alpha: t > 2.5 ? 1 - (t - 2.5) / 1.5 : 1, filter: t > 0.6 ? 'brightness(0.75)' : undefined });
    return;
  }
  const o = {
    white: e.hurt > 0,
    clip: e.crouch,
    sink: e.crouch ? e.h * 0.45 : 0,
  };
  if (isBoss && e.pattern === 'windup') o.filter = 'brightness(1.3) sepia(0.6) hue-rotate(-30deg)';
  drawRig(enemyRig(e), e.x, e.y, e.dir, pose, o);
  const m = rigPoint(enemyRig(e), e.x, e.y, e.dir, pose);
  if (e.crouch) m.y += e.h * 0.45;
  if (e.flashT > 0) muzzleFlash(m.x, m.y, e.dir, isBoss ? 1.8 : 1);
  if (e.alertT > 0 && !isBoss) {
    ctx.fillStyle = '#ffd030';
    ctx.font = '700 22px Orbitron';
    ctx.fillText('!', e.x - 5, e.y - e.h - 12);
  }
  if (e.scanT > 0 && !e.alert) {
    ctx.fillStyle = 'rgba(200,200,200,0.7)';
    ctx.font = '700 14px Orbitron';
    ctx.fillText('?', e.x - 4, e.y - e.h - 10);
  }
  if (e.aimT > 0 || (isBoss && e.pattern === 'pump')) {
    const pulse = 0.5 + 0.5 * Math.sin(tT * 40);
    ctx.fillStyle = `rgba(255,40,30,${0.5 + pulse * 0.5})`;
    ctx.beginPath();
    ctx.arc(m.x, m.y, 3 + pulse * 4, 0, Math.PI * 2);
    ctx.fill();
  }
  if (isBoss && e.pattern === 'stun') {
    for (let i = 0; i < 3; i++) {
      const a = tT * 5 + (i * Math.PI * 2) / 3;
      ctx.fillStyle = '#ffe060';
      ctx.fillRect(e.x + Math.cos(a) * 26 - 3, e.y - e.h - 10 + Math.sin(a) * 6, 6, 6);
    }
  }
}

function drawPlayer() {
  const p = player;
  const R = RIG.viktor;
  let pose = p.pose || playerPose(p);
  if (state === 'intro') {
    pose = { ...playerPose(p) };
    const t = introT;
    if (t < 0.55) pose.arm = 1.3;
    else if (t < 0.8) pose.arm = lerp(1.3, -0.4, easeOut((t - 0.55) / 0.25));
    else if (t < 1.0) pose.arm = lerp(-0.4, 0, (t - 0.8) / 0.2);
    else pose.arm = 0;
    pose.torso = t < 0.55 ? 0.03 : 0;
    drawRig(R, p.x, p.y, p.dir, pose);
    if (t > 0.8 && t < 1.05) {
      const m = rigPoint(R, p.x, p.y, p.dir, pose);
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.fillRect(m.x - 10, m.y - 1, 20, 2);
      ctx.fillRect(m.x - 1, m.y - 10, 2, 20);
    }
    return;
  }
  if (p.dead) {
    drawRig(R, p.x, p.y, p.dir, pose, { filter: p.deathT > 0.6 ? 'brightness(0.8)' : undefined });
    return;
  }
  if (p.inv > 0 && p.hurtT <= 0 && Math.floor(p.inv * 18) % 2) return;
  drawRig(R, p.x, p.y, p.dir, pose, { white: p.hurtT > 0 });
  if (p.flashT > 0) {
    const m = rigPoint(R, p.x, p.y, p.dir, pose);
    muzzleFlash(m.x, m.y, p.dir, 1.1);
  }
  if (p.slashT > 0) {
    const s = SLASH - p.slashT;
    if (s > 0.04 && s < 0.22) {
      const sh = rigPoint(R, p.x, p.y, p.dir, { ...pose, arm: 0, armOff: -((R.muz[0] - R.piv[0]) * rigDW(R)) });
      const a1 = pose.sword + (pose.torso || 0);
      const a0 = Math.max(-2.4, a1 - 2.6);
      const fade = s < 0.12 ? 1 : 1 - (s - 0.12) / 0.1;
      ctx.save();
      ctx.translate(sh.x, sh.y);
      ctx.scale(p.dir, 1);
      // comic smear: solid crescent + speed lines
      ctx.fillStyle = `rgba(230,245,255,${0.35 * fade})`;
      ctx.beginPath();
      ctx.arc(0, 0, 92, a0, a1);
      ctx.arc(0, 0, 40, a1, a0, true);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = `rgba(255,255,255,${0.7 * fade})`;
      ctx.lineWidth = 2;
      for (let i = 0; i < 4; i++) {
        const a = a0 + ((a1 - a0) * (i + 0.5)) / 4;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * 96, Math.sin(a) * 96);
        ctx.lineTo(Math.cos(a) * 112, Math.sin(a) * 112);
        ctx.stroke();
      }
      for (let i = 0; i < 3; i++) {
        ctx.strokeStyle = [`rgba(255,255,255,${0.9 * fade})`, `rgba(170,220,255,${0.6 * fade})`, `rgba(80,140,255,${0.3 * fade})`][i];
        ctx.lineWidth = 7 - i * 2;
        ctx.beginPath();
        ctx.arc(0, 0, 80 - i * 9, a0, a1);
        ctx.stroke();
      }
      ctx.restore();
    }
  }
}

function drawPickups() {
  for (const k of pickups) {
    if (!vis(k.x)) continue;
    const y = k.y - 20 + Math.sin(k.t * 5) * 2;
    ctx.fillStyle = `rgba(255,255,255,${0.15 + 0.1 * Math.sin(k.t * 8)})`;
    ctx.beginPath();
    ctx.arc(k.x, y + 10, 20, 0, Math.PI * 2);
    ctx.fill();
    if (k.type === 'health') {
      ctx.fillStyle = '#e8e8e8';
      ctx.fillRect(k.x - 11, y, 22, 20);
      ctx.fillStyle = '#c01020';
      ctx.fillRect(k.x - 3, y + 3, 6, 14);
      ctx.fillRect(k.x - 8, y + 7, 16, 6);
    } else if (k.type === 'ammo') {
      ctx.fillStyle = '#4a5a2a';
      ctx.fillRect(k.x - 12, y + 2, 24, 18);
      ctx.fillStyle = '#e0b040';
      for (let i = 0; i < 4; i++) ctx.fillRect(k.x - 9 + i * 5, y - 4, 3, 8);
    } else {
      ctx.fillStyle = k.color === 'red' ? '#d02028' : '#2860e0';
      ctx.fillRect(k.x - 13, y + 2, 26, 17);
      ctx.fillStyle = '#e8e8e8';
      ctx.fillRect(k.x - 13, y + 6, 26, 3);
      ctx.fillStyle = '#e0c040';
      ctx.fillRect(k.x - 9, y + 12, 6, 5);
    }
  }
}

function drawFX() {
  for (const b of bullets) {
    ctx.save();
    ctx.translate(b.x, b.y);
    ctx.rotate(Math.atan2(b.vy, b.vx));
    const len = b.owner === 'player' ? 26 : b.pellet ? 8 : 16;
    const grd = ctx.createLinearGradient(-len, 0, 0, 0);
    const c = b.owner === 'player' ? '255,240,170' : '255,120,80';
    grd.addColorStop(0, `rgba(${c},0)`);
    grd.addColorStop(1, `rgba(${c},1)`);
    ctx.fillStyle = grd;
    ctx.fillRect(-len, -1.5, len, 3);
    ctx.fillStyle = '#fff';
    ctx.fillRect(-3, -1, 4, 2);
    ctx.restore();
  }
  for (const pt of particles) {
    if (pt.kind === 'smoke') {
      ctx.fillStyle = pt.color;
      ctx.globalAlpha = Math.min(1, pt.life * 2);
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    } else if (pt.kind === 'shell' || pt.kind === 'gun') {
      ctx.save();
      ctx.translate(pt.x, pt.y);
      ctx.rotate(pt.rot || 0);
      ctx.fillStyle = pt.color;
      if (pt.kind === 'gun') {
        ctx.fillRect(-8, -3, 16, 4);
        ctx.fillRect(-8, 0, 4, 7);
      } else ctx.fillRect(-3, -1.5, 6, 3);
      ctx.restore();
    } else {
      ctx.fillStyle = pt.color;
      ctx.fillRect(pt.x, pt.y, pt.size, pt.size);
    }
  }
  ctx.globalCompositeOperation = 'lighter';
  for (const f of flashes) {
    const a = f.life / f.max;
    const gr = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.r);
    gr.addColorStop(0, `rgba(${f.color},${0.55 * a})`);
    gr.addColorStop(1, `rgba(${f.color},0)`);
    ctx.fillStyle = gr;
    ctx.fillRect(f.x - f.r, f.y - f.r, f.r * 2, f.r * 2);
  }
  ctx.globalCompositeOperation = 'source-over';
}

function drawWorld() {
  drawBackground();
  ctx.save();
  const sx = (Math.random() - 0.5) * shake;
  const sy = (Math.random() - 0.5) * shake;
  ctx.translate(-Math.round(camX) + sx, -Math.round(camY) + sy);
  drawRooms();
  drawLamps();
  ctx.fillStyle = '#14161d';
  ctx.fillRect(camX - 50, GROUND, W + 100, WH - GROUND + 40);
  ctx.fillStyle = '#262a35';
  for (let x = Math.floor(camX / 96) * 96; x < camX + W + 96; x += 96) {
    ctx.fillRect(x, GROUND, 92, 3);
    ctx.fillStyle = '#1b1e27';
    ctx.fillRect(x + 20, GROUND + 18, 50, 2);
    ctx.fillStyle = '#262a35';
  }
  drawDecor();
  drawLadders();
  drawHazards();
  drawPlatforms();
  drawPickups();
  for (const e of enemies) if (e.dead) drawEnemy(e);
  for (const e of enemies) if (!e.dead) drawEnemy(e);
  drawPlayer();
  drawSolids();
  drawFX();
  drawComics();
  ctx.restore();
  const v = ctx.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, H * 0.95);
  v.addColorStop(0, 'rgba(0,0,0,0)');
  v.addColorStop(1, 'rgba(0,0,0,0.65)');
  ctx.fillStyle = v;
  ctx.fillRect(0, 0, W, H);
}

function drawHUD() {
  const p = player;
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  ctx.fillRect(12, 10, 300, 52);
  ctx.font = '700 15px Orbitron';
  ctx.fillStyle = '#e8e2d0';
  ctx.fillText('VIKTOR', 22, 31);
  for (let i = 0; i < p.maxHp; i++) {
    ctx.fillStyle = i < p.hp ? (p.hp <= 2 && Math.sin(tT * 10) > 0 ? '#ff6060' : '#d01828') : '#3a0c10';
    ctx.fillRect(100 + i * 24, 18, 20, 14);
    if (i < p.hp) {
      ctx.fillStyle = 'rgba(255,255,255,0.25)';
      ctx.fillRect(100 + i * 24, 18, 20, 3);
    }
  }
  for (let i = 0; i < p.mag; i++) {
    ctx.fillStyle = i < p.ammo ? '#e0b040' : '#3a3020';
    ctx.fillRect(22 + i * 9, 42, 5, 12);
  }
  ctx.font = '700 12px Orbitron';
  ctx.fillStyle = p.reloadT > 0 ? '#ff6050' : '#c8c0a8';
  ctx.fillText(p.reloadT > 0 ? 'RELOADING' : '/ ' + p.reserve, 135, 53);
  ['red', 'blue'].forEach((c, i) => {
    if (!p.keys[c]) return;
    ctx.fillStyle = c === 'red' ? '#d02028' : '#2860e0';
    ctx.fillRect(225 + i * 34, 40, 26, 16);
    ctx.fillStyle = '#e8e8e8';
    ctx.fillRect(225 + i * 34, 44, 26, 2);
  });
  ctx.textAlign = 'right';
  ctx.font = '700 18px Orbitron';
  ctx.fillStyle = '#ffcc60';
  ctx.fillText(String(score).padStart(7, '0'), W - 20, 34);
  ctx.font = '700 11px Orbitron';
  ctx.fillStyle = '#a8a090';
  ctx.fillText(`SECRETS ${p.secrets}/${secrets.length}`, W - 20, 52);
  ctx.textAlign = 'left';

  const boss = enemies.find((e) => e.kind === 'boss');
  if (bossActive && boss && (!boss.dead || state === 'victory')) {
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(220, H - 52, 520, 38);
    ctx.font = '700 12px Orbitron';
    ctx.fillStyle = '#e8e2d0';
    ctx.fillText('THE WAREHOUSE ENFORCER', 232, H - 36);
    ctx.fillStyle = '#300';
    ctx.fillRect(232, H - 30, 496, 10);
    ctx.fillStyle = '#d01828';
    ctx.fillRect(232, H - 30, 496 * Math.max(0, boss.hp / boss.maxHp), 10);
  }
  if (banner) {
    const a = Math.min(1, banner.t * 2);
    ctx.textAlign = 'center';
    if (banner.boss) {
      ctx.fillStyle = `rgba(0,0,0,${0.6 * a})`;
      ctx.fillRect(0, 200, W, 90);
      ctx.fillStyle = `rgba(208,24,40,${a})`;
      ctx.font = '700 36px Orbitron';
      ctx.fillText(banner.text, W / 2, 252);
      ctx.fillStyle = `rgba(230,220,200,${a})`;
      ctx.font = '600 14px Inter';
      ctx.fillText('He was paid to make sure you never left this building.', W / 2, 276);
    } else {
      ctx.fillStyle = `rgba(232,226,208,${a})`;
      ctx.font = banner.small ? '700 16px Orbitron' : '700 26px Orbitron';
      ctx.fillText(banner.text, W / 2, banner.small ? 110 : 120);
      if (!banner.small) {
        ctx.fillStyle = `rgba(208,24,40,${a})`;
        ctx.fillRect(W / 2 - 140, 130, 280, 2);
      }
    }
    ctx.textAlign = 'left';
  }
  if (flashT > 0) {
    ctx.fillStyle = `rgba(255,20,20,${flashT * 1.6})`;
    ctx.fillRect(0, 0, W, H);
  }
}

function letterbox(k) {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, W, 70 * k);
  ctx.fillRect(0, H - 70 * k, W, 70 * k);
}

function drawTitle() {
  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.fillRect(0, 0, W, H);
  const glow = ctx.createRadialGradient(W * 0.72, 300, 20, W * 0.72, 300, 340);
  glow.addColorStop(0, 'rgba(200,20,30,0.6)');
  glow.addColorStop(1, 'rgba(200,20,30,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);
  drawChar(IMG.aim, W * 0.68, H - 40, 400, -1, 0.33, { filter: 'brightness(0.12) contrast(1.4)' });
  letterbox(1);
  const ease = easeOut(Math.min(1, tT * 1.2));
  ctx.font = '700 64px Orbitron';
  ctx.fillStyle = '#000';
  ctx.fillText('VIKTOR', 64 - (1 - ease) * 400, 204);
  ctx.fillText('VEGA', 64 - (1 - ease) * 600, 270);
  ctx.fillStyle = '#e8e2d0';
  ctx.fillText('VIKTOR', 60 - (1 - ease) * 400, 200);
  ctx.fillStyle = '#d01828';
  ctx.fillText('VEGA', 60 - (1 - ease) * 600, 266);
  if (tT > 0.9) {
    ctx.globalAlpha = Math.min(1, (tT - 0.9) * 2);
    ctx.fillStyle = '#d01828';
    ctx.fillRect(62, 284, 330, 3);
    ctx.font = '700 24px Orbitron';
    ctx.fillStyle = '#e8e2d0';
    ctx.fillText(': THE SETUP', 62, 318);
    ctx.font = 'italic 600 14px Inter';
    ctx.fillStyle = '#b8b0a0';
    ctx.fillText('"Thirty years of loyalty. One bullet of thanks."', 62, 352);
    ctx.globalAlpha = 1;
  }
  ctx.font = '600 12px Inter';
  ctx.fillStyle = '#8a8478';
  ctx.fillText('MOVE A/D  RUN SHIFT  JUMP SPACE/W  CLIMB W/S ON LADDERS  CROUCH S  DROP S+JUMP', 62, 400);
  ctx.fillText('SHOOT J/Z  SWORD K/X  RELOAD R  MUTE M', 62, 420);
  if (Math.floor(tT * 2) % 2 && tT > 1.2) {
    ctx.font = '700 20px Orbitron';
    ctx.fillStyle = '#ffcc60';
    ctx.fillText('PRESS ENTER', 62, 456);
  }
  ctx.font = '600 11px Orbitron';
  ctx.fillStyle = '#5a5448';
  ctx.textAlign = 'right';
  ctx.fillText('© 1994 ROSEBUD SOFT  •  LICENSED FOR 16-BIT', W - 20, H - 26);
  ctx.textAlign = 'left';
}

function drawEnd(title, sub, lines) {
  ctx.fillStyle = 'rgba(0,0,0,0.78)';
  ctx.fillRect(0, 0, W, H);
  letterbox(1);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#d01828';
  ctx.font = '700 54px Orbitron';
  ctx.fillText(title, W / 2, 200);
  ctx.fillStyle = '#e8e2d0';
  ctx.font = '700 18px Orbitron';
  ctx.fillText(sub, W / 2, 240);
  ctx.fillStyle = '#c8c0a8';
  ctx.font = '600 16px Inter';
  lines.forEach((l, i) => ctx.fillText(l, W / 2, 300 + i * 28));
  if (Math.floor(tT * 2) % 2) {
    ctx.fillStyle = '#ffcc60';
    ctx.font = '700 20px Orbitron';
    ctx.fillText('PRESS ENTER', W / 2, 430);
  }
  ctx.textAlign = 'left';
}

function render() {
  drawWorld();
  if (state === 'title') {
    drawTitle();
  } else {
    drawHUD();
    if (state === 'intro') {
      letterbox(Math.max(0, 1 - Math.max(0, introT - 1.1) * 2));
      ctx.textAlign = 'center';
      ctx.font = '700 22px Orbitron';
      ctx.fillStyle = `rgba(232,226,208,${Math.min(1, introT * 2)})`;
      ctx.fillText('WAREHOUSE 13 — 3:12 AM', W / 2, 46);
      ctx.textAlign = 'left';
    } else if (state === 'victory') {
      letterbox(Math.min(1, vicT));
      ctx.textAlign = 'center';
      if (vicT > 1.2) {
        ctx.globalAlpha = Math.min(1, (vicT - 1.2) * 1.5);
        ctx.font = '700 30px Orbitron';
        ctx.fillStyle = '#e8e2d0';
        ctx.fillText('THE ENFORCER IS DOWN.', W / 2, 230);
      }
      if (vicT > 2.6) {
        ctx.globalAlpha = Math.min(1, (vicT - 2.6) * 1.5);
        ctx.font = 'italic 600 16px Inter';
        ctx.fillStyle = '#c8c0a8';
        ctx.fillText('A matchbook falls from his coat: "The Velvet Room — ask for Marco."', W / 2, 270);
      }
      ctx.globalAlpha = 1;
      if (vicT > 5 && Math.floor(tT * 2) % 2) {
        ctx.font = '700 16px Orbitron';
        ctx.fillStyle = '#ffcc60';
        ctx.fillText('PRESS ENTER', W / 2, H - 28);
      }
      ctx.textAlign = 'left';
    } else if (state === 'over') {
      drawEnd('GAME OVER', 'THEY SET YOU UP. YOU FELL FOR IT.', ['Score: ' + score]);
    } else if (state === 'win') {
      drawEnd('STAGE CLEAR', 'THE WAREHOUSE IS QUIET NOW.', ['Final score: ' + score, `Secrets found: ${player.secrets}/${secrets.length}`, 'Next stop: The Velvet Room...  To be continued.']);
    }
  }
  ctx.fillStyle = 'rgba(0,0,0,0.16)';
  for (let y = 0; y < H; y += 3) ctx.fillRect(0, y, W, 1);
}

reset();
let last = performance.now();
function loop(now) {
  let dt = Math.min(0.033, (now - last) / 1000);
  last = now;
  if (hitstop > 0) {
    hitstop -= dt;
    tT += dt;
    dt = 0;
  }
  if (dt > 0) update(state === 'victory' || player.dead ? dt * timeScale : dt);
  render();
  for (const k in pressed) delete pressed[k];
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
