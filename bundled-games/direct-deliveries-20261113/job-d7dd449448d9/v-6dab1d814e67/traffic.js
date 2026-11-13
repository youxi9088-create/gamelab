import * as THREE from './_remote/0d0e081c7ee3d520/three@0.184.0.js';
import { box, mat } from './town.js';

// Looping traffic with lights/stop signs, police cruisers, and sidewalk pedestrians.
const LINES = [-60, -20, 20, 60];
const LANE = 2.2;
const CAR_COLORS = [0xd8333a, 0x2f7fd8, 0xf2c230, 0xf5f5f5, 0x2a2a2a, 0x3aa86b, 0xff8a3d, 0x8e44ad];
const SHIRTS = [0xe74c3c, 0x3498db, 0xf1c40f, 0x2ecc71, 0x9b59b6, 0xe67e22, 0xffffff, 0x1abc9c];
const SKIN = [0xf1c27d, 0xe0ac69, 0xc68642, 0x8d5524, 0xffdbac];

// Each loop is a rectangle of road corners; cars circle it forever.
const LOOPS = [
  { pts: [[-60, -60], [60, -60], [60, 60], [-60, 60]], cars: 3, police: 1 },
  { pts: [[-20, -20], [-20, 20], [20, 20], [20, -20]], cars: 2, police: 1 },
  { pts: [[-60, -20], [-20, -20], [-20, 60], [-60, 60]], cars: 2 },
  { pts: [[20, -60], [20, 20], [60, 20], [60, -60]], cars: 2 },
  { pts: [[-20, 20], [60, 20], [60, 60], [-20, 60]], cars: 2 },
  { pts: [[-60, -60], [-60, -20], [20, -20], [20, -60]], cars: 2 },
];

const CONTROLS = [
  { x: -20, z: 20, type: 'light', offset: 0 },
  { x: 20, z: 20, type: 'light', offset: 5 },
  { x: 20, z: -20, type: 'light', offset: 9 },
  { x: -60, z: -60, type: 'light', offset: 3 },
  { x: 60, z: 60, type: 'light', offset: 11 },
  { x: -20, z: -20, type: 'stop' },
  { x: -60, z: 20, type: 'stop' },
  { x: 60, z: -20, type: 'stop' },
  { x: 20, z: 60, type: 'stop' },
  { x: -20, z: -60, type: 'stop' },
];

function buildPath(pts) {
  const n = pts.length;
  const dirs = pts.map((p, i) => {
    const q = pts[(i + 1) % n];
    const v = new THREE.Vector2(q[0] - p[0], q[1] - p[1]).normalize();
    return v;
  });
  const right = d => new THREE.Vector2(-d.y, d.x);
  const points = pts.map((p, i) => {
    const offset = right(dirs[(i + n - 1) % n]).add(right(dirs[i])).multiplyScalar(LANE);
    return new THREE.Vector2(p[0], p[1]).add(offset);
  });
  const lengths = points.map((p, i) => p.distanceTo(points[(i + 1) % n]));
  return { points, dirs, lengths };
}

function makeCar(color, police = false) {
  const g = new THREE.Group();
  box(g, 2, 0.8, 4.2, color, 0, 0.75, 0);
  if (police) {
    box(g, 2.02, 0.42, 4.22, 0x111111, 0, 0.55, 0);
    box(g, 2.03, 0.3, 1.4, 0x111111, 0, 0.85, 0.2);
  }
  box(g, 1.8, 0.7, 2.2, 0x22313f, 0, 1.5, -0.2, { emissive: 0x0a1520 });
  box(g, 1.84, 0.12, 2.0, color, 0, 1.9, -0.2);
  for (const sx of [-0.6, 0.6]) {
    box(g, 0.4, 0.22, 0.08, 0xfff4c0, sx, 0.85, 2.12, { emissive: 0xaa9955 });
    box(g, 0.4, 0.22, 0.08, 0xc0392b, sx, 0.85, -2.12, { emissive: 0x551111 });
  }
  const wheelGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.3, 12);
  wheelGeo.rotateZ(Math.PI / 2);
  for (const [wx, wz] of [[-1, 1.3], [1, 1.3], [-1, -1.3], [1, -1.3]]) {
    const wheel = new THREE.Mesh(wheelGeo, mat(0x1a1a1a));
    wheel.position.set(wx, 0.42, wz);
    g.add(wheel);
  }
  let lights = null;
  if (police) {
    const red = new THREE.MeshBasicMaterial({ color: 0xff2020 });
    const blue = new THREE.MeshBasicMaterial({ color: 0x2040ff });
    const r = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.25, 0.4), red);
    r.position.set(-0.4, 2.08, -0.2);
    const b = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.25, 0.4), blue);
    b.position.set(0.4, 2.08, -0.2);
    g.add(r, b);
    lights = [red, blue];
  }
  g.traverse(c => { if (c.isMesh) c.castShadow = true; });
  return { mesh: g, lights };
}

const PANTS = [0x2f3d5a, 0x3b3b3b, 0x6b5a45, 0x1f4e79, 0x7a7f86];
const HAIR = [0x3b2a1a, 0x111111, 0xd9b36a, 0x7a3b2a, 0xb8b8b8];
const personMats = new Map();
function smoothMat(color, roughness = 0.75) {
  if (!personMats.has(color)) personMats.set(color, new THREE.MeshStandardMaterial({ color, roughness }));
  return personMats.get(color);
}
function part(parent, geo, color, x, y, z) {
  const m = new THREE.Mesh(geo, smoothMat(color));
  m.position.set(x, y, z);
  m.castShadow = true;
  parent.add(m);
  return m;
}

// Smooth, rounded townsfolk built from capsules and spheres.
export function makePerson(rng) {
  const g = new THREE.Group();
  const pick = arr => arr[Math.floor(rng() * arr.length)];
  const shirt = pick(SHIRTS);
  const skin = pick(SKIN);
  const pants = pick(PANTS);
  const hair = pick(HAIR);
  const build = 0.9 + rng() * 0.2;
  const legs = [];
  const arms = [];
  for (const side of [-1, 1]) {
    const leg = new THREE.Group();
    part(leg, new THREE.CapsuleGeometry(0.1, 0.58, 4, 12), pants, 0, -0.38, 0);
    const shoe = part(leg, new THREE.SphereGeometry(0.11, 14, 10), 0x2a2420, 0, -0.78, 0.05);
    shoe.scale.set(1, 0.55, 1.6);
    leg.position.set(side * 0.13, 0.86, 0);
    g.add(leg);
    legs.push(leg);
    const arm = new THREE.Group();
    part(arm, new THREE.CapsuleGeometry(0.075, 0.45, 4, 12), shirt, 0, -0.3, 0);
    part(arm, new THREE.SphereGeometry(0.075, 12, 10), skin, 0, -0.62, 0);
    arm.position.set(side * 0.33 * build, 1.58, 0);
    g.add(arm);
    arms.push(arm);
  }
  const torso = part(g, new THREE.CapsuleGeometry(0.24, 0.42, 6, 16), shirt, 0, 1.3, 0);
  torso.scale.set(build, 1, 0.68);
  part(g, new THREE.CylinderGeometry(0.08, 0.09, 0.12, 12), skin, 0, 1.7, 0);
  part(g, new THREE.SphereGeometry(0.22, 20, 16), skin, 0, 1.92, 0);
  for (const side of [-1, 1]) part(g, new THREE.SphereGeometry(0.025, 8, 6), 0x1a1a1a, side * 0.08, 1.95, 0.2);
  const hairCap = part(g, new THREE.SphereGeometry(0.235, 20, 12, 0, Math.PI * 2, 0, Math.PI * 0.55), hair, 0, 1.94, -0.02);
  hairCap.rotation.x = -0.25;
  if (rng() < 0.3) {
    const hat = part(g, new THREE.CylinderGeometry(0.2, 0.24, 0.16, 18), pick([0xd8333a, 0x2f7fd8, 0xf2c230]), 0, 2.12, 0);
    part(hat, new THREE.CylinderGeometry(0.34, 0.34, 0.02, 20), 0x333333, 0, -0.07, 0);
  }
  g.userData = { legs, arms };
  return g;
}

function stopTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 128;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#c62828';
  ctx.fillRect(0, 0, 128, 128);
  ctx.fillStyle = '#fff';
  ctx.font = '800 40px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('STOP', 64, 66);
  const t = new THREE.CanvasTexture(canvas);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export class Traffic {
  constructor(scene, peopleCount = 22) {
    this.scene = scene;
    this.clock = 0;
    this.cars = [];
    this.people = [];
    this.intersections = CONTROLS;
    this.lightHeads = [];
    let seed = 7;
    const rng = () => {
      seed = (seed * 16807) % 2147483647;
      return seed / 2147483647;
    };

    let colorIndex = 0;
    for (const loop of LOOPS) {
      const path = buildPath(loop.pts);
      const total = path.lengths.reduce((a, b) => a + b, 0);
      const count = loop.cars + (loop.police || 0);
      for (let i = 0; i < count; i++) {
        const police = i < (loop.police || 0);
        const { mesh, lights } = makeCar(police ? 0xf4f4f4 : CAR_COLORS[colorIndex++ % CAR_COLORS.length], police);
        let dist = (total / count) * i + rng() * 5;
        let seg = 0;
        while (dist > path.lengths[seg]) {
          dist -= path.lengths[seg];
          seg = (seg + 1) % path.points.length;
        }
        const car = { mesh, lights, police, path, seg, t: dist, maxSpeed: police ? 9 : 6 + rng() * 3, speed: 0, bump: 0, blocked: 0, swerveTimer: 0, swerve: 0, wait: 0, clearInter: null, clearTime: -99 };
        scene.add(mesh);
        this.cars.push(car);
        this.placeCar(car, 1);
      }
    }

    // Traffic lights and stop signs.
    const poleMat = mat(0x2d3238);
    this.poles = []; // {x,z} of every traffic-light / stop-sign pole, for collisions
    const stopMat = new THREE.MeshBasicMaterial({ map: stopTexture(), side: THREE.DoubleSide });
    for (const inter of CONTROLS) {
      if (inter.type === 'light') {
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.18, 6, 8), poleMat);
        pole.position.set(inter.x - 5.4, 3, inter.z + 5.4);
        pole.castShadow = true;
        scene.add(pole);
        this.poles.push({ x: inter.x - 5.4, z: inter.z + 5.4 });
        for (const axis of ['x', 'z']) {
          const head = new THREE.Group();
          box(head, 0.6, 1.8, 0.5, 0x1d1f22, 0, 0, 0);
          const lamps = {};
          [['red', 0.55], ['yellow', 0], ['green', -0.55]].forEach(([name, y]) => {
            const m = new THREE.MeshBasicMaterial({ color: 0x222222 });
            const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.2, 10, 8), m);
            lamp.position.set(0, y, 0.27);
            head.add(lamp);
            lamps[name] = m;
          });
          const back = lamps.red;
          void back;
          head.position.set(inter.x - 5.4, 5.6, inter.z + 5.4);
          head.rotation.y = axis === 'x' ? -Math.PI / 2 : 0;
          if (axis === 'x') head.position.y = 4.6;
          scene.add(head);
          this.lightHeads.push({ inter, axis, lamps });
        }
      } else {
        for (const [sx, sz] of [[5.4, 5.4], [-5.4, -5.4]]) {
          const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 2.6, 6), poleMat);
          pole.position.set(inter.x + sx, 1.3, inter.z + sz);
          const sign = new THREE.Mesh(new THREE.CircleGeometry(0.75, 8), stopMat);
          sign.position.set(inter.x + sx, 2.8, inter.z + sz);
          sign.rotation.y = Math.PI / 4 + (sx > 0 ? 0 : Math.PI);
          sign.rotation.z = Math.PI / 8;
          scene.add(pole, sign);
          this.poles.push({ x: inter.x + sx, z: inter.z + sz });
        }
      }
    }

    for (let i = 0; i < peopleCount; i++) {
      const mesh = makePerson(rng);
      const axis = rng() < 0.5 ? 'x' : 'z';
      const start = -55 + rng() * 110;
      const person = {
        mesh, axis, line: LINES[Math.floor(rng() * 4)], side: rng() < 0.5 ? -5.7 : 5.7,
        pos: start, min: start - 12 - rng() * 10, max: start + 12 + rng() * 10,
        dir: rng() < 0.5 ? 1 : -1, speed: 1.1 + rng() * 0.7, phase: rng() * 6, panic: 0,
      };
      scene.add(mesh);
      this.people.push(person);
    }
  }

  lightState(inter, axis) {
    const phase = (this.clock + inter.offset) % 14;
    const x = phase < 5.5 ? 'green' : phase < 7 ? 'yellow' : 'red';
    const z = phase < 7 ? 'red' : phase < 12.5 ? 'green' : 'yellow';
    return axis === 'x' ? x : z;
  }

  // Move any car within `radius` of pos further along its loop so the player
  // never starts a shift boxed in by traffic.
  clearArea(pos, radius = 30) {
    for (const car of this.cars) {
      let tries = 0;
      while (car.mesh.position.distanceTo(pos) < radius && tries++ < 20) {
        car.t += 8;
        while (car.t > car.path.lengths[car.seg]) {
          car.t -= car.path.lengths[car.seg];
          car.seg = (car.seg + 1) % car.path.points.length;
        }
        car.swerve = 0;
        car.swerveTimer = 0;
        car.blocked = 0;
        car.speed = 0;
        this.placeCar(car, 1);
      }
    }
  }

  policeNear(pos, radius) {
    return this.cars.some(c => c.police && c.mesh.position.distanceTo(pos) < radius);
  }

  placeCar(car, dt) {
    const { points, dirs } = car.path;
    const d = dirs[car.seg];
    const p = points[car.seg];
    const side = car.swerve * LANE * 2;
    // Swerving moves the car left (into the passing lane).
    car.mesh.position.set(p.x + d.x * car.t + d.y * side, 0, p.y + d.y * car.t - d.x * side);
    const target = Math.atan2(d.x, d.y);
    let diff = target - car.mesh.rotation.y;
    diff = Math.atan2(Math.sin(diff), Math.cos(diff));
    car.mesh.rotation.y += diff * Math.min(1, dt * 8);
  }

  update(dt, truckPos, time) {
    this.clock += dt;
    let hit = null;

    for (const head of this.lightHeads) {
      const state = this.lightState(head.inter, head.axis);
      head.lamps.red.color.setHex(state === 'red' ? 0xff2a2a : 0x331111);
      head.lamps.yellow.color.setHex(state === 'yellow' ? 0xffd030 : 0x332a11);
      head.lamps.green.color.setHex(state === 'green' ? 0x30ff6a : 0x113319);
    }

    for (const car of this.cars) {
      const d = car.path.dirs[car.seg];
      const axis = Math.abs(d.x) > 0.5 ? 'x' : 'z';
      const pos = car.mesh.position;
      let target = car.maxSpeed;

      for (const inter of this.intersections) {
        const rx = inter.x - pos.x;
        const rz = inter.z - pos.z;
        const along = rx * d.x + rz * d.y;
        const lateral = Math.abs(rx * d.y - rz * d.x);
        if (lateral > 5 || along < 6.5 || along > 20) continue;
        const brake = Math.max(0, (along - 7.5) * 1.5);
        if (inter.type === 'light') {
          const state = this.lightState(inter, axis);
          if (state === 'red' || (state === 'yellow' && along > 11)) target = Math.min(target, brake);
        } else if (!(car.clearInter === inter && this.clock - car.clearTime < 5)) {
          target = Math.min(target, brake);
          if (car.speed < 0.6 && along < 10) {
            car.wait += dt;
            if (car.wait > 0.8) {
              car.clearInter = inter;
              car.clearTime = this.clock;
              car.wait = 0;
            }
          }
        }
      }

      // Follow traffic in the same lane; cross traffic never blocks, so no gridlock.
      const blockedBy = (px, pz, reach, needSameDir, other) => {
        const rx = px - pos.x;
        const rz = pz - pos.z;
        const ahead = rx * d.x + rz * d.y;
        const lateral = Math.abs(rx * d.y - rz * d.x);
        if (ahead <= 0 || ahead > reach || lateral > 1.8) return false;
        if (!needSameDir) return true;
        const od = other.path.dirs[other.seg];
        return od.x * d.x + od.y * d.y > 0.5;
      };
      let blocked = blockedBy(truckPos.x, truckPos.z, 9, false);
      for (const other of this.cars) {
        if (other !== car && blockedBy(other.mesh.position.x, other.mesh.position.z, 7, true, other)) blocked = true;
      }
      if (blocked) {
        target = 0;
        car.blocked += dt;
        if (car.blocked > 1.5) car.swerveTimer = 3.5;
      } else {
        car.blocked = 0;
      }
      car.swerveTimer = Math.max(0, car.swerveTimer - dt);
      car.swerve = THREE.MathUtils.damp(car.swerve, car.swerveTimer > 0 ? 1 : 0, 3, dt);

      car.bump = Math.max(0, car.bump - dt);
      if (car.bump > 0) target = 0;
      car.speed = THREE.MathUtils.damp(car.speed, target, target < car.speed ? 5 : 1.5, dt);
      car.t += car.speed * dt;
      while (car.t > car.path.lengths[car.seg]) {
        car.t -= car.path.lengths[car.seg];
        car.seg = (car.seg + 1) % car.path.points.length;
      }
      this.placeCar(car, dt);
      if (car.bump > 0) pos.y = Math.abs(Math.sin(car.bump * 12)) * 0.25;
      if (car.lights) {
        const flip = Math.floor(time * 0.006) % 2 === 0;
        car.lights[0].color.setHex(flip ? 0xff2020 : 0x330808);
        car.lights[1].color.setHex(flip ? 0x0a0a33 : 0x2040ff);
      }
      if (!hit && car.bump === 0 && car.swerve < 0.3 && pos.distanceTo(truckPos) < 3.6) {
        car.bump = 2;
        hit = car;
      }
    }

    for (const p of this.people) {
      const along = p.axis === 'z' ? p.mesh.position.z : p.mesh.position.x;
      const near = Math.hypot(truckPos.x - p.mesh.position.x, truckPos.z - p.mesh.position.z) < 5;
      if (near && p.panic <= 0) {
        p.panic = 1.4;
        const truckAlong = p.axis === 'z' ? truckPos.z : truckPos.x;
        p.dir = along > truckAlong ? 1 : -1;
      }
      p.panic = Math.max(0, p.panic - dt);
      const speed = p.speed * (p.panic > 0 ? 3 : 1);
      p.pos += p.dir * speed * dt;
      if (p.pos > p.max) p.dir = -1;
      if (p.pos < p.min) p.dir = 1;
      p.phase += dt * speed * 4;
      const swing = Math.sin(p.phase) * 0.6;
      p.mesh.userData.legs[0].rotation.x = swing;
      p.mesh.userData.legs[1].rotation.x = -swing;
      p.mesh.userData.arms[0].rotation.x = p.panic > 0 ? -2.8 : -swing;
      p.mesh.userData.arms[1].rotation.x = p.panic > 0 ? -2.8 : swing;
      const x = p.axis === 'z' ? p.line + p.side : p.pos;
      const z = p.axis === 'z' ? p.pos : p.line + p.side;
      p.mesh.position.set(x, p.panic > 0 ? Math.abs(Math.sin(time * 0.02)) * 0.3 : 0, z);
      p.mesh.rotation.y = p.axis === 'z' ? (p.dir > 0 ? 0 : Math.PI) : (p.dir > 0 ? Math.PI / 2 : -Math.PI / 2);
    }
    return hit;
  }
}
