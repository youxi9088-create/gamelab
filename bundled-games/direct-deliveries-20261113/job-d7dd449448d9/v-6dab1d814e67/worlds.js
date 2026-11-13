import * as THREE from './_remote/0d0e081c7ee3d520/three@0.184.0.js';

// Themed scenery for the off-world campaign chapters. Each world is a group of
// props placed around the town's outskirts (outside the road grid) plus sky
// details, so the driving layout stays the same while the world looks new.

const M = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.6, ...extra });
const rng = seed => () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

// Spots on the outskirts, clear of roads (roads end around ±64) and the landfill (0,-95).
function ring(count, seed, rMin = 78, rMax = 125) {
  const r = rng(seed);
  const out = [];
  while (out.length < count) {
    const a = r() * Math.PI * 2;
    const d = rMin + r() * (rMax - rMin);
    const x = Math.cos(a) * d, z = Math.sin(a) * d;
    if (Math.abs(x) < 22 && z < -70) continue; // keep the landfill clear
    out.push([x, z, r()]);
  }
  return out;
}

function stars(count, color = 0xffffff, size = 1.6) {
  const pos = [];
  for (let i = 0; i < count; i++) {
    const v = new THREE.Vector3().randomDirection();
    if (v.y < 0.05) v.y = Math.abs(v.y) + 0.05;
    v.normalize().multiplyScalar(380);
    pos.push(v.x, v.y, v.z);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  return new THREE.Points(g, new THREE.PointsMaterial({ color, size, sizeAttenuation: false, fog: false }));
}

function buildMoon() {
  const g = new THREE.Group();
  g.add(stars(900));
  // Earth hanging in the black sky.
  const earth = new THREE.Mesh(new THREE.SphereGeometry(34, 32, 20), new THREE.MeshBasicMaterial({ color: 0x3f7fe0, fog: false }));
  earth.position.set(-140, 150, -300);
  const land = new THREE.Mesh(new THREE.SphereGeometry(34.4, 16, 10, 0, 2, 0.6, 1.4), new THREE.MeshBasicMaterial({ color: 0x4fae5a, fog: false }));
  earth.add(land);
  g.add(earth);
  g.userData.spin = earth;
  const grey = M(0xb8b8c0), white = M(0xf2f4f8, { metalness: 0.3, roughness: 0.3 }), glass = M(0x7fd8ff, { emissive: 0x2a8ac0, emissiveIntensity: 0.6, transparent: true, opacity: 0.7 });
  for (const [x, z, s] of ring(16, 11)) {
    // Craters.
    const crater = new THREE.Mesh(new THREE.TorusGeometry(4 + s * 6, 1.2, 8, 24), grey);
    crater.rotation.x = -Math.PI / 2;
    crater.position.set(x, 0.2, z);
    crater.scale.z = 0.4;
    g.add(crater);
  }
  for (const [x, z, s] of ring(9, 23, 82, 115)) {
    const base = new THREE.Group();
    const dome = new THREE.Mesh(new THREE.SphereGeometry(5 + s * 4, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), glass);
    const rim = new THREE.Mesh(new THREE.CylinderGeometry(5.4 + s * 4, 5.6 + s * 4, 0.8, 20), white);
    rim.position.y = 0.4;
    base.add(dome, rim);
    base.position.set(x, 0, z);
    g.add(base);
  }
  // Radar dishes and a rocket on the pad.
  const dishes = [];
  for (const [x, z] of ring(5, 37, 80, 100)) {
    const d = new THREE.Group();
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.4, 6, 8), white);
    mast.position.y = 3;
    const dish = new THREE.Mesh(new THREE.SphereGeometry(3, 16, 8, 0, Math.PI * 2, 0, 1.1), white);
    dish.material = white.clone();
    dish.material.side = THREE.DoubleSide;
    dish.rotation.x = -1.1;
    dish.position.y = 6.5;
    const head = new THREE.Group();
    head.add(dish);
    d.add(mast, head);
    d.position.set(x, 0, z);
    d.userData.head = head;
    dishes.push(d);
    g.add(d);
  }
  g.userData.dishes = dishes;
  const rocket = new THREE.Group();
  const bodyR = new THREE.Mesh(new THREE.CylinderGeometry(2, 2, 16, 16), white);
  bodyR.position.y = 9;
  const nose = new THREE.Mesh(new THREE.ConeGeometry(2, 5, 16), M(0xe0402a));
  nose.position.y = 19.5;
  rocket.add(bodyR, nose);
  for (let i = 0; i < 3; i++) {
    const fin = new THREE.Mesh(new THREE.BoxGeometry(0.3, 4, 3), M(0xe0402a));
    fin.position.set(Math.cos(i * 2.1) * 2.2, 2.5, Math.sin(i * 2.1) * 2.2);
    fin.rotation.y = -i * 2.1;
    rocket.add(fin);
  }
  rocket.position.set(95, 0, 40);
  g.add(rocket);
  return g;
}

function buildCandy() {
  const g = new THREE.Group();
  const colors = [0xff5fa2, 0x5fd3ff, 0xffe066, 0x8cf06a, 0xb98cff, 0xff8c42];
  const r = rng(77);
  const spinners = [];
  for (const [x, z, s] of ring(14, 5)) {
    // Giant lollipops.
    const pop = new THREE.Group();
    const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 10 + s * 6, 8), M(0xffffff));
    stick.position.y = (10 + s * 6) / 2;
    const candy = new THREE.Group();
    const c1 = colors[Math.floor(r() * colors.length)];
    for (let i = 0; i < 4; i++) {
      const t = new THREE.Mesh(new THREE.TorusGeometry(1 + i * 1.1, 0.55, 8, 28), M(i % 2 ? 0xffffff : c1, { roughness: 0.3 }));
      candy.add(t);
    }
    candy.position.y = 10 + s * 6 + 4;
    pop.add(stick, candy);
    pop.position.set(x, 0, z);
    pop.rotation.y = r() * 6;
    spinners.push(candy);
    g.add(pop);
  }
  for (const [x, z, s] of ring(22, 9, 75, 130)) {
    // Gumdrops.
    const gd = new THREE.Mesh(new THREE.SphereGeometry(3 + s * 3, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), M(colors[Math.floor(s * colors.length)], { roughness: 0.25, emissive: 0x220011, emissiveIntensity: 0.2 }));
    gd.position.set(x, 0, z);
    gd.scale.y = 1.3;
    g.add(gd);
  }
  for (const [x, z] of ring(10, 15, 76, 100)) {
    // Candy canes.
    const cane = new THREE.Group();
    const stripeA = M(0xff2f4f), stripeB = M(0xffffff);
    for (let i = 0; i < 8; i++) {
      const seg = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 1.5, 10), i % 2 ? stripeA : stripeB);
      seg.position.y = 0.75 + i * 1.5;
      cane.add(seg);
    }
    const hook = new THREE.Mesh(new THREE.TorusGeometry(2, 0.7, 8, 16, Math.PI), stripeA);
    hook.position.set(2, 12, 0);
    cane.add(hook);
    cane.position.set(x, 0, z);
    cane.rotation.y = Math.atan2(x, z);
    g.add(cane);
  }
  // Floating cotton-candy clouds.
  const clouds = [];
  for (let i = 0; i < 10; i++) {
    const c = new THREE.Group();
    const m = M(i % 2 ? 0xffb8e0 : 0xc8e6ff, { roughness: 1 });
    for (let k = 0; k < 4; k++) {
      const p = new THREE.Mesh(new THREE.SphereGeometry(4 + r() * 3, 12, 8), m);
      p.position.set(k * 4 - 6, r() * 2, r() * 3);
      c.add(p);
    }
    c.position.set((r() - 0.5) * 260, 40 + r() * 25, (r() - 0.5) * 260);
    clouds.push(c);
    g.add(c);
  }
  g.userData.spinners = spinners;
  g.userData.clouds = clouds;
  return g;
}

function buildSea() {
  const g = new THREE.Group();
  const r = rng(91);
  const kelp = [];
  const kelpMat = M(0x2f9a5a, { side: THREE.DoubleSide });
  for (const [x, z, s] of ring(40, 3, 72, 130)) {
    const k = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 10 + s * 12, 1, 6), kelpMat);
    k.position.set(x, (10 + s * 12) / 2, z);
    k.rotation.y = s * 6;
    k.userData.phase = s * 10;
    kelp.push(k);
    g.add(k);
  }
  const coralColors = [0xff6f61, 0xffb347, 0xc86bff, 0xff4f9a, 0xffe066];
  for (const [x, z, s] of ring(26, 8, 74, 120)) {
    const c = new THREE.Group();
    const m = M(coralColors[Math.floor(s * coralColors.length)], { emissive: 0x220000, emissiveIntensity: 0.3 });
    for (let i = 0; i < 5; i++) {
      const b = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.45, 2 + r() * 3, 6), m);
      b.position.set((r() - 0.5) * 2, 1.5, (r() - 0.5) * 2);
      b.rotation.set((r() - 0.5) * 1, 0, (r() - 0.5) * 1);
      c.add(b);
    }
    c.position.set(x, 0, z);
    c.scale.setScalar(1.2 + s);
    g.add(c);
  }
  // Sunken ship.
  const ship = new THREE.Group();
  const wood = M(0x6a4a2a);
  const hull = new THREE.Mesh(new THREE.BoxGeometry(8, 6, 26), wood);
  hull.position.y = 2;
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.5, 18, 8), wood);
  mast.position.y = 12;
  mast.rotation.z = 0.3;
  ship.add(hull, mast);
  ship.rotation.set(0, 0.6, 0.35);
  ship.position.set(-100, 0, 30);
  g.add(ship);
  // Schools of fish circling overhead.
  const fishes = [];
  const fishGeo = new THREE.ConeGeometry(0.5, 1.8, 6);
  fishGeo.rotateX(Math.PI / 2);
  for (let i = 0; i < 60; i++) {
    const f = new THREE.Mesh(fishGeo, M(coralColors[i % coralColors.length], { emissive: 0x332200, emissiveIntensity: 0.4 }));
    f.userData = { r: 30 + r() * 70, h: 12 + r() * 18, s: (0.08 + r() * 0.12) * (i % 2 ? 1 : -1), a: r() * 6.28 };
    fishes.push(f);
    g.add(f);
  }
  // Light rays from the surface.
  const rayMat = new THREE.MeshBasicMaterial({ color: 0xbff4ff, transparent: true, opacity: 0.08, depthWrite: false, side: THREE.DoubleSide, fog: false });
  for (let i = 0; i < 8; i++) {
    const ray = new THREE.Mesh(new THREE.PlaneGeometry(10, 120), rayMat);
    ray.position.set((r() - 0.5) * 160, 50, (r() - 0.5) * 160);
    ray.rotation.set(0, r() * 3, 0.25);
    g.add(ray);
  }
  g.userData.kelp = kelp;
  g.userData.fishes = fishes;
  return g;
}

const BUILDERS = { moon: buildMoon, candy: buildCandy, sea: buildSea };

export class WorldDecor {
  constructor(scene) {
    this.scene = scene;
    this.cache = {};
    this.active = null;
  }

  set(kind) {
    if (this.active) this.active.visible = false;
    this.active = null;
    if (!kind || !BUILDERS[kind]) return;
    if (!this.cache[kind]) {
      this.cache[kind] = BUILDERS[kind]();
      this.scene.add(this.cache[kind]);
    }
    this.active = this.cache[kind];
    this.active.visible = true;
  }

  update(dt, time) {
    const g = this.active;
    if (!g) return;
    const t = time * 0.001;
    const u = g.userData;
    if (u.spin) u.spin.rotation.y += dt * 0.05;
    if (u.dishes) u.dishes.forEach((d, i) => (d.userData.head.rotation.y = t * 0.4 + i));
    if (u.spinners) u.spinners.forEach((s, i) => (s.rotation.z = t * (i % 2 ? 0.5 : -0.5)));
    if (u.clouds) u.clouds.forEach(c => { c.position.x += dt * 2; if (c.position.x > 140) c.position.x = -140; });
    if (u.kelp) u.kelp.forEach(k => (k.rotation.z = Math.sin(t * 1.2 + k.userData.phase) * 0.15));
    if (u.fishes) u.fishes.forEach(f => {
      const d = f.userData;
      d.a += d.s * dt * 3;
      f.position.set(Math.cos(d.a) * d.r, d.h + Math.sin(t + d.r) * 1.5, Math.sin(d.a) * d.r);
      f.rotation.y = -d.a + (d.s > 0 ? Math.PI : 0);
    });
  }
}
