import * as THREE from './_remote/0d0e081c7ee3d520/three@0.184.0.js';
import { GLTFLoader } from './_remote/3dd32535ca8fbea1/GLTFLoader.js';
import { buildTown, textTexture, clearOfRoad } from './town.js';
import { WorldDecor } from './worlds.js';
import { Traffic, makePerson } from './traffic.js';
import { createTruck } from './truck.js';
import { RoadsideEvents } from './events.js';
import { Weather, WEATHER } from './weather.js';
import { buildReport } from './report.js';

let SHIFT_TIME = 240;
let CAPACITY = 20;
let TOP_SPEED = 16;
let PAY_PER_UNIT = 12;

// ---------- Campaign: cities, story and the Earl's Hauling empire ----------
const CITIES = [
  { name: 'Trashville', chapter: 'Chapter 1 · The Rookie', quota: 450, time: 120, rate: 12, sky: 0x9cc8e8, grass: 0xffffff, hemi: 1.6, sun: 0xfff0d0, sunI: 2,
    story: "6 AM in Trashville. Earl is just a guy with one rusty truck and a dream: <b>Earl's Hauling Co.</b> Make the quota and the town council will hand you a real contract." },
  { name: 'Riverbend', chapter: 'Chapter 2 · Across the River', quota: 700, time: 120, rate: 14, sky: 0xf7c49a, grass: 0xd8f0c8, hemi: 1.5, sun: 0xffc890, sunI: 2.1,
    story: "Word travels fast. Riverbend's old hauler went bust and the mayor wants Earl at sunrise. Bigger town, bigger mess, better pay." },
  { name: 'Dusty Gulch', chapter: 'Chapter 3 · Desert Run', quota: 950, time: 120, rate: 16, sky: 0xf2d7a0, grass: 0xf0d090, hemi: 1.7, sun: 0xffe2a8, sunI: 2.4,
    story: "Out west, Dusty Gulch hasn't seen a garbage truck in months. The tumbleweeds are winning. The pay is good if Earl can keep up in the heat." },
  { name: 'Frostburg', chapter: 'Chapter 4 · Winter Contract', quota: 1200, time: 120, rate: 18, sky: 0xd6e4f0, grass: 0xf4f8ff, hemi: 1.9, sun: 0xeaf2ff, sunI: 1.6,
    story: "Snow on the ground, holiday wrapping in every bin. Frostburg is a premium contract. A crew this size has never pulled it off." },
  { name: 'Neon City', chapter: 'Chapter 5 · The Big League', quota: 1500, time: 120, rate: 20, sky: 0x1a1838, grass: 0x8a86c0, hemi: 0.9, sun: 0xb0a0ff, sunI: 1.1,
    story: "The night shift in Neon City. Win this contract and Earl's Hauling Co. becomes the biggest garbage empire in the state." },
  { name: 'Lunar Colony', world: 'moon', chapter: 'Chapter 6 · One Small Haul', quota: 1800, time: 120, rate: 22, sky: 0x04050c, grass: 0x8c8c94, hemi: 1.1, sun: 0xffffff, sunI: 2.6,
    story: "A rocket lands outside Earl's depot. NASA has a problem: the Moon is buried in space junk. Earl's truck gets bolted into a cargo bay. <b>Next stop: the Lunar Colony.</b> Mind the low gravity." },
  { name: 'Candy Kingdom', world: 'candy', chapter: 'Chapter 7 · A Sticky Situation', quota: 2100, time: 120, rate: 24, sky: 0xffc6ea, grass: 0xffc8ec, hemi: 1.7, sun: 0xfff0ff, sunI: 2.1,
    story: "A wormhole on the Moon dumps Earl somewhere very strange. Gumdrop hills, lollipop trees, and wrappers <i>everywhere</i>. The Candy Queen will pay a fortune in gold coins if Earl cleans up her kingdom." },
  { name: 'Atlantis Deep', world: 'sea', chapter: 'Chapter 8 · The Final Dump', quota: 2400, time: 120, rate: 26, sky: 0x0a4a6c, grass: 0x6ac0b8, hemi: 1.3, sun: 0x9fe8ff, sunI: 1.5,
    story: "The last frontier: a sunken city at the bottom of the sea, choking on centuries of trash. The mermaid council is ready to sign the <b>biggest contract in the universe</b>. Fit the truck with a snorkel. This is Earl's final shift." },
];
// Weather per city (see weather.js): later cities bring readable driving hazards.
const CITY_WEATHER = ['clear', 'rain', 'dust', 'snow', 'storm', 'moon', 'syrup', 'current'];
const DIFFICULTIES = {
  easy: { label: '🙂 Easy', desc: 'Lower quotas, +30s, gentle weather', quota: 0.75, time: 30, weather: 0.6, events: 1.25, fine: 25 },
  normal: { label: '😎 Normal', desc: 'The intended challenge', quota: 1, time: 0, weather: 1, events: 1, fine: 40 },
  hard: { label: '🔥 Hard', desc: 'Higher quotas, −20s, harsh weather', quota: 1.3, time: -20, weather: 1.35, events: 0.85, fine: 60 },
};
const diff = () => DIFFICULTIES[empire.difficulty] || DIFFICULTIES.normal;
const quotaFor = i => Math.round((CITIES[i].quota * diff().quota) / 10) * 10;
const UPGRADES = [
  { id: 'hopper', name: '🗑 Bigger Hopper', desc: '+5 truck capacity', base: 250, max: 4 },
  { id: 'engine', name: '⚙️ Turbo Engine', desc: '+top speed & acceleration', base: 300, max: 3 },
  { id: 'crew', name: '👷 Hire a Crew Truck', desc: '+$60 passive per shift each', base: 400, max: 5 },
  { id: 'contract', name: '📜 Better Contracts', desc: '+$2 per dumped unit', base: 350, max: 3 },
];
const EMPIRE_KEY = 'trashRouteEmpire';
const empire = Object.assign({ city: 0, bank: 0, unlocked: 0, beaten: false, up: {} }, JSON.parse(localStorage.getItem(EMPIRE_KEY) || '{}'));
empire.difficulty ??= 'normal';
// Old saves that beat Neon City (then the last city) unlock the new worlds.
if (empire.beaten && !empire.grand && empire.unlocked < 5) { empire.unlocked = 5; empire.beaten = false; }
empire.up = Object.assign({ hopper: 0, engine: 0, crew: 0, contract: 0 }, empire.up);
const saveEmpire = () => localStorage.setItem(EMPIRE_KEY, JSON.stringify(empire));
const upgradeCost = u => Math.round(u.base * Math.pow(1.6, empire.up[u.id]));
const LANDFILL = new THREE.Vector3(0, 0, -95);
const TRASH_TYPES = {
  bag: { url: 'assets/models/trash-bag.glb', size: 0.9, load: 1, pay: 10, color: 0x222222 },
  can: { url: 'assets/models/garbage-can.glb', size: 1.3, load: 2, pay: 20, color: 0x777777 },
  dumpster: { url: 'assets/models/dumpster.glb', size: 2.2, load: 6, pay: 60, color: 0x2d5a2d },
};

// ---------- Renderer / scene ----------
const container = document.getElementById('game-container');
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
container.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x9cc8e8);
scene.fog = new THREE.Fog(0x9cc8e8, 60, 160);
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 400);

const hemiLight = new THREE.HemisphereLight(0xffffff, 0x557744, 1.6);
scene.add(hemiLight);
const sun = new THREE.DirectionalLight(0xfff0d0, 2);
sun.position.set(30, 50, 20);
sun.castShadow = true;
sun.shadow.camera.left = sun.shadow.camera.bottom = -45;
sun.shadow.camera.right = sun.shadow.camera.top = 45;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.bias = -0.0005;
scene.add(sun, sun.target);

window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});

// ---------- World ----------
function createGrassTexture() {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#729658';
  ctx.fillRect(0, 0, size, size);

  let seed = 48271;
  const random = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  const colors = ['#63894d', '#7e9f5e', '#89a967', '#587f47', '#789a58'];
  for (let i = 0; i < 2600; i++) {
    const x = random() * size;
    const y = random() * size;
    const length = 1 + random() * 4;
    const lean = (random() - 0.5) * 2.5;
    ctx.strokeStyle = colors[Math.floor(random() * colors.length)];
    ctx.globalAlpha = 0.38 + random() * 0.3;
    ctx.lineWidth = 0.65 + random() * 0.6;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + length, y + lean);
    ctx.stroke();
    // Mirror edge-crossing strokes so the tile wraps without obvious seams.
    if (x + length >= size) {
      ctx.beginPath();
      ctx.moveTo(x - size, y);
      ctx.lineTo(x + length - size, y + lean);
      ctx.stroke();
    }
    if (y + lean >= size) {
      ctx.beginPath();
      ctx.moveTo(x, y - size);
      ctx.lineTo(x + length, y + lean - size);
      ctx.stroke();
    }
  }
  ctx.globalAlpha = 1;
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(36, 36);
  return texture;
}
const grass = createGrassTexture();
const ground = new THREE.Mesh(new THREE.PlaneGeometry(300, 300), new THREE.MeshLambertMaterial({ map: grass }));
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

const roadMat = new THREE.MeshLambertMaterial({ color: 0x444448 });
const ROAD_LINES = [-60, -20, 20, 60];
const sidewalkMat = new THREE.MeshLambertMaterial({ color: 0xc4c0b6 });
function addRoad(x, z, w, d) {
  const [sw, sd] = w < d ? [w + 4, d] : [w, d + 4];
  const sidewalk = new THREE.Mesh(new THREE.PlaneGeometry(sw, sd), sidewalkMat);
  sidewalk.rotation.x = -Math.PI / 2;
  sidewalk.position.set(x, 0.015, z);
  sidewalk.receiveShadow = true;
  scene.add(sidewalk);
  const road = new THREE.Mesh(new THREE.PlaneGeometry(w, d), roadMat);
  road.rotation.x = -Math.PI / 2;
  road.position.set(x, 0.02, z);
  road.receiveShadow = true;
  scene.add(road);
}
for (const line of ROAD_LINES) {
  addRoad(line, -10, 9, 150);
  addRoad(0, line, 130, 9);
}
addRoad(0, -78, 9, 30);

// Dashed center lines, street lamps and drifting clouds.
const dashSpots = [];
for (const line of ROAD_LINES) {
  for (let t = -82; t <= 62; t += 6) if (!ROAD_LINES.some(m => Math.abs(t - m) < 6)) dashSpots.push([line, t, 0]);
  for (let t = -62; t <= 62; t += 6) if (!ROAD_LINES.some(m => Math.abs(t - m) < 6)) dashSpots.push([t, line, 1]);
}
const dashes = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.3, 2.6), new THREE.MeshBasicMaterial({ color: 0xf2d24b }), dashSpots.length);
const dummy = new THREE.Object3D();
dashSpots.forEach(([x, z, horizontal], i) => {
  dummy.position.set(x, 0.03, z);
  dummy.rotation.set(-Math.PI / 2, 0, horizontal ? Math.PI / 2 : 0);
  dummy.updateMatrix();
  dashes.setMatrixAt(i, dummy.matrix);
});
scene.add(dashes);

const lampPostMat = new THREE.MeshLambertMaterial({ color: 0x3a4048 });
const lampBulbMat = new THREE.MeshLambertMaterial({ color: 0xfff2b0, emissive: 0xffd770, emissiveIntensity: 0.8 });
const lampPoles = [];
for (const lx of ROAD_LINES) {
  for (const lz of ROAD_LINES) {
    const lamp = new THREE.Group();
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 6, 8), lampPostMat);
    post.position.y = 3;
    const arm = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.12, 0.12), lampPostMat);
    arm.position.set(-0.8, 5.9, 0);
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.3, 10, 8), lampBulbMat);
    bulb.position.set(-1.5, 5.7, 0);
    post.castShadow = true;
    lamp.add(post, arm, bulb);
    lamp.position.set(lx + 5.2, 0, lz - 5.2);
    scene.add(lamp);
    lampPoles.push({ x: lx + 5.2, z: lz - 5.2 });
  }
}

const clouds = [];
const cloudMat = new THREE.MeshLambertMaterial({ color: 0xffffff, emissive: 0x666666 });
for (let i = 0; i < 12; i++) {
  const cloud = new THREE.Group();
  for (let p = 0; p < 4; p++) {
    const puff = new THREE.Mesh(new THREE.SphereGeometry(3 + Math.random() * 2.5, 9, 7), cloudMat);
    puff.position.set(p * 3.5 - 5, Math.random() * 1.5, Math.random() * 3);
    cloud.add(puff);
  }
  cloud.position.set(-150 + Math.random() * 300, 42 + Math.random() * 14, -150 + Math.random() * 300);
  scene.add(cloud);
  clouds.push(cloud);
}

// Each district has a distinct ground tint, street sign, and predictable pickup pattern.
const DISTRICTS = [
  {
    id: 'homes', name: 'West Homes', center: new THREE.Vector2(-40, 40), color: 0x82c879, cssColor: '#a7f18f',
    focus: 'Bags & cans', advice: 'Quiet curbside stops along the west and south streets.', sign: 'WEST HOMES', subtitle: 'CURBSIDE BAGS + CANS', signPosition: [-23, 23], signRotation: Math.PI / 2,
    stops: [
      ['bag', -26, 28], ['can', -26, 34], ['bag', -26, 40], ['can', -26, 46], ['bag', -26, 52],
      ['bag', -34, 26], ['can', -42, 26], ['bag', -50, 26], ['can', -58, 30], ['bag', -58, 40], ['bag', -58, 50], ['can', -50, 58],
    ],
  },
  {
    id: 'shops', name: 'Market Row', center: new THREE.Vector2(40, -40), color: 0xe4ae55, cssColor: '#ffd276',
    focus: 'Dumpster clusters', advice: 'Several heavy dumpsters wait in the shop service alleys.', sign: 'MARKET ROW', subtitle: 'CLUSTERED DUMPSTERS', signPosition: [23, -40], signRotation: -Math.PI / 2,
    stops: [
      ['dumpster', 28, -55], ['dumpster', 32, -51], ['can', 28, -47], ['dumpster', 32, -43],
      ['dumpster', 28, -37], ['can', 32, -33], ['dumpster', 28, -29], ['dumpster', 32, -25],
      ['bag', 36, -55], ['bag', 36, -27],
    ],
  },
  {
    id: 'civic', name: 'Civic Green', center: new THREE.Vector2(0, -40), color: 0x59b9b1, cssColor: '#82e5dc',
    focus: 'Mixed waste', advice: 'The park paths have a dense mix of bags, cans and bins.', sign: 'CIVIC GREEN', subtitle: 'PARK + TOWN HALL', signPosition: [0, -23], signRotation: 0,
    stops: [
      ['can', -14, -55], ['bag', -9, -55], ['can', -4, -55], ['bag', 4, -55], ['dumpster', 9, -55], ['can', 14, -55],
      ['bag', -14, -49], ['can', -14, -43], ['dumpster', 14, -47], ['bag', 14, -41],
      ['can', -14, -35], ['bag', 14, -35], ['can', -9, -27], ['bag', 9, -27],
    ],
  },
  {
    id: 'maple', name: 'Maple Lane', center: new THREE.Vector2(20, 40), color: 0xe58fb5, cssColor: '#ffa8cf',
    focus: 'Big curbside run', advice: 'Long rows of cans and bags in front of colorful homes.', sign: 'MAPLE LANE', subtitle: 'FAMILY HOMES', signPosition: [21, 28], signRotation: Math.PI,
    patches: [[0, 40], [40, 40]],
    stops: [
      ['can', -9, 25.5], ['bag', -5, 25.5], ['can', 9, 25.5], ['bag', 13, 25.5], ['can', 31, 25.5], ['bag', 35, 25.5], ['can', 49, 25.5],
      ['bag', -9, 54.5], ['can', 9, 54.5], ['bag', 31, 54.5], ['can', 49, 54.5], ['bag', 45, 54.5],
    ],
  },
];

for (const district of DISTRICTS) {
  for (const [px, pz] of district.patches || [[district.center.x, district.center.y]]) {
    const patch = new THREE.Mesh(
      new THREE.PlaneGeometry(31, 31),
      new THREE.MeshBasicMaterial({ color: district.color, transparent: true, opacity: 0.22, depthWrite: false }),
    );
    patch.rotation.x = -Math.PI / 2;
    patch.position.set(px, 0.012, pz);
    scene.add(patch);
  }
}

const landfillGround = new THREE.Mesh(new THREE.CircleGeometry(16, 32), new THREE.MeshLambertMaterial({ color: 0x7a5a38 }));
landfillGround.rotation.x = -Math.PI / 2;
landfillGround.position.set(LANDFILL.x, 0.04, LANDFILL.z);
scene.add(landfillGround);
const moundMat = new THREE.MeshLambertMaterial({ color: 0x6b5236, flatShading: true });
for (let i = 0; i < 6; i++) {
  const mound = new THREE.Mesh(new THREE.ConeGeometry(4 + Math.random() * 4, 3 + Math.random() * 4, 7), moundMat);
  const angle = (i / 6) * Math.PI + Math.PI;
  mound.position.set(LANDFILL.x + Math.cos(angle) * 20, 1.5, LANDFILL.z + Math.sin(angle) * 14 - 4);
  scene.add(mound);
}
const ringMat = new THREE.MeshBasicMaterial({ color: 0xffcc33, transparent: true, opacity: 0.5 });
const landfillRing = new THREE.Mesh(new THREE.RingGeometry(7, 8, 32), ringMat);
landfillRing.rotation.x = -Math.PI / 2;
landfillRing.position.set(LANDFILL.x, 0.08, LANDFILL.z);
scene.add(landfillRing);

// Every house, landmark and park comes from town.js; `houses` holds all collision boxes.
const houses = [];
buildTown(scene, houses);

function addShop(x, z, accent, name, wall) {
  const shop = new THREE.Group();
  const signTexture = textTexture(name, '#' + accent.toString(16).padStart(6, '0'), '#ffffff');
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(6.5, 1.4), new THREE.MeshBasicMaterial({ map: signTexture }));
  sign.position.set(-5.8, 5.4, 0);
  sign.rotation.y = -Math.PI / 2;
  const glass = new THREE.Mesh(new THREE.BoxGeometry(0.15, 2, 6), new THREE.MeshLambertMaterial({ color: 0x9ad4f0, emissive: 0x24404a }));
  glass.position.set(-5.55, 1.6, 0);
  shop.add(sign, glass);
  const body = new THREE.Mesh(new THREE.BoxGeometry(11, 6, 9), new THREE.MeshLambertMaterial({ color: wall }));
  body.position.y = 3;
  body.castShadow = true;
  const roof = new THREE.Mesh(new THREE.BoxGeometry(11.7, 0.6, 9.7), new THREE.MeshLambertMaterial({ color: 0x575558 }));
  roof.position.y = 6.3;
  const awning = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.65, 7.4), new THREE.MeshLambertMaterial({ color: accent }));
  awning.position.set(-5.6, 4.4, 0);
  const fascia = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.8, 7), new THREE.MeshLambertMaterial({ color: accent }));
  fascia.position.set(-5.62, 5.45, 0);
  shop.add(body, roof, awning, fascia);
  shop.position.set(x, 0, z);
  scene.add(shop);
  houses.push({ x, z, r: 6.4 });
}
addShop(47, -49, 0xd57a42, 'PIZZA PALACE', 0xf3e8d2);
addShop(47, -31, 0x4b9b78, 'GREEN GROCER', 0xe3d6c0);

function addTree(x, z) {
  [x, z] = clearOfRoad(x, z);
  const tree = new THREE.Group();
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.5, 2.7, 7), new THREE.MeshLambertMaterial({ color: 0x76502f }));
  trunk.position.y = 1.35;
  const crown = new THREE.Mesh(new THREE.SphereGeometry(2.1, 8, 7), new THREE.MeshLambertMaterial({ color: 0x39824c, flatShading: true }));
  crown.position.y = 3.4;
  crown.castShadow = true;
  tree.add(trunk, crown);
  tree.position.set(x, 0, z);
  scene.add(tree);
  houses.push({ x, z, r: 2.3 });
}

// A fountain plaza, town hall, trees, and benches make Civic Green easy to recognize.
const townHall = new THREE.Group();
const hallBody = new THREE.Mesh(new THREE.BoxGeometry(9, 5, 8), new THREE.MeshLambertMaterial({ color: 0xe5dfc9 }));
hallBody.position.y = 2.5;
const hallRoof = new THREE.Mesh(new THREE.ConeGeometry(6.8, 3, 4), new THREE.MeshLambertMaterial({ color: 0x678a8a }));
hallRoof.position.y = 6.5;
hallRoof.rotation.y = Math.PI / 4;
const hallColumns = new THREE.Mesh(new THREE.BoxGeometry(9.4, 0.5, 0.45), new THREE.MeshLambertMaterial({ color: 0xf6f1dc }));
hallColumns.position.set(0, 1.3, 4.15);
townHall.add(hallBody, hallRoof, hallColumns);
townHall.position.set(-8, 0, -40);
scene.add(townHall);
houses.push({ x: -8, z: -40, r: 5.2 });

const fountainBase = new THREE.Mesh(new THREE.CylinderGeometry(2.3, 2.7, 0.65, 12), new THREE.MeshLambertMaterial({ color: 0xddd7c6 }));
fountainBase.position.set(5, 0.33, -40);
const fountainWater = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 2, 0.18, 16), new THREE.MeshLambertMaterial({ color: 0x62c7dc }));
fountainWater.position.set(5, 0.72, -40);
const fountainJet = new THREE.Mesh(new THREE.SphereGeometry(0.65, 10, 8), new THREE.MeshLambertMaterial({ color: 0x8de4ed }));
fountainJet.position.set(5, 1.25, -40);
scene.add(fountainBase, fountainWater, fountainJet);
houses.push({ x: 5, z: -40, r: 2.8 });
for (const [x, z] of [[-14, -51], [-14, -29], [14, -51], [14, -29]]) addTree(x, z);

function addBench(x, z, rotation = 0) {
  const bench = new THREE.Group();
  const wood = new THREE.MeshLambertMaterial({ color: 0x9a6840 });
  const metal = new THREE.MeshLambertMaterial({ color: 0x46565a });
  const seat = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.24, 0.75), wood);
  seat.position.y = 0.9;
  const back = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.95, 0.2), wood);
  back.position.set(0, 1.35, -0.28);
  for (const side of [-1, 1]) {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.85, 0.55), metal);
    leg.position.set(side * 1.15, 0.42, 0);
    bench.add(leg);
  }
  bench.add(seat, back);
  bench.position.set(x, 0, z);
  bench.rotation.y = rotation;
  scene.add(bench);
  houses.push({ x, z, r: 1.8 });
}
addBench(-1, -33);
addBench(9, -33);

function makeDistrictSign(district) {
  const [x, z] = district.signPosition;
  const sign = new THREE.Group();
  const postMat = new THREE.MeshLambertMaterial({ color: 0x60462e });
  for (const side of [-1, 1]) {
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.22, 3.1, 0.22), postMat);
    post.position.set(side * 2.45, 1.55, 0);
    sign.add(post);
  }
  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 220;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = district.cssColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#173124';
  ctx.font = '800 56px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(district.sign, 320, 94);
  ctx.font = '600 27px sans-serif';
  ctx.fillText(district.subtitle, 320, 158);
  const signTexture = new THREE.CanvasTexture(canvas);
  signTexture.colorSpace = THREE.SRGBColorSpace;
  const board = new THREE.Mesh(new THREE.BoxGeometry(5.8, 2.1, 0.28), new THREE.MeshLambertMaterial({ color: district.color }));
  board.position.y = 3.05;
  const face = new THREE.Mesh(new THREE.PlaneGeometry(5.55, 1.88), new THREE.MeshBasicMaterial({ map: signTexture }));
  face.position.set(0, 3.05, 0.15);
  sign.add(board, face);
  sign.position.set(x, 0, z);
  sign.rotation.y = district.signRotation || 0;
  scene.add(sign);
}
for (const district of DISTRICTS) makeDistrictSign(district);

// ---------- Truck ----------
const loader = new GLTFLoader();
const truck = new THREE.Group();
truck.position.set(-40, 0, 20);
scene.add(truck);
const truckState = { speed: 0, heading: -Math.PI / 2, load: 0, money: 0 };
truck.rotation.y = truckState.heading;

function fitTo(object, size) {
  const box = new THREE.Box3().setFromObject(object);
  const dims = box.getSize(new THREE.Vector3());
  const scale = size / Math.max(dims.x, dims.y, dims.z);
  object.scale.setScalar(scale);
  box.setFromObject(object);
  object.position.y -= box.min.y;
  object.traverse(child => {
    if (child.isMesh) {
      child.castShadow = true;
    }
  });
  return object;
}

// Procedural, fully detailed truck (truck.js); paint color is chosen in the depot.
const TRUCK_COLORS = [
  { name: 'Classic Green', hex: 0x2fae4a }, { name: 'Safety Orange', hex: 0xf07a1a }, { name: 'City Blue', hex: 0x2a6fd6 },
  { name: 'Fire Red', hex: 0xd8333a }, { name: 'School Yellow', hex: 0xf2c230 }, { name: 'Royal Purple', hex: 0x7d4bd1 },
  { name: 'Hot Pink', hex: 0xff5fa8 }, { name: 'Clean White', hex: 0xe6e6e0 },
];
const truckModel = createTruck(empire.color ?? TRUCK_COLORS[0].hex);
truck.add(truckModel.group);

// ---------- Trash ----------
const trashItems = [];
const templates = {};
async function loadTemplates() {
  for (const [type, info] of Object.entries(TRASH_TYPES)) {
    try {
      const gltf = await loader.loadAsync(info.url);
      templates[type] = fitTo(gltf.scene, info.size);
    } catch {
      const box = new THREE.Mesh(new THREE.BoxGeometry(info.size, info.size, info.size), new THREE.MeshLambertMaterial({ color: info.color }));
      box.position.y = info.size / 2;
      const group = new THREE.Group();
      group.add(box);
      templates[type] = group;
    }
  }
}

function spawnTrash(district, stopIndex = Math.floor(Math.random() * district.stops.length)) {
  const [type, x, z] = district.stops[stopIndex];
  const mesh = templates[type].clone();
  mesh.position.set(x, templates[type].position.y, z);
  mesh.rotation.y = Math.random() * Math.PI * 2;
  scene.add(mesh);
  trashItems.push({ type, mesh, lift: 0, district });
}

// ---------- Input ----------
// Multi-touch: every active finger is hit-tested against all pads each time it
// moves, so holding gas never blocks steering (and sliding between pads works).
const input = { left: false, right: false, gas: false, brake: false };
const PAD_IDS = ['left', 'right', 'gas', 'brake'];
const pads = PAD_IDS.map(id => ({ id, el: document.getElementById(id) }));
const pointers = new Map();
const keyState = { left: false, right: false, gas: false, brake: false };

function syncInput() {
  const rects = pads.map(p => ({ id: p.id, r: p.el.getBoundingClientRect() }));
  const touched = { left: false, right: false, gas: false, brake: false };
  for (const { x, y } of pointers.values()) {
    for (const { id, r } of rects) {
      const pad = 6; // small forgiving margin without overlapping neighbor pads
      if (x >= r.left - pad && x <= r.right + pad && y >= r.top - pad && y <= r.bottom + pad) touched[id] = true;
    }
  }
  for (const p of pads) {
    input[p.id] = touched[p.id] || keyState[p.id];
    p.el.classList.toggle('on', touched[p.id]);
  }
}
// Touch: rebuild the finger list from e.touches (the browser's authoritative
// list of fingers on screen) on every touch event, so a lost touchend can never
// leave a pad "stuck" on and make the truck pull to one side.
let usingTouch = false;
function syncTouches(e) {
  usingTouch = true;
  pointers.clear();
  for (const t of e.touches) pointers.set(`t${t.identifier}`, { x: t.clientX, y: t.clientY });
  syncInput();
}
for (const type of ['touchstart', 'touchmove', 'touchend', 'touchcancel']) {
  window.addEventListener(type, e => {
    syncTouches(e);
    if (type !== 'touchend' && e.target.closest?.('.pad')) e.preventDefault();
  }, { passive: false });
}
for (const p of pads) {
  p.el.addEventListener('pointerdown', e => {
    e.preventDefault();
    if (e.pointerType === 'touch' || usingTouch) return; // touch handled above
    try { p.el.releasePointerCapture(e.pointerId); } catch { /* not captured */ }
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    syncInput();
  });
}
window.addEventListener('pointermove', e => {
  if (e.pointerType === 'touch' || !pointers.has(e.pointerId)) return;
  pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
  syncInput();
});
for (const type of ['pointerup', 'pointercancel']) {
  window.addEventListener(type, e => {
    if (pointers.delete(e.pointerId)) syncInput();
  });
}
window.addEventListener('blur', () => {
  pointers.clear();
  for (const id of PAD_IDS) keyState[id] = false;
  syncInput();
});
const keyMap = { ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right', ArrowUp: 'gas', KeyW: 'gas', ArrowDown: 'brake', KeyS: 'brake' };
window.addEventListener('keydown', e => { if (keyMap[e.code]) { keyState[keyMap[e.code]] = true; syncInput(); } });
window.addEventListener('keyup', e => { if (keyMap[e.code]) { keyState[keyMap[e.code]] = false; syncInput(); } });

// ---------- Audio ----------
const music = new Audio('assets/audio/route-music.mp3');
music.loop = true;
music.volume = 0.35;
const pickupSound = new Audio('assets/audio/pickup-clunk.mp3');
const dumpSound = new Audio('assets/audio/dump-rumble.mp3');
let muted = false;
function playSound(sound) {
  if (muted) return;
  sound.currentTime = 0;
  sound.play().catch(() => {});
}
document.getElementById('mute').onclick = (e) => {
  muted = !muted;
  e.target.textContent = muted ? '🔇' : '🔊';
  if (muted) music.pause(); else if (running) music.play().catch(() => {});
};

// ---------- UI / game state ----------
const statsEl = document.getElementById('stats');
const fillEl = document.getElementById('fill');
const msgEl = document.getElementById('msg');
const districtNameEl = document.getElementById('district-name');
const districtTipEl = document.getElementById('district-tip');
const overlay = document.getElementById('overlay');
const goalsEl = document.getElementById('goals');
const districtPanel = document.getElementById('district-panel');
const goalsBtn = document.getElementById('goals-btn');
const zoneBtn = document.getElementById('zone-btn');
// Goals and zone guide stay collapsed until tapped, keeping the road visible.
goalsBtn.addEventListener('pointerdown', e => {
  e.preventDefault();
  goalsEl.classList.toggle('open');
  districtPanel.classList.remove('open');
});
zoneBtn.addEventListener('pointerdown', e => {
  e.preventDefault();
  districtPanel.classList.toggle('open');
  goalsEl.classList.remove('open');
});
let running = false;
let timeLeft = SHIFT_TIME;
let msgTimer = 0;
let dumpTimer = 0;
let best = Number(localStorage.getItem('trashRouteBest') || 0);

// ---------- Daily goals & challenges ----------
const freshStats = () => ({ loads: 0, dumpsters: 0, civic: 0, combo: 0, comboTimer: 0, bestCombo: 0, rush: 0, crashes: 0, tickets: 0,
  pickups: 0, units: 0, events: 0, eventsMissed: 0, skids: 0, smooth: 0, fullHits: 0 });
const stats = freshStats();
// Money ledger for the end-of-shift report (every source and deduction).
const freshLedger = () => ({ dumps: 0, combo: 0, rush: 0, events: 0, smooth: 0, goals: 0, fines: 0, crashes: 0 });
const ledger = freshLedger();
const GOALS = [
  { text: 'Earn $700', done: () => truckState.money >= 700, progress: () => `$${truckState.money}` },
  { text: 'Dump 3 loads', done: () => stats.loads >= 3, progress: () => `${stats.loads}/3` },
  { text: 'Lift 5 dumpsters', done: () => stats.dumpsters >= 5, progress: () => `${stats.dumpsters}/5` },
  { text: 'Clear 8 Civic Green stops', done: () => stats.civic >= 8, progress: () => `${stats.civic}/8` },
  { text: 'Chain a x5 combo', done: () => stats.bestCombo >= 5, progress: () => `best x${stats.bestCombo}` },
  { text: 'Finish 2 ⭐ rush pickups', done: () => stats.rush >= 2, progress: () => `${stats.rush}/2` },
];
let goalDone = GOALS.map(() => false);
let lastGoalsHtml = '';

const rush = { item: null, time: 0, cooldown: 8 };
const rushMarker = new THREE.Group();
const beacon = new THREE.Mesh(
  new THREE.CylinderGeometry(0.7, 0.7, 16, 12, 1, true),
  new THREE.MeshBasicMaterial({ color: 0xffd23f, transparent: true, opacity: 0.35, depthWrite: false, side: THREE.DoubleSide }),
);
beacon.position.y = 8;
const rushStar = new THREE.Mesh(new THREE.OctahedronGeometry(0.9), new THREE.MeshLambertMaterial({ color: 0xffd23f, emissive: 0xaa7a00 }));
rushMarker.add(beacon, rushStar);
rushMarker.visible = false;
scene.add(rushMarker);

function clearRush() {
  rush.item = null;
  rush.cooldown = 12;
  rushMarker.visible = false;
}

function updateRush(dt, time) {
  if (rush.item) {
    rush.time -= dt;
    const rushPos = rush.item.mesh.getWorldPosition(new THREE.Vector3());
    rushMarker.position.set(rushPos.x, 0, rushPos.z);
    rushStar.position.y = 4 + Math.sin(time * 0.004) * 0.5;
    rushStar.rotation.y += dt * 3;
    if (rush.time <= 0) {
      flash('⭐ Rush pickup missed!', 1.6);
      clearRush();
    }
    return;
  }
  rush.cooldown -= dt;
  if (rush.cooldown > 0) return;
  const candidates = trashItems.filter(item => item.lift === 0 && !item.carried && item.mesh.position.distanceTo(truck.position) > 25);
  if (!candidates.length) return;
  rush.item = candidates[Math.floor(Math.random() * candidates.length)];
  rush.time = 30;
  rushMarker.visible = true;
  flash(`⭐ Rush ${rush.item.type} in ${rush.item.district.name}! 30s`, 2.5);
}

function checkGoals() {
  GOALS.forEach((goal, i) => {
    if (!goalDone[i] && goal.done()) {
      goalDone[i] = true;
      truckState.money += 50;
      ledger.goals += 50;
      timeLeft += 10;
      flash(`🏆 Goal: ${goal.text}! +$50 +10s`, 2.4);
      playSound(pickupSound);
    }
  });
  const rows = GOALS.map((goal, i) => `<div class="${goalDone[i] ? 'done' : ''}">${goalDone[i] ? '✅' : '⬜'} ${goal.text} <span>${goalDone[i] ? '' : goal.progress()}</span></div>`);
  rows.push(`<div class="extra">🚗 Crashes: ${stats.crashes} ${stats.crashes <= 1 ? '(safe bonus on track)' : '(no safe bonus)'}</div>`);
  rows.push(`<div class="extra">🚓 Tickets: ${stats.tickets} · obey lights, stop signs, 40 mph</div>`);
  if (stats.comboTimer > 0 && stats.combo > 1) rows.push(`<div class="extra combo">🔥 Combo x${stats.combo}</div>`);
  if (rush.item) rows.push(`<div class="extra rush">⭐ Rush: ${rush.item.district.name} ${Math.ceil(rush.time)}s</div>`);
  const doneCount = goalDone.filter(Boolean).length;
  const chip = `🎯 ${doneCount}/${GOALS.length}${rush.item ? ` · ⭐${Math.ceil(rush.time)}s` : ''}${stats.comboTimer > 0 && stats.combo > 1 ? ` · 🔥x${stats.combo}` : ''}`;
  if (goalsBtn.textContent !== chip) goalsBtn.textContent = chip;
  const html = rows.join('');
  if (html !== lastGoalsHtml) {
    goalsEl.innerHTML = `<div class="eyebrow">TODAY'S GOALS</div>${html}`;
    lastGoalsHtml = html;
  }
}

const traffic = new Traffic(scene);
// Street lamps, traffic-light and stop-sign poles are solid.
const POLES = [...lampPoles, ...traffic.poles];
const POLE_R = 0.3;
const TRUCK_HALF_W = 1.25;
// Is the truck (sampled along its 7-unit length) touching a pole at x,z,heading?
function truckPoleHit(x, z, heading) {
  const fx = Math.sin(heading);
  const fz = Math.cos(heading);
  for (const p of POLES) {
    const dx = p.x - x;
    const dz = p.z - z;
    if (dx * dx + dz * dz > 30) continue;
    const along = THREE.MathUtils.clamp(dx * fx + dz * fz, -3.4, 3.7);
    const cx = x + fx * along;
    const cz = z + fz * along;
    if (Math.hypot(p.x - cx, p.z - cz) < TRUCK_HALF_W + POLE_R) return p;
  }
  return null;
}
// Shift start: a quiet block of West Homes street (no traffic loop runs on
// z=20 between x=-60 and x=-20), facing west into the neighborhood.
const START = { x: -40, z: 20, heading: -Math.PI / 2 };

// ---------- Weather & roadside events ----------
const BASE_FOG = [60, 160];
const weather = new Weather(scene);
const worldDecor = new WorldDecor(scene);
let handling = { grip: 1, steer: 1, brake: 1, accel: 1, pushX: 0, pushZ: 0 };

function nearestDistrict(x, z) {
  let best = DISTRICTS[0];
  let bestD = Infinity;
  for (const d of DISTRICTS) {
    const dist = Math.hypot(d.center.x - x, d.center.y - z);
    if (dist < bestD) { bestD = dist; best = d; }
  }
  return best;
}
const roadEvents = new RoadsideEvents(scene, {
  truckPos: () => (foot.active ? earl.position : truck.position),
  flash: (text, s) => flash(text, s),
  spawnItem(type, x, z, event) {
    if (!templates[type]) return null;
    const mesh = templates[type].clone();
    mesh.position.set(x, templates[type].position.y, z);
    mesh.rotation.y = Math.random() * Math.PI * 2;
    scene.add(mesh);
    const item = { type, mesh, lift: 0, district: nearestDistrict(x, z), event };
    trashItems.push(item);
    return item;
  },
  removeItem(item) {
    const i = trashItems.indexOf(item);
    if (i < 0 || item.lift > 0 || item.carried) return;
    scene.remove(item.mesh);
    trashItems.splice(i, 1);
    if (rush.item === item) clearRush();
  },
  reward(ev) {
    stats.events++;
    truckState.money += ev.def.reward;
    ledger.events += ev.def.reward;
    timeLeft += ev.def.timeBonus;
    flash(`${ev.kind === 'raccoon' ? '🦝 Raccoons foiled!' : '🎉 Party cleaned up!'} +$${ev.def.reward} +${ev.def.timeBonus}s`, 2.6);
    playSound(dumpSound);
  },
});
roadEvents.hooks.missed = () => { stats.eventsMissed++; };
const idleHooks = { flash() {}, reward() {}, skid() {} };
const weatherHooks = {
  flash: (text, s) => flash(text, s),
  reward(amount, why) {
    stats.smooth++;
    truckState.money += amount;
    ledger.smooth += amount;
    flash(`${why} +$${amount}`, 1.4);
  },
  skid(why) {
    stats.skids++;
    flash(`${why} Slow down!`, 1.6);
  },
};

// ---------- Traffic law: police ticket violations they witness ----------
const SPEED_LIMIT = 13.4; // 40 mph on the HUD
const POLICE_RANGE = 45;
const violation = { inside: null, approachMin: new Map(), speeding: 0, cooldown: 0 };

function ticket(reason) {
  if (violation.cooldown > 0 || !traffic.policeNear(truck.position, POLICE_RANGE)) return;
  violation.cooldown = 4;
  stats.tickets++;
  const fine = diff().fine;
  ledger.fines += Math.min(fine, truckState.money);
  truckState.money = Math.max(0, truckState.money - fine);
  flash(`🚓 Ticket! ${reason} −$${fine}`, 2.2);
}

function checkViolations(dt) {
  violation.cooldown = Math.max(0, violation.cooldown - dt);
  if (foot.active) {
    violation.inside = null;
    return;
  }
  const pos = truck.position;
  const spd = Math.abs(truckState.speed);
  let inside = null;
  for (const inter of traffic.intersections) {
    const dx = Math.abs(pos.x - inter.x);
    const dz = Math.abs(pos.z - inter.z);
    if (dx < 4.5 && dz < 4.5) {
      inside = inter;
    } else if (dx < 16 && dz < 16 && (dx < 4.5 || dz < 4.5)) {
      violation.approachMin.set(inter, Math.min(violation.approachMin.get(inter) ?? Infinity, spd));
    } else {
      violation.approachMin.delete(inter);
    }
  }
  if (inside && inside !== violation.inside) {
    const axis = Math.abs(Math.sin(truckState.heading)) > Math.abs(Math.cos(truckState.heading)) ? 'x' : 'z';
    if (inside.type === 'light' && spd > 2 && traffic.lightState(inside, axis) === 'red') ticket('Ran a red light');
    if (inside.type === 'stop' && (violation.approachMin.get(inside) ?? 0) > 1.5) ticket('Rolled a stop sign');
    violation.approachMin.delete(inside);
  }
  violation.inside = inside;
  violation.speeding = spd > SPEED_LIMIT ? violation.speeding + dt : Math.min(0, violation.speeding + dt);
  if (violation.speeding > 1.5) {
    ticket('Speeding');
    violation.speeding = -6;
  }
}

function flash(text, seconds = 1.6) {
  msgEl.textContent = text;
  msgTimer = seconds;
}

function updateHud() {
  const m = Math.floor(timeLeft / 60);
  const s = String(Math.floor(timeLeft % 60)).padStart(2, '0');
  const mph = Math.round(Math.abs(truckState.speed) * 3);
  const over = Math.abs(truckState.speed) > SPEED_LIMIT;
  const cop = traffic.policeNear(truck.position, POLICE_RANGE) ? ' <b style="color:#7fb2ff">🚓 Police nearby</b>' : '';
  const quota = quotaFor(empire.city);
  const evText = roadEvents.hudText(truck.position, truckState.heading);
  const wx = weather.status;
  statsEl.innerHTML = `⏱ ${m}:${s} &nbsp; 💵 $${truckState.money}<span style="color:${truckState.money >= quota ? '#9e5' : '#ccc'}">/${quota}</span><br><span style="color:${over ? '#ff6b6b' : '#fff'}">${mph} mph</span> / 40 · Load ${truckState.load}/${CAPACITY}${cop}${wx ? `<br>${wx}` : ''}${evText ? `<br>${evText}` : ''}`;
  fillEl.style.width = `${(truckState.load / CAPACITY) * 100}%`;
  fillEl.style.background = truckState.load >= CAPACITY ? '#e44' : '#7c4';

  const truckPosition = new THREE.Vector2(truck.position.x, truck.position.z);
  let nearest = DISTRICTS[0];
  let nearestDistance = truckPosition.distanceTo(nearest.center);
  for (const district of DISTRICTS.slice(1)) {
    const distance = truckPosition.distanceTo(district.center);
    if (distance < nearestDistance) {
      nearest = district;
      nearestDistance = distance;
    }
  }
  const zoneChip = `📍 ${nearest.name}`;
  if (zoneBtn.textContent !== zoneChip) {
    zoneBtn.textContent = zoneChip;
    zoneBtn.style.color = nearest.cssColor;
  }
  districtNameEl.textContent = `${nearest.name} · ${Math.round(nearestDistance)}m`;
  districtNameEl.style.color = nearest.cssColor;
  districtTipEl.innerHTML = `<b>${nearest.focus}:</b> ${nearest.advice}`;
  for (const district of DISTRICTS) {
    document.getElementById(`key-${district.id}`).classList.toggle('active', district === nearest);
  }
}

function applyCity() {
  const city = CITIES[empire.city];
  scene.background.setHex(city.sky);
  scene.fog.color.setHex(city.sky);
  ground.material.color.setHex(city.grass);
  hemiLight.intensity = city.hemi;
  sun.color.setHex(city.sun);
  sun.intensity = city.sunI;
  SHIFT_TIME = city.time + diff().time;
  weather.setCity(CITY_WEATHER[empire.city], diff().weather, BASE_FOG);
  scene.fog.near = BASE_FOG[0];
  scene.fog.far = BASE_FOG[1];
  CAPACITY = 20 + empire.up.hopper * 5;
  TOP_SPEED = 16 + empire.up.engine * 1.5;
  PAY_PER_UNIT = city.rate + empire.up.contract * 2;
  worldDecor.set(city.world);
}

const shopEl = document.getElementById('shop');
const citiesEl = document.getElementById('cities');
function renderEmpire() {
  const trucks = 1 + empire.up.crew;
  citiesEl.innerHTML = `<div class="emp-head">🏢 Earl's Hauling Co. · Bank <b>$${empire.bank}</b> · 🚛 ${trucks} truck${trucks > 1 ? 's' : ''}</div>` +
    CITIES.map((c, i) => `<button class="city ${i === empire.city ? 'sel' : ''}" data-city="${i}" ${i > empire.unlocked ? 'disabled' : ''}>${i > empire.unlocked ? '🔒' : i < empire.unlocked ? '✅' : '🏙'} ${c.name}<small>$${quotaFor(i)} quota · ${WEATHER[CITY_WEATHER[i]].name}</small></button>`).join('');
  diffEl.innerHTML = `<div class="emp-head">🎚 Difficulty</div>` + Object.entries(DIFFICULTIES).map(([id, d]) =>
    `<button class="city ${id === empire.difficulty ? 'sel' : ''}" data-diff="${id}">${d.label}<small>${d.desc}</small></button>`).join('');
  shopEl.innerHTML = UPGRADES.map(u => {
    const lvl = empire.up[u.id];
    const maxed = lvl >= u.max;
    const cost = upgradeCost(u);
    return `<button class="upg" data-up="${u.id}" ${maxed || empire.bank < cost ? 'disabled' : ''}>${u.name} <small>${u.desc} · Lv ${lvl}/${u.max}</small><b>${maxed ? 'MAX' : '$' + cost}</b></button>`;
  }).join('');
  const current = empire.color ?? TRUCK_COLORS[0].hex;
  paintEl.innerHTML = `<div class="emp-head">🎨 Truck paint &amp; Earl's vest</div>` + TRUCK_COLORS.map(c =>
    `<button class="swatch ${c.hex === current ? 'sel' : ''}" data-color="${c.hex}" title="${c.name}" style="background:#${c.hex.toString(16).padStart(6, '0')}"></button>`).join('');
  const city = CITIES[empire.city];
  document.getElementById('start').textContent = `Start ${city.name} Shift`;
}
const paintEl = document.getElementById('paint');
paintEl.addEventListener('click', e => {
  const btn = e.target.closest('[data-color]');
  if (!btn) return;
  empire.color = Number(btn.dataset.color);
  saveEmpire();
  truckModel.setColor(empire.color);
  vestGreen.color.setHex(empire.color);
  renderEmpire();
});
citiesEl.addEventListener('click', e => {
  const btn = e.target.closest('[data-city]');
  if (!btn || btn.disabled) return;
  empire.city = Number(btn.dataset.city);
  saveEmpire();
  const city = CITIES[empire.city];
  overlay.querySelector('h1').textContent = city.name;
  showCityIntro();
  applyCity();
  renderEmpire();
});
function showCityIntro() {
  const rep = document.getElementById('report');
  rep.innerHTML = '';
  rep.style.display = 'none';
  const c = CITIES[empire.city];
  const w = WEATHER[CITY_WEATHER[empire.city]];
  document.getElementById('story').innerHTML = `<i>${c.chapter}</i><br>${c.story}<br>Quota: <b>$${quotaFor(empire.city)}</b> · Pay: <b>$${c.rate + empire.up.contract * 2}/unit</b><br>Weather: <b>${w.name}</b> · ${w.tip}<br><small>Watch for 🦝 raccoon raids and 🎉 block parties: follow the beacon and clear the pile before the timer ends. 🚪 Exit (or E) to walk.</small>`;
}
const diffEl = document.getElementById('difficulty');
diffEl.addEventListener('click', e => {
  const btn = e.target.closest('[data-diff]');
  if (!btn) return;
  empire.difficulty = btn.dataset.diff;
  saveEmpire();
  applyCity();
  showCityIntro();
  renderEmpire();
});
shopEl.addEventListener('click', e => {
  const btn = e.target.closest('[data-up]');
  if (!btn || btn.disabled) return;
  const u = UPGRADES.find(x => x.id === btn.dataset.up);
  const cost = upgradeCost(u);
  if (empire.bank < cost || empire.up[u.id] >= u.max) return;
  empire.bank -= cost;
  empire.up[u.id]++;
  saveEmpire();
  playSound(pickupSound);
  renderEmpire();
});

function startShift() {
  applyCity();
  if (foot.carrying) earl.remove(foot.carrying.mesh);
  foot.carrying = null;
  foot.active = false;
  earl.visible = false;
  setExitLabel();
  for (const item of trashItems) scene.remove(item.mesh);
  trashItems.length = 0;
  for (const district of DISTRICTS) {
    district.stops.forEach((_, index) => spawnTrash(district, index));
  }
  Object.assign(truckState, { speed: 0, heading: -Math.PI / 2, load: 0, money: 0 });
  Object.assign(stats, freshStats());
  Object.assign(ledger, freshLedger());
  violation.inside = null;
  violation.approachMin.clear();
  violation.speeding = 0;
  goalDone = GOALS.map(() => false);
  clearRush();
  rush.cooldown = 8;
  truckState.heading = START.heading;
  truck.position.set(START.x, 0, START.z);
  truck.rotation.y = truckState.heading;
  traffic.clearArea(truck.position, 32);
  timeLeft = SHIFT_TIME;
  running = true;
  overlay.style.display = 'none';
  document.getElementById('chips').style.display = 'flex';
  if (!muted) music.play().catch(() => {});
  truckState.vx = 0;
  truckState.vz = 0;
  roadEvents.reset(diff().events);
  weather.setCity(CITY_WEATHER[empire.city], diff().weather, BASE_FOG);
  const w = WEATHER[CITY_WEATHER[empire.city]];
  flash(`${CITIES[empire.city].name}: earn $${quotaFor(empire.city)}! ${w.type === 'clear' ? '' : w.name}`, 3);
}

function endShift() {
  running = false;
  music.pause();
  clearRush();
  if (foot.carrying) {
    earl.remove(foot.carrying.mesh);
    foot.carrying = null;
  }
  roadEvents.clear(false);
  // Safe driving now counts tickets too.
  const safeBonus = stats.crashes + stats.tickets <= 1 ? 100 : 0;
  truckState.money += safeBonus;
  const wxType = WEATHER[CITY_WEATHER[empire.city]].type;
  const weatherBonus = wxType !== 'clear' && stats.skids <= 1 ? Math.round(80 * diff().weather) : 0;
  truckState.money += weatherBonus;
  best = Math.max(best, truckState.money);
  localStorage.setItem('trashRouteBest', best);
  const goalsHit = goalDone.filter(Boolean).length;
  const cityIndex = empire.city;
  const city = CITIES[cityIndex];
  const quota = quotaFor(cityIndex);
  const crewPay = empire.up.crew * 60;
  const won = truckState.money >= quota;
  empire.bank += truckState.money + crewPay;
  let storyLine = '';
  const finalCity = cityIndex === CITIES.length - 1;
  if (won) {
    if (finalCity) {
      empire.beaten = true;
      empire.grand = true;
      storyLine = "🏆 <b>Atlantis is sparkling clean!</b> Earl's Hauling Co. is now the biggest garbage empire in the universe.";
    } else {
      empire.unlocked = Math.max(empire.unlocked, cityIndex + 1);
      storyLine = cityIndex === 4
        ? "🚀 <b>Neon City is yours!</b> Earl rules every road in the state... then a rocket lands at the depot. <b>The trash doesn't stop at Earth!</b>"
        : `📜 The ${city.name} council signs the contract. <b>${CITIES[cityIndex + 1].name}</b> is calling!`;
      empire.city++;
    }
  }
  saveEmpire();

  const choices = buildChoices({ won, finalCity, cityIndex, quota });
  reportData = {
    cityName: city.name, quota, money: truckState.money, won, stats: { ...stats }, ledger: { ...ledger },
    goalsHit, goalsTotal: GOALS.length, crewPay, crewCount: empire.up.crew, safeBonus, weatherBonus, weatherType: wxType,
    difficultyLabel: diff().label.replace(/^\S+\s/, '').toUpperCase(), storyLine, choices, bank: empire.bank,
  };
  overlay.querySelector('h1').textContent = won ? 'Contract Won!' : 'Shift Report';
  document.getElementById('story').innerHTML = '';
  reportEl.innerHTML = buildReport(reportData);
  reportEl.style.display = 'block';
  applyCity();
  renderEmpire();
  overlay.style.display = 'flex';
  overlay.scrollTop = 0;
  if (won && finalCity) showFinale(reportData);
}

// ---------- Grand finale after the last world ----------
function showFinale(d) {
  const el = document.createElement('div');
  el.id = 'finale';
  const colors = ['#ff5fa2', '#5fd3ff', '#ffe066', '#8cf06a', '#b98cff', '#ff8c42'];
  const confetti = Array.from({ length: 70 }, (_, i) =>
    `<i style="left:${Math.random() * 100}%;background:${colors[i % colors.length]};animation-delay:${(Math.random() * 4).toFixed(2)}s;animation-duration:${(3 + Math.random() * 3).toFixed(2)}s"></i>`).join('');
  const trucks = 1 + empire.up.crew;
  el.innerHTML = `${confetti}<div class="fin-card">
    <div class="fin-trophy">🏆</div>
    <h1>THE END</h1>
    <h2>Earl's Hauling Co.<br><small>Intergalactic Waste Champions</small></h2>
    <p>From one rusty truck in Trashville to the Moon, the Candy Kingdom and the depths of Atlantis, Earl cleaned up <b>eight worlds</b>.</p>
    <p>A parade rolls down Trashville's Main Street. ${trucks} gleaming truck${trucks > 1 ? 's' : ''} lead the way, horns blaring, and the town renames the landfill <b>"Earl's Peak"</b>.</p>
    <p>Earl tips his cap, smiles, and says: <i>"Same time tomorrow?"</i></p>
    <div class="fin-stats">🏦 Empire bank: <b>$${empire.bank}</b> · 🎚 ${diff().label}</div>
    <div class="fin-credits">Starring EARL · Driving YOU · Trash by EVERYONE</div>
    <button id="fin-close">Keep hauling 🚛</button>
  </div>`;
  document.body.appendChild(el);
  playSound(dumpSound);
  el.querySelector('#fin-close').addEventListener('click', () => el.remove());
}

// ---------- Next-step choices on the shift report ----------
let reportData = null;
const reportEl = document.getElementById('report');
function recommendUpgrade(won) {
  const order = [];
  if (stats.fullHits >= 2) order.push(['hopper', `Truck was full ${stats.fullHits} times. Fewer landfill runs.`]);
  if (!won) order.push(['contract', 'More pay per unit closes the quota gap.']);
  if (stats.loads >= 3 || !won) order.push(['engine', 'Faster landfill runs mean more trips per shift.']);
  order.push(['crew', '+$60 every shift, even on a bad day.'], ['hopper', 'Haul more per trip.'], ['contract', 'Earn more per unit.'], ['engine', 'Faster trips.']);
  for (const [id, why] of order) {
    const u = UPGRADES.find(x => x.id === id);
    if (empire.up[id] < u.max) return { u, why };
  }
  return null;
}
function buildChoices({ won, finalCity, cityIndex, quota }) {
  const list = [];
  const next = CITIES[empire.city];
  if (won && !finalCity) {
    const w = WEATHER[CITY_WEATHER[empire.city]];
    list.push({ act: 'start', primary: true, icon: '🏙', title: `Head to ${next.name}`, desc: `${next.chapter} · ${w.name} · $${quotaFor(empire.city)} quota` });
  } else if (won) {
    list.push({ act: 'start', primary: true, icon: '👑', title: 'Run Neon City again', desc: 'Grow the fleet and chase an S grade' });
  } else {
    list.push({ act: 'start', primary: true, icon: '🔁', title: `Retry ${CITIES[cityIndex].name}`, desc: `Need $${quota}. You made $${truckState.money}.` });
  }
  const rec = recommendUpgrade(won);
  if (rec) {
    const cost = upgradeCost(rec.u);
    const afford = empire.bank >= cost;
    list.push({ act: `up:${rec.u.id}`, disabled: !afford, icon: '🔧', title: `${rec.u.name} · $${cost}`,
      desc: afford ? `Recommended: ${rec.why}` : `Save $${cost - empire.bank} more. ${rec.why}` });
  }
  if (!won) {
    if (empire.difficulty !== 'easy' && truckState.money < quota * 0.7) {
      list.push({ act: 'easy', icon: '🙂', title: 'Switch to Easy', desc: `Quota drops and you get +30s. Climb back up later.` });
    }
    if (cityIndex > 0) {
      list.push({ act: `city:${cityIndex - 1}`, icon: '🏦', title: `Replay ${CITIES[cityIndex - 1].name}`, desc: 'An easier city to grow the bank for upgrades' });
    }
  }
  return list;
}
document.getElementById('report').addEventListener('click', e => {
  const btn = e.target.closest('[data-act]');
  if (!btn || btn.disabled) return;
  const act = btn.dataset.act;
  if (act === 'start') {
    startShift();
    return;
  }
  if (act.startsWith('up:')) {
    const u = UPGRADES.find(x => x.id === act.slice(3));
    const cost = upgradeCost(u);
    if (empire.bank < cost || empire.up[u.id] >= u.max) return;
    empire.bank -= cost;
    empire.up[u.id]++;
    playSound(pickupSound);
    btn.querySelector('b').textContent = `✅ ${u.name} purchased`;
    btn.querySelector('small').textContent = `Level ${empire.up[u.id]}/${u.max}. Bank now $${empire.bank}`;
  } else if (act === 'easy') {
    empire.difficulty = 'easy';
    btn.querySelector('b').textContent = '✅ Difficulty set to Easy';
  } else if (act.startsWith('city:')) {
    empire.city = Number(act.slice(5));
    btn.querySelector('b').textContent = `✅ Next shift: ${CITIES[empire.city].name}`;
  }
  btn.disabled = true;
  saveEmpire();
  applyCity();
  renderEmpire();
  const bankRow = reportEl.querySelector('.r-row.bank b');
  if (bankRow) bankRow.textContent = `$${empire.bank}`;
  const startChoice = reportEl.querySelector('[data-act="start"] b');
  if (startChoice && act.startsWith('city:')) startChoice.textContent = `Start ${CITIES[empire.city].name}`;
});
applyCity();
renderEmpire();
showCityIntro();
document.getElementById('start').onclick = startShift;

// ---------- Simulation ----------
function driveTruck(dt) {
  const accel = input.gas ? (9 + empire.up.engine * 1.2) * handling.accel : 0;
  const braking = input.brake;
  if (braking) {
    // Hard brake while rolling forward, then a strong reverse once stopped.
    truckState.speed -= (truckState.speed > 0.2 ? 20 * handling.brake : 9) * dt;
  }
  truckState.speed += accel * dt;
  truckState.speed -= truckState.speed * 0.6 * dt;
  truckState.speed = THREE.MathUtils.clamp(truckState.speed, -5, TOP_SPEED);
  const steer = (input.left ? 1 : 0) - (input.right ? 1 : 0);
  const turnRate = 1.6 * Math.min(1, Math.abs(truckState.speed) / 4) * Math.sign(truckState.speed);
  truckState.heading += steer * turnRate * handling.steer * dt;
  truck.rotation.y = truckState.heading;
  // Velocity chases the heading at a rate set by grip: on ice the truck keeps
  // sliding the way it was going; gusts push it sideways.
  const wantX = Math.sin(truckState.heading) * truckState.speed;
  const wantZ = Math.cos(truckState.heading) * truckState.speed;
  if (handling.grip >= 0.95 && !handling.pushX && !handling.pushZ) {
    // Full grip: the truck goes exactly where it points (no residual drift).
    truckState.vx = wantX;
    truckState.vz = wantZ;
  } else {
    const blend = 1 - Math.exp(-14 * handling.grip * dt);
    truckState.vx += (wantX - truckState.vx) * blend + handling.pushX * dt;
    truckState.vz += (wantZ - truckState.vz) * blend + handling.pushZ * dt;
  }
  const nx = truck.position.x + truckState.vx * dt;
  const nz = truck.position.z + truckState.vz * dt;
  // Only block moves that push deeper into an obstacle, so the truck can always
  // back (or steer) out after touching a wall instead of getting stuck.
  const px = truck.position.x;
  const pz = truck.position.z;
  const blocked = houses.some(h => {
    const lim = h.r + 1.3;
    if (Math.abs(nx - h.x) >= lim || Math.abs(nz - h.z) >= lim) return false;
    const before = Math.max(Math.abs(px - h.x), Math.abs(pz - h.z));
    const after = Math.max(Math.abs(nx - h.x), Math.abs(nz - h.z));
    return !(Math.abs(px - h.x) < lim && Math.abs(pz - h.z) < lim && after > before);
  });
  // Poles: block a move only if it brings the truck body closer to the pole
  // (so you can always back or steer away after touching one).
  const poleNow = truckPoleHit(nx, nz, truckState.heading);
  const poleBlocked = poleNow && (() => {
    const prev = Math.hypot(poleNow.x - px, poleNow.z - pz);
    const next = Math.hypot(poleNow.x - nx, poleNow.z - nz);
    return next < prev || !truckPoleHit(px, pz, truckState.heading);
  })();
  if (poleBlocked && Math.abs(truckState.speed) > 6 && msgTimer <= 0) flash('💥 Clipped a pole!', 1);
  if (blocked || poleBlocked) {
    truckState.speed *= -0.3;
    truckState.vx *= -0.3;
    truckState.vz *= -0.3;
  } else {
    truck.position.x = THREE.MathUtils.clamp(nx, -140, 140);
    truck.position.z = THREE.MathUtils.clamp(nz, -140, 140);
  }
}

function collectTrash(dt) {
  const slow = Math.abs(truckState.speed) < 3;
  for (let i = trashItems.length - 1; i >= 0; i--) {
    const item = trashItems[i];
    if (item.carried) continue;
    const info = TRASH_TYPES[item.type];
    const dist = item.mesh.position.distanceTo(truck.position);
    if (item.lift > 0) {
      item.lift += dt;
      item.mesh.position.lerp(truck.position, dt * 4);
      item.mesh.position.y = Math.sin(item.lift * Math.PI) * 3;
      if (item.lift > 0.8) {
        scene.remove(item.mesh);
        trashItems.splice(i, 1);
        if (!item.event) spawnTrash(item.district); // event piles never respawn
      }
      continue;
    }
    if (slow && dist < 6 + info.size) {
      if (truckState.load + info.load > CAPACITY) {
        if (msgTimer <= 0) {
          stats.fullHits++;
          flash('Truck full! Head to the landfill ⬆');
        }
        continue;
      }
      item.lift = 0.01;
      loadItem(item);
    }
  }
}

// Shared by truck pickups and Earl carrying trash back by hand.
function loadItem(item) {
  const info = TRASH_TYPES[item.type];
  {
    {
      truckState.load += info.load;
      playSound(pickupSound);
      stats.combo = stats.comboTimer > 0 ? stats.combo + 1 : 1;
      stats.comboTimer = 5;
      stats.bestCombo = Math.max(stats.bestCombo, stats.combo);
      if (item.type === 'dumpster') stats.dumpsters++;
      if (item.district.id === 'civic') stats.civic++;
      const bonus = stats.combo > 1 ? 5 * (stats.combo - 1) : 0;
      truckState.money += bonus;
      ledger.combo += bonus;
      stats.pickups++;
      stats.units += info.load;
      if (item.event) roadEvents.collected(item);
      if (item === rush.item) {
        stats.rush++;
        truckState.money += 40;
        ledger.rush += 40;
        timeLeft += 8;
        flash('⭐ Rush pickup! +$40 +8s', 1.8);
        clearRush();
      } else {
        flash(`+${info.load} ${item.type}${bonus ? `  🔥x${stats.combo} +$${bonus}` : ''}`, 0.9);
      }
    }
  }
}

function handleLandfill(dt) {
  const inZone = truck.position.distanceTo(LANDFILL) < 9;
  if (inZone && truckState.load > 0 && Math.abs(truckState.speed) < 2) {
    if (dumpTimer === 0) playSound(dumpSound);
    dumpTimer += dt;
    flash(`Dumping... ${Math.ceil(2 - dumpTimer)}`, 0.2);
    if (dumpTimer >= 2) {
      const pay = truckState.load * PAY_PER_UNIT;
      truckState.money += pay;
      ledger.dumps += pay;
      truckState.load = 0;
      stats.loads++;
      timeLeft += 15;
      flash(`Load dumped! +$${pay}  +15s`, 2);
      dumpTimer = 0;
    }
  } else {
    dumpTimer = 0;
  }
}

// ---------- On-foot mode: Earl can hop out and hand-carry bags and cans ----------
const earl = makePerson(Math.random);
// Earl's uniform: green hi-vis vest with reflective bands and a matching cap.
// Vest & cap always match the truck's paint job.
const vestGreen = new THREE.MeshStandardMaterial({ color: empire.color ?? 0x2fae4a, roughness: 0.6 });
const reflective = new THREE.MeshStandardMaterial({ color: 0xe8f0e0, emissive: 0x556650, roughness: 0.3, metalness: 0.4 });
const vest = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.28, 0.62, 20), vestGreen);
vest.scale.z = 0.72;
vest.position.y = 1.3;
for (const y of [1.14, 1.32]) {
  const band = new THREE.Mesh(new THREE.CylinderGeometry(0.305, 0.3, 0.055, 20), reflective);
  band.scale.z = 0.73;
  band.position.y = y;
  earl.add(band);
}
for (const side of [-1, 1]) {
  const strap = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.62, 0.02), reflective);
  strap.position.set(side * 0.12, 1.32, 0.22);
  earl.add(strap);
}
const capDome = new THREE.Mesh(new THREE.SphereGeometry(0.26, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), vestGreen);
capDome.position.y = 2.0;
const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.03, 20, 1, false, -Math.PI / 2, Math.PI), vestGreen);
brim.position.set(0, 2.01, 0.16);
const gloveMat = new THREE.MeshStandardMaterial({ color: 0xd9a441, roughness: 0.9 });
earl.add(vest, capDome, brim);
for (const arm of earl.userData.arms) {
  const glove = new THREE.Mesh(new THREE.SphereGeometry(0.085, 12, 10), gloveMat);
  glove.position.y = -0.7;
  arm.add(glove);
}
earl.visible = false;
scene.add(earl);
const foot = { active: false, heading: 0, carrying: null, phase: 0 };
const exitBtn = document.getElementById('exit');

function setExitLabel() {
  exitBtn.textContent = foot.active ? '🚛 Enter' : '🚪 Exit';
}

function toggleFoot() {
  if (!running) return;
  if (!foot.active) {
    if (Math.abs(truckState.speed) > 1.5) {
      flash('Stop the truck first!', 1.2);
      return;
    }
    truckState.speed = 0;
    foot.active = true;
    foot.heading = truckState.heading;
    const side = new THREE.Vector3(-Math.cos(truckState.heading), 0, Math.sin(truckState.heading)).multiplyScalar(2.6);
    earl.position.copy(truck.position).add(side);
    earl.visible = true;
    flash('On foot! Grab bags & cans and bring them to the truck', 2.2);
  } else {
    if (earl.position.distanceTo(truck.position) > 5.5) {
      flash('Walk back to the truck to get in', 1.3);
      return;
    }
    if (foot.carrying) deliverCarried();
    foot.active = false;
    earl.visible = false;
  }
  setExitLabel();
}
exitBtn.addEventListener('pointerdown', e => {
  e.preventDefault();
  toggleFoot();
});
window.addEventListener('keydown', e => {
  if (e.code === 'KeyE') toggleFoot();
});

function deliverCarried() {
  const item = foot.carrying;
  const info = TRASH_TYPES[item.type];
  foot.carrying = null;
  item.carried = false;
  scene.attach(item.mesh);
  if (truckState.load + info.load > CAPACITY) {
    item.mesh.position.set(earl.position.x, 0, earl.position.z);
    flash('Truck full! Dropped it here', 1.4);
    return;
  }
  item.lift = 0.01;
  loadItem(item);
}

function walkEarl(dt) {
  const turn = (input.left ? 1 : 0) - (input.right ? 1 : 0);
  foot.heading += turn * 2.8 * dt;
  const move = (input.gas ? 1 : 0) - (input.brake ? 0.6 : 0);
  const speed = move * (foot.carrying ? 4.2 : 5.5);
  const nx = earl.position.x + Math.sin(foot.heading) * speed * dt;
  const nz = earl.position.z + Math.cos(foot.heading) * speed * dt;
  const hitsPole = POLES.some(p => Math.hypot(p.x - nx, p.z - nz) < POLE_R + 0.35);
  if (!hitsPole && !houses.some(h => Math.abs(nx - h.x) < h.r + 0.4 && Math.abs(nz - h.z) < h.r + 0.4)) {
    earl.position.x = THREE.MathUtils.clamp(nx, -140, 140);
    earl.position.z = THREE.MathUtils.clamp(nz, -140, 140);
  }
  earl.rotation.y = foot.heading;
  foot.phase += dt * Math.abs(speed) * 2.2;
  const swing = speed ? Math.sin(foot.phase) * 0.7 : 0;
  const { legs, arms } = earl.userData;
  legs[0].rotation.x = swing;
  legs[1].rotation.x = -swing;
  arms[0].rotation.x = foot.carrying ? -2.9 : -swing;
  arms[1].rotation.x = foot.carrying ? -2.9 : swing;

  if (foot.carrying) {
    if (earl.position.distanceTo(truck.position) < 4.5) deliverCarried();
    return;
  }
  for (const item of trashItems) {
    if (item.lift > 0 || item.carried) continue;
    if (item.mesh.position.distanceTo(earl.position) > 1.8) continue;
    if (item.type === 'dumpster') {
      if (msgTimer <= 0) flash('Too heavy to carry — back the truck up to it', 1.4);
      continue;
    }
    item.carried = true;
    foot.carrying = item;
    earl.attach(item.mesh);
    item.mesh.position.set(0, 2.4, 0);
    item.mesh.rotation.set(0, 0, 0);
    flash(`Carrying a ${item.type} — bring it to the truck`, 1.4);
    break;
  }
}

function updateCamera(dt) {
  const target = foot.active ? earl.position : truck.position;
  const heading = foot.active ? foot.heading : truckState.heading;
  const dist = foot.active ? 7 : 13;
  const back = new THREE.Vector3(-Math.sin(heading) * dist, foot.active ? 4 : 7, -Math.cos(heading) * dist);
  camera.position.lerp(target.clone().add(back), 1 - Math.exp(-dt * 4));
  camera.lookAt(target.x, foot.active ? 1.4 : 1.8, target.z);
  sun.position.set(target.x + 30, 50, target.z + 20);
  sun.target.position.copy(target);
}

const timer = new THREE.Timer();
camera.position.set(0, 8, 5);
await loadTemplates();
renderer.setAnimationLoop(time => {
  timer.update(time);
  const dt = Math.min(timer.getDelta(), 0.05);
  const hitCar = traffic.update(dt, truck.position, time);
  for (const cloud of clouds) {
    cloud.position.x += dt * 1.5;
    if (cloud.position.x > 160) cloud.position.x = -160;
  }
  {
    const center = foot.active ? earl.position : truck.position;
    worldDecor.update(dt, time);
    handling = weather.update(dt, time, truck.position, truckState.heading, truckState.speed, foot.active || !running, center, running ? weatherHooks : idleHooks);
    scene.fog.near = THREE.MathUtils.lerp(scene.fog.near, handling.fogNear, dt * 1.5);
    scene.fog.far = THREE.MathUtils.lerp(scene.fog.far, handling.fogFar, dt * 1.5);
  }
  roadEvents.update(dt, time, running);
  if (running) {
    if (foot.active) walkEarl(dt);
    else driveTruck(dt);
    collectTrash(dt);
    handleLandfill(dt);
    updateRush(dt, time);
    checkViolations(dt);
    stats.comboTimer = Math.max(0, stats.comboTimer - dt);
    if (hitCar) {
      stats.crashes++;
      truckState.speed *= -0.4;
      truckState.vx *= -0.4;
      truckState.vz *= -0.4;
      ledger.crashes += Math.min(25, truckState.money);
      truckState.money = Math.max(0, truckState.money - 25);
      flash('💥 Fender bender! -$25', 1.6);
    }
    checkGoals();
    timeLeft -= dt;
    if (timeLeft <= 0) {
      timeLeft = 0;
      endShift();
    }
    updateHud();
  }
  ringMat.opacity = 0.35 + Math.sin(time * 0.005) * 0.2;
  if (msgTimer > 0) {
    msgTimer -= dt;
    if (msgTimer <= 0) msgEl.textContent = '';
  }
  truckModel.update(dt, truckState.speed, running && !foot.active && input.brake, truckState.load / CAPACITY);
  updateCamera(dt);
  renderer.render(scene, camera);
});
