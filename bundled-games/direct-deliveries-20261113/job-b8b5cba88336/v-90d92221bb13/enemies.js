// Enemies (skeleton, rat, bat, spider, dragon, fireballs) and collectibles (coins, key, chests, hourglass, hearts).
import { Node, Mesh, LitMaterial, BasicMaterial, InstancedMesh, box, cylinder, sphere, torus, merge, lathe, GeoBuilder, plane, extrude, Vec3, angleDiff, wrapAngle, clamp, damp, lerp, TAU, hexColor, toonify, makeToonMaterials } from './engine.js';
import { makeBillboardMaterial } from './graphics.js';
import { PATH, R, polar } from './tower.js';

// ======================================================================
// ENEMIES
// ======================================================================
// Enemies: skeletons, rats, bats, spiders, dragons and their fireballs.

let TOON = null;
function toonMats() { return TOON || (TOON = makeToonMaterials({ key: 3.0, rim: 0.5, spec: 0.45 })); }

const V = (x = 0, y = 0, z = 0) => new Vec3(x, y, z);
function mesh(geo, mat, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1) {
    const m = new Mesh(geo, mat);
    m.position.set(x, y, z); m.rotation.set(rx, ry, rz); m.scale.set(sx, sy, sz);
    return m;
}
function node(x = 0, y = 0, z = 0) { const n = new Node(); n.position.set(x, y, z); return n; }

let MATS = null;
function mats(M) {
    if (MATS) return MATS;
    MATS = {
        bone: new LitMaterial({ color: hexColor(0xf4ead2), roughness: 0.6, envStrength: 0.4, rimStrength: 0.25 }),
        boneDark: new LitMaterial({ color: hexColor(0x9d927a), roughness: 0.7, envStrength: 0.3 }),
        socket: new BasicMaterial({ color: [0.02, 0.01, 0.01] }),
        eyeRed: new BasicMaterial({ color: [1.0, 0.25, 0.08] }),
        eyeYellow: new BasicMaterial({ color: [1.0, 0.85, 0.25] }),
        eyeWhite: new BasicMaterial({ color: [1, 1, 1] }),
        rust: new LitMaterial({ color: hexColor(0x6e4a36), roughness: 0.65, metalness: 0.7, envStrength: 0.6 }),
        fur: new LitMaterial({ color: hexColor(0x8a6d5a), roughness: 0.95, envStrength: 0.15, rimStrength: 0.35 }),
        pink: new LitMaterial({ color: hexColor(0xf29a9a), roughness: 0.7, envStrength: 0.2 }),
        batSkin: new LitMaterial({ color: hexColor(0x5a4660), roughness: 0.85, envStrength: 0.2, rimStrength: 0.45 }),
        membrane: new LitMaterial({ color: hexColor(0x7a3a5a), roughness: 0.8, side: 'double', envStrength: 0.2, rimStrength: 0.35 }),
        spider: new LitMaterial({ color: hexColor(0x4a2e66), roughness: 0.35, metalness: 0.2, envStrength: 0.9, rimStrength: 0.4 }),
        spiderLeg: new LitMaterial({ color: hexColor(0x3a2450), roughness: 0.6, envStrength: 0.4 }),
        mark: new BasicMaterial({ color: [0.95, 0.12, 0.06] }),
        silk: new BasicMaterial({ color: [0.75, 0.75, 0.8], transparent: true, opacity: 0.55, depthWrite: false }),
        scales: new LitMaterial({ color: hexColor(0xc4301f), roughness: 0.45, metalness: 0.35, envStrength: 0.9, rimStrength: 0.35 }),
        belly: new LitMaterial({ color: hexColor(0xf2b45e), roughness: 0.6, envStrength: 0.4 }),
        wing: new LitMaterial({ color: hexColor(0x9a2a22), roughness: 0.75, side: 'double', envStrength: 0.25, rimStrength: 0.5 }),
        horn: new LitMaterial({ color: hexColor(0xd9ccb0), roughness: 0.5, envStrength: 0.5 }),
        wingBone: new LitMaterial({ color: hexColor(0x6a2a1e), roughness: 0.6, envStrength: 0.4 }),
        mouth: new BasicMaterial({ color: [1.0, 0.5, 0.12] }),
        fireCore: new BasicMaterial({ color: [1.0, 0.85, 0.45] })
    };
    return MATS;
}

class Base {
    constructor() {
        this.root = new Node();
        this.alive = true;
        this.dead = false; // fully removed
        this.flash = 0;
        this.killable = true;
    }
    place(theta, r, y, yaw) {
        this.root.position.set(Math.sin(theta) * r, y, Math.cos(theta) * r);
        this.root.rotation.y = yaw;
    }
}

// ---------------------------------------------------------------------------
export class Skeleton extends Base {
    constructor(spec, M) {
        super();
        const m = mats(M);
        this.kind = 'skeleton';
        this.p = spec.platform;
        this.theta = spec.theta !== undefined ? spec.theta : this.p.theta + (Math.random() - 0.5) * this.p.half;
        this.y = this.p.y;
        this.dir = Math.random() < 0.5 ? 1 : -1;
        this.face = this.dir;
        this.speed = 1.15;
        this.chase = !!spec.chase;        // boss minions hunt the knight around the ring
        this.rise = spec.rise ? 0 : 1;    // ...and claw their way up out of the floor
        this.ph = Math.random() * 10;
        this.pause = 0;
        this.halfW = 0.28; this.height = 1.45;
        const b = this.body = node(0, 0, 0);
        this.root.add(b);
        const hips = this.hips = node(0, 0.72, 0);
        b.add(hips);
        hips.add(mesh(box(0.26, 0.09, 0.14), m.bone));
        for (let i = 0; i < 4; i++) hips.add(mesh(cylinder(0.028, 0.03, 0.07, 6, 1), m.bone, 0, 0.07 + i * 0.075, -0.03));
        const chest = this.chest = node(0, 0.3, -0.01);
        hips.add(chest);
        for (let i = 0; i < 4; i++) {
            const rr = 0.155 - i * 0.012;
            chest.add(mesh(torus(rr, 0.017, 4, 14, Math.PI * 1.6), m.bone, 0, 0.26 - i * 0.075, 0, Math.PI / 2, 0.94, 0, 1, 1, 0.85));
        }
        chest.add(mesh(box(0.035, 0.24, 0.025), m.bone, 0, 0.16, 0.12));
        chest.add(mesh(box(0.34, 0.03, 0.04), m.bone, 0, 0.33, 0.0));
        const head = this.head = node(0, 0.45, 0.01);
        head.scale.set(1.55, 1.55, 1.55);
        chest.add(head);
        head.add(mesh(sphere(0.13, 12, 10), m.bone, 0, 0.1, 0, 0, 0, 0, 0.9, 1, 1.05));
        head.add(mesh(sphere(0.04, 8, 6), m.socket, 0.048, 0.1, 0.1));
        head.add(mesh(sphere(0.04, 8, 6), m.socket, -0.048, 0.1, 0.1));
        head.add(mesh(sphere(0.022, 6, 4), m.eyeRed, 0.048, 0.1, 0.132));
        head.add(mesh(sphere(0.022, 6, 4), m.eyeRed, -0.048, 0.1, 0.132));
        head.add(mesh(box(0.03, 0.04, 0.03), m.socket, 0, 0.05, 0.125));
        head.add(mesh(box(0.12, 0.025, 0.02), m.bone, 0, 0.015, 0.115));
        const jaw = this.jaw = node(0, 0.01, 0.02);
        jaw.add(mesh(box(0.13, 0.04, 0.11), m.bone, 0, -0.025, 0.04));
        head.add(jaw);
        const arm = (side) => {
            const s = node(side * 0.19, 0.3, 0);
            s.add(mesh(cylinder(0.022, 0.02, 0.27, 6, 1), m.bone, 0, -0.135, 0));
            const e = node(0, -0.28, 0);
            e.add(mesh(cylinder(0.02, 0.017, 0.25, 6, 1), m.bone, 0, -0.125, 0));
            e.add(mesh(box(0.05, 0.07, 0.05), m.bone, 0, -0.27, 0));
            s.add(e); s.elbow = e;
            chest.add(s);
            return s;
        };
        this.armL = arm(1); this.armR = arm(-1);
        const sword = node(0, -0.28, 0);
        sword.rotation.x = 1.45;
        sword.add(mesh(box(0.05, 0.6, 0.014), m.rust, 0, 0.36, 0));
        sword.add(mesh(box(0.16, 0.03, 0.03), m.rust, 0, 0.06, 0));
        this.armR.elbow.add(sword);
        const leg = (side) => {
            const l = node(side * 0.09, -0.02, 0);
            l.add(mesh(cylinder(0.026, 0.022, 0.33, 6, 1), m.bone, 0, -0.165, 0));
            const k = node(0, -0.34, 0);
            k.add(mesh(sphere(0.03, 6, 4), m.bone));
            k.add(mesh(cylinder(0.022, 0.018, 0.31, 6, 1), m.bone, 0, -0.16, 0));
            k.add(mesh(box(0.07, 0.04, 0.15), m.bone, 0, -0.33, 0.04));
            l.add(k); l.knee = k;
            hips.add(l);
            return l;
        };
        this.legL = leg(1); this.legR = leg(-1);
        this.materials = [m.bone];
    }
    get harmless() { return this.rise < 0.75; }
    update(dt, ctx) {
        const t = ctx.time + this.ph;
        if (!this.alive) return;
        const p = this.p;
        if (!p.active || this.fall) { this.fall = (this.fall || 0) + dt; this.y -= this.fall * 12 * dt; }
        else this.y = p.y;
        const pd = angleDiff(ctx.player.theta, this.theta) * PATH.r;
        if (this.rise < 1) {
            // clawing up out of the stone: arms first, then the rest
            this.rise = Math.min(1, this.rise + dt / 1.1);
            const u = this.rise, k = 1 - Math.pow(1 - u, 3);
            this.dir = Math.sign(pd) || 1; this.face = this.dir;
            this.place(this.theta, PATH.r, this.y - (1 - k) * 1.6, this.theta + this.face * (Math.PI / 2 - 0.35));
            this.armL.rotation.x = -2.6 + Math.sin(t * 14) * 0.3; this.armR.rotation.x = -2.5 + Math.sin(t * 14 + 1) * 0.3;
            this.armL.elbow.rotation.x = -0.3; this.armR.elbow.rotation.x = -0.3;
            this.chest.rotation.x = 0.4 * (1 - u);
            this.jaw.rotation.x = Math.max(0, Math.sin(t * 20)) * 0.4;
            if (Math.random() < 0.5) {
                const c = polar(this.theta + (Math.random() - 0.5) * 0.12, PATH.r + (Math.random() - 0.5) * 0.5, this.y + 0.05);
                ctx.fx.emit('dust', c.x, c.y, c.z, (Math.random() - 0.5), 1.2, (Math.random() - 0.5), 1.2);
            }
            if (u < 0.7 && Math.random() < 0.15) ctx.fx.chunk(polar(this.theta, PATH.r, this.y + 0.1), 1, [0.45, 0.4, 0.42], 0.1, 2.5);
            return;
        }
        const near = Math.abs(ctx.player.y - this.y) < 1.2 && Math.abs(pd) < 3.2 && ctx.player.alive;
        let spd = this.speed * ctx.enemySpeed * (near ? 1.7 : 1);
        if (this.chase && ctx.player.alive) {
            spd = this.speed * ctx.enemySpeed * (Math.abs(pd) < 2.5 ? 1.9 : 1.5);
            if (Math.sign(pd) !== this.dir && this.pause <= 0 && Math.abs(pd) > 0.35) { this.dir = Math.sign(pd); this.pause = 0.3; }
        } else if (near && Math.sign(pd) !== this.dir && this.pause <= 0 && Math.abs(pd) > 0.3) { this.dir = Math.sign(pd); this.pause = 0.25; }
        if (this.pause > 0) { this.pause -= dt; spd = 0; }
        this.theta += this.dir * spd * dt / PATH.r;
        if (p.half < Math.PI - 1e-3) {
            const lim = p.half - 0.3 / PATH.r;
            const off = angleDiff(this.theta, p.theta);
            if (off > lim) { this.theta = p.theta + lim; this.dir = -1; this.pause = 0.4; }
            if (off < -lim) { this.theta = p.theta - lim; this.dir = 1; this.pause = 0.4; }
        } else this.theta = wrapAngle(this.theta);
        this.face = damp(this.face, this.dir, 8, dt);
        this.place(this.theta, PATH.r, this.y, this.theta + this.face * (Math.PI / 2 - 0.35));
        // walk cycle
        const w = spd > 0 ? t * (5 + spd * 2) : 0;
        const s = Math.sin(w), amp = spd > 0 ? 0.6 : 0.05;
        this.legL.rotation.x = -s * amp; this.legR.rotation.x = s * amp;
        this.legL.knee.rotation.x = Math.max(0, Math.cos(w)) * amp * 1.3;
        this.legR.knee.rotation.x = Math.max(0, -Math.cos(w)) * amp * 1.3;
        this.armL.rotation.x = s * 0.5 - 0.2; this.armL.elbow.rotation.x = -0.4;
        this.armR.rotation.x = near ? -1.2 + Math.sin(t * 9) * 0.35 : -s * 0.4 - 0.4;
        this.armR.elbow.rotation.x = near ? -0.6 : -0.5;
        this.hips.position.y = 0.72 + Math.abs(Math.cos(w)) * 0.035;
        this.chest.rotation.x = 0.12 + (near ? 0.15 : 0);
        this.chest.rotation.y = s * 0.1;
        this.head.rotation.z = Math.sin(t * 1.7) * 0.12;
        this.jaw.rotation.x = Math.max(0, Math.sin(t * (near ? 22 : 8))) * 0.35;
        if (this.y < ctx.lavaY - 1 || this.fall > 3) this.kill(ctx, true);
    }
    hitbox() { return this.rise < 0.5 ? null : { theta: this.theta, y0: this.y, y1: this.y + 1.4, half: 0.3 }; }
    kill(ctx, silent) {
        if (!this.alive) return;
        this.alive = false; this.root.visible = false; this.dead = true;
        if (silent) return;
        const c = this.root.position.clone(); c.y = this.y + 0.8;
        ctx.fx.chunk(c, 14, [0.9, 0.86, 0.75], 0.11, 4.5);
        ctx.fx.burst('dust', c, 14, { radius: 0.3 });
        ctx.fx.burst('soul', c, 10);
        ctx.audio && ctx.audio.sfx('bones');
    }
}

// ---------------------------------------------------------------------------
export class Rat extends Base {
    constructor(spec, M) {
        super();
        const m = mats(M);
        this.kind = 'rat';
        this.p = spec.platform;
        this.theta = this.p.theta;
        this.y = this.p.y;
        this.dir = Math.random() < 0.5 ? 1 : -1;
        this.face = this.dir;
        this.ph = Math.random() * 10;
        this.pause = 0;
        this.halfW = 0.35;
        const b = this.body = node(0, 0, 0);
        b.scale.set(1.35, 1.35, 1.35);
        this.root.add(b);
        const torso = this.torso = node(0, 0.17, 0);
        b.add(torso);
        torso.add(mesh(sphere(1, 12, 10), m.fur, 0, 0, 0, 0, 0, 0, 0.15, 0.14, 0.28));
        const head = this.head = node(0, 0.05, 0.27);
        head.scale.set(1.35, 1.35, 1.35);
        torso.add(head);
        head.add(mesh(sphere(1, 10, 8), m.fur, 0, 0, 0.04, 0, 0, 0, 0.09, 0.085, 0.14));
        head.add(mesh(sphere(0.022, 6, 4), m.pink, 0, 0, 0.18));
        head.add(mesh(sphere(1, 8, 6), m.pink, 0.065, 0.08, 0.0, 0, 0, 0, 0.05, 0.055, 0.015));
        head.add(mesh(sphere(1, 8, 6), m.pink, -0.065, 0.08, 0.0, 0, 0, 0, 0.05, 0.055, 0.015));
        head.add(mesh(sphere(0.018, 6, 4), m.eyeRed, 0.045, 0.035, 0.1));
        head.add(mesh(sphere(0.018, 6, 4), m.eyeRed, -0.045, 0.035, 0.1));
        this.tail = [];
        let parent = torso;
        let z = -0.26;
        for (let i = 0; i < 8; i++) {
            const seg = node(0, i === 0 ? -0.02 : 0, i === 0 ? z : -0.07);
            seg.add(mesh(cylinder(0.017 - i * 0.0017, 0.019 - i * 0.0017, 0.075, 5, 1), m.pink, 0, 0, -0.035, Math.PI / 2, 0, 0));
            parent.add(seg);
            this.tail.push(seg);
            parent = seg;
        }
        this.legs = [];
        for (const [x, zz] of [[0.09, 0.14], [-0.09, 0.14], [0.1, -0.13], [-0.1, -0.13]]) {
            const l = node(x, -0.06, zz);
            l.add(mesh(cylinder(0.02, 0.016, 0.12, 5, 1), m.fur, 0, -0.06, 0));
            l.add(mesh(box(0.04, 0.02, 0.06), m.pink, 0, -0.12, 0.02));
            torso.add(l);
            this.legs.push(l);
        }
    }
    update(dt, ctx) {
        if (!this.alive) return;
        const t = ctx.time + this.ph;
        const p = this.p;
        if (!p.active || this.fall) { this.fall = (this.fall || 0) + dt; this.y -= this.fall * 12 * dt; } else this.y = p.y;
        let spd = 3.0 * ctx.enemySpeed;
        if (this.pause > 0) { this.pause -= dt; spd = 0; }
        else if (Math.random() < dt * 0.35) this.pause = 0.4 + Math.random() * 0.6;
        this.theta += this.dir * spd * dt / PATH.r;
        const lim = p.half - 0.35 / PATH.r;
        const off = angleDiff(this.theta, p.theta);
        if (off > lim) { this.theta = p.theta + lim; this.dir = -1; }
        if (off < -lim) { this.theta = p.theta - lim; this.dir = 1; }
        this.face = damp(this.face, this.dir, 12, dt);
        this.place(this.theta, PATH.r, this.y, this.theta + this.face * (Math.PI / 2 - 0.25));
        const w = t * 22;
        const moving = spd > 0;
        this.legs.forEach((l, i) => { l.rotation.x = moving ? Math.sin(w + (i % 2 ? Math.PI : 0) + (i > 1 ? 1 : 0)) * 0.8 : 0; });
        this.torso.position.y = 0.17 + (moving ? Math.abs(Math.sin(w)) * 0.02 : 0);
        this.head.rotation.x = moving ? 0 : Math.sin(t * 14) * 0.15 - 0.1;
        this.head.rotation.y = moving ? 0 : Math.sin(t * 5) * 0.4;
        this.tail.forEach((s, i) => { s.rotation.y = Math.sin(t * 8 - i * 0.7) * 0.25; s.rotation.x = -0.12 + (i === 0 ? -0.3 : 0.05); });
        if (this.y < ctx.lavaY - 1 || this.fall > 3) this.kill(ctx, true);
    }
    hitbox() { return { theta: this.theta, y0: this.y, y1: this.y + 0.5, half: 0.4 }; }
    kill(ctx, silent) {
        if (!this.alive) return;
        this.alive = false; this.root.visible = false; this.dead = true;
        if (silent) return;
        const c = this.root.position.clone(); c.y += 0.25;
        ctx.fx.burst('puff', c, 12, { radius: 0.2 });
        ctx.fx.burst('soul', c, 6);
        ctx.audio && ctx.audio.sfx('squeak');
    }
}

// ---------------------------------------------------------------------------
function wingGeo(pts) {
    const b = new GeoBuilder();
    const c = b.vert(0, 0, 0, 0, 0, 1, 0, 0);
    const ids = pts.map(p => b.vert(p[0], p[1], 0, 0, 0, 1, p[0], p[1]));
    for (let i = 0; i < ids.length - 1; i++) b.tri(c, ids[i], ids[i + 1]);
    return b.build();
}

export class Bat extends Base {
    constructor(spec, M) {
        super();
        const m = mats(M);
        this.kind = 'bat';
        this.home = spec.theta; this.homeY = spec.y; this.amp = spec.amp; this.spd = spec.speed; this.ph = spec.phase;
        this.theta = this.home; this.y = this.homeY;
        this.swoop = 0;
        const b = this.body = node(0, 0, 0);
        b.scale.set(1.25, 1.25, 1.25);
        this.root.add(b);
        b.add(mesh(sphere(1, 10, 8), m.batSkin, 0, 0, 0, 0, 0, 0, 0.1, 0.13, 0.09));
        b.add(mesh(sphere(0.1, 12, 10), m.batSkin, 0, 0.15, 0.02));
        b.add(mesh(cylinder(0.0, 0.045, 0.13, 5, 1), m.batSkin, 0.06, 0.26, 0.0, 0, 0, -0.35));
        b.add(mesh(cylinder(0.0, 0.045, 0.13, 5, 1), m.batSkin, -0.06, 0.26, 0.0, 0, 0, 0.35));
        b.add(mesh(sphere(1, 8, 6), m.eyeWhite, 0.038, 0.165, 0.106, 0, 0, 0.35, 0.03, 0.022, 0.012));
        b.add(mesh(sphere(1, 8, 6), m.eyeWhite, -0.038, 0.165, 0.106, 0, 0, -0.35, 0.03, 0.022, 0.012));
        b.add(mesh(sphere(0.012, 6, 4), m.eyeRed, 0.036, 0.163, 0.114));
        b.add(mesh(sphere(0.012, 6, 4), m.eyeRed, -0.036, 0.163, 0.114));
        b.add(mesh(box(0.012, 0.025, 0.01), m.bone, 0.015, 0.105, 0.075));
        b.add(mesh(box(0.012, 0.025, 0.01), m.bone, -0.015, 0.105, 0.075));
        const inner = [[0.0, 0.05], [0.14, 0.12], [0.3, 0.14], [0.32, -0.02], [0.2, -0.08], [0.08, -0.1], [0, -0.06]];
        const outer = [[0.0, 0.14], [0.2, 0.2], [0.42, 0.1], [0.36, 0.0], [0.26, -0.04], [0.14, 0.0], [0.06, -0.06], [0, -0.02]];
        this.wings = [];
        for (const side of [1, -1]) {
            const w = node(side * 0.06, 0.03, 0);
            const g = wingGeo(side > 0 ? inner : inner.map(p => [-p[0], p[1]]).reverse());
            w.add(new Mesh(g, m.membrane));
            const o = node(side * 0.3, 0.0, 0);
            o.add(new Mesh(wingGeo(side > 0 ? outer : outer.map(p => [-p[0], p[1]]).reverse()), m.membrane));
            w.add(o);
            w.outer = o; w.side = side;
            b.add(w);
            this.wings.push(w);
        }
    }
    update(dt, ctx) {
        if (!this.alive) return;
        const t = ctx.time;
        // accumulate the flight phase so speed changes (time-stop, greed) never jump the bat
        if (this.k === undefined) this.k = this.ph;
        this.k += dt * this.spd * 0.7 * ctx.enemySpeed;
        const k = this.k;
        const targetTheta = this.home + (this.amp / PATH.r) * Math.sin(k);
        let ty = this.homeY + Math.sin(k * 2.1) * 0.7;
        const pd = Math.abs(angleDiff(ctx.player.theta, this.theta)) * PATH.r;
        if (pd < 3.5 && Math.abs(ctx.player.y + 0.8 - this.homeY) < 3.5 && ctx.player.alive) {
            this.swoop = damp(this.swoop, 1, 2, dt);
        } else this.swoop = damp(this.swoop, 0, 1, dt);
        ty = lerp(ty, ctx.player.y + 0.9, this.swoop * 0.8);
        const prev = this.theta;
        this.theta = targetTheta;
        this.y = damp(this.y, ty, 3, dt);
        const vel = angleDiff(this.theta, prev) / Math.max(dt, 1e-4);
        this.place(this.theta, PATH.r, this.y, this.theta);
        this.body.rotation.z = clamp(-vel * 0.8, -0.5, 0.5);
        const f = Math.sin(t * 17 + this.ph);
        this.wings.forEach(w => {
            w.rotation.z = w.side * (f * 0.9 + 0.1);
            w.outer.rotation.z = w.side * (Math.sin(t * 17 + this.ph - 0.7) * 0.6);
            w.rotation.y = w.side * -0.25;
        });
        this.body.position.y = -f * 0.05;
    }
    hitbox() { return { theta: this.theta, y0: this.y - 0.25, y1: this.y + 0.35, half: 0.42 }; }
    kill(ctx, silent) {
        if (!this.alive) return;
        this.alive = false; this.root.visible = false; this.dead = true;
        if (silent) return;
        const c = this.root.position.clone();
        ctx.fx.burst('puff', c, 12, { radius: 0.2 });
        ctx.fx.burst('soul', c, 8);
        ctx.audio && ctx.audio.sfx('screech');
    }
}

// ---------------------------------------------------------------------------
export class Spider extends Base {
    constructor(spec, M) {
        super();
        const m = mats(M);
        this.kind = 'spider';
        this.p = spec.platform;
        this.theta = spec.theta;
        this.top = this.p.y + 5.0;
        this.bottom = this.p.y + 0.75;
        this.y = this.top - Math.random() * 2;
        this.state = 'wait'; this.timer = Math.random() * 2;
        this.ph = Math.random() * 10;
        const b = this.body = node(0, 0, 0);
        b.scale.set(1.35, 1.35, 1.35);
        this.root.add(b);
        b.add(mesh(sphere(1, 12, 10), m.spider, 0, 0.08, -0.05, 0, 0, 0, 0.2, 0.25, 0.18));
        b.add(mesh(sphere(0.11, 10, 8), m.spider, 0, -0.14, 0.02));
        b.add(mesh(box(0.05, 0.08, 0.02), m.mark, 0, 0.1, 0.128));
        b.add(mesh(box(0.08, 0.035, 0.02), m.mark, 0, 0.1, 0.128, 0, 0, 0.8));
        for (const sd of [-1, 1]) {
            b.add(mesh(sphere(1, 10, 8), m.eyeWhite, sd * 0.045, -0.1, 0.1, 0, 0, 0, 0.04, 0.05, 0.025));
            b.add(mesh(sphere(1, 8, 6), m.socket, sd * 0.043, -0.108, 0.122, 0, 0, 0, 0.02, 0.026, 0.01));
            b.add(mesh(sphere(0.012, 5, 4), m.eyeRed, sd * 0.02, -0.16, 0.11));
        }
        b.add(mesh(cylinder(0.0, 0.02, 0.07, 5, 1), m.bone, 0.03, -0.24, 0.07, 0.3, 0, 0));
        b.add(mesh(cylinder(0.0, 0.02, 0.07, 5, 1), m.bone, -0.03, -0.24, 0.07, 0.3, 0, 0));
        this.legs = [];
        for (let i = 0; i < 8; i++) {
            const side = i < 4 ? 1 : -1;
            const k = i % 4;
            const l = node(side * 0.08, -0.12 + k * 0.03, 0.02);
            l.rotation.set(0, 0, side * (0.5 - k * 0.12));
            l.rotation.x = (k - 1.5) * 0.35;
            l.add(mesh(cylinder(0.016, 0.012, 0.3, 5, 1), m.spiderLeg, side * 0.15, 0.06, 0, 0, 0, side * -1.2));
            const knee = node(side * 0.29, 0.13, 0);
            knee.add(mesh(cylinder(0.012, 0.006, 0.36, 5, 1), m.spiderLeg, side * 0.05, -0.17, 0, 0, 0, side * 0.3));
            l.add(knee);
            l.base = l.rotation.z; l.side = side; l.k = k;
            b.add(l);
            this.legs.push(l);
        }
        this.silk = new Mesh(box(0.012, 1, 0.012), m.silk);
        this.silk.frustumCulled = false;
        this.root.add(this.silk);
    }
    update(dt, ctx) {
        if (!this.alive) return;
        const t = ctx.time + this.ph;
        const sp = ctx.enemySpeed;
        this.timer -= dt;
        if (this.state === 'wait' && this.timer <= 0) this.state = 'down';
        if (this.state === 'down') { this.y -= dt * 2.6 * sp; if (this.y <= this.bottom) { this.y = this.bottom; this.state = 'hang'; this.timer = 1.0 + Math.random(); } }
        if (this.state === 'hang' && this.timer <= 0) this.state = 'up';
        if (this.state === 'up') { this.y += dt * 1.4 * sp; if (this.y >= this.top - 0.5) { this.state = 'wait'; this.timer = 1.2 + Math.random() * 1.5; } }
        const sway = Math.sin(t * 1.4) * 0.08;
        this.place(this.theta, PATH.r, this.y, this.theta + sway);
        this.body.rotation.z = sway * 2;
        const len = this.top + 6 - this.y;
        this.silk.scale.set(1, len, 1);
        this.silk.position.set(0, len / 2 + 0.2, 0);
        const busy = this.state === 'down' || this.state === 'up';
        this.legs.forEach((l, i) => {
            l.rotation.z = l.base + Math.sin(t * (busy ? 14 : 4) + i * 1.3) * (busy ? 0.18 : 0.06) * l.side;
        });
    }
    hitbox() { return { theta: this.theta, y0: this.y - 0.35, y1: this.y + 0.35, half: 0.35 }; }
    kill(ctx, silent) {
        if (!this.alive) return;
        this.alive = false; this.root.visible = false; this.dead = true;
        if (silent) return;
        const c = this.root.position.clone();
        ctx.fx.burst('puff', c, 12, { radius: 0.2 });
        ctx.fx.chunk(c, 8, [0.12, 0.08, 0.12], 0.07, 3);
        ctx.fx.burst('soul', c, 8);
        ctx.audio && ctx.audio.sfx('squish');
    }
}

// ---------------------------------------------------------------------------
export class Dragon extends Base {
    constructor(spec, M) {
        super();
        const m = mats(M);
        this.kind = 'dragon';
        this.killable = false;
        this.phi = spec.theta; this.homeY = spec.y; this.y = spec.y;
        this.dir = spec.dir; this.ph = spec.phase;
        this.canFire = spec.fire !== false;
        this.fireEvery = spec.fireEvery || 4;
        this.fireSpeed = spec.fireSpeed || 8;
        this.orbit = this.canFire ? 9.2 : 11.5;
        this.cool = this.fireEvery * (0.6 + Math.random() * 0.6);
        this.charge = 0;
        this.overFly = 0;
        const s = this.scaleNode = node(0, 0, 0);
        s.scale.set(0.8, 0.8, 0.8);
        this.root.add(s);
        // spine segments
        this.N = 17;
        this.segs = [];
        const segGeo = sphere(1, 12, 8);
        const spikeGeo = cylinder(0.0, 0.07, 0.28, 5, 1);
        for (let i = 0; i < this.N; i++) {
            const t = i / (this.N - 1);
            let r;
            if (i < 5) r = 0.2 + i * 0.045;
            else if (i < 9) r = 0.52 + Math.sin((i - 5) / 3 * Math.PI) * 0.1;
            else r = Math.max(0.05, 0.4 * Math.pow(1 - (i - 9) / 8, 1.3));
            const n = node();
            n.add(mesh(segGeo, m.scales, 0, 0, 0, 0, 0, 0, r, r * 0.92, r * 1.35));
            n.add(mesh(segGeo, m.belly, 0, -r * 0.25, 0, 0, 0, 0, r * 0.8, r * 0.7, r * 1.2));
            if (i > 1) n.add(mesh(spikeGeo, m.horn, 0, r * 0.92, -r * 0.2, -0.5, 0, 0, 1 + r, 1 + r * 1.5, 1 + r));
            s.add(n);
            n.r = r;
            this.segs.push(n);
        }
        // tail tip blade
        this.segs[this.N - 1].add(mesh(extrude([[0, 0.25], [-0.22, -0.05], [0, -0.45], [0.22, -0.05]], 0.03), m.scales, 0, 0, -0.2, Math.PI / 2, 0, 0));
        // head (bigger, horned, with a hinged jaw)
        const head = this.head = node();
        head.scale.set(1.45, 1.45, 1.45);
        s.add(head);
        head.add(mesh(segGeo, m.scales, 0, 0.02, 0.02, 0, 0, 0, 0.27, 0.23, 0.32));
        head.add(mesh(segGeo, m.scales, 0, -0.01, 0.38, 0, 0, 0, 0.17, 0.13, 0.3));
        head.add(mesh(box(0.3, 0.07, 0.42), m.scales, 0, 0.09, 0.25, -0.14, 0, 0));
        head.add(mesh(box(0.05, 0.05, 0.3), m.horn, 0, 0.14, 0.2, -0.1, 0, 0));
        for (const sd of [-1, 1]) {
            head.add(mesh(cylinder(0.0, 0.075, 0.7, 6, 1), m.horn, sd * 0.15, 0.24, -0.28, -1.15, 0, sd * -0.3));
            head.add(mesh(cylinder(0.0, 0.045, 0.36, 5, 1), m.horn, sd * 0.24, 0.08, -0.14, -1.35, 0, sd * -0.95));
            head.add(mesh(sphere(0.075, 10, 8), m.eyeYellow, sd * 0.16, 0.12, 0.17));
            head.add(mesh(sphere(1, 8, 6), m.socket, sd * 0.203, 0.12, 0.228, 0, sd * 0.6, 0, 0.012, 0.05, 0.025));
            head.add(mesh(box(0.1, 0.03, 0.12), m.scales, sd * 0.15, 0.17, 0.16, 0.25, 0, sd * 0.3));
            head.add(mesh(sphere(0.028, 5, 4), m.mouth, sd * 0.07, 0.03, 0.66));
            for (let k = 0; k < 3; k++) head.add(mesh(cylinder(0.0, 0.035, 0.18, 4, 1), m.horn, sd * (0.2 + k * 0.03), -0.05 - k * 0.04, -0.12 - k * 0.1, -1.9, 0, sd * -1.2));
        }
        const jaw = this.jaw = node(0, -0.08, 0.06);
        jaw.add(mesh(segGeo, m.belly, 0, -0.05, 0.28, 0, 0, 0, 0.15, 0.065, 0.33));
        for (let i = 0; i < 5; i++) for (const sd of [-1, 1]) jaw.add(mesh(cylinder(0.0, 0.022, 0.08, 4, 1), m.horn, sd * 0.09, 0.03, 0.1 + i * 0.1));
        for (let i = 0; i < 4; i++) for (const sd of [-1, 1]) head.add(mesh(cylinder(0.022, 0.0, 0.08, 4, 1), m.horn, sd * 0.1, -0.1, 0.18 + i * 0.1));
        head.add(jaw);
        this.mouthGlow = mesh(sphere(0.11, 8, 6), m.mouth, 0, -0.07, 0.33);
        this.mouthGlow.noBake = true;
        head.add(this.mouthGlow);
        // front claws
        for (const sd of [1, -1]) {
            const l = node(sd * 0.28, -0.32, 1.0);
            l.add(mesh(cylinder(0.06, 0.04, 0.32, 6, 1), m.scales, 0, -0.14, 0));
            l.add(mesh(cylinder(0.0, 0.025, 0.12, 4, 1), m.horn, 0, -0.32, 0.05, 1.3, 0, 0));
            s.add(l);
        }
        // wings: arm bone, four fingers with scalloped membrane
        this.wings = [];
        const fingerDefs = [[2.5, -0.12], [2.75, -0.52], [2.45, -0.92], [1.9, -1.3]];
        for (const sd of [1, -1]) {
            const w = node(sd * 0.32, 0.38, 0.35);
            const elbowPos = [sd * 1.6, 0, 0.25];
            w.add(mesh(cylinder(0.075, 0.045, 1.62, 6, 1), m.wingBone, sd * 0.8, 0, 0.12, 0, -sd * 0.16, Math.PI / 2));
            const el = node(elbowPos[0], elbowPos[1], elbowPos[2]);
            el.add(mesh(cylinder(0.0, 0.05, 0.3, 5, 1), m.horn, sd * 0.05, 0.05, 0.14, 1.2, 0, 0));
            const tips = [];
            fingerDefs.forEach(([len, ang]) => {
                const dx = Math.cos(ang) * len * sd, dz = Math.sin(ang) * len;
                const f = mesh(cylinder(0.04, 0.012, len, 5, 1), m.wingBone, dx / 2, 0, dz / 2);
                f.rotation.set(Math.PI / 2, Math.atan2(dx, dz), 0);
                el.add(f);
                tips.push([dx, dz]);
            });
            const bm = new GeoBuilder();
            const e0 = bm.vert(0, 0, 0, 0, 1, 0, 0, 0);
            const tipIds = tips.map(t => bm.vert(t[0], 0, t[1], 0, 1, 0, 0, 0));
            for (let i = 0; i < tips.length - 1; i++) {
                const a2 = tips[i], b2 = tips[i + 1];
                const mid = bm.vert((a2[0] + b2[0]) * 0.36, -0.06, (a2[1] + b2[1]) * 0.36, 0, 1, 0, 0, 0);
                bm.tri(e0, tipIds[i], mid); bm.tri(e0, mid, tipIds[i + 1]);
            }
            el.add(new Mesh(bm.build(), m.wing));
            // inner membrane: shoulder -> elbow -> last finger tip -> body flank
            const lt = tips[tips.length - 1];
            const bi = new GeoBuilder();
            const a0 = bi.vert(0, 0, 0.3, 0, 1, 0, 0, 0);
            const a1 = bi.vert(elbowPos[0], 0, elbowPos[2], 0, 1, 0, 0, 0);
            const a2 = bi.vert(elbowPos[0] + lt[0], 0, elbowPos[2] + lt[1], 0, 1, 0, 0, 0);
            const a3 = bi.vert(sd * 0.55, -0.05, (elbowPos[2] + lt[1]) * 0.55, 0, 1, 0, 0, 0);
            const a4 = bi.vert(sd * 0.05, 0, -1.5, 0, 1, 0, 0, 0);
            bi.tri(a0, a1, a2); bi.tri(a0, a2, a3); bi.tri(a0, a3, a4);
            w.add(new Mesh(bi.build(), m.wing));
            w.add(el); w.el = el; w.sd = sd;
            s.add(w);
            this.wings.push(w);
        }
        // hind legs
        this.legs = [];
        for (const sd of [1, -1]) {
            const l = node(sd * 0.3, -0.35, -0.7);
            l.add(mesh(cylinder(0.1, 0.06, 0.5, 6, 1), m.scales, 0, -0.22, 0));
            l.add(mesh(cylinder(0.0, 0.035, 0.16, 4, 1), m.horn, 0, -0.5, 0.08, 1.2, 0, 0));
            s.add(l);
            this.legs.push(l);
        }
        this._pts = [];
        for (let i = 0; i < this.N; i++) this._pts.push(new Vec3());
        this._tmp = new Vec3();
        this.headWorld = new Vec3();
    }

    update(dt, ctx) {
        const t = ctx.time + this.ph;
        this.phi = wrapAngle(this.phi + this.dir * dt * 0.27 * ctx.enemySpeed);
        const toCam = Math.abs(angleDiff(this.phi, ctx.camTheta));
        const pdy = this.homeY - ctx.player.y;
        // swoop above the knight when crossing in front of the camera at the same height
        const inFront = toCam < 0.75 && Math.abs(pdy) < 4.5;
        this.overFly = damp(this.overFly, inFront ? 1 : 0, 1.5, dt);
        const ty = this.homeY + Math.sin(t * 0.5) * 2 + this.overFly * (4.2 - Math.min(0, pdy));
        this.y = damp(this.y, ty, 1.2, dt);
        const bank = this.dir * 0.25;
        this.place(this.phi, this.orbit, this.y, this.phi + this.dir * Math.PI / 2);
        this.root.rotation.z = -bank;
        // spine undulation (local, forward = +z)
        const flap = Math.sin(t * 3.2);
        const pts = this._pts;
        for (let i = 0; i < this.N; i++) {
            const z = 2.1 - i * 0.36;
            const y = Math.sin(t * 3.2 - i * 0.42) * 0.12 * (0.4 + i / this.N) + (i < 5 ? Math.pow((5 - i) / 5, 1.6) * 0.75 : 0);
            const x = Math.sin(t * 1.6 - i * 0.35) * 0.22 * (i / this.N) * (i > 8 ? 1.6 : 0.6);
            pts[i].set(x, y, z);
        }
        for (let i = 0; i < this.N; i++) {
            const a = pts[Math.max(0, i - 1)], b = pts[Math.min(this.N - 1, i + 1)];
            const s = this.segs[i];
            s.position.copy(pts[i]);
            const dx = a.x - b.x, dy = a.y - b.y, dz = a.z - b.z;
            s.rotation.y = Math.atan2(dx, dz);
            s.rotation.x = -Math.atan2(dy, Math.hypot(dx, dz));
        }
        // head looks toward the knight when attacking
        const hp = pts[0];
        this.head.position.set(hp.x, hp.y + 0.12, hp.z + 0.32);
        const wantLook = this.charge > 0 || Math.abs(angleDiff(this.phi, ctx.player.theta)) < 0.8;
        // compute yaw toward the tower/player in local space
        this.head.rotation.y = damp(this.head.rotation.y, wantLook ? this.dir * 0.9 : 0, 3, dt);
        this.head.rotation.x = damp(this.head.rotation.x, wantLook ? clamp((this.y - ctx.player.y) * 0.08, -0.4, 0.7) : 0.1, 3, dt);
        // wings
        this.wings.forEach(w => {
            w.rotation.z = w.sd * (flap * 0.85 + 0.22);
            w.el.rotation.z = w.sd * (Math.sin(t * 3.2 - 0.9) * 0.35 - 0.05);
            w.rotation.y = w.sd * -0.1;
        });
        this.legs.forEach((l, i) => { l.rotation.x = 0.9 + Math.sin(t * 2 + i) * 0.1; });
        // fire breath
        this.cool -= dt;
        const facing = Math.abs(angleDiff(this.phi, ctx.player.theta)) < 0.6 && Math.abs(this.y - ctx.player.y) < 9 && ctx.player.alive;
        if (this.charge > 0) {
            this.charge -= dt;
            this.jaw.rotation.x = damp(this.jaw.rotation.x, 0.65, 10, dt);
            this.mouthGlow.scale.set(1.5, 1.5, 1.5);
            if (this.charge <= 0) {
                this.head.updateWorld(this.head.parent.world);
                this.head.worldPosition(this.headWorld);
                ctx.spawnFireball(this.headWorld, ctx.player, this.fireSpeed);
                this.cool = this.fireEvery * (0.8 + Math.random() * 0.6);
            }
        } else {
            this.jaw.rotation.x = damp(this.jaw.rotation.x, 0.08 + Math.max(0, Math.sin(t * 0.7)) * 0.1, 6, dt);
            this.mouthGlow.scale.set(0.5, 0.5, 0.5);
            if (this.canFire && this.cool <= 0 && facing && this.overFly < 0.95) {
                this.charge = 0.55;
                ctx.audio && ctx.audio.sfx('roar');
            }
        }
    }
    hitbox() { return null; }
    kill() { }
}

// ---------------------------------------------------------------------------
export class Fireball {
    constructor(start, target, glowMat, M, speed = 8.5) {
        const m = mats(M);
        this.pos = start.clone();
        const d = new Vec3(target.x - start.x, target.y - start.y, target.z - start.z);
        const len = d.length() || 1;
        this.vel = d.scale(speed / len);
        this.alive = true;
        this.t = 0;
        this.root = new Node();
        this.core = new Mesh(sphere(0.2, 10, 8), m.fireCore);
        this.root.add(this.core);
        this.glow = new Mesh(plane(1, 1), glowMat);
        this.glow.scale.set(1.8, 1.8, 1.8);
        this.root.add(this.glow);
        this.light = { pos: this.pos, color: [5, 2.2, 0.5], range: 8 };
        this.root.position.copy(this.pos);
    }
    update(dt, ctx) {
        this.t += dt;
        this.pos.x += this.vel.x * dt; this.pos.y += this.vel.y * dt; this.pos.z += this.vel.z * dt;
        this.root.position.copy(this.pos);
        const pulse = 1 + Math.sin(this.t * 30) * 0.12;
        this.core.scale.set(pulse, pulse, pulse);
        if (Math.random() < 0.9) ctx.fx.emit('fire', this.pos.x, this.pos.y, this.pos.z, (Math.random() - 0.5), (Math.random() - 0.5) + 0.5, (Math.random() - 0.5), 1.4);
        if (Math.random() < 0.3) ctx.fx.emit('smoke', this.pos.x, this.pos.y, this.pos.z, 0, 0.5, 0, 0.8);
        const rAxis = Math.hypot(this.pos.x, this.pos.z);
        if (rAxis < R + 0.25 || this.t > 4 || this.pos.y < ctx.lavaY) this.explode(ctx);
    }
    explode(ctx, deflected) {
        if (!this.alive) return;
        this.alive = false;
        this.root.visible = false;
        ctx.fx.burst('fire', this.pos, 18, { radius: 0.2, speed: 1.5 });
        ctx.fx.burst('spark', this.pos, 16, { speed: deflected ? 1.4 : 1 });
        ctx.fx.burst('smoke', this.pos, 6);
        ctx.audio && ctx.audio.sfx(deflected ? 'clang' : 'boom');
    }
}

export function createEnemy(spec, M) {
    let e = null;
    switch (spec.type) {
        case 'skeleton': e = new Skeleton(spec, M); break;
        case 'rat': e = new Rat(spec, M); break;
        case 'bat': e = new Bat(spec, M); break;
        case 'spider': e = new Spider(spec, M); break;
        case 'dragon': e = new Dragon(spec, M); break;
    }
    if (e) toonify(e.root, toonMats());
    return e;
}

// ======================================================================
// ITEMS
// ======================================================================
// Collectibles: coins (instanced), keys, treasure chests, hourglasses, hearts.

let ITOON = null;
const itoon = () => ITOON || (ITOON = makeToonMaterials({ key: 3.0, rim: 0.6, spec: 0.8, outlineWidth: 0.02 }));

function coinGeometry() {
    return merge([
        { geo: cylinder(0.2, 0.2, 0.045, 18, 1), rot: V(Math.PI / 2, 0, 0) },
        { geo: torus(0.19, 0.022, 4, 18) },
        { geo: cylinder(0.1, 0.1, 0.06, 5, 1), rot: V(Math.PI / 2, 0, 0) }
    ]);
}

function keyModel(gold) {
    const n = new Node();
    const g = merge([
        { geo: torus(0.13, 0.04, 6, 16), pos: V(0, 0.22, 0) },
        { geo: sphere(0.05, 8, 6), pos: V(0, 0.22, 0) },
        { geo: cylinder(0.035, 0.035, 0.52, 8, 1), pos: V(0, -0.1, 0) },
        { geo: box(0.12, 0.05, 0.035), pos: V(0.07, -0.26, 0) },
        { geo: box(0.09, 0.05, 0.035), pos: V(0.055, -0.16, 0) },
        { geo: torus(0.045, 0.015, 4, 10), pos: V(0, 0.07, 0), rot: V(Math.PI / 2, 0, 0) }
    ]);
    n.add(new Mesh(g, gold));
    return n;
}

function chestModel(M) {
    const n = new Node();
    const body = new Mesh(merge([{ geo: box(0.72, 0.42, 0.46, 0.8), pos: V(0, 0.21, 0) }]), M.wood);
    const bands = new Mesh(merge([
        { geo: box(0.08, 0.44, 0.48), pos: V(-0.22, 0.21, 0) },
        { geo: box(0.08, 0.44, 0.48), pos: V(0.22, 0.21, 0) },
        { geo: box(0.74, 0.05, 0.48), pos: V(0, 0.03, 0) }
    ]), M.gold);
    const lid = new Node();
    lid.position.set(0, 0.42, -0.23);
    const lidMesh = new Mesh(merge([
        { geo: cylinder(0.23, 0.23, 0.72, 14, 1, { thetaStart: 0, thetaLength: Math.PI }), pos: V(0, 0, 0.23), rot: V(0, 0, Math.PI / 2) }
    ]), M.wood);
    const lidBands = new Mesh(merge([
        { geo: cylinder(0.245, 0.245, 0.08, 14, 1, { thetaStart: 0, thetaLength: Math.PI }), pos: V(-0.22, 0, 0.23), rot: V(0, 0, Math.PI / 2) },
        { geo: cylinder(0.245, 0.245, 0.08, 14, 1, { thetaStart: 0, thetaLength: Math.PI }), pos: V(0.22, 0, 0.23), rot: V(0, 0, Math.PI / 2) },
        { geo: box(0.12, 0.14, 0.04), pos: V(0, -0.02, 0.47) }
    ]), M.gold);
    lid.add(lidMesh, lidBands);
    const glow = new Mesh(box(0.62, 0.02, 0.38), new BasicMaterial({ color: [1, 0.8, 0.3] }));
    glow.position.set(0, 0.4, 0);
    glow.visible = false;
    n.add(body, bands, lid, glow);
    n.lid = lid; n.glow = glow;
    return n;
}

function hourglassModel(M) {
    const n = new Node();
    const glass = new LitMaterial({ color: [0.6, 0.95, 1.0], roughness: 0.05, metalness: 0.1, envStrength: 1.8, transparent: true, opacity: 0.45, emissive: [0.1, 0.3, 0.35] });
    const sand = new LitMaterial({ color: hexColor(0x7ff3ff), roughness: 0.6, emissive: [0.2, 0.55, 0.6] });
    n.add(new Mesh(merge([
        { geo: box(0.36, 0.05, 0.36), pos: V(0, 0.3, 0) },
        { geo: box(0.36, 0.05, 0.36), pos: V(0, -0.3, 0) },
        { geo: cylinder(0.022, 0.022, 0.6, 6, 1), pos: V(0.15, 0, 0.15) },
        { geo: cylinder(0.022, 0.022, 0.6, 6, 1), pos: V(-0.15, 0, 0.15) },
        { geo: cylinder(0.022, 0.022, 0.6, 6, 1), pos: V(0.15, 0, -0.15) },
        { geo: cylinder(0.022, 0.022, 0.6, 6, 1), pos: V(-0.15, 0, -0.15) }
    ]), M.gold));
    n.add(new Mesh(merge([
        { geo: lathe([[0.02, 0.1], [0.08, 0.18], [0.07, 0.22], [0.02, 0.24]], 12), pos: V(0, -0.3, 0) },
        { geo: lathe([[0.02, 0.0], [0.05, 0.02], [0.04, 0.06], [0.0, 0.08]], 12), pos: V(0, 0.02, 0) }
    ]), sand));
    const g = new Mesh(lathe([[0.0, -0.27], [0.12, -0.24], [0.13, -0.12], [0.03, 0], [0.13, 0.12], [0.12, 0.24], [0.0, 0.27]], 16), glass);
    n.add(g);
    return n;
}

function heartModel() {
    const pts = [];
    for (let i = 0; i < 24; i++) {
        const t = (i / 24) * TAU;
        const x = 16 * Math.pow(Math.sin(t), 3);
        const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
        pts.push([x * 0.014, y * 0.014]);
    }
    pts.reverse();
    const n = new Node();
    const mat = new LitMaterial({ color: hexColor(0xff3a4a), roughness: 0.2, metalness: 0.3, envStrength: 1.2, emissive: [0.45, 0.04, 0.08] });
    n.add(new Mesh(extrude(pts, 0.12, 0.05), mat));
    return n;
}

export class Items {
    constructor(desc, M, T) {
        this.root = new Node();
        this.M = M;
        this.list = [];
        const coins = desc.items.filter(i => i.type === 'coin');
        this.coinMesh = new InstancedMesh(coinGeometry(), M.gold, Math.max(1, coins.length));
        this.root.add(this.coinMesh);
        this.glowMat = makeBillboardMaterial(T.glow, [1, 0.8, 0.35], 'itemglow');
        this.glowMat.uniforms.uStrength = 0.9;
        this.glowMesh = new InstancedMesh(plane(1, 1), this.glowMat, 200);
        this.root.add(this.glowMesh);
        for (const it of desc.items) {
            const o = { type: it.type, theta: it.theta, y: it.y, alive: true, phase: Math.random() * TAU, t: 0, platform: it.platform };
            this._model(o, M);
            if (o.node) {
                if (it.type === 'chest') {
                    o.node.position.copy(polar(it.theta, PATH.r - 0.15, it.y));
                    o.node.rotation.y = it.theta;
                } else o.node.position.copy(polar(it.theta, PATH.r, it.y));
                this.root.add(o.node);
            }
            this.list.push(o);
        }
        this.coins = this.list.filter(o => o.type === 'coin');
        this.lights = [];
        this._v = new Vec3(); this._r = new Vec3(); this._s = new Vec3();
    }

    _model(o, M) {
        if (o.type === 'key') { o.node = keyModel(M.gold); o.glow = [1, 0.8, 0.3]; o.glowSize = 1.6; }
        else if (o.type === 'chest') { o.node = chestModel(M); o.glow = null; }
        else if (o.type === 'hourglass') { o.node = hourglassModel(M); o.glow = [0.3, 0.9, 1]; o.glowSize = 1.4; }
        else if (o.type === 'heart') { o.node = heartModel(); o.glow = [1, 0.25, 0.35]; o.glowSize = 1.3; }
        if (o.node) toonify(o.node, itoon());
    }

    // drop a new pickup into the world at runtime (boss hall hearts)
    spawn(type, theta, y) {
        const o = { type, theta, y, alive: true, phase: Math.random() * TAU, t: 0, platform: null };
        this._model(o, this.M);
        if (o.node) { o.node.position.copy(polar(theta, PATH.r, y)); o.node.scale.set(0.01, 0.01, 0.01); o.grow = 0; this.root.add(o.node); }
        this.list.push(o);
        return o;
    }

    update(dt, time, camTheta) {
        let n = 0, g = 0;
        const cm = this.coinMesh;
        for (const c of this.coins) {
            if (!c.alive && c.fly === undefined) continue;
            if (Math.abs(angleDiff(c.theta, camTheta)) > 1.9) continue;
            let y = c.y + Math.sin(time * 2.4 + c.phase) * 0.08;
            let s = 1, th = c.theta;
            if (!c.alive) {
                c.fly += dt;
                if (c.flyDir) {
                    // sprayed out by a ground-pound: a high arc away from the impact
                    y += c.fly * 7.5 - c.fly * c.fly * 9; th += c.flyDir * c.fly * 3.2 / PATH.r;
                    s = Math.max(0, 1 - Math.max(0, c.fly - 0.35) * 2.6) * (1 + Math.sin(c.fly * 9) * 0.15);
                } else { y += c.fly * 4; s = Math.max(0, 1 - c.fly * 3); }
                if (s <= 0) { c.fly = undefined; continue; }
            }
            polar(th, PATH.r, y, this._v);
            this._r.set(0, time * 3 + c.phase + (c.alive ? 0 : c.fly * 30), 0);
            this._s.set(s, s, s);
            cm.setAt(n++, this._v, this._r, this._s, [1, 1, 1]);
            if (c.alive && g < 190) {
                const gl = 0.75 + Math.sin(time * 5 + c.phase * 3) * 0.12;
                this._s.set(gl, gl, gl);
                this.glowMesh.setAt(g++, this._v, this._r.set(0, 0, 0), this._s, [0.55, 0.42, 0.14]);
            }
        }
        cm.count = n;
        this.lights.length = 0;
        for (const o of this.list) {
            if (!o.node) continue;
            const vis = Math.abs(angleDiff(o.theta, camTheta)) < 1.9;
            o.node.visible = vis && (o.alive || o.type === 'chest');
            if (!o.node.visible) continue;
            if (o.type === 'chest') {
                if (!o.alive && o.open < 1) {
                    o.open = Math.min(1, o.open + dt * 3);
                    const k = 1 - Math.pow(1 - o.open, 3);
                    o.node.lid.rotation.x = -k * 1.9;
                    o.node.glow.visible = true;
                }
                continue;
            }
            if (o.grow !== undefined && o.grow < 1) { o.grow = Math.min(1, o.grow + dt * 2.5); const k = 1 + Math.sin(o.grow * Math.PI) * 0.4; o.node.scale.set(o.grow * k, o.grow * k, o.grow * k); }
            const bob = Math.sin(time * 2 + o.phase) * 0.12;
            o.node.position.y = o.y + bob;
            o.node.rotation.y = time * (o.type === 'heart' ? 2 : 1.6) + o.phase;
            if (o.type === 'key') o.node.rotation.z = Math.sin(time * 1.3) * 0.25;
            if (o.glow && g < 200) {
                const p = o.node.position;
                this._v.set(p.x, p.y, p.z);
                const pulse = o.glowSize * (0.9 + Math.sin(time * 4 + o.phase) * 0.1);
                this._s.set(pulse, pulse, pulse);
                this.glowMesh.setAt(g++, this._v, this._r.set(0, 0, 0), this._s, o.glow);
                if (o.type === 'key') {
                    if (!o.light) o.light = { pos: new Vec3(), color: [2.2, 1.6, 0.5], range: 5 };
                    o.light.pos.copy(p);
                    this.lights.push(o.light);
                }
            }
        }
        this.glowMesh.count = g;
    }

    // player center: theta, y (feet) -> returns list of collected items
    collect(theta, y, out) {
        for (const o of this.list) {
            if (!o.alive) continue;
            const dArc = Math.abs(angleDiff(theta, o.theta)) * PATH.r;
            let hit;
            if (o.type === 'chest') hit = dArc < 0.75 && Math.abs(y - o.y) < 0.6;
            else hit = dArc < 0.55 && (o.y - y) > -0.3 && (o.y - y) < 1.75;
            if (hit) {
                o.alive = false;
                if (o.type === 'coin') o.fly = 0;
                if (o.type === 'chest') o.open = 0;
                out.push(o);
            }
        }
        return out;
    }

    // a ground-pound shakes loose everything within reach of the impact
    collectNear(theta, y, radius, out) {
        for (const o of this.list) {
            if (!o.alive) continue;
            const d = angleDiff(o.theta, theta) * PATH.r;
            if (Math.abs(d) > radius || o.y < y - 0.6 || o.y > y + 2.6) continue;
            o.alive = false;
            if (o.type === 'coin') { o.fly = 0; o.flyDir = d >= 0 ? 1 : -1; }
            if (o.type === 'chest') o.open = 0;
            out.push(o);
        }
        return out;
    }

    worldPos(o, out = new Vec3()) { return polar(o.theta, PATH.r, o.y + (o.type === 'chest' ? 0.4 : 0), out); }
}