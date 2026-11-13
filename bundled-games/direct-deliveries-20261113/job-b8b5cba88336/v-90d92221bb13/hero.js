// The knight: cartoon model with animations, sword trail, and the controller (physics, sword, damage, tunnels).
import { CONFIG } from './config.js';
import { Node, Mesh, LitMaterial, BasicMaterial, Geometry, box, cylinder, sphere, lathe, extrude, torus, plane, recomputeNormals, Vec3, damp, clamp, lerp, hexColor, toonify, makeToonMaterials, angleDiff, wrapAngle } from './engine.js';
import { PATH } from './tower.js';

// ======================================================================
// KNIGHT
// ======================================================================
// The knight: chibi arcade hero with toon shading, ink outlines, springy secondary motion,
// expressive eyes, a bouncy cape and a sword trail.

const PAINT = {};
function paint(hex) { return PAINT[hex] || (PAINT[hex] = new LitMaterial({ color: hexColor(hex) })); }
function mesh(geo, mat, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1) {
    const m = new Mesh(geo, typeof mat === 'number' ? paint(mat) : mat);
    m.position.set(x, y, z); m.rotation.set(rx, ry, rz); m.scale.set(sx, sy, sz);
    return m;
}
function node(x = 0, y = 0, z = 0) { const n = new Node(); n.position.set(x, y, z); return n; }

class Spring {
    constructor(k, c, x = 0) { this.k = k; this.c = c; this.x = x; this.v = 0; }
    step(target, dt) {
        const n = Math.max(1, Math.ceil(dt / 0.012));
        const h = dt / n;
        for (let i = 0; i < n; i++) {
            this.v += (this.k * (target - this.x) - this.c * this.v) * h;
            this.x += this.v * h;
        }
        return this.x;
    }
}

const STEEL = 0xd2dbe9, STEEL_D = 0x3f5590, GOLD = 0xffc23a, RED = 0xe8392c, RED_D = 0xb3221c;
const BLUE = 0x2f6fe8, LEATHER = 0x8a5230, PLUME = 0xff4d2a, PLUME2 = 0xffa21f, BLADE = 0xf2f7ff, BLADE_D = 0x9fb4d0;

export class KnightModel {
    constructor() {
        const white = new BasicMaterial({ color: [0.96, 0.95, 0.9] });
        const ink = new BasicMaterial({ color: [0.05, 0.03, 0.05] });
        const visor = new BasicMaterial({ color: [0.07, 0.035, 0.06] });

        const root = this.root = new Node();
        const body = this.body = node(0, 0, 0);
        root.add(body);
        const hips = this.hips = node(0, 0.46, 0);
        body.add(hips);
        hips.add(mesh(lathe([[0.255, -0.16], [0.24, -0.07], [0.218, 0.02], [0.2, 0.06]], 18), STEEL));
        hips.add(mesh(cylinder(0.214, 0.214, 0.06, 18, 1), LEATHER, 0, 0.03, 0));
        hips.add(mesh(box(0.09, 0.08, 0.035), GOLD, 0, 0.03, 0.212));
        hips.add(mesh(box(0.26, 0.17, 0.045), RED, 0, -0.1, 0.22, -0.12));
        hips.add(mesh(box(0.26, 0.15, 0.045), RED_D, 0, -0.09, -0.22, 0.12));

        const makeLeg = (side) => {
            const l = node(side * 0.1, -0.07, 0);
            l.add(mesh(cylinder(0.078, 0.07, 0.16, 10, 1), STEEL_D, 0, -0.08, 0));
            const knee = node(0, -0.16, 0);
            knee.add(mesh(sphere(0.072, 10, 8), STEEL, 0, 0, 0.015));
            knee.add(mesh(cylinder(0.08, 0.072, 0.12, 10, 1), STEEL, 0, -0.07, 0));
            const foot = node(0, -0.14, 0);
            foot.add(mesh(sphere(1, 12, 8), STEEL_D, 0, -0.035, 0.045, 0, 0, 0, 0.098, 0.072, 0.155));
            foot.add(mesh(sphere(1, 10, 6), STEEL, 0, -0.022, 0.125, 0, 0, 0, 0.072, 0.055, 0.065));
            knee.add(foot);
            l.add(knee);
            l.knee = knee; l.foot = foot;
            hips.add(l);
            return l;
        };
        this.legL = makeLeg(1);
        this.legR = makeLeg(-1);

        const torso = this.torso = node(0, 0.05, 0);
        hips.add(torso);
        torso.add(mesh(sphere(1, 18, 14), STEEL, 0, 0.2, 0, 0, 0, 0, 0.255, 0.235, 0.215));
        torso.add(mesh(sphere(1, 16, 10, { phiStart: -0.62, phiLength: 1.24, thetaStart: Math.PI * 0.3, thetaLength: Math.PI * 0.58 }), RED, 0, 0.2, 0, 0, 0, 0, 0.262, 0.242, 0.224));
        torso.add(mesh(box(0.055, 0.19, 0.03), GOLD, 0, 0.19, 0.222, -0.05));
        torso.add(mesh(box(0.15, 0.05, 0.03), GOLD, 0, 0.23, 0.218, -0.05));
        torso.add(mesh(cylinder(0.12, 0.145, 0.07, 14, 1), STEEL_D, 0, 0.43, 0));

        // head: oversized round helmet with a dark face opening and big cartoon eyes
        const head = this.head = node(0, 0.46, 0.0);
        torso.add(head);
        head.add(mesh(sphere(0.3, 22, 16), STEEL, 0, 0.27, 0, 0, 0, 0, 1, 0.96, 1));
        head.add(mesh(torus(0.268, 0.024, 6, 30), GOLD, 0, 0.13, 0, Math.PI / 2, 0, 0));
        head.add(mesh(torus(0.307, 0.024, 5, 22, Math.PI), GOLD, 0, 0.27, 0, 0, Math.PI / 2, 0));
        for (const s of [-1, 1]) head.add(mesh(sphere(0.045, 8, 6), GOLD, s * 0.29, 0.22, 0));
        head.add(mesh(sphere(1, 18, 12), visor, 0, 0.255, 0.235, 0, 0, 0, 0.215, 0.13, 0.09));
        const eyes = this.eyes = node(0, 0.258, 0.31);
        head.add(eyes);
        const pupils = this.pupils = node(0, 0, 0);
        const xEyes = this.xEyes = node(0, 0, 0.02);
        for (const s of [-1, 1]) {
            eyes.add(mesh(sphere(1, 14, 10), white, s * 0.08, 0, 0.012, 0, 0, 0, 0.064, 0.088, 0.04));
            pupils.add(mesh(sphere(1, 12, 8), ink, s * 0.082, -0.008, 0.043, 0, 0, 0, 0.033, 0.05, 0.02));
            pupils.add(mesh(sphere(0.012, 6, 4), white, s * 0.082 + 0.013, 0.017, 0.061));
            xEyes.add(mesh(box(0.1, 0.022, 0.02), ink, s * 0.078, 0, 0.03, 0, 0, 0.75));
            xEyes.add(mesh(box(0.1, 0.022, 0.02), ink, s * 0.078, 0, 0.03, 0, 0, -0.75));
        }
        eyes.add(pupils, xEyes);
        xEyes.visible = false;
        const plumeNode = this.plume = node(0, 0.54, -0.03);
        head.add(plumeNode);
        plumeNode.add(mesh(sphere(1, 12, 10), PLUME, 0, 0.06, 0.02, -0.3, 0, 0, 0.095, 0.1, 0.13));
        plumeNode.add(mesh(sphere(1, 12, 10), PLUME, 0, 0.1, -0.12, -0.7, 0, 0, 0.085, 0.085, 0.13));
        plumeNode.add(mesh(sphere(1, 10, 8), PLUME2, 0, 0.06, -0.25, -1.1, 0, 0, 0.068, 0.068, 0.11));

        const makeArm = (side) => {
            const sh = node(side * 0.275, 0.34, 0);
            sh.add(mesh(sphere(0.135, 14, 10, { thetaLength: Math.PI * 0.6 }), STEEL, 0, 0.0, 0, 0, 0, side * -0.3, 1.05, 0.88, 1.08));
            sh.add(mesh(torus(0.118, 0.017, 4, 16), GOLD, 0, -0.025, 0, Math.PI / 2, 0, side * -0.3));
            sh.add(mesh(cylinder(0.056, 0.05, 0.13, 8, 1), STEEL_D, 0, -0.09, 0));
            const elbow = node(0, -0.16, 0);
            elbow.add(mesh(sphere(0.056, 8, 6), STEEL));
            elbow.add(mesh(cylinder(0.062, 0.056, 0.1, 8, 1), STEEL, 0, -0.05, 0));
            const hand = node(0, -0.125, 0);
            hand.add(mesh(sphere(1, 10, 8), STEEL_D, 0, -0.01, 0, 0, 0, 0, 0.074, 0.074, 0.082));
            elbow.add(hand);
            sh.add(elbow);
            sh.elbow = elbow; sh.hand = hand;
            torso.add(sh);
            return sh;
        };
        this.armL = makeArm(1);
        this.armR = makeArm(-1);

        // round shield on the left forearm
        const shield = this.shield = node(0.1, -0.06, 0.03);
        shield.rotation.set(0, Math.PI / 2, 0);
        shield.add(mesh(cylinder(0.2, 0.2, 0.045, 26, 1), BLUE, 0, 0, 0, Math.PI / 2, 0, 0));
        shield.add(mesh(torus(0.2, 0.026, 6, 28), GOLD));
        shield.add(mesh(sphere(0.06, 10, 8), GOLD, 0, 0, 0.03));
        shield.add(mesh(box(0.045, 0.24, 0.02), GOLD, 0, 0, 0.03));
        shield.add(mesh(box(0.24, 0.045, 0.02), GOLD, 0, 0, 0.03));
        this.armL.elbow.add(shield);

        // chunky cartoon sword
        const sword = this.sword = node(0, -0.02, 0.0);
        sword.add(mesh(cylinder(0.029, 0.029, 0.16, 8, 1), LEATHER, 0, 0, 0));
        sword.add(mesh(sphere(0.05, 8, 6), GOLD, 0, -0.1, 0));
        sword.add(mesh(box(0.07, 0.055, 0.34), GOLD, 0, 0.1, 0));
        for (const s of [-1, 1]) sword.add(mesh(sphere(0.04, 8, 6), GOLD, 0, 0.1, s * 0.18));
        sword.add(mesh(extrude([[0.052, 0], [0.052, 0.6], [0, 0.78], [-0.052, 0.6], [-0.052, 0]], 0.03, 0.012), BLADE, 0, 0.12, 0, 0, Math.PI / 2, 0));
        sword.add(mesh(box(0.036, 0.5, 0.02), BLADE_D, 0, 0.42, 0));
        this.bladeBase = node(0, 0.22, 0); this.bladeTip = node(0, 0.9, 0);
        sword.add(this.bladeBase, this.bladeTip);
        this.armR.hand.add(sword);

        // cape (dynamic, not baked)
        this.capeCols = 5; this.capeRows = 7;
        this.capeW = 0.46; this.capeL = 0.62;
        const cg = plane(this.capeW, this.capeL, this.capeCols, this.capeRows);
        cg.dynamic = true;
        this.capeGeo = cg;
        this.capeRest = Float32Array.from(cg.positions);
        this.capeNode = node(0, 0.38, -0.19);
        torso.add(this.capeNode);

        // bake to toon meshes + outlines
        this.toon = makeToonMaterials({ key: 3.4, rim: 0.55, spec: 0.6 });
        toonify(root, this.toon);
        const capeMat = new LitMaterial({ toon: true, color: hexColor(0xc42a22), side: 'double', rimStrength: 0.4, toonKey: 3.2, toonSpec: 0.15 });
        const capeMesh = new Mesh(cg, capeMat);
        capeMesh.frustumCulled = false;
        this.capeNode.add(capeMesh);
        this.materials = [this.toon.toon, this.toon.toonDouble, capeMat];

        // cartoon stars that circle the head after a faceplant
        this.stars = node(0, 1.72, 0);
        const starMat = new BasicMaterial({ color: [1, 0.86, 0.28] });
        const starPts = [];
        for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2 + Math.PI / 2, r = i % 2 ? 0.045 : 0.11; starPts.push([Math.cos(a) * r, Math.sin(a) * r]); }
        const starGeo = extrude(starPts, 0.035);
        for (let i = 0; i < 4; i++) {
            const st = new Mesh(starGeo, starMat), a = i / 4 * Math.PI * 2;
            st.position.set(Math.sin(a) * 0.34, Math.sin(a * 2) * 0.05, Math.cos(a) * 0.34);
            this.stars.add(st);
        }
        this.stars.visible = false;
        root.add(this.stars);
        this.splatT = -1;

        // animation state
        this.a = {
            hipY: 0.46, torsoX: 0, torsoY: 0, torsoZ: 0, headX: 0, headY: 0, headZ: 0,
            legLX: 0, legRX: 0, kneeL: 0, kneeR: 0, footL: 0, footR: 0, legLZ: 0, legRZ: 0,
            armLX: 0, armLZ: 0, armRX: 0, armRZ: 0, elbowL: 0, elbowR: 0,
            swordX: 1.6, swordY: 0, bodyX: 0, bodyZoff: 0
        };
        this.sq = new Spring(260, 11, 1);
        this.plumeS = new Spring(90, 6, 0);
        this.plumeZS = new Spring(90, 6, 0);
        this.headS = new Spring(160, 10, 0);
        this.capeSwing = 0; this.capeLift = 0;
        this.runPhase = 0;
        this.time = 0;
        this.deadT = -1;
        this.winT = 0;
        this.idleT = 0; this.fidgetT = -1; this.nextFidget = 4 + Math.random() * 3;
        this.blinkT = 2 + Math.random() * 2;
        this.look = { x: 0, y: 0, tx: 0, ty: 0, t: 1 };
        this._wasGrounded = true;
    }

    setFlash(v, color) {
        for (const m of this.materials) { m.flash = v; if (color) m.flashColor = color; }
    }

    // takeoff + landing impulses (called from gameplay events)
    jump() { this.sq.x = 1.3; this.sq.v = 2; this.headS.v -= 2; }
    land(speed) {
        const k = clamp(0.14 + speed * 0.012, 0.16, 0.4);
        this.sq.x = 1 - k; this.sq.v = 0;
        this.headS.v -= 1.5 + speed * 0.1;
        this.plumeS.v += 4 + speed * 0.3;
    }
    swing() { this.sq.x = 0.86; this.sq.v = 0; }
    // faceplant after a long fall (see animate)
    splat() { this.splatT = 0; this._clonked = false; this.sq.x = 0.55; this.sq.v = 0; }
    smashLand() { this.sq.x = 0.5; this.sq.v = 0; this.headS.v -= 3; }
    hit() { this.sq.x = 0.72; this.sq.v = 0; }

    // p: { speed, grounded, vy, attack (0..1 or -1), hurt, dead, lava, win }
    animate(dt, p) {
        this.time += dt;
        const t = this.time, a = this.a;
        const spd = Math.abs(p.speed);
        const running = p.grounded && spd > 0.4;
        const idle = p.grounded && !running && p.attack < 0 && !p.dead && !p.win && !(p.hurt > 0);
        const tg = {};
        let sqTarget = 1;
        let bob = 0;

        // ---------- base: idle
        const br = Math.sin(t * 3.4);
        tg.hipY = 0.46; tg.torsoX = 0.05 + br * 0.02; tg.torsoY = 0; tg.torsoZ = 0;
        tg.headX = -0.05; tg.headY = Math.sin(t * 0.9) * 0.18; tg.headZ = Math.sin(t * 1.3) * 0.05;
        tg.legLX = 0.08; tg.legRX = -0.12; tg.kneeL = 0.1; tg.kneeR = 0.16; tg.footL = -0.08; tg.footR = -0.04; tg.legLZ = 0.06; tg.legRZ = -0.06;
        tg.armLX = -0.35; tg.armLZ = 0.28; tg.elbowL = -1.05;
        tg.armRX = -0.4 + br * 0.05; tg.armRZ = -0.3; tg.elbowR = -0.55;
        tg.swordX = 1.65 + br * 0.05; tg.swordY = 0; tg.bodyX = 0; tg.bodyZoff = 0;
        sqTarget = 1 + br * 0.03;

        if (idle) {
            this.idleT += dt;
            if (this.fidgetT < 0 && this.idleT > this.nextFidget) { this.fidgetT = 0; }
        } else { this.idleT = 0; this.fidgetT = -1; }
        if (this.fidgetT >= 0) {
            // sword twirl + little hop
            this.fidgetT += dt;
            const u = this.fidgetT / 1.1;
            tg.armRX = -1.2; tg.elbowR = -0.9; tg.armRZ = -0.5;
            tg.swordY = Math.min(1, u * 1.2) * Math.PI * 4;
            tg.headY = -0.35; tg.headX = -0.15;
            bob = Math.max(0, Math.sin(Math.min(1, u) * Math.PI)) * 0.06;
            if (u >= 1) { this.fidgetT = -1; this.idleT = 0; this.nextFidget = 4 + Math.random() * 4; this.sq.x = 0.85; }
        }

        if (running) {
            const f = clamp(spd / 5, 0, 1.25);
            this.runPhase += dt * (8 + spd * 1.3);
            const ph = this.runPhase;
            const s = Math.sin(ph), c = Math.cos(ph);
            bob = Math.abs(s) * 0.14 * f;
            tg.hipY = 0.44;
            tg.torsoX = 0.3 * f; tg.torsoY = s * 0.28 * f; tg.torsoZ = -c * 0.06;
            tg.headX = -0.22 * f; tg.headY = -s * 0.15; tg.headZ = c * 0.08;
            tg.legLX = -s * 1.05 * f; tg.legRX = s * 1.05 * f;
            tg.kneeL = (0.2 + Math.max(0, -c) * 1.5) * f + 0.1;
            tg.kneeR = (0.2 + Math.max(0, c) * 1.5) * f + 0.1;
            tg.footL = -0.25 * f; tg.footR = -0.25 * f; tg.legLZ = 0.03; tg.legRZ = -0.03;
            tg.armLX = s * 0.95 * f - 0.35; tg.armLZ = 0.35; tg.elbowL = -1.2;
            tg.armRX = -s * 1.0 * f - 0.35; tg.armRZ = -0.35; tg.elbowR = -0.8 - Math.max(0, s) * 0.5;
            tg.swordX = 1.8; tg.swordY = 0;
            sqTarget = 1 + Math.cos(ph * 2) * 0.08 * f;
        } else if (!p.grounded) {
            if (p.vy > 2) {
                tg.hipY = 0.48;
                tg.legLX = -1.2; tg.kneeL = 1.9; tg.legRX = 0.35; tg.kneeR = 1.0;
                tg.footL = 0.3; tg.footR = -0.2; tg.legLZ = 0.15; tg.legRZ = -0.15;
                tg.torsoX = -0.12;
                tg.armLX = -1.4; tg.armLZ = 0.9; tg.elbowL = -0.9;
                tg.armRX = -2.4; tg.armRZ = -0.7; tg.elbowR = -0.4; tg.swordX = 2.6;
                tg.headX = -0.3;
            } else if (p.vy > -3) {
                // apex: tuck into a ball
                tg.hipY = 0.5;
                tg.legLX = -1.5; tg.kneeL = 2.3; tg.legRX = -1.3; tg.kneeR = 2.2;
                tg.torsoX = 0.35;
                tg.armLX = -0.9; tg.armLZ = 0.6; tg.elbowL = -1.4;
                tg.armRX = -1.1; tg.armRZ = -0.6; tg.elbowR = -1.2; tg.swordX = 2.2;
                tg.headX = 0.05;
            } else {
                const fl = Math.sin(t * 22) * 0.35;
                tg.hipY = 0.46;
                tg.legLX = -0.5 + fl * 0.5; tg.kneeL = 0.7; tg.legRX = 0.35 - fl * 0.5; tg.kneeR = 0.4;
                tg.footL = -0.3; tg.footR = -0.4; tg.legLZ = 0.2; tg.legRZ = -0.2;
                tg.torsoX = 0.05;
                tg.armLX = -2.5 + fl; tg.armLZ = 1.0; tg.elbowL = -0.4;
                tg.armRX = -2.6 - fl; tg.armRZ = -1.0; tg.elbowR = -0.3; tg.swordX = 2.9;
                tg.headX = 0.3;
            }
            sqTarget = 1 + clamp(Math.abs(p.vy) / 30, 0, 0.14);
        }

        // sword attack: wind-up, huge overhead arc, follow-through with a lunge
        if (p.attack >= 0) {
            const u = p.attack;
            let sx, ex, sw, tw, tl, lunge;
            if (u < 0.22) { const q = u / 0.22; const e = q * (2 - q); sx = lerp(-0.4, -2.8, e); ex = lerp(-0.55, -1.5, e); sw = lerp(1.65, 2.2, e); tw = lerp(0, -0.5, e); tl = lerp(0.05, -0.2, e); lunge = -0.04 * e; }
            else if (u < 0.5) { const q = (u - 0.22) / 0.28; const e = 1 - Math.pow(1 - q, 3); sx = lerp(-2.8, -0.15, e); ex = lerp(-1.5, -0.15, e); sw = lerp(2.2, 2.6, e); tw = lerp(-0.5, 0.65, e); tl = lerp(-0.2, 0.5, e); lunge = lerp(-0.04, 0.16, e); }
            else { const q = (u - 0.5) / 0.5; const e = q * q * (3 - 2 * q); sx = lerp(-0.15, -0.4, e); ex = lerp(-0.15, -0.55, e); sw = lerp(2.6, 1.65, e); tw = lerp(0.65, 0, e); tl = lerp(0.5, 0.05, e); lunge = lerp(0.16, 0, e); }
            tg.armRX = sx; tg.elbowR = ex; tg.swordX = sw; tg.armRZ = -0.3; tg.swordY = 0;
            tg.torsoY = tw; tg.torsoX = tl; tg.bodyZoff = lunge;
            tg.armLX = -0.7; tg.armLZ = 0.55; tg.elbowL = -1.4;
            if (p.grounded) { tg.legLX = -0.55; tg.legRX = 0.45; tg.kneeL = 0.5; tg.kneeR = 0.3; }
        }
        if (p.hurt > 0) {
            tg.torsoX = -0.55; tg.headX = -0.5; tg.armLX = -1.6; tg.armRX = -1.8; tg.armLZ = 1.1; tg.armRZ = -1.1;
            tg.legLX = -0.6; tg.legRX = 0.3;
        }
        if (p.win) {
            this.winT += dt;
            const u = Math.min(1, this.winT / 0.35);
            tg.armRX = lerp(-0.4, -3.05, u); tg.elbowR = -0.05; tg.swordX = 3.1; tg.armRZ = -0.2; tg.swordY = 0;
            tg.armLX = -2.6; tg.armLZ = 0.9; tg.elbowL = -0.3;
            tg.headX = -0.35; tg.torsoX = -0.15;
            const hop = Math.abs(Math.sin(this.winT * 6));
            bob = hop * 0.25 * u;
            tg.legLX = -0.4 * hop; tg.kneeL = 0.8 * hop; tg.legRX = -0.4 * hop; tg.kneeR = 0.8 * hop;
            sqTarget = 1 + (hop - 0.5) * 0.12;
        } else this.winT = 0;

        if (p.dead) {
            this.deadT = this.deadT < 0 ? 0 : this.deadT + dt;
            const u = Math.min(1, this.deadT / 0.6);
            if (p.lava) {
                const fl = Math.sin(t * 24);
                tg.armLX = -2.8 + fl * 0.4; tg.armRX = -2.9 - fl * 0.4; tg.armLZ = 1.1; tg.armRZ = -1.1;
                tg.legLX = -0.8 + fl * 0.6; tg.legRX = -0.8 - fl * 0.6; tg.kneeL = 1.2; tg.kneeR = 1.2;
                tg.headX = -0.5; tg.swordX = 2.9;
            } else {
                tg.bodyX = -1.45 * u;
                tg.hipY = 0.46;
                tg.legLX = -0.5; tg.legRX = -0.3; tg.kneeL = 0.3; tg.kneeR = 0.2; tg.legLZ = 0.5; tg.legRZ = -0.5;
                tg.torsoX = -0.1; tg.headX = -0.3;
                tg.armLX = -1.2; tg.armRX = -1.4; tg.armLZ = 1.2; tg.armRZ = -1.2; tg.swordX = 1.6;
            }
        } else this.deadT = -1;

        // ground-pound dive: a quick somersault, then a tucked plunge with the sword pointing down
        let spinX = 0;
        if (p.dive) {
            const u = Math.min(1, (p.diveT || 0) / 0.18);
            spinX = u < 1 ? -u * Math.PI * 2 : 0;
            tg.hipY = 0.5;
            tg.legLX = -1.3; tg.kneeL = 2.0; tg.legRX = -1.1; tg.kneeR = 1.9; tg.legLZ = 0.12; tg.legRZ = -0.12;
            tg.footL = 0.3; tg.footR = 0.3;
            tg.torsoX = 0.3; tg.torsoY = 0; tg.headX = 0.25;
            tg.armRX = -0.25; tg.elbowR = -0.2; tg.armRZ = -0.25; tg.swordX = 3.0; tg.swordY = 0;
            tg.armLX = -0.4; tg.armLZ = 0.7; tg.elbowL = -1.2;
            sqTarget = 1.1;
        } else if (p.flail && !p.grounded && !p.dead) {
            // a long fall: windmilling arms, kicking legs
            const fl = Math.sin(t * 34), fl2 = Math.cos(t * 29);
            tg.armLX = -2.9 + fl * 0.9; tg.armLZ = 1.3 + fl2 * 0.3; tg.elbowL = -0.2;
            tg.armRX = -2.9 - fl * 0.9; tg.armRZ = -1.3 - fl2 * 0.3; tg.elbowR = -0.2; tg.swordX = 2.9;
            tg.legLX = -0.7 + fl * 0.8; tg.legRX = -0.7 - fl * 0.8; tg.kneeL = 0.9; tg.kneeR = 0.9;
            tg.headX = 0.35 + fl2 * 0.12; tg.headZ = fl * 0.2; tg.torsoX = -0.1;
        }
        // faceplant: flat on the face, spring back up, the helmet pops off and clonks back on
        let splatX = 0, headPop = 0, headSpin = 0;
        if (this.splatT >= 0) {
            this.splatT += dt;
            const s = this.splatT;
            if (s > 0.28 && s < 0.5 && (Math.abs(p.speed) > 0.5 || !p.grounded)) this.splatT = 0.5;
            if (s < 0.5) {
                splatX = Math.min(1, s / 0.07) * 1.42;
                tg.armLX = -2.9; tg.armRX = -2.9; tg.armLZ = 0.5; tg.armRZ = -0.5; tg.elbowL = -0.1; tg.elbowR = -0.1;
                tg.legLX = 0.15; tg.legRX = 0.3; tg.kneeL = 0.05; tg.kneeR = 0.4; tg.headX = -0.35; tg.swordX = 2.4;
            } else if (s < 0.66) splatX = 1.42 * (1 - (s - 0.5) / 0.16);
            if (s > 0.46 && s < 0.9) { const q = (s - 0.46) / 0.44; headPop = Math.sin(q * Math.PI) * 0.85; headSpin = -q * Math.PI * 2; }
            if (s >= 0.9 && !this._clonked) { this._clonked = true; this.sq.x = 0.72; this.sq.v = 0; if (this.onClonk) this.onClonk(); }
            if (s > 2.3 || p.dead) this.splatT = -1;
        }
        const dizzy = this.splatT >= 0 && this.splatT < 1.5;
        this.stars.visible = this.splatT > 0.04;
        if (this.stars.visible) {
            const fade = this.splatT > 1.9 ? Math.max(0.01, 1 - (this.splatT - 1.9) / 0.4) : 1;
            this.stars.rotation.y = t * 7;
            this.stars.position.y = (splatX > 0.3 ? 0.55 : 1.72) + headPop;
            this.stars.position.z = splatX > 0.3 ? 1.25 : 0;
            this.stars.scale.set(fade, fade, fade);
        }

        // blend joints (snappy when attacking)
        const kk = p.attack >= 0 || p.dive || this.splatT >= 0 ? 38 : (p.dead ? 10 : 20);
        for (const key in tg) a[key] = damp(a[key], tg[key], kk, dt);

        // springs
        const sy = this.sq.step(sqTarget, dt);
        const hl = this.headS.step(0, dt);
        const plumeT = clamp(-p.vy * 0.045, -0.5, 0.7) + (running ? 0.35 : 0) + Math.sin(t * 2.5) * 0.05;
        const pl = this.plumeS.step(plumeT, dt);
        const plz = this.plumeZS.step(running ? Math.sin(this.runPhase) * 0.25 : 0, dt);

        // apply
        const sxz = 1 / Math.sqrt(Math.max(0.4, sy));
        this.body.scale.set(sxz, sy, sxz);
        this.body.rotation.x = a.bodyX + splatX;
        this.hips.rotation.x = spinX;
        this.body.position.set(0, bob + (p.dead && !p.lava ? 0.12 * Math.min(1, Math.max(0, this.deadT) / 0.6) : 0), a.bodyZoff);
        this.hips.position.y = a.hipY;
        this.torso.rotation.set(a.torsoX, a.torsoY, a.torsoZ);
        this.head.rotation.set(a.headX + hl * 0.6 + headSpin, a.headY, a.headZ);
        this.head.position.y = 0.46 + hl * 0.05 + headPop;
        this.legL.rotation.set(a.legLX, 0, a.legLZ); this.legR.rotation.set(a.legRX, 0, a.legRZ);
        this.legL.knee.rotation.x = a.kneeL; this.legR.knee.rotation.x = a.kneeR;
        this.legL.foot.rotation.x = a.footL; this.legR.foot.rotation.x = a.footR;
        this.armL.rotation.set(a.armLX, 0, a.armLZ); this.armR.rotation.set(a.armRX, 0, a.armRZ);
        this.armL.elbow.rotation.x = a.elbowL; this.armR.elbow.rotation.x = a.elbowR;
        this.sword.rotation.set(a.swordX, a.swordY, 0);
        this.plume.rotation.set(pl, 0, plz);

        // eyes: blink, look, squint, X
        this.blinkT -= dt;
        let open = 1;
        if (this.blinkT < 0.12) open = Math.abs(this.blinkT - 0.06) / 0.06 * 0.9 + 0.1;
        if (this.blinkT <= 0) this.blinkT = 2.2 + Math.random() * 2.8;
        const L = this.look;
        L.t -= dt;
        if (L.t <= 0) { L.t = 0.7 + Math.random() * 1.8; L.tx = idle ? (Math.random() - 0.5) * 1.6 : 0; L.ty = idle ? (Math.random() - 0.5) * 0.8 : 0; }
        const wantY = !p.grounded ? clamp(p.vy * 0.08, -1, 1) : L.ty;
        L.x = damp(L.x, running ? 0 : L.tx, 12, dt); L.y = damp(L.y, wantY, 12, dt);
        this.pupils.position.set(L.x * 0.018, L.y * 0.022, 0);
        let squint = 1;
        if (p.hurt > 0 || p.attack >= 0.2 && p.attack < 0.55) squint = 0.35;
        if (p.win) squint = 0.3;
        const xed = !!p.dead || dizzy;
        this.xEyes.visible = xed;
        this.pupils.visible = !xed && !p.win;
        let eyeY = p.dead ? 0.02 : open * squint;
        if (p.flail && !p.grounded) eyeY = 1.3;
        this.eyes.scale.set(1, Math.max(0.05, eyeY), 1);
        if (xed) { this.eyes.scale.set(1, 1, 1); this.eyes.children.forEach(c => { if (c !== this.xEyes) c.visible = c === this.pupils ? false : false; }); }
        else this.eyes.children.forEach(c => { if (c !== this.xEyes && c !== this.pupils) c.visible = true; });

        this._updateCape(dt, p, running);
    }

    _updateCape(dt, p, running) {
        const spd = Math.abs(p.speed);
        const targetSwing = clamp(spd / 5, 0, 1) * 1.0 + (p.grounded ? 0 : 0.35);
        this.capeSwing = damp(this.capeSwing, targetSwing, 6, dt);
        this.capeLift = damp(this.capeLift, clamp(-p.vy * 0.06, -0.7, 1.0), 6, dt);
        const t = this.time;
        const pos = this.capeGeo.positions, rest = this.capeRest;
        const cols = this.capeCols + 1, rows = this.capeRows + 1;
        for (let j = 0; j < rows; j++) {
            const d = 1 - j / (rows - 1);
            for (let i = 0; i < cols; i++) {
                const idx = (j * cols + i) * 3;
                const x = rest[idx];
                const u = i / (cols - 1);
                const flutter = Math.sin(t * 11 + d * 5 + u * 3) * 0.05 * d * (0.35 + this.capeSwing);
                const back = -0.05 * d - this.capeSwing * 0.42 * d * d - Math.max(0, this.capeLift) * 0.28 * d;
                const drop = -d * this.capeL * (1 - this.capeSwing * 0.25 - Math.max(0, this.capeLift) * 0.35);
                const lift = this.capeLift < 0 ? this.capeLift * 0.2 * d : 0;
                pos[idx] = x * (1 + d * 0.3) + Math.sin(t * 6 + d * 4) * 0.02 * d;
                pos[idx + 1] = drop + flutter * 0.4 - lift;
                pos[idx + 2] = back + flutter - Math.abs(x) * 0.14 * (1 - d * 0.5);
            }
        }
        recomputeNormals(this.capeGeo);
        this.capeGeo.needsUpdate = true;
    }

    bladeWorld(base, tip) {
        this.bladeBase.worldPosition(base);
        this.bladeTip.worldPosition(tip);
    }
}

// Wide glowing ribbon that follows the blade during a swing
export class SwordTrail {
    constructor(segments = 14) {
        this.n = segments;
        const verts = (segments + 1) * 2;
        const idx = [];
        for (let i = 0; i < segments; i++) {
            const a = i * 2;
            idx.push(a, a + 1, a + 3, a, a + 3, a + 2);
        }
        this.geo = new Geometry({ positions: new Float32Array(verts * 3), colors: new Float32Array(verts * 3), indices: idx });
        this.geo.dynamic = true;
        this.mesh = new Mesh(this.geo, new BasicMaterial({ transparent: true, blending: 'additive', depthWrite: false, vertexColors: true, side: 'double', color: [1, 1, 1] }));
        this.mesh.frustumCulled = false;
        this.hist = [];
        this.mesh.visible = false;
        this.fade = 0;
    }
    push(base, tip, active) {
        if (active) {
            this.hist.unshift([base.x, base.y, base.z, tip.x, tip.y, tip.z]);
            if (this.hist.length > this.n + 1) this.hist.length = this.n + 1;
            this.fade = 1;
        } else {
            this.fade = Math.max(0, this.fade - 0.14);
            if (this.hist.length) this.hist.pop();
        }
        const h = this.hist;
        this.mesh.visible = h.length > 1;
        if (!this.mesh.visible) return;
        const P = this.geo.positions, C = this.geo.colors;
        for (let i = 0; i <= this.n; i++) {
            const e = h[Math.min(i, h.length - 1)];
            const k = Math.pow(1 - i / this.n, 1.3) * this.fade;
            // extend slightly past the tip for a bolder arc
            const tx = e[3] + (e[3] - e[0]) * 0.12, ty = e[4] + (e[4] - e[1]) * 0.12, tz = e[5] + (e[5] - e[2]) * 0.12;
            P.set([e[0] + (e[3] - e[0]) * 0.1, e[1] + (e[4] - e[1]) * 0.1, e[2] + (e[5] - e[2]) * 0.1], i * 6);
            P.set([tx, ty, tz], i * 6 + 3);
            C.set([0.15 * k, 0.35 * k, 0.6 * k], i * 6);
            C.set([1.0 * k, 0.95 * k, 0.8 * k], i * 6 + 3);
        }
        this.geo.drawCount = (Math.min(h.length, this.n + 1) - 1) * 6;
        this.geo.needsUpdate = true;
    }
}

// ======================================================================
// PLAYER
// ======================================================================
// Knight controller: cylindrical platforming physics, sword timing, damage, tunnels.

export class Player {
    constructor(theta, y) {
        this.theta = theta; this.y = y;
        this.vx = 0; this.vy = 0;
        this.grounded = true; this.platform = null;
        this.facing = 1; this.faceSmooth = 1;
        this.coyote = 0; this.buffer = 0; this.jumpHeld = false; this.cut = false;
        this.hp = CONFIG.MAX_HP;
        this.invuln = 0; this.hurtT = 0; this.stun = 0;
        this.attackT = -1; this.attackCool = 0; this.attackHit = false;
        this.alive = true; this.dead = false; this.deathCause = ''; this.lava = false;
        this.win = false;
        this.door = null; this.doorT = 0; this.doorTarget = null; this.radius = PATH.r; this.doorFade = 1;
        this.dropT = 0;
        this.moved = false;
        this.stepT = 0;
        this.airTime = 0;
        this.slowT = 0;   // webbed: slower run and weaker jump
        this.diving = false; this.diveT = 0;   // ground-pound
        this.peakY = y;                          // highest point since leaving the ground
    }

    // thrown back up by a ground-pound that hit something
    bounce(v) {
        this.vy = v; this.grounded = false; this.platform = null; this.cut = true; this.coyote = 0; this.peakY = this.y; this.diving = false;
    }

    get attackProgress() { return this.attackT < 0 ? -1 : this.attackT / CONFIG.ATTACK_TIME; }
    get attackActive() { const u = this.attackProgress; return u >= 0.3 && u <= 0.62; }

    update(dt, input, tower, ev) {
        const C = CONFIG;
        this.invuln = Math.max(0, this.invuln - dt);
        this.hurtT = Math.max(0, this.hurtT - dt);
        this.stun = Math.max(0, this.stun - dt);
        this.attackCool = Math.max(0, this.attackCool - dt);
        this.dropT = Math.max(0, this.dropT - dt);
        this.slowT = Math.max(0, this.slowT - dt);
        const slow = this.slowT > 0 ? 0.45 : 1;

        if (this.dead) {
            if (this.lava) { this.vy = Math.max(this.vy - 22 * dt, -2.2); this.y += this.vy * dt; }
            else if (!this.grounded) {
                this.vy -= C.FALL_GRAVITY * dt; const yp = this.y; this.y += this.vy * dt;
                const land = tower.findLanding(this.theta, C.PLAYER_HALF_W, yp, this.y);
                const fl = tower.floor || tower.platforms.find(p => p.type === 'ground');
                if (land) { this.y = land.y; this.vy = 0; this.grounded = true; }
                else if (fl && this.y < fl.y) { this.y = fl.y; this.vy = 0; this.grounded = true; }
            }
            return;
        }
        if (this.win) { this.vx = 0; return; }

        // tunnel transition (Nebulus doors)
        if (this.door) {
            this.doorT += dt;
            const T1 = 0.45, T2 = 0.85, T3 = 1.35;
            if (this.doorT < T1) {
                const u = this.doorT / T1;
                this.radius = PATH.r - u * 0.75; this.doorFade = 1 - u;
                this.theta = this.theta + angleDiff(this.door.theta, this.theta) * Math.min(1, dt * 10);
            } else if (this.doorT < T2) {
                if (!this.doorSwapped) {
                    this.doorSwapped = true;
                    this.theta = this.doorTarget.theta;
                    this.y = this.doorTarget.y;
                    this.platform = this.doorTarget.platform;
                    ev.push({ type: 'doorSwap' });
                }
                this.radius = PATH.r - 0.75; this.doorFade = 0;
            } else if (this.doorT < T3) {
                const u = (this.doorT - T2) / (T3 - T2);
                this.radius = PATH.r - 0.75 * (1 - u); this.doorFade = u;
            } else {
                this.radius = PATH.r; this.doorFade = 1; this.door = null; this.doorSwapped = false;
                this.invuln = Math.max(this.invuln, 0.6);
            }
            this.vx = 0; this.vy = 0; this.grounded = true;
            return;
        }

        if (this.grounded) this.peakY = this.y;
        const ix = this.stun > 0 ? 0 : input.x;
        if (ix !== 0) { this.facing = ix; this.moved = true; }
        const target = ix * C.PLAYER_SPEED * slow;
        const acc = this.grounded ? C.PLAYER_ACCEL : C.AIR_ACCEL;
        if (this.diving) this.vx *= Math.exp(-10 * dt);
        else if (this.stun <= 0) {
            const d = target - this.vx;
            this.vx += clamp(d, -acc * dt, acc * dt);
        } else this.vx *= Math.exp(-2 * dt);

        // jump input
        if (input.jumpPressed) { this.buffer = C.JUMP_BUFFER; this.moved = true; }
        else this.buffer = Math.max(0, this.buffer - dt);
        this.jumpHeld = input.jumpHeld;
        if (this.grounded) { this.coyote = C.COYOTE; } else this.coyote = Math.max(0, this.coyote - dt);

        // attack
        if (input.attackPressed && this.attackT < 0 && this.attackCool <= 0 && this.stun <= 0) {
            this.attackT = 0; this.attackHit = false;
            ev.push({ type: 'swing' });
        }
        if (this.attackT >= 0) {
            this.attackT += dt;
            if (this.attackT >= C.ATTACK_TIME) { this.attackT = -1; this.attackCool = C.ATTACK_COOLDOWN; }
        }

        // enter tunnel door
        const door = this.availableDoor();
        if (door && input.enterPressed) {
            this.door = door; this.doorT = 0; this.doorTarget = door.other; this.doorSwapped = false;
            this.vx = 0;
            ev.push({ type: 'doorEnter' });
            return;
        }

        // ground-pound: press down in the air
        if (input.downPressed && !this.grounded && !this.diving && this.stun <= 0 && this.dropT <= 0) {
            this.diving = true; this.diveT = 0; this.vy = 4.2; this.cut = true; this.moved = true;
            ev.push({ type: 'diveStart' });
        }

        // drop through a ledge
        if (input.down && this.grounded && this.platform && this.platform.type !== 'ground' && this.platform.type !== 'top' && input.downPressed) {
            this.dropFrom = this.platform;
            this.dropT = 0.25; this.grounded = false; this.platform = null; this.y -= 0.05; this.coyote = 0;
        }

        if (this.buffer > 0 && (this.grounded || this.coyote > 0) && this.stun <= 0 && !this.diving) {
            this.vy = C.JUMP_VELOCITY * (slow < 1 ? 0.82 : 1);
            if (this.platform && this.platform.type === 'lift' && this.platform.dy > 0) this.vy += this.platform.dy / dt * 0.5;
            this.grounded = false; this.platform = null; this.buffer = 0; this.coyote = 0; this.cut = false;
            ev.push({ type: 'jump' });
        }
        if (!this.grounded && !this.jumpHeld && this.vy > 0 && !this.cut) { this.vy *= C.JUMP_CUT; this.cut = true; }

        // horizontal move around the tower
        this.theta = wrapAngle(this.theta + (this.vx * dt) / PATH.r);

        // vertical
        if (this.grounded && this.platform) {
            if (tower.stillOn(this.platform, this.theta, C.PLAYER_HALF_W)) {
                this.y = this.platform.y;
                this.vy = 0;
            } else {
                this.grounded = false; this.platform = null; this.coyote = C.COYOTE; this.cut = true;
            }
        }
        if (!this.grounded) {
            let g = this.vy > 0 ? C.GRAVITY : C.FALL_GRAVITY, maxFall = C.MAX_FALL;
            if (this.diving) {
                this.diveT += dt;
                if (this.diveT < 0.18) g = 20;          // a beat of hang time for the somersault
                else { g = 95; maxFall = 34; }          // then straight down, hard
            }
            this.vy = Math.max(-maxFall, this.vy - g * dt);
            if (input.down && this.vy < 0 && !this.diving) this.vy = Math.max(-C.MAX_FALL, this.vy - 25 * dt);
            const yp = this.y;
            this.y += this.vy * dt;
            if (this.y > this.peakY) this.peakY = this.y;
            this.airTime += dt;
            if (this.vy <= 0 && this.dropT <= 0) {
                const land = tower.findLanding(this.theta, C.PLAYER_HALF_W, yp, this.y);
                if (land) this._land(land, tower, ev);
            } else if (this.vy <= 0 && this.dropT > 0) {
                // while dropping through, still land on anything other than the ledge we left
                const land = tower.findLanding(this.theta, C.PLAYER_HALF_W, yp, this.y, this.dropFrom);
                if (land) this._land(land, tower, ev);
            }
            // the ground ring is solid: never fall through it, however fast or odd the fall
            if (!this.grounded && this.vy <= 0) {
                if (tower.floor === undefined) tower.floor = tower.platforms.find(p => p.type === 'ground') || null;
                const fl = tower.floor;
                if (fl && fl.active && this.y < fl.y) this._land(fl, tower, ev);
            }
        } else {
            this.airTime = 0;
            if (Math.abs(this.vx) > 1) {
                this.stepT -= dt * Math.abs(this.vx);
                if (this.stepT <= 0) { this.stepT = 1.25; ev.push({ type: 'step' }); }
            }
        }
    }

    // touching down: a ground-pound smash, a faceplant after a long fall, or a normal landing
    _land(land, tower, ev) {
        const speed = -this.vy;
        const fall = Math.max(0, this.peakY - land.y);
        this.y = land.y; this.vy = 0; this.grounded = true; this.platform = land;
        if (this.diving) {
            this.diving = false;
            ev.push({ type: 'smash', h: fall, speed, platform: land });
        } else if (fall >= (tower.splatH || 4.2)) {
            this.stun = Math.max(this.stun, 0.28); this.vx = 0;
            ev.push({ type: 'splat', h: fall, speed });
        } else if (this.airTime > 0.08) ev.push({ type: 'land', speed, fall });
        this.airTime = 0;
        this.peakY = this.y;
        if (tower.stepOn(land)) ev.push({ type: 'crumbleStart', platform: land });
    }

    availableDoor() {
        if (!this.grounded || !this.platform || !this.platform.door || this.door) return null;
        const d = this.platform.door;
        return Math.abs(angleDiff(this.theta, d.theta)) * PATH.r < 0.65 ? d : null;
    }

    hurt(fromTheta, cause) {
        if (this.invuln > 0 || this.dead || this.door || this.win) return false;
        this.hp -= 1;
        this.diving = false;
        this.invuln = CONFIG.INVULN_TIME;
        this.hurtT = 0.35;
        this.stun = 0.3;
        const dir = Math.sign(angleDiff(this.theta, fromTheta)) || -this.facing;
        this.vx = dir * 6;
        this.vy = 7.5;
        this.grounded = false; this.platform = null; this.cut = true;
        if (this.hp <= 0) this.kill(cause, false);
        return true;
    }

    lavaHit() {
        if (this.invuln > 0 || this.dead || this.door || this.win) return false;
        this.hp -= 1;
        this.diving = false;
        this.invuln = 1.6;
        this.hurtT = 0.4;
        this.stun = 0.15;
        this.vy = 12.2;
        this.grounded = false;
        this.platform = null;
        this.cut = false;
        this.peakY = this.y;
        if (this.hp <= 0) {
            this.kill('lava', true);
            return 'dead';
        }
        return 'hurt';
    }

    kill(cause, lava) {
        if (this.dead) return;
        this.dead = true; this.alive = false; this.lava = lava; this.deathCause = cause; this.diving = false;
        this.attackT = -1;
        if (!lava) { this.vy = Math.max(this.vy, 4); }
        else { this.vy = 9.5; this.grounded = false; this.platform = null; }
    }
}