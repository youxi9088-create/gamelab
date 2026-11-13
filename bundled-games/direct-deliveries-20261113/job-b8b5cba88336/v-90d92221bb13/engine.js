// Small dependency-free WebGL2 engine: math, scene graph, geometry builders, renderer (bloom, toon shading, ink lines) and toon outlines.

// ======================================================================
// MATH
// ======================================================================
// Small math toolkit for the WebGL engine (column-major 4x4 matrices).

export class Vec3 {
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

export const TAU = Math.PI * 2;
export const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
export const lerp = (a, b, t) => a + (b - a) * t;
export const smooth01 = (t) => t * t * (3 - 2 * t);
export const damp = (a, b, k, dt) => a + (b - a) * (1 - Math.exp(-k * dt));
export function wrapAngle(a) {
    a = (a + Math.PI) % TAU;
    if (a < 0) a += TAU;
    return a - Math.PI;
}
export const angleDiff = (a, b) => wrapAngle(a - b);
export function dampAngle(a, b, k, dt) {
    return a + angleDiff(b, a) * (1 - Math.exp(-k * dt));
}

// Deterministic RNG (mulberry32)
export function makeRng(seed) {
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

export const M4 = {
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
export function makeNoise2D(seed, period) {
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

export class Node {
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

export class Geometry {
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

export class Texture {
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
export class Material {
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

export class LitMaterial extends Material {
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

export class BasicMaterial extends Material {
    constructor(opts = {}) {
        super('basic', opts);
        this.color = opts.color || [1, 1, 1];
        this.map = opts.map || null;
        this.vertexColors = !!opts.vertexColors;
        this.fogScale = opts.fogScale !== undefined ? opts.fogScale : 1;
    }
}

export class ShaderMaterial extends Material {
    constructor(opts = {}) {
        super('shader', opts);
        this.vertex = opts.vertex;
        this.fragment = opts.fragment;
        this.uniforms = opts.uniforms || {};
        this.key = opts.key || ('custom' + this.id);
    }
}

export class Mesh extends Node {
    constructor(geometry, material) {
        super();
        this.geometry = geometry;
        this.material = material;
        this.frustumCulled = true;
        this.renderOrder = 0;
        this._normalMat = new Float32Array(9);
    }
}

export class InstancedMesh extends Mesh {
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
export class Points extends Node {
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

export class Camera extends Node {
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
export class GeoBuilder {
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

export function box(w = 1, h = 1, d = 1, uvs = 1) {
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
export function cylinder(rTop, rBot, h, radial = 16, hSeg = 1, opts = {}) {
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

export function sphere(r = 1, wSeg = 16, hSeg = 12, opts = {}) {
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
export function lathe(profile, seg = 16, opts = {}) {
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

export function plane(w = 1, h = 1, sx = 1, sy = 1) {
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

export function torus(R = 1, r = 0.3, radial = 8, tubular = 16, arc = Math.PI * 2) {
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
export function extrude(pts, depth, bevel = 0) {
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
export function merge(parts) {
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
export function deform(geo, fn) {
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

export function recomputeNormals(geo) {
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

export const MAX_PL = 8;

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

export function hexColor(h) {
    return [((h >> 16) & 255) / 255, ((h >> 8) & 255) / 255, (h & 255) / 255];
}

const toLin = (c) => [Math.pow(c[0], 2.2), Math.pow(c[1], 2.2), Math.pow(c[2], 2.2)];

export class Renderer {
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

export { toLin };

// ======================================================================
// TOON
// ======================================================================
// Cartoon helpers: ink outline material and "toonify", which bakes the static meshes
// under each animated node into one vertex-coloured toon mesh plus an outline shell.

export function makeOutlineMaterial(color = [0.07, 0.035, 0.05], width = 0.024) {
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

export function makeToonMaterials(opts = {}) {
    const toon = new LitMaterial({ toon: true, vertexColors: true, color: [1, 1, 1], rimStrength: opts.rim !== undefined ? opts.rim : 0.5, toonKey: opts.key || 3.2, toonSpec: opts.spec !== undefined ? opts.spec : 0.55 });
    const toonDouble = new LitMaterial({ toon: true, vertexColors: true, color: [1, 1, 1], side: 'double', rimStrength: 0.35, toonKey: opts.key || 3.2, toonSpec: 0.2 });
    const outline = opts.outline === false ? null : makeOutlineMaterial(opts.outlineColor, opts.outlineWidth);
    return { toon, toonDouble, outline };
}

const _tm = M4.create();
export function toonify(root, mats) {
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