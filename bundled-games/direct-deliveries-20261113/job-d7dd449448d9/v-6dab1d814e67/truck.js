import * as THREE from './_remote/0d0e081c7ee3d520/three@0.184.0.js';
import { RoundedBoxGeometry } from './_remote/df1cf3fb2a21416f/RoundedBoxGeometry.js';

// Fully procedural, highly detailed rear-loader garbage truck. Faces +Z.
// createTruck() returns { group, setColor(hex), update(dt, speed, braking, loadFrac) }.

const geoCache = new Map();
function rbox(w, h, d, r) {
  const key = `${w}|${h}|${d}|${r}`;
  if (!geoCache.has(key)) geoCache.set(key, r > 0 ? new RoundedBoxGeometry(w, h, d, 3, r) : new THREE.BoxGeometry(w, h, d));
  return geoCache.get(key);
}
function B(parent, w, h, d, material, x, y, z, r = 0.04) {
  const m = new THREE.Mesh(rbox(w, h, d, Math.min(r, w / 2.01, h / 2.01, d / 2.01)), material);
  m.position.set(x, y, z);
  m.castShadow = true;
  parent.add(m);
  return m;
}
function C(parent, rt, rb, h, material, x, y, z, seg = 16, axis = 'y') {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), material);
  m.position.set(x, y, z);
  if (axis === 'x') m.rotation.z = Math.PI / 2;
  if (axis === 'z') m.rotation.x = Math.PI / 2;
  m.castShadow = true;
  parent.add(m);
  return m;
}

function decalTexture(color) {
  const c = document.createElement('canvas');
  c.width = 1024;
  c.height = 256;
  const g = c.getContext('2d');
  g.fillStyle = '#f4f2ea';
  g.fillRect(0, 0, 1024, 256);
  g.fillStyle = color;
  g.fillRect(0, 0, 1024, 26);
  g.fillRect(0, 230, 1024, 26);
  g.fillStyle = '#1d2a22';
  g.font = '900 92px Inter, Arial Black, sans-serif';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillText("EARL'S HAULING", 512, 108);
  g.font = '700 42px Inter, Arial, sans-serif';
  g.fillStyle = '#4a5a50';
  g.fillText('♻  KEEPING TOWNS CLEAN  ·  TRUCK 12', 512, 186);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

function chevronTexture() {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 64;
  const g = c.getContext('2d');
  g.fillStyle = '#ffcc1a';
  g.fillRect(0, 0, 256, 64);
  g.fillStyle = '#d8241f';
  for (let x = -64; x < 320; x += 48) {
    g.beginPath();
    g.moveTo(x, 64); g.lineTo(x + 24, 64); g.lineTo(x + 64, 0); g.lineTo(x + 40, 0);
    g.fill();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function createTruck(color = 0x2fae4a) {
  const root = new THREE.Group();
  const body = new THREE.MeshStandardMaterial({ color, roughness: 0.38, metalness: 0.25 });
  const bodyDark = new THREE.MeshStandardMaterial({ color: new THREE.Color(color).multiplyScalar(0.6), roughness: 0.5, metalness: 0.2 });
  const white = new THREE.MeshStandardMaterial({ color: 0xf2f0ea, roughness: 0.45 });
  const chrome = new THREE.MeshStandardMaterial({ color: 0xe4e8ec, roughness: 0.12, metalness: 1 });
  const steel = new THREE.MeshStandardMaterial({ color: 0x8a9096, roughness: 0.45, metalness: 0.7 });
  const black = new THREE.MeshStandardMaterial({ color: 0x1c1d20, roughness: 0.75 });
  const rubber = new THREE.MeshStandardMaterial({ color: 0x151515, roughness: 0.95 });
  const glass = new THREE.MeshStandardMaterial({ color: 0x1d3446, roughness: 0.05, metalness: 0.6, emissive: 0x0a1822 });
  const headMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xfff4d0, emissiveIntensity: 1.2 });
  const amber = new THREE.MeshStandardMaterial({ color: 0xffa31a, emissive: 0xff8a00, emissiveIntensity: 0.6 });
  const tailMat = new THREE.MeshStandardMaterial({ color: 0xc81010, emissive: 0xff1a1a, emissiveIntensity: 0.4 });
  const reverseMat = new THREE.MeshStandardMaterial({ color: 0xdddddd, emissive: 0xffffff, emissiveIntensity: 0 });
  const beaconMat = new THREE.MeshStandardMaterial({ color: 0xffa31a, emissive: 0xff8a00, emissiveIntensity: 0.3, transparent: true, opacity: 0.9 });
  const decal = new THREE.MeshStandardMaterial({ map: decalTexture('#' + new THREE.Color(color).getHexString()), roughness: 0.5 });
  const chevron = new THREE.MeshStandardMaterial({ map: chevronTexture(), roughness: 0.5 });
  const trashMat = new THREE.MeshStandardMaterial({ color: 0x3b3a32, roughness: 1, flatShading: true });

  // ---- Chassis ----
  for (const sx of [-0.62, 0.62]) B(root, 0.2, 0.32, 6.9, black, sx, 0.78, -0.1, 0.03);
  for (const z of [2.9, 1.2, -0.6, -2.4]) B(root, 1.24, 0.14, 0.14, black, 0, 0.78, z, 0.02);

  // ---- Wheels (front single, rear tandem) ----
  const wheels = [];
  function wheel(x, z) {
    const w = new THREE.Group();
    const tire = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.17, 12, 28), rubber);
    tire.rotation.y = Math.PI / 2;
    tire.scale.set(1, 1, 2.1);
    tire.castShadow = true;
    w.add(tire);
    // Tread blocks around the tire.
    for (let i = 0; i < 18; i++) {
      const a = (i / 18) * Math.PI * 2;
      const tread = new THREE.Mesh(rbox(0.36, 0.06, 0.12, 0), rubber);
      tread.position.set(0, Math.cos(a) * 0.59, Math.sin(a) * 0.59);
      tread.rotation.x = a;
      w.add(tread);
    }
    const out = Math.sign(x);
    C(w, 0.36, 0.36, 0.32, steel, 0, 0, 0, 20, 'x');
    C(w, 0.27, 0.27, 0.05, chrome, out * 0.17, 0, 0, 20, 'x');
    C(w, 0.11, 0.13, 0.12, chrome, out * 0.22, 0, 0, 12, 'x');
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      C(w, 0.025, 0.025, 0.06, chrome, out * 0.2, Math.cos(a) * 0.19, Math.sin(a) * 0.19, 6, 'x');
    }
    w.position.set(x, 0.59, z);
    root.add(w);
    wheels.push(w);
  }
  for (const z of [2.55, -1.15, -2.3]) for (const x of [-1.05, 1.05]) wheel(x, z);
  // Axles and hubs inner.
  for (const z of [2.55, -1.15, -2.3]) C(root, 0.08, 0.08, 1.9, steel, 0, 0.59, z, 8, 'x');

  // Front fenders.
  for (const sx of [-1.05, 1.05]) {
    // Open half-cylinder arching over the wheel (axis along X).
    const fender = new THREE.Mesh(new THREE.CylinderGeometry(0.74, 0.74, 0.52, 20, 1, true, 0, Math.PI), new THREE.MeshStandardMaterial({ color: 0x1c1d20, roughness: 0.75, side: THREE.DoubleSide }));
    fender.rotation.z = Math.PI / 2;
    fender.position.set(sx, 0.62, 2.55);
    fender.castShadow = true;
    root.add(fender);
  }
  // Rear tandem fender deck.
  for (const sx of [-1.08, 1.08]) B(root, 0.5, 0.08, 2.4, black, sx, 1.28, -1.72, 0.03);

  // ---- Cab ----
  const cab = new THREE.Group();
  root.add(cab);
  B(cab, 2.36, 1.25, 2.0, body, 0, 1.62, 2.65, 0.12); // lower cab
  B(cab, 2.3, 1.05, 1.75, body, 0, 2.75, 2.55, 0.16); // upper cab
  B(cab, 2.34, 0.08, 1.8, white, 0, 3.31, 2.55, 0.03); // roof cap
  B(cab, 2.38, 0.12, 2.02, white, 0, 2.22, 2.65, 0.02); // belt stripe
  // Windshield (two panes + center post) and sun visor.
  const ws = new THREE.Group();
  ws.position.set(0, 2.75, 3.43);
  ws.rotation.x = -0.12;
  cab.add(ws);
  B(ws, 1.0, 0.82, 0.04, glass, -0.53, 0, 0, 0.02);
  B(ws, 1.0, 0.82, 0.04, glass, 0.53, 0, 0, 0.02);
  B(ws, 0.06, 0.86, 0.06, black, 0, 0, 0.01, 0.01);
  B(ws, 0.04, 0.02, 0.04, black, 0.3, 0.38, 0.03, 0.01);
  for (const sx of [-0.5, 0.5]) {
    const wiper = B(ws, 0.7, 0.03, 0.03, black, sx, -0.34, 0.04, 0.01);
    wiper.rotation.z = 0.35;
  }
  B(cab, 2.3, 0.1, 0.35, black, 0, 3.24, 3.48, 0.03);
  // Side windows, door seams, handles, steps, grab bars.
  for (const s of [-1, 1]) {
    B(cab, 0.04, 0.72, 1.0, glass, s * 1.16, 2.78, 2.75, 0.02);
    B(cab, 0.04, 0.72, 0.42, glass, s * 1.16, 2.78, 1.95, 0.02);
    B(cab, 0.03, 1.9, 0.03, black, s * 1.19, 2.15, 2.15, 0);
    B(cab, 0.03, 1.9, 0.03, black, s * 1.19, 2.15, 3.35, 0);
    B(cab, 0.03, 0.03, 1.2, black, s * 1.19, 3.15, 2.75, 0);
    B(cab, 0.05, 0.06, 0.24, chrome, s * 1.2, 2.05, 2.4, 0.02);
    B(cab, 0.42, 0.06, 0.7, steel, s * 1.15, 0.95, 2.75, 0.02);
    B(cab, 0.36, 0.06, 0.6, steel, s * 1.13, 0.55, 2.75, 0.02);
    C(cab, 0.03, 0.03, 1.1, chrome, s * 1.22, 2.1, 3.25, 8);
    // Mirror arm + mirror + convex spot mirror.
    B(cab, 0.5, 0.04, 0.04, black, s * 1.4, 2.95, 3.25, 0);
    B(cab, 0.04, 0.04, 0.4, black, s * 1.62, 2.85, 3.25, 0);
    B(cab, 0.1, 0.6, 0.3, black, s * 1.66, 2.75, 3.15, 0.04);
    B(cab, 0.02, 0.52, 0.24, chrome, s * 1.66, 2.75, 3.31, 0.01);
    const spot = new THREE.Mesh(new THREE.SphereGeometry(0.11, 12, 8, 0, Math.PI), chrome);
    spot.position.set(s * 1.62, 2.32, 3.3);
    cab.add(spot);
    // Amber side marker.
    B(cab, 0.03, 0.1, 0.18, amber, s * 1.19, 1.25, 3.4, 0.02);
  }
  // Front: grille, slats, bumper, headlights, signals, plate, tow hooks.
  B(cab, 1.6, 0.8, 0.08, black, 0, 1.55, 3.66, 0.03);
  for (let i = 0; i < 6; i++) B(cab, 1.5, 0.05, 0.06, chrome, 0, 1.25 + i * 0.12, 3.7, 0.01);
  B(cab, 1.7, 0.08, 0.1, chrome, 0, 1.97, 3.68, 0.02);
  B(cab, 2.5, 0.32, 0.35, steel, 0, 0.95, 3.72, 0.06);
  B(cab, 2.52, 0.06, 0.37, chrome, 0, 1.08, 3.72, 0.02);
  for (const s of [-1, 1]) {
    C(cab, 0.18, 0.18, 0.08, chrome, s * 0.95, 1.6, 3.68, 18, 'z');
    C(cab, 0.14, 0.14, 0.06, headMat, s * 0.95, 1.6, 3.72, 18, 'z');
    B(cab, 0.22, 0.12, 0.06, amber, s * 0.95, 1.86, 3.68, 0.02);
    B(cab, 0.1, 0.12, 0.12, black, s * 0.6, 0.86, 3.92, 0.02);
  }
  B(cab, 0.6, 0.2, 0.03, white, 0, 0.95, 3.91, 0.01);
  // Roof: amber beacon bar + horns + cab clearance lights.
  B(cab, 1.6, 0.12, 0.3, black, 0, 3.4, 2.3, 0.04);
  const beacons = [];
  for (const s of [-1, 1]) {
    const bcn = C(cab, 0.14, 0.16, 0.24, beaconMat, s * 0.6, 3.58, 2.3, 14);
    beacons.push(bcn);
    C(cab, 0.05, 0.08, 0.5, chrome, s * 0.3, 3.4, 1.85, 10, 'z');
  }
  for (let i = -2; i <= 2; i++) B(cab, 0.12, 0.06, 0.06, amber, i * 0.35, 3.32, 3.4, 0.02);
  // Exhaust stack + fuel tank + air tank + battery box.
  C(cab, 0.09, 0.09, 2.6, chrome, 1.0, 2.5, 1.48, 12);
  C(cab, 0.11, 0.11, 0.2, black, 1.0, 3.85, 1.48, 12);
  C(cab, 0.16, 0.16, 1.0, steel, 1.0, 2.1, 1.48, 12);
  C(cab, 0.32, 0.32, 0.9, chrome, -1.0, 0.95, 1.55, 18, 'z');
  C(cab, 0.33, 0.33, 0.04, black, -1.0, 0.95, 1.18, 18, 'z');
  C(cab, 0.33, 0.33, 0.04, black, -1.0, 0.95, 1.92, 18, 'z');
  C(cab, 0.06, 0.06, 0.08, black, -1.0, 1.29, 1.7, 8);
  C(cab, 0.2, 0.2, 0.9, steel, 1.0, 0.95, 0.4, 14, 'z');
  B(cab, 0.5, 0.45, 0.7, black, 0.95, 1.0, 1.55, 0.04);

  // ---- Packer body ----
  const pack = new THREE.Group();
  root.add(pack);
  B(pack, 2.5, 2.5, 3.5, body, 0, 2.25, -0.25, 0.14);
  B(pack, 2.56, 0.14, 3.56, bodyDark, 0, 3.5, -0.25, 0.04); // top rail
  B(pack, 2.56, 0.12, 3.56, bodyDark, 0, 1.02, -0.25, 0.04); // bottom rail
  B(pack, 2.3, 0.08, 3.3, bodyDark, 0, 3.55, -0.25, 0.03);
  for (const s of [-1, 1]) {
    for (let i = 0; i < 7; i++) B(pack, 0.08, 2.3, 0.1, bodyDark, s * 1.27, 2.25, 1.3 - i * 0.52, 0.02);
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(2.9, 0.72), decal);
    sign.position.set(s * 1.32, 2.55, -0.25);
    sign.rotation.y = s * Math.PI / 2;
    pack.add(sign);
    // Running lights along the top rail.
    for (let i = 0; i < 4; i++) B(pack, 0.04, 0.08, 0.14, amber, s * 1.29, 3.38, 1.1 - i * 1.0, 0.02);
    // Side tool box & ladder.
    B(pack, 0.4, 0.5, 1.1, steel, s * 1.0, 1.0, -0.2, 0.04);
    for (let i = 0; i < 3; i++) B(pack, 0.42, 0.03, 1.12, black, s * 1.0, 0.85 + i * 0.15, -0.2, 0);
  }
  // Front bulkhead between cab and body.
  B(pack, 2.3, 2.2, 0.12, bodyDark, 0, 2.3, 1.55, 0.03);

  // ---- Tailgate / hopper ----
  const tail = new THREE.Group();
  tail.position.set(0, 3.5, -2.0);
  root.add(tail);
  B(tail, 2.56, 2.7, 1.25, body, 0, -1.25, -0.62, 0.18);
  B(tail, 2.6, 0.18, 1.3, bodyDark, 0, 0.05, -0.62, 0.05);
  // Hopper mouth (dark opening), packer blade, sill.
  B(tail, 2.1, 0.95, 0.4, black, 0, -2.1, -1.1, 0.08);
  B(tail, 2.0, 0.15, 0.3, steel, 0, -1.7, -1.05, 0.03);
  B(tail, 2.3, 0.14, 0.32, chrome, 0, -2.62, -1.15, 0.03);
  const heap = new THREE.Mesh(new THREE.IcosahedronGeometry(0.55, 0), trashMat);
  heap.scale.set(1.6, 0.6, 0.7);
  heap.position.set(0, -2.35, -0.95);
  tail.add(heap);
  // Rear chevrons, tail light clusters, reverse lights, plate, riders.
  const chev = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 0.32), chevron);
  chev.position.set(0, -0.35, -1.26);
  chev.rotation.y = Math.PI;
  tail.add(chev);
  const tailLights = [];
  for (const s of [-1, 1]) {
    tailLights.push(B(tail, 0.26, 0.26, 0.06, tailMat, s * 1.05, -2.15, -1.26, 0.04));
    B(tail, 0.26, 0.14, 0.06, amber, s * 1.05, -1.82, -1.26, 0.03);
    B(tail, 0.26, 0.12, 0.06, reverseMat, s * 1.05, -2.42, -1.26, 0.03);
    // Hydraulic lift cylinders.
    C(tail, 0.07, 0.07, 1.5, chrome, s * 1.32, -0.9, -0.2, 10);
    C(tail, 0.1, 0.1, 0.8, steel, s * 1.32, -1.9, -0.2, 10);
    // Hinge knuckles.
    C(tail, 0.13, 0.13, 0.25, steel, s * 0.9, 0.08, 0.02, 12, 'x');
    // Rider steps & grab bars.
    B(tail, 0.5, 0.06, 0.35, steel, s * 1.0, -2.95, -1.35, 0.02);
    C(tail, 0.03, 0.03, 0.9, chrome, s * 1.2, -1.7, -1.3, 8);
    // Mud flaps.
    B(root, 0.5, 0.55, 0.04, rubber, s * 1.05, 0.5, -2.95, 0.02);
  }
  B(tail, 0.5, 0.22, 0.03, white, 0, -2.95, -1.25, 0.01);
  B(tail, 0.1, 0.1, 0.06, white, 0, -0.75, -1.27, 0.02);
  // Rear cart tippers.
  for (const s of [-1, 1]) B(tail, 0.55, 0.45, 0.1, steel, s * 0.6, -2.75, -1.3, 0.03);

  root.traverse(o => { if (o.isMesh) o.receiveShadow = false; });

  let flash = 0;
  let wheelSpin = 0;
  return {
    group: root,
    setColor(hex) {
      body.color.setHex(hex);
      bodyDark.color.setHex(hex).multiplyScalar(0.6);
      decal.map.dispose();
      decal.map = decalTexture('#' + new THREE.Color(hex).getHexString());
      decal.needsUpdate = true;
    },
    update(dt, speed, braking, loadFrac) {
      wheelSpin += (speed * dt) / 0.59;
      for (const w of wheels) w.rotation.x = wheelSpin;
      flash += dt;
      const on = Math.sin(flash * 9) > 0;
      beaconMat.emissiveIntensity = on ? 2.2 : 0.15;
      const reversing = speed < -0.3;
      for (const t of tailLights) t.material.emissiveIntensity = braking ? 2.2 : 0.4;
      reverseMat.emissiveIntensity = reversing ? 2 : 0;
      heap.visible = loadFrac > 0.02;
      heap.scale.set(1.0 + loadFrac * 0.7, 0.3 + loadFrac * 0.6, 0.5 + loadFrac * 0.3);
    },
  };
}
