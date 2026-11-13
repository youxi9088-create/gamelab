import * as THREE from './_remote/0d0e081c7ee3d520/three@0.184.0.js';
import { RoundedBoxGeometry } from './_remote/df1cf3fb2a21416f/RoundedBoxGeometry.js';

// Procedural town pieces: unique houses, landmark buildings, trees and a park.
const materials = new Map();
export function mat(color, extra) {
  const key = `${color}-${extra ? JSON.stringify(extra) : ''}`;
  if (!materials.has(key)) {
    const { flatShading, ...rest } = extra || {};
    void flatShading;
    materials.set(key, new THREE.MeshStandardMaterial({ color, roughness: 0.78, metalness: 0.02, ...rest }));
  }
  return materials.get(key);
}

// Rounded edges everywhere soften the "stacked blocks" look.
const boxCache = new Map();
function roundedBox(w, h, d) {
  const key = `${w.toFixed(2)}|${h.toFixed(2)}|${d.toFixed(2)}`;
  if (!boxCache.has(key)) {
    const radius = Math.min(0.12, Math.min(w, h, d) * 0.22);
    boxCache.set(key, new RoundedBoxGeometry(w, h, d, 3, radius));
  }
  return boxCache.get(key);
}

export function box(parent, w, h, d, color, x = 0, y = 0, z = 0, extra) {
  const mesh = new THREE.Mesh(roundedBox(w, h, d), mat(color, extra));
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function cyl(parent, rt, rb, h, color, x, y, z, seg = 12) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat(color));
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  parent.add(mesh);
  return mesh;
}

function ball(parent, r, color, x, y, z) {
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(r, 20, 14), mat(color));
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  parent.add(mesh);
  return mesh;
}

function seeded(seed) {
  let s = (seed * 9301 + 49297) % 2147483647;
  return () => {
    s = (s * 16807) % 2147483647;
    return s / 2147483647;
  };
}

export function textTexture(text, bg, fg, width = 512, height = 128, font = '800 70px sans-serif') {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = fg;
  ctx.font = font;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, width / 2, height / 2 + 4);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function signPlane(parent, text, bg, fg, w, h, x, y, z, ry = 0) {
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: textTexture(text, bg, fg) }));
  sign.position.set(x, y, z);
  sign.rotation.y = ry;
  parent.add(sign);
  return sign;
}

function gableRoof(width, depth, rise) {
  const r = depth / 2 / 0.866;
  const geo = new THREE.CylinderGeometry(r, r, width, 3);
  geo.rotateZ(Math.PI / 2);
  geo.rotateX(-Math.PI / 2);
  geo.scale(1, rise / (1.5 * r), 1);
  geo.translate(0, rise / 3, 0);
  return geo;
}

function windowUnit(parent, x, y, z, trim, ry = 0, shutters = 0) {
  const win = new THREE.Group();
  box(win, 1.3, 1.2, 0.1, trim);
  box(win, 1.05, 0.95, 0.12, 0x8cc4e0, 0, 0, 0.02, { emissive: 0x16303f });
  box(win, 0.07, 0.95, 0.16, trim, 0, 0, 0.03);
  box(win, 1.05, 0.07, 0.16, trim, 0, 0, 0.03);
  if (shutters) {
    box(win, 0.38, 1.2, 0.08, shutters, -0.88, 0, 0.02);
    box(win, 0.38, 1.2, 0.08, shutters, 0.88, 0, 0.02);
  }
  win.position.set(x, y, z);
  win.rotation.y = ry;
  parent.add(win);
}

const WALLS = [0xf1d9b5, 0xb9d4e8, 0xf3c1b0, 0xd4e6b5, 0xf5f0e6, 0xe7c9e6, 0xfbe29a, 0xa9d8cf, 0xd9b99b, 0xc5c9e8];
const ROOFS = [0x8a3b2c, 0x3f4a5a, 0x5b6b3c, 0x6b4a3a, 0x2f5d73, 0x9a5b2e, 0x4a3a52];
const DOORS = [0x7a3b2a, 0x2f5d73, 0x3c6b3c, 0xc0392b, 0x333333, 0xe0b040, 0x8e44ad];
const SHUTTERS = [0, 0x2f4f6f, 0x3c6b3c, 0x7a3b2a, 0x333333];

export function addHouse(scene, colliders, x, z, rotationY, seed) {
  const r = seeded(seed);
  const pick = arr => arr[Math.floor(r() * arr.length)];
  const g = new THREE.Group();
  const w = 6.4 + r() * 1.6;
  const d = 5.8 + r() * 1.3;
  const stories = r() < 0.45 ? 2 : 1;
  const h = stories * 2.9 + 0.3;
  const wall = pick(WALLS);
  const roofColor = pick(ROOFS);
  const trim = r() < 0.6 ? 0xffffff : 0xf3ead8;
  const shutters = pick(SHUTTERS);

  box(g, w + 0.3, 0.45, d + 0.3, 0x9a948a, 0, 0.22, 0);
  box(g, w, h, d, wall, 0, 0.45 + h / 2, 0);
  const top = 0.45 + h;
  box(g, w + 0.08, 0.2, d + 0.08, trim, 0, top - 0.1, 0);
  if (stories === 2) box(g, w + 0.06, 0.14, d + 0.06, trim, 0, 0.45 + 2.95, 0);

  const style = Math.floor(r() * 3);
  if (style === 0) {
    const roof = new THREE.Mesh(gableRoof(w + 0.8, d + 1, 2 + r() * 1.3), mat(roofColor));
    roof.position.y = top;
    roof.castShadow = true;
    g.add(roof);
  } else if (style === 1) {
    const rise = 1.8 + r();
    const roof = new THREE.Mesh(new THREE.ConeGeometry(0.7071, 1, 4), mat(roofColor));
    roof.rotation.y = Math.PI / 4;
    roof.scale.set(w + 0.9, rise, d + 0.9);
    roof.position.y = top + rise / 2;
    roof.castShadow = true;
    g.add(roof);
  } else {
    box(g, w + 0.4, 0.35, d + 0.4, roofColor, 0, top + 0.17, 0);
    const panel = box(g, w * 0.55, 0.1, d * 0.45, 0x22344f, 0, top + 0.65, -d * 0.12);
    panel.rotation.x = -0.35;
  }

  const front = d / 2 + 0.05;
  for (let s = 0; s < stories; s++) {
    const y = 0.45 + 1.6 + s * 2.9;
    for (const wx of [-w * 0.3, w * 0.3]) {
      windowUnit(g, wx, y, front, trim, 0, shutters);
      if (s === 0) {
        box(g, 1.3, 0.3, 0.35, 0x7a5232, wx, y - 0.78, front + 0.18);
        for (let f = -1; f <= 1; f++) ball(g, 0.16, pick([0xff6fa0, 0xffd34d, 0xff7a3d, 0xc77dff]), wx + f * 0.4, y - 0.55, front + 0.2);
      }
    }
    if (s > 0) windowUnit(g, 0, y, front, trim, 0, shutters);
    windowUnit(g, w / 2 + 0.05, y, 0, trim, Math.PI / 2);
    windowUnit(g, -w / 2 - 0.05, y, 0, trim, -Math.PI / 2);
  }

  box(g, 1.15, 2.1, 0.12, trim, 0, 1.5, front);
  box(g, 0.95, 1.95, 0.14, pick(DOORS), 0, 1.45, front + 0.01);
  ball(g, 0.07, 0xd4af37, 0.3, 1.45, front + 0.1);

  if (r() < 0.55) {
    box(g, w * 0.55, 0.3, 1.8, 0xa98c6a, 0, 0.3, front + 0.9);
    for (const side of [-1, 1]) box(g, 0.18, 2.3, 0.18, trim, side * w * 0.25, 1.6, front + 1.65);
    box(g, w * 0.62, 0.18, 2.1, roofColor, 0, 2.82, front + 0.95);
  } else {
    box(g, 1.7, 0.25, 0.8, 0xb5ada0, 0, 0.12, front + 0.4);
    box(g, 0.9, 0.08, 0.9, 0x8b4a2a, 0, 0.05, front + 1.1);
  }

  if (style !== 2 && r() < 0.7) box(g, 0.75, 2.8, 0.75, 0x9b4a3a, (r() < 0.5 ? -1 : 1) * w * 0.28, top + 1.2, -d * 0.15);
  for (const side of [-1, 1]) ball(g, 0.6 + r() * 0.3, pick([0x3f7d3a, 0x4f8f45, 0x2f6b3a]), side * (w / 2 - 0.3), 0.6, front + 0.6);

  const mailX = (w / 2 + 0.6) * (r() < 0.5 ? -1 : 1);
  box(g, 0.12, 1.1, 0.12, 0x5a4632, mailX, 0.55, front + 2);
  box(g, 0.35, 0.35, 0.6, pick([0x2f5d73, 0x333333, 0xc0392b]), mailX, 1.2, front + 2);

  g.position.set(x, 0, z);
  g.rotation.y = rotationY;
  scene.add(g);
  colliders.push({ x, z, r: Math.max(w, d) / 2 + 0.3 });
}

// Roads sit at ±20/±60 (9 wide + sidewalks) plus the landfill spur at x=0, z<-60.
const ROADS = [-60, -20, 20, 60];
const TREE_CLEARANCE = 8.5;
export function clearOfRoad(x, z) {
  for (let pass = 0; pass < 3; pass++) {
    for (const line of ROADS) {
      if (Math.abs(x - line) < TREE_CLEARANCE && z > -87 && z < 67) x = line + Math.sign(x - line || 1) * TREE_CLEARANCE;
      if (Math.abs(z - line) < TREE_CLEARANCE && x > -67 && x < 67) z = line + Math.sign(z - line || 1) * TREE_CLEARANCE;
    }
    if (Math.abs(x) < TREE_CLEARANCE && z < -55 && z > -100) x = Math.sign(x || 1) * TREE_CLEARANCE;
  }
  return [x, z];
}

export function addTownTree(scene, colliders, x, z, seed) {
  [x, z] = clearOfRoad(x, z);
  const r = seeded(seed);
  const tree = new THREE.Group();
  const scale = 0.8 + r() * 0.5;
  cyl(tree, 0.3, 0.45, 2.6, 0x6e4a2c, 0, 1.3, 0, 7);
  if (r() < 0.4) {
    for (let i = 0; i < 3; i++) {
      const cone = new THREE.Mesh(new THREE.ConeGeometry(2 - i * 0.5, 2.2, 8), mat(0x2f6b45, { flatShading: true }));
      cone.position.y = 2.6 + i * 1.2;
      cone.castShadow = true;
      tree.add(cone);
    }
  } else {
    const leaf = [0x3f8a4a, 0x56a04a, 0x6aa84f, 0xd98c3a][Math.floor(r() * 4)];
    ball(tree, 1.9, leaf, 0, 3.6, 0);
    ball(tree, 1.3, leaf, 1.1, 3.1, 0.3);
    ball(tree, 1.3, leaf, -0.9, 3.3, -0.5);
  }
  tree.scale.setScalar(scale);
  tree.position.set(x, 0, z);
  tree.rotation.y = r() * 6;
  scene.add(tree);
  colliders.push({ x, z, r: 1.1 });
}

function addDiner(scene, colliders, x, z, ry) {
  const g = new THREE.Group();
  box(g, 12, 4, 7, 0xf4f1ea, 0, 2, 0);
  box(g, 12.06, 0.6, 7.06, 0xd8333a, 0, 3.0, 0);
  box(g, 12.06, 0.25, 7.06, 0x2bb3c0, 0, 0.5, 0);
  box(g, 10, 1.5, 0.12, 0x9ad4f0, 0, 1.75, 3.52, { emissive: 0x24404a });
  box(g, 12.5, 0.3, 7.5, 0xc8ccd2, 0, 4.15, 0);
  box(g, 1.2, 2.3, 0.14, 0xd8333a, 4.6, 1.15, 3.55);
  cyl(g, 0.12, 0.12, 3, 0xc8ccd2, -4.5, 5.5, 0);
  const sign = box(g, 5.4, 1.6, 0.3, 0xd8333a, -4.5, 7.2, 0);
  sign.castShadow = false;
  signPlane(g, "EARL'S DINER", '#d8333a', '#fff6c8', 5.1, 1.35, -4.5, 7.2, 0.16);
  signPlane(g, "EARL'S DINER", '#d8333a', '#fff6c8', 5.1, 1.35, -4.5, 7.2, -0.16, Math.PI);
  for (const sx of [-2, 0, 2]) {
    cyl(g, 0.6, 0.6, 0.1, 0xffffff, sx, 0.9, 5.2);
    cyl(g, 0.08, 0.08, 0.9, 0x888888, sx, 0.45, 5.2);
    const umbrella = new THREE.Mesh(new THREE.ConeGeometry(1.1, 0.6, 8), mat(sx === 0 ? 0x2bb3c0 : 0xd8333a));
    umbrella.position.set(sx, 2.3, 5.2);
    g.add(umbrella);
    cyl(g, 0.04, 0.04, 1.4, 0xdddddd, sx, 1.6, 5.2);
  }
  g.position.set(x, 0, z);
  g.rotation.y = ry;
  scene.add(g);
  colliders.push({ x, z, r: 6.2 });
}

function addGasStation(scene, colliders, x, z) {
  const g = new THREE.Group();
  box(g, 12, 0.7, 8, 0xffffff, 0, 5, 2);
  box(g, 12.05, 0.35, 8.05, 0x1f7a4d, 0, 4.7, 2);
  for (const [px, pz] of [[-5, -1], [5, -1], [-5, 5], [5, 5]]) box(g, 0.4, 4.6, 0.4, 0xdddddd, px, 2.3, pz);
  for (const px of [-2.5, 2.5]) {
    box(g, 1.6, 0.25, 3, 0xb5ada0, px, 0.12, 2);
    box(g, 0.8, 1.7, 0.6, 0x1f7a4d, px, 1.1, 2);
    box(g, 0.6, 0.5, 0.62, 0x111111, px, 1.5, 2, { emissive: 0x113322 });
  }
  box(g, 7, 3.6, 5, 0xefe9da, 0, 1.8, -8);
  box(g, 5, 1.6, 0.12, 0x9ad4f0, 0, 1.9, -5.45, { emissive: 0x24404a });
  signPlane(g, 'QUIK GAS', '#1f7a4d', '#ffffff', 6, 1.2, 0, 4.2, -5.42);
  cyl(g, 0.15, 0.15, 6, 0x777777, 6.5, 3, 6.8);
  box(g, 2, 2.4, 0.3, 0x1f7a4d, 6.5, 6.6, 6.8);
  signPlane(g, '$3.49', '#1f7a4d', '#ffe066', 1.8, 1, 6.5, 6.6, 6.97);
  g.position.set(x, 0, z);
  scene.add(g);
  colliders.push({ x, z: z - 8, r: 3.6 }, { x: x - 2.5, z: z + 2, r: 0.8 }, { x: x + 2.5, z: z + 2, r: 0.8 });
}

function windowGridTexture(base, cols, rows) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, 256, 512);
  const r = seeded(cols * 31 + rows);
  const cw = 256 / cols;
  const rh = 512 / rows;
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      ctx.fillStyle = r() < 0.25 ? '#ffe7a0' : '#5d8fb0';
      ctx.fillRect(col * cw + cw * 0.2, row * rh + rh * 0.22, cw * 0.6, rh * 0.55);
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function addApartment(scene, colliders, x, z) {
  const g = new THREE.Group();
  const side = new THREE.MeshLambertMaterial({ map: windowGridTexture('#c98f6b', 4, 8) });
  const roof = mat(0x6b5a50);
  const tower = new THREE.Mesh(new THREE.BoxGeometry(10, 18, 10), [side, side, roof, roof, side, side]);
  tower.position.y = 9;
  tower.castShadow = true;
  g.add(tower);
  box(g, 10.6, 0.5, 10.6, 0xe8e0d0, 0, 18.25, 0);
  box(g, 10.4, 1.2, 10.4, 0x8f7a68, 0, 0.6, 0);
  cyl(g, 1.4, 1.4, 2.4, 0x8b6b4a, 2.5, 19.7, 2.5, 10);
  const cap = new THREE.Mesh(new THREE.ConeGeometry(1.6, 1, 10), mat(0x5a4632));
  cap.position.set(2.5, 21.4, 2.5);
  g.add(cap);
  box(g, 3, 0.3, 1.6, 0x2f5d73, 0, 3, 5.6);
  signPlane(g, 'MAPLE APTS', '#2f5d73', '#ffffff', 3.4, 0.7, 0, 3.6, 5.12);
  g.position.set(x, 0, z);
  scene.add(g);
  colliders.push({ x, z, r: 5.3 });
}

function addSchool(scene, colliders, x, z) {
  const g = new THREE.Group();
  box(g, 13, 5, 7, 0xb0553f, 0, 2.5, 0);
  box(g, 13.3, 0.4, 7.3, 0xf3ead8, 0, 5.2, 0);
  for (let i = -2; i <= 2; i++) if (i !== 0) windowUnit(g, i * 2.6, 2.8, 3.55, 0xf3ead8);
  box(g, 2.2, 3, 0.2, 0xf3ead8, 0, 1.5, 3.55);
  box(g, 1.8, 2.6, 0.24, 0x2f5d73, 0, 1.3, 3.56);
  box(g, 2.6, 2.6, 2.6, 0xb0553f, 0, 6.7, 0);
  const spire = new THREE.Mesh(new THREE.ConeGeometry(2.1, 2.4, 4), mat(0x3f4a5a));
  spire.position.set(0, 9.2, 0);
  spire.rotation.y = Math.PI / 4;
  g.add(spire);
  ball(g, 0.5, 0xd4af37, 0, 6.7, 1.35);
  signPlane(g, 'OAKWOOD SCHOOL', '#f3ead8', '#7a2e20', 5, 0.8, 0, 4.4, 3.56);
  cyl(g, 0.08, 0.08, 8, 0xdddddd, 7.5, 4, 5);
  box(g, 1.8, 1.1, 0.05, 0xd8333a, 8.4, 7.3, 5);
  box(g, 0.7, 0.55, 0.06, 0x2f5d73, 7.85, 7.55, 5);
  g.position.set(x, 0, z);
  scene.add(g);
  colliders.push({ x, z, r: 6.5 });
}

function addFireStation(scene, colliders, x, z, ry) {
  const g = new THREE.Group();
  box(g, 12, 6.5, 9, 0xa8342b, 0, 3.25, 0);
  box(g, 12.4, 0.5, 9.4, 0xe8e0d0, 0, 6.6, 0);
  for (const dx of [-3, 3]) {
    box(g, 4, 4.4, 0.2, 0xffffff, dx, 2.2, 4.52);
    for (let i = 0; i < 5; i++) box(g, 3.7, 0.06, 0.24, 0xcccccc, dx, 0.6 + i * 0.8, 4.55);
  }
  signPlane(g, 'FIRE DEPT  No.12', '#e8e0d0', '#a8342b', 7, 1, 0, 5.4, 4.53);
  box(g, 1.8, 3.5, 1.8, 0xa8342b, 4.5, 8.3, -2.5);
  ball(g, 0.4, 0xffcc33, 4.5, 10.3, -2.5);
  g.position.set(x, 0, z);
  g.rotation.y = ry;
  scene.add(g);
  colliders.push({ x, z, r: 6 });
}

function addWaterTower(scene, colliders, x, z) {
  const g = new THREE.Group();
  for (const [lx, lz] of [[-1.6, -1.6], [1.6, -1.6], [-1.6, 1.6], [1.6, 1.6]]) cyl(g, 0.15, 0.2, 10, 0x8a9aa8, lx, 5, lz, 6);
  cyl(g, 3, 3, 3.6, 0x9fc6dc, 0, 11.6, 0, 16);
  const top = new THREE.Mesh(new THREE.ConeGeometry(3.2, 1.6, 16), mat(0x7f9fb5));
  top.position.set(0, 14.2, 0);
  g.add(top);
  signPlane(g, 'TRASHVILLE', '#9fc6dc', '#2f5d73', 4.2, 1, 0, 11.6, 3.02);
  g.position.set(x, 0, z);
  scene.add(g);
  colliders.push({ x, z, r: 2.2 });
}

function addPark(scene, colliders, cx, cz) {
  const pond = new THREE.Mesh(new THREE.CircleGeometry(6, 28), new THREE.MeshLambertMaterial({ color: 0x4fa3c9, emissive: 0x0e2a3a }));
  pond.rotation.x = -Math.PI / 2;
  pond.position.set(cx - 4, 0.05, cz - 4);
  scene.add(pond);
  const rim = new THREE.Mesh(new THREE.RingGeometry(6, 6.6, 28), mat(0xc9b88f));
  rim.rotation.x = -Math.PI / 2;
  rim.position.set(cx - 4, 0.06, cz - 4);
  scene.add(rim);
  colliders.push({ x: cx - 4, z: cz - 4, r: 5.5 });
  for (const [dx, dz] of [[-1, 2], [1.5, -1]]) {
    const duck = new THREE.Group();
    ball(duck, 0.35, 0xffffff, 0, 0.2, 0);
    ball(duck, 0.2, 0x2f6b45, 0, 0.5, 0.3);
    duck.position.set(cx - 4 + dx, 0.05, cz - 4 + dz);
    scene.add(duck);
  }
  for (const [px, pz, w, d] of [[cx, cz + 9, 30, 2.2], [cx + 9, cz, 2.2, 30]]) {
    const path = new THREE.Mesh(new THREE.PlaneGeometry(w, d), mat(0xd9c9a0));
    path.rotation.x = -Math.PI / 2;
    path.position.set(px, 0.03, pz);
    scene.add(path);
  }
  const gazebo = new THREE.Group();
  cyl(gazebo, 3, 3, 0.4, 0xe8e0d0, 0, 0.2, 0, 8);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    cyl(gazebo, 0.12, 0.12, 2.8, 0xffffff, Math.cos(a) * 2.6, 1.8, Math.sin(a) * 2.6, 6);
  }
  const groof = new THREE.Mesh(new THREE.ConeGeometry(3.6, 1.8, 8), mat(0x2f6b45));
  groof.position.y = 4.1;
  groof.castShadow = true;
  gazebo.add(groof);
  gazebo.position.set(cx + 6, 0, cz + 4);
  scene.add(gazebo);
  colliders.push({ x: cx + 6, z: cz + 4, r: 3 });
  for (const [fx, fz, color] of [[cx - 10, cz + 9, 0xff6fa0], [cx + 9, cz - 10, 0xffd34d]]) {
    const bed = new THREE.Group();
    cyl(bed, 1.6, 1.7, 0.4, 0x6b4a3a, 0, 0.2, 0, 14);
    for (let i = 0; i < 9; i++) ball(bed, 0.25, i % 2 ? color : 0xffffff, Math.cos(i) * 1.1, 0.5, Math.sin(i) * 1.1);
    bed.position.set(fx, 0, fz);
    scene.add(bed);
  }
  signPlane(scene, 'OAK PARK', '#2f6b45', '#ffffff', 4, 1, cx + 6, 2, cz + 15.4);
  box(scene, 0.2, 2.2, 0.2, 0x5a4632, cx + 4, 1.1, cz + 15.3);
  box(scene, 0.2, 2.2, 0.2, 0x5a4632, cx + 8, 1.1, cz + 15.3);
}

export function buildTown(scene, colliders) {
  const homes = [
    [-50, 32, Math.PI], [-32, 32, Math.PI], [-50, 50, 0], [-32, 50, 0],
    [-9, 31, Math.PI], [9, 31, Math.PI], [-9, 49, 0], [9, 49, 0],
    [31, 31, Math.PI], [49, 31, Math.PI], [31, 49, 0], [49, 49, 0],
  ];
  homes.forEach(([x, z, ry], i) => addHouse(scene, colliders, x, z, ry, i * 7 + 3));
  addDiner(scene, colliders, -6, -8, Math.PI);
  addGasStation(scene, colliders, 7, 6);
  addApartment(scene, colliders, -48, -6);
  addSchool(scene, colliders, -34, 7);
  addFireStation(scene, colliders, 36, -4, -Math.PI / 2);
  addWaterTower(scene, colliders, 50, 9);
  addPark(scene, colliders, -40, -40);
  const trees = [
    [-41, 41], [0, 40], [40, 40], [-41, 57], [0, 57], [40, 57], [20 - 5.5, 40], [-46, 9], [44, -12],
    [-52, -30], [-28, -52], [-52, -52], [-29, -30], [-46, -28], [48, -12], [-14, 12], [14, -12],
  ];
  trees.forEach(([x, z], i) => addTownTree(scene, colliders, x, z, i * 13 + 5));
}
