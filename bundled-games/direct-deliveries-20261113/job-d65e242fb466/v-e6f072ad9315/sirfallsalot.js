// =====================================================================
//  SIR FALLS-A-LOT: HALLOWEEN EDITION
//  The arcade machine in the bedroom of How You Haunt Me. A Halloween take on Sir Falls-A-Lot: Castle Climber
//  (a haunted tower in violet fog, witch fire torches, pumpkins to grab instead of coins, ghosts and bats, a purple
//  dragon, cobwebs, a graveyard round the foot of the tower, and the knight in a red flannel shirt).
//
//  Porting notes:
//   * One file, no imports: its own small WebGL 2 engine (each original module keeps its own scope below).
//   * game.js imports createSirFallsArcade() from here and opens it when you play the cabinet. The game runs in
//     a shadow root over the page, so its markup and CSS never touch the house's.
//   * On a touch screen the game takes the whole screen with on-screen controls (stick, jump, sword, smash, the
//     doorway button); how to play sits behind HOW TO PLAY on the title and in the pause menu.
//   * Assets: assets/textures/sfal_logo_halloween.webp and the knight's voice lines assets/audio/sfal-*.mp3.
//     game.js maps their paths (ASSETS.arcade) the same way as the house's own files.
//   * Music: a little chiptune tracker plays public domain pieces (Bach's Toccata and Fugue in D minor on the
//     title, Grieg's In the Hall of the Mountain King on the climb), no music files.
//   * Best score and the sound setting are kept apart from the stand-alone game's (sfal-halloween-*).
// =====================================================================


// ======================================================================
//  config.js
// ======================================================================
const __config = (() => {
// Sir Falls-A-Lot: Castle Climber. Gameplay tuning (tower size, physics, scoring, difficulty curve).
const CONFIG = {
    // Tower geometry (world units)
    TOWER_RADIUS: 3.6,
    LEDGE_DEPTH: 1.6,
    PATH_RADIUS: 4.4,          // where the knight and ledge enemies walk
    TOWER_BASE_HEIGHT: 46,     // level 1 tower height
    TOWER_LEVEL_HEIGHT: 9,     // extra height per level
    TOWER_MAX_HEIGHT: 110,
    FIRST_TOWER_SEED: 1462,    // tower 1 is always this layout (early chest, secret passage, dragon)

    // Knight physics
    GRAVITY: 30,
    FALL_GRAVITY: 40,
    PLAYER_SPEED: 5.0,
    PLAYER_ACCEL: 42,
    AIR_ACCEL: 30,
    JUMP_VELOCITY: 11.4,
    JUMP_CUT: 0.55,
    MAX_FALL: 24,
    COYOTE: 0.11,
    JUMP_BUFFER: 0.15,
    PLAYER_HALF_W: 0.3,
    PLAYER_HEIGHT: 1.45,
    ATTACK_TIME: 0.34,
    ATTACK_COOLDOWN: 0.12,
    ATTACK_RANGE: 1.75,
    INVULN_TIME: 1.4,
    MAX_HP: 3,
    START_LIVES: 3,

    // Lava + greed
    LAVA_START_Y: -3.2,
    LAVA_BASE_SPEED: 0.34,
    LAVA_LEVEL_SPEED: 0.06,
    GREED_LAVA_MULT: 0.0065,
    MAX_LAVA_SPEED: 2.3,
    TIME_STOP_SECONDS: 4,

    // Scoring
    SCORE_COIN: 100,
    SCORE_KEY: 500,
    SCORE_TREASURE: 1000,
    SCORE_HOURGLASS: 200,
    SCORE_KILL: 150,
    SCORE_FIREBALL: 50,
    LEVEL_BONUS: 2000,
    GREED_COIN: 2,
    GREED_KEY: 10,
    GREED_TREASURE: 25,

    // Rendering
    FOV: 55,
    MAX_TORCH_LIGHTS: 5,

    // Difficulty curve: every value slides from EASY (tower 1) to HARD (tower RAMP_LEVELS + 1).
    // Features switch on from the tower number given in *_FROM.
    DIFFICULTY: {
        RAMP_LEVELS: 8,
        EASY: {
            height: 34, dyMin: 0.95, dyMax: 1.35, gapMax: 1.0, widthMin: 2.9, widthMax: 4.3,
            crumbleChance: 0.05, crumbleDelay: 1.3, liftChance: 0.05, flipChance: 0.12,
            ledgeEnemy: 0.09, spiderChance: 0.05, bats: 1, fireEvery: 7, fireSpeed: 6.0,
            lavaSpeed: 0.2, greedLava: 0.0028, enemySpeed: 0.75
        },
        HARD: {
            height: 90, dyMin: 1.2, dyMax: 1.8, gapMax: 2.0, widthMin: 2.0, widthMax: 3.2,
            crumbleChance: 0.2, crumbleDelay: 0.55, liftChance: 0.12, flipChance: 0.24,
            ledgeEnemy: 0.32, spiderChance: 0.13, bats: 7, fireEvery: 3, fireSpeed: 9.5,
            lavaSpeed: 0.55, greedLava: 0.0068, enemySpeed: 1.25
        },
        CRUMBLE_FROM: 2,
        LIFT_FROM: 2,
        SPIDER_FROM: 3,
        DRAGON_FIRE_FROM: 2
    }
};
return { CONFIG };
})();


// ======================================================================
//  engine.js
// ======================================================================
const __engine = (() => {
// Small dependency-free WebGL2 engine: math, scene graph, geometry builders, renderer (bloom, toon shading, ink lines) and toon outlines.

// ======================================================================
// MATH
// ======================================================================
// Small math toolkit for the WebGL engine (column-major 4x4 matrices).

class Vec3 {
    constructor(x = 0, y = 0, z = 0) { this.x = x; this.y = y; this.z = z; }
    set(x, y, z) { this.x = x; this.y = y; this.z = z; return this; }
    copy(v) { this.x = v.x; this.y = v.y; this.z = v.z; return this; }
    clone() { return new Vec3(this.x, this.y, this.z); }
    add(v) { this.x += v.x; this.y += v.y; this.z += v.z; return this; }
    sub(v) { this.x -= v.x; this.y -= v.y; this.z -= v.z; return this; }
    scale(s) { this.x *= s; this.y *= s; this.z *= s; return this; }
    length() { return Math.hypot(this.x, this.y, this.z); }
    normalize() { const l = this.length() || 1; return this.scale(1 / l); }
    distanceTo(v) { return Math.hypot(this.x - v.x, this.y - v.y, this.z - v.z); }
    lerp(v, t) { this.x += (v.x - this.x) * t; this.y += (v.y - this.y) * t; this.z += (v.z - this.z) * t; return this; }
}

const TAU = Math.PI * 2;
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const lerp = (a, b, t) => a + (b - a) * t;
const smooth01 = (t) => t * t * (3 - 2 * t);
const damp = (a, b, k, dt) => a + (b - a) * (1 - Math.exp(-k * dt));
function wrapAngle(a) {
    a = (a + Math.PI) % TAU;
    if (a < 0) a += TAU;
    return a - Math.PI;
}
const angleDiff = (a, b) => wrapAngle(a - b);
function dampAngle(a, b, k, dt) {
    return a + angleDiff(b, a) * (1 - Math.exp(-k * dt));
}

// Deterministic RNG (mulberry32)
function makeRng(seed) {
    let s = seed >>> 0;
    const rng = () => {
        s |= 0; s = (s + 0x6D2B79F5) | 0;
        let t = Math.imul(s ^ (s >>> 15), 1 | s);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    rng.range = (a, b) => a + (b - a) * rng();
    rng.int = (a, b) => Math.floor(a + (b - a + 1) * rng());
    rng.pick = (arr) => arr[Math.floor(rng() * arr.length)];
    rng.chance = (p) => rng() < p;
    return rng;
}

const M4 = {
    create() { const m = new Float32Array(16); m[0] = m[5] = m[10] = m[15] = 1; return m; },
    identity(o) { o.fill(0); o[0] = o[5] = o[10] = o[15] = 1; return o; },
    copy(o, a) { o.set(a); return o; },
    multiply(o, a, b) {
        const a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
        const a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
        const a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
        const a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];
        for (let i = 0; i < 4; i++) {
            const b0 = b[i * 4], b1 = b[i * 4 + 1], b2 = b[i * 4 + 2], b3 = b[i * 4 + 3];
            o[i * 4] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
            o[i * 4 + 1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
            o[i * 4 + 2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
            o[i * 4 + 3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
        }
        return o;
    },
    perspective(o, fovy, aspect, near, far) {
        const f = 1 / Math.tan(fovy / 2), nf = 1 / (near - far);
        o.fill(0);
        o[0] = f / aspect; o[5] = f; o[10] = (far + near) * nf; o[11] = -1; o[14] = 2 * far * near * nf;
        return o;
    },
    lookAt(o, eye, target, up) {
        let zx = eye.x - target.x, zy = eye.y - target.y, zz = eye.z - target.z;
        let l = Math.hypot(zx, zy, zz) || 1; zx /= l; zy /= l; zz /= l;
        let xx = up.y * zz - up.z * zy, xy = up.z * zx - up.x * zz, xz = up.x * zy - up.y * zx;
        l = Math.hypot(xx, xy, xz) || 1; xx /= l; xy /= l; xz /= l;
        const yx = zy * xz - zz * xy, yy = zz * xx - zx * xz, yz = zx * xy - zy * xx;
        o[0] = xx; o[1] = yx; o[2] = zx; o[3] = 0;
        o[4] = xy; o[5] = yy; o[6] = zy; o[7] = 0;
        o[8] = xz; o[9] = yz; o[10] = zz; o[11] = 0;
        o[12] = -(xx * eye.x + xy * eye.y + xz * eye.z);
        o[13] = -(yx * eye.x + yy * eye.y + yz * eye.z);
        o[14] = -(zx * eye.x + zy * eye.y + zz * eye.z);
        o[15] = 1;
        return o;
    },
    // Compose T * Ry * Rx * Rz * S  (Euler order YXZ)
    compose(o, p, r, s) {
        const cx = Math.cos(r.x), sx = Math.sin(r.x);
        const cy = Math.cos(r.y), sy = Math.sin(r.y);
        const cz = Math.cos(r.z), sz = Math.sin(r.z);
        // R = Ry * Rx * Rz
        const m00 = cy * cz + sy * sx * sz, m01 = -cy * sz + sy * sx * cz, m02 = sy * cx;
        const m10 = cx * sz, m11 = cx * cz, m12 = -sx;
        const m20 = -sy * cz + cy * sx * sz, m21 = sy * sz + cy * sx * cz, m22 = cy * cx;
        o[0] = m00 * s.x; o[1] = m10 * s.x; o[2] = m20 * s.x; o[3] = 0;
        o[4] = m01 * s.y; o[5] = m11 * s.y; o[6] = m21 * s.y; o[7] = 0;
        o[8] = m02 * s.z; o[9] = m12 * s.z; o[10] = m22 * s.z; o[11] = 0;
        o[12] = p.x; o[13] = p.y; o[14] = p.z; o[15] = 1;
        return o;
    },
    // Inverse-transpose of the upper 3x3, written into a 9-float array
    normalMatrix(o, m) {
        const a00 = m[0], a01 = m[1], a02 = m[2];
        const a10 = m[4], a11 = m[5], a12 = m[6];
        const a20 = m[8], a21 = m[9], a22 = m[10];
        const b01 = a22 * a11 - a12 * a21, b11 = -a22 * a10 + a12 * a20, b21 = a21 * a10 - a11 * a20;
        let det = a00 * b01 + a01 * b11 + a02 * b21;
        det = det ? 1 / det : 0;
        // inverse (row-major thinking), then transpose
        const i00 = b01 * det, i01 = (-a22 * a01 + a02 * a21) * det, i02 = (a12 * a01 - a02 * a11) * det;
        const i10 = b11 * det, i11 = (a22 * a00 - a02 * a20) * det, i12 = (-a12 * a00 + a02 * a10) * det;
        const i20 = b21 * det, i21 = (-a21 * a00 + a01 * a20) * det, i22 = (a11 * a00 - a01 * a10) * det;
        o[0] = i00; o[1] = i10; o[2] = i20;
        o[3] = i01; o[4] = i11; o[5] = i21;
        o[6] = i02; o[7] = i12; o[8] = i22;
        return o;
    },
    transformPoint(m, x, y, z, out) {
        out.x = m[0] * x + m[4] * y + m[8] * z + m[12];
        out.y = m[1] * x + m[5] * y + m[9] * z + m[13];
        out.z = m[2] * x + m[6] * y + m[10] * z + m[14];
        return out;
    },
    maxScale(m) {
        return Math.sqrt(Math.max(
            m[0] * m[0] + m[1] * m[1] + m[2] * m[2],
            m[4] * m[4] + m[5] * m[5] + m[6] * m[6],
            m[8] * m[8] + m[9] * m[9] + m[10] * m[10]));
    }
};

// Tileable value noise helpers used for procedural textures
function makeNoise2D(seed, period) {
    const rng = makeRng(seed);
    const P = period;
    const grid = new Float32Array(P * P);
    for (let i = 0; i < grid.length; i++) grid[i] = rng();
    return (x, y) => {
        const xi = Math.floor(x), yi = Math.floor(y);
        const xf = x - xi, yf = y - yi;
        const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
        const x0 = ((xi % P) + P) % P, y0 = ((yi % P) + P) % P;
        const x1 = (x0 + 1) % P, y1 = (y0 + 1) % P;
        const a = grid[y0 * P + x0], b = grid[y0 * P + x1];
        const c = grid[y1 * P + x0], d = grid[y1 * P + x1];
        return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
    };
}

// ======================================================================
// CORE
// ======================================================================
// Scene graph, geometry containers, textures and materials.

let _nodeId = 1;

class Node {
    constructor() {
        this.id = _nodeId++;
        this.position = new Vec3();
        this.rotation = new Vec3(); // Euler, order YXZ
        this.scale = new Vec3(1, 1, 1);
        this.children = [];
        this.parent = null;
        this.visible = true;
        this.local = M4.create();
        this.world = M4.create();
        this.autoUpdate = true;
        this.name = '';
    }
    add(...nodes) {
        for (const n of nodes) {
            if (n.parent) n.parent.remove(n);
            n.parent = this;
            this.children.push(n);
        }
        return this;
    }
    remove(n) {
        const i = this.children.indexOf(n);
        if (i >= 0) { this.children.splice(i, 1); n.parent = null; }
        return this;
    }
    removeFromParent() { if (this.parent) this.parent.remove(this); }
    updateWorld(parentWorld) {
        if (this.autoUpdate) M4.compose(this.local, this.position, this.rotation, this.scale);
        if (parentWorld) M4.multiply(this.world, parentWorld, this.local);
        else this.world.set(this.local);
        const ch = this.children;
        for (let i = 0; i < ch.length; i++) ch[i].updateWorld(this.world);
    }
    traverse(fn) {
        fn(this);
        for (const c of this.children) c.traverse(fn);
    }
    worldPosition(out = new Vec3()) {
        return out.set(this.world[12], this.world[13], this.world[14]);
    }
}

class Geometry {
    constructor({ positions, normals, uvs, colors, indices }) {
        this.positions = positions instanceof Float32Array ? positions : new Float32Array(positions);
        this.normals = normals ? (normals instanceof Float32Array ? normals : new Float32Array(normals)) : null;
        this.uvs = uvs ? (uvs instanceof Float32Array ? uvs : new Float32Array(uvs)) : null;
        this.colors = colors ? (colors instanceof Float32Array ? colors : new Float32Array(colors)) : null;
        const vc = this.positions.length / 3;
        if (indices) {
            this.indices = vc > 65535 ? new Uint32Array(indices) : new Uint16Array(indices);
        } else this.indices = null;
        this.count = this.indices ? this.indices.length : vc;
        this.dynamic = false;
        this.needsUpdate = true;
        this.gl = null; // renderer-owned buffers
        this.computeBounds();
    }
    computeBounds() {
        const p = this.positions;
        let minX = Infinity, minY = Infinity, minZ = Infinity, maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
        for (let i = 0; i < p.length; i += 3) {
            if (p[i] < minX) minX = p[i]; if (p[i] > maxX) maxX = p[i];
            if (p[i + 1] < minY) minY = p[i + 1]; if (p[i + 1] > maxY) maxY = p[i + 1];
            if (p[i + 2] < minZ) minZ = p[i + 2]; if (p[i + 2] > maxZ) maxZ = p[i + 2];
        }
        const c = new Vec3((minX + maxX) / 2, (minY + maxY) / 2, (minZ + maxZ) / 2);
        let r = 0;
        for (let i = 0; i < p.length; i += 3) {
            const d = (p[i] - c.x) ** 2 + (p[i + 1] - c.y) ** 2 + (p[i + 2] - c.z) ** 2;
            if (d > r) r = d;
        }
        this.boundCenter = c;
        this.boundRadius = Math.sqrt(r);
        this.minY = minY; this.maxY = maxY;
    }
    dispose() { this.disposed = true; }
}

class Texture {
    constructor(source, opts = {}) {
        this.source = source; // canvas / image / ImageData-like {width,height,data}
        this.wrap = opts.wrap || 'repeat';
        this.mipmaps = opts.mipmaps !== false;
        this.anisotropy = opts.anisotropy || 4;
        this.nearest = !!opts.nearest;
        this.needsUpdate = true;
        this.gl = null;
    }
}

let _matId = 1;
class Material {
    constructor(type, opts = {}) {
        this.id = _matId++;
        this.type = type; // 'lit' | 'basic' | 'shader' | 'points'
        this.transparent = !!opts.transparent;
        this.blending = opts.blending || 'normal'; // normal | additive | multiply
        this.depthWrite = opts.depthWrite !== undefined ? opts.depthWrite : !this.transparent;
        this.depthTest = opts.depthTest !== undefined ? opts.depthTest : true;
        this.side = opts.side || 'front'; // front | double | back
        this.fog = opts.fog !== undefined ? opts.fog : true;
        this.opacity = opts.opacity !== undefined ? opts.opacity : 1;
        this.renderOrder = opts.renderOrder || 0;
    }
}

class LitMaterial extends Material {
    constructor(opts = {}) {
        super('lit', opts);
        this.color = opts.color || [1, 1, 1];
        this.map = opts.map || null;
        this.normalMap = opts.normalMap || null;
        this.normalScale = opts.normalScale !== undefined ? opts.normalScale : 1;
        this.uvScale = opts.uvScale || [1, 1];
        this.roughness = opts.roughness !== undefined ? opts.roughness : 0.8;
        this.metalness = opts.metalness !== undefined ? opts.metalness : 0;
        this.emissive = opts.emissive || [0, 0, 0];
        this.vertexColors = !!opts.vertexColors;
        this.wave = opts.wave || 0; // cloth wave amplitude
        this.fogScale = opts.fogScale !== undefined ? opts.fogScale : 1;
        this.envStrength = opts.envStrength !== undefined ? opts.envStrength : 1;
        this.rimStrength = opts.rimStrength || 0;
        this.alphaTest = !!opts.alphaTest;
        this.macro = !!opts.macro;
        this.toon = !!opts.toon;
        this.toonKey = opts.toonKey !== undefined ? opts.toonKey : 3.2;
        this.toonSpec = opts.toonSpec !== undefined ? opts.toonSpec : 0.55;
        this.toonPL = opts.toonPL !== undefined ? opts.toonPL : 0.42;
        this.toonAmb = opts.toonAmb || [2.2, 0.1];
        this.flash = 0; // gameplay hit flash (adds white/red)
        this.flashColor = [1, 0.2, 0.1];
    }
}

class BasicMaterial extends Material {
    constructor(opts = {}) {
        super('basic', opts);
        this.color = opts.color || [1, 1, 1];
        this.map = opts.map || null;
        this.vertexColors = !!opts.vertexColors;
        this.fogScale = opts.fogScale !== undefined ? opts.fogScale : 1;
    }
}

class ShaderMaterial extends Material {
    constructor(opts = {}) {
        super('shader', opts);
        this.vertex = opts.vertex;
        this.fragment = opts.fragment;
        this.uniforms = opts.uniforms || {};
        this.key = opts.key || ('custom' + this.id);
    }
}

class Mesh extends Node {
    constructor(geometry, material) {
        super();
        this.geometry = geometry;
        this.material = material;
        this.frustumCulled = true;
        this.renderOrder = 0;
        this._normalMat = new Float32Array(9);
    }
}

class InstancedMesh extends Mesh {
    constructor(geometry, material, maxCount) {
        super(geometry, material);
        this.maxCount = maxCount;
        this.count = 0;
        this.matrices = new Float32Array(maxCount * 16);
        this.colors = new Float32Array(maxCount * 3).fill(1);
        this.needsUpdate = true;
        this.frustumCulled = false;
        this.isInstanced = true;
        this._tmp = M4.create();
    }
    setAt(i, pos, rot, scl, color) {
        M4.compose(this._tmp, pos, rot, scl);
        this.matrices.set(this._tmp, i * 16);
        if (color) { this.colors[i * 3] = color[0]; this.colors[i * 3 + 1] = color[1]; this.colors[i * 3 + 2] = color[2]; }
        this.needsUpdate = true;
    }
}

// Point sprites: per-point position, size, rgba
class Points extends Node {
    constructor(maxCount, material) {
        super();
        this.maxCount = maxCount;
        this.count = 0;
        this.positions = new Float32Array(maxCount * 3);
        this.sizes = new Float32Array(maxCount);
        this.colors = new Float32Array(maxCount * 4);
        this.material = material;
        this.isPoints = true;
        this.needsUpdate = true;
        this.renderOrder = 0;
        this.gl = null;
    }
}

class Camera extends Node {
    constructor(fov = 55, near = 0.1, far = 1200) {
        super();
        this.fov = fov * Math.PI / 180;
        this.near = near; this.far = far; this.aspect = 1;
        this.view = M4.create();
        this.proj = M4.create();
        this.viewProj = M4.create();
        this.target = new Vec3();
        this.up = new Vec3(0, 1, 0);
    }
    update() {
        M4.lookAt(this.view, this.position, this.target, this.up);
        M4.perspective(this.proj, this.fov, this.aspect, this.near, this.far);
        M4.multiply(this.viewProj, this.proj, this.view);
    }
    project(v, out) {
        const m = this.viewProj;
        const x = m[0] * v.x + m[4] * v.y + m[8] * v.z + m[12];
        const y = m[1] * v.x + m[5] * v.y + m[9] * v.z + m[13];
        const w = m[3] * v.x + m[7] * v.y + m[11] * v.z + m[15];
        out.x = x / w; out.y = y / w; out.w = w;
        return out;
    }
}

// ======================================================================
// GEOMETRY
// ======================================================================
// Primitive geometry builders + merging helpers.

// Builder accumulates vertices/indices
class GeoBuilder {
    constructor() { this.p = []; this.n = []; this.u = []; this.c = []; this.i = []; this.hasColor = false; }
    get vcount() { return this.p.length / 3; }
    vert(x, y, z, nx, ny, nz, u, v, col) {
        this.p.push(x, y, z); this.n.push(nx, ny, nz); this.u.push(u, v);
        if (col) { this.c.push(col[0], col[1], col[2]); this.hasColor = true; } else this.c.push(1, 1, 1);
        return this.vcount - 1;
    }
    tri(a, b, c) { this.i.push(a, b, c); }
    quad(a, b, c, d) { this.i.push(a, b, c, a, c, d); }
    // add a flat quad from 4 corner points (counter-clockwise when seen from the front)
    face(p0, p1, p2, p3, uv = [0, 0, 1, 0, 1, 1, 0, 1], col) {
        const ax = p1[0] - p0[0], ay = p1[1] - p0[1], az = p1[2] - p0[2];
        const bx = p3[0] - p0[0], by = p3[1] - p0[1], bz = p3[2] - p0[2];
        let nx = ay * bz - az * by, ny = az * bx - ax * bz, nz = ax * by - ay * bx;
        const l = Math.hypot(nx, ny, nz) || 1; nx /= l; ny /= l; nz /= l;
        const a = this.vert(p0[0], p0[1], p0[2], nx, ny, nz, uv[0], uv[1], col);
        const b = this.vert(p1[0], p1[1], p1[2], nx, ny, nz, uv[2], uv[3], col);
        const c = this.vert(p2[0], p2[1], p2[2], nx, ny, nz, uv[4], uv[5], col);
        const d = this.vert(p3[0], p3[1], p3[2], nx, ny, nz, uv[6], uv[7], col);
        this.quad(a, b, c, d);
    }
    build() {
        return new Geometry({ positions: this.p, normals: this.n, uvs: this.u, colors: this.hasColor ? this.c : null, indices: this.i });
    }
}

function box(w = 1, h = 1, d = 1, uvs = 1) {
    const x = w / 2, y = h / 2, z = d / 2;
    const b = new GeoBuilder();
    const U = (a, bb) => [0, 0, a * uvs, 0, a * uvs, bb * uvs, 0, bb * uvs];
    b.face([-x, -y, z], [x, -y, z], [x, y, z], [-x, y, z], U(w, h));    // +z
    b.face([x, -y, -z], [-x, -y, -z], [-x, y, -z], [x, y, -z], U(w, h)); // -z
    b.face([x, -y, z], [x, -y, -z], [x, y, -z], [x, y, z], U(d, h));    // +x
    b.face([-x, -y, -z], [-x, -y, z], [-x, y, z], [-x, y, -z], U(d, h)); // -x
    b.face([-x, y, z], [x, y, z], [x, y, -z], [-x, y, -z], U(w, d));    // +y
    b.face([-x, -y, -z], [x, -y, -z], [x, -y, z], [-x, -y, z], U(w, d)); // -y
    return b.build();
}

// Cylinder along Y, centered. Normals account for the slope.
function cylinder(rTop, rBot, h, radial = 16, hSeg = 1, opts = {}) {
    const b = new GeoBuilder();
    const t0 = opts.thetaStart || 0, tl = opts.thetaLength !== undefined ? opts.thetaLength : Math.PI * 2;
    const ru = opts.uRepeat || 1, rv = opts.vRepeat || 1;
    const slope = (rBot - rTop) / h;
    const rows = [];
    for (let y = 0; y <= hSeg; y++) {
        const v = y / hSeg;
        const r = rBot + (rTop - rBot) * v;
        const row = [];
        for (let x = 0; x <= radial; x++) {
            const u = x / radial;
            const th = t0 + u * tl;
            const s = Math.sin(th), c = Math.cos(th);
            let nx = s, ny = slope, nz = c;
            const l = Math.hypot(nx, ny, nz); nx /= l; ny /= l; nz /= l;
            row.push(b.vert(r * s, -h / 2 + v * h, r * c, nx, ny, nz, u * ru, v * rv));
        }
        rows.push(row);
    }
    for (let y = 0; y < hSeg; y++) for (let x = 0; x < radial; x++) {
        b.quad(rows[y][x], rows[y][x + 1], rows[y + 1][x + 1], rows[y + 1][x]);
    }
    const cap = (top) => {
        const r = top ? rTop : rBot;
        if (r <= 0) return;
        const yy = top ? h / 2 : -h / 2, ny = top ? 1 : -1;
        const center = b.vert(0, yy, 0, 0, ny, 0, 0.5, 0.5);
        const ring = [];
        for (let x = 0; x <= radial; x++) {
            const th = t0 + (x / radial) * tl;
            ring.push(b.vert(r * Math.sin(th), yy, r * Math.cos(th), 0, ny, 0, 0.5 + Math.sin(th) * 0.5, 0.5 + Math.cos(th) * 0.5));
        }
        for (let x = 0; x < radial; x++) {
            if (top) b.tri(center, ring[x], ring[x + 1]); else b.tri(center, ring[x + 1], ring[x]);
        }
    };
    if (!opts.openEnded) { cap(true); cap(false); }
    return b.build();
}

function sphere(r = 1, wSeg = 16, hSeg = 12, opts = {}) {
    const b = new GeoBuilder();
    const p0 = opts.phiStart || 0, pl = opts.phiLength !== undefined ? opts.phiLength : Math.PI * 2;
    const t0 = opts.thetaStart || 0, tl = opts.thetaLength !== undefined ? opts.thetaLength : Math.PI;
    const grid = [];
    for (let y = 0; y <= hSeg; y++) {
        const v = y / hSeg;
        const row = [];
        for (let x = 0; x <= wSeg; x++) {
            const u = x / wSeg;
            const phi = p0 + u * pl, th = t0 + v * tl;
            const nx = Math.sin(th) * Math.sin(phi), ny = Math.cos(th), nz = Math.sin(th) * Math.cos(phi);
            row.push(b.vert(nx * r, ny * r, nz * r, nx, ny, nz, u, 1 - v));
        }
        grid.push(row);
    }
    for (let y = 0; y < hSeg; y++) for (let x = 0; x < wSeg; x++) {
        const a = grid[y][x], bb = grid[y][x + 1], c = grid[y + 1][x + 1], d = grid[y + 1][x];
        if (y !== 0 || t0 > 0) b.tri(a, d, bb);
        if (y !== hSeg - 1 || t0 + tl < Math.PI - 1e-4) b.tri(bb, d, c);
    }
    return b.build();
}

// Revolve a profile [[r, y], ...] (bottom to top) around Y
function lathe(profile, seg = 16, opts = {}) {
    const b = new GeoBuilder();
    const p0 = opts.phiStart || 0, pl = opts.phiLength !== undefined ? opts.phiLength : Math.PI * 2;
    const n = profile.length;
    // profile normals (2D)
    const pn = [];
    for (let i = 0; i < n; i++) {
        const a = profile[Math.max(0, i - 1)], c = profile[Math.min(n - 1, i + 1)];
        let dr = c[0] - a[0], dy = c[1] - a[1];
        let nr = dy, ny = -dr; const l = Math.hypot(nr, ny) || 1;
        pn.push([nr / l, ny / l]);
    }
    const grid = [];
    for (let s = 0; s <= seg; s++) {
        const phi = p0 + (s / seg) * pl;
        const sn = Math.sin(phi), cs = Math.cos(phi);
        const row = [];
        for (let i = 0; i < n; i++) {
            const [r, y] = profile[i];
            row.push(b.vert(r * sn, y, r * cs, pn[i][0] * sn, pn[i][1], pn[i][0] * cs, s / seg, i / (n - 1)));
        }
        grid.push(row);
    }
    for (let s = 0; s < seg; s++) for (let i = 0; i < n - 1; i++) {
        b.quad(grid[s][i], grid[s + 1][i], grid[s + 1][i + 1], grid[s][i + 1]);
    }
    return b.build();
}

function plane(w = 1, h = 1, sx = 1, sy = 1) {
    const b = new GeoBuilder();
    const grid = [];
    for (let y = 0; y <= sy; y++) {
        const row = [];
        for (let x = 0; x <= sx; x++) {
            const u = x / sx, v = y / sy;
            row.push(b.vert((u - 0.5) * w, (v - 0.5) * h, 0, 0, 0, 1, u, v));
        }
        grid.push(row);
    }
    for (let y = 0; y < sy; y++) for (let x = 0; x < sx; x++) b.quad(grid[y][x], grid[y][x + 1], grid[y + 1][x + 1], grid[y + 1][x]);
    return b.build();
}

function torus(R = 1, r = 0.3, radial = 8, tubular = 16, arc = Math.PI * 2) {
    const b = new GeoBuilder();
    const grid = [];
    for (let j = 0; j <= radial; j++) {
        const row = [];
        for (let i = 0; i <= tubular; i++) {
            const u = (i / tubular) * arc, v = (j / radial) * Math.PI * 2;
            const cx = Math.cos(u) * R, cy = Math.sin(u) * R;
            const x = (R + r * Math.cos(v)) * Math.cos(u), y = (R + r * Math.cos(v)) * Math.sin(u), z = r * Math.sin(v);
            let nx = x - cx, ny = y - cy, nz = z; const l = Math.hypot(nx, ny, nz) || 1;
            row.push(b.vert(x, y, z, nx / l, ny / l, nz / l, i / tubular, j / radial));
        }
        grid.push(row);
    }
    for (let j = 0; j < radial; j++) for (let i = 0; i < tubular; i++) b.quad(grid[j][i], grid[j][i + 1], grid[j + 1][i + 1], grid[j + 1][i]);
    return b.build();
}

// Extrude a convex (or star-shaped around the centroid) polygon in XY along Z (centered)
function extrude(pts, depth, bevel = 0) {
    const b = new GeoBuilder();
    const z = depth / 2;
    let cx = 0, cy = 0;
    for (const p of pts) { cx += p[0]; cy += p[1]; }
    cx /= pts.length; cy /= pts.length;
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const p of pts) { minX = Math.min(minX, p[0]); maxX = Math.max(maxX, p[0]); minY = Math.min(minY, p[1]); maxY = Math.max(maxY, p[1]); }
    const uv = (x, y) => [(x - minX) / (maxX - minX || 1), (y - minY) / (maxY - minY || 1)];
    const inset = (p, k) => [cx + (p[0] - cx) * k, cy + (p[1] - cy) * k];
    const k = bevel > 0 ? 1 - bevel : 1;
    // front & back
    for (const side of [1, -1]) {
        const c = b.vert(cx, cy, side * (z + bevel * 0.5), 0, 0, side, ...uv(cx, cy));
        const ring = pts.map(p => { const q = inset(p, k); return b.vert(q[0], q[1], side * (z + bevel * 0.5), 0, 0, side, ...uv(q[0], q[1])); });
        for (let i = 0; i < ring.length; i++) {
            const a = ring[i], bb = ring[(i + 1) % ring.length];
            if (side > 0) b.tri(c, a, bb); else b.tri(c, bb, a);
        }
        if (bevel > 0) {
            for (let i = 0; i < pts.length; i++) {
                const p = pts[i], q = pts[(i + 1) % pts.length];
                const pi = inset(p, k), qi = inset(q, k);
                const zz = side * (z + bevel * 0.5);
                if (side > 0) b.face([p[0], p[1], z], [q[0], q[1], z], [qi[0], qi[1], zz], [pi[0], pi[1], zz]);
                else b.face([q[0], q[1], -z], [p[0], p[1], -z], [pi[0], pi[1], zz], [qi[0], qi[1], zz]);
            }
        }
    }
    for (let i = 0; i < pts.length; i++) {
        const p = pts[i], q = pts[(i + 1) % pts.length];
        b.face([p[0], p[1], -z], [q[0], q[1], -z], [q[0], q[1], z], [p[0], p[1], z]);
    }
    return b.build();
}

// Merge geometries with transforms (and optional per-part vertex color)
const _m = M4.create();
const _nm = new Float32Array(9);
function merge(parts) {
    const P = [], N = [], U = [], C = [], I = [];
    let anyColor = false;
    for (const part of parts) {
        const g = part.geo;
        const pos = part.pos || new Vec3(), rot = part.rot || new Vec3(), scl = part.scale || new Vec3(1, 1, 1);
        if (part.matrix) _m.set(part.matrix); else M4.compose(_m, pos, rot, scl);
        M4.normalMatrix(_nm, _m);
        const base = P.length / 3;
        const vc = g.positions.length / 3;
        const tmp = new Vec3();
        for (let v = 0; v < vc; v++) {
            M4.transformPoint(_m, g.positions[v * 3], g.positions[v * 3 + 1], g.positions[v * 3 + 2], tmp);
            P.push(tmp.x, tmp.y, tmp.z);
            if (g.normals) {
                const x = g.normals[v * 3], y = g.normals[v * 3 + 1], z = g.normals[v * 3 + 2];
                let nx = _nm[0] * x + _nm[3] * y + _nm[6] * z;
                let ny = _nm[1] * x + _nm[4] * y + _nm[7] * z;
                let nz = _nm[2] * x + _nm[5] * y + _nm[8] * z;
                const l = Math.hypot(nx, ny, nz) || 1;
                N.push(nx / l, ny / l, nz / l);
            } else N.push(0, 1, 0);
            if (g.uvs) {
                const us = part.uvScale || 1;
                U.push(g.uvs[v * 2] * us + (part.uvOffset ? part.uvOffset[0] : 0), g.uvs[v * 2 + 1] * us + (part.uvOffset ? part.uvOffset[1] : 0));
            } else U.push(0, 0);
            if (part.color) {
                anyColor = true;
                const gc = g.colors ? [g.colors[v * 3], g.colors[v * 3 + 1], g.colors[v * 3 + 2]] : [1, 1, 1];
                C.push(part.color[0] * gc[0], part.color[1] * gc[1], part.color[2] * gc[2]);
            } else if (g.colors) {
                anyColor = true;
                C.push(g.colors[v * 3], g.colors[v * 3 + 1], g.colors[v * 3 + 2]);
            } else C.push(1, 1, 1);
        }
        if (g.indices) for (let k = 0; k < g.indices.length; k++) I.push(g.indices[k] + base);
        else for (let k = 0; k < vc; k++) I.push(base + k);
    }
    return new Geometry({ positions: P, normals: N, uvs: U, colors: anyColor ? C : null, indices: I });
}

// Displace vertices with a function (for organic shapes)
function deform(geo, fn) {
    const p = geo.positions;
    const v = new Vec3();
    for (let i = 0; i < p.length; i += 3) {
        v.set(p[i], p[i + 1], p[i + 2]);
        fn(v);
        p[i] = v.x; p[i + 1] = v.y; p[i + 2] = v.z;
    }
    geo.computeBounds();
    geo.needsUpdate = true;
    return geo;
}

function recomputeNormals(geo) {
    const p = geo.positions, idx = geo.indices;
    const n = new Float32Array(p.length);
    for (let i = 0; i < idx.length; i += 3) {
        const a = idx[i] * 3, b = idx[i + 1] * 3, c = idx[i + 2] * 3;
        const ux = p[b] - p[a], uy = p[b + 1] - p[a + 1], uz = p[b + 2] - p[a + 2];
        const vx = p[c] - p[a], vy = p[c + 1] - p[a + 1], vz = p[c + 2] - p[a + 2];
        const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
        for (const k of [a, b, c]) { n[k] += nx; n[k + 1] += ny; n[k + 2] += nz; }
    }
    for (let i = 0; i < n.length; i += 3) {
        const l = Math.hypot(n[i], n[i + 1], n[i + 2]) || 1;
        n[i] /= l; n[i + 1] /= l; n[i + 2] /= l;
    }
    geo.normals = n;
    geo.needsUpdate = true;
    return geo;
}

// ======================================================================
// RENDERER
// ======================================================================
// Minimal WebGL2 forward renderer: lit (hemi + directional + point lights + fake env),
// unlit, additive sprites, point particles and custom shader materials.

const MAX_PL = 8;

const VS_HEAD = `#version 300 es
precision highp float;
layout(location=0) in vec3 position;
layout(location=1) in vec3 normal;
layout(location=2) in vec2 uv;
layout(location=3) in vec3 color;
uniform mat4 uModel; uniform mat4 uView; uniform mat4 uProj; uniform mat3 uNormalMat;
uniform float uTime; uniform vec3 uCamPos;
`;

const FS_HEAD = `#version 300 es
precision highp float;
uniform float uTime; uniform vec3 uCamPos;
uniform vec3 uFogColor; uniform float uFogDensity;
out vec4 fragColor;
vec3 toLinear(vec3 c){ return pow(max(c, vec3(0.0)), vec3(2.2)); }
vec3 aces(vec3 x){ return clamp((x*(2.51*x+0.03))/(x*(2.43*x+0.59)+0.14),0.0,1.0); }
float hash12(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * .1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
float vnoise(vec2 p){ vec2 i = floor(p), f = fract(p); vec2 u = f*f*(3.0-2.0*f);
  return mix(mix(hash12(i), hash12(i+vec2(1,0)), u.x), mix(hash12(i+vec2(0,1)), hash12(i+vec2(1,1)), u.x), u.y); }
float fbm(vec2 p){ float v = 0.0, a = 0.5; for(int i=0;i<5;i++){ v += a*vnoise(p); p = p*2.03 + vec2(1.7,9.2); a *= 0.5; } return v; }
`;

const LIT_VS = VS_HEAD + `
#ifdef INSTANCED
layout(location=4) in mat4 iMatrix;
layout(location=8) in vec3 iColor;
#endif
uniform vec2 uUvScale; uniform float uWave;
out vec3 vWorld; out vec3 vNormal; out vec2 vUv; out vec3 vColor; out float vDepth;
void main(){
  vec3 pos = position;
  #ifdef WAVE
  float w = clamp(1.0 - uv.y, 0.0, 1.0);
  float ph = uModel[3][0]*0.9 + uModel[3][2]*0.7 + uModel[3][1]*0.3;
  pos.z += sin(uTime*3.1 + pos.y*2.3 + pos.x*1.9 + ph) * uWave * w;
  pos.x += sin(uTime*2.2 + pos.y*1.6 + ph) * uWave * 0.35 * w;
  #endif
  mat4 m = uModel;
  vec3 n;
  #ifdef INSTANCED
  m = uModel * iMatrix;
  n = normalize(mat3(m) * normal);
  vColor = iColor;
  #else
  n = uNormalMat * normal;
  vColor = vec3(1.0);
  #endif
  #ifdef VERTEX_COLORS
  vColor *= color;
  #endif
  vec4 wp = m * vec4(pos, 1.0);
  vWorld = wp.xyz; vNormal = n; vUv = uv * uUvScale;
  vec4 vp = uView * wp; vDepth = -vp.z;
  gl_Position = uProj * vp;
}`;

const LIT_FS = FS_HEAD + `
#define MAX_PL ${MAX_PL}
in vec3 vWorld; in vec3 vNormal; in vec2 vUv; in vec3 vColor; in float vDepth;
uniform vec3 uColor; uniform float uOpacity;
uniform sampler2D uMap; uniform sampler2D uNormalMap; uniform float uNormalScale;
uniform float uRough; uniform float uMetal; uniform vec3 uEmissive; uniform float uEnvStrength; uniform float uRim;
uniform float uFlash; uniform vec3 uFlashColor;
uniform vec3 uHemiSky; uniform vec3 uHemiGround;
uniform vec3 uDirDir; uniform vec3 uDirColor;
uniform vec3 uPLPos[MAX_PL]; uniform vec3 uPLColor[MAX_PL]; uniform float uPLRange[MAX_PL];
uniform float uFogScale;
uniform vec3 uEnvTop; uniform vec3 uEnvBottom; uniform vec3 uRimColor;
uniform float uLavaY; uniform vec3 uLavaGlow; uniform float uExposure;
uniform float uToonKey; uniform float uToonSpec; uniform float uToonPL; uniform vec2 uToonAmb;
void main(){
  vec3 albedo = toLinear(uColor * vColor);
  float alpha = uOpacity;
  #ifdef HAS_MAP
  vec4 tex = texture(uMap, vUv);
  albedo *= toLinear(tex.rgb);
  #ifdef ALPHA_TEST
  if (tex.a < 0.5) discard;
  #endif
  #endif
  #ifdef MACRO_VAR
  float mv = vnoise(vec2(vWorld.x*0.33 + vWorld.z*0.21, vWorld.y*0.21 + vWorld.z*0.29)) * 0.65
           + vnoise(vec2(vWorld.x*1.1 - vWorld.z*0.7, vWorld.y*0.9 + vWorld.x*0.4)) * 0.35;
  albedo *= 0.7 + mv * 0.6;
  #endif
  vec3 N = normalize(vNormal);
  vec3 V = normalize(uCamPos - vWorld);
  #ifdef DOUBLE_SIDED
  if(dot(N, V) < 0.0) N = -N;
  #endif
  #ifdef HAS_NORMALMAP
  vec3 mapN = texture(uNormalMap, vUv).xyz * 2.0 - 1.0;
  mapN.xy *= uNormalScale;
  vec3 dp1 = dFdx(vWorld), dp2 = dFdy(vWorld); vec2 duv1 = dFdx(vUv), duv2 = dFdy(vUv);
  vec3 dp2perp = cross(dp2, N), dp1perp = cross(N, dp1);
  vec3 T = dp2perp * duv1.x + dp1perp * duv2.x;
  vec3 B = dp2perp * duv1.y + dp1perp * duv2.y;
  float invmax = inversesqrt(max(max(dot(T,T), dot(B,B)), 1e-20));
  N = normalize(mat3(T*invmax, B*invmax, N) * normalize(mapN));
  #endif
  #ifdef TOON
  float nv = max(dot(N, V), 0.0);
  float kd = dot(N, uDirDir);
  float band = smoothstep(-0.12, 0.06, kd) * 0.55 + smoothstep(0.38, 0.52, kd) * 0.45;
  vec3 amb = mix(uHemiGround, uHemiSky, N.y * 0.5 + 0.5) * uToonAmb.x + vec3(1.0, 0.85, 0.95) * uToonAmb.y;
  vec3 col = albedo * (amb + uDirColor * band * uToonKey);
  for(int i=0;i<MAX_PL;i++){
    float range = uPLRange[i];
    if(range <= 0.0) continue;
    vec3 Lv = uPLPos[i] - vWorld;
    float d = length(Lv);
    if(d > range) continue;
    vec3 L = Lv / d;
    float x = d / range;
    float att = clamp(1.0 - x*x*x*x, 0.0, 1.0);
    att = att*att / (1.0 + d*d*0.22);
    float nl = smoothstep(0.0, 0.18, dot(N, L));
    col += albedo * uPLColor[i] * nl * att * uToonPL;
  }
  vec3 Hk = normalize(uDirDir + V);
  col += vec3(1.0, 0.97, 0.9) * smoothstep(0.935, 0.955, dot(N, Hk)) * uToonSpec * 0.8;
  col += uRimColor * smoothstep(0.6, 0.78, 1.0 - nv) * uRim * 1.3;
  float lh = max(vWorld.y - uLavaY, 0.0);
  col += uLavaGlow * albedo * exp(-lh * 0.22) * clamp(0.65 - N.y * 0.75, 0.0, 1.4) * 0.9;
  col += uEmissive;
  col = col / (1.0 + col * 0.55);
  col = pow(col, vec3(1.0/2.2)) * 1.08;
  col = mix(col, uFlashColor, uFlash);
  #else
  float rough = uRough; float metal = uMetal;
  vec3 diffC = albedo * (1.0 - metal);
  vec3 specC = mix(vec3(0.04), albedo, metal);
  float shin = exp2(9.0*(1.0-rough)+1.0);
  float specNorm = (shin + 8.0) / 30.0;
  float nv = max(dot(N,V), 0.0);
  vec3 col = diffC * mix(uHemiGround, uHemiSky, N.y*0.5+0.5);
  float ndl = max(dot(N, uDirDir), 0.0);
  vec3 H = normalize(uDirDir + V);
  col += (diffC + specC * pow(max(dot(N,H),0.0), shin) * specNorm) * uDirColor * ndl;
  for(int i=0;i<MAX_PL;i++){
    float range = uPLRange[i];
    if(range <= 0.0) continue;
    vec3 Lv = uPLPos[i] - vWorld;
    float d = length(Lv);
    if(d > range) continue;
    vec3 L = Lv / d;
    float x = d / range;
    float att = clamp(1.0 - x*x*x*x, 0.0, 1.0);
    att = att*att / (1.0 + d*d*0.3);
    float nl = max(dot(N,L), 0.0);
    vec3 H2 = normalize(L+V);
    col += (diffC + specC*pow(max(dot(N,H2),0.0), shin)*specNorm) * uPLColor[i] * nl * att;
  }
  vec3 R = reflect(-V, N);
  float fres = pow(1.0 - nv, 5.0);
  vec3 F = specC + (vec3(1.0) - specC) * fres * (1.0 - rough);
  vec3 env = mix(uEnvBottom, uEnvTop, smoothstep(-0.5, 0.6, R.y));
  env += uEnvTop * 1.8 * smoothstep(0.55, 0.9, R.y) * (1.0 - rough);
  col += env * F * (1.0 - rough*0.8) * uEnvStrength;
  col += uRimColor * pow(1.0 - nv, 3.0) * uRim;
  float lh = max(vWorld.y - uLavaY, 0.0);
  col += uLavaGlow * diffC * exp(-lh*0.3) * clamp(0.55 - N.y*0.6, 0.0, 1.2);
  col += uEmissive;
  col = aces(col * uExposure);
  col = pow(col, vec3(1.0/2.2));
  col = mix(col, uFlashColor, uFlash);
  #endif
  float fd = uFogDensity * vDepth * uFogScale;
  col = mix(col, uFogColor, 1.0 - exp(-fd*fd));
  fragColor = vec4(col, alpha);
}`;

const BASIC_VS = VS_HEAD + `
#ifdef INSTANCED
layout(location=4) in mat4 iMatrix;
layout(location=8) in vec3 iColor;
#endif
out vec2 vUv; out vec3 vColor; out float vDepth;
void main(){
  mat4 m = uModel;
  vColor = vec3(1.0);
  #ifdef INSTANCED
  m = uModel * iMatrix; vColor = iColor;
  #endif
  #ifdef VERTEX_COLORS
  vColor *= color;
  #endif
  vec4 vp = uView * m * vec4(position,1.0);
  vDepth = -vp.z; vUv = uv;
  gl_Position = uProj * vp;
}`;

const BASIC_FS = FS_HEAD + `
in vec2 vUv; in vec3 vColor; in float vDepth;
uniform vec3 uColor; uniform float uOpacity; uniform sampler2D uMap; uniform float uFogScale;
void main(){
  vec4 c = vec4(uColor * vColor, uOpacity);
  #ifdef HAS_MAP
  c *= texture(uMap, vUv);
  #endif
  float fd = uFogDensity * vDepth * uFogScale;
  float fog = 1.0 - exp(-fd*fd);
  #ifdef ADDITIVE
  c.rgb *= (1.0 - fog);
  #else
  c.rgb = mix(c.rgb, uFogColor, fog);
  #endif
  fragColor = c;
}`;

const POINTS_VS = `#version 300 es
precision highp float;
layout(location=0) in vec3 position;
layout(location=1) in float size;
layout(location=3) in vec4 color;
uniform mat4 uView; uniform mat4 uProj; uniform float uPointScale;
out vec4 vColor; out float vDepth;
void main(){
  vec4 vp = uView * vec4(position, 1.0);
  gl_Position = uProj * vp;
  gl_PointSize = size * uPointScale / max(-vp.z, 0.2);
  vColor = color; vDepth = -vp.z;
}`;

const POINTS_FS = `#version 300 es
precision highp float;
in vec4 vColor; in float vDepth;
uniform float uFogDensity; uniform vec3 uFogColor; uniform float uFogScale;
out vec4 fragColor;
void main(){
  vec2 c = gl_PointCoord * 2.0 - 1.0;
  float d = dot(c, c);
  if (d > 1.0) discard;
  #ifdef HARD
  float a = smoothstep(1.0, 0.7, d);
  #else
  float a = 1.0 - d; a = a * a;
  #endif
  a *= smoothstep(0.8, 3.5, vDepth);
  float fd = uFogDensity * vDepth * uFogScale;
  float fog = 1.0 - exp(-fd*fd);
  #ifdef ADDITIVE
  fragColor = vec4(vColor.rgb * vColor.a * a * (1.0 - fog), 1.0);
  #else
  fragColor = vec4(mix(vColor.rgb, uFogColor, fog), vColor.a * a);
  #endif
}`;

function hexColor(h) {
    return [((h >> 16) & 255) / 255, ((h >> 8) & 255) / 255, (h & 255) / 255];
}

const toLin = (c) => [Math.pow(c[0], 2.2), Math.pow(c[1], 2.2), Math.pow(c[2], 2.2)];

class Renderer {
    constructor(canvas, opts = {}) {
        const wantPost = !!opts.post;
        const gl = canvas.getContext('webgl2', {
            antialias: !wantPost, alpha: false, depth: true, stencil: false,
            powerPreference: 'high-performance', premultipliedAlpha: false
        });
        if (!gl) throw new Error('WebGL2 is not available on this device.');
        this.gl = gl;
        this.canvas = canvas;
        this.programs = new Map();
        this.aniso = gl.getExtension('EXT_texture_filter_anisotropic');
        this.maxAniso = this.aniso ? gl.getParameter(this.aniso.MAX_TEXTURE_MAX_ANISOTROPY_EXT) : 1;
        this.frame = 0;
        this.time = 0;
        this.width = 1; this.height = 1; this.pixelRatio = 1;
        this.clearColor = [0.05, 0.02, 0.02];
        this.env = {
            hemiSky: [0.1, 0.1, 0.15], hemiGround: [0.15, 0.06, 0.02],
            dirDir: new Vec3(0.3, 0.8, 0.5).normalize(), dirColor: [0.3, 0.3, 0.4],
            fogColor: [0.1, 0.03, 0.02], fogDensity: 0.01,
            envTop: [0.1, 0.1, 0.14], envBottom: [0.5, 0.15, 0.03], rimColor: [0.4, 0.3, 0.5],
            lavaY: -100, lavaGlow: [0.9, 0.3, 0.05], exposure: 1.0,
            points: [] // {pos:Vec3, color:[r,g,b] linear, range}
        };
        this._plPos = new Float32Array(MAX_PL * 3);
        this._plCol = new Float32Array(MAX_PL * 3);
        this._plRange = new Float32Array(MAX_PL);
        this._frustum = new Float32Array(24);
        this._tmpV = new Vec3();
        this._opaque = []; this._transparent = [];
        this._white = null;
        this._flatNormal = null;
        this.stats = { draws: 0, tris: 0 };
        this._state = { program: null, blend: null, depthWrite: null, cull: null, depthTest: null };
        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.CULL_FACE);
        gl.cullFace(gl.BACK);
        gl.frontFace(gl.CCW);
        this.post = {
            enabled: wantPost, bloom: 0.85, threshold: 0.8, vignette: 0.38, saturation: 1.12, contrast: 1.03,
            lift: [0.015, 0.0, 0.03], gain: [1.03, 1.0, 0.97], grain: 0.02, fade: 0, fadeColor: [0, 0, 0],
            ink: 1.0, inkColor: [0.05, 0.02, 0.05], inkPx: 1.0, inkFar: 90, msaa: false,
            aa: 1, ao: 0.6
        };
        this._pt = null;
        if (wantPost) {
            try { this._initPost(); } catch (e) { console.warn('Post-processing disabled:', e); this.post.enabled = false; }
        }
    }

    // ---- post-processing (bloom + grading) ------------------------------
    _initPost() {
        const gl = this.gl;
        this._fsVao = gl.createVertexArray();
        gl.bindVertexArray(this._fsVao);
        const b = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, b);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
        gl.bindVertexArray(null);
        const VS = `#version 300 es
precision highp float;
layout(location=0) in vec2 position;
out vec2 vUv;
void main(){ vUv = position * 0.5 + 0.5; gl_Position = vec4(position, 0.0, 1.0); }`;
        // samplers default to lowp: phones that honour it (iPhone) would read the depth texture at half
        // precision, and the ink pass then draws false contour lines all over smooth surfaces
        const head = `#version 300 es
precision highp float;
precision highp sampler2D;
in vec2 vUv; out vec4 fragColor;
uniform sampler2D uTex; uniform vec2 uTexel;
`;
        this._pBright = this._program('pp-bright', VS, head + `
uniform float uThreshold;
void main(){
  vec3 c = texture(uTex, vUv + uTexel * vec2(-0.5, -0.5)).rgb + texture(uTex, vUv + uTexel * vec2(0.5, -0.5)).rgb
         + texture(uTex, vUv + uTexel * vec2(-0.5, 0.5)).rgb + texture(uTex, vUv + uTexel * vec2(0.5, 0.5)).rgb;
  c *= 0.25;
  float l = max(c.r, max(c.g, c.b));
  float k = smoothstep(uThreshold, uThreshold + 0.28, l);
  fragColor = vec4(c * k, 1.0);
}`);
        this._pBlur = this._program('pp-blur', VS, head + `
uniform vec2 uDir;
void main(){
  vec3 c = texture(uTex, vUv).rgb * 0.227027;
  c += (texture(uTex, vUv + uDir * 1.3846).rgb + texture(uTex, vUv - uDir * 1.3846).rgb) * 0.3162162;
  c += (texture(uTex, vUv + uDir * 3.2308).rgb + texture(uTex, vUv - uDir * 3.2308).rgb) * 0.0702703;
  fragColor = vec4(c, 1.0);
}`);
        this._pComp = this._program('pp-comp', VS, head + `
uniform sampler2D uB1; uniform sampler2D uB2; uniform highp sampler2D uDepth;
uniform float uNear; uniform float uFar; uniform float uInk; uniform vec3 uInkColor; uniform float uInkPx; uniform float uInkFar;
uniform float uBloom; uniform float uVig; uniform float uSat; uniform float uContrast;
uniform vec3 uLift; uniform vec3 uGain; uniform float uGrain; uniform float uTime; uniform vec2 uRes;
uniform float uFade; uniform vec3 uFadeColor; uniform float uAA; uniform float uAO;
float h(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * .1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
float lin(float d){ float z = d * 2.0 - 1.0; return 2.0 * uNear * uFar / (uFar + uNear - z * (uFar - uNear)); }
// FXAA-style edge antialiasing (single pass, 9 taps)
vec3 fxaa(vec2 uv){
  vec2 t = 1.0 / uRes;
  const vec3 LU = vec3(0.299, 0.587, 0.114);
  vec3 cM = texture(uTex, uv).rgb;
  float lNW = dot(texture(uTex, uv + vec2(-1.0, -1.0) * t).rgb, LU);
  float lNE = dot(texture(uTex, uv + vec2(1.0, -1.0) * t).rgb, LU);
  float lSW = dot(texture(uTex, uv + vec2(-1.0, 1.0) * t).rgb, LU);
  float lSE = dot(texture(uTex, uv + vec2(1.0, 1.0) * t).rgb, LU);
  float lM = dot(cM, LU);
  float lMin = min(lM, min(min(lNW, lNE), min(lSW, lSE)));
  float lMax = max(lM, max(max(lNW, lNE), max(lSW, lSE)));
  if (lMax - lMin < max(0.04, lMax * 0.12)) return cM;
  vec2 dir = vec2(-((lNW + lNE) - (lSW + lSE)), (lNW + lSW) - (lNE + lSE));
  float red = max((lNW + lNE + lSW + lSE) * 0.03125, 1.0 / 128.0);
  dir = clamp(dir / (min(abs(dir.x), abs(dir.y)) + red), -8.0, 8.0) * t;
  vec3 A = 0.5 * (texture(uTex, uv - dir * 0.1667).rgb + texture(uTex, uv + dir * 0.1667).rgb);
  vec3 B = A * 0.5 + 0.25 * (texture(uTex, uv - dir * 0.5).rgb + texture(uTex, uv + dir * 0.5).rgb);
  float lB = dot(B, LU);
  return (lB < lMin || lB > lMax) ? A : B;
}
void main(){
  vec3 c = uAA > 0.0 ? fxaa(vUv) : texture(uTex, vUv).rgb;
  if (uAO > 0.0) {
    // screen-space ambient occlusion from the depth buffer (8 taps, rotated per pixel)
    float zc0 = lin(texture(uDepth, vUv).r);
    if (zc0 < uInkFar) {
      float rad = clamp(22.0 / zc0, 2.0, 26.0) * uInkPx;
      float rot = h(vUv * uRes) * 0.785;
      float ao = 0.0;
      for (int i = 0; i < 8; i++) {
        float a = float(i) * 0.785398 + rot;
        float s = (i % 2 == 0) ? 1.0 : 0.5;
        float zs = lin(texture(uDepth, vUv + vec2(cos(a), sin(a)) * rad * s / uRes).r);
        float dz = zc0 - zs;
        ao += smoothstep(0.04, 0.4, dz) * (1.0 - smoothstep(0.9, 2.6, dz));
      }
      ao *= 0.125;
      c *= 1.0 - ao * uAO * (1.0 - smoothstep(uInkFar * 0.35, uInkFar, zc0));
    }
  }
  if (uInk > 0.0) {
    vec2 o = uInkPx / uRes;
    float zc = lin(texture(uDepth, vUv).r);
    float zl = lin(texture(uDepth, vUv - vec2(o.x, 0.0)).r), zr = lin(texture(uDepth, vUv + vec2(o.x, 0.0)).r);
    float zd = lin(texture(uDepth, vUv - vec2(0.0, o.y)).r), zu = lin(texture(uDepth, vUv + vec2(0.0, o.y)).r);
    float zmin = min(zc, min(min(zl, zr), min(zd, zu)));
    float sil = max(max(zl, zr), max(zd, zu)) - zmin;
    sil = sil / zmin;
    float wc = 1.0 / zc;
    float crease = (abs(1.0 / zl + 1.0 / zr - 2.0 * wc) + abs(1.0 / zd + 1.0 / zu - 2.0 * wc)) / wc;
    float e = max(smoothstep(0.035, 0.07, sil), smoothstep(0.012, 0.03, crease) * 0.85);
    e *= 1.0 - smoothstep(uInkFar * 0.45, uInkFar, zmin);
    c = mix(c, uInkColor, e * uInk);
  }
  vec3 b = texture(uB1, vUv).rgb * 0.75 + texture(uB2, vUv).rgb * 1.1;
  c = 1.0 - (1.0 - c) * (1.0 - clamp(b * uBloom, 0.0, 1.0));
  float l = dot(c, vec3(0.2126, 0.7152, 0.0722));
  c = mix(vec3(l), c, uSat);
  c = (c - 0.5) * uContrast + 0.5;
  c = c * uGain + uLift * (1.0 - c);
  vec2 d = vUv - 0.5; d.x *= uRes.x / uRes.y;
  c *= 1.0 - smoothstep(0.35, 1.05, length(d) * 1.25) * uVig;
  c += (h(vUv * uRes + fract(uTime) * 91.7) - 0.5) * uGrain;
  c = mix(c, uFadeColor, uFade);
  fragColor = vec4(clamp(c, 0.0, 1.0), 1.0);
}`);
        const maxS = gl.getParameter(gl.MAX_SAMPLES) || 0;
        this._samples = this.post.msaa ? Math.min(4, maxS) : 0;
        this._postReady = true;
    }
    _tex(w, h) {
        const gl = this.gl;
        const t = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, t);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        const f = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, f);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0);
        return { tex: t, fbo: f, w, h };
    }
    _freeTargets() {
        const gl = this.gl, P = this._pt;
        if (!P) return;
        for (const k of ['scene', 'half', 'q1', 'q2', 'e1', 'e2']) { if (P[k]) { gl.deleteTexture(P[k].tex); gl.deleteFramebuffer(P[k].fbo); } }
        if (P.msaa) { gl.deleteFramebuffer(P.msaa.fbo); gl.deleteRenderbuffer(P.msaa.color); gl.deleteRenderbuffer(P.msaa.depth); }
        if (P.depthTex) gl.deleteTexture(P.depthTex);
        this._pt = null;
    }
    _ensureTargets() {
        const gl = this.gl;
        const w = this.canvas.width, h = this.canvas.height;
        if (this._pt && this._pt.w === w && this._pt.h === h) return;
        this._freeTargets();
        const P = { w, h };
        P.scene = this._tex(w, h);
        if (this._samples > 0) {
            const fbo = gl.createFramebuffer();
            gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
            const color = gl.createRenderbuffer();
            gl.bindRenderbuffer(gl.RENDERBUFFER, color);
            gl.renderbufferStorageMultisample(gl.RENDERBUFFER, this._samples, gl.RGBA8, w, h);
            gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.RENDERBUFFER, color);
            const depth = gl.createRenderbuffer();
            gl.bindRenderbuffer(gl.RENDERBUFFER, depth);
            gl.renderbufferStorageMultisample(gl.RENDERBUFFER, this._samples, gl.DEPTH_COMPONENT24, w, h);
            gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depth);
            P.msaa = { fbo, color, depth };
        }
        // depth texture (sampled by the ink-line pass)
        P.depthTex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, P.depthTex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT24, w, h, 0, gl.DEPTH_COMPONENT, gl.UNSIGNED_INT, null);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.bindFramebuffer(gl.FRAMEBUFFER, P.scene.fbo);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, P.depthTex, 0);
        const hw = Math.max(1, w >> 1), hh = Math.max(1, h >> 1);
        const qw = Math.max(1, w >> 2), qh = Math.max(1, h >> 2);
        const ew = Math.max(1, w >> 3), eh = Math.max(1, h >> 3);
        P.half = this._tex(hw, hh);
        P.q1 = this._tex(qw, qh); P.q2 = this._tex(qw, qh);
        P.e1 = this._tex(ew, eh); P.e2 = this._tex(ew, eh);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        this._pt = P;
    }
    _pass(prog, target, src, setup) {
        const gl = this.gl;
        if (this._state.program !== prog) { gl.useProgram(prog.prog); this._state.program = prog; }
        gl.bindFramebuffer(gl.FRAMEBUFFER, target ? target.fbo : null);
        if (target) gl.viewport(0, 0, target.w, target.h); else gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, src.tex);
        const u = prog.uniforms;
        if (u.uTex) gl.uniform1i(u.uTex, 0);
        if (u.uTexel) gl.uniform2f(u.uTexel, 1 / src.w, 1 / src.h);
        if (setup) setup(u);
        gl.bindVertexArray(this._fsVao);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
    _postProcess() {
        const gl = this.gl, P = this._pt, pp = this.post;
        if (P.msaa) {
            gl.bindFramebuffer(gl.READ_FRAMEBUFFER, P.msaa.fbo);
            gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, P.scene.fbo);
            gl.blitFramebuffer(0, 0, P.w, P.h, 0, 0, P.w, P.h, gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT, gl.NEAREST);
            gl.bindFramebuffer(gl.READ_FRAMEBUFFER, null);
            gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, null);
        }
        gl.disable(gl.DEPTH_TEST); gl.disable(gl.BLEND); gl.disable(gl.CULL_FACE); gl.depthMask(false);
        const st = this._state;
        st.depthTest = false; st.blend = 'none'; st.cull = 'double'; st.depthWrite = false;
        this._pass(this._pBright, P.half, P.scene, (u) => gl.uniform1f(u.uThreshold, pp.threshold));
        this._pass(this._pBlur, P.q1, P.half, (u) => gl.uniform2f(u.uDir, 1.6 / P.half.w, 0));
        this._pass(this._pBlur, P.q2, P.q1, (u) => gl.uniform2f(u.uDir, 0, 1.3 / P.q1.h));
        this._pass(this._pBlur, P.e1, P.q2, (u) => gl.uniform2f(u.uDir, 1.5 / P.q2.w, 0));
        this._pass(this._pBlur, P.e2, P.e1, (u) => gl.uniform2f(u.uDir, 0, 1.4 / P.e1.h));
        this._pass(this._pComp, null, P.scene, (u) => {
            gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, P.q2.tex); gl.uniform1i(u.uB1, 1);
            gl.activeTexture(gl.TEXTURE2); gl.bindTexture(gl.TEXTURE_2D, P.e2.tex); gl.uniform1i(u.uB2, 2);
            gl.uniform1f(u.uBloom, pp.bloom); gl.uniform1f(u.uVig, pp.vignette);
            gl.uniform1f(u.uSat, pp.saturation); gl.uniform1f(u.uContrast, pp.contrast);
            gl.uniform3fv(u.uLift, pp.lift); gl.uniform3fv(u.uGain, pp.gain);
            gl.uniform1f(u.uGrain, pp.grain); gl.uniform1f(u.uTime, this.time);
            gl.uniform2f(u.uRes, P.w, P.h);
            gl.uniform1f(u.uFade, pp.fade); gl.uniform3fv(u.uFadeColor, pp.fadeColor);
            gl.activeTexture(gl.TEXTURE3); gl.bindTexture(gl.TEXTURE_2D, P.depthTex); gl.uniform1i(u.uDepth, 3);
            gl.uniform1f(u.uNear, this._near); gl.uniform1f(u.uFar, this._far);
            gl.uniform1f(u.uInk, pp.ink); gl.uniform3fv(u.uInkColor, pp.inkColor);
            gl.uniform1f(u.uInkPx, pp.inkPx); gl.uniform1f(u.uInkFar, pp.inkFar);
            gl.uniform1f(u.uAA, pp.aa || 0); gl.uniform1f(u.uAO, pp.ao || 0);
            gl.activeTexture(gl.TEXTURE0);
        });
    }

    setSize(w, h, dpr) {
        this.width = w; this.height = h; this.pixelRatio = dpr;
        const cw = Math.max(1, Math.floor(w * dpr)), ch = Math.max(1, Math.floor(h * dpr));
        if (this.canvas.width !== cw || this.canvas.height !== ch) {
            this.canvas.width = cw; this.canvas.height = ch;
        }
        this.gl.viewport(0, 0, cw, ch);
    }

    // ---- programs -------------------------------------------------------
    _compile(type, src) {
        const gl = this.gl;
        const sh = gl.createShader(type);
        gl.shaderSource(sh, src);
        gl.compileShader(sh);
        if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
            const log = gl.getShaderInfoLog(sh);
            const lines = src.split('\n').map((l, i) => (i + 1) + ': ' + l).join('\n');
            console.error(log + '\n' + lines);
            throw new Error('Shader compile error: ' + log);
        }
        return sh;
    }
    _program(key, vs, fs, defines) {
        let p = this.programs.get(key);
        if (p) return p;
        const gl = this.gl;
        const def = (defines || []).map(d => '#define ' + d + '\n').join('');
        const inject = (src) => src.replace('precision highp float;\n', 'precision highp float;\n' + def);
        const prog = gl.createProgram();
        gl.attachShader(prog, this._compile(gl.VERTEX_SHADER, inject(vs)));
        gl.attachShader(prog, this._compile(gl.FRAGMENT_SHADER, inject(fs)));
        gl.linkProgram(prog);
        if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error('Link error: ' + gl.getProgramInfoLog(prog));
        const uniforms = {};
        const n = gl.getProgramParameter(prog, gl.ACTIVE_UNIFORMS);
        for (let i = 0; i < n; i++) {
            const info = gl.getActiveUniform(prog, i);
            const name = info.name.replace(/\[0\]$/, '');
            uniforms[name] = gl.getUniformLocation(prog, info.name);
        }
        p = { prog, uniforms, frame: -1, key };
        this.programs.set(key, p);
        return p;
    }
    _programFor(obj) {
        const m = obj.material;
        const inst = obj.isInstanced;
        if (obj.isPoints) {
            const add = m.blending === 'additive';
            const hard = !!m.hard;
            return this._program('points' + (add ? 'A' : '') + (hard ? 'H' : ''), POINTS_VS, POINTS_FS,
                [add ? 'ADDITIVE' : 'NORMALB', hard ? 'HARD' : 'SOFT']);
        }
        if (m.type === 'lit') {
            const d = [];
            if (m.map) d.push('HAS_MAP');
            if (m.normalMap) d.push('HAS_NORMALMAP');
            if (m.vertexColors) d.push('VERTEX_COLORS');
            if (inst) d.push('INSTANCED');
            if (m.wave) d.push('WAVE');
            if (m.side === 'double') d.push('DOUBLE_SIDED');
            if (m.alphaTest) d.push('ALPHA_TEST');
            if (m.macro) d.push('MACRO_VAR');
            if (m.toon) d.push('TOON');
            return this._program('lit|' + d.join('|'), LIT_VS, LIT_FS, d);
        }
        if (m.type === 'basic') {
            const d = [];
            if (m.map) d.push('HAS_MAP');
            if (m.vertexColors) d.push('VERTEX_COLORS');
            if (inst) d.push('INSTANCED');
            if (m.blending === 'additive') d.push('ADDITIVE');
            return this._program('basic|' + d.join('|'), BASIC_VS, BASIC_FS, d);
        }
        // custom shader
        const d = inst ? ['INSTANCED'] : [];
        const instHead = inst ? 'layout(location=4) in mat4 iMatrix;\nlayout(location=8) in vec3 iColor;\n' : '';
        return this._program(m.key + (inst ? '|I' : ''), VS_HEAD + instHead + m.vertex, FS_HEAD + m.fragment, d);
    }

    // ---- resources ------------------------------------------------------
    _uploadGeometry(geo) {
        const gl = this.gl;
        if (!geo.gl) {
            geo.gl = { vao: gl.createVertexArray(), buffers: {} };
        }
        const g = geo.gl;
        gl.bindVertexArray(g.vao);
        const usage = geo.dynamic ? gl.DYNAMIC_DRAW : gl.STATIC_DRAW;
        const attr = (name, data, loc, size) => {
            if (!data) { gl.disableVertexAttribArray(loc); return; }
            let b = g.buffers[name];
            if (!b) { b = g.buffers[name] = gl.createBuffer(); }
            gl.bindBuffer(gl.ARRAY_BUFFER, b);
            gl.bufferData(gl.ARRAY_BUFFER, data, usage);
            gl.enableVertexAttribArray(loc);
            gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 0, 0);
        };
        attr('p', geo.positions, 0, 3);
        attr('n', geo.normals, 1, 3);
        attr('u', geo.uvs, 2, 2);
        attr('c', geo.colors, 3, 3);
        if (!geo.colors) gl.vertexAttrib3f(3, 1, 1, 1);
        if (geo.indices) {
            if (!g.ib) g.ib = gl.createBuffer();
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, g.ib);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, geo.indices, usage);
        }
        g.indexType = geo.indices instanceof Uint32Array ? gl.UNSIGNED_INT : gl.UNSIGNED_SHORT;
        geo.needsUpdate = false;
        gl.bindVertexArray(null);
    }
    _setupInstanced(obj) {
        const gl = this.gl, geo = obj.geometry;
        if (!obj.gl) {
            obj.gl = { vao: gl.createVertexArray(), mb: gl.createBuffer(), cb: gl.createBuffer(), staticBuffers: [] };
            gl.bindVertexArray(obj.gl.vao);
            const bind = (buf, data, loc, size) => {
                obj.gl.staticBuffers.push(buf);
                gl.bindBuffer(gl.ARRAY_BUFFER, buf);
                gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
                gl.enableVertexAttribArray(loc);
                gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 0, 0);
            };
            bind(gl.createBuffer(), geo.positions, 0, 3);
            if (geo.normals) bind(gl.createBuffer(), geo.normals, 1, 3); else gl.disableVertexAttribArray(1);
            if (geo.uvs) bind(gl.createBuffer(), geo.uvs, 2, 2); else gl.disableVertexAttribArray(2);
            if (geo.colors) bind(gl.createBuffer(), geo.colors, 3, 3); else { gl.disableVertexAttribArray(3); gl.vertexAttrib3f(3, 1, 1, 1); }
            if (geo.indices) {
                const ib = gl.createBuffer();
                obj.gl.staticBuffers.push(ib);
                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ib);
                gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, geo.indices, gl.STATIC_DRAW);
            }
            obj.gl.indexType = geo.indices instanceof Uint32Array ? gl.UNSIGNED_INT : gl.UNSIGNED_SHORT;
            gl.bindBuffer(gl.ARRAY_BUFFER, obj.gl.mb);
            gl.bufferData(gl.ARRAY_BUFFER, obj.matrices.byteLength, gl.DYNAMIC_DRAW);
            for (let i = 0; i < 4; i++) {
                gl.enableVertexAttribArray(4 + i);
                gl.vertexAttribPointer(4 + i, 4, gl.FLOAT, false, 64, i * 16);
                gl.vertexAttribDivisor(4 + i, 1);
            }
            gl.bindBuffer(gl.ARRAY_BUFFER, obj.gl.cb);
            gl.bufferData(gl.ARRAY_BUFFER, obj.colors.byteLength, gl.DYNAMIC_DRAW);
            gl.enableVertexAttribArray(8);
            gl.vertexAttribPointer(8, 3, gl.FLOAT, false, 0, 0);
            gl.vertexAttribDivisor(8, 1);
            gl.bindVertexArray(null);
            obj.needsUpdate = true;
        }
        if (obj.needsUpdate) {
            gl.bindBuffer(gl.ARRAY_BUFFER, obj.gl.mb);
            gl.bufferSubData(gl.ARRAY_BUFFER, 0, obj.matrices, 0, obj.count * 16);
            gl.bindBuffer(gl.ARRAY_BUFFER, obj.gl.cb);
            gl.bufferSubData(gl.ARRAY_BUFFER, 0, obj.colors, 0, obj.count * 3);
            obj.needsUpdate = false;
        }
    }
    _setupPoints(obj) {
        const gl = this.gl;
        if (!obj.gl) {
            obj.gl = { vao: gl.createVertexArray(), pb: gl.createBuffer(), sb: gl.createBuffer(), cb: gl.createBuffer() };
            gl.bindVertexArray(obj.gl.vao);
            const mk = (buf, bytes, loc, size) => {
                gl.bindBuffer(gl.ARRAY_BUFFER, buf);
                gl.bufferData(gl.ARRAY_BUFFER, bytes, gl.DYNAMIC_DRAW);
                gl.enableVertexAttribArray(loc);
                gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 0, 0);
            };
            mk(obj.gl.pb, obj.positions.byteLength, 0, 3);
            mk(obj.gl.sb, obj.sizes.byteLength, 1, 1);
            mk(obj.gl.cb, obj.colors.byteLength, 3, 4);
            gl.bindVertexArray(null);
        }
        if (obj.needsUpdate && obj.count > 0) {
            gl.bindBuffer(gl.ARRAY_BUFFER, obj.gl.pb);
            gl.bufferSubData(gl.ARRAY_BUFFER, 0, obj.positions, 0, obj.count * 3);
            gl.bindBuffer(gl.ARRAY_BUFFER, obj.gl.sb);
            gl.bufferSubData(gl.ARRAY_BUFFER, 0, obj.sizes, 0, obj.count);
            gl.bindBuffer(gl.ARRAY_BUFFER, obj.gl.cb);
            gl.bufferSubData(gl.ARRAY_BUFFER, 0, obj.colors, 0, obj.count * 4);
            obj.needsUpdate = false;
        }
    }
    _texture(tex, unit) {
        const gl = this.gl;
        gl.activeTexture(gl.TEXTURE0 + unit);
        if (!tex) { gl.bindTexture(gl.TEXTURE_2D, this._whiteTex()); return; }
        if (!tex.gl) tex.gl = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, tex.gl);
        if (tex.needsUpdate) {
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
            const s = tex.source;
            if (s.data && !(s instanceof HTMLCanvasElement)) {
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, s.width, s.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, s.data);
            } else {
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, s);
            }
            const wrap = tex.wrap === 'clamp' ? gl.CLAMP_TO_EDGE : gl.REPEAT;
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrap);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrap);
            if (tex.mipmaps) {
                gl.generateMipmap(gl.TEXTURE_2D);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
            } else {
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, tex.nearest ? gl.NEAREST : gl.LINEAR);
            }
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, tex.nearest ? gl.NEAREST : gl.LINEAR);
            if (this.aniso && tex.mipmaps) {
                gl.texParameterf(gl.TEXTURE_2D, this.aniso.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(this.maxAniso, tex.anisotropy));
            }
            tex.needsUpdate = false;
        }
    }
    _whiteTex() {
        if (this._white) return this._white;
        const gl = this.gl;
        this._white = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this._white);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255, 255, 255, 255]));
        return this._white;
    }

    // ---- state ----------------------------------------------------------
    _applyMaterialState(m) {
        const gl = this.gl, st = this._state;
        const blend = m.transparent ? m.blending : 'none';
        if (st.blend !== blend) {
            if (blend === 'none') gl.disable(gl.BLEND);
            else {
                gl.enable(gl.BLEND);
                if (blend === 'additive') gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
                else if (blend === 'multiply') gl.blendFunc(gl.DST_COLOR, gl.ZERO);
                else gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
            }
            st.blend = blend;
        }
        if (st.depthWrite !== m.depthWrite) { gl.depthMask(m.depthWrite); st.depthWrite = m.depthWrite; }
        if (st.depthTest !== m.depthTest) { m.depthTest ? gl.enable(gl.DEPTH_TEST) : gl.disable(gl.DEPTH_TEST); st.depthTest = m.depthTest; }
        if (st.cull !== m.side) {
            if (m.side === 'double') gl.disable(gl.CULL_FACE);
            else { gl.enable(gl.CULL_FACE); gl.cullFace(m.side === 'back' ? gl.FRONT : gl.BACK); }
            st.cull = m.side;
        }
    }

    _frameUniforms(p, camera) {
        const gl = this.gl, u = p.uniforms, e = this.env;
        if (p.frame === this.frame) return;
        p.frame = this.frame;
        if (u.uView) gl.uniformMatrix4fv(u.uView, false, camera.view);
        if (u.uProj) gl.uniformMatrix4fv(u.uProj, false, camera.proj);
        if (u.uTime) gl.uniform1f(u.uTime, this.time);
        if (u.uCamPos) gl.uniform3f(u.uCamPos, camera.position.x, camera.position.y, camera.position.z);
        if (u.uFogColor) gl.uniform3fv(u.uFogColor, e.fogColor);
        if (u.uFogDensity) gl.uniform1f(u.uFogDensity, e.fogDensity);
        if (u.uPointScale) gl.uniform1f(u.uPointScale, this.canvas.height / (2 * Math.tan(camera.fov / 2)));
        if (u.uHemiSky) {
            gl.uniform3fv(u.uHemiSky, e.hemiSky);
            gl.uniform3fv(u.uHemiGround, e.hemiGround);
            gl.uniform3f(u.uDirDir, e.dirDir.x, e.dirDir.y, e.dirDir.z);
            gl.uniform3fv(u.uDirColor, e.dirColor);
            gl.uniform3fv(u.uEnvTop, e.envTop);
            gl.uniform3fv(u.uEnvBottom, e.envBottom);
            gl.uniform3fv(u.uRimColor, e.rimColor);
            gl.uniform1f(u.uLavaY, e.lavaY);
            gl.uniform3fv(u.uLavaGlow, e.lavaGlow);
            gl.uniform1f(u.uExposure, e.exposure);
            gl.uniform3fv(u.uPLPos, this._plPos);
            gl.uniform3fv(u.uPLColor, this._plCol);
            gl.uniform1fv(u.uPLRange, this._plRange);
        } else {
            if (u.uLavaY) gl.uniform1f(u.uLavaY, e.lavaY);
        }
    }

    _setUniform(u, name, v, unitRef) {
        const gl = this.gl;
        const loc = u[name];
        if (loc === undefined || loc === null) return;
        if (typeof v === 'number') gl.uniform1f(loc, v);
        else if (v instanceof Texture) { this._texture(v, unitRef.u); gl.uniform1i(loc, unitRef.u); unitRef.u++; }
        else if (v instanceof Vec3) gl.uniform3f(loc, v.x, v.y, v.z);
        else if (v.length === 16) gl.uniformMatrix4fv(loc, false, v);
        else if (v.length === 2) gl.uniform2fv(loc, v);
        else if (v.length === 3) gl.uniform3fv(loc, v);
        else if (v.length === 4) gl.uniform4fv(loc, v);
        else gl.uniform1fv(loc, v);
    }

    // ---- rendering ------------------------------------------------------
    _extractFrustum(m) {
        const f = this._frustum;
        const planes = [
            [m[3] + m[0], m[7] + m[4], m[11] + m[8], m[15] + m[12]],
            [m[3] - m[0], m[7] - m[4], m[11] - m[8], m[15] - m[12]],
            [m[3] + m[1], m[7] + m[5], m[11] + m[9], m[15] + m[13]],
            [m[3] - m[1], m[7] - m[5], m[11] - m[9], m[15] - m[13]],
            [m[3] + m[2], m[7] + m[6], m[11] + m[10], m[15] + m[14]],
            [m[3] - m[2], m[7] - m[6], m[11] - m[10], m[15] - m[14]]
        ];
        for (let i = 0; i < 6; i++) {
            const p = planes[i];
            const l = Math.hypot(p[0], p[1], p[2]);
            f[i * 4] = p[0] / l; f[i * 4 + 1] = p[1] / l; f[i * 4 + 2] = p[2] / l; f[i * 4 + 3] = p[3] / l;
        }
    }
    _inFrustum(obj) {
        const g = obj.geometry;
        const c = M4.transformPoint(obj.world, g.boundCenter.x, g.boundCenter.y, g.boundCenter.z, this._tmpV);
        const r = g.boundRadius * M4.maxScale(obj.world);
        const f = this._frustum;
        for (let i = 0; i < 6; i++) {
            if (f[i * 4] * c.x + f[i * 4 + 1] * c.y + f[i * 4 + 2] * c.z + f[i * 4 + 3] < -r) return false;
        }
        obj._depth = (c.x - this._camX) ** 2 + (c.y - this._camY) ** 2 + (c.z - this._camZ) ** 2;
        return true;
    }
    _collect(node) {
        if (!node.visible) return;
        if (node.material) {
            let ok = true;
            if (node.isPoints) {
                ok = node.count > 0;
                node._depth = (node.world[12] - this._camX) ** 2 + (node.world[13] - this._camY) ** 2 + (node.world[14] - this._camZ) ** 2;
            } else if (node.isInstanced) {
                ok = node.count > 0;
                node._depth = 0;
            } else if (node.frustumCulled) ok = this._inFrustum(node);
            else node._depth = (node.world[12] - this._camX) ** 2 + (node.world[13] - this._camY) ** 2 + (node.world[14] - this._camZ) ** 2;
            if (ok) {
                if (node.material.transparent) this._transparent.push(node);
                else this._opaque.push(node);
            }
        }
        const ch = node.children;
        for (let i = 0; i < ch.length; i++) this._collect(ch[i]);
    }

    render(scene, camera) {
        const gl = this.gl;
        this.frame++;
        camera.aspect = this.width / this.height;
        camera.update();
        scene.updateWorld(null);
        this._extractFrustum(camera.viewProj);
        this._camX = camera.position.x; this._camY = camera.position.y; this._camZ = camera.position.z;
        this._near = camera.near; this._far = camera.far;

        // lights
        const pls = this.env.points;
        for (let i = 0; i < MAX_PL; i++) {
            const l = pls[i];
            if (l && l.range > 0) {
                this._plPos[i * 3] = l.pos.x; this._plPos[i * 3 + 1] = l.pos.y; this._plPos[i * 3 + 2] = l.pos.z;
                this._plCol[i * 3] = l.color[0]; this._plCol[i * 3 + 1] = l.color[1]; this._plCol[i * 3 + 2] = l.color[2];
                this._plRange[i] = l.range;
            } else this._plRange[i] = 0;
        }

        this._opaque.length = 0; this._transparent.length = 0;
        this._collect(scene);
        this._opaque.sort((a, b) => (a.material.renderOrder - b.material.renderOrder) || (a.renderOrder - b.renderOrder) || (a.material.id - b.material.id));
        this._transparent.sort((a, b) => (a.material.renderOrder - b.material.renderOrder) || (a.renderOrder - b.renderOrder) || (b._depth - a._depth));

        const usePost = this.post.enabled && this._postReady;
        if (usePost) {
            this._ensureTargets();
            gl.bindFramebuffer(gl.FRAMEBUFFER, this._pt.msaa ? this._pt.msaa.fbo : this._pt.scene.fbo);
        } else gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        gl.depthMask(true); this._state.depthWrite = true;
        gl.clearColor(this.clearColor[0], this.clearColor[1], this.clearColor[2], 1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        this.stats.draws = 0;
        for (const o of this._opaque) this._draw(o, camera);
        for (const o of this._transparent) this._draw(o, camera);
        if (usePost) this._postProcess();
        gl.bindVertexArray(null);
    }

    _draw(obj, camera) {
        const gl = this.gl, m = obj.material;
        const p = this._programFor(obj);
        if (this._state.program !== p) { gl.useProgram(p.prog); this._state.program = p; }
        this._frameUniforms(p, camera);
        this._applyMaterialState(m);
        const u = p.uniforms;
        const unit = { u: 0 };

        if (obj.isPoints) {
            this._setupPoints(obj);
            if (u.uFogScale) gl.uniform1f(u.uFogScale, m.fogScale !== undefined ? m.fogScale : 1);
            gl.bindVertexArray(obj.gl.vao);
            gl.drawArrays(gl.POINTS, 0, obj.count);
            this.stats.draws++;
            return;
        }

        if (u.uModel) gl.uniformMatrix4fv(u.uModel, false, obj.world);
        if (u.uNormalMat) { M4.normalMatrix(obj._normalMat, obj.world); gl.uniformMatrix3fv(u.uNormalMat, false, obj._normalMat); }

        if (m.type === 'lit') {
            const c = m.color;
            gl.uniform3f(u.uColor, c[0], c[1], c[2]);
            gl.uniform1f(u.uOpacity, m.opacity);
            if (u.uRough) gl.uniform1f(u.uRough, m.roughness);
            if (u.uMetal) gl.uniform1f(u.uMetal, m.metalness);
            if (u.uEmissive) { const e = m.emissive; gl.uniform3f(u.uEmissive, e[0] * e[0], e[1] * e[1], e[2] * e[2]); }
            if (u.uEnvStrength) gl.uniform1f(u.uEnvStrength, m.envStrength);
            if (u.uRim) gl.uniform1f(u.uRim, m.rimStrength);
            if (u.uFlash) gl.uniform1f(u.uFlash, m.flash);
            if (u.uFlashColor) gl.uniform3fv(u.uFlashColor, m.flashColor);
            if (u.uFogScale) gl.uniform1f(u.uFogScale, m.fogScale);
            if (u.uUvScale) gl.uniform2fv(u.uUvScale, m.uvScale);
            if (u.uWave) gl.uniform1f(u.uWave, m.wave);
            if (u.uToonKey) gl.uniform1f(u.uToonKey, m.toonKey);
            if (u.uToonSpec) gl.uniform1f(u.uToonSpec, m.toonSpec);
            if (u.uToonPL) gl.uniform1f(u.uToonPL, m.toonPL);
            if (u.uToonAmb) gl.uniform2fv(u.uToonAmb, m.toonAmb);
            if (m.map) { this._texture(m.map, 0); gl.uniform1i(u.uMap, 0); }
            if (m.normalMap) { this._texture(m.normalMap, 1); gl.uniform1i(u.uNormalMap, 1); if (u.uNormalScale) gl.uniform1f(u.uNormalScale, m.normalScale); }
        } else if (m.type === 'basic') {
            const c = m.color;
            gl.uniform3f(u.uColor, c[0], c[1], c[2]);
            gl.uniform1f(u.uOpacity, m.opacity);
            if (u.uFogScale) gl.uniform1f(u.uFogScale, m.fogScale);
            if (m.map) { this._texture(m.map, 0); gl.uniform1i(u.uMap, 0); unit.u = 1; }
        } else {
            for (const k in m.uniforms) this._setUniform(u, k, m.uniforms[k], unit);
            if (u.uOpacity) gl.uniform1f(u.uOpacity, m.opacity);
        }

        const geo = obj.geometry;
        if (obj.isInstanced) {
            this._setupInstanced(obj);
            gl.bindVertexArray(obj.gl.vao);
            if (geo.indices) gl.drawElementsInstanced(gl.TRIANGLES, geo.count, obj.gl.indexType, 0, obj.count);
            else gl.drawArraysInstanced(gl.TRIANGLES, 0, geo.count, obj.count);
        } else {
            if (!geo.gl || geo.needsUpdate) this._uploadGeometry(geo);
            gl.bindVertexArray(geo.gl.vao);
            const cnt = geo.drawCount !== undefined ? geo.drawCount : geo.count;
            if (geo.indices) gl.drawElements(gl.TRIANGLES, cnt, geo.gl.indexType, 0);
            else gl.drawArrays(gl.TRIANGLES, 0, cnt);
        }
        this.stats.draws++;
    }

    disposeObject(obj) {
        const gl = this.gl, gpu = obj.gl;
        if (!gpu) return;
        if (obj.isInstanced) {
            for (const buf of gpu.staticBuffers) gl.deleteBuffer(buf);
            gl.deleteBuffer(gpu.mb); gl.deleteBuffer(gpu.cb);
        } else if (obj.isPoints) {
            gl.deleteBuffer(gpu.pb); gl.deleteBuffer(gpu.sb); gl.deleteBuffer(gpu.cb);
        } else return;
        gl.deleteVertexArray(gpu.vao);
        obj.gl = null;
    }

    disposeGeometry(geo) {
        if (!geo || !geo.gl) return;
        const gl = this.gl;
        for (const k in geo.gl.buffers) gl.deleteBuffer(geo.gl.buffers[k]);
        if (geo.gl.ib) gl.deleteBuffer(geo.gl.ib);
        gl.deleteVertexArray(geo.gl.vao);
        geo.gl = null;
    }
}


// ======================================================================
// TOON
// ======================================================================
// Cartoon helpers: ink outline material and "toonify", which bakes the static meshes
// under each animated node into one vertex-coloured toon mesh plus an outline shell.

function makeOutlineMaterial(color = [0.07, 0.035, 0.05], width = 0.024) {
    return new ShaderMaterial({
        key: 'outline', side: 'back',
        vertex: `
uniform float uWidth;
out float vDepth;
void main(){
  mat4 m = uModel;
  #ifdef INSTANCED
  m = uModel * iMatrix;
  #endif
  mat4 mv = uView * m;
  vec4 vp = mv * vec4(position, 1.0);
  vec3 vn = normalize(mat3(mv) * normal);
  vp.xyz += vn * uWidth * clamp(-vp.z, 2.0, 60.0) * 0.1;
  vDepth = -vp.z;
  gl_Position = uProj * vp;
}`,
        fragment: `
in float vDepth;
uniform vec3 uColor;
void main(){
  float fd = uFogDensity * vDepth;
  fragColor = vec4(mix(uColor, uFogColor, 1.0 - exp(-fd * fd)), 1.0);
}`,
        uniforms: { uWidth: width, uColor: color }
    });
}

function makeToonMaterials(opts = {}) {
    const toon = new LitMaterial({ toon: true, vertexColors: true, color: [1, 1, 1], rimStrength: opts.rim !== undefined ? opts.rim : 0.5, toonKey: opts.key || 3.2, toonSpec: opts.spec !== undefined ? opts.spec : 0.55 });
    const toonDouble = new LitMaterial({ toon: true, vertexColors: true, color: [1, 1, 1], side: 'double', rimStrength: 0.35, toonKey: opts.key || 3.2, toonSpec: 0.2 });
    const outline = opts.outline === false ? null : makeOutlineMaterial(opts.outlineColor, opts.outlineWidth);
    return { toon, toonDouble, outline };
}

const _tm = M4.create();
function toonify(root, mats) {
    const nodes = [];
    root.traverse(n => nodes.push(n));
    for (const n of nodes) {
        if (n.noBake) continue;
        const kids = n.children.filter(c => c instanceof Mesh && !c.isInstanced && c.children.length === 0 && !c.noBake &&
            c.material && c.material.type === 'lit' && !c.material.transparent && !c.material.map);
        if (!kids.length) continue;
        const single = kids.filter(k => k.material.side !== 'double');
        const dbl = kids.filter(k => k.material.side === 'double');
        for (const [list, isDouble] of [[single, false], [dbl, true]]) {
            if (!list.length) continue;
            const parts = list.map(k => {
                M4.compose(_tm, k.position, k.rotation, k.scale);
                const c = k.material.color, e = k.material.emissive || [0, 0, 0];
                return { geo: k.geometry, matrix: Float32Array.from(_tm), color: [Math.min(1, c[0] + e[0]), Math.min(1, c[1] + e[1]), Math.min(1, c[2] + e[2])] };
            });
            const geo = merge(parts);
            const mesh = new Mesh(geo, isDouble ? mats.toonDouble : mats.toon);
            n.add(mesh);
            if (!isDouble && mats.outline && !n.noOutline) n.add(new Mesh(geo, mats.outline));
            for (const k of list) n.remove(k);
        }
    }
    // merge unlit (basic) opaque meshes per node too: eyes, visors, glows
    for (const n of nodes) {
        const kids = n.children.filter(c => c instanceof Mesh && !c.isInstanced && c.children.length === 0 && !c.noBake &&
            c.material && c.material.type === 'basic' && !c.material.transparent && !c.material.map && !c.material.vertexColors);
        if (kids.length < 2) continue;
        const parts = kids.map(k => {
            M4.compose(_tm, k.position, k.rotation, k.scale);
            return { geo: k.geometry, matrix: Float32Array.from(_tm), color: k.material.color.slice(0, 3) };
        });
        const mesh = new Mesh(merge(parts), mats.basic || (mats.basic = new BasicMaterial({ vertexColors: true, color: [1, 1, 1] })));
        n.add(mesh);
        for (const k of kids) n.remove(k);
    }
    return root;
}
return { Vec3, TAU, clamp, lerp, smooth01, damp, wrapAngle, angleDiff, dampAngle, makeRng, M4, makeNoise2D, Node, Geometry, Texture, Material, LitMaterial, BasicMaterial, ShaderMaterial, Mesh, InstancedMesh, Points, Camera, GeoBuilder, box, cylinder, sphere, lathe, plane, torus, extrude, merge, deform, recomputeNormals, MAX_PL, hexColor, Renderer, makeOutlineMaterial, makeToonMaterials, toonify, toLin };
})();


// ======================================================================
//  graphics.js
// ======================================================================
const __graphics = (({ Texture, makeRng, makeNoise2D, LitMaterial, BasicMaterial, ShaderMaterial, hexColor, Points, Material, InstancedMesh, box, Vec3 }) => {
// Procedural textures, shared materials and particle effects.

// ======================================================================
// TEXTURES
// ======================================================================
// Procedural textures: stone walls with normal maps, slabs, wood, banners, glow sprites.

function canvas(w, h) {
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    return c;
}

// Build normal map ImageData from a height field (wrapping)
function normalFromHeight(H, W, Hh, strength) {
    const c = canvas(W, Hh);
    const ctx = c.getContext('2d');
    const img = ctx.createImageData(W, Hh);
    const d = img.data;
    for (let y = 0; y < Hh; y++) {
        const ym = ((y - 1 + Hh) % Hh) * W, yp = ((y + 1) % Hh) * W, y0 = y * W;
        for (let x = 0; x < W; x++) {
            const xm = (x - 1 + W) % W, xp = (x + 1) % W;
            const dx = (H[y0 + xp] - H[y0 + xm]) * strength;
            const dy = (H[yp + x] - H[ym + x]) * strength;
            // canvas y goes down, texture v goes up when sampled (no flip) -> keep consistent with uv v = row
            let nx = -dx, ny = -dy, nz = 1;
            const l = Math.hypot(nx, ny, nz);
            const i = (y0 + x) * 4;
            d[i] = (nx / l * 0.5 + 0.5) * 255;
            d[i + 1] = (ny / l * 0.5 + 0.5) * 255;
            d[i + 2] = (nz / l * 0.5 + 0.5) * 255;
            d[i + 3] = 255;
        }
    }
    ctx.putImageData(img, 0, 0);
    return c;
}

// Generic masonry generator: rows of blocks with wrap-around, mortar, chips, cracks, grime.
function masonry(opts) {
    const S = opts.size;
    const rng = makeRng(opts.seed);
    const n1 = makeNoise2D(opts.seed + 1, 16);
    const n2 = makeNoise2D(opts.seed + 2, 64);
    const n3 = makeNoise2D(opts.seed + 3, 8);
    const heights = new Float32Array(S * S);
    const ids = new Int32Array(S * S).fill(-1);
    const dist = new Float32Array(S * S);
    const bricks = [];
    // rows
    const rows = [];
    let total = 0;
    while (total < S) {
        const h = rng.range(opts.rowMin, opts.rowMax) * S;
        rows.push(h); total += h;
    }
    const k = S / total;
    let y = 0;
    for (const rh0 of rows) {
        const rh = rh0 * k;
        let x = rng.range(0, S);
        const start = x;
        while (x < start + S - 1) {
            let w = rng.range(opts.brickMin, opts.brickMax) * S;
            if (x + w > start + S - opts.brickMin * S * 0.6) w = start + S - x;
            bricks.push({ x, y, w, h: rh, tone: rng(), hue: rng(), moss: rng() < opts.mossChance, dark: rng() < 0.12, bulge: rng.range(0.6, 1.0) });
            x += w;
        }
        y += rh;
    }
    const mortar = opts.mortar * S;
    const corner = (opts.corner || 0.018) * S;
    // rasterize bricks (rounded rectangles, wrap horizontally)
    bricks.forEach((b, bi) => {
        const x0 = Math.floor(b.x), x1 = Math.ceil(b.x + b.w);
        const y0 = Math.floor(b.y), y1 = Math.min(S, Math.ceil(b.y + b.h));
        for (let py = y0; py < y1; py++) {
            for (let px = x0; px < x1; px++) {
                const dx = Math.min(px + 0.5 - b.x, b.x + b.w - px - 0.5) - mortar * 0.5;
                const dy = Math.min(py + 0.5 - b.y, b.y + b.h - py - 0.5) - mortar * 0.5;
                let d;
                const qx = corner - dx, qy = corner - dy;
                if (qx > 0 && qy > 0) d = corner - Math.hypot(qx, qy); else d = Math.min(dx, dy);
                const wx = ((px % S) + S) % S;
                const idx = py * S + wx;
                if (ids[idx] < 0 || d > dist[idx]) { dist[idx] = d; ids[idx] = bi; }
            }
        }
    });
    // cracks: random walks stored as darkening map
    const crack = new Float32Array(S * S);
    for (let c = 0; c < opts.cracks; c++) {
        let cx = rng() * S, cy = rng() * S, ang = rng() * Math.PI * 2;
        const len = rng.range(0.04, 0.2) * S;
        for (let st = 0; st < len; st++) {
            ang += (rng() - 0.5) * 0.8;
            cx += Math.cos(ang); cy += Math.sin(ang);
            const px = ((Math.floor(cx) % S) + S) % S, py = ((Math.floor(cy) % S) + S) % S;
            crack[py * S + px] = 1;
            if (rng() < 0.4) crack[py * S + ((px + 1) % S)] = 0.5;
        }
    }
    const n4 = makeNoise2D(opts.seed + 4, 128);
    const col = canvas(S, S);
    const ctx = col.getContext('2d');
    const img = ctx.createImageData(S, S);
    const data = img.data;
    const pal = opts.palette;
    const chip = opts.chip * S;
    const bevel = opts.bevel * S;
    const f = S / 512;
    for (let py = 0; py < S; py++) {
        const v = py / S;
        for (let px = 0; px < S; px++) {
            const i = py * S + px;
            const u = px / S;
            const nLow = n1(u * 16, v * 16);
            const nMid = n3(u * 8, v * 8);
            const nHi = n2(u * 64, v * 64) * 0.6 + n4(u * 128, v * 128) * 0.4;
            const bi = ids[i];
            const b = bricks[bi];
            const d = dist[i] - (nLow * 0.55 + nHi * 0.45 - 0.2) * chip;
            let h, r, g, bl;
            if (bi < 0 || d <= 0) {
                h = 0.05 + nHi * 0.1;
                const m = 0.7 + nHi * 0.3 + (nLow - 0.5) * 0.3;
                r = pal.mortar[0] * m; g = pal.mortar[1] * m; bl = pal.mortar[2] * m;
            } else {
                const e = Math.min(1, d / bevel);
                const edge = e * (2 - e);
                const surf = nMid * 0.35 + nLow * 0.35 + nHi * 0.3;
                h = 0.3 + edge * 0.45 * b.bulge + (surf - 0.5) * 0.35;
                const base = b.dark ? pal.dark : (b.hue < 0.5 ? pal.a : pal.b);
                const tint = 0.85 + b.tone * 0.28;
                let t = tint * (0.72 + surf * 0.55);
                t *= 0.8 + 0.2 * edge;
                // pitting
                if (nHi < 0.22) t *= 0.78;
                r = base[0] * t; g = base[1] * t; bl = base[2] * t;
                // dust on top faces of stones, darker bottoms
                const fromTop = (py - b.y) / b.h;
                const shade = 1.06 - fromTop * 0.16;
                r *= shade; g *= shade; bl *= shade;
                if (b.moss) {
                    const mm = Math.max(0, (nMid - 0.42) * 2.5) * Math.max(0, fromTop - 0.35) * 1.4;
                    const k = Math.min(0.85, mm);
                    r = r * (1 - k) + pal.moss[0] * k; g = g * (1 - k) + pal.moss[1] * k; bl = bl * (1 - k) + pal.moss[2] * k;
                }
            }
            // soot / water streaks running down
            const streak = Math.max(0, n2(u * 64 * 1.5, v * 3) * 0.7 + nLow * 0.3 - 0.5) * opts.soot;
            r *= 1 - streak; g *= 1 - streak; bl *= 1 - streak * 0.95;
            const ck = crack[i];
            if (ck > 0 && bi >= 0 && d > 1) { h -= 0.2 * ck; r *= 0.5; g *= 0.5; bl *= 0.5; }
            if (bi >= 0 && d > 0 && d < bevel * 1.5) {
                const ao = 0.8 + 0.2 * Math.min(1, d / (bevel * 1.5));
                r *= ao; g *= ao; bl *= ao;
            }
            heights[i] = h;
            const o = i * 4;
            data[o] = Math.min(255, r * 255); data[o + 1] = Math.min(255, g * 255); data[o + 2] = Math.min(255, bl * 255); data[o + 3] = 255;
        }
    }
    ctx.putImageData(img, 0, 0);
    const nrm = normalFromHeight(heights, S, S, opts.normalStrength * f);
    return {
        map: new Texture(col, { anisotropy: 8 }),
        normal: new Texture(nrm, { anisotropy: 8 }),
        canvas: col
    };
}

// Cartoon masonry: flat stone colours, thick ink mortar, bevel highlight/shadow bands,
// posterised speckles, ink cracks and flat moss. Matches the outlined toon look.
function cartoonMasonry(opts) {
    const S = opts.size;
    const rng = makeRng(opts.seed);
    const n1 = makeNoise2D(opts.seed + 1, 16);
    const n2 = makeNoise2D(opts.seed + 2, 64);
    const rows = [];
    let total = 0;
    while (total < S) { const h = rng.range(opts.rowMin, opts.rowMax) * S; rows.push(h); total += h; }
    const k = S / total;
    const bricks = [];
    let y = 0;
    for (const rh0 of rows) {
        const rh = rh0 * k;
        let x = rng.range(0, S);
        const start = x;
        while (x < start + S - 1) {
            let w = rng.range(opts.brickMin, opts.brickMax) * S;
            if (x + w > start + S - opts.brickMin * S * 0.6) w = start + S - x;
            bricks.push({ x, y, w, h: rh, tone: rng.int(0, opts.palette.stones.length - 1), moss: rng() < opts.mossChance, crack: rng() < opts.crackChance, seed: rng() * 100 });
            x += w;
        }
        y += rh;
    }
    const ids = new Int32Array(S * S).fill(-1);
    const dx0 = new Float32Array(S * S), dy0 = new Float32Array(S * S), dist = new Float32Array(S * S);
    const mortar = opts.mortar * S, corner = opts.corner * S;
    bricks.forEach((b, bi) => {
        const x0 = Math.floor(b.x), x1 = Math.ceil(b.x + b.w);
        const y0 = Math.floor(b.y), y1 = Math.min(S, Math.ceil(b.y + b.h));
        for (let py = y0; py < y1; py++) for (let px = x0; px < x1; px++) {
            const ddx = Math.min(px + 0.5 - b.x, b.x + b.w - px - 0.5) - mortar * 0.5;
            const ddy = Math.min(py + 0.5 - b.y, b.y + b.h - py - 0.5) - mortar * 0.5;
            const qx = corner - ddx, qy = corner - ddy;
            const d = (qx > 0 && qy > 0) ? corner - Math.hypot(qx, qy) : Math.min(ddx, ddy);
            const idx = py * S + (((px % S) + S) % S);
            if (ids[idx] < 0 || d > dist[idx]) { ids[idx] = bi; dist[idx] = d; dx0[idx] = px + 0.5 - b.x; dy0[idx] = py + 0.5 - b.y; }
        }
    });
    const c = canvas(S, S);
    const ctx = c.getContext('2d');
    const img = ctx.createImageData(S, S);
    const data = img.data;
    const P = opts.palette;
    const bevel = opts.bevel * S;
    for (let py = 0; py < S; py++) {
        const v = py / S;
        for (let px = 0; px < S; px++) {
            const i = py * S + px, u = px / S;
            const bi = ids[i];
            const wob = (n1(u * 16, v * 16) - 0.5) * opts.chip * S;
            const d = dist[i] + wob;
            let col;
            if (bi < 0 || d <= 0) col = P.mortar;
            else {
                const b = bricks[bi];
                const base = P.stones[b.tone];
                let f = 1;
                const fromTop = dy0[i], fromBot = b.h - dy0[i];
                if (fromTop < bevel + mortar * 0.5 + wob * 0.3) f = 1.28;
                else if (fromBot < bevel + mortar * 0.5 - wob * 0.3) f = 0.72;
                else if (dx0[i] < bevel * 0.8 + mortar * 0.5) f = 1.12;
                const sp = n1(u * 16 + b.seed, v * 16) * 0.6 + n2(u * 64 + b.seed, v * 64) * 0.4;
                if (sp > 0.68) f *= 0.86; else if (sp < 0.26) f *= 1.07;
                col = [base[0] * f, base[1] * f, base[2] * f];
                if (b.moss) {
                    const m = n1(u * 16 * 2 + b.seed, v * 16 * 2);
                    if (m > 0.55 && fromBot < b.h * 0.55) col = m > 0.7 ? P.mossLight : P.moss;
                }
                if (d < mortar * 0.35) col = [col[0] * 0.55, col[1] * 0.55, col[2] * 0.55];
            }
            const o = i * 4;
            data[o] = Math.min(255, col[0] * 255); data[o + 1] = Math.min(255, col[1] * 255); data[o + 2] = Math.min(255, col[2] * 255); data[o + 3] = 255;
        }
    }
    ctx.putImageData(img, 0, 0);
    // ink cracks drawn on top
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.strokeStyle = `rgb(${P.mortar.map(x => Math.floor(x * 255)).join(',')})`;
    ctx.lineWidth = Math.max(1.2, S / 300);
    for (const b of bricks) {
        if (!b.crack) continue;
        const off = Math.floor(b.x / S) * S;
        let cx = b.x + b.w * (0.2 + 0.6 * ((b.seed * 7) % 1)), cy = b.y + mortar;
        let a = Math.PI / 2 + ((b.seed % 1) - 0.5);
        const pts = [[cx, cy]];
        const steps = 4 + Math.floor((b.seed * 3) % 4);
        for (let t = 0; t < steps; t++) {
            a += (((b.seed * (t + 3)) % 1) - 0.5) * 1.2;
            cx += Math.cos(a) * b.h * 0.25; cy += Math.sin(a) * b.h * 0.25;
            if (cy > b.y + b.h - mortar || cx < b.x + mortar || cx > b.x + b.w - mortar) break;
            pts.push([cx, cy]);
        }
        for (const shift of [0, -S]) {
            ctx.beginPath();
            pts.forEach((p, i) => i ? ctx.lineTo(p[0] - off + shift, p[1]) : ctx.moveTo(p[0] - off + shift, p[1]));
            ctx.stroke();
        }
    }
    return { map: new Texture(c, { anisotropy: 8 }), canvas: c };
}

function cartoonWood(S) {
    const c = canvas(S, S);
    const ctx = c.getContext('2d');
    const planks = 4, pw = S / planks;
    const tones = ['#7a4a2c', '#6b3f25', '#83522f', '#704428'];
    for (let p = 0; p < planks; p++) {
        ctx.fillStyle = tones[p % tones.length];
        ctx.fillRect(p * pw, 0, pw, S);
        ctx.fillStyle = 'rgba(255,220,170,0.18)';
        ctx.fillRect(p * pw + pw * 0.08, 0, pw * 0.1, S);
        ctx.strokeStyle = 'rgba(40,20,10,0.55)'; ctx.lineWidth = S / 170;
        for (let g = 0; g < 3; g++) {
            ctx.beginPath();
            const gx = p * pw + pw * (0.3 + g * 0.2);
            ctx.moveTo(gx, 0);
            for (let yy = 0; yy <= S; yy += S / 8) ctx.lineTo(gx + Math.sin(yy * 0.05 + g + p) * pw * 0.06, yy);
            ctx.stroke();
        }
    }
    ctx.fillStyle = '#1a0e08';
    for (let p = 0; p <= planks; p++) ctx.fillRect(p * pw - S / 90, 0, S / 45, S);
    for (const by of [0.17, 0.83]) {
        ctx.fillStyle = '#3a3a44'; ctx.fillRect(0, S * (by - 0.035), S, S * 0.07);
        ctx.fillStyle = '#1a1a22'; ctx.fillRect(0, S * (by + 0.03), S, S * 0.012);
        ctx.fillStyle = '#6a6a78'; ctx.fillRect(0, S * (by - 0.035), S, S * 0.01);
        ctx.fillStyle = '#9a9aa8';
        for (let p = 0; p < planks; p++) { ctx.beginPath(); ctx.arc(p * pw + pw / 2, S * by, S / 70, 0, 7); ctx.fill(); }
    }
    return { map: new Texture(c), canvas: c };
}

function makeTextures(quality = 1) {
    const big = quality >= 1 ? 1024 : 512;
    const mid = quality >= 1 ? 512 : 256;
    const T = {};
    T.wall = cartoonMasonry({
        size: big, seed: 11, rowMin: 0.1, rowMax: 0.15, brickMin: 0.17, brickMax: 0.34,
        mortar: 0.016, chip: 0.012, bevel: 0.016, corner: 0.018, mossChance: 0.16, crackChance: 0.14,
        palette: {
            stones: [[0.36, 0.33, 0.4], [0.31, 0.29, 0.36], [0.4, 0.35, 0.39], [0.34, 0.32, 0.34], [0.27, 0.25, 0.31]],
            mortar: [0.07, 0.045, 0.07], moss: [0.2, 0.3, 0.2], mossLight: [0.28, 0.4, 0.24]
        }
    });
    T.slab = cartoonMasonry({
        size: mid, seed: 23, rowMin: 0.45, rowMax: 0.55, brickMin: 0.34, brickMax: 0.55,
        mortar: 0.026, chip: 0.014, bevel: 0.035, corner: 0.03, mossChance: 0.1, crackChance: 0.3,
        palette: {
            stones: [[0.55, 0.49, 0.5], [0.5, 0.45, 0.48], [0.58, 0.52, 0.5]],
            mortar: [0.08, 0.05, 0.07], moss: [0.24, 0.34, 0.22], mossLight: [0.32, 0.44, 0.26]
        }
    });
    T.ground = cartoonMasonry({
        size: mid, seed: 41, rowMin: 0.18, rowMax: 0.28, brickMin: 0.2, brickMax: 0.4,
        mortar: 0.028, chip: 0.016, bevel: 0.03, corner: 0.03, mossChance: 0.05, crackChance: 0.25,
        palette: {
            stones: [[0.34, 0.3, 0.34], [0.3, 0.27, 0.31], [0.37, 0.32, 0.33]],
            mortar: [0.06, 0.035, 0.05], moss: [0.2, 0.28, 0.18], mossLight: [0.26, 0.36, 0.22]
        }
    });
    T.wood = cartoonWood(256);
    T.banner = bannerTexture();
    T.web = cobwebTexture();
    T.glow = radialTexture(64, [255, 255, 255], 1.6);
    T.shadow = radialTexture(64, [0, 0, 0], 1.3);
    T.fade = fadeTexture();
    T.cracked = crackedTexture(T.slab.canvas, 99);
    T.rune = runeTexture();
    T.warn = warnTexture();
    T.runeBand = runeBandTexture();
    T.beam = beamTexture();
    T.shock = shockTexture();
    return T;
}

// floor telegraph: bold ring, hatched danger fill, inner ring (tinted per attack)
function warnTexture() {
    const S = 128;
    const c = canvas(S, S);
    const ctx = c.getContext('2d');
    const m = S / 2;
    ctx.save();
    ctx.beginPath(); ctx.arc(m, m, S * 0.46, 0, Math.PI * 2); ctx.clip();
    ctx.fillStyle = 'rgba(255,255,255,0.22)'; ctx.fillRect(0, 0, S, S);
    ctx.strokeStyle = 'rgba(255,255,255,0.28)'; ctx.lineWidth = S * 0.05;
    for (let k = -S; k < S * 2; k += S * 0.13) { ctx.beginPath(); ctx.moveTo(k, 0); ctx.lineTo(k - S, S); ctx.stroke(); }
    ctx.restore();
    ctx.strokeStyle = 'rgba(255,255,255,1)'; ctx.lineWidth = S * 0.075;
    ctx.beginPath(); ctx.arc(m, m, S * 0.43, 0, Math.PI * 2); ctx.stroke();
    ctx.lineWidth = S * 0.03;
    ctx.beginPath(); ctx.arc(m, m, S * 0.25, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.beginPath(); ctx.arc(m, m, S * 0.07, 0, Math.PI * 2); ctx.fill();
    return new Texture(c, { wrap: 'clamp' });
}

// ground-pound shockwave: a soft ring with a bright leading edge
function shockTexture() {
    const S = 128;
    const c = canvas(S, S);
    const ctx = c.getContext('2d');
    const img = ctx.createImageData(S, S);
    for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
        const dx = (x + 0.5) / S * 2 - 1, dy = (y + 0.5) / S * 2 - 1;
        const r = Math.sqrt(dx * dx + dy * dy);
        let a = 0;
        if (r < 1) {
            const edge = Math.exp(-Math.pow((r - 0.86) / 0.07, 2));
            const inner = r < 0.86 ? Math.pow(r / 0.86, 3) * 0.35 : 0;
            a = Math.min(1, edge + inner);
        }
        const o = (y * S + x) * 4;
        img.data[o] = 255; img.data[o + 1] = 255; img.data[o + 2] = 255; img.data[o + 3] = a * 255;
    }
    ctx.putImageData(img, 0, 0);
    return new Texture(c, { wrap: 'clamp' });
}

// vertical light column over a telegraph: bright at the floor (v = 0, canvas top), fading upward
function beamTexture() {
    const W = 64, H = 128;
    const c = canvas(W, H);
    const ctx = c.getContext('2d');
    const img = ctx.createImageData(W, H);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        const u = (x + 0.5) / W, v = (y + 0.5) / H;
        const streak = 0.72 + 0.28 * Math.sin(u * Math.PI * 2 * 5) * Math.sin(u * Math.PI * 2 * 3 + 1.3);
        const a = Math.pow(1 - v, 1.6) * streak + (v < 0.06 ? (0.06 - v) / 0.06 * 0.4 : 0);
        const o = (y * W + x) * 4;
        img.data[o] = 255; img.data[o + 1] = 255; img.data[o + 2] = 255; img.data[o + 3] = Math.min(1, a) * 255;
    }
    ctx.putImageData(img, 0, 0);
    return new Texture(c, { wrap: 'repeat' });
}

// strip of glowing glyphs for the rune circle in the boss hall
function runeBandTexture() {
    const W = 512, H = 64;
    const c = canvas(W, H);
    const ctx = c.getContext('2d');
    const rng = makeRng(666);
    ctx.strokeStyle = 'rgba(255,255,255,0.95)'; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(0, 6); ctx.lineTo(W, 6); ctx.moveTo(0, H - 6); ctx.lineTo(W, H - 6); ctx.stroke();
    const n = 12;
    for (let i = 0; i < n; i++) {
        const x0 = (i + 0.5) * W / n, y0 = H / 2;
        ctx.lineWidth = 3.2;
        ctx.beginPath();
        const kind = Math.floor(rng() * 4);
        if (kind === 0) { ctx.moveTo(x0 - 10, y0 + 14); ctx.lineTo(x0, y0 - 16); ctx.lineTo(x0 + 10, y0 + 14); ctx.moveTo(x0 - 7, y0 + 2); ctx.lineTo(x0 + 7, y0 + 2); }
        else if (kind === 1) { ctx.arc(x0, y0, 11, 0, Math.PI * 2); ctx.moveTo(x0, y0 - 18); ctx.lineTo(x0, y0 + 18); }
        else if (kind === 2) { ctx.moveTo(x0 - 11, y0 - 14); ctx.lineTo(x0 + 11, y0 + 14); ctx.moveTo(x0 + 11, y0 - 14); ctx.lineTo(x0 - 11, y0 + 14); ctx.moveTo(x0 - 12, y0); ctx.lineTo(x0 + 12, y0); }
        else { ctx.moveTo(x0 - 9, y0 - 15); ctx.lineTo(x0 + 9, y0 - 15); ctx.lineTo(x0 - 9, y0 + 15); ctx.lineTo(x0 + 9, y0 + 15); }
        ctx.stroke();
        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        ctx.beginPath(); ctx.arc(x0 + W / n / 2, y0, 2.6, 0, Math.PI * 2); ctx.fill();
    }
    return new Texture(c, { wrap: 'repeat' });
}

function woodTexture(S) {
    const c = canvas(S, S);
    const ctx = c.getContext('2d');
    const img = ctx.createImageData(S, S);
    const d = img.data;
    const n = makeNoise2D(5, 32);
    const planks = 4;
    const H = new Float32Array(S * S);
    for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
        const u = x / S, v = y / S;
        const p = Math.floor(u * planks);
        const lu = u * planks - p;
        const grain = n(p * 7 + lu * 3, v * 32 * 0.25 + p * 3) * 0.6 + n(lu * 12 + p, v * 8) * 0.4;
        let t = 0.55 + grain * 0.5 + ((p * 37) % 5) * 0.03;
        let h = 0.6 + grain * 0.2;
        const gap = Math.min(lu, 1 - lu);
        if (gap < 0.035) { t *= 0.35; h = 0.1; }
        // iron bands
        const band = (v > 0.14 && v < 0.2) || (v > 0.8 && v < 0.86);
        let r = 0.42 * t, g = 0.26 * t, b = 0.14 * t;
        if (band) {
            const rivet = (Math.abs(((lu + 0.5) % 1) - 0.5) < 0.06) && Math.abs(((v * 100) % 6) - 3) < 1.6;
            const m = 0.32 + n(u * 40, v * 40) * 0.12 + (rivet ? 0.2 : 0);
            r = m; g = m * 0.95; b = m * 0.92; h = rivet ? 1 : 0.85;
        }
        H[y * S + x] = h;
        const o = (y * S + x) * 4;
        d[o] = r * 255; d[o + 1] = g * 255; d[o + 2] = b * 255; d[o + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
    return { map: new Texture(c), normal: new Texture(normalFromHeight(H, S, S, 4)) };
}

function bannerTexture() {
    const W = 128, H = 256;
    const c = canvas(W, H);
    const ctx = c.getContext('2d');
    const rng = makeRng(77);
    // cloth: Halloween purple
    const g = ctx.createLinearGradient(0, 0, W, 0);
    g.addColorStop(0, '#22093a'); g.addColorStop(0.5, '#4d1677'); g.addColorStop(1, '#22093a');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 900; i++) {
        ctx.fillStyle = `rgba(0,0,0,${rng() * 0.12})`;
        ctx.fillRect(rng() * W, rng() * H, 1, rng() * 6);
    }
    // border
    ctx.strokeStyle = '#ff8a2a'; ctx.lineWidth = 5;
    ctx.strokeRect(9, 6, W - 18, H - 40);
    // emblem: a jack-o'-lantern
    const cx = W / 2, cy = 120, r = 30;
    ctx.fillStyle = '#ff7a1a';
    for (const [ox, w] of [[-0.55, 0.55], [0.55, 0.55], [0, 0.7]]) { ctx.beginPath(); ctx.ellipse(cx + ox * r, cy, r * w, r * 0.92, 0, 0, Math.PI * 2); ctx.fill(); }
    ctx.strokeStyle = '#a8400c'; ctx.lineWidth = 2;
    for (const ox of [-0.3, 0.3]) { ctx.beginPath(); ctx.ellipse(cx + ox * r, cy, r * 0.32, r * 0.88, 0, -Math.PI / 2, Math.PI / 2, ox < 0); ctx.stroke(); }
    ctx.fillStyle = '#3d7a1f'; ctx.fillRect(cx - 4, cy - r - 10, 8, 13);
    ctx.fillStyle = '#ffe07a';
    for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(cx + s * 22, cy - 2); ctx.lineTo(cx + s * 6, cy - 2); ctx.lineTo(cx + s * 14, cy - 16); ctx.fill(); }
    ctx.beginPath(); ctx.moveTo(cx - 24, cy + 6); ctx.quadraticCurveTo(cx, cy + 30, cx + 24, cy + 6);
    for (let k = 0; k <= 6; k++) { const x = cx + 24 - k * 8; ctx.lineTo(x, cy + 12 + (k % 2) * 7); }
    ctx.fill();
    // bats on the cloth
    ctx.fillStyle = '#ff8a2a';
    for (const [bx, by, s] of [[34, 52, 1], [92, 66, 0.8], [64, 190, 0.9]]) {
        ctx.beginPath(); ctx.moveTo(bx, by); ctx.quadraticCurveTo(bx - 8 * s, by - 8 * s, bx - 16 * s, by - 2 * s); ctx.quadraticCurveTo(bx - 10 * s, by + 1 * s, bx - 8 * s, by + 5 * s);
        ctx.quadraticCurveTo(bx - 4 * s, by + 2 * s, bx, by + 6 * s); ctx.quadraticCurveTo(bx + 4 * s, by + 2 * s, bx + 8 * s, by + 5 * s); ctx.quadraticCurveTo(bx + 10 * s, by + 1 * s, bx + 16 * s, by - 2 * s);
        ctx.quadraticCurveTo(bx + 8 * s, by - 8 * s, bx, by); ctx.fill();
    }
    // tattered bottom edge + holes via alpha
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.moveTo(0, H);
    let x = 0;
    while (x < W) {
        const y = H - 30 + rng() * 26;
        ctx.lineTo(x, y);
        x += 6 + rng() * 10;
    }
    ctx.lineTo(W, H); ctx.closePath(); ctx.fill();
    for (let i = 0; i < 6; i++) {
        ctx.beginPath(); ctx.ellipse(rng() * W, 30 + rng() * (H - 80), 2 + rng() * 5, 3 + rng() * 7, rng() * 3, 0, 7); ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';
    return new Texture(c, { wrap: 'clamp' });
}

// a corner cobweb (spokes and sagging threads), white on transparent
function cobwebTexture() {
    const S = 256;
    const c = canvas(S, S);
    const ctx = c.getContext('2d');
    ctx.strokeStyle = 'rgba(255,255,255,0.95)'; ctx.lineCap = 'round';
    const spokes = 8, R = S * 0.98;
    const ang = []; for (let i = 0; i < spokes; i++) ang.push((Math.PI / 2) * i / (spokes - 1));
    ctx.lineWidth = 2.2;
    for (const a of ang) { ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * R, Math.sin(a) * R); ctx.stroke(); }
    ctx.lineWidth = 1.6;
    for (let k = 1; k <= 7; k++) {
        const rr = R * Math.pow(k / 7.4, 1.1);
        ctx.beginPath();
        for (let i = 0; i < spokes - 1; i++) {
            const a0 = ang[i], a1 = ang[i + 1], am = (a0 + a1) / 2, sag = rr * 0.86;
            if (i === 0) ctx.moveTo(Math.cos(a0) * rr, Math.sin(a0) * rr);
            ctx.quadraticCurveTo(Math.cos(am) * sag, Math.sin(am) * sag, Math.cos(a1) * rr, Math.sin(a1) * rr);
        }
        ctx.stroke();
    }
    return new Texture(c, { wrap: 'clamp' });
}

function runeTexture() {
    const S = 128;
    const c = canvas(S, S);
    const ctx = c.getContext('2d');
    const g = ctx.createRadialGradient(S / 2, S / 2, 4, S / 2, S / 2, S / 2);
    g.addColorStop(0, 'rgba(255,220,140,1)');
    g.addColorStop(0.4, 'rgba(255,170,60,0.55)');
    g.addColorStop(1, 'rgba(255,120,20,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, S, S);
    ctx.strokeStyle = 'rgba(255,240,200,0.9)'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(S / 2, S / 2, S * 0.36, 0, 7); ctx.stroke();
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(S / 2, S / 2, S * 0.28, 0, 7); ctx.stroke();
    for (let i = 0; i < 8; i++) {
        const a = i / 8 * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(S / 2 + Math.cos(a) * S * 0.29, S / 2 + Math.sin(a) * S * 0.29);
        ctx.lineTo(S / 2 + Math.cos(a + 0.2) * S * 0.35, S / 2 + Math.sin(a + 0.2) * S * 0.35);
        ctx.stroke();
    }
    return new Texture(c, { wrap: 'clamp' });
}

function crackedTexture(src, seed) {
    const S = src.width;
    const c = canvas(S, S);
    const ctx = c.getContext('2d');
    ctx.drawImage(src, 0, 0);
    ctx.fillStyle = 'rgba(150,70,40,0.28)';
    ctx.fillRect(0, 0, S, S);
    const rng = makeRng(seed);
    ctx.lineCap = 'round';
    for (let k = 0; k < 16; k++) {
        let x = rng() * S, y = rng() * S, a = rng() * Math.PI * 2;
        ctx.beginPath(); ctx.moveTo(x, y);
        const len = 10 + rng() * 22;
        for (let i = 0; i < len; i++) {
            a += (rng() - 0.5) * 1.1;
            x += Math.cos(a) * S * 0.02; y += Math.sin(a) * S * 0.02;
            ctx.lineTo(x, y);
            if (rng() < 0.12) { // branch
                const bx = x, by = y; let ba = a + (rng() < 0.5 ? 1 : -1) * 0.9;
                ctx.moveTo(bx, by);
                let xx = bx, yy = by;
                for (let j = 0; j < 5; j++) { ba += (rng() - 0.5) * 0.8; xx += Math.cos(ba) * S * 0.018; yy += Math.sin(ba) * S * 0.018; ctx.lineTo(xx, yy); }
                ctx.moveTo(x, y);
            }
        }
        ctx.strokeStyle = 'rgba(20,8,4,0.95)'; ctx.lineWidth = Math.max(1.5, S / 160); ctx.stroke();
        ctx.strokeStyle = 'rgba(255,150,70,0.35)'; ctx.lineWidth = Math.max(0.6, S / 400); ctx.stroke();
    }
    return new Texture(c, { anisotropy: 8 });
}

function fadeTexture() {
    const W = 64, H = 64;
    const c = canvas(W, H);
    const ctx = c.getContext('2d');
    const img = ctx.createImageData(W, H);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        const u = (x + 0.5) / W, v = (y + 0.5) / H;
        const edge = Math.min(1, u / 0.18) * Math.min(1, (1 - u) / 0.18);
        const a = Math.pow(1 - v, 1.7) * edge * edge * (3 - 2 * edge);
        const o = (y * W + x) * 4;
        img.data[o] = 0; img.data[o + 1] = 0; img.data[o + 2] = 0; img.data[o + 3] = a * 255;
    }
    ctx.putImageData(img, 0, 0);
    return new Texture(c, { wrap: 'clamp' });
}

function radialTexture(S, rgb, power) {
    const c = canvas(S, S);
    const ctx = c.getContext('2d');
    const img = ctx.createImageData(S, S);
    for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
        const dx = (x + 0.5) / S * 2 - 1, dy = (y + 0.5) / S * 2 - 1;
        const d = Math.min(1, Math.hypot(dx, dy));
        const a = Math.pow(1 - d, power);
        const o = (y * S + x) * 4;
        img.data[o] = rgb[0]; img.data[o + 1] = rgb[1]; img.data[o + 2] = rgb[2]; img.data[o + 3] = a * 255;
    }
    ctx.putImageData(img, 0, 0);
    return new Texture(c, { wrap: 'clamp', mipmaps: true });
}

// ======================================================================
// MATERIALS
// ======================================================================
// Shared materials, created once after the procedural textures exist.

function makeMaterials(T) {
    const M = {};
    const W = { toon: true, toonPL: 1.0, toonSpec: 0.0, rimStrength: 0.12, toonAmb: [1.25, 0.02] };
    M.wall = new LitMaterial(Object.assign({ map: T.wall.map, toonKey: 1.7, macro: true }, W));
    M.ledge = new LitMaterial(Object.assign({ map: T.slab.map, toonKey: 2.1 }, W));
    M.crumble = new LitMaterial(Object.assign({ map: T.cracked, toonKey: 2.1, color: hexColor(0xffc0a0), emissive: [0.08, 0.02, 0.0] }, W));
    M.ground = new LitMaterial(Object.assign({ map: T.ground.map, toonKey: 1.8, macro: true }, W));
    M.trim = new LitMaterial(Object.assign({ map: T.slab.map, toonKey: 2.0, color: [0.86, 0.82, 0.84] }, W));
    M.darkStone = new LitMaterial(Object.assign({ map: T.wall.map, toonKey: 1.4, color: [0.55, 0.5, 0.55], macro: true }, W));
    M.wood = new LitMaterial(Object.assign({ map: T.wood.map, toonKey: 2.0 }, W));
    M.iron = new LitMaterial(Object.assign({ color: hexColor(0x3c3a48), toonKey: 2.2 }, W, { toonSpec: 0.35 }));
    M.rust = new LitMaterial(Object.assign({ color: hexColor(0x6a4432), toonKey: 2.0 }, W));
    M.gold = new LitMaterial(Object.assign({ color: hexColor(0xffcf4a), toonKey: 3.0, emissive: [0.22, 0.14, 0.02] }, W, { toonSpec: 0.9, rimStrength: 0.5, toonPL: 0.8 }));
    M.slate = new LitMaterial(Object.assign({ color: hexColor(0x2a2638), toonKey: 1.8 }, W));
    M.banner = new LitMaterial({ map: T.banner, side: 'double', wave: 0.12, alphaTest: true, toon: true, toonKey: 2.0, toonPL: 0.9, toonSpec: 0, rimStrength: 0.1, toonAmb: [1.25, 0.02] });
    M.voidDark = new BasicMaterial({ color: [0.012, 0.006, 0.006] });
    M.bone = new LitMaterial({ color: hexColor(0xe8dcc0), toon: true, toonKey: 2.4, toonPL: 0.8, toonSpec: 0.3, toonAmb: [1.25, 0.02] });
    M.candle = new LitMaterial({ color: hexColor(0xe8d8b0), toon: true, toonKey: 2.4, toonPL: 0.8, emissive: [0.25, 0.16, 0.06], toonAmb: [1.25, 0.02] });
    M.windowGlow = new BasicMaterial({ color: [1.0, 0.55, 0.2] });
    M.shadow = new BasicMaterial({ map: T.shadow, transparent: true, opacity: 0.55, depthWrite: false, fog: true });
    M.decal = new BasicMaterial({ map: T.fade, transparent: true, opacity: 0.62, depthWrite: false, renderOrder: -2 });
    M.glow = new BasicMaterial({ map: T.glow, transparent: true, blending: 'additive', depthWrite: false, color: [1, 0.55, 0.18], renderOrder: 5 });
    // Halloween: cobwebs, gravestones, the brew in the cauldron, the ghosts that drift round the tower
    M.web = new BasicMaterial({ map: T.web, transparent: true, depthWrite: false, side: 'double', color: [0.86, 0.82, 0.95], opacity: 0.55, renderOrder: 3 });
    M.tomb = new LitMaterial(Object.assign({ map: T.slab.map, toonKey: 1.7, color: [0.42, 0.42, 0.5] }, W));
    M.brew = new BasicMaterial({ color: [0.45, 1.0, 0.25] });
    M.ghost = new BasicMaterial({ color: [0.86, 0.9, 1.0], transparent: true, opacity: 0.5, depthWrite: false, renderOrder: 4 });
    M.ghostEye = new BasicMaterial({ color: [0.04, 0.02, 0.08], transparent: true, opacity: 0.85, depthWrite: false, renderOrder: 5 });
    return M;
}

// Camera-facing flame shader, instanced (per-instance position/scale from iMatrix, phase from iColor.r)
// witch = 1: the Halloween tower's green witch-fire (torches and candles); 0: ordinary fire
function makeFlameMaterial(witch = 0) {
    return new ShaderMaterial({
        key: 'flame',
        transparent: true, blending: 'additive', depthWrite: false, side: 'double', renderOrder: 6,
        vertex: `
out vec2 vUv; out float vPhase; out float vDepth;
void main(){
  mat4 m = uModel;
  #ifdef INSTANCED
  m = uModel * iMatrix; vPhase = iColor.r;
  #else
  vPhase = 0.0;
  #endif
  float s = length(m[0].xyz);
  vec4 c = uView * vec4(m[3].xyz, 1.0);
  c.xy += position.xy * s;
  vUv = uv; vDepth = -c.z;
  gl_Position = uProj * c;
}`,
        fragment: `
in vec2 vUv; in float vPhase; in float vDepth;
uniform float uIntensity; uniform float uWitch;
void main(){
  vec2 p = vUv * 2.0 - 1.0;
  float t = uTime * 2.4 + vPhase * 10.0;
  float n = fbm(vec2(p.x * 2.4, p.y * 1.6 - t)) ;
  float w = 0.55 - (p.y + 1.0) * 0.24;
  float shape = w - abs(p.x + (n - 0.5) * 0.45 * (p.y + 1.0) * 0.6);
  shape += (n - 0.5) * 0.35;
  float body = smoothstep(0.0, 0.25, shape) * smoothstep(1.0, 0.1, p.y + n*0.4);
  float core = smoothstep(0.18, 0.45, shape) * smoothstep(0.4, -0.6, p.y);
  vec3 col = mix(mix(vec3(1.0, 0.25, 0.03), vec3(0.1, 0.75, 0.2), uWitch), mix(vec3(1.0, 0.62, 0.18), vec3(0.45, 1.0, 0.25), uWitch), body);
  col = mix(col, mix(vec3(1.0, 0.95, 0.75), vec3(0.9, 1.0, 0.7), uWitch), core);
  float a = body * (0.85 + 0.15 * sin(t * 3.0));
  float fd = uFogDensity * vDepth; float fog = 1.0 - exp(-fd*fd);
  fragColor = vec4(col * a * uIntensity * (1.0 - fog*0.8), 1.0);
}`,
        uniforms: { uIntensity: 1.3, uWitch: witch }
    });
}

// Instanced additive billboard (glows, sparkles)
function makeBillboardMaterial(tex, color, key) {
    return new ShaderMaterial({
        key: key || 'billboard',
        transparent: true, blending: 'additive', depthWrite: false, side: 'double', renderOrder: 5,
        vertex: `
out vec2 vUv; out vec3 vCol; out float vDepth;
void main(){
  mat4 m = uModel;
  vCol = vec3(1.0);
  #ifdef INSTANCED
  m = uModel * iMatrix; vCol = iColor;
  #endif
  float s = length(m[0].xyz);
  vec4 c = uView * vec4(m[3].xyz, 1.0);
  c.xy += position.xy * s;
  vUv = uv; vDepth = -c.z;
  gl_Position = uProj * c;
}`,
        fragment: `
in vec2 vUv; in vec3 vCol; in float vDepth;
uniform sampler2D uTex; uniform vec3 uColor; uniform float uStrength;
void main(){
  float a = texture(uTex, vUv).a;
  float fd = uFogDensity * vDepth; float fog = 1.0 - exp(-fd*fd);
  fragColor = vec4(uColor * vCol * a * uStrength * (1.0 - fog*0.7), 1.0);
}`,
        uniforms: { uTex: tex, uColor: color || [1, 0.55, 0.2], uStrength: 1.0 }
    });
}

// ======================================================================
// FX
// ======================================================================
// Particle effects: additive sparks/fire/magic, soft smoke/dust, and tumbling debris chunks.

const PRESETS = {
    spark: { add: true, n: 1, speed: [3, 7], up: 2, grav: -12, life: [0.3, 0.7], size: [0.08, 0.02], col: [1, 0.7, 0.25], col2: [1, 0.25, 0.05], drag: 1.5 },
    fire: { add: true, speed: [0.5, 2], up: 2.5, grav: 3, life: [0.35, 0.8], size: [0.35, 0.05], col: [1, 0.75, 0.3], col2: [0.9, 0.18, 0.02], drag: 2 },
    gold: { add: true, speed: [1.5, 4], up: 3, grav: -6, life: [0.5, 1.0], size: [0.12, 0.02], col: [1, 0.78, 0.32], col2: [1, 0.38, 0.05], drag: 1.2 },
    magic: { add: true, speed: [1, 3], up: 1.5, grav: 0.5, life: [0.6, 1.2], size: [0.14, 0.02], col: [0.5, 0.95, 1], col2: [0.2, 0.4, 1], drag: 1.5 },
    heal: { add: true, speed: [1, 2.5], up: 2, grav: 1, life: [0.6, 1.1], size: [0.14, 0.02], col: [1, 0.5, 0.6], col2: [1, 0.2, 0.3], drag: 1.5 },
    soul: { add: true, speed: [0.3, 1.2], up: 1.5, grav: 1.5, life: [0.6, 1.2], size: [0.2, 0.04], col: [0.6, 1, 0.8], col2: [0.1, 0.4, 0.3], drag: 1 },
    dust: { add: false, speed: [0.5, 2], up: 0.6, grav: 0.5, life: [0.5, 1.0], size: [0.18, 0.5], col: [0.45, 0.4, 0.36], col2: [0.3, 0.27, 0.25], alpha: 0.45, drag: 3 },
    smoke: { add: false, speed: [0.3, 1.2], up: 1.4, grav: 1, life: [0.8, 1.6], size: [0.3, 0.9], col: [0.18, 0.15, 0.14], col2: [0.1, 0.09, 0.09], alpha: 0.55, drag: 1.5 },
    puff: { add: false, speed: [1, 2.5], up: 0.8, grav: 0, life: [0.35, 0.7], size: [0.2, 0.55], col: [0.35, 0.3, 0.35], col2: [0.15, 0.12, 0.15], alpha: 0.6, drag: 4 },
};

class Pool {
    constructor(max, additive) {
        this.max = max;
        this.p = [];
        const m = new Material('points', { transparent: true, blending: additive ? 'additive' : 'normal', depthWrite: false });
        m.fogScale = 0.7;
        this.points = new Points(max, m);
        this.points.renderOrder = additive ? 8 : 7;
    }
    spawn(o) {
        if (this.p.length >= this.max) this.p.shift();
        this.p.push(o);
    }
    update(dt) {
        const pts = this.points, arr = this.p;
        let n = 0;
        for (let i = arr.length - 1; i >= 0; i--) {
            const q = arr[i];
            q.t += dt;
            if (q.t >= q.life) { arr[i] = arr[arr.length - 1]; arr.pop(); continue; }
        }
        for (let i = 0; i < arr.length; i++) {
            const q = arr[i];
            const k = Math.exp(-q.drag * dt);
            q.vx *= k; q.vz *= k; q.vy = q.vy * k + q.grav * dt;
            q.x += q.vx * dt; q.y += q.vy * dt; q.z += q.vz * dt;
            const u = q.t / q.life;
            pts.positions[n * 3] = q.x; pts.positions[n * 3 + 1] = q.y; pts.positions[n * 3 + 2] = q.z;
            pts.sizes[n] = q.s0 + (q.s1 - q.s0) * u;
            const c = q.c0, c2 = q.c1;
            pts.colors[n * 4] = c[0] + (c2[0] - c[0]) * u;
            pts.colors[n * 4 + 1] = c[1] + (c2[1] - c[1]) * u;
            pts.colors[n * 4 + 2] = c[2] + (c2[2] - c[2]) * u;
            const fadeIn = Math.min(1, q.t / 0.06);
            pts.colors[n * 4 + 3] = q.a * fadeIn * (1 - u * u);
            n++;
        }
        pts.count = n;
        pts.needsUpdate = true;
    }
}

class FX {
    constructor(root) {
        this.add = new Pool(700, true);
        this.norm = new Pool(260, false);
        root.add(this.add.points, this.norm.points);
        // debris chunks
        this.maxDebris = 90;
        this.debris = new InstancedMesh(box(1, 1, 1), new LitMaterial({ color: [1, 1, 1], roughness: 0.85 }), this.maxDebris);
        this.debris.count = 0;
        root.add(this.debris);
        this.chunks = [];
        this._v = new Vec3(); this._r = new Vec3(); this._s = new Vec3();
    }

    burst(type, pos, count, opts = {}) {
        const P = PRESETS[type];
        const pool = P.add ? this.add : this.norm;
        const sp = opts.speed || 1;
        for (let i = 0; i < count; i++) {
            const a = Math.random() * Math.PI * 2, b = Math.acos(Math.random() * 2 - 1);
            const s = (P.speed[0] + Math.random() * (P.speed[1] - P.speed[0])) * sp;
            const dx = Math.sin(b) * Math.cos(a), dy = Math.cos(b), dz = Math.sin(b) * Math.sin(a);
            const r = opts.radius || 0.1;
            pool.spawn({
                x: pos.x + dx * r, y: pos.y + dy * r, z: pos.z + dz * r,
                vx: dx * s + (opts.vx || 0), vy: dy * s + P.up * (0.5 + Math.random() * 0.5) + (opts.vy || 0), vz: dz * s + (opts.vz || 0),
                grav: P.grav, drag: P.drag, t: 0,
                life: P.life[0] + Math.random() * (P.life[1] - P.life[0]),
                s0: P.size[0] * (opts.size || 1) * (0.7 + Math.random() * 0.6), s1: P.size[1] * (opts.size || 1),
                c0: opts.col || P.col, c1: opts.col2 || P.col2, a: (P.alpha || 1) * (opts.alpha || 1)
            });
        }
    }

    // a single particle with explicit velocity (for trails)
    emit(type, x, y, z, vx, vy, vz, sizeMul = 1) {
        const P = PRESETS[type];
        const pool = P.add ? this.add : this.norm;
        pool.spawn({
            x, y, z, vx, vy, vz, grav: P.grav, drag: P.drag, t: 0,
            life: P.life[0] + Math.random() * (P.life[1] - P.life[0]),
            s0: P.size[0] * sizeMul * (0.8 + Math.random() * 0.4), s1: P.size[1] * sizeMul,
            c0: P.col, c1: P.col2, a: P.alpha || 1
        });
    }

    chunk(pos, count, color, size = 0.12, speed = 4) {
        for (let i = 0; i < count; i++) {
            if (this.chunks.length >= this.maxDebris) this.chunks.shift();
            const a = Math.random() * Math.PI * 2;
            this.chunks.push({
                x: pos.x, y: pos.y, z: pos.z,
                vx: Math.cos(a) * speed * (0.3 + Math.random() * 0.7), vy: 2 + Math.random() * speed, vz: Math.sin(a) * speed * (0.3 + Math.random() * 0.7),
                rx: Math.random() * 6, ry: Math.random() * 6, rz: 0, sx: (Math.random() - 0.5) * 14, sy: (Math.random() - 0.5) * 14,
                s: size * (0.5 + Math.random() * 0.8), t: 0, life: 1.4 + Math.random() * 0.6, col: color,
                elong: Math.random() < 0.5 ? 2.5 : 1
            });
        }
    }

    update(dt) {
        this.add.update(dt);
        this.norm.update(dt);
        const ch = this.chunks;
        let n = 0;
        for (let i = ch.length - 1; i >= 0; i--) {
            const c = ch[i];
            c.t += dt;
            if (c.t > c.life) { ch.splice(i, 1); continue; }
        }
        for (const c of ch) {
            c.vy -= 22 * dt;
            c.x += c.vx * dt; c.y += c.vy * dt; c.z += c.vz * dt;
            c.rx += c.sx * dt; c.ry += c.sy * dt;
            const fade = Math.min(1, (c.life - c.t) * 3);
            this._v.set(c.x, c.y, c.z);
            this._r.set(c.rx, c.ry, 0);
            this._s.set(c.s * fade, c.s * fade * (c.elong > 1 ? 0.5 : 1), c.s * fade * c.elong);
            this.debris.setAt(n, this._v, this._r, this._s, c.col);
            n++;
        }
        this.debris.count = n;
    }
}
return { makeTextures, makeMaterials, makeFlameMaterial, makeBillboardMaterial, FX };
})(__engine);


// ======================================================================
//  tower.js
// ======================================================================
const __tower = (({ CONFIG }, { Vec3, angleDiff, makeRng, wrapAngle, Node, Mesh, InstancedMesh, BasicMaterial, GeoBuilder, box, cylinder, merge, extrude, plane, lathe, sphere, torus, clamp, TAU, Points, Material, ShaderMaterial, LitMaterial, deform, recomputeNormals }, { makeFlameMaterial, makeBillboardMaterial }) => {
// The tower: shared ring helpers, random level generator, tower meshes and ledge mechanics, sky/lava/ruins world.



// ======================================================================
// COMMON
// ======================================================================
// Shared helpers for positioning things around the cylindrical tower.

const R = CONFIG.TOWER_RADIUS;
const RP = CONFIG.PATH_RADIUS;            // the tower's walking radius (level generator)
// Radius of the walking path for the current stage. The tower uses CONFIG.PATH_RADIUS,
// the guardian's hall a wider ring. Always read PATH.r at use time.
const PATH = { r: CONFIG.PATH_RADIUS };
function setPathRadius(r) { PATH.r = r; }
const DEPTH = CONFIG.LEDGE_DEPTH;

function polar(theta, r, y, out = new Vec3()) {
    return out.set(Math.sin(theta) * r, y, Math.cos(theta) * r);
}

// Place a node on the tower facing outward (local +Z = outward normal)
function placeOutward(node, theta, r, y) {
    node.position.set(Math.sin(theta) * r, y, Math.cos(theta) * r);
    node.rotation.y = theta;
}

// arc distance between two angles measured on the walking path
function arcDist(a, b) { return angleDiff(a, b) * PATH.r; }

// does an entity (theta, halfW in arc units) overlap a platform's angular range?
function overPlatform(theta, halfArc, p) {
    return Math.abs(angleDiff(theta, p.theta)) <= p.half + halfArc / PATH.r;
}

function rgb(hex) {
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
function levelParams(level) {
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

function generateLevel(level, seed) {
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
function ledgeGeometry(half, thick, depth, opts = {}) {
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

class Tower {
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
        // (Halloween: the torches and candles burn with green witch-fire)
        this.flames = new InstancedMesh(plane(1, 1), makeFlameMaterial(1), nFl + 1);
        this.glows = new InstancedMesh(plane(1, 1), makeBillboardMaterial(T.glow, [0.32, 1.0, 0.3], 'glowbb'), nFl + 4);
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
        this._buildHalloween(T);
    }

    // Halloween dressing (its own random stream: the level layout is untouched)
    _buildHalloween(T) {
        const M = this.M, hr = makeRng((this.desc.seed || 1) * 7 + 31337);
        // cobwebs under the ledges: anchored in the corner at one end, spreading along the underside and down the wall
        const webs = new GeoBuilder();
        const web = (th0, dir, yTop, size) => {
            const n = 6, rr = R + 0.035, dth = size / rr;
            const base = webs.vcount;
            for (let i = 0; i <= n; i++) {
                const th = th0 + dir * dth * (i / n), s = Math.sin(th), c = Math.cos(th);
                webs.vert(s * rr, yTop, c * rr, s, 0, c, i / n, 0);
                webs.vert(s * rr, yTop - size, c * rr, s, 0, c, i / n, 1);
            }
            for (let i = 0; i < n; i++) webs.quad(base + i * 2, base + i * 2 + 1, base + i * 2 + 3, base + i * 2 + 2);
        };
        for (const p of this.platforms) {
            if (p.type === 'ground' || p.type === 'lift' || p.type === 'crumble' || p.type === 'top') continue;
            if (!hr.chance(0.55)) continue;
            const side = hr.chance(0.5) ? -1 : 1, size = hr.range(0.75, 1.2);
            web(p.theta + side * (p.half - 0.02), -side, p.y - p.thick - 0.02, size);
        }
        if (webs.vcount) { const m = new Mesh(webs.build(), M.web); m.frustumCulled = false; this.root.add(m); }
        // the graveyard round the foot of the tower: headstones and crosses on the outer rim of the base
        const stones = [], crosses = [];
        for (let i = 0; i < 16; i++) {
            const th = (i / 16) * TAU + hr.range(-0.12, 0.12);
            const r = R + hr.range(2.62, 2.86), tilt = hr.range(-0.18, 0.18);
            if (hr.chance(0.3)) {
                crosses.push({ geo: box(0.07, 0.44, 0.06), pos: polar(th, r, 0.22), rot: V(0, th, tilt) });
                crosses.push({ geo: box(0.27, 0.065, 0.06), pos: polar(th, r, 0.31), rot: V(0, th, tilt) });
            } else {
                const w = hr.range(0.28, 0.4), h = hr.range(0.34, 0.5);
                const pts = [[-w / 2, 0], [w / 2, 0], [w / 2, h - w / 2]];
                for (let k = 1; k < 8; k++) { const a = (k / 8) * Math.PI; pts.push([Math.cos(a) * w / 2, h - w / 2 + Math.sin(a) * w / 2]); }
                pts.push([-w / 2, h - w / 2]);
                stones.push({ geo: extrude(pts, 0.12, 0.03), pos: polar(th, r, -0.02), rot: V(hr.range(-0.12, 0.08), th, tilt) });
            }
        }
        const gs = new Mesh(merge(stones.concat(crosses)), M.tomb);
        this.root.add(gs);
        // a witch's cauldron bubbling green beside the start, and its light
        const cth = 1.25, cpos = polar(cth, R + 2.2, 0);
        const pot = new Mesh(merge([
            { geo: lathe([[0.0, 0.05], [0.42, 0.08], [0.55, 0.3], [0.52, 0.56], [0.44, 0.66], [0.47, 0.7], [0.4, 0.7]], 20), pos: V(cpos.x, 0, cpos.z) },
            { geo: torus(0.43, 0.035, 5, 20), pos: V(cpos.x, 0.69, cpos.z), rot: V(Math.PI / 2, 0, 0) }
        ]), M.iron);
        this.root.add(pot);
        const brew = new Mesh(cylinder(0.4, 0.4, 0.02, 20, 1), M.brew);
        brew.position.set(cpos.x, 0.62, cpos.z);
        this.root.add(brew);
        this.cauldron = { pos: new Vec3(cpos.x, 0.95, cpos.z), light: { pos: new Vec3(cpos.x, 1.2, cpos.z), color: [0.9, 3.0, 0.6], range: 6 } };
        this.flames.setAt(this.flames.count, new Vec3(cpos.x, 0.82, cpos.z), V(), V(0.5, 0.5, 0.5), [0.3, 0, 0]);
        this.flames.count++;
        this.glows.setAt(this.glows.count, new Vec3(cpos.x, 0.85, cpos.z), V(), V(2.2, 2.2, 2.2), [1, 1, 1]);
        this.glows.count++;
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
  // Halloween night: violet horizon (lit by the lava), deep purple, near black overhead
  vec3 horizon = vec3(0.42, 0.11, 0.26);
  vec3 mid = vec3(0.11, 0.035, 0.17);
  vec3 zenith = vec3(0.018, 0.008, 0.045);
  vec3 col = mix(horizon, mid, smoothstep(-0.02, 0.22, h));
  col = mix(col, zenith, smoothstep(0.18, 0.72, h));
  col = mix(col, vec3(0.45, 0.1, 0.05), smoothstep(0.0, -0.25, h));
  // stars
  vec2 sg = vec2(atan(d.z, d.x) * 120.0, h * 140.0);
  vec2 cell = floor(sg);
  float star = step(0.985, hash12(cell)) * smoothstep(0.08, 0.35, h);
  float tw = 0.55 + 0.45 * sin(uTime * (1.5 + hash12(cell + 7.0) * 3.0) + hash12(cell) * 40.0);
  vec2 f = fract(sg) - 0.5;
  col += vec3(1.0, 0.95, 0.85) * star * tw * smoothstep(0.32, 0.0, length(f)) * 0.9;
  // the full moon: a big pale disc, craters, a warm halo and a purple glow around it
  vec3 md3 = normalize(uMoonDir);
  float ang = acos(clamp(dot(d, md3), -1.0, 1.0));
  float R0 = 0.15;
  vec3 mside = normalize(cross(md3, vec3(0.0, 1.0, 0.0)));
  vec3 mup = cross(mside, md3);
  vec2 mp = vec2(dot(d - md3, mside), dot(d - md3, mup)) / R0;
  float crater = smoothstep(0.6, 0.66, vnoise(mp * 3.0 + 4.0)) * 0.22 + smoothstep(0.68, 0.74, vnoise(mp * 7.0 + 1.3)) * 0.14;
  vec3 moonCol = mix(vec3(1.0, 0.97, 0.84), vec3(1.0, 0.78, 0.5), smoothstep(-0.7, 1.0, -mp.y * 0.6 + mp.x * 0.5)) * (1.0 - crater);
  col += vec3(0.95, 0.55, 0.3) * pow(max(0.0, 1.0 - ang / 0.45), 3.0) * 0.55;
  col += vec3(0.42, 0.16, 0.6) * pow(max(0.0, 1.0 - ang / 1.1), 2.2) * 0.35;
  col = mix(col, moonCol * 1.15, smoothstep(R0, R0 - 0.004, ang));
  // cartoon clouds: flat dark purple shapes, a silver-lilac rim where the moon catches them
  vec2 uv = d.xz / (max(h, 0.0) + 0.22);
  float t = uTime;
  float c1 = fbm(uv * 0.75 + vec2(t * 0.012, t * 0.005));
  float c2 = fbm(uv * 1.6 - vec2(t * 0.018, -t * 0.008) + 3.0);
  float cv = c1 * 0.7 + c2 * 0.35;
  float body = smoothstep(0.545, 0.56, cv);
  float rim = smoothstep(0.5, 0.515, cv) - body;
  float vis = smoothstep(-0.03, 0.08, h);
  float lowLit = smoothstep(0.5, 0.0, h);
  float moonLit = pow(max(0.0, 1.0 - ang / 0.9), 2.0);
  vec3 cloudCol = mix(vec3(0.04, 0.015, 0.07), vec3(0.16, 0.05, 0.14), lowLit * 0.6);
  col = mix(col, cloudCol, body * vis);
  col += mix(vec3(0.75, 0.25, 0.25), vec3(0.85, 0.8, 1.0), clamp(moonLit * 2.0, 0.0, 1.0)) * rim * vis * (0.3 + lowLit * 0.7 + moonLit * 1.4);
  col += uFlash * vec3(0.62, 0.5, 0.95) * (0.2 + body * 1.2 + rim) * smoothstep(-0.1, 0.3, h);
  fragColor = vec4(col, 1.0);
}`,
        uniforms: { uFlash: 0, uMoonDir: [-0.5, 0.36, -0.79] }
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
  vec3 col = vec3(0.06, 0.028, 0.085) * (0.8 + step(0.5, rock) * 0.3);
  col += vec3(0.26, 0.06, 0.12) * step(0.1, -N.y + 0.2) * 0.5;
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

class World {
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
        this._buildGhosts(M);
        this.lavaLight = { pos: new Vec3(), color: [0, 0, 0], range: 26 };
    }

    // Halloween: sheet ghosts drifting round behind the tower (never between you and the knight)
    _buildGhosts(M) {
        const g = lathe([[0.0, 1.0], [0.16, 0.985], [0.3, 0.92], [0.4, 0.78], [0.44, 0.55], [0.47, 0.3], [0.52, 0.08], [0.6, 0.0]], 20);
        deform(g, (v) => { if (v.y < 0.12) { const a = Math.atan2(v.x, v.z); v.y += 0.07 * Math.sin(a * 7) * (1 - v.y / 0.12); } });
        recomputeNormals(g);
        const eye = sphere(1, 10, 8);
        this.ghosts = [];
        for (let i = 0; i < 3; i++) {
            const n = new Node();
            n.add(new Mesh(g, M.ghost));
            for (const s of [-1, 1]) { const e = new Mesh(eye, M.ghostEye); e.position.set(s * 0.13, 0.68, 0.36); e.scale.set(0.06, 0.1, 0.04); n.add(e); }
            const mo = new Mesh(eye, M.ghostEye); mo.position.set(0, 0.46, 0.4); mo.scale.set(0.07, 0.09, 0.04); n.add(mo);
            n.scale.set(1.5, 1.5, 1.5);
            this.root.add(n);
            this.ghosts.push({ n, ph: i * 2.1 + 0.5, r: 9.5 + i * 1.8, dy: [3.5, -2.5, 6][i], sp: 0.08 + i * 0.03 });
        }
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
        // the ghosts: behind the tower as seen from the camera, swaying, bobbing, turned to look at you
        if (this.ghosts) {
            const camA = Math.atan2(cam.x, cam.z);
            for (const G of this.ghosts) {
                const a = camA + Math.PI + Math.sin(t * G.sp + G.ph) * 1.25;
                const y = focusY + G.dy + Math.sin(t * 0.9 + G.ph * 3) * 0.6;
                G.n.position.set(Math.sin(a) * G.r, y, Math.cos(a) * G.r);
                G.n.rotation.set(Math.sin(t * 1.3 + G.ph) * 0.08, Math.atan2(cam.x - G.n.position.x, cam.z - G.n.position.z), Math.sin(t * 1.1 + G.ph) * 0.12);
            }
        }
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
        // (Halloween: the full moon hangs over the tower's shoulder wherever you are on it)
        const ma = Math.atan2(cam.x, cam.z) + Math.PI + 0.36 + Math.sin(t * 0.05) * 0.05, me = 0.3;
        this.sky.material.uniforms.uMoonDir = [Math.sin(ma) * Math.cos(me), Math.sin(me), Math.cos(ma) * Math.cos(me)];

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
            if (i % 4 === 0) { e.colors[i * 4] = 0.45; e.colors[i * 4 + 1] = 1; e.colors[i * 4 + 2] = 0.35; }
            else { e.colors[i * 4] = 1; e.colors[i * 4 + 1] = 0.45 + 0.3 * fl; e.colors[i * 4 + 2] = 0.1; }
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
            // (Halloween: autumn leaves, see-sawing down)
            const sw = Math.sin(t * 1.1 + d.ph) * 1.2;
            a.positions[i * 3] = Math.sin(d.a) * d.r + sw;
            a.positions[i * 3 + 1] = d.y + Math.abs(Math.sin(t * 2.2 + d.ph)) * 0.25;
            a.positions[i * 3 + 2] = Math.cos(d.a) * d.r - sw;
            a.sizes[i] = 0.07 + 0.04 * d.s;
            const LEAF = [[1, 0.5, 0.12], [0.72, 0.2, 0.07], [1, 0.74, 0.2], [0.48, 0.24, 0.1]][i % 4];
            a.colors[i * 4] = LEAF[0]; a.colors[i * 4 + 1] = LEAF[1]; a.colors[i * 4 + 2] = LEAF[2]; a.colors[i * 4 + 3] = 0.85;
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
            t.light.color = [0.75 * f, 2.7 * f, 1.25 * f];   // (green witch-fire)
            pts.push(t.light);
        }
        env.points = pts;
    }
}
return { R, RP, PATH, setPathRadius, DEPTH, polar, placeOutward, arcDist, overPlatform, rgb, levelParams, generateLevel, ledgeGeometry, Tower, World };
})(__config, __engine, __graphics);


// ======================================================================
//  hero.js
// ======================================================================
const __hero = (({ CONFIG }, { Node, Mesh, LitMaterial, BasicMaterial, Texture, Geometry, box, cylinder, sphere, lathe, extrude, torus, plane, recomputeNormals, Vec3, damp, clamp, lerp, hexColor, toonify, makeToonMaterials, angleDiff, wrapAngle }, { PATH }) => {
// The knight: cartoon model with animations, sword trail, and the controller (physics, sword, damage, tunnels).



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
// Halloween edition: the knight wears a red flannel shirt (the same red check as the kid in How You Haunt Me) under
// his armour, a pumpkin for a shield and a purple cape
const PUMPKIN = 0xff7a1a, PUMPKIN_D = 0xc8480c, STEM = 0x3d7a1f, CARVE = 0x2a0a04, BUTTON = 0xf0e2c0, CAPE = 0x4b1d78;
let FLANNEL = null;
function flannelMaterial() {
    if (FLANNEL) return FLANNEL;
    const S = 128, c = document.createElement('canvas');
    c.width = c.height = S;
    const g = c.getContext('2d');
    g.fillStyle = '#c4261d'; g.fillRect(0, 0, S, S);
    // dark bands both ways (multiplied, so the crossings go black), a narrow pair, then the cream threads
    g.globalCompositeOperation = 'multiply';
    for (const [p, w, col] of [[10, 34, '#4a1214'], [64, 10, '#6a1a1a'], [86, 10, '#6a1a1a']]) {
        g.fillStyle = col; g.fillRect(p, 0, w, S); g.fillRect(0, p, S, w);
    }
    g.globalCompositeOperation = 'source-over';
    g.fillStyle = 'rgba(240,214,160,0.9)';
    for (let k = 0; k < S; k += 6) { g.fillRect(112, k, 3, 3); g.fillRect(k, 112, 3, 3); }
    // twill grain
    g.globalAlpha = 0.12; g.fillStyle = '#000';
    for (let k = -S; k < S; k += 4) { g.beginPath(); g.moveTo(k, 0); g.lineTo(k + S, S); g.lineTo(k + S + 1.5, S); g.lineTo(k + 1.5, 0); g.fill(); }
    g.globalAlpha = 1;
    FLANNEL = new LitMaterial({ toon: true, map: new Texture(c, { wrap: 'repeat' }), uvScale: [3, 2], rimStrength: 0.55, toonKey: 3.4, toonSpec: 0.25 });
    return FLANNEL;
}
// toonify() leaves textured meshes alone: give the flannel parts their ink outline by hand
function outlineTextured(root, outlineMat) {
    const list = [];
    root.traverse((n) => { if (n instanceof Mesh && n.material === FLANNEL) list.push(n); });
    for (const m of list) {
        const o = new Mesh(m.geometry, outlineMat);
        o.position.copy(m.position); o.rotation.copy(m.rotation); o.scale.copy(m.scale);
        m.parent.add(o);
    }
}

class KnightModel {
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
        // the flannel shirt tails hang out over the belt, front and back
        const FL = flannelMaterial();
        hips.add(mesh(box(0.27, 0.17, 0.045), FL, 0, -0.1, 0.215, -0.12));
        hips.add(mesh(box(0.27, 0.15, 0.045), FL, 0, -0.09, -0.215, 0.12));

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
        // the red flannel shirt: buttons down the front, a collar at the neck
        torso.add(mesh(sphere(1, 20, 14), FL, 0, 0.2, 0, 0, 0, 0, 0.258, 0.238, 0.218));
        for (let k = 0; k < 3; k++) torso.add(mesh(sphere(0.019, 8, 6), BUTTON, 0, 0.29 - k * 0.075, 0.214 - Math.abs(k - 1) * 0.004, 0, 0, 0, 1, 1, 0.55));
        torso.add(mesh(extrude([[0, 0], [0.02, -0.075], [0.085, -0.02]], 0.02, 0.006), 0x8e1a14, 0.012, 0.405, 0.12, -0.55, 0.5, 0));
        torso.add(mesh(extrude([[0, 0], [-0.085, -0.02], [-0.02, -0.075]], 0.02, 0.006), 0x8e1a14, -0.012, 0.405, 0.12, -0.55, -0.5, 0));
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
            sh.add(mesh(cylinder(0.058, 0.052, 0.13, 10, 1), FL, 0, -0.09, 0));
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
        // a jack-o'-lantern for a shield: a ribbed pumpkin face, a stem on top, carved eyes and grin
        shield.add(mesh(cylinder(0.2, 0.2, 0.05, 26, 1), PUMPKIN, 0, 0, 0, Math.PI / 2, 0, 0));
        shield.add(mesh(torus(0.2, 0.028, 6, 28), PUMPKIN_D));
        for (const a of [-0.55, 0, 0.55]) shield.add(mesh(box(0.016, 0.33, 0.012), PUMPKIN_D, Math.sin(a) * 0.13, 0, 0.026, 0, 0, a * 0.25, 1, Math.cos(a), 1));
        shield.add(mesh(cylinder(0.022, 0.03, 0.08, 6, 1), STEM, 0, 0.22, 0, 0, 0, -0.25));
        for (const s of [-1, 1]) shield.add(mesh(extrude([[-0.045, -0.025], [0.045, -0.025], [0, 0.045]], 0.012), CARVE, s * 0.075, 0.045, 0.028));
        shield.add(mesh(extrude([[-0.12, 0.0], [-0.07, -0.085], [0, -0.1], [0.07, -0.085], [0.12, 0.0], [0.075, 0.01], [0.045, -0.025], [0.015, 0.008], [-0.015, -0.025], [-0.045, 0.012], [-0.07, -0.02]], 0.012), CARVE, 0, -0.035, 0.028));
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
        outlineTextured(root, this.toon.outline);
        const capeMat = new LitMaterial({ toon: true, color: hexColor(CAPE), side: 'double', rimStrength: 0.5, toonKey: 3.2, toonSpec: 0.15 });
        const capeMesh = new Mesh(cg, capeMat);
        capeMesh.frustumCulled = false;
        this.capeNode.add(capeMesh);
        this.materials = [this.toon.toon, this.toon.toonDouble, capeMat, flannelMaterial()];

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
class SwordTrail {
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

class Player {
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
return { KnightModel, SwordTrail, Player };
})(__config, __engine, __tower);


// ======================================================================
//  enemies.js
// ======================================================================
const __enemies = (({ Node, Mesh, LitMaterial, BasicMaterial, InstancedMesh, box, cylinder, sphere, torus, merge, lathe, GeoBuilder, plane, extrude, Vec3, angleDiff, wrapAngle, clamp, damp, lerp, TAU, hexColor, toonify, makeToonMaterials, deform, recomputeNormals }, { makeBillboardMaterial }, { PATH, R, polar }) => {
// Enemies (skeleton, rat, bat, spider, dragon, fireballs) and collectibles (coins, key, chests, hourglass, hearts).



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

// (Halloween edition: black rats and spiders with an orange mark, a purple nightmare dragon with a pumpkin belly)
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
        fur: new LitMaterial({ color: hexColor(0x3a3440), roughness: 0.95, envStrength: 0.15, rimStrength: 0.35 }),
        pink: new LitMaterial({ color: hexColor(0xf29a9a), roughness: 0.7, envStrength: 0.2 }),
        batSkin: new LitMaterial({ color: hexColor(0x5a4660), roughness: 0.85, envStrength: 0.2, rimStrength: 0.45 }),
        membrane: new LitMaterial({ color: hexColor(0x7a3a5a), roughness: 0.8, side: 'double', envStrength: 0.2, rimStrength: 0.35 }),
        spider: new LitMaterial({ color: hexColor(0x221a2c), roughness: 0.35, metalness: 0.2, envStrength: 0.9, rimStrength: 0.4 }),
        spiderLeg: new LitMaterial({ color: hexColor(0x1a1222), roughness: 0.6, envStrength: 0.4 }),
        mark: new BasicMaterial({ color: [1.0, 0.5, 0.05] }),
        silk: new BasicMaterial({ color: [0.75, 0.75, 0.8], transparent: true, opacity: 0.55, depthWrite: false }),
        scales: new LitMaterial({ color: hexColor(0x5a2390), roughness: 0.45, metalness: 0.35, envStrength: 0.9, rimStrength: 0.35 }),
        belly: new LitMaterial({ color: hexColor(0xff8a2a), roughness: 0.6, envStrength: 0.4 }),
        wing: new LitMaterial({ color: hexColor(0x34104f), roughness: 0.75, side: 'double', envStrength: 0.25, rimStrength: 0.5 }),
        horn: new LitMaterial({ color: hexColor(0xd9ccb0), roughness: 0.5, envStrength: 0.5 }),
        wingBone: new LitMaterial({ color: hexColor(0x1e0a30), roughness: 0.6, envStrength: 0.4 }),
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
class Skeleton extends Base {
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
        if (!p.active) { this.fall = (this.fall || 0) + dt; this.y -= this.fall * 12 * dt; }
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
        if (this.y < ctx.lavaY - 1) this.kill(ctx, true);
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
class Rat extends Base {
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
        if (!p.active) { this.fall = (this.fall || 0) + dt; this.y -= this.fall * 12 * dt; } else this.y = p.y;
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
        if (this.y < ctx.lavaY - 1) this.kill(ctx, true);
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

class Bat extends Base {
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
        const k = t * this.spd * 0.7 * ctx.enemySpeed + this.ph;
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
class Spider extends Base {
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
class Dragon extends Base {
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
class Fireball {
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

function createEnemy(spec, M) {
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

// Halloween edition: the coins are little jack-o'-lanterns. The ribbed body and its stem are one mesh coloured by
// vertex; the carved face is a second, unlit mesh drawn with the same transforms, so it glows
function pumpkinGeometry() {
    const body = sphere(0.2, 24, 14);
    deform(body, (v) => {
        const a = Math.atan2(v.x, v.z), k = Math.hypot(v.x, v.z) / 0.2;
        const lobe = 0.9 + 0.1 * Math.pow(Math.abs(Math.cos(a * 4)), 0.6);
        v.x *= lobe * 1.12; v.z *= lobe * 1.12;
        v.y *= 0.84;
        if (v.y > 0) v.y -= 0.035 * Math.max(0, 1 - k * 1.6); else v.y += 0.02 * Math.max(0, 1 - k * 1.6);
    });
    recomputeNormals(body);
    return merge([
        { geo: body, color: [1.0, 0.46, 0.08] },
        { geo: cylinder(0.02, 0.03, 0.09, 6, 1), pos: V(0.005, 0.185, 0), rot: V(0, 0, -0.3), color: [0.24, 0.46, 0.1] }
    ]);
}
function pumpkinFaceGeometry() {
    const eye = extrude([[-0.042, -0.024], [0.042, -0.024], [0.0, 0.038]], 0.016);
    const nose = extrude([[-0.018, -0.012], [0.018, -0.012], [0.0, 0.016]], 0.016);
    const grin = extrude([[-0.11, 0.0], [-0.065, -0.07], [0, -0.085], [0.065, -0.07], [0.11, 0.0], [0.07, -0.012], [0.042, -0.035], [0.014, -0.01], [-0.014, -0.035], [-0.042, -0.01], [-0.07, -0.025]], 0.016);
    return merge([
        { geo: eye, pos: V(-0.07, 0.04, 0.205), rot: V(-0.15, -0.32, 0) },
        { geo: eye, pos: V(0.07, 0.04, 0.205), rot: V(-0.15, 0.32, 0) },
        { geo: nose, pos: V(0, -0.005, 0.218) },
        { geo: grin, pos: V(0, -0.035, 0.208), rot: V(0.12, 0, 0) }
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

class Items {
    constructor(desc, M, T) {
        this.root = new Node();
        this.M = M;
        this.list = [];
        const coins = desc.items.filter(i => i.type === 'coin');
        if (!M.pumpkin) {
            M.pumpkin = new LitMaterial({ toon: true, vertexColors: true, color: [1, 1, 1], toonKey: 2.8, toonPL: 0.9, toonSpec: 0.55, rimStrength: 0.55, emissive: [0.14, 0.05, 0.0], toonAmb: [1.3, 0.04] });
            M.pumpkinFace = new BasicMaterial({ color: [1.0, 0.86, 0.34] });
        }
        this.coinMesh = new InstancedMesh(pumpkinGeometry(), M.pumpkin, Math.max(1, coins.length));
        this.faceMesh = new InstancedMesh(pumpkinFaceGeometry(), M.pumpkinFace, Math.max(1, coins.length));
        this.root.add(this.coinMesh, this.faceMesh);
        this.glowMat = makeBillboardMaterial(T.glow, [1, 0.62, 0.22], 'itemglow');
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
            // (a slow turn with a wobble, so the grin keeps coming round to face you)
            this._r.set(Math.sin(time * 2.3 + c.phase) * 0.12, time * 1.5 + c.phase + (c.alive ? 0 : c.fly * 30), Math.sin(time * 1.7 + c.phase * 2) * 0.1);
            this._s.set(s, s, s);
            cm.setAt(n, this._v, this._r, this._s, [1, 1, 1]);
            this.faceMesh.setAt(n++, this._v, this._r, this._s, [1, 1, 1]);
            if (c.alive && g < 190) {
                const gl = 0.8 + Math.sin(time * 5 + c.phase * 3) * 0.12;
                this._s.set(gl, gl, gl);
                this.glowMesh.setAt(g++, this._v, this._r.set(0, 0, 0), this._s, [0.62, 0.3, 0.06]);
            }
        }
        cm.count = n; this.faceMesh.count = n;
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
return { Skeleton, Rat, Bat, Spider, Dragon, Fireball, createEnemy, Items };
})(__engine, __graphics, __tower);


// ======================================================================
//  arena.js
// ======================================================================
const __arena = (({ Node, Mesh, InstancedMesh, BasicMaterial, LitMaterial, GeoBuilder, box, cylinder, merge, extrude, plane, lathe, sphere, torus, Vec3, angleDiff, wrapAngle, TAU, makeRng }, { makeFlameMaterial, makeBillboardMaterial }, { polar, Tower }) => {
// The guardian's hall: ring over a pit, floating and drifting platforms, cannons, bomb crates, statues.



// The guardian's hall inside the tower top: a wide stone ring floating over a bottomless pit.
// Floating platforms (two of them drifting up and down), cannons that fire at the guardian,
// bomb crates, fire bowls, colossal knight statues with burning eyes, pillars with torches and
// blood-lit windows far out in the dark. Uses the same collision API as the Tower.

const V = (x = 0, y = 0, z = 0) => new Vec3(x, y, z);
const ARENA_RP = 7.0;      // the knight's walking radius in the hall
const PIT_R = 5.35;
const RING_OUT = 8.75;
const CANNON_RELOAD = 15;
const CRATE_RESPAWN = 11;
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

function bombModel(M) {
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

class BossArena {
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
return { ARENA_RP, PIT_R, RING_OUT, CANNON_RELOAD, CRATE_RESPAWN, bombModel, BossArena };
})(__engine, __graphics, __tower);


// ======================================================================
//  bosses.js
// ======================================================================
const __bosses = (({ Node, Mesh, LitMaterial, BasicMaterial, box, cylinder, sphere, torus, lathe, extrude, plane, GeoBuilder, Vec3, angleDiff, wrapAngle, clamp, damp, dampAngle, lerp, TAU, hexColor, toonify, makeToonMaterials }, { PATH, polar }) => {
// The three guardians, their attacks and hazards, and the cannonballs and bombs thrown at them.


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

class Telegraph {
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
class Pool {
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
class Runner {
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
class Faller {
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
class Shot {
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
class Missile {
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
class BoneTyrant extends BossBase {
    constructor(level) {
        super({
            name: 'THE BONE TYRANT', subtitle: 'Undead king of the tower', level,
            hp: (level === 1 ? 64 : 72) + Math.floor((level - 1) / 3) * 16, light: [4.2, 0.8, 0.45], scale: 1.7,
            theme: { glow: [0.72, 0.28, 1.0], window: [1.0, 0.45, 0.08] }
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
class BroodMother extends BossBase {
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
class AshWyrm extends BossBase {
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

function createBoss(level) {
    const k = (Math.max(1, level) - 1) % 3;
    return k === 0 ? new BoneTyrant(level) : k === 1 ? new BroodMother(level) : new AshWyrm(level);
}
return { Telegraph, Pool, Runner, Faller, Shot, Missile, BoneTyrant, BroodMother, AshWyrm, createBoss };
})(__engine, __tower);


// ======================================================================
//  ui.js
// ======================================================================
const __ui = (({ CONFIG }) => {
// Keyboard + touch input and the DOM HUD, menus and overlays.

// ======================================================================
// INPUT
// ======================================================================
// Keyboard + multi-touch buttons. "Pressed" flags last one frame.
// (arcade edition: the listeners stay on the window, but only act while the arcade is open: `active`)
class Input {
    constructor() {
        this.keys = new Set();
        this.touch = { left: false, right: false, jump: false, attack: false, down: false };
        this._pressed = { jump: false, attack: false, enter: false, pause: false, down: false };
        this.onAnyKey = null;
        this.onPad = null;
        this.active = false;
        this.pad = { prev: [], x: 0, jump: false, down: false, connected: false, rep: 0, dir: 0 };
        window.addEventListener('keydown', (e) => {
            if (!this.active) return;
            const k = e.code;
            if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space'].includes(k)) e.preventDefault();
            if (!this.keys.has(k)) {
                if (k === 'Space' || k === 'ArrowUp' || k === 'KeyW') this._pressed.jump = true;
                if (k === 'KeyJ' || k === 'KeyK' || k === 'KeyX' || k === 'KeyZ' || k === 'KeyF' || k === 'ShiftLeft' || k === 'ShiftRight') this._pressed.attack = true;
                if (k === 'KeyE' || k === 'Enter') this._pressed.enter = true;
                if (k === 'Escape' || k === 'KeyP') this._pressed.pause = true;
                if (k === 'ArrowDown' || k === 'KeyS') this._pressed.down = true;
            }
            this.keys.add(k);
            if (this.onAnyKey) this.onAnyKey(e);
        });
        window.addEventListener('keyup', (e) => this.keys.delete(e.code));
        window.addEventListener('blur', () => { this.keys.clear(); this.reset(); });
    }

    // gamepad (standard mapping), read once a frame: the left stick / d-pad moves, A jumps, X / B / RB swings,
    // Y enters a door, down smashes, Start pauses. Menus: A picks, B goes back
    pollPad() {
        const P = this.pad;
        let g = null;
        try { const list = navigator.getGamepads ? navigator.getGamepads() : []; for (const c of list || []) if (c && c.connected !== false && c.buttons && c.buttons.length >= 10) { g = c; break; } } catch (_) { g = null; }
        P.connected = !!g;
        if (!g) { P.prev = []; P.x = 0; P.jump = false; P.down = false; return; }
        const now = g.buttons.map((b) => !!(b && (b.pressed || b.value > 0.5)));
        const ax = g.axes[0] || 0, ay = g.axes[1] || 0;
        now[16] = ay > 0.6;              // (stick down, as a button)
        const hit = (i) => now[i] && !P.prev[i];
        P.prev = now;
        if (!this.active) return;
        P.x = now[14] ? -1 : now[15] ? 1 : Math.abs(ax) > 0.3 ? Math.sign(ax) : 0;
        P.jump = now[0];
        P.down = now[13] || now[16];
        if (hit(0)) this._pressed.jump = true;
        if (hit(1) || hit(2) || hit(5) || hit(7)) this._pressed.attack = true;
        if (hit(3) || hit(12)) this._pressed.enter = true;
        if (hit(13) || hit(16)) this._pressed.down = true;
        if (hit(9)) this._pressed.pause = true;
        if (this.onPad) for (const [i, name] of [[0, 'A'], [1, 'B'], [9, 'START'], [8, 'BACK'], [12, 'UP'], [13, 'DOWN']]) if (hit(i)) this.onPad(name);
    }
    // forget everything held when the arcade closes or opens (no stuck keys either way)
    clearAll() { this.keys.clear(); this.reset(); this.pad.x = 0; this.pad.jump = false; this.pad.down = false; }

    bindJoystick(el) {
        let pointer = null;
        const knob = el.querySelector('#joystick-knob');
        const center = () => {
            pointer = null;
            this.touch.left = this.touch.right = false;
            knob.style.setProperty('--stick-x', '0px');
            knob.style.setProperty('--stick-y', '0px');
            el.classList.remove('active');
        };
        const move = (e) => {
            const rect = el.getBoundingClientRect();
            const max = rect.width * 0.28;
            const dx = e.clientX - (rect.left + rect.width / 2);
            const dy = e.clientY - (rect.top + rect.height / 2);
            const length = Math.hypot(dx, dy);
            const scale = length > max ? max / length : 1;
            knob.style.setProperty('--stick-x', (dx * scale) + 'px');
            knob.style.setProperty('--stick-y', (dy * scale) + 'px');
            this.touch.left = dx < -max * 0.25;
            this.touch.right = dx > max * 0.25;
        };
        el.addEventListener('pointerdown', (e) => {
            if (pointer !== null) return;
            e.preventDefault();
            pointer = e.pointerId;
            try { el.setPointerCapture(pointer); } catch (_) { }
            el.classList.add('active');
            move(e);
        });
        el.addEventListener('pointermove', (e) => { if (e.pointerId === pointer) { e.preventDefault(); move(e); } });
        for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) {
            el.addEventListener(type, (e) => { if (e.pointerId === pointer) center(); });
        }
        el.addEventListener('contextmenu', (e) => e.preventDefault());
        this.centerJoystick = center;
    }

    bindButton(el, name) {
        const active = new Set();
        const down = (e) => {
            e.preventDefault();
            try { el.setPointerCapture(e.pointerId); } catch (_) { }
            active.add(e.pointerId);
            if (!this.touch[name]) {
                if (name === 'jump') this._pressed.jump = true;
                if (name === 'attack') this._pressed.attack = true;
                if (name === 'enter') this._pressed.enter = true;
                if (name === 'down') this._pressed.down = true;
            }
            this.touch[name] = true;
            el.classList.add('on');
            if (navigator.vibrate && (name === 'attack' || name === 'jump' || name === 'down')) { try { navigator.vibrate(8); } catch (_) { } }
        };
        const up = (e) => {
            active.delete(e.pointerId);
            if (active.size === 0) { this.touch[name] = false; el.classList.remove('on'); }
        };
        el.addEventListener('pointerdown', down);
        el.addEventListener('pointerup', up);
        el.addEventListener('pointercancel', up);
        el.addEventListener('lostpointercapture', up);
        el.addEventListener('contextmenu', (e) => e.preventDefault());
    }

    get x() {
        const l = this.keys.has('ArrowLeft') || this.keys.has('KeyA') || this.touch.left;
        const r = this.keys.has('ArrowRight') || this.keys.has('KeyD') || this.touch.right;
        const k = (r ? 1 : 0) - (l ? 1 : 0);
        return k || this.pad.x;
    }
    get jumpHeld() { return this.keys.has('Space') || this.keys.has('ArrowUp') || this.keys.has('KeyW') || this.touch.jump || this.pad.jump; }
    get down() { return this.keys.has('ArrowDown') || this.keys.has('KeyS') || this.touch.down || this.pad.down; }
    get jumpPressed() { return this._pressed.jump; }
    get attackPressed() { return this._pressed.attack; }
    get enterPressed() { return this._pressed.enter; }
    get pausePressed() { return this._pressed.pause; }
    get downPressed() { return this._pressed.down; }
    anyActive() { return this.x !== 0 || this.jumpHeld || this._pressed.jump || this._pressed.attack; }
    endFrame() { for (const k in this._pressed) this._pressed[k] = false; }
    reset() { this.endFrame(); for (const k in this.touch) this.touch[k] = false; if (this.centerJoystick) this.centerJoystick(); }
}

// ======================================================================
// UI
// ======================================================================
// DOM HUD, menus and overlays.

// (arcade edition: the game's DOM lives in a shadow root; setUIRoot points the lookups there)
let UI_ROOT = document;
function setUIRoot(r) { UI_ROOT = r; }
const $ = (id) => UI_ROOT.getElementById(id);

const HEART = '<svg viewBox="0 0 24 22"><path d="M12 21 C5 15 1 11.5 1 7 A5.5 5.5 0 0 1 12 4.5 A5.5 5.5 0 0 1 23 7 C23 11.5 19 15 12 21 Z" fill="#e8322a" stroke="#ffb3a0" stroke-width="1.2"/><path d="M6 6.5 A2.5 2.5 0 0 1 9 5" stroke="#ffd6cc" stroke-width="1.6" fill="none" stroke-linecap="round"/></svg>';
const HELM = '<svg viewBox="0 0 16 16"><path d="M3 15 V7 A5 5 0 0 1 13 7 V15 Z" fill="#c9d0db" stroke="#6a6f7a" stroke-width="1"/><rect x="4" y="8" width="8" height="1.6" fill="#1a1216"/><path d="M8 2 C10 0 12 1 13 2" stroke="#e24a2a" stroke-width="2" fill="none" stroke-linecap="round"/></svg>';
const SOUND_ON = '<svg viewBox="0 0 24 24"><path d="M3 9 H7 L12 5 V19 L7 15 H3 Z" fill="#ffe2a0"/><path d="M15.5 8.5 A5 5 0 0 1 15.5 15.5 M18 6 A8.5 8.5 0 0 1 18 18" stroke="#ffe2a0" stroke-width="2" fill="none" stroke-linecap="round"/></svg>';
const SOUND_OFF = '<svg viewBox="0 0 24 24"><path d="M3 9 H7 L12 5 V19 L7 15 H3 Z" fill="#ffe2a0"/><path d="M16 9 L22 15 M22 9 L16 15" stroke="#ff8a6a" stroke-width="2.2" stroke-linecap="round"/></svg>';

// the action button changes in the guardian's hall: sword, fire a cannon, throw a bomb
const ACTION_ICON = {
    sword: '<svg viewBox="0 0 24 24"><path d="M19 3 L21 5 L10 16 L8 14 Z" fill="#ffe2a0"/><path d="M5 13 L11 19 M4 20 L7 17" stroke="#ffb070" stroke-width="2.4" stroke-linecap="round"/></svg>',
    fire: '<svg viewBox="0 0 24 24"><path d="M2.5 15.5 L13.5 8.5 L16.5 13 L5.5 20 Z" fill="#ffe2a0"/><circle cx="7.5" cy="18.5" r="3" fill="#6a3a1a" stroke="#ffe2a0" stroke-width="1.6"/><path d="M17.5 6.5 L20 4 M18.5 10 L22.5 9.5 M15.5 5 L15.8 1.5" stroke="#ff8a3a" stroke-width="2.2" stroke-linecap="round"/></svg>',
    throw: '<svg viewBox="0 0 24 24"><circle cx="10" cy="14" r="7" fill="#ffe2a0"/><path d="M14 8 Q16 5 19 5" stroke="#ffb070" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M20 2 L20.8 4.2 L23 5 L20.8 5.8 L20 8 L19.2 5.8 L17 5 L19.2 4.2 Z" fill="#ff8a3a"/></svg>'
};

class UI {
    constructor(game) {
        this.g = game;
        this.touchMode = game.host && game.host.isTouch ? !!game.host.isTouch() : (('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || matchMedia('(pointer: coarse)').matches);
        this.floaters = [];
        this._toastT = 0; this._centerT = 0;
        const I = game.input;
        I.bindJoystick($('joystick'));
        I.bindButton($('btn-jump'), 'jump');
        I.bindButton($('btn-attack'), 'attack');
        I.bindButton($('btn-enter'), 'enter');
        I.bindButton($('btn-dive'), 'down');
        const click = (id, fn) => $(id).addEventListener('click', (e) => { e.preventDefault(); game.audio.sfx('ui'); fn(); });
        click('play-btn', () => game.startGame());
        click('howto-btn', () => this.showHowto(false));
        click('credits-btn', () => this.show('credits'));
        UI_ROOT.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', () => { game.audio.sfx('ui'); if (b.dataset.close === 'howto') this.closeHowto(); else this.hide(b.dataset.close); }));
        click('pause-btn', () => game.pause());
        click('resume-btn', () => game.resume());
        click('pause-howto-btn', () => this.showHowto(true));
        click('exit-btn', () => { this.hide('pause'); this.show('confirm'); });
        click('confirm-yes', () => { this.hide('confirm'); game.toMenu(); });
        click('confirm-no', () => { this.hide('confirm'); if (game.state === 'paused') this.show('pause'); });
        click('retry-btn', () => game.retry());
        click('dead-menu-btn', () => game.toMenu());
        click('next-btn', () => game.nextLevel());
        click('mute-btn', () => this.toggleMute());
        click('pause-mute-btn', () => this.toggleMute());
        this.updateMuteIcons();
        // hearts
        this.hearts = $('hearts');
        this.hearts.innerHTML = HEART.repeat(CONFIG.MAX_HP);
    }

    toggleMute() {
        const m = !this.g.audio.muted;
        this.g.audio.setMuted(m);
        try { localStorage.setItem('sfal-halloween-muted', m ? '1' : '0'); } catch (_) { }
        this.updateMuteIcons();
    }
    updateMuteIcons() {
        const m = this.g.audio.muted;
        $('mute-btn').innerHTML = m ? SOUND_OFF : SOUND_ON;
        $('pause-mute-btn').textContent = m ? 'SOUND: OFF' : 'SOUND: ON';
    }

    show(id) { $(id).classList.remove('hidden'); this._syncControls(); }
    hide(id) { $(id).classList.add('hidden'); this._syncControls(); }
    // (the touch controls sit over the game: they step aside while a menu or a panel is up)
    _syncControls() {
        const up = ['menu', 'howto', 'credits', 'pause', 'confirm', 'dead', 'win'].some((id) => { const e = $(id); return e && !e.classList.contains('hidden'); });
        const t = $('touch'); if (t) t.classList.toggle('under', up);
    }
    isShown(id) { return !$(id).classList.contains('hidden'); }
    // how to play: from the title, or over the pause menu (it goes back there when closed)
    showHowto(fromPause) {
        this._howtoFromPause = !!fromPause;
        if (fromPause) this.hide('pause');
        const p = $('howto').querySelector('.panel'); if (p) p.scrollTop = 0;
        this.show('howto');
    }
    closeHowto() {
        this.hide('howto');
        if (this._howtoFromPause && this.g.state === 'paused') this.show('pause');
        this._howtoFromPause = false;
    }
    hideAllScreens() { ['menu', 'howto', 'credits', 'pause', 'confirm', 'dead', 'win', 'loading'].forEach(s => this.hide(s)); }

    // the touch controls follow the input in use (a tap brings them, the keyboard or a gamepad hides them)
    setTouchMode(on) {
        if (this.touchMode === on) return;
        this.touchMode = on;
        // (the arcade lays itself out for it: on a touch screen the game takes the whole screen)
        if (this.g.host && this.g.host.onTouchMode) this.g.host.onTouchMode(on);
        if (this._hudOn !== undefined) this.setHudVisible(this._hudOn);
    }
    setHudVisible(v) {
        this._hudOn = v;
        $('hud').classList.toggle('hidden', !v);
        $('touch').classList.toggle('hidden', !(v && this.touchMode));
        $('kb-hint').classList.toggle('hidden', !(v && !this.touchMode));
    }
    // the first climb on a touch screen: the controls carry their names for a few seconds (game: the countdown or
    // the end of the opening)
    coach() {
        if (!this.touchMode || this.coached) return;
        this.coached = true;
        const t = $('touch');
        t.classList.add('coach');
        clearTimeout(this._coachTo);
        this._coachTo = setTimeout(() => t.classList.remove('coach'), 9000);
    }

    setScore(s) { $('score').textContent = Math.floor(s).toLocaleString('en-US'); }
    setLevel(l) { $('level-tag').textContent = 'TOWER ' + l; }
    setGreed(g, pulse) {
        $('greed-fill').style.width = Math.min(100, g) + '%';
        $('greed-pct').textContent = Math.floor(g) + '%';
        if (pulse) { const el = $('greed'); el.classList.remove('pulse'); void el.offsetWidth; el.classList.add('pulse'); }
    }
    setHearts(hp, hit) {
        const svgs = this.hearts.querySelectorAll('svg');
        svgs.forEach((s, i) => s.classList.toggle('lost', i >= hp));
        if (hit) { this.hearts.classList.remove('hit'); void this.hearts.offsetWidth; this.hearts.classList.add('hit'); }
    }
    setLives(n) { $('lives').innerHTML = HELM.repeat(Math.max(0, n)); }
    setKey(have) { $('key-slot').classList.toggle('have', have); }
    setMeter(knightFrac, lavaFrac, keyFrac) {
        $('meter-knight').style.bottom = (Math.max(0, Math.min(1, knightFrac)) * 100) + '%';
        $('meter-lava').style.height = (Math.max(0, Math.min(1, lavaFrac)) * 100) + '%';
        const k = $('meter-key');
        if (keyFrac === null) k.classList.add('hidden');
        else { k.classList.remove('hidden'); k.style.bottom = (keyFrac * 100) + '%'; }
    }
    setDoorPrompt(v) { $('btn-enter').classList.toggle('hidden', !v); if (!this.touchMode && v) this.toastOnce('door', 'Press <b>E</b> to enter the passage'); }
    setFrost(on) { $('frost').classList.toggle('on', on); }
    setLavaWarning(on) { $('damage').classList.toggle('lava', on); }
    damageFlash() {
        const d = $('damage');
        d.classList.add('hit');
        setTimeout(() => d.classList.remove('hit'), 120);
    }

    center(text, small, time = 0.9) {
        const el = $('center-msg');
        el.textContent = text;
        el.classList.toggle('small', !!small);
        el.classList.remove('show'); void el.offsetWidth; el.classList.add('show');
        this._centerT = time;
    }
    clearCenter() { $('center-msg').classList.remove('show'); this._centerT = 0; }
    sub(text) {
        const el = $('sub-msg');
        if (text) { el.textContent = text; el.classList.add('show'); } else el.classList.remove('show');
    }
    toast(html, time = 2.6) {
        const el = $('toast');
        el.innerHTML = html;
        el.classList.add('show');
        this._toastT = time;
    }
    hideToast() { this._toastT = 0; $('toast').classList.remove('show'); }
    toastOnce(key, html) {
        this._once = this._once || {};
        if (this._once[key]) return;
        this._once[key] = true;
        this.toast(html);
    }

    floater(worldPos, text, color) {
        const el = document.createElement('div');
        el.className = 'floater';
        const sp = document.createElement('span');
        sp.textContent = text;
        el.appendChild(sp);
        if (color) el.style.color = color;
        $('floaters').appendChild(el);
        this.floaters.push({ el, pos: worldPos.clone(), t: 0 });
    }

    update(dt, camera) {
        if (this._toastT > 0) { this._toastT -= dt; if (this._toastT <= 0) $('toast').classList.remove('show'); }
        if (this._centerT > 0) { this._centerT -= dt; if (this._centerT <= 0) $('center-msg').classList.remove('show'); }
        const app = $('app'), w = app.clientWidth, h = app.clientHeight;
        const o = {};
        for (let i = this.floaters.length - 1; i >= 0; i--) {
            const f = this.floaters[i];
            f.t += dt;
            if (f.t > 1.0) { f.el.remove(); this.floaters.splice(i, 1); continue; }
            f.pos.y += dt * 1.2;
            camera.project(f.pos, o);
            if (o.w <= 0) { f.el.style.display = 'none'; continue; }
            f.el.style.display = '';
            f.el.style.left = ((o.x * 0.5 + 0.5) * w) + 'px';
            f.el.style.top = ((-o.y * 0.5 + 0.5) * h) + 'px';
            f.el.style.opacity = String(Math.min(1, (1 - f.t) * 2.5));
        }
    }
    clearFloaters() { for (const f of this.floaters) f.el.remove(); this.floaters.length = 0; }

    // ---- ground-pound, combo, falls, intro
    setFalls(n, bump) {
        $('falls-n').textContent = String(n);
        if (bump) { const el = $('falls-tag'); el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); }
    }
    setDiveReady(on) {
        if (this._diveReady === on) return;
        this._diveReady = on;
        $('btn-dive').classList.toggle('ready', on);
    }
    // n: combo count, mult: multiplier, frac: time left 0..1 (n = 0 hides the meter)
    setCombo(n, mult, frac, bump) {
        const el = $('combo');
        const show = n > 0 && mult > 1;
        if (show !== this._comboShown) { this._comboShown = show; el.classList.toggle('show', show); }
        if (!show) return;
        if (this._comboMult !== mult) {
            this._comboMult = mult;
            const m = $('combo-mult');
            m.textContent = 'x' + mult;
            m.classList.toggle('hot', mult >= 5);
        }
        if (bump) { const m = $('combo-mult'); m.classList.remove('bump'); void m.offsetWidth; m.classList.add('bump'); }
        if (this._comboN !== n) { this._comboN = n; $('combo-n').textContent = n + ' COMBO'; }
        $('combo-fill').style.width = Math.round(Math.max(0, Math.min(1, frac)) * 100) + '%';
    }
    // big shout across the screen: SMASH x4!, EPIC!, AAAH...
    pop(text, cls) {
        const el = $('pop');
        el.textContent = text;
        el.className = cls || '';
        void el.offsetWidth;
        el.classList.add('go');
        clearTimeout(this._popTo);
        this._popTo = setTimeout(() => el.classList.remove('go'), 1100);
    }
    clearPop() { const el = $('pop'); el.className = ''; clearTimeout(this._popTo); }
    introTitle(mode) {
        const el = $('intro-title');
        el.classList.remove('show', 'out');
        if (mode) { void el.offsetWidth; el.classList.add(mode); }
    }
    setIntro(on) {
        $('letterbox').classList.toggle('on', on);
        const h = $('skip-hint');
        h.textContent = this.touchMode ? 'TAP TO SKIP' : 'PRESS ANY KEY TO SKIP';
        h.classList.toggle('hidden', !on);
        if (!on) this.introTitle(null);
    }

    showDead(title, rows, gameOver, bossRetry, fallLine) {
        $('dead-title').textContent = title;
        $('dead-falls').textContent = fallLine || '';
        $('dead-falls').classList.toggle('hidden', !fallLine);
        $('dead-stats').innerHTML = rows.map(([a, b, cls]) => `<span class="${cls || ''}">${a}</span><span class="${cls || ''}">${b}</span>`).join('');
        $('retry-btn').textContent = gameOver ? 'PLAY AGAIN' : bossRetry ? 'FIGHT AGAIN' : 'TRY AGAIN';
        this.show('dead');
    }

    // ---- guardian fight
    setActionMode(mode) {
        if (this._actMode === mode) return;
        this._actMode = mode;
        const b = $('btn-attack');
        b.innerHTML = (ACTION_ICON[mode] || ACTION_ICON.sword) + '<span class="cap">' + (mode === 'fire' ? 'FIRE' : mode === 'throw' ? 'THROW' : 'SWORD') + '</span>';
        b.classList.toggle('fire', mode === 'fire');
        b.classList.toggle('throw', mode === 'throw');
        b.setAttribute('aria-label', mode === 'fire' ? 'Fire cannon' : mode === 'throw' ? 'Throw bomb' : 'Sword');
        const p = $('act-prompt');
        p.classList.toggle('touch', this.touchMode);
        if (this.touchMode) p.textContent = mode === 'fire' ? 'FIRE!' : 'THROW!';
        else p.innerHTML = '<b>J</b> ' + (mode === 'fire' ? 'FIRE THE CANNON' : 'THROW THE BOMB');
        p.classList.toggle('show', mode === 'fire' || mode === 'throw');
    }
    // arrow at the screen edge toward the nearest loaded cannon (-1 left, 1 right, 0 none)
    setSiegeHint(dir) {
        if (this._siegeDir === dir) return;
        this._siegeDir = dir;
        $('siege-left').classList.toggle('show', dir < 0);
        $('siege-right').classList.toggle('show', dir > 0);
    }
    setBossMode(on) {
        $('hud').classList.toggle('boss', on);
        $('bossbar').classList.toggle('hidden', !on);
        if (!on) { this.setActionMode('sword'); this.setSiegeHint(0); }
        if (!on) { $('bossbar').classList.remove('rage'); $('boss-title').classList.remove('show'); }
    }
    setBoss(name, frac, rage, hit) {
        $('boss-name').textContent = name;
        const w = Math.max(0, Math.min(1, frac)) * 100 + '%';
        $('boss-fill').style.width = w;
        $('boss-lag').style.width = w;
        const bar = $('bossbar');
        bar.classList.toggle('rage', !!rage);
        if (hit) { bar.classList.remove('hit'); void bar.offsetWidth; bar.classList.add('hit'); }
    }
    bossTitle(name, sub) {
        const el = $('boss-title');
        el.querySelector('.bt-name').textContent = name;
        el.querySelector('.bt-sub').textContent = sub;
        el.classList.remove('show'); void el.offsetWidth; el.classList.add('show');
    }
    fade(on, time = 0.6) {
        const f = $('fader');
        f.style.transitionDuration = time + 's';
        f.classList.toggle('on', on);
    }
    rageFlash(white) {
        const d = $('flash');
        d.classList.toggle('white', !!white);
        d.classList.remove('go'); void d.offsetWidth; d.classList.add('go');
    }
    showWin(title, rows) {
        $('win-title').textContent = title;
        $('win-stats').innerHTML = rows.map(([a, b, cls]) => `<span class="${cls || ''}">${a}</span><span class="${cls || ''}">${b}</span>`).join('');
        this.show('win');
    }
    setBest(b) { $('best').textContent = Math.floor(b).toLocaleString('en-US'); $('best-line').classList.toggle('hidden', b <= 0); }
    loaded() { this.hide('loading'); }
    error(msg) { $('error-text').textContent = msg; this.show('error'); this.hide('loading'); }
}
return { Input, setUIRoot, UI };
})(__config);


// ======================================================================
//  chiptune.js
// ======================================================================
const __chiptune = (() => {
// Halloween edition music: a small chiptune tracker (pulse, triangle, noise and a haunted organ) playing two
// public-domain classics arranged for the arcade. The title screen gets the opening of Bach's Toccata and Fugue in
// D minor on the organ; the climb gets Grieg's "In the Hall of the Mountain King", which speeds up as the lava closes
// in (setTension). The guardian fights get a heavier, darker take on the same theme.

const NOTE = { C: 0, 'C#': 1, Db: 1, D: 2, 'D#': 3, Eb: 3, E: 4, F: 5, 'F#': 6, Gb: 6, G: 7, 'G#': 8, Ab: 8, A: 9, 'A#': 10, Bb: 10, B: 11 };
const midiOf = (s) => { const m = /^([A-G](?:#|b)?)(-?\d)$/.exec(s); return m ? 12 * (+m[2] + 1) + NOTE[m[1]] : null; };
const freq = (m) => 440 * Math.pow(2, (m - 69) / 12);

// "A5:1 G5:1 A5:24 r:6 D3+F3+A3:16" -> [{ t, len, notes: [midi...] }]; durations in ticks
function parse(str) {
    const out = [];
    let t = 0;
    for (const tok of str.trim().split(/\s+/)) {
        if (tok === '|') continue;
        const [n, d] = tok.split(':');
        const len = +d || 1;
        if (n !== 'r') out.push({ t, len, notes: n.split('+').map(midiOf).filter((x) => x !== null) });
        t += len;
    }
    return { events: out, length: t };
}
const transpose = (str, k) => str.replace(/([A-G](?:#|b)?)(-?\d)/g, (_, n, o) => { const m = 12 * (+o + 1) + NOTE[n] + k; const names = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']; return names[((m % 12) + 12) % 12] + (Math.floor(m / 12) - 1); });

// ---- the songs (ticks: 16th notes for the climb, 32nd notes for the toccata)
// In the Hall of the Mountain King, B minor, then up a fifth, then home
const MK_A = 'B3:2 C#4:2 D4:2 E4:2 F#4:2 D4:2 F#4:4 | F4:2 C#4:2 F4:4 E4:2 C4:2 E4:4 | B3:2 C#4:2 D4:2 E4:2 F#4:2 D4:2 F#4:2 B4:2 | A4:2 F#4:2 D4:2 F#4:2 A4:8';
const MK_END = 'B3:2 C#4:2 D4:2 E4:2 F#4:2 D4:2 F#4:4 | F4:2 C#4:2 F4:4 E4:2 C4:2 E4:4 | B3:2 C#4:2 D4:2 E4:2 F#4:2 D4:2 F#4:2 B4:2 | A4:2 F#4:2 D4:2 F#4:2 B4:8';
const MK_LEAD = [MK_A, MK_A, transpose(MK_A, 7), transpose(MK_A, 7), MK_A, MK_END].join(' ');
const pedal = (root, fifth, bars) => Array(bars).fill(`${root}:2 r:2 ${fifth}:2 r:2 ${root}:2 r:2 ${fifth}:2 r:2`).join(' ');
const MK_BASS = [pedal('B1', 'F#2', 8), pedal('F#2', 'C#3', 8), pedal('B1', 'F#2', 8)].join(' ');
// a creeping counter line (parallel sixths below the theme) that joins when things get tense
const MK_HARM = transpose(MK_LEAD, -9);
const SONGS = {
    climb: { bpm: 108, tpb: 4, voices: [
        { ins: 'pulse25', data: MK_LEAD, vol: 0.16, layer: 0 },
        { ins: 'pulse12', data: MK_HARM, vol: 0.07, layer: 0.62 },
        { ins: 'tri', data: MK_BASS, vol: 0.34, layer: 0 },
        { ins: 'drums', data: Array(24).fill('K:2 h:2 S:2 h:2 K:2 K:2 S:2 h:2').join(' '), vol: 0.5, layer: 0.28 },
    ] },
    boss: { bpm: 150, tpb: 4, voices: [
        { ins: 'organ', data: transpose(MK_LEAD, -12), vol: 0.1, layer: 0 },
        { ins: 'pulse50', data: transpose(MK_LEAD, 0), vol: 0.07, layer: 0 },
        { ins: 'tri', data: [pedal('B1', 'C2', 8), pedal('F#1', 'G1', 8), pedal('B1', 'C2', 8)].join(' '), vol: 0.38, layer: 0 },
        { ins: 'drums', data: Array(24).fill('K:2 h:1 h:1 S:2 K:2 K:2 h:2 S:2 S:1 h:1').join(' '), vol: 0.55, layer: 0 },
    ] },
    // Toccata and Fugue in D minor, the opening (32nd note ticks, slow): the mordent, the run down, three octaves,
    // then the diminished chord rolled over the pedal, and a quiet organ breath before it comes round again
    toccata: { bpm: 66, tpb: 8, voices: [
        { ins: 'organ', vol: 0.16, layer: 0, data: [
            'A5:1 G5:1 A5:20 r:10',
            'G5:1 F5:1 E5:1 D5:1 C#5:4 D5:24',
            'A4:1 G4:1 A4:20 r:10',
            'G4:1 F4:1 E4:1 D4:1 C#4:4 D4:24',
            'A3:1 G3:1 A3:20 r:10',
            'G3:1 F3:1 E3:1 D3:1 C#3:4 D3:24',
            'C#3:2 E3:2 G3:2 A#3:2 C#4:2 E4:2 G4:2 A#4:2 C#5:48',
            'D5:40 r:24',
            'F4:4 E4:4 D4:4 C#4:4 D4:4 A3:4 A#3:4 G3:4 A3:32 r:32',
        ].join(' ') },
        { ins: 'organ', vol: 0.1, layer: 0, data: [
            'r:32 r:32 r:32 r:32 r:32 r:32',
            'D2:64',
            'D2+A2+D3+F3:40 r:24',
            'D2+A2:32 C#2+A2:32 D2+A2:32 r:32',
        ].join(' ') },
    ] },
};
for (const k in SONGS) { const S = SONGS[k]; S.parsed = S.voices.map((v) => Object.assign({}, v, parse(v.data))); S.length = Math.max(...S.parsed.map((p) => p.length)); }

class Chiptune {
    constructor(ctx, out) {
        this.ctx = ctx;
        this.out = ctx.createGain(); this.out.gain.value = 0.8; this.out.connect(out);
        this.dry = ctx.createGain(); this.dry.connect(this.out);
        // a cathedral for the organ
        this.verb = ctx.createConvolver(); this.verb.buffer = this._impulse(2.8, 2.6);
        this.wet = ctx.createGain(); this.wet.gain.value = 0.32; this.verb.connect(this.wet); this.wet.connect(this.out);
        this.waves = { pulse12: this._pulse(0.125), pulse25: this._pulse(0.25), pulse50: this._pulse(0.5) };
        const len = ctx.sampleRate; this.noise = ctx.createBuffer(1, len, ctx.sampleRate);
        const d = this.noise.getChannelData(0); for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
        this.song = null; this.name = null; this.tension = 0; this.bpmMul = 1; this.iv = 0;
    }
    _pulse(duty) {
        const n = 48, re = new Float32Array(n), im = new Float32Array(n);
        for (let k = 1; k < n; k++) im[k] = (2 / (k * Math.PI)) * Math.sin(k * Math.PI * duty);
        return this.ctx.createPeriodicWave(re, im, { disableNormalization: false });
    }
    _impulse(sec, decay) {
        const c = this.ctx, len = Math.floor(c.sampleRate * sec), buf = c.createBuffer(2, len, c.sampleRate);
        for (let ch = 0; ch < 2; ch++) { const d = buf.getChannelData(ch); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay); }
        return buf;
    }
    play(name, fade = 0.6) {
        if (this.name === name && this.song) return;
        const c = this.ctx, t = c.currentTime;
        this.out.gain.cancelScheduledValues(t);
        this.out.gain.setValueAtTime(0.0001, t);
        this.out.gain.linearRampToValueAtTime(0.8, t + fade);
        this.name = name; this.song = SONGS[name];
        this.tick = 0; this.next = t + 0.06;
        this._start();
    }
    stop(fade = 0.5) {
        const c = this.ctx, t = c.currentTime;
        this.out.gain.cancelScheduledValues(t);
        this.out.gain.setValueAtTime(this.out.gain.value, t);
        this.out.gain.linearRampToValueAtTime(0.0001, t + fade);
        this.song = null; this.name = null;
        clearInterval(this.iv); this.iv = 0;
    }
    // paused with the arcade (the context is suspended too): pick up where it left off
    halt() { clearInterval(this.iv); this.iv = 0; }
    unhalt() { if (this.song) { this.next = Math.max(this.next, this.ctx.currentTime + 0.05); this._start(); } }
    duck(on) { const t = this.ctx.currentTime; this.out.gain.setTargetAtTime(on ? 0.3 : 0.8, t, 0.08); }
    setTension(k) { this.tension = Math.max(0, Math.min(1, k)); }
    _start() { if (!this.iv) this.iv = setInterval(() => this._pump(), 30); this._pump(); }
    _pump() {
        const S = this.song, c = this.ctx;
        if (!S) return;
        if (this.next < c.currentTime - 0.3) this.next = c.currentTime + 0.05;
        const tens = this.name === 'climb' ? this.tension : 0;
        const bpm = S.bpm * (1 + 0.9 * Math.pow(tens, 1.3)) * this.bpmMul;
        const tickSec = 60 / bpm / S.tpb;
        while (this.next < c.currentTime + 0.22) {
            const tk = this.tick % S.length;
            for (const v of S.parsed) {
                if (v.layer > 0 && tens < v.layer) continue;
                // (binary search would be faster; the lists are short)
                for (const e of v.events) { if (e.t === tk) this._note(v, e, this.next, e.len * tickSec, tens); else if (e.t > tk) break; }
            }
            this.next += tickSec; this.tick++;
        }
    }
    _voice(ins, f, t, dur, vol) {
        const c = this.ctx, g = c.createGain();
        const end = t + Math.max(0.04, dur * 0.92);
        if (ins === 'organ') {
            const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2400; lp.Q.value = 0.7;
            const vib = c.createOscillator(), vg = c.createGain(); vib.frequency.value = 5.2; vg.gain.value = f * 0.004; vib.connect(vg);
            for (const [type, det, k] of [['square', 0, 0.5], ['sawtooth', 7, 0.35], ['sine', -1200, 0.7]]) {
                const o = c.createOscillator(); o.type = type; o.frequency.value = f; o.detune.value = det;
                vg.connect(o.frequency);
                const og = c.createGain(); og.gain.value = k; o.connect(og); og.connect(lp);
                o.start(t); o.stop(end + 0.35);
            }
            vib.start(t); vib.stop(end + 0.35);
            lp.connect(g);
            g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + 0.025);
            g.gain.setValueAtTime(vol, end); g.gain.exponentialRampToValueAtTime(0.0001, end + 0.3);
            g.connect(this.dry); g.connect(this.verb);
            return;
        }
        const o = c.createOscillator();
        if (ins === 'tri') o.type = 'triangle'; else o.setPeriodicWave(this.waves[ins] || this.waves.pulse50);
        o.frequency.value = f;
        o.connect(g); g.connect(this.dry);
        if (ins !== 'tri') { const s = c.createGain(); s.gain.value = 0.18; g.connect(s); s.connect(this.verb); }
        g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + 0.006);
        g.gain.setValueAtTime(vol * 0.8, Math.max(t + 0.01, end - 0.02)); g.gain.exponentialRampToValueAtTime(0.0001, end + 0.04);
        o.start(t); o.stop(end + 0.06);
    }
}

// drums are written as letters; parse them separately
for (const k in SONGS) for (const v of SONGS[k].parsed) if (v.ins === 'drums') {
    let t = 0; v.events = [];
    for (const tok of v.data.trim().split(/\s+/)) { const [n, d] = tok.split(':'); const len = +d || 1; if (n !== 'r') v.events.push({ t, len, drum: n }); t += len; }
    v.length = t;
}
for (const k in SONGS) SONGS[k].length = Math.max(...SONGS[k].parsed.map((p) => p.length));
// the voices play their notes; the drum voice (K kick, S snare, h hat) plays its kit
Chiptune.prototype._note = function (v, e, t, dur, tens) {
    if (v.ins !== 'drums') { for (const m of e.notes) this._voice(v.ins, freq(m), t, dur, v.vol); return; }
    const c = this.ctx, vol = v.vol * (0.6 + 0.4 * tens);
    if (e.drum === 'K') {
        const o = c.createOscillator(), g = c.createGain();
        o.type = 'sine'; o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(40, t + 0.14);
        g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
        o.connect(g); g.connect(this.dry); o.start(t); o.stop(t + 0.22);
    } else {
        const s = c.createBufferSource(); s.buffer = this.noise;
        const f = c.createBiquadFilter(); f.type = e.drum === 'S' ? 'bandpass' : 'highpass'; f.frequency.value = e.drum === 'S' ? 1800 : 7000; f.Q.value = e.drum === 'S' ? 0.9 : 0.7;
        const g = c.createGain(), d = e.drum === 'S' ? 0.13 : 0.035, a = e.drum === 'S' ? vol * 0.55 : vol * 0.22;
        g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(a, t + 0.003); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
        s.connect(f); f.connect(g); g.connect(this.dry); s.start(t, Math.random() * 0.5); s.stop(t + d + 0.02);
    }
};
return { Chiptune };
})();


// ======================================================================
//  audio.js
// ======================================================================
const __audio = (({ Chiptune }) => {
// Music, ambience and sound effects (Halloween arcade edition).
/**
 * AudioManager for Sir Falls-A-Lot: Halloween Edition
 *  - Music: the Chiptune tracker (the Toccata on the title, the Mountain King on the climb, a darker take for the
 *    guardians): no music files at all
 *  - SFX: procedural Web Audio; the knight's voice lines are short mp3 clips (assets/audio/sfal-*.mp3)
 *  - The arcade owns its own AudioContext: it is suspended while you are away from the machine
 */

class AudioManagerClass {
    constructor() {
        this.ctx = null;
        this.master = null;
        this.sfxGain = null;
        this.muted = false;
        this._level = 1;
        this._vol = 1;
        this._want = null; // 'menu' | 'game' | 'boss'
        this._unlocked = false;
        this._last = {};
        this._noise = null;
        this._voiceFiles = {
            fall: [
                'assets/audio/sfal-fall-misplaced-wall-2.mp3',
                'assets/audio/sfal-fall-feet-independence.mp3',
                'assets/audio/sfal-fall-tall-misunderstanding.mp3',
                'assets/audio/sfal-fall-theoretical-landing-2.mp3',
                'assets/audio/sfal-fall-not-dressed-descent.mp3',
                'assets/audio/sfal-fall-rude-castle-2.mp3',
                'assets/audio/sfal-fall-longer-rope.mp3',
                'assets/audio/sfal-fall-softest-rock.mp3',
                'assets/audio/sfal-fall-dramatic-exit.mp3',
                'assets/audio/sfal-fall-posture-trajectory.mp3'
            ],
            lava: [
                'assets/audio/sfal-lava-greaves-boiling.mp3',
                'assets/audio/sfal-lava-not-that-bath-2.mp3',
                'assets/audio/sfal-lava-cold-dungeon.mp3',
                'assets/audio/sfal-lava-wearable-oven.mp3',
                'assets/audio/sfal-lava-medium-rare.mp3',
                'assets/audio/sfal-lava-personal-grudge.mp3',
                'assets/audio/sfal-lava-toes-resigned.mp3',
                'assets/audio/sfal-lava-marshmallow.mp3',
                'assets/audio/sfal-lava-warm-welcome.mp3',
                'assets/audio/sfal-lava-fiery-career-choice.mp3'
            ]
        };
        this._voiceBag = {};
        this._voiceLastLine = {};
        this._voiceCooldown = {};
        this._voicePlayer = null;
        this.active = false;
        this.url = (p) => p;          // the host maps asset paths (How You Haunt Me's assetURL)
        this._onGesture = this._onGesture.bind(this);
        ['pointerdown', 'touchstart', 'keydown', 'click'].forEach(e => document.addEventListener(e, () => { if (this.active) this._onGesture(); }, { passive: true }));
    }

    // a key press / click / tap on the way to the machine (the screen opens a moment later, once the camera is
    // there): the context starts inside that gesture, so the sound may start then (Safari asks for this)
    prime() {
        this._ensureCtx();
        if (this.ctx && this.ctx.state === 'suspended') { try { this.ctx.resume(); } catch (_) { } }
    }
    // the house's master volume (How You Haunt Me's options) applies to the machine too
    setVolume(v) {
        this._vol = Math.max(0, Math.min(1, +v || 0));
        if (this.master) this.master.gain.value = this.muted ? 0 : 0.8 * this._vol;
        if (this._voicePlayer) this._voicePlayer.volume = 0.78 * this._vol;
    }
    // the arcade opens (inside a click or key press): make sure the sound can start, pick up where it was
    unlock() {
        this.active = true;
        this._onGesture();
        if (this.ctx && this.ctx.state === 'suspended') { try { this.ctx.resume(); } catch (_) { } }
        if (this._chip) this._chip.unhalt();
        if (this._voicePlayer && this._voiceWasPlaying) { this._voicePlayer.play().catch(() => { }); }
        this._voiceWasPlaying = false;
    }
    // away from the machine: everything holds its breath
    sleep() {
        this.active = false;
        if (this._chip) this._chip.halt();
        if (this._voicePlayer && !this._voicePlayer.paused) { this._voiceWasPlaying = true; this._voicePlayer.pause(); }
        if (this.ctx && this.ctx.state === 'running') { try { this.ctx.suspend(); } catch (_) { } }
    }
    get chip() {
        if (!this._chip && this.ctx) { this._chip = new Chiptune(this.ctx, this.musicGain); }
        return this._chip;
    }

    _onGesture() {
        this._ensureCtx();
        if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
        if (!this._unlocked) {
            this._unlocked = true;
            if (this._want === 'menu') this.playMenuMusic();
            else if (this._want === 'game') this.playGameMusic();
            else if (this._want === 'boss') this.playBossMusic(this._bossKind);
        }
        if (this.ctx && this._wantDrone && !this._drone) this.startDrone();
    }

    _ensureCtx() {
        if (!this.ctx) {
            try {
                const AC = window.AudioContext || window.webkitAudioContext;
                this.ctx = new AC();
                this.master = this.ctx.createGain();
                this.master.gain.value = this.muted ? 0 : 0.8 * this._vol;
                const comp = this.ctx.createDynamicsCompressor();
                comp.threshold.value = -14; comp.ratio.value = 4;
                this.master.connect(comp); comp.connect(this.ctx.destination);
                this.sfxGain = this.ctx.createGain();
                this.sfxGain.gain.value = 0.9;
                this.sfxGain.connect(this.master);
                this.musicGain = this.ctx.createGain();
                this.musicGain.gain.value = 0.62;
                this.musicGain.connect(this.master);
                const len = this.ctx.sampleRate * 1.5;
                this._noise = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
                const d = this._noise.getChannelData(0);
                for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
            } catch (e) { this.ctx = null; }
        }
        return this.ctx;
    }

    setMuted(m) {
        this.muted = m;
        if (this.master) this.master.gain.value = m ? 0 : 0.8 * this._vol;
        if (this._voicePlayer) this._voicePlayer.muted = m;
    }

    // Short character voice clips; use a shuffle bag so each fall or lava hit varies.
    playVoice(kind) {
        const files = this._voiceFiles[kind];
        if (!files || !this._unlocked || this.muted) return false;
        const now = performance.now();
        const gap = kind === 'lava' ? 900 : 700;
        if (now - (this._voiceCooldown[kind] || 0) < gap) return false;

        const player = this._voicePlayer;
        // Let the current spoken line finish; never interrupt or overlap character dialogue.
        if (player && !player.paused && !player.ended) return false;

        let bag = this._voiceBag[kind];
        if (!bag || bag.length === 0) {
            bag = files.map((_, i) => i);
            for (let i = bag.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [bag[i], bag[j]] = [bag[j], bag[i]];
            }
            const previous = this._voiceLastLine[kind];
            if (files.length > 1 && files[bag[0]] === previous) [bag[0], bag[1]] = [bag[1], bag[0]];
            this._voiceBag[kind] = bag;
        }
        const src = this.url(files[bag.pop()]);
        this._voiceLastLine[kind] = src;
        this._voiceCooldown[kind] = now;
        const voice = this._voicePlayer || (this._voicePlayer = new Audio());
        voice.pause();
        voice.src = src;
        voice.preload = 'auto';
        voice.volume = 0.78 * this._vol;
        voice.muted = this.muted;
        voice.play().catch(() => { });
        return true;
    }
    stopVoice() {
        if (!this._voicePlayer) return;
        this._voicePlayer.pause();
        this._voicePlayer.currentTime = 0;
    }

    // ---------------- music (Chiptune) ----------------
    playMenuMusic() {
        this._want = 'menu';
        this.stopBossMusic(false, true);
        this.stopDrone();
        if (!this._unlocked || !this.chip) return;
        this.chip.play('toccata', 1.2);
    }
    playGameMusic(level = this._level) {
        if (Number.isFinite(level)) this._level = Math.max(1, Math.floor(level));
        this._want = 'game';
        this.stopBossMusic(false, true);
        this.startDrone();
        if (!this._unlocked || !this.chip) return;
        // every tower starts the theme a little quicker
        this.chip.bpmMul = 1 + Math.min(0.25, (this._level - 1) * 0.05);
        this.chip.play('climb', 0.4);
    }
    // 0..1: how close the lava is (the Mountain King speeds up and the drums come in)
    musicTension(k) { if (this._chip) this._chip.setTension(k); }
    // Silence every music track for a cinematic beat; the next play*Music call restores one.
    fadeOutMusic() {
        this._want = null;
        if (this._chip) this._chip.stop(0.7);
    }
    duckMusic(on) {
        if (this._chip) this._chip.duck(on);
    }

    // ---------------- boss music: use the dedicated looping boss-level track ----------------
    playBossMusic(kind) {
        this._want = 'boss';
        this._bossKind = kind || 0;
        this.stopDrone();
        if (!this._unlocked || !this.chip) return;
        this.chip.bpmMul = 1;
        this.chip.play('boss', 0.5);
    }
    bossRage(on) { if (this._chip && this._want === 'boss') this._chip.bpmMul = on ? 1.16 : 1; }
    stopBossMusic(now, keepMusic = false) {
        if (this._want === 'boss' && !keepMusic && this._chip) this._chip.stop(now ? 0.05 : 0.5);
    }

    // ---------------- ambience: a low drone under the tower, bells and whispers on cue ----------------
    startDrone() {
        this._wantDrone = true;
        if (!this.ctx || this._drone) return;
        const c = this.ctx, t = c.currentTime;
        const out = c.createGain(); out.gain.setValueAtTime(0.0001, t); out.gain.exponentialRampToValueAtTime(0.05, t + 3);
        const f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 220; f.Q.value = 3;
        const lfo = c.createOscillator(), lg = c.createGain(); lfo.frequency.value = 0.07; lg.gain.value = 110; lfo.connect(lg); lg.connect(f.frequency);
        const oscs = [];
        for (const [fr, type] of [[55, 'sawtooth'], [55.4, 'sawtooth'], [82.4, 'triangle'], [27.5, 'sine']]) {
            const o = c.createOscillator(); o.type = type; o.frequency.value = fr; o.connect(f); o.start(); oscs.push(o);
        }
        f.connect(out); out.connect(this.master);
        lfo.start();
        this._drone = { out, oscs: oscs.concat([lfo]) };
    }
    stopDrone() {
        this._wantDrone = false;
        const d = this._drone;
        if (!d || !this.ctx) return;
        this._drone = null;
        const t = this.ctx.currentTime;
        d.out.gain.cancelScheduledValues(t);
        d.out.gain.setValueAtTime(Math.max(0.0001, d.out.gain.value), t);
        d.out.gain.exponentialRampToValueAtTime(0.0001, t + 1.2);
        setTimeout(() => { d.oscs.forEach(o => { try { o.stop(); } catch (_) { } }); try { d.out.disconnect(); } catch (_) { } }, 1400);
    }
    _bell(vol, f0) {
        const c = this.ctx, t = c.currentTime;
        const partials = [[0.5, 0.5, 4.5], [1, 1, 3.5], [1.19, 0.6, 2.6], [1.5, 0.45, 2.2], [2.0, 0.4, 1.8], [2.74, 0.22, 1.3], [3.76, 0.12, 0.9]];
        const f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 2400;
        f.connect(this.sfxGain);
        for (const [m, a, d] of partials) {
            const o = c.createOscillator(), g = c.createGain();
            o.type = 'sine'; o.frequency.value = f0 * m;
            g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol * a, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
            o.connect(g); g.connect(f); o.start(t); o.stop(t + d + 0.1);
        }
    }
    _whisper() {
        const c = this.ctx, t = c.currentTime;
        for (let k = 0; k < 3; k++) {
            const s = c.createBufferSource(); s.buffer = this._noise;
            const f = c.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = 9;
            const f0 = 900 + Math.random() * 1600;
            f.frequency.setValueAtTime(f0, t + k * 0.35); f.frequency.linearRampToValueAtTime(f0 * (0.7 + Math.random() * 0.6), t + k * 0.35 + 0.6);
            const g = c.createGain(); g.gain.setValueAtTime(0.0001, t + k * 0.35); g.gain.exponentialRampToValueAtTime(0.12, t + k * 0.35 + 0.2); g.gain.exponentialRampToValueAtTime(0.0001, t + k * 0.35 + 0.7);
            const p = c.createStereoPanner ? c.createStereoPanner() : null;
            s.connect(f); f.connect(g);
            if (p) { p.pan.value = (Math.random() - 0.5) * 1.6; g.connect(p); p.connect(this.sfxGain); } else g.connect(this.sfxGain);
            s.start(t + k * 0.35, Math.random()); s.stop(t + k * 0.35 + 0.8);
        }
    }

    // ---------------- sfx helpers ----------------
    _ok(name, gap) {
        if (!this.ctx || this.muted) return false;
        const now = performance.now();
        if (now - (this._last[name] || 0) < gap) return false;
        this._last[name] = now;
        return true;
    }
    _env(g, t, a, peak, d, sustain = 0) {
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(peak, t + a);
        g.gain.exponentialRampToValueAtTime(Math.max(0.0001, sustain || 0.0001), t + a + d);
    }
    _tone(type, f0, f1, dur, vol, t0 = 0, dest) {
        const c = this.ctx, t = c.currentTime + t0;
        const o = c.createOscillator(), g = c.createGain();
        o.type = type;
        o.frequency.setValueAtTime(f0, t);
        if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
        this._env(g, t, 0.005, vol, dur);
        o.connect(g); g.connect(dest || this.sfxGain);
        o.start(t); o.stop(t + dur + 0.05);
    }
    _noiseHit(filterType, f0, f1, q, dur, vol, t0 = 0, attack = 0.005) {
        const c = this.ctx, t = c.currentTime + t0;
        const s = c.createBufferSource(); s.buffer = this._noise;
        s.playbackRate.value = 1;
        const f = c.createBiquadFilter(); f.type = filterType; f.Q.value = q;
        f.frequency.setValueAtTime(f0, t);
        f.frequency.exponentialRampToValueAtTime(Math.max(30, f1), t + dur);
        const g = c.createGain();
        this._env(g, t, attack, vol, dur);
        s.connect(f); f.connect(g); g.connect(this.sfxGain);
        s.start(t, Math.random() * 0.5); s.stop(t + dur + attack + 0.05);
    }

    sfx(name, arg) {
        switch (name) {
            case 'jump': if (this._ok(name, 60)) { this._tone('triangle', 260, 520, 0.14, 0.18); this._noiseHit('highpass', 1800, 3000, 0.7, 0.08, 0.05); } break;
            case 'land': if (this._ok(name, 80)) { const v = Math.min(0.45, 0.12 + (arg || 0) * 0.015); this._tone('sine', 120, 45, 0.16, v); this._noiseHit('lowpass', 900, 200, 0.8, 0.12, v * 0.5); } break;
            case 'step': if (this._ok(name, 90)) { this._noiseHit('bandpass', 700 + Math.random() * 300, 400, 2, 0.05, 0.05); this._tone('sine', 90, 60, 0.05, 0.05); } break;
            case 'swing': if (this._ok(name, 80)) { this._noiseHit('bandpass', 700, 3200, 1.5, 0.22, 0.28, 0, 0.04); } break;
            case 'hit': if (this._ok(name, 40)) { this._tone('square', 320, 90, 0.12, 0.12); this._noiseHit('bandpass', 2500, 800, 1.5, 0.12, 0.22); } break;
            case 'clang': if (this._ok(name, 60)) { this._tone('triangle', 1250, 1150, 0.35, 0.16); this._tone('sine', 2480, 2400, 0.3, 0.08); this._noiseHit('highpass', 4000, 3000, 1, 0.1, 0.15); } break;
            case 'bones': if (this._ok(name, 60)) { for (let i = 0; i < 6; i++) this._noiseHit('bandpass', 1800 + Math.random() * 1600, 900, 6, 0.05, 0.16, i * 0.045 + Math.random() * 0.02); } break;
            case 'squeak': if (this._ok(name, 80)) { this._tone('sine', 1900, 2600, 0.08, 0.12); this._tone('sine', 2400, 1500, 0.1, 0.1, 0.09); } break;
            case 'screech': if (this._ok(name, 80)) { this._tone('sawtooth', 3200, 1900, 0.18, 0.06); this._noiseHit('highpass', 5000, 3000, 2, 0.15, 0.08); } break;
            case 'squish': if (this._ok(name, 80)) { this._noiseHit('lowpass', 1200, 200, 3, 0.18, 0.3); this._tone('sine', 200, 60, 0.15, 0.15); } break;
            case 'coin': if (this._ok(name, 35)) { const b = 1 + (arg || 0) * 0.02; this._tone('square', 988 * b, 988 * b, 0.07, 0.07); this._tone('square', 1319 * b, 1319 * b, 0.18, 0.07, 0.06); } break;
            case 'key': if (this._ok(name, 200)) { [523, 659, 784, 1047, 1319].forEach((f, i) => this._tone('triangle', f, f, 0.35, 0.14, i * 0.07)); } break;
            case 'treasure': if (this._ok(name, 200)) { this._noiseHit('lowpass', 600, 200, 1, 0.3, 0.25); [392, 523, 659, 784, 1047].forEach((f, i) => { this._tone('triangle', f, f, 0.45, 0.13, 0.12 + i * 0.06); this._tone('sine', f * 2, f * 2, 0.3, 0.05, 0.12 + i * 0.06); }); } break;
            case 'hourglass': if (this._ok(name, 200)) { for (let i = 0; i < 8; i++) this._tone('sine', 1800 - i * 150, 1700 - i * 150, 0.3, 0.07, i * 0.04); this._tone('sine', 200, 80, 1.2, 0.15); } break;
            case 'heart': if (this._ok(name, 200)) { [659, 784, 988].forEach((f, i) => this._tone('sine', f, f, 0.3, 0.14, i * 0.08)); } break;
            case 'hurt': if (this._ok(name, 150)) { this._tone('sawtooth', 300, 90, 0.3, 0.2); this._noiseHit('lowpass', 1800, 300, 1, 0.25, 0.25); } break;
            case 'die': if (this._ok(name, 300)) { this._tone('sawtooth', 392, 60, 0.9, 0.22); this._tone('square', 196, 40, 1.0, 0.1, 0.05); this._noiseHit('lowpass', 800, 100, 1, 0.8, 0.2); } break;
            case 'burn': if (this._ok(name, 300)) { this._noiseHit('lowpass', 3000, 300, 0.5, 1.2, 0.4, 0, 0.05); this._tone('sawtooth', 300, 50, 1.0, 0.15); } break;
            case 'win': if (this._ok(name, 400)) { [523, 659, 784, 1047, 784, 1047, 1319].forEach((f, i) => { this._tone('triangle', f, f, 0.3, 0.15, i * 0.11); this._tone('sine', f / 2, f / 2, 0.3, 0.08, i * 0.11); }); } break;
            case 'lava': if (this._ok(name, 500)) { this._tone('sine', 55, 35, 0.5, 0.35); this._noiseHit('lowpass', 300, 80, 1, 0.5, 0.25); } break;
            case 'crumble': if (this._ok(name, 120)) { for (let i = 0; i < 4; i++) this._noiseHit('lowpass', 900, 150, 1, 0.2, 0.22, i * 0.06); this._tone('sine', 80, 40, 0.3, 0.2); } break;
            case 'roar': if (this._ok(name, 700)) { this._noiseHit('bandpass', 380, 140, 2.5, 0.9, 0.35, 0, 0.08); this._tone('sawtooth', 110, 60, 0.9, 0.12, 0, null); this._tone('sawtooth', 165, 70, 0.8, 0.07, 0.05); } break;
            case 'fire': if (this._ok(name, 100)) { this._noiseHit('lowpass', 2000, 400, 0.7, 0.4, 0.2, 0, 0.03); } break;
            case 'boom': if (this._ok(name, 80)) { this._tone('sine', 110, 35, 0.45, 0.35); this._noiseHit('lowpass', 1500, 120, 0.8, 0.45, 0.35); } break;
            case 'door': if (this._ok(name, 300)) { this._noiseHit('lowpass', 400, 120, 2, 0.8, 0.25, 0, 0.1); this._tone('sawtooth', 70, 55, 0.8, 0.06); } break;
            case 'gate': if (this._ok(name, 500)) { this._noiseHit('lowpass', 500, 150, 3, 1.4, 0.3, 0, 0.2); [262, 392, 523].forEach((f, i) => this._tone('triangle', f, f, 0.9, 0.1, 0.3 + i * 0.15)); } break;
            case 'thunder': if (this._ok(name, 1500)) { this._noiseHit('lowpass', 300, 40, 0.5, 2.2, 0.35, 0.25, 0.02); this._noiseHit('lowpass', 1200, 100, 0.5, 0.6, 0.15, 0.2); } break;
            case 'beep': if (this._ok(name, 200)) { this._tone('square', arg ? 1046 : 523, arg ? 1046 : 523, arg ? 0.35 : 0.14, 0.12); } break;
            case 'ui': if (this._ok(name, 60)) { this._tone('triangle', 660, 880, 0.08, 0.1); } break;
            // ---- guardians
            case 'growl': if (this._ok(name, 300)) { this._noiseHit('bandpass', 260, 130, 3, 0.75, 0.4, 0, 0.08); this._tone('sawtooth', 82, 58, 0.7, 0.13); this._tone('sawtooth', 123, 80, 0.6, 0.06, 0.05); } break;
            case 'bossroar': if (this._ok(name, 700)) { this._noiseHit('bandpass', 520, 120, 2.2, 1.5, 0.55, 0, 0.12); this._tone('sawtooth', 130, 52, 1.4, 0.2); this._tone('sawtooth', 196, 70, 1.2, 0.1, 0.04); this._tone('sine', 62, 34, 1.5, 0.35); } break;
            case 'summon': if (this._ok(name, 600)) { this._tone('sine', 180, 720, 1.3, 0.12); this._tone('sine', 190, 760, 1.3, 0.1, 0.05); this._noiseHit('highpass', 1200, 5000, 1, 1.2, 0.12, 0, 0.4); this._tone('sawtooth', 55, 50, 1.4, 0.12); } break;
            case 'slam': if (this._ok(name, 120)) { this._tone('sine', 95, 28, 0.7, 0.6); this._noiseHit('lowpass', 2200, 90, 0.8, 0.6, 0.55); this._tone('square', 60, 30, 0.25, 0.12); for (let i = 0; i < 4; i++) this._noiseHit('lowpass', 900, 150, 1, 0.18, 0.15, 0.08 + i * 0.07); } break;
            case 'hiss': if (this._ok(name, 250)) { this._noiseHit('highpass', 2800, 5200, 1.2, 0.6, 0.3, 0, 0.08); } break;
            case 'stab': if (this._ok(name, 100)) { this._noiseHit('bandpass', 1600, 400, 2, 0.14, 0.4); this._tone('sine', 160, 45, 0.25, 0.4); } break;
            case 'screechBig': if (this._ok(name, 500)) { this._tone('sawtooth', 1900, 850, 0.6, 0.12); this._tone('sawtooth', 2500, 1100, 0.55, 0.08, 0.03); this._noiseHit('highpass', 4000, 2500, 2, 0.5, 0.15); } break;
            case 'web': if (this._ok(name, 90)) { this._noiseHit('lowpass', 3200, 400, 1, 0.16, 0.3); this._tone('sine', 700, 180, 0.12, 0.1); } break;
            case 'hatch': if (this._ok(name, 90)) { for (let i = 0; i < 3; i++) this._noiseHit('bandpass', 2600, 1200, 5, 0.05, 0.25, i * 0.05); this._noiseHit('lowpass', 1000, 200, 3, 0.2, 0.25, 0.12); } break;
            case 'enrage': if (this._ok(name, 1500)) { this._noiseHit('bandpass', 600, 110, 2, 1.8, 0.6, 0, 0.15); [110, 116.5, 155.6, 164.8].forEach((f, i) => this._tone('sawtooth', f, f * 0.8, 1.6, 0.08, i * 0.03)); this._tone('sine', 55, 30, 1.8, 0.4); } break;
            case 'fireblast': if (this._ok(name, 300)) { this._noiseHit('lowpass', 1800, 500, 0.8, 1.4, 0.45, 0, 0.12); this._noiseHit('bandpass', 700, 300, 1.5, 1.2, 0.2, 0.1, 0.1); } break;
            case 'shock': if (this._ok(name, 150)) { this._tone('square', 900, 180, 0.3, 0.08); this._noiseHit('highpass', 3000, 1500, 2, 0.25, 0.15); } break;
            case 'bosshit': if (this._ok(name, 50)) { this._tone('square', 190, 60, 0.16, 0.2); this._noiseHit('lowpass', 1500, 180, 1, 0.22, 0.45); this._noiseHit('bandpass', 3200, 1400, 3, 0.08, 0.2); } break;
            case 'reflect': if (this._ok(name, 80)) { this._tone('triangle', 1400, 2100, 0.2, 0.14); this._tone('sine', 2800, 2700, 0.35, 0.06); this._noiseHit('highpass', 4500, 3000, 1, 0.15, 0.12); } break;
            case 'bossdie': if (this._ok(name, 2000)) { this._noiseHit('bandpass', 480, 60, 1.8, 3.2, 0.6, 0, 0.1); this._tone('sawtooth', 150, 28, 3.0, 0.2); this._tone('sawtooth', 224, 40, 2.6, 0.1, 0.1); this._tone('sine', 58, 22, 3.4, 0.45); this._noiseHit('lowpass', 900, 50, 0.5, 3.5, 0.35, 0.5, 0.2); } break;
            case 'victory': if (this._ok(name, 1000)) { [262, 330, 392, 523, 392, 523, 659, 784].forEach((f, i) => { this._tone('triangle', f, f, 0.45, 0.14, 0.2 + i * 0.13); this._tone('sawtooth', f / 2, f / 2, 0.4, 0.04, 0.2 + i * 0.13); }); this._bell(0.12, 262); } break;
            // ---- dread
            case 'bell': if (this._ok(name, 2500) && this.ctx) { this._bell(arg || 0.09, 98); } break;
            case 'whisper': if (this._ok(name, 4000) && this.ctx) { this._whisper(); } break;
            case 'heartbeat': if (this._ok(name, 500)) { this._tone('sine', 62, 38, 0.14, 0.45); this._tone('sine', 58, 36, 0.12, 0.32, 0.2); } break;
            // siege weapons in the guardian's hall
            case 'cannon': if (this._ok(name, 150)) { this._tone('sine', 75, 24, 0.9, 0.75); this._noiseHit('lowpass', 2600, 70, 0.7, 0.9, 0.7, 0, 0.004); this._noiseHit('bandpass', 900, 200, 1.2, 0.35, 0.35, 0.02); this._tone('square', 48, 30, 0.3, 0.15); } break;
            case 'fuse': if (this._ok(name, 120)) { this._noiseHit('highpass', 5200, 7000, 1.5, 0.32, 0.18, 0, 0.01); this._noiseHit('bandpass', 3400, 2200, 4, 0.3, 0.1, 0.05); } break;
            case 'pickup': if (this._ok(name, 120)) { this._tone('triangle', 330, 660, 0.12, 0.16); this._tone('triangle', 494, 988, 0.14, 0.12, 0.07); this._noiseHit('bandpass', 1200, 900, 3, 0.08, 0.1); } break;
            case 'throw': if (this._ok(name, 100)) { this._noiseHit('bandpass', 500, 2400, 1.2, 0.28, 0.3, 0, 0.05); this._tone('sine', 240, 420, 0.2, 0.08); } break;
            case 'explosion': if (this._ok(name, 70)) { this._tone('sine', 90, 22, 1.1, 0.8); this._noiseHit('lowpass', 3200, 60, 0.6, 1.2, 0.75, 0, 0.004); this._noiseHit('bandpass', 1400, 250, 1, 0.5, 0.35, 0.03); for (let i = 0; i < 5; i++) this._noiseHit('lowpass', 1200, 200, 1, 0.12, 0.12, 0.15 + i * 0.09 + Math.random() * 0.04); } break;
            case 'reload': if (this._ok(name, 400)) { this._noiseHit('bandpass', 2200, 1600, 6, 0.06, 0.25); this._tone('square', 700, 700, 0.05, 0.08, 0.08); this._noiseHit('bandpass', 1500, 900, 6, 0.08, 0.28, 0.14); } break;
            // ---- ground-pound, slapstick falls, combo, title
            case 'dive': if (this._ok(name, 120)) { this._tone('triangle', 520, 1100, 0.12, 0.12); this._noiseHit('bandpass', 2400, 500, 1.2, 0.35, 0.3, 0.1, 0.12); } break;
            case 'smash': if (this._ok(name, 80)) {
                const p = Math.min(1.4, arg || 0.5);
                this._tone('sine', 120, 26, 0.6 + p * 0.5, 0.55 + p * 0.25);
                this._noiseHit('lowpass', 2600 + p * 1200, 70, 0.7, 0.5 + p * 0.5, 0.5 + p * 0.25, 0, 0.003);
                this._tone('square', 70, 32, 0.25, 0.14);
                for (let i = 0; i < 3 + Math.round(p * 4); i++) this._noiseHit('lowpass', 1100, 160, 1, 0.14, 0.14, 0.08 + i * 0.07 + Math.random() * 0.03);
                if (p > 0.6) this._tone('triangle', 1250, 1150, 0.4, 0.07, 0.02);
            } break;
            case 'splat': if (this._ok(name, 120)) { this._tone('sine', 150, 40, 0.25, 0.45); this._noiseHit('lowpass', 1400, 150, 1, 0.22, 0.4); this._tone('triangle', 1350, 1200, 0.45, 0.1, 0.03); this._tone('sine', 2650, 2600, 0.4, 0.05, 0.03); } break;
            case 'oof': if (this._ok(name, 300)) { this._voice([[310, 0], [180, 0.22]], 0.26, 0.22, [[600, 8], [1000, 9], [2400, 10]], 0.04); } break;
            case 'scream': if (this._ok(name, 900) && !this._scream) { this._scream = this._voice([[420, 0], [470, 0.25], [440, 0.9], [360, 1.6]], 1.7, 0.2, [[820, 7], [1250, 8], [2600, 10]], 0.12, 7); } break;
            case 'combo': if (this._ok(name, 90)) { const l = Math.max(2, Math.min(8, arg || 2)); const b = 440 * Math.pow(1.122, l - 2); [1, 1.26, 1.5, 2].forEach((m, i) => this._tone('square', b * m, b * m, 0.12, 0.06, i * 0.045)); this._tone('triangle', b * 2, b * 2, 0.3, 0.08, 0.18); } break;
            case 'titleSlam': if (this._ok(name, 800)) { this._tone('sine', 90, 24, 1.3, 0.8); this._noiseHit('lowpass', 3000, 60, 0.6, 1.2, 0.6, 0, 0.004); [131, 196, 262, 330].forEach((f, i) => { this._tone('sawtooth', f, f, 1.6, 0.06, 0.02 + i * 0.01); }); this._bell(0.1, 131); } break;
            case 'whoosh': if (this._ok(name, 300)) { this._noiseHit('bandpass', 300, 2600, 1.4, 0.9, 0.32, 0, 0.35); } break;
        }
    }

    // a formant-filtered "voice": pitch points [[f, time]], vowel formants [[freq, Q]]
    _voice(pitch, dur, vol, formants, attack, vib = 5) {
        if (!this.ctx) return null;
        const c = this.ctx, t = c.currentTime;
        const src = c.createOscillator(); src.type = 'sawtooth';
        src.frequency.setValueAtTime(pitch[0][0], t);
        for (let i = 1; i < pitch.length; i++) src.frequency.linearRampToValueAtTime(pitch[i][0], t + pitch[i][1]);
        const lfo = c.createOscillator(), lg = c.createGain(); lfo.frequency.value = vib; lg.gain.value = pitch[0][0] * 0.035;
        lfo.connect(lg); lg.connect(src.frequency);
        const out = c.createGain();
        out.gain.setValueAtTime(0.0001, t);
        out.gain.exponentialRampToValueAtTime(vol, t + attack);
        out.gain.setValueAtTime(vol, t + Math.max(attack, dur - 0.25));
        out.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        formants.forEach(([f, q], i) => {
            const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = f; bp.Q.value = q;
            const g = c.createGain(); g.gain.value = [1, 0.6, 0.25][i] || 0.2;
            src.connect(bp); bp.connect(g); g.connect(out);
        });
        out.connect(this.sfxGain);
        src.start(t); lfo.start(t); src.stop(t + dur + 0.05); lfo.stop(t + dur + 0.05);
        const v = { out, src, end: t + dur };
        src.onended = () => { if (this._scream === v) this._scream = null; try { out.disconnect(); } catch (_) { } };
        return v;
    }
    // cut the scream short when the knight hits the ground
    screamStop() {
        const v = this._scream;
        if (!v || !this.ctx) { this._scream = null; return; }
        this._scream = null;
        const t = this.ctx.currentTime;
        if (t >= v.end) return;
        v.out.gain.cancelScheduledValues(t);
        v.out.gain.setValueAtTime(Math.max(0.0001, v.out.gain.value), t);
        v.out.gain.exponentialRampToValueAtTime(0.0001, t + 0.06);
        try { v.src.stop(t + 0.08); } catch (_) { }
    }
    get screaming() { return !!this._scream; }
}

const AudioManager = new AudioManagerClass();
return { AudioManager };
})(__chiptune);


// ======================================================================
//  markup.js
// ======================================================================
const __markup = (() => {
// The arcade's DOM: the game's own markup and styles (adjusted for the arcade and dressed up for Halloween) and
// the cabinet frame around the screen. Everything lives in a shadow root, apart from the page.
const ARCADE_CSS = `/* Dark-fantasy HUD: gilded type on soot-black stone, ember accents. Portrait first. */
:host {
  --ink: #0b0612;
  --stone: rgba(18, 8, 28, 0.74);
  --stone-solid: #170a24;
  --gold: #ff9a2e;
  --gold-hi: #ffd08a;
  --gold-lo: #a2490e;
  --ember: #ff6a1f;
  --blood: #d02a1d;
  --bone: #f2e6dc;
  --frost: #7fe8ff;
  --muted: #b9a6cc;
  --slime: #8dff4a;
  --violet: #a95cff;
  --display: 'Cinzel Decorative', 'Cinzel', Georgia, 'Times New Roman', serif;
  --spooky: 'Creepster', 'Cinzel Decorative', Georgia, serif;
  --ui: 'Cinzel', Georgia, 'Times New Roman', serif;
  --pix: 'VT323', 'Courier New', monospace;
  color-scheme: dark;
}
#app { position: absolute; inset: 0; overflow: hidden; background: var(--ink); container-type: size; touch-action: none; user-select: none; -webkit-user-select: none; -webkit-touch-callout: none; font-family: var(--ui); color: var(--bone); -webkit-tap-highlight-color: transparent; }
#gl { position: absolute; inset: 0; width: 100%; height: 100%; display: block; }
button { font-family: var(--ui); color: inherit; }
.hidden { display: none !important; }

/* ---------- HUD ---------- */
#hud { position: absolute; inset: 0; pointer-events: none; }
.topbar {
  position: absolute; left: 0; right: 0; top: 0;
  padding: calc(env(safe-area-inset-top, 0px) + 10px) 14px 18px;
  display: grid; grid-template-columns: 1fr auto 1fr; align-items: start; gap: 10px;
  background: linear-gradient(180deg, rgba(9,4,16,0.82) 0%, rgba(9,4,16,0.45) 60%, rgba(9,4,16,0) 100%);
}
.hud-label { font-size: 10px; letter-spacing: 0.22em; color: var(--muted); font-weight: 700; }
#score { font-family: var(--ui); font-weight: 900; font-size: 26px; line-height: 1; color: var(--gold-hi); text-shadow: 0 2px 0 #2a0c3a, 0 0 14px rgba(255,170,60,0.35); font-variant-numeric: tabular-nums; }
#level-tag { margin-top: 4px; font-size: 11px; letter-spacing: 0.18em; color: var(--gold); font-weight: 700; }
.greed { display: flex; flex-direction: column; align-items: center; gap: 4px; min-width: 104px; }
.greed-bar { position: relative; width: 104px; height: 10px; border-radius: 6px; background: rgba(0,0,0,0.6); border: 1px solid rgba(255,150,50,0.55); overflow: hidden; box-shadow: inset 0 1px 3px rgba(0,0,0,0.8); }
#greed-fill { position: absolute; left: 0; top: 0; bottom: 0; width: 0%; background: linear-gradient(90deg, #ffd36e, #ff8a2a 55%, #ff3d12); box-shadow: 0 0 10px rgba(255,120,40,0.8); transition: width 0.25s ease-out; }
#greed-pct { font-size: 12px; font-weight: 900; color: var(--ember); letter-spacing: 0.08em; font-variant-numeric: tabular-nums; }
.greed.pulse #greed-pct { animation: pop 0.3s ease-out; }
@keyframes pop { 0% { transform: scale(1.5); } 100% { transform: scale(1); } }
.right-stats { justify-self: end; display: flex; flex-direction: column; align-items: flex-end; gap: 6px; padding-right: 42px; }
#hearts, #lives { display: flex; gap: 3px; }
#hearts svg { width: 18px; height: 16px; filter: drop-shadow(0 1px 0 rgba(0,0,0,0.8)); }
#hearts svg.lost { opacity: 0.25; filter: grayscale(1); }
#hearts.hit { animation: shake 0.35s; }
@keyframes shake { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-4px); } 75% { transform: translateX(4px); } }
#lives svg { width: 15px; height: 15px; opacity: 0.95; }
#key-slot { width: 22px; height: 22px; opacity: 0.28; filter: grayscale(1); transition: all 0.3s; }
#key-slot.have { opacity: 1; filter: drop-shadow(0 0 6px rgba(255,200,80,0.9)); }
.stat-row { display: flex; gap: 8px; align-items: center; }
#pause-btn {
  position: absolute; top: calc(env(safe-area-inset-top, 0px) + 10px); right: 12px; pointer-events: auto;
  width: 38px; height: 38px; border-radius: 50%; border: 1px solid rgba(255,150,50,0.6); background: rgba(12,6,20,0.6);
  display: grid; place-items: center; cursor: pointer;
}
#pause-btn svg { width: 14px; height: 14px; }

#meter { position: absolute; right: 10px; top: 28%; height: 40%; width: 8px; border-radius: 5px; background: rgba(0,0,0,0.55); border: 1px solid rgba(255,150,50,0.35); overflow: visible; }
#meter-lava { position: absolute; left: 0; right: 0; bottom: 0; height: 0%; border-radius: 0 0 5px 5px; background: linear-gradient(0deg, #ff3a0e, #ffae42); box-shadow: 0 0 8px rgba(255,90,20,0.8); }
#meter-knight { position: absolute; left: 50%; width: 18px; height: 18px; margin: 0 0 -9px -9px; bottom: 0%; border-radius: 50%; background: var(--bone); border: 2px solid var(--gold); box-shadow: 0 0 6px rgba(0,0,0,0.8); }
#meter-gate { position: absolute; left: 50%; top: -12px; width: 12px; height: 12px; margin-left: -6px; }
#meter-key { position: absolute; left: -16px; width: 12px; height: 12px; margin-bottom: -6px; }

#center-msg { position: absolute; left: 0; right: 0; top: 38%; text-align: center; font-family: var(--display); font-weight: 900; font-size: 84px; color: var(--gold-hi); text-shadow: 0 4px 0 #2a0a38, 0 0 30px rgba(255,140,40,0.6); pointer-events: none; opacity: 0; transform: scale(0.6); transition: opacity 0.2s, transform 0.25s cubic-bezier(.2,1.6,.4,1); }
#center-msg.show { opacity: 1; transform: scale(1); }
#center-msg.small { font-size: 26px; letter-spacing: 0.08em; font-family: var(--ui); }
#sub-msg { position: absolute; left: 16px; right: 16px; top: calc(38% + 96px); text-align: center; font-size: 16px; font-weight: 900; letter-spacing: 0.2em; color: var(--ember); text-shadow: 0 2px 6px #000; opacity: 0; transition: opacity 0.3s; }
#sub-msg.show { opacity: 1; animation: breathe 1.4s ease-in-out infinite; }
@keyframes breathe { 50% { opacity: 0.55; } }
#toast { position: absolute; left: 50%; top: calc(env(safe-area-inset-top, 0px) + 92px); transform: translate(-50%, -10px); max-width: min(88cqw, 420px); padding: 9px 16px; border-radius: 8px; background: var(--stone); border: 1px solid rgba(255,150,50,0.5); font-size: 13px; font-weight: 700; letter-spacing: 0.06em; text-align: center; color: var(--bone); opacity: 0; transition: opacity 0.25s, transform 0.25s; }
#toast.show { opacity: 1; transform: translate(-50%, 0); }
#toast b { color: var(--gold-hi); }
#vignette { position: absolute; inset: 0; pointer-events: none; background: radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 100%); }
#damage { position: absolute; inset: 0; pointer-events: none; box-shadow: inset 0 0 120px 40px rgba(220,30,10,0.0); transition: box-shadow 0.3s; }
#damage.lava { box-shadow: inset 0 0 140px 50px rgba(255,80,10,0.55); }
#damage.hit { box-shadow: inset 0 0 120px 40px rgba(220,20,10,0.7); transition: none; }
#frost { position: absolute; inset: 0; pointer-events: none; background: radial-gradient(ellipse at center, rgba(120,230,255,0.0) 40%, rgba(120,230,255,0.35) 100%); opacity: 0; transition: opacity 0.4s; }
#frost.on { opacity: 1; }
#floaters { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }
.floater span { display: inline-block; animation: fpop 0.4s cubic-bezier(.2,1.9,.4,1); }
@keyframes fpop { 0% { transform: scale(0.3); } 100% { transform: scale(1); } }
.floater { position: absolute; font-weight: 900; font-size: 18px; letter-spacing: 0.04em; color: var(--gold-hi); text-shadow: 0 2px 0 #2a1406, 0 0 8px rgba(0,0,0,0.9); white-space: nowrap; transform: translate(-50%, -50%); }

/* ---------- touch controls ---------- */
@keyframes actGlow { from { box-shadow: 0 0 6px rgba(255,150,40,0.5), 0 4px 14px rgba(0,0,0,0.5); } to { box-shadow: 0 0 26px rgba(255,170,50,0.95), 0 4px 14px rgba(0,0,0,0.5); } }
#act-prompt { position: absolute; left: 50%; bottom: calc(env(safe-area-inset-bottom, 0px) + 58px); transform: translateX(-50%); padding: 7px 14px; border-radius: 999px; background: rgba(40,14,6,0.8); border: 1px solid rgba(255,190,90,0.7); color: #ffe2a0; font-size: 13px; font-weight: 900; letter-spacing: 0.14em; white-space: nowrap; opacity: 0; transition: opacity 0.2s; pointer-events: none; text-shadow: 0 2px 4px #000; }
#act-prompt.show { opacity: 1; }
#act-prompt.touch { left: 50%; right: auto; bottom: calc(env(safe-area-inset-bottom, 0px) + 136px); transform: translateX(-50%); font-size: 11px; padding: 5px 10px; letter-spacing: 0.12em; }
.siege-arrow { position: absolute; top: 58%; width: 54px; height: 44px; display: flex; align-items: center; justify-content: center; gap: 2px; opacity: 0; transition: opacity 0.25s; pointer-events: none; filter: drop-shadow(0 2px 4px #000); }
.siege-arrow.show { opacity: 1; animation: nudge 0.9s ease-in-out infinite; }
.siege-arrow svg { width: 26px; height: 26px; }
#siege-left { left: 6px; }
#siege-right { right: 6px; flex-direction: row-reverse; }
@keyframes nudge { 50% { transform: translateX(var(--nx, 0)); } }
#siege-left { --nx: -5px; } #siege-right { --nx: 5px; }
#act-prompt b { color: #fff; }
#kb-hint { position: absolute; left: 50%; bottom: 16px; transform: translateX(-50%); font-size: 11px; letter-spacing: 0.12em; color: rgba(240,228,201,0.55); white-space: nowrap; }

/* ---------- screens ---------- */
.screen { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; padding: calc(env(safe-area-inset-top, 0px) + 24px) 20px calc(env(safe-area-inset-bottom, 0px) + 24px); text-align: center; }
.screen.dim { background: radial-gradient(ellipse at center, rgba(16,6,28,0.55), rgba(6,2,12,0.9)); }
#menu { justify-content: space-between; background: linear-gradient(180deg, rgba(9,4,16,0.7) 0%, rgba(9,4,16,0) 36%, rgba(9,4,16,0) 55%, rgba(9,4,16,0.85) 100%); }
.logo { margin-top: 4cqh; display: flex; flex-direction: column; align-items: center; }
.logo .l1, .logo .l2 { font-family: var(--display); font-weight: 900; line-height: 0.92; letter-spacing: 0.02em; }
.logo .l1 { font-size: clamp(48px, 17cqw, 100px); text-transform: uppercase; background: linear-gradient(180deg, #fff1c6 0%, #f6c35c 45%, #b3701f 100%); -webkit-background-clip: text; background-clip: text; color: transparent; filter: drop-shadow(0 4px 0 #3b1d06) drop-shadow(0 0 22px rgba(255,150,40,0.35)); }
.logo .l2 { font-size: clamp(30px, 10.5cqw, 84px); white-space: nowrap; text-transform: uppercase; background: linear-gradient(180deg, #ffd2a0 0%, #ff7a2a 50%, #a81d08 100%); -webkit-background-clip: text; background-clip: text; color: transparent; filter: drop-shadow(0 4px 0 #2e0c03) drop-shadow(0 0 22px rgba(255,80,20,0.4)); }
.logo .sub { margin-top: 12px; display: flex; align-items: center; gap: 10px; font-size: 15px; font-weight: 900; letter-spacing: 0.36em; color: var(--gold); padding-left: 0.36em; white-space: nowrap; }
.logo .sub::before, .logo .sub::after { content: ''; width: 36px; height: 1px; background: linear-gradient(90deg, transparent, var(--gold)); }
.logo .sub::after { transform: scaleX(-1); }
.tagline { margin-top: 12px; font-size: 12px; letter-spacing: 0.22em; color: var(--bone); opacity: 0.85; }
.tagline em { font-style: normal; color: var(--ember); }
.menu-actions { display: flex; flex-direction: column; align-items: center; gap: 12px; width: min(300px, 80cqw); margin-bottom: 2cqh; }
.btn { pointer-events: auto; cursor: pointer; width: 100%; padding: 14px 18px; border-radius: 10px; border: 1px solid rgba(255,150,50,0.7); background: linear-gradient(180deg, rgba(52,22,76,0.94), rgba(20,8,34,0.94)); color: var(--gold-hi); font-weight: 900; font-size: 15px; letter-spacing: 0.24em; box-shadow: 0 6px 20px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,200,150,0.18); transition: transform 0.08s, border-color 0.15s; }
.btn:active { transform: scale(0.97); }
.btn:hover, .btn:focus-visible { border-color: var(--gold-hi); outline: none; }
.btn.primary { font-size: 18px; padding: 17px 18px; background: linear-gradient(180deg, #ffab45, #c8440c); color: #1c0d04; border-color: #ffd990; text-shadow: 0 1px 0 rgba(255,230,180,0.5); box-shadow: 0 8px 26px rgba(255,120,30,0.3), inset 0 1px 0 rgba(255,245,210,0.6); }
.btn.ghost { background: rgba(12,6,20,0.55); font-size: 13px; padding: 11px 16px; }
.row { display: flex; gap: 10px; width: 100%; }
.best { font-size: 12px; letter-spacing: 0.2em; color: var(--muted); }
.best b { color: var(--gold-hi); font-variant-numeric: tabular-nums; }
.panel { width: min(360px, 88cqw); max-height: 80cqh; overflow: auto; padding: 22px 20px; border-radius: 14px; background: linear-gradient(180deg, rgba(32,13,50,0.97), rgba(12,5,22,0.97)); border: 1px solid rgba(255,150,50,0.6); box-shadow: 0 20px 60px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,200,150,0.12); display: flex; flex-direction: column; gap: 14px; pointer-events: auto; }
.panel h2 { margin: 0; font-family: var(--display); font-weight: 900; font-size: 26px; color: var(--gold-hi); letter-spacing: 0.04em; text-wrap: balance; }
.panel p { margin: 0; font-size: 14px; line-height: 1.55; color: var(--bone); }
.panel .muted { color: var(--muted); font-size: 12px; letter-spacing: 0.1em; }
.panel a { color: var(--gold-hi); }
.howto { text-align: left; display: grid; gap: 10px; font-size: 13.5px; line-height: 1.45; }
.howto div { display: grid; grid-template-columns: 28px 1fr; gap: 8px; align-items: start; }
.howto svg { width: 22px; height: 22px; }
.keys { font-size: 11.5px; color: var(--muted); letter-spacing: 0.06em; line-height: 1.6; }
.stats { display: grid; grid-template-columns: 1fr auto; gap: 6px 16px; text-align: left; font-size: 14px; }
.stats span:nth-child(even) { text-align: right; color: var(--gold-hi); font-weight: 900; font-variant-numeric: tabular-nums; }
.stats .total { border-top: 1px solid rgba(255,150,50,0.35); padding-top: 8px; font-size: 16px; }
.death-title { font-family: var(--display); font-weight: 900; font-size: clamp(28px, 8cqw, 40px); color: #ff5a3a; text-shadow: 0 3px 0 #2a0703, 0 0 24px rgba(255,40,10,0.5); text-wrap: balance; }
.icon-btn { pointer-events: auto; cursor: pointer; width: 42px; height: 42px; border-radius: 50%; border: 1px solid rgba(255,150,50,0.55); background: rgba(12,6,20,0.55); display: grid; place-items: center; }
.icon-btn svg { width: 18px; height: 18px; }
#menu-top { position: absolute; top: calc(env(safe-area-inset-top, 0px) + 12px); right: 12px; }
#loading { background: var(--ink); z-index: 20; gap: 18px; }
#loading .bar { width: 180px; height: 4px; border-radius: 2px; background: rgba(255,150,50,0.2); overflow: hidden; }
#loading .bar i { display: block; height: 100%; width: 30%; background: var(--gold); animation: load 1s ease-in-out infinite alternate; }
@keyframes load { from { transform: translateX(-100%); } to { transform: translateX(330%); } }
#loading .t { font-family: var(--display); font-size: 22px; color: var(--gold); letter-spacing: 0.08em; }
#error { z-index: 30; background: var(--ink); }
/* ---------- guardian fight ---------- */
#hud.boss .greed { visibility: hidden; }
#hud.boss #meter { display: none; }
#hud.boss #toast { top: calc(env(safe-area-inset-top, 0px) + 132px); }
#bossbar { position: absolute; left: 50%; transform: translateX(-50%); top: calc(env(safe-area-inset-top, 0px) + 78px); width: min(84cqw, 440px); text-align: center; pointer-events: none; }
#boss-name { font-family: var(--display); font-weight: 900; font-size: 15px; letter-spacing: 0.1em; color: #ffd6c2; text-shadow: 0 2px 0 #2a0703, 0 0 12px rgba(255,40,10,0.65); margin-bottom: 6px; }
.bb-frame { position: relative; height: 14px; border-radius: 3px; background: rgba(12,2,2,0.85); border: 2px solid #120403; box-shadow: 0 0 0 1px rgba(255,150,50,0.65), 0 4px 16px rgba(0,0,0,0.7); overflow: hidden; }
#boss-lag { position: absolute; left: 0; top: 0; bottom: 0; width: 100%; background: #ffe7b0; transition: width 0.55s ease-in 0.3s; }
#boss-fill { position: absolute; left: 0; top: 0; bottom: 0; width: 100%; background: linear-gradient(180deg, #ff6a44 0%, #c01a10 55%, #720905 100%); box-shadow: inset 0 1px 0 rgba(255,210,180,0.55); transition: width 0.1s; }
.bb-notch { position: absolute; left: 50%; top: 0; bottom: 0; width: 2px; margin-left: -1px; background: rgba(20,4,2,0.9); box-shadow: 0 0 0 1px rgba(255,226,160,0.35); }
#bossbar.hit .bb-frame { animation: shake 0.25s; }
#bossbar.rage #boss-fill { background: linear-gradient(180deg, #ffb04a 0%, #ee3a0e 55%, #8a1206 100%); animation: rage 0.45s infinite alternate; }
#bossbar.rage #boss-name { color: #ffb08a; }
@keyframes rage { to { filter: brightness(1.4); } }
#boss-title { position: absolute; left: 12px; right: 12px; top: 26%; text-align: center; pointer-events: none; opacity: 0; }
#boss-title .bt-name { font-family: var(--display); font-weight: 900; font-size: clamp(32px, 10cqw, 62px); line-height: 1.02; color: #ffe0cf; text-shadow: 0 4px 0 #2a0703, 0 0 34px rgba(255,30,10,0.8); text-wrap: balance; }
#boss-title .bt-sub { margin-top: 12px; font-size: 13px; letter-spacing: 0.28em; color: var(--ember); font-weight: 900; text-shadow: 0 2px 6px #000; }
#boss-title.show { animation: titleIn 2.8s ease-out forwards; }
@keyframes titleIn { 0% { opacity: 0; transform: scale(1.5); filter: blur(10px); } 10% { opacity: 1; transform: scale(1); filter: blur(0); } 82% { opacity: 1; transform: scale(1.03); } 100% { opacity: 0; transform: scale(1.06); } }
#fader { position: absolute; inset: 0; background: #000; opacity: 0; pointer-events: none; transition: opacity 0.6s; z-index: 12; }
#fader.on { opacity: 1; }
#flash { position: absolute; inset: 0; pointer-events: none; opacity: 0; background: radial-gradient(ellipse at center, rgba(255,60,20,0.1) 30%, rgba(200,10,0,0.6) 100%); }
#flash.white { background: radial-gradient(ellipse at center, rgba(255,255,240,0.9) 0%, rgba(255,200,150,0.5) 100%); }
#flash.go { animation: flashGo 0.9s ease-out; }
@keyframes flashGo { 0% { opacity: 1; } 100% { opacity: 0; } }
/* ---------- ground-pound, combo, falls, intro ---------- */
#falls-tag { margin-top: 3px; font-size: 10px; letter-spacing: 0.18em; color: var(--muted); font-weight: 700; }
#falls-tag b { color: #ffb08a; font-variant-numeric: tabular-nums; }
#falls-tag.bump b { display: inline-block; animation: pop 0.45s ease-out; }
#combo { position: absolute; right: 28px; top: 31%; display: flex; flex-direction: column; align-items: flex-end; gap: 3px; pointer-events: none; opacity: 0; transform: translateX(14px); transition: opacity 0.2s, transform 0.2s; }
#combo.show { opacity: 1; transform: translateX(0); }
#combo-mult { font-family: var(--display); font-weight: 900; font-size: 38px; line-height: 0.9; color: var(--gold-hi); text-shadow: 0 3px 0 #2a0a38, 0 0 18px rgba(255,140,40,0.7); }
#combo-mult.hot { color: #ffe7a0; text-shadow: 0 3px 0 #5a1606, 0 0 22px rgba(255,80,20,0.95); }
#combo-mult.bump { animation: comboBump 0.35s cubic-bezier(.2,1.8,.4,1); }
@keyframes comboBump { 0% { transform: scale(1.7); } 100% { transform: scale(1); } }
#combo-n { font-size: 10px; letter-spacing: 0.2em; font-weight: 900; color: var(--bone); text-shadow: 0 2px 4px #000; }
.combo-bar { width: 64px; height: 5px; border-radius: 3px; background: rgba(0,0,0,0.6); border: 1px solid rgba(255,150,50,0.5); overflow: hidden; }
#combo-fill { height: 100%; width: 100%; background: linear-gradient(90deg, #ff6a1f, #ffd36e); }
#pop { position: absolute; left: 10px; right: 10px; top: 21%; text-align: center; pointer-events: none; font-family: var(--display); font-weight: 900; font-size: clamp(28px, 8.5cqw, 58px); line-height: 1.02; color: #fff1c6; text-shadow: 0 4px 0 #3a1406, 0 0 26px rgba(255,120,30,0.85); opacity: 0; text-wrap: balance; overflow-wrap: break-word; }
#pop.go { opacity: 1; animation: popGo 1.05s ease-out forwards; }
#pop.mega { font-size: clamp(32px, 10cqw, 76px); color: #ffe07a; text-shadow: 0 5px 0 #4a1004, 0 0 34px rgba(255,70,10,0.95); }
#pop.combo { font-size: clamp(24px, 7cqw, 42px); color: #9ff0ff; text-shadow: 0 3px 0 #06243a, 0 0 22px rgba(80,200,255,0.8); top: 27%; }
#pop.fall { font-size: clamp(26px, 8cqw, 46px); color: #ffb08a; text-shadow: 0 3px 0 #3a0a04, 0 0 18px rgba(255,60,20,0.6); }
@keyframes popGo { 0% { opacity: 0; transform: scale(2.4) rotate(-6deg); } 12% { opacity: 1; transform: scale(0.92) rotate(2deg); } 20% { transform: scale(1.04) rotate(-1deg); } 28% { transform: scale(1) rotate(0); } 75% { opacity: 1; transform: scale(1.03); } 100% { opacity: 0; transform: scale(1.1) translateY(-18px); } }
#dead-falls { font-size: 13px; font-weight: 900; letter-spacing: 0.12em; color: #ffb08a; text-shadow: 0 2px 6px #000; }
.dead-head { display: flex; flex-direction: column; align-items: center; gap: 10px; }
#intro-title { position: absolute; left: 0; right: 0; top: 16%; margin: 0; pointer-events: none; opacity: 0; z-index: 6; }
#intro-title .sub { font-size: 16px; color: #ffd98a; text-shadow: 0 2px 4px #000, 0 0 14px #000, 0 0 24px rgba(0,0,0,0.9); }
#intro-title.show { opacity: 1; animation: slamIn 0.55s cubic-bezier(.2,1.5,.35,1) forwards; }
#intro-title.out { animation: slamOut 0.5s ease-in forwards; }
@keyframes slamIn { 0% { opacity: 0; transform: scale(3.2); filter: blur(8px); } 45% { opacity: 1; transform: scale(0.9); filter: blur(0); } 70% { transform: scale(1.04); } 100% { opacity: 1; transform: scale(1); } }
@keyframes slamOut { 0% { opacity: 1; transform: scale(1); } 100% { opacity: 0; transform: scale(1.12) translateY(-20px); } }
#skip-hint { position: absolute; left: 50%; bottom: calc(env(safe-area-inset-bottom, 0px) + 22px); transform: translateX(-50%); font-size: 11px; font-weight: 900; letter-spacing: 0.26em; color: rgba(240,228,201,0.7); text-shadow: 0 2px 4px #000; pointer-events: none; animation: breathe 1.4s ease-in-out infinite; z-index: 6; }
#letterbox::before, #letterbox::after { content: ''; position: absolute; left: 0; right: 0; height: 9cqh; background: #000; transition: transform 0.6s ease; z-index: 5; }
#letterbox::before { top: 0; transform: translateY(-100%); }
#letterbox::after { bottom: 0; transform: translateY(100%); }
#letterbox.on::before, #letterbox.on::after { transform: translateY(0); }
#letterbox { position: absolute; inset: 0; pointer-events: none; }
@media (prefers-reduced-motion: reduce) { * { animation: none !important; transition: none !important; } }
/* Narrow portrait screens (including 6:19): keep each control in its own lane. */
@container (max-width: 360px) {
  #act-prompt.touch { bottom: calc(env(safe-area-inset-bottom, 0px) + 136px); }
  .topbar { grid-template-columns: minmax(0, 1fr) auto; gap: 3px; padding-left: 10px; padding-right: 8px; }
  .topbar .greed { grid-column: 1 / -1; grid-row: 2; justify-self: center; }
  .right-stats { grid-column: 2; grid-row: 1; padding-right: 36px; }
  #score { font-size: 22px; }
}

/* ---------- Halloween edition ---------- */
.logo-img { display: block; width: min(86cqw, 420px); height: auto; filter: drop-shadow(0 6px 0 rgba(10,2,18,0.9)) drop-shadow(0 0 22px rgba(160,70,255,0.35)); pointer-events: none; }
.logo { margin-top: 3cqh; }
.logo .sub { margin-top: 2px; font-family: var(--spooky); font-weight: 400; font-size: clamp(22px, 7.4cqw, 40px); letter-spacing: 0.08em; padding-left: 0; gap: 12px;
  background: linear-gradient(180deg, #e6ff8a 0%, #8dff4a 45%, #2f9a14 100%); -webkit-background-clip: text; background-clip: text; color: transparent;
  filter: drop-shadow(0 3px 0 #0d0414) drop-shadow(0 0 14px rgba(120,255,60,0.45)); }
.logo .sub::before, .logo .sub::after { background: linear-gradient(90deg, transparent, var(--slime)); height: 2px; width: 26px; }
.tagline em { color: var(--gold); }
#intro-title .logo-img { width: min(90cqw, 460px); margin: 0 auto; }
#intro-title { display: flex; flex-direction: column; align-items: center; }
#intro-title .sub { color: transparent; text-shadow: none; }
#center-msg { font-family: var(--spooky); font-weight: 400; color: var(--gold-hi); text-shadow: 0 4px 0 #1c0628, 0 0 30px rgba(255,120,30,0.7); letter-spacing: 0.04em; }
#center-msg.small { font-family: var(--ui); font-weight: 900; }
#pop { font-family: var(--spooky); font-weight: 400; letter-spacing: 0.03em; text-shadow: 0 4px 0 #1c0628, 0 0 26px rgba(255,120,30,0.85); }
#pop.combo { color: #b6ff7a; text-shadow: 0 3px 0 #0c2a06, 0 0 22px rgba(120,255,60,0.8); }
.death-title { font-family: var(--spooky); font-weight: 400; letter-spacing: 0.04em; color: #ff7a2a; text-shadow: 0 3px 0 #1c0628, 0 0 24px rgba(255,90,20,0.6); }
.panel h2 { font-family: var(--spooky); font-weight: 400; letter-spacing: 0.05em; color: var(--gold); }
#boss-title .bt-name { font-family: var(--spooky); font-weight: 400; letter-spacing: 0.04em; }
#combo-mult { font-family: var(--spooky); font-weight: 400; }
#loading .t { font-family: var(--spooky); color: var(--gold); letter-spacing: 0.06em; }
#greed-fill { background: linear-gradient(90deg, #ffd36e, #ff8a2a 50%, #a83dff); box-shadow: 0 0 10px rgba(255,120,40,0.8); }
.hud-label { color: #c9b4e0; }
#level-tag { color: var(--gold); }
.btn.primary { box-shadow: 0 8px 26px rgba(255,110,20,0.35), 0 0 0 1px rgba(255,210,140,0.5), inset 0 1px 0 rgba(255,245,210,0.6); }
.btn.ghost { border-color: rgba(169,92,255,0.75); color: #e6d4ff; }
.btn.ghost:hover, .btn.ghost:focus-visible { border-color: #d6b4ff; }
.btn.leave { border-color: rgba(255,150,50,0.7); color: var(--gold-hi); }
.panel { border-color: rgba(169,92,255,0.7); box-shadow: 0 20px 60px rgba(0,0,0,0.7), 0 0 30px rgba(140,60,255,0.25), inset 0 1px 0 rgba(255,200,150,0.12); }
#menu { background: linear-gradient(180deg, rgba(9,4,16,0.55) 0%, rgba(9,4,16,0) 38%, rgba(9,4,16,0) 52%, rgba(9,4,16,0.88) 100%); }
#act-prompt.touch { bottom: 26px; }
#kb-hint { bottom: 10px; font-size: 9.5px; letter-spacing: 0.08em; white-space: normal; text-align: center; width: 94%; }
@container (max-width: 420px) { #kb-hint { display: none; } }
#toast { border-color: rgba(169,92,255,0.6); }
/* a small screen (a phone on its side): the title menu packs tighter so all of it fits */
@container (max-height: 560px) {
  #menu.screen { gap: 8px; padding-top: 8px; padding-bottom: 10px; }
  #menu .logo { margin-top: 0; }
  #menu .logo-img { width: min(64cqw, 300px); }
  #menu .logo .sub { font-size: clamp(16px, 6.2cqw, 26px); }
  #menu .tagline { display: none; }
  #menu .menu-actions { gap: 7px; margin-bottom: 0; }
  #menu .btn { padding: 8px 12px; font-size: 11px; letter-spacing: 0.16em; }
  #menu .btn.primary { padding: 11px 14px; font-size: 15px; }
  #menu .best { font-size: 11px; }
}


/* ---------- the arcade cabinet around the screen ---------- */
#frame { position: absolute; inset: 0; overflow: hidden; background: #07030c; opacity: 0; transition: opacity 0.35s ease; font-family: var(--ui); color: var(--bone);
  touch-action: none; user-select: none; -webkit-user-select: none; -webkit-tap-highlight-color: transparent; }
#frame.vis { opacity: 1; }
#sky { position: absolute; inset: 0; pointer-events: none;
  background:
    radial-gradient(ellipse 60% 70% at 50% 46%, rgba(120,40,190,0.42), rgba(40,10,70,0.18) 55%, rgba(7,3,12,0) 75%),
    radial-gradient(circle at 12% 18%, rgba(255,150,50,0.14), rgba(0,0,0,0) 26%),
    radial-gradient(circle at 88% 82%, rgba(255,150,50,0.12), rgba(0,0,0,0) 26%),
    linear-gradient(180deg, #0b0418, #07030c 60%, #12051a); }
#bats { position: absolute; inset: 0; pointer-events: none; opacity: 0.55; }
#bats i { position: absolute; width: 46px; height: 20px; background: #000; opacity: 0.85;
  -webkit-mask: var(--bat) center / contain no-repeat; mask: var(--bat) center / contain no-repeat; animation: batfly 16s linear infinite; }
@keyframes batfly { 0% { transform: translate(-10vw, 0) scale(var(--s,1)); } 50% { transform: translate(55vw, -6vh) scale(var(--s,1)); } 100% { transform: translate(120vw, 4vh) scale(var(--s,1)); } }
#cab { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%);
  height: min(calc(100% - 28px), calc((100vw - 28px) * 4 / 3)); aspect-ratio: 3 / 4; }
#screen { position: absolute; inset: 0; border-radius: 16px; overflow: hidden; background: #000;
  box-shadow: 0 0 0 3px #050208, 0 0 0 6px #ff7a1a, 0 0 0 11px #12061c, 0 0 0 13px rgba(169,92,255,0.9), 0 0 38px 14px rgba(150,60,255,0.45), 0 30px 80px rgba(0,0,0,0.8); }
#crt { position: absolute; inset: 0; pointer-events: none; z-index: 40; border-radius: 16px;
  background:
    repeating-linear-gradient(0deg, rgba(0,0,0,0.13) 0px, rgba(0,0,0,0.13) 1px, rgba(0,0,0,0) 1px, rgba(0,0,0,0) 3px),
    radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 62%, rgba(0,0,0,0.42) 100%),
    linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0) 32%);
  box-shadow: inset 0 0 40px rgba(0,0,0,0.55); }
#power { position: absolute; left: 0; right: 0; top: 50%; height: 2px; margin-top: -1px; background: #fff; z-index: 41; pointer-events: none; opacity: 0; box-shadow: 0 0 20px 6px rgba(220,200,255,0.8); }
#frame.on-anim #power { animation: crtOn 0.55s ease-out forwards; }
#frame.on-anim #app { animation: crtApp 0.55s ease-out; }
#frame.off-anim #app { animation: crtOff 0.32s ease-in forwards; }
#frame.off-anim #power { animation: crtLine 0.32s ease-in forwards; }
@keyframes crtOn { 0% { opacity: 1; transform: scaleX(0.02); } 35% { opacity: 1; transform: scaleX(1); } 100% { opacity: 0; transform: scaleX(1) scaleY(140); } }
@keyframes crtApp { 0% { transform: scaleY(0.004); filter: brightness(4); } 45% { transform: scaleY(0.004); filter: brightness(4); } 100% { transform: scaleY(1); filter: brightness(1); } }
@keyframes crtOff { 0% { transform: scale(1, 1); filter: brightness(1); } 60% { transform: scale(1, 0.004); filter: brightness(5); } 100% { transform: scale(0, 0.004); filter: brightness(8); } }
@keyframes crtLine { 0% { opacity: 0; } 55% { opacity: 0; transform: scaleX(1); } 60% { opacity: 1; } 100% { opacity: 1; transform: scaleX(0); } }
#leave { position: absolute; top: max(12px, env(safe-area-inset-top, 0px)); right: max(12px, env(safe-area-inset-right, 0px)); z-index: 60; display: flex; align-items: center; gap: 8px;
  height: 44px; padding: 0 16px 0 12px; border-radius: 22px; border: 1px solid rgba(255,150,50,0.75); background: rgba(14,6,24,0.8); color: #ffd08a; cursor: pointer;
  font-family: var(--pix); font-size: 22px; letter-spacing: 0.08em; box-shadow: 0 0 18px rgba(255,120,30,0.25); }
#leave .x { font-size: 20px; line-height: 1; }
#leave:hover, #leave:focus-visible { border-color: #ffd08a; outline: none; box-shadow: 0 0 22px rgba(255,140,40,0.55); }
.side { position: absolute; top: 50%; transform: translateY(-50%); width: calc((100% - (100vh - 28px) * 0.75) / 2 - 40px); max-width: 300px; display: flex; justify-content: center; pointer-events: none; }
#side-l { left: 20px; } #side-r { right: 20px; }
.plaque { width: 100%; max-width: 260px; padding: 18px 18px 16px; border-radius: 14px; background: linear-gradient(180deg, rgba(32,12,50,0.82), rgba(12,5,22,0.86));
  border: 1px solid rgba(169,92,255,0.55); box-shadow: 0 0 26px rgba(140,60,255,0.22), inset 0 1px 0 rgba(255,200,150,0.12); font-family: var(--pix); color: #e9dcff; }
.pq-t { font-family: var(--spooky); font-size: 28px; letter-spacing: 0.06em; color: #ff9a2e; text-shadow: 0 2px 0 #1c0628, 0 0 14px rgba(255,120,30,0.5); margin-bottom: 10px; text-align: center; }
.pq-t.small { font-size: 20px; margin: 14px 0 4px; color: #8dff4a; text-shadow: 0 2px 0 #0d0414, 0 0 12px rgba(120,255,60,0.5); animation: blink 1.1s steps(2) infinite; }
@keyframes blink { 50% { opacity: 0.25; } }
.pq-row { display: flex; align-items: center; gap: 6px; font-size: 22px; line-height: 1.5; letter-spacing: 0.04em; }
.pq-row span:last-child { margin-left: 4px; }
.k { display: inline-flex; align-items: center; justify-content: center; min-width: 1.4em; height: 1.25em; padding: 0 0.3em; border: 2px solid #e9dcff; border-bottom-width: 4px; border-radius: 5px; font-size: 18px; color: #fff; background: #16091f; }
.pq-big { font-size: 46px; text-align: center; color: #ffd08a; text-shadow: 0 0 12px rgba(255,150,50,0.6); font-variant-numeric: tabular-nums; }
.pq-note { margin-top: 10px; font-size: 17px; letter-spacing: 0.06em; color: #b9a6cc; text-align: center; }
.pq-note.sep { margin-top: 16px; padding-top: 12px; border-top: 1px dashed rgba(169,92,255,0.45); }
.pq-note b { color: #ffd08a; font-weight: 400; }
@media (max-width: 1100px), (max-height: 520px) { .side { display: none; } }
#frame.touch .side { display: none; }
/* ---------- touch controls: on the cabinet, either side of the screen ---------- */
#touch { position: absolute; inset: 0; pointer-events: none; z-index: 50; --ctl: clamp(66px, 21vh, 104px); }
.tbtn { position: absolute; pointer-events: auto; border-radius: 50%; display: grid; place-items: center; touch-action: none;
  border: 3px solid rgba(255,150,50,0.85); background: radial-gradient(circle at 50% 32%, rgba(255,150,60,0.55), rgba(110,30,4,0.82) 70%);
  box-shadow: 0 6px 0 #2a0a04, 0 10px 20px rgba(0,0,0,0.6), inset 0 2px 0 rgba(255,230,190,0.35); transition: transform 0.06s, box-shadow 0.06s; }
.tbtn svg { width: 44%; height: 44%; pointer-events: none; }
.tbtn.on { transform: translateY(4px) scale(0.96); box-shadow: 0 2px 0 #2a0a04, 0 4px 10px rgba(0,0,0,0.6), inset 0 2px 0 rgba(255,230,190,0.35); }
#btn-jump { right: max(18px, env(safe-area-inset-right, 0px)); bottom: max(18px, env(safe-area-inset-bottom, 0px)); width: var(--ctl); height: var(--ctl); }
#btn-attack { right: calc(max(18px, env(safe-area-inset-right, 0px)) + var(--ctl) * 1.12); bottom: calc(max(18px, env(safe-area-inset-bottom, 0px)) + var(--ctl) * 0.5); width: calc(var(--ctl) * 0.92); height: calc(var(--ctl) * 0.92);
  border-color: rgba(190,120,255,0.9); background: radial-gradient(circle at 50% 32%, rgba(190,120,255,0.6), rgba(60,14,110,0.85) 70%); box-shadow: 0 6px 0 #1a0630, 0 10px 20px rgba(0,0,0,0.6), inset 0 2px 0 rgba(235,210,255,0.35); }
#btn-dive { right: calc(max(18px, env(safe-area-inset-right, 0px)) + var(--ctl) * 0.12); bottom: calc(max(18px, env(safe-area-inset-bottom, 0px)) + var(--ctl) * 1.18); width: calc(var(--ctl) * 0.72); height: calc(var(--ctl) * 0.72);
  border-color: rgba(140,255,90,0.9); background: radial-gradient(circle at 50% 32%, rgba(150,255,100,0.55), rgba(20,90,10,0.85) 70%); box-shadow: 0 5px 0 #062a04, 0 10px 20px rgba(0,0,0,0.6), inset 0 2px 0 rgba(220,255,200,0.35); }
#btn-dive.ready { box-shadow: 0 0 22px rgba(140,255,90,0.85), 0 5px 0 #062a04; }
#btn-attack.fire, #btn-attack.throw { border-color: #ffc04a; background: radial-gradient(circle at 50% 35%, rgba(255,160,60,0.65), rgba(120,40,8,0.85)); animation: actGlow 0.8s ease-in-out infinite alternate; }
#btn-attack.fire svg, #btn-attack.throw svg { width: 58%; height: 58%; }
#btn-enter { right: calc(max(18px, env(safe-area-inset-right, 0px)) + var(--ctl) * 0.2); bottom: calc(max(18px, env(safe-area-inset-bottom, 0px)) + var(--ctl) * 2.05); width: auto; height: auto; border-radius: 22px; padding: 10px 16px;
  font-family: var(--ui); font-weight: 900; font-size: 12px; letter-spacing: 0.12em; color: #ffe2a0; display: flex; gap: 8px; align-items: center; animation: breathe 1.2s infinite; }
#btn-enter svg { width: 16px; height: 16px; }
#btn-enter.on { transform: scale(0.95); }
#joystick { position: absolute; left: max(18px, env(safe-area-inset-left, 0px)); bottom: max(18px, env(safe-area-inset-bottom, 0px)); width: calc(var(--ctl) * 1.45); height: calc(var(--ctl) * 1.45); border-radius: 50%;
  border: 3px solid rgba(255,150,50,0.7); background: radial-gradient(circle, rgba(40,14,60,0.6), rgba(8,3,14,0.85)); box-shadow: 0 6px 22px rgba(0,0,0,0.6), inset 0 0 0 2px rgba(169,92,255,0.25);
  pointer-events: auto; touch-action: none; box-sizing: border-box; }
#joystick::before, #joystick::after { content: ''; position: absolute; top: 50%; width: 0; height: 0; margin-top: -9px; border: 9px solid transparent; pointer-events: none; }
#joystick::before { left: 8px; border-right-color: rgba(255,150,50,0.75); }
#joystick::after { right: 8px; border-left-color: rgba(255,150,50,0.75); }
#joystick-knob { position: absolute; left: 50%; top: 50%; width: 46%; height: 46%; margin: 0; border-radius: 50%; box-sizing: border-box; border: 3px solid #2a0a04;
  background: radial-gradient(circle at 38% 30%, #ffc37a, #ff7a1a 45%, #a33a06 80%); box-shadow: 0 5px 12px #000, inset 0 2px 1px rgba(255,240,200,0.6);
  pointer-events: none; transform: translate(calc(-50% + var(--stick-x, 0px)), calc(-50% + var(--stick-y, 0px))); }
#joystick-knob i { position: absolute; inset: 28% 22% 26%; background:
  linear-gradient(135deg, transparent 45%, #3a1205 46% 60%, transparent 61%) 0 0 / 40% 45% no-repeat,
  linear-gradient(225deg, transparent 45%, #3a1205 46% 60%, transparent 61%) 100% 0 / 40% 45% no-repeat,
  radial-gradient(ellipse at 50% 0%, transparent 52%, #3a1205 54% 70%, transparent 72%) 50% 100% / 90% 40% no-repeat; opacity: 0.85; }
#joystick.active #joystick-knob { box-shadow: 0 5px 12px #000, 0 0 18px rgba(255,160,60,0.7); }
/* portrait: the screen at the top, the controls below it */
@media (max-aspect-ratio: 1/1) {
  #cab { top: max(10px, env(safe-area-inset-top, 0px)); transform: translateX(-50%); height: auto; width: min(calc(100vw - 16px), calc((100% - 210px) * 0.75)); }
  #touch { --ctl: clamp(64px, 19vw, 92px); }
  #leave { top: auto; bottom: max(14px, env(safe-area-inset-bottom, 0px)); right: 50%; transform: translateX(50%); height: 38px; font-size: 18px; }
  #frame.touch #leave { bottom: auto; top: max(10px, env(safe-area-inset-top, 0px)); right: 10px; transform: none; padding: 0 10px; }
  #frame.touch #leave .lbl { display: none; }
}

/* ---------- a touch screen: the game takes the whole screen and the controls sit on it ---------- */
#frame.touch #sky, #frame.touch #bats, #frame.touch .side, #frame.touch #leave { display: none; }
#frame.touch #cab { left: 0; top: 0; transform: none; width: 100%; height: 100%; aspect-ratio: auto; }
#frame.touch #screen, #frame.touch #crt { border-radius: 0; box-shadow: none; }
#frame.touch #crt { opacity: 0.5; }
#frame.touch #touch { --ctl: clamp(62px, 19vmin, 96px); --edge: 14px; }
#frame.touch #joystick, #frame.touch .tbtn { opacity: 0.86; }
#frame.touch #joystick.active, #frame.touch .tbtn.on { opacity: 1; }
#frame.touch #joystick { left: max(var(--edge), env(safe-area-inset-left, 0px)); bottom: max(var(--edge), env(safe-area-inset-bottom, 0px)); }
#frame.touch #btn-jump { right: max(var(--edge), env(safe-area-inset-right, 0px)); bottom: max(var(--edge), env(safe-area-inset-bottom, 0px)); }
#frame.touch #btn-attack { right: calc(max(var(--edge), env(safe-area-inset-right, 0px)) + var(--ctl) * 1.12); bottom: calc(max(var(--edge), env(safe-area-inset-bottom, 0px)) + var(--ctl) * 0.5); }
#frame.touch #btn-dive { right: calc(max(var(--edge), env(safe-area-inset-right, 0px)) + var(--ctl) * 0.12); bottom: calc(max(var(--edge), env(safe-area-inset-bottom, 0px)) + var(--ctl) * 1.18); }
#frame.touch #btn-enter { right: calc(max(var(--edge), env(safe-area-inset-right, 0px)) + var(--ctl) * 0.2); bottom: calc(max(var(--edge), env(safe-area-inset-bottom, 0px)) + var(--ctl) * 2.05); }
/* (the HUD keeps clear of a phone's notch and rounded corners) */
#frame.touch .topbar { padding-left: max(14px, env(safe-area-inset-left, 0px)); padding-right: max(14px, env(safe-area-inset-right, 0px)); }
#frame.touch #pause-btn { width: 44px; height: 44px; right: max(12px, env(safe-area-inset-right, 0px)); }
#frame.touch .right-stats { padding-right: 48px; }
#frame.touch #meter { right: max(10px, env(safe-area-inset-right, 0px)); }
#frame.touch #combo { right: calc(max(10px, env(safe-area-inset-right, 0px)) + 20px); }
@media (min-aspect-ratio: 1/1) { #frame.touch #meter { top: 24%; height: 30%; } #frame.touch #combo { top: 22%; } }
/* the controls carry their names for the first seconds of the first climb */
.cap { position: absolute; left: 0; right: 0; bottom: 12%; text-align: center; font-family: var(--pix); font-size: 13px; line-height: 1; letter-spacing: 0.08em; color: #fff3d6; text-shadow: 0 1px 2px #000, 0 0 6px #000; opacity: 0; transition: opacity 0.6s; pointer-events: none; }
#joystick .cap { bottom: 7%; }
#touch.coach .cap { opacity: 1; }
#touch.under { visibility: hidden; }

/* ---------- how to play: the controls first (the touch buttons or the keys, whichever you play with) ---------- */
.hcols, .hcol { display: flex; flex-direction: column; gap: 14px; }
.ctl-head { margin: 2px 0 -4px; font-size: 11px; font-weight: 900; letter-spacing: 0.22em; color: var(--muted); text-align: left; }
.ctl { display: grid; gap: 8px; text-align: left; font-size: 13.5px; line-height: 1.35; }
.ctl > div { display: grid; grid-template-columns: 46px 1fr; gap: 10px; align-items: center; }
.ctl b { color: var(--gold-hi); }
.mini { justify-self: center; width: 36px; height: 36px; border-radius: 50%; display: grid; place-items: center; box-sizing: border-box; border: 2px solid rgba(255,150,50,0.85);
  background: radial-gradient(circle at 50% 32%, rgba(255,150,60,0.55), rgba(110,30,4,0.82) 70%); box-shadow: 0 3px 0 #2a0a04; }
.mini svg { width: 52%; height: 52%; }
.mini.sword { border-color: rgba(190,120,255,0.9); background: radial-gradient(circle at 50% 32%, rgba(190,120,255,0.6), rgba(60,14,110,0.85) 70%); box-shadow: 0 3px 0 #1a0630; }
.mini.smash { width: 30px; height: 30px; border-color: rgba(140,255,90,0.9); background: radial-gradient(circle at 50% 32%, rgba(150,255,100,0.55), rgba(20,90,10,0.85) 70%); box-shadow: 0 3px 0 #062a04; }
.mini.stick { width: 42px; height: 42px; border-color: rgba(255,150,50,0.7); background: radial-gradient(circle, rgba(40,14,60,0.6), rgba(8,3,14,0.85)); box-shadow: none; }
.mini.stick i { width: 46%; height: 46%; border-radius: 50%; border: 2px solid #2a0a04; box-sizing: border-box; background: radial-gradient(circle at 38% 30%, #ffc37a, #ff7a1a 45%, #a33a06 80%); }
.mini.door { width: 44px; height: 26px; border-radius: 13px; }
.mini.pause { width: 32px; height: 32px; border-color: rgba(255,150,50,0.6); background: rgba(12,6,20,0.6); box-shadow: none; }
.mini.pause svg { width: 40%; height: 40%; }
.ctl .k { min-width: 1.5em; height: 1.4em; font-size: 14px; padding: 0 0.3em; border-width: 1.5px; border-bottom-width: 3px; }
.ctl .keyset { justify-self: start; display: flex; gap: 4px; }
.ctl-keys > div { grid-template-columns: 96px 1fr; }
#frame.touch .ctl-keys, #frame.touch .keys, #frame.touch .ctl-head.keys-head { display: none; }
#frame:not(.touch) .ctl-touch, #frame:not(.touch) .ctl-head.touch-head { display: none; }

/* ---------- a short, wide screen (a phone on its side): menus and results side by side ---------- */
@container (max-height: 560px) {
  #center-msg { top: 30%; font-size: 64px; }
  #sub-msg { top: calc(30% + 76px); }
}
@container (orientation: landscape) and (max-height: 560px) {
  #menu.screen { flex-direction: row; justify-content: center; align-items: center; gap: 6cqw; padding-left: max(20px, env(safe-area-inset-left, 0px)); padding-right: max(20px, env(safe-area-inset-right, 0px)); }
  #menu .logo-img { width: min(46cqw, 380px); }
  #menu .menu-actions { width: min(280px, 38cqw); }
  #dead.screen, #win.screen { flex-direction: row; gap: 5cqw; }
  /* (how to play: the controls beside the climb; the pause menu in two columns) */
  #howto .panel { width: min(780px, 92cqw); max-height: 90cqh; padding: 16px 20px; gap: 10px; }
  #howto .panel h2 { font-size: 22px; }
  .hcols { display: grid; grid-template-columns: 1fr 1.15fr; gap: 22px; align-items: start; }
  #pause .panel { width: min(560px, 86cqw); max-height: 92cqh; display: grid; grid-template-columns: 1fr 1fr; gap: 10px; padding: 16px 20px; }
  #pause .panel h2, #pause #resume-btn, #pause .panel .muted { grid-column: 1 / -1; }
  #pause .panel h2 { font-size: 22px; }
  #pause .btn { padding: 10px 12px; font-size: 12px; }
  #pause #resume-btn { padding: 12px 14px; font-size: 15px; }
  .dead-head { max-width: 40cqw; }
  #dead .panel, #win .panel { max-height: 88cqh; }
}
`;
const ARCADE_HTML = `
<div id="frame">
  <div id="sky"></div>
  <div id="bats" aria-hidden="true"></div>
  <div class="side" id="side-l">
    <div class="plaque">
      <div class="pq-t">HOW TO PLAY</div>
      <div class="pq-row"><span class="k">A</span><span class="k">D</span><span>MOVE</span></div>
      <div class="pq-row"><span class="k">SPACE</span><span>JUMP</span></div>
      <div class="pq-row"><span class="k">J</span><span>SWORD</span></div>
      <div class="pq-row"><span class="k">S</span><span>SMASH (IN THE AIR)</span></div>
      <div class="pq-row"><span class="k">E</span><span>DOORWAY</span></div>
      <div class="pq-row"><span class="k">ESC</span><span>PAUSE</span></div>
      <div class="pq-note">GAMEPAD WORKS TOO</div>
    </div>
  </div>
  <div class="side" id="side-r">
    <div class="plaque">
      <div class="pq-t">HI-SCORE</div>
      <div class="pq-big" id="hs">0</div>
      <div class="pq-t small">INSERT COIN</div>
      <div class="pq-note">25&cent; · FREE PLAY TONIGHT</div>
      <div class="pq-note sep">LEAVE THE MACHINE: <b>ESC</b> ON THE TITLE, OR THE <b>&#x2715;</b></div>
    </div>
  </div>
  <div id="cab">
    <div id="screen">
<div id="app">
  <canvas id="gl"></canvas>

  <div id="hud" class="hidden">
    <div id="vignette"></div>
    <div id="frost"></div>
    <div id="damage"></div>
    <div id="floaters"></div>
    <div class="topbar">
      <div>
        <div class="hud-label">SCORE</div>
        <div id="score">0</div>
        <div id="level-tag">TOWER 1</div>
        <div id="falls-tag">FALLS <b id="falls-n">0</b></div>
      </div>
      <div class="greed" id="greed">
        <div class="hud-label">GREED</div>
        <div class="greed-bar"><div id="greed-fill"></div></div>
        <div id="greed-pct">0%</div>
      </div>
      <div class="right-stats">
        <div id="hearts"></div>
        <div class="stat-row"><div id="lives"></div><svg id="key-slot" viewBox="0 0 24 24"><circle cx="7" cy="8" r="4.5" fill="none" stroke="#f3c25e" stroke-width="2.6"/><path d="M10.5 10.5 L20 20 M16 16 l2.5-2.5 M18.5 18.5 l2-2" stroke="#f3c25e" stroke-width="2.6" stroke-linecap="round"/></svg></div>
      </div>
    </div>
    <button id="pause-btn" aria-label="Pause"><svg viewBox="0 0 14 14"><rect x="2" y="1" width="3.5" height="12" rx="1" fill="#ffe2a0"/><rect x="8.5" y="1" width="3.5" height="12" rx="1" fill="#ffe2a0"/></svg></button>
    <div id="meter">
      <div id="meter-lava"></div>
      <svg id="meter-key" class="hidden" viewBox="0 0 24 24"><circle cx="7" cy="8" r="4.5" fill="none" stroke="#f3c25e" stroke-width="3"/><path d="M10.5 10.5 L20 20" stroke="#f3c25e" stroke-width="3" stroke-linecap="round"/></svg>
      <svg id="meter-gate" viewBox="0 0 12 12"><path d="M1 12 V5 A5 5 0 0 1 11 5 V12 Z" fill="#3a2410" stroke="#f3c25e" stroke-width="1.4"/></svg>
      <div id="meter-knight"></div>
    </div>
    <div id="flash"></div>
    <div id="bossbar" class="hidden">
      <div id="boss-name">THE GUARDIAN</div>
      <div class="bb-frame"><div id="boss-lag"></div><div id="boss-fill"></div><div class="bb-notch"></div></div>
    </div>
    <div id="boss-title"><div class="bt-name"></div><div class="bt-sub"></div></div>
    <div id="center-msg"></div>
    <div id="sub-msg"></div>
    <div id="act-prompt"></div>
    <div id="combo"><div id="combo-mult">x2</div><div id="combo-n">0 COMBO</div><div class="combo-bar"><div id="combo-fill"></div></div></div>
    <div id="pop"></div>
    <div class="siege-arrow" id="siege-left"><svg viewBox="0 0 24 24"><path d="M15 4 L7 12 L15 20" fill="none" stroke="#ffc04a" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/></svg><svg viewBox="0 0 24 24"><path d="M2.5 15.5 L13.5 8.5 L16.5 13 L5.5 20 Z" fill="#ffe2a0"/><circle cx="7.5" cy="18.5" r="3" fill="#6a3a1a" stroke="#ffe2a0" stroke-width="1.6"/></svg></div>
    <div class="siege-arrow" id="siege-right"><svg viewBox="0 0 24 24"><path d="M9 4 L17 12 L9 20" fill="none" stroke="#ffc04a" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/></svg><svg viewBox="0 0 24 24" style="transform: scaleX(-1)"><path d="M2.5 15.5 L13.5 8.5 L16.5 13 L5.5 20 Z" fill="#ffe2a0"/><circle cx="7.5" cy="18.5" r="3" fill="#6a3a1a" stroke="#ffe2a0" stroke-width="1.6"/></svg></div>
    <div id="toast"></div>
  </div>

  <div id="letterbox"></div>
  <div id="intro-title" class="logo"><img class="logo-img" data-src="assets/textures/sfal_logo_halloween.webp" alt="Sir Falls-A-Lot" draggable="false"><div class="sub">HALLOWEEN EDITION</div></div>
  <div id="skip-hint" class="hidden">TAP TO SKIP</div>
  <div id="fader"></div>
  <div id="kb-hint" class="hidden">A D MOVE · SPACE JUMP · S IN AIR SMASH · J SWORD / FIRE / THROW · E DOOR · ESC PAUSE</div>

  <div id="menu" class="screen hidden">
    <div id="menu-top"><button class="icon-btn" id="mute-btn" aria-label="Toggle sound"></button></div>
    <div class="logo">
      <img class="logo-img" data-src="assets/textures/sfal_logo_halloween.webp" alt="Sir Falls-A-Lot" draggable="false">
      <div class="sub">HALLOWEEN EDITION</div>
      <div class="tagline">CLIMB HIGH. GRAB PUMPKINS. <em>GREED RISES.</em></div>
    </div>
    <div class="menu-actions">
      <div class="best" id="best-line">BEST <b id="best">0</b></div>
      <button class="btn primary" id="play-btn">PLAY</button>
      <div class="row">
        <button class="btn ghost" id="howto-btn">HOW TO PLAY</button>
        <button class="btn ghost" id="credits-btn">CREDITS</button>
      </div>
      <button class="btn ghost leave" id="leave-btn">LEAVE THE ARCADE</button>
    </div>
  </div>

  <div id="howto" class="screen dim hidden">
    <div class="panel">
      <h2>How to climb</h2>
      <p class="muted">THE HAUNTED TOWER, ON HALLOWEEN NIGHT</p>
      <div class="hcols"><div class="hcol">
      <div class="ctl-head touch-head">CONTROLS</div>
      <div class="ctl ctl-touch">
        <div><i class="mini stick"><i></i></i><span><b>Stick</b> left and right: run around the tower.</span></div>
        <div><i class="mini"><svg viewBox="0 0 24 24"><path d="M12 4 L20 13 H15 V20 H9 V13 H4 Z" fill="#ffe2a0"/></svg></i><span><b>Jump.</b> Hold it down to jump higher.</span></div>
        <div><i class="mini sword"><svg viewBox="0 0 24 24"><path d="M19 3 L21 5 L10 16 L8 14 Z" fill="#ffe2a0"/><path d="M5 13 L11 19 M4 20 L7 17" stroke="#ffb070" stroke-width="2.4" stroke-linecap="round"/></svg></i><span><b>Sword.</b> In the guardian's hall it fires the cannons and throws the bombs.</span></div>
        <div><i class="mini smash"><svg viewBox="0 0 24 24"><path d="M12 21 L4 12 H9 V3 H15 V12 H20 Z" fill="#cfeaff"/></svg></i><span><b>Smash</b> in the air: slam down onto the ledge below.</span></div>
        <div><i class="mini door"><svg viewBox="0 0 24 24"><path d="M5 21 V10 A7 7 0 0 1 19 10 V21 Z" fill="none" stroke="#ffe2a0" stroke-width="2.5"/><path d="M12 17 V11 M9 14 L12 11 L15 14" stroke="#ffe2a0" stroke-width="2.2" fill="none" stroke-linecap="round"/></svg></i><span><b>Enter passage</b> shows up at a dark doorway.</span></div>
        <div><i class="mini pause"><svg viewBox="0 0 14 14"><rect x="2" y="1" width="3.5" height="12" rx="1" fill="#ffe2a0"/><rect x="8.5" y="1" width="3.5" height="12" rx="1" fill="#ffe2a0"/></svg></i><span><b>Pause:</b> how to play, sound, and the way out of the arcade.</span></div>
      </div>
      <div class="ctl-head keys-head">CONTROLS</div>
      <div class="ctl ctl-keys">
        <div><span class="keyset"><span class="k">A</span><span class="k">D</span></span><span>Move (or the arrows)</span></div>
        <div><span class="keyset"><span class="k">SPACE</span></span><span>Jump, hold for higher</span></div>
        <div><span class="keyset"><span class="k">J</span></span><span>Sword, cannon, bomb</span></div>
        <div><span class="keyset"><span class="k">S</span></span><span>Smash (in the air)</span></div>
        <div><span class="keyset"><span class="k">E</span></span><span>Enter a doorway</span></div>
        <div><span class="keyset"><span class="k">ESC</span></span><span>Pause</span></div>
      </div>
      </div><div class="hcol">
      <div class="ctl-head">THE CLIMB</div>
      <div class="howto">
        <div><svg viewBox="0 0 24 24"><circle cx="7" cy="8" r="4.5" fill="none" stroke="#f3c25e" stroke-width="2.6"/><path d="M10.5 10.5 L20 20 M16 16 l2.5-2.5" stroke="#f3c25e" stroke-width="2.6" stroke-linecap="round"/></svg><span>Find the <b>key</b> somewhere on the tower, then reach the <b>gate at the top</b>.</span></div>
        <div><svg viewBox="0 0 24 24"><ellipse cx="12" cy="14" rx="9" ry="7.5" fill="#ff7a1a"/><path d="M8 7 Q12 4 16 7" stroke="#b8440c" fill="none" stroke-width="1.5"/><path d="M12 7 V3.5 L14 2.5" stroke="#3d6b1f" stroke-width="2.2" fill="none" stroke-linecap="round"/><path d="M7.5 12.5 L10 11 L10 14 Z M16.5 12.5 L14 11 L14 14 Z" fill="#ffe08a"/><path d="M8 16.5 Q12 20 16 16.5 L14.5 17.2 L13 16.4 L11 17.4 L9.5 16.6 Z" fill="#ffe08a"/></svg><span>Lava rises from below. <b>Pumpkins</b> and chests fill your <b>greed</b>: more score, faster lava.</span></div>
        <div><svg viewBox="0 0 24 24"><path d="M5 21 V10 A7 7 0 0 1 19 10 V21 Z" fill="none" stroke="#f3c25e" stroke-width="2.4"/></svg><span>Dark <b>doorways</b> lead through the tower to its far side. Treasure waits there.</span></div>
        <div><svg viewBox="0 0 24 24"><path d="M19 3 L21 5 L10 16 L8 14 Z" fill="#f0e4c9"/><path d="M5 13 L11 19 M4 20 L7 17" stroke="#ffb070" stroke-width="2.4" stroke-linecap="round"/></svg><span>Slash skeletons, rats, bats and spiders. Dragons can't be slain, but your sword can <b>parry their fireballs</b>.</span></div>
        <div><svg viewBox="0 0 24 24"><path d="M12 21 L4 12 H9 V3 H15 V12 H20 Z" fill="#cfeaff"/></svg><span>Press <b>down</b> in the air to <b>ground-pound</b>. The higher you fall, the bigger the blast: foes fly, pumpkins spray loose. Land it on a guardian's weak spot for <b>double damage</b>.</span></div>
        <div><svg viewBox="0 0 24 24"><path d="M4 18 L9 6 L12 13 L15 8 L20 18" fill="none" stroke="#9ff0ff" stroke-width="2.4" stroke-linejoin="round"/></svg><span>Chain pumpkins, kills and smashes into a <b>combo</b>. Staying in the air keeps it alive, and the multiplier boosts every point.</span></div>
        <div><svg viewBox="0 0 24 24"><path d="M6 3 H18 L13 12 L18 21 H6 L11 12 Z" fill="none" stroke="#7fe8ff" stroke-width="2.2"/></svg><span>Hourglasses freeze the lava for a few seconds. Red crystal hearts heal.</span></div>
        <div><svg viewBox="0 0 24 24"><path d="M12 2 C7 2 4 6 4 10 C4 13 6 14 6 16 V19 H9 V17 H11 V19 H13 V17 H15 V19 H18 V16 C18 14 20 13 20 10 C20 6 17 2 12 2 Z" fill="#f0e4c9"/><circle cx="9" cy="10" r="2" fill="#c8281d"/><circle cx="15" cy="10" r="2" fill="#c8281d"/></svg><span>Behind the gate a <b>guardian</b> waits. Dodge the glowing warnings, strike its <b>glowing weak spots</b> after it attacks, and parry its fireballs straight back at it.</span></div>
        <div><svg viewBox="0 0 24 24"><circle cx="10" cy="14" r="7" fill="#f0e4c9"/><path d="M14 8 Q16 5 19 5" stroke="#ffb070" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M20 2 L20.8 4.2 L23 5 L20.8 5.8 L20 8 L19.2 5.8 L17 5 L19.2 4.2 Z" fill="#ff8a3a"/></svg><span>In the guardian's hall, stand at a <b>cannon</b> and press the sword button to fire it. Grab <b>bombs</b> from the crates and throw them. Jump on the floating platforms to dodge.</span></div>
      </div>
      <div class="keys">Gamepad: stick or d-pad to move, A jump, X swing, down smash, Y door, Start pause.</div>
      </div></div>
      <button class="btn" data-close="howto">BACK</button>
    </div>
  </div>

  <div id="credits" class="screen dim hidden">
    <div class="panel">
      <h2>About the creator</h2>
      <p>Created by <b>Oskari Olli</b></p>
      <p>Indie game creator from Finland. Making retro-inspired games for players who crave nostalgia.</p>
      <p class="muted">YOU CAN REACH ME ON</p>
      <p><a href="https://www.linkedin.com/in/oskari-olli/" target="_blank" rel="noopener">LinkedIn: Oskari Olli</a></p>
      <p class="muted">HALLOWEEN EDITION · FOUND IN AN OLD ARCADE CABINET IN A BEDROOM ON MAPLE STREET.</p>
      <p class="muted">THANKS FOR PLAYING! IF YOU ENJOYED THIS GAME, FEEL FREE TO CHECK OUT MY OTHER PROJECTS.</p>
      <button class="btn" data-close="credits">CLOSE</button>
    </div>
  </div>

  <div id="pause" class="screen dim hidden">
    <div class="panel">
      <h2>Paused</h2>
      <button class="btn primary" id="resume-btn">RESUME</button>
      <button class="btn ghost" id="pause-howto-btn">HOW TO PLAY</button>
      <button class="btn ghost" id="pause-mute-btn">SOUND: ON</button>
      <button class="btn ghost" id="exit-btn">EXIT TO MAIN MENU</button>
      <button class="btn ghost leave" id="pause-leave-btn">LEAVE THE ARCADE</button>
      <p class="muted">YOUR CLIMB WAITS HERE WHILE YOU ARE AWAY.</p>
    </div>
  </div>

  <div id="confirm" class="screen dim hidden">
    <div class="panel">
      <h2>Exit to main menu?</h2>
      <p class="muted">YOUR CURRENT CLIMB WILL BE LOST.</p>
      <div class="row">
        <button class="btn primary" id="confirm-yes">YES</button>
        <button class="btn" id="confirm-no">NO</button>
      </div>
    </div>
  </div>

  <div id="dead" class="screen dim hidden">
    <div class="dead-head">
      <div class="death-title" id="dead-title">THE LAVA CONSUMED YOU</div>
      <div id="dead-falls"></div>
    </div>
    <div class="panel">
      <div class="stats" id="dead-stats"></div>
      <button class="btn primary" id="retry-btn">TRY AGAIN</button>
      <button class="btn ghost" id="dead-menu-btn">MAIN MENU</button>
    </div>
  </div>

  <div id="win" class="screen dim hidden">
    <div class="panel">
      <h2 id="win-title">Tower conquered</h2>
      <div class="stats" id="win-stats"></div>
      <button class="btn primary" id="next-btn">NEXT TOWER</button>
    </div>
  </div>

  <div id="loading" class="screen">
    <div class="t">Carving the pumpkins…</div>
    <div class="bar"><i></i></div>
  </div>
  <div id="error" class="screen hidden">
    <div class="panel"><h2>Can't start the game</h2><p id="error-text">This device doesn't support WebGL 2.</p></div>
  </div>
</div>
      <div id="crt" aria-hidden="true"></div>
      <div id="power" aria-hidden="true"></div>
    </div>
  </div>
  <div id="touch" class="hidden">
    <div id="joystick" role="group" aria-label="Move left or right"><div id="joystick-knob"><i></i></div><span class="cap">MOVE</span></div>
    <div class="tbtn" id="btn-attack" aria-label="Sword"><svg viewBox="0 0 24 24"><path d="M19 3 L21 5 L10 16 L8 14 Z" fill="#ffe2a0"/><path d="M5 13 L11 19 M4 20 L7 17" stroke="#ffb070" stroke-width="2.4" stroke-linecap="round"/></svg><span class="cap">SWORD</span></div>
    <div class="tbtn" id="btn-dive" aria-label="Ground-pound"><svg viewBox="0 0 24 24"><path d="M12 21 L4 12 H9 V3 H15 V12 H20 Z" fill="#cfeaff"/></svg><span class="cap">SMASH</span></div>
    <div class="tbtn" id="btn-jump" aria-label="Jump"><svg viewBox="0 0 24 24"><path d="M12 4 L20 13 H15 V20 H9 V13 H4 Z" fill="#ffe2a0"/></svg><span class="cap">JUMP</span></div>
    <div class="tbtn hidden" id="btn-enter" aria-label="Enter passage"><svg viewBox="0 0 24 24"><path d="M5 21 V10 A7 7 0 0 1 19 10 V21 Z" fill="none" stroke="#ffe2a0" stroke-width="2.5"/><path d="M12 17 V11 M9 14 L12 11 L15 14" stroke="#ffe2a0" stroke-width="2.2" fill="none" stroke-linecap="round"/></svg>ENTER PASSAGE</div>
  </div>
  <button id="leave" type="button" aria-label="Leave the arcade"><span class="x">&#x2715;</span><span class="lbl">LEAVE</span></button>
</div>
`;
return { ARCADE_CSS, ARCADE_HTML };
})();


// ======================================================================
//  game.js
// ======================================================================
const __game = (({ CONFIG }, { Renderer, Node, Mesh, BasicMaterial, Camera, plane, Vec3, clamp, damp, dampAngle, angleDiff, wrapAngle, lerp }, { makeTextures, makeMaterials, makeBillboardMaterial, FX }, { generateLevel, Tower, World, PATH, R, polar, setPathRadius }, { KnightModel, SwordTrail, Player }, { Items, createEnemy, Fireball }, { BossArena, ARENA_RP, CANNON_RELOAD, CRATE_RESPAWN, bombModel }, { createBoss, Telegraph, Runner, Faller, Shot, Pool, Missile }, { Input, UI, setUIRoot }, { AudioManager }) => {
// Game states, main loop, cameras, rules and the guardian fight. Entry point (bottom of the file).










// ======================================================================
// GAME
// ======================================================================
// Sir Falls-A-Lot: Castle Climber. Game state machine, loop, camera and gameplay rules.
// Flow: climb the tower -> unlock the gate -> fight the tower's guardian in its hall -> next tower.

const CAUSES = {
    lava: 'THE LAVA CONSUMED YOU',
    skeleton: 'CUT DOWN BY A SKELETON',
    rat: 'GNAWED BY A PLAGUE RAT',
    bat: 'DRAINED BY A VAMPIRE BAT',
    spider: 'BITTEN BY A TOWER SPIDER',
    fire: 'BURNED BY DRAGONFIRE'
};
const KILL_TEXT = ['CRUSHED BY THE BONE TYRANT', 'DEVOURED BY THE BROOD MOTHER', 'BURNED BY THE ASH WYRM'];
const RAGE_TEXT = ['THE TYRANT IS ENRAGED', 'THE BROOD MOTHER SHRIEKS', 'THE WYRM IS ENRAGED'];
const NOINPUT = { x: 0, jumpPressed: false, jumpHeld: false, attackPressed: false, enterPressed: false, down: false, downPressed: false };
const ARENA_FOV = 62 * Math.PI / 180;
// damage dealt to a guardian
const DMG = { hit: 2, reflect: 3, bomb: 4, cannon: 6, smash: 4, megaSmash: 6 };
// combo: every 4 chained actions raise the multiplier (max x8)
const COMBO_TIME = 2.6, COMBO_STEP = 4, COMBO_MAX = 8;
const COMBO_WORDS = ['', '', 'NICE!', 'SPOOKY!', 'FRIGHTFUL!', 'WICKED!', 'MONSTROUS!', 'GHOULISH!', 'SIR SMASH-A-LOT!'];
const SPLAT_WORDS = ['OUCH!', 'BONK!', 'OOF!', 'SPLAT!', 'CLANG!', 'THUD!', 'MY NOSE!'];
const INTRO_END = 6.7;
const FALL_VOICE_MIN_DROP = 9; // only speak on a genuinely high fall

// Arcade edition: the game runs inside the cabinet's screen in How You Haunt Me. `host` gives it its DOM (a shadow
// root), asset paths and the way back to the house; the loop only runs while the arcade is open (start / stop).
class Game {
    constructor(host) {
        this.host = host;
        setUIRoot(host.root);
        this.audio = AudioManager;
        try { if (localStorage.getItem(STORE_MUTED) === '1') this.audio.setMuted(true); } catch (_) { }
        this.input = new Input();
        this.canvas = host.root.getElementById('gl');
        this.ui = new UI(this);
        try {
            this.renderer = new Renderer(this.canvas, { post: true });
        } catch (e) {
            this.ui.error('This device or browser does not support WebGL 2, which the 3D tower needs. Try a recent Chrome, Safari or Firefox.');
            return;
        }
        this.mobile = this.ui.touchMode;
        this.quality = this.mobile ? 0 : 1;
        this.dpr = Math.min(window.devicePixelRatio || 1, this.mobile ? 1.5 : 1.5);
        this.camera = new Camera(CONFIG.FOV, 0.3, 1600);
        this.baseFov = CONFIG.FOV * Math.PI / 180;
        this.state = 'loading';
        this.time = 0;
        this.shake = 0;
        this.hitstop = 0;
        this.slowmo = 0;
        this.best = 0;
        try { this.best = +(localStorage.getItem(STORE_BEST) || 0); } catch (_) { }
        this._frameTimes = [];
        this._tmp = new Vec3(); this._tmp2 = new Vec3(); this._tmp3 = new Vec3();
        this.onResize = () => this.resize();
        window.addEventListener('resize', this.onResize);
        window.visualViewport?.addEventListener('resize', this.onResize);
        if (window.ResizeObserver) {
            this.resizeObserver = new ResizeObserver(this.onResize);
            this.resizeObserver.observe(host.root.getElementById('app'));
        }
        document.addEventListener('visibilitychange', () => { if (document.hidden && (this.state === 'play' || this.state === 'boss')) this.pause(); });
        const shown = (id) => !host.root.getElementById(id).classList.contains('hidden');
        this.input.onAnyKey = (e) => {
            if (this.state === 'menu' && e.code === 'Escape') { if (shown('howto') || shown('credits')) { this.ui.hide('howto'); this.ui.hide('credits'); } else host.requestClose(); return; }
            if (this.state === 'menu' && (e.code === 'Enter' || e.code === 'Space') && !shown('howto') && !shown('credits')) this.startGame();
            else if (this.state === 'deadScreen' && (e.code === 'Enter' || e.code === 'Space')) this.retry();
            else if (this.state === 'winScreen' && (e.code === 'Enter' || e.code === 'Space')) this.nextLevel();
            else if (this.state === 'paused' && (e.code === 'Escape' || e.code === 'KeyP')) { if (shown('howto')) this.ui.closeHowto(); else this.resume(); }
            else if (this.state === 'intro' && !e.repeat && this.introT > 0.5) this._skipIntro = true;
        };
        host.root.addEventListener('pointerdown', (e) => {
            if (e.pointerType === 'touch' || e.pointerType === 'pen') this.ui.setTouchMode(true);
            if (this.state === 'intro' && this.introT > 0.5) this._skipIntro = true;
        });
        // a gamepad: A / Start pick in the menus, B / Back leave the arcade from the title, Start pauses
        this.input.onPad = (b) => {
            this.ui.setTouchMode(false);
            const st = this.state;
            if (st === 'menu') { if (shown('howto') || shown('credits')) { if (b === 'A' || b === 'B') { this.ui.hide('howto'); this.ui.hide('credits'); } return; } if (b === 'A' || b === 'START') this.startGame(); else if (b === 'B' || b === 'BACK') host.requestClose(); }
            else if (st === 'deadScreen') { if (b === 'A' || b === 'START') this.retry(); else if (b === 'B') this.toMenu(); }
            else if (st === 'winScreen') { if (b === 'A' || b === 'START') this.nextLevel(); }
            else if (st === 'paused') { if (shown('howto')) { if (b === 'A' || b === 'B' || b === 'START') this.ui.closeHowto(); } else if (b === 'A' || b === 'START' || b === 'B') this.resume(); else if (b === 'BACK') host.requestClose(); }
            else if (st === 'intro' && (b === 'A' || b === 'START') && this.introT > 0.5) this._skipIntro = true;
        };
        this.running = false;
        this._raf = 0;
    }

    // the arcade opens: build everything on the first visit, then run the loop
    start() {
        this.input.active = true;
        this.input.clearAll();
        if (!this.T) {
            // (the first visit builds the textures: let the loading screen show first)
            if (this._initing) return;
            this._initing = true;
            requestAnimationFrame(() => setTimeout(() => {
                this._initing = false;
                if (!this.input.active || !this.renderer) return;
                this.resize(); this._init(); this._loop();
            }, 30));
            return;
        }
        this._loop();
    }
    _loop() {
        if (this.running) return;
        this.running = true;
        this.last = performance.now();
        const loop = (now) => { if (!this.running) return; this._raf = requestAnimationFrame(loop); this.frame(now); };
        this._raf = requestAnimationFrame(loop);
    }
    // the arcade closes: a game in progress pauses (it waits for you), the loop stops
    stop() {
        if (['play', 'countdown', 'boss', 'bossIntro'].includes(this.state)) this.pause();
        this.input.active = false;
        this.input.clearAll();
        this.running = false;
        cancelAnimationFrame(this._raf);
    }

    _init() {
        this.resize();
        this.T = makeTextures(this.quality);
        this.M = makeMaterials(this.T);
        this.scene = new Node();
        this.world = new World(this.renderer, this.T, this.M, this.quality);
        this.world.onThunder = () => this.audio.sfx('thunder');
        this.scene.add(this.world.root);
        this.fireGlow = makeBillboardMaterial(this.T.glow, [1.0, 0.45, 0.12], 'fireglow');
        this.fireGlow.uniforms.uStrength = 1.3;
        Telegraph.beamTex = this.T.beam;
        this._ringGeo = plane(1, 1); this._ringGeo.shared = true;
        this.runFalls = 0; this.runFallM = 0;
        this._applyTowerEnv();
        this.level = 1; this.score = 0; this.lives = CONFIG.START_LIVES;
        this.toMenu();
        this.ui.loaded();
        this.ui.setBest(this.best);
        this.last = performance.now();
    }

    // Halloween night round the tower: violet fog, cold moonlight from above, the lava glowing orange below
    _applyTowerEnv() {
        const e = this.renderer.env;
        e.fogColor = [0.085, 0.03, 0.11];
        e.fogDensity = 0.0115;
        e.hemiSky = [0.045, 0.04, 0.085];
        e.hemiGround = [0.06, 0.024, 0.03];
        e.dirColor = [0.15, 0.15, 0.25];
        e.envTop = [0.09, 0.07, 0.17];
        e.envBottom = [0.45, 0.14, 0.05];
        e.rimColor = [0.36, 0.2, 0.55];
        e.lavaGlow = [0.9, 0.28, 0.05];
        e.exposure = 1.12;
        this.renderer.clearColor = [0.05, 0.02, 0.08];
        const pp = this.renderer.post;
        pp.vignette = 0.5; pp.saturation = 1.12; pp.contrast = 1.08; pp.lift = [0.018, 0.0, 0.04]; pp.gain = [1.03, 0.97, 1.02];
        this.world.root.visible = true;
    }
    // the guardian's hall: black air, fire bowls, a glowing pit
    _applyArenaEnv(theme) {
        const e = this.renderer.env;
        e.fogColor = [0.05, 0.012, 0.02];
        e.fogDensity = 0.0125;
        e.hemiSky = [0.05, 0.04, 0.075];
        e.hemiGround = [0.07, 0.02, 0.02];
        e.dirColor = [0.14, 0.11, 0.2];
        e.envTop = [0.08, 0.06, 0.12];
        e.envBottom = [0.3, 0.08, 0.05];
        e.rimColor = [theme.glow[0] * 0.45, theme.glow[1] * 0.45, theme.glow[2] * 0.45];
        e.lavaGlow = [theme.glow[0] * 0.55, theme.glow[1] * 0.55, theme.glow[2] * 0.55];
        e.lavaY = -7;
        e.exposure = 1.1;
        this.renderer.clearColor = [0.03, 0.008, 0.012];
        const pp = this.renderer.post;
        pp.vignette = 0.55; pp.saturation = 1.12; pp.contrast = 1.08;
        this.world.root.visible = false;
    }

    resize() {
        // Use the displayed canvas dimensions, not the browser's layout viewport:
        // these can differ on mobile and inside an embedded game frame.
        // (arcade: the layout size, so the screen's power-on animation (a CSS transform) can't shrink the canvas)
        const w = this.canvas.clientWidth, h = this.canvas.clientHeight;
        if (this.renderer && w > 0 && h > 0) {
            this.renderer.setSize(w, h, this.dpr);
            this.renderer.post.inkPx = clamp(this.dpr * 0.95, 1, 1.6);
            this._applyResponsiveFov();
        }
    }

    _setBaseFov(fov) {
        this.baseFov = fov;
        this._applyResponsiveFov();
    }

    _applyResponsiveFov() {
        if (!this.camera || !this.renderer || !this.baseFov) return;
        const aspect = this.renderer.width / Math.max(1, this.renderer.height);
        // Ultra-tall screens need a tighter vertical crop: compensating the full
        // aspect ratio reveals too much tower above and below the action.
        const compensation = clamp(Math.sqrt((9 / 16) / aspect), 1, 1.3);
        this.camera.fov = 2 * Math.atan(Math.tan(this.baseFov / 2) * compensation);
    }

    // ---------------------------------------------------------------- level
    // free the GPU buffers of something removed from the scene mid-level
    _disposeTree(node) {
        const seen = new Set();
        node.traverse(n => {
            this.renderer.disposeObject(n);
            if (n.geometry && !n.geometry.shared && !seen.has(n.geometry)) { seen.add(n.geometry); this.renderer.disposeGeometry(n.geometry); }
        });
    }

    _disposeLevel() {
        if (!this.levelRoot) return;
        this.scene.remove(this.levelRoot);
        const seen = new Set();
        this.levelRoot.traverse(n => {
            this.renderer.disposeObject(n);
            if (n.geometry && !n.geometry.shared && !seen.has(n.geometry)) { seen.add(n.geometry); this.renderer.disposeGeometry(n.geometry); }
        });
        this.levelRoot = null;
        this.ui.clearFloaters();
    }

    _addShadowTo(en) {
        if (en.kind !== 'skeleton' && en.kind !== 'rat') return;
        const sh = new Mesh(plane(1, 1), this.M.shadow);
        sh.rotation.x = -Math.PI / 2; sh.position.y = 0.03;
        const s = en.kind === 'rat' ? 0.9 : 0.8;
        sh.scale.set(s, s * 0.8, 1);
        en.root.add(sh);
    }

    _addKnight(root) {
        this.knight = new KnightModel();
        this.knight.root.scale.set(1.1, 1.1, 1.1);
        root.add(this.knight.root);
        this.trail = new SwordTrail(12);
        root.add(this.trail.mesh);
        this.shadow = new Mesh(plane(1, 1), this.M.shadow);
        this.shadow.frustumCulled = false;
        root.add(this.shadow);
        // soft silhouette cast onto the tower wall behind the knight
        this.wallShadow = new Mesh(plane(1, 1), this.M.shadow);
        this.wallShadow.frustumCulled = false;
        root.add(this.wallShadow);
        this.knight.onClonk = () => this.audio.sfx('clang');
    }

    _buildLevel(level, seed) {
        this._endBoss();
        this._disposeLevel();
        setPathRadius(CONFIG.PATH_RADIUS);
        this._setBaseFov(CONFIG.FOV * Math.PI / 180);
        this.seed = seed;
        const desc = this.desc = generateLevel(level, seed);
        const root = this.levelRoot = new Node();
        this.tower = new Tower(desc, this.M, this.T);
        this.stage = this.tower;
        this.items = new Items(desc, this.M, this.T);
        // enemies must stand on the tower's runtime ledges (not the generator's copies)
        const byId = new Map(this.tower.platforms.map(p => [p.id, p]));
        this.enemies = desc.enemies.map(s => createEnemy(s.platform ? Object.assign({}, s, { platform: byId.get(s.platform.id) }) : s, this.M)).filter(Boolean);
        this.fireballs = [];
        this.fx = new FX(root);
        root.add(this.tower.root, this.items.root);
        for (const en of this.enemies) { root.add(en.root); this._addShadowTo(en); }
        this._addKnight(root);
        this.scene.add(root);
        this.player = new Player(desc.startTheta, 0);
        this.player.platform = this.tower.platforms.find(p => p.type === 'ground');
        this.tower.onCrumble = (p) => {
            const c = polar(p.theta, R + 0.9, p.y - 0.3);
            this.fx.chunk(c, 10, [0.62, 0.5, 0.45], 0.16, 3);
            this.fx.burst('dust', c, 12, { radius: 0.6 });
            this.audio.sfx('crumble');
        };
        this.lavaY = CONFIG.LAVA_START_Y;
        this.lavaActive = false;
        this.greed = 0; this.keys = 0; this.timeStop = 0;
        this.stats = { coins: 0, chests: 0, kills: 0, falls: 0, fallM: 0, bestCombo: 0 };
        this._resetJuice();
        this.camTheta = this.player.theta;
        this.camY = 1;
        this.warnT = 0;
        this.dreadT = 12 + Math.random() * 10;
        this.lockedWarned = false;
        this.tower.exit.unlocked = false;
    }

    // ---------------------------------------------------------------- states
    toMenu() {
        this.ui.hideAllScreens();
        this.ui.setHudVisible(false);
        this.ui.fade(false, 0.01);
        this._buildLevel(1, CONFIG.FIRST_TOWER_SEED);
        this.state = 'menu';
        this.menuT = 0;
        this.ui.show('menu');
        this.ui.setBest(this.best);
        this.audio.playMenuMusic();
        this.input.reset();
    }
    startGame() {
        this.level = 1; this.score = 0; this.lives = CONFIG.START_LIVES;
        this.runFalls = 0; this.runFallM = 0;
        // the opening cinematic plays once per visit; later games start with the countdown
        const intro = !this._introSeen;
        this._introSeen = true;
        this.startLevel(CONFIG.FIRST_TOWER_SEED, intro);
    }
    _seedFor(level) { return (level * 7919 + Math.floor(Math.random() * 100000)) >>> 0; }
    startLevel(seed, intro) {
        this.slowmo = 0; this.hitstop = 0;
        this.bossTries = 0;
        this.ui.hideAllScreens();
        this.ui.hideToast();
        this.ui.fade(false, 0.35);
        this._buildLevel(this.level, seed);
        this.levelStartScore = this.score;
        this.ui.setHudVisible(true);
        this.ui.setBossMode(false);
        this.ui.setLevel(this.level);
        this.ui.setScore(this.score);
        this.ui.setGreed(0);
        this.ui.setHearts(this.player.hp);
        this.ui.setLives(this.lives);
        this.ui.setKey(false);
        this.ui.setFrost(false);
        this.ui.setLavaWarning(false);
        this.ui.setDoorPrompt(false);
        this.ui.setFalls(this.runFalls);
        this.ui.clearPop();
        this.input.reset();
        if (intro) { this._startIntro(); return; }
        this.state = 'countdown';
        this.ui.coach();
        this.countT = 3.0;
        this._lastCount = 4;
        this.audio.playGameMusic(this.level);
        this._snapCamera();
    }
    retry() {
        if (this.lives <= 0) { this.startGame(); return; }
        if (this.inBoss) {
            // try the guardian again (the tower stays conquered)
            this.score = this.bossStartScore;
            this.stats = Object.assign({}, this.bossStartStats);
            this.ui.hideAllScreens();
            this._startBossFight();
            return;
        }
        this.score = this.levelStartScore;
        this.startLevel(this.seed);
    }
    nextLevel() {
        this.level++;
        this.startLevel(this._seedFor(this.level));
    }
    pause() {
        if (this.state !== 'play' && this.state !== 'countdown' && this.state !== 'boss' && this.state !== 'bossIntro') return;
        this._prevState = this.state;
        this.state = 'paused';
        this.ui.show('pause');
        this.ui.updateMuteIcons();
        this.audio.duckMusic(true);
    }
    resume() {
        if (this.state !== 'paused') return;
        this.ui.hide('pause'); this.ui.hide('confirm'); this.ui.hide('howto');
        this.state = this._prevState || 'play';
        this.audio.duckMusic(false);
        this.input.reset();
        this.last = performance.now();
    }

    // ---------------------------------------------------------------- loop
    frame(now) {
        let dt = Math.min(0.05, (now - this.last) / 1000);
        this.last = now;
        this.input.pollPad();
        if (dt <= 0) return;
        this._adaptQuality(dt);
        if (this.state === 'paused') { this.input.endFrame(); return; }
        if (this.hitstop > 0) { this.hitstop -= dt; dt *= 0.08; }
        else if (this.slowmo > 0) { this.slowmo -= dt; dt *= 0.3; }
        this.time += dt;
        this.update(dt);
        this.render(dt);
        this.input.endFrame();
    }

    _adaptQuality(dt) {
        const ft = this._frameTimes;
        ft.push(dt);
        if (ft.length < 90) return;
        const avg = ft.reduce((a, b) => a + b, 0) / ft.length;
        ft.length = 0;
        const pp = this.renderer.post;
        // shed the cheapest-to-lose quality first: AO, then resolution, then AA, then all post
        if (avg > 0.024 && pp.ao > 0) { pp.ao = 0; return; }
        if (avg > 0.026 && this.dpr > 1.0) { this.dpr = Math.max(1.0, this.dpr - 0.25); this.resize(); }
        else if (avg > 0.03 && this.dpr > 0.8) { this.dpr = Math.max(0.8, this.dpr - 0.1); this.resize(); }
        else if (avg > 0.034 && pp.aa > 0) { pp.aa = 0; }
        else if (avg > 0.04 && pp.enabled) { pp.enabled = false; this.renderer._freeTargets(); }
    }

    update(dt) {
        const st = this.state;
        const P = this.player;
        if (st === 'menu') { this._updateMenu(dt); return; }
        if (st === 'intro') { this._updateIntro(dt); return; }
        if (st === 'countdown') {
            this.countT -= dt;
            const n = Math.ceil(this.countT);
            if (n !== this._lastCount && n > 0) { this._lastCount = n; this.ui.center(String(n)); this.audio.sfx('beep', 0); }
            if (this.countT <= 0) {
                this.state = 'play';
                this.ui.center('GO!', false, 0.7);
                this.audio.sfx('beep', 1);
                this.ui.sub('MOVE TO START');
            }
            this._updateWorld(dt, true);
            return;
        }
        if (st === 'play') {
            if (this.input.pausePressed) { this.pause(); return; }
            this._updatePlay(dt);
            return;
        }
        if (st === 'toBoss') { this._updateToBoss(dt); return; }
        if (st === 'bossIntro') {
            if (this.input.pausePressed) { this.pause(); return; }
            this._updateBossIntro(dt);
            return;
        }
        if (st === 'boss') {
            if (this.input.pausePressed) { this.pause(); return; }
            this._updateBoss(dt);
            return;
        }
        if (st === 'bossDying') { this._updateBossDying(dt); return; }
        if (st === 'dying') {
            this.dieT += dt;
            const ev = [];
            P.update(dt, NOINPUT, this.stage, ev);
            if (P.lava && Math.random() < 0.6) {
                const c = polar(P.theta, PATH.r, P.y + 0.5 + Math.random() * 0.6);
                this.fx.emit('fire', c.x, c.y, c.z, (Math.random() - 0.5), 1.5, (Math.random() - 0.5), 1.4);
                if (Math.random() < 0.3) this.fx.emit('smoke', c.x, c.y + 0.5, c.z, 0, 1.2, 0, 1.5);
            }
            if (this.inBoss) this._updateBossScene(dt, true);
            else this._updateWorld(dt, false);
            if (this.dieT > 1.8) this._showDeath();
            return;
        }
        // deadScreen / winScreen: keep the world alive in the background
        if (this.inBoss) this._updateBossScene(dt, false);
        else this._updateWorld(dt, false);
    }

    _updateMenu(dt) {
        this.menuT += dt;
        const t = this.menuT;
        const P = this.player;
        P.facing = 1;
        this.tower.update(dt, this.time);
        const k = this.knight;
        k.root.position.copy(polar(0, PATH.r, 0));
        k.root.rotation.y = Math.sin(t * 0.4) * 0.5;
        k.animate(dt, { speed: 0, grounded: true, vy: 0, attack: (t % 6) > 5 ? ((t % 6) - 5) / CONFIG.ATTACK_TIME * 0.34 : -1, hurt: 0, dead: false, win: false });
        this.shadow.position.copy(polar(0, PATH.r, 0.03));
        this.shadow.rotation.x = -Math.PI / 2; this.shadow.scale.set(0.9, 0.9, 1);
        const ctx = this._ctx(dt, { theta: Math.PI, y: -50, alive: false });
        for (const en of this.enemies) { en.update(dt, ctx); this._cullEnemy(en); }
        this.items.update(dt, this.time, this.camTheta);
        this.fx.update(dt);
        // orbiting camera that climbs and descends along the tower
        const a = 0.35 + t * 0.09;
        const ch = 2.5 + (1 - Math.cos(t * 0.07)) * 0.5 * (this.tower.H * 0.7);
        this.camTheta = a;
        const D = this._camDist() + 4;
        this.camera.position.copy(polar(a, D, ch + 3.2));
        this.camera.target.copy(polar(a, 0.5, ch + 1.2));
        this.camY = ch;
        this._updateEnv(dt, ch);
    }

    _ctx(dt, playerLike) {
        const frozen = this.timeStop > 0;
        return {
            time: this.time, dt,
            player: playerLike || { theta: this.player.theta, y: this.player.y, alive: this.player.alive && !this.player.door },
            enemySpeed: frozen ? 0.12 : this.desc.params.enemySpeed * (1 + this.greed * 0.003),
            fx: this.fx, audio: this.audio, camTheta: this.camTheta, lavaY: this.lavaY,
            spawnFireball: (pos, pl, speed) => this._spawnFireball(pos, pl, speed)
        };
    }

    _spawnFireball(pos, pl, speed) {
        const target = polar(pl.theta, PATH.r, pl.y + 0.8);
        const fb = new Fireball(pos, target, this.fireGlow, this.M, speed);
        this.fireballs.push(fb);
        this.levelRoot.add(fb.root);
        this.audio.sfx('fire');
    }

    lavaSpeed() {
        const LP = this.desc.params;
        return Math.min(CONFIG.MAX_LAVA_SPEED, LP.lavaSpeed + this.greed * LP.greedLava);
    }

    _updatePlay(dt) {
        const P = this.player, I = this.input, ui = this.ui;
        if (!this.lavaActive && P.moved) { this.lavaActive = true; ui.sub(null); }
        this.timeStop = Math.max(0, this.timeStop - dt);
        const frozen = this.timeStop > 0;
        if (this.lavaActive && !frozen) this.lavaY += this.lavaSpeed() * dt;
        this.tower.update(dt, this.time);

        const ev = [];
        P.update(dt, I, this.tower, ev);
        for (const e of ev) this._onPlayerEvent(e);
        for (const p of this.tower.platforms) {
            if (p.type === 'crumble' && p.state === 'shaking' && Math.random() < dt * 14) {
                const th = p.theta + (Math.random() - 0.5) * p.half * 2;
                this.fx.burst('dust', polar(th, R + 0.4 + Math.random() * 1.2, p.y - p.thick), 1, { radius: 0.1, speed: 0.4, vy: -1 });
            }
        }

        // lava
        // touching the lava costs a heart and bounces the knight up; only sinking deep (or the last heart) kills
        if (!P.dead && !P.door) {
            if (P.y < this.lavaY - 1.2) {
                P.kill('lava', true);
                this._onDeath('lava');
            } else if (P.y < this.lavaY - 0.18) {
                if (P.invuln <= 0) {
                    const res = P.lavaHit();
                    if (res === 'dead') this._onDeath('lava');
                    else if (res === 'hurt') {
                        this._comboBreak();
                        if (this._screaming) { this._screaming = false; this.audio.screamStop(); }
                        this.audio.playVoice('lava');
                        this.audio.sfx('burn'); this.audio.sfx('hurt');
                        this.knight.hit();
                        this.ui.setHearts(Math.max(0, P.hp), true);
                        this.ui.damageFlash();
                        this.shake = Math.max(this.shake, 0.35);
                        this.hitstop = 0.04;
                        const c = polar(P.theta, PATH.r, P.y + 0.35);
                        this.fx.burst('fire', c, 16, { speed: 1.3, vy: 2.2 });
                        this.fx.burst('spark', c, 12, { speed: 1.5, vy: 2.5 });
                        this.ui.floater(c, '-1 ♥', '#ff4d2e');
                    }
                } else if (P.vy < 0) P.vy = Math.max(P.vy, 5.5); // keep bobbing out while blinking
            }
        }

        // items
        const got = this.items.collect(P.theta, P.y, []);
        for (const it of got) this._onCollect(it);

        // enemies
        const ctx = this._ctx(dt);
        for (const en of this.enemies) { if (en.alive) en.update(dt, ctx); this._cullEnemy(en); }
        this._combat();
        // fireballs
        for (let i = this.fireballs.length - 1; i >= 0; i--) {
            const fb = this.fireballs[i];
            if (fb.alive && !frozen) fb.update(dt, ctx);
            if (fb.alive && P.alive && !P.door) {
                const pc = polar(P.theta, PATH.r, P.y + 0.75, this._tmp);
                if (pc.distanceTo(fb.pos) < 0.72) {
                    fb.explode(ctx);
                    this._hurtPlayer(Math.atan2(fb.pos.x, fb.pos.z), 'fire');
                }
            }
            if (!fb.alive) { this.levelRoot.remove(fb.root); this._disposeTree(fb.root); this.fireballs.splice(i, 1); }
        }

        // exit gate: the guardian waits behind it
        const ex = this.tower.exit;
        const atGate = P.grounded && P.platform && P.platform.type === 'top' && Math.abs(angleDiff(P.theta, ex.theta)) * PATH.r < 0.8;
        if (atGate && !P.dead) {
            if (this.keys > 0) this._enterGate();
            else if (!this.lockedWarned) { this.lockedWarned = true; ui.toast('The gate is locked. <b>Find the key</b> on the tower!'); this.audio.sfx('door'); }
        } else if (!atGate) this.lockedWarned = false;

        // door prompt
        ui.setDoorPrompt(!!P.availableDoor());

        // lava warning
        const lavaGap = P.y - this.lavaY;
        const warn = this.lavaActive && lavaGap < 4.5 && !P.dead;
        // the Mountain King speeds up as the lava catches up (seconds until it reaches you), greed adds to it
        const ttc = this.lavaActive && !frozen ? lavaGap / Math.max(0.05, this.lavaSpeed()) : 40;
        const tense = clamp(1 - (ttc - 4) / 16, 0, 1) * 0.85 + clamp(this.greed / 100, 0, 1) * 0.25;
        this._tension = damp(this._tension || 0, Math.min(1, tense), 0.8, dt);
        this.audio.musicTension(this._tension);
        ui.setLavaWarning(warn);
        if (warn) { this.warnT -= dt; if (this.warnT <= 0) { this.warnT = 0.7; this.audio.sfx('lava'); } }
        ui.setFrost(frozen);
        this._dread(dt);

        if (this.state === 'play') this._updateWorld(dt, false);
        ui.setMeter(P.y / this.tower.H, (this.lavaY - CONFIG.LAVA_START_Y) / (this.tower.H - CONFIG.LAVA_START_Y), this._keyFrac());
    }

    // distant bells, whispers and a racing heart when the knight is nearly dead
    _dread(dt, ambient = true) {
        const P = this.player;
        this.dreadT -= dt;
        if (ambient && this.dreadT <= 0) {
            this.dreadT = 16 + Math.random() * 18;
            this.audio.sfx(Math.random() < 0.55 ? 'bell' : 'whisper');
        }
        if (P.hp === 1 && !P.dead) {
            this._beatT = (this._beatT || 0) - dt;
            if (this._beatT <= 0) { this._beatT = 0.95; this.audio.sfx('heartbeat'); }
        }
    }

    _keyFrac() {
        if (this.keys > 0) return null;
        const k = this.items.list.find(o => o.type === 'key' && o.alive);
        return k ? k.y / this.tower.H : null;
    }

    _onPlayerEvent(e) {
        const P = this.player;
        const feet = polar(P.theta, PATH.r, P.y + 0.05, this._tmp);
        switch (e.type) {
            case 'jump':
                this.audio.sfx('jump');
                this.knight.jump();
                this.fx.burst('dust', feet, 6, { radius: 0.2, speed: 0.8 });
                break;
            case 'diveStart':
                this.audio.screamStop(); this._screaming = false;
                this.audio.sfx('dive');
                this.fx.burst('puff', polar(P.theta, PATH.r, P.y + 0.8), 8, { radius: 0.3, speed: 0.6 });
                break;
            case 'smash': this._smash(e); break;
            case 'splat': this._splat(e); break;
            case 'land':
                if (this._screaming) { this._screaming = false; this.audio.screamStop(); }
                this.audio.sfx('land', e.speed);
                this.knight.land(e.speed);
                this.fx.burst('dust', feet, Math.min(16, 4 + Math.floor(e.speed * 0.6)), { radius: 0.25, speed: 0.6 + e.speed * 0.05 });
                if (e.speed > 16) this.shake = Math.max(this.shake, 0.25);
                break;
            case 'step': this.audio.sfx('step'); if (Math.random() < 0.5) this.fx.burst('dust', feet, 1, { radius: 0.1, speed: 0.3, size: 0.7 }); break;
            case 'swing': this.audio.sfx('swing'); this.knight.swing(); if (this.inBoss) this._aimSwing(); break;
            case 'crumbleStart': this.audio.sfx('crumble'); break;
            case 'doorEnter': this.audio.sfx('door'); break;
            case 'doorSwap': this.audio.sfx('door'); break;
        }
    }

    _onCollect(it) {
        const P = this.player, ui = this.ui, C = CONFIG;
        const pos = this.items.worldPos(it, new Vec3());
        this._comboAdd(it.type === 'chest' ? 2 : 1);
        const mult = this.combo.mult;
        switch (it.type) {
            case 'coin': {
                const v = Math.round(C.SCORE_COIN * (1 + this.greed / 100) * mult);
                this.score += v; this.greed += C.GREED_COIN; this.stats.coins++;
                this.audio.sfx('coin', Math.min(10, this.stats.coins % 12));
                this.fx.burst('gold', pos, 8);
                ui.floater(pos, '+' + Math.floor(v));
                break;
            }
            case 'key':
                this.keys++; this.score += C.SCORE_KEY; this.greed += C.GREED_KEY;
                this.tower.exit.unlocked = true;
                this.audio.sfx('key'); this.audio.sfx('gate');
                this.fx.burst('gold', pos, 30, { speed: 1.4 });
                ui.setKey(true);
                ui.toast('<b>Key found!</b> The gate at the top is open. Something waits inside.', 3.2);
                ui.floater(pos, '+' + C.SCORE_KEY);
                break;
            case 'chest': {
                const v = C.SCORE_TREASURE * mult;
                this.score += v; this.greed += C.GREED_TREASURE; this.stats.chests++;
                this.audio.sfx('treasure');
                this.fx.burst('gold', pos, 40, { speed: 1.3, vy: 2 });
                ui.floater(pos, '+' + v, '#ffd36e');
                ui.toast('Treasure! Your <b>greed</b> grows, and so does the lava.', 2.4);
                break;
            }
            case 'hourglass':
                this.score += C.SCORE_HOURGLASS; this.timeStop = C.TIME_STOP_SECONDS;
                this.audio.sfx('hourglass');
                this.fx.burst('magic', pos, 30, { speed: 1.2 });
                ui.center('TIME STOPS', true, 1.2);
                ui.floater(pos, '+' + C.SCORE_HOURGLASS, '#9ff0ff');
                break;
            case 'heart':
                P.hp = Math.min(C.MAX_HP, P.hp + 1); this.score += 100;
                this.audio.sfx('heart');
                this.fx.burst('heal', pos, 24);
                ui.setHearts(P.hp);
                ui.floater(pos, '+1 ♥', '#ff8a9a');
                break;
        }
        ui.setScore(this.score);
        if (!this.inBoss) ui.setGreed(this.greed, it.type !== 'hourglass' && it.type !== 'heart');
    }

    _combat() {
        const P = this.player;
        if (P.dead || P.door) return;
        const C = CONFIG;
        // sword hits
        if (P.attackActive && !P.attackHit) {
            let hitAny = false;
            for (const en of this.enemies) {
                if (!en.alive || !en.killable) continue;
                const hb = en.hitbox();
                if (!hb) continue;
                const d = angleDiff(hb.theta, P.theta) * PATH.r * P.facing;
                if (d > -0.45 && d < C.ATTACK_RANGE + hb.half && hb.y1 > P.y - 0.3 && hb.y0 < P.y + 2.0) {
                    en.kill(this._ctx(0));
                    hitAny = true;
                    const c = en.root.position.clone(); c.y = en.y + 0.9;
                    this._killScore(en, c);
                    this.fx.burst('spark', c, 10);
                }
            }
            // parry fireballs
            const tip = polar(P.theta + P.facing * 0.9 / PATH.r, PATH.r, P.y + 1.0, this._tmp2);
            for (const fb of this.fireballs) {
                if (fb.alive && fb.pos.distanceTo(tip) < 1.35) {
                    fb.explode(this._ctx(0), true);
                    this._comboAdd(1);
                    const v = C.SCORE_FIREBALL * this.combo.mult;
                    this.score += v;
                    this.ui.floater(fb.pos, 'PARRY +' + v, '#ffb070');
                    hitAny = true;
                }
            }
            if (hitAny) {
                P.attackHit = true;
                this.hitstop = 0.06;
                this.shake = Math.max(this.shake, 0.12);
                this.audio.sfx('hit');
                this.ui.setScore(this.score);
            }
        }
        // a diving knight flattens whatever he falls on
        this._diveContact();
        // contact damage
        if (P.invuln > 0) return;
        for (const en of this.enemies) {
            if (!en.alive || en.harmless) continue;
            const hb = en.hitbox();
            if (!hb) continue;
            const d = Math.abs(angleDiff(P.theta, hb.theta)) * PATH.r;
            if (d < hb.half + C.PLAYER_HALF_W * 0.8 && P.y < hb.y1 - 0.05 && P.y + 1.3 > hb.y0) {
                this._hurtPlayer(hb.theta, en.kind);
                break;
            }
        }
    }

    // score a slain foe (with the combo multiplier)
    _killScore(en, pos, extra) {
        this._comboAdd(1);
        const base = en.kind === 'rat' ? 100 : en.kind === 'bat' ? 120 : CONFIG.SCORE_KILL;
        const v = base * this.combo.mult;
        this.score += v; this.stats.kills++;
        this.ui.floater(pos, (extra || '') + '+' + v, '#f0e4c9');
        this.ui.setScore(this.score);
        return v;
    }

    _diveContact() {
        const P = this.player;
        if (!P.diving || P.dead) return;
        for (const en of this.enemies) {
            if (!en.alive || !en.killable || en.harmless) continue;
            const hb = en.hitbox();
            if (!hb) continue;
            const d = angleDiff(hb.theta, P.theta) * PATH.r;
            if (Math.abs(d) < hb.half + CONFIG.PLAYER_HALF_W + 0.25 && P.y < hb.y1 + 0.35 && P.y + 1.3 > hb.y0) {
                this._launchEnemy(en, d, 0.7, 'STOMP ');
                this._stompBounce();
                return;
            }
        }
    }
    _stompBounce() {
        const P = this.player;
        P.bounce(10.5);
        this.knight.jump();
        this.hitstop = Math.max(this.hitstop, 0.06);
        this.shake = Math.max(this.shake, 0.25);
        this.audio.sfx('hit');
        this.fx.burst('spark', polar(P.theta, PATH.r, P.y + 0.2), 14, { speed: 1.4 });
    }

    _hurtPlayer(fromTheta, cause) {
        const P = this.player;
        if (!P.hurt(fromTheta, cause)) return;
        this._comboBreak();
        if (this._screaming) { this._screaming = false; this.audio.screamStop(); }
        if (this.inBoss && P.bomb) this._dropBomb();
        this.audio.sfx('hurt');
        this.knight.hit();
        this.ui.setHearts(Math.max(0, P.hp), true);
        this.ui.damageFlash();
        this.shake = Math.max(this.shake, 0.3);
        this.hitstop = 0.05;
        const c = polar(P.theta, PATH.r, P.y + 0.9);
        this.fx.burst('spark', c, 12);
        if (P.dead) this._onDeath(cause);
    }

    _onDeath(cause) {
        if (this.state === 'dying') return;
        this.state = 'dying';
        this.dieT = 0;
        this.deathCause = cause;
        this.lives--;
        this.ui.setLives(this.lives);
        this.ui.setLavaWarning(false);
        this.ui.setDoorPrompt(false);
        this.ui.setActionMode('sword');
        this.ui.setSiegeHint(0);
        this.ui.sub(null);
        this.shake = 0.4;
        this._comboBreak();
        this.ui.setDiveReady(false);
        if (this._screaming) { this._screaming = false; this.audio.screamStop(); }
        if (cause === 'lava') { this.audio.playVoice('lava'); this.audio.sfx('burn'); this.audio.sfx('die'); } else this.audio.sfx('die');
    }

    _showDeath() {
        this.state = 'deadScreen';
        const over = this.lives <= 0;
        if (over && this.score > this.best) { this.best = this.score; try { localStorage.setItem(STORE_BEST, String(Math.floor(this.best))); } catch (_) { } }
        let rows, title;
        if (this.inBoss) {
            const B = this.boss;
            title = KILL_TEXT[(this.level - 1) % 3];
            rows = [
                ['Tower', String(this.level)],
                ['Guardian', B.name.replace('THE ', '').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())],
                ['Guardian health', Math.ceil(B.hp) + ' / ' + B.maxHp],
                ['Lives left', String(Math.max(0, this.lives))],
                ['Score', Math.floor(this.score).toLocaleString('en-US'), 'total']
            ];
            if (over) rows.splice(4, 0, ['Best', Math.floor(this.best).toLocaleString('en-US')]);
            this.audio.stopBossMusic();
        } else {
            title = CAUSES[this.deathCause] || 'YOU FELL';
            rows = [
                ['Tower', String(this.level)],
                ['Height reached', Math.floor(Math.max(0, this.player.y)) + ' / ' + Math.floor(this.tower.H) + ' m'],
                ['Lives left', String(Math.max(0, this.lives))],
                ['Score', Math.floor(this.score).toLocaleString('en-US'), 'total']
            ];
            if (over) rows.splice(3, 0, ['Best', Math.floor(this.best).toLocaleString('en-US')]);
        }
        const n = this.runFalls, m = Math.round(this.runFallM);
        const fallLine = n === 0 ? 'Not a single fall. Suspicious.' : 'Fell ' + (n === 1 ? 'once' : n + ' times') + ', ' + m + ' meters total';
        this.ui.showDead(over ? 'GAME OVER' : title, rows, over, this.inBoss && !over, fallLine);
        this.ui.setHudVisible(false);
    }



    // ---------------------------------------------------------------- opening cinematic (first game of a visit)
    // lightning, the camera climbs the tower, a dragon roars past, the title slams in, then down to the knight
    _startIntro() {
        const P = this.player;
        this.state = 'intro';
        this.introT = 0;
        this._skipIntro = false;
        this._ifl = {};
        this._flashK = 0;
        this.ui.setHudVisible(false);
        this.ui.setIntro(true);
        this.ui.fade(false, 1.0);
        this.audio.fadeOutMusic();
        const d = createEnemy({ type: 'dragon', theta: 0, y: 8, dir: 1, phase: 0, fire: false }, this.M);
        if (d) { d.scaleNode.scale.set(1.15, 1.15, 1.15); d.root.visible = false; this.levelRoot.add(d.root); }
        this.cineDragon = d;
        this.shake = 0;
        this._updateIntroCamera(0);
    }

    _updateIntro(dt) {
        const P = this.player, f = this._ifl;
        const t = (this.introT += dt);
        if (this._skipIntro || this.input.pausePressed) { this._endIntro(); return; }
        const bolt = () => { this.world.nextFlash = 0; this._flashK = 1; };
        if (t > 0.15 && !f.bolt1) { f.bolt1 = true; bolt(); }
        if (t > 0.32 && !f.bolt1b) { f.bolt1b = true; this._flashK = 0.7; }
        if (t > 1.1 && !f.whoosh) { f.whoosh = true; this.audio.sfx('whoosh'); }
        if (t > 1.7 && !f.roar) { f.roar = true; this.audio.sfx('roar'); this.audio.sfx('growl'); this.shake = Math.max(this.shake, 0.55); }
        if (t > 3.3 && !f.title) {
            f.title = true; bolt();
            this.audio.sfx('titleSlam');
            this.ui.introTitle('show');
            this.shake = Math.max(this.shake, 0.75);
            this.audio.playGameMusic(this.level);
        }
        if (t > 4.9 && !f.dive) { f.dive = true; this.ui.introTitle('out'); this.audio.sfx('whoosh'); }
        this._flashK = Math.max(0, this._flashK - dt * 3.5);
        this.renderer.env.exposure = 1.1 + this._flashK * 2.4;
        this.tower.update(dt, this.time);
        const ctx = this._ctx(dt, { theta: P.theta + Math.PI, y: -50, alive: false });
        for (const en of this.enemies) { if (en.alive) en.update(dt, ctx); this._cullEnemy(en); }
        this._updateKnight(dt);
        this.items.update(dt, this.time, this.camTheta);
        this._updateIntroCamera(dt);
        this._updateCineDragon(dt, ctx);
        this._lavaFx(dt);
        this.fx.update(dt);
        this._updateEnv(dt, this.camY);
        if (t >= INTRO_END) this._endIntro();
    }

    _updateIntroCamera(dt) {
        const P = this.player, T = this.tower, t = this.introT;
        const H = T.H, ex = T.exit.theta;
        const sm = (a, b) => { const u = clamp((t - a) / (b - a), 0, 1); return u * u * (3 - 2 * u); };
        const D = this._camDist();
        // climb from the lava-lit base to the gate, circling the tower
        const e1 = sm(0, 3.5);
        const thA = ex - 2.3 * (1 - e1) + Math.max(0, t - 3.5) * 0.05;
        const distA = lerp(D * 0.62, D + 3.5, e1);
        const posYA = lerp(0.9, H + 3.6, e1);
        const lookYA = lerp(7.5, H + 1.8, e1);
        // then plunge down to the knight, where play begins
        const e3 = sm(4.9, 6.6);
        const lookYG = P.y + 1.1;
        const th = thA + angleDiff(P.theta, thA) * e3;
        const dist = lerp(distA, D, e3);
        const posY = lerp(posYA, lookYG + 2.4, e3);
        const lookY = lerp(lookYA, lookYG + 0.9, e3);
        const lookR = lerp(0, 1.5, e3);
        let sx = 0, sy = 0;
        if (this.shake > 0) {
            this.shake = Math.max(0, this.shake - dt * 1.6);
            const s = this.shake * this.shake * 1.2;
            sx = (Math.random() - 0.5) * s; sy = (Math.random() - 0.5) * s;
        }
        this.camera.position.set(Math.sin(th) * dist + Math.cos(th) * sx, posY + sy, Math.cos(th) * dist - Math.sin(th) * sx);
        this.camera.target.set(Math.sin(th) * lookR, lookY, Math.cos(th) * lookR);
        this.camTheta = th;
        this.camY = lerp(lookYA, lookYG, e3);
    }

    // the dragon crosses right in front of the lens, roaring fire
    _updateCineDragon(dt, ctx) {
        const d = this.cineDragon;
        if (!d) return;
        const t = this.introT, u = (t - 0.95) / 1.9;
        if (u < 0 || u > 1) { d.root.visible = false; return; }
        d.root.visible = true;
        d.update(dt, ctx);
        const C = this.camera.position;
        const f = this._tmp.copy(this.camera.target).sub(C).normalize();
        const rl = Math.hypot(f.x, f.z) || 1, rx = -f.z / rl, rz = f.x / rl;
        // cross the frame at a pace that reads on a narrow portrait screen too
        const fwd = 7.5;
        const halfW = fwd * Math.tan(this.camera.fov / 2) * (this.renderer.width / this.renderer.height);
        const side = lerp(-(halfW + 5), halfW + 5, u), upo = -1.6 + u * 2.6 - Math.sin(u * Math.PI) * 0.6;
        d.root.position.set(C.x + f.x * fwd + rx * side, C.y + f.y * fwd + upo, C.z + f.z * fwd + rz * side);
        d.root.rotation.set(-0.1, Math.atan2(rx, rz), -0.35);
        if (t > 1.65 && t < 2.35) {
            d.jaw.rotation.x = 0.75;
            d.head.rotation.y = -0.75;
            d.mouthGlow.scale.set(1.6, 1.6, 1.6);
            d.root.updateWorld(null);
            const h = d.head.worldPosition(this._tmp2);
            for (let i = 0; i < 3; i++) {
                const s = 5 + Math.random() * 4;
                this.fx.emit('fire', h.x, h.y, h.z, rx * s - f.x * 2 + (Math.random() - 0.5) * 2, (Math.random() - 0.3) * 2, rz * s - f.z * 2 + (Math.random() - 0.5) * 2, 1.8);
            }
        }
    }

    _endIntro() {
        const P = this.player;
        if (this.state !== 'intro') return;
        this.ui.setIntro(false);
        if (this.cineDragon) { this.levelRoot.remove(this.cineDragon.root); this._disposeTree(this.cineDragon.root); this.cineDragon = null; }
        this.renderer.env.exposure = 1.1; this._flashK = 0;
        this.ui.setHudVisible(true);
        this.state = 'play';
        this.ui.coach();
        this.ui.center('GO!', false, 0.7);
        this.audio.sfx('beep', 1);
        this.ui.sub('MOVE TO START');
        if (!this._ifl.title) this.audio.playGameMusic(this.level);
        this.input.reset();
        this.shake = 0;
        this.camY = P.y + 1.1;
        this._updateCamera(0);
    }

    // ---------------------------------------------------------------- ground-pound, slapstick falls, combo
    _resetJuice() {
        this.rings = [];
        this.flyers = [];
        this.combo = { n: 0, t: 0, mult: 1 };
        this.flail = false;
        this._fallVoicePlayed = false;
        if (this._screaming) this.audio.screamStop();
        this._screaming = false;
        if (this.ui) { this.ui.setCombo(0, 1, 0); this.ui.setDiveReady(false); }
    }

    _comboAdd(k) {
        const c = this.combo;
        c.n += k; c.t = COMBO_TIME;
        const m = Math.min(COMBO_MAX, 1 + Math.floor(c.n / COMBO_STEP));
        let bump = false;
        if (m > c.mult) {
            c.mult = m; bump = true;
            this.ui.pop(COMBO_WORDS[m] + ' x' + m, 'combo');
            this.audio.sfx('combo', m);
        }
        if (c.n > (this.stats.bestCombo || 0)) this.stats.bestCombo = c.n;
        this.ui.setCombo(c.n, c.mult, 1, bump);
    }
    _comboBreak() {
        const c = this.combo;
        if (!c || c.n === 0) return;
        c.n = 0; c.t = 0; c.mult = 1;
        this.ui.setCombo(0, 1, 0);
    }

    _countFall(h) {
        this.runFalls++; this.runFallM += h;
        this.stats.falls = (this.stats.falls || 0) + 1;
        this.stats.fallM = (this.stats.fallM || 0) + h;
        this.ui.setFalls(this.runFalls, true);
    }

    // a long fall without a ground-pound: faceplant, helmet pops off, stars
    _splat(e) {
        const P = this.player;
        this._screaming = false; this.audio.screamStop();
        this.knight.splat();
        this.audio.sfx('splat'); this.audio.sfx('oof');
        const feet = polar(P.theta, PATH.r, P.y + 0.05);
        this.fx.burst('dust', feet, Math.round(16 + Math.min(20, e.h * 2)), { radius: 0.45, speed: 1.1 + Math.min(1, e.h * 0.06) });
        this.fx.chunk(feet, 5, [0.55, 0.48, 0.44], 0.1, 3);
        this.shake = Math.max(this.shake, 0.3 + Math.min(0.45, e.h * 0.03));
        this.hitstop = Math.max(this.hitstop, 0.05);
        this.ui.floater(polar(P.theta, PATH.r, P.y + 1.7), SPLAT_WORDS[Math.floor(Math.random() * SPLAT_WORDS.length)], '#ffb08a');
        if (e.h >= 9) this.ui.pop(Math.round(e.h) + ' M FALL!', 'fall');
        this._countFall(e.h);
    }

    // ground-pound impact: shockwave, flying foes, loose gold, a big shout
    _smash(e) {
        const P = this.player, C = CONFIG, h = e.h;
        this._screaming = false; this.audio.screamStop();
        const power = clamp(h / 8, 0.15, 1.4);
        const radius = clamp(1.3 + h * 0.34, 1.5, 4.8);
        const feet = polar(P.theta, PATH.r, P.y + 0.05);
        this.knight.smashLand();
        this._shockRing(P.theta, P.y, radius, power);
        this.fx.burst('dust', feet, Math.round(14 + power * 26), { radius: 0.5, speed: 1.2 + power * 1.6 });
        this.fx.burst('spark', feet, Math.round(8 + power * 18), { speed: 1.4 + power });
        this.fx.chunk(feet, Math.round(5 + power * 9), [0.55, 0.48, 0.44], 0.12, 3 + power * 3);
        if (h > 5) this.fx.burst('fire', feet, Math.round(power * 22), { speed: 1.8, size: 1.2 });
        this.shake = Math.max(this.shake, 0.3 + power * 0.55);
        this.hitstop = Math.max(this.hitstop, 0.04 + power * 0.06);
        this.audio.sfx('smash', power);
        if (this.inBoss) this._flashLight(feet, [2 + power * 5, 1 + power * 2.4, 0.6], 8 + power * 6, 0.3);
        this._comboAdd(h > 6 ? 2 : 1);
        let kills = 0, hitBoss = false;
        // foes in reach are blown off the tower
        for (const en of this.enemies) {
            if (!en.alive || !en.killable) continue;
            const hb = en.hitbox();
            if (!hb) continue;
            const d = angleDiff(hb.theta, P.theta) * PATH.r;
            if (Math.abs(d) - hb.half < radius && hb.y1 > P.y - 0.6 && hb.y0 < P.y + 2.4) { this._launchEnemy(en, d, power); kills++; }
        }
        if (this.inBoss) {
            const ctx = this._bossCtx(0);
            for (const r of this.hz.runners) {
                if (!r.alive || !r.killable) continue;
                if (Math.abs(angleDiff(r.theta, P.theta)) * PATH.r < radius + r.half && Math.abs(r.y - P.y) < 1.6) {
                    r.kill(ctx); kills++;
                    this._comboAdd(1);
                    const v = 60 * this.combo.mult;
                    this.score += v;
                    this.ui.floater(polar(r.theta, PATH.r, r.y + 1), '+' + v, '#f0e4c9');
                }
            }
            // straight onto a planted weak spot: double damage
            const B = this.boss;
            if (B && this.state === 'boss' && B.state === 'fight') {
                for (const w of B.weakPoints()) {
                    if (Math.abs(angleDiff(w.theta, P.theta)) * PATH.r < w.half + 0.8 && Math.abs(w.y0 - P.y) < 0.7) {
                        // a proper drop does double damage (more from high up); a tiny bounce-hop only a sword's worth
                        const dmg = h > 5 ? DMG.megaSmash : h >= 1.8 ? DMG.smash : DMG.hit;
                        hitBoss = this._damageBoss(dmg, polar(w.theta, PATH.r, w.y0 + 0.8), 'smash');
                        break;
                    }
                }
            }
        } else {
            // coins and loot shaken loose
            const got = this.items.collectNear(P.theta, P.y, radius * 0.8, []);
            for (const it of got) this._onCollect(it);
            if (got.length) this.fx.burst('gold', feet, Math.min(40, 10 + got.length * 4), { speed: 1.6, vy: 3 });
            // fireballs in the blast pop harmlessly
            const ctx = this._ctx(0);
            for (const fb of this.fireballs) if (fb.alive && fb.pos.distanceTo(feet) < radius + 0.6) { fb.explode(ctx, true); this._comboAdd(1); this.score += C.SCORE_FIREBALL * this.combo.mult; }
        }
        const pts = Math.round(h * 20 + 10) * this.combo.mult;
        this.score += pts;
        this.ui.setScore(this.score);
        // the shout
        const mult = this.combo.mult;
        let word = h >= 10 ? 'METEOR' : h >= 6.5 ? 'EARTHQUAKE' : h >= 3.5 ? 'MEGA SMASH' : 'SMASH';
        if (hitBoss) word = h > 5 ? 'CRUSHING BLOW' : 'WEAK SPOT SMASH';
        if (kills >= 3 && !hitBoss) word = kills >= 5 ? 'MASSACRE' : 'TRIPLE SMASH';
        if (hitBoss || kills > 0 || h >= 3.5 || mult > 1) this.ui.pop(word + (mult > 1 ? ' x' + mult : '') + '!', h >= 6.5 || hitBoss || kills >= 3 ? 'mega' : '');
        else this.ui.floater(polar(P.theta, PATH.r, P.y + 1.6), 'SMASH!', '#ffd36e');
        if (h >= 4.2) this._countFall(h);
        // hitting something throws the knight back up for another dive
        if (kills > 0 || hitBoss) P.bounce(8.5 + Math.min(3, kills) * 0.8);
    }

    _shockRing(theta, y, radius, power) {
        const col = [1, 0.72 + power * 0.1, 0.4];
        const mk = () => new BasicMaterial({ map: this.T.shock, color: col, transparent: true, blending: 'additive', depthWrite: false, side: 'double', renderOrder: 6 });
        const flat = new Mesh(this._ringGeo, mk());
        flat.rotation.x = -Math.PI / 2;
        flat.position.copy(polar(theta, PATH.r, y + 0.07));
        const up = new Mesh(this._ringGeo, mk());
        up.position.copy(polar(theta, PATH.r + 0.4, y + 0.45));
        up.rotation.y = theta;
        flat.frustumCulled = false; up.frustumCulled = false;
        this.levelRoot.add(flat, up);
        this.rings.push({ flat, up, t: 0, life: 0.42 + power * 0.12, size: radius * 2.3, alpha: 0.7 + power * 0.3 });
    }

    // blow a foe off the tower: it spins away and bursts
    _launchEnemy(en, d, power, label) {
        const node = en.root;
        const pos = node.position.clone(); pos.y = en.y + 0.9;
        en.root = new Node();   // the foe is finished; its model now belongs to the flight
        en.root.visible = false;
        en.alive = false; en.dead = true;
        if (en.silk) en.silk.visible = false;
        node.traverse(n => { if (n.material === this.M.shadow) n.visible = false; });
        node.visible = true;
        const dir = d >= 0 ? 1 : -1;
        const th = Math.atan2(node.position.x, node.position.z);
        const out = 2.5 + power * 3, side = dir * (3 + power * 4), upv = 7 + power * 5;
        this.flyers.push({
            node, t: 0,
            vx: Math.sin(th) * out + Math.cos(th) * side, vy: upv, vz: Math.cos(th) * out - Math.sin(th) * side,
            sx: (Math.random() - 0.5) * 12, sz: dir * (8 + Math.random() * 6)
        });
        this._killScore(en, pos, label);
        this.fx.burst('spark', pos, 10, { speed: 1.2 });
        this.audio.sfx(en.kind === 'skeleton' ? 'bones' : en.kind === 'rat' ? 'squeak' : 'screech');
    }

    _updateJuice(dt) {
        const P = this.player;
        // shockwave rings
        for (let i = this.rings.length - 1; i >= 0; i--) {
            const r = this.rings[i];
            r.t += dt;
            const u = r.t / r.life;
            if (u >= 1) { this.levelRoot.remove(r.flat); this.levelRoot.remove(r.up); this.rings.splice(i, 1); continue; }
            const e = 1 - Math.pow(1 - u, 3);
            const s = r.size * (0.2 + 0.8 * e);
            r.flat.scale.set(s, s, 1);
            r.up.scale.set(s * 0.9, s * 0.55, 1);
            const a = r.alpha * (1 - u) * (1 - u);
            r.flat.material.opacity = a; r.up.material.opacity = a * 0.8;
        }
        // foes flying off the tower
        for (let i = this.flyers.length - 1; i >= 0; i--) {
            const f = this.flyers[i], n = f.node;
            f.t += dt;
            f.vy -= 24 * dt;
            n.position.x += f.vx * dt; n.position.y += f.vy * dt; n.position.z += f.vz * dt;
            n.rotation.x += f.sx * dt; n.rotation.z += f.sz * dt;
            if (Math.random() < 0.5) this.fx.emit('dust', n.position.x, n.position.y + 0.5, n.position.z, 0, 0.3, 0, 0.8);
            if (f.t > 1.05) {
                const c = n.position.clone(); c.y += 0.5;
                this.fx.burst('puff', c, 12, { radius: 0.4 });
                this.fx.burst('soul', c, 8);
                this.fx.chunk(c, 6, [0.9, 0.86, 0.75], 0.1, 3);
                this.levelRoot.remove(n); this._disposeTree(n);
                this.flyers.splice(i, 1);
            }
        }
        const live = this.state === 'play' || this.state === 'boss';
        // combo timer: only runs while the knight is on the ground
        const c = this.combo;
        if (c.n > 0 && live) {
            if (P.grounded && !P.door) c.t -= dt;
            if (c.t <= 0) {
                if (c.mult >= 3) this.ui.floater(polar(P.theta, PATH.r, P.y + 2.2), c.n + ' COMBO!', '#9ff0ff');
                this._comboBreak();
            } else this.ui.setCombo(c.n, c.mult, c.t / COMBO_TIME);
        }
        // a long plunge: arms windmill, AAAAH!
        const falling = live && !P.grounded && !P.diving && !P.dead && !P.door && P.vy < -9 && P.peakY - P.y > 3;
        this.flail = falling;
        if (falling) {
            if (!this._screaming) { this._screaming = true; this._aaT = 0; this._aaN = 0; }
            if (!this._fallVoicePlayed && P.peakY - P.y >= FALL_VOICE_MIN_DROP) {
                this._fallVoicePlayed = true;
                this.audio.playVoice('fall');
            }
            this._aaT -= dt;
            if (this._aaT <= 0) {
                this._aaT = 0.3; this._aaN++;
                this.ui.floater(polar(P.theta, PATH.r, P.y + 2.1), 'A'.repeat(2 + Math.min(6, this._aaN)) + 'H!', '#ffe2c0');
            }
        } else if (this._screaming && (P.grounded || P.dead)) { this._screaming = false; this.audio.screamStop(); }
        if (P.grounded || P.dead) this._fallVoicePlayed = false;
        // dive trail
        if (P.diving && P.diveT > 0.16) {
            const k = polar(P.theta, PATH.r, P.y + 0.6);
            this.fx.emit('spark', k.x + (Math.random() - 0.5) * 0.4, k.y, k.z + (Math.random() - 0.5) * 0.4, 0, 3 + Math.random() * 3, 0, 1.1);
            if (Math.random() < 0.5) this.fx.emit('puff', k.x, k.y + 0.4, k.z, 0, 2, 0, 0.8);
        }
        this.ui.setDiveReady(live && !P.grounded && !P.diving && !P.dead && !P.door);
    }

    // ---------------------------------------------------------------- the guardian
    _enterGate() {
        if (this.state !== 'play') return;
        const P = this.player;
        this.state = 'toBoss';
        this.gateT = 0;
        this._faded = false;
        P.win = true; P.vx = 0;
        this.audio.sfx('gate');
        this.audio.sfx('bell', 0.14);
        this.ui.setDoorPrompt(false);
        this.ui.setLavaWarning(false);
        this.ui.setFrost(false);
        this.ui.sub(null);
        this.ui.center('THE GUARDIAN AWAITS', true, 1.8);
        // the tower itself is conquered: bank its bonus now
        this.levelBonus = CONFIG.LEVEL_BONUS + Math.floor(this.greed * 100);
        this.score += this.levelBonus;
        this.ui.setScore(this.score);
        this.bossStartScore = this.score;
        this.bossStartStats = Object.assign({}, this.stats);
    }

    _updateToBoss(dt) {
        const P = this.player;
        this.gateT += dt;
        const u = clamp(this.gateT / 1.25, 0, 1);
        P.radius = lerp(PATH.r, R - 0.4, u * u);
        P.theta = dampAngle(P.theta, this.tower.exit.theta, 6, dt);
        this.timeStop = 0;
        this._updateWorld(dt, false);
        if (this.gateT > 0.8 && !this._faded) { this._faded = true; this.ui.fade(true, 0.6); }
        if (this.gateT > 1.55) this._startBossFight();
    }

    _startBossFight() {
        this.slowmo = 0; this.hitstop = 0;
        this._disposeLevel();
        this.inBoss = true;
        // the hall is far wider than the tower: the knight walks a bigger ring
        setPathRadius(ARENA_RP);
        this._setBaseFov(ARENA_FOV);
        const root = this.levelRoot = new Node();
        const boss = this.boss = createBoss(this.level);
        const arena = this.arena = new BossArena(this.M, this.T, boss.theme);
        arena.splatH = 6.0;   // hopping off the hall's slabs should not end in a faceplant every time
        this.stage = arena;
        root.add(arena.root, boss.root);
        this.items = new Items({ items: [] }, this.M, this.T);
        root.add(this.items.root);
        this.fx = new FX(root);
        this.enemies = [];
        this.fireballs = [];
        this.hz = { teles: [], runners: [], fallers: [], shots: [], pools: [] };
        this.missiles = [];
        this.flashLights = [];
        this.heldBomb = null;
        this.actT = -1; this.attackIn = false;
        this._reloadMsgT = 0;
        this._resetJuice();
        this._addKnight(root);
        this.scene.add(root);
        // start between a bomb crate and a floor cannon
        const start = 1.3;
        this.player = new Player(start, 0);
        this.player.platform = arena.ground;
        this.player.hp = CONFIG.MAX_HP;
        this.player.facing = 1;
        this.player.bomb = false;
        boss.yaw = start;
        this.timeStop = 0;
        this.lavaY = -100;
        this.heartT = 24;
        this._roared = false; this._titled = false; this._fought = false;
        this.audio.stopVoice();
        this.camTheta = start;
        this.camY = 2;
        this._applyArenaEnv(boss.theme);
        this.state = 'bossIntro';
        this.introT = 0;
        // a retry skips most of the entrance
        this.bossTries = (this.bossTries || 0) + 1;
        this._bossIntroEnd = 4.2;
        if (this.bossTries > 1) {
            this.introT = 2.2; this._roared = true; this._titled = true;
            boss.introT = 2.0;
        }
        this.ui.setHudVisible(true);
        this.ui.setBossMode(true);
        this.ui.setBoss(boss.name, 1, false);
        this.ui.setHearts(this.player.hp);
        this.ui.setLives(this.lives);
        this.ui.setScore(this.score);
        this.ui.setLavaWarning(false);
        this.ui.setFrost(false);
        this.ui.setDoorPrompt(false);
        this.ui.sub(null);
        this.ui.clearCenter();
        this.ui.fade(false, 0.9);
        this.audio.stopDrone();
        this.audio.playBossMusic((this.level - 1) % 3);
        this.input.reset();
        this._updateBossCamera(0);
    }

    _endBoss() {
        if (!this.inBoss) return;
        this.inBoss = false;
        this.boss = null; this.arena = null; this.hz = null;
        this.missiles = []; this.flashLights = []; this.heldBomb = null;
        setPathRadius(CONFIG.PATH_RADIUS);
        this._setBaseFov(CONFIG.FOV * Math.PI / 180);
        this.ui.setBossMode(false);
        this.audio.stopBossMusic();
        this._applyTowerEnv();
    }

    _bossCtx(dt) {
        if (!this._bctx) {
            const self = this;
            this._bctx = {
                dt: 0, time: 0, player: null, fx: null, audio: this.audio,
                telegraph: (theta, dur, size, color, y) => { const t = new Telegraph(self.levelRoot, self.T.warn, theta, dur, size, color, y || 0); self.hz.teles.push(t); return t; },
                runner: (o) => { const r = new Runner(self.levelRoot, o); self.hz.runners.push(r); if (o.kind === 'shock') self.audio.sfx('shock'); return r; },
                faller: (o) => { const f = new Faller(self.levelRoot, self.T.warn, o); self.hz.fallers.push(f); return f; },
                shot: (o) => { const s = new Shot(self.levelRoot, self.fireGlow, o); self.hz.shots.push(s); self.audio.sfx(o.kind === 'web' ? 'web' : 'fire'); return s; },
                pool: (o) => { const p = new Pool(self.levelRoot, self.T.warn, o); self.hz.pools.push(p); return p; },
                minion: (kind, theta) => self._spawnMinion(kind, theta),
                minionCount: () => self.enemies.filter(e => e.alive).length,
                impact: (theta, half, height, cause, y0) => self._bossImpact(theta, half, height, cause, y0 || 0),
                shake: (s) => { self.shake = Math.max(self.shake, s); },
                groundAt: (theta) => self.arena ? self.arena.groundAt(theta) : 0,
                strikeTarget: (theta) => self._strikeTarget(theta),
                onEnrage: (b) => self._onEnrage(b)
            };
        }
        const c = this._bctx;
        c.dt = dt; c.time = this.time; c.player = this.player; c.fx = this.fx;
        return c;
    }
    _minionCtx(dt) {
        const cyc = this.boss ? this.boss.cycle : 0;
        return { time: this.time, dt, player: this.player, enemySpeed: 1 + cyc * 0.12, fx: this.fx, audio: this.audio, camTheta: this.camTheta, lavaY: -100 };
    }

    // where a guardian's blow lands: the slab the knight stands on, or open floor
    // (never through a slab, so the planted weak spot is always reachable)
    _strikeTarget(theta) {
        const P = this.player, A = this.arena;
        const standY = P.grounded && P.platform ? P.platform.y : A.groundAt(P.theta, P.y + 0.05);
        if (standY > 0.5 && !(P.platform && P.platform.moving)) {
            const s = A.platforms.find(p => p.type === 'stone' && !p.moving && Math.abs(p.y - standY) < 0.05 && Math.abs(angleDiff(P.theta, p.theta)) <= p.half + 0.12);
            if (s) {
                const off = clamp(angleDiff(theta, s.theta), -s.half * 0.6, s.half * 0.6);
                return { theta: wrapAngle(s.theta + off), gy: s.y };
            }
        }
        const pad = 0.6 / PATH.r;
        for (const p of A.platforms) {
            if (p.type !== 'stone') continue;
            const off = angleDiff(theta, p.theta);
            if (Math.abs(off) < p.half + pad) return { theta: wrapAngle(p.theta + (off >= 0 ? 1 : -1) * (p.half + pad)), gy: 0 };
        }
        return { theta, gy: 0 };
    }

    _spawnMinion(kind, theta) {
        const en = createEnemy({ type: 'skeleton', platform: this.arena.ground, theta: wrapAngle(theta), chase: true, rise: true }, this.M);
        if (!en) return null;
        this.levelRoot.add(en.root);
        this._addShadowTo(en);
        this.enemies.push(en);
        const p = polar(theta, PATH.r, 0.1);
        this.fx.burst('soul', p, 16, { col: this.boss.theme.glow, col2: [0.2, 0.02, 0.02] });
        this.fx.burst('dust', p, 10, { radius: 0.4 });
        this.audio.sfx('bones');
        return en;
    }

    _bossImpact(theta, half, height, cause, y0) {
        const P = this.player;
        if (!P.dead && P.invuln <= 0) {
            const d = Math.abs(angleDiff(P.theta, theta)) * PATH.r;
            if (d < half + CONFIG.PLAYER_HALF_W && P.y >= y0 - 0.25 && P.y < y0 + height) this._hurtPlayer(theta, cause);
        }
        // the guardian's blows crush its own servants too
        const mctx = this._minionCtx(0);
        for (const en of this.enemies) {
            if (en.alive && !en.harmless && Math.abs(angleDiff(en.theta, theta)) * PATH.r < half && Math.abs(en.y - y0) < 0.5) en.kill(mctx);
        }
    }

    _damageBoss(n, pos, how) {
        const B = this.boss;
        if (!B.damage(n, this._bossCtx(0), how)) return false;
        this._comboAdd(how === 'smash' ? 2 : 1);
        this.score += 100 * n * this.combo.mult;
        this.stats.bossHits = (this.stats.bossHits || 0) + 1;
        this.ui.setScore(this.score);
        this.ui.setBoss(B.name, B.hpFrac, B.phase === 2, true);
        const g = B.theme.glow;
        this.fx.burst('spark', pos, 20, { speed: 1.5 });
        this.fx.burst('soul', pos, 14, { col: g, col2: [g[0] * 0.3, g[1] * 0.3, g[2] * 0.3] });
        this.fx.chunk(pos, 7, B.chunkColor || [0.9, 0.86, 0.75], 0.13, 4.5);
        this.audio.sfx('bosshit');
        this.shake = Math.max(this.shake, 0.35);
        this.hitstop = Math.max(this.hitstop, 0.09);
        const LABEL = { reflect: ['REFLECTED!', '#9ff0ff'], cannon: ['CANNON HIT!', '#ffd36e'], bomb: ['BOMB HIT!', '#ffb04a'], smash: ['DOUBLE DAMAGE!', '#ffe07a'] };
        const lb = LABEL[how] || ['HIT!', '#ff9a6a'];
        this.ui.floater(pos, lb[0], lb[1]);
        if (how === 'cannon' || how === 'bomb' || how === 'smash') { this.hitstop = Math.max(this.hitstop, 0.12); this.shake = Math.max(this.shake, 0.75); }
        if (B.defeated) this._onBossDefeated();
        return true;
    }

    _onEnrage(B) {
        this.ui.center(RAGE_TEXT[(this.level - 1) % 3], true, 1.8);
        this.ui.rageFlash();
        this.shake = Math.max(this.shake, 0.8);
        this.audio.bossRage(true);
        // a crystal heart appears on a high slab
        const P = this.player;
        const highs = this.arena.platforms.filter(p => p.type === 'stone' && !p.moving);
        highs.sort((a, b) => Math.abs(angleDiff(a.theta, P.theta)) - Math.abs(angleDiff(b.theta, P.theta)));
        if (highs.length && P.hp < CONFIG.MAX_HP) {
            const h = highs[Math.min(1, highs.length - 1)];
            this.items.spawn('heart', h.theta, h.y + 0.9);
            this.ui.toast('A <b>heart</b> appeared on a floating slab!', 2.4);
        }
    }

    _onBossDefeated() {
        if (this.state !== 'boss') return;
        this.state = 'bossDying';
        this.ui.setActionMode('sword');
        this.ui.setSiegeHint(0);
        this.bossDieT = 0;
        this.hitstop = 0.3;
        this.slowmo = 1.4;
        this.shake = 1.0;
        this.audio.sfx('bossdie');
        this.audio.stopBossMusic();
        this._clearHazards();
        const mctx = this._minionCtx(0);
        for (const en of this.enemies) if (en.alive) en.kill(mctx);
        this.player.invuln = 99;
        this.bossBonus = 3000 + 1500 * this.boss.cycle;
        this.score += this.bossBonus;
        this.stats.bosses = (this.stats.bosses || 0) + 1;
        this.ui.setScore(this.score);
        this.ui.setBoss(this.boss.name, 0, false, true);
        this.ui.rageFlash(true);
        if (this.score > this.best) { this.best = this.score; try { localStorage.setItem(STORE_BEST, String(Math.floor(this.best))); } catch (_) { } }
    }

    _clearHazards() {
        const H = this.hz, ctx = this._bossCtx(0);
        if (!H) return;
        for (const t of H.teles) t.remove();
        for (const f of H.fallers) f.remove();
        for (const r of H.runners) { if (r.alive) this.fx.burst('puff', r.root.position, 8, { radius: 0.2 }); r.remove(); this._disposeTree(r.root); }
        for (const s of H.shots) { if (s.alive) s.explode(ctx, false); s.remove(); this._disposeTree(s.root); }
        for (const f of H.fallers) this._disposeTree(f.root);
        for (const p of H.pools) p.remove();
        H.teles.length = 0; H.fallers.length = 0; H.runners.length = 0; H.shots.length = 0; H.pools.length = 0;
        for (const m of this.missiles) { if (m.alive) this.fx.burst('smoke', m.pos, 6); m.remove(); this._disposeTree(m.root); }
        this.missiles.length = 0;
    }

    _updateHazards(dt, ctx, lethal) {
        const P = this.player, H = this.hz;
        const canHurt = lethal && !P.dead;
        for (let i = H.teles.length - 1; i >= 0; i--) { const t = H.teles[i]; if (t.update(dt)) { t.remove(); H.teles.splice(i, 1); } }
        for (let i = H.fallers.length - 1; i >= 0; i--) { const f = H.fallers[i]; f.update(dt, ctx); if (!f.alive) { f.remove(); this._disposeTree(f.root); H.fallers.splice(i, 1); } }
        for (let i = H.runners.length - 1; i >= 0; i--) {
            const r = H.runners[i];
            if (!r) continue;
            if (r.alive) r.update(dt, ctx);
            if (r.alive && canHurt && r.hits(P)) {
                if (P.diving && r.killable && r.armed) {
                    // stomped from above
                    r.kill(ctx);
                    this._comboAdd(1);
                    const v = 60 * this.combo.mult;
                    this.score += v; this.ui.setScore(this.score);
                    this.ui.floater(polar(r.theta, PATH.r, r.y + 1), 'STOMP +' + v, '#f0e4c9');
                    this._stompBounce();
                } else if (P.invuln <= 0) {
                    this._hurtPlayer(r.theta, r.kind === 'spiderling' ? 'spider' : 'boss');
                    if (r.killable) r.kill(ctx);
                }
            }
            if (!r.alive) { r.remove(); this._disposeTree(r.root); H.runners.splice(i, 1); }
        }
        for (let i = H.shots.length - 1; i >= 0; i--) {
            const s = H.shots[i];
            if (!s) continue;
            if (s.alive) {
                if (s.reflected) s.target = this.boss.aimPoint(s.target || new Vec3());
                s.update(dt, ctx);
                if (s.hitBoss) { s.hitBoss = false; if (this.state === 'boss') this._damageBoss(DMG.reflect, s.pos.clone(), 'reflect'); }
                if (H.shots[i] !== s) continue;
            }
            if (s.alive && !s.reflected && canHurt) {
                const pc = polar(P.theta, PATH.r, P.y + 0.75, this._tmp);
                if (pc.distanceTo(s.pos) < 0.72) {
                    s.explode(ctx, false);
                    if (s.kind === 'web') {
                        P.slowT = 2.2;
                        this.fx.burst('puff', pc, 12, { col: [0.9, 0.92, 0.92], col2: [0.6, 0.6, 0.65] });
                        this.ui.toastOnce('web', 'Webbed! <b>Slash</b> the webs before they reach you.');
                    } else if (P.invuln <= 0) this._hurtPlayer(Math.atan2(s.pos.x, s.pos.z), 'boss');
                }
            }
            if (!s.alive) { s.remove(); this._disposeTree(s.root); H.shots.splice(i, 1); }
        }
        for (let i = H.pools.length - 1; i >= 0; i--) {
            const p = H.pools[i];
            p.update(dt, ctx);
            if (p.alive && canHurt && P.invuln <= 0 && p.hits(P)) this._hurtPlayer(p.theta, 'boss');
            if (!p.alive) { p.remove(); H.pools.splice(i, 1); }
        }
    }

    // The sword swing picks its own direction in the hall: along the ring at a weak spot,
    // servant or skull within reach, otherwise straight in at the guardian (parries its shots).
    _aimSwing() {
        const P = this.player, B = this.boss, C = CONFIG;
        let best = null, bestGap = 1e9;
        const consider = (theta, half, y0, y1) => {
            const d = angleDiff(theta, P.theta) * PATH.r;
            const gap = Math.abs(d) - half;
            if (gap < C.ATTACK_RANGE + 0.35 && y1 > P.y - 0.3 && y0 < P.y + 2.0 && gap < bestGap) { bestGap = gap; best = d; }
        };
        if (B) for (const w of B.weakPoints()) consider(w.theta, w.half, w.y0, w.y1);
        for (const en of this.enemies) {
            if (!en.alive || !en.killable) continue;
            const hb = en.hitbox();
            if (hb) consider(hb.theta, hb.half, hb.y0, hb.y1);
        }
        for (const r of this.hz.runners) if (r.alive && r.killable && r.armed) consider(r.theta, r.half, r.y, r.y + r.h);
        if (best !== null) {
            if (Math.abs(best) > 0.12) P.facing = best > 0 ? 1 : -1;
            this.attackIn = false;
            return;
        }
        // nothing beside him: running swings go ahead, a standing swing meets the guardian head on
        this.attackIn = this.input.x === 0;
    }

    _bossCombat(ctx) {
        const P = this.player, B = this.boss, C = CONFIG;
        if (P.dead) return;
        if (P.attackActive && !P.attackHit) {
            let hitAny = false;
            const inward = this.attackIn;
            const inReach = (theta, half) => {
                const d = angleDiff(theta, P.theta) * PATH.r;
                if (inward) return Math.abs(d) - half < 0.9;
                const df = d * P.facing;
                return df + half > -0.45 && df - half < C.ATTACK_RANGE;
            };
            // exposed weak spots (planted hands, legs, the wyrm's head)
            for (const w of B.weakPoints()) {
                if (inReach(w.theta, w.half) && w.y1 > P.y - 0.3 && w.y0 < P.y + 2.0) {
                    this._damageBoss(DMG.hit, polar(w.theta, PATH.r, w.y0 + 0.8), 'hit');
                    hitAny = true;
                    break;
                }
            }
            // risen dead
            const mctx = this._minionCtx(0);
            for (const en of this.enemies) {
                if (!en.alive || !en.killable) continue;
                const hb = en.hitbox();
                if (!hb) continue;
                if (inReach(hb.theta, hb.half) && hb.y1 > P.y - 0.3 && hb.y0 < P.y + 2.0) {
                    en.kill(mctx);
                    hitAny = true;
                    const c = en.root.position.clone(); c.y = en.y + 0.9;
                    this._killScore(en, c);
                    this.fx.burst('spark', c, 10);
                }
            }
            // skulls and spiderlings on the ring
            for (const r of this.hz.runners) {
                if (!r.alive || !r.killable || !r.armed) continue;
                if (inReach(r.theta, r.half) && P.y < r.y + r.h + 0.6 && P.y + 2.0 > r.y) {
                    r.kill(ctx);
                    hitAny = true;
                    this._comboAdd(1);
                    const v = 60 * this.combo.mult;
                    this.score += v;
                    const c = r.root.position.clone(); c.y += 0.5;
                    this.ui.floater(c, '+' + v, '#f0e4c9');
                }
            }
            // parry: fireballs and soul skulls fly back at the guardian, webs are cut
            const tip = inward ? polar(P.theta, PATH.r - 1.1, P.y + 1.0, this._tmp2) : polar(P.theta + P.facing * 0.9 / PATH.r, PATH.r, P.y + 1.0, this._tmp2);
            const reach = inward ? 1.75 : 1.45;
            for (const s of this.hz.shots) {
                if (!s.alive || s.reflected) continue;
                if (s.pos.distanceTo(tip) < reach) {
                    if (s.reflectable) {
                        s.reflect(B.aimPoint(new Vec3()));
                        this.audio.sfx('reflect');
                        this.ui.floater(s.pos, 'PARRY!', '#9ff0ff');
                        this.fx.burst('spark', s.pos, 14, { speed: 1.3 });
                    } else {
                        s.explode(ctx, true);
                        this.ui.floater(s.pos, 'CUT!', '#f0e4c9');
                    }
                    this._comboAdd(1);
                    this.score += C.SCORE_FIREBALL * this.combo.mult;
                    hitAny = true;
                }
            }
            if (hitAny) {
                P.attackHit = true;
                this.hitstop = Math.max(this.hitstop, 0.06);
                this.shake = Math.max(this.shake, 0.14);
                this.audio.sfx('hit');
                this.ui.setScore(this.score);
            }
        }
        this._diveContact();
        // contact damage from risen skeletons
        if (P.invuln > 0) return;
        for (const en of this.enemies) {
            if (!en.alive || en.harmless) continue;
            const hb = en.hitbox();
            if (!hb) continue;
            const d = Math.abs(angleDiff(P.theta, hb.theta)) * PATH.r;
            if (d < hb.half + C.PLAYER_HALF_W * 0.8 && P.y < hb.y1 - 0.05 && P.y + 1.3 > hb.y0) {
                this._hurtPlayer(hb.theta, 'skeleton');
                break;
            }
        }
    }

    // ---------------------------------------------------------------- siege weapons in the hall
    _fireCannon(c) {
        c.ready = false;
        c.reload = CANNON_RELOAD;
        c.fuseT = 0.32;
        this.actT = 0; this.attackIn = true;
        this._reloadMsgT = 5;
        this.audio.sfx('fuse');
        this.ui.toastOnce('cannon', 'Cannons need <b>' + CANNON_RELOAD + ' seconds</b> to reload. Run to the next one!');
    }
    _cannonBoom(c) {
        const A = this.arena, B = this.boss;
        const m = A.muzzle(c, new Vec3());
        c.recoil = 1;
        this.fx.burst('fire', m, 26, { speed: 2.4, size: 1.4 });
        this.fx.burst('smoke', m, 12, { speed: 1.4, size: 1.3 });
        this.fx.burst('spark', m, 16, { speed: 1.8 });
        this.shake = Math.max(this.shake, 0.55);
        this.audio.sfx('cannon');
        this._flashLight(m, [7, 3.4, 1.0], 11, 0.28);
        if (B && !B.defeated && !B.gone) {
            this.missiles.push(new Missile(this.levelRoot, {
                kind: 'ball', from: m, aim: (out) => B.bodyPoint(out), dur: 0.5, arc: 1.0,
                damage: DMG.cannon, stagger: 1.0, glowMat: this.fireGlow
            }));
        }
    }
    _pickBomb(cr) {
        const P = this.player;
        cr.hasBomb = false; cr.respawn = CRATE_RESPAWN; cr.bomb.visible = false;
        P.bomb = true;
        this.heldBomb = bombModel(this.M);
        this.levelRoot.add(this.heldBomb);
        this._placeHeldBomb();
        this.audio.sfx('pickup');
        this.fx.burst('spark', this.heldBomb.position, 10, { speed: 0.8 });
        this.ui.toastOnce('bomb', 'Got a <b>bomb</b>! Press the glowing button to hurl it at the guardian.');
    }
    _placeHeldBomb() {
        const P = this.player, h = this.heldBomb;
        if (!h) return;
        h.position.copy(polar(P.theta, PATH.r, P.y + 2.0 + Math.sin(this.time * 7) * 0.04));
        h.rotation.set(0, this.time * 1.5, Math.sin(this.time * 5) * 0.15);
        if (Math.random() < 0.6) this.fx.emit('spark', h.position.x, h.position.y + 0.42, h.position.z, (Math.random() - 0.5) * 1.2, 1.5, (Math.random() - 0.5) * 1.2, 0.8);
    }
    _throwBomb() {
        const P = this.player, B = this.boss;
        if (!P.bomb || !this.heldBomb) return;
        P.bomb = false;
        this.actT = 0; this.attackIn = true;
        this.audio.sfx('throw');
        const from = this.heldBomb.position.clone();
        this.missiles.push(new Missile(this.levelRoot, {
            kind: 'bomb', from, model: this.heldBomb, aim: (out) => B.bodyPoint(out), dur: 0.85, arc: 3.2,
            damage: DMG.bomb, stagger: 0.6
        }));
        this.levelRoot.remove(this.heldBomb);
        this.heldBomb = null;
    }
    _dropBomb() {
        const P = this.player;
        if (!P.bomb || !this.heldBomb) return;
        P.bomb = false;
        const from = this.heldBomb.position.clone();
        const gy = Math.max(0, this.arena.groundBelow(P.theta, P.y + 0.05));
        this.missiles.push(new Missile(this.levelRoot, { kind: 'drop', from, model: this.heldBomb, groundY: gy, vy: 3, fuse: 0.85 }));
        this.levelRoot.remove(this.heldBomb);
        this.heldBomb = null;
        this.ui.floater(from, 'DROPPED!', '#ffb04a');
    }
    _flashLight(pos, color, range, life) {
        this.flashLights.push({ light: { pos: pos.clone(), color: color.slice(), range }, base: color.slice(), t: 0, life });
    }
    _explosion(pos, big) {
        this.fx.burst('fire', pos, Math.round(30 * big), { speed: 2.6 * big, size: 1.6 * big });
        this.fx.burst('spark', pos, 22, { speed: 2.2 });
        this.fx.burst('smoke', pos, 10, { speed: 1.4, size: 1.6 });
        this.fx.chunk(pos, 6, [0.25, 0.22, 0.26], 0.14, 5);
        this.audio.sfx('explosion');
        this.shake = Math.max(this.shake, 0.55 * big);
        this._flashLight(pos, [9, 4.5, 1.4], 13, 0.4);
    }
    _missileHit(m) {
        const p = m.pos.clone();
        this._explosion(p, m.kind === 'ball' ? 1.15 : 1.0);
        if (m.kind === 'drop') {
            // a dropped bomb still clears the knight's surroundings
            const th = Math.atan2(p.x, p.z), mctx = this._minionCtx(0), ctx = this._bossCtx(0);
            for (const en of this.enemies) if (en.alive && Math.abs(angleDiff(en.theta, th)) * PATH.r < 2.4 && Math.abs(en.y - (p.y - 0.28)) < 1.2) { en.kill(mctx); this.stats.kills++; }
            for (const r of this.hz.runners) if (r.alive && r.killable && Math.abs(angleDiff(r.theta, th)) * PATH.r < 2.4) r.kill(ctx);
            return;
        }
        const B = this.boss;
        if (B && this.state === 'boss' && B.state === 'fight') {
            this._damageBoss(m.damage, p, m.kind === 'ball' ? 'cannon' : 'bomb');
            if (!B.defeated && B.stagger(this._bossCtx(0), m.stagger)) {
                this.audio.sfx('growl');
                this.ui.floater(new Vec3(p.x, p.y + 1.2, p.z), 'STAGGERED!', '#ffffff');
            }
        }
    }
    _updateSiege(dt) {
        const A = this.arena, ctx = this._bossCtx(dt);
        for (const c of A.cannons) {
            if (c.fuseT > 0) {
                c.fuseT -= dt;
                const hole = polar(c.theta, PATH.r - 0.95 + 0.62, c.y + 1.2);
                if (Math.random() < 0.9) this.fx.emit('spark', hole.x, hole.y, hole.z, (Math.random() - 0.5) * 2, 2.5, (Math.random() - 0.5) * 2, 1.0);
                if (c.fuseT <= 0) { c.fuseT = 0; this._cannonBoom(c); }
            }
            if (c.justLoaded) {
                c.justLoaded = false;
                if (this.state === 'boss' && Math.abs(angleDiff(c.theta, this.camTheta)) < 1.1) {
                    this.ui.floater(polar(c.theta, PATH.r, c.y + 2.4), 'CANNON READY', '#ffd36e');
                    this.audio.sfx('reload');
                }
            }
        }
        const list = this.missiles;
        for (let i = list.length - 1; i >= 0; i--) {
            const m = list[i];
            if (!m) continue;
            if (m.alive) m.update(dt, ctx);
            if (m.hit) { m.hit = false; this._missileHit(m); }
            if (list[i] !== m) continue;   // the fight ended while handling the hit
            if (!m.alive) { m.remove(); this._disposeTree(m.root); list.splice(i, 1); }
        }
        for (let i = this.flashLights.length - 1; i >= 0; i--) {
            const f = this.flashLights[i];
            f.t += dt;
            const k = Math.max(0, 1 - f.t / f.life);
            f.light.color[0] = f.base[0] * k; f.light.color[1] = f.base[1] * k; f.light.color[2] = f.base[2] * k;
            if (f.t >= f.life) this.flashLights.splice(i, 1);
        }
        if (this.player.bomb) this._placeHeldBomb();
    }

    // everything in the hall that runs regardless of the fight's phase
    _updateBossScene(dt, lethal) {
        const B = this.boss;
        const ctx = this._bossCtx(dt);
        if (B && !B.gone) B.update(dt, ctx);
        if (B && B.gone) B.root.visible = false;
        this.arena.update(dt, this.time, B && B.phase === 2 && !B.defeated, B && !B.gone ? B.bodyPoint(this._tmp3).y : undefined);
        this._updateHazards(dt, ctx, lethal);
        this._updateSiege(dt);
        const mctx = this._minionCtx(dt);
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const en = this.enemies[i];
            if (en.alive) en.update(dt, mctx);
            else if (en.dead) { this.levelRoot.remove(en.root); this._disposeTree(en.root); this.enemies.splice(i, 1); }
        }
        this._updateKnight(dt);
        this._updateJuice(dt);
        this.items.update(dt, this.time, this.camTheta);
        this.fx.update(dt);
        this._pitFx(dt);
        this._updateBossCamera(dt);
        this._updateBossEnv(dt);
    }

    _pitFx(dt) {
        this._pitT = (this._pitT || 0) - dt;
        if (this._pitT > 0) return;
        this._pitT = 0.05;
        const g = this.boss ? this.boss.theme.glow : [1, 0.3, 0.1];
        const a = Math.random() * Math.PI * 2, r = Math.random() * 4.4;
        this.fx.emit('spark', Math.sin(a) * r, -1.5, Math.cos(a) * r, 0, 3 + Math.random() * 3, 0, 1.2);
        if (Math.random() < 0.3) {
            const a2 = Math.random() * Math.PI * 2;
            this.fx.burst('soul', new Vec3(Math.sin(a2) * 2, -0.5, Math.cos(a2) * 2), 1, { col: g, col2: [g[0] * 0.2, g[1] * 0.2, g[2] * 0.2], vy: 2 });
        }
    }

    _updateBossIntro(dt) {
        const P = this.player, B = this.boss;
        this.introT += dt;
        B.cool = Math.max(B.cool, 1.2);
        P.update(dt, NOINPUT, this.arena, []);
        if (this.introT > 0.5 && !this._roared) {
            this._roared = true;
            this.audio.sfx('bossroar');
            this.shake = Math.max(this.shake, 0.7);
        }
        if (this.introT > 1.0 && !this._titled) {
            this._titled = true;
            this.ui.bossTitle(B.name, B.subtitle);
        }
        this._updateBossScene(dt, false);
        if (this.introT > this._bossIntroEnd && B.state === 'fight') {
            this.state = 'boss';
            this.ui.center('FIGHT!', false, 0.8);
            this.audio.sfx('beep', 1);
            if (!this._taught) { this._taught = true; this.ui.toast('Fire the <b>cannons</b>, throw <b>bombs</b> and strike the <b>glowing weak spots</b> after its blows!', 5); }
        }
    }

    _updateBoss(dt) {
        const P = this.player, I = this.input, B = this.boss, A = this.arena;
        const ev = [];
        // the action button fires a cannon or throws a bomb instead of swinging when it can
        const cannon = P.grounded && !P.dead ? A.cannonAt(P.theta, P.y) : null;
        const mode = cannon ? 'fire' : P.bomb ? 'throw' : 'sword';
        this.ui.setActionMode(mode);
        if (I.attackPressed && mode !== 'sword' && P.stun <= 0 && !P.dead) {
            I._pressed.attack = false;
            if (mode === 'fire') this._fireCannon(cannon); else this._throwBomb();
        }
        P.update(dt, I, A, ev);
        for (const e of ev) this._onPlayerEvent(e);
        if (!P.bomb && !P.dead && P.grounded) {
            const cr = A.crateAt(P.theta, P.y);
            if (cr) this._pickBomb(cr);
        }
        // arrow toward the nearest loaded cannon when it is off screen
        let hint = 0;
        if (!P.dead && !cannon) {
            let best = 1e9;
            for (const c of A.cannons) {
                if (!c.ready) continue;
                const d = angleDiff(c.theta, P.theta) * PATH.r;
                if (Math.abs(d) < Math.abs(best)) best = d;
            }
            if (Math.abs(best) > 4.2 && Math.abs(best) < 1e8) hint = best > 0 ? 1 : -1;
        }
        this.ui.setSiegeHint(hint);
        // standing at a cannon that is still reloading
        this._reloadMsgT = Math.max(0, this._reloadMsgT - dt);
        if (!cannon && P.grounded && this._reloadMsgT <= 0) {
            const c = A.cannons.find(k => !k.ready && k.fuseT <= 0 && Math.abs(angleDiff(P.theta, k.theta)) * PATH.r < 1.0 && Math.abs(P.y - k.y) < 0.4);
            if (c) { this._reloadMsgT = 2.5; this.ui.floater(polar(c.theta, PATH.r, c.y + 2.2), 'RELOADING ' + Math.ceil(c.reload) + 's', '#c9b89a'); }
        }
        this._bossCombat(this._bossCtx(dt));
        const got = this.items.collect(P.theta, P.y, []);
        for (const it of got) this._onCollect(it);
        // a heart now and then when the knight is hurt
        this.heartT -= dt;
        if (this.heartT <= 0) {
            this.heartT = 26;
            if (P.hp < CONFIG.MAX_HP && !this.items.list.some(o => o.alive && o.type === 'heart')) {
                const slabs = this.arena.platforms.filter(p => p.type === 'stone' && !p.moving);
                const s = slabs[Math.floor(Math.random() * slabs.length)];
                this.items.spawn('heart', s.theta, s.y + 0.9);
            }
        }
        this._dread(dt, false);
        // point out the first exposed weak spots
        const wps = B.weakPoints();
        if (wps.length && !this._wpShown && (this._strikeHints || 0) < 3) {
            this._strikeHints = (this._strikeHints || 0) + 1;
            this.ui.floater(polar(wps[0].theta, PATH.r, wps[0].y0 + 2.3), 'STRIKE IT!', '#ffd36e');
        }
        this._wpShown = wps.length > 0;
        if (this.state === 'boss') this._updateBossScene(dt, true);
    }

    _updateBossDying(dt) {
        const P = this.player, B = this.boss;
        this.bossDieT += dt;
        P.update(dt, NOINPUT, this.arena, []);
        if (this.bossDieT > 1.0 && !this._slainShown) {
            this._slainShown = true;
            this.ui.center('GUARDIAN SLAIN', true, 2.6);
            this.audio.sfx('victory');
        }
        if (this.bossDieT > 3.6 && !P.win) { P.win = true; P.vx = 0; }
        this._updateBossScene(dt, false);
        if (this.bossDieT > 5.4) { this._slainShown = false; this._showBossWin(); }
    }

    _showBossWin() {
        this.state = 'winScreen';
        this.ui.setHudVisible(false);
        this.ui.showWin('Tower ' + this.level + ' conquered', [
            ['Pumpkins', String(this.stats.coins)],
            ['Chests', String(this.stats.chests)],
            ['Foes slain', String(this.stats.kills)],
            ['Best combo', String(this.stats.bestCombo || 0)],
            ['Falls', (this.stats.falls || 0) + ' (' + Math.round(this.stats.fallM || 0) + ' m)'],
            ['Greed', Math.floor(this.greed) + '%'],
            ['Tower bonus', '+' + this.levelBonus.toLocaleString('en-US')],
            ['Guardian slain', '+' + this.bossBonus.toLocaleString('en-US')],
            ['Score', Math.floor(this.score).toLocaleString('en-US'), 'total']
        ]);
        this.audio.playGameMusic(this.level);
    }

    // Behind the knight, outside the ring, looking across at the guardian in the middle:
    // the knight sits low in the frame, the guardian fills the top.
    _updateBossCamera(dt) {
        const P = this.player, B = this.boss;
        const aspect = this.renderer.width / this.renderer.height;
        const tanH = Math.tan(this.camera.fov / 2);
        const D = clamp(PATH.r + (aspect < 1 ? 3.8 : 4.8) / (tanH * aspect), aspect < 1 ? 19 : 22, 25.5);
        this.camTheta = dt > 0 ? dampAngle(this.camTheta, P.theta, 3.0, dt) : P.theta;
        this.camY = dt > 0 ? damp(this.camY, P.y, 2.5, dt) : P.y;
        let dist = D, camH = 9.5 + this.camY * 0.55, lookY = 2.2 + this.camY * 0.5, lookR = 0, side = 0;
        if (this.state === 'bossIntro') {
            // low angle from beside the knight on the rising guardian, then pull back to the fight view
            const u = clamp((this.introT - 2.7) / 1.3, 0, 1), e = u * u * (3 - 2 * u);
            dist = lerp(D * 0.62, D, e); camH = lerp(1.9, camH, e); lookY = lerp(7.2, lookY, e); side = lerp(0.32, 0, e);
        } else if (this.state === 'bossDying' || (this.state === 'winScreen' && B)) {
            const u = clamp((this.bossDieT || 0) / 3, 0, 1);
            dist = lerp(D, D * 0.8, u); camH = lerp(camH, 5.6, u); lookY = lerp(lookY, 5.0, u);
        }
        const th = this.camTheta + side;
        let sx = 0, sy = 0;
        if (this.shake > 0) {
            this.shake = Math.max(0, this.shake - dt * 1.6);
            const s = this.shake * this.shake * 1.5;
            sx = (Math.random() - 0.5) * s; sy = (Math.random() - 0.5) * s;
        }
        this.camera.position.set(Math.sin(th) * dist + Math.cos(th) * sx, camH + sy, Math.cos(th) * dist - Math.sin(th) * sx);
        this.camera.target.set(Math.sin(th) * lookR, lookY, Math.cos(th) * lookR);
    }

    _updateBossEnv(dt) {
        const env = this.renderer.env, B = this.boss, A = this.arena;
        const th = this.camTheta;
        env.dirDir.set(Math.sin(th - 0.9) * 0.55, 0.62, Math.cos(th - 0.9) * 0.55).normalize();
        const pts = [];
        if (B && !B.gone) {
            // the guardian's own light sits in front of it
            B.light.pos.copy(B.aimPoint(this._tmp3));
            B.light.pos.x *= 0.7; B.light.pos.z *= 0.7;
            B.light.range = 24;
            pts.push(B.light);
        }
        if (!this._pitLight) this._pitLight = { pos: new Vec3(0, -1.5, 0), color: [0, 0, 0], range: 16 };
        const g = B ? B.theme.glow : [1, 0.3, 0.1];
        const fl = 0.85 + 0.15 * Math.sin(this.time * 3.3);
        const rage = B && B.phase === 2 && !B.defeated ? 1.5 : 1;
        this._pitLight.color = [g[0] * 6 * fl * rage, g[1] * 6 * fl * rage, g[2] * 6 * fl * rage];
        pts.push(this._pitLight);
        // explosions, cannonballs and glowing hazards
        for (const f of this.flashLights) if (pts.length < 4) pts.push(f.light);
        for (const m of this.missiles) if (m.light && m.alive && pts.length < 5) pts.push(m.light);
        for (const r of this.hz.runners) if (r.light && r.alive && pts.length < 5) { r.light.pos.copy(r.root.position); r.light.pos.y += 0.8; pts.push(r.light); }
        for (const s of this.hz.shots) if (s.light && s.alive && pts.length < 6) pts.push(s.light);
        // nearest fire bowls
        const bowls = A.bowls.slice().sort((a, b) => Math.abs(angleDiff(a.theta, th)) - Math.abs(angleDiff(b.theta, th)));
        for (const b of bowls) { if (pts.length >= 8) break; pts.push(b.light); }
        env.points = pts;
    }

    // ---------------------------------------------------------------- world, knight, camera, lights (tower)
    _cullEnemy(en) {
        if (!en.alive) { en.root.visible = false; return; }
        const th = en.kind === 'dragon' ? en.phi : en.theta;
        const lim = en.kind === 'dragon' ? 2.5 : 1.9;
        en.root.visible = Math.abs(angleDiff(th, this.camTheta)) < lim && Math.abs(en.y - this.camY) < 22;
    }

    _updateWorld(dt, frozenPlayer) {
        if (this.state !== 'play') {
            const ctx = this._ctx(dt);
            if (this.state !== 'countdown') this.tower.update(dt, this.time);
            for (const en of this.enemies) { if (en.alive) en.update(dt, ctx); this._cullEnemy(en); }
            for (let i = this.fireballs.length - 1; i >= 0; i--) {
                const fb = this.fireballs[i];
                if (fb.alive) fb.update(dt, ctx);
                if (!fb.alive) { this.levelRoot.remove(fb.root); this._disposeTree(fb.root); this.fireballs.splice(i, 1); }
            }
        }
        this._updateKnight(dt);
        this._updateJuice(dt);
        this.items.update(dt, this.time, this.camTheta);
        this._lavaFx(dt);
        this.fx.update(dt);
        this._updateCamera(dt);
        this._updateEnv(dt, this.camY);
    }

    _lavaFx(dt) {
        if (this.camY - this.lavaY > 16) return;
        this._popT = (this._popT || 0) - dt;
        if (this._popT > 0) return;
        this._popT = 0.07 + Math.random() * 0.14;
        const a = this.camTheta + (Math.random() - 0.5) * 1.4;
        const r = 5.2 + Math.random() * 9;
        const pos = new Vec3(Math.sin(a) * r, this.lavaY + 0.05, Math.cos(a) * r);
        this.fx.burst('spark', pos, 2 + Math.floor(Math.random() * 4), { speed: 0.5, vy: 2.5 });
        if (Math.random() < 0.35) this.fx.burst('fire', pos, 2, { speed: 0.3, size: 1.6 });
        if (Math.random() < 0.12) this.fx.burst('smoke', pos, 1, { size: 1.5 });
    }

    _updateKnight(dt) {
        const P = this.player, k = this.knight;
        P.faceSmooth = damp(P.faceSmooth, P.facing, 11, dt);
        let yaw = P.theta + P.faceSmooth * (Math.PI / 2 - 0.72);
        let attack = P.attackProgress;
        if (this.inBoss) {
            // cannon lighting and bomb throws reuse the swing animation
            if (this.actT >= 0) {
                this.actT += dt;
                attack = Math.max(attack, this.actT / CONFIG.ATTACK_TIME);
                if (this.actT >= CONFIG.ATTACK_TIME) this.actT = -1;
            }
            // in the hall the knight squares up to the guardian whenever he is not running
            if (!P.dead && !P.win) {
                const running = Math.abs(P.vx) > 1.2;
                let aimT = P.grounded ? (running ? 0.3 : 1) : 0.55;
                let rate = 12;
                if (P.attackT >= 0) { aimT = this.attackIn ? 1 : 0; rate = 28; }
                if (this.actT >= 0) { aimT = 1; rate = 28; }
                P.aim = damp(P.aim === undefined ? 1 : P.aim, aimT, rate, dt);
                const want = P.facing * (Math.PI / 2) * (1 + P.aim);
                P.relYaw = P.relYaw === undefined ? want : dampAngle(P.relYaw, want, rate, dt);
            }
            if (P.relYaw !== undefined) yaw = P.theta + P.relYaw;
        }
        const entering = this.state === 'toBoss';
        if (P.door) {
            const into = !P.doorSwapped;
            yaw = P.theta + (into ? Math.PI : 0);
        }
        if (entering) yaw = P.theta + Math.PI;
        else if (P.win) yaw = P.theta + Math.PI * 0.08;
        k.root.position.copy(polar(P.theta, P.radius, P.y));
        k.root.rotation.y = yaw;
        const spd = P.door || entering ? 2.5 : P.vx;
        k.animate(dt, {
            speed: spd, grounded: P.grounded || !!P.door || entering, vy: P.vy,
            attack, hurt: P.hurtT, dead: P.dead, lava: P.lava, win: P.win && !entering,
            dive: P.diving, diveT: P.diveT, flail: this.flail && !P.dead
        });
        // visibility, flashes
        const blink = P.invuln > 0 && P.invuln < 50 && !P.dead && Math.floor(this.time * 18) % 2 === 0;
        k.root.visible = !blink && (P.doorFade > 0.08);
        if (P.lava && P.dead) {
            const u = Math.min(1, this.dieT / 1.2);
            k.setFlash(0.35 + u * 0.5, [1, 0.35, 0.05]);
        } else if (P.hurtT > 0) k.setFlash(P.hurtT / 0.35 * 0.65, [1, 0.15, 0.1]);
        else if (P.door) k.setFlash((1 - P.doorFade) * 0.9, [0.02, 0.01, 0.01]);
        else if (entering) k.setFlash(clamp((PATH.r - P.radius) / (PATH.r - R + 0.4), 0, 1) * 0.95, [0.02, 0.01, 0.01]);
        else if (P.slowT > 0) k.setFlash(0.35, [0.85, 0.88, 0.9]);
        else k.setFlash(0);
        // sword trail
        k.root.updateWorld(null);
        k.bladeWorld(this._tmp, this._tmp2);
        const u = P.attackProgress;
        this.trail.push(this._tmp, this._tmp2, (u > 0.25 && u < 0.62) || (P.diving && P.diveT > 0.14));
        // blob shadow
        const gy = this.stage.groundBelow(P.theta, P.y);
        if (gy > -1e6 && !P.door && !entering) {
            const h = P.y - gy;
            const s = clamp(1 - h * 0.12, 0.35, 1) * 0.95;
            this.shadow.visible = true;
            this.shadow.position.copy(polar(P.theta, PATH.r, gy + 0.03));
            this.shadow.rotation.set(-Math.PI / 2, 0, 0);
            this.shadow.scale.set(s, s * 0.85, 1);
        } else this.shadow.visible = false;
        // wall shadow: light comes from the camera side, slightly up and to one side,
        // so the shadow peeks out lower-right of the knight onto the bricks
        const ws = this.wallShadow;
        if (ws) {
            const show = !this.inBoss && !P.door && !entering && k.root.visible;
            ws.visible = show;
            if (show) {
                const air = clamp((P.y - (gy > -1e6 ? gy : P.y)) * 0.08, 0, 0.35);
                const th = P.theta + 0.34 / R;
                ws.position.copy(polar(th, R + 0.06, P.y + 0.72 - air * 0.5));
                ws.rotation.set(0, th, -0.12);
                const sw = 0.95 * (1 + air), sh = 1.7 * (1 + air * 0.6);
                ws.scale.set(sw, sh, 1);
            }
        }
    }

    _camDist() {
        const aspect = this.renderer.width / this.renderer.height;
        const tanH = Math.tan(this.camera.fov / 2);
        // Frame the playable front of the tower tightly on narrow phones.
        const portrait = aspect < 1;
        const halfW = portrait ? 3.8 : 5.0;
        return clamp(halfW / (tanH * aspect), portrait ? 12.5 : 14.5, 24);
    }

    _snapCamera() {
        const P = this.player;
        this.camTheta = this.state === 'countdown' ? this.tower.exit.theta : P.theta;
        this.camY = P.y + 1.1;
        this._updateCamera(0);
    }

    _updateCamera(dt) {
        const P = this.player;
        if (this.state === 'menu') return;
        const moving = Math.abs(P.vx) > 0.5;
        const lead = P.door ? 0 : (P.facing * (moving ? 0.85 : 0.45)) / PATH.r;
        const k = P.door ? 3.4 : 6.5;
        if (this.state === 'toBoss') this.camTheta = dampAngle(this.camTheta, this.tower.exit.theta, 4, dt);
        else if (this.state !== 'countdown') this.camTheta = dt > 0 ? dampAngle(this.camTheta, P.theta + lead, k, dt) : P.theta + lead;
        const lookY = P.y + 1.1 + clamp(P.vy * 0.05, -1.4, 0.5);
        if (this.state === 'countdown') {
            // opening sweep: start at the gate on top, glide down to the knight
            const u = clamp(1 - this.countT / 3, 0, 1);
            const e = u * u * (3 - 2 * u);
            this.camY = lerp(this.tower.H + 1.5, lookY, e);
            this.camTheta = dampAngle(this.camTheta, lerp(this.tower.exit.theta, P.theta, e), 20, Math.max(dt, 0.016));
        } else this.camY = dt > 0 ? damp(this.camY, lookY, P.vy < -10 ? 6 : 3.5, dt) : lookY;
        const D = this._camDist();
        const th = this.camTheta;
        let sx = 0, sy = 0;
        if (this.shake > 0) {
            this.shake = Math.max(0, this.shake - dt * 1.6);
            const s = this.shake * this.shake * 1.2;
            sx = (Math.random() - 0.5) * s; sy = (Math.random() - 0.5) * s;
        }
        const gateZoom = this.state === 'toBoss' ? Math.min(1, this.gateT / 1.4) * 5 : 0;
        const deathZoom = this.state === 'dying' ? Math.min(1, this.dieT / 1.5) * 3 : 0;
        const d = D - gateZoom - deathZoom;
        this.camera.position.set(Math.sin(th) * d + Math.cos(th) * sx, this.camY + 2.4 + sy, Math.cos(th) * d - Math.sin(th) * sx);
        this.camera.target.set(Math.sin(th) * 1.5, this.camY + 0.9, Math.cos(th) * 1.5);
    }

    _updateEnv(dt, focusY) {
        const env = this.renderer.env;
        const th = this.camTheta;
        env.lavaY = this.lavaY;
        env.dirDir.set(Math.sin(th - 0.9) * 0.55, 0.62, Math.cos(th - 0.9) * 0.55).normalize();
        const flash = this.world.flash;
        env.hemiSky = [0.045 + flash * 0.28, 0.04 + flash * 0.22, 0.085 + flash * 0.4];
        const heat = clamp(1 - (focusY - this.lavaY) / 20, 0, 1);
        env.hemiGround = [0.06 + heat * 0.12, 0.022 + heat * 0.035, 0.016];
        const extra = [];
        // (the cauldron at the foot of the tower glows green while you are near the ground)
        if (this.tower.cauldron && focusY < 9) { const L = this.tower.cauldron.light, fl = 0.85 + 0.15 * Math.sin(this.time * 7.3); L.color = [0.9 * fl, 3.0 * fl, 0.6 * fl]; extra.push(L); }
        for (const fb of this.fireballs) if (fb.alive) extra.push(fb.light);
        for (const l of this.items.lights) extra.push(l);
        if (this.tower.exit.unlocked) {
            if (!this._gateLight) this._gateLight = { pos: new Vec3(), color: [4, 1.1, 0.4], range: 9 };
            this._gateLight.pos.copy(polar(this.tower.exit.theta, R + 1.4, this.tower.H + 1.4));
            if (Math.abs(this._gateLight.pos.y - focusY) < 14) extra.push(this._gateLight);
        }
        this.world.assignLights(env, { y: focusY }, th, this.tower.torches, extra, this.lavaY);
        this.world._freezeTarget = this.timeStop > 0 ? 1 : 0;
        this.world.update(dt, this.camera, focusY, this.lavaY, clamp(this.greed / 100, 0, 1));
    }

    render(dt) {
        this.ui.update(dt, this.camera);
        this.renderer.time = this.time;
        this.renderer.render(this.scene, this.camera);
    }
}

// (best score and sound setting are kept apart from the stand-alone game's)
const STORE_BEST = 'sfal-halloween-best', STORE_MUTED = 'sfal-halloween-muted';
return { Game };
})(__config, __engine, __graphics, __tower, __hero, __enemies, __arena, __bosses, __ui, __audio);


// ======================================================================
//  arcade.js
// ======================================================================
const __arcade = (({ Game }, { AudioManager }, { ARCADE_CSS, ARCADE_HTML }) => {
// The arcade machine: mounts Sir Falls-A-Lot: Halloween Edition into a shadow root on top of the page and runs it
// while the machine is in use. How You Haunt Me creates one with createSirFallsArcade() and opens it when you play
// the cabinet in the bedroom. With a mouse and keyboard the game shows on the cabinet's screen, the controls and the
// hi-score on plaques beside it; on a touch screen the game takes the whole screen, the controls sit on it, and how
// to play waits behind a button (the title menu and the pause menu).
//
//   const arcade = createSirFallsArcade({ assetURL, isTouch, volume, onRequestClose, onClosed });
//   arcade.prime();   // inside the key press / click / tap that walks you up to the machine (the sound may only
//                     // start inside one; the screen itself opens a moment later, when the camera is there)
//   arcade.open();    // the game on the screen
//   arcade.close();   // a game in progress pauses and waits, the music stops, the overlay goes
//   arcade.isOpen, arcade.best(), arcade.inProgress, arcade.snapshot (the last picture of a paused game), arcade.score




const FONT_HREF = './assets/fonts/arcade.css';
const BAT_SVG = "data:image/svg+xml;utf8," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 44"><path d="M50 10 C56 4 70 0 100 8 C88 12 86 20 88 28 C80 22 72 24 66 30 C62 24 56 24 52 34 L50 38 L48 34 C44 24 38 24 34 30 C28 24 20 22 12 28 C14 20 12 12 0 8 C30 0 44 4 50 10 Z M46 8 L44 0 L49 6 M54 8 L56 0 L51 6" fill="#000"/></svg>');

// (a game that is going on: closing the machine pauses it, the cabinet's screen keeps its last picture)
const IN_PROGRESS = new Set(['play', 'countdown', 'boss', 'bossIntro', 'paused', 'intro', 'toBoss', 'dying', 'deadScreen', 'winScreen', 'bossDying']);

function createSirFallsArcade(opts = {}) {
    const assetURL = opts.assetURL || ((p) => p);
    let host = null, root = null, frame = null, game = null, isOpen = false, closeT = 0, openT = 0;
    let snap = null, snapOK = false;

    function mount() {
        if (host) return;
        if (opts.loadFonts !== false && !document.querySelector('link[data-sfal-fonts]')) {
            const l = document.createElement('link');
            l.rel = 'stylesheet'; l.href = FONT_HREF; l.setAttribute('data-sfal-fonts', '1');
            document.head.appendChild(l);
        }
        host = document.createElement('div');
        host.id = 'sfal-arcade';
        host.style.cssText = 'position:fixed;inset:0;z-index:2147483000;display:none;contain:strict;';
        (opts.parent || document.body).appendChild(host);
        root = host.attachShadow({ mode: 'open' });
        root.innerHTML = '<style>' + ARCADE_CSS + '</style>' + ARCADE_HTML;
        for (const img of root.querySelectorAll('img[data-src]')) {
            // (no logo file: the title is written out instead of a broken picture)
            img.addEventListener('error', () => {
                const t = document.createElement('div');
                t.textContent = 'SIR FALLS-A-LOT';
                t.style.cssText = 'font-family:var(--spooky),Creepster,Impact,sans-serif;font-size:clamp(34px,11cqw,64px);line-height:1;text-align:center;color:#ff9a2e;text-shadow:0 5px 0 rgba(10,2,18,0.9),0 0 22px rgba(255,120,30,0.55);letter-spacing:0.04em';
                img.replaceWith(t);
            }, { once: true });
            img.src = assetURL(img.getAttribute('data-src'));
        }
        frame = root.getElementById('frame');
        // a few bats flapping across the dark around the cabinet
        const bats = root.getElementById('bats');
        for (let i = 0; i < 6; i++) {
            const b = document.createElement('i');
            b.style.setProperty('--bat', 'url("' + BAT_SVG + '")');
            b.style.setProperty('--s', (0.5 + Math.random() * 0.9).toFixed(2));
            b.style.top = (6 + Math.random() * 80).toFixed(1) + '%';
            b.style.left = '0';
            b.style.animationDuration = (12 + Math.random() * 14).toFixed(1) + 's';
            b.style.animationDelay = (-Math.random() * 20).toFixed(1) + 's';
            bats.appendChild(b);
        }
        root.getElementById('leave').addEventListener('click', (e) => { e.preventDefault(); requestClose(); });
        AudioManager.url = assetURL;
        // (on a touch screen the game takes the whole screen and the controls sit on it: the frame's .touch)
        game = new Game({ root, isTouch: opts.isTouch, requestClose, assetURL, onTouchMode: (on) => frame.classList.toggle('touch', !!on) });
        const leave = (id) => { const el = root.getElementById(id); if (el) el.addEventListener('click', (e) => { e.preventDefault(); AudioManager.sfx('ui'); requestClose(); }); };
        leave('leave-btn'); leave('pause-leave-btn');
        // keep the page under the machine from reacting to touches and wheel scrolls on it
        for (const ev of ['wheel', 'contextmenu', 'dragstart']) host.addEventListener(ev, (e) => e.preventDefault(), { passive: false });
    }

    function requestClose() {
        if (!isOpen || performance.now() - openT < 400) return;
        if (opts.onRequestClose) opts.onRequestClose(); else close();
    }

    function open() {
        mount();
        if (isOpen) return;
        isOpen = true; openT = performance.now();
        clearTimeout(closeT);
        host.style.display = 'block';
        const touch = opts.isTouch ? !!opts.isTouch() : game.ui.touchMode;
        game.ui.setTouchMode(touch);
        frame.classList.toggle('touch', touch);
        frame.classList.remove('off-anim');
        void frame.offsetWidth;
        frame.classList.add('vis', 'on-anim');
        setTimeout(() => frame.classList.remove('on-anim'), 700);
        root.getElementById('hs').textContent = Math.floor(best()).toLocaleString('en-US');
        AudioManager.setVolume(opts.volume ? opts.volume() : 1);
        AudioManager.unlock();
        game.start();
        requestAnimationFrame(() => game.resize && game.renderer && game.resize());
        // (nothing on the page underneath keeps the keyboard focus)
        try { if (document.activeElement && document.activeElement !== document.body) document.activeElement.blur(); } catch (_) { }
    }

    function close(onDone) {
        if (!isOpen) { if (onDone) onDone(); return; }
        isOpen = false;
        capture();
        game.stop();
        AudioManager.sleep();
        frame.classList.remove('on-anim');
        frame.classList.add('off-anim');
        frame.classList.remove('vis');
        clearTimeout(closeT);
        closeT = setTimeout(() => {
            host.style.display = 'none';
            frame.classList.remove('off-anim');
            if (opts.onClosed) opts.onClosed();
            if (onDone) onDone();
        }, 380);
    }

    // the picture on the screen as you walk away from a game in progress (drawn once more and copied in the same
    // task, while the WebGL canvas still holds it), cut to the cabinet's 3:4 screen
    function capture() {
        snapOK = false;
        if (!game || !game.renderer || !game.scene || !game.canvas || !IN_PROGRESS.has(game.state)) return;
        const c = game.canvas, w = c.width, h = c.height;
        if (!(w > 0 && h > 0)) return;
        try {
            if (!snap) { snap = document.createElement('canvas'); snap.width = 384; snap.height = 512; }
            game.renderer.time = game.time;
            game.renderer.render(game.scene, game.camera);
            const g = snap.getContext('2d'), tw = snap.width, th = snap.height, k = Math.max(tw / w, th / h), dw = w * k, dh = h * k;
            g.fillStyle = '#000'; g.fillRect(0, 0, tw, th);
            g.drawImage(c, (tw - dw) / 2, (th - dh) / 2, dw, dh);
            snapOK = true;
        } catch (_) { snapOK = false; }
    }

    function best() {
        let b = game ? game.best : 0;
        try { b = Math.max(b, +(localStorage.getItem('sfal-halloween-best') || 0)); } catch (_) { }
        return b || 0;
    }

    return {
        open, close, best,
        prime() { try { AudioManager.prime(); } catch (_) { } },
        get isOpen() { return isOpen; },
        get inProgress() { return !!game && IN_PROGRESS.has(game.state); },
        get snapshot() { return snapOK && game && IN_PROGRESS.has(game.state) ? snap : null; },
        get score() { return game ? Math.floor(game.score || 0) : 0; },
        get game() { return game; },
        // the canvas the game draws into (for a snapshot on the cabinet's screen when you walk away)
        get canvas() { return game && game.canvas; },
        get state() { return game ? game.state : 'off'; },
    };
}
return { createSirFallsArcade };
})(__game, __audio, __markup);

export const { createSirFallsArcade } = __arcade;