const W = 1920;
const H = 1080;
let canvasScale = 1;
const container = document.getElementById('game-container');
const canvas = document.createElement('canvas');
canvas.width = W;
canvas.height = H;
container.appendChild(canvas);
const ctx = canvas.getContext('2d');
const dark = document.createElement('canvas');
dark.width = W;
dark.height = H;
const dctx = dark.getContext('2d');

function resize() {
  const s = Math.min(innerWidth / W, innerHeight / H);
  canvasScale = s;
  canvas.style.width = `${W * s}px`;
  canvas.style.height = `${H * s}px`;
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
const img = {
  floor: loadImg('assets/lantern-floor-pixel.webp'),
  wall: loadImg('assets/lantern-wall-pixel.webp'),
  backdrop: loadImg('assets/lantern-ruins-backdrop.webp'),
  player: loadImg('assets/ember-spirit-cute-mage.webp'),
  torch: loadImg('assets/torch-icon.webp'),
  ember: loadImg('assets/ember-icon.webp'),
};
const music = new Audio('assets/audio/chill-music.mp3');
music.loop = true;
music.volume = 0.45;
const sfx = {
  torch: new Audio('assets/audio/torch-light-sfx.mp3'),
  ember: new Audio('assets/audio/ember-pickup-sfx.mp3'),
  exit: new Audio('assets/audio/maze-exit-sfx.mp3'),
};
for (const sound of Object.values(sfx)) {
  sound.preload = 'auto';
  sound.volume = Math.max(0, Math.min(1, 0.9));
}
let muted = false;
let audioStarted = false;
const unlockedSfx = new Set();
const unlockingSfx = new Set();
const pendingSfx = { torch: 0, ember: 0, exit: 0 };

function setMuted(value) {
  muted = value;
  music.muted = muted;
  for (const [kind, sound] of Object.entries(sfx)) {
    sound.muted = muted || unlockingSfx.has(kind);
  }
  if (muted) {
    for (const kind of Object.keys(pendingSfx)) pendingSfx[kind] = 0;
  }
}

function playSfxNow(kind) {
  const sound = sfx[kind];
  if (!sound || muted) return;
  sound.currentTime = 0;
  const playback = sound.play();
  if (playback) playback.catch(() => unlockedSfx.delete(kind));
}

function unlockSfx(kind) {
  const sound = sfx[kind];
  if (!sound || unlockedSfx.has(kind) || unlockingSfx.has(kind)) return;
  unlockingSfx.add(kind);
  sound.muted = true;
  let playback;
  try {
    sound.currentTime = 0;
    playback = sound.play();
  } catch {
    unlockingSfx.delete(kind);
    sound.muted = muted;
    return;
  }
  const finishUnlock = () => {
    sound.pause();
    sound.currentTime = 0;
    unlockingSfx.delete(kind);
    unlockedSfx.add(kind);
    sound.muted = muted;
    const queued = pendingSfx[kind];
    pendingSfx[kind] = 0;
    for (let i = 0; i < queued && !muted; i++) playSfxNow(kind);
  };
  if (!playback || typeof playback.then !== 'function') {
    finishUnlock();
    return;
  }
  playback.then(finishUnlock).catch(() => {
    unlockingSfx.delete(kind);
    sound.muted = muted;
  });
}

function playSfx(kind) {
  if (muted || !sfx[kind]) return;
  if (!unlockedSfx.has(kind)) {
    pendingSfx[kind] = Math.min(2, pendingSfx[kind] + 1);
    return;
  }
  playSfxNow(kind);
}

const MAX_STAGES = 20;
const save = JSON.parse(localStorage.getItem('lanternMaze') || '{"stars":{},"unlocked":1}');
save.unlocked = Math.max(1, Math.min(MAX_STAGES, Number(save.unlocked) || 1));
let levelIndex = save.unlocked;
let state;
let mode = 'play';
let time = 0;
const keys = {};
const touchCapable = navigator.maxTouchPoints > 0 || 'ontouchstart' in window;
const touchStick = { pointerId: null, x: 0, y: 0 };
const fireflies = [];

function getTouchStickBase() {
  const radius = Math.max(112, 68 / canvasScale);
  const travel = Math.max(64, 38 / canvasScale);
  const knobRadius = Math.max(30, 18 / canvasScale);
  const margin = 18 / canvasScale;
  return { x: radius + margin, y: H - radius - margin, radius, travel, knobRadius };
}

function getTouchActions() {
  const radius = Math.max(48, 28 / canvasScale);
  const gap = Math.max(12, 12 / canvasScale);
  const margin = 18 / canvasScale;
  const y = H - margin - radius;
  const restart = { x: W - margin - radius, y, radius };
  const next = { action: 'nextUnlocked', x: restart.x - 2 * radius - gap, y, label: '›' };
  const previous = { action: 'previous', x: next.x - 2 * radius - gap, y, label: '‹' };
  return { buttons: [previous, next], radius, restart };
}

const sparks = [];
const lanternMotes = [];

function seededRandom(seed) {
  let value = seed >>> 0;
  return () => {
    value = (value + 0x6D2B79F5) >>> 0;
    let t = value;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle(items, random) {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}

const STAGES = [
  { name: 'The First Spark', tagline: 'A winding path awakens', algorithm: 'dfs', floorTint: 'rgba(255,166,78,0.05)', wallTint: 'rgba(125,78,38,0.08)' },
  { name: 'Forked Causeway', tagline: 'Branches lead to distant flames', algorithm: 'prim', floorTint: 'rgba(95,153,188,0.10)', wallTint: 'rgba(46,83,126,0.13)' },
  { name: 'Mossbound Archive', tagline: 'Hidden chambers break the corridors', algorithm: 'sidewinder', rooms: [[0.22, 0.25, 2, 2], [0.72, 0.67, 2, 2]], floorTint: 'rgba(76,132,74,0.13)', wallTint: 'rgba(41,88,46,0.15)' },
  { name: 'The Drowned Coil', tagline: 'A patient, twisting descent', algorithm: 'hunt', floorTint: 'rgba(45,119,147,0.14)', wallTint: 'rgba(24,63,94,0.18)' },
  { name: 'Glass Twins', tagline: 'Loops conceal the truest route', algorithm: 'kruskal', braid: 0.14, floorTint: 'rgba(140,103,174,0.12)', wallTint: 'rgba(79,54,119,0.16)' },
  { name: 'Ashen Switchbacks', tagline: 'Long lanes turn without warning', algorithm: 'dfs', bias: 'horizontal', braid: 0.07, floorTint: 'rgba(173,94,69,0.12)', wallTint: 'rgba(92,48,47,0.18)' },
  { name: 'Moss Cathedral', tagline: 'Four chambers, one lost ember', algorithm: 'prim', rooms: [[0.18, 0.18, 2, 2], [0.69, 0.18, 3, 2], [0.25, 0.68, 3, 2], [0.72, 0.68, 2, 2]], floorTint: 'rgba(70,139,97,0.15)', wallTint: 'rgba(30,76,62,0.18)' },
  { name: 'The Hollow Crown', tagline: 'A broken ring surrounds the heart', algorithm: 'kruskal', ring: true, braid: 0.08, floorTint: 'rgba(69,106,168,0.14)', wallTint: 'rgba(43,54,119,0.18)' },
  { name: 'Firefly Orchard', tagline: 'Rooms and shortcuts twist together', algorithm: 'sidewinder', rooms: [[0.16, 0.34, 2, 2], [0.45, 0.18, 3, 2], [0.70, 0.60, 3, 2]], braid: 0.18, floorTint: 'rgba(127,155,68,0.13)', wallTint: 'rgba(76,93,39,0.18)' },
  { name: 'Ember Sanctum', tagline: 'The labyrinth folds back on itself', algorithm: 'hunt', rooms: [[0.18, 0.22, 3, 2], [0.67, 0.20, 3, 2], [0.19, 0.68, 3, 2], [0.68, 0.66, 3, 2]], ring: true, cross: true, braid: 0.2, floorTint: 'rgba(184,119,56,0.13)', wallTint: 'rgba(107,53,37,0.19)' },
  { name: 'Sapphire Switchyard', tagline: 'Blue corridors branch into hidden loops', algorithm: 'prim', ring: true, braid: 0.12, floorTint: 'rgba(49,122,180,0.16)', wallTint: 'rgba(34,65,123,0.20)' },
  { name: 'Clockroot Keep', tagline: 'Ancient rooms interrupt the long climb', algorithm: 'dfs', bias: 'vertical', rooms: [[0.26, 0.20, 3, 2], [0.62, 0.66, 3, 2]], braid: 0.09, floorTint: 'rgba(148,118,70,0.15)', wallTint: 'rgba(81,69,43,0.20)' },
  { name: 'Wraithwood', tagline: 'The quiet paths twist back on themselves', algorithm: 'hunt', braid: 0.24, floorTint: 'rgba(118,75,151,0.16)', wallTint: 'rgba(67,43,105,0.20)' },
  { name: 'The Spiral Nave', tagline: 'A looping circuit guards the center', algorithm: 'kruskal', ring: true, rooms: [[0.42, 0.40, 3, 2]], floorTint: 'rgba(83,113,181,0.15)', wallTint: 'rgba(49,59,125,0.21)' },
  { name: 'Floodglass Vault', tagline: 'Wide lanes conceal four drowned halls', algorithm: 'sidewinder', rooms: [[0.12, 0.28, 3, 2], [0.39, 0.64, 3, 2], [0.68, 0.22, 3, 2], [0.75, 0.68, 2, 2]], braid: 0.14, floorTint: 'rgba(44,153,161,0.15)', wallTint: 'rgba(25,83,105,0.21)' },
  { name: 'The Sunken Gate', tagline: 'A crossroad splits the deep passages', algorithm: 'prim', cross: true, rooms: [[0.20, 0.62, 2, 2], [0.72, 0.18, 2, 2]], braid: 0.1, floorTint: 'rgba(79,133,146,0.16)', wallTint: 'rgba(35,76,96,0.22)' },
  { name: 'Frostfire Labyrinth', tagline: 'Cold branches circle a warm heart', algorithm: 'dfs', bias: 'vertical', ring: true, braid: 0.2, floorTint: 'rgba(127,167,190,0.16)', wallTint: 'rgba(63,91,141,0.22)' },
  { name: 'Thornwheel', tagline: 'A maze of spokes, chambers, and shortcuts', algorithm: 'kruskal', cross: true, rooms: [[0.16, 0.17, 3, 2], [0.68, 0.18, 3, 2], [0.17, 0.70, 3, 2], [0.68, 0.69, 3, 2]], braid: 0.16, floorTint: 'rgba(109,144,73,0.16)', wallTint: 'rgba(59,91,45,0.22)' },
  { name: 'Lantern Foundry', tagline: 'Forged halls hide a maze of side routes', algorithm: 'sidewinder', rooms: [[0.12, 0.42, 3, 2], [0.40, 0.16, 4, 2], [0.70, 0.61, 3, 3]], cross: true, braid: 0.19, floorTint: 'rgba(188,105,54,0.16)', wallTint: 'rgba(103,49,39,0.23)' },
  { name: 'The Last Ember', tagline: 'Twenty mazes lead to one final light', algorithm: 'kruskal', ring: true, rooms: [[0.12, 0.20, 3, 3], [0.40, 0.13, 4, 2], [0.71, 0.20, 3, 3], [0.18, 0.67, 4, 2], [0.66, 0.67, 4, 2]], braid: 0.26, floorTint: 'rgba(208,133,56,0.18)', wallTint: 'rgba(112,45,33,0.24)' },
];

const DIRECTIONS = [[1, 0], [-1, 0], [0, 1], [0, -1]];

function emptyMaze(cols, rows) {
  return Array.from({ length: rows * 2 + 1 }, () => Array(cols * 2 + 1).fill(1));
}

function openCell(grid, x, y) {
  grid[y * 2 + 1][x * 2 + 1] = 0;
}

function connectCells(grid, x, y, nx, ny) {
  grid[y * 2 + 1][x * 2 + 1] = 0;
  grid[ny * 2 + 1][nx * 2 + 1] = 0;
  grid[y + ny + 1][x + nx + 1] = 0;
}

function buildDfsMaze(cols, rows, random, bias = null) {
  const grid = emptyMaze(cols, rows);
  const visited = new Set(['0,0']);
  const stack = [[0, 0]];
  openCell(grid, 0, 0);
  while (stack.length) {
    const [x, y] = stack[stack.length - 1];
    let options = DIRECTIONS
      .map(([dx, dy]) => [x + dx, y + dy, dx, dy])
      .filter(([nx, ny]) => nx >= 0 && ny >= 0 && nx < cols && ny < rows && !visited.has(`${nx},${ny}`));
    if (!options.length) {
      stack.pop();
      continue;
    }
    if (bias && random() < 0.72) {
      const favored = options.filter(([, , dx, dy]) => bias === 'horizontal' ? dx !== 0 : dy !== 0);
      if (favored.length) options = favored;
    }
    const [nx, ny, dx, dy] = options[Math.floor(random() * options.length)];
    connectCells(grid, x, y, nx, ny);
    visited.add(`${nx},${ny}`);
    stack.push([nx, ny]);
  }
  return grid;
}

function buildPrimMaze(cols, rows, random) {
  const grid = emptyMaze(cols, rows);
  const visited = new Set(['0,0']);
  const frontier = [];
  openCell(grid, 0, 0);
  const addFrontier = (x, y) => {
    for (const [dx, dy] of DIRECTIONS) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx >= 0 && ny >= 0 && nx < cols && ny < rows && !visited.has(`${nx},${ny}`)) frontier.push([x, y, nx, ny]);
    }
  };
  addFrontier(0, 0);
  while (frontier.length) {
    const edge = frontier.splice(Math.floor(random() * frontier.length), 1)[0];
    const [x, y, nx, ny] = edge;
    if (visited.has(`${nx},${ny}`)) continue;
    connectCells(grid, x, y, nx, ny);
    visited.add(`${nx},${ny}`);
    addFrontier(nx, ny);
  }
  return grid;
}

function buildKruskalMaze(cols, rows, random) {
  const grid = emptyMaze(cols, rows);
  const parent = Array.from({ length: cols * rows }, (_, i) => i);
  const find = (value) => {
    while (parent[value] !== value) {
      parent[value] = parent[parent[value]];
      value = parent[value];
    }
    return value;
  };
  const edges = [];
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (x + 1 < cols) edges.push([x, y, x + 1, y]);
      if (y + 1 < rows) edges.push([x, y, x, y + 1]);
      openCell(grid, x, y);
    }
  }
  shuffle(edges, random);
  for (const [x, y, nx, ny] of edges) {
    const a = find(y * cols + x);
    const b = find(ny * cols + nx);
    if (a !== b) {
      parent[a] = b;
      connectCells(grid, x, y, nx, ny);
    }
  }
  return grid;
}

function buildSidewinderMaze(cols, rows, random) {
  const grid = emptyMaze(cols, rows);
  for (let y = 0; y < rows; y++) {
    let run = [];
    for (let x = 0; x < cols; x++) {
      openCell(grid, x, y);
      run.push(x);
      const closeRun = x === cols - 1 || (y < rows - 1 && random() < 0.34);
      if (!closeRun) {
        connectCells(grid, x, y, x + 1, y);
        continue;
      }
      if (y < rows - 1) {
        const chosen = run[Math.floor(random() * run.length)];
        connectCells(grid, chosen, y, chosen, y + 1);
      }
      run = [];
    }
  }
  return grid;
}

function buildHuntMaze(cols, rows, random) {
  const grid = emptyMaze(cols, rows);
  const visited = Array.from({ length: rows }, () => Array(cols).fill(false));
  let current = [0, 0];
  visited[0][0] = true;
  openCell(grid, 0, 0);
  let remaining = cols * rows - 1;
  while (remaining > 0) {
    const [x, y] = current;
    const options = shuffle(DIRECTIONS.map(([dx, dy]) => [x + dx, y + dy, dx, dy])
      .filter(([nx, ny]) => nx >= 0 && ny >= 0 && nx < cols && ny < rows && !visited[ny][nx]), random);
    if (options.length) {
      const [nx, ny, dx, dy] = options[0];
      connectCells(grid, x, y, nx, ny);
      visited[ny][nx] = true;
      remaining--;
      current = [nx, ny];
      continue;
    }
    let found = false;
    const offset = Math.floor(random() * cols * rows);
    for (let i = 0; i < cols * rows && !found; i++) {
      const index = (i + offset) % (cols * rows);
      const hx = index % cols;
      const hy = Math.floor(index / cols);
      if (visited[hy][hx]) continue;
      const linked = shuffle(DIRECTIONS.map(([dx, dy]) => [hx + dx, hy + dy, dx, dy])
        .filter(([nx, ny]) => nx >= 0 && ny >= 0 && nx < cols && ny < rows && visited[ny][nx]), random);
      if (linked.length) {
        const [nx, ny, dx, dy] = linked[0];
        connectCells(grid, hx, hy, nx, ny);
        visited[hy][hx] = true;
        remaining--;
        current = [hx, hy];
        found = true;
      }
    }
    if (!found) break;
  }
  return grid;
}

function buildMaze(cols, rows, random, algorithm, bias = null) {
  if (algorithm === 'prim') return buildPrimMaze(cols, rows, random);
  if (algorithm === 'kruskal') return buildKruskalMaze(cols, rows, random);
  if (algorithm === 'sidewinder') return buildSidewinderMaze(cols, rows, random);
  if (algorithm === 'hunt') return buildHuntMaze(cols, rows, random);
  return buildDfsMaze(cols, rows, random, bias);
}

function findDeadEnds(grid) {
  const ends = [];
  for (let y = 1; y < grid.length; y += 2) {
    for (let x = 1; x < grid[0].length; x += 2) {
      const open = DIRECTIONS.filter(([dx, dy]) => grid[y + dy][x + dx] === 0).length;
      if (open === 1 && !(x === 1 && y === 1)) ends.push({ x, y });
    }
  }
  return ends;
}

function carveRoom(grid, cols, rows, fx, fy, width, height) {
  const x0 = Math.max(1, Math.min(cols - width - 1, Math.round(fx * (cols - width - 1))));
  const y0 = Math.max(1, Math.min(rows - height - 1, Math.round(fy * (rows - height - 1))));
  for (let y = y0; y < y0 + height; y++) {
    for (let x = x0; x < x0 + width; x++) {
      openCell(grid, x, y);
      if (x + 1 < x0 + width) connectCells(grid, x, y, x + 1, y);
      if (y + 1 < y0 + height) connectCells(grid, x, y, x, y + 1);
    }
  }
}

function carveRing(grid, cols, rows) {
  const x0 = Math.max(1, Math.floor(cols * 0.28));
  const x1 = Math.min(cols - 2, Math.ceil(cols * 0.72));
  const y0 = Math.max(1, Math.floor(rows * 0.25));
  const y1 = Math.min(rows - 2, Math.ceil(rows * 0.75));
  if (x1 <= x0 || y1 <= y0) return;
  for (let x = x0; x <= x1; x++) {
    openCell(grid, x, y0);
    openCell(grid, x, y1);
    if (x < x1) {
      connectCells(grid, x, y0, x + 1, y0);
      connectCells(grid, x, y1, x + 1, y1);
    }
  }
  for (let y = y0; y <= y1; y++) {
    openCell(grid, x0, y);
    openCell(grid, x1, y);
    if (y < y1) {
      connectCells(grid, x0, y, x0, y + 1);
      connectCells(grid, x1, y, x1, y + 1);
    }
  }
}

function carveCross(grid, cols, rows) {
  const cx = Math.floor(cols / 2);
  const cy = Math.floor(rows / 2);
  for (let y = 0; y < rows - 1; y++) connectCells(grid, cx, y, cx, y + 1);
  for (let x = 0; x < cols - 1; x++) connectCells(grid, x, cy, x + 1, cy);
}

function braidMaze(grid, amount, random) {
  const ends = shuffle(findDeadEnds(grid), random);
  const count = Math.floor(ends.length * amount);
  for (const end of ends.slice(0, count)) {
    const options = shuffle(DIRECTIONS.map(([dx, dy]) => [dx, dy])
      .filter(([dx, dy]) => grid[end.y + dy][end.x + dx] === 1 && grid[end.y + dy * 2]?.[end.x + dx * 2] === 0), random);
    if (options.length) grid[end.y + options[0][1]][end.x + options[0][0]] = 0;
  }
}

function cellDistances(grid, start) {
  const distances = Array.from({ length: grid.length }, () => Array(grid[0].length).fill(-1));
  const queue = [start];
  distances[start.y][start.x] = 0;
  for (let i = 0; i < queue.length; i++) {
    const point = queue[i];
    for (const [dx, dy] of DIRECTIONS) {
      const nx = point.x + dx * 2;
      const ny = point.y + dy * 2;
      if (grid[ny]?.[nx] !== 0 || distances[ny][nx] !== -1) continue;
      distances[ny][nx] = distances[point.y][point.x] + 1;
      queue.push({ x: nx, y: ny });
    }
  }
  return distances;
}

function startLevel(n) {
  levelIndex = n;
  touchStick.pointerId = null;
  touchStick.x = 0;
  touchStick.y = 0;
  const stage = STAGES[n - 1];
  const random = seededRandom(0x51A7E + Math.imul(n, 0x9E3779B9));
  const cols = 6 + n;
  const rows = 4 + Math.ceil(n * 0.6);
  const grid = buildMaze(cols, rows, random, stage.algorithm, stage.bias);
  for (const [fx, fy, width, height] of stage.rooms || []) carveRoom(grid, cols, rows, fx, fy, width, height);
  if (stage.ring) carveRing(grid, cols, rows);
  if (stage.cross) carveCross(grid, cols, rows);
  if (stage.braid) braidMaze(grid, stage.braid, random);

  const mapTop = touchCapable ? 250 : 174;
  const tile = Math.floor(Math.min((W - 80) / grid[0].length, (H - mapTop - 40) / grid.length));
  const exit = { x: grid[0].length - 2, y: grid.length - 2 };
  const start = { x: 1, y: 1 };
  const startDistances = cellDistances(grid, start);
  const reachable = [];
  for (let y = 1; y < grid.length; y += 2) {
    for (let x = 1; x < grid[0].length; x += 2) {
      if (startDistances[y][x] >= 0) reachable.push({ x, y, distance: startDistances[y][x] });
    }
  }
  const maxDistance = Math.max(...reachable.map((cell) => cell.distance));
  const ends = shuffle(findDeadEnds(grid).filter((end) => !(end.x === exit.x && end.y === exit.y)), random);
  const distantEnds = ends.filter((end) => startDistances[end.y][end.x] >= maxDistance * 0.45);
  const ember = (distantEnds.length ? distantEnds : ends)[0] || reachable
    .filter((cell) => !(cell.x === exit.x && cell.y === exit.y))
    .sort((a, b) => b.distance - a.distance)[0] || { x: 1, y: grid.length - 2 };

  const candidates = reachable.filter((cell) => !(cell.x === exit.x && cell.y === exit.y) && !(cell.x === ember.x && cell.y === ember.y));
  const anchorMaps = [startDistances, cellDistances(grid, ember)];
  const torches = [];
  for (let i = 0; i < 3 && candidates.length; i++) {
    let bestIndex = 0;
    let bestScore = -Infinity;
    for (let j = 0; j < candidates.length; j++) {
      const cell = candidates[j];
      const separation = Math.min(...anchorMaps.map((map) => map[cell.y][cell.x]).filter((distance) => distance >= 0));
      const score = separation + random() * 1.5;
      if (score > bestScore) {
        bestScore = score;
        bestIndex = j;
      }
    }
    const [torch] = candidates.splice(bestIndex, 1);
    torches.push({ x: torch.x, y: torch.y, lit: false });
    anchorMaps.push(cellDistances(grid, torch));
  }
  state = {
    grid, tile, exit, ember, torches, emberTaken: false, stage,
    ox: (W - grid[0].length * tile) / 2,
    oy: mapTop + (H - mapTop - grid.length * tile) / 2,
    px: 1.5 * tile, py: 1.5 * tile,
    facingX: 0, facingY: 1, trailTimer: 0,
  };
  lanternMotes.length = 0;
  fireflies.length = 0;
  for (let i = 0; i < 18; i++) {
    fireflies.push({ x: Math.random() * W, y: Math.random() * H, a: Math.random() * 6 });
  }
  mode = 'play';
}

function isWall(px, py) {
  const { grid, tile } = state;
  const gx = Math.floor(px / tile);
  const gy = Math.floor(py / tile);
  return !grid[gy] || grid[gy][gx] !== 0;
}

function movePlayer(dt) {
  let dx = (keys.ArrowRight || keys.KeyD ? 1 : 0) - (keys.ArrowLeft || keys.KeyA ? 1 : 0) + touchStick.x;
  let dy = (keys.ArrowDown || keys.KeyS ? 1 : 0) - (keys.ArrowUp || keys.KeyW ? 1 : 0) + touchStick.y;
  const inputLength = Math.hypot(dx, dy);
  if (inputLength > 1) {
    dx /= inputLength;
    dy /= inputLength;
  }
  const speed = state.tile * 4.5 * dt;
  const r = state.tile * 0.28;
  const beforeX = state.px;
  const beforeY = state.py;
  const nx = state.px + dx * speed;
  if (!isWall(nx + Math.sign(dx) * r, state.py - r * 0.9) && !isWall(nx + Math.sign(dx) * r, state.py + r * 0.9)) state.px = nx;
  const ny = state.py + dy * speed;
  if (!isWall(state.px - r * 0.9, ny + Math.sign(dy) * r) && !isWall(state.px + r * 0.9, ny + Math.sign(dy) * r)) state.py = ny;

  const movedX = state.px - beforeX;
  const movedY = state.py - beforeY;
  if (Math.hypot(movedX, movedY) > 0) {
    const length = Math.hypot(movedX, movedY);
    state.facingX = movedX / length;
    state.facingY = movedY / length;
    state.trailTimer += dt;
    while (state.trailTimer >= 0.045) {
      state.trailTimer -= 0.045;
      if (lanternMotes.length < 28) {
        lanternMotes.push({
          x: state.ox + state.px - state.facingX * state.tile * 0.18 + (Math.random() - 0.5) * state.tile * 0.04,
          y: state.oy + state.py - state.facingY * state.tile * 0.18 + (Math.random() - 0.5) * state.tile * 0.04,
          vx: -state.facingX * state.tile * 0.12 + (Math.random() - 0.5) * state.tile * 0.12,
          vy: -state.facingY * state.tile * 0.12 + (Math.random() - 0.5) * state.tile * 0.12,
          age: 0,
          life: 0.48 + Math.random() * 0.38,
          phase: Math.random() * Math.PI * 2,
          size: state.tile * (0.018 + Math.random() * 0.018),
        });
      }
    }
  }
}

function burst(x, y, color) {
  for (let i = 0; i < 26; i++) {
    const a = Math.random() * Math.PI * 2;
    const s = 60 + Math.random() * 160;
    sparks.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 1, color });
  }
}

function checkPickups() {
  const { tile, ox, oy } = state;
  const near = (c) => Math.hypot((c.x + 0.5) * tile - state.px, (c.y + 0.5) * tile - state.py) < tile * 0.6;
  for (const t of state.torches) {
    if (!t.lit && near(t)) {
      t.lit = true;
      playSfx('torch');
      burst(ox + (t.x + 0.5) * tile, oy + (t.y + 0.5) * tile, '255,190,90');
    }
  }
  if (!state.emberTaken && near(state.ember)) {
    state.emberTaken = true;
    playSfx('ember');
    burst(ox + (state.ember.x + 0.5) * tile, oy + (state.ember.y + 0.5) * tile, '255,110,60');
  }
  if (near(state.exit)) finishLevel();
}

function starsEarned() {
  return 1 + (state.torches.every((t) => t.lit) ? 1 : 0) + (state.emberTaken ? 1 : 0);
}

function finishLevel() {
  mode = 'won';
  const s = starsEarned();
  save.stars[levelIndex] = Math.max(save.stars[levelIndex] || 0, s);
  save.unlocked = Math.max(save.unlocked, Math.min(levelIndex + 1, MAX_STAGES));
  localStorage.setItem('lanternMaze', JSON.stringify(save));
  playSfx('exit');
}

function drawTiled(image, x, y, w, h, sx, sy) {
  if (image.complete && image.naturalWidth) {
    ctx.drawImage(image, (sx * 97) % 384, (sy * 61) % 384, 128, 128, x, y, w, h);
  }
}

function drawWorld() {
  const { grid, tile, ox, oy } = state;
  ctx.fillStyle = '#05070d';
  ctx.fillRect(0, 0, W, H);
  if (img.backdrop.complete && img.backdrop.naturalWidth) ctx.drawImage(img.backdrop, 0, 0, W, H);
  ctx.fillStyle = 'rgba(3,5,13,0.42)';
  ctx.fillRect(0, 0, W, H);
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[0].length; x++) {
      const X = ox + x * tile;
      const Y = oy + y * tile;
      if (grid[y][x]) {
        ctx.fillStyle = '#151b2b';
        ctx.fillRect(X, Y, tile, tile);
        drawTiled(img.wall, X, Y, tile, tile, x, y);
        ctx.fillStyle = 'rgba(7,10,20,0.2)';
        ctx.fillRect(X, Y, tile, tile);
        ctx.fillStyle = state.stage.wallTint;
        ctx.fillRect(X, Y, tile, tile);
      } else {
        ctx.fillStyle = '#39485d';
        ctx.fillRect(X, Y, tile, tile);
        drawTiled(img.floor, X, Y, tile, tile, x, y);
        ctx.fillStyle = 'rgba(114,151,190,0.1)';
        ctx.fillRect(X, Y, tile, tile);
        ctx.fillStyle = state.stage.floorTint;
        ctx.fillRect(X, Y, tile, tile);
      }
    }
  }
  const pulse = 1 + Math.sin(time * 3) * 0.1;
  const ex = ox + (state.exit.x + 0.5) * tile;
  const ey = oy + (state.exit.y + 0.5) * tile;
  const g = ctx.createRadialGradient(ex, ey, 2, ex, ey, tile * 0.6 * pulse);
  g.addColorStop(0, 'rgba(200,255,255,1)');
  g.addColorStop(0.4, 'rgba(90,200,255,0.8)');
  g.addColorStop(1, 'rgba(40,80,200,0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(ex, ey, tile * 0.6 * pulse, 0, 7);
  ctx.fill();
  const s = tile * 0.8;
  for (const t of state.torches) {
    ctx.globalAlpha = t.lit ? 1 : 0.45;
    ctx.drawImage(img.torch, ox + (t.x + 0.5) * tile - s / 2, oy + (t.y + 0.5) * tile - s / 2, s, s);
  }
  ctx.globalAlpha = 1;
  if (!state.emberTaken) {
    const bob = Math.sin(time * 2.5) * tile * 0.08;
    ctx.drawImage(img.ember, ox + (state.ember.x + 0.5) * tile - s / 2, oy + (state.ember.y + 0.5) * tile - s / 2 + bob, s, s);
  }
  const px = ox + state.px;
  const py = oy + state.py;
  ctx.save();
  ctx.translate(px, py);
  ctx.rotate(Math.atan2(state.facingY, state.facingX) + Math.PI / 2);
  if (img.player.complete && img.player.naturalWidth) {
    const spriteHeight = tile * 0.98;
    const spriteWidth = spriteHeight * (img.player.naturalWidth / img.player.naturalHeight);
    ctx.drawImage(img.player, -spriteWidth / 2, -spriteHeight / 2, spriteWidth, spriteHeight);
  }
  ctx.restore();
}

function punchLight(x, y, r) {
  const g = dctx.createRadialGradient(x, y, r * 0.1, x, y, r);
  g.addColorStop(0, 'rgba(0,0,0,0.94)');
  g.addColorStop(0.55, 'rgba(0,0,0,0.62)');
  g.addColorStop(1, 'rgba(0,0,0,0)');
  dctx.fillStyle = g;
  dctx.fillRect(x - r, y - r, r * 2, r * 2);
}

function warmGlow(x, y, r, color, a) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, `rgba(${color},${a})`);
  g.addColorStop(1, `rgba(${color},0)`);
  ctx.fillStyle = g;
  ctx.fillRect(x - r, y - r, r * 2, r * 2);
}

function drawLighting() {
  const { tile, ox, oy } = state;
  dctx.globalCompositeOperation = 'source-over';
  dctx.clearRect(0, 0, W, H);
  dctx.fillStyle = 'rgba(2,3,10,0.998)';
  dctx.fillRect(0, 0, W, H);
  dctx.globalCompositeOperation = 'destination-out';
  const flicker = 1 + Math.sin(time * 9) * 0.03 + Math.sin(time * 23) * 0.02;
  const lr = tile * 2.7 * flicker;
  const px = ox + state.px;
  const py = oy + state.py;
  punchLight(px, py, lr);
  for (const t of state.torches) {
    if (t.lit) punchLight(ox + (t.x + 0.5) * tile, oy + (t.y + 0.5) * tile, tile * 2.1 * flicker);
  }
  ctx.drawImage(dark, 0, 0);
  ctx.globalCompositeOperation = 'lighter';
  warmGlow(px, py, lr * 0.85, '255,160,60', 0.11);
  for (const t of state.torches) {
    if (t.lit) warmGlow(ox + (t.x + 0.5) * tile, oy + (t.y + 0.5) * tile, tile * 1.9, '255,140,50', 0.13);
  }
  for (const mote of lanternMotes) {
    const fade = Math.max(0, 1 - mote.age / mote.life);
    const shimmer = 0.75 + Math.sin(time * 12 + mote.phase) * 0.25;
    warmGlow(mote.x, mote.y, mote.size * 4, '255,190,105', fade * shimmer * 0.42);
    ctx.fillStyle = `rgba(255,230,175,${fade * shimmer * 0.55})`;
    ctx.beginPath();
    ctx.arc(mote.x, mote.y, mote.size * 0.35, 0, Math.PI * 2);
    ctx.fill();
  }
  for (const f of fireflies) warmGlow(f.x, f.y, 5, '120,220,255', 0.12 + Math.sin(f.a * 3) * 0.04);
  for (const p of sparks) warmGlow(p.x, p.y, 8, p.color, p.life);
  ctx.globalCompositeOperation = 'source-over';
}

function getHudScale() {
  return touchCapable ? Math.min(1.65, Math.max(1, 0.72 / canvasScale)) : 1;
}

function getProgressStageRects() {
  const scale = Math.min(1.1, getHudScale());
  const width = 48 * scale;
  const gap = 5 * scale;
  const height = 33 * scale;
  const x = 286;
  const y = 20 + 42 * scale;
  return Array.from({ length: MAX_STAGES }, (_, i) => ({
    stage: i + 1,
    x: x + (i % 10) * (width + gap),
    y: y + Math.floor(i / 10) * (height + 4 * scale),
    width,
    height,
  }));
}

function getProgressStageAt(point) {
  const rect = getProgressStageRects().find((r) =>
    point.x >= r.x && point.x <= r.x + r.width && point.y >= r.y && point.y <= r.y + r.height
  );
  return rect ? rect.stage : null;
}

function drawHud() {
  const uiScale = getHudScale();
  const selectorScale = Math.min(1.1, uiScale);
  const top = 20;
  const panelHeight = 146 * selectorScale;
  const panel = ctx.createLinearGradient(0, top, 0, top + panelHeight);
  panel.addColorStop(0, 'rgba(24,25,34,0.96)');
  panel.addColorStop(0.55, 'rgba(15,19,29,0.95)');
  panel.addColorStop(1, 'rgba(9,13,23,0.97)');
  ctx.save();
  ctx.shadowColor = 'rgba(255,167,76,0.22)';
  ctx.shadowBlur = 18 * uiScale;
  ctx.fillStyle = panel;
  ctx.beginPath();
  ctx.roundRect(28, top, W - 56, panelHeight, 18 * uiScale);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = 'rgba(230,174,104,0.7)';
  ctx.lineWidth = 2.5;
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255,226,175,0.13)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(37, top + 8 * uiScale, W - 74, panelHeight - 16 * uiScale, 12 * uiScale);
  ctx.stroke();

  ctx.textAlign = 'left';
  ctx.fillStyle = '#d4a86f';
  ctx.font = `700 ${15 * uiScale}px Cinzel, Georgia, serif`;
  ctx.fillText('STAGE', 66, top + 28 * uiScale);
  ctx.fillStyle = '#fff0c7';
  ctx.font = `700 ${31 * uiScale}px Cinzel, Georgia, serif`;
  ctx.fillText(String(levelIndex).padStart(2, '0'), 66, top + 70 * uiScale);
  ctx.fillStyle = 'rgba(255,225,181,0.55)';
  ctx.font = `600 ${16 * uiScale}px Cinzel, Georgia, serif`;
  ctx.fillText('/ 20', 112, top + 69 * uiScale);
  ctx.strokeStyle = 'rgba(216,166,103,0.3)';
  ctx.beginPath();
  ctx.moveTo(244, top + 14 * uiScale);
  ctx.lineTo(244, top + panelHeight - 14 * uiScale);
  ctx.stroke();

  ctx.fillStyle = '#d5b17d';
  ctx.font = `600 ${13 * uiScale}px Cinzel, Georgia, serif`;
  const stage = STAGES[levelIndex - 1];
  const stageKeys = touchCapable ? '' : '  ·  SHIFT+1–0: STAGES 11–20';
  ctx.fillText(`${stage.name.toUpperCase()}  ·  ${stage.tagline.toUpperCase()}${stageKeys}`, 286, top + 22 * uiScale);
  const stageRects = getProgressStageRects();
  ctx.strokeStyle = 'rgba(220,165,94,0.32)';
  ctx.lineWidth = Math.max(2, 3 * Math.min(1.2, uiScale));
  for (const row of [stageRects.slice(0, 10), stageRects.slice(10)]) {
    const routeY = row[0].y + row[0].height / 2;
    ctx.beginPath();
    ctx.moveTo(row[0].x + row[0].width / 2, routeY);
    ctx.lineTo(row[row.length - 1].x + row[row.length - 1].width / 2, routeY);
    ctx.stroke();
  }
  for (const rect of stageRects) {
    const unlocked = rect.stage <= save.unlocked;
    const current = rect.stage === levelIndex;
    const earned = Math.max(0, Math.min(3, save.stars[rect.stage] || 0));
    const cardScale = Math.min(1.2, uiScale);
    const gradient = ctx.createLinearGradient(0, rect.y, 0, rect.y + rect.height);
    gradient.addColorStop(0, current ? 'rgba(73,48,27,0.96)' : unlocked ? 'rgba(31,39,52,0.97)' : 'rgba(15,20,31,0.96)');
    gradient.addColorStop(1, current ? 'rgba(30,25,27,0.98)' : unlocked ? 'rgba(16,22,34,0.98)' : 'rgba(10,14,23,0.98)');
    ctx.shadowColor = current ? 'rgba(255,178,76,0.62)' : 'transparent';
    ctx.shadowBlur = current ? 12 * cardScale : 0;
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.roundRect(rect.x, rect.y, rect.width, rect.height, 9 * cardScale);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = current ? '#ffd083' : unlocked ? 'rgba(201,164,115,0.62)' : 'rgba(125,139,160,0.3)';
    ctx.lineWidth = current ? 2.5 : 1.5;
    ctx.stroke();
    ctx.textAlign = 'center';
    ctx.fillStyle = current ? '#fff0c6' : unlocked ? '#e8d6b3' : '#728096';
    ctx.font = `700 ${15 * cardScale}px Cinzel, Georgia, serif`;
    ctx.fillText(String(rect.stage), rect.x + rect.width / 2, rect.y + 14 * cardScale);
    ctx.fillStyle = unlocked ? '#ffc65e' : '#687388';
    ctx.font = `700 ${9 * cardScale}px Georgia, serif`;
    ctx.fillText(Array.from({ length: 3 }, (_, i) => i < earned ? '★' : '☆').join(' '), rect.x + rect.width / 2, rect.y + 29 * cardScale);
  }

  const total = Object.values(save.stars).reduce((a, b) => a + b, 0);
  const lit = state.torches.filter((t) => t.lit).length;
  const items = [
    ['TORCHES', `${lit} / 3`, 1085],
    ['EMBER', `${state.emberTaken ? 1 : 0} / 1`, 1230],
    ['TOTAL STARS', `${total} / ${MAX_STAGES * 3}`, 1370],
  ];
  for (const [label, value, x] of items) {
    ctx.textAlign = 'left';
    ctx.fillStyle = '#cba772';
    ctx.font = `600 ${13 * uiScale}px Cinzel, Georgia, serif`;
    ctx.fillText(label, x, top + 30 * uiScale);
    ctx.fillStyle = '#ffedc2';
    ctx.font = `700 ${24 * uiScale}px Cinzel, Georgia, serif`;
    ctx.fillText(value, x, top + 65 * uiScale);
  }
  for (const x of [1060, 1208, 1350, 1555]) {
    ctx.strokeStyle = 'rgba(216,166,103,0.27)';
    ctx.beginPath();
    ctx.moveTo(x, top + 18 * uiScale);
    ctx.lineTo(x, top + panelHeight - 17 * uiScale);
    ctx.stroke();
  }
  const hint = touchCapable ? 'DRAG TO MOVE' : `WASD MOVE  ·  R RESTART  ·  M ${muted ? 'UNMUTE' : 'MUTE'}`;
  ctx.textAlign = 'right';
  ctx.fillStyle = 'rgba(226,204,168,0.78)';
  ctx.font = `600 ${12 * uiScale}px Cinzel, Georgia, serif`;
  ctx.fillText(hint, touchCapable ? 1715 : 1860, top + 53 * uiScale);
  if (touchCapable) {
    const mute = getTouchMuteRect();
    ctx.fillStyle = 'rgba(54,38,28,0.85)';
    ctx.strokeStyle = 'rgba(235,186,117,0.68)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(mute.x, mute.y, mute.width, mute.height, 14 * uiScale);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = muted ? '#a89a88' : '#ffe2a8';
    ctx.font = `700 ${Math.max(24, 28 / canvasScale)}px Inter`;
    ctx.textAlign = 'center';
    ctx.fillText(muted ? '×' : '♪', mute.x + mute.width / 2, mute.y + mute.height / 2);
  }
  ctx.restore();
}

function drawWin() {
  const uiScale = touchCapable ? Math.min(1.55, Math.max(1, 0.74 / canvasScale)) : 1;
  ctx.save();
  ctx.fillStyle = 'rgba(3,5,12,0.78)';
  ctx.fillRect(0, 0, W, H);
  const panelX = 520;
  const panelY = 185;
  const panelW = 880;
  const panelH = 720;
  const panel = ctx.createLinearGradient(0, panelY, 0, panelY + panelH);
  panel.addColorStop(0, 'rgba(28,25,29,0.98)');
  panel.addColorStop(1, 'rgba(9,13,22,0.99)');
  ctx.shadowColor = 'rgba(255,166,72,0.28)';
  ctx.shadowBlur = 28;
  ctx.fillStyle = panel;
  ctx.beginPath();
  ctx.roundRect(panelX, panelY, panelW, panelH, 24);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = '#d9a765';
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255,226,182,0.23)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(panelX + 12, panelY + 12, panelW - 24, panelH - 24, 18);
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.fillStyle = '#f7d393';
  ctx.font = `700 ${48 * uiScale}px Cinzel, Georgia, serif`;
  ctx.fillText(`${state.stage.name.toUpperCase()} · COMPLETE`, W / 2, 310);
  ctx.fillStyle = 'rgba(220,179,117,0.72)';
  ctx.fillRect(W / 2 - 170, 336, 340, 2);
  const earned = starsEarned();
  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = i < earned ? '#ffc04d' : '#344052';
    ctx.shadowColor = i < earned ? 'rgba(255,174,54,0.55)' : 'transparent';
    ctx.shadowBlur = i < earned ? 20 : 0;
    ctx.font = `700 ${91 * uiScale}px Georgia, serif`;
    ctx.fillText(i < earned ? '★' : '☆', W / 2 + (i - 1) * 132, 465);
  }
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#f3dfbb';
  ctx.font = `600 ${22 * uiScale}px Cinzel, Georgia, serif`;
  ctx.fillText(`${state.torches.filter((t) => t.lit).length} / 3 TORCHES  ·  ${state.emberTaken ? 'EMBER FOUND' : 'EMBER MISSED'}`, W / 2, 535);
  ctx.fillStyle = '#c6b59a';
  ctx.font = `400 ${23 * uiScale}px Inter`;
  ctx.fillText(`${earned} ${earned === 1 ? 'STAR' : 'STARS'} EARNED  ·  ${Object.values(save.stars).reduce((a, b) => a + b, 0)} / ${MAX_STAGES * 3} TOTAL`, W / 2, 590);

  const buttonX = W / 2 - 300;
  const buttonY = H / 2 + 195;
  const buttonW = 600;
  const buttonH = 120;
  const button = ctx.createLinearGradient(buttonX, buttonY, buttonX, buttonY + buttonH);
  button.addColorStop(0, 'rgba(111,72,35,0.96)');
  button.addColorStop(1, 'rgba(42,32,29,0.98)');
  ctx.shadowColor = 'rgba(255,174,67,0.64)';
  ctx.shadowBlur = 18;
  ctx.fillStyle = button;
  ctx.beginPath();
  ctx.roundRect(buttonX, buttonY, buttonW, buttonH, 17);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = '#ffcc75';
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.fillStyle = '#fff0c8';
  ctx.font = `700 ${25 * uiScale}px Cinzel, Georgia, serif`;
  ctx.fillText(levelIndex < MAX_STAGES ? 'NEXT STAGE  ›' : 'REPLAY FINAL STAGE  ↻', W / 2, buttonY + 73);
  ctx.fillStyle = '#c1b59f';
  ctx.font = `400 ${17 * uiScale}px Inter`;
  ctx.fillText(touchCapable ? 'Tap to continue  ·  Use the stage path above to replay' : 'Press SPACE for next stage  ·  R to replay this stage', W / 2, 885);
  ctx.restore();
}

function canvasPoint(event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((event.clientX - rect.left) / rect.width) * W,
    y: ((event.clientY - rect.top) / rect.height) * H,
  };
}

function isTouchStickPoint(point) {
  if (mode !== 'play') return false;
  const base = getTouchStickBase();
  return Math.hypot(point.x - base.x, point.y - base.y) <= base.radius;
}

function updateTouchStick(point) {
  const base = getTouchStickBase();
  const dx = point.x - base.x;
  const dy = point.y - base.y;
  const distance = Math.hypot(dx, dy);
  const deadzone = 10 / canvasScale;
  if (distance <= deadzone) {
    touchStick.x = 0;
    touchStick.y = 0;
    return;
  }
  const magnitude = Math.min(1, (distance - deadzone) / (base.travel - deadzone));
  touchStick.x = (dx / distance) * magnitude;
  touchStick.y = (dy / distance) * magnitude;
}

function getTouchMuteRect() {
  const width = Math.max(120, 48 / canvasScale);
  const height = Math.max(62, 48 / canvasScale);
  return { x: W - 125 - width / 2, y: Math.max(4, 60 - height / 2), width, height };
}

function actionAtTouchPoint(point) {
  const mute = getTouchMuteRect();
  if (point.x >= mute.x && point.x <= mute.x + mute.width && point.y >= mute.y && point.y <= mute.y + mute.height) return 'mute';
  const { buttons, radius, restart } = getTouchActions();
  const stageButton = buttons.find((button) => Math.hypot(point.x - button.x, point.y - button.y) <= radius);
  if (stageButton) return stageButton.action;
  if (mode === 'won') {
    const left = W / 2 - 300;
    const top = H / 2 + 195;
    if (point.x >= left && point.x <= left + 600 && point.y >= top && point.y <= top + 120) return 'continue';
    return null;
  }
  if (Math.hypot(point.x - restart.x, point.y - restart.y) <= restart.radius) return 'restart';
  return null;
}

function unlockAudio() {
  if (!audioStarted) {
    audioStarted = true;
    music.play().catch(() => {});
  }
  // Prime each independent sound from the user gesture for browser autoplay policies.
  for (const kind of Object.keys(sfx)) unlockSfx(kind);
}

function activateTouchAction(action) {
  if (action === 'previous' && levelIndex > 1) startLevel(levelIndex - 1);
  if (action === 'nextUnlocked' && levelIndex < save.unlocked) startLevel(levelIndex + 1);
  if (action === 'restart') startLevel(levelIndex);
  if (action === 'continue') startLevel(levelIndex < MAX_STAGES ? levelIndex + 1 : levelIndex);
  if (action === 'mute') {
    setMuted(!muted);
  }
}

function drawTouchControls() {
  if (!touchCapable) return;
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const { buttons, radius: stageRadius, restart } = getTouchActions();
  for (const button of buttons) {
    const enabled = button.action === 'previous' ? levelIndex > 1 : levelIndex < save.unlocked;
    ctx.fillStyle = enabled ? 'rgba(255,190,100,0.08)' : 'rgba(15,22,38,0.12)';
    ctx.strokeStyle = enabled ? 'rgba(255,220,165,0.3)' : 'rgba(150,165,190,0.2)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(button.x, button.y, stageRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = enabled ? 'rgba(255,226,168,0.72)' : 'rgba(120,131,154,0.55)';
    ctx.font = `600 ${Math.max(48, 36 / canvasScale)}px Inter`;
    ctx.fillText(button.label, button.x, button.y - 2);
  }
  if (mode !== 'won') {
    const { x, y, radius, travel, knobRadius } = getTouchStickBase();
    const active = touchStick.pointerId !== null;
    const stickX = x + touchStick.x * travel;
    const stickY = y + touchStick.y * travel;
    const base = ctx.createRadialGradient(x, y, 12, x, y, radius);
    base.addColorStop(0, active ? 'rgba(25,31,43,0.24)' : 'rgba(20,27,41,0.11)');
    base.addColorStop(0.72, active ? 'rgba(25,31,43,0.15)' : 'rgba(20,27,41,0.06)');
    base.addColorStop(1, 'rgba(20,27,41,0.01)');
    ctx.fillStyle = base;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = active ? 'rgba(255,220,165,0.34)' : 'rgba(220,231,245,0.14)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x, y, radius - 2, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = active ? 'rgba(255,220,165,0.18)' : 'rgba(220,231,245,0.1)';
    ctx.beginPath();
    ctx.arc(x, y, travel + knobRadius + 7, 0, Math.PI * 2);
    ctx.stroke();

    ctx.shadowColor = 'rgba(255,179,71,0.45)';
    ctx.shadowBlur = active ? 20 : 0;
    const knob = ctx.createRadialGradient(stickX - 10, stickY - 12, 3, stickX, stickY, knobRadius);
    knob.addColorStop(0, active ? 'rgba(255,225,174,0.78)' : 'rgba(205,218,235,0.34)');
    knob.addColorStop(1, active ? 'rgba(255,174,84,0.46)' : 'rgba(133,153,180,0.2)');
    ctx.fillStyle = knob;
    ctx.beginPath();
    ctx.arc(stickX, stickY, knobRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = active ? 'rgba(255,232,190,0.66)' : 'rgba(220,231,245,0.27)';
    ctx.lineWidth = 3;
    ctx.stroke();

    const { x: rx, y: ry, radius: restartRadius } = restart;
    ctx.fillStyle = 'rgba(15,22,38,0.12)';
    ctx.strokeStyle = 'rgba(210,225,245,0.24)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(rx, ry, restartRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = 'rgba(245,231,202,0.62)';
    ctx.font = `600 ${Math.max(42, 32 / canvasScale)}px Inter`;
    ctx.fillText('↻', rx, ry + 1);
  }
  ctx.restore();
}

function update(dt) {
  time += dt;
  if (mode === 'play') {
    movePlayer(dt);
    checkPickups();
  }
  for (const f of fireflies) {
    f.a += dt * 0.5;
    f.x += Math.cos(f.a) * 25 * dt;
    f.y += Math.sin(f.a * 1.3) * 20 * dt;
  }
  for (const mote of lanternMotes) {
    mote.age += dt;
    mote.x += mote.vx * dt;
    mote.y += mote.vy * dt;
  }
  for (let i = lanternMotes.length - 1; i >= 0; i--) {
    if (lanternMotes[i].age >= lanternMotes[i].life) lanternMotes.splice(i, 1);
  }
  for (const p of sparks) {
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.life -= dt;
  }
  for (let i = sparks.length - 1; i >= 0; i--) {
    if (sparks[i].life <= 0) sparks.splice(i, 1);
  }
}

let last = performance.now();
function loop(now) {
  const dt = Math.min((now - last) / 1000, 0.05);
  last = now;
  update(dt);
  drawWorld();
  drawLighting();
  drawHud();
  if (mode === 'won') drawWin();
  drawTouchControls();
  requestAnimationFrame(loop);
}

canvas.addEventListener('pointerdown', (e) => {
  const point = canvasPoint(e);
  const stage = getProgressStageAt(point);
  if (stage !== null) {
    e.preventDefault();
    unlockAudio();
    if (stage <= save.unlocked) startLevel(stage);
    return;
  }
  if (mode === 'won') {
    const action = actionAtTouchPoint(point);
    if (action === 'continue') {
      e.preventDefault();
      unlockAudio();
      activateTouchAction(action);
    }
    return;
  }
  if (!touchCapable) return;
  const action = actionAtTouchPoint(point);
  if (!action && !isTouchStickPoint(point)) return;
  e.preventDefault();
  try { canvas.setPointerCapture(e.pointerId); } catch {}
  unlockAudio();
  if (action) {
    activateTouchAction(action);
  } else {
    touchStick.pointerId = e.pointerId;
    updateTouchStick(point);
  }
});
canvas.addEventListener('pointermove', (e) => {
  if (e.pointerType === 'mouse') {
    const stage = getProgressStageAt(canvasPoint(e));
    canvas.style.cursor = stage !== null && stage <= save.unlocked ? 'pointer' : 'default';
  }
  if (touchStick.pointerId !== e.pointerId) return;
  e.preventDefault();
  updateTouchStick(canvasPoint(e));
});
function releaseTouchPointer(e) {
  if (touchStick.pointerId !== e.pointerId) return;
  touchStick.pointerId = null;
  touchStick.x = 0;
  touchStick.y = 0;
}
canvas.addEventListener('pointerup', releaseTouchPointer);
canvas.addEventListener('pointercancel', releaseTouchPointer);
canvas.addEventListener('lostpointercapture', releaseTouchPointer);

addEventListener('keydown', (e) => {
  keys[e.code] = true;
  unlockAudio();
  if (e.code === 'KeyR') startLevel(levelIndex);
  if (e.code === 'KeyM') {
    setMuted(!muted);
  }
  if (e.code === 'Space' && mode === 'won' && levelIndex < MAX_STAGES) startLevel(levelIndex + 1);
  const digit = e.code.match(/^Digit(\d)$/);
  if (digit) {
    const base = Number(digit[1]) || 10;
    const n = base + (e.shiftKey ? 10 : 0);
    if (n <= save.unlocked) startLevel(n);
  }
});
addEventListener('keyup', (e) => {
  keys[e.code] = false;
});

startLevel(levelIndex);
requestAnimationFrame(loop);
