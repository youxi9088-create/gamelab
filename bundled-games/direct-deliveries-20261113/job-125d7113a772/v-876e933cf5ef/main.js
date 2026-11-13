const canvas = document.querySelector('#game');
const ctx = canvas.getContext('2d');
const overlay = document.querySelector('#overlay');
const startButton = document.querySelector('#start-btn');
const timerEl = document.querySelector('#timer');
const bestEl = document.querySelector('#best');
const statusEl = document.querySelector('#status');
const headlineEl = document.querySelector('#headline');
const eyebrowEl = document.querySelector('#eyebrow');
const messageEl = document.querySelector('#message');
const deathMessageEl = document.querySelector('#death-message');
const gameoverProgressEl = document.querySelector('#gameover-progress');
const pauseButton = document.querySelector('#pause-btn');
const muteButton = document.querySelector('#mute-btn');
const SIZE = 800;
const PLAYER_RADIUS = 13 * 1.1;
const BALL_RADIUS = 18 * 1.1;
const BASE_BALL_SPEED = 112;
const STARTING_SPEED = BASE_BALL_SPEED * 1.72 * 1.2;
const SAFE_RADIUS = 170;
const SEASON1_STARTING_SPEED_MULTIPLIER = 1.04;
const music = new Audio('assets/audio/tension-loop.mp3');
const impactSound = new Audio('assets/audio/collision-impact.mp3');
const warningSound = new Audio('assets/audio/difficulty-warning-soft.mp3');
let powerAudioContext = null;
let muted = false;
let state = 'menu';
let balls = [];
let powerUps = [];
let safeZone = null;
let particles = [];
let nextPowerUpAt = Number.POSITIVE_INFINITY;
let powerUpSpawnCount = 0;
let shieldRemaining = 0;
let slowRemaining = 0;
let extraLife = false;
let shieldHitCooldown = 0;
let shieldWarned = false;
let statusHold = 0;
let elapsed = 0;
let lastTime = performance.now();
let milestones = new Set();
let flash = 0;
let shake = 0;
let trailClock = 0;
let lastDeathMessage = '';
const pointer = {
  x: SIZE / 2,
  y: SIZE / 2,
  active: false
};
const player = {
  x: SIZE / 2,
  y: SIZE / 2,
  targetX: SIZE / 2,
  targetY: SIZE / 2
};
let best = Number.parseFloat(localStorage.getItem('dontTouchBest') || '0') || 0;
let postgameScorePending = false;
let postgameSubmissionId = 0;
let postgameSaveMessage = '';
function updateStartButtonState() {
  startButton.disabled = false;
}
function playSound(audio) {
  if (muted) return;
  audio.currentTime = 0;
  audio.play().catch(() => {});
}
function unlockAudio() {
  if (!muted && music.paused) music.play().catch(() => {});
  if (powerAudioContext?.state === 'suspended') powerAudioContext.resume().catch(() => {});
}
function randomVelocity(speed) {
  const angle = Math.random() * Math.PI * 2;
  return {
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed
  };
}
function addBall(speed = STARTING_SPEED) {
  let x = SIZE / 2;
  let y = SIZE / 2;
  let bestX = x;
  let bestY = y;
  let bestClearance = -Infinity;
  for (let attempt = 0; attempt < 50; attempt += 1) {
    x = BALL_RADIUS + Math.random() * (SIZE - BALL_RADIUS * 2);
    y = BALL_RADIUS + Math.random() * (SIZE - BALL_RADIUS * 2);
    const playerGap = Math.hypot(x - player.x, y - player.y) - SAFE_RADIUS;
    const zoneGap = safeZone ? Math.hypot(x - safeZone.x, y - safeZone.y) - safeZone.radius - BALL_RADIUS - 2 : Infinity;
    const clearance = Math.min(playerGap, zoneGap);
    if (clearance > bestClearance) {
      bestClearance = clearance;
      bestX = x;
      bestY = y;
    }
    if (clearance >= 0) break;
  }
  if (safeZone && Math.hypot(bestX - safeZone.x, bestY - safeZone.y) < safeZone.radius + BALL_RADIUS + 2) {
    const corners = [[BALL_RADIUS, BALL_RADIUS], [SIZE - BALL_RADIUS, BALL_RADIUS], [BALL_RADIUS, SIZE - BALL_RADIUS], [SIZE - BALL_RADIUS, SIZE - BALL_RADIUS]];
    const safestCorner = corners.reduce((best, candidate) => Math.hypot(candidate[0] - safeZone.x, candidate[1] - safeZone.y) > Math.hypot(best[0] - safeZone.x, best[1] - safeZone.y) ? candidate : best);
    [bestX, bestY] = safestCorner;
  }
  balls.push({
    x: bestX,
    y: bestY,
    ...randomVelocity(speed),
    radius: BALL_RADIUS,
    pulse: Math.random() * Math.PI * 2
  });
}
function averageBallSpeed() {
  if (!balls.length) return STARTING_SPEED;
  return balls.reduce((sum, ball) => sum + Math.hypot(ball.vx, ball.vy), 0) / balls.length;
}
const MAX_HAZARD_SPEED = STARTING_SPEED * 4.6;
const MAX_HAZARDS = {
  classic: 14,
  power: 13
};
function scaleBallSpeeds(multiplier) {
  for (const ball of balls) {
    const speed = Math.hypot(ball.vx, ball.vy) || 1;
    const factor = Math.min(multiplier, MAX_HAZARD_SPEED / speed);
    ball.vx *= factor;
    ball.vy *= factor;
  }
}
function addBallsAtCurrentSpeed(count) {
  const speed = Math.min(averageBallSpeed(), MAX_HAZARD_SPEED);
  const room = Math.max(0, MAX_HAZARDS['classic'] - balls.length);
  for (let i = 0; i < Math.min(count, room); i += 1) addBall(speed);
}
function transformTwoBallsIntoTwo() {
  const availableBalls = balls.filter(ball => !ball.splitting);
  if (availableBalls.length < 2) return;
  const selectedBalls = availableBalls.sort(() => Math.random() - 0.5).slice(0, 2);
  const transformBatch = `opening-${Date.now()}`;
  for (const ball of selectedBalls) {
    ball.splitting = true;
    ball.transformBatch = transformBatch;
    ball.splitProgress = 0;
    ball.splitSpeed = Math.max(STARTING_SPEED, Math.hypot(ball.vx, ball.vy));
    ball.splitAngle = Math.atan2(ball.vy, ball.vx);
  }
  flash = 0.28;
  playSound(warningSound);
  statusEl.innerHTML = '<b>Warning:</b> two balls are getting bigger';
}
function completeBallTransformation(transformingBalls) {
  const activeBalls = transformingBalls.filter(ball => balls.includes(ball));
  if (!activeBalls.length) return;
  for (const parent of activeBalls) {
    const parentIndex = balls.indexOf(parent);
    if (parentIndex >= 0) balls.splice(parentIndex, 1);
    for (let childIndex = 0; childIndex < 2; childIndex += 1) {
      const angle = parent.splitAngle + (childIndex === 0 ? -0.42 : 0.42);
      const distance = BALL_RADIUS * 1.35;
      const child = {
        x: Math.max(BALL_RADIUS, Math.min(SIZE - BALL_RADIUS, parent.x + Math.cos(angle) * distance)),
        y: Math.max(BALL_RADIUS, Math.min(SIZE - BALL_RADIUS, parent.y + Math.sin(angle) * distance)),
        vx: Math.cos(angle) * parent.splitSpeed,
        vy: Math.sin(angle) * parent.splitSpeed,
        radius: BALL_RADIUS,
        pulse: Math.random() * Math.PI * 2
      };
      resolveSafeZoneCollision(child, child.x, child.y, 0);
      balls.push(child);
    }
    for (let i = 0; i < 18; i += 1) {
      const particleAngle = Math.random() * Math.PI * 2;
      const speed = 60 + Math.random() * 150;
      particles.push({
        x: parent.x,
        y: parent.y,
        vx: Math.cos(particleAngle) * speed,
        vy: Math.sin(particleAngle) * speed,
        life: 0.32 + Math.random() * 0.28,
        burst: true
      });
    }
  }
  flash = 0.45;
  statusEl.innerHTML = '<b>Transform:</b> two balls became four';
}
function refreshModeBest() {
  best = Number.parseFloat(localStorage.getItem("dontTouchBest") || "0") || 0;
  bestEl.textContent = best.toFixed(1).padStart(4, "0");
}
async function resetGame() {
  elapsed = 0;
  milestones = new Set();
  balls = [];
  powerUps = [];
  safeZone = null;
  particles = [];
  flash = 0;
  shake = 0;
  shieldRemaining = 0;
  slowRemaining = 0;
  extraLife = false;
  shieldHitCooldown = 0;
  shieldWarned = false;
  statusHold = 0;
  powerUpSpawnCount = 0;
  nextPowerUpAt = Number.POSITIVE_INFINITY;
  player.x = player.targetX = pointer.x = SIZE / 2;
  player.y = player.targetY = pointer.y = SIZE / 2;
  const startingBalls = 6;
  const baseStartingSpeed = STARTING_SPEED;
  const startingSpeed = baseStartingSpeed * SEASON1_STARTING_SPEED_MULTIPLIER;
  for (let i = 0; i < startingBalls; i += 1) addBall(startingSpeed);
  state = 'playing';
  postgameScorePending = false;
  postgameSubmissionId += 1;
  gameoverProgressEl.hidden = true;
  overlay.classList.add('hidden');
  pauseButton.textContent = 'Ⅱ';
  timerEl.textContent = '00.0';
  statusEl.innerHTML = '<b>Next:</b> hazards transform at 10s, then speed up in stages';
  unlockAudio();
}
const deathMessages = {
  common: ['ur lost', 'are u even trying?', 'my grandma plays better', 'loooser', 'ur useless', 'nah', 'u really thought u had that', 'how did u die there', 'embarrassing', 'come on', 'weak', 'try again', 'Lettuce could do better', 'Blame the keyboard.', 'Delete the game.', 'The leaderboard is laughing.', 'Maybe stick to watching.', 'Couldn’t even survive the easy part.'],
  uncommon: ['that was rough', 'I\'ve seen better', 'bro needs practice', 'really?', 'that\'s it?'],
  rare: ['not bad, kid', 'decent', 'better', 'I\'ll give you that'],
  ultraRare: ['one in a million']
};
function chooseDeathMessage(score) {
  const positiveOnlyThreshold = 55;
  if (score > positiveOnlyThreshold) {
    const positiveMessages = [...deathMessages.rare, ...deathMessages.ultraRare];
    const available = positiveMessages.filter(message => message !== lastDeathMessage);
    const pool = available.length ? available : positiveMessages;
    const message = pool[Math.floor(Math.random() * pool.length)];
    lastDeathMessage = message;
    return message;
  }
  const allowPositive = "classic" !== 'power';
  const ultraRareChance = 0.001;
  if (Math.random() < ultraRareChance && lastDeathMessage !== deathMessages.ultraRare[0]) {
    return deathMessages.ultraRare[0];
  }
  const weights = {
    common: 1,
    uncommon: 0,
    rare: 0
  };
  if (score >= 8) weights.uncommon = 0.2;
  if (score >= 20) weights.uncommon = 0.32;
  {
    if (score >= 30) weights.rare = 0.14;
    if (score >= 45) weights.rare = 0.28;
    if (score >= 60) weights.rare = 0.45;
  }
  const totalWeight = weights.common + weights.uncommon + weights.rare;
  let roll = Math.random() * totalWeight;
  let category = 'common';
  for (const [name, weight] of Object.entries(weights)) {
    roll -= weight;
    if (roll <= 0) {
      category = name;
      break;
    }
  }
  const options = deathMessages[category];
  const available = options.filter(message => message !== lastDeathMessage);
  const pool = available.length ? available : options;
  const message = pool[Math.floor(Math.random() * pool.length)];
  lastDeathMessage = message;
  return message;
}
function showMenu(kind) {
  overlay.classList.remove('hidden', 'leaderboard-only');
  if (kind !== 'gameover') {
    gameoverProgressEl.hidden = true;
  }
  if (kind === 'gameover') {
    eyebrowEl.textContent = 'Contact detected';
    headlineEl.innerHTML = 'YOU<br><span class="red">DIED.</span>';
    deathMessageEl.textContent = lastDeathMessage;
    messageEl.innerHTML = `You survived <b>${elapsed.toFixed(1)} seconds</b>.<br>Best: ${best.toFixed(1)} seconds. Ready again?`;
    startButton.textContent = 'TRY AGAIN';
    overlay.querySelector('.panel')?.scrollTo({
      top: 0
    });
  } else if (kind === 'paused') {
    eyebrowEl.textContent = 'Run paused';
    headlineEl.innerHTML = 'HOLD<br><span class="red">STILL.</span>';
    deathMessageEl.textContent = '';
    messageEl.textContent = 'Take a breath. Continue when you’re ready.';
    startButton.textContent = 'RESUME';
  }
  updateStartButtonState();
}
function gameOver() {
  if (state !== 'playing') return;
  state = 'gameover';
  postgameSaveMessage = '';
  shake = 18;
  flash = 1;
  for (let i = 0; i < 32; i += 1) {
    const a = Math.random() * Math.PI * 2;
    const speed = 80 + Math.random() * 240;
    particles.push({
      x: player.x,
      y: player.y,
      vx: Math.cos(a) * speed,
      vy: Math.sin(a) * speed,
      life: 0.5 + Math.random() * 0.45
    });
  }
  playSound(impactSound);
  music.pause();
  if (elapsed > best) {
    best = elapsed;
    const bestKey = 'dontTouchBest';
    localStorage.setItem(bestKey, best.toFixed(2));
    bestEl.textContent = best.toFixed(1).padStart(4, '0');
  }
  lastDeathMessage = chooseDeathMessage(elapsed);
  showMenu('gameover');
}
function escalate(key, label, action) {
  if (milestones.has(key)) return;
  milestones.add(key);
  action();
  flash = 0.5;
  playSound(warningSound);
  statusEl.innerHTML = `<b>Difficulty up:</b> ${label}`;
}
function updateDifficulty() {
  if (elapsed >= 10) escalate('10-transform', 'two balls grow, then transform', transformTwoBallsIntoTwo);
  if (elapsed >= 20) escalate('20', 'speed +25% and +2 balls', () => {
    scaleBallSpeeds(1.25);
    addBallsAtCurrentSpeed(2);
  });
  if (elapsed >= 30) escalate('30', 'speed +12%', () => scaleBallSpeeds(1.12));
  if (elapsed >= 40) escalate('40', 'speed +10% and +1 ball', () => {
    scaleBallSpeeds(1.1);
    addBallsAtCurrentSpeed(1);
  });
  if (elapsed >= 50) escalate('50', 'speed +10%', () => scaleBallSpeeds(1.1));
  if (elapsed >= 60) {
    const stageTime = Math.floor((elapsed - 60) / 10) * 10 + 60;
    const factor = stageTime < 120 ? 1.08 : stageTime < 180 ? 1.07 : 1.06;
    const addsBall = (stageTime - 60) % 20 === 0;
    escalate(`repeat-${stageTime}`, `speed +${Math.round((factor - 1) * 100)}%${addsBall ? ' and +1 ball' : ''}`, () => {
      scaleBallSpeeds(factor);
      if (addsBall) addBallsAtCurrentSpeed(1);
    });
  }
  if (statusHold > 0) return;
  if (elapsed < 10) statusEl.innerHTML = `<b>Next:</b> transform at ${Math.ceil(10 - elapsed)}s`;else if (elapsed < 20) statusEl.innerHTML = `<b>Next:</b> speed up and +2 balls in ${Math.ceil(20 - elapsed)}s`;else if (elapsed < 30) statusEl.innerHTML = `<b>Next:</b> speed up in ${Math.ceil(30 - elapsed)}s`;else if (elapsed < 40) statusEl.innerHTML = `<b>Next:</b> speed up and +1 ball in ${Math.ceil(40 - elapsed)}s`;else if (elapsed < 50) statusEl.innerHTML = `<b>Next:</b> speed up in ${Math.ceil(50 - elapsed)}s`;else if (elapsed < 60) statusEl.innerHTML = `<b>Next:</b> speed up and +1 ball in ${Math.ceil(60 - elapsed)}s`;else {
    const next = (Math.floor((elapsed - 60) / 10) + 1) * 10 + 60;
    const addsBall = (next - 60) % 20 === 0;
    statusEl.innerHTML = `<b>Next:</b> speed up${addsBall ? ' and +1 ball' : ''} in ${Math.max(1, Math.ceil(next - elapsed))}s`;
  }
}
function movePointer(event) {
  const rect = canvas.getBoundingClientRect();
  const x = (event.clientX - rect.left) * SIZE / rect.width;
  const y = (event.clientY - rect.top) * SIZE / rect.height;
  pointer.x = Math.max(PLAYER_RADIUS, Math.min(SIZE - PLAYER_RADIUS, x));
  pointer.y = Math.max(PLAYER_RADIUS, Math.min(SIZE - PLAYER_RADIUS, y));
  if (event.pointerType === 'mouse' || pointer.active) {
    player.targetX = pointer.x;
    player.targetY = pointer.y;
  }
}
function togglePause() {
  if (state === 'playing') {
    state = 'paused';
    music.pause();
    pauseButton.textContent = '▶';
    showMenu('paused');
  } else if (state === 'paused') {
    state = 'playing';
    overlay.classList.add('hidden');
    pauseButton.textContent = 'Ⅱ';
    unlockAudio();
    lastTime = performance.now();
  }
}
function resolveSafeZoneCollision(ball, previousX, previousY, travelTime) {
  if (!safeZone) return;
  const obstacleRadius = safeZone.radius + ball.radius + 0.5;
  const obstacleRadiusSq = obstacleRadius * obstacleRadius;
  const startX = previousX - safeZone.x;
  const startY = previousY - safeZone.y;
  const startDistanceSq = startX * startX + startY * startY;
  if (startDistanceSq < obstacleRadiusSq) {
    let normalX = ball.x - safeZone.x;
    let normalY = ball.y - safeZone.y;
    let distance = Math.hypot(normalX, normalY);
    if (distance < 0.001) {
      const speed = Math.hypot(ball.vx, ball.vy) || 1;
      normalX = -ball.vx / speed;
      normalY = -ball.vy / speed;
      distance = 1;
    }
    normalX /= distance;
    normalY /= distance;
    const normalSpeed = ball.vx * normalX + ball.vy * normalY;
    if (normalSpeed < 0) {
      ball.vx -= 2 * normalSpeed * normalX;
      ball.vy -= 2 * normalSpeed * normalY;
    }
    ball.x = safeZone.x + normalX * obstacleRadius;
    ball.y = safeZone.y + normalY * obstacleRadius;
    return;
  }
  const moveX = ball.x - previousX;
  const moveY = ball.y - previousY;
  const moveLengthSq = moveX * moveX + moveY * moveY;
  if (moveLengthSq < 0.0001) return;
  const offsetX = previousX - safeZone.x;
  const offsetY = previousY - safeZone.y;
  const linear = 2 * (offsetX * moveX + offsetY * moveY);
  const constant = startDistanceSq - obstacleRadiusSq;
  const discriminant = linear * linear - 4 * moveLengthSq * constant;
  if (discriminant < 0) return;
  const hitT = (-linear - Math.sqrt(discriminant)) / (2 * moveLengthSq);
  if (hitT < 0 || hitT > 1) return;
  const impactX = previousX + moveX * hitT;
  const impactY = previousY + moveY * hitT;
  let normalX = impactX - safeZone.x;
  let normalY = impactY - safeZone.y;
  const normalLength = Math.hypot(normalX, normalY) || 1;
  normalX /= normalLength;
  normalY /= normalLength;
  const normalSpeed = ball.vx * normalX + ball.vy * normalY;
  if (normalSpeed >= 0) return;
  ball.vx -= 2 * normalSpeed * normalX;
  ball.vy -= 2 * normalSpeed * normalY;
  const remainingTime = travelTime * (1 - hitT);
  ball.x = impactX + normalX * 0.75 + ball.vx * remainingTime;
  ball.y = impactY + normalY * 0.75 + ball.vy * remainingTime;
  const endX = ball.x - safeZone.x;
  const endY = ball.y - safeZone.y;
  const endDistance = Math.hypot(endX, endY);
  if (endDistance < obstacleRadius) {
    const correction = (obstacleRadius - endDistance) / (endDistance || 1);
    ball.x = safeZone.x + endX * (1 + correction);
    ball.y = safeZone.y + endY * (1 + correction);
  }
}
function update(dt) {
  if (state !== 'playing') return;
  elapsed += dt;
  timerEl.textContent = elapsed.toFixed(1).padStart(4, '0');
  {
    updateDifficulty();
  }
  const follow = 1 - Math.exp(-dt * 18);
  player.x += (player.targetX - player.x) * follow;
  player.y += (player.targetY - player.y) * follow;
  player.x = Math.max(PLAYER_RADIUS, Math.min(SIZE - PLAYER_RADIUS, player.x));
  player.y = Math.max(PLAYER_RADIUS, Math.min(SIZE - PLAYER_RADIUS, player.y));
  trailClock += dt;
  if (trailClock > 0.035) {
    trailClock = 0;
    particles.push({
      x: player.x,
      y: player.y,
      vx: 0,
      vy: 0,
      life: 0.24,
      trail: true
    });
  }
  const hazardDt = dt;
  const playerProtected = Boolean("classic" === 'power');
  const completedTransforms = new Map();
  for (const ball of balls) {
    const previousX = ball.x;
    const previousY = ball.y;
    if (ball.splitting) {
      ball.splitProgress += hazardDt / 0.78;
      ball.radius = BALL_RADIUS * (1 + Math.min(1, ball.splitProgress) * 0.9);
      ball.pulse += hazardDt * 8;
      if (ball.splitProgress >= 1) {
        const batch = completedTransforms.get(ball.transformBatch) || [];
        batch.push(ball);
        completedTransforms.set(ball.transformBatch, batch);
      }
    } else {
      ball.x += ball.vx * hazardDt;
      ball.y += ball.vy * hazardDt;
      ball.pulse += hazardDt * 3;
      if (ball.x < ball.radius) {
        ball.x = ball.radius;
        ball.vx = Math.abs(ball.vx);
      }
      if (ball.x > SIZE - ball.radius) {
        ball.x = SIZE - ball.radius;
        ball.vx = -Math.abs(ball.vx);
      }
      if (ball.y < ball.radius) {
        ball.y = ball.radius;
        ball.vy = Math.abs(ball.vy);
      }
      if (ball.y > SIZE - ball.radius) {
        ball.y = SIZE - ball.radius;
        ball.vy = -Math.abs(ball.vy);
      }
    }
    resolveSafeZoneCollision(ball, previousX, previousY, hazardDt);
    if (!playerProtected && Math.hypot(ball.x - player.x, ball.y - player.y) < ball.radius + PLAYER_RADIUS) {
      {
        gameOver();
      }
    }
  }
  for (const transformingBalls of completedTransforms.values()) {
    completeBallTransformation(transformingBalls);
  }
}
function updateParticles(dt) {
  for (const p of particles) {
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vx *= 0.97;
    p.vy *= 0.97;
    p.life -= dt;
  }
  particles = particles.filter(p => p.life > 0);
  flash = Math.max(0, flash - dt * 1.9);
  shake = Math.max(0, shake - dt * 38);
}
function drawCircle(x, y, radius, fill, shadow = 'transparent', blur = 0) {
  ctx.save();
  ctx.shadowColor = shadow;
  ctx.shadowBlur = blur;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.restore();
}
function draw() {
  ctx.save();
  if (shake > 0) ctx.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(-20, -20, SIZE + 40, SIZE + 40);
  for (const p of particles) {
    const alpha = Math.min(1, p.life * (p.trail ? 3.8 : 1.8));
    const radius = p.burst ? 4 : p.trail ? 5 : 4;
    if (p.power) {
      ctx.save();
      ctx.globalAlpha = alpha;
      drawCircle(p.x, p.y, radius, p.color);
      ctx.restore();
      continue;
    }
    const fill = p.burst ? `rgba(237,63,72,${alpha})` : p.trail ? `rgba(40,227,111,${alpha * 0.24})` : `rgba(40,227,111,${alpha})`;
    drawCircle(p.x, p.y, radius, fill);
  }
  for (const ball of balls) {
    drawCircle(ball.x + 4, ball.y + 6, ball.radius, 'rgba(15,14,12,.16)');
    drawCircle(ball.x, ball.y, ball.radius + Math.sin(ball.pulse) * 0.7, '#ed3f48', 'rgba(237,63,72,.38)', 12);
    drawCircle(ball.x - 5, ball.y - 6, 4, 'rgba(255,255,255,.44)');
    if (ball.splitting) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.radius + 10 + Math.sin(ball.pulse) * 3, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(237,63,72,${0.3 + ball.splitProgress * 0.45})`;
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.restore();
    }
  }
  if (state !== 'gameover' || flash > 0.1) {
    drawCircle(player.x + 3, player.y + 5, PLAYER_RADIUS, 'rgba(15,14,12,.18)');
    drawCircle(player.x, player.y, PLAYER_RADIUS, '#28e36f', 'rgba(40,227,111,.46)', 14);
    drawCircle(player.x - 3, player.y - 4, 3, 'rgba(255,255,255,.62)');
  }
  if (flash > 0) {
    ctx.fillStyle = `rgba(237,63,72,${flash * 0.22})`;
    ctx.fillRect(0, 0, SIZE, SIZE);
  }
  ctx.restore();
}
function frame(now) {
  const dt = Math.min(0.033, (now - lastTime) / 1000);
  lastTime = now;
  update(dt);
  updateParticles(dt);
  draw();
  requestAnimationFrame(frame);
}
music.loop = true;
music.volume = .22;
impactSound.volume = .72;
warningSound.volume = .3;
refreshModeBest();
startButton.disabled = false;
canvas.addEventListener('pointerdown', event => {
  pointer.active = true;
  canvas.setPointerCapture(event.pointerId);
  movePointer(event);
  unlockAudio();
});
canvas.addEventListener('pointermove', movePointer);
canvas.addEventListener('pointerup', () => {
  pointer.active = false;
});
canvas.addEventListener('pointercancel', () => {
  pointer.active = false;
});
startButton.addEventListener('click', () => {
  if (state === 'paused') togglePause();else resetGame();
});
pauseButton.addEventListener('click', togglePause);
muteButton.addEventListener('click', () => {
  muted = !muted;
  music.muted = muted;
  muteButton.textContent = muted ? '×' : '♪';
  muteButton.setAttribute('aria-label', muted ? 'Unmute audio' : 'Mute audio');
  if (!muted && state === 'playing') unlockAudio();
});
window.addEventListener('keydown', event => {
  if (event.code === 'KeyP' || event.code === 'Escape') togglePause();
  if ((event.code === 'Space' || event.code === 'Enter') && (state === 'menu' || state === 'gameover')) resetGame();
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden && state === 'playing') togglePause();
});
requestAnimationFrame(frame);