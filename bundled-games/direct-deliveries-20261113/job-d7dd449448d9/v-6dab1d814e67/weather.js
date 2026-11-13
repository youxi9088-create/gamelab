import * as THREE from './_remote/0d0e081c7ee3d520/three@0.184.0.js';

// City weather: visible particles, readable road hazards, warning cues and
// handling changes. Slowing down through hazards earns "smooth driving" cash.
//
// Road layout reference: roads at x/z = ±20, ±60 (9 wide). Hazard patches sit
// on road segments between intersections so players can see them and pick a
// different street.

const MPH = 3; // HUD mph = speed * 3

// Segment helpers: vertical road at x between z0..z1, horizontal at z between x0..x1.
const V = (x, z0, z1) => ({ x, z: (z0 + z1) / 2, w: 8, d: Math.abs(z1 - z0) });
const H = (z, x0, x1) => ({ x: (x0 + x1) / 2, z, w: Math.abs(x1 - x0), d: 8 });
const P = (x, z, s = 5) => ({ x, z, w: s, d: s });

export const WEATHER = {
  clear: { type: 'clear', name: '☀️ Clear skies', tip: 'Perfect driving weather.', patches: [] },
  rain: {
    type: 'rain', name: '🌧 Light rain', tip: 'Puddles can hydroplane above 30 mph.', grip: 0.75, safe: 10, hazardName: 'PUDDLE',
    patches: [P(-20, 0, 6), P(0, 20, 6), P(40, -20, 6), P(-40, 60, 6)],
  },
  dust: {
    type: 'dust', name: '💨 Desert gusts', tip: 'Open outer roads catch gusts. Inner streets are sheltered. Stay under 30 mph when warned.', safe: 10, gusts: true,
    patches: [],
  },
  snow: {
    type: 'snow', name: '❄️ Snow & ice', tip: 'Blue ice on the outer streets. Stay under 25 mph or take the inner roads.', grip: 0.55, safe: 8.4, hazardName: 'ICE',
    patches: [V(-60, -15, 15), V(60, -15, 15), H(60, -15, 15), H(-60, -15, 15), H(20, -55, -25), H(-20, 25, 55), V(20, -55, -25)],
  },
  storm: {
    type: 'storm', name: '⛈ Night storm', tip: 'Heavy rain, deep puddles and the odd gust. Slow down when warned.', grip: 0.7, safe: 10, hazardName: 'PUDDLE', gusts: true,
    patches: [P(-20, 0, 7), P(20, 0, 7), P(0, -20, 7), P(0, 60, 7), P(-60, 40, 7), P(60, -40, 7), P(40, 20, 7), P(-40, -20, 7)],
  },
  // Off-world chapters.
  moon: {
    type: 'moon', name: '🌑 Low gravity', tip: 'The truck floats and slides on the regolith. Solar flares shove you on the outer roads.', grip: 0.6, safe: 9, hazardName: 'MOON DUST', gusts: true,
    gustName: '☀️ Solar flare', base: { grip: 0.7, brake: 0.75, steer: 0.9 }, fog: [70, 220], look: [0xffffff, 0.12, 0.6], fall: 0.6, patchColor: 0x8a8a96,
    patches: [P(-20, 20, 7), P(20, -20, 7), P(60, 20, 7), P(-60, -20, 7), P(0, 60, 7)],
  },
  syrup: {
    type: 'syrup', name: '🍬 Sprinkle storm', tip: 'Sticky syrup slicks grab your wheels above 30 mph.', grip: 0.65, safe: 10, hazardName: 'SYRUP',
    fog: [55, 160], look: [0xff7ac8, 0.3, 0.9], fall: 6, patchColor: 0xc0501a, skidText: '🍯 Stuck in syrup!', smoothText: '🍯 Eased through the syrup',
    patches: [P(-20, -20, 7), P(20, 20, 7), P(-60, 20, 7), P(60, -20, 7), P(0, 20, 6), P(-40, 60, 6), P(40, -60, 6)],
  },
  current: {
    type: 'current', name: '🌊 Deep currents', tip: 'Water drag slows you. Strong currents sweep the outer roads, and sand drifts are slippery.', grip: 0.6, safe: 9, hazardName: 'SAND DRIFT', gusts: true,
    gustName: '🌊 Current', base: { accel: 0.8 }, fog: [25, 105], look: [0xdff8ff, 0.22, 0.7], fall: -2.5, patchColor: 0xe8d49a, skidText: '🏖 Spun out on sand!', smoothText: '🏖 Crawled over the sand',
    patches: [P(-20, 40, 7), P(20, -40, 7), P(-40, -60, 7), P(60, 0, 7), P(-60, 0, 7), P(40, 60, 7)],
  },
};

export class Weather {
  constructor(scene) {
    this.scene = scene;
    this.def = WEATHER.clear;
    this.intensity = 1;
    this.group = new THREE.Group();
    scene.add(this.group);
    this.patchMeshes = [];
    this.windsocks = [];

    const COUNT = 1600;
    this.count = COUNT;
    const pos = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT * 3; i++) pos[i] = (Math.random() - 0.5) * 60;
    this.geo = new THREE.BufferGeometry();
    this.geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    this.pmat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.25, transparent: true, opacity: 0.8, depthWrite: false });
    this.points = new THREE.Points(this.geo, this.pmat);
    this.points.frustumCulled = false;
    this.points.visible = false;
    scene.add(this.points);

    this.gust = { state: 'idle', t: 8, dirX: 1, dirZ: 0, max: 0 };
    this.inside = null; // patch the truck is currently on
    this.insideMax = 0;
    this.warnCooldown = 0;
    this.status = '';
  }

  setCity(key, intensity, baseFog) {
    this.def = WEATHER[key] || WEATHER.clear;
    this.intensity = intensity;
    this.baseFog = baseFog;
    for (const m of [...this.patchMeshes, ...this.windsocks]) this.group.remove(m);
    this.patchMeshes = [];
    this.windsocks = [];
    const t = this.def.type;
    const iceMat = new THREE.MeshStandardMaterial({ color: 0xbfe8ff, roughness: 0.05, metalness: 0.4, transparent: true, opacity: 0.75, emissive: 0x2a5a7a, emissiveIntensity: 0.35 });
    const puddleMat = new THREE.MeshStandardMaterial({ color: 0x24405a, roughness: 0.02, metalness: 0.8, transparent: true, opacity: 0.8 });
    for (const p of this.def.patches) {
      const geo = t === 'snow' ? new THREE.PlaneGeometry(p.w, p.d) : new THREE.CircleGeometry(p.w / 2, 24);
      const m = new THREE.Mesh(geo, t === 'snow' ? iceMat : this.def.patchColor ? new THREE.MeshStandardMaterial({ color: this.def.patchColor, roughness: 0.4, transparent: true, opacity: 0.85 }) : puddleMat);
      m.rotation.x = -Math.PI / 2;
      if (t !== 'snow') m.scale.set(1, p.d / p.w * 0.7, 1);
      m.position.set(p.x, 0.035, p.z);
      this.group.add(m);
      // Warning sign beside each hazard.
      const sign = new THREE.Group();
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 2.2, 6), new THREE.MeshStandardMaterial({ color: 0x777777 }));
      post.position.y = 1.1;
      const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.75, 0.06, 3), new THREE.MeshStandardMaterial({ color: 0xffcc1a, emissive: 0x553300, emissiveIntensity: 0.4 }));
      plate.rotation.set(Math.PI / 2, 0, Math.PI);
      plate.position.y = 2.5;
      sign.add(post, plate);
      sign.position.set(p.x + (p.w > p.d ? 0 : 5.5), 0, p.z + (p.w > p.d ? 5.5 : 0));
      this.group.add(sign);
      this.patchMeshes.push(m, sign);
    }
    if (this.def.gusts) {
      for (const [x, z] of [[-66, 0], [66, 0], [0, 66], [-66, 40], [66, -40], [40, -66]]) {
        const sock = new THREE.Group();
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 5, 6), new THREE.MeshStandardMaterial({ color: 0xdddddd }));
        pole.position.y = 2.5;
        const cone = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.15, 2, 10, 1, true), new THREE.MeshStandardMaterial({ color: 0xff7a1a, side: THREE.DoubleSide }));
        cone.rotation.z = Math.PI / 2;
        cone.position.set(1, 4.8, 0);
        const arm = new THREE.Group();
        arm.position.y = 0;
        arm.add(cone);
        sock.add(pole, arm);
        sock.position.set(x, 0, z);
        sock.userData.arm = arm;
        sock.userData.cone = cone;
        this.group.add(sock);
        this.windsocks.push(sock);
      }
    }
    // Particles.
    const look = { rain: [0x9fc4ff, 0.18, 0.75], storm: [0x9fc4ff, 0.2, 0.85], snow: [0xffffff, 0.32, 0.95], dust: [0xd8b078, 0.35, 0.55] }[t] || this.def.look;
    this.points.visible = !!look;
    if (look) {
      this.pmat.color.setHex(look[0]);
      this.pmat.size = look[1];
      this.pmat.opacity = look[2];
    }
    this.gust = { state: 'idle', t: 10 / intensity, dirX: 1, dirZ: 0, max: 0 };
    this.inside = null;
    this.status = '';
  }

  patchAt(x, z) {
    for (const p of this.def.patches) if (Math.abs(x - p.x) < p.w / 2 && Math.abs(z - p.z) < p.d / 2) return p;
    return null;
  }

  // Exposure to gusts: outer roads are open plains, inner streets sheltered.
  exposure(x, z) {
    return Math.abs(x) > 45 || Math.abs(z) > 45 ? 1 : 0.35;
  }

  // Main per-frame step. hooks: { flash(text,s), reward(amount, why), skid(why) }
  update(dt, time, truckPos, heading, speed, onFoot, center, hooks) {
    const d = this.def;
    const k = this.intensity;
    const out = { grip: 1, steer: 1, brake: 1, accel: 1, pushX: 0, pushZ: 0, fogNear: this.baseFog[0], fogFar: this.baseFog[1] };
    const spd = Math.abs(speed);
    this.warnCooldown = Math.max(0, this.warnCooldown - dt);

    // ---- Particles follow the camera target ----
    if (this.points.visible) {
      const arr = this.geo.attributes.position.array;
      const t = d.type;
      const gusting = this.gust.state === 'gust';
      const fall = d.fall ?? (t === 'snow' ? 3 : t === 'dust' ? 0.4 : 32);
      const drift = t === 'dust' ? (gusting ? 30 : 9) : t === 'snow' ? 1.2 : gusting ? 8 : 2;
      for (let i = 0; i < this.count; i++) {
        const j = i * 3;
        arr[j] += (this.gust.dirX * drift + (t === 'snow' ? Math.sin(time * 0.001 + i) * 0.8 : 0)) * dt;
        arr[j + 1] -= fall * dt;
        arr[j + 2] += this.gust.dirZ * drift * dt;
        if (arr[j + 1] < 0 || arr[j + 1] > 26 || Math.abs(arr[j] - center.x) > 30 || Math.abs(arr[j + 2] - center.z) > 30) {
          arr[j] = center.x + (Math.random() - 0.5) * 60;
          arr[j + 1] = t === 'dust' ? Math.random() * 6 : 4 + Math.random() * 20;
          arr[j + 2] = center.z + (Math.random() - 0.5) * 60;
        }
      }
      this.geo.attributes.position.needsUpdate = true;
    }

    if (d.type === 'clear') {
      this.status = '';
      return out;
    }

    // Base weather fog and general grip.
    if (d.type === 'rain') { out.fogNear = 45; out.fogFar = 140; }
    if (d.type === 'storm') { out.fogNear = 30; out.fogFar = 110; }
    if (d.type === 'snow') { out.fogNear = 40; out.fogFar = 125; out.grip = 0.75; out.brake = 0.85; }
    if (d.type === 'dust') { out.fogNear = 40; out.fogFar = 130; }
    if (d.fog) { out.fogNear = d.fog[0]; out.fogFar = d.fog[1]; }
    if (d.base) Object.assign(out, d.base);

    // ---- Surface hazards (ice / puddles) ----
    const fx = truckPos.x + Math.sin(heading) * 14;
    const fz = truckPos.z + Math.cos(heading) * 14;
    const here = onFoot ? null : this.patchAt(truckPos.x, truckPos.z);
    const ahead = onFoot ? null : this.patchAt(fx, fz);
    if (ahead && !here && this.warnCooldown <= 0 && spd > d.safe * 0.8) {
      hooks.flash(`⚠️ ${d.hazardName} AHEAD! Slow below ${Math.round(d.safe * MPH)} mph`, 1.6);
      this.warnCooldown = 3;
    }
    if (here) {
      const g = d.grip;
      const fast = spd > d.safe;
      // Penalties scale with difficulty; being slow keeps decent control.
      out.grip = fast ? Math.max(0.06, (g * 0.2) / k) : Math.max(0.3, g / k);
      out.steer = fast ? 0.45 : 0.8;
      out.brake = fast ? 0.35 : 0.7;
      out.accel = 0.6;
      if (this.inside !== here) {
        this.inside = here;
        this.insideMax = spd;
        if (fast) hooks.skid(d.skidText || (d.type === 'snow' ? '🧊 Sliding on ice!' : d.type === 'moon' ? '🌑 Drifting in moon dust!' : '💦 Hydroplaning!'));
      }
      this.insideMax = Math.max(this.insideMax, spd);
    } else if (this.inside) {
      if (this.insideMax <= d.safe) hooks.reward(8, d.smoothText || (d.type === 'snow' ? '🧊 Smooth over the ice' : d.type === 'moon' ? '🌑 Floated over the dust' : '💦 Careful through the puddle'));
      this.inside = null;
    }

    // ---- Gusts ----
    const gust = this.gust;
    if (d.gusts) {
      gust.t -= dt;
      if (gust.state === 'idle' && gust.t <= 0) {
        gust.state = 'warn';
        gust.t = 3;
        const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
        [gust.dirX, gust.dirZ] = dirs[Math.floor(Math.random() * dirs.length)];
        const from = gust.dirX > 0 ? 'west' : gust.dirX < 0 ? 'east' : gust.dirZ > 0 ? 'north' : 'south';
        hooks.flash(`${d.gustName || '💨 Gust'} from the ${from} in 3s! Slow down or duck into the inner streets`, 2.4);
      } else if (gust.state === 'warn' && gust.t <= 0) {
        gust.state = 'gust';
        gust.t = 3.5;
        gust.max = 0;
      } else if (gust.state === 'gust') {
        const exp = onFoot ? 0 : this.exposure(truckPos.x, truckPos.z);
        // Faster = more side push; a slow truck barely moves.
        const strength = 7 * k * exp * (0.25 + Math.min(1, spd / 12));
        out.pushX = gust.dirX * strength;
        out.pushZ = gust.dirZ * strength;
        out.steer *= 0.8;
        out.fogNear = d.type === 'dust' ? 14 : out.fogNear * 0.7;
        out.fogFar = d.type === 'dust' ? 75 : out.fogFar * 0.8;
        gust.max = Math.max(gust.max, spd * exp);
        if (gust.t <= 0) {
          gust.state = 'idle';
          gust.t = (12 + Math.random() * 10) / k;
          if (!onFoot && gust.max <= d.safe) hooks.reward(10, '💨 Rode out the gust');
          else if (!onFoot) hooks.skid('💨 The gust shoved the truck!');
        }
      }
      for (const sock of this.windsocks) {
        const target = Math.atan2(-gust.dirZ, gust.dirX);
        sock.userData.arm.rotation.y = THREE.MathUtils.lerp(sock.userData.arm.rotation.y, target, dt * 2);
        sock.userData.cone.rotation.x = gust.state === 'gust' ? 0 : Math.sin(time * 0.003) * 0.3;
        sock.userData.cone.position.y = gust.state === 'gust' ? 4.8 : 4.3;
      }
    }

    // ---- HUD status line ----
    const safeMph = Math.round(d.safe * MPH);
    const gn = d.gustName || '💨 Gust';
    if (gust.state === 'warn') this.status = `<b style="color:#ffb347">${gn.toUpperCase()} IN ${Math.ceil(gust.t)}s · ≤${safeMph} mph</b>`;
    else if (gust.state === 'gust') this.status = `<b style="color:#ff6b6b">${gn.toUpperCase()}! ${this.exposure(truckPos.x, truckPos.z) < 1 ? '(sheltered)' : 'Slow down!'}</b>`;
    else if (here) this.status = `<b style="color:${spd > d.safe ? '#ff6b6b' : '#8fe3ff'}">${d.type === 'snow' ? '🧊 ON ICE' : d.type === 'rain' || d.type === 'storm' ? '💦 PUDDLE' : '⚠️ ' + d.hazardName} · ≤${safeMph} mph</b>`;
    else if (ahead) this.status = `<b style="color:#ffb347">⚠️ ${d.hazardName} AHEAD</b>`;
    else this.status = `<span style="opacity:.8">${d.name}</span>`;
    return out;
  }
}
