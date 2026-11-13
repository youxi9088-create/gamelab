import * as THREE from './_remote/0d0e081c7ee3d520/three@0.184.0.js';
import { BEDROOM_BOUNDS, BEDROOM_SURFACES, createBedroomMap, getBedroomServiceLayout, updateBedroomTrain } from './bedroom-map.js';

// ---------- Data ----------
const VERSION = '1.27';
const ROUND_DURATION = 15 * 60;
const BEDROOM_FLIGHT_SPEED_SCALE = 0.5;
const SPAWN_LIMIT = 100;
const MAX_SQUAD_SIZE = 15;
const MAX_WRECKS = 15;
const MAX_BATTLE_BULLETS = 240;
const MAX_ACTIVE_SMOKE = 180;
const MAX_AIR_DEBRIS = 90;
const DAYLIGHT_DURATION = 10 * 60;
const UPGRADE_BASE_COST = 300;
const ARMOR_BASE_COST = 500;
const AMMO_BASE_COST = 500;
const upgradeCost = (level, base = UPGRADE_BASE_COST) => base * 2 ** Math.max(0, Number(level) || 0);
const PLANES = {
  blue: [{
    id: 'camel',
    name: 'Sopwith Camel',
    cost: 0,
    speed: 48,
    turn: 1.6,
    armor: 0
  }, {
    id: 'spad',
    name: 'SPAD XIII (Prestige)',
    cost: 1500,
    speed: 58,
    turn: 1.5,
    armor: 0.3
  }, {
    id: 'dh4',
    name: 'Airco DH.4 Bomber',
    cost: 3000,
    speed: 40,
    turn: 0.9,
    armor: 0.3,
    bomber: true
  }, {
    id: 'bristol-f2b',
    name: 'Bristol F.2B Two-Seater',
    cost: 6000,
    speed: 44,
    turn: 1.25,
    armor: 0.16,
    twoSeater: true
  }],
  red: [{
    id: 'albatros',
    name: 'Albatros D.III',
    cost: 0,
    speed: 47,
    turn: 1.6,
    armor: 0
  }, {
    id: 'fokker',
    name: 'Fokker Dr.I (Prestige)',
    cost: 1500,
    speed: 52,
    turn: 1.9,
    armor: 0.3,
    tri: true
  }, {
    id: 'gotha',
    name: 'Gotha G.V Bomber',
    cost: 3000,
    speed: 38,
    turn: 0.85,
    armor: 0.3,
    bomber: true
  }, {
    id: 'halberstadt-cl2',
    name: 'Halberstadt CL.II Two-Seater',
    cost: 6000,
    speed: 43,
    turn: 1.28,
    armor: 0.16,
    twoSeater: true
  }, {
    id: 'baron',
    name: "Red Baron's Dr.I Triplane",
    cost: 20000,
    speed: 57,
    turn: 2.2,
    armor: 0.4,
    tri: true
  }]
};
const COLORS = {
  blue: 0x5a7fa8,
  red: 0xa83a2e
};
const FACTION_NAMES = {
  blue: 'Aurelian Air Corps',
  red: 'Vesperian Air Service'
};
const SQUAD_TEAM_COLORS = ['#ff4055', '#14d6c6', '#ffd52f', '#bf63ff'];
const SQUAD_TEAM_NAMES = ['CRIMSON', 'TURQUOISE', 'GOLD', 'VIOLET'];
const SQUAD_BASE_TEAMS = ['blue', 'red', 'blue', 'red'];
const squadBaseTeam = index => SQUAD_BASE_TEAMS[THREE.MathUtils.clamp(Math.floor(Number(index) || 0), 0, 3)];
const factionName = team => FACTION_NAMES[team] || FACTION_NAMES.blue;
const save = JSON.parse(localStorage.getItem('aces') || '{"cash":0,"owned":["camel","albatros"],"acc":0,"dmg":0,"hp":0}');
save.career = Object.assign({
  aircraftKills: 0,
  bomberKills: 0,
  blimpKills: 0,
  shipKills: 0,
  convoyKills: 0,
  groundVehicleKills: 0,
  trainKills: 0,
  factoryKills: 0,
  baseKills: 0,
  battleVictories: 0,
  deaths: 0,
  sorties: 0,
  cashEarned: 0,
  bestStreak: 0,
  aceDefeats: 0,
  bonanzaSorties: 0,
  bonanzaKills: 0,
  bonanzaAssists: 0,
  bonanzaWins: 0,
  bonanzaMvp: 0,
  sectorsCaptured: 0,
  courierDeliveries: 0,
  ribbonAwards: {},
  teamAircraftKills: {
    blue: 0,
    red: 0
  }
}, save.career || {});
save.career.sectorsCaptured = Math.max(0, Math.floor(Number(save.career.sectorsCaptured) || 0));
save.career.courierDeliveries = Math.max(0, Math.floor(Number(save.career.courierDeliveries) || 0));
save.career.teamAircraftKills = Object.assign({
  blue: 0,
  red: 0
}, save.career.teamAircraftKills && typeof save.career.teamAircraftKills === 'object' ? save.career.teamAircraftKills : {});
for (const team of ['blue', 'red']) save.career.teamAircraftKills[team] = Math.max(0, Math.floor(Number(save.career.teamAircraftKills[team]) || 0));
for (const key of ['aircraftKills', 'shipKills', 'convoyKills', 'groundVehicleKills', 'trainKills', 'factoryKills', 'baseKills', 'battleVictories']) {
  save.career[key] = Math.max(0, Math.floor(Number(save.career[key]) || 0));
}
save.career.ribbonAwards = save.career.ribbonAwards && typeof save.career.ribbonAwards === 'object' && !Array.isArray(save.career.ribbonAwards) ? save.career.ribbonAwards : {};
save.career.bonanzaMvp = Math.max(0, Math.floor(Number(save.career.bonanzaMvp) || 0), Math.floor(Number(save.career.ribbonAwards['bonanza-mvp']) || 0));
save.reducedGraphics = typeof save.reducedGraphics === 'boolean' ? save.reducedGraphics : matchMedia('(max-width: 800px), (pointer: coarse)').matches;
save.greatWarCampaign = save.greatWarCampaign && typeof save.greatWarCampaign === 'object' && !Array.isArray(save.greatWarCampaign) ? save.greatWarCampaign : {};
save.gameMode = ['squadron', 'squadbattle', 'bonanza'].includes(save.gameMode) ? save.gameMode : 'squadron';
save.squadTeam = THREE.MathUtils.clamp(Math.floor(Number(save.squadTeam) || 0), 0, 3);
save.bonanzaMinutes = THREE.MathUtils.clamp(Math.round(Number(save.bonanzaMinutes) || 5), 3, 10);
save.defeatedAces = Array.isArray(save.defeatedAces) ? save.defeatedAces : [];
save.ammo = Math.max(0, Math.min(2, Math.floor(Number(save.ammo) || 0)));
save.roundMinutes = THREE.MathUtils.clamp(Math.round(Number(save.roundMinutes) || 15), 3, 30);
save.respawnLimit = THREE.MathUtils.clamp(Math.round(Number(save.respawnLimit) || 100), 10, 200);
save.pilotGender = save.pilotGender === 'female' ? 'female' : 'male';
save.pilotName = String(save.pilotName || '').slice(0, 20);
save.weatherEnabled = save.weatherEnabled === true;
save.audioSettings = Object.assign({
  music: 0.7,
  general: 0.75,
  weapons: 0.7
}, save.audioSettings || {});
for (const [group, fallback] of Object.entries({
  music: 0.7,
  general: 0.75,
  weapons: 0.7
})) {
  const value = Number(save.audioSettings[group]);
  save.audioSettings[group] = Number.isFinite(value) ? THREE.MathUtils.clamp(value, 0, 1) : fallback;
}
const audioVolumeDescriptor = Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, 'volume');
const registeredAudio = new Set();
function applyAudioGain(audio) {
  if (!audioVolumeDescriptor?.set) return;
  const gain = save.audioSettings[audio._volumeGroup] ?? 1;
  audioVolumeDescriptor.set.call(audio, Math.max(0, Math.min(1, audio._baseVolume * gain)));
}
function registerAudio(audio, group) {
  const baseVolume = audio.volume;
  audio._volumeGroup = group;
  audio._baseVolume = baseVolume;
  Object.defineProperty(audio, 'volume', {
    configurable: true,
    enumerable: true,
    get() {
      return this._baseVolume;
    },
    set(value) {
      this._baseVolume = Math.max(0, Math.min(1, Number(value) || 0));
      applyAudioGain(this);
    }
  });
  registeredAudio.add(audio);
  applyAudioGain(audio);
  return audio;
}
function applyAudioSettings() {
  for (const audio of registeredAudio) applyAudioGain(audio);
}
const ammoUpgradeLevel = () => Number(activeEconomy().ammo) || 0;
const ammoCapacity = () => 1000 * (ammoUpgradeLevel() + 1);
const persist = () => localStorage.setItem('aces', JSON.stringify(save));
const sel = {
  team: 'blue',
  plane: 'camel',
  map: 'trenches',
  gameMode: save.gameMode,
  squadTeam: save.squadTeam,
  bonanzaMinutes: save.bonanzaMinutes,
  multiplayerOpen: false,
  spawnOnly: false,
  typed: String(save.pilotName || ''),
  pilotGender: save.pilotGender,
  roundMinutes: save.roundMinutes,
  respawnLimit: save.respawnLimit,
  squadSize: Math.max(5, Math.min(MAX_SQUAD_SIZE, Math.round(Number(save.squadSize) || 10)))
};
const roundDuration = () => (sel.gameMode === 'bonanza' ? sel.bonanzaMinutes : sel.roundMinutes) * 60;
const configuredSpawnLimit = () => sel.respawnLimit;
save.onlineBeta = Object.assign({
  sorties: 0,
  aircraftKills: 0,
  blimpKills: 0,
  cashEarned: 0,
  bestStreak: 0,
  missionsCompleted: 0,
  ribbons: [],
  cash: 0,
  owned: ['camel', 'albatros'],
  acc: 0,
  dmg: 0,
  hp: 0,
  ammo: 0,
  armor: 0,
  paint: null
}, save.onlineBeta || {});
save.onlineBeta.ribbons = Array.isArray(save.onlineBeta.ribbons) ? save.onlineBeta.ribbons : [];
save.onlineBeta.cash = Math.max(0, Math.floor(Number(save.onlineBeta.cash) || 0));
save.onlineBeta.owned = Array.isArray(save.onlineBeta.owned) ? [...new Set(save.onlineBeta.owned.filter(id => PLANES.blue.some(plane => plane.id === id) || PLANES.red.some(plane => plane.id === id)))] : ['camel', 'albatros'];
for (const key of ['acc', 'dmg', 'hp', 'armor']) save.onlineBeta[key] = THREE.MathUtils.clamp(Math.floor(Number(save.onlineBeta[key]) || 0), 0, 3);
save.onlineBeta.ammo = THREE.MathUtils.clamp(Math.floor(Number(save.onlineBeta.ammo) || 0), 0, 2);
function activeEconomy() {
  return save;
}
const getSquadTeamColor = (index, economy = activeEconomy()) => {
  const squad = THREE.MathUtils.clamp(Math.floor(Number(index) || 0), 0, 3);
  const customPaint = String(economy?.paint || '');
  return squad === sel.squadTeam && /^#[\da-f]{6}$/i.test(customPaint) ? customPaint : SQUAD_TEAM_COLORS[squad];
};
const localWeatherAvailable = () => true;
// ---------- Renderer ----------
const renderer = new THREE.WebGLRenderer({
  antialias: !save.reducedGraphics
});
const renderPixelRatio = () => Math.min(devicePixelRatio || 1, save.reducedGraphics ? 0.9 : innerWidth <= 800 ? 1.25 : 1.5);
renderer.setPixelRatio(renderPixelRatio());
renderer.setSize(innerWidth, innerHeight);
document.getElementById('game-container').appendChild(renderer.domElement);
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(70, innerWidth / innerHeight, 0.1, save.reducedGraphics ? 1900 : 3000);
let worldFogBase = null;
scene.add(camera);
const shopPreview = new THREE.Group();
shopPreview.visible = false;
shopPreview.position.set(0, -0.6, -19);
camera.add(shopPreview);
const menuPilotPreview = new THREE.Group();
menuPilotPreview.visible = false;
const menuPilotPreviewMaterials = new Set();
let menuPilotModel = null;
let menuPilotFlag = null;
camera.add(menuPilotPreview);
const cockpitJoystick = new THREE.Group();
cockpitJoystick.visible = false;
const cockpitStickMetal = new THREE.MeshBasicMaterial({
  color: 0x4a4135
});
const cockpitStickWood = new THREE.MeshBasicMaterial({
  color: 0x75482a
});
const cockpitStickBase = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.035, 6, 14), cockpitStickMetal);
cockpitStickBase.rotation.x = Math.PI / 2;
cockpitStickBase.position.y = -0.22;
const cockpitStickStem = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.065, 0.62, 8), cockpitStickWood);
cockpitStickStem.position.set(0, 0.08, 0);
const cockpitStickGrip = new THREE.Mesh(new THREE.SphereGeometry(0.12, 9, 7), cockpitStickWood);
cockpitStickGrip.position.set(0, 0.4, 0);
cockpitJoystick.add(cockpitStickBase, cockpitStickStem, cockpitStickGrip);
cockpitJoystick.position.set(0, -0.62, -1.45);
camera.add(cockpitJoystick);
function makeInstrumentFace(label, maxValue, kind) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 256;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, 256, 256);
  ctx.save();
  ctx.beginPath();
  ctx.arc(128, 128, 122, 0, Math.PI * 2);
  ctx.clip();
  ctx.fillStyle = '#d9c99e';
  ctx.fillRect(0, 0, 256, 256);
  ctx.strokeStyle = '#746344';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(128, 128, 116, 0, Math.PI * 2);
  ctx.stroke();
  for (let i = 0; i <= 20; i++) {
    const t = i / 20;
    const angle = (135 + t * 270) * Math.PI / 180;
    const major = i % 5 === 0;
    const inner = major ? 87 : 98;
    const outer = 108;
    ctx.strokeStyle = i === 20 ? '#9b382b' : '#322a1f';
    ctx.lineWidth = major ? 3 : 1.4;
    ctx.beginPath();
    ctx.moveTo(128 + Math.cos(angle) * inner, 128 + Math.sin(angle) * inner);
    ctx.lineTo(128 + Math.cos(angle) * outer, 128 + Math.sin(angle) * outer);
    ctx.stroke();
    if (major && kind !== 'attitude') {
      const value = Math.round(maxValue * t);
      ctx.fillStyle = '#30271c';
      ctx.font = 'bold 15px Georgia, serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(value), 128 + Math.cos(angle) * 72, 128 + Math.sin(angle) * 72);
    }
  }
  ctx.fillStyle = '#382d1e';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = 'bold 15px Georgia, serif';
  ctx.fillText(label, 128, 207);
  ctx.font = '10px Georgia, serif';
  ctx.fillText(kind === 'speed' ? 'KM / H' : kind === 'altitude' ? 'METRES' : 'ARTIFICIAL HORIZON', 128, 224);
  ctx.restore();
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
function makeHorizonTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 256;
  const ctx = canvas.getContext('2d');
  ctx.save();
  ctx.beginPath();
  ctx.arc(128, 128, 126, 0, Math.PI * 2);
  ctx.clip();
  ctx.fillStyle = '#7899a0';
  ctx.fillRect(0, 0, 256, 128);
  ctx.fillStyle = '#b5a078';
  ctx.fillRect(0, 128, 256, 128);
  ctx.fillStyle = '#e0d1ac';
  ctx.fillRect(0, 124, 256, 8);
  ctx.strokeStyle = 'rgba(44,48,43,.75)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(18, 128);
  ctx.lineTo(238, 128);
  ctx.stroke();
  ctx.restore();
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
function makeInstrumentCrackTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 256;
  const ctx = canvas.getContext('2d');
  const impact = {
    x: 151,
    y: 111
  };
  ctx.save();
  ctx.beginPath();
  ctx.arc(128, 128, 126, 0, Math.PI * 2);
  ctx.clip();
  for (let ray = 0; ray < 9; ray++) {
    const angle = ray * Math.PI * 2 / 9 + 0.12;
    let x = impact.x;
    let y = impact.y;
    const steps = 4 + ray % 3;
    ctx.beginPath();
    ctx.moveTo(x, y);
    for (let step = 1; step <= steps; step++) {
      const distance = step * (13 + ray % 3 * 2);
      x = impact.x + Math.cos(angle) * distance + (Math.random() - 0.5) * 8;
      y = impact.y + Math.sin(angle) * distance + (Math.random() - 0.5) * 8;
      ctx.lineTo(x, y);
      if (step === 2 && ray % 2 === 0) {
        const bx = x + Math.cos(angle + 0.8) * 17;
        const by = y + Math.sin(angle + 0.8) * 17;
        ctx.moveTo(x, y);
        ctx.lineTo(bx, by);
        ctx.moveTo(x, y);
      }
    }
    ctx.strokeStyle = 'rgba(43,34,26,.76)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.strokeStyle = 'rgba(255,247,222,.72)';
    ctx.lineWidth = 0.8;
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.arc(impact.x, impact.y, 3, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(45,35,25,.75)';
  ctx.fill();
  ctx.restore();
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
const instrumentTextures = {
  speed: makeInstrumentFace('AIR SPEED', 240, 'speed'),
  altitude: makeInstrumentFace('ALTITUDE', 3000, 'altitude'),
  attitude: makeInstrumentFace('GYRO', 1, 'attitude'),
  horizon: makeHorizonTexture(),
  cracks: makeInstrumentCrackTexture()
};
const instrumentNeedleShape = new THREE.Shape();
instrumentNeedleShape.moveTo(-0.012, -0.025);
instrumentNeedleShape.lineTo(-0.008, 0.105);
instrumentNeedleShape.lineTo(0, 0.132);
instrumentNeedleShape.lineTo(0.008, 0.105);
instrumentNeedleShape.lineTo(0.012, -0.025);
instrumentNeedleShape.closePath();
const instrumentNeedleGeometry = new THREE.ShapeGeometry(instrumentNeedleShape);
const instrumentFaceGeometry = new THREE.CircleGeometry(0.158, 40);
const instrumentGlassGeometry = new THREE.CircleGeometry(0.151, 40);
function createFlightInstrumentPack(parent, position, scale = 1, screenMounted = false) {
  const pack = new THREE.Group();
  pack.position.copy(position);
  pack.scale.setScalar(scale);
  parent.add(pack);
  const material = (color, extra = {}) => new THREE.MeshBasicMaterial({
    color,
    depthTest: !screenMounted,
    depthWrite: !screenMounted,
    toneMapped: false,
    ...extra
  });
  const panel = new THREE.Mesh(new THREE.BoxGeometry(1.36, 0.49, 0.09), material(0x503821));
  panel.position.z = -0.045;
  pack.add(panel);
  const brass = material(0xb28d51);
  const darkBrass = material(0x59452a);
  const screwGeo = new THREE.SphereGeometry(0.016, 8, 6);
  for (const x of [-0.63, 0.63]) {
    for (const y of [-0.19, 0.19]) {
      const screw = new THREE.Mesh(screwGeo, brass);
      screw.position.set(x, y, 0.012);
      pack.add(screw);
    }
  }
  const instruments = {};
  const definitions = [{
    key: 'speed',
    x: -0.43,
    max: 240
  }, {
    key: 'attitude',
    x: 0,
    max: 1
  }, {
    key: 'altitude',
    x: 0.43,
    max: 3000
  }];
  for (const definition of definitions) {
    const gauge = new THREE.Group();
    gauge.position.set(definition.x, 0, 0.02);
    pack.add(gauge);
    const outer = new THREE.Mesh(new THREE.TorusGeometry(0.171, 0.021, 8, 36), brass);
    gauge.add(outer);
    const inner = new THREE.Mesh(new THREE.TorusGeometry(0.151, 0.006, 6, 32), darkBrass);
    inner.position.z = 0.012;
    gauge.add(inner);
    const face = new THREE.Mesh(instrumentFaceGeometry, material(0xffffff, {
      map: instrumentTextures[definition.key]
    }));
    face.position.z = 0.009;
    gauge.add(face);
    let horizon = null;
    let needle = null;
    if (definition.key === 'attitude') {
      horizon = new THREE.Group();
      horizon.position.set(0, 0, 0.02);
      const horizonDisc = new THREE.Mesh(new THREE.CircleGeometry(0.112, 36), material(0xffffff, {
        map: instrumentTextures.horizon
      }));
      horizonDisc.position.z = 0.014;
      horizon.add(horizonDisc);
      gauge.add(horizon);
    } else {
      needle = new THREE.Group();
      const pointer = new THREE.Mesh(instrumentNeedleGeometry, material(0x9b3527, {
        side: THREE.DoubleSide
      }));
      pointer.position.z = 0.035;
      needle.add(pointer);
      gauge.add(needle);
    }
    const hub = new THREE.Mesh(new THREE.CircleGeometry(0.019, 14), material(0xb28d51));
    hub.position.z = 0.044;
    gauge.add(hub);
    const cracks = new THREE.Mesh(instrumentGlassGeometry, material(0xffffff, {
      map: instrumentTextures.cracks,
      transparent: true,
      opacity: 0.96,
      depthWrite: false,
      side: THREE.DoubleSide
    }));
    cracks.position.z = 0.052;
    cracks.visible = false;
    gauge.add(cracks);
    if (screenMounted) gauge.traverse(object => {
      object.renderOrder = 20;
    });
    instruments[definition.key] = {
      gauge,
      needle,
      horizon,
      cracks,
      max: definition.max
    };
  }
  if (screenMounted) pack.traverse(object => {
    object.renderOrder = 20;
  });
  return {
    group: pack,
    instruments
  };
}
function updateFlightInstrumentPack(pack, aircraft, cracked) {
  if (!pack || !aircraft) return;
  const airspeed = Math.max(0, aircraft.speed || 0) * 3.6;
  const altitude = Math.max(0, aircraft.g.position.y);
  const attitude = new THREE.Euler().setFromQuaternion(aircraft.g.quaternion, 'YXZ');
  for (const instrument of Object.values(pack.instruments)) instrument.cracks.visible = cracked;
  const speedGauge = pack.instruments.speed;
  speedGauge.needle.rotation.z = THREE.MathUtils.degToRad(135 - 270 * THREE.MathUtils.clamp(airspeed / speedGauge.max, 0, 1));
  const altitudeGauge = pack.instruments.altitude;
  altitudeGauge.needle.rotation.z = THREE.MathUtils.degToRad(135 - 270 * THREE.MathUtils.clamp(altitude / altitudeGauge.max, 0, 1));
  const gyro = pack.instruments.attitude.horizon;
  gyro.rotation.z = -attitude.z;
  gyro.position.y = THREE.MathUtils.clamp(-attitude.x * 0.22, -0.105, 0.105);
}
const hemisphere = new THREE.HemisphereLight(0xdfe8f0, 0x4a4030, 1.6);
scene.add(hemisphere);
const sun = new THREE.DirectionalLight(0xfff0d0, 1.8);
scene.add(sun);
const daySunColor = new THREE.Color(0xfff0d0);
const sunsetSunColor = new THREE.Color(0xff8652);
const daySkyColor = new THREE.Color(0xa8a898);
const sunsetSkyColor = new THREE.Color(0xf28a68);
const dayHemiSky = new THREE.Color(0xdfe8f0);
const sunsetHemiSky = new THREE.Color(0xf1a078);
const dayHemiGround = new THREE.Color(0x4a4030);
const sunsetHemiGround = new THREE.Color(0x594039);
const sunDiscDayColor = new THREE.Color(0xfff2cc);
const sunDiscSunsetColor = new THREE.Color(0xff733d);
const sunGlowDayColor = new THREE.Color(0xffe0a7);
const sunGlowSunsetColor = new THREE.Color(0xff8a50);
const sunHigh = new THREE.Vector3(-500, 1000, -1700);
const sunHorizon = new THREE.Vector3(700, 75, -1700);

// A lightweight painted sky dome shifts from cool daylight to a layered amber dusk.
const skyCanvas = document.createElement('canvas');
skyCanvas.width = 8;
skyCanvas.height = 256;
const skyContext = skyCanvas.getContext('2d');
const skyTexture = new THREE.CanvasTexture(skyCanvas);
skyTexture.colorSpace = THREE.SRGBColorSpace;
const skyDayStops = ['#718d9c', '#9bb4bd', '#ddd0b5', '#c7c0b1', '#687981'];
const skySunsetStops = ['#403852', '#865361', '#ffb16f', '#df7965', '#59495f'];
const skyStopPositions = [0, 0.34, 0.49, 0.53, 1];
function blendHex(a, b, t) {
  const channel = i => Math.round(parseInt(a.slice(i, i + 2), 16) * (1 - t) + parseInt(b.slice(i, i + 2), 16) * t);
  return `rgb(${channel(1)}, ${channel(3)}, ${channel(5)})`;
}
function drawSkyGradient(progress) {
  const gradient = skyContext.createLinearGradient(0, 0, 0, skyCanvas.height);
  for (let i = 0; i < skyStopPositions.length; i++) {
    gradient.addColorStop(skyStopPositions[i], blendHex(skyDayStops[i], skySunsetStops[i], progress));
  }
  skyContext.fillStyle = gradient;
  skyContext.fillRect(0, 0, skyCanvas.width, skyCanvas.height);
  skyTexture.needsUpdate = true;
}
drawSkyGradient(0);
const skyDome = new THREE.Mesh(new THREE.SphereGeometry(2900, 32, 20), new THREE.MeshBasicMaterial({
  map: skyTexture,
  side: THREE.BackSide,
  depthWrite: false,
  depthTest: false,
  fog: false,
  toneMapped: false
}));
skyDome.renderOrder = -1000;
scene.add(skyDome);
const sunVisual = new THREE.Group();
const sunDiscMaterial = new THREE.MeshBasicMaterial({
  color: 0xfff2cc,
  fog: false,
  toneMapped: false
});
const sunDisc = new THREE.Mesh(new THREE.SphereGeometry(34, 24, 16), sunDiscMaterial);
const glowCanvas = document.createElement('canvas');
glowCanvas.width = glowCanvas.height = 128;
const glowContext = glowCanvas.getContext('2d');
const sunGlowGradient = glowContext.createRadialGradient(64, 64, 6, 64, 64, 64);
sunGlowGradient.addColorStop(0, 'rgba(255,235,190,0.75)');
sunGlowGradient.addColorStop(0.25, 'rgba(255,194,132,0.35)');
sunGlowGradient.addColorStop(1, 'rgba(255,155,100,0)');
glowContext.fillStyle = sunGlowGradient;
glowContext.fillRect(0, 0, 128, 128);
const sunGlowTexture = new THREE.CanvasTexture(glowCanvas);
sunGlowTexture.colorSpace = THREE.SRGBColorSpace;
const sunGlowMaterial = new THREE.SpriteMaterial({
  map: sunGlowTexture,
  color: 0xffe0a7,
  transparent: true,
  opacity: 0.35,
  depthWrite: false,
  fog: false,
  toneMapped: false
});
const sunGlow = new THREE.Sprite(sunGlowMaterial);
sunGlow.scale.set(420, 420, 1);
sunVisual.add(sunGlow, sunDisc);
scene.add(sunVisual);
function updateDaylight() {
  const elapsed = Math.max(0, roundDuration() - roundT);
  const progress = THREE.MathUtils.clamp(elapsed / Math.min(DAYLIGHT_DURATION, roundDuration()), 0, 1);
  sun.position.lerpVectors(sunHigh, sunHorizon, progress);
  sunVisual.position.copy(sun.position);
  sun.color.copy(daySunColor).lerp(sunsetSunColor, progress);
  sun.intensity = THREE.MathUtils.lerp(1.8, 0.72, progress);
  hemisphere.color.copy(dayHemiSky).lerp(sunsetHemiSky, progress);
  hemisphere.groundColor.copy(dayHemiGround).lerp(sunsetHemiGround, progress);
  hemisphere.intensity = THREE.MathUtils.lerp(1.6, 0.95, progress);
  scene.background.copy(daySkyColor).lerp(sunsetSkyColor, progress);
  if (scene.fog) scene.fog.color.copy(scene.background);
  sunDiscMaterial.color.copy(sunDiscDayColor).lerp(sunDiscSunsetColor, progress);
  sunGlowMaterial.color.copy(sunGlowDayColor).lerp(sunGlowSunsetColor, progress);
  sunGlowMaterial.opacity = THREE.MathUtils.lerp(0.28, 0.65, progress);
  skyDome.position.copy(camera.position);
  const gradientStage = Math.round(progress * 100);
  if (gradientStage !== updateDaylight.gradientStage) {
    drawSkyGradient(gradientStage / 100);
    updateDaylight.gradientStage = gradientStage;
  }
}
updateDaylight.gradientStage = -1;
function applyRenderQuality() {
  const reduced = !!save.reducedGraphics;
  renderer.setPixelRatio(renderPixelRatio());
  camera.far = reduced ? 1900 : 3000;
  camera.updateProjectionMatrix();
  skyDome.scale.setScalar(reduced ? 0.62 : 1);
  if (scene.fog && worldFogBase) {
    scene.fog.near = worldFogBase.near * (reduced ? 0.78 : 1);
    scene.fog.far = worldFogBase.far * (reduced ? 0.78 : 1);
  }
}
function setWorldFog(color, near, far) {
  worldFogBase = {
    near,
    far
  };
  scene.fog = new THREE.Fog(color, near, far);
  applyRenderQuality();
}
applyRenderQuality();
addEventListener('resize', () => {
  applyRenderQuality();
  renderer.setSize(innerWidth, innerHeight);
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
});

// ---------- Audio ----------
// A single continuous rotary loop keeps the motor tone coherent; subtle rate changes
// convey climb and descent without cross-fading between mismatched recordings.
const engine = registerAudio(new Audio('assets/audio/engine-loop.mp3'), 'general');
const engineSputter = registerAudio(new Audio('assets/audio/damaged-engine-sputter.mp3'), 'general');
const engineStartup = registerAudio(new Audio('assets/audio/rotary-engine-start.mp3'), 'general');
const footsteps = registerAudio(new Audio('assets/audio/pilot-footsteps.mp3'), 'general');
const fieldGramophones = {
  blue: registerAudio(new Audio('assets/audio/blue-english-military-drums-loop.mp3'), 'music'),
  red: registerAudio(new Audio('assets/audio/red-german-field-march.mp3'), 'music')
};
const welcomeMusic = registerAudio(new Audio('assets/audio/welcome-battle-drums-long-loop-v125.mp3'), 'music');
const welcomeBattlefield = registerAudio(new Audio('assets/audio/welcome-low-wwi-battlefield-bed.mp3'), 'music');
for (const gramophone of Object.values(fieldGramophones)) {
  gramophone.loop = true;
  gramophone.preload = 'auto';
  gramophone.volume = 0;
}
for (const track of [welcomeMusic, welcomeBattlefield]) {
  track.loop = true;
  track.preload = 'auto';
  track.volume = 0;
}
let titleAudioUnlocked = false;
let fieldGramophoneUnlocked = false;
engine.loop = true;
engine.volume = 0.4;
engineSputter.volume = 0.26;
engineStartup.volume = 0.48;
footsteps.volume = 0.22;
footsteps.loop = true;
const nearbyEngineVoices = Array.from({
  length: 4
}, () => {
  const voice = registerAudio(new Audio('assets/audio/engine-loop.mp3'), 'general');
  voice.loop = true;
  voice.volume = 0;
  return voice;
});
const npcGunVoices = Array.from({
  length: 6
}, () => {
  const voice = registerAudio(new Audio('assets/audio/rounded-vickers-gun-burst.mp3'), 'weapons');
  voice.preload = 'auto';
  voice.volume = 0;
  return voice;
});
const explosionAudioState = {
  lastAt: 0
};
let engineOn = false;
let engineSputtering = false;
let nearbyEngineScanT = 0;
let nearbyEngineCache = [];
let engineSputterTimer = null;
let enginePreviousY = null;
let engineFailureT = 0;
let muted = false;
let actx = null;
function startEngineAudio() {
  if (muted) return;
  const ignition = !engineOn;
  engineOn = true;
  if (ignition) {
    engineStartup.currentTime = 0;
    engineStartup.play().catch(() => {});
  }
  if (engine.paused) engine.play().catch(() => {});
  if (player && (player.dying || player.wingFailure)) startEngineSputter();
}
function stopEngineAudio() {
  engineOn = false;
  engineSputtering = false;
  cancelGameplayTimeout(engineSputterTimer);
  engineSputterTimer = null;
  engine.pause();
  engineSputter.pause();
  engineStartup.pause();
  engineStartup.currentTime = 0;
  engineSputter.currentTime = 0;
  enginePreviousY = null;
}
function startEngineSputter() {
  if (engineSputtering || muted || !engineOn) return;
  engineSputtering = true;
  engineFailureT = 0;
  const sputter = () => {
    if (!engineSputtering || muted || !engineOn) return;
    engineSputter.currentTime = 0;
    engineSputter.play().catch(() => {});
    engineSputterTimer = scheduleGameplayTimeout(sputter, 3200 + Math.random() * 1800);
  };
  sputter();
}
function updateEngineAudio(dt) {
  const listener = camera.position;
  nearbyEngineScanT -= dt;
  if (nearbyEngineScanT <= 0) {
    nearbyEngineScanT = 0.18;
    nearbyEngineCache = planes.filter(p => p !== player && p.bot && !p.dying && p.g.visible).map(p => ({
      p,
      d2: p.g.position.distanceToSquared(listener)
    })).filter(item => item.d2 < 260 * 260).sort((a, b) => a.d2 - b.d2).slice(0, nearbyEngineVoices.length).map(item => item.p);
  }
  const closeAircraft = nearbyEngineCache.filter(p => !p.dying && p.g.visible).map(p => ({
    p,
    d: p.g.position.distanceTo(listener)
  }));
  nearbyEngineVoices.forEach((voice, index) => {
    const aircraft = closeAircraft[index];
    if (muted || !aircraft) {
      voice.pause();
      voice._plane = null;
      voice.volume = 0;
      return;
    }
    if (voice._plane !== aircraft.p) {
      voice.pause();
      voice.currentTime = 0;
      voice._plane = aircraft.p;
    }
    voice.volume = Math.max(0, Math.min(1, 0.2 * (1 - aircraft.d / 260) ** 1.4));
    voice.playbackRate = THREE.MathUtils.clamp(0.9 + (aircraft.p.speed || 0) / 500, 0.9, 1.08);
    if (voice.paused) voice.play().catch(() => {});
  });
  if (!engineOn || muted || !player || !['preflight', 'taxi', 'takeoff', 'fly', 'shotdown', 'shotdown2'].includes(mode)) return;
  const engineFailing = player.dying || player.wingFailure;
  if (engineFailing) {
    startEngineSputter();
    engineFailureT += dt;
    if (engineFailureT > 4.5) {
      stopEngineAudio();
      return;
    }
  }
  const y = player.g.position.y;
  const climbRate = enginePreviousY === null ? 0 : (y - enginePreviousY) / Math.max(dt, 0.001);
  enginePreviousY = y;
  const choke = engineFailing ? Math.sin(engineFailureT * 10.5) * 0.17 + Math.sin(engineFailureT * 4.1) * 0.08 : 0;
  const targetRate = engineFailing ? THREE.MathUtils.clamp(0.78 + choke, 0.58, 0.98) : climbRate > 2 ? 0.95 : climbRate < -2 ? 1.05 : 1;
  engine.playbackRate = THREE.MathUtils.damp(engine.playbackRate || 1, targetRate, engineFailing ? 6 : 2.6, dt);
  const fade = engineFailing ? Math.max(0, 1 - engineFailureT / 4.5) : 1;
  const level = engineFailing ? 0.3 * fade * (0.42 + 0.58 * Math.max(0, Math.sin(engineFailureT * 11))) : 0.4;
  engine.volume = Math.max(0, Math.min(1, THREE.MathUtils.damp(engine.volume, level, engineFailing ? 6 : 2.5, dt)));
  if (engineFailing) engineSputter.volume = Math.max(0, Math.min(1, 0.22 * fade));
}
function updateWelcomeAudio() {
  const active = titleAudioUnlocked && !muted && !paused && mode === 'menu';
  if (!active) {
    for (const track of [welcomeMusic, welcomeBattlefield]) {
      track.volume = 0;
      if (!track.paused) track.pause();
    }
    return;
  }
  welcomeMusic.volume = 0.15;
  welcomeBattlefield.volume = 0.075;
  if (welcomeMusic.paused) welcomeMusic.play().catch(() => {});
  if (welcomeBattlefield.paused) welcomeBattlefield.play().catch(() => {});
}
function unlockFieldGramophone() {
  fieldGramophoneUnlocked = true;
  titleAudioUnlocked = true;
  updateWelcomeAudio();
  updateFieldGramophone(0.016);
}
addEventListener('pointerdown', unlockFieldGramophone, {
  once: true,
  passive: true
});
addEventListener('keydown', unlockFieldGramophone, {
  once: true
});
function stopFieldGramophones() {
  for (const gramophone of Object.values(fieldGramophones)) {
    gramophone.volume = 0;
    if (!gramophone.paused) gramophone.pause();
  }
}
function updateFieldGramophone(dt) {
  let nearestSource = null;
  let nearestDistance = Infinity;
  for (const source of gramophoneSources) {
    const distance = camera.position.distanceTo(source.position);
    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearestSource = source;
    }
  }
  if (muted || paused || !fieldGramophoneUnlocked || ['menu', 'over'].includes(mode) || nearestDistance >= 100) {
    stopFieldGramophones();
    return;
  }
  const level = 0.16 * Math.pow(1 - nearestDistance / 100, 1.35);
  for (const [team, gramophone] of Object.entries(fieldGramophones)) {
    const target = team === nearestSource.team ? level : 0;
    gramophone.volume = Math.max(0, Math.min(1, THREE.MathUtils.damp(gramophone.volume, target, 3.4, dt)));
    if (target > 0 && gramophone.paused) gramophone.play().catch(() => {});else if (target === 0 && gramophone.volume < 0.003 && !gramophone.paused) gramophone.pause();
  }
}
const playerGunVoices = Array.from({
  length: 4
}, () => {
  const voice = registerAudio(new Audio('assets/audio/rounded-vickers-gun-burst.mp3'), 'weapons');
  voice.preload = 'auto';
  voice.volume = 0;
  return voice;
});
const truckEngine = registerAudio(new Audio('assets/audio/truck-idle-loop.mp3'), 'general');
truckEngine.loop = true;
truckEngine.volume = 0.11;
const woodenDoor = registerAudio(new Audio('assets/audio/old-wooden-door.mp3'), 'general');
woodenDoor.volume = 0.28;
function startTruckAudio() {
  if (muted) return;
  truckEngine.volume = 0.11;
  if (truckEngine.paused) truckEngine.play().catch(() => {});
}
function stopTruckAudio() {
  truckEngine.pause();
  truckEngine.currentTime = 0;
}
function updateFootstepAudio(isWalking) {
  if (muted || !isWalking) {
    if (!footsteps.paused) {
      footsteps.pause();
      footsteps.currentTime = 0;
    }
    return;
  }
  if (footsteps.paused) footsteps.play().catch(() => {});
}
function playDoorSound() {
  if (muted) return;
  woodenDoor.currentTime = 0;
  woodenDoor.play().catch(() => {});
}
function playOneGunShot(voices, volume, rate = 1) {
  if (muted) return;
  const voice = voices.find(item => item.paused || item.ended) || voices[0];
  voice.pause();
  voice.currentTime = 0;
  voice.playbackRate = rate;
  voice.volume = Math.max(0, Math.min(1, volume));
  voice.play().catch(() => {});
}
function shotSound() {
  playOneGunShot(playerGunVoices, 0.1, 0.95 + Math.random() * 0.12);
}
function playNpcGunSound(plane) {
  const distance = plane?.g?.position.distanceTo(camera.position);
  if (muted || !plane?.bot || !Number.isFinite(distance) || distance > 230) return;
  const volume = 0.035 * Math.pow(1 - distance / 230, 1.7);
  playOneGunShot(npcGunVoices, volume, 0.96 + Math.random() * 0.12);
}
function playExplosionSound(position) {
  if (muted || camera.position.distanceTo(position) > 440) return;
  const now = performance.now();
  if (now - explosionAudioState.lastAt < 340) return;
  explosionAudioState.lastAt = now;
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    if (actx.state === 'suspended') actx.resume().catch(() => {});
    const distanceGain = 1 - camera.position.distanceTo(position) / 440;
    const duration = 0.48;
    const buffer = actx.createBuffer(1, Math.floor(actx.sampleRate * duration), actx.sampleRate);
    const samples = buffer.getChannelData(0);
    for (let i = 0; i < samples.length; i++) samples[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / samples.length, 1.8);
    const noise = actx.createBufferSource();
    noise.buffer = buffer;
    const lowPass = actx.createBiquadFilter();
    lowPass.type = 'lowpass';
    lowPass.frequency.setValueAtTime(1100 + Math.random() * 500, actx.currentTime);
    const noiseGain = actx.createGain();
    noiseGain.gain.setValueAtTime(0.32 * distanceGain * save.audioSettings.general, actx.currentTime);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + duration);
    noise.connect(lowPass).connect(noiseGain).connect(actx.destination);
    noise.start();
    const thump = actx.createOscillator();
    const thumpGain = actx.createGain();
    thump.type = 'sine';
    thump.frequency.setValueAtTime(90 + Math.random() * 20, actx.currentTime);
    thump.frequency.exponentialRampToValueAtTime(42, actx.currentTime + 0.22);
    thumpGain.gain.setValueAtTime(0.36 * distanceGain * save.audioSettings.general, actx.currentTime);
    thumpGain.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + 0.34);
    thump.connect(thumpGain).connect(actx.destination);
    thump.start();
    thump.stop(actx.currentTime + 0.36);
  } catch (error) {
    // Audio can be unavailable until the first browser gesture; gameplay remains unaffected.
  }
}
// ---------- Title clouds & flashes ----------
const titleFx = new THREE.Group();
scene.add(titleFx);
const titleBomberFormation = new THREE.Group();
titleFx.add(titleBomberFormation);
const titleBombers = [];
const cc = document.createElement('canvas');
cc.width = cc.height = 128;
const cx = cc.getContext('2d');
const grd = cx.createRadialGradient(64, 64, 0, 64, 64, 64);
grd.addColorStop(0, 'rgba(255,255,255,0.9)');
grd.addColorStop(1, 'rgba(255,255,255,0)');
cx.fillStyle = grd;
cx.fillRect(0, 0, 128, 128);
const cloudTex = new THREE.CanvasTexture(cc);
const titleClouds = [];
const cloudBanks = Array.from({
  length: 9
}, () => new THREE.Vector3((Math.random() - 0.5) * 1550, 235 + Math.random() * 145, (Math.random() - 0.5) * 1550));
for (let i = 0; i < 92; i++) {
  const clustered = Math.random() < 0.78;
  const anchor = clustered ? cloudBanks[Math.floor(Math.random() * cloudBanks.length)] : null;
  const s = new THREE.Sprite(new THREE.SpriteMaterial({
    map: cloudTex,
    color: Math.random() < 0.24 ? 0xc4c7c8 : 0xe8e8e4,
    transparent: true,
    opacity: 0.16 + Math.random() * 0.2,
    depthWrite: false,
    fog: false
  }));
  s.position.set((anchor?.x || 0) + (anchor ? (Math.random() - 0.5) * 280 : (Math.random() - 0.5) * 1900), (anchor?.y || 250) + (anchor ? (Math.random() - 0.5) * 55 : Math.random() * 160), (anchor?.z || 0) + (anchor ? (Math.random() - 0.5) * 260 : (Math.random() - 0.5) * 1900));
  s.scale.set(120 + Math.random() * 190, 70 + Math.random() * 110, 1);
  s.userData.drift = 0.5 + Math.random() * 1.3;
  titleClouds.push(s);
  titleFx.add(s);
}
const flashes = [];
for (let i = 0; i < 8; i++) {
  const l = new THREE.PointLight(0xffa040, 0, 500, 1);
  titleFx.add(l);
  flashes.push(l);
}

// ---------- Terrain ----------
const groundTex = new THREE.TextureLoader().load('assets/ground-tile.webp');
groundTex.colorSpace = THREE.SRGBColorSpace;
groundTex.wrapS = groundTex.wrapT = THREE.RepeatWrapping;
groundTex.repeat.set(120, 120);
const fjordGroundTex = new THREE.TextureLoader().load('assets/fjord-alpine-terrain.webp');
fjordGroundTex.colorSpace = THREE.SRGBColorSpace;
fjordGroundTex.wrapS = fjordGroundTex.wrapT = THREE.RepeatWrapping;
fjordGroundTex.repeat.set(64, 64);
const runwayTex = (() => {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 512;
  const x = c.getContext('2d');
  x.fillStyle = '#76684f';
  x.fillRect(0, 0, c.width, c.height);
  for (let i = 0; i < 2300; i++) {
    const shade = Math.random() < 0.5 ? 38 : -34;
    const base = Math.floor(112 + shade + Math.random() * 25);
    x.fillStyle = `rgba(${base},${base - 12},${base - 28},${0.08 + Math.random() * 0.22})`;
    const w = 1 + Math.random() * 5;
    const h = 1 + Math.random() * 4;
    x.fillRect(Math.random() * c.width, Math.random() * c.height, w, h);
  }
  x.fillStyle = 'rgba(47,39,30,0.22)';
  x.fillRect(71, 0, 5, c.height);
  x.fillRect(180, 0, 5, c.height);
  x.fillStyle = 'rgba(38,32,25,0.12)';
  x.fillRect(77, 0, 2, c.height);
  x.fillRect(177, 0, 2, c.height);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(1.2, 1);
  return t;
})();
const runwayMat = new THREE.MeshLambertMaterial({
  map: runwayTex,
  color: 0xb3a589
});
const runwayShoulderMat = new THREE.MeshLambertMaterial({
  color: 0x60543e
});
const FIELDS = {
  trenches: [{
    name: 'Bertangles Aerodrome',
    team: 'blue',
    x: -600,
    z: -250
  }, {
    name: 'Vert Galant Field',
    team: 'blue',
    x: -600,
    z: 250
  }, {
    name: 'Douai Jasta Field',
    team: 'red',
    x: 600,
    z: -250
  }, {
    name: 'Marcke Aerodrome',
    team: 'red',
    x: 600,
    z: 250
  }, {
    name: 'Allied Rear Reserve',
    team: 'blue',
    x: -1450,
    z: 950,
    rear: true
  }, {
    name: 'Central Rear Reserve',
    team: 'red',
    x: 1450,
    z: 950,
    rear: true
  }],
  stranda: [{
    name: 'Stranda Village Field',
    team: 'blue',
    x: -400,
    z: 200
  }, {
    name: 'Liabygda Shelf',
    team: 'blue',
    x: -400,
    z: -200
  }, {
    name: 'Geiranger Ridge Station',
    team: 'red',
    x: 900,
    z: 640
  }, {
    name: 'Sylte Mountain Field',
    team: 'red',
    x: 900,
    z: -640
  }, {
    name: 'Western Fjord Reserve',
    team: 'blue',
    x: -1200,
    z: -105,
    rear: true
  }, {
    name: 'Eastern Fjord Reserve',
    team: 'red',
    x: 1200,
    z: 105,
    rear: true
  }],
  bedroom: [{
    name: 'Aurelian Bedhead Base',
    team: 'blue',
    x: -330,
    z: 180
  }, {
    name: 'Vesperian Desk Squadron',
    team: 'red',
    x: 260,
    z: -125
  }]
};
const fieldAvailableToPlayer = field => !!field && !field.disabled && (['bonanza', 'squadbattle'].includes(sel.gameMode) || field.team === sel.team);
let CRATERS = [];
let factorySmokeSources = [];
let industrialSites = [];
let industrialDamageState = Object.create(null);
let airfieldDamageSources = [];
function addCitySmokeSource(x, z, rise = 18) {
  factorySmokeSources.push({
    position: new THREE.Vector3(x, heightAt(x, z) + rise, z),
    timer: Math.random() * 1.8,
    citySmoke: true
  });
}
function trenchLines() {
  const segs = [];
  for (const bx of [-140, -90, 90, 140]) {
    let px = null;
    let pz = 0;
    for (let z = -1100; z <= 1100; z += 12) {
      const x = bx + Math.sin(z * 0.01 + bx) * 15 + (Math.floor(z / 12) % 2 ? 4 : -4);
      if (px !== null) {
        const mx = (px + x) * 0.5;
        const mz = (pz + z) * 0.5;
        if (riverDistance(mx, mz) > 78) segs.push([px, pz, x, z]);
      }
      px = x;
      pz = z;
    }
  }
  for (let z = -1000; z <= 1000; z += 160) {
    for (const s of [-1, 1]) {
      const ax = s * 90;
      const bx = s * 140;
      if (riverDistance((ax + bx) * 0.5, z + 15) > 78) segs.push([ax, z, bx, z + 30]);
    }
  }
  return segs;
}
const craterTex = (() => {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const x = c.getContext('2d');
  const gr = x.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, 'rgba(30,26,22,1)');
  gr.addColorStop(0.55, 'rgba(60,52,44,0.95)');
  gr.addColorStop(0.75, 'rgba(140,128,110,0.8)');
  gr.addColorStop(1, 'rgba(120,110,95,0)');
  x.fillStyle = gr;
  x.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(x.canvas);
})();
function makeCraterGeometry() {
  const rings = [0.025, 0.24, 0.46, 0.68, 0.88, 1.12];
  const heights = [0.015, 0.025, 0.08, 0.62, 0.28, 0.025];
  const shades = [[0.19, 0.17, 0.14], [0.25, 0.22, 0.18], [0.34, 0.29, 0.23], [0.49, 0.42, 0.32], [0.37, 0.34, 0.27], [0.30, 0.29, 0.23]];
  const positions = [];
  const colors = [];
  const indices = [];
  const steps = 28;
  for (let r = 0; r < rings.length; r++) {
    for (let i = 0; i < steps; i++) {
      const a = i / steps * Math.PI * 2;
      const irregular = 1 + Math.sin(a * 5 + 0.4) * 0.065 + Math.cos(a * 9 - 0.7) * 0.035;
      const rr = rings[r] * irregular;
      positions.push(Math.cos(a) * rr, Math.sin(a) * rr, heights[r] + Math.sin(a * 3 + r) * (r === 3 ? 0.08 : 0.018));
      const shade = 0.88 + Math.sin(a * 4 + r * 2) * 0.09 + Math.random() * 0.08;
      colors.push(shades[r][0] * shade, shades[r][1] * shade, shades[r][2] * shade);
    }
  }
  for (let r = 0; r < rings.length - 1; r++) {
    for (let i = 0; i < steps; i++) {
      const a = r * steps + i;
      const b = r * steps + (i + 1) % steps;
      const c = (r + 1) * steps + i;
      const d = (r + 1) * steps + (i + 1) % steps;
      indices.push(a, c, b, b, c, d);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}
function buildTrenches() {
  const segs = trenchLines();
  const dummy = new THREE.Object3D();
  const mk = (color, w, h, y) => {
    const im = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshLambertMaterial({
      color
    }), segs.length);
    segs.forEach((s, i) => {
      const mx = (s[0] + s[2]) / 2;
      const mz = (s[1] + s[3]) / 2;
      dummy.position.set(mx, heightAt(mx, mz) + y, mz);
      dummy.rotation.set(0, Math.atan2(s[2] - s[0], s[3] - s[1]), 0);
      dummy.scale.set(w, h, Math.hypot(s[2] - s[0], s[3] - s[1]) + w);
      dummy.updateMatrix();
      im.setMatrixAt(i, dummy.matrix);
    });
    im.instanceMatrix.needsUpdate = true;
    world.add(im);
  };
  mk(0x786b58, 7.2, 0.72, 0.12);
  mk(0x25221d, 3.8, 0.8, 0.28);

  // Layered, staggered sandbags make the zig-zag traverses read as excavated works.
  const bagSpots = [];
  for (const bx of [-140, -90, 90, 140]) {
    for (let z = -1080; z <= 1080; z += 18) {
      const x = bx + Math.sin(z * 0.01 + bx) * 15 + (Math.floor(z / 12) % 2 ? 4 : -4);
      for (let row = 0; row < 2; row++) bagSpots.push({
        x: x + (row ? 2 : -2),
        z: z + row * 7,
        row
      });
    }
  }
  const bags = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 8, 6), new THREE.MeshLambertMaterial({
    color: 0x9a8b6d
  }), bagSpots.length);
  bagSpots.forEach((b, i) => {
    dummy.position.set(b.x, heightAt(b.x, b.z) + 0.28 + b.row * 0.52, b.z);
    dummy.rotation.set(0, 0.025 * Math.sin(b.z * 0.08), 0);
    dummy.scale.set(0.78, 0.48, 1.32);
    dummy.updateMatrix();
    bags.setMatrixAt(i, dummy.matrix);
    const shade = 0.78 + Math.random() * 0.42;
    bags.setColorAt(i, new THREE.Color(0.72 * shade, 0.64 * shade, 0.49 * shade));
  });
  bags.instanceMatrix.needsUpdate = true;
  world.add(bags);
  CRATERS = [];
  for (let i = 0; i < 700; i++) {
    let x = 0;
    let z = 0;
    let attempts = 0;
    do {
      x = i < 420 ? (Math.random() - 0.5) * 320 : (Math.random() - 0.5) * 2400;
      z = (Math.random() - 0.5) * 2000;
    } while (riverDistance(x, z) < 78 && ++attempts < 24);
    if (riverDistance(x, z) < 78) continue;
    CRATERS.push({
      x,
      z,
      r: 5 + Math.random() * 13
    });
  }
  const craterMesh = new THREE.InstancedMesh(makeCraterGeometry(), new THREE.MeshLambertMaterial({
    vertexColors: true,
    side: THREE.DoubleSide
  }), CRATERS.length);
  CRATERS.forEach((c, i) => {
    dummy.position.set(c.x, heightAt(c.x, c.z) + 0.035, c.z);
    dummy.rotation.set(-Math.PI / 2, 0, Math.random() * Math.PI * 2);
    dummy.scale.set(c.r, c.r, 1);
    dummy.updateMatrix();
    craterMesh.setMatrixAt(i, dummy.matrix);
  });
  craterMesh.instanceMatrix.needsUpdate = true;
  world.add(craterMesh);
  buildTrenchSoldiers();
}
const soldierGeo = {
  torso: new THREE.CapsuleGeometry(0.31, 0.58, 4, 8),
  head: new THREE.SphereGeometry(0.205, 12, 9),
  helmet: new THREE.SphereGeometry(0.245, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2),
  upperArm: new THREE.CapsuleGeometry(0.105, 0.28, 3, 6),
  forearm: new THREE.CapsuleGeometry(0.092, 0.24, 3, 6),
  hand: new THREE.SphereGeometry(0.105, 9, 7),
  leg: new THREE.CapsuleGeometry(0.135, 0.34, 3, 7),
  boot: new THREE.BoxGeometry(0.24, 0.15, 0.34),
  button: new THREE.SphereGeometry(0.035, 6, 5)
};
const soldierMaterials = {
  blue: {
    uniforms: [0x777552, 0x81785b, 0x6b704f].map(color => new THREE.MeshLambertMaterial({
      color
    })),
    helmet: new THREE.MeshLambertMaterial({
      color: 0x6b684a
    }),
    webbing: new THREE.MeshLambertMaterial({
      color: 0x51452e
    }),
    trouser: new THREE.MeshLambertMaterial({
      color: 0x56513a
    }),
    pack: new THREE.MeshLambertMaterial({
      color: 0x4e4a37
    })
  },
  red: {
    uniforms: [0x6d756d, 0x777a70, 0x626d69].map(color => new THREE.MeshLambertMaterial({
      color
    })),
    helmet: new THREE.MeshLambertMaterial({
      color: 0x59635d
    }),
    webbing: new THREE.MeshLambertMaterial({
      color: 0x4b4b40
    }),
    trouser: new THREE.MeshLambertMaterial({
      color: 0x515952
    }),
    pack: new THREE.MeshLambertMaterial({
      color: 0x4c554e
    })
  }
};
const soldierSharedMaterials = {
  skin: new THREE.MeshLambertMaterial({
    color: 0xc29370
  }),
  glove: new THREE.MeshLambertMaterial({
    color: 0x9b7658
  }),
  boot: new THREE.MeshLambertMaterial({
    color: 0x302b24
  }),
  seam: new THREE.MeshLambertMaterial({
    color: 0x302d26
  }),
  brass: new THREE.MeshLambertMaterial({
    color: 0xb0945b
  }),
  rifle: new THREE.MeshLambertMaterial({
    color: 0x282a28
  }),
  wood: new THREE.MeshLambertMaterial({
    color: 0x573b25
  }),
  flash: new THREE.MeshBasicMaterial({
    color: 0xffcb68,
    transparent: true,
    opacity: 0.9,
    depthWrite: false
  })
};
const cigaretteMat = new THREE.MeshLambertMaterial({
  color: 0xd7c9aa
});
const cigaretteEmberMat = new THREE.MeshBasicMaterial({
  color: 0xff7130
});
const cigaretteGeo = new THREE.CylinderGeometry(0.022, 0.022, 0.28, 6);
const cigaretteEmberGeo = new THREE.SphereGeometry(0.028, 6, 5);
function addPilotCigarette(person) {
  const cigarette = new THREE.Group();
  const stick = new THREE.Mesh(cigaretteGeo, cigaretteMat);
  stick.rotation.z = Math.PI / 2;
  stick.position.set(0.09, -0.13, -0.22);
  const ember = new THREE.Mesh(cigaretteEmberGeo, cigaretteEmberMat);
  ember.position.set(0.23, -0.13, -0.22);
  cigarette.add(stick, ember);
  cigarette.visible = false;
  person.headPivot.add(cigarette);
  return {
    object: cigarette,
    tip: new THREE.Vector3(0.23, -0.13, -0.22)
  };
}
function makeStylizedSoldier(team, armed = false, appearance = null) {
  const palette = soldierMaterials[team] || soldierMaterials.blue;
  const colors = soldierSharedMaterials;
  const g = new THREE.Group();
  const torso = new THREE.Mesh(soldierGeo.torso, palette.uniforms[Math.floor(Math.random() * palette.uniforms.length)]);
  torso.position.set(0, 0.99, 0);
  torso.scale.set(1, 0.96, 0.84);
  g.add(torso);

  // Period field kit: crossed webbing, collar, belt, pouches and a compact pack.
  const strapA = new THREE.Mesh(new THREE.BoxGeometry(0.085, 0.78, 0.035), palette.webbing);
  strapA.position.set(-0.075, 1.02, -0.254);
  strapA.rotation.z = -0.28;
  const strapB = new THREE.Mesh(new THREE.BoxGeometry(0.085, 0.78, 0.035), palette.webbing);
  strapB.position.set(0.075, 1.02, -0.254);
  strapB.rotation.z = 0.28;
  const belt = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.12, 0.38), palette.webbing);
  belt.position.set(0, 0.69, -0.01);
  const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.11, 0.035), colors.brass);
  buckle.position.set(0, 0.69, -0.218);
  const pack = new THREE.Mesh(new THREE.BoxGeometry(0.43, 0.5, 0.22), palette.pack);
  pack.position.set(0, 0.98, 0.3);
  const collar = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.1, 0.16), palette.webbing);
  collar.position.set(0, 1.38, -0.04);
  g.add(strapA, strapB, belt, buckle, pack, collar);
  for (const x of [-0.22, 0.22]) {
    const pouch = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.2, 0.17), palette.webbing);
    pouch.position.set(x, 0.58, -0.17);
    g.add(pouch);
  }
  for (let i = 0; i < 4; i++) {
    const button = new THREE.Mesh(soldierGeo.button, colors.brass);
    button.position.set(0, 1.25 - i * 0.14, -0.265);
    g.add(button);
  }
  const headPivot = new THREE.Group();
  headPivot.position.set(0, 1.68, -0.015);
  const head = new THREE.Mesh(soldierGeo.head, colors.skin);
  const earL = new THREE.Mesh(new THREE.SphereGeometry(0.055, 7, 5), colors.skin);
  const earR = earL.clone();
  earL.position.set(-0.19, 0, 0.015);
  earR.position.set(0.19, 0, 0.015);
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.045, 7, 5), colors.skin);
  nose.position.set(0, -0.015, -0.197);
  const eyeMat = colors.seam;
  const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.018, 5, 4), eyeMat);
  const eyeR = eyeL.clone();
  eyeL.position.set(-0.073, 0.045, -0.188);
  eyeR.position.set(0.073, 0.045, -0.188);
  const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.265, 0.255, 0.055, 12), palette.helmet);
  brim.position.y = 0.13;
  const dome = new THREE.Mesh(soldierGeo.helmet, palette.helmet);
  dome.position.y = 0.15;
  const badge = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.11, 0.025), team === 'blue' ? soldierMaterials.blue.webbing : soldierMaterials.red.webbing);
  badge.position.set(0, 0.22, -0.233);
  headPivot.add(head, earL, earR, nose, eyeL, eyeR, brim, dome, badge);
  if (appearance?.gender === 'female') {
    const hair = new THREE.MeshLambertMaterial({
      color: appearance.hairColor || 0x593627
    });
    const hairBack = new THREE.Mesh(new THREE.SphereGeometry(0.19, 10, 7), hair);
    hairBack.scale.set(0.9, 0.82, 0.72);
    hairBack.position.set(0, -0.035, 0.105);
    headPivot.add(hairBack);
    for (const side of [-1, 1]) {
      const lock = new THREE.Mesh(new THREE.SphereGeometry(0.068, 8, 6), hair);
      lock.scale.set(0.72, 1.28, 0.76);
      lock.position.set(side * 0.17, -0.07, -0.035);
      headPivot.add(lock);
    }
    if (appearance.hairStyle === 'braid' || appearance.hairStyle === 'ponytail') {
      const tail = new THREE.Mesh(new THREE.CapsuleGeometry(0.055, appearance.hairStyle === 'braid' ? 0.34 : 0.26, 3, 6), hair);
      tail.position.set(0.08, -0.12, 0.23);
      tail.rotation.z = -0.28;
      headPivot.add(tail);
      if (appearance.hairStyle === 'braid') {
        const tie = new THREE.Mesh(new THREE.SphereGeometry(0.065, 7, 5), soldierSharedMaterials.brass);
        tie.scale.set(0.8, 0.72, 0.75);
        tie.position.set(0.08, -0.24, 0.23);
        headPivot.add(tie);
      }
    } else if (appearance.hairStyle === 'bun' || appearance.hairStyle === 'roll') {
      const bun = new THREE.Mesh(new THREE.SphereGeometry(0.115, 9, 7), hair);
      bun.scale.set(0.92, 0.84, 1.05);
      bun.position.set(0, -0.08, 0.2);
      headPivot.add(bun);
    }
  } else if (appearance?.mustache) {
    const facialHair = new THREE.MeshLambertMaterial({
      color: appearance.mustacheColor || 0x3b2b22
    });
    for (const side of [-1, 1]) {
      const tuft = new THREE.Mesh(new THREE.SphereGeometry(0.083, 8, 6), facialHair);
      tuft.scale.set(0.9, 0.44, 0.32);
      tuft.position.set(side * 0.055, -0.085, -0.197);
      tuft.rotation.z = side * -0.16;
      headPivot.add(tuft);
    }
  }
  g.add(headPivot);
  const armPivots = [];
  const legPivots = [];
  for (const side of [-1, 1]) {
    const arm = new THREE.Group();
    arm.position.set(side * 0.31, 1.29, -0.005);
    const upper = new THREE.Mesh(soldierGeo.upperArm, torso.material);
    upper.position.y = -0.2;
    const forearm = new THREE.Group();
    forearm.position.set(0, -0.38, -0.005);
    const lower = new THREE.Mesh(soldierGeo.forearm, torso.material);
    lower.position.y = -0.16;
    const cuff = new THREE.Mesh(new THREE.CylinderGeometry(0.095, 0.095, 0.1, 8), palette.webbing);
    cuff.position.y = -0.31;
    const hand = new THREE.Mesh(soldierGeo.hand, colors.glove);
    hand.scale.set(0.82, 0.88, 1.12);
    hand.position.set(0, -0.39, -0.035);
    const thumb = new THREE.Mesh(new THREE.SphereGeometry(0.042, 6, 5), colors.glove);
    thumb.position.set(side * -0.075, -0.38, -0.07);
    forearm.add(lower, cuff, hand, thumb);
    arm.add(upper, forearm);
    if (armed) {
      arm.rotation.x = 0.78;
      arm.rotation.z = -side * 0.35;
      forearm.rotation.x = -0.18;
      forearm.rotation.z = side * 0.24;
    }
    g.add(arm);
    armPivots.push(arm);
    const leg = new THREE.Group();
    leg.position.set(side * 0.16, 0.62, 0.015);
    const trousers = new THREE.Mesh(soldierGeo.leg, palette.trouser);
    trousers.position.y = -0.22;
    const knee = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.13, 0.045), palette.webbing);
    knee.position.set(0, -0.25, -0.125);
    const boot = new THREE.Mesh(soldierGeo.boot, colors.boot);
    boot.position.set(0, -0.45, -0.075);
    leg.add(trousers, knee, boot);
    g.add(leg);
    legPivots.push(leg);
  }
  let rifle = null;
  let flash = null;
  if (armed) {
    rifle = new THREE.Group();
    rifle.position.set(0.12, 0.94, -0.2);
    const stock = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.13, 0.43), colors.wood);
    stock.position.z = -0.02;
    const receiver = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.13, 0.47), colors.rifle);
    receiver.position.z = -0.39;
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.045, 0.7, 6), colors.rifle);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(0, 0.015, -0.94);
    const sight = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.08, 0.06), colors.rifle);
    sight.position.set(0, 0.09, -0.61);
    rifle.add(stock, receiver, barrel, sight);
    flash = new THREE.Mesh(new THREE.SphereGeometry(0.13, 6, 5), colors.flash);
    flash.position.set(0, 0.015, -1.34);
    flash.visible = false;
    rifle.add(flash);
    g.add(rifle);
  }
  return {
    g,
    torso,
    headPivot,
    armPivots,
    legPivots,
    rifle,
    flash
  };
}
function updateSelectionPilotPreview() {
  for (const material of menuPilotPreviewMaterials) material.dispose();
  menuPilotPreviewMaterials.clear();
  if (menuPilotModel) menuPilotPreview.remove(menuPilotModel);
  menuPilotModel = null;
  if (!menuPilotFlag) {
    menuPilotFlag = new THREE.Mesh(new THREE.PlaneGeometry(2.55, 1.58, 12, 8), new THREE.MeshBasicMaterial({
      map: factionFlagTexture(sel.team),
      side: THREE.DoubleSide,
      toneMapped: false
    }));
    menuPilotFlag.position.set(0, -0.08, -0.48);
    menuPilotPreview.add(menuPilotFlag);
  } else {
    menuPilotFlag.material.map = factionFlagTexture(sel.team);
    menuPilotFlag.material.needsUpdate = true;
  }
  const appearance = sel.pilotGender === 'female' ? {
    gender: 'female',
    hairStyle: 'braid',
    hairColor: sel.team === 'blue' ? 0x593627 : 0x39251f
  } : {
    gender: 'male',
    mustache: false
  };
  const pilot = makeStylizedSoldier(sel.team, false, appearance);
  const materialCopies = new Map();
  pilot.g.traverse(object => {
    if (!object.isMesh) return;
    const brighten = material => {
      if (!materialCopies.has(material)) {
        const previewMaterial = material.clone();
        if (previewMaterial.emissive && previewMaterial.color) {
          previewMaterial.emissive.copy(previewMaterial.color).multiplyScalar(0.22);
        }
        materialCopies.set(material, previewMaterial);
        menuPilotPreviewMaterials.add(previewMaterial);
      }
      return materialCopies.get(material);
    };
    object.material = Array.isArray(object.material) ? object.material.map(brighten) : brighten(object.material);
  });
  pilot.g.scale.setScalar(1.28);
  pilot.g.position.y = -1.5;
  pilot.g.rotation.y = Math.PI;
  menuPilotModel = pilot.g;
  menuPilotPreview.add(menuPilotModel);
  menuPilotPreview.visible = true;
}
function positionSelectionPilotPreview() {
  const slot = $('pilot-preview-slot');
  if (!slot) return;
  const rect = slot.getBoundingClientRect();
  menuPilotPreview.visible = !!(rect.width && rect.height && rect.bottom > 0 && rect.top < innerHeight);
  if (!menuPilotPreview.visible) return;
  const distance = 6.6;
  const worldUnitsPerPixel = 2 * distance * Math.tan(camera.fov * Math.PI / 360) / innerHeight;
  menuPilotPreview.position.set((rect.left + rect.width / 2 - innerWidth / 2) * worldUnitsPerPixel, (innerHeight / 2 - rect.top - rect.height / 2) * worldUnitsPerPixel, -distance);
}
function buildTrenchSoldiers() {
  trenchTroops = [];
  for (const team of ['blue', 'red']) {
    const side = team === 'blue' ? -1 : 1;
    for (let i = 0; i < 17; i++) {
      const x = side * (96 + Math.random() * 21);
      const z = -1010 + i * 126 + (Math.random() - 0.5) * 48;
      const person = makeStylizedSoldier(team, true);
      const {
        g
      } = person;
      g.position.set(x, heightAt(x, z) + 0.12, z);
      g.rotation.y = side < 0 ? -Math.PI / 2 : Math.PI / 2;
      world.add(g);
      trenchTroops.push({
        g,
        person,
        rifle: person.rifle,
        flash: person.flash,
        team,
        side,
        nextShot: 1 + Math.random() * 5,
        flashT: 0,
        animT: Math.random() * Math.PI * 2,
        recoil: 0,
        phase: Math.random() * Math.PI * 2
      });
    }
  }
}
const mapCanvasX = (x, width) => 30 + (x + 1800) / 3600 * (width - 60);
const mapCanvasY = (z, height) => 40 + (z + 1500) / 3000 * (height - 90);
const SECTOR_SIZE = 300;
const SECTOR_COLUMNS = 12;
const SECTOR_ROWS = 10;
const SECTOR_FLAG_LOWER_SECONDS = 2.1;
const SECTOR_FLAG_RAISE_SECONDS = 4.8;
let sectorControl = [];
let sectorVisualGroup = null;
let sectorGridGroup = null;
let sectorGridVisible = false;
let sectorCapture = {
  id: -1,
  elapsed: 0,
  duration: 0,
  lastX: NaN,
  lastZ: NaN,
  status: ''
};
let sectorNoticeCooldown = 0;
let sectorFlares = [];
let sectorSignalActionT = 0;
let sectorSignalPending = null;
const isGreatWarSinglePlayer = () => sel.gameMode === 'squadron' && true && true && true && true && true;
function restoreGreatWarCampaign(map = sel.map) {
  const fields = FIELDS[map] || [];
  const state = isGreatWarSinglePlayer() ? save.greatWarCampaign[map] : null;
  for (let index = 0; index < fields.length; index++) {
    const field = fields[index];
    const savedField = state?.fields?.[index];
    field.bombHits = savedField ? THREE.MathUtils.clamp(Math.floor(Number(savedField.bombHits) || 0), 0, 15) : 0;
    field.disabled = !!savedField?.disabled;
    field.rebuildRemaining = field.disabled ? THREE.MathUtils.clamp(Number(savedField?.rebuildRemaining) || 0, 0, AIRFIELD_REBUILD_DURATION) : 0;
  }
  return !!state;
}
function persistGreatWarCampaign() {
  if (!isGreatWarSinglePlayer()) return;
  const fields = FIELDS[sel.map] || [];
  const previous = save.greatWarCampaign[sel.map] || {};
  save.greatWarCampaign[sel.map] = {
    fields: fields.map(field => ({
      bombHits: Math.max(0, Math.min(15, Math.floor(Number(field.bombHits) || 0))),
      disabled: !!field.disabled,
      rebuildRemaining: Math.max(0, Math.min(30, Number(field.rebuildRemaining) || 0))
    })),
    sectors: sectorControl.length === SECTOR_COLUMNS * SECTOR_ROWS ? sectorControl.map(sector => sector.owner === 'blue' || sector.owner === 'red' ? sector.owner : null) : Array.isArray(previous.sectors) ? previous.sectors : []
  };
  persist();
}
function recordRibbonAward(id) {
  const awards = save.career.ribbonAwards;
  awards[id] = Math.max(0, Math.floor(Number(awards[id]) || 0)) + 1;
  persist();
  const ribbon = RIBBON_CATALOG[id];
  if (ribbon) feed(`RIBBON AWARDED · ${ribbon.title}`, 'victory');
}
const sectorFlareCoreGeometry = new THREE.SphereGeometry(0.42, 10, 8);
const sectorFlarePistol = new THREE.Group();
const sectorFlareGunMetal = new THREE.MeshBasicMaterial({
  color: 0x383b39
});
const sectorFlareGunBrass = new THREE.MeshBasicMaterial({
  color: 0x9a7947
});
const sectorFlareGunGrip = new THREE.MeshBasicMaterial({
  color: 0x68462e
});
const sectorFlareGunHandMat = new THREE.MeshBasicMaterial({
  color: 0xb99270
});
const sectorFlareBarrel = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.055, 0.55, 8), sectorFlareGunMetal);
sectorFlareBarrel.position.set(0, 0.24, 0);
const sectorFlareMuzzle = new THREE.Mesh(new THREE.TorusGeometry(0.052, 0.012, 5, 10), sectorFlareGunBrass);
sectorFlareMuzzle.position.set(0, 0.52, 0);
const sectorFlareReceiver = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.25, 0.14), sectorFlareGunMetal);
sectorFlareReceiver.position.set(0, -0.02, 0);
const sectorFlareGrip = new THREE.Mesh(new THREE.BoxGeometry(0.105, 0.28, 0.13), sectorFlareGunGrip);
sectorFlareGrip.position.set(0, -0.23, 0.025);
sectorFlareGrip.rotation.z = -0.16;
const sectorFlareHand = new THREE.Mesh(new THREE.SphereGeometry(0.13, 8, 6), sectorFlareGunHandMat);
sectorFlareHand.position.set(0, -0.08, -0.06);
sectorFlarePistol.add(sectorFlareBarrel, sectorFlareMuzzle, sectorFlareReceiver, sectorFlareGrip, sectorFlareHand);
sectorFlarePistol.position.set(0.45, -0.48, -0.98);
sectorFlarePistol.visible = false;
camera.add(sectorFlarePistol);
const sectorIndexAt = (x, z) => {
  const column = Math.floor((x + 1800) / SECTOR_SIZE);
  const row = Math.floor((z + 1500) / SECTOR_SIZE);
  return column < 0 || column >= SECTOR_COLUMNS || row < 0 || row >= SECTOR_ROWS ? -1 : row * SECTOR_COLUMNS + column;
};
function sectorNeighbors(sector) {
  return [[sector.column - 1, sector.row], [sector.column + 1, sector.row], [sector.column, sector.row - 1], [sector.column, sector.row + 1]].filter(([column, row]) => column >= 0 && column < SECTOR_COLUMNS && row >= 0 && row < SECTOR_ROWS).map(([column, row]) => sectorControl[row * SECTOR_COLUMNS + column]);
}
function sectorCounts() {
  return sectorControl.reduce((counts, sector) => {
    if (sector.owner === 'blue' || sector.owner === 'red') counts[sector.owner]++;
    return counts;
  }, {
    blue: 0,
    red: 0
  });
}
function sectorFlagMaterial(team) {
  if (!sectorFlagMaterial.cache) {
    sectorFlagMaterial.cache = {
      neutral: new THREE.MeshBasicMaterial({
        color: 0x8a8069,
        side: THREE.DoubleSide
      }),
      blue: new THREE.MeshBasicMaterial({
        map: factionFlagTexture('blue'),
        side: THREE.DoubleSide
      }),
      red: new THREE.MeshBasicMaterial({
        map: factionFlagTexture('red'),
        side: THREE.DoubleSide
      })
    };
  }
  return sectorFlagMaterial.cache[team] || sectorFlagMaterial.cache.neutral;
}
function updateSectorFlag(sector, raising = false) {
  if (!sector.flagCloth) return;
  const low = 2.5;
  const high = 9.4;
  const loweringSeconds = SECTOR_FLAG_LOWER_SECONDS;
  const raisingSeconds = SECTOR_FLAG_RAISE_SECONDS;
  let displayTeam = sector.owner;
  let height = sector.owner ? high : low;
  const transition = sector.flagTransition;
  if (transition) {
    const lowering = transition.from && transition.elapsed < transition.loweringSeconds;
    if (lowering) {
      displayTeam = transition.from;
      height = THREE.MathUtils.lerp(high, low, transition.elapsed / transition.loweringSeconds);
    } else {
      displayTeam = transition.to;
      const raiseElapsed = Math.max(0, transition.elapsed - transition.loweringSeconds);
      height = THREE.MathUtils.lerp(low, high, THREE.MathUtils.clamp(raiseElapsed / transition.raisingSeconds, 0, 1));
    }
  } else if (raising && sector.captureTeam) {
    const loweringEnemy = sector.owner && sector.owner !== sector.captureTeam;
    if (loweringEnemy && sectorCapture.elapsed < loweringSeconds) {
      displayTeam = sector.owner;
      height = THREE.MathUtils.lerp(high, low, sectorCapture.elapsed / loweringSeconds);
    } else {
      displayTeam = sector.captureTeam;
      const raiseElapsed = Math.max(0, sectorCapture.elapsed - (loweringEnemy ? loweringSeconds : 0));
      height = THREE.MathUtils.lerp(low, high, THREE.MathUtils.clamp(raiseElapsed / raisingSeconds, 0, 1));
    }
  }
  sector.flagCloth.material = sectorFlagMaterial(displayTeam);
  sector.flagCloth.position.y = height;
  sector.marker.material.color.set(sector.owner === 'blue' ? 0x426caa : sector.owner === 'red' ? 0x9d4038 : 0x696354);
}
function updateSectorFlagTransitions(dt) {
  for (const sector of sectorControl) {
    const transition = sector.flagTransition;
    if (!transition) continue;
    transition.elapsed += dt;
    if (transition.elapsed >= transition.loweringSeconds + transition.raisingSeconds) {
      sector.flagTransition = null;
    }
    updateSectorFlag(sector);
  }
}
function initializeSectorControl() {
  for (const flare of sectorFlares) {
    scene.remove(flare.group);
    flare.coreMaterial.dispose();
    flare.glowMaterial.dispose();
  }
  sectorFlares = [];
  sectorSignalActionT = 0;
  sectorSignalPending = null;
  sectorFlarePistol.visible = false;
  const savedOwners = isGreatWarSinglePlayer() && Array.isArray(save.greatWarCampaign[sel.map]?.sectors) && save.greatWarCampaign[sel.map].sectors.length === SECTOR_COLUMNS * SECTOR_ROWS ? save.greatWarCampaign[sel.map].sectors : null;
  sectorControl = Array.from({
    length: SECTOR_COLUMNS * SECTOR_ROWS
  }, (_, index) => {
    const column = index % SECTOR_COLUMNS;
    const row = Math.floor(index / SECTOR_COLUMNS);
    const savedOwner = savedOwners?.[index];
    return {
      id: index,
      column,
      row,
      x: -1800 + (column + 0.5) * SECTOR_SIZE,
      z: -1500 + (row + 0.5) * SECTOR_SIZE,
      owner: savedOwner === 'blue' || savedOwner === 'red' ? savedOwner : null,
      field: null,
      flagCloth: null,
      marker: null,
      flagTransition: null
    };
  });
  for (const field of FIELDS[sel.map] || []) {
    const index = sectorIndexAt(field.x, field.z);
    if (index < 0) continue;
    const sector = sectorControl[index];
    sector.field = field;
    if (!savedOwners) sector.owner = field.team;
  }
  sectorCapture = {
    id: -1,
    elapsed: 0,
    duration: 0,
    lastX: NaN,
    lastZ: NaN,
    status: ''
  };
  if (sectorVisualGroup?.parent === world) {
    for (const sector of sectorControl) updateSectorFlag(sector);
  }
}
function ensureSectorVisuals() {
  if (sel.gameMode !== 'squadron' || !world || sectorVisualGroup?.parent === world) return;
  sectorVisualGroup = new THREE.Group();
  sectorGridGroup = new THREE.Group();
  sectorGridGroup.visible = sectorGridVisible;
  sectorVisualGroup.add(sectorGridGroup);
  const gridMaterial = new THREE.LineBasicMaterial({
    color: 0xd4c9a9,
    transparent: true,
    opacity: 0.15,
    depthWrite: false
  });
  for (let column = 0; column <= SECTOR_COLUMNS; column++) {
    const x = -1800 + column * SECTOR_SIZE;
    const positions = [];
    for (let z = -1500; z <= 1500; z += 25) positions.push(x, heightAt(x, z) + 0.38, z);
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    const line = new THREE.Line(geometry, gridMaterial);
    line.frustumCulled = false;
    sectorGridGroup.add(line);
  }
  for (let row = 0; row <= SECTOR_ROWS; row++) {
    const z = -1500 + row * SECTOR_SIZE;
    const positions = [];
    for (let x = -1800; x <= 1800; x += 25) positions.push(x, heightAt(x, z) + 0.38, z);
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    const line = new THREE.Line(geometry, gridMaterial);
    line.frustumCulled = false;
    sectorGridGroup.add(line);
  }
  const poleGeometry = new THREE.CylinderGeometry(0.11, 0.15, 12, 6);
  const poleMaterial = new THREE.MeshLambertMaterial({
    color: 0x554832
  });
  const flagGeometry = new THREE.PlaneGeometry(3.6, 2, 8, 4);
  const markerGeometry = new THREE.CylinderGeometry(2.1, 2.1, 0.12, 12);
  for (const sector of sectorControl) {
    const root = new THREE.Group();
    const terrain = heightAt(sector.x, sector.z);
    const baseY = sel.map === 'stranda' ? Math.max(terrain, 0.18) : terrain;
    root.position.set(sector.x, baseY, sector.z);
    const marker = new THREE.Mesh(markerGeometry, new THREE.MeshBasicMaterial({
      color: 0x696354,
      transparent: true,
      opacity: 0.48
    }));
    marker.position.y = 0.12;
    const pole = new THREE.Mesh(poleGeometry, poleMaterial);
    pole.position.y = 6;
    const cloth = new THREE.Mesh(flagGeometry, sectorFlagMaterial(sector.owner));
    cloth.position.set(1.75, sector.owner ? 9.4 : 2.5, 0);
    cloth.userData.windPhase = Math.random() * Math.PI * 2;
    root.add(marker, pole, cloth);
    sector.root = root;
    sector.marker = marker;
    sector.flagCloth = cloth;
    sectorVisualGroup.add(root);
  }
  world.add(sectorVisualGroup);
}
function resetSectorCaptureVisual() {
  const previous = sectorControl[sectorCapture.id];
  if (previous) {
    previous.captureTeam = null;
    updateSectorFlag(previous);
  }
  sectorCapture = {
    id: -1,
    elapsed: 0,
    duration: 0,
    lastX: NaN,
    lastZ: NaN,
    status: ''
  };
}
function canCaptureSector(sector, team) {
  if (!sector || sector.owner === team) return {
    ok: false,
    reason: ''
  };
  if (sector.field && !sector.field.disabled) return {
    ok: false,
    reason: 'AIRFIELD SECTOR · BOMB THE BASE FIRST'
  };
  if (!sectorNeighbors(sector).some(neighbor => neighbor?.owner === team)) return {
    ok: false,
    reason: 'ISOLATED SECTOR · CLAIM A NEIGHBOUR FIRST'
  };
  return {
    ok: true,
    reason: ''
  };
}
function launchSectorSignalFlare(position, team) {
  if (!position?.isVector3 || !['blue', 'red'].includes(team)) return;
  const color = team === 'blue' ? 0x58a5ff : 0xff574b;
  const group = new THREE.Group();
  const coreMaterial = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity: 1,
    toneMapped: false
  });
  const core = new THREE.Mesh(sectorFlareCoreGeometry, coreMaterial);
  const glowMaterial = new THREE.SpriteMaterial({
    map: sunGlowTexture,
    color,
    transparent: true,
    opacity: 0.92,
    depthWrite: false,
    fog: false,
    toneMapped: false
  });
  const glow = new THREE.Sprite(glowMaterial);
  glow.scale.set(11, 11, 1);
  group.add(core, glow);
  group.position.copy(position);
  scene.add(group);
  sectorFlares.push({
    group,
    coreMaterial,
    glowMaterial,
    team,
    age: 0,
    smokeT: 0,
    baseY: position.y
  });
  while (sectorFlares.length > 10) {
    const oldest = sectorFlares.shift();
    scene.remove(oldest.group);
    oldest.coreMaterial.dispose();
    oldest.glowMaterial.dispose();
  }
}
function beginSectorSignal(sector, team, cause = 'npc') {
  const position = sector.root ? sector.root.localToWorld(new THREE.Vector3(0, 13.2, 0)) : new THREE.Vector3(sector.x, heightAt(sector.x, sector.z) + 13, sector.z);
  if (cause === 'player' && team === sel.team && mode === 'foot' && player?.emergencyLanded) {
    sectorSignalPending = {
      position,
      team
    };
    sectorSignalActionT = 0.92;
    sectorFlarePistol.visible = true;
    sectorFlarePistol.rotation.set(0.45, 0, 0.58);
  } else {
    launchSectorSignalFlare(position, team);
  }
}
function updateSectorSignals(dt) {
  if (sectorSignalActionT > 0) {
    sectorSignalActionT = Math.max(0, sectorSignalActionT - dt);
    const elapsed = 0.92 - sectorSignalActionT;
    sectorFlarePistol.visible = sectorSignalActionT > 0;
    sectorFlarePistol.rotation.z = THREE.MathUtils.lerp(0.58, 0.035, THREE.MathUtils.smoothstep(elapsed, 0, 0.34));
    sectorFlarePistol.position.y = -0.48 + Math.sin(Math.min(1, elapsed / 0.34) * Math.PI) * 0.055;
    if (sectorSignalPending && elapsed >= 0.34) {
      launchSectorSignalFlare(sectorSignalPending.position, sectorSignalPending.team);
      sectorSignalPending = null;
    }
  } else {
    sectorFlarePistol.visible = false;
    sectorSignalPending = null;
  }
  for (const flare of sectorFlares) {
    flare.age += dt;
    flare.smokeT -= dt;
    const riseTime = Math.min(flare.age, 2.2);
    flare.group.position.y = flare.baseY + riseTime * 20 - riseTime * riseTime * 1.5 + (flare.age > 2.2 ? Math.sin(flare.age * 1.7) * 0.65 : 0);
    const fade = 1 - THREE.MathUtils.smoothstep(flare.age, 15.5, 19);
    flare.coreMaterial.opacity = fade;
    flare.coreMaterial.transparent = true;
    flare.glowMaterial.opacity = 0.9 * fade * (0.84 + Math.sin(flare.age * 14) * 0.12);
    const pulse = 1 + Math.sin(flare.age * 12) * 0.08;
    flare.group.children[1].scale.set(11 * pulse, 11 * pulse, 1);
    if (flare.smokeT <= 0 && flare.age < 18.5) {
      flare.smokeT = 0.18;
      const smokeColor = flare.team === 'blue' ? 0x438fff : 0xe8463d;
      smoke(flare.group.position.clone().add(new THREE.Vector3((Math.random() - 0.5) * 1.1, -0.55, (Math.random() - 0.5) * 1.1)), 0.36 + Math.random() * 0.16, 3.8, smokeColor, (Math.random() - 0.5) * 0.8, 1.05, (Math.random() - 0.5) * 0.8, 0.72, 1.6);
    }
  }
  sectorFlares = sectorFlares.filter(flare => {
    if (flare.age < 19) return true;
    scene.remove(flare.group);
    flare.coreMaterial.dispose();
    flare.glowMaterial.dispose();
    return false;
  });
}
function setSectorOwner(sector, team, cause = 'npc', flagAlreadyRaised = false) {
  if (!sector || !['blue', 'red'].includes(team)) return;
  const previousOwner = sector.owner;
  const changed = previousOwner !== team;
  sector.owner = team;
  sector.captureTeam = null;
  if (changed && !flagAlreadyRaised) {
    sector.flagTransition = {
      from: previousOwner,
      to: team,
      elapsed: 0,
      loweringSeconds: previousOwner ? SECTOR_FLAG_LOWER_SECONDS : 0,
      raisingSeconds: SECTOR_FLAG_RAISE_SECONDS
    };
  } else if (flagAlreadyRaised) {
    sector.flagTransition = null;
  }
  updateSectorFlag(sector);
  if (changed) {
    beginSectorSignal(sector, team, cause);
    persistGreatWarCampaign();
  }
}
function updateSectorCapture(dt) {
  if (sectorNoticeCooldown > 0) sectorNoticeCooldown = Math.max(0, sectorNoticeCooldown - dt);
  if (sel.gameMode !== 'squadron' || mode !== 'foot' || !player?.emergencyLanded || !planes.includes(player) || !roundInProgress) {
    resetSectorCaptureVisual();
    return;
  }
  const index = sectorIndexAt(foot.pos.x, foot.pos.z);
  const sector = index >= 0 ? sectorControl[index] : null;
  if (!sector || Math.hypot(foot.pos.x - sector.x, foot.pos.z - sector.z) > 11) {
    resetSectorCaptureVisual();
    return;
  }
  const eligibility = canCaptureSector(sector, sel.team);
  if (!eligibility.ok) {
    resetSectorCaptureVisual();
    sectorCapture.status = eligibility.reason;
    if (eligibility.reason && sectorNoticeCooldown <= 0) {
      say(eligibility.reason === 'AIRFIELD SECTOR · BOMB THE BASE FIRST' ? 'Bomb the airfield base before its sector can be claimed.' : 'Capture an adjacent sector first to extend your front line.');
      sectorNoticeCooldown = 3;
    }
    return;
  }
  const loweringEnemy = sector.owner && sector.owner !== sel.team;
  const captureDuration = (loweringEnemy ? SECTOR_FLAG_LOWER_SECONDS : 0) + SECTOR_FLAG_RAISE_SECONDS;
  const moved = Number.isFinite(sectorCapture.lastX) && Math.hypot(foot.pos.x - sectorCapture.lastX, foot.pos.z - sectorCapture.lastZ) > Math.max(0.08, dt * 0.55);
  sectorCapture.lastX = foot.pos.x;
  sectorCapture.lastZ = foot.pos.z;
  if (sectorCapture.id !== sector.id || moved) {
    if (sectorCapture.id !== sector.id) resetSectorCaptureVisual();
    sectorCapture.id = sector.id;
    sectorCapture.elapsed = 0;
    sectorCapture.duration = captureDuration;
    sector.captureTeam = sel.team;
  } else {
    sectorCapture.elapsed += dt;
  }
  sectorCapture.status = loweringEnemy && sectorCapture.elapsed < SECTOR_FLAG_LOWER_SECONDS ? 'LOWERING ENEMY FLAG' : 'HOLD POSITION · RAISING YOUR FLAG';
  updateSectorFlag(sector, true);
  if (sectorCapture.elapsed < captureDuration) return;
  setSectorOwner(sector, sel.team, 'player', true);
  const record = stat(player);
  record.sectorsCaptured = (record.sectorsCaptured || 0) + 1;
  save.career.sectorsCaptured++;
  checkCareerRibbonAwards();
  persistGreatWarCampaign();
  resetSectorCaptureVisual();
  cashAdd(150, 'Frontline sector captured');
  feed(`${sel.team.toUpperCase()} FLAG RAISED · SECTOR ${sector.column + 1}-${sector.row + 1}`, 'victory');
}
function drawWarMap(cv) {
  const g = cv.getContext('2d');
  const W = cv.width;
  const H = cv.height;
  const X = x => mapCanvasX(x, W);
  const Y = z => mapCanvasY(z, H);
  g.fillStyle = '#e4d3a8';
  g.fillRect(0, 0, W, H);
  for (let i = 0; i < 250; i++) {
    g.fillStyle = `rgba(120,90,40,${0.012 + i % 8 * 0.007})`;
    g.beginPath();
    g.arc(i * 97 % W, i * 193 % H, 2 + i * 17 % 24, 0, Math.PI * 2);
    g.fill();
  }
  if (sel.gameMode === 'squadron') {
    for (const sector of sectorControl) {
      if (!sector.owner) continue;
      const left = X(-1800 + sector.column * SECTOR_SIZE);
      const right = X(-1800 + (sector.column + 1) * SECTOR_SIZE);
      const top = Y(-1500 + sector.row * SECTOR_SIZE);
      const bottom = Y(-1500 + (sector.row + 1) * SECTOR_SIZE);
      g.fillStyle = sector.owner === 'blue' ? 'rgba(43,91,151,.22)' : 'rgba(153,49,39,.20)';
      g.fillRect(left, top, right - left, bottom - top);
      g.strokeStyle = sector.owner === 'blue' ? 'rgba(37,91,160,.72)' : 'rgba(163,53,43,.72)';
      g.lineWidth = 1.35;
      g.strokeRect(left + 0.7, top + 0.7, right - left - 1.4, bottom - top - 1.4);
    }
  }
  g.strokeStyle = sel.gameMode === 'squadron' ? 'rgba(61,55,45,0.44)' : 'rgba(90,70,40,0.25)';
  g.lineWidth = sel.gameMode === 'squadron' ? 1.15 : 1;
  for (let x = -1800; x <= 1800; x += 300) {
    g.beginPath();
    g.moveTo(X(x), Y(-1500));
    g.lineTo(X(x), Y(1500));
    g.stroke();
  }
  for (let z = -1500; z <= 1500; z += 300) {
    g.beginPath();
    g.moveTo(X(-1800), Y(z));
    g.lineTo(X(1800), Y(z));
    g.stroke();
  }
  const worldPath = (points, color, width, dash = []) => {
    g.strokeStyle = color;
    g.lineWidth = width;
    g.setLineDash(dash);
    g.beginPath();
    points.forEach(([x, z], i) => i ? g.lineTo(X(x), Y(z)) : g.moveTo(X(x), Y(z)));
    g.stroke();
    g.setLineDash([]);
  };
  const fjordMapWater = () => {
    g.save();
    g.lineCap = 'round';
    g.lineJoin = 'round';
    for (const route of FJORD_CHANNELS) worldPath(route, '#657b80', 31);
    for (const route of FJORD_CHANNELS) worldPath(route, '#7697a4', 24);
    g.restore();
  };
  const settlement = (x, z, label, ruined = false) => {
    g.save();
    g.translate(X(x), Y(z));
    g.fillStyle = ruined ? '#69584a' : '#766a52';
    g.strokeStyle = '#ead7ad';
    g.lineWidth = 1;
    g.beginPath();
    g.arc(0, 0, ruined ? 13 : 10, 0, Math.PI * 2);
    g.fill();
    g.stroke();
    for (const [bx, bz, bw, bh] of [[-7, -4, 5, 4], [1, -6, 5, 5], [-3, 2, 6, 4]]) {
      g.fillStyle = ruined ? '#362f29' : '#ba9d71';
      g.fillRect(bx, bz, bw, bh);
    }
    g.fillStyle = '#302719';
    g.font = 'italic 10px Georgia';
    g.textAlign = 'center';
    g.fillText(label, 0, 22);
    g.restore();
  };
  if (sel.map === 'trenches') {
    // The sector chart follows the actual river, railway, front line and settlements.
    worldPath(RIVER_POINTS, '#8e9b91', 8);
    worldPath(RIVER_POINTS, '#527f88', 5);
    worldPath([[-760, -1080], [-700, -900], [-600, -680], [-505, -430], [-450, -170], [-430, 100], [-430, 390], [-390, 680], [-290, 930], [-170, 1160]], '#5a4a36', 5);
    worldPath([[-760, -1080], [-700, -900], [-600, -680], [-505, -430], [-450, -170], [-430, 100], [-430, 390], [-390, 680], [-290, 930], [-170, 1160]], '#d6bd83', 1.4, [3, 4]);
    worldPath([[-1230, -890], [-920, -770], [-640, -580], [-380, -400], [-90, -185], [210, 55], [500, 310], [790, 570], [1080, 830]], '#887b60', 2, [8, 5]);
    for (const side of [-1, 1]) {
      const road = trenchSupplyBankPoints(side);
      worldPath(road, '#756447', 8);
      worldPath(road, '#574932', 4.5);
      worldPath(road, '#a18a5a', 0.8, [3, 5]);
    }
    settlement(-1080, -620, 'RUE', true);
    settlement(650, 930, 'VILLERS', false);
    settlement(-790, 120, 'AMIENS', false);
    settlement(1110, -930, 'DOUAI', true);
    settlement(1280, -1250, 'LENS', true);
    settlement(-1430, 260, 'SHELL WORKS', true);
    settlement(1110, -520, 'EASTERN WORKS', true);
    settlement(1370, 390, 'RIVER WORKS', true);
    g.fillStyle = '#3d382e';
    g.font = 'bold 9px Georgia';
    g.textAlign = 'center';
    g.fillText('CATHEDRAL', X(-1080), Y(-620) - 17);
    g.fillText('ST. MARTIN’S CHURCH', X(1280), Y(-1250) - 17);
    for (const [x, z] of [[-445, -150], [-430, 405]]) {
      g.fillStyle = '#756c58';
      g.fillRect(X(x) - 4, Y(z) - 3, 8, 6);
      g.strokeStyle = '#e5d3a9';
      g.strokeRect(X(x) - 4, Y(z) - 3, 8, 6);
    }
    g.fillStyle = '#4c4437';
    g.font = 'italic 10px Georgia';
    g.fillText('RAIL BRIDGE', X(-430), Y(-280));
  } else if (sel.map === 'stranda') {
    fjordMapWater();
    for (const route of FJORD_CHANNELS) {
      for (const side of [-1, 1]) {
        const contour = route.map(([x, z], i) => {
          const before = route[Math.max(0, i - 1)];
          const after = route[Math.min(route.length - 1, i + 1)];
          const dx = after[0] - before[0];
          const dz = after[1] - before[1];
          const length = Math.hypot(dx, dz) || 1;
          return [x + dz / length * side * 285, z - dx / length * side * 285];
        });
        worldPath(contour, side < 0 ? '#9c8d6d' : '#777d72', 1, [3, 5]);
      }
    }
    settlement(-400, 205, 'STRANDA', false);
    settlement(390, -240, 'LIABYGDA', false);
    worldPath([[-410, 290], [-250, 230], [-115, 155], [45, 92]], '#87775a', 2, [5, 4]);
    g.fillStyle = '#264858';
    g.textAlign = 'center';
    g.font = 'bold 12px Georgia';
    g.fillText('STORFJORDEN', X(0), Y(fjordCenterZ(0)) + 4);
    g.fillStyle = '#665c48';
    g.font = 'italic 10px Georgia';
    g.fillText('COAST ROAD', X(-200), Y(315));
  }
  g.font = 'italic 13px Georgia';
  if (sel.map === 'trenches') {
    g.fillStyle = 'rgba(60,50,40,0.35)';
    for (const c of CRATERS) {
      g.beginPath();
      g.arc(X(c.x), Y(c.z), Math.max(1, c.r * 0.12), 0, 7);
      g.fill();
    }
    g.lineWidth = 2.5;
    for (const s of trenchLines()) {
      g.strokeStyle = s[0] < 0 ? '#2b4a7a' : '#8a2a1e';
      g.beginPath();
      g.moveTo(X(s[0]), Y(s[1]));
      g.lineTo(X(s[2]), Y(s[3]));
      g.stroke();
    }
    g.fillStyle = '#4a3a24';
    g.save();
    g.translate(X(0) + 4, Y(0));
    g.rotate(-Math.PI / 2);
    g.textAlign = 'center';
    g.fillText("NO MAN'S LAND", 0, 0);
    g.restore();
  } else if (sel.map === 'stranda') {
    fjordMapWater();
    g.strokeStyle = '#e0d0ae';
    g.lineWidth = 1.4;
    for (const route of FJORD_CHANNELS) {
      for (let i = 1; i < route.length; i++) {
        const [x, z] = route[i];
        const before = route[i - 1];
        const after = route[Math.min(route.length - 1, i + 1)];
        const dx = after[0] - before[0];
        const dz = after[1] - before[1];
        const length = Math.hypot(dx, dz) || 1;
        for (const side of [-1, 1]) {
          const px = X(x + dz / length * side * (225 + 24 * Math.sin(i * 1.7)));
          const pz = Y(z - dx / length * side * (225 + 24 * Math.sin(i * 1.7)));
          g.fillStyle = side < 0 ? '#777b70' : '#697361';
          g.beginPath();
          g.moveTo(px - 7, pz + 5);
          g.lineTo(px, pz - 7);
          g.lineTo(px + 7, pz + 5);
          g.closePath();
          g.fill();
        }
      }
    }
    for (const [x, z, route, color] of [[-200, fjordShipLaneZ(-200, -42), -42, '#315b86'], [200, fjordShipLaneZ(200, 42), 42, '#96372d']]) {
      g.fillStyle = color;
      g.beginPath();
      g.moveTo(X(x) - 10, Y(z));
      g.lineTo(X(x) + 9, Y(z) - 4);
      g.lineTo(X(x) + 9, Y(z) + 4);
      g.closePath();
      g.fill();
      g.strokeStyle = '#f1e3c3';
      g.stroke();
    }
    g.setLineDash([5, 4]);
    for (const routeZ of [-42, 42]) {
      g.strokeStyle = routeZ < 0 ? 'rgba(49,91,134,.8)' : 'rgba(150,55,45,.8)';
      g.beginPath();
      for (let x = -300; x <= 300; x += 30) {
        const z = fjordShipLaneZ(x, routeZ);
        if (x === -300) g.moveTo(X(x), Y(z));else g.lineTo(X(x), Y(z));
      }
      g.stroke();
    }
    g.setLineDash([]);
    for (const [x, z, color] of [[-155, fjordShipLaneZ(-155, -76), '#315b86'], [155, fjordShipLaneZ(155, 76), '#96372d'], [-35, fjordShipLaneZ(-35, 78), '#96372d']]) {
      g.fillStyle = color;
      g.fillRect(X(x) - 4, Y(z) - 4, 8, 8);
      g.strokeStyle = '#f1e3c3';
      g.strokeRect(X(x) - 4, Y(z) - 4, 8, 8);
    }
    g.fillStyle = '#2a4a5a';
    g.textAlign = 'center';
    g.fillText('STORFJORDEN', X(0), Y(fjordCenterZ(0)) + 4);
  } else {
    g.fillStyle = '#674d39';
    g.fillRect(X(-700), Y(-560), X(700) - X(-700), Y(560) - Y(-560));
    g.strokeStyle = '#d9c8a1';
    g.lineWidth = 5;
    g.strokeRect(X(-700), Y(-560), X(700) - X(-700), Y(560) - Y(-560));
    g.fillStyle = '#8b7258';
    for (let x = -650; x <= 650; x += 44) {
      g.fillRect(X(x), Y(-535), 2, Y(535) - Y(-535));
    }
    g.fillStyle = '#536875';
    g.fillRect(X(-560), Y(350), X(-100) - X(-560), Y(20) - Y(350));
    g.fillStyle = '#718b8d';
    g.fillRect(X(80), Y(-65), X(445) - X(80), Y(-330) - Y(-65));
    g.fillStyle = '#ac805f';
    g.fillRect(X(-520), Y(315), X(-140) - X(-520), Y(45) - Y(315));
    g.fillStyle = '#543b2c';
    g.fillRect(X(105), Y(-85), X(420) - X(105), Y(-315) - Y(-85));
    g.strokeStyle = '#d9caa7';
    g.lineWidth = 2;
    g.strokeRect(X(-520), Y(315), X(-140) - X(-520), Y(45) - Y(315));
    g.strokeRect(X(105), Y(-85), X(420) - X(105), Y(-315) - Y(-85));
    g.setLineDash([4, 3]);
    g.strokeStyle = '#d8bd7d';
    g.lineWidth = 2;
    g.beginPath();
    [[480, 620], [480, 500], [480, 430], [590, 350], [590, -350], [500, -440], [-560, -440], [-630, -340], [-630, 340], [-560, 430], [380, 430], [480, 500]].forEach(([x, z], i) => i ? g.lineTo(X(x), Y(z)) : g.moveTo(X(x), Y(z)));
    g.stroke();
    g.setLineDash([]);
    g.fillStyle = '#f2dfb5';
    g.textAlign = 'center';
    g.font = 'italic 12px Georgia';
    g.fillText('BED · BLUE BASE', X(-330), Y(180));
    g.fillText('COMPUTER DESK · RED BASE', X(260), Y(-205));
    g.fillText('TOY TRAIN THROUGH THE DOOR', X(485), Y(480));
    g.fillStyle = '#28333d';
    g.fillRect(X(470), Y(535), X(515) - X(470), Y(500) - Y(535));
    g.fillStyle = '#d5e2e5';
    g.fillRect(X(500), Y(-490), X(610) - X(500), Y(-505) - Y(-490));
  }
  const arrow = (x1, z1, x2, z2, col, label, dash) => {
    g.strokeStyle = g.fillStyle = col;
    g.lineWidth = 2;
    g.setLineDash(dash ? [8, 6] : []);
    g.beginPath();
    g.moveTo(X(x1), Y(z1));
    g.lineTo(X(x2), Y(z2));
    g.stroke();
    g.setLineDash([]);
    const a = Math.atan2(Y(z2) - Y(z1), X(x2) - X(x1));
    g.beginPath();
    g.moveTo(X(x2), Y(z2));
    g.lineTo(X(x2) - 12 * Math.cos(a - 0.4), Y(z2) - 12 * Math.sin(a - 0.4));
    g.lineTo(X(x2) - 12 * Math.cos(a + 0.4), Y(z2) - 12 * Math.sin(a + 0.4));
    g.fill();
    g.textAlign = 'center';
    g.fillText(label, (X(x1) + X(x2)) / 2, (Y(z1) + Y(z2)) / 2 - 8);
  };
  const mapFields = FIELDS[sel.map] || [];
  const mine = mapFields.filter(f => fieldAvailableToPlayer(f));
  const theirs = mapFields.filter(f => !fieldAvailableToPlayer(f));
  if (['bonanza', 'squadbattle'].includes(sel.gameMode)) {
    // Aircraft teams do not follow the map’s blue/red front in these modes.
  } else if (sel.map === 'bedroom') {
    if (mine[0]) arrow(mine[0].x, mine[0].z, 0, 0, '#1e3050', 'ROOM PATROL', false);
    if (theirs[0]) arrow(theirs[0].x, theirs[0].z, 0, 0, '#7a1e14', 'ENEMY SORTIE', true);
    g.fillStyle = '#f2dfb5';
    g.textAlign = 'center';
    g.font = 'italic 12px Georgia';
    g.fillText('CLOSED WINDOW', X(-330), Y(-490));
    g.fillText('RAISED DOOR · TOY RAILWAY', X(430), Y(530));
  } else {
    if (mine[0]) arrow(mine[0].x, mine[0].z, 0, mine[0].z * 0.3, '#1e3050', 'PATROL', false);
    if (mine[1] && theirs[1]) arrow(mine[1].x, mine[1].z, theirs[1].x * 0.4, theirs[1].z * 0.6, '#1e3050', 'OFFENSIVE SWEEP', false);
    if (theirs[0] && mine[0]) arrow(theirs[0].x, theirs[0].z, mine[0].x * 0.85, mine[0].z, '#7a1e14', 'EXPECTED BOMBER RAID', true);
    g.strokeStyle = '#5a4a30';
    g.setLineDash([3, 5]);
    g.beginPath();
    g.ellipse(X(0), Y(0), X(500) - X(0), Y(300) - Y(0), 0, 0, 7);
    g.stroke();
    g.setLineDash([]);
    g.fillStyle = '#5a4a30';
    g.fillText('Blimp patrol route', X(0), Y(-300) - 6);
  }
  FIELDS[sel.map].forEach(f => {
    const own = fieldAvailableToPlayer(f);
    const friendly = ['bonanza', 'squadbattle'].includes(sel.gameMode) || f.team === sel.team;
    const rebuilding = !!f.disabled && Number(f.rebuildRemaining) > 0;
    const fx = X(f.x);
    const fy = Y(f.z);
    const fieldColor = rebuilding ? '#bd913d' : f.disabled ? '#68645b' : f.team === 'blue' ? '#2b4a7a' : '#8a2a1e';
    if (own && !f.disabled) {
      g.beginPath();
      g.fillStyle = f.team === 'blue' ? 'rgba(38, 82, 122, 0.2)' : 'rgba(138, 42, 30, 0.2)';
      g.arc(fx, fy, 32, 0, Math.PI * 2);
      g.fill();
      g.beginPath();
      g.strokeStyle = '#f4d58b';
      g.lineWidth = 2.5;
      g.arc(fx, fy, 25, 0, Math.PI * 2);
      g.stroke();
    }
    g.fillStyle = fieldColor;
    g.beginPath();
    g.arc(fx, fy, friendly ? 20 : 10, 0, Math.PI * 2);
    g.fill();
    g.strokeStyle = friendly ? '#fff0c6' : '#ead9bd';
    g.lineWidth = friendly ? 2 : 1;
    g.stroke();
    if (rebuilding) {
      g.beginPath();
      g.strokeStyle = '#f3d27a';
      g.lineWidth = 3;
      g.arc(fx, fy, 25, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (1 - f.rebuildRemaining / 30));
      g.stroke();
    }
    g.fillStyle = '#f4ead2';
    g.textAlign = 'center';
    g.font = friendly ? 'bold 22px Georgia' : 'bold 14px Georgia';
    g.fillText(rebuilding ? '↻' : f.disabled ? '×' : '✈', fx, fy + (friendly ? 7 : 5));
    g.fillStyle = rebuilding ? '#755014' : f.disabled ? '#852f26' : '#2a1e10';
    g.font = friendly ? 'bold 12px Georgia' : 'italic 11px Georgia';
    g.fillText(f.name, fx, fy + (friendly ? 40 : 28));
    if (f.disabled) {
      g.fillStyle = rebuilding ? '#805b19' : '#761f19';
      g.font = 'bold 10px Georgia';
      g.fillText(rebuilding ? `REBUILDING · ${Math.ceil(f.rebuildRemaining)}s` : `DESTROYED · ${f.bombHits || 15}/15`, fx, fy + (friendly ? 53 : 40));
      if (!rebuilding) {
        g.strokeStyle = '#76251f';
        g.lineWidth = 3;
        g.beginPath();
        g.moveTo(fx - 12, fy - 12);
        g.lineTo(fx + 12, fy + 12);
        g.moveTo(fx + 12, fy - 12);
        g.lineTo(fx - 12, fy + 12);
        g.stroke();
      }
    } else if (!f.rear && (f.bombHits || 0) > 0) {
      g.fillStyle = '#6a2c1d';
      g.font = 'bold 10px Georgia';
      g.fillText(`BOMBED · ${f.bombHits}/15`, fx, fy + (friendly ? 53 : 40));
    } else if (f.rear) {
      g.fillStyle = '#53452c';
      g.font = 'italic 9px Georgia';
      g.fillText('REAR RESERVE', fx, fy + (friendly ? 53 : 40));
    }
  });
  if (sel.gameMode === 'squadron') {
    for (const sector of sectorControl) {
      const sx = X(sector.x);
      const sy = Y(sector.z);
      g.beginPath();
      g.arc(sx, sy, sector.owner ? 3.1 : 1.7, 0, Math.PI * 2);
      g.fillStyle = sector.owner === 'blue' ? 'rgba(39,87,145,.82)' : sector.owner === 'red' ? 'rgba(153,48,39,.82)' : 'rgba(68,60,47,.24)';
      g.fill();
      if (sector.id === sectorCapture.id && sectorCapture.elapsed > 0) {
        g.beginPath();
        g.strokeStyle = '#f1c968';
        g.lineWidth = 1.5;
        g.arc(sx, sy, 5.5, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.min(1, sectorCapture.elapsed / 5));
        g.stroke();
      }
    }
  }
  g.fillStyle = '#2a1e10';
  g.textAlign = 'left';
  g.font = 'bold 18px Georgia';
  g.fillText(sel.map === 'trenches' ? 'SECTOR MAP — TRENCHES, WESTERN FRONT 1917' : sel.map === 'stranda' ? 'SECTOR MAP — FJORDS, SUNNMØRE' : 'SECTOR MAP — PLAYROOM FRONT', 20, 30);
  g.font = '12px Georgia';
  if (sel.gameMode === 'squadron') {
    const counts = sectorCounts();
    g.fillText(`FRONTLINE · BLUE ${counts.blue} SECTORS — RED ${counts.red} SECTORS · Flags mark each sector`, 20, H - 30);
    g.fillText('Emergency-land safely · leave your aircraft · hold beside a flag for 5 seconds · airfields require bombing.', 20, H - 12);
  } else {
    g.fillText('Bounties: Scout $150 · Bomber $200 · Blimp $50 · Warship $150 · Supply vessel $90', 20, H - 30);
    g.fillText('Killstreaks pay extra · +$50/min after 2 min aloft · Tap one of your airfields to deploy.', 20, H - 12);
  }
}
let fieldMapRefreshT = 0;
function drawLiveWarMap() {
  const canvas = $('live-warmap');
  if (!canvas) return;
  drawWarMap(canvas);
  const context = canvas.getContext('2d');
  const X = x => mapCanvasX(x, canvas.width);
  const Y = z => mapCanvasY(z, canvas.height);
  const aircraftMarker = (plane, isPlayer = false) => {
    if (!plane?.g?.visible || plane.dying) return;
    const x = X(plane.g.position.x);
    const y = Y(plane.g.position.z);
    context.save();
    context.translate(x, y);
    context.rotate(-plane.g.rotation.y);
    context.fillStyle = isPlayer ? '#f2b73b' : plane.team === 'red' ? '#a6372c' : '#315e91';
    context.strokeStyle = isPlayer ? '#31251a' : '#f0e3c5';
    context.lineWidth = isPlayer ? 2.5 : 1.3;
    context.beginPath();
    context.moveTo(0, -8);
    context.lineTo(5, 5);
    context.lineTo(0, 3);
    context.lineTo(-5, 5);
    context.closePath();
    context.fill();
    context.stroke();
    context.restore();
  };
  const playerPosition = mode === 'foot' ? foot.pos : mode === 'truck' && truckDriver ? truckDriver.g.position : player?.g?.position;
  if (player && planes.includes(player)) {
    for (const plane of planes) aircraftMarker(plane, plane === player && mode !== 'foot');
  }
  for (const vehicle of groundVehicles) {
    if (vehicle.dead > 0 || !vehicle.g.visible) continue;
    const x = X(vehicle.g.position.x);
    const y = Y(vehicle.g.position.z);
    context.fillStyle = vehicle.team === 'red' ? '#a6372c' : '#315e91';
    context.strokeStyle = '#30281c';
    context.lineWidth = 1;
    context.save();
    context.translate(x, y);
    context.rotate(-vehicle.g.rotation.y);
    if (vehicle.type === 'tank') {
      context.fillRect(-4.2, -6, 8.4, 12);
      context.strokeRect(-4.2, -6, 8.4, 12);
      context.fillStyle = '#332f27';
      context.fillRect(-5.5, -6, 1.2, 12);
      context.fillRect(4.3, -6, 1.2, 12);
      context.fillStyle = vehicle.team === 'red' ? '#d6c4a2' : '#e2dfc8';
      context.beginPath();
      context.moveTo(0, -8.5);
      context.lineTo(2.3, -4.8);
      context.lineTo(-2.3, -4.8);
      context.closePath();
      context.fill();
    } else {
      context.fillRect(-3.1, -4.5, 6.2, 9.5);
      context.strokeRect(-3.1, -4.5, 6.2, 9.5);
      context.fillStyle = '#b6a179';
      context.fillRect(-2.2, -5.3, 4.4, 2.1);
    }
    context.restore();
  }
  if (playerPosition) {
    const x = X(playerPosition.x);
    const y = Y(playerPosition.z);
    context.beginPath();
    context.arc(x, y, 9, 0, Math.PI * 2);
    context.fillStyle = '#f2b73b';
    context.fill();
    context.strokeStyle = '#35291a';
    context.lineWidth = 2;
    context.stroke();
    context.fillStyle = '#292116';
    context.font = 'bold 10px Georgia';
    context.textAlign = 'center';
    context.fillText('YOU', x, y + 3.5);
  }
}
function toggleFieldMap(force = null) {
  const overlay = $('field-map-overlay');
  if (!overlay) return;
  const activeMission = roundInProgress && !['menu', 'over', 'shop', 'debrief'].includes(mode);
  if (!activeMission && force !== false) return;
  const open = force === null ? overlay.style.display !== 'grid' : !!force;
  overlay.style.display = open ? 'grid' : 'none';
  overlay.setAttribute('aria-hidden', String(!open));
  if (open) {
    fieldMapRefreshT = 0;
    drawLiveWarMap();
  }
}
function updateLiveWarMap(dt) {
  if ($('field-map-overlay')?.style.display !== 'grid') return;
  fieldMapRefreshT -= dt;
  if (fieldMapRefreshT <= 0) {
    fieldMapRefreshT = 0.28;
    drawLiveWarMap();
  }
}
const RIVER_POINTS = [[-1480, -1560], [-1190, -1330], [-930, -1100], [-690, -870], [-460, -650], [-225, -470], [-65, -300], [25, -130], [-35, 40], [-30, 230], [80, 405], [310, 475], [570, 470], [810, 560], [1050, 760], [1290, 990], [1530, 1220], [1770, 1450]];
function trenchSupplyBankPoints(side) {
  const points = [];
  for (let i = 2; i <= 14; i++) {
    const before = RIVER_POINTS[Math.max(0, i - 1)];
    const after = RIVER_POINTS[Math.min(RIVER_POINTS.length - 1, i + 1)];
    const dx = after[0] - before[0];
    const dz = after[1] - before[1];
    const length = Math.hypot(dx, dz) || 1;
    const offset = 168 + Math.sin(i * 0.83) * 9;
    points.push([RIVER_POINTS[i][0] - dz / length * offset * side, RIVER_POINTS[i][1] + dx / length * offset * side]);
  }
  return points;
}
function trenchSupplyCurve(side) {
  return new THREE.CatmullRomCurve3(trenchSupplyBankPoints(side).map(([x, z]) => new THREE.Vector3(x, 0, z)), false, 'centripetal');
}
function buildTrenchesSupplyRoads() {
  frontSupplyRoutes = {
    blue: trenchSupplyCurve(-1),
    red: trenchSupplyCurve(1)
  };
  const addRibbon = (curve, width, lateral, lift, color) => {
    const positions = [];
    const indices = [];
    const samples = 180;
    for (let i = 0; i <= samples; i++) {
      const t = i / samples;
      const center = curve.getPointAt(t);
      const tangent = curve.getTangentAt(t).setY(0).normalize();
      const nx = -tangent.z;
      const nz = tangent.x;
      for (const edge of [-1, 1]) {
        const x = center.x + nx * (lateral + edge * width * 0.5);
        const z = center.z + nz * (lateral + edge * width * 0.5);
        positions.push(x, heightAt(x, z) + lift, z);
      }
      if (i < samples) {
        const a = i * 2;
        indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
      }
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    world.add(new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({
      color,
      side: THREE.DoubleSide
    })));
  };
  for (const curve of Object.values(frontSupplyRoutes)) {
    addRibbon(curve, 19, 0, 0.07, 0x78684a);
    addRibbon(curve, 13, 0, 0.15, 0x675238);
    addRibbon(curve, 1.5, -3.4, 0.19, 0x504632);
    addRibbon(curve, 1.5, 3.4, 0.19, 0x504632);
  }
}
function riverDistance(x, z) {
  let nearest = Infinity;
  for (let i = 0; i < RIVER_POINTS.length - 1; i++) {
    const a = RIVER_POINTS[i];
    const b = RIVER_POINTS[i + 1];
    const dx = b[0] - a[0];
    const dz = b[1] - a[1];
    const t = THREE.MathUtils.clamp(((x - a[0]) * dx + (z - a[1]) * dz) / (dx * dx + dz * dz), 0, 1);
    nearest = Math.min(nearest, Math.hypot(x - (a[0] + dx * t), z - (a[1] + dz * t)));
  }
  return nearest;
}
const FJORD_CHANNELS = [[[-2050, 0], [-1420, -12], [-820, -5], [-260, 0], [0, 0]], [[0, 0], [430, -110], [880, -280], [1360, -520], [1950, -820]], [[0, 0], [430, 110], [880, 280], [1360, 520], [1950, 820]]];
function fjordCenterZ(x) {
  return x < 0 ? Math.sin(x * 0.001) * 8 : 0;
}
function nearestFjordChannelPoint(x, z) {
  let best = {
    x: 0,
    z: 0,
    distance: Infinity,
    tangentX: 1,
    tangentZ: 0
  };
  for (const route of FJORD_CHANNELS) {
    for (let i = 0; i < route.length - 1; i++) {
      const a = route[i];
      const b = route[i + 1];
      const dx = b[0] - a[0];
      const dz = b[1] - a[1];
      const lengthSq = dx * dx + dz * dz;
      const t = THREE.MathUtils.clamp(((x - a[0]) * dx + (z - a[1]) * dz) / lengthSq, 0, 1);
      const px = a[0] + dx * t;
      const pz = a[1] + dz * t;
      const distance = Math.hypot(x - px, z - pz);
      if (distance < best.distance) best = {
        x: px,
        z: pz,
        distance,
        tangentX: dx / Math.sqrt(lengthSq),
        tangentZ: dz / Math.sqrt(lengthSq)
      };
    }
  }
  return best;
}
function fjordChannelDistance(x, z) {
  return nearestFjordChannelPoint(x, z).distance;
}
function fjordShipLaneZ(x, routeZ) {
  return -Math.sin(x * 0.004) * 18 + routeZ + (x > 0 ? Math.sign(routeZ) * x * 0.42 : 0);
}
function fieldRunwayHeading(field) {
  if (!field) return 0;
  if (sel.map === 'stranda') {
    const water = nearestFjordChannelPoint(field.x, field.z);
    const dx = water.x - field.x;
    const dz = water.z - field.z;
    return Math.atan2(-dx, -dz);
  }
  if (sel.map === 'bedroom') return field.team === 'red' ? Math.PI : -Math.PI * 0.32;
  return 0;
}
function fieldLocalPoint(field, localX, localZ) {
  const offset = new THREE.Vector3(localX, 0, localZ).applyAxisAngle(new THREE.Vector3(0, 1, 0), fieldRunwayHeading(field));
  return {
    x: field.x + offset.x,
    z: field.z + offset.z
  };
}
function runwayStartPoint(field, distance = 50, laneOffset = 0) {
  return fieldLocalPoint(field, laneOffset, distance);
}
const RUNWAY_SURFACE_RAISE = {
  trenches: 0.12,
  stranda: 0.12,
  bedroom: 0.58
};
const AIRCRAFT_WHEEL_BOTTOM = 1.51;
function planeGroundY(aircraft, x, z) {
  const scale = Math.max(0.5, Math.abs(aircraft?.g?.scale?.y || 1));
  const runwayRaise = RUNWAY_SURFACE_RAISE[sel.map] ?? RUNWAY_SURFACE_RAISE.trenches;
  return heightAt(x, z) + runwayRaise + AIRCRAFT_WHEEL_BOTTOM * scale;
}
function runwayLaneOffsets() {
  return sel.map === 'bedroom' ? [-30, 30] : [-16, 16];
}
function nextRunwayLane(team) {
  const slot = runwayLaneCounters[team] || 0;
  runwayLaneCounters[team] = slot + 1;
  return runwayLaneOffsets()[slot % 2];
}
function rawHeight(x, z) {
  const n = Math.sin(x * 0.013) * Math.cos(z * 0.011) * 4 + Math.sin(x * 0.05 + z * 0.03) * 1.2;
  if (sel.map === 'trenches') {
    const ground = n + 4;
    const d = riverDistance(x, z);
    return d < 68 ? ground - 14 * (1 - THREE.MathUtils.smoothstep(d, 0, 68)) : ground;
  }
  const d = fjordChannelDistance(x, z);
  if (d < 100) return -48 + d * 0.105 + n * 0.35;
  const valleySlope = -38 + Math.pow(d - 100, 1.08) * 0.53;
  const ridgePhase = (x + z * 0.42) * 0.006 + Math.sin(z * 0.0028) * 0.75;
  const crossRidgePhase = (x * 0.31 - z) * 0.01 + Math.sin(x * 0.003) * 0.55;
  const longRidges = Math.pow(1 - Math.abs(Math.sin(ridgePhase)), 2);
  const crossRidges = Math.pow(1 - Math.abs(Math.sin(crossRidgePhase)), 2);
  const broadFolds = Math.sin(x * 0.0023 + z * 0.0014) * Math.cos(z * 0.0026 - x * 0.0011);
  const rockyDetail = Math.sin(x * 0.018 + z * 0.012) * Math.sin(z * 0.021 - x * 0.011);
  const ruggedness = THREE.MathUtils.smoothstep(d, 104, 390);
  const relief = ruggedness * (longRidges * 38 + crossRidges * 18 + broadFolds * 23 + rockyDetail * 8);
  return THREE.MathUtils.clamp(valleySlope + relief + n * 1.1, -55, 340);
}
function heightAt(x, z) {
  if (sel.map === 'bedroom') {
    for (const surface of Object.values(BEDROOM_SURFACES)) {
      if (Math.abs(x - surface.x) <= surface.halfX && Math.abs(z - surface.z) <= surface.halfZ) return surface.height;
    }
    return 0;
  }
  let h = rawHeight(x, z);
  for (const f of FIELDS[sel.map]) {
    const local = new THREE.Vector3(x - f.x, 0, z - f.z).applyAxisAngle(new THREE.Vector3(0, 1, 0), -fieldRunwayHeading(f));
    const localX = local.x;
    const localZ = local.z;
    const d = Math.hypot(localX, localZ * 0.5);
    const fh = sel.map === 'stranda' ? f.team === 'red' ? rawHeight(f.x, f.z) : 12 : 4;
    if (d < 80) h = THREE.MathUtils.lerp(fh, h, THREE.MathUtils.smoothstep(d, 50, 80));
    if (Math.abs(localX) < 34 && Math.abs(localZ) < 78) {
      const fade = 1 - Math.max(Math.abs(localX) / 34, Math.abs(localZ) / 78);
      h += fade * (0.075 * Math.sin(localZ * 0.34) + 0.045 * Math.sin(localX * 0.82 + localZ * 0.17) + 0.035 * Math.sin(localZ * 1.3));
    }
  }
  return h;
}
let world = new THREE.Group();
let recoveryCaches = [];
let recoveryCacheSiteCursor = 0;
let recoveryCacheSpawnTimer = 0;
let recoveryCacheUfoSpawned = false;
let recoveryCacheSpecialTimers = null;
function makeRecoveryCacheMarkerTexture(label, accent) {
  const canvas = document.createElement('canvas');
  canvas.width = 320;
  canvas.height = 72;
  const context = canvas.getContext('2d');
  context.fillStyle = 'rgba(30,25,18,.92)';
  context.fillRect(2, 2, 316, 68);
  context.strokeStyle = accent;
  context.lineWidth = 4;
  context.strokeRect(4, 4, 312, 64);
  context.fillStyle = '#f5e6c3';
  context.font = 'bold 30px Georgia,serif';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(label, 160, 37);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
const recoveryCacheMarkerTexture = makeRecoveryCacheMarkerTexture('WRECK CACHE', '#e0bd70');
const ufoCacheMarkerTexture = makeRecoveryCacheMarkerTexture('UNKNOWN CRAFT', '#71e8e1');
const jetCacheMarkerTexture = makeRecoveryCacheMarkerTexture('UNIDENTIFIED WRECK', '#aab5ba');
const spitfireCacheMarkerTexture = makeRecoveryCacheMarkerTexture('SPITFIRE WRECK', '#e9e1cb');
let courierMission = {
  active: false,
  pickedUp: false,
  completed: false,
  sourceGroup: null,
  source: null,
  destinationField: null
};
const recoveryCacheParts = {
  fuselage: new THREE.CylinderGeometry(0.34, 0.5, 6.4, 8),
  wing: new THREE.BoxGeometry(8.2, 0.18, 2.2),
  crate: new THREE.BoxGeometry(2.1, 1.35, 1.7),
  crateBand: new THREE.BoxGeometry(0.12, 1.4, 1.78),
  pole: new THREE.CylinderGeometry(0.055, 0.075, 4.4, 6),
  pennant: new THREE.PlaneGeometry(2.1, 1.15)
};
const recoveryCacheSharedGeometries = new Set(Object.values(recoveryCacheParts));
const recoveryCacheMaterials = {
  wood: new THREE.MeshLambertMaterial({
    color: 0x59412d
  }),
  torn: new THREE.MeshLambertMaterial({
    color: 0x39352e
  }),
  canvas: new THREE.MeshLambertMaterial({
    color: 0x877b5d,
    side: THREE.DoubleSide
  }),
  crate: new THREE.MeshLambertMaterial({
    color: 0x795b36
  }),
  brass: new THREE.MeshLambertMaterial({
    color: 0xb39252
  }),
  pennant: new THREE.MeshLambertMaterial({
    color: 0xa33326,
    side: THREE.DoubleSide
  }),
  smoke: new THREE.SpriteMaterial({
    map: cloudTex,
    color: 0x665f52,
    transparent: true,
    opacity: 0.18,
    depthWrite: false,
    fog: false
  }),
  marker: new THREE.SpriteMaterial({
    map: recoveryCacheMarkerTexture,
    transparent: true,
    depthWrite: false,
    fog: false,
    toneMapped: false
  }),
  ufoMarker: new THREE.SpriteMaterial({
    map: ufoCacheMarkerTexture,
    transparent: true,
    depthWrite: false,
    fog: false,
    toneMapped: false
  }),
  jetMarker: new THREE.SpriteMaterial({
    map: jetCacheMarkerTexture,
    transparent: true,
    depthWrite: false,
    fog: false,
    toneMapped: false
  }),
  spitfireMarker: new THREE.SpriteMaterial({
    map: spitfireCacheMarkerTexture,
    transparent: true,
    depthWrite: false,
    fog: false,
    toneMapped: false
  }),
  ufoHull: new THREE.MeshStandardMaterial({
    color: 0x879b96,
    metalness: 0.86,
    roughness: 0.24
  }),
  ufoRim: new THREE.MeshStandardMaterial({
    color: 0x394b4b,
    metalness: 0.72,
    roughness: 0.36
  }),
  ufoGlass: new THREE.MeshStandardMaterial({
    color: 0x52d8d4,
    emissive: 0x167f83,
    emissiveIntensity: 1.1,
    metalness: 0.3,
    roughness: 0.18,
    transparent: true,
    opacity: 0.9
  }),
  ufoGlow: new THREE.MeshBasicMaterial({
    color: 0x56f4e8,
    transparent: true,
    opacity: 0.24,
    side: THREE.DoubleSide,
    depthWrite: false,
    toneMapped: false
  }),
  soot: new THREE.MeshBasicMaterial({
    color: 0x171613,
    transparent: true,
    opacity: 0.62,
    depthWrite: false,
    side: THREE.DoubleSide
  }),
  wreckIron: new THREE.MeshLambertMaterial({
    color: 0x464841
  }),
  jetHull: new THREE.MeshLambertMaterial({
    color: 0x667078
  }),
  jetGlass: new THREE.MeshStandardMaterial({
    color: 0x263743,
    metalness: 0.22,
    roughness: 0.32,
    transparent: true,
    opacity: 0.82
  }),
  spitfireHull: new THREE.MeshLambertMaterial({
    color: 0x716047
  }),
  roundelBlue: new THREE.MeshBasicMaterial({
    color: 0x254d82,
    side: THREE.DoubleSide
  }),
  roundelWhite: new THREE.MeshBasicMaterial({
    color: 0xe9e2d0,
    side: THREE.DoubleSide
  }),
  roundelRed: new THREE.MeshBasicMaterial({
    color: 0xa5372c,
    side: THREE.DoubleSide
  })
};
function recoveryCacheSites() {
  if (sel.map === 'trenches') return [{
    x: -245,
    z: -780,
    type: 'wreck',
    wreckStyle: 'biplane'
  }, {
    x: 235,
    z: -390,
    type: 'wreck',
    wreckStyle: 'bomber'
  }, {
    x: -220,
    z: 320,
    type: 'wreck',
    wreckStyle: 'biplane'
  }, {
    x: 250,
    z: 870,
    type: 'wreck',
    wreckStyle: 'bomber'
  }, {
    x: -1680,
    z: -1370,
    type: 'ufo'
  }, {
    x: 1690,
    z: -1375,
    type: 'jet'
  }, {
    x: -1700,
    z: 1370,
    type: 'spitfire'
  }];
  if (sel.map === 'stranda') return [{
    x: -720,
    z: 220,
    type: 'wreck',
    wreckStyle: 'biplane'
  }, {
    x: 300,
    z: 185,
    type: 'wreck',
    wreckStyle: 'bomber'
  }, {
    x: 840,
    z: 500,
    type: 'wreck',
    wreckStyle: 'biplane'
  }, {
    x: 840,
    z: -500,
    type: 'wreck',
    wreckStyle: 'bomber'
  }];
  return [];
}
function disposeRecoveryCacheVisual(group) {
  const geometries = new Set();
  group?.traverse(object => {
    if (object.geometry && !recoveryCacheSharedGeometries.has(object.geometry)) geometries.add(object.geometry);
    const materials = Array.isArray(object.material) ? object.material : object.material ? [object.material] : [];
    for (const material of materials) if (material.userData?.recoveryCacheOwned) material.dispose();
  });
  for (const geometry of geometries) geometry.dispose();
}
function clearRecoveryCaches() {
  for (const cache of recoveryCaches) {
    disposeRecoveryCacheVisual(cache.group);
    cache.group.removeFromParent();
  }
  recoveryCaches = [];
  recoveryCacheSiteCursor = 0;
  recoveryCacheSpawnTimer = 0;
  recoveryCacheUfoSpawned = false;
  recoveryCacheSpecialTimers = null;
}
function spawnRecoveryCache(requestedType = 'wreck') {
  const sites = recoveryCacheSites();
  if (!sites.length || recoveryCaches.length >= 3) return false;
  const eligibleIndices = sites.map((site, index) => ({
    site,
    index
  })).filter(entry => (entry.site.type || 'wreck') === requestedType).map(entry => entry.index);
  if (!eligibleIndices.length) return false;
  for (let attempt = 0; attempt < eligibleIndices.length; attempt++) {
    const index = eligibleIndices[(recoveryCacheSiteCursor + attempt) % eligibleIndices.length];
    if (recoveryCaches.some(cache => cache.siteIndex === index)) continue;
    const site = sites[index];
    const type = site.type || 'wreck';
    if (sel.map === 'trenches' && riverDistance(site.x, site.z) < 110) continue;
    if (sel.map === 'stranda' && fjordChannelDistance(site.x, site.z) < 165) continue;
    if (FIELDS[sel.map].some(field => Math.hypot(site.x - field.x, site.z - field.z) < 125)) continue;
    const ground = heightAt(site.x, site.z);
    const group = new THREE.Group();
    group.position.set(site.x, ground, site.z);
    group.rotation.y = Math.random() * Math.PI * 2;
    let plumeColor = 0x665f52;
    if (type === 'ufo') {
      recoveryCacheUfoSpawned = true;
      plumeColor = 0x46d8d0;
      const saucer = new THREE.Group();
      const rim = new THREE.Mesh(new THREE.CylinderGeometry(3.7, 3.7, 0.36, 28), recoveryCacheMaterials.ufoRim);
      rim.position.y = 1.02;
      const hull = new THREE.Mesh(new THREE.CylinderGeometry(3.45, 2.2, 0.78, 24), recoveryCacheMaterials.ufoHull);
      hull.position.y = 1.3;
      hull.rotation.y = 0.1;
      const dome = new THREE.Mesh(new THREE.SphereGeometry(1.42, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), recoveryCacheMaterials.ufoGlass);
      dome.position.y = 1.62;
      dome.scale.set(1, 1.22, 1);
      const belly = new THREE.Mesh(new THREE.SphereGeometry(1.4, 16, 10, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), recoveryCacheMaterials.ufoHull);
      belly.position.y = 0.82;
      const lightRing = new THREE.Mesh(new THREE.TorusGeometry(2.95, 0.085, 7, 32), recoveryCacheMaterials.ufoGlass);
      lightRing.rotation.x = Math.PI / 2;
      lightRing.position.y = 1.15;
      saucer.add(rim, hull, dome, belly, lightRing);
      for (let i = 0; i < 10; i++) {
        const angle = i / 10 * Math.PI * 2;
        const window = new THREE.Mesh(new THREE.SphereGeometry(0.17, 8, 6), recoveryCacheMaterials.ufoGlass);
        window.position.set(Math.cos(angle) * 3.15, 1.31, Math.sin(angle) * 3.15);
        window.scale.set(1, 0.72, 1);
        saucer.add(window);
      }
      const beam = new THREE.Mesh(new THREE.ConeGeometry(1.85, 3.1, 16, 1, true), recoveryCacheMaterials.ufoGlow);
      beam.rotation.z = Math.PI;
      beam.position.set(0, 0.05, 0);
      saucer.add(beam);
      for (let i = 0; i < 3; i++) {
        const angle = i / 3 * Math.PI * 2 + 0.35;
        const foot = new THREE.Mesh(new THREE.SphereGeometry(0.3, 8, 6), recoveryCacheMaterials.ufoRim);
        foot.position.set(Math.cos(angle) * 2.9, 0.12, Math.sin(angle) * 2.9);
        const strut = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.12, 0.92, 7), recoveryCacheMaterials.ufoRim);
        strut.position.set(Math.cos(angle) * 2.55, 0.55, Math.sin(angle) * 2.55);
        strut.rotation.z = Math.cos(angle) * -0.35;
        strut.rotation.x = Math.sin(angle) * 0.35;
        saucer.add(foot, strut);
      }
      group.add(saucer);
      const impactMark = new THREE.Mesh(new THREE.CircleGeometry(5.1, 24), recoveryCacheMaterials.soot);
      impactMark.rotation.x = -Math.PI / 2;
      impactMark.position.y = 0.025;
      group.add(impactMark);
      for (let i = 0; i < 7; i++) {
        const shard = new THREE.Mesh(new THREE.BoxGeometry(0.45 + Math.random() * 0.65, 0.18 + Math.random() * 0.28, 0.35 + Math.random() * 0.55), recoveryCacheMaterials.ufoRim);
        const angle = Math.random() * Math.PI * 2;
        const radius = 4.3 + Math.random() * 2.5;
        shard.position.set(Math.cos(angle) * radius, 0.22, Math.sin(angle) * radius);
        shard.rotation.set((Math.random() - 0.5) * 0.6, Math.random() * Math.PI, (Math.random() - 0.5) * 0.55);
        group.add(shard);
      }
      const oddCrate = new THREE.Mesh(recoveryCacheParts.crate, recoveryCacheMaterials.wreckIron);
      oddCrate.position.set(-4.6, 0.66, 1.2);
      oddCrate.rotation.y = 0.55;
      group.add(oddCrate);
    } else if (type === 'jet' || type === 'spitfire') {
      const scorch = new THREE.Mesh(new THREE.CircleGeometry(type === 'jet' ? 8.6 : 6.2, 24), recoveryCacheMaterials.soot);
      scorch.rotation.x = -Math.PI / 2;
      scorch.position.y = 0.025;
      scorch.scale.set(1.25, type === 'jet' ? 1.35 : 1.1, 1);
      group.add(scorch);
      if (type === 'jet') {
        const fuselage = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.6, 11.4, 12), recoveryCacheMaterials.jetHull);
        fuselage.rotation.x = Math.PI / 2;
        fuselage.scale.z = 1.1;
        fuselage.position.set(0.35, 0.64, 0.05);
        const nose = new THREE.Mesh(new THREE.ConeGeometry(0.46, 3.1, 12), recoveryCacheMaterials.jetHull);
        nose.rotation.x = -Math.PI / 2;
        nose.position.set(0.35, 0.6, -6.45);
        const wing = new THREE.Mesh(new THREE.BoxGeometry(12.5, 0.2, 2.7), recoveryCacheMaterials.jetHull);
        wing.position.set(0.1, 0.53, -0.1);
        wing.rotation.y = -0.18;
        const brokenWing = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.18, 2.1), recoveryCacheMaterials.wreckIron);
        brokenWing.position.set(6.2, 0.38, 1.7);
        brokenWing.rotation.set(0.12, 0.35, -0.16);
        const tailplane = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.16, 1.15), recoveryCacheMaterials.jetHull);
        tailplane.position.set(0.35, 0.58, 4.9);
        const finLeft = new THREE.Mesh(new THREE.BoxGeometry(0.18, 1.9, 1.45), recoveryCacheMaterials.jetHull);
        finLeft.position.set(-0.78, 1.24, 4.75);
        finLeft.rotation.z = -0.14;
        const finRight = finLeft.clone();
        finRight.position.x = 0.78;
        const canopy = new THREE.Mesh(new THREE.SphereGeometry(0.8, 14, 9), recoveryCacheMaterials.jetGlass);
        canopy.scale.set(0.8, 0.58, 1.55);
        canopy.position.set(0.35, 1.1, -1.85);
        const intakeL = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.55, 1.05), recoveryCacheMaterials.wreckIron);
        intakeL.position.set(-0.72, 0.46, -2.35);
        const intakeR = intakeL.clone();
        intakeR.position.x = 1.42;
        const engineA = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.52, 1.2, 10), recoveryCacheMaterials.wreckIron);
        engineA.rotation.x = Math.PI / 2;
        engineA.position.set(-0.28, 0.56, 5.7);
        const engineB = engineA.clone();
        engineB.position.x = 0.98;
        group.add(fuselage, nose, wing, brokenWing, tailplane, finLeft, finRight, canopy, intakeL, intakeR, engineA, engineB);
        for (const [x, z, size] of [[-5.3, 1.9, 2.6], [4.6, -0.8, 1.8], [-1.5, 7.1, 2.1]]) {
          const fragment = new THREE.Mesh(new THREE.BoxGeometry(size, 0.18, 0.75), recoveryCacheMaterials.jetHull);
          fragment.position.set(x, 0.18, z);
          fragment.rotation.set((Math.random() - 0.5) * 0.25, Math.random() * Math.PI, (Math.random() - 0.5) * 0.22);
          group.add(fragment);
        }
      } else {
        const fuselage = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.48, 11.2, 12), recoveryCacheMaterials.spitfireHull);
        fuselage.rotation.x = Math.PI / 2;
        fuselage.scale.z = 0.95;
        fuselage.position.set(-0.2, 0.57, 0.15);
        const nose = new THREE.Mesh(new THREE.ConeGeometry(0.42, 2.4, 12), recoveryCacheMaterials.spitfireHull);
        nose.rotation.x = -Math.PI / 2;
        nose.position.set(-0.2, 0.54, -6.55);
        const ellipticalWing = new THREE.Mesh(new THREE.SphereGeometry(1, 22, 12), recoveryCacheMaterials.spitfireHull);
        ellipticalWing.scale.set(6.2, 0.14, 1.75);
        ellipticalWing.position.set(-0.1, 0.49, -0.3);
        const brokenTip = new THREE.Mesh(new THREE.BoxGeometry(2.9, 0.14, 1.35), recoveryCacheMaterials.torn);
        brokenTip.position.set(5.25, 0.34, 1.1);
        brokenTip.rotation.set(0.18, -0.12, 0.24);
        const tailplane = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 8), recoveryCacheMaterials.spitfireHull);
        tailplane.scale.set(2.5, 0.1, 0.72);
        tailplane.position.set(-0.2, 0.55, 4.65);
        const canopy = new THREE.Mesh(new THREE.SphereGeometry(0.58, 14, 9), recoveryCacheMaterials.jetGlass);
        canopy.scale.set(0.75, 0.56, 1.6);
        canopy.position.set(-0.2, 1.03, -1.8);
        const propHub = new THREE.Mesh(new THREE.SphereGeometry(0.25, 10, 8), recoveryCacheMaterials.brass);
        propHub.position.set(-0.2, 0.58, -6.25);
        const propBlade = new THREE.Mesh(new THREE.BoxGeometry(0.15, 1.95, 0.12), recoveryCacheMaterials.wreckIron);
        propBlade.position.copy(propHub.position).add(new THREE.Vector3(0, 0.55, -0.05));
        propBlade.rotation.z = -0.45;
        const brokenProp = propBlade.clone();
        brokenProp.position.copy(propHub.position).add(new THREE.Vector3(0.15, -0.5, 0.05));
        brokenProp.scale.y = 0.62;
        brokenProp.rotation.z = 0.65;
        group.add(fuselage, nose, ellipticalWing, brokenTip, tailplane, canopy, propHub, propBlade, brokenProp);
        for (const side of [-1, 1]) {
          const blue = new THREE.Mesh(new THREE.CircleGeometry(0.62, 20), recoveryCacheMaterials.roundelBlue);
          blue.rotation.x = -Math.PI / 2;
          blue.position.set(side * 3.2, 0.66, -0.35);
          const white = new THREE.Mesh(new THREE.CircleGeometry(0.39, 20), recoveryCacheMaterials.roundelWhite);
          white.rotation.x = -Math.PI / 2;
          white.position.set(side * 3.2, 0.69, -0.35);
          const red = new THREE.Mesh(new THREE.CircleGeometry(0.2, 16), recoveryCacheMaterials.roundelRed);
          red.rotation.x = -Math.PI / 2;
          red.position.set(side * 3.2, 0.72, -0.35);
          group.add(blue, white, red);
        }
      }
      for (let i = 0; i < 8; i++) {
        const fragment = new THREE.Mesh(new THREE.BoxGeometry(0.35 + Math.random() * 1.1, 0.16 + Math.random() * 0.3, 0.3 + Math.random() * 0.8), recoveryCacheMaterials.wreckIron);
        fragment.position.set((Math.random() - 0.5) * 13, 0.18 + Math.random() * 0.2, (Math.random() - 0.5) * 11);
        fragment.rotation.set(Math.random() * 0.2, Math.random() * Math.PI, (Math.random() - 0.5) * 0.3);
        group.add(fragment);
      }
    } else {
      const scorch = new THREE.Mesh(new THREE.CircleGeometry(3.4, 22), recoveryCacheMaterials.soot);
      scorch.rotation.x = -Math.PI / 2;
      scorch.position.y = 0.025;
      const fuselage = new THREE.Mesh(recoveryCacheParts.fuselage, recoveryCacheMaterials.torn);
      fuselage.rotation.x = Math.PI / 2;
      fuselage.position.set(0.7, 0.56, 0.8);
      fuselage.rotation.z = 0.1;
      const engineCowl = new THREE.Mesh(new THREE.CylinderGeometry(0.58, 0.68, 0.48, 14), recoveryCacheMaterials.wreckIron);
      engineCowl.rotation.x = Math.PI / 2;
      engineCowl.position.set(0.7, 0.6, -2.38);
      const wing = new THREE.Mesh(recoveryCacheParts.wing, recoveryCacheMaterials.canvas);
      wing.position.set(-0.4, 0.48, 1.25);
      wing.rotation.z = 0.12;
      wing.rotation.x = -0.1;
      const brokenWing = new THREE.Mesh(recoveryCacheParts.wing, recoveryCacheMaterials.torn);
      brokenWing.scale.set(0.58, 1, 0.82);
      brokenWing.position.set(2.2, 0.38, -0.8);
      brokenWing.rotation.set(0.16, 0, -0.48);
      const braceBetween = (a, b, radius, material) => {
        const start = new THREE.Vector3(...a);
        const end = new THREE.Vector3(...b);
        const direction = end.clone().sub(start);
        const brace = new THREE.Mesh(new THREE.CylinderGeometry(radius * 0.78, radius, direction.length(), 6), material);
        brace.position.copy(start).add(end).multiplyScalar(0.5);
        brace.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
        group.add(brace);
      };
      braceBetween([-3.25, 0.48, 0.75], [-1.4, 1.68, 0.55], 0.075, recoveryCacheMaterials.wood);
      braceBetween([1.1, 0.45, 1.5], [2.4, 1.48, 1.0], 0.06, recoveryCacheMaterials.wreckIron);
      braceBetween([-0.4, 0.52, 1.2], [0.35, 1.4, 1.05], 0.06, recoveryCacheMaterials.wood);
      const propHub = new THREE.Mesh(new THREE.SphereGeometry(0.2, 9, 7), recoveryCacheMaterials.brass);
      propHub.position.set(0.7, 0.61, -2.72);
      const propBladeA = new THREE.Mesh(new THREE.BoxGeometry(0.14, 1.85, 0.12), recoveryCacheMaterials.wood);
      propBladeA.position.copy(propHub.position).add(new THREE.Vector3(0, 0.78, 0.13));
      propBladeA.rotation.z = -0.58;
      const propBladeB = new THREE.Mesh(new THREE.BoxGeometry(0.13, 1.3, 0.1), recoveryCacheMaterials.torn);
      propBladeB.position.copy(propHub.position).add(new THREE.Vector3(0, -0.62, 0.12));
      propBladeB.rotation.z = 0.4;
      const cockpitRim = new THREE.Mesh(new THREE.TorusGeometry(0.48, 0.09, 7, 16), recoveryCacheMaterials.brass);
      cockpitRim.rotation.x = Math.PI / 2;
      cockpitRim.position.set(0.65, 1.2, 0.1);
      const cockpitSeat = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.82, 0.38), recoveryCacheMaterials.wood);
      cockpitSeat.position.set(0.65, 0.78, 0.1);
      const wheelA = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.18, 12), recoveryCacheMaterials.torn);
      wheelA.position.set(-1.4, 0.36, -1.8);
      wheelA.rotation.z = Math.PI / 2;
      const wheelB = wheelA.clone();
      wheelB.position.x = 2.25;
      const crate = new THREE.Mesh(recoveryCacheParts.crate, recoveryCacheMaterials.crate);
      crate.position.set(-2.2, 0.7, -1.4);
      const band = new THREE.Mesh(recoveryCacheParts.crateBand, recoveryCacheMaterials.brass);
      band.position.copy(crate.position);
      const pole = new THREE.Mesh(recoveryCacheParts.pole, recoveryCacheMaterials.wood);
      pole.position.set(-3.5, 2.2, 0.4);
      const pennant = new THREE.Mesh(recoveryCacheParts.pennant, recoveryCacheMaterials.pennant);
      pennant.position.set(-2.55, 3.45, 0.4);
      pennant.rotation.y = Math.PI / 2;
      group.add(scorch, fuselage, engineCowl, wing, brokenWing, propHub, propBladeA, propBladeB, cockpitRim, cockpitSeat, wheelA, wheelB, crate, band, pole, pennant);
      if (site.wreckStyle === 'bomber') {
        const upperWing = new THREE.Mesh(new THREE.BoxGeometry(12.8, 0.18, 2.8), recoveryCacheMaterials.canvas);
        upperWing.position.set(-0.15, 1.92, 0.75);
        upperWing.rotation.z = -0.06;
        const detachedPanel = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.16, 2.5), recoveryCacheMaterials.torn);
        detachedPanel.position.set(-6.2, 0.42, -0.15);
        detachedPanel.rotation.set(0.2, 0.18, 0.36);
        group.add(upperWing, detachedPanel);
        for (const side of [-1, 1]) {
          const engine = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.56, 1.25, 10), recoveryCacheMaterials.wreckIron);
          engine.rotation.x = Math.PI / 2;
          engine.position.set(side * 2.8, 0.55, -0.15);
          const hub = new THREE.Mesh(new THREE.SphereGeometry(0.19, 8, 6), recoveryCacheMaterials.brass);
          hub.position.set(side * 2.8, 0.56, -0.86);
          const blade = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.65, 0.1), recoveryCacheMaterials.torn);
          blade.position.copy(hub.position).add(new THREE.Vector3(0, 0.52, -0.04));
          blade.rotation.z = side * -0.38;
          group.add(engine, hub, blade);
        }
        braceBetween([-3.1, 0.5, 0.8], [-3.0, 1.9, 1.1], 0.07, recoveryCacheMaterials.wreckIron);
        braceBetween([3.0, 0.5, 0.8], [2.9, 1.9, 1.1], 0.07, recoveryCacheMaterials.wood);
      }
      for (let i = 0; i < 6; i++) {
        const fragment = new THREE.Mesh(new THREE.BoxGeometry(0.18 + Math.random() * 0.48, 0.12 + Math.random() * 0.22, 0.28 + Math.random() * 0.52), i % 2 ? recoveryCacheMaterials.wood : recoveryCacheMaterials.wreckIron);
        fragment.position.set((Math.random() - 0.5) * 8, 0.16 + Math.random() * 0.32, (Math.random() - 0.5) * 7);
        fragment.rotation.set(Math.random() * 0.4, Math.random() * Math.PI, (Math.random() - 0.5) * 0.5);
        group.add(fragment);
      }
    }
    const markerMaterial = type === 'ufo' ? recoveryCacheMaterials.ufoMarker : type === 'jet' ? recoveryCacheMaterials.jetMarker : type === 'spitfire' ? recoveryCacheMaterials.spitfireMarker : recoveryCacheMaterials.marker;
    const marker = new THREE.Sprite(markerMaterial);
    marker.position.set(0, type === 'ufo' ? 10.5 : ['jet', 'spitfire'].includes(type) ? 8.5 : 14, 0);
    marker.scale.set(type === 'ufo' ? 13 : ['jet', 'spitfire'].includes(type) ? 10 : 15, 3.1, 1);
    const plume = new THREE.Group();
    for (let i = 0; i < 4; i++) {
      const puffMaterial = recoveryCacheMaterials.smoke.clone();
      puffMaterial.userData.recoveryCacheOwned = true;
      puffMaterial.color.setHex(plumeColor);
      puffMaterial.opacity = type === 'ufo' ? 0.11 : ['jet', 'spitfire'].includes(type) ? 0.075 : 0.19;
      const puff = new THREE.Sprite(puffMaterial);
      puff.position.set((type === 'ufo' ? -0.6 : 1.8) + i * 0.4, (type === 'ufo' ? 2.6 : 3.4) + i * 2.3, -0.6);
      puff.scale.set(5.4 + i * 1.5, 4.6 + i * 1.2, 1);
      plume.add(puff);
    }
    group.add(marker, plume);
    world.add(group);
    recoveryCaches.push({
      group,
      marker,
      siteIndex: index,
      type,
      expiresIn: ['ufo', 'jet', 'spitfire'].includes(type) ? 205 + Math.random() * 35 : 145 + Math.random() * 35,
      active: true
    });
    recoveryCacheSiteCursor = (index + 1) % sites.length;
    return true;
  }
  return false;
}
function startRecoveryCaches() {
  clearRecoveryCaches();
  if (!['trenches', 'stranda'].includes(sel.map)) return;
  recoveryCacheSiteCursor = Math.floor(Math.random() * recoveryCacheSites().length);
  spawnRecoveryCache('wreck');
  recoveryCacheSpawnTimer = 38;
  recoveryCacheSpecialTimers = sel.map === 'trenches' ? {
    ufo: 95 + Math.random() * 40,
    jet: 165 + Math.random() * 45,
    spitfire: 245 + Math.random() * 55
  } : null;
}
function updateRecoveryCaches(dt) {
  if (!roundInProgress || ['menu', 'over'].includes(mode)) return;
  const markerRanges = {
    wreck: 320,
    ufo: 145,
    jet: 105,
    spitfire: 115
  };
  for (const cache of recoveryCaches) {
    cache.expiresIn -= dt;
    cache.marker.visible = camera.position.distanceTo(cache.group.position) < markerRanges[cache.type];
    if (cache.expiresIn <= 0) {
      cache.active = false;
      disposeRecoveryCacheVisual(cache.group);
      cache.group.removeFromParent();
    }
  }
  recoveryCaches = recoveryCaches.filter(cache => cache.active);
  recoveryCacheSpawnTimer = Math.max(0, recoveryCacheSpawnTimer - dt);
  if (recoveryCacheSpawnTimer <= 0 && recoveryCaches.length < 3) {
    recoveryCacheSpawnTimer = spawnRecoveryCache('wreck') ? 54 : 12;
  }
  if (recoveryCacheSpecialTimers) {
    for (const type of Object.keys(recoveryCacheSpecialTimers)) {
      let timer = recoveryCacheSpecialTimers[type];
      if (timer === null) continue;
      timer -= dt;
      if (timer > 0) {
        recoveryCacheSpecialTimers[type] = timer;
        continue;
      }
      if (recoveryCaches.some(cache => cache.type === type)) {
        recoveryCacheSpecialTimers[type] = null;
      } else if (recoveryCaches.length < 3 && spawnRecoveryCache(type)) {
        recoveryCacheSpecialTimers[type] = null;
      } else {
        recoveryCacheSpecialTimers[type] = 14;
      }
    }
  }
}
function nearestRecoveryCache(x, z, radius = 12) {
  let nearest = null;
  let nearestDistance = radius;
  for (const cache of recoveryCaches) {
    if (!cache.active) continue;
    const distance = Math.hypot(x - cache.group.position.x, z - cache.group.position.z);
    if (distance < nearestDistance) {
      nearest = cache;
      nearestDistance = distance;
    }
  }
  return nearest;
}
function searchRecoveryCache(cache) {
  if (!cache?.active || !['foot', 'taxi'].includes(mode)) return;
  const position = mode === 'foot' ? foot.pos : player?.g.position;
  if (!position || Math.hypot(position.x - cache.group.position.x, position.z - cache.group.position.z) >= 13) {
    say('Move closer to the wreck to search it');
    return;
  }
  cache.active = false;
  disposeRecoveryCacheVisual(cache.group);
  cache.group.removeFromParent();
  recoveryCaches = recoveryCaches.filter(item => item !== cache);
  const finds = cache.type === 'ufo' ? [{
    name: 'Recovered star-metal navigation core',
    reward: 850
  }, {
    name: 'Unusual crystal power cell',
    reward: 700
  }, {
    name: 'Strange alloy sample and instrument',
    reward: 1000
  }] : cache.type === 'jet' ? [{
    name: 'Unmarked turbine assembly',
    reward: 320
  }, {
    name: 'Unfamiliar alloy instrument panel',
    reward: 280
  }] : cache.type === 'spitfire' ? [{
    name: 'Future-dated squadron logbook',
    reward: 260
  }, {
    name: 'Unusual high-altitude oxygen kit',
    reward: 225
  }] : [{
    name: 'Brass field altimeter',
    reward: 95
  }, {
    name: 'Vickers ammunition case',
    reward: 75
  }, {
    name: 'Coded patrol documents',
    reward: 125
  }, {
    name: 'Signal corps field kit',
    reward: 110
  }];
  const find = finds[Math.floor(Math.random() * finds.length)];
  const label = cache.type === 'ufo' ? 'Unidentified craft salvage' : cache.type === 'jet' ? 'Unidentified aircraft salvage' : cache.type === 'spitfire' ? 'Anachronistic aircraft salvage' : 'Wreck cache';
  const tone = ['ufo', 'jet', 'spitfire'].includes(cache.type) ? 'victory' : 'neutral';
  cashAdd(find.reward, `${label} · ${find.name}`);
  feed(`${cache.type === 'ufo' ? 'STRANGE SALVAGE' : 'RECOVERED'} · ${find.name} · +$${find.reward}`, tone);
}
const COURIER_DISPATCH_SITES = {
  blue: {
    name: 'Rue City Dispatch',
    x: -1036,
    z: -576
  },
  red: {
    name: 'Lens City Dispatch',
    x: 1280,
    z: -1250
  }
};
function courierMissionEligible() {
  return isGreatWarSinglePlayer() && sel.map === 'trenches';
}
function clearCourierMission() {
  courierMission.sourceGroup?.removeFromParent();
  courierMission = {
    active: false,
    pickedUp: false,
    completed: false,
    sourceGroup: null,
    source: null,
    destinationField: null
  };
}
function buildCourierStation(source) {
  const group = new THREE.Group();
  const crate = new THREE.Mesh(recoveryCacheParts.crate, recoveryCacheMaterials.crate);
  crate.position.set(0, 0.68, 0);
  const band = new THREE.Mesh(recoveryCacheParts.crateBand, recoveryCacheMaterials.brass);
  band.position.copy(crate.position);
  band.position.x = 0.22;
  const post = new THREE.Mesh(recoveryCacheParts.pole, recoveryCacheMaterials.wood);
  post.position.set(-1.45, 2.15, 0.25);
  const pennant = new THREE.Mesh(recoveryCacheParts.pennant, recoveryCacheMaterials.pennant);
  pennant.position.set(-0.42, 3.45, 0.25);
  pennant.rotation.y = Math.PI / 2;
  group.add(crate, band, post, pennant);
  group.position.set(source.x, heightAt(source.x, source.z), source.z);
  return group;
}
function initializeCourierMission() {
  clearCourierMission();
  if (!courierMissionEligible()) return;
  const source = COURIER_DISPATCH_SITES[sel.team];
  if (!source) return;
  const sourceGroup = buildCourierStation(source);
  world.add(sourceGroup);
  courierMission = {
    active: true,
    pickedUp: false,
    completed: false,
    sourceGroup,
    source,
    destinationField: null
  };
}
function courierOffice(field) {
  return field ? debriefSites.find(site => site.name === field.name && site.team === field.team) || field : null;
}
function refreshCourierDestination() {
  if (!courierMission.active || !courierMission.pickedUp) return null;
  const current = courierMission.destinationField;
  if (current && !current.disabled) return current;
  const candidates = (FIELDS[sel.map] || []).filter(field => field.team === sel.team && !field.disabled);
  candidates.sort((a, b) => Math.hypot(a.x - courierMission.source.x, a.z - courierMission.source.z) - Math.hypot(b.x - courierMission.source.x, b.z - courierMission.source.z));
  courierMission.destinationField = candidates[0] || null;
  return courierMission.destinationField;
}
function courierNearPickup(position) {
  return courierMission.active && !courierMission.pickedUp && !courierMission.completed && position && Math.hypot(position.x - courierMission.source.x, position.z - courierMission.source.z) < 15;
}
function courierNearDelivery(position, deliveryMode = mode) {
  if (!courierMission.active || !courierMission.pickedUp || courierMission.completed || !position) return false;
  const field = refreshCourierDestination();
  if (!field) return false;
  if (deliveryMode === 'taxi') {
    return !!player?.emergencyLanded && Math.hypot(position.x - field.x, position.z - field.z) < 125;
  }
  const office = courierOffice(field);
  return !!office && Math.hypot(position.x - office.x, position.z - office.z) < 15;
}
function pickUpCourierDispatch(position) {
  if (!courierMissionEligible() || !courierMission.active || courierMission.pickedUp || !['foot', 'taxi'].includes(mode)) return false;
  if (!courierNearPickup(position)) {
    say('Move closer to the city courier post to collect the dispatch');
    return false;
  }
  const candidates = (FIELDS[sel.map] || []).filter(field => field.team === sel.team && !field.disabled);
  candidates.sort((a, b) => Math.hypot(a.x - courierMission.source.x, a.z - courierMission.source.z) - Math.hypot(b.x - courierMission.source.x, b.z - courierMission.source.z));
  if (!candidates.length) {
    say('No friendly airfield is operational · rebuild one before accepting the dispatch');
    return false;
  }
  courierMission.pickedUp = true;
  courierMission.destinationField = candidates[0];
  refreshCourierDestination();
  playDoorSound();
  const destination = courierMission.destinationField;
  say(`Dispatch secured · fly to ${destination.name} and deliver at the airfield office`);
  feed(`COURIER ORDERS · ${destination.name}`, 'victory');
  return true;
}
function deliverCourierDispatch(position, deliveryMode = mode) {
  if (!courierMissionEligible() || !courierNearDelivery(position, deliveryMode)) {
    say('Deliver the dispatch at the designated friendly airfield');
    return false;
  }
  const destination = courierMission.destinationField;
  courierMission.completed = true;
  save.career.courierDeliveries++;
  persist();
  cashAdd(425, `Courier dispatch · ${destination.name}`);
  recordRibbonAward('courier-service');
  say(`Dispatch delivered at ${destination.name} · $425 courier reward`);
  feed(`COURIER DELIVERED · ${destination.name} · +$425`, 'victory');
  return true;
}
function updateCourierMission() {
  if (courierMission.active && courierMission.pickedUp && !courierMission.completed) refreshCourierDestination();
}
function addRunwaySurface(f, width, length, offset, material, sx, sz, laneOffset = 0) {
  const geo = new THREE.PlaneGeometry(width, length, sx, sz);
  geo.rotateX(-Math.PI / 2);
  const p = geo.attributes.position;
  const base = heightAt(f.x, f.z);
  const heading = fieldRunwayHeading(f);
  const cosine = Math.cos(heading);
  const sine = Math.sin(heading);
  for (let i = 0; i < p.count; i++) {
    const localX = p.getX(i) + laneOffset;
    const localZ = p.getZ(i);
    const worldX = f.x + cosine * localX + sine * localZ;
    const worldZ = f.z - sine * localX + cosine * localZ;
    p.setY(i, heightAt(worldX, worldZ) - base + offset);
  }
  geo.computeVertexNormals();
  const mesh = new THREE.Mesh(geo, material);
  const center = fieldLocalPoint(f, laneOffset, 0);
  mesh.position.set(center.x, base, center.z);
  mesh.rotation.y = heading;
  world.add(mesh);
  return mesh;
}
function buildAirfieldWreck(field) {
  if (!field || field.rear || field.damageGroup) return;
  const base = heightAt(field.x, field.z);
  const group = new THREE.Group();
  group.position.set(field.x, base + 0.18, field.z);
  group.rotation.y = fieldRunwayHeading(field);
  const soot = new THREE.MeshBasicMaterial({
    color: 0x241f1a,
    transparent: true,
    opacity: 0.78,
    depthWrite: false,
    side: THREE.DoubleSide
  });
  const ash = new THREE.MeshBasicMaterial({
    color: 0x55483a,
    transparent: true,
    opacity: 0.7,
    depthWrite: false,
    side: THREE.DoubleSide
  });
  for (const [x, z, radius, stretch] of [[-4, -44, 11, 1.5], [5, -13, 14, 1.9], [-3, 24, 12, 1.65], [3, 51, 9, 1.55]]) {
    const scorch = new THREE.Mesh(new THREE.CircleGeometry(radius, 18), soot);
    scorch.rotation.x = -Math.PI / 2;
    scorch.position.set(x, 0.08, z);
    scorch.scale.set(1, stretch, 1);
    group.add(scorch);
    const edge = new THREE.Mesh(new THREE.CircleGeometry(radius * 1.24, 18), ash);
    edge.rotation.x = -Math.PI / 2;
    edge.position.set(x, 0.04, z);
    edge.scale.set(1, stretch * 1.05, 1);
    group.add(edge);
  }
  const charred = new THREE.MeshLambertMaterial({
    color: 0x302921
  });
  for (const [x, z, length, angle] of [[-12, -22, 19, 0.2], [12, 9, 24, -0.28], [-10, 42, 16, 0.38]]) {
    const beam = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.8, length), charred);
    beam.position.set(x, 0.42, z);
    beam.rotation.y = angle;
    beam.rotation.z = (Math.random() - 0.5) * 0.18;
    group.add(beam);
  }
  world.add(group);
  field.damageGroup = group;
  for (const [x, z] of [[-5, -21], [4, 10], [-3, 45]]) {
    const point = fieldLocalPoint(field, x, z);
    airfieldDamageSources.push({
      position: new THREE.Vector3(point.x, heightAt(point.x, point.z) + 1.2, point.z),
      timer: Math.random() * 1.2
    });
  }
}
const AIRFIELD_REBUILD_COST = 15000;
const AIRFIELD_REBUILD_DURATION = 30;
function completeAirfieldRebuild(field) {
  if (!field || !field.disabled) return;
  field.disabled = false;
  field.bombHits = 0;
  field.rebuildRemaining = 0;
  if (field.damageGroup) {
    const geometries = new Set();
    const materials = new Set();
    field.damageGroup.traverse(object => {
      if (object.geometry) geometries.add(object.geometry);
      for (const material of Array.isArray(object.material) ? object.material : object.material ? [object.material] : []) materials.add(material);
    });
    field.damageGroup.removeFromParent();
    for (const geometry of geometries) geometry.dispose();
    for (const material of materials) material.dispose();
    field.damageGroup = null;
  }
  airfieldDamageSources = airfieldDamageSources.filter(source => Math.hypot(source.position.x - field.x, source.position.z - field.z) > 110);
  persistGreatWarCampaign();
  say(`${field.name} rebuilt · runway operational`);
  feed(`AIRFIELD REBUILT · ${field.name}`, 'victory');
}
function orderAirfieldRebuild(field) {
  if (!isGreatWarSinglePlayer() || !roundInProgress || !field || field.team !== sel.team || !field.disabled) return;
  if (field.rebuildRemaining > 0) {
    say(`${field.name} rebuild underway · ${Math.ceil(field.rebuildRemaining)} seconds remaining`);
    return;
  }
  if ((Number(activeEconomy().cash) || 0) < AIRFIELD_REBUILD_COST) {
    say(`Airfield rebuild requires $${AIRFIELD_REBUILD_COST}`);
    return;
  }
  activeEconomy().cash -= AIRFIELD_REBUILD_COST;
  field.rebuildRemaining = AIRFIELD_REBUILD_DURATION;
  persistGreatWarCampaign();
  say(`Rebuild ordered · ${field.name} · $${AIRFIELD_REBUILD_COST} · ${AIRFIELD_REBUILD_DURATION} seconds`);
  feed(`AIRFIELD REBUILD ORDERED · ${field.name} · $${AIRFIELD_REBUILD_COST}`, 'neutral');
}
function updateAirfieldRebuilds(dt) {
  if (!isGreatWarSinglePlayer() || !roundInProgress || mode === 'menu' || mode === 'over' || !(dt > 0)) return;
  let persistProgress = false;
  for (const field of FIELDS[sel.map] || []) {
    if (!field.disabled || !(field.rebuildRemaining > 0)) continue;
    const previousSecond = Math.ceil(field.rebuildRemaining);
    field.rebuildRemaining = Math.max(0, field.rebuildRemaining - dt);
    if (field.rebuildRemaining === 0) {
      completeAirfieldRebuild(field);
    } else if (Math.ceil(field.rebuildRemaining) !== previousSecond) {
      persistProgress = true;
    }
  }
  if (persistProgress) persistGreatWarCampaign();
}
scene.add(world);
function buildBurnedTrees() {
  const bark = new THREE.MeshLambertMaterial({
    color: 0x29241f
  });
  const char = new THREE.MeshLambertMaterial({
    color: 0x171716
  });
  const up = new THREE.Vector3(0, 1, 0);
  for (let i = 0; i < 22; i++) {
    let x = (Math.random() - 0.5) * 1900;
    let z = (Math.random() - 0.5) * 1900;
    let h = heightAt(x, z);
    let tries = 0;
    while (tries++ < 12 && (h < 12 && sel.map === 'stranda' || FIELDS[sel.map].some(f => Math.hypot(x - f.x, z - f.z) < 115))) {
      x = (Math.random() - 0.5) * 1900;
      z = (Math.random() - 0.5) * 1900;
      h = heightAt(x, z);
    }
    if (h < 8 && sel.map === 'stranda') continue;
    const g = new THREE.Group();
    g.position.set(x, h, z);
    const trunkH = 4 + Math.random() * 4;
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.42, trunkH, 6), bark);
    trunk.position.y = trunkH * 0.5;
    trunk.rotation.z = (Math.random() - 0.5) * 0.15;
    g.add(trunk);
    const addBranch = (a, b, radius) => {
      const d = b.clone().sub(a);
      const m = new THREE.Mesh(new THREE.CylinderGeometry(radius * 0.45, radius, d.length(), 5), char);
      m.position.copy(a).add(b).multiplyScalar(0.5);
      m.quaternion.setFromUnitVectors(up, d.normalize());
      g.add(m);
    };
    const top = trunkH * (0.62 + Math.random() * 0.12);
    addBranch(new THREE.Vector3(0, top, 0), new THREE.Vector3(-1.2, top + 1.5, 0.2), 0.2);
    addBranch(new THREE.Vector3(0.05, top - 0.4, 0), new THREE.Vector3(1.5, top + 0.7, -0.3), 0.18);
    addBranch(new THREE.Vector3(0, top - 0.8, 0.1), new THREE.Vector3(-0.1, top + 1.8, -0.2), 0.17);
    if (Math.random() < 0.45) addBranch(new THREE.Vector3(0, top - 1.1, 0), new THREE.Vector3(1.1, top + 0.5, 0.6), 0.14);
    world.add(g);
  }
}
function makeRiverCurve() {
  return new THREE.CatmullRomCurve3(RIVER_POINTS.map(([x, z]) => new THREE.Vector3(x, -5.3, z)), false, 'catmullrom', 0.18);
}
function buildWesternFrontEnvironment() {
  const river = makeRiverCurve();
  const waterPositions = [];
  const waterIndices = [];
  const samples = 150;
  for (let i = 0; i <= samples; i++) {
    const t = i / samples;
    const center = river.getPointAt(t);
    const tangent = river.getTangentAt(t).setY(0).normalize();
    const side = new THREE.Vector3(tangent.z, 0, -tangent.x);
    const width = 26 + Math.sin(i * 0.19) * 2.2;
    const ripple = Math.sin(i * 0.37) * 0.11;
    waterPositions.push(center.x + side.x * width, center.y + ripple, center.z + side.z * width);
    waterPositions.push(center.x - side.x * width, center.y - ripple, center.z - side.z * width);
    if (i < samples) {
      const a = i * 2;
      waterIndices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
  }
  const waterGeo = new THREE.BufferGeometry();
  waterGeo.setAttribute('position', new THREE.Float32BufferAttribute(waterPositions, 3));
  waterGeo.setIndex(waterIndices);
  waterGeo.computeVertexNormals();
  world.add(new THREE.Mesh(waterGeo, new THREE.MeshLambertMaterial({
    color: 0x3a565b,
    transparent: true,
    opacity: 0.91,
    side: THREE.DoubleSide
  })));
  const stone = new THREE.MeshLambertMaterial({
    color: 0x655f52
  });
  const darkStone = new THREE.MeshLambertMaterial({
    color: 0x393832
  });
  const roadShoulder = new THREE.MeshLambertMaterial({
    color: 0x716957
  });
  const roadSurface = new THREE.MeshLambertMaterial({
    color: 0x47463f
  });
  const addRoadApproach = (parent, anchor, side, sign, start, end, deckY, width = 9) => {
    const positions = [];
    const indices = [];
    const segments = 18;
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const distance = start + (end - start) * t;
      const localX = sign * distance;
      const center = anchor.clone().addScaledVector(side, localX);
      const groundY = heightAt(center.x, center.z) + 0.2;
      const grade = THREE.MathUtils.smoothstep(t, 0, 0.78);
      const surfaceY = Math.max(deckY, groundY, THREE.MathUtils.lerp(deckY, groundY, grade)) + (width <= 10 ? 0.06 : 0);
      positions.push(localX, surfaceY - parent.position.y, -width / 2, localX, surfaceY - parent.position.y, width / 2);
      if (i < segments) {
        const a = i * 2;
        indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
      }
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    const mesh = new THREE.Mesh(geometry, width > 10 ? roadShoulder : roadSurface);
    mesh.material.side = THREE.DoubleSide;
    parent.add(mesh);
    return mesh;
  };

  // The old stone road bridge has collapsed in the middle, but dirt roads still reach it from both banks.
  const bridgeAt = river.getPointAt(0.285);
  const bridgeTangent = river.getTangentAt(0.285).setY(0).normalize();
  const bridgeSide = new THREE.Vector3(bridgeTangent.z, 0, -bridgeTangent.x);
  const crossing = new THREE.Group();
  crossing.position.set(bridgeAt.x, -4.1, bridgeAt.z);
  crossing.rotation.y = Math.atan2(bridgeTangent.x, bridgeTangent.z);
  const slabA = new THREE.Mesh(new THREE.BoxGeometry(25, 1.25, 9), stone);
  slabA.position.set(-21, 0, 0);
  slabA.rotation.z = -0.08;
  const slabB = new THREE.Mesh(new THREE.BoxGeometry(24, 1.1, 9), stone);
  slabB.position.set(21, -0.2, 0.4);
  slabB.rotation.z = 0.13;
  const roadA = new THREE.Mesh(new THREE.BoxGeometry(24.3, 0.14, 8.4), roadSurface);
  roadA.position.set(-21, 0.7, 0);
  roadA.rotation.z = -0.08;
  const roadB = new THREE.Mesh(new THREE.BoxGeometry(23, 0.14, 8.4), roadSurface);
  roadB.position.set(21, 0.48, 0.4);
  roadB.rotation.z = 0.13;
  crossing.add(slabA, slabB, roadA, roadB);
  for (const sign of [-1, 1]) {
    addRoadApproach(crossing, bridgeAt, bridgeSide, sign, 32, 128, -3.4, 14);
    addRoadApproach(crossing, bridgeAt, bridgeSide, sign, 32, 128, -3.32, 8.5);
  }
  for (const x of [-34, 34]) {
    const pier = new THREE.Mesh(new THREE.BoxGeometry(8, 7, 10), darkStone);
    pier.position.set(x, -3, 0);
    crossing.add(pier);
  }
  for (const [x, y, z, rz] of [[-7, 0.4, -3.3, 0.1], [8, -0.1, 3.2, -0.17], [-22, 1.2, 2.8, 0.24]]) {
    const beam = new THREE.Mesh(new THREE.BoxGeometry(21, 0.48, 0.62), darkStone);
    beam.position.set(x, y, z);
    beam.rotation.z = rz;
    crossing.add(beam);
  }
  world.add(crossing);

  // An intact stone road bridge farther downstream retains clear, graded approaches on both banks.
  const intactAt = river.getPointAt(0.6);
  const intactTangent = river.getTangentAt(0.6).setY(0).normalize();
  const intactSide = new THREE.Vector3(intactTangent.z, 0, -intactTangent.x);
  const intactBridge = new THREE.Group();
  intactBridge.position.set(intactAt.x, -4.1, intactAt.z);
  intactBridge.rotation.y = Math.atan2(intactTangent.x, intactTangent.z);
  const intactDeck = new THREE.Mesh(new THREE.BoxGeometry(92, 1.2, 14), stone);
  const intactRoad = new THREE.Mesh(new THREE.BoxGeometry(89, 0.16, 9.2), roadSurface);
  intactRoad.position.y = 0.69;
  const parapets = [];
  for (const z of [-6.65, 6.65]) {
    const wall = new THREE.Mesh(new THREE.BoxGeometry(92, 1.35, 0.55), darkStone);
    wall.position.set(0, 0.82, z);
    parapets.push(wall);
  }
  intactBridge.add(intactDeck, intactRoad, ...parapets);
  for (const x of [-27, 27]) {
    const pier = new THREE.Mesh(new THREE.BoxGeometry(5.5, 6.4, 14), darkStone);
    pier.position.set(x, -3.7, 0);
    intactBridge.add(pier);
  }
  for (const sign of [-1, 1]) {
    addRoadApproach(intactBridge, intactAt, intactSide, sign, 45, 145, -3.33, 14);
    addRoadApproach(intactBridge, intactAt, intactSide, sign, 45, 145, -3.25, 8.5);
  }
  world.add(intactBridge);

  // Smashed river craft sit low in the current, with only broken hull and spars showing.
  const wreckMat = new THREE.MeshLambertMaterial({
    color: 0x393b37
  });
  for (const t of [0.49, 0.76]) {
    const p = river.getPointAt(t);
    const tangent = river.getTangentAt(t);
    const wreck = new THREE.Group();
    const hull = new THREE.Mesh(new THREE.BoxGeometry(7, 2.2, 25), wreckMat);
    hull.rotation.z = t === 0.49 ? -0.14 : 0.19;
    hull.position.y = -1.9;
    const brokenDeck = new THREE.Mesh(new THREE.BoxGeometry(5.5, 0.6, 10), stone);
    brokenDeck.position.set(0, -0.65, -3);
    const spar = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 10, 6), darkStone);
    spar.position.set(1.5, -0.6, 3);
    spar.rotation.z = 0.72;
    wreck.add(hull, brokenDeck, spar);
    wreck.position.set(p.x, -5.3, p.z);
    wreck.rotation.y = Math.atan2(-tangent.x, -tangent.z) + (t === 0.49 ? 0.5 : -0.35);
    world.add(wreck);
  }

  // A broad, heavily damaged French market city now fills the north-west quarter.
  // Keep the walled city and its cathedral well inland from the river bend.
  const cityX = -1080;
  const cityZ = -620;
  const masonry = [0x625c50, 0x716857, 0x514d45, 0x827967].map(color => new THREE.MeshLambertMaterial({
    color
  }));
  const soot = new THREE.MeshLambertMaterial({
    color: 0x34312c
  });
  const rubbleMat = new THREE.MeshLambertMaterial({
    color: 0x5b5142
  });
  for (let ix = -10; ix <= 10; ix++) {
    for (let iz = -10; iz <= 10; iz++) {
      if (Math.random() > 0.72 || Math.abs(ix) % 3 === 1 && Math.abs(iz) % 3 === 1) continue;
      // Leave an open civic square for the cathedral and its surrounding plaza.
      if (Math.abs(ix) <= 1 && Math.abs(iz) <= 1) continue;
      const x = cityX + ix * 44 + (Math.random() - 0.5) * 11;
      const z = cityZ + iz * 44 + (Math.random() - 0.5) * 11;
      if (riverDistance(x, z) < 43) continue;
      const width = 13 + Math.random() * 13;
      const depth = 13 + Math.random() * 12;
      const height = 7 + Math.random() * 11;
      const ruin = new THREE.Group();
      const wall = (w, h, d, px, py, pz, rz = 0, mat = pick(masonry)) => {
        const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
        m.position.set(px, py, pz);
        m.rotation.z = rz;
        ruin.add(m);
      };
      const hasFrontWall = Math.random() > 0.18;
      if (hasFrontWall) {
        const frontHeight = height * (0.35 + Math.random() * 0.55);
        wall(width, frontHeight, 1.1, 0, frontHeight * 0.5, -depth / 2, (Math.random() - 0.5) * 0.1);
        for (const wx of [-width * 0.27, width * 0.27]) {
          const window = new THREE.Mesh(new THREE.BoxGeometry(1.8, 2.7, 0.18), soot);
          window.position.set(wx, Math.min(frontHeight * 0.56, height * 0.38), -depth / 2 - 0.58);
          ruin.add(window);
          if (Math.random() < 0.55) {
            const lintel = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.34, 0.42), masonry[1]);
            lintel.position.set(wx, window.position.y + 1.5, -depth / 2 - 0.69);
            ruin.add(lintel);
          }
        }
      }
      if (Math.random() > 0.26) wall(1, height * (0.4 + Math.random() * 0.55), depth, -width / 2, height * 0.3, 0, (Math.random() - 0.5) * 0.1, pick(masonry));
      if (Math.random() > 0.42) wall(1, height * (0.25 + Math.random() * 0.55), depth * 0.72, width / 2, height * 0.24, -depth * 0.08, (Math.random() - 0.5) * 0.12, soot);
      if (Math.random() > 0.48) wall(width * 0.72, height * 0.24, 1, -width * 0.08, height * 0.58, depth / 2, (Math.random() - 0.5) * 0.14, pick(masonry));
      for (let k = 0; k < 3; k++) {
        const debris = new THREE.Mesh(new THREE.BoxGeometry(2 + Math.random() * 5, 0.6 + Math.random() * 1.4, 2 + Math.random() * 4), k === 0 ? soot : rubbleMat);
        debris.position.set((Math.random() - 0.5) * width, 0.35 + Math.random() * 0.5, (Math.random() - 0.5) * depth);
        debris.rotation.y = Math.random() * Math.PI;
        debris.rotation.z = (Math.random() - 0.5) * 0.18;
        ruin.add(debris);
      }
      ruin.position.set(x, heightAt(x, z), z);
      world.add(ruin);
    }
  }
  for (const [offsetX, offsetZ, rise] of [[-310, -250, 21], [285, -175, 25], [-240, 285, 19], [330, 260, 23]]) {
    addCitySmokeSource(cityX + offsetX, cityZ + offsetZ, rise);
  }

  // A landmark Gothic cathedral anchors the open square at the heart of the city.
  const cathedral = new THREE.Group();
  const stoneCanvas = document.createElement('canvas');
  stoneCanvas.width = stoneCanvas.height = 512;
  const stoneCtx = stoneCanvas.getContext('2d');
  stoneCtx.fillStyle = '#8d877b';
  stoneCtx.fillRect(0, 0, 512, 512);
  for (let row = 0, y = 0; y < 512; row++, y += 48) {
    let x = row % 2 ? -42 : 0;
    while (x < 512) {
      const width = 72 + Math.random() * 52;
      const tone = Math.round(128 + Math.random() * 30);
      stoneCtx.fillStyle = `rgb(${tone},${tone - 5},${tone - 14})`;
      stoneCtx.fillRect(x + 2, y + 2, width - 4, 44);
      stoneCtx.fillStyle = 'rgba(255,244,220,0.12)';
      stoneCtx.fillRect(x + 4, y + 4, width - 8, 2);
      stoneCtx.fillStyle = 'rgba(35,31,27,0.14)';
      stoneCtx.fillRect(x + 3, y + 43, width - 6, 2);
      x += width;
    }
  }
  for (let i = 0; i < 2400; i++) {
    const shade = Math.random() < 0.5 ? 'rgba(39,35,29,0.10)' : 'rgba(242,231,208,0.09)';
    stoneCtx.fillStyle = shade;
    stoneCtx.fillRect(Math.random() * 512, Math.random() * 512, 1 + Math.random() * 3, 1 + Math.random() * 2);
  }
  const cathedralStoneTexture = new THREE.CanvasTexture(stoneCanvas);
  cathedralStoneTexture.colorSpace = THREE.SRGBColorSpace;
  const cathedralStone = new THREE.MeshLambertMaterial({
    color: 0xb6ad9b,
    map: cathedralStoneTexture
  });
  const cathedralTrim = new THREE.MeshLambertMaterial({
    color: 0x827867,
    map: cathedralStoneTexture
  });
  const cathedralRoof = new THREE.MeshLambertMaterial({
    color: 0x292d2e
  });
  const stainedGlass = new THREE.MeshLambertMaterial({
    color: 0x1b2b35,
    emissive: 0x080d11,
    side: THREE.DoubleSide
  });
  const cathedralSoot = new THREE.MeshLambertMaterial({
    color: 0x292723,
    side: THREE.DoubleSide
  });
  const cathedralRubble = [0x514b40, 0x625a4c, 0x77705f].map(color => new THREE.MeshLambertMaterial({
    color
  }));
  const addCathedralMesh = (geometry, material, x, y, z, rz = 0, ry = 0, rx = 0) => {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    mesh.rotation.set(rx, ry, rz);
    cathedral.add(mesh);
    return mesh;
  };
  addCathedralMesh(new THREE.BoxGeometry(42, 28, 92), cathedralStone, 0, 14, 0);
  addCathedralMesh(new THREE.BoxGeometry(76, 24, 30), cathedralStone, 0, 12, -2);
  addCathedralMesh(new THREE.BoxGeometry(24, 20, 24), cathedralTrim, 0, 34, -2);
  addCathedralMesh(new THREE.BoxGeometry(19, 15, 19), cathedralStone, 0, 51.5, -2);
  addCathedralMesh(new THREE.ConeGeometry(13, 26, 8), cathedralRoof, 0, 72, -2, 0, Math.PI / 8);
  // The west towers keep the Gothic skyline, but shell damage has shattered the southern spire.
  for (const tx of [-17, 17]) {
    const damagedTower = tx > 0;
    addCathedralMesh(new THREE.BoxGeometry(12, 43, 13), cathedralStone, tx, 21.5, -42);
    if (damagedTower) {
      addCathedralMesh(new THREE.BoxGeometry(14, 8, 15), cathedralTrim, tx, 45, -42);
      addCathedralMesh(new THREE.ConeGeometry(4.6, 12, 6), cathedralRoof, tx + 1.3, 55.2, -42, 0.08, Math.PI / 10);
      addCathedralMesh(new THREE.BoxGeometry(2.2, 1.2, 2.8), cathedralRubble[0], tx - 4.7, 48.8, -39.5, 0.2, 0.18);
      addCathedralMesh(new THREE.BoxGeometry(3.2, 0.8, 2.4), cathedralRubble[1], tx + 4.6, 48.2, -44, -0.16, -0.2);
    } else {
      addCathedralMesh(new THREE.BoxGeometry(14, 13, 15), cathedralTrim, tx, 49.5, -42);
      addCathedralMesh(new THREE.ConeGeometry(8.8, 25, 8), cathedralRoof, tx, 68.5, -42, 0, Math.PI / 8);
      addCathedralMesh(new THREE.BoxGeometry(1, 5, 0.55), cathedralTrim, tx, 82.5, -42);
      addCathedralMesh(new THREE.BoxGeometry(4, 0.7, 0.55), cathedralTrim, tx, 83.5, -42);
    }
    for (const z of [-47.2, -35.4]) {
      const window = addCathedralMesh(new THREE.BoxGeometry(2.2, damagedTower && z < -40 ? 3.8 : 6.5, 0.22), stainedGlass, tx, damagedTower && z < -40 ? 45 : 48, z);
      if (damagedTower && z < -40) window.rotation.z = -0.13;
    }
  }
  // One nave roof slope remains intact; the other is torn open by a shell strike.
  addCathedralMesh(new THREE.BoxGeometry(22, 1.8, 94), cathedralRoof, -10, 33, 0, 0.48);
  for (const [z, length] of [[-29, 34], [28, 34]]) {
    addCathedralMesh(new THREE.BoxGeometry(22, 1.8, length), cathedralRoof, 10, 33, z, -0.48);
  }
  // Exposed rafters and collapsed slate in the missing roof section.
  for (const z of [-8, -1, 7]) {
    addCathedralMesh(new THREE.BoxGeometry(0.6, 0.8, 18), cathedralTrim, 7, 31.5, z, z % 2 ? 0.24 : -0.18, 0, 0.18);
  }
  for (const [x, z, rz] of [[11, -5, 0.18], [5, 4, -0.24], [13, 8, 0.3]]) {
    addCathedralMesh(new THREE.BoxGeometry(5.8, 0.6, 4.2), cathedralRubble[0], x, 30.5, z, rz, 0.12);
  }
  addCathedralMesh(new THREE.BoxGeometry(74, 1.8, 18), cathedralRoof, 0, 27.8, -9, 0, 0, -0.48);
  addCathedralMesh(new THREE.BoxGeometry(74, 1.8, 18), cathedralRoof, 0, 27.8, 5, 0, 0, 0.48);
  for (const side of [-1, 1]) {
    for (const z of [-32, -19, -6, 7, 20, 33]) {
      const frame = addCathedralMesh(new THREE.BoxGeometry(2.8, 7.6, 0.28), cathedralTrim, side * 21.2, 15, z, 0, side * Math.PI / 2);
      const glass = addCathedralMesh(new THREE.BoxGeometry(1.8, 6.3, 0.34), stainedGlass, side * 21.42, 15, z, 0, side * Math.PI / 2);
      frame.castShadow = glass.castShadow = false;
    }
    for (const z of [-35, -21, -7, 7, 21, 35]) {
      addCathedralMesh(new THREE.BoxGeometry(1.4, 30, 1.6), cathedralTrim, side * 21.4, 15, z);
      const buttress = addCathedralMesh(new THREE.BoxGeometry(3.4, 20, 4.2), cathedralStone, side * 22.5, 10, z, 0, 0, side * 0.16);
      buttress.position.x = side * 23.4;
    }
  }
  // Rose window, triple entry portal, roof cross and louvered bell chambers.
  addCathedralMesh(new THREE.TorusGeometry(6.1, 0.72, 8, 28), cathedralTrim, 0, 20, -46.35);
  addCathedralMesh(new THREE.CircleGeometry(5.35, 24), stainedGlass, 0, 20, -46.42);
  for (const dx of [-10, 0, 10]) {
    addCathedralMesh(new THREE.BoxGeometry(5.6, 12, 0.7), cathedralTrim, dx, 6, -46.6);
    addCathedralMesh(new THREE.BoxGeometry(4.5, 10, 0.82), soot, dx, 5, -47.02);
    addCathedralMesh(new THREE.BoxGeometry(6.8, 0.9, 1.1), cathedralStone, dx, 12.1, -46.75);
  }
  // Irregular soot-black impact scars break the old west facade and side walls.
  const addImpactScar = (x, y, z, scale, side = 'front') => {
    const outline = [[-1, -0.5], [-0.72, -0.92], [-0.18, -0.75], [0.22, -1], [0.58, -0.62], [1, -0.31], [0.73, 0.08], [0.96, 0.54], [0.42, 0.68], [0.12, 1], [-0.38, 0.72], [-0.88, 0.82], [-0.67, 0.22]];
    const shape = new THREE.Shape();
    outline.forEach(([px, py], i) => i ? shape.lineTo(px * scale, py * scale) : shape.moveTo(px * scale, py * scale));
    shape.closePath();
    const scar = new THREE.Mesh(new THREE.ShapeGeometry(shape), cathedralSoot);
    scar.position.set(x, y, z);
    if (side === 'east') scar.rotation.y = Math.PI / 2;
    if (side === 'west') scar.rotation.y = -Math.PI / 2;
    scar.rotation.z = (Math.random() - 0.5) * 0.22;
    cathedral.add(scar);
    const crack = addCathedralMesh(new THREE.BoxGeometry(scale * 0.1, scale * 1.8, 0.12), cathedralTrim, x + scale * 0.65, y - scale * 1.1, z - 0.02, -0.18);
    if (side !== 'front') {
      crack.position.z = z;
      crack.position.x = x;
    }
  };
  addImpactScar(-11, 18, -46.18, 3.8);
  addImpactScar(8, 8, -46.18, 4.7);
  addImpactScar(22.12, 18, 12, 4.1, 'east');
  addImpactScar(-22.12, 13, -18, 3.2, 'west');
  // Broken tracery, rain-blackened stone courses, and rubble at the nave's foot.
  addCathedralMesh(new THREE.BoxGeometry(2.1, 0.24, 0.36), cathedralRubble[0], 2.7, 19.5, -46.7, -0.34);
  addCathedralMesh(new THREE.BoxGeometry(1.2, 0.2, 0.4), cathedralRubble[1], -4.3, 17.1, -46.72, 0.42);
  for (let i = 0; i < 34; i++) {
    const a = Math.random() * Math.PI * 2;
    const radius = 32 + Math.random() * 20;
    const shard = new THREE.Mesh(new THREE.BoxGeometry(1.4 + Math.random() * 4.8, 0.45 + Math.random() * 1.8, 1.2 + Math.random() * 4.2), cathedralRubble[i % cathedralRubble.length]);
    shard.position.set(Math.cos(a) * radius, 0.35 + Math.random() * 0.45, Math.sin(a) * radius * 1.15);
    shard.rotation.set((Math.random() - 0.5) * 0.16, Math.random() * Math.PI, (Math.random() - 0.5) * 0.35);
    cathedral.add(shard);
  }
  addCathedralMesh(new THREE.BoxGeometry(0.8, 10, 0.8), cathedralTrim, 0, 87, -2);
  addCathedralMesh(new THREE.BoxGeometry(5.2, 0.8, 0.8), cathedralTrim, 0, 89, -2);
  const cathedralGround = heightAt(cityX, cityZ);
  cathedral.scale.setScalar(0.72);
  cathedral.position.set(cityX, cathedralGround, cityZ);
  world.add(cathedral);

  // A smaller, more intact provincial town lies across the front to the south-east.
  const villageX = 650;
  const villageZ = 930;
  const housePlaster = [0xb7aa8d, 0xc3b99e, 0x99917e, 0xb2a38a].map(color => new THREE.MeshLambertMaterial({
    color
  }));
  const houseRoof = [0x59453a, 0x46494a, 0x6b3d32].map(color => new THREE.MeshLambertMaterial({
    color
  }));
  const houseWindow = new THREE.MeshLambertMaterial({
    color: 0x27313a
  });
  const houseWood = new THREE.MeshLambertMaterial({
    color: 0x55402e
  });
  for (let ix = -6; ix <= 6; ix++) {
    for (let iz = -6; iz <= 6; iz++) {
      if (Math.abs(ix) <= 1 && Math.abs(iz) <= 1) continue;
      if (Math.random() > 0.62 || Math.abs(ix) % 3 === 1 && Math.abs(iz) % 3 === 1) continue;
      const x = villageX + ix * 38 + (Math.random() - 0.5) * 9;
      const z = villageZ + iz * 38 + (Math.random() - 0.5) * 9;
      if (riverDistance(x, z) < 48) continue;
      const width = 12 + Math.random() * 6;
      const depth = 12 + Math.random() * 6;
      const height = 9 + Math.random() * 10;
      const house = new THREE.Group();
      const plaster = pick(housePlaster);
      const roof = pick(houseRoof);
      const body = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), plaster);
      body.position.y = height / 2;
      house.add(body);
      // Two pitched roof planes, dark timber trim and a tall masonry chimney.
      const halfRoof = width * 0.57;
      const slope = 0.55;
      for (const side of [-1, 1]) {
        const panel = new THREE.Mesh(new THREE.BoxGeometry(halfRoof, 0.85, depth + 1.6), roof);
        panel.position.set(side * halfRoof * 0.25, height + 1.5, 0);
        panel.rotation.z = -side * slope;
        house.add(panel);
        const eave = new THREE.Mesh(new THREE.BoxGeometry(0.42, 1.15, depth + 1.8), houseWood);
        eave.position.set(side * (width / 2 + 0.45), height + 0.45, 0);
        house.add(eave);
      }
      for (const wx of [-width * 0.27, width * 0.27]) {
        for (const wy of [height * 0.34, height * 0.72]) {
          const window = new THREE.Mesh(new THREE.BoxGeometry(1.8, 2.6, 0.22), houseWindow);
          window.position.set(wx, wy, -depth / 2 - 0.12);
          house.add(window);
          const sill = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.28, 0.5), cathedralStone);
          sill.position.set(wx, wy - 1.5, -depth / 2 - 0.22);
          house.add(sill);
        }
      }
      const door = new THREE.Mesh(new THREE.BoxGeometry(2.1, 4.2, 0.24), houseWood);
      door.position.set(0, 2.1, -depth / 2 - 0.13);
      house.add(door);
      const lintel = new THREE.Mesh(new THREE.BoxGeometry(width + 0.7, 0.42, depth + 0.7), cathedralTrim);
      lintel.position.y = height * 0.58;
      house.add(lintel);
      const chimney = new THREE.Mesh(new THREE.BoxGeometry(1.8, 5 + Math.random() * 3, 1.8), cathedralTrim);
      chimney.position.set(width * 0.28, height + 3, depth * 0.18);
      house.add(chimney);
      house.position.set(x, heightAt(x, z), z);
      house.rotation.y = (Math.random() - 0.5) * 0.12;
      world.add(house);
    }
  }
  addCitySmokeSource(villageX - 145, villageZ - 38, 17);
  addCitySmokeSource(villageX + 150, villageZ + 76, 20);

  // The line leaves the ruined city and follows the Allied rear area behind the trenches.
  const railControls = [[-760, -1080], [-700, -900], [-600, -680], [-505, -430], [-450, -170], [-430, 100], [-430, 390], [-390, 680], [-290, 930], [-170, 1160]].map(([x, z]) => new THREE.Vector3(x, 0, z));
  const groundRoute = new THREE.CatmullRomCurve3(railControls, false, 'catmullrom', 0.16);
  let railRiverBridgeT = 0;
  let railRiverDistance = Infinity;
  for (let i = 0; i <= 500; i++) {
    const t = i / 500;
    const point = groundRoute.getPointAt(t);
    const distance = riverDistance(point.x, point.z);
    if (distance < railRiverDistance) {
      railRiverDistance = distance;
      railRiverBridgeT = t;
    }
  }
  const bridgeRailHeight = -3.15;
  const railPoints = [];
  for (let i = 0; i <= 180; i++) {
    const point = groundRoute.getPointAt(i / 180);
    const trackBedHeight = heightAt(point.x, point.z) + 0.68;
    const bridgeBlend = 1 - THREE.MathUtils.smoothstep(riverDistance(point.x, point.z), 8, 68);
    point.y = THREE.MathUtils.lerp(trackBedHeight, bridgeRailHeight, bridgeBlend);
    railPoints.push(point);
  }
  const railCurve = new THREE.CatmullRomCurve3(railPoints, false, 'catmullrom', 0.16);
  const trackSamples = 260;
  const sleepers = new THREE.InstancedMesh(new THREE.BoxGeometry(9.2, 0.32, 1.35), new THREE.MeshLambertMaterial({
    color: 0x4a3828
  }), trackSamples);
  const dummy = new THREE.Object3D();
  const railCurves = [[], []];
  const ballastSection = [[-6.2, -0.82], [6.2, -0.82], [4.9, -0.5], [-4.9, -0.5]];
  const ballastTexture = new THREE.TextureLoader().load('assets/rail-ballast-gravel.webp');
  ballastTexture.colorSpace = THREE.SRGBColorSpace;
  ballastTexture.wrapS = ballastTexture.wrapT = THREE.RepeatWrapping;
  const ballastPositions = [];
  const ballastColors = [];
  const ballastUvs = [];
  const ballastIndices = [];
  const ballastTextureScale = railCurve.getLength() / 8;
  for (let i = 0; i < trackSamples; i++) {
    const t = i / (trackSamples - 1);
    const point = railCurve.getPointAt(t);
    const tangent = railCurve.getTangentAt(t).setY(0).normalize();
    const side = new THREE.Vector3(tangent.z, 0, -tangent.x);
    const angle = Math.atan2(tangent.x, tangent.z);
    dummy.position.set(point.x, point.y - 0.38, point.z);
    dummy.rotation.set(0, angle, 0);
    dummy.scale.set(1, 1, 1);
    dummy.updateMatrix();
    sleepers.setMatrixAt(i, dummy.matrix);
    for (let r = 0; r < 2; r++) railCurves[r].push(point.clone().addScaledVector(side, r === 0 ? -3.1 : 3.1));
    for (const [offset, height] of ballastSection) {
      ballastPositions.push(point.x + side.x * offset, point.y + height, point.z + side.z * offset);
      const shade = 0.84 + Math.random() * 0.28;
      ballastColors.push(0.3 * shade, 0.29 * shade, 0.27 * shade);
      ballastUvs.push(t * ballastTextureScale, (offset + 6.2) / 5);
    }
    if (i < trackSamples - 1) {
      for (let edge = 0; edge < 4; edge++) {
        const a = i * 4 + edge;
        const b = i * 4 + (edge + 1) % 4;
        const c = (i + 1) * 4 + edge;
        const d = (i + 1) * 4 + (edge + 1) % 4;
        ballastIndices.push(a, c, b, b, c, d);
      }
    }
  }
  const ballastGeo = new THREE.BufferGeometry();
  ballastGeo.setAttribute('position', new THREE.Float32BufferAttribute(ballastPositions, 3));
  ballastGeo.setAttribute('color', new THREE.Float32BufferAttribute(ballastColors, 3));
  ballastGeo.setAttribute('uv', new THREE.Float32BufferAttribute(ballastUvs, 2));
  ballastGeo.setIndex(ballastIndices);
  ballastGeo.computeVertexNormals();
  world.add(new THREE.Mesh(ballastGeo, new THREE.MeshLambertMaterial({
    map: ballastTexture,
    vertexColors: true,
    side: THREE.DoubleSide
  })));
  sleepers.instanceMatrix.needsUpdate = true;
  world.add(sleepers);
  const gravel = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 5, 4), new THREE.MeshLambertMaterial({
    color: 0xffffff
  }), 1400);
  for (let i = 0; i < 1400; i++) {
    const t = Math.random();
    const point = railCurve.getPointAt(t);
    const tangent = railCurve.getTangentAt(t).setY(0).normalize();
    const side = new THREE.Vector3(tangent.z, 0, -tangent.x);
    const offset = (Math.random() - 0.5) * 9.5;
    const size = 0.11 + Math.random() * 0.24;
    dummy.position.set(point.x + side.x * offset, point.y - 0.53 + size * 0.12, point.z + side.z * offset);
    dummy.rotation.set(0, Math.random() * Math.PI, 0);
    dummy.scale.set(size, size * 0.24, size * (0.65 + Math.random() * 0.65));
    dummy.updateMatrix();
    gravel.setMatrixAt(i, dummy.matrix);
    const shade = 0.72 + Math.random() * 0.52;
    gravel.setColorAt(i, new THREE.Color(0.44 * shade, 0.43 * shade, 0.4 * shade));
  }
  gravel.instanceMatrix.needsUpdate = true;
  world.add(gravel);
  const iron = new THREE.MeshLambertMaterial({
    color: 0x44433c
  });
  for (const points of railCurves) world.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 320, 0.16, 5, false), iron));

  // A riveted steel through-truss carries the railway over the river, with a masonry pier in the channel.
  const railBridgePoint = railCurve.getPointAt(railRiverBridgeT);
  const railBridgeTangent = railCurve.getTangentAt(railRiverBridgeT).setY(0).normalize();
  const railBridge = new THREE.Group();
  railBridge.position.copy(railBridgePoint);
  railBridge.rotation.y = Math.atan2(railBridgeTangent.x, railBridgeTangent.z);
  const bridgeSteel = new THREE.MeshLambertMaterial({
    color: 0x454b49
  });
  const bridgeRust = new THREE.MeshLambertMaterial({
    color: 0x62513e
  });
  const bridgeDeck = new THREE.Mesh(new THREE.BoxGeometry(11.4, 0.5, 124), bridgeSteel);
  bridgeDeck.position.y = -0.82;
  railBridge.add(bridgeDeck);
  const bridgeBeam = (a, b, radius, material) => {
    const direction = b.clone().sub(a);
    const beam = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, direction.length(), 6), material);
    beam.position.copy(a).add(b).multiplyScalar(0.5);
    beam.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
    railBridge.add(beam);
  };
  for (const side of [-1, 1]) {
    const x = side * 5.35;
    const bottom = -0.82;
    const top = 3.45;
    bridgeBeam(new THREE.Vector3(x, bottom, -62), new THREE.Vector3(x, bottom, 62), 0.22, bridgeRust);
    bridgeBeam(new THREE.Vector3(x, top, -62), new THREE.Vector3(x, top, 62), 0.24, bridgeSteel);
    for (let z = -62; z <= 62; z += 15.5) {
      bridgeBeam(new THREE.Vector3(x, bottom, z), new THREE.Vector3(x, top, z), 0.17, bridgeSteel);
      if (z < 62) {
        const nextZ = z + 15.5;
        const diagonalStart = (Math.round((z + 62) / 15.5) + side) % 2 === 0 ? z : nextZ;
        const diagonalEnd = diagonalStart === z ? nextZ : z;
        bridgeBeam(new THREE.Vector3(x, bottom, diagonalStart), new THREE.Vector3(x, top, diagonalEnd), 0.12, bridgeRust);
      }
    }
  }
  for (let z = -60; z <= 60; z += 15) {
    bridgeBeam(new THREE.Vector3(-5.35, -0.77, z), new THREE.Vector3(5.35, -0.77, z), 0.13, bridgeSteel);
  }
  const riverBed = heightAt(railBridgePoint.x, railBridgePoint.z);
  const pierTop = -1.08;
  const pierBottom = riverBed - railBridgePoint.y;
  if (pierTop > pierBottom) {
    const pierHeight = pierTop - pierBottom;
    const pier = new THREE.Mesh(new THREE.BoxGeometry(3.2, pierHeight, 4.5), darkStone);
    pier.position.set(0, (pierTop + pierBottom) / 2, 0);
    railBridge.add(pier);
  }
  world.add(railBridge);
  const train = new THREE.Group();
  const trainParts = [];
  const trainBlack = new THREE.MeshLambertMaterial({
    color: 0x292a28
  });
  const trainGreen = new THREE.MeshLambertMaterial({
    color: 0x45483c
  });
  const brass = new THREE.MeshLambertMaterial({
    color: 0x92794c
  });
  const makeCar = (isEngine, offset, cargoType = 'box') => {
    const car = new THREE.Group();
    if (isEngine) {
      const body = new THREE.Mesh(new THREE.BoxGeometry(5.2, 4.2, 12), trainBlack);
      body.position.y = 2.3;
      car.add(body);
    } else if (cargoType === 'box') {
      const body = new THREE.Mesh(new THREE.BoxGeometry(6.8, 2.8, 13), trainGreen);
      body.position.y = 1.7;
      car.add(body);
      const plankMat = new THREE.MeshLambertMaterial({
        color: 0x514438
      });
      const ironTrim = new THREE.MeshLambertMaterial({
        color: 0x514f48
      });
      for (const side of [-1, 1]) {
        for (let row = 0; row < 4; row++) {
          const plank = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.42, 11.5), plankMat);
          plank.position.set(side * 3.44, 0.78 + row * 0.55, 0);
          car.add(plank);
        }
        for (const z of [-5.9, 5.9]) {
          const upright = new THREE.Mesh(new THREE.BoxGeometry(0.22, 2.6, 0.24), ironTrim);
          upright.position.set(side * 3.5, 1.7, z);
          car.add(upright);
        }
      }
      const cargo = new THREE.Mesh(new THREE.BoxGeometry(4.8, 1.5, 7.2), new THREE.MeshLambertMaterial({
        color: 0x64533c
      }));
      cargo.position.set(0, 3.68, 0.2);
      car.add(cargo);
      for (let i = -2; i <= 2; i++) {
        const strap = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.55, 7.3), new THREE.MeshLambertMaterial({
          color: 0x302e2a
        }));
        strap.position.set(i * 0.86, 3.68, 0.2);
        car.add(strap);
      }
    } else {
      const flatIron = new THREE.MeshLambertMaterial({
        color: 0x45433c
      });
      const flatWood = new THREE.MeshLambertMaterial({
        color: 0x594832
      });
      const deckWood = [0x69563a, 0x756142, 0x625035].map(color => new THREE.MeshLambertMaterial({
        color
      }));
      const addFlatbedBox = (w, h, d, material, x, y, z, rotationZ = 0) => {
        const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
        mesh.position.set(x, y, z);
        mesh.rotation.z = rotationZ;
        car.add(mesh);
        return mesh;
      };
      // A low steel chassis carries a plank deck, leaving the cargo fully exposed.
      for (const x of [-2.82, 2.82]) addFlatbedBox(0.34, 0.46, 11.9, flatIron, x, 1.12, 0);
      for (const z of [-4.9, -2.45, 0, 2.45, 4.9]) addFlatbedBox(5.9, 0.34, 0.46, flatIron, 0, 1.12, z);
      let plankIndex = 0;
      for (let x = -2.7; x <= 2.71; x += 0.54) {
        addFlatbedBox(0.5, 0.14, 11.75, deckWood[plankIndex++ % deckWood.length], x, 1.42, 0);
      }
      for (const side of [-1, 1]) {
        addFlatbedBox(0.16, 0.2, 11.9, flatIron, side * 3.16, 1.58, 0);
        for (const z of [-5.35, 5.35]) {
          addFlatbedBox(0.16, 0.56, 0.18, flatIron, side * 3.16, 1.67, z);
          addFlatbedBox(0.34, 0.12, 0.36, brass, side * 2.85, 1.55, z);
        }
      }
      for (const z of [-4.65, 4.65]) {
        addFlatbedBox(6.15, 0.18, 0.16, flatIron, 0, 1.62, z);
      }
      if (cargoType === 'flatbed-tank') {
        const tankGreen = new THREE.MeshLambertMaterial({
          color: 0x535846
        });
        const tankDark = new THREE.MeshLambertMaterial({
          color: 0x292b26
        });
        const tankSteel = new THREE.MeshLambertMaterial({
          color: 0x68675b
        });
        const tankTrack = new THREE.MeshLambertMaterial({
          color: 0x34352e
        });
        const deckTop = 1.5;
        // A squat, rhomboid-era tank is lashed across the deck, facing down the track.
        for (const side of [-1, 1]) {
          addFlatbedBox(0.62, 1.17, 9.1, tankTrack, side * 1.86, deckTop + 0.57, 0);
          for (let i = 0; i < 7; i++) {
            const z = -3.45 + i * 1.15;
            const roller = new THREE.Mesh(new THREE.CylinderGeometry(0.43, 0.43, 0.78, 12), tankDark);
            roller.position.set(side * 2.02, deckTop + 0.58, z);
            roller.rotation.z = Math.PI / 2;
            car.add(roller);
            const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.08, 10), tankSteel);
            hub.position.set(side * 2.43, deckTop + 0.58, z);
            hub.rotation.z = Math.PI / 2;
            car.add(hub);
          }
          addFlatbedBox(0.16, 0.11, 8.6, tankSteel, side * 1.86, deckTop + 1.03, 0);
          const sponson = addFlatbedBox(0.82, 0.72, 2.25, tankGreen, side * 1.58, deckTop + 1.23, -0.55);
          sponson.rotation.z = side * -0.04;
          const gun = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.14, 1.35, 8), tankDark);
          gun.position.set(side * 2.02, deckTop + 1.23, -2.12);
          gun.rotation.x = Math.PI / 2;
          car.add(gun);
        }
        addFlatbedBox(3.05, 1.34, 7.25, tankGreen, 0, deckTop + 1.04, 0.05);
        const glacis = addFlatbedBox(2.78, 0.48, 1.32, tankGreen, 0, deckTop + 0.88, -3.55, -0.2);
        const rearPlate = addFlatbedBox(2.78, 0.42, 1.1, tankGreen, 0, deckTop + 0.88, 3.55, 0.16);
        glacis.rotation.x = 0.13;
        rearPlate.rotation.x = -0.1;
        addFlatbedBox(1.45, 0.36, 1.55, tankSteel, 0, deckTop + 1.91, 0.35);
        for (const x of [-0.43, 0.43]) addFlatbedBox(0.1, 0.13, 0.55, tankDark, x, deckTop + 2.16, 0.35);
        addFlatbedBox(0.12, 0.28, 0.13, brass, -2.65, 1.72, -3.2);
        addFlatbedBox(0.12, 0.28, 0.13, brass, 2.65, 1.72, 3.2);
      } else if (cargoType === 'flatbed-crates') {
        const crateWoods = [0x705638, 0x806442, 0x5f4a31, 0x917349].map(color => new THREE.MeshLambertMaterial({
          color
        }));
        const crateBand = new THREE.MeshLambertMaterial({
          color: 0x34342f
        });
        const crateSpots = [[-1.72, -4.05, 1.72, 1.58, 2.0], [0.05, -4.05, 1.68, 1.9, 1.85], [1.78, -4.05, 1.6, 1.65, 2.05], [-1.75, 0, 1.68, 1.92, 2.0], [0.02, 0.05, 1.74, 1.6, 2.1], [1.78, 0.1, 1.62, 1.82, 1.95], [-1.72, 4.02, 1.72, 1.62, 1.9], [0.06, 4.02, 1.7, 1.78, 2.0], [1.78, 4.02, 1.62, 1.6, 1.9]];
        crateSpots.forEach(([x, z, w, h, d], index) => {
          const material = crateWoods[index % crateWoods.length];
          const baseY = 1.5 + h / 2;
          addFlatbedBox(w, h, d, material, x, baseY, z);
          addFlatbedBox(w + 0.06, 0.11, d + 0.06, crateWoods[(index + 1) % crateWoods.length], x, 1.5 + h, z);
          for (const side of [-1, 1]) {
            addFlatbedBox(0.09, h + 0.05, d + 0.08, crateBand, x + side * w * 0.34, baseY, z);
          }
          for (const side of [-1, 1]) {
            const brace = addFlatbedBox(w * 0.92, 0.1, 0.09, flatWood, x, baseY, z - d / 2 - 0.055, side * 0.52);
            brace.position.y = baseY;
          }
        });
      }
    }
    if (isEngine) {
      const boiler = new THREE.Mesh(new THREE.CylinderGeometry(1.72, 1.8, 8.2, 14), trainBlack);
      boiler.rotation.x = Math.PI / 2;
      boiler.position.set(0, 2.4, -1.1);
      const smokebox = new THREE.Mesh(new THREE.CylinderGeometry(1.55, 1.55, 0.22, 16), trainBlack);
      smokebox.rotation.x = Math.PI / 2;
      smokebox.position.set(0, 2.4, -5.15);
      const cab = new THREE.Mesh(new THREE.BoxGeometry(5.6, 4, 4), trainGreen);
      cab.position.set(0, 3, 4.6);
      const cabRoof = new THREE.Mesh(new THREE.BoxGeometry(6.2, 0.36, 4.7), trainBlack);
      cabRoof.position.set(0, 5.08, 4.65);
      const cabDoor = new THREE.Mesh(new THREE.BoxGeometry(0.12, 2.5, 1.1), brass);
      cabDoor.position.set(2.86, 2.7, 5.5);
      const windowMat = new THREE.MeshLambertMaterial({
        color: 0x1b211e
      });
      const windows = [];
      for (const side of [-1, 1]) {
        const window = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.3, 1.4), windowMat);
        window.position.set(side * 2.83, 3.75, 4.65);
        windows.push(window);
        const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 6.4, 7), brass);
        pipe.rotation.x = Math.PI / 2;
        pipe.position.set(side * 1.62, 2.38, -1.25);
        car.add(pipe);
      }
      const stack = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.75, 2.8, 10), trainBlack);
      stack.position.set(0, 4.8, -4.1);
      const stackLip = new THREE.Mesh(new THREE.CylinderGeometry(0.76, 0.72, 0.2, 10), brass);
      stackLip.position.set(0, 6.13, -4.1);
      const dome = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.62, 0.9, 10), brass);
      dome.position.set(0, 4.05, 0.25);
      const headlamp = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.48, 0.55, 12), brass);
      headlamp.rotation.x = Math.PI / 2;
      headlamp.position.set(0, 3.65, -5.45);
      const lampFace = new THREE.Mesh(new THREE.CircleGeometry(0.31, 12), new THREE.MeshBasicMaterial({
        color: 0xffcf76
      }));
      lampFace.position.set(0, 3.65, -5.74);
      lampFace.rotation.y = Math.PI;
      const pilotBeam = new THREE.Mesh(new THREE.BoxGeometry(5.8, 0.24, 0.28), brass);
      pilotBeam.position.set(0, 0.52, -6.05);
      pilotBeam.rotation.z = -0.13;
      const bands = [-4.1, -2.5, -0.8, 1.1].map(z => {
        const band = new THREE.Mesh(new THREE.TorusGeometry(1.72, 0.07, 6, 16), brass);
        band.position.set(0, 2.4, z);
        return band;
      });
      car.add(boiler, smokebox, cab, cabRoof, cabDoor, stack, stackLip, dome, headlamp, lampFace, pilotBeam, ...windows, ...bands);
      car.userData.stack = new THREE.Vector3(0, 5.8, -4.1);
    }
    const wheels = [];
    const wheelRows = [-4.05, 4.05];
    const wheelRadius = isEngine ? 1.0 : 0.9;
    const axleY = wheelRadius - 0.09;
    const wheelSteel = new THREE.MeshLambertMaterial({
      color: 0x55544d
    });
    car.userData.driveRods = [];
    for (const z of wheelRows) {
      const axle = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 6.3, 10), trainBlack);
      axle.position.set(0, axleY, z);
      axle.rotation.z = Math.PI / 2;
      car.add(axle);
      for (const x of [-3.1, 3.1]) {
        const wheel = new THREE.Mesh(new THREE.CylinderGeometry(wheelRadius, wheelRadius, 0.56, 16), trainBlack);
        wheel.position.set(x, axleY, z);
        wheel.rotation.z = Math.PI / 2;
        wheel.userData.radius = wheelRadius;
        car.add(wheel);
        wheels.push(wheel);
        const side = Math.sign(x);
        const flange = new THREE.Mesh(new THREE.TorusGeometry(wheelRadius * 0.84, 0.075, 7, 18), wheelSteel);
        flange.position.set(x + side * 0.29, axleY, z);
        flange.rotation.y = Math.PI / 2;
        car.add(flange);
        const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.16, 12), brass);
        hub.position.set(x + side * 0.34, axleY, z);
        hub.rotation.z = Math.PI / 2;
        car.add(hub);
        const bogie = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.2, 2.05), trainBlack);
        bogie.position.set(x - side * 0.38, axleY + 0.12, z);
        car.add(bogie);
        for (const springZ of [-0.48, 0.48]) {
          const spring = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.44, 8), wheelSteel);
          spring.position.set(x - side * 0.38, axleY + 0.42, z + springZ);
          car.add(spring);
        }
      }
    }
    if (isEngine) {
      for (const side of [-1, 1]) {
        const rod = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.13, 7.8), brass);
        rod.position.set(side * 3.43, axleY, 0);
        car.add(rod);
        car.userData.driveRods.push(rod);
        for (const z of wheelRows) {
          const pin = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.12, 8), brass);
          pin.position.set(side * 3.43, axleY, z);
          pin.rotation.z = Math.PI / 2;
          car.add(pin);
        }
        const piston = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.48, 1.4), trainBlack);
        piston.position.set(side * 2.92, axleY + 0.12, -4.8);
        car.add(piston);
      }
    }
    car.userData.axleY = axleY;
    car.userData.wheels = wheels;
    car.userData.offset = offset;
    train.add(car);
    trainParts.push(car);
    return car;
  };
  const engineCar = makeCar(true, 0);
  const flagWagon = makeCar(false, 0.006);
  makeCar(false, 0.012);
  makeCar(false, 0.018, 'flatbed-tank');
  makeCar(false, 0.024, 'flatbed-crates');
  const trainFlag = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.8), new THREE.MeshBasicMaterial({
    map: factionFlagTexture('blue'),
    side: THREE.DoubleSide
  }));
  trainFlag.position.set(3.52, 2.35, 0);
  trainFlag.rotation.y = Math.PI / 2;
  flagWagon.add(trainFlag);
  world.add(train);
  frontTrain = {
    g: train,
    team: 'blue',
    curve: railCurve,
    curveLength: railCurve.getLength(),
    parts: trainParts,
    u: 0.04,
    dir: 1,
    puff: 1.5,
    steamPuff: 0.1,
    engineCar,
    trainMaterials: [trainBlack, trainGreen, brass],
    hits: 0,
    maxHits: 8,
    destroyed: false
  };
  updateFrontTrain(0);
  buildRiverBridgeWrecks(river, stone, darkStone);
}
function buildRiverBridgeWrecks(river, stone, darkStone) {
  // The bridge is placed downstream from town so the river remains a visible landmark.
  // Bridge geometry is already part of the shared world; this adds a few tilted road blocks
  // and broken approach timbers at the waterline for a more convincing collapse.
  const p = river.getPointAt(0.32);
  const t = river.getTangentAt(0.32).setY(0).normalize();
  const side = new THREE.Vector3(t.z, 0, -t.x);
  for (const sign of [-1, 1]) {
    const block = new THREE.Mesh(new THREE.BoxGeometry(12, 2, 7), stone);
    block.position.copy(p).addScaledVector(side, sign * 42);
    block.position.y = heightAt(block.position.x, block.position.z) + 1;
    block.rotation.y = Math.atan2(t.x, t.z);
    block.rotation.z = sign * 0.12;
    world.add(block);
    const timber = new THREE.Mesh(new THREE.BoxGeometry(17, 0.45, 0.45), darkStone);
    timber.position.copy(block.position).add(new THREE.Vector3(0, 1.5, 0));
    timber.rotation.y = block.rotation.y + sign * 0.24;
    world.add(timber);
  }
}
function collapseIndustrialPart(site, part, kind, immediate = false) {
  if (!part || part.userData.collapseStarted) return;
  part.userData.collapseStarted = true;
  const direction = part.userData.fallDirection || (Math.random() < 0.5 ? -1 : 1);
  part.userData.fallDirection = direction;
  const targetAngle = direction * (kind === 'chimney' ? 1.34 : 0.82 + Math.random() * 0.16);
  if (immediate) {
    part.rotation.z = targetAngle;
    if (kind !== 'chimney') part.position.y = -1.1;
    part.userData.fallen = true;
    return;
  }
  part.userData.collapse = {
    elapsed: 0,
    duration: kind === 'chimney' ? 6.4 : 3.8,
    startAngle: part.rotation.z,
    targetAngle,
    startY: part.position.y,
    endY: kind === 'chimney' ? 0 : -1.1
  };
  site.animations.push(part);
  const localBlast = new THREE.Vector3(part.position.x, kind === 'chimney' ? 24 : 8, part.position.z);
  const blast = site.g.localToWorld(localBlast);
  boom(blast);
  smoke(blast, kind === 'chimney' ? 1.4 : 1.1, kind === 'chimney' ? 5.5 : 4.2, 0x322b26, 0, 1.2, 0, 0.82);
  smoke(blast.clone().add(new THREE.Vector3(0, 1, 0)), 0.3, 0.26, 0xff7628, 0, 0.05, 0, 0.9);
}
function updateIndustrialSites(dt) {
  for (const site of industrialSites) {
    const animateDetails = !save.reducedGraphics || site.g.position.distanceToSquared(camera.position) < 900 * 900;
    for (const part of site.animations.slice()) {
      const motion = part.userData.collapse;
      if (!motion) continue;
      motion.elapsed += dt;
      const t = THREE.MathUtils.smoothstep(motion.elapsed / motion.duration, 0, 1);
      if (animateDetails || t >= 1) {
        part.rotation.z = THREE.MathUtils.lerp(motion.startAngle, motion.targetAngle, t);
        part.position.y = THREE.MathUtils.lerp(motion.startY, motion.endY, t);
      }
      if (t >= 1) {
        part.userData.fallen = true;
        part.userData.collapse = null;
        site.animations.splice(site.animations.indexOf(part), 1);
        const impact = site.g.localToWorld(new THREE.Vector3(part.position.x, 1, part.position.z));
        boom(impact);
        smoke(impact, 1.05, 4.8, 0x282522, -0.1, 0.7, 0, 0.72);
      }
    }
  }
}
function damageIndustrialSite(pos, owner) {
  if (!owner?.team) return null;
  let target = null;
  let bestDistance = Infinity;
  for (const site of industrialSites) {
    if (site.destroyed || site.team === owner.team) continue;
    const distance = Math.hypot(pos.x - site.x, (pos.z - site.z) * 0.8);
    if (distance < 108 && distance < bestDistance) {
      target = site;
      bestDistance = distance;
    }
  }
  if (!target) return null;
  target.damageHits = Math.min(target.maxHits, target.damageHits + 1);
  industrialDamageState[target.id] = target.damageHits;
  const shell = target.shells[target.damageHits - 1];
  if (shell) collapseIndustrialPart(target, shell, 'building');
  const fallenChimneys = Math.min(target.chimneys.length, Math.ceil(target.damageHits / 2));
  for (let i = 0; i < fallenChimneys; i++) collapseIndustrialPart(target, target.chimneys[i], 'chimney');
  smoke(pos.clone().add(new THREE.Vector3(0, 1.2, 0)), 0.7, 3.2, 0x282522, -0.1, 0.55, 0, 0.82);
  if (target.damageHits >= target.maxHits) {
    target.destroyed = true;
    for (const chimney of target.chimneys) chimney.userData.fallen = true;
    for (const source of factorySmokeSources) if (source.site === target) source.disabled = true;
    const report = `${target.name} destroyed · factory complex reduced to rubble`;
    feed(report, 'victory');
    if (owner === player) {
      recordCareerCounter('factoryKills');
      cashAdd(350, 'Enemy factory destroyed');
      say(report);
    }
    return target;
  }
  if (owner === player) say(`${target.name} bombed · ${target.maxHits - target.damageHits} more hits to destroy`);
  return target;
}
function buildRuinedFactories() {
  const brickMats = [0x794c3b, 0x845341, 0x684538, 0x905b43].map(color => new THREE.MeshLambertMaterial({
    color
  }));
  const soot = new THREE.MeshLambertMaterial({
    color: 0x282522
  });
  const iron = new THREE.MeshLambertMaterial({
    color: 0x353936
  });
  const rust = new THREE.MeshLambertMaterial({
    color: 0x654a36
  });
  const glass = new THREE.MeshLambertMaterial({
    color: 0x334247,
    emissive: 0x171b1b
  });
  const rubble = new THREE.MeshLambertMaterial({
    color: 0x625647
  });
  const geoCache = new Map();
  const boxGeo = (w, h, d) => {
    const key = `${w.toFixed(2)}:${h.toFixed(2)}:${d.toFixed(2)}`;
    if (!geoCache.has(key)) geoCache.set(key, new THREE.BoxGeometry(w, h, d));
    return geoCache.get(key);
  };
  const sites = [{
    id: 'west-munitions',
    name: 'West Munitions Works',
    x: -1430,
    z: 260,
    yaw: 0.18,
    tint: 0
  }, {
    id: 'eastern-steel',
    name: 'Eastern Steelworks',
    x: 1110,
    z: -520,
    yaw: -0.24,
    tint: 1
  }, {
    id: 'river-foundry',
    name: 'River Foundry',
    x: 1370,
    z: 390,
    yaw: 0.32,
    tint: 2
  }, {
    id: 'lens-works',
    name: 'Lens Industrial Estate',
    x: 1550,
    z: -1250,
    yaw: -0.16,
    tint: 3
  }, {
    id: 'southern-works',
    name: 'Southern Ironworks',
    x: 800,
    z: 1180,
    yaw: 0.2,
    tint: 1
  }, {
    id: 'western-depot',
    name: 'Western Rail Works',
    x: -1550,
    z: -1080,
    yaw: -0.3,
    tint: 2
  }];
  for (const [index, spec] of sites.entries()) {
    if (riverDistance(spec.x, spec.z) < 150 || FIELDS.trenches.some(field => Math.hypot(spec.x - field.x, spec.z - field.z) < 150)) continue;
    const ground = heightAt(spec.x, spec.z);
    const group = new THREE.Group();
    group.position.set(spec.x, ground, spec.z);
    group.rotation.y = spec.yaw;
    world.add(group);
    const tint = brickMats[spec.tint];
    const addBox = (parent, w, h, d, x, y, z, material) => {
      const mesh = new THREE.Mesh(boxGeo(w, h, d), material);
      mesh.position.set(x, y, z);
      parent.add(mesh);
      return mesh;
    };
    // A broad paved yard, spur rails, loading aprons and soot-dark blast scars anchor the campus.
    addBox(group, 154, 0.48, 122, 0, 0.22, 0, new THREE.MeshLambertMaterial({
      color: 0x554d40
    }));
    addBox(group, 138, 0.14, 1.1, 0, 0.52, 61, rust);
    addBox(group, 1.4, 0.12, 104, -56, 0.58, 8, iron);
    addBox(group, 1.4, 0.12, 104, -50, 0.58, 8, iron);
    for (let sleeper = -40; sleeper <= 56; sleeper += 8) addBox(group, 9, 0.26, 1.1, -53, 0.48, sleeper, rubble);
    for (let i = 0; i < 8; i++) {
      const stain = new THREE.Mesh(new THREE.CircleGeometry(7 + Math.random() * 8, 18), new THREE.MeshBasicMaterial({
        color: 0x302a24,
        transparent: true,
        opacity: 0.43,
        depthWrite: false,
        side: THREE.DoubleSide
      }));
      stain.rotation.x = -Math.PI / 2;
      stain.position.set((Math.random() - 0.5) * 126, 0.51, (Math.random() - 0.5) * 94);
      stain.scale.set(1.4, 0.72, 1);
      group.add(stain);
    }
    const shells = [];
    const hallSpecs = [[-22, -20, 64, 38, 22], [34, -33, 42, 27, 17], [-43, 25, 42, 30, 18], [10, 34, 48, 26, 15], [48, 15, 27, 23, 14], [-2, 3, 33, 23, 13]];
    for (const [hallIndex, [cx, cz, width, depth, height]] of hallSpecs.entries()) {
      const shell = new THREE.Group();
      shell.position.set(cx, 0, cz);
      group.add(shell);
      shells.push(shell);
      stoneRicochetTargets.push({
        position: group.localToWorld(new THREE.Vector3(cx, height * 0.48, cz)),
        radius: Math.max(width, depth) * 0.52,
        chance: 0.24
      });
      const floor = addBox(shell, width + 4, 0.55, depth + 4, 0, 0.4, 0, rubble);
      floor.userData.foundation = true;
      // Heavy brick walls with visible loading doors, dark broken windows and interior columns.
      addBox(shell, width * 0.35, height, 1.45, -width * 0.325, height / 2, -depth / 2, tint);
      addBox(shell, width * 0.35, height, 1.45, width * 0.325, height / 2, -depth / 2, tint);
      addBox(shell, width, height, 1.45, 0, height / 2, depth / 2, brickMats[(spec.tint + 1) % brickMats.length]);
      addBox(shell, 1.45, height, depth, -width / 2, height / 2, 0, tint);
      addBox(shell, 1.45, height * 0.72, depth * 0.72, width / 2, height * 0.36, 0, tint);
      addBox(shell, width * 0.27, 0.8, 1.8, 0, height - 0.5, -depth / 2, rust);
      for (const doorX of [-width * 0.17, width * 0.17]) {
        addBox(shell, width * 0.12, height * 0.57, 0.25, doorX, height * 0.29, -depth / 2 - 0.83, soot);
        addBox(shell, 0.34, height * 0.59, 0.35, doorX - width * 0.065, height * 0.3, -depth / 2 - 0.95, iron);
        addBox(shell, 0.34, height * 0.59, 0.35, doorX + width * 0.065, height * 0.3, -depth / 2 - 0.95, iron);
      }
      for (const side of [-1, 1]) {
        for (let row = 0; row < 2; row++) {
          for (let col = 0; col < Math.max(2, Math.floor(depth / 8)); col++) {
            const z = -depth * 0.34 + col * (depth * 0.68 / Math.max(1, Math.floor(depth / 8) - 1));
            const y = height * (row ? 0.72 : 0.4);
            addBox(shell, 0.2, 2.8, 3.4, side * (width / 2 + 0.75), y, z, glass);
            addBox(shell, 0.25, 3.15, 0.24, side * (width / 2 + 0.87), y, z - 1.75, iron);
            addBox(shell, 0.25, 3.15, 0.24, side * (width / 2 + 0.87), y, z + 1.75, iron);
          }
        }
      }
      // Long sawtooth roof bays, clerestory glass, ridge caps and exposed trusses.
      for (const side of [-1, 1]) {
        const roof = addBox(shell, width * 0.57, 0.72, depth + 2.4, side * width * 0.235, height + 1.35, 0, hallIndex % 2 ? rust : iron);
        roof.rotation.z = -side * 0.24;
        const clerestory = addBox(shell, width * 0.12, 1.6, depth * 0.68, side * width * 0.045, height + 2.0, 0, glass);
        clerestory.rotation.z = -side * 0.12;
        for (let rib = 0; rib < 5; rib++) addBox(shell, 0.34, 0.5, depth + 1, side * (width * 0.1 + rib * width * 0.065), height + 1.82, 0, iron);
      }
      for (const x of [-width * 0.38, -width * 0.13, width * 0.13, width * 0.38]) {
        const column = addBox(shell, 0.65, height * 0.88, 0.72, x, height * 0.44, 0, iron);
        column.userData.foundation = true;
        addBox(shell, 0.8, 0.4, depth * 0.8, x, height * 0.88, 0, rust);
      }
      for (let bay = 0; bay < 5; bay++) {
        const pipe = addBox(shell, 0.42, 0.42, depth * 0.82, -width * 0.38 + bay * width * 0.19, height * 0.28, 0, iron);
        pipe.rotation.y = (bay % 2 ? 1 : -1) * 0.015;
      }
    }
    // Pipe gantries, pressure tanks, coal hoppers and a water tower give the yard scale.
    for (const [x, z, height, radius] of [[-61, -42, 13, 5], [62, -43, 17, 6], [62, 48, 11, 4]]) {
      const tank = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius * 1.12, height, 12), iron);
      tank.position.set(x, height / 2 + 0.65, z);
      group.add(tank);
      for (const y of [2, height * 0.55, height - 1]) {
        const band = new THREE.Mesh(new THREE.TorusGeometry(radius * 1.02, 0.22, 6, 18), rust);
        band.position.set(x, y, z);
        group.add(band);
      }
      const cap = new THREE.Mesh(new THREE.ConeGeometry(radius, 2.8, 10), rust);
      cap.position.set(x, height + 2, z);
      group.add(cap);
    }
    const chimneySpecs = [[-49, -25, 46], [43, -8, 55], [27, 51, 39]];
    const chimneys = [];
    for (const [stackIndex, [x, z, height]] of chimneySpecs.entries()) {
      const chimney = new THREE.Group();
      chimney.position.set(x, 0, z);
      group.add(chimney);
      const shaft = new THREE.Mesh(new THREE.CylinderGeometry(2.55, 4.05, height, 12, 1), brickMats[(spec.tint + stackIndex) % brickMats.length]);
      shaft.position.y = height / 2;
      chimney.add(shaft);
      for (const y of [4, height * 0.34, height * 0.68, height - 2]) {
        const band = new THREE.Mesh(new THREE.TorusGeometry(2.9 + (height - y) * 0.018, 0.34, 6, 16), iron);
        band.position.y = y;
        chimney.add(band);
      }
      const crown = new THREE.Mesh(new THREE.CylinderGeometry(3.15, 2.5, 1.7, 12), soot);
      crown.position.y = height + 0.4;
      chimney.add(crown);
      for (const side of [-1, 1]) {
        const buttress = new THREE.Mesh(new THREE.BoxGeometry(0.8, 5, 1.0), rust);
        buttress.position.set(side * 2.5, 2.6, 0);
        chimney.add(buttress);
      }
      chimneys.push(chimney);
    }
    for (const [x, z, length] of [[-54, -7, 74], [43, 7, 70], [-12, 54, 62]]) {
      const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.72, 0.72, length, 8), iron);
      pipe.rotation.x = Math.PI / 2;
      pipe.position.set(x, 9 + index % 2 * 2, z);
      group.add(pipe);
      for (let brace = -2; brace <= 2; brace++) {
        const ring = new THREE.Mesh(new THREE.TorusGeometry(0.78, 0.12, 5, 12), rust);
        ring.rotation.x = Math.PI / 2;
        ring.position.set(x, pipe.position.y, z + brace * length / 5);
        group.add(ring);
      }
    }
    for (let bit = 0; bit < 30; bit++) {
      const chunk = new THREE.Mesh(boxGeo(1.8 + Math.random() * 5, 0.55 + Math.random() * 1.8, 1.5 + Math.random() * 4), bit % 4 ? rubble : soot);
      chunk.position.set((Math.random() - 0.5) * 142, 0.65 + Math.random() * 0.55, (Math.random() - 0.5) * 108);
      chunk.rotation.set((Math.random() - 0.5) * 0.2, Math.random() * Math.PI, (Math.random() - 0.5) * 0.28);
      group.add(chunk);
    }
    const site = {
      ...spec,
      g: group,
      team: spec.x < 0 ? 'blue' : 'red',
      name: spec.name,
      shells,
      chimneys,
      animations: [],
      maxHits: 6,
      damageHits: Math.min(6, industrialDamageState[spec.id] || 0),
      destroyed: false
    };
    industrialSites.push(site);
    for (const chimney of chimneys) {
      chimney.userData.fallDirection = Math.random() < 0.5 ? -1 : 1;
      factorySmokeSources.push({
        position: group.localToWorld(new THREE.Vector3(chimney.position.x, 57, chimney.position.z)),
        timer: 0.6 + Math.random() * 1.4,
        site,
        chimney
      });
    }
    for (let shellIndex = 0; shellIndex < site.damageHits; shellIndex++) collapseIndustrialPart(site, shells[shellIndex], 'building', true);
    for (let i = 0; i < Math.min(chimneys.length, Math.ceil(site.damageHits / 2)); i++) collapseIndustrialPart(site, chimneys[i], 'chimney', true);
    site.destroyed = site.damageHits >= site.maxHits;
    if (site.destroyed) for (const source of factorySmokeSources) if (source.site === site) source.disabled = true;
  }
}
function buildThirdCity() {
  const cityX = 1280;
  const cityZ = -1250;
  const brickMats = [0x655b4e, 0x776852, 0x504b43, 0x827765].map(color => new THREE.MeshLambertMaterial({
    color
  }));
  const roofMats = [0x353636, 0x4b4338, 0x5a4034].map(color => new THREE.MeshLambertMaterial({
    color
  }));
  const soot = new THREE.MeshLambertMaterial({
    color: 0x292723
  });
  const rubble = new THREE.MeshLambertMaterial({
    color: 0x5f5547
  });
  const trim = new THREE.MeshLambertMaterial({
    color: 0x9a8a6a
  });

  // A dense grid of French brick blocks fills the otherwise empty north-eastern sector.
  for (let ix = -9; ix <= 9; ix++) {
    for (let iz = -9; iz <= 9; iz++) {
      if (Math.abs(ix) <= 1 && Math.abs(iz) <= 1) continue;
      if (ix % 4 === 0 || iz % 4 === 0 || Math.random() > 0.68) continue;
      const x = cityX + ix * 43 + (Math.random() - 0.5) * 10;
      const z = cityZ + iz * 43 + (Math.random() - 0.5) * 10;
      if (riverDistance(x, z) < 55 || FIELDS.trenches.some(field => Math.hypot(x - field.x, z - field.z) < 170)) continue;
      const width = 14 + Math.random() * 10;
      const depth = 13 + Math.random() * 10;
      const height = 8 + Math.random() * 11;
      const building = new THREE.Group();
      const brick = brickMats[Math.floor(Math.random() * brickMats.length)];
      const wall = (w, h, d, px, py, pz, material = brick, rz = 0) => {
        const piece = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
        piece.position.set(px, py, pz);
        piece.rotation.z = rz;
        building.add(piece);
      };
      wall(width, height * (0.55 + Math.random() * 0.4), 1.1, 0, height * 0.42, -depth / 2);
      wall(1.1, height * (0.45 + Math.random() * 0.4), depth, -width / 2, height * 0.34, 0);
      if (Math.random() > 0.28) wall(1.1, height * 0.34, depth * 0.78, width / 2, height * 0.22, 0.08, soot);
      if (Math.random() > 0.55) {
        for (const side of [-1, 1]) {
          const roof = new THREE.Mesh(new THREE.BoxGeometry(width * 0.62, 0.9, depth + 1.5), roofMats[Math.floor(Math.random() * roofMats.length)]);
          roof.position.set(side * width * 0.24, height + 1.6, 0);
          roof.rotation.z = -side * 0.5;
          building.add(roof);
        }
      }
      for (const wx of [-width * 0.25, width * 0.25]) {
        const window = new THREE.Mesh(new THREE.BoxGeometry(1.5, 2.6, 0.16), soot);
        window.position.set(wx, height * 0.42, -depth / 2 - 0.58);
        building.add(window);
      }
      for (let bit = 0; bit < 2; bit++) {
        const chunk = new THREE.Mesh(new THREE.BoxGeometry(2 + Math.random() * 4, 0.7, 2 + Math.random() * 4), bit ? rubble : trim);
        chunk.position.set((Math.random() - 0.5) * width, 0.45, (Math.random() - 0.5) * depth);
        chunk.rotation.y = Math.random() * Math.PI;
        building.add(chunk);
      }
      building.position.set(x, heightAt(x, z), z);
      building.rotation.y = (Math.random() - 0.5) * 0.16;
      world.add(building);
    }
  }
  for (const [offsetX, offsetZ, rise] of [[-290, -210, 24], [260, -250, 20], [-225, 265, 22], [305, 245, 26]]) {
    addCitySmokeSource(cityX + offsetX, cityZ + offsetZ, rise);
  }

  // St Martin’s church, with a battered nave, bell tower and broken spire, anchors the square.
  const church = new THREE.Group();
  const stone = new THREE.MeshLambertMaterial({
    color: 0x938a78
  });
  const darkRoof = new THREE.MeshLambertMaterial({
    color: 0x343637
  });
  const glass = new THREE.MeshLambertMaterial({
    color: 0x202d32,
    side: THREE.DoubleSide
  });
  const churchBox = (w, h, d, x, y, z, material, rz = 0) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
    mesh.position.set(x, y, z);
    mesh.rotation.z = rz;
    church.add(mesh);
    return mesh;
  };
  churchBox(40, 17, 78, 0, 8.5, 3, stone);
  churchBox(68, 14, 27, 0, 7, -8, stone);
  churchBox(25, 1.5, 82, -12, 19, 3, darkRoof, 0.48);
  churchBox(25, 1.5, 82, 12, 19, 3, darkRoof, -0.48);
  churchBox(17, 39, 18, -12, 19.5, -30, stone);
  churchBox(21, 7, 22, -12, 42, -30, trim);
  const spire = new THREE.Mesh(new THREE.ConeGeometry(10, 27, 8), darkRoof);
  spire.position.set(-12, 59, -30);
  church.add(spire);
  churchBox(1.1, 9, 1.1, -12, 77, -30, trim);
  churchBox(6, 0.8, 0.8, -12, 78.4, -30, trim);
  for (const z of [-22, -5, 13, 31]) {
    const window = new THREE.Mesh(new THREE.BoxGeometry(2.5, 8, 0.2), glass);
    window.position.set(20.65, 9, z);
    church.add(window);
  }
  for (const x of [-15, 0, 15]) {
    const rubblePiece = new THREE.Mesh(new THREE.BoxGeometry(4 + Math.random() * 4, 0.8, 3 + Math.random() * 4), rubble);
    rubblePiece.position.set(x, 0.6, 48 + Math.random() * 8);
    rubblePiece.rotation.y = Math.random() * Math.PI;
    church.add(rubblePiece);
  }
  church.position.set(cityX, heightAt(cityX, cityZ), cityZ);
  church.rotation.y = -0.12;
  world.add(church);

  // The map-wide industrial works are built once by buildRuinedFactories(), where
  // each campus has shared persistent damage and its own collapse animations.
}
const factionFlagTextures = {};
function factionFlagTexture(team) {
  if (factionFlagTextures[team]) return factionFlagTextures[team];
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (team === 'blue') {
    // French Republic tricolour, a period-correct Allied representative on the Western Front.
    ctx.fillStyle = '#20396b';
    ctx.fillRect(0, 0, 256 / 3, 128);
    ctx.fillStyle = '#f0ead9';
    ctx.fillRect(256 / 3, 0, 256 / 3, 128);
    ctx.fillStyle = '#b23832';
    ctx.fillRect(256 / 3 * 2, 0, 256 / 3, 128);
  } else {
    // Black-white-red horizontal tricolour of the German Empire (1871–1918).
    ctx.fillStyle = '#171918';
    ctx.fillRect(0, 0, 256, 128 / 3);
    ctx.fillStyle = '#eee8da';
    ctx.fillRect(0, 128 / 3, 256, 128 / 3);
    ctx.fillStyle = '#a52b26';
    ctx.fillRect(0, 128 / 3 * 2, 256, 128 / 3);
  }
  const sheen = ctx.createLinearGradient(0, 0, 256, 0);
  sheen.addColorStop(0, 'rgba(255,255,255,.11)');
  sheen.addColorStop(0.48, 'rgba(255,255,255,0)');
  sheen.addColorStop(1, 'rgba(20,16,12,.12)');
  ctx.fillStyle = sheen;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = 'rgba(42,34,25,.7)';
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, 254, 126);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  factionFlagTextures[team] = texture;
  return texture;
}
function addNailedSign(parent, texture, width, height, y, z, woodMaterial) {
  const board = new THREE.Mesh(new THREE.BoxGeometry(width + 0.28, height + 0.18, 0.15), woodMaterial);
  board.position.set(0, y, z);
  parent.add(board);
  const face = new THREE.Mesh(new THREE.PlaneGeometry(width, height), new THREE.MeshBasicMaterial({
    map: texture,
    side: THREE.DoubleSide
  }));
  face.position.set(0, y, z - 0.081);
  face.rotation.y = Math.PI;
  parent.add(face);
  const nailGeo = new THREE.SphereGeometry(0.055, 8, 6);
  const nailMat = new THREE.MeshLambertMaterial({
    color: 0x5b5143
  });
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) {
    const nail = new THREE.Mesh(nailGeo, nailMat);
    nail.position.set(sx * width * 0.45, y + sy * height * 0.34, z - 0.105);
    parent.add(nail);
  }
}
function makeFieldBuildingTexture(style) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 512;
  const ctx = canvas.getContext('2d');
  const noise = (count, light, dark) => {
    for (let i = 0; i < count; i++) {
      ctx.fillStyle = Math.random() < 0.5 ? light : dark;
      ctx.fillRect(Math.random() * 512, Math.random() * 512, 1 + Math.random() * 3, 1 + Math.random() * 2);
    }
  };
  if (style === 'plank' || style === 'timber') {
    ctx.fillStyle = style === 'plank' ? '#9b835d' : '#60462f';
    ctx.fillRect(0, 0, 512, 512);
    const rowHeight = style === 'plank' ? 48 : 64;
    for (let y = 0, row = 0; y < 512; y += rowHeight, row++) {
      const base = style === 'plank' ? 133 + Math.floor(Math.random() * 24) : 83 + Math.floor(Math.random() * 25);
      ctx.fillStyle = `rgb(${base},${Math.floor(base * 0.84)},${Math.floor(base * 0.62)})`;
      ctx.fillRect(0, y + 2, 512, rowHeight - 4);
      ctx.fillStyle = 'rgba(28,21,14,.36)';
      ctx.fillRect(0, y, 512, 2);
      ctx.fillStyle = 'rgba(235,214,172,.2)';
      ctx.fillRect(0, y + 3, 512, 1);
      for (let x = row % 2 * 76; x < 512; x += 152) {
        ctx.fillStyle = 'rgba(35,24,14,.26)';
        ctx.fillRect(x, y + 2, 2, rowHeight - 4);
      }
      for (let grain = 0; grain < 14; grain++) {
        const gy = y + 6 + Math.random() * (rowHeight - 12);
        ctx.strokeStyle = style === 'plank' ? 'rgba(64,44,27,.16)' : 'rgba(21,15,10,.2)';
        ctx.lineWidth = 1 + Math.random() * 2;
        ctx.beginPath();
        ctx.moveTo(Math.random() * 70, gy);
        ctx.bezierCurveTo(150, gy - 5, 340, gy + 4, 512, gy + (Math.random() - 0.5) * 4);
        ctx.stroke();
      }
    }
    noise(2400, 'rgba(245,218,172,.12)', 'rgba(24,17,12,.1)');
  } else if (style === 'stone') {
    ctx.fillStyle = '#655a49';
    ctx.fillRect(0, 0, 512, 512);
    for (let row = 0, y = 0; y < 512; row++, y += 54) {
      let x = row % 2 ? -55 : -4;
      while (x < 512) {
        const w = 66 + Math.random() * 64;
        const tone = Math.round(104 + Math.random() * 35);
        ctx.fillStyle = `rgb(${tone},${tone - 9},${tone - 24})`;
        ctx.fillRect(x + 2, y + 2, w - 4, 49);
        ctx.fillStyle = 'rgba(238,220,182,.17)';
        ctx.fillRect(x + 4, y + 4, w - 8, 2);
        ctx.fillStyle = 'rgba(23,21,18,.28)';
        ctx.fillRect(x + 4, y + 47, w - 8, 2);
        x += w;
      }
    }
    noise(3200, 'rgba(238,222,192,.12)', 'rgba(25,22,18,.13)');
  } else if (style === 'plaster') {
    ctx.fillStyle = '#b4a88e';
    ctx.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 22; i++) {
      ctx.fillStyle = `rgba(${i % 2 ? '66,55,39' : '245,234,211'},${0.025 + Math.random() * 0.035})`;
      ctx.beginPath();
      ctx.ellipse(Math.random() * 512, Math.random() * 512, 18 + Math.random() * 62, 10 + Math.random() * 42, Math.random() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }
    noise(7000, 'rgba(247,235,211,.19)', 'rgba(51,45,35,.1)');
    ctx.strokeStyle = 'rgba(65,53,40,.28)';
    ctx.lineWidth = 1.2;
    for (const [x, y] of [[84, 136], [370, 285], [205, 426]]) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x - 7, y + 16);
      ctx.lineTo(x + 1, y + 27);
      ctx.lineTo(x - 4, y + 41);
      ctx.stroke();
    }
  } else if (style === 'slate') {
    ctx.fillStyle = '#343632';
    ctx.fillRect(0, 0, 512, 512);
    for (let row = 0, y = 0; y < 512; row++, y += 44) {
      const shift = row % 2 ? -37 : 0;
      for (let x = shift; x < 512; x += 74) {
        const tone = Math.floor(48 + Math.random() * 25);
        ctx.fillStyle = `rgb(${tone},${tone + 2},${tone + 1})`;
        ctx.fillRect(x + 2, y + 2, 70, 40);
        ctx.strokeStyle = 'rgba(190,185,167,.15)';
        ctx.beginPath();
        ctx.moveTo(x + 4, y + 3);
        ctx.lineTo(x + 70, y + 3);
        ctx.stroke();
        ctx.strokeStyle = 'rgba(12,14,14,.38)';
        ctx.beginPath();
        ctx.moveTo(x + 2, y + 40);
        ctx.lineTo(x + 72, y + 40);
        ctx.stroke();
      }
    }
    noise(2600, 'rgba(209,203,184,.1)', 'rgba(4,6,6,.18)');
  } else {
    ctx.fillStyle = '#a99b78';
    ctx.fillRect(0, 0, 512, 512);
    for (let x = 0; x < 512; x += 32) {
      ctx.fillStyle = x % 64 ? 'rgba(230,213,176,.14)' : 'rgba(39,32,23,.16)';
      ctx.fillRect(x, 0, 4, 512);
      ctx.fillStyle = 'rgba(53,44,31,.14)';
      ctx.fillRect(x + 5, 0, 1, 512);
    }
    noise(2200, 'rgba(245,224,182,.12)', 'rgba(47,38,27,.12)');
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
  return texture;
}
const fieldBuildingMaterials = (() => {
  const timberTexture = makeFieldBuildingTexture('timber');
  const textures = {
    plank: makeFieldBuildingTexture('plank'),
    timber: timberTexture,
    plaster: makeFieldBuildingTexture('plaster'),
    stone: makeFieldBuildingTexture('stone'),
    slate: makeFieldBuildingTexture('slate'),
    canvas: makeFieldBuildingTexture('canvas')
  };
  return {
    timber: new THREE.MeshLambertMaterial({
      color: 0xd4b27a,
      map: textures.timber
    }),
    timberLight: new THREE.MeshLambertMaterial({
      color: 0xffffff,
      map: textures.timber
    }),
    shopWall: new THREE.MeshLambertMaterial({
      color: 0xffffff,
      map: textures.plank
    }),
    roof: new THREE.MeshLambertMaterial({
      color: 0xffffff,
      map: textures.slate,
      side: THREE.DoubleSide
    }),
    plaster: new THREE.MeshLambertMaterial({
      color: 0xffffff,
      map: textures.plaster
    }),
    stone: new THREE.MeshLambertMaterial({
      color: 0xffffff,
      map: textures.stone
    }),
    canvas: new THREE.MeshLambertMaterial({
      color: 0xffffff,
      map: textures.canvas,
      side: THREE.DoubleSide
    }),
    darkGlass: new THREE.MeshLambertMaterial({
      color: 0x273237
    }),
    brass: new THREE.MeshLambertMaterial({
      color: 0x9b7b49
    })
  };
})();
function buildFieldBuildings(sx, sz, sy, dx, dz, dy, heading = 0) {
  const {
    timber,
    timberLight,
    shopWall,
    roof: roofMat,
    darkGlass,
    plaster,
    stone,
    brass
  } = fieldBuildingMaterials;
  const frontWindow = (parent, x, y, z, w, h, frame) => {
    const pane = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.1), darkGlass);
    pane.position.set(x, y, z - 0.045);
    parent.add(pane);
    for (const side of [-1, 1]) {
      const jamb = new THREE.Mesh(new THREE.BoxGeometry(0.13, h + 0.22, 0.17), frame);
      jamb.position.set(x + side * (w / 2 + 0.07), y, z - 0.08);
      parent.add(jamb);
    }
    for (const side of [-1, 1]) {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(w + 0.24, 0.14, 0.17), frame);
      rail.position.set(x, y + side * (h / 2 + 0.07), z - 0.08);
      parent.add(rail);
    }
    const mullion = new THREE.Mesh(new THREE.BoxGeometry(0.075, h, 0.13), frame);
    mullion.position.set(x, y, z - 0.11);
    parent.add(mullion);
  };

  // Rough timber shop: framed plank walls, a pitched roof, front windows and a real door.
  const shop = new THREE.Group();
  shop.position.set(sx, sy, sz);
  shop.rotation.y = heading;
  const shopBase = new THREE.Mesh(new THREE.BoxGeometry(7.65, 0.3, 6.45), stone);
  shopBase.position.y = 0.16;
  const shopBody = new THREE.Mesh(new THREE.BoxGeometry(7.2, 3.5, 6), shopWall);
  shopBody.position.y = 1.9;
  shop.add(shopBase, shopBody);
  const shopFront = -3.035;
  for (const x of [-3.42, 3.42]) {
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.22, 3.55, 0.24), timber);
    post.position.set(x, 1.93, shopFront - 0.07);
    shop.add(post);
  }
  for (let i = 0; i < 11; i++) {
    const plank = new THREE.Mesh(new THREE.BoxGeometry(0.055, 3.2, 0.07), i % 2 ? timberLight : timber);
    plank.position.set(-3 + i * 0.6, 1.9, shopFront - 0.055);
    shop.add(plank);
  }
  const shopDoor = new THREE.Mesh(new THREE.BoxGeometry(1.55, 2.55, 0.15), timber);
  shopDoor.position.set(0, 1.43, shopFront - 0.105);
  shop.add(shopDoor);
  const shopDoorInset = new THREE.Mesh(new THREE.BoxGeometry(1.22, 2.15, 0.04), timberLight);
  shopDoorInset.position.set(0, 1.43, shopFront - 0.2);
  shop.add(shopDoorInset);
  const shopKnob = new THREE.Mesh(new THREE.SphereGeometry(0.075, 8, 6), brass);
  shopKnob.position.set(0.52, 1.42, shopFront - 0.245);
  shop.add(shopKnob);
  frontWindow(shop, -2.25, 2.3, shopFront - 0.07, 1.0, 0.9, timber);
  frontWindow(shop, 2.25, 2.3, shopFront - 0.07, 1.0, 0.9, timber);
  const shopGableShape = new THREE.Shape();
  shopGableShape.moveTo(-3.6, 0);
  shopGableShape.lineTo(3.6, 0);
  shopGableShape.lineTo(0, 1.5);
  shopGableShape.closePath();
  const shopGableGeo = new THREE.ShapeGeometry(shopGableShape);
  const shopGableFront = new THREE.Mesh(shopGableGeo, timberLight);
  shopGableFront.position.set(0, 3.62, shopFront - 0.025);
  shopGableFront.rotation.y = Math.PI;
  shop.add(shopGableFront);
  const shopGableBack = new THREE.Mesh(shopGableGeo, timberLight);
  shopGableBack.position.set(0, 3.62, 3.025);
  shop.add(shopGableBack);
  for (const side of [-1, 1]) {
    const roofPanel = new THREE.Mesh(new THREE.BoxGeometry(4.45, 0.24, 6.55), roofMat);
    roofPanel.position.set(side * 1.82, 4.42, 0);
    roofPanel.rotation.z = side < 0 ? 0.39 : -0.39;
    shop.add(roofPanel);
  }
  const shopRidge = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.26, 6.65), timber);
  shopRidge.position.set(0, 5.15, 0);
  shop.add(shopRidge);
  addNailedSign(shop, signTex, 3.65, 0.92, 2.94, shopFront - 0.14, timber);
  world.add(shop);

  // Plastered debrief office with timber framing, multi-pane windows and a slate roof.
  const office = new THREE.Group();
  office.position.set(dx, dy, dz);
  office.rotation.y = heading;
  const foundation = new THREE.Mesh(new THREE.BoxGeometry(10.45, 0.38, 8.45), stone);
  foundation.position.y = 0.2;
  const officeBody = new THREE.Mesh(new THREE.BoxGeometry(10, 4.25, 8), plaster);
  officeBody.position.y = 2.3;
  office.add(foundation, officeBody);
  const officeFront = -4.035;
  for (const x of [-4.72, 4.72]) {
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.28, 4.22, 0.26), timber);
    post.position.set(x, 2.32, officeFront - 0.09);
    office.add(post);
  }
  for (const y of [0.66, 3.98]) {
    const beam = new THREE.Mesh(new THREE.BoxGeometry(9.85, 0.24, 0.28), timber);
    beam.position.set(0, y, officeFront - 0.09);
    office.add(beam);
  }
  const officeDoor = new THREE.Mesh(new THREE.BoxGeometry(1.9, 3.1, 0.16), timber);
  officeDoor.position.set(0, 1.74, officeFront - 0.11);
  office.add(officeDoor);
  const doorPanel = new THREE.Mesh(new THREE.BoxGeometry(1.52, 2.65, 0.05), timberLight);
  doorPanel.position.set(0, 1.74, officeFront - 0.22);
  office.add(doorPanel);
  const doorHandle = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 6), brass);
  doorHandle.position.set(0.63, 1.72, officeFront - 0.28);
  office.add(doorHandle);
  frontWindow(office, -3, 2.45, officeFront - 0.07, 1.45, 1.55, timber);
  frontWindow(office, 3, 2.45, officeFront - 0.07, 1.45, 1.55, timber);
  const officeStep = new THREE.Mesh(new THREE.BoxGeometry(3, 0.22, 1.1), stone);
  officeStep.position.set(0, 0.31, officeFront - 0.5);
  office.add(officeStep);
  const officeGableShape = new THREE.Shape();
  officeGableShape.moveTo(-5, 0);
  officeGableShape.lineTo(5, 0);
  officeGableShape.lineTo(0, 1.9);
  officeGableShape.closePath();
  const officeGableGeo = new THREE.ShapeGeometry(officeGableShape);
  const officeGableFront = new THREE.Mesh(officeGableGeo, plaster);
  officeGableFront.position.set(0, 4.42, officeFront - 0.025);
  officeGableFront.rotation.y = Math.PI;
  office.add(officeGableFront);
  const officeGableBack = new THREE.Mesh(officeGableGeo, plaster);
  officeGableBack.position.set(0, 4.42, 4.025);
  office.add(officeGableBack);
  const slate = new THREE.MeshLambertMaterial({
    color: 0x363a39,
    side: THREE.DoubleSide
  });
  for (const side of [-1, 1]) {
    const roofPanel = new THREE.Mesh(new THREE.BoxGeometry(6.15, 0.3, 8.6), slate);
    roofPanel.position.set(side * 2.55, 5.42, 0);
    roofPanel.rotation.z = side < 0 ? 0.48 : -0.48;
    office.add(roofPanel);
  }
  const officeRidge = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.3, 8.75), timber);
  officeRidge.position.set(0, 6.78, 0);
  office.add(officeRidge);
  const chimney = new THREE.Mesh(new THREE.BoxGeometry(0.9, 2.5, 1), stone);
  chimney.position.set(3.05, 6.1, 1.55);
  office.add(chimney);
  const chimneyCap = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.2, 1.2), timber);
  chimneyCap.position.set(3.05, 7.45, 1.55);
  office.add(chimneyCap);
  addNailedSign(office, debriefTex, 4.45, 1.08, 3.56, officeFront - 0.15, timber);
  world.add(office);
}
function buildFieldGramophone(field, x, z) {
  const ground = heightAt(x, z);
  const table = new THREE.Group();
  table.position.set(x, ground, z);
  const wood = new THREE.MeshLambertMaterial({
    color: 0x65452d
  });
  const woodTop = new THREE.MeshLambertMaterial({
    color: 0x9b7047
  });
  const iron = new THREE.MeshLambertMaterial({
    color: 0x302d29
  });
  const brass = new THREE.MeshLambertMaterial({
    color: 0xb79a61
  });
  const top = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.18, 1.9), woodTop);
  top.position.y = 1.02;
  table.add(top);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.96, 0.16), wood);
    leg.position.set(sx * 1.1, 0.52, sz * 0.68);
    table.add(leg);
  }
  const cabinet = new THREE.Mesh(new THREE.BoxGeometry(1.02, 0.34, 0.78), wood);
  cabinet.position.set(0, 1.28, 0.03);
  table.add(cabinet);
  const platter = new THREE.Mesh(new THREE.CylinderGeometry(0.57, 0.57, 0.045, 24), iron);
  platter.position.set(0, 1.49, -0.12);
  table.add(platter);
  const record = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.48, 0.018, 32), new THREE.MeshLambertMaterial({
    color: 0x171716
  }));
  record.position.set(0, 1.523, -0.12);
  table.add(record);
  for (const radius of [0.18, 0.28, 0.37, 0.43]) {
    const groove = new THREE.Mesh(new THREE.TorusGeometry(radius, 0.006, 4, 32), new THREE.MeshLambertMaterial({
      color: 0x57534a
    }));
    groove.rotation.x = Math.PI / 2;
    groove.position.set(0, 1.535, -0.12);
    table.add(groove);
  }
  const label = new THREE.Mesh(new THREE.CircleGeometry(0.12, 18), new THREE.MeshLambertMaterial({
    color: 0xb18d4f
  }));
  label.rotation.x = -Math.PI / 2;
  label.position.set(0, 1.537, -0.12);
  table.add(label);
  const spindle = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.07, 8), brass);
  spindle.position.set(0, 1.55, -0.12);
  table.add(spindle);
  const horn = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.42, 0.68, 14, 1, true), brass);
  horn.position.set(-0.55, 1.8, 0.02);
  horn.rotation.z = Math.PI / 2;
  table.add(horn);
  const hornNeck = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.08, 0.44, 10), iron);
  hornNeck.position.set(-0.13, 1.62, 0.02);
  hornNeck.rotation.z = Math.PI / 2;
  table.add(hornNeck);
  const tonearm = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.68, 6), brass);
  tonearm.position.set(0.43, 1.56, 0.02);
  tonearm.rotation.z = Math.PI / 2;
  table.add(tonearm);
  world.add(table);
  gramophoneSources.push({
    position: new THREE.Vector3(x, ground + 1.7, z),
    team: field.team
  });
  const count = 1 + Math.floor(Math.random() * 3);
  const smokerCount = Math.min(count, Math.random() < 0.5 ? 1 : 2);
  const positions = [[-2.4, 3.2], [2.5, 3.1], [0, 5.1]];
  for (let i = 0; i < count; i++) {
    const [ox, oz] = positions[i];
    const px = x + ox;
    const pz = z + oz;
    const isSmoker = i < smokerCount;
    const appearance = Math.random() < 0.35 ? {
      gender: 'female',
      hairStyle: 'bun',
      hairColor: field.team === 'blue' ? 0x593627 : 0x39251f
    } : {
      gender: 'male',
      mustache: Math.random() < 0.3
    };
    const person = makeStylizedSoldier(field.team, false, appearance);
    scene.remove(person.g);
    person.g.position.set(px, heightAt(px, pz), pz);
    person.g.rotation.y = Math.atan2(-(x - px), -(z - pz));
    let cigarette = null;
    if (isSmoker) {
      cigarette = addPilotCigarette(person);
      cigarette.object.visible = true;
      person.armPivots[0].rotation.x = -0.42;
      person.armPivots[0].rotation.z = 0.12;
    }
    world.add(person.g);
    fieldListeners.push({
      person,
      cigaretteTip: cigarette?.tip || null,
      smokeTimer: 0.5 + Math.random() * 1.2,
      phase: Math.random() * Math.PI * 2
    });
  }
}
function updateFieldListeners(dt) {
  const now = performance.now() * 0.001;
  for (const listener of fieldListeners) {
    listener.person.torso.position.y = 0.99 + Math.sin(now * 1.4 + listener.phase) * 0.012;
    if (!listener.cigaretteTip) continue;
    listener.smokeTimer -= dt;
    if (listener.smokeTimer > 0) continue;
    listener.smokeTimer = 1.15 + Math.random() * 1.35;
    listener.person.g.updateMatrixWorld(true);
    const tip = listener.person.headPivot.localToWorld(listener.cigaretteTip.clone());
    smoke(tip, 0.055, 1.1, 0xaaa59a, 0.018, 0.18, -0.012, 0.38, 0.7);
  }
}
function buildProtectedGroundSites() {
  const masonry = new THREE.MeshLambertMaterial({
    color: 0xd0c8b3
  });
  const roof = new THREE.MeshLambertMaterial({
    color: 0x55534b
  });
  const olive = new THREE.MeshLambertMaterial({
    color: 0x62624b
  });
  const red = new THREE.MeshLambertMaterial({
    color: 0xb3302a
  });
  const dark = new THREE.MeshLambertMaterial({
    color: 0x282723
  });
  const makeSite = (kind, name, x, z) => {
    const g = new THREE.Group();
    const base = new THREE.Mesh(new THREE.BoxGeometry(31, 0.8, 25), dark);
    base.position.y = 0.4;
    const building = new THREE.Mesh(new THREE.BoxGeometry(25, 10, 19), kind === 'hospital' ? masonry : olive);
    building.position.y = 5.8;
    const roofMesh = new THREE.Mesh(new THREE.BoxGeometry(28, 1.1, 22), roof);
    roofMesh.position.y = 11.3;
    g.add(base, building, roofMesh);
    for (const sx of [-7, 7]) {
      const window = new THREE.Mesh(new THREE.BoxGeometry(3.2, 3.1, 0.18), dark);
      window.position.set(sx, 6, -9.65);
      g.add(window);
    }
    if (kind === 'hospital') {
      const sign = new THREE.Mesh(new THREE.BoxGeometry(7.2, 7.2, 0.28), new THREE.MeshLambertMaterial({
        color: 0xf0eadb
      }));
      sign.position.set(0, 6.8, -9.85);
      const vertical = new THREE.Mesh(new THREE.BoxGeometry(1.45, 5.2, 0.34), red);
      vertical.position.set(0, 6.8, -10.05);
      const horizontal = new THREE.Mesh(new THREE.BoxGeometry(5.2, 1.45, 0.34), red);
      horizontal.position.set(0, 6.8, -10.05);
      g.add(sign, vertical, horizontal);
    } else {
      for (const sx of [-7, 0, 7]) {
        const crate = new THREE.Mesh(new THREE.BoxGeometry(5, 4.2, 5), new THREE.MeshLambertMaterial({
          color: sx ? 0x8a7049 : 0x927c56
        }));
        crate.position.set(sx, 3, -13.5);
        g.add(crate);
      }
    }
    const signCanvas = document.createElement('canvas');
    signCanvas.width = 256;
    signCanvas.height = 64;
    const context = signCanvas.getContext('2d');
    context.fillStyle = 'rgba(25,27,25,.9)';
    context.fillRect(0, 0, 256, 64);
    context.strokeStyle = '#e6d9b7';
    context.lineWidth = 4;
    context.strokeRect(2, 2, 252, 60);
    context.fillStyle = '#f4ead2';
    context.font = 'bold 28px Georgia';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(name, 128, 32);
    const signTexture = new THREE.CanvasTexture(signCanvas);
    signTexture.colorSpace = THREE.SRGBColorSpace;
    const signMesh = new THREE.Mesh(new THREE.PlaneGeometry(18, 4.5), new THREE.MeshBasicMaterial({
      map: signTexture,
      side: THREE.DoubleSide,
      toneMapped: false
    }));
    signMesh.position.set(0, 13.7, -10.05);
    g.add(signMesh);
    const ground = heightAt(x, z);
    g.position.set(x, ground, z);
    world.add(g);
    const protectedPosition = new THREE.Vector3(x, ground + 5, z);
    const protectedRadius = kind === 'hospital' ? 20 : 22;
    protectedSites.push({
      kind,
      name,
      position: protectedPosition,
      radius: protectedRadius
    });
    stoneRicochetTargets.push({
      position: protectedPosition.clone(),
      radius: protectedRadius,
      chance: 0.28
    });
  };
  makeSite('hospital', 'FIELD HOSPITAL', -1410, -680);
  makeSite('depot', 'PROTECTED DEPOT', 930, 1150);
}
function buildMap() {
  clearCourierMission();
  restoreGreatWarCampaign(sel.map);
  worldMapType = sel.map;
  worldPreparedForFreshRound = true;
  shopArrows = [];
  fieldFlags = [];
  shipFlags = [];
  stoneRicochetTargets = [];
  debriefSites = [];
  gramophoneSources = [];
  fieldListeners = [];
  groundVehicles = [];
  frontSupplyRoutes = null;
  protectedSites = [];
  protectedHonorUntil = 0;
  flakGuns = [];
  trenchTroops = [];
  battleTracers = [];
  frontTrain = null;
  bedroomTrain = null;
  playerTruck = null;
  ships = [];
  convoyVessels = [];
  factorySmokeSources = [];
  industrialSites = [];
  airfieldDamageSources = [];
  for (const field of FIELDS[sel.map]) {
    field.damageGroup = null;
    field.runwayHeading = sel.map === 'stranda' ? fieldRunwayHeading(field) : null;
  }
  clearRecoveryCaches();
  scene.remove(world);
  world = new THREE.Group();
  sectorVisualGroup = null;
  sectorGridGroup = null;
  scene.add(world);
  initializeSectorControl();
  if (sel.map === 'bedroom') {
    const roomSky = 0x91a1a3;
    daySkyColor.set(roomSky);
    scene.background = new THREE.Color(roomSky);
    setWorldFog(roomSky, 1400, 3000);
    const bedroom = createBedroomMap(world, FIELDS.bedroom, factionFlagTexture);
    fieldFlags = bedroom.fieldFlags;
    shopArrows = bedroom.shopArrows;
    debriefSites = bedroom.debriefSites;
    bedroomTrain = bedroom.train;
    for (const field of FIELDS.bedroom) {
      if (!field.rear) {
        const {
          shop
        } = getBedroomServiceLayout(field);
        buildFieldGramophone(field, shop.x + 10, shop.z + 1);
      }
      if (field.disabled) buildAirfieldWreck(field);
    }
    initializeCourierMission();
    ensureSectorVisuals();
    return;
  }
  const geo = new THREE.PlaneGeometry(4000, 4000, 200, 200);
  geo.rotateX(-Math.PI / 2);
  const p = geo.attributes.position;
  const cols = [];
  const heights = new Float32Array(p.count);
  const c = new THREE.Color();
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i);
    const z = p.getZ(i);
    const h = heightAt(x, z);
    heights[i] = h;
    p.setY(i, h);
    if (sel.map === 'trenches') {
      const v = 0.9 + Math.sin(x * 0.07 + z * 0.05) * 0.06 + Math.random() * 0.06;
      const ax2 = Math.abs(x);
      if (ax2 < 160) c.setRGB(0.36 * v, 0.33 * v, 0.29 * v);else if (ax2 < 420) c.setRGB(0.44 * v, 0.42 * v, 0.38 * v);else c.setRGB(0.46 * v, 0.48 * v, 0.37 * v);
    } else {
      c.setRGB(1, 1, 1);
    }
    cols.push(c.r, c.g, c.b);
  }
  geo.computeVertexNormals();
  if (sel.map === 'stranda') {
    const normals = geo.attributes.normal;
    const lowland = new THREE.Color(0x4d6945);
    const upland = new THREE.Color(0x77755d);
    const highRock = new THREE.Color(0x777a77);
    const alpine = new THREE.Color(0xb1b2ad);
    const exposedRock = new THREE.Color(0x85877e);
    cols.length = 0;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i);
      const z = p.getZ(i);
      const h = heights[i];
      if (h < 130) c.copy(lowland).lerp(upland, THREE.MathUtils.smoothstep(h, 15, 210));else if (h < 370) c.copy(upland).lerp(highRock, THREE.MathUtils.smoothstep(h, 120, 370));else c.copy(highRock).lerp(alpine, THREE.MathUtils.smoothstep(h, 360, 650));
      const cliff = THREE.MathUtils.clamp((0.9 - normals.getY(i)) / 0.55, 0, 0.78);
      c.lerp(exposedRock, cliff * THREE.MathUtils.smoothstep(h, 35, 230));
      const mottling = 0.94 + 0.065 * Math.sin(x * 0.016 + z * 0.019) * Math.cos(x * 0.011 - z * 0.017);
      c.multiplyScalar(mottling);
      cols.push(c.r, c.g, c.b);
    }
  }
  geo.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
  const terrainTexture = sel.map === 'stranda' ? fjordGroundTex : groundTex;
  world.add(new THREE.Mesh(geo, new THREE.MeshLambertMaterial({
    map: terrainTexture,
    vertexColors: true
  })));
  const sky = sel.map === 'trenches' ? 0xa8a898 : 0x9db8cc;
  daySkyColor.set(sky);
  scene.background = new THREE.Color(sky);
  setWorldFog(sky, 200, 1500);
  if (sel.map === 'stranda') {
    const water = new THREE.Mesh(new THREE.PlaneGeometry(4000, 4000), new THREE.MeshLambertMaterial({
      color: 0x142b43
    }));
    water.rotation.x = -Math.PI / 2;
    world.add(water);
    for (let i = 0; i < 40; i++) {
      const hx = -300 + Math.random() * 200;
      const hz = 150 + Math.random() * 60;
      const house = new THREE.Mesh(new THREE.BoxGeometry(6, 5, 8), new THREE.MeshLambertMaterial({
        color: [0xb03a2e, 0xf0eadc, 0xd8b048][i % 3]
      }));
      house.position.set(hx, heightAt(hx, hz) + 2.5, hz);
      world.add(house);
    }
  } else {
    for (let i = 0; i < 120; i++) {
      const z = -1500 + i * 25;
      const wire = new THREE.Mesh(new THREE.BoxGeometry(2, 1.2, 20), new THREE.MeshLambertMaterial({
        color: 0x3a3226
      }));
      wire.position.set(Math.sin(z * 0.05) * 25 + 16, heightAt(16, z) + 0.6, z);
      world.add(wire);
    }
  }
  if (sel.map === 'trenches') {
    buildTrenches();
    for (const z of [-650, 0, 650]) {
      addFlak(-168, z, 'blue', {
        playerOnly: true
      });
      addFlak(168, z, 'red', {
        playerOnly: true
      });
    }
    buildWesternFrontEnvironment();
    buildTrenchesSupplyRoads();
    buildRuinedFactories();
    buildThirdCity();
    buildProtectedGroundSites();
  }
  buildBurnedTrees();
  for (const f of FIELDS[sel.map]) {
    const point = (x, z) => fieldLocalPoint(f, x, z);
    const shopPoint = point(22, 78);
    const debriefPoint = point(36, 58);
    const sy = heightAt(shopPoint.x, shopPoint.z);
    const dy = heightAt(debriefPoint.x, debriefPoint.z);
    buildFieldBuildings(shopPoint.x, shopPoint.z, sy, debriefPoint.x, debriefPoint.z, dy, fieldRunwayHeading(f));
    const gramophonePoint = point(31, 79);
    buildFieldGramophone(f, gramophonePoint.x, gramophonePoint.z);
    debriefSites.push({
      x: debriefPoint.x,
      z: debriefPoint.z,
      name: f.name,
      team: f.team
    });
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 14, 6), new THREE.MeshLambertMaterial({
      color: 0x5a4a30
    }));
    const polePoint = point(25.5, 76);
    pole.position.set(polePoint.x, sy + 7, polePoint.z);
    // Fixed world dimensions keep the base flag consistent; wind only bends its cloth.
    const flag = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 2, 12, 6), new THREE.MeshBasicMaterial({
      map: factionFlagTexture(f.team),
      side: THREE.DoubleSide
    }));
    const flagPoint = point(27, 76);
    flag.position.set(flagPoint.x, sy + 13, flagPoint.z);
    flag.rotation.y = fieldRunwayHeading(f);
    flag.userData.windPhase = Math.random() * Math.PI * 2;
    fieldFlags.push(flag);
    const arrowM = new THREE.Mesh(new THREE.ConeGeometry(1.2, 2.2, 4), new THREE.MeshBasicMaterial({
      color: 0xffd21a
    }));
    arrowM.rotation.x = Math.PI;
    const arrowPoint = point(22, 75.4);
    arrowM.position.set(arrowPoint.x, sy + 9.5, arrowPoint.z);
    arrowM.userData.y = sy + 9.5;
    shopArrows.push(arrowM);
    world.add(pole, flag, arrowM);
    const runwayLanes = runwayLaneOffsets();
    for (const laneOffset of runwayLanes) {
      addRunwaySurface(f, 30, 164, 0.04, runwayShoulderMat, 8, 48, laneOffset);
      addRunwaySurface(f, 20, 146, 0.12, runwayMat, 8, 48, laneOffset);
      // Worn gravel and wheel ruts sit inside each lane without obstructing its twin.
      for (let i = 0; i < 21; i++) {
        const pebblePoint = point(laneOffset + (Math.random() - 0.5) * 16, (Math.random() - 0.5) * 136);
        const pebble = new THREE.Mesh(new THREE.SphereGeometry(0.12 + Math.random() * 0.22, 5, 4), new THREE.MeshLambertMaterial({
          color: [0x8d8069, 0x4d4437, 0x9b8c70][i % 3]
        }));
        pebble.scale.y = 0.24;
        pebble.position.set(pebblePoint.x, heightAt(pebblePoint.x, pebblePoint.z) + 0.18, pebblePoint.z);
        world.add(pebble);
      }
    }
    // Row of canvas hangars and barracks rotates with the runway's water-facing heading.
    const heading = fieldRunwayHeading(f);
    const hMat = fieldBuildingMaterials.canvas;
    const endMat = fieldBuildingMaterials.timber;
    for (let i = 0; i < 4; i++) {
      const localZ = -110 + i * 22;
      const hangarPoint = point(40, localZ);
      const doorPoint = point(29.95, localZ);
      const hy = heightAt(hangarPoint.x, hangarPoint.z);
      const hangar = new THREE.Mesh(new THREE.CylinderGeometry(8, 8, 20, 14, 1, false, 0, Math.PI), hMat);
      hangar.rotation.set(0, heading, Math.PI / 2);
      hangar.position.set(hangarPoint.x, hy, hangarPoint.z);
      const door = new THREE.Mesh(new THREE.CircleGeometry(7.6, 14, 0, Math.PI), endMat);
      door.rotation.y = heading - Math.PI / 2;
      door.position.set(doorPoint.x, hy, doorPoint.z);
      world.add(hangar, door);
    }
    for (let i = 0; i < 4; i++) {
      const hutPoint = point(-34, -100 + i * 20);
      const by = heightAt(hutPoint.x, hutPoint.z);
      const hut = new THREE.Mesh(new THREE.BoxGeometry(10, 3.5, 14), fieldBuildingMaterials.plaster);
      hut.position.set(hutPoint.x, by + 1.75, hutPoint.z);
      hut.rotation.y = heading;
      const r = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 7.4, 2.4, 4, 1), fieldBuildingMaterials.roof);
      r.rotation.y = heading + Math.PI / 4;
      r.scale.set(1, 1, 1.4);
      r.position.set(hutPoint.x, by + 4.7, hutPoint.z);
      world.add(hut, r);
    }
    for (const [ox, oz] of [[-62, 10], [62, 30], [0, -135], [-58, 110]]) {
      const gunPoint = point(ox, oz);
      addFlak(gunPoint.x, gunPoint.z, f.team);
    }
    if (f.disabled) buildAirfieldWreck(f);
  }
  if (sel.map === 'stranda') {
    buildBattleshipWreck();
    buildShip('blue', -200, -42);
    buildShip('red', 200, 42);
    for (let i = 0; i < 3; i++) {
      buildConvoyVessel('blue', -245 - i * 42, -76);
      buildConvoyVessel('red', 245 - i * 42, 76);
    }
  }
  if (sel.map === 'trenches') buildGroundVehicles();
  initializeCourierMission();
  ensureSectorVisuals();
}

// ---------- Anti-aircraft guns, warships & supply convoys ----------
let flakGuns = [];
let ships = [];
let convoyVessels = [];
const flakTarget = (pos, team, range, prioritizeBombers = false) => {
  let best = null;
  let bomber = null;
  let bd = range;
  let bomberD = range;
  for (const p of planes) {
    if (p.dying || p.isRemote || team && p.team === team || !p.g.visible) continue;
    const gp = p.g.position;
    if (gp.y - heightAt(gp.x, gp.z) < 25) continue;
    const d = gp.distanceTo(pos);
    if (d < bd) {
      bd = d;
      best = p;
    }
    if (p.bomber && d < bomberD) {
      bomberD = d;
      bomber = p;
    }
  }
  return prioritizeBombers && bomber ? bomber : best;
};
function addFlak(x, z, team, options = {}) {
  const y = heightAt(x, z);
  const g = new THREE.Group();
  g.position.set(x, y, z);
  const green = new THREE.MeshLambertMaterial({
    color: 0x3e4a30
  });
  const bags = new THREE.Mesh(new THREE.TorusGeometry(3, 0.6, 6, 14), new THREE.MeshLambertMaterial({
    color: 0x8a7a58
  }));
  bags.rotation.x = Math.PI / 2;
  bags.position.y = 0.5;
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 1.1, 1.4, 10), green);
  base.position.y = 0.7;
  const pivot = new THREE.Group();
  pivot.position.y = 1.6;
  const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.2, 4.2, 8), green);
  barrel.rotation.x = Math.PI / 2;
  barrel.position.z = 1.6;
  const breech = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 1.2), green);
  pivot.add(barrel, breech);
  g.add(bags, base, pivot);
  world.add(g);
  flakGuns.push({
    g,
    pivot,
    team,
    id: flakGuns.length + 1,
    cd: Math.random() * 3,
    muzzleLen: 3.7,
    playerOnly: !!options.playerOnly
  });
}
function buildShip(team, startX, routeZ) {
  const g = new THREE.Group();
  const grey = new THREE.MeshLambertMaterial({
    color: 0x6c7378
  });
  const dark = new THREE.MeshLambertMaterial({
    color: 0x3a3e42
  });
  const deck = new THREE.MeshLambertMaterial({
    color: 0x8a7a5e
  });
  const factionStripe = new THREE.MeshLambertMaterial({
    color: team === 'blue' ? 0x315b86 : 0x96372d
  });
  const B = (w, h, d, m, x, y, z) => {
    const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
    b.position.set(x, y, z);
    g.add(b);
    return b;
  };
  // A riveted, tapered steel hull with a clear colored waterline.
  const hg = new THREE.BoxGeometry(8, 4, 50, 1, 1, 6);
  const hp = hg.attributes.position;
  for (let i = 0; i < hp.count; i++) {
    const zz = hp.getZ(i);
    if (zz < -15) hp.setX(i, hp.getX(i) * Math.max(0.05, 1 - (-15 - zz) / 10));
    if (hp.getY(i) < 0) hp.setX(i, hp.getX(i) * 0.75);
  }
  hg.computeVertexNormals();
  const hull = new THREE.Mesh(hg, dark);
  hull.position.y = 0.5;
  g.add(hull);
  B(7, 0.3, 40, deck, 0, 2.6, 3);
  B(7.2, 0.38, 38, factionStripe, 0, 2.39, 3);
  B(5, 3, 8, grey, 0, 4, -4);
  B(3.5, 2, 4, grey, 0, 6.5, -5);
  for (const side of [-1, 1]) {
    for (let i = 0; i < 14; i++) {
      const rivet = new THREE.Mesh(new THREE.SphereGeometry(0.11, 6, 5), new THREE.MeshLambertMaterial({
        color: 0xaaa28f
      }));
      rivet.position.set(side * 4.02, 0.2 + i % 2 * 0.65, -17 + i * 2.6);
      g.add(rivet);
    }
  }
  for (const fz of [2, 7]) {
    const funnel = new THREE.Mesh(new THREE.CylinderGeometry(1, 1.1, 6, 10), grey);
    funnel.position.set(0, 6, fz);
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(1.02, 1.02, 0.6, 10), new THREE.MeshLambertMaterial({
      color: 0x111111
    }));
    cap.position.set(0, 8.8, fz);
    g.add(funnel, cap);
  }
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.14, 4.6, 6), dark);
  mast.position.set(0, 4.9, 13);
  const ensign = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 0.95, 10, 6), new THREE.MeshBasicMaterial({
    map: factionFlagTexture(team),
    side: THREE.DoubleSide
  }));
  ensign.position.set(0.95, 6.6, 13);
  ensign.rotation.y = Math.PI / 2;
  ensign.userData.windPhase = Math.random() * Math.PI * 2;
  shipFlags.push(ensign);
  g.add(mast, ensign);
  const guns = [];
  for (const tz of [-14, 18]) {
    B(3.4, 1.6, 4, grey, 0, 3.6, tz);
    const pivot = new THREE.Group();
    pivot.position.set(0, 4.2, tz);
    for (const bx of [-0.6, 0.6]) {
      const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 5, 8), dark);
      barrel.rotation.x = Math.PI / 2;
      barrel.position.set(bx, 0, 2.5);
      pivot.add(barrel);
    }
    g.add(pivot);
    guns.push({
      pivot,
      cd: Math.random() * 2,
      muzzleLen: 5
    });
  }
  world.add(g);
  const shipState = {
    g,
    guns,
    team,
    routeZ,
    startX,
    x: startX,
    dir: team === 'blue' ? 1 : -1,
    hits: 0,
    maxHits: 30,
    sunk: 0,
    puff: 0
  };
  ships.push(shipState);
  return shipState;
}
function buildBattleshipWreck() {
  const g = new THREE.Group();
  const hullMaterial = new THREE.MeshLambertMaterial({
    color: 0x383c3d
  });
  const deckMaterial = new THREE.MeshLambertMaterial({
    color: 0x625b4e
  });
  const soot = new THREE.MeshLambertMaterial({
    color: 0x211f1d
  });
  const rust = new THREE.MeshLambertMaterial({
    color: 0x594638
  });
  const hullGeo = new THREE.BoxGeometry(12, 4.8, 78, 1, 1, 8);
  const hullPositions = hullGeo.attributes.position;
  for (let i = 0; i < hullPositions.count; i++) {
    const z = hullPositions.getZ(i);
    const taper = Math.max(0.12, 1 - Math.max(0, Math.abs(z) - 23) * 0.055);
    hullPositions.setX(i, hullPositions.getX(i) * taper * (hullPositions.getY(i) < 0 ? 0.76 : 1));
    if (z > 7 && Math.abs(hullPositions.getY(i)) < 2.2) hullPositions.setY(i, hullPositions.getY(i) - 0.65);
  }
  hullGeo.computeVertexNormals();
  const hull = new THREE.Mesh(hullGeo, hullMaterial);
  hull.position.y = 0.7;
  g.add(hull);
  const deck = new THREE.Mesh(new THREE.BoxGeometry(9.2, 0.48, 65), deckMaterial);
  deck.position.set(0, 3.05, -2);
  g.add(deck);
  const add = (geometry, material, x, y, z, rx = 0, ry = 0, rz = 0) => {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    mesh.rotation.set(rx, ry, rz);
    g.add(mesh);
    return mesh;
  };
  add(new THREE.BoxGeometry(6.4, 5.5, 10), hullMaterial, 0, 5.6, -12, 0.06, 0, -0.13);
  add(new THREE.BoxGeometry(4.2, 3.2, 7), deckMaterial, 0.5, 9.1, -12, 0.1, 0, -0.16);
  add(new THREE.BoxGeometry(5, 2.2, 8), rust, -0.8, 4.5, 18, 0, 0, 0.38);
  add(new THREE.CylinderGeometry(1.1, 1.55, 9, 10), hullMaterial, -1.4, 7.4, 0, 0.16, 0, -0.15);
  add(new THREE.CylinderGeometry(0.95, 1.35, 7, 10), soot, 1.5, 6.6, 8, -0.12, 0, 0.1);
  const snappedMast = add(new THREE.CylinderGeometry(0.18, 0.3, 17, 7), rust, 1.6, 7.7, -20, 0, 0, 0.72);
  snappedMast.rotation.x = 0.5;
  for (const side of [-1, 1]) {
    for (let i = 0; i < 6; i++) {
      add(new THREE.BoxGeometry(0.42, 0.45, 0.8), rust, side * 6.05, 0.8 + i % 2 * 0.55, -22 + i * 7);
    }
  }
  const wreckFlagPole = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.1, 3.2, 6), rust);
  wreckFlagPole.position.set(1.2, 4.9, 17);
  const wreckFlag = new THREE.Mesh(new THREE.PlaneGeometry(1.55, 0.8), new THREE.MeshBasicMaterial({
    map: factionFlagTexture('red'),
    side: THREE.DoubleSide
  }));
  wreckFlag.position.set(1.98, 5.9, 17);
  wreckFlag.rotation.y = Math.PI / 2;
  g.add(wreckFlagPole, wreckFlag);
  g.position.set(-35, 0, 78);
  g.rotation.set(0.08, Math.PI / 2, 0.16);
  world.add(g);
}
function buildConvoyVessel(team, startX, routeZ) {
  const g = new THREE.Group();
  const hullMat = new THREE.MeshLambertMaterial({
    color: 0x414b4a
  });
  const deckMat = new THREE.MeshLambertMaterial({
    color: 0x81735a
  });
  const cabinMat = new THREE.MeshLambertMaterial({
    color: 0x777466
  });
  const cargoMats = [0x71563a, 0x8a6843, 0x62543e].map(color => new THREE.MeshLambertMaterial({
    color
  }));
  const trim = new THREE.MeshLambertMaterial({
    color: team === 'blue' ? 0x315b86 : 0x96372d
  });
  const hullGeo = new THREE.BoxGeometry(6.8, 2.9, 33, 1, 1, 5);
  const p = hullGeo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const z = p.getZ(i);
    const taper = Math.max(0.08, 1 - Math.max(0, -z - 8) * 0.09);
    p.setX(i, p.getX(i) * taper * (p.getY(i) < 0 ? 0.72 : 1));
  }
  hullGeo.computeVertexNormals();
  const hull = new THREE.Mesh(hullGeo, hullMat);
  hull.position.y = 1.1;
  const stripe = new THREE.Mesh(new THREE.BoxGeometry(6.95, 0.32, 27), trim);
  stripe.position.set(0, 0.74, 2);
  const deck = new THREE.Mesh(new THREE.BoxGeometry(6.2, 0.3, 28), deckMat);
  deck.position.set(0, 2.35, 1);
  const cabin = new THREE.Mesh(new THREE.BoxGeometry(4.5, 4.5, 7), cabinMat);
  cabin.position.set(0, 4.65, -8);
  g.add(hull, stripe, deck, cabin);
  for (let i = 0; i < 3; i++) {
    const crate = new THREE.Mesh(new THREE.BoxGeometry(4.6, 4.4, 5.2), cargoMats[i]);
    crate.position.set(0, 4.65, -1 + i * 7);
    g.add(crate);
    const band = new THREE.Mesh(new THREE.BoxGeometry(4.72, 0.18, 0.18), trim);
    band.position.set(0, 4.55, -1 + i * 7 - 2.7);
    g.add(band);
  }
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 4.2, 6), deckMat);
  mast.position.set(0, 4.45, 13);
  const flag = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.78, 9, 5), new THREE.MeshBasicMaterial({
    map: factionFlagTexture(team),
    side: THREE.DoubleSide
  }));
  flag.position.set(0.78, 5.95, 13);
  flag.rotation.y = Math.PI / 2;
  flag.userData.windPhase = Math.random() * Math.PI * 2;
  shipFlags.push(flag);
  g.add(mast, flag);
  g.position.set(startX, 0, routeZ);
  g.rotation.y = team === 'blue' ? -Math.PI / 2 : Math.PI / 2;
  world.add(g);
  const vessel = {
    g,
    team,
    routeZ,
    startX,
    x: startX,
    dir: team === 'blue' ? 1 : -1,
    hits: 0,
    maxHits: 16,
    sunk: 0,
    isConvoy: true
  };
  convoyVessels.push(vessel);
  return vessel;
}
function flakShot(gun, origin, target, canHurt) {
  gun.pivot.lookAt(target.g.position);
  const dir = target.g.position.clone().sub(origin).normalize();
  const muzzle = origin.clone().addScaledVector(dir, gun.muzzleLen);
  smoke(muzzle, 0.22, 0.35, 0xb8bab5, 0, 0.05);
  smoke(muzzle, 0.12, 0.08, 0xffc060, 0, 0);
  const travel = origin.distanceTo(target.g.position) / 300;
  const leadOffset = new THREE.Vector3(0, 0, -(target.speed || 0) * travel);
  if (target.g.quaternion) leadOffset.applyQuaternion(target.g.quaternion);
  const lead = target.g.position.clone().add(leadOffset);
  const miss = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).multiplyScalar(target.bomber ? 34 : 60);
  const at = lead.add(miss);
  const delay = Math.min(1500, travel * 1000);
  later(() => {
    smoke(at, 0.32, 0.65, 0x53565a, 0, 0.12);
    smoke(at, 0.16, 0.08, 0xffa040, 0, 0);
    const hitChance = target.bomber ? 0.16 : 0.055;
    if (canHurt && planes.includes(target) && !target.dying && target.g.position.distanceTo(at) < (target.bomber ? 22 : 14) && Math.random() < hitChance) {
      damage(target, new THREE.Vector3(), null);
      if (target.bomber && !target.dying && Math.random() < 0.55) damage(target, new THREE.Vector3(), null);
      if (target === player) flashHit();
    }
  }, delay);
}
function updateNavalSinking(target, dt) {
  target.sunk = Math.max(0, target.sunk - dt);
  target.sinkElapsed = (target.sinkElapsed || 0) + dt;
  const duration = target.sinkDuration || (target.isConvoy ? 35 : 45);
  const progress = THREE.MathUtils.clamp(target.sinkElapsed / duration, 0, 1);
  const eased = THREE.MathUtils.smoothstep(progress, 0, 1);
  const depth = target.isConvoy ? 8 : 12;
  const maxTilt = target.isConvoy ? 0.48 : 0.62;
  target.g.position.y = (target.sinkBaseY || 0) - depth * eased;
  target.g.rotation.z = (target.sinkRollDirection || 1) * ((target.sinkInitialTilt || 0.12) + maxTilt * eased);
  target.g.rotation.x = -0.1 * eased;
  target.sinkExplosionTimer -= dt;
  if (target.sinkExplosionTimer <= 0 && progress < 0.94) {
    target.g.updateMatrixWorld(true);
    const local = new THREE.Vector3((Math.random() - 0.5) * (target.isConvoy ? 4 : 7), 1 + Math.random() * 2.5, (Math.random() - 0.5) * (target.isConvoy ? 20 : 42));
    const explosion = target.g.localToWorld(local);
    boom(explosion);
    smoke(explosion, 0.7 + Math.random() * 0.45, 3.2 + Math.random() * 2, 0x252320, (Math.random() - 0.5) * 0.12, 0.7, 0, 0.82, 1.6);
    target.sinkExplosionTimer = 3.4 + Math.random() * 3.6;
  }
  return target.sunk > 0;
}
function updateFlak(dt) {
  for (const f of flakGuns) {
    f.cd -= dt;
    if (f.cd > 0) continue;
    const base = f.g.position.clone().add(new THREE.Vector3(0, 1.6, 0));
    if (f.playerOnly) {
      // Trench crews throw intermittent bursts skyward for atmosphere; only a manned gun can score hits.
      f.cd = 2.1 + Math.random() * 2.7;
      const target = {
        g: {
          position: base.clone().add(new THREE.Vector3((Math.random() - 0.5) * 70, 130 + Math.random() * 100, (Math.random() - 0.5) * 70))
        },
        speed: 0,
        bomber: false
      };
      flakShot(f, base, target, false);
      continue;
    }
    // AI flak is deliberately intermittent: threatening at altitude without dominating foot or flight play.
    f.cd = 1.1 + Math.random() * 1.5;
    const t = flakTarget(base, f.team, 650, true);
    if (t) flakShot(f, base, t, true);
  }
  const zAt = x => -Math.sin(x * 0.004) * 60;
  for (const s of ships) {
    if (s.sunk > 0) {
      if (!updateNavalSinking(s, dt)) {
        s.hits = 0;
        s.lastNotifiedProgress = 0;
        s.x = s.startX;
        s.dir = s.team === 'blue' ? 1 : -1;
        s.g.rotation.set(0, 0, 0);
        s.g.position.set(s.startX, 0, s.routeZ);
        say(`${s.team === 'blue' ? 'Allied' : 'Central'} warship returns to the fjord`);
      }
      continue;
    }
    s.x += s.dir * 4 * dt;
    if (Math.abs(s.x) > 350) s.dir = -Math.sign(s.x);
    const nz = zAt(s.x) + s.routeZ;
    s.g.position.set(s.x, Math.sin(performance.now() * 0.0014 + s.startX) * 0.18, nz);
    const dz = zAt(s.x + s.dir) - zAt(s.x);
    s.g.rotation.y = Math.atan2(-s.dir, -dz);
    s.g.updateMatrixWorld(true);
    for (const gun of s.guns) {
      gun.cd -= dt;
      if (gun.cd > 0) continue;
      gun.cd = 1.2 + Math.random() * 1.6;
      const o = new THREE.Vector3();
      gun.pivot.getWorldPosition(o);
      const t = flakTarget(o, s.team, 700);
      if (t) {
        flakShot(gun, o, t, false);
        gun.pivot.lookAt(t.g.position);
      }
    }
  }
  for (const vessel of convoyVessels) {
    if (vessel.sunk > 0) {
      if (!updateNavalSinking(vessel, dt)) {
        vessel.hits = 0;
        vessel.lastNotifiedProgress = 0;
        vessel.x = vessel.startX;
        vessel.dir = vessel.team === 'blue' ? 1 : -1;
        vessel.g.rotation.set(0, 0, 0);
        vessel.g.position.set(vessel.startX, 0, vessel.routeZ);
      }
      continue;
    }
    vessel.x += vessel.dir * 3.1 * dt;
    if (Math.abs(vessel.x) > 315) vessel.dir = -Math.sign(vessel.x);
    const z = zAt(vessel.x) + vessel.routeZ;
    vessel.g.position.set(vessel.x, Math.sin(performance.now() * 0.0012 + vessel.startX) * 0.12, z);
    vessel.g.rotation.y = vessel.dir > 0 ? -Math.PI / 2 : Math.PI / 2;
    vessel.g.updateMatrixWorld(true);
  }
}
function damageNavalTarget(target, owner, amount, impactKind = 'bullet') {
  if (!target || target.sunk > 0 || !owner?.team || owner.team === target.team) return false;
  target.hits = Math.min(target.maxHits, target.hits + amount);
  const impact = target.g.position.clone().add(new THREE.Vector3(0, target.isConvoy ? 4 : 5, 0));
  if (impactKind === 'bomb') boom(impact);else smoke(impact, 0.2, 0.45, 0xffc06a, 0, 0.08, 0, 0.75);
  if (target.hits >= target.maxHits) {
    target.sunk = target.isConvoy ? 35 : 45;
    target.sinkDuration = target.sunk;
    target.sinkElapsed = 0;
    target.sinkBaseY = target.g.position.y;
    target.sinkInitialTilt = target.isConvoy ? 0.12 : 0.18;
    target.sinkRollDirection = Math.random() < 0.5 ? -1 : 1;
    target.sinkExplosionTimer = 1.1 + Math.random() * 1.2;
    target.g.rotation.z = target.sinkRollDirection * target.sinkInitialTilt;
    boom(impact);
    const faction = target.team === 'blue' ? 'Allied' : 'Central';
    if (target.isConvoy) {
      feed(`${faction} supply vessel sunk`);
      if (owner === player) {
        recordCareerCounter('convoyKills');
        cashAdd(90, 'Enemy convoy vessel sunk');
      }
    } else {
      say(`${faction} warship sunk!`);
      if (owner === player) {
        cashAdd(150, 'Enemy warship sunk');
        recordCareerKill('ship');
      }
    }
    return true;
  }
  if (owner === player) {
    const steps = target.isConvoy ? 2 : 3;
    const progress = Math.min(steps - 1, Math.ceil(target.hits / target.maxHits * steps));
    if (progress > (target.lastNotifiedProgress || 0)) {
      target.lastNotifiedProgress = progress;
      say(target.isConvoy ? `Supply vessel hit · ${progress}/${steps}` : `Direct hit on enemy warship! (${progress}/${steps})`);
    }
  }
  return false;
}
function bombShip(pos, owner) {
  if (!owner?.team) return;
  for (const target of ships) {
    if (target.sunk > 0 || target.team === owner.team || target.g.position.distanceTo(pos) > 28) continue;
    damageNavalTarget(target, owner, target.maxHits / 3, 'bomb');
    return;
  }
  for (const target of convoyVessels) {
    if (target.sunk > 0 || target.team === owner.team || target.g.position.distanceTo(pos) > 20) continue;
    damageNavalTarget(target, owner, target.maxHits / 2, 'bomb');
    return;
  }
}
function bombTrain(pos, owner) {
  if (!frontTrain || frontTrain.destroyed || !owner?.team || owner.team === frontTrain.team) return;
  for (const car of frontTrain.parts) {
    if (car.position.distanceTo(pos) < 22) {
      damageFrontTrain(owner, 3, car.position.clone().add(new THREE.Vector3(0, 2, 0)));
      return;
    }
  }
}

// ---------- Bomber dressing (multi-engine giants) ----------
const BOMBER_SEATS = {
  pilot: {
    position: new THREE.Vector3(0, 0.28, 0.12),
    rotation: 0
  },
  bomb: {
    position: new THREE.Vector3(0, -0.5, 0.78),
    rotation: Math.PI
  },
  gun: {
    position: new THREE.Vector3(0, 0.24, -1.88),
    rotation: 0
  }
};
function syncBomberCrew(p) {
  if (!p?.bomberCrew) return;
  if (p.cockpitHead) p.cockpitHead.visible = !p.isPlayer || role === 'pilot';
  for (const crew of p.bomberCrew) {
    const seat = p.twoSeater ? TWOSEAT_SEATS[crew.role] : BOMBER_SEATS[crew.role];
    crew.targetPosition.copy(seat.position);
    crew.targetRotation = seat.rotation;
    crew.g.visible = !p.isPlayer || crew.role !== role;
  }
}
function updateBomberCrew(p, dt) {
  if (!p?.bomberCrew) return;
  syncBomberCrew(p);
  const t = performance.now() * 0.001;
  for (const crew of p.bomberCrew) {
    crew.g.position.lerp(crew.targetPosition, Math.min(1, dt * 5));
    const angle = THREE.MathUtils.euclideanModulo(crew.targetRotation - crew.g.rotation.y + Math.PI, Math.PI * 2) - Math.PI;
    crew.g.rotation.y += angle * Math.min(1, dt * 5);
    crew.person.headPivot.rotation.y = Math.sin(t * 0.65 + crew.phase) * 0.08;
  }
}
function addBomberCrew(p) {
  p.bomberCrew = [];
  for (const crewRole of ['bomb', 'gun']) {
    const person = makeStylizedSoldier(p.team, false);
    person.g.scale.setScalar(0.36);
    for (const [index, arm] of person.armPivots.entries()) {
      arm.rotation.x = 0.82;
      arm.rotation.z = index === 0 ? -0.12 : 0.12;
    }
    for (const leg of person.legPivots) leg.rotation.x = -0.85;
    const crew = {
      g: person.g,
      person,
      role: crewRole,
      targetPosition: BOMBER_SEATS[crewRole].position.clone(),
      targetRotation: BOMBER_SEATS[crewRole].rotation,
      phase: Math.random() * Math.PI * 2
    };
    person.g.position.copy(crew.targetPosition);
    person.g.rotation.y = crew.targetRotation;
    p.g.add(person.g);
    p.bomberCrew.push(crew);
  }
  syncBomberCrew(p);
}
function registerWingAttachments(p) {
  if (!p?.wing || !p.wingPanels) return;
  for (const part of p.wing.children) {
    const sideKey = part.position.x < 0 ? 'left' : 'right';
    part.userData.breakLayer ||= part.position.y > 0.8 ? 'upper' : part.position.y < -0.1 ? 'lower' : 'middle';
    const panels = p.wingPanels[sideKey];
    if (!panels.includes(part)) panels.push(part);
  }
}
function bomberize(p) {
  const tan = new THREE.MeshStandardMaterial({
    color: p.team === 'blue' ? 0x7a6a3c : 0x6a6e5a,
    roughness: 0.8
  });
  const metal = new THREE.MeshStandardMaterial({
    color: 0xbfc3c7,
    metalness: 0.6,
    roughness: 0.4
  });
  const wood = new THREE.MeshStandardMaterial({
    color: 0x8a5a2b,
    roughness: 0.8
  });
  p.props = [];
  // extended outer wing panels
  for (const s of [-1, 1]) {
    for (const [y, z, d] of [[1.35, -1.3, 1.45], [-0.45, -0.9, 1.35]]) {
      const w = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.1, d), tan);
      w.position.set(s * 6.4, y, z);
      w.userData.breakLayer = y > 0.8 ? 'upper' : 'lower';
      p.wing.add(w);
      p.wingPanels[s < 0 ? 'left' : 'right'].push(w);
    }
    for (const x of [5.5, 8.2]) {
      const st = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.8, 6), wood);
      st.position.set(s * x, 0.45, -1.1);
      p.wing.add(st);
    }
    // engine nacelle between the wings with its own propeller
    const nac = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.3, 2.2, 12), tan);
    nac.rotation.x = Math.PI / 2;
    nac.position.set(s * 2.4, 0.45, -1.2);
    const cowl = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.4, 12), metal);
    cowl.rotation.x = Math.PI / 2;
    cowl.position.set(s * 2.4, 0.45, -2.3);
    const prop = new THREE.Group();
    prop.position.set(s * 2.4, 0.45, -2.6);
    for (const k of [1, -1]) {
      const b = new THREE.Mesh(new THREE.BoxGeometry(0.16, 1.1, 0.04), wood);
      b.position.y = k * 0.55;
      prop.add(b);
    }
    p.wing.add(nac, cowl, prop);
    p.props.push(prop);
    // twin rudders
    const fin = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.1, 0.7), tan);
    fin.position.set(s * 1.1, 0.6, 3.3);
    p.tail.add(fin);
  }
  // nose gunner ring
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.06, 6, 14), metal);
  ring.rotation.x = Math.PI / 2;
  ring.position.set(0, 0.6, -1.9);
  p.body.add(ring);
  registerWingAttachments(p);
  if (p.isPlayer) addBomberCrew(p);
}
const TWOSEAT_SEATS = {
  pilot: {
    position: new THREE.Vector3(0, 0.3, 0.12),
    rotation: 0
  },
  gun: {
    position: new THREE.Vector3(0, 0.27, 1.42),
    rotation: Math.PI
  }
};
function addTwoSeaterCrew(p) {
  p.bomberCrew = [];
  for (const crewRole of ['pilot', 'gun']) {
    const appearance = makeBotPilotAppearance();
    const person = makeStylizedSoldier(p.team, false, appearance);
    person.g.scale.setScalar(0.34);
    for (const [index, arm] of person.armPivots.entries()) {
      arm.rotation.x = 0.82;
      arm.rotation.z = index === 0 ? -0.12 : 0.12;
    }
    for (const leg of person.legPivots) leg.rotation.x = -0.85;
    const seat = TWOSEAT_SEATS[crewRole];
    const crew = {
      g: person.g,
      person,
      role: crewRole,
      appearance,
      targetPosition: seat.position.clone(),
      targetRotation: seat.rotation,
      phase: Math.random() * Math.PI * 2
    };
    person.g.position.copy(crew.targetPosition);
    person.g.rotation.y = crew.targetRotation;
    p.g.add(person.g);
    p.bomberCrew.push(crew);
  }
  syncBomberCrew(p);
}
function twoSeatize(p) {
  p.twoSeater = true;
  p.bombs = 2;
  p.bombCapacity = 2;
  const darkMetal = new THREE.MeshStandardMaterial({
    color: 0x373733,
    metalness: 0.46,
    roughness: 0.7
  });
  const bronze = new THREE.MeshStandardMaterial({
    color: 0x93744b,
    metalness: 0.38,
    roughness: 0.66
  });
  const canvas = new THREE.MeshStandardMaterial({
    color: p.team === 'blue' ? 0x887c59 : 0x786852,
    roughness: 0.88
  });
  const add = (geometry, material, x, y, z, parent = p.g) => {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    parent.add(mesh);
    return mesh;
  };
  // A second open cockpit, raised rear observer's ring, swivel mount and Lewis gun.
  const rearOpening = add(new THREE.TorusGeometry(0.36, 0.065, 8, 20), bronze, 0, 0.46, 1.37);
  rearOpening.rotation.x = Math.PI / 2;
  p.rearOpening = rearOpening;
  add(new THREE.BoxGeometry(0.58, 0.16, 0.68), darkMetal, 0, 0.48, 1.36);
  add(new THREE.BoxGeometry(0.72, 0.14, 0.2), canvas, 0, 0.9, 1.18);
  const gunMount = new THREE.Group();
  gunMount.position.set(0, 0.82, 1.48);
  p.g.add(gunMount);
  const gunRing = add(new THREE.TorusGeometry(0.52, 0.055, 7, 20), bronze, 0, 0.13, 0, gunMount);
  gunRing.rotation.x = Math.PI / 2;
  p.rearGunRing = gunRing;
  const gun = add(new THREE.CylinderGeometry(0.08, 0.11, 1.7, 9), darkMetal, 0, 0.27, -0.16, gunMount);
  gun.rotation.x = Math.PI / 2;
  add(new THREE.CylinderGeometry(0.14, 0.16, 0.22, 9), bronze, 0, 0.27, -0.62, gunMount).rotation.x = Math.PI / 2;
  for (const side of [-1, 1]) {
    const strut = add(new THREE.CylinderGeometry(0.035, 0.045, 1.2, 6), bronze, side * 0.32, 0.12, 1.24);
    strut.rotation.z = side * -0.35;
  }
  p.rearGunMount = gunMount;
  // Twin 25 kg bombs, with individual suspension cradles and streamlined bodies.
  p.twoSeatBombMeshes = [];
  for (const side of [-1, 1]) {
    const rack = add(new THREE.BoxGeometry(0.12, 0.3, 0.66), darkMetal, side * 1.18, -0.9, 0.15);
    const bomb = new THREE.Group();
    bomb.position.set(side * 1.18, -1.16, 0.15);
    const casing = new THREE.Mesh(new THREE.CapsuleGeometry(0.19, 0.58, 4, 8), darkMetal);
    casing.rotation.x = Math.PI / 2;
    bomb.add(casing);
    for (const finSide of [-1, 1]) {
      const fin = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.42, 0.22), bronze);
      fin.position.set(finSide * 0.16, 0, 0.34);
      bomb.add(fin);
    }
    p.g.add(bomb);
    p.twoSeatBombMeshes.push({
      rack,
      bomb
    });
  }
  addTwoSeaterCrew(p);
  return p;
}

// ---------- Plane model ----------
function makePlane(team, paint, tri, detailedPlayer = false) {
  const g = new THREE.Group();
  const blue = team === 'blue';
  const L = (c, off) => new THREE.MeshStandardMaterial({
    color: c,
    roughness: 0.8,
    polygonOffset: !!off,
    polygonOffsetFactor: -2,
    polygonOffsetUnits: -2
  });
  const mat = L(paint || (blue ? 0x5b5434 : 0x9c2a1f));
  const under = L(blue ? 0xcfc59c : 0x8a96a0);
  const wood = L(0x8a5a2b);
  const dark = L(0x262626);
  const metal = new THREE.MeshStandardMaterial({
    color: 0xbfc3c7,
    metalness: 0.7,
    roughness: 0.35
  });
  const add = (geo, m, x, y, z, parent, rx = 0, ry = 0, rz = 0) => {
    const mesh = new THREE.Mesh(geo, m);
    mesh.position.set(x, y, z);
    mesh.rotation.set(rx, ry, rz);
    parent.add(mesh);
    return mesh;
  };
  const box = (w, h, d, m, x, y, z, parent) => add(new THREE.BoxGeometry(w, h, d), m, x, y, z, parent);
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  const strut = (a, b, m, parent, r = 0.05) => {
    const s = add(new THREE.CylinderGeometry(r, r, a.distanceTo(b), 6), m, 0, 0, 0, parent);
    s.position.copy(a).lerp(b, 0.5);
    s.quaternion.setFromUnitVectors(V(0, 1, 0), b.clone().sub(a).normalize());
    return s;
  };
  const mark = (parent, x, y, z, rx, ry, r) => {
    const m = new THREE.Group();
    m.position.set(x, y, z);
    m.rotation.set(rx, ry, 0);
    if (blue) {
      add(new THREE.CircleGeometry(r, 24), L(0x23408a, 1), 0, 0, 0, m);
      add(new THREE.CircleGeometry(r * 0.66, 24), L(0xf2efe6, 1), 0, 0, 0.01, m);
      add(new THREE.CircleGeometry(r * 0.33, 24), L(0xb3241c, 1), 0, 0, 0.02, m);
    } else {
      add(new THREE.PlaneGeometry(r * 2, r * 2), L(0xf2efe6, 1), 0, 0, 0, m);
      add(new THREE.PlaneGeometry(r * 1.6, r * 0.45), L(0x111111, 1), 0, 0, 0.01, m);
      add(new THREE.PlaneGeometry(r * 0.45, r * 1.6), L(0x111111, 1), 0, 0, 0.01, m);
    }
    parent.add(m);
    return m;
  };
  const body = new THREE.Group();
  const wing = new THREE.Group();
  const tail = new THREE.Group();
  g.add(body, wing, tail);
  // tapered fuselage (box with rear vertices pinched)
  const fg = new THREE.BoxGeometry(1.05, 1.1, 5.6, 1, 1, 6);
  const fp = fg.attributes.position;
  for (let i = 0; i < fp.count; i++) {
    const t = Math.max(0, (fp.getZ(i) + 0.8) / 3.6);
    const s = 1 - 0.72 * t;
    fp.setX(i, fp.getX(i) * s);
    fp.setY(i, fp.getY(i) * s + t * 0.15);
  }
  fg.computeVertexNormals();
  const fuselage = add(fg, [mat, mat, mat, under, mat, mat], 0, 0, 0.7, body);
  // rotary cowling, spinner, propeller
  const engineCowling = add(new THREE.CylinderGeometry(0.6, 0.62, 0.7, 24), metal, 0, 0, -2.4, body, Math.PI / 2);
  add(new THREE.CircleGeometry(0.42, 20), dark, 0, 0, -2.76, body, 0, Math.PI);
  add(new THREE.ConeGeometry(0.16, 0.35, 12), metal, 0, 0, -2.9, body, -Math.PI / 2);
  const prop = new THREE.Group();
  prop.position.set(0, 0, -2.85);
  body.add(prop);
  for (const s of [1, -1]) add(new THREE.BoxGeometry(0.18, 1.3, 0.04), wood, 0, s * 0.65, 0, prop, 0, s * 0.2);
  // cockpit, pilot, hump and guns
  add(new THREE.TorusGeometry(0.3, 0.06, 8, 18), L(0x3a2616), 0, 0.56, 0.2, body, Math.PI / 2);
  const cockpitHead = add(new THREE.SphereGeometry(0.2, 12, 10), L(0x4a3020), 0, 0.75, 0.25, body);
  box(0.62, 0.14, 1.0, mat, 0, 0.6, -1.2, body);
  for (const sx of [-0.16, 0.16]) add(new THREE.CylinderGeometry(0.05, 0.05, 1.2, 8), dark, sx, 0.72, -1.3, body, Math.PI / 2);
  mark(body, 0.37, 0.07, 1.6, 0, Math.PI / 2, 0.3);
  mark(body, -0.37, 0.07, 1.6, 0, -Math.PI / 2, 0.3);
  // landing gear
  for (const sx of [-0.75, 0.75]) {
    add(new THREE.CylinderGeometry(0.36, 0.36, 0.12, 18), dark, sx, -1.15, -1.4, body, 0, 0, Math.PI / 2);
    add(new THREE.CylinderGeometry(0.18, 0.18, 0.14, 12), metal, sx, -1.15, -1.4, body, 0, 0, Math.PI / 2);
    strut(V(sx, -1.15, -1.4), V(sx * 0.45, -0.55, -1.9), wood, body);
    strut(V(sx, -1.15, -1.4), V(sx * 0.45, -0.55, -0.9), wood, body);
  }
  strut(V(-0.8, -1.15, -1.4), V(0.8, -1.15, -1.4), metal, body, 0.03);
  // Each half-wing is a separate panel so a rare structural failure can tear it away.
  const wmats = [mat, mat, mat, under, mat, mat];
  const wingPanels = {
    left: [],
    right: []
  };
  const panel = (span, y, z) => {
    for (const side of [-1, 1]) {
      const mesh = add(new THREE.BoxGeometry(span / 2, 0.1, z === -1.3 ? 1.45 : z === -0.9 ? 1.35 : 1.25), wmats, side * span / 4, y, z, wing);
      mesh.userData.breakLayer = y > 0.85 ? 'upper' : y < -0.1 ? 'lower' : 'middle';
      wingPanels[side < 0 ? 'left' : 'right'].push(mesh);
    }
  };
  panel(8.6, 1.35, -1.3);
  panel(7.8, -0.45, -0.9);
  if (tri) panel(8.2, 0.45, -1.1);
  const rightRoundel = mark(wing, 3, 1.41, -1.3, -Math.PI / 2, 0, 0.6);
  const leftRoundel = mark(wing, -3, 1.41, -1.3, -Math.PI / 2, 0, 0.6);
  rightRoundel.userData.breakLayer = leftRoundel.userData.breakLayer = 'upper';
  wingPanels.right.push(rightRoundel);
  wingPanels.left.push(leftRoundel);
  for (const sx of [-3, 3]) {
    const sidePanels = wingPanels[sx < 0 ? 'left' : 'right'];
    const braceSpecs = [[V(sx, -0.4, -1.3), V(sx, 1.3, -1.7), wood, 'upper'], [V(sx, -0.4, -0.5), V(sx, 1.3, -0.9), wood, 'upper'], [V(sx, 1.3, -1.3), V(sx * 0.12, -0.4, -0.9), dark, 'upper'], [V(sx, -0.4, -0.9), V(sx * 0.12, 1.3, -1.3), dark, 'lower']];
    for (const [start, end, material, layer] of braceSpecs) {
      const brace = strut(start, end, material, wing, material === dark ? 0.015 : 0.05);
      brace.userData.breakLayer = layer;
      sidePanels.push(brace);
    }
  }
  for (const sx of [-0.32, 0.32]) {
    strut(V(sx, 0.55, -1.6), V(sx * 1.4, 1.3, -1.7), wood, wing);
    strut(V(sx, 0.55, -0.8), V(sx * 1.4, 1.3, -0.9), wood, wing);
  }
  const controlSurfaces = {
    ailerons: [],
    elevator: null,
    rudder: null
  };
  // Hinged upper-wing ailerons visibly oppose one another as the pilot banks.
  for (const side of [-1, 1]) {
    const aileron = new THREE.Group();
    aileron.position.set(side * 3.25, 1.4, -0.6);
    aileron.userData.breakLayer = 'upper';
    box(1.65, 0.075, 0.38, mat, 0, -0.005, 0.19, aileron);
    wing.add(aileron);
    wingPanels[side < 0 ? 'left' : 'right'].push(aileron);
    controlSurfaces.ailerons.push({
      side,
      pivot: aileron
    });
  }
  // Tailplane elevator and a separate, animated rudder, both on hinge pivots.
  add(new THREE.BoxGeometry(2.8, 0.06, 0.9), wmats, 0, 0.18, 3.15, tail);
  box(0.06, 0.8, 0.6, mat, 0, 0.6, 3.2, tail);
  const elevator = new THREE.Group();
  elevator.position.set(0, 0.22, 3.48);
  box(2.2, 0.055, 0.34, mat, 0, -0.015, 0.17, elevator);
  tail.add(elevator);
  controlSurfaces.elevator = elevator;
  const rudder = new THREE.Group();
  rudder.position.set(0, 0, 3.38);
  tail.add(rudder);
  box(0.07, 0.92, 0.38, mat, 0, 0.48, 0.18, rudder);
  if (blue) [0x23408a, 0xf2efe6, 0xb3241c].forEach((c, i) => box(0.075, 0.92, 0.12, L(c), 0, 0.48, 0.06 + i * 0.12, rudder));else {
    box(0.075, 0.92, 0.38, L(0xf2efe6), 0, 0.48, 0.18, rudder);
    mark(rudder, 0.04, 0.48, 0.18, 0, Math.PI / 2, 0.16);
    mark(rudder, -0.04, 0.48, 0.18, 0, -Math.PI / 2, 0.16);
  }
  controlSurfaces.rudder = rudder;
  strut(V(0, -0.1, 3.2), V(0, -0.45, 3.5), wood, tail);
  if (detailedPlayer) {
    const fabricRib = L(blue ? 0x968b69 : 0x81251d);
    const cockpitLeather = L(0x35291f);
    const brass = L(0x9a8050);
    for (const [y, z, span] of [[1.415, -1.3, 8.2], [-0.385, -0.9, 7.4], tri ? [0.515, -1.1, 7.8] : null].filter(Boolean)) {
      for (let x = -span / 2 + 0.45; x < span / 2; x += 0.78) {
        box(0.035, 0.018, 1.34, fabricRib, x, y, z, wing);
      }
    }
    const cowlingRim = add(new THREE.TorusGeometry(0.53, 0.055, 8, 24), brass, 0, 0, -2.77, body);
    cowlingRim.rotation.x = Math.PI / 2;
    for (let i = 0; i < 9; i++) {
      const angle = i / 9 * Math.PI * 2;
      const bolt = add(new THREE.SphereGeometry(0.035, 6, 5), brass, Math.cos(angle) * 0.55, Math.sin(angle) * 0.55, -2.77, body);
      bolt.scale.set(1, 1, 0.45);
    }
    const seatBack = add(new THREE.BoxGeometry(0.52, 0.72, 0.16), cockpitLeather, 0, 0.5, 0.78, body);
    seatBack.rotation.x = -0.12;
    for (const side of [-1, 1]) {
      const cockpitRail = add(new THREE.CylinderGeometry(0.035, 0.035, 0.9, 7), brass, side * 0.3, 0.38, 0.12, body);
      cockpitRail.rotation.x = Math.PI / 2;
      const inspectionPlate = box(0.34, 0.022, 0.56, brass, side * 0.52, 0.15, 0.35, body);
      inspectionPlate.rotation.z = side * -0.08;
    }
    for (let i = 0; i < 5; i++) {
      const rib = add(new THREE.CylinderGeometry(0.025, 0.025, 1.25, 6), wood, -0.5 + i * 0.25, -0.05, 1.35, body);
      rib.rotation.z = Math.PI / 2;
    }
  }
  registerWingAttachments({
    wing,
    wingPanels
  });
  scene.add(g);
  return {
    g,
    body,
    fuselage,
    engineCowling,
    wing,
    tail,
    wingPanels,
    controlSurfaces,
    controlActuation: {
      roll: 0,
      pitch: 0
    },
    bulletHoles: [],
    prop,
    cockpitHead,
    paintMaterial: mat,
    team,
    detailedPlayer,
    speed: 0,
    hits: 0,
    maxHits: 8,
    fall: 0,
    parts: {
      wing: 0,
      body: 0,
      tail: 0
    },
    dying: false,
    engineDamaged: false,
    damagePuff: 0,
    fireCd: 0,
    puff: 0,
    roll: 0
  };
}
function buildTitleBomberFormation() {
  const positions = [[0, 0, -24], [-52, -3, 28], [52, -1, 28]];
  for (const [x, y, z] of positions) {
    const bomber = makePlane('blue', '#776b4b', false);
    bomberize(bomber);
    bomber.g.scale.setScalar(2.6);
    bomber.g.position.set(x, y, z);
    bomber.g.rotation.y = 0.12;
    titleBomberFormation.add(bomber.g);
    titleBombers.push(bomber);
  }
}
function animateTitleBombers(dt, time) {
  const phase = time * 0.0001;
  titleBomberFormation.position.set(Math.sin(phase) * 120, 270 + Math.sin(phase * 1.7) * 9, 30 + Math.cos(phase * 0.72) * 30);
  titleBomberFormation.rotation.y = Math.sin(phase) * 0.12;
  for (const cloud of titleClouds) {
    cloud.position.x += cloud.userData.drift * dt;
    if (cloud.position.x > 1050) cloud.position.x = -1050;
  }
  for (const bomber of titleBombers) {
    if (bomber.prop) bomber.prop.rotation.z += dt * 36;
    for (const prop of bomber.props || []) prop.rotation.z += dt * 32;
  }
}
// legacy model (unused)
function refreshShopPreview() {
  for (const child of [...shopPreview.children]) {
    child.traverse(object => {
      if (object.geometry) object.geometry.dispose();
      if (object.material) {
        for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
          for (const value of Object.values(material)) if (value?.isTexture) value.dispose();
          material.dispose();
        }
      }
    });
    child.removeFromParent();
  }
  if (!['shop', 'debrief', 'over'].includes(mode)) {
    shopPreview.visible = false;
    return;
  }
  const stats = PLANES[sel.team].find(plane => plane.id === sel.plane) || PLANES[sel.team][0];
  const previewPaint = sel.gameMode === 'squadbattle' ? getSquadTeamColor(sel.squadTeam) : activeEconomy().paint || (stats.id === 'baron' ? '#c0180e' : null);
  const preview = makePlane(sel.team, previewPaint, stats.tri, true);
  preview.g.rotation.y = 0.72;
  preview.g.scale.setScalar(stats.bomber ? 0.72 : 0.92);
  if (stats.bomber) bomberize(preview);else if (stats.twoSeater) {
    twoSeatize(preview);
    preview.g.scale.setScalar(0.9);
  }
  const badge = INSIGNIA.find(item => item.id === save.logo);
  if (save.logo === 'custom' && save.customLogo) applyPilotLogo(preview, 'custom');else if (badge && save.career.aircraftKills >= badge.unlockAt) applyPilotLogo(preview, save.logo);
  shopPreview.add(preview.g);
  shopPreview.rotation.set(0, 0, 0);
  shopPreview.visible = true;
}
function makePlaneLegacy(team) {
  const g = new THREE.Group();
  const blue = team === 'blue';
  const L = c => new THREE.MeshStandardMaterial({
    color: c,
    roughness: 0.85,
    side: THREE.DoubleSide
  });
  const mat = L(blue ? 0x5b5434 : 0x9c2a1f);
  const under = L(blue ? 0xd8cfa8 : 0x7a8a9a);
  const metal = new THREE.MeshStandardMaterial({
    color: 0xc8c8c8,
    metalness: 0.8,
    roughness: 0.35
  });
  const wood = L(0x9a6a3a);
  const dark = L(0x2a2a2a);
  const white = L(0xf2efe6);
  const add = (geo, m, x, y, z, parent, rx = 0, ry = 0, rz = 0) => {
    const mesh = new THREE.Mesh(geo, m);
    mesh.position.set(x, y, z);
    mesh.rotation.set(rx, ry, rz);
    parent.add(mesh);
    return mesh;
  };
  const box = (w, h, d, m, x, y, z, parent) => add(new THREE.BoxGeometry(w, h, d), m, x, y, z, parent);
  const strut = (a, b, m, parent) => {
    const len = a.distanceTo(b);
    const s = add(new THREE.CylinderGeometry(0.05, 0.05, len, 6), m, 0, 0, 0, parent);
    s.position.copy(a).lerp(b, 0.5);
    s.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize());
  };
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  // national marking: roundel (blue) or cross (red), facing +normal
  const mark = (parent, x, y, z, rx, ry, r) => {
    const m = new THREE.Group();
    m.position.set(x, y, z);
    m.rotation.set(rx, ry, 0);
    if (blue) {
      add(new THREE.CircleGeometry(r, 20), L(0x23408a), 0, 0, 0, m);
      add(new THREE.CircleGeometry(r * 0.66, 20), white, 0, 0, 0.005, m);
      add(new THREE.CircleGeometry(r * 0.33, 20), L(0xb3241c), 0, 0, 0.01, m);
    } else {
      add(new THREE.PlaneGeometry(r * 2, r * 2), white, 0, 0, 0, m);
      add(new THREE.PlaneGeometry(r * 1.6, r * 0.5), dark, 0, 0, 0.005, m);
      add(new THREE.PlaneGeometry(r * 0.5, r * 1.6), dark, 0, 0, 0.005, m);
    }
    parent.add(m);
    return m;
  };
  const body = new THREE.Group();
  const wing = new THREE.Group();
  const tail = new THREE.Group();
  g.add(body, wing, tail);
  // tapered fuselage
  const fus = add(new THREE.CylinderGeometry(0.28, 0.62, 5.2, 4, 1), mat, 0, 0.05, 0.6, body, Math.PI / 2, 0, Math.PI / 4);
  fus.scale.set(1, 1, 1.15);
  add(new THREE.CylinderGeometry(0.62, 0.62, 0.6, 4), under, 0, 0.05, -2.2, body, Math.PI / 2, 0, Math.PI / 4);
  // rotary cowling + spinner
  add(new THREE.CylinderGeometry(0.62, 0.68, 0.8, 20, 1, true), metal, 0, 0.05, -2.75, body, Math.PI / 2);
  add(new THREE.CylinderGeometry(0.45, 0.45, 0.3, 14), dark, 0, 0.05, -3.05, body, Math.PI / 2);
  add(new THREE.ConeGeometry(0.18, 0.4, 10), metal, 0, 0.05, -3.4, body, -Math.PI / 2);
  // propeller (two twisted wooden blades)
  const prop = new THREE.Group();
  prop.position.set(0, 0.05, -3.25);
  body.add(prop);
  for (const s of [1, -1]) add(new THREE.BoxGeometry(0.22, 1.4, 0.05), wood, 0, s * 0.7, 0, prop, 0, s * 0.25);
  // cockpit, hump, guns, pilot head
  add(new THREE.TorusGeometry(0.33, 0.06, 6, 16), L(0x4a3020), 0, 0.5, -0.6, body, Math.PI / 2);
  add(new THREE.SphereGeometry(0.22, 10, 8), L(0x5a3a22), 0, 0.68, -0.55, body);
  box(0.7, 0.25, 0.9, mat, 0, 0.55, -1.4, body);
  for (const sx of [-0.18, 0.18]) add(new THREE.CylinderGeometry(0.06, 0.06, 1.2, 6), dark, sx, 0.72, -1.75, body, Math.PI / 2);
  mark(body, 0.5, 0.05, 1.3, 0, Math.PI / 2, 0.38);
  mark(body, -0.5, 0.05, 1.3, 0, -Math.PI / 2, 0.38);
  // landing gear
  for (const sx of [-0.75, 0.75]) {
    add(new THREE.CylinderGeometry(0.38, 0.38, 0.12, 16), dark, sx, -1.15, -1.6, body, 0, 0, Math.PI / 2);
    add(new THREE.CylinderGeometry(0.2, 0.2, 0.14, 12), white, sx, -1.15, -1.6, body, 0, 0, Math.PI / 2);
    strut(V(sx, -1.15, -1.6), V(sx * 0.5, -0.4, -2.1), wood, body);
    strut(V(sx, -1.15, -1.6), V(sx * 0.5, -0.4, -1.0), wood, body);
  }
  box(1.6, 0.06, 0.06, metal, 0, -1.15, -1.6, body);
  // wings: two-tone, rounded tips, stagger
  const wingSet = (span, y, z) => {
    const top = box(span, 0.1, 1.45, mat, 0, y, z, wing);
    box(span, 0.02, 1.43, under, 0, y - 0.06, z, wing);
    for (const s of [-1, 1]) add(new THREE.CylinderGeometry(0.72, 0.72, 0.1, 12, 1, false, 0, Math.PI), mat, s * span / 2, y, z, wing, 0, s > 0 ? 0 : Math.PI);
    return top;
  };
  wingSet(8.6, 1.35, -1.35);
  wingSet(7.8, -0.4, -0.95);
  mark(wing, 3, 1.41, -1.35, -Math.PI / 2, 0, 0.6);
  mark(wing, -3, 1.41, -1.35, -Math.PI / 2, 0, 0.6);
  for (const sx of [-3.1, 3.1]) {
    strut(V(sx, -0.35, -0.6), V(sx, 1.3, -1.0), wood, wing);
    strut(V(sx, -0.35, -1.3), V(sx, 1.3, -1.7), wood, wing);
    strut(V(sx, -0.35, -0.95), V(0, 1.3, -1.35), metal, wing);
  }
  for (const sx of [-0.35, 0.35]) strut(V(sx, 0.5, -1.6), V(sx * 1.3, 1.3, -1.4), wood, wing);
  // tail: stabiliser, fin with stripes / rudder
  add(new THREE.CylinderGeometry(0.9, 0.9, 0.06, 16, 1, false, 0, Math.PI), mat, 0, 0.15, 3.0, tail, 0, Math.PI / 2);
  box(2.6, 0.06, 0.5, mat, 0, 0.15, 3.25, tail);
  box(0.2, 0.25, 1.4, mat, 0, 0.1, 2.9, tail);
  const fin = add(new THREE.CylinderGeometry(0.7, 0.7, 0.06, 16, 1, false, 0, Math.PI), mat, 0, 0.2, 3.3, tail, 0, 0, Math.PI / 2);
  fin.rotation.set(0, -Math.PI / 2, Math.PI / 2);
  if (blue) [0x23408a, 0xf2efe6, 0xb3241c].forEach((c, i) => box(0.07, 0.75, 0.18, L(c), 0, 0.55, 3.35 + i * 0.18, tail));else mark(tail, 0.05, 0.55, 3.4, 0, Math.PI / 2, 0.3);
  strut(V(0, -0.3, 3.0), V(0, -0.6, 3.3), wood, tail);
  scene.add(g);
  g.traverse(o => o.isMesh && (o.castShadow = false));
  return {
    g,
    body,
    wing,
    tail,
    prop,
    team,
    speed: 0,
    hits: 0,
    maxHits: 8,
    fall: 0,
    parts: {
      wing: 0,
      body: 0,
      tail: 0
    },
    dying: false,
    fireCd: 0,
    puff: 0,
    roll: 0
  };
}

// ---------- State ----------
let mode = 'menu';
let player = null;
let paused = false;
let pausedAudioState = [];
let pausedAudioContext = false;
let footThirdPerson = false;
let walkingAvatar = null;
let walkingAvatarTeam = null;
let walkingAvatarGender = null;
const foot = {
  pos: new THREE.Vector3(),
  yaw: 0,
  pitch: 0,
  jumpHeight: 0,
  jumpVelocity: 0
};
let planes = [];
let bullets = [];
let puffs = [];
const smokeSpritePool = [];
let activeSmokePuffs = 0;
let airDebris = [];
let chutes = [];
let aceFlyoverTargets = [];
let runwayMarshal = null;
let blimps = [];
let streak = 0;
let score = 0;
let sortieEarnings = [];
let bonanzaZoneSeed = 0;
let squadFormationSlots = [0, 0, 0, 0];
let msgT = 0;
const input = {
  mx: 0,
  my: 0,
  lx: 0,
  ly: 0,
  fire: false,
  bomb: false,
  ePressed: false,
  jumpPressed: false,
  keys: {}
};
const gameplayTimers = new Set();
function runGameplayTimer(timer) {
  if (paused) return;
  timer.startedAt = performance.now();
  timer.handle = setTimeout(() => {
    timer.handle = null;
    gameplayTimers.delete(timer);
    if (timer.generation !== gameGen || mode === 'menu') return;
    timer.fn();
  }, timer.remaining);
}
function scheduleGameplayTimeout(fn, delay) {
  const timer = {
    fn,
    remaining: Math.max(0, delay),
    generation: gameGen,
    startedAt: 0,
    handle: null
  };
  gameplayTimers.add(timer);
  runGameplayTimer(timer);
  return timer;
}
function cancelGameplayTimeout(timer) {
  if (!timer) return;
  if (timer.handle !== null) clearTimeout(timer.handle);
  timer.handle = null;
  gameplayTimers.delete(timer);
}
function pauseGameplayTimers() {
  const now = performance.now();
  for (const timer of gameplayTimers) {
    if (timer.handle === null) continue;
    clearTimeout(timer.handle);
    timer.handle = null;
    timer.remaining = Math.max(0, timer.remaining - (now - timer.startedAt));
  }
}
function resumeGameplayTimers() {
  for (const timer of gameplayTimers) {
    if (timer.handle === null) runGameplayTimer(timer);
  }
}
function syncPauseUI() {
  const button = $('pause-btn');
  const overlay = $('pause-overlay');
  if (!button || !overlay) return;
  const activeMission = roundInProgress && mode !== 'menu' && mode !== 'over';
  button.style.display = activeMission ? 'block' : 'none';
  button.textContent = paused ? '▶ RESUME' : 'Ⅱ PAUSE';
  button.setAttribute('aria-pressed', String(paused));
  overlay.style.display = paused ? 'grid' : 'none';
  overlay.setAttribute('aria-hidden', String(!paused));
  const weatherSettings = $('pause-weather-settings');
  if (weatherSettings) weatherSettings.style.display = localWeatherAvailable() ? '' : 'none';
  const gridSettings = $('pause-grid-settings');
  if (gridSettings) gridSettings.style.display = sel.gameMode === 'squadron' ? '' : 'none';
  const gridToggle = $('sector-grid-enabled');
  if (gridToggle) gridToggle.checked = sectorGridVisible;
  for (const group of ['music', 'general', 'weapons']) {
    const slider = $(`audio-${group}`);
    const readout = $(`audio-${group}-value`);
    if (slider) slider.value = String(Math.round(save.audioSettings[group] * 100));
    if (readout) readout.textContent = `${Math.round(save.audioSettings[group] * 100)}%`;
  }
}
function setPaused(next) {
  next = !!next;
  if (next && (!roundInProgress || mode === 'menu' || mode === 'over')) return;
  if (paused === next) {
    syncPauseUI();
    return;
  }
  paused = next;
  if (paused) {
    toggleFieldMap(false);
    pauseGameplayTimers();
    input.fire = false;
    input.bomb = false;
    input.ePressed = false;
    input.jumpPressed = false;
    input.mx = input.my = input.lx = input.ly = 0;
    Object.keys(input.keys).forEach(key => input.keys[key] = false);
    stickId = null;
    lookId = null;
    look.mouse = false;
    const audio = [engine, engineSputter, engineStartup, footsteps, ...Object.values(fieldGramophones), truckEngine, woodenDoor, ...playerGunVoices, ...nearbyEngineVoices, ...npcGunVoices];
    pausedAudioState = audio.map(item => ({
      item,
      playing: !item.paused
    }));
    audio.forEach(item => item.pause());
    pausedAudioContext = !!actx && actx.state === 'running';
    if (pausedAudioContext) actx.suspend().catch(() => {});
  } else {
    resumeGameplayTimers();
    for (const {
      item,
      playing
    } of pausedAudioState) {
      if (playing && !muted) item.play().catch(() => {});
    }
    pausedAudioState = [];
    if (pausedAudioContext && actx?.state === 'suspended') actx.resume().catch(() => {});
    pausedAudioContext = false;
  }
  syncPauseUI();
}
const spectator = {
  active: false,
  homePosition: new THREE.Vector3(),
  homeLook: new THREE.Vector3(),
  homeYaw: 0,
  homePitch: 0,
  yaw: 0,
  pitch: 0,
  target: null,
  helper: null,
  pilot: null,
  vertical: 0,
  smokeTimer: 0,
  zoom: 1
};
const spectateRaycaster = new THREE.Raycaster();
const spectatePointer = new THREE.Vector2();
let spectatorPress = null;
const truckInput = {
  forward: false,
  back: false,
  left: false,
  right: false
};
let truckDriver = null;
const walkingHands = new THREE.Group();
walkingHands.name = 'first-person-hands';
const sleeveMat = new THREE.MeshLambertMaterial({
  color: 0x71694f
});
const cuffMat = new THREE.MeshLambertMaterial({
  color: 0x403c32
});
const handMat = new THREE.MeshLambertMaterial({
  color: 0xb99270
});
const walkingArms = [];
let handWalkPhase = 0;
const makeHandSegment = (a, b, radius, material, parent) => {
  const direction = b.clone().sub(a);
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius * 0.78, radius, direction.length(), 8), material);
  mesh.position.copy(a).add(b).multiplyScalar(0.5);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
  parent.add(mesh);
  return mesh;
};
for (const side of [-1, 1]) {
  const shoulder = new THREE.Vector3(side * 0.72, -0.05, -0.25);
  const elbow = new THREE.Vector3(side * 0.53, -0.39, -0.65);
  const wrist = new THREE.Vector3(side * 0.36, -0.73, -1.05);
  const arm = new THREE.Group();
  arm.position.copy(shoulder);
  const origin = new THREE.Vector3();
  const elbowLocal = elbow.clone().sub(shoulder);
  const wristLocal = wrist.clone().sub(shoulder);
  makeHandSegment(origin, elbowLocal, 0.17, sleeveMat, arm);
  makeHandSegment(elbowLocal, wristLocal, 0.13, sleeveMat, arm);
  const cuff = new THREE.Mesh(new THREE.SphereGeometry(0.145, 8, 6), cuffMat);
  cuff.position.copy(wristLocal).add(new THREE.Vector3(0, -0.015, 0.015));
  arm.add(cuff);
  const hand = new THREE.Mesh(new THREE.SphereGeometry(0.135, 10, 8), handMat);
  hand.scale.set(0.82, 0.88, 1.12);
  hand.position.copy(wristLocal).add(new THREE.Vector3(0, 0.015, -0.11));
  arm.add(hand);
  walkingHands.add(arm);
  walkingArms.push(arm);
}
walkingHands.visible = false;
camera.add(walkingHands);
const firstPersonGesture = new THREE.Group();
firstPersonGesture.name = 'first-person-gesture';
const gesturePalm = new THREE.Mesh(new THREE.BoxGeometry(0.29, 0.34, 0.1), handMat);
firstPersonGesture.add(gesturePalm);
const gestureFingerJoint = new THREE.SphereGeometry(0.043, 8, 6);
const addGestureJoint = (x, y, z, radius = 0.043) => {
  const joint = new THREE.Mesh(radius === 0.043 ? gestureFingerJoint : new THREE.SphereGeometry(radius, 8, 6), handMat);
  joint.position.set(x, y, z);
  firstPersonGesture.add(joint);
};
const addGestureFinger = (points, radius) => {
  for (let i = 1; i < points.length; i++) {
    makeHandSegment(new THREE.Vector3(...points[i - 1]), new THREE.Vector3(...points[i]), radius, handMat, firstPersonGesture);
    addGestureJoint(...points[i], radius * 0.9);
  }
  addGestureJoint(...points[0], radius * 0.9);
};
addGestureFinger([[-0.09, 0.12, 0], [-0.09, 0.01, -0.015], [-0.065, -0.075, -0.09]], 0.035);
addGestureFinger([[0.055, 0.12, 0], [0.055, 0.005, -0.015], [0.035, -0.08, -0.09]], 0.035);
addGestureFinger([[0.12, 0.1, 0], [0.12, -0.005, -0.015], [0.095, -0.075, -0.085]], 0.031);
addGestureFinger([[0, 0.12, 0], [0.005, 0.29, -0.005], [0.012, 0.47, -0.012]], 0.047);
addGestureFinger([[0.12, 0.035, 0], [0.19, -0.015, -0.025], [0.12, -0.09, -0.09]], 0.04);
const gestureWrist = new THREE.Mesh(new THREE.CylinderGeometry(0.105, 0.13, 0.25, 8), handMat);
gestureWrist.position.set(0, -0.27, 0);
firstPersonGesture.add(gestureWrist);
firstPersonGesture.position.set(0.55, -1.35, -1.1);
firstPersonGesture.visible = false;
camera.add(firstPersonGesture);
let firstPersonGestureT = 0;
const FIRST_PERSON_GESTURE_DURATION = 1.35;
const $ = id => document.getElementById(id);

// Weather is mostly calm and evolves slowly. Localized cells transition between
// clear skies and weather systems over a full minute, with precipitation and haze
// cross-fading rather than switching abruptly.
const WEATHER_CELLS = {
  trenches: [{
    x: -450,
    z: -100,
    radius: 510,
    phase: 0.3
  }, {
    x: 280,
    z: 100,
    radius: 490,
    phase: 2.2
  }, {
    x: 1050,
    z: 500,
    radius: 440,
    phase: 4.1
  }],
  stranda: [{
    x: -260,
    z: 100,
    radius: 470,
    phase: 0.8
  }, {
    x: 400,
    z: -70,
    radius: 450,
    phase: 2.8
  }, {
    x: 1000,
    z: 480,
    radius: 500,
    phase: 4.8
  }]
};
const WEATHER_PROFILES = {
  clear: {
    rain: 0,
    snow: 0,
    storm: 0
  },
  rain: {
    rain: 0.82,
    snow: 0,
    storm: 0
  },
  snow: {
    rain: 0,
    snow: 0.82,
    storm: 0
  },
  storm: {
    rain: 0.9,
    snow: 0,
    storm: 0.88
  }
};
for (const cells of Object.values(WEATHER_CELLS)) {
  for (const cell of cells) {
    cell.from = {
      ...WEATHER_PROFILES.clear
    };
    cell.to = {
      ...WEATHER_PROFILES.clear
    };
    cell.mix = {
      ...WEATHER_PROFILES.clear
    };
    cell.transition = 1;
    cell.transitionDuration = 70;
    cell.nextShift = 28 + Math.random() * 48;
    cell.phaseOffset = Math.random() * 100;
  }
}
const weatherStatus = $('weather-status');
const weatherToggle = $('weather-enabled');
const weatherCameraPosition = new THREE.Vector3();
const weatherFogHaze = new THREE.Color(0x596873);
const weatherSnowHaze = new THREE.Color(0x9aaab0);
const weatherFogTint = new THREE.Color();
const weatherCloudTint = new THREE.Color();
const weatherBlend = {
  rain: 0,
  snow: 0,
  storm: 0
};
let weatherFogReference = null;
let weatherFogBase = null;
let weatherClock = 0;
let weatherLightningCountdown = 8;
let weatherLightningTime = 0;
let weatherFlashTime = 0;
let weatherToastTime = 0;
let weatherLastNotifiedType = 'clear';
const weatherCloudGroup = new THREE.Group();
weatherCloudGroup.visible = false;
scene.add(weatherCloudGroup);
const weatherCloudCanvas = document.createElement('canvas');
weatherCloudCanvas.width = weatherCloudCanvas.height = 128;
const weatherCloudContext = weatherCloudCanvas.getContext('2d');
const weatherCloudGradient = weatherCloudContext.createRadialGradient(64, 64, 4, 64, 64, 64);
weatherCloudGradient.addColorStop(0, 'rgba(255,255,255,0.88)');
weatherCloudGradient.addColorStop(0.45, 'rgba(255,255,255,0.55)');
weatherCloudGradient.addColorStop(1, 'rgba(255,255,255,0)');
weatherCloudContext.fillStyle = weatherCloudGradient;
weatherCloudContext.fillRect(0, 0, 128, 128);
const weatherCloudTexture = new THREE.CanvasTexture(weatherCloudCanvas);
weatherCloudTexture.colorSpace = THREE.SRGBColorSpace;
for (let i = 0; i < 15; i++) {
  const material = new THREE.SpriteMaterial({
    map: weatherCloudTexture,
    color: 0xffffff,
    transparent: true,
    opacity: 0.34,
    depthWrite: false,
    fog: false,
    toneMapped: false
  });
  const cloud = new THREE.Sprite(material);
  cloud.position.set((Math.random() - 0.5) * 460, (Math.random() - 0.5) * 48, (Math.random() - 0.5) * 420);
  cloud.scale.set(210 + Math.random() * 220, 100 + Math.random() * 90, 1);
  cloud.userData.weatherCloud = true;
  weatherCloudGroup.add(cloud);
}
const weatherBoltGeometry = new THREE.BufferGeometry();
weatherBoltGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(21), 3));
const weatherBoltMaterial = new THREE.LineBasicMaterial({
  color: 0xe9f5ff,
  transparent: true,
  opacity: 0.95,
  depthWrite: false,
  toneMapped: false
});
const weatherBolt = new THREE.Line(weatherBoltGeometry, weatherBoltMaterial);
weatherBolt.frustumCulled = false;
weatherBolt.visible = false;
weatherCloudGroup.add(weatherBolt);
const weatherParticles = new THREE.Group();
weatherParticles.visible = false;
scene.add(weatherParticles);
const RAIN_COUNT = 520;
const SNOW_COUNT = 260;
const rainDrops = Array.from({
  length: RAIN_COUNT
}, () => ({
  x: (Math.random() - 0.5) * 260,
  y: -55 + Math.random() * 190,
  z: (Math.random() - 0.5) * 260
}));
const snowFlakes = Array.from({
  length: SNOW_COUNT
}, () => ({
  x: (Math.random() - 0.5) * 260,
  y: -55 + Math.random() * 190,
  z: (Math.random() - 0.5) * 260
}));
const rainPositions = new Float32Array(RAIN_COUNT * 6);
const snowPositions = new Float32Array(SNOW_COUNT * 3);
const rainGeometry = new THREE.BufferGeometry();
rainGeometry.setAttribute('position', new THREE.BufferAttribute(rainPositions, 3));
const rainMaterial = new THREE.LineBasicMaterial({
  color: 0xc7e2ee,
  transparent: true,
  opacity: 0.48,
  depthWrite: false,
  toneMapped: false
});
const rainStreaks = new THREE.LineSegments(rainGeometry, rainMaterial);
rainStreaks.frustumCulled = false;
const snowGeometry = new THREE.BufferGeometry();
snowGeometry.setAttribute('position', new THREE.BufferAttribute(snowPositions, 3));
const snowMaterial = new THREE.PointsMaterial({
  color: 0xf0f4f1,
  size: 3.4,
  sizeAttenuation: false,
  transparent: true,
  opacity: 0.82,
  depthWrite: false,
  toneMapped: false
});
const snowPoints = new THREE.Points(snowGeometry, snowMaterial);
snowPoints.frustumCulled = false;
weatherParticles.add(rainStreaks, snowPoints);
const weatherLightning = new THREE.PointLight(0xdceeff, 0, 1050, 1.2);
scene.add(weatherLightning);
const weatherFlashMaterial = new THREE.MeshBasicMaterial({
  color: 0xdcecff,
  transparent: true,
  opacity: 0,
  depthTest: false,
  depthWrite: false,
  toneMapped: false
});
const weatherFlash = new THREE.Mesh(new THREE.PlaneGeometry(4.4, 2.6), weatherFlashMaterial);
weatherFlash.position.set(0, 0, -1.3);
weatherFlash.renderOrder = 1000;
weatherFlash.visible = false;
camera.add(weatherFlash);
function applyWeatherFog(weights = null) {
  if (!scene.fog) return;
  if (weatherFogReference !== scene.fog) {
    weatherFogReference = scene.fog;
    weatherFogBase = {
      near: scene.fog.near,
      far: scene.fog.far
    };
  }
  if (!weights) {
    scene.fog.near = weatherFogBase.near;
    scene.fog.far = weatherFogBase.far;
    scene.fog.color.copy(scene.background);
    return;
  }
  const rain = THREE.MathUtils.clamp(weights.rain, 0, 1);
  const snow = THREE.MathUtils.clamp(weights.snow, 0, 1);
  const storm = THREE.MathUtils.clamp(weights.storm, 0, 1);
  const severity = rain * 0.2 + snow * 0.28 + storm * 0.5;
  scene.fog.near = Math.max(45, weatherFogBase.near * (1 - severity * 0.43));
  scene.fog.far = Math.max(scene.fog.near + 150, weatherFogBase.far * (1 - severity * 0.5));
  weatherFogTint.copy(weatherFogHaze).lerp(weatherSnowHaze, snow * 0.72);
  scene.fog.color.copy(scene.background).lerp(weatherFogTint, THREE.MathUtils.clamp(severity * 0.72, 0, 0.52));
}
function showWeatherToast(type) {
  if (!weatherStatus) return;
  const label = type === 'storm' ? 'STORM BUILDING' : type === 'snow' ? 'SNOW MOVING IN' : type === 'rain' ? 'RAIN MOVING IN' : 'SKIES CLEARING';
  weatherStatus.textContent = label;
  weatherStatus.hidden = false;
  weatherStatus.classList.remove('weather-toast-in');
  void weatherStatus.offsetWidth;
  weatherStatus.classList.add('weather-toast-in');
  weatherToastTime = 3.2;
}
function hideWeatherEffects() {
  weatherCloudGroup.visible = false;
  weatherParticles.visible = false;
  rainStreaks.visible = false;
  snowPoints.visible = false;
  weatherBolt.visible = false;
  weatherLightning.intensity = 0;
  weatherFlash.visible = false;
  weatherFlashMaterial.opacity = 0;
  weatherBlend.rain = weatherBlend.snow = weatherBlend.storm = 0;
  weatherToastTime = 0;
  weatherLastNotifiedType = 'clear';
  applyWeatherFog(null);
  if (weatherStatus) weatherStatus.hidden = true;
}
function triggerWeatherLightning() {
  const points = weatherBoltGeometry.attributes.position.array;
  let x = (Math.random() - 0.5) * 100;
  let z = (Math.random() - 0.5) * 100;
  for (let i = 0; i < 7; i++) {
    const offset = i * 3;
    points[offset] = x;
    points[offset + 1] = 26 - i * 29;
    points[offset + 2] = z;
    x += (Math.random() - 0.5) * 25;
    z += (Math.random() - 0.5) * 20;
  }
  weatherBoltGeometry.attributes.position.needsUpdate = true;
  weatherBoltGeometry.computeBoundingSphere();
  weatherBolt.visible = true;
  weatherBoltMaterial.opacity = 0.95;
  weatherLightningTime = 0.2;
  weatherFlashTime = 0.15;
  weatherLightningCountdown = 7 + Math.random() * 14;
}
function chooseWeatherType(map) {
  const roll = Math.random();
  if (roll < 0.76) return 'clear';
  if (roll < 0.9) return 'rain';
  if (roll < (map === 'stranda' ? 0.98 : 0.96)) return 'snow';
  return 'storm';
}
function updateWeather(dt, options) {
  const {
    enabled,
    active,
    map
  } = options;
  if (!enabled || !active || map === 'bedroom') {
    hideWeatherEffects();
    return;
  }
  camera.getWorldPosition(weatherCameraPosition);
  weatherClock += dt;
  const cells = WEATHER_CELLS[map] || [];
  for (const cell of cells) {
    const x = cell.x + Math.sin(weatherClock * 0.027 + cell.phase) * 46;
    const z = cell.z + Math.cos(weatherClock * 0.023 + cell.phase) * 42;
    cell.distance = Math.hypot(weatherCameraPosition.x - x, weatherCameraPosition.z - z);
    cell.worldX = x;
    cell.worldZ = z;
    if (weatherClock >= cell.nextShift && cell.transition >= 1) {
      cell.from = {
        ...cell.mix
      };
      cell.to = {
        ...WEATHER_PROFILES[chooseWeatherType(map)]
      };
      cell.transition = 0;
      cell.transitionDuration = 58 + Math.random() * 28;
      const clearAhead = cell.to.rain === 0 && cell.to.snow === 0 && cell.to.storm === 0;
      cell.nextShift = weatherClock + cell.transitionDuration + (clearAhead ? 115 + Math.random() * 95 : 78 + Math.random() * 72);
    }
    if (cell.transition < 1) {
      cell.transition = Math.min(1, cell.transition + dt / cell.transitionDuration);
      const eased = THREE.MathUtils.smoothstep(cell.transition, 0, 1);
      for (const key of ['rain', 'snow', 'storm']) cell.mix[key] = THREE.MathUtils.lerp(cell.from[key], cell.to[key], eased);
    }
  }
  const nearest = cells.reduce((best, cell) => !best || cell.distance < best.distance ? cell : best, null);
  const cellFade = nearest ? 1 - THREE.MathUtils.smoothstep(nearest.distance, nearest.radius * 0.4, nearest.radius + 260) : 0;
  const desired = nearest ? {
    rain: nearest.mix.rain * cellFade,
    snow: nearest.mix.snow * cellFade,
    storm: nearest.mix.storm * cellFade
  } : WEATHER_PROFILES.clear;
  const blendRate = 1 - Math.exp(-dt / 13);
  for (const key of ['rain', 'snow', 'storm']) weatherBlend[key] = THREE.MathUtils.lerp(weatherBlend[key], desired[key], blendRate);
  const rain = THREE.MathUtils.clamp(weatherBlend.rain + weatherBlend.storm * 0.75, 0, 1);
  const snow = THREE.MathUtils.clamp(weatherBlend.snow, 0, 1);
  const storm = THREE.MathUtils.clamp(weatherBlend.storm, 0, 1);
  const currentType = storm > 0.36 ? 'storm' : snow > 0.3 && snow >= rain ? 'snow' : rain > 0.3 ? 'rain' : 'clear';
  if (currentType !== weatherLastNotifiedType) {
    weatherLastNotifiedType = currentType;
    showWeatherToast(currentType);
  }
  if (weatherToastTime > 0) {
    weatherToastTime = Math.max(0, weatherToastTime - dt);
    if (weatherToastTime <= 0 && weatherStatus) weatherStatus.hidden = true;
  }
  const weatherStrength = Math.max(rain, snow, storm);
  const cloudFade = cellFade * weatherStrength;
  if (nearest && cloudFade > 0.012) {
    weatherCloudGroup.position.set(nearest.worldX, heightAt(nearest.worldX, nearest.worldZ) + 155, nearest.worldZ);
    weatherCloudGroup.visible = true;
    weatherCloudTint.setHex(0xe2e8e8).lerp(weatherFogHaze, rain * 0.36 + storm * 0.35).lerp(weatherSnowHaze, snow * 0.3);
    for (const cloud of weatherCloudGroup.children) {
      if (cloud.userData.weatherCloud) {
        cloud.material.color.copy(weatherCloudTint);
        cloud.material.opacity = 0.34 * cloudFade;
      }
    }
  } else {
    weatherCloudGroup.visible = false;
  }
  rainStreaks.visible = rain > 0.015;
  snowPoints.visible = snow > 0.015;
  weatherParticles.visible = rainStreaks.visible || snowPoints.visible;
  weatherParticles.position.copy(weatherCameraPosition);
  rainMaterial.opacity = (0.46 + storm * 0.24) * rain;
  snowMaterial.opacity = 0.82 * snow;
  const windAngle = weatherClock * 0.18 + (nearest?.phase || 0);
  const windStrength = 20 + rain * 22 + storm * 35;
  const windX = Math.cos(windAngle) * windStrength;
  const windZ = Math.sin(windAngle) * windStrength;
  if (rainStreaks.visible) {
    for (let i = 0; i < RAIN_COUNT; i++) {
      const drop = rainDrops[i];
      drop.y -= (245 + storm * 90) * dt;
      drop.x += windX * dt * 0.55;
      drop.z += windZ * dt * 0.55;
      if (drop.y < -58) {
        drop.y = 132 + Math.random() * 36;
        drop.x = (Math.random() - 0.5) * 260;
        drop.z = (Math.random() - 0.5) * 260;
      }
      const offset = i * 6;
      rainPositions[offset] = drop.x;
      rainPositions[offset + 1] = drop.y;
      rainPositions[offset + 2] = drop.z;
      rainPositions[offset + 3] = drop.x - windX * 0.018;
      rainPositions[offset + 4] = drop.y + 4.2 + storm * 1.1;
      rainPositions[offset + 5] = drop.z - windZ * 0.018;
    }
    rainGeometry.attributes.position.needsUpdate = true;
  }
  if (snowPoints.visible) {
    for (let i = 0; i < SNOW_COUNT; i++) {
      const flake = snowFlakes[i];
      flake.y -= (8 + i % 9 * 1.1) * dt;
      flake.x += (windX * 0.12 + Math.sin(weatherClock * 1.8 + i) * 2.5) * dt;
      flake.z += (windZ * 0.12 + Math.cos(weatherClock * 1.4 + i * 0.7) * 2.2) * dt;
      if (flake.y < -58) {
        flake.y = 132 + Math.random() * 36;
        flake.x = (Math.random() - 0.5) * 260;
        flake.z = (Math.random() - 0.5) * 260;
      }
      const offset = i * 3;
      snowPositions[offset] = flake.x;
      snowPositions[offset + 1] = flake.y;
      snowPositions[offset + 2] = flake.z;
    }
    snowGeometry.attributes.position.needsUpdate = true;
  }
  applyWeatherFog(weatherStrength > 0.01 ? {
    rain,
    snow,
    storm
  } : null);
  const stormCellClose = nearest && nearest.distance < nearest.radius * 1.05;
  if (storm > 0.43 && stormCellClose) {
    weatherLightningCountdown -= dt;
    if (weatherLightningCountdown <= 0) triggerWeatherLightning();
  } else {
    weatherLightningCountdown = Math.max(weatherLightningCountdown, 7);
    weatherBolt.visible = false;
    weatherLightningTime = 0;
    weatherFlashTime = 0;
  }
  weatherLightningTime = Math.max(0, weatherLightningTime - dt);
  weatherFlashTime = Math.max(0, weatherFlashTime - dt);
  weatherBolt.visible = storm > 0.43 && weatherLightningTime > 0;
  weatherBoltMaterial.opacity = weatherLightningTime > 0 ? Math.min(0.95, weatherLightningTime * 5) : 0;
  weatherLightning.position.copy(weatherCameraPosition);
  weatherLightning.intensity = weatherLightningTime > 0 ? 3.4 * storm * Math.min(1, weatherLightningTime * 8) : 0;
  weatherFlash.visible = storm > 0.43 && weatherFlashTime > 0;
  weatherFlashMaterial.opacity = weatherFlashTime > 0 ? 0.23 * storm * Math.min(1, weatherFlashTime * 8) : 0;
}
if (weatherToggle) {
  weatherToggle.checked = save.weatherEnabled;
  weatherToggle.addEventListener('change', () => {
    save.weatherEnabled = weatherToggle.checked;
    persist();
    if (!save.weatherEnabled) hideWeatherEffects();
  });
}
const sectorGridToggle = $('sector-grid-enabled');
sectorGridToggle?.addEventListener('change', () => {
  sectorGridVisible = sectorGridToggle.checked;
  if (sectorGridGroup) sectorGridGroup.visible = sectorGridVisible;
});
const reducedGraphicsToggle = $('reduced-graphics-enabled');
if (reducedGraphicsToggle) reducedGraphicsToggle.checked = save.reducedGraphics;
reducedGraphicsToggle?.addEventListener('change', () => {
  save.reducedGraphics = reducedGraphicsToggle.checked;
  persist();
  applyRenderQuality();
});
$('pause-btn')?.addEventListener('click', () => setPaused(!paused));
$('pause-resume')?.addEventListener('click', () => setPaused(false));
$('field-map-close')?.addEventListener('click', () => toggleFieldMap(false));
$('field-map-overlay')?.addEventListener('click', event => {
  if (event.target === $('field-map-overlay')) toggleFieldMap(false);
});
$('live-warmap')?.addEventListener('click', event => {
  if (!isGreatWarSinglePlayer() || !roundInProgress) return;
  const canvas = event.currentTarget;
  const rect = canvas.getBoundingClientRect();
  const px = (event.clientX - rect.left) * canvas.width / rect.width;
  const py = (event.clientY - rect.top) * canvas.height / rect.height;
  const field = (FIELDS[sel.map] || []).find(candidate => candidate.team === sel.team && candidate.disabled && Math.hypot(px - mapCanvasX(candidate.x, canvas.width), py - mapCanvasY(candidate.z, canvas.height)) < 30);
  if (field) orderAirfieldRebuild(field);
});
for (const group of ['music', 'general', 'weapons']) {
  const slider = $(`audio-${group}`);
  const readout = $(`audio-${group}-value`);
  slider?.addEventListener('input', () => {
    save.audioSettings[group] = THREE.MathUtils.clamp(Number(slider.value) / 100, 0, 1);
    if (readout) readout.textContent = `${Math.round(save.audioSettings[group] * 100)}%`;
    applyAudioSettings();
  });
  slider?.addEventListener('change', persist);
}
$('pause-hq')?.addEventListener('click', () => {
  setPaused(false);
  roundInProgress = false;
  gameGen++;
  showMenu();
});
function say(text) {
  $('msg').textContent = text;
  msgT = 3;
}
function feed(text, tone = 'neutral') {
  const box = $('killfeed');
  const line = document.createElement('div');
  const safeTone = ['victory', 'defeat', 'crash', 'neutral'].includes(tone) ? tone : 'neutral';
  line.className = `killfeed-line ${safeTone}`;
  line.textContent = text;
  box.appendChild(line);
  while (box.children.length > 5) box.firstElementChild.remove();
  setTimeout(() => line.remove(), 6500);
}
function cashAdd(n, why) {
  const amount = Math.max(0, Math.floor(Number(n) || 0));
  const economy = activeEconomy();
  economy.cash = (Number(economy.cash) || 0) + amount;
  score += amount;
  sortieEarnings.push({
    amount,
    reason: String(why || 'Sortie bounty')
  });
  save.career.cashEarned += amount;
  persist();
  say(`${why} +$${amount}`);
}
function recordCareerCounter(key, amount = 1) {
  const increment = Math.max(0, Math.floor(Number(amount) || 0));
  if (!increment) return 0;
  save.career[key] = Math.max(0, Math.floor(Number(save.career[key]) || 0)) + increment;
  persist();
  checkCareerRibbonAwards();
  return save.career[key];
}
function recordCareerBattleVictory() {
  recordCareerCounter('battleVictories');
}
function recordCareerKill(kind) {
  const key = `${kind}Kills`;
  save.career[key] = Math.max(0, Math.floor(Number(save.career[key]) || 0)) + 1;
  if (kind === 'aircraft') {
    const team = sel.team === 'red' ? 'red' : 'blue';
    save.career.teamAircraftKills[team] = Math.max(0, Math.floor(Number(save.career.teamAircraftKills[team]) || 0)) + 1;
  }
  persist();
  checkCareerRibbonAwards();
  if (kind === 'aircraft') {
    const next = save.career.aircraftKills;
    const unlocked = INSIGNIA.find(item => item.unlockAt === next);
    if (unlocked) {
      const finalUnlock = next === INSIGNIA[INSIGNIA.length - 1].unlockAt;
      say(finalUnlock ? 'SQUADRON COLLECTION COMPLETE — all 20 insignia unlocked!' : `${next} CONFIRMED KILLS — ${unlocked.name} insignia unlocked!`);
      feed(finalUnlock ? 'SQUADRON COLLECTION COMPLETE · all 20 aircraft insignia are yours' : `INSIGNIA UNLOCKED · ${unlocked.name} is available in the shop`);
    }
  }
}
const RIBBON_METALS = [{
  id: 'silver',
  label: 'SILVER',
  targetIndex: 0
}, {
  id: 'gold',
  label: 'GOLD',
  targetIndex: 1
}, {
  id: 'onyx',
  label: 'ONYX',
  targetIndex: 2
}];
const RIBBON_FAMILIES = [{
  id: 'dual-faction-victories',
  title: 'Two-Flag Air Service',
  unit: 'aircraft victories',
  progress: career => career.aircraftKills,
  thresholds: [100, 250, 500],
  eligible: career => career.teamAircraftKills.blue > 0 && career.teamAircraftKills.red > 0,
  requirement: 'Requires at least one confirmed aircraft victory for each faction.',
  colors: ['#315d91', '#eee2bf', '#a34737', '#eee2bf', '#315d91']
}, {
  id: 'ground-vehicles',
  title: 'Ground Vehicle Destroyer',
  unit: 'ground vehicles',
  progress: career => career.groundVehicleKills,
  thresholds: [10, 25, 50],
  colors: ['#56513d', '#c9b27c', '#34372f', '#c9b27c', '#56513d']
}, {
  id: 'trains',
  title: 'Railway Raider',
  unit: 'trains',
  progress: career => career.trainKills,
  thresholds: [5, 10, 25],
  colors: ['#343c3e', '#b18c58', '#6c4732', '#b18c58', '#343c3e']
}, {
  id: 'sea-vehicles',
  title: 'Sea Raider',
  unit: 'sea vehicles',
  progress: career => career.shipKills + career.convoyKills,
  thresholds: [10, 25, 50],
  colors: ['#31516b', '#d0c6a7', '#527987', '#d0c6a7', '#31516b']
}, {
  id: 'aircraft-victories',
  title: 'Aircraft Victory',
  unit: 'aircraft victories',
  progress: career => career.aircraftKills,
  thresholds: [100, 300, 700],
  colors: ['#8b342c', '#e4c677', '#436a91', '#e4c677', '#8b342c']
}, {
  id: 'battle-victories',
  title: 'Battle Victory',
  unit: 'battle victories',
  progress: career => career.battleVictories,
  thresholds: [10, 20, 50],
  colors: ['#7a5c32', '#ead9a5', '#374c5b', '#ead9a5', '#7a5c32']
}, {
  id: 'factories',
  title: 'Factory Destroyer',
  unit: 'factories',
  progress: career => career.factoryKills,
  thresholds: [5, 10, 25],
  colors: ['#744638', '#d0b384', '#45423a', '#d0b384', '#744638']
}, {
  id: 'bases',
  title: 'Airfield Conqueror',
  unit: 'bases',
  progress: career => career.baseKills,
  thresholds: [3, 7, 12],
  colors: ['#315d91', '#d2b66e', '#8b342c', '#d2b66e', '#315d91']
}, {
  id: 'captured-grids',
  title: 'Frontline Capturer',
  unit: 'captured grids',
  progress: career => career.sectorsCaptured,
  thresholds: [5, 20, 50],
  colors: ['#315d91', '#eee2bf', '#a34737', '#eee2bf', '#315d91']
}, {
  id: 'bonanza-mvp',
  title: 'Champion of the Skies',
  unit: 'Bonanza MVP finishes',
  progress: career => career.bonanzaMvp,
  thresholds: [1, 5, 25],
  colors: ['#d84c37', '#f0d072', '#f2eee2', '#426e9c', '#d84c37']
}];
const RIBBON_CATALOG = {};
for (const family of RIBBON_FAMILIES) {
  for (const metal of RIBBON_METALS) {
    const target = family.thresholds[metal.targetIndex];
    const id = `${family.id}-${metal.id}`;
    RIBBON_CATALOG[id] = {
      title: `${family.title} ${metal.label[0]}${metal.label.slice(1).toLowerCase()} Ribbon`,
      description: `${family.title} ${metal.label.toLowerCase()} tier. Reach ${target} ${family.unit}.${family.requirement ? ` ${family.requirement}` : ''}`,
      colors: family.colors,
      familyId: family.id,
      target,
      metal: metal.id,
      requirement: family.requirement || ''
    };
  }
}
RIBBON_CATALOG['courier-service'] = {
  title: 'Dispatch Service Ribbon',
  description: 'Awarded for completing a city-to-airfield courier dispatch and delivering the orders safely to a friendly field.',
  colors: ['#8b6937', '#eee2bf', '#426e9c', '#eee2bf', '#8b6937']
};
function checkCareerRibbonAwards() {
  for (const family of RIBBON_FAMILIES) {
    const progress = Math.max(0, Math.floor(Number(family.progress(save.career)) || 0));
    if (family.eligible && !family.eligible(save.career)) continue;
    for (const metal of RIBBON_METALS) {
      const id = `${family.id}-${metal.id}`;
      const ribbon = RIBBON_CATALOG[id];
      const legacyBlackAward = metal.id === 'onyx' ? Number(save.career.ribbonAwards[`${family.id}-black`]) || 0 : 0;
      const awards = Math.max(0, Math.floor(Number(save.career.ribbonAwards[id]) || legacyBlackAward));
      if (progress >= ribbon.target && awards < 1) recordRibbonAward(id);
    }
  }
}
function ribbonMedal(ribbon) {
  const metalClass = ribbon.metal ? ` metal-${ribbon.metal}` : '';
  return `<span class="ribbon-medal${metalClass}" style="--ribbon-stripes:repeating-linear-gradient(90deg,${ribbon.colors.join(',')})">★</span>`;
}
function ribbonLaneMarkup(family) {
  const progress = Math.max(0, Math.floor(Number(family.progress(save.career)) || 0));
  const eligible = !family.eligible || family.eligible(save.career);
  let earnedTier = -1;
  if (eligible) family.thresholds.forEach((threshold, index) => {
    if (progress >= threshold) earnedTier = index;
  });
  const shownTier = Math.max(0, earnedTier);
  const metal = RIBBON_METALS[shownTier];
  const ribbon = RIBBON_CATALOG[`${family.id}-${metal.id}`];
  let status;
  if (!eligible) {
    status = `${progress.toLocaleString()} / ${family.thresholds[0].toLocaleString()} ${family.unit.toUpperCase()} · BOTH FACTIONS REQUIRED`;
  } else if (earnedTier < 0) {
    status = `${metal.label} · ${progress.toLocaleString()} / ${family.thresholds[0].toLocaleString()} ${family.unit.toUpperCase()}`;
  } else if (earnedTier < family.thresholds.length - 1) {
    const nextMetal = RIBBON_METALS[earnedTier + 1];
    status = `${metal.label} EARNED · ${progress.toLocaleString()} / ${family.thresholds[earnedTier + 1].toLocaleString()} ${family.unit.toUpperCase()} TO ${nextMetal.label}`;
  } else {
    status = `${metal.label} · HIGHEST TIER · ${progress.toLocaleString()} ${family.unit.toUpperCase()}`;
  }
  return `<div class="ribbon-lane ${earnedTier >= 0 ? 'is-earned' : 'is-locked'}" title="${escapeHTML(ribbon.description)}">${ribbonMedal(ribbon)}<span><b>${escapeHTML(family.title)}</b><small>${escapeHTML(status)}</small></span></div>`;
}
function courierRibbonLane() {
  const ribbon = RIBBON_CATALOG['courier-service'];
  const count = Math.max(0, Math.floor(Number(save.career.ribbonAwards['courier-service']) || 0));
  const status = count ? `AWARDED · ${count.toLocaleString()} DISPATCHES` : 'COMPLETE A COURIER DISPATCH TO EARN';
  return `<div class="ribbon-lane ${count ? 'is-earned' : 'is-locked'}" title="${escapeHTML(ribbon.description)}">${ribbonMedal(ribbon)}<span><b>${escapeHTML(ribbon.title)}</b><small>${status}</small></span></div>`;
}
function playerRibbonCase() {
  const ribbons = `${RIBBON_FAMILIES.map(ribbonLaneMarkup).join('')}${courierRibbonLane()}`;
  return `<section class="career-ribbon-case"><header><h2>RIBBON CASE</h2><small>CAREER MILESTONES · SILVER → GOLD → ONYX</small></header><div class="career-ribbon-grid">${ribbons}</div></section>`;
}
checkCareerRibbonAwards();
function showIntel() {
  if (mode !== 'foot' || paused) return;
  const aceList = ACE_PILOTS.map(ace => `<li>${escapeHTML(ace.name)}</li>`).join('');
  $('intel-content').innerHTML = `<section><h3>THEATERS &amp; TARGETS</h3><p><b>TRENCHES · Western Front:</b> fight above the front line, destroy enemy factories and airfields, and watch for trains, ground vehicles and the blimp.</p><p><b>FJORDS · Stranda:</b> steep mountain terrain and narrow water corridors; attack ships and supply vessels, and keep clear of the ridges.</p><p><b>PLAYROOM · Bedroom front:</b> a compact indoor arena with tight boundaries, close airfields and short-range engagements.</p></section><section><h3>STEERING &amp; COMBAT</h3><p><b>Touch:</b> drag the left half to walk or steer your aircraft (up/down pitch, left/right roll); drag the right half to look. Use the on-screen FIRE, BOMB, Emergency Land and Bail Out buttons.</p><p><b>Desktop:</b> WASD steers, Space fires, B drops bombs, E boards/interacts and starts or cancels an emergency landing at low altitude; right mouse drag looks around. On foot, Space jumps, F gestures (in either POV), and C changes POV. C switches between cockpit and chase views while piloting. M opens the live sector map, P pauses/resumes, and Escape closes the map or toggles pause.</p><p><b>Emergency landing:</b> below 72m, tap Emergency Land or press E to begin a controlled approach. Slow down, keep the aircraft level and aim for broad, reasonably flat ground; rough terrain, excess speed or a hard sink can still destroy you. A safe touchdown leaves the aircraft grounded and vulnerable, but you can board/taxi and take off again. This does not repair or refuel; use E over a friendly runway to land and refuel.</p><p><b>Wreck caches:</b> look for smoky crash sites on the Trenches and Fjords maps. Search one on foot or taxi within 13m for field salvage; one cache per sortie is a downed unidentified craft with rare star-metal worth $700–$1,000. Caches expire, so search promptly.</p><p><b>Sector signals:</b> capture a neighboring sector after a safe emergency landing, then leave your aircraft and hold beside the pole for five seconds. The raised team flag is shown on the minimap; your pilot fires a colored signal flare that glows and smokes above the front. Downed NPCs may also glide to an adjacent sector and capture it when their parachute lands within 100m of its pole.</p><p>In a two-seater, use the seat button to switch roles. The rear-gunner mouse aim follows normal cursor movement; hold fire while adjusting your sight.</p></section><section><h3>SHOP &amp; FIELD SERVICES</h3><p>Use the <b>SHOP</b> button at the runway or visit the marked shop building. Buy permanent aircraft, accuracy, damage, health and armour upgrades; sortie bonuses last for one flight. Cash comes from confirmed kills and time aloft.</p><p>The <b>DEBRIEF</b> office records your career, aircraft kills/deaths, streaks, earnings, ace victories and ribbons.</p></section><section><h3>BOUNTIES &amp; RIVALS</h3><p>Scout $150 · Bomber $200 · Blimp $50 · Warship $150 · Supply vessel $90. Killstreaks add bonus cash.</p><p>Named enemy aces may appear: ${aceList}</p></section>`;
  $('intel-overlay').style.display = 'grid';
  $('intel-overlay').setAttribute('aria-hidden', 'false');
  setPaused(true);
  $('intel-close').focus();
}
function closeIntel() {
  $('intel-overlay').style.display = 'none';
  $('intel-overlay').setAttribute('aria-hidden', 'true');
  if (paused) setPaused(false);
}
function showDebrief() {
  mode = 'debrief';
  const c = save.career;
  const m = $('menu');
  m.style.display = 'block';
  m.style.background = '#1c1810ed';
  const kd = c.deaths ? (c.aircraftKills / c.deaths).toFixed(2) : c.aircraftKills ? '∞' : '0.00';
  const aircraftName = PLANES[sel.team].find(plane => plane.id === sel.plane)?.name || 'Squadron aircraft';
  const eligibleNames = INSIGNIA.filter(item => c.aircraftKills >= item.unlockAt).map(item => item.name);
  m.innerHTML = `<h1>FIELD DEBRIEFING</h1><p style="letter-spacing:2px">${escapeHTML(sel.name || 'PILOT')} · ${sel.team.toUpperCase()} SQUADRON</p>
    <div aria-label="Aircraft preview" style="height:185px;max-width:620px;margin:0 auto 8px;position:relative;background:linear-gradient(180deg,rgba(20,17,13,.04),rgba(20,17,13,.24));border:1px solid #76633e;border-radius:10px;display:grid;place-items:start center;pointer-events:none"><b style="margin-top:10px;text-shadow:0 2px 5px #000">${aircraftName} · sortie aircraft</b></div>
    <div style="display:flex;justify-content:center;flex-wrap:wrap;gap:10px;margin:14px"><b>Aircraft K/D&nbsp; ${c.aircraftKills}/${c.deaths} (${kd})</b><b>Sorties&nbsp; ${c.sorties}</b><b>Best streak&nbsp; ${c.bestStreak}</b><b>War chest earned&nbsp; $${c.cashEarned}</b><b>Aces defeated&nbsp; ${c.aceDefeats}</b></div>
    <div style="display:flex;justify-content:center;flex-wrap:wrap;gap:10px"><b>Bombers&nbsp; ${c.bomberKills}</b><b>Blimps&nbsp; ${c.blimpKills}</b><b>Warships&nbsp; ${c.shipKills}</b><b>Ground vehicles&nbsp; ${c.groundVehicleKills}</b><b>Sectors captured&nbsp; ${c.sectorsCaptured}</b><b>Courier deliveries&nbsp; ${c.courierDeliveries}</b><b>Current balance&nbsp; $${activeEconomy().cash}</b></div>
    ${playerRibbonCase()}
    <p>Convoy vessels destroyed&nbsp; ${c.convoyKills}</p>
    <p style="opacity:.85">Aircraft insignia unlocked (${eligibleNames.length}/20): ${eligibleNames.length ? eligibleNames.join(' · ') : 'none yet'}. ${eligibleNames.length === INSIGNIA.length ? 'All permanent insignia rewards complete.' : 'Earn one for every 25 confirmed aircraft downs.'}</p>
    <button data-a="close-debrief:1">Exit debrief · Return to airfield</button>`;
  refreshShopPreview();
}
function showPlayerProfile() {
  const c = save.career;
  const m = $('menu');
  const total = value => Math.max(0, Math.floor(Number(value) || 0));
  const number = value => total(value).toLocaleString();
  const kd = c.deaths ? (c.aircraftKills / c.deaths).toFixed(2) : c.aircraftKills ? '∞' : '0.00';
  const unlockedInsignia = INSIGNIA.filter(item => c.aircraftKills >= item.unlockAt);
  const pilotName = escapeHTML(sel.typed || save.pilotName || sel.name || 'ROOKIE PILOT');
  const statCard = (value, label) => `<article><strong>${value}</strong><small>${label}</small></article>`;
  const recordItem = (label, value) => `<div><span>${label}</span><b>${value}</b></div>`;
  m.style.display = 'block';
  m.style.background = '#1c1810ed';
  m.scrollTop = 0;
  menuPilotPreview.visible = false;
  m.innerHTML = `<div class="player-profile">
    <header class="profile-heading"><div><small>PILOT DOSSIER · LOCAL CAREER RECORD</small><h1>${pilotName}</h1><p>${escapeHTML(factionName(sel.team))} · SQUADRON CAREER</p></div><button type="button" data-a="profile-back:1">BACK TO HQ</button></header>
    <section class="profile-stat-grid" aria-label="Career statistics">
      ${statCard(number(c.aircraftKills), 'AIRCRAFT VICTORIES')}${statCard(number(c.deaths), 'AIRCRAFT LOSSES')}${statCard(kd, 'VICTORY / LOSS RATIO')}${statCard(number(c.sorties), 'SORTIES FLOWN')}${statCard(number(c.bestStreak), 'BEST KILLSTREAK')}${statCard(`$${number(c.cashEarned)}`, 'CAREER EARNINGS')}
    </section>
    <div class="profile-columns">
      <section class="profile-record"><h2>TARGET RECORD</h2>${recordItem('Bomber aircraft', number(c.bomberKills))}${recordItem('Blimps destroyed', number(c.blimpKills))}${recordItem('Warships destroyed', number(c.shipKills))}${recordItem('Convoy vessels destroyed', number(c.convoyKills))}${recordItem('Sea vehicles destroyed · ribbon tally', number(c.shipKills + c.convoyKills))}${recordItem('Ground vehicles destroyed', number(c.groundVehicleKills))}${recordItem('Trains destroyed', number(c.trainKills))}${recordItem('Factories destroyed', number(c.factoryKills))}${recordItem('Enemy airfields destroyed', number(c.baseKills))}${recordItem('Enemy aces defeated', number(c.aceDefeats))}</section>
      <section class="profile-record"><h2>SERVICE &amp; HONOURS</h2>${recordItem('Frontline sectors captured', number(c.sectorsCaptured))}${recordItem('Courier dispatches delivered', number(c.courierDeliveries))}${recordItem('Battle victories', number(c.battleVictories))}${recordItem('Aircraft victories · Aurelian', number(c.teamAircraftKills.blue))}${recordItem('Aircraft victories · Vesperian', number(c.teamAircraftKills.red))}${recordItem('Bonanza wins', number(c.bonanzaWins))}${recordItem('Bonanza victories', number(c.bonanzaKills))}${recordItem('Bonanza assists', number(c.bonanzaAssists))}${recordItem('Current war chest', `$${number(save.cash)}`)}</section>
    </div>
    ${playerRibbonCase()}
    <section class="profile-record profile-insignia"><h2>AIRCRAFT INSIGNIA · ${unlockedInsignia.length}/${INSIGNIA.length}</h2><p>${unlockedInsignia.length ? unlockedInsignia.map(item => escapeHTML(item.name)).join(' · ') : 'No insignia unlocked yet. Earn one for every 25 confirmed aircraft victories.'}</p></section>
    <p class="profile-footnote">Your career record and decorations are saved on this device.</p>
  </div>`;
}

// ---------- Menu ----------
function installSpawnMap(cv) {
  if (!cv) return;
  drawWarMap(cv);
  cv.addEventListener('click', event => {
    const rect = cv.getBoundingClientRect();
    const px = (event.clientX - rect.left) * cv.width / rect.width;
    const py = (event.clientY - rect.top) * cv.height / rect.height;
    FIELDS[sel.map].forEach((field, index) => {
      const fx = mapCanvasX(field.x, cv.width);
      const fy = mapCanvasY(field.z, cv.height);
      if (!fieldAvailableToPlayer(field) || Math.hypot(px - fx, py - fy) >= 29) return;
      if (field.disabled) {
        say(`${field.name} destroyed by bombing — choose another available airfield`);
        return;
      }
      startGame(index);
    });
  });
}
function showSpawnMenu() {
  sel.spawnOnly = true;
  showMenu();
}
function showMenu() {
  if (paused) setPaused(false);
  mode = 'menu';
  syncPauseUI();
  spectator.active = false;
  clearSpectatorSelection();
  $('spectate-controls').style.display = 'none';
  input.ePressed = false;
  input.keys.KeyE = false;
  stopEngineAudio();
  stopTruckAudio();
  groundedAfterBailout = false;
  clearRecoveryCaches();
  mountedFlak = null;
  $('actions').innerHTML = '';
  $('center').innerHTML = '';
  const m = $('menu');
  m.style.display = 'block';
  const networkStatus = $('net-status');
  if (networkStatus) networkStatus.style.display = 'none';
  const btn = (label, on, cls = '') => `<button class="${cls}" data-a="${on}">${label}</button>`;
  sel.map = sel.map || 'trenches';
  const mapName = {
    trenches: 'trenches',
    stranda: 'fjords',
    bedroom: 'playroom'
  }[sel.map] || 'trenches';
  const mapCanvas = '<canvas id="warmap" width="680" height="440" aria-label="Battle map: tap an available airfield to spawn" style="display:block;width:min(92vw,680px);height:auto;margin:8px auto 16px;border-radius:6px;box-shadow:0 4px 16px #000;cursor:pointer;touch-action:manipulation"></canvas>';
  titleFx.visible = true;
  menuPilotPreview.visible = false;
  if (!sel.entered) {
    sel.spawnOnly = false;
    m.style.background = 'transparent';
    m.innerHTML = `<h1 style="font-size:64px;letter-spacing:8px;margin-top:20vh;text-shadow:0 4px 12px #000">TRENCHWING</h1><p style="max-width:760px;margin:12px auto 24px;letter-spacing:2px;line-height:1.6;text-shadow:0 2px 6px #000">CLAIM YOUR PLACE AMONG THE ACES OF THE GREAT WAR</p>${btn('Take part in history', 'enter:1')}<small style="position:fixed;left:0;right:0;bottom:7px;color:#f4ead2;font:10px Georgia,serif;letter-spacing:.08em;opacity:.62;pointer-events:none">version ${VERSION}</small>`;
    return;
  }
  m.style.background = '#1c1810c0';
  if (sel.spawnOnly) {
    m.innerHTML = `<h1>SELECT SPAWN POINT</h1><p>Choose one of your ${mapName} airfields to return to the sortie.</p>${mapCanvas}<button data-a="spawn-back:1" style="min-width:140px">Back to HQ</button>`;
    if (sel.map === 'trenches' && !CRATERS.length) buildMap();
    installSpawnMap($('warmap'));
    return;
  }
  const modeDescription = sel.gameMode === 'bonanza' ? 'Everyone is an enemy. Random aircraft and paint take off from airfields across the map; airport weapon locks keep the runway safe.' : sel.gameMode === 'squadbattle' ? 'Four teams of three aircraft. Fight every other color; repaint your aircraft in the hangar and your whole squad will match.' : 'Great War · the classic two-faction battle for the front. Coordinate with your squadron and break the enemy line.';
  let h = `<h1>TRENCHWING</h1><p>${'Career funds'}: $${activeEconomy().cash}</p><h3>SORTIE MODE</h3><section class="mode-choice"><button type="button" data-a="mode:squadron" class="${sel.gameMode === 'squadron' ? 'sel' : ''}" aria-pressed="${sel.gameMode === 'squadron'}">GREAT WAR</button><button type="button" data-a="mode:squadbattle" class="${sel.gameMode === 'squadbattle' ? 'sel' : ''}" aria-pressed="${sel.gameMode === 'squadbattle'}">SQUAD BATTLE</button><button type="button" data-a="mode:bonanza" class="${sel.gameMode === 'bonanza' ? 'sel' : ''}" aria-pressed="${sel.gameMode === 'bonanza'}">BONANZA</button><p>${modeDescription}</p></section>`;
  h += `<div class="hq-profile-entry">${btn('PILOT PROFILE · STATS &amp; RIBBONS', 'profile:1')}</div>`;
  if (sel.gameMode === 'squadbattle') {
    h += `<h3>Choose your color squad · 3 aircraft</h3><div class="squad-color-choices">${SQUAD_TEAM_NAMES.map((name, index) => `<button type="button" data-a="squad:${index}" class="${sel.squadTeam === index ? 'sel' : ''}" style="--squad-color:${getSquadTeamColor(index)}" aria-pressed="${sel.squadTeam === index}"><i></i>${name} SQUAD</button>`).join('')}</div><p>Repaint in the hangar to give your aircraft and both wingmates the same squad color.</p>`;
  } else {
    h += '<h3>Faction</h3>';
    h += btn(factionName('blue'), 'team:blue', sel.team === 'blue' ? 'sel' : '') + btn(factionName('red'), 'team:red', sel.team === 'red' ? 'sel' : '');
  }
  h += `<div id="pilot-preview-slot" class="pilot-preview-slot" aria-label="Pilot appearance preview"></div><div style="display:flex;justify-content:center;gap:8px;margin:0 auto 8px"><button type="button" data-a="gender:male" class="${sel.pilotGender === 'male' ? 'sel' : ''}" aria-label="Male pilot" title="Male pilot">♂</button><button type="button" data-a="gender:female" class="${sel.pilotGender === 'female' ? 'sel' : ''}" aria-label="Female pilot" title="Female pilot">♀</button></div><h3>Pilot name</h3><input id="pname" maxlength="20" placeholder="Random ${sel.pilotGender === 'female' ? 'female' : sel.team === 'blue' ? 'Allied' : 'German'} name" value="${(sel.typed || '').replace(/[<>&\"]/g, '')}" style="pointer-events:auto;font:16px Georgia;padding:8px;border-radius:8px;width:220px">`;
  h += '<h3>Choose theater</h3>' + (btn('trenches', 'map:trenches', sel.map === 'trenches' ? 'sel' : '') + btn('fjords', 'map:stranda', sel.map === 'stranda' ? 'sel' : '') + btn('playroom', 'map:bedroom', sel.map === 'bedroom' ? 'sel' : ''));
  h += `<h3 style="margin-bottom:4px">Select spawn point</h3>${mapCanvas}`;
  h += `<div style="margin:-5px auto 18px"><button data-a="spectate:1" style="min-width:210px;background:#5b482b;border-color:#e3c47d">Spectate battlefield</button></div>`;
  const selectedDuration = sel.gameMode === 'bonanza' ? sel.bonanzaMinutes : sel.roundMinutes;
  const durationMax = sel.gameMode === 'bonanza' ? 10 : 30;
  const squadCapacity = sel.gameMode === 'squadbattle' ? '<p><b>Squad strength:</b> 4 teams × 3 aircraft · 12 planes total</p>' : `<label for="squad-size"><b>${sel.gameMode === 'bonanza' ? 'Pilot field' : 'Team strength'}</b> · <span id="squad-size-readout">${sel.squadSize}v${sel.squadSize}</span></label><div style="display:flex;align-items:center;gap:12px;max-width:460px;margin:8px auto"><span>5v5</span><input id="squad-size" type="range" min="5" max="15" step="1" value="${sel.squadSize}" aria-label="Aircraft per faction, 5 to 15" style="flex:1;min-width:130px;pointer-events:auto;accent-color:#c9a96b"><span>15v15</span></div>`;
  const respawnSettings = sel.gameMode === 'squadbattle' ? '' : `<label for="respawn-limit"><b>Maximum respawns per faction</b> · <span id="respawn-readout">${sel.respawnLimit}</span></label><div style="display:flex;align-items:center;gap:12px;max-width:460px;margin:8px auto"><span>10</span><input id="respawn-limit" type="range" min="10" max="200" step="10" value="${sel.respawnLimit}" aria-label="Respawn tickets per faction" style="flex:1;min-width:130px;pointer-events:auto;accent-color:#c9a96b"><span>200</span></div>`;
  h += `<section style="margin:10px auto 18px;padding:10px 14px;max-width:680px;border:1px solid #76633e;border-radius:8px;background:#17140fc9">${squadCapacity}<label for="round-time"><b>${sel.gameMode === 'bonanza' ? 'Bonanza timer' : 'Battle time'}</b> · <span id="round-time-readout">${selectedDuration} min</span></label><div style="display:flex;align-items:center;gap:12px;max-width:460px;margin:8px auto"><span>3</span><input id="round-time" type="range" min="3" max="${durationMax}" step="1" value="${selectedDuration}" aria-label="Round duration in minutes" style="flex:1;min-width:130px;pointer-events:auto;accent-color:#c9a96b"><span>${durationMax} min</span></div>${respawnSettings}<small>${sel.gameMode === 'bonanza' ? 'FFA ends when the clock expires; NPCs use random airfields and runway zones lock weapons.' : sel.gameMode === 'squadbattle' ? 'Squad Battle is a timed four-team free-for-all; squad aircraft respawn to keep each team at three.' : 'Battle time and faction respawn tickets are independent; rear reserve airfields cannot be destroyed.'}</small></section>`;
  m.innerHTML = h;
  updateSelectionPilotPreview();
  if (sel.map === 'trenches' && !CRATERS.length) buildMap();
  installSpawnMap($('warmap'));
}
$('menu').addEventListener('input', event => {
  if (event.target?.id === 'pname') {
    sel.typed = String(event.target.value || '').slice(0, 20);
    save.pilotName = sel.typed;
    persist();
    return;
  }
  if (event.target?.id === 'squad-size') {
    sel.squadSize = THREE.MathUtils.clamp(Math.round(Number(event.target.value) || 10), 5, MAX_SQUAD_SIZE);
    const readout = $('squad-size-readout');
    if (readout) readout.textContent = `${sel.squadSize}v${sel.squadSize}`;
  } else if (event.target?.id === 'round-time') {
    const value = Math.round(Number(event.target.value) || 5);
    if (sel.gameMode === 'bonanza') sel.bonanzaMinutes = THREE.MathUtils.clamp(value, 3, 10);else sel.roundMinutes = THREE.MathUtils.clamp(value, 3, 30);
    const readout = $('round-time-readout');
    if (readout) readout.textContent = `${sel.gameMode === 'bonanza' ? sel.bonanzaMinutes : sel.roundMinutes} min`;
  } else if (event.target?.id === 'respawn-limit') {
    sel.respawnLimit = THREE.MathUtils.clamp(Math.round(Number(event.target.value) || 100), 10, 200);
    const readout = $('respawn-readout');
    if (readout) readout.textContent = String(sel.respawnLimit);
  }
});
$('menu').addEventListener('change', event => {
  if (event.target?.id === 'pname') {
    sel.typed = String(event.target.value || '').slice(0, 20);
    save.pilotName = sel.typed;
    persist();
    return;
  }
  if (!['squad-size', 'round-time', 'respawn-limit'].includes(event.target?.id)) return;
  save.squadSize = sel.squadSize;
  save.roundMinutes = sel.roundMinutes;
  save.bonanzaMinutes = sel.bonanzaMinutes;
  save.respawnLimit = sel.respawnLimit;
  persist();
});
$('menu').addEventListener('click', e => {
  const actionButton = e.target.closest('button[data-a]');
  const a = actionButton?.dataset.a;
  if (!a) return;
  const pn = $('pname');
  if (pn) sel.typed = pn.value;
  const [k, v] = a.split(':');
  if (k === 'mode') {
    if (!['squadron', 'squadbattle', 'bonanza'].includes(v)) return;
    sel.gameMode = v;
    if (v === 'squadbattle') sel.team = squadBaseTeam(sel.squadTeam);
    save.gameMode = v;
    save.team = sel.team;
    persist();
    showMenu();
    return;
  }
  if (k === 'squad') {
    sel.squadTeam = THREE.MathUtils.clamp(Number(v) || 0, 0, 3);
    sel.team = squadBaseTeam(sel.squadTeam);
    save.squadTeam = sel.squadTeam;
    save.team = sel.team;
    persist();
    showMenu();
    return;
  }
  if (k === 'profile') {
    showPlayerProfile();
    return;
  }
  if (k === 'profile-back') {
    showMenu();
    return;
  }
  if (k === 'gender') {
    sel.pilotGender = v === 'female' ? 'female' : 'male';
    save.pilotGender = sel.pilotGender;
    persist();
    showMenu();
    return;
  }
  if (k === 'spectate') {
    const fieldIndex = FIELDS[sel.map].findIndex(field => fieldAvailableToPlayer(field));
    if (fieldIndex < 0) return say('No available runway is open for spectator deployment');
    startGame(fieldIndex, true);
    return;
  }
  if (k === 'spawn-back') {
    sel.spawnOnly = false;
    showMenu();
    return;
  }
  if (k === 'back') {
    {
      void 0;
      showMenu();
    }
    return;
  }
  if (k === 'enter') {
    sel.entered = true;
    sel.spawnOnly = false;
  }
  if (k === 'team') {
    sel.team = v;
    sel.plane = PLANES[v][0].id;
  }
  if (k === 'plane') {
    const p = PLANES[sel.team].find(q => q.id === v);
    const economy = activeEconomy();
    if (!economy.owned.includes(v)) {
      if ((Number(economy.cash) || 0) < p.cost) return say('Not enough cash in this account');
      economy.cash -= p.cost;
      economy.owned.push(v);
      persist();
    }
    sel.plane = v;
  }
  if (k === 'up' && ['acc', 'dmg', 'hp', 'ammo'].includes(v)) {
    const economy = activeEconomy();
    const level = Number(economy[v] || 0);
    const maxLevel = v === 'ammo' ? 2 : 3;
    if (level >= maxLevel) return say('That upgrade is already maxed');
    const cost = upgradeCost(level, v === 'ammo' ? AMMO_BASE_COST : UPGRADE_BASE_COST);
    if ((Number(economy.cash) || 0) < cost) return say('Not enough cash in this account');
    economy.cash -= cost;
    economy[v] = level + 1;
    if (v === 'ammo' && player) {
      const oldCapacity = player.ammoCapacity || 1000;
      player.ammoCapacity = ammoCapacity();
      player.ammo = Math.min(player.ammo + player.ammoCapacity - oldCapacity, player.ammoCapacity);
      if (player.ammo > 0) player.ammoEmptyNotice = false;
    }
    if (player) applyPlayerLoadoutToTeam();
    persist();
  }
  if (k === 'armor') {
    const economy = activeEconomy();
    const level = Number(economy.armor || 0);
    if (level >= 3) return say('Armour is already maxed');
    const cost = upgradeCost(level, ARMOR_BASE_COST);
    if ((Number(economy.cash) || 0) < cost) return say('Not enough cash in this account');
    economy.cash -= cost;
    economy.armor = level + 1;
    if (player) {
      player.maxHits = calcMaxHits();
      applyPlayerLoadoutToTeam();
    }
    persist();
  }
  if (k === 'boost' && !boost[v]) {
    const cost = v === 'fire' ? 150 : 200;
    if ((Number(activeEconomy().cash) || 0) < cost) return say('Not enough cash in this account');
    activeEconomy().cash -= cost;
    boost[v] = true;
    persist();
    if (v === 'armor') player.maxHits = calcMaxHits();
  }
  if (k === 'paint') {
    const economy = activeEconomy();
    if (v === '0') economy.paint = null;else {
      if ((Number(economy.cash) || 0) < 500) return say('Not enough cash in this account');
      economy.cash -= 500;
      economy.paint = $('paintc').value;
    }
    persist();
  }
  if (k === 'custom-clear') {
    const canvas = $('custom-insignia-canvas');
    if (canvas) drawCustomInsigniaBase(canvas);
    return;
  }
  if (k === 'custom-save') {
    const canvas = $('custom-insignia-canvas');
    if (!canvas) return;
    save.customLogo = canvas.toDataURL('image/png');
    save.logo = 'custom';
    persist();
    refitPlane();
    showShop();
    return;
  }
  if (k === 'logo') {
    const insignia = INSIGNIA.find(item => item.id === v);
    if (v === 'custom' && save.customLogo) {
      save.logo = 'custom';
      persist();
    } else if (insignia && save.career.aircraftKills >= insignia.unlockAt) {
      save.logo = v;
      persist();
    }
  }
  if (k === 'close-debrief') {
    playDoorSound();
    $('menu').style.display = 'none';
    mode = 'foot';
    return;
  }
  if (k === 'close') {
    playDoorSound();
    $('menu').style.display = 'none';
    mode = 'foot';
    return;
  }
  if (mode === 'shop' && ['plane', 'armor', 'paint', 'logo'].includes(k)) {
    refitPlane();
    applyPlayerLoadoutToTeam();
  }
  if (k === 'map') sel.map = v;
  if (k === 'spawn') return startGame(+v);
  if ((k === 'team' || k === 'map') && false) void 0;
  if (mode === 'shop') showShop();else showMenu();
});
const boost = {
  fire: false,
  armor: false
};
const calcMaxHits = () => Math.round((8 + (activeEconomy().armor || 0) * 4) * (boost.armor ? 1.5 : 1)) + (PLANES[sel.team].find(plane => plane.id === sel.plane)?.twoSeater ? 2 : 0);
function refitPlane() {
  const pos = player.g.position.clone();
  const remainingAmmo = player.ammo;
  const ammoEmptyNotice = player.ammoEmptyNotice;
  scene.remove(player.g);
  planes = planes.filter(p => p !== player);
  player = buildPlayerPlane();
  player.maxHits = calcMaxHits();
  player.ammo = Math.min(remainingAmmo, player.ammoCapacity);
  player.ammoEmptyNotice = ammoEmptyNotice;
  player.g.position.copy(pos);
  planes.push(player);
}
function nearbyFriendlyRunway() {
  const fullyStocked = player && player.ammo >= player.ammoCapacity && (!player.twoSeater || player.bombs >= player.bombCapacity && !player.rearGunnerWounded);
  if (!player || !planes.includes(player) || player.dying || player.abandoned || fullyStocked) return null;
  const position = player.g.position;
  if (position.y - heightAt(position.x, position.z) >= 10) return null;
  let nearest = null;
  for (const field of FIELDS[sel.map]) {
    if (field.team !== sel.team || field.disabled) continue;
    const local = position.clone().sub(new THREE.Vector3(field.x, position.y, field.z)).applyAxisAngle(new THREE.Vector3(0, 1, 0), -fieldRunwayHeading(field));
    const laneCenters = runwayLaneOffsets();
    const halfWidth = sel.map === 'bedroom' ? 12 : 10;
    for (const lane of laneCenters) {
      const runwayX = THREE.MathUtils.clamp(local.x - lane, -halfWidth, halfWidth) + lane;
      const runwayZ = THREE.MathUtils.clamp(local.z, -73, 73);
      const distance = Math.hypot(local.x - runwayX, local.z - runwayZ);
      if (distance < 100 && (!nearest || distance < nearest.distance)) nearest = {
        field,
        distance,
        lane
      };
    }
  }
  return nearest;
}
function drawCustomInsigniaBase(canvas) {
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#eee4d1';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = '#9a7850';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(canvas.width / 2, canvas.height / 2, canvas.width * 0.43, 0, Math.PI * 2);
  ctx.stroke();
}
function showShop() {
  mode = 'shop';
  const m = $('menu');
  m.style.display = 'block';
  m.style.background = '#1c1810aa';
  const btn = (label, on, cls = '') => `<button class="${cls}" data-a="${on}">${label}</button>`;
  const factionName = sel.team === 'blue' ? 'ALLIED SQUADRON' : 'CENTRAL POWERS';
  const economy = activeEconomy();
  const previewName = PLANES[sel.team].find(plane => plane.id === sel.plane)?.name || 'Squadron aircraft';
  let h = `<div class="shop-shell">
    <header class="shop-header"><div><div class="shop-kicker">${factionName} · FIELD QUARTERMASTER</div><h1>HANGAR &amp; SUPPLY</h1><p>Choose your aircraft, improve your kit, and prepare for the next sortie.</p></div><div class="shop-header-actions"><div class="shop-balance"><small>${'CAREER FUNDS'}</small><strong>$${economy.cash}</strong></div>${btn('Leave shop', 'close:1')}</div></header>
    <div class="shop-preview" aria-label="Rotating aircraft preview"><b>${previewName}</b><small>Selected aircraft · preview rotates</small></div>
    <section class="shop-section"><div class="shop-section-heading"><div><span class="shop-step">01</span><h2>Aircraft collection</h2></div><p>Prestige aircraft are permanent once purchased.</p></div><div class="shop-aircraft-grid">`;
  for (const p of PLANES[sel.team]) {
    const owned = economy.owned.includes(p.id);
    const selected = sel.plane === p.id;
    const status = selected ? 'CURRENT AIRCRAFT' : owned ? 'IN COLLECTION' : 'PRESTIGE AIRCRAFT';
    const price = owned ? 'OWNED' : `$${p.cost}`;
    const armor = p.armor ? `${Math.round(p.armor * 100)}% reinforced` : 'standard frame';
    h += `<article class="shop-card shop-aircraft-card${selected ? ' is-selected' : ''}"><div class="shop-card-top"><span class="shop-tag">${status}</span><strong>${price}</strong></div><h3>${p.name}</h3><p class="shop-card-detail">Speed ${p.speed} · Handling ${p.turn.toFixed(1)} · ${armor}${p.bomber ? ' · bomber' : p.twoSeater ? ' · two seats · 2 bombs · rear gunner' : ''}</p>${btn(selected ? 'Selected for sortie' : owned ? 'Select aircraft' : `Purchase aircraft · $${p.cost}`, `plane:${p.id}`, selected ? 'sel' : '')}</article>`;
  }
  h += '</div></section><div class="shop-columns"><div class="shop-column">';
  h += '<section class="shop-section"><div class="shop-section-heading"><div><span class="shop-step">02</span><h2>Permanent improvements</h2></div><p>Career upgrades · prices double each level.</p></div><div class="shop-upgrade-grid">';
  const upgradeCard = (key, label, detail, base = UPGRADE_BASE_COST, maxLevel = 3) => {
    const level = Number(economy[key] || 0);
    const maxed = level >= maxLevel;
    const cost = upgradeCost(level, base);
    return `<article class="shop-card shop-upgrade-card"><div class="shop-card-top"><span class="shop-tag">LEVEL ${level}/${maxLevel}</span><strong>${maxed ? 'MAX' : `$${cost}`}</strong></div><h3>${label}</h3><p class="shop-card-detail">${detail}</p>${btn(maxed ? 'Fully upgraded' : `Improve · $${cost}`, `up:${key}`, maxed ? 'sel' : '')}</article>`;
  };
  h += upgradeCard('acc', 'Accuracy', 'Tighten your shot spread.') + upgradeCard('dmg', 'Damage', 'Make each confirmed hit count.') + upgradeCard('hp', 'Health', 'Increase your aircraft’s resilience.');
  const ammoLevel = ammoUpgradeLevel();
  h += upgradeCard('ammo', 'Ammunition', `${ammoCapacity()} rounds carried · +1,000 rounds per upgrade.`, AMMO_BASE_COST, 2);
  const arm = Number(economy.armor || 0);
  h += `<article class="shop-card shop-upgrade-card"><div class="shop-card-top"><span class="shop-tag">LEVEL ${arm}/3</span><strong>${arm >= 3 ? 'MAX' : `$${upgradeCost(arm, ARMOR_BASE_COST)}`}</strong></div><h3>Armour</h3><p class="shop-card-detail">Withstand ${12 + arm * 4} hits before going down.</p>${btn(arm >= 3 ? 'Fully upgraded' : `Reinforce · $${upgradeCost(arm, ARMOR_BASE_COST)}`, 'armor:1', arm >= 3 ? 'sel' : '')}</article>`;
  h += '</div></section>';
  h += '<section class="shop-section"><div class="shop-section-heading"><div><span class="shop-step">03</span><h2>Sortie supplies</h2></div><p>Temporary bonuses expire when this flight ends.</p></div><div class="shop-bonus-grid">';
  h += `<article class="shop-card shop-upgrade-card"><h3>Rapid fire</h3><p class="shop-card-detail">Double your firing rate for this sortie.</p>${btn(boost.fire ? 'Rapid fire equipped ✔' : 'Equip · $150', 'boost:fire', boost.fire ? 'sel' : '')}</article>`;
  h += `<article class="shop-card shop-upgrade-card"><h3>Reinforced sortie</h3><p class="shop-card-detail">Add 50% armour for this sortie.</p>${btn(boost.armor ? 'Extra armour equipped ✔' : 'Equip · $200', 'boost:armor', boost.armor ? 'sel' : '')}</article>`;
  h += '</div></section></div><div class="shop-column">';
  const def = sel.gameMode === 'squadbattle' ? getSquadTeamColor(sel.squadTeam, economy) : sel.team === 'blue' ? '#5b5434' : '#9c2a1f';
  const paintHeading = sel.gameMode === 'squadbattle' ? 'Your aircraft and both wingmates share this squad finish.' : 'Make your aircraft unmistakable.';
  const paintLabel = sel.gameMode === 'squadbattle' ? 'Aircraft & squad finish' : 'Aircraft finish';
  const repaintLabel = sel.gameMode === 'squadbattle' ? 'Repaint squad · $500' : 'Repaint · $500';
  h += `<section class="shop-section"><div class="shop-section-heading"><div><span class="shop-step">04</span><h2>Paint &amp; markings</h2></div><p>${paintHeading}</p></div><div class="shop-paint-controls"><label for="paintc">${paintLabel}</label><input type="color" id="paintc" value="${economy.paint || def}" aria-label="Choose aircraft paint colour"><div class="shop-control-buttons">${btn(repaintLabel, 'paint:1')}${btn('Factory colours · free', 'paint:0')}</div></div></section>`;
  const unlockedInsigniaCount = INSIGNIA.filter(item => save.career.aircraftKills >= item.unlockAt).length;
  h += `<section class="shop-section"><div class="shop-section-heading"><div><span class="shop-step">05</span><h2>Squadron insignia</h2></div><span class="shop-progress">${unlockedInsigniaCount}/20 unlocked</span></div><p class="shop-section-note">Earn a new design for every 25 confirmed aircraft downs.</p><div class="shop-insignia-grid">`;
  for (const badge of INSIGNIA) {
    const unlocked = save.career.aircraftKills >= badge.unlockAt;
    h += `<button data-a="logo:${badge.id}" class="shop-insignia-button${save.logo === badge.id ? ' sel' : ''}" ${unlocked ? '' : 'disabled'} title="${unlocked ? badge.name : `Unlock at ${badge.unlockAt} confirmed aircraft kills`}"><span>${badge.icon} ${badge.name}${save.logo === badge.id ? ' ✔' : ''}</span><small>${unlocked ? 'UNLOCKED' : `${badge.unlockAt} kills`}</small></button>`;
  }
  h += '</div></section></div></div>';
  h += `<section class="shop-section shop-custom-section"><div class="shop-section-heading"><div><span class="shop-step">06</span><h2>Paint your own insignia</h2></div><p>Draw a personal mark and save it to your career.</p></div><canvas id="custom-insignia-canvas" width="256" height="256" aria-label="Draw a custom squadron insignia"></canvas><div class="shop-control-buttons"><label for="insignia-ink">Ink</label><input id="insignia-ink" type="color" value="#8b3026" aria-label="Insignia ink colour">${btn('Clear drawing', 'custom-clear')}${btn(save.logo === 'custom' ? 'Custom insignia equipped ✔' : 'Save &amp; equip insignia', 'custom-save', save.customLogo ? 'sel' : '')}${`<button data-a="logo:custom" ${save.customLogo ? '' : 'disabled'} class="${save.logo === 'custom' ? 'sel' : ''}" style="opacity:${save.customLogo ? 1 : 0.46}">Equip saved drawing</button>`}</div></section>
    <footer class="shop-footer"><span>Press E to close the shop</span>${btn('Exit shop · return to airfield', 'close:1')}</footer>
  </div>`;
  m.innerHTML = h;
  const canvas = $('custom-insignia-canvas');
  const ctx = canvas.getContext('2d');
  drawCustomInsigniaBase(canvas);
  if (save.customLogo) {
    const previous = new Image();
    previous.onload = () => ctx.drawImage(previous, 0, 0, canvas.width, canvas.height);
    previous.src = save.customLogo;
  }
  let drawing = false;
  const point = event => {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) * canvas.width / rect.width,
      y: (event.clientY - rect.top) * canvas.height / rect.height
    };
  };
  canvas.addEventListener('pointerdown', event => {
    event.preventDefault();
    canvas.setPointerCapture(event.pointerId);
    drawing = true;
    const p = point(event);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(p.x + 0.1, p.y + 0.1);
    ctx.strokeStyle = $('insignia-ink').value;
    ctx.lineWidth = 12;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
  });
  canvas.addEventListener('pointermove', event => {
    if (!drawing) return;
    const p = point(event);
    ctx.strokeStyle = $('insignia-ink').value;
    ctx.lineWidth = 12;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
  });
  const stopDrawing = () => {
    drawing = false;
  };
  canvas.addEventListener('pointerup', stopDrawing);
  canvas.addEventListener('pointercancel', stopDrawing);
  canvas.addEventListener('lostpointercapture', stopDrawing);
  refreshShopPreview();
}
const signTex = (() => {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 96;
  const x = c.getContext('2d');
  x.fillStyle = '#e8d8a8';
  x.fillRect(0, 0, 256, 96);
  x.strokeStyle = '#3a2a18';
  x.lineWidth = 8;
  x.strokeRect(4, 4, 248, 88);
  x.fillStyle = '#7a1e14';
  x.font = 'bold 64px Georgia';
  x.textAlign = 'center';
  x.fillText('SHOP', 128, 70);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
})();
const debriefTex = (() => {
  const c = document.createElement('canvas');
  c.width = 320;
  c.height = 96;
  const x = c.getContext('2d');
  x.fillStyle = '#e8d8a8';
  x.fillRect(0, 0, c.width, c.height);
  x.strokeStyle = '#3a2a18';
  x.lineWidth = 8;
  x.strokeRect(4, 4, c.width - 8, c.height - 8);
  x.fillStyle = '#29445a';
  x.font = 'bold 48px Georgia';
  x.textAlign = 'center';
  x.fillText('DEBRIEF', 160, 65);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
})();
const markerTexture = color => {
  const c = document.createElement('canvas');
  c.width = c.height = 32;
  const x = c.getContext('2d');
  x.fillStyle = color;
  x.beginPath();
  x.moveTo(2, 4);
  x.lineTo(30, 4);
  x.lineTo(16, 28);
  x.closePath();
  x.fill();
  const texture = new THREE.CanvasTexture(c);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
};
const markTex = markerTexture('#ff2a1a');
const aceMarkTex = markerTexture('#111111');

// ---------- Round, names, wrecks, ground crew ----------
let shopArrows = [];
let fieldFlags = [];
let shipFlags = [];
let stoneRicochetTargets = [];
let worldMapType = null;
let worldPreparedForFreshRound = true;
let debriefSites = [];
let gramophoneSources = [];
let fieldListeners = [];
let groundVehicles = [];
let frontSupplyRoutes = null;
let protectedSites = [];
let protectedHonorUntil = 0;
let playerTruck = null;
let frontTrain = null;
let bedroomTrain = null;
let trenchTroops = [];
let battleTracers = [];
let openingSpawnQueue = [];
let openingSpawnTimer = 0;
let openingEffectsWarmup = 0;
let battleBurstT = 15;
let wrecks = [];
let walkers = [];
let stats = {};
let tickets = {
  blue: SPAWN_LIMIT,
  red: SPAWN_LIMIT
};
let roundT = roundDuration();
let roundInProgress = false;
let missionElapsed = 0;
const MISSION_OPENING_SECONDS = 20;
const PREFLIGHT_DURATION = 3;
let missionLaunchSlots = {
  blue: 0,
  red: 0
};
let runwayLaneCounters = {
  blue: 0,
  red: 0
};
let openingLaunchReleased = false;
let openingLaunchDelay = 0;
let preflightRemaining = 0;
let preflightElapsed = 0;
let bomberRaidCountdown = 60;
let nextBomberRaidTeam = 'blue';
let role = 'pilot';
function loseTicket(team, aircraft) {
  if (sel.gameMode === 'squadbattle' || aircraft.ticketCounted) return;
  tickets[team] = Math.max(0, tickets[team] - 1);
  aircraft.ticketCounted = true;
}
const NAMES = {
  blue: [['James', 'William', 'Arthur', 'Albert', 'Harold', 'Edward', 'George', 'Frederick', 'Thomas', 'Charles', 'Henry', 'Walter', 'Cecil', 'Reginald'], ['Ball', 'Mannock', 'McCudden', 'Bishop', 'Collishaw', 'Barker', 'Fullard', 'Jones', 'Smith', 'Hawker', 'Bell', 'Carter', 'Fletcher', 'Whitaker']],
  red: [['Karl', 'Friedrich', 'Wilhelm', 'Heinrich', 'Otto', 'Ernst', 'Hermann', 'Werner', 'Kurt', 'Max', 'Lothar', 'Josef', 'Hans', 'Erich'], ['Voss', 'Udet', 'Löwenhardt', 'Boelcke', 'Immelmann', 'Müller', 'Schmidt', 'Wolff', 'Becker', 'Bäumer', 'Jacobs', 'Weber', 'Richter', 'Krause']]
};
NAMES.blue.french = [['Georges', 'René', 'Charles', 'Albert', 'Marcel', 'André', 'Louis', 'Maurice', 'Jean', 'Armand', 'Pierre', 'Henri'], ['Guynemer', 'Fonck', 'Nungesser', 'Deullin', 'Brindejonc des Moulinais', 'Chainat', 'Happe', 'Navarre', 'Védrines', 'Casale', 'Dorme', 'Hautefeuille']];
const FEMALE_NAMES = {
  blue: [['Evelyn', 'Margaret', 'Edith', 'Violet', 'Ada', 'Florence', 'Beatrice', 'Catherine', 'Alice', 'Rose', 'Helen', 'Elsie', 'Winifred', 'Clara'], ['Cole', 'Mannock', 'Bell', 'Hawker', 'Whitaker', 'Bishop', 'Fletcher', 'Barker', 'Collishaw', 'Carter', 'Vale', 'Ashford']],
  red: [['Greta', 'Liesel', 'Marta', 'Anna', 'Klara', 'Hilde', 'Elsa', 'Charlotte', 'Johanna', 'Mina', 'Irma', 'Thea', 'Ruth', 'Elisabeth'], ['Krüger', 'Voss', 'Müller', 'Schmidt', 'Wolff', 'Becker', 'Weber', 'Richter', 'Krause', 'Hartmann', 'Falk', 'Lenz']]
};
const pick = a => a[Math.floor(Math.random() * a.length)];
function makeBotPilotAppearance(forcedGender = null) {
  const gender = forcedGender || (Math.random() < 0.15 ? 'female' : 'male');
  const hairColors = [0x593627, 0x34231d, 0x79513a, 0x9a7043, 0x302c2a];
  const mustacheColors = [0x302722, 0x4a3428, 0x765037, 0x342d2b];
  return {
    gender,
    hairStyle: pick(['bun', 'braid', 'ponytail', 'bob', 'roll']),
    hairColor: pick(hairColors),
    mustache: gender === 'male' && Math.random() < 2 / 3,
    mustacheColor: pick(mustacheColors)
  };
}
const randName = (team, gender = 'male') => {
  const roster = gender === 'female' ? FEMALE_NAMES[team] : team === 'blue' && Math.random() < 0.32 ? NAMES.blue.french : NAMES[team];
  return `${pick(roster[0])} ${pick(roster[1])}`;
};
const randPilotName = (team, gender = sel.pilotGender) => {
  const roster = gender === 'female' ? FEMALE_NAMES[team] : team === 'blue' && Math.random() < 0.32 ? NAMES.blue.french : NAMES[team];
  return `${pick(roster[0])} ${pick(roster[1])}`;
};
const ACE_PILOTS = [{
  id: 'wraith-vale',
  team: 'blue',
  name: 'Capt. Evelyn “Wraith” Vale',
  gender: 'female',
  paint: '#d1c6a0',
  speed: 55,
  turn: 2.35
}, {
  id: 'red-fox',
  team: 'blue',
  name: 'Maj. Arthur “Red Fox” Bell',
  paint: '#8b3026',
  speed: 53,
  turn: 2.25
}, {
  id: 'iron-lark',
  team: 'red',
  name: 'Rittm. Otto “Iron Lark” Voss',
  paint: '#45564a',
  speed: 56,
  turn: 2.4
}, {
  id: 'black-hart',
  team: 'red',
  name: 'Ltn. Greta “Black Hart” Krüger',
  gender: 'female',
  paint: '#342e38',
  speed: 54,
  turn: 2.3
}];
const ACE_PAINTS = [0x475a72, 0x9c362c, 0x6a7950, 0xb89858, 0x57434f, 0x82908d, 0x6d4c36, 0x778b9f, 0x4c5661, 0xa07855];
const BONANZA_PAINTS = ['#ff4055', '#13d9c5', '#ffd52f', '#bf63ff', '#ff8a24', '#54e34f', '#32a8ff', '#ff4bb8', '#f4f1e8', '#a7fa45'];
function recordAceDefeat(p) {
  const first = !save.defeatedAces.includes(p.ace.id);
  if (first) save.defeatedAces.push(p.ace.id);
  save.career.aceDefeats++;
  persist();
  cashAdd(first ? 600 : 250, first ? 'Ace bounty' : 'Ace rematch bounty');
  feed(`ACE DEFEATED · ${p.ace.name}${first ? ' — first victory recorded' : ''}`);
  say(first ? `ACE DEFEATED — ${p.ace.name}. First victory recorded!` : `Ace down — ${p.ace.name}. Bounty claimed!`);
  const flyoverTarget = {
    name: p.ace.name,
    aircraft: p,
    position: p.g.position.clone(),
    timeLeft: 150,
    chute: null,
    crashed: false,
    claimed: false
  };
  p.aceFlyoverTarget = flyoverTarget;
  aceFlyoverTargets.push(flyoverTarget);
}
function updateAceFlyoverBonuses(dt) {
  for (const target of aceFlyoverTargets) {
    target.timeLeft -= dt;
    if (target.chute && !target.chute.remove) target.position.copy(target.chute.m.position);else if (!target.crashed && target.aircraft && planes.includes(target.aircraft)) target.position.copy(target.aircraft.g.position);
    if (target.claimed || !player || mode !== 'fly' || player.dying) continue;
    const ground = heightAt(player.g.position.x, player.g.position.z);
    const altitude = player.g.position.y - ground;
    const horizontalRange = Math.hypot(player.g.position.x - target.position.x, player.g.position.z - target.position.z);
    const verticalRange = Math.abs(player.g.position.y - target.position.y);
    if (altitude < 4 || altitude > 62 || horizontalRange > 52 || verticalRange > 76) continue;
    target.claimed = true;
    cashAdd(300, 'Ace low-pass confirmation');
    feed(`ACE CONFIRMED · LOW PASS BOUNTY +$300 · ${target.name}`, 'victory');
  }
  aceFlyoverTargets = aceFlyoverTargets.filter(target => !target.claimed && target.timeLeft > 0);
}
function stat(p) {
  const record = stats[p.name] = stats[p.name] || {
    name: p.name,
    team: p.team,
    kills: 0,
    assists: 0,
    deaths: 0,
    points: 0,
    streak: 0,
    bestStreak: 0,
    streakBonuses: 0,
    sectorsCaptured: 0,
    ping: 20 + Math.floor(Math.random() * 120),
    you: !!p.isPlayer
  };
  record.team = p.team || record.team;
  if (Number.isInteger(p.squadTeam)) record.squadTeam = p.squadTeam;
  if (p.paintMaterial?.color) record.aircraftColor = `#${p.paintMaterial.color.getHexString()}`;
  record.you = record.you || !!p.isPlayer;
  return record;
}
function leaderboardPilotColor(record) {
  if (sel.gameMode === 'bonanza') return /^#[0-9a-f]{6}$/i.test(record?.aircraftColor || '') ? record.aircraftColor : '#f1e5c9';
  if (sel.gameMode === 'squadbattle') return getSquadTeamColor(record?.squadTeam ?? sel.squadTeam);
  return record?.team === 'red' ? '#ff9a8a' : '#8fb0ff';
}
function areHostilePilots(a, b) {
  if (!a || !b || a === b) return false;
  if (sel.gameMode === 'bonanza') return true;
  if (sel.gameMode === 'squadbattle') return Number.isInteger(a.squadTeam) && Number.isInteger(b.squadTeam) ? a.squadTeam !== b.squadTeam : a.team !== b.team;
  return a.team !== b.team;
}
function isAirportWeaponsLocked(aircraft) {
  if (sel.gameMode === 'squadron') return false;
  const position = aircraft?.g?.position || aircraft;
  if (!position || !Number.isFinite(position.x) || !Number.isFinite(position.z)) return false;
  const radius = sel.map === 'bedroom' ? 95 : 160;
  return FIELDS[sel.map].some(field => !field.disabled && Math.hypot(position.x - field.x, position.z - field.z) < radius);
}
function reportAirportWeaponLock(aircraft) {
  if (aircraft !== player) return;
  const now = performance.now();
  if (now - (aircraft.airportLockNoticeAt || 0) < 1800) return;
  aircraft.airportLockNoticeAt = now;
  say('Airport weapon lock — climb clear of the airfield before firing');
}
function recordKillCredit(victim, killer) {
  if (!killer) return;
  const killerRecord = stat(killer);
  killerRecord.kills++;
  if (sel.gameMode !== 'bonanza') return;
  killerRecord.streak = (killerRecord.streak || 0) + 1;
  killerRecord.bestStreak = Math.max(killerRecord.bestStreak || 0, killerRecord.streak);
  killerRecord.points = (killerRecord.points || 0) + 100;
  const earnsStreakBonus = killerRecord.streak >= 3 && killerRecord.streak % 3 === 0;
  if (earnsStreakBonus) {
    killerRecord.points += 75;
    killerRecord.streakBonuses = (killerRecord.streakBonuses || 0) + 1;
    feed(`BONANZA STREAK · ${killer.name} x${killerRecord.streak} · +75 points`);
  }
  if (killer.isPlayer) {
    streak = killerRecord.streak;
    save.career.bestStreak = Math.max(save.career.bestStreak, streak);
    save.career.bonanzaKills++;
  }
  const now = performance.now();
  const creditedAssisters = new Set();
  for (const contribution of victim.bonanzaDamageContributions || []) {
    const assister = contribution.attacker;
    if (!assister || assister === killer || assister === victim || now - contribution.at > 12000 || !areHostilePilots(assister, victim) || creditedAssisters.has(assister)) continue;
    creditedAssisters.add(assister);
    const assistRecord = stat(assister);
    assistRecord.assists++;
    assistRecord.points = (assistRecord.points || 0) + 35;
    if (assister.isPlayer) {
      save.career.bonanzaAssists++;
      feed(`ASSIST · ${assister.name} · +35 points`);
    }
  }
  persist();
}
let bonanzaHudRefresh = 0;
let bonanzaStandingsOpen = false;
function updateBonanzaLeaderboard(dt = 0) {
  const panel = $('bonanza-leaderboard');
  const rankButton = $('bonanza-rank-toggle');
  if (!panel) return;
  const visible = sel.gameMode === 'bonanza' && roundInProgress && !['menu', 'over'].includes(mode);
  if (rankButton) rankButton.style.display = visible ? 'block' : 'none';
  panel.style.display = visible && bonanzaStandingsOpen ? 'block' : 'none';
  if (!visible) {
    bonanzaHudRefresh = 0;
    bonanzaStandingsOpen = false;
    if (rankButton) rankButton.setAttribute('aria-expanded', 'false');
    return;
  }
  bonanzaHudRefresh -= dt;
  if (bonanzaHudRefresh > 0) return;
  bonanzaHudRefresh = 0.3;
  const ranked = Object.values(stats).sort((a, b) => (b.points || 0) - (a.points || 0) || b.kills - a.kills || b.assists - a.assists || a.deaths - b.deaths);
  const playerRank = ranked.findIndex(entry => entry.you) + 1;
  if (rankButton) {
    rankButton.textContent = playerRank ? `#${playerRank}` : '#—';
    rankButton.setAttribute('aria-label', playerRank ? `Your Bonanza rank is ${playerRank}. Toggle standings.` : 'Toggle Bonanza standings');
    rankButton.setAttribute('aria-expanded', String(bonanzaStandingsOpen));
  }
  const leaders = ranked.slice(0, 5);
  panel.innerHTML = `<header><b>BONANZA · LIVE</b><small>${ranked.length} pilots</small></header><ol>${leaders.map((entry, index) => `<li class="${entry.you ? 'is-you' : ''}"><span class="rank">${index + 1}</span><span class="pilot" style="color:${leaderboardPilotColor(entry)}">${escapeHTML(entry.name)}</span><b class="points">${entry.points || 0}</b><small>K ${entry.kills} · A ${entry.assists || 0} · ✦${entry.streak || 0}</small></li>`).join('')}</ol>`;
}
$('bonanza-rank-toggle')?.addEventListener('click', () => {
  bonanzaStandingsOpen = !bonanzaStandingsOpen;
  const button = $('bonanza-rank-toggle');
  const panel = $('bonanza-leaderboard');
  button?.setAttribute('aria-expanded', String(bonanzaStandingsOpen));
  if (panel) panel.style.display = bonanzaStandingsOpen ? 'block' : 'none';
});
let teamStandingsOpen = false;
let teamStandingsRefresh = 0;
function updateTeamLeaderboard(dt = 0) {
  const button = $('team-rank-toggle');
  const panel = $('team-leaderboard');
  if (!button || !panel) return;
  const visible = roundInProgress && ['squadron', 'squadbattle'].includes(sel.gameMode) && !['menu', 'over'].includes(mode);
  button.style.display = visible ? 'block' : 'none';
  panel.style.display = visible && teamStandingsOpen ? 'block' : 'none';
  if (!visible) {
    teamStandingsOpen = false;
    teamStandingsRefresh = 0;
    button.setAttribute('aria-expanded', 'false');
    return;
  }
  teamStandingsRefresh -= dt;
  if (teamStandingsRefresh > 0) return;
  teamStandingsRefresh = 0.35;
  const records = Object.values(stats);
  if (sel.gameMode === 'squadbattle') {
    const squads = SQUAD_TEAM_NAMES.map((name, squadTeam) => {
      const pilots = records.filter(record => record.squadTeam === squadTeam).sort((a, b) => b.kills - a.kills || a.deaths - b.deaths || a.name.localeCompare(b.name));
      return {
        squadTeam,
        name,
        color: getSquadTeamColor(squadTeam),
        pilots,
        kills: pilots.reduce((sum, record) => sum + record.kills, 0),
        deaths: pilots.reduce((sum, record) => sum + record.deaths, 0)
      };
    }).sort((a, b) => b.kills - a.kills || a.deaths - b.deaths || a.squadTeam - b.squadTeam);
    const player = records.find(record => record.you);
    const ownSquad = player?.squadTeam ?? sel.squadTeam;
    const place = squads.findIndex(squad => squad.squadTeam === ownSquad) + 1;
    const ownPilots = records.filter(record => record.squadTeam === ownSquad).sort((a, b) => b.kills - a.kills || a.deaths - b.deaths);
    const pilotPlace = ownPilots.findIndex(record => record.you) + 1;
    const ownName = SQUAD_TEAM_NAMES[ownSquad] || SQUAD_TEAM_NAMES[sel.squadTeam];
    const ownKills = squads.find(squad => squad.squadTeam === ownSquad)?.kills || 0;
    button.textContent = `#${place || '—'} · ${ownName} ${ownKills}`;
    button.setAttribute('aria-label', `Your team is ranked ${place || 'unranked'}, ${ownName} squad has ${ownKills} victories. Toggle live standings.`);
    panel.innerHTML = `<header><b>SQUAD BATTLE · LIVE</b><small>${pilotPlace ? `You #${pilotPlace} · ${ownName}` : `${records.length} pilots`}</small></header><ol>${squads.map((squad, index) => {
      const leaders = squad.pilots.slice(0, 3).map(record => `<span style="color:${leaderboardPilotColor(record)}">${escapeHTML(record.name)}</span> ${record.kills}K${record.you ? ' · YOU' : ''}`).join(' · ') || 'No sorties yet';
      return `<li class="team-standing${squad.squadTeam === ownSquad ? ' is-you' : ''}" style="--team-color:${squad.color}"><span class="rank">${index + 1}</span><span class="pilot">${squad.name}</span><b class="points">${squad.kills}</b><small>${leaders} · ${squad.deaths} losses</small></li>`;
    }).join('')}</ol>`;
    return;
  }
  const factions = ['blue', 'red'].map(team => {
    const pilots = records.filter(record => record.team === team).sort((a, b) => b.kills - a.kills || a.deaths - b.deaths || a.name.localeCompare(b.name));
    return {
      team,
      pilots,
      kills: pilots.reduce((sum, record) => sum + record.kills, 0)
    };
  });
  const player = records.find(record => record.you);
  const ownFaction = player?.team || sel.team;
  const ownPilots = factions.find(faction => faction.team === ownFaction)?.pilots || [];
  const pilotPlace = ownPilots.findIndex(record => record.you) + 1;
  const ownKills = factions.find(faction => faction.team === ownFaction)?.kills || 0;
  const blueKills = factions[0].kills;
  const redKills = factions[1].kills;
  const land = sectorCounts();
  const landLead = land[ownFaction];
  button.textContent = `#${pilotPlace || '—'} · ${ownFaction.toUpperCase()} ${landLead} SECTORS`;
  button.setAttribute('aria-label', `Your position is ${pilotPlace || 'unranked'} in the ${ownFaction} squadron. Blue ${land.blue}, red ${land.red} sectors. Toggle live standings.`);
  panel.innerHTML = `<header><b>${'GREAT WAR'} · LIVE</b><small><span style="color:#8fb0ff">BLUE ${land.blue}</span> — <span style="color:#ff9a8a">RED ${land.red}</span> SECTORS</small></header><div class="team-standing-summary">Victories · <b>${blueKills} BLUE — ${redKills} RED</b> &nbsp; · &nbsp; Your standing #${pilotPlace || '—'}</div><ol>${factions.map(faction => {
    const color = faction.team === 'blue' ? '#8fb0ff' : '#ff9a8a';
    const pilots = faction.pilots.map((record, index) => `<li class="team-standing${record.you ? ' is-you' : ''}" style="--team-color:${color}"><span class="rank">${index + 1}</span><span class="pilot">${escapeHTML(record.name)}${record.you ? ' · YOU' : ''}</span><b class="points">${record.kills}</b><small>K ${record.kills} · A ${record.assists || 0} · D ${record.deaths}</small></li>`).join('');
    return `<li class="team-standing team-standing-heading" style="--team-color:${color}"><span></span><span class="pilot">${faction.team.toUpperCase()} SQUADRON</span><b class="points">${faction.pilots.length}</b><small>${faction.kills} confirmed victories · ${land[faction.team]} sectors held</small></li>${pilots}`;
  }).join('')}</ol>`;
}
$('team-rank-toggle')?.addEventListener('click', () => {
  teamStandingsOpen = !teamStandingsOpen;
  $('team-rank-toggle')?.setAttribute('aria-expanded', String(teamStandingsOpen));
  const panel = $('team-leaderboard');
  if (panel) panel.style.display = teamStandingsOpen ? 'block' : 'none';
});
function buildPlayerPlane() {
  const st = PLANES[sel.team].find(p => p.id === sel.plane) || PLANES[sel.team][0];
  const paint = sel.gameMode === 'squadbattle' ? getSquadTeamColor(sel.squadTeam) : activeEconomy().paint || (st.id === 'baron' ? '#c0180e' : null);
  const p = makePlane(sel.team, paint, st.tri, true);
  p.stats = st;
  p.squadTeam = sel.gameMode === 'squadbattle' ? sel.squadTeam : null;
  p.isPlayer = true;
  p.name = sel.name;
  if (st.bomber) {
    p.g.scale.setScalar(1.6);
    p.bomber = true;
    bomberize(p);
  } else if (st.twoSeater) twoSeatize(p);
  stat(p);
  const selectedInsignia = INSIGNIA.find(item => item.id === save.logo);
  if (save.logo === 'custom' && save.customLogo) applyPilotLogo(p, 'custom');else if (selectedInsignia && save.career.aircraftKills >= selectedInsignia.unlockAt) applyPilotLogo(p, save.logo);
  if (streak >= 10) addRibbons(p);
  p.ammoCapacity = ammoCapacity();
  p.ammo = p.ammoCapacity;
  p.ammoEmptyNotice = false;
  p.flightInstrumentPack = createFlightInstrumentPack(p.g, new THREE.Vector3(0, 0.48, -0.72), p.bomber ? 0.64 : 0.76, false);
  p.accuracyLevel = Number(activeEconomy().acc) || 0;
  p.damageLevel = Number(activeEconomy().dmg) || 0;
  p.healthLevel = Number(activeEconomy().hp) || 0;
  return p;
}
function isPlayerTeamAircraft(aircraft) {
  if (sel.gameMode === 'bonanza') return false;
  return sel.gameMode === 'squadbattle' ? aircraft?.squadTeam === sel.squadTeam : aircraft?.team === sel.team;
}
function applyTeamLoadoutLevels(aircraft) {
  if (!aircraft?.bot || !isPlayerTeamAircraft(aircraft)) return;
  const economy = activeEconomy();
  aircraft.accuracyLevel = Number(economy.acc) || 0;
  aircraft.damageLevel = Number(economy.dmg) || 0;
  aircraft.healthLevel = Number(economy.hp) || 0;
  aircraft.ammoCapacity = ammoCapacity();
  aircraft.ammo = Math.min(Number(aircraft.ammo) || aircraft.ammoCapacity, aircraft.ammoCapacity);
  const oldMaxHits = Math.max(1, Number(aircraft.maxHits) || 8);
  const undamagedHits = Math.max(0, oldMaxHits - (Number(aircraft.hits) || 0));
  const stats = aircraft.stats || PLANES[sel.team][0];
  const nextMaxHits = Math.max(1, Math.round(8 + (Number(economy.armor) || 0) * 4) + (stats.twoSeater ? 2 : 0));
  aircraft.maxHits = nextMaxHits;
  aircraft.hits = Math.max(0, nextMaxHits - undamagedHits);
}
function disposePlaneGroup(group) {
  if (!group) return;
  const geometries = new Set();
  const materials = new Set();
  group.traverse(object => {
    if (object.geometry) geometries.add(object.geometry);
    for (const material of Array.isArray(object.material) ? object.material : object.material ? [object.material] : []) materials.add(material);
  });
  for (const geometry of geometries) geometry.dispose();
  for (const material of materials) material.dispose();
}
function applyPlayerLoadoutToTeam() {
  if (!player || !planes.includes(player)) return;
  const stats = PLANES[sel.team].find(plane => plane.id === sel.plane) || PLANES[sel.team][0];
  const economy = activeEconomy();
  const paint = sel.gameMode === 'squadbattle' ? getSquadTeamColor(sel.squadTeam) : economy.paint || (stats.id === 'baron' ? '#c0180e' : null);
  for (const aircraft of planes) {
    if (!aircraft.bot || aircraft.raidBomber || !isPlayerTeamAircraft(aircraft) || aircraft.dying || aircraft.wingFailure) continue;
    const followsPlayerAircraft = sel.gameMode === 'squadbattle' || aircraft.initialWingman;
    if (followsPlayerAircraft && aircraft.loadoutPlaneId !== stats.id) {
      const oldGroup = aircraft.g;
      const oldPosition = oldGroup.position.clone();
      const oldQuaternion = oldGroup.quaternion.clone();
      const oldMarker = aircraft.marker;
      oldMarker?.removeFromParent();
      const replacement = makePlane(aircraft.team, paint, !!stats.tri);
      replacement.g.position.copy(oldPosition);
      replacement.g.quaternion.copy(oldQuaternion);
      replacement.g.scale.setScalar(stats.bomber ? 1.5 : 1);
      if (stats.bomber) {
        replacement.bomber = true;
        bomberize(replacement);
      } else if (stats.twoSeater) twoSeatize(replacement);
      if (oldMarker) replacement.g.add(oldMarker);
      const modelKeys = ['g', 'body', 'fuselage', 'engineCowling', 'wing', 'tail', 'wingPanels', 'controlSurfaces', 'controlActuation', 'bulletHoles', 'prop', 'cockpitHead', 'paintMaterial', 'props', 'twoSeater', 'bomber', 'rearOpening', 'rearGunMount', 'rearGunRing', 'twoSeatBombMeshes', 'bomberCrew', 'bombs', 'bombCapacity'];
      for (const key of modelKeys) {
        if (Object.hasOwn(replacement, key)) aircraft[key] = replacement[key];else delete aircraft[key];
      }
      aircraft.marker = oldMarker || null;
      scene.remove(oldGroup);
      disposePlaneGroup(oldGroup);
      if (save.logo === 'custom' && save.customLogo) applyPilotLogo(aircraft, 'custom');else {
        const insignia = INSIGNIA.find(item => item.id === save.logo);
        if (insignia && save.career.aircraftKills >= insignia.unlockAt) applyPilotLogo(aircraft, save.logo);
      }
      aircraft.loadoutPlaneId = stats.id;
      aircraft.botVariant = stats.bomber ? 'bomber' : stats.twoSeater ? 'twoSeater' : stats.tri ? 'triplane' : 'fighter';
    }
    if (followsPlayerAircraft) {
      aircraft.stats = stats;
      aircraft.paintMaterial?.color.set(paint || (aircraft.team === 'blue' ? 0x5b5434 : 0x9c2a1f));
      aircraft.bomber = !!stats.bomber;
      aircraft.twoSeater = !!stats.twoSeater;
    }
    aircraft.ammo = aircraft.ammoCapacity || ammoCapacity();
    applyTeamLoadoutLevels(aircraft);
  }
}
function escapeHTML(value) {
  return String(value).replace(/[&<>\"]/g, ch => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;'
  })[ch]);
}
const INSIGNIA = [{
  id: 'winged-star',
  name: 'Winged Star',
  icon: '✧',
  center: '#f2d58a',
  edge: '#5a261d',
  text: '✶'
}, {
  id: 'iron-sun',
  name: 'Iron Sun',
  icon: '☼',
  center: '#c5a552',
  edge: '#3b3023',
  text: '☼'
}, {
  id: 'falcon',
  name: 'Falcon',
  icon: '♞',
  center: '#ded6bd',
  edge: '#26313a',
  text: '♞'
}, {
  id: 'lion-heart',
  name: 'Lionheart',
  icon: '♌',
  center: '#d7ad62',
  edge: '#573a20',
  text: '♌'
}, {
  id: 'stag-charge',
  name: 'Stag Charge',
  icon: '♧',
  center: '#d6c49b',
  edge: '#45513a',
  text: '♧'
}, {
  id: 'eagle-claw',
  name: 'Eagle Claw',
  icon: '⚑',
  center: '#d7d0bd',
  edge: '#394553',
  text: '⚑'
}, {
  id: 'wolf-moon',
  name: 'Wolf Moon',
  icon: '☾',
  center: '#b5c0bf',
  edge: '#303b4b',
  text: '☾'
}, {
  id: 'fox-tail',
  name: 'Fox Tail',
  icon: '♦',
  center: '#d77b43',
  edge: '#522b21',
  text: '♦'
}, {
  id: 'owl-watch',
  name: 'Owl Watch',
  icon: '◉',
  center: '#cfbd8c',
  edge: '#403b2d',
  text: '◉'
}, {
  id: 'raven-wing',
  name: 'Raven Wing',
  icon: '✦',
  center: '#9fa9b0',
  edge: '#282b36',
  text: '✦'
}, {
  id: 'horse-guard',
  name: 'Horse Guard',
  icon: '♘',
  center: '#e0d0a7',
  edge: '#563b2b',
  text: '♘'
}, {
  id: 'boar-tusk',
  name: 'Boar Tusk',
  icon: '♟',
  center: '#c6ad86',
  edge: '#44372d',
  text: '♟'
}, {
  id: 'dragon-flame',
  name: 'Dragon Flame',
  icon: 'ϟ',
  center: '#d58b57',
  edge: '#4b2925',
  text: 'ϟ'
}, {
  id: 'anchor-watch',
  name: 'Anchor Watch',
  icon: '⚓',
  center: '#b5c6c6',
  edge: '#31404a',
  text: '⚓'
}, {
  id: 'crossed-steel',
  name: 'Crossed Steel',
  icon: '⚔',
  center: '#d4c18f',
  edge: '#494038',
  text: '⚔'
}, {
  id: 'laurel-crown',
  name: 'Laurel Crown',
  icon: '❧',
  center: '#b8c095',
  edge: '#43513b',
  text: '❧'
}, {
  id: 'lightning-bolt',
  name: 'Lightning Bolt',
  icon: '⚡',
  center: '#e4d77b',
  edge: '#50412b',
  text: '⚡'
}, {
  id: 'compass-rose',
  name: 'Compass Rose',
  icon: '✥',
  center: '#d5d0bb',
  edge: '#344252',
  text: '✥'
}, {
  id: 'skull-crossbones',
  name: 'Skull & Crossbones',
  icon: '☠',
  center: '#ddd6c6',
  edge: '#35312d',
  text: '☠'
}, {
  id: 'victory-wreath',
  name: 'Victory Wreath',
  icon: '♛',
  center: '#d9c16d',
  edge: '#51422b',
  text: '♛'
}].map((insignia, index) => ({
  ...insignia,
  unlockAt: (index + 1) * 25
}));
function applyPilotLogo(p, id) {
  const design = INSIGNIA.find(item => item.id === id);
  const custom = id === 'custom' && typeof save.customLogo === 'string' ? save.customLogo : '';
  if (!design && !custom) return;
  const edge = design?.edge || '#4d3728';
  const center = design?.center || '#eee4d1';
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 128;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, 128, 128);
  ctx.fillStyle = edge;
  ctx.beginPath();
  ctx.arc(64, 64, 56, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = center;
  ctx.beginPath();
  ctx.arc(64, 64, 47, 0, Math.PI * 2);
  ctx.fill();
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  if (custom) {
    const image = new Image();
    image.onload = () => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(64, 64, 43, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(image, 21, 21, 86, 86);
      ctx.restore();
      ctx.strokeStyle = edge;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(64, 64, 45, 0, Math.PI * 2);
      ctx.stroke();
      tex.needsUpdate = true;
    };
    image.src = custom;
  } else {
    ctx.fillStyle = design.edge;
    ctx.font = 'bold 76px Georgia';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(design.text, 64, 66);
    tex.needsUpdate = true;
  }
  for (const side of [-1, 1]) {
    const badge = new THREE.Mesh(new THREE.PlaneGeometry(0.58, 0.58), new THREE.MeshBasicMaterial({
      map: tex,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false
    }));
    badge.position.set(side * 0.54, 0.2, 0.28);
    badge.rotation.y = side * Math.PI / 2;
    p.body.add(badge);
  }
}
const smokeTexture = (() => {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 128;
  const ctx = canvas.getContext('2d');
  ctx.filter = 'blur(5px)';
  for (let i = 0; i < 22; i++) {
    const x = 20 + Math.random() * 88;
    const y = 18 + Math.random() * 92;
    const r = 10 + Math.random() * 25;
    const grad = ctx.createRadialGradient(x, y, 1, x, y, r);
    grad.addColorStop(0, 'rgba(255,255,255,0.48)');
    grad.addColorStop(0.55, 'rgba(255,255,255,0.23)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(x, y, r, r * (0.65 + Math.random() * 0.55), Math.random() * 3, 0, Math.PI * 2);
    ctx.fill();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
})();
function recycleSmokeSprite(sprite) {
  scene.remove(sprite);
  sprite.visible = false;
  if (smokeSpritePool.length < MAX_ACTIVE_SMOKE) smokeSpritePool.push(sprite);else sprite.material.dispose();
}
function smoke(pos, size, life, color = 0x3a3a3a, vx = 0, vy = 0.25, vz = 0, opacity = 0.55, expand = 0) {
  if (openingEffectsWarmup > 0) return;
  if (activeSmokePuffs >= MAX_ACTIVE_SMOKE) {
    const oldestIndex = puffs.findIndex(puff => puff.smallSmoke);
    if (oldestIndex >= 0) {
      const [oldest] = puffs.splice(oldestIndex, 1);
      activeSmokePuffs--;
      recycleSmokeSprite(oldest.m);
    }
  }
  const m = smokeSpritePool.pop() || new THREE.Sprite(new THREE.SpriteMaterial({
    map: smokeTexture,
    color,
    transparent: true,
    opacity,
    depthWrite: false
  }));
  m.material.color.set(color);
  m.material.opacity = opacity;
  m.visible = true;
  const baseScale = size * 2;
  m.scale.set(baseScale, baseScale, 1);
  m.position.copy(pos);
  scene.add(m);
  puffs.push({
    m,
    life,
    max: life,
    vy,
    vx,
    vz,
    smokeOpacity: opacity,
    baseScale,
    expand,
    smallSmoke: true
  });
  activeSmokePuffs++;
}
function addRibbons(p, announce = true) {
  if (p.ribbons) return;
  p.ribbons = true;
  p.ribbonCloths = [];
  if (p.isPlayer) void 0;
  if (announce) say('10 KILLSTREAK — Ace ribbons awarded!');
  const stripe = p.team === 'blue' ? new THREE.Color(0x23408a) : new THREE.Color(0xb3241c);
  const linen = new THREE.Color(0xe5dbc2);
  const segments = 7;
  const columns = 2;
  const length = 1.22;
  const width = 0.19;
  for (const sx of [-3.85, 3.85]) {
    const positions = [];
    const colors = [];
    const indices = [];
    for (let row = 0; row <= segments; row++) {
      const u = row / segments;
      for (let col = 0; col <= columns; col++) {
        positions.push((col / columns - 0.5) * width, 0, u * length);
        const color = col === 1 ? stripe : linen;
        colors.push(color.r, color.g, color.b);
      }
    }
    for (let row = 0; row < segments; row++) {
      for (let col = 0; col < columns; col++) {
        const a = row * (columns + 1) + col;
        const b = a + columns + 1;
        indices.push(a, b, a + 1, a + 1, b, b + 1);
      }
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    geometry.attributes.position.setUsage(THREE.DynamicDrawUsage);
    const material = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.9,
      side: THREE.DoubleSide
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(sx, 1.41, 0.35);
    mesh.userData.phase = sx * 0.38;
    mesh.userData.length = length;
    mesh.userData.width = width;
    mesh.userData.segments = segments;
    mesh.userData.columns = columns;
    mesh.userData.breakLayer = 'upper';
    p.wing.add(mesh);
    p.wingPanels?.[sx < 0 ? 'left' : 'right']?.push(mesh);
    p.ribbonCloths.push(mesh);
  }
}
function revokeRibbons(p) {
  if (!p?.ribbonCloths?.length) {
    if (p) p.ribbons = false;
    return;
  }
  for (const cloth of p.ribbonCloths) {
    cloth.removeFromParent();
    cloth.geometry.dispose();
    cloth.material.dispose();
  }
  p.ribbonCloths = [];
  p.ribbons = false;
}
function animateRibbon(cloth, time) {
  const {
    phase,
    length,
    width,
    segments,
    columns
  } = cloth.userData;
  const positions = cloth.geometry.attributes.position;
  for (let row = 0; row <= segments; row++) {
    const u = row / segments;
    const flutter = u * u;
    const wave = time * 9 + phase + u * 8;
    for (let col = 0; col <= columns; col++) {
      const across = col / columns - 0.5;
      const i = row * (columns + 1) + col;
      positions.setXYZ(i, across * width + Math.sin(wave - across) * flutter * 0.075, Math.sin(wave * 0.82) * flutter * 0.11 + u * 0.05, u * length);
    }
  }
  positions.needsUpdate = true;
  cloth.geometry.computeVertexNormals();
}
function spawnWalker(f) {
  if (!f || f.disabled) return;
  const person = makeStylizedSoldier(f.team, false);
  const g = person.g;
  g.scale.setScalar(0.96 + Math.random() * 0.08);
  scene.add(g);
  const w = {
    g,
    person,
    f,
    team: f.team,
    name: randName(f.team),
    dead: 0,
    tx: 0,
    tz: 0,
    speed: 1.05 + Math.random() * 0.55,
    phase: Math.random() * Math.PI * 2,
    pauseT: 0,
    walkT: Math.random() * 4
  };
  respawnWalker(w);
  walkers.push(w);
}
function spawnWalkers() {
  for (const f of FIELDS[sel.map]) {
    for (let i = 0; i < 4; i++) spawnWalker(f);
  }
}
function enqueueOpeningWalkers(delay = 0.08) {
  for (const field of FIELDS[sel.map]) {
    if (field.disabled) continue;
    for (let i = 0; i < 4; i++) openingSpawnQueue.push({
      type: 'walker',
      field,
      delay
    });
  }
}
function respawnWalker(w) {
  if (w.f.disabled) w.f = FIELDS[sel.map].find(field => field.team === w.team && !field.disabled) || FIELDS[sel.map].find(field => field.rear && !field.disabled);
  if (!w.f) {
    w.g.visible = false;
    return;
  }
  w.dead = 0;
  w.g.visible = true;
  w.pauseT = 0;
  w.walkT = Math.random() * 4;
  w.g.rotation.set(0, 0, 0);
  const spawnPoint = fieldLocalPoint(w.f, 15 + Math.random() * 30, 40 + Math.random() * 50);
  w.g.position.set(spawnPoint.x, heightAt(spawnPoint.x, spawnPoint.z), spawnPoint.z);
  w.tx = w.g.position.x;
  w.tz = w.g.position.z;
  w.person.torso.position.y = 0.99;
  w.person.torso.rotation.z = 0;
  w.person.headPivot.rotation.set(0, 0, 0);
  w.person.armPivots.forEach(arm => arm.rotation.set(0, 0, 0));
  w.person.legPivots.forEach(leg => leg.rotation.set(0, 0, 0));
}
function makeGroundVehicle(team, type, x, z, route = null, routeT = 0.5) {
  const g = new THREE.Group();
  const hull = new THREE.MeshLambertMaterial({
    color: team === 'blue' ? 0x596044 : 0x756b4f
  });
  const steel = new THREE.MeshLambertMaterial({
    color: 0x6c684f
  });
  const dark = new THREE.MeshLambertMaterial({
    color: 0x272622
  });
  const canvas = new THREE.MeshLambertMaterial({
    color: team === 'blue' ? 0x8c7853 : 0x8e3a2b
  });
  const box = (w, h, d, mat, px, py, pz, parent = g) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.position.set(px, py, pz);
    parent.add(m);
    return m;
  };
  const wheels = [];
  if (type === 'tank') {
    const trackMat = new THREE.MeshLambertMaterial({
      color: 0x272924
    });
    const treadMat = new THREE.MeshLambertMaterial({
      color: 0x4b4a40
    });
    const fastener = new THREE.MeshLambertMaterial({
      color: 0x9a8963
    });
    const glass = new THREE.MeshLambertMaterial({
      color: 0x1d2828
    });
    const teamMark = new THREE.MeshLambertMaterial({
      color: team === 'blue' ? 0xd8d0ad : 0xc3c3b5
    });
    const panelShape = new THREE.Shape();
    panelShape.moveTo(-1.34, 0.76);
    panelShape.lineTo(-1.7, 1.62);
    panelShape.lineTo(-1.02, 2.48);
    panelShape.lineTo(1.05, 2.48);
    panelShape.lineTo(1.62, 1.72);
    panelShape.lineTo(1.42, 0.76);
    panelShape.closePath();
    const armouredBody = new THREE.Mesh(new THREE.ExtrudeGeometry(panelShape, {
      depth: 5.9,
      bevelEnabled: true,
      bevelSegments: 1,
      steps: 1,
      bevelSize: 0.06,
      bevelThickness: 0.06
    }), hull);
    armouredBody.position.z = -2.95;
    g.add(armouredBody);
    for (const side of [-1, 1]) {
      box(0.76, 1.52, 7.55, trackMat, side * 1.79, 0.86, 0);
      const rollers = [];
      for (let i = -3; i <= 3; i++) {
        const wheel = new THREE.Mesh(new THREE.CylinderGeometry(i === 0 ? 0.48 : 0.42, i === 0 ? 0.48 : 0.42, 0.82, 12), i % 2 ? dark : treadMat);
        wheel.position.set(side * 1.93, 0.8, i * 0.91);
        wheel.rotation.z = Math.PI / 2;
        g.add(wheel);
        wheels.push(wheel);
        rollers.push(wheel);
        const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.08, 9), steel);
        hub.position.set(side * 2.39, 0.8, i * 0.91);
        hub.rotation.z = Math.PI / 2;
        g.add(hub);
      }
      for (let i = 0; i < 15; i++) {
        const z = -3.55 + i * 0.51;
        for (const y of [0.13, 1.58]) box(0.08, 0.16, 0.43, treadMat, side * 2.2, y, z);
      }
      for (const end of [-1, 1]) {
        const plate = box(0.1, 0.84, 0.68, treadMat, side * 2.2, 0.86, end * 3.64);
        plate.rotation.x = end * 0.45;
      }
      box(0.15, 0.1, 7.4, steel, side * 1.86, 1.62, 0);
      const sponson = box(0.78, 0.78, 2.45, hull, side * 1.8, 1.44, -0.48);
      sponson.rotation.z = side * -0.06;
      const sideGun = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.105, 0.9, 8), dark);
      sideGun.position.set(side * 2.2, 1.48, -0.8);
      sideGun.rotation.z = Math.PI / 2;
      g.add(sideGun);
      for (const z of [-2.7, -1.85, 0.85, 1.7, 2.55]) {
        const rivet = new THREE.Mesh(new THREE.SphereGeometry(0.075, 6, 5), fastener);
        rivet.position.set(side * 2.22, 1.15, z);
        g.add(rivet);
      }
      const port = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.18, 0.44), glass);
      port.position.set(side * 2.205, 1.95, 0.42);
      g.add(port);
    }
    // Boxy, sloped Mark IV-style hull with no modern turret or long cannon.
    box(2.7, 0.36, 1.25, steel, 0, 1.82, -3.02, g);
    box(1.05, 0.32, 1.7, steel, 0, 2.48, 0.1);
    for (const side of [-1, 1]) {
      const vision = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.12, 0.045), glass);
      vision.position.set(side * 0.73, 2.06, -3.015);
      g.add(vision);
      const frontGun = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 0.68, 8), dark);
      frontGun.rotation.x = Math.PI / 2;
      frontGun.position.set(side * 0.72, 1.52, -3.26);
      g.add(frontGun);
      const badge = new THREE.Mesh(new THREE.CircleGeometry(0.32, 16), teamMark);
      badge.position.set(side * 2.42, 1.8, 0.05);
      badge.rotation.y = side * Math.PI / 2;
      g.add(badge);
    }
    for (const z of [-2.1, 2.2]) {
      const hatch = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.42, 0.12, 12), steel);
      hatch.position.set(0, 2.53, z);
      g.add(hatch);
      const exhaust = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.17, 0.6, 8), dark);
      exhaust.position.set(0.82, 2.48, z * 0.7);
      g.add(exhaust);
    }
    box(0.09, 0.12, 5.5, steel, 0, 0.82, 0);
  } else {
    const wood = new THREE.MeshLambertMaterial({
      color: 0x5b4c35
    });
    const glass = new THREE.MeshLambertMaterial({
      color: 0x1c2928
    });
    const lamp = new THREE.MeshBasicMaterial({
      color: 0xffd48b
    });
    box(2.5, 1.3, 4.5, hull, 0, 1.05, 0.25);
    box(2.25, 1.6, 1.8, canvas, 0, 1.8, -1.25);
    box(2.6, 1.5, 2.4, wood, 0, 1.65, 2.05);
    for (const side of [-1, 1]) {
      box(0.12, 1.12, 1.22, dark, side * 0.74, 2.0, -1.27);
      box(0.08, 0.75, 0.82, glass, side * 0.79, 2.05, -1.27);
      for (const wz of [-1.25, 1.7]) {
        const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.42, 10), dark);
        wheel.position.set(side * 1.28, 0.55, wz);
        wheel.rotation.z = Math.PI / 2;
        g.add(wheel);
        wheels.push(wheel);
      }
      for (let slat = 0; slat < 4; slat++) box(0.14, 0.22, 2.25, wood, side * 1.34, 1.18 + slat * 0.25, 2.04);
    }
    box(1.7, 0.18, 0.18, steel, 0, 1.0, -2.12);
    for (const side of [-1, 1]) {
      const headlamp = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.2, 0.12, 10), lamp);
      headlamp.position.set(side * 0.92, 1.49, -2.08);
      headlamp.rotation.x = Math.PI / 2;
      g.add(headlamp);
    }
  }
  const routePoint = route?.getPointAt(routeT);
  x = routePoint?.x ?? x;
  z = routePoint?.z ?? z;
  g.position.set(x, heightAt(x, z), z);
  world.add(g);
  const vehicle = {
    g,
    team,
    type,
    wheels,
    hp: type === 'tank' ? 7 : 2,
    maxHp: type === 'tank' ? 7 : 2,
    speed: type === 'tank' ? 1.65 : 3.8,
    dir: team === 'blue' ? 1 : -1,
    z,
    route,
    routeT,
    dead: 0
  };
  const tangent = route?.getTangentAt(routeT);
  if (tangent) {
    tangent.multiplyScalar(vehicle.dir);
    vehicle.g.rotation.y = Math.atan2(-tangent.x, -tangent.z);
  } else vehicle.g.rotation.y = vehicle.dir > 0 ? -Math.PI / 2 : Math.PI / 2;
  groundVehicles.push(vehicle);
  return vehicle;
}
function buildGroundVehicles() {
  groundVehicles = [];
  if (sel.map !== 'trenches') return;
  for (const team of ['blue', 'red']) {
    const sign = team === 'blue' ? -1 : 1;
    const route = frontSupplyRoutes?.[team] || null;
    for (let i = 0; i < 2; i++) {
      const startT = team === 'blue' ? 0.24 + i * 0.055 : 0.74 - i * 0.055;
      makeGroundVehicle(team, 'tank', sign * (245 + i * 45), (i ? 1 : -1) * (350 + i * 130), route, startT);
      makeGroundVehicle(team, 'truck', sign * (390 + i * 38), (i ? -1 : 1) * (470 + i * 115), route, startT + (team === 'blue' ? 0.12 : -0.12));
    }
  }
  buildPlayerTruck(playerField);
}
function buildPlayerTruck(field) {
  if (!field) return;
  const g = new THREE.Group();
  const paint = new THREE.MeshLambertMaterial({
    color: field.team === 'blue' ? 0x596044 : 0x756b4f
  });
  const canvas = new THREE.MeshLambertMaterial({
    color: 0x827451
  });
  const wood = new THREE.MeshLambertMaterial({
    color: 0x51412e
  });
  const dark = new THREE.MeshLambertMaterial({
    color: 0x272622
  });
  const steel = new THREE.MeshLambertMaterial({
    color: 0x55534b
  });
  const glass = new THREE.MeshLambertMaterial({
    color: 0x60747a,
    transparent: true,
    opacity: 0.68
  });
  const brass = new THREE.MeshLambertMaterial({
    color: 0xb69a63
  });
  const lamp = new THREE.MeshBasicMaterial({
    color: 0xffd991
  });
  const addBox = (w, h, d, mat, x, y, z) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    mesh.position.set(x, y, z);
    g.add(mesh);
    return mesh;
  };
  const addCylinder = (radius, length, mat, x, y, z, axisX = false, axisZ = false) => {
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, length, 12), mat);
    mesh.position.set(x, y, z);
    if (axisX) mesh.rotation.z = Math.PI / 2;
    if (axisZ) mesh.rotation.x = Math.PI / 2;
    g.add(mesh);
    return mesh;
  };

  // Long ladder chassis, a square bonnet and a framed, glazed driver's cab.
  addBox(2.15, 0.24, 6.1, dark, 0, 0.66, 0.2);
  addBox(0.16, 0.28, 5.9, steel, -0.91, 0.73, 0.18);
  addBox(0.16, 0.28, 5.9, steel, 0.91, 0.73, 0.18);
  addBox(2.58, 0.82, 2.05, paint, 0, 1.22, -1.45);
  addBox(2.34, 0.86, 1.48, paint, 0, 1.48, -0.22);
  addBox(2.5, 0.16, 1.86, paint, 0, 2.91, -0.2);
  for (const side of [-1, 1]) {
    addBox(0.12, 1.02, 1.52, paint, side * 1.2, 1.91, -0.2);
    addBox(0.09, 0.08, 1.55, dark, side * 1.255, 2.43, -0.2);
    addBox(0.09, 0.58, 0.84, glass, side * 1.27, 2.22, -0.2);
    addBox(0.48, 0.14, 2.45, steel, side * 1.48, 0.84, -0.18);
    addBox(0.055, 0.24, 0.18, brass, side * 1.27, 1.86, -0.1);
  }
  const windshield = new THREE.Mesh(new THREE.PlaneGeometry(2.02, 0.76), glass);
  windshield.position.set(0, 2.23, -1.01);
  windshield.rotation.x = -0.14;
  g.add(windshield);
  for (const x of [-1.06, 1.06]) {
    const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.95, 8), paint);
    pillar.position.set(x, 2.28, -0.99);
    pillar.rotation.x = -0.14;
    g.add(pillar);
  }
  addBox(2.2, 0.09, 0.12, dark, 0, 2.65, -1.02);
  addBox(2.82, 0.2, 0.3, steel, 0, 0.73, -2.53);
  addBox(1.08, 0.76, 0.1, dark, 0, 1.25, -2.5);
  for (let i = 0; i < 6; i++) addBox(0.9, 0.055, 0.12, steel, 0, 0.98 + i * 0.105, -2.57);
  for (const x of [-1.0, 1.0]) {
    addCylinder(0.25, 0.12, brass, x, 1.43, -2.52, false, true);
    addCylinder(0.18, 0.13, lamp, x, 1.43, -2.59, false, true);
    addBox(0.1, 0.25, 0.12, dark, x * 1.28, 1.39, -2.44);
    const mirror = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.18, 0.1), steel);
    mirror.position.set(x * 1.34, 2.38, -0.98);
    g.add(mirror);
  }

  // Slatted service bed, canvas tilt, rear gate and tie-down hoops.
  addBox(2.72, 0.18, 2.8, wood, 0, 1.08, 2.08);
  for (const side of [-1, 1]) {
    addBox(0.13, 0.86, 2.84, wood, side * 1.31, 1.62, 2.08);
    for (const y of [1.32, 1.59, 1.86]) addBox(0.16, 0.11, 2.78, canvas, side * 1.39, y, 2.08);
    for (const z of [0.72, 1.95, 3.34]) addBox(0.14, 1.05, 0.14, steel, side * 1.34, 1.67, z);
  }
  addBox(2.62, 0.84, 0.14, wood, 0, 1.63, 3.42);
  addBox(2.72, 0.18, 2.88, canvas, 0, 2.39, 2.08);
  for (const side of [-1, 1]) addBox(0.09, 0.74, 2.8, canvas, side * 1.29, 1.98, 2.08);
  for (const z of [0.7, 1.35, 2.05, 2.75, 3.35]) addBox(0.06, 0.12, 2.7, wood, 0, 2.5, z);
  for (const x of [-0.7, 0, 0.7]) {
    const crate = addBox(0.62, 0.48, 0.64, x === 0 ? canvas : wood, x, 1.42, 2.0 + x * 0.15);
    crate.rotation.y = x * 0.18;
    for (let band = -1; band <= 1; band++) addBox(0.05, 0.52, 0.68, steel, x + band * 0.21, 1.42, 2.0 + x * 0.15 - 0.02);
  }
  const wheels = [];
  const wheelRadius = 0.58;
  const wheelMaterial = new THREE.MeshLambertMaterial({
    color: 0x211f1c
  });
  const wheelRows = [{
    z: -1.52,
    x: 1.46
  }, {
    z: 1.86,
    x: 1.3
  }, {
    z: 1.86,
    x: 1.66
  }];
  for (let row = 0; row < wheelRows.length; row++) {
    const {
      z,
      x: axleHalfWidth
    } = wheelRows[row];
    addCylinder(0.095, 3.45, steel, 0, 0.59, z, true);
    for (const side of [-1, 1]) {
      const wheel = new THREE.Mesh(new THREE.CylinderGeometry(wheelRadius, wheelRadius, 0.34, 16), wheelMaterial);
      wheel.position.set(side * axleHalfWidth, wheelRadius, z);
      wheel.rotation.z = Math.PI / 2;
      wheel.userData.radius = wheelRadius;
      g.add(wheel);
      wheels.push(wheel);
      addCylinder(0.25, 0.14, steel, side * (axleHalfWidth + 0.19), wheelRadius, z, true);
      addCylinder(0.12, 0.16, brass, side * (axleHalfWidth + 0.27), wheelRadius, z, true);
      if (row !== 1) {
        const arch = new THREE.Mesh(new THREE.TorusGeometry(0.67, 0.075, 7, 16, Math.PI), paint);
        arch.position.set(side * 1.48, wheelRadius, z);
        arch.rotation.y = Math.PI / 2;
        g.add(arch);
      }
    }
  }
  const truckPoint = fieldLocalPoint(field, 42, 78);
  const heading = fieldRunwayHeading(field);
  g.position.set(truckPoint.x, heightAt(truckPoint.x, truckPoint.z), truckPoint.z);
  g.rotation.y = heading;
  world.add(g);
  playerTruck = {
    g,
    wheels,
    speed: 0,
    yaw: heading,
    field
  };
}
function damageGroundVehicle(v, owner) {
  if (v.dead > 0 || !v.g.visible) return;
  v.hp--;
  if (v.hp > 0) return;
  v.dead = 35;
  v.g.visible = false;
  const at = v.g.position.clone().add(new THREE.Vector3(0, 1.5, 0));
  boom(at);
  if (owner === player && v.team !== sel.team) {
    recordCareerCounter('groundVehicleKills');
    cashAdd(v.type === 'tank' ? 100 : 60, v.type === 'tank' ? 'Enemy tank destroyed' : 'Enemy truck destroyed');
  }
}
function updateGroundVehicles(dt) {
  for (const v of groundVehicles) {
    if (v.dead > 0) {
      v.dead -= dt;
      if (v.dead <= 0) {
        v.hp = v.maxHp;
        v.g.visible = true;
      }
      continue;
    }
    if (v.route) {
      const routeLength = Math.max(1, v.route.getLength());
      v.routeT += v.dir * v.speed * dt / routeLength;
      if (v.routeT >= 1) {
        v.routeT = 1;
        v.dir = -1;
      } else if (v.routeT <= 0) {
        v.routeT = 0;
        v.dir = 1;
      }
      const point = v.route.getPointAt(v.routeT);
      const tangent = v.route.getTangentAt(v.routeT).multiplyScalar(v.dir);
      v.g.position.set(point.x, heightAt(point.x, point.z), point.z);
      v.g.rotation.y = Math.atan2(-tangent.x, -tangent.z);
    } else {
      const lo = v.team === 'blue' ? -335 : 205;
      const hi = v.team === 'blue' ? -205 : 335;
      v.g.position.x += v.dir * v.speed * dt;
      if (v.g.position.x > hi) v.dir = -1;
      if (v.g.position.x < lo) v.dir = 1;
      v.g.rotation.y = v.dir > 0 ? -Math.PI / 2 : Math.PI / 2;
      v.g.position.y = heightAt(v.g.position.x, v.z);
    }
    if (!save.reducedGraphics || v.g.position.distanceToSquared(camera.position) < 900 * 900) {
      for (const wheel of v.wheels) wheel.rotation.x += v.dir * v.speed * dt * 0.4;
    }
  }
}
function ambientBattleBlast() {
  if (sel.map !== 'trenches') return;
  let pos;
  const vehicles = groundVehicles.filter(v => v.type === 'truck' && v.dead <= 0);
  if (vehicles.length && Math.random() < 0.52) {
    const v = pick(vehicles);
    pos = v.g.position.clone().add(new THREE.Vector3((Math.random() - 0.5) * 24, 0.7, (Math.random() - 0.5) * 30));
  } else {
    const x = (Math.random() < 0.5 ? -1 : 1) * (90 + Math.random() * 65);
    const z = (Math.random() - 0.5) * 1900;
    pos = new THREE.Vector3(x, heightAt(x, z) + 0.8, z);
  }
  boom(pos);
  smoke(pos.clone().add(new THREE.Vector3(0, 1.5, 0)), 0.65, 1.8, 0x423a31, 0.03, 0.35);
}
function reportHonorViolation(text) {
  const now = performance.now();
  if (now < protectedHonorUntil) return;
  protectedHonorUntil = now + 3200;
  const message = `HONOR OF THE AIR · ${text}`;
  feed(message, 'neutral');
  say(message);
}
function reportProtectedStrike(site, owner) {
  if (owner !== player || performance.now() < (site.honorCooldown || 0)) return;
  site.honorCooldown = performance.now() + 3200;
  const kind = site.kind === 'hospital' ? 'field hospital' : 'protected supply depot';
  reportHonorViolation(`firing on a ${kind} is forbidden`);
}
function reportParachutistStrike(chute, owner) {
  if (owner !== player || chute.honorWarned) return;
  chute.honorWarned = true;
  reportHonorViolation('do not fire on an unarmed parachutist');
}
function damageAirfield(pos, owner) {
  if (!owner?.team) return null;
  let target = null;
  let bestDistance = Infinity;
  for (const field of FIELDS[sel.map]) {
    if (field.rear || field.disabled || field.team === owner.team) continue;
    const distance = Math.hypot(pos.x - field.x, (pos.z - field.z) * 0.6);
    if (distance < 74 && distance < bestDistance) {
      target = field;
      bestDistance = distance;
    }
  }
  if (!target) return null;
  target.bombHits = Math.min(15, (target.bombHits || 0) + 1);
  if (target.bombHits >= 15) {
    target.disabled = true;
    buildAirfieldWreck(target);
    persistGreatWarCampaign();
    for (const walker of walkers) {
      if (walker.f !== target) continue;
      const reserve = FIELDS[sel.map].find(field => field.team === target.team && !field.disabled);
      if (reserve) {
        walker.f = reserve;
        respawnWalker(walker);
      }
    }
    const report = `${target.name} destroyed · 15 bomb hits · spawn point lost`;
    feed(report, 'defeat');
    if (owner === player) recordCareerCounter('baseKills');
    if (owner === player || target.team === sel.team) say(report);
    return target;
  }
  if (owner === player || target.team === sel.team) {
    if (target.bombHits === 1 || target.bombHits % 5 === 0 || target.bombHits === 14) {
      say(`${target.name} taking bomb damage · ${target.bombHits}/15`);
    }
  }
  persistGreatWarCampaign();
  return target;
}
function bombHit(pos, owner) {
  const protectedSite = protectedSites.find(site => pos.distanceTo(site.position) < site.radius);
  if (protectedSite) {
    reportProtectedStrike(protectedSite, owner);
    return;
  }
  bombShip(pos, owner);
  bombTrain(pos, owner);
  damageAirfield(pos, owner);
  damageIndustrialSite(pos, owner);
  for (const w of walkers) {
    if (!w.dead && w.g.position.distanceTo(pos) < 12) {
      w.dead = 15;
      w.g.rotation.x = Math.PI / 2;
      if (owner === player && w.team !== sel.team) cashAdd(25, 'Ground crew hit');
    }
  }
  for (const v of groundVehicles) {
    if (v.dead <= 0 && v.team !== owner.team && v.g.position.distanceTo(pos) < (v.type === 'tank' ? 15 : 12)) damageGroundVehicle(v, owner);
  }
}
function notifyOutOfAmmo() {
  if (!player || player.ammoEmptyNotice) return;
  player.ammoEmptyNotice = true;
  say('Out of ammunition — descend over a friendly runway to refuel');
}
function playerGun(dir) {
  if (!player) return false;
  if (isAirportWeaponsLocked(player)) {
    reportAirportWeaponLock(player);
    return false;
  }
  if (player.ammo <= 0) {
    notifyOutOfAmmo();
    return false;
  }
  const origin = player.twoSeater || player.bomber && role === 'gun' ? camera.position.clone() : player.g.position.clone().add(new THREE.Vector3(0, 3, 0)).addScaledVector(dir, 6);
  const s = 0.03 - (Number(activeEconomy().acc) || 0) * 0.006;
  dir.add(new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).multiplyScalar(s)).normalize();
  const m = new THREE.Mesh(bulletGeo, bulletMat);
  m.position.copy(origin);
  m.lookAt(origin.clone().add(dir));
  scene.add(m);
  const bullet = {
    m,
    v: dir.multiplyScalar(320),
    owner: player,
    life: 2
  };
  trackBullet(bullet);
  shotSound();
  player.ammo--;
  if (player.ammo <= 0) {
    player.ammo = 0;
    notifyOutOfAmmo();
  }
  void 0;
  return true;
}
const battlefieldTracerGeo = new THREE.BoxGeometry(0.09, 0.09, 1);
const battlefieldTracerMat = new THREE.MeshBasicMaterial({
  color: 0xffd27a,
  transparent: true,
  opacity: 0.92,
  depthWrite: false
});
function updateTrenchBattle(dt) {
  for (const troop of trenchTroops) {
    troop.animT += dt;
    troop.recoil = THREE.MathUtils.damp(troop.recoil, 0, 13, dt);
    const sway = Math.sin(troop.animT * 1.15 + troop.phase);
    troop.person.torso.position.y = 0.99 + Math.sin(troop.animT * 2.3 + troop.phase) * 0.014;
    troop.person.torso.rotation.z = sway * 0.012;
    troop.person.headPivot.rotation.y = Math.sin(troop.animT * 0.48 + troop.phase) * 0.2;
    troop.person.headPivot.rotation.x = Math.sin(troop.animT * 0.72 + troop.phase) * 0.035;
    troop.person.armPivots.forEach((arm, index) => {
      const side = index === 0 ? -1 : 1;
      arm.rotation.x = 0.78 + Math.sin(troop.animT * 1.8 + troop.phase + index) * 0.025;
      arm.rotation.z = -side * 0.35 + Math.sin(troop.animT * 1.3 + troop.phase) * 0.018;
    });
    troop.rifle.position.z = -0.2 + troop.recoil * 0.075;
    troop.flashT -= dt;
    troop.flash.visible = troop.flashT > 0;
    if (openingEffectsWarmup > 0) continue;
    troop.nextShot -= dt;
    if (troop.nextShot > 0) continue;
    troop.nextShot = 0.8 + Math.random() * 4.6;
    troop.flashT = 0.11;
    troop.recoil = 1;
    troop.flash.visible = true;
    troop.g.updateMatrixWorld(true);
    const from = troop.flash.getWorldPosition(new THREE.Vector3());
    const targetX = from.x - troop.side * (55 + Math.random() * 120);
    const targetZ = from.z + (Math.random() - 0.5) * 65;
    const target = new THREE.Vector3(targetX, heightAt(targetX, targetZ) + 1.4, targetZ);
    const tracer = new THREE.Mesh(battlefieldTracerGeo, battlefieldTracerMat);
    tracer.position.copy(from).lerp(target, 0.5);
    tracer.lookAt(target);
    tracer.scale.z = from.distanceTo(target);
    scene.add(tracer);
    battleTracers.push({
      m: tracer,
      life: 0.13
    });
  }
  for (const tracer of battleTracers) {
    tracer.life -= dt;
    if (tracer.life <= 0) scene.remove(tracer.m);
  }
  battleTracers = battleTracers.filter(t => t.life > 0);
}
function updateFrontTrain(dt) {
  if (!frontTrain) return;
  const f = frontTrain;
  const routeSpeed = 12.5;
  if (!f.destroyed) {
    f.u += routeSpeed / f.curveLength * dt * (f.dir || 1);
    if (f.u > 0.965) {
      f.u = 0.965;
      f.dir = -1;
    }
    if (f.u < 0.035) {
      f.u = 0.035;
      f.dir = 1;
    }
    f.wheelPhase = (f.wheelPhase || 0) + routeSpeed * f.dir * dt;
  }
  for (const car of f.parts) {
    const u = THREE.MathUtils.clamp(f.u - car.userData.offset, 0.01, 0.99);
    const axleOffset = 4.05 / f.curveLength;
    const frontAxle = f.curve.getPointAt(THREE.MathUtils.clamp(u + axleOffset, 0.01, 0.99));
    const rearAxle = f.curve.getPointAt(THREE.MathUtils.clamp(u - axleOffset, 0.01, 0.99));
    const pos = frontAxle.clone().add(rearAxle).multiplyScalar(0.5);
    const tangent = frontAxle.sub(rearAxle).setY(0).normalize();
    const animateDetails = !save.reducedGraphics || pos.distanceToSquared(camera.position) < 900 * 900;
    const suspension = f.destroyed || !animateDetails ? 0 : Math.sin((f.wheelPhase || 0) * 0.45 + car.userData.offset * 500) * 0.035;
    car.position.set(pos.x, pos.y + 0.25 + suspension, pos.z);
    car.rotation.set(0, Math.atan2(-tangent.x, -tangent.z), 0);
    if (!f.destroyed && animateDetails) {
      for (const wheel of car.userData.wheels) {
        const angularSpeed = routeSpeed * f.dir / (wheel.userData.radius || 0.9);
        wheel.rotation.x -= angularSpeed * dt;
      }
      for (let i = 0; i < (car.userData.driveRods || []).length; i++) {
        const rod = car.userData.driveRods[i];
        const phase = (f.wheelPhase || 0) / (car.userData.axleY || 1) + i * Math.PI;
        rod.position.y = car.userData.axleY + Math.sin(phase) * 0.2;
        rod.rotation.z = Math.cos(phase) * 0.045;
      }
    }
  }
  f.puff -= dt;
  if (f.puff <= 0) {
    f.puff = f.destroyed ? 0.16 : 0.48 + Math.random() * 0.34;
    f.engineCar.updateWorldMatrix(true, false);
    const stack = f.engineCar.localToWorld(f.engineCar.userData.stack.clone());
    if (f.destroyed) {
      smoke(stack, 1.15 + Math.random() * 0.3, 4.2, 0x211f1d, -0.34, 0.48, -0.12, 0.82);
      if (Math.random() < 0.55) smoke(stack.clone().add(new THREE.Vector3(0, -1.2, 1)), 0.34, 0.38, 0xff681c, 0, 0.08, 0, 0.72);
    } else {
      smoke(stack, 0.3, 1.8, 0x302f2c, -0.1, 0.38, -0.04, 0.52, 0.22);
      smoke(stack.clone().add(new THREE.Vector3(0, 0.55, 0)), 0.4, 2.35, 0x777a78, -0.14, 0.48, -0.06, 0.42, 0.35);
    }
  }
  // A denser, taller pale steam plume rises from the stack as the train runs.
  f.steamPuff -= dt;
  if (!f.destroyed && f.steamPuff <= 0) {
    f.steamPuff = 0.13 + Math.random() * 0.08;
    f.engineCar.updateWorldMatrix(true, false);
    const stack = f.engineCar.localToWorld(f.engineCar.userData.stack.clone());
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(f.engineCar.quaternion).multiplyScalar(-(f.dir || 1));
    const drift = 0.8 + Math.random() * 0.7;
    smoke(stack.clone().add(new THREE.Vector3((Math.random() - 0.5) * 0.5, 0.4, (Math.random() - 0.5) * 0.3)), 0.58 + Math.random() * 0.28, 3.4 + Math.random() * 0.6, 0xd6d8d5, forward.x * drift, 1.45 + Math.random() * 0.5, forward.z * drift, 0.52, 1.65);
  }
}
function damageFrontTrain(owner, amount = 1, hitPosition = null) {
  const f = frontTrain;
  if (!f || f.destroyed || !owner?.team || owner.team === f.team) return false;
  f.hits = Math.min(f.maxHits, f.hits + amount);
  const impact = hitPosition ? hitPosition.clone() : f.engineCar.position.clone().add(new THREE.Vector3(0, 3, 0));
  if (f.hits >= f.maxHits) {
    f.destroyed = true;
    f.dir = 0;
    f.puff = 0;
    say('The supply train has been destroyed!');
    feed('SUPPLY TRAIN DESTROYED · The rail line is out of action');
    boom(impact);
    for (const material of f.trainMaterials || []) material.color.multiplyScalar(0.48);
    if (owner === player && owner.team !== f.team) {
      recordCareerCounter('trainKills');
      cashAdd(200, 'Enemy supply train destroyed');
    }
    return true;
  }
  smoke(impact, 0.38 + f.hits * 0.045, 1.45, 0x514d45, -0.08, 0.3, 0, 0.62);
  if (owner === player && f.hits % 2 === 0) say(`Supply train hit · ${f.maxHits - f.hits} more hits to disable`);
  return false;
}
function animateFlagCloth(flag, time, width, height, amplitude = 0.28) {
  const positions = flag.geometry.attributes.position;
  const phase = flag.userData.windPhase || 0;
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i);
    const y = positions.getY(i);
    const u = THREE.MathUtils.clamp((x + width / 2) / width, 0, 1);
    const v = (y + height / 2) / height;
    const ripple = Math.sin(time * 2.7 - u * 4.8 + v * 1.3 + phase);
    positions.setZ(i, u * (amplitude * ripple + amplitude * 0.25 * Math.sin(time * 4.1 + u * 7 + phase)));
  }
  positions.needsUpdate = true;
}
const flagWindWorldPosition = new THREE.Vector3();
function animateFlagIfNearby(flag, time, width, height, amplitude, maxDistance) {
  if (save.reducedGraphics) {
    if (time - (flag.userData.windTick ?? -Infinity) < 0.14) return;
    flag.getWorldPosition(flagWindWorldPosition);
    if (flagWindWorldPosition.distanceToSquared(camera.position) > maxDistance * maxDistance) return;
    flag.userData.windTick = time;
  }
  animateFlagCloth(flag, time, width, height, amplitude);
}
function animateFieldFlags(time) {
  for (const flag of fieldFlags) animateFlagIfNearby(flag, time, 3.6, 2, 0.28, 900);
  for (const sector of sectorControl) if (sector.flagCloth) animateFlagIfNearby(sector.flagCloth, time, 3.6, 2, 0.22, 850);
  for (const flag of shipFlags) {
    const width = flag.geometry.parameters.width;
    const height = flag.geometry.parameters.height;
    animateFlagIfNearby(flag, time, width, height, 0.2, 1000);
  }
}
function processOpeningSpawnQueue(dt) {
  if (!openingSpawnQueue.length) {
    openingSpawnTimer = 0;
    return;
  }
  openingSpawnTimer = Math.max(0, openingSpawnTimer - dt);
  if (openingSpawnTimer > 0) return;
  const task = openingSpawnQueue.shift();
  if (task.type === 'bot') spawnBot(...(task.args || []));else if (task.type === 'blimp') spawnBlimp(task.team);else if (task.type === 'walker') spawnWalker(task.field);
  openingSpawnTimer = Math.max(0, Number(task.delay) || 0);
}
function updateWorld(dt) {
  if (roundInProgress) roundT -= dt;
  if (openingLaunchReleased && openingLaunchDelay > 0) openingLaunchDelay = Math.max(0, openingLaunchDelay - dt);
  if (roundInProgress) {
    updateDaylight();
    missionElapsed = Math.min(MISSION_OPENING_SECONDS, missionElapsed + dt);
    if (roundT <= 0 || sel.gameMode === 'squadron' && (tickets.blue <= 0 || tickets.red <= 0)) return endRound();
  } else return;
  updateSectorFlagTransitions(dt);
  updateSectorCapture(dt);
  openingEffectsWarmup = Math.max(0, openingEffectsWarmup - dt);
  processOpeningSpawnQueue(dt);
  updateRecoveryCaches(dt);
  updateIndustrialSites(dt);
  if (sel.gameMode !== 'squadbattle') {
    bomberRaidCountdown -= dt;
    if (bomberRaidCountdown <= 0) {
      const raid = spawnBot(nextBomberRaidTeam, true);
      if (raid) {
        nextBomberRaidTeam = nextBomberRaidTeam === 'blue' ? 'red' : 'blue';
        bomberRaidCountdown += 60;
      } else bomberRaidCountdown = 5;
    }
  }
  const t = performance.now() * 0.003;
  for (const a of shopArrows) a.position.y = a.userData.y + Math.sin(t) * 0.6;
  for (const p of planes) if (p.ribbonCloths) p.ribbonCloths.forEach(cloth => animateRibbon(cloth, t));
  for (const ace of planes) {
    if (!ace.ace || !areHostilePilots(ace, player) || ace.dying || !ace.g.visible) continue;
    ace.aceSmokeTimer = (ace.aceSmokeTimer ?? 0) - dt;
    if (ace.aceSmokeTimer > 0) continue;
    ace.aceSmokeTimer = 0.085;
    const tailPosition = ace.g.localToWorld(new THREE.Vector3(0, 0, 2.35));
    smoke(tailPosition, 0.115, 1.25, 0xa93235, 0, 0.025, 0, 0.38, 0.12);
  }
  updateFlak(dt);
  updateGroundVehicles(dt);
  if (sel.map === 'trenches') {
    updateFrontTrain(dt);
    updateTrenchBattle(dt);
  } else if (sel.map === 'bedroom') {
    updateBedroomTrain(bedroomTrain, dt);
  }
  if (sel.map === 'trenches') {
    for (const source of factorySmokeSources) {
      if (source.disabled || source.site?.destroyed || source.chimney?.userData.fallen) continue;
      source.timer -= dt;
      if (source.timer > 0) continue;
      if (source.citySmoke) {
        source.timer = 0.42 + Math.random() * 0.2;
        smoke(source.position.clone(), 1.3 + Math.random() * 0.55, 7.2, 0x383633, -0.28, 1.9, 0.06, 0.56, 2.6);
      } else {
        source.timer = 0.24 + Math.random() * 0.22;
        smoke(source.position.clone(), 0.72 + Math.random() * 0.3, 4.8, 0x302c28, -0.35, 1.2, 0.06, 0.4, 1.5);
      }
    }
  }
  for (const source of airfieldDamageSources) {
    source.timer -= dt;
    if (source.timer > 0) continue;
    source.timer = 0.6 + Math.random() * 1.2;
    smoke(source.position.clone(), 0.42 + Math.random() * 0.3, 3.1, 0x292521, -0.12, 0.7, 0.05, 0.62, 1.1);
  }
  battleBurstT -= dt;
  if (battleBurstT <= 0) {
    battleBurstT = 14 + Math.random() * 24;
    ambientBattleBlast();
  }
  for (const w of wrecks) {
    w.t += dt;
    if (w.t >= 24) {
      w.expired = true;
      scene.remove(w.g);
      continue;
    }
    w.puff -= dt;
    const smokeDuration = w.smokeDuration || 18;
    if (w.t < smokeDuration && w.puff < 0) {
      const fade = 1 - THREE.MathUtils.smoothstep(w.t, smokeDuration * 0.66, smokeDuration);
      w.puff = w.t < w.fireTime ? 0.16 : 0.2 + (1 - fade) * 0.72;
      const source = w.g.position.clone().add(new THREE.Vector3(0, 1.35, 0));
      if (w.t < w.fireTime) {
        smoke(source, 0.3 + Math.random() * 0.08, 0.42, 0xff6a18, 0, 0.16, 0, 0.76);
        smoke(source.clone().add(new THREE.Vector3(0, 0.55, 0)), 2.15 + Math.random() * 0.45, 8.5, 0x292824, -0.25, 3.2, -0.08, 0.88 * fade, 3.1);
      } else if (fade > 0.015) {
        smoke(source, 2.45 + Math.random() * 0.65, 8.5, 0x292824, -0.62, 3.5, -0.22, 0.88 * fade, 3.5);
      }
    }
  }
  wrecks = wrecks.filter(w => !w.expired);
  for (const w of walkers) {
    const p = w.g.position;
    if (w.dead > 0) {
      w.dead -= dt;
      if (w.dead <= 0) respawnWalker(w);
    } else {
      w.walkT += dt;
      w.pauseT = Math.max(0, w.pauseT - dt);
      let dx = w.tx - p.x;
      let dz = w.tz - p.z;
      let d = Math.hypot(dx, dz);
      if (d < 1.3) {
        const target = fieldLocalPoint(w.f, 8 + Math.random() * 42, 28 + Math.random() * 64);
        w.tx = target.x;
        w.tz = target.z;
        w.pauseT = 0.45 + Math.random() * 1.45;
        dx = w.tx - p.x;
        dz = w.tz - p.z;
        d = Math.hypot(dx, dz);
      }
      const moving = w.pauseT <= 0 && d > 0.05;
      if (moving) {
        const step = Math.min(d, w.speed * dt);
        p.x += dx / d * step;
        p.z += dz / d * step;
      }
      const targetYaw = Math.atan2(-dx, -dz);
      const yawDelta = THREE.MathUtils.euclideanModulo(targetYaw - w.g.rotation.y + Math.PI, Math.PI * 2) - Math.PI;
      w.g.rotation.y += yawDelta * Math.min(1, dt * 4.2);
      const gait = Math.sin(w.walkT * 7.2 + w.phase);
      const stride = moving ? 1 : 0.055;
      w.person.legPivots[0].rotation.x = gait * 0.58 * stride;
      w.person.legPivots[1].rotation.x = -gait * 0.58 * stride;
      w.person.armPivots[0].rotation.x = -gait * 0.38 * stride;
      w.person.armPivots[1].rotation.x = gait * 0.38 * stride;
      w.person.torso.position.y = 0.99 + (moving ? Math.abs(gait) * 0.035 : 0) + Math.sin(w.walkT * 2.2 + w.phase) * 0.012;
      w.person.torso.rotation.z = Math.sin(w.walkT * 3.6 + w.phase) * (moving ? 0.025 : 0.012);
      w.person.headPivot.rotation.y = Math.sin(w.walkT * 0.72 + w.phase) * 0.24;
      w.person.headPivot.rotation.x = Math.sin(w.walkT * 1.1 + w.phase) * 0.035;
    }
    p.y = heightAt(p.x, p.z);
  }
}
function updateAirDebris(dt) {
  for (const piece of airDebris) {
    piece.life -= dt;
    piece.v.y -= 9.8 * dt;
    piece.m.position.addScaledVector(piece.v, dt);
    piece.m.rotation.x += piece.spin.x * dt;
    piece.m.rotation.y += piece.spin.y * dt;
    piece.m.rotation.z += piece.spin.z * dt;
    const floor = heightAt(piece.m.position.x, piece.m.position.z) + 0.25;
    if (piece.m.position.y < floor) {
      piece.m.position.y = floor;
      if (Math.abs(piece.v.y) > 2) piece.v.y = Math.abs(piece.v.y) * 0.2;else piece.v.y = 0;
      piece.v.x *= 0.72;
      piece.v.z *= 0.72;
      piece.spin.multiplyScalar(0.72);
      piece.life = Math.min(piece.life, 2.5);
    }
    if (piece.life <= 0) scene.remove(piece.m);
  }
  airDebris = airDebris.filter(piece => piece.life > 0);
}
function sortieEarningsMarkup() {
  const grouped = new Map();
  for (const earning of sortieEarnings) {
    const reason = String(earning.reason || 'Sortie bounty');
    const current = grouped.get(reason) || {
      reason,
      amount: 0,
      count: 0
    };
    current.amount += Math.max(0, Number(earning.amount) || 0);
    current.count++;
    grouped.set(reason, current);
  }
  const rows = [...grouped.values()].sort((a, b) => b.amount - a.amount || a.reason.localeCompare(b.reason));
  const lineItems = rows.length ? rows.slice(0, 8).map(item => `<li><span>${escapeHTML(item.reason)}${item.count > 1 ? ` ×${item.count}` : ''}</span><b>+$${item.amount}</b></li>`).join('') : '<li><span>No sortie bounties recorded</span><b>$0</b></li>';
  return `<section class="report-earnings"><h2>SORTIE EARNINGS <strong>$${score}</strong></h2><ul>${lineItems}</ul></section>`;
}
function pilotImpactMarkup(record, title = 'YOUR SORTIE') {
  const pilot = record || {
    kills: 0,
    assists: 0,
    deaths: 0,
    bestStreak: 0,
    points: 0
  };
  return `<section class="report-impact"><h2>${title}</h2><div><b>${pilot.kills || 0}<small>VICTORIES</small></b><b>${pilot.assists || 0}<small>ASSISTS</small></b><b>${pilot.deaths || 0}<small>LOSSES</small></b><b>${pilot.bestStreak || 0}<small>BEST STREAK</small></b>${sel.gameMode === 'bonanza' ? `<b>${pilot.points || 0}<small>POINTS</small></b>` : ''}</div></section>`;
}
function endRound() {
  if (!roundInProgress) return;
  toggleFieldMap(false);
  roundInProgress = false;
  void 0;
  mode = 'over';
  clearRecoveryCaches();
  setPaused(false);
  syncPauseUI();
  stopEngineAudio();
  stopTruckAudio();
  gameGen++;
  input.fire = false;
  $('actions').innerHTML = '';
  $('actions').dataset.k = '';
  stat({
    name: sel.name,
    team: sel.team,
    isPlayer: true
  }).you = true;
  const m = $('menu');
  m.style.display = 'block';
  m.style.background = '#1c1810e8';
  const aircraftName = PLANES[sel.team].find(plane => plane.id === sel.plane)?.name || 'Squadron aircraft';
  const playerRecord = stats[sel.name];
  const reportEarnings = sortieEarningsMarkup();
  const reportImpact = pilotImpactMarkup(playerRecord);
  if (sel.gameMode === 'squadbattle') {
    const squadStandings = SQUAD_TEAM_NAMES.map((name, squadTeam) => {
      const members = Object.values(stats).filter(record => record.squadTeam === squadTeam).sort((a, b) => b.kills - a.kills || a.deaths - b.deaths || a.name.localeCompare(b.name));
      return {
        squadTeam,
        name,
        color: getSquadTeamColor(squadTeam),
        members,
        kills: members.reduce((total, member) => total + member.kills, 0),
        deaths: members.reduce((total, member) => total + member.deaths, 0)
      };
    }).sort((a, b) => b.kills - a.kills || a.deaths - b.deaths || a.squadTeam - b.squadTeam);
    const bestKills = squadStandings[0]?.kills || 0;
    const bestDeaths = squadStandings[0]?.deaths || 0;
    const champions = squadStandings.filter(squad => squad.kills === bestKills && squad.deaths === bestDeaths);
    if (bestKills > 0 && champions.some(squad => squad.squadTeam === sel.squadTeam)) recordCareerBattleVictory();
    const playerPlace = squadStandings.findIndex(squad => squad.squadTeam === sel.squadTeam) + 1;
    const championNames = champions.map(squad => `${squad.name} SQUAD`).join(' & ');
    const resultTitle = champions.length > 1 ? 'MATCH DRAW' : `${escapeHTML(champions[0]?.name || 'NO SCORE')} SQUAD VICTORY`;
    const cards = squadStandings.map((squad, index) => {
      const members = squad.members.length ? squad.members.map(member => `<div class="squadbattle-member${member.you ? ' is-you' : ''}"><span>${escapeHTML(member.name)}${member.you ? ' · YOU' : ''}</span><b>${member.kills} K</b><small>${member.assists || 0} A · ${member.deaths} D · ✦${member.bestStreak || 0}</small></div>`).join('') : '<div class="squadbattle-member is-empty"><span>No recorded sorties</span></div>';
      const isChampion = champions.includes(squad);
      return `<article class="squadbattle-team${isChampion ? ' is-champion' : ''}" style="--team-color:${squad.color}"><header><span class="team-place">#${index + 1}</span><div><b>${squad.name} SQUAD</b><small>${squad.kills} victories · ${squad.deaths} losses</small></div><strong>${squad.kills}</strong></header><div class="squadbattle-members">${members}</div></article>`;
    }).join('');
    const playerTeam = squadStandings.find(squad => squad.squadTeam === sel.squadTeam);
    m.innerHTML = `<div class="squadbattle-report"><small>AFTER-ACTION REPORT · ${sel.roundMinutes}-MINUTE SQUAD BATTLE</small><h1>${resultTitle}</h1><p class="squadbattle-result">${championNames ? `${champions.length > 1 ? 'Top squads' : 'Winning squad'}: ${escapeHTML(championNames)}` : 'No victories were recorded.'} · Your ${SQUAD_TEAM_NAMES[sel.squadTeam]} squad placed #${playerPlace} with ${playerTeam?.kills || 0} victories.</p><p class="report-aircraft">Aircraft flown · ${escapeHTML(aircraftName)}</p>${reportImpact}${reportEarnings}<h2 class="report-section-title">TEAM STANDINGS</h2><div class="squadbattle-team-grid">${cards}</div><p class="squadbattle-scoring">Team ranking · confirmed aircraft victories, then fewer losses · respawns preserve each pilot’s squad.</p><button data-a="back:1">Return to HQ</button></div>`;
  } else if (sel.gameMode === 'bonanza') {
    const ranked = Object.values(stats).sort((a, b) => (b.points || 0) - (a.points || 0) || b.kills - a.kills || b.assists - a.assists || a.deaths - b.deaths);
    const bestPoints = ranked[0]?.points || 0;
    const champions = bestPoints > 0 ? ranked.filter(record => (record.points || 0) === bestPoints) : [];
    const playerWon = champions.some(record => record.you);
    const championNames = champions.map(record => escapeHTML(record.name)).join(' &amp; ');
    if (playerWon) {
      save.career.bonanzaWins++;
      recordCareerBattleVictory();
      save.career.bonanzaMvp = Math.max(0, Math.floor(Number(save.career.bonanzaMvp) || 0)) + 1;
      persist();
      checkCareerRibbonAwards();
    }
    const title = champions.length === 1 ? `${escapeHTML(champions[0].name)} · BONANZA CHAMPION` : champions.length > 1 ? 'BONANZA · TIED CHAMPIONS' : 'BONANZA · NO SCORE';
    const standings = ranked.map((record, index) => `<tr class="${record.you ? 'is-you' : ''}"><td>${index + 1}</td><td>${escapeHTML(record.name)}${record.you ? ' · YOU' : ''}</td><td>${record.points || 0}</td><td>${record.kills}</td><td>${record.assists || 0}</td><td>${record.deaths}</td><td>${record.bestStreak || 0}</td></tr>`).join('');
    const award = playerWon ? `<p class="bonanza-award-note">${champions.length > 1 ? 'Shared top score' : 'Top score'} · ${bestPoints} points · Bonanza MVP recorded (${save.career.bonanzaMvp} career total).</p>` : `<p class="bonanza-award-note">Top pilot: ${championNames || 'No pilot scored'}${bestPoints ? ` · ${bestPoints} points` : ''}. Bonanza MVP ribbon milestones: 1 / 5 / 25 top-score finishes.</p>`;
    m.innerHTML = `<div class="bonanza-report"><small>AFTER-ACTION REPORT · ${sel.bonanzaMinutes}-MINUTE FREE-FOR-ALL</small><h1>${title}</h1><p class="report-subtitle">The clock has expired · every aircraft was hostile regardless of faction.</p><p class="report-aircraft">Aircraft flown · ${escapeHTML(aircraftName)}</p>${reportImpact}${reportEarnings}<h2 class="report-section-title">PILOT LEADERBOARD</h2><div class="bonanza-report-table-wrap"><table class="bonanza-report-table"><thead><tr><th>Rank</th><th>Pilot</th><th>Points</th><th>K</th><th>A</th><th>D</th><th>Best streak</th></tr></thead><tbody>${standings}</tbody></table></div>${award}<p class="squadbattle-scoring">Scoring · 100 per down · 35 per assist · +75 every third consecutive down</p><button data-a="back:1">Return to HQ</button></div>`;
  } else {
    const win = tickets.blue === tickets.red ? 'DRAW' : (tickets.blue > tickets.red ? 'BLUE' : 'RED') + ' VICTORY';
    if (tickets[sel.team] > tickets[sel.team === 'blue' ? 'red' : 'blue']) recordCareerBattleVictory();
    const table = team => {
      const rows = Object.values(stats).filter(record => record.team === team).sort((a, b) => b.kills - a.kills || a.deaths - b.deaths || a.name.localeCompare(b.name));
      const pilotRows = rows.length ? rows.map(record => `<tr class="${record.you ? 'is-you' : ''}"><td>${escapeHTML(record.name)}${record.you ? ' · YOU' : ''}</td><td>${record.kills}</td><td>${record.assists || 0}</td><td>${record.deaths}</td><td>${record.bestStreak || 0}</td></tr>`).join('') : '<tr><td colspan="5">No recorded sorties</td></tr>';
      return `<section class="greatwar-team-card"><header class="${team}"><h2>${team.toUpperCase()} SQUADRON</h2><b>${rows.reduce((sum, record) => sum + record.kills, 0)} victories</b><small>${tickets[team]} respawn tickets remain</small></header><div class="greatwar-table-wrap"><table><thead><tr><th>Pilot</th><th>K</th><th>A</th><th>D</th><th>Streak</th></tr></thead><tbody>${pilotRows}</tbody></table></div></section>`;
    };
    m.innerHTML = `<div class="greatwar-report"><small>AFTER-ACTION REPORT · ${sel.roundMinutes}-MINUTE GREAT WAR SORTIE</small><h1>${win}</h1><p class="report-aircraft">${escapeHTML(aircraftName)} · ${escapeHTML(factionName(sel.team))}</p>${reportImpact}<h2 class="report-section-title">FACTION RESULTS · ${tickets.blue} BLUE / ${tickets.red} RED TICKETS REMAIN</h2><div class="greatwar-team-grid">${table('blue')}${table('red')}</div><button data-a="back:1">Return to HQ</button></div>`;
  }
  refreshShopPreview();
}

// ---------- Game flow ----------
function clearAll() {
  openingSpawnQueue = [];
  openingSpawnTimer = 0;
  for (const target of aceFlyoverTargets) {
    target.aircraft = null;
    target.chute = null;
    target.crashed = true;
  }
  truckDriver = null;
  Object.keys(truckInput).forEach(key => truckInput[key] = false);
  for (const p of planes) scene.remove(p.g);
  void 0;
  void 0;
  for (const puff of puffs) {
    scene.remove(puff.m);
    if (puff.smallSmoke) recycleSmokeSprite(puff.m);
    if (puff.dispose) puff.dispose();
  }
  for (const o of [...chutes, ...blimps]) scene.remove(o.m);
  for (const bl of blimps) for (const part of bl.loose || []) scene.remove(part.m);
  planes = [];
  puffs = [];
  activeSmokePuffs = 0;
  if (runwayMarshal) {
    scene.remove(runwayMarshal.g);
    runwayMarshal.g.visible = false;
    runwayMarshal.active = false;
  }
  airDebris.forEach(d => scene.remove(d.m));
  airDebris = [];
  chutes = [];
  blimps = [];
  bullets.forEach(b => scene.remove(b.m));
  bullets = [];
  wrecks.forEach(w => scene.remove(w.g));
  walkers.forEach(w => scene.remove(w.g));
  wrecks = [];
  walkers = [];
}
function startGame(spawnIdx, spectating = false) {
  if (paused) setPaused(false);
  input.ePressed = false;
  input.keys.KeyE = false;
  const pn = $('pname');
  if (pn) sel.typed = pn.value;
  sel.name = (sel.typed || '').replace(/[<>&"]/g, '').trim() || randPilotName(sel.team, sel.pilotGender);
  save.pilotName = sel.typed || '';
  save.pilotGender = sel.pilotGender;
  if (sel.gameMode === 'squadbattle') sel.team = squadBaseTeam(sel.squadTeam);
  persist();
  const freshRound = !roundInProgress;
  if (freshRound) {
    aceFlyoverTargets = [];
    runwayLaneCounters = {
      blue: 0,
      red: 0
    };
    openingLaunchReleased = !!spectating;
    openingLaunchDelay = 0;
    preflightRemaining = 0;
    preflightElapsed = 0;
    stats = {};
    bonanzaStandingsOpen = false;
    teamStandingsOpen = false;
    squadFormationSlots = [0, 0, 0, 0];
    sortieEarnings = [];
    bonanzaZoneSeed = Math.random() * Math.PI * 2;
    tickets = {
      blue: configuredSpawnLimit(),
      red: configuredSpawnLimit()
    };
    roundT = roundDuration();
    missionElapsed = 0;
    if (isGreatWarSinglePlayer()) {
      restoreGreatWarCampaign(sel.map);
    } else {
      for (const field of FIELDS[sel.map]) {
        field.bombHits = 0;
        field.disabled = false;
        field.damageGroup = null;
      }
    }
    initializeSectorControl();
    if (isGreatWarSinglePlayer()) persistGreatWarCampaign();
    industrialDamageState = Object.create(null);
    score = 0;
    if (sel.gameMode === 'bonanza' && !spectating) save.career.bonanzaSorties++;
    bomberRaidCountdown = 60;
    nextBomberRaidTeam = 'blue';
    roundInProgress = true;
  }
  const requestedField = FIELDS[sel.map][spawnIdx];
  if (!fieldAvailableToPlayer(requestedField)) {
    say(requestedField?.disabled ? `${requestedField.name} is destroyed — select a surviving available airfield` : 'Choose an available airfield to deploy');
    return;
  }
  role = 'pilot';
  cockpitPOV = false;
  look.yaw = look.pitch = 0;
  mouseAimReady = false;
  groundedAfterBailout = false;
  mountedFlak = null;
  stopEngineAudio();
  stopTruckAudio();
  clearSpectatorSelection();
  spectator.active = false;
  $('spectate-controls').style.display = 'none';
  $('menu').style.display = 'none';
  menuPilotPreview.visible = false;
  sel.spawnOnly = false;
  titleFx.visible = false;
  flashes.forEach(l => l.intensity = 0);
  clearAll();
  const f = requestedField;
  void 0;
  void 0;
  void 0;
  playerField = f;
  if (worldMapType !== sel.map || freshRound && !worldPreparedForFreshRound) buildMap();
  if (freshRound) initializeCourierMission();
  if (!sectorControl.length) initializeSectorControl();
  ensureSectorVisuals();
  if (freshRound) worldPreparedForFreshRound = false;
  if (freshRound || !recoveryCaches.length) startRecoveryCaches();
  updateDaylight();
  streak = 0;
  if (!spectating) {
    save.career.sorties++;
    persist();
  }
  battleBurstT = 10 + Math.random() * 14;
  openingEffectsWarmup = freshRound ? 3 : 1.25;
  boost.fire = boost.armor = false;
  player = buildPlayerPlane();
  player.weaponArmTimer = 0;
  player.weaponArmNotice = 0;
  player.maxHits = calcMaxHits();
  player.launchHeading = fieldRunwayHeading(f);
  player.homeField = f;
  const playerRunwayLane = nextRunwayLane(sel.team);
  player.runwayLane = playerRunwayLane;
  const launchPoint = runwayStartPoint(f, 50, playerRunwayLane);
  const gy = heightAt(launchPoint.x, launchPoint.z);
  player.g.position.set(launchPoint.x, planeGroundY(player, launchPoint.x, launchPoint.z), launchPoint.z);
  player.g.rotation.set(0, player.launchHeading, 0);
  setupRunwayMarshal(f, playerRunwayLane);
  planes.push(player);
  applyPlayerLoadoutToTeam();
  if (!freshRound && !spectating && sel.gameMode !== 'squadbattle') {
    for (let slot = 1; slot <= 3; slot++) {
      openingSpawnQueue.push({
        type: 'bot',
        args: [sel.team, false, null, null, null, false, slot],
        delay: 0.12
      });
    }
  }
  const sideOffset = new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), player.launchHeading).multiplyScalar(6);
  foot.pos.set(launchPoint.x + sideOffset.x, gy + 1.7, launchPoint.z + sideOffset.z);
  foot.jumpHeight = foot.jumpVelocity = 0;
  foot.yaw = player.launchHeading + Math.PI / 2;
  foot.pitch = 0;
  footThirdPerson = false;
  if (!walkingAvatar || walkingAvatarTeam !== sel.team || walkingAvatarGender !== sel.pilotGender) {
    if (walkingAvatar) scene.remove(walkingAvatar.g);
    const appearance = sel.pilotGender === 'female' ? {
      gender: 'female',
      hairStyle: 'braid',
      hairColor: sel.team === 'blue' ? 0x593627 : 0x39251f
    } : {
      gender: 'male',
      mustache: false
    };
    walkingAvatar = makeStylizedSoldier(sel.team, false, appearance);
    walkingAvatarTeam = sel.team;
    walkingAvatarGender = sel.pilotGender;
    walkingAvatar.g.visible = false;
    scene.add(walkingAvatar.g);
  }
  walkingAvatar.g.visible = false;
  mode = 'foot';
  unlockFieldGramophone();
  syncPauseUI();
  playerField = f;
  gameGen++;
  aliveT = 0;
  nextBonus = 180;
  // Initial formations are paced so aircraft do not materialize in one burst.
  if (freshRound) {
    missionLaunchSlots = {
      blue: 0,
      red: 0
    };
    openingSpawnQueue.push({
      type: 'blimp',
      team: 'blue',
      delay: 0.3
    });
    if (sel.gameMode === 'squadbattle') {
      for (let squad = 0; squad < 4; squad++) {
        const aircraftCount = squad === sel.squadTeam ? 2 : 3;
        for (let slot = 0; slot < aircraftCount; slot++) {
          openingSpawnQueue.push({
            type: 'bot',
            args: [squadBaseTeam(squad), false, null, null, null, true, 0, false, null, squad],
            delay: 0.22
          });
        }
      }
      openingSpawnQueue.push({
        type: 'blimp',
        team: 'red',
        delay: 0.3
      });
      enqueueOpeningWalkers(0.08);
    } else {
      if (!spectating) {
        for (let slot = 1; slot <= 3; slot++) openingSpawnQueue.push({
          type: 'bot',
          args: [sel.team, false, null, null, null, false, slot],
          delay: 0.28
        });
      }
      openingSpawnQueue.push({
        type: 'blimp',
        team: 'red',
        delay: 0.3
      });
      const friendlyBotCount = Math.max(0, sel.squadSize - (spectating ? 1 : 4));
      const enemy = enemyTeam();
      const ace = Math.random() < 0.24 ? pick(ACE_PILOTS.filter(a => a.team === enemy)) : null;
      for (let i = 0; i < Math.max(friendlyBotCount, sel.squadSize); i++) {
        if (i < friendlyBotCount) openingSpawnQueue.push({
          type: 'bot',
          args: [sel.team, false, null, null, null, false, 0, true],
          delay: 0.28
        });
        if (i < sel.squadSize) openingSpawnQueue.push({
          type: 'bot',
          args: [enemy, false, i === 0 ? ace?.name || null : null, i === 0 ? ace : null, null, false, 0, true],
          delay: 0.28
        });
      }
      enqueueOpeningWalkers(0.08);
    }
  } else if (sel.gameMode === 'squadbattle') {
    for (let squad = 0; squad < 4; squad++) {
      const aircraftCount = squad === sel.squadTeam ? 2 : 3;
      for (let slot = 0; slot < aircraftCount; slot++) {
        openingSpawnQueue.push({
          type: 'bot',
          args: [squadBaseTeam(squad), false, null, null, null, true, 0, false, null, squad],
          delay: 0.12
        });
      }
    }
  } else {
    const friendlyBotCount = Math.max(0, sel.squadSize - (spectating ? 1 : 4));
    for (let i = 0; i < friendlyBotCount; i++) {
      openingSpawnQueue.push({
        type: 'bot',
        args: [sel.team],
        delay: 0.12
      });
    }
    for (let i = 0; i < sel.squadSize - 1; i++) {
      openingSpawnQueue.push({
        type: 'bot',
        args: [enemyTeam()],
        delay: 0.12
      });
    }
    if (Math.random() < 0.24) {
      const ace = pick(ACE_PILOTS.filter(a => a.team === enemyTeam()));
      openingSpawnQueue.push({
        type: 'bot',
        args: [ace.team, false, ace.name, ace],
        delay: 0.12
      });
    } else openingSpawnQueue.push({
      type: 'bot',
      args: [enemyTeam()],
      delay: 0.12
    });
  }
  if (!freshRound) {
    openingSpawnQueue.push({
      type: 'blimp',
      team: 'blue',
      delay: 0.18
    });
    openingSpawnQueue.push({
      type: 'blimp',
      team: 'red',
      delay: 0.18
    });
    enqueueOpeningWalkers(0.06);
  }
  if (!spectating) {
    void 0;
    void 0;
  }
  const sectorAce = planes.find(p => p.ace);
  if (spectating) {
    prepareSpectatorView(f);
    mode = 'spectate';
    say('Spectating the battle — select an aircraft to follow.');
  } else {
    say(sectorAce ? `ACE SIGHTED — ${sectorAce.ace.name} is hunting this sector!` : 'Walk to your plane — or visit the SHOP under the yellow flag');
  }
}
function clearSpectatorSelection() {
  if (spectator.helper) {
    scene.remove(spectator.helper);
    spectator.helper.geometry.dispose();
    spectator.helper.material.dispose();
    spectator.helper = null;
  }
  spectator.target = null;
  const followButton = $('spectate-free');
  if (followButton) followButton.disabled = true;
  const hint = $('spectate-hint');
  if (hint) hint.textContent = 'WASD / left drag to fly · Q/E altitude · right drag to orbit · wheel or −/+ to zoom';
}
function makeSpectatorPilot() {
  const root = new THREE.Group();
  const leather = new THREE.MeshLambertMaterial({
    color: 0x564334
  });
  const trousers = new THREE.MeshLambertMaterial({
    color: 0x464336
  });
  const boots = new THREE.MeshLambertMaterial({
    color: 0x292722
  });
  const feminine = sel.pilotGender === 'female';
  const skin = new THREE.MeshLambertMaterial({
    color: 0xb78767
  });
  const cap = new THREE.MeshLambertMaterial({
    color: 0x342d27
  });
  const hair = new THREE.MeshLambertMaterial({
    color: 0x593627
  });
  const jacketTrim = new THREE.MeshLambertMaterial({
    color: 0x8b7655
  });
  const brass = new THREE.MeshLambertMaterial({
    color: 0x9a794a
  });
  const goggles = new THREE.MeshStandardMaterial({
    color: 0x302c27,
    metalness: 0.35,
    roughness: 0.62
  });
  const ember = new THREE.MeshBasicMaterial({
    color: 0xff7130
  });
  const cylinderLimb = (a, b, radius, material) => {
    const direction = b.clone().sub(a);
    const limb = new THREE.Mesh(new THREE.CylinderGeometry(radius * 0.82, radius, direction.length(), 8), material);
    limb.position.copy(a).add(b).multiplyScalar(0.5);
    limb.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
    root.add(limb);
    return limb;
  };
  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.29, 0.56, 4, 8), leather);
  torso.position.set(0, 1.02, 0);
  torso.rotation.z = -0.1;
  if (feminine) torso.scale.x = 0.94;
  root.add(torso);
  const belt = new THREE.Mesh(new THREE.CylinderGeometry(0.285, 0.255, 0.12, 12), trousers);
  belt.position.set(0, 0.78, 0);
  root.add(belt);
  const placket = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.48, 0.035), jacketTrim);
  placket.position.set(0, 1.08, -0.276);
  root.add(placket);
  for (let i = 0; i < 4; i++) {
    const button = new THREE.Mesh(new THREE.SphereGeometry(0.026, 7, 5), brass);
    button.position.set(0, 1.27 - i * 0.13, -0.302);
    root.add(button);
  }
  for (const side of [-1, 1]) {
    const pocket = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.16, 0.04), jacketTrim);
    pocket.position.set(side * 0.17, 0.94, -0.25);
    root.add(pocket);
  }
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 9), skin);
  head.position.set(0, 1.79, -0.07);
  root.add(head);
  const aviatorCap = new THREE.Mesh(new THREE.SphereGeometry(0.235, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.57), cap);
  aviatorCap.position.set(0, 1.9, -0.055);
  root.add(aviatorCap);
  if (feminine) {
    const hairBack = new THREE.Mesh(new THREE.SphereGeometry(0.225, 12, 8, 0, Math.PI * 2, Math.PI * 0.2, Math.PI * 0.62), hair);
    hairBack.position.set(0, 1.79, 0.045);
    const bun = new THREE.Mesh(new THREE.SphereGeometry(0.12, 9, 7), hair);
    bun.scale.set(0.9, 0.88, 1.12);
    bun.position.set(0, 1.68, 0.205);
    root.add(hairBack, bun);
    for (const side of [-1, 1]) {
      const lock = new THREE.Mesh(new THREE.SphereGeometry(0.075, 8, 6), hair);
      lock.scale.set(0.62, 1.3, 0.7);
      lock.position.set(side * 0.19, 1.69, 0.005);
      root.add(lock);
    }
  }
  const gogglesBar = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.09, 0.08), brass);
  gogglesBar.position.set(0, 1.82, -0.272);
  root.add(gogglesBar);
  for (const side of [-1, 1]) {
    const lens = new THREE.Mesh(new THREE.TorusGeometry(0.075, 0.025, 6, 12), goggles);
    lens.position.set(side * 0.09, 1.82, -0.3);
    root.add(lens);
    cylinderLimb(new THREE.Vector3(side * 0.15, 0.82, 0), new THREE.Vector3(side * 0.16, 0.29, -0.03), 0.105, trousers);
    const boot = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.15, 0.36), boots);
    boot.position.set(side * 0.16, 0.12, -0.1);
    root.add(boot);
  }
  // One arm braces against the biplane while the other lifts the cigarette.
  cylinderLimb(new THREE.Vector3(-0.27, 1.34, -0.02), new THREE.Vector3(-0.38, 1.47, -0.42), 0.105, leather);
  cylinderLimb(new THREE.Vector3(-0.38, 1.47, -0.42), new THREE.Vector3(-0.42, 1.44, -1.18), 0.085, leather);
  cylinderLimb(new THREE.Vector3(0.27, 1.34, -0.02), new THREE.Vector3(0.41, 1.45, -0.16), 0.105, leather);
  cylinderLimb(new THREE.Vector3(0.41, 1.45, -0.16), new THREE.Vector3(0.3, 1.69, -0.31), 0.08, leather);
  const hand = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 6), skin);
  hand.position.set(0.3, 1.69, -0.31);
  root.add(hand);
  const cigarette = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.026, 0.28, 7), new THREE.MeshLambertMaterial({
    color: 0xd7c9aa
  }));
  cigarette.rotation.z = Math.PI / 2;
  cigarette.position.set(0.35, 1.74, -0.39);
  root.add(cigarette);
  const tip = new THREE.Mesh(new THREE.SphereGeometry(0.035, 7, 5), ember);
  tip.position.set(0.49, 1.74, -0.39);
  root.add(tip);
  root.userData.cigaretteTip = new THREE.Vector3(0.5, 1.77, -0.39);
  return root;
}
function prepareSpectatorView(field) {
  spectator.active = true;
  spectator.smokeTimer = 0.35;
  const heading = fieldRunwayHeading(field);
  const aircraftPoint = fieldLocalPoint(field, 30, 2);
  const pilotPoint = fieldLocalPoint(field, 37, 4);
  const cameraPoint = fieldLocalPoint(field, 73, 26);
  const cameraLookPoint = fieldLocalPoint(field, 31, 2);
  const ground = heightAt(aircraftPoint.x, aircraftPoint.z);
  player.abandoned = true;
  player.speed = 0;
  player.g.position.set(aircraftPoint.x, planeGroundY(player, aircraftPoint.x, aircraftPoint.z), aircraftPoint.z);
  player.g.rotation.set(0, heading, 0);
  player.launchHeading = heading;
  player.homeField = field;
  spectator.pilot = makeSpectatorPilot();
  spectator.pilot.position.set(pilotPoint.x, ground, pilotPoint.z);
  spectator.pilot.rotation.y = heading + Math.PI / 2;
  world.add(spectator.pilot);
  spectator.homePosition.set(cameraPoint.x, ground + 12, cameraPoint.z);
  spectator.homeLook.set(cameraLookPoint.x, ground + 1.5, cameraLookPoint.z);
  resetSpectatorView();
  $('spectate-controls').style.display = 'flex';
}
function resetSpectatorView() {
  if (!spectator.active) return;
  clearSpectatorSelection();
  camera.position.copy(spectator.homePosition);
  camera.lookAt(spectator.homeLook);
  const angles = new THREE.Euler().setFromQuaternion(camera.quaternion, 'YXZ');
  spectator.yaw = spectator.homeYaw = angles.y;
  spectator.pitch = spectator.homePitch = angles.x;
  camera.rotation.set(spectator.pitch, spectator.yaw, 0, 'YXZ');
  spectator.vertical = 0;
  spectator.zoom = 1;
  input.mx = input.my = 0;
  look.yaw = look.pitch = 0;
  updateSpectatorZoomReadout();
}
function updateSpectatorZoomReadout() {
  const readout = $('spectate-zoom-readout');
  if (readout) readout.textContent = `ZOOM ${Math.round(spectator.zoom * 100)}%`;
}
function adjustSpectatorZoom(amount) {
  if (!spectator.active) return;
  const previousZoom = spectator.zoom;
  spectator.zoom = THREE.MathUtils.clamp(previousZoom + amount, 0.55, 2.2);
  if (!spectator.target) {
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    camera.position.addScaledVector(forward, (spectator.zoom - previousZoom) * 34);
  }
  updateSpectatorZoomReadout();
}
function returnToRunway() {
  if (mode !== 'spectate' || !player) return;
  const operationalFields = FIELDS[sel.map].filter(field => field.team === sel.team && !field.disabled);
  if (!operationalFields.length) {
    say('No operational friendly runway remains available');
    return;
  }
  const field = operationalFields.includes(playerField) ? playerField : operationalFields.slice().sort((a, b) => Math.hypot(a.x - playerField.x, a.z - playerField.z) - Math.hypot(b.x - playerField.x, b.z - playerField.z))[0];
  clearSpectatorSelection();
  if (spectator.pilot) {
    world.remove(spectator.pilot);
    spectator.pilot.traverse(object => {
      if (!object.isMesh) return;
      object.geometry.dispose();
      if (Array.isArray(object.material)) object.material.forEach(material => material.dispose());else object.material.dispose();
    });
    spectator.pilot = null;
  }
  spectator.active = false;
  spectator.zoom = 1;
  $('spectate-controls').style.display = 'none';
  stopEngineAudio();
  stopTruckAudio();
  updateFootstepAudio(false);
  const heading = fieldRunwayHeading(field);
  const runwayLane = nextRunwayLane(sel.team);
  const launchPoint = runwayStartPoint(field, 50, runwayLane);
  const planeX = launchPoint.x;
  const planeZ = launchPoint.z;
  const ground = heightAt(planeX, planeZ);
  player.abandoned = false;
  player.dying = false;
  player.g.visible = true;
  player.speed = 0;
  player.hits = 0;
  player.fireCd = 0;
  player.launchHeading = heading;
  player.runwayLane = runwayLane;
  player.g.position.set(planeX, planeGroundY(player, planeX, planeZ), planeZ);
  player.g.rotation.set(0, heading, 0);
  player.homeField = field;
  playerField = field;
  void 0;
  const sideOffset = new THREE.Vector3(4, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), heading);
  foot.pos.set(planeX + sideOffset.x, ground + 1.7, planeZ + sideOffset.z);
  foot.yaw = Math.atan2(sideOffset.x, sideOffset.z);
  foot.pitch = 0;
  groundedAfterBailout = false;
  cockpitPOV = false;
  role = 'pilot';
  mode = 'foot';
  input.mx = input.my = 0;
  input.fire = false;
  for (const code of Object.keys(input.keys)) input.keys[code] = false;
  camera.position.copy(foot.pos);
  camera.rotation.set(foot.pitch, foot.yaw, 0, 'YXZ');
  say(`${field.name} · ready to board your aircraft`);
}
function selectSpectatedPlane(clientX, clientY) {
  if (!spectator.active) return;
  spectatePointer.set(clientX / innerWidth * 2 - 1, -(clientY / innerHeight) * 2 + 1);
  spectateRaycaster.setFromCamera(spectatePointer, camera);
  scene.updateMatrixWorld(true);
  const candidates = planes.filter(plane => plane !== player && plane.g.visible && !plane.dying);
  const intersections = spectateRaycaster.intersectObjects(candidates.map(plane => plane.g), true);
  let selected = null;
  if (intersections.length) {
    let object = intersections[0].object;
    while (object && !selected) {
      selected = candidates.find(plane => plane.g === object) || null;
      object = object.parent;
    }
  }
  if (!selected) return;
  if (spectator.target === selected) {
    clearSpectatorSelection();
    return;
  }
  clearSpectatorSelection();
  spectator.target = selected;
  spectator.helper = new THREE.BoxHelper(selected.g, 0xffd04b);
  spectator.helper.material.depthTest = false;
  spectator.helper.material.transparent = true;
  spectator.helper.material.opacity = 0.95;
  scene.add(spectator.helper);
  const followButton = $('spectate-free');
  followButton.disabled = false;
  $('spectate-hint').textContent = `${selected.name || 'Aircraft'} · ${selected.team.toUpperCase()} — following · click it again to release`;
}
function updateSpectator(dt, mx, my, keys) {
  if (!spectator.active) return;
  const selected = spectator.target;
  if (selected && !planes.includes(selected)) clearSpectatorSelection();
  if (player?.prop) player.prop.rotation.z += dt * 2.2;
  spectator.smokeTimer -= dt;
  if (spectator.smokeTimer <= 0 && spectator.pilot) {
    spectator.smokeTimer = 1.05;
    spectator.pilot.updateMatrixWorld(true);
    const smokePosition = spectator.pilot.localToWorld(spectator.pilot.userData.cigaretteTip.clone());
    smoke(smokePosition, 0.045, 0.85, 0xaaa59a, 0.015, 0.22, 0, 0.36, 0.55);
  }
  if (spectator.target) {
    const target = spectator.target;
    const offset = new THREE.Vector3(0, 16 / spectator.zoom, 54 / spectator.zoom).applyAxisAngle(new THREE.Vector3(0, 1, 0), spectator.yaw).applyAxisAngle(new THREE.Vector3(1, 0, 0), spectator.pitch).applyQuaternion(target.g.quaternion);
    const desired = target.g.position.clone().add(offset);
    camera.position.lerp(desired, 1 - Math.exp(-dt * 3.5));
    camera.lookAt(target.g.position.clone().add(new THREE.Vector3(0, 3, 0)));
    if (spectator.helper) spectator.helper.update();
    return;
  }
  const forward = new THREE.Vector3(-Math.sin(spectator.yaw), 0, -Math.cos(spectator.yaw));
  const right = new THREE.Vector3(-forward.z, 0, forward.x);
  const speed = (keys.ShiftLeft || keys.ShiftRight ? 2.2 : 1) * 175 * dt;
  camera.position.addScaledVector(forward, -my * speed).addScaledVector(right, mx * speed);
  const vertical = THREE.MathUtils.clamp((keys.KeyE ? 1 : 0) + (keys.Space ? 1 : 0) - (keys.KeyQ ? 1 : 0) - (keys.ControlLeft ? 1 : 0) + (spectator.vertical || 0), -1, 1);
  camera.position.y += vertical * 135 * dt;
  if (sel.map === 'bedroom') {
    camera.position.x = THREE.MathUtils.clamp(camera.position.x, BEDROOM_BOUNDS.minX + 10, BEDROOM_BOUNDS.maxX - 10);
    camera.position.z = THREE.MathUtils.clamp(camera.position.z, BEDROOM_BOUNDS.minZ + 10, BEDROOM_BOUNDS.maxZ - 10);
    camera.position.y = THREE.MathUtils.clamp(camera.position.y, 65, BEDROOM_BOUNDS.ceiling - 8);
  } else {
    camera.position.x = THREE.MathUtils.clamp(camera.position.x, -1880, 1880);
    camera.position.z = THREE.MathUtils.clamp(camera.position.z, -1880, 1880);
    camera.position.y = THREE.MathUtils.clamp(camera.position.y, heightAt(camera.position.x, camera.position.z) + 12, 1000);
  }
  camera.rotation.set(spectator.pitch, spectator.yaw, 0, 'YXZ');
}
$('spectate-home').addEventListener('click', returnToRunway);
$('spectate-zoom-out').addEventListener('click', () => adjustSpectatorZoom(-0.16));
$('spectate-zoom-in').addEventListener('click', () => adjustSpectatorZoom(0.16));
$('spectate-free').addEventListener('click', () => {
  if (mode !== 'spectate' || !spectator.target) return;
  const angles = new THREE.Euler().setFromQuaternion(camera.quaternion, 'YXZ');
  spectator.yaw = angles.y;
  spectator.pitch = THREE.MathUtils.clamp(angles.x, -1.2, 1.2);
  spectator.vertical = 0;
  clearSpectatorSelection();
});
let playerField = {
  x: -600,
  z: 0
};
let gameGen = 0;
let aliveT = 0;
let nextBonus = 180;
const enemyTeam = () => sel.team === 'blue' ? 'red' : 'blue';
function later(fn, ms) {
  scheduleGameplayTimeout(fn, ms);
}
function scheduleBotReplacement(p) {
  if (!p.bot || p.ace || p.raidBomber) return;
  const keepsAircraftType = sel.gameMode !== 'squadron' || p.initialWingman;
  const variant = keepsAircraftType ? p.botVariant || 'fighter' : null;
  const delay = p.botVariant === 'bomber' ? 90000 : 8000;
  const homeField = p.homeField || p.runwayField || null;
  later(() => spawnBot(p.team, false, p.name, null, variant, false, p.wingmanSlot || 0, false, homeField, p.squadTeam), delay);
}
function spawnBot(team, bomber = false, name = null, ace = null, variant = null, initialFormation = false, wingmanSlot = 0, missionLaunch = false, preferredHomeField = null, squadTeam = null) {
  const raidBomber = bomber;
  if (sel.gameMode === 'squadbattle') {
    squadTeam = Number.isInteger(squadTeam) ? squadTeam : Math.floor(Math.random() * 4);
    squadTeam = THREE.MathUtils.clamp(squadTeam, 0, 3);
    team = squadBaseTeam(squadTeam);
  }
  const playerTeamMember = sel.gameMode === 'bonanza' ? false : sel.gameMode === 'squadbattle' ? squadTeam === sel.squadTeam : team === sel.team;
  const followsPlayerAircraft = sel.gameMode === 'squadbattle' || wingmanSlot > 0;
  const wingmanStats = playerTeamMember && followsPlayerAircraft && !raidBomber ? PLANES[team].find(plane => plane.id === sel.plane) || PLANES[team][0] : null;
  if (raidBomber) variant = 'raid';else if (wingmanStats) variant = wingmanStats.twoSeater ? 'twoSeater' : wingmanStats.bomber ? 'bomber' : wingmanStats.tri ? 'triplane' : 'fighter';else if (ace) variant = Math.random() < 0.5 ? 'fighter' : 'triplane';else if (!['fighter', 'triplane', 'bomber', 'twoSeater'].includes(variant)) {
    const roll = Math.random();
    variant = roll < 1 / 12 ? 'twoSeater' : roll < 1 / 12 + 1 / 15 ? 'bomber' : roll < 1 / 12 + 1 / 15 + 1 / 10 ? 'triplane' : 'fighter';
  }
  const regularCount = sel.gameMode === 'squadbattle' ? planes.filter(p => p.squadTeam === squadTeam && !p.raidBomber && !p.dying).length : planes.filter(p => p.team === team && !p.raidBomber).length;
  const raidCount = planes.filter(p => p.team === team && p.raidBomber).length;
  const teamCapacity = sel.gameMode === 'squadbattle' ? 3 : sel.squadSize;
  if (raidBomber ? raidCount >= 3 : regularCount >= teamCapacity) return null;
  const isTriplane = variant === 'triplane';
  const isTwoSeater = variant === 'twoSeater';
  const isBomber = variant === 'bomber' || raidBomber;
  const matchingPaint = wingmanStats ? activeEconomy().paint || (wingmanStats.id === 'baron' ? '#c0180e' : null) : null;
  const botPaint = sel.gameMode === 'squadbattle' ? getSquadTeamColor(squadTeam) : sel.gameMode === 'bonanza' ? pick(BONANZA_PAINTS) : ace ? pick(ACE_PAINTS) : matchingPaint;
  const b = makePlane(team, botPaint, isTriplane);
  b.squadTeam = sel.gameMode === 'squadbattle' ? squadTeam : null;
  b.bot = true;
  b.pilotAppearance = makeBotPilotAppearance(ace?.gender || null);
  b.name = name || randPilotName(team, b.pilotAppearance.gender);
  b.ace = ace;
  b.botVariant = variant;
  b.raidBomber = raidBomber;
  if (playerTeamMember) {
    const insignia = INSIGNIA.find(item => item.id === save.logo);
    if (save.logo === 'custom' && save.customLogo) applyPilotLogo(b, 'custom');else if (insignia && save.career.aircraftKills >= insignia.unlockAt) applyPilotLogo(b, save.logo);
  }
  if (ace) addRibbons(b, false);
  stat(b);
  const triStats = PLANES[team].find(plane => plane.tri);
  const twoSeatStats = PLANES[team].find(plane => plane.twoSeater);
  b.stats = wingmanStats || (raidBomber ? {
    speed: 34,
    turn: 0.7,
    armor: 0.5
  } : isBomber ? {
    speed: 36,
    turn: 0.82,
    armor: 0.32
  } : isTwoSeater ? twoSeatStats || PLANES[team][0] : isTriplane ? triStats || {
    speed: 51,
    turn: 1.8,
    armor: 0.18
  } : ace ? {
    speed: ace.speed,
    turn: ace.turn,
    armor: 0.18
  } : PLANES[team][0]);
  const side = team === sel.team ? playerField.x : -playerField.x;
  const bedroom = sel.map === 'bedroom';
  const availableRunways = FIELDS[sel.map].filter(field => !field.disabled && (sel.gameMode === 'bonanza' || field.team === team));
  const launchRunways = availableRunways.filter(field => !field.rear);
  const preferredRunways = launchRunways.length ? launchRunways : availableRunways;
  const missionLaunchSlot = missionLaunch ? missionLaunchSlots[team]++ : -1;
  const homeOrigin = preferredHomeField || (team === sel.team ? playerField : preferredRunways[0]);
  const resolvedHomeField = sel.gameMode === 'bonanza' && availableRunways.length ? pick(availableRunways) : availableRunways.includes(preferredHomeField) ? preferredHomeField : homeOrigin && availableRunways.length ? availableRunways.slice().sort((a, b) => Math.hypot(a.x - homeOrigin.x, a.z - homeOrigin.z) - Math.hypot(b.x - homeOrigin.x, b.z - homeOrigin.z))[0] : preferredRunways[0] || null;
  const openingRunwaySlots = preferredRunways.flatMap(field => runwayLaneOffsets().map(lane => ({
    field,
    lane
  })));
  if (team === sel.team && player && playerField) {
    const occupiedSlot = openingRunwaySlots.findIndex(slot => slot.field === playerField && slot.lane === player.runwayLane);
    if (occupiedSlot >= 0) openingRunwaySlots.splice(occupiedSlot, 1);
  }
  const missionRunwaySlot = missionLaunch && openingRunwaySlots.length ? openingRunwaySlots[missionLaunchSlot % openingRunwaySlots.length] : null;
  const runwayField = sel.gameMode === 'bonanza' && !raidBomber && availableRunways.length ? pick(availableRunways) : missionLaunch && !raidBomber && missionRunwaySlot ? missionRunwaySlot.field : preferredHomeField && !raidBomber ? resolvedHomeField : !initialFormation && !isBomber && !raidBomber && availableRunways.length && Math.random() < 0.18 ? pick(availableRunways) : null;
  const runwayLane = runwayField ? missionLaunch && missionRunwaySlot ? missionRunwaySlot.lane : nextRunwayLane(team) : 0;
  const runwayQueue = missionLaunch && openingRunwaySlots.length ? Math.floor(missionLaunchSlot / openingRunwaySlots.length) : 0;
  b.initialFormation = initialFormation;
  b.initialWingman = !!wingmanSlot;
  b.missionLaunch = !!missionLaunch;
  b.missionLaunchSlot = missionLaunchSlot;
  b.launchQueueWait = missionLaunch ? runwayQueue * 1.35 + Math.random() * 0.25 : 0;
  b.openingLaunchPending = missionLaunch && !openingLaunchReleased;
  b.openingOrbitPhase = Math.random() * Math.PI * 2;
  b.airfieldTakeoff = !!runwayField || !!wingmanSlot;
  b.homeField = runwayField || resolvedHomeField;
  if (wingmanSlot) {
    const heading = fieldRunwayHeading(playerField);
    const forward = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), heading);
    const spacing = 18 * wingmanSlot;
    b.g.position.copy(player.g.position).addScaledVector(forward, -spacing);
    b.g.position.y = planeGroundY(b, b.g.position.x, b.g.position.z);
    b.g.rotation.set(0, heading, 0);
    b.runwayHeading = heading;
    b.runwayField = playerField;
    b.runwayLane = player.runwayLane || 0;
    b.homeField = playerField;
    b.wingmanTakeoff = true;
    b.wingmanSlot = wingmanSlot;
    b.wingmanWait = 0.55 + (wingmanSlot - 1) * 1.2;
    b.wingmanEscortT = 18;
  } else if (initialFormation) {
    const formationSlot = squadFormationSlots[squadTeam]++;
    if (squadTeam === sel.squadTeam && player?.g && playerField) {
      const heading = fieldRunwayHeading(playerField);
      const forward = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), heading);
      const lateral = new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), heading);
      b.g.position.copy(player.g.position).addScaledVector(forward, 58 + formationSlot * 30).addScaledVector(lateral, (formationSlot % 2 ? 1 : -1) * 21);
      b.g.position.y += 50 + formationSlot * 9;
      b.g.rotation.y = heading;
    } else {
      const blueSide = team === 'blue';
      const edgeX = bedroom ? blueSide ? -250 : 250 : blueSide ? -980 : 980;
      const squadZ = (squadTeam < 2 ? -1 : 1) * (bedroom ? 105 : 285);
      const lateral = (formationSlot % 3 - 1) * (bedroom ? 20 : 32);
      const trail = Math.floor(formationSlot / 3) * (bedroom ? 27 : 42);
      b.g.position.set(edgeX, (bedroom ? 94 : 245) + Math.random() * (bedroom ? 12 : 22), squadZ + trail + lateral * 0.3);
      b.g.rotation.y = edgeX < 0 ? -Math.PI / 2 : Math.PI / 2;
    }
    b.squadFormationSlot = formationSlot;
  } else if (runwayField) {
    const runwayHeading = fieldRunwayHeading(runwayField);
    const runwayPoint = runwayStartPoint(runwayField, 38 + runwayQueue * 12, runwayLane);
    b.g.position.set(runwayPoint.x, planeGroundY(b, runwayPoint.x, runwayPoint.z), runwayPoint.z);
    b.runwayHeading = runwayHeading;
    b.runwayLane = runwayLane;
    b.runwayField = runwayField;
    b.homeField = runwayField;
    b.g.rotation.y = b.runwayHeading;
  } else if (bedroom) {
    b.g.position.set((Math.random() - 0.5) * 800, 76 + Math.random() * 92, (Math.random() - 0.5) * 620);
    b.g.rotation.y = Math.random() * Math.PI * 2;
  } else {
    b.g.position.set(side + (Math.random() - 0.5) * 300, 220 + Math.random() * 120, (Math.random() - 0.5) * 600);
    b.g.rotation.y = side > 0 ? Math.PI / 2 : -Math.PI / 2;
  }
  b.speed = runwayField || wingmanSlot ? 0 : b.stats.speed * (bedroom ? BEDROOM_FLIGHT_SPEED_SCALE : 1);
  b.think = 0;
  if (ace) {
    b.maxHits = 16;
    say(`ACE SIGHTED — ${ace.name} is on the hunt!`);
    feed(`ACE PILOT ENTERED THE SECTOR · ${ace.name}`);
  }
  if (isBomber) {
    b.bomber = true;
    b.g.scale.setScalar(raidBomber ? 2.2 : wingmanSlot ? 1.6 : 1.5);
    bomberize(b);
    b.maxHits = raidBomber ? 16 : 12;
    b.bombCd = 0;
    b.drops = 0;
    if (raidBomber) say(team === sel.team ? 'Allied bomber heading for the enemy airfield' : 'Enemy bomber inbound to your airfield!');
  }
  if (isTwoSeater) {
    twoSeatize(b);
    b.maxHits = 12;
    b.bombCd = 0.8 + Math.random() * 1.2;
    b.drops = 0;
    b.outbound = false;
  }
  if (b.runwayField || b.wingmanSlot) b.g.position.y = planeGroundY(b, b.g.position.x, b.g.position.z);
  if (playerTeamMember) {
    b.loadoutPlaneId = wingmanStats?.id || null;
    applyTeamLoadoutLevels(b);
  }
  if (team !== sel.team) {
    const mk = new THREE.Sprite(new THREE.SpriteMaterial({
      map: ace ? aceMarkTex : markTex,
      sizeAttenuation: false,
      depthTest: false,
      fog: false
    }));
    mk.scale.setScalar(raidBomber ? 0.03 : isBomber ? 0.024 : 0.013);
    mk.position.y = 3;
    mk.renderOrder = 10;
    b.g.add(mk);
    b.marker = mk;
  }
  planes.push(b);
  return b;
}
function dropBomb(b) {
  if (isAirportWeaponsLocked(b)) {
    reportAirportWeaponLock(b);
    return false;
  }
  if (b.twoSeater) {
    if ((b.bombs || 0) <= 0) {
      if (b === player) say('Bombs expended — re-stock at a friendly airfield');
      return false;
    }
    b.bombs--;
    const rackIndex = Math.max(0, (b.bombCapacity || 2) - b.bombs - 1);
    if (b.twoSeatBombMeshes?.[rackIndex]) {
      b.twoSeatBombMeshes[rackIndex].bomb.visible = false;
      b.twoSeatBombMeshes[rackIndex].rack.visible = false;
    }
    if (b === player) say(`Bomb released · ${b.bombs} remaining`);
  }
  const bombGeometry = new THREE.CapsuleGeometry(0.3, 0.9, 4, 8);
  const bombMaterial = new THREE.MeshLambertMaterial({
    color: 0x333333
  });
  const m = new THREE.Mesh(bombGeometry, bombMaterial);
  m.position.copy(b.g.position);
  scene.add(m);
  const fallT = Math.sqrt(2 * Math.max(5, m.position.y - heightAt(m.position.x, m.position.z)) / 9.8);
  puffs.push({
    m,
    life: fallT,
    vy: 0,
    bomb: true,
    spin: true,
    end: () => {
      boom(m.position);
      bombHit(m.position, b);
    },
    dispose: () => {
      bombGeometry.dispose();
      bombMaterial.dispose();
    }
  });
  return true;
}
const boomGeometry = new THREE.SphereGeometry(3, 6, 4);
function boom(pos) {
  playExplosionSound(pos);
  for (let i = 0; i < 6; i++) {
    const material = new THREE.MeshBasicMaterial({
      color: i % 2 ? 0xff8030 : 0x222222,
      transparent: true
    });
    const m = new THREE.Mesh(boomGeometry, material);
    m.position.copy(pos).add(new THREE.Vector3(Math.random() * 6 - 3, Math.random() * 4, Math.random() * 6 - 3));
    scene.add(m);
    puffs.push({
      m,
      life: 2,
      vy: 4,
      dispose: () => material.dispose()
    });
  }
}
function rearGunnerTargetPosition(target, out = new THREE.Vector3()) {
  if (target?.kind === 'plane') return out.copy(target.object.g.position);
  if (target?.kind === 'blimp') return out.copy(target.object.m.position);
  if (target?.kind === 'vehicle' || target?.kind === 'ship' || target?.kind === 'convoy') return out.copy(target.object.g.position).add(new THREE.Vector3(0, target.kind === 'vehicle' ? 1.2 : 2.6, 0));
  if (target?.kind === 'train') return out.copy(target.object.position).add(new THREE.Vector3(0, 2, 0));
  const position = target?.g?.position || target?.m?.position || target?.position;
  return position?.isVector3 ? out.copy(position) : null;
}
function gunnerFire(b, target, spread = 0.12) {
  if (isAirportWeaponsLocked(b)) {
    reportAirportWeaponLock(b);
    return false;
  }
  const origin = b.rearGunMount?.getWorldPosition(new THREE.Vector3()) || b.g.position.clone().add(new THREE.Vector3(0, 1.5, 3).applyQuaternion(b.g.quaternion));
  const targetPosition = rearGunnerTargetPosition(target);
  if (!targetPosition) return;
  const dir = targetPosition.sub(origin).normalize().add(new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).multiplyScalar(spread)).normalize();
  const m = new THREE.Mesh(bulletGeo, bulletMat);
  m.position.copy(origin);
  m.lookAt(origin.clone().add(dir));
  scene.add(m);
  trackBullet({
    m,
    v: dir.multiplyScalar(300),
    owner: b,
    life: 1.5
  });
}
function updateNpcGunnerTarget(b, dt, alive) {
  let target = b.gunnerTarget;
  if (target && (!alive(target) || !target.g.visible || !areHostilePilots(b, target) || target.g.position.distanceTo(b.g.position) > 340)) {
    target = b.gunnerTarget = null;
    b.gunnerTargetTimer = 0;
  }
  if (target) b.gunnerTargetTimer = Math.max(0, (b.gunnerTargetTimer || 0) - dt);
  if (!target || b.gunnerTargetTimer <= 0) {
    const candidates = planes.filter(p => areHostilePilots(b, p) && alive(p) && p.g.visible && p.g.position.distanceTo(b.g.position) < 280).sort((a, c) => a.g.position.distanceToSquared(b.g.position) - c.g.position.distanceToSquared(b.g.position));
    target = candidates[0] || null;
    b.gunnerTarget = target;
    b.gunnerTargetTimer = target ? 4.5 + Math.random() * 1.5 : 0.65;
  }
  return target;
}
function updatePlayerRearGunner(p, dt) {
  if (!p?.twoSeater || p.rearGunnerWounded || role !== 'pilot' || p.dying) return;
  p.gunnerTargetTimer = Math.max(0, (p.gunnerTargetTimer || 0) - dt);
  const current = p.gunnerTarget;
  const currentObject = current?.object;
  const currentAlive = current && (current.kind === 'plane' ? planes.includes(currentObject) && !currentObject.dying && !currentObject.wingFailure && currentObject.g.visible : current.kind === 'blimp' ? currentObject.hp > 0 && currentObject.state !== 'falling' : current.kind === 'vehicle' ? currentObject.dead <= 0 : current.kind === 'ship' || current.kind === 'convoy' ? currentObject.sunk <= 0 : current.kind === 'train' ? !frontTrain?.destroyed : false);
  const origin = p.g.localToWorld(new THREE.Vector3(0, 1.1, 1.55));
  const rearForward = new THREE.Vector3(0, 0, 1).applyQuaternion(p.g.quaternion);
  if (!currentAlive || p.gunnerTargetTimer <= 0) {
    const candidates = [];
    const offer = (kind, object, position) => {
      if (!object || (kind === 'plane' ? !areHostilePilots(p, object) : object.team === p.team)) return;
      const direction = position.clone().sub(origin);
      const distanceSq = direction.lengthSq();
      if (distanceSq < 16 || distanceSq > 300 * 300) return;
      direction.normalize();
      if (rearForward.dot(direction) < -0.24) return;
      candidates.push({
        kind,
        object,
        team: object.team,
        distanceSq
      });
    };
    for (const plane of planes) if (plane !== p && areHostilePilots(p, plane) && !plane.dying && !plane.wingFailure && plane.g.visible) offer('plane', plane, plane.g.position);
    for (const blimp of blimps) if (blimp.hp > 0 && blimp.state !== 'falling') offer('blimp', blimp, blimp.m.position);
    for (const vehicle of groundVehicles) if (vehicle.dead <= 0) offer('vehicle', vehicle, vehicle.g.position);
    for (const ship of ships) if (ship.sunk <= 0) offer('ship', ship, ship.g.position);
    for (const vessel of convoyVessels) if (vessel.sunk <= 0) offer('convoy', vessel, vessel.g.position);
    if (frontTrain && !frontTrain.destroyed && frontTrain.team !== p.team) {
      let nearestPart = null;
      for (const part of frontTrain.parts) {
        if (!nearestPart || part.position.distanceToSquared(origin) < nearestPart.position.distanceToSquared(origin)) nearestPart = part;
      }
      if (nearestPart) offer('train', nearestPart, nearestPart.position);
    }
    candidates.sort((a, b) => a.distanceSq - b.distanceSq);
    p.gunnerTarget = candidates[0] || null;
    p.gunnerTargetTimer = p.gunnerTarget ? 0.28 : 0.35;
  }
  const target = p.gunnerTarget;
  if (!target) return;
  const targetPosition = rearGunnerTargetPosition(target);
  if (!targetPosition || targetPosition.distanceTo(origin) > 300) return;
  const localDirection = targetPosition.sub(origin).normalize().applyQuaternion(p.g.quaternion.clone().invert());
  if (p.rearGunMount) p.rearGunMount.rotation.set(-Math.atan2(localDirection.y, Math.hypot(localDirection.x, localDirection.z)), Math.atan2(localDirection.x, localDirection.z), 0, 'YXZ');
  p.rearGunnerFireTimer = Math.max(0, (p.rearGunnerFireTimer || 0) - dt);
  if (p.rearGunnerFireTimer <= 0) {
    p.rearGunnerFireTimer = 0.16;
    gunnerFire(p, target, 0.055);
  }
}
const blimpEnvelopeMap = (() => {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#d9d1bd';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  for (let x = 0; x < canvas.width; x += 32) {
    ctx.fillStyle = x % 64 ? 'rgba(94,82,64,0.045)' : 'rgba(255,246,224,0.11)';
    ctx.fillRect(x, 0, 32, canvas.height);
  }
  for (let y = 12; y < canvas.height; y += 32) {
    ctx.strokeStyle = 'rgba(64,55,43,0.24)';
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
    ctx.setLineDash([3, 4]);
    ctx.strokeStyle = 'rgba(239,229,205,0.62)';
    ctx.beginPath();
    ctx.moveTo(0, y + 2);
    ctx.lineTo(canvas.width, y + 2);
    ctx.stroke();
    ctx.setLineDash([]);
  }
  for (let x = 0; x < canvas.width; x += 32) {
    ctx.strokeStyle = 'rgba(68,57,42,0.22)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + 1, 0);
    ctx.lineTo(x + 1, canvas.height);
    ctx.stroke();
    for (let y = 0; y < canvas.height; y += 8) {
      ctx.fillStyle = 'rgba(244,235,215,0.68)';
      ctx.fillRect(x - 1, y, 3, 1);
    }
  }
  for (let i = 0; i < 1100; i++) {
    const shade = Math.random() < 0.5 ? 'rgba(61,53,43,0.07)' : 'rgba(255,248,227,0.12)';
    ctx.fillStyle = shade;
    ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, 1 + Math.random() * 2, 1);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.anisotropy = 2;
  return texture;
})();
function spawnBlimp(team = 'red') {
  const g = new THREE.Group();
  const envelopeMat = new THREE.MeshStandardMaterial({
    color: team === 'blue' ? 0x75879a : 0x9b7165,
    map: blimpEnvelopeMap,
    roughness: 0.94,
    metalness: 0.02,
    side: THREE.DoubleSide
  });
  const ribMat = new THREE.MeshLambertMaterial({
    color: team === 'blue' ? 0x4b5d70 : 0x695047
  });
  const ribHighlightMat = new THREE.MeshLambertMaterial({
    color: team === 'blue' ? 0xa6a18f : 0xb08e75
  });
  const gondolaMat = new THREE.MeshLambertMaterial({
    color: 0x51483c
  });
  const ropeMat = new THREE.LineBasicMaterial({
    color: 0x453b30
  });
  const envelope = new THREE.Group();
  const envelopePanels = [];
  for (let i = 0; i < 8; i++) {
    const start = i / 8 * Math.PI * 2;
    const panel = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 26, start, Math.PI / 4 + 0.012, 0.13, Math.PI - 0.26), envelopeMat);
    panel.scale.set(13, 10, 42);
    envelope.add(panel);
    envelopePanels.push(panel);
  }
  g.add(envelope);
  for (let i = -3; i <= 3; i++) {
    const z = i * 9.5;
    const rib = new THREE.Mesh(new THREE.TorusGeometry(1, 0.09, 7, 32), ribMat);
    rib.scale.set(12.7, 9.7, 1);
    rib.position.z = z;
    g.add(rib);
    const highlight = new THREE.Mesh(new THREE.TorusGeometry(1, 0.026, 5, 32), ribHighlightMat);
    highlight.scale.set(12.72, 9.72, 1);
    highlight.position.z = z + 0.34;
    g.add(highlight);
  }
  const nose = new THREE.Mesh(new THREE.ConeGeometry(7.5, 15, 16), envelopeMat);
  nose.rotation.x = -Math.PI / 2;
  nose.position.z = -40;
  g.add(nose);
  const tail = new THREE.Mesh(new THREE.ConeGeometry(5.5, 11, 12), envelopeMat);
  tail.rotation.x = Math.PI / 2;
  tail.position.z = 39;
  g.add(tail);
  const finRibMat = new THREE.MeshLambertMaterial({
    color: team === 'blue' ? 0x536271 : 0x654a42
  });
  const fins = [];
  for (const [x, y, z, rz] of [[0, 8, 34, 0], [0, -8, 34, 0], [7, 0, 34, Math.PI / 2], [-7, 0, 34, Math.PI / 2]]) {
    const fin = new THREE.Group();
    fin.position.set(x, y, z);
    fin.rotation.z = rz;
    fin.add(new THREE.Mesh(new THREE.BoxGeometry(0.28, 8, 10), envelopeMat));
    for (const edgeZ of [-4.85, 4.85]) {
      const edge = new THREE.Mesh(new THREE.BoxGeometry(0.16, 8.1, 0.22), finRibMat);
      edge.position.z = edgeZ;
      fin.add(edge);
    }
    for (const edgeY of [-3.85, 3.85]) {
      const edge = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.22, 9.8), ribHighlightMat);
      edge.position.y = edgeY;
      fin.add(edge);
    }
    const diagonal = new THREE.Mesh(new THREE.BoxGeometry(0.12, 11.6, 0.12), ribMat);
    diagonal.rotation.x = Math.PI / 4;
    fin.add(diagonal);
    g.add(fin);
    fins.push(fin);
  }
  const gondola = new THREE.Group();
  const gondolaWood = new THREE.MeshLambertMaterial({
    color: 0x75664f
  });
  const gondolaTrim = new THREE.MeshLambertMaterial({
    color: 0x9b875f
  });
  const windowMat = new THREE.MeshStandardMaterial({
    color: 0x25343a,
    emissive: 0x10191b,
    metalness: 0.35,
    roughness: 0.36
  });
  const hull = new THREE.Mesh(new THREE.CapsuleGeometry(1.7, 16, 5, 10), gondolaMat);
  hull.rotation.x = Math.PI / 2;
  hull.position.y = -18;
  gondola.add(hull);
  const keel = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.62, 18), ribMat);
  keel.position.set(0, -19.7, 0.4);
  gondola.add(keel);
  const cabin = new THREE.Mesh(new THREE.BoxGeometry(4, 3, 7), gondolaWood);
  cabin.position.set(0, -15, -2);
  gondola.add(cabin);
  const cabinRoof = new THREE.Mesh(new THREE.BoxGeometry(4.7, 0.28, 7.8), gondolaTrim);
  cabinRoof.position.set(0, -13.38, -2);
  gondola.add(cabinRoof);
  for (const side of [-1, 1]) {
    for (const z of [-4.35, -2.15, 0.05]) {
      const glass = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.92, 1.36), windowMat);
      glass.position.set(side * 2.055, -14.95, z);
      gondola.add(glass);
      for (const y of [-15.46, -14.44]) {
        const rail = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.11, 1.52), gondolaTrim);
        rail.position.set(side * 2.12, y, z);
        gondola.add(rail);
      }
      const divider = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.95, 0.1), gondolaTrim);
      divider.position.set(side * 2.12, -14.95, z);
      gondola.add(divider);
    }
  }
  for (const x of [-0.95, 0.95]) {
    const windshield = new THREE.Mesh(new THREE.BoxGeometry(1.45, 0.95, 0.12), windowMat);
    windshield.position.set(x, -14.95, -5.57);
    gondola.add(windshield);
    const frame = new THREE.Mesh(new THREE.BoxGeometry(0.09, 1.05, 0.18), gondolaTrim);
    frame.position.set(x, -14.95, -5.65);
    gondola.add(frame);
  }
  const noseGun = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 3.2, 8), ribMat);
  noseGun.rotation.x = Math.PI / 2;
  noseGun.position.set(0, -13.5, -7);
  gondola.add(noseGun);
  const gunRing = new THREE.Mesh(new THREE.TorusGeometry(0.72, 0.09, 7, 20), gondolaTrim);
  gunRing.rotation.x = Math.PI / 2;
  gunRing.position.set(0, -13.25, -7.15);
  gondola.add(gunRing);
  for (const side of [-1, 1]) {
    const engine = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.72, 4.4, 12), ribMat);
    engine.rotation.x = Math.PI / 2;
    engine.position.set(side * 3.55, -17.55, 2.8);
    gondola.add(engine);
    const propeller = new THREE.Group();
    propeller.position.set(side * 3.55, -17.55, 0.52);
    for (const angle of [0, Math.PI / 2]) {
      const blade = new THREE.Mesh(new THREE.BoxGeometry(0.2, 2.45, 0.12), gondolaTrim);
      blade.rotation.z = angle;
      propeller.add(blade);
    }
    const hub = new THREE.Mesh(new THREE.SphereGeometry(0.28, 10, 8), ribMat);
    propeller.add(hub);
    gondola.add(propeller);
  }
  for (const side of [-1, 1]) {
    for (let i = 0; i < 6; i++) {
      const rung = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.92), gondolaTrim);
      rung.position.set(side * 2.18, -18.2 + i * 0.42, -1.2);
      gondola.add(rung);
    }
  }
  g.add(gondola);
  const cableBetween = (parent, a, b, radius = 0.035) => {
    const direction = b.clone().sub(a);
    const cable = new THREE.Mesh(new THREE.CylinderGeometry(radius * 0.72, radius, direction.length(), 5), ropeMat);
    cable.position.copy(a).add(b).multiplyScalar(0.5);
    cable.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
    parent.add(cable);
  };
  for (const z of [-26, -14, 0, 14, 26]) {
    for (const side of [-1, 1]) cableBetween(g, new THREE.Vector3(side * 9.5, -5.8, z), new THREE.Vector3(side * 2.5, -16.2, z * 0.65));
  }
  const rigging = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-9, -6, -27), new THREE.Vector3(-2, -16, -5), new THREE.Vector3(9, -6, -27), new THREE.Vector3(2, -16, 5), new THREE.Vector3(-9, -6, 27), new THREE.Vector3(0, -16, 0), new THREE.Vector3(9, -6, 27), new THREE.Vector3(0, -16, 0)]), ropeMat);
  g.add(rigging);
  const ropePoints = Array.from({
    length: 14
  }, () => new THREE.Vector3());
  const tetherGeom = new THREE.BufferGeometry().setFromPoints(ropePoints);
  const tether = new THREE.Line(tetherGeom, ropeMat);
  tether.frustumCulled = false;
  g.add(tether);
  const flames = [];
  for (const [x, y, z] of [[-4, 0, 12], [3, -14, -4], [1, -14, 7]]) {
    const flame = new THREE.Mesh(new THREE.ConeGeometry(1.1, 5, 7), new THREE.MeshBasicMaterial({
      color: x === -4 ? 0xff6a14 : 0xffb12c,
      transparent: true,
      opacity: 0.78,
      depthWrite: false
    }));
    flame.position.set(x, y, z);
    flame.visible = false;
    g.add(flame);
    flames.push(flame);
  }
  const flagPole = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.11, 2.5, 6), ribMat);
  flagPole.position.set(12.7, -1.2, -13.4);
  const sideFlag = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 1.6), new THREE.MeshBasicMaterial({
    map: factionFlagTexture(team),
    side: THREE.DoubleSide
  }));
  sideFlag.position.set(13.35, -1.2, -15);
  sideFlag.rotation.y = Math.PI / 2;
  g.add(flagPole, sideFlag);
  const fragments = [...envelopePanels, nose, tail, ...fins, gondola];
  for (const [x, y, z] of [[-8, 3, -18], [8, -2, -5], [-7, 4, 13], [6, 2, 27], [0, -15, -11]]) {
    const piece = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.16, 7), envelopeMat.clone());
    piece.position.set(x, y, z);
    piece.rotation.z = x * 0.01;
    g.add(piece);
    fragments.push(piece);
  }
  const phase = team === 'blue' ? 0 : Math.PI;
  if (sel.map === 'bedroom') {
    g.scale.setScalar(0.48);
    g.position.set((team === 'blue' ? -220 : 220) + Math.cos(phase) * 175, 160, Math.sin(phase) * 190);
  } else {
    g.position.set((team === 'blue' ? -285 : 285) + Math.cos(phase) * 230, 330, Math.sin(phase) * 250);
  }
  scene.add(g);
  blimps.push({
    team,
    m: g,
    envelope,
    envelopePanels,
    envelopeMat,
    hp: 24,
    a: phase,
    state: 'patrol',
    rope: tether,
    tetherGeom,
    flames,
    fragments,
    loose: [],
    puff: 0,
    groundTimer: 0,
    respawnQueued: false,
    fallSpeed: 0,
    fallTime: 0,
    nextBreakAt: 1.1,
    explosionT: 0.35
  });
}
function releaseBlimpFragment(bl, piece) {
  bl.m.updateMatrixWorld(true);
  const pos = piece.getWorldPosition(new THREE.Vector3());
  const quat = piece.getWorldQuaternion(new THREE.Quaternion());
  piece.removeFromParent();
  scene.add(piece);
  piece.position.copy(pos);
  piece.quaternion.copy(quat);
  bl.loose.push({
    m: piece,
    v: new THREE.Vector3((Math.random() - 0.5) * 8, 3 + Math.random() * 5, (Math.random() - 0.5) * 8),
    spin: (Math.random() - 0.5) * 2,
    life: 16
  });
}
function updateBlimps(dt) {
  for (const bl of blimps.slice()) {
    const g = bl.m;
    if (bl.state === 'patrol') {
      bl.a += dt * 0.02;
      const bedroom = sel.map === 'bedroom';
      const patrolCenter = bedroom ? bl.team === 'blue' ? -220 : 220 : bl.team === 'blue' ? -285 : 285;
      const patrolX = patrolCenter + Math.cos(bl.a) * (bedroom ? 175 : 230);
      const patrolZ = Math.sin(bl.a) * (bedroom ? 190 : 250);
      const patrolY = bedroom ? Math.max(148, heightAt(patrolX, patrolZ) + 95) : Math.max(330, heightAt(patrolX, patrolZ) + 130);
      g.position.set(patrolX, patrolY, patrolZ);
      g.rotation.y = -bl.a;
      const ground = heightAt(g.position.x, g.position.z);
      const p = bl.tetherGeom.attributes.position;
      for (let i = 0; i < p.count; i++) {
        const t = i / (p.count - 1);
        p.setXYZ(i, Math.sin(t * Math.PI) * 0.8, -19 + (ground - g.position.y + 19) * t, Math.cos(t * Math.PI) * 0.5);
      }
      p.needsUpdate = true;
    } else if (bl.state === 'falling') {
      bl.fallTime += dt;
      bl.fallSpeed = Math.min(22, bl.fallSpeed + 2.5 * dt);
      g.position.y -= bl.fallSpeed * dt;
      g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, -0.68, dt * 0.09);
      g.rotation.z = Math.sin(bl.fallTime * 1.2) * 0.08 - Math.min(0.22, bl.fallTime * 0.006);
      if (bl.fragments.length && bl.fallTime >= bl.nextBreakAt) {
        const piece = bl.fragments.shift();
        bl.m.updateMatrixWorld(true);
        const breakPos = piece.getWorldPosition(new THREE.Vector3());
        boom(breakPos);
        smoke(breakPos, 0.8, 1.8, 0x29241f, 0, 0.28);
        smoke(breakPos.clone().add(new THREE.Vector3(0, 1, 0)), 0.35, 0.35, 0xff8a28, 0, 0.04);
        releaseBlimpFragment(bl, piece);
        bl.nextBreakAt += 0.62 + Math.random() * 0.34;
      }
      bl.explosionT -= dt;
      if (bl.explosionT <= 0) {
        bl.explosionT = 0.8 + Math.random() * 0.55;
        const blastPos = g.position.clone().add(new THREE.Vector3((Math.random() - 0.5) * 18, (Math.random() - 0.45) * 15, (Math.random() - 0.5) * 58).applyQuaternion(g.quaternion));
        boom(blastPos);
        smoke(blastPos, 0.62, 1.55, 0x302823, 0, 0.22);
      }
      bl.puff -= dt;
      if (bl.puff <= 0) {
        bl.puff = 0.22;
        const tailPos = g.position.clone().add(new THREE.Vector3(0, -5, 35).applyQuaternion(g.quaternion));
        smoke(tailPos, 0.76, 2.2, 0x211f1d, 0, 0.16);
      }
      const floor = heightAt(g.position.x, g.position.z) + 12;
      if (g.position.y <= floor) {
        g.position.y = floor;
        bl.state = 'ground';
        bl.groundTimer = 0;
        bl.fireLeft = 28;
        bl.fallSpeed = 0;
        bl.rope.visible = false;
      }
    } else if (bl.state === 'ground') {
      bl.groundTimer += dt;
      bl.fireLeft -= dt;
      if (bl.fireLeft > 0) {
        bl.puff -= dt;
        if (bl.puff <= 0) {
          bl.puff = 0.45;
          const pos = g.position.clone().add(new THREE.Vector3((Math.random() - 0.5) * 6, 4, (Math.random() - 0.5) * 12));
          smoke(pos, 0.72, 2, 0x211f1d, -0.2, 0.2);
          smoke(pos.clone().add(new THREE.Vector3(0.5, 1, 0)), 0.23, 0.25, 0xff7020, 0, 0);
        }
      } else {
        for (const flame of bl.flames) flame.visible = false;
        boom(g.position.clone().add(new THREE.Vector3(0, 5, 0)));
        smoke(g.position.clone().add(new THREE.Vector3(0, 10, 0)), 2.2, 4.5, 0x201d1a, 0, 0.4);
        if (!bl.respawnQueued) {
          bl.respawnQueued = true;
          blimps = blimps.filter(b => b !== bl);
          scene.remove(g);
          for (const part of bl.loose) scene.remove(part.m);
          later(() => spawnBlimp(bl.team), 18000);
        }
      }
    }
    for (const part of bl.loose) {
      part.life -= dt;
      part.v.y -= 9.8 * dt;
      part.m.position.addScaledVector(part.v, dt);
      part.m.rotation.z += part.spin * dt;
      const ground = heightAt(part.m.position.x, part.m.position.z) + 0.2;
      if (part.m.position.y < ground) {
        part.m.position.y = ground;
        part.v.set(0, 0, 0);
        part.life = Math.min(part.life, 3);
      }
      if (part.life <= 0) scene.remove(part.m);
    }
    bl.loose = bl.loose.filter(part => part.life > 0);
    if (bl.state === 'falling' || bl.state === 'ground' && bl.fireLeft > 0) {
      const flicker = 0.82 + Math.sin(performance.now() * 0.025) * 0.16;
      for (const flame of bl.flames) {
        flame.visible = true;
        flame.scale.set(0.7 + flicker * 0.4, flicker, 0.7 + flicker * 0.3);
      }
      bl.envelopeMat.color.set(bl.state === 'ground' ? 0x4b3326 : 0x6d5140);
    }
  }
}

// ---------- Input ----------
let stickId = null;
let lookId = null;
let start = {
  x: 0,
  y: 0
};
let lastLook = {
  x: 0,
  y: 0
};
let mouseAimReady = false;
const look = {
  yaw: 0,
  pitch: 0,
  mouse: false
};
let cockpitPOV = false;
renderer.domElement.addEventListener('contextmenu', e => e.preventDefault());
renderer.domElement.addEventListener('wheel', e => {
  if (mode !== 'spectate') return;
  e.preventDefault();
  adjustSpectatorZoom(THREE.MathUtils.clamp(-e.deltaY * 0.0009, -0.25, 0.25));
}, {
  passive: false
});
renderer.domElement.addEventListener('pointerdown', e => {
  if (paused) return;
  if (e.pointerType === 'mouse') {
    if (spectator.active && e.button === 0) {
      spectatorPress = {
        pointerId: e.pointerId,
        pointerType: e.pointerType,
        x: e.clientX,
        y: e.clientY,
        moved: false
      };
    } else if (e.button === 0) {
      input.fire = true;
    }
    if (e.button === 2) {
      look.mouse = true;
      lastLook = {
        x: e.clientX,
        y: e.clientY
      };
      try {
        renderer.domElement.setPointerCapture(e.pointerId);
      } catch (error) {}
    }
    return;
  }
  if (spectator.active && !spectatorPress) {
    spectatorPress = {
      pointerId: e.pointerId,
      pointerType: e.pointerType,
      x: e.clientX,
      y: e.clientY,
      moved: false
    };
  }
  const crewLooking = mode === 'fly' && player && (player.twoSeater || player.bomber) && role !== 'pilot';
  if (crewLooking) {
    if (lookId === null) {
      lookId = e.pointerId;
      lastLook = {
        x: e.clientX,
        y: e.clientY
      };
    }
    return;
  }
  if (e.clientX < innerWidth / 2 && stickId === null) {
    stickId = e.pointerId;
    start = {
      x: e.clientX,
      y: e.clientY
    };
  } else if (lookId === null) {
    lookId = e.pointerId;
    lastLook = {
      x: e.clientX,
      y: e.clientY
    };
  }
});
addEventListener('pointermove', e => {
  if (paused) return;
  if (spectatorPress?.pointerId === e.pointerId && Math.hypot(e.clientX - spectatorPress.x, e.clientY - spectatorPress.y) > 10) {
    spectatorPress.moved = true;
  }
  if (e.pointerType === 'mouse') {
    const freeAim = mode === 'fly' && player && (player.twoSeater || player.bomber) && role === 'gun';
    if (freeAim) {
      if (!mouseAimReady) {
        lastLook = {
          x: e.clientX,
          y: e.clientY
        };
        mouseAimReady = true;
        return;
      }
      const dx = (e.movementX || e.clientX - lastLook.x) * 0.006;
      const dy = (e.movementY || e.clientY - lastLook.y) * 0.006;
      lastLook = {
        x: e.clientX,
        y: e.clientY
      };
      look.yaw -= dx;
      look.pitch = THREE.MathUtils.clamp(look.pitch - dy, -1.4, 1.4);
      return;
    }
    mouseAimReady = false;
    if (!look.mouse) return;
    const dx = (e.clientX - lastLook.x) * 0.006;
    const dy = (e.clientY - lastLook.y) * 0.006;
    lastLook = {
      x: e.clientX,
      y: e.clientY
    };
    if (mode === 'spectate' && spectator.active) {
      spectator.yaw -= dx;
      spectator.pitch = THREE.MathUtils.clamp(spectator.pitch - dy, -1.2, 1.2);
    } else if (mode === 'foot' || mode === 'chute' || mode === 'aa') {
      foot.yaw -= dx;
      foot.pitch = THREE.MathUtils.clamp(foot.pitch - dy, -1.2, 1.2);
    } else {
      look.yaw -= dx;
      look.pitch = THREE.MathUtils.clamp(look.pitch - dy, -1.2, 1.2);
    }
    return;
  }
  if (e.pointerId === stickId) {
    input.mx = THREE.MathUtils.clamp((e.clientX - start.x) / 70, -1, 1);
    input.my = THREE.MathUtils.clamp((e.clientY - start.y) / 70, -1, 1);
  }
  if (e.pointerId === lookId && mode === 'spectate' && spectator.active) {
    spectator.yaw -= (e.clientX - lastLook.x) * 0.006;
    spectator.pitch = THREE.MathUtils.clamp(spectator.pitch - (e.clientY - lastLook.y) * 0.006, -1.2, 1.2);
    lastLook = {
      x: e.clientX,
      y: e.clientY
    };
  }
  if (e.pointerId === lookId && mode === 'fly' && player && (!player.bomber || role !== 'pilot')) {
    look.yaw -= (e.clientX - lastLook.x) * 0.006;
    const crewLook = (player.twoSeater || player.bomber) && role !== 'pilot';
    const pitchLimit = crewLook ? 1.4 : 1.2;
    look.pitch = THREE.MathUtils.clamp(look.pitch - (e.clientY - lastLook.y) * 0.006, -pitchLimit, pitchLimit);
    lastLook = {
      x: e.clientX,
      y: e.clientY
    };
  }
  if (e.pointerId === lookId && (mode === 'foot' || mode === 'chute' || mode === 'aa')) {
    foot.yaw -= (e.clientX - lastLook.x) * 0.006;
    foot.pitch = THREE.MathUtils.clamp(foot.pitch - (e.clientY - lastLook.y) * 0.006, -1.2, 1.2);
    lastLook = {
      x: e.clientX,
      y: e.clientY
    };
  }
  if (e.pointerId === lookId && mode === 'truck') {
    look.yaw -= (e.clientX - lastLook.x) * 0.006;
    look.pitch = THREE.MathUtils.clamp(look.pitch - (e.clientY - lastLook.y) * 0.006, -0.8, 0.6);
    lastLook = {
      x: e.clientX,
      y: e.clientY
    };
  }
});
addEventListener('pointerup', e => {
  if (spectatorPress?.pointerId === e.pointerId) {
    const shouldSelect = spectator.active && !spectatorPress.moved && (e.pointerType !== 'mouse' || e.button === 0);
    spectatorPress = null;
    if (shouldSelect) selectSpectatedPlane(e.clientX, e.clientY);
  }
  if (e.pointerType === 'mouse') {
    if (e.button === 0) input.fire = false;
    if (e.button === 2) look.mouse = false;
    return;
  }
  if (e.pointerId === stickId) {
    stickId = null;
    input.mx = input.my = 0;
  }
  if (e.pointerId === lookId) {
    lookId = null;
  }
});
addEventListener('pointercancel', e => {
  if (spectatorPress?.pointerId === e.pointerId) spectatorPress = null;
  if (e.pointerType === 'mouse') {
    if (e.button === 0) input.fire = false;
    if (look.mouse || e.button === 2) look.mouse = false;
    return;
  }
  if (e.pointerId === stickId) {
    stickId = null;
    input.mx = input.my = 0;
  }
  if (e.pointerId === lookId) {
    lookId = null;
  }
});
addEventListener('blur', () => {
  look.mouse = false;
  mouseAimReady = false;
  stickId = null;
  lookId = null;
  spectatorPress = null;
  input.mx = input.my = input.lx = input.ly = 0;
  input.fire = input.bomb = input.ePressed = input.jumpPressed = false;
  Object.keys(input.keys).forEach(key => {
    input.keys[key] = false;
  });
  Object.keys(truckInput).forEach(key => {
    truckInput[key] = false;
  });
  if (mode === 'fly' && player && (!player.twoSeater || role === 'pilot') && (!player.bomber || role !== 'gun')) look.yaw = look.pitch = 0;
});
addEventListener('keydown', e => {
  if (e.target instanceof HTMLElement && e.target.matches('input, textarea, select, [contenteditable="true"]')) return;
  if (e.code === 'Escape' && !e.repeat) {
    e.preventDefault();
    if ($('field-map-overlay')?.style.display === 'grid') toggleFieldMap(false);else if ($('intel-overlay').style.display === 'grid') closeIntel();else setPaused(!paused);
    return;
  }
  if (e.code === 'KeyP' && !e.repeat) {
    e.preventDefault();
    setPaused(!paused);
    return;
  }
  if (e.code === 'Space') e.preventDefault();
  if (paused) return;
  if (e.code === 'KeyM' && !e.repeat) {
    e.preventDefault();
    toggleFieldMap();
    return;
  }
  if (e.code === 'KeyC' && !e.repeat) {
    if (mode === 'foot') footThirdPerson = !footThirdPerson;else if (mode === 'fly' && player && (!player.twoSeater || role === 'pilot') && (!player.bomber || role !== 'gun')) {
      cockpitPOV = !cockpitPOV;
      recenterView();
    }
  }
  if (e.code === 'KeyR' && !e.repeat && mode === 'fly') recenterView();
  if (e.code === 'KeyV' && !e.repeat && mode === 'foot') footThirdPerson = !footThirdPerson;
  if (e.code === 'KeyF' && !e.repeat && mode === 'foot') {
    e.preventDefault();
    firstPersonGestureT = FIRST_PERSON_GESTURE_DURATION;
  }
  if (e.code === 'Space' && !e.repeat && mode === 'foot') input.jumpPressed = true;
  if (e.code === 'KeyE' && !e.repeat) input.ePressed = true;
  if (e.code === 'KeyB') input.bomb = true;
  input.keys[e.code] = true;
});
addEventListener('keyup', e => {
  input.keys[e.code] = false;
  if (e.code === 'KeyB') input.bomb = false;
});
function recenterView() {
  look.yaw = 0;
  look.pitch = 0;
  mouseAimReady = false;
}
function setActions(list) {
  const key = list.map(b => b[0]).join();
  const box = $('actions');
  box.dataset.downed = mode === 'shotdown' ? 'true' : 'false';
  if (box.dataset.k === key) return;
  box.dataset.k = key;
  box.innerHTML = '';
  for (const [label, down, up] of list) {
    const b = document.createElement('button');
    b.textContent = label;
    if (/bail out/i.test(label)) {
      b.classList.add('action-bailout');
      b.dataset.downed = mode === 'shotdown' ? 'true' : 'false';
    }
    if (/^Land and refuel$/i.test(label)) b.classList.add('action-refuel');
    if (/^(EMERGENCY LAND|CANCEL LANDING)/i.test(label)) {
      b.classList.add('action-landing');
      b.dataset.approach = /^CANCEL LANDING/i.test(label) ? 'true' : 'false';
      b.title = 'Touchdown requires low speed, level wings and suitable terrain.';
    }
    if (/^BOMB/i.test(label)) {
      b.classList.add('action-bomb');
      b.title = 'Release bombs · B';
    } else if (/^(FIRE|FIRE AA)$/i.test(label)) b.classList.add('action-fire');
    if (/^RECENTER$/i.test(label)) b.classList.add('action-recenter');
    if (/^POV/.test(label)) b.classList.add('action-pov');
    b.onpointerdown = e => {
      e.stopPropagation();
      down();
    };
    if (up) b.onpointerup = b.onpointerleave = b.onpointercancel = up;
    box.appendChild(b);
  }
}

// ---------- Combat ----------
const bulletGeo = new THREE.BoxGeometry(0.15, 0.15, 4);
const bulletMat = new THREE.MeshBasicMaterial({
  color: 0xffe080
});
const tmpV = new THREE.Vector3();
function maybeRicochetBullet(bullet, closestPoint, surfaceCenter, radius, chance) {
  if ((bullet.ricochets || 0) >= 2 || Math.random() >= chance) return false;
  const normal = closestPoint.clone().sub(surfaceCenter);
  if (normal.lengthSq() < 0.001) normal.copy(bullet.v).negate();
  normal.normalize();
  if (bullet.v.dot(normal) > 0) normal.negate();
  bullet.v.addScaledVector(normal, -2 * bullet.v.dot(normal)).multiplyScalar(0.62);
  bullet.m.position.copy(surfaceCenter).addScaledVector(normal, radius + 0.35);
  bullet.m.lookAt(bullet.m.position.clone().add(bullet.v));
  bullet.life *= 0.78;
  bullet.ricochets = (bullet.ricochets || 0) + 1;
  bullet.ricochetedThisStep = true;
  return true;
}
function trackBullet(bullet) {
  if (bullets.length >= MAX_BATTLE_BULLETS) {
    let oldestIndex = bullets.findIndex(existing => existing.owner !== player);
    if (oldestIndex < 0) oldestIndex = 0;
    const [oldest] = bullets.splice(oldestIndex, 1);
    if (oldest) scene.remove(oldest.m);
  }
  bullets.push(bullet);
}
function fire(p, spread) {
  if (isAirportWeaponsLocked(p)) {
    reportAirportWeaponLock(p);
    return false;
  }
  if (p === player && p.ammo <= 0) {
    notifyOutOfAmmo();
    return false;
  }
  const fwd = new THREE.Vector3(0, 0, -1).applyQuaternion(p.g.quaternion);
  const networkShots = [];
  const mounts = p === player ? p.ammo > 1 ? [-0.2, 0.2] : [0] : [-0.2, 0.2];
  for (const sx of mounts) {
    const dir = fwd.clone().add(new THREE.Vector3((Math.random() - 0.5) * spread, (Math.random() - 0.5) * spread, 0).applyQuaternion(p.g.quaternion)).normalize();
    const m = new THREE.Mesh(bulletGeo, bulletMat);
    m.position.copy(p.g.position).add(new THREE.Vector3(sx, 0.6, -3).applyQuaternion(p.g.quaternion));
    m.lookAt(m.position.clone().add(dir));
    scene.add(m);
    const velocity = dir.multiplyScalar(320).add(fwd.clone().multiplyScalar(p.speed));
    const bullet = {
      m,
      v: velocity,
      owner: p,
      life: 2
    };
    trackBullet(bullet);
    if (p === player) {
      shotSound();
      const muzzle = m.position.clone();
      smoke(muzzle, 0.19, 0.075, 0xffb84f, -fwd.x * 0.25, 0.02, -fwd.z * 0.25, 0.72, 0.3);
      smoke(muzzle, 0.075, 0.55, 0x817c70, -fwd.x * 0.34, 0.04, -fwd.z * 0.34, 0.26, 0.6);
      networkShots.push(bullet);
    } else playNpcGunSound(p);
  }
  if (p === player) {
    p.ammo -= mounts.length;
    if (p.ammo <= 0) {
      p.ammo = 0;
      notifyOutOfAmmo();
    }
    void 0;
  }
  return true;
}
function flashHit() {
  const h = $('hit');
  h.style.transition = 'none';
  h.style.opacity = 1;
  requestAnimationFrame(() => {
    h.style.transition = 'opacity .3s';
    h.style.opacity = 0;
  });
}
function addBulletHole(p, local, part) {
  const hole = new THREE.Group();
  if (part === 'wing' || part === 'tail') {
    hole.position.set(THREE.MathUtils.clamp(local.x, -3.8, 3.8), part === 'wing' ? 1.405 : 0.215, part === 'wing' ? THREE.MathUtils.clamp(local.z, -1.95, -0.35) : 3.15);
    hole.rotation.x = -Math.PI / 2;
  } else {
    const side = local.x >= 0 ? 1 : -1;
    hole.position.set(side * 0.535, THREE.MathUtils.clamp(local.y, -0.42, 0.42), THREE.MathUtils.clamp(local.z, -1.7, 2.45));
    hole.rotation.y = side * Math.PI / 2;
  }
  const scorch = new THREE.Mesh(new THREE.CircleGeometry(0.105, 10), new THREE.MeshBasicMaterial({
    color: 0x49392c,
    side: THREE.DoubleSide,
    depthWrite: false
  }));
  const center = new THREE.Mesh(new THREE.CircleGeometry(0.047, 8), new THREE.MeshBasicMaterial({
    color: 0x090908,
    side: THREE.DoubleSide,
    depthWrite: false
  }));
  center.position.z = 0.003;
  hole.add(scorch, center);
  p.g.add(hole);
  p.bulletHoles.push(hole);
  if (p.bulletHoles.length > 20) p.g.remove(p.bulletHoles.shift());
}
const impactChipGeometry = new THREE.TetrahedronGeometry(0.25, 0);
const impactChipMaterials = [0x433a30, 0x695239, 0x776b55, 0x343638].map(color => new THREE.MeshLambertMaterial({
  color
}));
function keepAirDebris(piece) {
  airDebris.push(piece);
  while (airDebris.length > MAX_AIR_DEBRIS) scene.remove(airDebris.shift().m);
}
function spawnImpactDebris(p, local, part) {
  p.g.updateMatrixWorld(true);
  const origin = p.g.localToWorld(local.clone());
  const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(p.g.quaternion);
  const right = new THREE.Vector3(1, 0, 0).applyQuaternion(p.g.quaternion);
  const count = part === 'wing' && Math.random() < 0.2 ? 2 : 1;
  for (let i = 0; i < count; i++) {
    const chip = new THREE.Mesh(impactChipGeometry, pick(impactChipMaterials));
    chip.position.copy(origin).add(new THREE.Vector3((Math.random() - 0.5) * 0.5, (Math.random() - 0.5) * 0.4, (Math.random() - 0.5) * 0.5));
    chip.scale.set(0.45 + Math.random() * 0.8, 0.35 + Math.random() * 0.7, 0.45 + Math.random() * 0.8);
    chip.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
    scene.add(chip);
    const velocity = forward.clone().multiplyScalar(Math.max(5, p.speed * 0.18)).addScaledVector(right, (Math.random() - 0.5) * 12).add(new THREE.Vector3((Math.random() - 0.5) * 4, 1.5 + Math.random() * 5, (Math.random() - 0.5) * 4));
    keepAirDebris({
      m: chip,
      v: velocity,
      spin: new THREE.Vector3((Math.random() - 0.5) * 12, (Math.random() - 0.5) * 12, (Math.random() - 0.5) * 12),
      life: 3.5 + Math.random() * 3
    });
  }
}
function detachWing(p, side, layer = null, fullSide = false) {
  const sideKey = side < 0 ? 'left' : 'right';
  const panels = p.wingPanels?.[sideKey];
  if (!panels?.length) return false;
  p.detachedWingLayers ||= {
    left: new Set(),
    right: new Set()
  };
  const detached = p.detachedWingLayers[sideKey];
  const available = [...new Set(panels.filter(part => part.parent && part.userData.breakLayer && !detached.has(part.userData.breakLayer)).map(part => part.userData.breakLayer))];
  if (!fullSide && !available.length) return false;
  if (!fullSide && (!layer || !available.includes(layer))) layer = available[Math.floor(Math.random() * available.length)];
  const parts = panels.filter(part => part.parent && (fullSide || part.userData.breakLayer === layer));
  if (!parts.length) return false;
  const fragment = new THREE.Group();
  for (const part of parts) {
    const copy = part.clone(true);
    copy.position.copy(part.position);
    copy.quaternion.copy(part.quaternion);
    copy.scale.copy(part.scale);
    fragment.add(copy);
    part.removeFromParent();
  }
  if (fullSide) {
    for (const name of new Set(panels.map(part => part.userData.breakLayer).filter(Boolean))) detached.add(name);
  } else detached.add(layer);
  const layerCount = new Set(panels.map(part => part.userData.breakLayer).filter(Boolean)).size;
  p.wingLost = !!p.wingLost || layerCount > 0 && detached.size >= layerCount;
  p.breakup = 'wing';
  p.breakSide = side;
  if (p.wingLost && !p.dying && !p.wingFailure) {
    p.wingFailure = true;
    p.wingFailureElapsed = 0;
    p.crashElapsed = 0;
    p.crashInitialSpeed = Math.max(0, p.speed || 0);
    p.crashStallDelay = 0.45 + Math.random() * 0.35;
    p.fall = 0;
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(p.g.quaternion);
    p.crashHeading = new THREE.Vector3(forward.x, 0, forward.z);
    if (p.crashHeading.lengthSq() < 0.01) p.crashHeading.set(0, 0, -1);else p.crashHeading.normalize();
    beginCrashRagdoll(p);
    if (p.isPlayer && mode === 'fly') {
      mode = 'shotdown';
      say('A whole wing is gone — the aircraft is falling. Bail out or ride it down.');
    }
  }
  fragment.position.copy(p.g.position);
  fragment.quaternion.copy(p.g.quaternion);
  fragment.scale.copy(p.g.scale);
  scene.add(fragment);
  const fwd = new THREE.Vector3(0, 0, -1).applyQuaternion(p.g.quaternion);
  const right = new THREE.Vector3(1, 0, 0).applyQuaternion(p.g.quaternion);
  keepAirDebris({
    m: fragment,
    v: fwd.multiplyScalar(Math.max(7, p.speed * 0.3)).addScaledVector(right, side * 5).add(new THREE.Vector3(0, 4, 0)),
    spin: new THREE.Vector3(2 + Math.random() * 3, side * 1.5, 1 + Math.random() * 2),
    life: 12
  });
  return true;
}
function releaseAirframePiece(p, source, kick) {
  p.g.updateMatrixWorld(true);
  const fragment = source.clone(true);
  const worldPosition = p.g.localToWorld(source.position.clone());
  fragment.position.copy(worldPosition);
  fragment.quaternion.copy(p.g.quaternion).multiply(source.quaternion);
  fragment.scale.copy(p.g.scale).multiply(source.scale);
  scene.add(fragment);
  const fwd = new THREE.Vector3(0, 0, -1).applyQuaternion(p.g.quaternion);
  const right = new THREE.Vector3(1, 0, 0).applyQuaternion(p.g.quaternion);
  const velocity = fwd.multiplyScalar(Math.max(6, p.speed * 0.24)).addScaledVector(right, kick.x).add(new THREE.Vector3(0, kick.y, kick.z));
  keepAirDebris({
    m: fragment,
    v: velocity,
    spin: new THREE.Vector3((Math.random() - 0.5) * 5, (Math.random() - 0.5) * 5, (Math.random() - 0.5) * 5),
    life: 8
  });
}
function damage(p, local, attacker, damageMultiplier = 1) {
  if (p.dying || p.wingFailure) return;
  if (isAirportWeaponsLocked(p)) return;
  if (p.isPlayer && Math.random() < (Number(activeEconomy().hp) || 0) * 0.08 + p.stats.armor) return;
  if (p.bot && Math.random() < (Number(p.healthLevel) || 0) * 0.08 + p.stats.armor) return;
  if (areHostilePilots(attacker, p)) {
    p.lastAircraftAttacker = attacker;
    if (attacker.isPlayer) p.playerDamageContribution = true;
    if (sel.gameMode === 'bonanza') {
      const contributions = p.bonanzaDamageContributions ||= [];
      let contribution = contributions.find(item => item.attacker === attacker);
      if (!contribution) {
        contribution = {
          attacker,
          damage: 0,
          at: 0
        };
        contributions.push(contribution);
      }
      contribution.damage++;
      contribution.at = performance.now();
    }
  }
  let n = Math.max(1, Math.floor(Number(damageMultiplier) || 1));
  const damageLevel = attacker === player ? Number(activeEconomy().dmg) || 0 : Number(attacker?.damageLevel) || 0;
  if (damageLevel > 0 && Math.random() < damageLevel * 0.12) n++;
  const part = Math.abs(local.x) > 1.2 ? 'wing' : local.z > 1.8 ? 'tail' : 'body';
  p.hits += n;
  p.parts[part] += n;
  p.lastDamagePart = part;
  p.lastDamageSide = local.x < 0 ? -1 : 1;
  addBulletHole(p, local, part);
  if (Math.random() < 0.3) spawnImpactDebris(p, local, part);
  const wingBreakThreshold = Math.max(4, Math.ceil(p.maxHits * 0.34));
  const wingBreakChance = p.bomber ? 0.06 : THREE.MathUtils.clamp(0.025 + p.parts.wing * 0.012, 0.025, 0.11);
  if (part === 'wing' && p.wingPanels && p.parts.wing >= wingBreakThreshold && Math.random() < wingBreakChance) {
    detachWing(p, p.lastDamageSide);
  }
  if (part === 'body' && local.z < -1.6 && p.parts.body >= 2 && p.engineCowling?.visible && Math.random() < 0.12) {
    releaseAirframePiece(p, p.engineCowling, new THREE.Vector3(-2, 3, 0));
    p.engineCowling.visible = false;
  }
  if (!p.engineDamaged && p.hits >= Math.ceil(p.maxHits * 0.5) && p.hits < p.maxHits) {
    p.engineDamaged = true;
    p.damagePuff = 0;
  }
  if (p.hits >= p.maxHits && !p.wingFailure) kill(p, attacker);
}
function makeCrashAttitude(heading, yaw, noseDown, bank = 0) {
  const forward = heading.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw).multiplyScalar(Math.cos(noseDown));
  forward.y = -Math.sin(noseDown);
  forward.normalize();
  const back = forward.clone().negate();
  const right = new THREE.Vector3(0, 1, 0).cross(back).normalize();
  const up = back.clone().cross(right).normalize();
  const basis = new THREE.Matrix4().makeBasis(right, up, back);
  const attitude = new THREE.Quaternion().setFromRotationMatrix(basis);
  if (bank) attitude.premultiply(new THREE.Quaternion().setFromAxisAngle(forward, bank));
  return attitude;
}
function beginCrashRagdoll(p) {
  const speed = Math.max(0, p.speed || 0);
  const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(p.g.quaternion);
  const velocity = forward.multiplyScalar(speed);
  velocity.y -= Math.min(3, speed * 0.035);
  const side = p.breakSide || p.lastDamageSide || (Math.random() < 0.5 ? -1 : 1);
  p.crashRagdoll = {
    velocity,
    angularVelocity: new THREE.Vector3(0.28 + Math.random() * 0.22, (Math.random() - 0.5) * 0.36, side * (p.wingFailure ? 0.68 : 0.3)),
    centerOfMass: new THREE.Vector3(0, -0.12, -0.62)
  };
}
function stepCrashRagdoll(p, dt) {
  const ragdoll = p.crashRagdoll || (beginCrashRagdoll(p), p.crashRagdoll);
  const orientation = p.g.quaternion;
  const inverseOrientation = orientation.clone().invert();
  const localVelocity = ragdoll.velocity.clone().applyQuaternion(inverseOrientation);
  const speed = ragdoll.velocity.length();
  const detached = p.detachedWingLayers;
  const layerCount = p.wingLayerCount ||= Math.max(1, ...['left', 'right'].map(side => new Set((p.wingPanels?.[side] || []).map(part => part.userData.breakLayer).filter(Boolean)).size));
  const area = {
    left: Math.max(0, 1 - (detached?.left?.size || 0) / layerCount),
    right: Math.max(0, 1 - (detached?.right?.size || 0) / layerCount)
  };
  const localForce = new THREE.Vector3();
  const localTorque = new THREE.Vector3();
  for (const [side, integrity] of [[-1, area.left], [1, area.right]]) {
    if (integrity <= 0) continue;
    const dragForce = localVelocity.clone().multiplyScalar(-speed * 0.00048 * integrity);
    localForce.add(dragForce);
    const wingArm = new THREE.Vector3(side * 2.45, 0.48, -1.05).sub(ragdoll.centerOfMass);
    localTorque.add(wingArm.cross(dragForce));
  }
  localForce.add(localVelocity.clone().multiplyScalar(-speed * 0.00008));
  ragdoll.velocity.addScaledVector(localForce.applyQuaternion(orientation), dt);
  ragdoll.velocity.y -= 9.8 * dt;
  ragdoll.angularVelocity.addScaledVector(localTorque, dt * 0.025);
  ragdoll.angularVelocity.y += (area.left - area.right) * speed * 0.0009 * dt;
  ragdoll.angularVelocity.clampLength(0, 3.5).multiplyScalar(Math.exp(-0.22 * dt));
  const tumble = new THREE.Quaternion().setFromEuler(new THREE.Euler(ragdoll.angularVelocity.x * dt, ragdoll.angularVelocity.y * dt, ragdoll.angularVelocity.z * dt, 'XYZ'));
  orientation.multiply(tumble).normalize();
  p.g.position.addScaledVector(ragdoll.velocity, dt);
  p.speed = ragdoll.velocity.length();
  p.fall = Math.max(0, -ragdoll.velocity.y);
}
function kill(p, attacker) {
  if (p.dying) return;
  // Aircraft damage is only credited to a hostile pilot who actually landed a bullet.
  const candidateKiller = attacker || p.lastAircraftAttacker || null;
  const killer = areHostilePilots(candidateKiller, p) ? candidateKiller : null;
  const victimRecord = stat(p);
  victimRecord.streak = 0;
  if (p.isPlayer && !p.abandoned) {
    streak = 0;
    revokeRibbons(p);
  }
  p.dying = true;
  if (killer) recordKillCredit(p, killer);
  p.killedBy = killer?.isRemote ? killer.name : '';
  p.crashElapsed = 0;
  p.tailCrashElapsed = 0;
  p.crashInitialSpeed = Math.max(0, p.speed || 0);
  p.crashStallDelay = p.bot && Math.random() < 0.45 ? 1 + Math.random() : 0;
  const crashRoll = Math.random();
  p.crashStyle = crashRoll < 0.36 ? 'spiral' : crashRoll < 0.68 ? 'breakup' : 'dive';
  if (p.crashStyle === 'breakup' && p.wingPanels && !p.wingLost) {
    p.breakSide = p.lastDamagePart === 'wing' ? p.lastDamageSide : Math.random() < 0.5 ? -1 : 1;
    p.breakup = 'wing';
    detachWing(p, p.breakSide, null, true);
  }
  const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(p.g.quaternion);
  p.crashHeading = new THREE.Vector3(forward.x, 0, forward.z);
  if (p.crashHeading.lengthSq() < 0.01) p.crashHeading.set(0, 0, -1);else p.crashHeading.normalize();
  beginCrashRagdoll(p);
  if (p.crashStyle === 'spiral') {
    const side = p.breakSide || p.lastDamageSide || (Math.random() < 0.5 ? -1 : 1);
    p.crashRagdoll.angularVelocity.set(0.72, side * (0.85 + Math.random() * 0.45), side * (0.62 + Math.random() * 0.3));
  }
  p.crashTargetQuaternion = makeCrashAttitude(p.crashHeading, 0, 1.08);
  p.fall = 0;
  if (p.wingPanels && !p.wingLost && Math.random() < 0.06) {
    p.deferredWingBreakTimer = 2.1 + Math.random() * 1.7;
    p.deferredWingBreakSide = p.breakSide || (p.lastDamagePart === 'wing' ? p.lastDamageSide : Math.random() < 0.5 ? -1 : 1);
  }
  if (!p.breakup && p.wingPanels && !p.deferredWingBreakTimer && Math.random() < (p.bomber ? 0.04 : THREE.MathUtils.clamp(0.03 + (p.parts.wing || 0) * 0.012, 0.03, 0.12))) {
    p.breakup = 'wing';
    p.breakSide = p.lastDamagePart === 'wing' ? p.lastDamageSide : Math.random() < 0.5 ? -1 : 1;
    detachWing(p, p.breakSide);
  }
  const tailDamageLimit = Math.max(2, Math.ceil(p.maxHits * 0.3));
  p.tailSnapTimer = p.tail?.visible && (p.parts.tail || 0) >= tailDamageLimit ? 0.55 : 0;
  p.tailSnapBase = {
    x: p.tail?.rotation.x || 0,
    z: p.tail?.rotation.z || 0
  };
  if (killer) feed(`${p.name} was downed by ${killer.name}`, p.isPlayer ? 'defeat' : killer.isPlayer ? 'victory' : 'neutral');
  if (p.isRemote) {
    // A remote aircraft is presentation-only here; never treat its loss as our own pilot's death.
    spawnChute(p.g.position);
    victimRecord.deaths++;
    return;
  }
  if (p.bot) {
    p.chuteDelay = 2;
    p.chutesLeft = p.twoSeater ? 2 : p.bomber ? 1 + Math.floor(Math.random() * 3) : 1;
    p.twoSeatChuteIndex = 0;
    loseTicket(p.team, p);
    victimRecord.deaths++;
    if (killer?.isPlayer) {
      if (sel.gameMode !== 'bonanza') {
        streak++;
        save.career.bestStreak = Math.max(save.career.bestStreak, streak);
      }
      void 0;
      void 0;
      if (p.bomber) save.career.bomberKills++;
      persist();
      if (sel.gameMode !== 'bonanza' && streak === 10) addRibbons(killer);
      cashAdd((p.bomber ? 200 : 150) + (streak >= 3 ? 50 * (streak - 2) : 0), streak >= 3 ? `Killstreak x${streak}!` : p.bomber ? 'Bomber down!' : 'Enemy down');
      recordCareerKill('aircraft');
      if (p.ace) recordAceDefeat(p);
    } else if (p.playerDamageContribution && killer) {
      cashAdd(50, 'Aircraft assist');
    }
    scheduleBotReplacement(p);
  } else {
    loseTicket(p.team, p);
    victimRecord.deaths++;
    if (p.isPlayer) {
      save.career.deaths++;
      persist();
    }
    if (!killer) feed(`${p.name} was downed by anti-air fire`, p.isPlayer ? 'defeat' : 'neutral');
    mode = 'shotdown';
    say('You are going down!');
  }
}
function parachuteSectorTarget(team, position) {
  if (sel.gameMode !== 'squadron' || !['blue', 'red'].includes(team) || !position?.isVector3) return null;
  const height = Math.max(0, position.y - heightAt(position.x, position.z));
  const glideReach = Math.min(215, Math.max(38, height / 5 * 2.55 + 32));
  let nearest = null;
  let nearestDistance = glideReach;
  for (const sector of sectorControl) {
    if (!canCaptureSector(sector, team).ok) continue;
    const distance = Math.hypot(position.x - sector.x, position.z - sector.z);
    if (distance < nearestDistance) {
      nearest = sector;
      nearestDistance = distance;
    }
  }
  return nearest;
}
function spawnChute(pos, pilot = null, offset = null) {
  const m = new THREE.Group();
  const canopy = new THREE.Mesh(new THREE.SphereGeometry(3, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshLambertMaterial({
    color: 0xeeeadd,
    side: THREE.DoubleSide
  }));
  canopy.position.y = 5;
  canopy.visible = false;
  const npc = !!pilot?.bot;
  const failed = npc && Math.random() < 0.2;
  const person = makeStylizedSoldier(pilot?.team || sel.team, false, pilot?.pilotAppearance || null);
  const smokingProp = npc && !failed && Math.random() < 0.18 ? addPilotCigarette(person) : null;
  person.armPivots[0].rotation.z = failed ? -0.42 : -1.05;
  person.armPivots[1].rotation.z = failed ? 0.42 : 1.05;
  if (failed) {
    person.armPivots[0].rotation.x = -0.8;
    person.armPivots[1].rotation.x = 0.8;
  }
  m.add(canopy, person.g);
  m.position.copy(pos).add(offset || new THREE.Vector3(2, 2, 0));
  scene.add(m);
  const friendlySites = npc && !failed ? debriefSites.filter(site => site.team === pilot.team) : [];
  const destination = friendlySites.reduce((closest, site) => {
    if (!closest) return site;
    return Math.hypot(site.x - pos.x, site.z - pos.z) < Math.hypot(closest.x - pos.x, closest.z - pos.z) ? site : closest;
  }, null);
  const captureSector = npc && !failed ? parachuteSectorTarget(pilot.team, pos) : null;
  const c = {
    m,
    canopy,
    person,
    t: 0,
    npc,
    failed,
    destination,
    captureSector,
    pilot,
    runT: 0,
    runDistance: 0,
    hideAfter: 10,
    driftZ: 0.65 + Math.random() * 0.35,
    driftX: (Math.random() - 0.5) * 0.35,
    cigarette: smokingProp?.object || null,
    cigaretteTip: smokingProp?.tip || null,
    smokeTimer: 0.8 + Math.random() * 1.2,
    honorWarned: false,
    aceFlyoverTarget: pilot?.aceFlyoverTarget || null
  };
  if (c.aceFlyoverTarget && !c.aceFlyoverTarget.chute) c.aceFlyoverTarget.chute = c;
  if (failed) feed(`${pilot.name} has a failed canopy — panic fall!`, 'crash');
  chutes.push(c);
  return c;
}
const hideHoleDiskGeo = new THREE.CircleGeometry(1.75, 18);
const hideHoleRimGeo = new THREE.TorusGeometry(1.58, 0.2, 6, 18);
const hideHoleDiskMat = new THREE.MeshBasicMaterial({
  color: 0x211d18,
  side: THREE.DoubleSide
});
const hideHoleRimMat = new THREE.MeshLambertMaterial({
  color: 0x665946
});
function beginParachutistHide(chute) {
  if (chute.hiding) return;
  chute.hiding = true;
  chute.hideT = 0;
  chute.hideGround = heightAt(chute.m.position.x, chute.m.position.z);
  chute.returning = false;
  if (chute.cigarette) chute.cigarette.visible = false;
  const hole = new THREE.Group();
  const disk = new THREE.Mesh(hideHoleDiskGeo, hideHoleDiskMat);
  disk.rotation.x = -Math.PI / 2;
  disk.position.y = 0.03;
  const rim = new THREE.Mesh(hideHoleRimGeo, hideHoleRimMat);
  rim.rotation.x = -Math.PI / 2;
  rim.position.y = 0.05;
  hole.add(disk, rim);
  hole.position.set(chute.m.position.x, chute.hideGround, chute.m.position.z);
  world.add(hole);
  chute.hideHole = hole;
}

// ---------- Simulation ----------
const qd = new THREE.Quaternion();
const ax = new THREE.Vector3();
const copilotGoal = new THREE.Vector3();
const copilotInverse = new THREE.Quaternion();
const copilotForward = new THREE.Vector3();
const copilotAvoidance = new THREE.Vector3();
function enableBomberCopilot(p) {
  if (p.copilotStabilityActive) return;
  const clearance = sel.map === 'bedroom' ? 108 : 125;
  const terrain = heightAt(p.g.position.x, p.g.position.z);
  p.copilotAltitude = Math.max(p.g.position.y, terrain + clearance, 160);
  p.copilotStabilityActive = true;
}
function copilotObjectiveActive(objective, aircraft) {
  if (!objective?.target) return false;
  const target = objective.target;
  if (objective.kind === 'field') return !target.rear && !target.disabled && target.team !== aircraft.team;
  if (objective.kind === 'factory') return !target.destroyed && target.team !== aircraft.team;
  if (objective.kind === 'ship' || objective.kind === 'convoy') return target.sunk <= 0 && target.team !== aircraft.team;
  if (objective.kind === 'vehicle') return target.dead <= 0 && target.team !== aircraft.team;
  if (objective.kind === 'train') return !target.destroyed && target.team !== aircraft.team;
  return false;
}
function copilotObjectivePosition(objective, aircraft, out = new THREE.Vector3()) {
  const target = objective.target;
  if (objective.kind === 'field') return out.set(target.x, heightAt(target.x, target.z), target.z);
  if (objective.kind === 'factory') return out.set(target.x, heightAt(target.x, target.z), target.z);
  if (objective.kind === 'vehicle' || objective.kind === 'ship' || objective.kind === 'convoy') return out.copy(target.g.position);
  if (objective.kind === 'train') {
    const parts = target.parts || [];
    let nearest = parts[0] || target.g;
    for (const part of parts) {
      if (part.position.distanceToSquared(aircraft.g.position) < nearest.position.distanceToSquared(aircraft.g.position)) nearest = part;
    }
    return out.copy(nearest.position);
  }
  return out.copy(aircraft.g.position);
}
function nearestCopilotObjective(aircraft) {
  const candidates = [];
  for (const field of FIELDS[sel.map]) if (!field.rear && !field.disabled && field.team !== aircraft.team) candidates.push({
    kind: 'field',
    target: field
  });
  for (const site of industrialSites) if (!site.destroyed && site.team !== aircraft.team) candidates.push({
    kind: 'factory',
    target: site
  });
  for (const ship of ships) if (ship.sunk <= 0 && ship.team !== aircraft.team) candidates.push({
    kind: 'ship',
    target: ship
  });
  for (const vessel of convoyVessels) if (vessel.sunk <= 0 && vessel.team !== aircraft.team) candidates.push({
    kind: 'convoy',
    target: vessel
  });
  for (const vehicle of groundVehicles) if (vehicle.dead <= 0 && vehicle.team !== aircraft.team) candidates.push({
    kind: 'vehicle',
    target: vehicle
  });
  if (frontTrain && !frontTrain.destroyed && frontTrain.team !== aircraft.team) candidates.push({
    kind: 'train',
    target: frontTrain
  });
  let nearest = null;
  let nearestDistance = Infinity;
  for (const objective of candidates) {
    const point = copilotObjectivePosition(objective, aircraft, copilotGoal);
    const distance = Math.hypot(point.x - aircraft.g.position.x, point.z - aircraft.g.position.z);
    if (distance < nearestDistance) {
      nearest = objective;
      nearestDistance = distance;
    }
  }
  return nearest;
}
function updateCopilotObjective(p, dt) {
  p.copilotObjectiveCheck = Math.max(0, (p.copilotObjectiveCheck || 0) - dt);
  if (!copilotObjectiveActive(p.copilotObjective, p)) {
    p.copilotObjective = null;
    p.copilotObjectiveCheck = 0;
  }
  if (!p.copilotObjective || p.copilotObjectiveCheck <= 0) {
    p.copilotObjective = nearestCopilotObjective(p);
    p.copilotObjectiveCheck = 2.5;
  }
  return p.copilotObjective;
}
function bomberCopilotControls(p, dt, seatRole = role) {
  enableBomberCopilot(p);
  const clearance = sel.map === 'bedroom' ? 108 : 125;
  const forward = copilotForward.set(0, 0, -1).applyQuaternion(p.g.quaternion).setY(0);
  if (forward.lengthSq() < 0.01) forward.set(0, 0, -1);
  forward.normalize();

  // The crew flies a steady, level course and only climbs when terrain requires it.
  let safeHeight = Math.max(p.copilotAltitude || 160, heightAt(p.g.position.x, p.g.position.z) + clearance);
  for (let sample = 1; sample <= 8; sample++) {
    const distance = sample * 42;
    const x = p.g.position.x + forward.x * distance;
    const z = p.g.position.z + forward.z * distance;
    safeHeight = Math.max(safeHeight, heightAt(x, z) + clearance);
  }
  if (sel.map === 'bedroom') safeHeight = Math.min(safeHeight, BEDROOM_BOUNDS.ceiling - 35);
  p.copilotAltitude = Math.max(p.copilotAltitude || safeHeight, safeHeight);
  const altitudeError = p.copilotAltitude - p.g.position.y;
  return {
    pitch: THREE.MathUtils.clamp(altitudeError * 0.0024, -0.18, 0.22),
    roll: 0
  };
}
function switchBomberSeat() {
  if (!player?.bomber && !player?.twoSeater) return;
  const nextRole = player.twoSeater ? role === 'pilot' ? 'gun' : 'pilot' : role === 'pilot' ? 'bomb' : role === 'bomb' ? 'gun' : 'pilot';
  if (player.twoSeater && nextRole === 'gun' && player.rearGunnerWounded) {
    say('Rear gunner is wounded — return to base to replace him');
    return;
  }
  role = nextRole;
  syncBomberCrew(player);
  mouseAimReady = false;
  input.mx = input.my = 0;
  input.fire = input.bomb = false;
  look.yaw = look.pitch = 0;
  if (role === 'pilot') {
    player.copilotStabilityActive = false;
    player.copilotAltitude = null;
    player.copilotRoute = null;
    player.copilotObjective = null;
    player.copilotBombRunTarget = null;
    say('Pilot seat — you have the controls');
  } else {
    enableBomberCopilot(player);
    say(`${role === 'bomb' ? 'Bombardier' : 'Gunner'} seat — crew pilot has the controls`);
  }
}
function rotLocal(p, x, y, z, a) {
  qd.setFromAxisAngle(ax.set(x, y, z), a);
  p.g.quaternion.multiply(qd);
}
function flyPlane(p, dt, pitchIn, rollIn) {
  const layerCount = p.wingLayerCount ||= Math.max(1, ...['left', 'right'].map(side => new Set((p.wingPanels?.[side] || []).map(part => part.userData.breakLayer).filter(Boolean)).size));
  const detached = p.detachedWingLayers;
  const leftWingLoss = (detached?.left?.size || 0) / layerCount;
  const rightWingLoss = (detached?.right?.size || 0) / layerCount;
  const wingControl = Math.max(0.38, 1 - (leftWingLoss + rightWingLoss) * 0.12 - Math.abs(leftWingLoss - rightWingLoss) * 0.42);
  const turn = p.stats.turn * (p.isPlayer ? 1 : 0.7) * wingControl;
  if (p.dying || p.wingFailure) {
    p.crashElapsed = (p.crashElapsed || 0) + dt;
    pitchIn = 0;
    rollIn = 0;
    const age = p.crashElapsed;
    if (p.deferredWingBreakTimer > 0) {
      p.deferredWingBreakTimer = Math.max(0, p.deferredWingBreakTimer - dt);
      if (p.deferredWingBreakTimer === 0 && !p.deferredWingBreakDone) {
        p.deferredWingBreakDone = true;
        p.breakSide = p.deferredWingBreakSide || (Math.random() < 0.5 ? -1 : 1);
        detachWing(p, p.breakSide, null, true);
      }
    }
    const stallDelay = p.crashStallDelay || 0;
    const failureAge = Math.max(0, age - stallDelay);
    const engineStillRunning = age < stallDelay;
    const initialSpeed = Math.max(1, p.crashInitialSpeed || p.stats.speed || 40);
    const stallSpeed = Math.max(sel.map === 'bedroom' ? 7 : 12, initialSpeed * 0.48);
    const speedBlend = 1 - THREE.MathUtils.smoothstep(p.speed, stallSpeed, stallSpeed + initialSpeed * 0.16);
    const timeStall = THREE.MathUtils.smoothstep(failureAge, 0.85, 1.65);
    const stall = Math.max(timeStall, speedBlend);
    if (p.tailBroken) {
      p.tailCrashElapsed = age;
      const transition = THREE.MathUtils.smoothstep(failureAge, 0.2, 1.1);
      const spiral = transition * transition * (3 - 2 * transition);
      const yaw = age * 0.86 + Math.max(0, age - 1.15) * 0.64;
      const noseDown = 0.08 + Math.max(spiral, stall) * 1.02;
      const bank = Math.sin(age * 2.35) * Math.max(spiral, speedBlend * 0.55) * 0.5;
      const target = makeCrashAttitude(p.crashHeading, yaw, noseDown, bank);
      p.g.quaternion.slerp(target, 1 - Math.exp(-4.2 * dt));
    } else if (p.crashStyle === 'spiral' || p.crashStyle === 'breakup') {
      const strength = p.crashStyle === 'spiral' ? 1 : 0.68;
      const spiral = THREE.MathUtils.smoothstep(failureAge, 0.16, 1.35);
      const side = p.breakSide || p.lastDamageSide || 1;
      const yaw = age * (0.72 + strength * 0.78 + spiral * 0.34);
      const noseDown = 0.12 + Math.max(stall * 0.82, spiral * strength) * 1.02;
      const bank = side * (0.14 + spiral * strength * 0.52) + Math.sin(age * 2.8) * spiral * 0.12;
      const target = makeCrashAttitude(p.crashHeading, yaw, noseDown, bank);
      p.g.quaternion.slerp(target, 1 - Math.exp(-4.1 * dt));
    } else if (p.wingFailure && !p.dying) {
      const spiral = THREE.MathUtils.smoothstep(failureAge, 0.55, 2.6);
      const yaw = age * (0.28 + spiral * 0.34);
      const bank = (p.breakSide || 1) * (0.12 + spiral * 0.28) + Math.sin(age * 1.8) * 0.055;
      const noseDown = 0.1 + Math.max(THREE.MathUtils.smoothstep(failureAge, 0.35, 2.4) * 0.72, stall * 0.42);
      const target = makeCrashAttitude(p.crashHeading, yaw, noseDown, bank);
      p.g.quaternion.slerp(target, 1 - Math.exp(-3.3 * dt));
    } else if (p.breakup === 'wing' && p.wingLost) {
      const spiral = THREE.MathUtils.smoothstep(age, 0.18, 1.15);
      const yaw = age * (0.78 + spiral * 0.42);
      const bank = (p.breakSide || 1) * (0.16 + spiral * 0.42) + Math.sin(age * 2.5) * 0.1;
      const noseDown = 0.1 + Math.max(stall, spiral * 0.62) * 0.88;
      const target = makeCrashAttitude(p.crashHeading, yaw, noseDown, bank);
      p.g.quaternion.slerp(target, 1 - Math.exp(-4.4 * dt));
    } else {
      // A short damaged glide becomes a steep stall dive as speed bleeds away.
      const noseDown = THREE.MathUtils.lerp(0.08, 1.08, stall);
      const target = makeCrashAttitude(p.crashHeading, 0, noseDown);
      p.g.quaternion.slerp(target, 1 - Math.exp(-4.6 * dt));
    }

    // Position, momentum and asymmetric wing drag are integrated by the ragdoll step below.
  }
  if (p.controlSurfaces) {
    const actuation = p.controlActuation;
    const commandedRoll = p.dying || p.wingFailure ? 0 : THREE.MathUtils.clamp(rollIn, -1, 1);
    const commandedPitch = p.dying || p.wingFailure ? 0 : THREE.MathUtils.clamp(pitchIn, -1, 1);
    actuation.roll = THREE.MathUtils.damp(actuation.roll, commandedRoll, 12, dt);
    actuation.pitch = THREE.MathUtils.damp(actuation.pitch, commandedPitch, 12, dt);
    for (const {
      side,
      pivot
    } of p.controlSurfaces.ailerons) pivot.rotation.x = side * actuation.roll * 0.34;
    p.controlSurfaces.elevator.rotation.x = -actuation.pitch * 0.32;
    p.controlSurfaces.rudder.rotation.y = actuation.roll * 0.3;
  }
  rotLocal(p, 1, 0, 0, pitchIn * turn * dt);
  const wingImbalance = leftWingLoss - rightWingLoss;
  rotLocal(p, 0, 0, 1, rollIn * turn * 1.5 * dt + (!p.dying && !p.wingFailure ? wingImbalance * 0.11 * dt : 0));
  if (p.dying && p.tailSnapTimer > 0 && p.tail.visible) {
    p.tailSnapTimer = Math.max(0, p.tailSnapTimer - dt);
    const snapAge = 0.55 - p.tailSnapTimer;
    p.tail.rotation.x = p.tailSnapBase.x + Math.sin(snapAge * 27) * 0.22;
    p.tail.rotation.z = p.tailSnapBase.z + Math.sin(snapAge * 31) * 0.3;
    if (p.tailSnapTimer <= 0) {
      releaseAirframePiece(p, p.tail, new THREE.Vector3(0, 2.5, 0));
      p.tail.visible = false;
      p.tailBroken = true;
      p.tailCrashElapsed = 0;
    }
  }
  const landingApproach = p.isPlayer && p.emergencyLanding && mode === 'fly';
  if (landingApproach && p.g.position.y - heightAt(p.g.position.x, p.g.position.z) < 26) {
    const attitude = new THREE.Euler().setFromQuaternion(p.g.quaternion, 'YXZ');
    const level = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, attitude.y, 0, 'YXZ'));
    p.g.quaternion.slerp(level, 1 - Math.exp(-2.6 * dt));
  }
  const right = new THREE.Vector3(1, 0, 0).applyQuaternion(p.g.quaternion);
  const fwd = new THREE.Vector3(0, 0, -1).applyQuaternion(p.g.quaternion);
  if (!p.dying && !p.wingFailure) {
    p.g.quaternion.premultiply(qd.setFromAxisAngle(ax.set(0, 1, 0), right.y * 0.9 * dt));
    if (Math.abs(rollIn) < 0.1) rotLocal(p, 0, 0, 1, -right.y * dt * 0.8);
  }
  const cruiseSpeed = p.stats.speed * (sel.map === 'bedroom' ? BEDROOM_FLIGHT_SPEED_SCALE : 1);
  if (!p.dying && !p.wingFailure) {
    const targetSpeed = landingApproach ? Math.min(cruiseSpeed, 18) : cruiseSpeed;
    const response = landingApproach ? 1.65 : 0.5;
    p.speed += (targetSpeed - p.speed) * dt * response - fwd.y * 9.8 * dt * (landingApproach ? 0.38 : 0.6);
  }
  if (p.dying || p.wingFailure) stepCrashRagdoll(p, dt);else p.g.position.addScaledVector(fwd, p.speed * dt);
  if (sel.map === 'bedroom' && !p.dying && !p.wingFailure) {
    if (p.g.position.x < BEDROOM_BOUNDS.minX) {
      p.g.position.x = BEDROOM_BOUNDS.minX;
      p.g.rotation.y = -Math.PI / 2;
    } else if (p.g.position.x > BEDROOM_BOUNDS.maxX) {
      p.g.position.x = BEDROOM_BOUNDS.maxX;
      p.g.rotation.y = Math.PI / 2;
    }
    if (p.g.position.z < BEDROOM_BOUNDS.minZ) {
      p.g.position.z = BEDROOM_BOUNDS.minZ;
      p.g.rotation.y = Math.PI;
    } else if (p.g.position.z > BEDROOM_BOUNDS.maxZ) {
      p.g.position.z = BEDROOM_BOUNDS.maxZ;
      p.g.rotation.y = 0;
    }
    if (p.g.position.y > BEDROOM_BOUNDS.ceiling) {
      p.g.position.y = BEDROOM_BOUNDS.ceiling;
      p.g.rotation.x = -0.18;
    }
  }
  const aircraftFailing = p.dying || p.wingFailure;
  const crashAge = aircraftFailing ? p.crashElapsed || 0 : 0;
  const engineStillRunning = aircraftFailing && crashAge < (p.crashStallDelay || 0);
  p.prop.rotation.z += dt * (aircraftFailing ? engineStillRunning ? 28 : 8 : 40);
  if (p.props) for (const pr of p.props) pr.rotation.z += dt * (aircraftFailing ? engineStillRunning ? 24 : 6 : 36);
  p.puff -= dt;
  p.damagePuff = (p.damagePuff || 0) - dt;
  if (p.engineDamaged && !p.dying && p.damagePuff <= 0) {
    p.damagePuff = 0.16 + Math.random() * 0.12;
    const engineTrail = p.g.position.clone().add(new THREE.Vector3(0, 0.35, 5.4).applyQuaternion(p.g.quaternion));
    smoke(engineTrail, 0.58 + Math.random() * 0.18, 2.6, 0x666966, -0.12, 0.2, 0.02, 0.62);
  }
  const burning = (p.dying || p.wingFailure) && (!p.bot || crashAge >= (p.crashStallDelay || 0));
  if (burning) {
    if (!p.flame) {
      p.flame = new THREE.Group();
      p.flame.position.set(0, 0.1, -2.35);
      p.flamePieces = [];
      const addFlame = (radius, length, color, x, y, z, opacity) => {
        const flame = new THREE.Mesh(new THREE.ConeGeometry(radius, length, 8), new THREE.MeshBasicMaterial({
          color,
          transparent: true,
          opacity,
          depthWrite: false,
          side: THREE.DoubleSide
        }));
        flame.rotation.x = Math.PI / 2;
        flame.position.set(x, y, z);
        p.flame.add(flame);
        p.flamePieces.push(flame);
      };
      addFlame(0.52, 2.8, 0xd63210, 0, 0, 1.15, 0.78);
      addFlame(0.34, 2.2, 0xff5a12, 0, 0.02, 0.8, 0.92);
      addFlame(0.2, 1.4, 0xffc342, 0, 0.02, 0.48, 0.95);
      addFlame(0.19, 1.5, 0xff7218, -0.25, 0.12, 1.55, 0.8);
      addFlame(0.2, 1.35, 0xf34610, 0.24, -0.1, 1.35, 0.78);
      p.g.add(p.flame);
    }
    const pulse = 0.85 + Math.sin(performance.now() * 0.035) * 0.18 + Math.random() * 0.18;
    p.flamePieces.forEach((flame, i) => flame.scale.set(0.72 + pulse * (i === 2 ? 0.38 : 0.28), 0.82 + Math.random() * 0.45, 0.8 + pulse * 0.3));
  }
  if (p.dying && p.bot && p.chutesLeft > 0) {
    p.chuteDelay = Math.max(0, (p.chuteDelay ?? 2) - dt);
    if (p.chuteDelay <= 0) {
      p.chutesLeft--;
      let parachutist = p;
      let offset = null;
      if (p.twoSeater) {
        const index = p.twoSeatChuteIndex || 0;
        const crew = p.bomberCrew?.[index];
        if (crew) parachutist = {
          bot: true,
          team: p.team,
          name: `${p.name} · ${crew.role === 'gun' ? 'observer' : 'pilot'}`,
          pilotAppearance: crew.appearance
        };
        const right = new THREE.Vector3(1, 0, 0).applyQuaternion(p.g.quaternion);
        offset = new THREE.Vector3(0, 2, 0).addScaledVector(right, index === 0 ? -2 : 2);
        p.twoSeatChuteIndex = index + 1;
      }
      const chute = spawnChute(p.g.position, parachutist, offset);
      if (p.aceFlyoverTarget && !p.aceFlyoverTarget.chute) {
        p.aceFlyoverTarget.chute = chute;
        chute.aceFlyoverTarget = p.aceFlyoverTarget;
      }
      p.chuteDelay = p.chutesLeft > 0 ? 0.65 + Math.random() * 0.55 : 0;
    }
  }
  if ((p.dying || p.wingFailure) && (!p.bot || crashAge >= (p.crashStallDelay || 0)) && p.puff < 0) {
    p.puff = 0.055 + Math.random() * 0.025;
    const tail = p.g.position.clone().add(new THREE.Vector3(0, 0.25, 5.7).applyQuaternion(p.g.quaternion));
    smoke(tail, 1.38 + Math.random() * 0.42, 4.4, 0x11100f, -0.12, 0.34, -0.02, 0.84);
    if (Math.random() < 0.8) {
      const fireAt = p.g.position.clone().add(new THREE.Vector3((Math.random() - 0.5) * 0.55, 0.25, -1.1).applyQuaternion(p.g.quaternion));
      smoke(fireAt, 0.26 + Math.random() * 0.18, 0.38, 0xff711b, 0, 0.12, 0, 0.82);
    }
  }
  if (landingApproach && completeEmergencyLanding(p)) return;
  if (p.g.position.y < heightAt(p.g.position.x, p.g.position.z) + 1.5 || p.g.position.y < 0.5) crash(p);
}
function buildSplitCrashWreck(p) {
  if (p.fuselage) p.fuselage.visible = false;
  const charredWood = new THREE.MeshLambertMaterial({
    color: 0x39342b
  });
  const tornMetal = new THREE.MeshLambertMaterial({
    color: 0x45433c
  });
  const front = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.43, 2.7, 7), charredWood);
  front.rotation.x = Math.PI / 2;
  front.position.set(0, -0.2, -1.12);
  const splitRim = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.18, 7), tornMetal);
  splitRim.rotation.x = Math.PI / 2;
  splitRim.position.set(0, -0.2, 0.2);
  p.g.add(front, splitRim);
  const aft = new THREE.Group();
  aft.position.set(0, -0.16, 0.9);
  aft.rotation.x = -Math.PI / 6;
  const rear = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.3, 2.9, 7), charredWood);
  rear.rotation.x = Math.PI / 2;
  aft.add(rear);
  if (p.tail && !p.tailBroken) {
    aft.add(p.tail);
    p.tail.position.set(0, -0.05, -0.9);
    p.tail.rotation.set(0, 0, 0);
  }
  for (let i = 0; i < 4; i++) {
    const splinter = new THREE.Mesh(impactChipGeometry, tornMetal);
    splinter.position.set((Math.random() - 0.5) * 0.55, -0.05 + Math.random() * 0.35, 0.3 + Math.random() * 0.4);
    splinter.scale.set(0.28 + Math.random() * 0.35, 0.12 + Math.random() * 0.18, 0.25 + Math.random() * 0.35);
    splinter.rotation.set(Math.random(), Math.random(), Math.random());
    aft.add(splinter);
  }
  p.g.add(aft);
}
function crash(p) {
  if (!p.dying && !p.isRemote && p.hits > 0 && areHostilePilots(p.lastAircraftAttacker, p)) {
    // A damaged aircraft that reaches the ground is still a damage kill: award it to
    // the last enemy plane whose bullets struck the airframe.
    kill(p, p.lastAircraftAttacker);
  }
  const pilotName = p.name || (p.isPlayer ? sel.name : 'Aircraft');
  feed(`${pilotName} crashed`, 'crash');
  const impact = p.g.position.clone();
  impact.y = heightAt(impact.x, impact.z) + 0.3;
  if (p.aceFlyoverTarget) {
    p.aceFlyoverTarget.position.copy(impact);
    p.aceFlyoverTarget.aircraft = null;
    p.aceFlyoverTarget.crashed = true;
  }
  boom(impact);
  smoke(impact.clone().add(new THREE.Vector3(0, 0.8, 0)), 1.18, 4.1, 0x24211e, -0.42, 0.38, -0.06, 0.8);
  const splitWreck = Math.random() < 0.3;
  if (!p.breakup && p.wingPanels && Math.random() < (splitWreck ? 0.38 : 0.22)) {
    p.breakup = 'impact';
    p.breakSide = Math.random() < 0.5 ? -1 : 1;
    detachWing(p, p.breakSide);
  }
  if (splitWreck) buildSplitCrashWreck(p);
  if (p.isPlayer) {
    if (!p.abandoned) {
      streak = 0;
      revokeRibbons(p);
    }
    stopEngineAudio();
  }
  scene.remove(p.g);
  planes = planes.filter(q => q !== p);
  if (!p.dying) {
    loseTicket(p.team, p);
    const crashRecord = stat(p);
    crashRecord.deaths++;
    crashRecord.streak = 0;
    if (p.isPlayer && mode !== 'chute' && !groundedAfterBailout) {
      save.career.deaths++;
      persist();
    }
  }
  if (p.marker) p.marker.removeFromParent();
  if (p.flame) p.flame.visible = false;
  scene.add(p.g);
  p.g.visible = true;
  p.g.position.y = heightAt(p.g.position.x, p.g.position.z) + (splitWreck ? 1.5 : 1.25);
  p.g.rotation.set(splitWreck ? 0 : (Math.random() - 0.5) * 0.16, Math.random() * 6, splitWreck ? 0 : (Math.random() - 0.5) * 0.22);
  const seen = new Set();
  p.g.traverse(o => o.material && [].concat(o.material).forEach(m => !seen.has(m) && m.color && (seen.add(m), m.color.multiplyScalar(0.35))));
  wrecks.push({
    g: p.g,
    t: 0,
    puff: 0,
    fireTime: 2.8,
    smokeDuration: 18
  });
  while (wrecks.length > MAX_WRECKS) {
    const oldest = wrecks.shift();
    scene.remove(oldest.g);
  }
  if (p.bot && !p.dying) scheduleBotReplacement(p);
  if (p.isPlayer) {
    stopEngineAudio();
    if (mode !== 'chute' && !groundedAfterBailout) {
      mode = 'dead';
      say('Crashed!');
    }
  }
}
function resolveGroundWreckCollision(position, fromX = position.x, fromZ = position.z, radius = 7) {
  for (const wreck of wrecks) {
    if (!wreck.g.visible) continue;
    const dx = position.x - wreck.g.position.x;
    const dz = position.z - wreck.g.position.z;
    const distance = Math.hypot(dx, dz);
    const limit = radius + (wreck.g.userData.collisionRadius || 3.5);
    if (distance >= limit) continue;
    let nx = dx;
    let nz = dz;
    if (distance < 0.001) {
      nx = position.x - fromX;
      nz = position.z - fromZ;
      const length = Math.hypot(nx, nz) || 1;
      nx /= length;
      nz /= length;
    } else {
      nx /= distance;
      nz /= distance;
    }
    position.x = wreck.g.position.x + nx * limit;
    position.z = wreck.g.position.z + nz * limit;
  }
}
function updateAirCollisions(dt) {
  for (const plane of planes) plane.collisionCooldown = Math.max(0, (plane.collisionCooldown || 0) - dt);
  for (let i = 0; i < planes.length; i++) {
    const a = planes[i];
    if (a.dying || a.wingFailure || !a.g.visible || a === player && mode !== 'fly' && mode !== 'shotdown') continue;
    for (let j = i + 1; j < planes.length; j++) {
      const b = planes[j];
      if (b.dying || b.wingFailure || !b.g.visible || !areHostilePilots(a, b) || a.collisionCooldown > 0 || b.collisionCooldown > 0 || b === player && mode !== 'fly' && mode !== 'shotdown') continue;
      const contactRange = a.bomber || b.bomber ? 11 : 6.5;
      if (a.g.position.distanceTo(b.g.position) > contactRange) continue;
      a.collisionCooldown = b.collisionCooldown = 1.2;
      for (const plane of [a, b]) {
        plane.hits += 2;
        plane.parts.body += 2;
        if (!plane.engineDamaged && plane.hits >= Math.ceil(plane.maxHits * 0.5) && plane.hits < plane.maxHits) {
          plane.engineDamaged = true;
          plane.damagePuff = 0;
        }
        if (plane.hits >= plane.maxHits) kill(plane, null);
      }
      const playerHit = a === player || b === player;
      if (playerHit) {
        say('Midair collision! Two points of structural damage.');
        feed('MID-AIR COLLISION · 2 structural damage', 'crash');
      }
      if (Math.random() < 0.05) {
        const victim = Math.random() < 0.5 ? a : b;
        if (!victim.dying) {
          victim.breakup = 'wing';
          victim.breakSide = Math.random() < 0.5 ? -1 : 1;
          detachWing(victim, victim.breakSide);
          victim.hits = victim.maxHits;
          kill(victim, null);
          feed(`${victim.name || 'A pilot'} lost a wing in the collision`, 'crash');
        }
      }
    }
  }
}
function bonanzaArenaPoint(elapsed = missionElapsed) {
  const phase = bonanzaZoneSeed + elapsed * 0.14;
  const scale = sel.map === 'bedroom' ? 0.42 : 1;
  const point = new THREE.Vector3(Math.sin(phase) * 205 * scale, 0, Math.cos(phase * 0.83) * 170 * scale);
  for (const field of FIELDS[sel.map]) {
    const dx = point.x - field.x;
    const dz = point.z - field.z;
    const distance = Math.hypot(dx, dz) || 1;
    const keepOut = sel.map === 'bedroom' ? 190 : 225;
    if (distance < keepOut) {
      point.x = field.x + dx / distance * keepOut;
      point.z = field.z + dz / distance * keepOut;
    }
  }
  if (sel.map === 'bedroom') {
    point.x = THREE.MathUtils.clamp(point.x, -85, 85);
    point.z = THREE.MathUtils.clamp(point.z, -75, 75);
  }
  return point;
}
function botThink(b, dt) {
  const pos = b.g.position;
  const alive = p => p && !p.dying && !p.wingFailure && planes.includes(p) && (p !== player || mode === 'fly' || (mode === 'taxi' || mode === 'takeoff') && player.emergencyLanded);
  if (b.dying || b.wingFailure) {
    flyPlane(b, dt, 0, 0);
    return;
  }
  if (b.wingmanTakeoff) {
    b.prop.rotation.z += dt * 12;
    if (mode !== 'takeoff' && mode !== 'fly') return;
    b.wingmanWait -= dt;
    if (b.wingmanWait > 0) return;
    b.wingmanTakeoff = false;
  }
  if (b.openingLaunchPending) {
    b.prop.rotation.z += dt * 12;
    if (!openingLaunchReleased || openingLaunchDelay > 0) return;
    b.openingLaunchPending = false;
  }
  if (b.missionLaunch && b.launchQueueWait > 0) {
    b.prop.rotation.z += dt * 12;
    b.launchQueueWait = Math.max(0, b.launchQueueWait - dt);
    if (b.launchQueueWait > 0) return;
  }
  if (b.wingmanEscortT > 0) b.wingmanEscortT = Math.max(0, b.wingmanEscortT - dt);
  b.think -= dt;
  if (b.target && !alive(b.target)) b.target = null;
  if (b.think <= 0) {
    b.think = b.ace ? 1.5 + Math.random() * 1.3 : 1.8 + Math.random() * 1.6;
    const foes = planes.filter(p => areHostilePilots(b, p) && alive(p));
    const otherPilots = foes.filter(p => p !== player);
    const canHunt = !b.bomber || sel.gameMode === 'bonanza';
    if (canHunt && otherPilots.length && (!foes.includes(player) || Math.random() > (b.ace ? 0.28 : 0.18))) {
      if (sel.gameMode === 'bonanza') {
        const arena = bonanzaArenaPoint();
        otherPilots.sort((a, c) => {
          const aScore = pos.distanceTo(a.g.position) + Math.max(0, a.g.position.distanceTo(arena) - 180) * 0.75;
          const cScore = pos.distanceTo(c.g.position) + Math.max(0, c.g.position.distanceTo(arena) - 180) * 0.75;
          return aScore - cScore;
        });
      } else otherPilots.sort((a, c) => pos.distanceTo(a.g.position) - pos.distanceTo(c.g.position));
      b.target = pick(otherPilots.slice(0, Math.min(3, otherPilots.length)));
    } else if (canHunt && foes.includes(player)) {
      b.target = player;
    } else b.target = null;
    b.jink = Math.random() * 100;
    if (sel.gameMode === 'bonanza') {
      const rally = bonanzaArenaPoint();
      const phase = missionElapsed * 0.38 + b.jink;
      b.wp = rally.add(new THREE.Vector3(Math.cos(phase) * 105, 38 + Math.sin(phase * 1.3) * 24, Math.sin(phase) * 105));
    } else {
      b.wp = sel.map === 'bedroom' ? new THREE.Vector3((Math.random() - 0.5) * 800, 70 + Math.random() * 100, (Math.random() - 0.5) * 620) : new THREE.Vector3((Math.random() - 0.5) * 1400, 180 + Math.random() * 200, (Math.random() - 0.5) * 900);
    }
  }
  if (b.airfieldTakeoff && b.runwayField) {
    const forward = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), b.runwayHeading || 0);
    const bedroom = sel.map === 'bedroom';
    const cruiseSpeed = b.stats.speed * (bedroom ? BEDROOM_FLIGHT_SPEED_SCALE : 1);
    b.speed = Math.min(cruiseSpeed, b.speed + (bedroom ? 7 : 13) * dt);
    b.g.position.addScaledVector(forward, b.speed * dt);
    b.g.position.y = planeGroundY(b, b.g.position.x, b.g.position.z);
    b.g.rotation.set(0, b.runwayHeading || 0, 0);
    b.prop.rotation.z += dt * 28;
    if (b.speed < Math.min(30, cruiseSpeed * 0.68)) return;
    b.airfieldTakeoff = false;
    b.g.position.y += 1.5;
    b.runwayField = null;
  }
  let goal;
  if (!b.bomber && b.initialWingman && !b.target && mode === 'fly' && player && !player.dying && !player.abandoned) {
    const playerForward = new THREE.Vector3(0, 0, -1).applyQuaternion(player.g.quaternion);
    goal = player.g.position.clone().addScaledVector(playerForward, -(28 + b.wingmanSlot * 12)).add(new THREE.Vector3(0, 8, 0));
  } else if ((b.bomber || b.twoSeater && !b.initialWingman) && sel.gameMode !== 'bonanza') {
    const home = b.team === sel.team ? {
      x: -playerField.x,
      z: playerField.z
    } : playerField;
    goal = b.outbound ? new THREE.Vector3(-home.x * 1.5, 230, -home.z) : new THREE.Vector3(home.x, 230, home.z);
    const hd = Math.hypot(pos.x - goal.x, pos.z - goal.z);
    if (!b.outbound && hd < 120) {
      b.bombCd -= dt;
      if (b.bombCd < 0) {
        b.bombCd = b.twoSeater ? 2.4 : 0.4;
        dropBomb(b);
        if (++b.drops >= (b.twoSeater ? 2 : 6)) {
          b.outbound = true;
          b.drops = 0;
        }
      }
    } else if (b.outbound && hd < 150) b.outbound = false;
  } else if (b.target) {
    const t = performance.now() * 0.001 + b.jink;
    if (b.target === player) {
      // Aces make a passing intercept, not a close orbit that shadows the player.
      const targetForward = new THREE.Vector3(0, 0, -1).applyQuaternion(player.g.quaternion);
      const targetRight = new THREE.Vector3(1, 0, 0).applyQuaternion(player.g.quaternion);
      const lead = THREE.MathUtils.clamp(pos.distanceTo(player.g.position) * 0.22, 55, 145);
      goal = player.g.position.clone().addScaledVector(targetForward, lead).addScaledVector(targetRight, Math.sin(t * 0.8) * 42).add(new THREE.Vector3(0, 24 + Math.sin(t * 0.65) * 16, 0));
    } else {
      const radius = b.ace ? 58 : 42;
      goal = b.target.g.position.clone().add(new THREE.Vector3(Math.sin(t * (b.ace ? 1.45 : 1.05)) * radius, Math.cos(t * 0.9) * (b.ace ? 34 : 22), Math.sin(t * (b.ace ? 1.2 : 0.85)) * radius));
    }
  } else goal = b.wp;
  if (sel.map !== 'bedroom' && (pos.y < heightAt(pos.x, pos.z) + 100 || Math.hypot(pos.x, pos.z) > 1400)) goal = new THREE.Vector3(0, 320, 0);
  if (missionElapsed < MISSION_OPENING_SECONDS && blimps.length && !(b.initialWingman && b.team === sel.team) && sel.gameMode !== 'bonanza') {
    const activeBlimps = blimps.filter(bl => bl.hp > 0 && bl.state !== 'falling');
    const enemyBlimps = activeBlimps.filter(bl => bl.team !== b.team);
    const candidates = enemyBlimps.length ? enemyBlimps : activeBlimps;
    const anchor = candidates.reduce((nearest, bl) => !nearest || pos.distanceTo(bl.m.position) < pos.distanceTo(nearest.m.position) ? bl : nearest, null);
    if (anchor) {
      const angle = missionElapsed * 0.32 + b.openingOrbitPhase;
      const radius = 185;
      const orbitX = anchor.m.position.x + Math.cos(angle) * radius;
      const orbitZ = anchor.m.position.z + Math.sin(angle) * radius;
      goal = new THREE.Vector3(orbitX, Math.max(anchor.m.position.y + 24 + Math.sin(angle * 1.7) * 22, heightAt(orbitX, orbitZ) + 110), orbitZ);
    }
  }
  if (sel.gameMode === 'bonanza') {
    const arena = bonanzaArenaPoint();
    const targetNearArena = b.target && b.target.g.position.distanceTo(arena) < 440;
    const targetAwayFromFields = b.target && FIELDS[sel.map].every(field => Math.hypot(b.target.g.position.x - field.x, b.target.g.position.z - field.z) > (sel.map === 'bedroom' ? 145 : 205));
    const fighterAtArena = targetNearArena && targetAwayFromFields && pos.distanceTo(arena) < 560;
    if (!fighterAtArena) {
      const phase = missionElapsed * 0.35 + b.jink;
      goal = arena.clone().add(new THREE.Vector3(Math.cos(phase) * 115, 42 + Math.sin(phase * 1.4) * 25, Math.sin(phase) * 115));
    } else {
      const offset = goal.clone().sub(arena);
      if (offset.length() > 480) goal = arena.clone().add(offset.setLength(480));
    }
  }
  if (sel.map === 'bedroom') {
    goal.x = THREE.MathUtils.clamp(goal.x, -450, 450);
    goal.z = THREE.MathUtils.clamp(goal.z, -340, 340);
    goal.y = THREE.MathUtils.clamp(goal.y, 60, 185);
  }
  const inv = b.g.quaternion.clone().invert();
  const local = goal.clone().sub(pos).normalize().applyQuaternion(inv);
  flyPlane(b, dt, THREE.MathUtils.clamp(local.y * 3, -0.6, 0.8), THREE.MathUtils.clamp(-local.x * 2, -0.8, 0.8));
  const gunnerTarget = b.twoSeater && b.rearGunnerWounded ? null : updateNpcGunnerTarget(b, dt, alive);
  b.fireCd -= dt;
  if (b.fireCd > 0 || b.dying) return;
  if (b.bomber || b.twoSeater) {
    const foe = gunnerTarget && gunnerTarget.g.position.distanceTo(pos) < 220 ? gunnerTarget : null;
    if (foe) {
      b.fireCd = 0.25;
      gunnerFire(b, foe);
    }
  } else if (b.target || sel.gameMode === 'bonanza' && gunnerTarget) {
    const combatTarget = b.target || gunnerTarget;
    const tl = combatTarget.g.position.clone().sub(pos);
    const d = tl.length();
    tl.normalize().applyQuaternion(inv);
    if (tl.z < (b.ace ? -0.91 : -0.96) && d < (b.ace ? 340 : 260)) {
      b.fireCd = b.ace ? 0.14 + Math.random() * 0.1 : 0.22 + Math.random() * 0.2;
      const accuracy = Number(b.accuracyLevel) || 0;
      fire(b, Math.max(0.018, (b.ace ? 0.035 : 0.055) - accuracy * 0.007));
    }
  }
}
function updateBullets(dt) {
  for (const b of bullets) {
    const from = b.m.position.clone();
    b.m.position.addScaledVector(b.v, dt);
    b.life -= dt;
    const seg = new THREE.Line3(from, b.m.position);
    if (b.life > 0 && b.owner?.team) {
      if (b.owner === player) {
        for (const site of protectedSites) {
          seg.closestPointToPoint(site.position, true, tmpV);
          if (tmpV.distanceTo(site.position) < site.radius) {
            if (maybeRicochetBullet(b, tmpV, site.position, site.radius, 0.24)) break;
            b.life = 0;
            reportProtectedStrike(site, b.owner);
            break;
          }
        }
      }
      if (b.life > 0 && !b.ricochetedThisStep) {
        for (const target of stoneRicochetTargets) {
          seg.closestPointToPoint(target.position, true, tmpV);
          if (tmpV.distanceTo(target.position) < target.radius && maybeRicochetBullet(b, tmpV, target.position, target.radius, target.chance || 0.24)) break;
        }
      }
      if (b.ricochetedThisStep) {
        b.ricochetedThisStep = false;
        continue;
      }
    }
    if (b.life > 0 && b.owner === player) {
      for (const chute of chutes) {
        if (!chute.npc || chute.landed || chute.remove) continue;
        const pilotPoint = chute.m.position.clone().add(new THREE.Vector3(0, 1.4, 0));
        seg.closestPointToPoint(pilotPoint, true, tmpV);
        if (tmpV.distanceTo(pilotPoint) < 4.2) {
          b.life = 0;
          reportParachutistStrike(chute, b.owner);
          break;
        }
      }
    }
    if (b.life > 0 && b.owner?.team) {
      for (const aircraft of planes) {
        if (!aircraft.twoSeater || aircraft.rearGunnerWounded || !areHostilePilots(b.owner, aircraft) || aircraft.dying) continue;
        const gunnerCrew = aircraft.bomberCrew?.find(crew => crew.role === 'gun' && crew.g.visible);
        if (!gunnerCrew) continue;
        const gunnerPoint = aircraft.g.localToWorld(gunnerCrew.g.position.clone().add(new THREE.Vector3(0, 0.56, 0)));
        seg.closestPointToPoint(gunnerPoint, true, tmpV);
        if (tmpV.distanceTo(gunnerPoint) < 1.35) {
          b.life = 0;
          aircraft.rearGunnerWounded = true;
          aircraft.gunnerTarget = null;
          if (aircraft === player) say('Rear gunner has been hit, return to base to save him');
          break;
        }
      }
    }
    for (const p of planes) {
      // The remote pilot's own client resolves hits against their authoritative aircraft.
      if (p === b.owner || p.isRemote || p.dying || p.wingFailure || !areHostilePilots(b.owner, p) || b.life <= 0) continue;
      seg.closestPointToPoint(p.g.position, true, tmpV);
      if (tmpV.distanceTo(p.g.position) < (p.bomber ? 11 : 5)) {
        b.life = 0;
        damage(p, p.g.worldToLocal(tmpV.clone()), b.owner, b.damageMultiplier || 1);
        if (b.owner === player) flashHit();
      }
    }
    for (const bl of blimps) {
      if (b.life > 0 && b.owner?.team && b.owner.team !== bl.team && bl.hp > 0 && seg.closestPointToPoint(bl.m.position, true, tmpV).distanceTo(bl.m.position) < (sel.map === 'bedroom' ? 22 : 42)) {
        b.life = 0;
        bl.hp--;
        if (b.owner === player) flashHit();
        if (bl.hp <= 0) {
          bl.state = 'falling';
          bl.fallSpeed = 0;
          bl.fallTime = 0;
          bl.puff = 0;
          bl.rope.visible = false;
          for (const flame of bl.flames) flame.visible = true;
          feed(`${bl.team === 'blue' ? 'Allied' : 'Central'} blimp shot down by ${b.owner.name}`);
          if (b.owner === player) {
            void 0;
            cashAdd(50, 'Enemy blimp destroyed!');
            recordCareerKill('blimp');
          }
        }
      }
    }
    if (b.life > 0 && b.owner?.team) {
      for (const v of groundVehicles) {
        if (v.dead > 0 || v.team === b.owner.team) continue;
        const vehiclePoint = v.g.position.clone().add(new THREE.Vector3(0, 1.2, 0));
        const vehicleRadius = v.type === 'tank' ? 4.2 : 3.4;
        seg.closestPointToPoint(vehiclePoint, true, tmpV);
        if (tmpV.distanceTo(v.g.position) < vehicleRadius) {
          if (maybeRicochetBullet(b, tmpV, vehiclePoint, vehicleRadius, v.type === 'tank' ? 0.42 : 0.3)) break;
          b.life = 0;
          damageGroundVehicle(v, b.owner);
          break;
        }
      }
      if (b.ricochetedThisStep) {
        b.ricochetedThisStep = false;
        continue;
      }
      if (b.life > 0 && frontTrain && !frontTrain.destroyed && b.owner.team !== frontTrain.team) {
        for (const car of frontTrain.parts) {
          const target = car.position.clone().add(new THREE.Vector3(0, 2, 0));
          seg.closestPointToPoint(target, true, tmpV);
          if (tmpV.distanceTo(target) < 7.2) {
            b.life = 0;
            damageFrontTrain(b.owner, 1, tmpV.clone());
            break;
          }
        }
      }
      if (b.life > 0) {
        for (const target of [...ships, ...convoyVessels]) {
          if (target.sunk > 0 || target.team === b.owner.team) continue;
          const axis = new THREE.Vector3(0, 0, 1).applyQuaternion(target.g.quaternion);
          const offsets = target.isConvoy ? [-10, 0, 10] : [-17, 0, 17];
          let struck = false;
          for (const offset of offsets) {
            const point = target.g.position.clone().addScaledVector(axis, offset).add(new THREE.Vector3(0, target.isConvoy ? 2.6 : 2.4, 0));
            seg.closestPointToPoint(point, true, tmpV);
            const hullRadius = target.isConvoy ? 6.2 : 8.5;
            if (tmpV.distanceTo(point) < hullRadius) {
              if (maybeRicochetBullet(b, tmpV, point, hullRadius, target.isConvoy ? 0.32 : 0.42)) {
                struck = true;
                break;
              }
              b.life = 0;
              damageNavalTarget(target, b.owner, 1, 'bullet');
              struck = true;
              break;
            }
          }
          if (struck) break;
        }
      }
      if (b.ricochetedThisStep) {
        b.ricochetedThisStep = false;
        continue;
      }
    }
    if (b.life <= 0) scene.remove(b.m);
  }
  bullets = bullets.filter(b => b.life > 0);
}
let playerChute = null;
let groundedAfterBailout = false;
let mountedFlak = null;
let aaFireCd = 0;
function enterTruck() {
  if (mode !== 'foot' || !playerTruck || foot.pos.distanceTo(playerTruck.g.position) >= 9) {
    say('Move closer to the truck to enter');
    return;
  }
  truckDriver = playerTruck;
  truckDriver.speed = 0;
  mode = 'truck';
  input.fire = false;
  look.yaw = look.pitch = 0;
  Object.keys(truckInput).forEach(key => truckInput[key] = false);
  startTruckAudio();
  say('Truck ready — WASD or the drive buttons to move, E to dismount');
}
function leaveTruck() {
  if (!truckDriver) return;
  const truck = truckDriver;
  const dismountOffset = new THREE.Vector3(3.2, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), truck.yaw);
  const dismountX = truck.g.position.x + dismountOffset.x;
  const dismountZ = truck.g.position.z + dismountOffset.z;
  foot.pos.set(dismountX, heightAt(dismountX, dismountZ) + 1.7, dismountZ);
  foot.jumpHeight = foot.jumpVelocity = 0;
  foot.yaw = truck.yaw;
  foot.pitch = 0;
  truck.speed = 0;
  truckDriver = null;
  stopTruckAudio();
  Object.keys(truckInput).forEach(key => truckInput[key] = false);
  input.mx = input.my = 0;
  mode = 'foot';
  say('Dismounted');
}
function updatePlayerTruck(dt, mx, my, keys) {
  if (!truckDriver) return;
  const truck = truckDriver;
  const throttle = (truckInput.forward ? 1 : 0) - (truckInput.back ? 1 : 0) - my;
  const steering = (truckInput.right ? 1 : 0) - (truckInput.left ? 1 : 0) + mx;
  truck.speed = THREE.MathUtils.clamp(truck.speed + (throttle * 10 - truck.speed * (throttle ? 0.22 : 1.35)) * dt, -5, 13);
  if (Math.abs(truck.speed) < 0.06) truck.speed = 0;
  truck.yaw -= steering * 1.25 * dt * Math.max(0.3, Math.min(1, Math.abs(truck.speed) / 3)) * (truck.speed < 0 ? -1 : 1);
  truck.g.rotation.y = truck.yaw;
  const forward = new THREE.Vector3(-Math.sin(truck.yaw), 0, -Math.cos(truck.yaw));
  truck.g.position.addScaledVector(forward, truck.speed * dt);
  truck.g.position.x = THREE.MathUtils.clamp(truck.g.position.x, -1850, 1850);
  truck.g.position.z = THREE.MathUtils.clamp(truck.g.position.z, -1850, 1850);
  truck.g.position.y = heightAt(truck.g.position.x, truck.g.position.z);
  for (const wheel of truck.wheels) wheel.rotation.x += truck.speed * dt / (wheel.userData.radius || 0.58);
  const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(look.pitch, look.yaw, 0, 'YXZ'));
  const behind = new THREE.Vector3(0, 4.2, 10).applyAxisAngle(new THREE.Vector3(0, 1, 0), truck.yaw);
  camera.position.copy(truck.g.position).add(behind);
  camera.quaternion.copy(truck.g.quaternion).multiply(q);
}
function mountFlak(gun) {
  if (mode !== 'foot' || !gun || !flakGuns.includes(gun) || foot.pos.distanceTo(gun.g.position) >= 10) {
    say('Move closer to the anti-air gun to man it');
    return;
  }
  mountedFlak = gun;
  mode = 'aa';
  input.keys.KeyE = false;
  input.fire = false;
  aaFireCd = 0;
  say('Anti-air gun manned — aim with the right side and fire with Space');
}
function leaveFlak() {
  mountedFlak = null;
  input.keys.KeyE = false;
  input.fire = false;
  mode = 'foot';
}
function fieldShopApproach(field) {
  if (sel.map === 'bedroom') {
    const {
      shop
    } = getBedroomServiceLayout(field);
    return {
      x: shop.x,
      z: shop.z - 6
    };
  }
  return fieldLocalPoint(field, 22, 72);
}
function enterShopBuilding() {
  const shop = fieldShopApproach(playerField);
  if (mode !== 'foot' || Math.hypot(foot.pos.x - shop.x, foot.pos.z - shop.z) >= 9) {
    say('Move closer to the shop to enter');
    return;
  }
  playDoorSound();
  showShop();
}
function enterDebriefBuilding() {
  if (mode !== 'foot' || !debriefSites.some(site => Math.hypot(foot.pos.x - site.x, foot.pos.z - site.z) < 9)) {
    say('Move closer to the debrief office to enter');
    return;
  }
  playDoorSound();
  showDebrief();
}
function fireMountedFlak() {
  if (!mountedFlak || !player) return;
  const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(foot.pitch, foot.yaw, 0, 'YXZ'));
  const dir = new THREE.Vector3(0, 0, -1).applyQuaternion(q).normalize();
  const origin = mountedFlak.g.position.clone().add(new THREE.Vector3(0, 2.7, 0)).addScaledVector(dir, 3.8);
  mountedFlak.pivot.lookAt(origin.clone().addScaledVector(dir, 100));
  const m = new THREE.Mesh(bulletGeo, bulletMat);
  m.position.copy(origin);
  m.lookAt(origin.clone().add(dir));
  scene.add(m);
  trackBullet({
    m,
    v: dir.multiplyScalar(280),
    owner: player,
    life: 2.4,
    damageMultiplier: 2
  });
  shotSound();
}
function step(dt) {
  const k = input.keys;
  const ePressed = input.ePressed;
  const jumpPressed = input.jumpPressed;
  input.ePressed = false;
  input.jumpPressed = false;
  const mx = input.mx + (k.KeyD ? 1 : 0) - (k.KeyA ? 1 : 0);
  const my = input.my + (k.KeyS ? 1 : 0) - (k.KeyW ? 1 : 0);
  if (firstPersonGestureT > 0) firstPersonGestureT = Math.max(0, firstPersonGestureT - dt);
  const gestureElapsed = FIRST_PERSON_GESTURE_DURATION - firstPersonGestureT;
  const gestureLift = gestureElapsed < 0.18 ? THREE.MathUtils.smoothstep(gestureElapsed / 0.18, 0, 1) : gestureElapsed < 1.05 ? 1 : 1 - THREE.MathUtils.smoothstep((gestureElapsed - 1.05) / 0.3, 0, 1);
  firstPersonGesture.position.y = -1.35 + gestureLift * 0.9;
  firstPersonGesture.visible = mode === 'foot' && !footThirdPerson && firstPersonGestureT > 0;
  if (mode !== 'foot') updateFootstepAudio(false);
  if (mode === 'spectate') {
    updateSpectator(dt, mx, my, k);
    setActions([['Climb ↑', () => spectator.vertical = 1, () => spectator.vertical = 0], ['Descend ↓', () => spectator.vertical = -1, () => spectator.vertical = 0]]);
  } else if (mode === 'foot') {
    const fwd = new THREE.Vector3(-Math.sin(foot.yaw), 0, -Math.cos(foot.yaw));
    const right = new THREE.Vector3(-fwd.z, 0, fwd.x);
    const walkAmount = Math.min(1, Math.hypot(mx, my));
    updateFootstepAudio(walkAmount > 0.08);
    const previousX = foot.pos.x;
    const previousZ = foot.pos.z;
    foot.pos.addScaledVector(fwd, -my * 5 * dt).addScaledVector(right, mx * 5 * dt);
    resolveGroundWreckCollision(foot.pos, previousX, previousZ, 2.1);
    if (sel.map === 'bedroom') {
      foot.pos.x = THREE.MathUtils.clamp(foot.pos.x, BEDROOM_BOUNDS.minX + 8, BEDROOM_BOUNDS.maxX - 8);
      foot.pos.z = THREE.MathUtils.clamp(foot.pos.z, BEDROOM_BOUNDS.minZ + 8, BEDROOM_BOUNDS.maxZ - 8);
    }
    if (jumpPressed && foot.jumpHeight <= 0.01) foot.jumpVelocity = 10;
    foot.jumpHeight = Math.max(0, foot.jumpHeight + foot.jumpVelocity * dt);
    foot.jumpVelocity -= 22 * dt;
    if (foot.jumpHeight === 0) foot.jumpVelocity = 0;
    foot.pos.y = heightAt(foot.pos.x, foot.pos.z) + 1.7 + foot.jumpHeight;
    handWalkPhase += dt * (5 + walkAmount * 10);
    walkingHands.position.set(Math.sin(handWalkPhase * 2) * 0.025 * walkAmount, -0.16 + Math.abs(Math.sin(handWalkPhase)) * 0.075 * walkAmount, 0.12 + Math.cos(handWalkPhase) * 0.045 * walkAmount);
    walkingArms.forEach((arm, i) => {
      const phase = handWalkPhase + (i ? Math.PI : 0);
      arm.rotation.x = Math.sin(phase) * 0.42 * walkAmount;
      arm.rotation.z = Math.cos(phase) * 0.12 * walkAmount;
    });
    if (walkingAvatar) {
      walkingAvatar.g.visible = footThirdPerson;
      walkingAvatar.g.position.set(foot.pos.x, heightAt(foot.pos.x, foot.pos.z) + foot.jumpHeight, foot.pos.z);
      walkingAvatar.g.rotation.set(0, foot.yaw, 0);
      const gait = Math.sin(handWalkPhase) * 0.62 * walkAmount;
      walkingAvatar.legPivots[0].rotation.x = gait;
      walkingAvatar.legPivots[1].rotation.x = -gait;
      walkingAvatar.armPivots[0].rotation.x = -gait * 0.55;
      walkingAvatar.armPivots[0].rotation.z = footThirdPerson ? -2.25 * gestureLift : 0;
      walkingAvatar.armPivots[1].rotation.x = gait * 0.55;
      walkingAvatar.torso.position.y = 0.99 + Math.abs(gait) * 0.025;
      walkingAvatar.torso.rotation.z = Math.sin(handWalkPhase * 0.5) * 0.018 * walkAmount;
      walkingAvatar.headPivot.rotation.y = Math.sin(handWalkPhase * 0.35) * 0.035 * walkAmount;
    }
    if (footThirdPerson) {
      const yawQ = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), foot.yaw);
      const viewQ = new THREE.Quaternion().setFromEuler(new THREE.Euler(foot.pitch, foot.yaw, 0, 'YXZ'));
      const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(viewQ);
      const desired = foot.pos.clone().add(new THREE.Vector3(0, 1.65, 5.4).applyQuaternion(yawQ));
      camera.position.lerp(desired, Math.min(1, dt * 9));
      camera.lookAt(foot.pos.clone().add(new THREE.Vector3(0, -0.3, 0)).addScaledVector(forward, 9));
    } else {
      camera.position.copy(foot.pos);
      camera.position.y += 0.35 + Math.abs(Math.sin(handWalkPhase)) * 0.045 * walkAmount;
      camera.rotation.set(foot.pitch, foot.yaw, 0, 'YXZ');
    }
    const near = !!player && planes.includes(player) && !player.dying && !player.abandoned && foot.pos.distanceTo(player.g.position) < 8;
    const shopApproach = fieldShopApproach(playerField);
    const nearShop = Math.hypot(foot.pos.x - shopApproach.x, foot.pos.z - shopApproach.z) < 9;
    const nearDebrief = debriefSites.some(s => Math.hypot(foot.pos.x - s.x, foot.pos.z - s.z) < 9);
    const nearCache = nearestRecoveryCache(foot.pos.x, foot.pos.z, 13);
    const courierPickupInReach = courierNearPickup(foot.pos);
    const courierDeliveryInReach = courierNearDelivery(foot.pos, 'foot');
    const rebuildableField = isGreatWarSinglePlayer() ? (FIELDS[sel.map] || []).find(field => field.team === sel.team && field.disabled && !(field.rebuildRemaining > 0) && Math.hypot(foot.pos.x - field.x, foot.pos.z - field.z) < 28) : null;
    const gun = flakGuns.find(f => foot.pos.distanceTo(f.g.position) < 10);
    const nearTruck = playerTruck && foot.pos.distanceTo(playerTruck.g.position) < 9;
    let actions = [];
    actions.unshift([footThirdPerson ? 'POV · First Person' : 'POV · Third Person', () => {
      footThirdPerson = !footThirdPerson;
    }]);
    if (groundedAfterBailout) actions.push(['Respawn · E', showSpawnMenu]);
    if (nearCache) actions.unshift([nearCache.type === 'ufo' ? 'Investigate strange craft · E' : 'Search wreck cache · E', () => searchRecoveryCache(nearestRecoveryCache(foot.pos.x, foot.pos.z, 13))]);
    if (courierPickupInReach) actions.unshift(['Pick up courier dispatch · E', () => pickUpCourierDispatch(foot.pos)]);
    if (courierDeliveryInReach) actions.unshift(['Deliver dispatch · E', () => deliverCourierDispatch(foot.pos, 'foot')]);
    if (rebuildableField) actions.unshift([`Order airfield rebuild · $15,000 · 30s · E`, () => orderAirfieldRebuild(rebuildableField)]);
    if (nearDebrief) actions.unshift(['Debrief · E', enterDebriefBuilding]);
    if (nearShop && !groundedAfterBailout) actions.unshift(['Shop · E', enterShopBuilding]);
    if (near) actions.unshift(['Board · E', board]);
    if (nearTruck) actions.unshift(['Enter truck · E', enterTruck]);
    if (gun) actions.unshift([`Use AA gun ${gun.id} · E`, () => mountFlak(gun)]);
    setActions(actions);
    if (ePressed) {
      if (nearCache) searchRecoveryCache(nearCache);else if (courierPickupInReach) pickUpCourierDispatch(foot.pos);else if (courierDeliveryInReach) deliverCourierDispatch(foot.pos, 'foot');else if (rebuildableField) orderAirfieldRebuild(rebuildableField);else if (gun) mountFlak(gun);else if (nearTruck) enterTruck();else if (near) board();else if (nearShop && !groundedAfterBailout) enterShopBuilding();else if (nearDebrief) enterDebriefBuilding();else if (groundedAfterBailout) showSpawnMenu();
    }
  } else if (mode === 'truck' && truckDriver) {
    updatePlayerTruck(dt, mx, my, k);
    setActions([['Drive ↑', () => truckInput.forward = true, () => truckInput.forward = false], ['Drive ↓', () => truckInput.back = true, () => truckInput.back = false], ['Turn left', () => truckInput.left = true, () => truckInput.left = false], ['Turn right', () => truckInput.right = true, () => truckInput.right = false], ['Exit truck · E', leaveTruck]]);
    if (ePressed) leaveTruck();
  } else if (mode === 'aa' && mountedFlak) {
    const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(foot.pitch, foot.yaw, 0, 'YXZ'));
    const dir = new THREE.Vector3(0, 0, -1).applyQuaternion(q);
    camera.position.copy(mountedFlak.g.position).add(new THREE.Vector3(0, 2.8, 0)).addScaledVector(dir, -1.5);
    camera.quaternion.copy(q);
    mountedFlak.pivot.lookAt(camera.position.clone().addScaledVector(dir, 100));
    aaFireCd -= dt;
    if ((input.fire || k.Space) && aaFireCd <= 0) {
      aaFireCd = 0.18;
      fireMountedFlak();
    }
    if (ePressed) leaveFlak();
  } else if (mode === 'shop') {
    if (ePressed) {
      playDoorSound();
      $('menu').style.display = 'none';
      mode = 'foot';
    }
  } else if (mode === 'debrief') {
    if (ePressed) {
      playDoorSound();
      $('menu').style.display = 'none';
      mode = 'foot';
    }
  } else if (mode === 'shotdown' && ePressed) {
    bailOut();
  } else if (mode === 'dead' && ePressed) {
    showSpawnMenu();
  } else if (mode === 'preflight') {
    if (ePressed) leaveAircraft();else {
      preflightElapsed = Math.min(PREFLIGHT_DURATION, preflightElapsed + dt);
      preflightRemaining = Math.max(0, preflightRemaining - dt);
      if (preflightRemaining <= 0) beginTakeoffRoll();
    }
  } else if (mode === 'taxi' || mode === 'takeoff') {
    if (mode === 'taxi' && ePressed) {
      const cache = nearestRecoveryCache(player.g.position.x, player.g.position.z, 13);
      if (cache) searchRecoveryCache(cache);else if (courierNearPickup(player.g.position)) pickUpCourierDispatch(player.g.position);else if (courierNearDelivery(player.g.position, 'taxi')) deliverCourierDispatch(player.g.position, 'taxi');else beginTakeoffRoll();
    } else if (mode === 'takeoff' && ePressed) {
      exitAircraft();
    }
    if (mode === 'takeoff') {
      player.speed += dt * 12;
      if (player.speed > 30) {
        mode = 'fly';
        player.emergencyLanded = false;
        player.emergencyLanding = false;
        player.weaponArmTimer = 3;
        player.weaponArmNotice = 0;
        say('Airborne! Weapons arm in three seconds.');
      }
    }
    const runwayForward = new THREE.Vector3(0, 0, -1).applyQuaternion(player.g.quaternion);
    player.g.position.addScaledVector(runwayForward, player.speed * dt);
    if (sel.map === 'bedroom') {
      player.g.position.x = THREE.MathUtils.clamp(player.g.position.x, BEDROOM_BOUNDS.minX, BEDROOM_BOUNDS.maxX);
      player.g.position.z = THREE.MathUtils.clamp(player.g.position.z, BEDROOM_BOUNDS.minZ, BEDROOM_BOUNDS.maxZ);
    }
    const x = player.g.position.x;
    const z = player.g.position.z;
    const surface = heightAt(x, z);
    const pitch = Math.atan2(heightAt(x, z - 2) - heightAt(x, z + 2), 4);
    const roll = Math.atan2(heightAt(x + 2, z) - heightAt(x - 2, z), 4);
    player.g.position.y = planeGroundY(player, x, z);
    player.g.rotation.set(pitch, player.launchHeading || 0, roll);
    player.prop.rotation.z += dt * 30;
  } else if (mode === 'fly' && ePressed && nearbyFriendlyRunway()) {
    landAndRefuel();
  } else if (mode === 'fly' && ePressed && emergencyLandingCanopy()) {
    toggleEmergencyLanding();
  } else if (mode === 'fly' || mode === 'shotdown') {
    const pb = player.bomber || player.twoSeater;
    const ctrl = !pb || role === 'pilot';
    const crewControls = pb && !ctrl && !player.dying ? bomberCopilotControls(player, dt, role) : null;
    if (pb) updateBomberCrew(player, dt);
    flyPlane(player, dt, ctrl ? my : crewControls?.pitch ?? 0, ctrl ? -mx : crewControls?.roll ?? 0);
    if (player.twoSeater && role === 'pilot') updatePlayerRearGunner(player, dt);
    player.fireCd -= dt;
    player.weaponArmNotice = Math.max(0, (player.weaponArmNotice || 0) - dt);
    if (mode === 'fly' && player.weaponArmTimer > 0) {
      player.weaponArmTimer = Math.max(0, player.weaponArmTimer - dt);
      if ((input.fire || k.Space || input.bomb || k.KeyB) && player.weaponArmNotice <= 0) {
        player.weaponArmNotice = 0.9;
        say(`Weapons arming · ${Math.ceil(player.weaponArmTimer)} seconds`);
      }
    }
    if ((input.fire || k.Space) && player.fireCd < 0 && mode === 'fly' && player.weaponArmTimer <= 0) {
      if (!pb || player.twoSeater && role === 'pilot') {
        player.fireCd = boost.fire ? 0.06 : 0.12;
        fire(player, 0.04 - (Number(activeEconomy().acc) || 0) * 0.008);
      } else if (role === 'gun') {
        player.fireCd = boost.fire ? 0.06 : 0.12;
        playerGun(new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion));
      }
    }
    player.bombCd = Math.max(0, (player.bombCd || 0) - dt);
    if (pb && role !== 'gun' && (input.bomb || k.KeyB) && player.bombCd <= 0 && mode === 'fly' && player.weaponArmTimer <= 0) {
      player.bombCd = dropBomb(player) ? 0.85 : 1.25;
    }
  } else if (mode === 'chute' && playerChute) {
    if (ePressed) showSpawnMenu();
    playerChute.person.headPivot.localToWorld(camera.position.set(0, 0.02, -0.17));
    camera.rotation.set(foot.pitch, foot.yaw, 0, 'YXZ');
  }
  updateRunwayMarshal();
  if (mode === 'fly') {
    aliveT += dt;
    if (aliveT >= nextBonus) {
      nextBonus += 60;
      cashAdd(50, `Survived ${Math.floor(aliveT / 60)} min`);
    }
  }
  updateWorld(dt);
  updateSectorSignals(dt);
  if (mode === 'over') return;
  if (player && planes.includes(player) && mode !== 'foot' && mode !== 'truck' && mode !== 'chute' && mode !== 'aa' && mode !== 'spectate' && !groundedAfterBailout) chaseCam();
  for (const p of planes.slice()) {
    if (!p.bot) continue;
    p.botThinkAccumulator = (p.botThinkAccumulator || 0) + dt;
    if (p.botThinkAccumulator < 1 / 30) continue;
    const botDt = p.botThinkAccumulator;
    p.botThinkAccumulator = 0;
    botThink(p, botDt);
  }
  updateAirCollisions(dt);
  for (const p of planes) if (p.marker) p.marker.visible = !p.dying && p.g.position.distanceTo(camera.position) > 200;
  if ((mode === 'chute' || groundedAfterBailout) && player && player.dying && planes.includes(player)) flyPlane(player, dt, 0, 0);
  updateBullets(dt);
  updateBlimps(dt);
  updateAirDebris(dt);
  for (const c of chutes) {
    if (c.landed) {
      c.groundedT = (c.groundedT || 0) + dt;
      if (c.hiding) {
        c.hideT += dt;
        const sink = THREE.MathUtils.smoothstep(c.hideT, 0, 1.25);
        c.m.position.y = c.hideGround + 0.02 - sink * 2.8;
        c.person.torso.rotation.z = sink * 0.42;
        c.person.headPivot.rotation.x = sink * 0.24;
        if (c.hideT >= 1.3) {
          c.remove = true;
          scene.remove(c.m);
          if (c.hideHole) world.remove(c.hideHole);
        }
        continue;
      }
      if (c.cigarette?.visible) {
        c.smokeTimer -= dt;
        if (c.smokeTimer <= 0) {
          c.smokeTimer = 0.8 + Math.random() * 1.2;
          c.m.updateMatrixWorld(true);
          const tip = c.person.headPivot.localToWorld(c.cigaretteTip.clone());
          smoke(tip, 0.055, 1.05, 0xaaa59a, 0.025, 0.2, -0.015, 0.4, 0.65);
        }
      }
      if (c.returning && c.destination) {
        c.runT += dt;
        const dx = c.destination.x - c.m.position.x;
        const dz = c.destination.z - c.m.position.z;
        const distance = Math.hypot(dx, dz);
        if (distance < 7 || c.runDistance >= c.hideAfter) {
          beginParachutistHide(c);
          continue;
        }
        const stride = Math.min(distance, 4.5 * dt);
        c.runDistance += stride;
        c.m.position.x += dx / distance * stride;
        c.m.position.z += dz / distance * stride;
        c.m.position.y = heightAt(c.m.position.x, c.m.position.z) + 0.02;
        c.m.rotation.y = Math.atan2(-dx, -dz);
        const gait = Math.sin(c.runT * 10);
        c.person.torso.position.y = 0.99 + Math.abs(gait) * 0.035;
        c.person.legPivots[0].rotation.x = gait * 0.62;
        c.person.legPivots[1].rotation.x = -gait * 0.62;
        c.person.armPivots[0].rotation.z = c.person.armPivots[1].rotation.z = 0;
        c.person.armPivots[0].rotation.x = -gait * 0.38;
        c.person.armPivots[1].rotation.x = gait * 0.38;
        c.person.headPivot.rotation.y = Math.sin(c.runT * 1.4) * 0.08;
      } else if (c.groundedT >= (c.failed ? 5 : 30)) {
        c.remove = true;
        scene.remove(c.m);
      }
      continue;
    }
    c.t += dt;
    if (c.failed) {
      c.m.rotation.z = Math.sin(c.t * 6.5) * 0.32;
      c.m.rotation.x = Math.cos(c.t * 4.2) * 0.16;
      c.person.armPivots[0].rotation.x = Math.sin(c.t * 9) * 0.85;
      c.person.armPivots[1].rotation.x = Math.cos(c.t * 8) * 0.85;
      c.person.armPivots[0].rotation.z = -0.7 + Math.sin(c.t * 7) * 0.4;
      c.person.armPivots[1].rotation.z = 0.7 + Math.cos(c.t * 7) * 0.4;
    } else {
      c.m.rotation.z = Math.sin(c.t * 1.8) * 0.04;
      c.person.legPivots[0].rotation.x = Math.sin(c.t * 2.5) * 0.08;
      c.person.legPivots[1].rotation.x = -Math.sin(c.t * 2.5) * 0.08;
    }
    c.person.headPivot.rotation.y = Math.sin(c.t * (c.failed ? 5 : 0.7)) * (c.failed ? 0.2 : 0.08);
    if (!c.failed && c.t > 1.2) c.canopy.visible = true;
    const previousX = c.m.position.x;
    const previousZ = c.m.position.z;
    if (c.captureSector && canCaptureSector(c.captureSector, c.pilot?.team).ok) {
      const dx = c.captureSector.x - c.m.position.x;
      const dz = c.captureSector.z - c.m.position.z;
      const distance = Math.hypot(dx, dz);
      if (distance > 1) {
        const glide = Math.min(distance, 2.7 * dt);
        c.m.position.x += dx / distance * glide;
        c.m.position.z += dz / distance * glide;
      }
    } else {
      c.captureSector = null;
      c.m.position.x += c.driftX * dt;
      c.m.position.z += c.driftZ * dt;
    }
    resolveGroundWreckCollision(c.m.position, previousX, previousZ, 1.3);
    c.m.position.y -= (c.failed ? 17 : c.canopy.visible ? 5 : 15) * dt;
    const ground = heightAt(c.m.position.x, c.m.position.z);
    if (c.m.position.y < ground + 0.1) {
      c.m.position.y = ground + 0.02;
      c.m.rotation.z = 0;
      c.canopy.visible = false;
      c.landed = true;
      c.groundedT = 0;
      let capturedByParachutist = false;
      if (c.captureSector && c.npc && !c.failed && canCaptureSector(c.captureSector, c.pilot?.team).ok) {
        const captureDistance = Math.hypot(c.m.position.x - c.captureSector.x, c.m.position.z - c.captureSector.z);
        if (captureDistance < 100) {
          const sector = c.captureSector;
          setSectorOwner(sector, c.pilot.team, 'npc');
          const pilotRecord = c.pilot?.name ? stat(c.pilot) : null;
          if (pilotRecord) pilotRecord.sectorsCaptured = (pilotRecord.sectorsCaptured || 0) + 1;
          feed(`PARACHUTE CAPTURE · ${c.pilot?.team?.toUpperCase()} FLAG RAISED IN SECTOR ${sector.column + 1}-${sector.row + 1}`, 'victory');
          capturedByParachutist = true;
          c.captureSector = null;
        }
      }
      c.returning = c.npc && !!c.destination && !capturedByParachutist;
      if (c.cigarette) c.cigarette.visible = true;
      if (c === playerChute && mode === 'chute') {
        foot.pos.set(c.m.position.x, ground + 1.7, c.m.position.z);
        foot.jumpHeight = foot.jumpVelocity = 0;
        foot.pitch = 0;
        groundedAfterBailout = true;
        mode = 'foot';
        say('You landed safely. Walk around or man an anti-air gun.');
      }
    }
  }
  chutes = chutes.filter(c => !c.remove);
  updateAceFlyoverBonuses(dt);
  for (const f of puffs) {
    f.life -= dt;
    if (f.bomb) f.vy -= 9.8 * dt;
    f.m.position.y += f.vy * dt;
    if (f.spin) f.m.rotation.x += dt * 3;else if (!f.smallSmoke) f.m.scale.multiplyScalar(1 + dt);else if (f.expand) {
      const age = 1 - f.life / (f.max || 1);
      const scale = f.baseScale * (1 + f.expand * age);
      f.m.scale.set(scale, scale, 1);
    }
    f.m.position.x += (f.vx || 0) * dt;
    f.m.position.z += (f.vz || 0) * dt;
    if (f.m.material && !f.spin) {
      const fade = Math.max(0, Math.min(1, f.life / (f.max || 2.5)));
      f.m.material.opacity = f.smallSmoke ? (f.smokeOpacity ?? 0.55) * fade : Math.min(0.8, fade);
    }
    if (f.life <= 0) scene.remove(f.m);
  }
  for (const f of puffs) {
    if (f.life > 0) continue;
    if (f.smallSmoke) {
      activeSmokePuffs = Math.max(0, activeSmokePuffs - 1);
      recycleSmokeSprite(f.m);
    }
    if (f.end) f.end();
    if (f.dispose) f.dispose();
  }
  puffs = puffs.filter(f => f.life > 0);
  updateFieldListeners(dt);
  updateFieldGramophone(dt);
  updateEngineAudio(dt);
  ui(dt);
}
function beginTakeoffRoll() {
  if (!player || !planes.includes(player) || !['preflight', 'taxi'].includes(mode)) return;
  preflightRemaining = 0;
  mode = 'takeoff';
  say('Takeoff roll!');
}
function setupRunwayMarshal(field, lane) {
  if (!runwayMarshal) {
    runwayMarshal = makeStylizedSoldier(sel.team, false, {
      gender: 'male',
      mustache: false
    });
    runwayMarshal.team = sel.team;
  } else if (runwayMarshal.team !== sel.team) {
    runwayMarshal.torso.material = soldierMaterials[sel.team].uniforms[0];
    runwayMarshal.team = sel.team;
  }
  const side = lane < 0 ? -1 : 1;
  const point = fieldLocalPoint(field, lane + side * 8, 22);
  runwayMarshal.g.position.set(point.x, heightAt(point.x, point.z) + 0.03, point.z);
  runwayMarshal.g.rotation.y = fieldRunwayHeading(field) + Math.PI;
  runwayMarshal.g.visible = true;
  runwayMarshal.active = true;
  if (runwayMarshal.g.parent !== scene) scene.add(runwayMarshal.g);
}
function updateRunwayMarshal() {
  if (!runwayMarshal || !runwayMarshal.active) return;
  if (['fly', 'shotdown', 'shotdown2', 'dead', 'chute', 'spectate', 'menu', 'over'].includes(mode)) {
    scene.remove(runwayMarshal.g);
    runwayMarshal.g.visible = false;
    runwayMarshal.active = false;
    return;
  }
  const wave = Math.sin(performance.now() * 0.009);
  runwayMarshal.armPivots[0].rotation.x = 1.1 + wave * 0.22;
  runwayMarshal.armPivots[0].rotation.z = -0.38;
  runwayMarshal.armPivots[1].rotation.x = 0.08;
}
function board() {
  if (mode !== 'foot' || !player || !planes.includes(player) || player.dying || player.abandoned || foot.pos.distanceTo(player.g.position) >= 8) {
    say('This aircraft is wrecked or abandoned. Respawn to take another sortie.');
    return;
  }
  openingLaunchReleased = true;
  openingLaunchDelay = 0;
  startEngineAudio();
  preflightElapsed = 0;
  preflightRemaining = PREFLIGHT_DURATION;
  setupRunwayMarshal(playerField, player.runwayLane || 0);
  mode = 'preflight';
  say('Runway marshal signals you forward — takeoff in 3');
}
function leaveAircraft() {
  if (!player || !planes.includes(player) || !['preflight', 'taxi', 'takeoff'].includes(mode) || player.speed >= 30) return;
  const side = new THREE.Vector3(4, 0, 0).applyQuaternion(player.g.quaternion);
  const x = player.g.position.x + side.x;
  const z = player.g.position.z + side.z;
  foot.pos.set(x, heightAt(x, z) + 1.7, z);
  foot.jumpHeight = foot.jumpVelocity = 0;
  foot.yaw = player.g.rotation.y;
  foot.pitch = 0;
  mode = 'foot';
  stopEngineAudio();
  say('You left the aircraft');
}
function emergencyLandingCanopy() {
  return !!player && (!player.bomber && !player.twoSeater || role === 'pilot');
}
function toggleEmergencyLanding() {
  if (mode !== 'fly' || !player || player.dying || player.abandoned || !emergencyLandingCanopy()) return;
  if (player.emergencyLanding) {
    player.emergencyLanding = false;
    say('Emergency landing approach cancelled');
    return;
  }
  const altitude = player.g.position.y - heightAt(player.g.position.x, player.g.position.z);
  if (altitude > 72) {
    say('Descend below 72m before attempting an emergency landing');
    return;
  }
  player.emergencyLanding = true;
  say('Emergency landing approach · flare low and level; rough ground can still destroy the aircraft.');
}
function completeEmergencyLanding(p) {
  if (p !== player || !p.emergencyLanding || mode !== 'fly' || p.dying || p.wingFailure) return false;
  const x = p.g.position.x;
  const z = p.g.position.z;
  const terrain = heightAt(x, z);
  if (p.g.position.y - terrain > AIRCRAFT_WHEEL_BOTTOM + 0.42) return false;
  const slopeX = (heightAt(x + 7, z) - heightAt(x - 7, z)) / 14;
  const slopeZ = (heightAt(x, z + 7) - heightAt(x, z - 7)) / 14;
  const terrainSlope = Math.atan(Math.hypot(slopeX, slopeZ));
  const attitude = new THREE.Euler().setFromQuaternion(p.g.quaternion, 'YXZ');
  const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(p.g.quaternion);
  const sinkRate = Math.max(0, -forward.y * p.speed);
  const touchdownSafe = p.speed <= 26.5 && sinkRate <= 6.5 && Math.abs(attitude.x) <= 0.34 && Math.abs(attitude.z) <= 0.28 && terrainSlope <= 0.44;
  if (!touchdownSafe) return false;
  const heading = attitude.y;
  const pitch = Math.atan2(heightAt(x, z - 2) - heightAt(x, z + 2), 4);
  const roll = Math.atan2(heightAt(x + 2, z) - heightAt(x - 2, z), 4);
  p.g.position.y = planeGroundY(p, x, z);
  p.g.rotation.set(pitch, heading, roll);
  p.launchHeading = heading;
  p.speed = 0;
  p.emergencyLanding = false;
  p.emergencyLanded = true;
  p.fireCd = Math.max(0, p.fireCd || 0);
  input.fire = input.bomb = false;
  input.mx = input.my = 0;
  look.yaw = look.pitch = 0;
  mode = 'taxi';
  say('Emergency landing · aircraft intact. Search nearby wrecks or take off again; enemies can still damage you on the ground.');
  feed('EMERGENCY LANDING · AIRCRAFT INTACT', 'neutral');
  return true;
}
function landAndRefuel() {
  if (mode !== 'fly' || !player || player.dying || player.abandoned) return;
  const nearby = nearbyFriendlyRunway();
  if (!nearby) {
    say('Descend below 10m and approach a friendly runway to refuel');
    return;
  }
  const field = nearby.field;
  const heading = fieldRunwayHeading(field);
  const runwayPoint = runwayStartPoint(field, 50, nearby.lane || 0);
  player.runwayLane = nearby.lane || 0;
  player.g.position.set(runwayPoint.x, planeGroundY(player, runwayPoint.x, runwayPoint.z), runwayPoint.z);
  player.g.rotation.set(0, heading, 0);
  player.launchHeading = heading;
  player.homeField = field;
  playerField = field;
  void 0;
  player.speed = 0;
  player.fireCd = 0;
  player.ammo = player.ammoCapacity;
  player.ammoEmptyNotice = false;
  if (player.twoSeater) {
    player.bombs = player.bombCapacity;
    if (player.rearGunnerWounded) {
      player.rearGunnerWounded = false;
      player.gunnerTarget = null;
      player.gunnerTargetTimer = 0;
      player.rearGunnerFireTimer = 0;
      feed('Rear gunner replaced at base');
      syncBomberCrew(player);
    }
    for (const rack of player.twoSeatBombMeshes || []) {
      rack.bomb.visible = true;
      rack.rack.visible = true;
    }
  }
  input.fire = false;
  input.mx = input.my = 0;
  look.yaw = look.pitch = 0;
  preflightElapsed = 0;
  preflightRemaining = PREFLIGHT_DURATION;
  setupRunwayMarshal(field, player.runwayLane || 0);
  mode = 'preflight';
  startEngineAudio();
  say('Runway marshal signals you forward — takeoff in 3');
}
function exitAircraft() {
  if (mode === 'taxi' || mode === 'takeoff' && player?.speed < 30) leaveAircraft();else if (mode === 'takeoff' || mode === 'fly' || mode === 'shotdown') bailOut();
}
function updatePreflightPanel() {
  const overlay = $('preflight-overlay');
  const visible = mode === 'preflight';
  overlay.style.display = visible ? 'grid' : 'none';
  overlay.setAttribute('aria-hidden', String(!visible));
  if (!visible) return;
  $('preflight-countdown').textContent = String(Math.max(1, Math.ceil(preflightRemaining)));
  $('preflight-title').textContent = 'TAKE OFF IN';
  $('preflight-hint').textContent = 'Follow the runway marshal’s signal · E to leave aircraft';
}
function updateTargetDistance(best) {
  const readout = $('target-distance');
  const target = best?.[4];
  const active = best && target?.g?.visible && !target.dying && !['menu', 'over', 'shop', 'debrief'].includes(mode);
  if (!active) {
    readout.style.display = 'none';
    return;
  }
  const distance = Math.round(camera.position.distanceTo(best[0]));
  readout.textContent = `${distance} m`;
  readout.setAttribute('aria-label', `Target ${distance} metres away`);
  readout.style.display = 'block';
}
function updateLeadCue(best) {
  const leadCue = $('lead-cue');
  const target = best?.[3] ? best[4] : null;
  const firingView = mode === 'fly' && player && (!player.bomber || role === 'gun');
  if (!firingView || !target?.g?.visible || target.dying || !areHostilePilots(player, target)) {
    leadCue.style.display = 'none';
    return;
  }
  const distance = camera.position.distanceTo(target.g.position);
  const targetVelocity = new THREE.Vector3(0, 0, -1).applyQuaternion(target.g.quaternion).multiplyScalar(Math.max(0, target.speed || 0));
  const shooterVelocity = player.bomber && role === 'gun' ? new THREE.Vector3() : new THREE.Vector3(0, 0, -1).applyQuaternion(player.g.quaternion).multiplyScalar(Math.max(0, player.speed || 0));
  const origin = player.twoSeater || player.bomber && role === 'gun' ? camera.position.clone() : player.g.position.clone().add(new THREE.Vector3(0, 3, 0));
  const relativePosition = target.g.position.clone().sub(origin);
  const relativeVelocity = targetVelocity.sub(shooterVelocity);
  const projectileSpeed = 320;
  const a = relativeVelocity.lengthSq() - projectileSpeed * projectileSpeed;
  const b = 2 * relativePosition.dot(relativeVelocity);
  const c = relativePosition.lengthSq();
  const discriminant = b * b - 4 * a * c;
  let interceptTime = distance / projectileSpeed;
  if (discriminant >= 0 && Math.abs(a) > 0.001) {
    const root = Math.sqrt(discriminant);
    const valid = [(-b - root) / (2 * a), (-b + root) / (2 * a)].filter(time => Number.isFinite(time) && time > 0);
    if (valid.length) interceptTime = Math.min(...valid);
  }
  interceptTime = THREE.MathUtils.clamp(interceptTime, 0, 1.8);
  const leadPosition = target.g.position.clone().addScaledVector(targetVelocity, interceptTime).project(camera);
  const leadX = leadPosition.x * innerWidth * 0.5;
  const leadY = -leadPosition.y * innerHeight * 0.5;
  const leadPixels = Math.hypot(leadX, leadY);
  const leadVisible = leadPosition.z >= -1 && leadPosition.z <= 1 && Math.abs(leadPosition.x) <= 1 && Math.abs(leadPosition.y) <= 1 && leadPixels >= 12;
  leadCue.style.display = leadVisible ? 'block' : 'none';
  if (leadVisible) {
    leadCue.style.left = `${innerWidth * 0.5 + leadX}px`;
    leadCue.style.top = `${innerHeight * 0.5 + leadY}px`;
  }
}
function ui(dt) {
  if (!['shop', 'debrief', 'over'].includes(mode)) shopPreview.visible = false;
  msgT -= dt;
  if (msgT < 0) $('msg').textContent = '';
  walkingHands.visible = mode === 'foot' && !footThirdPerson;
  if (walkingAvatar) walkingAvatar.g.visible = mode === 'foot' && footThirdPerson;
  const instrumentFlight = !!(player && planes.includes(player) && ['fly', 'shotdown', 'shotdown2'].includes(mode));
  if (player?.flightInstrumentPack) {
    player.flightInstrumentPack.group.visible = instrumentFlight && cockpitPOV;
    if (instrumentFlight) {
      const cracked = player.dying || player.wingFailure || player.hits / Math.max(1, player.maxHits) >= 0.8;
      updateFlightInstrumentPack(player.flightInstrumentPack, player, cracked);
    }
  }
  updatePreflightPanel();
  syncPauseUI();
  updateBonanzaLeaderboard(dt);
  updateTeamLeaderboard(dt);
  $('cross').style.display = mode === 'fly' || mode === 'aa' ? 'block' : 'none';
  const runwayUiActive = mode === 'foot' && !!player && planes.includes(player) && !groundedAfterBailout;
  $('field-shop-btn').style.display = runwayUiActive ? 'block' : 'none';
  $('intel-btn').style.display = runwayUiActive ? 'block' : 'none';
  const playerStanding = stats[sel.name];
  const matchHudVisible = roundInProgress && !['menu', 'shop', 'debrief', 'over'].includes(mode);
  $('hud').style.display = matchHudVisible ? 'flex' : 'none';
  $('top').style.display = matchHudVisible ? 'block' : 'none';
  $('hudL').textContent = sel.gameMode === 'bonanza' && roundInProgress ? `$${activeEconomy().cash} · ${playerStanding?.points || 0} PTS · K ${playerStanding?.kills || 0} · A ${playerStanding?.assists || 0} · STREAK ${playerStanding?.streak || 0}` : `$${activeEconomy().cash}  Score ${score}  Streak ${streak}`;
  const flightHudVisible = !!player && (mode === 'fly' || mode === 'shotdown');
  $('hudR').style.display = flightHudVisible ? 'block' : 'none';
  if (flightHudVisible) {
    const hull = Math.max(0, player.maxHits - player.hits);
    const flightReadout = `Ammo ${player.ammo}/${player.ammoCapacity} · Hull ${hull}/${player.maxHits} · Alt ${Math.round(player.g.position.y)}m`;
    $('hudR').textContent = player.twoSeater ? `${flightReadout}\nBombs ${player.bombs}/${player.bombCapacity} · ${role === 'gun' ? 'REAR GUNNER' : 'PILOT'}` : flightReadout;
  } else $('hudR').textContent = '';
  const aceTracker = $('ace-tracker');
  const enemyAce = planes.find(p => p !== player && p.ace && areHostilePilots(p, player) && !p.dying && p.g.visible);
  const trackerActive = enemyAce && !['menu', 'over', 'shop', 'debrief'].includes(mode);
  aceTracker.style.display = trackerActive ? 'flex' : 'none';
  if (trackerActive) {
    const toAce = enemyAce.g.position.clone().sub(camera.position);
    const flatDistance = Math.hypot(toAce.x, toAce.z);
    const cameraForward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    const cameraBearing = Math.atan2(cameraForward.x, -cameraForward.z);
    const aceBearing = Math.atan2(toAce.x, -toAce.z);
    const relativeBearing = Math.atan2(Math.sin(aceBearing - cameraBearing), Math.cos(aceBearing - cameraBearing));
    $('ace-direction').style.transform = `rotate(${relativeBearing}rad)`;
    $('ace-range').textContent = `${Math.round(flatDistance)} m`;
    aceTracker.setAttribute('aria-label', `Enemy ace ${Math.round(flatDistance)} meters away, ${Math.round(relativeBearing * 180 / Math.PI)} degrees relative`);
  }
  const c = $('center');
  if (mode === 'preflight') setActions([['Exit aircraft · E', leaveAircraft]]);else if (mode === 'taxi') {
    const cache = player ? nearestRecoveryCache(player.g.position.x, player.g.position.z, 13) : null;
    const courierPickupInReach = player && courierNearPickup(player.g.position);
    const courierDeliveryInReach = player && courierNearDelivery(player.g.position, 'taxi');
    const taxiActions = [['Take Off · E', beginTakeoffRoll], ['Exit aircraft', leaveAircraft]];
    if (courierPickupInReach) taxiActions.unshift(['Pick up city dispatch · E', () => pickUpCourierDispatch(player.g.position)]);
    if (courierDeliveryInReach) taxiActions.unshift(['Deliver dispatch · E', () => deliverCourierDispatch(player.g.position, 'taxi')]);
    if (cache) taxiActions.unshift([cache.type === 'ufo' ? 'Investigate strange craft · E' : 'Search wreck cache · E', () => searchRecoveryCache(nearestRecoveryCache(player.g.position.x, player.g.position.z, 13))]);
    setActions(taxiActions);
  } else if (mode === 'takeoff') setActions([['Exit aircraft · Bail Out', exitAircraft]]);else if (mode === 'fly') {
    const pb = player.bomber || player.twoSeater;
    const pilotForwardGuns = player.twoSeater && role === 'pilot';
    const seatWeapon = player.twoSeater && role === 'gun' || player.bomber && role === 'gun';
    const primaryLabel = pilotForwardGuns || seatWeapon || !pb ? 'FIRE' : 'BOMB';
    const acts = [[primaryLabel, () => {
      if (primaryLabel === 'FIRE') input.fire = true;else input.bomb = true;
    }, () => {
      if (primaryLabel === 'FIRE') input.fire = false;else input.bomb = false;
    }], ['Bail Out', bailOut]];
    if (matchMedia('(pointer: coarse)').matches) acts.splice(1, 0, ['RECENTER', recenterView]);
    if (pilotForwardGuns) acts.splice(1, 0, ['BOMB', () => input.bomb = true, () => input.bomb = false]);
    if (!pb || role === 'pilot') {
      acts.splice(1, 0, [cockpitPOV ? 'POV · Cockpit' : 'POV · 3rd Person', () => {
        cockpitPOV = !cockpitPOV;
        look.yaw = look.pitch = 0;
      }]);
    }
    if (pb) acts.unshift([`Seat: ${{
      pilot: 'Pilot',
      bomb: 'Bombardier',
      gun: 'Gunner'
    }[role]}${player.twoSeater && player.rearGunnerWounded ? ' · GUNNER HIT' : ''}`, switchBomberSeat]);
    if (!pb || role === 'pilot') {
      acts.push([player.emergencyLanding ? 'CANCEL LANDING' : 'EMERGENCY LAND', toggleEmergencyLanding]);
    }
    if (nearbyFriendlyRunway()) acts.unshift(['Land and refuel', landAndRefuel]);
    setActions(acts);
  } else if (mode === 'shotdown') setActions([['Bail Out · E', bailOut], ['Ride it down', () => mode = 'ridedown']]);else if (mode === 'aa') setActions([['FIRE AA', () => input.fire = true, () => input.fire = false], ['Exit AA gun · E', leaveFlak]]);else if (mode === 'chute' || mode === 'dead') setActions([['Respawn · E', showSpawnMenu]]);else if (mode !== 'foot') setActions([]);
  if (mode === 'ridedown') mode = 'shotdown2';
  if (mode === 'shotdown2') {
    if (planes.includes(player)) {
      flyPlane(player, dt, 0, 0);
      if (planes.includes(player)) chaseCam();
    }
  }
  if (mode === 'foot') {
    const shopApproach = fieldShopApproach(playerField);
    const ds = Math.hypot(foot.pos.x - shopApproach.x, foot.pos.z - shopApproach.z);
    const site = debriefSites.find(s => Math.hypot(foot.pos.x - s.x, foot.pos.z - s.z) < 70);
    const atDebrief = site && Math.hypot(foot.pos.x - site.x, foot.pos.z - site.z) < 9;
    const sectorHint = sel.gameMode === 'squadron' && player?.emergencyLanded ? sectorCapture.id >= 0 ? `<br><b>FLAG CAPTURE · SECTOR ${sectorControl[sectorCapture.id].column + 1}-${sectorControl[sectorCapture.id].row + 1}</b> · ${sectorCapture.status || 'HOLD POSITION'} · ${Math.max(0, (sectorCapture.duration || SECTOR_FLAG_RAISE_SECONDS) - sectorCapture.elapsed).toFixed(1)}s` : sectorCapture.status ? `<br><b>${sectorCapture.status}</b>` : '' : '';
    const footPrompt = atDebrief ? '<b>FIELD DEBRIEFING</b> · Career record &amp; earned badges' : groundedAfterBailout ? 'You are safely down — explore the field, visit the <b>DEBRIEF</b> or man an <b>AA GUN</b>' : ds < 9 ? '<b>SHOP</b> — Aircraft &amp; upgrades are permanent · Flight bonuses last one sortie · Repaint $500' : ds < 70 ? 'The <b>SHOP</b> is the shack under the yellow flag · <b>DEBRIEF</b> building nearby' : '';
    c.innerHTML = `${footPrompt}${sectorHint}`;
    c.style.textShadow = '0 2px 4px #000';
  } else c.textContent = '';
  const mm = Math.max(0, Math.floor(roundT / 60));
  const ss = String(Math.max(0, Math.floor(roundT % 60))).padStart(2, '0');
  const compactFlightTop = matchMedia('(max-width: 600px)').matches;
  $('top').innerHTML = mode === 'menu' || mode === 'over' ? '' : compactFlightTop ? `⏱ ${mm}:${ss}` : sel.gameMode === 'bonanza' ? `⏱ ${mm}:${ss} &nbsp; <span style="color:#f0d080">BONANZA · ${playerStanding?.points || 0} PTS</span>` : `⏱ ${mm}:${ss} &nbsp; <span style="color:#9fbaff">BLUE ${tickets.blue}</span> vs <span style="color:#ff9a8a">${tickets.red} RED</span>`;
  const compass = $('compass');
  const compassVisible = !['menu', 'over', 'shop', 'debrief'].includes(mode);
  compass.style.display = compassVisible ? 'flex' : 'none';
  if (compassVisible) {
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    const bearing = (Math.atan2(forward.x, -forward.z) * 180 / Math.PI + 360) % 360;
    const cardinals = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    $('compass-readout').textContent = `${cardinals[Math.round(bearing / 45) % 8]} · ${String(Math.round(bearing)).padStart(3, '0')}°`;
    $('compass-ring').style.transform = `rotate(${-bearing}deg)`;
  }
  const al = $('aimname');
  let best = null;
  let bd = 0.04;
  if (mode !== 'menu' && mode !== 'over' && mode !== 'shop' && mode !== 'debrief') {
    const fw = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    const cands = planes.filter(p => p !== player).map(p => [p.g.position, p.name, p.team, true, p]);
    for (const w of walkers) if (!w.dead) cands.push([w.g.position.clone().setY(w.g.position.y + 1), w.name, w.team, false, w]);
    for (const [pos, n, team, isPlane, target] of cands) {
      const d = pos.clone().sub(camera.position);
      const dist = d.length();
      if (dist > 700 || dist < 1) continue;
      const ang = fw.angleTo(d);
      if (ang < bd) {
        bd = ang;
        best = [pos, n, team, isPlane, target];
      }
    }
  }
  if (best) {
    const s = best[0].clone().add(new THREE.Vector3(0, 2.5, 0)).project(camera);
    al.style.left = (s.x + 1) / 2 * innerWidth + 'px';
    al.style.top = (1 - s.y) / 2 * innerHeight + 'px';
    if (al._target !== best[4]) {
      al.replaceChildren();
      if (best[3]) {
        const insignia = document.createElement('span');
        insignia.className = `aim-insignia ${best[2] === 'red' ? 'red' : 'blue'}`;
        insignia.setAttribute('aria-hidden', 'true');
        al.appendChild(insignia);
      }
      const name = document.createElement('span');
      al.appendChild(name);
      al._nameSpan = name;
      al._target = best[4];
    }
    al._nameSpan.textContent = best[1] || 'Unknown';
    al.style.display = 'flex';
  } else al.style.display = 'none';
  updateTargetDistance(best);
  updateLeadCue(best);
}
const lookQ = new THREE.Quaternion();
const lookE = new THREE.Euler();
const rearBaseQ = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI);
const bombViewBaseQ = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 2);
const rearLookQ = new THREE.Quaternion();
const rearLookE = new THREE.Euler();
const rearGunnerOffset = new THREE.Vector3();
function chaseCam() {
  lookQ.setFromEuler(lookE.set(look.pitch, look.yaw, 0, 'YXZ'));
  if (player?.twoSeater) {
    const rearGunnerView = mode === 'fly' && role === 'gun';
    if (player.rearOpening) player.rearOpening.visible = !rearGunnerView;
    if (player.rearGunRing) player.rearGunRing.visible = !rearGunnerView;
  }
  cockpitJoystick.visible = !!(cockpitPOV && mode === 'fly' && player && !player.bomber);
  cockpitJoystick.rotation.set(-input.my * 0.28, 0, -input.mx * 0.34);
  if (player.bomber && mode === 'fly' && role === 'bomb') {
    camera.position.copy(player.g.position).add(new THREE.Vector3(0, -2.5, -1).applyQuaternion(player.g.quaternion));
    camera.quaternion.copy(player.g.quaternion).multiply(bombViewBaseQ).multiply(lookQ);
    return;
  }
  if (player.bomber && mode === 'fly' && role === 'gun') {
    camera.position.copy(player.g.position).add(new THREE.Vector3(0, 3.5, 1).applyQuaternion(player.g.quaternion));
    camera.quaternion.copy(player.g.quaternion).multiply(lookQ);
    return;
  }
  if (player.twoSeater && mode === 'fly' && role === 'gun') {
    rearLookQ.setFromEuler(rearLookE.set(look.pitch, look.yaw, 0, 'YXZ'));
    camera.position.copy(player.g.position).add(rearGunnerOffset.set(0, 1.15, 1.42).applyQuaternion(player.g.quaternion));
    camera.quaternion.copy(player.g.quaternion).multiply(rearBaseQ).multiply(rearLookQ);
    if (player.rearGunMount) player.rearGunMount.rotation.set(-look.pitch, look.yaw, 0, 'YXZ');
    return;
  }
  const q = player.g.quaternion.clone().multiply(lookQ);
  if (cockpitPOV && mode === 'fly') {
    camera.position.copy(player.g.position).add(new THREE.Vector3(0, 1.05, -0.38).applyQuaternion(player.g.quaternion));
    camera.quaternion.copy(q);
    return;
  }
  camera.position.copy(player.g.position).add(new THREE.Vector3(0, 2.5, 11).applyQuaternion(q));
  camera.quaternion.copy(q);
}
function bailOut() {
  if (!player || !planes.includes(player) || player.abandoned) return;
  if (streak > 0) {
    streak = 0;
    revokeRibbons(player);
  }
  player.abandoned = true;
  if (player.twoSeater) {
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(player.g.quaternion);
    const up = new THREE.Vector3(0, 2, 0);
    const playerAppearance = sel.pilotGender === 'female' ? {
      gender: 'female',
      hairStyle: 'braid',
      hairColor: sel.team === 'blue' ? 0x593627 : 0x39251f
    } : {
      gender: 'male',
      mustache: false
    };
    playerChute = spawnChute(player.g.position, {
      team: player.team,
      bot: false,
      name: sel.name,
      pilotAppearance: playerAppearance
    }, up.clone().addScaledVector(right, -2));
    const otherCrew = player.bomberCrew?.find(crew => crew.role !== role);
    if (otherCrew) {
      const crewName = `${sel.name} · ${otherCrew.role === 'gun' ? 'observer' : 'pilot'}`;
      spawnChute(player.g.position, {
        team: player.team,
        bot: true,
        name: crewName,
        pilotAppearance: otherCrew.appearance
      }, up.clone().addScaledVector(right, 2));
    }
  } else playerChute = spawnChute(player.g.position);
  groundedAfterBailout = false;
  mountedFlak = null;
  mode = 'chute';
  say(player.twoSeater ? 'Both crew members bailed out — stay with your parachute' : 'Parachute deployed');
  player.isPlayer = true;
  const hf = new THREE.Vector3(0, 0, -1).applyQuaternion(player.g.quaternion);
  foot.yaw = Math.atan2(-hf.x, -hf.z);
  playerChute.m.rotation.y = foot.yaw;
  foot.pitch = -0.4;
  stopEngineAudio();
}

// Mute button (top-left, below HUD)
const muteBtn = document.createElement('button');
muteBtn.textContent = '🔊';
muteBtn.style.cssText = 'position:absolute;top:10vh;left:4vw';
muteBtn.onclick = () => {
  muted = !muted;
  muteBtn.textContent = muted ? '🔇' : '🔊';
  if (muted) {
    stopFieldGramophones();
    stopEngineAudio();
    stopTruckAudio();
  } else if (mode === 'truck') startTruckAudio();else if (['taxi', 'takeoff', 'fly', 'shotdown', 'shotdown2'].includes(mode)) startEngineAudio();
  if (!muted) updateFieldGramophone(0.016);
};
$('ui').appendChild(muteBtn);
$('field-shop-btn').addEventListener('click', () => showShop());
$('intel-btn').addEventListener('click', showIntel);
$('intel-close').addEventListener('click', closeIntel);

// ---------- Loop ----------
buildTitleBomberFormation();
buildMap();
camera.position.set(0, 200, 500);
showMenu();
const timer = new THREE.Timer();
let lastReducedFrameAt = 0;
renderer.setAnimationLoop(t => {
  if (save.reducedGraphics && t - lastReducedFrameAt < 1000 / 40) return;
  lastReducedFrameAt = t;
  timer.update(t);
  const dt = Math.min(timer.getDelta(), 0.05);
  if (!paused) {
    if (shopPreview.visible) shopPreview.rotation.y += dt * 0.5;
    if (menuPilotPreview.visible && menuPilotModel) menuPilotModel.rotation.y += dt * 0.52;
    if (!['menu', 'over', 'shop', 'debrief'].includes(mode)) animateFieldFlags(t * 0.003);
    if (mode === 'menu') {
      const a = t * 0.00003;
      camera.position.set(Math.cos(a) * 300, 520, Math.sin(a) * 300);
      camera.lookAt(0, 0, 0);
      animateTitleBombers(dt, t);
      for (const l of flashes) {
        if (l.intensity > 0) l.intensity *= 0.85;
        if (Math.random() < 0.01) {
          l.position.set((Math.random() - 0.5) * 900, 15, (Math.random() - 0.5) * 900);
          l.intensity = 9000;
        }
      }
    } else if (mode !== 'over') step(dt);
    updateAirfieldRebuilds(dt);
    updateCourierMission();
    updateLiveWarMap(dt);
    updateWeather(dt, {
      enabled: save.weatherEnabled && localWeatherAvailable(),
      active: roundInProgress && mode !== 'menu' && mode !== 'over',
      map: sel.map
    });
  }
  if (!paused) void 0;
  updateWelcomeAudio();
  positionSelectionPilotPreview();
  renderer.render(scene, camera);
});