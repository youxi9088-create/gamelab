const W = 1920;
const H = 1080;
const HUD = {
  mute: { x: W - 294, y: 88, w: 124, h: 44 },
  pause: { x: W - 154, y: 88, w: 134, h: 44 },
  resume: { x: W / 2 - 126, y: H / 2 + 62, w: 252, h: 66 },
};
const canvas = document.createElement('canvas');
canvas.width = W;
canvas.height = H;
document.getElementById('game-container').appendChild(canvas);
const ctx = canvas.getContext('2d');

const hasTouchInput = navigator.maxTouchPoints > 0 || matchMedia('(pointer: coarse)').matches;
let viewScale = 1;
function resize() {
  const portraitTouch = hasTouchInput && innerHeight > innerWidth;
  const availableWidth = portraitTouch ? innerHeight : innerWidth;
  const availableHeight = portraitTouch ? innerWidth : innerHeight;
  viewScale = Math.min(availableWidth / W, availableHeight / H);
  canvas.style.width = W * viewScale + 'px';
  canvas.style.height = H * viewScale + 'px';
  canvas.style.transform = portraitTouch ? 'rotate(90deg)' : 'none';
  canvas.dataset.rotated = portraitTouch ? 'true' : 'false';

  if (hasTouchInput) {
    const touchHeight = Math.max(44 / viewScale, 52);
    const muteWidth = Math.max(124 / viewScale, 156);
    const pauseWidth = Math.max(134 / viewScale, 168);
    HUD.mute.w = muteWidth;
    HUD.mute.h = touchHeight;
    HUD.pause.w = pauseWidth;
    HUD.pause.h = touchHeight;
    HUD.pause.x = W - pauseWidth - 24;
    HUD.mute.x = HUD.pause.x - muteWidth - 16;
    HUD.mute.y = HUD.pause.y = 26;
    HUD.resume.w = 500;
    HUD.resume.h = Math.max(66, 48 / viewScale);
    HUD.resume.x = W / 2 - HUD.resume.w / 2;
    HUD.resume.y = H / 2 + 76;
  }
}
addEventListener('resize', resize);
if (window.visualViewport) window.visualViewport.addEventListener('resize', resize);
resize();

function loadImg(src) {
  const i = new Image();
  i.crossOrigin = 'anonymous';
  i.src = src;
  return i;
}
const IMG = {
  player: loadImg('assets/player-ship.webp'),
  bee: loadImg('assets/alien-bee.webp'),
  fly: loadImg('assets/alien-butterfly.webp'),
  boss: loadImg('assets/alien-boss.webp'),
  bg: loadImg('assets/space-bg.webp'),
};

// ---------- Audio ----------
const music = new Audio('assets/audio/arcade-music.mp3');
music.loop = true;
music.volume = 0.35;
const sfxShot = new Audio('assets/audio/laser-shot.mp3');
const sfxBoom = new Audio('assets/audio/alien-explode.mp3');
let muted = false;
let actx = null;
function play(a, vol = 0.5) {
  if (muted) return;
  a.volume = vol;
  a.currentTime = 0;
  a.play().catch(() => {});
}
function tone(f1, f2, dur, type = 'sawtooth', vol = 0.12) {
  if (muted || !actx) return;
  const o = actx.createOscillator();
  const g = actx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(f1, actx.currentTime);
  o.frequency.linearRampToValueAtTime(f2, actx.currentTime + dur);
  g.gain.setValueAtTime(vol, actx.currentTime);
  g.gain.linearRampToValueAtTime(0, actx.currentTime + dur);
  o.connect(g).connect(actx.destination);
  o.start();
  o.stop(actx.currentTime + dur);
}

function toggleMute() {
  muted = !muted;
  music.muted = muted;
  sfxShot.muted = muted;
  sfxBoom.muted = muted;
  if (!muted && state === 'play') music.play().catch(() => {});
}

function togglePause() {
  if (state === 'play') {
    state = 'paused';
    music.pause();
  } else if (state === 'paused') {
    state = 'play';
    if (!muted) music.play().catch(() => {});
  }
}

function contains(point, rect) {
  return point.x >= rect.x && point.x <= rect.x + rect.w && point.y >= rect.y && point.y <= rect.y + rect.h;
}

// ---------- Input ----------
const keys = {};
let activeTouchPointer = null;
let activeMousePointer = null;
let touchTargetX = null;
function gamePointFromPointer(e) {
  const rect = canvas.getBoundingClientRect();
  if (canvas.dataset.rotated === 'true') {
    return {
      x: ((e.clientY - rect.top) / rect.height) * W,
      y: (1 - (e.clientX - rect.left) / rect.width) * H,
    };
  }
  return {
    x: ((e.clientX - rect.left) / rect.width) * W,
    y: ((e.clientY - rect.top) / rect.height) * H,
  };
}
function unlockAudio() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!actx && AudioContextClass) actx = new AudioContextClass();
  if (actx?.state === 'suspended') actx.resume().catch(() => {});
}
function beginTouchControls(e, point) {
  if (e.pointerType !== 'touch' && e.pointerType !== 'pen') return;
  activeTouchPointer = e.pointerId;
  touchTargetX = point.x;
  keys.Space = true;
  canvas.setPointerCapture(e.pointerId);
}
function beginMouseControls(e, point) {
  if (e.pointerType !== 'mouse') return;
  activeMousePointer = e.pointerId;
  touchTargetX = point.x;
  canvas.setPointerCapture(e.pointerId);
}
function endPointerControls(e) {
  if (activeTouchPointer === e.pointerId) {
    activeTouchPointer = null;
    touchTargetX = null;
    keys.Space = false;
  }
  if (activeMousePointer === e.pointerId) activeMousePointer = null;
}

addEventListener('keydown', (e) => {
  keys[e.code] = true;
  unlockAudio();
  if (e.repeat) return;
  if (e.code === 'KeyM') toggleMute();
  if ((e.code === 'KeyP' || e.code === 'Escape') && (state === 'play' || state === 'paused')) togglePause();
  if ((state === 'title' || state === 'over') && (e.code === 'Space' || e.code === 'Enter')) startGame();
  if (e.code === 'Space' || e.code.startsWith('Arrow')) e.preventDefault();
});
addEventListener('keyup', (e) => {
  keys[e.code] = false;
});

canvas.addEventListener('pointerdown', (e) => {
  if (e.pointerType === 'mouse' && e.button !== 0) return;
  e.preventDefault();
  unlockAudio();
  const point = gamePointFromPointer(e);
  if (state !== 'title' && contains(point, HUD.mute)) {
    toggleMute();
    return;
  }
  if ((state === 'play' || state === 'paused') && contains(point, HUD.pause)) {
    togglePause();
    return;
  }
  if (state === 'paused' && contains(point, HUD.resume)) {
    togglePause();
    return;
  }
  if (state === 'title' || state === 'over') startGame();
  if (state === 'play') {
    if (e.pointerType === 'mouse') beginMouseControls(e, point);
    else beginTouchControls(e, point);
  }
});

canvas.addEventListener('pointermove', (e) => {
  const point = gamePointFromPointer(e);
  if (activeTouchPointer === e.pointerId) {
    touchTargetX = point.x;
  } else if (e.pointerType === 'mouse' && state === 'play' && activeTouchPointer === null &&
    !contains(point, HUD.mute) && !contains(point, HUD.pause)) {
    touchTargetX = point.x;
  }
  canvas.style.cursor = (state !== 'title' && contains(point, HUD.mute)) ||
    ((state === 'play' || state === 'paused') && (contains(point, HUD.pause) || (state === 'paused' && contains(point, HUD.resume))))
    ? 'pointer'
    : 'default';
});
canvas.addEventListener('pointerup', endPointerControls);
canvas.addEventListener('pointercancel', endPointerControls);
canvas.addEventListener('lostpointercapture', endPointerControls);

// ---------- State ----------
let state = 'title';
let stage, score, hiScore = +(localStorage.getItem('swarmHi') || 0), lives;
let player, bullets, eBullets, enemies, particles = [], popups = [], stars;
let stageTimer, banner, bannerT, shotCd, hasCapturedShip, bonusHits, bonusTotal, freeShip;
let shake = 0;

stars = Array.from({ length: 160 }, () => ({
  x: Math.random() * W,
  y: Math.random() * H,
  v: 60 + Math.random() * 300,
  c: ['#fff', '#7ff', '#f8f', '#ff8'][Math.floor(Math.random() * 4)],
}));

function startGame() {
  stage = 0;
  score = 0;
  lives = 3;
  hasCapturedShip = false;
  freeShip = null;
  music.currentTime = 0;
  if (!muted) music.play().catch(() => {});
  resetPlayer();
  nextStage();
  state = 'play';
}

function resetPlayer() {
  player = { x: W / 2, y: H - 110, dual: false, dead: 0, captured: null, inv: 2 };
  bullets = [];
  eBullets = [];
  particles = particles || [];
  popups = popups || [];
}

const isBonus = () => stage % 3 === 0;

// Formation slots: row0 bosses, rows1-2 butterflies, rows3-4 bees
function slotPos(row, col, count) {
  const sway = Math.sin(performance.now() / 900) * 40;
  const spread = 1 + Math.sin(performance.now() / 1300) * 0.04;
  return {
    x: W / 2 + (col - (count - 1) / 2) * 90 * spread + sway,
    y: 120 + row * 75,
  };
}

// Entry path generator: returns function t(0..1)->{x,y}
function makeEntryPath(side, variant) {
  const sx = side < 0 ? -80 : W + 80;
  const dir = side < 0 ? 1 : -1;
  return (t, tx, ty) => {
    if (variant === 0) {
      // swoop from the top, loop in the middle
      if (t < 0.6) {
        const k = t / 0.6;
        const a = k * Math.PI * 2;
        return {
          x: W / 2 - dir * 300 + dir * Math.sin(a) * 260 + dir * k * 200,
          y: -60 + k * 650 - Math.sin(a) * 180,
        };
      }
      const k = (t - 0.6) / 0.4;
      const px = W / 2 - dir * 100;
      return { x: px + (tx - px) * k, y: 590 + (ty - 590) * k };
    }
    // enter from the side with a spiral loop
    if (t < 0.65) {
      const k = t / 0.65;
      const a = k * Math.PI * 2.4;
      const cx = sx + dir * (k * 900);
      return { x: cx + dir * Math.sin(a) * 150, y: 750 - k * 200 - Math.cos(a) * 150 };
    }
    const k = (t - 0.65) / 0.35;
    const px = sx + dir * 900 + dir * Math.sin(Math.PI * 2.4) * 150;
    const py = 550 - Math.cos(Math.PI * 2.4) * 150;
    return { x: px + (tx - px) * k, y: py + (ty - py) * k };
  };
}

function nextStage() {
  stage++;
  enemies = [];
  bonusHits = 0;
  stageTimer = 0;
  banner = isBonus() ? 'CHALLENGING STAGE' : 'STAGE ' + stage;
  bannerT = 2.5;
  const groups = [];
  if (isBonus()) {
    for (let g = 0; g < 5; g++) {
      const kind = ['bee', 'fly', 'boss', 'fly', 'bee'][g];
      groups.push({ kind, n: 8, side: g % 2 ? 1 : -1, variant: g % 2, delay: 1 + g * 3.2, bonus: true });
    }
    bonusTotal = 40;
  } else {
    const layout = [
      { row: 0, kind: 'boss', count: 4 },
      { row: 1, kind: 'fly', count: 8 },
      { row: 2, kind: 'fly', count: 8 },
      { row: 3, kind: 'bee', count: 10 },
      { row: 4, kind: 'bee', count: 10 },
    ];
    let delay = 1;
    let gi = 0;
    for (const L of layout) {
      for (let half = 0; half < 2; half++) {
        const cols = [];
        for (let c = half; c < L.count; c += 2) cols.push(c);
        groups.push({ kind: L.kind, row: L.row, count: L.count, cols, side: gi % 2 ? 1 : -1, variant: gi % 2, delay });
        delay += 1.2;
        gi++;
      }
    }
  }
  let firstBoss = true;
  for (const g of groups) {
    const path = makeEntryPath(g.side, g.variant);
    const n = g.bonus ? g.n : g.cols.length;
    for (let i = 0; i < n; i++) {
      const e = {
        kind: g.kind,
        hp: g.kind === 'boss' ? 2 : 1,
        mode: 'wait',
        wait: g.delay + i * 0.14,
        path,
        t: 0,
        x: -200,
        y: -200,
        row: g.row,
        col: g.bonus ? 0 : g.cols[i],
        count: g.count,
        bonus: !!g.bonus,
        angle: Math.PI,
        carrying: false,
      };
      if (e.kind === 'boss' && hasCapturedShip && firstBoss && !g.bonus) {
        e.carrying = true;
        firstBoss = false;
      }
      enemies.push(e);
    }
  }
}

// ---------- Effects ----------
function explode(x, y, color, n = 24) {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2;
    const s = 100 + Math.random() * 400;
    particles.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 0.6 + Math.random() * 0.4, color });
  }
}
function popup(x, y, text, color = '#ff0') {
  popups.push({ x, y, text, color, life: 1.2 });
}

// ---------- Enemy behaviours ----------
function startDive(e) {
  e.mode = 'dive';
  e.t = 0;
  e.sx = e.x;
  e.sy = e.y;
  e.dir = e.x < W / 2 ? 1 : -1;
  e.shots = isBonus() ? 0 : 1 + Math.floor(stage / 3);
  if (e.kind === 'boss' && !e.carrying && !hasCapturedShip && !player.captured && !player.dual && !freeShip && Math.random() < 0.5) {
    e.mode = 'beamDive';
    e.targetX = player.x;
    e.beamT = 0;
  }
  tone(900, 300, 0.4, 'square', 0.05);
}

function fireAt(e) {
  if (player.dead > 0) return;
  const dx = player.x - e.x;
  const dy = player.y - e.y;
  const d = Math.hypot(dx, dy);
  const sp = 520 + stage * 20;
  eBullets.push({ x: e.x, y: e.y, vx: (dx / d) * sp * 0.5, vy: Math.max(300, (dy / d) * sp) });
}

function updateEnemy(e, dt) {
  const prevX = e.x;
  const prevY = e.y;
  if (e.mode === 'wait') {
    e.wait -= dt;
    if (e.wait <= 0) e.mode = 'enter';
    return;
  }
  if (e.mode === 'enter') {
    e.t += dt / (e.bonus ? 4.2 : 3);
    if (e.bonus) {
      // fly-through pattern, never joins the formation
      const p = e.path(Math.min(e.t, 0.64), W / 2, -300);
      e.x = p.x;
      e.y = p.y;
      if (e.t >= 0.64) {
        e.y -= (e.t - 0.64) * 3000;
      }
      if (e.t > 1) e.gone = true;
    } else {
      const s = slotPos(e.row, e.col, e.count);
      const p = e.path(Math.min(e.t, 1), s.x, s.y);
      e.x = p.x;
      e.y = p.y;
      if (e.t >= 1) e.mode = 'form';
    }
  } else if (e.mode === 'form') {
    const s = slotPos(e.row, e.col, e.count);
    e.x += (s.x - e.x) * Math.min(1, dt * 8);
    e.y += (s.y - e.y) * Math.min(1, dt * 8);
    e.angle += (Math.PI - e.angle) * dt * 6;
    return;
  } else if (e.mode === 'dive') {
    e.t += dt;
    const t = e.t;
    if (t < 0.8) {
      const a = (t / 0.8) * Math.PI;
      e.x = e.sx + e.dir * Math.sin(a) * -90;
      e.y = e.sy - Math.sin(a) * 80 + (t / 0.8) * 60;
    } else {
      const k = t - 0.8;
      e.x += (Math.sin(k * 3 + e.col) * 420 * e.dir + (player.x - e.x) * 0.8) * dt;
      e.y += (380 + stage * 15) * dt;
      if (e.shots > 0 && Math.random() < dt * 1.5 && e.y < H - 300) {
        e.shots--;
        fireAt(e);
      }
    }
    if (e.y > H + 60) {
      e.y = -60;
      e.mode = 'return';
    }
  } else if (e.mode === 'beamDive') {
    e.t += dt;
    if (e.y < 640 && e.beamT === 0) {
      e.x += (e.targetX - e.x) * dt * 2;
      e.y += 360 * dt;
    } else {
      if (e.beamT === 0) tone(200, 600, 2.5, 'triangle', 0.06);
      e.beamT += dt;
      // capture check
      if (e.beamT > 0.5 && e.beamT < 3 && player.dead <= 0 && player.inv <= 0 && !player.captured && Math.abs(player.x - e.x) < 110) {
        player.captured = e;
        tone(800, 100, 1.5, 'sawtooth', 0.1);
      }
      if (player.captured === e) {
        player.x += (e.x - player.x) * dt * 3;
        player.y += (e.y + 90 - player.y) * dt * 2;
        if (Math.abs(player.y - (e.y + 90)) < 12) {
          e.carrying = true;
          hasCapturedShip = true;
          player.captured = null;
          banner = 'FIGHTER CAPTURED';
          bannerT = 2;
          loseLife(true);
          e.mode = 'return';
          e.y -= 1;
        }
      } else if (e.beamT > 3) {
        e.mode = 'return';
      }
    }
  } else if (e.mode === 'return') {
    const s = slotPos(e.row, e.col, e.count);
    const dx = s.x - e.x;
    const dy = s.y - e.y;
    const d = Math.hypot(dx, dy);
    if (d < 12) {
      e.mode = 'form';
    } else {
      e.x += (dx / d) * 600 * dt;
      e.y += (dy / d) * 600 * dt;
    }
  }
  const vx = e.x - prevX;
  const vy = e.y - prevY;
  if (vx * vx + vy * vy > 0.1) {
    e.angle = Math.atan2(vy, vx) + Math.PI / 2;
  }
}

function enemySize(e) {
  return e.kind === 'boss' ? 92 : 68;
}

function killEnemy(e) {
  e.gone = true;
  const diving = e.mode !== 'form';
  const pts = { bee: 50, fly: 80, boss: 150 }[e.kind] * (diving ? 2 : 1);
  score += pts;
  popup(e.x, e.y, pts, '#fff');
  explode(e.x, e.y, { bee: '#ffdd33', fly: '#ff4466', boss: '#66ff99' }[e.kind]);
  play(sfxBoom, 0.45);
  shake = 6;
  if (e.bonus) bonusHits++;
  if (e.carrying) {
    if (diving) {
      // rescued: free ship drifts down to join player
      freeShip = { x: e.x, y: e.y + 90 };
      banner = 'FIGHTER RESCUED!';
    } else {
      banner = 'CAPTURED FIGHTER LOST';
    }
    hasCapturedShip = false;
    bannerT = 2;
  }
  if (player.captured === e) player.captured = null;
}

function loseLife(captured) {
  if (!captured) {
    explode(player.x, player.y, '#7ff', 50);
    play(sfxBoom, 0.7);
    shake = 18;
  }
  if (player.dual && !captured) {
    // lose one half of the dual ship
    player.dual = false;
    player.inv = 1.5;
    return;
  }
  lives--;
  player.dead = 2;
  player.dual = false;
  eBullets = [];
  if (lives < 0) {
    state = 'over';
    music.pause();
    if (score > hiScore) {
      hiScore = score;
      localStorage.setItem('swarmHi', hiScore);
    }
  }
}

// ---------- Update ----------
function update(dt) {
  if (state === 'paused') return;
  for (const s of stars) {
    s.y += s.v * dt;
    if (s.y > H) {
      s.y = 0;
      s.x = Math.random() * W;
    }
  }
  particles = particles.filter((p) => {
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vx *= 0.96;
    p.vy *= 0.96;
    p.life -= dt;
    return p.life > 0;
  });
  popups = popups.filter((p) => {
    p.y -= 40 * dt;
    p.life -= dt;
    return p.life > 0;
  });
  shake *= 0.88;
  if (state !== 'play') return;

  stageTimer += dt;
  bannerT -= dt;

  // Player
  if (player.dead > 0) {
    player.dead -= dt;
    if (player.dead <= 0 && lives >= 0) {
      player.x = W / 2;
      player.y = H - 110;
      player.inv = 2;
    }
  } else if (!player.captured) {
    player.inv -= dt;
    const sp = 720;
    if (keys.ArrowLeft || keys.KeyA) player.x -= sp * dt;
    if (keys.ArrowRight || keys.KeyD) player.x += sp * dt;
    if (touchTargetX !== null) player.x = touchTargetX;
    player.x = Math.max(60, Math.min(W - 60, player.x));
    shotCd -= dt;
    if ((keys.Space || activeMousePointer !== null) && shotCd <= 0 && bullets.length < (player.dual ? 4 : 2)) {
      shotCd = 0.18;
      const offs = player.dual ? [-38, 38] : [0];
      for (const o of offs) bullets.push({ x: player.x + o, y: player.y - 40 });
      play(sfxShot, 0.3);
    }
  }

  // Rescued ship docking
  if (freeShip) {
    freeShip.y += 300 * dt;
    if (freeShip.y >= player.y && player.dead <= 0) {
      freeShip.x += (player.x + 76 - freeShip.x) * dt * 5;
      freeShip.y = player.y;
      if (Math.abs(freeShip.x - (player.x + 76)) < 6) {
        player.x += 38;
        player.dual = true;
        freeShip = null;
        tone(400, 1200, 0.5, 'square', 0.08);
      }
    } else if (freeShip.y > H + 50) {
      freeShip = null;
    }
  }

  bullets = bullets.filter((b) => {
    b.y -= 1500 * dt;
    return b.y > -30;
  });
  eBullets = eBullets.filter((b) => {
    b.x += b.vx * dt;
    b.y += b.vy * dt;
    return b.y < H + 30;
  });

  // Dive scheduling
  const formed = enemies.filter((e) => e.mode === 'form');
  const diving = enemies.filter((e) => e.mode === 'dive' || e.mode === 'beamDive').length;
  if (!isBonus() && formed.length && player.dead <= 0 && diving < 2 + Math.floor(stage / 2)) {
    if (Math.random() < dt * (0.6 + stage * 0.15)) {
      const e = formed[Math.floor(Math.random() * formed.length)];
      startDive(e);
      // bosses take escorts
      if (e.kind === 'boss' && e.mode === 'dive') {
        formed
          .filter((f) => f.kind === 'fly' && f.row === 1 && Math.abs(f.col / 2 - e.col) <= 1)
          .slice(0, 2)
          .forEach(startDive);
      }
    }
  }

  for (const e of enemies) updateEnemy(e, dt);

  // Collisions
  for (const b of bullets) {
    for (const e of enemies) {
      if (e.gone || e.mode === 'wait') continue;
      if (Math.abs(b.x - e.x) < enemySize(e) / 2 && Math.abs(b.y - e.y) < enemySize(e) / 2) {
        b.hit = true;
        e.hp--;
        if (e.hp <= 0) {
          killEnemy(e);
        } else {
          e.flash = 0.15;
          tone(1200, 600, 0.1, 'square', 0.06);
        }
        break;
      }
    }
  }
  bullets = bullets.filter((b) => !b.hit);

  if (player.dead <= 0 && player.inv <= 0 && !player.captured) {
    const hw = player.dual ? 76 : 36;
    for (const b of eBullets) {
      if (Math.abs(b.x - player.x) < hw && Math.abs(b.y - player.y) < 34) {
        b.hit = true;
        loseLife(false);
        break;
      }
    }
    eBullets = eBullets.filter((b) => !b.hit);
    if (player.dead <= 0) {
      for (const e of enemies) {
        if (!e.gone && e.mode === 'dive' && Math.abs(e.x - player.x) < hw && Math.abs(e.y - player.y) < 50) {
          killEnemy(e);
          loseLife(false);
          break;
        }
      }
    }
  }
  enemies = enemies.filter((e) => !e.gone);

  // Stage clear
  if (enemies.length === 0 && state === 'play' && !player.captured) {
    if (isBonus()) {
      const bonus = bonusHits === bonusTotal ? 10000 : bonusHits * 100;
      score += bonus;
      popup(W / 2, H / 2 + 80, `HITS ${bonusHits}/${bonusTotal}  BONUS ${bonus}`, '#0ff');
    }
    nextStage();
  }
}

// ---------- Draw ----------
function drawSprite(img, x, y, size, angle = 0, alpha = 1) {
  if (!img.complete || !img.naturalWidth) return;
  const ar = img.naturalWidth / img.naturalHeight;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.drawImage(img, (-size * ar) / 2, -size / 2, size * ar, size);
  ctx.restore();
}

function text(str, x, y, size, color = '#fff', align = 'center') {
  ctx.font = `700 ${size}px Orbitron, sans-serif`;
  ctx.textAlign = align;
  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = 12;
  ctx.fillText(str, x, y);
  ctx.shadowBlur = 0;
}

function drawBadge(label, x, y, color) {
  ctx.save();
  ctx.font = '700 17px Orbitron, sans-serif';
  const w = ctx.measureText(label).width + 26;
  ctx.beginPath();
  ctx.roundRect(x, y, w, 36, 7);
  ctx.fillStyle = 'rgba(3, 12, 29, 0.88)';
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = 8;
  ctx.fillText(label, x + 13, y + 18);
  ctx.restore();
  return w + 10;
}

function drawControl(rect, label, color = '#7ff') {
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(rect.x, rect.y, rect.w, rect.h, 8);
  ctx.fillStyle = 'rgba(3, 12, 29, 0.92)';
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.font = `700 ${hasTouchInput ? 28 : 15}px Orbitron, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = 8;
  ctx.fillText(label, rect.x + rect.w / 2, rect.y + rect.h / 2);
  ctx.restore();
}

function drawStatusLayer() {
  let x = 40;
  const y = 96;
  if (player.dual) x += drawBadge('DUAL GUN', x, y, '#73ffbd');
  if (player.dead <= 0 && player.inv > 0) {
    x += drawBadge(`SHIELD ${player.inv.toFixed(1)}s`, x, y, '#74edff');
  }
  const beamThreat = enemies.some((e) => e.mode === 'beamDive' && e.beamT < 3);
  if (player.captured) {
    x += drawBadge('SHIP CAPTURED', x, y, '#ff75e7');
  } else if (beamThreat) {
    x += drawBadge('BEAM DANGER', x, y, '#ff668b');
  } else if (hasCapturedShip) {
    x += drawBadge('RESCUE TARGET', x, y, '#d28cff');
  }
  if (isBonus()) {
    const total = Math.max(1, bonusTotal || 40);
    const hits = bonusHits || 0;
    const accuracy = Math.round((hits / total) * 100);
    drawBadge(`ACCURACY ${hits}/${total} · ${accuracy}%`, x, y, '#6df5ff');
  }
  drawControl(HUD.mute, muted ? 'SOUND OFF' : 'SOUND ON', muted ? '#ff8b9d' : '#82ffd5');
  if (state === 'play' || state === 'paused') {
    drawControl(HUD.pause, state === 'paused' ? 'RESUME · P' : 'PAUSE · P', '#77eaff');
  }
}

function draw() {
  ctx.save();
  ctx.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake);
  if (IMG.bg.complete && IMG.bg.naturalWidth) {
    ctx.drawImage(IMG.bg, 0, 0, W, H);
  } else {
    ctx.fillStyle = '#02030a';
    ctx.fillRect(0, 0, W, H);
  }
  for (const s of stars) {
    ctx.fillStyle = s.c;
    ctx.globalAlpha = s.v / 360;
    ctx.fillRect(s.x, s.y, 2, 2 + s.v / 100);
  }
  ctx.globalAlpha = 1;

  if (state !== 'title') {
    // tractor beams
    for (const e of enemies) {
      if (e.mode === 'beamDive' && e.beamT > 0 && e.beamT < 3) {
        const grow = Math.min(1, e.beamT / 0.5);
        const g = ctx.createLinearGradient(0, e.y, 0, H);
        g.addColorStop(0, 'rgba(120,180,255,0.7)');
        g.addColorStop(1, 'rgba(120,180,255,0.05)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.moveTo(e.x - 30, e.y + 30);
        ctx.lineTo(e.x + 30, e.y + 30);
        ctx.lineTo(e.x + 120 * grow, e.y + 30 + (H - e.y) * grow);
        ctx.lineTo(e.x - 120 * grow, e.y + 30 + (H - e.y) * grow);
        ctx.fill();
        for (let i = 0; i < 6; i++) {
          const yy = e.y + 40 + ((e.beamT * 300 + i * 70) % (400 * grow));
          ctx.strokeStyle = 'rgba(200,230,255,0.6)';
          ctx.strokeRect(e.x - 30 - (yy - e.y) * 0.22, yy, 60 + (yy - e.y) * 0.44, 3);
        }
      }
    }
    for (const e of enemies) {
      if (e.mode === 'wait') continue;
      const img = IMG[e.kind];
      const flap = e.mode === 'form' ? 1 + Math.sin(performance.now() / 150 + e.col) * 0.06 : 1;
      if (e.carrying) drawSprite(IMG.player, e.x, e.y + 90, 60, 0, 0.8);
      ctx.filter = e.flash > 0 ? 'brightness(3)' : e.kind === 'boss' && e.hp === 1 ? 'hue-rotate(160deg)' : 'none';
      drawSprite(img, e.x, e.y, enemySize(e) * flap, e.angle - Math.PI);
      ctx.filter = 'none';
      if (e.flash > 0) e.flash -= 1 / 60;
    }
    if (freeShip) drawSprite(IMG.player, freeShip.x, freeShip.y, 70);

    if (player.dead <= 0 && (state === 'play' || state === 'paused')) {
      const blink = player.inv > 0 && Math.floor(performance.now() / 100) % 2;
      if (!blink) {
        const ang = player.captured ? performance.now() / 100 : 0;
        if (player.dual) {
          drawSprite(IMG.player, player.x - 38, player.y, 76);
          drawSprite(IMG.player, player.x + 38, player.y, 76);
        } else {
          drawSprite(IMG.player, player.x, player.y, 76, ang);
        }
      }
    }
    ctx.fillStyle = '#9ff';
    ctx.shadowColor = '#0ff';
    ctx.shadowBlur = 10;
    for (const b of bullets) ctx.fillRect(b.x - 3, b.y - 16, 6, 32);
    ctx.fillStyle = '#f5f';
    ctx.shadowColor = '#f0f';
    for (const b of eBullets) {
      ctx.beginPath();
      ctx.arc(b.x, b.y, 7, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;
  }
  for (const p of particles) {
    ctx.globalAlpha = Math.min(1, p.life * 1.5);
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x - 3, p.y - 3, 6, 6);
  }
  ctx.globalAlpha = 1;
  for (const p of popups) {
    ctx.globalAlpha = Math.min(1, p.life);
    text(p.text, p.x, p.y, 26, p.color);
  }
  ctx.globalAlpha = 1;
  ctx.restore();

  if (state === 'paused') {
    const panelW = hasTouchInput ? 960 : 600;
    const panelH = hasTouchInput ? 500 : 300;
    ctx.fillStyle = 'rgba(1, 4, 18, 0.72)';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = 'rgba(4, 15, 36, 0.96)';
    ctx.strokeStyle = '#55eaff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(W / 2 - panelW / 2, H / 2 - panelH / 2, panelW, panelH, 16);
    ctx.fill();
    ctx.stroke();
    text('PAUSED', W / 2, H / 2 - 52, 64, '#69f4ff');
    text(hasTouchInput ? 'COMBAT FROZEN  ·  TAP RESUME' : 'COMBAT FROZEN  ·  P / ESC TO RESUME', W / 2, H / 2 + 10, hasTouchInput ? 27 : 20, '#b6cfff');
    drawControl(HUD.resume, 'RESUME GAME', '#82ffd5');
  }

  // HUD
  if (state === 'title') {
    text('STAR WING', W / 2, 380, 120, '#0ff');
    text(hasTouchInput ? 'TOUCH & DRAG TO MOVE  ·  HOLD TO FIRE' : 'MOVE MOUSE TO STEER  ·  HOLD LEFT CLICK TO FIRE', W / 2, 660, hasTouchInput ? 32 : 27, '#aaa');
    text('Let a Spider capture your fighter, then shoot that Spider mid-dive to get it back as a dual fighter!', W / 2, hasTouchInput ? 740 : 770, 24, '#f8f');
    text('HI ' + hiScore, W / 2, hasTouchInput ? 840 : 860, 30, '#ff0');
    return;
  }
  text('SCORE ' + score, 40, 60, 32, '#fff', 'left');
  text('HI ' + Math.max(hiScore, score), W / 2, 60, 32, '#ff0');
  text('STAGE ' + stage, W - 40, 60, 32, '#0ff', 'right');
  drawStatusLayer();
  for (let i = 0; i < Math.max(0, lives); i++) drawSprite(IMG.player, 60 + i * 60, H - 40, 44);
  if (bannerT > 0) text(banner, W / 2, H / 2, 64, isBonus() ? '#0ff' : '#ff0');
  if (state === 'over') {
    text('GAME OVER', W / 2, H / 2 - 40, 110, '#f44');
    text('SCORE ' + score + (hasTouchInput ? '   —   TAP TO RESTART' : '   —   LEFT CLICK'), W / 2, H / 2 + 60, 36, '#fff');
  }
}

let last = performance.now();
shotCd = 0;
function loop(now) {
  const dt = Math.min(0.033, (now - last) / 1000);
  last = now;
  update(dt);
  draw();
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
