// The tower: shared ring helpers, random level generator, tower meshes and ledge mechanics, sky/lava/ruins world.
import { CONFIG } from './config.js';
import { Vec3, angleDiff, makeRng, wrapAngle, Node, Mesh, InstancedMesh, BasicMaterial, GeoBuilder, box, cylinder, merge, extrude, plane, lathe, sphere, torus, clamp, TAU, Points, Material, ShaderMaterial, LitMaterial, deform, recomputeNormals } from './engine.js';
import { makeFlameMaterial, makeBillboardMaterial } from './graphics.js';

// ======================================================================
// COMMON
// ======================================================================
// Shared helpers for positioning things around the cylindrical tower.

export const R = CONFIG.TOWER_RADIUS;
export const RP = CONFIG.PATH_RADIUS;            // the tower's walking radius (level generator)
// Radius of the walking path for the current stage. The tower uses CONFIG.PATH_RADIUS,
// the guardian's hall a wider ring. Always read PATH.r at use time.
export const PATH = { r: CONFIG.PATH_RADIUS };
export function setPathRadius(r) { PATH.r = r; }
export const DEPTH = CONFIG.LEDGE_DEPTH;

export function polar(theta, r, y, out = new Vec3()) {
    return out.set(Math.sin(theta) * r, y, Math.cos(theta) * r);
}

// Place a node on the tower facing outward (local +Z = outward normal)
export function placeOutward(node, theta, r, y) {
    node.position.set(Math.sin(theta) * r, y, Math.cos(theta) * r);
    node.rotation.y = theta;
}

// arc distance between two angles measured on the walking path
export function arcDist(a, b) { return angleDiff(a, b) * PATH.r; }

// does an entity (theta, halfW in arc units) overlap a platform's angular range?
export function overPlatform(theta, halfArc, p) {
    return Math.abs(angleDiff(theta, p.theta)) <= p.half + halfArc / PATH.r;
}

export function rgb(hex) {
    return [((hex >> 16) & 255) / 255, ((hex >> 8) & 255) / 255, (hex & 255) / 255];
}

// ======================================================================
// LEVELGEN
// ======================================================================
// Procedural level layout: a Nebulus-style spiral of ledges around a castle tower.

const toAng = (arc) => arc / RP;

// Largest safe edge-to-edge gap (arc units) for a jump that must climb dy
function maxReach(dy) {
    const v = CONFIG.JUMP_VELOCITY, gu = CONFIG.GRAVITY, gd = CONFIG.FALL_GRAVITY;
    const peak = v * v / (2 * gu);
    if (dy >= peak) return 0;
    const t = v / gu + Math.sqrt(2 * (peak - dy) / gd);
    return (CONFIG.PLAYER_SPEED * t - 0.3 + 2 * CONFIG.PLAYER_HALF_W) * 0.82;
}

// Difficulty for a tower number: slides every value from EASY to HARD (see config.js)
export function levelParams(level) {
    const D = CONFIG.DIFFICULTY;
    const L = Math.max(1, Math.floor(level));
    const t = Math.min(1, (L - 1) / D.RAMP_LEVELS);
    const over = Math.max(0, L - 1 - D.RAMP_LEVELS);
    const P = { level: L, t };
    for (const k in D.EASY) P[k] = D.EASY[k] + (D.HARD[k] - D.EASY[k]) * t;
    P.height = Math.round(Math.min(CONFIG.TOWER_MAX_HEIGHT, P.height + over * 4));
    P.bats = Math.round(P.bats + over * 0.5);
    P.lavaSpeed += over * 0.03;
    if (L < D.CRUMBLE_FROM) P.crumbleChance = 0;
    if (L < D.LIFT_FROM) P.liftChance = 0;
    if (L < D.SPIDER_FROM) P.spiderChance = 0;
    P.dragonFire = L >= D.DRAGON_FIRE_FROM;
    P.dragons = Math.min(3, 1 + Math.floor((L - 1) / 3));
    P.tunnels = 1 + (L >= 2 ? 1 : 0) + (L >= 5 ? 1 : 0);
    P.hearts = L <= 2 ? 2 : 1;
    P.hourglasses = 1 + (L >= 4 ? 1 : 0);
    P.safeLedges = L === 1 ? 7 : 4;
    return P;
}

export function generateLevel(level, seed) {
    const rng = makeRng(seed);
    const LP = levelParams(level);
    const H = LP.height;
    const plats = [];
    let pid = 0;
    const addPlat = (o) => { o.id = pid++; o.arc = o.half * 2 * RP; plats.push(o); return o; };

    addPlat({ theta: 0, half: Math.PI, y: 0, thick: 1, type: 'ground', main: true, index: -1 });

    const conflicts = (theta, half, y, ignore, yTop) => {
        const y1 = yTop !== undefined ? yTop : y;
        for (const p of plats) {
            if (p === ignore || p.type === 'ground') continue;
            const sep = (Math.abs(angleDiff(theta, p.theta)) - half - p.half) * RP;
            if (sep > 0.55) continue;
            const pTop = p.type === 'lift' ? p.y1 : p.y;
            const pBot = p.y;
            // vertical interval overlap with 2.45 clearance
            if (y - 2.45 < pTop && y1 + 2.45 > pBot) return true;
        }
        return false;
    };

    // ---- main path -----------------------------------------------------
    const main = [];
    let prev = { theta: 0, half: toAng(1.0), y: 0 };
    let dir = rng.chance(0.5) ? 1 : -1;
    let y = 0, idx = 0, lastFlip = 0, lastType = 'ground';
    let guard = 0;
    while (H - y > 1.8 && guard++ < 400) {
        const remaining = H - y;
        let pattern = 'normal';
        const r = rng();
        if (idx > 2 && r < LP.liftChance && remaining > 11 && lastType !== 'lift') pattern = 'lift';
        else if (idx > 1 && r < LP.liftChance + 0.2 && remaining > 5) pattern = 'stairs';
        if (idx - lastFlip > 2 && rng.chance(LP.flipChance)) { dir = -dir; lastFlip = idx; }

        if (pattern === 'stairs') {
            const n = rng.int(3, 4);
            for (let s = 0; s < n && H - y > 2.6; s++) {
                const dy = rng.range(0.85, 1.05);
                const arcW = rng.range(1.5, 1.8) + (1 - LP.t) * 0.5;
                const half = toAng(arcW / 2);
                const gap = rng.range(0.15, 0.45);
                const theta = wrapAngle(prev.theta + dir * (prev.half + toAng(gap) + half));
                if (conflicts(theta, half, y + dy, prev)) break;
                const p = addPlat({ theta, half, y: y + dy, thick: 0.55, type: 'stone', main: true, index: idx++ });
                main.push(p); prev = p; y = p.y; lastType = 'stone';
            }
            continue;
        }
        if (pattern === 'lift') {
            const dy = rng.range(0.9, 1.4);
            const travel = rng.range(3.6, 5.2);
            const arcW = 2.1, half = toAng(arcW / 2);
            let placed = null;
            for (let a = 0; a < 6 && !placed; a++) {
                const gap = rng.range(0.5, 1.6) + a * 0.25;
                const theta = wrapAngle(prev.theta + dir * (prev.half + toAng(gap) + half));
                if (!conflicts(theta, half, y + dy, prev, y + dy + travel)) {
                    placed = addPlat({
                        theta, half, y: y + dy, y0: y + dy, y1: y + dy + travel, thick: 0.35, type: 'lift', main: true, index: idx++,
                        period: travel * 1.25 + 2.2, phase: rng() * 10
                    });
                }
                if (a === 2) dir = -dir;
            }
            if (placed) {
                main.push(placed); prev = placed; y = placed.y1; lastType = 'lift';
                continue;
            }
        }
        // normal ledge
        let dy = rng.range(LP.dyMin, LP.dyMax);
        if (lastType === 'lift') dy = rng.range(0.55, 1.0);
        if (H - (y + dy) < 1.4) { dy = H - 1.6 - y; if (dy < 0.3) break; }
        let placed = null;
        const reach = maxReach(dy);
        for (let a = 0; a < 8 && !placed; a++) {
            const maxGap = Math.min(dy > 1.55 ? Math.min(1.5, LP.gapMax) : LP.gapMax, reach);
            const gap = Math.min(reach, rng.range(0.25, Math.max(0.3, maxGap)) + a * 0.2);
            const arcW = rng.range(LP.widthMin, LP.widthMax);
            const half = toAng(arcW / 2);
            const theta = wrapAngle(prev.theta + dir * (prev.half + toAng(gap) + half));
            if (!conflicts(theta, half, y + dy, prev) || a === 7) {
                let type = 'stone';
                if (idx > 3 && lastType === 'stone' && rng.chance(LP.crumbleChance)) type = 'crumble';
                placed = addPlat({ theta, half, y: y + dy, thick: 0.6, type, main: true, index: idx++, delay: LP.crumbleDelay });
            }
            if (a === 3) dir = -dir;
        }
        main.push(placed); prev = placed; y = placed.y; lastType = placed.type;
    }

    // ---- top ring with a notch above the last ledge -----------------------
    const last = main[main.length - 1];
    const notch = last.half + toAng(0.5);
    const top = addPlat({ theta: wrapAngle(last.theta + Math.PI), half: Math.PI - notch, y: H, thick: 1.0, type: 'top', main: true, index: idx++ });
    const exitTheta = wrapAngle(last.theta + dir * (notch + toAng(2.3)));

    // ---- filler ledges (alternate routes, loot, enemies) ------------------
    const fillers = [];
    const nFill = Math.floor(H / 3.1);
    for (let t = 0; t < nFill * 6 && fillers.length < nFill; t++) {
        const fy = rng.range(2.6, H - 3.2);
        const theta = rng.range(-Math.PI, Math.PI);
        const arcW = rng.range(1.9, 3.3);
        const half = toAng(arcW / 2);
        if (conflicts(theta, half, fy, null)) continue;
        let reach = false;
        for (const p of plats) {
            if (p.type === 'ground' || p.type === 'top') continue;
            const sep = (Math.abs(angleDiff(theta, p.theta)) - half - p.half) * RP;
            if (Math.abs(p.y - fy) <= 1.8 && sep < 2.4 && sep > -0.1) { reach = true; break; }
        }
        if (!reach) continue;
        const type = rng.chance(LP.crumbleChance * 0.8) ? 'crumble' : 'stone';
        fillers.push(addPlat({ theta, half, y: fy, thick: 0.6, type, main: false, index: -1, delay: LP.crumbleDelay }));
    }

    // ---- Nebulus tunnels: doors leading to a ledge on the far side ---------
    const tunnels = [];
    const wantTunnels = LP.tunnels;
    const first = level === 1;   // the first tower is staged: an early secret passage, a chest and a dragon attack
    const candidates = plats.filter(p => p.type === 'stone' && p.y > 4 && p.y < H - 5 && p.arc >= 2.2);
    if (first) candidates.sort((a, b) => (a.main ? 0 : 3) + a.y - ((b.main ? 0 : 3) + b.y));
    for (let t = 0; t < 30 && tunnels.length < wantTunnels && candidates.length; t++) {
        const p = first ? candidates[t] : rng.pick(candidates);
        if (!p) break;
        if (p.door) continue;
        const theta = wrapAngle(p.theta + Math.PI);
        const half = toAng(1.5);
        if (conflicts(theta, half, p.y, null)) continue;
        const bonus = addPlat({ theta, half, y: p.y, thick: 0.6, type: 'stone', main: false, index: -1, bonus: true });
        const a = { platform: p, theta: p.theta, y: p.y };
        const b = { platform: bonus, theta: bonus.theta, y: bonus.y };
        a.other = b; b.other = a;
        p.door = a; bonus.door = b;
        tunnels.push(a, b);
    }

    // ---- items -------------------------------------------------------------
    const items = [];
    const mainLedges = main.filter(p => p.type !== 'lift');
    const keyCandidates = mainLedges.filter(p => p.type === 'stone' && p.y > H * 0.28 && p.y < H * 0.62);
    const keyPlat = keyCandidates.length ? rng.pick(keyCandidates) : mainLedges[Math.floor(mainLedges.length / 2)];
    items.push({ type: 'key', theta: keyPlat.theta, y: keyPlat.y + 0.85, platform: keyPlat });
    keyPlat.hasKey = true;

    const coinRow = (p, prob) => {
        if (!rng.chance(prob)) return;
        const n = Math.max(1, Math.floor(p.arc / 0.95));
        for (let i = 0; i < n; i++) {
            const t = (i + 0.5) / n - 0.5;
            items.push({ type: 'coin', theta: p.theta + t * (p.half * 2) * 0.8, y: p.y + 0.62 });
        }
    };
    for (const p of plats) {
        if (p.type === 'ground') continue;
        if (p === keyPlat) continue;
        if (p.bonus) {
            items.push({ type: 'chest', theta: p.theta + p.half * 0.45 * (rng.chance(0.5) ? 1 : -1), y: p.y, platform: p });
            coinRow(p, 1);
            continue;
        }
        if (p.type === 'top') continue;
        if (p.type === 'lift') { if (rng.chance(0.5)) items.push({ type: 'coin', theta: p.theta, y: p.y1 + 1.8 }); continue; }
        coinRow(p, p.main ? 0.55 : 0.7);
        if (!p.main && rng.chance(0.2) && p.type === 'stone') items.push({ type: 'chest', theta: p.theta, y: p.y, platform: p });
    }
    // coin arcs over some jumps on the main path
    for (let i = 1; i < main.length; i++) {
        const a = main[i - 1], b = main[i];
        if (a.type === 'lift' || b.type === 'lift' || !rng.chance(0.18)) continue;
        const da = angleDiff(b.theta, a.theta);
        for (let k = 1; k <= 3; k++) {
            const t = k / 4;
            items.push({ type: 'coin', theta: a.theta + da * (0.3 + 0.4 * t), y: a.y + (b.y - a.y) * t + 1.6 + Math.sin(t * Math.PI) * 0.6 });
        }
    }
    // tower 1: a chest in plain sight a few ledges up
    if (first) {
        const cp = mainLedges.find(p => p.index >= 2 && p.index <= 5 && p.type === 'stone' && p.arc >= 2.4 && !p.door && p !== keyPlat);
        if (cp) items.push({ type: 'chest', theta: cp.theta, y: cp.y, platform: cp });
    }
    // hourglasses + hearts
    const later = mainLedges.filter(p => p.index > 6 && p.type === 'stone' && p !== keyPlat);
    const nHg = LP.hourglasses;
    for (let i = 0; i < nHg && later.length; i++) {
        const p = rng.pick(later);
        items.push({ type: 'hourglass', theta: p.theta + p.half * 0.5, y: p.y + 0.8 });
    }
    for (let hIdx = 0; hIdx < LP.hearts; hIdx++) {
        const lo = hIdx === 0 ? 0.4 : 0.15, hi = hIdx === 0 ? 0.85 : 0.45;
        const heartPlats = plats.filter(p => p.type === 'stone' && p.y > H * lo && p.y < H * hi && p !== keyPlat);
        if (!heartPlats.length) continue;
        const p = rng.pick(heartPlats);
        items.push({ type: 'heart', theta: p.theta - p.half * 0.4, y: p.y + 0.8 });
    }

    // ---- enemies -------------------------------------------------------------
    const enemies = [];
    const ledgeEnemyChance = LP.ledgeEnemy;
    for (const p of plats) {
        if (p.type !== 'stone' || p.door || p === keyPlat) continue;
        if (p.main && p.index < LP.safeLedges) continue;
        if (p.y < 5) continue;
        if (!rng.chance(ledgeEnemyChance)) continue;
        if (p.arc >= 2.7 && rng.chance(LP.level === 1 ? 0.45 : 0.6)) enemies.push({ type: 'skeleton', platform: p });
        else if (p.arc >= 2.2) enemies.push({ type: 'rat', platform: p });
    }
    // spiders hang above some ledges with open space above
    for (const p of plats) {
        if (p.type !== 'stone' || p.y < 6 || !rng.chance(LP.spiderChance)) continue;
        if (enemies.some(e => e.platform === p)) continue;
        let clear = true;
        for (const q of plats) {
            if (q === p || q.type === 'ground') continue;
            const sep = (Math.abs(angleDiff(p.theta, q.theta)) - p.half - q.half) * RP;
            if (sep < 0.4 && q.y > p.y && q.y < p.y + 5.5) { clear = false; break; }
        }
        if (clear) enemies.push({ type: 'spider', platform: p, theta: p.theta + rng.range(-0.4, 0.4) * p.half });
    }
    const nBats = LP.bats;
    for (let i = 0; i < nBats; i++) {
        enemies.push({ type: 'bat', theta: rng.range(-Math.PI, Math.PI), y: rng.range(Math.min(10, H * 0.3), H - 4), amp: rng.range(2.5, 4 + LP.t * 1.5), speed: rng.range(0.7, 1.2), phase: rng() * 6 });
    }
    // tower 1: one slow fire-breather low on the tower, so the first dragon attack comes early
    if (first) enemies.push({ type: 'dragon', theta: rng.range(-Math.PI, Math.PI), y: 7.5, dir: rng.chance(0.5) ? 1 : -1, phase: rng() * 6, fire: true, fireEvery: 6.5, fireSpeed: 5.0 });
    const nDragons = LP.dragons;
    for (let i = 0; i < nDragons; i++) {
        enemies.push({ type: 'dragon', theta: rng.range(-Math.PI, Math.PI), y: H * (0.3 + 0.55 * (i + 0.5) / nDragons), dir: rng.chance(0.5) ? 1 : -1, phase: rng() * 6, fire: LP.dragonFire, fireEvery: LP.fireEvery, fireSpeed: LP.fireSpeed });
    }

    // ---- decor: torches, windows, banners -----------------------------------
    const blocked = (theta, halfAng, y0, y1) => {
        for (const p of plats) {
            if (p.type === 'ground') { if (y0 < 0.3) return true; continue; }
            const sep = (Math.abs(angleDiff(theta, p.theta)) - halfAng - p.half) * RP;
            if (sep > 0.15) continue;
            const pb = p.y - p.thick - 1.0, pt = p.type === 'lift' ? p.y1 + 0.4 : p.y + 0.25;
            if (y1 > pb && y0 < pt) return true;
        }
        for (const d of tunnels) {
            if (Math.abs(angleDiff(theta, d.theta)) * RP < 1.3 + halfAng * RP && y1 > d.y - 0.2 && y0 < d.y + 2.3) return true;
        }
        if (Math.abs(angleDiff(theta, exitTheta)) * RP < 1.8 && y1 > H - 0.5) return true;
        return false;
    };
    const torches = [];
    for (const p of plats) {
        if (p.type === 'ground' || p.type === 'lift') continue;
        if (!rng.chance(p.type === 'top' ? 0 : 0.42)) continue;
        const theta = p.theta + rng.range(-0.6, 0.6) * p.half;
        const ty = p.y + 1.85;
        if (torches.some(t => Math.abs(angleDiff(t.theta, theta)) * RP < 2.2 && Math.abs(t.y - ty) < 2)) continue;
        if (blocked(theta, toAng(0.2), ty - 0.35, ty + 0.5)) continue;
        torches.push({ theta, y: ty });
    }
    // torches beside the tunnel doors and the exit
    for (const d of tunnels) torches.push({ theta: d.theta + toAng(1.0), y: d.y + 1.7 }, { theta: d.theta - toAng(1.0), y: d.y + 1.7 });
    torches.push({ theta: exitTheta + toAng(1.45), y: H + 2.0 }, { theta: exitTheta - toAng(1.45), y: H + 2.0 });
    // ground torches
    for (let i = 0; i < 4; i++) torches.push({ theta: i * Math.PI / 2 + 0.4, y: 1.9 });

    const windows = [];
    for (let t = 0; t < H * 1.4; t++) {
        const theta = rng.range(-Math.PI, Math.PI);
        const wy = rng.range(2.5, H - 1.5);
        const kind = rng.chance(0.35) ? 'arch' : 'slit';
        const hw = toAng(kind === 'arch' ? 0.55 : 0.2), hh = kind === 'arch' ? 1.4 : 1.0;
        if (blocked(theta, hw, wy - 0.1, wy + hh + 0.2)) continue;
        if (windows.some(w => Math.abs(angleDiff(w.theta, theta)) * RP < 1.6 && Math.abs(w.y - wy) < 2.2)) continue;
        if (torches.some(w => Math.abs(angleDiff(w.theta, theta)) * RP < 0.9 && Math.abs(w.y - wy) < 1.6)) continue;
        windows.push({ theta, y: wy, kind, lit: rng.chance(0.5) });
    }
    const banners = [];
    for (let t = 0; t < H * 0.6; t++) {
        const theta = rng.range(-Math.PI, Math.PI);
        const top = rng.range(4, H - 0.5);
        const len = 2.0;
        if (blocked(theta, toAng(0.5), top - len - 0.2, top + 0.2)) continue;
        if (banners.some(b => Math.abs(angleDiff(b.theta, theta)) * RP < 3 && Math.abs(b.y - top) < 4)) continue;
        if (windows.some(w => Math.abs(angleDiff(w.theta, theta)) * RP < 1.1 && w.y < top + 0.2 && w.y + 1.5 > top - len)) continue;
        banners.push({ theta, y: top, len });
    }
    // props on ledges (skulls, candles, bones)
    const props = [];
    for (const p of plats) {
        if (p.type !== 'stone' || !rng.chance(0.35)) continue;
        const kind = rng.pick(['skull', 'candles', 'bones', 'candles', 'skull']);
        props.push({ kind, theta: p.theta + rng.range(-0.8, 0.8) * p.half, y: p.y, r: rng.range(3.75, 4.0), rot: rng.range(-1, 1) });
    }

    return {
        level, seed, params: LP, height: H, platforms: plats, main, top, exitTheta,
        items, enemies, torches, windows, banners, props, tunnels, startTheta: 0
    };
}

// ======================================================================
// TOWER
// ======================================================================
// Builds the tower meshes from a level description and runs ledge mechanics
// (lifts, crumbling ledges, doors, exit gate).

const V = (x = 0, y = 0, z = 0) => new Vec3(x, y, z);

// Annular sector ledge centered on theta=0 (local +Z), top at y=0
export function ledgeGeometry(half, thick, depth, opts = {}) {
    const b = new GeoBuilder();
    const Ri = opts.inner !== undefined ? opts.inner : R - 0.2;
    const Ro = R + depth;
    const ch = Math.min(0.09, thick * 0.3);
    const tile = opts.tile || 2.0;
    const segs = Math.max(2, Math.ceil((half * 2) / 0.09));
    const col = opts.color;
    const P = (r, th, y) => [Math.sin(th) * r, y, Math.cos(th) * r];
    const top = [], chamTop = [], chamBot = [], frontBot = [], botIn = [], botOut = [];
    for (let s = 0; s <= segs; s++) {
        const th = -half + (2 * half * s) / segs;
        const sn = Math.sin(th), cs = Math.cos(th);
        const uA = (th * PATH.r) / tile;
        // top (inner, outer-ch)
        top.push([
            b.vert(sn * Ri, 0, cs * Ri, 0, 1, 0, th * Ri / tile, Ri / tile, col),
            b.vert(sn * (Ro - ch), 0, cs * (Ro - ch), 0, 1, 0, th * (Ro - ch) / tile, (Ro - ch) / tile, col)
        ]);
        const cn = [sn * 0.7071, 0.7071, cs * 0.7071];
        chamTop.push(b.vert(sn * (Ro - ch), 0, cs * (Ro - ch), cn[0], cn[1], cn[2], uA, 0, col));
        chamBot.push(b.vert(sn * Ro, -ch, cs * Ro, cn[0], cn[1], cn[2], uA, -ch / tile, col));
        frontBot.push([
            b.vert(sn * Ro, -ch, cs * Ro, sn, 0, cs, th * Ro / tile, -ch / tile, col),
            b.vert(sn * Ro, -thick, cs * Ro, sn, 0, cs, th * Ro / tile, -thick / tile, col)
        ]);
        botIn.push(b.vert(sn * Ri, -thick, cs * Ri, 0, -1, 0, th * Ri / tile, Ri / tile, col));
        botOut.push(b.vert(sn * Ro, -thick, cs * Ro, 0, -1, 0, th * Ro / tile, Ro / tile, col));
    }
    for (let s = 0; s < segs; s++) {
        b.quad(top[s][0], top[s][1], top[s + 1][1], top[s + 1][0]);
        b.quad(chamBot[s], chamBot[s + 1], chamTop[s + 1], chamTop[s]);
        b.quad(frontBot[s][1], frontBot[s + 1][1], frontBot[s + 1][0], frontBot[s][0]);
        b.quad(botIn[s], botIn[s + 1], botOut[s + 1], botOut[s]);
    }
    // end caps
    for (const side of [-1, 1]) {
        const th = side * half;
        const pts = [P(Ri, th, 0), P(Ro - ch, th, 0), P(Ro, th, -ch), P(Ro, th, -thick), P(Ri, th, -thick)];
        const t = [Math.cos(th) * side, 0, -Math.sin(th) * side];
        const uv = (p) => [(Math.hypot(p[0], p[2]) - Ri) / tile * side, p[1] / tile];
        const ids = pts.map(p => b.vert(p[0], p[1], p[2], t[0], t[1], t[2], ...uv(p), col));
        if (side < 0) { b.tri(ids[4], ids[3], ids[2]); b.tri(ids[4], ids[2], ids[1]); b.tri(ids[4], ids[1], ids[0]); }
        else { b.tri(ids[4], ids[0], ids[1]); b.tri(ids[4], ids[1], ids[2]); b.tri(ids[4], ids[2], ids[3]); }
    }
    return b.build();
}

// Corbel (bracket stone) under a ledge, in world coords
function corbelParts(theta, yBottom, depth) {
    const tri = extrude([[0, 0], [depth * 0.7, 0], [0, -0.95]], 0.34, 0.03);
    return { geo: tri, pos: polar(theta, R - 0.05, yBottom), rot: V(0, theta - Math.PI / 2, 0) };
}

function archOutline(w, h, segs = 10) {
    const pts = [];
    const r = w / 2, spring = h - r;
    pts.push([r, 0]);
    for (let i = 0; i <= segs; i++) {
        const a = (i / segs) * Math.PI;
        pts.push([Math.cos(a) * r, spring + Math.sin(a) * r]);
    }
    pts.push([-r, 0]);
    return pts;
}

// Flat arch-shaped polygon (triangle fan from bottom center), facing +Z
function archPanel(w, h, segs = 10) {
    const b = new GeoBuilder();
    const out = archOutline(w, h, segs);
    const c = b.vert(0, h * 0.4, 0, 0, 0, 1, 0.5, 0.4);
    const ids = out.map(p => b.vert(p[0], p[1], 0, 0, 0, 1, p[0] / w + 0.5, p[1] / h));
    for (let i = 0; i < ids.length - 1; i++) b.tri(c, ids[i], ids[i + 1]);
    b.tri(c, ids[ids.length - 1], ids[0]);
    return b.build();
}

// Stones around an arch (voussoirs + jambs), local coords facing +Z
function archFrameParts(w, h, depth, stone = 0.22) {
    const parts = [];
    const r = w / 2 + stone / 2, spring = h - w / 2;
    const n = 9;
    for (let i = 0; i < n; i++) {
        const a0 = (i / n) * Math.PI, a1 = ((i + 1) / n) * Math.PI, am = (a0 + a1) / 2;
        const len = r * (a1 - a0) * 1.02;
        const big = i === Math.floor(n / 2) ? 1.35 : 1;
        parts.push({ geo: box(len, stone * big, depth), pos: V(Math.cos(am) * r, spring + Math.sin(am) * r, 0), rot: V(0, 0, am + Math.PI / 2) });
    }
    // jambs
    const jh = spring;
    const blocks = Math.max(2, Math.round(jh / 0.4));
    for (let s of [-1, 1]) for (let i = 0; i < blocks; i++) {
        const bh = jh / blocks;
        const wide = i % 2 === 0 ? 1.0 : 0.8;
        parts.push({ geo: box(stone * wide + 0.04, bh * 0.94, depth), pos: V(s * (w / 2 + stone * wide / 2), bh * (i + 0.5), 0) });
    }
    return parts;
}

function torchBracketParts(theta, y) {
    const parts = [];
    const put = (geo, r, dy, rot = V()) => {
        const p = polar(theta, r, y + dy);
        parts.push({ geo, pos: p, rot: V(rot.x, theta + rot.y, rot.z) });
    };
    put(box(0.16, 0.3, 0.05), R + 0.02, -0.18);
    put(box(0.05, 0.05, 0.34), R + 0.18, -0.22, V(-0.5, 0, 0));
    put(cylinder(0.09, 0.05, 0.14, 8, 1), R + 0.33, -0.05);
    put(cylinder(0.035, 0.03, 0.34, 6, 1), R + 0.33, -0.2);
    put(torus(0.09, 0.015, 4, 12), R + 0.33, 0.02, V(Math.PI / 2, 0, 0));
    return parts;
}

export class Tower {
    constructor(desc, M, T) {
        this.desc = desc;
        this.M = M;
        this.root = new Node();
        this.H = desc.height;
        this.platforms = desc.platforms.map(p => Object.assign({}, p, {
            active: true, dy: 0, shake: 0, state: 'idle', timer: 0, respawn: 0, mesh: null
        }));
        // relink door objects to runtime platforms
        const byId = new Map(this.platforms.map(p => [p.id, p]));
        this.doors = [];
        for (const d of desc.tunnels) {
            const nd = { theta: d.theta, y: d.y, platform: byId.get(d.platform.id), other: null, src: d };
            this.doors.push(nd);
        }
        for (const d of this.doors) d.other = this.doors.find(o => o.src === d.src.other);
        for (const p of this.platforms) if (p.door) p.door = this.doors.find(d => d.platform === p) || null;
        this.torches = desc.torches.map(t => ({ theta: t.theta, y: t.y, pos: polar(t.theta, R + 0.33, t.y + 0.22), phase: Math.random() * 10 }));
        this.exit = { theta: desc.exitTheta, y: this.H, open: 0, unlocked: false };
        this._build(T);
    }

    _build(T) {
        const M = this.M, H = this.H, desc = this.desc;
        const rng = makeRng(desc.seed + 99);
        // tower shaft
        const shaftH = H + 34;
        const circ = TAU * R;
        const shaft = new Mesh(cylinder(R, R, shaftH, 72, 1, { openEnded: true, uRepeat: 6, vRepeat: shaftH / (circ / 6) }), M.wall);
        shaft.position.y = -30 + shaftH / 2;
        this.root.add(shaft);

        // ground base: wide round plinth sinking into the lava
        const baseParts = [];
        const Rb = R + 3.1;
        const gb = new GeoBuilder();
        const segs = 72;
        for (let i = 0; i <= segs; i++) {
            const th = (i / segs) * TAU, s = Math.sin(th), c = Math.cos(th);
            gb.vert(s * (R - 0.1), 0, c * (R - 0.1), 0, 1, 0, s * (R - 0.1) / 2.2, c * (R - 0.1) / 2.2);
            gb.vert(s * (Rb - 0.12), 0, c * (Rb - 0.12), 0, 1, 0, s * (Rb - 0.12) / 2.2, c * (Rb - 0.12) / 2.2);
        }
        for (let i = 0; i < segs; i++) gb.quad(i * 2, i * 2 + 1, i * 2 + 3, i * 2 + 2);
        baseParts.push({ geo: gb.build() });
        baseParts.push({ geo: cylinder(Rb, Rb + 0.8, 30, 72, 1, { openEnded: true, uRepeat: 12, vRepeat: 12 }), pos: V(0, -15.12, 0) });
        baseParts.push({ geo: cylinder(Rb - 0.12, Rb, 0.12, 72, 1, { openEnded: true, uRepeat: 12, vRepeat: 0.1 }), pos: V(0, -0.06, 0) });
        // buttresses around the base
        for (let i = 0; i < 8; i++) {
            const th = (i / 8) * TAU + 0.2;
            baseParts.push({ geo: extrude([[0, 0], [1.0, 0], [0.2, 5]], 0.7, 0.05), pos: polar(th, Rb - 0.3, -5), rot: V(0, th - Math.PI / 2, 0) });
        }
        this.root.add(new Mesh(merge(baseParts), M.ground));

        // static stone ledges + corbels merged
        const ledgeParts = [], crumbleList = [];
        for (const p of this.platforms) {
            if (p.type === 'ground' || p.type === 'lift') continue;
            if (p.type === 'crumble') { crumbleList.push(p); continue; }
            const depth = p.type === 'top' ? DEPTH + 0.3 : DEPTH;
            const geo = ledgeGeometry(p.half, p.thick, depth);
            ledgeParts.push({ geo, pos: V(0, p.y, 0), rot: V(0, p.theta, 0) });
            if (p.type !== 'top') {
                const arcW = p.half * 2 * R;
                const n = Math.max(1, Math.round(arcW / 1.3));
                for (let i = 0; i < n; i++) {
                    const th = p.theta + (((i + 0.5) / n) - 0.5) * p.half * 1.6;
                    ledgeParts.push(corbelParts(th, p.y - p.thick, depth));
                }
            } else {
                const n = Math.floor(p.half * 2 * R / 1.1);
                for (let i = 0; i < n; i++) {
                    const th = p.theta - p.half + ((i + 0.5) / n) * p.half * 2;
                    ledgeParts.push(corbelParts(th, p.y - p.thick, depth + 0.2));
                }
            }
        }
        this.root.add(new Mesh(merge(ledgeParts), M.ledge));

        // soft shadows: on the wall under every ledge, and in the corner where ledge meets wall
        const db = new GeoBuilder();
        const decal = (th0, th1, r, yTop, yBot) => {
            const n = Math.max(2, Math.ceil((th1 - th0) / 0.08));
            const base = db.vcount;
            for (let i = 0; i <= n; i++) {
                const th = th0 + (th1 - th0) * i / n, sn = Math.sin(th), cs = Math.cos(th);
                db.vert(sn * r, yTop, cs * r, sn, 0, cs, i / n, 0);
                db.vert(sn * r, yBot, cs * r, sn, 0, cs, i / n, 1);
            }
            for (let i = 0; i < n; i++) db.quad(base + i * 2 + 1, base + i * 2 + 3, base + i * 2 + 2, base + i * 2);
        };
        const corner = (th0, th1, y) => {
            const n = Math.max(2, Math.ceil((th1 - th0) / 0.08));
            const base = db.vcount;
            for (let i = 0; i <= n; i++) {
                const th = th0 + (th1 - th0) * i / n, sn = Math.sin(th), cs = Math.cos(th);
                db.vert(sn * (R + 0.01), y, cs * (R + 0.01), 0, 1, 0, i / n, 0);
                db.vert(sn * (R + 0.55), y, cs * (R + 0.55), 0, 1, 0, i / n, 1);
            }
            for (let i = 0; i < n; i++) db.quad(base + i * 2, base + i * 2 + 1, base + i * 2 + 3, base + i * 2 + 2);
        };
        for (const p of this.platforms) {
            if (p.type === 'ground' || p.type === 'lift' || p.type === 'crumble') continue;
            const m = 0.25 / R;
            const yb = p.y - p.thick;
            decal(p.theta - p.half - m, p.theta + p.half + m, R + 0.02, yb + 0.02, yb - (p.type === 'top' ? 2.2 : 1.5));
            corner(p.theta - p.half, p.theta + p.half, p.y + 0.006);
        }
        {
            const n = 96, base = db.vcount;
            for (let i = 0; i <= n; i++) {
                const th = (i / n) * TAU, sn = Math.sin(th), cs = Math.cos(th);
                db.vert(sn * (R + 0.01), 0.006, cs * (R + 0.01), 0, 1, 0, 0.5, 0);
                db.vert(sn * (R + 0.8), 0.006, cs * (R + 0.8), 0, 1, 0, 0.5, 1);
            }
            for (let i = 0; i < n; i++) db.quad(base + i * 2, base + i * 2 + 1, base + i * 2 + 3, base + i * 2 + 2);
        }
        const decals = new Mesh(db.build(), M.decal);
        decals.frustumCulled = false;
        this.root.add(decals);

        // crumbling ledges (separate so they can fall)
        for (const p of crumbleList) {
            const geo = merge([{ geo: ledgeGeometry(p.half, p.thick, DEPTH) }, corbelParts(0, -p.thick, DEPTH)]);
            const mesh = new Mesh(geo, M.crumble);
            mesh.position.y = p.y; mesh.rotation.y = p.theta;
            p.mesh = mesh; p.baseY = p.y;
            this.root.add(mesh);
        }

        // lifts: wooden platform riding on two chains
        const chainParts = [];
        for (const p of this.platforms) {
            if (p.type !== 'lift') continue;
            const g = merge([
                { geo: ledgeGeometry(p.half, 0.32, DEPTH - 0.1, { tile: 1.2 }) },
            ]);
            const mesh = new Mesh(g, M.wood);
            const rim = new Mesh(merge([
                { geo: ledgeGeometry(p.half + 0.02, 0.1, DEPTH - 0.05, { inner: R + DEPTH - 0.2 }), pos: V(0, -0.05, 0) },
                { geo: ledgeGeometry(p.half + 0.02, 0.1, DEPTH - 0.05, { inner: R + DEPTH - 0.2 }), pos: V(0, -0.24, 0) }
            ]), M.iron);
            mesh.add(rim);
            // glowing rune under the lift
            mesh.position.y = p.y0; mesh.rotation.y = p.theta;
            p.mesh = mesh;
            this.root.add(mesh);
            for (const s of [-1, 1]) {
                const th = p.theta + s * p.half * 0.62;
                const r = R + DEPTH * 0.55;
                const y0 = p.y0 - 1.5, y1 = p.y1 + 3.0;
                const n = Math.floor((y1 - y0) / 0.13);
                for (let i = 0; i < n; i++) {
                    chainParts.push({ geo: torus(0.07, 0.022, 4, 8), pos: polar(th, r, y0 + i * 0.13), rot: V(0, th + (i % 2 ? Math.PI / 2 : 0), Math.PI / 2) });
                }
                // anchor bracket
                chainParts.push({ geo: box(0.2, 0.12, DEPTH * 0.7), pos: polar(th, R + DEPTH * 0.35, y1 + 0.05), rot: V(0, th, 0) });
            }
        }
        if (chainParts.length) this.root.add(new Mesh(merge(chainParts), M.iron));

        // tunnel doors
        const trimParts = [], voidParts = [];
        for (const d of this.doors) {
            const w = 1.15, h = 1.95;
            const frame = archFrameParts(w, h, 0.26);
            for (const f of frame) {
                const lp = f.pos;
                const wp = new Vec3(Math.cos(d.theta) * lp.x + Math.sin(d.theta) * (R + 0.06), d.y + lp.y, -Math.sin(d.theta) * lp.x + Math.cos(d.theta) * (R + 0.06));
                trimParts.push({ geo: f.geo, pos: wp, rot: V(0, d.theta, f.rot ? f.rot.z : 0) });
            }
            voidParts.push({ geo: archPanel(w, h), pos: polar(d.theta, R + 0.06, d.y), rot: V(0, d.theta, 0) });
        }
        // exit gate frame (bigger)
        const ex = this.exit;
        {
            const w = 1.8, h = 2.9;
            for (const f of archFrameParts(w, h, 0.36, 0.3)) {
                const lp = f.pos;
                const wp = new Vec3(Math.cos(ex.theta) * lp.x + Math.sin(ex.theta) * (R + 0.08), H + lp.y, -Math.sin(ex.theta) * lp.x + Math.cos(ex.theta) * (R + 0.08));
                trimParts.push({ geo: f.geo, pos: wp, rot: V(0, ex.theta, f.rot ? f.rot.z : 0) });
            }
            voidParts.push({ geo: archPanel(w, h), pos: polar(ex.theta, R + 0.04, H), rot: V(0, ex.theta, 0) });
        }

        // windows
        for (const wdw of desc.windows) {
            if (wdw.kind === 'arch') {
                const w = 0.62, h = 1.35;
                for (const f of archFrameParts(w, h, 0.18, 0.14)) {
                    const lp = f.pos;
                    const wp = new Vec3(Math.cos(wdw.theta) * lp.x + Math.sin(wdw.theta) * (R + 0.05), wdw.y + lp.y, -Math.sin(wdw.theta) * lp.x + Math.cos(wdw.theta) * (R + 0.05));
                    trimParts.push({ geo: f.geo, pos: wp, rot: V(0, wdw.theta, f.rot ? f.rot.z : 0) });
                }
                trimParts.push({ geo: box(w + 0.35, 0.1, 0.3), pos: polar(wdw.theta, R + 0.1, wdw.y - 0.05), rot: V(0, wdw.theta, 0) });
                (wdw.lit ? this._litWindows || (this._litWindows = []) : voidParts).push({ geo: archPanel(w, h), pos: polar(wdw.theta, R + 0.03, wdw.y), rot: V(0, wdw.theta, 0) });
            } else {
                const w = 0.16, h = 0.95;
                trimParts.push({ geo: box(0.14, h + 0.1, 0.16), pos: polar(wdw.theta + 0.2 / R * 0.6, R + 0.04, wdw.y + h / 2), rot: V(0, wdw.theta, 0) });
                trimParts.push({ geo: box(0.14, h + 0.1, 0.16), pos: polar(wdw.theta - 0.2 / R * 0.6, R + 0.04, wdw.y + h / 2), rot: V(0, wdw.theta, 0) });
                trimParts.push({ geo: box(0.46, 0.12, 0.18), pos: polar(wdw.theta, R + 0.04, wdw.y + h + 0.06), rot: V(0, wdw.theta, 0) });
                trimParts.push({ geo: box(0.46, 0.1, 0.2), pos: polar(wdw.theta, R + 0.05, wdw.y - 0.04), rot: V(0, wdw.theta, 0) });
                voidParts.push({ geo: box(w, h, 0.02), pos: polar(wdw.theta, R + 0.02, wdw.y + h / 2), rot: V(0, wdw.theta, 0) });
            }
        }

        // something watches from the dark windows and passages
        this.eyes = [];
        const erng = makeRng(((desc.seed || 7) * 31 + 5) >>> 0);
        for (const wdw of desc.windows) {
            if (wdw.kind === 'arch' && !wdw.lit && erng() < 0.55) this.eyes.push({ theta: wdw.theta, y: wdw.y + 0.8, r: R + 0.07, gap: 0.09, size: 1 });
            else if (wdw.kind !== 'arch' && erng() < 0.3) this.eyes.push({ theta: wdw.theta, y: wdw.y + 0.62, r: R + 0.05, gap: 0.042, size: 0.6 });
        }
        for (const d of this.doors) if (erng() < 0.45) this.eyes.push({ theta: d.theta, y: d.y + 1.2, r: R + 0.1, gap: 0.13, size: 1.35 });
        if (this.eyes.length) {
            this.eyeMesh = new InstancedMesh(sphere(0.05, 8, 6), new BasicMaterial({ color: [1.0, 0.14, 0.04] }), this.eyes.length * 2);
            this.eyeMesh.count = this.eyes.length * 2;
            for (const e of this.eyes) { e.open = 0; e.state = erng() < 0.4 ? 'shown' : 'hidden'; e.timer = erng() * 6; e.blink = 0; }
            this.root.add(this.eyeMesh);
            this._ev = V(); this._er = V(); this._es = V();
        }

        // decorative string courses (bands of trim stone) where no ledge sits
        for (let by = 6; by < H - 2; by += 11 + rng.range(0, 3)) {
            const clear = !this.platforms.some(p => p.type !== 'ground' && Math.abs(p.y - by) < 0.9);
            if (!clear) continue;
            trimParts.push({ geo: cylinder(R + 0.14, R + 0.14, 0.26, 72, 1, { openEnded: true, uRepeat: 14, vRepeat: 0.2 }), pos: V(0, by, 0) });
            trimParts.push({ geo: cylinder(R + 0.14, R, 0.1, 72, 1, { openEnded: true, uRepeat: 14, vRepeat: 0.1 }), pos: V(0, by - 0.18, 0) });
        }

        // crown: corbel table, merlons, roof, spire
        const crownY = H + 3.4;
        trimParts.push({ geo: cylinder(R + 0.45, R + 0.45, 0.55, 72, 1, { uRepeat: 16, vRepeat: 0.3 }), pos: V(0, crownY + 0.27, 0) });
        for (let i = 0; i < 36; i++) {
            const th = (i / 36) * TAU;
            trimParts.push({ geo: extrude([[0, 0], [0.45, 0], [0, -0.6]], 0.24, 0.02), pos: polar(th, R - 0.02, crownY), rot: V(0, th - Math.PI / 2, 0) });
        }
        for (let i = 0; i < 18; i++) {
            const th = (i / 18) * TAU;
            trimParts.push({ geo: box(0.62, 0.75, 0.42), pos: polar(th, R + 0.22, crownY + 0.55 + 0.37), rot: V(0, th, 0) });
        }
        this.root.add(new Mesh(merge(trimParts), M.trim));
        const voidMesh = new Mesh(merge(voidParts), M.voidDark);
        this.root.add(voidMesh);
        if (this._litWindows && this._litWindows.length) this.root.add(new Mesh(merge(this._litWindows), M.windowGlow));

        // roof + spire + flag
        const roof = new Mesh(lathe([[R + 0.05, 0], [R * 0.7, 2.2], [R * 0.35, 4.6], [0.12, 7.2], [0.0, 7.4]], 36), M.slate);
        roof.position.y = crownY + 0.6;
        this.root.add(roof);
        const spire = new Mesh(merge([
            { geo: cylinder(0.05, 0.05, 2.6, 6, 1), pos: V(0, 1.2, 0) },
            { geo: sphere(0.14, 8, 6), pos: V(0, 0.1, 0) }
        ]), M.iron);
        spire.position.y = crownY + 7.8;
        this.root.add(spire);
        const flagGeo = plane(1.4, 0.8, 8, 2);
        // rotate the flag so it hangs from the pole with uv.y = 1 at the pole side: use a custom mapping
        const fg = flagGeo;
        for (let i = 0; i < fg.positions.length; i += 3) {
            const x = fg.positions[i], y = fg.positions[i + 1];
            fg.positions[i] = x + 0.7; fg.positions[i + 1] = y;
        }
        for (let i = 0; i < fg.uvs.length; i += 2) { const u = fg.uvs[i]; fg.uvs[i] = fg.uvs[i + 1]; fg.uvs[i + 1] = 1 - u; }
        const flag = new Mesh(fg, this.M.banner);
        flag.position.y = crownY + 9.6;
        this.flag = flag;
        this.root.add(flag);

        // banners
        for (const bn of desc.banners) {
            const g = plane(0.95, bn.len, 2, 8);
            for (let i = 0; i < g.positions.length; i += 3) g.positions[i + 1] -= bn.len / 2;
            g.computeBounds();
            const m = new Mesh(g, M.banner);
            m.position.copy(polar(bn.theta, R + 0.09, bn.y));
            m.rotation.y = bn.theta;
            this.root.add(m);
            const rod = new Mesh(cylinder(0.035, 0.035, 1.2, 6, 1), M.iron);
            rod.rotation.z = Math.PI / 2;
            rod.position.copy(polar(bn.theta, R + 0.12, bn.y + 0.02));
            rod.rotation.y = bn.theta;
            this.root.add(rod);
        }

        // props on ledges
        const boneParts = [], candleParts = [], candleFlames = [];
        for (const pr of desc.props) {
            const base = polar(pr.theta, pr.r, pr.y);
            if (pr.kind === 'skull' || pr.kind === 'bones') {
                if (pr.kind === 'skull') {
                    boneParts.push({ geo: sphere(0.13, 10, 8), pos: new Vec3(base.x, pr.y + 0.12, base.z), rot: V(0, pr.theta + pr.rot, 0), scale: V(1, 0.95, 1.15) });
                    boneParts.push({ geo: box(0.14, 0.07, 0.1), pos: new Vec3(base.x, pr.y + 0.03, base.z), rot: V(0, pr.theta + pr.rot, 0) });
                }
                for (let k = 0; k < 3; k++) {
                    const off = polar(pr.theta + (k - 1) * 0.06, pr.r + 0.1 * (k - 1), pr.y + 0.03);
                    boneParts.push({ geo: cylinder(0.025, 0.025, 0.4, 5, 1), pos: off, rot: V(Math.PI / 2, pr.theta + pr.rot + k * 1.1, 0) });
                }
            } else {
                for (let k = 0; k < 3; k++) {
                    const h = 0.16 + k * 0.07;
                    const p = polar(pr.theta + (k - 1) * 0.05, pr.r + (k % 2) * 0.1, pr.y + h / 2);
                    candleParts.push({ geo: cylinder(0.04, 0.045, h, 8, 1), pos: p });
                    candleFlames.push(new Vec3(p.x, pr.y + h + 0.06, p.z));
                }
            }
        }
        if (boneParts.length) this.root.add(new Mesh(merge(boneParts), M.bone));
        if (candleParts.length) this.root.add(new Mesh(merge(candleParts), M.candle));

        // torches: brackets merged, flames + glows instanced
        const brParts = [];
        for (const t of this.torches) brParts.push(...torchBracketParts(t.theta, t.y));
        this.root.add(new Mesh(merge(brParts), M.iron));
        const nFl = this.torches.length + candleFlames.length;
        this.flames = new InstancedMesh(plane(1, 1), makeFlameMaterial(), nFl);
        this.glows = new InstancedMesh(plane(1, 1), makeBillboardMaterial(T.glow, [1.0, 0.5, 0.16], 'glowbb'), nFl + 4);
        this.glows.material.uniforms.uStrength = 0.55;
        let i = 0;
        const one = V(1, 1, 1);
        for (const t of this.torches) {
            this.flames.setAt(i, new Vec3(t.pos.x, t.pos.y + 0.16, t.pos.z), V(), V(0.42, 0.42, 0.42), [t.phase, 0, 0]);
            this.glows.setAt(i, new Vec3(t.pos.x, t.pos.y + 0.18, t.pos.z), V(), V(2.4, 2.4, 2.4), [1, 1, 1]);
            i++;
        }
        for (const c of candleFlames) {
            this.flames.setAt(i, c, V(), V(0.12, 0.12, 0.12), [Math.random(), 0, 0]);
            this.glows.setAt(i, c, V(), V(0.6, 0.6, 0.6), [1, 1, 1]);
            i++;
        }
        this.flames.count = i; this.glows.count = i;
        this.root.add(this.flames, this.glows);

        // exit gate doors (two wooden leaves on hinges) + inner light
        this.gate = new Node();
        this.gate.position.copy(polar(ex.theta, R + 0.1, H));
        this.gate.rotation.y = ex.theta;
        const leafGeo = merge([{ geo: box(0.86, 2.3, 0.1, 0.6), pos: V(0.43, 1.15, 0) }]);
        this.leafL = new Node(); this.leafR = new Node();
        this.leafL.position.set(-0.86, 0, 0); this.leafR.position.set(0.86, 0, 0);
        const lMesh = new Mesh(leafGeo, M.wood);
        const rMesh = new Mesh(leafGeo, M.wood); rMesh.rotation.y = Math.PI; rMesh.position.z = 0;
        this.leafL.add(lMesh); this.leafR.add(rMesh);
        const studs = [];
        for (let s of [-1, 1]) for (let k = 0; k < 4; k++) studs.push({ geo: sphere(0.045, 6, 4), pos: V(s * 0.45, 0.4 + k * 0.5, 0.06) });
        const studMesh = new Mesh(merge(studs), M.gold);
        this.gateStuds = studMesh;
        const lock = new Mesh(merge([{ geo: box(0.24, 0.32, 0.06), pos: V(0, 1.15, 0.07) }, { geo: torus(0.08, 0.02, 4, 10), pos: V(0, 1.45, 0.1) }]), M.gold);
        this.gateLock = lock;
        this.gate.add(this.leafL, this.leafR, studMesh, lock);
        this.root.add(this.gate);
        this.gateLight = new Mesh(archPanel(1.7, 2.85), new BasicMaterial({ color: [1, 0.24, 0.1] }));
        this.gateLight.position.copy(polar(ex.theta, R + 0.065, H));
        this.gateLight.rotation.y = ex.theta;
        this.gateLight.visible = false;
        this.root.add(this.gateLight);

        // beacon brazier at the very top of the crown (visible goal)
        this.beaconPos = new Vec3(0, crownY + 1.6, 0);
    }

    // ---- runtime ---------------------------------------------------------
    update(dt, time) {
        for (const p of this.platforms) {
            if (p.type === 'lift') {
                const t = (time + p.phase) / p.period;
                const k = 0.5 - 0.5 * Math.cos(t * TAU);
                const ny = p.y0 + (p.y1 - p.y0) * k;
                p.dy = ny - p.y;
                p.y = ny;
                p.mesh.position.y = ny;
            } else if (p.type === 'crumble') {
                p.dy = 0;
                if (p.state === 'shaking') {
                    p.timer -= dt;
                    const amp = 0.02 + 0.05 * (1 - p.timer / (p.shakeTotal || 1));
                    p.mesh.position.x = Math.sin(time * 70) * amp;
                    p.mesh.position.z = Math.cos(time * 63) * amp;
                    if (p.timer <= 0) { p.state = 'falling'; p.active = false; p.vy = 0; p.timer = 2.5; this.onCrumble && this.onCrumble(p); }
                } else if (p.state === 'falling') {
                    p.vy -= 20 * dt;
                    p.mesh.position.y += p.vy * dt;
                    p.mesh.rotation.x += dt * 0.6;
                    p.timer -= dt;
                    if (p.timer <= 0) { p.state = 'gone'; p.mesh.visible = false; p.respawn = 4; }
                } else if (p.state === 'gone') {
                    p.respawn -= dt;
                    if (p.respawn <= 0) {
                        p.state = 'idle'; p.active = true;
                        p.mesh.visible = true; p.mesh.position.set(0, p.baseY, 0); p.mesh.rotation.x = 0;
                        p.mesh.scale.set(0.01, 0.01, 0.01); p.grow = 0;
                    }
                } else if (p.grow !== undefined && p.grow < 1) {
                    p.grow = Math.min(1, p.grow + dt * 3);
                    const s = p.grow;
                    p.mesh.scale.set(s, s, s);
                }
            }
        }
        // exit gate
        const ex = this.exit;
        if (ex.unlocked && ex.open < 1) {
            ex.open = Math.min(1, ex.open + dt * 0.7);
            const k = 1 - Math.pow(1 - ex.open, 3);
            this.leafL.rotation.y = -k * 1.9;
            this.leafR.rotation.y = k * 1.9;
            this.gateLight.visible = true;
            this.gateLock.visible = false;
        }
        // flag bob
        if (this.flag) this.flag.rotation.y = Math.sin(time * 0.7) * 0.6 + time * 0.05;
        // watching eyes: open, blink, vanish
        if (this.eyeMesh) {
            let i = 0;
            for (const e of this.eyes) {
                e.timer -= dt;
                if (e.timer <= 0) {
                    if (e.state === 'hidden') { e.state = 'shown'; e.timer = 2.5 + Math.random() * 5; }
                    else { e.state = 'hidden'; e.timer = 3 + Math.random() * 9; }
                }
                e.open += ((e.state === 'shown' ? 1 : 0) - e.open) * Math.min(1, dt * 5);
                if (e.state === 'shown' && e.blink <= 0 && Math.random() < dt * 0.4) e.blink = 0.16;
                e.blink = Math.max(0, e.blink - dt);
                const sy = e.open * (e.blink > 0 ? 0.08 : 1);
                for (const s of [-1, 1]) {
                    const th = e.theta + s * e.gap / R;
                    this._ev.set(Math.sin(th) * e.r, e.y, Math.cos(th) * e.r);
                    this._er.set(0, e.theta, s * 0.38);
                    this._es.set(e.open * e.size * 1.25, sy * e.size * 0.5, 0.35);
                    this.eyeMesh.setAt(i++, this._ev, this._er, this._es, [1, 1, 1]);
                }
            }
        }
    }

    stepOn(p) {
        if (p.type === 'crumble' && p.state === 'idle' && (p.grow === undefined || p.grow >= 1)) {
            p.state = 'shaking'; p.timer = p.delay || 0.9; p.shakeTotal = p.timer;
            return true;
        }
        return false;
    }

    // collision helpers ------------------------------------------------------
    // Find the highest active platform whose top was crossed going down this step.
    findLanding(theta, halfArc, yPrev, yNew, ignore) {
        let best = null;
        for (const p of this.platforms) {
            if (!p.active || p === ignore) continue;
            const top = p.y;
            if (yPrev >= top - 0.02 - Math.max(0, p.dy) && yNew <= top + 0.001) {
                if (Math.abs(angleDiff(theta, p.theta)) <= p.half + halfArc / PATH.r) {
                    if (!best || top > best.y) best = p;
                }
            }
        }
        return best;
    }
    stillOn(p, theta, halfArc) {
        return p.active && Math.abs(angleDiff(theta, p.theta)) <= p.half + halfArc / PATH.r;
    }
    // highest platform top below a height at this angle (for shadows)
    groundBelow(theta, y) {
        let best = -Infinity;
        for (const p of this.platforms) {
            if (!p.active || p.y > y + 0.05) continue;
            if (Math.abs(angleDiff(theta, p.theta)) <= p.half && p.y > best) best = p.y;
        }
        return best;
    }
}

// ======================================================================
// WORLD
// ======================================================================
// Environment: blood-red sky, lava sea, ruined skyline, volcanoes, ash and embers,
// lightning, and the dynamic light pool (torches, lava, fireballs).

function skyMaterial() {
    return new ShaderMaterial({
        key: 'sky', side: 'double', depthWrite: false, renderOrder: -100,
        vertex: `
out vec3 vDir;
void main(){
  vDir = position;
  vec4 wp = uModel * vec4(position, 1.0);
  gl_Position = uProj * uView * wp;
  gl_Position.z = gl_Position.w * 0.99999;
}`,
        fragment: `
in vec3 vDir;
uniform float uFlash; uniform vec3 uMoonDir;
void main(){
  vec3 d = normalize(vDir);
  float h = d.y;
  vec3 horizon = vec3(0.5, 0.07, 0.05);
  vec3 mid = vec3(0.13, 0.025, 0.05);
  vec3 zenith = vec3(0.025, 0.012, 0.04);
  vec3 col = mix(horizon, mid, smoothstep(-0.02, 0.2, h));
  col = mix(col, zenith, smoothstep(0.16, 0.7, h));
  col = mix(col, vec3(0.45, 0.08, 0.03), smoothstep(0.0, -0.25, h));
  // blood moon: flat disc, ink rim, craters, halo
  vec3 md3 = normalize(uMoonDir);
  float ang = acos(clamp(dot(d, md3), -1.0, 1.0));
  float R0 = 0.1;
  vec3 mside = normalize(cross(md3, vec3(0.0, 1.0, 0.0)));
  vec3 mup = cross(mside, md3);
  vec2 mp = vec2(dot(d - md3, mside), dot(d - md3, mup)) / R0;
  float crater = step(0.62, vnoise(mp * 3.0 + 4.0)) * 0.25 + step(0.7, vnoise(mp * 7.0)) * 0.15;
  vec3 moonCol = mix(vec3(0.95, 0.3, 0.18), vec3(1.0, 0.55, 0.35), smoothstep(0.9, -0.6, mp.y)) * (1.0 - crater);
  col += vec3(0.5, 0.06, 0.04) * pow(max(0.0, 1.0 - ang / 0.55), 3.0) * 0.8;
  col = mix(col, moonCol, step(ang, R0));
  col = mix(col, vec3(0.06, 0.01, 0.02), smoothstep(R0 - 0.006, R0, ang) * step(ang, R0 + 0.004));
  // cartoon clouds: flat dark shapes with a lit rim underneath
  vec2 uv = d.xz / (max(h, 0.0) + 0.22);
  float t = uTime;
  float c1 = fbm(uv * 0.75 + vec2(t * 0.012, t * 0.005));
  float c2 = fbm(uv * 1.6 - vec2(t * 0.018, -t * 0.008) + 3.0);
  float cv = c1 * 0.7 + c2 * 0.35;
  float body = smoothstep(0.545, 0.56, cv);
  float rim = smoothstep(0.5, 0.515, cv) - body;
  float vis = smoothstep(-0.03, 0.08, h);
  float lowLit = smoothstep(0.5, 0.0, h);
  vec3 cloudCol = mix(vec3(0.05, 0.015, 0.035), vec3(0.2, 0.04, 0.05), lowLit * 0.6);
  col = mix(col, cloudCol, body * vis);
  col += vec3(0.85, 0.2, 0.08) * rim * vis * (0.35 + lowLit * 0.9);
  col += uFlash * vec3(0.6, 0.55, 0.85) * (0.2 + body * 1.2 + rim) * smoothstep(-0.1, 0.3, h);
  fragColor = vec4(col, 1.0);
}`,
        uniforms: { uFlash: 0, uMoonDir: [-0.55, 0.32, -0.77] }
    });
}

function lavaMaterial() {
    return new ShaderMaterial({
        key: 'lava', renderOrder: -10,
        vertex: `
out vec3 vWorld; out float vDepth;
void main(){
  vec4 wp = uModel * vec4(position, 1.0);
  vWorld = wp.xyz;
  vec4 vp = uView * wp; vDepth = -vp.z;
  gl_Position = uProj * vp;
}`,
        fragment: `
in vec3 vWorld; in float vDepth;
uniform float uHeat; uniform float uFreeze;
void main(){
  vec2 p = vWorld.xz * 0.11;
  float t = uTime * 0.045 * (1.0 - uFreeze);
  vec2 q = vec2(vnoise(p * 1.3 + vec2(t, t*0.3)) * 0.65 + vnoise(p * 2.7 - t) * 0.35, vnoise(p * 1.3 + vec2(5.2, 1.3) - t) * 0.65 + vnoise(p * 2.9 + 3.1 + t) * 0.35);
  float n = fbm(p * 1.6 + q * 1.8 + vec2(t * 0.8, -t * 0.6));
  float veinN = fbm(p * 3.0 + q * 2.0 - t * 0.5);
  // cartoon lava: flat crust plates with ink seams, molten channels, bright veins
  vec3 crust = vec3(0.16, 0.02, 0.03);
  vec3 molten = vec3(1.0, 0.3, 0.04);
  vec3 bright = vec3(1.0, 0.82, 0.3);
  float m = smoothstep(0.47, 0.49, n);
  vec3 col = mix(crust, molten, m);
  float seam = smoothstep(0.43, 0.455, n) * (1.0 - m);
  col = mix(col, vec3(0.05, 0.0, 0.01), seam * 0.8);
  float vein = smoothstep(0.86, 0.9, 1.0 - abs(veinN * 2.0 - 1.0));
  col = mix(col, bright, vein * m);
  col = mix(col, bright, smoothstep(0.64, 0.66, n));
  float pulse = 0.9 + 0.1 * sin(uTime * 1.3 + n * 6.0);
  col *= (1.05 + uHeat * 0.35) * pulse;
  col = mix(col, vec3(0.45, 0.8, 1.0) * (0.3 + m * 0.5), uFreeze * 0.55);
  float fd = uFogDensity * vDepth * 0.55;
  float fog = 1.0 - exp(-fd * fd);
  col = mix(col, uFogColor * 1.4, fog);
  fragColor = vec4(col, 1.0);
}`,
        uniforms: { uHeat: 0, uFreeze: 0 }
    });
}

function volcanoMaterial() {
    return new ShaderMaterial({
        key: 'volcano', renderOrder: -5,
        vertex: `
out vec3 vWorld; out vec3 vN; out float vDepth; out vec2 vUv;
void main(){
  vec4 wp = uModel * vec4(position, 1.0);
  vWorld = wp.xyz; vN = mat3(uModel) * normal; vUv = uv;
  vec4 vp = uView * wp; vDepth = -vp.z;
  gl_Position = uProj * vp;
}`,
        fragment: `
in vec3 vWorld; in vec3 vN; in float vDepth; in vec2 vUv;
uniform float uFogScale;
void main(){
  vec3 N = normalize(vN);
  float h = vUv.y;
  float ang = vUv.x;
  float rock = fbm(vec2(ang * 30.0, h * 8.0));
  vec3 col = vec3(0.07, 0.03, 0.05) * (0.8 + step(0.5, rock) * 0.3);
  col += vec3(0.3, 0.06, 0.03) * step(0.1, -N.y + 0.2) * 0.5;
  float stream = step(0.82, fbm(vec2(ang * 22.0, h * 2.0 - uTime * 0.03)));
  float glowH = smoothstep(0.35, 0.95, h);
  col += vec3(1.0, 0.3, 0.05) * stream * glowH * 1.6;
  col += vec3(1.0, 0.45, 0.1) * smoothstep(0.93, 1.0, h) * 2.0;
  col += vec3(0.6, 0.12, 0.02) * smoothstep(0.25, 0.0, h) * 0.5;
  float fd = uFogDensity * vDepth * uFogScale;
  float fog = 1.0 - exp(-fd * fd);
  col = mix(col, uFogColor, fog * 0.85);
  fragColor = vec4(col, 1.0);
}`,
        uniforms: { uFogScale: 0.3 }
    });
}

export class World {
    constructor(renderer, T, M, quality) {
        this.renderer = renderer;
        this.root = new Node();
        this.quality = quality;
        this.time = 0;
        this.flash = 0;
        this.nextFlash = 6;
        this.freeze = 0;
        // sky dome
        this.sky = new Mesh(sphere(600, 32, 16), skyMaterial());
        this.sky.frustumCulled = false;
        this.root.add(this.sky);
        // lava sea (follows camera on xz)
        this.lava = new Mesh(plane(1400, 1400, 1, 1), lavaMaterial());
        this.lava.rotation.x = -Math.PI / 2;
        this.lava.frustumCulled = false;
        this.root.add(this.lava);
        this._buildRuins(T, M);
        this._buildVolcanoes();
        this._buildAtmosphere();
        this.lavaLight = { pos: new Vec3(), color: [0, 0, 0], range: 26 };
    }

    _buildRuins(T, M) {
        const rng = makeRng(1234);
        const parts = [];
        const glowParts = [];
        for (let i = 0; i < 16; i++) {
            const ang = (i / 16) * TAU + rng.range(-0.15, 0.15);
            const dist = rng.range(55, 140);
            const r = rng.range(3, 7);
            const h = rng.range(18, 60);
            const g = cylinder(r * 0.9, r, h, 20, 6, { openEnded: false, uRepeat: 3, vRepeat: h / 6 });
            const cut = rng.range(0.55, 0.9);
            const seed = rng() * 100;
            deform(g, (v) => {
                const t = (v.y + h / 2) / h;
                if (t > cut - 0.2) {
                    const a = Math.atan2(v.x, v.z);
                    const jag = (Math.sin(a * 3 + seed) * 0.5 + Math.sin(a * 7 + seed * 2) * 0.3 + 0.4) * h * 0.25;
                    const limit = h * cut - jag;
                    const yy = v.y + h / 2;
                    if (yy > limit) v.y = limit - h / 2;
                }
            });
            recomputeNormals(g);
            const cx = Math.sin(ang) * dist, cz = Math.cos(ang) * dist;
            const lean = rng.range(-0.08, 0.08);
            parts.push({ geo: g, pos: V(cx, h / 2 - 12, cz), rot: V(lean, rng() * 3, lean * 0.5) });
            // lit windows
            const nw = rng.int(1, 4);
            for (let k = 0; k < nw; k++) {
                const wa = ang + Math.PI + rng.range(-0.6, 0.6);
                const wy = rng.range(0, h * cut * 0.7) - 12;
                const wx = cx + Math.sin(wa) * r * 1.01, wz = cz + Math.cos(wa) * r * 1.01;
                glowParts.push({ geo: box(0.9, 1.8, 0.3), pos: V(wx, wy, wz), rot: V(0, wa, 0) });
            }
        }
        // broken walls between ruins
        for (let i = 0; i < 12; i++) {
            const ang = rng.range(0, TAU), dist = rng.range(45, 120);
            const w = rng.range(10, 26), h = rng.range(6, 18);
            const g = box(w, h, 2.5, 1);
            const seed = rng() * 100;
            deform(g, (v) => { if (v.y > 0) v.y -= (Math.sin(v.x * 0.7 + seed) * 0.5 + 0.5) * h * 0.6; });
            recomputeNormals(g);
            parts.push({ geo: g, pos: V(Math.sin(ang) * dist, h / 2 - 8, Math.cos(ang) * dist), rot: V(0, ang + rng.range(-0.5, 0.5), rng.range(-0.1, 0.1)) });
        }
        // jagged rock spires
        for (let i = 0; i < 22; i++) {
            const ang = rng.range(0, TAU), dist = rng.range(35, 160);
            const h = rng.range(8, 30), r = rng.range(1.5, 4.5);
            const g = lathe([[r, 0], [r * 0.7, h * 0.4], [r * 0.35, h * 0.8], [0.05, h]], 7);
            parts.push({ geo: g, pos: V(Math.sin(ang) * dist, -10, Math.cos(ang) * dist), rot: V(rng.range(-0.15, 0.15), rng() * 3, rng.range(-0.15, 0.15)) });
        }
        const mat = new LitMaterial({ map: T.wall.map, color: [0.5, 0.4, 0.46], toon: true, toonKey: 1.2, toonPL: 0.6, toonSpec: 0, rimStrength: 0.25, toonAmb: [1.2, 0.02], fogScale: 0.55 });
        this.ruins = new Mesh(merge(parts), mat);
        this.ruins.frustumCulled = false;
        this.root.add(this.ruins);
        const gm = new LitMaterial({ color: [0.1, 0.05, 0.02], emissive: [1.0, 0.45, 0.12], fogScale: 0.45, toon: true, toonAmb: [0, 0] });
        this.ruinWindows = new Mesh(merge(glowParts), gm);
        this.ruinWindows.frustumCulled = false;
        this.root.add(this.ruinWindows);
    }

    _buildVolcanoes() {
        const rng = makeRng(77);
        const parts = [];
        this.craters = [];
        const spots = [[0.6, 260, 120, 60], [2.4, 300, 150, 80], [4.1, 240, 95, 55], [5.3, 330, 170, 90]];
        for (const [ang, dist, h, r] of spots) {
            const prof = [];
            for (let k = 0; k <= 10; k++) {
                const t = k / 10;
                const rr = r * (1 - t * 0.82) * (1 + (t > 0.9 ? 0.1 : 0));
                prof.push([rr, t * h]);
            }
            prof.push([r * 0.12, h * 0.96]);
            const g = lathe(prof, 36);
            const seed = rng() * 50;
            deform(g, (v) => {
                const a = Math.atan2(v.x, v.z);
                const n = Math.sin(a * 5 + seed) * 0.08 + Math.sin(a * 13 + seed * 3) * 0.04;
                v.x *= 1 + n; v.z *= 1 + n;
            });
            recomputeNormals(g);
            const cx = Math.sin(ang) * dist, cz = Math.cos(ang) * dist;
            parts.push({ geo: g, pos: V(cx, -20, cz) });
            this.craters.push(new Vec3(cx, h - 22, cz));
        }
        // far mountain ring
        const ring = [];
        for (let i = 0; i < 26; i++) {
            const ang = (i / 26) * TAU + rng.range(-0.1, 0.1);
            const dist = rng.range(380, 460), h = rng.range(60, 140), r = rng.range(60, 110);
            const g = lathe([[r, 0], [r * 0.55, h * 0.5], [r * 0.2, h * 0.9], [0.1, h]], 12);
            ring.push({ geo: g, pos: V(Math.sin(ang) * dist, -25, Math.cos(ang) * dist), rot: V(0, rng() * 3, 0) });
        }
        this.volcanoes = new Mesh(merge(parts.concat(ring)), volcanoMaterial());
        this.volcanoes.frustumCulled = false;
        this.root.add(this.volcanoes);
    }

    _buildAtmosphere() {
        // embers rising around the tower
        const q = this.quality;
        const nE = q >= 1 ? 220 : 130;
        this.embers = new Points(nE, new Material('points', { transparent: true, blending: 'additive', depthWrite: false }));
        this.embers.material.fogScale = 0.5;
        this.embers.count = nE;
        this.emberData = [];
        for (let i = 0; i < nE; i++) this.emberData.push({ a: Math.random() * TAU, r: 5 + Math.random() * 16, y: Math.random() * 30 - 10, s: 0.5 + Math.random(), ph: Math.random() * 10 });
        this.root.add(this.embers);
        // ash flakes drifting down
        const nA = q >= 1 ? 160 : 90;
        this.ash = new Points(nA, new Material('points', { transparent: true, depthWrite: false }));
        this.ash.material.hard = true;
        this.ash.material.fogScale = 0.6;
        this.ash.count = nA;
        this.ashData = [];
        for (let i = 0; i < nA; i++) this.ashData.push({ a: Math.random() * TAU, r: 5 + Math.random() * 14, y: Math.random() * 30 - 10, s: 0.5 + Math.random(), ph: Math.random() * 10 });
        this.root.add(this.ash);
        // volcano smoke plumes
        const nS = 60;
        this.smoke = new Points(nS, new Material('points', { transparent: true, depthWrite: false }));
        this.smoke.material.fogScale = 0.25;
        this.smoke.count = nS;
        this.smokeData = [];
        for (let i = 0; i < nS; i++) this.smokeData.push({ c: i % this.craters.length, t: Math.random() });
        this.root.add(this.smoke);
    }

    update(dt, camera, focusY, lavaY, lavaHeat) {
        this.time += dt;
        const t = this.time;
        const cam = camera.position;
        this.sky.position.copy(cam);
        this.lava.position.set(cam.x, lavaY, cam.z);
        this.lava.material.uniforms.uHeat = lavaHeat;
        this.freeze += ((this._freezeTarget || 0) - this.freeze) * Math.min(1, dt * 4);
        this.lava.material.uniforms.uFreeze = this.freeze;
        // lightning
        this.nextFlash -= dt;
        if (this.nextFlash <= 0) {
            this.flash = 1;
            this.nextFlash = 5 + Math.random() * 9;
            this._flash2 = Math.random() < 0.6 ? 0.15 : -1;
            if (this.onThunder) this.onThunder();
        }
        if (this._flash2 > 0) { this._flash2 -= dt; if (this._flash2 <= 0) { this.flash = 0.8; this._flash2 = -1; } }
        this.flash = Math.max(0, this.flash - dt * 3.2);
        this.sky.material.uniforms.uFlash = this.flash;

        // embers
        const e = this.embers, ed = this.emberData;
        for (let i = 0; i < ed.length; i++) {
            const d = ed[i];
            d.y += dt * (1.2 + d.s * 1.2);
            d.a += dt * 0.05 * d.s;
            if (d.y > focusY + 16) { d.y = focusY - 12 - Math.random() * 4; d.a = Math.random() * TAU; d.r = 5 + Math.random() * 16; }
            if (d.y < focusY - 18) d.y = focusY + 14 * Math.random();
            const wob = Math.sin(t * 1.3 + d.ph) * 0.6;
            e.positions[i * 3] = Math.sin(d.a) * (d.r + wob);
            e.positions[i * 3 + 1] = d.y;
            e.positions[i * 3 + 2] = Math.cos(d.a) * (d.r + wob);
            e.sizes[i] = 0.06 + 0.05 * d.s;
            const fl = 0.6 + 0.4 * Math.sin(t * 7 + d.ph * 3);
            const nearLava = clamp(1 - (d.y - lavaY) / 25, 0.25, 1);
            e.colors[i * 4] = 1; e.colors[i * 4 + 1] = 0.45 + 0.3 * fl; e.colors[i * 4 + 2] = 0.1;
            e.colors[i * 4 + 3] = fl * nearLava;
        }
        e.needsUpdate = true;
        const a = this.ash, ad = this.ashData;
        for (let i = 0; i < ad.length; i++) {
            const d = ad[i];
            d.y -= dt * (0.5 + d.s * 0.4);
            d.a += dt * 0.03;
            if (d.y < focusY - 14) { d.y = focusY + 14 + Math.random() * 3; d.a = Math.random() * TAU; }
            if (d.y > focusY + 18) d.y = focusY - 10 + Math.random() * 20;
            const sw = Math.sin(t * 0.8 + d.ph) * 0.8;
            a.positions[i * 3] = Math.sin(d.a) * d.r + sw;
            a.positions[i * 3 + 1] = d.y;
            a.positions[i * 3 + 2] = Math.cos(d.a) * d.r - sw;
            a.sizes[i] = 0.05 + 0.03 * d.s;
            a.colors[i * 4] = 0.55; a.colors[i * 4 + 1] = 0.5; a.colors[i * 4 + 2] = 0.5; a.colors[i * 4 + 3] = 0.55;
        }
        a.needsUpdate = true;
        // smoke plumes
        const s = this.smoke, sd = this.smokeData;
        for (let i = 0; i < sd.length; i++) {
            const d = sd[i];
            d.t += dt * 0.025;
            if (d.t > 1) d.t -= 1;
            const c = this.craters[d.c];
            const k = d.t;
            s.positions[i * 3] = c.x + Math.sin(i * 1.7) * 8 * k + k * 40;
            s.positions[i * 3 + 1] = c.y + k * 110;
            s.positions[i * 3 + 2] = c.z + Math.cos(i * 2.3) * 8 * k;
            s.sizes[i] = 18 + k * 70;
            const glow = Math.max(0, 1 - k * 3);
            s.colors[i * 4] = 0.12 + glow * 0.5; s.colors[i * 4 + 1] = 0.05 + glow * 0.12; s.colors[i * 4 + 2] = 0.04;
            s.colors[i * 4 + 3] = 0.55 * Math.sin(k * Math.PI);
        }
        s.needsUpdate = true;
    }

    // Choose which light sources get the limited point-light slots
    assignLights(env, focus, camTheta, torches, extra, lavaY) {
        const pts = [];
        // lava light: in front of the player, just above the lava surface
        const lavaDist = focus.y - lavaY;
        const li = clamp(1.4 - lavaDist / 14, 0, 1.4);
        if (li > 0.02) {
            const ll = this.lavaLight;
            ll.pos.set(Math.sin(camTheta) * 9, lavaY + 2.5, Math.cos(camTheta) * 9);
            const fl = 0.9 + 0.1 * Math.sin(this.time * 3.1);
            ll.color = [6 * li * fl, 1.8 * li * fl, 0.35 * li * fl];
            ll.range = 30;
            pts.push(ll);
        }
        for (const x of extra) { if (pts.length < 3) pts.push(x); }
        // nearest visible torches
        const cand = [];
        for (const t of torches) {
            const da = Math.abs(angleDiff(t.theta, camTheta));
            if (da > 1.9) continue;
            const dy = Math.abs(t.y - focus.y);
            if (dy > 16) continue;
            cand.push({ t, score: dy + da * 4 });
        }
        cand.sort((a, b) => a.score - b.score);
        const maxT = CONFIG.MAX_TORCH_LIGHTS;
        for (let i = 0; i < cand.length && i < maxT && pts.length < 8; i++) {
            const t = cand[i].t;
            if (!t.light) t.light = { pos: new Vec3(), color: [0, 0, 0], range: 7.5 };
            const f = 0.82 + 0.1 * Math.sin(this.time * 13 + t.phase) + 0.08 * Math.sin(this.time * 23.7 + t.phase * 2);
            t.light.pos.set(t.pos.x * 1.08, t.pos.y + 0.3, t.pos.z * 1.08);
            t.light.color = [3.9 * f, 1.62 * f, 0.45 * f];
            pts.push(t.light);
        }
        env.points = pts;
    }
}