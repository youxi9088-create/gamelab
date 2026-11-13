// Level generation, difficulty rules, solver/self-test, rules helpers and local save.

export const COLORS = [
    { name: 'Yellow', hex: 0xffc81e },
    { name: 'Red', hex: 0xff4757 },
    { name: 'Blue', hex: 0x3c8dff },
    { name: 'Green', hex: 0x2ed573 },
    { name: 'Purple', hex: 0xa55eea },
    { name: 'Orange', hex: 0xff8c1a },
    { name: 'Pink', hex: 0xff6bcb },
    { name: 'Cyan', hex: 0x1fd1d1 },
];

// [dx, dy] in grid space; dy +1 is toward +z (down the screen)
export const DIRS = [[0, -1], [1, 0], [0, 1], [-1, 0]];

export const SKINS = [
    { id: 'classic', name: 'Classic', cost: 0, swatch: '#ffc81e' },
    { id: 'checker', name: 'Checker', cost: 150, swatch: '#222' },
    { id: 'retro', name: 'Retro Top', cost: 300, swatch: '#f4f1e8' },
    { id: 'neon', name: 'Neon Glow', cost: 500, swatch: '#39ffb6' },
    { id: 'gold', name: 'Gold VIP', cost: 900, swatch: '#e6b422' },
];

export const DISTRICTS = ['Downtown', 'Harbor', 'Old Town', 'Airport', 'Tech Park', 'Skyline', 'Stadium', 'University', 'Market', 'Beach'];
export const LEVELS_PER_DISTRICT = 5;
export const MAX_LEVEL = 1000;
export const MILESTONES = [25, 50, 100, 250, 500, 1000];
export const isMilestone = n => MILESTONES.includes(n);

export function districtName(index) {
    return DISTRICTS[index % DISTRICTS.length];
}

function seededRandom(seed) {
    let a = seed >>> 0;
    return () => {
        a = (a + 0x6d2b79f5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

export function vehicleCells(v) {
    const horizontal = v.dir === 1 || v.dir === 3;
    const cells = [];
    for (let i = 0; i < v.len; i++) {
        cells.push(horizontal ? [v.x + i, v.y] : [v.x, v.y + i]);
    }
    return cells;
}

// Returns the first blocking vehicle, 'cone', or null if the path out is clear.
export function findBlocker(v, vehicles, obstacles, W, H) {
    const occupied = new Map();
    for (const other of vehicles) {
        if (other === v || other.status !== 'lot') continue;
        for (const c of vehicleCells(other)) occupied.set(c[0] + ',' + c[1], other);
    }
    for (const o of obstacles) occupied.set(o[0] + ',' + o[1], 'cone');
    const [dx, dy] = DIRS[v.dir];
    const cells = vehicleCells(v);
    const head = dx > 0 || dy > 0 ? cells[cells.length - 1] : cells[0];
    let x = head[0] + dx;
    let y = head[1] + dy;
    while (x >= 0 && y >= 0 && x < W && y < H) {
        const blocker = occupied.get(x + ',' + y);
        if (blocker) return blocker;
        x += dx;
        y += dy;
    }
    return null;
}

function removalOrder(vehicles, obstacles, W, H, rand) {
    const remaining = vehicles.map(v => ({ ...v, status: 'lot', ref: v }));
    const order = [];
    while (order.length < remaining.length) {
        const free = remaining.filter(v => v.status === 'lot' && !findBlocker(v, remaining, obstacles, W, H));
        if (!free.length) return null;
        const pick = rand ? free[Math.floor(rand() * free.length)] : free[0];
        pick.status = 'gone';
        order.push(pick.ref);
    }
    return order;
}

// ---------- Difficulty rules ----------
// 0..1 curve: smooth long-term growth, a small ramp inside each 5-level district,
// a spike every 10th level and on milestone levels, and a breather on district starts.
export function difficulty(n) {
    const base = 1 - Math.exp(-(n - 1) / 140);
    const ramp = (((n - 1) % 5) / 4) * 0.06;
    const spike = (n % 10 === 0 ? 0.07 : 0) + (isMilestone(n) ? 0.08 : 0);
    const breather = n % 5 === 1 && n > 5 ? 0.04 : 0;
    return Math.max(0, Math.min(1, base * 0.86 + ramp + spike - breather));
}

// Lot shapes rotate every district (5 levels), so consecutive districts never share a shape.
const SHAPES = ['rect', 'corners', 'pillars', 'center', 'notch', 'cross', 'zigzag'];
export function lotShape(n) {
    if (n < 15) return 'rect';
    return SHAPES[Math.floor((n - 1) / LEVELS_PER_DISTRICT) % SHAPES.length];
}

function shapeCells(shape, W, H) {
    const cx = Math.floor(W / 2);
    const cy = Math.floor(H / 2);
    const map = {
        rect: [],
        corners: [[0, 0], [W - 1, 0], [0, H - 1], [W - 1, H - 1]],
        pillars: [[1, 2], [W - 2, 2], [1, H - 3], [W - 2, H - 3]],
        center: [[cx, cy - 1], [cx, cy]],
        notch: [[W - 1, H - 1], [W - 2, H - 1], [W - 1, H - 2], [0, 0]],
        cross: [[cx, 1], [cx, H - 2], [0, cy], [W - 1, cy]],
        zigzag: [[1, 1], [W - 2, cy], [1, H - 2]],
    };
    const seen = new Set();
    return (map[shape] || []).filter(([x, y]) => {
        const k = x + ',' + y;
        if (seen.has(k) || x < 0 || y < 0 || x >= W || y >= H) return false;
        seen.add(k);
        return true;
    });
}

export function makeLevel(n) {
    const rand = seededRandom(n * 7919 + 13);
    const d = difficulty(n);
    const W = 5 + Math.min(2, Math.floor((n - 1) / 4));
    const H = 6 + Math.min(4, Math.floor((n - 1) / 2));
    let colorCount = Math.min(2 + Math.floor((n + 1) / 3), COLORS.length);
    if (n > 40) colorCount = 6 + Math.floor(rand() * 3); // late-game variety: 6–8 colors

    // Planters from the lot shape + random cones
    const obstacles = shapeCells(lotShape(n), W, H).map(c => [c[0], c[1], 'p']);
    const coneCount = n >= 4 ? Math.min(5, 1 + Math.floor(rand() * (1.5 + d * 3.5))) : 0;
    let guard = 0;
    while (obstacles.filter(o => o[2] !== 'p').length < coneCount && guard++ < 100) {
        const c = [Math.floor(rand() * W), Math.floor(rand() * H)];
        if (!obstacles.some(o => o[0] === c[0] && o[1] === c[1])) obstacles.push(c);
    }

    const freeCells = W * H - obstacles.length;
    const target = Math.min(7 + Math.floor(n * 1.1), Math.floor(freeCells / 2.3));
    const busChance = n >= 3 ? Math.min(0.35, 0.1 + n * 0.012) * (0.75 + rand() * 0.5) : 0;
    const freeLimit = 0.3 - 0.12 * d;

    function placeVehicles() {
        const vehicles = [];
        let tries = 0;
        while (vehicles.length < target && tries < 500) {
            tries++;
            const bus = rand() < busChance;
            const len = bus ? 3 : 2;
            const dir = Math.floor(rand() * 4);
            const horizontal = dir % 2 === 1;
            const x = Math.floor(rand() * (W - (horizontal ? len - 1 : 0)));
            const y = Math.floor(rand() * (H - (horizontal ? 0 : len - 1)));
            const candidate = { x, y, dir, len, bus, status: 'lot' };
            const taken = new Set();
            vehicles.forEach(v => vehicleCells(v).forEach(c => taken.add(c[0] + ',' + c[1])));
            obstacles.forEach(o => taken.add(o[0] + ',' + o[1]));
            if (vehicleCells(candidate).some(c => taken.has(c[0] + ',' + c[1]))) continue;
            vehicles.push(candidate);
            if (!removalOrder(vehicles, obstacles, W, H, null)) vehicles.pop();
        }
        return vehicles;
    }

    // Try several layouts: keep the one with the fewest initially-free cars,
    // penalizing monotonous layouts where most cars face the same way.
    let vehicles = [];
    let bestScore = Infinity;
    for (let attempt = 0; attempt < 12; attempt++) {
        const layout = placeVehicles();
        const free = layout.filter(v => !findBlocker(v, layout, obstacles, W, H)).length;
        const dirCounts = [0, 0, 0, 0];
        layout.forEach(v => dirCounts[v.dir]++);
        const monotony = Math.max(...dirCounts) / Math.max(1, layout.length);
        const score = free / Math.max(1, layout.length) - layout.length * 0.01 + (monotony > 0.5 ? 0.3 : 0);
        if (score < bestScore) {
            bestScore = score;
            vehicles = layout;
        }
        if (layout.length >= target - 1 && monotony <= 0.5 && free <= Math.max(2, Math.ceil(layout.length * freeLimit))) break;
    }

    const colorPool = vehicles.map((_, i) => i % colorCount);
    for (let i = colorPool.length - 1; i > 0; i--) {
        const j = Math.floor(rand() * (i + 1));
        [colorPool[i], colorPool[j]] = [colorPool[j], colorPool[i]];
    }
    const mysteryChance = n >= 5 ? 0.15 + 0.3 * d : 0;
    vehicles.forEach((v, i) => {
        v.id = i;
        v.color = colorPool[i];
        v.cap = v.bus ? 6 : 3;
        v.mystery = !v.bus && rand() < mysteryChance;
    });

    const order = removalOrder(vehicles, obstacles, W, H, rand);
    const chunks = order.map(v => new Array(v.cap).fill(v.color));
    const mixChance = Math.min(0.45 + 0.15 * d, n * 0.03);
    const passengers = [];
    for (let i = 0; i < chunks.length; i++) {
        if (i + 1 < chunks.length && rand() < mixChance) {
            const a = chunks[i];
            const b = chunks[i + 1];
            const longest = Math.max(a.length, b.length);
            for (let k = 0; k < longest; k++) {
                if (k < a.length) passengers.push(a[k]);
                if (k < b.length) passengers.push(b[k]);
            }
            i++;
        } else {
            passengers.push(...chunks[i]);
        }
    }

    const tight = (n % 10 === 0 && n >= 40) || (d > 0.75 && n % 5 === 4);
    const time = Math.max(35, Math.min(80, Math.round((18 + passengers.length * 0.8 + vehicles.length * 1.2) * (1 - 0.12 * d))));
    const level = {
        n, W, H, obstacles,
        vehicles: vehicles.map(({ status, ...rest }) => rest),
        passengers,
        slots: n <= 2 ? 5 : tight ? 3 : 4,
        time,
        colorCount,
        difficulty: d,
        shape: lotShape(n),
    };
    // Verify with the solver at the real slot limit; relax slots until solvable.
    while (!simulateSolve(level, level.slots) && level.slots < 6) level.slots++;
    level.signature = vehicles.map(v => `${v.x}${v.y}${v.dir}${v.len}`).join('|');
    return level;
}

// ---------- Solver ----------
// Plays the level the way a careful player would, respecting the waiting-slot limit.
export function simulateSolve(L, slots = L.slots) {
    const vs = L.vehicles.map(v => ({ ...v, status: 'lot', filled: 0 }));
    const q = [...L.passengers];
    const parked = [];
    let guard = 0;
    const blockerChainFree = target => {
        let cur = target;
        for (let i = 0; i < 40; i++) {
            const b = findBlocker(cur, vs, L.obstacles, L.W, L.H);
            if (!b) return cur;
            if (b === 'cone') return null;
            cur = b;
        }
        return null;
    };
    while (q.length && guard++ < 10000) {
        const c = q[0];
        const t = parked.find(v => v.color === c && v.filled < v.cap);
        if (t) {
            t.filled++;
            q.shift();
            if (t.filled === t.cap) parked.splice(parked.indexOf(t), 1);
            continue;
        }
        if (parked.length >= slots) return false;
        const free = vs.filter(v => v.status === 'lot' && !findBlocker(v, vs, L.obstacles, L.W, L.H));
        if (!free.length) return false;
        let pick = free.find(v => v.color === c);
        if (!pick) {
            for (const v of vs) {
                if (v.status !== 'lot' || v.color !== c) continue;
                const f = blockerChainFree(v);
                if (f) {
                    pick = f;
                    break;
                }
            }
        }
        if (!pick) {
            pick = free.slice().sort((a, b) => {
                const ia = q.indexOf(a.color);
                const ib = q.indexOf(b.color);
                return (ia < 0 ? 1e9 : ia) - (ib < 0 ? 1e9 : ib);
            })[0];
        }
        pick.status = 'out';
        parked.push(pick);
    }
    return q.length === 0 && vs.every(v => v.status !== 'lot');
}

// Self-test: generates levels and checks solvability, consistency and non-repetition.
export function testLevels(from = 1, to = MAX_LEVEL) {
    const failures = [];
    let prevSig = null;
    for (let n = from; n <= to; n++) {
        const L = makeLevel(n);
        const capSum = L.vehicles.reduce((s, v) => s + v.cap, 0);
        const problems = [];
        if (L.vehicles.length < 5) problems.push('too few vehicles');
        if (capSum !== L.passengers.length) problems.push('capacity mismatch');
        if (!simulateSolve(L, L.slots)) problems.push('unsolvable at ' + L.slots + ' slots');
        if (L.signature === prevSig) problems.push('same layout as previous');
        if (L.time < 30 || L.time > 80) problems.push('time out of range');
        if (problems.length) failures.push({ n, problems });
        prevSig = L.signature;
    }
    return failures;
}

// Optional per-level goals (2 per level, deterministic).
export function makeGoals(L) {
    const rand = seededRandom(L.n * 31 + 7);
    const v = L.vehicles.length;
    const tapLimit = v + Math.max(1, Math.floor(v * 0.2));
    const timeGoal = Math.round(L.time * 0.4);
    const bonus = 15 + Math.min(L.n, 200) * 2;
    const pool = [
        { id: 'taps', limit: tapLimit, bonus },
        { id: 'noextra', bonus },
        { id: 'time', limit: timeGoal, bonus },
        { id: 'spare', bonus: bonus + 5 },
        { id: 'noblock', bonus: bonus + 5 },
    ];
    const picked = [];
    while (picked.length < 2) {
        const g = pool[Math.floor(rand() * pool.length)];
        if (!picked.includes(g)) picked.push(g);
    }
    return picked;
}

export function goalMet(g, s, slotCount) {
    if (g.id === 'taps') return s.taps <= g.limit;
    if (g.id === 'noextra') return s.extra === 0;
    if (g.id === 'time') return s.timeLeft >= g.limit;
    if (g.id === 'spare') return s.peak < slotCount;
    if (g.id === 'noblock') return s.blocked === 0;
    return false;
}

const SAVE_KEY = 'taxiSortCityRush.v1';

export function loadSave() {
    const defaults = { level: 1, coins: 0, skin: 'classic', owned: ['classic'], muted: false, best: {}, goalsDone: {}, specials: {} };
    try {
        return Object.assign(defaults, JSON.parse(localStorage.getItem(SAVE_KEY) || '{}'));
    } catch (e) {
        return defaults;
    }
}

export function saveGame(data) {
    try {
        localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    } catch (e) {
        // storage unavailable; ignore
    }
}
