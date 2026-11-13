// Procedural planet textures (value noise + fbm). No game state; split out of main.js.
import * as THREE from './_remote/0d0e081c7ee3d520/three@0.184.0.js';
import { PLOOK } from './data.js';

export const hash3 = (x, y, z, sd) => { let h = (Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(z, 1440662683) + Math.imul(sd, 2654435761)) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967295; };
export function vnoise(x, y, z, sd) {
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z), xf = x - xi, yf = y - yi, zf = z - zi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf), w = zf * zf * (3 - 2 * zf), L = (a, b, t) => a + (b - a) * t;
  const c = (i, j, k) => hash3(xi + i, yi + j, zi + k, sd);
  return L(L(L(c(0, 0, 0), c(1, 0, 0), u), L(c(0, 1, 0), c(1, 1, 0), u), v), L(L(c(0, 0, 1), c(1, 0, 1), u), L(c(0, 1, 1), c(1, 1, 1), u), v), w);
}
export const fbm = (x, y, z, sd) => { let a = 0, f = 1.6, amp = 0.5; for (let o = 0; o < 4; o++) { a += vnoise(x * f, y * f, z * f, sd + o * 17) * amp; f *= 2.1; amp *= 0.5; } return a / 0.9375; };
export const hexRGB = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
export function planetTex(type, seed) {
  const L0 = PLOOK[type] || PLOOK['Garden World'], W = 192, H = 96;
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const ctx = cv.getContext('2d'), img = ctx.createImageData(W, H), d = img.data;
  const em = (L0.lava || L0.city || L0.shards) ? document.createElement('canvas') : null;
  let ed = null, eimg = null, ectx = null;
  if (em) { em.width = W; em.height = H; ectx = em.getContext('2d'); eimg = ectx.createImageData(W, H); ed = eimg.data; }
  const P4 = L0.c.map(hexRGB);
  const grad = t => { t = Math.max(0, Math.min(0.999, t)) * 3; const i = Math.floor(t), k = t - i; return [0, 1, 2].map(j => P4[i][j] + (P4[i + 1][j] - P4[i][j]) * k); };
  for (let y = 0; y < H; y++) {
    const lat = (y / (H - 1) - 0.5) * Math.PI, cy = Math.sin(lat), cr = Math.cos(lat);
    for (let x = 0; x < W; x++) {
      const lon = (x / W) * Math.PI * 2, px = Math.cos(lon) * cr * 1.6, pz = Math.sin(lon) * cr * 1.6, py = cy * 1.6;
      let n = fbm(px + 3, py + 3, pz + 3, seed), col;
      if (L0.bands) { const b = Math.sin(cy * (14 + (seed % 5)) + fbm(px, py * 0.3, pz, seed) * 3.5); n = 0.5 + b * 0.35 + (n - 0.5) * 0.3; col = grad(n); }
      else if (L0.dunes) { n = n * 0.75 + (Math.sin((px + pz) * 9 + n * 6) * 0.5 + 0.5) * 0.25; col = grad(n); }
      else if (L0.sea != null) { col = n < L0.sea ? grad(n / L0.sea * 0.3) : grad(0.34 + (n - L0.sea) / (1 - L0.sea) * 0.66); }
      else col = grad(n);
      if (L0.caps && Math.abs(cy) > 0.86 - (n - 0.5) * 0.15) col = [235, 244, 250];
      const i = (y * W + x) * 4;
      d[i] = col[0]; d[i + 1] = col[1]; d[i + 2] = col[2]; d[i + 3] = 255;
      if (ed) {
        let e = 0, er = 0, eg = 0, eb = 0;
        if (L0.lava) { const r = Math.abs(fbm(px * 1.3, py * 1.3, pz * 1.3, seed + 99) - 0.5); if (r < 0.045) { e = 1 - r / 0.045; er = 255; eg = 90 + 120 * e; eb = 20; } }
        if (L0.city && n > 0.42 && hash3(x, y, 7, seed) < 0.22 + (n - 0.42) * 0.8) { e = 0.6 + hash3(x, y, 9, seed) * 0.4; er = 255; eg = 210; eb = 130; }
        if (L0.shards && n > 0.72) { e = (n - 0.72) / 0.28; er = 120; eg = 255; eb = 255; }
        ed[i] = er * e; ed[i + 1] = eg * e; ed[i + 2] = eb * e; ed[i + 3] = 255;
      }
    }
  }
  ctx.putImageData(img, 0, 0);
  const map = new THREE.CanvasTexture(cv); map.colorSpace = THREE.SRGBColorSpace;
  let emap = null;
  if (em) { ectx.putImageData(eimg, 0, 0); emap = new THREE.CanvasTexture(em); emap.colorSpace = THREE.SRGBColorSpace; }
  return { map, emap };
}
