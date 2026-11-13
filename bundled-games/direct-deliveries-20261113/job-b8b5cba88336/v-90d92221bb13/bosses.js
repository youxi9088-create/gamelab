// The three guardians, their attacks and hazards, and the cannonballs and bombs thrown at them.
import { Node, Mesh, LitMaterial, BasicMaterial, box, cylinder, sphere, torus, lathe, extrude, plane, GeoBuilder, Vec3, angleDiff, wrapAngle, clamp, damp, dampAngle, lerp, TAU, hexColor, toonify, makeToonMaterials } from './engine.js';
import { PATH, polar } from './tower.js';
// Tower guardians fought in the hall at the top of every tower, plus their attack hazards:
// floor telegraphs, rolling/crawling ring hazards, falling hazards and aimed shots.

const V = (x = 0, y = 0, z = 0) => new Vec3(x, y, z);
// one shared quad for every floor decal (never disposed)
let QUAD = null;
const quad = () => { if (!QUAD) { QUAD = plane(1, 1); QUAD.shared = true; } return QUAD; };
const PAINT = {};
function paint(hex) { return PAINT[hex] || (PAINT[hex] = new LitMaterial({ color: hexColor(hex) })); }
const GLOW = {};
function glow(rgb) { const k = rgb.join(','); return GLOW[k] || (GLOW[k] = new BasicMaterial({ color: rgb })); }
function mesh(geo, mat, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1) {
    const m = new Mesh(geo, typeof mat === 'number' ? paint(mat) : mat);
    m.position.set(x, y, z); m.rotation.set(rx, ry, rz); m.scale.set(sx, sy, sz);
    return m;
}
function node(x = 0, y = 0, z = 0) { const n = new Node(); n.position.set(x, y, z); return n; }
const ease = (u) => u * u * (3 - 2 * u);

// place a unit-length (along +Y) node between points a and b (same parent space)
function orientBetween(obj, a, b, baseLen = 1) {
    const dx = b.x - a.x, dy = b.y - a.y, dz = b.z - a.z;
    const len = Math.hypot(dx, dy, dz) || 1e-4;
    obj.position.set((a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2);
    obj.rotation.set(Math.acos(clamp(dy / len, -1, 1)), Math.atan2(dx, dz), 0);
    obj.scale.set(1, len / baseLen, 1);
}

// two-bone IK: returns elbow position; clamps T if out of reach (T is modified)
function ik2(S, T, L1, L2, pole, E) {
    let dx = T.x - S.x, dy = T.y - S.y, dz = T.z - S.z;
    let d = Math.hypot(dx, dy, dz) || 1e-4;
    const maxD = L1 + L2 - 0.01, minD = Math.abs(L1 - L2) + 0.05;
    const dd = clamp(d, minD, maxD);
    dx /= d; dy /= d; dz /= d;
    if (dd !== d) { T.set(S.x + dx * dd, S.y + dy * dd, S.z + dz * dd); d = dd; }
    const a = (L1 * L1 - L2 * L2 + d * d) / (2 * d);
    const h = Math.sqrt(Math.max(0, L1 * L1 - a * a));
    const pd = pole.x * dx + pole.y * dy + pole.z * dz;
    let px = pole.x - dx * pd, py = pole.y - dy * pd, pz = pole.z - dz * pd;
    const pl = Math.hypot(px, py, pz) || 1; px /= pl; py /= pl; pz /= pl;
    return E.set(S.x + dx * a + px * h, S.y + dy * a + py * h, S.z + dz * a + pz * h);
}

// ============================================================================ hazards
// shared open cylinder for the light columns over telegraphs (never disposed)
const BEAM_H = 7;
let BEAM = null;
const beamGeo = () => { if (!BEAM) { BEAM = cylinder(1, 1, BEAM_H, 20, 1, { openEnded: true, uRepeat: 2 }); BEAM.shared = true; } return BEAM; };

export class Telegraph {
    constructor(parent, tex, theta, dur, size, color, y = 0) {
        this.mat = new BasicMaterial({ map: tex, transparent: true, blending: 'additive', depthWrite: false, color: color || [1, 0.2, 0.1], renderOrder: 4 });
        this.mesh = new Mesh(quad(), this.mat);
        this.mesh.rotation.set(-Math.PI / 2, 0, 0);
        this.mesh.position.copy(polar(theta, PATH.r, y + 0.04));
        this.mesh.frustumCulled = false;
        this.parent = parent; parent.add(this.mesh);
        this.theta = theta; this.t = 0; this.dur = dur; this.size = size; this.y = y;
        this.done = false; this.cancelled = false;
        // a column of light so an incoming blow reads from anywhere in the hall
        this.beam = null;
        if (Telegraph.beamTex) {
            this.beamMat = new BasicMaterial({ map: Telegraph.beamTex, transparent: true, blending: 'additive', depthWrite: false, side: 'double', color: color || [1, 0.2, 0.1], opacity: 0, renderOrder: 4 });
            this.beam = new Mesh(beamGeo(), this.beamMat);
            this.beam.position.copy(polar(theta, PATH.r, y + BEAM_H / 2));
            this.beam.frustumCulled = false;
            parent.add(this.beam);
        }
    }
    update(dt) {
        if (this.cancelled) return true;
        this.t += dt;
        const u = Math.min(1, this.t / this.dur);
        const s = this.size * (1.35 - 0.35 * u * u);
        this.mesh.scale.set(s, s, s);
        this.mesh.rotation.z = this.t * 1.5;
        this.mat.opacity = 0.45 + 0.55 * u + Math.sin(this.t * (10 + u * 26)) * 0.25 * u;
        if (this.beam) {
            const r = this.size * 0.3 * (1.3 - 0.5 * u);
            this.beam.scale.set(r, 1, r);
            this.beam.rotation.y = this.t * 0.8;
            this.beamMat.opacity = (0.2 + 0.8 * u * u) * (0.85 + Math.sin(this.t * 30) * 0.15 * u);
        }
        if (u >= 1) this.done = true;
        return this.done;
    }
    // the guardian was knocked out of its attack
    cancel() { this.cancelled = true; this.done = true; }
    remove() { this.parent.remove(this.mesh); if (this.beam) this.parent.remove(this.beam); }
}
Telegraph.beamTex = null;

// Lingering ground hazard (poison puddles, burning ground)
export class Pool {
    constructor(parent, tex, o) {
        this.theta = o.theta; this.y = o.y || 0; this.half = o.half || 0.8; this.life = o.life || 3.5; this.t = 0; this.alive = true;
        this.kind = o.kind || 'poison';
        this.mat = new BasicMaterial({ map: tex, transparent: true, blending: 'additive', depthWrite: false, color: o.color || [0.3, 1, 0.2], renderOrder: 4 });
        this.mesh = new Mesh(quad(), this.mat);
        this.mesh.rotation.set(-Math.PI / 2, 0, 0);
        this.mesh.position.copy(polar(this.theta, PATH.r, this.y + 0.03));
        this.mesh.frustumCulled = false;
        this.parent = parent; parent.add(this.mesh);
    }
    update(dt, ctx) {
        this.t += dt;
        const grow = Math.min(1, this.t / 0.25), fade = Math.min(1, (this.life - this.t) / 0.6);
        const s = this.half * 2.3 * grow * (1 + Math.sin(this.t * 5) * 0.04);
        this.mesh.scale.set(s, s, s);
        this.mesh.rotation.z = -this.t * 0.6;
        this.mat.opacity = Math.max(0, 0.75 * fade);
        if (Math.random() < 0.25) {
            const p = polar(this.theta + (Math.random() - 0.5) * this.half * 1.6 / PATH.r, PATH.r + (Math.random() - 0.5) * 1.2, this.y + 0.05);
            ctx.fx.emit('soul', p.x, p.y, p.z, 0, 0.8, 0, 0.9);
        }
        if (this.t >= this.life) this.alive = false;
    }
    hits(P) {
        if (this.t < 0.25 || this.t > this.life - 0.4) return false;
        const d = Math.abs(angleDiff(P.theta, this.theta)) * PATH.r;
        return d < this.half && P.y < this.y + 0.25 && P.y >= this.y - 0.3;
    }
    remove() { this.parent.remove(this.mesh); }
}

function flamingSkull(scale, fireCol) {
    const n = node();
    n.add(mesh(sphere(0.42, 12, 10), 0xeee2c4, 0, 0.05, 0, 0, 0, 0, 1, 0.95, 1.05));
    n.add(mesh(box(0.5, 0.18, 0.4), 0xeee2c4, 0, -0.22, 0.12));
    for (const s of [-1, 1]) {
        n.add(mesh(sphere(0.13, 8, 6), glow([0.05, 0.01, 0.02]), s * 0.16, 0.05, 0.34));
        n.add(mesh(sphere(0.06, 6, 4), glow(fireCol), s * 0.16, 0.04, 0.4));
    }
    n.scale.set(scale, scale, scale);
    return n;
}
function spiderlingModel() {
    const n = node();
    n.add(mesh(sphere(1, 10, 8), 0x3a2448, 0, 0.18, -0.12, 0, 0, 0, 0.22, 0.2, 0.28));
    n.add(mesh(sphere(0.14, 8, 6), 0x3a2448, 0, 0.14, 0.16));
    for (const s of [-1, 1]) n.add(mesh(sphere(0.045, 6, 4), glow([1, 0.15, 0.08]), s * 0.06, 0.2, 0.28));
    n.legs = [];
    for (let i = 0; i < 8; i++) {
        const s = i < 4 ? 1 : -1, k = i % 4;
        const l = node(s * 0.1, 0.16, 0.12 - k * 0.1);
        l.add(mesh(cylinder(0.02, 0.014, 0.34, 4, 1), 0x2a1838, s * 0.15, 0.02, 0, 0, 0, s * -1.1));
        n.add(l); n.legs.push(l);
    }
    return n;
}

// Things that travel along the ring walkway (jump over them or slash them)
let RTOON = null;
const rtoon = () => RTOON || (RTOON = makeToonMaterials({ key: 3.0, rim: 0.5, spec: 0.5, outlineWidth: 0.022 }));
export class Runner {
    constructor(parent, o) {
        this.kind = o.kind; this.theta = o.theta; this.dir = o.dir; this.speed = o.speed; this.y = o.y || 0;
        this.t = 0; this.life = o.life || (TAU * PATH.r * 0.9) / o.speed; this.alive = true;
        this.root = new Node();
        this.killable = o.kind === 'skull' || o.kind === 'spiderling';
        this.half = o.kind === 'fire' ? 0.55 : o.kind === 'shock' ? 0.45 : 0.35;
        this.h = o.kind === 'fire' ? 1.15 : o.kind === 'shock' ? 0.55 : 0.6;
        if (o.kind === 'skull') { this.model = flamingSkull(0.9, [1, 0.5, 0.1]); this.root.add(this.model); this.y = 0.38; }
        else if (o.kind === 'spiderling') { this.model = spiderlingModel(); this.model.scale.set(1.5, 1.5, 1.5); this.root.add(this.model); }
        else if (o.kind === 'shock') {
            this.model = mesh(torus(0.5, 0.12, 6, 18, Math.PI), glow([0.75, 0.4, 1.0]), 0, 0, 0, 0, Math.PI / 2, 0);
            this.root.add(this.model);
        }
        if (this.model && o.kind !== 'shock') toonify(this.model, rtoon());
        // optional launch arc (spat out by the boss, lands on the ring, then runs)
        this.fly = null;
        if (o.from) {
            const land = polar(o.theta, PATH.r, this.y);
            this.fly = { t: 0, dur: o.flyTime || 0.75, from: o.from.clone(), to: land, arc: o.arc || 3.5 };
            this.root.position.copy(o.from);
        }
        this.parent = parent; parent.add(this.root);
        this.light = o.kind === 'fire' ? { pos: new Vec3(), color: [5, 2, 0.4], range: 7 } : null;
    }
    get armed() { return !this.fly; }
    update(dt, ctx) {
        if (this.fly) {
            const f = this.fly;
            f.t += dt;
            const u = Math.min(1, f.t / f.dur);
            const x = lerp(f.from.x, f.to.x, u), z = lerp(f.from.z, f.to.z, u);
            const y = lerp(f.from.y, f.to.y, u) + Math.sin(u * Math.PI) * f.arc;
            this.root.position.set(x, y, z);
            if (this.model) this.model.rotation.x += dt * 12;
            if (this.kind === 'skull' && Math.random() < 0.9) ctx.fx.emit('fire', x, y + 0.2, z, (Math.random() - 0.5), 1.0, (Math.random() - 0.5), 1.3);
            if (u >= 1) {
                this.fly = null;
                ctx.fx.burst('dust', f.to, 10, { radius: 0.3 });
                if (this.kind === 'skull') ctx.fx.burst('fire', f.to, 8);
                ctx.audio && ctx.audio.sfx('land', 10);
            }
            return;
        }
        this.t += dt;
        this.theta = wrapAngle(this.theta + this.dir * this.speed * dt / PATH.r);
        const p = polar(this.theta, PATH.r, this.y);
        this.root.position.copy(p);
        this.root.rotation.y = this.theta + this.dir * Math.PI / 2;
        if (this.kind === 'skull') {
            this.model.rotation.x += dt * this.speed / 0.4;
            if (Math.random() < 0.8) ctx.fx.emit('fire', p.x, p.y + 0.2, p.z, (Math.random() - 0.5), 1.2, (Math.random() - 0.5), 1.1);
        } else if (this.kind === 'spiderling') {
            this.model.legs.forEach((l, i) => { l.rotation.x = Math.sin(this.t * 30 + i * 1.7) * 0.5; });
            this.root.position.y = this.y + Math.abs(Math.sin(this.t * 24)) * 0.05;
        } else if (this.kind === 'fire') {
            for (let k = 0; k < 3; k++) {
                const off = (Math.random() - 0.5) * 0.9;
                const q = polar(this.theta + off / PATH.r, PATH.r + (Math.random() - 0.5) * 0.8, Math.random() * 0.3);
                ctx.fx.emit('fire', q.x, q.y, q.z, 0, 2.5 + Math.random() * 2, 0, 2.2);
            }
            this.light.pos.set(p.x, 0.8, p.z);
        } else if (this.kind === 'shock') {
            const s = 1 + Math.sin(this.t * 30) * 0.1;
            this.model.scale.set(s, s, s);
            if (Math.random() < 0.6) ctx.fx.emit('magic', p.x, 0.1, p.z, 0, 1.5, 0, 1.2);
        }
        const fade = Math.min(1, (this.life - this.t) * 2);
        if (fade <= 0) this.alive = false;
    }
    hits(P) {
        if (this.fly) return false;
        const d = Math.abs(angleDiff(P.theta, this.theta)) * PATH.r;
        const base = this.kind === 'skull' ? this.y - 0.38 : this.y;
        return d < this.half + 0.25 && P.y < base + this.h && P.y + 1.3 > base - 0.1;
    }
    kill(ctx) {
        if (!this.alive) return;
        this.alive = false;
        const p = this.root.position.clone(); p.y += 0.3;
        if (this.kind === 'skull') { ctx.fx.chunk(p, 8, [0.93, 0.88, 0.76], 0.1, 3.5); ctx.fx.burst('fire', p, 10); }
        else ctx.fx.burst('puff', p, 10, { radius: 0.2 });
    }
    remove() { this.parent.remove(this.root); }
}

// Things that drop from above onto a telegraphed spot
export class Faller {
    constructor(parent, tex, o) {
        this.kind = o.kind; this.theta = o.theta; this.delay = o.delay || 1.0; this.t = 0; this.state = 'warn'; this.alive = true;
        this.onImpact = o.onImpact || null;
        this.gy = o.gy || 0;
        const col = o.kind === 'poison' || o.kind === 'egg' ? [0.35, 1, 0.25] : o.kind === 'meteor' ? [1, 0.45, 0.05] : [1, 0.22, 0.08];
        this.tele = new Telegraph(parent, tex, o.theta, this.delay, 1.9, col, this.gy);
        this.root = new Node();
        if (o.kind === 'bone') {
            this.root.add(mesh(cylinder(0.12, 0.12, 1.3, 8, 1), 0xefe3c6, 0, 0, 0, 0, 0, Math.PI / 2));
            for (const s of [-1, 1]) this.root.add(mesh(sphere(0.2, 8, 6), 0xefe3c6, s * 0.66, 0, 0));
        } else if (o.kind === 'egg') {
            this.root.add(mesh(sphere(1, 12, 10), 0xd8e8c0, 0, 0, 0, 0, 0, 0, 0.36, 0.46, 0.36));
            this.root.add(mesh(sphere(0.12, 6, 4), glow([0.4, 1, 0.3]), 0, 0.1, 0.3));
        } else if (o.kind === 'meteor') {
            this.root.add(mesh(sphere(0.45, 8, 6), 0x3a1e18));
            this.root.add(mesh(sphere(0.3, 8, 6), glow([1, 0.55, 0.12]), 0.12, 0.12, 0.25));
        } else {
            this.root.add(mesh(sphere(0.28, 10, 8), glow([0.45, 1, 0.3]), 0, 0, 0, 0, 0, 0, 1, 1.4, 1));
        }
        this.root.visible = false;
        this.parent = parent; parent.add(this.root);
    }
    update(dt, ctx) {
        this.t += dt;
        if (this.state === 'warn') {
            this.tele.update(dt);
            if (this.t >= this.delay - 0.32) { this.state = 'fall'; this.root.visible = true; this.fallT = 0; }
        }
        if (this.state === 'fall') {
            this.tele.update(dt);
            this.fallT += dt;
            const u = Math.min(1, this.fallT / 0.32);
            const p = polar(this.theta, PATH.r, lerp(this.gy + 11, this.gy + 0.3, u * u));
            this.root.position.copy(p);
            this.root.rotation.set(this.fallT * 9, this.fallT * 5, 0);
            if (this.kind === 'meteor' && Math.random() < 0.9) ctx.fx.emit('fire', p.x, p.y + 0.3, p.z, 0, 2, 0, 1.6);
            if (u >= 1) { this.state = 'done'; this.impact(ctx); }
        }
    }
    impact(ctx) {
        this.alive = false;
        const p = polar(this.theta, PATH.r, this.gy + 0.3);
        if (this.kind === 'bone') { ctx.fx.chunk(p, 10, [0.93, 0.88, 0.76], 0.12, 4); ctx.fx.burst('dust', p, 12, { radius: 0.4 }); }
        else if (this.kind === 'egg') { ctx.fx.chunk(p, 8, [0.85, 0.92, 0.75], 0.09, 3); ctx.fx.burst('soul', p, 8); }
        else if (this.kind === 'meteor') { ctx.fx.burst('fire', p, 22, { speed: 1.6 }); ctx.fx.burst('spark', p, 16); ctx.fx.burst('smoke', p, 6); }
        else { ctx.fx.burst('soul', p, 14, { col: [0.5, 1, 0.3], col2: [0.1, 0.4, 0.1] }); }
        ctx.impact(this.theta, 0.95, 1.4, this.kind === 'poison' ? 'poison' : this.kind === 'meteor' ? 'fire' : this.kind === 'egg' ? 'spider' : 'boss', this.gy);
        ctx.audio && ctx.audio.sfx(this.kind === 'egg' ? 'hatch' : 'boom');
        if (this.kind === 'poison') ctx.pool({ theta: this.theta, y: this.gy, half: 0.85, life: 3.2 });
        if (this.kind === 'meteor') ctx.pool({ theta: this.theta, y: this.gy, half: 0.75, life: 2.2, kind: 'fire', color: [1, 0.4, 0.05] });
        if (this.onImpact) this.onImpact(this);
    }
    remove() { this.tele.remove(); this.parent.remove(this.root); }
}

// Aimed projectiles that fly outward from the boss (parry them with the sword;
// parried fireballs and skulls fly back and wound the boss)
export class Shot {
    constructor(parent, glowMat, o) {
        this.kind = o.kind; this.pos = o.from.clone(); this.alive = true; this.t = 0;
        this.reflected = false;
        this.reflectable = o.kind === 'fire' || o.kind === 'skull';
        const d = new Vec3(o.target.x - o.from.x, o.target.y - o.from.y, o.target.z - o.from.z);
        this.vel = d.scale(o.speed / (d.length() || 1));
        this.root = new Node();
        if (o.kind === 'web') {
            this.root.add(mesh(sphere(0.26, 10, 8), glow([0.92, 0.95, 0.95])));
            for (let i = 0; i < 3; i++) this.root.add(mesh(torus(0.3, 0.02, 4, 12), glow([0.8, 0.85, 0.85]), 0, 0, 0, i, i * 1.3, 0));
        } else if (o.kind === 'skull') {
            const sk = flamingSkull(0.55, [0.4, 1, 0.3]);
            toonify(sk, rtoon());
            this.root.add(sk);
        } else {
            this.root.add(mesh(sphere(0.22, 10, 8), glow([1, 0.85, 0.45])));
        }
        const g = new Mesh(quad(), glowMat);
        const gs = o.kind === 'web' ? 1.0 : 1.8;
        g.scale.set(gs, gs, gs);
        if (o.kind !== 'web') this.root.add(g);
        this.light = o.kind === 'web' ? null : { pos: this.pos, color: o.kind === 'skull' ? [1, 3.5, 0.8] : [5, 2.2, 0.5], range: 7 };
        this.parent = parent; parent.add(this.root);
        this.root.position.copy(this.pos);
    }
    reflect(target) {
        this.reflected = true;
        this.t = 0;
        this.target = target;
        const d = new Vec3(target.x - this.pos.x, target.y - this.pos.y, target.z - this.pos.z);
        this.vel = d.scale(15 / (d.length() || 1));
    }
    update(dt, ctx) {
        this.t += dt;
        if (this.reflected && this.target) {
            // home in on the boss
            const d = new Vec3(this.target.x - this.pos.x, this.target.y - this.pos.y, this.target.z - this.pos.z);
            const len = d.length() || 1;
            d.scale(15 / len);
            this.vel.lerp(d, 1 - Math.exp(-10 * dt));
            if (len < 1.3) { this.hitBoss = true; this.explode(ctx, false); return; }
        }
        this.pos.x += this.vel.x * dt; this.pos.y += this.vel.y * dt; this.pos.z += this.vel.z * dt;
        this.root.position.copy(this.pos);
        this.root.rotation.y += dt * 4;
        if (this.kind === 'fire' && Math.random() < 0.9) ctx.fx.emit('fire', this.pos.x, this.pos.y, this.pos.z, (Math.random() - 0.5), 0.5, (Math.random() - 0.5), 1.3);
        if (this.kind === 'skull' && Math.random() < 0.8) ctx.fx.emit('soul', this.pos.x, this.pos.y, this.pos.z, 0, 0.5, 0, 1.0);
        if (this.reflected && Math.random() < 0.8) ctx.fx.emit('spark', this.pos.x, this.pos.y, this.pos.z, 0, 0, 0, 1.2);
        const r = Math.hypot(this.pos.x, this.pos.z);
        if (!this.reflected && (this.pos.y < 0.05 || r > 9.5 || this.t > 3.5)) this.explode(ctx, false);
        if (this.reflected && this.t > 2.5) this.explode(ctx, false);
    }
    explode(ctx, parried) {
        if (!this.alive) return;
        this.alive = false;
        if (this.kind === 'web') ctx.fx.burst('puff', this.pos, 10, { col: [0.9, 0.92, 0.92], col2: [0.6, 0.6, 0.65] });
        else { ctx.fx.burst('fire', this.pos, 14, { radius: 0.2 }); ctx.fx.burst('spark', this.pos, 10); }
        ctx.audio && ctx.audio.sfx(parried ? 'clang' : this.kind === 'web' ? 'web' : 'boom');
    }
    remove() { this.parent.remove(this.root); }
}

// Cannonballs and thrown bombs flying at the guardian (homing on a moving point),
// and a dropped bomb that lands and blows up after a short fuse.
export class Missile {
    constructor(parent, o) {
        this.kind = o.kind; this.alive = true; this.hit = false; this.t = 0;
        this.pos = o.from.clone(); this.from = o.from.clone();
        this.aim = o.aim || null;
        this.target = o.target ? o.target.clone() : new Vec3();
        if (this.aim) this.aim(this.target);
        this.dur = o.dur || 0.6; this.arc = o.arc || 1.5;
        this.damage = o.damage || 0; this.stagger = o.stagger || 0;
        this.groundY = o.groundY || 0; this.vy = o.vy !== undefined ? o.vy : 2.5; this.fuse = o.fuse || 0.8;
        this.root = new Node();
        if (o.model) { this.model = o.model; this.model.position.set(0, 0, 0); this.model.rotation.set(0, 0, 0); this.root.add(o.model); }
        else {
            this.model = node();
            this.model.add(mesh(sphere(0.36, 14, 10), 0x2a2833));
            this.model.add(mesh(sphere(0.12, 8, 6), glow([1, 0.7, 0.3]), 0.2, 0.18, 0.2));
            toonify(this.model, rtoon());
            this.root.add(this.model);
        }
        if (o.glowMat && this.kind === 'ball') {
            const g = new Mesh(quad(), o.glowMat);
            g.scale.set(1.6, 1.6, 1.6);
            this.root.add(g);
        }
        this.light = this.kind === 'ball' ? { pos: this.pos, color: [4, 1.7, 0.45], range: 7 } : null;
        this.parent = parent; parent.add(this.root);
        this.root.position.copy(this.pos);
    }
    update(dt, ctx) {
        this.t += dt;
        const fx = ctx.fx;
        if (this.kind === 'drop') {
            if (!this.landed) {
                this.vy -= 30 * dt;
                this.pos.y += this.vy * dt;
                if (this.pos.y <= this.groundY + 0.28) { this.pos.y = this.groundY + 0.28; this.landed = true; this.fuseT = 0; ctx.audio && ctx.audio.sfx('land', 6); }
            } else {
                this.fuseT += dt;
                const s = 1 + Math.abs(Math.sin(this.fuseT * (18 + this.fuseT * 30))) * 0.12 * (1 + this.fuseT * 2);
                this.root.scale.set(s, s, s);
                if (this.fuseT >= this.fuse) { this.hit = true; this.alive = false; }
            }
            this.root.position.copy(this.pos);
            if (Math.random() < 0.8) fx.emit('spark', this.pos.x, this.pos.y + 0.45, this.pos.z, (Math.random() - 0.5) * 1.5, 2, (Math.random() - 0.5) * 1.5, 0.9);
            return;
        }
        if (this.aim) this.aim(this.target);
        const u = Math.min(1, this.t / this.dur);
        this.pos.set(lerp(this.from.x, this.target.x, u), lerp(this.from.y, this.target.y, u) + Math.sin(u * Math.PI) * this.arc, lerp(this.from.z, this.target.z, u));
        this.root.position.copy(this.pos);
        this.model.rotation.x += dt * 9; this.model.rotation.z += dt * 4;
        if (this.kind === 'ball') {
            fx.emit('smoke', this.pos.x, this.pos.y, this.pos.z, (Math.random() - 0.5) * 0.4, 0.4, (Math.random() - 0.5) * 0.4, 1.1);
            if (Math.random() < 0.7) fx.emit('fire', this.pos.x, this.pos.y, this.pos.z, (Math.random() - 0.5), 0.3, (Math.random() - 0.5), 1.2);
        } else if (Math.random() < 0.9) fx.emit('spark', this.pos.x, this.pos.y + 0.4, this.pos.z, (Math.random() - 0.5) * 1.5, 1.5, (Math.random() - 0.5) * 1.5, 0.9);
        if (u >= 1) { this.hit = true; this.alive = false; }
    }
    remove() { this.parent.remove(this.root); }
}

// ============================================================================ bosses
class BossBase {
    constructor(o) {
        this.root = new Node();
        this.body = node();
        this.root.add(this.body);
        this.name = o.name; this.subtitle = o.subtitle;
        this.maxHp = o.hp; this.hp = o.hp;
        this.level = o.level; this.cycle = Math.floor((o.level - 1) / 3);
        this.speedMul = 1 + this.cycle * 0.12;
        this.phase = 1; this.state = 'intro'; this.introT = 0; this.dieT = 0;
        this.t = 0; this.yaw = 0; this.cool = 1.2; this.atk = null; this.lastKind = '';
        this.flash = 0; this.defeated = false; this.gone = false;
        this.theme = o.theme;
        this.light = { pos: new Vec3(0, 5, 0), color: o.light, range: 22 };
        this.lightBase = o.light.slice();
        // guardians tower over the knight: the whole rig is scaled up
        this.S = o.scale || 1.6;
        this.root.scale.set(this.S, this.S, this.S);
        this.staggerT = 0; this.staggerDur = 1;
        this._bodyLocal = V(0, 2, 0);
    }
    get hpFrac() { return this.hp / this.maxHp; }
    // where reflected shots fly to (world space)
    aimPoint(out) { return this.toWorld(this._aimLocal || V(0, 3.6, 0.6), out); }
    // where cannonballs and bombs strike (the big body)
    bodyPoint(out) { return this.toWorld(this._bodyLocal, out); }
    setFlash(v) { if (!this.mats) return; this.mats.toon.flash = v; this.mats.toonDouble.flash = v; this.mats.toon.flashColor = [1, 1, 1]; this.mats.toonDouble.flashColor = [1, 1, 1]; }
    damage(n, ctx, how) {
        if (this.hp <= 0 || this.state !== 'fight') return false;
        this.hp = Math.max(0, this.hp - n);
        this.flash = 1;
        if (how === 'hit') this.windowHits = (this.windowHits || 0) + 1;
        if (this.phase === 1 && this.hp <= this.maxHp * 0.5 && this.hp > 0) { this.phase = 2; ctx.onEnrage && ctx.onEnrage(this); ctx.audio && ctx.audio.sfx('enrage'); }
        if (this.hp <= 0) { this.state = 'dying'; this.dieT = 0; this.defeated = true; }
        return true;
    }
    // knocked back by a cannonball or bomb: a wind-up is cancelled (a planted limb stays down)
    stagger(ctx, dur) {
        if (this.state !== 'fight') return false;
        this.staggerT = Math.max(this.staggerT, dur); this.staggerDur = this.staggerT;
        this.flash = 1;
        const a = this.atk;
        let broke = false;
        if (a && !(a.kind === 'strike' && a.stage >= 2)) { this.cancelAttack(ctx); this.atk = null; broke = true; }
        this.cool = Math.max(this.cool, dur + 0.45);
        return broke;
    }
    cancelAttack(ctx) { const a = this.atk; if (a && a.tele) a.tele.cancel(); }
    // world <-> body space (body space ignores the small idle sway and flinch)
    toLocal(w, out) {
        const c = Math.cos(this.yaw), s = Math.sin(this.yaw), k = 1 / this.S;
        return out.set((w.x * c - w.z * s) * k, w.y * k - this.body.position.y, (w.x * s + w.z * c) * k);
    }
    toWorld(l, out) {
        const c = Math.cos(this.yaw), s = Math.sin(this.yaw), S = this.S;
        const x = l.x * S, y = (l.y + this.body.position.y) * S, z = l.z * S;
        return out.set(x * c + z * s, y, -x * s + z * c);
    }
    pick(ctx) {
        if (!this.opened) { this.opened = true; return 'strike'; }   // open with the attack that teaches the weak spot
        const opts = this.attackTable(ctx).filter(o => o.w > 0 && !(o.kind === this.lastKind && o.kind !== 'strike'));
        let tot = 0; for (const o of opts) tot += o.w;
        let r = Math.random() * tot;
        for (const o of opts) { r -= o.w; if (r <= 0) return o.kind; }
        return 'strike';
    }
    baseUpdate(dt, ctx) {
        this.t += dt;
        if (this.staggerT > 0) {
            this.staggerT = Math.max(0, this.staggerT - dt);
            const u = 1 - this.staggerT / this.staggerDur;
            const planted = this.atk && this.atk.kind === 'strike' && this.atk.stage >= 1;
            this.body.rotation.x = planted ? 0 : -Math.sin(Math.PI * u) * 0.2 * (1 - u * 0.3);
        } else this.body.rotation.x = 0;
        this.flash = Math.max(0, this.flash - dt * 5);
        this.setFlash(this.flash * 0.75);
        const fl = 0.85 + 0.15 * Math.sin(this.t * 7.3) * Math.sin(this.t * 3.1);
        this.light.color = this.lightBase.map(c => c * fl * (this.state === 'dying' ? Math.max(0, 1 - this.dieT / 2.5) : 1));
    }
    weakPoints() { return []; }
}

// ---------------------------------------------------------------------------- THE BONE TYRANT
export class BoneTyrant extends BossBase {
    constructor(level) {
        super({
            name: 'THE BONE TYRANT', subtitle: 'Undead king of the tower', level,
            hp: (level === 1 ? 64 : 72) + Math.floor((level - 1) / 3) * 16, light: [4.2, 0.8, 0.45], scale: 1.7,
            theme: { glow: [1, 0.2, 0.1], window: [0.9, 0.12, 0.08] }
        });
        const BONE = 0xefe3c6, BONE_D = 0xb8a98c, GOLD = 0xd9a33a, CLOAK = 0x4b1030;
        const ink = glow([0.04, 0.01, 0.02]), eye = glow([1, 0.18, 0.06]);
        const b = this.body;
        b.position.y = -10;
        for (let i = 0; i < 8; i++) b.add(mesh(cylinder(0.3, 0.33, 0.36, 10, 1), BONE_D, 0, -1.8 + i * 0.52, -0.25));
        b.add(mesh(box(2.2, 0.7, 1.1), BONE, 0, -2.1, -0.1));
        const chest = this.chest = node();
        b.add(chest);
        for (let i = 0; i < 5; i++) {
            const rr = 1.45 - i * 0.1;
            chest.add(mesh(torus(rr, 0.11, 6, 22, Math.PI * 1.6), BONE, 0, 1.0 + i * 0.44, 0.1, Math.PI / 2, 0.94, 0, 1, 1, 0.82));
        }
        chest.add(mesh(box(0.28, 1.9, 0.16), BONE, 0, 1.95, 1.2));
        b.add(mesh(box(3.4, 0.26, 0.32), BONE, 0, 3.3, 0.1));
        for (const s of [-1, 1]) b.add(mesh(sphere(0.45, 12, 10), BONE, s * 1.6, 3.35, 0.2));
        // tattered cloak
        const cb = new GeoBuilder();
        const top = [[-2.1, 3.5], [2.1, 3.5]];
        const hem = [[2.0, -0.3], [1.5, 0.6], [1.1, -0.6], [0.5, 0.3], [0, -0.9], [-0.5, 0.2], [-1.1, -0.5], [-1.6, 0.5], [-2.0, -0.2]];
        const c0 = cb.vert(0, 2.4, 0, 0, 0, 1, 0, 0);
        const ring = [top[1], ...hem, top[0]].map(p => cb.vert(p[0], p[1], -Math.abs(p[0]) * 0.2, 0, 0, 1, 0, 0));
        for (let i = 0; i < ring.length - 1; i++) cb.tri(c0, ring[i], ring[i + 1]);
        cb.tri(c0, ring[ring.length - 1], ring[0]);
        const cloak = node(0, 0, -0.9);
        cloak.add(mesh(cb.build(), new LitMaterial({ color: hexColor(CLOAK), side: 'double' })));
        b.add(cloak);
        this.cloak = cloak;
        // skull
        const skull = this.skull = node(0, 4.35, 0.25);
        b.add(skull);
        skull.add(mesh(sphere(1.0, 22, 16), BONE, 0, 0.55, 0, 0, 0, 0, 0.95, 1.0, 1.05));
        skull.add(mesh(box(1.25, 0.42, 0.95), BONE, 0, -0.05, 0.35));
        for (const s of [-1, 1]) {
            skull.add(mesh(sphere(1, 12, 10), ink, s * 0.38, 0.45, 0.86, 0, 0, 0, 0.3, 0.34, 0.16));
            skull.add(mesh(sphere(0.3, 10, 8), BONE, s * 0.72, 0.1, 0.45, 0, 0, 0, 0.9, 0.7, 1));
        }
        const eyes = this.eyes = node(0, 0.43, 0.96);
        for (const s of [-1, 1]) eyes.add(mesh(sphere(0.13, 10, 8), eye, s * 0.38, 0, 0));
        skull.add(eyes);
        skull.add(mesh(box(0.22, 0.22, 0.12), ink, 0, 0.12, 1.02, 0, 0, Math.PI / 4));
        for (let i = 0; i < 8; i++) skull.add(mesh(box(0.1, 0.24, 0.1), BONE, (i - 3.5) * 0.14, -0.33, 0.8 - Math.abs(i - 3.5) * 0.045));
        skull.add(mesh(torus(0.74, 0.09, 6, 22), GOLD, 0, 1.28, -0.05, Math.PI / 2, 0, 0));
        for (let k = 0; k < 7; k++) {
            const a = (k / 7) * TAU;
            skull.add(mesh(cylinder(0, 0.15, 0.62, 6, 1), GOLD, Math.sin(a) * 0.74, 1.6, Math.cos(a) * 0.74 - 0.05));
        }
        skull.add(mesh(sphere(0.14, 8, 6), glow([1, 0.12, 0.2]), 0, 1.36, 0.72));
        const jaw = this.jaw = node(0, -0.28, 0.25);
        jaw.add(mesh(box(1.1, 0.3, 0.95), BONE, 0, -0.22, 0.35));
        for (let i = 0; i < 8; i++) jaw.add(mesh(box(0.1, 0.22, 0.1), BONE, (i - 3.5) * 0.13, -0.02, 0.76 - Math.abs(i - 3.5) * 0.045));
        skull.add(jaw);
        // arms (animated with IK)
        this.L1 = 3.1; this.L2 = 3.1;
        this.arms = [-1, 1].map(side => {
            const upper = node(); upper.add(mesh(cylinder(0.24, 0.19, 1, 10, 1), BONE));
            const elbow = node(); elbow.add(mesh(sphere(0.34, 12, 10), BONE));
            const fore = node();
            fore.add(mesh(cylinder(0.14, 0.11, 1, 8, 1), BONE, 0.13, 0, 0));
            fore.add(mesh(cylinder(0.12, 0.1, 1, 8, 1), BONE_D, -0.13, 0, 0));
            const hand = node();
            hand.add(mesh(box(0.95, 0.26, 0.75), BONE, 0, 0, 0.1));
            for (let f = 0; f < 4; f++) {
                const fx = (f - 1.5) * 0.23;
                hand.add(mesh(cylinder(0.075, 0.06, 0.55, 6, 1), BONE, fx, -0.1, 0.62, 1.2, 0, 0));
                hand.add(mesh(cylinder(0, 0.06, 0.32, 5, 1), BONE_D, fx, -0.36, 0.84, 2.3, 0, 0));
            }
            hand.add(mesh(cylinder(0.08, 0.06, 0.5, 6, 1), BONE, side * -0.55, -0.05, 0.25, 0.9, 0, side * 0.8));
            const weak = node(0, 0.2, 0.05);
            weak.add(mesh(sphere(0.22, 10, 8), glow([1, 0.15, 0.1])));
            weak.noBake = true;
            hand.add(weak);
            b.add(upper, elbow, fore, hand);
            return { side, upper, elbow, fore, hand, weak, mode: 'rest', t: 0, theta: 0, pos: V(side * 2.4, 1.2, 1.6), from: V(), world: V(), E: V() };
        });
        this.mats = makeToonMaterials({ key: 2.8, rim: 0.6, spec: 0.35, outlineWidth: 0.03 });
        toonify(this.root, this.mats);
        this._S = V(); this._T = V(); this._tmp = V();
        this._aimLocal = V(0, 4.9, 0.7);
        this._bodyLocal = V(0, 2.3, 0.5);
    }

    cancelAttack(ctx) {
        super.cancelAttack(ctx);
        for (const arm of this.arms) if (arm.mode !== 'rest') { arm.mode = 'retract'; arm.t = 0; }
    }

    attackTable(ctx) {
        const p2 = this.phase === 2;
        return [
            { kind: 'strike', w: 0.42 },
            { kind: 'skulls', w: 0.17 },
            { kind: 'soulfire', w: 0.2 },
            { kind: 'summon', w: ctx.minionCount() < (p2 ? 3 : 2) ? 0.15 : 0 },
            { kind: 'rain', w: p2 ? 0.2 : 0 }
        ];
    }

    update(dt, ctx) {
        this.baseUpdate(dt, ctx);
        const t = this.t, b = this.body;
        if (this.state === 'intro') {
            this.introT += dt;
            const u = clamp(this.introT / 2.6, 0, 1);
            b.position.y = lerp(-10, 0, 1 - Math.pow(1 - u, 3));
            const e = u < 0.8 ? 0.01 : (u - 0.8) / 0.2;
            this.eyes.scale.set(e, e, e);
            if (u >= 1) this.state = 'fight';
        } else if (this.state === 'dying') {
            this.dieT += dt;
            b.position.y = -Math.pow(Math.max(0, this.dieT - 1.0), 2) * 3.5;
            b.rotation.z = Math.sin(this.dieT * 30) * 0.03 * Math.max(0, 1.4 - this.dieT);
            const e = Math.max(0, 1 - this.dieT * 0.8);
            this.eyes.scale.set(e, e, e);
            this.jaw.rotation.x = Math.min(0.8, this.dieT);
            if (Math.random() < 0.5) {
                const w = this.toWorld(V((Math.random() - 0.5) * 3, 1 + Math.random() * 4, (Math.random() - 0.5) * 2), V());
                ctx.fx.chunk(w, 3, [0.93, 0.88, 0.76], 0.16, 4);
                if (Math.random() < 0.4) ctx.fx.burst('fire', w, 6);
            }
            if (this.dieT > 3.2) this.gone = true;
        }
        // face the knight unless a hand is planted
        const planted = this.arms.some(a => a.mode === 'slam' || a.mode === 'down');
        if (!planted && this.state !== 'dying') this.yaw = dampAngle(this.yaw, ctx.player.theta, 2.0 * this.speedMul, dt);
        this.root.rotation.y = this.yaw;
        // idle life
        b.rotation.y = Math.sin(t * 0.7) * 0.06;
        this.chest.scale.set(1, 1 + Math.sin(t * 2.2) * 0.025, 1);
        this.cloak.rotation.x = Math.sin(t * 1.3) * 0.08 - 0.05;
        this.skull.rotation.z = Math.sin(t * 0.9) * 0.06;
        if (this.state === 'fight' && !(this.atk && (this.atk.kind === 'skulls' || this.atk.kind === 'soulfire' || this.atk.kind === 'rain'))) this.jaw.rotation.x = Math.max(0, Math.sin(t * 9)) * 0.12;
        if (this.state === 'fight') { const eg = 1 + Math.sin(t * 6) * 0.15 + (this.phase === 2 ? 0.25 : 0); this.eyes.scale.set(eg, eg, eg); }
        // a cold shroud of grave smoke clings to the tyrant
        if (this.state !== 'dying' && Math.random() < (this.phase === 2 ? 0.5 : 0.3)) {
            const w = this.toWorld(V((Math.random() - 0.5) * 2.6, 0.2 + Math.random() * 3.2, -0.4 + (Math.random() - 0.5) * 1.2), V());
            ctx.fx.emit('smoke', w.x, w.y, w.z, (Math.random() - 0.5) * 0.4, 0.5, (Math.random() - 0.5) * 0.4, 1.5);
        }
        // attacks
        if (this.state === 'fight') {
            if (!this.atk) { this.cool -= dt * this.speedMul * (this.phase === 2 ? 1.35 : 1); if (this.cool <= 0) this.startAttack(ctx); }
            else this.runAttack(dt, ctx);
        }
        for (const a of this.arms) this.updateArm(a, dt, ctx);
    }

    startAttack(ctx) {
        const kind = this.pick(ctx);
        this.lastKind = kind;
        const P = ctx.player;
        const a = { kind, t: 0, stage: 0 };
        if (kind === 'strike') {
            const lead = clamp(P.vx * 0.3, -1.4, 1.4) / PATH.r;
            const tg = ctx.strikeTarget(wrapAngle(P.theta + lead));
            a.theta = tg.theta; a.gy = tg.gy;
            const off = angleDiff(a.theta, this.yaw);
            a.arm = this.arms.find(x => x.side === (off >= 0 ? 1 : -1));
            if (a.arm.mode !== 'rest') a.arm = this.arms.find(x => x !== a.arm);
            a.warn = ((this.phase === 2 ? 0.75 : 1.0) + (this.level === 1 ? 0.15 : 0)) / Math.max(1, this.speedMul * 0.95);
            a.tele = ctx.telegraph(a.theta, a.warn + 0.12, 2.3, null, a.gy);
            a.arm.mode = 'raise'; a.arm.theta = a.theta; a.arm.gy = a.gy;
            this.windowHits = 0;
            ctx.audio && ctx.audio.sfx('growl');
        } else if (kind === 'skulls') {
            a.n = this.phase === 2 ? 3 : 2;
            ctx.audio && ctx.audio.sfx('bossroar');
        } else if (kind === 'soulfire') {
            a.n = this.phase === 2 ? 3 : 2;
            ctx.audio && ctx.audio.sfx('growl');
        } else if (kind === 'summon') {
            ctx.audio && ctx.audio.sfx('summon');
        } else if (kind === 'rain') {
            ctx.audio && ctx.audio.sfx('bossroar');
        }
        this.atk = a;
    }

    runAttack(dt, ctx) {
        const a = this.atk, P = ctx.player;
        a.t += dt * this.speedMul;
        if (a.kind === 'strike') {
            if (a.stage === 0 && a.t >= a.warn) { a.stage = 1; a.arm.mode = 'slam'; a.arm.t = 0; a.arm.from.copy(a.arm.pos); }
            if (a.stage === 1 && a.arm.mode === 'down') {
                a.stage = 2; a.downT = 0;
                ctx.impact(a.theta, 1.0, 1.4, 'boss', a.gy);
                ctx.shake(0.55); ctx.audio && ctx.audio.sfx('slam');
                const w = polar(a.theta, PATH.r, a.gy + 0.2);
                ctx.fx.burst('dust', w, 22, { radius: 0.8, speed: 1.5 });
                ctx.fx.chunk(w, 8, [0.5, 0.45, 0.48], 0.14, 4);
                if (this.phase === 2 && a.gy < 0.5) { ctx.runner({ kind: 'shock', theta: a.theta + 0.2, dir: 1, speed: 5.5 + this.cycle * 0.4, life: 1.7 }); ctx.runner({ kind: 'shock', theta: a.theta - 0.2, dir: -1, speed: 5.5 + this.cycle * 0.4, life: 1.7 }); }
            }
            if (a.stage === 2) {
                a.downT += dt;
                const hurt = this.windowHits >= 3;
                if (a.downT > (this.phase === 2 ? 1.35 : this.level === 1 ? 2.05 : 1.8) || hurt) {
                    a.arm.mode = 'retract'; a.arm.t = 0; this.atk = null; this.cool = hurt ? 1.0 : 0.7;
                    if (hurt) { ctx.audio && ctx.audio.sfx('bossroar'); this.jaw.rotation.x = 0.8; }
                }
            }
        } else if (a.kind === 'skulls') {
            // spits burning skulls that land beside the knight and roll at him
            this.jaw.rotation.x = damp(this.jaw.rotation.x, 0.7, 10, dt);
            if (a.t > 0.6 && a.stage < a.n) {
                const i = a.stage;
                if (a.t > 0.6 + i * 0.7) {
                    const side = (i % 2 === 0 ? 1 : -1) * (a.first || (a.first = Math.random() < 0.5 ? 1 : -1));
                    const m = this.toWorld(V(0, 4.0, 1.4), V());
                    ctx.runner({ kind: 'skull', theta: P.theta + side * (2.9 / PATH.r), dir: -side, speed: 3.0 + this.cycle * 0.45 + (this.phase === 2 ? 0.6 : 0), from: m, flyTime: 0.7, arc: 2.5, life: 3.2 });
                    ctx.fx.burst('fire', m, 12);
                    ctx.audio && ctx.audio.sfx('fire');
                    a.stage++;
                }
            }
            if (a.t > 0.9 + a.n * 0.7) { this.atk = null; this.cool = 1.0; }
        } else if (a.kind === 'soulfire') {
            // green flaming skulls aimed at the knight: parry them back into the tyrant's face
            this.jaw.rotation.x = damp(this.jaw.rotation.x, 0.75, 10, dt);
            if (a.stage < a.n && a.t > 0.7 + a.stage * 0.55) {
                const m = this.toWorld(V(0, 4.1, 1.5), V());
                const tt = polar(P.theta + (a.stage - (a.n - 1) / 2) * 0.1, PATH.r, P.y + 0.9);
                ctx.shot({ kind: 'skull', from: m, target: tt, speed: 6.2 + this.cycle * 0.4 });
                ctx.fx.burst('soul', m, 12, { col: [0.5, 1, 0.4], col2: [0.1, 0.4, 0.2] });
                a.stage++;
            }
            if (a.t > 1.0 + a.n * 0.55) { this.atk = null; this.cool = 1.1; }
        } else if (a.kind === 'summon') {
            for (const arm of this.arms) arm.mode = 'lift';
            if (a.t > 0.9 && a.stage === 0) {
                a.stage = 1;
                const n = this.phase === 2 ? 3 : 2;
                for (let i = 0; i < n; i++) ctx.minion('skeleton', P.theta + (i - (n - 1) / 2) * 0.55 + (i === 0 ? -0.45 : 0.45));
            }
            if (a.t > 1.7) { for (const arm of this.arms) arm.mode = 'retract'; this.atk = null; this.cool = 1.2; }
        } else if (a.kind === 'rain') {
            this.jaw.rotation.x = damp(this.jaw.rotation.x, 0.5, 8, dt);
            if (a.stage < 5 && a.t > 0.4 + a.stage * 0.25) {
                const th = P.theta + (a.stage - 2) * 0.3 + (Math.random() - 0.5) * 0.2;
                ctx.faller({ kind: 'bone', theta: th, delay: 1.0, gy: ctx.groundAt(th) });
                a.stage++;
            }
            if (a.t > 2.6) { this.atk = null; this.cool = 1.0; }
        }
    }

    updateArm(arm, dt, ctx) {
        arm.t += dt;
        const side = arm.side, t = this.t;
        const S = this._S.set(side * 1.6, 3.35, 0.2);
        const T = this._T;
        let k = 6;
        if (arm.mode === 'rest' || arm.mode === 'retract') {
            T.set(side * 2.5, 1.5 + Math.sin(t * 1.4 + side) * 0.25, 1.7);
            k = arm.mode === 'retract' ? 5 : 3;
            if (arm.mode === 'retract' && arm.t > 0.6) arm.mode = 'rest';
        } else if (arm.mode === 'lift') {
            T.set(side * 3.2, 6.2 + Math.sin(t * 8) * 0.2, 0.8); k = 5;
        } else if (arm.mode === 'raise') {
            this.toLocal(polar(arm.theta, PATH.r, (arm.gy || 0) + 8.0), T); k = 7;
        } else if (arm.mode === 'slam') {
            this.toLocal(polar(arm.theta, PATH.r, (arm.gy || 0) + 0.3), T);
            const u = Math.min(1, arm.t / 0.13);
            arm.pos.set(lerp(arm.from.x, T.x, u * u), lerp(arm.from.y, T.y, u * u), lerp(arm.from.z, T.z, u * u));
            if (u >= 1) arm.mode = 'down';
            k = 0;
        } else if (arm.mode === 'down') {
            this.toLocal(polar(arm.theta, PATH.r, (arm.gy || 0) + 0.3), T);
            T.x += Math.sin(t * 40) * 0.02;
            arm.pos.copy(T); k = 0;
        }
        if (this.state === 'dying') { T.set(side * 2.8, -1.5, 1.2); k = 3; }
        if (k > 0) arm.pos.set(damp(arm.pos.x, T.x, k, dt), damp(arm.pos.y, T.y, k, dt), damp(arm.pos.z, T.z, k, dt));
        const P = arm.pos.clone();
        const E = ik2(S, P, this.L1, this.L2, this._tmp.set(side * 1.0, 0.7, -0.5), arm.E);
        orientBetween(arm.upper, S, E, 1);
        arm.elbow.position.copy(E);
        orientBetween(arm.fore, E, P, 1);
        arm.hand.position.copy(P);
        const dx = P.x - E.x, dz = P.z - E.z;
        arm.hand.rotation.set(arm.mode === 'down' || arm.mode === 'slam' ? 0.15 : 0.5, Math.atan2(dx, dz), 0);
        const exposed = arm.mode === 'down';
        arm.weak.visible = exposed || arm.mode === 'raise';
        const ws = exposed ? 1.2 + Math.sin(t * 14) * 0.25 : 0.7;
        arm.weak.scale.set(ws, ws, ws);
    }

    weakPoints() {
        const out = [];
        for (const a of this.arms) if (a.mode === 'down') out.push({ theta: a.theta, y0: a.gy || 0, y1: (a.gy || 0) + 1.5, half: 0.95 });
        return out;
    }
}

// ---------------------------------------------------------------------------- THE BROOD MOTHER
export class BroodMother extends BossBase {
    constructor(level) {
        super({
            name: 'THE BROOD MOTHER', subtitle: 'Queen of the silk-choked spire', level,
            hp: 78 + Math.floor((level - 1) / 3) * 16, light: [0.9, 3.8, 1.0], scale: 1.6,
            theme: { glow: [0.35, 1, 0.3], window: [0.75, 0.1, 0.12] }
        });
        const SK = 0x2d1b3c, SK2 = 0x221430, LEG = 0x3a2450;
        const red = glow([1, 0.12, 0.08]), green = glow([0.45, 1, 0.3]);
        const b = this.body;
        b.position.y = 22;
        b.add(mesh(sphere(1, 18, 14), SK, 0, 0, 0.3, 0, 0, 0, 1.15, 0.8, 1.2));
        b.add(mesh(sphere(1, 20, 16), SK2, 0, 0.55, -1.9, 0, 0, 0, 1.9, 1.6, 2.2));
        // glowing skull marking on the abdomen
        const mark = node(0, 1.95, -1.3);
        mark.rotation.x = -0.5;
        for (const s of [-1, 1]) mark.add(mesh(sphere(1, 10, 8), green, s * 0.35, 0.05, 0, 0, 0, 0, 0.26, 0.3, 0.1));
        mark.add(mesh(box(0.18, 0.28, 0.1), green, 0, -0.32, 0.02, 0, 0, Math.PI / 4));
        for (let i = 0; i < 4; i++) mark.add(mesh(box(0.12, 0.22, 0.08), green, (i - 1.5) * 0.18, -0.68, 0));
        b.add(mark);
        const head = this.head = node(0, -0.05, 1.45);
        head.add(mesh(sphere(0.72, 16, 12), SK));
        head.add(mesh(sphere(0.2, 10, 8), red, 0.26, 0.26, 0.6));
        head.add(mesh(sphere(0.2, 10, 8), red, -0.26, 0.26, 0.6));
        for (const [x, y] of [[0.5, 0.12], [-0.5, 0.12], [0.16, 0.48], [-0.16, 0.48], [0.4, 0.4], [-0.4, 0.4]]) head.add(mesh(sphere(0.09, 8, 6), red, x, y, 0.58 - Math.abs(x) * 0.2));
        b.add(head);
        this.fangs = [-1, 1].map(s => {
            const f = node(s * 0.24, -0.45, 1.95);
            f.add(mesh(cylinder(0.13, 0.05, 0.5, 6, 1), SK2, 0, -0.2, 0.05, 0.3, 0, 0));
            f.add(mesh(cylinder(0.05, 0, 0.35, 5, 1), green, 0, -0.55, 0.16, 0.55, 0, 0));
            b.add(f);
            return f;
        });
        this.silk = new Mesh(cylinder(0.06, 0.06, 1, 5, 1), new BasicMaterial({ color: [0.8, 0.82, 0.85], transparent: true, opacity: 0.6, depthWrite: false }));
        this.silk.noBake = true;
        this.root.add(this.silk);
        // legs
        this.L1 = 2.9; this.L2 = 3.3;
        const angs = [0.5, 1.1, 1.9, 2.55];
        this.legs = [];
        for (const s of [-1, 1]) for (let i = 0; i < 4; i++) {
            const a = s * angs[i];
            const upper = node(); upper.add(mesh(cylinder(0.18, 0.13, 1, 8, 1), LEG));
            const knee = node(); knee.add(mesh(sphere(0.2, 8, 6), SK));
            const lower = node(); lower.add(mesh(cylinder(0.13, 0.04, 1, 8, 1), LEG));
            const weak = node(); weak.add(mesh(sphere(0.24, 8, 6), green)); weak.noBake = true;
            b.add(upper, knee, lower, weak);
            this.legs.push({ side: s, a, i, upper, knee, lower, weak, mode: 'rest', t: 0, theta: 0, pos: V(Math.sin(a) * 3.3, -4.2, Math.cos(a) * 3.3), from: V(), E: V() });
        }
        this.mats = makeToonMaterials({ key: 2.6, rim: 0.7, spec: 0.6, outlineWidth: 0.03 });
        toonify(this.root, this.mats);
        this._S = V(); this._T = V(); this._tmp = V();
        this._aimLocal = V(0, 0.2, 1.6);
        this._bodyLocal = V(0, 0.45, -0.6);
    }

    cancelAttack(ctx) {
        super.cancelAttack(ctx);
        for (const l of this.legs) if (l.mode !== 'rest') { l.mode = 'retract'; l.t = 0; }
    }

    attackTable(ctx) {
        const p2 = this.phase === 2;
        return [
            { kind: 'strike', w: 0.52 },
            { kind: 'web', w: 0.2 },
            { kind: 'eggs', w: ctx.minionCount() < 4 ? 0.18 : 0 },
            { kind: 'poison', w: p2 ? 0.22 : 0 }
        ];
    }

    update(dt, ctx) {
        this.baseUpdate(dt, ctx);
        const t = this.t, b = this.body;
        const restY = 4.3 + Math.sin(t * 1.6) * 0.18;
        if (this.state === 'intro') {
            this.introT += dt;
            const u = clamp(this.introT / 2.6, 0, 1);
            b.position.y = lerp(22, restY, 1 - Math.pow(1 - u, 2.2));
            if (u >= 1) this.state = 'fight';
        } else if (this.state === 'dying') {
            this.dieT += dt;
            b.position.y = restY - Math.pow(Math.max(0, this.dieT - 0.9), 2) * 3.2;
            b.rotation.z = Math.sin(this.dieT * 25) * 0.05 * Math.max(0, 1.2 - this.dieT);
            if (Math.random() < 0.5) {
                const w = this.toWorld(V((Math.random() - 0.5) * 3, (Math.random() - 0.3) * 2, (Math.random() - 0.5) * 3), V());
                ctx.fx.burst('soul', w, 6, { col: [0.5, 1, 0.3], col2: [0.1, 0.3, 0.1] });
            }
            if (this.dieT > 3.2) this.gone = true;
        } else b.position.y = damp(b.position.y, restY, 4, dt);
        const planted = this.legs.some(l => l.mode === 'stab' || l.mode === 'down');
        if (!planted && this.state !== 'dying') this.yaw = dampAngle(this.yaw, ctx.player.theta, 1.8 * this.speedMul, dt);
        this.root.rotation.y = this.yaw;
        this.head.rotation.set(Math.sin(t * 2.1) * 0.08, Math.sin(t * 1.3) * 0.12, 0);
        this.fangs.forEach((f, i) => { f.rotation.x = Math.sin(t * 11 + i) * 0.15 + (this.atk && this.atk.kind === 'web' ? -0.4 : 0); });
        const wy = b.position.y + 0.5;
        this.silk.position.set(0, (wy + 30) / 2, -1.2);
        this.silk.scale.set(1, Math.max(0.1, 30 - wy), 1);
        if (this.state === 'fight') {
            if (!this.atk) { this.cool -= dt * this.speedMul * (this.phase === 2 ? 1.35 : 1); if (this.cool <= 0) this.startAttack(ctx); }
            else this.runAttack(dt, ctx);
        }
        for (const l of this.legs) this.updateLeg(l, dt);
    }

    startAttack(ctx) {
        const kind = this.pick(ctx);
        this.lastKind = kind;
        const P = ctx.player;
        const a = { kind, t: 0, stage: 0 };
        if (kind === 'strike') {
            const lead = clamp(P.vx * 0.3, -1.4, 1.4) / PATH.r;
            const tg = ctx.strikeTarget(wrapAngle(P.theta + lead));
            a.theta = tg.theta; a.gy = tg.gy;
            const off = angleDiff(a.theta, this.yaw);
            const s = off >= 0 ? 1 : -1;
            a.leg = this.legs.find(l => l.side === s && l.i === 0);
            a.warn = (this.phase === 2 ? 0.72 : 0.95) / Math.max(1, this.speedMul * 0.95);
            a.tele = ctx.telegraph(a.theta, a.warn + 0.12, 2.1, [0.4, 1, 0.3], a.gy);
            a.leg.mode = 'raise'; a.leg.theta = a.theta; a.leg.gy = a.gy;
            this.windowHits = 0;
            ctx.audio && ctx.audio.sfx('hiss');
        } else if (kind === 'web') {
            ctx.audio && ctx.audio.sfx('hiss');
        } else if (kind === 'eggs' || kind === 'poison') {
            ctx.audio && ctx.audio.sfx('screechBig');
        }
        this.atk = a;
    }

    runAttack(dt, ctx) {
        const a = this.atk, P = ctx.player;
        a.t += dt * this.speedMul;
        if (a.kind === 'strike') {
            if (a.stage === 0 && a.t >= a.warn) { a.stage = 1; a.leg.mode = 'stab'; a.leg.t = 0; a.leg.from.copy(a.leg.pos); }
            if (a.stage === 1 && a.leg.mode === 'down') {
                a.stage = 2; a.downT = 0;
                ctx.impact(a.theta, 0.85, 1.5, 'spider', a.gy);
                ctx.shake(0.4); ctx.audio && ctx.audio.sfx('stab');
                const w = polar(a.theta, PATH.r, a.gy + 0.2);
                ctx.fx.burst('dust', w, 16, { radius: 0.5 });
                ctx.fx.chunk(w, 6, [0.5, 0.45, 0.48], 0.12, 3.5);
            }
            if (a.stage === 2) {
                a.downT += dt;
                const hurt = this.windowHits >= 3;
                if (a.downT > (this.phase === 2 ? 1.25 : 1.7) || hurt) {
                    a.leg.mode = 'retract'; a.leg.t = 0; this.atk = null; this.cool = hurt ? 1.0 : 0.7;
                    if (hurt) ctx.audio && ctx.audio.sfx('screechBig');
                }
            }
        } else if (a.kind === 'web') {
            const n = this.phase === 2 ? 4 : 3;
            if (a.stage < n && a.t > 0.5 + a.stage * 0.35) {
                const from = this.toWorld(V(0, -0.5, 2.1), V());
                const tt = polar(P.theta + (a.stage - (n - 1) / 2) * 0.12, PATH.r, P.y + 0.8);
                ctx.shot({ kind: 'web', from, target: tt, speed: 7 + this.cycle * 0.5 });
                a.stage++;
            }
            if (a.t > 0.9 + n * 0.35) { this.atk = null; this.cool = 1.0; }
        } else if (a.kind === 'eggs') {
            if (a.stage < 3 && a.t > 0.4 + a.stage * 0.3) {
                const th = P.theta + (a.stage - 1) * 0.55 + (Math.random() - 0.5) * 0.2;
                ctx.faller({ kind: 'egg', theta: th, delay: 1.0, gy: 0, onImpact: (f) => ctx.runner({ kind: 'spiderling', theta: f.theta, dir: angleDiff(ctx.player.theta, f.theta) >= 0 ? 1 : -1, speed: 3.0 + this.cycle * 0.3, life: 9 }) });
                a.stage++;
            }
            if (a.t > 2.0) { this.atk = null; this.cool = 1.2; }
        } else if (a.kind === 'poison') {
            if (a.stage < 5 && a.t > 0.3 + a.stage * 0.24) {
                const th = P.theta + (Math.random() - 0.5) * 1.1;
                ctx.faller({ kind: 'poison', theta: th, delay: 0.95, gy: ctx.groundAt(th) });
                a.stage++;
            }
            if (a.t > 2.4) { this.atk = null; this.cool = 1.0; }
        }
    }

    updateLeg(l, dt) {
        l.t += dt;
        const t = this.t, b = this.body;
        const S = this._S.set(Math.sin(l.a) * 0.95, 0.05, Math.cos(l.a) * 0.95 + 0.3);
        const T = this._T;
        let k = 6;
        const restWorldY = 0.05 / this.S - b.position.y;
        if (l.mode === 'rest' || l.mode === 'retract') {
            const lift = Math.max(0, Math.sin(t * 2.2 + l.i * 1.7 + l.side)) * 0.25;
            T.set(Math.sin(l.a) * 3.35, restWorldY + lift, Math.cos(l.a) * 3.35 + 0.2);
            k = l.mode === 'retract' ? 5 : 8;
            if (l.mode === 'retract' && l.t > 0.6) l.mode = 'rest';
        } else if (l.mode === 'raise') {
            this.toLocal(polar(l.theta, PATH.r, (l.gy || 0) + 7.5), T); k = 7;
        } else if (l.mode === 'stab') {
            this.toLocal(polar(l.theta, PATH.r, (l.gy || 0) + 0.15), T);
            const u = Math.min(1, l.t / 0.12);
            l.pos.set(lerp(l.from.x, T.x, u * u), lerp(l.from.y, T.y, u * u), lerp(l.from.z, T.z, u * u));
            if (u >= 1) l.mode = 'down';
            k = 0;
        } else if (l.mode === 'down') {
            this.toLocal(polar(l.theta, PATH.r, (l.gy || 0) + 0.15), T);
            l.pos.copy(T); k = 0;
        }
        if (this.state === 'dying') { T.set(Math.sin(l.a) * 0.8, -1.2, Math.cos(l.a) * 0.8); k = 4; }
        if (this.state === 'intro') { T.set(Math.sin(l.a) * 2.2, -2.5, Math.cos(l.a) * 2.2); k = 5; }
        if (k > 0) l.pos.set(damp(l.pos.x, T.x, k, dt), damp(l.pos.y, T.y, k, dt), damp(l.pos.z, T.z, k, dt));
        const Pp = l.pos.clone();
        const E = ik2(S, Pp, this.L1, this.L2, this._tmp.set(Math.sin(l.a) * 0.6, 1.0, Math.cos(l.a) * 0.6), l.E);
        orientBetween(l.upper, S, E, 1);
        l.knee.position.copy(E);
        orientBetween(l.lower, E, Pp, 1);
        l.weak.position.set(lerp(E.x, Pp.x, 0.7), lerp(E.y, Pp.y, 0.7), lerp(E.z, Pp.z, 0.7));
        l.weak.visible = l.mode === 'down' || l.mode === 'raise';
        const ws = l.mode === 'down' ? 1.2 + Math.sin(t * 14) * 0.25 : 0.7;
        l.weak.scale.set(ws, ws, ws);
    }

    weakPoints() {
        const out = [];
        for (const l of this.legs) if (l.mode === 'down') out.push({ theta: l.theta, y0: l.gy || 0, y1: (l.gy || 0) + 1.8, half: 0.8 });
        return out;
    }
}

// ---------------------------------------------------------------------------- THE ASH WYRM
export class AshWyrm extends BossBase {
    constructor(level) {
        super({
            name: 'THE ASH WYRM', subtitle: 'Last fire of a burned kingdom', level,
            hp: 84 + Math.floor((level - 1) / 3) * 16, light: [4.6, 1.6, 0.35], scale: 1.7,
            theme: { glow: [1, 0.45, 0.08], window: [1, 0.35, 0.08] }
        });
        // charcoal scales split by ember light: a creature of the burned kingdom
        const SC = 0x4a3234, SC2 = 0x2c1c20, HORN = 0xe0d2bc, WING = 0x5e1c18;
        const BELLY = glow([1, 0.46, 0.1]);
        const yel = glow([1, 0.9, 0.3]), ink = glow([0.04, 0.01, 0.01]), fire = glow([1, 0.55, 0.12]);
        const b = this.body;
        b.position.y = -9;
        b.add(mesh(sphere(1, 18, 14), SC, 0, 1.3, -0.9, 0, 0, 0, 1.8, 1.55, 2.0));
        b.add(mesh(sphere(1, 16, 12), BELLY, 0, 1.0, 0.3, 0, 0, 0, 1.2, 1.1, 1.0));
        for (let i = 0; i < 10; i++) {
            const a = i / 10 * TAU * 0.85 + 2.2;
            const r = 0.9 - i * 0.06;
            b.add(mesh(sphere(r, 12, 10), i % 2 ? SC : SC2, Math.sin(a) * 2.1, -0.8 - i * 0.05, Math.cos(a) * 2.1));
        }
        for (const s of [-1, 1]) {
            b.add(mesh(cylinder(0.32, 0.24, 1.6, 8, 1), SC, s * 1.55, 0.45, 0.9, 0.9, 0, s * 0.35));
            for (let c = 0; c < 3; c++) b.add(mesh(cylinder(0.08, 0, 0.45, 5, 1), HORN, s * (1.95 + (c - 1) * 0.18), 0.05, 1.75 + Math.abs(c - 1) * -0.08, 1.9, 0, 0));
        }
        // wings
        this.wings = [-1, 1].map(s => {
            const w = node(s * 1.1, 2.4, -1.4);
            w.add(mesh(cylinder(0.14, 0.09, 3.4, 6, 1), SC2, s * 1.7, 0, 0, 0, 0, Math.PI / 2));
            const tips = [[3.8, -0.25], [4.3, -0.9], [3.7, -1.6], [2.6, -2.3]];
            const fb = new GeoBuilder();
            const e0 = fb.vert(s * 3.4, 0, 0, 0, 1, 0, 0, 0);
            const ids = tips.map(([len, ang]) => fb.vert(s * 3.4 + Math.cos(ang) * len * s, 0, Math.sin(ang) * len, 0, 1, 0, 0, 0));
            const root0 = fb.vert(0, 0, 0.2, 0, 1, 0, 0, 0), root1 = fb.vert(s * 0.2, 0, -2.4, 0, 1, 0, 0, 0);
            for (let i = 0; i < ids.length - 1; i++) {
                const m = fb.vert((fb.p[ids[i] * 3] + fb.p[ids[i + 1] * 3]) * 0.4 + s * 3.4 * 0.2, -0.08, (fb.p[ids[i] * 3 + 2] + fb.p[ids[i + 1] * 3 + 2]) * 0.4, 0, 1, 0, 0, 0);
                fb.tri(e0, ids[i], m); fb.tri(e0, m, ids[i + 1]);
            }
            fb.tri(root0, e0, ids[ids.length - 1]); fb.tri(root0, ids[ids.length - 1], root1);
            w.add(mesh(fb.build(), new LitMaterial({ color: hexColor(WING), side: 'double' })));
            tips.forEach(([len, ang]) => {
                const dx = Math.cos(ang) * len * s, dz = Math.sin(ang) * len;
                const f = mesh(cylinder(0.07, 0.02, len, 5, 1), SC2, s * 3.4 + dx / 2, 0, dz / 2);
                f.rotation.set(Math.PI / 2, Math.atan2(dx, dz), 0);
                w.add(f);
            });
            b.add(w);
            w.sd = s;
            return w;
        });
        // neck segments
        this.neck = [];
        for (let i = 0; i < 9; i++) {
            const r = 0.72 - i * 0.035;
            const n = node();
            n.add(mesh(sphere(1, 12, 10), SC, 0, 0, 0, 0, 0, 0, r, r * 0.95, r * 1.2));
            n.add(mesh(sphere(1, 10, 8), BELLY, 0, -r * 0.3, r * 0.25, 0, 0, 0, r * 0.75, r * 0.6, r * 0.9));
            n.add(mesh(cylinder(0, 0.14, 0.45, 5, 1), HORN, 0, r * 0.95, -r * 0.1, -0.4, 0, 0));
            b.add(n);
            this.neck.push(n);
        }
        // head
        const head = this.head = node();
        head.add(mesh(sphere(1, 16, 12), SC, 0, 0.05, 0, 0, 0, 0, 0.8, 0.66, 1.05));
        head.add(mesh(sphere(1, 14, 10), SC, 0, -0.08, 0.95, 0, 0, 0, 0.52, 0.38, 0.75));
        head.add(mesh(box(0.7, 0.14, 0.95), SC2, 0, 0.3, 0.55, -0.15, 0, 0));
        for (const s of [-1, 1]) {
            head.add(mesh(cylinder(0, 0.18, 1.5, 7, 1), HORN, s * 0.45, 0.55, -0.55, -1.15, 0, s * -0.3));
            head.add(mesh(cylinder(0, 0.1, 0.7, 6, 1), HORN, s * 0.62, 0.2, -0.35, -1.4, 0, s * -0.9));
            head.add(mesh(sphere(0.2, 10, 8), yel, s * 0.42, 0.28, 0.5));
            head.add(mesh(sphere(1, 6, 4), ink, s * 0.5, 0.28, 0.63, 0, s * 0.6, 0, 0.035, 0.15, 0.04));
            head.add(mesh(box(0.42, 0.1, 0.2), SC2, s * 0.4, 0.48, 0.52, 0, 0, s * -0.35));
            head.add(mesh(sphere(0.06, 6, 4), fire, s * 0.18, 0.02, 1.62));
        }
        const jaw = this.jaw = node(0, -0.25, 0.1);
        jaw.add(mesh(sphere(1, 12, 10), SC2, 0, -0.1, 0.75, 0, 0, 0, 0.45, 0.16, 0.85));
        jaw.add(mesh(sphere(1, 10, 8), fire, 0, 0.0, 0.7, 0, 0, 0, 0.32, 0.06, 0.65));
        for (let i = 0; i < 6; i++) for (const s of [-1, 1]) jaw.add(mesh(cylinder(0, 0.05, 0.18, 4, 1), HORN, s * 0.28, 0.05, 0.3 + i * 0.2));
        head.add(jaw);
        for (let i = 0; i < 6; i++) for (const s of [-1, 1]) head.add(mesh(cylinder(0.05, 0, 0.18, 4, 1), HORN, s * 0.3, -0.3, 0.4 + i * 0.2));
        this.mouth = node(0, -0.2, 1.3);
        this.mouth.add(mesh(sphere(0.28, 8, 6), fire));
        this.mouth.noBake = true;
        head.add(this.mouth);
        b.add(head);
        this.mats = makeToonMaterials({ key: 2.8, rim: 0.6, spec: 0.5, outlineWidth: 0.03 });
        toonify(this.root, this.mats);
        this.headPos = V(0, 6, 1.6);
        this.headLook = V(0, 0, 1);
        this._tmp = V(); this._T = V();
        this.neckBase = V(0, 2.3, -0.3);
        this._bodyLocal = V(0, 1.4, -0.2);
    }

    aimPoint(out) { return this.toWorld(this.headPos, out); }

    attackTable(ctx) {
        const p2 = this.phase === 2;
        return [
            { kind: 'strike', w: 0.5 },
            { kind: 'breath', w: 0.22 },
            { kind: 'volley', w: 0.18 },
            { kind: 'meteors', w: p2 ? 0.22 : 0 }
        ];
    }

    update(dt, ctx) {
        this.baseUpdate(dt, ctx);
        const t = this.t, b = this.body;
        if (this.state === 'intro') {
            this.introT += dt;
            const u = clamp(this.introT / 2.6, 0, 1);
            b.position.y = lerp(-9, 0, 1 - Math.pow(1 - u, 3));
            if (u >= 1) this.state = 'fight';
        } else if (this.state === 'dying') {
            this.dieT += dt;
            b.position.y = -Math.pow(Math.max(0, this.dieT - 1.2), 2) * 3.5;
            if (Math.random() < 0.6) {
                const w = this.toWorld(V((Math.random() - 0.5) * 4, 1 + Math.random() * 5, (Math.random() - 0.5) * 3), V());
                ctx.fx.burst('fire', w, 8, { speed: 1.4 });
                if (Math.random() < 0.3) ctx.fx.burst('smoke', w, 3);
            }
            if (this.dieT > 3.4) this.gone = true;
        }
        const locked = this.atk && (this.atk.kind === 'strike' && this.atk.stage >= 1 || this.atk.kind === 'breath');
        if (!locked && this.state !== 'dying') this.yaw = dampAngle(this.yaw, ctx.player.theta, 1.8 * this.speedMul, dt);
        this.root.rotation.y = this.yaw;
        this.wings.forEach(w => { w.rotation.z = w.sd * (Math.sin(t * 1.6) * 0.35 + 0.35); w.rotation.y = w.sd * -0.2; });
        // head target
        const T = this._T;
        let k = 3.5;
        const a = this.atk;
        if (this.state === 'intro' || !a || a.kind === 'volley' || a.kind === 'meteors') {
            T.set(Math.sin(t * 0.8) * 0.5, 5.6 + Math.sin(t * 1.3) * 0.3, 1.9);
        } else if (a.kind === 'strike') {
            if (a.stage === 0) { this.toLocal(polar(a.theta, PATH.r * 0.8, a.gy + 9.5), T); k = 4; }
            else if (a.stage === 1) { this.toLocal(polar(a.theta, PATH.r, a.gy + 0.75), T); k = 22; }
            else { this.toLocal(polar(a.theta, PATH.r, a.gy + 0.75), T); T.y += Math.sin(t * 30) * 0.02; k = 30; }
        } else if (a.kind === 'breath') {
            this.toLocal(polar(a.theta, PATH.r, 1.1), T); k = 5;
        }
        if (this.state === 'dying') { T.set(0, Math.max(0.6, 5 - this.dieT * 3), 3.5); k = 3; }
        this.headPos.set(damp(this.headPos.x, T.x, k, dt), damp(this.headPos.y, T.y, k, dt), damp(this.headPos.z, T.z, k, dt));
        // face the knight / along the ring when breathing
        let look;
        if (a && a.kind === 'breath') {
            const ahead = polar(a.theta + a.dir * 0.8, PATH.r, 0.8);
            look = this.toLocal(ahead, V()).sub(this.headPos);
        } else if (a && a.kind === 'strike' && a.stage >= 1) look = V(0, -1, 0.35).add(this.toLocal(polar(a.theta, PATH.r * 1.2, 0), V()).sub(this.headPos).normalize());
        else look = this.toLocal(polar(ctx.player.theta, PATH.r, ctx.player.y + 1), V()).sub(this.headPos);
        look.normalize();
        this.headLook.lerp(look, 1 - Math.exp(-8 * dt)).normalize();
        const hd = this.headLook;
        this.head.position.copy(this.headPos);
        this.head.rotation.set(-Math.asin(clamp(hd.y, -1, 1)), Math.atan2(hd.x, hd.z), 0);
        // neck along a curve from the chest to the back of the head
        const P0 = this.neckBase;
        const P3 = V(this.headPos.x - hd.x * 0.9, this.headPos.y - hd.y * 0.9, this.headPos.z - hd.z * 0.9);
        const P1 = V(P0.x, P0.y + 2.4, P0.z - 0.4);
        const P2 = V(P3.x - hd.x * 1.6, P3.y + 1.2, P3.z - hd.z * 1.6);
        for (let i = 0; i < this.neck.length; i++) {
            const u = (i + 0.5) / this.neck.length, iu = 1 - u;
            const x = iu * iu * iu * P0.x + 3 * iu * iu * u * P1.x + 3 * iu * u * u * P2.x + u * u * u * P3.x;
            const y = iu * iu * iu * P0.y + 3 * iu * iu * u * P1.y + 3 * iu * u * u * P2.y + u * u * u * P3.y;
            const z = iu * iu * iu * P0.z + 3 * iu * iu * u * P1.z + 3 * iu * u * u * P2.z + u * u * u * P3.z;
            const dx = 3 * iu * iu * (P1.x - P0.x) + 6 * iu * u * (P2.x - P1.x) + 3 * u * u * (P3.x - P2.x);
            const dy = 3 * iu * iu * (P1.y - P0.y) + 6 * iu * u * (P2.y - P1.y) + 3 * u * u * (P3.y - P2.y);
            const dz = 3 * iu * iu * (P1.z - P0.z) + 6 * iu * u * (P2.z - P1.z) + 3 * u * u * (P3.z - P2.z);
            const n = this.neck[i];
            n.position.set(x, y, z);
            const l = Math.hypot(dx, dy, dz) || 1;
            n.rotation.set(-Math.asin(clamp(dy / l, -1, 1)), Math.atan2(dx, dz), 0);
        }
        // jaw + mouth glow
        const open = a && (a.kind === 'breath' || a.kind === 'volley' || (a.kind === 'strike' && a.stage === 0)) ? 0.55 : 0.08 + Math.max(0, Math.sin(t * 0.9)) * 0.1;
        this.jaw.rotation.x = damp(this.jaw.rotation.x, open, 8, dt);
        const mg = a && (a.kind === 'breath' || a.kind === 'volley') ? 1.6 : 0.5;
        this.mouth.scale.set(mg, mg, mg);
        if (Math.random() < 0.15 && this.state !== 'intro') {
            const w = this.toWorld(V(this.headPos.x + hd.x * 1.5, this.headPos.y + 0.1, this.headPos.z + hd.z * 1.5), V());
            ctx.fx.emit('smoke', w.x, w.y, w.z, 0, 0.8, 0, 0.8);
        }
        // embers drifting off the charred hide
        if (this.state !== 'dying' && Math.random() < (this.phase === 2 ? 0.7 : 0.4)) {
            const w = this.toWorld(V((Math.random() - 0.5) * 3.2, 0.4 + Math.random() * 2.4, -0.8 + (Math.random() - 0.5) * 2.4), V());
            ctx.fx.emit('spark', w.x, w.y, w.z, (Math.random() - 0.5) * 0.6, 1.5 + Math.random(), (Math.random() - 0.5) * 0.6, 1.2);
        }
        if (this.state === 'fight') {
            if (!this.atk) { this.cool -= dt * this.speedMul * (this.phase === 2 ? 1.35 : 1); if (this.cool <= 0) this.startAttack(ctx); }
            else this.runAttack(dt, ctx);
        }
    }

    startAttack(ctx) {
        const kind = this.pick(ctx);
        this.lastKind = kind;
        const P = ctx.player;
        const a = { kind, t: 0, stage: 0 };
        if (kind === 'strike') {
            const lead = clamp(P.vx * 0.3, -1.4, 1.4) / PATH.r;
            const tg = ctx.strikeTarget(wrapAngle(P.theta + lead));
            a.theta = tg.theta; a.gy = tg.gy;
            a.warn = (this.phase === 2 ? 0.8 : 1.05) / Math.max(1, this.speedMul * 0.95);
            a.tele = ctx.telegraph(a.theta, a.warn + 0.14, 2.4, [1, 0.4, 0.05], a.gy);
            this.windowHits = 0;
            ctx.audio && ctx.audio.sfx('growl');
        } else if (kind === 'breath') {
            const side = Math.random() < 0.5 ? 1 : -1;
            a.theta = wrapAngle(P.theta + side * (4.2 / PATH.r));
            a.dir = -side;
            ctx.audio && ctx.audio.sfx('bossroar');
        } else if (kind === 'volley' || kind === 'meteors') {
            ctx.audio && ctx.audio.sfx('growl');
        }
        this.atk = a;
    }

    runAttack(dt, ctx) {
        const a = this.atk, P = ctx.player;
        a.t += dt * this.speedMul;
        if (a.kind === 'strike') {
            if (a.stage === 0 && a.t >= a.warn) { a.stage = 1; a.hitT = 0; }
            if (a.stage === 1) {
                a.hitT += dt;
                if (a.hitT > 0.12) {
                    a.stage = 2; a.downT = 0;
                    ctx.impact(a.theta, 1.0, 1.6, 'fire', a.gy);
                    ctx.shake(0.6); ctx.audio && ctx.audio.sfx('slam');
                    const w = polar(a.theta, PATH.r, a.gy + 0.2);
                    ctx.fx.burst('dust', w, 20, { radius: 0.8, speed: 1.4 });
                    ctx.fx.burst('fire', w, 10);
                }
            }
            if (a.stage === 2) {
                a.downT += dt;
                const hurt = this.windowHits >= 3;
                if (a.downT > (this.phase === 2 ? 1.35 : 1.8) || hurt) {
                    this.atk = null; this.cool = hurt ? 1.1 : 0.8;
                    if (hurt) ctx.audio && ctx.audio.sfx('bossroar');
                }
            }
        } else if (a.kind === 'breath') {
            if (a.t > 0.9 && a.stage === 0) {
                a.stage = 1;
                ctx.runner({ kind: 'fire', theta: a.theta + a.dir * 0.12, dir: a.dir, speed: 4.4 + this.cycle * 0.4 + (this.phase === 2 ? 0.7 : 0), life: 2.8 });
                ctx.audio && ctx.audio.sfx('fireblast');
            }
            if (a.stage === 1 && a.t < 1.8) {
                const w = polar(a.theta + a.dir * 0.2, PATH.r, 0.9);
                for (let i = 0; i < 2; i++) ctx.fx.emit('fire', w.x, w.y, w.z, (Math.random() - 0.5) * 2, 1 + Math.random(), (Math.random() - 0.5) * 2, 2.2);
            }
            if (a.t > 2.0) { this.atk = null; this.cool = 1.0; }
        } else if (a.kind === 'volley') {
            const n = this.phase === 2 ? 4 : 3;
            if (a.stage < n && a.t > 0.55 + a.stage * 0.32) {
                const hw = this.toWorld(this.headPos, V());
                hw.x += this.headLook.x * 1.2; hw.z += this.headLook.z * 1.2;
                const tt = polar(P.theta + (a.stage - (n - 1) / 2) * 0.16, PATH.r, P.y + 0.8);
                ctx.shot({ kind: 'fire', from: hw, target: tt, speed: 7.2 + this.cycle * 0.5 });
                a.stage++;
            }
            if (a.t > 0.9 + n * 0.32) { this.atk = null; this.cool = 1.0; }
        } else if (a.kind === 'meteors') {
            if (a.stage < 5 && a.t > 0.3 + a.stage * 0.28) {
                const th = P.theta + (Math.random() - 0.5) * 1.2;
                ctx.faller({ kind: 'meteor', theta: th, delay: 1.0, gy: ctx.groundAt(th) });
                a.stage++;
            }
            if (a.t > 2.6) { this.atk = null; this.cool = 1.0; }
        }
    }

    weakPoints() {
        const a = this.atk;
        if (a && a.kind === 'strike' && a.stage === 2) return [{ theta: a.theta, y0: a.gy, y1: a.gy + 1.9, half: 0.95 }];
        return [];
    }
}

export function createBoss(level) {
    const k = (Math.max(1, level) - 1) % 3;
    return k === 0 ? new BoneTyrant(level) : k === 1 ? new BroodMother(level) : new AshWyrm(level);
}