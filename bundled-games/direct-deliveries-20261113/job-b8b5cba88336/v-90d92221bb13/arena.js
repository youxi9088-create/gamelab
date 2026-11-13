// The guardian's hall: ring over a pit, floating and drifting platforms, cannons, bomb crates, statues.
import { Node, Mesh, InstancedMesh, BasicMaterial, LitMaterial, GeoBuilder, box, cylinder, merge, extrude, plane, lathe, sphere, torus, Vec3, angleDiff, wrapAngle, TAU, makeRng } from './engine.js';
import { makeFlameMaterial, makeBillboardMaterial } from './graphics.js';
import { polar, Tower } from './tower.js';
// The guardian's hall inside the tower top: a wide stone ring floating over a bottomless pit.
// Floating platforms (two of them drifting up and down), cannons that fire at the guardian,
// bomb crates, fire bowls, colossal knight statues with burning eyes, pillars with torches and
// blood-lit windows far out in the dark. Uses the same collision API as the Tower.

const V = (x = 0, y = 0, z = 0) => new Vec3(x, y, z);
export const ARENA_RP = 7.0;      // the knight's walking radius in the hall
export const PIT_R = 5.35;
export const RING_OUT = 8.75;
export const CANNON_RELOAD = 15;
export const CRATE_RESPAWN = 11;
const HALL_R = 42;
const PILLAR_R = 35;
const STATUE_R = 31;
const RP = ARENA_RP;

// closed annular prism between two angles (floating platforms)
function sectorSlab(half, r0, r1, thick, tile = 2.0) {
    const b = new GeoBuilder();
    const segs = Math.max(3, Math.ceil(half * 2 / 0.05));
    const rows = [];
    const bev = Math.min(0.12, thick * 0.25);
    const rm = r0 + (r1 - r0) * 0.4;
    // cross-section (r, y, nr, ny) pairs: top, outer bevel, outer face, underside taper, inner face
    const prof = [
        [r0 + 0.05, 0, 0, 1], [r1 - bev, 0, 0, 1],
        [r1 - bev, 0, 0.7, 0.7], [r1, -bev, 0.7, 0.7],
        [r1, -bev, 1, 0], [r1, -thick * 0.55, 1, 0],
        [r1, -thick * 0.55, 0.45, -0.9], [rm, -thick * 1.4, 0.45, -0.9],
        [rm, -thick * 1.4, -0.6, -0.8], [r0, -thick * 0.5, -0.6, -0.8],
        [r0, -thick * 0.5, -1, 0], [r0, 0, -1, 0]
    ];
    for (let s = 0; s <= segs; s++) {
        const th = -half + (2 * half * s) / segs, sn = Math.sin(th), cs = Math.cos(th);
        const row = [];
        for (let k = 0; k < prof.length; k++) {
            const [r, y, nr, ny] = prof[k];
            const u = th * RP / tile, v = (k < 2 ? r / tile : (r - y) / tile);
            row.push(b.vert(sn * r, y, cs * r, sn * nr, ny, cs * nr, k < 2 ? th * r / tile : u, v));
        }
        rows.push(row);
    }
    for (let s = 0; s < segs; s++) for (let k = 0; k < prof.length; k += 2) {
        b.quad(rows[s][k], rows[s][k + 1], rows[s + 1][k + 1], rows[s + 1][k]);
    }
    for (const side of [-1, 1]) {
        const th = side * half, sn = Math.sin(th), cs = Math.cos(th);
        const nx = Math.cos(th) * side, nz = -Math.sin(th) * side;
        const pts = [[r0, 0], [r1 - bev, 0], [r1, -bev], [r1, -thick * 0.55], [rm, -thick * 1.4], [r0, -thick * 0.5]];
        const ids = pts.map(([r, y]) => b.vert(sn * r, y, cs * r, nx, 0, nz, r / tile, y / tile));
        for (let i = 1; i < ids.length - 1; i++) {
            if (side > 0) b.tri(ids[0], ids[i], ids[i + 1]); else b.tri(ids[0], ids[i + 1], ids[i]);
        }
    }
    return b.build();
}

function cageParts(h, r) {
    const parts = [];
    const n = 9;
    for (let i = 0; i < n; i++) {
        const a = (i / n) * TAU;
        parts.push({ geo: cylinder(0.035, 0.035, h, 5, 1), pos: V(Math.sin(a) * r, 0, Math.cos(a) * r) });
    }
    parts.push({ geo: torus(r, 0.05, 5, 18), pos: V(0, -h / 2, 0), rot: V(Math.PI / 2, 0, 0) });
    parts.push({ geo: torus(r, 0.05, 5, 18), pos: V(0, h / 2, 0), rot: V(Math.PI / 2, 0, 0) });
    parts.push({ geo: torus(r, 0.035, 5, 18), pos: V(0, 0, 0), rot: V(Math.PI / 2, 0, 0) });
    parts.push({ geo: lathe([[r + 0.02, 0], [r * 0.7, r * 0.45], [0.08, r * 0.7], [0.0, r * 0.72]], 12), pos: V(0, h / 2, 0) });
    parts.push({ geo: cylinder(r + 0.04, r + 0.04, 0.06, 14, 1), pos: V(0, -h / 2 - 0.02, 0) });
    return parts;
}
function prisonerParts(h) {
    const p = [];
    p.push({ geo: sphere(0.2, 10, 8), pos: V(0.04, -h / 2 + 0.62, 0.05), scale: V(0.95, 1, 1.05), rot: V(0.5, 0.3, 0.2) });
    p.push({ geo: box(0.18, 0.08, 0.14), pos: V(0.05, -h / 2 + 0.47, 0.14), rot: V(0.5, 0.3, 0) });
    for (let i = 0; i < 4; i++) p.push({ geo: torus(0.16 - i * 0.012, 0.022, 4, 12, Math.PI * 1.6), pos: V(0, -h / 2 + 0.38 - i * 0.07, 0), rot: V(Math.PI / 2 + 0.3, 0.94, 0), scale: V(1, 1, 0.8) });
    p.push({ geo: cylinder(0.03, 0.03, 0.45, 5, 1), pos: V(0.12, -h / 2 + 0.1, 0.12), rot: V(1.3, 0.4, 0) });
    p.push({ geo: cylinder(0.03, 0.03, 0.45, 5, 1), pos: V(-0.12, -h / 2 + 0.1, 0.1), rot: V(1.2, -0.3, 0) });
    return p;
}

// a colossal stone knight, sword planted in front, local +Z faces the pit
function statueParts() {
    const p = [];
    p.push({ geo: box(6, 2.4, 6), pos: V(0, 1.2, 0) });
    p.push({ geo: box(5.2, 0.6, 5.2), pos: V(0, 2.7, 0) });
    for (const s of [-1, 1]) {
        p.push({ geo: cylinder(0.9, 1.1, 6, 10, 1), pos: V(s * 1.1, 6, 0) });
        p.push({ geo: box(1.6, 0.8, 2.4), pos: V(s * 1.1, 3.4, 0.4) });
    }
    p.push({ geo: box(4.2, 2.4, 2.6), pos: V(0, 9.8, 0) });
    p.push({ geo: lathe([[2.3, 0], [2.6, 1.6], [2.4, 3.6], [1.7, 4.8], [0.9, 5.3]], 12), pos: V(0, 10.4, 0), scale: V(1, 1, 0.7) });
    for (const s of [-1, 1]) {
        p.push({ geo: sphere(1.25, 10, 8), pos: V(s * 2.7, 15.2, 0), scale: V(1, 0.85, 1) });
        p.push({ geo: cylinder(0.6, 0.55, 3.2, 8, 1), pos: V(s * 2.9, 13.4, 0.6), rot: V(-0.5, 0, s * 0.15) });
        p.push({ geo: cylinder(0.55, 0.5, 3.0, 8, 1), pos: V(s * 1.5, 11.6, 2.3), rot: V(-1.25, 0, s * -0.9) });
        p.push({ geo: sphere(0.7, 8, 6), pos: V(s * 0.45, 10.9, 3.2) });
    }
    // great helm
    p.push({ geo: cylinder(1.35, 1.45, 2.6, 12, 1), pos: V(0, 17.3, 0.1) });
    p.push({ geo: sphere(1.35, 12, 8, { thetaLength: Math.PI / 2 }), pos: V(0, 18.6, 0.1) });
    p.push({ geo: box(0.3, 2.6, 0.3), pos: V(0, 17.4, 1.45) });
    p.push({ geo: cylinder(0.12, 0.4, 2.2, 6, 1), pos: V(0, 20.4, -0.2), rot: V(-0.3, 0, 0) });
    // the sword, point down into the plinth
    p.push({ geo: box(0.9, 11, 0.25), pos: V(0, 5.8, 3.4) });
    p.push({ geo: box(4.2, 0.55, 0.7), pos: V(0, 11.5, 3.4) });
    p.push({ geo: cylinder(0.28, 0.28, 2.0, 8, 1), pos: V(0, 12.8, 3.4) });
    p.push({ geo: sphere(0.5, 8, 6), pos: V(0, 14.0, 3.4) });
    return p;
}

function cannonModel(M) {
    const n = new Node();
    const carriage = [];
    carriage.push({ geo: box(1.05, 0.34, 1.35), pos: V(0, 0.42, 0) });
    for (const s of [-1, 1]) carriage.push({ geo: box(0.12, 0.62, 1.2), pos: V(s * 0.46, 0.66, -0.02), rot: V(0.12, 0, 0) });
    n.add(new Mesh(merge(carriage), M.wood));
    const iron = [];
    for (const s of [-1, 1]) for (const z of [-0.45, 0.45]) {
        iron.push({ geo: cylinder(0.3, 0.3, 0.12, 12, 1), pos: V(s * 0.6, 0.3, z), rot: V(0, 0, Math.PI / 2) });
        iron.push({ geo: cylinder(0.08, 0.08, 0.16, 8, 1), pos: V(s * 0.62, 0.3, z), rot: V(0, 0, Math.PI / 2) });
    }
    iron.push({ geo: cylinder(0.05, 0.05, 1.1, 6, 1), pos: V(0, 0.3, -0.45), rot: V(0, 0, Math.PI / 2) });
    iron.push({ geo: cylinder(0.05, 0.05, 1.1, 6, 1), pos: V(0, 0.3, 0.45), rot: V(0, 0, Math.PI / 2) });
    n.add(new Mesh(merge(iron), M.iron));
    // barrel on a pivot (local +Z points at the pit)
    const pivot = new Node();
    pivot.position.set(0, 0.86, -0.05);
    const barrel = new Node();
    barrel.add(new Mesh(merge([
        { geo: cylinder(0.24, 0.31, 1.7, 14, 1), rot: V(Math.PI / 2, 0, 0), pos: V(0, 0, 0.35) },
        { geo: torus(0.25, 0.06, 6, 16), pos: V(0, 0, 1.2) },
        { geo: torus(0.3, 0.05, 6, 16), pos: V(0, 0, -0.1) },
        { geo: torus(0.32, 0.05, 6, 16), pos: V(0, 0, -0.45) },
        { geo: sphere(0.2, 10, 8), pos: V(0, 0, -0.6) },
        { geo: cylinder(0.05, 0.05, 0.9, 6, 1), rot: V(0, 0, Math.PI / 2) }
    ]), M.iron));
    barrel.add(new Mesh(merge([{ geo: cylinder(0.15, 0.15, 0.06, 12, 1), rot: V(Math.PI / 2, 0, 0), pos: V(0, 0, 1.24) }]), M.voidDark));
    pivot.add(barrel);
    n.add(pivot);
    n.pivot = pivot; n.barrel = barrel;
    return n;
}

function crateModel(M) {
    const n = new Node();
    n.add(new Mesh(merge([{ geo: box(0.9, 0.75, 0.9, 0.8), pos: V(0, 0.375, 0) }]), M.wood));
    n.add(new Mesh(merge([
        { geo: box(0.94, 0.08, 0.94), pos: V(0, 0.08, 0) },
        { geo: box(0.94, 0.08, 0.94), pos: V(0, 0.68, 0) },
        { geo: box(0.08, 0.75, 0.94), pos: V(0, 0.375, 0), rot: V(0, 0, 0.72) }
    ]), M.iron));
    return n;
}

export function bombModel(M) {
    const n = new Node();
    n.add(new Mesh(merge([
        { geo: sphere(0.27, 14, 10) },
        { geo: cylinder(0.1, 0.12, 0.1, 10, 1), pos: V(0, 0.28, 0) }
    ]), M.slate));
    n.add(new Mesh(cylinder(0.022, 0.022, 0.22, 5, 1), M.rust));
    n.children[1].position.set(0.05, 0.4, 0);
    n.children[1].rotation.set(0, 0, -0.5);
    return n;
}

export class BossArena {
    constructor(M, T, theme) {
        this.M = M; this.T = T;
        this.root = new Node();
        this.H = 12;
        this.theme = theme || { glow: [1, 0.25, 0.1], window: [1, 0.2, 0.08] };
        this.platforms = [];
        let id = 0;
        const add = (o) => { o.id = id++; o.active = true; o.dy = 0; o.arc = o.half * 2 * RP; this.platforms.push(o); return o; };
        this.ground = add({ theta: 0, half: Math.PI, y: 0, thick: 1, type: 'ground' });
        // cannon towers (high) with a step platform on each side, twice around the ring
        for (const base of [0, Math.PI]) {
            add({ theta: base, half: 1.3 / RP, y: 3.5, thick: 0.5, type: 'stone', high: true, r0: RP - 1.75 });
            for (const s of [-1, 1]) add({ theta: wrapAngle(base + s * 0.5), half: 1.2 / RP, y: 1.75, thick: 0.45, type: 'stone' });
        }
        // drifting platforms
        this.movers = [];
        for (const [th, ph] of [[2.1, 0], [wrapAngle(2.1 + Math.PI), Math.PI]]) {
            const p = add({ theta: th, half: 1.1 / RP, y: 1.75, thick: 0.4, type: 'stone', moving: true, phase: ph, base: 1.75 });
            this.movers.push(p);
        }
        this.cannons = [];
        this.crates = [];
        this.torches = [];
        this.bowls = [];
        this.cages = [];
        this._build(T);
    }

    // highest resting surface at an angle (moving platforms excluded)
    groundAt(theta, below = 99) {
        let best = 0;
        for (const p of this.platforms) {
            if (!p.active || p.moving || p.y > below) continue;
            if (Math.abs(angleDiff(theta, p.theta)) <= p.half && p.y > best) best = p.y;
        }
        return best;
    }

    _useRing(pos, color) {
        const m = new Mesh(this._quad || (this._quad = plane(1, 1)), new BasicMaterial({ map: this.T.warn, transparent: true, blending: 'additive', depthWrite: false, color, opacity: 0.5, renderOrder: 3 }));
        m.rotation.set(-Math.PI / 2, 0, 0);
        m.position.copy(pos);
        m.frustumCulled = false;
        this.root.add(m);
        return m;
    }

    _build(T) {
        const M = this.M;
        const rng = makeRng(2024);
        const CHAIN = torus(0.12, 0.038, 3, 6);
        // ---- ring walkway top
        const gb = new GeoBuilder();
        const segs = 160;
        for (let i = 0; i <= segs; i++) {
            const th = (i / segs) * TAU, s = Math.sin(th), c = Math.cos(th);
            gb.vert(s * PIT_R, 0, c * PIT_R, 0, 1, 0, s * PIT_R / 2.0, c * PIT_R / 2.0);
            gb.vert(s * RING_OUT, 0, c * RING_OUT, 0, 1, 0, s * RING_OUT / 2.0, c * RING_OUT / 2.0);
        }
        for (let i = 0; i < segs; i++) gb.quad(i * 2, i * 2 + 1, i * 2 + 3, i * 2 + 2);
        this.root.add(new Mesh(gb.build(), M.ground));
        // ---- underside: a stone funnel hanging over the abyss, with buttresses
        const under = lathe([[PIT_R + 0.02, -16], [PIT_R + 0.8, -9], [PIT_R + 1.6, -4.5], [RING_OUT + 0.4, -1.2], [RING_OUT + 0.6, -0.35], [RING_OUT + 0.6, 0.0]], 80);
        this.root.add(new Mesh(under, M.darkStone));
        this.root.add(new Mesh(merge([
            { geo: torus(PIT_R, 0.24, 6, 96), rot: V(Math.PI / 2, 0, 0), pos: V(0, 0.03, 0) },
            { geo: torus(RING_OUT + 0.35, 0.3, 6, 128), rot: V(Math.PI / 2, 0, 0), pos: V(0, 0.1, 0) }
        ]), M.trim));
        // ---- pit shaft and glow
        const innerWall = new LitMaterial({ map: T.wall.map, toon: true, toonKey: 1.2, toonPL: 1.0, toonSpec: 0, rimStrength: 0.1, toonAmb: [1.0, 0.02], color: [0.5, 0.42, 0.5], side: 'double', macro: true });
        this.innerWall = innerWall;
        const shaft = new Mesh(cylinder(PIT_R, PIT_R, 30, 64, 1, { openEnded: true, uRepeat: 8, vRepeat: 6 }), innerWall);
        shaft.position.y = -15;
        this.root.add(shaft);
        this.pitGlow = new Mesh(plane(1, 1), makeBillboardMaterial(T.glow, this.theme.glow, 'pitglow'));
        this.pitGlow.material.uniforms.uStrength = 1.3;
        this.pitGlow.scale.set(15, 15, 15);
        this.pitGlow.position.set(0, -9, 0);
        this.root.add(this.pitGlow);
        // ---- rune circle around the pit
        const rb = new GeoBuilder();
        const r0 = PIT_R + 0.35, r1 = PIT_R + 0.85;
        for (let i = 0; i <= segs; i++) {
            const th = (i / segs) * TAU, s = Math.sin(th), c = Math.cos(th);
            rb.vert(s * r0, 0.02, c * r0, 0, 1, 0, i / segs * 16, 0);
            rb.vert(s * r1, 0.02, c * r1, 0, 1, 0, i / segs * 16, 1);
        }
        for (let i = 0; i < segs; i++) rb.quad(i * 2, i * 2 + 1, i * 2 + 3, i * 2 + 2);
        this.runeMat = new BasicMaterial({ map: T.runeBand, transparent: true, blending: 'additive', depthWrite: false, color: this.theme.glow, opacity: 0.6, renderOrder: 3 });
        const runes = new Mesh(rb.build(), this.runeMat);
        runes.frustumCulled = false;
        this.root.add(runes);
        // ---- floating platforms (static ones merged, drifting ones separate) + levitation runes
        const slabParts = [];
        this.levMat = new BasicMaterial({ map: T.rune, transparent: true, blending: 'additive', depthWrite: false, color: this.theme.glow, opacity: 0.55, renderOrder: 3 });
        for (const p of this.platforms) {
            if (p.type !== 'stone') continue;
            const geo = sectorSlab(p.half, p.r0 || RP - 0.95, RP + 0.85, p.thick);
            const rune = new Mesh(this._quad || (this._quad = plane(1, 1)), this.levMat);
            rune.rotation.set(-Math.PI / 2, 0, 0);
            rune.scale.set(1.6, 1.6, 1.6);
            rune.frustumCulled = false;
            if (p.moving) {
                const m = new Mesh(geo, M.ledge);
                m.rotation.y = p.theta; m.position.y = p.y;
                p.mesh = m;
                this.root.add(m);
                rune.position.copy(polar(p.theta, RP, p.y - p.thick * 1.45));
                p.rune = rune;
            } else {
                slabParts.push({ geo, pos: V(0, p.y, 0), rot: V(0, p.theta, 0) });
                rune.position.copy(polar(p.theta, RP, p.y - p.thick * 1.45));
            }
            this.root.add(rune);
        }
        this.root.add(new Mesh(merge(slabParts), M.ledge));
        // ---- cannons: two on the high platforms, two on the open floor
        for (const [th, y] of [[0, 3.5], [Math.PI, 3.5], [Math.PI / 2, 0], [-Math.PI / 2, 0]]) {
            const node = cannonModel(M);
            const pos = polar(th, RP - 0.95, y);
            node.position.copy(pos);
            node.rotation.y = th + Math.PI;
            this.root.add(node);
            const c = { theta: th, y, node, ready: true, reload: 0, recoil: 0, elev: 0.55, pos, fuseT: 0, ring: this._useRing(polar(th, RP, y + 0.03), [1, 0.78, 0.3]) };
            c.ring.scale.set(1.9, 1.9, 1.9);
            this.cannons.push(c);
        }
        // ---- bomb crates
        for (const th of [1.05, wrapAngle(1.05 + Math.PI)]) {
            const node = crateModel(M);
            node.position.copy(polar(th, RP - 0.85, 0));
            node.rotation.y = th + 0.3;
            this.root.add(node);
            const bomb = bombModel(M);
            bomb.position.copy(polar(th, RP - 0.85, 1.05));
            this.root.add(bomb);
            const c = { theta: th, y: 0, node, bomb, hasBomb: true, respawn: 0, ring: this._useRing(polar(th, RP, 0.03), [1, 0.5, 0.2]) };
            c.ring.scale.set(1.7, 1.7, 1.7);
            this.crates.push(c);
        }
        // ---- fire bowls on the outer rim
        const bowlParts = [];
        for (const deg of [30, 110, 150, 210, 290, 330]) {
            const th = deg * Math.PI / 180;
            const p = polar(th, RING_OUT - 0.4, 0);
            bowlParts.push({ geo: lathe([[0.08, 0], [0.36, 0.06], [0.48, 0.22], [0.54, 0.44], [0.47, 0.46], [0.38, 0.32], [0.1, 0.28]], 14), pos: p });
            for (let k = 0; k < 3; k++) {
                const a = k / 3 * TAU + th;
                bowlParts.push({ geo: cylinder(0.035, 0.05, 0.3, 5, 1), pos: V(p.x + Math.sin(a) * 0.28, 0.12, p.z + Math.cos(a) * 0.28), rot: V(0.35 * Math.cos(a), 0, -0.35 * Math.sin(a)) });
            }
            this.bowls.push({ theta: th, pos: V(p.x, 0.58, p.z), phase: rng() * 10, light: { pos: V(p.x * 0.95, 1.6, p.z * 0.95), color: [0, 0, 0], range: 9.5 } });
        }
        this.root.add(new Mesh(merge(bowlParts), M.iron));
        const coal = [];
        for (const b of this.bowls) for (let k = 0; k < 5; k++) coal.push({ geo: sphere(0.14, 6, 4), pos: V(b.pos.x + (rng() - 0.5) * 0.4, 0.42, b.pos.z + (rng() - 0.5) * 0.4) });
        this.root.add(new Mesh(merge(coal), new BasicMaterial({ color: [1, 0.35, 0.08] })));
        // ---- the hall: pillars with torches, colossal statues, blood windows
        const pillarParts = [], windowParts = [], brParts = [], statueList = [], eyeParts = [];
        const nP = 12;
        for (let i = 0; i < nP; i++) {
            const th = (i + 0.5) / nP * TAU;
            const pp = polar(th, PILLAR_R, 0);
            pillarParts.push({ geo: cylinder(1.7, 2.0, 110, 12, 1, { uRepeat: 2, vRepeat: 26 }), pos: V(pp.x, 0, pp.z) });
            for (const yy of [-8, 20]) pillarParts.push({ geo: box(4.4, 1.4, 4.4), pos: V(pp.x, yy, pp.z), rot: V(0, th, 0) });
            const tp = polar(th, PILLAR_R - 2.15, 6.5);
            this.torches.push({ theta: th, y: 6.5, pos: V(tp.x, 6.8, tp.z), phase: rng() * 10 });
            brParts.push({ geo: box(0.4, 0.6, 0.12), pos: polar(th, PILLAR_R - 1.95, 6.2), rot: V(0, th, 0) });
            brParts.push({ geo: cylinder(0.2, 0.1, 0.3, 8, 1), pos: polar(th, PILLAR_R - 2.15, 6.6) });
            const tw = th + Math.PI / nP;
            windowParts.push({ geo: extrude([[-2.1, 0], [2.1, 0], [2.1, 10], [1.3, 12.2], [0, 13.2], [-1.3, 12.2], [-2.1, 10]], 0.3), pos: polar(tw, HALL_R - 0.25, -2), rot: V(0, tw + Math.PI, 0) });
        }
        for (let i = 0; i < 6; i++) {
            const th = i / 6 * TAU;
            const base = polar(th, STATUE_R, -3);
            const rot = th + Math.PI;
            for (const part of statueParts()) {
                const lp = part.pos || V();
                // rotate the local offset around Y and place it on the ring
                const c = Math.cos(rot), s = Math.sin(rot);
                statueList.push({ geo: part.geo, pos: V(base.x + lp.x * c + lp.z * s, base.y + lp.y, base.z - lp.x * s + lp.z * c), rot: V(part.rot ? part.rot.x : 0, rot + (part.rot ? part.rot.y : 0), part.rot ? part.rot.z : 0), scale: part.scale });
            }
            for (const sx of [-1, 1]) {
                const lp = V(sx * 0.55, 17.6, 1.42), c = Math.cos(rot), s = Math.sin(rot);
                eyeParts.push({ geo: box(0.55, 0.16, 0.1), pos: V(base.x + lp.x * c + lp.z * s, base.y + lp.y, base.z - lp.x * s + lp.z * c), rot: V(0, rot, sx * 0.18) });
            }
        }
        this.root.add(new Mesh(merge(pillarParts), M.darkStone));
        this.root.add(new Mesh(merge(statueList), M.darkStone));
        this.statueEyes = new BasicMaterial({ color: this.theme.window, fogScale: 0.4 });
        this.root.add(new Mesh(merge(eyeParts), this.statueEyes));
        this.root.add(new Mesh(merge(brParts), M.iron));
        this.winMat = new BasicMaterial({ color: this.theme.window, fogScale: 0.5 });
        this.root.add(new Mesh(merge(windowParts), this.winMat));
        const hallWall = new Mesh(cylinder(HALL_R, HALL_R, 120, 80, 1, { openEnded: true, uRepeat: 30, vRepeat: 18 }), this.innerWall);
        hallWall.position.y = 10;
        this.root.add(hallWall);
        // ---- hanging cages high above
        for (let i = 0; i < 7; i++) {
            const th = (i / 7) * TAU + 0.3 + rng() * 0.4;
            const dist = 11 + rng() * 9;
            const cy = 16 + rng() * 6;
            const cage = new Node();
            cage.position.copy(polar(th, dist, cy));
            const h = 1.7;
            cage.add(new Mesh(merge(cageParts(h, 0.62)), M.iron));
            if (i % 2 === 0) cage.add(new Mesh(merge(prisonerParts(h)), M.bone));
            const links = [];
            for (let y = h / 2 + 0.4; y < 36 - cy; y += 0.34) links.push({ geo: CHAIN, pos: V(0, y, 0), rot: V(0, Math.round(y / 0.34) % 2 ? Math.PI / 2 : 0, Math.PI / 2) });
            cage.add(new Mesh(merge(links), M.iron));
            cage.phase = rng() * 10;
            this.root.add(cage);
            this.cages.push(cage);
        }
        // ---- flames + glows (hall torches, fire bowls, candles)
        const candleParts = [], candleFlames = [];
        for (let k = 0; k < 10; k++) {
            const th = rng() * TAU;
            const base = polar(th, RING_OUT - 0.35 - rng() * 0.3, 0);
            const n = 2 + Math.floor(rng() * 3);
            for (let j = 0; j < n; j++) {
                const hgt = 0.18 + rng() * 0.32;
                const off = V((rng() - 0.5) * 0.45, 0, (rng() - 0.5) * 0.45);
                candleParts.push({ geo: cylinder(0.05, 0.055, hgt, 7, 1), pos: V(base.x + off.x, hgt / 2, base.z + off.z) });
                candleFlames.push(V(base.x + off.x, hgt + 0.07, base.z + off.z));
            }
        }
        this.root.add(new Mesh(merge(candleParts), M.candle));
        const nF = this.torches.length + this.bowls.length + candleFlames.length;
        this.flames = new InstancedMesh(plane(1, 1), makeFlameMaterial(), nF);
        this.glows = new InstancedMesh(plane(1, 1), makeBillboardMaterial(T.glow, [1.0, 0.5, 0.16], 'glowbb'), nF);
        this.glows.material.uniforms.uStrength = 0.6;
        let fi = 0;
        for (const t of this.torches) { this.flames.setAt(fi, t.pos, V(), V(1.3, 1.3, 1.3), [t.phase, 0, 0]); this.glows.setAt(fi, t.pos, V(), V(6, 6, 6), [1, 1, 1]); fi++; }
        for (const b of this.bowls) { this.flames.setAt(fi, V(b.pos.x, b.pos.y + 0.25, b.pos.z), V(), V(1.0, 1.0, 1.0), [b.phase, 0, 0]); this.glows.setAt(fi, V(b.pos.x, b.pos.y + 0.3, b.pos.z), V(), V(3.4, 3.4, 3.4), [1, 1, 1]); fi++; }
        for (const c of candleFlames) { this.flames.setAt(fi, c, V(), V(0.12, 0.12, 0.12), [rng(), 0, 0]); this.glows.setAt(fi, c, V(), V(0.6, 0.6, 0.6), [1, 1, 1]); fi++; }
        this.flames.count = fi; this.glows.count = fi;
        this.root.add(this.flames, this.glows);
        // ---- bones, skulls and old blood on the ring
        const boneParts = [];
        for (let i = 0; i < 50; i++) {
            const th = rng() * TAU, r = rng() < 0.5 ? PIT_R + 0.95 + rng() * 0.35 : RING_OUT - 0.55 - rng() * 0.5;
            const p = polar(th, r, 0.05);
            if (rng() < 0.3) boneParts.push({ geo: sphere(0.14, 8, 6), pos: V(p.x, 0.12, p.z), scale: V(1, 0.9, 1.15), rot: V(0, rng() * 6, 0) });
            else boneParts.push({ geo: cylinder(0.03, 0.03, 0.45, 5, 1), pos: p, rot: V(Math.PI / 2, rng() * 6, 0) });
        }
        this.root.add(new Mesh(merge(boneParts), M.bone));
        const db = new GeoBuilder();
        for (const p of this.platforms) {
            if (p.type !== 'stone' || p.moving || p.y > 2) continue;
            const base = db.vcount, n = 10;
            for (let i = 0; i <= n; i++) {
                const th = p.theta - p.half + (2 * p.half * i) / n, sn = Math.sin(th), cs = Math.cos(th);
                db.vert(sn * (RP - 0.9), 0.012, cs * (RP - 0.9), 0, 1, 0, i / n, 0.3);
                db.vert(sn * (RP + 0.9), 0.012, cs * (RP + 0.9), 0, 1, 0, i / n, 0.3);
            }
            for (let i = 0; i < n; i++) db.quad(base + i * 2, base + i * 2 + 1, base + i * 2 + 3, base + i * 2 + 2);
        }
        const dec = new Mesh(db.build(), M.decal);
        dec.frustumCulled = false;
        this.root.add(dec);
        const stainMat = new BasicMaterial({ map: T.shadow, transparent: true, opacity: 0.7, depthWrite: false, color: [0.28, 0.02, 0.03], renderOrder: -1 });
        const sb = [];
        for (let i = 0; i < 14; i++) {
            const th = rng() * TAU, r = PIT_R + 0.8 + rng() * 2.4, s = 0.8 + rng() * 1.4;
            sb.push({ geo: plane(s, s * (0.6 + rng() * 0.6)), pos: polar(th, r, 0.015), rot: V(-Math.PI / 2, 0, rng() * 3) });
        }
        const stains = new Mesh(merge(sb), stainMat);
        stains.frustumCulled = false;
        this.root.add(stains);
    }

    // ready cannon the knight can use from here (same level, within reach)
    cannonAt(theta, y) {
        for (const c of this.cannons) {
            if (!c.ready) continue;
            if (Math.abs(angleDiff(theta, c.theta)) * RP < 1.0 && Math.abs(y - c.y) < 0.4) return c;
        }
        return null;
    }
    crateAt(theta, y) {
        for (const c of this.crates) {
            if (!c.hasBomb) continue;
            if (Math.abs(angleDiff(theta, c.theta)) * RP < 0.9 && Math.abs(y - c.y) < 0.5) return c;
        }
        return null;
    }
    muzzle(c, out = new Vec3()) {
        const inward = V(-Math.sin(c.theta), 0, -Math.cos(c.theta));
        const ce = Math.cos(c.elev), se = Math.sin(c.elev);
        return out.set(c.pos.x + inward.x * (1.25 * ce - 0.05), c.pos.y + 0.86 + 1.25 * se, c.pos.z + inward.z * (1.25 * ce - 0.05));
    }

    setTheme(theme) {
        this.theme = theme;
        this.pitGlow.material.uniforms.uColor = theme.glow;
        this.runeMat.color = theme.glow;
        this.levMat.color = theme.glow;
        this.winMat.color = theme.window;
        this.statueEyes.color = theme.window;
    }

    update(dt, time, enraged, aimY) {
        const s = 15 * (1 + Math.sin(time * 1.7) * 0.06) * (enraged ? 1.25 : 1);
        this.pitGlow.scale.set(s, s, s);
        this.runeMat.opacity = (enraged ? 0.75 : 0.45) + Math.sin(time * (enraged ? 6 : 2.2)) * 0.2;
        this.levMat.opacity = 0.45 + Math.sin(time * 3.1) * 0.15;
        // the stone knights' eyes flare when the guardian enrages
        const eg = enraged ? 2.0 + Math.sin(time * 5) * 0.6 : 1, w = this.theme.window, se = this.statueEyes.color;
        se[0] = w[0] * eg; se[1] = w[1] * eg; se[2] = w[2] * eg;
        for (const c of this.cages) {
            c.rotation.z = Math.sin(time * 0.6 + c.phase) * 0.035;
            c.rotation.x = Math.sin(time * 0.45 + c.phase * 1.7) * 0.03;
            c.rotation.y = Math.sin(time * 0.2 + c.phase) * 0.3;
        }
        for (const b of this.bowls) {
            const f = 0.8 + 0.12 * Math.sin(time * 11 + b.phase) + 0.08 * Math.sin(time * 23 + b.phase * 3);
            b.light.color = [4.4 * f, 1.8 * f, 0.5 * f];
        }
        // drifting platforms
        for (const p of this.movers) {
            const ny = p.base + Math.sin(time * 0.75 + p.phase) * 1.05;
            p.dy = ny - p.y;
            p.y = ny;
            p.mesh.position.y = ny;
            p.rune.position.y = ny - p.thick * 1.45;
        }
        // cannons: reload, recoil, aim the barrel up at the guardian
        for (const c of this.cannons) {
            if (!c.ready) { c.reload -= dt; if (c.reload <= 0) { c.ready = true; c.justLoaded = true; } }
            c.recoil = Math.max(0, c.recoil - dt * 2.5);
            const want = aimY !== undefined ? Math.atan2(aimY - (c.y + 0.9), c.pos.length() * 0.9) : 0.55;
            c.elev += (Math.max(0.15, Math.min(1.1, want)) - c.elev) * Math.min(1, dt * 4);
            c.node.pivot.rotation.x = -c.elev;
            c.node.barrel.position.z = -c.recoil * 0.45;
            c.node.position.copy(c.pos);
            c.ring.material.opacity = c.ready ? 0.4 + Math.sin(time * 5 + c.theta) * 0.25 : 0.0;
        }
        for (const c of this.crates) {
            if (!c.hasBomb) { c.respawn -= dt; if (c.respawn <= 0) { c.hasBomb = true; c.bomb.visible = true; c.bomb.scale.set(0.01, 0.01, 0.01); c.grow = 0; } }
            if (c.grow !== undefined && c.grow < 1) { c.grow = Math.min(1, c.grow + dt * 3); const k = c.grow * (1 + Math.sin(c.grow * Math.PI) * 0.3); c.bomb.scale.set(k, k, k); }
            c.bomb.position.y = c.y + 1.05 + Math.sin(time * 3 + c.theta) * 0.05;
            c.bomb.rotation.y = time * 0.8;
            c.ring.material.opacity = c.hasBomb ? 0.35 + Math.sin(time * 5 + c.theta) * 0.2 : 0.0;
        }
    }
}

// share the collision helpers with the tower
BossArena.prototype.findLanding = Tower.prototype.findLanding;
BossArena.prototype.stillOn = Tower.prototype.stillOn;
BossArena.prototype.groundBelow = Tower.prototype.groundBelow;
BossArena.prototype.stepOn = function () { return false; };