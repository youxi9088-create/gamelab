import * as THREE from './_remote/0d0e081c7ee3d520/three@0.184.0.js';

// Playful roadside events: Raccoon Raids and Block Parties.
// Each one spawns a temporary pile of event trash with a tall colored beacon,
// a floating countdown sign, and a payoff when every piece is loaded in time.

export const EVENT_TYPES = {
  raccoon: { label: '🦝 Raccoon Raid', color: 0xa070ff, css: '#c9a6ff', time: 28, reward: 70, timeBonus: 10, pieces: [['can', 0, 0], ['bag', 2.2, 1.4], ['bag', -2, 1.8], ['bag', 1, -2.2]] },
  party: { label: '🎉 Block Party', color: 0xff5fb0, css: '#ff9fd0', time: 38, reward: 130, timeBonus: 14, pieces: [['bag', 0, 0], ['bag', 1.4, 0.6], ['can', -1.6, 0.8], ['bag', 0.4, 1.8], ['can', 2.4, -1.2], ['bag', -1.2, -1.6], ['dumpster', -3.4, 2.6]] },
};

// Curbside spots just off the roads (sidewalk edge), spread across town.
const SPOTS = [
  [-26, 34], [-34, 26], [-54, 26], [-26, 50], [26, -48], [34, -26], [26, -30], [-9, -26],
  [10, -26], [-14, -46], [-5, 26], [12, 26], [40, 26], [-40, 54], [10, 54], [44, 54],
  [-54, -14], [-26, -10], [26, 10], [54, 14], [-54, 6], [54, -40], [-40, -26], [40, 14],
];

function labelTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return { canvas, tex };
}

function drawLabel(label, emoji, seconds, left, css) {
  const g = label.canvas.getContext('2d');
  g.clearRect(0, 0, 256, 128);
  g.fillStyle = 'rgba(20,16,32,0.82)';
  g.beginPath();
  g.roundRect(8, 8, 240, 112, 26);
  g.fill();
  g.strokeStyle = css;
  g.lineWidth = 6;
  g.stroke();
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = '56px sans-serif';
  g.fillText(emoji, 60, 64);
  g.fillStyle = seconds <= 8 ? '#ff6b6b' : '#ffffff';
  g.font = '900 54px Inter, Arial, sans-serif';
  g.fillText(`${seconds}s`, 160, 50);
  g.fillStyle = css;
  g.font = '800 26px Inter, Arial, sans-serif';
  g.fillText(`${left} left`, 160, 96);
  label.tex.needsUpdate = true;
}

function makeRaccoon() {
  const g = new THREE.Group();
  const fur = new THREE.MeshStandardMaterial({ color: 0x8a8a90, roughness: 0.9 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x222226, roughness: 0.8 });
  const light = new THREE.MeshStandardMaterial({ color: 0xe8e4dc, roughness: 0.9 });
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.42, 14, 10), fur);
  body.scale.set(0.8, 0.7, 1.3);
  body.position.y = 0.42;
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.28, 14, 10), fur);
  head.position.set(0, 0.62, 0.55);
  const mask = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 8), dark);
  mask.scale.set(1.35, 0.45, 0.8);
  mask.position.set(0, 0.66, 0.66);
  const snout = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 8), light);
  snout.position.set(0, 0.56, 0.8);
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 6), dark);
  nose.position.set(0, 0.58, 0.92);
  g.add(body, head, mask, snout, nose);
  for (const s of [-1, 1]) {
    const ear = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.16, 8), dark);
    ear.position.set(s * 0.16, 0.86, 0.5);
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 6), light);
    eye.position.set(s * 0.1, 0.68, 0.8);
    g.add(ear, eye);
  }
  const tail = new THREE.Group();
  for (let i = 0; i < 5; i++) {
    const ring = new THREE.Mesh(new THREE.SphereGeometry(0.15 - i * 0.012, 10, 8), i % 2 ? dark : fur);
    ring.scale.z = 1.4;
    ring.position.set(0, i * 0.08, -i * 0.2);
    tail.add(ring);
  }
  tail.position.set(0, 0.5, -0.55);
  tail.rotation.x = -0.4;
  g.add(tail);
  g.traverse(o => { if (o.isMesh) o.castShadow = true; });
  g.userData.tail = tail;
  return g;
}

function makePartyProps(color) {
  const g = new THREE.Group();
  const table = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.1, 1), new THREE.MeshStandardMaterial({ color: 0xffffff }));
  table.position.set(4, 0.9, -1);
  g.add(table);
  for (const [lx, lz] of [[-1.1, -0.4], [1.1, -0.4], [-1.1, 0.4], [1.1, 0.4]]) {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.9, 6), new THREE.MeshStandardMaterial({ color: 0x777777 }));
    leg.position.set(4 + lx, 0.45, -1 + lz);
    g.add(leg);
  }
  const balloons = [];
  const hues = [0xff4f6f, 0xffd23f, 0x4fb3ff, 0x7dff6f, color];
  hues.forEach((hue, i) => {
    const b = new THREE.Mesh(new THREE.SphereGeometry(0.34, 14, 10), new THREE.MeshStandardMaterial({ color: hue, roughness: 0.25 }));
    b.scale.y = 1.2;
    b.position.set(4.6 + (i - 2) * 0.35, 3 + (i % 2) * 0.4, -1.4);
    const string = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 2.1, 4), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    string.position.set(b.position.x, b.position.y - 1.2, b.position.z);
    g.add(b, string);
    balloons.push(b);
  });
  // Bunting line between two poles.
  for (const px of [-4, 6]) {
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 3.4, 6), new THREE.MeshStandardMaterial({ color: 0x8a6a4a }));
    pole.position.set(px, 1.7, -3);
    g.add(pole);
  }
  for (let i = 0; i < 10; i++) {
    const flag = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.45, 3), new THREE.MeshStandardMaterial({ color: hues[i % hues.length], side: THREE.DoubleSide }));
    flag.rotation.x = Math.PI;
    flag.position.set(-3.5 + i * 1.0, 3.05 - Math.sin((i / 9) * Math.PI) * 0.4, -3);
    g.add(flag);
  }
  g.userData.balloons = balloons;
  return g;
}

export class RoadsideEvents {
  constructor(scene, hooks) {
    this.scene = scene;
    this.hooks = hooks; // { spawnItem(type,x,z,event), removeItem(item), flash(text,s), reward(event), truckPos() }
    this.active = null;
    this.cooldown = 20;
    this.frequency = 1;
  }

  reset(frequency = 1) {
    this.clear(false);
    this.frequency = frequency;
    this.cooldown = 18 / frequency;
  }

  start() {
    const truck = this.hooks.truckPos();
    const options = SPOTS.filter(([x, z]) => Math.hypot(x - truck.x, z - truck.z) > 28);
    const [x, z] = options[Math.floor(Math.random() * options.length)];
    const kind = Math.random() < 0.55 ? 'raccoon' : 'party';
    const def = EVENT_TYPES[kind];
    const group = new THREE.Group();
    group.position.set(x, 0, z);
    this.scene.add(group);

    const beamMat = new THREE.MeshBasicMaterial({ color: def.color, transparent: true, opacity: 0.32, depthWrite: false, side: THREE.DoubleSide });
    const beam = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.6, 22, 16, 1, true), beamMat);
    beam.position.y = 11;
    const ring = new THREE.Mesh(new THREE.RingGeometry(4.6, 5.4, 36), new THREE.MeshBasicMaterial({ color: def.color, transparent: true, opacity: 0.6, depthWrite: false }));
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.06;
    const label = labelTexture();
    const sign = new THREE.Sprite(new THREE.SpriteMaterial({ map: label.tex, depthTest: false }));
    sign.scale.set(5, 2.5, 1);
    sign.position.y = 7.5;
    sign.renderOrder = 10;
    group.add(beam, ring, sign);

    const event = { kind, def, group, beam, ring, sign, label, x, z, time: def.time, items: [], critters: [], props: null, lastShown: -1 };
    for (const [type, dx, dz] of def.pieces) {
      const item = this.hooks.spawnItem(type, x + dx, z + dz, event);
      if (item) {
        item.mesh.rotation.z = type === 'dumpster' ? 0 : (Math.random() - 0.5) * 1.4; // tipped-over look
        event.items.push(item);
      }
    }
    if (kind === 'raccoon') {
      for (let i = 0; i < 3; i++) {
        const r = makeRaccoon();
        r.userData.phase = (i / 3) * Math.PI * 2;
        group.add(r);
        event.critters.push(r);
      }
    } else {
      event.props = makePartyProps(def.color);
      group.add(event.props);
    }
    this.active = event;
    this.hooks.flash(kind === 'raccoon' ? '🦝 Raccoons raided the trash! Follow the purple beacon!' : '🎉 Block party overflow! Follow the pink beacon!', 2.8);
  }

  collected(item) {
    const ev = this.active;
    if (!ev || item.event !== ev) return;
    ev.items = ev.items.filter(i => i !== item);
    if (ev.items.length === 0) {
      this.hooks.reward(ev);
      this.clear(true);
    }
  }

  clear(success) {
    const ev = this.active;
    if (!ev) return;
    if (!success) for (const item of ev.items) this.hooks.removeItem(item);
    this.scene.remove(ev.group);
    ev.group.traverse(o => {
      if (o.isMesh || o.isSprite) {
        o.geometry?.dispose?.();
        o.material?.map?.dispose?.();
      }
    });
    this.active = null;
    this.cooldown = (success ? 30 : 24) / this.frequency + Math.random() * 12;
  }

  // Returns a HUD string for the event chip, or ''.
  hudText(truck, heading) {
    const ev = this.active;
    if (!ev) return '';
    const dx = ev.x - truck.x;
    const dz = ev.z - truck.z;
    const dist = Math.round(Math.hypot(dx, dz));
    let rel = Math.atan2(dx, dz) - heading;
    rel = Math.atan2(Math.sin(rel), Math.cos(rel));
    const arrows = ['⬆', '↖', '⬅', '↙', '⬇', '↘', '➡', '↗'];
    const arrow = arrows[((Math.round(rel / (Math.PI / 4)) % 8) + 8) % 8];
    return `<span style="color:${ev.def.css}">${ev.def.label} ${Math.ceil(ev.time)}s · ${arrow} ${dist}m · ${ev.items.length} left</span>`;
  }

  update(dt, time, running) {
    if (!running) return;
    const ev = this.active;
    if (!ev) {
      this.cooldown -= dt;
      if (this.cooldown <= 0) this.start();
      return;
    }
    ev.time -= dt;
    const secs = Math.max(0, Math.ceil(ev.time));
    if (secs !== ev.lastShown) {
      ev.lastShown = secs;
      drawLabel(ev.label, ev.kind === 'raccoon' ? '🦝' : '🎉', secs, ev.items.length, ev.def.css);
      if (secs === 10) this.hooks.flash(`${ev.def.label}: 10 seconds left!`, 1.5);
    }
    const pulse = 0.5 + Math.sin(time * 0.008) * 0.5;
    ev.beam.material.opacity = 0.2 + pulse * 0.25 + (secs <= 8 ? 0.2 : 0);
    ev.ring.scale.setScalar(1 + pulse * 0.12);
    ev.sign.position.y = 7.5 + Math.sin(time * 0.004) * 0.3;

    const truck = this.hooks.truckPos();
    const near = Math.hypot(truck.x - ev.x, truck.z - ev.z) < 14;
    for (const r of ev.critters) {
      r.userData.phase += dt * (near ? 3.2 : 1.6);
      const radius = near ? 6 + Math.sin(r.userData.phase * 0.5) * 1.5 : 3.2;
      const a = r.userData.phase;
      r.position.set(Math.cos(a) * radius, Math.abs(Math.sin(a * 6)) * 0.12, Math.sin(a) * radius);
      r.rotation.y = -a; // face along the direction of travel
      r.userData.tail.rotation.y = Math.sin(time * 0.02) * 0.4;
    }
    if (ev.props) {
      ev.props.userData.balloons.forEach((b, i) => {
        b.position.y = 3 + (i % 2) * 0.4 + Math.sin(time * 0.003 + i) * 0.15;
      });
    }
    if (ev.time <= 0) {
      this.hooks.missed?.(ev);
      this.hooks.flash(ev.kind === 'raccoon' ? '🦝 The raccoons made off with it!' : '🎉 The party crowd went home. Missed it!', 2);
      this.clear(false);
    }
  }
}
