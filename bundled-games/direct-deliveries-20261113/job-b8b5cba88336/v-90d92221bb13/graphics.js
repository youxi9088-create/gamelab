// Procedural textures, shared materials and particle effects.
import { Texture, makeRng, makeNoise2D, LitMaterial, BasicMaterial, ShaderMaterial, hexColor, Points, Material, InstancedMesh, box, Vec3 } from './engine.js';

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

export function makeTextures(quality = 1) {
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
    // cloth
    const g = ctx.createLinearGradient(0, 0, W, 0);
    g.addColorStop(0, '#4a0b0b'); g.addColorStop(0.5, '#8e1a14'); g.addColorStop(1, '#4a0b0b');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 900; i++) {
        ctx.fillStyle = `rgba(0,0,0,${rng() * 0.12})`;
        ctx.fillRect(rng() * W, rng() * H, 1, rng() * 6);
    }
    // border
    ctx.strokeStyle = '#c99a3c'; ctx.lineWidth = 5;
    ctx.strokeRect(9, 6, W - 18, H - 40);
    // emblem: a golden tower
    ctx.fillStyle = '#d9a94a';
    const cx = W / 2;
    ctx.fillRect(cx - 16, 90, 32, 70);
    for (let i = -2; i <= 1; i++) ctx.fillRect(cx + i * 10 + 1, 78, 7, 14);
    ctx.fillRect(cx - 24, 158, 48, 8);
    ctx.fillStyle = '#3a0808';
    ctx.beginPath(); ctx.arc(cx, 132, 7, Math.PI, 0); ctx.fillRect(cx - 7, 132, 14, 20); ctx.fill();
    ctx.fillRect(cx - 3, 104, 6, 10);
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

export function makeMaterials(T) {
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
    return M;
}

// Camera-facing flame shader, instanced (per-instance position/scale from iMatrix, phase from iColor.r)
export function makeFlameMaterial() {
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
uniform float uIntensity;
void main(){
  vec2 p = vUv * 2.0 - 1.0;
  float t = uTime * 2.4 + vPhase * 10.0;
  float n = fbm(vec2(p.x * 2.4, p.y * 1.6 - t)) ;
  float w = 0.55 - (p.y + 1.0) * 0.24;
  float shape = w - abs(p.x + (n - 0.5) * 0.45 * (p.y + 1.0) * 0.6);
  shape += (n - 0.5) * 0.35;
  float body = smoothstep(0.0, 0.25, shape) * smoothstep(1.0, 0.1, p.y + n*0.4);
  float core = smoothstep(0.18, 0.45, shape) * smoothstep(0.4, -0.6, p.y);
  vec3 col = mix(vec3(1.0, 0.25, 0.03), vec3(1.0, 0.62, 0.18), body);
  col = mix(col, vec3(1.0, 0.95, 0.75), core);
  float a = body * (0.85 + 0.15 * sin(t * 3.0));
  float fd = uFogDensity * vDepth; float fog = 1.0 - exp(-fd*fd);
  fragColor = vec4(col * a * uIntensity * (1.0 - fog*0.8), 1.0);
}`,
        uniforms: { uIntensity: 1.3 }
    });
}

// Instanced additive billboard (glows, sparkles)
export function makeBillboardMaterial(tex, color, key) {
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
    gold: { add: true, speed: [1.5, 4], up: 3, grav: -6, life: [0.5, 1.0], size: [0.12, 0.02], col: [1, 0.9, 0.45], col2: [1, 0.55, 0.1], drag: 1.2 },
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

export class FX {
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